
const CACHE_NAME = "dumaguete-boarding-houses-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) =>
            key.startsWith("dumaguete-boarding-houses-") &&
            key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Leave Supabase and other external requests alone.
  if (url.origin !== self.location.origin) return;
  if (request.method !== "GET") return;

  // For page navigation, prefer the latest website.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        return (
          await caches.match("./index.html")
        ) || Response.error();
      })
    );
    return;
  }

  // For local app files, use the cache when available.
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request);
    })
  );
});
