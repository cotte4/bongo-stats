import type { FIFAStats } from '../types';
import { calculateOverallRating } from '../utils/playerUtils';

interface FIFAStatCardProps {
  playerName: string;
  fifaStats: FIFAStats;
}

export function FIFAStatCard({ playerName, fifaStats }: FIFAStatCardProps) {
  const overallRating = calculateOverallRating(fifaStats);

  const getRatingColor = (rating: number): string => {
    if (rating >= 85) return 'from-yellow-400 to-yellow-600';
    if (rating >= 75) return 'from-blue-400 to-blue-600';
    if (rating >= 65) return 'from-green-400 to-green-600';
    if (rating >= 55) return 'from-slate-400 to-slate-600';
    return 'from-gray-400 to-gray-600';
  };

  const getStatColor = (statName: string): string => {
    switch (statName) {
      case 'ritmo':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'tiro':
        return 'bg-gradient-to-r from-red-400 to-red-600';
      case 'dribbling':
        return 'bg-gradient-to-r from-purple-400 to-purple-600';
      case 'fisico':
        return 'bg-gradient-to-r from-green-400 to-green-600';
      case 'defensa':
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 'pase':
        return 'bg-gradient-to-r from-cyan-400 to-cyan-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const getStatLabel = (statName: string): string => {
    switch (statName) {
      case 'ritmo':
        return 'Ritmo';
      case 'tiro':
        return 'Tiro';
      case 'dribbling':
        return 'Dribbling';
      case 'fisico':
        return 'Físico';
      case 'defensa':
        return 'Defensa';
      case 'pase':
        return 'Pase';
      default:
        return statName;
    }
  };

  const stats = [
    { key: 'ritmo' as const, value: fifaStats.ritmo },
    { key: 'tiro' as const, value: fifaStats.tiro },
    { key: 'dribbling' as const, value: fifaStats.dribbling },
    { key: 'fisico' as const, value: fifaStats.fisico },
    { key: 'defensa' as const, value: fifaStats.defensa },
    { key: 'pase' as const, value: fifaStats.pase },
  ];

  return (
    <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border-2 border-slate-700">
      {/* Overall Rating Badge */}
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${getRatingColor(overallRating)} flex items-center justify-center shadow-lg border-4 border-slate-900`}>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{overallRating}</div>
          <div className="text-xs text-white/90 font-semibold">OVR</div>
        </div>
      </div>

      {/* Player Name */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-1">{playerName}</h3>
        <div className="text-sm text-slate-400">FIFA Stats</div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.key} className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-slate-300">
                {getStatLabel(stat.key)}
              </span>
              <span className="text-lg font-bold text-white">{stat.value}</span>
            </div>
            {/* Stat Bar */}
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatColor(stat.key)} rounded-full transition-all duration-500`}
                style={{ width: `${stat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Card Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">
          Overall Rating: <span className="font-bold text-white">{overallRating}</span>
        </div>
      </div>
    </div>
  );
}

