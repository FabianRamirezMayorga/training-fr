/* Comprueba los diccionarios de traducción: claves repetidas —dentro de cada
   archivo y entre los dos—, traducciones vacías y las que se quedaron igual que
   el original.

   Existe porque una clave repetida no da ningún error —en JavaScript la segunda
   gana en silencio, y en la fusión de los dos archivos gana la primera— y una
   traducción vacía deja el botón sin texto. Las dos cosas se ven en la app y no
   en el código, que es el peor sitio para verlas.

   Se ejecuta a mano:  node herramientas/dic.js  */
const fs = require('fs');

global.window = {};
require('../js/textos-en.js');
const soloInterfaz = Object.keys(global.window.TEXTOS_EN);
require('../js/textos-en-ayuda.js');
const d = global.window.TEXTOS_EN;

/* Las claves tal y como están escritas en cada archivo, no las del objeto ya
   construido: en el objeto las repetidas ya se han perdido, que es justo lo que
   se quiere detectar. */
function clavesDe(ruta) {
  const src = fs.readFileSync(__dirname + '/../js/' + ruta, 'utf8');
  const out = [];
  src.split('\n').forEach(function (l) {
    const m = l.match(/^\s*'((?:[^'\\]|\\.)*)'\s*:/);
    if (m) out.push(m[1]);
  });
  return out;
}

const archivos = ['textos-en.js', 'textos-en-ayuda.js'];
const dup = [];
const entre = [];
const donde = Object.create(null);

archivos.forEach(function (f) {
  const vistas = Object.create(null);
  clavesDe(f).forEach(function (k) {
    if (vistas[k]) dup.push(f + ' → ' + k);
    vistas[k] = 1;
    /* La misma frase en los dos archivos: no rompe, pero la del manual nunca
       llegaría a usarse y quien la edite no vería ningún efecto. */
    if (donde[k] && donde[k] !== f) entre.push(k);
    donde[k] = f;
  });
});

const vacias = Object.keys(d).filter(function (k) { return !String(d[k]).trim(); });
const iguales = Object.keys(d).filter(function (k) {
  return d[k] === k && k.length > 3 && /[a-záéíóúñ]/i.test(k);
});

console.log('interfaz: ' + soloInterfaz.length + '   manual: ' +
  (Object.keys(d).length - soloInterfaz.length) + '   total: ' + Object.keys(d).length);
console.log('repetidas dentro de un archivo: ' + (dup.length ? dup.join(' | ') : 'ninguna'));
console.log('en los dos archivos:            ' + (entre.length ? entre.join(' | ') : 'ninguna'));
console.log('vacías:                         ' + (vacias.length ? vacias.join(' | ') : 'ninguna'));
/* Algunas son iguales a propósito: «reps» se escribe igual en los dos idiomas.
   Se avisa igual, porque una que se quedó sin traducir tiene esta misma pinta y
   la única forma de distinguirlas es mirándolas. */
console.log('iguales al original (revisar):  ' +
  (iguales.length ? iguales.join(' | ') : 'ninguna'));

if (dup.length || entre.length || vacias.length) process.exit(1);
