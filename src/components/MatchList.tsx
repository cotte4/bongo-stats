import type { Match } from '../types';
import { getDefaultFieldImage } from '../utils/imageUtils';

interface MatchListProps {
  matches: Match[];
  currentMatchId: string | null;
  onSelectMatch: (matchId: string) => void;
  onNewMatch: () => void;
  onDeleteMatch: (matchId: string) => void;
}

export function MatchList({
  matches,
  currentMatchId,
  onSelectMatch,
  onNewMatch,
  onDeleteMatch,
}: MatchListProps) {
  // Sort matches: upcoming first, then by date (newest first)
  const sortedMatches = [...matches].sort((a, b) => {
    const now = new Date();
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    
    const aIsFuture = dateA > now;
    const bIsFuture = dateB > now;
    
    // Future matches first
    if (aIsFuture && !bIsFuture) return -1;
    if (!aIsFuture && bIsFuture) return 1;
    
    // Then sort by date (newest first)
    return dateB.getTime() - dateA.getTime();
  });

  const isMatchComingSoon = (match: Match): boolean => {
    const now = new Date();
    const matchDateTime = new Date(`${match.date}T${match.time || '00:00'}`);
    return matchDateTime > now && match.opponentScore === null;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getMatchScore = (match: Match): { ourGoals: number; opponentGoals: number | null } => {
    const ourGoals = match.playerStats.reduce(
      (sum, ps) => sum + ps.stats.goals,
      0
    );
    return {
      ourGoals,
      opponentGoals: match.opponentScore,
    };
  };

  const getScoreColor = (ourGoals: number, opponentGoals: number | null): string => {
    if (opponentGoals === null) return 'text-slate-400';
    if (ourGoals > opponentGoals) return 'text-emerald-400';
    if (ourGoals < opponentGoals) return 'text-red-400';
    return 'text-blue-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Matches</h2>
          <p className="text-slate-400 mt-1">Your football matches</p>
        </div>
        <button
          onClick={onNewMatch}
          className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-600/20"
        >
          + New Match
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 bg-slate-800 rounded-xl">
          <p className="text-slate-400 text-lg mb-2">No matches yet</p>
          <p className="text-slate-500 text-sm">Create your first match to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMatches.map((match) => {
            const isCurrent = match.id === currentMatchId;
            const comingSoon = isMatchComingSoon(match);
            const { ourGoals, opponentGoals } = getMatchScore(match);
            const fieldImage = match.fieldImage || getDefaultFieldImage();

            return (
              <div
                key={match.id}
                className={`
                  relative bg-white rounded-xl overflow-hidden cursor-pointer
                  transition-all duration-200 hover:scale-[1.02] hover:shadow-xl
                  ${isCurrent ? 'ring-4 ring-emerald-400 shadow-2xl shadow-emerald-400/20' : 'shadow-lg'}
                `}
                onClick={() => onSelectMatch(match.id)}
              >
                {/* Field Image */}
                <div className="relative h-40 bg-slate-200 overflow-hidden">
                  <img
                    src={fieldImage}
                    alt={match.fieldName || 'Field'}
                    className="w-full h-full object-cover"
                  />
                  {/* Field Name Badge */}
                  {match.fieldName && (
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {match.fieldName}
                    </div>
                  )}
                  {/* Active Match Indicator */}
                  {isCurrent && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Active
                    </div>
                  )}
                </div>

                {/* Match Info */}
                <div className="p-5 space-y-3">
                  {/* Team Names */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      BONGO vs {match.opponent}
                    </h3>
                  </div>

                  {/* Date and Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{formatDate(match.date)}</span>
                    {match.time && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>{formatTime(match.time)}</span>
                      </>
                    )}
                  </div>

                  {/* Score or Coming Soon */}
                  <div className="pt-2 border-t border-gray-200">
                    {comingSoon ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                          Coming Soon
                        </span>
                      </div>
                    ) : opponentGoals !== null ? (
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${getScoreColor(ourGoals, opponentGoals)}`}>
                          {ourGoals} - {opponentGoals}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {ourGoals > opponentGoals ? 'Win' : ourGoals < opponentGoals ? 'Loss' : 'Draw'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-lg font-semibold text-emerald-600">
                        {ourGoals} {ourGoals === 1 ? 'goal' : 'goals'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this match?')) {
                      onDeleteMatch(match.id);
                    }
                  }}
                  className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-lg"
                  title="Delete match"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
