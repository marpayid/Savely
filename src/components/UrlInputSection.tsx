import React, { useState } from 'react';
import {
  Download,
  Clipboard,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  Archive,
  File,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { FileMetadata, DownloadStatus, HistoryItem } from '../types';
import { formatBytes, addHistoryEntry, downloadFileViaBlob } from '../lib/utils';

interface UrlInputSectionProps {
  onHistoryUpdated: (newHistory: HistoryItem[]) => void;
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  urlInput: string;
  setUrlInput: (val: string) => void;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  onHistoryUpdated,
  onToast,
  urlInput,
  setUrlInput,
}) => {
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);

  // Helper for icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Video':
        return <Video className="w-5 h-5 text-purple-400" />;
      case 'Audio':
        return <Music className="w-5 h-5 text-pink-400" />;
      case 'Gambar':
        return <ImageIcon className="w-5 h-5 text-emerald-400" />;
      case 'Dokumen':
        return <FileText className="w-5 h-5 text-amber-400" />;
      case 'Arsip':
        return <Archive className="w-5 h-5 text-cyan-400" />;
      default:
        return <File className="w-5 h-5 text-blue-400" />;
    }
  };

  // Paste handler
  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrlInput(text.trim());
          setErrorMessage('');
          setStatus('idle');
          setFileMetadata(null);
          onToast('URL berhasil ditempel dari clipboard', 'success');
          return;
        }
      }
      onToast('Silakan tempel URL secara manual (Ctrl+V / Cmd+V)', 'info');
    } catch {
      onToast('Izin clipboard dibatasi. Gunakan tempel manual.', 'info');
    }
  };

  // Clear handler
  const handleClear = () => {
    setUrlInput('');
    setStatus('idle');
    setStatusMessage('');
    setErrorMessage('');
    setFileMetadata(null);
    onToast('Input URL dibersihkan', 'info');
  };

  // Main Inspect & Download Trigger
  const handleStartDownload = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || urlInput).trim();

    if (!targetUrl) {
      setErrorMessage('Silakan masukkan URL media terlebih dahulu.');
      setStatus('error');
      return;
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      setErrorMessage('URL tidak valid. URL harus dimulai dengan http:// atau https://');
      setStatus('error');
      return;
    }

    // Reset state
    setErrorMessage('');
    setFileMetadata(null);
    setStatus('inspecting');
    setStatusMessage('Memvalidasi dan memeriksa URL media...');

    try {
      const inspectRes = await fetch(`/api/inspect?url=${encodeURIComponent(targetUrl)}`);
      const data = await inspectRes.json();

      if (!data.ok) {
        const errorText = data.error || 'URL ini tidak menyediakan file yang dapat diunduh secara langsung.';
        setErrorMessage(errorText);
        setStatus('error');

        // Add failed history entry
        const updatedHistory = addHistoryEntry({
          filename: targetUrl.split('/').pop() || 'Unknown File',
          url: targetUrl,
          status: 'Gagal',
          fileSize: 0,
          extension: 'UNK',
          category: 'Error',
          errorMessage: errorText,
        });
        onHistoryUpdated(updatedHistory);
        return;
      }

      // Metadata received successfully
      const meta: FileMetadata = {
        filename: data.filename,
        fileSize: data.fileSize,
        contentType: data.contentType,
        extension: data.extension,
        category: data.category,
        url: data.url,
      };

      setFileMetadata(meta);
      setStatus('downloading');
      setStatusMessage('Mengunduh data berkas...');

      // Initiate file download via Blob to force browser file save
      const downloadTargetUrl = data.downloadUrl || targetUrl;
      await downloadFileViaBlob(downloadTargetUrl, data.filename, (msg) => setStatusMessage(msg));

      // Finish state
      setStatus('success');
      setStatusMessage('Download berhasil');
      onToast('Download berhasil!', 'success');

      // Save to localStorage history
      const updatedHistory = addHistoryEntry({
        filename: data.filename,
        url: targetUrl,
        status: 'Sukses',
        fileSize: data.fileSize,
        extension: data.extension,
        category: data.category,
      });
      onHistoryUpdated(updatedHistory);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga saat menghubungi server.';
      setErrorMessage(msg);
      setStatus('error');

      const updatedHistory = addHistoryEntry({
        filename: targetUrl,
        url: targetUrl,
        status: 'Gagal',
        fileSize: 0,
        extension: 'ERR',
        category: 'Error',
        errorMessage: msg,
      });
      onHistoryUpdated(updatedHistory);
    }
  };

  return (
    <section className="w-full pt-8 pb-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        {/* Main Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
          Savely Downloader
        </h1>
        <p className="text-base sm:text-lg text-slate-300 font-normal max-w-xl mx-auto mb-8">
          Download your media files quickly and easily.
        </p>

        {/* Input Card Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-blue-950/20 backdrop-blur-xl text-left">
          <label htmlFor="url-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            URL File / Media
          </label>

          {/* Large Input Box + Control Buttons */}
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1 min-w-0">
              <input
                id="url-input"
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (status !== 'idle') {
                    setStatus('idle');
                    setErrorMessage('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStartDownload();
                  }
                }}
                placeholder="Paste media URL here..."
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-base outline-none transition duration-200 pr-20"
                disabled={status === 'inspecting' || status === 'downloading'}
              />

              {/* Paste & Clear action buttons inside input */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {urlInput && (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Hapus URL"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition duration-150 active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  title="Tempel URL dari Clipboard"
                  className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition duration-150 active:scale-95"
                >
                  <Clipboard className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden xs:inline">Paste</span>
                </button>
              </div>
            </div>

            {/* Download Main Button */}
            <button
              type="button"
              onClick={() => handleStartDownload()}
              disabled={status === 'inspecting' || status === 'downloading'}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
            >
              {status === 'inspecting' || status === 'downloading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>

          {/* Status & Feedback Area */}
          <div className="mt-4">
            {/* Loading Indicator */}
            {(status === 'inspecting' || status === 'downloading') && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400 flex-shrink-0" />
                <span className="font-medium">{statusMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-200">Gagal Mengunduh</p>
                  <p className="text-xs sm:text-sm text-rose-300/90 mt-0.5 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Success Status Banner */}
            {status === 'success' && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-200">Download berhasil!</span>
                  <p className="text-xs text-emerald-300/80 mt-0.5">
                    File telah berhasil diproses dan dikirim ke folder unduhan browser Anda.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Information Card (If inspected successfully) */}
          {fileMetadata && (
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                <span>Informasi File Terdeteksi</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {fileMetadata.extension}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
                    {getCategoryIcon(fileMetadata.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate" title={fileMetadata.filename}>
                      {fileMetadata.filename}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{formatBytes(fileMetadata.fileSize)}</span>
                      <span>•</span>
                      <span>{fileMetadata.category}</span>
                      <span>•</span>
                      <span className="truncate max-w-[140px] text-slate-500">{fileMetadata.contentType}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      onToast('Mengunduh ulang berkas...', 'info');
                      await downloadFileViaBlob(fileMetadata.url, fileMetadata.filename);
                      onToast('Download berhasil!', 'success');
                    } catch (err: unknown) {
                      const msg = err instanceof Error ? err.message : 'Gagal mengunduh.';
                      onToast(msg, 'error');
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition duration-150"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Unduh Lagi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
