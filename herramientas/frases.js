/* herramientas/frases.js — que las razones del plan estén traducidas.

   Se ejecuta a mano:   node herramientas/frases.js

   POR QUÉ EXISTE
   Las razones del plan no se escriben con T() ni con Tn(), sino con frase(),
   que guarda la clave y sus valores y los lee después `Programa.leer`. Esa
   diferencia hace que no las vea ninguna de las otras comprobaciones: cambié
   dos de esas frases, las traducciones viejas se quedaron huérfanas en el
   diccionario, las nuevas sin traducir, y todos los validadores dijeron que
   estaba bien. Con la app en inglés habrían salido en español.

   DOS INTENTOS FALLIDOS ANTES DE ESTE, por si alguien quiere «mejorarlo»:

   1. Buscar `frase('…'` con una expresión regular se dejaba fuera justo las
      que importan: la mitad se escriben dentro de un ternario
      —frase(n > 4 ? 'una' : 'otra', …)— y ahí la clave no va pegada al
      paréntesis.
   2. Coger todas las cadenas hasta el paréntesis de cierre metía también los
      VALORES —frase('…', { nivel: 'sedentario' })— y cantaba «sedentario» como
      frase sin traducir. Por eso ahora solo se mira el primer argumento, hasta
      la coma de nivel cero.

   Y no comprueba las huérfanas. Lo intenté: una traducción que ya no se pide
   no rompe nada, y distinguirla de una clave que usa otra pantalla exige
   buscar su texto por todo js/ —donde está partido con + en varias líneas—,
   así que daba catorce falsos de catorce. Un validador que canta falsos se
   acaba ignorando entero, y entonces tampoco avisa de lo que sí importa. */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const FUENTES = ['js/programa.js', 'js/revisar.js', 'js/planner.js'];
const DICCIONARIO = path.join(RAIZ, 'js', 'textos-en.js');

/* El primer argumento de cada frase(...): sus cadenas, con las partidas por +
   vueltas a juntar. Se para en la coma de nivel cero, que es donde empiezan
   los valores. */
function clavesDe(src) {
  const out = [];
  let i = 0;
  while ((i = src.indexOf('frase(', i)) !== -1) {
    if (/[A-Za-z0-9_$.]/.test(src[i - 1] || ' ')) { i += 6; continue; }
    let j = i + 6;
    let nivel = 0;
    let actual = null;
    let finAnterior = 0;
    while (j < src.length) {
      const ch = src[j];
      if (ch === ',' && nivel === 0) break;
      if (ch === ')' && nivel === 0) break;
      if (ch === '(' || ch === '{' || ch === '[') nivel++;
      else if (ch === ')' || ch === '}' || ch === ']') nivel--;
      else if (ch === "'") {
        let k = j + 1;
        let s = '';
        while (k < src.length && src[k] !== "'") {
          if (src[k] === '\\') { s += src[k + 1]; k += 2; } else { s += src[k]; k++; }
        }
        const hueco = src.slice(finAnterior, j);
        if (actual && /^\s*\+\s*$/.test(hueco)) actual.s += s;
        else { actual = { s: s }; out.push(actual); }
        finAnterior = k + 1;
        j = k + 1;
        continue;
      }
      j++;
    }
    i = j + 1;
  }
  return out.map(function (x) { return x.s; }).filter(Boolean);
}

function clavesDelDiccionario(src) {
  const out = new Set();
  const rx = /^\s*'((?:[^'\\]|\\.)*)'\s*:/gm;
  let m;
  while ((m = rx.exec(src)) !== null) {
    out.add(m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
  }
  return out;
}

const enDic = clavesDelDiccionario(fs.readFileSync(DICCIONARIO, 'utf8'));

const pedidas = [];
FUENTES.forEach(function (f) {
  const ruta = path.join(RAIZ, f);
  if (!fs.existsSync(ruta)) return;
  clavesDe(fs.readFileSync(ruta, 'utf8')).forEach(function (k) {
    pedidas.push({ f: f, k: k });
  });
});

const sinTraducir = pedidas.filter(function (x) { return !enDic.has(x.k); });

console.log('razones del plan encontradas: ' + pedidas.length);
if (sinTraducir.length) {
  console.log('\nSIN TRADUCIR (' + sinTraducir.length + '):');
  sinTraducir.forEach(function (x) {
    console.log('   [' + x.f + ']  ' + x.k.slice(0, 110));
  });
  process.exitCode = 1;
} else {
  console.log('todas traducidas');
}
