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
    cabeza: 4.6,      // radio
    cuello: 3.4,
    tronco: 20,       // cadera -> hombro
    brazoSup: 11,
    brazoInf: 11,
    muslo: 13,
    pierna: 13,
    pie: 4.5
  };

  const VERDE = '#3ddc84';
  const GRIS = '#8a94a6';

  function rad(a) { return a * Math.PI / 180; }

  function mover(p, ang, largo) {
    return [p[0] + Math.cos(rad(ang)) * largo, p[1] + Math.sin(rad(ang)) * largo];
  }

  function n(v) { return Math.round(v * 10) / 10; }

  function linea(a, b, ancho, color, op) {
    return '<path d="M' + n(a[0]) + ' ' + n(a[1]) + 'L' + n(b[0]) + ' ' + n(b[1]) +
      '" stroke="' + color + '" stroke-width="' + ancho +
      '" stroke-linecap="round" fill="none"' +
      (op ? ' opacity="' + op + '"' : '') + '/>';
  }

  /* ---------- el escenario ----------
     Lo que hay alrededor dice tanto como la postura: un front lever sin la
     barra encima es una persona flotando. */
  const ESCENAS = {
    suelo: function () {
      return '<path d="M6 66h88" stroke="' + GRIS + '" stroke-width="1.6" ' +
        'stroke-linecap="round" opacity=".55"/>';
    },
    barra: function () {
      return '<path d="M14 14h72" stroke="' + GRIS + '" stroke-width="2.4" ' +
        'stroke-linecap="round" opacity=".75"/>' +
        '<path d="M18 14v-6M82 14v-6" stroke="' + GRIS + '" stroke-width="1.6" ' +
        'stroke-linecap="round" opacity=".4"/>';
    },
    barraBaja: function () {
      return '<path d="M14 40h72" stroke="' + GRIS + '" stroke-width="2.4" ' +
        'stroke-linecap="round" opacity=".75"/>' + ESCENAS.suelo();
    },
    pared: function () {
      return '<path d="M12 4v64" stroke="' + GRIS + '" stroke-width="2.2" ' +
        'stroke-linecap="round" opacity=".6"/>' + ESCENAS.suelo();
    },
    paralelas: function () {
      return '<path d="M20 40h60" stroke="' + GRIS + '" stroke-width="2.4" ' +
        'stroke-linecap="round" opacity=".75"/>' +
        '<path d="M26 40v26M74 40v26" stroke="' + GRIS + '" stroke-width="1.8" ' +
        'stroke-linecap="round" opacity=".4"/>' + ESCENAS.suelo();
    },
    poste: function () {
      return '<path d="M26 4v62" stroke="' + GRIS + '" stroke-width="2.6" ' +
        'stroke-linecap="round" opacity=".7"/>' + ESCENAS.suelo();
    },
    cajon: function () {
      return '<rect x="62" y="52" width="30" height="14" rx="2" fill="none" stroke="' +
        GRIS + '" stroke-width="1.6" opacity=".55"/>' + ESCENAS.suelo();
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

    function brazo(a, grueso, op) {
      if (!a) return '';
      const codo = mover(hombro, a[0], L.brazoSup);
      const mano = mover(codo, a[1], L.brazoInf);
      return linea(hombro, codo, grueso, VERDE, op) +
        linea(codo, mano, grueso, VERDE, op);
    }

    function pierna(a, grueso, op) {
      if (!a) return '';
      const rodilla = mover(cadera, a[0], L.muslo);
      const tobillo = mover(rodilla, a[1], L.pierna);
      const pie = mover(tobillo, a[2] === undefined ? a[1] + 70 : a[2], L.pie);
      return linea(cadera, rodilla, grueso, VERDE, op) +
        linea(rodilla, tobillo, grueso, VERDE, op) +
        linea(tobillo, pie, grueso * 0.72, VERDE, op);
    }

    /* lado de lejos */
    let s = brazo(p.brazo2, 3.1, '.42') + pierna(p.pierna2, 3.4, '.42');

    /* tronco y cabeza */
    s += linea(cadera, hombro, 5.2, VERDE);
    s += linea(hombro, cuello, 3, VERDE);
    s += '<circle cx="' + n(cabeza[0]) + '" cy="' + n(cabeza[1]) + '" r="' + L.cabeza +
      '" fill="' + VERDE + '"/>';

    /* lado de cerca */
    s += brazo(p.brazo1, 3.6, null) + pierna(p.pierna1, 4, null);
    return s;
  }

  function svg(pose, escena) {
    const fondo = (ESCENAS[escena] || ESCENAS.nada)();
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + ANCHO + ' ' + ALTO + '">' +
      fondo + cuerpo(pose) + '</svg>';
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

  g.Figura = { svg: svg, uri: uri, fotogramas: fotogramas, ANCHO: ANCHO, ALTO: ALTO };
})(window);
