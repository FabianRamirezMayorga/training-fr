/* programa.js — el plan de entrenamiento personal.
   No reparte músculos por días y ya: construye un programa a partir de quién
   eres. Sexo, edad, experiencia, objetivo y lesiones cambian el volumen semanal,
   los rangos de repeticiones, los descansos, el esfuerzo al que se llega y qué
   ejercicios quedan fuera.

   Todo lo de aquí es determinista y funciona sin conexión ni clave de IA: las
   referencias de volumen, frecuencia y repeticiones vienen de la literatura de
   entrenamiento de fuerza (series semanales por músculo, dos estímulos por
   semana, rangos por objetivo), no de una IA que improvisa cada vez. La IA, si
   está configurada, entra después a afinar y explicar, nunca a decidir sola.

   Esto no es consejo médico. Con una lesión real, el fisio manda. */
(function (g) {
  'use strict';

  /* ---------- 1. Cuánto trabajo aguanta esta persona ----------
     Series semanales por músculo principal. Debajo de 8 el estímulo se queda
     corto; por encima de 22 casi nadie recupera. */
  const VOLUMEN_BASE = { beginner: 10, intermediate: 15, expert: 19 };
  const VOLUMEN_MIN = 8;
  const VOLUMEN_MAX = 22;

  /* Objetivo de entrenamiento: define carga, repeticiones y descansos.
     "Tonificar" no existe como estímulo propio: es mantener músculo mientras
     baja la grasa, así que entrena igual que quien gana músculo y lo que
     cambia es la comida y el trabajo de acondicionamiento. */
  const OBJETIVOS = {
    ganar: {
      label: 'Ganar músculo',
      resumen: 'Volumen alto y cargas medias, que es lo que más masa construye.',
      principal: { series: 4, reps: 8, rest: 120 },
      accesorio: { series: 3, reps: 12, rest: 75 },
      rpe: 8, volumen: 1, cardio: false
    },
    perder: {
      label: 'Perder grasa sin perder músculo',
      resumen: 'Se mantiene la carga alta para conservar músculo y se acorta el ' +
        'descanso; la grasa la quita el déficit de calorías, no las mancuernas ligeras.',
      principal: { series: 4, reps: 8, rest: 90 },
      accesorio: { series: 3, reps: 14, rest: 50 },
      rpe: 8, volumen: 0.9, cardio: true
    },
    mantener: {
      label: 'Tonificar y mantenerme',
      resumen: 'Recomposición: mismo trabajo de fuerza con algo más de repeticiones ' +
        'y algo de acondicionamiento.',
      principal: { series: 4, reps: 9, rest: 105 },
      accesorio: { series: 3, reps: 13, rest: 60 },
      rpe: 8, volumen: 0.95, cardio: true
    },
    fuerza: {
      label: 'Levantar más peso',
      resumen: 'Pocas repeticiones, cargas altas y descansos largos en los ' +
        'básicos; el accesorio queda para el volumen.',
      principal: { series: 5, reps: 5, rest: 180 },
      accesorio: { series: 3, reps: 10, rest: 90 },
      rpe: 8, volumen: 0.85, cardio: false
    }
  };

  /* ---------- 2. La edad manda en la recuperación ---------- */
  function porEdad(edad) {
    edad = Number(edad) || 0;
    if (!edad) return { factor: 1, rpe: 9, calentamiento: 8, impacto: true, notas: [] };
    if (edad < 18) {
      return { factor: 0.8, rpe: 7, calentamiento: 10, impacto: true, notas: [
        'Antes de los 18 la prioridad es la técnica, no la carga: se deja margen ' +
        'en cada serie y se sube peso solo cuando el movimiento sale limpio.'] };
    }
    if (edad >= 60) {
      return { factor: 0.72, rpe: 7, calentamiento: 12, impacto: false, notas: [
        'A partir de los 60 se recorta el volumen y se quita el impacto: la fuerza ' +
        'se mantiene igual de bien con menos series y más calidad.',
        'Dos de los ejercicios accesorios se pueden cambiar por trabajo de ' +
        'equilibrio y movilidad sin perder nada.'] };
    }
    if (edad >= 50) {
      return { factor: 0.82, rpe: 8, calentamiento: 10, impacto: false, notas: [
        'Pasados los 50 la recuperación tarda más: menos series por sesión, ' +
        'sin saltos y sin llevar las series al fallo.'] };
    }
    if (edad >= 40) {
      return { factor: 0.92, rpe: 8, calentamiento: 9, impacto: true, notas: [
        'A partir de los 40 conviene calentar más y dejar una repetición en ' +
        'recámara en los básicos pesados.'] };
    }
    return { factor: 1, rpe: 9, calentamiento: 8, impacto: true, notas: [] };
  }

  /* ---------- 3. Sexo: diferencias medias, no reglas ----------
     Las mujeres suelen recuperar antes entre series y tolerar algo más de
     repeticiones con la misma carga relativa, y el tren inferior aguanta más
     volumen. Son promedios: el énfasis lo elige la persona, no su sexo. */
  function porSexo(sexo) {
    if (sexo === 'mujer') {
      return {
        descanso: 0.9, repsExtra: 2, volumenPierna: 1.15,
        notas: ['Los descansos van algo más cortos y las repeticiones algo más ' +
          'altas: de media se recupera antes entre series con la misma carga relativa.']
      };
    }
    return { descanso: 1, repsExtra: 0, volumenPierna: 1, notas: [] };
  }

  /* ---------- 4. Lesiones y limitaciones ----------
     Se leen del texto libre del perfil. Cada una retira patrones de movimiento
     completos y, cuando hace falta, material concreto. */
  const LESIONES = {
    rodilla: {
      label: 'Rodilla',
      pistas: ['rodilla', 'rodillas', 'menisco', 'ligamento cruzado', 'cruzado', 'patelar', 'condromalacia'],
      patronesFuera: ['salto'],
      exigirApoyo: ['sentadilla'],
      nota: 'Sin saltos ni impacto, y la sentadilla en versión guiada o parcial. ' +
        'El trabajo de cadera (peso muerto, empuje de cadera) sí entra: no carga la rodilla.'
    },
    hombro: {
      label: 'Hombro',
      pistas: ['hombro', 'hombros', 'manguito', 'rotador', 'supraespinoso', 'clavicula', 'clavícula'],
      patronesFuera: ['remo al menton', 'fondo'],
      equipoFuera: { 'empuje vertical': ['barbell', 'e-z curl bar'] },
      nota: 'Fuera el remo al mentón y los fondos, que son los que más pinzan. ' +
        'El press por encima de la cabeza va con mancuernas, que dejan girar el hombro.'
    },
    lumbar: {
      label: 'Espalda baja',
      pistas: ['lumbar', 'espalda baja', 'hernia', 'discal', 'ciatica', 'ciática', 'lumbalgia'],
      patronesFuera: ['salto'],
      equipoFuera: { 'bisagra de cadera': ['barbell', 'e-z curl bar'], 'traccion horizontal': ['barbell'] },
      nota: 'Nada de peso muerto ni remo con barra de pie: el mismo trabajo va ' +
        'con el pecho apoyado o en máquina, que quita la carga de la columna.'
    },
    codo: {
      label: 'Codo',
      pistas: ['codo', 'codos', 'epicondilitis', 'epitroclear', 'tenista', 'golfista'],
      equipoFuera: { 'extension de triceps': ['barbell', 'e-z curl bar'], 'curl de biceps': ['barbell'] },
      nota: 'El tríceps y el bíceps van en polea o con mancuernas: la barra fija ' +
        'la muñeca y es justo lo que irrita el codo.'
    },
    muneca: {
      label: 'Muñeca',
      pistas: ['muneca', 'muñeca', 'muñecas', 'tunel carpiano', 'túnel carpiano', 'carpo'],
      patronesFuera: ['curl de muneca'],
      nota: 'Sin trabajo directo de muñeca. Donde se pueda, agarre neutro (mancuerna ' +
        'o barra Z) en vez de barra recta.'
    },
    cadera: {
      label: 'Cadera',
      pistas: ['cadera', 'caderas', 'psoas', 'labrum', 'ingle', 'aductor'],
      patronesFuera: ['salto'],
      exigirApoyo: ['sentadilla'],
      nota: 'Sin impacto y sin rango profundo de cadera: mejor recorridos cortos ' +
        'y controlados que forzar la flexión.'
    },
    tobillo: {
      label: 'Tobillo',
      pistas: ['tobillo', 'tobillos', 'aquiles', 'esguince', 'fascitis'],
      patronesFuera: ['salto'],
      nota: 'Fuera el impacto. El gemelo se entrena sentado, que no carga el tendón igual.'
    },
    cuello: {
      label: 'Cuello',
      pistas: ['cuello', 'cervical', 'cervicales', 'trapecio alto'],
      patronesFuera: ['encogimiento'],
      nota: 'Sin encogimientos ni cargas por detrás de la nuca.'
    },
    cardiaco: {
      label: 'Corazón o tensión',
      pistas: ['corazon', 'corazón', 'cardiaco', 'cardíaco', 'tension alta', 'tensión alta',
        'hipertension', 'hipertensión', 'arritmia'],
      patronesFuera: ['salto'],
      sinMaximos: true,
      nota: 'Nada de series al fallo ni de aguantar la respiración: se para con ' +
        'margen y se respira en cada repetición. Con esto conviene que lo vea tu médico.'
    }
  };

  /* Qué limitaciones aparecen en el texto del perfil */
  function lesionesDe(texto) {
    const t = I18N.norm(texto || '');
    if (!t) return [];
    return Object.keys(LESIONES).filter(function (k) {
      return LESIONES[k].pistas.some(function (p) { return t.indexOf(I18N.norm(p)) !== -1; });
    });
  }

  /* Traduce las lesiones detectadas a restricciones concretas */
  function restricciones(claves) {
    const fuera = {};          // patrón -> true
    const equipoFuera = {};    // patrón -> [material]
    const conApoyo = {};       // patrón -> true (solo variantes guiadas o sentadas)
    const notas = [];
    let sinMaximos = false;

    claves.forEach(function (k) {
      const L = LESIONES[k];
      if (!L) return;
      (L.patronesFuera || []).forEach(function (p) { fuera[p] = true; });
      Object.keys(L.equipoFuera || {}).forEach(function (p) {
        equipoFuera[p] = (equipoFuera[p] || []).concat(L.equipoFuera[p]);
      });
      (L.exigirApoyo || []).forEach(function (p) { conApoyo[p] = true; });
      if (L.sinMaximos) sinMaximos = true;
      notas.push(L.label + ': ' + L.nota);
    });

    return { fuera: fuera, equipoFuera: equipoFuera, conApoyo: conApoyo,
      notas: notas, sinMaximos: sinMaximos };
  }

  /* ---------- 5. Los días ----------
     Cada día es una lista de huecos, y cada hueco pide un patrón de movimiento
     concreto. Programar por patrones y no por músculos es lo que evita el plan
     típico de seis variantes de press y ni una tracción vertical. */
  const P = {
    emH: 'empuje horizontal', emV: 'empuje vertical', trH: 'traccion horizontal',
    trV: 'traccion vertical', sen: 'sentadilla', zan: 'zancada', bis: 'bisagra de cadera',
    cad: 'empuje de cadera', cuf: 'curl femoral', exc: 'extension de cuadriceps',
    gem: 'gemelo', lat: 'elevacion lateral', cbi: 'curl de biceps', etr: 'extension de triceps',
    abd: 'abdominal por elevacion', ant: 'antirrotacion', lum: 'lumbar', apr: 'apertura'
  };

  function h(patron, musculo, rol) { return { patron: patron, musculo: musculo, rol: rol }; }

  const DIAS = {
    fullA: { nombre: 'Cuerpo completo A', huecos: [
      h(P.sen, 'quadriceps', 'principal'), h(P.emH, 'chest', 'principal'),
      h(P.trH, 'middle back', 'principal'), h(P.bis, 'hamstrings', 'accesorio'),
      h(P.lat, 'shoulders', 'accesorio'), h(P.ant, 'abdominals', 'accesorio')] },
    fullB: { nombre: 'Cuerpo completo B', huecos: [
      h(P.bis, 'hamstrings', 'principal'), h(P.trV, 'lats', 'principal'),
      h(P.emV, 'shoulders', 'principal'), h(P.zan, 'quadriceps', 'accesorio'),
      h(P.cad, 'glutes', 'accesorio'), h(P.abd, 'abdominals', 'accesorio')] },
    fullC: { nombre: 'Cuerpo completo C', huecos: [
      h(P.zan, 'quadriceps', 'principal'), h(P.emH, 'chest', 'principal'),
      h(P.trV, 'lats', 'principal'), h(P.cad, 'glutes', 'accesorio'),
      h(P.cbi, 'biceps', 'accesorio'), h(P.etr, 'triceps', 'accesorio')] },

    superior: { nombre: 'Tren superior', huecos: [
      h(P.emH, 'chest', 'principal'), h(P.trH, 'middle back', 'principal'),
      h(P.emV, 'shoulders', 'principal'), h(P.trV, 'lats', 'accesorio'),
      h(P.lat, 'shoulders', 'accesorio'), h(P.cbi, 'biceps', 'accesorio'),
      h(P.etr, 'triceps', 'accesorio')] },
    inferior: { nombre: 'Tren inferior', huecos: [
      h(P.sen, 'quadriceps', 'principal'), h(P.bis, 'hamstrings', 'principal'),
      h(P.cad, 'glutes', 'principal'), h(P.zan, 'quadriceps', 'accesorio'),
      h(P.cuf, 'hamstrings', 'accesorio'), h(P.gem, 'calves', 'accesorio'),
      h(P.ant, 'abdominals', 'accesorio')] },
    superior2: { nombre: 'Tren superior (volumen)', huecos: [
      h(P.trV, 'lats', 'principal'), h(P.emH, 'chest', 'principal'),
      h(P.trH, 'middle back', 'accesorio'), h(P.apr, 'chest', 'accesorio'),
      h(P.lat, 'shoulders', 'accesorio'), h(P.etr, 'triceps', 'accesorio'),
      h(P.cbi, 'biceps', 'accesorio')] },
    inferior2: { nombre: 'Tren inferior (volumen)', huecos: [
      h(P.cad, 'glutes', 'principal'), h(P.zan, 'quadriceps', 'principal'),
      h(P.cuf, 'hamstrings', 'accesorio'), h(P.exc, 'quadriceps', 'accesorio'),
      h(P.gem, 'calves', 'accesorio'), h(P.abd, 'abdominals', 'accesorio')] },

    empuje: { nombre: 'Empuje', huecos: [
      h(P.emH, 'chest', 'principal'), h(P.emV, 'shoulders', 'principal'),
      h(P.apr, 'chest', 'accesorio'), h(P.lat, 'shoulders', 'accesorio'),
      h(P.etr, 'triceps', 'accesorio'), h(P.etr, 'triceps', 'accesorio')] },
    traccion: { nombre: 'Tracción', huecos: [
      h(P.trV, 'lats', 'principal'), h(P.trH, 'middle back', 'principal'),
      h(P.trH, 'lats', 'accesorio'), h(P.cbi, 'biceps', 'accesorio'),
      h(P.cbi, 'biceps', 'accesorio'), h(P.lum, 'lower back', 'accesorio')] },
    pierna: { nombre: 'Pierna', huecos: [
      h(P.sen, 'quadriceps', 'principal'), h(P.bis, 'hamstrings', 'principal'),
      h(P.cad, 'glutes', 'accesorio'), h(P.exc, 'quadriceps', 'accesorio'),
      h(P.cuf, 'hamstrings', 'accesorio'), h(P.gem, 'calves', 'accesorio')] }
  };

  /* Qué se hace cada día según cuántos días se entrene. Dos estímulos por
     semana en cada músculo es lo que más rinde, así que hasta cuatro días
     manda el cuerpo completo o el torso/pierna, no el músculo por día. */
  function repartoSemanal(dias, experiencia) {
    const novato = experiencia === 'beginner';
    if (dias <= 1) return ['fullA'];
    if (dias === 2) return ['fullA', 'fullB'];
    if (dias === 3) return novato ? ['fullA', 'fullB', 'fullC'] : ['empuje', 'traccion', 'pierna'];
    if (dias === 4) return ['superior', 'inferior', 'superior2', 'inferior2'];
    if (dias === 5) return ['empuje', 'traccion', 'pierna', 'superior2', 'inferior2'];
    return ['empuje', 'traccion', 'pierna', 'empuje', 'traccion', 'pierna'];
  }

  /* ---------- 6. Elegir el ejercicio de cada hueco ---------- */

  const NIVELES = { beginner: 1, intermediate: 2, expert: 3 };
  const FUERZA = ['strength', 'powerlifting', 'olympic weightlifting'];
  /* material que sujeta el cuerpo: lo que se ofrece cuando hay lesión */
  const APOYADO = ['machine', 'cable', 'exercise ball'];

  let indice = null;   // patrón -> ejercicios, construido una vez

  function porPatron(patron) {
    if (!indice) {
      indice = {};
      Data.all().forEach(function (ex) {
        const p = Alt.patron(ex);
        if (!p) return;
        (indice[p] = indice[p] || []).push(ex);
      });
    }
    return indice[patron] || [];
  }

  function permitido(ex, hueco, r, gear, maxNivel) {
    if (!ex.images || ex.images.length < 2) return false;
    if (!Data.gearAllows(gear, ex.equipment)) return false;
    if ((NIVELES[ex.level] || 2) > maxNivel) return false;
    if (ex.category === 'stretching') return false;

    const p = Alt.patron(ex);
    if (p && r.fuera[p]) return false;
    if (p && r.equipoFuera[p] && r.equipoFuera[p].indexOf(ex.equipment) !== -1) return false;
    if (p && r.conApoyo[p] && APOYADO.indexOf(ex.equipment) === -1 &&
        ex.equipment !== 'body only') return false;
    return true;
  }

  /* Preferencia curada: la lista del planificador está en orden de calidad para
     cada músculo, y ese orden vale más que cualquier heurística. Sin esto,
     "elevación frontal" empata con "elevación lateral" y gana la que salga antes
     en el catálogo. */
  function bonusCurado(ex, musculo) {
    const lista = Planner.PICKS[musculo] || [];
    const i = lista.indexOf(ex.id);
    if (i === -1) return Planner.RECOMENDADOS.has(ex.id) ? 6 : 0;
    return 26 - Math.min(i, 8) * 2;
  }

  function puntuar(ex, hueco, usados) {
    let s = 0;
    const p = Alt.patron(ex);
    if (p === hueco.patron) s += 60;
    if ((ex.primaryMuscles || []).indexOf(hueco.musculo) !== -1) s += 30;
    if (hueco.rol === 'principal') {
      s += ex.mechanic === 'compound' ? 25 : -10;
      s += (ex.equipment === 'barbell' || ex.equipment === 'dumbbell') ? 8 : 0;
    } else {
      s += ex.mechanic === 'isolation' ? 6 : 0;
    }
    if (FUERZA.indexOf(ex.category) !== -1) s += 8;
    s += bonusCurado(ex, hueco.musculo);
    if (usados[ex.id]) s -= 70;                 // ya sale esta semana
    return s;
  }

  function elegir(hueco, ctx) {
    const candidatos = porPatron(hueco.patron)
      .concat(Data.search({ muscle: hueco.musculo, gear: ctx.gear }))
      .filter(function (ex, i, arr) { return arr.indexOf(ex) === i; })
      .filter(function (ex) { return permitido(ex, hueco, ctx.r, ctx.gear, ctx.maxNivel); });

    if (!candidatos.length) return null;
    candidatos.sort(function (a, b) {
      return puntuar(b, hueco, ctx.usados) - puntuar(a, hueco, ctx.usados);
    });
    return candidatos[0];
  }

  /* ---------- 7. El programa ---------- */

  /* Cuántos huecos caben en el tiempo disponible */
  function cabenEn(minutos, obj, calentamiento) {
    const util = Math.max(15, minutos - calentamiento) * 60;
    const coste = obj.principal.series * (obj.principal.rest + 45);
    return Math.max(3, Math.min(8, Math.round(util / coste)));
  }

  /* opts: {dias:[nombres], minutos, gear, objetivo, foco} — lo demás sale del perfil */
  function crear(opts) {
    opts = opts || {};
    const p = Perfil.datos();
    const dias = (opts.dias && opts.dias.length ? opts.dias : ['Lun', 'Mié', 'Vie']).slice();
    const minutos = opts.minutos || 60;
    const gear = Data.GEAR[opts.gear] ? opts.gear : (Store.settings().gear || 'gym');
    const experiencia = p.experiencia || 'intermediate';

    const clave = opts.objetivo || (OBJETIVOS[p.objetivo] ? p.objetivo : 'mantener');
    const obj = OBJETIVOS[clave] || OBJETIVOS.mantener;

    const edad = porEdad(p.edad);
    const sexo = porSexo(p.sexo);
    const claves = lesionesDe(p.lesiones);
    const r = restricciones(claves);

    const maxNivel = (NIVELES[experiencia] || 2) + (experiencia === 'beginner' ? 1 : 0);
    if (!edad.impacto) r.fuera['salto'] = true;

    /* volumen semanal por músculo, ajustado a la persona */
    const objetivoSeries = Math.max(VOLUMEN_MIN, Math.min(VOLUMEN_MAX, Math.round(
      (VOLUMEN_BASE[experiencia] || 15) * obj.volumen * edad.factor)));

    const plantillas = repartoSemanal(dias.length, experiencia);
    const porSesion = cabenEn(minutos, obj, edad.calentamiento);
    const foco = opts.foco || 'equilibrado';

    const usados = {};
    const ctx = { gear: gear, r: r, maxNivel: maxNivel, usados: usados };
    const volumen = {};
    const sinCubrir = [];

    const sesiones = dias.map(function (dia, i) {
      const plantilla = DIAS[plantillas[i % plantillas.length]];
      let huecos = plantilla.huecos.slice();

      /* el énfasis elegido añade un hueco extra de esa zona */
      if (foco !== 'equilibrado') huecos = aplicarFoco(huecos, foco);

      /* Cuando no cabe todo, se quedan los principales y los accesorios de los
         músculos que menos trabajo llevan en la semana. Recortar siempre por el
         final dejaría los brazos sin nada, que es el fallo clásico. */
      const principales = huecos.filter(function (x) { return x.rol === 'principal'; });
      let accesorios = huecos.filter(function (x) { return x.rol === 'accesorio'; });
      const sitio = Math.max(principales.length, porSesion) - principales.length;
      if (accesorios.length > sitio) {
        accesorios = accesorios
          .map(function (x, n) { return { x: x, n: n, v: volumen[x.musculo] || 0 }; })
          .sort(function (a, b) { return a.v - b.v || a.n - b.n; })
          .slice(0, Math.max(0, sitio))
          .sort(function (a, b) { return a.n - b.n; })
          .map(function (o) { return o.x; });
      }
      huecos = principales.concat(accesorios);

      const ejercicios = [];
      huecos.forEach(function (hueco) {
        const ex = elegir(hueco, ctx);
        if (!ex) { sinCubrir.push(hueco.patron); return; }
        usados[ex.id] = true;

        const cfg = obj[hueco.rol];
        const estatico = ex.force === 'static';
        const reps = estatico ? 40 : cfg.reps + (hueco.rol === 'accesorio' ? sexo.repsExtra : 0);
        const rest = Math.round(cfg.rest * (hueco.rol === 'accesorio' ? sexo.descanso : 1) / 5) * 5;

        sumarVolumen(volumen, ex, hueco.musculo, cfg.series);
        ejercicios.push({
          exId: ex.id, patron: hueco.patron, musculo: hueco.musculo, rol: hueco.rol,
          sets: cfg.series, reps: reps, weight: 0, rest: rest,
          note: notaDeEjercicio(hueco, ex, edad, r, estatico)
        });
      });

      return {
        dia: dia,
        nombre: UI.diaLargo(dia) + ' · ' + plantilla.nombre,
        plantilla: plantilla.nombre,
        ejercicios: ejercicios,
        minutos: duracion(ejercicios, edad.calentamiento)
      };
    });

    /* medias series por el trabajo indirecto: se redondea para enseñarlo */
    Object.keys(volumen).forEach(function (m) {
      volumen[m] = Math.round(volumen[m] * 2) / 2;
    });

    /* Qué músculos se quedan cortos con el tiempo que hay. Solo se miran los
       que el plan entrena a propósito: avisar de que los antebrazos llevan dos
       series es ruido, no información. */
    const buscados = {};
    sesiones.forEach(function (s) {
      s.ejercicios.forEach(function (e) { buscados[e.musculo] = true; });
    });
    const cortos = Object.keys(buscados).filter(function (m) {
      return (volumen[m] || 0) < VOLUMEN_MIN;
    }).map(function (m) { return I18N.muscle(m); });

    const real = volumenReal(4);

    return {
      objetivo: clave, objetivoLabel: obj.label, obj: obj,
      cortos: cortos,
      dias: dias, gear: gear, minutos: minutos, foco: foco,
      experiencia: experiencia,
      rpe: Math.min(obj.rpe, edad.rpe),
      calentamiento: edad.calentamiento,
      sesiones: sesiones,
      volumen: volumen,
      objetivoSeries: objetivoSeries,
      lesiones: claves.map(function (k) { return LESIONES[k].label; }),
      real: real,
      razones: razones(p, obj, edad, sexo, experiencia, objetivoSeries, dias.length,
        plantillas, cortos, minutos, volumen, real),
      avisos: r.notas.concat(edad.notas, r.sinMaximos ? [] : []),
      progresion: progresion(obj, r.sinMaximos),
      cardio: obj.cardio ? cardioTexto(p) : null,
      sinCubrir: sinCubrir
    };
  }

  /* Volumen efectivo: el músculo que trabaja de verdad suma la serie entera y
     el que ayuda suma media. Contar solo el objetivo del hueco deja el tríceps
     a cero aunque se hayan hecho doce series de press. */
  function sumarVolumen(volumen, ex, musculo, series) {
    const directos = (ex.primaryMuscles || []).length ? ex.primaryMuscles : [musculo];
    directos.forEach(function (m) { volumen[m] = (volumen[m] || 0) + series; });
    (ex.secondaryMuscles || []).forEach(function (m) {
      volumen[m] = (volumen[m] || 0) + series / 2;
    });
  }

  /* Un hueco extra de la zona que se quiera priorizar */
  function aplicarFoco(huecos, foco) {
    const extra = {
      gluteo: h(P.cad, 'glutes', 'accesorio'),
      pierna: h(P.exc, 'quadriceps', 'accesorio'),
      pecho: h(P.apr, 'chest', 'accesorio'),
      espalda: h(P.trH, 'lats', 'accesorio'),
      brazo: h(P.cbi, 'biceps', 'accesorio'),
      hombro: h(P.lat, 'shoulders', 'accesorio'),
      core: h(P.ant, 'abdominals', 'accesorio')
    }[foco];
    if (!extra) return huecos;

    /* solo si el día ya toca esa zona: nada de meter glúteo en día de pecho */
    const zona = I18N.GROUPS.find(function (gr) { return gr.muscles.indexOf(extra.musculo) !== -1; });
    const encaja = huecos.some(function (x) {
      return zona && zona.muscles.indexOf(x.musculo) !== -1;
    });
    if (!encaja) return huecos;

    const salida = huecos.slice();
    const idx = salida.map(function (x) { return x.rol; }).lastIndexOf('accesorio');
    salida.splice(idx === -1 ? salida.length : idx + 1, 0, extra);
    return salida;
  }

  function notaDeEjercicio(hueco, ex, edad, r, estatico) {
    if (estatico) return 'Aguanta la posición: las repeticiones son segundos.';
    if (hueco.rol === 'principal') {
      return 'Es el ejercicio fuerte del día: haz dos series de aproximación con ' +
        'poco peso antes de la primera seria.';
    }
    if (r.conApoyo[hueco.patron]) return 'Recorrido cómodo, sin bajar a donde molesta.';
    return '';
  }

  function duracion(ejercicios, calentamiento) {
    const seg = ejercicios.reduce(function (t, e) {
      return t + e.sets * ((e.rest || 60) + 45);
    }, 0);
    return Math.round(seg / 60) + calentamiento;
  }

  /* ---------- 8. Por qué este plan y no otro ---------- */
  /* Lo que de verdad ha entrenado, no lo que el plan propone: series por
     músculo y semana en las últimas cuatro. Sin esto el análisis habla de un
     perfil y no de él, que es justo lo que se le nota. */
  function volumenReal(semanas) {
    if (!g.Store || !Store.sessions) return null;
    const desde = Date.now() - (semanas || 4) * 7 * 86400000;
    const hechas = Store.sessions().filter(function (x) { return (x.end || x.start) >= desde; });
    if (!hechas.length) return null;

    const cuenta = {};
    hechas.forEach(function (ses) {
      (ses.entries || []).forEach(function (e) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        const n = (e.sets || []).filter(function (x) { return x.done; }).length;
        if (!n) return;
        (ex.primaryMuscles || []).forEach(function (m) {
          cuenta[m] = (cuenta[m] || 0) + n;
        });
        (ex.secondaryMuscles || []).forEach(function (m) {
          cuenta[m] = (cuenta[m] || 0) + n / 2;
        });
      });
    });

    const salida = {};
    Object.keys(cuenta).forEach(function (m) {
      salida[m] = Math.round(cuenta[m] / (semanas || 4) * 10) / 10;
    });
    return { porMusculo: salida, sesiones: hechas.length, semanas: semanas || 4 };
  }

  /* Lo que se ha quedado atrás de verdad: músculos que el plan pide y él apenas
     ha tocado. Se dice con su número, que es lo que convence. */
  function olvidados(volumenPlan, real) {
    if (!real) return [];
    return Object.keys(volumenPlan).filter(function (m) {
      return volumenPlan[m] >= 8 && (real.porMusculo[m] || 0) < volumenPlan[m] / 2;
    }).sort(function (a, b) {
      return (real.porMusculo[a] || 0) - (real.porMusculo[b] || 0);
    });
  }

  function razones(p, obj, edad, sexo, experiencia, series, ndias, plantillas, cortos, minutos, volumenPlan, real) {
    const out = [];
    const nivel = { beginner: 'principiante', intermediate: 'intermedio', expert: 'avanzado' };

    out.push('Objetivo ' + obj.label.toLowerCase() + ': ' + obj.resumen);

    out.push('Nivel ' + (nivel[experiencia] || 'intermedio') + ': el plan apunta a unas ' +
      series + ' series semanales por músculo, que es donde está el mejor equilibrio ' +
      'entre estímulo y recuperación.');

    const unicas = plantillas.filter(function (x, i, a) { return a.indexOf(x) === i; }).length;
    out.push(ndias + (ndias === 1 ? ' día' : ' días') + ' a la semana con ' + unicas +
      ' sesiones distintas: así cada músculo recibe dos estímulos por semana, que rinde ' +
      'más que machacarlo una vez.');

    if (p.edad) {
      out.push(p.edad + ' años: ' + (edad.factor < 1
        ? 'se recorta el volumen un ' + Math.round((1 - edad.factor) * 100) +
          '% y se para en RPE ' + edad.rpe + ', dejando repeticiones en recámara.'
        : 'volumen completo, sin recortes por edad.'));
    }

    if (sexo.notas.length) out.push(sexo.notas[0]);

    if (p.peso && p.altura && obj.label.indexOf('grasa') !== -1) {
      const m = Perfil.macros();
      if (m) {
        out.push('Con tu perfil salen ' + m.kcal + ' kcal y ' + m.prot + ' g de proteína ' +
          'al día: sin ese déficit y esa proteína, el gimnasio solo no baja la grasa.');
      }
    }
    if (p.peso && obj.label.indexOf('Ganar') === 0) {
      const m = Perfil.macros();
      if (m) {
        out.push('Para ganar músculo hacen falta ' + m.kcal + ' kcal y ' + m.prot +
          ' g de proteína al día: el estímulo lo pone el plan, el material lo pone la comida.');
      }
    }
    if (p.sueño && p.sueño < 7) {
      out.push('Duermes ' + p.sueño + ' h: por debajo de 7 la recuperación se resiente y ' +
        'el plan rinde menos de lo que puede. Es la palanca más barata que tienes.');
    }

    /* Lo que sale de sus propios entrenamientos. Sin esto el análisis describe
       un perfil —hombre, 28, intermedio— y no a alguien concreto, que es lo que
       hace que suene a plantilla por mucho que los números salgan de sus datos. */
    if (real) {
      const porSemana = Math.round(real.sesiones / real.semanas * 10) / 10;
      if (porSemana + 0.6 < ndias) {
        out.push('En el último mes has entrenado ' + String(porSemana).replace('.', ',') +
          ' días por semana y este plan pide ' + ndias + '. O bajas los días y los ' +
          'cumples, o el plan se queda en papel: vale más un plan de tres días hecho ' +
          'que uno de cinco a medias.');
      }

      const flojos = olvidados(volumenPlan || {}, real);
      if (flojos.length) {
        out.push('Lo que vienes dejando de lado: ' + flojos.slice(0, 3).map(function (m) {
          const n = real.porMusculo[m] || 0;
          return I18N.muscle(m).toLowerCase() + ' (' + String(n).replace('.', ',') +
            (n === 1 ? ' serie' : ' series') + ' por semana, el plan te pide ' +
            String(volumenPlan[m]).replace('.', ',') + ')';
        }).join('; ') + '. Ahí es donde este plan te va a cambiar algo.');
      }
    } else {
      out.push('Todavía no tienes entrenamientos guardados, así que el plan sale solo de ' +
        'tu perfil. En cuanto entrenes unas semanas, este análisis mira lo que de verdad ' +
        'haces y deja de hablar en general.');
    }

    /* La aritmética del tiempo: en una hora no caben veinte series por músculo,
       y es mejor decirlo que repartir migajas y llamarlo programa. */
    if (cortos && cortos.length) {
      out.push('Con ' + ndias + ' días de ' + minutos + ' min no da tiempo a todo: ' +
        cortos.slice(0, 4).join(', ').toLowerCase() +
        (cortos.length > 4 ? ' y alguno más' : '') + ' se quedan por debajo de 8 series ' +
        'semanales. Si te importan, añade 15 min a la sesión, otro día, o priorízalos ' +
        'con el selector de zona.');
    }
    return out;
  }

  /* ---------- 9. Progresión: sin esto no hay resultados ---------- */
  function progresion(obj, prudente) {
    const tope = prudente ? 'nunca al fallo' : 'dejando 1 o 2 repeticiones en recámara';
    return [
      { semana: 'Semana 1', texto: 'Coge las cargas con las que completas todas las series ' +
        'con la técnica limpia, ' + tope + '. Apunta el peso de cada ejercicio.' },
      { semana: 'Semana 2', texto: 'Mismo peso, una repetición más por serie. Si todas las ' +
        'series llegan arriba del rango, sube peso en la siguiente.' },
      { semana: 'Semana 3', texto: 'Sube entre un 2 y un 5% en los básicos, o añade una serie ' +
        'al ejercicio que mejor notes. Es la semana más dura del bloque.' },
      { semana: 'Semana 4', texto: 'Descarga: mismos ejercicios con la mitad de series y un ' +
        '10% menos de peso. No es perder tiempo, es cuando el cuerpo consolida lo ganado.' },
      { semana: 'Semana 5', texto: 'Vuelta a empezar con los pesos de la semana 3. Si ya no ' +
        'suben, cambia los accesorios y repite el bloque.' }
    ];
  }

  function cardioTexto(p) {
    const pasos = p.actividad === 'sedentario' ? '8.000' : '10.000';
    return 'Además del gimnasio: ' + pasos + ' pasos al día y dos sesiones de 25 a 35 min ' +
      'de cardio suave (el que te deje hablar) en los días que no entrenes. El cardio duro ' +
      'y el gimnasio el mismo día se pisan.';
  }

  /* ---------- 10. Pasar el programa a rutinas de la app ---------- */
  /* etiqueta: cómo quiere el usuario que se llamen. Vacío = el nombre del día. */
  function aRutinas(prog, etiqueta) {
    etiqueta = String(etiqueta || '').trim();
    return prog.sesiones.map(function (s) {
      return {
        id: null,
        name: etiqueta ? UI.diaLargo(s.dia) + ' · ' + etiqueta : s.nombre,
        note: prog.objetivoLabel + ' · ' + prog.minutos + ' min · RPE ' + prog.rpe +
          ' · calienta ' + prog.calentamiento + ' min antes.',
        days: [s.dia],
        exercises: s.ejercicios.map(function (e) {
          return { exId: e.exId, sets: e.sets, reps: e.reps, weight: 0, rest: e.rest, note: e.note };
        })
      };
    });
  }

  g.Programa = {
    volumenReal: volumenReal, olvidados: olvidados,
    crear: crear, aRutinas: aRutinas, lesionesDe: lesionesDe,
    OBJETIVOS: OBJETIVOS, LESIONES: LESIONES
  };
})(window);
