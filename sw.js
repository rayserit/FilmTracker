// CAMBIA QUESTO NUMERO OGNI VOLTA CHE AGGIORNI IL CODICE IMPORTANTE
// (es. v2, v3, v4...) così forzi i browser a ricaricare tutto.
const CACHE_NAME = 'tv-tracker-v2'; 

const ASSETS_TO_CACHE = [
  './serietv_tracker.html',
  './manifest.json',
  './icon.svg'
];

// Installazione
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forza l'attivazione immediata
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Attivazione e pulizia vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Rimozione vecchia cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim(); // Prende il controllo immediatamente
});

// STRATEGIA: NETWORK FIRST (Fondamentale per vedere gli aggiornamenti)
// Cerca sempre di scaricare la versione nuova. Se non c'è internet, usa la cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se il download va a buon fine, aggiorniamo la cache con la nuova versione
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Se siamo OFFLINE o il server non risponde, usiamo la cache
        return caches.match(event.request);
      })
  );
});
