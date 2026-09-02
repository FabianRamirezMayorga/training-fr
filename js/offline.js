/* offline.js — descarga imágenes del catálogo a la caché del navegador para poder
   entrenar sin conexión. El service worker ya guarda lo que ves; esto permite
   además adelantarse y bajar lo que vas a necesitar. */
(function (g) {
  'use strict';

  const CACHE = 'gymflow-v2-media';
  const CONCURRENCIA = 6;

  function soportado() { return 'caches' in window; }

  /* Todas las imágenes de una lista de ejercicios */
  function urlsDe(exs) {
    const out = [];
    exs.forEach(function (ex) {
      if (ex && ex.images && ex.images.length) Data.frames(ex).forEach(function (u) { out.push(u); });
    });
    return [...new Set(out)];
  }

  /* Ejercicios que aparecen en las rutinas guardadas y en favoritos */
  function deMisRutinas() {
    const ids = {};
    Store.routines().forEach(function (r) {
      r.exercises.forEach(function (e) { ids[e.exId] = true; });
    });
    Store.favorites().forEach(function (id) { ids[id] = true; });
    return Object.keys(ids).map(Data.get).filter(Boolean);
  }

  /* Los ejercicios que el planificador considera principales: buena cobertura
     de todos los músculos sin descargar el catálogo entero */
  function esenciales() {
    const ids = {};
    Object.keys(Planner.PICKS).forEach(function (m) {
      Planner.PICKS[m].forEach(function (id) { ids[id] = true; });
    });
    deMisRutinas().forEach(function (ex) { ids[ex.id] = true; });
    return Object.keys(ids).map(Data.get).filter(Boolean);
  }

  function todos() { return Data.all(); }

  /* Descarga con concurrencia limitada; devuelve cuántas se guardaron */
  function descargar(urls, onProgress) {
    if (!soportado()) return Promise.reject(new Error('Este navegador no permite guardar sin conexión.'));

    return caches.open(CACHE).then(function (cache) {
      let i = 0, hechas = 0, fallos = 0;
      const total = urls.length;

      function siguiente() {
        if (i >= urls.length) return Promise.resolve();
        const url = urls[i++];
        return cache.match(url).then(function (hit) {
          if (hit) return null;                       // ya estaba guardada
          return fetch(url, { mode: 'cors' }).then(function (res) {
            if (res && res.ok) return cache.put(url, res);
            throw new Error('HTTP ' + (res && res.status));
          });
        }).catch(function () { fallos++; })
          .then(function () {
            hechas++;
            if (onProgress) onProgress(hechas, total, fallos);
            return siguiente();
          });
      }

      const hilos = [];
      for (let k = 0; k < Math.min(CONCURRENCIA, urls.length); k++) hilos.push(siguiente());
      return Promise.all(hilos).then(function () {
        return { total: total, fallos: fallos };
      });
    });
  }

  /* Cuántas imágenes hay ya guardadas y cuánto ocupan (aproximado) */
  function estado() {
    if (!soportado()) return Promise.resolve({ guardadas: 0, mb: 0 });
    return caches.open(CACHE).then(function (c) {
      return c.keys().then(function (keys) {
        const imgs = keys.filter(function (r) { return /\.(jpg|jpeg|png|webp)$/i.test(r.url); });
        return { guardadas: imgs.length, mb: Math.round(imgs.length * 55 / 1024 * 10) / 10 };
      });
    });
  }

  function vaciar() {
    if (!soportado()) return Promise.resolve();
    return caches.delete(CACHE);
  }

  /* Precarga silenciosa de lo que hay en las rutinas del usuario.
     Se lanza al arrancar y tras guardar un plan; si falla, no pasa nada. */
  let precargando = false;
  function precargarRutinas() {
    if (precargando || !soportado()) return Promise.resolve();
    const exs = deMisRutinas();
    if (!exs.length) return Promise.resolve();
    precargando = true;
    return descargar(urlsDe(exs))
      .catch(function () { })
      .then(function () { precargando = false; });
  }

  g.Offline = {
    descargar: descargar, urlsDe: urlsDe, estado: estado, vaciar: vaciar,
    deMisRutinas: deMisRutinas, esenciales: esenciales, todos: todos,
    precargarRutinas: precargarRutinas, soportado: soportado
  };
})(window);
