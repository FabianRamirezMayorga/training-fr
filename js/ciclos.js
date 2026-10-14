/* ciclos.js — cuándo toca renovar el menú y las rutinas.

   Un plan de entrenamiento y un menú no caducan como la leche, pero sí dejan de
   servir: el cuerpo se adapta al mismo estímulo y la comida repetida se acaba
   abandonando. Lo que hace falta no es una fecha de caducidad, es que *alguien
   se acuerde*, porque nadie lleva la cuenta de cuándo generó su plan.

   Dos plazos, y son distintos a propósito:

   - El menú, 15 días. Es lo que aguanta la variedad antes de que comer se
     convierta en un trámite, y es corto porque cambiarlo no cuesta nada:
     mañana comes otra cosa y ya.
   - Las rutinas, 4 semanas. Cambiarlas sí cuesta: hay que volver a aprender los
     pesos de cada ejercicio, y el progreso se mide comparándote contigo mismo
     en el mismo movimiento. Cambiar cada dos semanas sería borrar la referencia
     justo cuando empieza a valer.

   Y se avisa con tres días de antelación en vez de el mismo día. Un plan que
   cambia de golpe te pilla con la compra hecha; avisando antes, el cambio lo
   decides tú y además te da tiempo a terminar la semana como la tenías. */
(function (g) {
  'use strict';

  const DIAS = { menu: 15, rutina: 28 };
  const AVISO = 3;          /* días antes de que toque */
  const CLAVE = 'ciclos';

  function ajustes() {
    try { return Store.settings().ciclos || {}; }
    catch (e) { return {}; }
  }

  function guardar(c) { Store.setSetting(CLAVE, c); }

  function dias(desde) {
    return Math.floor((Date.now() - desde) / 86400000);
  }

  /* Desde cuándo cuenta cada cosa.

     El menú lo sabe él solo: cada menú guarda cuándo se creó. Las rutinas no
     —una rutina no tiene fecha de nacimiento, se edita y sigue siendo la
     misma— así que la fecha se apunta aquí cuando se genera un plan. Y si no
     hay ninguna apuntada, porque la app es anterior a esto, se toma la primera
     vez que se mira: lo contrario sería decirle a alguien que su plan tiene mil
     días el día que actualiza. */
  function desdeMenu() {
    const m = g.Menus && Menus.activo();
    return m && m.t ? m.t : 0;
  }

  function desdeRutina() {
    const c = ajustes();
    if (c.rutina) return c.rutina;
    if (!g.Store || !Store.routines().length) return 0;
    const ahora = Date.now();
    guardar(Object.assign({}, c, { rutina: ahora }));
    return ahora;
  }

  function unEstado(que, desde) {
    if (!desde) return { que: que, hay: false };
    const edad = dias(desde);
    const quedan = DIAS[que] - edad;
    return {
      que: que, hay: true, desde: desde, edad: edad, quedan: quedan,
      total: DIAS[que],
      /* «toca» es que ya ha pasado el plazo; «pronto» es que está al caer. */
      toca: quedan <= 0,
      pronto: quedan > 0 && quedan <= AVISO
    };
  }

  function estado() {
    return {
      menu: unEstado('menu', desdeMenu()),
      rutina: unEstado('rutina', desdeRutina())
    };
  }

  /* Lo que hay que enseñar ahora mismo. Vacío la mayor parte del mes, que es
     como tiene que ser: un aviso que sale siempre deja de ser un aviso. */
  function pendientes() {
    const e = estado();
    const c = ajustes();
    const hoy = Store.dayKey(Date.now());
    return ['menu', 'rutina'].map(function (k) { return e[k]; })
      .filter(function (x) {
        if (!x.hay || (!x.toca && !x.pronto)) return false;
        /* Aplazado hoy: no se repite hasta mañana. Lo que no se puede es
           silenciarlo para siempre, porque entonces el plazo no significa
           nada. */
        return c['visto_' + x.que] !== hoy;
      });
  }

  function aplazar(que) {
    const c = Object.assign({}, ajustes());
    c['visto_' + que] = Store.dayKey(Date.now());
    guardar(c);
  }

  /* Se llama al generar un plan nuevo: reinicia la cuenta. El menú no lo
     necesita porque el suyo sale de la fecha del propio menú. */
  function marcarRenovado(que) {
    const c = Object.assign({}, ajustes());
    if (que === 'rutina') c.rutina = Date.now();
    delete c['visto_' + que];
    guardar(c);
  }

  g.Ciclos = {
    DIAS: DIAS, AVISO: AVISO,
    estado: estado, pendientes: pendientes,
    aplazar: aplazar, marcarRenovado: marcarRenovado
  };
})(window);
