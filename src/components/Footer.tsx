import React from 'react';
import { Download } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/60 bg-slate-950/80 mt-auto py-10 text-center text-xs text-slate-500">
      <div className="max-w-3xl mx-auto px-4 flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-base">
            <img
              src="https://cdn.phototourl.com/free/2026-08-12-fbc1986f-c197-48c4-a29b-a7ea3802232b.jpg"
              alt="Savely Logo"
              className="w-6 h-6 rounded-lg object-cover border border-slate-700/50"
            />
            <span>Savely</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Simple. Fast. Download.</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <a href="#" className="hover:text-slate-200 transition-colors">Beranda</a>
          <span className="text-slate-600">·</span>
          <a href="#" className="hover:text-slate-200 transition-colors">FAQ</a>
          <span className="text-slate-600">·</span>
          <a href="#" className="hover:text-slate-200 transition-colors">Kebijakan Privasi</a>
          <span className="text-slate-600">·</span>
          <a href="#" className="hover:text-slate-200 transition-colors">Kontak</a>
        </nav>

        <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-900 w-full max-w-xs">
          © {new Date().getFullYear()} Savely • Jumar All rights reserved.
        </p>
      </div>
    </footer>
  );
};
