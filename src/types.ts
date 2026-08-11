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

export interface SampleLink {
  label: string;
  url: string;
  ext: string;
  category: string;
  sizeText: string;
}
