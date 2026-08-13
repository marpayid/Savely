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
          const author = json.data.author?.nickname ? `@${json.data.author.unique_id || json.data.author.nickname}` : (json.data.author?.unique_id ? `@${json.data.author.unique_id}` : '');
          const cover = json.data.cover || json.data.origin_cover || '';
          return {
            ok: true,
            filename,
            fileSize: json.data.size || 0,
            contentType: 'video/mp4',
            extension: 'MP4',
            category: 'Video',
            downloadUrl: playUrl,
            url: targetUrl,
            title: json.data.title || cleanTitle,
            author,
            cover,
            views: json.data.play_count,
            likes: json.data.digg_count || json.data.likes_count || json.data.like_count,
            comments: json.data.comment_count,
            shares: json.data.share_count,
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
    const cleanUrl = url.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
    let safeName = (filename || 'download-file.mp4')
      .replace(/[/\\?%*:|"<>#\r\n\t]/g, '_')
      .trim() || 'download-file.mp4';

    if (!safeName.toLowerCase().endsWith('.mp4') &&
        !safeName.toLowerCase().endsWith('.webm') &&
        !safeName.toLowerCase().endsWith('.mov')) {
      safeName += '.mp4';
    }

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = cleanUrl;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      try {
        if (a.parentNode) a.parentNode.removeChild(a);
      } catch {
        // ignore
      }
    }, 4000);
  } catch {
    const proxyUrl = `${getApiBaseUrl()}/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename || 'download-file.mp4')}`;
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = proxyUrl;
    a.download = filename || 'download-file.mp4';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        if (a.parentNode) a.parentNode.removeChild(a);
      } catch {
        // ignore
      }
    }, 4000);
  }
}

let activeDownloadLock = false;

export async function downloadFileViaBlob(
  targetUrl: string,
  filename: string,
  onProgress?: (msg: string) => void
): Promise<void> {
  if (activeDownloadLock) {
    console.warn('[Download] Aborting concurrent duplicate download request.');
    return;
  }

  if (!targetUrl || typeof targetUrl !== 'string') {
    throw new Error('URL berkas tidak valid.');
  }

  const cleanUrl = targetUrl.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  if (!cleanUrl) {
    throw new Error('URL berkas tidak boleh kosong.');
  }

  let safeFilename = (filename || 'download-video.mp4')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[/\\?%*:|"<>#]/g, '_')
    .trim() || 'download-video.mp4';

  if (!safeFilename.toLowerCase().endsWith('.mp4') &&
      !safeFilename.toLowerCase().endsWith('.webm') &&
      !safeFilename.toLowerCase().endsWith('.mov') &&
      !safeFilename.toLowerCase().endsWith('.m4v')) {
    safeFilename += '.mp4';
  }

  const targetMimeType = 'video/mp4';

  try {
    activeDownloadLock = true;
    if (onProgress) onProgress('Mengunduh berkas media...');

    let blob: Blob | null = null;

    // Attempt 1: Direct browser fetch
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      try {
        const directRes = await fetch(cleanUrl);
        const contentType = (directRes.headers.get('content-type') || '').toLowerCase();

        if (directRes.ok && !contentType.includes('text/html')) {
          const rawBlob = await directRes.blob();
          if (rawBlob && rawBlob.size > 0) {
            blob = new Blob([rawBlob], { type: targetMimeType });
          }
        }
      } catch {
        // Direct fetch failed (e.g. CORS)
      }
    }

    // Attempt 2: Via backend proxy endpoint (/api/download)
    if (!blob) {
      try {
        const apiBase = getApiBaseUrl();
        const proxyUrl = `${apiBase}/api/download?url=${encodeURIComponent(cleanUrl)}&filename=${encodeURIComponent(safeFilename)}`;

        const res = await fetch(proxyUrl);
        const contentType = (res.headers.get('content-type') || '').toLowerCase();

        if (res.ok && !contentType.includes('text/html') && !contentType.includes('application/json')) {
          const rawBlob = await res.blob();
          if (rawBlob && rawBlob.size > 0) {
            blob = new Blob([rawBlob], { type: targetMimeType });
          }
        }
      } catch {
        // Proxy fetch failed
      }
    }

    // Attempt 2.5: CORS proxy fallbacks if direct and backend proxy failed
    if (!blob && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
      const corsProxies = [
        `https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`,
      ];

      for (const proxyEndpoint of corsProxies) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 12000);
          const proxyRes = await fetch(proxyEndpoint, { signal: controller.signal });
          clearTimeout(timeout);

          const contentType = (proxyRes.headers.get('content-type') || '').toLowerCase();
          if (proxyRes.ok && !contentType.includes('text/html')) {
            const rawBlob = await proxyRes.blob();
            if (rawBlob && rawBlob.size > 0) {
              blob = new Blob([rawBlob], { type: targetMimeType });
              break;
            }
          }
        } catch {
          // Try next proxy
        }
      }
    }

    // Attempt 3: Native Browser Blob Anchor Trigger (Cross-platform compatibility for iOS Safari, Android Chrome, and Desktop)
    if (blob) {
      const videoBlob = new Blob([blob], { type: targetMimeType });
      const blobUrl = window.URL.createObjectURL(videoBlob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        try {
          if (a.parentNode) a.parentNode.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        } catch {
          // ignore
        }
      }, 10000);

      return; // Single download action completed cleanly
    }

    // Fallback if blob fetch is restricted or blocked: Trigger direct attachment via backend
    const fallbackProxyUrl = `${getApiBaseUrl()}/api/download?url=${encodeURIComponent(cleanUrl)}&filename=${encodeURIComponent(safeFilename)}`;
    triggerDirectAnchorDownload(fallbackProxyUrl, safeFilename);
  } catch (err: unknown) {
    throw err;
  } finally {
    activeDownloadLock = false;
  }
}


