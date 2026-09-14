/* agua.js — lo que bebes, vaso a vaso.

   El plan de comidas ya decía cuánta agua tomar y a qué horas, pero no había
   dónde apuntar que la habías tomado: la pauta se quedaba en un consejo. Aquí
   se guarda cada toma, y con eso la app puede decir cuánto llevas del día en
   vez de cuánto deberías.

   Vive donde vive el registro de comida y por lo mismo: es de este teléfono y
   no viaja con la sincronización. Perder una lista de vasos no puede costarle
   a nadie sus entrenamientos. */
(function (g) {
  'use strict';

  const CLAVE = 'trainingfr.agua';
  const DIAS_QUE_SE_GUARDAN = 120;
  const VASO = 250;               // ml, lo que se apunta si nadie dice otra cosa

  function leer() {
    try {
      const raw = localStorage.getItem(CLAVE);
      const l = raw ? JSON.parse(raw) : [];
      return Array.isArray(l) ? l : [];
    } catch (e) { return []; }
  }

  function escribir(l) {
    try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch (e) { /* sin sitio */ }
  }

  function claveDia(t) {
    return g.Comidas ? Comidas.claveDia(t) : String(t);
  }

  function todas() {
    const corte = Date.now() - DIAS_QUE_SE_GUARDAN * 86400000;
    return leer().filter(function (x) { return x && x.t >= corte; })
      .sort(function (a, b) { return b.t - a.t; });
  }

  function del(dia) {
    const d = dia || claveDia();
    return todas().filter(function (x) { return claveDia(x.t) === d; });
  }

  /* Lo que llevas hoy, en mililitros y en litros con un decimal */
  function hoy() {
    const l = del();
    const ml = l.reduce(function (n, x) { return n + (Number(x.ml) || 0); }, 0);
    return { lista: l, ml: ml, litros: Math.round(ml / 100) / 10 };
  }

  /* `ref` señala a qué toma de la pauta corresponde, para poder pintarla
     marcada y para no apuntarla dos veces. Un vaso suelto no lleva ninguna. */
  function anotar(ml, ref) {
    const l = todas();
    const x = {
      id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      t: Date.now(),
      ml: Math.max(0, Math.round(Number(ml) || VASO)),
      ref: String(ref || '')
    };
    l.push(x);
    escribir(l);
    return x;
  }

  function borrar(id) {
    escribir(todas().filter(function (x) { return x.id !== id; }));
  }

  /* ¿Está marcada ya esta toma de la pauta, hoy? */
  function marcada(ref) {
    if (!ref) return null;
    return del().filter(function (x) { return x.ref === ref; })[0] || null;
  }

  /* Marcar y desmarcar con el mismo gesto: tocar una toma ya marcada la quita,
     que es lo que uno espera de una casilla. */
  function alternar(ref, ml) {
    const ya = marcada(ref);
    if (ya) { borrar(ya.id); return null; }
    return anotar(ml, ref);
  }

  /* Cuántos mililitros dice un renglón de la pauta —«10:00: 500 ml de agua»—.
     Si no lo dice, un vaso. */
  function mlDeTexto(t) {
    const s = String(t || '');
    const litros = s.match(/(\d+[.,]?\d*)\s*l\b/i);
    if (litros) return Math.round(parseFloat(litros[1].replace(',', '.')) * 1000);
    const ml = s.match(/(\d{2,4})\s*ml\b/i);
    if (ml) return Number(ml[1]);
    return VASO;
  }

  function ultimos(dias) {
    const n = dias || 7;
    const fuera = [];
    for (let i = 0; i < n; i++) {
      const t = Date.now() - i * 86400000;
      const d = claveDia(t);
      const ml = del(d).reduce(function (a, x) { return a + (Number(x.ml) || 0); }, 0);
      fuera.push({ dia: d, t: t, ml: ml });
    }
    return fuera;
  }

  function vaciar() { localStorage.removeItem(CLAVE); }

  /* ---------- si esto se lleva o no ----------
     Marcar cada vaso no le apetece a todo el mundo, así que se pregunta una vez
     y se respeta. Por defecto sí: quien no lo quiera lo apaga, y quien no sepa
     que existe lo descubre. */
  function seLleva() { return Store.settings().registroAgua !== 'no'; }

  g.Agua = {
    hoy: hoy, todas: todas, del: del, anotar: anotar, borrar: borrar,
    marcada: marcada, alternar: alternar, mlDeTexto: mlDeTexto,
    ultimos: ultimos, vaciar: vaciar, seLleva: seLleva, VASO: VASO
  };
})(window);
