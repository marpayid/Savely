import React from 'react';
import { Download } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/60 bg-slate-950/80 mt-auto py-8 text-center text-xs text-slate-500">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 font-semibold">
          <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Download className="w-3.5 h-3.5" />
          </div>
          <span>Savely</span>
        </div>
        <p className="max-w-md text-slate-500 leading-relaxed">
          Platform pengunduh berkas & media langsung berbasis web. Semua unduhan diproses secara aman tanpa penyimpanan berkas permanen di server.
        </p>
        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} Savely • Jumar All rights reserved.
        </p>
      </div>
    </footer>
  );
};
