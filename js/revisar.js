/* revisar.js — encontrar los fallos de un plan sin preguntarle a nadie.

   Hasta ahora la auditoría consistía en darle el plan entero a la IA y pedirle
   «dime tres cosas que fallan». Encontrar tres fallos en una lista de treinta
   ejercicios es una búsqueda con docenas de respuestas defendibles, así que
   cuatro consultas idénticas devolvían doce puntos distintos y ninguno repetido
   —y de propina, cosas que no eran verdad: proponer añadir un ejercicio que ya
   estaba en el plan, o cambiar una extensión de cuádriceps por un curl de
   muñeca—. Bajar la temperatura estabilizó la redacción, no el criterio: lo que
   variaba era CUÁL de los treinta defectos posibles le tocaba mirar.

   Aquí los fallos se calculan. Son comprobaciones aritméticas sobre el plan:
   cuántas series directas lleva cada músculo, qué patrones faltan, qué se
   repite, qué va delante de qué. Mismo plan, mismos fallos, siempre. La IA
   sigue haciendo falta —redactar la consecuencia y elegir el recambio son
   trabajo suyo—, pero ya no decide QUÉ está mal, solo lo explica.

   La nota sale de la suma de gravedades, no del criterio de nadie. */
(function (g) {
  'use strict';

  /* Franjas de series DIRECTAS por músculo y semana para hipertrofia. Directas
     quiere decir de ejercicios que tienen ese músculo como objetivo: lo que
     cae de rebote por salir de secundario no se cuenta aquí, que es justo el
     error que hacía que el hombro pareciera siempre desbordado. */
  const MINIMO = 8;
  const MAXIMO = 22;

  /* Los músculos que se juzgan. De los antebrazos o el cuello no se opina:
     casi ningún plan los entrena a propósito y sacarlos como defecto es ruido. */
  const GRANDES = ['chest', 'lats', 'middle back', 'shoulders', 'quadriceps',
    'hamstrings', 'glutes', 'biceps', 'triceps'];

  /* Los seis movimientos que un plan de cuerpo entero debería tocar. Si falta
     uno, falta de verdad: no es cuestión de gustos. */
  const BASICOS = {
    'empuje horizontal': 'empujar por delante (press de banca y parecidos)',
    'empuje vertical': 'empujar por encima de la cabeza',
    'traccion horizontal': 'remar',
    'traccion vertical': 'dominadas o jalones',
    'sentadilla': 'flexión de rodilla con carga',
    'bisagra de cadera': 'bisagra de cadera (peso muerto y variantes)'
  };

  /* Los que cargan la columna de pie. Dos de estos el mismo día dejan la
     espalda baja frita para el segundo, que se hace peor y con más riesgo. */
  const AXIALES = ['sentadilla', 'bisagra de cadera'];

  function ejerciciosDe(ses) { return ses.ejercicios || ses.exercises || []; }

  /* ---------- las cuentas ---------- */

  function seriesDirectas(sesiones) {
    const d = {};
    sesiones.forEach(function (s) {
      ejerciciosDe(s).forEach(function (e) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        (ex.primaryMuscles || []).forEach(function (m) {
          d[m] = (d[m] || 0) + (e.sets || 0);
        });
      });
    });
    return d;
  }

  function patronesDe(sesiones) {
    const p = {};
    sesiones.forEach(function (s) {
      ejerciciosDe(s).forEach(function (e) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        const pt = Alt.patron(ex);
        if (pt) p[pt] = (p[pt] || 0) + 1;
      });
    });
    return p;
  }

  function nombre(e) {
    const ex = Data.get(e.exId);
    return ex ? ex.nameEs : e.exId;
  }

  function tituloSesion(s, i) {
    return s.nombre || s.name || ('sesión ' + (i + 1));
  }

  /* ---------- las reglas ----------
     Cada una devuelve cero o más hallazgos. Un hallazgo lleva su gravedad (1
     menor, 2 claro, 3 grave), lo que se ha medido, y si admite arreglo
     automático, qué habría que hacer. */

  /* Que cinco músculos se queden cortos no son cinco fallos: es uno —el plan
     lleva poco volumen— contado cinco veces. Sacándolos por separado, cada uno
     restaba nota por su cuenta y cualquier plan con las sesiones algo justas
     acababa en un 1, que no distingue entre flojo y peligroso. Van juntos, y la
     gravedad la pone cuántos son y cuánto les falta. */
  function reglaVolumen(sesiones, directas, hallazgos) {
    const cortos = [];
    const pasados = [];

    /* Solo se juzga lo que el plan entrena a propósito: decir que faltan series
       de glúteo en un torso-pierna que no lo toca no ayuda a nadie. */
    GRANDES.forEach(function (m) {
      const n = directas[m] || 0;
      if (!n) return;
      if (n < MINIMO) cortos.push({ m: m, n: n });
      else if (n > MAXIMO) pasados.push({ m: m, n: n });
    });

    const lista = function (xs) {
      return xs.map(function (x) { return I18N.muscle(x.m).toLowerCase() + ' ' + x.n; }).join(', ');
    };

    if (cortos.length) {
      /* Muy por debajo del mínimo es otra cosa que rozarlo por una serie */
      const hondo = cortos.filter(function (x) { return x.n < MINIMO * 0.7; }).length;
      hallazgos.push({
        id: 'poco', gravedad: (cortos.length >= 3 || hondo >= 2) ? 2 : 1,
        peso: Math.min(2.5, 0.5 + cortos.length * 0.25 + hondo * 0.15),
        titulo: cortos.length === 1
          ? I18N.muscle(cortos[0].m) + ' se queda corto'
          : cortos.length + ' músculos por debajo del mínimo',
        dato: 'series directas a la semana: ' + lista(cortos) + '; por debajo de ' +
          MINIMO + ' cuesta que crezcan',
        arreglo: { tipo: 'anadir', musculos: cortos.map(function (x) { return x.m; }) }
      });
    }

    if (pasados.length) {
      hallazgos.push({
        id: 'mucho', gravedad: pasados.length >= 3 ? 2 : 1,
        peso: Math.min(2.5, 0.5 + pasados.length * 0.35),
        titulo: pasados.length === 1
          ? 'Demasiado ' + I18N.muscle(pasados[0].m).toLowerCase()
          : pasados.length + ' músculos pasados de volumen',
        dato: 'series directas a la semana: ' + lista(pasados) + '; por encima de ' +
          MAXIMO + ' se acumula fatiga sin más músculo',
        arreglo: { tipo: 'quitar', musculos: pasados.map(function (x) { return x.m; }) }
      });
    }
  }

  function reglaPatrones(sesiones, patrones, hallazgos) {
    Object.keys(BASICOS).forEach(function (p) {
      if (patrones[p]) return;
      hallazgos.push({
        id: 'falta:' + p, gravedad: 2,
        titulo: 'No hay nada de ' + p,
        dato: 'en toda la semana no aparece ningún ejercicio de ' + BASICOS[p],
        arreglo: { tipo: 'anadir', patron: p }
      });
    });
  }

  function reglaRepetidos(sesiones, hallazgos) {
    sesiones.forEach(function (s, i) {
      const vistos = {};
      ejerciciosDe(s).forEach(function (e) {
        if (vistos[e.exId]) {
          hallazgos.push({
            id: 'repe:' + i + ':' + e.exId, gravedad: 3,
            titulo: nombre(e) + ', dos veces el mismo día',
            dato: 'sale repetido en ' + tituloSesion(s, i),
            arreglo: { tipo: 'quitar', exId: e.exId, dia: i }
          });
        }
        vistos[e.exId] = true;
      });
    });
  }

  function reglaAxiales(sesiones, hallazgos) {
    sesiones.forEach(function (s, i) {
      const pesados = ejerciciosDe(s).filter(function (e) {
        const ex = Data.get(e.exId);
        return ex && ex.mechanic === 'compound' &&
          AXIALES.indexOf(Alt.patron(ex)) !== -1 &&
          (ex.equipment === 'barbell' || ex.equipment === 'dumbbell');
      });
      if (pesados.length >= 2) {
        hallazgos.push({
          id: 'axial:' + i, gravedad: 3,
          titulo: 'Dos básicos pesados el mismo día',
          dato: pesados.map(nombre).join(' y ') + ' caen juntos en ' +
            tituloSesion(s, i) + ', y el segundo se hace con la espalda baja ya cargada',
          arreglo: { tipo: 'mover', exId: pesados[1].exId, dia: i }
        });
      }
    });
  }

  const GRANDES_PATRONES = AXIALES.concat(
    ['empuje horizontal', 'empuje vertical', 'traccion vertical']);

  function esPesado(e) {
    const ex = Data.get(e.exId);
    return !!(ex && ex.mechanic === 'compound' &&
      GRANDES_PATRONES.indexOf(Alt.patron(ex)) !== -1);
  }

  /* Un hallazgo por sesión, no uno por ejercicio mal puesto. Sacándolos sueltos,
     cada arreglo se calculaba sobre la lista original y al aplicar el primero
     los demás apuntaban a un sitio que ya no existía: dos básicos pidiendo «al
     primer puesto» acababan en el orden contrario al bueno. */
  function reglaOrden(sesiones, hallazgos) {
    sesiones.forEach(function (s, i) {
      const lista = ejerciciosDe(s);
      let vistoAislado = -1;
      const tarde = [];
      lista.forEach(function (e, k) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        if (ex.mechanic === 'isolation' && vistoAislado === -1) vistoAislado = k;
        if (esPesado(e) && vistoAislado !== -1) {
          tarde.push({ e: e, k: k, tras: lista[vistoAislado] });
        }
      });
      if (!tarde.length) return;

      hallazgos.push({
        id: 'orden:' + i, gravedad: 2,
        titulo: tarde.length === 1
          ? nombre(tarde[0].e) + ' va demasiado tarde'
          : tarde.length + ' básicos van demasiado tarde',
        dato: 'en ' + tituloSesion(s, i) + ', ' + tarde.map(function (t) {
          return nombre(t.e) + ' es el ' + (t.k + 1) + '.º, detrás de ' + nombre(t.tras);
        }).join('; ') + ': llegas cansado a lo que más peso mueve',
        arreglo: { tipo: 'orden', dia: i }
      });
    });
  }

  /* En cuántos días distintos aparece cada músculo. Dos planes pueden llevar las
     mismas series semanales y no valer lo mismo: doce series de pecho en un
     solo día rinden menos que seis y seis en dos días, porque el estímulo de una
     sesión dura unas 48 horas y el resto de la semana no pasa nada. Sin esta
     regla, un plan con todo apelotonado en un día sacaba la misma nota que uno
     bien repartido y no había forma de saber a cuál hacer caso. */
  function frecuenciaDe(sesiones) {
    const f = {};
    sesiones.forEach(function (s) {
      const vistos = {};
      ejerciciosDe(s).forEach(function (e) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        (ex.primaryMuscles || []).forEach(function (m) {
          if (vistos[m]) return;
          vistos[m] = true;
          f[m] = (f[m] || 0) + 1;
        });
      });
    });
    return f;
  }

  function reglaFrecuencia(sesiones, directas, frecuencia, hallazgos) {
    if (sesiones.length < 3) return;
    const solos = GRANDES.filter(function (m) {
      return (directas[m] || 0) >= MINIMO && (frecuencia[m] || 0) === 1;
    });
    if (!solos.length) return;
    hallazgos.push({
      id: 'frec', gravedad: solos.length >= 3 ? 2 : 1,
      peso: Math.min(2, 0.5 + solos.length * 0.4),
      titulo: solos.length === 1
        ? I18N.muscle(solos[0]) + ', un solo día a la semana'
        : solos.length + ' músculos entrenados un solo día',
      dato: solos.map(function (m) {
        return I18N.muscle(m).toLowerCase() + ' ' + (directas[m] || 0) + ' series en 1 día';
      }).join(', ') + '; repartidas en dos días rinden más, porque el estímulo de ' +
        'una sesión dura unas 48 horas',
      arreglo: { tipo: 'repartir', musculos: solos }
    });
  }

  /* Sesiones de cuatro ejercicios junto a sesiones de ocho: el día corto se
     queda sin estímulo suficiente y el largo se hace eterno y se abandona. */
  function reglaEquilibrio(sesiones, hallazgos) {
    if (sesiones.length < 3) return;
    const tam = sesiones.map(function (s) { return ejerciciosDe(s).length; });
    const max = Math.max.apply(null, tam);
    const min = Math.min.apply(null, tam);
    if (max - min < 3) return;
    const iMax = tam.indexOf(max), iMin = tam.indexOf(min);
    hallazgos.push({
      id: 'equilibrio', gravedad: 1,
      peso: Math.min(1.5, 0.4 + (max - min) * 0.25),
      titulo: 'Los días están muy desiguales',
      dato: tituloSesion(sesiones[iMin], iMin) + ' lleva ' + min + ' ejercicios y ' +
        tituloSesion(sesiones[iMax], iMax) + ' lleva ' + max + ': el corto se queda ' +
        'flojo y el largo se hace eterno',
      arreglo: { tipo: 'equilibrar', de: iMax, a: iMin }
    });
  }

  function reglaDescansos(sesiones, hallazgos) {
    const cortos = [];
    sesiones.forEach(function (s, i) {
      ejerciciosDe(s).forEach(function (e) {
        const ex = Data.get(e.exId);
        if (!ex || ex.mechanic !== 'compound') return;
        if (AXIALES.indexOf(Alt.patron(ex)) === -1) return;
        if ((e.rest || 0) >= 120) return;
        cortos.push({ e: e, dia: i });
      });
    });
    if (!cortos.length) return;
    hallazgos.push({
      id: 'rest', gravedad: 1,
      peso: Math.min(1.2, 0.4 + (cortos.length - 1) * 0.2),
      titulo: cortos.length === 1
        ? 'Poco descanso en ' + nombre(cortos[0].e)
        : 'Poco descanso en ' + cortos.length + ' básicos',
      dato: cortos.map(function (x) {
        return nombre(x.e) + ' ' + (x.e.rest || 0) + 's';
      }).join(', ') + '; con menos de 120 en un básico pesado la serie siguiente ' +
        'sale corta de fuerza',
      arreglo: { tipo: 'descanso', donde: cortos.map(function (x) {
        return { exId: x.e.exId, dia: x.dia }; }), valor: 150 }
    });
  }

  function reglaSitio(sesiones, gear, hallazgos) {
    if (!gear || !Data.GEAR[gear] || gear === 'todo') return;
    sesiones.forEach(function (s, i) {
      ejerciciosDe(s).forEach(function (e) {
        const ex = Data.get(e.exId);
        if (!ex || Data.permiteNombre(gear, ex.nameEs)) return;
        hallazgos.push({
          id: 'sitio:' + i + ':' + e.exId, gravedad: 3,
          titulo: nombre(e) + ' no lo puedes hacer',
          dato: 'entrenas ' + Data.gearFrase(gear) + ' y ese ejercicio necesita material ' +
            'que no tienes',
          arreglo: { tipo: 'cambiar', exId: e.exId, dia: i }
        });
      });
    });
  }

  function reglaLesiones(sesiones, prog, hallazgos) {
    const claves = Programa.lesionesDe((Perfil.datos() || {}).lesiones);
    if (!claves || !claves.length) return;
    sesiones.forEach(function (s, i) {
      ejerciciosDe(s).forEach(function (e) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        const pt = Alt.patron(ex);
        const mala = claves.some(function (k) {
          const L = Programa.LESIONES[k];
          if (!L) return false;
          if ((L.patronesFuera || []).indexOf(pt) !== -1) return true;
          const eq = (L.equipoFuera || {})[pt];
          return !!(eq && eq.indexOf(ex.equipment) !== -1);
        });
        if (!mala) return;
        hallazgos.push({
          id: 'lesion:' + i + ':' + e.exId, gravedad: 3,
          titulo: nombre(e) + ' choca con tus limitaciones',
          dato: 'está desaconsejado con lo que has apuntado en tu perfil',
          arreglo: { tipo: 'cambiar', exId: e.exId, dia: i }
        });
      });
    });
  }

  /* ---------- la nota ----------
     Sale de los fallos y de su gravedad, con una fórmula que se puede
     comprobar a mano. Un plan sin fallos es un 10 y de ahí se baja. */
  /* El peso lo pone cada regla cuando el fallo admite grados —no es lo mismo un
     músculo corto que siete—; si no, manda la gravedad. Se trunca en vez de
     redondear: con redondeo, un plan con un fallo de verdad salía con un 10
     limpio, y un 10 tiene que querer decir que no tocarías nada. */
  function pesoDe(h) {
    if (typeof h.peso === 'number') return h.peso;
    return h.gravedad === 3 ? 2 : h.gravedad === 2 ? 1.2 : 0.6;
  }

  function calcularNota(hallazgos) {
    const castigo = hallazgos.reduce(function (n, h) { return n + pesoDe(h); }, 0);
    return Math.max(1, Math.min(10, Math.floor(10 - castigo)));
  }

  /* ---------- la revisión entera ---------- */
  /* Una rutina suelta no es una semana: no se le puede reprochar que le falte
     el empuje vertical ni que el pecho no llegue a ocho series, porque eso se
     cuenta sobre los cinco días. Las reglas de reparto semanal se saltan y
     quedan las que sí valen para una sesión: lo repetido, el orden, los dos
     básicos juntos, los descansos, el material y las limitaciones. */
  function revisar(prog, opciones) {
    opciones = opciones || {};
    const sesiones = prog.sesiones || [];
    const directas = seriesDirectas(sesiones);
    const patrones = patronesDe(sesiones);
    const frecuencia = frecuenciaDe(sesiones);
    const hallazgos = [];

    reglaRepetidos(sesiones, hallazgos);
    reglaSitio(sesiones, prog.gear, hallazgos);
    reglaLesiones(sesiones, prog, hallazgos);
    reglaAxiales(sesiones, hallazgos);
    if (!opciones.sesionSuelta) {
      reglaPatrones(sesiones, patrones, hallazgos);
      reglaVolumen(sesiones, directas, hallazgos);
      reglaFrecuencia(sesiones, directas, frecuencia, hallazgos);
      reglaEquilibrio(sesiones, hallazgos);
    }
    reglaOrden(sesiones, hallazgos);
    reglaDescansos(sesiones, hallazgos);

    /* Lo grave primero; a igualdad, el orden en que se han comprobado, que es
       estable. Sin esto dos ejecuciones podían enseñar los mismos fallos en
       distinto orden y volvía a parecer que cambiaba de opinión. */
    hallazgos.sort(function (a, b) { return b.gravedad - a.gravedad; });

    return {
      nota: calcularNota(hallazgos),
      hallazgos: hallazgos,
      directas: directas,
      patrones: patrones,
      frecuencia: frecuencia,
      /* Huella del plan: si no cambia, no hay por qué volver a preguntar nada */
      huella: huellaDe(prog)
    };
  }

  /* Lo que hace que un plan sea ese plan y no otro: qué ejercicios, en qué
     orden, con cuántas series. Cambiar el nombre no cambia el dictamen. */
  function huellaDe(prog) {
    return (prog.sesiones || []).map(function (s) {
      return ejerciciosDe(s).map(function (e) {
        return e.exId + ':' + e.sets + 'x' + e.reps + ':' + e.rest;
      }).join(',');
    }).join('|');
  }

  /* ---------- de fallo a cambio ----------
     Dejar que el modelo propusiera los cambios era la otra mitad del problema:
     cuatro consultas del mismo plan proponen cuatro cosas distintas, y alguna
     imposible —meter un ejercicio que ya estaba, o cambiar una extensión de
     cuádriceps por un curl de muñeca—. Los cambios se deducen del fallo, se
     validan contra el catálogo, el material y las limitaciones, y salen en el
     mismo formato que ya sabía aplicar la pantalla. */

  function vetadoPorLesion(ex) {
    const claves = Programa.lesionesDe((Perfil.datos() || {}).lesiones);
    if (!claves || !claves.length) return false;
    const pt = Alt.patron(ex);
    return claves.some(function (k) {
      const L = Programa.LESIONES[k];
      if (!L) return false;
      if ((L.patronesFuera || []).indexOf(pt) !== -1) return true;
      const eq = (L.equipoFuera || {})[pt];
      return !!(eq && eq.indexOf(ex.equipment) !== -1);
    });
  }

  function sirve(ex, gear, yaPuestos) {
    if (!ex || yaPuestos[ex.id]) return false;
    if (FUERA.indexOf(ex.category) !== -1) return false;
    if (OLIMPICO.test(I18N.norm(ex.nameEs || '')) ||
        OLIMPICO.test(I18N.norm(ex.name || ''))) return false;
    if (gear && gear !== 'todo' && !Data.permiteNombre(gear, ex.nameEs)) return false;
    return !vetadoPorLesion(ex);
  }

  /* Con qué se puntua un candidato. Ordenar solo por «compuesto y luego
     alfabético» metía un «A cajón shuffle lateral» como recambio de cuádriceps y
     una apertura con bandas para hombros en alguien que entrena en gimnasio: son
     compuestos y empiezan por A, y con eso ganaban. Lo que decide es que sea
     trabajo de fuerza, con material de carga y del músculo que toca. */
  /* Para rellenar un hueco vale el trabajo de fuerza normal. La halterofilia
     olímpica —arrancada, cargada y press— puntuaba altísimo por ser compuesta y
     con barra, y acababa propuesta como accesorio de hombro: es un gesto
     técnico que no se aprende leyendo una tarjeta, y como recambio automático no
     tiene sentido aunque en el papel encaje. */
  const FUERZA = ['strength', 'powerlifting'];
  const FUERA = ['olympic weightlifting', 'plyometrics', 'stretching', 'cardio'];

  /* La categoría del catálogo no basta: «Cargada y press» viene marcado como
     strength, y con barra y compuesto puntuaba como el mejor accesorio de
     hombro que existe. Los gestos olímpicos se reconocen por el nombre. */
  const OLIMPICO = /\b(cargada|arrancada|envion|envión|clean|snatch|jerk|swing|thruster|muscle up|dominada rocky)\b/;
  const CARGA = { barbell: 16, dumbbell: 15, cable: 13, machine: 12, kettlebell: 10,
    'e-z curl bar': 12, 'body only': 5, bands: 2, 'medicine ball': 2, other: 4 };

  function puntuar(ex, favs) {
    let s = 0;
    if (FUERZA.indexOf(ex.category) !== -1) s += 30; else s -= 25;
    s += ex.mechanic === 'compound' ? 12 : 6;
    s += CARGA[ex.equipment] === undefined ? 4 : CARGA[ex.equipment];
    if (favs.indexOf(ex.id) !== -1) s += 8;
    if (ex.level === 'beginner' || ex.level === 'intermediate') s += 4;
    return s;
  }

  /* A igualdad de puntos manda el nombre, que no depende de en qué orden venga
     el catálogo: así dos ejecuciones eligen siempre lo mismo. */
  function elMejor(cand, favs) {
    if (!cand.length) return null;
    cand.sort(function (a, b) {
      const d = puntuar(b, favs) - puntuar(a, favs);
      return d !== 0 ? d : a.nameEs.localeCompare(b.nameEs, 'es');
    });
    return cand[0];
  }

  /* Con qué movimiento se entrena cada músculo. Pedir «algo de tríceps» sin
     decir el patrón deja al generador sin criterio y devuelve lo primero que
     toque ese músculo —salió un «Car drivers» y un tríceps con banda elástica—,
     porque la preferencia curada y la puntuación cuelgan del patrón. */
  const PATRON_DE = {
    chest: 'empuje horizontal',
    lats: 'traccion vertical',
    'middle back': 'traccion horizontal',
    shoulders: 'elevacion lateral',
    traps: 'elevacion lateral',
    quadriceps: 'extension de cuadriceps',
    hamstrings: 'curl femoral',
    glutes: 'empuje de cadera',
    biceps: 'curl de biceps',
    triceps: 'extension de triceps',
    calves: 'gemelo',
    abdominals: 'abdominal por elevacion',
    'lower back': 'bisagra de cadera'
  };

  /* Se le pregunta al generador, que es quien sabe elegir; lo de aquí queda de
     red por si para ese hueco no encuentra nada. */
  function mejorPara(musculo, gear, yaPuestos) {
    const suyo = Programa.sugerir({
      patron: PATRON_DE[musculo] || '', musculo: musculo,
      gear: gear, excluir: yaPuestos
    });
    if (suyo && sirve(suyo, gear, yaPuestos)) return suyo;
    return elMejor(Data.search({ muscle: musculo, gear: gear === 'todo' ? '' : gear })
      .filter(function (ex) { return sirve(ex, gear, yaPuestos); }), Store.favorites() || []);
  }

  function mejorDePatron(patron, gear, yaPuestos) {
    const suyo = Programa.sugerir({ patron: patron, rol: 'principal',
      gear: gear, excluir: yaPuestos });
    if (suyo && sirve(suyo, gear, yaPuestos)) return suyo;
    return elMejor(Data.all().filter(function (ex) {
      return Alt.patron(ex) === patron && sirve(ex, gear, yaPuestos);
    }), Store.favorites() || []);
  }

  /* El día con menos series de ese músculo: si falta glúteo, el ejercicio nuevo
     va donde menos glúteo hay, no en el primero que pille. */
  /* Un básico que sobra de un día no va al día más vacío: va al día que ya
     trabaja eso mismo y que no tenga otro básico pesado. Mandar el peso muerto
     rumano al día de pecho lo deja tan mal colocado como estaba. */
  function diaParaMover(sesiones, ex, origen) {
    return diaAfin(sesiones, ex, origen, true);
  }

  /* A qué día va un ejercicio: al que ya trabaja lo mismo. Buscar «el día con
     menos series de ese músculo» metía el puente de glúteos en el día de pecho,
     porque ahí había cero: cero es lo que tiene cualquier día que no sea el
     suyo. Lo que importa es la afinidad, no el hueco. */
  function diaAfin(sesiones, ex, origen, vetarAxial) {
    /* Primarios y secundarios de los dos lados: mirando solo los primarios, un
       peso muerto rumano no encontraba afinidad en ningún día —ninguno tenía
       isquios como objetivo— y acababa en el primero de la lista, que era el de
       pecho. Por los secundarios sí encuentra el día de glúteo, que es el suyo. */
    const mios = (ex.primaryMuscles || []).concat(ex.secondaryMuscles || []);
    let mejor = -1, mas = -1, cortos = Infinity;
    sesiones.forEach(function (s, i) {
      if (i === origen) return;
      const lista = ejerciciosDe(s);
      if (vetarAxial) {
        const yaTieneAxial = lista.some(function (e) {
          const x = Data.get(e.exId);
          return x && x.mechanic === 'compound' && AXIALES.indexOf(Alt.patron(x)) !== -1;
        });
        if (yaTieneAxial) return;
      }
      const afin = lista.reduce(function (a, e) {
        const x = Data.get(e.exId);
        if (!x) return a;
        const suyos = (x.primaryMuscles || []).concat(x.secondaryMuscles || []);
        const comunes = suyos.filter(function (m) { return mios.indexOf(m) !== -1; }).length;
        return a + comunes * e.sets;
      }, 0);
      /* Si ningún día tiene nada que ver, al menos al que menos cargado esté */
      if (afin > mas || (afin === mas && lista.length < cortos)) {
        mas = afin; cortos = lista.length; mejor = i;
      }
    });
    return mejor;
  }

  /* Un añadido tiene que entrar bien puesto, o el arreglo crea dos fallos
     nuevos: metido al final queda detrás de los aislamientos, y con el descanso
     por defecto se queda corto si es un básico. */
  function comoEntra(ex) {
    const pt = Alt.patron(ex);
    const pesado = ex.mechanic === 'compound' && AXIALES.indexOf(pt) !== -1;
    const compuesto = ex.mechanic === 'compound';
    return {
      series: pesado ? 4 : 3,
      reps: pesado ? 8 : compuesto ? 10 : 12,
      rest: pesado ? 150 : compuesto ? 120 : 60,
      /* delante de los aislamientos si mueve peso de verdad */
      alPrincipio: compuesto
    };
  }

  function arreglos(prog, rev) {
    const sesiones = prog.sesiones || [];
    const gear = prog.gear || Store.settings().gear || 'gym';
    const cambios = [];

    const dentro = {};
    sesiones.forEach(function (s) {
      ejerciciosDe(s).forEach(function (e) { dentro[e.exId] = true; });
    });

    rev.hallazgos.forEach(function (h) {
      const a = h.arreglo;
      if (!a) return;

      /* El orden y el descanso se salían sin arreglo: el dictamen decía que el
         básico iba demasiado tarde o que descansabas poco, y luego no había
         forma de aplicarlo. Son dos de las tres cosas que más cambian una
         sesión y las dos se arreglan solas. */
      if (a.tipo === 'orden') {
        const ses = sesiones[a.dia];
        if (!ses) return;
        const lista = ejerciciosDe(ses);

        /* El orden entero de la sesión, de una vez: los básicos pesados delante
           —entre ellos, como estuvieran—, luego el resto de compuestos y al final
           el aislamiento. Se conserva el orden relativo dentro de cada grupo para
           no reescribir una sesión que por dentro ya estaba pensada. */
        const pesados = [], compuestos = [], aislados = [];
        lista.forEach(function (e) {
          const x = Data.get(e.exId);
          if (esPesado(e)) pesados.push(e);
          else if (x && x.mechanic === 'compound') compuestos.push(e);
          else aislados.push(e);
        });
        const nuevo = pesados.concat(compuestos, aislados);

        const igual = nuevo.every(function (e, k) { return lista[k] === e; });
        if (igual) return;

        cambios.push({
          accion: 'orden', sobre: tituloSesion(ses, a.dia), poner: '', quitar: '',
          dia: a.dia + 1,
          lista: nuevo.map(function (e) { return (Data.get(e.exId) || {}).nameEs || ''; }),
          porque: 'los básicos delante y el aislamiento al final, para llegar ' +
            'descansado a lo que más peso mueve'
        });
        return;
      }

      if (a.tipo === 'descanso' && a.donde) {
        a.donde.forEach(function (d) {
          const ex = Data.get(d.exId);
          if (!ex) return;
          cambios.push({ accion: 'descanso', sobre: ex.nameEs, poner: '', quitar: '',
            dia: d.dia + 1, rest: a.valor,
            porque: 'subir el descanso a ' + a.valor + ' segundos, que es lo que ' +
              'necesita un básico pesado para repetir la serie con fuerza' });
        });
        return;
      }

      /* Repartir: se coge el músculo apelotonado y se le mete un ejercicio suyo
         en otro día, el más afín de los que no lo tocan. */
      if (a.tipo === 'repartir' && a.musculos) {
        const m = a.musculos[0];
        const ex = mejorPara(m, gear, dentro);
        if (!ex) return;
        const suyo = [];
        sesiones.forEach(function (ses, i) {
          const tiene = ejerciciosDe(ses).some(function (e) {
            const x = Data.get(e.exId);
            return x && (x.primaryMuscles || []).indexOf(m) !== -1;
          });
          if (tiene) suyo.push(i);
        });
        const libres = sesiones.filter(function (_, i) { return suyo.indexOf(i) === -1; });
        if (!libres.length) return;
        const dia = diaAfin(sesiones.map(function (ses, i) {
          return suyo.indexOf(i) === -1 ? ses : { nombre: '', ejercicios: [] };
        }), ex, -1, false);
        if (dia === -1 || suyo.indexOf(dia) !== -1) return;
        cambios.push(Object.assign({ accion: 'anadir', quitar: '', poner: ex.nameEs,
          dia: dia + 1,
          porque: 'un segundo día de ' + I18N.muscle(m).toLowerCase() +
            ', que ahora solo entrenas uno' }, comoEntra(ex)));
        dentro[ex.id] = true;
        return;
      }

      if (a.tipo === 'quitar' && a.exId) {
        const ex = Data.get(a.exId);
        if (!ex) return;
        cambios.push({ accion: 'quitar', quitar: ex.nameEs, poner: '', dia: a.dia + 1,
          series: 0, reps: 0, porque: h.titulo.toLowerCase() });
        return;
      }

      if (a.tipo === 'mover' && a.exId) {
        /* Mover no existe como acción: se quita de donde estorba y se mete en el
           día que menos carga esa zona. */
        const ex = Data.get(a.exId);
        if (!ex) return;
        const destino = diaParaMover(sesiones, ex, a.dia);
        if (destino === -1) {
          /* No hay ningún día libre de básicos donde meterlo: entonces el arreglo
             no es moverlo, es quitarlo, y se dice así. */
          cambios.push({ accion: 'quitar', quitar: ex.nameEs, poner: '', dia: a.dia + 1,
            series: 0, reps: 0,
            porque: 'dos básicos pesados el mismo día; no hay otro día libre donde ' +
              'colocarlo, así que sale' });
          return;
        }
        cambios.push({ accion: 'quitar', quitar: ex.nameEs, poner: '', dia: a.dia + 1,
          series: 0, reps: 0,
          porque: 'sacarlo del día en que choca con el otro básico pesado' });
        cambios.push(Object.assign({ accion: 'anadir', quitar: '', poner: ex.nameEs,
          dia: destino + 1,
          porque: 'llevarlo a un día que ya trabaja esa zona y llegas descansado' },
          comoEntra(ex)));
        return;
      }

      if (a.tipo === 'cambiar' && a.exId) {
        const ex = Data.get(a.exId);
        if (!ex) return;
        const alt = (Alt.para(ex, { gear: gear === 'todo' ? '' : gear, soloDisponible: true }) || [])
          .map(function (x) { return x.ex; })
          .filter(function (x) { return sirve(x, gear, dentro); })[0];
        if (!alt) return;
        cambios.push({ accion: 'cambiar', quitar: ex.nameEs, poner: alt.nameEs, dia: a.dia + 1,
          series: 0, reps: 0, porque: h.titulo.toLowerCase() });
        dentro[alt.id] = true;
        return;
      }

      if (a.tipo === 'anadir' && a.patron) {
        const ex = mejorDePatron(a.patron, gear, dentro);
        if (!ex) return;
        const dia = diaAfin(sesiones, ex, -1, AXIALES.indexOf(a.patron) !== -1);
        if (dia === -1) return;
        cambios.push(Object.assign({ accion: 'anadir', quitar: '', poner: ex.nameEs,
          dia: dia + 1, porque: 'cubrir el patrón que falta en toda la semana' },
          comoEntra(ex)));
        dentro[ex.id] = true;
        return;
      }

      if (a.tipo === 'anadir' && (a.musculos || a.musculo)) {
        /* Solo los dos más cortos: siete cambios de golpe no los aplica nadie y
           encima alargan todas las sesiones. */
        const lista = (a.musculos || [a.musculo]).slice()
          .sort(function (x, y) { return (rev.directas[x] || 0) - (rev.directas[y] || 0); })
          .slice(0, 2);
        lista.forEach(function (m) {
          /* Si ya hay un ejercicio de ese músculo con pocas series, sale más a
             cuenta subirle las series que meter otro ejercicio: la sesión no se
             alarga y el estímulo sube igual. */
          let flojo = null;
          sesiones.forEach(function (ses, i) {
            ejerciciosDe(ses).forEach(function (e) {
              const x = Data.get(e.exId);
              if (!x || (x.primaryMuscles || []).indexOf(m) === -1) return;
              if (e.sets >= 4) return;
              if (!flojo || e.sets < flojo.e.sets) flojo = { e: e, dia: i, ex: x };
            });
          });
          if (flojo) {
            const suben = Math.min(5, flojo.e.sets +
              Math.max(1, MINIMO - (rev.directas[m] || 0)));
            cambios.push({ accion: 'series', sobre: flojo.ex.nameEs, poner: '', quitar: '',
              dia: flojo.dia + 1, series: suben,
              porque: 'de ' + flojo.e.sets + ' a ' + suben + ' series para subir ' +
                I18N.muscle(m).toLowerCase() + ', que está en ' + (rev.directas[m] || 0) +
                ' y el mínimo es ' + MINIMO });
            return;
          }

          const ex = mejorPara(m, gear, dentro);
          if (!ex) return;
          const dia = diaAfin(sesiones, ex, -1, false);
          if (dia === -1) return;
          /* Las que falten para llegar al mínimo, no tres fijas: añadir tres a un
             músculo que está en cuatro lo deja en siete y el fallo sigue ahí. */
          const faltan = Math.max(1, Math.min(5, MINIMO - (rev.directas[m] || 0)));
          cambios.push(Object.assign({ accion: 'anadir', quitar: '', poner: ex.nameEs,
            dia: dia + 1,
            porque: 'subir las series de ' + I18N.muscle(m).toLowerCase() +
              ', que está en ' + (rev.directas[m] || 0) + ' y el mínimo es ' + MINIMO },
            comoEntra(ex), { series: faltan }));
          dentro[ex.id] = true;
        });
        return;
      }

      if (a.tipo === 'quitar' && a.musculos) {
        const m = a.musculos.slice().sort(function (x, y) {
          return (rev.directas[y] || 0) - (rev.directas[x] || 0);
        })[0];
        /* El aislamiento más tardío de ese músculo: el que menos aporta */
        let cand = null;
        sesiones.forEach(function (s, i) {
          ejerciciosDe(s).forEach(function (e) {
            const ex = Data.get(e.exId);
            if (!ex || ex.mechanic !== 'isolation') return;
            if ((ex.primaryMuscles || []).indexOf(m) === -1) return;
            cand = { ex: ex, dia: i };
          });
        });
        if (!cand) return;
        cambios.push({ accion: 'quitar', quitar: cand.ex.nameEs, poner: '', dia: cand.dia + 1,
          series: 0, reps: 0,
          porque: 'bajar las series de ' + I18N.muscle(m).toLowerCase() +
            ', que está en ' + (rev.directas[m] || 0) });
      }
    });

    return cambios;
  }

  /* ---------- comparar planes ----------
     Con varios planes guardados, saber que todos «están bien» no ayuda a elegir:
     la revisión busca defectos, y no tener defectos no es lo mismo que ser el
     mejor. Aquí se ponen en la misma tabla los números que de verdad los
     separan, para poder decir cuál seguir y por qué. */
  function medir(prog) {
    const rev = revisar(prog);
    const sesiones = prog.sesiones || [];
    const tam = sesiones.map(function (s) { return ejerciciosDe(s).length; });

    const servidos = GRANDES.filter(function (m) {
      return (rev.directas[m] || 0) >= MINIMO;
    });
    const cortos = GRANDES.filter(function (m) {
      const n = rev.directas[m] || 0;
      return n > 0 && n < MINIMO;
    });
    const dosDias = servidos.filter(function (m) {
      return (rev.frecuencia[m] || 0) >= 2;
    });

    return {
      nombre: prog.nombre || prog.deRutinas || 'Plan',
      nota: rev.nota,
      hallazgos: rev.hallazgos,
      dias: sesiones.length,
      ejercicios: tam.reduce(function (a, b) { return a + b; }, 0),
      series: sesiones.reduce(function (a, s) {
        return a + ejerciciosDe(s).reduce(function (x, e) { return x + (e.sets || 0); }, 0);
      }, 0),
      minEjercicios: tam.length ? Math.min.apply(null, tam) : 0,
      maxEjercicios: tam.length ? Math.max.apply(null, tam) : 0,
      servidos: servidos.length,
      cortos: cortos.length,
      dosDias: dosDias.length,
      directas: rev.directas,
      frecuencia: rev.frecuencia
    };
  }

  /* El orden: manda la nota, porque ya recoge los fallos y su gravedad. A
     igualdad, gana el que reparte cada músculo en más días, y luego el que
     tiene los días más parejos. */
  function comparar(progs) {
    const filas = (progs || []).map(medir);
    filas.sort(function (a, b) {
      if (b.nota !== a.nota) return b.nota - a.nota;
      if (b.dosDias !== a.dosDias) return b.dosDias - a.dosDias;
      const da = a.maxEjercicios - a.minEjercicios;
      const db = b.maxEjercicios - b.minEjercicios;
      if (da !== db) return da - db;
      return b.servidos - a.servidos;
    });
    return filas;
  }

  /* Por qué gana el que gana, dicho en una frase y con números. */
  function porQueGana(filas) {
    if (!filas.length) return '';
    const g = filas[0];
    if (filas.length === 1) return 'Es el único que tienes.';

    const otro = filas[1];
    const razones = [];
    if (g.nota > otro.nota) {
      razones.push('saca ' + g.nota + ' frente a ' + otro.nota + ', y la nota sale de ' +
        'los fallos encontrados');
    }
    if (g.dosDias > otro.dosDias) {
      razones.push('reparte ' + g.dosDias + ' músculos en dos o más días, frente a ' +
        otro.dosDias);
    }
    if (!g.cortos && otro.cortos) {
      razones.push('no deja ningún músculo por debajo del mínimo y el otro deja ' +
        otro.cortos);
    }
    const dg = g.maxEjercicios - g.minEjercicios;
    const dOtro = otro.maxEjercicios - otro.minEjercicios;
    if (dg < dOtro) {
      razones.push('tiene los días más parejos (de ' + g.minEjercicios + ' a ' +
        g.maxEjercicios + ' ejercicios, frente a ' + otro.minEjercicios + ' a ' +
        otro.maxEjercicios + ')');
    }
    if (!razones.length) {
      return 'Van muy igualados: quédate con el que te apetezca más entrenar, que ' +
        'es el que acabarás cumpliendo.';
    }
    return 'Frente a «' + otro.nombre + '», ' + razones.join('; ') + '.';
  }

  /* Para meterlo en el prompt: los fallos ya encontrados, numerados. */
  function comoTexto(rev) {
    if (!rev.hallazgos.length) {
      return 'FALLOS ENCONTRADOS AL REVISAR EL PLAN: ninguno. Las comprobaciones ' +
        '—volumen por músculo, patrones, repeticiones, orden, descansos, material y ' +
        'limitaciones— salen todas limpias.\n';
    }
    return 'FALLOS ENCONTRADOS AL REVISAR EL PLAN (calculados sobre el propio plan, ' +
      'no son opiniones):\n' + rev.hallazgos.map(function (h, i) {
        return (i + 1) + ') ' + h.titulo + ' — ' + h.dato +
          ' [gravedad ' + h.gravedad + ' sobre 3]';
      }).join('\n') + '\n';
  }

  g.Revisar = {
    revisar: revisar,
    arreglos: arreglos,
    medir: medir,
    comparar: comparar,
    porQueGana: porQueGana,
    GRANDES: GRANDES,
    comoTexto: comoTexto,
    huellaDe: huellaDe,
    seriesDirectas: seriesDirectas,
    MINIMO: MINIMO,
    MAXIMO: MAXIMO
  };
})(window);
