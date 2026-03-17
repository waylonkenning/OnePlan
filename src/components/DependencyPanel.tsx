import React, { useState, useEffect } from 'react';
import { Dependency, Initiative } from '../types';
import { X, Save, Trash2, ArrowLeftRight } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { useFocusTrap } from '../lib/useFocusTrap';

interface DependencyPanelProps {
    dependency: Dependency | null;
    initiatives: Initiative[];
    onClose: () => void;
    onSave: (dependency: Dependency) => void;
    onDelete?: (dependency: Dependency) => void;
    isOpen: boolean;
}

export function DependencyPanel({ dependency, initiatives, onClose, onSave, onDelete, isOpen }: DependencyPanelProps) {
    const [formData, setFormData] = useState<Dependency | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const panelRef = useFocusTrap(isOpen, onClose);

    useEffect(() => {
        if (dependency) {
            setFormData({ ...dependency });
        }
    }, [dependency]);

    if (!isOpen || !formData) return null;

    const sourceInit = initiatives.find(i => i.id === formData.sourceId);
    const targetInit = initiatives.find(i => i.id === formData.targetId);
    const sourceName = sourceInit?.name || 'Unknown';
    const targetName = targetInit?.name || 'Unknown';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleReverse = () => {
        setFormData({
            ...formData,
            sourceId: formData.targetId,
            targetId: formData.sourceId
        });
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getDescription = (type: Dependency['type'], src: string, tgt: string) => {
        if (type === 'blocks') return `${src} must finish before ${tgt} can start.`;
        if (type === 'requires') return `${src} requires ${tgt} to be complete first.`;
        return `${src} and ${tgt} have a general connection.`;
    };

    return (
        <>
        <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex justify-end"
            onClick={handleOverlayClick}
            data-testid="dependency-panel"
        >
            <div ref={panelRef} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800">Edit Relationship</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="dependency-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Source</p>
                                <p data-testid="dep-source-name" className="text-sm font-semibold text-slate-800 break-words">{sourceName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleReverse}
                                className="p-2 bg-white border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 transition-all shadow-sm flex-shrink-0"
                                title="Reverse Direction"
                            >
                                <ArrowLeftRight size={18} />
                            </button>
                            <div className="flex-1 min-w-0 text-right">
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Target</p>
                                <p data-testid="dep-target-name" className="text-sm font-semibold text-slate-800 break-words">{targetName}</p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="depType" className="block text-sm font-medium text-slate-700 mb-1">
                                Relationship Type
                            </label>
                            <select
                                id="depType"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as Dependency['type'] })}
                            >
                                <option value="blocks">Blocks</option>
                                <option value="requires">Requires</option>
                                <option value="related">Related</option>
                            </select>
                            <p data-testid="dep-description" className="mt-2 text-xs text-slate-500">
                                {getDescription(formData.type, sourceName, targetName)}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-200 mt-6">
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
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
                            title="Delete Relationship"
                        >
                            <Trash2 size={18} />
                            Delete Relationship
                        </button>
                    )}
                    <button
                        type="submit"
                        form="dependency-form"
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
            title="Delete Relationship"
            message="Are you sure you want to delete this relationship?"
            confirmLabel="Delete"
            onConfirm={() => { setConfirmDelete(false); onDelete!(formData); }}
            onCancel={() => setConfirmDelete(false)}
        />
    </>
    );
}
