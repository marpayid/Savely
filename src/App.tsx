import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInputSection } from './components/UrlInputSection';
import { SampleLinks } from './components/SampleLinks';
import { HistoryList } from './components/HistoryList';
import { SupportedFormats } from './components/SupportedFormats';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { HistoryItem } from './types';
import { loadHistoryFromStorage } from './lib/utils';

export default function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [urlInput, setUrlInput] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    setHistory(loadHistoryFromStorage());
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
  };

  const handleSelectSample = (url: string) => {
    setUrlInput(url);
    showToast('URL sampel dipilih. Klik Download untuk menguji.', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoryUrl = (url: string) => {
    setUrlInput(url);
    showToast('URL dari riwayat dimuat ke kolom input.', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased">
      {/* Background radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 z-10">
        <UrlInputSection
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          onHistoryUpdated={setHistory}
          onToast={showToast}
        />

        <SampleLinks onSelectSample={handleSelectSample} />

        <HistoryList
          history={history}
          onHistoryUpdated={setHistory}
          onToast={showToast}
          onSelectUrl={handleSelectHistoryUrl}
        />

        <SupportedFormats />
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Alerts */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
