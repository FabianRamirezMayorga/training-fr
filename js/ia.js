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

  function borrarConfig() {
    localStorage.removeItem(CFG);
    localStorage.removeItem(CACHE);
    localStorage.removeItem(LIMITES);
  }
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

  /* ---------- qué admite cada modelo ----------
     Cada modelo de Gemini acepta unas opciones distintas y Google no lo dice de
     antemano: se descubre a base de 400. Lo aprendido se guarda para no repetir
     la petición fallida en cada consulta. */
  const LIMITES = 'trainingfr.ia.limites';

  function limitesDe(modelo) {
    try { return (JSON.parse(localStorage.getItem(LIMITES) || '{}'))[modelo] || {}; }
    catch (e) { return {}; }
  }

  function apuntarLimite(modelo, campo) {
    try {
      const todo = JSON.parse(localStorage.getItem(LIMITES) || '{}');
      todo[modelo] = todo[modelo] || {};
      todo[modelo][campo] = false;
      localStorage.setItem(LIMITES, JSON.stringify(todo));
    } catch (e) { /* nada */ }
  }

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
    /* La foto viaja en la misma petición que el texto y no se guarda en
       ninguna parte: ni aquí, ni en el móvil, ni después. */
    const partes = [{ text: prompt }];
    if (opciones.imagen && opciones.imagen.datos) {
      partes.push({ inlineData: {
        mimeType: opciones.imagen.mime || 'image/jpeg',
        data: opciones.imagen.datos
      } });
    }

    const cuerpo = {
      contents: [{ role: 'user', parts: partes }],
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
      /* Sin límite de tiempo, una red que se queda a medias deja la pantalla
         "pensando" para siempre. Minuto y medio es de sobra para lo más largo
         que se pide aquí, que es el menú semanal. */
      const corte = new AbortController();
      const reloj = setTimeout(function () { corte.abort(); }, 90000);

      /* lo que ya se sabe que este modelo no admite, ni se manda */
      const lim = limitesDe(modelos[i]);
      if (lim.thinking === false) delete cuerpo.generationConfig.thinkingConfig;
      if (lim.json === false) delete cuerpo.generationConfig.responseMimeType;

      return fetch(BASE + modelos[i] + ':generateContent?key=' + encodeURIComponent(c.clave), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        signal: corte.signal
      }).catch(function (e) {
        clearTimeout(reloj);
        if (e && e.name === 'AbortError') {
          throw new Error('La IA ha tardado demasiado en responder. Vuelve a intentarlo: ' +
            'suele ser cosa de la conexión o de que Google va cargado.');
        }
        throw new Error('No se pudo conectar con el servicio de IA.');
      }).then(function (r) { clearTimeout(reloj); return r; }).then(function (r) {
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

            /* 400 por la configuración, no por el contenido.
               Google suele responder un escueto "Request contains an invalid
               argument" sin decir cuál, y cada modelo admite unas opciones
               distintas: unos no conocen thinkingConfig, otros no aceptan que
               se les pida JSON. Así que se van quitando de una en una y se
               reintenta, en vez de rendirse con un mensaje que no ayuda. */
            const configSospechosa = r.status === 400 &&
              !/API key|API_KEY|quota|safety|blocked/i.test(msg);

            if (configSospechosa && cuerpo.generationConfig.thinkingConfig) {
              delete cuerpo.generationConfig.thinkingConfig;
              apuntarLimite(modelos[i], 'thinking');
              return intentar(i);
            }
            if (configSospechosa && cuerpo.generationConfig.responseMimeType) {
              delete cuerpo.generationConfig.responseMimeType;
              apuntarLimite(modelos[i], 'json');
              return intentar(i);
            }
            if (configSospechosa && i < modelos.length - 1) return intentar(i + 1);

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
            if (r.status === 400) {
              throw new Error('Gemini rechazó la petición (' + msg + '). Prueba a elegir ' +
                'otro modelo en la bóveda de claves.');
            }
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

  /* Los modelos devuelven JSON casi válido: envuelto en un bloque de código,
     con una coma de más al final de una lista, con saltos de línea sin escapar
     dentro de una cadena, o cortado a la mitad porque se acabó el cupo de
     palabras. Nada de eso hay que adivinarlo, se arregla mirando el texto. */
  function sinAdornos(t) {
    let x = String(t || '').trim();
    x = x.replace(/```json/gi, '').replace(/```/g, '').trim();
    const i = x.search(/[{[]/);
    if (i > 0) x = x.slice(i);
    return x;
  }

  /* Recorre el texto sabiendo cuándo va por dentro de una cadena, que es lo
     único que permite tocar comas y llaves sin romper el contenido. */
  function reparar(t) {
    const abiertos = [];
    let dentro = false, escape = false;
    let salida = '';
    let finBueno = -1;          // última coma o cierre con la estructura sana

    for (let i = 0; i < t.length; i++) {
      const c = t[i];

      if (dentro) {
        if (escape) { escape = false; salida += c; continue; }
        if (c === '\\') { escape = true; salida += c; continue; }
        if (c === '"') { dentro = false; salida += c; continue; }
        /* un salto de línea crudo dentro de una cadena invalida el JSON */
        if (c === '\n') { salida += '\\n'; continue; }
        if (c === '\r') { continue; }
        if (c === '\t') { salida += '\\t'; continue; }
        salida += c;
        continue;
      }

      if (c === '"') { dentro = true; salida += c; continue; }
      if (c === '{' || c === '[') { abiertos.push(c === '{' ? '}' : ']'); salida += c; continue; }
      if (c === '}' || c === ']') { abiertos.pop(); salida += c; finBueno = salida.length; continue; }
      if (c === ',') { salida += c; finBueno = salida.length; continue; }
      salida += c;
    }

    const intentos = [];
    intentos.push(salida);
    /* comas de más justo antes de un cierre */
    intentos.push(salida.replace(/,\s*([}\]])/g, '$1'));

    /* cortado a la mitad: se poda hasta lo último que estaba entero y se
       cierra lo que quedó abierto, en el orden contrario al que se abrió */
    if (abiertos.length && finBueno > 0) {
      let podado = salida.slice(0, finBueno).replace(/,\s*$/, '');
      for (let k = abiertos.length - 1; k >= 0; k--) podado += abiertos[k];
      intentos.push(podado);
    }
    return intentos;
  }

  /* La avería más común de todas: se deja la coma entre dos elementos de una
     lista. Se pone mirando qué cierra un valor y qué abre el siguiente, sin
     entrar en las cadenas para no tocar el texto de dentro. */
  function comasQueFaltan(t) {
    let salida = '';
    let dentro = false, escape = false;
    let ultimo = '';            // último carácter con significado, fuera de cadenas
    let hondo = 0;

    for (let i = 0; i < t.length; i++) {
      const c = t[i];

      if (dentro) {
        salida += c;
        if (escape) { escape = false; continue; }
        if (c === '\\') { escape = true; continue; }
        if (c === '"') { dentro = false; ultimo = '"'; }
        continue;
      }

      if (c === ' ' || c === '\n' || c === '\r' || c === '\t') { salida += c; continue; }

      const cierraValor = ultimo === '}' || ultimo === ']' || ultimo === '"' ||
        (ultimo >= '0' && ultimo <= '9') || ultimo === 'e' || ultimo === 'l';
      const abreValor = c === '{' || c === '[' || c === '"';
      if (hondo > 0 && cierraValor && abreValor) salida += ',';

      if (c === '{' || c === '[') hondo++;
      if (c === '}' || c === ']') hondo--;
      if (c === '"') dentro = true;

      salida += c;
      ultimo = c;
    }
    return salida;
  }

  function analizarJSON(t) {
    const base = sinAdornos(t);
    const conComas = comasQueFaltan(base);
    const pruebas = [base].concat(reparar(base), [conComas], reparar(conComas));
    for (let i = 0; i < pruebas.length; i++) {
      if (!pruebas[i]) continue;
      try { return JSON.parse(pruebas[i]); } catch (e) { /* la siguiente */ }
    }
    return null;
  }

  function llamarJSON(prompt, opciones) {
    const opts = Object.assign({ json: true, temperatura: 0.4 }, opciones);
    return llamar(prompt, opts).then(function (t) {
      const r = analizarJSON(t);
      if (r) return r;

      /* Una segunda oportunidad con el listón más bajo: menos que escribir y
         una orden seca de que sea JSON y nada más. Si tampoco, se dice que
         fue la IA y no su plan, que si no parece que la app esté rota. */
      return llamar(prompt + '\n\nDevuelve SOLO el JSON, sin explicaciones, sin bloque '
        + 'de código y sin texto antes ni después. Sé breve en cada campo.',
        Object.assign({}, opts, { temperatura: 0.2 })
      ).then(function (t2) {
        const r2 = analizarJSON(t2);
        if (r2) return r2;
        throw new Error('La IA ha contestado en un formato que no entiendo. '
          + 'Vuelve a intentarlo: suele salir a la segunda.');
      });
    });
  }

  /* ---------- cómo se comporta en toda la app ----------
     A un modelo, si se le deja, le sale contestar con buenas palabras: que vas
     bien, que sigas así, que buen trabajo. En una app de entrenamiento eso no es
     amabilidad, es dejar que alguien se estanque durante meses o se haga daño.
     Este bloque va delante de todo lo que se le pide —el programa, las rutinas,
     el progreso, la comida, la técnica de un ejercicio— para que en cualquier
     pantalla hable como habla un profesional que responde de lo que dice. */
  const PERSONA =
    'Eres un profesional del entrenamiento y la nutrición: preparador físico, ' +
    'especialista en acondicionamiento y nutricionista deportivo, con veinte años ' +
    'de consulta a tus espaldas. Hablas con alguien que te paga por que le digas ' +
    'la verdad, no con un cliente al que hay que tener contento.\n' +
    'CÓMO RESPONDES, SIEMPRE Y EN CUALQUIER APARTADO:\n' +
    '- Prohibido el halago y el ánimo de relleno: ni "buen trabajo", ni "vas por ' +
    'buen camino", ni "sigue así", ni felicitaciones. Si algo está bien, se ' +
    'despacha en cinco palabras y se pasa a lo que no lo está.\n' +
    '- Concreto y con números: series, gramos, kilos, días, semanas. Un consejo ' +
    'que le valdría a cualquiera es un consejo que sobra; bórralo y busca otro.\n' +
    '- Lo que está mal se dice claro y con su consecuencia: qué va a pasar si ' +
    'sigue así.\n' +
    '- No te inventas nada. Si un dato no está, lo dices en vez de rellenarlo, y ' +
    'no des por bueno lo que no puedas ver.\n' +
    '- Sin jerga vacía ni promesas: nada de "quemar grasa localizada", "tonificar", ' +
    '"limpiar el organismo" ni plazos milagro.\n' +
    '- Lo que sea un riesgo para la salud va primero, y donde haga falta un ' +
    'médico o un fisio lo dices sin rodeos y sin asustar.\n' +
    '- Español de España, de tú, frases cortas, sin relleno de cortesía.';

  /* ---------- contexto que se envía ---------- */

  function contexto(incluir) {
    incluir = incluir || {};
    const trozos = [PERSONA];

    /* Hablarle por su nombre cambia por completo cómo se lee una respuesta */
    const nombre = String(Store.settings().name || '').trim();
    if (nombre) {
      trozos.push('SE LLAMA ' + nombre + '. Dirígete a ' + nombre + ' por su nombre al ' +
        'empezar y alguna vez más si encaja, sin repetirlo en cada frase.');
    }

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

    const p = Perfil.datos();
    const clave = 'nutricion:' + JSON.stringify(m) + ':' + p.dieta + ':' + p.comidas +
      ':' + p.alergias + ':' + p.condiciones + ':' + (opciones.variante || 0);
    const guardado = leerCache(clave, 72);
    if (guardado && !opciones.forzar) return Promise.resolve(guardado);

    /* Los días de entrenamiento cambian la comida: hay que comer antes y después */
    const dias = {};
    Store.routines().forEach(function (r) {
      (r.days || []).forEach(function (d) { dias[d] = true; });
    });
    const diasEntreno = Object.keys(dias);
    const horaEntreno = g.Alertas ? Alertas.horaHabitualDeEntreno() : '';

    const litros = Perfil.agua(p);

    const prompt = contexto({ progreso: true }) + '\n\n' +
      'OBJETIVO DIARIO: ' + m.kcal + ' kcal, ' + m.prot + ' g de proteína, ' +
      m.carbo + ' g de hidratos y ' + m.grasa + ' g de grasa, en ' + p.comidas + ' comidas.\n' +
      'HORARIO: se levanta a las ' + (p.despertar || '07:00') + ' y se acuesta a las ' +
      (p.acostar || '23:00') + '.\n' +
      (diasEntreno.length ? 'ENTRENA: ' + diasEntreno.join(', ') +
        (horaEntreno ? ' sobre las ' + horaEntreno : '') + '.\n' : '') +
      (litros ? 'AGUA: le corresponden ' + String(litros).replace('.', ',') + ' L al día.\n' : '') +
      (p.dieta !== 'omnivora' ? 'DIETA: ' + Perfil.DIETA[p.dieta] + '. Todo el menú la respeta.\n' : '') +
      (p.alergias ? 'NO PUEDE COMER (innegociable: no aparece en ningún plato, en ninguna ' +
        'alternativa ni en la lista de la compra): ' + p.alergias + '.\n' : '') +
      (p.condiciones ? 'CONDICIONES DE SALUD: ' + p.condiciones + '. Adapta el menú a ' +
        'ellas (sal, azúcares, grasas saturadas, lo que corresponda) y dilo en el resumen, ' +
        'recordando que lo confirme con su médico o un dietista.\n' : '') +
      '\nPrepara su menú semanal de 7 días. Es un plan de nutricionista, no una ' +
      'lista de deseos: si con sus horarios o su objetivo hay algo que no cuadra, ' +
      'dilo en el resumen en lugar de maquillarlo.\n\n' +
      'CÓMO TIENE QUE SER:\n' +
      '- Comida corriente de supermercado en España, fácil y rápida de preparar. ' +
      'Nada de superalimentos, suplementos ni ingredientes de tienda especializada.\n' +
      '- Enfocado de verdad a su objetivo y sus datos, no un menú genérico.\n' +
      '- Flexible, no un régimen: cada comida lleva una o dos alternativas equivalentes ' +
      'para cuando no apetezca o no haya de eso, y las cantidades son orientativas.\n' +
      '- Platos que se repitan de un día a otro, para no complicar la compra.\n' +
      '- En los días de entrenamiento, la comida de antes con hidratos y la de después ' +
      'con proteína, cuadradas con su hora de entrenar.\n' +
      '- Cantidades en gramos o medidas caseras (un vaso, una cucharada).\n' +
      '- La hidratación también se planifica: cuánta agua y en qué momentos del día, ' +
      'con lo que suma el café o la infusión y qué cambia los días que entrena.\n\n' +
      'Devuelve JSON con esta forma exacta:\n' +
      '{"resumen":"2 o 3 frases explicando el enfoque para SU caso concreto",' +
      '"hidratacion":{"total":"1,9 L","pauta":["momento del día: cuánto"],' +
      '"nota":"1 frase sobre entrenamiento o café"},' +
      '"dias":[{"dia":"Lunes","entreno":true,"comidas":[{"nombre":"Desayuno","hora":"08:00",' +
      '"plato":"descripcion con cantidades","alternativas":["opcion equivalente"],' +
      '"kcal":000,"prot":00,"carbo":00,"grasa":00}],' +
      '"total":{"kcal":000,"prot":00,"carbo":00,"grasa":00}}],' +
      '"compra":["item con cantidad semanal"],' +
      '"flexibilidad":"1 o 2 frases sobre hasta dónde se puede salir del plan sin romperlo",' +
      '"consejos":["consejo breve"]}';

    return llamarJSON(prompt, { maxTokens: 8192 }).then(function (r) {
      escribirCache(clave, r);
      return r;
    });
  }

  /* Revisión de las rutinas actuales frente al perfil y el progreso */
  function revisarRutinas() {
    const prompt = contexto({ rutinas: true, progreso: true }) + '\n\n' +
      'Audita mis rutinas tal y como están. No las reescribas enteras ni me ' +
      'cuentes lo que ya está bien.\n\n' +
      '- Ponles nota del 0 al 10. Un conjunto correcto pero mejorable es un 6 o ' +
      'un 7; el 9 y el 10 son para lo que no tocarías.\n' +
      '- De tres a cinco puntos, y al menos tres tienen que ser fallos concretos ' +
      'con su consecuencia. Cita las rutinas y los ejercicios por su nombre.\n' +
      '- Mira el reparto de volumen entre músculos, los patrones que falten, la ' +
      'frecuencia semanal y si lo que entreno de verdad se parece a lo que tengo ' +
      'apuntado.\n' +
      '- Si nombras un ejercicio de recambio, que sea uno del catálogo de abajo y ' +
      'escrito igual: lo que no esté ahí no lo tengo y no me sirve.\n' +
      menuEjercicios([]) + '\n' +
      'Devuelve JSON: {"nota":número del 0 al 10,' +
      '"veredicto":"2 frases sin rodeos","puntos":[{"titulo":"3-5 palabras",' +
      '"detalle":"1-2 frases con la consecuencia"}]}';
    return llamarJSON(prompt, { maxTokens: 2048 });
  }

  /* El catálogo que se le enseña, con la advertencia de que es lo único que
     puede proponer. Es lo que separa un cambio aplicable de un nombre bonito
     que aquí no existe. */
  function menuEjercicios(musculos, gear) {
    return '\nCATÁLOGO DEL QUE PUEDES ELEGIR. Es el único material que existe en ' +
      'esta app. Cualquier ejercicio que propongas tiene que estar en esta lista y ' +
      'escrito EXACTAMENTE igual, tilde por tilde. Si lo que ibas a proponer no ' +
      'está, coge el más parecido que sí esté; y si no hay nada parecido, no ' +
      'propongas ese cambio. No te inventes nombres ni los traduzcas a tu manera:\n' +
      Data.paraIA({ musculos: musculos || [], gear: gear || Store.settings().gear }) + '\n';
  }

  /* ---------- auditar UNA rutina ----------
     Lo mismo que se le hace al programa entero, pero sobre una rutina suelta:
     la que uno ya tiene montada y quiere pasar por otro par de ojos. Los
     cambios vuelven en el mismo formato para que se apliquen igual, con la
     misma validación contra el catálogo y las lesiones. */
  function revisarRutina(r) {
    const lista = (r.exercises || []).map(function (e, i) {
      const ex = Data.get(e.exId);
      return (i + 1) + ') ' + (ex ? ex.nameEs : e.exId) + ' ' + e.sets + 'x' + e.reps +
        ' descanso ' + e.rest + 's' +
        (ex && ex.primaryMuscles.length
          ? ' (' + ex.primaryMuscles.map(I18N.muscle).join(', ') + ')' : '');
    }).join('\n');

    if (!lista) return Promise.reject(new Error('Esta rutina todavía no tiene ejercicios.'));

    const dias = (r.days || []).length ? UI.diasLargos(r.days) : 'ningún día fijo';

    const suyos = [];
    (r.exercises || []).forEach(function (e) {
      const ex = Data.get(e.exId);
      if (ex) (ex.primaryMuscles || []).forEach(function (m) {
        if (suyos.indexOf(m) === -1) suyos.push(m);
      });
    });

    const prompt = contexto({ progreso: true }) + '\n\n' +
      'RUTINA A AUDITAR — "' + (r.name || 'sin nombre') + '", ' + dias + ':\n' + lista + '\n' +
      menuEjercicios(suyos) +
      (r.note ? 'NOTAS QUE LE PUSO: ' + r.note + '\n' : '') +
      '\nAudita esta rutina concreta. No me cuentes lo que ya está bien.\n' +
      '- Ponle nota del 0 al 10. Correcta pero mejorable es un 6 o un 7.\n' +
      '- De dos a cuatro puntos, y al menos dos tienen que ser fallos con su ' +
      'consecuencia: orden de los ejercicios, series o repeticiones que no ' +
      'cuadran con mi objetivo, músculos repetidos, patrones que faltan, ' +
      'descansos mal puestos o riesgo para mis limitaciones.\n' +
      '- Propon de uno a tres cambios ejecutables, con su acción:\n' +
      '  "cambiar": sustituir un ejercicio. Rellena "quitar" con el nombre EXACTO ' +
      'de la rutina y "poner" con el nombre EXACTO de un ejercicio del catálogo.\n' +
      '  "quitar": sobra. Rellena "quitar" con el nombre exacto.\n' +
      '  "anadir": falta. Rellena "poner" con el nombre EXACTO de un ejercicio ' +
      'del catálogo, y "series" y "reps".\n' +
      'Si un cambio no la mejora de verdad, no lo propongas.\n\n' +
      'Devuelve JSON: {"nota":número del 0 al 10,' +
      '"veredicto":"2 frases sin rodeos",' +
      '"puntos":[{"titulo":"3-5 palabras","detalle":"1-2 frases con la consecuencia"}],' +
      '"cambios":[{"accion":"cambiar|quitar|anadir","quitar":"nombre exacto o vacío",' +
      '"poner":"nombre o vacío","series":número o 0,"reps":número o 0,' +
      '"porque":"1 frase"}],' +
      '"consejo":"lo que más cambiaría el resultado de esta rutina, 1 frase"}';

    return llamarJSON(prompt, { maxTokens: 2048, temperatura: 0.55 });
  }

  /* ---------- afinar el programa ----------
     El programa lo construye programa.js, que es determinista y siempre da algo
     coherente. La IA entra después, y entra a criticar: si lo único que devuelve
     es que está todo bien, no sirve para nada y encima cuesta dinero. Se le pide
     nota, se le prohíbe adular y se le exige que proponga cambios concretos
     —quitar, meter o sustituir un ejercicio— que la app valida después contra el
     catálogo, el material y las lesiones. */
  function afinarPrograma(prog) {
    const dias = prog.sesiones.map(function (s, i) {
      return (i + 1) + ') ' + s.nombre + ' [' + s.minutos + ' min]: ' +
        s.ejercicios.map(function (e) {
          const ex = Data.get(e.exId);
          return (ex ? ex.nameEs : e.exId) + ' ' + e.sets + 'x' + e.reps +
            ' (' + e.patron + ', ' + I18N.muscle(e.musculo) + ')';
        }).join('; ');
    }).join('\n');

    const volumen = Object.keys(prog.volumen).map(function (m) {
      return I18N.muscle(m) + ' ' + prog.volumen[m];
    }).join(', ');

    /* Lo que de verdad entrena, no lo que dice que va a entrenar. Sin esto la
       crítica sale de manual y vale para cualquiera. */
    let historial = '';
    if (prog.real && Object.keys(prog.real).length) {
      historial = 'SERIES REALES POR SEMANA (últimas 6 semanas, de sus entrenamientos ' +
        'registrados): ' + Object.keys(prog.real).map(function (m) {
          return I18N.muscle(m) + ' ' + prog.real[m];
        }).join(', ') + '\n';
    }

    /* La parte de nutrición: sin los números, cualquier consejo de comida es
       relleno. Con ellos se puede decir si el objetivo es alcanzable o no. */
    let comida = '';
    const mac = Perfil.macros ? Perfil.macros() : null;
    if (mac) {
      comida = 'ALIMENTACIÓN OBJETIVO: ' + mac.kcal + ' kcal al día, ' + mac.prot +
        ' g de proteína, ' + mac.carbo + ' g de hidratos, ' + mac.grasa + ' g de grasa.\n';
    }
    if (g.Comidas) {
      const dd = Comidas.ultimos(7).filter(function (d) { return d.kcal > 0; });
      if (dd.length) {
        const mk = Math.round(dd.reduce(function (a, d) { return a + d.kcal; }, 0) / dd.length);
        const mp = Math.round(dd.reduce(function (a, d) { return a + d.prot; }, 0) / dd.length);
        comida += 'LO QUE REALMENTE COME: media de ' + mk + ' kcal y ' + mp +
          ' g de proteína en los ' + dd.length + ' días que ha apuntado esta semana.\n';
      } else {
        comida += 'NO APUNTA LO QUE COME, así que de la comida solo sabes el objetivo.\n';
      }
    }

    const prompt = contexto({ progreso: true }) + '\n\n' +
      'PROGRAMA PROPUESTO (objetivo ' + prog.objetivoLabel + ', RPE tope ' + prog.rpe +
      ', unas ' + prog.objetivoSeries + ' series semanales por músculo):\n' + dias + '\n' +
      'SERIES POR SEMANA Y MÚSCULO QUE PIDE EL PLAN: ' + volumen + '\n' + historial + comida +
      (prog.lesiones.length ? 'LIMITACIONES YA APLICADAS: ' + prog.lesiones.join(', ') + '\n' : '') +
      menuEjercicios(Object.keys(prog.volumen || {})) +
      '\nTe han contratado para auditar este programa, no para animar a nadie.\n\n' +
      'REGLAS INNEGOCIABLES:\n' +
      '- De los puntos que devuelvas, al menos tres tienen que ser críticas ' +
      'concretas con su consecuencia: qué falla, por qué importa y qué pasa si se ' +
      'deja así. Nada de generalidades que valgan para cualquiera.\n' +
      '- Habla de ESTE plan y de ESTA persona: cita ejercicios por su nombre, ' +
      'músculos por sus series y días por su número. Si un consejo se lo podrías ' +
      'dar a otro cualquiera, bórralo y busca otro.\n' +
      '- Ponle nota del 0 al 10. Un plan correcto pero mejorable es un 6 o un 7. ' +
      'Reserva el 9 y el 10 para lo que no tocarías.\n' +
      '- Si hay riesgo para sus limitaciones o para su edad, eso va primero.\n\n' +
      'CAMBIOS: propon de dos a cuatro, y que sean ejecutables. Cada uno lleva ' +
      'una accion:\n' +
      '- "cambiar": sustituir un ejercicio por otro. Rellena "quitar" con el ' +
      'nombre EXACTO tal y como aparece en el programa y "poner" con el nombre ' +
      'EXACTO de un ejercicio del catálogo de arriba.\n' +
      '- "quitar": sobra un ejercicio (repite estímulo, alarga la sesión sin ' +
      'aportar, o es un riesgo). Rellena "quitar" con el nombre exacto.\n' +
      '- "anadir": falta un ejercicio. Rellena "poner" con el nombre EXACTO de un ' +
      'ejercicio del catálogo, "dia" con el número de la sesión donde va, y ' +
      '"series" y "reps".\n' +
      'Si un cambio no mejora el plan de verdad, no lo propongas.\n\n' +
      'Devuelve JSON: {"nota":número del 0 al 10,' +
      '"veredicto":"2-3 frases sin rodeos sobre qué le pasa a este plan",' +
      '"puntos":[{"titulo":"3-5 palabras","detalle":"1-2 frases con la consecuencia"}],' +
      '"cambios":[{"accion":"cambiar|quitar|anadir","quitar":"nombre exacto o vacío",' +
      '"poner":"nombre o vacío","dia":número o 0,"series":número o 0,' +
      '"reps":número o 0,"porque":"1 frase"}],' +
      '"nutricion":"1-2 frases sobre qué hay que corregir en su alimentación para ' +
      'que este entrenamiento sirva de algo, con números",' +
      '"consejo":"la única cosa que más le cambiaría el resultado, 1 frase"}';

    return llamarJSON(prompt, { maxTokens: 2600, temperatura: 0.55 });
  }

  /* Mira una foto de comida y estima lo que hay. Es una aproximación y se dice
     que lo es: nadie acierta los gramos de un plato por una foto, ni una
     persona ni un modelo. Sirve para saber si el día va corto de proteína, que
     es la pregunta de verdad, no para contar calorías al gramo. */
  function analizarComida(imagen, pista) {
    const m = Perfil.macros ? Perfil.macros() : null;
    const suyo = m ? 'Al d\u00eda le tocan unas ' + m.kcal + ' kcal y ' + m.prot +
      ' g de prote\u00edna, por si ayuda a juzgar el tama\u00f1o de la raci\u00f3n.\n' : '';

    const prompt = PERSONA + '\n\nAhora estás mirando la foto de un plato.\n' + suyo +
      (pista ? 'Quien la ha hecho a\u00f1ade: "' + pista + '".\n' : '') +
      '\nDi qu\u00e9 alimentos ves y estima la raci\u00f3n de cada uno en gramos o en medidas ' +
      'caseras. Suma las calor\u00edas y la prote\u00edna del plato entero. Si la foto no deja ' +
      'ver bien algo, tira por lo m\u00e1s probable en una comida normal y b\u00e1jale la ' +
      'confianza. Si en la foto no hay comida, dilo con kcal 0.\n\n' +
      'Devuelve JSON: {"plato":"c\u00f3mo llamar\u00edas a esto en 2-5 palabras",' +
      '"alimentos":[{"que":"nombre","cuanto":"raci\u00f3n estimada","kcal":n\u00famero,' +
      '"prot":n\u00famero}],"kcal":n\u00famero,"prot":n\u00famero,' +
      '"confianza":"alta|media|baja","nota":"una frase con lo que no has podido ' +
      'ver bien o lo que has dado por supuesto"}\n\n' +
      'Estima sin miedo pero sin adornar: si el plato lleva más aceite o más ' +
      'azúcar de lo que parece, cuéntalo; y si la ración se le va de lo que le ' +
      'toca al día, dilo en la nota.';

    return llamarJSON(prompt, {
      imagen: imagen, maxTokens: 1024, temperatura: 0.3
    });
  }

  /* Lectura del progreso reciente */
  function analizarProgreso() {
    const sesiones = Store.sessions().slice(0, 20).map(function (s) {
      return UI.fechaCorta(s.start) + ': ' + s.routineName + ', ' + s.setsDone +
        ' series, ' + Math.round(s.volume) + ' kg';
    }).join(' | ');

    if (!sesiones) return Promise.reject(new Error('Aún no hay entrenamientos que analizar.'));

    const prompt = contexto({ progreso: true }) + '\n\nÚLTIMAS SESIONES: ' + sesiones + '\n\n' +
      'Analiza cómo voy de verdad, mirando fechas, huecos, series y cargas.\n' +
      '- "bien": una frase, y solo lo que se sostenga con estos datos. Si no hay ' +
      'nada destacable, escribe exactamente eso y no lo maquilles.\n' +
      '- "flojo": lo peor que ves, con números y con lo que va a pasar si sigue ' +
      'igual. Aquí no te cortes.\n' +
      '- "accion": una sola cosa, concreta y hacedera esta semana.\n\n' +
      'Devuelve JSON: {"bien":"1 frase","flojo":"2 frases","accion":"1 frase"}';
    return llamarJSON(prompt, { maxTokens: 1024 });
  }

  /* Pregunta libre al entrenador */
  function preguntar(texto) {
    const prompt = contexto({ rutinas: true, progreso: true }) + '\n\nPREGUNTA: ' + texto +
      '\n\nResponde en menos de 150 palabras, sin listas salvo que ayuden de verdad. ' +
      'No des la razón por costumbre: si la pregunta parte de algo falso o de un ' +
      'mito de gimnasio, corrígelo antes de contestar. Si la respuesta honesta es ' +
      '"depende", di de qué depende y con qué números, en vez de escurrir el bulto.';
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

    const prompt = PERSONA + '\n\nEjercicio: ' + ex.nameEs + ' (' + ex.name + '). ' +
      'Músculos: ' + ex.primaryMuscles.map(I18N.muscle).join(', ') + '. ' +
      'Material: ' + I18N.equip(ex.equipment) + '.\n\n' +
      'Explica cómo se hace bien: la ejecución en 3 o 4 pasos, los dos fallos más ' +
      'habituales y un truco para notarlo en el músculo correcto. Los pasos son ' +
      'instrucciones, no ánimos: postura, recorrido y respiración. Si el ejercicio ' +
      'tiene un riesgo real cuando se hace mal, dilo en el fallo que corresponda.\n\n' +
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
    revisarRutina: revisarRutina, afinarPrograma: afinarPrograma,
    analizarComida: analizarComida,
    playlistEntreno: playlistEntreno, AMBIENTES: AMBIENTES,
    memoriaMusical: memoriaMusical, recordarMusica: recordarMusica, olvidarMusica: olvidarMusica,
    analizarProgreso: analizarProgreso, preguntar: preguntar, explicarEjercicio: explicarEjercicio,
    MODELOS: MODELOS
  };
})(window);
