/* idioma.js — en qué idioma se ve la app.

   La clave de cada frase es la propia frase en español. Suena raro y es
   deliberado: inventar claves («ajustes.tema.titulo») en una app de cuarenta
   módulos y dos mil cadenas significa mantener un diccionario de nombres además
   del de traducciones, y equivocarse en un nombre da una pantalla que enseña
   «ajustes.tema.titulo» a la cara del usuario. Con la frase como clave, lo peor
   que puede pasar es que salga en español.

   Eso hace que esto se pueda migrar pantalla por pantalla sin que nada se rompa
   por el camino: lo que aún no se ha tocado sigue funcionando en los dos
   idiomas, en español.

   La traducción NO pasa por la IA. Costaría dinero por uso, necesitaría la
   clave del usuario y no funcionaría sin conexión, que es justo cuando más se
   usa esta app. El diccionario viaja con ella, en textos-en.js. */
(function (g) {
  'use strict';

  const CLAVE = 'trainingfr.idioma';

  const IDIOMAS = [
    { id: 'es', corto: 'ES', label: 'Español', suyo: 'Español' },
    { id: 'en', corto: 'EN', label: 'Inglés', suyo: 'English' }
  ];

  /* En memoria, no en localStorage: T() se llama miles de veces por pintado y
     leer el almacenamiento en cada llamada se nota al desplazar. */
  let actualId = null;

  function leer() {
    try {
      const v = localStorage.getItem(CLAVE);
      if (v === 'es' || v === 'en') return v;
    } catch (e) { /* modo privado */ }
    /* Sin elegir, el del móvil. A quien tiene el teléfono en inglés no hay que
       enseñarle español y hacerle buscar el ajuste. */
    try {
      if (/^en\b/i.test(navigator.language || '')) return 'en';
    } catch (e) { /* nada */ }
    return 'es';
  }

  function actual() {
    if (actualId === null) actualId = leer();
    return actualId;
  }

  function es() { return actual() === 'es'; }

  function datos(id) {
    return IDIOMAS.filter(function (x) { return x.id === (id || actual()); })[0] || IDIOMAS[0];
  }

  function poner(id) {
    if (id !== 'es' && id !== 'en') return;
    actualId = id;
    try { localStorage.setItem(CLAVE, id); } catch (e) { /* nada */ }
    /* Para el navegador: de esto dependen la separación de palabras, el
       corrector y lo que lee un lector de pantalla. */
    try { document.documentElement.lang = id; } catch (e) { /* nada */ }
  }

  /* ---------- lo que falta por traducir ----------
     Se apunta cada frase que se pide en inglés y no está en el diccionario. No
     es para el usuario: es para poder RECORRER la app en inglés y preguntarle
     después qué se quedó sin traducir, en vez de ir pantalla por pantalla
     mirando a ojo cuál se me ha pasado. Un Set, así que no crece con las
     repeticiones. */
  const faltantes = new Set();

  function T(txt) {
    if (txt == null) return '';
    const s = String(txt);
    if (actual() === 'es' || !s) return s;

    const d = g.TEXTOS_EN;
    if (d && Object.prototype.hasOwnProperty.call(d, s)) return d[s];

    /* Lo que aún no está traducido sale en español. Es feo a medias, pero es
       legible; una clave cruda o un hueco vacío no lo son. */
    faltantes.add(s);
    return s;
  }

  /* Con número dentro: T('{n} series') se escribe una vez y el número entra
     después, en vez de partir la frase en trozos que en inglés van al revés. */
  function Tn(txt, valores) {
    let s = T(txt);
    if (!valores) return s;
    Object.keys(valores).forEach(function (k) {
      s = s.split('{' + k + '}').join(String(valores[k]));
    });
    return s;
  }

  /* Singular y plural juntos, que es donde se cuela la mitad de los errores:
     «1 series» o «1 alertas». Se pasa la frase con {n} en las dos formas. */
  function Tp(n, sing, plur) {
    return Tn(Number(n) === 1 ? sing : plur, { n: n });
  }

  g.Idioma = {
    IDIOMAS: IDIOMAS,
    actual: actual, es: es, poner: poner, datos: datos,
    T: T, Tn: Tn, Tp: Tp,
    faltan: function () { return Array.from(faltantes).sort(); },
    cuantasFaltan: function () { return faltantes.size; },
    olvidarFaltantes: function () { faltantes.clear(); }
  };

  /* Atajos globales: esto se va a escribir miles de veces y `Idioma.T(...)`
     dentro de una plantilla añade ocho caracteres de ruido en cada frase. */
  g.T = T;
  g.Tn = Tn;
  g.Tp = Tp;

  try { document.documentElement.lang = actual(); } catch (e) { /* nada */ }
})(window);
