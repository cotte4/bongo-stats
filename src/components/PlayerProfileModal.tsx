import { useState } from 'react';
import type { Player, Match, MatchRating, MVPRecord } from '../types';
import { FIFAStatCard } from './FIFAStatCard';
import { MVPRecords } from './MVPRecords';
import { MatchRatingEditor } from './MatchRatingEditor';
import { PlayerProfileEditor } from './PlayerProfileEditor';
import {
  calculateCareerTotals,
  getRecentMatches,
  calculateAverageRating,
  getMVPMatches,
  getMatchRating,
  formatBirthday,
  getPreferredFootLabel,
  getMatchesPlayed,
} from '../utils/playerUtils';
import { getDefaultFieldImage } from '../utils/imageUtils';

interface PlayerProfileModalProps {
  player: Player;
  matches: Match[];
  matchRatings: MatchRating[];
  mvpRecords: MVPRecord[];
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlayer: (updatedPlayer: Player) => void;
  onSaveMatchRating: (rating: MatchRating) => void;
  onDeleteMatchRating: (matchId: string, playerId: string) => void;
}

export function PlayerProfileModal({
  player,
  matches,
  matchRatings,
  mvpRecords,
  isOpen,
  onClose,
  onUpdatePlayer,
  onSaveMatchRating,
  onDeleteMatchRating,
}: PlayerProfileModalProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [showRatingEditor, setShowRatingEditor] = useState(false);
  const [editingRating, setEditingRating] = useState<MatchRating | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'ratings' | 'mvp'>('overview');

  if (!isOpen) return null;

  const careerTotals = calculateCareerTotals(player.id, matches);
  const recentMatches = getRecentMatches(player.id, matches, 5);
  const averageRating = calculateAverageRating(player.id, matchRatings);
  const mvpMatches = getMVPMatches(player.id, mvpRecords);
  const matchesPlayed = getMatchesPlayed(player.id, matches);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSaveRating = (rating: MatchRating) => {
    onSaveMatchRating({ ...rating, playerId: player.id });
    setShowRatingEditor(false);
    setEditingRating(null);
  };

  const handleEditRating = (matchId: string) => {
    const rating = getMatchRating(player.id, matchId, matchRatings);
    if (rating) {
      setEditingRating(rating);
      setShowRatingEditor(true);
    } else {
      setEditingRating(null);
      setShowRatingEditor(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors"
            >
              ×
            </button>

            <div className="flex items-start gap-6">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={player.profileImage || getDefaultFieldImage()}
                  alt={player.name}
                  className="w-24 h-24 rounded-full border-4 border-emerald-500 object-cover"
                />
              </div>

              {/* Player Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{player.name}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Birthday: </span>
                    <span className="text-white">{formatBirthday(player.birthday)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Preferred Foot: </span>
                    <span className="text-white">{getPreferredFootLabel(player.preferredFoot)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">BONGS: </span>
                    <span className="text-emerald-400 font-bold text-lg">{player.bongs}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Matches Played: </span>
                    <span className="text-white font-semibold">{matchesPlayed}</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setShowEditor(true)}
                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-700 px-6">
            <div className="flex gap-4">
              {(['overview', 'matches', 'ratings', 'mvp'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-semibold transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* FIFA Card */}
                <div className="flex justify-center">
                  <FIFAStatCard playerName={player.name} fifaStats={player.fifaStats} />
                </div>

                {/* Career Stats */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Career Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-400">{careerTotals.goals}</div>
                      <div className="text-sm text-slate-400">Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">{careerTotals.assists}</div>
                      <div className="text-sm text-slate-400">Assists</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">{careerTotals.dribbles}</div>
                      <div className="text-sm text-slate-400">Dribbles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400">{careerTotals.tackles}</div>
                      <div className="text-sm text-slate-400">Tackles</div>
                    </div>
                  </div>
                </div>

                {/* Average Rating */}
                {averageRating > 0 && (
                  <div className="bg-slate-800 rounded-xl p-6 text-center">
                    <div className="text-sm text-slate-400 mb-2">Average Match Rating</div>
                    <div className="text-5xl font-bold text-emerald-400">{averageRating}</div>
                  </div>
                )}
              </>
            )}

            {/* Matches Tab */}
            {activeTab === 'matches' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Recent Matches</h3>
                {recentMatches.length === 0 ? (
                  <div className="bg-slate-800 rounded-xl p-6 text-center text-slate-400">
                    No matches played yet
                  </div>
                ) : (
                  recentMatches.map((match) => {
                    const playerStats = match.playerStats.find((ps) => ps.playerId === player.id);
                    const rating = getMatchRating(player.id, match.id, matchRatings);
                    return (
                      <div
                        key={match.id}
                        className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white mb-1">
                              vs {match.opponent}
                            </div>
                            <div className="text-sm text-slate-400">
                              {formatDate(match.date)} • {match.fieldName}
                            </div>
                            {playerStats && (
                              <div className="flex gap-4 mt-2 text-sm">
                                <span className="text-emerald-400">
                                  {playerStats.stats.goals}G
                                </span>
                                <span className="text-blue-400">
                                  {playerStats.stats.assists}A
                                </span>
                                {rating && (
                                  <span className="text-yellow-400">
                                    Rating: {rating.rating}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleEditRating(match.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            {rating ? 'Edit Rating' : 'Add Rating'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Ratings Tab */}
            {activeTab === 'ratings' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Match Ratings</h3>
                  <button
                    onClick={() => {
                      setEditingRating(null);
                      setShowRatingEditor(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    + Add Rating
                  </button>
                </div>
                {matchRatings
                  .filter((mr) => mr.playerId === player.id)
                  .length === 0 ? (
                  <div className="bg-slate-800 rounded-xl p-6 text-center text-slate-400">
                    No ratings assigned yet
                  </div>
                ) : (
                  matchRatings
                    .filter((mr) => mr.playerId === player.id)
                    .map((rating) => {
                      const match = matches.find((m) => m.id === rating.matchId);
                      return (
                        <div
                          key={`${rating.matchId}-${rating.playerId}`}
                          className="bg-slate-800 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white mb-1">
                                {match ? `vs ${match.opponent}` : 'Unknown Match'}
                              </div>
                              <div className="text-sm text-slate-400">
                                {match ? formatDate(match.date) : 'N/A'}
                              </div>
                              {rating.notes && (
                                <div className="text-sm text-slate-300 mt-2 italic">
                                  "{rating.notes}"
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-3xl font-bold text-emerald-400">
                                  {rating.rating}
                                </div>
                                <div className="text-xs text-slate-400">Rating</div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditRating(rating.matchId)}
                                  className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => onDeleteMatchRating(rating.matchId, rating.playerId)}
                                  className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}

            {/* MVP Tab */}
            {activeTab === 'mvp' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">MVP Records</h3>
                <MVPRecords mvpRecords={mvpMatches} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Editor Modal */}
      {showEditor && (
        <PlayerProfileEditor
          player={player}
          onSave={(updatedPlayer) => {
            onUpdatePlayer(updatedPlayer);
            setShowEditor(false);
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {/* Rating Editor Modal */}
      {showRatingEditor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Match Rating</h3>
              <button
                onClick={() => {
                  setShowRatingEditor(false);
                  setEditingRating(null);
                }}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <MatchRatingEditor
              matches={matches}
              existingRating={editingRating}
              onSave={handleSaveRating}
              onCancel={() => {
                setShowRatingEditor(false);
                setEditingRating(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

