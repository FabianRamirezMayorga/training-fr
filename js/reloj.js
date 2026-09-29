/* reloj.js — traer a la app lo que mide tu reloj.

   Hay que decir de entrada lo que NO se puede, porque marca todo el diseño:
   una página web no puede leer el Apple Watch. Safari no da acceso ni a Salud
   ni a Bluetooth, y eso no lo arregla ningún código. Tampoco existe una API
   web de Google Fit ni de Health Connect.

   Lo que sí existe, y es lo que hay aquí, son tres caminos que funcionan de
   verdad y no cuestan nada:

     1. Bluetooth directo (Web Bluetooth). Cualquier dispositivo que publique
        el servicio estándar de pulso (0x180D): bandas de pecho, pulseras,
        relojes Garmin/Polar/Amazfit en modo difusión. Da el pulso EN VIVO
        mientras entrenas. No existe en iPhone, en ningún navegador.
     2. Importar un archivo que exporte el reloj: .gpx, .tcx, el export.xml de
        Salud de Apple, o un .csv/.json. Funciona en todos los dispositivos.
     3. Pegar lo que manda un atajo de iOS, que sí puede leer Salud. Es la
        única vía automática para Apple Watch, y la monta el propio usuario.

   Los datos se guardan por día y se fusionan: cada fuente rellena lo que sabe
   y no pisa lo que ya había de otra. */
