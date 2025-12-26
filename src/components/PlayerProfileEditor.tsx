import { useState, useEffect } from 'react';
import type { Player, FIFAStats } from '../types';
import { fileToBase64, validateImageFile } from '../utils/imageUtils';
import { DEFAULT_FIFA_STATS } from '../types';

interface PlayerProfileEditorProps {
  player: Player;
  onSave: (updatedPlayer: Player) => void;
  onCancel: () => void;
}

export function PlayerProfileEditor({
  player,
  onSave,
  onCancel,
}: PlayerProfileEditorProps) {
  const [name, setName] = useState(player.name);
  const [birthday, setBirthday] = useState(
    player.birthday ? new Date(player.birthday).toISOString().split('T')[0] : ''
  );
  const [bongs, setBongs] = useState(player.bongs);
  const [preferredFoot, setPreferredFoot] = useState<'left' | 'right' | 'both'>(
    player.preferredFoot
  );
  const [fifaStats, setFifaStats] = useState<FIFAStats>(player.fifaStats);
  const [profileImage, setProfileImage] = useState<string | null>(player.profileImage);
  const [imagePreview, setImagePreview] = useState<string | null>(player.profileImage);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || 'Invalid image file');
      setProfileImage(null);
      setImagePreview(null);
      return;
    }

    setImageError(null);
    try {
      const base64 = await fileToBase64(file);
      setProfileImage(base64);
      setImagePreview(base64);
    } catch (error) {
      setImageError('Failed to process image');
      setProfileImage(null);
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setImageError(null);
  };

  const handleStatChange = (stat: keyof FIFAStats, value: number) => {
    setFifaStats((prev) => ({
      ...prev,
      [stat]: Math.max(0, Math.min(100, value)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...player,
      name: name.trim(),
      birthday: birthday || null,
      bongs,
      preferredFoot,
      fifaStats,
      profileImage,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Edit Player Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Profile Image
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-32 h-32 object-cover rounded-full mb-2"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-600 transition-colors border-2 border-dashed border-slate-600">
                  <span className="text-slate-400 text-sm">Upload</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            {imageError && <p className="text-red-400 text-xs mt-1">{imageError}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Birthday
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Preferred Foot */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Preferred Foot
            </label>
            <select
              value={preferredFoot}
              onChange={(e) => setPreferredFoot(e.target.value as 'left' | 'right' | 'both')}
              className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* BONGS */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              BONGS: {bongs}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={bongs}
              onChange={(e) => setBongs(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* FIFA Stats */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-4">
              FIFA Stats
            </label>
            <div className="space-y-4 bg-slate-900 rounded-lg p-4">
              {(['ritmo', 'tiro', 'dribbling', 'fisico', 'defensa', 'pase'] as const).map(
                (stat) => (
                  <div key={stat}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-300 capitalize">
                        {stat === 'fisico' ? 'Físico' : stat === 'defensa' ? 'Defensa' : stat === 'pase' ? 'Pase' : stat === 'ritmo' ? 'Ritmo' : stat === 'tiro' ? 'Tiro' : stat}
                      </span>
                      <span className="text-lg font-bold text-white">{fifaStats[stat]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={fifaStats[stat]}
                      onChange={(e) => handleStatChange(stat, parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors font-bold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

