/* figura.js — el muñeco que anima los ejercicios que no tienen foto.

   Busqué fuentes antes de dibujar. wger tiene 374 imágenes y ninguna de
   calistenia; Wikimedia Commons tiene fotos sueltas de front lever, L-sit y
   muscle-up, pero ni bandera, ni dragon flag, ni una sola progresión, cada una
   con su licencia y su persona distinta. No hay forma de sacar de ahí 53
   ejercicios que se parezcan entre sí.

   Así que se dibujan. Cada postura son unos cuantos ángulos y el muñeco se
   calcula solo: es lo que permite afinar un codo cambiando un número en vez de
   mover coordenadas a ciegas. Salen como SVG en un data: URI, o sea que entran
   por el mismo sitio que las fotos del catálogo y el reproductor de siempre
   —las fases, la velocidad, los puntitos— funciona sin tocar nada.

   Los ángulos van en grados, con 0 apuntando a la derecha y creciendo en el
   sentido de las agujas del reloj, que es como crece la Y en una pantalla:
   90 es hacia abajo, 270 hacia arriba. */
(function (g) {
  'use strict';

  const ANCHO = 100, ALTO = 75;

  /* Proporciones. Salen de una figura de siete cabezas y media, encogida para
     que quepa el escenario —barra, suelo, pared— dentro del mismo cuadro. */
  const L = {
    cabeza: 6.4,      // radio
    cuello: 2.6,
    tronco: 19,       // cadera -> hombro
    brazoSup: 10.5,
    brazoInf: 10.5,
    muslo: 12.5,
    pierna: 12.5,
    pie: 4.2
  };

  /* Los gruesos. El primer intento iba con trazos de 3 y 4 sobre un cuadro de
     100 y salía un muñeco de palotes: fino, frágil y con la cabeza flotando.
     Los pictogramas que funcionan —los blancos de la app de Fitness, sin ir más
     lejos— son trazos MUY gruesos, cabeza grande y un solo color plano. */
  const GRUESO = {
    tronco: 9.5,
    brazo: 6,
    pierna: 7,
    pie: 5,
    cuello: 6
  };

  /* El contorno. Engordar el trazo sin más convertía al muñeco en una mancha:
     brazo, tronco y pierna se tocan y se funden. Cada pieza se dibuja dos
     veces, primero un halo oscuro algo más ancho y encima el color, en orden de
     lejos a cerca. Es lo que separa las piezas y lo que hace que un pictograma
     se lea de un vistazo en miniatura. */
  const TINTA = '#11151c';
  const HALO = 3.2;

  const VERDE = '#3ddc84';
  const GRIS = '#5b6577';

  function rad(a) { return a * Math.PI / 180; }

  function mover(p, ang, largo) {
    return [p[0] + Math.cos(rad(ang)) * largo, p[1] + Math.sin(rad(ang)) * largo];
  }

  function n(v) { return Math.round(v * 10) / 10; }

  function trazo(a, b, ancho, color) {
    return '<path d="M' + n(a[0]) + ' ' + n(a[1]) + 'L' + n(b[0]) + ' ' + n(b[1]) +
      '" stroke="' + color + '" stroke-width="' + ancho +
      '" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  }

  /* Una cadena de puntos —hombro, codo, mano— de una sola tirada: primero el
     halo entero y encima el color entero. Haciéndolo tramo a tramo, el halo se
     metía también en el codo y la rodilla y el muñeco parecía una oruga. */
  function cadena(puntos, ancho, color) {
    const d = puntos.map(function (p, i) {
      return (i ? 'L' : 'M') + n(p[0]) + ' ' + n(p[1]);
    }).join('');
    const uno = function (a, c) {
      return '<path d="' + d + '" stroke="' + c + '" stroke-width="' + a +
        '" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
    };
    return uno(ancho + HALO, TINTA) + uno(ancho, color);
  }

  /* El material se dibuja con el mismo trazo grueso y redondeado que el cuerpo,
     en un tono apagado del mismo color. Antes eran rayas finas grises y parecían
     suciedad en la imagen más que una barra. */
  function barra(d, ancho) {
    return '<path d="' + d + '" stroke="' + TINTA + '" stroke-width="' + (ancho + HALO) +
      '" stroke-linecap="round" fill="none"/>' +
      '<path d="' + d + '" stroke="' + GRIS + '" stroke-width="' + ancho +
      '" stroke-linecap="round" fill="none"/>';
  }

  /* ---------- el escenario ----------
     Lo que hay alrededor dice tanto como la postura: un front lever sin la
     barra encima es una persona flotando. */
  const ESCENAS = {
    suelo: function () {
      return barra('M10 68h80', 5);
    },
    barra: function () {
      return barra('M12 13h76', 5.5);
    },
    barraBaja: function () {
      return barra('M12 40h76', 5.5) + ESCENAS.suelo();
    },
    pared: function () {
      return barra('M10 6v62', 5.5) + ESCENAS.suelo();
    },
    paralelas: function () {
      return barra('M18 40h64', 5.5) + barra('M24 43v24', 4.5) + barra('M76 43v24', 4.5) +
        ESCENAS.suelo();
    },
    poste: function () {
      return barra('M24 6v62', 6) + ESCENAS.suelo();
    },
    cajon: function () {
      return barra('M64 54h28', 5.5) + barra('M67 57v10', 4.5) + barra('M89 57v10', 4.5) +
        ESCENAS.suelo();
    },
    nada: function () { return ''; }
  };

  /* ---------- el muñeco ----------
     Primero el lado de lejos, más fino y apagado, para que se lea la
     profundidad sin tener que dibujar un cuerpo entero. */
  function cuerpo(p) {
    const cadera = [p.cadera[0], p.cadera[1]];
    const hombro = mover(cadera, p.tronco, L.tronco);
    const cuello = mover(hombro, p.tronco, L.cuello);
    const cabeza = mover(cuello, p.cabeza === undefined ? p.tronco : p.cabeza, L.cabeza);

    function brazo(a, grueso) {
      if (!a) return '';
      const codo = mover(hombro, a[0], L.brazoSup);
      return cadena([hombro, codo, mover(codo, a[1], L.brazoInf)], grueso, VERDE);
    }

    function pierna(a, grueso) {
      if (!a) return '';
      const rodilla = mover(cadera, a[0], L.muslo);
      const tobillo = mover(rodilla, a[1], L.pierna);
      const pie = mover(tobillo, a[2] === undefined ? a[1] + 70 : a[2], L.pie);
      return cadena([cadera, rodilla, tobillo, pie], grueso, VERDE);
    }

    /* De lejos a cerca. El lado de lejos va algo más fino, pero del MISMO color
       y sin transparencia: el desvanecido de antes no leía como profundidad,
       leía como un fallo de dibujo. */
    let s = brazo(p.brazo2, GRUESO.brazo - 1.2) + pierna(p.pierna2, GRUESO.pierna - 1.2);

    /* tronco, cuello y cabeza son una sola pieza */
    s += cadena([cadera, hombro, cuello], GRUESO.tronco, VERDE);
    s += '<circle cx="' + n(cabeza[0]) + '" cy="' + n(cabeza[1]) + '" r="' +
      (L.cabeza + HALO / 2) + '" fill="' + TINTA + '"/>' +
      '<circle cx="' + n(cabeza[0]) + '" cy="' + n(cabeza[1]) + '" r="' + L.cabeza +
      '" fill="' + VERDE + '"/>';

    s += brazo(p.brazo1, GRUESO.brazo) + pierna(p.pierna1, GRUESO.pierna);
    return s;
  }

  function svg(pose, escena, color) {
    const fondo = (ESCENAS[escena] || ESCENAS.nada)();
    const s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + ANCHO + ' ' + ALTO + '">' +
      fondo + cuerpo(pose) + '</svg>';
    /* El mismo muñeco en blanco para las cabeceras, donde va sobre un degradado
       de color y el verde de la marca no se leería. */
    return color ? s.split(VERDE).join(color) : s;
  }

  function uri(pose, escena) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg(pose, escena));
  }

  /* Los dos fotogramas de un ejercicio, listos para el reproductor de siempre.
     Si solo hay una postura —los aguantes, que no se mueven— se devuelve una
     sola y el reproductor la deja quieta, que es lo correcto: un front lever no
     «se mueve», se sostiene. */
  function fotogramas(fig) {
    if (!fig || !fig.a) return null;
    const e = fig.escena || 'nada';
    return fig.b ? [uri(fig.a, e), uri(fig.b, e)] : [uri(fig.a, e)];
  }

  /* Posturas para las cabeceras. No son ejercicios concretos: son la silueta
     que dice de qué va la sección de un vistazo, como los pictogramas blancos
     de la app de Fitness. */
  const POSES = {
    sentadilla: { cadera: [50, 44], tronco: 285, cabeza: 285, brazo1: [10, 10], brazo2: [6, 6],
      pierna1: [115, 65, 135], pierna2: [110, 70, 140] },
    zancada: { cadera: [50, 40], tronco: 275, cabeza: 275, brazo1: [120, 95], brazo2: [60, 85],
      pierna1: [55, 90, 160], pierna2: [140, 90, 160] },
    correr: { cadera: [50, 38], tronco: 280, cabeza: 280, brazo1: [130, 60], brazo2: [50, 120],
      pierna1: [50, 110, 180], pierna2: [140, 95, 30] },
    estirar: { cadera: [50, 48], tronco: 300, cabeza: 300, brazo1: [330, 300], brazo2: [325, 295],
      pierna1: [20, 20, 90], pierna2: [150, 100, 170] },
    plancha: { cadera: [44, 48], tronco: 350, cabeza: 340, brazo1: [80, 80], brazo2: [76, 76],
      pierna1: [160, 160, 60], pierna2: [156, 164, 60] },
    equilibrio: { cadera: [50, 40], tronco: 280, cabeza: 280, brazo1: [355, 350], brazo2: [185, 190],
      pierna1: [90, 90, 160], pierna2: [155, 155, 225] }
  };

  g.Figura = {
    svg: svg, uri: uri, fotogramas: fotogramas, POSES: POSES, ANCHO: ANCHO, ALTO: ALTO
  };
})(window);
