/* progresion.js — qué peso poner hoy.

   La app guardaba el peso de la última vez y lo dejaba puesto en la casilla.
   Eso no es progresar: es repetir. Y quien entrena en serio sube de peso
   cuando toca, no cuando se acuerda.

   Aquí se decide con lo que ya está apuntado —lo que levantaste la última vez,
   si completaste las repeticiones y cuántas veces seguidas te has quedado
   corto— y se dice antes de empezar la serie, no después.

   Sin IA y sin conexión: es una regla, no una opinión, y una regla tiene que
   dar siempre el mismo número. Lo que sí es opinión —cuándo cambiar de
   ejercicio, cuándo descargar una semana— lo sigue diciendo el entrenador. */
(function (g) {
  'use strict';

  /* Cuánto sube de golpe cada material. Una barra admite discos de 1,25 por
     lado, así que 2,5 es el salto real; un par de mancuernas del gimnasio va de
     dos en dos y no hay nada entre medias. Poner 2,5 en mancuernas es pedirle
     que invente un peso que no existe en la sala. */
  const SALTOS_KG = {
    barbell: 2.5,
    'e-z curl bar': 2.5,
    machine: 2.5,
    cable: 2.5,
    dumbbell: 2,
    kettlebells: 4,
    'medicine ball': 1,
    'exercise ball': 0,
    bands: 0,
    'body only': 0,
    'foam roll': 0,
    other: 2.5
  };

  /* En libras el gimnasio va de cinco en cinco, y las mancuernas de cinco
     también. Convertir 2,5 kg a 5,5 lb sería darle un número que no existe. */
  const SALTOS_LB = {
    barbell: 5,
    'e-z curl bar': 5,
    machine: 5,
    cable: 5,
    dumbbell: 5,
    kettlebells: 10,
    'medicine ball': 2.5,
    'exercise ball': 0,
    bands: 0,
    'body only': 0,
    'foam roll': 0,
    other: 5
  };

  /* Cuántas sesiones seguidas quedándose corto antes de bajar. Dos es normal
     —un mal día, poco sueño— y bajar ahí desanima por nada; tres seguidas ya
     no es mala suerte. */
  const FALLOS_PARA_BAJAR = 3;

  function salto(ex) {
    const lb = Store.settings().unit === 'lb';
    const tabla = lb ? SALTOS_LB : SALTOS_KG;
    const eq = (ex && ex.equipment) || 'other';
    const s = tabla[eq];
    return s === undefined ? (lb ? 5 : 2.5) : s;
  }

  function redondear(peso, paso) {
    if (!paso) return Math.round(peso * 10) / 10;
    return Math.round(peso / paso) * paso;
  }

  /* El peso de una sesión: el mayor de las series hechas. Quien hace 60, 60 y
     luego baja a 50 para sacar la última no ha entrenado a 50. */
  function pesoDe(sesion) {
    return (sesion.sets || []).reduce(function (m, s) {
      return Math.max(m, Number(s.weight) || 0);
    }, 0);
  }

  /* ¿Cumplió? Todas las series hechas llegando a las repeticiones pedidas, y
     al menos tantas series como pedía la rutina. */
  function cumplio(sesion, series, reps) {
    const hechas = (sesion.sets || []).filter(function (s) {
      return Number(s.reps) >= reps;
    });
    return hechas.length >= series && hechas.length === (sesion.sets || []).length;
  }

  /* ---------- lo que hay que decidir ----------
     Devuelve null cuando no hay nada que decir: sin historial, o con un
     ejercicio que no lleva peso. Inventar una sugerencia sin datos es peor que
     callarse. */
  function sugerir(exId, series, reps) {
    if (!g.Store || !g.Data) return null;
    const ex = Data.get(exId);
    const paso = salto(ex);

    const historia = Store.historyOf(exId);
    if (!historia.length) return null;

    const ultima = historia[0];
    const peso = pesoDe(ultima);

    /* Sin peso —peso corporal, bandas— la progresión es de repeticiones, y eso
       ya lo lleva la propia rutina. Aquí no hay nada que sumar. */
    if (!paso || !peso) return null;

    series = Math.max(1, Number(series) || (ultima.sets || []).length || 1);
    reps = Math.max(1, Number(reps) || 0);
    if (!reps) return null;

    if (cumplio(ultima, series, reps)) {
      return {
        peso: redondear(peso + paso, paso),
        anterior: peso,
        salto: paso,
        estado: 'sube',
        porque: 'La última vez sacaste las ' + series + ' series a ' + reps +
          '. Toca subir.'
      };
    }

    /* Cuántas veces seguidas se ha quedado corto con este mismo peso. Se mira
       hacia atrás hasta encontrar una sesión con otro peso o una que sí
       cumpliera: lo de antes de eso ya no cuenta. */
    let fallos = 0;
    for (let i = 0; i < historia.length; i++) {
      const s = historia[i];
      if (pesoDe(s) !== peso) break;
      if (cumplio(s, series, reps)) break;
      fallos++;
    }

    if (fallos >= FALLOS_PARA_BAJAR) {
      const menos = redondear(peso * 0.9, paso);
      return {
        peso: menos < paso ? paso : menos,
        anterior: peso,
        salto: paso,
        estado: 'baja',
        porque: 'Llevas ' + fallos + ' sesiones sin sacarlo. Baja, cógele la ' +
          'técnica y vuelve a subir.'
      };
    }

    return {
      peso: peso,
      anterior: peso,
      salto: paso,
      estado: 'repite',
      porque: fallos > 1
        ? 'Segunda vez que te quedas corto. Repite peso hasta sacarlo entero.'
        : 'Te quedaste corto la última vez. Repite peso y sácalo entero.'
    };
  }

  /* La frase corta, la que cabe en una pastilla al lado del ejercicio */
  function etiqueta(s) {
    if (!s) return '';
    if (s.estado === 'sube') return 'Sube a ' + UI.kg(s.peso);
    if (s.estado === 'baja') return 'Baja a ' + UI.kg(s.peso);
    return 'Repite ' + UI.kg(s.peso);
  }

  g.Progresion = {
    sugerir: sugerir, etiqueta: etiqueta,
    salto: salto, SALTOS_KG: SALTOS_KG, SALTOS_LB: SALTOS_LB
  };
})(window);
