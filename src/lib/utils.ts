import { HistoryItem } from '../types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return 'Ukuran tidak diketahui';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const STORAGE_KEY = 'media_downloader_history_v1';

export function loadHistoryFromStorage(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHistoryToStorage(history: HistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save history to localStorage', err);
  }
}

export function addHistoryEntry(entry: Omit<HistoryItem, 'id' | 'date' | 'timestamp'>): HistoryItem[] {
  const current = loadHistoryFromStorage();
  const timestamp = Date.now();
  const newItem: HistoryItem = {
    ...entry,
    id: `hist_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp,
    date: formatDate(timestamp),
  };
  const updated = [newItem, ...current].slice(0, 50); // Keep max 50 items
  saveHistoryToStorage(updated);
  return updated;
}

export function removeHistoryEntry(id: string): HistoryItem[] {
  const current = loadHistoryFromStorage();
  const updated = current.filter((item) => item.id !== id);
  saveHistoryToStorage(updated);
  return updated;
}

export function clearAllHistory(): HistoryItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}

export function getApiBaseUrl(): string {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const envUrl = (
    metaEnv.VITE_API_BASE_URL ||
    metaEnv.VITE_API_URL ||
    metaEnv.VITE_BACKEND_URL ||
    ''
  ).trim();
  return envUrl ? envUrl.replace(/\/+$/, '') : '';
}

export async function downloadFileViaBlob(
  targetUrl: string,
  filename: string,
  onProgress?: (msg: string) => void
): Promise<void> {
  if (!targetUrl || typeof targetUrl !== 'string') {
    throw new Error('URL berkas tidak valid.');
  }

  const cleanUrl = targetUrl.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  if (!cleanUrl) {
    throw new Error('URL berkas tidak boleh kosong.');
  }

  const safeFilename = (filename || 'download-file.mp4')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim() || 'download-file.mp4';

  const isVideo = safeFilename.toLowerCase().endsWith('.mp4') ||
    safeFilename.toLowerCase().endsWith('.webm') ||
    safeFilename.toLowerCase().endsWith('.mov') ||
    safeFilename.toLowerCase().endsWith('.m4v');
  const targetMimeType = isVideo ? 'video/mp4' : 'application/octet-stream';

  if (onProgress) onProgress('Mengunduh berkas media...');

  let blob: Blob | null = null;

  // Attempt 1: Direct browser fetch to direct media URL if HTTP/HTTPS
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    try {
      const directRes = await fetch(cleanUrl);
      const contentType = directRes.headers.get('content-type') || '';

      if (directRes.ok && !contentType.toLowerCase().includes('text/html')) {
        const rawBlob = await directRes.blob();
        if (rawBlob && rawBlob.size > 0) {
          blob = new Blob([rawBlob], { type: isVideo ? 'video/mp4' : (rawBlob.type || targetMimeType) });
        }
      }
    } catch {
      // Direct fetch failed (e.g. CORS), fallback to proxy/redirect
    }
  }

  // Attempt 2: Via /api/download redirect
  if (!blob) {
    const apiBase = getApiBaseUrl();
    const proxyUrl = `${apiBase}/api/download?url=${encodeURIComponent(cleanUrl)}&filename=${encodeURIComponent(safeFilename)}`;

    let res: Response;
    try {
      res = await fetch(proxyUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal terhubung ke server.';
      throw new Error(`Gagal menghubungi server download: ${msg}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.toLowerCase().includes('text/html')) {
      throw new Error('Endpoint server mengembalikan halaman HTML (404/Page Not Found). Pastikan Netlify Functions ter-deploy atau VITE_API_BASE_URL diatur di environment variable.');
    }

    if (!res.ok) {
      const errTxt = await res.text().catch(() => '');
      throw new Error(errTxt || `Gagal mengunduh file dari server (HTTP ${res.status}).`);
    }

    if (contentType.includes('application/json')) {
      const json = await res.json().catch(() => null);
      if (json && json.error) {
        throw new Error(json.error);
      }
    }

    const rawBlob = await res.blob();
    if (!rawBlob || rawBlob.size === 0) {
      throw new Error('Berkas yang diterima kosong (0 byte).');
    }
    blob = new Blob([rawBlob], { type: isVideo ? 'video/mp4' : (rawBlob.type || targetMimeType) });
  }

  await triggerVideoDownloadOrShare(blob, safeFilename, targetMimeType, cleanUrl);
}

async function triggerVideoDownloadOrShare(
  blob: Blob,
  filename: string,
  mimeType: string,
  originalUrl: string
): Promise<void> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
  const isVideo = mimeType.startsWith('video/') || filename.toLowerCase().endsWith('.mp4') || filename.toLowerCase().endsWith('.webm');

  // Force video/mp4 blob type for media files so OS media scanners recognize it as MP4 video
  const videoMime = isVideo ? 'video/mp4' : (mimeType || 'application/octet-stream');
  const videoBlob = isVideo && blob.type !== 'video/mp4'
    ? new Blob([blob], { type: 'video/mp4' })
    : blob;

  // Clean ASCII filename for Web Share API compatibility on iOS/Android
  const safeAsciiName = filename
    .replace(/[^\x20-\x7E]/g, '_')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim() || 'video.mp4';
  const shareFilename = isVideo && !safeAsciiName.toLowerCase().endsWith('.mp4')
    ? `${safeAsciiName}.mp4`
    : safeAsciiName;

  // 1. Mobile Web Share API Flow (iOS Safari & Android Chrome)
  // MUST execute ONLY this method on mobile when supported to prevent double-downloads / double-actions!
  if (isMobile && typeof navigator !== 'undefined' && 'canShare' in navigator) {
    try {
      const file = new File([videoBlob], shareFilename, { type: videoMime });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: shareFilename,
        });
        return; // Single action completed natively via OS Share Sheet ("Save Video")
      }
    } catch (shareErr: unknown) {
      if (shareErr instanceof Error && shareErr.name === 'AbortError') {
        // User explicitly canceled/dismissed the share sheet: STOP, do not trigger secondary download
        return;
      }
      // On mobile, if navigator.share fails or gesture expired during inspect, STOP HERE.
      // Do NOT fall through to anchor click because that produces the unwanted duplicate download in Files/Downloads.
      throw new Error('Izin simpan video browser terbatas. Silakan ketuk tombol "Unduh" pada kartu informasi file untuk menyimpan video.');
    }
  }

  // 2. Desktop / Non-Mobile Browser Download Flow (Single Action via Blob Anchor)
  let blobUrl: string | null = null;
  try {
    blobUrl = window.URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = shareFilename;
    a.setAttribute('type', videoMime);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      try {
        if (blobUrl) window.URL.revokeObjectURL(blobUrl);
        a.remove();
      } catch {
        // ignore
      }
    }, 4000);
  } catch {
    if (blobUrl) window.URL.revokeObjectURL(blobUrl);

    // Fallback: direct window open if blob creation or anchor click fails
    if (originalUrl) {
      window.open(originalUrl, '_blank');
    }
  }
}

