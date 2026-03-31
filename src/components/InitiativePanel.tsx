import React, { useState, useEffect } from 'react';
import { Initiative, Asset, Application, Programme, Strategy, Dependency, Resource, DtsPhase } from '../types';
import { X, Save, Trash2 } from 'lucide-react';
import { validateInitiative, ValidationErrors } from '../lib/validation';
import { ConfirmModal } from './ConfirmModal';
import { useFocusTrap } from '../lib/useFocusTrap';

interface InitiativePanelProps {
    initiative: Initiative | null;
    assets: Asset[];
    applications?: Application[];
    programmes: Programme[];
    strategies: Strategy[];
    dependencies?: Dependency[];
    initiatives?: Initiative[];
    resources?: Resource[];
    onClose: () => void;
    onSave: (initiative: Initiative) => void;
    onDelete?: (initiative: Initiative) => void;
    isOpen: boolean;
    hasDtsAssets?: boolean;
}

export function InitiativePanel({ initiative, assets, applications = [], programmes, strategies, dependencies = [], initiatives = [], resources = [], onClose, onSave, onDelete, isOpen, hasDtsAssets = false }: InitiativePanelProps) {
    const [formData, setFormData] = useState<Initiative | null>(null);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [confirmDelete, setConfirmDelete] = useState(false);
    const panelRef = useFocusTrap(isOpen, onClose);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (initiative) {
            setFormData({ ...initiative });
            setErrors({});
        }
    // Use initiative.id as the dependency — the prop object is recreated on every
    // render (inline object literal in Timeline), so depending on the full object
    // would reset the form on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initiative?.id]);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (!isOpen || !formData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateInitiative(formData, assets, programmes);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        onSave(formData);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <>
        <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex justify-end"
            onClick={handleOverlayClick}
            data-testid="initiative-panel"
        >
            <div ref={panelRef} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {formData.id.includes('new') ? 'Create Initiative' : 'Edit Initiative'}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="initiative-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                Initiative Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${errors.name ? 'border-red-400' : 'border-slate-300'}`}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="assetId" className="block text-sm font-medium text-slate-700 mb-1">
                                IT Asset / Service
                            </label>
                            <select
                                id="assetId"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                                value={formData.assetId}
                                onChange={(e) => setFormData({ ...formData, assetId: e.target.value, applicationId: undefined })}
                            >
                                <option value="">Select an Asset...</option>
                                {assets.map(asset => (
                                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                                ))}
                            </select>
                        </div>

                        {(() => {
                            const assetApps = applications.filter(a => a.assetId === formData.assetId);
                            return (
                                <div>
                                    <label htmlFor="applicationId" className="block text-sm font-medium text-slate-700 mb-1">
                                        Application <span className="text-slate-400 font-normal">(optional)</span>
                                    </label>
                                    <select
                                        id="applicationId"
                                        data-testid="initiative-application"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                                        value={formData.applicationId || ''}
                                        onChange={(e) => setFormData({ ...formData, applicationId: e.target.value || undefined })}
                                        disabled={assetApps.length === 0}
                                    >
                                        <option value="">{assetApps.length === 0 ? 'No applications for this asset' : 'None (asset-level)'}</option>
                                        {assetApps.map(app => (
                                            <option key={app.id} value={app.id}>{app.name}</option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })()}

                        <div>
                            <label htmlFor="programmeId" className="block text-sm font-medium text-slate-700 mb-1">
                                Programme
                            </label>
                            <select
                                id="programmeId"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                                value={formData.programmeId}
                                onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                            >
                                <option value="">Select a Programme...</option>
                                {programmes.map(prog => (
                                    <option key={prog.id} value={prog.id}>{prog.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="strategyId" className="block text-sm font-medium text-slate-700 mb-1">
                                Strategic Alignment
                            </label>
                            <select
                                id="strategyId"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                                value={formData.strategyId || ''}
                                onChange={(e) => setFormData({ ...formData, strategyId: e.target.value || undefined })}
                            >
                                <option value="">None</option>
                                {strategies.map(strat => (
                                    <option key={strat.id} value={strat.id}>{strat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    id="startDate"
                                    type="date"
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${errors.startDate ? 'border-red-400' : 'border-slate-300'}`}
                                    value={formData.startDate}
                                    onChange={(e) => { setFormData({ ...formData, startDate: e.target.value }); setErrors(prev => { const { startDate: _s, ...rest } = prev; return rest; }); }}
                                />
                                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    id="endDate"
                                    type="date"
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${errors.endDate ? 'border-red-400' : 'border-slate-300'}`}
                                    value={formData.endDate}
                                    onChange={(e) => { setFormData({ ...formData, endDate: e.target.value }); setErrors(prev => { const { endDate: _e, ...rest } = prev; return rest; }); }}
                                />
                                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="capex" className="block text-sm font-medium text-slate-700 mb-1">
                                    CapEx ($)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        id="capex"
                                        type="number"
                                        inputMode="numeric"
                                        step="1000"
                                        className={`w-full pl-7 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${errors.capex ? 'border-red-400' : 'border-slate-300'}`}
                                        value={formData.capex || ''}
                                        onChange={(e) => { const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0; setFormData({ ...formData, capex: val }); setErrors(prev => { const { capex: _c, ...rest } = prev; return rest; }); }}
                                    />
                                </div>
                                {errors.capex && <p className="text-xs text-red-500 mt-1">{errors.capex}</p>}
                            </div>
                            <div>
                                <label htmlFor="opex" className="block text-sm font-medium text-slate-700 mb-1">
                                    OpEx ($)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        id="opex"
                                        type="number"
                                        inputMode="numeric"
                                        step="1000"
                                        className={`w-full pl-7 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${errors.opex ? 'border-red-400' : 'border-slate-300'}`}
                                        value={formData.opex || ''}
                                        onChange={(e) => { const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0; setFormData({ ...formData, opex: val }); setErrors(prev => { const { opex: _o, ...rest } = prev; return rest; }); }}
                                    />
                                </div>
                                {errors.opex && <p className="text-xs text-red-500 mt-1">{errors.opex}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-y text-sm"
                                placeholder="Add a description..."
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                                Status
                            </label>
                            <select
                                id="status"
                                data-testid="initiative-status"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                                value={formData.status || 'planned'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Initiative['status'] })}
                            >
                                <option value="planned">Planned</option>
                                <option value="active">Active</option>
                                <option value="done">Done</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="progress" className="block text-sm font-medium text-slate-700 mb-1">
                                Progress (%)
                            </label>
                            <input
                                id="progress"
                                data-testid="initiative-progress"
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={formData.progress ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value === '' ? undefined : Math.min(100, Math.max(0, Number(e.target.value)));
                                    setFormData({ ...formData, progress: val });
                                }}
                            />
                        </div>

                        <div>
                            <label htmlFor="ownerId" className="block text-sm font-medium text-slate-700 mb-1">
                                Owner
                            </label>
                            {resources.length > 0 ? (
                                <select
                                    id="ownerId"
                                    data-testid="initiative-owner-select"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                                    value={formData.ownerId || ''}
                                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value || undefined })}
                                >
                                    <option value="">No owner</option>
                                    {resources.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}{r.role ? ` (${r.role})` : ''}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    id="owner"
                                    data-testid="initiative-owner"
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    placeholder="e.g. Jane Smith"
                                    value={formData.owner || ''}
                                    onChange={(e) => setFormData({ ...formData, owner: e.target.value || undefined })}
                                />
                            )}
                        </div>

                        {resources.length > 0 && (
                            <div data-testid="initiative-resources-section">
                                <p className="block text-sm font-medium text-slate-700 mb-2">Assigned Resources</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto border border-slate-200 rounded-md p-2">
                                    {resources.map(r => {
                                        const isAssigned = (formData.resourceIds || []).includes(r.id);
                                        return (
                                            <label key={r.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 px-1 py-0.5 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={isAssigned}
                                                    onChange={(e) => {
                                                        const current = formData.resourceIds || [];
                                                        const updated = e.target.checked
                                                            ? [...current, r.id]
                                                            : current.filter(id => id !== r.id);
                                                        setFormData({ ...formData, resourceIds: updated.length > 0 ? updated : undefined });
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                                />
                                                {r.name}{r.role ? <span className="text-slate-400 text-xs ml-1">({r.role})</span> : null}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 py-2">
                            <input
                                id="isPlaceholder"
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                checked={formData.isPlaceholder || false}
                                onChange={(e) => setFormData({ ...formData, isPlaceholder: e.target.checked })}
                            />
                            <label htmlFor="isPlaceholder" className="text-sm font-medium text-slate-700 cursor-pointer">
                                Is Placeholder (No initiative)
                            </label>
                        </div>

                        {hasDtsAssets && (
                            <div>
                                <label htmlFor="dtsPhase" className="block text-sm font-medium text-slate-700 mb-1">
                                    DTS Phase
                                </label>
                                <select
                                    id="dtsPhase"
                                    data-testid="initiative-panel-dts-phase"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                                    value={formData.dtsPhase || ''}
                                    onChange={(e) => setFormData({ ...formData, dtsPhase: (e.target.value as DtsPhase) || undefined })}
                                >
                                    <option value="">— Not Set —</option>
                                    <option value="phase-1">Phase 1 — Register &amp; Expose</option>
                                    <option value="phase-2">Phase 2 — Integrate DPI</option>
                                    <option value="phase-3">Phase 3 — AI &amp; Legacy Exit</option>
                                    <option value="back-office">Back-Office Consolidation</option>
                                    <option value="not-dts">Not DTS</option>
                                </select>
                            </div>
                        )}

                        {(() => {
                            const related = dependencies.filter(
                                d => d.sourceId === formData.id || d.targetId === formData.id
                            );
                            if (related.length === 0) return null;
                            return (
                                <div data-testid="related-initiatives-section" className="pt-4 border-t border-slate-200 mt-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Related Initiatives</p>
                                    <ul className="space-y-1.5">
                                        {related.map(dep => {
                                            const otherId = dep.sourceId === formData.id ? dep.targetId : dep.sourceId;
                                            const other = initiatives.find(i => i.id === otherId);
                                            const isSource = dep.sourceId === formData.id;
                                            const label = dep.type === 'blocks'
                                                ? (isSource ? 'Blocking' : 'Blocked')
                                                : dep.type === 'requires'
                                                ? (isSource ? 'Required' : 'Required by')
                                                : 'Related to';
                                            return (
                                                <li key={dep.id} className="flex items-center gap-2 text-sm text-slate-700">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 w-20 flex-shrink-0">{label}</span>
                                                    <span className="font-medium">{other?.name ?? otherId}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })()}

                        <div className="pt-4 border-t border-slate-200 mt-2">
                            <p className="text-xs text-slate-500">ID: {formData.id}</p>
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    {onDelete && !formData.id.includes('new') && (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
                            title="Delete Initiative"
                        >
                            <Trash2 size={18} />
                            Delete Initiative
                        </button>
                    )}
                    <button
                        type="submit"
                        form="initiative-form"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
        <ConfirmModal
            isOpen={confirmDelete}
            title="Delete Initiative"
            message={`Sure you want to delete "${formData.name}"?`}
            confirmLabel="Delete"
            onConfirm={() => { setConfirmDelete(false); onDelete!(formData); }}
            onCancel={() => setConfirmDelete(false)}
        />
        </>
    );
}
