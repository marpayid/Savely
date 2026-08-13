// Monetag Service Worker Verification & Push Script
try {
  importScripts('https://fe244a.com/sw.js');
} catch (e) {
  // Fallback in case external script import is blocked or fails
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
