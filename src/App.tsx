import { useState, useCallback, useEffect, useRef } from 'react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { PlayerCard } from './components/PlayerCard';
import { ActionButtons } from './components/ActionButtons';
import { MatchHeader } from './components/MatchHeader';
import { LiveStats } from './components/LiveStats';
import { PlayerLiveStats } from './components/PlayerLiveStats';
import { MatchList } from './components/MatchList';
import { NewMatchModal } from './components/NewMatchModal';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { MVPSelector } from './components/MVPSelector';
import type { Player, Match, StatKey, MatchEvent, MatchRating, MVPRecord } from './types';
import { DEFAULT_PLAYERS, EMPTY_STATS } from './types';
import * as dataService from './services/dataService';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [matchRatings, setMatchRatings] = useState<MatchRating[]>([]);
  const [mvpRecords, setMvpRecords] = useState<MVPRecord[]>([]);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedProfilePlayerId, setSelectedProfilePlayerId] = useState<string | null>(null);
  const [showNewMatchModal, setShowNewMatchModal] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer for match updates
  const matchUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMatchUpdate = useRef<Match | null>(null);

  // Load initial data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize players (creates defaults if none exist)
        const loadedPlayers = await dataService.initializeDefaultPlayers(DEFAULT_PLAYERS);
        setPlayers(loadedPlayers);

        // Load matches with player IDs for proper stats initialization
        const playerIds = loadedPlayers.map(p => p.id);
        const [loadedMatches, loadedRatings, loadedMvps] = await Promise.all([
          dataService.getMatches(playerIds),
          dataService.getMatchRatings(),
          dataService.getMvpRecords(),
        ]);

        setMatches(loadedMatches);
        setMatchRatings(loadedRatings);
        setMvpRecords(loadedMvps);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please check your connection and refresh.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Get current match
  const currentMatch = matches.find((m) => m.id === currentMatchId) || null;

  // Debounced match update to Supabase
  const debouncedMatchUpdate = useCallback((match: Match) => {
    pendingMatchUpdate.current = match;

    if (matchUpdateTimer.current) {
      clearTimeout(matchUpdateTimer.current);
    }

    matchUpdateTimer.current = setTimeout(async () => {
      if (pendingMatchUpdate.current) {
        try {
          await dataService.updateMatch(pendingMatchUpdate.current);
        } catch (err) {
          console.error('Failed to update match:', err);
        }
        pendingMatchUpdate.current = null;
      }
    }, 500); // 500ms debounce
  }, []);

  // Create a new match
  const handleCreateMatch = useCallback(
    async (
      opponent: string,
      date: string,
      time: string,
      fieldName: string,
      fieldImage: string | null,
      opponentScore: number | null,
      netMatchTime: number | null
    ) => {
      const newMatch: Match = {
        id: crypto.randomUUID(),
        date,
        time,
        opponent,
        opponentScore,
        fieldName,
        fieldImage,
        netMatchTime,
        playerStats: players.map((p) => ({
          playerId: p.id,
          stats: { ...EMPTY_STATS },
          isGoalkeeper: false,
        })),
        events: [],
        currentGoalkeeperId: null,
      };

      try {
        const created = await dataService.createMatch(newMatch);
        setMatches((prev) => [...prev, created]);
        setCurrentMatchId(created.id);
        setSelectedPlayerId(null);
      } catch (err) {
        console.error('Failed to create match:', err);
        setError('Failed to create match. Please try again.');
      }
    },
    [players]
  );

  // Delete a match
  const handleDeleteMatch = useCallback(
    async (matchId: string) => {
      try {
        await dataService.deleteMatch(matchId);
        setMatches((prev) => prev.filter((m) => m.id !== matchId));
        if (currentMatchId === matchId) {
          setCurrentMatchId(null);
        }
      } catch (err) {
        console.error('Failed to delete match:', err);
        setError('Failed to delete match. Please try again.');
      }
    },
    [currentMatchId]
  );

  // Record a stat
  const handleRecordStat = useCallback(
    (stat: StatKey) => {
      if (!currentMatch || !selectedPlayerId) return;

      const event: MatchEvent = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        playerId: selectedPlayerId,
        stat,
        value: 1,
      };

      setMatches((prev) =>
        prev.map((match) => {
          if (match.id !== currentMatchId) return match;

          const updatedMatch = {
            ...match,
            events: [...match.events, event],
            playerStats: match.playerStats.map((ps) => {
              if (ps.playerId !== selectedPlayerId) return ps;
              return {
                ...ps,
                stats: {
                  ...ps.stats,
                  [stat]: ps.stats[stat] + 1,
                },
              };
            }),
          };

          // Debounced update to Supabase
          debouncedMatchUpdate(updatedMatch);

          return updatedMatch;
        })
      );

      // Show feedback
      const player = players.find((p) => p.id === selectedPlayerId);
      setLastAction(`${player?.name}: +1 ${stat}`);
      setTimeout(() => setLastAction(null), 1500);
    },
    [currentMatch, currentMatchId, selectedPlayerId, players, debouncedMatchUpdate]
  );

  // Undo last action
  const handleUndo = useCallback(() => {
    if (!currentMatch || currentMatch.events.length === 0) return;

    const lastEvent = currentMatch.events[currentMatch.events.length - 1];

    setMatches((prev) =>
      prev.map((match) => {
        if (match.id !== currentMatchId) return match;

        const updatedMatch = {
          ...match,
          events: match.events.slice(0, -1),
          playerStats: match.playerStats.map((ps) => {
            if (ps.playerId !== lastEvent.playerId) return ps;
            return {
              ...ps,
              stats: {
                ...ps.stats,
                [lastEvent.stat]: Math.max(0, ps.stats[lastEvent.stat] - 1),
              },
            };
          }),
        };

        // Debounced update to Supabase
        debouncedMatchUpdate(updatedMatch);

        return updatedMatch;
      })
    );

    const player = players.find((p) => p.id === lastEvent.playerId);
    setLastAction(`UNDO: ${player?.name} -1 ${lastEvent.stat}`);
    setTimeout(() => setLastAction(null), 1500);
  }, [currentMatch, currentMatchId, players, debouncedMatchUpdate]);

  // Toggle goalkeeper
  const handleToggleGoalkeeper = useCallback(
    (playerId?: string) => {
      const targetPlayerId = playerId || selectedPlayerId;
      if (!currentMatch || !targetPlayerId) return;

      setMatches((prev) =>
        prev.map((match) => {
          if (match.id !== currentMatchId) return match;

          const isCurrentGk = match.currentGoalkeeperId === targetPlayerId;

          const updatedMatch = {
            ...match,
            currentGoalkeeperId: isCurrentGk ? null : targetPlayerId,
            playerStats: match.playerStats.map((ps) => ({
              ...ps,
              isGoalkeeper: ps.playerId === targetPlayerId ? !isCurrentGk : false,
            })),
          };

          // Debounced update to Supabase
          debouncedMatchUpdate(updatedMatch);

          return updatedMatch;
        })
      );
    },
    [currentMatch, currentMatchId, selectedPlayerId, debouncedMatchUpdate]
  );

  // Get selected player's stats
  const selectedPlayerStats = currentMatch?.playerStats.find(
    (ps) => ps.playerId === selectedPlayerId
  );

  const isSelectedPlayerGk = selectedPlayerStats?.isGoalkeeper || false;

  // Profile handlers
  const handleOpenProfile = useCallback((playerId: string) => {
    setSelectedProfilePlayerId(playerId);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setSelectedProfilePlayerId(null);
  }, []);

  const handleUpdatePlayer = useCallback(
    async (updatedPlayer: Player) => {
      try {
        await dataService.updatePlayer(updatedPlayer);
        setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
      } catch (err) {
        console.error('Failed to update player:', err);
        setError('Failed to update player. Please try again.');
      }
    },
    []
  );

  const handleSaveMatchRating = useCallback(
    async (rating: MatchRating) => {
      try {
        await dataService.saveMatchRating(rating);
        setMatchRatings((prev) => {
          const existing = prev.find(
            (r) => r.matchId === rating.matchId && r.playerId === rating.playerId
          );
          if (existing) {
            return prev.map((r) =>
              r.matchId === rating.matchId && r.playerId === rating.playerId ? rating : r
            );
          }
          return [...prev, rating];
        });
      } catch (err) {
        console.error('Failed to save rating:', err);
        setError('Failed to save rating. Please try again.');
      }
    },
    []
  );

  const handleDeleteMatchRating = useCallback(
    async (matchId: string, playerId: string) => {
      try {
        await dataService.deleteMatchRating(matchId, playerId);
        setMatchRatings((prev) =>
          prev.filter((r) => !(r.matchId === matchId && r.playerId === playerId))
        );
      } catch (err) {
        console.error('Failed to delete rating:', err);
        setError('Failed to delete rating. Please try again.');
      }
    },
    []
  );

  const handleSelectMVP = useCallback(
    async (matchId: string, playerId: string) => {
      const match = matches.find((m) => m.id === matchId);
      if (!match) return;

      // Get player's rating for this match if available
      const playerRating = matchRatings.find(
        (r) => r.matchId === matchId && r.playerId === playerId
      );

      const newMVP: MVPRecord = {
        matchId,
        playerId,
        date: match.date,
        opponent: match.opponent,
        rating: playerRating?.rating || 0,
      };

      try {
        await dataService.saveMvpRecord(newMVP);
        setMvpRecords((prev) => {
          // Remove existing MVP for this match if any
          const filtered = prev.filter((mvp) => mvp.matchId !== matchId);
          return [...filtered, newMVP];
        });
      } catch (err) {
        console.error('Failed to save MVP:', err);
        setError('Failed to save MVP. Please try again.');
      }
    },
    [matches, matchRatings]
  );

  const handleRemoveMVP = useCallback(
    async (matchId: string) => {
      try {
        await dataService.deleteMvpRecord(matchId);
        setMvpRecords((prev) => prev.filter((mvp) => mvp.matchId !== matchId));
      } catch (err) {
        console.error('Failed to remove MVP:', err);
        setError('Failed to remove MVP. Please try again.');
      }
    },
    []
  );

  const selectedProfilePlayer = players.find((p) => p.id === selectedProfilePlayerId);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onStatRecord: handleRecordStat,
    onUndo: handleUndo,
    onToggleGoalkeeper: () => handleToggleGoalkeeper(),
    enabled: !!currentMatch && !!selectedPlayerId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading Bongo Stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-200 hover:text-white"
            >
              &times;
            </button>
          </div>
        )}

        {/* Header */}
        <header className="text-center py-6">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-400">BONGO STATS</h1>
          <p className="text-slate-400 mt-2">Football Match Tracker</p>
        </header>

        {/* Match List - Now the primary focus */}
        <MatchList
          matches={matches}
          currentMatchId={currentMatchId}
          onSelectMatch={setCurrentMatchId}
          onNewMatch={() => setShowNewMatchModal(true)}
          onDeleteMatch={handleDeleteMatch}
        />

        {/* Active Match UI */}
        {currentMatch ? (
          <>
            {/* Match Header */}
            <MatchHeader match={currentMatch} playerStats={currentMatch.playerStats} />

            {/* Main tracking area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Players and Actions - 2 cols */}
              <div className="lg:col-span-2 space-y-4">
                {/* Player Cards */}
                <div className="grid grid-cols-5 gap-3">
                  {players.map((player) => {
                    const playerStats = currentMatch.playerStats.find(
                      (ps) => ps.playerId === player.id
                    );
                    return (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        stats={playerStats?.stats || EMPTY_STATS}
                        isSelected={selectedPlayerId === player.id}
                        isGoalkeeper={playerStats?.isGoalkeeper || false}
                        onClick={() => setSelectedPlayerId(player.id)}
                        onToggleGoalkeeper={() => handleToggleGoalkeeper(player.id)}
                        onProfileClick={() => handleOpenProfile(player.id)}
                      />
                    );
                  })}
                </div>

                {/* Instructions or Selected Player */}
                {!selectedPlayerId ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-800 rounded-lg">
                    <p className="text-xl">Click a player to select, then record stats</p>
                    <p className="text-sm mt-2">Or use keyboard shortcuts after selecting</p>
                  </div>
                ) : (
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-center mb-4">
                      <span className="text-lg">Recording stats for: </span>
                      <span className="text-xl font-bold text-emerald-400">
                        {players.find((p) => p.id === selectedPlayerId)?.name}
                      </span>
                      {isSelectedPlayerGk && (
                        <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                          GK
                        </span>
                      )}
                    </div>

                    <ActionButtons
                      onStatClick={handleRecordStat}
                      onUndo={handleUndo}
                      isGoalkeeper={isSelectedPlayerGk}
                      disabled={false}
                    />
                  </div>
                )}

                {/* Last Action Feedback */}
                {lastAction && (
                  <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
                    {lastAction}
                  </div>
                )}
              </div>

              {/* Live Stats Sidebar - 2 cols */}
              <div className="lg:col-span-2 space-y-4">
                {/* Player Individual Stats */}
                <PlayerLiveStats
                  players={players}
                  playerStats={currentMatch.playerStats}
                />

                {/* Team Aggregate Stats */}
                <LiveStats playerStats={currentMatch.playerStats} />

                {/* MVP Selector */}
                <MVPSelector
                  players={players}
                  match={currentMatch}
                  currentMVP={mvpRecords.find((mvp) => mvp.matchId === currentMatch.id) || null}
                  onSelectMVP={(playerId) => handleSelectMVP(currentMatch.id, playerId)}
                  onRemoveMVP={() => handleRemoveMVP(currentMatch.id)}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-slate-800 rounded-lg">
            <p className="text-xl text-slate-400">
              Select a match or create a new one to start tracking
            </p>
          </div>
        )}

        {/* Keyboard shortcuts help */}
        {currentMatch && selectedPlayerId && (
          <div className="bg-slate-800 rounded-lg p-4 text-sm text-slate-400">
            <span className="font-bold text-white">Keyboard Shortcuts: </span>
            G=Goal, A=Assist, S=Shot, X=Miss, P=Pass, M=MissPass, I=Intercept, T=Tackle, F=Foul, D=Dribble
            {isSelectedPlayerGk && ', V=Save, C=Concede'}
            {' | '}K=Toggle GK, Ctrl+Z=Undo
          </div>
        )}
      </div>

      {/* New Match Modal */}
      <NewMatchModal
        isOpen={showNewMatchModal}
        onClose={() => setShowNewMatchModal(false)}
        onCreateMatch={handleCreateMatch}
      />

      {/* Player Profile Modal */}
      {selectedProfilePlayer && (
        <PlayerProfileModal
          player={selectedProfilePlayer}
          matches={matches}
          matchRatings={matchRatings}
          mvpRecords={mvpRecords}
          isOpen={!!selectedProfilePlayerId}
          onClose={handleCloseProfile}
          onUpdatePlayer={handleUpdatePlayer}
          onSaveMatchRating={handleSaveMatchRating}
          onDeleteMatchRating={handleDeleteMatchRating}
        />
      )}
    </div>
  );
}

export default App;
