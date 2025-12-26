import { useState } from 'react';
import type { Player, Match, MVPRecord } from '../types';

interface MVPSelectorProps {
  players: Player[];
  match: Match;
  currentMVP: MVPRecord | null;
  onSelectMVP: (playerId: string) => void;
  onRemoveMVP: () => void;
}

export function MVPSelector({
  players,
  match,
  currentMVP,
  onSelectMVP,
  onRemoveMVP,
}: MVPSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);

  const currentMVPPlayer = currentMVP
    ? players.find((p) => p.id === currentMVP.playerId)
    : null;

  const handleSelectPlayer = (playerId: string) => {
    onSelectMVP(playerId);
    setShowSelector(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Match MVP</h3>
        {!showSelector && (
          <button
            onClick={() => setShowSelector(true)}
            className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {currentMVP ? 'Change MVP' : 'Select MVP'}
          </button>
        )}
      </div>

      {showSelector ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {players.map((player) => {
              const isSelected = currentMVP?.playerId === player.id;
              return (
                <button
                  key={player.id}
                  onClick={() => handleSelectPlayer(player.id)}
                  className={`
                    p-3 rounded-lg transition-all text-left
                    ${
                      isSelected
                        ? 'bg-yellow-500 text-black ring-2 ring-yellow-400'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }
                  `}
                >
                  <div className="font-semibold">{player.name}</div>
                  {isSelected && (
                    <div className="text-xs mt-1 font-bold">Current MVP</div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSelector(false)}
              className="flex-1 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
            {currentMVP && (
              <button
                onClick={() => {
                  onRemoveMVP();
                  setShowSelector(false);
                }}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors"
              >
                Remove MVP
              </button>
            )}
          </div>
        </div>
      ) : currentMVPPlayer ? (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                MVP
              </div>
              <div>
                <div className="font-bold text-white text-lg">{currentMVPPlayer.name}</div>
                <div className="text-sm text-slate-300">vs {match.opponent}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">{currentMVP?.rating ?? 0}</div>
              <div className="text-xs text-slate-400">Rating</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-slate-400">
          No MVP selected for this match
        </div>
      )}
    </div>
  );
}

