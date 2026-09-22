/* app.js — router por hash y todas las vistas de la aplicación. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const viewEl = document.getElementById('view');
  const actionsEl = document.getElementById('topbar-actions');

  let route = { name: 'inicio', arg: null };
  /* qué pantalla hay pintada ahora mismo, para saber si un render es un
     cambio de pantalla o solo un repintado de la misma */
  let pantallaPintada = '';
  /* Lo que hay que tocar nada más llegar a la pantalla siguiente, si alguien
     pidió ir a un sitio a hacer algo concreto. */
  let pendiente = null;
  let exFilters = { q: '', group: '', muscle: '', equipment: '', level: '', tipo: '', favs: false, todo: false };
  let exLimit = 40;

  /* ================= router ================= */

  function parseHash() {
    const h = (location.hash || '#/inicio').replace(/^#\/?/, '');
    const parts = h.split('/');
    return { name: parts[0] || 'inicio', arg: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  function go(name, arg) {
    const h = '#/' + name + (arg ? '/' + encodeURIComponent(arg) : '');
    /* si ya estamos en esa ruta no hay hashchange, así que se repinta a mano */
    if (location.hash === h) render(); else location.hash = h;
  }

  /* Ir a una pantalla y pulsar algo al llegar. La ayuda lo usa para que
     «crear una rutina» no sea una instrucción sino el botón ya abierto; si el
     botón no existe —porque esa pantalla cambió—, se queda uno en la pantalla,
     que es un mal menor y no un error. */
  function irYHacer(name, arg, selector) {
    pendiente = selector ? { ruta: name, sel: selector } : null;
    go(name, arg);
  }

  function render() {
    UI.clearDemos();
    route = parseHash();

    const views = {
      inicio: viewInicio, ejercicios: viewEjercicios, ejercicio: viewEjercicio,
      rutinas: viewRutinas, rutina: viewRutina, entrenar: viewEntrenar,
      ajustes: viewAjustes, plan: viewPlan, version: viewVersion,
      bienvenida: viewBienvenida, cuenta: viewCuenta
    };
    Object.assign(views, g.VISTAS || {});

    /* Enlace de configuración traído desde otro dispositivo */
    if (route.name === 'enlazar' && route.arg) {
      const ok = Sync.aplicarEnlace(route.arg);
      history.replaceState(null, '', location.pathname + '#/ajustes');
      route = { name: ok ? 'ajustes' : 'inicio', arg: null };
      setTimeout(function () {
        UI.toast(ok ? T('Dispositivo enlazado. Entra con tu correo.')
          : T('Ese enlace de configuración no es válido.'));
      }, 400);
    }

    /* Lo primero de todo es saber dónde entrena: sin eso no se puede filtrar nada */
    if (!Store.settings().gear && route.name !== 'bienvenida' && route.name !== 'ver') {
      route = { name: 'bienvenida', arg: null };
    }
    const fn = views[route.name] || viewInicio;

    /* El idioma y el tema van juntos dentro de una cápsula, no sueltos: son
       dos ajustes que se tocan casi nunca y, cuando se tocan, se tocan a la
       vez. En una sola pieza pesan menos en la cabecera, donde lo que manda es
       el sitio donde entrena. */
    const parChips = '<div class="par-chips">' + idiomaChip() + temaChip() + '</div>';
    actionsEl.innerHTML = route.name === 'bienvenida'
      ? parChips
      : lugarChip() + parChips;

    /* Subir al principio solo al cambiar de pantalla. Repintar es lo que hace
       esta app cada vez que se toca algo —marcar una opción, escribir un
       número—, y subía arriba en cada toque: rellenar el perfil o los ajustes
       era perseguir la página hacia abajo después de cada elección. Si la
       pantalla es la misma, uno sigue donde estaba. */
    const donde = route.name + '/' + (route.arg || '');
    const mismaPantalla = donde === pantallaPintada;
    const alturaPrevia = window.scrollY;
    pantallaPintada = donde;

    viewEl.className = 'view vista-' + route.name;
    viewEl.innerHTML = fn();
    window.scrollTo(0, mismaPantalla ? alturaPrevia : 0);

    if (fn.mount) fn.mount(viewEl);

    /* Un enlace de la ayuda no puede quedarse en «vete a Rutinas»: la mitad de
       lo que hay que explicar es qué botón tocar al llegar. Así que se llega y
       se toca. Va después del mount —antes el botón todavía no tiene su
       manejador— y fuera del render, porque el clic vuelve a repintar y
       repintar dentro de un repintado deja la pantalla a medias. */
    if (pendiente && pendiente.ruta === route.name) {
      const que = pendiente.sel;
      pendiente = null;
      setTimeout(function () {
        const el = document.getElementById('view').querySelector(que);
        if (el) el.click();
      }, 0);
    }

    UI.mountDemos(viewEl);
    UI.cerrarDeslizadas();
    UI.deslizables(viewEl);
    pintarAvisos();
    /* el cronómetro y la música acompañan al usuario por toda la app */
    Workout.pintarBanner();
    if (g.Reproductor && Reproductor.barra) Reproductor.barra();

    const chip = actionsEl.querySelector('[data-a=lugar]');
    if (chip) chip.onclick = lugarSheet;

    const chipTema = actionsEl.querySelector('[data-a=tema]');
    if (chipTema) chipTema.onclick = function () {
      Store.setSetting('theme', temaEfectivo() === 'light' ? 'dark' : 'light');
      aplicarTema();
      render();
    };

    const chipIdioma = actionsEl.querySelector('[data-a=idioma]');
    if (chipIdioma) chipIdioma.onclick = function () {
      Idioma.poner(Idioma.actual() === 'es' ? 'en' : 'es');
      render();
    };

    const sinBarra = route.name === 'bienvenida' ||
      (route.name === 'ver' && !Store.settings().gear);
    document.querySelectorAll('.tabbar').forEach(function (t) { t.hidden = sinBarra; });
    /* Lo que flota va colocado esquivando la barra de pestañas. Cuando no
       está, esos 64 px lo dejan suelto en mitad de la pantalla —y en Safari,
       encima de su propia barra—, así que el CSS tiene que saberlo. */
    document.body.classList.toggle('sin-barra', sinBarra);

    document.querySelectorAll('.tab').forEach(function (t) {
      const target = t.dataset.nav;
      t.classList.toggle('on',
        target === route.name ||
        (target === 'rutinas' && (route.name === 'rutina' || route.name === 'entrenar')) ||
        (target === 'ejercicios' && route.name === 'ejercicio'));
    });
  }

  /* ================= dónde entrenas ================= */

  /* Cuenta cuántos ejercicios del catálogo puedes hacer en cada sitio */
  function cuantosEn(gear) {
    return Data.all().filter(function (ex) { return Data.gearAllows(gear, ex.equipment); }).length;
  }

  /* El botón de la cabecera. Era una pastilla gris con una mancuerna —la misma
     mancuerna estuviera donde estuviera— y el nombre largo del sitio, que en un
     móvil se comía media barra. Ahora lleva el icono y el color del sitio en el
     que estás, el nombre corto, y el mismo vidrio que el botón del tema, para
     que los dos de la esquina se lean como una pareja y no como dos cosas
     distintas que casualmente están juntas. */
  let lugarPintado = null;

  function lugarChip() {
    const k = Store.settings().gear;
    const gset = Data.GEAR[k];
    if (!gset) return '';
    const cara = CARAS_LUGAR[k] || { icono: 'dumbbell', tono: 'var(--acc)', corto: gset.label };

    /* El cambio de sitio es lo único que pasa aquí, y hasta ahora pasaba sin
       que se notara: la pastilla cambiaba de texto y ya. Cuando cambia —y solo
       cuando cambia— el icono da un salto y una luz recorre el vidrio. */
    const cambia = lugarPintado !== null && lugarPintado !== k;
    lugarPintado = k;

    return html`
      <button class="lugar-chip${raw(cambia ? ' cambia' : '')}" data-a="lugar"
              style="--tono:${raw(cara.tono)}"
              aria-label="${Tn('Entrenas {sitio}. Cambiar de sitio', { sitio: T(gset.label) })}">
        <span class="lc-ico">${raw(icon(cara.icono))}</span>
        <span class="lc-txt">${T(cara.corto || gset.label)}</span>
      </button>`;
  }

  /* Cada sitio con su cara. Los cinco eran la misma tarjeta gris con el mismo
     texto en tres líneas y una cifra suelta en verde: para elegir había que
     leerlas de arriba abajo y comparar cinco números de memoria. Y «disponibles»
     sin nada al lado no dice nada —¿muchos?, ¿pocos?—, porque lo que importa no
     es la cifra sino qué parte del catálogo te deja fuera.

     Así que cada sitio tiene su icono, su color y su silueta al fondo, y la
     cifra va sobre una barra que enseña de un vistazo cuánto abarca cada uno.
     Elegir pasa de leer a mirar. */
  const CARAS_LUGAR = {
    /* El texto se traduce al pintarlo, que es cuando ya se sabe el idioma. */
    gym: { icono: 'dumbbell', tono: 'var(--acc)', corto: 'Gimnasio' },
    dumbbell: { icono: 'casa', tono: '#4f8cf5', corto: 'Con mancuernas' },
    bands: { icono: 'banda', tono: '#c06bf0', corto: 'Con bandas' },
    home: { icono: 'perfil', tono: '#2fc4b2', corto: 'Sin material' },
    todo: { icono: 'catalogo', tono: '#f0a23c', corto: 'Todo' }
  };

  function tarjetaLugar(k, actual, total, enGym) {
    const gset = Data.GEAR[k];
    const cara = CARAS_LUGAR[k] || { icono: 'dumbbell', tono: 'var(--acc)' };
    const cuantos = cuantosEn(k);
    const parte = total ? Math.round(cuantos / total * 100) : 0;
    /* «Ver todo» y «En el gimnasio» dan el mismo número, y eso desconcierta con
       razón: parece que uno de los dos miente. No miente ninguno —el gimnasio
       permite los doce materiales que existen en el catálogo, así que quitar el
       filtro no puede añadir nada— pero repetir la cifra como si fuera
       información distinta es lo que confunde. Se dice. */
    const igualQueGym = k === 'todo' && cuantos === enGym;

    return html`
      <button class="lugar-caja${raw(actual === k ? ' on' : '')}" data-lugar="${k}"
              style="--tono:${raw(cara.tono)}">
        <span class="lg-silueta" aria-hidden="true">${raw(icon(cara.icono))}</span>
        <span class="lg-cab">
          <span class="lg-ico">${raw(icon(cara.icono))}</span>
          <span class="grow">
            <span class="lg-nom">${T(gset.label)}</span>
            <span class="lg-note">${T(gset.note)}</span>
          </span>
          <span class="lg-marca">${raw(icon('check'))}</span>
        </span>
        <span class="lg-barra"><i style="width:${parte}%"></i></span>
        <span class="lg-pie"><b>${UI.num(cuantos)}</b> ${T('ejercicios')}
          <span class="lg-pct">${Tn('{n}% del catálogo', { n: parte })}</span></span>
        ${raw(igualQueGym ? '<span class="lg-aviso">' + UI.esc(T('Los mismos que en el ' +
          'gimnasio: el catálogo no tiene nada que el gimnasio no permita.')) + '</span>' : '')}
      </button>`;
  }

  function tarjetasLugar(actual) {
    const total = cuantosEn('todo');
    const enGym = cuantosEn('gym');
    const sitios = Object.keys(Data.GEAR).filter(function (k) { return k !== 'todo'; });

    /* «Ver todo» no es un sitio donde se entrena: es quitar el filtro. Mezclado
       con los otros cuatro se elige por error, y separado con su rótulo se
       entiende de qué va sin tener que leerlo. */
    return sitios.map(function (k) { return tarjetaLugar(k, actual, total, enGym); }).join('') +
      '<div class="lg-o"><span>' + UI.esc(T('o mira el catálogo entero')) +
        '</span></div>' +
      tarjetaLugar('todo', actual, total, enGym);
  }

  /* La bienvenida son dos preguntas: dónde entrenas y cómo quieres usar la app */
  let pasoBienvenida = 1;

  function viewBienvenida() {
    const cabecera = html`
      <div style="padding:26px 0 6px" class="center">
        <img src="icons/logo.svg" alt="Training FR" width="94" height="119"
             style="margin:0 auto 12px">
        <div class="splash-name wordmark">TRAINING<sup>FR</sup></div>
      </div>`;

    if (pasoBienvenida === 2) {
      return html`
        ${raw(cabecera)}
        <h1 class="center">¿Cómo quieres empezar?</h1>
        <p class="muted">Puedes usar la app tal cual, sin dar ningún dato, o crear
        tu cuenta para tenerlo todo en cualquier dispositivo.</p>

        <div class="stack" style="margin-top:18px">
          <button class="rt-item modo-op" data-modo="cuenta" style="width:100%;text-align:left">
            <span class="row-icon">${raw(icon('nube'))}</span>
            <div class="grow">
              <div style="font-weight:700">Con mi cuenta</div>
              <div class="tiny">Correo y contraseña. Tus rutinas, tu historial y tus
                ajustes viajan contigo al móvil, al portátil y al que venga después.</div>
            </div>
            <span class="chevron">${raw(icon('chevron'))}</span>
          </button>

          <button class="rt-item modo-op" data-modo="invitado" style="width:100%;text-align:left">
            <span class="row-icon">${raw(icon('perfil'))}</span>
            <div class="grow">
              <div style="font-weight:700">Como invitado</div>
              <div class="tiny">Empiezas ya, sin dar ningún dato. Todo se guarda solo en
                este dispositivo y se pierde si borras los datos del navegador.</div>
            </div>
            <span class="chevron">${raw(icon('chevron'))}</span>
          </button>
        </div>

        <div class="card" style="margin-top:16px">
          <div class="row" style="gap:10px;align-items:flex-start">
            <span class="row-icon">${raw(icon('chispa'))}</span>
            <div class="grow">
              <b style="font-size:.9rem">Lo que funciona sin nada de esto</b>
              <p class="tiny" style="margin:5px 0 0">El catálogo de 876 ejercicios con su
              técnica, tus rutinas, el programa personal y el registro de entrenamientos
              van solos, sin cuenta y sin internet. La cuenta es para no perderlo; la clave
              de IA, para el entrenador, el menú de comidas y las listas de música.</p>
            </div>
          </div>
        </div>

        <button class="btn ghost block sm" data-a="atrasPaso" style="margin-top:14px">
          Volver a elegir dónde entreno</button>`;
    }

    return html`
      ${raw(cabecera)}
      <h1 class="center">¿Dónde vas a entrenar?</h1>
      <p class="muted">Con esto te muestro solo los ejercicios que puedes hacer de verdad,
      y las rutinas que te genere usarán únicamente ese material. Si vienes a mirar,
      elige <b>Ver todo</b> y tendrás el catálogo entero.</p>
      <div class="stack" style="margin-top:18px">${raw(tarjetasLugar(''))}</div>
      <p class="tiny" style="margin-top:16px">Podrás cambiarlo cuando quieras
      desde el botón de arriba o en Ajustes.</p>`;
  }

  viewBienvenida.mount = function (root) {
    bindAll(root, '[data-lugar]', function (el) {
      Store.setSetting('gear', el.dataset.lugar);
      planState.gear = el.dataset.lugar;
      exFilters = { q: '', group: '', muscle: '', equipment: '', level: '', tipo: '', favs: false, todo: false };
      pasoBienvenida = 2;
      /* el ajuste ya está guardado, así que la ruta de bienvenida deja de valer */
      route = { name: 'bienvenida', arg: null };
      viewEl.innerHTML = viewBienvenida();
      viewBienvenida.mount(viewEl);
      window.scrollTo(0, 0);
    });

    bind(root, '[data-a=atrasPaso]', function () {
      pasoBienvenida = 1;
      Store.setSetting('gear', '');
      render();
    });

    bindAll(root, '[data-modo]', function (el) {
      pasoBienvenida = 1;
      if (el.dataset.modo === 'cuenta') { go('cuenta'); return; }
      Modo.avisarInvitado(function () {
        go('inicio');
        UI.toast(T('Listo. Puedes crear la cuenta cuando quieras desde Perfil.'));
      });
    });
  };

  function lugarSheet() {
    UI.modal(html`
      <h2>${T('¿Dónde entrenas?')}</h2>
      <p class="muted">${T('Cambia el sitio y el catálogo se ajusta al momento.')}</p>
      <div class="stack" style="margin-top:14px">${raw(tarjetasLugar(Store.settings().gear))}</div>

      <!-- Qué se lleva por delante el cambio. Se toca una vez y afecta a tres
           pantallas, y hasta ahora eso no se decía en ninguna parte. -->
      <div class="lg-efecto">
        <span class="lg-e-ico">${raw(icon('filtro'))}</span>
        <span class="grow"><b>${T('Qué cambia al elegir')}</b>
          <span class="tiny">${T('El catálogo, el buscador de ejercicios y las rutinas ' +
          'que te genere la IA: solo te ofrecerán lo que puedas hacer ahí. Lo que ya ' +
          'tengas guardado no se toca.')}</span></span>
      </div>`,
      function (el) {
        el.querySelectorAll('[data-lugar]').forEach(function (b) {
          b.onclick = function () {
            Store.setSetting('gear', b.dataset.lugar);
            planState.gear = b.dataset.lugar;
            UI.closeModal();
            render();
            UI.toast(b.dataset.lugar === 'todo'
              ? T('Mostrando el catálogo completo')
              : Tn('Ahora entrenas {donde}', { donde: Data.gearFrase(b.dataset.lugar) }));
          };
        });
      });
  }

  /* ================= inicio ================= */

  /* La portada era un menú: cuatro atajos a pantallas que ya están en la barra de
     abajo y la lista de rutinas repetida. Ahora responde a lo que uno se
     pregunta al abrir la app por la mañana —qué toca hoy, cómo voy de semana,
     cómo voy de comida, qué llevo abandonado— y para navegar ya está la barra. */

  const MUSCULOS_CLAVE = ['chest', 'lats', 'middle back', 'shoulders', 'biceps', 'triceps',
    'quadriceps', 'hamstrings', 'glutes', 'abdominals', 'calves'];

  /* Cuándo se tocó por última vez cada músculo. Es la pregunta que nadie se
     acuerda de responder y la que explica los estancamientos: se entrena tres
     veces por semana y hay medio cuerpo sin tocar desde hace un mes. */
  function abandonados() {
    const ses = Store.sessions();
    if (ses.length < 4) return [];

    const ultima = {};
    const marcar = function (m, cuando) {
      if (!ultima[m] || cuando > ultima[m]) ultima[m] = cuando;
    };
    ses.forEach(function (s) {
      (s.entries || []).forEach(function (e) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        (ex.primaryMuscles || []).forEach(function (m) { marcar(m, s.start); });
      });
      /* Lo que se hizo fuera del gimnasio tambien cuenta: un partido de futbol
         trabaja la pierna, y sin esto seguia saliendo como abandonada. */
      (s.musculos || []).forEach(function (m) { marcar(m, s.start); });
    });

    const filas = MUSCULOS_CLAVE.map(function (m) {
      return {
        m: m,
        dias: ultima[m] ? Math.floor((Date.now() - ultima[m]) / 864e5) : null
      };
    }).filter(function (f) { return f.dias === null || f.dias >= 8; });

    filas.sort(function (a, b) {
      if (a.dias === null) return -1;
      if (b.dias === null) return 1;
      return b.dias - a.dias;
    });
    return filas.slice(0, 3);
  }

  /* Lo que dejó el fin de semana para la sesión de hoy.

     Un partido no da series, así que no sale en el reparto; pero deja la pierna
     cargada, y eso sí decide cómo entrenas hoy. Es lo único que de verdad
     cambia, y por eso se dice aquí —en el sitio donde se decide entrenar— y no
     en una pantalla de estadísticas. */
  function cargaPreviaHTML(rutinasDeHoy) {
    cargaDeHoy = null;
    if (!g.Progresion || !Progresion.cargaPrevia) return '';
    const c = Progresion.cargaPrevia(rutinasDeHoy);
    if (!c) return '';

    const zonas = c.zonas.map(function (id) {
      const gr = I18N.GROUPS.filter(function (x) { return x.id === id; })[0];
      return gr ? T(gr.label).toLowerCase() : id;
    });

    /* Se guarda lo que ya se ha pintado para que el añadido de la IA, que llega
       después del render, hable de lo mismo y con las mismas palabras. El nombre
       va antes que la zona: «hoy le toca pecho, que trabaja pecho» no le dice
       nada a quien tiene que estimar, y «Fabian PPL · pecho» sí dice qué clase
       de sesión es. */
    const suya = rutinasDeHoy.length === 1 ? String(rutinasDeHoy[0].name || '').trim() : '';
    cargaDeHoy = { carga: c, zonas: listaDias(zonas),
      sesion: suya || queEsHoy(rutinasDeHoy) };

    /* Un renglón de entrada en negrita y el resto debajo. Era un párrafo de
       cuatro líneas de letra pequeña pegado al botón grande, y lo más denso de
       la pantalla estaba justo donde hay que decidir si entrenar.

       La entrada va en segunda persona —«ayer cargaste pierna»— para no tener
       que concordar en género con la zona: «cargado» vale para pecho, «cargada»
       para pierna y «cargados» para pierna y core, y eso no se puede armar con
       una sola frase. */
    /* Sin raw(): esto es una cadena que se concatena, no una plantilla, y ahí
       raw() devuelve un objeto que se pinta como [object Object]. */
    return '<p class="aviso-carga tiny">' +
      icon('chispa') +
      '<span class="grow"><b class="carga-tit">' +
      esc(Tn('{cuando} cargaste {zonas}',
        { cuando: c.ayer ? T('Ayer') : T('Hoy'), zonas: listaDias(zonas) })) + '</b>' +
      /* Todo lo que no es el titular va dentro del cuerpo, y el cuerpo nace
         plegado a un renglón. Eran cinco líneas de letra pequeña justo donde hay
         que decidir si entrenar: el titular ya dice lo único que hay que saber
         de un vistazo, y el resto es para quien lo quiera. */
      '<span class="carga-cuerpo recortada" id="carga-cuerpo">' +
      esc(Tn('{min} min de actividad. Si lo notas pesado, baja una serie por ' +
        'ejercicio o quita algo de peso: rendir menos hoy es normal.',
        { min: c.minutos })) +
      /* Hueco vacío: el aviso de regla sale ya, y la estimación se cuela aquí
         cuando conteste la IA. Si no hay entrenador puesto o falla, no se nota
         nada, que es como tiene que ser algo opcional. */
      '<span class="carga-ia" id="carga-ia"></span>' +
      '</span>' +
      '<button type="button" class="carga-mas" id="carga-mas">' +
      esc(T('Ver más')) + '</button>' +
      '</span></p>';
  }

  /* Lo último que se pintó del aviso de carga: {carga, zonas, sesion} o null. */
  let cargaDeHoy = null;

  /* Mientras se espera respuesta no se vuelve a preguntar: la portada se pinta
     dos veces seguidas al arrancar —la frase del entrenador llega y obliga a
     otro render— y sin esto salían dos llamadas, que en su clave son dos veces
     lo que cuesta. La caché no lo evita porque aún no ha contestado nadie. */
  let pidiendoCargaIA = false;

  function pintarCargaIA(root) {
    const hueco = root.querySelector('#carga-ia');
    if (!hueco || !cargaDeHoy || pidiendoCargaIA) return;
    if (!g.IA || !IA.activa || !IA.activa() || !IA.estimarCarga) return;

    const lo = cargaDeHoy;
    pidiendoCargaIA = true;
    IA.estimarCarga(lo.carga, lo.sesion).then(function (r) {
      const partes = [];
      /* Cero series es una respuesta válida —un paseo largo no carga una sesión
         de pecho— y entonces solo vale lo que diga la frase. */
      if (r.series) {
        partes.push(Tn('La IA lo estima en unas {n} series de {zonas} ya hechas.',
          { n: r.series, zonas: lo.zonas }));
      }
      if (r.nota) partes.push(r.nota);
      if (!partes.length) return;
      /* textContent y no innerHTML: esto viene de fuera y no se pinta como
         código por mucho que lo parezca. */
      /* textContent y no innerHTML: esto viene de fuera y no se pinta como
         código por mucho que lo parezca. Se añade dentro del cuerpo, que ya está
         plegado, así que la respuesta no alarga la portada al llegar. */
      hueco.textContent = ' ' + partes.join(' ');
    }).catch(function () { /* sin clave, sin red o sin cuota: el aviso vale solo */ })
      .then(function () { pidiendoCargaIA = false; });
  }

  /* ---------- el día que no toca nada ----------
     Estaba dicho dos veces: un botón verde «Iniciar entrenamiento» arriba y esta
     tarjeta media pantalla más abajo, resolviendo la misma situación. Y peor
     que repetirse: el botón empujaba a entrenar en verde —el color que en esta
     portada significa «esto es a lo que vienes»— el mismo día que el plan dice
     descansar, y el descanso también es parte del plan.

     Ahora la tarjeta ocupa el sitio del botón y el botón se va. Entrenar por su
     cuenta sigue estando, como enlace debajo, igual que el día que sí hay
     rutina: quien quiera entrenar en su día libre lo tiene a un toque, pero no
     se lo pide la app. */
  /* La siguiente rutina que toca, empezando por mañana. Sirve para ponerle
     cara al día libre: la tarjeta decía «no toca nada» sobre un fondo vacío, y
     un día de descanso también es parte del plan, no un hueco. */
  function proximaRutina(rutinas) {
    if (!rutinas || !rutinas.length) return null;
    const orden = UI.DAY_NAMES ? DIAS : [];
    const hoy = UI.DAY_NAMES ? UI.DAY_NAMES[new Date().getDay()] : '';
    const desde = orden.indexOf(hoy);
    for (let i = 1; i <= 7 && desde !== -1; i++) {
      const d = orden[(desde + i) % 7];
      const r = rutinas.filter(function (x) {
        return (x.days || []).indexOf(d) !== -1;
      })[0];
      if (r) return r;
    }
    return rutinas[0];
  }

  function diaLibreHTML(rutinas) {
    const foto = fotoDeRutina(proximaRutina(rutinas));
    return html`
      <div class="card tarjeta-premium tarjeta-libre portada-hueco${
        raw(foto ? ' con-foto' : '')}">
        ${raw(foto ? '<img class="dc-foto" src="' + esc(foto) +
          '" alt="" loading="lazy" aria-hidden="true">' : '')}
        <div class="hoy-encima">${T('Hoy')} · ${rutinas.length
          ? T('Día libre') : T('Empieza aquí')}</div>
        <div class="hoy-tit">${rutinas.length
          ? T('No toca nada en tu plan')
          : T('Todavía no tienes rutinas')}</div>
        <p class="hoy-meta">${rutinas.length
          ? T('Si has hecho algo por tu cuenta, apúntalo. Y si te apetece entrenar, elige una rutina.')
          : T('Copia una plantilla probada y edítala a tu gusto, o móntate el programa con tus datos.')}</p>
        <div class="row" style="margin-top:12px">
          ${raw(rutinas.length
            /* Los dos neutros: el verde de este día se lo lleva «Empezar algo
               ahora», que es lo más probable en un día sin plan. */
            ? '<button class="btn grow sm" data-a="apuntar">' + esc(T('Apuntar algo')) + '</button>' +
              '<button class="btn grow sm" data-a="plantillas">' + esc(T('Elegir rutina')) + '</button>'
            : '<button class="btn grow sm" data-a="plantillas">' + esc(T('Ver plantillas')) + '</button>' +
              '<button class="btn primary grow sm" data-a="programa">' + esc(T('Crear mi programa')) + '</button>')}
        </div>
      </div>`;
  }

  /* La semana de un vistazo: qué días había plan y cuáles se han cumplido. */
  function semanaHTML() {
    const orden = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const ahora = new Date();
    const desdeLunes = (ahora.getDay() + 6) % 7;
    const lunes = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - desdeLunes);

    const hechos = {};
    Store.sessions().forEach(function (x) { hechos[Store.dayKey(x.start)] = true; });
    const rutinas = Store.routines();

    let previstos = 0;
    let cumplidos = 0;
    let sueltos = 0;

    const celdas = orden.map(function (d, i) {
      const fecha = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i);
      const hecho = !!hechos[Store.dayKey(fecha.getTime())];
      const plan = rutinas.some(function (r) { return (r.days || []).indexOf(d) !== -1; });
      const esHoy = i === desdeLunes;
      const pasado = i < desdeLunes;

      if (plan) previstos++;
      if (plan && hecho) cumplidos++;
      if (!plan && hecho) sueltos++;

      const clases = ['sem-dia'];
      if (hecho) clases.push('hecho');
      else if (plan && (pasado || esHoy)) clases.push(pasado ? 'fallado' : 'toca');
      else if (plan) clases.push('plan');
      if (esHoy) clases.push('es-hoy');

      /* La inicial sola no dice qué día es: para saber si el hueco vacío del
         miércoles es el de esta semana o el de la que viene hay que contar con
         el dedo. Con el número debajo se lee de un vistazo, y el de hoy se
         dice con todas las letras. */
      /* La inicial sale de UI, que la da en el idioma puesto: la «M» de
         miércoles no vale para Wednesday. Se corta a una letra, que es lo que
         cabe en el cuadro. */
      return '<div class="' + clases.join(' ') + '">' +
        '<span>' + (esHoy ? T('Hoy') : UI.inicialDia(fecha.getDay()).charAt(0)) + '</span>' +
        '<b>' + fecha.getDate() + '</b><i></i></div>';
    }).join('');

    const frase = previstos
      ? Tn('{c} de {p} días del plan', { c: cumplidos, p: previstos }) +
        (sueltos ? ' ' + T('y') + ' ' +
          Tp(sueltos, '{n} suelto', '{n} sueltos') : '')
      : Tn('{n} días entrenados', { n: cumplidos + sueltos });

    /* La tira de los siete días de atrás, si hay perfil con el que calcular las
       metas. Las casillas de esta semana miran hacia delante, así que un lunes
       están vacías enteras y no cuentan nada; la tira siempre tiene algo que
       decir, y además dice tres cosas por día en vez de una.

       Es la misma que la de «mi día», sacada de allí: dos copias de esto se
       habrían separado en cuanto una de las dos cambiara. */
    const tira = (g.VISTAS && VISTAS.dia && VISTAS.dia.tiraPlan)
      ? VISTAS.dia.tiraPlan() : null;

    return html`
      <div class="muelle"></div>
      <div class="card inicio-compacta semana-caja portada-titulo tarjeta-premium"
           data-a="verprogreso" role="button" tabindex="0">
        <div class="row between" style="margin-bottom:6px">
          <!-- «Tu semana» con treinta días dentro era mentira. «Constancia» es
               además la palabra que ya usa Progreso para esto mismo. -->
          <span class="pre-encima">${tira ? T('Tu constancia') : T('Tu semana')}</span>
          <span class="tiny nowrap">${tira
            ? Tn('{n} de {total} días entrenados',
                 { n: tira.entrenados, total: tira.total })
            : frase}</span>
        </div>
        ${raw(tira ? tira.html : '<div class="semana">' + celdas + '</div>')}
      </div>`;
  }

  /* Lo que llevas comido hoy contra lo que te toca. En la portada porque es un
     dato de hoy y de ahora, no de una pantalla a la que se entra a propósito. */
  function comidaHoyHTML() {
    if (!g.Comidas) return '';
    const p = Perfil.datos();
    if (!Perfil.completo(p)) return '';
    const m = Perfil.macros(p);
    if (!m) return '';

    const h = Comidas.hoy();
    const pk = Math.min(100, Math.round(h.kcal / m.kcal * 100));
    const pp = Math.min(100, Math.round(h.prot / m.prot * 100));
    const faltaProt = Math.max(0, m.prot - h.prot);

    return html`
      <div class="muelle"></div>
      <!-- El rótulo va dentro y no encima: fuera costaba su renglón más el
           hueco, y la portada se mide en renglones. Es el mismo sitio donde lo
           lleva el resumen de la semana. -->
      <div class="card inicio-compacta comida-caja tarjeta-premium">
        <div class="pre-encima comida-tit">${T('Lo que llevas comido')}</div>
        <!-- Dos aros con su cifra al lado. Eran dos barras con el número encima,
             y una barra de progreso hay que medirla con la vista para saber por
             dónde va; un aro se lee de reojo. Al lado y no debajo porque en la
             portada lo que sobra es alto, no ancho. -->
        <div class="comida-aros">
          ${raw(aroComidaHTML(pk, 'llama', T('Calorías'),
            UI.num(h.kcal), UI.num(m.kcal), ''))}
          ${raw(aroComidaHTML(pp, 'proteina', T('Proteína'),
            String(h.prot), String(m.prot), 'g'))}
        </div>
        <p class="tiny comida-nota">${h.kcal === 0
          ? T('Hoy no has apuntado nada. Una foto del plato basta.')
          : faltaProt > 0
            ? Tn('Te faltan {n} g de proteína', { n: faltaProt })
            : T('Proteína del día cubierta.')}</p>

        <div class="row" style="margin-top:8px">
          <label class="btn primary grow sm" for="foto-inicio" style="cursor:pointer">
            ${raw(icon('camara'))} ${T('Foto')}</label>
          <button class="btn grow sm" data-a="comidamano">${raw(icon('plus'))} ${T('A mano')}</button>
        </div>

        <input type="file" id="foto-inicio" accept="image/*" hidden>

        ${raw(menuHoyHTML())}
      </div>

      <div id="comida-pensando" class="si-vacio-fuera"></div>`;
  }

  /* El menu de hoy, plegado.
     Lo que toca comer es tan de hoy como la rutina, y estaba dos pantallas
     adentro: se generaba el plan de la semana y luego no se miraba. Va plegado
     y con lo minimo en la linea —la siguiente comida— porque la portada es un
     tablero, no un documento: la semana entera sigue en Alimentacion, que es
     donde se lee de arriba abajo.

     Si no hay menu hecho, aqui no sale nada: una seccion vacia invitando a
     generar algo es justo lo que sobra en una portada. */
  function menuHoyHTML() {
    /* Con su sitio dentro del menú, que es lo que hace falta para poder
       marcarlo desde aquí y no solo leerlo. */
    const sitio = g.Menus && Menus.hoyConRef ? Menus.hoyConRef() : null;
    const menu = sitio ? sitio.dia
      : (g.VISTAS && VISTAS.menuDeHoy ? VISTAS.menuDeHoy() : null);
    const comidas = (menu && menu.comidas) || [];
    if (!comidas.length) return '';

    /* Cual toca ahora: la primera cuya hora no haya pasado. Sin horas, la
       primera de la lista. */
    const ahora = new Date().getHours() * 60 + new Date().getMinutes();
    const minutosDe = function (c) {
      const m = String(c.hora || '').match(/(\d{1,2})[:h.](\d{2})?/);
      return m ? Number(m[1]) * 60 + Number(m[2] || 0) : -1;
    };
    let toca = comidas.filter(function (c) { return minutosDe(c) >= ahora; })[0] || null;
    if (!toca && comidas.every(function (c) { return minutosDe(c) === -1; })) toca = comidas[0];

    const kcal = comidas.reduce(function (n, c) { return n + (Number(c.kcal) || 0); }, 0);

    return html`
      <details class="menu-hoy plegable-fino" data-sec="menu"${raw(seccionesAbiertas.menu ? ' open' : '')}>
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="grow">${T('Menú de hoy')}</span>
          <span class="tiny nowrap">${toca
            ? Tn('Ahora: {que}', { que: T(toca.nombre) || T('comer') })
            : Tn('{n} kcal', { n: UI.num(kcal) })}</span>
        </summary>
        <div class="fino-cuerpo">
          ${raw(comidas.map(function (c, j) {
            const esAhora = c === toca;
            const r = sitio && g.Marcar ? Marcar.ref(sitio.menu.id, sitio.i, j) : '';
            const hecha = r && g.Comidas && Comidas.seLleva() ? Comidas.marcada(r) : null;

            return '<div class="menu-fila' + (esAhora ? ' ahora' : '') +
              (hecha ? ' es-hecha' : '') + '">' +
              '<div class="row between" style="gap:10px">' +
              '<b style="font-size:.86rem">' + esc(T(c.nombre) || T('Comida')) +
              (c.hora ? ' <span class="tiny">' + esc(c.hora) + '</span>' : '') + '</b>' +
              '<span class="tiny nowrap">' +
              esc(Tn('{kcal} kcal · {prot} g',
                { kcal: UI.num(c.kcal || 0), prot: c.prot || 0 })) + '</span></div>' +
              '<p style="margin:2px 0 0;font-size:.85rem">' + esc(T(c.plato || '')) + '</p>' +
              /* Y aquí mismo se marca. Tenerlo delante y tener que bajar a
                 Alimentación para decir que te lo comiste no tiene sentido. */
              (r ? Marcar.comidaHTML(r, c, true) : '') +
              '</div>';
          }).join(''))}
          <button class="btn sm block" data-a="irnutricion" style="margin-top:9px">
            ${T('Ver la semana entera')}</button>
        </div>
      </details>`;
  }

  /* Cómo llamar en un botón a lo que toca hoy: la zona que más se trabaja,
     que es como uno lo tiene en la cabeza («hoy toca pecho»). */
  function queEsHoy(deHoy) {
    if (deHoy.length !== 1) return T('lo de hoy');
    const r = deHoy[0];
    if (r.mixta) return T('lo de hoy');
    const zona = zonaDeRutina(r);
    return zona ? T(zona.label).toLowerCase() : T('lo de hoy');
  }

  /* Lo que ya se ha entrenado hoy. La portada empuja a entrenar, y empujar a
     alguien a hacer lo que acaba de hacer es lo que convierte un botón grande
     en ruido: cuando ya está hecho, lo que hace falta es decirlo. */
  function loDeHoy() {
    const clave = Store.dayKey(Date.now());
    const ses = Store.sessions().filter(function (x) {
      return Store.dayKey(x.start) === clave;
    });
    if (!ses.length) return null;

    /* setsDone y volume los apunta la propia sesión al cerrarse: es lo mismo
       que cuentan las cifras de la portada y el historial, así que aquí no se
       vuelve a calcular por otro camino. */
    /* setsDone y volume los apunta la propia sesión al cerrarse: es lo mismo
       que cuentan las cifras de la portada y el historial. */
    let series = 0;
    let volumen = 0;
    let minutos = 0;
    const nombres = [];
    const musculos = [];
    /* La rutina de lo que hizo, para ponerle cara a la tarjeta. La primera que
       siga existiendo: si entrenó dos veces manda la de arriba, y si lo
       apuntó a mano no hay ninguna y la tarjeta se queda sin foto. */
    let rutina = null;

    /* Qué tocaste, sacado de los ejercicios que apuntaste, no de la rutina:
       si te saltaste la mitad, la rutina seguiría diciendo que hiciste pecho y
       hombros cuando solo hiciste pecho. Lo que cuenta es lo que hiciste. */
    const apunta = function (m) {
      /* El catálogo los devuelve con mayúscula porque ahí encabezan su fila.
         Dentro de una frase —«hiciste cuádriceps y glúteos»— no son nombres
         propios y la mayúscula chirría. */
      let n = g.I18N ? I18N.muscle(m) : m;
      n = String(n || '');
      if (n) n = n.charAt(0).toLowerCase() + n.slice(1);
      if (n && musculos.indexOf(n) === -1) musculos.push(n);
    };

    ses.forEach(function (x) {
      series += x.setsDone || 0;
      volumen += x.volume || 0;
      minutos += Math.round(((x.end || x.start) - x.start) / 60000);
      /* Sin el día de delante: el rótulo de la tarjeta ya dice «hoy, martes» y
         escribirlo otra vez dos renglones más abajo no añade nada. */
      const n = sinDia(Store.nombreDeSesion(x));
      if (n && nombres.indexOf(n) === -1) nombres.push(n);
      if (!rutina && x.routineId) rutina = Store.routine(x.routineId);

      (x.entries || []).forEach(function (e) {
        const ex = Data.get(e.exId);
        ((ex && ex.primaryMuscles) || []).forEach(apunta);
      });
      /* Lo apuntado a mano —un partido, una carrera— no trae ejercicios pero
         sí dice qué movió. */
      (x.musculos || []).forEach(apunta);
    });

    return { n: ses.length, series: series, volumen: volumen,
      minutos: minutos, nombres: nombres, musculos: musculos, rutina: rutina };
  }

  /* De qué plan es y cuánto es, en una línea. Es lo que decía el cajón de
     «Hoy, lunes» y lo que ahora va dentro del botón. */
  /* Un aro de comida: el aro a la izquierda y, a su derecha, el rótulo con la
     cifra y su objetivo. Mismo aro de 270 grados que el resumen de la semana,
     más pequeño, para que la portada hable con una sola voz. */
  function aroComidaHTML(pct, ico, etiqueta, hecho, meta, unidad) {
    /* Anillo cerrado, no el cuentakilómetros de 270 grados de antes. Un círculo
       entero es la forma que usa iOS para esto —cuánto llevas de la meta de
       hoy— y aquí el problema es el mismo, así que el parecido no es copia.

       Lo que se perdía al cerrarlo era saber por dónde empieza y por dónde
       acaba; eso lo devuelve el remate redondo del extremo, que hace de cabeza
       y marca el avance.

       El radio y el trazo van juntos: lo que se mira de un anillo es el ancho
       de la banda contra el hueco, no el trazo a solas. 18,75 y 3,5 dejan el
       anillo del mismo tamaño de fuera —41 sobre un lienzo de 46— con la banda
       reducida a un hilo. Si se toca uno hay que tocar el otro, o el anillo se
       sale del lienzo o se encoge sin querer; el trazo está en el css, en
       `.aro-fondo` y `.aro-arco`. */
    const R = 18.75;
    const C = 2 * Math.PI * R;
    const arco = C;
    const lleno = arco * Math.max(0, Math.min(1, pct / 100));
    const prot = ico === 'proteina';
    /* Nace vacío y crece al pintarse, igual que los del resumen: el montaje les
       pone el valor un fotograma después y la transición hace el resto.

       Y sin icono al lado del rótulo: el aro ya es el símbolo, y una llama
       diminuta encima de «CALORÍAS» no añade nada que la palabra no diga. */
    /* El arco no es de un color plano: va de un extremo al otro del mismo
       tono —verde a ámbar las calorías, cian a azul la proteína— y así el trozo
       encendido tiene principio y final, que es lo que hace que se lea como un
       medidor y no como un adorno.

       El degradado se define aquí dentro y no en el CSS porque un `url(#id)`
       escrito en una hoja de estilos externa lo resuelve mal Safari, que lo
       busca al lado del css y no en la página. Por eso también el `stroke` va
       en `style` y no en una regla: desde el atributo, el `#` es el de esta
       página y funciona en todas partes. */
    const rampa = prot ? 'g-prot' : 'g-kcal';
    /* El degradado se queda dentro de su tono: antes las calorías acababan en
       ámbar, y con el carril ahora verde el anillo lleno habría quedado ámbar
       sobre verde. Verde a verde claro dice lo mismo sin cambiar de color. */
    const deA = prot
      ? ['var(--brand-1)', 'var(--agua)']
      : ['var(--acc)', 'color-mix(in srgb, var(--acc) 55%, var(--warn))'];
    return '<div class="ca-caja">' +
      '<svg class="aro ca-aro' + (prot ? ' prot' : '') + '" viewBox="0 0 46 46" aria-hidden="true">' +
        '<defs><linearGradient id="' + rampa + '" x1="0" y1="1" x2="1" y2="0">' +
          '<stop offset="0" style="stop-color:' + deA[0] + '"/>' +
          '<stop offset="1" style="stop-color:' + deA[1] + '"/>' +
        '</linearGradient></defs>' +
        '<circle class="aro-fondo" cx="23" cy="23" r="' + R + '" ' +
          'stroke-dasharray="' + arco + ' ' + C + '"/>' +
        '<circle class="aro-arco" cx="23" cy="23" r="' + R + '" ' +
          'style="stroke:url(#' + rampa + ')" ' +
          'stroke-dasharray="0 ' + C + '" data-arco="' + lleno + ' ' + C + '"/>' +
      '</svg>' +
      '<span class="grow">' +
        '<span class="pre-encima' + (prot ? ' prot' : '') + '">' +
          esc(etiqueta) + '</span>' +
        '<span class="ca-cifra"><b' + (prot ? ' style="color:var(--brand-1)"' : '') +
          '>' + esc(hecho) + '</b>' +
        '<span class="tiny"> / ' + esc(meta) + (unidad ? ' ' + esc(unidad) : '') +
        '</span></span>' +
      '</span></div>';
  }

  /* ---------- el resumen de la semana ----------
     Eran tres cifras en tres cajas, y una cifra sola no dice si vas bien: «72
     series» puede ser una semana redonda o media, según lo que pida tu plan.
     Con el aro se ve de un vistazo cuánto llevas de lo que hay que hacer.

     Cada aro tiene un contra qué de verdad, no un número redondo inventado:
     los entrenos van contra los días que tu plan pide a la semana y las series
     contra las que suman esas rutinas. Sin plan con días no hay contra qué
     medir, así que el aro se llena con lo que llevas y no finge una meta. */
  function metasSemana() {
    const rutinas = Store.routines().filter(function (r) {
      return (r.days || []).length;
    });
    let dias = 0;
    let series = 0;
    rutinas.forEach(function (r) {
      const cuantos = (r.days || []).length;
      dias += cuantos;
      series += cuantos * (r.exercises || []).reduce(function (n, e) {
        return n + (Number(e.sets) || 0);
      }, 0);
    });
    return { dias: dias, series: series };
  }

  /* Un dato de la semana: la cifra y su palabra en un renglón, y debajo un
     hilo con lo que llevas de lo que toca.

     Antes eran tres aros de 58 píxeles con su icono dentro. Se veían bien, pero
     costaban el alto de una tarjeta entera para tres cifras que se miran de
     reojo al entrar y no se tocan nunca; y en una portada que no debe rodar,
     el alto se paga con lo de más abajo. El hilo dice lo mismo que decía el
     aro —cuánto de cuánto— en tres píxeles.

     El hilo nace a cero y el montaje le pone el ancho un fotograma después:
     con la transición del CSS crece solo. Puesto ya en el HTML no habría de
     dónde animar. */
  function rsDato(pct, ico, cifra, etiqueta, tono) {
    const parte = Math.round(Math.max(0, Math.min(1, pct)) * 100);
    return '<div class="rs-dato" style="--tono:' + tono + '">' +
      '<span class="rs-cifra">' +
        /* «kg» y los miles hacen cifras de ocho caracteres: se encogen antes
           que empujar su palabra fuera de la columna. */
        '<b class="rs-num' + (String(cifra).length > 4 ? ' largo' : '') + '">' +
        esc(cifra) + '</b>' +
        /* El icono delante de la palabra y del color del dato: una tira de tres
           cifras se recorre por la forma antes que por la letra, y «racha» y
           «series» a este tamaño son dos manchas grises iguales. */
        '<span class="rs-et"><i class="rs-ico">' + icon(ico) + '</i>' +
          '<span class="rs-pal">' + esc(etiqueta) + '</span></span>' +
      '</span>' +
      '<span class="rs-linea"><i class="rs-llena" data-llena="' +
        parte + '%"></i></span>' +
      '</div>';
  }

  function resumenSemanaHTML(st) {
    const meta = metasSemana();
    const porVolumen = Store.settings().registro === 'detallado' && st.totalVolume > 0;
    const parte = function (hecho, pide) {
      return pide > 0 ? hecho / pide : (hecho > 0 ? 1 : 0);
    };

    /* El rótulo va a la izquierda y no encima: encima costaba su renglón
       entero, y ahí al lado cabe en el alto que ya ocupan los datos. Dice
       «esta semana» porque sin eso «series» se lee como el total de la vida.

       Las palabras son cortas a propósito —racha, entrenos, series—: en tres
       columnas de ochenta y pico píxeles, «Entrenamientos» se corta. */
    return '<div class="card tarjeta-premium portada-hueco resumen-sem">' +
      '<span class="rs-rotulo">' + esc(T('Esta semana')) + '</span>' +
      '<div class="rs-tira">' +
        /* La racha se mide contra siete: es lo que dura una semana, y es la
           única meta honesta para algo que no depende del plan. */
        /* Un color por dato. Tres verdes iguales se leen como un solo bloque y
           hay que leer las palabras para saber cuál es cuál; con la racha en
           ámbar, el entreno en verde y las series en azul, cada cifra tiene la
           cara de lo que cuenta. Son los tres colores que la app ya usa. */
        rsDato(parte(st.streak, 7), 'llama', UI.num(st.streak),
          T('Racha'), 'var(--warn)') +
        rsDato(parte(st.week, meta.dias), 'dumbbell', UI.num(st.week),
          T('Entrenos'), 'var(--acc)') +
        rsDato(parte(porVolumen ? st.weekVolume : st.weekSets,
          porVolumen ? 0 : meta.series), 'grafica',
          porVolumen ? UI.kg(st.weekVolume) : UI.num(st.weekSets),
          porVolumen ? T('Volumen') : T('Series'), 'var(--brand-1)') +
      '</div></div>';
  }

  /* ---------- la cara de lo que toca hoy ----------
     Una tarjeta que solo dice «Entrenar» se lee en medio segundo y se olvida en
     otro medio. Con una foto se reconoce el día antes de leer nada.

     Estas están elegidas mirando las 777 fotos del catálogo una por una, no por
     descarte. El criterio es uno: que se vea a una persona haciendo el
     ejercicio, de cuerpo entero y con luz. Sirve de poco un primer plano de un
     antebrazo o un gimnasio a oscuras con alguien al fondo.

     Varias por zona y se turnan por día: la misma foto todos los lunes deja de
     verse a la semana de ponerla. Rota con el día del año, así que cambia cada
     día pero no cambia mientras estás mirando la pantalla.

     Se guardan por identificador del catálogo y no por URL: si un día cambia de
     sitio la imagen, sigue saliendo. */
  const CARAS = {
    pecho: ['Pushups', 'Barbell_Bench_Press_-_Medium_Grip',
      'Barbell_Incline_Bench_Press_-_Medium_Grip', 'Around_The_Worlds',
      'Front_Raise_And_Pullover', 'Push_Up_to_Side_Plank'],
    espalda: ['Chin-Up', 'Wide-Grip_Rear_Pull-Up', 'One-Arm_Dumbbell_Row',
      'Stiff_Leg_Barbell_Good_Morning', 'V-Bar_Pullup'],
    pierna: ['Barbell_Squat', 'Barbell_Step_Ups', 'Dumbbell_Rear_Lunge',
      'Kettlebell_Dead_Clean', 'One-Arm_Open_Palm_Kettlebell_Clean',
      'Open_Palm_Kettlebell_Clean', 'One-Arm_Side_Deadlift',
      'Kettlebell_One-Legged_Deadlift', 'Stiff-Legged_Barbell_Deadlift',
      'Stiff-Legged_Dumbbell_Deadlift', 'Alternating_Hang_Clean',
      'Kettlebell_Hang_Clean', 'Front_Squat_Clean_Grip'],
    hombro: ['Standing_Military_Press', 'One-Arm_Kettlebell_Snatch',
      'One-Arm_Kettlebell_Split_Snatch', 'Double_Kettlebell_Snatch',
      'Two-Arm_Kettlebell_Clean', 'One-Arm_Kettlebell_Clean_and_Jerk',
      'Two-Arm_Kettlebell_Jerk', 'Dumbbell_Raise',
      'Barbell_Incline_Shoulder_Raise'],
    brazo: ['Wide-Grip_Standing_Barbell_Curl', 'Close-Grip_Standing_Barbell_Curl',
      'Alternate_Hammer_Curl', 'Bottoms-Up_Clean_From_The_Hang_Position',
      'Push-Ups_-_Close_Triceps_Position'],
    core: ['Gorilla_Chin_Crunch', 'Bent-Knee_Hip_Raise', 'Butt-Ups',
      'Decline_Reverse_Crunch', '3_4_Sit-Up', 'Landmine_180s']
  };

  /* Qué zona es la de estos ejercicios: la que más veces aparece.

     No se llama `zonaDeRutina` aunque sea lo que hace: ese nombre ya existe más
     abajo en este mismo archivo, y en JavaScript la última declaración gana. Se
     llamaba a la otra sin enterarse, con lo que la zona salía mal y el día de
     pierna se quedaba sin portada. `node --check` no ve esto. */
  function zonaDeEjercicios(ejs) {
    const cuenta = {};
    ejs.forEach(function (ex) {
      (ex.primaryMuscles || []).forEach(function (m) {
        const gr = I18N.GROUPS.filter(function (x) {
          return x.muscles.indexOf(m) !== -1;
        })[0];
        if (gr) cuenta[gr.id] = (cuenta[gr.id] || 0) + 1;
      });
    });
    return Object.keys(cuenta).sort(function (a, b) {
      return cuenta[b] - cuenta[a];
    })[0] || '';
  }

  function diaDelAno() {
    const h = new Date();
    return Math.floor((h - new Date(h.getFullYear(), 0, 0)) / 86400000);
  }

  let fotoVista = { clave: '', url: '' };

  function fotoDeRutina(r) {
    if (!r || !g.Data) return '';
    const ejs = (r.exercises || []).map(function (re) { return Data.get(re.exId); })
      .filter(Boolean);
    if (!ejs.length) return '';

    /* Se recuerda la última: la plantilla la pide varias veces por repintado.
       La clave lleva los ejercicios y el día, que son las dos cosas que la
       cambian. */
    const clave = r.id + '|' + diaDelAno() + '|' +
      (r.exercises || []).map(function (x) { return x.exId; }).join(',');
    if (fotoVista.clave === clave) return fotoVista.url;

    const buena = function (id) {
      const ex = Data.get(id);
      return ex && ex.images && ex.images.length && !Data.esIlustracion(ex) ? ex : null;
    };

    const zona = zonaDeEjercicios(ejs);
    const caras = CARAS[zona] || [];
    let elegido = null;

    /* Se turnan por día, siempre. Antes miraba primero si uno de los ejercicios
       del día estaba entre los elegidos y, como la rutina no cambia, esa portada
       se quedaba clavada para siempre: la misma foto todos los lunes hasta el
       fin de los tiempos. Con trece opciones en pierna y nueve en hombro, dos
       semanas seguidas no repiten.

       Rota con el día del año y con la rutina, para que dos rutinas del mismo
       grupo el mismo día no salgan con la misma foto. */
    if (caras.length) {
      const salto = diaDelAno() + String(r.id || '').length;
      for (let k = 0; k < caras.length && !elegido; k++) {
        elegido = buena(caras[(salto + k) % caras.length]);
      }
    }

    /* Y si esa zona no tiene elegidas —o el catálogo no está entero—, la
       primera foto de la propia rutina. Nunca una ilustración: un muñeco sobre
       fondo blanco no invita a entrenar. */
    if (!elegido) {
      elegido = ejs.filter(function (ex) {
        return ex.images && ex.images.length && !Data.esIlustracion(ex);
      })[0] || null;
    }

    const url = elegido ? (Data.img(elegido, 0) || '') : '';
    fotoVista = { clave: clave, url: url };
    return url;
  }

  function resumenRutina(r) {
    const n = (r.exercises || []).length;
    const series = (r.exercises || []).reduce(function (a, e) {
      return a + (Number(e.sets) || 0);
    }, 0);
    const partes = [];
    if (r.name) partes.push(r.name);
    partes.push(Tp(n, '{n} ejercicio', '{n} ejercicios'));
    if (series) partes.push(Tp(series, '{n} serie', '{n} series'));
    return partes.join(' · ');
  }

  /* ---------- la frase del entrenador, en la portada ----------
     Existía desde hace tiempo —un empujón, un dato de fisiología, un detalle
     de técnica, algo de comida o de descanso, rotando— pero vivía en «ver el
     día entero», que es una pantalla en la que hay que entrar. Lo primero que
     se lee al abrir la app era «llevas 13 entrenamientos esta semana», que es
     un dato que ya está tres centímetros más abajo en las tres cifras.

     Se pide una vez y se queda: la píldora ya se guarda por bloques de horas,
     así que no gasta una llamada por repintado. Mientras no llega —o si no hay
     entrenador configurado— se dice lo de siempre, que es mejor que un hueco. */
  let frasePortada = '';
  let pidiendoFrasePortada = false;

  function viewInicio() {
    const st = Store.stats();
    const rutinas = Store.routines();
    const activa = Store.active();
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const deHoy = rutinasDeHoy();
    const nombre = Store.settings().name;
    const hecho = loDeHoy();

    /* Al volver tras un rato, la portada saluda antes que nada */
    const bienvenida = Saludo.pendiente();

    return html`
      ${raw(bienvenida ? html`
        <div class="card saludo">
          <div class="row between" style="align-items:flex-start">
            <div class="grow">
              <div class="saludo-tit entra">${raw(conNombreHTML(bienvenida.titulo))}</div>
              <p class="entra entra-2" style="margin:0;font-size:.92rem">${bienvenida.texto}</p>
            </div>
            <button class="btn icon ghost" data-a="cerrarSaludo"
                    aria-label="${T('Cerrar')}">${raw(icon('close'))}</button>
          </div>
        </div>`
      : html`
        <div class="hola entra">${T('Hola')}${raw(nombre
          ? ', <span class="nombre">' + esc(nombre) + '</span>' : '')}</div>
        ${raw(frasePortada ? html`
          <p class="hola-frase entra entra-2">
            <span class="hf-ico">${raw(icon('chispa'))}</span>${frasePortada}</p>`
        : html`
          <p class="muted entra entra-2 hola-sub" style="font-size:.92rem">${raw(hecho
            ? Tp(st.week, 'Muy bien. Llevas {n} entrenamiento esta semana.',
                'Muy bien. Llevas {n} entrenamientos esta semana.')
            : st.week === 0
              ? T('Semana en blanco. Buen momento para empezar.')
              : st.week === 1 ? T('Llevas 1 entrenamiento esta semana. Sigue así.')
              : Tn('Llevas {n} entrenamientos esta semana. Muy bien.', { n: st.week }))}</p>`)}`)}

      <div class="muelle"></div>
      ${raw(activa ? html`
        <div class="card" style="border-color:var(--acc);background:var(--acc-d)">
          <div class="row between">
            <div class="grow">
              <div class="tiny" style="color:var(--acc)">${T('ENTRENAMIENTO EN CURSO')}</div>
              <h3 style="margin:2px 0 0">${activa.routineName}</h3>
            </div>
            <button class="btn primary" data-a="resume">${T('Continuar')}</button>
          </div>
        </div>`
      : hecho ? html`
        <!-- Ya está hecho. Un botón verde de «Entrenar pecho» aquí es la app
             pidiéndote que hagas lo que acabas de hacer: lo que toca es decir
             que está hecho y dejar a mano lo único que tiene sentido después,
             que es apuntar algo más si lo haces.

             Ocupa el mismo hueco y tiene la misma forma que el botón: el disco
             a la izquierda, el rótulo, el titular y la línea de debajo. Nunca
             están los dos a la vez, así que la pantalla no da un salto. -->
        <!-- La misma foto que llevaba el botón de entrenar esta mañana: la
             portada no cambia de cara al terminar, cambia de mensaje. Antes
             aquí había un tic gigante de fondo y un tic dentro del disco, que
             era decir dos veces lo mismo y no decía nada del entrenamiento.
             El tic de fondo se queda solo para lo apuntado a mano, que no
             tiene rutina de la que sacar imagen. -->
        <div class="card tarjeta-premium dia-cabeza hecha portada-hueco${
          raw(fotoDeRutina(hecho.rutina) ? ' con-foto' : '')}"
             data-a="verhecho" role="button" tabindex="0">
          ${raw(fotoDeRutina(hecho.rutina)
            ? '<img class="dc-foto" src="' + esc(fotoDeRutina(hecho.rutina)) +
              '" alt="" loading="lazy" aria-hidden="true">'
            : '<span class="hh-silueta" aria-hidden="true">' + icon('check') + '</span>')}
          <span class="dc-disco">${raw(icon('check'))}</span>
          <span class="grow">
            <span class="dc-rotulo">${Tn('Hoy, {d} · hecho',
              { d: UI.diaLargo(hoy).toLowerCase() })}</span>
            <!-- El galón dice que la tarjeta se toca. Sin él no hay forma de
                 saberlo: un cuadro que solo informa y otro que además abre algo
                 se ven igual hasta que uno lo prueba. -->
            <span class="dc-tit">${hecho.n > 1 ? T('Ya entrenaste dos veces')
              : T('Ya entrenaste')}<i class="dc-mas">${raw(icon('chevron'))}</i></span>
            ${raw(musculosHechos(hecho)
              ? '<span class="dc-que">' + esc(Tn('Hiciste {q}',
                  { q: musculosHechos(hecho) })) + '</span>'
              : '')}
            <span class="dc-sub">${raw(resumenHechoHTML(hecho))}</span>
          </span>
        </div>
        <button class="enlace-flojo" data-a="empezarlibre">
          ${T('Apuntar otro entrenamiento')}</button>`
      : deHoy.length ? html`
        <!-- El cajón de «Hoy, lunes» decía de qué plan es la rutina y cuántos
             ejercicios tiene, y justo encima había un botón verde que solo
             decía «Entrenar pecho». Eran la misma cosa contada en dos sitios, y
             ese cajón no se pulsaba para nada que el botón no hiciera ya. Así
             que lo que decía se escribe dentro del botón. -->
        <button class="card tarjeta-premium dia-cabeza portada-hueco btn-arranque${
          raw(fotoDeRutina(deHoy[0]) ? ' con-foto' : '')}"
                data-a="entrenarhoy">
          ${raw(fotoDeRutina(deHoy[0])
            ? '<img class="dc-foto" src="' + esc(fotoDeRutina(deHoy[0])) +
              '" alt="" loading="lazy" aria-hidden="true">'
            : '')}
          <span class="dc-play">${raw(icon('play'))}</span>
          <span class="grow">
            <span class="dc-rotulo">${Tn('Hoy, {d}',
              { d: UI.diaLargo(hoy).toLowerCase() })}${raw(
              deHoy.length === 1 && queEsHoy(deHoy) !== T('lo de hoy')
                ? ' · ' + esc(queEsHoy(deHoy)) : '')}</span>
            <span class="dc-tit">${T('Entrenar')}</span>
            <span class="dc-sub">${deHoy.length === 1
              ? resumenRutina(deHoy[0])
              : Tn('{n} rutinas para hoy: te dejo elegir', { n: deHoy.length })}</span>
          </span>
        </button>
        ${raw(cargaPreviaHTML(deHoy))}
        <button class="enlace-flojo" data-a="empezarlibre">
          ${T('O un entrenamiento libre')}</button>`
      : html`
        ${raw(diaLibreHTML(rutinas))}
        <!-- El día libre también necesita su botón: cronometrar una trotada o una
             caminata es justo lo que se hace un día sin plan, y un enlace flojo
             no es sitio para eso.

             Se llama como el de arriba pero al revés: «Apuntar algo» es lo que ya
             hiciste y esto es lo que arranca con el cronómetro corriendo. Lo
             único que cambia es el verbo y el tiempo, que es la única
             diferencia que hay de verdad.

             «Iniciar una actividad rápida» y no «empezar algo ahora»: «algo» no
             dice qué va a pasar al tocarlo, y lo que pasa es que arranca una
             actividad y empieza a contar. Con la figura corriendo al lado se
             entiende sin leerlo: el reloj de antes valía igual para un
             cronómetro que para un descanso.

             Verde solo si ya tiene rutinas: a quien acaba de entrar en la app lo
             que le hace falta es montarse el programa, y ahí el verde se queda
             en la tarjeta. Uno solo, siempre. -->
        <button class="btn ${rutinas.length ? 'primary ' : ''}block realce"
                data-a="empezarlibre" style="margin-top:9px">
          ${raw(icon('correr'))} ${T('Iniciar una actividad rápida')}
        </button>`)}

      <div class="muelle"></div>
      ${raw(resumenSemanaHTML(st))}

      ${raw(Modo.franjaInvitado())}

      <!-- Aquí no va ninguna tarjeta del día. Lo que toca hoy —haya rutina o no
           la haya— ya está arriba, en el sitio grande, y repetirlo a media
           pantalla de distancia no informa de nada. -->
      <div class="muelle"></div>
      <!-- El rótulo se queda aunque la tarjeta se vaya: «Ver mi día» no
           lo dice nadie más, y lo que viene debajo —la semana y lo comido— sigue
           siendo lo de hoy. -->
      <div class="list-head portada-titulo">
        <!-- «Hoy, lunes» ya lo dice el botón de arriba en su rótulo, y repetirlo
             media pantalla más abajo no informa de nada. Lo que hace falta aquí
             es decir de quién es lo que viene: su día. -->
        <span class="list-title" style="margin:0">${T('Tu día')}</span>
        <!-- Sin verde: el verde de esta app significa «esto es lo que has venido
             a hacer», y en la portada solo puede haber una cosa así. Con este
             botón también en verde, el de Entrenar dejaba de destacar. Y así
             se parece al resto de acciones de sección de la app. -->
        <button class="btn sm realce" data-a="verdia">${raw(icon('lista'))} ${T('Ver mi día')}</button>
      </div>
      ${raw(semanaHTML())}
      ${raw(comidaHoyHTML())}

      <!-- Lo que llevas abandonado y tu peso se fueron de aquí. Los dos son
           lecturas del historial, no cosas de hoy: el músculo que no tocas
           desde hace un mes vive al lado del reparto por zona, en Progreso, y
           el peso al lado de tus datos, en Perfil, donde además se apunta. La
           portada es para lo de hoy. -->
      <div class="pie-version" id="pie-version"></div>`;
  }

  /* «Pecho, hombros y tríceps». Lo primero que uno quiere leer no es cuántas
     series hizo, es qué tocó: es lo que contesta a «¿qué entrené hoy?» sin
     tener que abrir nada. Tres y hasta ahí; con ocho músculos la frase deja de
     ser una frase. */
  function musculosHechos(h) {
    const m = h.musculos || [];
    if (!m.length) return '';
    /* La «y» de la última coma cambia de idioma, así que la enumeración se
       arma con la conjunción traducida en vez de escribirla a mano. */
    const y = ' ' + T('y') + ' ';
    if (m.length === 1) return m[0];
    if (m.length === 2) return m[0] + y + m[1];
    if (m.length === 3) return m[0] + ', ' + m[1] + y + m[2];
    return m[0] + ', ' + m[1] + ', ' + m[2] + y + Tn('{n} más', { n: m.length - 3 });
  }

  /* Y debajo, de dónde salió y cuánto fue. Sin cifras inventadas: si no se
     apuntó nada de eso —un entrenamiento libre sin series, o un día
     importado— se dice lo que hay y no se rellena el hueco. */
  function resumenHechoHTML(h) {
    const partes = [];
    if (h.nombres.length) partes.push(esc(h.nombres.join(' · ')));
    if (h.series) partes.push(Tp(h.series, '{n} serie', '{n} series'));
    /* El volumen solo si lleva el peso anotado. Con «solo series» puesto, un
       «14.160 kg levantados» es de cuando anotaba pesos y ya no es la vara con
       la que mide. */
    if (h.volumen && Store.settings().registro === 'detallado') {
      partes.push(Tn('{v} levantados', { v: UI.kg(h.volumen) }));
    }
    if (h.minutos >= 1) partes.push(Tn('{n} min', { n: h.minutos }));
    return partes.length ? partes.join(' · ') : T('Queda apuntado en tu historial.');
  }

  /* Resalta el nombre dentro del saludo, que es lo único que cambia de persona
     a persona: "Buenas tardes, Fabián" con el nombre en color. */
  function conNombreHTML(titulo) {
    const n = Saludo.nombre();
    if (!n) return esc(titulo);
    const i = titulo.lastIndexOf(n);
    if (i === -1) return esc(titulo);
    return esc(titulo.slice(0, i)) + '<span class="nombre">' + esc(n) + '</span>' +
      esc(titulo.slice(i + n.length));
  }

  /* ---------- de qué va una rutina ----------
     La zona sale de los ejercicios que tiene, no de su nombre: así una rutina
     llamada "Lunes" sigue sabiendo que es de pierna. */
  function zonaDeRutina(r) {
    const cuenta = {};
    (r.exercises || []).forEach(function (re) {
      const ex = Data.get(re.exId);
      if (!ex) return;
      (ex.groups || []).forEach(function (g2) { cuenta[g2] = (cuenta[g2] || 0) + 1; });
    });
    const ids = Object.keys(cuenta).sort(function (a2, b2) { return cuenta[b2] - cuenta[a2]; });
    if (!ids.length) return null;
    const gr = I18N.GROUPS.find(function (x) { return x.id === ids[0]; });
    return gr ? { id: gr.id, label: gr.label, cuantos: cuenta[ids[0]] } : null;
  }

  /* Los músculos que toca de verdad, de más a menos presentes */
  /* Los mismos, sin traducir: la silueta se pinta con los identificadores. */
  function musculosCrudos(r) {
    const cuenta = {};
    (r.exercises || []).forEach(function (re) {
      const ex = Data.get(re.exId);
      if (!ex) return;
      (ex.primaryMuscles || []).forEach(function (m) { cuenta[m] = (cuenta[m] || 0) + 1; });
    });
    return Object.keys(cuenta).sort(function (a, b) { return cuenta[b] - cuenta[a]; });
  }

  function musculosDeRutina(r) {
    const cuenta = {};
    (r.exercises || []).forEach(function (re) {
      const ex = Data.get(re.exId);
      if (!ex) return;
      (ex.primaryMuscles || []).forEach(function (m) { cuenta[m] = (cuenta[m] || 0) + 1; });
    });
    return Object.keys(cuenta)
      .sort(function (a2, b2) { return cuenta[b2] - cuenta[a2]; })
      .map(function (m) { return I18N.muscle(m); });
  }

  /* «Lunes y Miércoles y Viernes» se lee mal; así se enumera en castellano */
  function listaDias(dias) {
    if (!dias.length) return '';
    if (dias.length === 1) return dias[0];
    return Tn('{lista} y {ultimo}',
      { lista: dias.slice(0, -1).join(', '), ultimo: dias[dias.length - 1] });
  }

  /* Título de la tarjeta: el día y lo que se trabaja, que es lo que uno busca */
  function tituloRutina(r) {
    const zona = zonaDeRutina(r);
    const dias = (r.days || []).map(UI.diaLargo);
    const que = r.mixta ? T('Mixta') : (zona ? T(zona.label) : T('Sin ejercicios'));
    if (!dias.length) return que;
    return listaDias(dias) + ' · ' + que;
  }

  /* «Lunes · Fabian»: el día delante y el plan detrás. Ese nombre completo es el
     que sale en el banner de «entrenamiento en curso» y el que se queda escrito
     en el historial, así que una rutina nueva tiene que nacer ya con él puesto. */
  function nombreConDia(base, dias) {
    const largos = (dias || []).map(UI.diaLargo);
    return largos.length ? listaDias(largos) + ' · ' + base : base;
  }

  /* El nombre guardado lleva el día delante desde que lo generó el programa
     («Lunes · Fabián»). Al mover la rutina de día ese prefijo se quedaba
     mintiendo: la lista lo esconde, pero el nombre entero sale en el banner del
     entrenamiento en curso y se queda escrito en el historial, así que uno
     acababa con un «Lunes · Fabián» entrenado un viernes. Se reescribe con el
     día nuevo; si nunca llevó día delante, no se toca nada. */
  function renombrarPorDia(r) {
    const base = nombreRutina(r);
    if (!r.name || base === r.name) return r;
    r.name = nombreConDia(base, r.days);
    return r;
  }

  /* Arrastre de las versiones de antes: hay rutinas guardadas con un día en el
     nombre que ya no es el suyo, de cuando moverlas de día no reescribía nada.
     Corregirlo solo al tocar el día no arreglaba lo que ya estaba mal: el
     nombre viejo seguía saliendo al empezar a entrenar y de ahí al historial.
     Se repasan todas al arrancar; es barato y solo escribe las que cambian. */
  function normalizarNombres() {
    Store.routines().forEach(function (r) {
      const antes = r.name;
      renombrarPorDia(r);
      if (r.name !== antes) {
        Store.saveRoutine(r);
        refrescarActiva(r);
      }
    });
  }

  /* El entrenamiento en curso se queda con una copia del nombre de cuando
     empezó. Si la rutina cambia mientras se entrena, esa copia hay que
     ponerla al día o el banner sigue anunciando lo de antes. */
  function refrescarActiva(r) {
    const a = Store.active();
    if (!a || !r || a.routineId !== r.id || a.routineName === r.name) return;
    a.routineName = r.name;
    Store.setActive(a);
  }

  /* Los nombres que salen del generador llevan el día delante —«Viernes · Rutina
     Fabián»— porque así se guardaron. En la lista el día ya sale en la cabecera
     del grupo y otra vez en el título de la tarjeta: escribirlo una tercera vez
     no añade nada. Se quita al pintar, no al guardar: el nombre completo sigue
     siendo el que viaja al historial y a los otros dispositivos. */
  /* EL PLAN QUE MANDA HOY.
     Con dos planes que tengan lunes, el lunes salían los dos y había que elegir
     a mano cada vez. Se marca uno como activo y es el único que cuenta para
     «hoy»; los demás siguen ahí enteros, para abrirlos y entrenar de ellos
     cuando quieras.

     Si el plan marcado ya no existe —lo borraste o lo renombraste— la marca se
     ignora sola y vuelven a contar todos: más vale ver de más que quedarse sin
     entrenamiento por una marca huérfana. */
  function planActivo() {
    const n = Store.settings().planActivo;
    if (!n) return '';
    const hay = Store.routines().some(function (r) { return nombreRutina(r) === n; });
    return hay ? n : '';
  }

  function marcarPlanActivo(nombre) {
    Store.setSetting('planActivo', nombre || null);
  }

  /* Las rutinas que tocan hoy, ya filtradas por el plan activo. Lo usa todo el
     mundo —portada, rutinas, el día entero, la lista de música— para que no haya
     dos ideas distintas de qué toca hoy. */
  function rutinasDeHoy(conEjercicios) {
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const activo = planActivo();
    return Store.routines().filter(function (r) {
      if ((r.days || []).indexOf(hoy) === -1) return false;
      if (conEjercicios && !(r.exercises || []).length) return false;
      return !activo || nombreRutina(r) === activo;
    });
  }

  /* Le quita el día de delante a un nombre: «Martes · Rutina Fabián» queda en
     «Rutina Fabián». Solo si lo de delante son días de verdad y queda algo
     detrás: un plan llamado «Fuerza · bloque 2» se queda entero.

     Vale para un nombre suelto y no solo para una rutina porque lo que guarda
     una sesión es una cadena, y esa cadena también se pinta. */
  function sinDia(nombre) {
    const n = String(nombre || '').trim();
    const corte = n.indexOf(' · ');
    if (corte === -1) return n;

    const cabeza = n.slice(0, corte);
    const resto = n.slice(corte + 3).trim();
    if (!resto) return n;

    /* La coma y la «y» separan los días; con la app en inglés es «and», y el
       nombre pudo escribirse con cualquiera de los dos. */
    const soloDias = cabeza.split(/\s*,\s*|\s+(?:y|and)\s+/i).filter(Boolean)
      .every(function (t) { return !!UI.claveDeDia(t); });
    return soloDias ? resto : n;
  }

  function nombreRutina(r) {
    const n = String(r.name || '').trim();
    if (!n) return T('Rutina sin nombre');
    return sinDia(n);
  }

  /* Qué rutina está desplegada, y en qué pantalla. Es por pantalla a propósito:
     con una sola variable, abrir una rutina en Rutinas la abría también en la
     portada, y la portada se llena de golpe cuando lo que uno quiere ahí es ver
     el día de un vistazo. */
  let rutinaAbierta = { rutinas: null, inicio: null, dia: null, plan: null };

  /* Qué planes están desplegados. Sin esto la pantalla de Rutinas era todo lo
     que uno tiene, abierto de golpe. */
  let gruposAbiertos = {};

  /* La lista de Rutinas, agrupada por el plan al que pertenece cada una.
     Agrupar por día partía el plan en siete trozos y obligaba a abrir uno por
     uno para ver qué había montado; lo que uno tiene en la cabeza es «mi plan
     Fabián» con sus días dentro. El nombre del plan es el de la rutina sin el
     día delante, que es justo como se guardan al generarlas.
     Arriba, y aparte, lo que toca hoy: eso se mira sin abrir nada. */
  /* Un color por plan. No es decoración: el filo de color es lo que deja ver de
     un vistazo dónde acaba un plan y empieza el otro.

     Va por posición en la lista y no por un hash del nombre. Con el hash dos
     planes vecinos podían salir del mismo color —pasó a la primera, con tres
     planes de prueba— y entonces el color no distingue nada. Por posición,
     dos seguidos nunca coinciden.

     Los cinco tonos se leen sobre fondo claro y oscuro. */
  const TONOS_PLAN = ['#8bc34a', '#4f8cf5', '#f0a23c', '#c06bf0', '#2fc4b2'];

  /* Una preferencia de sí o no, con su par de botones. Las de arriba son de
     elegir una de tres y se pintan solas; estas son interruptores, y meterlos
     en el mismo molde haría que un «no» pareciese una tercera opción. */
  /* Del día abreviado que se guarda al 0-6 de Date.getDay(), para poder pedirle
     a UI la versión en el idioma puesto. */
  const DIA_A_NUM = { Dom: 0, Lun: 1, Mar: 2, 'Mié': 3, Jue: 4, Vie: 5, 'Sáb': 6 };

  function porPlanes(rutinas) {
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const deHoy = rutinasDeHoy();
    const activo = planActivo();

    const orden = [];
    const planes = {};
    rutinas.forEach(function (r) {
      const k = nombreRutina(r);
      if (!planes[k]) { planes[k] = []; orden.push(k); }
      planes[k].push(r);
    });

    /* dentro del plan, por el día de la semana; las sueltas al final */
    const pos = function (r) {
      const i = DIAS.indexOf((r.days || [])[0]);
      return i === -1 ? 99 : i;
    };
    orden.forEach(function (k) {
      planes[k].sort(function (a, b) { return pos(a) - pos(b); });
    });

    const arriba = deHoy.length ? html`
      <div class="list-title">${Tn('Hoy es {d}, y esto es lo que toca',
        { d: UI.diaLargo(hoy).toLowerCase() })}</div>
      <div class="stack">${raw(deHoy.map(function (r) {
        return routineCard(r, 0, 0, false, 'dia');
      }).join(''))}</div>`
      : html`
      <div class="list-title">${Tn('Hoy es {d}',
        { d: UI.diaLargo(hoy).toLowerCase() })}</div>
      <p class="tiny" style="margin:-4px 0 4px">${raw(activo
        ? esc(Tn('Tu plan principal —{p}— no tiene nada para hoy. Otros planes sí: ábrelos abajo y entrena de ellos, o cambia de plan principal.',
            { p: activo }))
        : esc(T('No tienes nada asignado a hoy. Abre un plan y toca los días de una rutina para moverla aquí.')))}</p>`;

    const bloques = orden.map(function (k, i) {
      const suyas = planes[k];
      /* Siempre plegado de entrada, también cuando solo hay un plan. Abierto por
         defecto, el plan se comía la pantalla entera y las rutinas de abajo no se
         veían: cada uno se abre cuando se va a usar. */
      const abierto = gruposAbiertos[k] === true;
      const dias = [];
      suyas.forEach(function (r) {
        (r.days || []).forEach(function (d) { if (dias.indexOf(d) === -1) dias.push(d); });
      });
      dias.sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); });

      const ejercicios = suyas.reduce(function (n, r) { return n + r.exercises.length; }, 0);

      const cabecera = html`
        <button class="dia-grupo" data-grupo="${k}">
          <div class="grow">
            <div class="rt-titulo">${k}
              ${raw(k === activo ? '<span class="chip tiny-chip plan-marca">' +
                esc(T('EN CURSO')) + '</span>' : '')}
              ${raw(dias.indexOf(hoy) !== -1 ? '<span class="chip solid tiny-chip">' +
                esc(T('HOY')) + '</span>' : '')}</div>
            <!-- En una linea: los seis dias de un plan completo se iban a dos
                 renglones y el cajon crecia veinte pixeles por nada. -->
            <!-- Los días van por UI.diaLargo, que los da en el idioma puesto:
                 guardados son «Lun» y «Mié», y en inglés eso no se lee. -->
            <div class="tiny plan-meta">${Tp(suyas.length, '{n} rutina', '{n} rutinas')}
              · ${Tn('{n} ejercicios', { n: ejercicios })}
              · ${dias.length ? dias.map(function (d) {
                  return UI.inicialDia(DIA_A_NUM[d]);
                }).join(', ') : T('sin día')}</div>
          </div>
          <span class="plegador ${abierto ? 'abierto' : ''}">
            <span class="plegador-txt">${abierto ? T('Ocultar') : T('Ver')}</span>
            ${raw(icon('chevron'))}</span>
        </button>`;

      /* El plan, dentro de su cajón. Suelto sobre el fondo de la página no se
         veía dónde empieza uno y acaba el otro; con su borde y su filo verde a
         la izquierda se lee como una unidad. */
      const tono = TONOS_PLAN[i % TONOS_PLAN.length];

      return html`
        <div class="plan-caja${raw(abierto ? ' abierta' : '')}"
             style="--tono:${tono}">
        ${raw(deslizable(cabecera, [
          { icono: 'chispa', texto: T('Analizar') + BAJA + T('con IA'),
            attr: 'data-iaplan="' + esc(k) + '"' },
          { icono: 'copiar', texto: T('Duplicar'), attr: 'data-duplicarplan="' + esc(k) + '"' },
          { icono: 'compartir', texto: T('Compartir'), attr: 'data-compartirplan="' + esc(k) + '"' },
          { icono: 'trash', texto: T('Borrar'), tono: 'malo',
            attr: 'data-borrarplan="' + esc(k) + '"' }
        ], [
          /* Marcar el plan principal estaba solo dentro del plan abierto, o sea
             a dos toques y después de desplegar cinco rutinas. Aquí se hace
             empujando la cabecera a la derecha, sin abrir nada. */
          { icono: k === activo ? 'close' : 'check',
            texto: k === activo ? T('Quitar') + BAJA + T('principal')
              : T('Marcar') + BAJA + T('principal'),
            tono: k === activo ? '' : 'suave',
            attr: 'data-planactivo="' + (k === activo ? '' : esc(k)) + '"' },
          { icono: 'edit', texto: T('Renombrar'), tono: 'suave',
            attr: 'data-renombrarplan="' + esc(k) + '"' },
          { icono: 'lista', texto: T('Abrir'), tono: 'suave',
            attr: 'data-verplan="' + esc(k) + '"' }
        ]))}
        ${raw(abierto ? '<div class="stack">' +
          suyas.map(function (r) { return routineCard(r, 0, 0, true, 'plan'); }).join('') + '</div>' +
          accionesPlanHTML(k, suyas.length, k === activo) : '')}
        </div>`;
    }).join('');

    return arriba + html`<div class="list-title">${T('Mis planes de entrenamiento')}</div>` + bloques;
  }

  /* Lo que se puede hacer con un plan entero.
     Eran cinco botones a todo lo ancho con dos parrafos metidos entre medias:
     un muro gris donde borrar el plan pesaba lo mismo que compartirlo. Ahora es
     una lista de filas con su icono de color —cada accion el suyo, y el del
     plan principal el tono del propio plan— y entran una detras de otra al
     abrirlo. La de borrar va aparte, abajo y en rojo, que es lo unico
     irreversible de la lista. */
  function accionesPlanHTML(nombre, cuantas, esActivo) {
    const id = esc(nombre);

    const fila = function (attr, ico, color, titulo, sub, extra) {
      return '<button class="fila-plan' + (extra || '') + '" ' + attr +
        ' style="--fp:' + color + '">' +
        '<span class="fp-ico">' + icon(ico) + '</span>' +
        '<span class="grow"><span class="fp-tit">' + esc(titulo) + '</span>' +
        (sub ? '<span class="fp-sub">' + esc(sub) + '</span>' : '') + '</span>' +
        '<span class="chevron">' + icon('chevron') + '</span></button>';
    };

    return '<div class="plan-acciones">' +
      (esActivo
        ? fila('data-planactivo=""', 'check', 'var(--tono)',
            T('Dejar de ser el plan principal'),
            T('Ahora manda este: en «hoy» solo salen sus rutinas.'), ' es-principal')
        : fila('data-planactivo="' + id + '"', 'check', 'var(--tono)',
            T('Usar este como plan principal'),
            T('En «hoy» solo saldrán las suyas. Los demás siguen aquí.'))) +

      fila('data-iaplan="' + id + '"', 'chispa', '#c06bf0', T('Revisar el plan con IA'),
        Tn('Lee los {n} días juntos: el reparto entre músculos, lo que se repite y lo ' +
          'que falta.', { n: cuantas })) +

      fila('data-duplicarplan="' + id + '"', 'copiar', '#4f8cf5', T('Duplicar el plan entero'),
        T('Una copia con sus rutinas, para probar cambios sin tocar este.')) +

      fila('data-compartirplan="' + id + '"', 'compartir', '#2fc4b2', T('Compartir el plan'),
        Tn('Un enlace con las {n} rutinas dentro.', { n: cuantas })) +

      fila('data-borrarplan="' + id + '"', 'trash', 'var(--bad)',
        T('Borrar el plan entero'),
        Tp(cuantas, '{n} rutina. No se puede deshacer.', '{n} rutinas. No se puede deshacer.'),
        ' es-peligro') +
      '</div>';
  }

  /* Fila que se desliza para descubrir sus acciones. El contenido va delante y
     los botones detrás; lo de iOS de toda la vida. Evita tener que desplegar un
     plan entero solo para duplicarlo o borrarlo. */
  /* Cada línea de la etiqueta va en su propio trozo y no se parte nunca. Con un
     ancho fijo y el texto suelto, «Compartir» cabía en unos móviles y en otros
     dejaba la erre sola en la línea de abajo: la letra que entra o no depende de
     la fuente del sistema, y eso no se puede medir desde aquí. Ahora manda el
     texto y el botón se ensancha lo que haga falta. */
  /* El corte de línea de una etiqueta, como constante: escribirlo escapado
     dentro de la cadena es fácil de romper sin darse cuenta. */
  const BAJA = String.fromCharCode(10);

  function botonesDe(acciones) {
    return acciones.map(function (a) {
      const lineas = String(a.texto).split(BAJA);
      return '<button class="desliza-btn' + (a.tono ? ' ' + a.tono : '') + '" ' +
        a.attr + ' aria-label="' + esc(lineas.join(' ')) + '">' +
        icon(a.icono) + '<span class="desliza-txt">' +
        lineas.map(function (l) { return '<i>' + esc(l) + '</i>'; }).join('') +
        '</span></button>';
    }).join('');
  }

  function deslizable(contenido, acciones, izquierda) {
    return '<div class="desliza">' +
      (izquierda && izquierda.length
        ? '<div class="desliza-acciones izq">' + botonesDe(izquierda) + '</div>' : '') +
      '<div class="desliza-acciones der">' + botonesDe(acciones) + '</div>' +
      '<div class="desliza-cara">' + contenido + '</div>' +
      '</div>';
  }

  /* i y total solo llegan desde la lista de Rutinas, que es donde se puede
     reordenar y borrar. En la portada se usa la tarjeta sin más. */
  function routineCard(r, i, total, sinPlan, ambito) {
    ambito = ambito || 'rutinas';
    const n = r.exercises.length;
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const esDeHoy = (r.days || []).indexOf(hoy) !== -1;
    const editando = ordenando && total;

    const musculos = musculosDeRutina(r);
    const abierta = rutinaAbierta[ambito] === r.id;

    /* ¿Esta rutina ya está hecha hoy? En la portada y en «mi día» el botón
       verde de Entrenar deja de tener sentido en cuanto la sesión está
       apuntada: pedir que hagas lo que acabas de hacer no es una invitación,
       es ruido. Se cambia por la marca de hecho; para repetirla, ahí está
       Rutinas. */
    const hechaHoy = (function () {
      if (ambito !== 'inicio' && ambito !== 'dia') return false;
      const clave = Store.dayKey(Date.now());
      return Store.sessions().some(function (x) {
        return x.routineId === r.id && Store.dayKey(x.start) === clave;
      });
    })();

    /* La tarjeta de la portada es otra cosa que una fila de lista: es lo
       primero que se mira al abrir la app y lo que se toca para empezar. Lleva
       la misma información, ordenada por lo que se pregunta uno al verla —qué
       toca hoy, de qué plan, cuánto es— con la zona arriba en pequeño, el día
       en grande y el botón a media altura, que es donde cae el pulgar. */
    const cabeceraHoy = function () {
      const zona = zonaDeRutina(r);
      const dias = (r.days || []).map(UI.diaLargo);
      /* Arriba, que se trabaja; debajo, que dias. Poner los dias en los dos
         sitios —que es lo que pasaba cuando la rutina no era de hoy— dejaba la
         tarjeta diciendo «Lunes y Miércoles» dos veces. */
      const que = r.mixta ? T('Mixta') : zona ? T(zona.label) : T('Sin ejercicios');
      const encima = hechaHoy ? T('Hoy · hecho') : (esDeHoy ? T('Hoy') + ' · ' : '') + que;

      return html`
        <div class="hoy-fila">
          ${raw(musculos.length && g.Musculos ? '<div class="hoy-marca">' +
            Musculos.una(musculosCrudos(r), 'f') + '</div>' : '')}
          <button class="hoy-info" data-desplegar="${r.id}" data-ambito="${ambito}">
            <div class="hoy-encima">${encima}</div>
            <div class="hoy-tit">${dias.length ? listaDias(dias) : nombreRutina(r)}</div>
            <!-- Sin repetir los músculos: la zona ya está arriba, en verde. -->
            <div class="hoy-meta">${raw(sinPlan ? '' : esc(nombreRutina(r)) + ' · ')}${n}
              ${n === 1 ? 'ejercicio' : 'ejercicios'}</div>
          </button>
          ${raw(hechaHoy
            ? '<span class="hoy-hecho">' + icon('check') + ' ' + esc(T('Hecho')) + '</span>'
            : '<button class="hoy-play" data-train="' + esc(r.id) + '">' +
              icon('play') + ' ' + esc(T('Entrenar')) + '</button>')}
        </div>`;
    };

    /* La tarjeta grande vale para las dos pantallas donde se pregunta «qué
       toca hoy»: la portada y la cabeza de Rutinas. */
    const conCara = ambito === 'inicio' || ambito === 'dia' || ambito === 'plan';

    const tarjeta = conCara ? html`
      <div class="card tarjeta-hoy${raw(ambito === 'plan' ? ' compacta' : '')}"
           style="padding:0;overflow:hidden">
        ${raw(cabeceraHoy())}
        ${raw(abierta && n ? detalleHTML() : '')}
      </div>`
    : html`
      <div class="card ${esDeHoy && !ordenando ? 'card-hoy' : ''}" style="padding:0;overflow:hidden">
        <div class="row between" style="align-items:flex-start;padding:13px">
          ${raw(editando && total > 1 ? html`
            <div class="mover">
              <button class="btn sm" data-sube="${r.id}" ${i === 0 ? 'disabled' : ''}
                      aria-label="${T('Subir')}">${raw(icon('up'))}</button>
              <button class="btn sm" data-baja="${r.id}" ${i === total - 1 ? 'disabled' : ''}
                      aria-label="${T('Bajar')}">${raw(icon('down'))}</button>
            </div>` : '')}
          <div class="grow" style="cursor:pointer;min-width:0" data-desplegar="${r.id}"
               data-ambito="${ambito}">
            <div class="rt-titulo">${tituloRutina(r)}
              ${raw(esDeHoy && !ordenando ? '<span class="chip solid tiny-chip">HOY</span>' : '')}
              ${raw(r.mixta ? '<span class="chip tiny-chip">MIXTA</span>' : '')}</div>
            ${raw(sinPlan ? '' : '<div class="rt-nombre">' + esc(nombreRutina(r)) + '</div>')}
            <div class="tiny rt-meta" style="margin-top:3px">${n} ${n === 1 ? 'ejercicio' : 'ejercicios'}${raw(
              musculos.length ? ' · ' + esc(musculos.slice(0, 2).join(', ').toLowerCase()) +
                (musculos.length > 2 ? ' +' + (musculos.length - 2) : '') : '')}</div>
          </div>
          ${raw(editando
            ? html`<button class="btn sm danger" data-borrar="${r.id}"
                     aria-label="${T('Borrar rutina')}">${raw(icon('trash'))}</button>`
            : html`<button class="btn primary sm" data-train="${r.id}">
                     ${raw(icon('play'))} ${T('Entrenar')}</button>`)}
        </div>

        ${raw(abierta && n ? detalleHTML() : '')}
      </div>`;

    function detalleHTML() {
      return html`
          <div class="rt-detalle">
            ${raw(r.exercises.map(function (re, k) {
              const ex = Data.get(re.exId);
              return html`
                <button class="rt-item" data-ver="${re.exId}" style="width:100%;text-align:left">
                  <img src="${ex ? Data.img(ex, 0) : Data.PLACEHOLDER}" alt="" loading="lazy">
                  <div class="grow">
                    <div style="font-weight:600;font-size:.85rem">${k + 1}. ${ex ? ex.nameEs : re.exId}</div>
                    <div class="tiny">${re.sets} × ${re.reps}${raw(ex && ex.primaryMuscles.length
                      ? ' · ' + esc(ex.primaryMuscles.map(I18N.muscle).join(', ')) : '')}</div>
                  </div>
                </button>`;
            }).join(''))}
            <div style="padding:11px 13px 0">
              <div class="tiny">${T('QUÉ DÍAS LA HAGO')}</div>
              <!-- Una semana y no siete pastillas sueltas: en fila, con su
                   inicial, se ve de un vistazo qué días caen y cuáles no, que es
                   justo lo que se está decidiendo. La misma pieza que el
                   generador de programas, que hace esta misma pregunta. -->
              <div class="sem-pick" style="margin-top:7px">
                ${raw(DIAS.map(function (d) {
                  const on = (r.days || []).indexOf(d) !== -1;
                  return '<button class="sp-dia' + (on ? ' on' : '') + '" data-rdia="' + d +
                    '" data-rid="' + r.id + '" aria-pressed="' + (on ? 'true' : 'false') +
                    '">' + esc(UI.inicialDia(UI.DAY_NAMES.indexOf(d))) + '</button>';
                }).join(''))}
              </div>
              <p class="tiny" style="margin:7px 0 0">${T('Tócalos para mover la rutina de ' +
              'día. Si el viernes quieres pecho en vez de pierna, quita el viernes de una y ' +
              'pónselo a la otra.')}</p>
            </div>
            <div class="row" style="padding:11px 13px 0">
              <button class="btn sm grow" data-open="${r.id}">${raw(icon('edit'))} ${T('Editar')}</button>
              <button class="btn sm primary grow" data-train="${r.id}">
                ${raw(icon('play'))} ${T('Entrenar')}</button>
            </div>
            ${raw(ambito === 'inicio' ? '' : html`
            <div style="padding:8px 13px 13px">
              <!-- Duplicar y compartir van en la misma fila: son dos formas de
                   llevarse la rutina a otro sitio y caben de sobra con el verbo
                   solo. Revisar con IA se queda entera debajo, que no es de la
                   misma familia y encima cuesta una llamada. -->
              <div class="row" style="gap:8px">
                <button class="btn sm grow" data-duplicar="${r.id}">
                  ${raw(icon('copiar'))} ${T('Duplicar')}</button>
                <button class="btn sm grow" data-compartir="${r.id}">
                  ${raw(icon('compartir'))} ${T('Compartir')}</button>
              </div>
              <button class="btn sm block" data-iarutina="${r.id}" style="margin-top:8px">
                ${raw(icon('chispa'))} ${T('Revisar esta rutina con IA')}</button>
            </div>`)}
          </div>`;
    }

    /* En la portada la tarjeta va suelta: ahí no se borra ni se duplica nada */
    if (!total && !sinPlan) return tarjeta;

    return deslizable(tarjeta, [
      { icono: 'chispa', texto: T('Analizar') + BAJA + T('con IA'), attr: 'data-iarutina="' + r.id + '"' },
      { icono: 'copiar', texto: T('Duplicar'), attr: 'data-duplicar="' + r.id + '"' },
      { icono: 'compartir', texto: T('Compartir'), attr: 'data-compartir="' + r.id + '"' },
      { icono: 'trash', texto: T('Borrar'), tono: 'malo', attr: 'data-borrar="' + r.id + '"' }
    ], [
      { icono: 'edit', texto: T('Renombrar'), tono: 'suave',
        attr: 'data-renombrarrutina="' + r.id + '"' },
      { icono: 'lista', texto: 'Editar', tono: 'suave',
        attr: 'data-open="' + r.id + '"' }
    ]);
  }

  /* Lo que hace falta para que una tarjeta de rutina funcione: abrirla, cerrarla,
     entrar a un ejercicio y moverla de dia. Lo ataba solo la pantalla de Rutinas,
     asi que la de la portada no se podia ni abrir ni cerrar ahi: se quedaba con
     lo que hubiera abierto en la otra pantalla. */
  function bindTarjetaRutina(root) {
    bindAll(root, '[data-desplegar]', function (el) {
      const id = el.dataset.desplegar;
      const amb = el.dataset.ambito || 'rutinas';
      rutinaAbierta[amb] = rutinaAbierta[amb] === id ? null : id;
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    });

    bindAll(root, '[data-ver]', function (el) {
      const ex = Data.get(el.dataset.ver);
      if (ex) exerciseSheet(ex);
    });

    /* Mover una rutina de dia sin entrar a editarla: es el cambio que mas se
       hace y estaba tres pantallas adentro. */
    bindAll(root, '[data-rdia]', function (el) {
      const r = Store.routine(el.dataset.rid);
      if (!r) return;
      const d = el.dataset.rdia;
      const dias = (r.days || []).slice();
      const i = dias.indexOf(d);
      if (i === -1) dias.push(d); else dias.splice(i, 1);
      dias.sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); });
      r.days = dias;
      renombrarPorDia(r);
      Store.saveRoutine(r);
      refrescarActiva(r);
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
      UI.toast(dias.length
        ? nombreRutina(r) + ': ' + UI.diasLargos(dias)
        : Tn('{rutina} se queda sin día', { rutina: nombreRutina(r) }));
    });
  }

  viewInicio.mount = function (root) {
    /* Marcar el menú de hoy desde aquí mismo, con el mismo módulo que
       Alimentación y «mi día». */
    if (g.Marcar) Marcar.bind(root);

    recordarSecciones(root);
    bind(root, '[data-a=cerrarSaludo]', function () { Saludo.descartar(); render(); });
    bind(root, '[data-a=irCuenta]', function () { go('cuenta'); });
    bind(root, '[data-a=resume]', function () { go('entrenar'); });
    bind(root, '[data-a=empezarlibre]', function () {
      Workout.startLibre();
      go('entrenar');
      UI.toast(T('Cronómetro en marcha'));
    });

    /* El botón grande arrancaba siempre un entrenamiento libre, aunque hubiera
       una rutina puesta para hoy: había que bajar a la tarjeta y pulsar
       Entrenar, y quien no lo supiera acababa entrenando a mano lo que ya
       tenía programado. */
    bind(root, '[data-a=entrenarhoy]', function () {
      const deHoy = rutinasDeHoy();
      if (!deHoy.length) return;
      if (deHoy.length === 1) { empezar(deHoy[0].id); return; }

      UI.modal(html`
        <h2>${T('¿Cuál de las de hoy?')}</h2>
        <p class="muted">${Tn('Tienes {n} rutinas puestas para {dia}.',
          { n: deHoy.length, dia: UI.diaLargo(hoy).toLowerCase() })}</p>
        <div class="list">
          ${raw(deHoy.map(function (r) {
            return '<div class="list-row tap" data-elige="' + esc(r.id) + '">' +
              '<div class="grow"><div class="list-row-title">' + esc(tituloRutina(r)) + '</div>' +
              '<div class="list-row-sub">' +
                esc(Tp(r.exercises.length, '{n} ejercicio', '{n} ejercicios')) + '</div></div>' +
              '<span class="chevron">' + icon('chevron') + '</span></div>';
          }).join(''))}
        </div>`,
        function (el) {
          el.querySelectorAll('[data-elige]').forEach(function (b) {
            b.onclick = function () { UI.closeModal(); empezar(b.dataset.elige); };
          });
        });
    });
    bind(root, '[data-a=nueva]', function () { go('rutina', 'nueva'); });
    bind(root, '[data-a=programa]', function () { go('programa'); });
    bind(root, '[data-a=plantillas]', function () { go('rutinas'); });
    bind(root, '[data-a=verprogreso]', function () { go('progreso'); });
    bind(root, '[data-a=irnutricion]', function () { go('nutricion'); });
    bind(root, '[data-a=verdia]', function () { go('dia'); });
    /* Lo que hiciste hoy, entero: los ejercicios que marcaste, con sus pesos y
       repeticiones, los músculos que tocaste y el resumen. Es la misma hoja que
       abre un día del mapa de Progreso. */
    bind(root, '[data-a=verhecho]', function () {
      const v = g.VISTAS && g.VISTAS.progreso;
      if (v && v.hojaDia) v.hojaDia(Store.dayKey(Date.now()));
    });
    bind(root, '[data-a=comidamano]', function () {
      if (g.VISTAS && VISTAS.comidaAMano) VISTAS.comidaAMano();
    });

    /* La cámara, a un toque desde la portada: es lo que más veces al día se
       hace y estaba dos pantallas adentro. */
    const campoFoto = root.querySelector('#foto-inicio');
    if (campoFoto) campoFoto.onchange = function () {
      const file = campoFoto.files && campoFoto.files[0];
      campoFoto.value = '';        // si no, elegir dos veces la misma foto no dispara nada
      if (file && VISTAS.mirarFotoComida) VISTAS.mirarFotoComida(file);
    };
    bind(root, '[data-a=irperfil]', function () { go('perfil'); });
    bind(root, '[data-a=apuntar]', apuntarActividad);
    bindTarjetaRutina(root);

    /* Siempre abierta por hoy, también al volver de otra pestaña, y cada día
       se puede tocar para ver qué pasó. Lo lleva todo dia.js, que es de donde
       sale la tira: dos sitios acordándose de lo mismo por separado es un
       sitio que se olvida. */
    if (g.VISTAS && VISTAS.dia && VISTAS.dia.bindTira) VISTAS.dia.bindTira(root);

    /* El aviso de carga se abre y se cierra. Va aquí y no donde contesta la IA
       porque el aviso de regla sale siempre, con entrenador o sin él.

       Se para el toque: esto vive pegado a la tarjeta de entrenar, y cualquier
       toque suelto por ahí arranca el entrenamiento. */
    const masCarga = root.querySelector('#carga-mas');
    const cuerpoCarga = root.querySelector('#carga-cuerpo');
    if (masCarga && cuerpoCarga) {
      masCarga.onclick = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const abierto = !cuerpoCarga.classList.contains('recortada');
        cuerpoCarga.classList.toggle('recortada', abierto);
        masCarga.textContent = abierto ? T('Ver más') : T('Ver menos');
      };
    }

    /* Los aros y los hilos crecen al entrar. Un fotograma después de pintar,
       que si se pone en el mismo el navegador junta los dos valores y no hay
       transición. */
    requestAnimationFrame(function () {
      root.querySelectorAll('.aro-arco[data-arco]').forEach(function (arco, i) {
        arco.style.transitionDelay = (i * 90) + 'ms';
        arco.setAttribute('stroke-dasharray', arco.dataset.arco);
      });
      root.querySelectorAll('.rs-llena[data-llena]').forEach(function (hilo, i) {
        hilo.style.transitionDelay = (i * 90) + 'ms';
        hilo.style.width = hilo.dataset.llena;
      });
    });

    pintarCargaIA(root);

    /* La frase se pide una vez por sesión de la app y se queda. Si falla o no
       hay entrenador, la portada vale igual: se queda la línea de siempre. */
    if (!frasePortada && !pidiendoFrasePortada && g.IA && IA.activa() && IA.pildora) {
      pidiendoFrasePortada = true;
      IA.pildora().then(function (t) {
        frasePortada = String((t && t.frase) || '').trim();
        pidiendoFrasePortada = false;
        if (frasePortada && route.name === 'inicio') render();
      }).catch(function () { pidiendoFrasePortada = false; });
    }

    /* La versión solo habla cuando hay algo que hacer. «Training FR v273 · al
       día» ocupaba un renglón de la portada para no decir nada: quien quiera
       saber su versión la tiene en Perfil, con su punto ámbar cuando hay una
       nueva. Si la hay, aquí sale el botón para cogerla, porque el aviso
       automático depende de que el navegador se digne a mirar y con la app
       instalada eso puede tardar días. */
    const pie = root.querySelector('#pie-version');
    if (pie) {
      estadoVersion().then(function (v) {
        /* Sin red no se sabe si hay otra, y «hay una versión nueva» sin
           poder comprobarlo es inventarse una alarma. */
        if (!v || !v.local || v.alDia || v.sinRed) {
          pie.textContent = ''; pie.hidden = true; return;
        }
        const corto = function (x) { return String(x).replace('trainingfr-', ''); };
        pie.hidden = false;
        pie.className = 'pie-version hay-nueva';
        pie.innerHTML = '<b>' + esc(Tn('Hay una versión nueva: {v}',
          { v: corto(v.servidor) })) + '</b>' +
          '<span>' + esc(Tn('Tú tienes la {v}. Toca para actualizar; tus datos no se tocan.',
          { v: corto(v.local) })) + '</span>';
        pie.onclick = function () {
          pie.innerHTML = '<b>' + esc(T('Actualizando…')) + '</b>';
          forzarActualizacion();
        };
      });
    }
    bindAll(root, '[data-open]', function (el) { go('rutina', el.dataset.open); });
    bindAll(root, '[data-train]', function (el) { empezar(el.dataset.train); });
    bindAll(root, '[data-iarutina]', function (el) { auditarDesdeLista(el.dataset.iarutina); });
    bindAll(root, '[data-zona]', function (el) { irAZona(el.dataset.zona); });
  };

  /* Abre el catálogo centrado en una zona del cuerpo */
  function irAZona(id) {
    exFilters = { q: '', group: id, muscle: '', equipment: '', level: '', tipo: '', favs: false, todo: exFilters.todo };
    exLimit = 40;
    go('ejercicios');
    window.scrollTo(0, 0);
  }

  function empezar(routineId) {
    const r = Store.routine(routineId);
    if (!r) return;
    if (!r.exercises.length) { UI.toast(T('Añade ejercicios a la rutina antes de entrenar')); return; }

    const run = function () { Workout.start(r); go('entrenar'); };

    /* Si venía de un entrenamiento libre, la rutina se suma a lo que ya lleva:
       el cronómetro no se reinicia y no se pierde nada. */
    const activa = Store.active();
    if (activa && activa.libre) {
      Workout.cargar(r);
      go('entrenar');
      UI.toast(Tn('«{que}» añadida al entrenamiento en curso',
        { que: r.name || T('Rutina') }));
      return;
    }

    if (Workout.isActive()) {
      UI.confirm(T('Ya hay un entrenamiento en curso'),
        T('Si empiezas otro, se descartará el que tienes a medias.'), T('Empezar de nuevo'), true)
        .then(function (ok) { if (ok) { Workout.discard(); run(); } });
    } else run();
  }

  /* ================= ejercicios ================= */

  function gearActual() {
    return exFilters.todo ? '' : (Store.settings().gear || '');
  }

  /* La zona del cuerpo que se está mirando, venga del chip o de lo buscado */
  function regionActual() {
    if (exFilters.muscle || exFilters.favs) return null;
    const z = exFilters.q ? I18N.zona(exFilters.q) : null;
    if (z) return z.tipo === 'region' ? z.region : null;
    if (exFilters.q) return null;
    return I18N.region(exFilters.group);
  }

  /* Todos los músculos del catálogo, en el orden en que se muestran */
  function todosLosMusculos() {
    return I18N.GROUPS.reduce(function (acc, gr) { return acc.concat(gr.muscles); }, []);
  }

  /* Cuántos filtros hay puestos. Va en el botón, que es lo que evita el
     «¿por qué salen tan pocos?» cuando uno se deja algo marcado de ayer. */
  function cuantosFiltros() {
    let n = 0;
    if (exFilters.group) n++;
    if (exFilters.muscle) n++;
    if (exFilters.tipo) n++;
    if (exFilters.equipment) n++;
    if (exFilters.level) n++;
    if (exFilters.favs) n++;
    return n;
  }

  /* Lo que hay puesto, en fichas que se quitan tocando. Antes había tres filas
     de chips y dos desplegables SIEMPRE en pantalla —cuatro filas de mandos
     antes de ver un solo ejercicio, y la mitad cortados por el borde—. Ahora
     solo se ve lo que está puesto, y si no hay nada puesto no se ve nada. */
  function chipsActivosHTML() {
    const fichas = [];
    if (exFilters.favs) fichas.push(['favs', T('Favoritos')]);
    if (exFilters.group) {
      const gr = I18N.GROUPS.filter(function (x) { return x.id === exFilters.group; })[0];
      if (gr) fichas.push(['group', T(gr.label)]);
    }
    if (exFilters.muscle) fichas.push(['muscle', I18N.muscle(exFilters.muscle)]);
    if (exFilters.tipo) {
      const t = Data.TIPOS.filter(function (x) { return x.id === exFilters.tipo; })[0];
      if (t) fichas.push(['tipo', T(t.label)]);
    }
    if (exFilters.equipment) fichas.push(['equipment', I18N.equip(exFilters.equipment)]);
    if (exFilters.level) fichas.push(['level', I18N.level(exFilters.level)]);
    if (!fichas.length) return '';

    return '<div class="pill-scroll" style="margin-bottom:12px">' +
      fichas.map(function (f) {
        return '<button class="chip on" data-quitar="' + f[0] + '">' + esc(f[1]) +
          ' <span style="opacity:.65">\u00d7</span></button>';
      }).join('') +
      (fichas.length > 1
        ? '<button class="chip" data-a="limpiar">' + esc(T('Quitar todo')) +
          '</button>' : '') +
      '</div>';
  }

  /* Todos los filtros en una hoja, que es donde estorban menos. Con fichas y no
     con desplegables del navegador: un select del sistema en medio de la
     pantalla es justo lo que hace que una app parezca hecha a mano. */
  /* ---------- el filtro de ejercicios ----------
     Eran cinco bloques de píldoras idénticas, treinta y cinco en total: una
     pared de palabras donde todo pesa lo mismo y nada guía. Ahora:

     - La zona del cuerpo se elige sobre el cuerpo. Es la decisión principal y
       merece ser lo único grande de la hoja; además un dibujo dice qué es
       «core» mejor que la palabra.
     - Material y nivel viven plegados con su valor a la derecha: son trece y
       cuatro opciones que casi nunca se tocan, y ocupaban media pantalla.
     - Lo que es sí o no —favoritos, mi material— se pregunta con un conmutador,
       que es lo que significa, y no con una píldora que hay que adivinar si
       está encendida.
     - El botón dice cuántos ejercicios vas a ver y el número cambia al tocar,
       así que uno sabe si se ha pasado de filtros antes de cerrar.

     Y ya no se cierra y se vuelve a abrir la hoja en cada toque: se actualiza
     donde está. */
  function filtrosSheet() {
    const gear = gearActual();

    const equipos = Object.keys(I18N.EQUIP).filter(function (k) {
      return !gear || Data.gearAllows(gear, k);
    });

    /* De frente casi todo; la espalda solo se ve de espaldas. */
    const VISTA_ZONA = { espalda: 'd', hombro: 'd' };

    let turno = 0;
    const casillaZona = function (id, label, musculos) {
      const activa = id ? exFilters.group === id && !exFilters.muscle
        : !exFilters.group && !exFilters.muscle;
      /* El turno sirve para que entren una detras de otra, no las siete de
         golpe: treinta milisegundos entre casilla y casilla. */
      return '<button class="zona-tile' + (activa ? ' on' : '') +
        '" style="--turno:' + (turno++) + '" data-f-grp="' + id + '">' +
        (g.Musculos ? Musculos.una(musculos, VISTA_ZONA[id] || 'f') : '') +
        '<span>' + esc(label) + '</span></button>';
    };

    const todosMusculos = I18N.GROUPS.reduce(function (a, gr) {
      return a.concat(gr.muscles);
    }, []);

    /* Una opción de una lista de una sola elección. La fila entera se toca y la
       puesta lleva su marca a la derecha.

       Eran píldoras. Con diez tipos de trabajo y trece materiales eso son tres
       y cuatro renglones de burbujas por grupo, y la hoja de filtrar no cabía
       en la pantalla. Y encendida o apagada una píldora se distingue solo por
       el color, que en un grupo de trece se convierte en buscar cuál era. */
    const opcion = function (attr, valor, texto, activo) {
      return '<button class="filtro-op' + (activo ? ' on' : '') + '" data-' + attr + '="' +
        esc(valor) + '"><span class="grow">' + esc(texto) + '</span>' +
        '<span class="filtro-tick">' + icon('check') + '</span></button>';
    };

    /* Lo que dice la fila plegada: el valor puesto, para no tener que abrirla
       para saberlo. */
    const etiquetaTipo = function (id) {
      const t = Data.TIPOS.filter(function (x) { return x.id === id; })[0];
      return t ? T(t.label) : T('Todo');
    };

    const tituloGrupo = function (t) {
      return '<div class="tiny filtro-tit">' + t + '</div>';
    };

    UI.modal(html`
      <h2>${T('Filtrar')}</h2>

      ${raw(tituloGrupo(T('ZONA DEL CUERPO')))}
      <div class="zona-rejilla">
        ${raw(casillaZona('', T('Todas'), todosMusculos))}
        ${raw(I18N.GROUPS.map(function (gr) {
          return casillaZona(gr.id, T(gr.label), gr.muscles);
        }).join(''))}
      </div>

      <!-- Los tres, plegados y con su valor a la derecha. Antes «Tipo de
           trabajo» iba suelto y siempre abierto, y los otros dos se abrían a
           una pared de burbujas: entre los tres llenaban la pantalla y había
           que rodar para llegar al botón de ver. -->
      <details class="plegable-fino fila-plegable" data-mas="tipo">
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="grow">${T('Tipo de trabajo')}</span>
          <span class="tiny nowrap" data-valor="tipo"></span>
        </summary>
        <div class="fino-cuerpo">
          <div class="filtro-lista">
            ${raw(opcion('f-tipo', '', T('Todo'), !exFilters.tipo))}
            ${raw(Data.TIPOS.map(function (t) {
              return opcion('f-tipo', t.id, T(t.label), exFilters.tipo === t.id);
            }).join(''))}
          </div>
        </div>
      </details>

      <details class="plegable-fino fila-plegable" data-mas="eq">
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="grow">${T('Material')}</span>
          <span class="tiny nowrap" data-valor="eq"></span>
        </summary>
        <div class="fino-cuerpo">
          <div class="filtro-lista">
            ${raw(opcion('f-eq', '', T('Todo'), !exFilters.equipment))}
            ${raw(equipos.map(function (k) {
              return opcion('f-eq', k, I18N.equip(k), exFilters.equipment === k);
            }).join(''))}
          </div>
        </div>
      </details>

      <details class="plegable-fino fila-plegable" data-mas="lv">
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="grow">${T('Nivel')}</span>
          <span class="tiny nowrap" data-valor="lv"></span>
        </summary>
        <div class="fino-cuerpo">
          <div class="filtro-lista">
            ${raw(opcion('f-lv', '', T('Cualquiera'), !exFilters.level))}
            ${raw(Object.keys(I18N.LEVEL).map(function (k) {
              return opcion('f-lv', k, I18N.level(k), exFilters.level === k);
            }).join(''))}
          </div>
        </div>
      </details>

      <div class="filtro-sw">
        <div class="row between" data-f-favs="1">
          <div class="grow">
            <div class="filtro-sw-t">${T('Solo mis favoritos')}</div>
            <div class="tiny">${T('Los que has marcado con la estrella')}</div>
          </div>
          <span class="sw ${exFilters.favs ? 'on' : ''}" data-sw="favs"></span>
        </div>

        ${raw(Store.settings().gear === 'todo' ? '' : html`
        <div class="row between" data-f-todo="1">
          <div class="grow">
            <div class="filtro-sw-t">${T('Solo lo que puedo hacer')}</div>
            <div class="tiny">${Tn('Con el material que tienes {donde}',
              { donde: Data.gearFrase(Store.settings().gear) })}</div>
          </div>
          <span class="sw ${exFilters.todo ? '' : 'on'}" data-sw="todo"></span>
        </div>`)}
      </div>

      <button class="btn primary block" id="f-ver" style="margin-top:18px"></button>
      <button class="btn ghost block sm" id="f-limpiar" style="margin-top:8px" hidden>
        ${T('Quitar los filtros')}</button>`,
      function (el) {
        /* La hoja se apoya sobre la pantalla de ejercicios: si es translucida y
           desenfoca lo de detras, se ve de donde sale. */
        el.classList.add('hoja-vidrio');

        const btnVer = el.querySelector('#f-ver');
        const btnLimpiar = el.querySelector('#f-limpiar');

        /* Repinta lo que cambia sin cerrar la hoja. Antes cada toque la cerraba,
           repintaba la página de detrás y la volvía a abrir: se veía el salto y
           se perdía el sitio. */
        const refrescar = function () {
          const marca = function (attr, valor) {
            el.querySelectorAll('[data-' + attr + ']').forEach(function (b) {
              b.classList.toggle('on', (b.dataset[attr.replace(/-(\w)/g, function (x, c) {
                return c.toUpperCase();
              })] || '') === (valor || ''));
            });
          };
          marca('f-tipo', exFilters.tipo);
          marca('f-eq', exFilters.equipment);
          marca('f-lv', exFilters.level);

          el.querySelectorAll('[data-f-grp]').forEach(function (b) {
            b.classList.toggle('on', !exFilters.muscle &&
              (b.dataset.fGrp || '') === (exFilters.group || ''));
          });

          el.querySelector('[data-valor="tipo"]').textContent = etiquetaTipo(exFilters.tipo);
          el.querySelector('[data-valor="eq"]').textContent =
            exFilters.equipment ? I18N.equip(exFilters.equipment) : T('Todo');
          el.querySelector('[data-valor="lv"]').textContent =
            exFilters.level ? I18N.level(exFilters.level) : T('Cualquiera');

          const swFavs = el.querySelector('[data-sw="favs"]');
          if (swFavs) swFavs.classList.toggle('on', !!exFilters.favs);
          const swTodo = el.querySelector('[data-sw="todo"]');
          if (swTodo) swTodo.classList.toggle('on', !exFilters.todo);

          const n = Data.search(loQueSeMira().base).length;
          btnVer.textContent = !n ? T('No hay ninguno así')
            : n === 1 ? T('Ver el ejercicio') : Tn('Ver {n} ejercicios', { n: UI.num(n) });
          btnVer.disabled = !n;
          btnLimpiar.hidden = !cuantosFiltros();
        };

        bindAll(el, '[data-f-grp]', function (b) {
          exFilters.group = b.dataset.fGrp; exFilters.muscle = ''; exFilters.q = '';
          exFilters.favs = false;
          refrescar();

          /* El brillo cruza la casilla que se acaba de elegir. Hay que quitar y
             volver a poner la clase —y forzar un calculo de estilo en medio—
             porque una animacion no se repite sola si la clase ya estaba. */
          el.querySelectorAll('.zona-tile').forEach(function (t) {
            t.classList.remove('brilla');
          });
          void b.offsetWidth;
          b.classList.add('brilla');
        });
        /* Elegida una, el grupo se cierra solo: ya has contestado a esa pregunta
           y la fila plegada dice lo que pusiste. Abierto, la lista de trece
           materiales tapa el resto de la hoja y hay que cerrarla a mano para
           seguir, que es un toque de más en cada filtro.

           Con un respiro de por medio, no al instante: la marca tarda .14s en
           encenderse, y cerrar antes deja la sensación de que se ha cerrado sin
           enterarse de qué elegiste. */
        const cerrarGrupo = function (b) {
          const caja = b.closest('details');
          if (caja) setTimeout(function () { caja.open = false; }, 200);
        };
        bindAll(el, '[data-f-tipo]', function (b) {
          exFilters.tipo = b.dataset.fTipo; refrescar(); cerrarGrupo(b);
        });
        bindAll(el, '[data-f-eq]', function (b) {
          exFilters.equipment = b.dataset.fEq; refrescar(); cerrarGrupo(b);
        });
        bindAll(el, '[data-f-lv]', function (b) {
          exFilters.level = b.dataset.fLv; refrescar(); cerrarGrupo(b);
        });

        bind(el, '[data-f-favs]', function () {
          exFilters.favs = !exFilters.favs;
          if (exFilters.favs) { exFilters.group = ''; exFilters.muscle = ''; }
          refrescar();
        });
        bind(el, '[data-f-todo]', function () { exFilters.todo = !exFilters.todo; refrescar(); });

        btnVer.onclick = function () {
          UI.closeModal(); exLimit = 40; render(); window.scrollTo(0, 0);
        };
        btnLimpiar.onclick = function () {
          exFilters = { q: '', group: '', muscle: '', equipment: '', level: '', tipo: '',
            favs: false, todo: exFilters.todo };
          UI.closeModal(); exLimit = 40; render(); window.scrollTo(0, 0);
        };

        refrescar();
      });
  }

  /* Qué se está mirando ahora mismo en Ejercicios.
     Lo usan la pantalla y el contador del filtro; con el cálculo escrito dos
     veces, el número del botón y el de la lista acabarían discrepando. */
  function loQueSeMira() {
    const gear = gearActual();

    /* Escribir "pierna" o "femoral" no es buscar esas palabras en los nombres:
       es querer entrenar esa zona. Se convierte en filtro, no en texto suelto. */
    const zonaQ = exFilters.q && !exFilters.favs ? I18N.zona(exFilters.q) : null;
    const musculoQ = zonaQ && zonaQ.tipo === 'musculo' ? zonaQ.muscle : '';
    const musculo = exFilters.muscle || musculoQ;

    /* La zona activa: del texto buscado o del chip de grupo */
    const region = zonaQ && zonaQ.tipo === 'region' ? zonaQ.region
      : (!musculo && !exFilters.favs ? I18N.region(exFilters.group) : null);

    return {
      gear: gear, zonaQ: zonaQ, musculo: musculo, region: region,
      base: {
        q: zonaQ ? '' : exFilters.q,
        group: region ? '' : exFilters.group,
        muscles: region ? region.muscles : null,
        muscle: musculo,
        equipment: exFilters.equipment, level: exFilters.level, tipo: exFilters.tipo,
        favs: exFilters.favs, gear: gear
      }
    };
  }

  function viewEjercicios() {
    const mirando = loQueSeMira();
    const gear = mirando.gear;
    const zonaQ = mirando.zonaQ;
    const musculo = mirando.musculo;
    const region = mirando.region;
    const base = mirando.base;
    const res = Data.search(base);

    /* Se segmenta por músculo salvo que se esté mirando un músculo concreto */
    /* Repartir por músculo ayuda con el catálogo entero, pero con un tipo
       elegido —el rodillo son once ejercicios— salían ocho carruseles de uno.
       Ahí se enseña la rejilla de golpe. */
    const segmentar = !musculo && !base.q && !exFilters.favs && !exFilters.equipment
      && (!exFilters.tipo || res.length > 40);
    const lugar = Data.gearFrase(Store.settings().gear);

    const musculos = region ? region.muscles : todosLosMusculos();
    const secciones = segmentar ? musculos.map(function (m) {
      return { muscle: m, lista: Data.search(Object.assign({}, base, { muscles: null, muscle: m })) };
    }).filter(function (s) { return s.lista.length; }) : [];

    /* Con una zona elegida se puede entrenar entera de una vez, que es lo
       normal: nadie va al gimnasio a hacer solo gemelo. */
    const musculosSesion = region ? (region.entreno || region.muscles) : [];
    const tarjetaZona = region && secciones.length && musculosSesion.length > 1 ? html`
      <div class="card zona-card">
        <div class="row between" style="align-items:flex-start">
          <div class="grow">
            <div class="tiny" style="color:var(--acc)">${T('SESIÓN COMPLETA')}</div>
            <div style="font-weight:700;margin:2px 0">${Tn('Entrenar {z} hoy',
              { z: T(region.label).toLowerCase() })}</div>
            <div class="tiny">${Tn('Reparto la sesión entre {m}',
              { m: musculosSesion.map(function (m) {
                  return I18N.muscle(m).toLowerCase();
                }).join(', ') })}</div>
          </div>
          <button class="btn primary sm" data-a="sesionzona">${raw(icon('play'))} ${T('Crear')}</button>
        </div>
      </div>` : '';

    /* Con el sitio en «Ver todo» el catálogo ya está entero: el interruptor sobra */
    const sinFiltro = exFilters.todo || Store.settings().gear === 'todo';

    const puestos = cuantosFiltros();

    return html`
      <div class="row between">
        <h1 style="margin:0">${T('Ejercicios')}</h1>
        <button class="btn-filtro${puestos ? ' on' : ''}" data-a="filtros">
          ${raw(icon('filtro'))} ${T('Filtro')}${raw(puestos
            ? '<span class="bf-num">' + puestos + '</span>' : '')}
        </button>
      </div>
      <!-- Una línea y de las pequeñas: eran dos renglones de texto grande
           contando lo que se ve solo en cuanto bajas un dedo. -->
      <p class="tiny ej-sub">${Tn('{n} ejercicios', { n: UI.num(res.length) })} · ${raw(sinFiltro
        ? esc(T('catálogo completo')) : esc(lugar))}</p>

      <div class="search-wrap" style="margin-bottom:10px">
        ${raw(icon('search'))}
        <input id="ex-q" type="search" placeholder="${T('Buscar: pierna, femoral, peso muerto…')}"
               value="${exFilters.q}" autocomplete="off">
      </div>

      ${raw(chipsActivosHTML())}

      ${raw(exFilters.tipo === 'yoga' ? html`
        <p class="tiny" style="margin:-2px 0 12px">48 posturas de
        <a href="https://github.com/alexcumplido/yoga-api" target="_blank" rel="noopener">Yoga API</a>.
        Ilustraciones CC0 y de Flaticon:
        <a href="https://www.flaticon.com/free-icons/easy" target="_blank" rel="noopener">Easy icons de monkik</a> y
        <a href="https://www.flaticon.com/free-icons/yoga" target="_blank" rel="noopener">Yoga icons de dDara</a>.</p>` : '')}

      ${raw(exFilters.tipo === 'pilates' ? html`
        <p class="tiny" style="margin:-2px 0 12px">${T('No existe ningún catálogo libre de pilates, así que estos están escogidos a mano del catálogo por lo que comparten con un mat de pilates: control del centro y trabajo de suelo.')}</p>` : '')}


      ${raw(zonaQ ? html`
        <p class="tiny" style="margin:-2px 0 10px">${raw(esc(Tn(
          'Has buscado una zona del cuerpo: te enseño {q}, no solo los que llevan esa palabra en el nombre.',
          { q: zonaQ.tipo === 'region'
              ? T('todos sus músculos por separado')
              : Tn('todos los ejercicios de {m}',
                  { m: I18N.muscle(musculo).toLowerCase() }) })))}</p>` : '')}


      ${raw(tarjetaZona)}


      ${raw(segmentar ? secciones.map(function (s) {
        return html`
          <div class="list-head">
            <span class="list-title">${I18N.muscle(s.muscle)}
              <span style="opacity:.6">${s.lista.length}</span></span>
            <button class="btn sm ghost" data-vermusculo="${s.muscle}">${T('Ver todos')}</button>
          </div>
          <div class="carousel">
            ${raw(s.lista.slice(0, 12).map(exCard).join(''))}
            ${raw(s.lista.length > 12
              ? '<button class="ex-card more" data-vermusculo="' + esc(s.muscle) + '">' +
                '<b>+' + (s.lista.length - 12) + '</b><span>' + esc(T('ver todos')) + '</span></button>'
              : '')}
          </div>`;
      }).join('') : '')}

      ${raw(!segmentar ? (res.length ? html`
        <div class="grid">${raw(res.slice(0, exLimit).map(exCard).join(''))}</div>
        ${raw(res.length > exLimit
          ? '<button class="btn block" data-a="mas" style="margin-top:14px">' +
            esc(Tn('Ver más ({n} restantes)', { n: res.length - exLimit })) + '</button>' : '')}`
      : html`<div class="empty">${raw(icon('search'))}
          <p>${gear && !sinFiltro
            ? Tn('Ningún ejercicio coincide entre los que puedes hacer {donde}.',
                { donde: lugar })
            : T('Ningún ejercicio coincide.')}</p>
          <div class="row" style="justify-content:center;gap:8px">
            <button class="btn sm" data-a="limpiar">${T('Limpiar filtros')}</button>
            ${raw(gear && !sinFiltro ? '<button class="btn sm primary" data-a="togglegear">' +
              esc(T('Buscar en todo el catálogo')) + '</button>' : '')}
          </div>
        </div>`) : '')}

      ${raw(segmentar && !secciones.length
        ? '<div class="empty"><p>' + esc(T('No hay ejercicios para este filtro.')) +
          '</p></div>' : '')}`;
  }

  function exCard(ex) {
    return html`
      <button class="ex-card" data-ex="${ex.id}">
        <div class="ex-thumb">
          <img src="${Data.img(ex, 0)}" alt="${ex.nameEs}" loading="lazy" decoding="async">
          <span class="lvl">${I18N.level(ex.level)}</span>
        </div>
        <div class="ex-body">
          <div class="ex-name">${ex.nameEs}</div>
          <div class="ex-sub">${ex.primaryMuscles.map(I18N.muscle).join(', ')} · ${I18N.equip(ex.equipment)}</div>
        </div>
      </button>`;
  }

  viewEjercicios.mount = function (root) {
    const q = root.querySelector('#ex-q');
    let deb = null;
    q.oninput = function () {
      clearTimeout(deb);
      deb = setTimeout(function () {
        exFilters.q = q.value; exLimit = 40;
        const pos = window.scrollY;
        render();
        window.scrollTo(0, pos);
        const nq = document.querySelector('#ex-q');
        if (nq) { nq.focus(); nq.setSelectionRange(nq.value.length, nq.value.length); }
      }, 220);
    };

    bind(root, '[data-a=filtros]', function () { filtrosSheet(); });

    /* quitar un filtro desde su ficha */
    bindAll(root, '[data-quitar]', function (el) {
      const k = el.dataset.quitar;
      if (k === 'favs') exFilters.favs = false;
      else exFilters[k] = '';
      exLimit = 40; render();
    });
    bind(root, '[data-a=limpiar]', function () {
      exFilters = { q: '', group: '', muscle: '', equipment: '', level: '', tipo: '',
        favs: false, todo: exFilters.todo };
      exLimit = 40; render();
    });
    /* «Ver todos» lleva a la pantalla de la zona. Antes filtraba aquí mismo y
       te dejaba en el mismo sitio con menos cosas: ni sabías dónde estabas ni
       tenías dónde volver. */
    bindAll(root, '[data-vermusculo]', function (el) {
      go('zona', el.dataset.vermusculo);
    });
    bind(root, '[data-a=quitarmusculo]', function () { exFilters.muscle = ''; render(); });
    bind(root, '[data-a=sesionzona]', function () {
      const r = regionActual();
      if (r) sesionZonaSheet(r);
    });
    bindAll(root, '[data-a=togglegear]', function () {
      exFilters.todo = !exFilters.todo; exLimit = 40; render();
      UI.toast(exFilters.todo
        ? T('Mostrando el catálogo completo')
        : T('Mostrando solo lo que puedes hacer donde entrenas'));
    });
    bind(root, '[data-a=mas]', function () {
      exLimit += 40;
      const pos = window.scrollY; render(); window.scrollTo(0, pos);
    });
    bind(root, '[data-a=limpiar]', function () {
      exFilters = { q: '', group: '', muscle: '', equipment: '', level: '', tipo: '', favs: false, todo: exFilters.todo };
      exLimit = 40; render();
    });
    bindAll(root, '[data-ex]', function (el) { go('ejercicio', el.dataset.ex); });
  };

  /* ---- Sesión completa de una zona ----
     "Entrenar pierna" no es una lista de ejercicios de pierna: es una sesión
     repartida entre cuádriceps, isquiotibiales, glúteos y gemelos, con el
     compuesto delante. Se empieza en el momento o se guarda como rutina. */

  const SESION_MIN = [30, 45, 60, 75];
  const sesionOpts = { minutes: 45, goal: 'hipertrofia' };

  /* Lo entrenado hoy, para no repetirlo en la siguiente propuesta */
  function ejerciciosDeHoy() {
    const desde = new Date();
    desde.setHours(0, 0, 0, 0);
    const ids = [];
    Store.sessions().forEach(function (s) {
      if (s.start < desde.getTime()) return;
      (s.entries || []).forEach(function (e) { ids.push(e.exId); });
    });
    return ids;
  }

  function generarSesion(region, evitar) {
    return Planner.sesion({
      muscles: region.entreno || region.muscles,
      minutes: sesionOpts.minutes,
      gear: Store.settings().gear || 'gym',
      goal: sesionOpts.goal,
      level: planState.level,
      evitar: (evitar || []).concat(ejerciciosDeHoy())
    });
  }

  function sesionZonaSheet(region) {
    UI.modal(html`
      <h2>${Tn('Entrenar {zona}', { zona: T(region.label).toLowerCase() })}</h2>
      <p class="muted">${Tn('Monto una sesión equilibrada entre {musculos}. Empiezo ' +
        'por lo pesado y termino con lo accesorio.',
        { musculos: (region.entreno || region.muscles).map(function (m) {
          return I18N.muscle(m).toLowerCase();
        }).join(', ') })}</p>

      <div class="card">
        <b>${T('¿Cuánto tiempo tienes?')}</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw(SESION_MIN.map(function (m) {
            return '<button class="chip ' + (sesionOpts.minutes === m ? 'on' : '') +
              '" data-smin="' + m + '">' + esc(Tn('{n} min', { n: m })) + '</button>';
          }).join(''))}
        </div>
      </div>

      <div class="card">
        <b>${T('¿Con qué objetivo?')}</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw(Object.keys(Planner.GOALS).map(function (k) {
            return '<button class="chip ' + (sesionOpts.goal === k ? 'on' : '') +
              '" data-sgoal="' + k + '">' + esc(T(Planner.GOALS[k].label)) + '</button>';
          }).join(''))}
        </div>
      </div>

      <button class="btn primary block" data-a="crear">${T('Ver la sesión')}</button>`,
      function (el) {
        const elegir = function (attr, campo) {
          el.querySelectorAll('[' + attr + ']').forEach(function (b) {
            b.onclick = function () {
              const v = b.getAttribute(attr);
              sesionOpts[campo] = campo === 'minutes' ? Number(v) : v;
              el.querySelectorAll('[' + attr + ']').forEach(function (x) {
                x.classList.toggle('on', x === b);
              });
            };
          });
        };
        elegir('data-smin', 'minutes');
        elegir('data-sgoal', 'goal');

        el.querySelector('[data-a=crear]').onclick = function () {
          const ejercicios = generarSesion(region, []);
          if (!ejercicios.length) {
            UI.toast(T('No hay ejercicios de esa zona con tu material'));
            return;
          }
          previewSesionSheet(region, ejercicios);
        };
      });
  }

  function previewSesionSheet(region, ejercicios) {
    const nombre = T(region.label) + ' · ' + Tn('{n} min', { n: sesionOpts.minutes });
    const minutos = Planner.estimate({ exercises: ejercicios });

    UI.modal(html`
      <h2>${nombre}</h2>
      <p class="muted">${Tn('{n} ejercicios · unos {min} min · {objetivo}',
        { n: ejercicios.length, min: minutos,
          objetivo: T(Planner.GOALS[sesionOpts.goal].label).toLowerCase() })}</p>

      <div class="stack">
        ${raw(ejercicios.map(function (e) {
          const ex = Data.get(e.exId);
          return html`
            <div class="rt-item">
              <img src="${ex ? Data.img(ex, 0) : Data.PLACEHOLDER}" alt="" loading="lazy">
              <div class="grow">
                <div style="font-weight:600;font-size:.86rem">${ex ? ex.nameEs : e.exId}</div>
                <div class="tiny">${I18N.muscle(e.muscle)} · ${e.sets}×${e.reps}${raw(
                  ex ? ' · ' + esc(I18N.equip(ex.equipment)) : '')}</div>
              </div>
            </div>`;
        }).join(''))}
      </div>

      <div class="row" style="margin-top:14px">
        <button class="btn grow" data-a="otra">${T('Otra propuesta')}</button>
        <button class="btn primary grow" data-a="empezar">${raw(icon('play'))} ${T('Empezar')}</button>
      </div>
      <button class="btn ghost block" data-a="guardar" style="margin-top:8px">${T('Guardar como rutina')}</button>`,
      function (el) {
        el.querySelector('[data-a=otra]').onclick = function () {
          const otra = generarSesion(region, ejercicios.map(function (e) { return e.exId; }));
          previewSesionSheet(region, otra.length ? otra : ejercicios);
        };

        el.querySelector('[data-a=empezar]').onclick = function () {
          const rutina = { id: null, name: nombre, exercises: ejercicios };
          const lanzar = function () { UI.closeModal(); Workout.start(rutina); go('entrenar'); };

          /* si ya corre un entrenamiento libre, la sesión se le suma */
          const activa = Store.active();
          if (activa && activa.libre) {
            UI.closeModal();
            Workout.cargar(rutina);
            go('entrenar');
            UI.toast(T('Sesión añadida al entrenamiento en curso'));
            return;
          }

          if (Workout.isActive()) {
            UI.confirm(T('Ya hay un entrenamiento en curso'),
              T('Si empiezas otro, se descartará el que tienes a medias.'),
              T('Empezar de nuevo'), true)
              .then(function (ok) { if (ok) { Workout.discard(); lanzar(); } });
          } else lanzar();
        };

        el.querySelector('[data-a=guardar]').onclick = function () {
          const r = Store.saveRoutine({
            id: null, name: nombre,
            note: Tn('Sesión de {zona} generada automáticamente.',
              { zona: T(region.label).toLowerCase() }),
            days: [],
            exercises: ejercicios.map(function (e) {
              return { exId: e.exId, sets: e.sets, reps: e.reps, weight: 0, rest: e.rest, note: e.note };
            })
          });
          UI.closeModal();
          go('rutina', r.id);
          UI.toast(T('Guardada como rutina'));
        };
      });
  }

  /* ================= ficha de ejercicio ================= */

  /* Las dos etiquetas de la animación. Se leen al pintar, no al cargar el
     archivo, para que sigan al idioma. */
  function fases() { return [T('Posición inicial'), T('Posición final')]; }

  function viewEjercicio() {
    const ex = Data.get(route.arg);
    if (!ex) return '<div class="empty"><p>' + esc(T('Ejercicio no encontrado.')) + '</p></div>';

    const pr = Store.prOf(ex.id);
    const hist = Store.historyOf(ex.id).slice(0, 6);
    const fav = Store.isFav(ex.id);
    const guia = Tecnica.para(ex);
    const marcos = Data.frames(ex);

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">${raw(icon('back'))} ${T('Volver')}</button>

      ${raw(UI.demoHTML(ex, { speed: 900, fases: marcos.length > 1 ? fases() : null }))}

      <div class="row between" style="margin:14px 0 4px;align-items:flex-start">
        <div class="grow">
          <h1 style="margin-bottom:2px">${ex.nameEs}</h1>
          ${raw(ex.nameEs === ex.name ? '' : '<div class="tiny">' + esc(ex.name) + '</div>')}
        </div>
        <button class="btn icon ${fav ? 'primary' : ''}" data-a="fav"
                aria-label="${T('Marcar como favorito')}">${raw(icon('star'))}</button>
      </div>

      <div class="row wrap" style="gap:6px;margin:10px 0 14px">
        ${raw(ex.primaryMuscles.map(function (m) {
          return '<span class="chip solid">' + esc(I18N.muscle(m)) + '</span>';
        }).join(''))}
        ${raw(ex.secondaryMuscles.map(function (m) {
          return '<span class="chip">' + esc(I18N.muscle(m)) + '</span>';
        }).join(''))}
        <span class="chip">${I18N.equip(ex.equipment)}</span>
        <span class="chip">${I18N.level(ex.level)}</span>
        ${raw(ex.mechanic ? '<span class="chip">' + esc(I18N.mechanic(ex.mechanic)) + '</span>' : '')}
      </div>

      <div class="row">
        <button class="btn primary grow" data-a="addrutina">${raw(icon('plus'))} ${T('Añadir a rutina')}</button>
        <a class="btn" href="${Data.youtube(ex)}" target="_blank" rel="noopener noreferrer"
           aria-label="${T('Buscar vídeo en YouTube')}">${raw(icon('youtube'))}</a>
      </div>

      ${raw(g.Musculos ? Musculos.mapa(ex.primaryMuscles, ex.secondaryMuscles) : '')}

      ${raw(alternativasHTML(ex))}

      ${raw(marcos.length > 1 ? html`
        <div class="list-title">${T('El recorrido')}</div>
        <div class="marcos">
          <figure>
            <img src="${marcos[0]}" alt="${T('Posición inicial')}" loading="lazy">
            <figcaption><b>1</b> ${T('Posición inicial')}</figcaption>
          </figure>
          <figure>
            <img src="${marcos[1]}" alt="${T('Posición final')}" loading="lazy">
            <figcaption><b>2</b> ${T('Posición final')}</figcaption>
          </figure>
        </div>
        <p class="tiny" style="margin-top:8px">${T('El movimiento va del punto 1 al 2 y ' +
        'vuelve controlando la bajada. Arriba lo ves animado.')}</p>` : '')}

      ${raw(guia ? guiaHTML(guia) : html`
        <div class="list-title">${T('Cómo se ejecuta')}</div>
        <div class="card">
          <p class="muted">${T('Este ejercicio todavía no tiene guía propia. Abajo ' +
          'tienes las instrucciones del catálogo y el enlace a vídeos.')}</p>
        </div>`)}

      ${raw(instruccionesHTML(ex))}

      ${raw(pr.best ? html`
        <div class="list-title">${T('Tus marcas')}</div>
        <div class="stats">
          <div class="stat"><b>${UI.num(pr.best.weight)}</b><span>${Tn('Máx. {u}',
            { u: Store.settings().unit })}</span></div>
          <div class="stat"><b>${pr.best.reps}</b><span>${T('Reps de esa serie')}</span></div>
          ${raw(pr.orm ? '<div class="stat"><b>' + UI.num(pr.orm.orm) + '</b><span>' +
            esc(T('1RM estimado')) + '</span></div>' : '')}
        </div>` : '')}

      ${raw(hist.length ? html`
        <div class="list-title">${T('Historial')}</div>
        <div class="stack">
          ${raw(hist.map(function (h) {
            return html`<div class="card row between">
              <div class="tiny">${UI.fecha(h.date)}</div>
              <div style="font-size:.9rem;font-weight:600">${h.sets.map(function (s) {
                return UI.num(s.weight) + '×' + s.reps;
              }).join(' · ')}</div>
            </div>`;
          }).join(''))}
        </div>` : '')}`;
  }

  /* ---- Alternativas ----
     La máquina está ocupada, el banco pillado o no tienes ese material: aquí
     está el mismo trabajo con otra cosa. Se prioriza lo que puedes hacer donde
     entrenas; si con tu material no sale nada, se enseña el resto avisando. */
  function alternativasHTML(ex) {
    if (!window.Alt) return '';
    const gear = Store.settings().gear || '';
    let lista = Alt.para(ex, { limite: 8, soloDisponible: !!gear });
    let fuera = false;
    if (lista.length < 2) {
      lista = Alt.para(ex, { limite: 8, gear: '' }).filter(function (a) {
        return !gear || !Data.gearAllows(gear, a.ex.equipment);
      });
      fuera = lista.length > 0;
    }
    if (!lista.length) return '';

    /* Decir qué músculo es y no «mismo trabajo»: la duda de quien mira esto es
       si va a entrenar lo mismo, y la respuesta se le da con el nombre. */
    const musculos = (ex.primaryMuscles || []).map(function (m) {
      return I18N.muscle(m).toLowerCase();
    }).join(T(' y '));

    return html`
      <div class="list-title">${T('Si está ocupado o no lo tienes')}</div>
      <p class="tiny" style="margin:-4px 0 10px">${raw(esc(musculos
        ? Tn('Entrenas el mismo músculo —{m}— con otra máquina, otro material u otro ' +
             'ejercicio.', { m: musculos })
        : T('Entrenas el mismo músculo con otra máquina, otro material u otro ejercicio.')))}
        ${raw(esc(fuera
          ? T('Con tu material no sale ninguno, así que estos son del catálogo completo.')
          : T('Toca cualquiera para ver su técnica.')))}</p>
      <div class="carousel">
        ${raw(lista.map(function (a) {
          return html`
            <button class="ex-card" data-ex="${a.ex.id}">
              <div class="ex-thumb">
                <img src="${Data.img(a.ex, 0)}" alt="${a.ex.nameEs}" loading="lazy" decoding="async">
                <span class="lvl">${I18N.equip(a.ex.equipment)}</span>
              </div>
              <div class="ex-body">
                <div class="ex-name">${a.ex.nameEs}</div>
                <div class="ex-sub">${a.motivo}</div>
              </div>
            </button>`;
        }).join(''))}
      </div>`;
  }

  /* La guía de técnica, que es lo que de verdad explica el ejercicio */
  /* Las guías de tecnica.js y calistenia.js están escritas en español y pasan
     todas por aquí, así que es el único sitio donde hay que traducirlas. El
     tempo —«2 s bajando · 1 s subiendo»— también, porque lleva palabras. */
  function guiaHTML(gu) {
    /* El texto de las guías no dice «la barra» a secas: escribe {carga}, y aquí
       se rellena con lo que de verdad tienes en la mano. Después de traducir y
       no antes: la clave del diccionario es la frase con el hueco puesto, así
       que sustituir primero la dejaría sin traducción. */
    /* Estas dos no pasan por el diccionario: no son una frase, son dos
       palabras que se empalman dentro de otra, y el diccionario va por
       frases enteras —«el peso» ya está en él queriendo decir otra cosa,
       lo que pesas—. Singular en los dos idiomas, para que el verbo de la
       frase que las recibe concuerde sin escribir dos versiones. */
    const en = g.Idioma && Idioma.actual() === 'en';
    const cual = gu.conBarra ? (en ? 'the bar' : 'la barra')
                             : (en ? 'the weight' : 'el peso');
    const Carga = cual.charAt(0).toUpperCase() + cual.slice(1);
    const C = function (txt) {
      return String(txt).split('{Carga}').join(Carga).split('{carga}').join(cual);
    };

    return html`
      <div class="list-title">${Tn('Cómo se hace · {que}', { que: T(gu.titulo) })}</div>

      <div class="card guia-bloque">
        <h3 class="guia-h">${raw(icon('perfil'))} ${T('Posición inicial')}</h3>
        <ol class="instr">
          ${raw(gu.inicial.map(function (p) { return '<li>' + esc(C(T(p))) + '</li>'; }).join(''))}
        </ol>
      </div>

      <div class="card guia-bloque">
        <h3 class="guia-h">${raw(icon('grafica'))} ${T('El recorrido')}</h3>
        ${raw(gu.recorrido.map(function (f) {
          return '<div class="fase-txt"><b>' + esc(T(f.fase)) + '</b><p>' +
            esc(C(T(f.texto))) + '</p></div>';
        }).join(''))}
      </div>

      <div class="card guia-bloque">
        <div class="guia-dato">
          <span class="row-icon">${raw(icon('gota'))}</span>
          <div><b>${T('Respiración')}</b><p>${C(T(gu.respiracion))}</p></div>
        </div>
        <div class="guia-dato">
          <span class="row-icon">${raw(icon('reloj'))}</span>
          <div><b>${T('Ritmo')}</b><p>${T(gu.tempo)}</p></div>
        </div>
      </div>

      <div class="card guia-bloque">
        <h3 class="guia-h">${raw(icon('close'))} ${T('Errores frecuentes')}</h3>
        ${raw(gu.errores.map(function (e) {
          return '<div class="error-item"><b>' + esc(C(T(e.fallo))) + '</b><p>' +
            esc(C(T(e.arreglo))) + '</p></div>';
        }).join(''))}
      </div>

      <div class="card destacado-clave">
        <h3 class="guia-h">${raw(icon('chispa'))} ${T('La clave')}</h3>
        <p style="margin:0">${C(T(gu.clave))}</p>
      </div>

      ${raw(gu.seguridad ? html`
        <div class="card aviso-seguridad">
          <b>${T('Seguridad')}</b>
          <p style="margin:4px 0 0">${T(gu.seguridad)}</p>
        </div>` : '')}`;
  }

  /* Las instrucciones originales quedan como material de apoyo, plegadas */
  function instruccionesHTML(ex) {
    if (!ex.instructions || !ex.instructions.length) return '';
    /* El catálogo viene en inglés: con la app en inglés no hay nada que
       traducir y se enseña tal cual, sin gastar una llamada a la IA. */
    const yaVale = enIngles() || ex.yaEnEspanol;
    const traducidas = yaVale ? null : traduccionGuardada(ex);
    const pasos = traducidas || ex.instructions;

    return html`
      <button class="guia-tit" data-a="verOriginal" style="margin-top:18px">
        ${raw(icon('chevron'))} ${T('Cómo se hace, paso a paso')}
      </button>
      <div class="guia" id="orig" hidden>
        <div class="card">
          <ol class="instr" id="instr">
            ${raw(pasos.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join(''))}
          </ol>
          ${raw(traducidas || yaVale ? ''
            : '<p class="tiny" id="tr-aviso" style="margin:10px 0 0">' +
            esc(T('Traduciendo del catálogo original…')) + '</p>')}
        </div>
      </div>`;
  }

  /* Con la app en inglés, el catálogo ya está en su idioma. */
  function enIngles() { return !!(g.Idioma && Idioma.actual() === 'en'); }

  viewEjercicio.mount = function (root) {
    const ex = Data.get(route.arg);
    if (!ex) return;

    bind(root, '[data-a=atras]', function () { history.back(); });
    bind(root, '[data-a=fav]', function (el) {
      const on = Store.toggleFav(ex.id);
      el.classList.toggle('primary', on);
      UI.toast(on ? T('Añadido a favoritos') : T('Quitado de favoritos'));
    });
    bind(root, '[data-a=addrutina]', function () { pickRoutineSheet(ex); });
    bindAll(root, '[data-ex]', function (el) { go('ejercicio', el.dataset.ex); window.scrollTo(0, 0); });
    /* Se traduce sola al abrir: el botón estaba dentro de un bloque plegado y
       casi nadie llegaba a pulsarlo. */
    if (enIngles() || ex.yaEnEspanol) return;
    asegurarTraduccion(ex).then(function (pasos) {
      if (!pasos) {
        const aviso = root.querySelector('#tr-aviso');
        if (aviso) aviso.textContent = T('No he podido traducirlas; las dejo como vienen.');
        return;
      }
      const lista = root.querySelector('#instr');
      if (lista) lista.innerHTML = pasos.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
      const aviso = root.querySelector('#tr-aviso');
      if (aviso) aviso.remove();
    });
    bind(root, '[data-a=verOriginal]', function (el) {
      const c = root.querySelector('#orig');
      if (c) { c.hidden = !c.hidden; el.classList.toggle('abierta', !c.hidden); }
    });
  };

  /* ---------- las instrucciones, en español ----------
     El catálogo viene en inglés y la traducción estaba escondida detrás de un
     botón, dentro de un bloque plegado: casi nadie llegaba, y la hoja rápida del
     entrenamiento —la que se abre a mitad de serie— enseñaba el inglés tal cual.

     Ahora se traduce sola al abrir la ficha y se guarda, así que solo se hace
     una vez por ejercicio. Si hay entrenador con IA se le pide a él, que traduce
     los pasos de golpe y entiende de qué va; si no, al servicio gratuito, que va
     frase a frase y a veces se atraganta. Si fallan los dos, se queda el
     original, que es mejor que nada. */
  const TR_PREFIJO = 'trainingfr.tr.';
  const traduciendo = {};

  function traduccionGuardada(ex) {
    /* Lo que ya viene escrito en español no tiene traducción válida posible, y
       si quedó una guardada de una versión anterior hay que ignorarla: el
       traductor automático convierte «Front lever» en «Palanca delantera» y
       destroza el nombre de la progresión. */
    if (!ex || ex.yaEnEspanol) return null;
    try {
      const v = localStorage.getItem(TR_PREFIJO + ex.id);
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  }

  function pasosDe(ex) {
    return traduccionGuardada(ex) || ex.instructions || [];
  }

  function guardarTraduccion(ex, pasos) {
    try { localStorage.setItem(TR_PREFIJO + ex.id, JSON.stringify(pasos)); }
    catch (e) { /* cuota llena: se traducirá otra vez, no es grave */ }
  }

  function traducirConIA(ex) {
    if (!g.IA || !IA.activa()) return Promise.reject(new Error('sin IA'));
    return IA.llamarJSON(
      'Traduce al español de España estas instrucciones de un ejercicio de gimnasio. ' +
      'Es lenguaje de sala: usa los términos que se usan aquí —escápulas, cadera, ' +
      'agarre, recorrido— y no traduzcas palabra por palabra. Una frase por paso, en ' +
      'el mismo orden y sin añadir ni quitar ninguno.\n\n' +
      'EJERCICIO: ' + ex.nameEs + '\n' +
      'PASOS:\n' + (ex.instructions || []).map(function (t, i) {
        return (i + 1) + ') ' + t;
      }).join('\n') + '\n\n' +
      'Devuelve JSON: {"pasos":["paso 1","paso 2"]}',
      { maxTokens: 2048, temperatura: 0.2 }
    ).then(function (r) {
      const pasos = (r && r.pasos) || [];
      if (pasos.length !== (ex.instructions || []).length) throw new Error('no cuadran');
      return pasos.map(function (t) { return String(t).trim(); });
    });
  }

  function traducirConServicio(ex) {
    return Promise.all((ex.instructions || []).map(function (frase) {
      const url = 'https://api.mymemory.translated.net/get?q=' +
        encodeURIComponent(frase.slice(0, 480)) + '&langpair=en|es';
      return fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (j) {
          const t = j && j.responseData && j.responseData.translatedText;
          if (!t || /MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(t)) throw new Error('sin traducción');
          return t;
        });
    }));
  }

  /* Se pide una vez por ejercicio; si ya hay una en marcha, se espera a esa. */
  function asegurarTraduccion(ex) {
    if (!ex || !ex.instructions || !ex.instructions.length) return Promise.resolve(null);
    /* Los que ya vienen escritos en español no pasan por el traductor. */
    if (ex.yaEnEspanol) return Promise.resolve(null);
    const ya = traduccionGuardada(ex);
    if (ya) return Promise.resolve(ya);
    if (traduciendo[ex.id]) return traduciendo[ex.id];

    traduciendo[ex.id] = traducirConIA(ex)
      .catch(function () { return traducirConServicio(ex); })
      .then(function (pasos) {
        guardarTraduccion(ex, pasos);
        delete traduciendo[ex.id];
        return pasos;
      })
      .catch(function () {
        delete traduciendo[ex.id];
        return null;
      });
    return traduciendo[ex.id];
  }

  /* Traducción bajo demanda de las instrucciones (servicio gratuito, sin clave).
     Si falla, el texto original en inglés sigue visible. */
  function traducirInstrucciones(ex, btn) {
    btn.disabled = true;
    btn.textContent = T('Traduciendo…');

    const peticiones = ex.instructions.map(function (frase) {
      const url = 'https://api.mymemory.translated.net/get?q=' +
        encodeURIComponent(frase.slice(0, 480)) + '&langpair=en|es';
      return fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (j) {
          const t = j && j.responseData && j.responseData.translatedText;
          if (!t || /MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(t)) throw new Error('sin traducción');
          return t;
        });
    });

    Promise.all(peticiones).then(function (frases) {
      localStorage.setItem('trainingfr.tr.' + ex.id, JSON.stringify(frases));
      const ol = document.getElementById('instr');
      if (ol) ol.innerHTML = frases.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
      btn.remove();
      UI.toast(T('Instrucciones traducidas'));
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = T('Traducir');
      UI.toast(T('No se pudo traducir ahora. Prueba más tarde.'));
    });
  }

  /* Hoja para añadir un ejercicio a una rutina existente o nueva */
  function pickRoutineSheet(ex) {
    const rutinas = Store.routines();
    UI.modal(html`
      <h2>${Tn('Añadir «{que}»', { que: ex.nameEs })}</h2>
      <p class="muted">${T('Elige a qué rutina quieres añadirlo.')}</p>
      <div class="stack">
        ${raw(rutinas.map(function (r) {
          return html`<button class="btn block" data-r="${r.id}" style="justify-content:space-between">
            <span>${r.name || T('Sin nombre')}</span>
            <span class="tiny">${Tn('{n} ej.', { n: r.exercises.length })}</span></button>`;
        }).join(''))}
        <button class="btn primary block" data-r="nueva">${raw(icon('plus'))} ${T('Crear rutina nueva')}</button>
      </div>`,
      function (el) {
        el.querySelectorAll('[data-r]').forEach(function (btn) {
          btn.onclick = function () {
            const id = btn.dataset.r;
            if (id === 'nueva') {
              const r = Store.saveRoutine(Object.assign(Store.newRoutine(), {
                name: T('Nueva rutina'), exercises: [Store.newRoutineExercise(ex.id)]
              }));
              UI.closeModal();
              go('rutina', r.id);
              return;
            }
            const r = Store.routine(id);
            r.exercises.push(Store.newRoutineExercise(ex.id));
            Store.saveRoutine(r);
            UI.closeModal();
            UI.toast(Tn('Añadido a «{que}»', { que: r.name || T('rutina') }));
          };
        });
      });
  }

  /* ================= rutinas ================= */

  /* Modo de ordenación: mientras está activo cada tarjeta enseña las flechas */
  let ordenando = false;

  /* Las de hoy primero, y detrás el orden que haya puesto el usuario.
     En modo ordenación no se reordena por día: se vería saltar la tarjeta. */
  function rutinasOrdenadas() {
    const rutinas = Store.routines();
    if (ordenando) return rutinas;
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const deHoy = rutinasDeHoy();
    const resto = rutinas.filter(function (r) {
      return deHoy.indexOf(r) === -1;
    });
    return deHoy.concat(resto);
  }

  /* Una fila de accion: icono, lo que hace, por que, y el galon de que lleva a
     algun sitio. Es el patron de las listas de Ajustes de iOS, y aqui vale
     porque las tres son exactamente eso: cosas que abren una hoja. */
  function filaAccion(accion, ico, titulo, sub) {
    return html`
      <button class="fila-accion" data-a="${accion}">
        <span class="fa-ico">${raw(icon(ico))}</span>
        <span class="grow">
          <span class="fa-tit">${titulo}</span>
          <span class="fa-sub">${sub}</span>
        </span>
        <span class="chevron">${raw(icon('chevron'))}</span>
      </button>`;
  }

  function viewRutinas() {
    const rutinas = rutinasOrdenadas();
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const hayHoy = rutinas.some(function (r) { return (r.days || []).indexOf(hoy) !== -1; });

    return html`
      <h1>${T('Rutinas')}</h1>

      <div class="row" style="margin:6px 0 4px">
        <button class="btn primary grow" data-a="nueva">
          ${raw(icon('plus'))} ${T('Crear la mía')}</button>
        <button class="btn grow" data-a="programa">
          ${raw(icon('chispa'))} ${T('Generar programa')}</button>
      </div>
      <p class="tiny" style="margin:4px 0 0"><b>${T('Crear la mía')}</b>: ${T('la montas tú.')}
      <b>${T('Generar programa')}</b>: ${T('te lo monto yo con tus datos y lo editas igual.')}</p>

      <!-- Las tres acciones sueltas, en filas de una sola pieza. Antes eran
           botón y párrafo, botón y párrafo: cuatro bloques de texto gris
           seguidos en los que no se distingue lo que se puede tocar de lo que
           solo se lee. En una fila, el titulo dice que hace y el renglon de
           debajo por que, y toda ella se toca. -->
      <div class="card lista-acciones tarjeta-premium">
        ${raw(filaAccion('actividad', 'plus', T('Apuntar algo que ya hice'),
          T('Caminar una hora el domingo o la pachanga del sábado cuentan igual, aunque no salgan de una rutina.')))}

        ${raw(Store.routines().some(function (r) { return (r.days || []).length; })
          ? filaAccion('correr', 'cambiar', T('Hoy no pude: correr el plan un día'),
            T('Lo que tocaba hoy pasa a mañana, y así el resto, en vez de perder la sesión.'))
          : '')}

        ${raw(filaAccion('importar', 'camara', T('Traer una rutina que tengo en papel'),
          T('Una foto de la hoja del gimnasio o el PDF de tu entrenador: la leo y tú decides.')))}
      </div>

      ${raw((function () {
        const n = duplicados().length;
        if (!n) return '';
        return '<div class="card aviso-seguridad" style="margin-top:10px">' +
          '<b>' + esc(T('Tienes rutinas repetidas')) + '</b>' +
          '<p style="margin:7px 0 0;font-size:.9rem">' +
          esc(Tp(n, 'Hay {n} rutina que repite plan y día de otra, de haber generado el programa más de una vez. Se puede quitar de golpe.',
                 'Hay {n} rutinas que repiten plan y día de otra, de haber generado el programa más de una vez. Se pueden quitar de golpe.')) +
          '</p>' +
          '<button class="btn block" data-a="limpiardup" style="margin-top:11px">' +
          esc(T('Revisar y limpiar')) + '</button></div>';
      })())}

      ${raw(rutinas.length ? html`
        <div class="list-head">
          <span class="list-title">${ordenando ? T('Ordena y borra lo que sobre')
            : T('Mis rutinas')}</span>
          <button class="btn sm ${ordenando ? 'primary' : 'ghost'}" data-a="ordenar">
            ${ordenando ? T('Hecho') : T('Editar lista')}</button>
        </div>` : '')}

      ${raw(rutinas.length ? (ordenando
        ? '<div class="stack" style="margin-top:8px">' + rutinas.map(function (r, i) {
            return routineCard(r, i, rutinas.length);
          }).join('') + '</div>'
        : porPlanes(rutinas))
      : '<p class="muted">' + esc(T('Aún no tienes rutinas propias. Copia una plantilla de abajo para empezar.')) + '</p>')}

      ${raw('<p class="tiny" style="margin-top:10px">' + esc(ordenando
        ? T('Con las flechas las colocas a tu gusto y con la papelera las borras. El orden viaja a tus demás dispositivos, y al salir de aquí la rutina de hoy vuelve a ponerse la primera.')
        : T('Abre un plan para ver sus días. Toca una rutina para desplegar sus ejercicios y cambiarle el día, o pulsa Entrenar para hacerla ahora.')) + '</p>')}

      ${raw(seccionPlegable('fuerza', T('Rutinas de ejemplo'),
        Templates.list.filter(function (t) { return (t.tipo || 'fuerza') === 'fuerza'; }).length,
        T('Al usar una plantilla se copia a tus rutinas; puedes cambiar ejercicios, series y descansos sin límite.'),
        plantillasHTML('fuerza')))}

      ${raw(seccionPlegable('movilidad', T('Estiramientos, pilates y terapia'),
        Templates.list.filter(function (t) { return (t.tipo || 'fuerza') === 'movilidad'; }).length,
        T('Se copian y se hacen igual que las demás, con su cronómetro y sus descansos. En estas las repeticiones son segundos.'),
        plantillasHTML('movilidad')))}`;
  }

  /* Las plantillas de un tipo. Las de movilidad se listan aparte porque
     buscarlas entre las de fuerza era perderlas, pero la tarjeta es la misma:
     se copian y se entrenan igual. */
  /* Qué plantillas quedan abiertas. Fuera del pintado, que la pantalla se
     repinta entera al copiar una y si no se cierra la que acabas de abrir. */
  const plantillasAbiertas = {};

  /* Qué secciones de plantillas quedan abiertas */
  const seccionesAbiertas = {};

  /* Una sección entera plegada tras su título. Plegar cada plantilla por
     separado no bastaba: catorce fichas cerradas siguen siendo catorce fichas
     entre uno y el final de la pantalla. Aquí se pliega el bloque completo y el
     título dice cuántas hay dentro. */
  /* Las secciones plegables aparecen en varias pantallas; el listener que
     recuerda lo abierto tiene que ir en todas o la que falte se cierra sola al
     repintar. */
  function recordarSecciones(root) {
    root.querySelectorAll('details.seccion, details.menu-hoy').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) seccionesAbiertas[d.dataset.sec] = true;
        else delete seccionesAbiertas[d.dataset.sec];
      });
    });
  }

  function seccionPlegable(id, titulo, cuantas, sub, cuerpo, coletilla) {
    return html`
      <details class="seccion" data-sec="${id}"${raw(seccionesAbiertas[id] ? ' open' : '')}>
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="list-title" style="margin:0">${titulo}</span>
          ${raw(cuantas || cuantas === 0
            ? '<span class="tiny sec-num">' + esc(String(cuantas)) + '</span>' : '')}
          ${raw(coletilla
            ? '<span class="tiny sec-cola">' + esc(coletilla) + '</span>' : '')}
        </summary>
        <div class="sec-cuerpo">
          ${raw(sub ? '<p class="muted" style="margin:0 0 10px">' + esc(sub) + '</p>' : '')}
          <div class="stack">${raw(cuerpo)}</div>
        </div>
      </details>`;
  }

  function plantillasHTML(tipo) {
    return Templates.list.filter(function (t) {
      return (t.tipo || 'fuerza') === tipo;
    }).map(function (t) {
      /* Plegada de entrada. Once plantillas con su descripción entera son
         cuatro pantallas de texto para elegir una; con el nombre, el nivel y
         los días ya se decide, y el resto se lee si interesa. El botón de usar
         se queda fuera para poder copiarla sin abrirla. */
      return html`
        <details class="card plantilla" data-tpl-caja="${t.id}"${raw(
          plantillasAbiertas[t.id] ? ' open' : '')}>
          <summary>
            <span class="chevron down pl-flecha">${raw(icon('chevron'))}</span>
            <span class="grow">
              <span style="font-weight:700;display:block">${T(t.name)}</span>
              <span class="tiny" style="display:block">${T(t.goal)} · ${T(t.level)}
                · ${Tp(t.exercises.length, '{n} ejercicio', '{n} ejercicios')}</span>
              <span class="tiny" style="display:block">${UI.diasLargos(t.days)}</span>
            </span>
            <button class="btn sm pl-usar" data-tpl="${t.id}">${raw(icon('copy'))} ${T('Usar')}</button>
          </summary>
          <div class="pl-cuerpo">
            <span class="chip tiny-chip" style="display:inline-block">
              ${raw(icon('dumbbell'))} ${T(Data.GEAR[Templates.lugarNecesario(t)].label)}</span>
            <p class="muted" style="margin:9px 0 0;font-size:.82rem">${T(t.note)}</p>
          </div>
        </details>`;
    }).join('');
  }

  viewRutinas.mount = function (root) {
    bind(root, '[data-a=nueva]', function () { go('rutina', 'nueva'); });
    bind(root, '[data-a=programa]', function () { go('programa'); });

    bind(root, '[data-a=ordenar]', function () {
      ordenando = !ordenando;
      render();
      if (ordenando) UI.toast(T('Colócalas con las flechas o bórralas con la papelera'));
    });

    bindAll(root, '[data-borrar]', function (el) {
      const r = Store.routine(el.dataset.borrar);
      if (!r) return;
      UI.confirm(Tn('Borrar «{que}»', { que: r.name || T('esta rutina') }),
        T('Se quita de tu lista. Los entrenamientos que ya hiciste con ella se conservan ' +
        'en tu historial.'), T('Borrar'), true).then(function (ok) {
        if (!ok) return;
        Store.deleteRoutine(r.id);
        if (!Store.routines().length) ordenando = false;
        render();
        UI.toast(T('Rutina borrada'));
      });
    });

    const mover = function (id, delta) {
      const pos = window.scrollY;
      if (Store.moverRutina(id, delta)) { render(); window.scrollTo(0, pos); }
    };
    bindAll(root, '[data-sube]', function (el) { mover(el.dataset.sube, -1); });
    bindAll(root, '[data-baja]', function (el) { mover(el.dataset.baja, 1); });
    bindAll(root, '[data-open]', function (el) { go('rutina', el.dataset.open); });
    bindAll(root, '[data-train]', function (el) { empezar(el.dataset.train); });
    bindAll(root, '[data-iarutina]', function (el) { auditarDesdeLista(el.dataset.iarutina); });
    bindTarjetaRutina(root);

    bindAll(root, '[data-planactivo]', function (el) {
      const n = el.dataset.planactivo;
      marcarPlanActivo(n);
      render();
      UI.toast(n ? Tn('Plan principal: {que}', { que: n }) : T('Ya no hay plan principal'));
    });

    bindAll(root, '[data-grupo]', function (el) {
      /* el estado se lee de lo pintado, que es lo único que sabe si estaba
         abierto por defecto o porque alguien lo abrió */
      const abierto = !!el.querySelector('.plegador.abierto');
      gruposAbiertos[el.dataset.grupo] = !abierto;
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    });

    bind(root, '[data-a=actividad]', apuntarActividad);
    bind(root, '[data-a=correr]', correrPlanSheet);
    bind(root, '[data-a=limpiardup]', limpiarDuplicadosSheet);
    bind(root, '[data-a=importar]', function () { go('importar'); });
    bindAll(root, '[data-duplicar]', function (el) { duplicarRutinaSheet(el.dataset.duplicar); });
    bindAll(root, '[data-verplan]', function (el) {
      if (g.VISTAS && VISTAS.verPlan) VISTAS.verPlan(el.dataset.verplan);
    });
    bindAll(root, '[data-renombrarplan]', function (el) { renombrarPlanSheet(el.dataset.renombrarplan); });
    bindAll(root, '[data-renombrarrutina]', function (el) { renombrarRutinaSheet(el.dataset.renombrarrutina); });
    bindAll(root, '[data-compartir]', function (el) {
      if (g.Compartir) Compartir.compartirRutina(el.dataset.compartir);
    });
    bindAll(root, '[data-compartirplan]', function (el) {
      if (g.Compartir) Compartir.compartirPlan(el.dataset.compartirplan);
    });
    bindAll(root, '[data-duplicarplan]', function (el) { duplicarPlanSheet(el.dataset.duplicarplan); });
    bindAll(root, '[data-borrarplan]', function (el) { borrarPlanSheet(el.dataset.borrarplan); });
    bindAll(root, '[data-iaplan]', function (el) {
      if (g.VISTAS && VISTAS.auditarPlan) VISTAS.auditarPlan(el.dataset.iaplan);
    });

    /* Recordar qué plantillas quedan abiertas, y que «Usar» no pliegue la ficha:
       va dentro del <summary>, donde un clic despliega por defecto. */
    recordarSecciones(root);

    root.querySelectorAll('details.plantilla').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) plantillasAbiertas[d.dataset.tplCaja] = true;
        else delete plantillasAbiertas[d.dataset.tplCaja];
      });
    });
    root.querySelectorAll('.pl-usar').forEach(function (b) {
      b.addEventListener('click', function (ev) { ev.preventDefault(); });
    });

    bindAll(root, '[data-tpl]', function (el) {
      const tpl = Templates.list.find(function (t) { return t.id === el.dataset.tpl; });
      const r = Store.saveRoutine(Templates.toRoutine(tpl));
      UI.toast(T('Rutina copiada. Ya puedes editarla.'));
      go('rutina', r.id);
    });
  };

  /* ---------- apuntar algo hecho fuera de la app ----------
     Media vida de entrenamiento no pasa por una rutina: una hora andando el
     domingo, la pachanga del sábado, la clase de pilates del barrio. Si eso no
     se puede apuntar, la racha miente y el progreso enseña menos de lo que hay.
     Las calorías salen del MET de cada actividad por el peso y el tiempo, que es
     la misma cuenta que hace cualquier reloj y no pretende ser exacta. */
  /* Qué mueve cada una. Va en la tabla y no lo decide la IA: que correr trabaja
     el cuádriceps y los gemelos es una regla, no una opinión, y tiene que dar lo
     mismo siempre y sin cobertura.

     Sirve para dos cosas: que el historial diga de qué fue la sesión, y que
     «lo que llevas abandonado» deje de acusarte de tener la pierna parada el
     lunes después de correr el domingo.

     Tres se quedan vacías a propósito. Estirar y la movilidad no son estímulo:
     no evitan que un músculo se estanque, así que no deben reiniciar esa
     cuenta. Y «pesas por mi cuenta» y «otra cosa» pueden ser cualquier cosa;
     inventarles músculos sería peor que no decir nada. */
  const ACTIVIDADES = [
    /* El texto se traduce al pintarlo: la tabla se arma al cargar el archivo. */
    { id: 'caminar', label: 'Caminar', met: 3.5,
      musculos: ['quadriceps', 'calves', 'glutes'] },
    { id: 'correr', label: 'Correr', met: 9,
      musculos: ['quadriceps', 'hamstrings', 'calves', 'glutes'] },
    { id: 'bici', label: 'Bici', met: 7,
      musculos: ['quadriceps', 'glutes', 'calves'] },
    { id: 'nadar', label: 'Nadar', met: 7,
      musculos: ['lats', 'shoulders', 'chest', 'middle back'] },
    /* «Remo» a secas ya es un ejercicio de espalda con barra, y la misma
       palabra en dos sitios se pisa en el diccionario. */
    { id: 'remo', label: 'Remo o piragua', met: 7,
      musculos: ['lats', 'middle back', 'biceps', 'quadriceps', 'glutes'] },
    { id: 'senderismo', label: 'Senderismo', met: 6,
      musculos: ['quadriceps', 'glutes', 'calves', 'hamstrings'] },
    { id: 'escalada', label: 'Escalada', met: 7.5,
      musculos: ['lats', 'forearms', 'biceps', 'abdominals', 'middle back'] },
    { id: 'equipo', label: 'Deporte de equipo', met: 7,
      musculos: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abdominals'] },
    { id: 'raqueta', label: 'Raqueta o pádel', met: 6.5,
      musculos: ['shoulders', 'quadriceps', 'abdominals', 'forearms'] },
    { id: 'boxeo', label: 'Boxeo o artes marciales', met: 8,
      musculos: ['shoulders', 'abdominals', 'lats', 'triceps', 'calves'] },
    { id: 'baile', label: 'Baile', met: 5,
      musculos: ['quadriceps', 'calves', 'glutes', 'abdominals'] },
    { id: 'comba', label: 'Saltar la comba', met: 11,
      musculos: ['calves', 'quadriceps', 'shoulders', 'abdominals'] },
    { id: 'pilates', label: 'Pilates o yoga', met: 3,
      musculos: ['abdominals', 'lower back', 'glutes'] },
    { id: 'estirar', label: 'Estirar y movilidad', met: 2.5, musculos: [] },
    { id: 'pesas', label: 'Pesas por mi cuenta', met: 5, musculos: [] },
    { id: 'otro', label: 'Otra cosa', met: 4 }
  ];

  /* ---------- duplicados ----------
     Generar un plan dos veces creaba dos juegos de rutinas, y al tercero te
     encontrabas trece donde debía haber cinco. La causa ya está arreglada al
     guardar, pero lo que se duplicó sigue ahí: esto lo detecta y lo limpia
     dejando de cada pareja la más reciente. */
  function duplicados() {
    const grupos = {};
    Store.routines().forEach(function (r) {
      if (!(r.days || []).length) return;
      const clave = nombreRutina(r) + '|' + (r.days || []).slice().sort().join('/');
      (grupos[clave] = grupos[clave] || []).push(r);
    });

    const sobran = [];
    Object.keys(grupos).forEach(function (k) {
      const g = grupos[k];
      if (g.length < 2) return;
      /* se queda la última tocada; las demás sobran */
      g.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
      sobran.push.apply(sobran, g.slice(1));
    });
    return sobran;
  }

  /* Borrar un plan de cinco días era borrar cinco rutinas de una en una desde
     «Editar lista». Aquí se ve qué se va antes de irse, que es lo que evita el
     arrepentimiento. */
  /* ---------- duplicar ----------
     Copiar una rutina a mano es abrirla, apuntar los seis ejercicios y volver a
     meterlos uno a uno. Y lo que casi siempre se quiere es una variante: el
     mismo día con otro material, o el plan entero para probar un cambio sin
     tocar el que ya funciona.

     Al duplicar se pregunta lo único que no se puede adivinar: a qué plan va y
     qué día le toca. El día no se hereda por defecto a propósito: dos rutinas
     el mismo día se pisan en la portada y en el banner de «entrenamiento en
     curso», y eso se nota tarde y mal. */
  function copiaDe(r) {
    return {
      name: r.name,
      days: [],
      note: r.note || '',
      mixta: !!r.mixta,
      exercises: (r.exercises || []).map(function (e) {
        return { exId: e.exId, sets: e.sets, reps: e.reps, weight: 0, rest: e.rest,
                 note: e.note || '' };
      })
    };
  }

  function duplicarRutinaSheet(id) {
    const r = Store.routine(id);
    if (!r) { UI.toast(T('Esa rutina ya no está')); return; }

    const planes = [];
    Store.routines().forEach(function (x) {
      const n = nombreRutina(x);
      if (n && planes.indexOf(n) === -1) planes.push(n);
    });
    const suyo = nombreRutina(r);

    let plan = suyo;
    let dias = [];

    UI.modal(html`
      <h2>${T('Duplicar rutina')}</h2>
      <p class="muted">${Tn('Copias {rutina} con sus {ejercicios}, series y descansos. ' +
        'La original no se toca.',
        { rutina: tituloRutina(r),
          ejercicios: Tp(r.exercises.length, '{n} ejercicio', '{n} ejercicios') })}</p>

      <div class="tiny" style="margin:14px 0 6px">${T('A QUÉ PLAN VA')}</div>
      <div class="row wrap" id="dr-planes" style="gap:6px">
        ${raw(planes.map(function (n) {
          return '<button class="chip ' + (n === suyo ? 'on' : '') + '" data-dplan="' +
            esc(n) + '">' + esc(n) + '</button>';
        }).join(''))}
        <button class="chip" data-dplan="__nuevo">+ ${T('Plan nuevo')}</button>
      </div>
      <input id="dr-nombre" class="input" placeholder="${T('Nombre del plan nuevo')}"
             style="margin-top:8px;display:none" maxlength="40">

      <div class="tiny" style="margin:14px 0 6px">${T('QUÉ DÍA LA HAGO')}</div>
      <div class="row wrap" id="dr-dias" style="gap:6px">
        ${raw(DIAS.map(function (d) {
          return '<button class="chip" data-ddia="' + d + '">' +
            esc(UI.diaLargo(d).slice(0, 3)) + '</button>';
        }).join(''))}
      </div>
      <p class="tiny" style="margin:7px 0 0">${T('Puedes dejarla sin día y ponérselo ' +
        'luego. Si le das un día que ya tiene otra rutina, tendrás dos para ese día y ' +
        'la portada solo puede enseñar una.')}</p>

      <button class="btn primary block" id="dr-ok" style="margin-top:16px">${T('Duplicar')}</button>
      <button class="btn ghost block" id="dr-no" style="margin-top:8px">${T('Cancelar')}</button>`,
      function (el) {
        const campo = el.querySelector('#dr-nombre');

        el.querySelectorAll('[data-dplan]').forEach(function (b) {
          b.onclick = function () {
            el.querySelectorAll('[data-dplan]').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            plan = b.dataset.dplan;
            campo.style.display = plan === '__nuevo' ? '' : 'none';
            if (plan === '__nuevo') campo.focus();
          };
        });

        el.querySelectorAll('[data-ddia]').forEach(function (b) {
          b.onclick = function () {
            const d = b.dataset.ddia;
            const i = dias.indexOf(d);
            if (i === -1) dias.push(d); else dias.splice(i, 1);
            b.classList.toggle('on');
          };
        });

        el.querySelector('#dr-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#dr-ok').onclick = function () {
          let destino = plan;
          if (destino === '__nuevo') {
            destino = String(campo.value || '').trim();
            if (!destino) { UI.toast(T('Ponle nombre al plan nuevo')); campo.focus(); return; }
          }

          const copia = copiaDe(r);
          copia.days = DIAS.filter(function (d) { return dias.indexOf(d) !== -1; });
          copia.name = nombreConDia(destino, copia.days);
          const nueva = Store.saveRoutine(copia);

          UI.closeModal();
          rutinaAbierta.rutinas = nueva.id;
          gruposAbiertos[destino] = true;
          render();
          UI.toast(Tn('Duplicada en «{que}»', { que: destino }));
        };
      });
  }

  /* El plan entero. Para probar un cambio sin arriesgar el que ya entrenas:
     se copian sus rutinas con sus días tal cual, porque un plan duplicado sin
     días no es un plan, es una lista suelta. */
  function duplicarPlanSheet(nombre) {
    const suyas = Store.routines().filter(function (r) {
      return (r.days || []).length && nombreRutina(r) === nombre;
    });
    if (!suyas.length) { UI.toast(T('Ese plan ya no está')); return; }

    suyas.sort(function (a, b) {
      return DIAS.indexOf((a.days || [])[0]) - DIAS.indexOf((b.days || [])[0]);
    });

    let propuesto = nombre + ' 2';
    for (let i = 2; Store.routines().some(function (r) { return nombreRutina(r) === propuesto; }); i++) {
      propuesto = nombre + ' ' + (i + 1);
    }

    UI.modal(html`
      <h2>${Tn('Duplicar «{que}»', { que: nombre })}</h2>
      <p class="muted">${Tp(suyas.length,
        'Se copia {n} rutina con sus mismos días. El plan original se queda como está.',
        'Se copian las {n} rutinas con sus mismos días. El plan original se queda como está.')}</p>
      <div class="card">
        ${raw(suyas.map(function (r) {
          return '<div class="row between" style="padding:4px 0;gap:10px">' +
            '<span style="font-size:.86rem">' + esc(tituloRutina(r)) + '</span>' +
            '<span class="tiny">' + esc(Tp(r.exercises.length,
              '{n} ejercicio', '{n} ejercicios')) + '</span></div>';
        }).join(''))}
      </div>

      <div class="tiny" style="margin:14px 0 6px">${T('CÓMO SE LLAMA LA COPIA')}</div>
      <input id="dp-nombre" class="input" value="${propuesto}" maxlength="40">
      <p class="tiny" style="margin:7px 0 0">${T('Tendrás dos rutinas para cada día ' +
        '—la del plan viejo y la del nuevo—. Borra el que no uses cuando decidas, o ' +
        'quítale los días al que dejes aparcado.')}</p>

      <button class="btn primary block" id="dp-ok" style="margin-top:16px">
        ${Tn('Duplicar las {n}', { n: suyas.length })}</button>
      <button class="btn ghost block" id="dp-no" style="margin-top:8px">${T('Cancelar')}</button>`,
      function (el) {
        el.querySelector('#dp-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#dp-ok').onclick = function () {
          const destino = String(el.querySelector('#dp-nombre').value || '').trim();
          if (!destino) { UI.toast(T('Ponle un nombre')); return; }
          if (destino === nombre) { UI.toast(T('Ponle un nombre distinto al original')); return; }

          suyas.forEach(function (r) {
            const copia = copiaDe(r);
            copia.days = (r.days || []).slice();
            copia.name = nombreConDia(destino, copia.days);
            Store.saveRoutine(copia);
          });

          UI.closeModal();
          gruposAbiertos[destino] = true;
          render();
          UI.toast(Tn('Plan «{que}» creado', { que: destino }));
        };
      });
  }

  /* ---------- renombrar ----------
     El nombre de un plan no se guarda en ningún sitio: es lo que queda de cada
     rutina al quitarle el día de delante. Así que cambiarlo es reescribir el
     nombre de sus cinco rutinas, no tocar un campo. */
  function renombrarPlanSheet(nombre) {
    const suyas = Store.routines().filter(function (r) {
      return App.nombreRutina(r) === nombre;
    });
    if (!suyas.length) { UI.toast(T('Ese plan ya no está')); return; }

    UI.modal(html`
      <h2>${T('Renombrar plan')}</h2>
      <p class="muted">${Tp(suyas.length,
        'Se cambia en la {n} rutina del plan. Los días y los ejercicios no se tocan.',
        'Se cambia en las {n} rutinas del plan. Los días y los ejercicios no se tocan.')}</p>

      <div class="tiny" style="margin:14px 0 6px">${T('CÓMO SE LLAMA')}</div>
      <input id="rn-nombre" class="input" value="${nombre}" maxlength="40">
      <p class="tiny" style="margin:7px 0 0">${T('Lo verás aquí, en el banner del ' +
        'entrenamiento en curso y en tu historial.')}</p>

      <button class="btn primary block" id="rn-ok" style="margin-top:16px">${T('Guardar')}</button>
      <button class="btn ghost block" id="rn-no" style="margin-top:8px">${T('Cancelar')}</button>`,
      function (el) {
        const campo = el.querySelector('#rn-nombre');
        campo.focus();
        campo.select();
        el.querySelector('#rn-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#rn-ok').onclick = function () {
          const nuevo = String(campo.value || '').trim();
          if (!nuevo) { UI.toast(T('Ponle un nombre')); return; }
          if (nuevo === nombre) { UI.closeModal(); return; }
          if (Store.routines().some(function (r) { return App.nombreRutina(r) === nuevo; })) {
            UI.toast(T('Ya tienes un plan con ese nombre'));
            return;
          }
          suyas.forEach(function (r) {
            r.name = nombreConDia(nuevo, r.days);
            Store.saveRoutine(r);
            refrescarActiva(r);
          });
          UI.closeModal();
          gruposAbiertos[nuevo] = gruposAbiertos[nombre];
          render();
          UI.toast(Tn('Ahora se llama «{que}»', { que: nuevo }));
        };
      });
  }

  /* Una rutina suelta: se le cambia el plan al que pertenece, que es lo único
     que su nombre guarda aparte del día. Se dice claro, porque cambiarlo la
     saca del grupo en el que estaba. */
  function renombrarRutinaSheet(id) {
    const r = Store.routine(id);
    if (!r) { UI.toast(T('Esa rutina ya no está')); return; }
    const actual = nombreRutina(r);

    UI.modal(html`
      <h2>${T('Renombrar rutina')}</h2>
      <p class="muted">${Tn('{rutina} — ahora está en el plan «{plan}». El día se ' +
        'mantiene delante solo.', { rutina: tituloRutina(r), plan: actual })}</p>

      <div class="tiny" style="margin:14px 0 6px">${T('A QUÉ PLAN PERTENECE')}</div>
      <input id="rr-nombre" class="input" value="${actual}" maxlength="40">
      <p class="tiny" style="margin:7px 0 0">${T('Si le pones un nombre distinto al de ' +
        'sus compañeras, esta rutina se va sola a un plan nuevo.')}</p>

      <button class="btn primary block" id="rr-ok" style="margin-top:16px">${T('Guardar')}</button>
      <button class="btn ghost block" id="rr-no" style="margin-top:8px">${T('Cancelar')}</button>`,
      function (el) {
        const campo = el.querySelector('#rr-nombre');
        campo.focus();
        campo.select();
        el.querySelector('#rr-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#rr-ok').onclick = function () {
          const nuevo = String(campo.value || '').trim();
          if (!nuevo) { UI.toast(T('Ponle un nombre')); return; }
          if (nuevo === actual) { UI.closeModal(); return; }
          r.name = nombreConDia(nuevo, r.days);
          Store.saveRoutine(r);
          refrescarActiva(r);
          UI.closeModal();
          gruposAbiertos[nuevo] = true;
          rutinaAbierta.rutinas = r.id;
          render();
          UI.toast(Tn('Ahora está en «{que}»', { que: nuevo }));
        };
      });
  }

  function borrarPlanSheet(nombre) {
    const suyas = Store.routines().filter(function (r) {
      return (r.days || []).length && nombreRutina(r) === nombre;
    });
    if (!suyas.length) { UI.toast(T('Ese plan ya no está')); return; }

    suyas.sort(function (a, b) {
      return DIAS.indexOf((a.days || [])[0]) - DIAS.indexOf((b.days || [])[0]);
    });

    const hechas = Store.sessions().filter(function (s) {
      return suyas.some(function (r) { return r.id === s.routineId; });
    }).length;

    UI.modal(html`
      <h2>${Tn('Borrar «{que}»', { que: nombre })}</h2>
      <p class="muted">${Tp(suyas.length,
        'Se va esta {n} rutina y el plan desaparece de tu lista.',
        'Se van estas {n} rutinas y el plan desaparece de tu lista.')}</p>
      <div class="card">
        ${raw(suyas.map(function (r) {
          return '<div class="row between" style="padding:4px 0;gap:10px">' +
            '<span style="font-size:.86rem">' + esc(tituloRutina(r)) + '</span>' +
            '<span class="tiny">' + esc(Tp(r.exercises.length,
              '{n} ejercicio', '{n} ejercicios')) + '</span></div>';
        }).join(''))}
      </div>
      <p class="tiny" style="margin:10px 0 0">${hechas
        ? Tn('Los {n} entrenamientos que ya hiciste con ellas se quedan en tu historial: ' +
          'esto no borra nada de Progreso.', { n: hechas })
        : T('Tu historial de entrenamientos no se toca.')}</p>
      <button class="btn danger block" id="bp-ok" style="margin-top:14px">
        ${Tn('Borrar las {n}', { n: suyas.length })}</button>
      <button class="btn ghost block" id="bp-no" style="margin-top:8px">${T('Dejarlo como está')}</button>`,
      function (el) {
        el.querySelector('#bp-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#bp-ok').onclick = function () {
          suyas.forEach(function (r) { Store.deleteRoutine(r.id); });
          UI.closeModal();
          render();
          UI.toast(Tn('Plan «{que}» borrado', { que: nombre }));
        };
      });
  }

  function limpiarDuplicadosSheet() {
    const sobran = duplicados();
    if (!sobran.length) { UI.toast(T('No hay rutinas repetidas')); return; }

    const lista = sobran.map(function (r) {
      return '<div class="row between" style="padding:4px 0;gap:10px">' +
        '<span style="font-size:.86rem">' + esc(tituloRutina(r)) + '</span>' +
        '<span class="tiny">' +
        esc(Tp(r.exercises.length, '{n} ejercicio', '{n} ejercicios')) + ' \u00b7 ' +
        esc(r.updatedAt ? UI.fechaCorta(r.updatedAt) : T('sin fecha')) + '</span></div>';
    }).join('');

    UI.modal(html`
      <h2>${T('Rutinas repetidas')}</h2>
      <p class="muted">${Tp(sobran.length,
        'Tienes {n} rutina repetida: mismo plan y mismo día que otra. Se va esta y se ' +
        'queda la más reciente.',
        'Tienes {n} rutinas repetidas: mismo plan y mismo día que otra. Se van estas y se ' +
        'queda la más reciente de cada una.')}</p>
      <div class="card">${raw(lista)}</div>
      <p class="tiny" style="margin:10px 0 0">${T('Tu historial de entrenamientos no se ' +
      'toca: lo que hiciste con ellas se queda en Progreso.')}</p>
      <button class="btn danger block" id="dup-ok" style="margin-top:14px">
        ${Tn('Borrar las {n} repetidas', { n: sobran.length })}</button>
      <button class="btn ghost block" id="dup-no" style="margin-top:8px">${T('Dejarlo como está')}</button>`,
      function (el) {
        el.querySelector('#dup-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#dup-ok').onclick = function () {
          sobran.forEach(function (r) { Store.deleteRoutine(r.id); });
          UI.closeModal();
          render();
          UI.toast(Tp(sobran.length, '{n} rutina borrada', '{n} rutinas borradas'));
        };
      });
  }

  /* ---------- correr el plan de día ----------
     Un día que no se puede ir al gimnasio no debería obligar a saltarse esa
     sesión: lo que uno hace es empujar la semana entera. Mover rutina por
     rutina desde la tarjeta son siete idas y venidas, así que se corren todas
     de una vez, adelante o atrás. */
  function diaCorrido(d, pasos) {
    const i = DIAS.indexOf(d);
    if (i === -1) return d;
    return DIAS[((i + pasos) % 7 + 7) % 7];
  }

  function correrPlan(pasos) {
    const rutinas = Store.routines().filter(function (r) { return (r.days || []).length; });
    rutinas.forEach(function (r) {
      r.days = r.days.map(function (d) { return diaCorrido(d, pasos); })
        .sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); });
      renombrarPorDia(r);
      Store.saveRoutine(r);
      refrescarActiva(r);
    });
    return rutinas.length;
  }

  function correrPlanSheet() {
    const rutinas = Store.routines().filter(function (r) { return (r.days || []).length; });
    if (!rutinas.length) { UI.toast(T('Ninguna rutina tiene día asignado')); return; }

    const previa = function (pasos) {
      return rutinas.map(function (r) {
        return '<div class="row between" style="gap:10px;padding:5px 0">' +
          '<span style="font-size:.86rem">' + esc(nombreRutina(r) === r.name
            ? r.name : tituloRutina(r)) + '</span>' +
          '<span class="tiny">' + esc(UI.diasLargos(r.days)) + ' → ' +
          esc(UI.diasLargos(r.days.map(function (d) { return diaCorrido(d, pasos); })
            .sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); }))) +
          '</span></div>';
      }).join('');
    };

    UI.modal(html`
      <h2>${T('Correr el plan de día')}</h2>
      <p class="muted">${T('Hoy no has podido ir, pero la semana no se tira: se empuja. ' +
      'Lo del lunes pasa al martes, lo del martes al miércoles, y así con todo.')}</p>
      <div class="card" id="cp-previa">${raw(previa(1))}</div>
      <button class="btn primary block" id="cp-mas" style="margin-top:14px">
        ${T('Correr un día adelante')}</button>
      <button class="btn block sm" id="cp-menos" style="margin-top:8px">
        ${T('Adelantarlo un día en vez de eso')}</button>
      <p class="tiny" style="margin-top:10px">${T('Solo cambia el día en el que te toca ' +
      'cada rutina. Los ejercicios, las series y tu historial no se tocan.')}</p>`,
      function (el) {
        const hacer = function (pasos) {
          const n = correrPlan(pasos);
          UI.closeModal();
          render();
          UI.toast(Tp(n, '{n} rutina corrida', '{n} rutinas corridas') + ' ' +
            (pasos > 0 ? T('un día adelante') : T('un día atrás')));
        };
        el.querySelector('#cp-mas').onclick = function () { hacer(1); };
        el.querySelector('#cp-menos').onclick = function () { hacer(-1); };
      });
  }

  /* ---------- lo apuntado antes de que esto existiera ----------
     Hasta v351 «Apuntar algo que ya hice» no guardaba músculos, así que esas
     sesiones se quedaron mudas: el historial las dejaba en «apuntado a mano» a
     secas y la pierna seguía contando como abandonada después de un partido.

     El tipo de actividad sí quedó grabado, y de ahí salen los músculos igual
     que saldrían hoy, así que se rellenan y no hay que volver a apuntar nada.
     Solo se toca lo que está vacío: si una sesión ya traía los suyos —las de la
     IA— se queda como está. */
  function rellenarMusculosDeActividades() {
    if (Store.settings().musculosDeActividadPuestos) return;

    let tocadas = 0;
    Store.sessions().forEach(function (s) {
      if (!s.actividad || (s.musculos || []).length) return;
      const a = ACTIVIDADES.filter(function (x) { return x.id === s.actividad; })[0];
      if (!a || !(a.musculos || []).length) return;
      s.musculos = a.musculos.slice();
      /* Para que el cambio viaje a los otros dispositivos */
      s.updatedAt = Date.now();
      tocadas++;
    });

    /* El sello se pone siempre, haya tocado algo o no: si no, esto se recorrería
       entero en cada arranque para no hacer nada. Y guarda de paso lo de arriba,
       que muta el array en sitio. */
    Store.setSetting('musculosDeActividadPuestos', true);
    return tocadas;
  }

  /* Cinco en cinco hasta dos horas y de cuarto en cuarto hasta cinco: por debajo
     de cinco minutos no hay actividad que apuntar, y por encima de dos horas
     nadie mide al minuto. */
  function minutosDelRodillo() {
    const out = [];
    for (let m = 5; m <= 120; m += 5) out.push({ v: m, et: Tn('{n} min', { n: m }) });
    for (let m = 135; m <= 300; m += 15) out.push({ v: m, et: Tn('{n} min', { n: m }) });
    return out;
  }

  /* ---------- adivinar la actividad por lo que se escribe ----------
     Escribir el nombre pasaba la actividad a «Otra cosa», y esa no tiene
     músculos a propósito —puede ser cualquier cosa—, así que un «Jugué fútbol»
     acababa sin ninguno: contaba sus minutos en constancia pero no llegaba a
     Pierna en el reparto.

     Casi siempre el texto ya lo dice. Se busca por palabras sueltas, sin tildes
     ni mayúsculas, y si no se reconoce nada se queda en «Otra cosa», que es lo
     honesto. Es una tabla y no la IA: reconocer la palabra «fútbol» no es una
     opinión, y tiene que funcionar sin cobertura y sin clave. */
  const PISTAS = [
    ['correr', ['correr', 'corri', 'trote', 'trotar', 'maraton',
      'run', '=ran', 'jog', 'marathon']],
    ['bici', ['bici', 'ciclismo', 'spinning', 'pedalear', 'mtb',
      'cycl', 'bike', 'biking']],
    ['nadar', ['nadar', 'nade', 'natacion', 'piscina', 'nadando',
      'swim', '=swam', 'pool']],
    /* Con «=» delante, la palabra entera: «remo» es el principio de «remolque»
       y una mudanza se apuntaba como remar. */
    ['remo', ['=remo', '=remar', '=reme', 'remando', 'row', 'piragua', 'kayak',
      'canoe', 'paddl']],
    /* Sin «escale» a propósito: «escalé el cerro» es subir al monte, no colgarse
       de una pared, y los músculos de una cosa y otra no se parecen en nada. Lo
       que de verdad dice que es escalada son las palabras de escalar. */
    ['escalada', ['escalad', 'escalar', 'climbing', 'boulder', 'rocodromo',
      'rocódromo', 'via ferrata']],
    ['boxeo', ['boxe', 'boxing', 'muay', 'kickbox', 'karate', 'kárate', 'judo',
      'taekwondo', 'jiu', 'mma', 'sparring', 'artes marciales', 'saco de boxeo']],
    ['senderismo', ['sender', 'monte', 'montaña', 'montana', 'cerro', 'trek',
      'hik', 'subida', 'subí', 'subi', 'ascenso', 'excursion', 'trail']],
    ['equipo', ['futbol', 'fútbol', 'football', 'soccer', 'baloncesto', 'basquet',
      'basket', 'voley', 'volei', 'balonmano', 'rugby', 'partido', 'pachanga',
      'microfutbol', 'banquitas', 'volleyball', 'handball', 'match', 'kickabout']],
    ['raqueta', ['padel', 'pádel', 'tenis', 'tennis', 'squash', 'badminton',
      'pickleball', 'raqueta', 'racquet', 'ping pong', 'pimpon']],
    ['baile', ['bail', 'danza', 'danc', 'zumba', 'salsa', 'rumba', 'bachata']],
    /* Sin «saltar» a secas: «saltos al cajón» no es esto. Y va detrás de escalada
       porque «escalada con cuerda» es escalada, y manda la primera que casa. */
    ['comba', ['comba', 'lazo', 'cuerda', 'soga', 'skipping', 'jump rope', 'rope']],
    ['pilates', ['pilates', 'yoga']],
    ['estirar', ['estir', 'movilidad', 'flexibilidad', 'stretch', 'mobility']],
    ['pesas', ['pesas', 'gimnasio', 'gym', 'mancuerna', 'weights', 'lifting',
      'dumbbell']],
    ['caminar', ['caminar', 'camine', 'caminata', 'andar', 'anduve', 'paseo',
      'pasear', 'paseé', 'walk', 'stroll']]
  ];

  function actividadDelTexto(txt) {
    if (!g.I18N) return '';
    const t = I18N.norm(String(txt || ''));
    if (!t) return '';
    /* Por el principio de cada palabra, no por cualquier trozo: buscando
       trozos sueltos, «mudanza» entraba por «danza» y se apuntaba como baile.
       Así siguen valiendo las raíces —«camin» pilla «caminé» y «caminata»— sin
       colarse dentro de otra palabra. */
    const palabras = t.split(/[^a-z0-9]+/).filter(Boolean);
    let fuera = '';
    PISTAS.forEach(function (par) {
      if (fuera) return;
      par[1].forEach(function (pista) {
        if (fuera) return;
        /* Un «=» delante pide la palabra entera. Casi todas las pistas son raíces
           —«camin» vale para «caminé» y «caminata»— pero alguna es una palabra
           corta que vive dentro de otra: «remo» dentro de «remolque». */
        const exacta = String(pista).charAt(0) === '=';
        const pi = I18N.norm(exacta ? String(pista).slice(1) : pista);
        /* Las de dos palabras —«ping pong»— no caben en esa regla */
        if (pi.indexOf(' ') !== -1) { if (t.indexOf(pi) !== -1) fuera = par[0]; return; }
        if (palabras.some(function (w) {
          return exacta ? w === pi : w.indexOf(pi) === 0;
        })) fuera = par[0];
      });
    });
    return fuera;
  }

  /* ---------- lo que se escribe también dice cuándo y cuánto ----------
     «Trote una hora» lleva dentro los sesenta minutos y «jugué fútbol ayer»
     lleva el día. Pedirlos otra vez con dos rodillos es hacerle repetir lo que
     acaba de escribir.

     Es una tabla y no la IA: reconocer «una hora» no es una opinión, tiene que
     dar lo mismo siempre y funcionar sin cobertura. Y solo propone: en cuanto
     él toca un rodillo manda lo suyo y esto deja de meterse. */
  const NUMEROS = {
    un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6,
    siete: 7, ocho: 8, nueve: 9, diez: 10, quince: 15, veinte: 20, treinta: 30,
    cuarenta: 40, cuarentaycinco: 45, cincuenta: 50, sesenta: 60, noventa: 90,
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 0
  };

  function numeroDe(txt) {
    const n = Number(txt);
    if (n > 0) return n;
    return NUMEROS[String(txt)] || 0;
  }

  /* Devuelve minutos, o 0 si ahí no hay ninguna duración. */
  function minutosDelTexto(t) {
    /* «hora y media» antes que «hora», o se queda en sesenta. Y el número
       delante es opcional: «pádel hora y media» no lleva ninguno, y exigirlo
       dejaba la frase entera sin reconocer. */
    let m;
    if (/\b(?:horas?|hours?|hrs?|h)\s*y\s*media\b/.test(t)) {
      m = t.match(/(\d+|[a-z]+)\s+(?:horas?|hours?|hrs?|h)\s*y\s*media\b/);
      return ((m && numeroDe(m[1])) || 1) * 60 + 30;
    }
    if (/media\s*hora|half\s*an?\s*hour/.test(t)) return 30;
    /* «tres horas y diecinueve minutos»: sin esto se quedaba en las horas y
       tiraba los minutos, que es peor que no entender nada. */
    m = t.match(/(\d+|[a-z]+)\s*(?:horas?|hours?|hrs?|h)\s*y?\s*(\d+|[a-z]+)\s*(?:minutos?|minutes?|mins?)\b/);
    if (m && numeroDe(m[1]) && numeroDe(m[2])) {
      return numeroDe(m[1]) * 60 + numeroDe(m[2]);
    }
    /* 1:30 y 1h30 */
    m = t.match(/(\d+)\s*[:h]\s*(\d{1,2})\b/);
    if (m) return Number(m[1]) * 60 + Number(m[2]);
    m = t.match(/(\d+|[a-z]+)\s*(?:horas?|hours?|hrs?|h)\b/);
    if (m && numeroDe(m[1])) return numeroDe(m[1]) * 60;
    m = t.match(/(\d+|[a-z]+)\s*(?:minutos?|minutes?|mins?)\b/);
    if (m && numeroDe(m[1])) return numeroDe(m[1]);
    return 0;
  }

  const DIAS_TXT = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const DIAS_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  /* Devuelve cuántos días atrás, o -1 si no lo dice. */
  function diaDelTexto(t) {
    if (/\banteayer\b|\bantier\b|\bantes\s*de\s*ayer\b/.test(t)) return 2;
    if (/\bayer\b|\byesterday\b/.test(t)) return 1;
    if (/\bhoy\b|\btoday\b/.test(t)) return 0;

    const palabras = t.split(/[^a-z0-9]+/);
    const hoy = new Date().getDay();
    let fuera = -1;
    DIAS_TXT.forEach(function (nombre, dow) {
      if (fuera !== -1) return;
      if (palabras.indexOf(nombre) === -1 && palabras.indexOf(DIAS_EN[dow]) === -1) return;
      /* El de la semana pasada y no el que viene: esto sirve para apuntar algo
         que ya se hizo. Y si cae en el mismo día de la semana que hoy, es hoy:
         nadie escribe «el lunes» un lunes para hablar del lunes anterior. */
      fuera = (hoy - dow + 7) % 7;
    });
    return fuera;
  }

  /* {min, atras} con lo que se haya reconocido; cada uno puede venir vacío. */
  function cuandoYCuantoDelTexto(txt) {
    if (!g.I18N) return { min: 0, atras: -1 };
    const t = I18N.norm(String(txt || ''));
    if (!t) return { min: 0, atras: -1 };
    return { min: minutosDelTexto(t), atras: diaDelTexto(t) };
  }

  function apuntarActividad() {
    const p = Perfil.datos();
    const peso = Number(p && p.peso) || 75;
    /* Sin actividad de salida: «Caminar» puesto es la app decidiendo por él. */
    const MIN_DEFECTO = 60;
    const elegido = { act: '', min: MIN_DEFECTO, atras: 0, nombre: '', ia: null };
    const conIA = !!(g.IA && IA.activa());

    /* El MET lo pone el chip, salvo que la IA haya mirado lo que escribió: ella
       distingue un partido de fútbol de una pachanga, y el chip no. */
    const metDe = function () {
      if (elegido.ia && elegido.ia.met) return elegido.ia.met;
      const a = ACTIVIDADES.filter(function (x) { return x.id === elegido.act; })[0];
      return a ? a.met : 0;
    };

    const kcalDe = function () {
      return Math.round(metDe() * peso * elegido.min / 60);
    };

    /* Los músculos, igual: los de la IA si los hay, y si no los del chip. */
    const musculosDe = function () {
      if (elegido.ia && elegido.ia.musculos && elegido.ia.musculos.length) {
        return elegido.ia.musculos.slice();
      }
      const a = ACTIVIDADES.filter(function (x) { return x.id === elegido.act; })[0];
      return a ? (a.musculos || []).slice() : [];
    };

    const diasHTML = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const et = i === 0 ? T('Hoy') : i === 1 ? T('Ayer') : UI.diaLargo(UI.DAY_NAMES[d.getDay()]);
      diasHTML.push('<button class="chip ' + (i === 0 ? 'on' : '') + '" data-cuando="' +
        i + '">' + esc(et) + '</button>');
    }

    /* Los músculos que se van a apuntar, en una fila. La hoja los guardaba sin
       decir nunca cuáles, y es justo el dato por el que se pregunta después al
       mirar el reparto. */
    const musculosEnFila = function (ms, id) {
      const l = (ms || []).map(function (m) { return I18N.muscle(m); });
      if (l.length) return l.join(' \u00b7 ');
      return id === 'otro'
        ? T('No apunta músculos: puede ser cualquier cosa')
        : T('Sin músculos concretos');
    };

    const diasDelRodillo = function () {
      const out = [];
      for (let k = 0; k < 7; k++) {
        const d = new Date(Date.now() - k * 86400000);
        out.push({ v: k, et: k === 0 ? T('Hoy') : k === 1 ? T('Ayer')
          : UI.diaLargo(UI.DAY_NAMES[d.getDay()]) });
      }
      return out;
    };

    const isoDe = function (atras) {
      const d = new Date(Date.now() - atras * 86400000);
      const mes = String(d.getMonth() + 1);
      const dia = String(d.getDate());
      return d.getFullYear() + '-' + (mes.length < 2 ? '0' + mes : mes) +
        '-' + (dia.length < 2 ? '0' + dia : dia);
    };

    UI.modal(html`
      <h2>${T('Apuntar algo que ya hice')}</h2>
      <p class="muted" style="margin:0 0 14px">${T('Entra en tu historial y en tu racha ' +
      'como un entrenamiento más.')}</p>

      <input id="ac-nombre" class="ac-campo" autocomplete="off"
             placeholder="${T('¿Qué hiciste? Trote una hora, jugué fútbol ayer…')}">

      <!-- Lo que la app ha entendido. Empieza vacía a propósito: traer «Caminar»
           puesto es decidir por él, y si no lo cambia se guarda algo que no hizo. -->
      <div class="ac-ficha">
        <div class="ac-cab">
          <div class="grow">
            <div class="ac-nom" id="ac-nom"></div>
            <div class="ac-mus" id="ac-mus"></div>
          </div>
          <button class="btn sm" id="ac-cambiar">${T('Elegir')}</button>
        </div>
      </div>

      <div class="ac-lista" id="ac-lista" hidden>
        ${raw(ACTIVIDADES.map(function (a) {
          return '<div class="list-row tap" data-act="' + esc(a.id) + '">' +
            '<div class="grow"><div class="list-row-title">' + esc(T(a.label)) + '</div>' +
            '<div class="list-row-sub">' + esc(musculosEnFila(a.musculos, a.id)) + '</div></div>' +
            '<span class="ac-tic">' + icon('check') + '</span></div>';
        }).join(''))}
      </div>

      <!-- El rodillo para lo de siempre y los campos para lo de verdad: una
           caminata de hace tres semanas o unos cuarenta y siete minutos no caben
           en una rueda de siete días y saltos de cinco. Mandan los campos; la
           rueda es el atajo, y cuando no puede representar lo escrito se apaga
           en vez de enseñar un valor que no es. -->
      <div class="rodillo">
        <div class="rod-cab">
          <span>${T('CUÁNDO')}</span><span>${T('CUÁNTO TIEMPO')}</span>
        </div>
        <div class="rod-cuerpo">
          <div class="rod-marca"></div>
          <div class="rod-col" id="rod-dia"></div>
          <div class="rod-col" id="rod-min"></div>
        </div>
        <div class="rod-pie">
          <input type="date" id="ac-fecha" class="rod-campo" max="${isoDe(0)}"
                 aria-label="${T('Fecha')}">
          <label class="rod-campo rod-campo-min">
            <input type="number" id="ac-minman" inputmode="numeric" min="1" max="600"
                   aria-label="${T('Minutos')}">
            <span>${T('min')}</span>
          </label>
        </div>
      </div>

      <!-- La IA, aquí abajo y sola. Arriba era un botón en mitad de la hoja que
           había que acordarse de pulsar. -->
      <div class="ac-ia-caja" id="ac-ia-caja" hidden>
        <span class="ac-ia-ico">${raw(icon('chispa'))}</span>
        <span class="grow" id="ac-ia-txt"></span>
        <button class="ac-ia-otra" id="ac-ia-btn" hidden>${T('Que lo mire la IA')}</button>
      </div>

      <div class="ac-pie">
        <span class="ac-kcal" id="ac-kcal"></span>
        ${raw(conIA ? '<button class="btn sm" id="ac-analizar" disabled>' + icon('chispa') +
          ' ' + esc(T('Analizar')) + '</button>' : '')}
        <button class="btn primary grow" id="ac-ok" disabled>${T('Apuntar')}</button>
      </div>`,
      function (el) {
        const $ = function (sel) { return el.querySelector(sel); };
        const actual = function () {
          return ACTIVIDADES.filter(function (x) { return x.id === elegido.act; })[0] || null;
        };

        /* Todo lo que se ve de la decisión sale de aquí, y por eso se repinta
           entero: da igual si cambió por lo que escribió, por la lista o por la
           IA, lo que se enseña es siempre lo que se va a guardar. */
        const pintarFicha = function () {
          const a = actual();
          const r = elegido.ia;
          $('#ac-nom').textContent = a ? T(a.label) : T('Elige qué fue');
          $('#ac-nom').classList.toggle('vacia', !a);
          $('#ac-mus').textContent = a
            ? musculosEnFila(musculosDe(), a.id)
            : T('De aquí salen las calorías y los músculos que se apuntan.');
          $('#ac-mus').classList.toggle('de-ia', !!(r && r.musculos && r.musculos.length));
          $('#ac-cambiar').textContent = $('#ac-lista').hidden
            ? (a ? T('Cambiar') : T('Elegir')) : T('Cerrar');
          $('#ac-ok').disabled = !a;
          /* Analizar sin saber qué fue no da un análisis, da un horóscopo. */
          if ($('#ac-analizar')) $('#ac-analizar').disabled = !a;
          el.querySelectorAll('#ac-lista [data-act]').forEach(function (f) {
            f.classList.toggle('elegida', !!a && f.dataset.act === elegido.act);
          });
        };

        /* Sin actividad no hay MET, y sin MET no hay calorías que enseñar: un
           cero ahí parecería un resultado en vez de una pregunta sin contestar. */
        const pintarKcal = function () {
          $('#ac-kcal').textContent = actual()
            ? Tn('~{kcal} kcal', { kcal: UI.num(kcalDe()) }) : '';
        };

        /* ---------- cuándo y cuánto ---------- */
        const campoFecha = $('#ac-fecha');
        const campoMin = $('#ac-minman');

        const pintarFecha = function () { campoFecha.value = isoDe(elegido.atras); };
        const pintarMin = function () { campoMin.value = elegido.min; };

        /* La rueda se apaga cuando no puede decir la verdad: el valor vive en el
           campo, y una rueda marcando «45» con 47 escritos al lado es el mismo
           fallo de enseñar una cosa y guardar otra, solo que más pequeño. */
        const rodDia = UI.rodillo($('#rod-dia'), diasDelRodillo(), 0, function (v) {
          elegido.atras = v;
          elegido.diaAMano = true;
          pintarFecha();
        });
        const rodMin = UI.rodillo($('#rod-min'), minutosDelRodillo(), MIN_DEFECTO, function (v) {
          elegido.min = v;
          elegido.minAMano = true;
          pintarMin();
          pintarKcal();
        });

        const sincroDia = function () {
          $('#rod-dia').classList.toggle('fuera', !rodDia.poner(elegido.atras));
        };
        const sincroMin = function () {
          $('#rod-min').classList.toggle('fuera', !rodMin.poner(elegido.min));
        };

        campoFecha.onchange = function () {
          if (!campoFecha.value) { pintarFecha(); return; }
          /* Al mediodía los dos, que si no el cambio de hora se come un día. */
          const puesta = new Date(campoFecha.value + 'T12:00:00');
          const hoy = new Date();
          hoy.setHours(12, 0, 0, 0);
          const atras = Math.round((hoy - puesta) / 86400000);
          if (!(atras >= 0)) { pintarFecha(); return; }
          elegido.atras = atras;
          elegido.diaAMano = true;
          sincroDia();
        };

        campoMin.oninput = function () {
          const v = Math.round(Number(campoMin.value));
          if (!(v > 0)) return;
          elegido.min = Math.min(600, v);
          elegido.minAMano = true;
          sincroMin();
          pintarKcal();
        };

        /* ---------- qué hice ---------- */
        $('#ac-cambiar').onclick = function () {
          const lista = $('#ac-lista');
          lista.hidden = !lista.hidden;
          pintarFicha();
          if (!lista.hidden) {
            const puesta = lista.querySelector('.elegida');
            if (puesta) puesta.scrollIntoView({ block: 'nearest' });
          }
        };

        el.querySelectorAll('#ac-lista [data-act]').forEach(function (f) {
          f.onclick = function () {
            elegido.act = f.dataset.act;
            elegido.aMano = true;
            /* Elegir a mano es contestar a lo mismo que contestaría la IA. Manda
               lo último que se haya tocado, y desde aquí ella no vuelve sola. */
            elegido.ia = null;
            $('#ac-lista').hidden = true;
            $('#ac-ia-caja').hidden = true;
            pintarFicha();
            pintarKcal();
          };
        });

        /* Borrar lo escrito deja la hoja como al abrirla. Sin esto, vaciar el
           campo se quedaba con la actividad, los minutos, el día y el análisis
           de lo anterior, y Apuntar seguía encendido: se guardaba una sesión
           que ya no se había escrito en ninguna parte. */
        const reiniciar = function () {
          elegido.act = '';
          elegido.ia = null;
          elegido.aMano = false;
          elegido.minAMano = false;
          elegido.diaAMano = false;
          elegido.min = MIN_DEFECTO;
          elegido.atras = 0;
          ultimoIA = '';
          $('#ac-lista').hidden = true;
          $('#ac-ia-caja').hidden = true;
          $('#ac-ia-txt').textContent = '';
          sincroDia();
          sincroMin();
          pintarFecha();
          pintarMin();
          pintarFicha();
          pintarKcal();
        };

        $('#ac-nombre').oninput = function (ev) {
          elegido.nombre = ev.target.value.trim();
          clearTimeout(esperaIA);
          if (!elegido.nombre) { reiniciar(); return; }

          /* Lo que escribe propone el esfuerzo… */
          if (!elegido.aMano) elegido.act = actividadDelTexto(elegido.nombre) || 'otro';
          /* …y también el día y el rato, si los lleva dentro. */
          const leido = cuandoYCuantoDelTexto(elegido.nombre);
          if (leido.min && !elegido.minAMano) {
            elegido.min = leido.min;
            sincroMin();
            pintarMin();
          }
          if (leido.atras >= 0 && !elegido.diaAMano) {
            elegido.atras = leido.atras;
            sincroDia();
            pintarFecha();
          }
          pintarFicha();
          pintarKcal();
          prontoIA();
        };

        /* ---------- la IA, sola ---------- */
        let esperaIA = null;
        let ultimoIA = '';

        const decirIA = function (txt, clase) {
          const caja = $('#ac-ia-caja');
          caja.hidden = false;
          caja.className = 'ac-ia-caja' + (clase ? ' ' + clase : '');
          $('#ac-ia-txt').textContent = txt;
        };

        /* Se pregunta por lo escrito y nada más —los minutos no cambian qué
           actividad es ni qué mueve— así que volver sobre lo mismo sale de la
           caché y no cuesta nada. El respiro es para no gastar una llamada por
           cada letra que teclea. */
        const lanzarIA = function (aMano) {
          if (!conIA) return;
          const t = $('#ac-nombre').value.trim();
          if (t.length < 3) return;
          if (!aMano && t === ultimoIA) return;
          ultimoIA = t;
          $('#ac-ia-btn').hidden = true;
          decirIA(T('Mirando qué fue…'), '');

          IA.estimarActividad(t).then(function (r) {
            /* Si mientras contestaba él siguió escribiendo, esto ya es de otra
               actividad y meterlo sería peor que no decir nada. */
            if ($('#ac-nombre').value.trim() !== t) return;
            if (!r || !r.met) {
              decirIA((r && r.nota) || T('Eso no me suena a actividad física.'), 'mal');
              $('#ac-ia-btn').hidden = false;
              return;
            }
            elegido.ia = r;
            /* Ella devuelve cómo se llama eso —«Escalada»— y ese nombre sí suele
               estar en la tabla aunque lo que él escribió no estuviera. Sin esto
               la ficha decía «Otra cosa» con los músculos de la escalada debajo. */
            if (!elegido.act || elegido.act === 'otro') {
              elegido.act = actividadDelTexto(r.nombre) || actividadDelTexto(t) ||
                elegido.act || 'otro';
            }
            decirIA(r.nota || T('Afinado por la IA.'), 'ok');
            pintarFicha();
            pintarKcal();
          }).catch(function (e) {
            if ($('#ac-nombre').value.trim() !== t) return;
            ultimoIA = '';
            /* Sin red no es un fallo, es un «luego»: lo que llega aquí es el
               error de un fetch que no salió, y enseñarlo tal cual —«Failed to
               fetch»— parece que el apunte no vale. Vale: se guarda con lo que
               la app sabe por reglas y se afina cuando haya cobertura. */
            decirIA(navigator.onLine === false
              ? T('Sin internet. Apúntalo igual: lo afino en cuanto haya red.')
              : (e.message || T('No he podido calcularlo.')),
              navigator.onLine === false ? '' : 'mal');
            $('#ac-ia-btn').hidden = false;
          });
        };

        /* No se mete cuando él ya ha elegido a mano: eso sería contestar por
           encima de lo que acaba de decidir. */
        const prontoIA = function () {
          if (!conIA || elegido.aMano) return;
          clearTimeout(esperaIA);
          esperaIA = setTimeout(function () { lanzarIA(false); }, 1300);
        };

        if ($('#ac-ia-btn')) $('#ac-ia-btn').onclick = function () { lanzarIA(true); };

        /* ---------- la lectura completa ----------
           La de arriba contesta a «qué es esto» en cuanto uno escribe. Esta
           contesta a «qué me ha hecho», y para eso hace falta la duración ya
           puesta: por eso se pide aquí abajo y a mano. */
        const botonAnalisis = $('#ac-analizar');
        if (botonAnalisis) botonAnalisis.onclick = function () {
          const a = actual();
          if (!a) return;
          botonAnalisis.disabled = true;
          decirIA(T('Mirando qué te ha hecho…'), '');

          IA.analizarActividad({
            nombre: elegido.nombre || T(a.label),
            minutos: elegido.min,
            musculos: musculosDe()
          }).then(function (r) {
            botonAnalisis.disabled = false;
            const filas = [
              /* Lo primero, si reconoció el sitio. Es la única línea que demuestra
                 que ha mirado QUÉ hizo y no solo cuánto duró, y va vacía cuando no
                 lo conoce, que también es una respuesta. */
              [T('En concreto'), r.sitio],
              [T('Intensidad'), r.intensidad],
              [T('Carga'), r.carga],
              [T('Músculo'), r.musculo],
              [T('Ojo'), r.ojo]
            ].filter(function (f) { return f[1]; });
            if (!filas.length) { decirIA(T('No ha dicho nada.'), 'mal'); return; }
            /* Se pinta a mano y no con innerHTML de la respuesta: esto viene de
               fuera y no se convierte en código por mucho que lo parezca. */
            const caja = $('#ac-ia-caja');
            caja.hidden = false;
            caja.className = 'ac-ia-caja ok';
            const txt = $('#ac-ia-txt');
            txt.textContent = '';
            filas.forEach(function (f) {
              const fila = document.createElement('div');
              fila.className = 'ac-ia-fila';
              const et = document.createElement('b');
              et.textContent = f[0] + ': ';
              fila.appendChild(et);
              fila.appendChild(document.createTextNode(f[1]));
              txt.appendChild(fila);
            });
          }).catch(function (e) {
            botonAnalisis.disabled = false;
            decirIA(e.message || T('No he podido calcularlo.'), 'mal');
          });
        };

        pintarFicha();
        pintarKcal();
        pintarFecha();
        pintarMin();

        el.querySelector('#ac-ok').onclick = function () {
          const a = ACTIVIDADES.filter(function (x) { return x.id === elegido.act; })[0];
          /* El botón está apagado sin actividad, pero un guardado sin ella
             escribiría una sesión de la que no se sabe nada. */
          if (!a) return;
          const fin = Date.now() - elegido.atras * 86400000;
          const comoSeLlama = elegido.nombre || T(a.label);
          /* Lo que escribió él, no el nombre del chip: «subí a Monserrate
             andando» es lo que hay que volver a preguntar, y «Caminar» no. */
          const escrito = String(elegido.nombre || '').trim();
          Store.addSession({
            routineName: comoSeLlama,
            start: fin - elegido.min * 60000,
            end: fin,
            entries: [],
            setsDone: 0,
            volume: 0,
            manual: true,
            actividad: a.id,
            minutos: elegido.min,
            kcal: kcalDe(),
            /* Sin esto la sesión no decía de qué fue: el historial la dejaba en
               «apuntado a mano» y la pierna seguía contando como abandonada
               después de un partido. */
            musculos: musculosDe(),
            nota: (elegido.ia && elegido.ia.nota) || '',
            origen: elegido.ia ? 'ia' : 'medio',
            /* Lo que escribió, tal cual, para poder volver a preguntarlo. Sin
               esto, un apunte hecho sin cobertura no se puede afinar después:
               «Caminar · 90 min» no dice que fueron setecientos metros de
               desnivel, y el texto sí. */
            texto: escrito,
            /* A medias: lo apuntado vale y cuenta desde ya, pero el MET y los
               músculos son los del chip y la IA no ha llegado a mirarlos.
               `pendientes.js` lo repasa en cuanto haya internet. */
            pendiente: !elegido.ia && !!escrito
          });
          UI.closeModal();
          render();
          UI.toast(!elegido.ia && escrito
            ? Tn('{que} apuntado: {min} min. Lo afino cuando haya internet.',
              { que: comoSeLlama, min: elegido.min })
            : Tn('{que} apuntado: {min} min',
              { que: comoSeLlama, min: elegido.min }));
        };
      });
  }

  /* ================= asistente: plan semanal ================= */

  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  let planState = {
    days: ['Lun', 'Mar', 'Jue', 'Vie'],
    minutes: 60,
    gear: 'gym',
    goal: 'hipertrofia',
    level: 'intermediate',
    preview: null
  };

  function viewPlan() {
    const p = planState;
    /* el lugar siempre viene de lo que eligió al entrar; aquí solo se muestra */
    p.gear = Store.settings().gear || 'gym';

    if (p.preview) return planPreview(p);

    return html`
      <h1>${T('Crea tu plan semanal')}</h1>
      <p class="muted">${T('Responde cuatro cosas y te organizo la semana: qué grupo ' +
      'muscular toca cada día y con qué ejercicios, ajustado al tiempo que tengas.')}</p>

      <div class="card">
        <div class="row between" style="margin-bottom:9px">
          <b>${T('¿Qué días entrenas?')}</b>
          <span class="chip solid" id="p-ndias">${Tp(p.days.length, '{n} día', '{n} días')}</span>
        </div>
        <div class="row wrap" style="gap:6px">
          ${raw(DIAS.map(function (d) {
            return '<button class="chip ' + (p.days.indexOf(d) !== -1 ? 'on' : '') +
                   '" data-pday="' + d + '">' + UI.diaLargo(d) + '</button>';
          }).join(''))}
        </div>
        <div class="tiny" style="margin-top:9px" id="p-split"></div>
      </div>

      <div class="card">
        <b>${T('¿Cuánto dura cada sesión?')}</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw([30, 45, 60, 75, 90].map(function (m) {
            return '<button class="chip ' + (p.minutes === m ? 'on' : '') +
                   '" data-pmin="' + m + '">' + esc(Tn('{n} min', { n: m })) + '</button>';
          }).join(''))}
        </div>
      </div>

      <div class="card">
        <div class="row between">
          <div class="grow">
            <b>${Tn('Entrenas {donde}',
              { donde: Data.gearFrase(Data.GEAR[p.gear] ? p.gear : 'gym') })}</b>
            <div class="tiny">${T('Solo usaré ejercicios que puedas hacer ahí')}</div>
          </div>
          <button class="btn sm" data-a="cambiarlugar">${T('Cambiar')}</button>
        </div>
      </div>

      <div class="card">
        <b>${T('¿Cuál es tu objetivo?')}</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw(Object.keys(Planner.GOALS).map(function (k) {
            return '<button class="chip ' + (p.goal === k ? 'on' : '') +
                   '" data-pgoal="' + k + '">' + esc(T(Planner.GOALS[k].label)) + '</button>';
          }).join(''))}
        </div>
        <div class="hr"></div>
        <b>${T('¿Qué experiencia tienes?')}</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw(Object.keys(I18N.LEVEL).map(function (k) {
            return '<button class="chip ' + (p.level === k ? 'on' : '') +
                   '" data-plevel="' + k + '">' + esc(I18N.level(k)) + '</button>';
          }).join(''))}
        </div>
      </div>

      <button class="btn primary block" data-a="generar" style="margin-top:16px">
        ${raw(icon('flag'))} ${T('Generar mi plan')}
      </button>`;
  }

  function planPreview(p) {
    const plan = p.preview;
    return html`
      <button class="btn sm ghost" data-a="volver" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Cambiar respuestas')}</button>
      <h1>${Tn('Tu plan de {n} días', { n: plan.length })}</h1>
      <p class="muted">${T('Así queda tu semana. Al guardarlo se crea una rutina por ' +
      'día, y podrás editarlas como quieras.')}</p>

      <div class="stack">
        ${raw(plan.map(function (r, i) {
          return html`
            <div class="card">
              <div class="row between" style="align-items:flex-start">
                <div class="grow">
                  <div style="font-weight:700">${r.name}</div>
                  <div class="tiny">${Tn('{n} ejercicios · ~{min} min',
                    { n: r.exercises.length, min: Planner.estimate(r) })} ·
                    ${r.muscles.map(I18N.muscle).join(' · ')}</div>
                </div>
                <button class="btn icon sm" data-pdet="${i}" aria-label="${T('Ver ejercicios')}">
                  ${raw(icon('down'))}</button>
              </div>
              <div class="stack" data-pbody="${i}" hidden style="margin-top:10px">
                ${raw(r.exercises.map(function (re, k) {
                  const ex = Data.get(re.exId);
                  return html`
                    <div class="rt-item">
                      <div class="rt-idx">${k + 1}</div>
                      <img src="${ex ? Data.img(ex, 0) : Data.PLACEHOLDER}" alt="" loading="lazy">
                      <div class="grow">
                        <div style="font-weight:600;font-size:.84rem">${ex ? ex.nameEs : re.exId}</div>
                        <div class="tiny">${re.sets} × ${re.reps} · ${Tn('descanso {n}s',
                          { n: re.rest })} ·
                          ${ex ? I18N.muscle(ex.primaryMuscles[0]) : ''}</div>
                      </div>
                    </div>`;
                }).join(''))}
              </div>
            </div>`;
        }).join(''))}
      </div>

      <div class="row" style="margin-top:16px">
        <button class="btn grow" data-a="otra">${raw(icon('copy'))} ${T('Otra propuesta')}</button>
        <button class="btn primary grow" data-a="guardarplan">${raw(icon('check'))} ${T('Guardar plan')}</button>
      </div>
      <p class="tiny" style="margin-top:10px">${Tn('Guardar añade {n} rutinas nuevas; ' +
      'no se borra nada de lo que ya tengas.', { n: plan.length })}</p>`;
  }

  viewPlan.mount = function (root) {
    const p = planState;

    function refrescarSplit() {
      const el = root.querySelector('#p-split');
      if (!el) return;
      const n = Math.min(6, Math.max(1, p.days.length));
      const split = Planner.SPLITS[n];
      el.innerHTML = p.days.length
        ? esc(Tn('Con {dias} te propongo: {split}',
            { dias: Tp(p.days.length, '{n} día', '{n} días'),
              split: split.map(function (s) { return T(s.name); }).join(' · ') }))
        : esc(T('Elige al menos un día.'));
      const chip = root.querySelector('#p-ndias');
      if (chip) chip.textContent = Tp(p.days.length, '{n} día', '{n} días');
    }
    refrescarSplit();

    bindAll(root, '[data-pday]', function (el) {
      const d = el.dataset.pday;
      const i = p.days.indexOf(d);
      if (i === -1) {
        if (p.days.length >= 6) { UI.toast(T('Seis días es el máximo recomendable')); return; }
        p.days.push(d);
        p.days.sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); });
      } else p.days.splice(i, 1);
      el.classList.toggle('on', i === -1);
      refrescarSplit();
    });

    bindAll(root, '[data-pmin]', function (el) { p.minutes = Number(el.dataset.pmin); render(); });
    bind(root, '[data-a=cambiarlugar]', lugarSheet);
    bindAll(root, '[data-pgoal]', function (el) { p.goal = el.dataset.pgoal; render(); });
    bindAll(root, '[data-plevel]', function (el) { p.level = el.dataset.plevel; render(); });

    bind(root, '[data-a=generar]', function () {
      if (!p.days.length) { UI.toast(T('Elige al menos un día de entrenamiento')); return; }
      p.preview = Planner.generate(p);
      render();
      window.scrollTo(0, 0);
    });

    bind(root, '[data-a=volver]', function () { p.preview = null; render(); });
    bind(root, '[data-a=otra]', function () {
      p.preview = Planner.generate(p);
      render();
      UI.toast(T('Nueva propuesta generada'));
    });

    bindAll(root, '[data-pdet]', function (el) {
      const body = root.querySelector('[data-pbody="' + el.dataset.pdet + '"]');
      if (body) body.hidden = !body.hidden;
    });

    bind(root, '[data-a=guardarplan]', function () {
      p.preview.forEach(function (r) {
        Store.saveRoutine({ id: null, name: r.name, note: r.note, days: r.days, exercises: r.exercises });
      });
      const n = p.preview.length;
      p.preview = null;
      UI.toast(Tn('Plan guardado: {n} rutinas creadas', { n: n }));
      go('rutinas');
      Offline.precargarRutinas();
    });
  };

  /* ================= editor de rutina ================= */

  let draft = null;

  /* La lectura de la IA sobre ESTA rutina. Vive fuera del borrador porque no
     forma parte de la rutina: se pide, se aplica lo que valga y se tira. */
  let revIA = { id: null, cargando: false, datos: null };

  /* Qué rutina hay que auditar nada más abrir el editor. Pedirlo desde la lista
     y tener que buscar el botón al final de la pantalla de edición era esconder
     lo que más se usa. */
  let auditarAlEntrar = null;

  function auditarDesdeLista(id) {
    if (!IA.activa()) { go('claves'); UI.toast(T('Elige proveedor de IA y pon su clave')); return; }
    auditarAlEntrar = id;
    go('rutina', id);
  }

  function auditoriaHTML() {
    if (!draft.id || !draft.exercises.length) return '';

    if (revIA.cargando) {
      return html`
        <div class="card center" style="margin-top:16px">
          <div class="spinner" style="margin:6px auto"></div>
          <p class="tiny" style="margin:8px 0 0">${T('Auditando esta rutina…')}</p>
        </div>`;
    }

    const r = revIA.id === draft.id ? revIA.datos : null;
    if (!r) {
      return html`
        <button class="btn block" data-a="auditar" style="margin-top:16px">
          ${raw(icon('chispa'))} ${T('Que la IA revise esta rutina')}
        </button>
        <p class="tiny" style="margin:7px 0 0">${IA.activa()
          ? T('La lee con tu perfil y tu historial delante, le pone nota y propone cambios que aplicas de un toque.')
          : T('Necesita un proveedor de IA con su clave, en Ajustes → Bóveda de claves.')}</p>`;
    }

    const nota = Number(r.nota);
    return html`
      <div class="list-head">
        <span class="list-title">${T('Lo que dice el entrenador')}</span>
        <button class="btn sm ghost" data-a="olvidarAuditoria">${T('Descartar')}</button>
      </div>
      <div class="card">
        ${raw(nota > 0 ? html`
          <div class="row" style="gap:12px;align-items:center;margin-bottom:10px">
            <div style="flex:none;font-size:1.9rem;font-weight:700;line-height:1;color:${raw(
              nota >= 8 ? 'var(--acc)' : nota >= 6 ? 'var(--warn)' : 'var(--bad)')}">${nota}<span
                 style="font-size:.9rem;color:var(--dim2)">/10</span></div>
            <div class="tiny grow">${T('Nota que le pone a esta rutina tal y como está.')}</div>
          </div>` : '')}
        <p style="margin:0 0 10px">${r.veredicto || ''}</p>
        ${raw((r.puntos || []).map(function (x) {
          return '<div class="error-item"><b>' + esc(x.titulo || '') + '</b><p>' +
            esc(x.detalle || '') + '</p></div>';
        }).join(''))}
      </div>

      ${raw(resueltaHTML(r))}

      ${raw((r.cambios || []).length ? html`
        <div class="card">
          <b>${T('Los cambios, para aplicarlos de uno en uno')}</b>
          <div class="stack" style="margin-top:9px">
            ${raw(r.cambios.map(function (c, i) {
              const acc = accionRutina(c);
              const etiqueta = T({ quitar: 'Quitar', anadir: 'Añadir', cambiar: 'Sustituir',
                orden: 'Reordenar', descanso: 'Descanso', series: 'Series' }[acc] || 'Cambiar');
              const que = acc === 'quitar' ? c.quitar
                : acc === 'anadir' ? c.poner
                : acc === 'orden' ? ((c.lista || []).length
                    ? Tn('Los básicos delante en {que}', { que: c.sobre })
                    : Tn('{que} al {n}.º', { que: c.sobre, n: c.posicion || 1 }))
                : acc === 'descanso'
                  ? Tn('{que} a {n}s', { que: c.sobre, n: c.rest || 0 })
                : acc === 'series'
                  ? Tn('{que} a {n} series', { que: c.sobre, n: c.series || 0 })
                : Tn('{nuevo} en lugar de {viejo}', { nuevo: c.poner, viejo: c.quitar });
              return html`
                <div class="row between" style="gap:10px;align-items:flex-start">
                  <div class="grow">
                    <div style="font-size:.86rem">
                      <span class="chip tiny-chip">${etiqueta}</span>
                      <b>${que}</b></div>
                    <div class="tiny">${c.porque || ''}</div>
                  </div>
                  <div class="row" style="gap:6px;flex:none">
                    <button class="btn sm" data-rcambio="${i}">${T('Aplicar')}</button>
                    <button class="btn sm ghost" data-rnocambio="${i}"
                            aria-label="${T('Descartar')}">✕</button>
                  </div>
                </div>`;
            }).join(''))}
          </div>
          <p class="tiny" style="margin:10px 0 0">${T('Se comprueba antes de aplicarlo: ' +
          'si el ejercicio no existe, no cabe con tu material o choca con tus ' +
          'limitaciones, se descarta. Lo que apliques se guarda en la rutina al momento.')}</p>
        </div>` : '')}

      ${raw(r.consejo ? html`
        <div class="card destacado-clave">
          <h3 class="guia-h">${raw(icon('chispa'))} ${T('Si solo haces una cosa')}</h3>
          <p style="margin:0">${r.consejo}</p>
        </div>` : '')}

      <button class="btn block" data-a="auditar" style="margin-top:12px">
        ${raw(icon('chispa'))} ${T('Analizar otra vez')}</button>
      <p class="tiny" style="margin:7px 0 0">${T('Con los cambios que acabas de aplicar ' +
      'delante, el dictamen cambia. Cada pulsación es una llamada a la IA.')}</p>`;
  }

  /* La rutina entera ya corregida, no solo los parches. Es lo que uno quiere
     de verdad cuando pide que le revisen algo: «pues móntamela bien». Se
     resuelve contra el catálogo antes de enseñarla, así que lo que se ve es
     exactamente lo que va a quedar guardado. */
  function rutinaPropuesta(r) {
    const filas = (r && r.rutina) || [];
    if (filas.length < 2) return null;

    const gear = Store.settings().gear;
    const claves = Programa.lesionesDe(Perfil.datos().lesiones);
    const fuera = [];
    const dentro = [];
    const vistos = {};

    filas.forEach(function (f) {
      const nombre = String(f.ejercicio || f.nombre || '').trim();
      const ex = Data.porNombreEs(nombre) ||
        (Data.search({ q: nombre, gear: gear }) || [])[0];
      if (!ex) { fuera.push(Tn('{que} (no está en el catálogo)', { que: nombre })); return; }
      if (vistos[ex.id]) return;

      const patron = Alt.patron(ex);
      const prohibido = claves.some(function (k) {
        return (Programa.LESIONES[k].patronesFuera || []).indexOf(patron) !== -1;
      });
      if (prohibido) {
        fuera.push(Tn('{que} (choca con tus limitaciones)', { que: ex.nameEs }));
        return;
      }

      vistos[ex.id] = true;
      dentro.push({
        ex: ex,
        porque: f.porque || '',
        fila: {
          exId: ex.id,
          sets: Math.min(15, Math.max(1, Number(f.series) || 3)),
          reps: Math.min(200, Math.max(1, Number(f.reps) || 10)),
          weight: 0,
          rest: Math.min(600, Math.max(0, Number(f.descanso) || 90)),
          note: f.porque || ''
        }
      });
    });

    if (dentro.length < Store.MINIMO_EJERCICIOS) return null;
    return { dentro: dentro, fuera: fuera };
  }

  function resueltaHTML(r) {
    const prop = rutinaPropuesta(r);
    if (!prop) return '';

    return html`
      <div class="card" style="border-color:var(--acc)">
        <b>${T('Cómo la dejaría él')}</b>
        <p class="tiny" style="margin:5px 0 10px">${T('La rutina entera rehecha, en el ' +
        'orden en que hay que hacerla. Sustituye a la de arriba de una vez.')}</p>

        <div class="stack" style="gap:0">
          ${raw(prop.dentro.map(function (x, i) {
            return html`
              <div class="rt-item" style="border-top:${raw(i ? '1px solid var(--line)' : '0')}">
                <img src="${Data.img(x.ex, 0)}" alt="" loading="lazy">
                <div class="grow">
                  <div style="font-weight:600;font-size:.86rem">${i + 1}. ${x.ex.nameEs}</div>
                  <div class="tiny">${x.fila.sets} × ${x.fila.reps} ·
                    ${Tn('descanso {n}s', { n: x.fila.rest })}${raw(x.porque
                      ? ' · <span style="color:var(--acc)">' + esc(x.porque) + '</span>' : '')}</div>
                </div>
              </div>`;
          }).join(''))}
        </div>

        ${raw(prop.fuera.length ? '<p class="tiny" style="margin:10px 0 0">' +
          esc(Tn('Se ha descartado: {lista}.', { lista: prop.fuera.join('; ') })) + '</p>' : '')}

        <button class="btn primary block" data-a="aplicartoda" style="margin-top:12px">
          ${raw(icon('check'))} ${T('Dejar la rutina así')}</button>
        <p class="tiny" style="margin:7px 0 0">${T('Se reemplazan los ejercicios de esta ' +
        'rutina y se guarda. Tu historial no se toca.')}</p>
      </div>`;
  }

  function accionRutina(c) {
    const a = String(c.accion || '').toLowerCase().replace('ñ', 'n');
    /* Las tres que no tocan qué ejercicios hay, sino cómo se hacen. Sin
       reconocerlas aquí caían en el «si no trae poner, es un quitar» del final y
       borraban el ejercicio que venían a arreglar. */
    if (a.indexOf('orden') === 0) return 'orden';
    if (a.indexOf('descans') === 0) return 'descanso';
    if (a.indexOf('serie') === 0) return 'series';
    if (a.indexOf('quit') === 0 || a.indexOf('elimin') === 0) return 'quitar';
    if (a.indexOf('anad') === 0 || a.indexOf('agreg') === 0 || a.indexOf('met') === 0) return 'anadir';
    if (a.indexOf('cambi') === 0 || a.indexOf('sustit') === 0 || a.indexOf('reempl') === 0) return 'cambiar';
    if (c.quitar && c.poner) return 'cambiar';
    return c.poner ? 'anadir' : 'quitar';
  }

  /* Igual que en el programa: la IA se inventa nombres y propone cosas que la
     persona no puede hacer, así que nada entra sin pasar por el catálogo, el
     material y las limitaciones. */
  function aplicarEnRutina(i, guardar) {
    const c = ((revIA.datos || {}).cambios || [])[i];
    if (!c) return;
    const acc = accionRutina(c);
    const fuera = function (aviso) {
      revIA.datos.cambios.splice(i, 1);
      if (aviso) UI.toast(aviso);
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    };

    const dondeEsta = function (nombre) {
      const buscado = I18N.norm(String(nombre || ''));
      if (!buscado) return -1;
      let parcial = -1;
      for (let k = 0; k < draft.exercises.length; k++) {
        const ex = Data.get(draft.exercises[k].exId);
        if (!ex) continue;
        const n = I18N.norm(ex.nameEs);
        if (n === buscado || ex.id === nombre) return k;
        if (parcial === -1 && (n.indexOf(buscado) !== -1 || buscado.indexOf(n) !== -1)) parcial = k;
      }
      return parcial;
    };

    /* Estas tres trabajan sobre un ejercicio que ya está: no hay nada que buscar
       en el catálogo ni que validar contra el material. */
    /* Reordenar la sesión entera: viene la lista final y se recoloca contra
       ella. Un cambio por ejercicio se pisaba con el siguiente, porque cada uno
       apuntaba a una posición de la lista de antes. */
    if (acc === 'orden' && (c.lista || []).length) {
      const pedido = c.lista.map(function (n) { return I18N.norm(String(n || '')); });
      const quedan = draft.exercises.slice();
      const puestos = [];
      pedido.forEach(function (n) {
        const k = quedan.findIndex(function (e) {
          const ex = Data.get(e.exId);
          return ex && I18N.norm(ex.nameEs) === n;
        });
        if (k !== -1) puestos.push(quedan.splice(k, 1)[0]);
      });
      /* lo que no venga nombrado se queda detrás, no se pierde */
      draft.exercises = puestos.concat(quedan);
      guardar();
      fuera(T('Sesión reordenada'));
      return;
    }

    if (acc === 'orden' || acc === 'descanso' || acc === 'series') {
      const k = dondeEsta(c.sobre || c.quitar || c.poner);
      if (k === -1) {
        fuera(Tn('Ya no está «{que}» en la rutina.',
          { que: c.sobre || c.quitar || '' }));
        return;
      }
      const nombre = (Data.get(draft.exercises[k].exId) || {}).nameEs || '';

      if (acc === 'orden') {
        const destino = Math.max(0, Math.min(draft.exercises.length - 1,
          (Number(c.posicion) || 1) - 1));
        const movido = draft.exercises.splice(k, 1)[0];
        draft.exercises.splice(destino, 0, movido);
        guardar();
        fuera(Tn('{que} pasa al {n}.º', { que: nombre, n: destino + 1 }));
        return;
      }

      if (acc === 'descanso') {
        const seg = Math.max(0, Math.min(600, Number(c.rest) || 0));
        if (!seg) { fuera(T('Ese cambio no dice cuánto descanso poner.')); return; }
        draft.exercises[k].rest = seg;
        guardar();
        fuera(Tn('{que}: descanso a {n}s', { que: nombre, n: seg }));
        return;
      }

      const series = Math.max(1, Math.min(15, Number(c.series) || 0));
      if (!series) { fuera(T('Ese cambio no dice cuántas series poner.')); return; }
      draft.exercises[k].sets = series;
      guardar();
      fuera(Tn('{que}: {n} series', { que: nombre, n: series }));
      return;
    }

    if (acc === 'quitar') {
      const k = dondeEsta(c.quitar);
      if (k === -1) {
        fuera(Tn('Ya no está «{que}» en la rutina.', { que: c.quitar || '' }));
        return;
      }
      if (draft.exercises.length <= Store.MINIMO_EJERCICIOS) {
        UI.toast(Tn('La rutina se quedaría por debajo del mínimo de {n} ejercicios.',
          { n: Store.MINIMO_EJERCICIOS }));
        return;
      }
      const nombre = (Data.get(draft.exercises[k].exId) || {}).nameEs || '';
      draft.exercises.splice(k, 1);
      guardar();
      fuera(Tn('Fuera {que}', { que: nombre }));
      return;
    }

    /* por nombre exacto, que es como se le ofreció; el buscador solo de red */
    const nuevo = Data.porNombreEs(c.poner) ||
      (Data.search({ q: String(c.poner || ''), gear: Store.settings().gear }) || [])[0];
    if (!nuevo) {
      fuera(Tn('No encuentro «{que}» en el catálogo.', { que: c.poner || '' }));
      return;
    }
    const aOjo = I18N.norm(nuevo.nameEs) !== I18N.norm(String(c.poner || ''));

    const claves = Programa.lesionesDe(Perfil.datos().lesiones);
    const patron = Alt.patron(nuevo);
    const prohibido = claves.some(function (k) {
      return (Programa.LESIONES[k].patronesFuera || []).indexOf(patron) !== -1;
    });
    if (prohibido) {
      fuera(Tn('«{que}» no encaja con tus limitaciones.', { que: nuevo.nameEs }));
      return;
    }

    if (acc === 'anadir') {
      if (draft.exercises.some(function (e) { return e.exId === nuevo.id; })) {
        fuera(Tn('«{que}» ya está en la rutina.', { que: nuevo.nameEs }));
        return;
      }
      const modelo = draft.exercises[draft.exercises.length - 1] || {};
      draft.exercises.push({
        exId: nuevo.id,
        sets: Math.min(15, Number(c.series) || modelo.sets || 3),
        reps: Math.min(200, Number(c.reps) || modelo.reps || 12),
        weight: 0,
        rest: modelo.rest || 75,
        note: Tn('Lo mete el entrenador: {porque}', { porque: c.porque || '' })
      });
      guardar();
      fuera(aOjo
        ? Tn('Pedía «{pedido}»; he puesto {puesto}',
            { pedido: c.poner, puesto: nuevo.nameEs })
        : Tn('Entra {que}', { que: nuevo.nameEs }));
      return;
    }

    const k = dondeEsta(c.quitar);
    if (k === -1) {
      fuera(Tn('Ya no está «{que}» en la rutina.', { que: c.quitar || '' }));
      return;
    }
    const antes = (Data.get(draft.exercises[k].exId) || {}).nameEs || '';
    draft.exercises[k].exId = nuevo.id;
    draft.exercises[k].note = Tn('Cambiado a propuesta del entrenador: {porque}',
      { porque: c.porque || '' });
    guardar();
    fuera(aOjo
      ? Tn('Pedía «{pedido}»; he puesto {puesto}',
          { pedido: c.poner, puesto: nuevo.nameEs })
      : Tn('{nuevo} en lugar de {viejo}', { nuevo: nuevo.nameEs, viejo: antes }));
  }

  function viewRutina() {
    if (route.arg === 'nueva') draft = Store.newRoutine();
    else {
      const r = Store.routine(route.arg);
      if (!r) return '<div class="empty"><p>' + esc(T('Rutina no encontrada.')) + '</p></div>';
      draft = JSON.parse(JSON.stringify(r));
    }

    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">${raw(icon('back'))} ${T('Volver')}</button>
      <h1>${draft.id ? T('Editar rutina') : T('Nueva rutina')}</h1>

      <div class="card">
        <label class="tiny">${T('NOMBRE DE LA RUTINA')}</label>
        <div class="tiny" style="margin:2px 0 0">${T('El que te sirva a ti para ' +
        'reconocerla de un vistazo: «Pierna dura», «Lunes de espalda», «La corta de ' +
        'casa»…')}</div>
        <input id="r-name" value="${draft.name}" placeholder="${T('Ponle nombre')}"
               style="margin:6px 0 12px">
        <label class="tiny">${T('NOTAS (opcional)')}</label>
        <textarea id="r-note" rows="2" placeholder="${T('Objetivo, progresión, recordatorios…')}"
                  style="margin:5px 0 12px">${draft.note || ''}</textarea>
        <label class="tiny">${T('DÍAS DE LA SEMANA')}</label>
        <div class="row wrap" style="gap:6px;margin-top:6px">
          ${raw(dias.map(function (d) {
            return '<button class="chip ' + ((draft.days || []).indexOf(d) !== -1 ? 'on' : '') +
                   '" data-day="' + d + '">' + UI.diaLargo(d) + '</button>';
          }).join(''))}
        </div>

        <div class="hr"></div>
        <div class="row between" style="align-items:flex-start;gap:12px">
          <div class="grow">
            <b style="font-size:.92rem">${T('Rutina mixta')}</b>
            <div class="tiny">${Tn('Apagado, la rutina se queda en su zona{zona} y avisa ' +
              'si metes un ejercicio de otra. Enciéndelo para mezclar tren superior e ' +
              'inferior.',
              { zona: zonaBorrador()
                ? ' (' + T(zonaBorrador().label).toLowerCase() + ')' : '' })}</div>
          </div>
          <button class="sw ${draft.mixta ? 'on' : ''}" data-a="mixta"
                  role="switch" aria-checked="${!!draft.mixta}" aria-label="${T('Rutina mixta')}"></button>
        </div>
      </div>

      <div class="list-head">
        <span class="list-title">${Tn('Ejercicios ({n})', { n: draft.exercises.length })}</span>
        <button class="btn sm primary" data-a="add">${raw(icon('plus'))} ${T('Añadir')}</button>
      </div>
      <p class="tiny" style="margin:-4px 0 10px">${draft.exercises.length < Store.MINIMO_EJERCICIOS
        ? Tn('Te faltan {n} para llegar al mínimo de {min}.',
            { n: Store.MINIMO_EJERCICIOS - draft.exercises.length,
              min: Store.MINIMO_EJERCICIOS })
        : Tn('Puedes añadir los que quieras y cambiar cualquiera por otro. Quitar, hasta ' +
            'dejarla en {min}.', { min: Store.MINIMO_EJERCICIOS })}</p>

      ${raw(draft.exercises.length ? html`
        <div class="stack">
          ${raw(draft.exercises.map(function (re, i) {
            const ex = Data.get(re.exId);
            return html`
              <div class="card" data-row="${i}">
                <div class="row" style="align-items:flex-start">
                  <img src="${ex ? Data.img(ex, 0) : Data.PLACEHOLDER}" alt=""
                       style="width:58px;height:46px;object-fit:cover;border-radius:8px;flex:none" loading="lazy">
                  <div class="grow">
                    <div style="font-weight:700;font-size:.9rem">${ex ? ex.nameEs : re.exId}</div>
                    <div class="tiny">${ex ? ex.primaryMuscles.map(I18N.muscle).join(', ') : ''}</div>
                  </div>
                  <div class="row" style="gap:4px">
                    <button class="btn icon sm" data-up="${i}" ${i === 0 ? 'disabled' : ''}
                            aria-label="${T('Subir')}">${raw(icon('up'))}</button>
                    <button class="btn icon sm" data-down="${i}"
                            ${i === draft.exercises.length - 1 ? 'disabled' : ''}
                            aria-label="${T('Bajar')}">${raw(icon('down'))}</button>
                    <button class="btn icon sm" data-cambiar="${i}"
                            aria-label="${T('Cambiar por otro')}">${raw(icon('cambiar'))}</button>
                    <button class="btn icon sm danger" data-del="${i}"
                            aria-label="${T('Quitar')}">${raw(icon('trash'))}</button>
                  </div>
                </div>
                <div class="row" style="margin-top:10px;gap:8px">
                  <div class="grow"><div class="tiny">${T('Series')}</div>
                    <input type="number" min="1" max="15" value="${re.sets}" data-i="${i}" data-f="sets"
                           style="text-align:center"></div>
                  <div class="grow"><div class="tiny">${T('Reps')}</div>
                    <input type="number" min="1" max="200" value="${re.reps}" data-i="${i}" data-f="reps"
                           style="text-align:center"></div>
                  <div class="grow"><div class="tiny">${T('Descanso (s)')}</div>
                    <input type="number" min="0" max="600" step="15" value="${re.rest}" data-i="${i}" data-f="rest"
                           style="text-align:center"></div>
                </div>
              </div>`;
          }).join(''))}
        </div>` : html`
        <div class="card center">
          <p class="muted">${T('Esta rutina todavía no tiene ejercicios.')}</p>
          <button class="btn primary" data-a="add">${raw(icon('plus'))} ${T('Añadir el primero')}</button>
        </div>`)}

      <div class="row" style="margin-top:16px">
        <button class="btn primary grow" data-a="guardar">${raw(icon('check'))} ${T('Guardar')}</button>
        ${raw(draft.id ? html`
          <button class="btn icon" data-a="dup" aria-label="${T('Duplicar')}">${raw(icon('copy'))}</button>
          <button class="btn icon danger" data-a="borrar" aria-label="${T('Borrar')}">${raw(icon('trash'))}</button>` : '')}
      </div>
      ${raw(draft.id && draft.exercises.length ? html`
        <button class="btn block" data-a="entrenar" style="margin-top:8px">
          ${raw(icon('play'))} ${T('Guardar y entrenar ahora')}</button>` : '')}

      <div id="auditoria">${raw(auditoriaHTML())}</div>`;
  }

  /* La zona del borrador que se está editando */
  function zonaBorrador() { return draft ? zonaDeRutina(draft) : null; }

  /* ¿Encaja este ejercicio en la rutina que se está editando?
     Si no es mixta, se avisa antes de meter pierna en una rutina de brazo. */
  function encajaEnRutina(ex) {
    if (!draft || draft.mixta) return true;
    const zona = zonaDeRutina(draft);
    if (!zona) return true;                       // la primera marca la zona
    return (ex.groups || []).indexOf(zona.id) !== -1;
  }

  viewRutina.mount = function (root) {
    function leerCampos() {
      draft.name = root.querySelector('#r-name').value.trim();
      draft.note = root.querySelector('#r-note').value.trim();
    }
    function guardar() {
      leerCampos();
      if (!draft.name) draft.name = T('Rutina sin nombre');
      const r = Store.saveRoutine(draft);
      refrescarActiva(r);
      return r;
    }

    /* Guardado sobre la marcha: nadie debería perder una rutina por salir de
       la pantalla sin pulsar Guardar. Una rutina vacía del todo no se guarda,
       para no llenar la lista de restos al entrar y salir. */
    function autoguardar() {
      leerCampos();
      if (!draft.id && !draft.name && !draft.exercises.length) return null;
      if (!draft.name) draft.name = T('Rutina sin nombre');

      /* si no ha cambiado nada, no se toca: guardar por guardar dispara una
         subida a la nube cada vez que se entra y se sale de una rutina */
      const guardada = draft.id ? Store.routine(draft.id) : null;
      if (guardada) {
        const limpio = function (r) {
          const c = Object.assign({}, r);
          delete c.updatedAt;
          return JSON.stringify(c);
        };
        if (limpio(guardada) === limpio(draft)) return guardada;
      }

      const nueva = !draft.id;
      const r = Store.saveRoutine(draft);
      refrescarActiva(r);
      /* al nacer, la ruta pasa a apuntar a su id: así un repintado carga la
         rutina guardada en vez de empezar otro borrador en blanco */
      if (nueva) {
        route.arg = r.id;
        history.replaceState(null, '', location.pathname + '#/rutina/' + encodeURIComponent(r.id));
      }
      return r;
    }

    bind(root, '[data-a=atras]', function () { autoguardar(); go('rutinas'); });

    /* ---- la lectura de la IA sobre esta rutina ---- */
    const auditar = function () {
      if (!IA.activa()) { go('claves'); UI.toast(T('Elige proveedor de IA y pon su clave')); return; }
      const r = autoguardar();
      if (!r) { UI.toast(T('Guárdala antes de pasarla por la IA')); return; }
      revIA = { id: r.id, cargando: true, datos: null };
      render();
      const caja = document.getElementById('auditoria');
      if (caja) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
      IA.revisarRutina(r)
        .then(function (x) { revIA.datos = x; })
        .catch(function (e) { UI.toast(e.message); })
        .then(function () {
          revIA.cargando = false;
          render();
          const c = document.getElementById('auditoria');
          if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    bindAll(root, '[data-a=auditar]', auditar);

    /* Si se ha pedido desde la lista de rutinas, se lanza sola: el usuario ya
       ha dicho lo que quiere, no tiene que volver a decirlo aquí abajo. */
    if (auditarAlEntrar && auditarAlEntrar === draft.id) {
      auditarAlEntrar = null;
      auditar();
    }

    bind(root, '[data-a=olvidarAuditoria]', function () {
      revIA = { id: null, cargando: false, datos: null };
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    });

    bindAll(root, '[data-rcambio]', function (el) {
      aplicarEnRutina(Number(el.dataset.rcambio), autoguardar);
    });

    bind(root, '[data-a=aplicartoda]', function () {
      const prop = rutinaPropuesta(revIA.datos);
      if (!prop) { UI.toast(T('Esa propuesta ya no se puede aplicar.')); return; }
      UI.confirm(T('Dejar la rutina así'),
        Tn('Se sustituyen los {ahora} ejercicios de ahora por los {luego} que propone. ' +
        'Lo que ya entrenaste sigue en tu historial.',
        { ahora: draft.exercises.length, luego: prop.dentro.length }),
        T('Reemplazar')).then(function (ok) {
        if (!ok) return;
        draft.exercises = prop.dentro.map(function (x) { return x.fila; });
        autoguardar();
        revIA.datos.cambios = [];
        const pos = window.scrollY;
        render();
        window.scrollTo(0, pos);
        UI.toast(Tn('Rutina rehecha con {n} ejercicios', { n: prop.dentro.length }));
      });
    });

    bindAll(root, '[data-rnocambio]', function (el) {
      revIA.datos.cambios.splice(Number(el.dataset.rnocambio), 1);
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    });

    bindAll(root, '[data-day]', function (el) {
      const d = el.dataset.day;
      draft.days = draft.days || [];
      const i = draft.days.indexOf(d);
      if (i === -1) draft.days.push(d); else draft.days.splice(i, 1);
      draft.days.sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); });
      el.classList.toggle('on', i === -1);

      /* si el nombre llevaba el día delante, sigue al día que acaba de cambiar */
      leerCampos();
      renombrarPorDia(draft);
      const campo = root.querySelector('#r-name');
      if (campo) campo.value = draft.name;

      autoguardar();
    });

    root.querySelectorAll('input[data-f]').forEach(function (inp) {
      inp.onchange = function () {
        const v = Number(inp.value) || 0;
        draft.exercises[Number(inp.dataset.i)][inp.dataset.f] = v;
        autoguardar();
      };
    });

    ['#r-name', '#r-note'].forEach(function (sel) {
      const el = root.querySelector(sel);
      if (el) el.onchange = function () { autoguardar(); };
    });

    bindAll(root, '[data-up]', function (el) {
      const i = Number(el.dataset.up);
      const arr = draft.exercises;
      arr.splice(i - 1, 0, arr.splice(i, 1)[0]);
      leerCampos(); Store.saveRoutine(draft); render();
    });
    bindAll(root, '[data-down]', function (el) {
      const i = Number(el.dataset.down);
      const arr = draft.exercises;
      arr.splice(i + 1, 0, arr.splice(i, 1)[0]);
      leerCampos(); Store.saveRoutine(draft); render();
    });
    bindAll(root, '[data-del]', function (el) {
      if (draft.exercises.length <= Store.MINIMO_EJERCICIOS) {
        UI.toast(Tn('Una rutina no baja de {n} ejercicios. Cámbialo por otro en vez ' +
          'de quitarlo.', { n: Store.MINIMO_EJERCICIOS }));
        return;
      }
      draft.exercises.splice(Number(el.dataset.del), 1);
      leerCampos(); Store.saveRoutine(draft); render();
    });

    /* Cambiar un ejercicio por otro: conserva series, repeticiones y descanso */
    bindAll(root, '[data-cambiar]', function (el) {
      const i = Number(el.dataset.cambiar);
      leerCampos();
      pickExerciseSheet(function (ex) {
        if (!encajaEnRutina(ex)) { UI.closeModal(); preguntarMixta(ex, function () { cambiar(i, ex); }); return; }
        UI.closeModal();
        cambiar(i, ex);
      });
    });

    function cambiar(i, ex) {
      draft.exercises[i].exId = ex.id;
      const saved = Store.saveRoutine(draft);
      go('rutina', saved.id);
      UI.toast(Tn('Cambiado por {que}', { que: ex.nameEs }));
    }

    /* Una rutina de brazo con un ejercicio de pierna: o es mixta, o no entra */
    function preguntarMixta(ex, alSeguir) {
      const zona = zonaDeRutina(draft);
      UI.confirm(T('Eso es de otra zona'),
        Tn('«{que}» no es de {zona}. Puedo marcar la rutina como mixta y meterlo igual.',
          { que: ex.nameEs, zona: zona ? T(zona.label).toLowerCase() : T('esta zona') }),
        T('Marcar mixta y añadir')).then(function (ok) {
        if (!ok) return;
        draft.mixta = true;
        alSeguir();
      });
    }

    bind(root, '[data-a=mixta]', function (el) {
      draft.mixta = !draft.mixta;
      el.classList.toggle('on', draft.mixta);
      el.setAttribute('aria-checked', String(!!draft.mixta));
      autoguardar();
      render();
    });

    bindAll(root, '[data-a=add]', function () {
      leerCampos();
      const meter = function (ex) {
        draft.exercises.push(Store.newRoutineExercise(ex.id));
        const saved = Store.saveRoutine(draft);
        /* una rutina nueva ya tiene id: se navega a él para no perder el borrador */
        go('rutina', saved.id);
      };
      pickExerciseSheet(function (ex) {
        UI.closeModal();
        if (encajaEnRutina(ex)) meter(ex);
        else preguntarMixta(ex, function () { meter(ex); });
      });
    });

    bind(root, '[data-a=guardar]', function () {
      guardar();
      UI.toast(T('Rutina guardada'));
      go('rutinas');
    });

    bind(root, '[data-a=entrenar]', function () {
      const r = guardar();
      empezar(r.id);
    });

    bind(root, '[data-a=dup]', function () {
      guardar();
      const copia = Store.duplicateRoutine(draft.id);
      UI.toast(T('Rutina duplicada'));
      go('rutina', copia.id);
    });

    bind(root, '[data-a=borrar]', function () {
      UI.confirm(T('Borrar rutina'),
        Tn('Se eliminará «{que}». Los entrenamientos ya registrados se conservan.',
          { que: draft.name || T('esta rutina') }),
        T('Borrar'), true).then(function (ok) {
        if (ok) { Store.deleteRoutine(draft.id); UI.toast(T('Rutina borrada')); go('rutinas'); }
      });
    });
  };

  /* Selector de ejercicio con buscador, reutilizado por el editor de rutinas */
  function pickExerciseSheet(onPick) {
    let q = '', grupo = '', todo = false;

    function lista() {
      return Data.search({ q: q, group: grupo, gear: todo ? '' : Store.settings().gear }).slice(0, 30);
    }

    function pinta(el) {
      el.querySelector('#pick-list').innerHTML = lista().map(function (ex) {
        return html`
          <button class="rt-item" data-p="${ex.id}" style="width:100%;text-align:left">
            <img src="${Data.img(ex, 0)}" alt="" loading="lazy">
            <div class="grow">
              <div style="font-weight:600;font-size:.85rem">${ex.nameEs}</div>
              <div class="tiny">${ex.primaryMuscles.map(I18N.muscle).join(', ')} · ${I18N.equip(ex.equipment)}</div>
            </div>
          </button>`;
      }).join('') || '<p class="muted">' + esc(T('Sin resultados')) + '</p>';

      el.querySelectorAll('[data-p]').forEach(function (b) {
        b.onclick = function () { onPick(Data.get(b.dataset.p)); };
      });

      const info = el.querySelector('#pick-info');
      const gset = Data.GEAR[Store.settings().gear];
      if (info) {
        info.textContent = todo || !gset
          ? T('Mostrando el catálogo completo')
          : Tn('Solo lo que puedes hacer {donde}',
              { donde: Data.gearFrase(Store.settings().gear) });
      }
      const btnAll = el.querySelector('[data-pickall]');
      if (btnAll) {
        btnAll.classList.toggle('on', todo);
        btnAll.textContent = todo ? T('Solo mi material') : T('Ver todo el catálogo');
        btnAll.onclick = function () { todo = !todo; pinta(el); };
      }
    }

    UI.modal(html`
      <h2>${T('Añadir ejercicio')}</h2>
      <div class="search-wrap" style="margin-bottom:10px">
        ${raw(icon('search'))}
        <input id="pick-q" type="search" placeholder="${T('Buscar ejercicio…')}" autocomplete="off">
      </div>
      <div class="pill-scroll" style="padding-left:0;margin-left:0">
        <button class="chip on" data-g="">${T('Todos')}</button>
        ${raw(I18N.GROUPS.map(function (gr) {
          return '<button class="chip" data-g="' + gr.id + '">' + esc(T(gr.label)) + '</button>';
        }).join(''))}
      </div>
      <div class="row between" style="margin:2px 0 8px">
        <span class="tiny" id="pick-info"></span>
        <button class="chip" data-pickall>${T('Ver todo')}</button>
      </div>
      <div class="stack" id="pick-list"></div>`,
      function (el) {
        pinta(el);
        const inp = el.querySelector('#pick-q');
        let deb = null;
        inp.oninput = function () {
          clearTimeout(deb);
          deb = setTimeout(function () { q = inp.value; pinta(el); }, 200);
        };
        el.querySelectorAll('[data-g]').forEach(function (b) {
          b.onclick = function () {
            grupo = b.dataset.g;
            el.querySelectorAll('[data-g]').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            pinta(el);
          };
        });
        setTimeout(function () { inp.focus(); }, 120);
      });
  }

  /* ================= entrenar ================= */

  function viewEntrenar() {
    if (!Workout.isActive()) {
      return html`<div class="empty">${raw(icon('dumbbell'))}
        <p>${T('No hay ningún entrenamiento en curso.')}</p>
        <button class="btn primary" data-a="ir">${T('Elegir una rutina')}</button></div>`;
    }
    return Workout.view();
  }

  viewEntrenar.mount = function (root) {
    if (!Workout.isActive()) { bind(root, '[data-a=ir]', function () { go('rutinas'); }); return; }
    Workout.mount(root, render);
  };

  /* ================= progreso ================= */

  /* Progreso vive en vistas6.js */

  /* ================= ajustes ================= */

  /* ---------- las piezas de Ajustes ----------
     Una pantalla de ajustes es una lista de cosas que se cambian, y cada cosa
     necesita el mando que le corresponda: un si o un no es un interruptor, una
     de dos o tres es un mando con la marca corriendose, y un numero es un
     contador con sus dos botones. Antes eran todo pastillas y cajas de texto,
     y una casilla de numero en un movil abre el teclado para cambiar de 90 a
     120, que son dos toques con un contador. */

  /* Un mando de dos o tres posiciones, con la marca debajo de la elegida */
  function mando(attr, opciones, actual) {
    const i = Math.max(0, opciones.map(function (o) { return o.v; }).indexOf(actual));
    /* El carril lleva 3 px de aire a cada lado, asi que cada hueco mide
       (100% - 6px) / n. Con el 6 entero la marca se quedaba corta en cuanto
       habia tres posiciones y pisaba la de al lado. */
    const ancho = (100 / opciones.length).toFixed(4);
    return '<div class="mando" data-n="' + opciones.length + '">' +
      '<span class="mando-marca" style="width:calc(' + ancho + '% - ' +
        (6 / opciones.length).toFixed(2) + 'px);transform:translateX(' + (i * 100) + '%)"></span>' +
      opciones.map(function (o) {
        return '<button class="mando-op' + (o.v === actual ? ' on' : '') + '" ' +
          attr + '="' + o.v + '">' + (o.ico ? icon(o.ico) : '') + esc(o.t) + '</button>';
      }).join('') + '</div>';
  }

  /* Un contador: dos botones y la cifra en medio. La casilla de numero obligaba
     a abrir el teclado para pasar de 90 a 120. */
  function contador(id, valor, unidad, paso, min, max) {
    return '<div class="contador" data-cont="' + id + '" data-paso="' + paso +
      '" data-min="' + min + '" data-max="' + max + '">' +
      '<button class="cont-b" data-mas="-1" aria-label="' + esc(T('Menos')) + '">' + icon('menos') + '</button>' +
      '<span class="cont-v"><b id="' + id + '">' + valor + '</b>' +
      '<i>' + esc(unidad) + '</i></span>' +
      '<button class="cont-b" data-mas="1" aria-label="' + esc(T('Más')) + '">' + icon('plus') + '</button></div>';
  }

  /* Una fila de ajuste: lo que se cambia a la izquierda y su mando a la derecha */
  function filaAjuste(titulo, sub, control, apilada, ico) {
    /* Un mando de tres no cabe al lado de su nombre en un movil: o se aprieta
       hasta que «Sistema» no se lee, o baja a su propia linea con todo el
       ancho. Baja. */
    return '<div class="aj-fila' + (apilada ? ' apilada' : '') + '">' +
      (ico ? '<span class="aj-ico">' + icon(ico) + '</span>' : '') +
      '<span class="grow"><span class="aj-tit">' + esc(titulo) + '</span>' +
      (sub ? '<span class="aj-sub">' + esc(sub) + '</span>' : '') +
      '</span>' + control + '</div>';
  }

  /* Una opcion de una lista de la que se elige una sola. Con su color, su
     silueta al fondo y una muestra de lo que vas a ver mientras entrenas: leer
     «anotas cada serie» y ver «60 kg × 12» no cuesta lo mismo. */
  function filaOpcion(o, actual) {
    return '<button class="opcion' + (o.v === actual ? ' on' : '') + '" data-reg="' +
      o.v + '" style="--tono:' + o.tono + '">' +
      '<span class="op-silueta" aria-hidden="true">' + icon(o.ico) + '</span>' +
      '<span class="op-ico">' + icon(o.ico) + '</span>' +
      '<span class="grow"><span class="op-nom">' + esc(T(o.t)) + '</span>' +
      '<span class="op-sub">' + esc(T(o.sub)) + '</span>' +
      '<span class="op-muestra">' + o.muestra() + '</span></span>' +
      '<span class="op-marca">' + icon('check') + '</span></button>';
  }

  /* Un si o un no con la misma cara que las opciones: color, silueta y el
     interruptor donde las otras llevan el tic. */
  function tarjetaSiNo(o, activo) {
    return '<div class="opcion fijo' + (activo ? ' on' : '') +
      '" style="--tono:' + o.tono + '">' +
      '<span class="op-silueta" aria-hidden="true">' + icon(o.ico) + '</span>' +
      '<span class="op-ico">' + icon(o.ico) + '</span>' +
      '<span class="grow"><span class="op-nom">' + esc(o.t) + '</span>' +
      '<span class="op-sub">' + esc(o.sub) + '</span></span>' +
      '<button class="sw' + (activo ? ' on' : '') + '" data-sino="' + o.clave +
      '" data-val="' + (activo ? 'no' : 'si') + '" role="switch" aria-checked="' +
      (activo ? 'true' : 'false') + '" aria-label="' + esc(o.t) + '"></button></div>';
  }

  /* Las tres formas de apuntar una serie, con la muestra de lo que se ve
     mientras entrenas. «Anotas cada serie» y «60 kg × 12» dicen lo mismo, pero
     lo segundo se entiende sin leerlo. */
  const FORMAS_REGISTRO = [
    /* El texto se traduce al pintarlo, y por eso la muestra es una función: la
       tabla se arma al cargar el archivo, cuando todavía no se sabe el idioma. */
    { v: 'detallado', ico: 'grafica', tono: 'var(--acc)', t: 'Peso y repeticiones',
      sub: 'Anotas cada serie. Necesario para los récords, el volumen y las gráficas.',
      muestra: function () {
        return '<span class="mu-dato">60 <i>kg</i></span><span class="mu-x">×</span>' +
          '<span class="mu-dato">12 <i>' + UI.esc(T('reps')) + '</i></span>';
      } },
    { v: 'simple', ico: 'check', tono: '#4f8cf5', t: 'Marcar cada serie',
      sub: 'Te propongo el objetivo (3 × 12) y solo marcas las que vas haciendo.',
      muestra: function () {
        return '<span class="mu-serie hecha"></span><span class="mu-serie hecha"></span>' +
          '<span class="mu-serie"></span><span class="mu-txt">' +
          UI.esc(Tn('{a} de {b}', { a: 2, b: 3 })) + '</span>';
      } },
    { v: 'ejercicio', ico: 'flag', tono: '#c06bf0', t: 'Marcar el ejercicio y ya',
      sub: 'Un botón por ejercicio. Ni peso, ni repeticiones, ni series.',
      muestra: function () {
        return '<span class="mu-hecho">' + UI.esc(T('Hecho')) + '</span>';
      } }
  ];

  function viewAjustes() {
    const s = Store.settings();
    const sitio = Data.GEAR[s.gear];
    const cara = (sitio && CARAS_LUGAR[s.gear]) || { icono: 'dumbbell', tono: 'var(--acc)' };

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Perfil')}</button>
      <h1>${T('Ajustes')}</h1>
      <p class="muted">${T('Cómo se comporta la app contigo: lo que te pregunta, lo que te propone y lo que se guarda.')}</p>

      <!-- El nombre ocupaba una tarjeta entera para una palabra: rótulo arriba,
           etiqueta debajo y una caja de ancho completo para escribir «Fabián».
           En una fila, con el nombre a la derecha, cabe lo mismo en un tercio.

           Y se lee, no se escribe. Era una caja de texto puesta ahí mismo, que
           además no guardaba nada: se escribía dentro y el nombre seguía igual
           porque nadie escuchaba ese campo. Ahora lleva a Datos y hábitos, que
           es donde sí se guarda: un dato, un sitio donde se cambia. Con dos
           cajas para lo mismo, tarde o temprano una deja de funcionar y no se
           entera nadie. -->
      <div class="aj-caja" style="margin-top:14px">
        <button class="aj-fila tap" data-a="editarnombre">
          <span class="aj-ico">${raw(icon('perfil'))}</span>
          <span class="grow" style="text-align:left"><span class="aj-tit">${T('Tu nombre')}</span>
            <span class="aj-sub">${T('Con el que te saluda la app')}</span></span>
          <span class="aj-valor">${s.name || T('Sin poner')}</span>
          <span class="aj-lapiz">${raw(icon('edit'))}</span>
        </button>
      </div>

      <div class="plan-acciones" style="margin:10px 0 0">
        <button class="fila-plan" data-a="lugar2" style="--fp:${raw(cara.tono)}">
          <span class="fp-ico">${raw(icon(cara.icono))}</span>
          <span class="grow"><span class="fp-tit">${T('Dónde entrenas')}</span>
            <span class="fp-sub">${raw(sitio
              ? esc(T(sitio.label)) + ' · ' + Tn('{n} ejercicios a tu alcance',
                { n: UI.num(cuantosEn(s.gear)) })
              : T('Sin elegir'))}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>

        <!-- Estaban en Alimentación, debajo de la despensa, y no son de allí:
             no se tocan al montar un menú. De estas horas dependen el cruce de
             las fotos, los avisos de comer, el reparto de los suplementos y el
             propio menú, así que su sitio es donde se pone lo que la app usa en
             todas partes. -->
        <button class="fila-plan" data-a="franjas" style="--fp:#f0a23c">
          <span class="fp-ico">${raw(icon('reloj'))}</span>
          <span class="grow"><span class="fp-tit">${T('A qué hora comes')}</span>
            <span class="fp-sub">${raw(Perfil.franjas().map(function (f) {
              return esc(T(f.label).toLowerCase()) + ' ' +
                esc(UI.hora ? UI.hora(f.desde) : f.desde);
            }).join(' · '))}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>
      <p class="tiny" style="margin:8px 0 0">${T('De ahí salen los avisos de comer, con qué comida se cruza la foto de un plato y a qué hora te toca cada suplemento.')}</p>

      <div class="list-title">${T('Cómo registras las series')}</div>
      <div class="opciones">
        ${raw(FORMAS_REGISTRO.map(function (o) {
          return filaOpcion(o, s.registro);
        }).join(''))}
      </div>
      ${raw(s.registro !== 'detallado'
        ? '<p class="tiny" style="margin:8px 0 0">' + esc(T('Sin peso anotado no hay récords ni volumen; el progreso se mide por series y entrenamientos completados.')) + '</p>' : '')}

      <div class="list-title">${T('Qué vas marcando')}</div>
      <div class="opciones">
        ${raw(tarjetaSiNo({ clave: 'registroComida', ico: 'nutricion', tono: '#f0a23c',
          t: T('Registrar cuando como'),
          sub: T('Cada plato lleva «me lo comí» y «comí otra cosa», y lo que marques entra en el recuento del día.') },
          s.registroComida !== 'no'))}
        ${raw(tarjetaSiNo({ clave: 'registroAgua', ico: 'gota', tono: '#4f8cf5',
          t: T('Marcar cuando bebo agua'),
          sub: T('Cada toma de la pauta es una casilla, y el total del día sale de lo que marcas en vez de lo que deberías.') },
          s.registroAgua !== 'no'))}
      </div>
      <p class="tiny" style="margin:8px 0 0">${T('Apagarlos no borra nada de lo que ya llevas apuntado: solo quita las casillas de en medio.')}</p>

      <div class="list-title">${T('La app')}</div>
      <div class="aj-caja">
        ${raw(filaAjuste(T('Unidad de peso'), T('En la que anotas y ves los pesos'),
          mando('data-unit', [{ v: 'kg', t: 'kg' }, { v: 'lb', t: 'lb' }], s.unit), false, 'dumbbell'))}
        ${raw(filaAjuste(T('Tema'), T('Claro, oscuro o lo que diga el móvil'),
          mando('data-theme',
          [{ v: 'light', t: T('Claro'), ico: 'sol' }, { v: 'dark', t: T('Oscuro'), ico: 'luna' },
           { v: 'auto', t: T('Sistema'), ico: 'cambiar' }], s.theme), true, 'sol'))}

        <!-- Al lado del tema y con la misma forma: las dos son «cómo la veo»,
             no «qué hace». Con las siglas y sin icono propio, que una bandera
             para un idioma es lo de siempre —el inglés no es de un país— y a
             dos letras no le hace falta dibujo. -->
        ${raw(filaAjuste(T('Idioma'), T('En qué idioma ves la app'), mando('data-idioma',
          Idioma.IDIOMAS.map(function (x) { return { v: x.id, t: x.corto }; }),
          Idioma.actual()), false, 'mundo'))}
        ${raw(filaAjuste(T('Descanso por defecto'), T('Entre serie y serie'),
          contador('s-rest', s.rest, T('seg'), 15, 0, 600), false, 'timer'))}
        ${raw(filaAjuste(T('La frase del entrenador'), T('Cada cuánto cambia'),
          contador('s-pildora', IA.horasPildora ? IA.horasPildora() : 6, 'h', 1, 1, 24),
          false, 'chispa'))}
        ${raw(filaAjuste(T('Aviso sonoro'), T('Un pitido al terminar el descanso'),
          '<button class="sw ' + (s.sound ? 'on' : '') + '" data-a="sound" ' +
          'role="switch" aria-checked="' + (s.sound ? 'true' : 'false') +
          '" aria-label="' + esc(T('Aviso sonoro')) + '"></button>', false, 'altavoz'))}
      </div>
      ${raw((function () {
        /* Un modelo no se acuerda de ayer: sin esto vuelve a caer en la misma
           frase cada pocas semanas. Se le pasan las últimas cuarenta para que
           busque otra cosa, y aquí se puede borrar esa memoria. */
        const n = g.IA && IA.frasesDichas ? IA.frasesDichas().length : 0;
        if (!n) return '';
        return '<p class="tiny" style="margin:8px 0 0">' +
          UI.esc(Tp(n, 'El entrenador recuerda la {n} frase que ya te ha dicho para no ' +
            'repetirse.', 'El entrenador recuerda las {n} frases que ya te ha dicho para ' +
            'no repetirse.')) + ' ' +
          '<button class="btn sm ghost" data-a="olvidarfrases">' +
          UI.esc(T('Que empiece de cero')) + '</button></p>';
      })())}

      <div class="list-title">${T('Claves y conexiones')}</div>
      <div class="plan-acciones" style="margin:10px 0 0">
        <button class="fila-plan" data-a="claves" style="--fp:#f0a23c">
          <span class="fp-ico">${raw(icon('llave'))}</span>
          <span class="grow"><span class="fp-tit">${T('Bóveda de claves')}</span>
            <span class="fp-sub">${resumenClaves()}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
        <button class="fila-plan" data-a="ircuenta" style="--fp:#4f8cf5">
          <span class="fp-ico">${raw(icon('nube'))}</span>
          <span class="grow"><span class="fp-tit">${T('Mi cuenta')}</span>
            <span class="fp-sub">${raw(esc(Sync.activa() ? Sync.email()
              : T('Entra con tu correo para tenerlo todo en cada dispositivo')))}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>

      <div class="list-title">${T('Copia de seguridad')}</div>
      <p class="tiny" style="margin:0 0 2px">${T('Tus rutinas y tu historial se guardan ' +
      'solo en este navegador. Exporta un archivo para conservarlos o llevarlos a otro ' +
      'dispositivo.')}</p>
      <div class="plan-acciones" style="margin:10px 0 0">
        <button class="fila-plan" data-a="export" style="--fp:var(--acc)">
          <span class="fp-ico">${raw(icon('down'))}</span>
          <span class="grow"><span class="fp-tit">${T('Exportar')}</span>
            <span class="fp-sub">${T('Un archivo con todo lo tuyo, listo para guardar')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
        <button class="fila-plan" data-a="import" style="--fp:#c06bf0">
          <span class="fp-ico">${raw(icon('up'))}</span>
          <span class="grow"><span class="fp-tit">${T('Importar')}</span>
            <span class="fp-sub">${T('Traer un archivo exportado desde otro dispositivo')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>
      <input type="file" id="s-file" accept="application/json,.json" hidden>

      <div class="list-title">${T('Instalar en el móvil')}</div>
      <div class="card">
        <p class="muted" style="margin-top:0;font-size:.88rem">${raw(Tn('Training FR ' +
        'funciona como una app: ábrela en el navegador del móvil y usa <b>{que}</b> (en ' +
        'Android, desde el menú del navegador; en iPhone, desde el botón Compartir). ' +
        'Después arranca a pantalla completa y funciona sin conexión.',
        { que: esc(T('«Añadir a la pantalla de inicio»')) }))}</p>
        <button class="btn primary block btn-arranque" data-a="install" hidden id="btn-install"
                style="margin-top:11px">${T('Instalar aplicación')}</button>
      </div>

      <div class="list-title">${T('Zona peligrosa')}</div>
      <div class="plan-acciones" style="margin:10px 0 0">
        <button class="fila-plan es-peligro" data-a="wipe" style="--fp:var(--bad)">
          <span class="fp-ico">${raw(icon('trash'))}</span>
          <span class="grow"><span class="fp-tit">${T('Borrar todos mis datos')}</span>
            <span class="fp-sub">${T('Rutinas, historial, perfil y ajustes de este ' +
            'dispositivo. No se puede deshacer.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>

      <p class="tiny" style="margin-top:22px">
        ${raw(Tn('Training FR · Catálogo de ejercicios de {a} (dominio público) y {b}, que ' +
        'es de donde salen los nombres y las instrucciones escritos en español.', {
          a: '<a href="https://github.com/yuhonas/free-exercise-db" target="_blank" ' +
             'rel="noopener noreferrer">free-exercise-db</a>',
          b: '<a href="https://repdb.co" target="_blank" rel="noopener noreferrer">' +
             'RepDB (repdb.co)</a>'
        }))}<br>${T('Tus datos se quedan en tu dispositivo salvo que actives la ' +
        'sincronización con tu correo.')}
      </p>`;
  }

  /* Las descargas para uso sin conexión. Vivían dentro del mount de Ajustes;
     ahora la pantalla es otra, así que el trozo se saca tal cual. */
  function montarDescargas(root) {
    /* --- descarga para uso sin conexión --- */
    const estadoEl = root.querySelector('#dl-estado');
    const barra = root.querySelector('#dl-barra');

    function pintarEstado() {
      Offline.estado().then(function (e) {
        estadoEl.textContent = e.guardadas
          ? Tn('{n} imágenes guardadas (~{mb} MB). Esos ejercicios ya funcionan sin internet.',
              { n: e.guardadas, mb: e.mb })
          : T('Todavía no has guardado ninguna imagen.');
      }).catch(function () {
        estadoEl.textContent = T('Este navegador no permite guardar contenido sin conexión.');
      });
    }
    pintarEstado();

    bindAll(root, '[data-dl]', function (el) {
      const modo = el.dataset.dl;

      if (modo === 'vaciar') {
        UI.confirm(T('Liberar espacio'),
          T('Se borrarán las imágenes guardadas. La app seguirá funcionando con internet.'),
          T('Liberar'), true).then(function (ok) {
          if (ok) Offline.vaciar().then(pintarEstado).then(function () { UI.toast(T('Espacio liberado')); });
        });
        return;
      }

      const exs = modo === 'rutinas' ? Offline.deMisRutinas()
        : modo === 'esenciales' ? Offline.esenciales() : Offline.todos();
      const urls = Offline.urlsDe(exs);

      if (!urls.length) {
        UI.toast(modo === 'rutinas' ? T('Aún no tienes rutinas que descargar') : T('Nada que descargar'));
        return;
      }

      const mb = Math.round(urls.length * 55 / 1024);
      const seguir = modo === 'todos'
        ? UI.confirm(T('Descargar el catálogo completo'),
            Tn('{n} imágenes, unos {mb} MB. Mejor con wifi.',
              { n: urls.length, mb: mb }), T('Descargar'))
        : Promise.resolve(true);

      seguir.then(function (ok) {
        if (!ok) return;
        const botones = root.querySelectorAll('[data-dl]');
        botones.forEach(function (b) { b.disabled = true; });
        barra.hidden = false;
        const relleno = barra.querySelector('i');

        Offline.descargar(urls, function (hechas, total) {
          relleno.style.width = Math.round(hechas / total * 100) + '%';
          estadoEl.textContent = Tn('Descargando {hechas} de {total}…',
            { hechas: hechas, total: total });
        }).then(function (r) {
          UI.toast(r.fallos
            ? Tn('Descarga terminada ({n} no se pudieron guardar)', { n: r.fallos })
            : T('Listo: ya puedes entrenar sin internet'));
          barra.hidden = true;
          relleno.style.width = '0%';
          botones.forEach(function (b) { b.disabled = false; });
          pintarEstado();
        }).catch(function () {
          UI.toast(T('No se pudo completar la descarga'));
          barra.hidden = true;
          botones.forEach(function (b) { b.disabled = false; });
        });
      });
    });

  }

  /* ---------- versión y espacio ----------
     Estaba al fondo de Ajustes, que va de cómo se comporta la app contigo:
     comprobar si estás al día no es una preferencia, es mantenimiento. Y solo
     con la versión no daba para pantalla —se mira dos veces al año—, así que
     va con lo que también ocupa sitio en el móvil: lo que tienes descargado
     para entrenar sin internet. Las dos preguntas son la misma: qué hay
     guardado aquí dentro y si está al día. */
  function viewVersion() {
    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Perfil')}</button>
      <h1>${T('Actualizaciones')}</h1>
      <p class="muted">${T('Si hay una versión nueva, y qué llevas descargado para usar ' +
      'la app sin internet.')}</p>

      <!-- La versión que llevas se sabe sin preguntarle a nadie, así que se
           escribe de una vez. Antes ponía «Comprobando…» en el hueco del número
           y no aparecía nada hasta que contestaba el servidor: la pantalla se
           abría vacía y parecía que la app se había quedado colgada, cuando lo
           único que faltaba era la mitad de la respuesta. Ahora falta solo el
           veredicto, y se dice dónde falta. -->
      <div class="card tarjeta-premium ver-caja ver-mirando" id="ver-caja">
        <div class="pre-encima">${T('Tu versión')}</div>
        <div class="ver-fila">
          <span class="ver-disco" id="ver-disco">${raw(icon('nube'))}</span>
          <span class="grow">
            <span class="ver-num" id="ver-num">${raw(esc(g.APP_VERSION || '—'))}</span>
            <span class="tiny" id="ver-sub">${T('Comprobando si hay una nueva…')}</span>
          </span>
        </div>
        <!-- Un solo botón, y dice lo que va a pasar. Cuando había una versión
             nueva, esto ponía «Comprobar ahora» —lo que acababa de hacer solo—
             y el texto te mandaba a buscar otra fila más abajo para cogerla:
             dos pasos y dos párrafos para un toque. -->
        <button class="btn block sm ver-btn" id="ver-btn" hidden></button>
      </div>

      <!-- Y esto deja de ser la acción principal: es la salida para cuando algo
           quedó a medias, no la manera normal de actualizar. -->
      <div class="plan-acciones" style="margin:10px 0 0">
        <button class="fila-plan" data-a="actualizarApp" style="--fp:var(--dim2)">
          <span class="fp-ico">${raw(icon('actualizar'))}</span>
          <span class="grow"><span class="fp-tit">${T('¿Algo va raro?')}</span>
            <span class="fp-sub">${T('Borra los archivos que hayan quedado mezclados de ' +
            'dos versiones y vuelve a bajar la app. Tus datos no se tocan.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>

      <div class="list-title">${T('Entrenar sin internet')}</div>
      <div class="card">
        <p class="muted" style="margin-top:0;font-size:.88rem">${T('Descarga las imágenes ' +
        'de los ejercicios y la app funciona entera sin conexión: en el gimnasio sin ' +
        'cobertura, en el metro o sin datos.')}</p>
        <div class="tiny" id="dl-estado">${T('Comprobando lo que ya tienes guardado…')}</div>
        <div class="dl" id="dl-barra" hidden><i></i></div>
      </div>
      <div class="plan-acciones" style="margin:10px 0 0">
        <button class="fila-plan" data-dl="rutinas" style="--fp:var(--acc)">
          <span class="fp-ico">${raw(icon('dumbbell'))}</span>
          <span class="grow"><span class="fp-tit">${T('Mis rutinas')}</span>
            <span class="fp-sub">${T('Solo los ejercicios que usas. Lo más rápido.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
        <button class="fila-plan" data-dl="esenciales" style="--fp:#4f8cf5">
          <span class="fp-ico">${raw(icon('star'))}</span>
          <span class="grow"><span class="fp-tit">${T('Los ejercicios principales')}</span>
            <span class="fp-sub">${T('Los más usados del catálogo')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
        <button class="fila-plan" data-dl="todos" style="--fp:#c06bf0">
          <span class="fp-ico">${raw(icon('catalogo'))}</span>
          <span class="grow"><span class="fp-tit">${T('El catálogo completo')}</span>
            <span class="fp-sub">${T('Todo. Ocupa bastante y tarda un rato.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
        <button class="fila-plan es-peligro" data-dl="vaciar" style="--fp:var(--bad)">
          <span class="fp-ico">${raw(icon('trash'))}</span>
          <span class="grow"><span class="fp-tit">${T('Liberar espacio')}</span>
            <span class="fp-sub">${T('Borra las imágenes guardadas. Se vuelven a bajar ' +
            'solas con internet.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>`;
  }

  viewVersion.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    montarDescargas(root);

    const caja = root.querySelector('#ver-caja');
    const num = root.querySelector('#ver-num');
    const sub = root.querySelector('#ver-sub');
    const disco = root.querySelector('#ver-disco');
    const btn = root.querySelector('#ver-btn');
    const corto = function (x) { return String(x || '').replace('trainingfr-', ''); };

    const bajar = function () {
      btn.disabled = true;
      btn.innerHTML = T('Actualizando…');
      caja.classList.add('ver-bajando');
      forzarActualizacion();
    };

    /* El botón es el estado: lo que dice es lo que va a hacer, y cuando no hay
       nada que hacer no está. */
    const boton = function (clase, texto, ico, fn) {
      btn.hidden = !clase;
      if (!clase) return;
      btn.className = 'btn block sm ver-btn ' + clase;
      btn.disabled = false;
      btn.innerHTML = (ico ? icon(ico) + ' ' : '') + esc(texto);
      btn.onclick = fn;
    };

    const mirar = function () {
      caja.classList.remove('ver-ok', 'ver-nueva', 'ver-sinred');
      caja.classList.add('ver-mirando');
      disco.innerHTML = icon('nube');
      sub.textContent = T('Comprobando si hay una nueva…');
      boton('', '');
      /* El número, en cuanto se sepa, sin esperar al servidor: no depende de él
         y es lo primero que se viene a mirar aquí. */
      versionLocal().then(function (l) { if (l) num.textContent = corto(l); });
      estadoVersion().then(pintar);
    };

    const pintar = function (v) {
      caja.classList.remove('ver-mirando', 'ver-ok', 'ver-nueva', 'ver-sinred');

      if (!v || v.sinRed) {
        caja.classList.add('ver-sinred');
        disco.innerHTML = icon('aviso');
        num.textContent = corto((v && v.local) || g.APP_VERSION || '—');
        sub.textContent = T('Esta es la que llevas. No he podido preguntar si hay otra: '
          + 'hace falta conexión.');
        boton('vidrio', T('Reintentar'), 'cambiar', mirar);
        return;
      }

      /* Sin caché de shell —instalación recién estrenada, o el navegador la ha
         limpiado— no hay con qué comparar, y decir «hay una nueva» sería
         mentir: lo que hay es que aún no se ha guardado nada. */
      if (!v.local) {
        caja.classList.add('ver-ok');
        disco.innerHTML = icon('nube');
        num.textContent = corto(v.servidor);
        sub.textContent = T('Recién instalada. Es la última que hay publicada.');
        boton('ghost', T('Volver a comprobar'), 'cambiar', mirar);
        return;
      }

      if (v.alDia) {
        caja.classList.add('ver-ok');
        disco.innerHTML = icon('check');
        num.textContent = corto(v.local);
        sub.textContent = T('Estás en la última versión.');
        boton('ghost', T('Volver a comprobar'), 'cambiar', mirar);
        return;
      }

      /* Aquí es donde estaba el rodeo: se enteraba de que había una nueva y te
         mandaba a otra fila a leer un párrafo para cogerla. Ahora el botón que
         ya estás mirando la baja. */
      caja.classList.add('ver-nueva');
      disco.innerHTML = icon('down');
      num.textContent = corto(v.servidor);
      sub.textContent = Tn('Nueva versión. Tú llevas la {v}.', { v: corto(v.local) });
      boton('primary btn-arranque', T('Actualizar ahora'), 'down', bajar);
    };

    mirar();

    bind(root, '[data-a=actualizarApp]', function (el) {
      el.disabled = true;
      const tit = el.querySelector('.fp-tit');
      if (tit) tit.textContent = T('Actualizando…');
      forzarActualizacion();
    });
  };

  viewAjustes.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=lugar2]', lugarSheet);

    /* Cambiar de idioma repinta entero, que es lo que hay que hacer: las
       cadenas se resuelven al pintar, no se guardan traducidas en ningún sitio,
       así que un repintado ya lo cambia todo. */
    bindAll(root, '[data-idioma]', function (el) {
      Idioma.poner(el.dataset.idioma);
      render();
      UI.toast(Idioma.datos().suyo);
    });
    bind(root, '[data-a=franjas]', function () {
      if (g.VISTAS && VISTAS.franjasSheet) VISTAS.franjasSheet();
    });
    bind(root, '[data-a=claves]', function () { go('claves'); });
    bind(root, '[data-a=ircuenta]', function () { go('cuenta'); });
    /* El nombre se cambia en Datos y hábitos, que es donde vive con los demás
       datos de la persona. Aquí solo se enseña. */
    bind(root, '[data-a=editarnombre]', function () { go('datos'); });

    bindAll(root, '[data-reg]', function (el) {
      Store.setSetting('registro', el.dataset.reg);
      render();
      UI.toast(el.dataset.reg === 'simple' ? T('Ahora solo marcarás las series como hechas')
        : el.dataset.reg === 'ejercicio' ? T('Ahora marcas el ejercicio entero de un toque')
        : T('Ahora anotarás peso y repeticiones'));
    });
    bindAll(root, '[data-sino]', function (el) {
      Store.setSetting(el.dataset.sino, el.dataset.val);
      render();
      UI.toast(el.dataset.val === 'si' ? T('Lo irás marcando') : T('Sin casillas de por medio'));
    });
    /* La marca se corre y la pantalla se rehace despues. Si se repintara de
       golpe, la marca aparecería ya puesta en la otra posición y el movimiento
       —que es lo que dice que una cosa deja paso a la otra— no se vería. */
    const correrMando = function (el, luego) {
      const m = el.closest('.mando');
      if (!m) { luego(); return; }
      const ops = [].slice.call(m.querySelectorAll('.mando-op'));
      const marca = m.querySelector('.mando-marca');
      if (marca) marca.style.transform = 'translateX(' + (ops.indexOf(el) * 100) + '%)';
      ops.forEach(function (b) { b.classList.toggle('on', b === el); });
      setTimeout(luego, 220);
    };

    bindAll(root, '[data-unit]', function (el) {
      correrMando(el, function () { Store.setSetting('unit', el.dataset.unit); render(); });
    });
    bindAll(root, '[data-theme]', function (el) {
      correrMando(el, function () {
        Store.setSetting('theme', el.dataset.theme);
        aplicarTema();
        render();
      });
    });
    bind(root, '[data-a=olvidarfrases]', function () {
      if (g.IA && IA.olvidarFrases) IA.olvidarFrases();
      render();
      UI.toast(T('Memoria de frases borrada'));
    });

    bind(root, '[data-a=sound]', function () {
      Store.setSetting('sound', !Store.settings().sound);
      render();
    });

    bind(root, '[data-a=export]', function () {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'training-fr-' + Store.dayKey(Date.now()) + '.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      UI.toast(T('Copia descargada'));
    });

    const file = root.querySelector('#s-file');
    bind(root, '[data-a=import]', function () { file.click(); });
    file.onchange = function () {
      const f = file.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () {
        UI.confirm(T('Importar copia'),
          T('Se reemplazarán las rutinas y el historial actuales por los del archivo.'),
          T('Importar'), true).then(function (ok) {
          if (!ok) return;
          try {
            Store.importJSON(reader.result);
            aplicarTema();
            UI.toast(T('Datos importados'));
            go('inicio');
          } catch (e) {
            UI.toast(T('El archivo no es válido'));
          }
        });
      };
      reader.readAsText(f);
    };

    bind(root, '[data-a=wipe]', function () {
      UI.confirm(T('Borrar todo'),
        T('Se eliminarán rutinas, entrenamientos y ajustes de este dispositivo. No se puede deshacer.'),
        T('Borrar todo'), true).then(function (ok) {
        if (ok) { Store.wipe(); aplicarTema(); go('inicio'); UI.toast(T('Datos borrados')); }
      });
    });

    /* Tres caminos, y el botón dice cuál es antes de tocarlo: instalar de
       verdad, enseñar los pasos del iPhone, o avisar de que desde dentro de
       otra app no se puede. Si ya está instalada no sale nada. */
    if (g.Instalar) {
      const b = root.querySelector('#btn-install');
      const via = Instalar.via();
      if (b && via) {
        b.hidden = false;
        b.textContent = via === 'nativa' ? T('Instalar aplicación')
          : via === 'ios' ? T('Cómo se instala en el iPhone')
          : T('Por qué no puedo instalarla aquí');
        b.onclick = function () {
          if (via === 'nativa') {
            Instalar.lanzar().then(function (ok) { if (ok) b.hidden = true; });
          } else Instalar.guia();
        };
      }
    }
  };

  /* Qué servicios están ya configurados, para la fila de la bóveda */
  function resumenClaves() {
    const puestas = [];
    if (g.IA && IA.activa()) puestas.push(IA.proveedorActual().label);
    if (g.Spotify && Spotify.configurado()) puestas.push('Spotify');
    if (Sync.configurado()) puestas.push('Supabase');
    return puestas.length ? puestas.join(' · ') : T('IA, Spotify y sincronización');
  }

  /* ================= cuenta y sincronización ================= */

  /* '' = elegir camino, 'tengo' = conectar a una cuenta existente, 'nueva' = crearla */
  let altaModo = '';

  /* 'entrar' o 'crear': con contraseña, que no depende del límite de correos */
  let accesoModo = 'entrar';

  function vistaCuenta() {
    /* 1. sin configurar: dos caminos, según si ya usas la app en otro sitio */
    if (!Sync.configurado()) {
      if (altaModo === 'tengo') return altaConCuentaHTML();
      if (altaModo === 'nueva') return altaNuevaHTML();

      return html`
        <div class="card tarjeta-premium">
          <div class="pre-encima">${T('Se hace una vez')}</div>
          <p class="muted" style="margin:6px 0 0;font-size:.88rem">${T('Entra con tu correo ' +
          'y tus rutinas, tu historial y tus marcas estarán en todos tus dispositivos. Sin ' +
          'contraseñas: recibes un enlace y ya está.')}</p>
        </div>

        <div class="list-title">${T('¿Por dónde empezamos?')}</div>
        <div class="plan-acciones" style="margin:10px 0 0">
          <button class="fila-plan" data-alta="tengo" style="--fp:var(--acc)">
            <span class="fp-ico">${raw(icon('correo'))}</span>
            <span class="grow"><span class="fp-tit">${T('Ya tengo cuenta')}</span>
              <span class="fp-sub">${T('Uso la app en otro dispositivo. Conecto este y listo.')}</span></span>
            <span class="chevron">${raw(icon('chevron'))}</span>
          </button>
          <button class="fila-plan" data-alta="nueva" style="--fp:#4f8cf5">
            <span class="fp-ico">${raw(icon('nube'))}</span>
            <span class="grow"><span class="fp-tit">${T('Es mi primera vez')}</span>
              <span class="fp-sub">${T('Creo la base de datos gratuita. Una vez, cinco minutos.')}</span></span>
            <span class="chevron">${raw(icon('chevron'))}</span>
          </button>
        </div>`;
    }

    /* 2. configurado pero sin sesión: entrar o crear la cuenta */
    if (!Sync.activa()) {
      return html`
        <div class="card tarjeta-premium">
          <!-- Dos pastillas sueltas no dicen que sean las dos caras de lo mismo.
               Un mando de dos posiciones con la marca corriéndose de una a otra
               sí: se ve que elegir una es dejar la otra. -->
          <div class="mando">
            <span class="mando-marca"${raw(accesoModo === 'crear'
              ? ' style="transform:translateX(100%)"' : '')}></span>
            <button class="mando-op${raw(accesoModo === 'entrar' ? ' on' : '')}"
                    data-acceso="entrar">${T('Entrar')}</button>
            <button class="mando-op${raw(accesoModo === 'crear' ? ' on' : '')}"
                    data-acceso="crear">${T('Crear cuenta')}</button>
          </div>

          <label class="tiny" style="display:block;margin-top:15px">${T('CORREO')}</label>
          <input id="sync-mail" type="email" inputmode="email" autocomplete="email"
                 placeholder="${T('tucorreo@ejemplo.com')}" style="margin:5px 0 10px">

          <label class="tiny">${T('CONTRASEÑA')}</label>
          <div class="secreto">
            <input id="sync-pass" type="password"
                   autocomplete="${accesoModo === 'crear' ? 'new-password' : 'current-password'}"
                   placeholder="${accesoModo === 'crear' ? T('Al menos 8 caracteres') : T('Tu contraseña')}">
            <button class="btn sm" data-ver="sync-pass" aria-label="${T('Mostrar u ocultar')}">
              ${raw(icon('ojo'))}</button>
          </div>

          <button class="btn primary block" data-a="${accesoModo === 'crear' ? 'crearCuenta' : 'entrarClave'}"
                  style="margin-top:14px">
            ${accesoModo === 'crear' ? T('Crear cuenta y sincronizar') : T('Entrar')}
          </button>

          <p class="tiny" style="margin-top:10px">${raw(esc(accesoModo === 'crear'
            ? T('Usa el mismo correo y contraseña en tus demás dispositivos y tendrás lo ' +
              'mismo en todos.')
            : T('Si es tu primera vez, pulsa Crear cuenta.')))}</p>
        </div>

        <button class="guia-tit" data-a="verCorreo">${raw(icon('chevron'))}
          ${T('Prefiero entrar con un enlace al correo')}</button>
        <div class="guia" id="via-correo" hidden>
          <div class="card">
            <p class="tiny">${raw(Tn('Sin contraseña: te llega un enlace y entras al ' +
            'pulsarlo. El correo que trae Supabase de serie solo permite {limite}, así que ' +
            'si lo agotas tendrás que esperar.',
            { limite: '<b>' + esc(T('dos mensajes por hora')) + '</b>' }))}</p>
            <input id="mail-enlace" type="email" inputmode="email" placeholder="${T('tucorreo@ejemplo.com')}"
                   autocomplete="email" style="margin:10px 0">
            <button class="btn block" data-a="enviarenlace">
              ${raw(icon('correo'))} ${T('Enviarme el enlace')}</button>

            <div class="hr"></div>
            <p class="tiny">${T('Si el enlace se abre en otro navegador en vez de en la ' +
            'app, cópialo del correo y pégalo aquí.')}</p>
            <input id="link-acceso" placeholder="${T('Pega el enlace del correo')}" autocomplete="off"
                   spellcheck="false" style="margin:8px 0 10px">
            <button class="btn block sm" data-a="usarLinkAcceso">${T('Entrar con ese enlace')}</button>
          </div>
        </div>

        <button class="btn ghost sm block" data-a="configsync" style="margin-top:12px">
          ${T('Cambiar la configuración de Supabase')}</button>`;
    }

    /* 3. sesión abierta */
    const tieneClave = Store.settings().tieneClave === true;
    const correo = Sync.email() || '';
    const inicial = (correo.trim()[0] || '').toUpperCase();

    /* La cuenta y su estado eran dos tarjetas separadas por media pantalla: la
       de arriba decía quién eres y la de abajo, tras dos listas, si de verdad
       había subido algo. Son la misma pregunta —¿esto está a salvo?— y ahora van
       en la misma tarjeta, con el punto vivo justo debajo del correo. */
    return html`
      <div class="card tarjeta-premium cuenta-cab">
        <div class="pre-encima">${T('Tu cuenta')}</div>
        <div class="cc-quien">
          <span class="pc-avatar">${raw(inicial || icon('perfil'))}</span>
          <span class="grow">
            <span class="pc-nombre">${correo}</span>
            <span class="pc-sub">${T('Sesión abierta en este dispositivo')}</span>
          </span>
        </div>
        <div id="sync-estado" class="cc-estado"></div>
      </div>

      <div class="list-title">${T('Qué se sincroniza')}</div>
      <div class="sync-rejilla">
        ${raw(fichaSync('dumbbell', T('Rutinas'), Store.routines().length))}
        ${raw(fichaSync('grafica', T('Entrenamientos'), Store.sessions().length))}
        ${raw(fichaSync('trofeo', T('Objetivos'), Objetivos.lista().length))}
        ${raw(fichaSync('campana', T('Alertas'), Alertas.lista().length))}
        ${raw(fichaSync('nutricion', T('Menús de comida'),
          (g.Menus && Menus.lista().length) || 0))}
        ${raw(fichaSync('perfil', T('Perfil y hábitos'),
          Perfil.completo() ? T('Completo') : T('A medias'), true))}
      </div>
      ${raw(filaSync('llave', T('Claves de IA y Spotify'),
        Sync.sincronizaClaves() ? T('Incluidas') : T('Solo en este dispositivo')))}
      <p class="tiny" style="margin-top:10px">${T('No hay que pulsar nada: lo que cambies ' +
      'sube solo unos segundos después, y lo que cambies en otro dispositivo baja al ' +
      'abrir la app, al volver a ella y cada minuto y medio mientras la tengas delante. ' +
      'Si falla, se reintenta solo.')}</p>

      <div class="list-title">${T('Tu cuenta')}</div>
      <div class="plan-acciones" style="margin:10px 0 0">
        <button class="fila-plan" data-a="verClave" style="--fp:var(--acc)">
          <span class="fp-ico">${raw(icon('llave'))}</span>
          <span class="grow">
            <span class="fp-tit">${tieneClave ? T('Cambiar contraseña') : T('Poner contraseña')}</span>
            <span class="fp-sub">${tieneClave
              ? T('Ya tienes una: con ella entras en cualquier dispositivo')
              : T('Sin contraseña solo puedes entrar con enlaces por correo')}</span></span>
          <span class="chevron down">${raw(icon('chevron'))}</span>
        </button>

        <!-- El formulario sale DENTRO de la lista, justo debajo de su fila. Antes
             era una tarjeta suelta que aparecía después de todo el bloque, y al
             abrirla parecía que se hubiera colado de otra pantalla: nada decía
             que fuera de esa fila. -->
        <div class="clave-panel" id="caja-clave" hidden>
          <label class="tiny">${tieneClave ? T('NUEVA CONTRASEÑA') : T('CONTRASEÑA')}</label>
          <div class="secreto">
            <input id="pass-nueva" type="password" autocomplete="new-password"
                   placeholder="${T('Al menos 8 caracteres')}">
            <button class="btn sm" data-ver="pass-nueva" aria-label="${T('Mostrar u ocultar')}">
              ${raw(icon('ojo'))}</button>
          </div>

          <label class="tiny" style="display:block;margin-top:11px">${T('REPÍTELA')}</label>
          <div class="secreto">
            <input id="pass-repe" type="password" autocomplete="new-password"
                   placeholder="${T('La misma otra vez')}">
            <button class="btn sm" data-ver="pass-repe" aria-label="${T('Mostrar u ocultar')}">
              ${raw(icon('ojo'))}</button>
          </div>

          <button class="btn primary block" data-a="guardarClave" style="margin-top:13px">
            ${T('Guardar contraseña')}</button>
          <p class="tiny" style="margin:9px 0 0">${T('Solo viaja a tu proyecto de Supabase, ' +
          'que la guarda cifrada.')}</p>
        </div>

        <button class="fila-plan es-peligro" data-a="salir" style="--fp:var(--bad)">
          <span class="fp-ico">${raw(icon('salir'))}</span>
          <span class="grow"><span class="fp-tit">${T('Cerrar sesión aquí')}</span>
            <span class="fp-sub">${T('Lo que ya subió se queda en la nube. Este ' +
            'dispositivo deja de sincronizar.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>

      <div class="list-title">${T('Si algo no cuadra')}</div>
      <div class="plan-acciones" style="margin:10px 0 0">
        <button class="fila-plan" data-a="forzarBajar" style="--fp:#4f8cf5">
          <span class="fp-ico">${raw(icon('down'))}</span>
          <span class="grow"><span class="fp-tit">${T('Traer lo de la nube')}</span>
            <span class="fp-sub">${T('Reemplaza lo de este dispositivo por lo guardado')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
        <button class="fila-plan" data-a="forzarSubir" style="--fp:#f0a23c">
          <span class="fp-ico">${raw(icon('up'))}</span>
          <span class="grow"><span class="fp-tit">${T('Subir lo de este dispositivo')}</span>
            <span class="fp-sub">${T('Reemplaza lo de la nube por lo de aquí')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>
      <p class="tiny" style="margin-top:8px">${T('Úsalos solo si la sincronización ' +
      'automática se ha quedado con la versión equivocada.')}</p>`;
  }

  function viewCuenta() {
    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Perfil')}</button>
      <h1>${T('Mi cuenta')}</h1>
      <p class="muted">${T('Entra con tu correo y la app queda igual en todos tus ' +
      'dispositivos: rutinas, historial, perfil, objetivos, alertas y ajustes.')}</p>

      ${raw(vistaCuenta())}

      ${raw(Sync.configurado() && !Sync.activa() ? html`
        <div id="aviso-alta"></div>

        <div class="card" style="margin-top:12px">
          <div style="font-weight:600;margin-bottom:4px">${T('Cómo funciona')}</div>
          <ol class="instr" style="margin-top:8px">
            <li>${T('Escribes tu correo y tu contraseña, los mismos en todos tus dispositivos.')}</li>
            <li>${T('Al entrar se descarga lo que tengas en la nube y se une con lo de aquí.')}</li>
            <li>${T('A partir de ahí, cada cambio sube solo unos segundos después.')}</li>
          </ol>
          <p class="tiny" style="margin:0">${T('Si prefieres entrar sin contraseña, tienes ' +
          'la opción del enlace por correo debajo.')}</p>
        </div>` : '')}`;
  }

  /* Estado de la sincronización, en vivo: sin esto no hay forma de saber si de
     verdad ha subido algo o lleva media hora fallando en silencio. */
  function estadoSyncHTML() {
    const e = Sync.estado();
    const hace = function (t) {
      if (!t) return T('nunca');
      const s = Math.round((Date.now() - t) / 1000);
      if (s < 60) return T('hace un momento');
      if (s < 3600) return Tn('hace {n} min', { n: Math.round(s / 60) });
      if (s < 86400) return Tn('hace {n} h', { n: Math.round(s / 3600) });
      return UI.fecha(t);
    };

    /* El estado era un punto de color y una frase. El color lo dice todo de
       golpe, pero un punto quieto no distingue «está subiendo ahora mismo» de
       «terminó hace media hora»: los dos eran un punto verde. Los dos estados
       que están pasando ahora laten; los que ya terminaron, no. */
    const mapa = {
      subiendo: { txt: T('Subiendo tus cambios…'), tono: 'var(--acc)', vivo: true },
      bajando: { txt: T('Buscando cambios de otros dispositivos…'), tono: 'var(--acc)', vivo: true },
      pendiente: { txt: T('Cambios pendientes de subir'), tono: 'var(--warn)', vivo: true },
      error: { txt: T('No se pudo sincronizar'), tono: 'var(--bad)' },
      ok: { txt: T('Todo al día'), tono: 'var(--acc)' },
      inactivo: { txt: T('Esperando el primer cambio'), tono: 'var(--dim2)' }
    };
    const m = mapa[e.fase] || mapa.inactivo;

    return html`
      <div class="cce-fila" style="--tono:${raw(m.tono)}">
        <span class="cce-punto${raw(m.vivo ? ' vivo' : '')}"></span>
        <span class="grow">
          <b class="cce-txt">${m.txt}</b>
          <span class="tiny">${Tn('Última sincronización completa {cuando}.',
            { cuando: hace(e.ultimo) })}</span>
        </span>
        <button class="btn sm vidrio" data-a="sincronizarYa">${T('Comprobar')}</button>
      </div>
      ${raw(e.error ? '<p class="cce-nota mal">' + esc(e.error) + '</p>' : '')}
      ${raw(e.pendiente ? '<p class="cce-nota">' + esc(T('Hay cambios de este dispositivo ' +
        'esperando a subir. Se reintenta solo.')) + '</p>' : '')}`;
  }

  /* Siete filas idénticas con la cifra al final: para saber cuánto hay guardado
     había que recorrerlas de arriba abajo leyendo el canto derecho. En fichas la
     cifra manda y se ven las seis a la vez. */
  function fichaSync(ico, titulo, valor, texto) {
    return '<div class="sy-ficha">' +
      '<span class="sy-ico">' + icon(ico) + '</span>' +
      '<b class="sy-val' + (texto ? ' sy-txt' : '') + '">' + esc(String(valor)) + '</b>' +
      '<span class="sy-lab">' + esc(titulo) + '</span></div>';
  }

  /* Las claves no son una cantidad, son un sí o un no: van en fila aparte para
     no enseñar un número donde no hay ninguno. */
  function filaSync(ico, titulo, valor) {
    return '<div class="sy-fila"><span class="sy-ico">' + icon(ico) + '</span>' +
      '<span class="grow"><span class="sy-f-tit">' + esc(titulo) + '</span></span>' +
      '<span class="sy-f-val">' + esc(String(valor)) + '</span></div>';
  }

  /* Lo que más tiempo ha hecho perder a la gente: la conexión que trae la app
     tiene el alta de cuentas cerrada a propósito, así que quien no sea el dueño
     puede rellenar el formulario, darle a crear cuenta y quedarse sin nada, sin
     entender por qué luego no puede entrar desde otro móvil. Se pregunta al
     propio proyecto —lo publica sin necesidad de sesión— y se dice antes de
     escribir nada. Si algún día se abre el alta, este aviso desaparece solo. */
  function avisarSiElAltaEstaCerrada(root) {
    const caja = root.querySelector('#aviso-alta');
    if (!caja || !Sync.ajustesProyecto) return;

    Sync.ajustesProyecto().then(function (a) {
      if (!a || !a.disable_signup) return;
      const propia = Sync.configPropia();
      caja.innerHTML = html`
        <div class="card aviso-seguridad" style="margin-top:12px">
          <b>${T('Aquí no se pueden crear cuentas nuevas')}</b>
          <p style="margin:8px 0 0;font-size:.9rem">${propia
            ? T('Tu proyecto de Supabase tiene cerrada el alta. Ábrela un momento en '
              + 'Authentication → Sign In / Providers → Allow new users to sign up, '
              + 'regístrate, y vuelve a cerrarla.')
            : T('La conexión que trae la app es la mía y está cerrada a propósito: si '
              + 'ya tienes cuenta, entra con tu correo aquí abajo. Si no la tienes, '
              + 'monta la tuya —es gratis, son diez minutos y los datos quedan en tu '
              + 'propia base de datos, no en la mía.')}</p>
          ${raw(propia ? '' :
            '<button class="btn primary block" data-a="montarbd" style="margin-top:11px">' +
            UI.esc(T('Montar mi base de datos')) + '</button>')}
        </div>`;
      const b = caja.querySelector('[data-a=montarbd]');
      if (b) b.onclick = function () { go('basedatos'); };
    });
  }

  viewCuenta.mount = function (root) {
    avisarSiElAltaEstaCerrada(root);
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    mountCuenta(root);

    pintarEstadoSync();
  };

  /* Un único oyente para toda la vida de la app: si se registrara al montar la
     vista, cada visita a Mi cuenta dejaría uno más detrás. */
  function pintarEstadoSync() {
    const caja = document.getElementById('sync-estado');
    if (!caja) return;
    caja.innerHTML = estadoSyncHTML();
    const b = caja.querySelector('[data-a=sincronizarYa]');
    if (b) b.onclick = function () {
      b.disabled = true;
      Sync.ciclo(true).then(function (r) {
        pintarEstadoSync();
        UI.toast(r === 'igual' ? T('Ya estaba todo al día')
          : r === 'subido' ? T('Tus cambios están en la nube')
          : r === 'muy pronto' ? T('Comprobado hace un momento')
          : T('Datos actualizados'));
        if (r === 'bajado' || r === 'fusionado') { aplicarTema(); render(); }
      }).catch(function (e) { pintarEstadoSync(); UI.toast(e.message); });
    };
  }

  /* Asistente de configuración: URL y clave del proyecto, más el SQL de la tabla */
  function configSyncSheet() {
    const c = Sync.config() || {};
    UI.modal(html`
      <h2>${T('Activar la sincronización')}</h2>
      <p class="muted">${T('Se hace una vez y es gratis. Guarda tus datos en tu propia ' +
      'base de datos.')}</p>

      <ol class="instr" style="margin:14px 0">
        <li>${raw(Tn('Entra en {enlace}, crea una cuenta y pulsa {boton}. Elige cualquier ' +
          'nombre y contraseña.',
          { enlace: '<a href="https://supabase.com" target="_blank" ' +
            'rel="noopener noreferrer">supabase.com</a>', boton: '<b>New project</b>' }))}</li>
        <li>${raw(T('Cuando termine, ve a <b>Project Settings → API</b> y copia la ' +
          '<b>Project URL</b> y la clave <b>anon public</b>.'))}</li>
        <li>${raw(T('Ve a <b>SQL Editor</b>, pega el bloque de abajo y pulsa <b>Run</b>. ' +
          'Crea la tabla donde se guardan tus datos, protegida para que solo tú puedas ' +
          'verlos.'))}</li>
        <li>${raw(T('Ve a <b>Authentication → URL Configuration</b> y añade esta ' +
          'dirección en <b>Redirect URLs</b>:'))}<br><code class="tiny">${Sync.urlRetorno()}</code></li>
      </ol>

      <div class="row between" style="margin-bottom:6px">
        <span class="tiny">${T('SQL PARA CREAR LA TABLA')}</span>
        <button class="btn sm" data-a="copiarsql">${raw(icon('copy'))} ${T('Copiar')}</button>
      </div>
      <pre id="sql-box">${Sync.SQL}</pre>

      <label class="tiny">PROJECT URL</label>
      <input id="cfg-url" placeholder="https://xxxxxxxx.supabase.co" value="${c.url || ''}"
             autocomplete="off" spellcheck="false" style="margin:5px 0 10px">
      <label class="tiny">${T('CLAVE ANON PUBLIC')}</label>
      <input id="cfg-key" placeholder="eyJhbGciOi..." value="${c.key || ''}"
             autocomplete="off" spellcheck="false" style="margin:5px 0 12px">

      <button class="btn primary block" data-a="guardarcfg">${T('Guardar y continuar')}</button>
      ${raw(Sync.configPropia() ? '<button class="btn danger block sm" data-a="borrarcfg" style="margin-top:8px">' +
        esc(T('Volver a la conexión que trae la app')) + '</button>' : '')}`,
      function (el) {
        el.querySelector('[data-a=copiarsql]').onclick = function () {
          const t = el.querySelector('#sql-box').textContent;
          if (navigator.clipboard) navigator.clipboard.writeText(t);
          UI.toast(T('SQL copiado'));
        };
        el.querySelector('[data-a=guardarcfg]').onclick = function () {
          try {
            Sync.guardarConfig(el.querySelector('#cfg-url').value, el.querySelector('#cfg-key').value);
            UI.closeModal();
            render();
            UI.toast(T('Configuración guardada. Ahora entra con tu correo.'));
          } catch (e) {
            UI.toast(e.message);
          }
        };
        const borrar = el.querySelector('[data-a=borrarcfg]');
        if (borrar) borrar.onclick = function () {
          UI.confirm(T('Volver a la conexión de la app'),
            T('Se borrará la configuración propia de este dispositivo y su sesión. ' +
            'Tus datos locales y los de la nube no se tocan.'), T('Continuar'), true).then(function (ok) {
            if (ok) { Sync.borrarConfig(); UI.closeModal(); render(); UI.toast(T('Desconectado')); }
          });
        };
      });
  }

  /* Camino corto: ya hay una cuenta en otro dispositivo */
  function altaConCuentaHTML() {
    return html`
      <button class="btn sm ghost" data-alta="" style="margin-bottom:10px">
        ${raw(icon('back'))} Volver</button>

      <div class="card">
        <div style="font-weight:600;margin-bottom:4px">Conectar este dispositivo</div>
        <p class="muted" style="margin-bottom:0">En el dispositivo donde ya usas la app,
        entra en <b>Ajustes → Bóveda de claves → Enlazar un dispositivo nuevo</b> y comparte
        el enlace. Pégalo aquí.</p>
        <input id="alta-enlace" placeholder="Pega aquí el enlace" autocomplete="off"
               spellcheck="false" style="margin:12px 0 10px">
        <button class="btn primary block" data-a="usarEnlace">Conectar</button>
      </div>

      <div class="list-title">O a mano</div>
      <div class="card">
        <p class="muted">Si prefieres, copia los dos datos del panel de Supabase.</p>
        <label class="tiny">PROJECT URL</label>
        <input id="alta-url" placeholder="https://xxxxxxxx.supabase.co" autocomplete="off"
               spellcheck="false" style="margin:5px 0 10px">
        <label class="tiny">CLAVE PUBLISHABLE</label>
        <input id="alta-key" type="password" placeholder="sb_publishable_..." autocomplete="off"
               spellcheck="false" style="margin:5px 0 12px">
        <button class="btn block" data-a="usarManual">Guardar y continuar</button>
      </div>

      <p class="tiny" style="margin-top:12px">Después escribirás tu correo y, al pulsar el
      enlace que te llegue, este dispositivo tendrá todo lo tuyo.</p>`;
  }

  /* Camino largo: no hay cuenta todavía */
  function altaNuevaHTML() {
    if (!Sync.puedeConfigurar()) {
      return html`
        <button class="btn sm ghost" data-alta="" style="margin-bottom:10px">
          ${raw(icon('back'))} ${T('Volver')}</button>
        <div class="card">
          <div style="font-weight:600;margin-bottom:4px">${T('Las cuentas las crea quien administra')}</div>
          <p class="muted" style="margin:0">${T('Pídele que te dé de alta con tu correo ' +
          'y te pase una contraseña. Luego entras aquí arriba con esos datos y ya puedes ' +
          'cambiarla desde Mi cuenta.')}</p>
        </div>`;
    }

    return html`
      <button class="btn sm ghost" data-alta="" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Volver')}</button>

      <div class="card">
        <div style="font-weight:600;margin-bottom:4px">${T('Crear tu base de datos')}</div>
        <p class="muted" style="margin:0">${T('Es gratis y se hace una sola vez. Tus datos ' +
        'quedan en tu propia cuenta de Supabase, no en un servidor mío ni de nadie.')}</p>
      </div>

      <div class="card">
        <ol class="instr">
          <li>${raw(Tn('Entra en {enlace}, crea una cuenta y pulsa {boton}. Nombre y ' +
            'contraseña, los que quieras; elige la región más cercana.',
            { enlace: '<a href="https://supabase.com" target="_blank" ' +
              'rel="noopener noreferrer">supabase.com</a>', boton: '<b>New project</b>' }))}</li>
          <li>${raw(T('Cuando termine, ve a <b>SQL Editor</b>, pega el bloque que te da la ' +
            'bóveda y pulsa <b>Run</b>. Crea la tabla de tus datos.'))}</li>
          <li>${raw(T('En <b>Authentication → URL Configuration</b>, pon esta dirección ' +
            'en <b>Site URL</b> y en <b>Redirect URLs</b>.'))}</li>
          <li>${raw(T('En <b>Project Settings → API Keys</b> copia la <b>Publishable ' +
            'key</b>, y la <b>Project URL</b> de <b>Data API</b>.'))}</li>
          <li>${T('Pega los dos valores en la bóveda y vuelve aquí a entrar con tu correo.')}</li>
        </ol>
        <button class="btn primary block" data-a="pasoapaso">
          ${raw(icon('chevron'))} ${T('Abrir el paso a paso completo')}</button>
      </div>`;
  }

  function mountCuenta(root) {
    bindAll(root, '[data-alta]', function (el) {
      altaModo = el.dataset.alta || '';
      render();
    });

    bind(root, '[data-a=pasoapaso]', function () { go('basedatos'); });

    bind(root, '[data-a=usarEnlace]', function () {
      const v = (root.querySelector('#alta-enlace').value || '').trim();
      const trozo = v.split('#/enlazar/')[1];
      if (!trozo || !Sync.aplicarEnlace(trozo)) {
        UI.toast(T('Ese enlace no es válido. Cópialo entero.'));
        return;
      }
      altaModo = '';
      render();
      UI.toast(T('Dispositivo conectado. Ahora entra con tu correo.'));
    });

    bind(root, '[data-a=usarManual]', function () {
      try {
        Sync.guardarConfig(root.querySelector('#alta-url').value,
          root.querySelector('#alta-key').value);
        altaModo = '';
        render();
        UI.toast(T('Guardado. Ahora entra con tu correo.'));
      } catch (e) { UI.toast(e.message); }
    });

    bind(root, '[data-a=configsync]', configSyncSheet);

    bind(root, '[data-a=enviarenlace]', function (btn) {
      const campo = root.querySelector('#mail-enlace') || root.querySelector('#sync-mail');
      btn.disabled = true;
      btn.textContent = T('Enviando…');
      Sync.enviarEnlace(campo.value).then(function (dir) {
        UI.modal(html`
          <h2>${T('Revisa tu correo')}</h2>
          <p class="muted">${raw(Tn('Hemos enviado un enlace de acceso a {correo}. Ábrelo ' +
          'en este mismo dispositivo y entrarás automáticamente.',
          { correo: '<b>' + esc(dir) + '</b>' }))}</p>
          <p class="tiny">${T('Si no aparece en unos minutos, mira en spam.')}</p>
          <button class="btn primary block" data-x="ok">${T('Entendido')}</button>`,
          function (el) { el.querySelector('[data-x=ok]').onclick = UI.closeModal; });
      }).catch(function (e) {
        UI.toast(e.message || T('No se pudo enviar el enlace'));
      }).then(function () {
        render();
      });
    });

    bindAll(root, '[data-acceso]', function (el) {
      accesoModo = el.dataset.acceso;

      /* La marca se corre primero y la pantalla se rehace despues. Si se
         repintara de golpe, la marca aparecería ya puesta en el otro lado y el
         movimiento —que es lo que dice que una cosa deja paso a la otra— no se
         llegaría a ver nunca. */
      const mando = root.querySelector('.mando');
      if (!mando) { render(); return; }
      const marca = mando.querySelector('.mando-marca');
      if (marca) marca.style.transform = accesoModo === 'crear' ? 'translateX(100%)' : 'translateX(0)';
      mando.querySelectorAll('.mando-op').forEach(function (b) {
        b.classList.toggle('on', b.dataset.acceso === accesoModo);
      });
      setTimeout(render, 220);
    });

    bindAll(root, '[data-ver]', function (el) {
      const campo = root.querySelector('#' + el.dataset.ver);
      if (!campo) return;
      const oculto = campo.type === 'password';
      campo.type = oculto ? 'text' : 'password';
      el.classList.toggle('on', oculto);
    });

    bind(root, '[data-a=verCorreo]', function (el) {
      const c = root.querySelector('#via-correo');
      if (c) { c.hidden = !c.hidden; el.classList.toggle('abierta', !c.hidden); }
    });

    const conCredenciales = function (btn, fn, textoOcupado) {
      const correo = (root.querySelector('#sync-mail') || {}).value;
      const clave = (root.querySelector('#sync-pass') || {}).value;
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = textoOcupado;
      fn(correo, clave).then(function (r) {
        if (r && r.ok) return trasEntrar(r);
        btn.disabled = false;
        btn.textContent = original;
        if (r && r.error) UI.toast(r.error);
      }).catch(function (e) {
        btn.disabled = false;
        btn.textContent = original;
        UI.toast(e.message);
      });
    };

    bind(root, '[data-a=entrarClave]', function (btn) {
      conCredenciales(btn, function (c, p) {
        return Sync.entrarConClave(c, p).then(function (r) {
          Store.setSetting('tieneClave', true);
          return r;
        });
      }, T('Entrando…'));
    });

    bind(root, '[data-a=crearCuenta]', function (btn) {
      conCredenciales(btn, function (c, p) {
        return Sync.registrar(c, p).then(function (r) {
          if (r && r.ok) Store.setSetting('tieneClave', true);
          return r;
        });
      }, T('Creando…'));
    });

    bind(root, '[data-a=verPegar]', function (el) {
      const c = root.querySelector('#pegar-enlace');
      if (c) { c.hidden = !c.hidden; el.classList.toggle('abierta', !c.hidden); }
    });

    bind(root, '[data-a=usarLinkAcceso]', function (btn) {
      const campo = root.querySelector('#link-acceso');
      btn.disabled = true;
      btn.textContent = T('Entrando…');
      Sync.entrarConEnlace(campo.value).then(function (r) {
        trasEntrar(r);
      }).catch(function (e) {
        btn.disabled = false;
        btn.textContent = T('Entrar con ese enlace');
        UI.toast(e.message);
      });
    });

    bind(root, '[data-a=verClave]', function (el) {
      const c = root.querySelector('#caja-clave');
      if (!c) return;
      c.hidden = !c.hidden;
      const f = el.querySelector('.chevron');
      if (f) f.classList.toggle('abierto', !c.hidden);
      if (!c.hidden) c.querySelector('#pass-nueva').focus();
    });

    const forzar = function (sentido, titulo, aviso) {
      return function () {
        UI.confirm(titulo, aviso, T('Continuar'), true).then(function (ok) {
          if (!ok) return;
          Sync.sincronizar(sentido).then(function () {
            aplicarTema();
            render();
            UI.toast(sentido === 'bajar' ? T('Datos traídos de la nube') : T('Datos subidos a la nube'));
          }).catch(function (e) { UI.toast(e.message); });
        });
      };
    };

    bind(root, '[data-a=forzarBajar]', forzar('bajar', T('Traer lo de la nube'),
      T('Lo que tengas en este dispositivo se reemplaza por lo guardado en la nube.')));
    bind(root, '[data-a=forzarSubir]', forzar('subir', T('Subir lo de este dispositivo'),
      T('Lo guardado en la nube se reemplaza por lo que tengas en este dispositivo.')));

    bind(root, '[data-a=guardarClave]', function (btn) {
      const nueva = (root.querySelector('#pass-nueva') || {}).value || '';
      const repe = (root.querySelector('#pass-repe') || {}).value || '';
      if (nueva !== repe) { UI.toast(T('Las dos contraseñas no coinciden')); return; }

      btn.disabled = true;
      btn.textContent = T('Guardando…');
      Sync.establecerClave(nueva).then(function () {
        Store.setSetting('tieneClave', true);
        render();
        UI.toast(T('Contraseña guardada. Ya puedes entrar con ella en otros dispositivos.'));
      }).catch(function (e) {
        btn.disabled = false;
        btn.textContent = T('Guardar contraseña');
        UI.toast(e.message);
      });
    });

    bind(root, '[data-a=sincronizar]', function (btn) {
      btn.disabled = true;
      const antes = btn.innerHTML;
      btn.textContent = T('Sincronizando…');
      Sync.sincronizar().then(function (r) {
        UI.toast(r === 'bajado' ? T('Datos actualizados desde la nube')
          : r === 'subido' ? T('Tus datos están guardados en la nube')
          : T('Ya estaba todo al día'));
        aplicarTema();
        render();
      }).catch(function (e) {
        btn.disabled = false;
        btn.innerHTML = antes;
        UI.toast(e.message || T('No se pudo sincronizar'));
      });
    });

    bind(root, '[data-a=salir]', function () {
      UI.modal(html`
        <h2>${T('Cerrar sesión')}</h2>
        <p class="muted">${T('Tus datos siguen guardados en la nube y volverán al entrar ' +
        'de nuevo. Elige qué hacer con la copia de este dispositivo.')}</p>
        <div class="stack" style="margin-top:14px">
          <button class="btn block" data-x="conservar">${T('Cerrar y conservarlos aquí')}</button>
          <button class="btn danger block" data-x="borrar">${T('Cerrar y borrarlos de este dispositivo')}</button>
        </div>
        <p class="tiny" style="margin-top:10px">${T('Borrarlos es lo apropiado si el ' +
        'dispositivo no es tuyo o lo va a usar otra persona con su cuenta.')}</p>
        <button class="btn ghost block sm" data-x="cancelar" style="margin-top:8px">${T('Cancelar')}</button>`,
        function (el) {
          const cerrar = function (borrar) {
            UI.closeModal();
            Sync.salir(borrar).then(function () {
              aplicarTema();
              render();
              UI.toast(borrar ? T('Sesión cerrada y datos borrados') : T('Sesión cerrada'));
            });
          };
          el.querySelector('[data-x=conservar]').onclick = function () { cerrar(false); };
          el.querySelector('[data-x=borrar]').onclick = function () { cerrar(true); };
          el.querySelector('[data-x=cancelar]').onclick = UI.closeModal;
        });
    });
  }

  /* Al volver del enlace del correo: decidir qué hacer con lo que ya hay aquí */
  function trasEntrar(info) {
    info = info || {};

    /* Si acaba de entrar otra cuenta, lo local ya se ha borrado: no hay nada
       que fusionar y preguntar por ello solo confundiría. */
    if (info.cambioDeCuenta) {
      return Sync.sincronizar('bajar').catch(function () {
        /* cuenta nueva sin datos en la nube: se sube lo que haya */
        return Sync.sincronizar('subir');
      }).then(function () {
        aplicarTema();
        go('cuenta');
        UI.toast(Tn('Ahora estás como {correo}', { correo: Sync.email() }));
      }).catch(function () {
        aplicarTema();
        render();
        UI.toast(Tn('Has entrado como {correo}', { correo: Sync.email() }));
      });
    }

    /* Ya no hay que preguntar nada: la sincronización fusiona los dos lados,
       así que entrar en un dispositivo nunca le cuesta datos a ninguno. */
    return Sync.sincronizar().then(function () {
      aplicarTema();
      go('cuenta');
      const piezas = [];
      if (Store.routines().length) {
        piezas.push(Tp(Store.routines().length, '{n} rutina', '{n} rutinas'));
      }
      if (Store.sessions().length) {
        piezas.push(Tp(Store.sessions().length, '{n} entrenamiento', '{n} entrenamientos'));
      }
      if (Sync.sincronizaClaves() && (IA.activa() || Spotify.configurado())) {
        piezas.push(T('tus claves'));
      }
      UI.toast(piezas.length
        ? Tn('Listo: {lista} en este dispositivo', { lista: piezas.join(', ') })
        : Tn('Has entrado como {correo}', { correo: Sync.email() }));
    }).catch(function (e) {
      render();
      UI.toast(e.message || T('Entraste, pero no se pudo sincronizar todavía'));
    });
  }

  /* Aviso de versión nueva, con su botón para recargar en el momento */
  let avisadoVersion = false;
  function avisarVersionNueva(seRecargaSola) {
    if (avisadoVersion) return;
    avisadoVersion = true;
    /* contenedor propio: el de recordatorios se reescribe en cada pintado */
    const host = document.getElementById('avisos');
    if (!host || !host.parentNode) return;
    const caja = document.createElement('div');
    caja.className = 'avisos';
    caja.id = 'aviso-version';
    caja.innerHTML = html`
      <span class="row-icon">${raw(icon('down'))}</span>
      <div class="grow">
        <div style="font-weight:600;font-size:.95rem">${T('Hay una versión nueva')}</div>
        <div class="tiny">${seRecargaSola
          ? T('Se instala sola en un momento. Tus datos no se tocan.')
          : T('Recarga cuando termines. Tus datos no se tocan.')}</div>
      </div>
      <button class="btn sm primary" data-recargar>${T('Actualizar ya')}</button>`;
    caja.innerHTML = '<div class="aviso">' + caja.innerHTML + '</div>';
    host.parentNode.insertBefore(caja, host);
    caja.querySelector('[data-recargar]').onclick = function () { location.reload(); };
  }

  /* Qué versión hay instalada y cuál se está publicando. La instalada se lee
     del nombre de la caché, que es lo único que no miente aunque el service
     worker se haya quedado a medias; la publicada, del propio sw.js pedido sin
     pasar por ninguna caché. */
  /* Lo último que se supo, para que Perfil pueda enseñar el punto de «hay una
     nueva» sin volver a preguntar en cada repintado. */
  let ultimaVersion = null;
  function versionSabida() { return ultimaVersion; }

  /* Con cobertura mala, este fetch se puede quedar colgado hasta que el
     navegador se canse, y mientras tanto la pantalla se queda diciendo
     «comprobando» sin final. Ocho segundos y se da por no contestado: quien
     esta en el metro prefiere un «no he podido» y un boton de reintentar a un
     reloj de arena eterno. */
  function conTope(promesa, ms) {
    return Promise.race([
      promesa,
      new Promise(function (ok) { setTimeout(function () { ok(null); }, ms || 8000); })
    ]);
  }

  /* Qué versión hay AQUÍ. No sale de la red: sale del nombre de la caché que
     dejó puesta el service worker que está mandando. Se pregunta aparte del
     servidor a propósito, porque esto se sabe siempre —también en el metro— y
     antes se perdía: si el fetch fallaba, la pantalla no enseñaba ni el número
     que ya tenía delante. */
  function versionLocal() {
    if (!window.caches) return Promise.resolve('');
    return caches.keys().then(function (ks) {
      return ks.filter(function (k) { return k.indexOf('-shell') !== -1; })
        .map(function (k) { return k.replace('-shell', ''); })[0] || '';
    }).catch(function () { return ''; });
  }

  function versionPublicada() {
    return conTope(fetch('sw.js?v=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        const m = t.match(/VERSION = '([^']+)'/);
        return m ? m[1] : '';
      })
      .catch(function () { return ''; }));
  }

  function estadoVersion() {
    if (!window.caches) return Promise.resolve(null);
    return Promise.all([versionLocal(), versionPublicada()]).then(function (r) {
      ultimaVersion = {
        local: r[0], servidor: r[1],
        sinRed: !r[1],
        alDia: !!r[0] && !!r[1] && r[0] === r[1]
      };
      return ultimaVersion;
    });
  }

  /* Borrar el service worker y las cachés de código y volver a empezar. Es lo
     que arregla un móvil que se ha quedado con archivos de dos versiones. */
  function forzarActualizacion() {
    const fin = function () { location.reload(true); };
    const tareas = [];
    if ('serviceWorker' in navigator) {
      tareas.push(navigator.serviceWorker.getRegistrations().then(function (rs) {
        return Promise.all(rs.map(function (r) { return r.unregister(); }));
      }));
    }
    if (window.caches) {
      tareas.push(caches.keys().then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k.indexOf('-media') === -1; })
          .map(function (k) { return caches.delete(k); }));
      }));
    }
    return Promise.all(tareas).then(fin).catch(fin);
  }

  /* En qué versión está de verdad lo que se está ejecutando. Lo contesta el
     service worker, que es el único que lo sabe con certeza. */
  function versionDelSW() {
    return new Promise(function (ok) {
      const sw = 'serviceWorker' in navigator ? navigator.serviceWorker.controller : null;
      if (!sw || !window.MessageChannel) { ok(''); return; }
      const canal = new MessageChannel();
      const t = setTimeout(function () { ok(''); }, 1500);
      canal.port1.onmessage = function (e) {
        clearTimeout(t);
        const v = (e.data || {}).version || '';
        /* A mano, para que cualquier informe de fallo diga con qué versión se
           sacó: si no, no hay forma de saber si lo que se está mirando es lo
           recién desplegado o lo de ayer guardado en caché. */
        if (v) g.APP_VERSION = v.replace('trainingfr-', '');
        ok(v);
      };
      try { sw.postMessage({ tipo: 'version' }, [canal.port2]); }
      catch (e) { clearTimeout(t); ok(''); }
    });
  }

  /* Recordatorios que tocaban y aún no has visto */
  function pintarAvisos() {
    const host = document.getElementById('avisos');
    if (!host) return;
    const p = Alertas.pendientes();
    if (!p.length) { host.innerHTML = ''; return; }

    host.innerHTML = p.slice(0, 2).map(function (x) {
      const t = Alertas.TIPOS[x.alerta.tipo] || Alertas.TIPOS.libre;
      return html`<div class="aviso">
        <span class="row-icon">${raw(icon(t.icono))}</span>
        <div class="grow">
          <!-- El título y el mensaje se guardan en castellano, que es la clave;
               se traducen aquí, al pintarlos, como en el resto de la app. -->
          <div style="font-weight:600;font-size:.95rem">${Alertas.traduce(x.titulo)}</div>
          <div class="tiny">${x.hora}${raw(x.mensaje
            ? ' · ' + esc(Alertas.traduce(x.mensaje)) : '')}</div>
        </div>
        <button class="btn sm" data-visto="${x.alerta.id}"
                data-hora="${x.hora}">${T('Vale')}</button>
      </div>`;
    }).join('');

    host.querySelectorAll('[data-visto]').forEach(function (b) {
      b.onclick = function () {
        Alertas.marcarLanzada(b.dataset.visto, b.dataset.hora);
        pintarAvisos();
      };
    });
  }

  /* ================= utilidades ================= */

  function bind(root, sel, fn) {
    const el = root.querySelector(sel);
    if (el) el.onclick = function () { fn(el); };
  }
  function bindAll(root, sel, fn) {
    root.querySelectorAll(sel).forEach(function (el) {
      el.onclick = function (e) { e.stopPropagation(); fn(el); };
    });
  }

  /* Tema: claro, oscuro o el del sistema operativo */
  const consultaSistema = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function temaEfectivo() {
    const t = Store.settings().theme;
    if (t === 'auto') return consultaSistema && consultaSistema.matches ? 'light' : 'dark';
    return t === 'light' ? 'light' : 'dark';
  }

  function aplicarTema() {
    const t = temaEfectivo();
    document.documentElement.dataset.theme = t;
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.content = t === 'light' ? '#f4f6fa' : '#0f1115';
  }

  if (consultaSistema && consultaSistema.addEventListener) {
    consultaSistema.addEventListener('change', function () {
      if (Store.settings().theme === 'auto') { aplicarTema(); render(); }
    });
  }

  /* Botón de la barra superior para alternar claro / oscuro de un toque */
  let temaPintado = null;

  function temaChip() {
    const claro = temaEfectivo() === 'light';
    /* Igual que el del sitio: el icono solo gira cuando el tema cambia de
       verdad. La cabecera se repinta en cada pantalla, y un sol dando vueltas
       cada vez que se toca una pestaña es un tic, no una animación. */
    const gira = temaPintado !== null && temaPintado !== claro;
    temaPintado = claro;

    return html`<button class="btn icon tema-chip${raw(gira ? ' gira' : '')}" data-a="tema"
      aria-label="${claro ? T('Cambiar a modo oscuro') : T('Cambiar a modo claro')}">
      ${raw(icon(claro ? 'luna' : 'sol'))}</button>`;
  }

  /* El de al lado: ES / EN de un toque, sin entrar en Ajustes.

     Dice el idioma al que LLEVA, no el que tienes puesto, igual que el del
     tema enseña la luna cuando estás en claro. Los dos son botones, y un botón
     dice lo que va a pasar al pulsarlo, no dónde estás. */
  function idiomaChip() {
    const otro = Idioma.actual() === 'es' ? 'en' : 'es';
    const d = Idioma.datos(otro);
    return html`<button class="btn icon tema-chip idioma-chip" data-a="idioma"
      aria-label="${Tn('Ver la app en {idioma}', { idioma: d.suyo })}">
      <span>${d.corto}</span></button>`;
  }

  /* Hoja de técnica que se abre durante el entrenamiento: lo esencial para
     corregir la ejecución sin salir de la serie. */
  function exerciseSheet(ex) {
    const guia = Tecnica.para(ex);

    UI.modal(html`
      <h2 style="margin-bottom:2px">${ex.nameEs}</h2>
      <div class="tiny" style="margin-bottom:12px">${ex.primaryMuscles.map(I18N.muscle).join(', ')}</div>
      ${raw(UI.demoHTML(ex, { speed: 800, fases: Data.frames(ex).length > 1 ? fases() : null }))}

      ${raw(guia ? html`
        <div class="guia-h" style="margin:16px 0 10px">${raw(icon('grafica'))} El recorrido</div>
        ${raw(guia.recorrido.map(function (f) {
          return '<div class="fase-txt"><b>' + esc(f.fase) + '</b><p>' + esc(f.texto) + '</p></div>';
        }).join(''))}

        <div class="card destacado-clave" style="margin-top:14px">
          <div class="guia-h" style="margin-bottom:7px">${raw(icon('chispa'))} La clave</div>
          <p style="margin:0">${guia.clave}</p>
        </div>

        <div class="guia-h" style="margin:16px 0 10px">${raw(icon('close'))} Vigila esto</div>
        ${raw(guia.errores.slice(0, 3).map(function (e) {
          return '<div class="error-item"><b>' + esc(e.fallo) + '</b><p>' + esc(e.arreglo) + '</p></div>';
        }).join(''))}

        <div class="guia-dato" style="margin-top:12px">
          <span class="row-icon">${raw(icon('reloj'))}</span>
          <div><b>Ritmo</b><p>${guia.tempo}</p></div>
        </div>`
      : html`
        <ol class="instr" id="hoja-instr" style="margin-top:14px">
          ${raw(pasosDe(ex).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join(''))}
        </ol>`)}

      <div class="row" style="margin-top:16px">
        <button class="btn grow" data-x="ficha">Ver ficha completa</button>
        <button class="btn primary grow" data-x="cerrar">Seguir</button>
      </div>`,
      function (el) {
        UI.mountDemos(el);
        /* Aquí también: es la pantalla que se abre a mitad de serie y enseñaba el
           inglés del catálogo tal cual. */
        asegurarTraduccion(ex).then(function (pasos) {
          const lista = el.querySelector('#hoja-instr');
          if (pasos && lista) {
            lista.innerHTML = pasos.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
          }
        });
        el.querySelector('[data-x=cerrar]').onclick = UI.closeModal;
        el.querySelector('[data-x=ficha]').onclick = function () {
          UI.closeModal();
          go('ejercicio', ex.id);
        };
      });
  }

  /* ================= arranque ================= */

  function fallo(msg) {
    document.getElementById('splash-msg').innerHTML =
      esc(msg) + '<br><br><button class="btn sm" onclick="location.reload()">Reintentar</button>';
    document.querySelector('.spinner').style.display = 'none';
  }

  const arranque = Date.now();

  function init() {
    aplicarTema();
    planState.gear = Store.settings().gear || 'gym';

    document.querySelectorAll('[data-nav]').forEach(function (el) {
      el.onclick = function () { go(el.dataset.nav); };
    });

    /* ---------- dónde estabas en cada pantalla ----------
       render() no tocaba el scroll: al abrir una rutina aterrizabas a media
       página, y al volver atrás con el gesto tampoco recuperabas el sitio, así
       que parecía que te devolvía al principio. Se guarda la posición de la
       pantalla que dejas y se repone al volver a ella; una pantalla nueva
       empieza arriba, que es lo que se espera. */
    const posiciones = {};
    let hashPrevio = location.hash;
    let pendiente = 0;

    window.addEventListener('scroll', function () {
      if (pendiente) return;
      pendiente = requestAnimationFrame(function () {
        pendiente = 0;
        posiciones[hashPrevio] = window.scrollY;
      });
    }, { passive: true });

    /* Al volver atrás la página cambiaba debajo y la hoja abierta se quedaba
       flotando encima. Cualquier navegación la cierra. */
    window.addEventListener('hashchange', function () {
      UI.closeModal();
      render();
      const donde = posiciones[location.hash];
      hashPrevio = location.hash;
      window.scrollTo(0, donde || 0);
    });
    window.addEventListener('popstate', function () { UI.closeModal(); });

    /* Si venimos del enlace del correo o de autorizar Spotify, se resuelve antes
       de pintar. Spotify va primero: los dos vuelven con ?code= en la URL y el
       primero que la lea se la lleva. */
    const spotify = Spotify.configurado()
      ? Spotify.capturarRedireccion().catch(function () { return { ok: false }; })
      : Promise.resolve({ ok: false });

    const entrando = Sync.configurado()
      ? Sync.capturarRedireccion().catch(function () { return false; })
      : Promise.resolve(false);

    Promise.all([Data.load(), entrando, spotify]).then(function (res) {
      const reciénEntrado = res[1];
      const sp = res[2] || {};
      const splash = document.getElementById('splash');
      splash.classList.add('hide');
      setTimeout(function () { splash.remove(); }, 400);
      if (!location.hash) location.hash = '#/inicio';
      normalizarNombres();
      /* Se pregunta al servidor si esta cuenta administra. De ello depende
         que se enseñe la pantalla de cuentas y la configuración de la base de
         datos, y hace falta saberlo en cualquier pantalla, no solo en Perfil. */
      if (g.Admin) Admin.comprobar().then(function (si) { if (si) render(); });
      render();
      /* El aviso de instalar decide solo si toca y cuándo; aquí solo se le
         dice que la app ya está en pie. */
      if (g.Instalar) Instalar.arrancar();
      rellenarMusculosDeActividades();

      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        /* Al desplegar, el service worker nuevo se instala y toma el control,
           pero la página ya está corriendo con los archivos viejos: hasta que
           no se recarga, la app sigue en la versión anterior. Sin avisar, uno
           cierra y abre y sigue viendo el mismo fallo sin entender por qué. */
        const yaControlaba = !!navigator.serviceWorker.controller;
        let yaAvisado = false;

        /* Se recarga sola, pero primero se ve. Un aviso que aparece y se va con
           la recarga es un aviso que nadie ha leído: por eso el cartel se pinta
           antes y la recarga espera a que dé tiempo a leerlo, y al volver la app
           dice en qué versión se ha quedado. Con un entrenamiento en marcha o
           una hoja abierta no se toca nada y queda el botón. */
        const hayVersionNueva = function () {
          /* En la primera visita también se instala un service worker, y eso no
             es una versión nueva de nada: sin esta línea la app se recargaba
             sola nada más abrirla por primera vez. */
          if (!yaControlaba || yaAvisado) return;
          yaAvisado = true;

          const volviendoDeFuera = /(?:code|state|access_token|error)=/
            .test(location.search + location.hash);
          const ocupado = Workout.isActive() ||
            !document.getElementById('modal').hidden ||
            location.hash.indexOf('entrenar') !== -1 ||
            volviendoDeFuera;

          avisarVersionNueva(!ocupado);
          if (ocupado) return;
          try { sessionStorage.setItem('trainingfr.actualizada', '1'); } catch (e) { /* da igual */ }
          setTimeout(function () { location.reload(); }, 3500);
        };

        navigator.serviceWorker.addEventListener('controllerchange', function () {
          if (!yaControlaba) return;
          hayVersionNueva();
        });

        /* Si la vez anterior nos recargamos por una versión nueva, se dice cuál
           es. Es la única prueba visible de que la actualización ha entrado. */
        let veniaDeActualizar = false;
        try {
          veniaDeActualizar = !!sessionStorage.getItem('trainingfr.actualizada');
          if (veniaDeActualizar) sessionStorage.removeItem('trainingfr.actualizada');
        } catch (e) { /* modo privado */ }
        if (veniaDeActualizar) {
          versionDelSW().then(function (v) {
            UI.toast(T('Ya estás en la versión nueva') +
              (v ? ' (' + v.replace('trainingfr-', '') + ')' : '') + '.');
          });
        }

        /* Se pregunta una vez al arrancar para tener la versión a mano: el
           diagnóstico de Spotify la imprime, y sin eso no hay forma de saber si
           lo que se está mirando es la versión recién desplegada o una guardada. */
        versionDelSW();

        navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
          .then(function (reg) {
            if (!reg) return;

            /* controllerchange no siempre llega. Si el service worker nuevo se
               queda en cola —pasa con otra pestaña abierta— nadie se enteraba de
               que había versión nueva: la app seguía con los archivos viejos y el
               aviso no salía nunca. Escuchando la instalación sale igual, y al
               que espera se le manda pasar. */
            const vigilar = function (sw) {
              if (!sw) return;
              sw.addEventListener('statechange', function () {
                if (sw.state === 'installed' && navigator.serviceWorker.controller) {
                  hayVersionNueva();
                }
              });
            };
            if (reg.waiting && navigator.serviceWorker.controller) {
              try { reg.waiting.postMessage({ tipo: 'saltar' }); } catch (e) { /* sigue igual */ }
              hayVersionNueva();
            }
            vigilar(reg.installing);
            reg.addEventListener('updatefound', function () { vigilar(reg.installing); });

            /* Sin esto el aviso no llegaba a salir: el navegador servía el propio
               sw.js desde su caché y, en una app instalada que puede pasar días
               abierta, no volvía a mirar si había algo nuevo. Se pregunta al
               arrancar, al volver a la app y de tanto en tanto. */
            let ultimaMirada = 0;
            const mirar = function () {
              if (Date.now() - ultimaMirada < 60000) return;
              ultimaMirada = Date.now();
              reg.update().catch(function () { /* sin conexión, ya se verá */ });
            };
            mirar();
            document.addEventListener('visibilitychange', function () {
              if (!document.hidden) mirar();
            });
            window.addEventListener('focus', mirar);
            setInterval(mirar, 900000);
          })
          .catch(function () { /* opcional */ });
      }

      if (reciénEntrado && reciénEntrado.ok) trasEntrar(reciénEntrado);
      else if (reciénEntrado && reciénEntrado.error) {
        go('cuenta');
        setTimeout(function () { UI.toast(reciénEntrado.error); }, 500);
      }


      if (sp.ok) {
        /* vuelve a donde estaba, que es Música: aterrizar en la portada parece
           que no ha pasado nada */
        if (sp.volver && location.hash !== sp.volver) location.hash = sp.volver;
        UI.toast(T('Spotify conectado. Ya puedes activar el reproductor.'));
      } else if (sp.error) {
        /* el detalle queda escrito en la pantalla de Música, que un aviso corto
           no da tiempo a leerlo */
        if (sp.volver && location.hash !== sp.volver) location.hash = sp.volver;
        else go('musica');
        setTimeout(function () { UI.toast(sp.error); }, 400);
      }

      /* recordatorios: revisan cada minuto mientras la app esté abierta */
      Alertas.arrancar(function () { pintarAvisos(); });
      pintarAvisos();

      /* metas recién cumplidas */
      const logradas = Objetivos.revisar();
      if (logradas.length) {
        setTimeout(function () {
          UI.toast(Tn('Objetivo cumplido: {que}',
            { que: Objetivos.etiqueta(logradas[0]) }));
          Alertas.avisar(T('Objetivo cumplido'), Objetivos.etiqueta(logradas[0]));
        }, 1200);
      }

      /* Sincronización automática: al abrir, al volver al primer plano, cada
         minuto y medio mientras esté abierta, y al recuperar la conexión. Lo
         que se cambie aquí se sube solo, y si falla se reintenta sin pedir nada. */
      Sync.alCambiarEstado(pintarEstadoSync);
      Sync.arrancarAuto(function () {
        aplicarTema();
        render();
        UI.toast(T('Actualizado desde otro dispositivo'));
      });

      /* en segundo plano se guardan las imágenes de lo que ya tienes planificado */
      setTimeout(function () { Offline.precargarRutinas(); }, 2500);

      /* Y lo que se apuntó sin cobertura se afina en cuanto la haya. Aquí y no
         en el propio módulo: arranca cuando la app ya tiene catálogo y perfil,
         que son de los que salen el peso y los músculos con los que recalcula. */
      if (g.Pendientes) Pendientes.enMarcha();

      /* Y se apunta que hoy se abrió la app, para la pantalla de cuentas. Va en
         segundo plano y sin avisar de nada: es un apunte para quien administra,
         no algo que el usuario haya pedido. */
      setTimeout(function () {
        if (g.Sync && Sync.marcarVisto) Sync.marcarVisto();
      }, 4000);
    }).catch(function (err) {
      console.error(err);
      fallo(T('No se pudo descargar el catálogo de ejercicios. Comprueba tu conexión.'));
    });
  }

  g.App = {
    /* Expuesta para poder comprobarla desde fuera: que salga la foto correcta
       en cada rutina es de las cosas que hay que mirar una por una. */
    fotoDeRutina: fotoDeRutina,
    go: go, irYHacer: irYHacer, render: render, exerciseSheet: exerciseSheet, pickExercise: pickExerciseSheet,
    bind: bind, bindAll: bindAll, aplicarTema: aplicarTema,
    lugarSheet: lugarSheet, cuantosEn: cuantosEn, CARAS_LUGAR: CARAS_LUGAR,
    abandonados: abandonados,
    estadoVersion: estadoVersion, versionSabida: versionSabida,
    temaEfectivo: temaEfectivo,
    /* La ficha del ejercicio ya sabía pintar los recambios y la guía de
       técnica; el entrenamiento las necesita igual y no tiene sentido tener
       dos versiones que se separen con el tiempo. */
    alternativasHTML: alternativasHTML, guiaHTML: guiaHTML,
    /* el nombre del plan sin el día delante, que la pantalla de Programa
       necesita para agrupar igual que la de Rutinas */
    nombreRutina: nombreRutina, tituloRutina: tituloRutina,
    /* La tabla de actividades y el lector de lo escrito viven aquí, y la hoja
       de «¿qué estás haciendo?» del entrenamiento hace la misma pregunta. Sin
       esto tenía su propia respuesta —met 4 y ningún músculo— y un partido
       apuntado desde allí no llegaba a Pierna. */
    /* La hoja de «apuntar algo que ya hice», para que el «Ya lo hice» del
       entrenamiento abra esta misma y no una versión suya más pobre. */
    apuntarActividad: apuntarActividad,
    actividadDe: function (texto) {
      const id = actividadDelTexto(texto || '');
      const a = ACTIVIDADES.filter(function (x) { return x.id === id; })[0];
      return a ? { id: a.id, label: a.label, met: a.met,
        musculos: (a.musculos || []).slice() } : null;
    },
    cuandoYCuanto: cuandoYCuantoDelTexto,
    /* compartir.js pinta según el trozo de hash que trae el plan dentro */
    ruta: function () { return route; },
    planActivo: planActivo, marcarPlanActivo: marcarPlanActivo,
    rutinasDeHoy: rutinasDeHoy,
    /* Abrir una rutina y lanzarle la auditoría: lo pide la pantalla que trae
       rutinas de fuera, que es justo donde más falta hace pasarlas por el
       entrenador —no las ha montado la app y nadie las ha mirado. */
    auditarRutina: auditarDesdeLista,
    /* La fila que se desliza y las cajas de plan las estrenaron las rutinas,
       pero el gesto no es de las rutinas: es el de la app. Los menús de comida
       lo usan igual, y reescribirlo alli seria tener dos que se separan. */
    deslizable: deslizable
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
