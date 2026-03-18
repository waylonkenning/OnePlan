import React from "react";
import {
  X,
  BookOpen,
  Layers,
  MousePointer2,
  Settings2,
  HardDrive,
  GitBranch,
  Palette,
  User,
  Flag,
  History,
  Smartphone,
  BarChart2,
  FileSpreadsheet,
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
        desc: "Your data is saved directly on your computer via IndexedDB — a part of your local browser storage. Nothing is sent to the cloud, ensuring complete privacy.",
      },
      {
        title: "Global Search",
        image: "/features/global-search.png",
        desc: "Looking for a specific initiative? The search bar instantly filters the timeline and Data Manager simultaneously across all views.",
      },
      {
        title: "View Switching",
        image: "/features/view-switching.png",
        desc: "Switch between the Visualiser timeline, Data Manager spreadsheet, and Reports view with one click. Your data stays in sync across all three.",
      },
    ],
  },
  {
    title: "Using the Visualiser",
    icon: <MousePointer2 className="w-5 h-5 text-indigo-500" />,
    items: [
      {
        title: "Drag, Drop & Resize",
        image: "/features/move-resize.png",
        desc: "Move initiatives left or right to reschedule them, or drag either edge to adjust start and end dates. Double-click any empty timeline space to create a new initiative instantly.",
      },
      {
        title: "Dependency Mapping",
        image: "/features/dependency.png",
        desc: "Draw visual links between initiatives to show sequencing. Drag vertically from one bar to another to create a dependency. Edit, reverse, or remove relationships directly on the canvas.",
      },
      {
        title: "Conflict Detection",
        image: "/features/conflict.png",
        desc: "Overlapping initiatives on the same asset are automatically flagged with a conflict marker. Toggle detection on or off to suit your planning style.",
      },
      {
        title: "Grouping & Collapsing",
        image: "/features/grouped.png",
        desc: "Collapse multiple related initiatives into a single grouped bar to reduce clutter. Group the entire timeline by Programme or Strategy instead of the default asset view.",
      },
      {
        title: "Critical Path Highlighting",
        itemIcon: (
          <GitBranch className="w-16 h-16 text-slate-300 mx-auto my-12" />
        ),
        desc: "Highlight the longest dependency chain across your plan. Critical path bars and arrows are visually distinct so you can see immediately which work drives your end date.",
      },
      {
        title: "Colour by Status",
        image: "/features/colour-by-status.png",
        desc: "Switch initiative bar colouring from Programme or Strategy to Status — Planned, Active, Done, or Cancelled — for an instant health-check view of your portfolio.",
      },
    ],
  },
  {
    title: "Initiative Detail",
    icon: <Flag className="w-5 h-5 text-rose-500" />,
    items: [
      {
        title: "Progress & Owner",
        image: "/tutorial/3-interactive.png",
        desc: "Record a % complete and assign an owner to every initiative. Owner initials appear as a badge on the timeline bar, and the progress fill gives an at-a-glance completion view.",
      },
      {
        title: "Milestone Dependencies",
        image: "/features/milestone-dependency.png",
        desc: "Draw a dependency from a milestone to an initiative to indicate the initiative can't start until that date milestone is reached. Milestone dependencies appear as arrows and are included in the dependency report.",
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
        desc: "Update names, dates, budgets, status, progress, and owner quickly in a familiar table format. Switch between Initiatives, Assets, Programmes, Strategies, Milestones, and Resources tabs.",
      },
      {
        title: "Resources & Capacity",
        image: "/features/capacity.png",
        desc: "Define your team in the Resources tab — named people or generic roles. Assign an owner and additional team members to each initiative. The Capacity Report in Reports view shows every resource's initiative assignments at a glance.",
      },
      {
        title: "Adjustable Columns",
        image: "/features/column-resize.png",
        desc: "Drag the lines between column headers to make columns wider or narrower. Column widths persist across sessions.",
      },
      {
        title: "Excel Import & Export",
        itemIcon: (
          <FileSpreadsheet className="w-16 h-16 text-slate-300 mx-auto my-12" />
        ),
        desc: "Import an existing plan from Excel to seed your data. Export the full dataset as an Excel workbook for stakeholders, or generate a PDF or SVG snapshot of the current timeline view.",
      },
    ],
  },
  {
    title: "Reports & Insights",
    icon: <BarChart2 className="w-5 h-5 text-violet-500" />,
    items: [
      {
        title: "Budget & Capacity Reports",
        image: "/tutorial/4-insights.png",
        desc: "The Reports view shows total spend broken down by Programme, Strategy, and Category, plus a Capacity Report listing every resource's initiative assignments. Budget totals update live as you edit initiative values.",
      },
      {
        title: "Version History",
        image: "/features/version-history.png",
        desc: "Save named snapshots of your plan at any point and compare differences between versions side-by-side. Restore any previous state with a single click.",
      },
    ],
  },
  {
    title: "Mobile",
    icon: <Smartphone className="w-5 h-5 text-sky-500" />,
    items: [
      {
        title: "Mobile Card View",
        itemIcon: (
          <Smartphone className="w-16 h-16 text-slate-300 mx-auto my-12" />
        ),
        desc: "On mobile devices, the Visualiser switches to a card-based layout — one card per asset, grouped by Timeline, Quarter, Year, Programme, or Strategy. Tap any initiative row to open the edit panel.",
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
                  {section.items.map((item, itemIdx) => {
                    const hasImage = !!(item as any).image;
                    const hasIcon = !!(item as any).itemIcon;
                    if (hasImage) {
                      return (
                        <div
                          key={itemIdx}
                          data-testid="feature-card-image"
                          className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="w-full h-48 bg-slate-100 border-b border-slate-100 overflow-hidden">
                            <img
                              src={(item as any).image}
                              alt={item.title}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div className="flex items-start gap-4 p-5">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 shadow-sm" />
                            <div>
                              <h4 className="text-base font-bold text-slate-900 mb-1">{item.title}</h4>
                              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    // Compact card — icon-only feature, no screenshot
                    return (
                      <div
                        key={itemIdx}
                        data-testid="feature-card-compact"
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4 p-5">
                          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            {hasIcon
                              ? React.cloneElement((item as any).itemIcon as React.ReactElement, { className: 'w-5 h-5 text-slate-400' })
                              : <div className="w-2 h-2 rounded-full bg-blue-500" />
                            }
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900 mb-1">{item.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
