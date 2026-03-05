// Aumenta questo numero ogni volta che cambi il CSS o il JS dei file HTML
const CACHE_NAME = 'tracker-hub-v3'; 

// Elenco dei file critici per far considerare l'app "installabile"
const ASSETS_TO_CACHE = [
  './',                  // La root (fondamentale)
  './index.html',        // La Landing Page
  './film_tracker.html', // Il tracker Film
  './serietv_tracker.html', // Il tracker Serie TV
  './manifest.json',
  './icon.svg'
];

// Installazione
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usiamo force-cache per assicurarci di prendere i file nuovi durante l'aggiornamento del SW
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Attivazione e pulizia
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// STRATEGIA: NETWORK FIRST
// Ottima per il tuo caso perché i voti e le liste cambiano spesso.
self.addEventListener('fetch', (event) => {
  // Escludiamo le chiamate alle API di Firebase e TMDb dalla cache del Service Worker
  // Altrimenti la cache diventerebbe enorme e i dati sarebbero vecchi
  if (event.request.url.includes('firebase') || event.request.url.includes('api.themoviedb.org')) {
    return; 
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se siamo online, aggiorniamo la cache con la versione fresca del file HTML/CSS/Icona
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se siamo OFFLINE, restituisci il file dalla cache
        return caches.match(event.request);
      })
  );
});
