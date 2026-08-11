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

  const proxyUrl = `/api/download?url=${encodeURIComponent(cleanUrl)}&filename=${encodeURIComponent(safeFilename)}`;
  if (onProgress) onProgress('Mengunduh data berkas dari server...');

  let res: Response;
  try {
    res = await fetch(proxyUrl);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal terhubung ke server.';
    throw new Error(`Gagal menghubungi server download: ${msg}`);
  }

  if (!res.ok) {
    const errTxt = await res.text().catch(() => '');
    throw new Error(errTxt || `Gagal mengunduh file dari server (HTTP ${res.status}).`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json().catch(() => null);
    if (json && json.error) {
      throw new Error(json.error);
    }
  }

  if (contentType.includes('text/html')) {
    throw new Error('Server mengembalikan halaman web, bukan file media.');
  }

  const blob = await res.blob();
  if (!blob || blob.size === 0) {
    throw new Error('Berkas yang diterima kosong (0 byte).');
  }

  let blobUrl: string;
  try {
    blobUrl = window.URL.createObjectURL(blob);
  } catch {
    throw new Error('Browser gagal membuat objek berkas.');
  }

  try {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      try {
        window.URL.revokeObjectURL(blobUrl);
        a.remove();
      } catch {
        // ignore
      }
    }, 2000);
  } catch (err) {
    window.URL.revokeObjectURL(blobUrl);
    const msg = err instanceof Error ? err.message : 'Gagal menyimpan file.';
    throw new Error(`Browser tidak dapat menyimpan file: ${msg}`);
  }
}

