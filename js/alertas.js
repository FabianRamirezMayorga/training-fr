/* alertas.js — recordatorios de entrenamiento, agua, comidas y pesaje.

   Una web no puede despertar el teléfono por su cuenta sin un servidor de push
   (que costaría dinero). Aquí se cubren los tres caminos que sí funcionan gratis:
     1. Aviso del sistema mientras la app está abierta o en segundo plano.
     2. Descarga al calendario del móvil, que sí avisa siempre con la app cerrada.
     3. Lo pendiente aparece al abrir la app. */
(function (g) {
  'use strict';

  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  /* Cada tipo con su color. Una lista de ocho recordatorios con el mismo icono
     gris se lee uno por uno; con el color de cada cosa se lee de un vistazo cuál
     es de agua y cuál de entrenar, igual que los planes de entrenamiento se
     distinguen por su tono. */
  const TIPOS = {
    entreno: { label: 'Entrenamiento', icono: 'dumbbell', titulo: 'Toca entrenar',
      tono: 'var(--acc)',
      mensaje: 'Tu rutina de hoy te está esperando.' },
    agua: { label: 'Beber agua', icono: 'vaso', titulo: 'Hidrátate',
      tono: 'var(--agua)',
      mensaje: 'Un vaso de agua ahora.' },
    /* El título y el texto se escriben al lanzarlo, no al crearlo: a las ocho
       toca desayunar y a las nueve de la noche cenar, y el menú de hoy no es el
       de la semana que viene. Guardarlo al crear la alerta la dejaba diciendo
       «Hora de comer» para siempre. */
    comida: { label: 'Comida', icono: 'nutricion', titulo: 'Hora de comer',
      tono: '#f0a23c', segunLaHora: true,
      mensaje: 'Toca comida según tu plan.' },
    peso: { label: 'Pesarte', icono: 'perfil', titulo: 'Pésate',
      tono: '#2fc4b2',
      mensaje: 'Registra tu peso para seguir la evolución.' },
    suplemento: { label: 'Suplemento', icono: 'bote', titulo: 'Suplemento',
      tono: '#8e7cf0',
      mensaje: 'Toca tu suplemento.' },
    /* La frase del entrenador, pero por escrito y a una hora. La app ya la
       escribe cada día y la dejaba dentro de la pantalla de inicio, donde solo
       la ves si entras: justo cuando menos falta hace. El mensaje se rellena al
       lanzarla, no al crearla, porque se escribe cada día con tus datos. */
    motivacion: { label: 'Mensaje del entrenador', icono: 'chispa',
      tono: '#c06bf0',
      titulo: 'Tu entrenador', mensaje: 'Hoy toca. Abre y dale.', deIA: true },
    libre: { label: 'Personalizada', icono: 'campana', titulo: 'Recordatorio',
      tono: 'var(--dim2)', mensaje: '' }
  };

  /* Los tipos cuyo texto lo escribe la IA en el momento de lanzarlo */
  function esDeIA(tipo) { return !!(TIPOS[tipo] && TIPOS[tipo].deIA); }

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
      /* Se apunta la hora del último aviso lanzado: sin esto, «no me avisa» y
         «me avisó y no lo vi» son indistinguibles. */
      try { localStorage.setItem('trainingfr.ultimoAviso', String(Date.now())); } catch (e) { }
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

  /* El texto que va en el aviso. Casi siempre es el que escribiste al crearlo;
     en el del entrenador se pide en ese momento, para que hable de cómo vas hoy
     y no de cómo ibas el día que lo creaste. Si la IA no está o falla, sale el
     de reserva: más vale un aviso genérico que ninguno. */
  /* El título del aviso, con su nombre. Un «Tu entrenador» en la pantalla de
     bloqueo, entre los avisos de otras veinte apps, no dice que sea para ti. */
  /* ---------- la comida, dicha en concreto ----------
     «Hora de comer» a las ocho de la mañana no dice nada que no diga el reloj.
     La franja sale de tus horas de comer —las mismas que usa el cruce de las
     fotos—, las calorías del reparto de tu menú, y el plato del menú activo si
     lo hay. Todo eso ya está en la app; lo único que faltaba era juntarlo en la
     línea que se lee con el móvil bloqueado. */
  const VERBO = {
    desayuno: 'Toca desayunar', almuerzo: 'Toca almorzar',
    merienda: 'Toca merendar', cena: 'Toca cenar'
  };

  function comidaDeEsaHora(hora) {
    if (!g.Perfil || !Perfil.franjaDe) return null;
    const f = Perfil.franjaDe(hora);
    if (!f) return null;

    const out = { franja: f, titulo: VERBO[f.id] || ('Toca ' + f.label.toLowerCase()) };

    /* Lo que le toca a esa comida según el menú de hoy. Se busca por nombre de
       comida y, si el menú no la nombra igual, por la hora más cercana: los
       menús de la IA no siempre escriben «Desayuno». */
    const hoy = g.Menus && Menus.diaDeHoy ? Menus.diaDeHoy() : null;
    const comidas = (hoy && hoy.comidas) || [];
    if (comidas.length) {
      let c = comidas.filter(function (x) {
        return g.I18N && I18N.norm(String(x.nombre || '')) === I18N.norm(f.label);
      })[0];
      if (!c) {
        let mejor = Infinity;
        comidas.forEach(function (x) {
          const d = Math.abs(enMinutos(x.hora || '') - enMinutos(hora));
          if (x.hora && d < mejor) { mejor = d; c = x; }
        });
      }
      if (c) { out.plato = c.plato; out.kcal = c.kcal; out.prot = c.prot; }
    }

    /* Sin menú, al menos los números: el reparto por comida sale de tus macros
       y del número de comidas que haces al día. */
    if (out.kcal == null && g.Perfil && Perfil.macros) {
      const m = Perfil.macros();
      const cuantas = Math.max(2, Number(Perfil.datos().comidas) || 4);
      if (m) {
        out.kcal = Math.round(m.kcal / cuantas);
        out.prot = Math.round(m.prot / cuantas);
        out.aojo = true;
      }
    }
    return out;
  }

  function tituloDe(x) {
    if (TIPOS[x.alerta.tipo] && TIPOS[x.alerta.tipo].segunLaHora) {
      const c = comidaDeEsaHora(x.hora);
      if (c) return c.titulo;
    }
    if (!esDeIA(x.alerta.tipo)) return x.titulo;
    const n = String(Store.settings().name || '').trim();
    return n ? n + ', un momento' : x.titulo;
  }

  function textoDe(x) {
    if (TIPOS[x.alerta.tipo] && TIPOS[x.alerta.tipo].segunLaHora) {
      const c = comidaDeEsaHora(x.hora);
      if (c) {
        const partes = [];
        if (c.kcal) {
          partes.push('Unas ' + UI.num(c.kcal) + ' kcal' +
            (c.prot ? ' y ' + c.prot + ' g de proteína' : '') +
            (c.aojo ? ' (a ojo, sin menú)' : ''));
        }
        if (c.plato) partes.push(c.plato);
        /* Lo que el usuario escribiera a mano manda sobre lo calculado: si se
           molestó en poner un texto suyo, no se le pisa. */
        if (x.mensaje && x.mensaje !== TIPOS.comida.mensaje) partes.unshift(x.mensaje);
        if (partes.length) return Promise.resolve(partes.join(' · '));
      }
    }
    if (!esDeIA(x.alerta.tipo)) return Promise.resolve(x.mensaje);
    if (!g.IA || !IA.activa || !IA.activa() || !IA.pildora) {
      return Promise.resolve(x.mensaje || TIPOS.motivacion.mensaje);
    }
    return IA.pildora()
      .then(function (p) { return (p && p.frase) || x.mensaje || TIPOS.motivacion.mensaje; })
      .catch(function () { return x.mensaje || TIPOS.motivacion.mensaje; });
  }

  let temporizador = null;

  /* Revisa cada minuto mientras la app esté abierta. onAviso recibe lo que toca. */
  function arrancar(onAviso) {
    clearInterval(temporizador);
    const comprobar = function () {
      const p = pendientes();
      if (!p.length) return;
      p.forEach(function (x) {
        /* se marca ya, no cuando vuelva el texto: si la IA tarda, el minuto
           siguiente lo lanzaría otra vez */
        marcarLanzada(x.alerta.id, x.hora);
        textoDe(x).then(function (cuerpo) {
          x.mensaje = cuerpo;
          x.titulo = tituloDe(x);
          avisar(x.titulo, cuerpo);
        });
      });
      if (onAviso) onAviso(p);
    };
    comprobar();
    temporizador = setInterval(comprobar, 60000);
  }

  function parar() { clearInterval(temporizador); temporizador = null; }

  /* ---------- ¿de verdad va a avisar? ----------
     Aquí hay varias cosas que tienen que cumplirse a la vez, y basta con que
     falle una para que no suene nada. Una app que promete avisos y no avisa es
     peor que una que no los promete, así que en vez de afirmarlo se comprueba
     cada pieza y se dice cuál falta.

     La última es la incómoda: una página web no ejecuta nada mientras está
     cerrada. El reloj de aquí arriba solo corre con la app abierta —aunque sea
     en segundo plano—, y eso no se arregla desde aquí: haría falta un servidor
     que empuje los avisos. Para lo demás está el calendario. */
  function diagnostico() {
    const instalada = !!(g.matchMedia && matchMedia('(display-mode: standalone)').matches) ||
      g.navigator.standalone === true;

    return {
      soportado: soportado(),
      permiso: permiso(),
      instalada: instalada,
      /* En iOS los avisos web solo existen si la app está en la pantalla de
         inicio; en el navegador no hay ni permiso que pedir. */
      esIOS: /iPad|iPhone|iPod/.test(navigator.userAgent || ''),
      serviceWorker: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
      relojEnMarcha: temporizador !== null,
      activas: lista().filter(function (a) { return a.activa; }).length,
      ultimoAviso: Number(localStorage.getItem('trainingfr.ultimoAviso')) || 0
    };
  }

  /* Un aviso de prueba, ahora mismo. Es la única forma de saber que funciona:
     lo demás son suposiciones sobre permisos y ajustes del sistema. */
  function probar() {
    if (!soportado()) {
      return Promise.reject(new Error('Este navegador no sabe mostrar avisos.'));
    }
    if (Notification.permission !== 'granted') {
      return Promise.reject(new Error('Primero hay que dar permiso a los avisos.'));
    }
    const ok = avisar('Prueba de Training FR',
      'Si ves esto, los avisos funcionan con la app abierta.');
    return ok ? Promise.resolve(true)
      : Promise.reject(new Error('El sistema no ha dejado mostrarlo.'));
  }

  /* ---------- exportar al calendario ---------- */

  function dosDigitos(n) { return String(n).padStart(2, '0'); }

  /* Un archivo .ics con un evento repetido por alerta y su aviso 5 minutos antes.
     Al abrirlo, el móvil crea los recordatorios de verdad, incluso con la app cerrada. */
  /* Dónde vive la app, para poder volver a ella desde el evento. Se saca de
     donde esté corriendo y no de una constante: así vale igual en el sitio
     publicado, en una copia local y en el día que cambie de dominio. */
  function urlApp(hash) {
    try {
      const base = location.origin + location.pathname.replace(/[^/]*$/, '');
      return base + (hash || '');
    } catch (e) { return ''; }
  }

  /* A qué pantalla lleva cada tipo. Un aviso de agua que te deja en la portada
     te obliga a buscar dónde se marca; «mi día» lo tiene todo delante. */
  const DESTINO = {
    peso: '#/progreso',
    entreno: '#/dia',
    agua: '#/dia',
    comida: '#/dia',
    suplemento: '#/dia'
  };

  /* El formato parte las líneas a 75 octetos y continúa con un espacio al
     principio de la siguiente. Con la descripción llevando ahora el enlace de
     la app, las líneas se pasan de largo, y un cliente estricto se come el
     resto del evento sin decir nada. */
  function plegar(linea) {
    const bytes = function (t) { return unescape(encodeURIComponent(t)).length; };
    if (bytes(linea) <= 75) return linea;

    const fuera = [];
    let trozo = '';
    for (const c of linea) {
      /* El primer trozo cabe en 75; los siguientes en 74, porque llevan el
         espacio de continuación delante. */
      const tope = fuera.length ? 74 : 75;
      if (bytes(trozo + c) > tope) { fuera.push(trozo); trozo = ''; }
      trozo += c;
    }
    if (trozo) fuera.push(trozo);
    return fuera.join(String.fromCharCode(13, 10) + ' ');
  }

  const FIN = String.fromCharCode(13, 10);

  /* ---------- hasta cuándo ----------
     Sin límite es lo cómodo hasta que dejas la app: entonces te quedan avisos
     semanales para siempre en un calendario que ya no miras, y hay que ir a
     quitarlos. Con un plazo corto se acaban solos, pero hay que renovarlos.

     No hay una respuesta buena para todos, así que se pregunta. Lo que sí hace
     la app es no dejar que se te pase la fecha sin avisar. */
  const PLAZOS = [
    { id: '1m', label: 'Un mes', meses: 1, sub: 'Para probar cómo queda' },
    { id: '3m', label: 'Tres meses', meses: 3, sub: 'Un bloque de entrenamiento' },
    { id: '6m', label: 'Seis meses', meses: 6, sub: 'Media temporada' },
    { id: '1a', label: 'Un año', meses: 12, sub: 'Y renovar una vez al año' },
    { id: 'siempre', label: 'Sin límite', meses: 0,
      sub: 'Hasta que los quites tú. Ojo si dejas de usar la app' }
  ];

  function plazoDe(id) {
    return PLAZOS.filter(function (x) { return x.id === id; })[0] || PLAZOS[2];
  }

  /* El final del plazo, contando desde hoy. Se corta al final del día para que
     el último aviso de ese día sí suene. */
  function finDe(id) {
    const p = plazoDe(id);
    if (!p.meses) return 0;
    const d = new Date();
    d.setMonth(d.getMonth() + p.meses);
    d.setHours(23, 59, 59, 0);
    return d.getTime();
  }

  /* La misma cabecera para el archivo que los pone y el que los quita. El
     nombre va en X-WR-CALNAME: los calendarios que saben leerlo ofrecen meter
     todo esto en un calendario aparte, que es la única manera de poder
     apagarlos o borrarlos de una vez sin tocar nada más. */
  function cabecera(metodo) {
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Training FR//ES', 'CALSCALE:GREGORIAN',
      'METHOD:' + metodo,
      'X-WR-CALNAME:Training FR',
      'X-WR-CALDESC:' + escaparICS('Recordatorios creados por la app Training FR')
    ];
  }

  function ics(plazoId) {
    const plazo = plazoDe(plazoId || Store.settings().alertasPlazo || '6m');
    const hasta = finDe(plazo.id);

    /* El formato manda que UNTIL sea de la misma clase que DTSTART. Aquí las
       fechas van en hora local y sin zona, así que el UNTIL también: con la Z
       de UTC detrás, un cliente estricto lo rechaza y se queda sin repetir, o
       corta el último día en el huso equivocado. */
    const untilTxt = hasta ? ';UNTIL=' + (function (t) {
      const d = new Date(t);
      return d.getFullYear() + dosDigitos(d.getMonth() + 1) + dosDigitos(d.getDate()) +
        'T' + dosDigitos(d.getHours()) + dosDigitos(d.getMinutes()) + '59';
    })(hasta) : '';

    const NOMBRE_DIA = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const ahora = new Date();
    const sello = ahora.getUTCFullYear() + dosDigitos(ahora.getUTCMonth() + 1) +
      dosDigitos(ahora.getUTCDate()) + 'T' + dosDigitos(ahora.getUTCHours()) +
      dosDigitos(ahora.getUTCMinutes()) + '00Z';

    const lineas = cabecera('PUBLISH');
    const uids = [];

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

        const enlace = urlApp(DESTINO[a.tipo] || '#/dia');

        /* Con el nombre de la app delante. Un .ics no puede llevar icono —el
           formato no tiene ese campo, y el color que se ve en el calendario lo
           pone la app de calendario, no el archivo—, así que la única forma de
           que estos eventos se distingan de los demás es que lo digan. */
        /* En el calendario también se dice en concreto: «Toca desayunar» y no
           «Hora de comer». Lo que no va es el plato del menú —el archivo se
           escribe hoy y el evento suena dentro de tres semanas—, pero las
           calorías de esa comida salen de tus macros y no caducan. */
        const deHora = TIPOS[a.tipo] && TIPOS[a.tipo].segunLaHora
          ? comidaDeEsaHora(h) : null;
        const titulo = 'Training FR · ' + ((deHora && deHora.titulo) || a.titulo);

        /* Y su enlace, para volver a la app desde el propio evento. Va en URL
           —que es donde lo espera el calendario— y también al final de la
           descripción, porque hay clientes que no enseñan el campo URL. */
        const suyo = deHora && deHora.kcal
          ? 'Unas ' + UI.num(deHora.kcal) + ' kcal' +
            (deHora.prot ? ' y ' + deHora.prot + ' g de proteína' : '') +
            '. Lo que toca hoy, en la app.'
          : a.mensaje;

        const cuerpo = (suyo ? suyo + String.fromCharCode(10) +
          String.fromCharCode(10) : '') + 'Abrir en Training FR: ' + enlace;

        const uid = a.id + '-' + n + '@trainingfr';
        uids.push(uid);

        lineas.push(
          'BEGIN:VEVENT',
          'UID:' + uid,
          'DTSTAMP:' + sello,
          'DTSTART:' + fecha,
          'DURATION:PT15M',
          'RRULE:FREQ=WEEKLY;BYDAY=' +
            a.dias.map(function (d) { return NOMBRE_DIA[d]; }).join(',') + untilTxt,
          'SUMMARY:' + escaparICS(titulo),
          'DESCRIPTION:' + escaparICS(cuerpo),
          /* Para los calendarios de escritorio, que sí saben filtrar y buscar
             por categoría. El móvil la ignora, pero no estorba y cuesta una
             línea. */
          'CATEGORIES:Training FR',
          'URL:' + enlace,
          'BEGIN:VALARM', 'TRIGGER:-PT5M', 'ACTION:DISPLAY',
          'DESCRIPTION:' + escaparICS(titulo), 'END:VALARM',
          'END:VEVENT'
        );
      });
    });

    /* Se apunta lo que se ha exportado, sumando y sin borrar lo de antes. Sin
       esto, el archivo que los quita no puede quitar lo que ya no existe en la
       app: si bajaste ocho avisos de agua y luego los dejaste en cuatro, los
       otros cuatro siguen sonando en el calendario y la app ya no sabe ni sus
       identificadores.

       Y tiene que acumular, no sustituir: guardando solo la última descarga,
       volver a bajar el archivo despues de quitar horas borraba de la memoria
       justo los que habian quedado huerfanos, que son los unicos que no se
       pueden cancelar de otra manera. */
    const sabidos = {};
    (Store.settings().alertasExportadas || []).forEach(function (u) { sabidos[u] = 1; });
    uids.forEach(function (u) { sabidos[u] = 1; });
    Store.setSetting('alertasExportadas', Object.keys(sabidos));
    Store.setSetting('alertasHuella', huella());
    Store.setSetting('alertasPlazo', plazo.id);
    Store.setSetting('alertasHasta', hasta);

    lineas.push('END:VCALENDAR');
    return lineas.map(plegar).join(FIN);
  }

  /* ---------- quitarlos del calendario ----------
     Buscar a mano ocho eventos repetidos entre los del trabajo y los cumpleaños
     es el motivo por el que nadie los quita nunca: se quedan sonando meses
     después de dejar de usarlos.

     El formato tiene una manera de decirlo —METHOD:CANCEL con los mismos
     identificadores— y es lo que lee el calendario para retirarlos de golpe.
     Se cancelan los de la última descarga más los de ahora: los primeros
     cubren lo que ya no existe en la app, los segundos lo que sigue vivo. */
  function icsCancelar() {
    const ahora = new Date();
    const sello = ahora.getUTCFullYear() + dosDigitos(ahora.getUTCMonth() + 1) +
      dosDigitos(ahora.getUTCDate()) + 'T' + dosDigitos(ahora.getUTCHours()) +
      dosDigitos(ahora.getUTCMinutes()) + '00Z';

    const vistos = {};
    (Store.settings().alertasExportadas || []).forEach(function (u) { vistos[u] = 1; });
    lista().forEach(function (a) {
      (a.horas || []).forEach(function (h, n) { vistos[a.id + '-' + n + '@trainingfr'] = 1; });
    });

    const uids = Object.keys(vistos);
    if (!uids.length) return '';

    const lineas = cabecera('CANCEL');
    uids.forEach(function (uid) {
      lineas.push(
        'BEGIN:VEVENT',
        'UID:' + uid,
        'DTSTAMP:' + sello,
        /* Una cancelación sube de versión: un calendario que ya tiene la 0
           guardada ignora otra 0, y el evento se quedaría donde estaba. */
        'SEQUENCE:9',
        'STATUS:CANCELLED',
        'SUMMARY:' + escaparICS('Training FR · aviso retirado'),
        'END:VEVENT'
      );
    });
    lineas.push('END:VCALENDAR');
    return lineas.map(plegar).join(FIN);
  }

  function cuantosExportados() {
    return (Store.settings().alertasExportadas || []).length;
  }

  /* ---------- ¿el calendario está al día? ----------
     Un archivo descargado es una foto del momento: cambias la hora del agua en
     la app y el calendario sigue avisando a la de antes, sin que nada lo diga.
     Que se actualizara solo pediría una suscripción por URL —un servidor que
     sirva esto—, y ni con eso valdría: los calendarios refrescan lo suscrito
     con mucha pereza, algunos una vez al día, y un aviso que tarda un día en
     enterarse de que cambiaste la hora es peor que volver a bajar el archivo.

     Lo que sí se puede hacer sin depender de nadie es no olvidarse: se guarda
     una huella de lo exportado y, si lo de ahora no coincide, la app lo dice.
     Que es el problema de verdad —nadie se acuerda—, no el de tener que tocar
     un botón. */
  function huella() {
    return lista().filter(function (a) { return a.activa && a.dias.length; })
      .map(function (a) {
        return a.id + ':' + a.titulo + ':' + (a.horas || []).join('-') +
          ':' + (a.dias || []).slice().sort().join('');
      }).sort().join('|');
  }

  function calendarioDesfasado() {
    if (!cuantosExportados()) return false;
    return (Store.settings().alertasHuella || '') !== huella();
  }

  /* ---------- ¿se están acabando? ----------
     Un plazo que termina sin avisar es peor que no tener plazo: los avisos
     dejan de sonar un martes cualquiera y uno tarda semanas en darse cuenta de
     que lleva sin beber agua porque nadie se lo recuerda. Tres semanas de
     margen dan tiempo de sobra a volver a bajarlo. */
  function calendarioCaduca() {
    const hasta = Number(Store.settings().alertasHasta) || 0;
    if (!cuantosExportados() || !hasta) return null;
    const dias = Math.ceil((hasta - Date.now()) / 864e5);
    if (dias > 21) return null;
    return { dias: dias, hasta: hasta, caducado: dias <= 0 };
  }

  function plazoActual() {
    return plazoDe(Store.settings().alertasPlazo || '6m');
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
    /* Se guarda en 24 h y se enseña como lo escriba su teléfono */
    const h = (a.horas || []).map(UI.hora);
    if (h.length <= 3) return h.join(' · ');
    const bruto = a.horas;
    const paso = (enMinutos(bruto[bruto.length - 1]) - enMinutos(bruto[0])) / (bruto.length - 1);
    const hh = Math.floor(paso / 60), mm = Math.round(paso % 60);
    const cada = hh ? hh + ' h' + (mm ? ' ' + mm : '') : mm + ' min';
    return h.length + ' avisos · de ' + h[0] + ' a ' + h[h.length - 1] + ' cada ' + cada;
  }

  g.Alertas = {
    esDeIA: esDeIA, textoDe: textoDe, tituloDe: tituloDe,
    TIPOS: TIPOS, DIAS: DIAS,
    lista: lista, nueva: nueva, guardar: guardar, borrar: borrar, desdeRutinas: desdeRutinas,
    soportado: soportado, permiso: permiso, pedirPermiso: pedirPermiso, avisar: avisar,
    pendientes: pendientes, arrancar: arrancar, parar: parar, marcarLanzada: marcarLanzada,
    ics: ics, icsCancelar: icsCancelar, cuantosExportados: cuantosExportados,
    calendarioDesfasado: calendarioDesfasado, calendarioCaduca: calendarioCaduca,
    PLAZOS: PLAZOS, plazoActual: plazoActual, finDe: finDe,
    resumenDias: resumenDias, resumenHoras: resumenHoras,
    diagnostico: diagnostico, probar: probar,
    sugerencias: sugerencias, yaExiste: yaExiste, crearDesdeSugerencia: crearDesdeSugerencia,
    repartir: repartir, enMinutos: enMinutos, aHora: aHora,
    horaHabitualDeEntreno: horaHabitualDeEntreno
  };
})(window);
