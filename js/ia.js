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
  /* Google retira modelos cada pocos meses y los nuevos usuarios dejan de poder
     usar los viejos. Esta lista es solo el punto de partida: la app pregunta a
     Google qué modelos tiene disponibles tu clave y se queda con los que existan. */
  const MODELOS = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
  const CACHE_MODELOS = 'trainingfr.ia.modelos';

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
    localStorage.setItem(CFG, JSON.stringify({
      clave: clave, modelo: modelo || MODELOS[0], _ts: Date.now()
    }));
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

  /* ---------- qué modelos hay disponibles ----------
     Se los pregunta a Google con la clave del usuario, así que la app no depende
     de una lista escrita a mano que envejece. */

  function modelosGuardados() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_MODELOS) || 'null');
      if (c && Date.now() - c.t < 7 * 864e5 && c.lista && c.lista.length) return c.lista;
    } catch (e) { /* nada */ }
    return null;
  }

  function listarModelos(forzar) {
    const guardados = forzar ? null : modelosGuardados();
    if (guardados) return Promise.resolve(guardados);

    const c = config();
    if (!c.clave) return Promise.resolve(MODELOS.slice());

    return fetch(BASE.replace(/models\/$/, 'models') + '?key=' + encodeURIComponent(c.clave))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.models) return MODELOS.slice();

        const lista = j.models
          .filter(function (m) {
            const metodos = m.supportedGenerationMethods || m.supportedActions || [];
            return metodos.indexOf('generateContent') !== -1;
          })
          .map(function (m) { return String(m.name || '').replace(/^models\//, ''); })
          .filter(function (n) { return n && n.indexOf('gemini') === 0; });

        if (!lista.length) return MODELOS.slice();

        /* los "flash" primero: son los rápidos y los que más cabida tienen en la
           capa gratuita; después el resto, y los más nuevos por delante */
        lista.sort(function (a, b) {
          const flash = function (x) { return /flash/.test(x) ? 0 : 1; };
          const version = function (x) {
            const m = x.match(/gemini-(\d+)[.-]?(\d*)/);
            return m ? Number(m[1]) * 100 + Number(m[2] || 0) : 0;
          };
          return flash(a) - flash(b) || version(b) - version(a) || a.localeCompare(b);
        });

        try {
          localStorage.setItem(CACHE_MODELOS, JSON.stringify({ t: Date.now(), lista: lista }));
        } catch (e) { /* nada */ }
        return lista;
      })
      .catch(function () { return MODELOS.slice(); });
  }

  /* ---------- llamada ---------- */

  function llamar(prompt, opciones) {
    opciones = opciones || {};
    const c = config();
    if (!c.clave) return Promise.reject(new Error('Falta la clave de la IA. Configúrala en Ajustes.'));

    /* Los modelos recientes razonan antes de responder y ese razonamiento gasta
       del mismo presupuesto de tokens. Con un límite corto se lo consumen entero
       pensando y devuelven una respuesta vacía, así que aquí se apaga: para lo
       que pide esta app no aporta y sí encarece cada llamada. */
    const cuerpo = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
      generationConfig: {
        temperature: opciones.temperatura == null ? 0.7 : opciones.temperatura,
        maxOutputTokens: Math.max(opciones.maxTokens || 2048, 256),
        thinkingConfig: { thinkingBudget: 0 }
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

            /* Google avisa del sustituto en el propio mensaje cuando retira un
               modelo: se aprovecha para saltar directamente al nuevo. */
            const sugerido = msg.match(/use\s+models\/([a-z0-9.\-]+)/i);
            if (sugerido && modelos.indexOf(sugerido[1]) === -1) {
              modelos.splice(i + 1, 0, sugerido[1]);
            }

            /* modelos antiguos que no conocen thinkingConfig: se quita y se repite */
            if (r.status === 400 && /thinking/i.test(msg) &&
                cuerpo.generationConfig.thinkingConfig) {
              delete cuerpo.generationConfig.thinkingConfig;
              return intentar(i);
            }

            /* "el modelo está saturado" es temporal y muy frecuente en la capa
               gratuita: se prueba con otro modelo y, agotados, se espera un poco
               antes de rendirse. */
            const saturado = r.status === 503 ||
              /overloaded|high demand|try again later|unavailable/i.test(msg);
            if (saturado) {
              if (i < modelos.length - 1) return intentar(i + 1);
              if (!opciones._esperado) {
                return new Promise(function (res) { setTimeout(res, 2500); }).then(function () {
                  return llamar(prompt, Object.assign({}, opciones, { _esperado: true }));
                });
              }
              throw new Error('Los modelos de Gemini están saturados ahora mismo. ' +
                'Vuelve a intentarlo en un minuto: es cosa de Google, no de tu clave.');
            }

            const retirado = r.status === 404 ||
              /no longer available|not found|is not supported/i.test(msg);
            if (retirado && i < modelos.length - 1) return intentar(i + 1);

            if (r.status === 400 && /API key/i.test(msg)) throw new Error('La clave de la IA no es válida.');
            if (r.status === 429) throw new Error('Has agotado la cuota gratuita por ahora. Inténtalo más tarde.');
            if (retirado) {
              throw new Error('El modelo elegido ya no está disponible. Abre la bóveda y ' +
                'vuelve a elegir modelo: la lista se actualiza sola.');
            }
            throw new Error(msg);
          }

          const cand = j && j.candidates && j.candidates[0];
          const partes = (cand && cand.content && cand.content.parts) || [];
          /* se descartan las partes de razonamiento: no son la respuesta */
          const texto = partes
            .filter(function (p) { return !p.thought; })
            .map(function (p) { return p.text || ''; })
            .join('');

          if (!texto) {
            const razon = cand && cand.finishReason;

            /* se quedó sin tokens antes de escribir nada: se reintenta con más
               margen, que es la causa habitual de una respuesta vacía */
            if (razon === 'MAX_TOKENS' && !opciones._ampliado) {
              return llamar(prompt, Object.assign({}, opciones, {
                _ampliado: true,
                maxTokens: Math.min((cuerpo.generationConfig.maxOutputTokens || 2048) * 4, 16384)
              }));
            }

            if (razon === 'SAFETY' || razon === 'PROHIBITED_CONTENT') {
              throw new Error('La IA no pudo responder a esa petición.');
            }
            if (razon === 'MAX_TOKENS') {
              throw new Error('La respuesta se cortó por longitud. Prueba a pedir menos de una vez.');
            }
            if (razon === 'RECITATION') {
              throw new Error('La IA se negó a responder por posible copia de otra fuente.');
            }
            throw new Error('La IA no devolvió texto' + (razon ? ' (motivo: ' + razon + ')' : '') +
              '. Prueba con otro modelo desde la bóveda.');
          }
          /* el modelo que ha respondido pasa a ser el preferido */
          if (modelos[i] !== c.modelo) {
            try { guardarConfig(c.clave, modelos[i]); } catch (e) { /* nada */ }
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
    if (gset) trozos.push('ENTRENA: ' + Data.gearFrase(Store.settings().gear) +
      ' (' + gset.note.toLowerCase() + ').');

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

  /* ---------- listas de reproducción para entrenar ----------
     La IA propone canciones y la app las busca luego en Spotify, así que las que
     no existan simplemente se descartan. Se guarda memoria de lo ya propuesto
     para que cada lista traiga cosas nuevas en lugar de repetir siempre igual. */

  const MEM_MUSICA = 'trainingfr.musica.memoria';

  function memoriaMusical() {
    try { return JSON.parse(localStorage.getItem(MEM_MUSICA) || 'null') || { artistas: [], listas: 0 }; }
    catch (e) { return { artistas: [], listas: 0 }; }
  }

  function recordarMusica(artistas) {
    const m = memoriaMusical();
    artistas.forEach(function (a) {
      if (a && m.artistas.indexOf(a) === -1) m.artistas.push(a);
    });
    /* se conservan los 120 últimos: suficiente para no repetir, sin inflar el prompt */
    m.artistas = m.artistas.slice(-120);
    m.listas = (m.listas || 0) + 1;
    try { localStorage.setItem(MEM_MUSICA, JSON.stringify(m)); } catch (e) { /* nada */ }
    return m;
  }

  function olvidarMusica() { localStorage.removeItem(MEM_MUSICA); }

  const AMBIENTES = {
    fuerza: {
      label: 'Fuerza bruta',
      guia: 'pesado, agresivo y contundente, para series máximas: hip hop duro, metal, ' +
        'rap rock, trap oscuro. Entre 80 y 110 pulsaciones por minuto con mucho golpe.'
    },
    ritmo: {
      label: 'Ritmo constante',
      guia: 'cadencia estable para mantener el ritmo entre series: house, techno melódico, ' +
        'drum and bass, electrónica. Entre 120 y 135 pulsaciones por minuto.'
    },
    cardio: {
      label: 'Cardio y quema',
      guia: 'rápido y eufórico para cardio o circuitos: dance, EDM, pop enérgico, ' +
        'reguetón rápido. Entre 140 y 160 pulsaciones por minuto.'
    },
    clasicos: {
      label: 'Clásicos de gimnasio',
      guia: 'himnos de gimnasio de todas las épocas: rock potente, hard rock ochentero, ' +
        'temas que todo el mundo reconoce al primer acorde.'
    },
    concentracion: {
      label: 'Concentración',
      guia: 'sin letra o con letra mínima, para no distraer: instrumental, lo-fi con ' +
        'garra, post rock, bandas sonoras épicas.'
    },
    latino: {
      label: 'Latino',
      guia: 'reguetón, dembow, salsa dura, latin trap y afrobeat con mucho ritmo.'
    }
  };

  /* Genera una lista distinta cada vez, adaptada al entrenamiento del día */
  function playlistEntreno(opts) {
    opts = opts || {};
    const amb = AMBIENTES[opts.ambiente] || AMBIENTES.ritmo;
    const n = Math.max(8, Math.min(40, opts.canciones || 20));
    const mem = memoriaMusical();

    const partes = [
      'Prepara una lista de ' + n + ' canciones para entrenar en el gimnasio.',
      'Ambiente buscado: ' + amb.guia
    ];

    if (opts.rutina) partes.push('El entrenamiento de hoy es: ' + opts.rutina + '.');
    if (opts.minutos) partes.push('La sesión dura unos ' + opts.minutos + ' minutos.');
    if (opts.gustos && opts.gustos.length) {
      partes.push('Artistas que escucha habitualmente: ' + opts.gustos.slice(0, 12).join(', ') +
        '. Puedes incluir alguno, pero que sean minoría.');
    }
    if (opts.libre) partes.push('Indicación del usuario: ' + opts.libre);

    if (mem.artistas.length) {
      partes.push('NO repitas estos artistas, ya salieron en listas anteriores: ' +
        mem.artistas.slice(-60).join(', ') + '.');
    }

    partes.push(
      'Reglas: canciones reales y localizables en Spotify, con el título exacto. ' +
      'Máximo una canción por artista. Mezcla épocas y países. ' +
      'Al menos un tercio deben ser temas poco evidentes, para descubrir cosas nuevas; ' +
      'el resto pueden ser más conocidos. Nada de villancicos, infantil ni parodias.',
      'Semilla de variación para que esta lista no se parezca a las anteriores: ' +
      (opts.semilla || Math.random().toString(36).slice(2)) + '.',
      '',
      'Devuelve JSON: {"nombre":"nombre corto y con gracia para la lista",' +
      '"descripcion":"una frase","canciones":[{"artista":"","titulo":"",' +
      '"porque":"3-6 palabras sobre por qué encaja"}]}'
    );

    /* temperatura alta: aquí interesa que se repita poco y explore */
    return llamarJSON(partes.join('\n'), { maxTokens: 4096, temperatura: 1.0 })
      .then(function (r) {
        if (!r || !Array.isArray(r.canciones) || !r.canciones.length) {
          throw new Error('La IA no devolvió canciones.');
        }
        return r;
      });
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
    listarModelos: listarModelos,
    planNutricion: planNutricion, revisarRutinas: revisarRutinas,
    playlistEntreno: playlistEntreno, AMBIENTES: AMBIENTES,
    memoriaMusical: memoriaMusical, recordarMusica: recordarMusica, olvidarMusica: olvidarMusica,
    analizarProgreso: analizarProgreso, preguntar: preguntar, explicarEjercicio: explicarEjercicio,
    MODELOS: MODELOS
  };
})(window);
