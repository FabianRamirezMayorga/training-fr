/* medir.js — lo que el móvil puede medir por su cuenta.

   Tres cosas, y las tres son lo que un iPhone deja hacer desde Safari sin
   convertir esto en una app nativa: que la pantalla no se apague, el GPS, y el
   acelerómetro. Lo que no deja —Salud, Bluetooth, contar nada con la app
   cerrada— sigue estando en `reloj.js` por los otros caminos.

   El criterio de todo el archivo es el mismo que el del resto: un número que
   puede estar mal es peor que no dar número. Así que el GPS tira los puntos que
   no se sostienen, el acelerómetro solo cuenta donde acierta, y el contador de
   repeticiones propone en vez de escribir. */
(function (g) {
  'use strict';

  const T = g.T || function (s) { return s; };

  /* ================= que la pantalla no se apague =================

     Esto arregla algo que pasaba cada sesión: a mitad de un descanso el móvil
     se bloqueaba solo, y con la pestaña dormida el navegador congela los
     temporizadores y corta la correa de pulso. El cronómetro volvía a la vida
     al desbloquear, pero el aviso de «toca ya» había pasado hace dos minutos.

     Va por estado de la app y no por pantalla, por dos razones: no hay gancho
     de «al salir de una vista» donde soltarlo —y un candado que no se suelta
     se queda encendido toda la tarde—, y el entrenamiento sigue abierto aunque
     te vayas a mirar el catálogo, así que atarlo a una pantalla concreta lo
     apagaría justo cuando hace falta. `cuidarPantalla()` se llama en cada
     repintado y decide: si hay algo en marcha, candado; si no, fuera. */
  let candado = null;
  let quiere = false;

  function puedeDespertar() {
    return !!(g.navigator && navigator.wakeLock && navigator.wakeLock.request);
  }

  function pedirCandado() {
    if (!puedeDespertar() || candado || document.visibilityState !== 'visible') return;
    navigator.wakeLock.request('screen').then(function (c) {
      candado = c;
      /* El navegador lo suelta él solo al esconder la pestaña, y entonces este
         objeto ya no vale: sin esto, al volver creíamos tener candado y la
         pantalla se apagaba igual. */
      c.addEventListener('release', function () { candado = null; });
    }).catch(function () { /* batería baja o pestaña oculta: no es un fallo */ });
  }

  function soltarCandado() {
    if (!candado) return;
    const c = candado;
    candado = null;
    try { c.release(); } catch (e) { /* ya estaba suelto */ }
  }

  function cuidarPantalla() {
    quiere = !!(g.Workout && Workout.isActive()) || faseActual !== 'parado';
    if (quiere) pedirCandado(); else soltarCandado();
  }

  if (g.document) {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && quiere) pedirCandado();
    });
  }

  /* ================= las reglas, que no las decide ningún sensor =================

     El GPS mide metros y segundos. Las calorías siguen saliendo de la misma
     cuenta de siempre —MET por kilo por hora—, porque es la que da igual
     resultado siempre y sin cobertura. Lo que cambia es de dónde sale el MET:
     antes caminar eran 3,5 fueras a paso de paseo o apretando, y ahora lo pone
     la velocidad que de verdad llevaste. El sensor no sustituye la regla; le da
     el dato que le faltaba. */

  /* Pares [km/h, MET] del compendio de actividad física. Entre dos anclas se
     interpola recto, y por fuera se queda en la punta: a 25 km/h corriendo ya
     no hay tabla, hay otra conversación. */
  const MET_VEL = {
    caminar: [[3.2, 2.8], [4.0, 3.0], [4.8, 3.5], [5.6, 4.3], [6.4, 5.0], [7.2, 7.0]],
    correr: [[6.4, 6.0], [8.0, 8.3], [9.7, 9.8], [11.3, 11.0], [12.9, 11.8],
      [14.5, 12.8], [16.1, 14.5], [17.7, 16.0]],
    bici: [[16, 5.8], [19, 6.8], [22, 8.0], [25, 10.0], [30, 12.0], [35, 15.8]]
  };

  /* El senderismo se queda con su MET fijo a propósito. Lo que lo hace duro es
     la cuesta, no el paso, y la altura del GPS se mueve veinte metros estando
     quieto: con un dato así, afinar sería inventar con más decimales. */
  function metPorVelocidad(act, kmh, metBase) {
    const tabla = MET_VEL[act];
    if (!tabla || !(kmh > 0)) return metBase;
    if (kmh <= tabla[0][0]) return tabla[0][1];
    for (let i = 1; i < tabla.length; i++) {
      if (kmh <= tabla[i][0]) {
        const a = tabla[i - 1];
        const b = tabla[i];
        return a[1] + (b[1] - a[1]) * (kmh - a[0]) / (b[0] - a[0]);
      }
    }
    return tabla[tabla.length - 1][1];
  }

  function mide(act) { return !!MET_VEL[act] || act === 'senderismo'; }

  /* Haversine. En las distancias de las que hablamos —metros entre dos puntos
     seguidos— sobraría con la cuenta plana, pero cuesta lo mismo y así no hay
     que acordarse de que deja de valer. */
  function metros(a, b) {
    const R = 6371000;
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad;
    const dLon = (b.lon - a.lon) * rad;
    const la1 = a.lat * rad;
    const la2 = b.lat * rad;
    const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  /* Minutos por kilómetro, que es como se habla de esto. En bici se habla de
     km/h, así que ahí se devuelve la velocidad. */
  function ritmoTxt(act, kmh) {
    if (!(kmh > 0.3)) return '—';
    if (act === 'bici') return (Math.round(kmh * 10) / 10) + ' km/h';
    const minKm = 60 / kmh;
    if (minKm > 99) return '—';
    const m = Math.floor(minKm);
    const s = Math.round((minKm - m) * 60);
    return (s === 60 ? m + 1 : m) + '′' + (s === 60 ? '00' : (s < 10 ? '0' : '') + s);
  }

  function hhmmss(ms) {
    const t = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    const dos = function (n) { return (n < 10 ? '0' : '') + n; };
    return (h ? h + ':' + dos(m) : m) + ':' + dos(s);
  }

  /* El dibujo del recorrido, a mano y en SVG. Un mapa de verdad pediría una
     librería y una clave de un servicio de mosaicos, o sea dinero y una
     dependencia; y para ver que diste la vuelta al parque basta la forma. */
  function trazaSVG(puntos, ancho, alto) {
    if (!puntos || puntos.length < 2) return '';
    const lat0 = puntos[0].lat * Math.PI / 180;
    const k = Math.cos(lat0) || 1;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const xy = puntos.map(function (p) {
      const x = p.lon * k;
      const y = -p.lat;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      return [x, y];
    });
    const w = ancho - 8;
    const h = alto - 8;
    /* Un paseo en línea recta tiene un lado de ancho cero: sin esto la escala
       se iba a infinito y el trazo desaparecía. Se mantiene la proporción para
       que una vuelta redonda no salga como un óvalo aplastado. */
    const esc = Math.min((maxX - minX) > 1e-9 ? w / (maxX - minX) : Infinity,
      (maxY - minY) > 1e-9 ? h / (maxY - minY) : Infinity);
    const e = isFinite(esc) ? esc : 1;
    const dx = (ancho - (maxX - minX) * e) / 2;
    const dy = (alto - (maxY - minY) * e) / 2;
    return xy.map(function (p, i) {
      const x = Math.round(((p[0] - minX) * e + dx) * 10) / 10;
      const y = Math.round(((p[1] - minY) * e + dy) * 10) / 10;
      return (i ? 'L' : 'M') + x + ' ' + y;
    }).join(' ');
  }

  /* ================= la medición en vivo ================= */

  /* Lo que se tira y por qué. Un GPS de móvil, sobre todo al empezar y entre
     edificios, da puntos que se van cien metros y vuelven. Si se suman todos,
     un café sentado en una terraza son dos kilómetros y la app queda como una
     mentirosa. Así que:
       - Precisión peor que 25 m: el punto no se usa para sumar.
       - Salto que implique ir más rápido de lo humano para esa actividad: es
         deriva, no un sprint.
       - Menos de 4 m desde el punto anterior: es el GPS respirando en el sitio.
     Lo que se tira no se oculta: la pantalla dice cuándo la señal es mala, para
     que no parezca que la app no cuenta por su cuenta. */
  const PEOR_PRECISION = 25;
  const SALTO_MINIMO = 4;
  const TOPE_KMH = { caminar: 12, senderismo: 12, correr: 30, bici: 70 };

  let faseActual = 'parado';
  let est = null;
  let reloj = null;
  let vigia = null;
  let oyentes = [];

  function avisar() {
    oyentes.forEach(function (fn) { try { fn(estado()); } catch (e) { /* nada */ } });
  }

  function alCambiar(fn) {
    oyentes.push(fn);
    return function () { oyentes = oyentes.filter(function (x) { return x !== fn; }); };
  }

  function nuevo(act, metBase) {
    return {
      act: act, metBase: metBase || 0,
      t0: Date.now(), msActivo: 0, tTramo: Date.now(),
      metrosTotal: 0, puntos: [], ultimo: null,
      precision: 0, senal: '', error: '',
      pasos: 0, cadencia: 0
    };
  }

  function estado() {
    if (!est) return { fase: 'parado' };
    const ms = est.msActivo + (faseActual === 'midiendo' ? Date.now() - est.tTramo : 0);
    const km = est.metrosTotal / 1000;
    const horas = ms / 3600000;
    const kmh = horas > 0 ? km / horas : 0;
    const met = metPorVelocidad(est.act, kmh, est.metBase);
    const peso = Number((g.Perfil && Perfil.datos() || {}).peso) || 75;
    return {
      fase: faseActual, act: est.act,
      ms: ms, tiempo: hhmmss(ms),
      km: km, metros: est.metrosTotal,
      kmh: kmh, ritmo: ritmoTxt(est.act, kmh),
      met: met, kcal: Math.round(met * peso * ms / 3600000),
      pasos: est.pasos, cadencia: est.cadencia,
      puntos: est.puntos, precision: est.precision,
      senal: est.senal, error: est.error
    };
  }

  function punto(pos) {
    if (!est || faseActual !== 'midiendo') return;
    const c = pos.coords;
    est.precision = Math.round(c.accuracy || 0);
    est.senal = est.precision > PEOR_PRECISION ? 'mala' : '';
    if (est.precision > PEOR_PRECISION) { avisar(); return; }

    const p = { lat: c.latitude, lon: c.longitude, t: pos.timestamp || Date.now() };
    if (est.ultimo) {
      const d = metros(est.ultimo, p);
      const dt = Math.max(0.001, (p.t - est.ultimo.t) / 1000);
      const kmh = d / dt * 3.6;
      const tope = TOPE_KMH[est.act] || 30;
      if (d < SALTO_MINIMO || kmh > tope) { avisar(); return; }
      est.metrosTotal += d;
    }
    est.ultimo = p;

    /* La ruta guardada es para dibujar una forma, no para navegar: un punto
       cada veinticinco metros y trescientos como tope. Sin esto, dos horas de
       bici dejaban siete mil puntos en el almacén del navegador, que es el
       mismo sitio donde viven las rutinas. */
    const ult = est.puntos[est.puntos.length - 1];
    if (!ult || metros(ult, p) >= 25) {
      est.puntos.push({ lat: p.lat, lon: p.lon });
      if (est.puntos.length > 300) {
        est.puntos = est.puntos.filter(function (_, i) { return i % 2 === 0; });
      }
    }
    avisar();
  }

  function falloGPS(err) {
    if (!est) return;
    est.error = err && err.code === 1
      ? T('No has dado permiso de ubicación. Hace falta para medir la distancia.')
      : T('El GPS no está dando señal. Prueba a salir a cielo abierto.');
    avisar();
  }

  function vigilar() {
    if (!g.navigator || !navigator.geolocation) return;
    vigia = navigator.geolocation.watchPosition(punto, falloGPS, {
      enableHighAccuracy: true, maximumAge: 0, timeout: 20000
    });
  }

  function arrancar(act, metBase) {
    if (!g.navigator || !navigator.geolocation) return false;
    est = nuevo(act, metBase);
    faseActual = 'midiendo';
    vigilar();
    arrancarPasos();
    reloj = setInterval(avisar, 1000);
    cuidarPantalla();
    avisar();
    return true;
  }

  function pausar() {
    if (faseActual !== 'midiendo') return;
    est.msActivo += Date.now() - est.tTramo;
    faseActual = 'pausa';
    /* El vigía se corta en la pausa: dejarlo mirando gastaba batería para
       tirar después todos los puntos, y al volver el primer punto nuevo habría
       sumado en línea recta el camino que se hizo con la medición parada. */
    if (vigia != null) { navigator.geolocation.clearWatch(vigia); vigia = null; }
    est.ultimo = null;
    avisar();
  }

  function seguir() {
    if (faseActual !== 'pausa') return;
    est.tTramo = Date.now();
    faseActual = 'midiendo';
    vigilar();
    avisar();
  }

  function cerrar() {
    if (vigia != null) { navigator.geolocation.clearWatch(vigia); vigia = null; }
    if (reloj) { clearInterval(reloj); reloj = null; }
    pararPasos();
  }

  /* Devuelve lo medido para que lo guarde quien sabe guardar sesiones: aquí no
     se escribe en el almacén. Un módulo que mide y además guarda es el que
     luego no se puede usar desde otra pantalla. */
  function terminar() {
    if (!est) return null;
    if (faseActual === 'midiendo') est.msActivo += Date.now() - est.tTramo;
    const r = estado();
    r.fase = 'hecho';
    r.t0 = est.t0;
    cerrar();
    est = null;
    faseActual = 'parado';
    cuidarPantalla();
    return r;
  }

  function tirar() {
    cerrar();
    est = null;
    faseActual = 'parado';
    cuidarPantalla();
    avisar();
  }

  /* ================= el acelerómetro =================

     En iOS hay que pedir permiso y solo vale si lo pide un toque del usuario,
     no la carga de la página. Y cuenta mientras la pantalla está encendida:
     con el móvil bloqueado iOS congela la página y no hay nada que hacer, así
     que esto acompaña a una medición en marcha y no es el pedómetro del día.
     Para los pasos del día están el atajo de Salud y los archivos. */

  function puedeMover() {
    return !!(g.DeviceMotionEvent);
  }

  function pidePermisoMovimiento() {
    if (!puedeMover()) return Promise.resolve(false);
    if (typeof DeviceMotionEvent.requestPermission !== 'function') return Promise.resolve(true);
    return DeviceMotionEvent.requestPermission()
      .then(function (r) { return r === 'granted'; })
      .catch(function () { return false; });
  }

  /* Detector de picos sobre el módulo de la aceleración, con media móvil para
     quitarle la gravedad y un tiempo muerto después de cada pico.

     Lo del tiempo muerto es lo que lo hace servir: sin él, un paso daba tres
     cuentas —el talón, la planta y el rebote del brazo— y el contador iba al
     triple. 260 ms es lo que tarda el paso más rápido que da alguien
     corriendo; por encima de eso ya no son pasos distintos. */
  function detector(muerto, umbral) {
    let media = 9.8;
    let pico = 0;
    let ultimo = 0;
    let subiendo = false;
    return function (mag, t) {
      media = media * 0.9 + mag * 0.1;
      const d = mag - media;
      if (d > umbral) { subiendo = true; pico = Math.max(pico, d); return 0; }
      if (subiendo && d < umbral * 0.4) {
        subiendo = false;
        pico = 0;
        if (t - ultimo >= muerto) { ultimo = t; return 1; }
      }
      return 0;
    };
  }

  let oyenteMov = null;
  let cuentaPasos = null;
  let ventana = [];

  function arrancarPasos() {
    if (!puedeMover() || !est) return;
    pidePermisoMovimiento().then(function (ok) {
      if (!ok || !est) return;
      cuentaPasos = detector(260, 1.4);
      ventana = [];
      oyenteMov = function (ev) {
        const a = ev.accelerationIncludingGravity;
        if (!a || !est || faseActual !== 'midiendo') return;
        const mag = Math.sqrt((a.x || 0) * (a.x || 0) + (a.y || 0) * (a.y || 0) +
          (a.z || 0) * (a.z || 0));
        const t = Date.now();
        if (cuentaPasos(mag, t)) {
          est.pasos++;
          /* La cadencia, de los últimos veinte pasos y no del total: lo que
             interesa es el ritmo de ahora, y promediando toda la salida los
             semáforos del principio la dejaban siempre baja. */
          ventana.push(t);
          if (ventana.length > 20) ventana.shift();
          if (ventana.length > 3) {
            const min = (t - ventana[0]) / 60000;
            est.cadencia = min > 0 ? Math.round((ventana.length - 1) / min) : 0;
          }
        }
      };
      g.addEventListener('devicemotion', oyenteMov);
    });
  }

  function pararPasos() {
    if (oyenteMov) g.removeEventListener('devicemotion', oyenteMov);
    oyenteMov = null;
    cuentaPasos = null;
    ventana = [];
  }

  /* ---------- contar repeticiones ----------
     Esto propone, nunca escribe. El acelerómetro con el móvil en el bolsillo o
     en la mano acierta en un press de banca y se pierde en un curl de bíceps
     lento, y un número equivocado dentro del historial es peor que ninguno: el
     volumen de la semana, el progreso y lo que la app te sugiere mañana salen
     de ahí. Así que cuenta en voz alta mientras te mueves y al parar te
     pregunta si eso es lo que hiciste.

     El umbral es más alto que el de los pasos (2.2 frente a 1.4) y el tiempo
     muerto más largo (700 ms): una repetición es un movimiento grande y lento,
     y con los números de andar contaba el temblor entre repetición y
     repetición. */
  function contarReps(alContar) {
    if (!puedeMover()) return null;
    let n = 0;
    let fn = null;
    const det = detector(700, 2.2);
    pidePermisoMovimiento().then(function (ok) {
      if (!ok) { alContar(null); return; }
      fn = function (ev) {
        const a = ev.accelerationIncludingGravity;
        if (!a) return;
        const mag = Math.sqrt((a.x || 0) * (a.x || 0) + (a.y || 0) * (a.y || 0) +
          (a.z || 0) * (a.z || 0));
        if (det(mag, Date.now())) alContar(++n);
      };
      g.addEventListener('devicemotion', fn);
    });
    return {
      cuenta: function () { return n; },
      parar: function () {
        if (fn) g.removeEventListener('devicemotion', fn);
        fn = null;
        return n;
      }
    };
  }

  /* ---------- qué sabe hacer este aparato ----------
     Se pregunta antes de ofrecer, para no poner un botón que al tocarlo diga
     que aquí no. Es lo mismo que hace `reloj.js` con el Bluetooth. */
  function soporta() {
    return {
      gps: !!(g.navigator && navigator.geolocation),
      movimiento: puedeMover(),
      despierto: puedeDespertar()
    };
  }

  g.Medir = {
    cuidarPantalla: cuidarPantalla, soporta: soporta, mide: mide,
    arrancar: arrancar, pausar: pausar, seguir: seguir, terminar: terminar,
    tirar: tirar, estado: estado, alCambiar: alCambiar,
    contarReps: contarReps, pidePermisoMovimiento: pidePermisoMovimiento,
    /* fuera para poder probarlas y para que la vista no repita la cuenta */
    metros: metros, metPorVelocidad: metPorVelocidad, ritmoTxt: ritmoTxt,
    hhmmss: hhmmss, trazaSVG: trazaSVG
  };
})(window);
