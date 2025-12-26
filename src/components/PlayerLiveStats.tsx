import type { Player, PlayerMatchStats, StatKey } from '../types';
import { STAT_CONFIG } from '../types';

interface PlayerLiveStatsProps {
  players: Player[];
  playerStats: PlayerMatchStats[];
}

export function PlayerLiveStats({ players, playerStats }: PlayerLiveStatsProps) {
  const getPlayerStats = (playerId: string): PlayerMatchStats | undefined => {
    return playerStats.find((ps) => ps.playerId === playerId);
  };

  const calculatePassAccuracy = (stats: PlayerMatchStats['stats']): number => {
    const total = stats.passesCompleted + stats.passesMissed;
    if (total === 0) return 0;
    return Math.round((stats.passesCompleted / total) * 100);
  };

  const calculateShotAccuracy = (stats: PlayerMatchStats['stats']): number => {
    const total = stats.shotsOnTarget + stats.shotsOffTarget;
    if (total === 0) return 0;
    return Math.round((stats.shotsOnTarget / total) * 100);
  };

  const getStatColor = (stat: StatKey, value: number): string => {
    if (value === 0) return 'text-slate-500';
    
    switch (stat) {
      case 'goals':
        return 'text-emerald-400';
      case 'assists':
        return 'text-blue-400';
      case 'saves':
        return 'text-yellow-400';
      case 'tackles':
      case 'interceptions':
        return 'text-cyan-400';
      case 'dribbles':
        return 'text-purple-400';
      case 'fouls':
      case 'goalsConceded':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const keyStats: StatKey[] = ['goals', 'assists', 'tackles', 'interceptions', 'dribbles', 'saves'];

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4 text-center border-b border-slate-700 pb-2">
        Player Stats
      </h3>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {players.map((player) => {
          const stats = getPlayerStats(player.id);
          if (!stats) return null;

          const passAccuracy = calculatePassAccuracy(stats.stats);
          const shotAccuracy = calculateShotAccuracy(stats.stats);
          const hasActivity = Object.values(stats.stats).some((val) => val > 0);

          return (
            <div
              key={player.id}
              className={`bg-slate-700 rounded-lg p-3 border-2 transition-all ${
                hasActivity ? 'border-slate-600 hover:border-emerald-500/50' : 'border-slate-800'
              }`}
            >
              {/* Player Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-white">{player.name}</div>
                  {stats.isGoalkeeper && (
                    <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                      GK
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  {Object.values(stats.stats).reduce((sum, val) => sum + val, 0)} total
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {keyStats.map((stat) => {
                  const value = stats.stats[stat];
                  if (value === 0 && stat !== 'goals' && stat !== 'assists') return null;
                  
                  const config = STAT_CONFIG[stat];
                  return (
                    <div
                      key={stat}
                      className={`text-center p-2 rounded bg-slate-800/50 ${
                        value > 0 ? 'ring-1 ring-slate-600' : ''
                      }`}
                    >
                      <div className={`text-lg font-bold ${getStatColor(stat, value)}`}>
                        {value}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{config.shortLabel}</div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Shots */}
                {(stats.stats.shotsOnTarget > 0 || stats.stats.shotsOffTarget > 0) && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Shots</span>
                    <span className="text-white font-semibold">
                      {stats.stats.shotsOnTarget}/{stats.stats.shotsOnTarget + stats.stats.shotsOffTarget}
                      {shotAccuracy > 0 && (
                        <span className="text-orange-400 ml-1">({shotAccuracy}%)</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Passes */}
                {(stats.stats.passesCompleted > 0 || stats.stats.passesMissed > 0) && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Passes</span>
                    <span className="text-white font-semibold">
                      {stats.stats.passesCompleted}/{stats.stats.passesCompleted + stats.stats.passesMissed}
                      {passAccuracy > 0 && (
                        <span className="text-cyan-400 ml-1">({passAccuracy}%)</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Fouls */}
                {stats.stats.fouls > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Fouls</span>
                    <span className="text-red-400 font-semibold">{stats.stats.fouls}</span>
                  </div>
                )}

                {/* Goals Conceded (GK only) */}
                {stats.isGoalkeeper && stats.stats.goalsConceded > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Conceded</span>
                    <span className="text-red-400 font-semibold">{stats.stats.goalsConceded}</span>
                  </div>
                )}
              </div>

              {/* Performance Indicator */}
              {hasActivity && (
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Performance</span>
                    <div className="flex gap-1">
                      {stats.stats.goals > 0 && (
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                          ⚽ {stats.stats.goals}G
                        </span>
                      )}
                      {stats.stats.assists > 0 && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                          🎯 {stats.stats.assists}A
                        </span>
                      )}
                      {stats.stats.tackles > 0 && (
                        <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
                          🛡️ {stats.stats.tackles}T
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

