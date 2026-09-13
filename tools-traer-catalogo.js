/* tools-traer-catalogo.js — trae el catálogo en español a este repo.

   Se ejecuta a mano, no en la app:   node tools-traer-catalogo.js

   POR QUÉ EXISTE
   El catálogo de base (free-exercise-db) está en inglés y los nombres en
   español salen de un diccionario palabra a palabra: de ahí «Around del mundo»
   y «Press de banca hammer agarre db inclinado». Y no tiene calistenia, así
   que hubo que dibujar los muñecos a mano.

   RepDB resuelve las dos cosas: el español está escrito, no traducido, y trae
   front lever, planche, bandera, L-sit y dragon flag con fotos de verdad.

   QUÉ SE TRAE Y QUÉ NO
   Se transforman los datos al formato de esta app y se guardan las imágenes
   que la app usa. No se copia su fichero tal cual: su licencia permite el uso
   dentro de aplicaciones pero no republicar el conjunto como conjunto de
   datos, y un volcado literal en un repo público sería eso. Lo que queda aquí
   son recursos de la app.

   LA ATRIBUCIÓN ES OBLIGATORIA y está en la pantalla de Ajustes. No se quita.

   Descartadas, y por qué:
   - ExerciseDB: su repo son 32 KB de servidor con licencia AGPL; los GIF no
     están ahí. Esos GIF son de Gym visual, cedidos por escrito a un repo
     concreto, y ese permiso no se transfiere a quien clone.
   - wger: 374 imágenes y ni una de calistenia.
   - FitGif: sus extremos no responden. */
'use strict';

const fs = require('fs');
const path = require('path');

const ORIGEN = 'https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@main/';
const SALIDA_JSON = path.join(__dirname, 'data', 'catalogo-es.json');
const SALIDA_IMG = path.join(__dirname, 'data', 'img');

/* ---------- los diccionarios ----------
   RepDB hila más fino que esta app: distingue deltoides anterior de lateral y
   de posterior, o gemelo de sóleo. Aquí se baja a los 17 músculos que maneja
   el resto de la app, que son los que tienen filtro, mapa y reparto de
   volumen. Afinar más significaría tocar media app para ganar poco. */
const MUSCULO = {
  pectoralis_major: 'chest',
  latissimus_dorsi: 'lats',
  rhomboids: 'middle back',
  trapezius: 'traps',
  erector_spinae: 'lower back',
  quadratus_lumborum: 'lower back',
  anterior_deltoid: 'shoulders',
  lateral_deltoid: 'shoulders',
  posterior_deltoid: 'shoulders',
  biceps_brachii: 'biceps',
  brachialis: 'biceps',
  brachioradialis: 'forearms',
  forearm_flexors: 'forearms',
  forearm_extensors: 'forearms',
  triceps_brachii: 'triceps',
  rectus_abdominis: 'abdominals',
  transverse_abdominis: 'abdominals',
  obliques: 'abdominals',
  quadriceps: 'quadriceps',
  hamstrings: 'hamstrings',
  gluteus_maximus: 'glutes',
  gluteus_medius: 'glutes',
  hip_flexors: 'quadriceps',
  adductors: 'adductors',
  abductors: 'abductors',
  gastrocnemius: 'calves',
  soleus: 'calves'
};

/* El material se traduce al vocabulario del filtro de sitio. Lo que necesita
   una instalación —barra fija, paralelas, anillas— va como «other», que es
   como el catálogo de base etiqueta el muscle-up: así no se le ofrece a quien
   entrena en el salón sin nada. */
const MATERIAL = {
  dumbbell: 'dumbbell', barbell: 'barbell', ez_bar: 'e-z curl bar',
  kettlebell: 'kettlebells', cable: 'cable', trap_bar: 'barbell',
  plates: 'barbell', loop_band: 'bands', resistance_band: 'bands',
  stability_ball: 'exercise ball', slam_ball: 'medicine ball',
  pull_up_bar: 'other', dip_station: 'other', rings: 'other',
  suspension_trainer: 'other', climbing_rope: 'other', battle_rope: 'other',
  glute_ham_developer: 'other', plyo_box: 'other', jump_rope: 'other',
  wrist_roller: 'other', ab_wheel: 'other', flat_bench: 'other',
  air_bike: 'machine', treadmill: 'machine', elliptical: 'machine',
  rower: 'machine', stair_climber: 'machine', stationary_bike: 'machine',
  sled: 'machine', smith_machine: 'machine'
};

