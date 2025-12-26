import { useState } from 'react';
import { fileToBase64, validateImageFile } from '../utils/imageUtils';

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatch: (
    opponent: string,
    date: string,
    time: string,
    fieldName: string,
    fieldImage: string | null,
    opponentScore: number | null,
    netMatchTime: number | null
  ) => void;
}

export function NewMatchModal({ isOpen, onClose, onCreateMatch }: NewMatchModalProps) {
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [fieldName, setFieldName] = useState('');
  const [fieldImage, setFieldImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [opponentScore, setOpponentScore] = useState<string>('');
  const [netMatchTime, setNetMatchTime] = useState<string>('');

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || 'Invalid image file');
      setFieldImage(null);
      setImagePreview(null);
      return;
    }

    setImageError(null);
    try {
      const base64 = await fileToBase64(file);
      setFieldImage(base64);
      setImagePreview(base64);
    } catch (error) {
      setImageError('Failed to process image');
      setFieldImage(null);
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setFieldImage(null);
    setImagePreview(null);
    setImageError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (opponent.trim() && fieldName.trim()) {
      const opponentScoreNum = opponentScore.trim() ? parseInt(opponentScore, 10) : null;
      const netMatchTimeNum = netMatchTime.trim() ? parseInt(netMatchTime, 10) : null;
      onCreateMatch(
        opponent.trim(),
        date,
        time,
        fieldName.trim(),
        fieldImage,
        opponentScoreNum,
        netMatchTimeNum
      );
      // Reset form
      setOpponent('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('18:00');
      setFieldName('');
      setFieldImage(null);
      setImagePreview(null);
      setOpponentScore('');
      setImageError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">New Match</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Opponent Name
            </label>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="e.g., Los Tigres"
              className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Field Name
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g., Central Park Field"
              className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Field Image/Logo
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Field preview"
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="w-full bg-slate-700 rounded px-3 py-2 cursor-pointer hover:bg-slate-600 transition-colors text-center border-2 border-dashed border-slate-600">
                  <span className="text-slate-400 text-sm">Click to upload image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            {imageError && (
              <p className="text-red-400 text-xs mt-1">{imageError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Opponent Score (optional - for past matches)
            </label>
            <input
              type="number"
              value={opponentScore}
              onChange={(e) => setOpponentScore(e.target.value)}
              placeholder="Leave empty for upcoming match"
              min="0"
              className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Tiempo Neto de Partido (minutes, optional)
            </label>
            <input
              type="number"
              value={netMatchTime}
              onChange={(e) => setNetMatchTime(e.target.value)}
              placeholder="e.g., 90"
              min="0"
              className="w-full bg-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded bg-slate-600 hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!opponent.trim() || !fieldName.trim()}
              className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors font-bold"
            >
              Create Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
