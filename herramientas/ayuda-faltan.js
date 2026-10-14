/* Dice qué frases del manual siguen sin traducir, sin tener que recorrer la app
   pantalla por pantalla.

   Lee `js/ayuda.js` como texto y saca las frases literales de la zona de datos
   —TEMAS, PASOS y PREGUNTAS—, que es donde vive el manual entero. No carga el
   módulo porque las tres listas son locales al IIFE y no salen a ningún sitio:
   sacarlas solo para poder contarlas sería ensuciar el módulo para la
   herramienta, y la herramienta es la que se adapta.

   Se ejecuta a mano:  node herramientas/ayuda-faltan.js  */
const fs = require('fs');

global.window = {};
require('../js/textos-en.js');
require('../js/textos-en-ayuda.js');
const d = global.window.TEXTOS_EN;

const src = fs.readFileSync(__dirname + '/../js/ayuda.js', 'utf8');
const ini = src.indexOf('const TEMAS = [');
const fin = src.indexOf('/* ================= índice y búsqueda');
const zona = src.slice(ini, fin);

/* Las frases largas van partidas en varios literales pegados con `+`, que es
   lo que cabe en una linea. Hay que unirlos antes de buscarlos: la clave del
   diccionario es la frase entera, asi que mirando trozo a trozo daba por sin
   traducir lo que si estaba, y un aviso que canta lo que no es deja de servir
   para avisar de lo que si. */
function literal(src, i) {
  if (src[i] !== "'") return null;
  let s = '';
  let j = i + 1;
  while (j < src.length) {
    const c = src[j];
    if (c === '\\') { s += c + src[j + 1]; j += 2; continue; }
    if (c === "'") return [s, j + 1];
    if (c === '\n') return null;   /* una comilla sin cerrar en la linea: no es un literal */
    s += c; j++;
  }
  return null;
}

/* Desde `i`, un literal y todos los que le siguen pegados con `+`. */
function cadena(src, i) {
  const uno = literal(src, i);
  if (!uno) return null;
  let s = uno[0];
  let j = uno[1];
  for (;;) {
    const mas = /^\s*\+\s*/.exec(src.slice(j, j + 40));
    if (!mas) break;
    const otro = literal(src, j + mas[0].length);
    if (!otro) break;
    s += otro[0];
    j = otro[1];
  }
  return [s, j];
}

/* Una frase de manual siempre lleva un espacio: lo que no lo lleva es un id
   ('g-peso'), una ruta ('rutina') o una clave de material ('barbell'). */
const frases = [];
for (let i = 0; i < zona.length; i++) {
  if (zona[i] !== "'") continue;
  const c = cadena(zona, i);
  if (!c) continue;
  i = c[1] - 1;
  const s = c[0].replace(/\\'/g, "'");
  if (s.indexOf(' ') !== -1 && s.length > 6) frases.push(s);
}

const vistas = Object.create(null);
const faltan = [];
frases.forEach(function (s) {
  if (vistas[s]) return;
  vistas[s] = 1;
  if (!Object.prototype.hasOwnProperty.call(d, s)) faltan.push(s);
});

console.log('frases del manual: ' + Object.keys(vistas).length +
  '   traducidas: ' + (Object.keys(vistas).length - faltan.length) +
  '   faltan: ' + faltan.length);
faltan.forEach(function (s) { console.log('  · ' + s); });
