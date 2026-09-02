/* data.js — catálogo de ejercicios.
   Fuente: free-exercise-db (dominio público) servida por el CDN gratuito de jsDelivr.
   876 ejercicios, cada uno con 2 fotogramas (inicio y fin del movimiento) que la app
   alterna para animar la técnica correcta. */
(function (g) {
  'use strict';

  const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/';
  const MIRROR = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/';
  const JSON_PATH = 'dist/exercises.json';
  const CACHE_KEY = 'gymflow.catalog.v1';

  let list = [];
  let byId = {};

  const PLACEHOLDER =
    'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3">' +
      '<rect width="4" height="3" fill="#212836"/>' +
      '<path d="M.7 1.5v.6M1.2 1.3v1M2.8 1.3v1M3.3 1.5v.6M1.2 1.8h1.6" ' +
      'stroke="#3ddc84" stroke-width=".12" stroke-linecap="round" fill="none"/></svg>');

  /* URL del fotograma i de un ejercicio (0 = inicio, 1 = final del movimiento) */
  function img(ex, i) {
    if (!ex || !ex.images || !ex.images.length) return PLACEHOLDER;
    return CDN + 'exercises/' + ex.images[Math.min(i || 0, ex.images.length - 1)];
  }

  function frames(ex) {
    if (!ex || !ex.images || !ex.images.length) return [PLACEHOLDER];
    return ex.images.map(function (p) { return CDN + 'exercises/' + p; });
  }

  /* Texto normalizado sobre el que busca el usuario: inglés + español */
  function haystack(ex) {
    const parts = [
      ex.name, ex.nameEs, ex.equipment, I18N.equip(ex.equipment),
      ex.category, I18N.category(ex.category), I18N.level(ex.level)
    ];
    (ex.primaryMuscles || []).concat(ex.secondaryMuscles || []).forEach(function (m) {
      parts.push(m, I18N.muscle(m));
    });
    return I18N.norm(parts.filter(Boolean).join(' '));
  }

  function prepare(raw) {
    list = raw.map(function (ex) {
      const e = Object.assign({}, ex);
      e.nameEs = I18N.name(ex.name);
      e.groups = I18N.GROUPS
        .filter(function (gr) {
          return (ex.primaryMuscles || []).some(function (m) { return gr.muscles.indexOf(m) !== -1; });
        })
        .map(function (gr) { return gr.id; });
      e._q = haystack(e);
      return e;
    }).sort(function (a, b) { return a.nameEs.localeCompare(b.nameEs, 'es'); });

    byId = {};
    list.forEach(function (e) { byId[e.id] = e; });
    return list;
  }

  function fetchJSON(url) {
    return fetch(url, { cache: 'default' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  /* Carga el catálogo: CDN -> espejo en GitHub -> copia local guardada antes. */
  function load() {
    return fetchJSON(CDN + JSON_PATH)
      .catch(function () { return fetchJSON(MIRROR + JSON_PATH); })
      .then(function (raw) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(raw)); } catch (e) { /* cuota llena: no es crítico */ }
        return prepare(raw);
      })
      .catch(function (err) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) return prepare(JSON.parse(cached));
        throw err;
      });
  }

  function all() { return list; }
  function get(id) { return byId[id] || null; }

  /* filtros: {q, group, muscle, equipment, level, category, favs} */
  function search(f) {
    f = f || {};
    const q = I18N.norm(f.q || '');
    const terms = q ? q.split(' ').filter(Boolean) : [];
    return list.filter(function (e) {
      if (f.group && e.groups.indexOf(f.group) === -1) return false;
      if (f.muscle && (e.primaryMuscles || []).indexOf(f.muscle) === -1) return false;
      if (f.equipment && e.equipment !== f.equipment) return false;
      if (f.level && e.level !== f.level) return false;
      if (f.category && e.category !== f.category) return false;
      if (f.favs && !Store.isFav(e.id)) return false;
      for (let i = 0; i < terms.length; i++) {
        if (e._q.indexOf(terms[i]) === -1) return false;
      }
      return true;
    });
  }

  /* Enlace a una búsqueda en YouTube, para ver el movimiento en vídeo real */
  function youtube(ex) {
    return 'https://www.youtube.com/results?search_query=' +
      encodeURIComponent('como hacer ' + ex.nameEs + ' tecnica correcta');
  }

  g.Data = {
    load: load, all: all, get: get, search: search,
    img: img, frames: frames, youtube: youtube, PLACEHOLDER: PLACEHOLDER
  };
})(window);
