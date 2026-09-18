/* instalar.js — que la app se instale desde el propio enlace.

   El problema real no es técnico, es de reparto. Se comparte un enlace y quien
   lo abre se queda en una pestaña: la app funciona, pero no está en su móvil.
   Decirle «usa Añadir a la pantalla de inicio» en un párrafo de Ajustes no lo
   arregla, porque nadie entra en Ajustes de una app que todavía no tiene.

   Cada sitio se comporta de una manera y no hay un camino único:

   - Chrome y Edge (Android y escritorio) avisan con `beforeinstallprompt`
     cuando la app cumple los requisitos, y dejan lanzar el diálogo nativo
     cuando queramos. Ahí sí hay un botón que instala de verdad, de un toque.
   - Safari en iPhone no tiene ese evento ni manera de lanzar nada: solo se
     puede instalar a mano desde Compartir › Añadir a pantalla de inicio. Lo
     único que podemos hacer es enseñar dónde está, con su icono.
   - Los navegadores metidos dentro de otra app —WhatsApp, Instagram, TikTok—
     no pueden instalar nada de ninguna manera. Y ese es justo el sitio donde
     cae un enlace compartido, así que es el caso más importante de los tres:
     hay que decir que se abra fuera, no fingir que se puede.

   Aquí se decide cuál de los tres es y se enseña lo que corresponda, una vez y
   sin insistir. */
