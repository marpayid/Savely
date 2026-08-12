import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

function getSafeDirname(): string {
  try {
    if (import.meta && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // ignore
  }
  return process.cwd();
}

const currentDir = getSafeDirname();

const app = express();
const PORT = 3000;

app.use(express.json());

// CORS headers middleware
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Normalize URL paths for Netlify Functions / redirects
app.use((req, _res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  } else if (
    !req.url.startsWith('/api') &&
    (req.url.startsWith('/inspect') || req.url.startsWith('/download') || req.url.startsWith('/health'))
  ) {
    req.url = '/api' + req.url;
  }
  next();
});

// Common MIME types to Extension and Category mapping
const MIME_MAP: Record<string, { ext: string; category: string }> = {
  'video/mp4': { ext: 'mp4', category: 'Video' },
  'video/webm': { ext: 'webm', category: 'Video' },
  'video/quicktime': { ext: 'mov', category: 'Video' },
  'video/x-matroska': { ext: 'mkv', category: 'Video' },
  'video/avi': { ext: 'avi', category: 'Video' },
  'audio/mpeg': { ext: 'mp3', category: 'Audio' },
  'audio/mp3': { ext: 'mp3', category: 'Audio' },
  'audio/wav': { ext: 'wav', category: 'Audio' },
  'audio/x-wav': { ext: 'wav', category: 'Audio' },
  'audio/aac': { ext: 'aac', category: 'Audio' },
  'audio/flac': { ext: 'flac', category: 'Audio' },
  'audio/ogg': { ext: 'ogg', category: 'Audio' },
  'image/jpeg': { ext: 'jpg', category: 'Gambar' },
  'image/png': { ext: 'png', category: 'Gambar' },
  'image/gif': { ext: 'gif', category: 'Gambar' },
  'image/webp': { ext: 'webp', category: 'Gambar' },
  'image/svg+xml': { ext: 'svg', category: 'Gambar' },
  'application/pdf': { ext: 'pdf', category: 'Dokumen' },
  'application/zip': { ext: 'zip', category: 'Arsip' },
  'application/x-zip-compressed': { ext: 'zip', category: 'Arsip' },
  'application/x-rar-compressed': { ext: 'rar', category: 'Arsip' },
  'application/x-7z-compressed': { ext: '7z', category: 'Arsip' },
  'application/octet-stream': { ext: 'bin', category: 'Berkas' },
  'text/csv': { ext: 'csv', category: 'Dokumen' },
  'application/json': { ext: 'json', category: 'Dokumen' },
};

