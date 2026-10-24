/* herramientas/etiquetas.js — que el catálogo no mienta sobre qué entrena.

   Se ejecuta a mano:   node herramientas/etiquetas.js

   POR QUÉ EXISTE
   La app lee `primaryMuscles[0]` y nada más. Los dos catálogos que mezcla
   ordenan ese campo al revés en dos familias enteras: RepDB ficha la
   sentadilla como glúteo y el peso muerto rumano como glúteo; free-exercise-db
   los ficha como cuádriceps e isquiotibial, y es sobre esa convención sobre la
   que está escrita la app —sus plantillas piden h(P.sen,'quadriceps') y
   h(P.bis,'hamstrings')—.

   Con el orden cambiado, 65 ejercicios en español no ganaban nunca su hueco, y
   cinco abdominales venían fichados como cuádriceps: un sit-up contaba como
   pierna en el reparto de volumen. Eso no se ve leyendo el código ni usando la
   app; solo se ve contando.

   Y comprueba la otra mitad: que los gemelos escritos a mano en data.js
   siguen existiendo. Si se renombra un id del catálogo en español, el injerto
   deja de aplicarse en silencio y el plan vuelve a enseñar la foto de fuera
   sin que nadie se entere. */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const CATALOGO = path.join(RAIZ, 'data', 'catalogo-es.json');
const DATA_JS = path.join(RAIZ, 'js', 'data.js');

/* El músculo que tiene que ir el primero, por el nombre del ejercicio. Va por
   nombre y no por patrón para que esta herramienta no necesite cargar media
   app: tiene que poder correrse con node a secas. */
const REGLAS = [
  [/^(Abdominales|Elevación de (Piernas|Rodillas))/i, 'abdominals'],
  [/^Sentadilla|^Prensa de [Pp]iernas/i, 'quadriceps'],
  [/^(Peso Muerto|Buenos Días)/i, 'hamstrings'],
  [/^(Dominadas?|Jalón al Pecho)/i, 'lats'],
  [/^Curl de Piernas?|^Curl Femoral/i, 'hamstrings'],
  [/^Elevación de (Talones|Pantorrilla)/i, 'calves']
];

/* Se dejan fuera a propósito: un swing SÍ es dominante de glúteo, y ponerle el
   isquiotibial delante sería cambiar el dato en vez de ordenarlo. */
const EXCEPTOS = /swing|cargada|snatch|arrancada|hexagonal/i;

const catalogo = JSON.parse(fs.readFileSync(CATALOGO, 'utf8'));
const porId = {};
catalogo.forEach(function (e) { porId[e.id] = e; });

let fallos = 0;

/* ---------- 1. el músculo correcto, el primero ---------- */
const malOrden = [];
catalogo.forEach(function (e) {
  const nombre = e.nameEs || '';
  const pm = e.primaryMuscles || [];
  if (pm.length < 2 || EXCEPTOS.test(nombre)) return;
  for (let i = 0; i < REGLAS.length; i++) {
    if (!REGLAS[i][0].test(nombre)) continue;
    const debe = REGLAS[i][1];
    if (pm.indexOf(debe) > 0) {
      malOrden.push('   ' + e.id + '  «' + nombre + '»  ' +
        JSON.stringify(pm) + '  debería empezar por ' + debe);
    }
    break;
  }
});

console.log('ejercicios en el catálogo en español: ' + catalogo.length);
if (malOrden.length) {
  fallos += malOrden.length;
  console.log('\nel músculo que trabajan NO es el primero de la lista:');
  malOrden.forEach(function (l) { console.log(l); });
} else {
  console.log('músculo principal en su sitio:  todos');
}

/* ---------- 2. los gemelos escritos a mano siguen existiendo ---------- */
const src = fs.readFileSync(DATA_JS, 'utf8');
const bloque = src.match(/const GEMELO_ES = \{([\s\S]*?)\};/);
if (!bloque) {
  console.log('\nNO ENCUENTRO GEMELO_ES en js/data.js');
  fallos++;
} else {
  const pares = [];
  bloque[1].replace(/'([^']+)'\s*:\s*'([^']+)'/g, function (_, en, id) {
    pares.push([en, id]);
    return '';
  });
  const rotos = pares.filter(function (p) {
    const e = porId[p[1]];
    return !e || !e.images || e.images.length < 2;
  });
  console.log('\ngemelos escritos a mano: ' + pares.length);
  if (rotos.length) {
    fallos += rotos.length;
    console.log('apuntan a un id que ya no existe o se quedó sin ilustración:');
    rotos.forEach(function (p) { console.log('   ' + p[0] + '  ->  ' + p[1]); });
  } else {
    console.log('todos existen y traen sus dos fotogramas');
  }
}

if (fallos) {
  console.log('\n' + fallos + ' cosas que arreglar');
  process.exitCode = 1;
} else {
  console.log('\nel catálogo cuadra');
}
