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

export function isTikTokUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    return (
      host.includes('tiktok.com') ||
      host.includes('douyin.com') ||
      host.includes('tiktokv.com') ||
      host.includes('vt.tiktok.com')
    );
  } catch {
    return false;
  }
}

export async function resolveTikTokClientSide(targetUrl: string) {
  // Method 1: TikWM API POST
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: new URLSearchParams({ url: targetUrl, hd: '1' }).toString(),
    });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      if (json && json.code === 0 && json.data) {
        let playUrl = json.data.play || json.data.wmplay || json.data.hdplay;
        if (playUrl) {
          if (!playUrl.startsWith('http')) {
            playUrl = 'https://www.tikwm.com' + (playUrl.startsWith('/') ? '' : '/') + playUrl;
          }
          const rawTitle = json.data.title || 'tiktok_video';
          const cleanTitle = rawTitle.replace(/[/\\?%*:|"<>#\r\n\t]/g, '_').trim().substring(0, 50) || 'tiktok_video';
          const filename = cleanTitle.toLowerCase().endsWith('.mp4') ? cleanTitle : `${cleanTitle}.mp4`;
          return {
            ok: true,
            filename,
            fileSize: json.data.size || 0,
            contentType: 'video/mp4',
            extension: 'MP4',
            category: 'Video',
            downloadUrl: playUrl,
            url: targetUrl,
          };
        }
      }
    }
  } catch {
    // Ignore TikWM error, fallback
  }

  // Method 2: Tiklydown API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(targetUrl)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      const videoUrl = json.video?.noWatermark || json.video?.watermark || json.video?.mp4 || json.url;
      if (videoUrl && typeof videoUrl === 'string') {
        const title = (json.title || 'tiktok_video').replace(/[/\\?%*:|"<>#\r\n\t]/g, '_').trim().substring(0, 50) || 'tiktok_video';
        return {
          ok: true,
          filename: title.toLowerCase().endsWith('.mp4') ? title : `${title}.mp4`,
          fileSize: 0,
          contentType: 'video/mp4',
          extension: 'MP4',
          category: 'Video',
          downloadUrl: videoUrl,
          url: targetUrl,
        };
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

export async function resolveCobaltClientSide(targetUrl: string) {
  const instances = [
    'https://api.cobalt.tools',
    'https://cobalt-api.kwiatekm.com',
    'https://co.wuk.sh',
  ];

  for (const instance of instances) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`${instance}/`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        const mediaUrl = json.url || (json.picker && json.picker[0]?.url);
        if (mediaUrl && typeof mediaUrl === 'string') {
          const filename = json.filename || 'video.mp4';
          return {
            ok: true,
            filename,
            fileSize: 0,
            contentType: 'video/mp4',
            extension: 'MP4',
            category: 'Video',
            downloadUrl: mediaUrl,
            url: targetUrl,
          };
        }
      }
    } catch {
      // Try next instance
    }
  }
  return null;
}

export async function resolveMediaClientSide(targetUrl: string) {
  if (isTikTokUrl(targetUrl)) {
    const tikTokRes = await resolveTikTokClientSide(targetUrl);
    if (tikTokRes) return tikTokRes;
  }

  // Try Cobalt resolver for other social media video links
  const cobaltRes = await resolveCobaltClientSide(targetUrl);
  if (cobaltRes) return cobaltRes;

  let filename = 'download-file.mp4';
  let category = 'Video';
  let ext = 'MP4';
  let contentType = 'video/mp4';

  try {
    const parsed = new URL(targetUrl);
    const pathname = parsed.pathname;
    const lastSegment = pathname.split('/').filter(Boolean).pop();
    if (lastSegment && lastSegment.includes('.')) {
      const cleanSeg = decodeURIComponent(lastSegment).replace(/[/\\?%*:|"<>#\r\n\t]/g, '_').trim();
      if (cleanSeg) {
        filename = cleanSeg;
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        if (extension) {
          ext = extension.toUpperCase();
          if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(extension)) {
            category = 'Video';
            contentType = `video/${extension === 'mov' ? 'quicktime' : extension}`;
          } else if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'].includes(extension)) {
            category = 'Audio';
            contentType = `audio/${extension === 'mp3' ? 'mpeg' : extension}`;
          } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
            category = 'Gambar';
            contentType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
          } else if (['pdf', 'doc', 'docx', 'txt', 'csv'].includes(extension)) {
            category = 'Dokumen';
            contentType = extension === 'pdf' ? 'application/pdf' : 'text/plain';
          } else if (['zip', 'rar', '7z'].includes(extension)) {
            category = 'Arsip';
            contentType = 'application/zip';
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    ok: true,
    filename,
    fileSize: 0,
    contentType,
    extension: ext,
    category,
    downloadUrl: targetUrl,
    url: targetUrl,
  };
}

export function triggerDirectAnchorDownload(url: string, filename: string): void {
  try {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename || 'download-file.mp4';
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        a.remove();
      } catch {
        // ignore
      }
    }, 2000);
  } catch {
    window.open(url, '_blank');
  }
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

  // Attempt 1: Direct browser fetch
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
      // Direct fetch failed (e.g. CORS)
    }
  }

  // Attempt 2: Via /api/download redirect if available
  if (!blob) {
    try {
      const apiBase = getApiBaseUrl();
      const proxyUrl = `${apiBase}/api/download?url=${encodeURIComponent(cleanUrl)}&filename=${encodeURIComponent(safeFilename)}`;

      const res = await fetch(proxyUrl);
      const contentType = res.headers.get('content-type') || '';

      if (res.ok && !contentType.toLowerCase().includes('text/html')) {
        if (!contentType.includes('application/json')) {
          const rawBlob = await res.blob();
          if (rawBlob && rawBlob.size > 0) {
            blob = new Blob([rawBlob], { type: isVideo ? 'video/mp4' : (rawBlob.type || targetMimeType) });
          }
        }
      }
    } catch {
      // Proxy fetch failed
    }
  }

  // Attempt 3: Direct anchor download fallback if blob fetch is blocked or API unavailable
  if (!blob) {
    triggerDirectAnchorDownload(cleanUrl, safeFilename);
    return;
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
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isVideo = mimeType.startsWith('video/') || filename.toLowerCase().endsWith('.mp4') || filename.toLowerCase().endsWith('.webm');

  // Force video/mp4 blob type for media files so OS media scanners recognize it as MP4 video
  const videoMime = isVideo ? 'video/mp4' : (mimeType || 'application/octet-stream');
  const videoBlob = isVideo && blob.type !== 'video/mp4'
    ? new Blob([blob], { type: 'video/mp4' })
    : blob;

  // Clean ASCII filename for Web Share API and download compatibility
  const safeAsciiName = filename
    .replace(/[^\x20-\x7E]/g, '_')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim() || 'video.mp4';
  const shareFilename = isVideo && !safeAsciiName.toLowerCase().endsWith('.mp4')
    ? `${safeAsciiName}.mp4`
    : safeAsciiName;

  // 1. iOS Safari Web Share API Flow (Opens native iOS Share Sheet with "Save Video" directly to Photos)
  if (isIOS && typeof navigator !== 'undefined' && 'canShare' in navigator) {
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
      // If navigator.share fails or gesture expired, fallback smoothly to anchor download without error popups
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

