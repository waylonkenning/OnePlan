import React from 'react';
import { Dependency, Initiative } from '../types';
import { GitBranch } from 'lucide-react';

interface ArrowDisambiguatorProps {
  x: number;
  y: number;
  candidates: Dependency[];
  initiatives: Initiative[];
  onSelect: (depId: string) => void;
  onClose: () => void;
}

export function ArrowDisambiguator({ x, y, candidates, initiatives, onSelect, onClose }: ArrowDisambiguatorProps) {
  const getName = (id: string) => initiatives.find(i => i.id === id)?.name ?? 'Unknown';

  // Keep the popover on screen
  const left = Math.min(x, window.innerWidth - 280);
  const top = Math.min(y, window.innerHeight - (candidates.length * 44 + 48));

  return (
    <>
      {/* invisible backdrop to close on outside click */}
      <div className="fixed inset-0 z-[149]" onClick={onClose} />
      <div
        data-testid="arrow-disambiguator"
        className="fixed z-[150] bg-white rounded-xl shadow-2xl border border-slate-200 py-2 min-w-[240px] max-w-[320px]"
        style={{ left, top }}
      >
        <p className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select relationship</p>
        {candidates.map(dep => {
          const src = getName(dep.sourceId);
          const tgt = getName(dep.targetId);
          const color = dep.type === 'blocks' ? 'text-red-600' : dep.type === 'requires' ? 'text-blue-600' : 'text-slate-500';
          return (
            <button
              key={dep.id}
              data-testid="disambiguator-item"
              onClick={() => { onSelect(dep.id); }}
              className="w-full flex items-start gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
            >
              <GitBranch size={13} className={`mt-0.5 flex-shrink-0 ${color}`} />
              <span className="text-xs text-slate-700 leading-snug">
                <span className="font-medium">{src}</span>
                <span className={`mx-1 font-semibold ${color}`}>{dep.type}</span>
                <span className="font-medium">{tgt}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