(function (g) {
  'use strict';

  const CLAVE = 'salud';
  const DIA = 864e5;

  /* Campos que se guardan de cada día. Si un día solo trae pasos, el resto se
     queda como estaba: así el atajo de la mañana y el archivo de la tarde
     suman en vez de pisarse. */
  const CAMPOS = ['pasos', 'kcal', 'pulsoReposo', 'pulsoMedio', 'pulsoMax',
    'sueno', 'peso', 'distancia', 'minutos'];

  /* ---------- almacén ---------- */

  function datos() {
    const s = Store.settings()[CLAVE];
    return s && typeof s === 'object' ? s : { dias: {}, fuentes: {} };
  }

  function guardar(d) { Store.setSetting(CLAVE, d); }

  function dias() {
    const d = datos().dias || {};
    return Object.keys(d).sort().map(function (k) {
      return Object.assign({ dia: k, t: fechaDeClave(k) }, d[k]);
    });
  }

  function dia(clave) { return (datos().dias || {})[clave] || null; }

  function fechaDeClave(k) {
    const p = String(k).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).getTime();
  }

  /* Una fecha suelta "2026-09-24" la interpreta el navegador como UTC, así que
     al pasarla a día local se iba al día anterior en media Europa y en toda
     América. Cuando no trae hora, se construye como fecha de aquí. */
  function momento(texto) {
    const s = String(texto || '').trim();
    if (!s) return 0;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
    /* Formatos con barra. Se asume día/mes, que es lo de aquí, pero si el
       segundo número pasa de 12 solo puede ser el formato de EE. UU.: antes
       eso daba un mes 24 y la fecha se iba al año siguiente sin avisar. */
    const b = s.match(/^(\d{1,2})[/](\d{1,2})[/](\d{4})$/);
    if (b) {
      let dia = Number(b[1]), mes = Number(b[2]);
      if (mes > 12 && dia <= 12) { const t = dia; dia = mes; mes = t; }
      if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return 0;
      return new Date(Number(b[3]), mes - 1, dia).getTime();
    }
    return Date.parse(s) || 0;
  }

  /* Mete lo medido de un día sin tirar lo que ya hubiera de otra fuente.
     Los valores a cero o vacíos se ignoran: un archivo que no trae pasos no
     debe poner los pasos a cero. */
  function anotar(clave, valores, fuente) {
    const d = datos();
    d.dias = d.dias || {};
    d.fuentes = d.fuentes || {};
    const actual = d.dias[clave] || {};

    CAMPOS.forEach(function (c) {
      const v = Number(valores[c]);
      if (!isFinite(v) || v <= 0) return;
      /* del pulso máximo se queda el mayor; de lo demás, lo último que llega */
      actual[c] = c === 'pulsoMax' ? Math.max(actual[c] || 0, v) : v;
    });

    if (fuente) {
      actual.fuente = fuente;
      d.fuentes[fuente] = Date.now();
    }
    d.dias[clave] = actual;
    d.ultima = Date.now();
    guardar(d);
    return actual;
  }

  function anotarVarios(lista, fuente) {
    let n = 0;
    lista.forEach(function (x) {
      if (!x || !x.dia) return;
      const hay = CAMPOS.some(function (c) { return Number(x[c]) > 0; });
      if (!hay) return;
      anotar(x.dia, x, fuente);
      n++;
    });
    return n;
  }

  function borrarTodo() { guardar({ dias: {}, fuentes: {} }); }

  function hayDatos() { return Object.keys(datos().dias || {}).length > 0; }

  /* Resumen de los últimos n días: medias de lo que haya, ignorando los días
     sin dato en vez de contarlos como cero, que hundiría la media. */
  function resumen(n) {
    const desde = Date.now() - (n || 7) * DIA;
    const lista = dias().filter(function (x) { return x.t >= desde; });
    const out = { dias: lista.length };

    CAMPOS.forEach(function (c) {
      const vals = lista.map(function (x) { return Number(x[c]) || 0; })
        .filter(function (v) { return v > 0; });
      if (!vals.length) return;
      const suma = vals.reduce(function (a, b) { return a + b; }, 0);
      out[c] = {
        media: Math.round(suma / vals.length * 10) / 10,
        total: Math.round(suma),
        max: Math.max.apply(null, vals),
        min: Math.min.apply(null, vals),
        n: vals.length
      };
    });
    return out;
  }

  /* ---------- 1. Bluetooth ---------- */

  const SERV_PULSO = 0x180D;          // Heart Rate
  const CAR_PULSO = 0x2A37;           // Heart Rate Measurement
  const SERV_BATERIA = 0x180F;
  const CAR_BATERIA = 0x2A19;

  let dispositivo = null;
  let servidor = null;
  let pulso = 0;
  let bateria = null;
  let desde = 0;
  const muestras = [];                // para la media y el máximo de la sesión
  const oyentes = [];

  /* A qué aparato queremos estar pegados. Sirve para distinguir un corte
     -se alejó, le falló la señal- de un «suelta», que es cuando esto se pone
     a null: sin esa distinción, el reintento pelearía con el usuario. */
  let queridoId = null;
  let reintento = 0;
  let temporizador = 0;

  function soportaBluetooth() {
    return !!(navigator.bluetooth && navigator.bluetooth.requestDevice);
  }

  /* Volver a un aparato conocido sin preguntar solo se puede si el navegador
     trae getDevices(), que devuelve aquellos a los que ya se dio permiso. Lo
     tienen Chrome en Android y en ChromeOS; el de escritorio lo lleva detrás
     de una bandera. Donde no está, la lista de aparatos sigue valiendo: lo que
     cambia es que el navegador pide confirmar, y eso se dice en pantalla en
     vez de dejar que parezca que la app se olvidó del reloj. */
  function soportaMapeo() {
    return !!(navigator.bluetooth && navigator.bluetooth.getDevices);
  }

  /* Si el Bluetooth del equipo está apagado, el buscador sale vacío y parece
     que el reloj no emite. Preguntarlo antes ahorra ese viaje. */
  function hayAdaptador() {
    if (!navigator.bluetooth || !navigator.bluetooth.getAvailability) {
      return Promise.resolve(true);
    }
    return navigator.bluetooth.getAvailability().catch(function () { return true; });
  }

  /* ---------- el mapa de aparatos ----------
     Se guarda con los ajustes, así que viaja con la cuenta y está en todos sus
     dispositivos. Lo que se guarda es el id que da el navegador y el nombre:
     el id no sirve en otro navegador -cada uno se inventa el suyo- pero el
     nombre sí, y es lo que permite filtrar el buscador para que salga su banda
     y no una lista de diez cosas. */
  function equipos() {
    const e = datos().equipos;
    return Array.isArray(e) ? e : [];
  }

  function recordar(dev) {
    if (!dev || !dev.id) return;
    const d = datos();
    const lista = Array.isArray(d.equipos) ? d.equipos.slice() : [];
    const ya = lista.filter(function (x) { return x.id === dev.id; })[0];
    if (ya) {
      if (dev.name) ya.nombre = dev.name;
      ya.visto = Date.now();
    } else {
      lista.push({ id: dev.id, nombre: dev.name || T('Dispositivo'), visto: Date.now() });
    }
    /* el último primero: es el que casi siempre se quiere otra vez */
    lista.sort(function (a, b) { return (b.visto || 0) - (a.visto || 0); });
    if (lista.length > 8) lista.length = 8;
    d.equipos = lista;
    guardar(d);
  }

  function olvidar(id) {
    const d = datos();
    d.equipos = equipos().filter(function (x) { return x.id !== id; });
    guardar(d);
    /* Y quitarle también el permiso al navegador, si sabe hacerlo: si no, la
       app diría que lo olvidó mientras el navegador lo sigue recordando. */
    if (dispositivo && dispositivo.id === id) {
      if (queridoId === id) desconectar();
      if (dispositivo.forget) { try { dispositivo.forget(); } catch (e) { /* nada */ } }
      dispositivo = null;
      return Promise.resolve();
    }
    if (!soportaMapeo()) return Promise.resolve();
    return navigator.bluetooth.getDevices().then(function (ds) {
      const dev = ds.filter(function (x) { return x.id === id; })[0];
      if (dev && dev.forget) return dev.forget();
    }).catch(function () { /* el permiso se queda; la lista ya está limpia */ });
  }

  /* El aparato de verdad detrás de un id guardado, sin abrir ningún buscador.
     Devuelve null cuando no se puede, y entonces toca preguntar. */
  function recuperar(id) {
    if (dispositivo && dispositivo.id === id) return Promise.resolve(dispositivo);
    if (!soportaMapeo()) return Promise.resolve(null);
    return navigator.bluetooth.getDevices().then(function (ds) {
      return ds.filter(function (x) { return x.id === id; })[0] || null;
    }).catch(function () { return null; });
  }

  /* Por qué no se puede aquí, dicho de forma útil y no como un "no soportado" */
  function porQueNoBluetooth() {
    const ua = navigator.userAgent;
    const esIOS = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (esIOS) {
      return T('En iPhone y iPad ningún navegador puede usar Bluetooth: Apple no ' +
        'lo permite. Usa la importación de archivo o el atajo de Salud.');
    }
    if (/Firefox/.test(ua)) {
      return T('Firefox no tiene Bluetooth. Abre la app en Chrome o Edge y aquí estará.');
    }
    if (!window.isSecureContext) {
      return T('El Bluetooth solo funciona en páginas seguras (https).');
    }
    return T('Este navegador no tiene Bluetooth. Chrome o Edge en Android, ' +
      'Windows, Mac o Linux sí lo tienen.');
  }

  function avisar() {
    const e = estado();
    oyentes.forEach(function (f) { try { f(e); } catch (err) { /* nada */ } });
  }

  function alPulso(fn) {
    if (typeof fn !== 'function') return function () {};
    oyentes.push(fn);
    return function () {
      const i = oyentes.indexOf(fn);
      if (i !== -1) oyentes.splice(i, 1);
    };
  }

  function estado() {
    return {
      conectado: !!(servidor && servidor.connected),
      nombre: dispositivo ? (dispositivo.name || 'Dispositivo') : '',
      pulso: pulso,
      bateria: bateria,
      medio: media(),
      max: muestras.length ? Math.max.apply(null, muestras) : 0,
      muestras: muestras.length,
      id: dispositivo ? dispositivo.id : '',
      volviendo: !!(queridoId && reintento > 0 && !(servidor && servidor.connected))
    };
  }

  function media() {
    if (!muestras.length) return 0;
    return Math.round(muestras.reduce(function (a, b) { return a + b; }, 0) / muestras.length);
  }

  /* El valor llega empaquetado: el primer bit del primer byte dice si el pulso
     viene en uno o en dos bytes. Está en la especificación del servicio. */
  function leerPulso(valor) {
    const plano = valor.getUint8(0);
    return (plano & 0x01) ? valor.getUint16(1, true) : valor.getUint8(1);
  }

  /* Buscar uno nuevo: esto sí abre el selector del navegador, que es una
     ventana suya y no de la app. Es el único momento en que se pregunta. */
  function conectar() {
    if (!soportaBluetooth()) return Promise.reject(new Error(porQueNoBluetooth()));

    return navigator.bluetooth.requestDevice({
      /* se piden los que anuncian pulso; con acceptAllDevices saldrían el
         ratón y los auriculares, y no sirven para nada aquí */
      filters: [{ services: [SERV_PULSO] }],
      optionalServices: [SERV_BATERIA]
    }).then(engancharse).catch(traducirFallo);
  }

  /* Volver a uno del mapa. Sin preguntar cuando el navegador deja; y cuando no
     deja, el selector sale filtrado por su nombre, así que en vez de una lista
     aparece él solo y es un toque igual. */
  function conectarA(id) {
    if (!soportaBluetooth()) return Promise.reject(new Error(porQueNoBluetooth()));
    const guardado = equipos().filter(function (x) { return x.id === id; })[0];

    return recuperar(id).then(function (dev) {
      if (dev) return dev;
      const filtros = guardado && guardado.nombre
        ? [{ name: guardado.nombre }]
        : [{ services: [SERV_PULSO] }];
      return navigator.bluetooth.requestDevice({
        filters: filtros,
        /* con un filtro por nombre hay que pedir los servicios aparte: el
           filtro elige el aparato, no da permiso para leerle nada */
        optionalServices: [SERV_PULSO, SERV_BATERIA]
      });
    }).then(engancharse).catch(traducirFallo);
  }

  /* Reconectar solo al último, para el arranque de un entrenamiento. Si hiciera
     falta preguntar no hace nada: abrir un selector sin que nadie lo pida es
     peor que quedarse sin pulso. */
  function reconectarSolo() {
    const ultimo = equipos()[0];
    if (!soportaBluetooth() || !ultimo) return Promise.resolve(null);
    if (servidor && servidor.connected) return Promise.resolve(estado());
    return recuperar(ultimo.id).then(function (dev) {
      if (!dev) return null;
      return engancharse(dev);
    }).catch(function () { return null; });
  }

  /* Todo lo que hay que hacer con un aparato ya elegido. Lo comparten las tres
     formas de llegar a él, que solo se diferencian en cómo lo encuentran. */
  function engancharse(dev, volviendo) {
    dispositivo = dev;
    queridoId = dev.id;
    if (!dev._enganchado) {
      dev._enganchado = true;
      dev.addEventListener('gattserverdisconnected', alCortarse);
    }
    return dev.gatt.connect().then(function (serv) {
      servidor = serv;
      /* Volver de un corte no empieza una medición nueva: si se vaciaran las
         lecturas, un microcorte a mitad de entrenamiento borraría el pulso
         medio de toda la sesión y el máximo de la serie dura. */
      if (!volviendo) { desde = Date.now(); muestras.length = 0; }
      /* El contador se reinicia al conseguirlo, no al intentarlo: puesto a
         cero al entrar, una conexión que va y viene reintentaba sin fin. */
      reintento = 0;
      recordar(dev);
      return serv.getPrimaryService(SERV_PULSO);
    }).then(function (s) {
      return s.getCharacteristic(CAR_PULSO);
    }).then(function (c) {
      c.addEventListener('characteristicvaluechanged', function (ev) {
        const v = leerPulso(ev.target.value);
        if (v > 20 && v < 250) {           // fuera lecturas imposibles
          pulso = v;
          muestras.push(v);
          if (muestras.length > 5000) muestras.shift();
          avisar();
        }
      });
      return c.startNotifications();
    }).then(function () {
      leerBateria();
      avisar();
      return estado();
    });
  }

  /* Un corte a mitad de serie no puede obligar a sacar el móvil del bolsillo:
     mientras el usuario no haya soltado el aparato, se vuelve a intentar solo.
     Cinco veces espaciadas y se para: si a los treinta segundos no ha vuelto,
     es que se apagó o se quedó sin batería, y reintentar para siempre solo
     gasta la del móvil. */
  function alCortarse() {
    servidor = null;
    pulso = 0;
    avisar();
    if (!queridoId || !dispositivo || dispositivo.id !== queridoId) return;
    if (reintento >= 5) return;
    reintento++;
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      if (!queridoId || !dispositivo) return;
      engancharse(dispositivo, true).catch(function () { /* el siguiente lo reintenta */ });
    }, 2000 * reintento);
  }

  function traducirFallo(e) {
    if (e && e.name === 'NotFoundError') {
      throw new Error(T('No se eligió ningún dispositivo. Enciende la banda o ' +
        'el reloj y ponlo a emitir pulso antes de buscar.'));
    }
    if (e && e.name === 'SecurityError') throw new Error(porQueNoBluetooth());
    throw new Error(e && e.message ? e.message : T('No se pudo conectar.'));
  }

  function leerBateria() {
    if (!servidor) return;
    servidor.getPrimaryService(SERV_BATERIA)
      .then(function (s) { return s.getCharacteristic(CAR_BATERIA); })
      .then(function (c) { return c.readValue(); })
      .then(function (v) { bateria = v.getUint8(0); avisar(); })
      .catch(function () { /* no todos lo publican */ });
  }

  function desconectar() {
    queridoId = null;                  // soltar es soltar: nada de reintentos
    reintento = 0;
    clearTimeout(temporizador);
    try { if (servidor && servidor.connected) servidor.disconnect(); } catch (e) { /* nada */ }
    servidor = null; pulso = 0; bateria = null;
    avisar();
  }

  /* Lo medido durante un entrenamiento, para guardarlo con la sesión */
  function cerrarMedicion() {
    if (!muestras.length) return null;
    const r = { medio: media(), max: Math.max.apply(null, muestras), muestras: muestras.length };
    muestras.length = 0;
    return r;
  }

  /* ---------- 2. Importar un archivo ---------- */

  const MAX_DIRECTO = 12 * 1024 * 1024;   // a partir de aquí se lee a trozos

  function importarArchivo(file, onProgreso) {
    if (!file) return Promise.reject(new Error(T('No hay archivo.')));
    const nombre = (file.name || '').toLowerCase();

    if (/\.zip$/.test(nombre)) {
      return Promise.reject(new Error(T('Ese es el zip que exporta Salud. Descomprímelo ' +
        'y trae el archivo export.xml que hay dentro.')));
    }
    if (/\.fit$/.test(nombre)) {
      return Promise.reject(new Error(T('Los .fit vienen en binario cerrado. En tu reloj ' +
        'o en Garmin Connect puedes exportar el mismo entrenamiento en .tcx o .gpx.')));
    }

    /* El export.xml de Salud pesa cientos de megas: se lee a trozos o tumba
       el móvil. Lo demás cabe de una vez. */
    if (file.size > MAX_DIRECTO) return porTrozos(file, onProgreso);

    return file.text().then(function (texto) {
      return interpretar(texto, nombre);
    });
  }

  function interpretar(texto, nombre) {
    const cabeza = texto.slice(0, 4000);

    if (/\.json$/.test(nombre) || /^\s*[[{]/.test(texto)) return deJSON(texto);
    if (/<TrainingCenterDatabase/i.test(cabeza) || /\.tcx$/.test(nombre)) return deTCX(texto);
    if (/<gpx/i.test(cabeza) || /\.gpx$/.test(nombre)) return deGPX(texto);
    if (/<HealthData/i.test(cabeza)) return deSalud(texto);
    if (/\.csv$/.test(nombre) || /[,;]/.test(cabeza.split('\n')[0])) return deCSV(texto);

    return Promise.reject(new Error(T('No reconozco ese archivo. Valen .gpx, .tcx, ' +
      'el export.xml de Salud, .csv y .json.')));
  }

  /* Apple Health en trozos: se recorre el archivo en bloques y se busca cada
     registro con una expresión, guardando la cola por si un registro queda
     partido entre dos bloques. */
  function porTrozos(file, onProgreso) {
    const TROZO = 4 * 1024 * 1024;
    const acumulado = {};
    let resto = '';
    let leido = 0;

    const siguiente = function () {
      if (leido >= file.size) return Promise.resolve(acumulado);
      const trozo = file.slice(leido, leido + TROZO);
      leido += TROZO;
      return trozo.text().then(function (t) {
        const texto = resto + t;
        const corte = texto.lastIndexOf('<Record');
        resto = corte > 0 ? texto.slice(corte) : '';
        registrosDeSalud(corte > 0 ? texto.slice(0, corte) : texto, acumulado);
        if (onProgreso) onProgreso(Math.min(100, Math.round(leido / file.size * 100)));
        /* se cede el hilo para que la pantalla no se congele */
        return new Promise(function (r) { setTimeout(r, 0); }).then(siguiente);
      });
    };

    return siguiente().then(function (acc) {
      registrosDeSalud(resto, acc);
      return deAcumulado(acc);
    });
  }

  function deSalud(texto) {
    const acc = {};
    registrosDeSalud(texto, acc);
    return Promise.resolve(deAcumulado(acc));
  }

  /* Qué se saca del export de Salud y cómo se agrega cada cosa */
  const TIPOS = {
    HKQuantityTypeIdentifierStepCount: { campo: 'pasos', modo: 'suma' },
    HKQuantityTypeIdentifierActiveEnergyBurned: { campo: 'kcal', modo: 'suma' },
    HKQuantityTypeIdentifierDistanceWalkingRunning: { campo: 'distancia', modo: 'suma' },
    HKQuantityTypeIdentifierRestingHeartRate: { campo: 'pulsoReposo', modo: 'media' },
    HKQuantityTypeIdentifierHeartRate: { campo: 'pulsoMedio', modo: 'media', max: 'pulsoMax' },
    HKQuantityTypeIdentifierBodyMass: { campo: 'peso', modo: 'ultimo' },
    HKCategoryTypeIdentifierSleepAnalysis: { campo: 'sueno', modo: 'sueno' },
    HKQuantityTypeIdentifierAppleExerciseTime: { campo: 'minutos', modo: 'suma' }
  };

  /* Se captura la etiqueta entera y después se sacan los atributos uno a uno:
     el orden en que Apple los escribe no es el mismo en todas las versiones, y
     una expresión que los espere en fila falla en silencio. */
  const RE_RECORD = /<Record\s([^>]*?)\/?>/g;
  const RE_ATRIB = /([A-Za-z]+)="([^"]*)"/g;

  /* Los atributos se sacan de una pasada y se meten en un objeto. Con un
     archivo de medio millón de registros, construir una expresión por atributo
     y por registro son millones de expresiones: se nota, y mucho. */
  function atributos(tag) {
    const out = {};
    let a;
    RE_ATRIB.lastIndex = 0;
    while ((a = RE_ATRIB.exec(tag)) !== null) out[a[1]] = a[2];
    return out;
  }

  function registrosDeSalud(texto, acc) {
    let m;
    RE_RECORD.lastIndex = 0;
    while ((m = RE_RECORD.exec(texto)) !== null) {
      const at = atributos(m[1]);
      const def = TIPOS[at.type];
      if (!def) continue;
      const t = Date.parse(at.startDate);
      if (!t) continue;

      /* El día se toma tal y como lo escribió el reloj, no convertido a la
         hora de quien mira. Apple guarda "2026-09-20 06:00:00 +0200": ese
         dato es del día 20 para quien lo midió, y si se pasa por la zona
         horaria del navegador, abrir el archivo desde otro país mueve medio
         historial un día atrás. Los primeros diez caracteres ya son la fecha
         local del reloj. */
      const clave = /^\d{4}-\d{2}-\d{2}/.test(at.startDate)
        ? at.startDate.slice(0, 10) : Store.dayKey(t);
      const bolsa = acc[clave] || (acc[clave] = {});
      const campo = bolsa[def.campo] || (bolsa[def.campo] = { suma: 0, n: 0, max: 0, ultimo: 0 });

      if (def.modo === 'sueno') {
        /* el sueño no trae número: trae dos fechas, y lo que vale es cuánto duró */
        const fin = Date.parse(at.endDate);
        if (fin && fin > t && /Asleep/i.test(at.value || '')) {
          campo.suma += (fin - t) / 36e5;
        }
        campo.n = 1;
        continue;
      }

      const v = parseFloat(at.value);
      if (!isFinite(v)) continue;
      campo.suma += v;
      campo.n++;
      campo.ultimo = v;
      if (v > campo.max) campo.max = v;
    }
  }

  const POR_CAMPO = {};
  Object.keys(TIPOS).forEach(function (k) { POR_CAMPO[TIPOS[k].campo] = TIPOS[k]; });

  function deAcumulado(acc) {
    const salida = [];
    Object.keys(acc).forEach(function (clave) {
      const fila = { dia: clave };
      Object.keys(acc[clave]).forEach(function (campo) {
        const c = acc[clave][campo];
        const def = POR_CAMPO[campo] || {};
        if (def.modo === 'media') {
          fila[campo] = c.n ? Math.round(c.suma / c.n) : 0;
          if (def.max) fila[def.max] = Math.round(c.max);
        } else if (def.modo === 'ultimo') {
          fila[campo] = Math.round(c.ultimo * 10) / 10;
        } else {
          fila[campo] = Math.round(c.suma * 10) / 10;
        }
      });
      salida.push(fila);
    });
    return salida;
  }

  /* --- .tcx: un entrenamiento con su pulso --- */
  function deTCX(texto) {
    const doc = new DOMParser().parseFromString(texto, 'text/xml');
    if (doc.querySelector('parsererror')) return Promise.reject(new Error(T('El .tcx está dañado.')));

    const salida = [];
    doc.querySelectorAll('Activity').forEach(function (act) {
      const laps = act.querySelectorAll('Lap');
      if (!laps.length) return;
      let seg = 0, kcal = 0, metros = 0, sumaHR = 0, segHR = 0, maxHR = 0;
      let cuando = act.querySelector('Id');
      cuando = cuando ? Date.parse(cuando.textContent) : 0;

      laps.forEach(function (lap) {
        const dur = num(lap, 'TotalTimeSeconds');
        seg += dur;
        kcal += num(lap, 'Calories');
        metros += num(lap, 'DistanceMeters');
        const med = lap.querySelector('AverageHeartRateBpm Value');
        const mx = lap.querySelector('MaximumHeartRateBpm Value');
        /* El medio se pondera por lo que duró cada vuelta: media de medias
           haría valer lo mismo una vuelta de treinta minutos que una de dos,
           y con las vueltas cortas del final salía un pulso más bajo del real.
           Si una vuelta no dice cuánto duró, cuenta como un segundo: pesa
           poco, pero no se pierde su lectura. */
        if (med) { const w = dur > 0 ? dur : 1; sumaHR += (Number(med.textContent) || 0) * w; segHR += w; }
        if (mx) maxHR = Math.max(maxHR, Number(mx.textContent) || 0);
      });

      if (!cuando) return;
      salida.push({
        dia: Store.dayKey(cuando),
        minutos: Math.round(seg / 60),
        kcal: Math.round(kcal),
        distancia: Math.round(metros) / 1000,
        pulsoMedio: segHR ? Math.round(sumaHR / segHR) : 0,
        pulsoMax: maxHR
      });
    });

    if (!salida.length) return Promise.reject(new Error(T('Ese .tcx no traía entrenamientos.')));
    return Promise.resolve(salida);
  }

  function num(nodo, etiqueta) {
    const e = nodo.querySelector(etiqueta);
    return e ? (Number(e.textContent) || 0) : 0;
  }

  /* --- .gpx: ruta con tiempo, y pulso si la extensión lo trae --- */
  function deGPX(texto) {
    const doc = new DOMParser().parseFromString(texto, 'text/xml');
    if (doc.querySelector('parsererror')) return Promise.reject(new Error(T('El .gpx está dañado.')));

    const puntos = doc.querySelectorAll('trkpt');
    if (!puntos.length) return Promise.reject(new Error(T('Ese .gpx no traía recorrido.')));

    let t0 = 0, t1 = 0, sumaHR = 0, nHR = 0, maxHR = 0, metros = 0;
    let ultLat = null, ultLon = null;

    puntos.forEach(function (p) {
      const hora = p.querySelector('time');
      const t = hora ? Date.parse(hora.textContent) : 0;
      if (t) { if (!t0) t0 = t; t1 = t; }

      /* el pulso va en una extensión con varios nombres según el fabricante */
      const hr = p.getElementsByTagName('*');
      for (let i = 0; i < hr.length; i++) {
        if (/(^|:)hr$/i.test(hr[i].nodeName)) {
          const v = Number(hr[i].textContent) || 0;
          if (v > 20 && v < 250) { sumaHR += v; nHR++; if (v > maxHR) maxHR = v; }
        }
      }

      const lat = parseFloat(p.getAttribute('lat'));
      const lon = parseFloat(p.getAttribute('lon'));
      if (ultLat !== null && isFinite(lat) && isFinite(lon)) {
        metros += distancia(ultLat, ultLon, lat, lon);
      }
      if (isFinite(lat)) { ultLat = lat; ultLon = lon; }
    });

    if (!t0) return Promise.reject(new Error(T('Ese .gpx no traía horas.')));
    return Promise.resolve([{
      dia: Store.dayKey(t0),
      minutos: Math.round((t1 - t0) / 60000),
      distancia: Math.round(metros) / 1000,
      pulsoMedio: nHR ? Math.round(sumaHR / nHR) : 0,
      pulsoMax: maxHR
    }]);
  }

  /* Distancia entre dos coordenadas, en metros (fórmula del semiverseno) */
  function distancia(la1, lo1, la2, lo2) {
    const R = 6371000, r = Math.PI / 180;
    const dLa = (la2 - la1) * r, dLo = (lo2 - lo1) * r;
    const a = Math.sin(dLa / 2) * Math.sin(dLa / 2) +
      Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* --- .csv: primera fila con los nombres de columna --- */
  const SINONIMOS = {
    dia: ['fecha', 'date', 'day', 'dia', 'día', 'start', 'time'],
    pasos: ['pasos', 'steps', 'step count'],
    kcal: ['calorias', 'calorías', 'calories', 'kcal', 'energy', 'active energy',
      'calorias activas', 'calorías activas', 'active calories'],
    pulsoReposo: ['pulso en reposo', 'resting heart rate', 'resting hr', 'rhr'],
    pulsoMedio: ['pulso', 'pulso medio', 'heart rate', 'avg hr', 'average heart rate', 'bpm'],
    pulsoMax: ['pulso maximo', 'pulso máximo', 'max hr', 'maximum heart rate'],
    sueno: ['sueno', 'sueño', 'sleep', 'sleep hours', 'horas de sueño'],
    peso: ['peso', 'weight', 'body mass'],
    distancia: ['distancia', 'distance', 'km'],
    minutos: ['minutos', 'minutes', 'duration', 'exercise time',
      'minutos de ejercicio', 'exercise minutes']
  };

  function deCSV(texto) {
    const filas = texto.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (filas.length < 2) return Promise.reject(new Error(T('Ese CSV no tiene datos.')));

    const sep = (filas[0].match(/;/g) || []).length > (filas[0].match(/,/g) || []).length ? ';' : ',';
    const cabecera = filas[0].split(sep).map(function (c) {
      return I18N.norm(c.replace(/^"|"$/g, ''));
    });

    const col = {};
    Object.keys(SINONIMOS).forEach(function (campo) {
      const i = cabecera.findIndex(function (c) {
        return SINONIMOS[campo].some(function (s) { return c === I18N.norm(s); });
      });
      if (i !== -1) col[campo] = i;
    });

    if (col.dia === undefined) {
      return Promise.reject(new Error(T('El CSV necesita una columna de fecha.')));
    }

    const salida = [];
    filas.slice(1).forEach(function (linea) {
      const c = linea.split(sep).map(function (x) { return x.replace(/^"|"$/g, '').trim(); });
      const t = momento(c[col.dia]);
      if (!t) return;
      const fila = { dia: Store.dayKey(t) };
      Object.keys(col).forEach(function (campo) {
        if (campo === 'dia') return;
        const v = parseFloat(String(c[col[campo]]).replace(',', '.'));
        if (isFinite(v) && v > 0) fila[campo] = v;
      });
      salida.push(fila);
    });

    if (!salida.length) return Promise.reject(new Error(T('No pude leer ninguna fila con fecha.')));
    return Promise.resolve(salida);
  }

  /* --- .json: lo que manda el atajo, o una copia de otra app --- */
  function deJSON(texto) {
    let j;
    try { j = JSON.parse(texto); } catch (e) {
      return Promise.reject(new Error(T('Ese JSON no se puede leer.')));
    }
    const lista = Array.isArray(j) ? j : (j.dias || j.days || j.data || [j]);
    if (!Array.isArray(lista)) return Promise.reject(new Error(T('No encuentro la lista de días.')));

    const salida = lista.map(function (x) {
      const t = momento(x.dia || x.fecha || x.date || x.day || '');
      const fila = { dia: t ? Store.dayKey(t) : Store.dayKey(Date.now()) };
      CAMPOS.forEach(function (c) {
        const v = Number(x[c]);
        if (isFinite(v) && v > 0) fila[c] = v;
      });
      /* nombres alternativos que manda el atajo de iOS */
      if (!fila.pasos && x.steps) fila.pasos = Number(x.steps) || 0;
      if (!fila.kcal && x.calories) fila.kcal = Number(x.calories) || 0;
      if (!fila.pulsoReposo && x.restingHR) fila.pulsoReposo = Number(x.restingHR) || 0;
      if (!fila.pulsoMedio && x.hr) fila.pulsoMedio = Number(x.hr) || 0;
      if (!fila.sueno && x.sleep) fila.sueno = Number(x.sleep) || 0;
      if (!fila.peso && x.weight) fila.peso = Number(x.weight) || 0;
      return fila;
    }).filter(function (f) {
      return CAMPOS.some(function (c) { return Number(f[c]) > 0; });
    });

    if (!salida.length) return Promise.reject(new Error(T('Ahí no venía ningún dato reconocible.')));
    return Promise.resolve(salida);
  }

  /* ---------- 3. Lo que pega el atajo ---------- */

  /* Acepta tanto el JSON como un pegote de "clave: valor" por líneas, que es
     lo que sale de un atajo hecho a mano sin complicarse. */
  function pegar(texto) {
    const t = String(texto || '').trim();
    if (!t) return Promise.reject(new Error(T('No has pegado nada.')));
    if (/^[[{]/.test(t)) return deJSON(t);

    const fila = { dia: Store.dayKey(Date.now()) };
    t.split(/\r?\n/).forEach(function (linea) {
      const p = linea.split(/[:=]/);
      if (p.length < 2) return;
      const nombre = I18N.norm(p[0]);
      const valor = parseFloat(String(p.slice(1).join(':')).replace(',', '.'));
      if (!isFinite(valor)) return;
      Object.keys(SINONIMOS).forEach(function (campo) {
        if (SINONIMOS[campo].some(function (s) { return I18N.norm(s) === nombre; })) {
          fila[campo] = valor;
        }
      });
    });

    const hay = CAMPOS.some(function (c) { return Number(fila[c]) > 0; });
    if (!hay) return Promise.reject(new Error(T('No reconocí ningún dato en ese texto.')));
    return Promise.resolve([fila]);
  }

  /* La dirección a la que el atajo puede mandar los datos: la propia base de
     datos del usuario. Si no tiene cuenta, no hay a dónde mandarlos. */
  function destinoAtajo() {
    if (!g.Sync || !Sync.activa()) return null;
    const c = Sync.config();
    const s = Sync.sesion();
    if (!c || !s) return null;
    return {
      url: c.url + '/rest/v1/' + 'salud_reloj',
      apikey: c.key,
      token: s.access_token,
      usuario: s.user_id
    };
  }

  g.Reloj = {
    CAMPOS: CAMPOS,
    dias: dias, dia: dia, resumen: resumen, hayDatos: hayDatos,
    anotar: anotar, anotarVarios: anotarVarios, borrarTodo: borrarTodo, datos: datos,
    soportaBluetooth: soportaBluetooth, porQueNoBluetooth: porQueNoBluetooth,
    soportaMapeo: soportaMapeo, hayAdaptador: hayAdaptador,
    equipos: equipos, olvidar: olvidar, conectarA: conectarA,
    reconectarSolo: reconectarSolo,
    conectar: conectar, desconectar: desconectar, estado: estado, alPulso: alPulso,
    cerrarMedicion: cerrarMedicion,
    importarArchivo: importarArchivo, pegar: pegar, destinoAtajo: destinoAtajo
  };
})(window);
