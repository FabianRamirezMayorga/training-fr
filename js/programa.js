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
      accesorio: { series: 3, reps: 15, rest: 50 },
      rpe: 8, volumen: 0.9, cardio: true
    },
    mantener: {
      label: 'Tonificar y mantenerme',
      resumen: 'Recomposición: mismo trabajo de fuerza con algo más de repeticiones ' +
        'y algo de acondicionamiento.',
      principal: { series: 4, reps: 10, rest: 105 },
      accesorio: { series: 3, reps: 12, rest: 60 },
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

  /* Las repeticiones que escribe una persona.

     Nadie pone 3x13. Se pone 3x12, o 3x15, o 3x10. Los números de en medio
     salen de hacer cuentas —una base más un ajuste— y delatan a la máquina
     en cada línea de la hoja: medido sobre 3.351 colocaciones, casi la mitad
     caían en 9, 13 o 14.

     No es cosmetica. Una hoja que pone 3x13 se lee como generada, y lo que se
     lee como generado no se sigue. Los rangos de verdad son los de siempre y
     caben en siete números; la diferencia entre 13 y 12 no la nota ningún
     músculo, y la de leerlo sí.

     Se aplica al final, cuando ya se han sumado todos los ajustes, para que
     ninguno pueda volver a sacar un número raro por detrás. */
  const REPS_REALES = [5, 6, 8, 10, 12, 15, 20];

  function repsRedondas(n) {
    n = Math.round(Number(n) || 0);
    if (n <= 0) return 0;
    return REPS_REALES.reduce(function (mejor, r) {
      /* A igual distancia gana el de abajo: 11 es 10 y no 12. Subir
         repeticiones baja la carga, y de las dos equivocaciones posibles esa
         es la que estropea el estímulo. */
      return Math.abs(r - n) < Math.abs(mejor - n) ? r : mejor;
    }, REPS_REALES[0]);
  }

  /* El rango que se escribe en la hoja: «4 × 6-8», no «4 × 8».

     Un número solo no dice qué hacer cuando hoy salen nueve: ¿subo el peso?,
     ¿me quedo?, ¿estaba mal la hoja? El rango lleva la regla dentro —cuando
     llegas arriba en todas las series, sube el peso— y es como está escrito
     cualquier programa de verdad. La otra mitad de la razón es la misma que la
     de los números redondos de aquí arriba: «3 × 12» se lee como una orden de
     una máquina y «3 × 10-12» como una indicación de alguien.

     El techo del rango es el número de siempre, el mismo que ya usaba la
     progresión para decidir si habías cumplido: así el rango es nuevo solo en
     la hoja y ningún cálculo cambia de resultado. El suelo es el escalón
     anterior de la escala, que para eso está. Y devuelve 0 —sin rango— para
     lo que no está en la escala: los estáticos llevan segundos, y cuarenta
     segundos no son «20-40». */
  function repsAbajo(n) {
    const i = REPS_REALES.indexOf(Number(n));
    return i > 0 ? REPS_REALES[i - 1] : 0;
  }

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
      /* Por nombre además del patrón. El press Arnold es de mancuernas y por
         eso pasaba el filtro de material, pero gira el húmero con el brazo
         cargado por encima de la cabeza, que es justo el gesto que no toca con
         un manguito tocado. Lo mismo el press tras nuca y las elevaciones que
         suben por encima del hombro. */
      nombresFuera: 'arnold|tras nuca|detr[aá]s de la nuca|behind the neck|' +
        'sobre la cabeza|above head|frontal.*sobre|pull over|pullover',
      nota: 'Fuera el remo al mentón, los fondos y el press Arnold, que son los que ' +
        'más pinzan. El press por encima de la cabeza va con mancuernas, que dejan ' +
        'girar el hombro.'
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
    const nombres = [];       // trozos de nombre vetados por la lesión
    let sinMaximos = false;

    claves.forEach(function (k) {
      const L = LESIONES[k];
      if (!L) return;
      (L.patronesFuera || []).forEach(function (p) { fuera[p] = true; });
      Object.keys(L.equipoFuera || {}).forEach(function (p) {
        equipoFuera[p] = (equipoFuera[p] || []).concat(L.equipoFuera[p]);
      });
      (L.exigirApoyo || []).forEach(function (p) { conApoyo[p] = true; });
      if (L.nombresFuera) nombres.push(L.nombresFuera);
      if (L.sinMaximos) sinMaximos = true;
      notas.push(L.label + ': ' + L.nota);
    });

    return { fuera: fuera, equipoFuera: equipoFuera, conApoyo: conApoyo,
      notas: notas, sinMaximos: sinMaximos,
      nombresFuera: nombres.length ? new RegExp(nombres.join('|'), 'i') : null };
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
    /* Los tres cuerpo completo llevan empuje, tracción, pierna y un brazo. No
       es por simetría: con tres días así, cada músculo sale dos o tres veces
       por semana, que es de lo que iba todo esto. Cuando el pecho salía solo
       en A y el bíceps solo en C, un plan de tres días dejaba medio cuerpo a
       una vez. */
    /* El día único lleva los seis patrones y nada más. Quien entrena una vez
       por semana no puede permitirse que ese día le falte el tirón vertical o
       el empuje por encima de la cabeza: no hay un segundo día donde ponerlo.
       Las plantillas A, B y C reparten porque hay dónde repartir; esta no. */
    fullUnico: { nombre: 'Cuerpo completo', huecos: [
      h(P.sen, 'quadriceps', 'principal'), h(P.emH, 'chest', 'principal'),
      h(P.trV, 'lats', 'principal'), h(P.bis, 'hamstrings', 'accesorio'),
      h(P.emV, 'shoulders', 'accesorio'), h(P.trH, 'middle back', 'accesorio')] },

    fullA: { nombre: 'Cuerpo completo A', huecos: [
      h(P.sen, 'quadriceps', 'principal'), h(P.emH, 'chest', 'principal'),
      h(P.trH, 'middle back', 'principal'), h(P.bis, 'hamstrings', 'accesorio'),
      h(P.lat, 'shoulders', 'accesorio'), h(P.ant, 'abdominals', 'accesorio')] },
    /* La bisagra de cadera va de principal aquí y no de accesorio en A, para
       que los tres principales de A y los tres de B sumen exactamente los seis
       patrones fundamentales. Con dos días y poco tiempo el recorte se queda
       solo con los principales, y así lo que sobrevive sigue siendo un plan
       entero en vez de uno sin nada de femoral. El glúteo no se queda sin: el
       peso muerto rumano es suyo también, y en C tiene su empuje de cadera. */
    fullB: { nombre: 'Cuerpo completo B', huecos: [
      h(P.bis, 'hamstrings', 'principal'), h(P.trV, 'lats', 'principal'),
      h(P.emV, 'shoulders', 'principal'), h(P.zan, 'quadriceps', 'accesorio'),
      h(P.cad, 'glutes', 'accesorio'), h(P.cbi, 'biceps', 'accesorio'),
      h(P.etr, 'triceps', 'accesorio')] },
    fullC: { nombre: 'Cuerpo completo C', huecos: [
      h(P.cad, 'glutes', 'principal'), h(P.emH, 'chest', 'principal'),
      h(P.trH, 'middle back', 'principal'), h(P.cuf, 'hamstrings', 'accesorio'),
      h(P.exc, 'quadriceps', 'accesorio'), h(P.gem, 'calves', 'accesorio')] },

    superior: { nombre: 'Tren superior', huecos: [
      h(P.emH, 'chest', 'principal'), h(P.trH, 'middle back', 'principal'),
      h(P.emV, 'shoulders', 'principal'), h(P.trV, 'lats', 'accesorio'),
      h(P.lat, 'shoulders', 'accesorio'), h(P.cbi, 'biceps', 'accesorio'),
      h(P.etr, 'triceps', 'accesorio')] },
    /* El abdominal de este día era de antirrotación, y con eso el cierre de
       la pierna salía siendo un Bird-Dog: perfecto en una consulta de
       fisioterapia y flojo detrás de una sentadilla y un peso muerto. Con
       flexión de tronco salen elevaciones de cadera y de piernas —medido:
       treinta y seis y veintisiete veces sobre los 144 planes—, que es trabajo
       de abdomen de gimnasio y progresa añadiendo recorrido o peso, como el
       resto de la hoja. La antirrotación se queda en los días de cuerpo
       completo, donde sí pega. */
    inferior: { nombre: 'Tren inferior', huecos: [
      h(P.sen, 'quadriceps', 'principal'), h(P.bis, 'hamstrings', 'principal'),
      h(P.cad, 'glutes', 'principal'), h(P.zan, 'quadriceps', 'accesorio'),
      h(P.cuf, 'hamstrings', 'accesorio'), h(P.gem, 'calves', 'accesorio'),
      h(P.abd, 'abdominals', 'accesorio')] },
    /* La segunda vuelta del torso tira de espalda, no de pecho. Con dos huecos
       de pecho aquí y otros dos en el primer día salían once series de pecho
       contra seis de dorsal, y el desequilibrio hacia el empuje es el que
       acaba en hombros que duelen. */
    superior2: { nombre: 'Tren superior (volumen)', huecos: [
      h(P.trV, 'lats', 'principal'), h(P.emH, 'chest', 'principal'),
      h(P.trH, 'middle back', 'accesorio'), h(P.apr, 'shoulders', 'accesorio'),
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
    /* El día de hombro y brazo, y su pareja.

       En el reparto normal de cinco días los brazos van siempre colgados al
       final de un día de empuje o de tracción, nunca solos. Eso hace que la
       semana se lea como tres días estirados a cinco en vez de cinco días
       distintos, y es la diferencia que se nota al comparar con cualquier
       rutina de gimnasio escrita por una persona.

       Los tres huecos de hombro no son un error: hombroQueToca reparte entre
       lateral, posterior y frontal según lo que ya haya trabajado ese día, y
       aquí detrás de un press militar tocan la lateral y la posterior, que es
       justo la que va corta en casi cualquier plan. */
    hombroBrazo: { nombre: 'Hombro y brazo', huecos: [
      h(P.emV, 'shoulders', 'principal'), h(P.lat, 'shoulders', 'accesorio'),
      h(P.lat, 'shoulders', 'accesorio'), h(P.cbi, 'biceps', 'accesorio'),
      h(P.etr, 'triceps', 'accesorio'), h(P.cbi, 'biceps', 'accesorio'),
      h(P.etr, 'triceps', 'accesorio')] },

    /* El quinto día recoge lo que el día de brazo deja sin segunda vuelta:
       pecho, dorsal y la pierna que no cabe en un solo día. Sin este día, dar
       un día entero al brazo dejaría al cuádriceps y al pecho a una sola vez
       por semana, que es lo que la app lleva diciendo que hay que evitar. */
    torsoPierna: { nombre: 'Torso y pierna', huecos: [
      h(P.emH, 'chest', 'principal'), h(P.trV, 'lats', 'principal'),
      h(P.zan, 'quadriceps', 'accesorio'), h(P.cad, 'glutes', 'accesorio'),
      h(P.cuf, 'hamstrings', 'accesorio'), h(P.abd, 'abdominals', 'accesorio')] },

    pierna: { nombre: 'Pierna', huecos: [
      h(P.sen, 'quadriceps', 'principal'), h(P.bis, 'hamstrings', 'principal'),
      h(P.cad, 'glutes', 'accesorio'), h(P.exc, 'quadriceps', 'accesorio'),
      h(P.cuf, 'hamstrings', 'accesorio'), h(P.gem, 'calves', 'accesorio')] }
  };

  /* Qué se hace cada día según cuántos días se entrene. Dos estímulos por
     semana en cada músculo es lo que más rinde, así que hasta cuatro días
     manda el cuerpo completo o el torso/pierna, no el músculo por día. */
  function repartoSemanal(dias, foco) {
    if (dias <= 1) return ['fullUnico'];
    if (dias === 2) return ['fullA', 'fullB'];
    /* Tres días es cuerpo completo para todo el mundo, no solo para novatos.
       Empuje/tracción/pierna en tres días deja los doce músculos a una vez por
       semana —medido sobre un plan generado—, que es justo lo que el comentario
       de aquí abajo decía que había que evitar. La app se contradecía a sí
       misma: predicaba dos estímulos y repartía uno. */
    if (dias === 3) return ['fullA', 'fullB', 'fullC'];
    if (dias === 4) return ['superior', 'inferior', 'superior2', 'inferior2'];
    /* Cinco días: empuje, tracción y pierna, y encima un torso y un tren
       inferior. Cada músculo sale dos veces y ninguno tres. Las dos mezclas
       que probé antes desequilibraban hacia un lado —con un quinto día de
       empuje salían 18 series de pecho contra 5 de espalda media; con uno de
       tracción, el doble de espalda que de pecho—, porque añadir un día
       entero de una mitad del cuerpo nunca sale gratis. */
    if (dias === 5) {
      /* Con el foco puesto en el hombro o en el brazo, el cuarto día es suyo
         entero en vez de un ejercicio extra colgado al final.

         El foco solo añadía un accesorio, que para «quiero brazo» es muy poco:
         un curl más no cambia una semana. Aquí sí, y se paga: el cuádriceps
         pasa de dos días a dos huecos repartidos entre el día de pierna y el
         de torso, y los gemelos se quedan a una vez. Es el cambio que hace
         cualquier rutina con día de brazo, y por eso va detrás de pedirlo. */
      if (foco === 'brazo' || foco === 'hombro') {
        return ['empuje', 'traccion', 'pierna', 'hombroBrazo', 'torsoPierna'];
      }
      return ['empuje', 'traccion', 'pierna', 'superior', 'inferior'];
    }
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
    /* Los nombres vetados por una lesión, antes que nada: no hay patrón ni
       material que los rescate. */
    if (r.nombresFuera && r.nombresFuera.test(ex.nameEs || ex.name || '')) return false;
    if (!ex.images || ex.images.length < 2) return false;
    if (!Data.gearAllows(gear, ex.equipment)) return false;
    /* El campo «equipment» del catálogo marca como «body only» un remo invertido,
       una dominada o un fondo en paralelas. Filtrando solo por él, a quien entrena
       en el salón sin nada le salían ejercicios de jaula de sentadillas: el veto
       por nombre hacía falta aquí también, que es donde se monta el plan. */
    if (!Data.permiteNombre(gear, ex.nameEs)) return false;
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

  /* El patrón «elevación lateral» mete en el mismo saco las frontales, las
     laterales y las posteriores, que no entrenan lo mismo. En un día de empuje,
     detrás de un press de banca y un press militar, el deltoides anterior ya ha
     trabajado de sobra: meterle una elevación frontal es repetir, y es justo lo
     que hacía. Lo que falta ahí es la porción lateral, y la posterior casi
     siempre va corta en cualquier plan. */
  function hombroQueToca(ex, hueco) {
    if (hueco.patron !== 'elevacion lateral') return 0;
    const n = I18N.norm(ex.nameEs || ex.name || '');
    if (/frontal|sobre cabeza|above cabeza/.test(n)) return -40;
    if (/posterior/.test(n)) return 14;
    if (/lateral/.test(n)) return 12;
    return 0;
  }

  /* Levantamientos olímpicos y sus derivados.

     El auditor ya los descartaba, y el catálogo que se le enseña a la IA
     también. El único que no: el que monta el plan. Resultado medido sobre
     144 planes: «Sentadilla frontal clean agarre» abría el día de pierna 72
     veces. Es una sentadilla frontal con agarre de cargada, y ese agarre pide
     una muñeca y un hombro que casi nadie tiene; de primer ejercicio del día,
     con cuatro series pesadas, no es exigente: es una lesión esperando.

     No se vetan del todo —quien los quiera puede buscarlos—, pero no los
     propone la app sola. */
  const OLIMPICOS = new RegExp([
    'clean', 'snatch', 'jerk', 'arrancada', 'cargada', 'dos tiempos',
    'muscle snatch', 'power ', 'envion'
  ].join('|'), 'i');

  function esOlimpico(ex) {
    const n = (ex.nameEs || '') + ' ' + (ex.name || '');
    return OLIMPICOS.test(n);
  }

  function puntuar(ex, hueco, usados) {
    let s = 0;
    const p = Alt.patron(ex);
    /* Tan grande que no lo remonta ningún bonus: solo entra si literalmente
       no queda ningún otro ejercicio para ese hueco. */
    if (esOlimpico(ex)) s -= 400;
    if (p === hueco.patron) s += 60;
    /* El músculo del hueco tiene que ser de los que el ejercicio entrena de
       verdad. Sin castigo por no estar, una «elevación de cadera en máquina
       Smith» entraba de abdominal solo porque su patrón encajaba. */
    if ((ex.primaryMuscles || []).indexOf(hueco.musculo) !== -1) s += 30;
    else if ((ex.secondaryMuscles || []).indexOf(hueco.musculo) !== -1) s -= 10;
    else s -= 30;
    if (hueco.rol === 'principal') {
      /* Principal quiere decir compuesto. Con -10 un aislamiento podía ganar
         si venía bien recomendado, y salía una patada de glúteo abriendo el
         día de pierna a 4x8. Con -45 solo entra si no hay un compuesto
         disponible, que es cuando de verdad no queda otra. */
      s += ex.mechanic === 'compound' ? 25 : -45;
      s += (ex.equipment === 'barbell' || ex.equipment === 'dumbbell') ? 8 : 0;
    } else {
      s += ex.mechanic === 'isolation' ? 6 : 0;
    }
    if (FUERZA.indexOf(ex.category) !== -1) s += 8;
    s += bonusCurado(ex, hueco.musculo);
    s += hombroQueToca(ex, hueco);
    /* Repetir en la semana penaliza, pero no descalifica: para hipertrofia
       vale más el segundo mejor día con el buen ejercicio que un ejercicio
       flojo por no repetir. Treinta puntos es justo la distancia que separa a
       un ejercicio recomendado de uno del montón. */
    if (usados[ex.id]) s -= 30;
    return s;
  }

  function elegir(hueco, ctx) {
    let candidatos = porPatron(hueco.patron)
      .concat(Data.search({ muscle: hueco.musculo, gear: ctx.gear }))
      .filter(function (ex, i, arr) { return arr.indexOf(ex) === i; })
      .filter(function (ex) { return permitido(ex, hueco, ctx.r, ctx.gear, ctx.maxNivel); });

    if (!candidatos.length) return null;

    /* Dentro del mismo día no se repite jamás: un ejercicio dos veces en la
       misma sesión no es un plan, es un error. Esto es un veto, no una
       penalización. */
    candidatos = candidatos.filter(function (ex) { return !ctx.delDia[ex.id]; });
    if (!candidatos.length) return null;

    /* Repetir en la semana lo decide la puntuación, no un filtro. Antes esto
       era un veto: bastaba con que quedara UN candidato sin usar —por malo que
       fuera— para tirar a la basura todos los buenos, y el segundo día de
       pierna se quedaba con los restos del primero. */
    candidatos.sort(function (a, b) {
      return puntuar(b, hueco, ctx.usados) - puntuar(a, hueco, ctx.usados);
    });

    /* Por defecto, el mejor. La rotación entre los tres primeros es para
       «otra propuesta», y antes corría siempre: desplazada por el número de
       hueco, el plan recién generado nunca empezaba por el mejor ejercicio
       —salía un press inclinado con mancuernas donde tocaba press de banca—.
       Variar cuando te lo piden es una virtud; variar sin que te lo pidan es
       entregar el segundo mejor plan. */
    ctx.hueco = (ctx.hueco || 0) + 1;
    if (!ctx.variante) return candidatos[0];
    const cuantos = Math.min(3, candidatos.length);
    return candidatos[(ctx.variante + ctx.hueco) % cuantos];
  }

  /* Cuando el material deja patrones enteros sin cubrir hay que decirlo con
     nombre y apellidos. Un plan al que le falta toda la tracción no es un plan
     con un hueco: es un plan que te va a dejar los hombros por delante del
     resto, y eso no se arregla solo. */
  function avisoDeMaterial(sinCubrir, gear) {
    if (!sinCubrir.length) return [];
    const tira = sinCubrir.filter(function (p) { return /traccion|curl de biceps/.test(p); });
    if (!tira.length) return [];
    return [gear === 'home'
      ? T('Sin barra ni bandas no hay de dónde tirar, así que la espalda se queda ' +
        'sin trabajo directo y el plan se te va a ir hacia el empuje. Una barra de ' +
        'puerta o unas bandas con anclaje lo arreglan por poco dinero; mientras tanto, ' +
        'cuenta con que esto es un plan a medias.')
      : T('Con este material no hay remo ni curl en el catálogo, así que la espalda y ' +
        'el bíceps se quedan sin trabajo directo. Si puedes anclar la banda a una puerta, ' +
        'el remo sale; si no, es el hueco que tiene este plan.')];
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

    const foco = opts.foco || 'equilibrado';
    const plantillas = repartoSemanal(dias.length, foco);
    const focoConDia = plantillas.indexOf('hombroBrazo') !== -1;
    const porSesion = cabenEn(minutos, obj, edad.calentamiento);

    const usados = {};
    const ctx = { gear: gear, r: r, maxNivel: maxNivel, usados: usados,
      variante: Number(opts.variante) || 0, hueco: 0, delDia: {} };
    const volumen = {};
    const directas = {};
    const sinCubrir = [];

    const sesiones = dias.map(function (dia, i) {
      const plantilla = DIAS[plantillas[i % plantillas.length]];
      let huecos = plantilla.huecos.slice();

      /* El énfasis elegido añade un hueco extra de esa zona, salvo cuando el
         reparto ya le ha dado un día entero: entonces sumar además un curl al
         día de empuje es meter bíceps donde no pinta nada, y de paso dejaba ese
         día con cuatro músculos y sin nombre legible —volvía a llamarse
         «Empuje»—. Quien pide brazo ya tiene su día de brazo. */
      if (foco !== 'equilibrado' && !focoConDia) {
        huecos = aplicarFoco(huecos, foco);
      }

      /* No se recorta por un número estimado: se monta la plantilla entera y
         luego manda el reloj. `cabenEn` calculaba los huecos al precio de un
         ejercicio principal —cuatro series y hora y media de descanso— y los
         accesorios cuestan la mitad, así que se quedaba corto siempre: salían
         cinco ejercicios y cuarenta y ocho minutos de una hora pedida, con el
         gemelo y la espalda media fuera del plan por falta de un sitio que sí
         estaba. Lo que sobre lo quita recortarATiempo, que sabe qué duele
         menos. El tope es para que una plantilla larga no se desmande. */
      const principales = huecos.filter(function (x) { return x.rol === 'principal'; });
      const accesorios = huecos.filter(function (x) { return x.rol === 'accesorio'; });
      huecos = principales.concat(accesorios)
        .slice(0, Math.max(principales.length, Math.min(9, porSesion + 3)));

      const ejercicios = [];
      ctx.delDia = {};
      huecos.forEach(function (hueco) {
        const ex = elegir(hueco, ctx);
        if (!ex) { sinCubrir.push(hueco.patron); return; }
        usados[ex.id] = true;
        ctx.delDia[ex.id] = true;

        const cfg = obj[hueco.rol];
        const estatico = ex.force === 'static';
        /* Los estáticos llevan segundos, no repeticiones: ese 40 no se toca. */
        const reps = estatico ? 40
          : repsRedondas(cfg.reps + (hueco.rol === 'accesorio' ? sexo.repsExtra : 0));
        let rest = Math.round(cfg.rest * (hueco.rol === 'accesorio' ? sexo.descanso : 1) / 5) * 5;
        /* Dos minutos como mínimo en lo que carga la columna. El objetivo de
           hipertrofia pone noventa segundos a todo, y noventa en una sentadilla
           pesada deja la siguiente serie corta de fuerza: lo dice el auditor de
           la app, que lo marcaba como fallo, y lo dice el encargo que la app le
           hace a la IA —«no se recorta»—. Eran tres criterios distintos para la
           misma decisión. */
        if (ex.mechanic === 'compound' && AXIALES_PROG.indexOf(hueco.patron) !== -1) {
          /* También de accesorio. Un peso muerto rumano cansa lo que cansa
             esté primero o cuarto en la hoja, y con setenta y cinco segundos la
             serie siguiente sale corta de fuerza. El sitio en la sesión cambia
             el orden, no la factura. */
          rest = Math.max(rest, hueco.rol === 'principal' ? 150 : 120);
        }

        sumarVolumen(volumen, ex, hueco.musculo, cfg.series, directas);
        ejercicios.push({
          exId: ex.id, patron: hueco.patron, musculo: hueco.musculo, rol: hueco.rol,
          sets: cfg.series, reps: reps, repsMin: repsAbajo(reps), weight: 0, rest: rest,
          note: notaDeEjercicio(hueco, ex, edad, r, estatico)
        });
      });

      /* Sin material no hay nada de lo que colgarse, así que los huecos de
         tracción se quedan sin cubrir y la sesión podía acabar vacía: un día con
         cero ejercicios no es un día de descanso, es un plan roto. Se completa
         con lo que SÍ se pueda hacer, de los músculos que toquen ese día. */
      if (ejercicios.length < 3) {
        /* Lo que falte, por orden de falta. Antes la lista de reserva empezaba
           por pecho, así que un plan en casa —donde los huecos que se quedan
           sin cubrir son siempre los de tracción, porque sin barra no hay de
           dónde colgarse— se rellenaba con más empuje: flexiones donde faltaba
           espalda. Eso no es completar un plan, es torcerlo. */
        const zonas = huecos.map(function (h) { return h.musculo; })
          .filter(function (m, i, a) { return m && a.indexOf(m) === i; })
          .sort(function (a, b) { return (volumen[a] || 0) - (volumen[b] || 0); });
        const rellenos = ['middle back', 'lats', 'biceps', 'hamstrings', 'glutes',
          'abdominals', 'quadriceps', 'calves', 'shoulders', 'triceps', 'chest']
          .sort(function (a, b) { return (volumen[a] || 0) - (volumen[b] || 0); });

        zonas.concat(rellenos).forEach(function (m) {
          if (ejercicios.length >= 3) return;
          const ex = elegir(h(P.exc, m, 'accesorio'), ctx) ||
            elegir(h('', m, 'accesorio'), ctx);
          if (!ex) return;
          usados[ex.id] = true;
          ctx.delDia[ex.id] = true;
          const cfg = obj.accesorio;
          sumarVolumen(volumen, ex, m, cfg.series, directas);
          ejercicios.push({
            exId: ex.id, patron: Alt.patron(ex), musculo: m, rol: 'accesorio',
            sets: cfg.series, reps: repsRedondas(cfg.reps + sexo.repsExtra),
            repsMin: repsAbajo(repsRedondas(cfg.reps + sexo.repsExtra)), weight: 0,
            rest: Math.round(cfg.rest * sexo.descanso / 5) * 5,
            note: T('Entra para que el día no se quede corto con el material que tienes.')
          });
        });
      }

      return {
        dia: dia,
        /* Se deja escrito para los planes que ya estaban guardados, pero quien
           lo pinta llama a nombreSesion(): así el nombre sigue al idioma de hoy
           y no al del día en que se generó el plan. */
        nombre: UI.diaLargo(dia) + ' · ' + T(plantilla.nombre),
        plantilla: plantilla.nombre,
        ejercicios: ejercicios,
        minutos: duracion(ejercicios, edad.calentamiento)
      };
    });

    /* Primero que quepa, y después que llegue: recortar lo que sobra libera el
       tiempo con el que luego se rellena donde falta. */
    sesiones.forEach(function (ses) { recortarATiempo(ses, minutos, edad.calentamiento); });
    sesiones.forEach(function (ses) {
      ctx.delDia = {};
      ses.ejercicios.forEach(function (e) { ctx.delDia[e.exId] = true; });
      equilibrarBrazo(ses, ctx, obj, sexo, minutos, edad.calentamiento);
    });
    /* El orden, antes de repartir series.

       Estaba al final, con el argumento de que no se puede ordenar hasta saber
       qué ejercicios se quedan —cierto—, pero eso lo decide recortarATiempo,
       que ya ha pasado. Cuadrar el volumen sin saber el orden es el que dejaba
       la hoja subiendo al final: no sabía qué tenía delante cada ejercicio. */
    sesiones.forEach(function (ses) { sanear(ses, edad.calentamiento); });
    cuadrarVolumen(sesiones, objetivoSeries, minutos, edad.calentamiento);
    /* Con la función a pelo, forEach le pasa además el índice, y desde que
       titular() tiene un segundo parámetro eso valía «forzar» a partir del
       segundo día: la mitad de los planes perdieron su «Tren superior» y
       «Cuerpo completo B» sin que nadie lo pidiera. */
    sesiones.forEach(function (ses) { titular(ses); });

    /* Las dos cuentas se rehacen sobre el plan ya cuadrado: las de antes eran
       de un plan que ya no existe. */
    Object.keys(volumen).forEach(function (m) { delete volumen[m]; });
    Object.keys(directas).forEach(function (m) { delete directas[m]; });
    sesiones.forEach(function (ses) {
      ses.ejercicios.forEach(function (e) {
        const ex = Data.get(e.exId);
        if (ex) sumarVolumen(volumen, ex, e.musculo, e.sets, directas);
      });
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
      return (directas[m] || 0) < Math.min(VOLUMEN_MIN, metaDe(m, objetivoSeries));
    });   /* en crudo: el nombre del musculo se traduce al leerlo, no aqui */

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
      directas: directas,
      objetivoSeries: objetivoSeries,
      lesiones: claves.map(function (k) { return LESIONES[k].label; }),
      real: real,
      razones: razones(p, obj, edad, sexo, experiencia, objetivoSeries, dias.length,
        plantillas, cortos, minutos, volumen, real),
      avisos: r.notas.concat(edad.notas, avisoDeMaterial(sinCubrir, gear)),
      progresion: progresion(obj, r.sinMaximos, sesiones),
      cardio: obj.cardio ? cardioTexto(p) : null,
      sinCubrir: sinCubrir
    };
  }

  /* Los ejercicios de un mismo músculo, seguidos.

     Las plantillas alternan a propósito —pecho, espalda, hombro, dorsal— y eso
     salía a la hoja tal cual: press, jalón, press, remo. Para fuerza es
     defendible, porque cada músculo descansa más entre series. Para
     hipertrofia, que es a lo que viene casi todo el mundo, es peor: se pierde
     la congestión y el segundo ejercicio de pecho empieza de cero.

     Se agrupa respetando dos cosas: el primer ejercicio de la sesión sigue
     siendo el más pesado —se entra fresco al básico— y dentro de cada músculo
     va antes el compuesto que el aislamiento. El orden de los músculos lo
     marca su primer ejercicio, que es el que la plantilla puso delante por
     algo. */
  /* Por GRUPO y no por músculo. Dorsal y espalda media son dos músculos
     distintos en el catálogo y la misma espalda en el gimnasio: agrupando por
     músculo, una dominada y un remo seguían saliendo separados por un press de
     hombro en medio, que es justo lo que rompe la congestión. Dentro del
     grupo, primero los compuestos y después el aislamiento. */
  function grupoDe(musculo) {
    const gr = (g.I18N && I18N.GROUPS || []).filter(function (x) {
      return (x.muscles || []).indexOf(musculo) !== -1;
    })[0];
    return gr ? gr.id : musculo || '';
  }

  /* De qué grupo es un ejercicio de la lista. En un plan recién montado el
     músculo viene escrito en el hueco; en una rutina guardada a mano no hay
     más que el id, así que se saca del catálogo. La misma función tiene que
     servir para los dos o volvemos a tener dos criterios. */
  function grupoDeEjercicio(e) {
    if (e.musculo) return grupoDe(e.musculo);
    const ex = Data.get(e.exId);
    return grupoDe(((ex && ex.primaryMuscles) || [])[0] || '');
  }

  function agruparPorMusculo(ejercicios) {
    /* Dos bloques, y dentro de cada uno agrupado por grupo muscular: primero
       todo lo compuesto y luego todo el aislamiento.

       Agrupar a secas dejaba una apertura de pecho por delante de un press
       militar, que es cambiar un problema por otro: se gana congestión y se
       pierde el básico fresco. Así se cumplen las dos cosas —los dos de
       espalda seguidos, luego los empujes, y el aislamiento al cierre— que es
       como se escribe un día de gimnasio de toda la vida. */
    const bloque = function (lista) {
      const orden = [];
      const grupos = {};
      lista.forEach(function (e) {
        const k = grupoDeEjercicio(e);
        if (!grupos[k]) { grupos[k] = []; orden.push(k); }
        grupos[k].push(e);
      });
      const salida = [];
      orden.forEach(function (k) {
        grupos[k].sort(function (a, b) {
          return (a.rol === 'principal' ? 0 : 1) - (b.rol === 'principal' ? 0 : 1);
        });
        grupos[k].forEach(function (e) { salida.push(e); });
      });
      return salida;
    };

    const compuesto = function (e) {
      const ex = Data.get(e.exId);
      return !!(ex && ex.mechanic === 'compound');
    };
    return bloque(ejercicios.filter(compuesto))
      .concat(bloque(ejercicios.filter(function (e) { return !compuesto(e); })));
  }

  /* El brazo no cojea de un lado. Si la sesión lleva tríceps directo y no
     bíceps —o al revés— queda un día de torso con medio brazo, que se ve a
     simple vista en la hoja y resta confianza en todo lo demás. Se mira al
     final, cuando ya se sabe qué ha sobrevivido al recorte. */
  function equilibrarBrazo(ses, ctx, obj, sexo, minutos, calentamiento) {
    const tiene = function (m) {
      return ses.ejercicios.some(function (e) { return e.musculo === m; });
    };
    /* Solo en los días de torso completo. En un día de empuje el bíceps no
       pinta nada y en uno de tirón el tríceps tampoco: ahí el equilibrio se
       mide en la semana, no en la sesión. Sin esta condición aparecía un
       «fondo para tríceps» detrás de tres curls en el día de espalda, que es
       peor que el problema que venía a resolver. */
    const empuja = ses.ejercicios.some(function (e) {
      return e.musculo === 'chest' || e.musculo === 'shoulders';
    });
    const tira = ses.ejercicios.some(function (e) {
      return e.musculo === 'lats' || e.musculo === 'middle back';
    });
    if (!empuja || !tira) return;

    const falta = tiene('triceps') && !tiene('biceps') ? 'biceps'
      : tiene('biceps') && !tiene('triceps') ? 'triceps' : '';
    if (!falta) return;
    const hueco = h(falta === 'biceps' ? P.cbi : P.etr, falta, 'accesorio');
    const ex = elegir(hueco, ctx);
    if (!ex) return;
    const cfg = obj.accesorio;
    const candidato = {
      exId: ex.id, patron: hueco.patron, musculo: falta, rol: 'accesorio',
      sets: cfg.series, reps: repsRedondas(cfg.reps + sexo.repsExtra),
      repsMin: repsAbajo(repsRedondas(cfg.reps + sexo.repsExtra)), weight: 0,
      rest: Math.round(cfg.rest * sexo.descanso / 5) * 5,
      note: T('Entra para que el brazo lleve lo mismo por los dos lados.')
    };
    const prueba = ses.ejercicios.concat([candidato]);
    if (duracion(prueba, calentamiento) > minutos) return;
    ctx.usados[ex.id] = true;
    ses.ejercicios = prueba;
    ses.minutos = duracion(prueba, calentamiento);
  }

  /* ---------- cuadrar el plan con lo que se buscaba ----------

     Hasta aquí el plan sale de las plantillas y del tiempo, y el objetivo de
     series por semana solo servía para escribirlo en la ficha: se calculaba
     quince y se generaban tres de tríceps. Un número que no manda sobre nada
     es decoración.

     Esto lo cierra. Mientras haya un músculo por debajo de lo suyo y quepa en
     el tiempo que has dicho, se le sube una serie al ejercicio que menos lleve.
     Se sube de uno en uno y siempre al más necesitado, que es como se reparte
     algo escaso sin que se lo lleve el primero de la lista. */

  /* Lo que de verdad necesita cada músculo. Un gemelo no pide lo mismo que un
     cuádriceps, y pedirle al plan que iguale a todos gasta el tiempo en lo que
     menos lo nota. */
  const PEQUENOS = ['calves', 'abdominals', 'forearms', 'traps', 'lower back',
    'adductors', 'abductors'];

  function metaDe(musculo, meta) {
    /* Seis series bastan para un gemelo o un lumbar, que además trabajan en
       cada sentadilla y en cada peso muerto. Pedirles las mismas quince que a
       un cuádriceps gasta el tiempo donde menos se nota y deja el plan
       avisando de un problema que no existe. */
    return PEQUENOS.indexOf(musculo) !== -1
      ? Math.max(6, Math.round(meta * 0.5)) : meta;
  }

  /* Cuántas series puede llegar a llevar un ejercicio después de cuadrar el
     volumen. Es una serie por encima de lo que pide su rol, y no un tope
     único para todos.

     Con un tope único de cinco, cuadrar el volumen llenaba el día entero
     hasta arriba y el martes salía 5-5-5-5-5-4: veintinueve series, y cinco de
     ellas de curl martillo. La forma se perdía —un día plano no es un día que
     baja— y el número dejaba de ser creíble, porque a nadie le pone su
     entrenador cinco series de curl martillo.

     Así el básico puede llegar a cinco y el accesorio a cuatro, que es el
     margen que de verdad hay, y el volumen que falte se busca en otro día o
     se queda sin cubrir y el auditor lo dice.

     Probé dejar que el accesorio de delante llegara también a cinco cuando el
     anterior lleva cinco —la forma seguía bajando, así que era gratis— y
     medí: sesenta y tres series más en los 144 planes, misma nota y los
     mismos músculos cortos. No lo compraba nada, así que fuera: un
     condicional que no mueve ningún número es deuda. */
  function topeDe(e) {
    return e.rol === 'principal' ? 5 : 4;
  }

  /* Los que comprimen la columna con el peso encima. Misma lista que usa el
     auditor: si cada uno tiene la suya, acaban discutiendo. */
  const AXIALES_PROG = ['sentadilla', 'bisagra de cadera'];

  /* Los patrones que no pueden faltar en una semana. Al recortar por tiempo se
     quitaba el único ejercicio de bisagra de cadera que había, y un plan sin
     bisagra deja el femoral y el glúteo sin nada por mucho que cuadren las
     series. */
  const FUNDAMENTALES = ['sentadilla', 'bisagra de cadera', 'empuje horizontal',
    'empuje vertical', 'traccion horizontal', 'traccion vertical'];

  /* La hoja se lee de arriba abajo y va de más a menos.

     Agrupar por músculo puede dejar un básico detrás de un accesorio
     compuesto —un press de hombros a cuatro series después de un jalón a
     tres— y entonces el día sube al final, que es justo lo contrario de lo
     que pasa en el gimnasio: a la séptima serie se llega más cansado que a la
     primera, y la hoja tiene que decirlo.

     Baja lo que sobresale, nunca por debajo de las tres series del accesorio,
     y se hace ANTES de cuadrar el volumen para que las series que suelta se
     coloquen en otro sitio en lugar de perderse. */
  function bajarEscalones(ses, calentamiento) {
    for (let i = 1; i < ses.ejercicios.length; i++) {
      const e = ses.ejercicios[i];
      const previo = ses.ejercicios[i - 1].sets;
      if (e.sets > previo) e.sets = Math.max(3, previo);
    }
    ses.minutos = duracion(ses.ejercicios, calentamiento);
  }

  /* Qué hay que subir para darle una serie más al ejercicio número i sin que
     la hoja deje de bajar. Devuelve la lista de ejercicios a subir, o null si
     no se puede.

     Hace falta porque la cola de un día es plana a propósito —los accesorios
     van todos a tres— y en una cola plana ningún ejercicio puede crecer solo:
     a cada uno lo frena el de delante, que lleva lo mismo. Medí el efecto en
     un plan de cuatro días y setenta y cinco minutos: bíceps, tríceps y
     abdomen se quedaban en seis series de quince con el día a 67 minutos de
     75 y ningún ejercicio en su tope. Sitio había; lo que no había era forma
     de usarlo.

     Así que se sube el bloque entero: el ejercicio y todos los de delante que
     lleven lo mismo. Sale más caro en minutos y arregla varios músculos de
     una vez, que es exactamente lo que hace alguien con una hora y cuarto y un
     plan de cuatro días. */
  function bloqueQueSube(ses, i) {
    const objetivo = ses.ejercicios[i].sets + 1;
    const lista = [];
    for (let k = i; k >= 0; k--) {
      const e = ses.ejercicios[k];
      /* En cuanto uno ya lleva lo que queremos, la forma se mantiene sola. */
      if (e.sets >= objetivo) break;
      if (e.sets + 1 > topeDe(e)) return null;
      lista.push(e);
    }
    return lista.length ? lista : null;
  }

  /* ---------- las reglas de cómo se escribe una hoja ----------

     Da igual quién haya elegido los ejercicios —la calculadora o la IA—: en
     qué orden van, cómo bajan las series y cómo se escriben las
     repeticiones es regla, no opinión. Tenerlo en dos sitios era tenerlo mal
     en uno de los dos, y así fue: el plan montado con IA se quedó sin nada de
     esto —sin rango, sin escala, sin forma y sin filtro— y acabó siendo el
     que peor se leía de los tres caminos.

     Va en dos trozos porque entre uno y otro hay que cuadrar el volumen:
     sanear necesita ir antes —cuadrar no sabe bajar si no sabe el orden— y
     el título después, cuando la hoja ya no se mueve. */
  function sanear(ses, calentamiento) {
    (ses.ejercicios || []).forEach(function (e) {
      const ex = Data.get(e.exId);
      /* Los estáticos llevan segundos, no repeticiones: ni se redondean ni
         llevan rango. */
      if (ex && ex.force === 'static') { e.repsMin = 0; return; }
      e.reps = repsRedondas(e.reps);
      e.repsMin = repsAbajo(e.reps);
    });
    ses.ejercicios = agruparPorMusculo(ses.ejercicios || []);
    bajarEscalones(ses, calentamiento);
    return ses;
  }

  /* forzar: que el nombre salga sí o sí de los músculos, sin dejar que mande
     el de la plantilla. Lo usa el plan montado con IA, donde la plantilla no es
     una plantilla sino lo que a la IA le pareció llamar al día. */
  function titular(ses, forzar) {
    ses.zonas = zonasDeSesion(ses.ejercicios, forzar);
    ses.nombre = nombreSesion(ses);
    return ses;
  }

  function cuadrarVolumen(sesiones, meta, minutos, calentamiento) {
    /* Los sitios donde ya se probó y no cabía, para no volver a intentarlo en
       cada vuelta. */
    const vetados = {};
    /* Hasta cincuenta ajustes: con una sesión llena el bucle se para solo
       mucho antes, y el tope está para que un plan raro no lo deje colgado. */
    for (let vuelta = 0; vuelta < 50; vuelta++) {
      const directas = {};
      sesiones.forEach(function (ses) {
        ses.ejercicios.forEach(function (e) {
          const ex = Data.get(e.exId);
          ((ex && ex.primaryMuscles && ex.primaryMuscles.length)
            ? ex.primaryMuscles : [e.musculo]).forEach(function (m) {
              directas[m] = (directas[m] || 0) + e.sets;
            });
        });
      });

      /* Los más cortos respecto a lo suyo, no los más cortos en absoluto, y
         por orden de falta.

         Antes se cogía solo el peor y, si a ese no se le podía sumar nada, el
         bucle se paraba del todo: un músculo sin hueco dejaba sin cuadrar a
         los otros once. Ahora si el peor no tiene dónde crecer se prueba el
         siguiente, y solo se para cuando no cabe una serie en ninguna parte. */
      const faltan = Object.keys(directas).map(function (m) {
        return { m: m, d: metaDe(m, meta) - directas[m] };
      }).filter(function (x) { return x.d > 0; })
        .sort(function (a, b) { return b.d - a.d; });
      if (!faltan.length) return;

      /* Dónde sumarle la serie: en la sesión que aún tenga hueco de tiempo, y
         dentro de ella en el ejercicio de ese músculo que menos series lleve.
         Así crece el accesorio antes que el básico, que es lo sensato: cinco
         series de sentadilla pesada no se llevan igual que cinco de curl. */
      let mejor = null;
      faltan.some(function (f) {
        sesiones.forEach(function (ses) {
          if (ses.minutos >= minutos) return;
          ses.ejercicios.forEach(function (e, i) {
            const ex = Data.get(e.exId);
            const suyos = (ex && ex.primaryMuscles && ex.primaryMuscles.length)
              ? ex.primaryMuscles : [e.musculo];
            if (suyos.indexOf(f.m) === -1) return;
            if (vetados[ses.dia + '|' + i]) return;
            const bloque = bloqueQueSube(ses, i);
            if (!bloque) return;
            if (!mejor || e.sets < mejor.e.sets) {
              mejor = { ses: ses, i: i, e: e, bloque: bloque };
            }
          });
        });
        return !!mejor;
      });
      if (!mejor) return;

      mejor.bloque.forEach(function (e) { e.sets++; });
      mejor.ses.minutos = duracion(mejor.ses.ejercicios, calentamiento);
      /* Si al sumarla se pasa del tiempo, se deshace y se veta ESE sitio, no
         el plan entero.

         Antes aquí había un return y cuadrar se paraba del todo en cuanto un
         sitio no cabía, aunque en otro día sobrara media hora. Un bloque de
         tres cuesta tres series; a lo mejor no cabe, y el de al lado de una sí. */
      if (mejor.ses.minutos > minutos) {
        mejor.bloque.forEach(function (e) { e.sets--; });
        mejor.ses.minutos = duracion(mejor.ses.ejercicios, calentamiento);
        vetados[mejor.ses.dia + '|' + mejor.i] = true;
      }
    }
  }

  /* Y al revés: lo que no cabe, se recorta. Pedías treinta minutos y salía una
     sesión de cuarenta y siete, porque el suelo de cuatro ejercicios y el
     calentamiento mandaban por encima de lo que habías pedido. Primero se
     quitan series a los accesorios, que es lo que menos duele, y solo después
     se quita el último accesorio entero. Nunca se baja de tres ejercicios ni
     se tocan los principales: por debajo de eso ya no es una sesión corta,
     es otra cosa. */
  function recortarATiempo(ses, minutos, calentamiento) {
    let guarda = 0;
    while (ses.minutos > minutos && guarda++ < 60) {
      const accesorios = ses.ejercicios.filter(function (e) { return e.rol === 'accesorio'; });
      /* El orden importa, y es este: primero se le quita una serie al
         accesorio más cargado, luego se va un accesorio entero, y solo cuando
         ya no queda ninguno se tocan los básicos. Al revés salían siete
         ejercicios con el press de banca a tres series, cuando con seis el
         press se queda a cuatro: lo que sobra en una sesión apretada es el
         séptimo ejercicio, no la cuarta serie del básico. */
      const bajables = accesorios.filter(function (e) { return e.sets > 3; });
      if (bajables.length) {
        bajables.sort(function (a, b) { return b.sets - a.sets; });
        bajables[0].sets--;
      } else if (accesorios.length && ses.ejercicios.length > 3) {
        /* Se va el segundo ejercicio del músculo que más lleve en la sesión,
           no el último de la lista: por el final estaban el gemelo y el
           abdominal, que son los que nadie entrena si se les quita el sitio. */
        const cuantos = {};
        ses.ejercicios.forEach(function (e) {
          cuantos[e.musculo] = (cuantos[e.musculo] || 0) + 1;
        });
        /* Y nunca el único de un patrón fundamental: con dos días y poco
           tiempo, el recorte se llevaba la bisagra de cadera y el plan salía
           sin nada de femoral ni de glúteo. Si no queda otra cosa que quitar,
           entonces sí, pero es el último de la fila. */
        const porPatron = {};
        ses.ejercicios.forEach(function (e) {
          porPatron[e.patron] = (porPatron[e.patron] || 0) + 1;
        });
        const prescindible = function (e) {
          return FUNDAMENTALES.indexOf(e.patron) === -1 || porPatron[e.patron] > 1;
        };
        const orden = accesorios.slice().sort(function (a, b) {
          const pa = prescindible(a) ? 0 : 1;
          const pb = prescindible(b) ? 0 : 1;
          if (pa !== pb) return pa - pb;
          return (cuantos[b.musculo] || 0) - (cuantos[a.musculo] || 0) ||
            ses.ejercicios.indexOf(b) - ses.ejercicios.indexOf(a);
        });
        const fuera = orden[0];
        /* Si lo único que queda por quitar es el único ejercicio de un
           patrón fundamental, antes que amputarlo se le bajan series a los
           básicos. Con un día a la semana y descansos de fuerza, recortar
           por ejercicios dejaba la sesión sin tirón horizontal ni empuje
           vertical: seis patrones a tres series valen más que tres patrones
           a cinco cuando solo entrenas una vez. */
        if (!prescindible(fuera) &&
            ses.ejercicios.some(function (e) { return e.sets > 3; })) {
          const altos = ses.ejercicios.filter(function (e) { return e.sets > 3; })
            .sort(function (a, b) { return b.sets - a.sets; });
          altos[0].sets--;
        } else {
          ses.ejercicios.splice(ses.ejercicios.indexOf(fuera), 1);
        }
      } else if (ses.ejercicios.some(function (e) { return e.sets > 3; })) {
        /* Media hora de verdad: con tres ejercicios y nada que quitar, lo que
           queda es bajar de cuatro series a tres. Una sesión que cabe es la
           que se hace. */
        const altos = ses.ejercicios.filter(function (e) { return e.sets > 3; })
          .sort(function (a, b) { return b.sets - a.sets; });
        altos[0].sets--;
      } else {
        break;
      }
      ses.minutos = duracion(ses.ejercicios, calentamiento);
    }
  }

  /* Volumen efectivo: el músculo que trabaja de verdad suma la serie entera y
     el que ayuda suma media. Contar solo el objetivo del hueco deja el tríceps
     a cero aunque se hayan hecho doce series de press. */
  /* Dos cuentas, no una. El total mezcla lo que un músculo entrena a propósito
     con lo que le cae de rebote —media serie por cada vez que aparece como
     secundario—, y el hombro aparece de secundario en todos los press. Así, un
     plan con 13 series de hombro sale como 28,5 y cualquiera que lea ese número
     concluye que sobra hombro. Las directas son las que deciden si un músculo
     está bien servido; el total sigue valiendo para la gráfica de reparto. */
  function sumarVolumen(volumen, ex, musculo, series, directas) {
    const directos = (ex.primaryMuscles || []).length ? ex.primaryMuscles : [musculo];
    directos.forEach(function (m) {
      volumen[m] = (volumen[m] || 0) + series;
      if (directas) directas[m] = (directas[m] || 0) + series;
    });
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

  /* Sin traducir: la nota se guarda con la rutina y vive años. Traducida aquí
     se quedaba en el idioma del día en que se generó el plan, así que un plan
     hecho en inglés seguía en inglés con la app en castellano. La frase en
     castellano es la clave; quien la pinta la pasa por T(). */
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

  /* ---------- una frase guardada sin resolver ----------
     El plan vive en el dispositivo y se lee en el idioma que haya PUESTO ESE
     DÍA, no en el que había al generarlo. Por eso lo que se guarda es la frase
     en español —que es la clave— y sus valores aparte.

     Un valor puede ser un número o un texto tal cual, otra frase de estas
     —{ t, v }— para lo que también hay que traducir, o una de las tres cajas
     que resuelve leer(): un decimal, una lista de músculos, o un millar. */
  function frase(t, v) { return { t: t, v: v || {} }; }

  function leer(x) {
    if (x == null) return '';
    if (typeof x === 'string') return T(x);
    if (typeof x === 'number') return String(x);
    if (Array.isArray(x)) return x.map(leer).join(', ');
    if (x.dec !== undefined) return UI.dec(x.dec);
    if (x.miles !== undefined) return UI.num(x.miles);
    if (x.musculos) {
      return x.musculos.map(function (m) { return I18N.muscle(m).toLowerCase(); }).join(', ');
    }
    if (x.flojos) {
      return x.flojos.map(function (f) {
        return Tn(f.tiene === 1
          ? '{mus} ({n} serie por semana, el plan te pide {pide})'
          : '{mus} ({n} series por semana, el plan te pide {pide})',
          { mus: I18N.muscle(f.mus).toLowerCase(), n: UI.dec(f.tiene),
            pide: UI.dec(f.pide) });
      }).join('; ');
    }
    if (!x.t) return '';
    const v = {};
    Object.keys(x.v || {}).forEach(function (k) { v[k] = leer(x.v[k]); });
    return Tn(x.t, v);
  }

  function razones(p, obj, edad, sexo, experiencia, series, ndias, plantillas, cortos, minutos, volumenPlan, real) {
    const out = [];
    const nivel = { beginner: 'Principiante', intermediate: 'Intermedio', expert: 'Avanzado' };

    out.push(frase('Objetivo: {obj}. {resumen}',
      { obj: obj.label, resumen: obj.resumen }));

    out.push(frase('Nivel {nivel}: el plan apunta a unas {series} series semanales por ' +
      'músculo, que es donde está el mejor equilibrio entre estímulo y recuperación.',
      { nivel: nivel[experiencia] || 'Intermedio', series: series }));

    const unicas = plantillas.filter(function (x, i, a) { return a.indexOf(x) === i; }).length;
    out.push(frase(ndias === 1
      ? '{dias} día a la semana con {unicas} sesiones distintas: así cada músculo recibe ' +
        'dos estímulos por semana, que rinde más que machacarlo una vez.'
      : '{dias} días a la semana con {unicas} sesiones distintas: así cada músculo recibe ' +
        'dos estímulos por semana, que rinde más que machacarlo una vez.',
      { dias: ndias, unicas: unicas }));

    if (p.edad) {
      out.push(edad.factor < 1
        ? frase('{edad} años: se recorta el volumen un {pct}% y se para en RPE {rpe}, ' +
            'dejando repeticiones en recámara.',
            { edad: p.edad, pct: Math.round((1 - edad.factor) * 100), rpe: edad.rpe })
        : frase('{edad} años: volumen completo, sin recortes por edad.', { edad: p.edad }));
    }

    if (sexo.notas.length) out.push(sexo.notas[0]);

    if (p.peso && p.altura && obj.label.indexOf('grasa') !== -1) {
      const m = Perfil.macros();
      if (m) {
        out.push(frase('Con tu perfil salen {kcal} kcal y {prot} g de proteína al día: ' +
          'sin ese déficit y esa proteína, el gimnasio solo no baja la grasa.',
          { kcal: m.kcal, prot: m.prot }));
      }
    }
    if (p.peso && obj.label.indexOf('Ganar') === 0) {
      const m = Perfil.macros();
      if (m) {
        out.push(frase('Para ganar músculo hacen falta {kcal} kcal y {prot} g de proteína ' +
          'al día: el estímulo lo pone el plan, el material lo pone la comida.',
          { kcal: m.kcal, prot: m.prot }));
      }
    }
    if (p.sueño && p.sueño < 7) {
      out.push(frase('Duermes {h} h: por debajo de 7 la recuperación se resiente y el ' +
        'plan rinde menos de lo que puede. Es la palanca más barata que tienes.',
        { h: p.sueño }));
    }

    /* Lo que sale de sus propios entrenamientos. Sin esto el análisis describe
       un perfil —hombre, 28, intermedio— y no a alguien concreto, que es lo que
       hace que suene a plantilla por mucho que los números salgan de sus datos. */
    if (real) {
      const porSemana = Math.round(real.sesiones / real.semanas * 10) / 10;
      if (porSemana + 0.6 < ndias) {
        out.push(frase('En el último mes has entrenado {hechos} días por semana y este ' +
          'plan pide {pide}. O bajas los días y los cumples, o el plan se queda en papel: ' +
          'vale más un plan de tres días hecho que uno de cinco a medias.',
          { hechos: { dec: porSemana }, pide: ndias }));
      }

      const flojos = olvidados(volumenPlan || {}, real);
      if (flojos.length) {
        out.push(frase('Lo que vienes dejando de lado: {lista}. Ahí es donde este plan te ' +
          'va a cambiar algo.',
          { lista: { flojos: flojos.slice(0, 3).map(function (m) {
            return { mus: m, tiene: real.porMusculo[m] || 0, pide: volumenPlan[m] };
          }) } }));
      }
    } else {
      out.push('Todavía no tienes entrenamientos guardados, así que el plan sale solo de ' +
        'tu perfil. En cuanto entrenes unas semanas, este análisis mira lo que de verdad ' +
        'haces y deja de hablar en general.');
    }

    /* La aritmética del tiempo: en una hora no caben veinte series por músculo,
       y es mejor decirlo que repartir migajas y llamarlo programa. */
    if (cortos && cortos.length) {
      out.push(frase(cortos.length > 4
        ? 'Con {dias} días de {min} min no da tiempo a todo: {lista} y alguno más se ' +
          'quedan por debajo de 8 series semanales. Si te importan, añade 15 min a la ' +
          'sesión, otro día, o priorízalos con el selector de zona.'
        : 'Con {dias} días de {min} min no da tiempo a todo: {lista} se quedan por debajo ' +
          'de 8 series semanales. Si te importan, añade 15 min a la sesión, otro día, o ' +
          'priorízalos con el selector de zona.',
        { dias: ndias, min: minutos, lista: { musculos: cortos.slice(0, 4) } }));
    }
    return out;
  }

  /* ---------- 9. Progresión: sin esto no hay resultados ---------- */
  /* La progresión, con los números de TU plan.

     Antes eran cinco párrafos fijos, iguales para todo el mundo: «añade una
     serie», «sube un 2 o un 5%». Eso describe una progresión, no la da. Quien
     lo lee tiene que traducirlo a su plan cada semana, y lo que no se traduce
     solo no se hace. Ahora cada semana dice las series que tocan y sobre qué
     ejercicio, sacadas del plan recién montado. */
  function progresion(obj, prudente, sesiones) {
    const princ = obj.principal.series;
    const acc = obj.accesorio.series;
    /* El básico que abre el plan sirve de ejemplo: es el que todo el mundo
       reconoce de su propia hoja. */
    let ejemplo = '';
    let repsP = obj.principal.reps;
    (sesiones || []).some(function (ses) {
      return (ses.ejercicios || []).some(function (e) {
        if (e.rol !== 'principal') return false;
        const ex = Data.get(e.exId);
        if (!ex) return false;
        ejemplo = ex.nameEs || ex.name || '';
        repsP = e.reps;
        return true;
      });
    });

    const conEjemplo = function (txt, series) {
      return ejemplo ? txt + ' ' + Tn('En tu plan: {ej} a {s}x{r}.',
        { ej: ejemplo, s: series, r: repsP }) : txt;
    };

    return [
      { semana: 'Semana 1', texto: conEjemplo(prudente
        ? T('Las series y los pesos que trae el plan. Coge cargas con las que acabes ' +
          'todas las series con la técnica limpia, nunca al fallo, y apúntalas: sin el ' +
          'peso de esta semana no hay con qué comparar las siguientes.')
        : T('Las series y los pesos que trae el plan. Coge cargas con las que acabes ' +
          'todas las series dejando 1 o 2 repeticiones en recámara, y apúntalas: sin el ' +
          'peso de esta semana no hay con qué comparar las siguientes.'), princ) },
      { semana: 'Semana 2', texto: conEjemplo(T('Las mismas series y el mismo peso, una ' +
        'repetición más en cada una. Cuando todas lleguen arriba del rango, el peso sube ' +
        'la semana que viene.'), princ) },
      { semana: 'Semana 3', texto: conEjemplo(Tn('La más dura: una serie más en los ' +
        'básicos —de {a} a {b}— o entre un 2 y un 5% de peso. Una cosa o la otra, no las ' +
        'dos.', { a: princ, b: princ + 1 }), princ + 1) },
      { semana: 'Semana 4', texto: conEjemplo(Tn('Descarga: los mismos ejercicios a {a} ' +
        'series los básicos y {b} los accesorios, con un 10% menos de peso. No es perder ' +
        'una semana, es cuando el cuerpo consolida lo que llevas.',
        { a: Math.max(2, Math.round(princ / 2)), b: Math.max(1, Math.round(acc / 2)) }),
        Math.max(2, Math.round(princ / 2))) },
      { semana: 'Semana 5', texto: conEjemplo(T('Vuelta a empezar con los pesos de la ' +
        'semana 3 y las series del principio. Si ya no suben dos semanas seguidas, cambia ' +
        'los accesorios y repite el bloque.'), princ) }
    ];
  }

  function cardioTexto(p) {
    return frase('Además del gimnasio: {pasos} pasos al día y dos sesiones de 25 a 35 min ' +
      'de cardio suave (el que te deje hablar) en los días que no entrenes. El cardio duro ' +
      'y el gimnasio el mismo día se pisan.',
      { pasos: { miles: p.actividad === 'sedentario' ? 8000 : 10000 } });
  }

  /* El nombre de una sesión, en el idioma de ahora. El día y la plantilla
     viajan aparte dentro de la sesión, así que se rehace al leerlo; si viene de
     un plan viejo que no los lleva, se usa lo que se guardó. */
  /* El nombre del día, dicho en músculos.

     «Empuje» y «Tracción» es como se llaman los patrones por dentro, pero
     fuera no dicen nada: hay que saber de gimnasio para traducir «tracción»
     a «espalda y bíceps». Y el nombre del día es lo primero que se lee de la
     hoja, y en el calendario es lo único que se ve.

     Se saca de lo que hay colocado y no de la plantilla, así que no puede
     mentir: si el día acabó sin tríceps porque no cabía, no lo nombra. El
     orden es el de la propia hoja —manda el primer ejercicio de cada
     músculo—, que es el que ya decidió agruparPorMusculo.

     Bíceps y tríceps van sueltos en vez de como «brazo»: «espalda y bíceps»
     es como se llama ese día en todas partes, y «espalda y brazo» no.

     Con más de tres zonas se queda el nombre de la plantilla: «Pecho,
     espalda, hombro, bíceps y tríceps» no es un nombre, es un inventario, y
     para eso ya está «Tren superior», que se entiende sin saber jerga. */
  const ZONA_SUELTA = { biceps: 1, triceps: 1 };

  function zonasDeSesion(ejercicios, forzar) {
    const vistas = [];
    const series = {};
    (ejercicios || []).forEach(function (e) {
      const z = ZONA_SUELTA[e.musculo] ? e.musculo : grupoDe(e.musculo);
      if (!z) return;
      series[z] = (series[z] || 0) + (Number(e.sets) || 0);
      if (vistas.indexOf(z) === -1) vistas.push(z);
    });
    if (!vistas.length) return null;
    if (vistas.length <= 3) return vistas;
    /* Con más de tres, normalmente se deja el nombre de la plantilla: «Tren
       superior» se entiende y es verdad.

       Pero cuando la plantilla la ha escrito la IA, ese nombre es prosa suya y
       sí puede mentir: devolvió un «Descanso Activo» de cinco ejercicios y
       dieciocho series. Ahí se fuerza el nombre a las tres zonas con más
       series, que siempre es verdad aunque se deje algo fuera. */
    if (!forzar) return null;
    return vistas.slice().sort(function (a, b) {
      return (series[b] || 0) - (series[a] || 0);
    }).slice(0, 3);
  }

  /* Se guardan las claves y se traducen al pintar, no al generar: si no, un
     plan hecho en español seguía en español al cambiar de idioma. */
  function etiquetaZona(z) {
    if (ZONA_SUELTA[z]) return I18N.muscle(z);
    const gr = ((g.I18N && I18N.GROUPS) || []).filter(function (x) {
      return x.id === z;
    })[0];
    return gr ? T(gr.label) : z;
  }

  function unirZonas(zonas) {
    const t = zonas.map(etiquetaZona);
    /* En medio de la frase va en minúscula, en los dos idiomas. */
    const baja = function (s) {
      return s ? s.charAt(0).toLocaleLowerCase() + s.slice(1) : s;
    };
    if (t.length === 1) return t[0];
    if (t.length === 2) return Tn('{a} y {b}', { a: t[0], b: baja(t[1]) });
    return Tn('{a}, {b} y {c}', { a: t[0], b: baja(t[1]), c: baja(t[2]) });
  }

  function nombreSesion(s) {
    if (!s) return '';
    if (!s.dia) return s.nombre || '';
    if (s.zonas && s.zonas.length) {
      return UI.diaLargo(s.dia) + ' · ' + unirZonas(s.zonas);
    }
    if (!s.plantilla) return s.nombre || '';
    return UI.diaLargo(s.dia) + ' · ' + T(s.plantilla);
  }

  /* ---------- 10. Pasar el programa a rutinas de la app ---------- */
  /* etiqueta: cómo quiere el usuario que se llamen. Vacío = el nombre del día. */
  function aRutinas(prog, etiqueta) {
    etiqueta = String(etiqueta || '').trim();
    return prog.sesiones.map(function (s) {
      return {
        id: null,
        name: etiqueta ? UI.diaLargo(s.dia) + ' · ' + etiqueta : nombreSesion(s),
        note: prog.objetivoLabel + ' · ' + prog.minutos + ' min · RPE ' + prog.rpe +
          ' · calienta ' + prog.calentamiento + ' min antes.',
        days: [s.dia],
        exercises: s.ejercicios.map(function (e) {
          return { exId: e.exId, sets: e.sets, reps: e.reps, repsMin: e.repsMin || 0,
            weight: 0, rest: e.rest, note: e.note };
        })
      };
    });
  }

  /* Vuelve a contar las series por músculo a partir de las sesiones tal y como
     estén ahora. Hace falta desde que se pueden añadir y quitar ejercicios a
     mano: si no, la barra de volumen seguía enseñando el plan recién nacido y
     no el que se va a entrenar. */
  /* El mismo criterio con el que se monta un plan, para quien necesite UN
     ejercicio suelto. El auditor proponía recambios con una heurística propia y
     elegía cosas como «Curl arrastrado» en lugar de «Curl con barra»: dos
     criterios distintos para la misma decisión acaban siempre discrepando, y el
     bueno es este, que lleva la preferencia curada por músculo. */
  function sugerir(o) {
    o = o || {};
    const p = Perfil.datos() || {};
    const experiencia = o.experiencia || p.experiencia || 'intermediate';
    const gear = Data.GEAR[o.gear] ? o.gear : (Store.settings().gear || 'gym');
    const r = restricciones(lesionesDe(p.lesiones));
    const edad = porEdad(p.edad);
    if (!edad.impacto) r.fuera['salto'] = true;

    const fuera = o.excluir || {};
    const ctx = {
      gear: gear === 'todo' ? 'gym' : gear,
      r: r,
      maxNivel: (NIVELES[experiencia] || 2) + (experiencia === 'beginner' ? 1 : 0),
      usados: fuera, delDia: fuera, variante: 0, hueco: 0
    };
    return elegir(h(o.patron || '', o.musculo || '', o.rol || 'accesorio'), ctx);
  }

  function revolumen(prog) {
    const volumen = {};
    const directas = {};
    prog.sesiones.forEach(function (ses) {
      ses.ejercicios.forEach(function (e) {
        const ex = Data.get(e.exId);
        if (ex) sumarVolumen(volumen, ex, e.musculo, e.sets, directas);
      });
    });
    Object.keys(volumen).forEach(function (m) {
      volumen[m] = Math.round(volumen[m] * 2) / 2;
    });
    prog.volumen = volumen;
    prog.directas = directas;
    return volumen;
  }

  g.Programa = {
    volumenReal: volumenReal, olvidados: olvidados, revolumen: revolumen,
    sugerir: sugerir,
    crear: crear, aRutinas: aRutinas, lesionesDe: lesionesDe,
    leer: leer, frase: frase, nombreSesion: nombreSesion,
    OBJETIVOS: OBJETIVOS, LESIONES: LESIONES,
    /* La vara con la que el generador decide si un músculo va corto. La exporta
       para que el auditor mida igual: con dos varas distintas, la app se
       suspendía a sí misma —sacaba seis series de gemelo porque le parecían
       bastantes y acto seguido las marcaba como fallo—. */
    metaDe: metaDe, VOLUMEN_MIN: VOLUMEN_MIN,
    /* La presta el auditor para arreglar rutinas que no ha montado él. */
    agruparSesion: agruparPorMusculo,
    /* Y estas, el plan montado con IA: elige ella los ejercicios, pero cómo se
       escribe la hoja lo manda la misma regla que a la calculadora. */
    sanear: sanear, titular: titular, esOlimpico: esOlimpico
  };
})(window);
