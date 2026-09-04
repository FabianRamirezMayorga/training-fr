/* sw.js — service worker.
   Deja la app usable sin conexión: los archivos propios se precargan y las
   imágenes del catálogo se guardan la primera vez que se ven. */
const VERSION = 'trainingfr-v60';
const SHELL = VERSION + '-shell';
const MEDIA = VERSION + '-media';
const MAX_MEDIA = 4000;         // imágenes guardadas como máximo (~200 MB)

const FILES = [
  './', './index.html',
  './css/styles.css',
  './js/i18n.js', './js/tecnica.js', './js/store.js', './js/ui.js', './js/data.js',
  './js/templates.js', './js/planner.js', './js/alternativas.js', './js/programa.js',
  './js/offline.js', './js/sync.js',
  './js/perfil.js', './js/objetivos.js', './js/alertas.js', './js/saludo.js', './js/ia.js',
  './js/spotify.js', './js/vistas.js', './js/vistas2.js', './js/vistas3.js',
  './js/vistas4.js', './js/vistas5.js', './js/vistas6.js',
  './js/workout.js', './js/app.js',
  './manifest.webmanifest',
  './icons/logo.svg', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'
];

/* Se descarga saltándose la caché del navegador: si no, unos archivos vienen
   nuevos y otros de hace diez minutos, y la app se queda con mitad de una
   versión y mitad de otra. Justo así aparecía "Spotify.traerAqui is not a
   function": vistas2.js del despliegue nuevo llamando a un spotify.js viejo. */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(SHELL)
      .then(function (c) {
        return c.addAll(FILES.map(function (u) {
          return new Request(u, { cache: 'reload' });
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (k) { return k.indexOf(VERSION) !== 0; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Recorta la caché de imágenes cuando crece demasiado */
function trim(cacheName, max) {
  caches.open(cacheName).then(function (c) {
    c.keys().then(function (keys) {
      if (keys.length <= max) return;
      for (let i = 0; i < keys.length - max; i++) c.delete(keys[i]);
    });
  });
}

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const esCatalogo = url.hostname.indexOf('jsdelivr') !== -1 ||
                     url.hostname.indexOf('githubusercontent') !== -1;

  /* Catálogo e imágenes: primero la caché, y se refresca en segundo plano */
  if (esCatalogo) {
    e.respondWith(
      caches.open(MEDIA).then(function (c) {
        return c.match(req).then(function (hit) {
          const red = fetch(req).then(function (res) {
            if (res && res.status === 200) { c.put(req, res.clone()); trim(MEDIA, MAX_MEDIA); }
            return res;
          }).catch(function () { return hit; });
          return hit || red;
        });
      })
    );
    return;
  }

  /* Nunca cachear la traducción ni las llamadas a la cuenta */
  if (url.hostname.indexOf('mymemory') !== -1) return;
  if (url.hostname.indexOf('supabase.co') !== -1) return;
  if (url.hostname.indexOf('googleapis.com') !== -1) return;
  if (url.hostname.indexOf('spotify.com') !== -1) return;

  /* Archivos propios: manda la caché de ESTA versión, que se instaló entera de
     una vez y por tanto es coherente. Las actualizaciones llegan cuando se
     instala el service worker nuevo, no archivo a archivo. */
  if (url.origin === location.origin) {
    e.respondWith(
      caches.open(SHELL).then(function (c) {
        return c.match(req).then(function (hit) {
          if (hit) return hit;
          return fetch(req).then(function (res) {
            if (res && res.status === 200 && res.type === 'basic') c.put(req, res.clone());
            return res;
          }).catch(function () {
            return caches.match(req).then(function (h) {
              return h || caches.match('./index.html');
            });
          });
        });
      })
    );
  }
});
