/* vistas9.js — medir una salida con el GPS.

   Pantalla de dos estados y nada más: elegir qué vas a hacer, y los números
   mientras lo haces. Lo que se ve mientras se anda tiene que leerse de un
   vistazo y con el brazo en movimiento, así que los kilómetros van enormes y
   el resto en una fila por debajo, que es el orden en el que se miran.

   No hay mapa. Un mapa de verdad necesita una librería y un servicio de
   mosaicos —dependencia y factura, las dos cosas que esta app no tiene— y para
   saber que diste la vuelta al parque basta con la forma del recorrido, que se
   dibuja aquí mismo con un trazo SVG. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };

  /* Las cuatro donde la distancia significa algo. Nadar no entra aunque mida
     distancia: el GPS no atraviesa el agua y daría cero metros y una hora. */
  const CUALES = [
    { id: 'caminar', ico: 'caminar' },
    { id: 'correr', ico: 'correr' },
    { id: 'bici', ico: 'bici' },
    { id: 'senderismo', ico: 'senderismo' }
  ];

  let elegida = 'caminar';
  let soltar = null;

  function actDe(id) {
    return (g.App && App.actividadPorId && App.actividadPorId(id)) ||
      { id: id, label: id, met: 4, musculos: [] };
  }

  /* ---------- lo que se ve mientras andas ---------- */

  function dato(valor, etiqueta) {
    return '<span class="med-dato"><b>' + esc(valor) + '</b>' +
      '<i>' + esc(etiqueta) + '</i></span>';
  }

  function panelHTML(e) {
    const km = e.km < 10 ? e.km.toFixed(2) : e.km.toFixed(1);
    const traza = Medir.trazaSVG(e.puntos, 300, 120);
    return html`
      <div class="card med-panel${raw(e.fase === 'pausa' ? ' en-pausa' : '')}">
        <div class="med-km"><b>${km}</b><i>km</i></div>
        <div class="med-fila">
          ${raw(dato(e.tiempo, T('Tiempo')))}
          ${raw(dato(e.ritmo, e.act === 'bici' ? T('Velocidad') : T('Ritmo')))}
          ${raw(dato(UI.num(e.kcal), T('kcal')))}
        </div>
        ${raw(e.cadencia ? '<div class="med-fila med-fila2">' +
          dato(UI.num(e.pasos), T('Pasos')) +
          dato(e.cadencia + '', T('Pasos/min')) + '</div>' : '')}
        ${raw(traza ? '<svg class="med-traza" viewBox="0 0 300 120" ' +
          'preserveAspectRatio="xMidYMid meet"><path d="' + traza + '"/></svg>' : '')}
        ${raw(e.fase === 'pausa'
          ? '<p class="med-aviso">' + esc(T('En pausa. No se está sumando distancia.')) + '</p>'
          : e.error ? '<p class="med-aviso mal">' + esc(e.error) + '</p>'
          : e.senal === 'mala'
            ? '<p class="med-aviso">' + esc(Tn('Señal floja ({m} m). Lo que se mueva ' +
                'ahora no se suma, para no inventar metros.', { m: e.precision })) + '</p>'
            : '')}
      </div>`;
  }

  /* ---------- la vista ---------- */

  V.medir = function () {
    const s = Medir.soporta();
    const e = Medir.estado();

    if (!s.gps) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} ${T('Volver')}</button>
        <h1>${T('Medir con el GPS')}</h1>
        <div class="card"><p style="margin:0">${T('Este navegador no da acceso a la ' +
          'ubicación, así que aquí no se puede medir. Puedes apuntar la salida a mano ' +
          'con los minutos que fueron.')}</p></div>`;
    }

    if (e.fase === 'midiendo' || e.fase === 'pausa') {
      return html`
        <h1 class="med-tit">${raw(icon(icoDe(e.act)))} ${T(actDe(e.act).label)}</h1>
        <div id="med-panel">${raw(panelHTML(e))}</div>
        <div class="row med-botones">
          <button class="btn grow" data-a="${e.fase === 'pausa' ? 'seguir' : 'pausar'}">
            ${raw(icon(e.fase === 'pausa' ? 'play' : 'pause'))}
            ${e.fase === 'pausa' ? T('Seguir') : T('Pausar')}</button>
          <button class="btn primary grow" data-a="terminar">
            ${raw(icon('flag'))} ${T('Terminar')}</button>
        </div>
        <button class="enlace-flojo" data-a="tirar" style="margin-top:14px">
          ${T('Descartar sin guardar')}</button>`;
    }

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Volver')}</button>
      <h1>${T('Medir con el GPS')}</h1>
      <p class="muted">${T('Mide la distancia, el ritmo y lo que gastas de verdad, en vez ' +
        'de estimarlo por los minutos. Lo que midas se guarda como una actividad más.')}</p>

      <div class="med-elige">
        ${raw(CUALES.map(function (c) {
          return '<button class="med-opcion' + (elegida === c.id ? ' on' : '') + '" ' +
            'data-act="' + c.id + '">' + icon(c.ico) +
            '<span>' + esc(T(actDe(c.id).label)) + '</span></button>';
        }).join(''))}
      </div>

      <button class="btn primary block" data-a="empezar" style="margin-top:16px">
        ${raw(icon('ubicacion'))} ${T('Empezar a medir')}</button>

      <p class="tiny muted" style="margin-top:14px">${T('Mientras mide, la pantalla se ' +
        'queda encendida y el GPS gasta batería. Con el móvil bloqueado el navegador ' +
        'congela la página y se deja de contar, así que esto es para llevarlo en la mano ' +
        'o con la pantalla visible.')}</p>
      ${raw(s.movimiento ? '<p class="tiny muted">' + esc(T('Si das permiso al sensor de ' +
        'movimiento, cuenta también los pasos y el ritmo de zancada.')) + '</p>' : '')}`;
  };

  function icoDe(id) {
    const c = CUALES.filter(function (x) { return x.id === id; })[0];
    return c ? c.ico : 'correr';
  }

  V.medir.mount = function (root) {
    bindAll(root, '[data-act]', function (el) {
      elegida = el.getAttribute('data-act');
      App.render();
    });

    bind(root, '[data-a=atras]', function () { go('perfil'); });

    bind(root, '[data-a=empezar]', function () {
      const a = actDe(elegida);
      if (!Medir.arrancar(elegida, a.met)) {
        UI.toast(T('No se pudo arrancar el GPS.'));
        return;
      }
      App.render();
    });

    bind(root, '[data-a=pausar]', function () { Medir.pausar(); App.render(); });
    bind(root, '[data-a=seguir]', function () { Medir.seguir(); App.render(); });

    bind(root, '[data-a=tirar]', function () {
      UI.confirm(T('Descartar esta salida'), T('No se guardará nada de lo medido.'),
        T('Descartar'), true).then(function (si) {
          if (!si) return;
          Medir.tirar();
          App.render();
        });
    });

    bind(root, '[data-a=terminar]', function () { terminar(); });

    /* Repintar solo el panel y no la pantalla entera. Un render completo cada
       segundo perdía el foco, reiniciaba la animación de entrada y, con el
       dedo encima, se comía el toque en «pausar». */
    if (soltar) soltar();
    soltar = Medir.alCambiar(function (e) {
      if (e.fase !== 'midiendo' && e.fase !== 'pausa') return;
      const caja = document.getElementById('med-panel');
      if (caja) caja.innerHTML = panelHTML(e);
    });
  };

  /* Guardar lo medido. La sesión se escribe igual que una actividad apuntada a
     mano —mismo sitio, mismo historial, mismos músculos— y encima lleva lo que
     solo el GPS sabe: los kilómetros, el ritmo y la forma del recorrido. */
  function terminar() {
    const r = Medir.terminar();
    if (!r) return;
    const a = actDe(r.act);
    const minutos = Math.max(1, Math.round(r.ms / 60000));

    if (r.km < 0.05) {
      UI.toast(T('No se ha medido casi nada, así que no se guarda.'));
      App.render();
      return;
    }

    Store.addSession({
      routineName: T(a.label),
      start: r.t0,
      end: r.t0 + r.ms,
      entries: [], setsDone: 0, volume: 0,
      manual: true,
      actividad: a.id,
      minutos: minutos,
      kcal: r.kcal,
      musculos: (a.musculos || []).slice(),
      /* De dónde salió el número, que es lo que distingue esta sesión de una
         apuntada a ojo: aquí nadie ha estimado los minutos. */
      origen: 'gps',
      km: Math.round(r.km * 100) / 100,
      ritmo: r.ritmo,
      pasos: r.pasos || 0,
      cadencia: r.cadencia || 0,
      ruta: r.puntos || []
    });

    UI.toast(Tn('{que}: {km} km en {min} min', {
      que: T(a.label), km: (Math.round(r.km * 100) / 100).toString(), min: minutos
    }));
    go('progreso');
  }

  /* ================= los permisos del navegador =================

     Lo primero que hay que decir, y lo dice la propia pantalla: *una página web
     no puede quitar un permiso*. Puede pedirlo una vez y puede mirar cómo
     está, pero retirarlo se hace en los ajustes del navegador y punto.

     Por eso aquí no hay interruptores. Un interruptor promete que al apagarlo
     se apaga, y el de «ubicación» no apagaría nada: se quedaría encendido
     solo, que es la peor forma de enterarse de que un control era de mentira.
     Lo que hay es el estado de verdad de cada cosa, un botón donde todavía se
     puede pedir, y dónde se va a quitarlo cuando ya no.

     Y está todo junto porque la pregunta que trae aquí es «qué le he dado yo a
     esta app». Esa pregunta no se responde recorriendo seis pantallas para ver
     en cuál salió un cartel del navegador hace tres meses. */

  const PERMISOS = [
    { id: 'avisos', ico: 'campana', titulo: 'Avisos',
      para: 'Recordatorios de entrenar, beber y comer mientras la app esté abierta.' },
    { id: 'ubicacion', ico: 'ubicacion', titulo: 'Ubicación',
      para: 'Distancia y ritmo al medir una salida con el GPS.' },
    { id: 'movimiento', ico: 'correr', titulo: 'Movimiento',
      para: 'Pasos y zancadas, y contar repeticiones con el móvil encima.' },
    { id: 'camara', ico: 'camara', titulo: 'Cámara',
      para: 'Calcular un plato desde la foto.' },
    { id: 'fotos', ico: 'compartir', titulo: 'Galería',
      para: 'Elegir una foto del carrete, para tu perfil o para un plato.' },
    { id: 'sonido', ico: 'altavoz', titulo: 'Sonido',
      para: 'El pitido del descanso y de los avisos.' },
    { id: 'bluetooth', ico: 'banda', titulo: 'Bluetooth',
      para: 'Leer el pulso de una banda, una pulsera o un reloj.' },
    { id: 'guardado', ico: 'llave', titulo: 'Guardado permanente',
      para: 'Que el navegador no borre tus rutinas si se queda sin espacio.' }
  ];

  /* Lo que contestó el usuario la última vez que se lo pedimos nosotros.

     Hace falta porque *Safari no tiene la API de permisos para la ubicación ni
     para la cámara*: preguntarle cómo están no devuelve un estado, devuelve un
     error. Resultado en el iPhone: dabas permiso, salía el cartel del sistema,
     lo aceptabas, y la fila seguía diciendo «Permitir» como si no hubiera
     pasado nada. Pareció un botón roto y era una pantalla ciega.

     Cuando el navegador sabe responder, manda el navegador —es la verdad de
     ahora, y recoge también lo que el usuario cambie por su cuenta en los
     ajustes del sitio—. Cuando no sabe, vale esto, que es lo único que nos
     consta. */
  function recordado(id) {
    try { return (Store.settings().permisos || {})[id] || ''; }
    catch (e) { return ''; }
  }

  function recordar(id, valor) {
    const t = Object.assign({}, Store.settings().permisos || {});
    t[id] = valor;
    Store.setSetting('permisos', t);
  }

  /* Lo que sabemos de cada uno. `preguntar` significa que todavía se puede
     pedir; `no` que el usuario dijo que no y hay que ir a los ajustes. */
  let estados = {};

  function mirarPermisos() {
    /* Algunos navegadores no rechazan la promesa: lanzan de golpe al no
       conocer el nombre. Sin el try, la pantalla entera se quedaba sin
       estados. */
    const pide = function (nombre) {
      if (!g.navigator || !navigator.permissions || !navigator.permissions.query) {
        return Promise.resolve('');
      }
      try {
        return navigator.permissions.query({ name: nombre })
          .then(function (r) { return r.state; })
          .catch(function () { return ''; });
      } catch (e) { return Promise.resolve(''); }
    };

    /* El navegador manda cuando sabe; si no sabe, lo que nos conste. */
    const juntar = function (vivo, id) {
      if (vivo === 'granted') return 'si';
      if (vivo === 'denied') return 'no';
      if (vivo === 'prompt') return 'preguntar';
      return recordado(id) || 'preguntar';
    };

    const fin = {};

    fin.avisos = !('Notification' in g) ? 'imposible'
      : Notification.permission === 'granted' ? 'si'
      : Notification.permission === 'denied' ? 'no' : 'preguntar';

    fin.bluetooth = (g.navigator && navigator.bluetooth) ? 'preguntar' : 'imposible';

    /* En iOS el permiso de movimiento no se puede consultar: no hay API que lo
       diga, solo pedirlo. Lo que sí se puede es acordarse de lo que contestó,
       que es lo que se guarda al pedirlo desde aquí. */
    fin.movimiento = !(g.DeviceMotionEvent) ? 'imposible'
      : typeof DeviceMotionEvent.requestPermission !== 'function' ? 'si'
      : (recordado('movimiento') || 'preguntar');

    /* La galería no es un permiso del navegador: el carrete lo abre el sistema
       cuando pulsas «elegir foto», y pregunta ahí. No hay nada que dar por
       adelantado, y poner un botón de «permitir» que no permite nada sería
       exactamente el botón que no hace nada. */
    fin.fotos = 'alusar';

    /* El sonido tampoco se concede: se prueba. Depende del interruptor de la
       app, del de silencio del móvil —que no hay forma de consultar— y de que
       el navegador haya «desbloqueado» el audio con un toque. Con tres cosas
       invisibles, lo honrado es un botón que suena. */
    fin.sonido = Store.settings().sound === false ? 'apagado' : 'probar';

    return Promise.all([
      pide('geolocation'), pide('camera'),
      (g.navigator && navigator.storage && navigator.storage.persisted)
        ? navigator.storage.persisted().catch(function () { return false; })
        : Promise.resolve(null)
    ]).then(function (r) {
      fin.ubicacion = !(g.navigator && navigator.geolocation) ? 'imposible'
        : juntar(r[0], 'ubicacion');
      fin.camara = !(g.navigator && navigator.mediaDevices) ? 'imposible'
        : juntar(r[1], 'camara');
      fin.guardado = r[2] === null ? 'imposible' : r[2] ? 'si' : 'preguntar';
      estados = fin;
      return fin;
    });
  }

  function ladoHTML(id, est) {
    if (est === 'si') {
      return '<span class="perm-estado si">' + icon('check') + esc(T('Concedido')) + '</span>';
    }
    if (est === 'no') {
      return '<span class="perm-estado no">' + esc(T('Bloqueado')) + '</span>';
    }
    if (est === 'imposible') {
      return '<span class="perm-estado">' + esc(T('Aquí no')) + '</span>';
    }
    if (est === 'alusar') {
      return '<span class="perm-estado">' + esc(T('Al usarlo')) + '</span>';
    }
    if (est === 'apagado') {
      return '<button class="btn sm" data-perm="' + id + '">' + esc(T('Encender')) + '</button>';
    }
    if (est === 'probar') {
      return '<button class="btn sm" data-perm="' + id + '">' + esc(T('Probar')) + '</button>';
    }
    return '<button class="btn sm" data-perm="' + id + '">' + esc(T('Permitir')) + '</button>';
  }

  function filasHTML() {
    return PERMISOS.map(function (p) {
      const est = estados[p.id] || 'preguntar';
      return '<div class="list-row perm-fila' + (est === 'imposible' ? ' apagada' : '') + '">' +
        '<span class="row-icon">' + icon(p.ico) + '</span>' +
        '<div class="grow">' +
          '<div class="list-row-title">' + esc(T(p.titulo)) + '</div>' +
          '<div class="list-row-sub">' + esc(T(p.para)) + '</div>' +
        '</div>' +
        ladoHTML(p.id, est) +
      '</div>';
    }).join('');
  }

  function notaHTML() {
    const dudoso = PERMISOS.filter(function (p) { return estados[p.id] === 'no'; }).length;
    if (!dudoso) return '';
    return '<div class="card perm-nota"><p style="margin:0">' +
      esc(T('Lo bloqueado no lo puede desbloquear la app: una página web pide ' +
        'permisos, pero no se los quita ni se los devuelve. Eso se cambia en el ' +
        'navegador, en el candado o la «i» de la barra de direcciones, en ' +
        '«Ajustes del sitio».')) + '</p></div>';
  }

  V.permisos = function () {
    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Perfil')}</button>
      <h1>${T('Permisos')}</h1>
      <p class="muted">${T('Lo que le has dado a la app en este navegador, y lo que ' +
        'hace falta para cada cosa. Nada de esto se enciende solo.')}</p>

      <div class="list" id="perm-lista" style="margin-top:16px">${raw(filasHTML())}</div>
      <div id="perm-nota">${raw(notaHTML())}</div>

      <div class="list-title">${T('De dónde salen')}</div>
      <div class="list">
        <button class="list-row tap" data-a="ir-alertas">
          <span class="row-icon">${raw(icon('campana'))}</span>
          <div class="grow"><div class="list-row-title">${T('Alertas')}</div>
            <div class="list-row-sub">${T('Qué avisos hay puestos y a qué hora')}</div></div>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
        <button class="list-row tap" data-a="ir-reloj">
          <span class="row-icon">${raw(icon('corazon'))}</span>
          <div class="grow"><div class="list-row-title">${T('Reloj y salud')}</div>
            <div class="list-row-sub">${T('El Bluetooth se concede aparato a aparato, al buscarlo')}</div></div>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
        <button class="list-row tap" data-a="ir-medir">
          <span class="row-icon">${raw(icon('ubicacion'))}</span>
          <div class="grow"><div class="list-row-title">${T('Medir con el GPS')}</div>
            <div class="list-row-sub">${T('Donde se usan la ubicación y el movimiento')}</div></div>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>

      <p class="tiny muted" style="margin-top:14px">${T('Ninguno de estos datos sale de ' +
        'tu dispositivo por darlo aquí: la ubicación se usa para la cuenta de ' +
        'kilómetros y se queda contigo, igual que el resto.')}</p>`;
  };

  /* Se guarda la raíz para poder repintar solo la lista después, sin pasar por
     el repintado general. */
  let raiz = null;

  function atarBotones() {
    if (!raiz) return;
    bindAll(raiz, '[data-perm]', function (el) {
      pedir(el.getAttribute('data-perm'));
    });
  }

  /* Mira cómo está cada permiso y actualiza *solo la lista*.

     Antes esto terminaba en `App.render()`, y ahí estaba el fallo gordo: el
     repintado general vuelve a llamar a `mount`, `mount` volvía a mirar, y
     mirar volvía a repintar. Un bucle infinito que dejaba el móvil clavado y,
     de paso, hacía que los botones no respondieran —el nodo que estabas
     pulsando desaparecía a mitad del toque, sustituido por otro igual—. Las
     dos cosas que se veían eran el mismo fallo. */
  function refrescar() {
    return mirarPermisos().then(function () {
      if (!raiz) return;
      const lista = raiz.querySelector('#perm-lista');
      const nota = raiz.querySelector('#perm-nota');
      if (lista) lista.innerHTML = filasHTML();
      if (nota) nota.innerHTML = notaHTML();
      /* Los botones son nodos nuevos: hay que volver a atarlos. */
      atarBotones();
    });
  }

  V.permisos.mount = function (root) {
    raiz = root;
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=ir-alertas]', function () { go('alertas'); });
    bind(root, '[data-a=ir-reloj]', function () { go('reloj'); });
    bind(root, '[data-a=ir-medir]', function () { go('medir'); });
    atarBotones();

    /* Con los valores de la última visita, la pantalla de permisos mentiría
       justo en lo único que cuenta, así que se vuelve a mirar al entrar. */
    refrescar();
  };

  function pedir(id) {
    const luego = refrescar;

    if (id === 'avisos') {
      Notification.requestPermission().then(luego);
      return;
    }
    if (id === 'ubicacion') {
      /* No hay forma de pedir la ubicación sin pedir una posición: el cartel
         del navegador sale con la primera consulta, no con una llamada aparte.
         Y el resultado se apunta, que en Safari es lo único que lo sabrá. */
      navigator.geolocation.getCurrentPosition(
        function () { recordar('ubicacion', 'si'); UI.toast(T('Ubicación concedida.')); luego(); },
        function (err) {
          recordar('ubicacion', err && err.code === 1 ? 'no' : '');
          if (err && err.code === 1) UI.toast(T('No la has concedido.'));
          luego();
        },
        { timeout: 15000, enableHighAccuracy: false });
      return;
    }
    if (id === 'movimiento') {
      Medir.pidePermisoMovimiento().then(function (ok) {
        recordar('movimiento', ok ? 'si' : 'no');
        UI.toast(ok ? T('Movimiento concedido.') : T('No la has concedido.'));
        luego();
      });
      return;
    }
    if (id === 'sonido') {
      /* Apagado en la app, pitar no es una prueba: no sonaría y parecería que
         falla el móvil. Ahí lo que hace falta es el interruptor, que vive en
         Ajustes. */
      if (Store.settings().sound === false) { go('ajustes'); return; }
      /* Y encendido, suena: con eso se responde de una vez a las tres cosas que
         no se pueden consultar —el interruptor de la app, el de silencio del
         móvil y si el navegador ha soltado ya el audio—. */
      try { UI.beep(); } catch (e) { /* nada */ }
      UI.toast(T('Si no has oído nada, mira el interruptor de silencio del móvil.'));
      return;
    }
    if (id === 'camara') {
      navigator.mediaDevices.getUserMedia({ video: true }).then(function (flujo) {
        recordar('camara', 'si');
        UI.toast(T('Cámara concedida.'));
        /* Apagar la cámara en cuanto la concede: aquí no se graba nada, solo se
           preguntaba. Dejarla viva encendería la luz del móvil en una pantalla
           de ajustes, que es justo lo que hace desconfiar de una app. */
        flujo.getTracks().forEach(function (t) { t.stop(); });
        luego();
      }).catch(function (e) {
        recordar('camara', e && e.name === 'NotAllowedError' ? 'no' : '');
        UI.toast(T('No la has concedido.'));
        luego();
      });
      return;
    }
    if (id === 'bluetooth') { go('reloj'); return; }
    if (id === 'fotos') { return; }
    if (id === 'guardado') {
      navigator.storage.persist().then(function (ok) {
        /* Safari lo decide él y casi siempre dice que no, así que se cuenta lo
           que ha pasado en vez de dejar el botón igual que estaba. */
        UI.toast(ok ? T('Guardado permanente concedido.')
          : T('El navegador no lo ha concedido. Lo da solo cuando usas la app a menudo.'));
        luego();
      }).catch(luego);
    }
  }
})(window);
