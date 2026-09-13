/* zona.js — la pantalla de un músculo, con el recorrido claro.

   Antes «Ver todos» no llevaba a ninguna parte: filtraba la misma pantalla y te
   dejaba en el mismo sitio con menos cosas. No había forma de saber dónde
   estabas ni cómo volver, y por eso el recorrido no se entendía.

   Ahora cada zona es su propia pantalla, con su cabecera, su nombre grande, una
   explicación de para qué sirve entrenarla y la lista debajo. Volver es volver.

   La cabecera lleva los muñecos de figura.js pintados en blanco sobre un
   degradado: dice de qué va la sección antes de leer una palabra. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  /* Cada zona con su color y sus siluetas. El tono no es decoración: es lo que
     te dice de un vistazo que has cambiado de sección. */
  const ZONAS = {
    chest: { tono: 'naranja', poses: ['plancha', 'sentadilla'],
      texto: 'El pecho empuja. Trabaja bien con press y flexiones, y crece cuando ' +
        'el recorrido es completo: abajo hasta tocar, arriba sin bloquear de golpe.' },
    lats: { tono: 'azul', poses: ['equilibrio', 'estirar'],
      texto: 'Los dorsales son lo que da espalda ancha, y lo que más se descuida ' +
        'frente al pecho. Tirón vertical —dominadas, jalón— y horizontal —remo—, ' +
        'las dos cosas cada semana.' },
    'middle back': { tono: 'azul', poses: ['equilibrio', 'estirar'],
      texto: 'La espalda media sostiene la postura y aguanta lo que el dorsal tira. ' +
        'Se entrena con remo y con todo lo que junte los omóplatos.' },
    'lower back': { tono: 'azul', poses: ['estirar', 'plancha'],
      texto: 'La zona lumbar no se entrena a repeticiones sueltas: se refuerza ' +
        'aguantando posición en peso muerto, puentes y extensiones.' },
    traps: { tono: 'azul', poses: ['equilibrio', 'zancada'],
      texto: 'Los trapecios trabajan en casi todo lo que levantas del suelo. ' +
        'Encogimientos y remos altos si quieres darles algo suyo.' },
    quadriceps: { tono: 'verde', poses: ['sentadilla', 'zancada'],
      texto: 'El cuádriceps es la pierna que se ve de frente y el motor de la ' +
        'sentadilla. Profundidad antes que peso: media sentadilla con mucho disco ' +
        'no entrena lo mismo.' },
    hamstrings: { tono: 'verde', poses: ['zancada', 'estirar'],
      texto: 'Los isquiotibiales frenan la pierna al correr y son los que más se ' +
        'rompen cuando están débiles. Peso muerto rumano, curl y nórdico.' },
    glutes: { tono: 'verde', poses: ['sentadilla', 'zancada'],
      texto: 'El glúteo es el músculo más fuerte que tienes y el que más rinde en ' +
        'sentadilla, peso muerto y puente de cadera.' },
    calves: { tono: 'verde', poses: ['zancada', 'correr'],
      texto: 'Los gemelos aguantan tu peso todo el día, así que con poco no notan ' +
        'nada: recorrido completo, arriba del todo y abajo del todo.' },
    shoulders: { tono: 'naranja', poses: ['equilibrio', 'plancha'],
      texto: 'El hombro tiene tres cabezas y casi todo el mundo entrena solo la de ' +
        'delante. Press para la frontal, elevaciones laterales para la media y ' +
        'pájaro para la posterior.' },
    biceps: { tono: 'morado', poses: ['equilibrio', 'zancada'],
      texto: 'El bíceps ya trabaja en cada tirón de espalda. El curl añade lo que ' +
        'falta; no hace falta mucho más volumen del que crees.' },
    triceps: { tono: 'morado', poses: ['plancha', 'equilibrio'],
      texto: 'El tríceps son dos tercios del brazo. Fondos, press cerrado y ' +
        'extensiones: con el codo quieto, que es donde se pierde el ejercicio.' },
    forearms: { tono: 'morado', poses: ['equilibrio', 'zancada'],
      texto: 'El antebrazo es lo que se agota antes en dominadas y peso muerto. ' +
        'Colgarse de la barra es el ejercicio más simple y el que más da.' },
    abdominals: { tono: 'naranja', poses: ['plancha', 'equilibrio'],
      texto: 'El abdomen se entrena aguantando, no solo encogiendo. Plancha, hollow ' +
        'y elevaciones de piernas valen más que doscientos abdominales.' },
    abductors: { tono: 'verde', poses: ['zancada', 'estirar'],
      texto: 'Los abductores estabilizan la cadera en cada paso y en cada ' +
        'sentadilla a una pierna.' },
    adductors: { tono: 'verde', poses: ['zancada', 'estirar'],
      texto: 'Los aductores cierran la pierna y sujetan la rodilla. Suelen estar ' +
        'cortos y débiles a la vez.' },
    neck: { tono: 'morado', poses: ['equilibrio', 'estirar'],
      texto: 'El cuello se entrena con muy poco y con mucho cuidado: rango corto y ' +
        'sin tirones.' }
  };

  function zonaDe(m) {
    return ZONAS[m] || { tono: 'verde', poses: ['sentadilla', 'zancada'], texto: '' };
  }

  /* Los muñecos de la cabecera, en blanco sobre el degradado */
  function figurasHTML(poses) {
    if (!g.Figura) return '';
    return poses.map(function (k) {
      const p = Figura.POSES[k];
      return p ? '<div class="hero-fig">' + Figura.svg(p, 'nada', '#ffffff') + '</div>' : '';
    }).join('');
  }

  /* Una fila al estilo de las listas de Fitness: miniatura grande a la
     izquierda, nombre y detalle a la derecha, y el galón que dice que se entra.
     La miniatura grande es media pantalla: a ese tamaño la foto sirve para
     reconocer el ejercicio, que es para lo que está. */
  function filaHTML(ex) {
    return html`
      <button class="fila-prog" data-ex="${ex.id}">
        <span class="fp-foto">
          <img src="${Data.img(ex, 0)}" alt="" loading="lazy" decoding="async">
        </span>
        <span class="fp-txt">
          <span class="fp-nom">${ex.nameEs}</span>
          <span class="fp-sub">${I18N.equip(ex.equipment)} · ${I18N.level(ex.level)}</span>
        </span>
        ${raw(icon('chevron'))}
      </button>`;
  }

  /* Cuántas filas se pintan. Con miniatura grande, noventa y cuatro de golpe
     son noventa y cuatro imágenes: se sirven por tandas. */
  let tope = 30;
  let zonaPintada = '';

  V.zona = function () {
    const m = route().arg || '';
    if (m !== zonaPintada) { zonaPintada = m; tope = 30; }
    const z = zonaDe(m);
    const gear = Store.settings().gear;
    const lista = Data.search({ muscle: m, gear: gear });

    return html`
      <div class="hero ${z.tono}">
        <button class="hero-atras" data-a="atras" aria-label="Volver">
          ${raw(icon('back'))}</button>
        <div class="hero-figs">${raw(figurasHTML(z.poses))}</div>
      </div>

      <h1 class="prog-tit">${I18N.muscle(m)}</h1>
      ${raw(z.texto ? '<p class="prog-sub">' + esc(z.texto) + '</p>' : '')}

      <div class="list-head">
        <span class="list-title">Ejercicios <span style="opacity:.6">${lista.length}</span></span>
        <button class="btn sm ghost" data-a="lugar">${raw(icon('dumbbell'))}
          ${Data.GEAR[gear] ? Data.GEAR[gear].label : ''}</button>
      </div>

      ${raw(lista.length
        ? '<div class="lista-prog">' + lista.slice(0, tope).map(filaHTML).join('') + '</div>' +
          (lista.length > tope
            ? '<button class="btn block" data-a="mas" style="margin-top:16px">Ver ' +
              Math.min(30, lista.length - tope) + ' más</button>'
            : '')
        : '<div class="card"><b>Nada por aquí con tu material</b>' +
          '<p class="tiny" style="margin:6px 0 0">Cambia dónde entrenas y vuelve a ' +
          'mirar: el catálogo entero tiene bastante más.</p></div>')}`;
  };

  V.zona.mount = function (root) {
    App.bind(root, '[data-a=atras]', function () { App.go('ejercicios'); });
    App.bind(root, '[data-a=lugar]', function () { App.lugarSheet(); });
    App.bind(root, '[data-a=mas]', function () { tope += 30; App.render(); });
    App.bindAll(root, '[data-ex]', function (el) {
      App.go('ejercicio', el.dataset.ex);
      window.scrollTo(0, 0);
    });
  };

  function route() { return App.ruta(); }
})(window);
