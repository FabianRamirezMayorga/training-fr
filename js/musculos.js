/* musculos.js — el mapa del cuerpo con lo que trabaja cada ejercicio.

   Las etiquetas dicen «dorsales» y «espalda media», y hay que saberse la
   anatomía para situarlas. Un dibujo lo resuelve sin leer: se ve de un vistazo
   qué zona se mueve y si un plan está tocando siempre lo mismo.

   Va en SVG dibujado aquí, sin imágenes ni librerías: pesa unos kilobytes,
   funciona sin conexión y se pinta del color del tema. Es un esquema, no una
   lámina de anatomía: lo que importa es reconocer la zona de un vistazo, no
   distinguir el sóleo del gemelo. */
(function (g) {
  'use strict';

  /* En qué vista se ve cada músculo. Los que se ven por los dos lados —el
     hombro, el gemelo— se pintan en las dos.

     Las coordenadas van contra la silueta de abajo, que está dibujada por
     partes: hombros a la altura 46-62, torso hasta 116, cadera 116-140, muslo
     hasta 182 y pantorrilla de 186 a 224. */
  const PIEZAS = {
    /* ---------- de frente ---------- */
    neck: ['f', 'M54 34h12v8H54z'],
    shoulders: ['fd',
      'M38 47c-6 1-10 6-11 13-1 4 0 8 1 11 4-4 9-6 14-7 1-7 0-13-2-16-1-1-2-1-2-1z',
      'M82 47c6 1 10 6 11 13 1 4 0 8-1 11-4-4-9-6-14-7-1-7 0-13 2-16 1-1 2-1 2-1z'],
    chest: ['f',
      'M58 50c-8 0-15 2-19 6-2 4-2 11 1 15 4 4 12 5 18 4 1-8 1-17 0-25z',
      'M62 50c8 0 15 2 19 6 2 4 2 11-1 15-4 4-12 5-18 4-1-8-1-17 0-25z'],
    abdominals: ['f',
      'M49 78h22c1 11 1 24-1 35-4 3-16 3-20 0-2-11-2-24-1-35z'],
    biceps: ['f',
      'M30 62c5 0 8 4 8 10 0 8-1 15-4 20-3 1-7 0-9-3-1-9 0-20 5-27z',
      'M90 62c-5 0-8 4-8 10 0 8 1 15 4 20 3 1 7 0 9-3 1-9 0-20-5-27z'],
    forearms: ['fd',
      'M23 96c5-1 9 1 10 4 0 9-2 19-5 27-3 1-6 0-8-3 0-9 1-19 3-28z',
      'M97 96c-5-1-9 1-10 4 0 9 2 19 5 27 3 1 6 0 8-3 0-9-1-19-3-28z'],
    abductors: ['f',
      'M42 120c-4 2-6 8-6 15 0 6 1 11 3 14 2-1 4-4 4-8 0-8 0-15-1-21z',
      'M78 120c4 2 6 8 6 15 0 6-1 11-3 14-2-1-4-4-4-8 0-8 0-15 1-21z'],
    quadriceps: ['f',
      'M47 124c6-2 11-1 13 2 2 14 1 34-2 50-4 2-9 2-12-1-3-16-2-37 1-51z',
      'M73 124c-6-2-11-1-13 2-2 14-1 34 2 50 4 2 9 2 12-1 3-16 2-37-1-51z'],
    adductors: ['f',
      'M57 126c2-1 4 0 4 3 1 12 0 25-2 34-2 1-3 0-4-2-1-12-1-25 2-35z',
      'M63 126c-2-1-4 0-4 3-1 12 0 25 2 34 2 1 3 0 4-2 1-12 1-25-2-35z'],
    calves: ['fd',
      'M46 188c5-1 9 0 10 3 1 11 0 24-3 32-3 1-7 1-9-2-1-11 0-24 2-33z',
      'M74 188c-5-1-9 0-10 3-1 11 0 24 3 32 3 1 7 1 9-2 1-11 0-24-2-33z'],

    /* ---------- de espaldas ---------- */
    traps: ['d',
      'M60 42c9 0 17 3 21 9 2 4 2 9 0 13-7-5-14-7-21-7s-14 2-21 7c-2-4-2-9 0-13 4-6 12-9 21-9z'],
    lats: ['d',
      'M44 66c-4 7-5 17-4 27 1 7 4 13 9 16 4-2 6-7 7-14 1-11 0-24-2-31-3-1-7 0-10 2z',
      'M76 66c4 7 5 17 4 27-1 7-4 13-9 16-4-2-6-7-7-14-1-11 0-24 2-31 3-1 7 0 10 2z'],
    'middle back': ['d',
      'M52 64h16c1 10 1 22 0 31-4 3-12 3-16 0-1-9-1-21 0-31z'],
    'lower back': ['d',
      'M50 99h20c1 8 1 17 0 24-5 3-15 3-20 0-1-7-1-16 0-24z'],
    triceps: ['d',
      'M29 61c5-1 9 2 9 8 0 9-1 16-4 21-3 1-7 0-9-3-1-9 0-19 4-26z',
      'M91 61c-5-1-9 2-9 8 0 9 1 16 4 21 3 1 7 0 9-3 1-9 0-19-4-26z'],
    glutes: ['d',
      'M58 124c-9-1-15 3-17 10-1 7 1 15 6 19 5 2 10 1 12-4 2-8 2-17-1-25z',
      'M62 124c9-1 15 3 17 10 1 7-1 15-6 19-5 2-10 1-12-4-2-8-2-17 1-25z'],
    hamstrings: ['d',
      'M47 152c6-2 11-1 13 2 2 13 1 31-2 44-4 2-9 2-12-1-3-14-2-32 1-45z',
      'M73 152c-6-2-11-1-13 2-2 13-1 31 2 44 4 2 9 2 12-1 3-14 2-32-1-45z']
  };

  /* La silueta de debajo, por partes. Un solo contorno para todo el cuerpo salía
     como un bloque con bultos: separando cabeza, torso, brazos y piernas se
     reconoce una persona, que es lo único que tiene que conseguir. */
  const SILUETA =
    '<circle cx="60" cy="20" r="13"/>' +
    '<path d="M54 31h12v11H54z"/>' +
    '<path d="M60 42c-12 0-21 3-26 9-3 4-4 9-4 15 0 11 2 22 3 31 1 7 1 13 1 19' +
    ' 0 5 9 8 26 8s26-3 26-8c0-6 0-12 1-19 1-9 3-20 3-31 0-6-1-11-4-15-5-6-14-9-26-9z"/>' +
    '<path d="M34 46c-5 2-8 8-9 15-2 11-4 23-6 34-1 5-1 9-1 13 0 4 7 5 9 0 2-5 3-11 4-17' +
    ' 2-10 4-21 6-31 1-6 0-11-3-14z"/>' +
    '<path d="M86 46c5 2 8 8 9 15 2 11 4 23 6 34 1 5 1 9 1 13 0 4-7 5-9 0-2-5-3-11-4-17' +
    '-2-10-4-21-6-31-1-6 0-11 3-14z"/>' +
    '<path d="M47 118c-6 0-9 3-9 8 0 11 1 24 2 36 1 13 2 27 2 39 0 7 0 13 1 18 1 5 10 5 11 0' +
    ' 1-5 1-11 1-18 0-12 1-26 2-39 1-12 2-25 2-36 0-5-3-8-9-8h-3z"/>' +
    '<path d="M73 118c6 0 9 3 9 8 0 11-1 24-2 36-1 13-2 27-2 39 0 7 0 13-1 18-1 5-10 5-11 0' +
    '-1-5-1-11-1-18 0-12-1-26-2-39-1-12-2-25-2-36 0-5 3-8 9-8h3z"/>';

  function trozos(clave, vista) {
    const p = PIEZAS[clave];
    if (!p) return '';
    if (p[0].indexOf(vista) === -1) return '';
    return p.slice(1).map(function (d) {
      return '<path d="' + d + '"/>';
    }).join('');
  }

  function figura(vista, principales, secundarios, titulo) {
    const pinta = function (lista, clase) {
      return (lista || []).map(function (m) {
        const t = trozos(m, vista);
        return t ? '<g class="' + clase + '">' + t + '</g>' : '';
      }).join('');
    };
    return '<svg class="cuerpo" viewBox="0 0 120 250" aria-label="' + titulo + '">' +
      '<g class="silueta">' + SILUETA + '</g>' +
      pinta(secundarios, 'sec') +
      pinta(principales, 'pri') +
      '</svg>';
  }

  /* ¿Hay algo que enseñar? Si un ejercicio solo toca músculos que este dibujo
     no distingue, más vale no pintar dos siluetas vacías. */
  function hayAlgo(principales, secundarios) {
    return (principales || []).concat(secundarios || []).some(function (m) {
      return !!PIEZAS[m];
    });
  }

  /* Solo las dos siluetas, sin la leyenda. Es lo que cabe en mitad de un
     entrenamiento: ahí los nombres de los músculos ya están escritos al lado y
     lo que falta es ver DÓNDE. */
  function siluetas(principales, secundarios) {
    principales = principales || [];
    secundarios = secundarios || [];
    if (!hayAlgo(principales, secundarios)) return '';
    return '<div class="mapa-figuras compacto">' +
      figura('f', principales, secundarios, 'Músculos que trabajan, de frente') +
      figura('d', principales, secundarios, 'Músculos que trabajan, de espaldas') +
      '</div>';
  }

  function mapa(principales, secundarios) {
    principales = principales || [];
    secundarios = secundarios || [];
    if (!hayAlgo(principales, secundarios)) return '';

    const nombres = principales.map(function (m) { return I18N.muscle(m); });
    const otros = secundarios.filter(function (m) {
      return principales.indexOf(m) === -1;
    }).map(function (m) { return I18N.muscle(m); });

    return '<div class="mapa-musculos">' +
      '<div class="mapa-figuras">' +
      figura('f', principales, secundarios, T('Vista de frente')) +
      figura('d', principales, secundarios, T('Vista de espaldas')) +
      '</div>' +
      '<div class="mapa-lista">' +
      (nombres.length ? '<div class="mapa-grupo"><span class="punto pri"></span>' +
        '<div><b>' + UI.esc(nombres.join(', ')) + '</b>' +
        '<div class="tiny">' + UI.esc(T('Es lo que mueve el ejercicio')) +
        '</div></div></div>' : '') +
      (otros.length ? '<div class="mapa-grupo"><span class="punto sec"></span>' +
        '<div><b>' + UI.esc(otros.join(', ')) + '</b>' +
        '<div class="tiny">' + UI.esc(T('Ayudan, pero no son el objetivo')) +
        '</div></div></div>' : '') +
      '</div></div>';
  }

  /* Una sola figura, para cuando no cabe el par. La usan las casillas de zona
     del filtro: ahí el cuerpo entero de frente y de espaldas no cabe, y con una
     vista bien elegida —la espalda de espaldas, el resto de frente— se entiende
     igual de qué zona se habla. */
  function una(musculos, vista) {
    return figura(vista || 'f', musculos || [], [], T('Zona del cuerpo'));
  }

  g.Musculos = { mapa: mapa, siluetas: siluetas, una: una, PIEZAS: PIEZAS };
})(window);
