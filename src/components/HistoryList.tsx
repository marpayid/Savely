import React, { useState } from 'react';
import {
  History,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Copy,
  Search,
  ExternalLink,
  Video,
  Music,
  Image as ImageIcon,
  FileText,
  Archive,
  File,
} from 'lucide-react';
import { HistoryItem } from '../types';
import { formatBytes, clearAllHistory, removeHistoryEntry, downloadFileViaBlob } from '../lib/utils';

interface HistoryListProps {
  history: HistoryItem[];
  onHistoryUpdated: (newHistory: HistoryItem[]) => void;
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSelectUrl: (url: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onHistoryUpdated,
  onToast,
  onSelectUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredHistory = history.filter(
    (item) =>
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.extension.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    const updated = clearAllHistory();
    onHistoryUpdated(updated);
    setConfirmClear(false);
    onToast('Seluruh riwayat unduhan telah dihapus', 'info');
  };

  const handleDeleteItem = (id: string, filename: string) => {
    const updated = removeHistoryEntry(id);
    onHistoryUpdated(updated);
    onToast(`Riwayat "${filename.substring(0, 20)}..." dihapus`, 'info');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    onToast('URL disalin ke clipboard', 'success');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Video':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'Audio':
        return <Music className="w-4 h-4 text-pink-400" />;
      case 'Gambar':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'Dokumen':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'Arsip':
        return <Archive className="w-4 h-4 text-cyan-400" />;
      default:
        return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 my-10">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Riwayat Download Lokal</h2>
              <p className="text-xs text-slate-400">
                Tersimpan di penyimpanan lokal browser ({history.length} item)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAll}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition duration-150 flex items-center gap-1.5 ${
                  confirmClear
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmClear ? 'Yakin Hapus Semua?' : 'Hapus Riwayat'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Bar if history is not empty */}
        {history.length > 0 && (
          <div className="relative mt-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari riwayat berdasarkan nama file, URL, atau ekstensi..."
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 outline-none transition"
            />
          </div>
        )}

        {/* Empty History State */}
        {history.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">Belum ada riwayat pengunduhan</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              File yang Anda unduh akan muncul di sini secara otomatis.
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">Tidak ada riwayat yang cocok dengan "{searchTerm}"</p>
          </div>
        ) : (
          /* History Items List */
          <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 transition duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left File Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-sm font-semibold text-white leading-snug break-words max-w-full"
                        style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                        title={item.filename}
                      >
                        {item.filename}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          item.status === 'Sukses'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {item.extension}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        {item.status === 'Sukses' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-400" />
                        )}
                        <span className={item.status === 'Sukses' ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                          {item.status}
                        </span>
                      </span>
                      <span>•</span>
                      <span>{item.date}</span>
                      {item.fileSize > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatBytes(item.fileSize)}</span>
                        </>
                      )}
                    </div>

                    {item.errorMessage && (
                      <p className="text-[11px] text-rose-300/80 mt-1 line-clamp-1">{item.errorMessage}</p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => onSelectUrl(item.url)}
                    title="Muat URL di Input"
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition text-xs flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="sm:hidden">Pilih</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.url)}
                    title="Salin URL"
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {item.status === 'Sukses' && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          onToast('Mengunduh file dari riwayat...', 'info');
                          await downloadFileViaBlob(item.url, item.filename);
                          onToast('Download berhasil!', 'success');
                        } catch (err: unknown) {
                          const msg = err instanceof Error ? err.message : 'Gagal mengunduh.';
                          onToast(msg, 'error');
                        }
                      }}
                      title="Unduh Lagi"
                      className="px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, item.filename)}
                    title="Hapus dari Riwayat"
                    className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-900 hover:bg-rose-500/10 rounded-lg border border-slate-800 hover:border-rose-500/20 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
