/* ia.js — el núcleo inteligente de la app.

   Detrás puede haber varios proveedores: Gemini, Anthropic, DeepSeek o Grok. Se
   elige uno en la bóveda de claves y todo lo demás —el entrenador, la auditoría
   de rutinas, la foto del plato, el menú semanal, las listas de música— sale por
   ahí sin enterarse de cuál es. Cada proveedor guarda su propia clave y su
   propio modelo, así que cambiar de uno a otro es un toque y no hay que volver
   a pegar nada.

   Las claves se guardan solo en este navegador y nunca viajan al repositorio.

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
  /* Google retira modelos por cuenta, no para todos a la vez: una clave nueva
     puede no tener gemini-2.5-flash y sí gemini-3.6-flash, y al revés. Por eso
     la lista es solo el punto de partida —la app pregunta cuáles admite tu
     clave— y los alias «latest», que Google mantiene apuntando a lo vigente,
     van de red al final. */
  const MODELOS = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-flash-latest',
    'gemini-2.0-flash'];
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

  /* ---------- quién puede contestar ----------
     Cada uno habla su propio protocolo. Lo que la app le pide es siempre lo
     mismo: un texto de vuelta. Añadir otro proveedor es añadir una entrada
     aquí, no tocar ninguna pantalla. */
  const PROVEEDORES = [
    {
      id: 'gemini',
      label: 'Google Gemini',
      nota: 'Capa gratuita generosa y sin tarjeta, y lee fotos. Es el que trae la app ' +
        'de serie y el que recomiendo si no quieres pagar nada. El límite que te toca ' +
        'lo ves en tu consola de AI Studio.',
      donde: 'https://aistudio.google.com/apikey',
      dondeTxt: 'aistudio.google.com/apikey',
      pista: 'AIza…',
      /* Google reparte dos formatos: las de siempre empiezan por AIza y las
         nuevas por AQ. Las dos valen contra el endpoint REST —comprobado—, así
         que aquí entran ambas. Lo único que se rechaza es un token de sesión
         (ya29.), que caduca en una hora y no es una clave. */
      forma: /^(AIza[\w-]{20,}|AQ\.[\w.-]{20,})$/,
      formaTxt: 'Las de Gemini empiezan por AIza o por AQ. Si lo que copiaste empieza por ' +
        '«ya29.» es un token de sesión, no una clave: sácala de aistudio.google.com/apikey.',
      modelos: MODELOS,
      imagen: true,
      gratis: true
    },
    {
      id: 'groq',
      label: 'Groq',
      nota: 'Capa gratuita sin tarjeta y muy rápido: corre modelos abiertos (Llama, ' +
        'Qwen, GPT-OSS). Ojo, los de texto no leen fotos. El límite que te toca lo ves ' +
        'en tu consola.',
      donde: 'https://console.groq.com/keys',
      dondeTxt: 'console.groq.com/keys',
      pista: 'gsk_…',
      forma: /^gsk_[\w-]{20,}$/,
      formaTxt: 'Las de Groq empiezan por gsk_.',
      base: 'https://api.groq.com/openai/v1',
      modelos: ['llama-3.3-70b-versatile'],
      imagen: false,
      gratis: true
    },
    {
      id: 'openrouter',
      label: 'OpenRouter',
      nota: 'Una sola clave para casi todos los modelos que existen. Los que acaban en ' +
        '«:free» no cuestan nada; el resto se paga por uso con saldo.',
      donde: 'https://openrouter.ai/keys',
      dondeTxt: 'openrouter.ai/keys',
      pista: 'sk-or-v1-…',
      forma: /^sk-or-[\w-]{20,}$/,
      formaTxt: 'Las de OpenRouter empiezan por sk-or-.',
      base: 'https://openrouter.ai/api/v1',
      modelos: ['deepseek/deepseek-chat'],
      imagen: true,
      gratis: true,
      listaPublica: true
    },
    {
      id: 'anthropic',
      label: 'Anthropic (Claude)',
      nota: 'De pago por uso: tu suscripción de Claude Pro no sirve aquí, la API se ' +
        'factura aparte. Es el que mejor sigue instrucciones largas, que es lo que más ' +
        'hace esta app. Opus es el bueno; Haiku, el barato.',
      donde: 'https://console.anthropic.com/settings/keys',
      dondeTxt: 'console.anthropic.com',
      pista: 'sk-ant-…',
      forma: /^sk-ant-[\w-]{20,}$/,
      formaTxt: 'Las de Anthropic empiezan por sk-ant-. Ojo: la de tu suscripción de Claude ' +
        'Pro no sirve, la API se factura aparte.',
      modelos: ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5'],
      imagen: true
    },
    {
      id: 'mistral',
      label: 'Mistral',
      nota: 'Tiene capa gratuita. Europeo, por si te importa dónde acaban tus datos.',
      donde: 'https://console.mistral.ai/api-keys',
      dondeTxt: 'console.mistral.ai',
      pista: 'sin prefijo fijo',
      base: 'https://api.mistral.ai/v1',
      modelos: ['mistral-large-latest'],
      imagen: true,
      gratis: true
    },
    {
      id: 'deepseek',
      label: 'DeepSeek',
      nota: 'De pago por uso y de lo más barato que hay. No lee fotos: para el cálculo ' +
        'de la comida por foto hace falta otro.',
      donde: 'https://platform.deepseek.com/api_keys',
      dondeTxt: 'platform.deepseek.com',
      pista: 'sk-…',
      base: 'https://api.deepseek.com',
      modelos: ['deepseek-chat', 'deepseek-reasoner'],
      imagen: false
    },
    {
      id: 'grok',
      label: 'xAI (Grok)',
      nota: 'De pago por uso.',
      donde: 'https://console.x.ai',
      dondeTxt: 'console.x.ai',
      pista: 'xai-…',
      forma: /^xai-[\w-]{20,}$/,
      formaTxt: 'Las de xAI empiezan por xai-.',
      base: 'https://api.x.ai/v1',
      modelos: ['grok-4'],
      imagen: true
    }
  ];

  function proveedorPorId(id) {
    return PROVEEDORES.find(function (p) { return p.id === id; }) || PROVEEDORES[0];
  }

  /* ---------- lo guardado ----------
     Antes solo había Gemini y se guardaba {clave, modelo}. Eso se traduce a la
     forma nueva la primera vez, para que nadie tenga que volver a pegar nada. */
  function crudo() {
    try { return JSON.parse(localStorage.getItem(CFG) || 'null') || {}; }
    catch (e) { return {}; }
  }

  function guardarCrudo(c) {
    c._ts = Date.now();
    localStorage.setItem(CFG, JSON.stringify(c));
  }

  function config() {
    const c = crudo();

    /* traducción de lo de antes */
    if (c.clave && !c.claves) {
      c.claves = { gemini: c.clave };
      c.modelos = { gemini: c.modelo || MODELOS[0] };
      c.proveedor = 'gemini';
      guardarCrudo(c);
    }

    c.claves = c.claves || {};
    c.modelos = c.modelos || {};
    c.proveedor = c.proveedor && proveedorPorId(c.proveedor).id === c.proveedor
      ? c.proveedor : 'gemini';

    /* lo que el resto de la app sigue leyendo como si solo hubiera uno */
    c.clave = c.claves[c.proveedor] || '';
    c.modelo = c.modelos[c.proveedor] || proveedorPorId(c.proveedor).modelos[0];
    return c;
  }

  function proveedor() { return config().proveedor; }
  function proveedorActual() { return proveedorPorId(proveedor()); }
  function claveDe(id) { return config().claves[id] || ''; }
  function modeloDe(id) { return config().modelos[id] || proveedorPorId(id).modelos[0]; }

  /* Guarda la clave y el modelo de UN proveedor, sin tocar los demás */
  function guardarProveedor(id, clave, modelo) {
    const prov = proveedorPorId(id);
    clave = String(clave || '').trim();
    if (clave && clave.length < 20) throw new Error('Esa clave no parece válida.');

    /* Cada proveedor tiene su prefijo y no cuesta nada mirarlo. Sin esto, pegar
       un token de sesión en vez de la clave se guardaba tan campante y el fallo
       no aparecía hasta la primera llamada, con un mensaje del servidor que no
       explicaba qué había que hacer. */
    if (clave && prov.forma && !prov.forma.test(clave)) {
      throw new Error('Eso no parece una clave de ' + prov.label + '. ' +
        (prov.formaTxt || ''));
    }

    const c = config();
    if (clave) c.claves[prov.id] = clave; else delete c.claves[prov.id];
    c.modelos[prov.id] = modelo || prov.modelos[0];
    if (clave) c.proveedor = prov.id;
    guardarCrudo(c);
  }

  function elegirProveedor(id) {
    const c = config();
    c.proveedor = proveedorPorId(id).id;
    guardarCrudo(c);
  }

  function recordarModelo(id, modelo) {
    const c = config();
    c.modelos[id] = modelo;
    guardarCrudo(c);
  }

  /* Compatibilidad: lo que llamaba guardarConfig(clave, modelo) hablaba de Gemini
     cuando solo había Gemini; ahora guarda en el proveedor que esté elegido. */
  function guardarConfig(clave, modelo) {
    guardarProveedor(proveedor(), clave, modelo);
  }

  /* Borra solo el proveedor que esté elegido; para dejarlo todo limpio está
     borrarTodo(), que es lo que usa «olvidar todas mis claves». */
  function borrarConfig() {
    const c = config();
    const id = c.proveedor;
    delete c.claves[id];
    delete c.modelos[id];
    /* se pasa al primero que sí tenga clave, si queda alguno */
    const queda = PROVEEDORES.find(function (p) { return !!c.claves[p.id]; });
    c.proveedor = queda ? queda.id : 'gemini';
    guardarCrudo(c);
    localStorage.removeItem(CACHE);
    if (id === 'gemini') localStorage.removeItem(LIMITES);
  }

  function borrarTodo() {
    localStorage.removeItem(CFG);
    localStorage.removeItem(CACHE);
    localStorage.removeItem(LIMITES);
    localStorage.removeItem(CACHE_MODELOS);
  }

  function activa() { return !!config().clave; }

  /* Cuáles tienen clave puesta, para pintarlo en la bóveda */
  function configurados() {
    const c = config();
    return PROVEEDORES.filter(function (p) { return !!c.claves[p.id]; }).map(function (p) { return p.id; });
  }

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

  /* Todos publican su catálogo con la clave del usuario, así que no hace falta
     ninguna lista escrita a mano: se pregunta y punto. Es lo que evita el error
     de «ese modelo no existe» cada vez que un proveedor renombra los suyos. */
  function listarCompatibles(prov, clave) {
    const cab = { 'content-type': 'application/json' };
    if (clave) cab.authorization = 'Bearer ' + clave;
    if (prov.id === 'openrouter') {
      cab['HTTP-Referer'] = location.origin + location.pathname;
      cab['X-Title'] = 'Training FR';
    }

    return fetch(prov.base + '/models', { headers: cab })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        const bruto = (j && (j.data || j.models)) || [];
        if (!bruto.length) return prov.modelos.slice();

        const lista = bruto.map(function (m) { return String(m.id || m.name || ''); })
          .filter(Boolean);

        /* En OpenRouter los gratis delante: son los que le interesan a quien no
           quiere poner saldo, y entre 445 no se encuentran. */
        if (prov.id === 'openrouter') {
          const esGratis = function (x) { return /:free$/.test(x); };
          lista.sort(function (a, b) {
            return (esGratis(b) ? 1 : 0) - (esGratis(a) ? 1 : 0) || a.localeCompare(b);
          });
        } else {
          lista.sort(function (a, b) { return a.localeCompare(b); });
        }
        return lista;
      })
      .catch(function () { return prov.modelos.slice(); });
  }

  function listarAnthropic(clave) {
    const prov = proveedorPorId('anthropic');
    return fetch('https://api.anthropic.com/v1/models?limit=40', { headers: {
      'x-api-key': clave,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        const lista = ((j && j.data) || []).map(function (m) { return String(m.id || ''); })
          .filter(Boolean);
        return lista.length ? lista : prov.modelos.slice();
      })
      .catch(function () { return prov.modelos.slice(); });
  }

  function listarModelos(forzar) {
    const prov = proveedorActual();
    const clave = claveDe(prov.id);

    if (prov.base) {
      /* sin clave solo se puede preguntar a quien tenga la lista abierta */
      if (!clave && !prov.listaPublica) return Promise.resolve(prov.modelos.slice());
      return listarCompatibles(prov, clave);
    }
    if (prov.id === 'anthropic') {
      if (!clave) return Promise.resolve(prov.modelos.slice());
      return listarAnthropic(clave);
    }

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

  /* ---------- la llamada, según quién conteste ----------
     Una sola puerta para toda la app. Lo que cambia detrás —la URL, las
     cabeceras, cómo se pide JSON, dónde viene el texto en la respuesta— se queda
     en cada implementación y no sale de aquí. */
  function llamar(prompt, opciones) {
    opciones = opciones || {};
    const prov = proveedorActual();
    const clave = claveDe(prov.id);

    if (!clave) {
      return Promise.reject(new Error('Falta la clave de ' + prov.label +
        '. Ponla en Ajustes → Bóveda de claves.'));
    }
    if (opciones.imagen && opciones.imagen.datos && !prov.imagen) {
      return Promise.reject(new Error(prov.label + ' no lee imágenes. Para esto elige ' +
        'Gemini o Anthropic como proveedor en la bóveda de claves.'));
    }

    if (prov.id === 'gemini') return llamarGemini(prompt, opciones, clave, modeloDe('gemini'));
    if (prov.id === 'anthropic') return llamarAnthropic(prompt, opciones, clave, modeloDe('anthropic'));
    /* todos los demás hablan el dialecto de OpenAI: cambia la dirección, nada más */
    return llamarCompatible(prov.base + '/chat/completions', prov,
      prompt, opciones, clave, modeloDe(prov.id));
  }

  /* Lo común de los que hablan HTTP normal: un tiempo máximo, y traducir el
     fallo a algo que se entienda. Un fetch que ni llega a contestar desde el
     navegador casi siempre es CORS —el proveedor no deja que se le llame desde
     una página web— y eso no lo arregla la app. */
  function pedirHTTP(url, cabeceras, cuerpo, prov) {
    const corte = new AbortController();
    const reloj = setTimeout(function () { corte.abort(); }, 90000);

    return fetch(url, {
      method: 'POST', headers: cabeceras, body: JSON.stringify(cuerpo), signal: corte.signal
    }).catch(function (e) {
      clearTimeout(reloj);
      if (e && e.name === 'AbortError') {
        throw new Error(prov.label + ' ha tardado demasiado en responder. Vuelve a intentarlo.');
      }
      throw new Error('El navegador no ha podido conectar con ' + prov.label + '. Puede que ' +
        'no permita llamadas desde una página web; si se repite, elige Gemini o Anthropic ' +
        'en la bóveda de claves.');
    }).then(function (r) {
      clearTimeout(reloj);
      return r.text().then(function (t) { return { r: r, t: t }; });
    }).then(function (x) {
      let j = null;
      try { j = JSON.parse(x.t); } catch (e) { j = null; }

      if (!x.r.ok) {
        const err = j && j.error;
        const msg = (err && (err.message || (typeof err === 'string' ? err : ''))) ||
          (j && j.message) || ('Error ' + x.r.status);
        if (x.r.status === 401 || x.r.status === 403) {
          throw new Error('La clave de ' + prov.label + ' no vale o no tiene permiso.');
        }
        if (x.r.status === 429) {
          throw new Error('Has agotado la cuota de ' + prov.label + ' por ahora. ' +
            'Inténtalo más tarde.');
        }
        if (x.r.status === 404 || /model/i.test(msg)) {
          throw new Error(prov.label + ': ' + msg + ' Prueba a escribir otro modelo en la ' +
            'bóveda de claves.');
        }
        throw new Error(prov.label + ': ' + msg);
      }
      if (!j) throw new Error(prov.label + ' devolvió una respuesta que no se entiende.');
      return j;
    });
  }

  /* Anthropic no tiene modo JSON, pero se le puede empezar la respuesta: si ya
     lleva una llave escrita no puede colocar un preámbulo delante. */
  function llamarAnthropic(prompt, o, clave, modelo) {
    const prov = proveedorPorId('anthropic');
    const contenido = [];
    if (o.imagen && o.imagen.datos) {
      contenido.push({ type: 'image', source: {
        type: 'base64', media_type: o.imagen.mime || 'image/jpeg', data: o.imagen.datos
      } });
    }
    contenido.push({ type: 'text', text: prompt });

    const mensajes = [{ role: 'user', content: contenido }];
    if (o.json) mensajes.push({ role: 'assistant', content: '{' });

    return pedirHTTP('https://api.anthropic.com/v1/messages', {
      'content-type': 'application/json',
      'x-api-key': clave,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    }, {
      model: modelo,
      max_tokens: Math.max(o.maxTokens || 2048, 256),
      temperature: Math.min(1, o.temperatura == null ? 0.7 : o.temperatura),
      system: INSTRUCCIONES,
      messages: mensajes
    }, prov).then(function (j) {
      const texto = (j.content || [])
        .filter(function (x) { return x.type === 'text'; })
        .map(function (x) { return x.text || ''; })
        .join('').trim();
      if (!texto) throw new Error('Anthropic no devolvió texto.');
      return o.json ? '{' + texto : texto;
    });
  }

  /* DeepSeek y xAI hablan el mismo dialecto que OpenAI, así que comparten código */
  function llamarCompatible(url, prov, prompt, o, clave, modelo) {
    const cuerpo = {
      model: modelo,
      messages: [
        { role: 'system', content: INSTRUCCIONES },
        { role: 'user', content: prompt }
      ],
      max_tokens: Math.max(o.maxTokens || 2048, 256),
      temperature: o.temperatura == null ? 0.7 : o.temperatura
    };
    if (o.json) cuerpo.response_format = { type: 'json_object' };

    const cab = { 'content-type': 'application/json', authorization: 'Bearer ' + clave };
    /* OpenRouter pide saber quién llama para sus cuotas y sus listas públicas */
    if (prov.id === 'openrouter') {
      cab['HTTP-Referer'] = location.origin + location.pathname;
      cab['X-Title'] = 'Training FR';
    }

    return pedirHTTP(url, cab, cuerpo, prov).then(function (j) {
      const m = ((j.choices || [])[0] || {}).message || {};
      const texto = String(m.content || '').trim();
      if (!texto) throw new Error(prov.label + ' no devolvió texto.');
      return texto;
    });
  }

  /* ---------- Gemini ---------- */

  function llamarGemini(prompt, opciones, claveIA, modeloIA) {
    opciones = opciones || {};
    const c = { clave: claveIA, modelo: modeloIA };

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

    /* Google retira modelos por cuenta. La lista escrita a mano gasta intentos en
       modelos que esta clave ya no puede usar, así que si hay lista viva —la que
       devolvió el propio Google con esta clave— manda esa. */
    const vivos = modelosGuardados();
    const respaldo = (vivos && vivos.length ? vivos : MODELOS).slice(0, 5);
    const modelos = c.modelo
      ? [c.modelo].concat(respaldo.filter(function (m) { return m !== c.modelo; }))
      : respaldo.slice();

    /* Se recuerda si en el camino hubo un 429: el último modelo de la lista
       puede fallar por estar retirado y entonces se anunciaba «modelo no
       disponible» cuando lo que pasaba de verdad era que la cuota estaba
       agotada. El motivo que se cuenta tiene que ser el que manda. */
    let huboCuota = false;

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
                  return llamarGemini(prompt, Object.assign({}, opciones, { _esperado: true }),
                    claveIA, modeloIA);
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
            /* La cuota va por modelo, no por clave: el flash del día tiene un
               límite corto y los de la generación anterior uno mucho más ancho.
               Rendirse al primer 429 dejaba sin IA a quien sí podía usarla con
               otro modelo. */
            if (r.status === 429) huboCuota = true;
            if (r.status === 429 && i < modelos.length - 1) return intentar(i + 1);
            if (r.status === 429) {
              throw new Error('Has agotado la cuota de todos los modelos de Gemini por ahora. ' +
                'Suele reponerse en un minuto si es el límite por minuto, o mañana si es el ' +
                'diario. Si tienes otro proveedor puesto en la bóveda, cambia a él mientras.');
            }
            if (retirado && huboCuota) {
              throw new Error('Has agotado la cuota gratuita de Gemini por ahora. Suele ' +
                'reponerse en unos minutos si es el límite por minuto, o mañana si es el ' +
                'diario. Si tienes otro proveedor puesto en la bóveda, cambia a él mientras.');
            }
            if (retirado) {
              throw new Error('El modelo elegido ya no está disponible. Abre la bóveda y ' +
                'pulsa «Ver los suyos» para refrescar la lista con los que admite tu clave.');
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

          const razon = cand && cand.finishReason;

          /* Los modelos nuevos razonan antes de contestar y ese razonamiento sale
             del mismo presupuesto de tokens: thinkingConfig con presupuesto cero
             lo ignoran. Si se les acaba pensando, devuelven media respuesta —un
             JSON cortado del que solo se salva el primer campo— y eso llegaba a
             la pantalla como una nota suelta sin veredicto ni cambios. Cortado es
             cortado: se repite con más margen aunque haya texto. */
          if (razon === 'MAX_TOKENS' && texto && !opciones._ampliado) {
            return llamarGemini(prompt, Object.assign({}, opciones, {
              _ampliado: true,
              maxTokens: Math.min((cuerpo.generationConfig.maxOutputTokens || 2048) * 4, 32768)
            }), claveIA, modeloIA);
          }

          if (!texto) {

            /* se quedó sin tokens antes de escribir nada */
            if (razon === 'MAX_TOKENS' && !opciones._ampliado) {
              return llamarGemini(prompt, Object.assign({}, opciones, {
                _ampliado: true,
                maxTokens: Math.min((cuerpo.generationConfig.maxOutputTokens || 2048) * 4, 16384)
              }), claveIA, modeloIA);
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
            try { recordarModelo('gemini', modelos[i]); } catch (e) { /* nada */ }
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
    '- Debajo tienes sus datos reales: lo que entrena, con cuántos kilos, qué lleva ' +
    'abandonado, cuántos días cumple de verdad y qué come. ÚSALOS. Cada afirmación ' +
    'que hagas sobre él tiene que poder señalar un dato de ahí. Cítalos: «llevas 34 ' +
    'días sin tocar dorsales», no «deberías equilibrar tu espalda».\n' +
    '- No contradigas esos datos ni los redondees a tu gusto, y no supongas nada que ' +
    'no esté: si dice que no apunta lo que come, no le cuentes cuántas calorías toma.\n' +
    '- Lo que está mal se dice claro y con su consecuencia: qué va a pasar si ' +
    'sigue así.\n' +
    '- No te inventas nada. Si un dato no está, lo dices en vez de rellenarlo, y ' +
    'no des por bueno lo que no puedas ver.\n' +
    '- Sin jerga vacía ni promesas: nada de "quemar grasa localizada", "tonificar", ' +
    '"limpiar el organismo" ni plazos milagro.\n' +
    '- Lo que sea un riesgo para la salud va primero, y donde haga falta un ' +
    'médico o un fisio lo dices sin rodeos y sin asustar.\n' +
    '- Español de España, de tú, frases cortas, sin relleno de cortesía.';

  /* ---------- lo que se le cuenta de la persona ----------
     Un perfil declarado —edad, peso, objetivo— lo tiene cualquiera, y con eso
     salen consejos que valen para cualquiera. Lo que hace acertada una
     respuesta es lo que la persona HACE: con cuántos kilos entrena de verdad,
     qué músculos lleva un mes sin tocar, cuántos días cumple de los que se
     propone, qué come de verdad frente a lo que debería. Todo eso lo tiene la
     app guardado y hasta ahora casi nada llegaba al modelo. */

  /* Con qué entrena de verdad: los ejercicios que más repite, con la carga de
     su última sesión y su mejor marca. Sin esto, cualquier consejo de progresión
     es humo. */
  function cargasReales(cuantos) {
    const ses = Store.sessions().slice(0, 40);
    if (!ses.length) return '';

    const veces = {};
    ses.forEach(function (x) {
      (x.entries || []).forEach(function (e) {
        if (!e.exId) return;
        veces[e.exId] = (veces[e.exId] || 0) + 1;
      });
    });

    const top = Object.keys(veces)
      .sort(function (a, b) { return veces[b] - veces[a]; })
      .slice(0, cuantos || 10);

    const filas = top.map(function (id) {
      const ex = Data.get(id);
      if (!ex) return null;
      const ult = Store.lastPerformance ? Store.lastPerformance(id) : null;
      const pr = Store.prOf(id);
      const partes = [ex.nameEs];

      const series = (ult && ult.sets) || [];
      const hechas = series.filter(function (x) { return x.done !== false && (x.reps || 0) > 0; });
      if (hechas.length) {
        const s0 = hechas[hechas.length - 1];
        partes.push('última vez ' + hechas.length + 'x' + s0.reps +
          (s0.weight > 0 ? ' con ' + s0.weight + ' kg' : ' sin peso'));
      }
      if (pr && pr.best && pr.best.weight > 0) partes.push('tope ' + pr.best.weight + ' kg');
      partes.push(veces[id] + (veces[id] === 1 ? ' sesión' : ' sesiones'));
      return partes.join(', ');
    }).filter(Boolean);

    return filas.length ? filas.join(' | ') : '';
  }

  /* Series por semana y músculo de lo entrenado de verdad, y lo que lleva
     abandonado. Es la diferencia entre «equilibra tu plan» y «llevas 34 días
     sin tocar dorsales». */
  /* Los grandes. Que uno de estos no aparezca nunca en el historial dice más
     que cualquier otra cosa, y hasta ahora no se contaba: solo salían los que
     se habían entrenado alguna vez y llevaban tiempo parados. */
  const MUSCULOS_GRANDES = ['chest', 'lats', 'middle back', 'shoulders', 'quadriceps',
    'hamstrings', 'glutes', 'biceps', 'triceps', 'abdominals'];

  function volumenYolvidos() {
    const salida = [];
    const tieneVolumen = {};

    if (g.Programa && Programa.volumenReal) {
      /* volumenReal devuelve {porMusculo, sesiones, semanas}: iterar el objeto
         entero metía «sesiones 8, semanas 6» en la lista de músculos. */
      const real = Programa.volumenReal(6);
      const porMusculo = (real && real.porMusculo) || {};
      const claves = Object.keys(porMusculo).filter(function (m) { return porMusculo[m] > 0; });
      claves.forEach(function (m) { tieneVolumen[m] = true; });
      if (claves.length) {
        claves.sort(function (a, b) { return porMusculo[b] - porMusculo[a]; });
        salida.push('SERIES REALES POR SEMANA (últimas 6 semanas, de lo que ha ' +
          'registrado): ' + claves.map(function (m) {
            return I18N.muscle(m) + ' ' + String(porMusculo[m]).replace('.', ',');
          }).join(', ') + '.');
      }
    }

    /* cuándo se tocó por última vez cada músculo */
    /* Se apuntan primarios y secundarios. Mirando solo los primarios, un
       músculo que sí recibe trabajo indirecto —el hombro en todo lo que sea
       empujar— salía como «nunca entrenado» mientras el volumen de arriba le
       contaba series. Dos bloques contradiciéndose en el mismo prompt es la
       forma más rápida de que salga un consejo equivocado. */
    const ultima = {};
    const apunta = function (m, cuando) {
      if (!ultima[m] || cuando > ultima[m]) ultima[m] = cuando;
    };
    Store.sessions().forEach(function (x) {
      (x.entries || []).forEach(function (e) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        (ex.primaryMuscles || []).forEach(function (m) { apunta(m, x.start); });
        (ex.secondaryMuscles || []).forEach(function (m) { apunta(m, x.start); });
      });
    });

    const olvidados = Object.keys(ultima).map(function (m) {
      return { m: m, dias: Math.floor((Date.now() - ultima[m]) / 864e5) };
    }).filter(function (x) { return x.dias >= 10; })
      .sort(function (a, b) { return b.dias - a.dias; })
      .slice(0, 5);

    if (olvidados.length) {
      salida.push('SIN TOCAR DESDE HACE TIEMPO: ' + olvidados.map(function (x) {
        return I18N.muscle(x.m) + ' (' + x.dias + ' días)';
      }).join(', ') + '.');
    }

    /* los que no aparecen en ninguna sesión, nunca */
    if (Store.sessions().length >= 3) {
      const jamas = MUSCULOS_GRANDES.filter(function (m) {
        return !ultima[m] && !tieneVolumen[m];
      });
      if (jamas.length) {
        salida.push('NUNCA HA ENTRENADO (no aparece en ninguna sesión registrada): ' +
          jamas.map(I18N.muscle).join(', ') + '.');
      }
    }

    return salida.join('\n');
  }

  /* Lo que se propone frente a lo que cumple. Una respuesta que da por hecho
     que entrena cinco días cuando entrena dos no sirve de nada. */
  function constancia() {
    const ses = Store.sessions();
    if (ses.length < 3) return '';

    const desde = Date.now() - 28 * 864e5;
    const mes = ses.filter(function (x) { return x.start >= desde; });
    const dias = {};
    let minutos = 0;
    let conDuracion = 0;

    mes.forEach(function (x) {
      dias[Store.dayKey(x.start)] = true;
      const d = ((x.end || x.start) - x.start) / 60000;
      if (d > 5 && d < 240) { minutos += d; conDuracion++; }
    });

    const porSemana = (Object.keys(dias).length / 4).toFixed(1).replace('.', ',');
    const partes = ['CONSTANCIA REAL: ' + porSemana + ' días por semana en el último mes'];
    if (conDuracion) partes.push('sesiones de ' + Math.round(minutos / conDuracion) + ' min de media');

    const previstos = Store.routines().reduce(function (n, r) {
      return n + ((r.days || []).length ? 1 : 0);
    }, 0);
    if (previstos) partes.push('tiene ' + previstos + ' rutinas con día asignado');

    return partes.join(', ') + '.';
  }

  /* Lo que come de verdad contra lo que le toca */
  function comidaReal() {
    if (!g.Comidas) return '';
    const dd = Comidas.ultimos(14).filter(function (d) { return d.kcal > 0; });
    if (!dd.length) return 'COMIDA: todavía no hay días apuntados, así que de su ' +
      'alimentación solo sabes el objetivo calculado. No des por hecho que lo cumple, ' +
      'pero tampoco se lo eches en cara: sin datos, de comida no opinas.';

    const mk = Math.round(dd.reduce(function (a, d) { return a + d.kcal; }, 0) / dd.length);
    const mp = Math.round(dd.reduce(function (a, d) { return a + d.prot; }, 0) / dd.length);
    return 'COMIDA REAL: media de ' + mk + ' kcal y ' + mp + ' g de proteína en los ' +
      dd.length + ' días que ha apuntado de las dos últimas semanas.';
  }

  function favoritos() {
    const f = (Store.favorites() || []).map(function (id) {
      const ex = Data.get(id);
      return ex ? ex.nameEs : null;
    }).filter(Boolean).slice(0, 12);
    return f.length ? 'EJERCICIOS QUE SE HA MARCADO COMO FAVORITOS: ' + f.join(', ') + '.' : '';
  }

  /* ¿Está estrenando la app? No ha llegado a registrar ni una serie. Eso no es
     dejadez, es el primer día: no se le puede auditar lo que aún no ha tenido
     ocasión de hacer, y menos descontarle nota del plan por ello. */
  function sinHistorial() {
    return !Store.sessions().length || !Store.stats().totalSets;
  }

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
    else {
      trozos.push('PERFIL: sin completar. No te inventes edad, peso ni objetivo: si te ' +
        'hacen falta para responder bien, dilo y pide que rellene su perfil.');
    }

    if (incluir.objetivos !== false) {
      const o = Objetivos.resumen();
      if (o) trozos.push('OBJETIVOS QUE SE HA PUESTO: ' + o);
    }

    if (incluir.rutinas) {
      const r = Store.routines();
      if (r.length) {
        trozos.push('RUTINAS ACTUALES: ' + r.map(function (x) {
          return x.name + ' (' + ((x.days || []).join('/') || 'sin día') + '): ' +
            x.exercises.map(function (e) {
              const ex = Data.get(e.exId);
              return (ex ? ex.nameEs : e.exId) + ' ' + e.sets + 'x' + e.reps;
            }).join(', ');
        }).join(' | '));
      } else {
        trozos.push('RUTINAS ACTUALES: ninguna guardada.');
      }
    }

    /* Sin historial no hay nada que reprochar: quien no ha registrado series es
       porque acaba de instalar la app, no porque entrene mal. Sin avisar de
       esto, el dictamen gastaba un punto de tres en regañarle por no tener
       datos y le bajaba la nota del plan por algo que no es del plan. */
    const arrancando = sinHistorial();
    if (arrancando) {
      trozos.push('ACABA DE EMPEZAR CON LA APP: todavía no ha registrado ningún ' +
        'entrenamiento ni ninguna comida, y eso es lo normal en quien está montando su ' +
        'primer plan. NO se lo reproches, no lo cuentes como un fallo suyo y no lo ' +
        'menciones entre los defectos: no tienes derecho a juzgar a alguien por datos ' +
        'que aún no ha tenido ocasión de generar. Júzgale el plan y nada más.');
    }

    if (incluir.progreso !== false && arrancando) {
      trozos.push('PROGRESO: no hay historial todavía. No tienes con qué juzgar su ' +
        'progreso, su constancia ni sus cargas, así que no opines de eso —ni para bien ' +
        'ni para mal— y no lo cuentes como defecto.');
    } else if (incluir.progreso !== false) {
      const s = Store.stats();
      trozos.push('PROGRESO: ' + s.total + ' entrenamientos registrados, ' +
        s.week + ' esta semana, racha de ' + s.streak + ' días.');

      const c = constancia();
      if (c) trozos.push(c);

      const v = volumenYolvidos();
      if (v) trozos.push(v);

      const t = Perfil.tendencia(30);
      if (t) {
        trozos.push('PESO: ' + (t.dif >= 0 ? '+' : '') + t.dif.toFixed(1).replace('.', ',') +
          ' kg en los últimos 30 días, con ' + t.n + ' pesajes.');
      } else {
        trozos.push('PESO: no se pesa con regularidad, así que no puedes saber si sube o baja.');
      }
    }

    if (incluir.cargas) {
      const c = cargasReales(incluir.cargas === true ? 10 : incluir.cargas);
      if (c) trozos.push('CON QUÉ ENTRENA DE VERDAD (de sus sesiones registradas): ' + c + '.');
      else if (!arrancando) trozos.push('Aún no ha registrado series con peso, así que no sabes qué cargas mueve.');
    }

    if (incluir.comida) {
      const c = comidaReal();
      if (c) trozos.push(c);
    }

    if (incluir.favoritos) {
      const f = favoritos();
      if (f) trozos.push(f);
    }

    /* El sitio puede venir impuesto por quien llama —al montar un plan se elige
       ahí—; si no, manda el ajuste global. Leer siempre el global hacía que el
       contexto dijera «gimnasio» mientras el catálogo era de peso corporal. */
    const gear = incluir.gear || Store.settings().gear;
    const gset = Data.GEAR[gear];
    if (gset) {
      trozos.push('DÓNDE ENTRENA Y CON QUÉ: ' + Data.gearFrase(gear) + '. Material ' +
        'disponible: ' + gset.note.toLowerCase() + '. Esto es innegociable: un ejercicio ' +
        'que necesite algo que no tiene no le sirve de nada, por bueno que sea.');
    }

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

    const prompt = contexto({ progreso: true, comida: true }) + '\n\n' +
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
    const prompt = contexto({ rutinas: true, progreso: true, cargas: true, favoritos: true }) +
      '\n\n' + 'Audita mis rutinas tal y como están. No las reescribas enteras ni me ' +
      'cuentes lo que ya está bien.\n\n' +
      BAREMO +
      '- De tres a cinco puntos, y al menos tres tienen que ser fallos concretos ' +
      'con su consecuencia. Cita las rutinas y los ejercicios por su nombre.\n' +
      '- Mira el reparto de volumen entre músculos, los patrones que falten y la ' +
      'frecuencia semanal' +
      (sinHistorial()
        ? '. Aún no he registrado ni una serie porque acabo de montar esto: ' +
          'no me lo eches en cara ni lo cuentes como fallo, audita las rutinas por ' +
          'cómo están escritas.\n'
        : ', y si lo que entreno de verdad se parece a lo que tengo apuntado.\n') +
      '- Si nombras un ejercicio de recambio, que sea uno del catálogo de abajo y ' +
      'escrito igual: lo que no esté ahí no lo tengo y no me sirve.\n' +
      menuEjercicios([]) + '\n' +
      'Devuelve JSON: {"nota":número del 0 al 10,' +
      '"veredicto":"2 frases sin rodeos","puntos":[{"titulo":"3-5 palabras",' +
      '"detalle":"1-2 frases con la consecuencia"}]}';
    return llamarJSON(prompt, { maxTokens: 6144, temperatura: 0.15 });
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

  /* ---------- una frase, la que toque hoy ----------
     Va donde antes no había nada. Tiene que ser corta y suya: un «tú puedes»
     genérico no lo lee nadie dos veces. Se guarda medio día para no gastar una
     llamada por cada vez que se entra en la pantalla. */
  function pildora() {
    const ses = Store.sessions();
    const clave = 'pildora:' + Store.dayKey(Date.now()) + ':' +
      Store.routines().length + ':' + ses.length;
    const guardado = leerCache(clave, 12);
    if (guardado) return Promise.resolve(guardado);

    const prompt = contexto({ progreso: true, cargas: true, comida: true }) + '\n\n' +
      'EXCEPCIÓN A TUS NORMAS, solo para esto: aquí SÍ quiero que animes. Es la frase ' +
      'que ve al abrir su programa y tiene que dejarle con ganas de entrenar, no ' +
      'regañado. Sigues sin adular en hueco y sin prometer nada, pero el tono es de ' +
      'alguien que está de su lado.\n\n' +
      'Escríbele UNA frase, la que más le empuje hoy.\n' +
      '- Máximo 20 palabras. Una frase, no dos.\n' +
      '- Engánchala a algo suyo de los datos de arriba: lo que levanta, lo que ya ha ' +
      'conseguido, lo que tiene a tiro, su meta. Una frase que le valga a cualquiera no ' +
      'sirve.\n' +
      '- Si va bien, díselo y dile qué viene ahora. Si lleva tiempo parado, que sea una ' +
      'invitación a volver, no un reproche.\n' +
      '- Si apenas tiene datos, empújale a entrenar hoy: el primer registro es el que ' +
      'pone todo lo demás en marcha.\n' +
      '- Nada de signos de exclamación, emojis, ni «tú puedes» de calendario.\n\n' +
      'Devuelve JSON: {"frase":"la frase","tipo":"empujon|tecnica|aviso"}';

    return llamarJSON(prompt, { maxTokens: 3072, temperatura: 0.8 }).then(function (r) {
      const limpio = { frase: String((r && r.frase) || '').trim(), tipo: (r && r.tipo) || '' };
      if (!limpio.frase) throw new Error('sin frase');
      escribirCache(clave, limpio);
      return limpio;
    });
  }

  /* ---------- montar el programa entero con IA ----------
     El programa que hace programa.js es determinista: reparte patrones sobre
     plantillas y sale siempre algo coherente, pero dos personas con el mismo
     perfil reciben lo mismo. De ahí que se lea genérico. Esto es lo contrario:
     se le da todo lo que la app sabe de la persona —lo que levanta, lo que
     abandona, los días que cumple de verdad, lo que come, sus limitaciones— y
     el catálogo del que puede elegir, y monta la semana entera.
     La calculadora se queda: es la que responde sin clave y la que sirve de
     red cuando la IA devuelve algo que no cuadra. */
  function crearPrograma(o) {
    o = o || {};
    const dias = o.dias || [];
    if (!dias.length) return Promise.reject(new Error('Elige al menos un día.'));

    const objetivo = Programa.OBJETIVOS[o.objetivo] || {};
    const minimo = Store.MINIMO_EJERCICIOS || 6;

    /* los músculos que va a tocar la semana, para darle más catálogo de esos */
    const foco = o.foco && o.foco !== 'equilibrado' ? o.foco : '';

    const gset = Data.GEAR[o.gear] || {};
    const prompt = contexto({
      progreso: true, cargas: true, comida: true, favoritos: true, rutinas: true,
      gear: o.gear
    }) + '\n\n' +
      'ENCARGO: móntale el programa de entrenamiento de una semana, entero.\n' +
      'DÓNDE VA A ENTRENAR: ' + (gset.label || o.gear) +
      (gset.note ? ' — ' + gset.note.toLowerCase() + '—' : '') + '. Todo el plan tiene ' +
      'que poder hacerse ahí. El catálogo de abajo ya viene filtrado por ese material: ' +
      'si eliges algo que no está en él, la rutina no se le puede aplicar.\n' +
      'DÍAS QUE PUEDE ENTRENAR: ' + dias.map(UI.diaLargo).join(', ') +
      ' (' + dias.length + ' sesiones).\n' +
      'TIEMPO POR SESIÓN: ' + (o.minutos || 60) + ' minutos contando calentamiento ' +
      'y descansos. Ajusta el número de ejercicios a ese tiempo de verdad: con los ' +
      'descansos que pongas, la cuenta tiene que salir.\n' +
      'OBJETIVO: ' + (objetivo.label || o.objetivo) + '. ' + (objetivo.resumen || '') + '\n' +
      (foco ? 'QUIERE PRIORIZAR: ' + foco + '. Dale algo más de volumen sin desmontar ' +
        'el resto.\n' : '') +
      (o.objetivoSeries ? 'REFERENCIA DE VOLUMEN: la app calcula que le tocan unas ' +
        o.objetivoSeries + ' series semanales por músculo grande para su nivel y su ' +
        'objetivo. Puedes separarte de esa cifra si tienes un motivo, pero dilo.\n' : '') +
      (o.lesiones && o.lesiones.length
        ? 'LIMITACIONES A RESPETAR: ' + o.lesiones.join(', ') + '. Esto manda sobre ' +
          'cualquier otra consideración.\n' : '') +
      (o.molestias ? 'LE MOLESTA AHORA MISMO: "' + o.molestias + '". No es una lesión ' +
        'diagnosticada, es lo que nota hoy: esquiva lo que le dé por ahí y dilo en las ' +
        'razones.\n' : '') +
      (o.notas ? 'LO QUE HA ESCRITO DE SU PUÑO Y LETRA: "' + o.notas + '". Esto pesa más ' +
        'que cualquier norma general: si pide algo concreto, dáselo, y si lo que pide ' +
        'choca con su objetivo, dale lo que pide y explícale el coste en una frase.\n' : '') +
      menuEjercicios(o.musculos || [], o.gear) + '\n' +
      'CÓMO TIENE QUE SER:\n' +
      '- Cada sesión, entre ' + minimo + ' y ' + (minimo + 3) + ' ejercicios, los ' +
      'básicos delante y el accesorio detrás.\n' +
      '- Reparte los músculos entre los días para que nada se entrene dos días ' +
      'seguidos sin descanso, mirando los días concretos que te ha dado.\n' +
      '- Si arriba ves que lleva músculos abandonados o que nunca ha entrenado ' +
      'alguno, este plan es donde se arregla: méteselos y dilo en las razones.\n' +
      '- Si ves con qué cargas entrena, usa ESOS ejercicios donde encajen: ya sabe ' +
      'hacerlos y sabes por dónde va de fuerza.\n' +
      '- Si los días que dice que va a entrenar no cuadran con los que cumple de ' +
      'verdad, dilo en las razones sin sermonear.\n' +
      '- Los nombres de ejercicio, EXACTOS del catálogo. Lo que no esté ahí no existe.\n\n' +
      'Devuelve JSON, sin nada fuera de él:\n' +
      '{"nombre":"cómo llamarías a este plan, 2-4 palabras",\n' +
      '"razones":["4 a 6 frases. Cada una cita un dato suyo de arriba y explica una ' +
      'decisión concreta del plan. Nada que valga para otra persona."],\n' +
      '"sesiones":[{"dia":"Lun","nombre":"3-4 palabras, qué se trabaja",' +
      '"ejercicios":[{"ejercicio":"nombre EXACTO del catálogo","series":número,' +
      '"reps":número,"descanso":segundos,"porque":"media frase"}]}],\n' +
      '"progresion":[{"semana":"Semanas 1-2","texto":"qué hacer esas semanas, con números"}],\n' +
      '"cardio":"1-2 frases sobre qué hacer los días que no entrena, o cadena vacía",\n' +
      '"aviso":"lo que deba tener presente por sus limitaciones o su edad, o cadena vacía"}';

    return llamarJSON(prompt, { maxTokens: 8192, temperatura: 0.6 });
  }

  /* El baremo. Sin él la nota salía a ojo y el mismo plan sacaba un 4 una vez y
     un 5,5 la siguiente, que es justo lo que hace desconfiar de un dictamen.
     Con los tramos escritos, la nota se deduce de los fallos encontrados en
     lugar de improvisarse. */
  const BAREMO =
    'CÓMO SE PONE LA NOTA —ciñete a esto, no la pongas a ojo:\n' +
    '- 9 o 10: no tocarías nada.\n' +
    '- 7 u 8: correcto; como mucho detalles menores.\n' +
    '- 5 o 6: funciona, pero tiene uno o dos fallos que frenan el progreso.\n' +
    '- 3 o 4: TRES o más fallos, o uno que suponga riesgo.\n' +
    '- 0 a 2: hay riesgo de lesión o el plan es incoherente.\n' +
    'La nota sale de los fallos que encuentres EN EL PROPIO PLAN —qué ejercicios ' +
    'lleva, cómo reparte el volumen, en qué orden, con qué descansos— y de su ' +
    'gravedad. Números enteros.\n' +
    'Lo que haga o deje de hacer fuera del plan —no registrar entrenamientos, no ' +
    'apuntar la comida, cumplir menos días de los que dice— NO es un fallo del plan ' +
    'y no baja su nota. Si aun así merece un comentario, va en el consejo final, no ' +
    'entre los puntos.\n';

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
    const minimo = Store.MINIMO_EJERCICIOS || 6;

    const suyos = [];
    (r.exercises || []).forEach(function (e) {
      const ex = Data.get(e.exId);
      if (ex) (ex.primaryMuscles || []).forEach(function (m) {
        if (suyos.indexOf(m) === -1) suyos.push(m);
      });
    });

    const prompt = contexto({ progreso: true, cargas: true, favoritos: true,
      gear: Store.settings().gear }) + '\n\n' +
      'RUTINA A AUDITAR — "' + (r.name || 'sin nombre') + '", ' + dias + ':\n' + lista + '\n' +
      menuEjercicios(suyos) +
      (r.note ? 'NOTAS QUE LE PUSO: ' + r.note + '\n' : '') +
      '\nAudita esta rutina concreta. No me cuentes lo que ya está bien.\n' +
      (sinHistorial()
        ? 'Ojo: acaba de empezar con la app y no tiene nada registrado. Audítale la ' +
          'rutina por lo que es —los ejercicios, el orden, las series— y no por lo que ' +
          'no ha apuntado todavía.\n'
        : '') +
      BAREMO +
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
      'Si un cambio no la mejora de verdad, no lo propongas.\n' +
      '- Y aparte de los cambios sueltos, escribe en "rutina" cómo quedaría la ' +
      'sesión entera ya corregida: todos los ejercicios en el orden en que hay que ' +
      'hacerlos, con sus series, repeticiones y descanso. Es la rutina que tú ' +
      'montarías para esta persona, no una lista de parches: los básicos delante y ' +
      'el accesorio detrás. Entre ' + minimo + ' y ' + (minimo + 3) + ' ejercicios, ' +
      'ni uno menos de ' + minimo + ' —que es el mínimo que admite la app—, todos ' +
      'con el nombre EXACTO del catálogo.\n\n' +
      'Devuelve JSON: {"nota":número del 0 al 10,' +
      '"veredicto":"2 frases sin rodeos",' +
      '"puntos":[{"titulo":"3-5 palabras","detalle":"1-2 frases con la consecuencia"}],' +
      '"cambios":[{"accion":"cambiar|quitar|anadir","quitar":"nombre exacto o vacío",' +
      '"poner":"nombre o vacío","series":número o 0,"reps":número o 0,' +
      '"porque":"1 frase"}],' +
      '"rutina":[{"ejercicio":"nombre EXACTO del catálogo","series":número,' +
      '"reps":número,"descanso":segundos,"porque":"media frase"}],' +
      '"consejo":"lo que más cambiaría el resultado de esta rutina, 1 frase"}';

    /* Un dictamen no es un texto creativo: con temperatura alta el mismo plan
       sacaba una nota distinta en cada consulta. */
    return llamarJSON(prompt, { maxTokens: 8192, temperatura: 0.15 });
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

    /* Dos cuentas separadas, y dichas como lo que son. Juntar las series que un
       músculo entrena a propósito con las que le caen de rebote infla al hombro
       —sale de secundario en todos los press— y hunde al pecho, que no recibe
       rebote de nada. Con el total a secas, el dictamen concluía «el doble de
       hombro que de pecho» en planes con 13 de hombro y 11 de pecho, y ahí se le
       iba un punto de tres en una crítica falsa. */
    const dir = prog.directas || {};
    const volumen = Object.keys(prog.volumen).map(function (m) {
      const d = dir[m] || 0;
      const t = prog.volumen[m];
      return I18N.muscle(m) + ' ' + d + (t > d ? ' (+' + (t - d) + ' indirectas)' : '');
    }).join(', ');

    /* Lo que de verdad entrena, no lo que dice que va a entrenar. Sin esto la
       crítica sale de manual y vale para cualquiera. */
    let historial = '';
    if (prog.real && prog.real.porMusculo && Object.keys(prog.real.porMusculo).length) {
      historial = 'SERIES REALES POR SEMANA (últimas 6 semanas, de sus entrenamientos ' +
        'registrados): ' + Object.keys(prog.real.porMusculo).map(function (m) {
          return I18N.muscle(m) + ' ' + prog.real.porMusculo[m];
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
        comida += 'AÚN NO HA APUNTADO NINGÚN DÍA DE COMIDA, así que de su alimentación ' +
          'solo sabes el objetivo calculado. Con eso no puedes auditarle la dieta: en ' +
          '"nutricion" dile qué tiene que cuadrar para que este plan rinda —proteína al ' +
          'día, calorías— usando esos números, y no gastes el hueco en pedirle que ' +
          'apunte la comida.\n';
      }
    }

    const prompt = contexto({ progreso: true, cargas: true, comida: true }) + '\n\n' +
      (prog.deRutinas
        ? 'ESTE ES EL PLAN QUE YA ENTRENA, guardado en sus rutinas como «' +
          prog.deRutinas + '». No es una propuesta: es lo que hace cada semana, así ' +
          'que háblale de lo que ya está haciendo, no de lo que «va a hacer».'
        : prog.porIA
          ? 'PROGRAMA QUE ACABAS DE MONTARLE TÚ. Reléelo con ojo crítico y no lo ' +
            'defiendas por ser tuyo: si ves un fallo, dilo igual.'
          : 'PROGRAMA PROPUESTO por la calculadora de la app') +
      ' (objetivo ' + prog.objetivoLabel + ', RPE tope ' + prog.rpe +
      ', unas ' + prog.objetivoSeries + ' series semanales por músculo):\n' + dias + '\n' +
      'SERIES DIRECTAS POR SEMANA Y MÚSCULO: ' + volumen + '\n' +
      'Las directas son las que cuentan para decidir si un músculo está bien ' +
      'servido: son las de los ejercicios que lo tienen como objetivo. Entre paréntesis ' +
      'va el trabajo indirecto, el que le cae por salir de secundario en otros ' +
      'ejercicios; ese NO se suma para juzgar el reparto y no lo cites como si fueran ' +
      'series del músculo. Para hipertrofia, de 10 a 20 directas por músculo y semana ' +
      'es la franja razonable: no llames excesivo a lo que esté dentro, ni escaso a lo ' +
      'que pase de 10.\n' + historial + comida +
      (prog.lesiones.length ? 'LIMITACIONES YA APLICADAS: ' + prog.lesiones.join(', ') + '\n' : '') +
      menuEjercicios(Object.keys(prog.volumen || {})) +
      '\nTe han contratado para auditar este programa, no para animar a nadie.\n\n' +
      'REGLAS INNEGOCIABLES:\n' +
      (sinHistorial()
        ? '- Acaba de instalar la app y todavía no ha registrado ni un entrenamiento ni ' +
          'una comida. Eso NO es un defecto y no puede aparecer entre los puntos ni ' +
          'bajarle la nota: está montando su primer plan, que es exactamente lo que ' +
          'toca hacer primero. Juzga el papel que tienes delante.\n'
        : '') +
      '- De los puntos que devuelvas, al menos tres tienen que ser críticas ' +
      'concretas con su consecuencia: qué falla, por qué importa y qué pasa si se ' +
      'deja así. Nada de generalidades que valgan para cualquiera.\n' +
      '- Habla de ESTE plan y de ESTA persona: cita ejercicios por su nombre, ' +
      'músculos por sus series y días por su número. Si un consejo se lo podrías ' +
      'dar a otro cualquiera, bórralo y busca otro.\n' +
      BAREMO +
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

    /* Un dictamen no es un texto creativo: con temperatura alta el mismo plan
       sacaba una nota distinta en cada consulta. */
    return llamarJSON(prompt, { maxTokens: 8192, temperatura: 0.15 });
  }

  /* Mira una foto de comida y estima lo que hay. Es una aproximación y se dice
     que lo es: nadie acierta los gramos de un plato por una foto, ni una
     persona ni un modelo. Sirve para saber si el día va corto de proteína, que
     es la pregunta de verdad, no para contar calorías al gramo. */
  function analizarComida(imagen, pista) {
    const m = Perfil.macros ? Perfil.macros() : null;
    const p = Perfil.datos ? Perfil.datos() : {};

    let suyo = '';
    if (m) {
      suyo = 'Al día le tocan ' + m.kcal + ' kcal y ' + m.prot + ' g de proteína' +
        (p.objetivo ? ', con el objetivo de ' + (Perfil.OBJETIVO[p.objetivo] || {}).label : '') +
        '.\n';

      /* Lo que ya lleva comido hoy: sin eso, «te has pasado» o «te falta» son
         frases al aire. Con eso, la nota puede decir cuánto le queda. */
      if (g.Comidas) {
        const h = Comidas.hoy();
        suyo += h.kcal > 0
          ? 'Hoy lleva ya ' + h.kcal + ' kcal y ' + h.prot + ' g de proteína ANTES de ' +
            'este plato, así que le quedan ' + Math.max(0, m.kcal - h.kcal) + ' kcal y ' +
            Math.max(0, m.prot - h.prot) + ' g de proteína para el resto del día.\n'
          : 'Este es el primer plato que apunta hoy.\n';
      }
    }
    if (p.dieta && p.dieta !== 'omnivora') {
      suyo += 'Sigue una dieta ' + (Perfil.DIETA[p.dieta] || p.dieta) + '.\n';
    }
    if (p.alergias) suyo += 'No puede comer: ' + p.alergias + '. Si ves algo de eso en ' +
      'el plato, dilo en la nota antes que nada.\n';
    if (p.condiciones) suyo += 'Condiciones de salud: ' + p.condiciones + '.\n';

    const prompt = PERSONA + '\n\nAhora estás mirando la foto de un plato.\n' + suyo +
      (pista ? 'Quien la ha hecho añade: "' + pista + '".\n' : '') +
      '\nDi qué alimentos ves y estima la ración de cada uno en gramos o en medidas ' +
      'caseras. Suma las calorías y la proteína del plato entero. Si la foto no deja ' +
      'ver bien algo, tira por lo más probable en una comida normal y bájale la ' +
      'confianza. Si en la foto no hay comida, dilo con kcal 0.\n\n' +
      'Devuelve JSON: {"plato":"cómo llamarías a esto en 2-5 palabras",' +
      '"alimentos":[{"que":"nombre","cuanto":"ración estimada","kcal":número,' +
      '"prot":número}],"kcal":número,"prot":número,' +
      '"confianza":"alta|media|baja","nota":"una frase con lo que no has podido ' +
      'ver bien o lo que has dado por supuesto"}\n\n' +
      'Estima sin miedo pero sin adornar: si el plato lleva más aceite o más ' +
      'azúcar de lo que parece, cuéntalo. Mira el tamaño de la ración contra lo que ' +
      'hay alrededor en la foto —el plato, los cubiertos, el vaso— antes de decidir ' +
      'los gramos, que es donde más se falla. Y en la nota, habla de lo que le queda ' +
      'del día con los números de arriba, no en abstracto.';

    return llamarJSON(prompt, {
      imagen: imagen, maxTokens: 4096, temperatura: 0.3
    });
  }

  /* Lectura del progreso reciente */
  function analizarProgreso() {
    const sesiones = Store.sessions().slice(0, 20).map(function (s) {
      return UI.fechaCorta(s.start) + ': ' + s.routineName + ', ' + s.setsDone +
        ' series, ' + Math.round(s.volume) + ' kg';
    }).join(' | ');

    if (!sesiones) return Promise.reject(new Error('Aún no hay entrenamientos que analizar.'));

    const prompt = contexto({ progreso: true, cargas: true }) + '\n\nÚLTIMAS SESIONES: ' + sesiones + '\n\n' +
      'Analiza cómo voy de verdad, mirando fechas, huecos, series y cargas.\n' +
      '- "bien": una frase, y solo lo que se sostenga con estos datos. Si no hay ' +
      'nada destacable, escribe exactamente eso y no lo maquilles.\n' +
      '- "flojo": lo peor que ves, con números y con lo que va a pasar si sigue ' +
      'igual. Aquí no te cortes.\n' +
      '- "accion": una sola cosa, concreta y hacedera esta semana.\n\n' +
      'Devuelve JSON: {"bien":"1 frase","flojo":"2 frases","accion":"1 frase"}';
    return llamarJSON(prompt, { maxTokens: 4096, temperatura: 0.15 });
  }

  /* Pregunta libre al entrenador */
  function preguntar(texto) {
    const prompt = contexto({
      rutinas: true, progreso: true, cargas: true, comida: true, favoritos: true
    }) + '\n\nPREGUNTA: ' + texto +
      '\n\nResponde en menos de 150 palabras, sin listas salvo que ayuden de verdad. ' +
      'No des la razón por costumbre: si la pregunta parte de algo falso o de un ' +
      'mito de gimnasio, corrígelo antes de contestar. Si la respuesta honesta es ' +
      '"depende", di de qué depende y con qué números, en vez de escurrir el bulto.';
    return llamar(prompt, { maxTokens: 4096 });
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
    const p = Perfil.datos ? Perfil.datos() : {};
    const nivel = { beginner: 'principiante', intermediate: 'intermedio', expert: 'avanzado' }[p.experiencia];

    /* La explicación se guarda un mes para no gastar cuota repitiéndola. Al
       depender ahora del nivel y de las limitaciones, la clave las incluye: si
       cambian, la explicación se rehace en vez de servir la de antes. */
    const clave = 'ejercicio:' + ex.id + ':' + (nivel || '-') + ':' +
      String(p.lesiones || '').slice(0, 40);
    const guardado = leerCache(clave, 24 * 30);
    if (guardado) return Promise.resolve(guardado);

    const suyo = (nivel ? 'Quien lo va a hacer es ' + nivel + '. ' : '') +
      (p.edad ? 'Tiene ' + p.edad + ' años. ' : '') +
      (p.lesiones ? 'Arrastra esto: ' + p.lesiones + '. Si alguna de esas cosas cambia ' +
        'cómo hay que hacer este ejercicio, dilo en el primer paso; y si el ejercicio ' +
        'no le conviene, dilo claro en el primer fallo. ' : '');

    const prompt = PERSONA + '\n\nEjercicio: ' + ex.nameEs + ' (' + ex.name + '). ' +
      'Músculos: ' + ex.primaryMuscles.map(I18N.muscle).join(', ') + '. ' +
      'Material: ' + I18N.equip(ex.equipment) + '.\n' +
      (suyo ? suyo + '\n' : '') + '\n' +
      'Explica cómo se hace bien: la ejecución en 3 o 4 pasos, los dos fallos más ' +
      'habituales y un truco para notarlo en el músculo correcto. Los pasos son ' +
      'instrucciones, no ánimos: postura, recorrido y respiración. Si el ejercicio ' +
      'tiene un riesgo real cuando se hace mal, dilo en el fallo que corresponda.\n\n' +
      'Devuelve JSON: {"pasos":["paso"],"fallos":["fallo y su corrección"],"truco":"1 frase"}';

    return llamarJSON(prompt, { maxTokens: 4096 }).then(function (r) {
      escribirCache(clave, r);
      return r;
    });
  }

  g.IA = {
    config: config, guardarConfig: guardarConfig, borrarConfig: borrarConfig, activa: activa,
    PROVEEDORES: PROVEEDORES, proveedor: proveedor, proveedorActual: proveedorActual,
    proveedorPorId: proveedorPorId, claveDe: claveDe, modeloDe: modeloDe,
    guardarProveedor: guardarProveedor, elegirProveedor: elegirProveedor,
    configurados: configurados, borrarTodo: borrarTodo,
    llamar: llamar, llamarJSON: llamarJSON, contexto: contexto, limpiarCache: limpiarCache,
    listarModelos: listarModelos,
    planNutricion: planNutricion, revisarRutinas: revisarRutinas,
    revisarRutina: revisarRutina, afinarPrograma: afinarPrograma,
    crearPrograma: crearPrograma, pildora: pildora,
    analizarComida: analizarComida,
    playlistEntreno: playlistEntreno, AMBIENTES: AMBIENTES,
    memoriaMusical: memoriaMusical, recordarMusica: recordarMusica, olvidarMusica: olvidarMusica,
    analizarProgreso: analizarProgreso, preguntar: preguntar, explicarEjercicio: explicarEjercicio,
    MODELOS: MODELOS
  };
})(window);
