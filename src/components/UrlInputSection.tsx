import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Play,
  Heart,
  MessageCircle,
  Share2,
  User,
  RotateCcw,
} from 'lucide-react';
import { FileMetadata, DownloadStatus } from '../types';
import { formatBytes, downloadFileViaBlob, getApiBaseUrl, resolveMediaClientSide } from '../lib/utils';

interface UrlInputSectionProps {
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  urlInput: string;
  setUrlInput: (val: string) => void;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  onToast,
  urlInput,
  setUrlInput,
}) => {
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);

  // Helper for formatting stat numbers (e.g. 1.2M, 45.2K)
  const formatStatNumber = (num: number | string | undefined): string | null => {
    if (num === undefined || num === null || num === '') return null;
    const n = typeof num === 'string' ? parseInt(num, 10) : num;
    if (isNaN(n) || n <= 0) return typeof num === 'string' && num.trim() ? num : null;
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toLocaleString();
  };

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
    let targetUrl = (overrideUrl || urlInput).trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

    if (!targetUrl) {
      setErrorMessage('Silakan masukkan URL media terlebih dahulu.');
      setStatus('error');
      return;
    }

    try {
      const parsed = new URL(targetUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Protokol URL tidak valid.');
      }
    } catch {
      setErrorMessage('URL tidak valid. Format harus berupa http:// atau https://');
      setStatus('error');
      return;
    }

    // Reset state
    setErrorMessage('');
    setFileMetadata(null);
    setStatus('inspecting');
    setStatusMessage('Memvalidasi dan memeriksa URL media...');

    try {
      let data: Record<string, unknown> | null = null;

      try {
        const apiBase = getApiBaseUrl();
        const inspectRes = await fetch(`${apiBase}/api/inspect?url=${encodeURIComponent(targetUrl)}`);

        const contentType = inspectRes.headers.get('content-type') || '';
        if (inspectRes.ok && !contentType.toLowerCase().includes('text/html') && contentType.includes('application/json')) {
          data = await inspectRes.json().catch(() => null);
        }
      } catch {
        // Ignore API inspect errors and proceed to client-side resolution fallback
      }

      // If API inspect didn't return valid data, resolve client-side
      if (!data || !data.ok || !data.downloadUrl) {
        data = await resolveMediaClientSide(targetUrl);
      }

      if (!data || !data.ok) {
        const errorText = (data && typeof data.error === 'string') ? data.error : 'URL ini tidak menyediakan file yang dapat diunduh secara langsung.';
        setErrorMessage(errorText);
        setStatus('error');
        return;
      }

      // Metadata received successfully
      const downloadTargetUrl = (typeof data.downloadUrl === 'string' && data.downloadUrl.trim())
        ? data.downloadUrl.trim()
        : (typeof data.url === 'string' && data.url.trim()) || targetUrl;
      const downloadFilename = (typeof data.filename === 'string' && data.filename.trim())
        ? data.filename.trim()
        : 'download-file.mp4';

      const meta: FileMetadata = {
        filename: downloadFilename,
        fileSize: (typeof data.fileSize === 'number' && data.fileSize) || 0,
        contentType: (typeof data.contentType === 'string' && data.contentType) || 'application/octet-stream',
        extension: (typeof data.extension === 'string' && data.extension) || 'MP4',
        category: (typeof data.category === 'string' && data.category) || 'Video',
        url: downloadTargetUrl,
        title: (typeof data.title === 'string' && data.title.trim()) || downloadFilename.replace(/\.mp4$/i, ''),
        author: (typeof data.author === 'string' && data.author.trim()) || '',
        cover: (typeof data.cover === 'string' && data.cover.trim()) || '',
        views: (data.views as number | string) || undefined,
        likes: (data.likes as number | string) || undefined,
        comments: (data.comments as number | string) || undefined,
        shares: (data.shares as number | string) || undefined,
      };

      setFileMetadata(meta);
      setStatus('downloading');
      setStatusMessage('Mengunduh data berkas...');

      await downloadFileViaBlob(downloadTargetUrl, downloadFilename, (msg) => setStatusMessage(msg));

      // Finish state
      setStatus('success');
      setStatusMessage('Download berhasil');
      onToast('Download berhasil!', 'success');
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga saat memproses unduhan.';
      if (msg.includes('HTML') || msg.includes('404') || msg.includes('NOT_FOUND') || msg.includes('Page Not Found')) {
        msg = 'Gagal memproses file media. Silakan periksa kembali URL yang Anda masukkan.';
      }
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full pt-8 pb-10"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        {/* Main Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
          Savely Downloader
        </h1>
        <p className="text-base sm:text-lg text-slate-300 font-normal max-w-xl mx-auto mb-8">
          Download your media files quickly and easily.
        </p>

        {/* Input Card Container */}
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 sm:p-6 text-left">
          <label htmlFor="url-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            URL File / Media
          </label>

          {/* Form Download */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartDownload();
            }}
            className="relative flex flex-col sm:flex-row items-stretch gap-2.5"
          >
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
            <motion.button
              type="submit"
              disabled={status === 'inspecting' || status === 'downloading'}
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
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
            </motion.button>
          </form>

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

          {/* Result Area (If inspected successfully) */}
          {fileMetadata && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 pt-4 border-t border-slate-800/80 w-full text-left"
            >
              {/* 1. VIDEO PREVIEW (Compact preview height with play overlay) */}
              <div className="relative w-full h-36 sm:h-44 rounded-lg overflow-hidden bg-slate-950/90 border border-slate-800/70 mb-3 group">
                {fileMetadata.cover ? (
                  <img
                    src={fileMetadata.cover}
                    alt={fileMetadata.title || fileMetadata.filename}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 gap-1.5">
                    <Video className="w-9 h-9 text-blue-400/80" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      {fileMetadata.extension || 'MP4'}
                    </span>
                  </div>
                )}

                {/* Centered Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/65 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Subtle Dark Gradient at Bottom */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
              </div>

              {/* 2. INFORMASI VIDEO */}
              <div className="mb-3 space-y-1">
                {/* Video Title */}
                <h3
                  className="text-sm sm:text-base font-bold text-white leading-snug tracking-tight line-clamp-2 break-words"
                  title={fileMetadata.title || fileMetadata.filename}
                >
                  {fileMetadata.title || fileMetadata.filename}
                </h3>

                {/* TikTok Username */}
                {fileMetadata.author && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                    <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>{fileMetadata.author.startsWith('@') ? fileMetadata.author : `@${fileMetadata.author}`}</span>
                  </div>
                )}

                {/* Statistics if available */}
                {(fileMetadata.views !== undefined ||
                  fileMetadata.likes !== undefined ||
                  fileMetadata.comments !== undefined ||
                  fileMetadata.shares !== undefined) && (
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5 flex-wrap font-medium">
                    {formatStatNumber(fileMetadata.views) && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Play className="w-3 h-3 text-blue-400 fill-blue-400" />
                        <span>{formatStatNumber(fileMetadata.views)} views</span>
                      </span>
                    )}
                    {formatStatNumber(fileMetadata.likes) && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                        <span>{formatStatNumber(fileMetadata.likes)} likes</span>
                      </span>
                    )}
                    {formatStatNumber(fileMetadata.comments) && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <MessageCircle className="w-3 h-3 text-slate-400" />
                        <span>{formatStatNumber(fileMetadata.comments)} comments</span>
                      </span>
                    )}
                    {formatStatNumber(fileMetadata.shares) && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Share2 className="w-3 h-3 text-slate-400" />
                        <span>{formatStatNumber(fileMetadata.shares)} shares</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 3. DOWNLOAD ACTION (ONE SINGLE BLUE BUTTON, STRICTLY 1 LINE) */}
              <button
                type="button"
                disabled={status === 'downloading'}
                onClick={async () => {
                  if (status === 'downloading' || !fileMetadata) return;
                  try {
                    setStatus('downloading');
                    setStatusMessage('Mengunduh berkas media...');
                    onToast('Mengunduh berkas...', 'info');
                    await downloadFileViaBlob(fileMetadata.url, fileMetadata.filename, (msg) => setStatusMessage(msg));
                    setStatus('success');
                    setStatusMessage('Download berhasil');
                    onToast('Download berhasil!', 'success');
                  } catch (err: unknown) {
                    setStatus('success');
                    const msg = err instanceof Error ? err.message : 'Gagal mengunduh.';
                    onToast(msg, 'error');
                  }
                }}
                className="w-full h-12 sm:h-13 px-3 sm:px-5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-200 text-xs sm:text-sm border border-blue-400/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap overflow-hidden"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
                <span className="whitespace-nowrap tracking-tight">Download (No Watermark)</span>
              </button>

              {/* 4. DETAIL FILE (Minimal & Seamless) */}
              <div className="mt-2 text-center">
                <p className="text-xs font-semibold text-slate-300">
                  {fileMetadata.extension || 'MP4'}
                  {fileMetadata.fileSize > 0 && ` · ${formatBytes(fileMetadata.fileSize)}`}
                </p>
                <p className="text-[11px] text-slate-400/80 truncate max-w-full mt-0.5 px-2">
                  {fileMetadata.filename}
                </p>
              </div>

              {/* 5. "DOWNLOAD VIDEO LAIN" */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setFileMetadata(null);
                    setStatus('idle');
                    setErrorMessage('');
                    setUrlInput('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors py-1 px-3 rounded-md hover:bg-slate-800/40 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download Video Lain</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
};