function sanitizeFilename(rawName: string): string {
  return rawName.replace(/[/\\?%*:|"<>#\r\n\t]/g, '_').trim() || 'download-file';
}

function isTikTokUrl(url: string): boolean {
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

function makeAbsoluteUrl(rawUrl: string, baseDomain = 'https://www.tikwm.com'): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let cleaned = rawUrl.trim();
  if (cleaned.startsWith('//')) {
    return 'https:' + cleaned;
  }
  if (cleaned.startsWith('/')) {
    return baseDomain + cleaned;
  }
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    return 'https://' + cleaned;
  }
  return cleaned;
}

async function expandShortUrl(shortUrl: string): Promise<string> {
  try {
    const clean = shortUrl.trim();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(clean, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);
    return res.url || clean;
  } catch {
    return shortUrl;
  }
}

interface ResolvedTikTokMedia {
  filename: string;
  downloadUrl: string;
  fileSize: number;
  contentType: string;
  extension: string;
  category: string;
}

async function resolveTikTokMedia(rawUrl: string): Promise<ResolvedTikTokMedia | null> {
  const expandedUrl = await expandShortUrl(rawUrl);

  // Method 1: TikWM API POST
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: new URLSearchParams({ url: expandedUrl, hd: '1' }).toString(),
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json && json.code === 0 && json.data) {
        let playUrl = json.data.play || json.data.wmplay || json.data.hdplay;
        if (playUrl) {
          playUrl = makeAbsoluteUrl(playUrl, 'https://www.tikwm.com');

          const rawTitle = json.data.title || 'tiktok_video';
          const titleClean = sanitizeFilename(rawTitle.substring(0, 50)) || 'tiktok_video';
          const filename = titleClean.endsWith('.mp4') ? titleClean : `${titleClean}.mp4`;

          return {
            filename,
            downloadUrl: playUrl,
            fileSize: json.data.size || 0,
            contentType: 'video/mp4',
            extension: 'MP4',
            category: 'Video',
          };
        }
      }
    }
  } catch (err) {
    console.warn('TikWM POST failed:', err);
  }

  // Method 2: TikWM GET
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(expandedUrl)}&hd=1`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json && json.code === 0 && json.data) {
        let playUrl = json.data.play || json.data.wmplay || json.data.hdplay;
        if (playUrl) {
          playUrl = makeAbsoluteUrl(playUrl, 'https://www.tikwm.com');

          const rawTitle = json.data.title || 'tiktok_video';
          const titleClean = sanitizeFilename(rawTitle.substring(0, 50)) || 'tiktok_video';
          const filename = titleClean.endsWith('.mp4') ? titleClean : `${titleClean}.mp4`;

          return {
            filename,
            downloadUrl: playUrl,
            fileSize: json.data.size || 0,
            contentType: 'video/mp4',
            extension: 'MP4',
            category: 'Video',
          };
        }
      }
    }
  } catch (err) {
    console.warn('TikWM GET failed:', err);
  }

  // Method 3: Tiklydown API backup
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(expandedUrl)}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      let videoUrl = json.video?.noWatermark || json.video?.watermark || json.video?.mp4 || json.url;
      if (videoUrl && typeof videoUrl === 'string') {
        videoUrl = makeAbsoluteUrl(videoUrl, 'https://www.tiktok.com');
        return {
          filename: sanitizeFilename(json.title || 'tiktok_video') + '.mp4',
          downloadUrl: videoUrl,
          fileSize: 0,
          contentType: 'video/mp4',
          extension: 'MP4',
          category: 'Video',
        };
      }
    }
  } catch (err) {
    console.warn('Tiklydown failed:', err);
  }

  // Method 4: RapidAPI if RAPIDAPI_KEY is present
  if (process.env.RAPIDAPI_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`https://tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com/index?url=${encodeURIComponent(expandedUrl)}`, {
        signal: controller.signal,
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com',
        },
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        const videoUrl = json.video?.[0] || json.video || json.url;
        if (videoUrl && typeof videoUrl === 'string') {
          return {
            filename: 'tiktok_video.mp4',
            downloadUrl: makeAbsoluteUrl(videoUrl),
            fileSize: 0,
            contentType: 'video/mp4',
            extension: 'MP4',
            category: 'Video',
          };
        }
      }
    } catch (err) {
      console.warn('RapidAPI TikTok failed:', err);
    }
  }

  // Method 5: HTML Scrape fallback for direct embedded JSON
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const htmlRes = await fetch(expandedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);
    if (htmlRes.ok) {
      const htmlText = await htmlRes.text();
      const playMatch = htmlText.match(/"playAddr":"([^"]+)"/) || htmlText.match(/"downloadAddr":"([^"]+)"/);
      if (playMatch && playMatch[1]) {
        let directUrl = playMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
        if (directUrl) {
          directUrl = makeAbsoluteUrl(directUrl, 'https://www.tiktok.com');
          return {
            filename: 'tiktok_video.mp4',
            downloadUrl: directUrl,
            fileSize: 0,
            contentType: 'video/mp4',
            extension: 'MP4',
            category: 'Video',
          };
        }
      }
    }
  } catch (err) {
    console.warn('TikTok HTML scrape failed:', err);
  }

  return null;
}

// Helper to derive filename and metadata from URL and headers
function parseFileMetadata(targetUrl: string, headers: Headers) {
  const contentType = (headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const contentDisposition = headers.get('content-disposition') || '';
  const contentLength = parseInt(headers.get('content-length') || '0', 10);

  let filename = '';

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
    if (filenameMatch && filenameMatch[1]) {
      try {
        filename = decodeURIComponent(filenameMatch[1]);
      } catch {
        filename = filenameMatch[1];
      }
    }
  }

  if (!filename) {
    try {
      const parsedUrl = new URL(targetUrl);
      const pathname = parsedUrl.pathname;
      const lastSegment = pathname.split('/').filter(Boolean).pop();
      if (lastSegment && lastSegment.includes('.')) {
        filename = decodeURIComponent(lastSegment);
      }
    } catch {
      // ignore
    }
  }

  if (!filename) {
    filename = 'download-file';
  }

  filename = sanitizeFilename(filename);

  let ext = '';
  if (filename.includes('.')) {
    ext = filename.split('.').pop()?.toLowerCase() || '';
  }

  let category = 'Berkas';

  if (contentType in MIME_MAP) {
    const mapped = MIME_MAP[contentType];
    category = mapped.category;
    if (!ext) {
      ext = mapped.ext;
      filename = `${filename}.${ext}`;
    }
  } else if (ext) {
    if (['mp4', 'webm', 'mov', 'mkv', 'avi', 'flv'].includes(ext)) category = 'Video';
    else if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'].includes(ext)) category = 'Audio';
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) category = 'Gambar';
    else if (['pdf', 'doc', 'docx', 'txt', 'csv', 'xls', 'xlsx'].includes(ext)) category = 'Dokumen';
    else if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) category = 'Arsip';
  } else {
    ext = 'file';
  }

  return {
    filename,
    fileSize: contentLength > 0 ? contentLength : 0,
    contentType: contentType || 'application/octet-stream',
    extension: ext.toUpperCase(),
    category,
  };
}

