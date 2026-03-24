import React, { useState, useEffect } from 'react';
import { Asset, AssetCategory } from '../types';
import { X } from 'lucide-react';
import { useFocusTrap } from '../lib/useFocusTrap';

interface AssetPanelProps {
  asset: Asset | null;
  assetCategories: AssetCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
}

const MATURITY_OPTIONS = [
  { value: '', label: '— Unrated —' },
  { value: '1', label: '1 – Emergent' },
  { value: '2', label: '2 – Developing' },
  { value: '3', label: '3 – Defined' },
  { value: '4', label: '4 – Managed' },
  { value: '5', label: '5 – Optimised' },
];

export function AssetPanel({ asset, assetCategories, isOpen, onClose, onSave }: AssetPanelProps) {
  const [formData, setFormData] = useState<Asset | null>(null);
  const panelRef = useFocusTrap(isOpen, onClose);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (asset) {
      setFormData({ ...asset });
    }
  }, [asset]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex justify-end"
      onClick={handleOverlayClick}
      data-testid="asset-panel"
    >
      <div ref={panelRef} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">Edit Asset</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="asset-panel-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="asset-name" className="block text-sm font-medium text-slate-700 mb-1">
                Asset Name
              </label>
              <input
                id="asset-name"
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="asset-category" className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                id="asset-category"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                {assetCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="asset-maturity" className="block text-sm font-medium text-slate-700 mb-1">
                Maturity
              </label>
              <select
                id="asset-maturity"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                value={formData.maturity !== undefined ? String(formData.maturity) : ''}
                onChange={(e) => setFormData({ ...formData, maturity: e.target.value ? Number(e.target.value) : undefined })}
              >
                {MATURITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        <div className="flex gap-3 p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="asset-panel-form"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