(function (g) {
  'use strict';

  const UI = g.UI;
  const esc = UI.esc;

  /* ---------- dónde estamos ---------- */

  const ua = String(navigator.userAgent || '');

  /* iPadOS 13+ miente y dice que es un Mac. Se le pilla porque un Mac de
     verdad no tiene pantalla táctil. */
  const esIOS = /iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);

  const esAndroid = /android/i.test(ua);

  /* Navegadores dentro de otra app. Ninguno puede instalar, así que lo único
     útil es mandar a abrirlo fuera. La lista va por lo que cada uno mete en su
     user agent; los que no lo declaran se detectan por descarte más abajo. */
  const esWebviewDeclarado = /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|TikTok|Twitter|BytedanceWebview|LinkedInApp|GSA\//i.test(ua);

  /* En iOS, cualquier navegador que no sea Safari es un WebKit prestado sin
     «Añadir a pantalla de inicio». Chrome en iOS sí lo tiene desde hace poco,
     así que se le deja pasar; el resto, no. */
  const esSafariIOS = esIOS && /safari/i.test(ua) &&
    !/crios|fxios|edgios|opios|duckduckgo/i.test(ua) && !esWebviewDeclarado;
  const esChromeIOS = esIOS && /crios/i.test(ua);

  /* En Android, lo que abre WhatsApp dentro de su app es un WebView de Chrome y
     su user agent es casi el de Chrome. Lo que los separa es el token `wv`, o
     el `Version/4.0` que el Chrome de verdad no lleva. Se mira solo cuando ya
     sabemos que no va a haber diálogo nativo, para que un falso positivo no le
     quite a nadie el botón de instalar. */
  const esWebviewAndroid = esAndroid &&
    (/;\s*wv[;)]/i.test(ua) || /Version\/\d+\.\d+\s+Chrome\//i.test(ua));

  function dentroDeOtraApp() {
    if (esWebviewDeclarado) return true;
    if (esWebviewAndroid) return true;
    /* En iOS un webview sin declarar se delata: dice ser Safari pero le falta
       la barra del navegador, así que la ventana ocupa toda la pantalla. No es
       infalible, y por eso solo se usa para elegir el texto del aviso, nunca
       para bloquear nada. */
    if (esIOS && !esSafariIOS && !esChromeIOS) return true;
    return false;
  }

  /* Ya instalada: se abrió desde el icono y no desde el navegador. */
  function instalada() {
    if (g.matchMedia && matchMedia('(display-mode: standalone)').matches) return true;
    if (g.matchMedia && matchMedia('(display-mode: fullscreen)').matches) return true;
    if (navigator.standalone === true) return true;                 /* iOS */
    if (String(document.referrer || '').indexOf('android-app://') === 0) return true;
    return false;
  }

  /* ---------- lo que el usuario ya ha contestado ----------
     Se guarda en este dispositivo y no viaja a la cuenta a propósito: instalar
     es cosa de cada móvil, no de la persona. Que lo haya instalado en el suyo
     no dice nada del ordenador del trabajo. */

  const CLAVE = 'trainingfr.instalar';

  function estado() {
    try {
      const x = JSON.parse(localStorage.getItem(CLAVE) || '{}');
      return (x && typeof x === 'object') ? x : {};
    } catch (e) { return {}; }      /* modo privado, o almacenamiento lleno */
  }

  function guardar(x) {
    try { localStorage.setItem(CLAVE, JSON.stringify(x)); } catch (e) { /* da igual */ }
  }

  /* Cuánto se calla después de cada «ahora no». Creciente: la primera vez pudo
     ser que llegara en mal momento, la tercera es que no quiere. Un «no» no
     puede ser para siempre —la respuesta cambia cuando la app ya le sirve— pero
     tampoco puede volver mañana. */
  const ESPERA = [3, 21, 90];       /* días */
  const DIA = 86400000;

  function calladoHasta() {
    const e = estado();
    if (!e.descartes) return 0;
    const i = Math.min(e.descartes, ESPERA.length) - 1;
    return (e.cuando || 0) + ESPERA[i] * DIA;
  }

  function descartar() {
    const e = estado();
    e.descartes = (e.descartes || 0) + 1;
    e.cuando = Date.now();
    guardar(e);
    esconder();
    parar();
  }

  function apuntarInstalada() {
    const e = estado();
    e.instalada = true;
    e.cuando = Date.now();
    guardar(e);
  }

  /* ---------- el diálogo nativo ----------
     El evento llega una sola vez y hay que quedárselo: si no se guarda, la
     ocasión se pierde y ya no hay forma de lanzar el diálogo. Se escucha aquí
     y no en app.js para que haya un único dueño. */

  let guardadoPrompt = null;

  g.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();             /* sin esto Chrome saca su barrita él solo */
    guardadoPrompt = e;
    /* Puede llegar después de que la app haya decidido no enseñar nada; si
       toca enseñarlo, se enseña ahora. */
    quizaEnsenar();
  });

  g.addEventListener('appinstalled', function () {
    guardadoPrompt = null;
    apuntarInstalada();
    esconder();
    if (UI.toast) UI.toast(T('Ya la tienes instalada'));
  });

  /* ¿Hay un botón que instale de verdad, aquí y ahora? */
  function puede() { return !!guardadoPrompt; }

  /* Lanza el diálogo del sistema. Devuelve true si aceptó.
     Ojo: el prompt solo se puede usar UNA vez, así que si dice que no hay que
     soltarlo; Chrome vuelve a ofrecerlo más adelante por su cuenta. */
  function lanzar() {
    if (!guardadoPrompt) return Promise.resolve(false);
    const p = guardadoPrompt;
    guardadoPrompt = null;
    p.prompt();
    return p.userChoice.then(function (r) {
      const ok = r && r.outcome === 'accepted';
      if (ok) apuntarInstalada(); else descartar();
      return ok;
    }).catch(function () { return false; });
  }

  /* ---------- qué enseñar ----------
     Tres caminos distintos porque son tres situaciones distintas, no por
     adornar: en uno hay un botón, en otro hay que enseñar dónde mirar y en el
     tercero no se puede hacer nada sin salir de ahí. */

  function via() {
    /* Si hay diálogo nativo, se usa y no se mira nada más: es la única señal
       que no es una suposición, y así una deducción equivocada sobre el
       navegador nunca puede tapar un botón que funciona. */
    if (puede()) return 'nativa';
    if (dentroDeOtraApp()) return 'fuera';
    if (esIOS) return 'ios';
    return '';                      /* nada que ofrecer: ya está, o no aplica */
  }

  /* ---------- el aviso ---------- */

  let caja = null;

  /* Va dentro de .hud, que es la pila de cosas flotantes sobre la barra de
     pestañas: así se coloca encima del cronómetro en vez de taparlo, y se
     aparta solo cuando se abre el teclado, como el resto. */
  function host() {
    let h = document.getElementById('instalar-host');
    if (!h) {
      h = document.createElement('div');
      h.id = 'instalar-host';
      const hud = document.querySelector('.hud');
      if (hud) hud.insertBefore(h, hud.firstChild);
      else document.body.appendChild(h);
    }
    return h;
  }

  function esconder() {
    if (!caja) return;
    caja.classList.remove('vista');
    const quitar = function () { if (caja) { caja.remove(); caja = null; } };
    /* se espera a que termine de salir, salvo si la animación está apagada */
    if (g.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) quitar();
    else setTimeout(quitar, 220);
  }

  /* El icono de Compartir de iOS, dibujado tal cual está en la barra de Safari:
     es lo que la persona tiene que buscar con la vista, así que tiene que
     parecerse al de verdad y no a un icono de compartir cualquiera. */
  const ICO_IOS = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 3.2v12" stroke-linecap="round"/>' +
    '<path d="M8.4 6.6 12 3l3.6 3.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M7.4 10H6.2A1.7 1.7 0 0 0 4.5 11.7v7.1A1.7 1.7 0 0 0 6.2 20.5h11.6a1.7 1.7 0 0 0 1.7-1.7v-7.1A1.7 1.7 0 0 0 17.8 10h-1.2" stroke-linecap="round"/>' +
    '</svg>';

  function textos(v) {
    if (v === 'fuera') {
      return {
        titulo: T('Ábrela en el navegador'),
        sub: T('Desde dentro de otra app no se puede. Se abre fuera y ya está.'),
        accion: T('Cómo se hace')
      };
    }
    if (v === 'ios') {
      return {
        titulo: T('Instala Training FR'),
        sub: T('Dos toques y la tienes en la pantalla de inicio.'),
        accion: T('Ver cómo')
      };
    }
    return {
      titulo: T('Instala Training FR'),
      sub: T('Arranca a pantalla completa y funciona sin conexión.'),
      accion: T('Instalar')
    };
  }

  function ensenar(v) {
    if (caja) return;
    const t = textos(v);

    caja = document.createElement('div');
    caja.className = 'instalar-aviso';
    caja.setAttribute('role', 'region');
    caja.setAttribute('aria-label', T('Instalar la aplicación'));
    caja.innerHTML =
      '<img class="ia-icono" src="icons/icon-180.png" alt="" width="44" height="44">' +
      '<div class="ia-txt">' +
        '<b>' + esc(t.titulo) + '</b>' +
        '<span>' + esc(t.sub) + '</span>' +
      '</div>' +
      '<button class="btn sm primary ia-ok" data-ia="ok">' + esc(t.accion) + '</button>' +
      '<button class="btn icon sm ia-no" data-ia="no" aria-label="' +
        esc(T('Ahora no')) + '">' + UI.icon('close') + '</button>';

    host().appendChild(caja);
    /* un fotograma antes de la clase que lo sube, para que la transición corra */
    requestAnimationFrame(function () { caja.classList.add('vista'); });

    caja.querySelector('[data-ia=no]').onclick = descartar;
    caja.querySelector('[data-ia=ok]').onclick = function () {
      if (v === 'nativa') {
        lanzar().then(function (ok) { if (ok) esconder(); });
        return;
      }
      esconder();
      guia();                       /* iOS y navegador prestado: hoja con los pasos */
    };
  }

  /* ---------- la hoja con los pasos ----------
     Se abre también desde Ajustes, así que vive aparte del aviso: quien lo
     descartó una vez tiene que poder volver cuando quiera. */

  function pasoHTML(n, texto) {
    return '<li class="ia-paso">' +
      '<span class="ia-num">' + n + '</span>' +
      '<span class="grow">' + texto + '</span>' +
      '</li>';
  }

  /* El glifo va pegado a la palabra «Compartir», no al final de la frase: es lo
     que hay que reconocer en la barra, y colgando al final se iba él solo a la
     línea siguiente y parecía otra cosa. El {ico} viaja dentro de la frase para
     que en inglés pueda caer en otro sitio. */
  function pasoCompartir(n, frase) {
    const glifo = '<span class="ia-glifo">' + ICO_IOS + '</span>';
    return pasoHTML(n, esc(frase).replace('{ico}', glifo));
  }

  function guia() {
    const v = via();

    if (v === 'fuera') {
      UI.modal(
        '<h2>' + esc(T('Ábrela en el navegador')) + '</h2>' +
        '<p class="muted">' + esc(T('Estás dentro de otra aplicación, y desde aquí ningún navegador puede instalar nada. Es cosa del sistema, no de la app.')) + '</p>' +
        '<ol class="ia-pasos">' +
          pasoHTML(1, esc(T('Toca los tres puntos de esta ventana, arriba a la derecha.'))) +
          pasoHTML(2, esIOS
            ? esc(T('Elige «Abrir en Safari».'))
            : esc(T('Elige «Abrir en Chrome» o «Abrir en el navegador».'))) +
          pasoHTML(3, esc(T('Una vez fuera, vuelve aquí y te saldrá el botón de instalar.'))) +
        '</ol>' +
        '<button class="btn block" data-ia="copiar" style="margin-top:14px">' +
          esc(T('Copiar el enlace')) + '</button>',
        function (el) {
          el.querySelector('[data-ia=copiar]').onclick = function () {
            copiarEnlace();
          };
        });
      return;
    }

    /* iOS. Chrome en iOS tiene el mismo menú pero el icono está en otro sitio,
       así que se dice dónde en cada uno en vez de dar un paso genérico. */
    UI.modal(
      '<h2>' + esc(T('Añadirla a la pantalla de inicio')) + '</h2>' +
      '<p class="muted">' + esc(T('En el iPhone las apps que no vienen de la App Store se añaden así. Se hace una vez.')) + '</p>' +
      '<ol class="ia-pasos">' +
        pasoCompartir(1, esChromeIOS
          ? T('Toca el botón de Compartir {ico}, arriba a la derecha.')
          : T('Toca el botón de Compartir {ico}, en la barra de abajo.')) +
        pasoHTML(2, esc(T('Baja por la lista hasta «Añadir a pantalla de inicio».'))) +
        pasoHTML(3, esc(T('Dale a «Añadir». Ya está: sale con su icono, como una app más.'))) +
      '</ol>' +
      '<p class="tiny" style="margin:12px 0 0">' +
        esc(T('Desde ahí arranca a pantalla completa, sin la barra del navegador, y funciona sin conexión.')) +
      '</p>',
      null);
  }

  function copiarEnlace() {
    const url = location.href.split('#')[0];
    const ok = function () { if (UI.toast) UI.toast(T('Enlace copiado')); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(ok).catch(function () { aMano(url, ok); });
    } else aMano(url, ok);
  }

  /* Sin API de portapapeles —o sin permiso— queda el truco de siempre: un campo
     invisible, seleccionar y copiar. */
  function aMano(url, ok) {
    try {
      const c = document.createElement('textarea');
      c.value = url;
      c.setAttribute('readonly', '');
      c.style.cssText = 'position:fixed;top:-100px;opacity:0';
      document.body.appendChild(c);
      c.select();
      document.execCommand('copy');
      c.remove();
      ok();
    } catch (e) { if (UI.toast) UI.toast(T('No se pudo copiar')); }
  }

  /* ---------- cuándo aparece ----------
     No en el primer segundo. Un aviso de instalar antes de que la app haya
     hecho nada por ti se descarta por reflejo, y ese «no» cuenta: el diálogo
     nativo solo se puede lanzar una vez, y encima Chrome deja de ofrecerlo un
     tiempo. Así que se espera a que la persona haya llegado a alguna parte.

     Dos condiciones, la que llegue antes:
     - un rato de uso seguido en esta visita, o
     - que no sea la primera vez que abre la app. */

  const ESPERA_PRIMERA = 40000;     /* ms de uso antes de ofrecerlo en la 1.ª visita */
  const CLAVE_VISITAS = 'trainingfr.visitas';

  function visitas() {
    let n = 0;
    try { n = Number(localStorage.getItem(CLAVE_VISITAS)) || 0; } catch (e) { /* nada */ }
    return n;
  }

  function apuntarVisita() {
    try { localStorage.setItem(CLAVE_VISITAS, String(visitas() + 1)); } catch (e) { /* nada */ }
  }

  function toca() {
    if (caja) return false;                     /* ya está puesto */
    if (instalada()) return false;
    if (estado().instalada) return false;
    if (Date.now() < calladoHasta()) return false;
    /* Durante la bienvenida, no: son las dos primeras decisiones de la app y
       sin contestarlas no hay catálogo ni rutinas. Meterle encima una oferta
       de instalar es interrumpir justo lo único que hace falta para que la app
       sirva de algo.

       Se mira si hay barra de pestañas, que es la señal que ya usa la app para
       decir «esta pantalla se lo queda todo», y además es la condición que le
       importa a este aviso: sin barra, flotaría en mitad de la nada. Mirar el
       lugar guardado no bastaba, porque se elige en la primera de las dos. */
    const barra = document.getElementById('tabbar');
    if (!barra || barra.hidden) return false;
    if (!via()) return false;
    return true;
  }

  function quizaEnsenar() {
    if (!toca()) return;
    ensenar(via());
    parar();
  }

  /* Una sola cita no vale: cuando llega puede que siga en la bienvenida, o que
     Chrome no haya mandado todavía su evento. Se vuelve a mirar de tanto en
     tanto, y se deja de mirar a los cinco minutos: si a esas alturas no hay
     nada que ofrecer, es que no lo va a haber en esta visita. */
  let reloj = null;
  function parar() { if (reloj) { clearInterval(reloj); reloj = null; } }

  let arrancado = false;

  function arrancar() {
    if (arrancado) return;
    arrancado = true;
    apuntarVisita();

    if (instalada()) { apuntarInstalada(); return; }

    /* Segunda visita o más: ya conoce la app, se le puede ofrecer en cuanto
       haya algo que ofrecer. Un respiro corto para no pisar el arranque. */
    const espera = visitas() > 1 ? 6000 : ESPERA_PRIMERA;
    setTimeout(function () {
      quizaEnsenar();
      if (caja) return;
      reloj = setInterval(quizaEnsenar, 5000);
      setTimeout(parar, 300000);
    }, espera);
  }

  /* Si se instala mientras la app está abierta —o se abre ya instalada en otra
     ventana—, el aviso sobra. */
  if (g.matchMedia) {
    const mq = matchMedia('(display-mode: standalone)');
    const alCambiar = function (e) { if (e.matches) { apuntarInstalada(); esconder(); } };
    if (mq.addEventListener) mq.addEventListener('change', alCambiar);
    else if (mq.addListener) mq.addListener(alCambiar);
  }

  g.Instalar = {
    arrancar: arrancar,
    puede: puede,
    lanzar: lanzar,
    guia: guia,
    via: via,
    instalada: instalada,
    dentroDeOtraApp: dentroDeOtraApp,
    esIOS: esIOS,
    esAndroid: esAndroid
  };
})(window);
