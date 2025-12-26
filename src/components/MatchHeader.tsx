import type { Match, PlayerMatchStats } from '../types';

interface MatchHeaderProps {
  match: Match;
  playerStats: PlayerMatchStats[];
}

export function MatchHeader({ match, playerStats }: MatchHeaderProps) {
  const totalGoals = playerStats.reduce((sum, ps) => sum + ps.stats.goals, 0);
  const opponentGoals = match.opponentScore ?? null;

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

  return (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold text-emerald-400">BONGO</div>
        <div className="text-slate-400">vs</div>
        <div className="text-2xl font-bold">{match.opponent || 'Opponent'}</div>
      </div>

      {match.fieldName && (
        <div className="text-sm text-slate-400">
          <span className="font-medium text-slate-300">Field:</span> {match.fieldName}
        </div>
      )}

      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-sm text-slate-400">Date</div>
          <div className="font-medium">{formatDate(match.date)}</div>
          {match.time && (
            <div className="text-xs text-slate-500 mt-1">{formatTime(match.time)}</div>
          )}
        </div>

        {match.netMatchTime !== null && (
          <div className="text-center">
            <div className="text-sm text-slate-400">Tiempo Neto</div>
            <div className="font-medium text-white">{match.netMatchTime}'</div>
          </div>
        )}

        <div className="text-center">
          <div className="text-sm text-slate-400">Score</div>
          {opponentGoals !== null ? (
            <div className="text-3xl font-bold text-emerald-400">
              {totalGoals} - {opponentGoals}
            </div>
          ) : (
            <div className="text-3xl font-bold text-emerald-400">{totalGoals}</div>
          )}
        </div>
      </div>
    </div>
  );
}
