const CACHE = "codegen-v4"; // bump version so browsers pick up the new SW

// Everything your app needs to run completely offline.
// Make sure these files exist next to index.html.
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",
  "./background.png",
  "./backgroundC.png",
  "./icon-192.png",
  "./icon-512.png"
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests to our own origin.
  if (event.request.method !== "GET" || url.origin !== location.origin) {
    return;
  }

  // For navigation (opening/refreshing/app from home screen),
  // always give them the cached index.html and NEVER hit the network.
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((resp) => {
        // index.html should always be cached after install
        if (resp) return resp;
        // Fallback to any cached root if things get weird
        return caches.match("./");
      })
    );
    return;
  }

  // For everything else (icons, manifest, sw):
  // serve from cache only, and if we somehow don't have it,
  // fall back to index.html instead of ever going to the network.
  event.respondWith(
    caches.match(event.request).then((resp) => {
      if (resp) return resp;
      return caches.match("./index.html");
    })
  );
});
