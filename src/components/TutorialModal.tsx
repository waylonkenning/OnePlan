import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

const slides = [
  {
    title: 'Welcome to Scenia',
    text: 'Scenia is a complete initiative planning tool. Map your work across time, track costs and sequencing, understand dependencies, and report on progress — all in one place, with no data leaving your browser.',
    image: '/tutorial/1-overview.png',
  },
  {
    title: 'The Timeline',
    text: 'Your plan lives on a scrollable timeline grouped by asset or team. Zoom in for a quarterly view or out for a three-year picture. Colour initiatives by programme, strategy, or status; highlight the critical path; and toggle on resource names or conflict markers to suit your planning style.',
    image: '/tutorial/2-visualiser.png',
  },
  {
    title: 'Adding & Editing Initiatives',
    text: 'Double-click anywhere on the timeline to create a new initiative at that date. Click any bar to open the edit panel — set the status, track progress, assign an owner and team resources, record a budget, and draw dependencies to related work.',
    image: '/tutorial/3-interactive.png',
  },
  {
    title: 'Data Manager',
    text: 'Switch to the Data Manager for spreadsheet-style editing across all your data: initiatives, assets, programmes, strategies, milestones, and resources. Paste CSV rows, sort columns, and import or export to Excel.',
    image: '/tutorial/5-data-manager.png',
  },
  {
    title: 'Reports',
    text: 'The Reports view gives you budget summaries by programme, strategy, and category; a capacity report showing initiative assignments per resource; a full dependency report; and a version history to compare your plan over time. On mobile, initiatives appear as scrollable cards grouped by timeline, quarter, or programme.',
    image: '/tutorial/4-insights.png',
  },
];

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slide = slides[currentSlide];
  const isLastSync = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">
        
        {/* Header / Top actions */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* Skip button if not on the last slide */}
          {!isLastSync && (
             <button
               onClick={onClose}
               className="text-slate-400 hover:text-slate-600 px-3 py-1.5 text-xs font-semibold bg-white/80 backdrop-blur rounded-md border border-slate-200 transition-colors"
             >
               Skip
             </button>
          )}
          {/* Close icon */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-600 bg-white/80 backdrop-blur rounded-md border border-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Image Area */}
        <div className="h-80 bg-slate-100 flex items-center justify-center border-b border-slate-200 overflow-hidden relative">
          <img 
            src={slide.image} 
            alt={slide.title}
            className="w-full h-full object-cover object-top"
          />
          {/* Gradient overlay to ensure top buttons are somewhat readable if image is light */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
        </div>

        {/* Content Area */}
        <div className="p-8 pb-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{slide.title}</h2>
          <p className="text-slate-600 leading-relaxed mb-6 flex-1 min-h-[4rem]">
            {slide.text}
          </p>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Nav Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isLastSync 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
              >
                {isLastSync ? (
                  <>Finish <Check size={16} /></>
                ) : (
                  <>Next <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
