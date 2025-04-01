// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "advanced-metal-calculator-offline";
const OFFLINE_URL = "offline.html";
const VERSION = "1.0.1"; // Current version

// Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener("install", event => {
  console.log(`Installing service worker version ${VERSION}`);
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        OFFLINE_URL,
        "/",
        "/index.html",
        "/manifest.json",
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png"
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event cleans up old caches
self.addEventListener("activate", event => {
  console.log(`Activating service worker version ${VERSION}`);
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Add message listener for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  // For non-HTML requests, try the network first, fall back to the cache, finally the offline page
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache
            if (
              response.status === 200 &&
              response.type === "basic" &&
              !event.request.url.includes("/api/")
            ) {
              let responseClone = response.clone();
              caches.open(CACHE).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // If the request is for an HTML page, show the offline page
            if (event.request.headers.get("accept").includes("text/html")) {
              return caches.match(OFFLINE_URL);
            }
          })
      );
    })
  );
});

// This is an event that can be fired from your page to tell the SW to update the offline page
self.addEventListener("refreshOffline", () => {
  const offlinePageRequest = new Request(OFFLINE_URL);

  return fetch(offlinePageRequest).then(response => {
    return caches.open(CACHE).then(cache => {
      return cache.put(offlinePageRequest, response);
    });
  });
});
