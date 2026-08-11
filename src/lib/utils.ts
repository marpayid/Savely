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
  const proxyUrl = `/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}`;
  if (onProgress) onProgress('Mengunduh data berkas dari server...');

  const res = await fetch(proxyUrl);
  if (!res.ok) {
    const errTxt = await res.text().catch(() => '');
    throw new Error(errTxt || 'Gagal mengunduh file dari server.');
  }

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = blobUrl;
  a.download = filename || 'download-file.mp4';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
    a.remove();
  }, 2000);
}

