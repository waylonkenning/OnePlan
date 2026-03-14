import React from "react";
import {
  X,
  BookOpen,
  Layers,
  MousePointer2,
  Settings2,
  DownloadCloud,
  HardDrive,
} from "lucide-react";

interface FeaturesModalProps {
  onClose: () => void;
}

const featureSections = [
  {
    title: "Navigation & Setup",
    icon: <Layers className="w-5 h-5 text-blue-500" />,
    items: [
      {
        title: "Safe & Secure Storage",
        itemIcon: (
          <HardDrive className="w-16 h-16 text-slate-300 mx-auto my-12" />
        ),
        desc: "Your data is saved directly on your computer via IndexedDB, a part of your local browser storage. Nothing is sent to the cloud, ensuring complete privacy.",
      },
      {
        title: "Global Search",
        image: "/features/global-search.png",
        desc: "Looking for a specific project? The search bar finds it instantly across all views.",
      },
      {
        title: "View Switching",
        image: "/features/view_switching_1773456994090.webp",
        desc: "Easily switch between the visual timeline and the spreadsheet view with one click.",
      },
    ],
  },
  {
    title: "Using the Visualiser",
    icon: <MousePointer2 className="w-5 h-5 text-indigo-500" />,
    items: [
      {
        title: "Drag and Drop",
        image: "/features/drag_and_drop_fixed_v3.webp",
        desc: "Move projects left or right to change their dates, or drag the edges to make them longer or shorter.",
      },
      {
        title: "Drawing Connections",
        image: "/features/drawing_connectors_1773457854128.webp",
        desc: "Click and drag a line from one project to another to show that they depend on each other.",
      },
      {
        title: "Spotting Problems",
        image: "/features/spotting_problems_1773458485875.webp",
        desc: "If two projects overlap on the same track, a red warning icon appears to alert you of a scheduling conflict.",
      },
      {
        title: "Grouping Projects",
        image: "/features/grouping_projects_fixed_v3.webp",
        desc: "Click a category name to neatly fold multiple related projects into one single row to save space.",
      },
    ],
  },
  {
    title: "Managing Data",
    icon: <Settings2 className="w-5 h-5 text-emerald-500" />,
    items: [
      {
        title: "Spreadsheet Editing",
        image: "/features/inline-editing.png",
        desc: "Update names, dates, and budgets quickly in a familiar table format without switching screens.",
      },
      {
        title: "Adjustable Columns",
        image: "/features/column-resize.png",
        desc: "Drag the lines between headings to make columns wider or narrower to fit your screen.",
      },
    ],
  },
];

export function FeaturesModal({ onClose }: FeaturesModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div
        role="dialog"
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                OnePlan Features & Capabilities
              </h2>
              <p className="text-sm text-slate-500">
                Comprehensive overview of application functionality
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-features-modal"
            aria-label="Close Features"
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="flex flex-col gap-12 max-w-2xl mx-auto">
            {featureSections.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  {section.icon}
                  <h3 className="text-xl font-bold text-slate-800">
                    {section.title}
                  </h3>
                </div>

                <div className="flex flex-col gap-8">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {(item as any).image ? (
                        <div className="w-full h-48 bg-slate-100 border-b border-slate-100 overflow-hidden">
                          <img
                            src={(item as any).image}
                            alt={item.title}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      ) : (item as any).itemIcon ? (
                        <div className="w-full h-48 bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center">
                          {(item as any).itemIcon}
                        </div>
                      ) : null}
                      <div className="flex items-start gap-4 p-5">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 shadow-sm" />
                        <div>
                          <h4 className="text-base font-bold text-slate-900 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 rounded-b-2xl">
          <p className="text-xs text-center text-slate-500">
            OnePlan is continually evolving. Additional capabilities and
            refinements are added regularly.
          </p>
        </div>
      </div>
    </div>
  );
}
