import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const metaKey = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? 'Cmd' : 'Ctrl';

const SHORTCUTS = [
  { keys: [metaKey, 'Z'], description: 'Undo last action' },
  { keys: [metaKey, 'Shift', 'Z'], description: 'Redo last undone action' },
  { keys: ['Escape'], description: 'Close open panel or modal' },
  { keys: ['Tab'], description: 'Cycle focus within an open panel' },
  { keys: ['Double-click'], description: 'Create a new initiative on the timeline' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        data-testid="keyboard-shortcuts-modal"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <ul className="divide-y divide-slate-100 px-4 py-2">
          {SHORTCUTS.map(({ keys, description }) => (
            <li key={description} className="flex items-center justify-between py-2.5 gap-4">
              <span className="text-sm text-slate-600">{description}</span>
              <span className="flex items-center gap-1 flex-shrink-0">
                {keys.map((key, i) => (
                  <React.Fragment key={key}>
                    {i > 0 && <span className="text-slate-400 text-xs">+</span>}
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded">
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
