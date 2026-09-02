/* i18n.js — traduce al español el catálogo de ejercicios (que viene en inglés).
   El nombre no se traduce palabra por palabra (daría "De Pie Gemelo Elevaciones"):
   se localiza el NÚCLEO del ejercicio, se separan modificadores y material, y se
   recompone en orden español -> "Elevación de talones de pie".
   El nombre original siempre se muestra debajo en la ficha, así una traducción
   imperfecta nunca despista. */
(function (g) {
  'use strict';

  const MUSCLE = {
    abdominals: 'Abdominales', abductors: 'Abductores', adductors: 'Aductores',
    biceps: 'Bíceps', calves: 'Gemelos', chest: 'Pecho', forearms: 'Antebrazos',
    glutes: 'Glúteos', hamstrings: 'Isquiotibiales', lats: 'Dorsales',
    'lower back': 'Zona lumbar', 'middle back': 'Espalda media', neck: 'Cuello',
    quadriceps: 'Cuádriceps', shoulders: 'Hombros', traps: 'Trapecios', triceps: 'Tríceps'
  };

  const EQUIP = {
    'body only': 'Sin equipo', machine: 'Máquina', other: 'Otro',
    'foam roll': 'Foam roller', kettlebells: 'Kettlebell', dumbbell: 'Mancuernas',
    cable: 'Polea', barbell: 'Barra', bands: 'Bandas elásticas',
    'medicine ball': 'Balón medicinal', 'exercise ball': 'Fitball', 'e-z curl bar': 'Barra Z'
  };

  const CATEGORY = {
    strength: 'Fuerza', stretching: 'Estiramiento', plyometrics: 'Pliometría',
    strongman: 'Strongman', powerlifting: 'Powerlifting', cardio: 'Cardio',
    'olympic weightlifting': 'Halterofilia'
  };

  const LEVEL = { beginner: 'Principiante', intermediate: 'Intermedio', expert: 'Avanzado' };
  const FORCE = { push: 'Empuje', pull: 'Tracción', static: 'Isométrico' };
  const MECHANIC = { compound: 'Compuesto', isolation: 'Aislamiento' };

  const GROUPS = [
    { id: 'pecho', label: 'Pecho', muscles: ['chest'] },
    { id: 'espalda', label: 'Espalda', muscles: ['lats', 'middle back', 'lower back', 'traps'] },
    { id: 'pierna', label: 'Pierna', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'] },
    { id: 'hombro', label: 'Hombro', muscles: ['shoulders'] },
    { id: 'brazo', label: 'Brazo', muscles: ['biceps', 'triceps', 'forearms'] },
    { id: 'core', label: 'Core', muscles: ['abdominals'] }
  ];

  /* ---- 1. NÚCLEO: el movimiento en sí. Greedy, la frase más larga gana. ---- */
  const CORE = {
    'clean and jerk': 'Cargada y envión', 'clean and press': 'Cargada y press',
    'power clean': 'Cargada de potencia', 'hang clean': 'Cargada desde suspensión',
    'muscle snatch': 'Arrancada muscular', 'power snatch': 'Arrancada de potencia',
    'hang snatch': 'Arrancada desde suspensión', 'clean': 'Cargada', 'snatch': 'Arrancada',
    'jerk': 'Envión', 'thruster': 'Thruster', 'clean pull': 'Tirón de cargada',
    'snatch pull': 'Tirón de arrancada',

    'bench press': 'Press de banca', 'chest press': 'Press de pecho',
    'shoulder press': 'Press de hombros', 'military press': 'Press militar',
    'overhead press': 'Press militar', 'push press': 'Push press',
    'leg press': 'Prensa de piernas', 'floor press': 'Press en el suelo',
    'landmine press': 'Press landmine', 'arnold press': 'Press Arnold',
    'french press': 'Press francés', 'skullcrusher': 'Press francés',
    'skull crusher': 'Press francés', 'jm press': 'JM press', 'press': 'Press',

    'romanian deadlift': 'Peso muerto rumano', 'stiff leg deadlift': 'Peso muerto piernas rígidas',
    'straight leg deadlift': 'Peso muerto piernas rectas', 'sumo deadlift': 'Peso muerto sumo',
    'deadlift': 'Peso muerto', 'rack pull': 'Rack pull', 'good morning': 'Buenos días',

    'front squat': 'Sentadilla frontal', 'overhead squat': 'Sentadilla overhead',
    'split squat': 'Sentadilla búlgara', 'goblet squat': 'Sentadilla goblet',
    'hack squat': 'Sentadilla hack', 'sissy squat': 'Sentadilla sissy',
    'jump squat': 'Sentadilla con salto', 'squat': 'Sentadilla',
    'pistol squat': 'Sentadilla a una pierna', 'wall sit': 'Sentadilla isométrica en pared',

    'lat pulldown': 'Jalón al pecho', 'pulldown': 'Jalón en polea',
    'pull up': 'Dominada', 'pullup': 'Dominada', 'chin up': 'Dominada supina',
    'chinup': 'Dominada supina', 'muscle up': 'Muscle-up', 'face pull': 'Face pull',
    'pull through': 'Pull through', 'pullover': 'Pullover',

    'push up': 'Flexión', 'pushup': 'Flexión', 'handstand push up': 'Flexión en pino',
    'sit up': 'Abdominal', 'situp': 'Abdominal', 'crunch': 'Crunch',
    'russian twist': 'Giro ruso', 'mountain climber': 'Escalador',
    'leg raise': 'Elevación de piernas', 'knee raise': 'Elevación de rodillas',
    'plank': 'Plancha', 'hollow hold': 'Hollow hold', 'ab roller': 'Rueda abdominal',
    'roll out': 'Rueda abdominal', 'rollout': 'Rueda abdominal',
    'windshield wiper': 'Limpiaparabrisas', 'flutter kick': 'Aleteo de piernas',
    'scissor kick': 'Tijeras', 'bicycle': 'Bicicleta abdominal',

    'bent over row': 'Remo inclinado', 'upright row': 'Remo al mentón',
    'inverted row': 'Remo invertido', 't bar row': 'Remo en T', 'row': 'Remo',
    'shrug': 'Encogimiento de hombros',

    'hammer curl': 'Curl martillo', 'preacher curl': 'Curl predicador',
    'concentration curl': 'Curl concentrado', 'spider curl': 'Curl araña',
    'drag curl': 'Curl arrastrado', 'wrist curl': 'Curl de muñeca',
    'leg curl': 'Curl femoral', 'biceps curl': 'Curl de bíceps', 'curl': 'Curl',

    'triceps pushdown': 'Extensión de tríceps en polea', 'pushdown': 'Extensión en polea',
    'triceps extension': 'Extensión de tríceps', 'tricep extension': 'Extensión de tríceps',
    'leg extension': 'Extensión de cuádriceps', 'back extension': 'Extensión lumbar',
    'hyperextension': 'Hiperextensión lumbar', 'extension': 'Extensión',
    'glute kickback': 'Patada de glúteo', 'triceps kickback': 'Patada de tríceps',
    'kickback': 'Patada',

    'lateral raise': 'Elevación lateral', 'side lateral raise': 'Elevación lateral',
    'front raise': 'Elevación frontal', 'delt raise': 'Elevación de deltoides',
    'calf raise': 'Elevación de talones', 'heel raise': 'Elevación de talones',
    'raise': 'Elevación',

    'hip thrust': 'Empuje de cadera', 'glute bridge': 'Puente de glúteos',
    'hip bridge': 'Puente de cadera', 'bridge': 'Puente',
    'lunge': 'Zancada', 'walking lunge': 'Zancada caminando',
    'step up': 'Subida al cajón', 'box jump': 'Salto al cajón',
    'broad jump': 'Salto horizontal', 'jump': 'Salto', 'hop': 'Salto',
    'burpee': 'Burpee', 'dip': 'Fondo', 'bench dip': 'Fondo en banco',

    'fly': 'Apertura', 'flye': 'Apertura', 'crossover': 'Cruce de poleas',
    'kettlebell swing': 'Swing con kettlebell', 'swing': 'Swing',
    'turkish get up': 'Turkish get-up', 'farmers walk': 'Paseo del granjero',
    'wood chop': 'Leñador', 'woodchop': 'Leñador', 'chop': 'Leñador',
    'clam': 'Almeja', 'superman': 'Superman', 'bird dog': 'Bird dog',
    'shoulder tap': 'Toque de hombro', 'handstand': 'Pino',
    'sled push': 'Empuje de trineo', 'sled drag': 'Arrastre de trineo',
    'tire flip': 'Volteo de neumático', 'atlas stone': 'Atlas stone',

    'stretch': 'Estiramiento', 'smr': 'Liberación miofascial',
    'sprint': 'Sprint', 'run': 'Carrera', 'jog': 'Trote', 'walk': 'Caminata',
    'jump rope': 'Comba', 'rope climb': 'Trepa de cuerda',
    'throw': 'Lanzamiento', 'slam': 'Golpe', 'toss': 'Lanzamiento',
    'carry': 'Transporte', 'circle': 'Círculos', 'rotation': 'Rotación',
    'twist': 'Giro', 'pull': 'Jalón', 'push': 'Empuje', 'lift': 'Levantamiento',
    'hold': 'Isométrico', 'kick': 'Patada'
  };

  /* ---- 2. MODIFICADORES: posición, agarre, variante. Van tras el núcleo. ---- */
  const MOD = {
    'one arm': 'a un brazo', 'single arm': 'a un brazo', 'two arm': 'a dos brazos',
    'one leg': 'a una pierna', 'single leg': 'a una pierna', 'one legged': 'a una pierna',
    'single': 'unilateral', 'double': 'doble', 'alternating': 'alterno', 'alternate': 'alterno',
    'standing': 'de pie', 'seated': 'sentado', 'lying': 'tumbado', 'supine': 'boca arriba',
    'prone': 'boca abajo', 'kneeling': 'de rodillas', 'bent over': 'inclinado',
    'bent': 'inclinado', 'incline': 'inclinado', 'decline': 'declinado', 'flat': 'plano',
    'behind the neck': 'tras la nuca', 'behind the back': 'tras la espalda',
    'behind the head': 'tras la nuca', 'overhead': 'sobre la cabeza',
    'front': 'frontal', 'rear': 'posterior', 'reverse': 'inverso', 'side': 'lateral',
    'lateral': 'lateral', 'cross body': 'cruzado', 'crossed': 'cruzado',
    'close grip': 'agarre cerrado', 'wide grip': 'agarre abierto', 'medium grip': 'agarre medio',
    'medium': 'medio', 'shoulder width': 'anchura de hombros',
    'neutral grip': 'agarre neutro', 'reverse grip': 'agarre invertido',
    'underhand': 'agarre supino', 'overhand': 'agarre prono',
    'palms up': 'palmas arriba', 'palms down': 'palmas abajo', 'palms in': 'palmas neutras',
    'wide stance': 'postura abierta', 'narrow stance': 'postura cerrada',
    'wide': 'abierto', 'close': 'cerrado', 'narrow': 'estrecho',
    'sumo': 'sumo', 'split': 'dividido', 'bulgarian': 'búlgara', 'zercher': 'Zercher',
    'upright': 'al mentón', 'arnold': 'Arnold', 'goblet': 'goblet', 'landmine': 'landmine',
    'high': 'alto', 'low': 'bajo', 'straight': 'recto', 'stiff': 'rígido',
    'isometric': 'isométrico', 'static': 'estático', 'dynamic': 'dinámico',
    'partial': 'parcial', 'full': 'completo', 'explosive': 'explosivo',
    'elevated': 'elevado', 'suspended': 'en suspensión', 'hanging': 'colgado',
    'hang': 'en suspensión', 'assisted': 'asistido', 'weighted': 'con lastre',
    'external': 'externa', 'internal': 'interna', 'linear': 'lineal',
    'wall': 'en pared', 'floor': 'en el suelo', 'chair': 'en silla',
    'feet elevated': 'con los pies elevados', 'knees': 'de rodillas',
    'triceps version': 'para tríceps', 'chest version': 'para pecho',
    'power': 'de potencia', 'olympic': 'olímpico', 'military': 'militar',
    'walking': 'caminando', 'jumping': 'con salto', 'nordic': 'nórdico',
    'cuban': 'cubana', 'scott': 'Scott', 'gironda': 'Gironda', 'preacher': 'predicador',
    'on bench': 'en banco', 'on box': 'en cajón', 'from blocks': 'desde bloques'
  };

  /* ---- 3. MATERIAL: se pega al final como "con barra", "en polea"… ---- */
  const EQ = {
    'smith machine': 'en máquina Smith', 'smith': 'en máquina Smith',
    'barbell': 'con barra', 'dumbbell': 'con mancuernas', 'dumbbells': 'con mancuernas',
    'kettlebell': 'con kettlebell', 'kettlebells': 'con kettlebells',
    'cable': 'en polea', 'pulley': 'en polea', 'machine': 'en máquina',
    'lever': 'en máquina', 'leverage': 'en máquina',
    'band': 'con banda elástica', 'bands': 'con bandas elásticas',
    'resistance band': 'con banda elástica', 'chains': 'con cadenas',
    'ez bar': 'con barra Z', 'ez': 'con barra Z', 'e z bar': 'con barra Z',
    'medicine ball': 'con balón medicinal', 'exercise ball': 'con fitball',
    'stability ball': 'con fitball', 'swiss ball': 'con fitball', 'bosu ball': 'en bosu',
    'foam roll': 'con foam roller', 'foam roller': 'con foam roller',
    'plate': 'con disco', 'rope': 'con cuerda', 'trx': 'en TRX',
    'rings': 'en anillas', 'sandbag': 'con saco', 'sled': 'con trineo',
    'bodyweight': 'con peso corporal', 'body only': 'sin equipo',
    'parallel bars': 'en paralelas', 'landmine': 'en landmine'
  };

  /* ---- 4. Vocabulario de apoyo (partes del cuerpo y palabras sueltas) ---- */
  const WORD = {
    chest: 'pecho', back: 'espalda', shoulder: 'hombro', shoulders: 'hombros',
    biceps: 'bíceps', bicep: 'bíceps', triceps: 'tríceps', tricep: 'tríceps',
    forearm: 'antebrazo', forearms: 'antebrazos', wrist: 'muñeca', wrists: 'muñecas',
    abs: 'abdominales', ab: 'abdominal', abdominal: 'abdominal', core: 'core',
    oblique: 'oblicuo', obliques: 'oblicuos', lat: 'dorsal', lats: 'dorsales',
    trap: 'trapecio', traps: 'trapecios', delt: 'deltoides', delts: 'deltoides',
    deltoid: 'deltoides', pec: 'pectoral', pecs: 'pectorales',
    leg: 'pierna', legs: 'piernas', legged: 'pierna', quad: 'cuádriceps',
    quads: 'cuádriceps', quadriceps: 'cuádriceps', hamstring: 'isquiotibiales',
    hamstrings: 'isquiotibiales', glute: 'glúteo', glutes: 'glúteos', butt: 'glúteos',
    calf: 'gemelo', calves: 'gemelos', hip: 'cadera', hips: 'caderas',
    knee: 'rodilla', knees: 'rodillas', ankle: 'tobillo', groin: 'ingle',
    neck: 'cuello', head: 'cabeza', arm: 'brazo', arms: 'brazos', elbow: 'codo',
    spine: 'columna', adductor: 'aductores', abductor: 'abductores',
    lower: 'inferior', upper: 'superior', lumbar: 'lumbar', thigh: 'muslo',
    bench: 'banco', box: 'cajón', bar: 'barra', ball: 'balón', step: 'escalón',
    plank: 'plancha', version: '', foot: 'pie', feet: 'pies', attachment: '',
    rack: 'rack', stone: 'piedra', log: 'tronco', yoke: 'yugo', tire: 'neumático',
    grip: 'agarre', stance: 'postura', palm: 'palma', palms: 'palmas',
    exercise: 'ejercicio', balance: 'equilibrio', mobility: 'movilidad',
    strength: 'fuerza', bodyweight: 'peso corporal', body: 'cuerpo',
    with: 'con', without: 'sin', and: 'y', the: '', a: '', of: 'de', to: 'a',
    on: '', in: '', from: 'desde', over: 'sobre', under: 'bajo',
    against: 'contra', for: 'para', or: 'o', up: '', down: '', out: '',
    one: 'una', two: 'dos', three: 'tres', four: 'cuatro',
    world: 'del mundo', greatest: 'mejor', dead: 'muerto', blocks: 'bloques',
    wheel: 'rueda', ring: 'anilla', harness: 'arnés', rope: 'cuerda'
  };

  /* --- índices con variantes plurales generadas automáticamente --- */
  function buildIndex(src) {
    const map = new Map();
    for (const k in src) {
      map.set(k, src[k]);
      const parts = k.split(' ');
      const last = parts[parts.length - 1];
      const plurals = [last + 's'];
      if (/y$/.test(last)) plurals.push(last.slice(0, -1) + 'ies', last + 'es');
      if (/(s|x|ch|sh)$/.test(last)) plurals.push(last + 'es');
      for (const p of plurals) {
        const key = parts.slice(0, -1).concat(p).join(' ');
        if (!map.has(key)) map.set(key, src[k]);
      }
    }
    return map;
  }

  const I_CORE = buildIndex(CORE), I_MOD = buildIndex(MOD), I_EQ = buildIndex(EQ), I_WORD = buildIndex(WORD);
  const MAXN = 4;

  function norm(s) {
    return String(s || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function upperFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* Traduce un nombre de ejercicio del inglés al español. Best effort. */
  function translateName(name) {
    const words = norm(name).split(' ').filter(Boolean);
    if (!words.length) return name;

    const taken = new Array(words.length).fill(false);
    let core = null, coreAt = -1;

    /* a) núcleo: la coincidencia más larga de CORE en cualquier posición */
    outer:
    for (let n = MAXN; n >= 1; n--) {
      for (let i = 0; i + n <= words.length; i++) {
        const phrase = words.slice(i, i + n).join(' ');
        if (I_CORE.has(phrase)) {
          core = I_CORE.get(phrase); coreAt = i;
          for (let k = i; k < i + n; k++) taken[k] = true;
          break outer;
        }
      }
    }

    /* b) modificadores y material sobre lo que queda */
    const mods = [], eqs = [], rest = [];
    let i = 0;
    while (i < words.length) {
      if (taken[i]) { i++; continue; }
      let matched = false;
      for (let n = Math.min(MAXN, words.length - i); n >= 1 && !matched; n--) {
        let free = true;
        for (let k = i; k < i + n; k++) if (taken[k]) free = false;
        if (!free) continue;
        const phrase = words.slice(i, i + n).join(' ');
        let bucket = null, val = null;
        if (I_MOD.has(phrase)) { bucket = mods; val = I_MOD.get(phrase); }
        else if (I_EQ.has(phrase)) { bucket = eqs; val = I_EQ.get(phrase); }
        else if (n === 1 && I_WORD.has(phrase)) { bucket = rest; val = I_WORD.get(phrase); }
        else if (n === 1 && !I_WORD.has(phrase)) continue;
        if (bucket) {
          if (val) bucket.push(val);
          for (let k = i; k < i + n; k++) taken[k] = true;
          i += n; matched = true;
        }
      }
      if (!matched) { rest.push(words[i]); taken[i] = true; i++; }
    }

    /* c) el material se omite si el núcleo ya lo nombra ("Cruce de poleas" + "en polea") */
    const coreLow = norm(core || '');
    const eq = eqs.filter(function (e) {
      const stem = norm(e).split(' ').slice(1).join(' ').replace(/s$/, '');
      return stem && coreLow.indexOf(stem) === -1;
    });

    /* d) recomposición: núcleo + resto + modificadores + material.
          Sin núcleo reconocido el resto conserva su orden original. */
    const parts = [core].concat(rest, mods, eq.slice(0, 1)).filter(Boolean);
    const tokens = parts.join(' ').split(/\s+/).filter(Boolean);
    const clean = tokens.filter(function (w, k) { return k === 0 || w !== tokens[k - 1]; });
    return clean.length ? upperFirst(clean.join(' ')) : name;
  }

  /* Devuelve la clave del movimiento reconocido en el nombre ("bench press",
     "squat"...). Es lo que permite asignar a cada ejercicio su guía de técnica. */
  function nucleo(name) {
    const words = norm(name).split(' ').filter(Boolean);
    for (let n = MAXN; n >= 1; n--) {
      for (let k = 0; k + n <= words.length; k++) {
        const frase = words.slice(k, k + n).join(' ');
        if (I_CORE.has(frase)) {
          /* se devuelve la clave canónica, no la variante en plural */
          for (const clave in CORE) {
            if (CORE[clave] === I_CORE.get(frase)) return clave;
          }
          return frase;
        }
      }
    }
    return '';
  }

  function t(map, key) {
    if (key == null || key === '') return '—';
    return map[String(key).toLowerCase()] || key;
  }

  g.I18N = {
    MUSCLE: MUSCLE, EQUIP: EQUIP, CATEGORY: CATEGORY, LEVEL: LEVEL,
    FORCE: FORCE, MECHANIC: MECHANIC, GROUPS: GROUPS,
    muscle: function (k) { return t(MUSCLE, k); },
    equip: function (k) { return t(EQUIP, k); },
    category: function (k) { return t(CATEGORY, k); },
    level: function (k) { return t(LEVEL, k); },
    force: function (k) { return t(FORCE, k); },
    mechanic: function (k) { return t(MECHANIC, k); },
    name: translateName, nucleo: nucleo,
    norm: norm
  };
})(window);
