const CACHE = "codegen-v2";  // bump version so browsers pick up the new SW
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
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
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // For navigation requests (opening/refreshing the app),
  // always try to serve the cached index.html first.
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((resp) => resp || fetch(event.request))
    );
    return;
  }

  // For everything else: cache-first, then network
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
