// sw.js — KILLER
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    try {
      // 1) vider tous les caches de ce domaine
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      // 2) se désenregistrer
      await self.registration.unregister();
      // 3) forcer le rechargement "propre" de tous les clients
      const cs = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      for (const c of cs) {
        const url = new URL(c.url);
        url.searchParams.set('nocache', Date.now());
        c.navigate(url.toString());
      }
    } catch (e) {}
  })());
});

// Aucun fetch handler -> laisse le réseau s'occuper des requêtes
