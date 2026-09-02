/* objetivos.js — metas medibles con seguimiento automático.
   Cada meta sabe leer su propio progreso de los datos que ya tiene la app,
   así que no hay que actualizarlas a mano. */
(function (g) {
  'use strict';

  /* Cada tipo declara cómo se mide y cómo se lee su valor actual */
  const TIPOS = {
    peso: {
      label: 'Llegar a un peso', unidad: 'kg', icono: 'perfil',
      note: 'Se actualiza con cada pesaje que registres',
      actual: function () { return Perfil.datos().peso || 0; },
      inicio: function (m) { return m.desde || 0; },
      formato: function (v) { return UI.num(v) + ' kg'; }
    },
    entrenos: {
      label: 'Entrenar por semana', unidad: 'sesiones', icono: 'dumbbell',
      note: 'Cuenta los entrenamientos de los últimos 7 días',
      actual: function () { return Store.stats().week; },
      inicio: function () { return 0; },
      formato: function (v) { return Math.round(v) + ' sesiones'; }
    },
    racha: {
      label: 'Mantener una racha', unidad: 'días', icono: 'flag',
      note: 'Días seguidos entrenando',
      actual: function () { return Store.stats().streak; },
      inicio: function () { return 0; },
      formato: function (v) { return Math.round(v) + ' días'; }
    },
    volumen: {
      label: 'Volumen semanal', unidad: 'kg movidos', icono: 'grafica',
      note: 'Peso por repeticiones de los últimos 7 días',
      actual: function () { return Store.stats().weekVolume; },
      inicio: function () { return 0; },
      formato: function (v) { return UI.num(v) + ' kg'; }
    },
    marca: {
      label: 'Récord en un ejercicio', unidad: 'kg', icono: 'trofeo',
      note: 'Tu mejor serie en el ejercicio elegido',
      actual: function (m) {
        const pr = Store.prOf(m.exId);
        return pr.best ? pr.best.weight : 0;
      },
      inicio: function (m) { return m.desde || 0; },
      formato: function (v) { return UI.num(v) + ' kg'; }
    },
    total: {
      label: 'Entrenamientos totales', unidad: 'sesiones', icono: 'flag',
      note: 'Todos los entrenamientos registrados',
      actual: function () { return Store.stats().total; },
      inicio: function (m) { return m.desde || 0; },
      formato: function (v) { return Math.round(v) + ' sesiones'; }
    }
  };

  function lista() { return Store.settings().objetivos || []; }

  function guardarLista(arr) { Store.setSetting('objetivos', arr); }

  function nuevo(tipo) {
    return {
      id: Store.uid(), tipo: tipo, meta: 0, desde: 0, exId: '',
      creado: Date.now(), fin: 0, logrado: 0, nota: ''
    };
  }

  function guardar(m) {
    const arr = lista().slice();
    const i = arr.findIndex(function (x) { return x.id === m.id; });
    if (i === -1) arr.push(m); else arr[i] = m;
    guardarLista(arr);
    return m;
  }

  function borrar(id) {
    guardarLista(lista().filter(function (m) { return m.id !== id; }));
  }

  /* Progreso de 0 a 1, contando desde el punto de partida hasta la meta.
     Sirve igual para subir (ganar peso, más volumen) que para bajar (perder peso). */
  function progreso(m) {
    const t = TIPOS[m.tipo];
    if (!t) return { pct: 0, actual: 0, cumplido: false };

    const actual = t.actual(m);
    const inicio = t.inicio(m);
    const meta = Number(m.meta) || 0;

    let pct;
    if (meta === inicio) pct = actual >= meta ? 1 : 0;
    else pct = (actual - inicio) / (meta - inicio);

    pct = Math.max(0, Math.min(1, pct));
    const bajando = meta < inicio;
    const cumplido = bajando ? actual <= meta : actual >= meta;

    return { pct: cumplido ? 1 : pct, actual: actual, inicio: inicio, cumplido: cumplido };
  }

  /* Revisa las metas y marca las recién cumplidas. Devuelve las que acaban de lograrse. */
  function revisar() {
    const arr = lista().slice();
    const nuevas = [];
    let cambio = false;
    arr.forEach(function (m) {
      const p = progreso(m);
      if (p.cumplido && !m.logrado) { m.logrado = Date.now(); nuevas.push(m); cambio = true; }
      if (!p.cumplido && m.logrado) { m.logrado = 0; cambio = true; }
    });
    if (cambio) guardarLista(arr);
    return nuevas;
  }

  function etiqueta(m) {
    const t = TIPOS[m.tipo];
    if (!t) return 'Objetivo';
    if (m.tipo === 'marca') {
      const ex = Data.get(m.exId);
      return 'Récord en ' + (ex ? ex.nameEs : 'un ejercicio');
    }
    return t.label;
  }

  function formato(m, valor) {
    const t = TIPOS[m.tipo];
    return t ? t.formato(valor) : String(valor);
  }

  /* Resumen para la IA */
  function resumen() {
    const arr = lista();
    if (!arr.length) return '';
    return arr.map(function (m) {
      const p = progreso(m);
      return etiqueta(m) + ': ' + formato(m, p.actual) + ' de ' + formato(m, m.meta) +
        (p.cumplido ? ' (cumplido)' : ' (' + Math.round(p.pct * 100) + '%)');
    }).join('; ') + '.';
  }

  g.Objetivos = {
    TIPOS: TIPOS, lista: lista, nuevo: nuevo, guardar: guardar, borrar: borrar,
    progreso: progreso, revisar: revisar, etiqueta: etiqueta, formato: formato,
    resumen: resumen
  };
})(window);
