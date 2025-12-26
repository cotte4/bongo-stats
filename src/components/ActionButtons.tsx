import type { StatKey } from '../types';
import { STAT_CONFIG } from '../types';

interface ActionButtonsProps {
  onStatClick: (stat: StatKey) => void;
  onUndo: () => void;
  isGoalkeeper: boolean;
  disabled: boolean;
}

export function ActionButtons({ onStatClick, onUndo, isGoalkeeper, disabled }: ActionButtonsProps) {
  const outfieldStats: StatKey[] = [
    'goals',
    'assists',
    'shotsOnTarget',
    'shotsOffTarget',
    'passesCompleted',
    'passesMissed',
    'interceptions',
    'tackles',
    'fouls',
    'dribbles',
  ];

  const gkStats: StatKey[] = ['saves', 'goalsConceded'];

  const renderButton = (stat: StatKey) => {
    const config = STAT_CONFIG[stat];
    const isGkStat = config.isGkStat;

    // Only show GK stats if player is goalkeeper
    if (isGkStat && !isGoalkeeper) return null;

    return (
      <button
        key={stat}
        onClick={() => onStatClick(stat)}
        disabled={disabled}
        className={`
          flex flex-col items-center justify-center p-3 rounded-lg transition-all
          ${disabled
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : isGkStat
              ? 'bg-yellow-700 hover:bg-yellow-600 active:scale-95'
              : 'bg-slate-700 hover:bg-slate-600 active:scale-95'
          }
        `}
      >
        <span className="text-2xl font-bold">{config.key}</span>
        <span className="text-xs mt-1 opacity-75">{config.shortLabel}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Outfield stats */}
      <div className="grid grid-cols-5 gap-2">
        {outfieldStats.map(renderButton)}
      </div>

      {/* GK stats (only when goalkeeper) */}
      {isGoalkeeper && (
        <div className="grid grid-cols-2 gap-2 max-w-xs">
          {gkStats.map(renderButton)}
        </div>
      )}

      {/* Undo button */}
      <button
        onClick={onUndo}
        disabled={disabled}
        className={`
          w-full py-3 rounded-lg font-bold transition-all
          ${disabled
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-red-700 hover:bg-red-600 active:scale-98'
          }
        `}
      >
        UNDO (Ctrl+Z)
      </button>
    </div>
  );
}
