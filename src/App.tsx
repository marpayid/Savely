import { useState } from 'react';
import { Header } from './components/Header';
import { UrlInputSection } from './components/UrlInputSection';
import { SupportedFormats } from './components/SupportedFormats';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

export default function App() {
  const [urlInput, setUrlInput] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
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
          onToast={showToast}
        />

        <SupportedFormats />
        <FaqSection />
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
