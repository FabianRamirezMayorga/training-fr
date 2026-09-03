/* alternativas.js — "la máquina está ocupada".
   Para cualquier ejercicio busca otros que entrenen lo mismo con material
   distinto: el mismo patrón de movimiento en barra, mancuernas, polea, máquina
   o peso corporal. Así una máquina ocupada nunca corta el entrenamiento.

   El criterio no es el nombre: es el PATRÓN de movimiento (lo que hace el
   cuerpo) más los músculos implicados. Un press de banca con barra, con
   mancuernas, en máquina y una flexión son el mismo patrón; el peso muerto y
   el curl femoral comparten músculo pero no patrón, y eso se puntúa distinto. */
(function (g) {
  'use strict';

  /* Patrón -> núcleos de movimiento que lo forman.
     Los de la derecha son los que devuelve I18N.nucleo(). */
  const PATRONES = {
    'empuje horizontal': ['bench press', 'chest press', 'floor press', 'push up', 'pushup',
      'landmine press', 'jm press'],
    'apertura': ['fly', 'flye', 'crossover'],
    'fondo': ['dip', 'bench dip'],
    'empuje vertical': ['shoulder press', 'military press', 'overhead press', 'push press',
      'arnold press', 'handstand push up', 'jerk', 'thruster'],
    'elevacion lateral': ['lateral raise', 'side lateral raise', 'delt raise'],
    'elevacion frontal': ['front raise'],
    'traccion vertical': ['lat pulldown', 'pulldown', 'pull up', 'pullup', 'chin up', 'chinup',
      'muscle up'],
    'traccion horizontal': ['row', 'bent over row', 'inverted row', 't bar row', 'face pull'],
    'remo al menton': ['upright row'],
    'encogimiento': ['shrug'],
    'pullover': ['pullover'],
    'curl de biceps': ['curl', 'biceps curl', 'hammer curl', 'preacher curl', 'concentration curl',
      'spider curl', 'drag curl'],
    'extension de triceps': ['triceps pushdown', 'pushdown', 'triceps extension', 'tricep extension',
      'french press', 'skullcrusher', 'skull crusher', 'triceps kickback'],
    'curl de muneca': ['wrist curl'],
    'sentadilla': ['squat', 'front squat', 'overhead squat', 'goblet squat', 'hack squat',
      'sissy squat', 'jump squat', 'pistol squat', 'leg press', 'wall sit'],
    'zancada': ['lunge', 'walking lunge', 'split squat', 'step up'],
    'bisagra de cadera': ['deadlift', 'romanian deadlift', 'stiff leg deadlift',
      'straight leg deadlift', 'sumo deadlift', 'rack pull', 'good morning',
      'kettlebell swing', 'swing', 'clean pull', 'snatch pull', 'pull through'],
    'empuje de cadera': ['hip thrust', 'glute bridge', 'hip bridge', 'glute kickback'],
    'curl femoral': ['leg curl'],
    'extension de cuadriceps': ['leg extension'],
    'gemelo': ['calf raise', 'heel raise'],
    'lumbar': ['back extension', 'hyperextension', 'superman'],
    'abdominal en flexion': ['crunch', 'sit up', 'situp', 'bicycle'],
    'abdominal por elevacion': ['leg raise', 'knee raise', 'flutter kick', 'scissor kick'],
    'antirrotacion': ['plank', 'hollow hold', 'ab roller', 'roll out', 'rollout', 'bird dog',
      'shoulder tap'],
    'rotacion': ['russian twist', 'wood chop', 'woodchop', 'chop', 'windshield wiper'],
    'salto': ['jump', 'hop', 'box jump', 'broad jump', 'burpee']
  };

  /* Familias: patrones distintos que aun así sirven de recambio decente.
     Una apertura no es un press, pero con el banco ocupado es lo más parecido. */
  const FAMILIAS = {
    pecho: ['empuje horizontal', 'apertura', 'fondo'],
    hombro: ['empuje vertical', 'elevacion lateral', 'elevacion frontal'],
    espalda: ['traccion vertical', 'traccion horizontal', 'pullover'],
    trapecio: ['encogimiento', 'remo al menton'],
    rodilla: ['sentadilla', 'zancada', 'extension de cuadriceps'],
    cadera: ['bisagra de cadera', 'empuje de cadera', 'curl femoral'],
    core: ['abdominal en flexion', 'abdominal por elevacion', 'antirrotacion', 'rotacion', 'lumbar']
  };

  /* Núcleos que significan cosas distintas según el músculo que trabajen:
     un fondo de pecho y uno de tríceps no son el mismo ejercicio. */
  const AMBIGUOS = {
    press: { chest: 'empuje horizontal', shoulders: 'empuje vertical',
      triceps: 'extension de triceps', quadriceps: 'sentadilla', _: '' },
    raise: { calves: 'gemelo', shoulders: 'elevacion lateral',
      abdominals: 'abdominal por elevacion', hamstrings: 'curl femoral',
      glutes: 'empuje de cadera', 'lower back': 'lumbar', _: '' },
    extension: { triceps: 'extension de triceps', quadriceps: 'extension de cuadriceps',
      'lower back': 'lumbar', _: '' },
    curl: { biceps: 'curl de biceps', hamstrings: 'curl femoral', forearms: 'curl de muneca', _: '' },
    kickback: { glutes: 'empuje de cadera', triceps: 'extension de triceps', _: '' },
    dip: { triceps: 'extension de triceps', chest: 'fondo', _: 'fondo' },
    bridge: { glutes: 'empuje de cadera', abdominals: 'antirrotacion', _: 'empuje de cadera' }
  };

  /* índices inversos, construidos una sola vez */
  const DE_NUCLEO = {};
  Object.keys(PATRONES).forEach(function (p) {
    PATRONES[p].forEach(function (n) { if (!DE_NUCLEO[n]) DE_NUCLEO[n] = p; });
  });

  const DE_PATRON = {};
  Object.keys(FAMILIAS).forEach(function (f) {
    FAMILIAS[f].forEach(function (p) { DE_PATRON[p] = f; });
  });

  const FUERZA = ['strength', 'powerlifting', 'olympic weightlifting'];

  const cachePatron = {};

  /* El patrón de movimiento de un ejercicio, o '' si no se reconoce */
  function patron(ex) {
    if (!ex) return '';
    if (cachePatron[ex.id] !== undefined) return cachePatron[ex.id];
    const nu = I18N.nucleo(ex.name);
    let p = '';
    if (nu) {
      const amb = AMBIGUOS[nu];
      if (amb) {
        const prim = (ex.primaryMuscles || [])[0];
        p = (prim && amb[prim]) || amb._ || '';
      } else p = DE_NUCLEO[nu] || '';
    }
    cachePatron[ex.id] = p;
    return p;
  }

  function familia(p) { return p ? (DE_PATRON[p] || '') : ''; }

  /* Cuánto se solapan dos listas de músculos: 0 nada, 1 idénticas */
  function solape(a, b) {
    a = a || []; b = b || [];
    if (!a.length || !b.length) return 0;
    let inter = 0;
    a.forEach(function (x) { if (b.indexOf(x) !== -1) inter++; });
    const union = a.length + b.length - inter;
    return union ? inter / union : 0;
  }

  /* Puntúa a "c" como recambio de "o". Negativo = no tiene nada que ver. */
  function puntuar(o, c, gear) {
    const jp = solape(o.primaryMuscles, c.primaryMuscles);
    const po = patron(o), pc = patron(c);
    const mismoPatron = !!po && po === pc;
    const mismaFamilia = !mismoPatron && !!familia(po) && familia(po) === familia(pc);
    if (!jp && !mismoPatron && !mismaFamilia) return -1;

    let s = 42 * jp;
    if (mismoPatron) s += 46;
    else if (mismaFamilia) s += 16;
    else s -= 6;

    s += 8 * solape(o.secondaryMuscles, c.secondaryMuscles);
    if (o.force && c.force === o.force) s += 7;
    if (o.mechanic && c.mechanic === o.mechanic) s += 8;

    /* el sentido de todo esto es cambiar de material */
    if (c.equipment !== o.equipment) s += 14; else s -= 24;

    if (FUERZA.indexOf(c.category) !== -1) s += 6;
    if (c.category === 'stretching') s -= 40;
    if (c.category !== o.category) s -= 4;
    if (c.level === o.level) s += 4;
    if (c.images && c.images.length >= 2) s += 6;
    if (g.Planner && Planner.RECOMENDADOS.has(c.id)) s += 9;
    if (gear && !Data.gearAllows(gear, c.equipment)) s -= 60;
    return s;
  }

  function motivo(o, c) {
    const po = patron(o), pc = patron(c);
    if (po && po === pc) return 'Mismo movimiento';
    if (familia(po) && familia(po) === familia(pc)) return 'Movimiento parecido';
    const comun = (o.primaryMuscles || []).filter(function (m) {
      return (c.primaryMuscles || []).indexOf(m) !== -1;
    });
    if (comun.length) return 'Mismo músculo';
    return 'Trabajo parecido';
  }

  /* Alternativas a un ejercicio, de más a menos parecida.
     opts: {gear, limite, porMaterial, soloDisponible, minimo} */
  function para(ex, opts) {
    if (!ex) return [];
    opts = opts || {};
    const gear = opts.gear === undefined ? (Store.settings().gear || '') : opts.gear;
    const minimo = opts.minimo === undefined ? 20 : opts.minimo;
    const encontradas = [];

    Data.all().forEach(function (c) {
      if (c.id === ex.id) return;
      if (opts.soloDisponible && gear && !Data.gearAllows(gear, c.equipment)) return;
      const s = puntuar(ex, c, gear);
      if (s < minimo) return;
      encontradas.push({ ex: c, score: s, motivo: motivo(ex, c) });
    });

    encontradas.sort(function (a, b) {
      return b.score - a.score || a.ex.nameEs.localeCompare(b.ex.nameEs, 'es');
    });

    /* Variedad de material: sin este tope salen ocho versiones en polea y
       ninguna con mancuernas, que es justo la que hace falta. */
    const tope = opts.porMaterial || 2;
    const cuenta = {};
    const salida = [];
    encontradas.forEach(function (o) {
      const k = o.ex.equipment || 'otro';
      cuenta[k] = (cuenta[k] || 0) + 1;
      if (cuenta[k] <= tope) salida.push(o);
    });

    return salida.slice(0, opts.limite || 12);
  }

  g.Alt = { para: para, patron: patron, familia: familia, PATRONES: PATRONES };
})(window);
