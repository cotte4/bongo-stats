import { useState } from 'react';
import type { Match, MatchRating } from '../types';

interface MatchRatingEditorProps {
  matches: Match[];
  existingRating: MatchRating | null;
  onSave: (rating: MatchRating) => void;
  onCancel: () => void;
}

export function MatchRatingEditor({
  matches,
  existingRating,
  onSave,
  onCancel,
}: MatchRatingEditorProps) {
  const [selectedMatchId, setSelectedMatchId] = useState(
    existingRating?.matchId || matches[0]?.id || ''
  );
  const [rating, setRating] = useState(existingRating?.rating || 50);
  const [notes, setNotes] = useState(existingRating?.notes || '');

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId) return;

    onSave({
      matchId: selectedMatchId,
      playerId: existingRating?.playerId || '',
      rating,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Select Match
        </label>
        <select
          value={selectedMatchId}
          onChange={(e) => setSelectedMatchId(e.target.value)}
          className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          disabled={!!existingRating}
        >
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              vs {match.opponent} - {new Date(match.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {selectedMatch && (
        <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-400">
          <div>Date: {new Date(selectedMatch.date).toLocaleDateString()}</div>
          <div>Field: {selectedMatch.fieldName || 'N/A'}</div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Rating: {rating}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this match..."
          rows={3}
          className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors font-bold"
        >
          Save Rating
        </button>
      </div>
    </form>
  );
}

