/* Las fichas escritas a mano: calistenia y yoga. Dice cuáles siguen sin
   traducir.

   Son el tercer origen de texto de un ejercicio —después del catálogo de fuera,
   que ya viene en inglés, y de las guías de técnica— y el único que se compone
   al leerlo, porque lleva números dentro de la frase.

   Se ejecuta a mano:  node herramientas/fichas-faltan.js  */
global.window = {};
require('../js/textos-en.js');
require('../js/textos-en-ayuda.js');
require('../js/textos-en-tecnica.js');
const d = global.window.TEXTOS_EN;

require('../js/calistenia.js');
require('../js/yoga.js');

const vistas = new Set();
const faltan = [];
function mira(s) {
  if (!s || typeof s !== 'string' || vistas.has(s)) return;
  vistas.add(s);
  if (!Object.prototype.hasOwnProperty.call(d, s)) faltan.push(s);
}

/* Los nombres NO entran: calistenia y yoga traen su `name` en inglés y el
   getter de data.js ya lo devuelve. Lo que hay que traducir son las piezas
   sueltas —la familia, el requisito, la descripción, cada clave—, y no la línea
   ya compuesta, que lleva el número del escalón dentro. */
const fs = require('fs');
['calistenia.js', 'yoga.js'].forEach(function (f) {
  const src = fs.readFileSync(__dirname + '/../js/' + f, 'utf8');
  /* familia, requisito, desc, bien y cada elemento de claves: todos son
     literales de una sola línea o de varias con comillas simples. */
  const re = /(?:familia|requisito|desc|bien):\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(src))) mira(m[1].replace(/\\'/g, "'"));
  const claves = /claves:\s*\[([\s\S]*?)\]\s*}/g;
  while ((m = claves.exec(src))) {
    const re2 = /'((?:[^'\\]|\\.)*)'/g;
    let m2;
    while ((m2 = re2.exec(m[1]))) mira(m2[1].replace(/\\'/g, "'"));
  }
});

console.log('frases de fichas: ' + vistas.size +
  '   traducidas: ' + (vistas.size - faltan.length) + '   faltan: ' + faltan.length);
faltan.forEach(function (s) { console.log('  · ' + s); });
