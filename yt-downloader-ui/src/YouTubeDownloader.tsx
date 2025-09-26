import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { URLInputSection } from './components/URLInputSection';
import { AnalysisSection } from './components/AnalysisSection';
import { OptionsSection } from './components/OptionsSection';
import { QueueSection } from './components/QueueSection';
import { HelpOverlay, QAPanel, ToastContainer } from './components/Overlays';

const YouTubeDownloaderUI: React.FC = () => {
  const { showHelp, setShowHelp, showQAPanel, setShowQAPanel, qaTests, toasts } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-amber-300 text-black px-3 py-1 rounded">
        Skip to content
      </a>

      <Header />

      <main id="main" className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <URLInputSection />

        <section className="grid lg:grid-cols-12 gap-6">
          <AnalysisSection />
          <OptionsSection />
        </section>

        <QueueSection />
      </main>

      <HelpOverlay open={showHelp} onClose={() => setShowHelp(false)} />
      <QAPanel open={showQAPanel} onClose={() => setShowQAPanel(false)} tests={qaTests} />
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default YouTubeDownloaderUI;