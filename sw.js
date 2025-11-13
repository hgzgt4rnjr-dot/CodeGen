const CACHE = "codegen-v1";
const ROOT  = "/CodeGen/";   // Adjust if your repo name changes

// All static files needed for fully offline operation
const OFFLINE_URLS = [
  ROOT,
  ROOT + "index.html",
  ROOT + "manifest.webmanifest",
  ROOT + "icon-192.png",
  ROOT + "icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Handle navigations separately (home-screen launches, address bar typing, etc)
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(ROOT + "index.html"))
    );
    return;
  }

  // For all other requests: cache-first, fallback to network
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