// API: Inspect URL
app.get('/api/inspect', async (req, res) => {
  const targetUrl = req.query.url as string;

  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ ok: false, error: 'URL tidak valid.' });
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Protokol harus HTTP atau HTTPS');
    }
  } catch {
    return res.status(400).json({ ok: false, error: 'Format URL tidak valid. Pastikan dimulai dengan http:// atau https://' });
  }

  // Special Handling for TikTok links
  if (isTikTokUrl(targetUrl)) {
    try {
      const tikTokMedia = await resolveTikTokMedia(targetUrl);
      if (tikTokMedia) {
        return res.status(200).json({
          ok: true,
          url: targetUrl,
          downloadUrl: tikTokMedia.downloadUrl,
          filename: tikTokMedia.filename,
          fileSize: tikTokMedia.fileSize,
          contentType: tikTokMedia.contentType,
          extension: tikTokMedia.extension,
          category: tikTokMedia.category,
        });
      } else {
        return res.status(200).json({
          ok: false,
          error: 'URL ini tidak menyediakan file yang dapat diunduh secara langsung.',
        });
      }
    } catch {
      return res.status(200).json({
        ok: false,
        error: 'URL ini tidak menyediakan file yang dapat diunduh secara langsung.',
      });
    }
  }

  // Standard Direct File URL Handling
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
      });
    } catch {
      response = await fetch(targetUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Range': 'bytes=0-1024',
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok && response.status !== 206) {
      if (response.status === 404) {
        return res.status(200).json({
          ok: false,
          error: 'URL tidak ditemukan (404). File mungkin telah dihapus atau URL salah.',
        });
      }
      if (response.status === 403) {
        return res.status(200).json({
          ok: false,
          error: 'URL tidak menyediakan file yang dapat diunduh secara langsung.',
        });
      }
      return res.status(200).json({
        ok: false,
        error: `Server sumber mengembalikan error status ${response.status}.`,
      });
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();

    if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
      return res.status(200).json({
        ok: false,
        error: 'URL ini tidak menyediakan file yang dapat diunduh secara langsung.',
      });
    }

    const metadata = parseFileMetadata(targetUrl, response.headers);

    return res.status(200).json({
      ok: true,
      url: targetUrl,
      downloadUrl: targetUrl,
      ...metadata,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal menghubungi server URL.';
    if (errorMsg.includes('aborted')) {
      return res.status(200).json({
        ok: false,
        error: 'Waktu koneksi habis (timeout) saat memeriksa URL.',
      });
    }
    return res.status(200).json({
      ok: false,
      error: 'URL ini tidak menyediakan file yang dapat diunduh secara langsung.',
    });
  }
});

// API: Download Redirect (Avoids Netlify 6MB serverless payload limit)
app.get('/api/download', async (req, res) => {
  let targetUrl = (req.query.url as string || '').trim();
  let customFilename = (req.query.filename as string || '').trim();

  if (!targetUrl) {
    return res.status(400).send('URL berkas tidak boleh kosong.');
  }

  try {
    const parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).send('Format URL tidak valid.');
    }
  } catch {
    return res.status(400).send('Format URL tidak valid.');
  }

  // If URL is TikTok, resolve direct video stream URL if not already resolved
  if (isTikTokUrl(targetUrl)) {
    try {
      const tikTokMedia = await resolveTikTokMedia(targetUrl);
      if (tikTokMedia && tikTokMedia.downloadUrl) {
        targetUrl = tikTokMedia.downloadUrl;
        if (!customFilename) {
          customFilename = tikTokMedia.filename;
        }
      } else {
        return res.status(400).send('URL TikTok ini tidak menyediakan file yang dapat diunduh secara langsung.');
      }
    } catch {
      return res.status(500).send('Gagal memproses URL TikTok.');
    }
  }

  // Double-check targetUrl format
  try {
    new URL(targetUrl);
  } catch {
    return res.status(400).send('URL target unduhan tidak valid.');
  }

  // Proxy stream media content directly to the browser for valid download
  const safeFilename = (customFilename || 'download-file.mp4')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .trim() || 'download-file.mp4';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const mediaRes = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': targetUrl.includes('tiktok') ? 'https://www.tiktok.com/' : 'https://google.com/',
      },
    });
    clearTimeout(timeout);

    if (mediaRes.ok) {
      const contentType = mediaRes.headers.get('content-type') || 'video/mp4';
      const cleanType = contentType.toLowerCase().includes('text/html') ? 'video/mp4' : contentType;
      const arrayBuffer = await mediaRes.arrayBuffer();

      res.setHeader('Content-Type', cleanType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeFilename)}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      return res.status(200).send(Buffer.from(arrayBuffer));
    }
  } catch {
    // Fallback to redirect if proxy stream fails
  }

  return res.redirect(302, targetUrl);
});

export { app };

async function main() {
  if (!process.env.NETLIFY && !process.env.VERCEL && !process.env.LAMBDA_TASK_ROOT && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.basename(currentDir) === 'dist' ? currentDir : path.join(currentDir, 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

main().catch(console.error);
