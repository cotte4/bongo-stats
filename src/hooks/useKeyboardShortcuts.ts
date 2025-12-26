import { useEffect, useCallback } from 'react';
import type { StatKey } from '../types';
import { STAT_CONFIG } from '../types';

interface UseKeyboardShortcutsProps {
  onStatRecord: (stat: StatKey) => void;
  onUndo: () => void;
  onToggleGoalkeeper: () => void;
  enabled: boolean;
}

export function useKeyboardShortcuts({
  onStatRecord,
  onUndo,
  onToggleGoalkeeper,
  enabled,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo with Ctrl+Z
      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        onUndo();
        return;
      }

      // Toggle goalkeeper with K
      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onToggleGoalkeeper();
        return;
      }

      // Find matching stat by key
      const pressedKey = event.key.toUpperCase();
      const statEntry = Object.entries(STAT_CONFIG).find(
        ([, config]) => config.key === pressedKey
      );

      if (statEntry) {
        event.preventDefault();
        onStatRecord(statEntry[0] as StatKey);
      }
    },
    [enabled, onStatRecord, onUndo, onToggleGoalkeeper]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
