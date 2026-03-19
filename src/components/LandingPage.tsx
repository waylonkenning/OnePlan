import { Building2, GitMerge, MousePointer2, ShieldCheck, ArrowRight, Github, History, FileSpreadsheet } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-900 text-slate-50 font-sans selection:bg-blue-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Navigation / Header */}
        <header className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
              S
            </div>
            <span className="text-xl font-bold tracking-tight">Scenia</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onGetStarted}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Launch App
            </button>
            <a
              href="https://github.com/waylonkenning/scenia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Github size={16} />
              GitHub
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-32 max-w-7xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium mb-8"
          >
            Free & Open Source
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
          >
            Your IT Portfolio, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              The Complete Scene.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
          >
            Scenia gives you the full view — map initiatives across time, sequence dependencies, track costs, and report on progress. Free, private, and running entirely in your browser.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-4 w-full md:w-auto"
          >
            <button
              onClick={onGetStarted}
              className="group flex items-center justify-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm text-slate-500">No signup. No servers. Instantly ready.</p>
          </motion.div>

          {/* App Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full max-w-6xl mt-24 relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20" />
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="h-10 border-b border-slate-800 bg-slate-900/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
              <img
                src="/tutorial/2-visualiser.png"
                alt="Scenia Visualiser"
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </main>

        {/* Features Section */}
        <section className="bg-slate-950 py-32 border-t border-slate-800 relative z-10">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The full picture of your portfolio</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Every tool you need to survey, plan, and report on your IT landscape — all in one place.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              <FeatureCard
                icon={GitMerge}
                title="Dependency Mapping"
                description="Draw visual links between initiatives and milestones to sequence work and understand what blocks what. Trace the full critical path across your portfolio and highlight the longest dependency chain."
              />
              <FeatureCard
                icon={MousePointer2}
                title="Intuitive Canvas"
                description="Drag and resize initiatives directly on the timeline. Double-click to create, click to edit — set dates, status, progress, owner, assign team resources, and budget without leaving the view."
              />
              <FeatureCard
                icon={Building2}
                title="Conflict Detection"
                description="Automatically highlights overlapping initiatives on the same asset to flag delivery collisions before they happen. Toggle it on or off to suit your planning style."
              />
              <FeatureCard
                icon={History}
                title="Version History"
                description="Save named snapshots at any point, compare differences between versions side-by-side, and restore any previous state with a single click."
              />
              <FeatureCard
                icon={FileSpreadsheet}
                title="Excel & PDF Export"
                description="Import existing plans from Excel and export full datasets for stakeholders. Generate PDF or SVG snapshots of your timeline, and review budget totals, capacity report, and dependency summaries in the Reports view."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="100% Private"
                description="Your planning data never leaves your browser. No cloud, no account, no risk — stored locally via IndexedDB so your strategy stays yours alone."
              />
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="bg-slate-900 border-t border-slate-800 py-24 text-center relative z-10">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-6">Ready to see the full picture?</h2>
            <p className="text-slate-400 mb-10">No signup. No servers. Instantly ready.</p>
            <button
              onClick={onGetStarted}
              className="px-8 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
            >
              Start Planning
            </button>

            <div className="mt-16 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4 text-slate-500 text-sm">
                <a
                  href="https://github.com/waylonkenning/scenia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
                >
                  <Github size={14} />
                  GitHub
                </a>
                <span>·</span>
                <span>Apache 2.0</span>
              </div>
              <p className="text-slate-600 text-sm">
                Built by{' '}
                <a
                  href="https://kenning.co.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Kenning Corporation Limited
                </a>
              </p>
              <p className="text-slate-700 text-sm">&copy; {new Date().getFullYear()} Scenia.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col">
      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 mb-6 shrink-0 shadow-inner">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
