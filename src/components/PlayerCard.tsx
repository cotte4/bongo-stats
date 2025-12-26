import type { Player, PlayerStats } from '../types';

interface PlayerCardProps {
  player: Player;
  stats: PlayerStats;
  isSelected: boolean;
  isGoalkeeper: boolean;
  onClick: () => void;
  onToggleGoalkeeper: () => void;
  onProfileClick?: () => void;
}

export function PlayerCard({
  player,
  stats,
  isSelected,
  isGoalkeeper,
  onClick,
  onToggleGoalkeeper,
  onProfileClick,
}: PlayerCardProps) {
  return (
    <div
      className={`
        relative cursor-pointer rounded-lg p-4 transition-all duration-150
        ${isSelected
          ? 'bg-emerald-600 ring-2 ring-emerald-400 scale-105'
          : 'bg-slate-700 hover:bg-slate-600'
        }
      `}
    >
      {/* Profile button */}
      {onProfileClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onProfileClick();
          }}
          className="absolute top-2 right-2 text-slate-300 hover:text-white transition-colors"
          title="View Profile"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      )}

      {/* Goalkeeper badge */}
      {isGoalkeeper && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
          GK
        </div>
      )}

      {/* Player name */}
      <div onClick={onClick} className="text-center font-bold text-lg mb-2">{player.name}</div>

      {/* Quick stats */}
      <div onClick={onClick} className="grid grid-cols-3 gap-1 text-xs text-center">
        {stats.goals > 0 && (
          <div className="bg-slate-800 rounded px-1 py-0.5">
            <span className="text-emerald-400">{stats.goals}</span> G
          </div>
        )}
        {stats.assists > 0 && (
          <div className="bg-slate-800 rounded px-1 py-0.5">
            <span className="text-blue-400">{stats.assists}</span> A
          </div>
        )}
        {stats.saves > 0 && (
          <div className="bg-slate-800 rounded px-1 py-0.5">
            <span className="text-yellow-400">{stats.saves}</span> SV
          </div>
        )}
        {stats.interceptions > 0 && (
          <div className="bg-slate-800 rounded px-1 py-0.5">
            <span className="text-purple-400">{stats.interceptions}</span> I
          </div>
        )}
        {stats.dribbles > 0 && (
          <div className="bg-slate-800 rounded px-1 py-0.5">
            <span className="text-orange-400">{stats.dribbles}</span> D
          </div>
        )}
        {stats.tackles > 0 && (
          <div className="bg-slate-800 rounded px-1 py-0.5">
            <span className="text-cyan-400">{stats.tackles}</span> T
          </div>
        )}
      </div>

      {/* Set as GK button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleGoalkeeper();
        }}
        className={`
          mt-2 w-full text-xs py-1 rounded transition-colors
          ${isGoalkeeper
            ? 'bg-yellow-600 hover:bg-yellow-500 text-black'
            : 'bg-slate-600 hover:bg-slate-500'
          }
        `}
      >
        {isGoalkeeper ? 'Remove GK' : 'Set as GK'}
      </button>
      
      {/* Profile button at bottom */}
      {onProfileClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onProfileClick();
          }}
          className="mt-2 w-full text-xs py-1 rounded bg-blue-600 hover:bg-blue-500 transition-colors"
        >
          Profile
        </button>
      )}
    </div>
  );
}
