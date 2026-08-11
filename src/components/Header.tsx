import React from 'react';
import { Download, ShieldCheck, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
            <Download className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Savely
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </span>
          </div>
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aman & Bebas DRM</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Fast Server</span>
          </div>
        </div>
      </div>
    </header>
  );
};
