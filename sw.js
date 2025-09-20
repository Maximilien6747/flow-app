// sw.js
const CACHE = "flow-v4";
const ASSETS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Servir index.html pour la racine
  if (url.origin === location.origin &&
      (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html"))) {
    e.respondWith(caches.match("./index.html").then(r => r || fetch("./index.html")));
    return;
  }

  // Network-first avec fallback cache puis index.html
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() =>
      caches.match(req).then(r => r || caches.match("./index.html"))
    )
  );
});
