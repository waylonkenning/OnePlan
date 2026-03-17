import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const confirmClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-amber-500 hover:bg-amber-600 text-white';

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      data-testid="confirm-modal"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3 p-5 pb-3">
          <div className="flex-shrink-0 mt-0.5 text-red-500">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 p-4 pt-2 justify-end">
          <button
            onClick={onCancel}
            data-testid="confirm-modal-cancel"
            className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            data-testid="confirm-modal-confirm"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
