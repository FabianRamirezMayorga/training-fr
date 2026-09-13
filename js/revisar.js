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

  function reglaOrden(sesiones, hallazgos) {
    sesiones.forEach(function (s, i) {
      const lista = ejerciciosDe(s);
      let vistoAislado = -1;
      lista.forEach(function (e, k) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        if (ex.mechanic === 'isolation' && vistoAislado === -1) vistoAislado = k;
        if (ex.mechanic === 'compound' && vistoAislado !== -1 &&
            AXIALES.concat(['empuje horizontal', 'empuje vertical', 'traccion vertical'])
              .indexOf(Alt.patron(ex)) !== -1) {
          hallazgos.push({
            id: 'orden:' + i + ':' + e.exId, gravedad: 2,
            titulo: nombre(e) + ' va demasiado tarde',
            dato: 'en ' + tituloSesion(s, i) + ' lo haces el ' + (k + 1) + '.º, detrás de ' +
              nombre(lista[vistoAislado]) + ', que es de aislamiento: llegas cansado al ' +
              'ejercicio que más peso mueve',
            arreglo: { tipo: 'orden', exId: e.exId, dia: i }
          });
          vistoAislado = -1;
        }
      });
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
    const hallazgos = [];

    reglaRepetidos(sesiones, hallazgos);
    reglaSitio(sesiones, prog.gear, hallazgos);
    reglaLesiones(sesiones, prog, hallazgos);
    reglaAxiales(sesiones, hallazgos);
    if (!opciones.sesionSuelta) {
      reglaPatrones(sesiones, patrones, hallazgos);
      reglaVolumen(sesiones, directas, hallazgos);
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
    comoTexto: comoTexto,
    huellaDe: huellaDe,
    seriesDirectas: seriesDirectas,
    MINIMO: MINIMO,
    MAXIMO: MAXIMO
  };
})(window);
