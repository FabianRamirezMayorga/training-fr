/* vistas9.js — medir una salida con el GPS.

   Pantalla de dos estados y nada más: elegir qué vas a hacer, y los números
   mientras lo haces. Lo que se ve mientras se anda tiene que leerse de un
   vistazo y con el brazo en movimiento, así que los kilómetros van enormes y
   el resto en una fila por debajo, que es el orden en el que se miran.

   No hay mapa. Un mapa de verdad necesita una librería y un servicio de
   mosaicos —dependencia y factura, las dos cosas que esta app no tiene— y para
   saber que diste la vuelta al parque basta con la forma del recorrido, que se
   dibuja aquí mismo con un trazo SVG. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };

  /* Las cuatro donde la distancia significa algo. Nadar no entra aunque mida
     distancia: el GPS no atraviesa el agua y daría cero metros y una hora. */
  const CUALES = [
    { id: 'caminar', ico: 'caminar' },
    { id: 'correr', ico: 'correr' },
    { id: 'bici', ico: 'bici' },
    { id: 'senderismo', ico: 'senderismo' }
  ];

  let elegida = 'caminar';
  let soltar = null;

  function actDe(id) {
    return (g.App && App.actividadPorId && App.actividadPorId(id)) ||
      { id: id, label: id, met: 4, musculos: [] };
  }

  /* ---------- lo que se ve mientras andas ---------- */

  function dato(valor, etiqueta) {
    return '<span class="med-dato"><b>' + esc(valor) + '</b>' +
      '<i>' + esc(etiqueta) + '</i></span>';
  }

  function panelHTML(e) {
    const km = e.km < 10 ? e.km.toFixed(2) : e.km.toFixed(1);
    const traza = Medir.trazaSVG(e.puntos, 300, 120);
    return html`
      <div class="card med-panel${raw(e.fase === 'pausa' ? ' en-pausa' : '')}">
        <div class="med-km"><b>${km}</b><i>km</i></div>
        <div class="med-fila">
          ${raw(dato(e.tiempo, T('Tiempo')))}
          ${raw(dato(e.ritmo, e.act === 'bici' ? T('Velocidad') : T('Ritmo')))}
          ${raw(dato(UI.num(e.kcal), T('kcal')))}
        </div>
        ${raw(e.cadencia ? '<div class="med-fila med-fila2">' +
          dato(UI.num(e.pasos), T('Pasos')) +
          dato(e.cadencia + '', T('Pasos/min')) + '</div>' : '')}
        ${raw(traza ? '<svg class="med-traza" viewBox="0 0 300 120" ' +
          'preserveAspectRatio="xMidYMid meet"><path d="' + traza + '"/></svg>' : '')}
        ${raw(e.fase === 'pausa'
          ? '<p class="med-aviso">' + esc(T('En pausa. No se está sumando distancia.')) + '</p>'
          : e.error ? '<p class="med-aviso mal">' + esc(e.error) + '</p>'
          : e.senal === 'mala'
            ? '<p class="med-aviso">' + esc(Tn('Señal floja ({m} m). Lo que se mueva ' +
                'ahora no se suma, para no inventar metros.', { m: e.precision })) + '</p>'
            : '')}
      </div>`;
  }

  /* ---------- la vista ---------- */

  V.medir = function () {
    const s = Medir.soporta();
    const e = Medir.estado();

    if (!s.gps) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} ${T('Volver')}</button>
        <h1>${T('Medir con el GPS')}</h1>
        <div class="card"><p style="margin:0">${T('Este navegador no da acceso a la ' +
          'ubicación, así que aquí no se puede medir. Puedes apuntar la salida a mano ' +
          'con los minutos que fueron.')}</p></div>`;
    }

    if (e.fase === 'midiendo' || e.fase === 'pausa') {
      return html`
        <h1 class="med-tit">${raw(icon(icoDe(e.act)))} ${T(actDe(e.act).label)}</h1>
        <div id="med-panel">${raw(panelHTML(e))}</div>
        <div class="row med-botones">
          <button class="btn grow" data-a="${e.fase === 'pausa' ? 'seguir' : 'pausar'}">
            ${raw(icon(e.fase === 'pausa' ? 'play' : 'pause'))}
            ${e.fase === 'pausa' ? T('Seguir') : T('Pausar')}</button>
          <button class="btn primary grow" data-a="terminar">
            ${raw(icon('flag'))} ${T('Terminar')}</button>
        </div>
        <button class="enlace-flojo" data-a="tirar" style="margin-top:14px">
          ${T('Descartar sin guardar')}</button>`;
    }

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Volver')}</button>
      <h1>${T('Medir con el GPS')}</h1>
      <p class="muted">${T('Mide la distancia, el ritmo y lo que gastas de verdad, en vez ' +
        'de estimarlo por los minutos. Lo que midas se guarda como una actividad más.')}</p>

      <div class="med-elige">
        ${raw(CUALES.map(function (c) {
          return '<button class="med-opcion' + (elegida === c.id ? ' on' : '') + '" ' +
            'data-act="' + c.id + '">' + icon(c.ico) +
            '<span>' + esc(T(actDe(c.id).label)) + '</span></button>';
        }).join(''))}
      </div>

      <button class="btn primary block" data-a="empezar" style="margin-top:16px">
        ${raw(icon('ubicacion'))} ${T('Empezar a medir')}</button>

      <p class="tiny muted" style="margin-top:14px">${T('Mientras mide, la pantalla se ' +
        'queda encendida y el GPS gasta batería. Con el móvil bloqueado el navegador ' +
        'congela la página y se deja de contar, así que esto es para llevarlo en la mano ' +
        'o con la pantalla visible.')}</p>
      ${raw(s.movimiento ? '<p class="tiny muted">' + esc(T('Si das permiso al sensor de ' +
        'movimiento, cuenta también los pasos y el ritmo de zancada.')) + '</p>' : '')}`;
  };

  function icoDe(id) {
    const c = CUALES.filter(function (x) { return x.id === id; })[0];
    return c ? c.ico : 'correr';
  }

  V.medir.mount = function (root) {
    bindAll(root, '[data-act]', function (el) {
      elegida = el.getAttribute('data-act');
      App.render();
    });

    bind(root, '[data-a=atras]', function () { go('perfil'); });

    bind(root, '[data-a=empezar]', function () {
      const a = actDe(elegida);
      if (!Medir.arrancar(elegida, a.met)) {
        UI.toast(T('No se pudo arrancar el GPS.'));
        return;
      }
      App.render();
    });

    bind(root, '[data-a=pausar]', function () { Medir.pausar(); App.render(); });
    bind(root, '[data-a=seguir]', function () { Medir.seguir(); App.render(); });

    bind(root, '[data-a=tirar]', function () {
      UI.confirm(T('Descartar esta salida'), T('No se guardará nada de lo medido.'),
        T('Descartar'), true).then(function (si) {
          if (!si) return;
          Medir.tirar();
          App.render();
        });
    });

    bind(root, '[data-a=terminar]', function () { terminar(); });

    /* Repintar solo el panel y no la pantalla entera. Un render completo cada
       segundo perdía el foco, reiniciaba la animación de entrada y, con el
       dedo encima, se comía el toque en «pausar». */
    if (soltar) soltar();
    soltar = Medir.alCambiar(function (e) {
      if (e.fase !== 'midiendo' && e.fase !== 'pausa') return;
      const caja = document.getElementById('med-panel');
      if (caja) caja.innerHTML = panelHTML(e);
    });
  };

  /* Guardar lo medido. La sesión se escribe igual que una actividad apuntada a
     mano —mismo sitio, mismo historial, mismos músculos— y encima lleva lo que
     solo el GPS sabe: los kilómetros, el ritmo y la forma del recorrido. */
  function terminar() {
    const r = Medir.terminar();
    if (!r) return;
    const a = actDe(r.act);
    const minutos = Math.max(1, Math.round(r.ms / 60000));

    if (r.km < 0.05) {
      UI.toast(T('No se ha medido casi nada, así que no se guarda.'));
      App.render();
      return;
    }

    Store.addSession({
      routineName: T(a.label),
      start: r.t0,
      end: r.t0 + r.ms,
      entries: [], setsDone: 0, volume: 0,
      manual: true,
      actividad: a.id,
      minutos: minutos,
      kcal: r.kcal,
      musculos: (a.musculos || []).slice(),
      /* De dónde salió el número, que es lo que distingue esta sesión de una
         apuntada a ojo: aquí nadie ha estimado los minutos. */
      origen: 'gps',
      km: Math.round(r.km * 100) / 100,
      ritmo: r.ritmo,
      pasos: r.pasos || 0,
      cadencia: r.cadencia || 0,
      ruta: r.puntos || []
    });

    UI.toast(Tn('{que}: {km} km en {min} min', {
      que: T(a.label), km: (Math.round(r.km * 100) / 100).toString(), min: minutos
    }));
    go('progreso');
  }
})(window);
