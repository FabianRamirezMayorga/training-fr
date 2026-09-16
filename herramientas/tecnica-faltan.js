/* Lo mismo que ayuda-faltan.js pero para las guías de técnica: dice qué frases
   de tecnica.js y calistenia.js siguen sin traducir.

   Aquí sí se pueden cargar los módulos —GUIAS sale en g.Tecnica— así que se
   recorren los objetos en vez de leer el archivo como texto, que es más fiable.

   Se ejecuta a mano:  node herramientas/tecnica-faltan.js  */
global.window = {};
require('../js/textos-en.js');
require('../js/textos-en-ayuda.js');
require('../js/textos-en-tecnica.js');
const d = global.window.TEXTOS_EN;

/* tecnica.js y calistenia.js solo necesitan que exista el hueco: lo que se lee
   aquí son sus GUIAS, no lo que hacen con el catálogo. */
global.window.I18N = { nucleo: function () { return null; } };
global.window.Data = { all: function () { return []; } };
require('../js/tecnica.js');
try { require('../js/calistenia.js'); } catch (e) { /* no tiene guías propias */ }

const fuentes = [];
if (global.window.Tecnica) fuentes.push(['tecnica', global.window.Tecnica.GUIAS]);
if (global.window.Calistenia && global.window.Calistenia.GUIAS) {
  fuentes.push(['calistenia', global.window.Calistenia.GUIAS]);
}

const vistas = new Set();
const faltan = [];
function mira(s) {
  if (!s || typeof s !== 'string' || vistas.has(s)) return;
  vistas.add(s);
  if (!Object.prototype.hasOwnProperty.call(d, s)) faltan.push(s);
}

fuentes.forEach(function (par) {
  const guias = par[1];
  Object.keys(guias).forEach(function (k) {
    const gu = guias[k];
    if (!gu || gu.alias) return;
    mira(gu.titulo); mira(gu.respiracion); mira(gu.tempo);
    mira(gu.clave); mira(gu.seguridad);
    (gu.inicial || []).forEach(mira);
    (gu.recorrido || []).forEach(function (f) { mira(f.fase); mira(f.texto); });
    (gu.errores || []).forEach(function (e) { mira(e.fallo); mira(e.arreglo); });
  });
});

console.log('frases de técnica: ' + vistas.size +
  '   traducidas: ' + (vistas.size - faltan.length) + '   faltan: ' + faltan.length);
faltan.forEach(function (s) { console.log('  · ' + s); });
