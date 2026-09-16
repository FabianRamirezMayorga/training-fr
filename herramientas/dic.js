/* Comprueba el diccionario de traducción: claves repetidas, traducciones
   vacías y las que se quedaron igual que el original.

   Existe porque una clave repetida no da ningún error —en JavaScript la segunda
   gana en silencio— y una traducción vacía deja el botón sin texto. Las dos
   cosas se ven en la app y no en el código, que es el peor sitio para verlas.

   Se ejecuta a mano:  node herramientas/dic.js  */
const fs = require('fs');

global.window = {};
require('../js/textos-en.js');
const d = global.window.TEXTOS_EN;

const src = fs.readFileSync(__dirname + '/../js/textos-en.js', 'utf8');

/* Las claves tal y como están escritas en el archivo, no las del objeto ya
   construido: en el objeto las repetidas ya se han perdido, que es justo lo que
   se quiere detectar. */
const lineas = src.split('\n');
const claves = [];
lineas.forEach(function (l) {
  const m = l.match(/^\s*'((?:[^'\\]|\\.)*)'\s*:/);
  if (m) claves.push(m[1]);
});

const vistas = Object.create(null);
const dup = [];
claves.forEach(function (k) {
  if (vistas[k]) dup.push(k);
  vistas[k] = 1;
});

const vacias = Object.keys(d).filter(function (k) { return !String(d[k]).trim(); });
const iguales = Object.keys(d).filter(function (k) {
  return d[k] === k && k.length > 3 && /[a-záéíóúñ]/i.test(k);
});

console.log('entradas leídas del archivo: ' + claves.length);
console.log('entradas en el objeto:       ' + Object.keys(d).length);
console.log('repetidas:      ' + (dup.length ? dup.join(' | ') : 'ninguna'));
console.log('vacías:         ' + (vacias.length ? vacias.join(' | ') : 'ninguna'));
console.log('sin traducir:   ' + (iguales.length ? iguales.join(' | ') : 'ninguna'));

if (dup.length || vacias.length) process.exit(1);
