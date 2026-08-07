import { useEffect } from 'react';

interface ShortcutHandlers {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
}

export function useKeyboardShortcuts({ onUndo, onRedo, onSave }: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (!isCtrl) return;

      const key = e.key.toLowerCase();
      
      if (key === 'z') {
        if (onUndo) {
          e.preventDefault();
          onUndo();
        }
      } else if (key === 'y') {
        if (onRedo) {
          e.preventDefault();
          onRedo();
        }
      } else if (key === 's') {
        if (onSave) {
          e.preventDefault();
          onSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onUndo, onRedo, onSave]);
}
export default useKeyboardShortcuts;
