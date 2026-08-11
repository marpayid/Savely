export interface FileMetadata {
  filename: string;
  fileSize: number;
  contentType: string;
  extension: string;
  category: string;
  url: string;
}

export interface InspectResult {
  ok: boolean;
  url?: string;
  filename?: string;
  fileSize?: number;
  contentType?: string;
  extension?: string;
  category?: string;
  error?: string;
}

export type DownloadStatus = 'idle' | 'inspecting' | 'downloading' | 'success' | 'error';

export interface HistoryItem {
  id: string;
  filename: string;
  url: string;
  date: string;
  timestamp: number;
  status: 'Sukses' | 'Gagal';
  fileSize: number;
  extension: string;
  category: string;
  errorMessage?: string;
}

export interface SampleLink {
  label: string;
  url: string;
  ext: string;
  category: string;
  sizeText: string;
}
