import React from 'react';
import { BarChart2 } from 'lucide-react';

export function ReportsView() {
  return (
    <div data-testid="reports-view" className="h-full flex flex-col items-center justify-center gap-4 text-slate-400 p-8">
      <BarChart2 size={48} className="text-slate-200" />
      <p className="text-sm font-medium text-slate-500">Reports</p>
      <p className="text-xs text-center max-w-xs">
        Reports will appear here. Use the History Differences and Initiative Dependencies reports from the options below.
      </p>
    </div>
  );
}
