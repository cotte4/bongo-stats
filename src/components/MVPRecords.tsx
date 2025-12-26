import type { MVPRecord } from '../types';

interface MVPRecordsProps {
  mvpRecords: MVPRecord[];
}

export function MVPRecords({ mvpRecords }: MVPRecordsProps) {
  if (mvpRecords.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 text-center">
        <div className="text-slate-400 mb-2">No MVP records yet</div>
        <div className="text-sm text-slate-500">This player hasn't been MVP in any matches</div>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-3">
      {mvpRecords.map((mvp, index) => (
        <div
          key={`${mvp.matchId}-${index}`}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                  MVP
                </span>
                <span className="text-white font-semibold">vs {mvp.opponent}</span>
              </div>
              <div className="text-sm text-slate-400">{formatDate(mvp.date)}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">{mvp.rating}</div>
              <div className="text-xs text-slate-400">Rating</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

