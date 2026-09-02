/* ia.js — asistente opcional apoyado en Gemini (Google), que tiene capa gratuita.

   La clave se guarda solo en este navegador y nunca viaja al repositorio: la
   introduce el usuario en Ajustes, igual que la configuración de la cuenta.

   Todo lo que la app calcula por su cuenta (calorías, macros, rutinas) sigue
   funcionando sin clave; la IA añade explicación y planes redactados, no
   sustituye los cálculos. */
(function (g) {
  'use strict';

  const CFG = 'trainingfr.ia';
  const CACHE = 'trainingfr.ia.cache';
  const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
  const MODELOS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

  const INSTRUCCIONES =
    'Eres el entrenador personal de la aplicación Training FR. Respondes en español ' +
    'de España, en segunda persona, con frases cortas y concretas. Nada de rodeos ni ' +
    'de listas interminables. Te apoyas en los datos reales que te pasan y, si faltan, ' +
    'lo dices en lugar de inventarlos. No eres médico ni dietista titulado: cuando ' +
    'aparezca una condición de salud, una lesión, un embarazo o un trastorno de la ' +
    'conducta alimentaria, recomiendas consultar a un profesional en vez de improvisar. ' +
    'No propones dietas por debajo de las calorías que te indiquen ni pérdidas de peso ' +
    'agresivas. No usas emojis.';

  function config() {
    try { return JSON.parse(localStorage.getItem(CFG) || 'null') || {}; }
    catch (e) { return {}; }
  }

  function guardarConfig(clave, modelo) {
    clave = String(clave || '').trim();
    if (clave && clave.length < 20) throw new Error('Esa clave no parece válida.');
    localStorage.setItem(CFG, JSON.stringify({ clave: clave, modelo: modelo || MODELOS[0] }));
  }

  function borrarConfig() { localStorage.removeItem(CFG); localStorage.removeItem(CACHE); }
  function activa() { return !!config().clave; }

  /* ---------- caché, para no gastar cuota repitiendo la misma consulta ---------- */

  function cache() {
    try { return JSON.parse(localStorage.getItem(CACHE) || '{}'); } catch (e) { return {}; }
  }

  function leerCache(clave, horas) {
    const c = cache()[clave];
    if (!c) return null;
    if (Date.now() - c.t > (horas || 24) * 3600e3) return null;
    return c.v;
  }

  function escribirCache(clave, valor) {
    try {
      const c = cache();
      c[clave] = { t: Date.now(), v: valor };
      /* se conservan solo las diez últimas entradas */
      const claves = Object.keys(c).sort(function (a, b) { return c[b].t - c[a].t; });
      const recorte = {};
      claves.slice(0, 10).forEach(function (k) { recorte[k] = c[k]; });
      localStorage.setItem(CACHE, JSON.stringify(recorte));
    } catch (e) { /* cuota llena: no es crítico */ }
  }

  function limpiarCache() { localStorage.removeItem(CACHE); }

  /* ---------- llamada ---------- */

  function llamar(prompt, opciones) {
    opciones = opciones || {};
    const c = config();
    if (!c.clave) return Promise.reject(new Error('Falta la clave de la IA. Configúrala en Ajustes.'));

    const cuerpo = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
      generationConfig: {
        temperature: opciones.temperatura == null ? 0.7 : opciones.temperatura,
        maxOutputTokens: opciones.maxTokens || 2048
      }
    };
    if (opciones.json) cuerpo.generationConfig.responseMimeType = 'application/json';

    const modelos = c.modelo ? [c.modelo].concat(MODELOS.filter(function (m) { return m !== c.modelo; }))
      : MODELOS.slice();

    /* si el modelo elegido ya no existe, se prueba el siguiente */
    function intentar(i) {
      if (i >= modelos.length) return Promise.reject(new Error('Ningún modelo disponible respondió.'));
      return fetch(BASE + modelos[i] + ':generateContent?key=' + encodeURIComponent(c.clave), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo)
      }).catch(function () {
        throw new Error('No se pudo conectar con el servicio de IA.');
      }).then(function (r) {
        return r.text().then(function (t) {
          let j = null;
          try { j = JSON.parse(t); } catch (e) { j = null; }

          if (!r.ok) {
            const msg = (j && j.error && j.error.message) || ('Error ' + r.status);
            if (r.status === 404 && i < modelos.length - 1) return intentar(i + 1);
            if (r.status === 400 && /API key/i.test(msg)) throw new Error('La clave de la IA no es válida.');
            if (r.status === 429) throw new Error('Has agotado la cuota gratuita por ahora. Inténtalo más tarde.');
            throw new Error(msg);
          }

          const cand = j && j.candidates && j.candidates[0];
          const texto = cand && cand.content && cand.content.parts &&
            cand.content.parts.map(function (p) { return p.text || ''; }).join('');
          if (!texto) {
            if (cand && cand.finishReason === 'SAFETY') {
              throw new Error('La IA no pudo responder a esa petición.');
            }
            throw new Error('La IA devolvió una respuesta vacía.');
          }
          return texto.trim();
        });
      });
    }
    return intentar(0);
  }

  function llamarJSON(prompt, opciones) {
    return llamar(prompt, Object.assign({ json: true, temperatura: 0.4 }, opciones))
      .then(function (t) {
        try { return JSON.parse(t); }
        catch (e) {
          /* a veces envuelve el JSON en un bloque de código */
          const m = t.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (m) return JSON.parse(m[0]);
          throw new Error('La IA no devolvió datos con el formato esperado.');
        }
      });
  }

  /* ---------- contexto que se envía ---------- */

  function contexto(incluir) {
    incluir = incluir || {};
    const trozos = [];

    const p = Perfil.resumen();
    if (p) trozos.push('PERFIL: ' + p);

    if (incluir.objetivos !== false) {
      const o = Objetivos.resumen();
      if (o) trozos.push('OBJETIVOS: ' + o);
    }

    if (incluir.rutinas) {
      const r = Store.routines();
      if (r.length) {
        trozos.push('RUTINAS ACTUALES: ' + r.map(function (x) {
          return x.name + ' (' + (x.days || []).join('/') + '): ' +
            x.exercises.map(function (e) {
              const ex = Data.get(e.exId);
              return (ex ? ex.nameEs : e.exId) + ' ' + e.sets + 'x' + e.reps;
            }).join(', ');
        }).join(' | '));
      }
    }

    if (incluir.progreso) {
      const s = Store.stats();
      trozos.push('PROGRESO: ' + s.total + ' entrenamientos registrados, ' +
        s.week + ' esta semana, racha de ' + s.streak + ' días, ' +
        'volumen semanal ' + Math.round(s.weekVolume) + ' kg.');
      const t = Perfil.tendencia(30);
      if (t) {
        trozos.push('PESO: ' + (t.dif >= 0 ? '+' : '') + t.dif.toFixed(1) +
          ' kg en los últimos 30 días.');
      }
    }

    const gset = Data.GEAR[Store.settings().gear];
    if (gset) trozos.push('ENTRENA: ' + gset.label.toLowerCase() + ' (' + gset.note.toLowerCase() + ').');

    return trozos.join('\n');
  }

  /* ---------- usos concretos ---------- */

  /* Plan de alimentación semanal ajustado a las calorías ya calculadas */
  function planNutricion(opciones) {
    opciones = opciones || {};
    const m = Perfil.macros();
    if (!m) return Promise.reject(new Error('Completa tu perfil para calcular el plan.'));

    const clave = 'nutricion:' + JSON.stringify(m) + ':' + Perfil.datos().dieta +
      ':' + Perfil.datos().comidas + ':' + (opciones.variante || 0);
    const guardado = leerCache(clave, 72);
    if (guardado && !opciones.forzar) return Promise.resolve(guardado);

    const p = Perfil.datos();
    const prompt = contexto({ progreso: true }) + '\n\n' +
      'Crea un plan de alimentación de 7 días que sume cada día ' + m.kcal + ' kcal ' +
      'con aproximadamente ' + m.prot + ' g de proteína, ' + m.carbo + ' g de hidratos y ' +
      m.grasa + ' g de grasa, repartidos en ' + p.comidas + ' comidas. ' +
      'Usa comida corriente de supermercado en España, sencilla de preparar, ' +
      'con platos que se repitan para no complicar la compra. ' +
      'Indica cantidades en gramos o medidas caseras.\n\n' +
      'Devuelve JSON con esta forma exacta:\n' +
      '{"resumen":"2 frases","dias":[{"dia":"Lunes","comidas":[{"nombre":"Desayuno",' +
      '"plato":"descripcion con cantidades","kcal":000,"prot":00,"carbo":00,"grasa":00}],' +
      '"total":{"kcal":000,"prot":00,"carbo":00,"grasa":00}}],' +
      '"compra":["item con cantidad semanal"],"consejos":["consejo breve"]}';

    return llamarJSON(prompt, { maxTokens: 8192 }).then(function (r) {
      escribirCache(clave, r);
      return r;
    });
  }

  /* Revisión de las rutinas actuales frente al perfil y el progreso */
  function revisarRutinas() {
    const prompt = contexto({ rutinas: true, progreso: true }) + '\n\n' +
      'Revisa mis rutinas. Dime en qué fallan para mi objetivo y qué cambiarías, ' +
      'sin reescribirlas enteras. Máximo 5 puntos, cada uno de una o dos frases, ' +
      'concretos y accionables.\n\n' +
      'Devuelve JSON: {"veredicto":"una frase","puntos":[{"titulo":"3-5 palabras",' +
      '"detalle":"1-2 frases"}]}';
    return llamarJSON(prompt, { maxTokens: 2048 });
  }

  /* Lectura del progreso reciente */
  function analizarProgreso() {
    const sesiones = Store.sessions().slice(0, 20).map(function (s) {
      return UI.fechaCorta(s.start) + ': ' + s.routineName + ', ' + s.setsDone +
        ' series, ' + Math.round(s.volume) + ' kg';
    }).join(' | ');

    if (!sesiones) return Promise.reject(new Error('Aún no hay entrenamientos que analizar.'));

    const prompt = contexto({ progreso: true }) + '\n\nÚLTIMAS SESIONES: ' + sesiones + '\n\n' +
      'Analiza cómo voy. Señala lo que estoy haciendo bien, el punto más flojo y ' +
      'la única cosa que cambiarías esta semana.\n\n' +
      'Devuelve JSON: {"bien":"1-2 frases","flojo":"1-2 frases","accion":"1 frase"}';
    return llamarJSON(prompt, { maxTokens: 1024 });
  }

  /* Pregunta libre al entrenador */
  function preguntar(texto) {
    const prompt = contexto({ rutinas: true, progreso: true }) + '\n\nPREGUNTA: ' + texto +
      '\n\nResponde en menos de 150 palabras, sin listas salvo que ayuden de verdad.';
    return llamar(prompt, { maxTokens: 1024 });
  }

  /* Explicación de un ejercicio concreto, en español */
  function explicarEjercicio(ex) {
    const clave = 'ejercicio:' + ex.id;
    const guardado = leerCache(clave, 24 * 30);
    if (guardado) return Promise.resolve(guardado);

    const prompt = 'Ejercicio: ' + ex.nameEs + ' (' + ex.name + '). ' +
      'Músculos: ' + ex.primaryMuscles.map(I18N.muscle).join(', ') + '. ' +
      'Material: ' + I18N.equip(ex.equipment) + '.\n\n' +
      'Explica cómo se hace bien: la ejecución en 3 o 4 pasos, los dos fallos más ' +
      'habituales y un truco para notarlo en el músculo correcto.\n\n' +
      'Devuelve JSON: {"pasos":["paso"],"fallos":["fallo y su corrección"],"truco":"1 frase"}';

    return llamarJSON(prompt, { maxTokens: 1024 }).then(function (r) {
      escribirCache(clave, r);
      return r;
    });
  }

  g.IA = {
    config: config, guardarConfig: guardarConfig, borrarConfig: borrarConfig, activa: activa,
    llamar: llamar, llamarJSON: llamarJSON, contexto: contexto, limpiarCache: limpiarCache,
    planNutricion: planNutricion, revisarRutinas: revisarRutinas,
    analizarProgreso: analizarProgreso, preguntar: preguntar, explicarEjercicio: explicarEjercicio,
    MODELOS: MODELOS
  };
})(window);