function material(k) {
  if (!k) return 'body only';                 // sin material declarado: peso corporal
  if (MATERIAL[k]) return MATERIAL[k];
  if (/machine|press|curl|extension|deck|pulldown|squat|thrust|shrug|raise/.test(k)) {
    return 'machine';
  }
  return 'other';
}

const CATEGORIA = {
  strength: 'strength', cardio: 'cardio', stretching: 'stretching',
  plyometrics: 'plyometrics', olympic: 'olympic weightlifting'
};

const NIVEL = { beginner: 'beginner', intermediate: 'intermediate', advanced: 'expert' };

/* ---------- utilidades ---------- */

/* El JSON viene con listas escritas como texto de Python: "['a', 'b']" */
function lista(v) {
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string' || !v.trim()) return [];
  try { return JSON.parse(v.replace(/'/g, '"')); } catch (e) { /* abajo */ }
  return v.replace(/^\[|\]$/g, '').split(',')
    .map(function (x) { return x.trim().replace(/^['"]|['"]$/g, ''); })
    .filter(Boolean);
}

function unicos(a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }); }

function bajar(url) {
  return fetch(url).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status + ' en ' + url);
    return r;
  });
}

/* ---------- el trabajo ---------- */

async function main() {
  fs.mkdirSync(SALIDA_IMG, { recursive: true });

  console.log('Trayendo el catálogo…');
  const crudo = await (await bajar(ORIGEN + 'exercises.json')).json();
  const origen = Array.isArray(crudo) ? crudo : (crudo.exercises || Object.values(crudo)[0]);
  console.log('  ' + origen.length + ' ejercicios en el origen');

  const fuera = [];
  const salida = [];
  let bajadas = 0, ya = 0;

  for (const e of origen) {
    let im = e.images;
    if (typeof im === 'string') {
      try { im = JSON.parse(im.replace(/'/g, '"')); } catch (x) { im = null; }
    }
    const flat = (im && im.flat) || {};

    /* Casi todos traen dos fotogramas —start y peak— y con esos dos el
       reproductor anima. Los aguantes traen uno solo, «main», y está bien que
       así sea: un front lever no tiene dos posiciones, se sostiene. Se aceptan
       igual, con un fotograma, que es lo que hace el reproductor con el yoga. */
    const cuales = (flat.start && flat.peak) ? ['start', 'peak']
      : (flat.main ? ['main'] : null);
    if (!cuales) { fuera.push(e.name_es || e.name_en); continue; }

    const nombre = (e.name_es || e.name_en || '').trim();
    if (!nombre) continue;

    const prim = unicos(lista(e.primary_muscles).map(function (m) { return MUSCULO[m]; }));
    if (!prim.length) { fuera.push(nombre + ' (sin músculo conocido)'); continue; }

    const id = 'es_' + String(e.id).replace(/[^a-z0-9]+/gi, '_');
    const ficheros = [];

    for (const cual of cuales) {
      const rel = flat[cual];
      const dest = id + '-' + cual + '.webp';
      const abs = path.join(SALIDA_IMG, dest);
      if (fs.existsSync(abs)) { ya++; } else {
        const r = await bajar(ORIGEN + rel);
        fs.writeFileSync(abs, Buffer.from(await r.arrayBuffer()));
        bajadas++;
        if (bajadas % 50 === 0) console.log('  ' + bajadas + ' imágenes…');
      }
      ficheros.push('data/img/' + dest);
    }

    salida.push({
      id: id,
      name: e.name_en || nombre,
      nameEs: nombre,
      force: e.force_type || null,
      level: NIVEL[e.difficulty] || 'intermediate',
      mechanic: e.mechanic || 'compound',
      equipment: material(e.equipment),
      primaryMuscles: prim,
      secondaryMuscles: unicos(lista(e.secondary_muscles)
        .map(function (m) { return MUSCULO[m]; }))
        .filter(function (m) { return prim.indexOf(m) === -1; }),
      /* Las instrucciones y los consejos, en español de origen: por eso se
         marcan para que el traductor automático de la app no los toque. */
      instructions: lista(e.instructions_es).concat(lista(e.tips_es)),
      yaEnEspanol: true,
      category: CATEGORIA[e.category] || 'strength',
      images: ficheros
    });
  }

  fs.writeFileSync(SALIDA_JSON, JSON.stringify(salida));

  console.log('\nListo.');
  console.log('  ' + salida.length + ' ejercicios en data/catalogo-es.json');
  console.log('  ' + bajadas + ' imágenes nuevas, ' + ya + ' ya estaban');
  console.log('  ' + fuera.length + ' descartados por no traer ninguna imagen');
}

main().catch(function (e) { console.error('Ha fallado: ' + e.message); process.exit(1); });
