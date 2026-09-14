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

  function render() {
    UI.clearDemos();
    route = parseHash();

    const views = {
      inicio: viewInicio, ejercicios: viewEjercicios, ejercicio: viewEjercicio,
      rutinas: viewRutinas, rutina: viewRutina, entrenar: viewEntrenar,
      ajustes: viewAjustes, plan: viewPlan,
      bienvenida: viewBienvenida, cuenta: viewCuenta
    };
    Object.assign(views, g.VISTAS || {});

    /* Enlace de configuración traído desde otro dispositivo */
    if (route.name === 'enlazar' && route.arg) {
      const ok = Sync.aplicarEnlace(route.arg);
      history.replaceState(null, '', location.pathname + '#/ajustes');
      route = { name: ok ? 'ajustes' : 'inicio', arg: null };
      setTimeout(function () {
        UI.toast(ok ? 'Dispositivo enlazado. Entra con tu correo.'
          : 'Ese enlace de configuración no es válido.');
      }, 400);
    }

    /* Lo primero de todo es saber dónde entrena: sin eso no se puede filtrar nada */
    if (!Store.settings().gear && route.name !== 'bienvenida' && route.name !== 'ver') {
      route = { name: 'bienvenida', arg: null };
    }
    const fn = views[route.name] || viewInicio;

    actionsEl.innerHTML = route.name === 'bienvenida' ? temaChip() : lugarChip() + temaChip();

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

    document.querySelectorAll('.tabbar').forEach(function (t) {
      t.hidden = route.name === 'bienvenida' ||
        (route.name === 'ver' && !Store.settings().gear);
    });

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

  function lugarChip() {
    const gset = Data.GEAR[Store.settings().gear];
    if (!gset) return '';
    return html`<button class="chip" data-a="lugar">${raw(icon('dumbbell'))} ${gset.label}</button>`;
  }

  function tarjetasLugar(actual) {
    /* «Ver todo» y «En el gimnasio» dan el mismo número, y eso desconcierta con
       razón: parece que uno de los dos miente. No miente ninguno —el gimnasio
       permite los doce materiales que existen en el catálogo, así que quitar el
       filtro no puede añadir nada— pero repetir la cifra como si fuera
       información distinta es lo que confunde. Se dice. */
    const enGym = cuantosEn('gym');

    return Object.keys(Data.GEAR).map(function (k) {
      const gset = Data.GEAR[k];
      const cuantos = cuantosEn(k);
      const igualQueGym = k === 'todo' && cuantos === enGym;

      return html`
        <button class="rt-item" data-lugar="${k}" style="width:100%;text-align:left;padding:13px;
                ${actual === k ? 'border-color:var(--acc);background:var(--acc-d)' : ''}">
          <div class="grow">
            <div style="font-weight:700;font-size:.95rem">${gset.label}</div>
            <div class="tiny">${gset.note}</div>
            <div class="tiny" style="color:var(--acc);margin-top:2px">
              ${UI.num(cuantos)} ejercicios disponibles</div>
            ${raw(igualQueGym ? '<div class="tiny" style="margin-top:3px;white-space:normal">' +
              'Los mismos que en el gimnasio: el catálogo no tiene nada que el gimnasio ' +
              'no permita.</div>' : '')}
          </div>
          ${raw(actual === k ? '<span class="chip solid">Actual</span>' : '')}
        </button>`;
    }).join('');
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
        UI.toast('Listo. Puedes crear la cuenta cuando quieras desde Perfil.');
      });
    });
  };

  function lugarSheet() {
    UI.modal(html`
      <h2>¿Dónde entrenas?</h2>
      <p class="muted">Cambia el sitio y el catálogo se ajusta al momento.</p>
      <div class="stack">${raw(tarjetasLugar(Store.settings().gear))}</div>`,
      function (el) {
        el.querySelectorAll('[data-lugar]').forEach(function (b) {
          b.onclick = function () {
            Store.setSetting('gear', b.dataset.lugar);
            planState.gear = b.dataset.lugar;
            UI.closeModal();
            render();
            UI.toast(b.dataset.lugar === 'todo'
              ? 'Mostrando el catálogo completo'
              : 'Ahora entrenas ' + Data.gearFrase(b.dataset.lugar));
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
      return '<div class="' + clases.join(' ') + '">' +
        '<span>' + (esHoy ? 'Hoy' : d.charAt(0)) + '</span>' +
        '<b>' + fecha.getDate() + '</b><i></i></div>';
    }).join('');

    const frase = previstos
      ? cumplidos + ' de ' + previstos + ' días del plan' +
        (sueltos ? ' y ' + sueltos + ' suelto' + (sueltos > 1 ? 's' : '') : '')
      : (cumplidos + sueltos) + ' días entrenados';

    return html`
      <div class="muelle"></div>
      <div class="card inicio-compacta semana-caja portada-titulo tarjeta-premium"
           data-a="verprogreso" role="button" tabindex="0">
        <div class="row between" style="margin-bottom:6px">
          <span class="pre-encima">Tu semana</span>
          <span class="tiny nowrap">${frase}</span>
        </div>
        <div class="semana">${raw(celdas)}</div>
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
      <div class="list-title portada-titulo">Lo que llevas comido</div>
      <div class="card inicio-compacta comida-caja tarjeta-premium">
        <div class="row" style="gap:16px;align-items:flex-start">
          <div class="grow">
            <div class="pre-encima">${raw(icon('llama'))}Calorías</div>
            <div><b class="pre-num">${UI.num(h.kcal)}</b>
              <span class="tiny"> / ${UI.num(m.kcal)}</span></div>
            <div class="prog" style="margin-top:5px"><i style="width:${pk}%"></i></div>
          </div>
          <div class="grow">
            <div class="pre-encima prot">${raw(icon('proteina'))}Proteína</div>
            <div><b class="pre-num" style="color:var(--brand-1)">${h.prot}</b>
              <span class="tiny"> / ${m.prot} g</span></div>
            <div class="prog" style="margin-top:5px">
              <i style="width:${pp}%;background:var(--brand-1)"></i></div>
          </div>
        </div>
        <p class="tiny" style="margin:4px 0 0">${h.kcal === 0
          ? 'Hoy no has apuntado nada. Una foto del plato basta.'
          : faltaProt > 0 ? 'Te faltan ' + faltaProt + ' g de proteína para el objetivo del día.'
          : 'Proteína del día cubierta.'}</p>

        <div class="row" style="margin-top:5px">
          <label class="btn primary grow sm" for="foto-inicio" style="cursor:pointer">
            ${raw(icon('camara'))} Foto</label>
          <button class="btn grow sm" data-a="comidamano">${raw(icon('plus'))} A mano</button>
        </div>

        <input type="file" id="foto-inicio" accept="image/*" capture="environment" hidden>

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
    if (!g.VISTAS || !VISTAS.menuDeHoy) return '';
    const menu = VISTAS.menuDeHoy();
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
          <span class="grow">Menú de hoy</span>
          <span class="tiny nowrap">${toca
            ? 'Ahora: ' + (toca.nombre || 'comer') : UI.num(kcal) + ' kcal'}</span>
        </summary>
        <div class="fino-cuerpo">
          ${raw(comidas.map(function (c) {
            const esAhora = c === toca;
            return '<div class="menu-fila' + (esAhora ? ' ahora' : '') + '">' +
              '<div class="row between" style="gap:10px">' +
              '<b style="font-size:.86rem">' + esc(c.nombre || 'Comida') +
              (c.hora ? ' <span class="tiny">' + esc(c.hora) + '</span>' : '') + '</b>' +
              '<span class="tiny nowrap">' + UI.num(c.kcal || 0) + ' kcal · ' +
              (c.prot || 0) + ' g</span></div>' +
              '<p style="margin:2px 0 0;font-size:.85rem">' + esc(c.plato || '') + '</p>' +
              '</div>';
          }).join(''))}
          <button class="btn sm block" data-a="irnutricion" style="margin-top:9px">
            Ver la semana entera</button>
        </div>
      </details>`;
  }

  /* Cómo llamar en un botón a lo que toca hoy: la zona que más se trabaja,
     que es como uno lo tiene en la cabeza («hoy toca pecho»). */
  function queEsHoy(deHoy) {
    if (deHoy.length !== 1) return 'lo de hoy';
    const r = deHoy[0];
    if (r.mixta) return 'lo de hoy';
    const zona = zonaDeRutina(r);
    return zona ? zona.label.toLowerCase() : 'lo de hoy';
  }

  function viewInicio() {
    const st = Store.stats();
    const rutinas = Store.routines();
    const activa = Store.active();
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const deHoy = rutinasDeHoy();
    const nombre = Store.settings().name;
    const olvido = abandonados();
    const peso = Perfil.tendencia(30);

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
                    aria-label="Cerrar">${raw(icon('close'))}</button>
          </div>
        </div>`
      : html`
        <div class="hola entra">Hola${raw(nombre
          ? ', <span class="nombre">' + esc(nombre) + '</span>' : '')}</div>
        <p class="muted entra entra-2 hola-sub" style="font-size:.92rem">${st.week === 0
          ? 'Semana en blanco. Buen momento para empezar.'
          : st.week === 1 ? 'Llevas 1 entrenamiento esta semana. Sigue así.'
          : 'Llevas ' + st.week + ' entrenamientos esta semana. Muy bien.'}</p>`)}

      <div class="muelle"></div>
      ${raw(activa ? html`
        <div class="card" style="border-color:var(--acc);background:var(--acc-d)">
          <div class="row between">
            <div class="grow">
              <div class="tiny" style="color:var(--acc)">ENTRENAMIENTO EN CURSO</div>
              <h3 style="margin:2px 0 0">${activa.routineName}</h3>
            </div>
            <button class="btn primary" data-a="resume">Continuar</button>
          </div>
        </div>`
      : deHoy.length ? html`
        <button class="btn primary block grande portada-hueco btn-arranque" data-a="entrenarhoy">
          ${raw(icon('play'))} Entrenar ${queEsHoy(deHoy)}
        </button>
        ${raw(deHoy.length === 1 ? ''
        : '<p class="tiny" style="margin:7px 0 0">Tienes ' + deHoy.length +
          ' rutinas para hoy: te dejo elegir.</p>')}
        <button class="enlace-flojo" data-a="empezarlibre">
          O un entrenamiento libre</button>`
      : html`
        <button class="btn primary block grande portada-hueco btn-arranque" data-a="empezarlibre">
          ${raw(icon('play'))} Iniciar entrenamiento
        </button>
        <p class="tiny" style="margin:7px 0 0">Arranca el cronómetro ahora y añade los
        ejercicios sobre la marcha. El tiempo se ve desde cualquier pantalla.</p>`)}

      <div class="muelle"></div>
      <div class="stats portada-hueco">
        <div class="stat"><b>${st.streak}</b><span>Días seguidos</span></div>
        <div class="stat"><b>${st.total}</b><span>Entrenos</span></div>
        <div class="stat"><b>${UI.num(Store.settings().registro !== 'detallado' || st.totalVolume === 0
          ? st.weekSets : st.weekVolume)}</b><span>${Store.settings().registro !== 'detallado' ||
          st.totalVolume === 0 ? 'Series semana' : 'Volumen semana'}</span></div>
      </div>

      ${raw(Modo.franjaInvitado())}

      <div class="muelle"></div>
      <div class="list-head portada-titulo">
        <span class="list-title" style="margin:0">Hoy, ${UI.diaLargo(hoy).toLowerCase()}</span>
        <button class="btn sm primary" data-a="verdia">${raw(icon('lista'))} Ver el día entero</button>
      </div>
      ${raw(deHoy.length
        ? '<div class="stack">' + deHoy.map(function (r) {
            return routineCard(r, 0, 0, false, 'inicio');
          }).join('') + '</div>'
        : html`
          <!-- El día sin nada que hacer merece la misma tarjeta que el día con
               algo: era la única caja lisa de la portada, y es la que ve quien
               acaba de entrar en la app. -->
          <div class="card tarjeta-premium tarjeta-libre">
            <div class="hoy-encima">Hoy · ${rutinas.length ? 'Día libre' : 'Empieza aquí'}</div>
            <div class="hoy-tit">${rutinas.length
              ? 'No toca nada en tu plan'
              : 'Todavía no tienes rutinas'}</div>
            <p class="hoy-meta">${rutinas.length
              ? 'Si has hecho algo por tu cuenta, apúntalo. Y si te apetece entrenar, elige una rutina.'
              : 'Copia una plantilla probada y edítala a tu gusto, o móntate el programa con tus datos.'}</p>
            <div class="row" style="margin-top:12px">
              ${raw(rutinas.length
                ? '<button class="btn grow sm" data-a="apuntar">Apuntar algo</button>' +
                  '<button class="btn primary grow sm" data-a="plantillas">Elegir rutina</button>'
                : '<button class="btn grow sm" data-a="plantillas">Ver plantillas</button>' +
                  '<button class="btn primary grow sm" data-a="programa">Crear mi programa</button>')}
            </div>
          </div>`)}

      ${raw(semanaHTML())}
      ${raw(comidaHoyHTML())}

      ${raw(olvido.length ? '<div class="muelle"></div>' +
        seccionPlegable('olvido', 'Lo que llevas abandonado',
        olvido.length, '', html`
        <div class="card inicio-compacta">
          <div class="stack" style="gap:7px">
            ${raw(olvido.map(function (f) {
              return '<div class="row between"><span style="font-size:.9rem">' +
                esc(I18N.muscle(f.m)) + '</span><span class="tiny">' +
                (f.dias === null ? 'nunca' : 'hace ' + f.dias + ' días') + '</span></div>';
            }).join(''))}
          </div>
          <p class="tiny" style="margin:11px 0 0">Un músculo que no se toca en más de una semana
          se estanca. Toca la zona en Ejercicios y te monto la sesión.</p>
          <button class="btn sm block" data-a="programa" style="margin-top:9px">
            Rehacer mi programa con esto en cuenta</button>
        </div>`) : '')}

      <div class="pie-version" id="pie-version"></div>

      ${raw(peso ? html`
        <div class="list-title">Tu peso</div>
        <div class="card row between">
          <div class="grow">
            <div style="font-weight:700;font-size:1.05rem">${peso.dif >= 0 ? '+' : ''}${peso.dif.toFixed(1)} kg</div>
            <div class="tiny">en los últimos 30 días, con ${peso.n} pesajes</div>
          </div>
          <button class="btn sm" data-a="irperfil">Apuntar peso</button>
        </div>` : '')}`;
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
    return dias.slice(0, -1).join(', ') + ' y ' + dias[dias.length - 1];
  }

  /* Título de la tarjeta: el día y lo que se trabaja, que es lo que uno busca */
  function tituloRutina(r) {
    const zona = zonaDeRutina(r);
    const dias = (r.days || []).map(UI.diaLargo);
    const que = r.mixta ? 'Mixta' : (zona ? zona.label : 'Sin ejercicios');
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

  function nombreRutina(r) {
    const n = String(r.name || '').trim();
    if (!n) return 'Rutina sin nombre';
    const corte = n.indexOf(' · ');
    if (corte === -1) return n;

    const cabeza = n.slice(0, corte);
    const resto = n.slice(corte + 3).trim();
    if (!resto) return n;

    const soloDias = cabeza.split(/\s+y\s+/).every(function (t) {
      const x = I18N.norm(t);
      return UI.DAY_NAMES.some(function (d) {
        return I18N.norm(d) === x || I18N.norm(UI.diaLargo(d)) === x;
      });
    });
    return soloDias ? resto : n;
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
  function filaSiNo(ico, titulo, sub, clave, activo) {
    const boton = function (valor, texto) {
      const puesto = (valor === 'si') === !!activo;
      return '<button class="btn sm' + (puesto ? ' primary' : '') + '" data-sino="' +
        clave + '" data-val="' + valor + '">' + esc(texto) + '</button>';
    };
    return '<div class="list-row">' +
      '<span class="row-icon">' + icon(ico) + '</span>' +
      '<div class="grow"><div class="list-row-title">' + esc(titulo) + '</div>' +
      '<div class="list-row-sub">' + esc(sub) + '</div></div>' +
      '<div class="row sino" style="gap:6px">' + boton('si', 'Sí') + boton('no', 'No') +
      '</div></div>';
  }

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
      <div class="list-title">Hoy es ${UI.diaLargo(hoy).toLowerCase()}, y esto es lo que toca</div>
      <div class="stack">${raw(deHoy.map(function (r) {
        return routineCard(r, 0, 0, false, 'dia');
      }).join(''))}</div>`
      : html`
      <div class="list-title">Hoy es ${UI.diaLargo(hoy).toLowerCase()}</div>
      <p class="tiny" style="margin:-4px 0 4px">${raw(activo
        ? 'Tu plan principal —' + esc(activo) + '— no tiene nada para hoy. Otros planes ' +
          'sí: ábrelos abajo y entrena de ellos, o cambia de plan principal.'
        : 'No tienes nada asignado a hoy. Abre un plan y toca los días de una rutina para ' +
          'moverla aquí.')}</p>`;

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
              ${raw(k === activo ? '<span class="chip tiny-chip plan-marca">EN CURSO</span>' : '')}
              ${raw(dias.indexOf(hoy) !== -1 ? '<span class="chip solid tiny-chip">HOY</span>' : '')}</div>
            <!-- En una linea: los seis dias de un plan completo se iban a dos
                 renglones y el cajon crecia veinte pixeles por nada. -->
            <div class="tiny plan-meta">${suyas.length}
              ${suyas.length === 1 ? 'rutina' : 'rutinas'} · ${ejercicios} ejercicios
              · ${dias.length ? dias.join(', ') : 'sin día'}</div>
          </div>
          <span class="plegador ${abierto ? 'abierto' : ''}">
            <span class="plegador-txt">${abierto ? 'Ocultar' : 'Ver'}</span>
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
          { icono: 'chispa', texto: 'Analizar' + BAJA + 'con IA', attr: 'data-iaplan="' + esc(k) + '"' },
          { icono: 'copiar', texto: 'Duplicar', attr: 'data-duplicarplan="' + esc(k) + '"' },
          { icono: 'compartir', texto: 'Compartir', attr: 'data-compartirplan="' + esc(k) + '"' },
          { icono: 'trash', texto: 'Borrar', tono: 'malo',
            attr: 'data-borrarplan="' + esc(k) + '"' }
        ], [
          /* Marcar el plan principal estaba solo dentro del plan abierto, o sea
             a dos toques y después de desplegar cinco rutinas. Aquí se hace
             empujando la cabecera a la derecha, sin abrir nada. */
          { icono: k === activo ? 'close' : 'check',
            texto: k === activo ? 'Quitar' + BAJA + 'principal' : 'Marcar' + BAJA + 'principal',
            tono: k === activo ? '' : 'suave',
            attr: 'data-planactivo="' + (k === activo ? '' : esc(k)) + '"' },
          { icono: 'edit', texto: 'Renombrar', tono: 'suave',
            attr: 'data-renombrarplan="' + esc(k) + '"' },
          { icono: 'lista', texto: 'Abrir', tono: 'suave',
            attr: 'data-verplan="' + esc(k) + '"' }
        ]))}
        ${raw(abierto ? '<div class="stack">' +
          suyas.map(function (r) { return routineCard(r, 0, 0, true, 'plan'); }).join('') + '</div>' +
          accionesPlanHTML(k, suyas.length, k === activo) : '')}
        </div>`;
    }).join('');

    return arriba + html`<div class="list-title">Mis planes de entrenamiento</div>` + bloques;
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
            'Dejar de ser el plan principal',
            'Ahora manda este: en \u00abhoy\u00bb solo salen sus rutinas.', ' es-principal')
        : fila('data-planactivo="' + id + '"', 'check', 'var(--tono)',
            'Usar este como plan principal',
            'En \u00abhoy\u00bb solo saldr\u00e1n las suyas. Los dem\u00e1s siguen aqu\u00ed.')) +

      fila('data-iaplan="' + id + '"', 'chispa', '#c06bf0', 'Revisar el plan con IA',
        'Lee los ' + cuantas + ' d\u00edas juntos: el reparto entre m\u00fasculos, lo que se ' +
        'repite y lo que falta.') +

      fila('data-duplicarplan="' + id + '"', 'copiar', '#4f8cf5', 'Duplicar el plan entero',
        'Una copia con sus rutinas, para probar cambios sin tocar este.') +

      fila('data-compartirplan="' + id + '"', 'compartir', '#2fc4b2', 'Compartir el plan',
        'Un enlace con las ' + cuantas + ' rutinas dentro.') +

      fila('data-borrarplan="' + id + '"', 'trash', 'var(--bad)',
        'Borrar el plan entero',
        cuantas + (cuantas === 1 ? ' rutina' : ' rutinas') + '. No se puede deshacer.',
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
      const que = r.mixta ? 'Mixta' : zona ? zona.label : 'Sin ejercicios';
      const encima = (esDeHoy ? 'Hoy · ' : '') + que;

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
          <button class="hoy-play" data-train="${r.id}">
            ${raw(icon('play'))} Entrenar</button>
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
                      aria-label="Subir">${raw(icon('up'))}</button>
              <button class="btn sm" data-baja="${r.id}" ${i === total - 1 ? 'disabled' : ''}
                      aria-label="Bajar">${raw(icon('down'))}</button>
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
                     aria-label="Borrar rutina">${raw(icon('trash'))}</button>`
            : html`<button class="btn primary sm" data-train="${r.id}">
                     ${raw(icon('play'))} Entrenar</button>`)}
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
              <div class="tiny">QUÉ DÍAS LA HAGO</div>
              <div class="row wrap" style="gap:6px;margin-top:6px">
                ${raw(DIAS.map(function (d) {
                  const on = (r.days || []).indexOf(d) !== -1;
                  return '<button class="chip ' + (on ? 'on' : '') + '" data-rdia="' + d +
                    '" data-rid="' + r.id + '">' + d + '</button>';
                }).join(''))}
              </div>
              <p class="tiny" style="margin:6px 0 0">Tócalos para mover la rutina de día. Si
              el viernes quieres pecho en vez de pierna, quita el viernes de una y
              pónselo a la otra.</p>
            </div>
            <div class="row" style="padding:11px 13px 0">
              <button class="btn sm grow" data-open="${r.id}">${raw(icon('edit'))} Editar</button>
              <button class="btn sm primary grow" data-train="${r.id}">
                ${raw(icon('play'))} Entrenar</button>
            </div>
            ${raw(ambito === 'inicio' ? '' : html`
            <div style="padding:8px 13px 13px">
              <button class="btn sm block" data-duplicar="${r.id}">
                ${raw(icon('copiar'))} Duplicar esta rutina</button>
              <button class="btn sm block" data-compartir="${r.id}" style="margin-top:8px">
                ${raw(icon('compartir'))} Compartir esta rutina</button>
              <button class="btn sm block" data-iarutina="${r.id}" style="margin-top:8px">
                ${raw(icon('chispa'))} Revisar esta rutina con IA</button>
            </div>`)}
          </div>`;
    }

    /* En la portada la tarjeta va suelta: ahí no se borra ni se duplica nada */
    if (!total && !sinPlan) return tarjeta;

    return deslizable(tarjeta, [
      { icono: 'chispa', texto: 'Analizar' + BAJA + 'con IA', attr: 'data-iarutina="' + r.id + '"' },
      { icono: 'copiar', texto: 'Duplicar', attr: 'data-duplicar="' + r.id + '"' },
      { icono: 'compartir', texto: 'Compartir', attr: 'data-compartir="' + r.id + '"' },
      { icono: 'trash', texto: 'Borrar', tono: 'malo', attr: 'data-borrar="' + r.id + '"' }
    ], [
      { icono: 'edit', texto: 'Renombrar', tono: 'suave',
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
      UI.toast(dias.length ? nombreRutina(r) + ': ' + UI.diasLargos(dias)
        : nombreRutina(r) + ' se queda sin dia');
    });
  }

  viewInicio.mount = function (root) {
    recordarSecciones(root);
    bind(root, '[data-a=cerrarSaludo]', function () { Saludo.descartar(); render(); });
    bind(root, '[data-a=irCuenta]', function () { go('cuenta'); });
    bind(root, '[data-a=resume]', function () { go('entrenar'); });
    bind(root, '[data-a=empezarlibre]', function () {
      Workout.startLibre();
      go('entrenar');
      UI.toast('Cronómetro en marcha');
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
        <h2>¿Cuál de las de hoy?</h2>
        <p class="muted">Tienes ${deHoy.length} rutinas puestas para ${UI.diaLargo(hoy).toLowerCase()}.</p>
        <div class="list">
          ${raw(deHoy.map(function (r) {
            return '<div class="list-row tap" data-elige="' + esc(r.id) + '">' +
              '<div class="grow"><div class="list-row-title">' + esc(tituloRutina(r)) + '</div>' +
              '<div class="list-row-sub">' + r.exercises.length + ' ejercicios</div></div>' +
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

    /* La versión, abajo del todo y sin ruido cuando no hay nada que hacer. Si
       hay una nueva publicada, esta línea es el botón para cogerla: el aviso
       automático depende de que el navegador se digne a mirar, y con la app
       instalada eso puede tardar días. */
    const pie = root.querySelector('#pie-version');
    if (pie) {
      estadoVersion().then(function (v) {
        if (!v || !v.local) { pie.textContent = ''; return; }
        const corto = function (x) { return String(x).replace('trainingfr-', ''); };
        if (v.alDia) {
          pie.innerHTML = 'Training FR ' + esc(corto(v.local)) + ' · al día';
          return;
        }
        pie.className = 'pie-version hay-nueva';
        pie.innerHTML = '<b>Hay una versión nueva: ' + esc(corto(v.servidor)) + '</b>' +
          '<span>Tú tienes la ' + esc(corto(v.local)) + '. Toca para actualizar; ' +
          'tus datos no se tocan.</span>';
        pie.onclick = function () {
          pie.innerHTML = '<b>Actualizando…</b>';
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
    if (!r.exercises.length) { UI.toast('Añade ejercicios a la rutina antes de entrenar'); return; }

    const run = function () { Workout.start(r); go('entrenar'); };

    /* Si venía de un entrenamiento libre, la rutina se suma a lo que ya lleva:
       el cronómetro no se reinicia y no se pierde nada. */
    const activa = Store.active();
    if (activa && activa.libre) {
      Workout.cargar(r);
      go('entrenar');
      UI.toast('«' + (r.name || 'Rutina') + '» añadida al entrenamiento en curso');
      return;
    }

    if (Workout.isActive()) {
      UI.confirm('Ya hay un entrenamiento en curso',
        'Si empiezas otro, se descartará el que tienes a medias.', 'Empezar de nuevo', true)
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
    if (exFilters.favs) fichas.push(['favs', 'Favoritos']);
    if (exFilters.group) {
      const gr = I18N.GROUPS.filter(function (x) { return x.id === exFilters.group; })[0];
      if (gr) fichas.push(['group', gr.label]);
    }
    if (exFilters.muscle) fichas.push(['muscle', I18N.muscle(exFilters.muscle)]);
    if (exFilters.tipo) {
      const t = Data.TIPOS.filter(function (x) { return x.id === exFilters.tipo; })[0];
      if (t) fichas.push(['tipo', t.label]);
    }
    if (exFilters.equipment) fichas.push(['equipment', I18N.EQUIP[exFilters.equipment]]);
    if (exFilters.level) fichas.push(['level', I18N.LEVEL[exFilters.level]]);
    if (!fichas.length) return '';

    return '<div class="pill-scroll" style="margin-bottom:12px">' +
      fichas.map(function (f) {
        return '<button class="chip on" data-quitar="' + f[0] + '">' + esc(f[1]) +
          ' <span style="opacity:.65">\u00d7</span></button>';
      }).join('') +
      (fichas.length > 1
        ? '<button class="chip" data-a="limpiar">Quitar todo</button>' : '') +
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

    const pildora = function (attr, valor, texto, activo) {
      return '<button class="chip ' + (activo ? 'on' : '') + '" data-' + attr + '="' +
        esc(valor) + '">' + esc(texto) + '</button>';
    };

    const tituloGrupo = function (t) {
      return '<div class="tiny filtro-tit">' + t + '</div>';
    };

    UI.modal(html`
      <h2>Filtrar</h2>

      ${raw(tituloGrupo('ZONA DEL CUERPO'))}
      <div class="zona-rejilla">
        ${raw(casillaZona('', 'Todas', todosMusculos))}
        ${raw(I18N.GROUPS.map(function (gr) {
          return casillaZona(gr.id, gr.label, gr.muscles);
        }).join(''))}
      </div>

      ${raw(tituloGrupo('TIPO DE TRABAJO'))}
      <div class="row wrap" style="gap:6px">
        ${raw(pildora('f-tipo', '', 'Todo', !exFilters.tipo))}
        ${raw(Data.TIPOS.map(function (t) {
          return pildora('f-tipo', t.id, t.label, exFilters.tipo === t.id);
        }).join(''))}
      </div>

      <details class="plegable-fino filtro-mas" data-mas="eq">
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="grow">Material</span>
          <span class="tiny nowrap" data-valor="eq"></span>
        </summary>
        <div class="fino-cuerpo">
          <div class="row wrap" style="gap:6px">
            ${raw(pildora('f-eq', '', 'Todo', !exFilters.equipment))}
            ${raw(equipos.map(function (k) {
              return pildora('f-eq', k, I18N.EQUIP[k], exFilters.equipment === k);
            }).join(''))}
          </div>
        </div>
      </details>

      <details class="plegable-fino filtro-mas" data-mas="lv">
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="grow">Nivel</span>
          <span class="tiny nowrap" data-valor="lv"></span>
        </summary>
        <div class="fino-cuerpo">
          <div class="row wrap" style="gap:6px">
            ${raw(pildora('f-lv', '', 'Cualquiera', !exFilters.level))}
            ${raw(Object.keys(I18N.LEVEL).map(function (k) {
              return pildora('f-lv', k, I18N.LEVEL[k], exFilters.level === k);
            }).join(''))}
          </div>
        </div>
      </details>

      <div class="filtro-sw">
        <div class="row between" data-f-favs="1">
          <div class="grow">
            <div class="filtro-sw-t">Solo mis favoritos</div>
            <div class="tiny">Los que has marcado con la estrella</div>
          </div>
          <span class="sw ${exFilters.favs ? 'on' : ''}" data-sw="favs"></span>
        </div>

        ${raw(Store.settings().gear === 'todo' ? '' : html`
        <div class="row between" data-f-todo="1">
          <div class="grow">
            <div class="filtro-sw-t">Solo lo que puedo hacer</div>
            <div class="tiny">Con el material que tienes ${esc(Data.gearFrase(Store.settings().gear))}</div>
          </div>
          <span class="sw ${exFilters.todo ? '' : 'on'}" data-sw="todo"></span>
        </div>`)}
      </div>

      <button class="btn primary block" id="f-ver" style="margin-top:18px"></button>
      <button class="btn ghost block sm" id="f-limpiar" style="margin-top:8px" hidden>
        Quitar los filtros</button>`,
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

          el.querySelector('[data-valor="eq"]').textContent =
            exFilters.equipment ? I18N.EQUIP[exFilters.equipment] : 'Todo';
          el.querySelector('[data-valor="lv"]').textContent =
            exFilters.level ? I18N.LEVEL[exFilters.level] : 'Cualquiera';

          const swFavs = el.querySelector('[data-sw="favs"]');
          if (swFavs) swFavs.classList.toggle('on', !!exFilters.favs);
          const swTodo = el.querySelector('[data-sw="todo"]');
          if (swTodo) swTodo.classList.toggle('on', !exFilters.todo);

          const n = Data.search(loQueSeMira().base).length;
          btnVer.textContent = !n ? 'No hay ninguno así'
            : n === 1 ? 'Ver el ejercicio' : 'Ver ' + UI.num(n) + ' ejercicios';
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
        bindAll(el, '[data-f-tipo]', function (b) { exFilters.tipo = b.dataset.fTipo; refrescar(); });
        bindAll(el, '[data-f-eq]', function (b) { exFilters.equipment = b.dataset.fEq; refrescar(); });
        bindAll(el, '[data-f-lv]', function (b) { exFilters.level = b.dataset.fLv; refrescar(); });

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
            <div class="tiny" style="color:var(--acc)">SESIÓN COMPLETA</div>
            <div style="font-weight:700;margin:2px 0">Entrenar ${region.label.toLowerCase()} hoy</div>
            <div class="tiny">Reparto la sesión entre ${musculosSesion.map(function (m) {
              return I18N.muscle(m).toLowerCase();
            }).join(', ')}</div>
          </div>
          <button class="btn primary sm" data-a="sesionzona">${raw(icon('play'))} Crear</button>
        </div>
      </div>` : '';

    /* Con el sitio en «Ver todo» el catálogo ya está entero: el interruptor sobra */
    const sinFiltro = exFilters.todo || Store.settings().gear === 'todo';

    const puestos = cuantosFiltros();

    return html`
      <div class="row between">
        <h1 style="margin:0">Ejercicios</h1>
        <button class="btn-filtro${puestos ? ' on' : ''}" data-a="filtros">
          ${raw(icon('filtro'))} Filtro${raw(puestos
            ? '<span class="bf-num">' + puestos + '</span>' : '')}
        </button>
      </div>
      <!-- Una línea y de las pequeñas: eran dos renglones de texto grande
           contando lo que se ve solo en cuanto bajas un dedo. -->
      <p class="tiny ej-sub">${UI.num(res.length)} ejercicios · ${raw(sinFiltro
        ? 'catálogo completo' : esc(lugar))}</p>

      <div class="search-wrap" style="margin-bottom:10px">
        ${raw(icon('search'))}
        <input id="ex-q" type="search" placeholder="Buscar: pierna, femoral, peso muerto…"
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
        <p class="tiny" style="margin:-2px 0 12px">No existe ningún catálogo libre de
        pilates, así que estos están escogidos a mano del catálogo por lo que comparten
        con un mat de pilates: control del centro y trabajo de suelo.</p>` : '')}


      ${raw(zonaQ ? html`
        <p class="tiny" style="margin:-2px 0 10px">Has buscado una zona del cuerpo:
        te enseño ${raw(zonaQ.tipo === 'region'
          ? 'todos sus músculos por separado'
          : 'todos los ejercicios de ' + esc(I18N.muscle(musculo).toLowerCase()))}, no solo
        los que llevan esa palabra en el nombre.</p>` : '')}


      ${raw(tarjetaZona)}


      ${raw(segmentar ? secciones.map(function (s) {
        return html`
          <div class="list-head">
            <span class="list-title">${I18N.muscle(s.muscle)}
              <span style="opacity:.6">${s.lista.length}</span></span>
            <button class="btn sm ghost" data-vermusculo="${s.muscle}">Ver todos</button>
          </div>
          <div class="carousel">
            ${raw(s.lista.slice(0, 12).map(exCard).join(''))}
            ${raw(s.lista.length > 12
              ? '<button class="ex-card more" data-vermusculo="' + esc(s.muscle) + '">' +
                '<b>+' + (s.lista.length - 12) + '</b><span>ver todos</span></button>'
              : '')}
          </div>`;
      }).join('') : '')}

      ${raw(!segmentar ? (res.length ? html`
        <div class="grid">${raw(res.slice(0, exLimit).map(exCard).join(''))}</div>
        ${raw(res.length > exLimit
          ? '<button class="btn block" data-a="mas" style="margin-top:14px">Ver más (' +
            (res.length - exLimit) + ' restantes)</button>' : '')}`
      : html`<div class="empty">${raw(icon('search'))}
          <p>Ningún ejercicio coincide${raw(gear && !sinFiltro ? ' entre los que puedes hacer ' + esc(lugar) : '')}.</p>
          <div class="row" style="justify-content:center;gap:8px">
            <button class="btn sm" data-a="limpiar">Limpiar filtros</button>
            ${raw(gear && !sinFiltro ? '<button class="btn sm primary" data-a="togglegear">Buscar en todo el catálogo</button>' : '')}
          </div>
        </div>`) : '')}

      ${raw(segmentar && !secciones.length
        ? '<div class="empty"><p>No hay ejercicios para este filtro.</p></div>' : '')}`;
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
        ? 'Mostrando el catálogo completo'
        : 'Mostrando solo lo que puedes hacer donde entrenas');
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
      <h2>Entrenar ${region.label.toLowerCase()}</h2>
      <p class="muted">Monto una sesión equilibrada entre
      ${(region.entreno || region.muscles).map(function (m) {
        return I18N.muscle(m).toLowerCase();
      }).join(', ')}. Empiezo por lo pesado y termino con lo accesorio.</p>

      <div class="card">
        <b>¿Cuánto tiempo tienes?</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw(SESION_MIN.map(function (m) {
            return '<button class="chip ' + (sesionOpts.minutes === m ? 'on' : '') +
              '" data-smin="' + m + '">' + m + ' min</button>';
          }).join(''))}
        </div>
      </div>

      <div class="card">
        <b>¿Con qué objetivo?</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw(Object.keys(Planner.GOALS).map(function (k) {
            return '<button class="chip ' + (sesionOpts.goal === k ? 'on' : '') +
              '" data-sgoal="' + k + '">' + esc(Planner.GOALS[k].label) + '</button>';
          }).join(''))}
        </div>
      </div>

      <button class="btn primary block" data-a="crear">Ver la sesión</button>`,
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
            UI.toast('No hay ejercicios de esa zona con tu material');
            return;
          }
          previewSesionSheet(region, ejercicios);
        };
      });
  }

  function previewSesionSheet(region, ejercicios) {
    const nombre = region.label + ' · ' + sesionOpts.minutes + ' min';
    const minutos = Planner.estimate({ exercises: ejercicios });

    UI.modal(html`
      <h2>${nombre}</h2>
      <p class="muted">${ejercicios.length} ejercicios · unos ${minutos} min ·
      ${Planner.GOALS[sesionOpts.goal].label.toLowerCase()}</p>

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
        <button class="btn grow" data-a="otra">Otra propuesta</button>
        <button class="btn primary grow" data-a="empezar">${raw(icon('play'))} Empezar</button>
      </div>
      <button class="btn ghost block" data-a="guardar" style="margin-top:8px">Guardar como rutina</button>`,
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
            UI.toast('Sesión añadida al entrenamiento en curso');
            return;
          }

          if (Workout.isActive()) {
            UI.confirm('Ya hay un entrenamiento en curso',
              'Si empiezas otro, se descartará el que tienes a medias.', 'Empezar de nuevo', true)
              .then(function (ok) { if (ok) { Workout.discard(); lanzar(); } });
          } else lanzar();
        };

        el.querySelector('[data-a=guardar]').onclick = function () {
          const r = Store.saveRoutine({
            id: null, name: nombre,
            note: 'Sesión de ' + region.label.toLowerCase() + ' generada automáticamente.',
            days: [],
            exercises: ejercicios.map(function (e) {
              return { exId: e.exId, sets: e.sets, reps: e.reps, weight: 0, rest: e.rest, note: e.note };
            })
          });
          UI.closeModal();
          go('rutina', r.id);
          UI.toast('Guardada como rutina');
        };
      });
  }

  /* ================= ficha de ejercicio ================= */

  const FASES = ['Posición inicial', 'Posición final'];

  function viewEjercicio() {
    const ex = Data.get(route.arg);
    if (!ex) return '<div class="empty"><p>Ejercicio no encontrado.</p></div>';

    const pr = Store.prOf(ex.id);
    const hist = Store.historyOf(ex.id).slice(0, 6);
    const fav = Store.isFav(ex.id);
    const guia = Tecnica.para(ex);
    const marcos = Data.frames(ex);

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">${raw(icon('back'))} Volver</button>

      ${raw(UI.demoHTML(ex, { speed: 900, fases: marcos.length > 1 ? FASES : null }))}

      <div class="row between" style="margin:14px 0 4px;align-items:flex-start">
        <div class="grow">
          <h1 style="margin-bottom:2px">${ex.nameEs}</h1>
          <div class="tiny">${ex.name}</div>
        </div>
        <button class="btn icon ${fav ? 'primary' : ''}" data-a="fav"
                aria-label="Marcar como favorito">${raw(icon('star'))}</button>
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
        <button class="btn primary grow" data-a="addrutina">${raw(icon('plus'))} Añadir a rutina</button>
        <a class="btn" href="${Data.youtube(ex)}" target="_blank" rel="noopener noreferrer"
           aria-label="Buscar vídeo en YouTube">${raw(icon('youtube'))}</a>
      </div>

      ${raw(g.Musculos ? Musculos.mapa(ex.primaryMuscles, ex.secondaryMuscles) : '')}

      ${raw(alternativasHTML(ex))}

      ${raw(marcos.length > 1 ? html`
        <div class="list-title">El recorrido</div>
        <div class="marcos">
          <figure>
            <img src="${marcos[0]}" alt="Posición inicial" loading="lazy">
            <figcaption><b>1</b> Posición inicial</figcaption>
          </figure>
          <figure>
            <img src="${marcos[1]}" alt="Posición final" loading="lazy">
            <figcaption><b>2</b> Posición final</figcaption>
          </figure>
        </div>
        <p class="tiny" style="margin-top:8px">El movimiento va del punto 1 al 2 y vuelve
        controlando la bajada. Arriba lo ves animado.</p>` : '')}

      ${raw(guia ? guiaHTML(guia) : html`
        <div class="list-title">Cómo se ejecuta</div>
        <div class="card">
          <p class="muted">Este ejercicio todavía no tiene guía propia en español.
          Abajo tienes las instrucciones originales y el enlace a vídeos.</p>
        </div>`)}

      ${raw(instruccionesHTML(ex))}

      ${raw(pr.best ? html`
        <div class="list-title">Tus marcas</div>
        <div class="stats">
          <div class="stat"><b>${UI.num(pr.best.weight)}</b><span>Máx. ${Store.settings().unit}</span></div>
          <div class="stat"><b>${pr.best.reps}</b><span>Reps de esa serie</span></div>
          ${raw(pr.orm ? '<div class="stat"><b>' + UI.num(pr.orm.orm) + '</b><span>1RM estimado</span></div>' : '')}
        </div>` : '')}

      ${raw(hist.length ? html`
        <div class="list-title">Historial</div>
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
    }).join(' y ');

    return html`
      <div class="list-title">Si está ocupado o no lo tienes</div>
      <p class="tiny" style="margin:-4px 0 10px">Entrenas el mismo músculo${raw(
        musculos ? ' —' + esc(musculos) + '—' : '')} con otra máquina, otro material u otro
        ejercicio. ${raw(fuera
          ? 'Con tu material no sale ninguno, así que estos son del catálogo completo.'
          : 'Toca cualquiera para ver su técnica.')}</p>
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
  function guiaHTML(gu) {
    return html`
      <div class="list-title">Cómo se hace · ${gu.titulo}</div>

      <div class="card guia-bloque">
        <h3 class="guia-h">${raw(icon('perfil'))} Posición inicial</h3>
        <ol class="instr">
          ${raw(gu.inicial.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join(''))}
        </ol>
      </div>

      <div class="card guia-bloque">
        <h3 class="guia-h">${raw(icon('grafica'))} El recorrido</h3>
        ${raw(gu.recorrido.map(function (f) {
          return '<div class="fase-txt"><b>' + esc(f.fase) + '</b><p>' + esc(f.texto) + '</p></div>';
        }).join(''))}
      </div>

      <div class="card guia-bloque">
        <div class="guia-dato">
          <span class="row-icon">${raw(icon('gota'))}</span>
          <div><b>Respiración</b><p>${gu.respiracion}</p></div>
        </div>
        <div class="guia-dato">
          <span class="row-icon">${raw(icon('reloj'))}</span>
          <div><b>Ritmo</b><p>${gu.tempo}</p></div>
        </div>
      </div>

      <div class="card guia-bloque">
        <h3 class="guia-h">${raw(icon('close'))} Errores frecuentes</h3>
        ${raw(gu.errores.map(function (e) {
          return '<div class="error-item"><b>' + esc(e.fallo) + '</b><p>' + esc(e.arreglo) + '</p></div>';
        }).join(''))}
      </div>

      <div class="card destacado-clave">
        <h3 class="guia-h">${raw(icon('chispa'))} La clave</h3>
        <p style="margin:0">${gu.clave}</p>
      </div>

      ${raw(gu.seguridad ? html`
        <div class="card aviso-seguridad">
          <b>Seguridad</b>
          <p style="margin:4px 0 0">${gu.seguridad}</p>
        </div>` : '')}`;
  }

  /* Las instrucciones originales quedan como material de apoyo, plegadas */
  function instruccionesHTML(ex) {
    if (!ex.instructions || !ex.instructions.length) return '';
    const traducidas = traduccionGuardada(ex);
    const pasos = traducidas || ex.instructions;

    return html`
      <button class="guia-tit" data-a="verOriginal" style="margin-top:18px">
        ${raw(icon('chevron'))} Cómo se hace, paso a paso
      </button>
      <div class="guia" id="orig" hidden>
        <div class="card">
          <ol class="instr" id="instr">
            ${raw(pasos.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join(''))}
          </ol>
          ${raw(traducidas || ex.yaEnEspanol ? ''
            : '<p class="tiny" id="tr-aviso" style="margin:10px 0 0">' +
            'Traduciendo del catálogo original…</p>')}
        </div>
      </div>`;
  }

  viewEjercicio.mount = function (root) {
    const ex = Data.get(route.arg);
    if (!ex) return;

    bind(root, '[data-a=atras]', function () { history.back(); });
    bind(root, '[data-a=fav]', function (el) {
      const on = Store.toggleFav(ex.id);
      el.classList.toggle('primary', on);
      UI.toast(on ? 'Añadido a favoritos' : 'Quitado de favoritos');
    });
    bind(root, '[data-a=addrutina]', function () { pickRoutineSheet(ex); });
    bindAll(root, '[data-ex]', function (el) { go('ejercicio', el.dataset.ex); window.scrollTo(0, 0); });
    /* Se traduce sola al abrir: el botón estaba dentro de un bloque plegado y
       casi nadie llegaba a pulsarlo. */
    asegurarTraduccion(ex).then(function (pasos) {
      if (!pasos) {
        const aviso = root.querySelector('#tr-aviso');
        if (aviso) aviso.textContent = 'No he podido traducirlas; las dejo como vienen.';
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
    btn.textContent = 'Traduciendo…';

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
      UI.toast('Instrucciones traducidas');
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = 'Traducir';
      UI.toast('No se pudo traducir ahora. Prueba más tarde.');
    });
  }

  /* Hoja para añadir un ejercicio a una rutina existente o nueva */
  function pickRoutineSheet(ex) {
    const rutinas = Store.routines();
    UI.modal(html`
      <h2>Añadir «${ex.nameEs}»</h2>
      <p class="muted">Elige a qué rutina quieres añadirlo.</p>
      <div class="stack">
        ${raw(rutinas.map(function (r) {
          return html`<button class="btn block" data-r="${r.id}" style="justify-content:space-between">
            <span>${r.name || 'Sin nombre'}</span>
            <span class="tiny">${r.exercises.length} ej.</span></button>`;
        }).join(''))}
        <button class="btn primary block" data-r="nueva">${raw(icon('plus'))} Crear rutina nueva</button>
      </div>`,
      function (el) {
        el.querySelectorAll('[data-r]').forEach(function (btn) {
          btn.onclick = function () {
            const id = btn.dataset.r;
            if (id === 'nueva') {
              const r = Store.saveRoutine(Object.assign(Store.newRoutine(), {
                name: 'Nueva rutina', exercises: [Store.newRoutineExercise(ex.id)]
              }));
              UI.closeModal();
              go('rutina', r.id);
              return;
            }
            const r = Store.routine(id);
            r.exercises.push(Store.newRoutineExercise(ex.id));
            Store.saveRoutine(r);
            UI.closeModal();
            UI.toast('Añadido a «' + (r.name || 'rutina') + '»');
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
      <h1>Rutinas</h1>

      <div class="row" style="margin:6px 0 4px">
        <button class="btn primary grow" data-a="nueva">
          ${raw(icon('plus'))} Crear la mía</button>
        <button class="btn grow" data-a="programa">
          ${raw(icon('chispa'))} Generar programa</button>
      </div>
      <p class="tiny" style="margin:4px 0 0"><b>Crear la mía</b>: la montas tú.
      <b>Generar programa</b>: te lo monto yo con tus datos y lo editas igual.</p>

      <!-- Las tres acciones sueltas, en filas de una sola pieza. Antes eran
           botón y párrafo, botón y párrafo: cuatro bloques de texto gris
           seguidos en los que no se distingue lo que se puede tocar de lo que
           solo se lee. En una fila, el titulo dice que hace y el renglon de
           debajo por que, y toda ella se toca. -->
      <div class="card lista-acciones tarjeta-premium">
        ${raw(filaAccion('actividad', 'plus', 'Apuntar algo que ya hice',
          'Caminar una hora el domingo o la pachanga del sábado cuentan igual, ' +
          'aunque no salgan de una rutina.'))}

        ${raw(Store.routines().some(function (r) { return (r.days || []).length; })
          ? filaAccion('correr', 'cambiar', 'Hoy no pude: correr el plan un día',
            'Lo que tocaba hoy pasa a mañana, y así el resto, en vez de perder la sesión.')
          : '')}

        ${raw(filaAccion('importar', 'nutricion', 'Traer una rutina que tengo en papel',
          'Una foto de la hoja del gimnasio o el PDF de tu entrenador: la leo y tú decides.'))}
      </div>

      ${raw((function () {
        const n = duplicados().length;
        if (!n) return '';
        return '<div class="card aviso-seguridad" style="margin-top:10px">' +
          '<b>Tienes rutinas repetidas</b>' +
          '<p style="margin:7px 0 0;font-size:.9rem">Hay ' + n + ' ' +
          (n === 1 ? 'rutina que repite' : 'rutinas que repiten') + ' plan y día de otra, ' +
          'de haber generado el programa más de una vez. Se pueden quitar de golpe.</p>' +
          '<button class="btn block" data-a="limpiardup" style="margin-top:11px">' +
          'Revisar y limpiar</button></div>';
      })())}

      ${raw(rutinas.length ? html`
        <div class="list-head">
          <span class="list-title">${ordenando ? 'Ordena y borra lo que sobre' : 'Mis rutinas'}</span>
          <button class="btn sm ${ordenando ? 'primary' : 'ghost'}" data-a="ordenar">
            ${ordenando ? 'Hecho' : 'Editar lista'}</button>
        </div>` : '')}

      ${raw(rutinas.length ? (ordenando
        ? '<div class="stack" style="margin-top:8px">' + rutinas.map(function (r, i) {
            return routineCard(r, i, rutinas.length);
          }).join('') + '</div>'
        : porPlanes(rutinas))
      : '<p class="muted">Aún no tienes rutinas propias. Copia una plantilla de abajo para empezar.</p>')}

      ${raw(ordenando ? '<p class="tiny" style="margin-top:10px">Con las flechas las ' +
        'colocas a tu gusto y con la papelera las borras. El orden viaja a tus demás ' +
        'dispositivos, y al salir de aquí la rutina de hoy vuelve a ponerse la primera.</p>'
        : '<p class="tiny" style="margin-top:10px">Abre un plan para ver sus días. ' +
        'Toca una rutina para desplegar sus ejercicios y cambiarle el día, o pulsa ' +
        'Entrenar para hacerla ahora.</p>')}

      ${raw(seccionPlegable('fuerza', 'Rutinas de ejemplo',
        Templates.list.filter(function (t) { return (t.tipo || 'fuerza') === 'fuerza'; }).length,
        'Al usar una plantilla se copia a tus rutinas; puedes cambiar ejercicios, ' +
        'series y descansos sin límite.',
        plantillasHTML('fuerza')))}

      ${raw(seccionPlegable('movilidad', 'Estiramientos, pilates y terapia',
        Templates.list.filter(function (t) { return (t.tipo || 'fuerza') === 'movilidad'; }).length,
        'Se copian y se hacen igual que las demás, con su cronómetro y sus descansos. ' +
        'En estas las repeticiones son segundos.',
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
              <span style="font-weight:700;display:block">${t.name}</span>
              <span class="tiny" style="display:block">${t.goal} · ${t.level}
                · ${t.exercises.length} ejercicios</span>
              <span class="tiny" style="display:block">${UI.diasLargos(t.days)}</span>
            </span>
            <button class="btn sm pl-usar" data-tpl="${t.id}">${raw(icon('copy'))} Usar</button>
          </summary>
          <div class="pl-cuerpo">
            <span class="chip tiny-chip" style="display:inline-block">
              ${raw(icon('dumbbell'))} ${Data.GEAR[Templates.lugarNecesario(t)].label}</span>
            <p class="muted" style="margin:9px 0 0;font-size:.82rem">${t.note}</p>
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
      if (ordenando) UI.toast('Colócalas con las flechas o bórralas con la papelera');
    });

    bindAll(root, '[data-borrar]', function (el) {
      const r = Store.routine(el.dataset.borrar);
      if (!r) return;
      UI.confirm('Borrar «' + (r.name || 'esta rutina') + '»',
        'Se quita de tu lista. Los entrenamientos que ya hiciste con ella se conservan ' +
        'en tu historial.', 'Borrar', true).then(function (ok) {
        if (!ok) return;
        Store.deleteRoutine(r.id);
        if (!Store.routines().length) ordenando = false;
        render();
        UI.toast('Rutina borrada');
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
      UI.toast(n ? 'Plan principal: ' + n : 'Ya no hay plan principal');
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
      UI.toast('Rutina copiada. Ya puedes editarla.');
      go('rutina', r.id);
    });
  };

  /* ---------- apuntar algo hecho fuera de la app ----------
     Media vida de entrenamiento no pasa por una rutina: una hora andando el
     domingo, la pachanga del sábado, la clase de pilates del barrio. Si eso no
     se puede apuntar, la racha miente y el progreso enseña menos de lo que hay.
     Las calorías salen del MET de cada actividad por el peso y el tiempo, que es
     la misma cuenta que hace cualquier reloj y no pretende ser exacta. */
  const ACTIVIDADES = [
    { id: 'caminar', label: 'Caminar', met: 3.5 },
    { id: 'correr', label: 'Correr', met: 9 },
    { id: 'bici', label: 'Bici', met: 7 },
    { id: 'nadar', label: 'Nadar', met: 7 },
    { id: 'senderismo', label: 'Senderismo', met: 6 },
    { id: 'equipo', label: 'Deporte de equipo', met: 7 },
    { id: 'raqueta', label: 'Raqueta o pádel', met: 6.5 },
    { id: 'baile', label: 'Baile', met: 5 },
    { id: 'pilates', label: 'Pilates o yoga', met: 3 },
    { id: 'estirar', label: 'Estirar y movilidad', met: 2.5 },
    { id: 'pesas', label: 'Pesas por mi cuenta', met: 5 },
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
    if (!r) { UI.toast('Esa rutina ya no está'); return; }

    const planes = [];
    Store.routines().forEach(function (x) {
      const n = nombreRutina(x);
      if (n && planes.indexOf(n) === -1) planes.push(n);
    });
    const suyo = nombreRutina(r);

    let plan = suyo;
    let dias = [];

    UI.modal(html`
      <h2>Duplicar rutina</h2>
      <p class="muted">Copias ${tituloRutina(r)} con sus
        ${r.exercises.length} ${r.exercises.length === 1 ? 'ejercicio' : 'ejercicios'},
        series y descansos. La original no se toca.</p>

      <div class="tiny" style="margin:14px 0 6px">A QUÉ PLAN VA</div>
      <div class="row wrap" id="dr-planes" style="gap:6px">
        ${raw(planes.map(function (n) {
          return '<button class="chip ' + (n === suyo ? 'on' : '') + '" data-dplan="' +
            esc(n) + '">' + esc(n) + '</button>';
        }).join(''))}
        <button class="chip" data-dplan="__nuevo">+ Plan nuevo</button>
      </div>
      <input id="dr-nombre" class="input" placeholder="Nombre del plan nuevo"
             style="margin-top:8px;display:none" maxlength="40">

      <div class="tiny" style="margin:14px 0 6px">QUÉ DÍA LA HAGO</div>
      <div class="row wrap" id="dr-dias" style="gap:6px">
        ${raw(DIAS.map(function (d) {
          return '<button class="chip" data-ddia="' + d + '">' + d + '</button>';
        }).join(''))}
      </div>
      <p class="tiny" style="margin:7px 0 0">Puedes dejarla sin día y ponérselo
        luego. Si le das un día que ya tiene otra rutina, tendrás dos para ese
        día y la portada solo puede enseñar una.</p>

      <button class="btn primary block" id="dr-ok" style="margin-top:16px">Duplicar</button>
      <button class="btn ghost block" id="dr-no" style="margin-top:8px">Cancelar</button>`,
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
            if (!destino) { UI.toast('Ponle nombre al plan nuevo'); campo.focus(); return; }
          }

          const copia = copiaDe(r);
          copia.days = DIAS.filter(function (d) { return dias.indexOf(d) !== -1; });
          copia.name = nombreConDia(destino, copia.days);
          const nueva = Store.saveRoutine(copia);

          UI.closeModal();
          rutinaAbierta.rutinas = nueva.id;
          gruposAbiertos[destino] = true;
          render();
          UI.toast('Duplicada en «' + destino + '»');
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
    if (!suyas.length) { UI.toast('Ese plan ya no está'); return; }

    suyas.sort(function (a, b) {
      return DIAS.indexOf((a.days || [])[0]) - DIAS.indexOf((b.days || [])[0]);
    });

    let propuesto = nombre + ' 2';
    for (let i = 2; Store.routines().some(function (r) { return nombreRutina(r) === propuesto; }); i++) {
      propuesto = nombre + ' ' + (i + 1);
    }

    UI.modal(html`
      <h2>Duplicar «${nombre}»</h2>
      <p class="muted">Se copian las ${suyas.length}
        ${suyas.length === 1 ? 'rutina' : 'rutinas'} con sus mismos días. El plan
        original se queda como está.</p>
      <div class="card">
        ${raw(suyas.map(function (r) {
          return '<div class="row between" style="padding:4px 0;gap:10px">' +
            '<span style="font-size:.86rem">' + esc(tituloRutina(r)) + '</span>' +
            '<span class="tiny">' + r.exercises.length + ' ejercicios</span></div>';
        }).join(''))}
      </div>

      <div class="tiny" style="margin:14px 0 6px">CÓMO SE LLAMA LA COPIA</div>
      <input id="dp-nombre" class="input" value="${propuesto}" maxlength="40">
      <p class="tiny" style="margin:7px 0 0">Tendrás dos rutinas para cada día
        —la del plan viejo y la del nuevo—. Borra el que no uses cuando decidas,
        o quítale los días al que dejes aparcado.</p>

      <button class="btn primary block" id="dp-ok" style="margin-top:16px">
        Duplicar las ${suyas.length}</button>
      <button class="btn ghost block" id="dp-no" style="margin-top:8px">Cancelar</button>`,
      function (el) {
        el.querySelector('#dp-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#dp-ok').onclick = function () {
          const destino = String(el.querySelector('#dp-nombre').value || '').trim();
          if (!destino) { UI.toast('Ponle un nombre'); return; }
          if (destino === nombre) { UI.toast('Ponle un nombre distinto al original'); return; }

          suyas.forEach(function (r) {
            const copia = copiaDe(r);
            copia.days = (r.days || []).slice();
            copia.name = nombreConDia(destino, copia.days);
            Store.saveRoutine(copia);
          });

          UI.closeModal();
          gruposAbiertos[destino] = true;
          render();
          UI.toast('Plan «' + destino + '» creado');
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
    if (!suyas.length) { UI.toast('Ese plan ya no está'); return; }

    UI.modal(html`
      <h2>Renombrar plan</h2>
      <p class="muted">Se cambia en las ${suyas.length}
        ${suyas.length === 1 ? 'rutina' : 'rutinas'} del plan. Los días y los
        ejercicios no se tocan.</p>

      <div class="tiny" style="margin:14px 0 6px">CÓMO SE LLAMA</div>
      <input id="rn-nombre" class="input" value="${nombre}" maxlength="40">
      <p class="tiny" style="margin:7px 0 0">Lo verás aquí, en el banner del
        entrenamiento en curso y en tu historial.</p>

      <button class="btn primary block" id="rn-ok" style="margin-top:16px">Guardar</button>
      <button class="btn ghost block" id="rn-no" style="margin-top:8px">Cancelar</button>`,
      function (el) {
        const campo = el.querySelector('#rn-nombre');
        campo.focus();
        campo.select();
        el.querySelector('#rn-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#rn-ok').onclick = function () {
          const nuevo = String(campo.value || '').trim();
          if (!nuevo) { UI.toast('Ponle un nombre'); return; }
          if (nuevo === nombre) { UI.closeModal(); return; }
          if (Store.routines().some(function (r) { return App.nombreRutina(r) === nuevo; })) {
            UI.toast('Ya tienes un plan con ese nombre');
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
          UI.toast('Ahora se llama «' + nuevo + '»');
        };
      });
  }

  /* Una rutina suelta: se le cambia el plan al que pertenece, que es lo único
     que su nombre guarda aparte del día. Se dice claro, porque cambiarlo la
     saca del grupo en el que estaba. */
  function renombrarRutinaSheet(id) {
    const r = Store.routine(id);
    if (!r) { UI.toast('Esa rutina ya no está'); return; }
    const actual = nombreRutina(r);

    UI.modal(html`
      <h2>Renombrar rutina</h2>
      <p class="muted">${tituloRutina(r)} — ahora está en el plan
        «${actual}». El día se mantiene delante solo.</p>

      <div class="tiny" style="margin:14px 0 6px">A QUÉ PLAN PERTENECE</div>
      <input id="rr-nombre" class="input" value="${actual}" maxlength="40">
      <p class="tiny" style="margin:7px 0 0">Si le pones un nombre distinto al de
        sus compañeras, esta rutina se va sola a un plan nuevo.</p>

      <button class="btn primary block" id="rr-ok" style="margin-top:16px">Guardar</button>
      <button class="btn ghost block" id="rr-no" style="margin-top:8px">Cancelar</button>`,
      function (el) {
        const campo = el.querySelector('#rr-nombre');
        campo.focus();
        campo.select();
        el.querySelector('#rr-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#rr-ok').onclick = function () {
          const nuevo = String(campo.value || '').trim();
          if (!nuevo) { UI.toast('Ponle un nombre'); return; }
          if (nuevo === actual) { UI.closeModal(); return; }
          r.name = nombreConDia(nuevo, r.days);
          Store.saveRoutine(r);
          refrescarActiva(r);
          UI.closeModal();
          gruposAbiertos[nuevo] = true;
          rutinaAbierta.rutinas = r.id;
          render();
          UI.toast('Ahora está en «' + nuevo + '»');
        };
      });
  }

  function borrarPlanSheet(nombre) {
    const suyas = Store.routines().filter(function (r) {
      return (r.days || []).length && nombreRutina(r) === nombre;
    });
    if (!suyas.length) { UI.toast('Ese plan ya no está'); return; }

    suyas.sort(function (a, b) {
      return DIAS.indexOf((a.days || [])[0]) - DIAS.indexOf((b.days || [])[0]);
    });

    const hechas = Store.sessions().filter(function (s) {
      return suyas.some(function (r) { return r.id === s.routineId; });
    }).length;

    UI.modal(html`
      <h2>Borrar «${nombre}»</h2>
      <p class="muted">Se van estas ${suyas.length}
        ${suyas.length === 1 ? 'rutina' : 'rutinas'} y el plan desaparece de tu lista.</p>
      <div class="card">
        ${raw(suyas.map(function (r) {
          return '<div class="row between" style="padding:4px 0;gap:10px">' +
            '<span style="font-size:.86rem">' + esc(tituloRutina(r)) + '</span>' +
            '<span class="tiny">' + r.exercises.length + ' ejercicios</span></div>';
        }).join(''))}
      </div>
      <p class="tiny" style="margin:10px 0 0">${hechas
        ? 'Los ' + hechas + ' entrenamientos que ya hiciste con ellas se quedan en tu ' +
          'historial: esto no borra nada de Progreso.'
        : 'Tu historial de entrenamientos no se toca.'}</p>
      <button class="btn danger block" id="bp-ok" style="margin-top:14px">
        Borrar las ${suyas.length}</button>
      <button class="btn ghost block" id="bp-no" style="margin-top:8px">Dejarlo como está</button>`,
      function (el) {
        el.querySelector('#bp-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#bp-ok').onclick = function () {
          suyas.forEach(function (r) { Store.deleteRoutine(r.id); });
          UI.closeModal();
          render();
          UI.toast('Plan «' + nombre + '» borrado');
        };
      });
  }

  function limpiarDuplicadosSheet() {
    const sobran = duplicados();
    if (!sobran.length) { UI.toast('No hay rutinas repetidas'); return; }

    const lista = sobran.map(function (r) {
      return '<div class="row between" style="padding:4px 0;gap:10px">' +
        '<span style="font-size:.86rem">' + esc(tituloRutina(r)) + '</span>' +
        '<span class="tiny">' + r.exercises.length + ' ejercicios \u00b7 ' +
        (r.updatedAt ? UI.fechaCorta(r.updatedAt) : 'sin fecha') + '</span></div>';
    }).join('');

    UI.modal(html`
      <h2>Rutinas repetidas</h2>
      <p class="muted">Tienes ${sobran.length} ${sobran.length === 1 ? 'rutina repetida'
        : 'rutinas repetidas'}: mismo plan y mismo día que otra. Se van estas y se queda
      la más reciente de cada una.</p>
      <div class="card">${raw(lista)}</div>
      <p class="tiny" style="margin:10px 0 0">Tu historial de entrenamientos no se toca:
      lo que hiciste con ellas se queda en Progreso.</p>
      <button class="btn danger block" id="dup-ok" style="margin-top:14px">
        Borrar las ${sobran.length} repetidas</button>
      <button class="btn ghost block" id="dup-no" style="margin-top:8px">Dejarlo como está</button>`,
      function (el) {
        el.querySelector('#dup-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#dup-ok').onclick = function () {
          sobran.forEach(function (r) { Store.deleteRoutine(r.id); });
          UI.closeModal();
          render();
          UI.toast(sobran.length + (sobran.length === 1 ? ' rutina borrada' : ' rutinas borradas'));
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
    if (!rutinas.length) { UI.toast('Ninguna rutina tiene día asignado'); return; }

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
      <h2>Correr el plan de día</h2>
      <p class="muted">Hoy no has podido ir, pero la semana no se tira: se empuja. Lo del
      lunes pasa al martes, lo del martes al miércoles, y así con todo.</p>
      <div class="card" id="cp-previa">${raw(previa(1))}</div>
      <button class="btn primary block" id="cp-mas" style="margin-top:14px">
        Correr un día adelante</button>
      <button class="btn block sm" id="cp-menos" style="margin-top:8px">
        Adelantarlo un día en vez de eso</button>
      <p class="tiny" style="margin-top:10px">Solo cambia el día en el que te toca cada
      rutina. Los ejercicios, las series y tu historial no se tocan.</p>`,
      function (el) {
        const hacer = function (pasos) {
          const n = correrPlan(pasos);
          UI.closeModal();
          render();
          UI.toast(n + (n === 1 ? ' rutina corrida ' : ' rutinas corridas ') +
            (pasos > 0 ? 'un día adelante' : 'un día atrás'));
        };
        el.querySelector('#cp-mas').onclick = function () { hacer(1); };
        el.querySelector('#cp-menos').onclick = function () { hacer(-1); };
      });
  }

  function apuntarActividad() {
    const p = Perfil.datos();
    const peso = Number(p && p.peso) || 75;
    const elegido = { act: 'caminar', min: 60, atras: 0, nombre: '' };

    const kcalDe = function () {
      const a = ACTIVIDADES.find(function (x) { return x.id === elegido.act; }) || ACTIVIDADES[0];
      return Math.round(a.met * peso * elegido.min / 60);
    };

    const diasHTML = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const et = i === 0 ? 'Hoy' : i === 1 ? 'Ayer' : UI.diaLargo(UI.DAY_NAMES[d.getDay()]);
      diasHTML.push('<button class="chip ' + (i === 0 ? 'on' : '') + '" data-cuando="' +
        i + '">' + esc(et) + '</button>');
    }

    UI.modal(html`
      <h2>Apuntar algo que ya hice</h2>
      <p class="muted" style="margin:0 0 12px">Entra en tu historial y en tu racha como un
      entrenamiento más. Las calorías son una estimación por tu peso y el tiempo.</p>

      <label class="tiny">QUÉ HICE</label>
      <input id="ac-nombre" placeholder="Escríbelo tú: pickleball, mudanza, subir al pueblo…"
             autocomplete="off" style="margin-top:6px">
      <div class="row wrap" style="gap:6px;margin-top:8px" id="ac-tipos">
        ${raw(ACTIVIDADES.map(function (a) {
          return '<button class="chip ' + (a.id === 'caminar' ? 'on' : '') +
            '" data-act="' + a.id + '">' + esc(a.label) + '</button>';
        }).join(''))}
      </div>
      <p class="tiny" style="margin:6px 0 0">Si lo escribes tú, elige abajo lo que más se le
      parezca en esfuerzo: de ahí salen las calorías.</p>

      <label class="tiny" style="display:block;margin-top:14px">CUÁNDO</label>
      <div class="row wrap" style="gap:6px;margin-top:6px" id="ac-dias">${raw(diasHTML.join(''))}</div>

      <label class="tiny" style="display:block;margin-top:14px">CUÁNTO TIEMPO</label>
      <div class="row wrap" style="gap:6px;margin-top:6px" id="ac-mins">
        ${raw([15, 30, 45, 60, 90, 120].map(function (m) {
          return '<button class="chip ' + (m === 60 ? 'on' : '') + '" data-min="' + m +
            '">' + m + ' min</button>';
        }).join(''))}
      </div>
      <input id="ac-otro" type="number" inputmode="numeric" min="1" max="600"
             placeholder="u otro número de minutos" style="margin-top:8px">

      <div class="card" style="margin-top:14px">
        <div class="tiny">ESTIMACIÓN</div>
        <div id="ac-kcal" style="font-weight:700;font-size:1.15rem;margin-top:3px"></div>
      </div>

      <button class="btn primary block" id="ac-ok" style="margin-top:14px">Apuntar</button>`,
      function (el) {
        const pintarKcal = function () {
          el.querySelector('#ac-kcal').textContent = '~' + UI.num(kcalDe()) + ' kcal en ' +
            elegido.min + ' min';
        };
        const marcar = function (caja, sel) {
          el.querySelectorAll(caja + ' .chip').forEach(function (c) {
            c.classList.toggle('on', c === sel);
          });
        };

        el.querySelectorAll('#ac-tipos .chip').forEach(function (c) {
          c.onclick = function () {
            elegido.act = c.dataset.act;
            elegido.aMano = true;
            marcar('#ac-tipos', c);
            pintarKcal();
          };
        });

        /* Escribir el nombre no puede obligar a elegir esfuerzo: si no se ha
           tocado ningún chip, se asume una actividad del montón. */
        el.querySelector('#ac-nombre').oninput = function (ev) {
          elegido.nombre = ev.target.value.trim();
          if (elegido.nombre && !elegido.aMano) {
            elegido.act = 'otro';
            marcar('#ac-tipos', el.querySelector('[data-act=otro]'));
            pintarKcal();
          }
        };
        el.querySelectorAll('#ac-dias .chip').forEach(function (c) {
          c.onclick = function () { elegido.atras = Number(c.dataset.cuando); marcar('#ac-dias', c); };
        });
        el.querySelectorAll('#ac-mins .chip').forEach(function (c) {
          c.onclick = function () {
            elegido.min = Number(c.dataset.min);
            el.querySelector('#ac-otro').value = '';
            marcar('#ac-mins', c);
            pintarKcal();
          };
        });
        el.querySelector('#ac-otro').oninput = function (ev) {
          const v = Number(ev.target.value);
          if (v > 0) {
            elegido.min = Math.min(600, v);
            marcar('#ac-mins', null);
            pintarKcal();
          }
        };
        pintarKcal();

        el.querySelector('#ac-ok').onclick = function () {
          const a = ACTIVIDADES.find(function (x) { return x.id === elegido.act; }) || ACTIVIDADES[0];
          const fin = Date.now() - elegido.atras * 86400000;
          const comoSeLlama = elegido.nombre || a.label;
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
            kcal: kcalDe()
          });
          UI.closeModal();
          render();
          UI.toast(comoSeLlama + ' apuntado: ' + elegido.min + ' min');
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
      <h1>Crea tu plan semanal</h1>
      <p class="muted">Responde cuatro cosas y te organizo la semana: qué grupo muscular
      toca cada día y con qué ejercicios, ajustado al tiempo que tengas.</p>

      <div class="card">
        <div class="row between" style="margin-bottom:9px">
          <b>¿Qué días entrenas?</b>
          <span class="chip solid" id="p-ndias">${p.days.length} días</span>
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
        <b>¿Cuánto dura cada sesión?</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw([30, 45, 60, 75, 90].map(function (m) {
            return '<button class="chip ' + (p.minutes === m ? 'on' : '') +
                   '" data-pmin="' + m + '">' + m + ' min</button>';
          }).join(''))}
        </div>
      </div>

      <div class="card">
        <div class="row between">
          <div class="grow">
            <b>Entrenas ${Data.gearFrase(Data.GEAR[p.gear] ? p.gear : 'gym')}</b>
            <div class="tiny">Solo usaré ejercicios que puedas hacer ahí</div>
          </div>
          <button class="btn sm" data-a="cambiarlugar">Cambiar</button>
        </div>
      </div>

      <div class="card">
        <b>¿Cuál es tu objetivo?</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw(Object.keys(Planner.GOALS).map(function (k) {
            return '<button class="chip ' + (p.goal === k ? 'on' : '') +
                   '" data-pgoal="' + k + '">' + esc(Planner.GOALS[k].label) + '</button>';
          }).join(''))}
        </div>
        <div class="hr"></div>
        <b>¿Qué experiencia tienes?</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw(Object.keys(I18N.LEVEL).map(function (k) {
            return '<button class="chip ' + (p.level === k ? 'on' : '') +
                   '" data-plevel="' + k + '">' + esc(I18N.LEVEL[k]) + '</button>';
          }).join(''))}
        </div>
      </div>

      <button class="btn primary block" data-a="generar" style="margin-top:16px">
        ${raw(icon('flag'))} Generar mi plan
      </button>`;
  }

  function planPreview(p) {
    const plan = p.preview;
    return html`
      <button class="btn sm ghost" data-a="volver" style="margin-bottom:10px">
        ${raw(icon('back'))} Cambiar respuestas</button>
      <h1>Tu plan de ${plan.length} días</h1>
      <p class="muted">Así queda tu semana. Al guardarlo se crea una rutina por día,
      y podrás editarlas como quieras.</p>

      <div class="stack">
        ${raw(plan.map(function (r, i) {
          return html`
            <div class="card">
              <div class="row between" style="align-items:flex-start">
                <div class="grow">
                  <div style="font-weight:700">${r.name}</div>
                  <div class="tiny">${r.exercises.length} ejercicios · ~${Planner.estimate(r)} min ·
                    ${r.muscles.map(I18N.muscle).join(' · ')}</div>
                </div>
                <button class="btn icon sm" data-pdet="${i}" aria-label="Ver ejercicios">
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
                        <div class="tiny">${re.sets} × ${re.reps} · descanso ${re.rest}s ·
                          ${ex ? I18N.muscle(ex.primaryMuscles[0]) : ''}</div>
                      </div>
                    </div>`;
                }).join(''))}
              </div>
            </div>`;
        }).join(''))}
      </div>

      <div class="row" style="margin-top:16px">
        <button class="btn grow" data-a="otra">${raw(icon('copy'))} Otra propuesta</button>
        <button class="btn primary grow" data-a="guardarplan">${raw(icon('check'))} Guardar plan</button>
      </div>
      <p class="tiny" style="margin-top:10px">Guardar añade ${plan.length} rutinas nuevas;
      no se borra nada de lo que ya tengas.</p>`;
  }

  viewPlan.mount = function (root) {
    const p = planState;

    function refrescarSplit() {
      const el = root.querySelector('#p-split');
      if (!el) return;
      const n = Math.min(6, Math.max(1, p.days.length));
      const split = Planner.SPLITS[n];
      el.innerHTML = p.days.length
        ? 'Con ' + p.days.length + (p.days.length === 1 ? ' día' : ' días') + ' te propongo: ' +
          esc(split.map(function (s) { return s.name; }).join(' · '))
        : 'Elige al menos un día.';
      const chip = root.querySelector('#p-ndias');
      if (chip) chip.textContent = p.days.length + (p.days.length === 1 ? ' día' : ' días');
    }
    refrescarSplit();

    bindAll(root, '[data-pday]', function (el) {
      const d = el.dataset.pday;
      const i = p.days.indexOf(d);
      if (i === -1) {
        if (p.days.length >= 6) { UI.toast('Seis días es el máximo recomendable'); return; }
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
      if (!p.days.length) { UI.toast('Elige al menos un día de entrenamiento'); return; }
      p.preview = Planner.generate(p);
      render();
      window.scrollTo(0, 0);
    });

    bind(root, '[data-a=volver]', function () { p.preview = null; render(); });
    bind(root, '[data-a=otra]', function () {
      p.preview = Planner.generate(p);
      render();
      UI.toast('Nueva propuesta generada');
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
      UI.toast('Plan guardado: ' + n + ' rutinas creadas');
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
    if (!IA.activa()) { go('claves'); UI.toast('Elige proveedor de IA y pon su clave'); return; }
    auditarAlEntrar = id;
    go('rutina', id);
  }

  function auditoriaHTML() {
    if (!draft.id || !draft.exercises.length) return '';

    if (revIA.cargando) {
      return html`
        <div class="card center" style="margin-top:16px">
          <div class="spinner" style="margin:6px auto"></div>
          <p class="tiny" style="margin:8px 0 0">Auditando esta rutina…</p>
        </div>`;
    }

    const r = revIA.id === draft.id ? revIA.datos : null;
    if (!r) {
      return html`
        <button class="btn block" data-a="auditar" style="margin-top:16px">
          ${raw(icon('chispa'))} Que la IA revise esta rutina
        </button>
        <p class="tiny" style="margin:7px 0 0">${IA.activa()
          ? 'La lee con tu perfil y tu historial delante, le pone nota y propone cambios que aplicas de un toque.'
          : 'Necesita un proveedor de IA con su clave, en Ajustes → Bóveda de claves.'}</p>`;
    }

    const nota = Number(r.nota);
    return html`
      <div class="list-head">
        <span class="list-title">Lo que dice el entrenador</span>
        <button class="btn sm ghost" data-a="olvidarAuditoria">Descartar</button>
      </div>
      <div class="card">
        ${raw(nota > 0 ? html`
          <div class="row" style="gap:12px;align-items:center;margin-bottom:10px">
            <div style="flex:none;font-size:1.9rem;font-weight:700;line-height:1;color:${raw(
              nota >= 8 ? 'var(--acc)' : nota >= 6 ? 'var(--warn)' : 'var(--bad)')}">${nota}<span
                 style="font-size:.9rem;color:var(--dim2)">/10</span></div>
            <div class="tiny grow">Nota que le pone a esta rutina tal y como está.</div>
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
          <b>Los cambios, para aplicarlos de uno en uno</b>
          <div class="stack" style="margin-top:9px">
            ${raw(r.cambios.map(function (c, i) {
              const acc = accionRutina(c);
              const etiqueta = { quitar: 'Quitar', anadir: 'Añadir', cambiar: 'Sustituir',
                orden: 'Reordenar', descanso: 'Descanso', series: 'Series' }[acc] || 'Cambiar';
              const que = acc === 'quitar' ? c.quitar
                : acc === 'anadir' ? c.poner
                : acc === 'orden' ? ((c.lista || []).length
                    ? 'Los básicos delante en ' + c.sobre
                    : c.sobre + ' al ' + (c.posicion || 1) + '.º')
                : acc === 'descanso' ? c.sobre + ' a ' + (c.rest || 0) + 's'
                : acc === 'series' ? c.sobre + ' a ' + (c.series || 0) + ' series'
                : c.poner + ' en lugar de ' + c.quitar;
              return html`
                <div class="row between" style="gap:10px;align-items:flex-start">
                  <div class="grow">
                    <div style="font-size:.86rem">
                      <span class="chip tiny-chip">${etiqueta}</span>
                      <b>${que}</b></div>
                    <div class="tiny">${c.porque || ''}</div>
                  </div>
                  <div class="row" style="gap:6px;flex:none">
                    <button class="btn sm" data-rcambio="${i}">Aplicar</button>
                    <button class="btn sm ghost" data-rnocambio="${i}"
                            aria-label="Descartar">✕</button>
                  </div>
                </div>`;
            }).join(''))}
          </div>
          <p class="tiny" style="margin:10px 0 0">Se comprueba antes de aplicarlo: si el
          ejercicio no existe, no cabe con tu material o choca con tus limitaciones, se
          descarta. Lo que apliques se guarda en la rutina al momento.</p>
        </div>` : '')}

      ${raw(r.consejo ? html`
        <div class="card destacado-clave">
          <h3 class="guia-h">${raw(icon('chispa'))} Si solo haces una cosa</h3>
          <p style="margin:0">${r.consejo}</p>
        </div>` : '')}

      <button class="btn block" data-a="auditar" style="margin-top:12px">
        ${raw(icon('chispa'))} Analizar otra vez</button>
      <p class="tiny" style="margin:7px 0 0">Con los cambios que acabas de aplicar
      delante, el dictamen cambia. Cada pulsación es una llamada a la IA.</p>`;
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
      if (!ex) { fuera.push(nombre + ' (no está en el catálogo)'); return; }
      if (vistos[ex.id]) return;

      const patron = Alt.patron(ex);
      const prohibido = claves.some(function (k) {
        return (Programa.LESIONES[k].patronesFuera || []).indexOf(patron) !== -1;
      });
      if (prohibido) { fuera.push(ex.nameEs + ' (choca con tus limitaciones)'); return; }

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
        <b>Cómo la dejaría él</b>
        <p class="tiny" style="margin:5px 0 10px">La rutina entera rehecha, en el orden en
        que hay que hacerla. Sustituye a la de arriba de una vez.</p>

        <div class="stack" style="gap:0">
          ${raw(prop.dentro.map(function (x, i) {
            return html`
              <div class="rt-item" style="border-top:${raw(i ? '1px solid var(--line)' : '0')}">
                <img src="${Data.img(x.ex, 0)}" alt="" loading="lazy">
                <div class="grow">
                  <div style="font-weight:600;font-size:.86rem">${i + 1}. ${x.ex.nameEs}</div>
                  <div class="tiny">${x.fila.sets} × ${x.fila.reps} · descanso
                    ${x.fila.rest}s${raw(x.porque
                      ? ' · <span style="color:var(--acc)">' + esc(x.porque) + '</span>' : '')}</div>
                </div>
              </div>`;
          }).join(''))}
        </div>

        ${raw(prop.fuera.length ? '<p class="tiny" style="margin:10px 0 0">Se ha descartado: ' +
          esc(prop.fuera.join('; ')) + '.</p>' : '')}

        <button class="btn primary block" data-a="aplicartoda" style="margin-top:12px">
          ${raw(icon('check'))} Dejar la rutina así</button>
        <p class="tiny" style="margin:7px 0 0">Se reemplazan los
        ${prop.dentro.length === 1 ? 'ejercicios' : 'ejercicios'} de esta rutina y se guarda.
        Tu historial no se toca.</p>
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
      fuera('Sesión reordenada');
      return;
    }

    if (acc === 'orden' || acc === 'descanso' || acc === 'series') {
      const k = dondeEsta(c.sobre || c.quitar || c.poner);
      if (k === -1) {
        fuera('Ya no está «' + (c.sobre || c.quitar || '') + '» en la rutina.');
        return;
      }
      const nombre = (Data.get(draft.exercises[k].exId) || {}).nameEs || '';

      if (acc === 'orden') {
        const destino = Math.max(0, Math.min(draft.exercises.length - 1,
          (Number(c.posicion) || 1) - 1));
        const movido = draft.exercises.splice(k, 1)[0];
        draft.exercises.splice(destino, 0, movido);
        guardar();
        fuera(nombre + ' pasa al ' + (destino + 1) + '.º');
        return;
      }

      if (acc === 'descanso') {
        const seg = Math.max(0, Math.min(600, Number(c.rest) || 0));
        if (!seg) { fuera('Ese cambio no dice cuánto descanso poner.'); return; }
        draft.exercises[k].rest = seg;
        guardar();
        fuera(nombre + ': descanso a ' + seg + 's');
        return;
      }

      const series = Math.max(1, Math.min(15, Number(c.series) || 0));
      if (!series) { fuera('Ese cambio no dice cuántas series poner.'); return; }
      draft.exercises[k].sets = series;
      guardar();
      fuera(nombre + ': ' + series + ' series');
      return;
    }

    if (acc === 'quitar') {
      const k = dondeEsta(c.quitar);
      if (k === -1) { fuera('Ya no está «' + (c.quitar || '') + '» en la rutina.'); return; }
      if (draft.exercises.length <= Store.MINIMO_EJERCICIOS) {
        UI.toast('La rutina se quedaría por debajo del mínimo de ' +
          Store.MINIMO_EJERCICIOS + ' ejercicios.');
        return;
      }
      const nombre = (Data.get(draft.exercises[k].exId) || {}).nameEs || '';
      draft.exercises.splice(k, 1);
      guardar();
      fuera('Fuera ' + nombre);
      return;
    }

    /* por nombre exacto, que es como se le ofreció; el buscador solo de red */
    const nuevo = Data.porNombreEs(c.poner) ||
      (Data.search({ q: String(c.poner || ''), gear: Store.settings().gear }) || [])[0];
    if (!nuevo) { fuera('No encuentro «' + (c.poner || '') + '» en el catálogo.'); return; }
    const aOjo = I18N.norm(nuevo.nameEs) !== I18N.norm(String(c.poner || ''));

    const claves = Programa.lesionesDe(Perfil.datos().lesiones);
    const patron = Alt.patron(nuevo);
    const prohibido = claves.some(function (k) {
      return (Programa.LESIONES[k].patronesFuera || []).indexOf(patron) !== -1;
    });
    if (prohibido) {
      fuera('«' + nuevo.nameEs + '» no encaja con tus limitaciones.');
      return;
    }

    if (acc === 'anadir') {
      if (draft.exercises.some(function (e) { return e.exId === nuevo.id; })) {
        fuera('«' + nuevo.nameEs + '» ya está en la rutina.');
        return;
      }
      const modelo = draft.exercises[draft.exercises.length - 1] || {};
      draft.exercises.push({
        exId: nuevo.id,
        sets: Math.min(15, Number(c.series) || modelo.sets || 3),
        reps: Math.min(200, Number(c.reps) || modelo.reps || 12),
        weight: 0,
        rest: modelo.rest || 75,
        note: 'Lo mete el entrenador: ' + (c.porque || '')
      });
      guardar();
      fuera(aOjo ? 'Pedía «' + c.poner + '»; he puesto ' + nuevo.nameEs
        : 'Entra ' + nuevo.nameEs);
      return;
    }

    const k = dondeEsta(c.quitar);
    if (k === -1) { fuera('Ya no está «' + (c.quitar || '') + '» en la rutina.'); return; }
    const antes = (Data.get(draft.exercises[k].exId) || {}).nameEs || '';
    draft.exercises[k].exId = nuevo.id;
    draft.exercises[k].note = 'Cambiado a propuesta del entrenador: ' + (c.porque || '');
    guardar();
    fuera(aOjo ? 'Pedía «' + c.poner + '»; he puesto ' + nuevo.nameEs
      : nuevo.nameEs + ' en lugar de ' + antes);
  }

  function viewRutina() {
    if (route.arg === 'nueva') draft = Store.newRoutine();
    else {
      const r = Store.routine(route.arg);
      if (!r) return '<div class="empty"><p>Rutina no encontrada.</p></div>';
      draft = JSON.parse(JSON.stringify(r));
    }

    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">${raw(icon('back'))} Volver</button>
      <h1>${draft.id ? 'Editar rutina' : 'Nueva rutina'}</h1>

      <div class="card">
        <label class="tiny">NOMBRE DE LA RUTINA</label>
        <div class="tiny" style="margin:2px 0 0">El que te sirva a ti para reconocerla de un
        vistazo: «Pierna dura», «Lunes de espalda», «La corta de casa»…</div>
        <input id="r-name" value="${draft.name}" placeholder="Ponle nombre"
               style="margin:6px 0 12px">
        <label class="tiny">NOTAS (opcional)</label>
        <textarea id="r-note" rows="2" placeholder="Objetivo, progresión, recordatorios…"
                  style="margin:5px 0 12px">${draft.note || ''}</textarea>
        <label class="tiny">DÍAS DE LA SEMANA</label>
        <div class="row wrap" style="gap:6px;margin-top:6px">
          ${raw(dias.map(function (d) {
            return '<button class="chip ' + ((draft.days || []).indexOf(d) !== -1 ? 'on' : '') +
                   '" data-day="' + d + '">' + UI.diaLargo(d) + '</button>';
          }).join(''))}
        </div>

        <div class="hr"></div>
        <div class="row between" style="align-items:flex-start;gap:12px">
          <div class="grow">
            <b style="font-size:.92rem">Rutina mixta</b>
            <div class="tiny">Apagado, la rutina se queda en su zona${raw(zonaBorrador()
              ? ' (' + esc(zonaBorrador().label.toLowerCase()) + ')' : '')} y avisa si metes
              un ejercicio de otra. Enciéndelo para mezclar tren superior e inferior.</div>
          </div>
          <button class="sw ${draft.mixta ? 'on' : ''}" data-a="mixta"
                  role="switch" aria-checked="${!!draft.mixta}" aria-label="Rutina mixta"></button>
        </div>
      </div>

      <div class="list-head">
        <span class="list-title">Ejercicios (${draft.exercises.length})</span>
        <button class="btn sm primary" data-a="add">${raw(icon('plus'))} Añadir</button>
      </div>
      <p class="tiny" style="margin:-4px 0 10px">${raw(draft.exercises.length < Store.MINIMO_EJERCICIOS
        ? 'Te faltan ' + (Store.MINIMO_EJERCICIOS - draft.exercises.length) +
          ' para llegar al mínimo de ' + Store.MINIMO_EJERCICIOS + '.'
        : 'Puedes añadir los que quieras y cambiar cualquiera por otro. Quitar, hasta ' +
          'dejarla en ' + Store.MINIMO_EJERCICIOS + '.')}</p>

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
                            aria-label="Subir">${raw(icon('up'))}</button>
                    <button class="btn icon sm" data-down="${i}"
                            ${i === draft.exercises.length - 1 ? 'disabled' : ''}
                            aria-label="Bajar">${raw(icon('down'))}</button>
                    <button class="btn icon sm" data-cambiar="${i}"
                            aria-label="Cambiar por otro">${raw(icon('cambiar'))}</button>
                    <button class="btn icon sm danger" data-del="${i}"
                            aria-label="Quitar">${raw(icon('trash'))}</button>
                  </div>
                </div>
                <div class="row" style="margin-top:10px;gap:8px">
                  <div class="grow"><div class="tiny">Series</div>
                    <input type="number" min="1" max="15" value="${re.sets}" data-i="${i}" data-f="sets"
                           style="text-align:center"></div>
                  <div class="grow"><div class="tiny">Reps</div>
                    <input type="number" min="1" max="200" value="${re.reps}" data-i="${i}" data-f="reps"
                           style="text-align:center"></div>
                  <div class="grow"><div class="tiny">Descanso (s)</div>
                    <input type="number" min="0" max="600" step="15" value="${re.rest}" data-i="${i}" data-f="rest"
                           style="text-align:center"></div>
                </div>
              </div>`;
          }).join(''))}
        </div>` : html`
        <div class="card center">
          <p class="muted">Esta rutina todavía no tiene ejercicios.</p>
          <button class="btn primary" data-a="add">${raw(icon('plus'))} Añadir el primero</button>
        </div>`)}

      <div class="row" style="margin-top:16px">
        <button class="btn primary grow" data-a="guardar">${raw(icon('check'))} Guardar</button>
        ${raw(draft.id ? html`
          <button class="btn icon" data-a="dup" aria-label="Duplicar">${raw(icon('copy'))}</button>
          <button class="btn icon danger" data-a="borrar" aria-label="Borrar">${raw(icon('trash'))}</button>` : '')}
      </div>
      ${raw(draft.id && draft.exercises.length ? html`
        <button class="btn block" data-a="entrenar" style="margin-top:8px">
          ${raw(icon('play'))} Guardar y entrenar ahora</button>` : '')}

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
      if (!draft.name) draft.name = 'Rutina sin nombre';
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
      if (!draft.name) draft.name = 'Rutina sin nombre';

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
      if (!IA.activa()) { go('claves'); UI.toast('Elige proveedor de IA y pon su clave'); return; }
      const r = autoguardar();
      if (!r) { UI.toast('Guárdala antes de pasarla por la IA'); return; }
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
      if (!prop) { UI.toast('Esa propuesta ya no se puede aplicar.'); return; }
      UI.confirm('Dejar la rutina así',
        'Se sustituyen los ' + draft.exercises.length + ' ejercicios de ahora por los ' +
        prop.dentro.length + ' que propone. Lo que ya entrenaste sigue en tu historial.',
        'Reemplazar').then(function (ok) {
        if (!ok) return;
        draft.exercises = prop.dentro.map(function (x) { return x.fila; });
        autoguardar();
        revIA.datos.cambios = [];
        const pos = window.scrollY;
        render();
        window.scrollTo(0, pos);
        UI.toast('Rutina rehecha con ' + prop.dentro.length + ' ejercicios');
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
        UI.toast('Una rutina no baja de ' + Store.MINIMO_EJERCICIOS +
          ' ejercicios. Cámbialo por otro en vez de quitarlo.');
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
      UI.toast('Cambiado por ' + ex.nameEs);
    }

    /* Una rutina de brazo con un ejercicio de pierna: o es mixta, o no entra */
    function preguntarMixta(ex, alSeguir) {
      const zona = zonaDeRutina(draft);
      UI.confirm('Eso es de otra zona',
        '«' + ex.nameEs + '» no es de ' + (zona ? zona.label.toLowerCase() : 'esta zona') +
        '. Puedo marcar la rutina como mixta y meterlo igual.',
        'Marcar mixta y añadir').then(function (ok) {
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
      UI.toast('Rutina guardada');
      go('rutinas');
    });

    bind(root, '[data-a=entrenar]', function () {
      const r = guardar();
      empezar(r.id);
    });

    bind(root, '[data-a=dup]', function () {
      guardar();
      const copia = Store.duplicateRoutine(draft.id);
      UI.toast('Rutina duplicada');
      go('rutina', copia.id);
    });

    bind(root, '[data-a=borrar]', function () {
      UI.confirm('Borrar rutina',
        'Se eliminará «' + (draft.name || 'esta rutina') + '». Los entrenamientos ya registrados se conservan.',
        'Borrar', true).then(function (ok) {
        if (ok) { Store.deleteRoutine(draft.id); UI.toast('Rutina borrada'); go('rutinas'); }
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
      }).join('') || '<p class="muted">Sin resultados</p>';

      el.querySelectorAll('[data-p]').forEach(function (b) {
        b.onclick = function () { onPick(Data.get(b.dataset.p)); };
      });

      const info = el.querySelector('#pick-info');
      const gset = Data.GEAR[Store.settings().gear];
      if (info) {
        info.textContent = todo || !gset
          ? 'Mostrando el catálogo completo'
          : 'Solo lo que puedes hacer ' + Data.gearFrase(Store.settings().gear);
      }
      const btnAll = el.querySelector('[data-pickall]');
      if (btnAll) {
        btnAll.classList.toggle('on', todo);
        btnAll.textContent = todo ? 'Solo mi material' : 'Ver todo el catálogo';
        btnAll.onclick = function () { todo = !todo; pinta(el); };
      }
    }

    UI.modal(html`
      <h2>Añadir ejercicio</h2>
      <div class="search-wrap" style="margin-bottom:10px">
        ${raw(icon('search'))}
        <input id="pick-q" type="search" placeholder="Buscar ejercicio…" autocomplete="off">
      </div>
      <div class="pill-scroll" style="padding-left:0;margin-left:0">
        <button class="chip on" data-g="">Todos</button>
        ${raw(I18N.GROUPS.map(function (gr) {
          return '<button class="chip" data-g="' + gr.id + '">' + esc(gr.label) + '</button>';
        }).join(''))}
      </div>
      <div class="row between" style="margin:2px 0 8px">
        <span class="tiny" id="pick-info"></span>
        <button class="chip" data-pickall>Ver todo</button>
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
        <p>No hay ningún entrenamiento en curso.</p>
        <button class="btn primary" data-a="ir">Elegir una rutina</button></div>`;
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

  function viewAjustes() {
    const s = Store.settings();
    return html`
      <h1>Ajustes</h1>

      <div class="card">
        <label class="tiny">TU NOMBRE</label>
        <input id="s-name" value="${s.name}" placeholder="¿Cómo te llamas?" style="margin-top:5px">
      </div>

      <div class="card">
        <div class="row between">
          <div class="grow">
            <b>Dónde entrenas</b>
            <div class="tiny">${raw(Data.GEAR[s.gear]
              ? esc(Data.GEAR[s.gear].label) + ' · ' + UI.num(cuantosEn(s.gear)) + ' ejercicios'
              : 'Sin elegir')}</div>
          </div>
          <button class="btn sm" data-a="lugar2">Cambiar</button>
        </div>
      </div>

      <div class="list-title">Cómo registras las series</div>
      <div class="list">
        <button class="list-row tap" data-reg="detallado">
          <span class="row-icon">${raw(icon('grafica'))}</span>
          <div class="grow">
            <div class="list-row-title">Peso y repeticiones</div>
            <div class="list-row-sub">Anotas cada serie. Necesario para los récords,
              el volumen y las gráficas de progreso.</div>
          </div>
          ${raw(s.registro === 'detallado' ? '<span class="chip solid">' + icon('check') + '</span>' : '')}
        </button>
        <button class="list-row tap" data-reg="simple">
          <span class="row-icon">${raw(icon('check'))}</span>
          <div class="grow">
            <div class="list-row-title">Marcar cada serie</div>
            <div class="list-row-sub">Te propongo el objetivo (por ejemplo 3 × 12) y solo
              marcas las series que vas haciendo. El peso queda opcional.</div>
          </div>
          ${raw(s.registro === 'simple' ? '<span class="chip solid">' + icon('check') + '</span>' : '')}
        </button>
        <button class="list-row tap" data-reg="ejercicio">
          <span class="row-icon">${raw(icon('flag'))}</span>
          <div class="grow">
            <div class="list-row-title">Marcar el ejercicio y ya</div>
            <div class="list-row-sub">Un botón por ejercicio. Ni peso, ni repeticiones,
              ni series: lo haces y lo das por hecho.</div>
          </div>
          ${raw(s.registro === 'ejercicio' ? '<span class="chip solid">' + icon('check') + '</span>' : '')}
        </button>
      </div>
      ${raw(s.registro !== 'detallado'
        ? '<p class="tiny" style="margin:8px 0 0">Sin peso anotado no hay récords ni ' +
          'volumen; el progreso se mide por series y entrenamientos completados.</p>' : '')}

      <div class="list-title">Qué vas marcando</div>
      <div class="list">
        ${raw(filaSiNo('nutricion', 'Registrar cuando como',
          'En el menú, cada plato lleva «me lo comí» y «comí otra cosa». Lo que marques ' +
          'entra en el recuento del día.', 'registroComida', s.registroComida !== 'no'))}
        ${raw(filaSiNo('gota', 'Marcar cuando bebo agua',
          'Cada toma de la pauta es una casilla, y el total del día sale de lo que ' +
          'marcas en vez de lo que deberías.', 'registroAgua', s.registroAgua !== 'no'))}
      </div>
      <p class="tiny" style="margin:8px 0 0">Apagarlos no borra nada de lo que ya llevas
      apuntado: solo quita las casillas de en medio.</p>

      <div class="card">
        <div class="row between"><span>Unidad de peso</span>
          <div class="row" style="gap:6px">
            <button class="chip ${s.unit === 'kg' ? 'on' : ''}" data-unit="kg">kg</button>
            <button class="chip ${s.unit === 'lb' ? 'on' : ''}" data-unit="lb">lb</button>
          </div>
        </div>
        <div class="hr"></div>
        <div class="row between"><span>Tema</span>
          <div class="row" style="gap:6px">
            <button class="chip ${s.theme === 'light' ? 'on' : ''}" data-theme="light">Claro</button>
            <button class="chip ${s.theme === 'dark' ? 'on' : ''}" data-theme="dark">Oscuro</button>
            <button class="chip ${s.theme === 'auto' ? 'on' : ''}" data-theme="auto">Sistema</button>
          </div>
        </div>
        <div class="hr"></div>
        <div class="row between"><span>Descanso por defecto</span>
          <div class="row" style="gap:6px;max-width:130px">
            <input id="s-rest" type="number" min="0" max="600" step="15" value="${s.rest}"
                   style="text-align:center"><span class="tiny nowrap">seg</span>
          </div>
        </div>
        <div class="hr"></div>
        <div class="row between"><span>Cada cuánto cambia la frase del entrenador</span>
          <div class="row" style="gap:6px;max-width:130px">
            <input id="s-pildora" type="number" min="1" max="24" step="1"
                   value="${IA.horasPildora ? IA.horasPildora() : 6}"
                   style="text-align:center"><span class="tiny nowrap">h</span>
          </div>
        </div>
        <div class="hr"></div>
        <div class="row between"><span>Aviso sonoro al terminar el descanso</span>
          <button class="chip ${s.sound ? 'on' : ''}" data-a="sound">${s.sound ? 'Activado' : 'Apagado'}</button>
        </div>
      </div>

      <div class="list-title">Claves y conexiones</div>
      <div class="list">
        <div class="list-row tap" data-a="claves">
          <span class="row-icon">${raw(icon('llave'))}</span>
          <div class="grow">
            <div class="list-row-title">Bóveda de claves</div>
            <div class="list-row-sub">${resumenClaves()}</div>
          </div>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </div>
      </div>

      <div class="list-title">Mi cuenta</div>
      <div class="list">
        <div class="list-row tap" data-a="ircuenta">
          <span class="row-icon">${raw(icon('nube'))}</span>
          <div class="grow">
            <div class="list-row-title">Sincronización</div>
            <div class="list-row-sub">${raw(Sync.activa() ? esc(Sync.email())
              : 'Entra con tu correo para tenerlo todo en cada dispositivo')}</div>
          </div>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </div>
      </div>

      <div class="list-title">Copia de seguridad</div>
      <div class="card">
        <p class="muted">Tus rutinas y tu historial se guardan solo en este navegador. Exporta un archivo
        para conservarlos o para llevarlos a otro dispositivo.</p>
        <div class="row">
          <button class="btn grow" data-a="export">${raw(icon('down'))} Exportar</button>
          <button class="btn grow" data-a="import">${raw(icon('up'))} Importar</button>
        </div>
        <input type="file" id="s-file" accept="application/json,.json" hidden>
      </div>

      <div class="list-title">Uso sin conexión</div>
      <div class="card">
        <p class="muted">Descarga las imágenes de los ejercicios y la app funcionará entera
        sin internet: en el gimnasio sin cobertura, en el metro o sin datos.</p>
        <div class="tiny" id="dl-estado">Comprobando lo que ya tienes guardado…</div>
        <div class="dl" id="dl-barra" hidden><i></i></div>
        <div class="stack" style="margin-top:10px">
          <button class="btn" data-dl="rutinas">Descargar mis rutinas</button>
          <button class="btn" data-dl="esenciales">Descargar los ejercicios principales</button>
          <button class="btn" data-dl="todos">Descargar el catálogo completo</button>
          <button class="btn ghost sm" data-dl="vaciar">Liberar espacio</button>
        </div>
      </div>

      <div class="list-title">Versión de la app</div>
      <div class="card">
        <p class="muted">Si algo se comporta raro después de una actualización, casi siempre
        es que el móvil se ha quedado con archivos de dos versiones distintas. Esto lo borra
        todo y vuelve a bajar la última. Tus datos no se tocan.</p>
        <div class="tiny" id="sw-version">Comprobando la versión…</div>
        <button class="btn block" data-a="actualizarApp" style="margin-top:10px">
          ${raw(icon('down'))} Forzar actualización</button>
      </div>

      <div class="list-title">Instalar en el móvil</div>
      <div class="card">
        <p class="muted">Training FR funciona como una app: ábrela en el navegador del móvil y usa
        <b>«Añadir a la pantalla de inicio»</b> (en Android, desde el menú del navegador; en iPhone, desde el botón Compartir).
        Después arranca a pantalla completa y funciona sin conexión.</p>
        <button class="btn primary block" data-a="install" hidden id="btn-install">Instalar aplicación</button>
      </div>

      <div class="list-title">Zona peligrosa</div>
      <div class="card">
        <button class="btn danger block" data-a="wipe">${raw(icon('trash'))} Borrar todos mis datos</button>
      </div>

      <p class="tiny" style="margin-top:22px">
        Training FR · Catálogo de ejercicios de
        <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener noreferrer">free-exercise-db</a>
        (dominio público) y
        <a href="https://repdb.co" target="_blank" rel="noopener noreferrer">RepDB (repdb.co)</a>,
        que es de donde salen los nombres y las instrucciones escritos en
        español.<br>Tus datos se quedan en tu dispositivo salvo que
        actives la sincronización con tu correo.
      </p>`;
  }

  viewAjustes.mount = function (root) {
    bind(root, '[data-a=lugar2]', lugarSheet);
    bind(root, '[data-a=claves]', function () { go('claves'); });
    bind(root, '[data-a=ircuenta]', function () { go('cuenta'); });

    /* --- descarga para uso sin conexión --- */
    const estadoEl = root.querySelector('#dl-estado');
    const barra = root.querySelector('#dl-barra');

    function pintarEstado() {
      Offline.estado().then(function (e) {
        estadoEl.textContent = e.guardadas
          ? e.guardadas + ' imágenes guardadas (~' + e.mb + ' MB). Esos ejercicios ya funcionan sin internet.'
          : 'Todavía no has guardado ninguna imagen.';
      }).catch(function () {
        estadoEl.textContent = 'Este navegador no permite guardar contenido sin conexión.';
      });
    }
    pintarEstado();

    bindAll(root, '[data-dl]', function (el) {
      const modo = el.dataset.dl;

      if (modo === 'vaciar') {
        UI.confirm('Liberar espacio',
          'Se borrarán las imágenes guardadas. La app seguirá funcionando con internet.',
          'Liberar', true).then(function (ok) {
          if (ok) Offline.vaciar().then(pintarEstado).then(function () { UI.toast('Espacio liberado'); });
        });
        return;
      }

      const exs = modo === 'rutinas' ? Offline.deMisRutinas()
        : modo === 'esenciales' ? Offline.esenciales() : Offline.todos();
      const urls = Offline.urlsDe(exs);

      if (!urls.length) {
        UI.toast(modo === 'rutinas' ? 'Aún no tienes rutinas que descargar' : 'Nada que descargar');
        return;
      }

      const mb = Math.round(urls.length * 55 / 1024);
      const seguir = modo === 'todos'
        ? UI.confirm('Descargar el catálogo completo',
            urls.length + ' imágenes, unos ' + mb + ' MB. Mejor con wifi.', 'Descargar')
        : Promise.resolve(true);

      seguir.then(function (ok) {
        if (!ok) return;
        const botones = root.querySelectorAll('[data-dl]');
        botones.forEach(function (b) { b.disabled = true; });
        barra.hidden = false;
        const relleno = barra.querySelector('i');

        Offline.descargar(urls, function (hechas, total) {
          relleno.style.width = Math.round(hechas / total * 100) + '%';
          estadoEl.textContent = 'Descargando ' + hechas + ' de ' + total + '…';
        }).then(function (r) {
          UI.toast(r.fallos
            ? 'Descarga terminada (' + r.fallos + ' no se pudieron guardar)'
            : 'Listo: ya puedes entrenar sin internet');
          barra.hidden = true;
          relleno.style.width = '0%';
          botones.forEach(function (b) { b.disabled = false; });
          pintarEstado();
        }).catch(function () {
          UI.toast('No se pudo completar la descarga');
          barra.hidden = true;
          botones.forEach(function (b) { b.disabled = false; });
        });
      });
    });

    /* qué versión sirve el service worker ahora mismo */
    const cajaVer = root.querySelector('#sw-version');
    if (cajaVer) {
      estadoVersion().then(function (v) {
        if (!v) { cajaVer.textContent = 'Sin conexión para comprobarlo.'; return; }
        cajaVer.textContent = v.alDia
          ? 'Estás en la última versión (' + v.local + ').'
          : 'Tienes ' + (v.local || 'sin caché') + ' y la última es ' +
            (v.servidor || '?') + '. Pulsa el botón.';
      });
    }

    bind(root, '[data-a=actualizarApp]', function (el) {
      el.disabled = true;
      el.textContent = 'Actualizando…';
      forzarActualizacion();
    });

    root.querySelector('#s-name').onchange = function (e) {
      Store.setSetting('name', e.target.value.trim());
    };
    root.querySelector('#s-rest').onchange = function (e) {
      Store.setSetting('rest', Math.max(0, Number(e.target.value) || 90));
    };
    bindAll(root, '[data-reg]', function (el) {
      Store.setSetting('registro', el.dataset.reg);
      render();
      UI.toast(el.dataset.reg === 'simple' ? 'Ahora solo marcarás las series como hechas'
        : el.dataset.reg === 'ejercicio' ? 'Ahora marcas el ejercicio entero de un toque'
        : 'Ahora anotarás peso y repeticiones');
    });
    bindAll(root, '[data-sino]', function (el) {
      Store.setSetting(el.dataset.sino, el.dataset.val);
      render();
      UI.toast(el.dataset.val === 'si' ? 'Lo irás marcando' : 'Sin casillas de por medio');
    });
    bindAll(root, '[data-unit]', function (el) { Store.setSetting('unit', el.dataset.unit); render(); });
    bindAll(root, '[data-theme]', function (el) {
      Store.setSetting('theme', el.dataset.theme);
      aplicarTema();
      render();
    });
    const campoPildora = root.querySelector('#s-pildora');
    if (campoPildora) campoPildora.onchange = function () {
      const n = Math.min(24, Math.max(1, Number(campoPildora.value) || 6));
      campoPildora.value = n;
      Store.setSetting('pildoraHoras', n);
      UI.toast('La frase cambiará cada ' + n + (n === 1 ? ' hora' : ' horas'));
    };

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
      UI.toast('Copia descargada');
    });

    const file = root.querySelector('#s-file');
    bind(root, '[data-a=import]', function () { file.click(); });
    file.onchange = function () {
      const f = file.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () {
        UI.confirm('Importar copia',
          'Se reemplazarán las rutinas y el historial actuales por los del archivo.',
          'Importar', true).then(function (ok) {
          if (!ok) return;
          try {
            Store.importJSON(reader.result);
            aplicarTema();
            UI.toast('Datos importados');
            go('inicio');
          } catch (e) {
            UI.toast('El archivo no es válido');
          }
        });
      };
      reader.readAsText(f);
    };

    bind(root, '[data-a=wipe]', function () {
      UI.confirm('Borrar todo',
        'Se eliminarán rutinas, entrenamientos y ajustes de este dispositivo. No se puede deshacer.',
        'Borrar todo', true).then(function (ok) {
        if (ok) { Store.wipe(); aplicarTema(); go('inicio'); UI.toast('Datos borrados'); }
      });
    });

    if (deferredPrompt) {
      const b = root.querySelector('#btn-install');
      b.hidden = false;
      b.onclick = function () {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () { deferredPrompt = null; b.hidden = true; });
      };
    }
  };

  /* Qué servicios están ya configurados, para la fila de la bóveda */
  function resumenClaves() {
    const puestas = [];
    if (g.IA && IA.activa()) puestas.push(IA.proveedorActual().label);
    if (g.Spotify && Spotify.configurado()) puestas.push('Spotify');
    if (Sync.configurado()) puestas.push('Supabase');
    return puestas.length ? puestas.join(' · ') : 'IA, Spotify y sincronización';
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
        <div class="card">
          <p class="muted">Entra con tu correo y tus rutinas, tu historial y tus marcas
          estarán en todos tus dispositivos. Sin contraseñas: recibes un enlace y ya está.</p>
        </div>

        <div class="list-title">¿Por dónde empezamos?</div>
        <div class="list">
          <button class="list-row tap" data-alta="tengo">
            <span class="row-icon">${raw(icon('correo'))}</span>
            <div class="grow">
              <div class="list-row-title">Ya tengo cuenta</div>
              <div class="list-row-sub">Uso la app en otro dispositivo. Conecto este y listo.</div>
            </div>
            <span class="chevron">${raw(icon('chevron'))}</span>
          </button>
          <button class="list-row tap" data-alta="nueva">
            <span class="row-icon">${raw(icon('nube'))}</span>
            <div class="grow">
              <div class="list-row-title">Es mi primera vez</div>
              <div class="list-row-sub">Creo la base de datos gratuita. Una vez, cinco minutos.</div>
            </div>
            <span class="chevron">${raw(icon('chevron'))}</span>
          </button>
        </div>`;
    }

    /* 2. configurado pero sin sesión: entrar o crear la cuenta */
    if (!Sync.activa()) {
      return html`
        <div class="card">
          <div class="row" style="gap:6px;margin-bottom:14px">
            <button class="chip ${accesoModo === 'entrar' ? 'on' : ''}" data-acceso="entrar">Entrar</button>
            <button class="chip ${accesoModo === 'crear' ? 'on' : ''}" data-acceso="crear">Crear cuenta</button>
          </div>

          <label class="tiny">CORREO</label>
          <input id="sync-mail" type="email" inputmode="email" autocomplete="email"
                 placeholder="tucorreo@ejemplo.com" style="margin:5px 0 10px">

          <label class="tiny">CONTRASEÑA</label>
          <div class="secreto">
            <input id="sync-pass" type="password"
                   autocomplete="${accesoModo === 'crear' ? 'new-password' : 'current-password'}"
                   placeholder="${accesoModo === 'crear' ? 'Al menos 8 caracteres' : 'Tu contraseña'}">
            <button class="btn sm" data-ver="sync-pass" aria-label="Mostrar u ocultar">
              ${raw(icon('ojo'))}</button>
          </div>

          <button class="btn primary block" data-a="${accesoModo === 'crear' ? 'crearCuenta' : 'entrarClave'}"
                  style="margin-top:14px">
            ${accesoModo === 'crear' ? 'Crear cuenta y sincronizar' : 'Entrar'}
          </button>

          <p class="tiny" style="margin-top:10px">${raw(accesoModo === 'crear'
            ? 'Usa el mismo correo y contraseña en tus demás dispositivos y tendrás lo mismo en todos.'
            : 'Si es tu primera vez, pulsa Crear cuenta.')}</p>
        </div>

        <button class="guia-tit" data-a="verCorreo">${raw(icon('chevron'))}
          Prefiero entrar con un enlace al correo</button>
        <div class="guia" id="via-correo" hidden>
          <div class="card">
            <p class="tiny">Sin contraseña: te llega un enlace y entras al pulsarlo.
            El correo que trae Supabase de serie solo permite <b>dos mensajes por hora</b>,
            así que si lo agotas tendrás que esperar.</p>
            <input id="mail-enlace" type="email" inputmode="email" placeholder="tucorreo@ejemplo.com"
                   autocomplete="email" style="margin:10px 0">
            <button class="btn block" data-a="enviarenlace">
              ${raw(icon('correo'))} Enviarme el enlace</button>

            <div class="hr"></div>
            <p class="tiny">Si el enlace se abre en otro navegador en vez de en la app,
            cópialo del correo y pégalo aquí.</p>
            <input id="link-acceso" placeholder="Pega el enlace del correo" autocomplete="off"
                   spellcheck="false" style="margin:8px 0 10px">
            <button class="btn block sm" data-a="usarLinkAcceso">Entrar con ese enlace</button>
          </div>
        </div>

        <button class="btn ghost sm block" data-a="configsync" style="margin-top:12px">
          Cambiar la configuración de Supabase</button>`;
    }

    /* 3. sesión abierta */
    const tieneClave = Store.settings().tieneClave === true;
    const ultimo = Sync.ultimoSync();
    return html`
      <div class="card">
        <div class="row between">
          <div class="grow">
            <div style="font-weight:700">${Sync.email()}</div>
            <div class="tiny">${ultimo ? 'Última sincronización: ' + UI.fecha(ultimo)
              : 'Todavía sin sincronizar'}</div>
          </div>
          <span class="chip solid">Conectado</span>
        </div>
        <div class="row" style="margin-top:11px">
          <button class="btn grow" data-a="sincronizar">${raw(icon('nube'))} Sincronizar ahora</button>
          <button class="btn icon" data-a="salir" aria-label="Cerrar sesión">${raw(icon('salir'))}</button>
        </div>
        <p class="tiny" style="margin-top:9px">Los cambios se suben solos. En otro dispositivo,
        entra con este mismo correo y lo tendrás todo.</p>
      </div>

      <div class="list-title">Cuenta</div>
      <div class="list">
        <button class="list-row tap" data-a="verClave">
          <span class="row-icon">${raw(icon('llave'))}</span>
          <div class="grow">
            <div class="list-row-title">${tieneClave ? 'Cambiar contraseña' : 'Poner contraseña'}</div>
            <div class="list-row-sub">${raw(tieneClave
              ? 'Ya tienes una: con ella entras en cualquier dispositivo'
              : 'Sin contraseña solo puedes entrar con enlaces por correo')}</div>
          </div>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>

      <div class="card" id="caja-clave" hidden style="margin-top:11px">
        <label class="tiny">${tieneClave ? 'NUEVA CONTRASEÑA' : 'CONTRASEÑA'}</label>
        <div class="secreto">
          <input id="pass-nueva" type="password" autocomplete="new-password"
                 placeholder="Al menos 8 caracteres">
          <button class="btn sm" data-ver="pass-nueva" aria-label="Mostrar u ocultar">
            ${raw(icon('ojo'))}</button>
        </div>

        <label class="tiny" style="display:block;margin-top:10px">REPÍTELA</label>
        <div class="secreto">
          <input id="pass-repe" type="password" autocomplete="new-password"
                 placeholder="La misma otra vez">
          <button class="btn sm" data-ver="pass-repe" aria-label="Mostrar u ocultar">
            ${raw(icon('ojo'))}</button>
        </div>

        <button class="btn primary block" data-a="guardarClave" style="margin-top:14px">
          Guardar contraseña</button>
        <p class="tiny" style="margin:10px 0 0">Solo viaja a tu proyecto de Supabase, que la
        guarda cifrada.</p>
      </div>

      <div class="card" id="sync-estado"></div>

      <div class="list-title">Si algo no cuadra</div>
      <div class="list">
        <button class="list-row tap" data-a="forzarBajar">
          <span class="row-icon">${raw(icon('down'))}</span>
          <div class="grow">
            <div class="list-row-title">Traer lo de la nube</div>
            <div class="list-row-sub">Reemplaza lo de este dispositivo por lo guardado</div>
          </div>
        </button>
        <button class="list-row tap" data-a="forzarSubir">
          <span class="row-icon">${raw(icon('up'))}</span>
          <div class="grow">
            <div class="list-row-title">Subir lo de este dispositivo</div>
            <div class="list-row-sub">Reemplaza lo de la nube por lo de aquí</div>
          </div>
        </button>
      </div>
      <p class="tiny" style="margin-top:8px">Úsalos solo si la sincronización automática se
      ha quedado con la versión equivocada.</p>`;
  }

  function viewCuenta() {
    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <h1>Mi cuenta</h1>
      <p class="muted">Entra con tu correo y la app queda igual en todos tus dispositivos:
      rutinas, historial, perfil, objetivos, alertas y ajustes.</p>

      ${raw(vistaCuenta())}

      ${raw(Sync.activa() ? html`
        <div class="list-title">Qué se sincroniza</div>
        <div class="list">
          ${raw(filaSync('dumbbell', 'Rutinas', Store.routines().length))}
          ${raw(filaSync('grafica', 'Entrenamientos', Store.sessions().length))}
          ${raw(filaSync('trofeo', 'Objetivos', Objetivos.lista().length))}
          ${raw(filaSync('campana', 'Alertas', Alertas.lista().length))}
          ${raw(filaSync('nutricion', 'Menús de comida',
            (g.Menus && Menus.lista().length) || 'Sin generar'))}
          ${raw(filaSync('perfil', 'Perfil y hábitos', Perfil.completo() ? 'Completo' : 'Sin completar'))}
          ${raw(filaSync('llave', 'Claves de IA y Spotify',
            Sync.sincronizaClaves() ? 'Incluidas' : 'Solo en este dispositivo'))}
        </div>
        <p class="tiny" style="margin-top:10px">No hay que pulsar nada: lo que cambies sube
        solo unos segundos después, y lo que cambies en otro dispositivo baja al abrir la app,
        al volver a ella y cada minuto y medio mientras la tengas delante. Si falla, se
        reintenta solo.</p>` : '')}

      ${raw(Sync.configurado() && !Sync.activa() ? html`
        <div id="aviso-alta"></div>

        <div class="card" style="margin-top:12px">
          <div style="font-weight:600;margin-bottom:4px">Cómo funciona</div>
          <ol class="instr" style="margin-top:8px">
            <li>Escribes tu correo y tu contraseña, los mismos en todos tus dispositivos.</li>
            <li>Al entrar se descarga lo que tengas en la nube y se une con lo de aquí.</li>
            <li>A partir de ahí, cada cambio sube solo unos segundos después.</li>
          </ol>
          <p class="tiny" style="margin:0">Si prefieres entrar sin contraseña, tienes la
          opción del enlace por correo debajo.</p>
        </div>` : '')}`;
  }

  /* Estado de la sincronización, en vivo: sin esto no hay forma de saber si de
     verdad ha subido algo o lleva media hora fallando en silencio. */
  function estadoSyncHTML() {
    const e = Sync.estado();
    const hace = function (t) {
      if (!t) return 'nunca';
      const s = Math.round((Date.now() - t) / 1000);
      if (s < 60) return 'hace un momento';
      if (s < 3600) return 'hace ' + Math.round(s / 60) + ' min';
      if (s < 86400) return 'hace ' + Math.round(s / 3600) + ' h';
      return UI.fecha(t);
    };

    const mapa = {
      subiendo: { txt: 'Subiendo tus cambios…', tono: 'var(--acc)' },
      bajando: { txt: 'Buscando cambios de otros dispositivos…', tono: 'var(--acc)' },
      pendiente: { txt: 'Cambios pendientes de subir', tono: 'var(--warn)' },
      error: { txt: 'No se pudo sincronizar', tono: 'var(--bad)' },
      ok: { txt: 'Todo al día', tono: 'var(--acc)' },
      inactivo: { txt: 'Esperando el primer cambio', tono: 'var(--dim2)' }
    };
    const m = mapa[e.fase] || mapa.inactivo;

    return html`
      <div class="row between">
        <div class="row" style="gap:9px;align-items:center">
          <span class="punto-sync" style="background:${raw(m.tono)}"></span>
          <b>${m.txt}</b>
        </div>
        <button class="btn sm" data-a="sincronizarYa">Comprobar</button>
      </div>
      <div class="tiny" style="margin-top:6px">Última sincronización completa ${hace(e.ultimo)}.</div>
      ${raw(e.error ? '<div class="tiny" style="margin-top:4px;color:var(--bad)">' +
        esc(e.error) + '</div>' : '')}
      ${raw(e.pendiente ? '<div class="tiny" style="margin-top:4px">Hay cambios de este ' +
        'dispositivo esperando a subir. Se reintenta solo.</div>' : '')}`;
  }

  function filaSync(ico, titulo, valor) {
    return '<div class="list-row"><span class="row-icon">' + icon(ico) + '</span>' +
      '<div class="grow"><div class="list-row-title">' + esc(titulo) + '</div></div>' +
      '<span class="list-row-val">' + esc(String(valor)) + '</span></div>';
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
          <b>Aquí no se pueden crear cuentas nuevas</b>
          <p style="margin:8px 0 0;font-size:.9rem">${propia
            ? 'Tu proyecto de Supabase tiene cerrada el alta. Ábrela un momento en '
              + 'Authentication → Sign In / Providers → Allow new users to sign up, '
              + 'regístrate, y vuelve a cerrarla.'
            : 'La conexión que trae la app es la mía y está cerrada a propósito: si '
              + 'ya tienes cuenta, entra con tu correo aquí abajo. Si no la tienes, '
              + 'monta la tuya —es gratis, son diez minutos y los datos quedan en tu '
              + 'propia base de datos, no en la mía.'}</p>
          ${raw(propia ? '' :
            '<button class="btn primary block" data-a="montarbd" style="margin-top:11px">' +
            'Montar mi base de datos</button>')}
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
        UI.toast(r === 'igual' ? 'Ya estaba todo al día'
          : r === 'subido' ? 'Tus cambios están en la nube'
          : r === 'muy pronto' ? 'Comprobado hace un momento'
          : 'Datos actualizados');
        if (r === 'bajado' || r === 'fusionado') { aplicarTema(); render(); }
      }).catch(function (e) { pintarEstadoSync(); UI.toast(e.message); });
    };
  }

  /* Asistente de configuración: URL y clave del proyecto, más el SQL de la tabla */
  function configSyncSheet() {
    const c = Sync.config() || {};
    UI.modal(html`
      <h2>Activar la sincronización</h2>
      <p class="muted">Se hace una vez y es gratis. Guarda tus datos en tu propia base de datos.</p>

      <ol class="instr" style="margin:14px 0">
        <li>Entra en <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>,
          crea una cuenta y pulsa <b>New project</b>. Elige cualquier nombre y contraseña.</li>
        <li>Cuando termine, ve a <b>Project Settings → API</b> y copia la <b>Project URL</b>
          y la clave <b>anon public</b>.</li>
        <li>Ve a <b>SQL Editor</b>, pega el bloque de abajo y pulsa <b>Run</b>. Crea la tabla
          donde se guardan tus datos, protegida para que solo tú puedas verlos.</li>
        <li>Ve a <b>Authentication → URL Configuration</b> y añade esta dirección en
          <b>Redirect URLs</b>:<br><code class="tiny">${Sync.urlRetorno()}</code></li>
      </ol>

      <div class="row between" style="margin-bottom:6px">
        <span class="tiny">SQL PARA CREAR LA TABLA</span>
        <button class="btn sm" data-a="copiarsql">${raw(icon('copy'))} Copiar</button>
      </div>
      <pre id="sql-box">${Sync.SQL}</pre>

      <label class="tiny">PROJECT URL</label>
      <input id="cfg-url" placeholder="https://xxxxxxxx.supabase.co" value="${c.url || ''}"
             autocomplete="off" spellcheck="false" style="margin:5px 0 10px">
      <label class="tiny">CLAVE ANON PUBLIC</label>
      <input id="cfg-key" placeholder="eyJhbGciOi..." value="${c.key || ''}"
             autocomplete="off" spellcheck="false" style="margin:5px 0 12px">

      <button class="btn primary block" data-a="guardarcfg">Guardar y continuar</button>
      ${raw(Sync.configPropia() ? '<button class="btn danger block sm" data-a="borrarcfg" style="margin-top:8px">' +
        'Volver a la conexión que trae la app</button>' : '')}`,
      function (el) {
        el.querySelector('[data-a=copiarsql]').onclick = function () {
          const t = el.querySelector('#sql-box').textContent;
          if (navigator.clipboard) navigator.clipboard.writeText(t);
          UI.toast('SQL copiado');
        };
        el.querySelector('[data-a=guardarcfg]').onclick = function () {
          try {
            Sync.guardarConfig(el.querySelector('#cfg-url').value, el.querySelector('#cfg-key').value);
            UI.closeModal();
            render();
            UI.toast('Configuración guardada. Ahora entra con tu correo.');
          } catch (e) {
            UI.toast(e.message);
          }
        };
        const borrar = el.querySelector('[data-a=borrarcfg]');
        if (borrar) borrar.onclick = function () {
          UI.confirm('Volver a la conexión de la app',
            'Se borrará la configuración propia de este dispositivo y su sesión. ' +
            'Tus datos locales y los de la nube no se tocan.', 'Continuar', true).then(function (ok) {
            if (ok) { Sync.borrarConfig(); UI.closeModal(); render(); UI.toast('Desconectado'); }
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
          ${raw(icon('back'))} Volver</button>
        <div class="card">
          <div style="font-weight:600;margin-bottom:4px">Las cuentas las crea quien administra</div>
          <p class="muted" style="margin:0">Pídele que te dé de alta con tu correo y te
          pase una contraseña. Luego entras aquí arriba con esos datos y ya puedes
          cambiarla desde Mi cuenta.</p>
        </div>`;
    }

    return html`
      <button class="btn sm ghost" data-alta="" style="margin-bottom:10px">
        ${raw(icon('back'))} Volver</button>

      <div class="card">
        <div style="font-weight:600;margin-bottom:4px">Crear tu base de datos</div>
        <p class="muted" style="margin:0">Es gratis y se hace una sola vez. Tus datos quedan
        en tu propia cuenta de Supabase, no en un servidor mío ni de nadie.</p>
      </div>

      <div class="card">
        <ol class="instr">
          <li>Entra en <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>,
            crea una cuenta y pulsa <b>New project</b>. Nombre y contraseña, los que quieras;
            elige la región más cercana.</li>
          <li>Cuando termine, ve a <b>SQL Editor</b>, pega el bloque que te da la bóveda y
            pulsa <b>Run</b>. Crea la tabla de tus datos.</li>
          <li>En <b>Authentication → URL Configuration</b>, pon esta dirección en
            <b>Site URL</b> y en <b>Redirect URLs</b>.</li>
          <li>En <b>Project Settings → API Keys</b> copia la <b>Publishable key</b>, y la
            <b>Project URL</b> de <b>Data API</b>.</li>
          <li>Pega los dos valores en la bóveda y vuelve aquí a entrar con tu correo.</li>
        </ol>
        <button class="btn primary block" data-a="pasoapaso">
          ${raw(icon('chevron'))} Abrir el paso a paso completo</button>
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
        UI.toast('Ese enlace no es válido. Cópialo entero.');
        return;
      }
      altaModo = '';
      render();
      UI.toast('Dispositivo conectado. Ahora entra con tu correo.');
    });

    bind(root, '[data-a=usarManual]', function () {
      try {
        Sync.guardarConfig(root.querySelector('#alta-url').value,
          root.querySelector('#alta-key').value);
        altaModo = '';
        render();
        UI.toast('Guardado. Ahora entra con tu correo.');
      } catch (e) { UI.toast(e.message); }
    });

    bind(root, '[data-a=configsync]', configSyncSheet);

    bind(root, '[data-a=enviarenlace]', function (btn) {
      const campo = root.querySelector('#mail-enlace') || root.querySelector('#sync-mail');
      btn.disabled = true;
      btn.textContent = 'Enviando…';
      Sync.enviarEnlace(campo.value).then(function (dir) {
        UI.modal(html`
          <h2>Revisa tu correo</h2>
          <p class="muted">Hemos enviado un enlace de acceso a <b>${dir}</b>.
          Ábrelo en este mismo dispositivo y entrarás automáticamente.</p>
          <p class="tiny">Si no aparece en unos minutos, mira en spam.</p>
          <button class="btn primary block" data-x="ok">Entendido</button>`,
          function (el) { el.querySelector('[data-x=ok]').onclick = UI.closeModal; });
      }).catch(function (e) {
        UI.toast(e.message || 'No se pudo enviar el enlace');
      }).then(function () {
        render();
      });
    });

    bindAll(root, '[data-acceso]', function (el) {
      accesoModo = el.dataset.acceso;
      render();
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
      }, 'Entrando…');
    });

    bind(root, '[data-a=crearCuenta]', function (btn) {
      conCredenciales(btn, function (c, p) {
        return Sync.registrar(c, p).then(function (r) {
          if (r && r.ok) Store.setSetting('tieneClave', true);
          return r;
        });
      }, 'Creando…');
    });

    bind(root, '[data-a=verPegar]', function (el) {
      const c = root.querySelector('#pegar-enlace');
      if (c) { c.hidden = !c.hidden; el.classList.toggle('abierta', !c.hidden); }
    });

    bind(root, '[data-a=usarLinkAcceso]', function (btn) {
      const campo = root.querySelector('#link-acceso');
      btn.disabled = true;
      btn.textContent = 'Entrando…';
      Sync.entrarConEnlace(campo.value).then(function (r) {
        trasEntrar(r);
      }).catch(function (e) {
        btn.disabled = false;
        btn.textContent = 'Entrar con ese enlace';
        UI.toast(e.message);
      });
    });

    bind(root, '[data-a=verClave]', function (el) {
      const c = root.querySelector('#caja-clave');
      if (c) {
        c.hidden = !c.hidden;
        if (!c.hidden) c.querySelector('#pass-nueva').focus();
      }
    });

    const forzar = function (sentido, titulo, aviso) {
      return function () {
        UI.confirm(titulo, aviso, 'Continuar', true).then(function (ok) {
          if (!ok) return;
          Sync.sincronizar(sentido).then(function () {
            aplicarTema();
            render();
            UI.toast(sentido === 'bajar' ? 'Datos traídos de la nube' : 'Datos subidos a la nube');
          }).catch(function (e) { UI.toast(e.message); });
        });
      };
    };

    bind(root, '[data-a=forzarBajar]', forzar('bajar', 'Traer lo de la nube',
      'Lo que tengas en este dispositivo se reemplaza por lo guardado en la nube.'));
    bind(root, '[data-a=forzarSubir]', forzar('subir', 'Subir lo de este dispositivo',
      'Lo guardado en la nube se reemplaza por lo que tengas en este dispositivo.'));

    bind(root, '[data-a=guardarClave]', function (btn) {
      const nueva = (root.querySelector('#pass-nueva') || {}).value || '';
      const repe = (root.querySelector('#pass-repe') || {}).value || '';
      if (nueva !== repe) { UI.toast('Las dos contraseñas no coinciden'); return; }

      btn.disabled = true;
      btn.textContent = 'Guardando…';
      Sync.establecerClave(nueva).then(function () {
        Store.setSetting('tieneClave', true);
        render();
        UI.toast('Contraseña guardada. Ya puedes entrar con ella en otros dispositivos.');
      }).catch(function (e) {
        btn.disabled = false;
        btn.textContent = 'Guardar contraseña';
        UI.toast(e.message);
      });
    });

    bind(root, '[data-a=sincronizar]', function (btn) {
      btn.disabled = true;
      const antes = btn.innerHTML;
      btn.textContent = 'Sincronizando…';
      Sync.sincronizar().then(function (r) {
        UI.toast(r === 'bajado' ? 'Datos actualizados desde la nube'
          : r === 'subido' ? 'Tus datos están guardados en la nube'
          : 'Ya estaba todo al día');
        aplicarTema();
        render();
      }).catch(function (e) {
        btn.disabled = false;
        btn.innerHTML = antes;
        UI.toast(e.message || 'No se pudo sincronizar');
      });
    });

    bind(root, '[data-a=salir]', function () {
      UI.modal(html`
        <h2>Cerrar sesión</h2>
        <p class="muted">Tus datos siguen guardados en la nube y volverán al entrar de nuevo.
        Elige qué hacer con la copia de este dispositivo.</p>
        <div class="stack" style="margin-top:14px">
          <button class="btn block" data-x="conservar">Cerrar y conservarlos aquí</button>
          <button class="btn danger block" data-x="borrar">Cerrar y borrarlos de este dispositivo</button>
        </div>
        <p class="tiny" style="margin-top:10px">Borrarlos es lo apropiado si el dispositivo
        no es tuyo o lo va a usar otra persona con su cuenta.</p>
        <button class="btn ghost block sm" data-x="cancelar" style="margin-top:8px">Cancelar</button>`,
        function (el) {
          const cerrar = function (borrar) {
            UI.closeModal();
            Sync.salir(borrar).then(function () {
              aplicarTema();
              render();
              UI.toast(borrar ? 'Sesión cerrada y datos borrados' : 'Sesión cerrada');
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
        UI.toast('Ahora estás como ' + Sync.email());
      }).catch(function () {
        aplicarTema();
        render();
        UI.toast('Has entrado como ' + Sync.email());
      });
    }

    /* Ya no hay que preguntar nada: la sincronización fusiona los dos lados,
       así que entrar en un dispositivo nunca le cuesta datos a ninguno. */
    return Sync.sincronizar().then(function () {
      aplicarTema();
      go('cuenta');
      const piezas = [];
      if (Store.routines().length) piezas.push(Store.routines().length + ' rutinas');
      if (Store.sessions().length) piezas.push(Store.sessions().length + ' entrenamientos');
      if (Sync.sincronizaClaves() && (IA.activa() || Spotify.configurado())) {
        piezas.push('tus claves');
      }
      UI.toast(piezas.length
        ? 'Listo: ' + piezas.join(', ') + ' en este dispositivo'
        : 'Has entrado como ' + Sync.email());
    }).catch(function (e) {
      render();
      UI.toast(e.message || 'Entraste, pero no se pudo sincronizar todavía');
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
        <div style="font-weight:600;font-size:.95rem">Hay una versión nueva</div>
        <div class="tiny">${seRecargaSola
          ? 'Se instala sola en un momento. Tus datos no se tocan.'
          : 'Recarga cuando termines. Tus datos no se tocan.'}</div>
      </div>
      <button class="btn sm primary" data-recargar>Actualizar ya</button>`;
    caja.innerHTML = '<div class="aviso">' + caja.innerHTML + '</div>';
    host.parentNode.insertBefore(caja, host);
    caja.querySelector('[data-recargar]').onclick = function () { location.reload(); };
  }

  /* Qué versión hay instalada y cuál se está publicando. La instalada se lee
     del nombre de la caché, que es lo único que no miente aunque el service
     worker se haya quedado a medias; la publicada, del propio sw.js pedido sin
     pasar por ninguna caché. */
  function estadoVersion() {
    if (!window.caches) return Promise.resolve(null);
    return fetch('sw.js?v=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        const m = t.match(/VERSION = '([^']+)'/);
        const servidor = m ? m[1] : '';
        return caches.keys().then(function (ks) {
          const local = ks.filter(function (k) { return k.indexOf('-shell') !== -1; })
            .map(function (k) { return k.replace('-shell', ''); })[0] || '';
          return { local: local, servidor: servidor, alDia: !!local && local === servidor };
        });
      })
      .catch(function () { return null; });
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
          <div style="font-weight:600;font-size:.95rem">${x.titulo}</div>
          <div class="tiny">${x.hora}${raw(x.mensaje ? ' · ' + esc(x.mensaje) : '')}</div>
        </div>
        <button class="btn sm" data-visto="${x.alerta.id}" data-hora="${x.hora}">Vale</button>
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
  function temaChip() {
    const claro = temaEfectivo() === 'light';
    return html`<button class="btn icon" data-a="tema"
      aria-label="${claro ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}">
      ${raw(icon(claro ? 'luna' : 'sol'))}</button>`;
  }

  /* Hoja de técnica que se abre durante el entrenamiento: lo esencial para
     corregir la ejecución sin salir de la serie. */
  function exerciseSheet(ex) {
    const guia = Tecnica.para(ex);

    UI.modal(html`
      <h2 style="margin-bottom:2px">${ex.nameEs}</h2>
      <div class="tiny" style="margin-bottom:12px">${ex.primaryMuscles.map(I18N.muscle).join(', ')}</div>
      ${raw(UI.demoHTML(ex, { speed: 800, fases: Data.frames(ex).length > 1 ? FASES : null }))}

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

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });

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
            UI.toast('Ya estás en la versión nueva' +
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
        UI.toast('Spotify conectado. Ya puedes activar el reproductor.');
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
          UI.toast('Objetivo cumplido: ' + Objetivos.etiqueta(logradas[0]));
          Alertas.avisar('Objetivo cumplido', Objetivos.etiqueta(logradas[0]));
        }, 1200);
      }

      /* Sincronización automática: al abrir, al volver al primer plano, cada
         minuto y medio mientras esté abierta, y al recuperar la conexión. Lo
         que se cambie aquí se sube solo, y si falla se reintenta sin pedir nada. */
      Sync.alCambiarEstado(pintarEstadoSync);
      Sync.arrancarAuto(function () {
        aplicarTema();
        render();
        UI.toast('Actualizado desde otro dispositivo');
      });

      /* en segundo plano se guardan las imágenes de lo que ya tienes planificado */
      setTimeout(function () { Offline.precargarRutinas(); }, 2500);
    }).catch(function (err) {
      console.error(err);
      fallo('No se pudo descargar el catálogo de ejercicios. Comprueba tu conexión.');
    });
  }

  g.App = {
    go: go, render: render, exerciseSheet: exerciseSheet, pickExercise: pickExerciseSheet,
    bind: bind, bindAll: bindAll, aplicarTema: aplicarTema,
    lugarSheet: lugarSheet, cuantosEn: cuantosEn, temaEfectivo: temaEfectivo,
    /* La ficha del ejercicio ya sabía pintar los recambios y la guía de
       técnica; el entrenamiento las necesita igual y no tiene sentido tener
       dos versiones que se separen con el tiempo. */
    alternativasHTML: alternativasHTML, guiaHTML: guiaHTML,
    /* el nombre del plan sin el día delante, que la pantalla de Programa
       necesita para agrupar igual que la de Rutinas */
    nombreRutina: nombreRutina, tituloRutina: tituloRutina,
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
