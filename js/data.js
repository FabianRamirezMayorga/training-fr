/* data.js — catálogo de ejercicios.
   Fuente: free-exercise-db (dominio público) servida por el CDN gratuito de jsDelivr.
   876 ejercicios, cada uno con 2 fotogramas (inicio y fin del movimiento) que la app
   alterna para animar la técnica correcta. */
(function (g) {
  'use strict';

  const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/';
  const MIRROR = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/';
  const JSON_PATH = 'dist/exercises.json';
  const CACHE_KEY = 'trainingfr.catalog.v1';

  let list = [];
  let byId = {};

  /* Dónde entrenas. Es el filtro principal de toda la app: el catálogo, el
     selector de ejercicios y el planificador solo ofrecen lo que puedes hacer. */
  const GEAR = {
    gym: {
      label: 'En el gimnasio',
      note: 'Barras, mancuernas, poleas y máquinas',
      frase: 'en el gimnasio',
      icon: 'dumbbell',
      allow: ['barbell', 'dumbbell', 'cable', 'machine', 'body only', 'kettlebells',
        'bands', 'e-z curl bar', 'exercise ball', 'medicine ball', 'other', 'foam roll']
    },
    dumbbell: {
      label: 'En casa con mancuernas',
      note: 'Mancuernas, kettlebells y peso corporal',
      frase: 'en casa con mancuernas',
      icon: 'dumbbell',
      allow: ['dumbbell', 'body only', 'kettlebells', 'exercise ball', 'medicine ball', 'foam roll']
    },
    bands: {
      label: 'En casa con bandas',
      note: 'Bandas elásticas y peso corporal',
      frase: 'en casa con bandas',
      icon: 'dumbbell',
      allow: ['bands', 'body only', 'exercise ball', 'medicine ball', 'foam roll']
    },
    home: {
      label: 'Sin material',
      note: 'Solo tu peso corporal, en cualquier sitio',
      frase: 'sin material',
      icon: 'dumbbell',
      allow: ['body only', 'foam roll']
    },
    /* Sin filtro. Para curiosear el catálogo entero o para quien todavía no
       sabe con qué va a entrenar. allow en null significa "todo vale", así que
       entran también los ejercicios que no declaran material. */
    todo: {
      label: 'Ver todo',
      note: 'El catálogo completo, sin filtrar por material',
      frase: 'con todo el material',
      icon: 'dumbbell',
      allow: null
    }
  };

  /* Qué clase de trabajo es, dicho como lo busca uno. El catálogo trae la
     categoría en inglés y con nombres que no ayudan —«stretching» mete en el
     mismo saco los estiramientos y el rodillo de espuma, que no se usan para
     lo mismo—, así que aquí se recomponen: el rodillo sale aparte por su
     material y la fuerza junta lo que en la práctica es fuerza. */
  /* Pilates de suelo. No hay ninguna fuente libre de pilates —lo busqué— así
     que la lista está escogida a mano del catálogo: control del centro,
     movimiento de columna vértebra a vértebra y trabajo de suelo, que es lo
     que un mat de pilates tiene en común con lo que hay aquí. No es el
     repertorio auténtico ni lo pretende. */
  const PILATES = [
    'Dead_Bug', 'Plank', 'Side_Bridge', 'Butt_Lift_Bridge', 'Single_Leg_Glute_Bridge',
    'Pelvic_Tilt_Into_Bridge', 'Standing_Pelvic_Tilt', 'Scissor_Kick', 'Stomach_Vacuum',
    'Superman', 'Lower_Back_Curl', 'Bent-Knee_Hip_Raise', 'Reverse_Crunch', 'Leg_Pull-In',
    'Flat_Bench_Lying_Leg_Raise', 'Cocoons', 'Jackknife_Sit-Up', 'Bottoms_Up',
    'Russian_Twist', 'Cross-Body_Crunch', 'Oblique_Crunches', 'Air_Bike', 'Butt-Ups',
    'Spider_Crawl', 'Flutter_Kicks', 'Cat_Stretch', 'Childs_Pose', 'Hip_Circles_prone',
    'Toe_Touchers', 'Seated_Leg_Tucks', 'Glute_Kickback', 'Leg_Lift', 'Side_Jackknife',
    'Hyperextensions_With_No_Hyperextension_Bench'
  ];

  const TIPOS = [
    { id: 'fuerza', label: 'Fuerza', test: function (e) {
      return e.category === 'strength' || e.category === 'powerlifting' ||
        e.category === 'strongman';
    } },
    { id: 'estiramiento', label: 'Estiramientos', test: function (e) {
      return e.category === 'stretching' && e.equipment !== 'foam roll';
    } },
    { id: 'yoga', label: 'Yoga', test: function (e) {
      return e.category === 'yoga';
    } },
    { id: 'pilates', label: 'Pilates', test: function (e) {
      return PILATES.indexOf(e.id) !== -1;
    } },
    { id: 'rodillo', label: 'Rodillo y terapia', test: function (e) {
      return e.equipment === 'foam roll';
    } },
    { id: 'salto', label: 'Saltos y potencia', test: function (e) {
      return e.category === 'plyometrics';
    } },
    { id: 'cardio', label: 'Cardio', test: function (e) {
      return e.category === 'cardio';
    } },
    { id: 'halterofilia', label: 'Halterofilia', test: function (e) {
      return e.category === 'olympic weightlifting';
    } }
  ];

  const TIPO_POR_ID = {};
  TIPOS.forEach(function (t) { TIPO_POR_ID[t.id] = t; });

  function tipoDe(ex) {
    for (let i = 0; i < TIPOS.length; i++) if (TIPOS[i].test(ex)) return TIPOS[i].id;
    return '';
  }

  /* Cómo se nombra el sitio dentro de una frase: "...que puedes hacer EN EL GIMNASIO" */
  function gearFrase(gear) {
    const gset = GEAR[gear];
    return gset ? (gset.frase || gset.label.toLowerCase()) : '';
  }

  function gearAllows(gear, equipment) {
    const gset = GEAR[gear];
    if (!gset || !gset.allow) return true;
    return gset.allow.indexOf(equipment) !== -1;
  }

  const PLACEHOLDER =
    'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3">' +
      '<rect width="4" height="3" fill="#212836"/>' +
      '<path d="M.7 1.5v.6M1.2 1.3v1M2.8 1.3v1M3.3 1.5v.6M1.2 1.8h1.6" ' +
      'stroke="#3ddc84" stroke-width=".12" stroke-linecap="round" fill="none"/></svg>');

  /* URL del fotograma i de un ejercicio (0 = inicio, 1 = final del movimiento) */
  /* Las del yoga vienen de otra fuente y ya traen la direccion entera */
  function rutaImagen(p) {
    return /^https?:/i.test(p) ? p : CDN + 'exercises/' + p;
  }

  function img(ex, i) {
    if (!ex || !ex.images || !ex.images.length) return PLACEHOLDER;
    return rutaImagen(ex.images[Math.min(i || 0, ex.images.length - 1)]);
  }

  function frames(ex) {
    if (!ex || !ex.images || !ex.images.length) return [PLACEHOLDER];
    return ex.images.map(rutaImagen);
  }

  /* Texto normalizado sobre el que busca el usuario: inglés + español */
  function haystack(ex) {
    const parts = [
      ex.name, ex.nameEs, ex.equipment, I18N.equip(ex.equipment),
      ex.category, I18N.category(ex.category), I18N.level(ex.level)
    ];
    (ex.primaryMuscles || []).concat(ex.secondaryMuscles || []).forEach(function (m) {
      parts.push(m, I18N.muscle(m));
    });
    return I18N.norm(parts.filter(Boolean).join(' '));
  }

  /* Orden por utilidad: primero los ejercicios de fuerza recomendados y los
     compuestos; los estiramientos y el trabajo accesorio, al final. Sin esto la
     lista es alfabética y "Estiramiento de cuádriceps" precede a "Sentadilla". */
  const CAT_RANK = {
    strength: 0, powerlifting: 0, 'olympic weightlifting': 1,
    plyometrics: 2, strongman: 2, cardio: 3, stretching: 4, yoga: 4
  };

  function rank(ex) {
    let r = CAT_RANK[ex.category];
    if (r === undefined) r = 3;
    if (ex.mechanic !== 'compound') r += 0.5;
    if (!ex.images || ex.images.length < 2) r += 2;
    /* los ejercicios recomendados por el planificador encabezan su músculo */
    if (window.Planner && Planner.RECOMENDADOS.has(ex.id)) r -= 3;
    return r;
  }

  function prepare(raw) {
    list = raw.map(function (ex) {
      const e = Object.assign({}, ex);
      /* 77 ejercicios del catálogo no declaran material y todos son de peso
         corporal (flexiones, remo invertido, escalador, saltos). Sin esto
         ningún filtro los dejaba ver, ni siquiera el de "sin material". */
      if (!e.equipment) e.equipment = 'body only';
      e.nameEs = ex.nameEs || I18N.name(ex.name);
      e._rank = rank(ex);
      e.groups = I18N.GROUPS
        .filter(function (gr) {
          return (ex.primaryMuscles || []).some(function (m) { return gr.muscles.indexOf(m) !== -1; });
        })
        .map(function (gr) { return gr.id; });
      e._q = haystack(e);
      return e;
    }).sort(function (a, b) {
      return a._rank - b._rank || a.nameEs.localeCompare(b.nameEs, 'es');
    });

    byId = {};
    list.forEach(function (e) { byId[e.id] = e; });
    return list;
  }

  /* El yoga vive en su propio fichero y se suma al catálogo descargado. Va
     fuera de la copia guardada a propósito: así una versión nueva de la app
     trae posturas nuevas sin esperar a que caduque lo guardado. */
  function conYoga(raw) {
    if (!g.Yoga) return raw;
    return raw.concat(Yoga.crudos());
  }

  function fetchJSON(url) {
    return fetch(url, { cache: 'default' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  /* Carga el catálogo: CDN -> espejo en GitHub -> copia local guardada antes. */
  function load() {
    return fetchJSON(CDN + JSON_PATH)
      .catch(function () { return fetchJSON(MIRROR + JSON_PATH); })
      .then(function (raw) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(raw)); } catch (e) { /* cuota llena: no es crítico */ }
        return prepare(conYoga(raw));
      })
      .catch(function (err) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) return prepare(conYoga(JSON.parse(cached)));
        throw err;
      });
  }

  function all() { return list; }
  function get(id) { return byId[id] || null; }

  /* filtros: {q, group, muscle, equipment, level, category, favs, gear} */
  function search(f) {
    f = f || {};
    const q = I18N.norm(f.q || '');
    const terms = q ? q.split(' ').filter(Boolean) : [];
    return list.filter(function (e) {
      if (f.gear && !gearAllows(f.gear, e.equipment)) return false;
      if (f.group && e.groups.indexOf(f.group) === -1) return false;
      if (f.muscle && (e.primaryMuscles || []).indexOf(f.muscle) === -1) return false;
      /* varios músculos a la vez: una zona del cuerpo, no un músculo suelto */
      if (f.muscles && f.muscles.length && !(e.primaryMuscles || []).some(function (m) {
        return f.muscles.indexOf(m) !== -1;
      })) return false;
      if (f.equipment && e.equipment !== f.equipment) return false;
      if (f.level && e.level !== f.level) return false;
      if (f.category && e.category !== f.category) return false;
      if (f.tipo && TIPO_POR_ID[f.tipo] && !TIPO_POR_ID[f.tipo].test(e)) return false;
      if (f.favs && !Store.isFav(e.id)) return false;
      for (let i = 0; i < terms.length; i++) {
        if (e._q.indexOf(terms[i]) === -1) return false;
      }
      return true;
    });
  }

  /* Enlace a una búsqueda en YouTube, para ver el movimiento en vídeo real */
  function youtube(ex) {
    return 'https://www.youtube.com/results?search_query=' +
      encodeURIComponent('como hacer ' + ex.nameEs + ' tecnica correcta');
  }

  /* ---------- lo que la IA puede proponer ----------
     Sin darle el catálogo, la IA propone de memoria: «remo con barra T»,
     «hip thrust en máquina», cosas que aquí no existen. Entonces el cambio o se
     descarta o acaba en el primer parecido que encuentre el buscador, que a
     veces no tiene nada que ver. Se le pasa un menú cerrado: solo puede elegir
     de ahí, y lo que elija se resuelve por nombre exacto.
     No caben los 924, así que se recorta por músculo dejando primero lo
     compuesto y el material de siempre, que es lo que uno acaba usando. */
  const ORDEN_MATERIAL = {
    barbell: 0, dumbbell: 1, machine: 2, cable: 3, 'body only': 4,
    'e-z curl bar': 5, kettlebells: 6, bands: 7
  };

  function paraIA(opciones) {
    opciones = opciones || {};
    const foco = opciones.musculos || [];
    const tope = opciones.porMusculo || 14;

    const grupos = {};
    search({ gear: opciones.gear || 'gym' }).forEach(function (e) {
      const mus = (e.primaryMuscles || [])[0];
      if (!mus) return;
      (grupos[mus] = grupos[mus] || []).push(e);
    });

    return Object.keys(grupos).map(function (mus) {
      const cuantos = foco.indexOf(mus) !== -1 ? tope + 8 : tope;
      const lista = grupos[mus].slice().sort(function (a, b) {
        const ca = a.mechanic === 'compound' ? 0 : 1;
        const cb = b.mechanic === 'compound' ? 0 : 1;
        if (ca !== cb) return ca - cb;
        const ea = ORDEN_MATERIAL[a.equipment];
        const eb = ORDEN_MATERIAL[b.equipment];
        if ((ea === undefined ? 9 : ea) !== (eb === undefined ? 9 : eb)) {
          return (ea === undefined ? 9 : ea) - (eb === undefined ? 9 : eb);
        }
        return String(a.nameEs).localeCompare(String(b.nameEs));
      }).slice(0, cuantos);

      return I18N.muscle(mus).toUpperCase() + ': ' +
        lista.map(function (e) { return e.nameEs; }).join(' | ');
    }).join('\n');
  }

  /* Nombre exacto — tal y como se le ofreció a la IA — al ejercicio del
     catálogo. Devuelve null si no es uno de los nuestros, que es justo lo que
     hay que saber antes de meterlo en una rutina. */
  function porNombreEs(nombre) {
    const buscado = I18N.norm(String(nombre || ''));
    if (!buscado) return null;
    const todos = all();
    for (let i = 0; i < todos.length; i++) {
      if (I18N.norm(todos[i].nameEs) === buscado) return todos[i];
    }
    return null;
  }

  g.Data = {
    paraIA: paraIA, porNombreEs: porNombreEs,
    load: load, all: all, get: get, search: search,
    img: img, frames: frames, youtube: youtube, PLACEHOLDER: PLACEHOLDER,
    GEAR: GEAR, gearAllows: gearAllows, gearFrase: gearFrase,
    TIPOS: TIPOS, tipoDe: tipoDe
  };
})(window);
