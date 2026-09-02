/* store.js — todo el estado del usuario vive en localStorage del navegador.
   Sin servidor, sin cuentas, sin coste. Export/import JSON para mover los datos
   entre dispositivos o guardar una copia de seguridad. */
(function (g) {
  'use strict';

  const KEY = 'trainingfr.v1';
  const KEY_ANTERIOR = 'gymflow.v1';   // la app se llamaba GymFlow

  const DEFAULTS = {
    version: 1,
    settings: {
      unit: 'kg', theme: 'dark', rest: 90, sound: true, name: '', gear: '',
      /* 'detallado' anota peso y repeticiones; 'simple' solo marca la serie hecha */
      registro: 'detallado'
    },
    routines: [],
    sessions: [],
    favorites: [],
    active: null   // entrenamiento en curso (sobrevive a un cierre del navegador)
  };

  let state = load();

  function load() {
    try {
      let raw = localStorage.getItem(KEY);
      /* datos guardados con el nombre anterior: se conservan */
      if (!raw) {
        const viejo = localStorage.getItem(KEY_ANTERIOR);
        if (viejo) { raw = viejo; localStorage.setItem(KEY, viejo); localStorage.removeItem(KEY_ANTERIOR); }
      }
      if (!raw) return clone(DEFAULTS);
      const data = JSON.parse(raw);
      return Object.assign(clone(DEFAULTS), data, {
        settings: Object.assign({}, DEFAULTS.settings, data.settings || {})
      });
    } catch (e) {
      console.warn('No se pudo leer el almacenamiento local:', e);
      return clone(DEFAULTS);
    }
  }

  let silencioso = false;

  function save() {
    try {
      if (!silencioso) state.updatedAt = Date.now();
      localStorage.setItem(KEY, JSON.stringify(state));
      if (!silencioso && g.Sync && Sync.activa()) Sync.programarSubida();
      return true;
    } catch (e) {
      console.error('No se pudo guardar:', e);
      return false;
    }
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ---------- ajustes ---------- */
  function settings() { return state.settings; }
  function setSetting(k, v) { state.settings[k] = v; save(); }

  /* ---------- favoritos ---------- */
  function isFav(id) { return state.favorites.indexOf(id) !== -1; }
  function toggleFav(id) {
    const i = state.favorites.indexOf(id);
    if (i === -1) state.favorites.push(id); else state.favorites.splice(i, 1);
    save();
    return i === -1;
  }
  function favorites() { return state.favorites.slice(); }

  /* ---------- rutinas ---------- */
  function routines() { return state.routines; }
  function routine(id) { return state.routines.find(function (r) { return r.id === id; }) || null; }

  function saveRoutine(r) {
    if (!r.id) {
      r.id = uid();
      r.createdAt = Date.now();
      state.routines.push(r);
    } else {
      const i = state.routines.findIndex(function (x) { return x.id === r.id; });
      if (i === -1) state.routines.push(r); else state.routines[i] = r;
    }
    r.updatedAt = Date.now();
    save();
    return r;
  }

  function deleteRoutine(id) {
    state.routines = state.routines.filter(function (r) { return r.id !== id; });
    save();
  }

  function duplicateRoutine(id) {
    const r = routine(id);
    if (!r) return null;
    const copy = clone(r);
    copy.id = null;
    copy.name = r.name + ' (copia)';
    return saveRoutine(copy);
  }

  function newRoutine() {
    return { id: null, name: '', note: '', days: [], exercises: [] };
  }

  function newRoutineExercise(exId) {
    return {
      exId: exId,
      sets: 3,
      reps: 10,
      weight: 0,
      rest: state.settings.rest || 90,
      note: ''
    };
  }

  /* ---------- entrenamiento en curso ---------- */
  function active() { return state.active; }
  function setActive(a) { state.active = a; save(); }
  function clearActive() { state.active = null; save(); }

  /* ---------- sesiones terminadas ---------- */
  function sessions() { return state.sessions; }

  function addSession(s) {
    s.id = s.id || uid();
    state.sessions.unshift(s);
    save();
    return s;
  }

  function deleteSession(id) {
    state.sessions = state.sessions.filter(function (s) { return s.id !== id; });
    save();
  }

  /* Todas las series registradas de un ejercicio, de la más reciente a la más antigua */
  function historyOf(exId) {
    const out = [];
    state.sessions.forEach(function (s) {
      (s.entries || []).forEach(function (e) {
        if (e.exId !== exId) return;
        const done = (e.sets || []).filter(function (x) { return x.done && x.reps > 0; });
        if (done.length) out.push({ date: s.start, sets: done });
      });
    });
    return out.sort(function (a, b) { return b.date - a.date; });
  }

  /* Récord personal: mayor peso levantado y mejor 1RM estimado (fórmula de Epley) */
  function prOf(exId) {
    let best = null, bestOrm = null;
    historyOf(exId).forEach(function (h) {
      h.sets.forEach(function (s) {
        const w = Number(s.weight) || 0, r = Number(s.reps) || 0;
        if (!r) return;
        if (!best || w > best.weight) best = { weight: w, reps: r, date: h.date };
        const orm = w * (1 + r / 30);
        if (w > 0 && (!bestOrm || orm > bestOrm.orm)) bestOrm = { orm: orm, weight: w, reps: r, date: h.date };
      });
    });
    return { best: best, orm: bestOrm };
  }

  /* Última vez que se hizo un ejercicio, para precargar peso y reps */
  function lastPerformance(exId) {
    const h = historyOf(exId);
    return h.length ? h[0] : null;
  }

  /* ---------- estadísticas ---------- */
  function volumeOf(session) {
    let v = 0;
    (session.entries || []).forEach(function (e) {
      (e.sets || []).forEach(function (s) {
        if (s.done) v += (Number(s.weight) || 0) * (Number(s.reps) || 0);
      });
    });
    return Math.round(v);
  }

  function dayKey(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* Racha en semanas: semanas consecutivas (hacia atrás) con al menos un entrenamiento */
  function streakDays() {
    const days = new Set(state.sessions.map(function (s) { return dayKey(s.start); }));
    if (!days.size) return 0;
    let n = 0;
    const d = new Date();
    /* si hoy aún no se ha entrenado, la racha puede seguir viva desde ayer */
    if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
    while (days.has(dayKey(d.getTime()))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function stats() {
    const now = Date.now();
    const weekAgo = now - 7 * 864e5;
    const week = state.sessions.filter(function (s) { return s.start >= weekAgo; });
    const totalVol = state.sessions.reduce(function (a, s) { return a + (s.volume || 0); }, 0);
    const totalMin = state.sessions.reduce(function (a, s) {
      return a + Math.round(((s.end || s.start) - s.start) / 60000);
    }, 0);
    return {
      total: state.sessions.length,
      week: week.length,
      weekVolume: week.reduce(function (a, s) { return a + (s.volume || 0); }, 0),
      weekSets: week.reduce(function (a, s) { return a + (s.setsDone || 0); }, 0),
      totalSets: state.sessions.reduce(function (a, s) { return a + (s.setsDone || 0); }, 0),
      totalVolume: totalVol,
      totalMinutes: totalMin,
      streak: streakDays()
    };
  }

  /* Volumen agrupado por semana, para el gráfico de barras */
  function weeklyVolume(weeks) {
    weeks = weeks || 8;
    const out = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dow = (now.getDay() + 6) % 7;           // lunes = 0
    const thisMonday = now.getTime() - dow * 864e5;
    for (let i = weeks - 1; i >= 0; i--) {
      const from = thisMonday - i * 7 * 864e5;
      const to = from + 7 * 864e5;
      const ss = state.sessions.filter(function (s) { return s.start >= from && s.start < to; });
      out.push({
        from: from,
        volume: ss.reduce(function (a, s) { return a + (s.volume || 0); }, 0),
        sets: ss.reduce(function (a, s) { return a + (s.setsDone || 0); }, 0),
        count: ss.length
      });
    }
    return out;
  }

  /* ---------- copia de seguridad ---------- */
  function exportJSON() { return JSON.stringify(state, null, 2); }

  /* El estado tal cual, para subirlo a la nube */
  function exportar() { return clone(state); }

  /* Reemplaza el estado con el de la nube sin volver a sellar la hora:
     así la marca de tiempo sigue siendo la del dispositivo que hizo el cambio. */
  function importar(data) {
    state = Object.assign(clone(DEFAULTS), data, {
      settings: Object.assign({}, DEFAULTS.settings, (data && data.settings) || {})
    });
    silencioso = true;
    save();
    silencioso = false;
  }

  function importJSON(text) {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || !Array.isArray(data.routines)) {
      throw new Error('El archivo no tiene el formato de una copia de Training FR.');
    }
    state = Object.assign(clone(DEFAULTS), data, {
      settings: Object.assign({}, DEFAULTS.settings, data.settings || {})
    });
    save();
  }

  function wipe() { state = clone(DEFAULTS); save(); }

  g.Store = {
    settings: settings, setSetting: setSetting,
    isFav: isFav, toggleFav: toggleFav, favorites: favorites,
    routines: routines, routine: routine, saveRoutine: saveRoutine,
    deleteRoutine: deleteRoutine, duplicateRoutine: duplicateRoutine,
    newRoutine: newRoutine, newRoutineExercise: newRoutineExercise,
    active: active, setActive: setActive, clearActive: clearActive,
    sessions: sessions, addSession: addSession, deleteSession: deleteSession,
    historyOf: historyOf, prOf: prOf, lastPerformance: lastPerformance,
    volumeOf: volumeOf, stats: stats, weeklyVolume: weeklyVolume, dayKey: dayKey,
    exportJSON: exportJSON, importJSON: importJSON, wipe: wipe, uid: uid,
    exportar: exportar, importar: importar
  };
})(window);
