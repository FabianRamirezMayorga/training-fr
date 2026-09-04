/* alertas.js — recordatorios de entrenamiento, agua, comidas y pesaje.

   Una web no puede despertar el teléfono por su cuenta sin un servidor de push
   (que costaría dinero). Aquí se cubren los tres caminos que sí funcionan gratis:
     1. Aviso del sistema mientras la app está abierta o en segundo plano.
     2. Descarga al calendario del móvil, que sí avisa siempre con la app cerrada.
     3. Lo pendiente aparece al abrir la app. */
(function (g) {
  'use strict';

  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const TIPOS = {
    entreno: { label: 'Entrenamiento', icono: 'dumbbell', titulo: 'Toca entrenar',
      mensaje: 'Tu rutina de hoy te está esperando.' },
    agua: { label: 'Beber agua', icono: 'gota', titulo: 'Hidrátate',
      mensaje: 'Un vaso de agua ahora.' },
    comida: { label: 'Comida', icono: 'nutricion', titulo: 'Hora de comer',
      mensaje: 'Toca comida según tu plan.' },
    peso: { label: 'Pesarte', icono: 'perfil', titulo: 'Pésate',
      mensaje: 'Registra tu peso para seguir la evolución.' },
    suplemento: { label: 'Suplemento', icono: 'nutricion', titulo: 'Suplemento',
      mensaje: 'Toca tu suplemento.' },
    libre: { label: 'Personalizada', icono: 'campana', titulo: 'Recordatorio', mensaje: '' }
  };

  /* Un recordatorio puede sonar varias veces al día: el agua no se bebe de una
     sentada. Por eso las horas son una lista y lo ya lanzado se recuerda hora a
     hora, no una vez por día. */
  function normalizar(a) {
    if (!a.horas || !a.horas.length) a.horas = [a.hora || '18:00'];
    a.horas = a.horas.slice().sort();
    a.hora = a.horas[0];                       // compatibilidad con lo guardado antes
    if (typeof a.ultima !== 'object' || a.ultima === null) a.ultima = {};
    return a;
  }

  function lista() { return (Store.settings().alertas || []).map(normalizar); }
  function guardarLista(arr) { Store.setSetting('alertas', arr); }

  function nueva(tipo) {
    const t = TIPOS[tipo] || TIPOS.libre;
    return {
      id: Store.uid(), tipo: tipo, titulo: t.titulo, mensaje: t.mensaje,
      dias: [1, 2, 3, 4, 5], horas: ['18:00'], hora: '18:00', activa: true, ultima: {}
    };
  }

  function guardar(a) {
    normalizar(a);
    const arr = lista().slice();
    const i = arr.findIndex(function (x) { return x.id === a.id; });
    if (i === -1) arr.push(a); else arr[i] = a;
    arr.sort(function (x, y) { return x.horas[0].localeCompare(y.horas[0]); });
    guardarLista(arr);
    return a;
  }

  function borrar(id) {
    guardarLista(lista().filter(function (a) { return a.id !== id; }));
  }

  /* Crea los recordatorios de entrenamiento a partir de los días de tus rutinas */
  function desdeRutinas(hora) {
    const mapa = { 'Lun': 1, 'Mar': 2, 'Mié': 3, 'Jue': 4, 'Vie': 5, 'Sáb': 6, 'Dom': 0 };
    const dias = {};
    Store.routines().forEach(function (r) {
      (r.days || []).forEach(function (d) { if (mapa[d] !== undefined) dias[mapa[d]] = true; });
    });
    const nums = Object.keys(dias).map(Number);
    if (!nums.length) return null;

    const a = nueva('entreno');
    a.dias = nums.sort();
    a.horas = [hora || horaHabitualDeEntreno()];
    return guardar(a);
  }

  /* ---------- a qué hora entrenas de verdad ----------
     Si ya hay entrenamientos registrados, la hora sale de ellos en vez de un
     18:00 inventado: se coge la mediana de las últimas quince sesiones. */
  function horaHabitualDeEntreno() {
    const p = Perfil.datos();
    if (p.horaEntreno) return p.horaEntreno;

    const horas = Store.sessions().slice(0, 15).map(function (s) {
      const d = new Date(s.start);
      return d.getHours() * 60 + d.getMinutes();
    }).sort(function (a, b) { return a - b; });

    if (horas.length < 3) return '18:00';
    const m = horas[Math.floor(horas.length / 2)];
    return aHora(Math.round(m / 15) * 15);
  }

  /* ---------- horas: repartir el día ---------- */

  function enMinutos(hhmm) {
    const p = String(hhmm || '0:00').split(':');
    return (Number(p[0]) || 0) * 60 + (Number(p[1]) || 0);
  }

  function aHora(min) {
    min = ((Math.round(min) % 1440) + 1440) % 1440;
    return String(Math.floor(min / 60)).padStart(2, '0') + ':' +
      String(min % 60).padStart(2, '0');
  }

  /* n avisos repartidos por igual entre dos horas, extremos incluidos, y
     redondeados a cuartos de hora para que no salgan las 10:37. */
  function repartir(desde, hasta, n) {
    const a = enMinutos(desde), b = enMinutos(hasta);
    if (n <= 1) return [aHora(a)];
    const paso = (b - a) / (n - 1);
    const out = [];
    for (let i = 0; i < n; i++) out.push(aHora(Math.round((a + paso * i) / 15) * 15));
    return out.filter(function (h, i, arr) { return arr.indexOf(h) === i; });
  }

  /* ---------- sugerencias a partir de tus datos ----------
     Nada de horas por defecto: el agua sale de los litros que te tocan por peso
     y actividad, las comidas de cuántas haces, y el entrenamiento de los días de
     tus rutinas y de la hora a la que sueles entrenar. */
  function sugerencias() {
    const p = Perfil.datos();
    const out = [];
    const despierta = p.despertar || '07:00';
    const acuesta = p.acostar || '23:00';
    const todos = [0, 1, 2, 3, 4, 5, 6];

    /* --- agua: un vaso de 250 ml por aviso --- */
    const litros = Perfil.agua(p);
    if (litros) {
      const vasos = Math.max(4, Math.min(10, Math.round(litros * 1000 / 250)));
      /* ni recién levantado ni pegado a la cama: se corta dos horas antes */
      const horas = repartir(aHora(enMinutos(despierta) + 30),
        aHora(enMinutos(acuesta) - 120), vasos);
      out.push({
        clave: 'agua', tipo: 'agua', dias: todos, horas: horas,
        titulo: 'Hidrátate', mensaje: 'Un vaso de agua (250 ml).',
        porque: 'Te tocan ' + String(litros).replace('.', ',') +
          ' L al día por tu peso y tu actividad: son ' + vasos +
          ' vasos de 250 ml repartidos entre las ' + horas[0] + ' y las ' +
          horas[horas.length - 1] + '. De una sentada no se bebe.'
      });
    }

    /* --- comidas --- */
    const n = Math.max(2, Math.min(7, p.comidas || 4));
    const horasComida = repartir(aHora(enMinutos(despierta) + 30),
      aHora(enMinutos(acuesta) - 150), n);
    const m = Perfil.macros(p);
    out.push({
      clave: 'comida', tipo: 'comida', dias: todos, horas: horasComida,
      titulo: 'Hora de comer',
      mensaje: m ? 'Unas ' + Math.round(m.kcal / n) + ' kcal y ' +
        Math.round(m.prot / n) + ' g de proteína.' : 'Toca comida según tu plan.',
      porque: 'Haces ' + n + ' comidas al día' + (m
        ? ', así que a cada una le tocan unas ' + Math.round(m.kcal / n) + ' kcal y ' +
          Math.round(m.prot / n) + ' g de proteína'
        : '') + '. Repartidas desde que te levantas hasta dos horas y media antes de dormir.'
    });

    /* --- entrenamiento, en los días que tienes rutina --- */
    const mapa = { 'Lun': 1, 'Mar': 2, 'Mié': 3, 'Jue': 4, 'Vie': 5, 'Sáb': 6, 'Dom': 0 };
    const diasEntreno = {};
    Store.routines().forEach(function (r) {
      (r.days || []).forEach(function (d) { if (mapa[d] !== undefined) diasEntreno[mapa[d]] = true; });
    });
    const nums = Object.keys(diasEntreno).map(Number).sort();
    const horaE = horaHabitualDeEntreno();

    if (nums.length) {
      out.push({
        clave: 'entreno', tipo: 'entreno', dias: nums, horas: [horaE],
        titulo: 'Toca entrenar', mensaje: 'Tu rutina de hoy te está esperando.',
        porque: 'Tus rutinas tienen días asignados (' +
          nums.map(function (d) { return UI.diaLargo(DIAS[d]); }).join(', ') + ') y ' +
          (Perfil.datos().horaEntreno
            ? 'la hora es la que has puesto en tu perfil.'
            : Store.sessions().length >= 3
              ? 'sueles entrenar sobre las ' + horaE + ', según tus últimas sesiones.'
              : 'de momento propongo las ' + horaE + '; cuando entrenes unas cuantas veces ' +
                'lo ajusto a tu hora real.')
      });

      /* comida antes de entrenar: hora y media antes, solo esos días */
      const antes = aHora(enMinutos(horaE) - 90);
      out.push({
        clave: 'preentreno', tipo: 'comida', dias: nums, horas: [antes],
        titulo: 'Comida antes de entrenar',
        mensaje: 'Algo con hidratos y proteína, ligero.',
        porque: 'Hora y media antes de tu entrenamiento: da tiempo a digerir y llegas con ' +
          'energía en vez de vacío.'
      });
    }

    /* --- pesarte: en ayunas, nada más levantarte --- */
    out.push({
      clave: 'peso', tipo: 'peso', dias: [1], horas: [aHora(enMinutos(despierta) + 15)],
      titulo: 'Pésate', mensaje: 'En ayunas y después del baño, para que sea comparable.',
      porque: 'Los lunes al levantarte. Pesarse siempre en las mismas condiciones es lo ' +
        'único que hace comparable la báscula de una semana a otra.'
    });

    /* --- dormir: solo si duerme poco --- */
    if (p.sueño && p.sueño < 7) {
      out.push({
        clave: 'dormir', tipo: 'libre', dias: todos,
        horas: [aHora(enMinutos(acuesta) - 45)],
        titulo: 'Empieza a apagar el día', mensaje: 'Pantallas fuera y a preparar la cama.',
        porque: 'Duermes ' + p.sueño + ' h y por debajo de 7 el entrenamiento rinde menos. ' +
          'Un aviso 45 min antes de acostarte es lo que más suele mover la aguja.'
      });
    }

    return out;
  }

  /* ¿Ya existe un recordatorio parecido? Se mira el tipo y las horas. */
  function yaExiste(sug) {
    return lista().some(function (a) {
      return a.tipo === sug.tipo && a.titulo === sug.titulo;
    });
  }

  function crearDesdeSugerencia(sug) {
    const a = nueva(sug.tipo);
    a.titulo = sug.titulo;
    a.mensaje = sug.mensaje;
    a.dias = sug.dias.slice();
    a.horas = sug.horas.slice();
    return guardar(a);
  }

  /* ---------- permiso y aviso del sistema ---------- */

  function soportado() { return 'Notification' in window; }

  function permiso() { return soportado() ? Notification.permission : 'unsupported'; }

  function pedirPermiso() {
    if (!soportado()) return Promise.resolve('unsupported');
    return Notification.requestPermission();
  }

  function avisar(titulo, cuerpo) {
    if (!soportado() || Notification.permission !== 'granted') return false;
    try {
      const opciones = {
        body: cuerpo, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
        tag: 'trainingfr', renotify: true
      };
      /* con service worker el aviso sobrevive aunque la pestaña esté en segundo plano */
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(function (reg) {
          reg.showNotification(titulo, opciones);
        }).catch(function () { new Notification(titulo, opciones); });
      } else {
        new Notification(titulo, opciones);
      }
      return true;
    } catch (e) { return false; }
  }

  /* ---------- comprobación periódica ---------- */

  /* Avisos que ya deberían haber sonado hoy y aún no lo han hecho.
     Devuelve un elemento por cada HORA pendiente, no por alerta: ocho vasos de
     agua son ocho avisos, y que suene el de las 10:00 no tapa el de las 12:00.
     Solo se recupera lo de la última hora y media: si abres la app por la noche
     no tiene sentido que salten los siete avisos de agua del día. */
  const GRACIA = 90;

  function pendientes() {
    const ahora = new Date();
    const hoy = Store.dayKey(ahora.getTime());
    const min = ahora.getHours() * 60 + ahora.getMinutes();
    const out = [];

    lista().forEach(function (a) {
      if (!a.activa) return;
      if (a.dias.indexOf(ahora.getDay()) === -1) return;
      a.horas.forEach(function (h) {
        const m = enMinutos(h);
        if (m > min || min - m > GRACIA) return;
        if (Store.dayKey(a.ultima[h] || 0) === hoy) return;
        out.push({ alerta: a, hora: h, titulo: a.titulo, mensaje: a.mensaje });
      });
    });
    return out;
  }

  function marcarLanzada(id, hora) {
    const arr = lista().slice();
    const a = arr.find(function (x) { return x.id === id; });
    if (!a) return;
    if (hora) a.ultima[hora] = Date.now();
    else a.horas.forEach(function (h) { a.ultima[h] = Date.now(); });
    guardarLista(arr);
  }

  let temporizador = null;

  /* Revisa cada minuto mientras la app esté abierta. onAviso recibe lo que toca. */
  function arrancar(onAviso) {
    clearInterval(temporizador);
    const comprobar = function () {
      const p = pendientes();
      if (!p.length) return;
      p.forEach(function (x) {
        avisar(x.titulo, x.mensaje);
        marcarLanzada(x.alerta.id, x.hora);
      });
      if (onAviso) onAviso(p);
    };
    comprobar();
    temporizador = setInterval(comprobar, 60000);
  }

  function parar() { clearInterval(temporizador); temporizador = null; }

  /* ---------- exportar al calendario ---------- */

  function dosDigitos(n) { return String(n).padStart(2, '0'); }

  /* Un archivo .ics con un evento repetido por alerta y su aviso 5 minutos antes.
     Al abrirlo, el móvil crea los recordatorios de verdad, incluso con la app cerrada. */
  function ics() {
    const NOMBRE_DIA = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const ahora = new Date();
    const sello = ahora.getUTCFullYear() + dosDigitos(ahora.getUTCMonth() + 1) +
      dosDigitos(ahora.getUTCDate()) + 'T' + dosDigitos(ahora.getUTCHours()) +
      dosDigitos(ahora.getUTCMinutes()) + '00Z';

    const lineas = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Training FR//ES', 'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH', 'X-WR-CALNAME:Training FR'
    ];

    /* Un evento por cada hora de cada alerta: el calendario no sabe de "ocho
       veces al día", así que se le dan ocho eventos semanales. */
    lista().filter(function (a) { return a.activa && a.dias.length; }).forEach(function (a) {
      a.horas.forEach(function (h, n) {
        const hm = h.split(':');
        /* primera aparición: el próximo día de la semana que corresponda */
        const inicio = new Date();
        inicio.setHours(Number(hm[0]) || 0, Number(hm[1]) || 0, 0, 0);
        let saltos = 0;
        while (a.dias.indexOf(inicio.getDay()) === -1 || inicio < ahora) {
          inicio.setDate(inicio.getDate() + 1);
          if (++saltos > 14) break;
        }
        const fecha = inicio.getFullYear() + dosDigitos(inicio.getMonth() + 1) +
          dosDigitos(inicio.getDate()) + 'T' + dosDigitos(inicio.getHours()) +
          dosDigitos(inicio.getMinutes()) + '00';

        lineas.push(
          'BEGIN:VEVENT',
          'UID:' + a.id + '-' + n + '@trainingfr',
          'DTSTAMP:' + sello,
          'DTSTART:' + fecha,
          'DURATION:PT15M',
          'RRULE:FREQ=WEEKLY;BYDAY=' + a.dias.map(function (d) { return NOMBRE_DIA[d]; }).join(','),
          'SUMMARY:' + escaparICS(a.titulo),
          'DESCRIPTION:' + escaparICS(a.mensaje || ''),
          'BEGIN:VALARM', 'TRIGGER:-PT5M', 'ACTION:DISPLAY',
          'DESCRIPTION:' + escaparICS(a.titulo), 'END:VALARM',
          'END:VEVENT'
        );
      });
    });

    lineas.push('END:VCALENDAR');
    return lineas.join('\r\n');
  }

  function escaparICS(s) {
    return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;')
      .replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  function resumenDias(a) {
    if (a.dias.length === 7) return 'Todos los días';
    if (a.dias.length === 5 && a.dias.every(function (d) { return d >= 1 && d <= 5; })) {
      return 'De lunes a viernes';
    }
    return a.dias.slice().sort().map(function (d) { return UI.diaLargo(DIAS[d]); }).join(', ');
  }

  /* "8 avisos, de 07:30 a 21:00 cada 1 h 55" o la lista corta si son pocos */
  function resumenHoras(a) {
    const h = a.horas || [];
    if (h.length <= 3) return h.join(' · ');
    const paso = (enMinutos(h[h.length - 1]) - enMinutos(h[0])) / (h.length - 1);
    const hh = Math.floor(paso / 60), mm = Math.round(paso % 60);
    const cada = hh ? hh + ' h' + (mm ? ' ' + mm : '') : mm + ' min';
    return h.length + ' avisos · de ' + h[0] + ' a ' + h[h.length - 1] + ' cada ' + cada;
  }

  g.Alertas = {
    TIPOS: TIPOS, DIAS: DIAS,
    lista: lista, nueva: nueva, guardar: guardar, borrar: borrar, desdeRutinas: desdeRutinas,
    soportado: soportado, permiso: permiso, pedirPermiso: pedirPermiso, avisar: avisar,
    pendientes: pendientes, arrancar: arrancar, parar: parar, marcarLanzada: marcarLanzada,
    ics: ics, resumenDias: resumenDias, resumenHoras: resumenHoras,
    sugerencias: sugerencias, yaExiste: yaExiste, crearDesdeSugerencia: crearDesdeSugerencia,
    repartir: repartir, enMinutos: enMinutos, aHora: aHora,
    horaHabitualDeEntreno: horaHabitualDeEntreno
  };
})(window);
