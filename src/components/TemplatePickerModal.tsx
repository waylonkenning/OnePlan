import { useRef } from 'react';
import { WORKSPACE_TEMPLATES, TemplateId } from '../lib/workspaceTemplates';

interface TemplatePickerModalProps {
  onSelect: (templateId: TemplateId, withDemoData: boolean) => void;
  onViewerImport: (file: File) => void;
  isReset?: boolean;
}

export function TemplatePickerModal({ onSelect, onViewerImport, isReset = false }: TemplatePickerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      data-testid="template-picker-modal"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {isReset ? 'Clear data and start again' : 'Welcome to Scenia'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isReset
              ? 'Choose a template below. This will permanently replace all your current data.'
              : 'Choose a starting template for your IT portfolio'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6">
          {WORKSPACE_TEMPLATES.map((template) => (
            <div
              key={template.id}
              data-testid={`template-card-${template.id}`}
              className="border border-slate-200 rounded-xl p-5 flex flex-col gap-2 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-slate-800 text-sm">{template.name}</h3>
              <p className="text-sm text-slate-500 flex-1 leading-relaxed">{template.description}</p>
              <p className="text-xs text-indigo-500 font-medium">{template.tagline}</p>

              {template.id === 'blank' ? (
                <button
                  data-testid="template-start-blank-btn"
                  onClick={() => onSelect(template.id, false)}
                  className="mt-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Start blank
                </button>
              ) : template.id === 'viewer' ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    data-testid="template-viewer-file-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onViewerImport(file);
                    }}
                  />
                  <button
                    data-testid="template-viewer-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Upload file
                  </button>
                </>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    data-testid={`template-select-with-demo-btn-${template.id}`}
                    onClick={() => onSelect(template.id, true)}
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    With demo data
                  </button>
                  <button
                    data-testid={`template-select-no-demo-btn-${template.id}`}
                    onClick={() => onSelect(template.id, false)}
                    className="px-4 py-2 text-sm font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors"
                  >
                    Without demo data
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
