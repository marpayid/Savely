import React from 'react';
import { Video, Music, Image as ImageIcon, FileText, Archive } from 'lucide-react';
import { SAMPLE_LINKS } from '../data/sampleLinks';

interface SampleLinksProps {
  onSelectSample: (url: string) => void;
}

export const SampleLinks: React.FC<SampleLinksProps> = ({ onSelectSample }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Video':
        return <Video className="w-3.5 h-3.5 text-purple-400" />;
      case 'Audio':
        return <Music className="w-3.5 h-3.5 text-pink-400" />;
      case 'Gambar':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Dokumen':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case 'Arsip':
        return <Archive className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-8">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span>Coba URL Sampel Langsung</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {SAMPLE_LINKS.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => onSelectSample(sample.url)}
            className="flex flex-col items-start p-2.5 bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl transition duration-150 text-left group active:scale-95"
          >
            <div className="flex items-center gap-1.5 mb-1">
              {getIcon(sample.category)}
              <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition">
                {sample.ext}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 truncate w-full">
              {sample.label}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">{sample.sizeText}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
