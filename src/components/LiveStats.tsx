import type { PlayerMatchStats, StatKey } from '../types';
import { STAT_CONFIG } from '../types';

interface LiveStatsProps {
  playerStats: PlayerMatchStats[];
}

export function LiveStats({ playerStats }: LiveStatsProps) {
  const totals = playerStats.reduce(
    (acc, ps) => {
      (Object.keys(ps.stats) as StatKey[]).forEach((key) => {
        acc[key] = (acc[key] || 0) + ps.stats[key];
      });
      return acc;
    },
    {} as Record<StatKey, number>
  );

  const statsToShow: StatKey[] = [
    'goals',
    'assists',
    'shotsOnTarget',
    'shotsOffTarget',
    'passesCompleted',
    'passesMissed',
    'interceptions',
    'tackles',
    'dribbles',
    'fouls',
    'saves',
    'goalsConceded',
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4 text-center border-b border-slate-700 pb-2">
        LIVE STATS
      </h3>

      <div className="space-y-2">
        {statsToShow.map((stat) => {
          const config = STAT_CONFIG[stat];
          const value = totals[stat] || 0;

          if (value === 0 && config.isGkStat) return null;

          return (
            <div
              key={stat}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-slate-400">{config.label}</span>
              <span
                className={`font-bold ${
                  stat === 'goals'
                    ? 'text-emerald-400'
                    : stat === 'assists'
                    ? 'text-blue-400'
                    : stat === 'saves'
                    ? 'text-yellow-400'
                    : 'text-white'
                }`}
              >
                {value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pass accuracy */}
      {(totals.passesCompleted || 0) + (totals.passesMissed || 0) > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Pass Accuracy</span>
            <span className="font-bold text-cyan-400">
              {Math.round(
                ((totals.passesCompleted || 0) /
                  ((totals.passesCompleted || 0) + (totals.passesMissed || 0))) *
                  100
              )}
              %
            </span>
          </div>
        </div>
      )}

      {/* Shot accuracy */}
      {(totals.shotsOnTarget || 0) + (totals.shotsOffTarget || 0) > 0 && (
        <div className="mt-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Shot Accuracy</span>
            <span className="font-bold text-orange-400">
              {Math.round(
                ((totals.shotsOnTarget || 0) /
                  ((totals.shotsOnTarget || 0) + (totals.shotsOffTarget || 0))) *
                  100
              )}
              %
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
