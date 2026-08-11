import React from 'react';
import { Video, Music, Image as ImageIcon, FileText, Archive, Shield, CheckCircle2 } from 'lucide-react';

export const SupportedFormats: React.FC = () => {
  const categories = [
    {
      title: 'Video',
      icon: <Video className="w-5 h-5 text-purple-400" />,
      formats: ['MP4', 'WebM', 'MOV', 'MKV', 'AVI', 'FLV'],
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Audio',
      icon: <Music className="w-5 h-5 text-pink-400" />,
      formats: ['MP3', 'WAV', 'AAC', 'FLAC', 'OGG', 'M4A'],
      bgColor: 'bg-pink-500/10 border-pink-500/20',
    },
    {
      title: 'Gambar',
      icon: <ImageIcon className="w-5 h-5 text-emerald-400" />,
      formats: ['JPG', 'JPEG', 'PNG', 'GIF', 'WebP', 'SVG'],
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Dokumen',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      formats: ['PDF', 'DOCX', 'TXT', 'CSV', 'XLSX', 'JSON'],
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Arsip & Berkas',
      icon: <Archive className="w-5 h-5 text-cyan-400" />,
      formats: ['ZIP', 'RAR', '7Z', 'TAR', 'GZ', 'APK', 'DMG'],
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 my-10">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Format File Terdukung</h3>
            <p className="text-xs text-slate-400">
              Pengunduh mendukung seluruh tautan file media langsung dari server publik.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start gap-3"
            >
              <div className={`p-2 rounded-lg border flex-shrink-0 ${cat.bgColor}`}>
                {cat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-200 block mb-1">
                  {cat.title}
                </span>
                <div className="flex flex-wrap gap-1">
                  {cat.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-300 block mb-0.5">Ketentuan Layanan</span>
            Sistem ini hanya mengunduh file dari URL yang menyediakan akses langsung publik.
            Tidak membypass DRM, login, atau proteksi hak cipta platform.
          </div>
        </div>
      </div>
    </section>
  );
};
