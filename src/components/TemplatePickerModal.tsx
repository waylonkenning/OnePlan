import { WORKSPACE_TEMPLATES, TemplateId } from '../lib/workspaceTemplates';

interface TemplatePickerModalProps {
  onSelect: (templateId: TemplateId) => void;
}

export function TemplatePickerModal({ onSelect }: TemplatePickerModalProps) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      data-testid="template-picker-modal"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Welcome to Scenia</h2>
          <p className="text-sm text-slate-500 mt-1">
            Choose a starting template for your IT portfolio
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
              <button
                data-testid={`template-select-btn-${template.id}`}
                onClick={() => onSelect(template.id)}
                className="mt-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Start with this template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
