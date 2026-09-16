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

/* Una frase de manual siempre lleva un espacio: lo que no lo lleva es un id
   ('g-peso'), una ruta ('rutina') o una clave de material ('barbell'). */
const frases = [];
const re = /'((?:[^'\\]|\\.)*)'/g;
let m;
while ((m = re.exec(zona))) {
  const s = m[1].replace(/\\'/g, "'");
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
