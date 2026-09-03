/* app.js — router por hash y todas las vistas de la aplicación. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const viewEl = document.getElementById('view');
  const actionsEl = document.getElementById('topbar-actions');

  let route = { name: 'inicio', arg: null };
  let exFilters = { q: '', group: '', muscle: '', equipment: '', level: '', favs: false, todo: false };
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
      progreso: viewProgreso, ajustes: viewAjustes, plan: viewPlan,
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
    if (!Store.settings().gear && route.name !== 'bienvenida') {
      route = { name: 'bienvenida', arg: null };
    }
    const fn = views[route.name] || viewInicio;

    actionsEl.innerHTML = route.name === 'bienvenida' ? temaChip() : lugarChip() + temaChip();
    viewEl.innerHTML = fn();
    window.scrollTo(0, route.name === 'ejercicios' ? window.scrollY : 0);

    if (fn.mount) fn.mount(viewEl);
    UI.mountDemos(viewEl);
    pintarAvisos();
    /* el cronómetro acompaña al usuario por toda la app mientras entrena */
    Workout.pintarBanner();

    const chip = actionsEl.querySelector('[data-a=lugar]');
    if (chip) chip.onclick = lugarSheet;

    const chipTema = actionsEl.querySelector('[data-a=tema]');
    if (chipTema) chipTema.onclick = function () {
      Store.setSetting('theme', temaEfectivo() === 'light' ? 'dark' : 'light');
      aplicarTema();
      render();
    };

    document.querySelectorAll('.tabbar').forEach(function (t) {
      t.hidden = route.name === 'bienvenida';
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
    return Object.keys(Data.GEAR).map(function (k) {
      const gset = Data.GEAR[k];
      return html`
        <button class="rt-item" data-lugar="${k}" style="width:100%;text-align:left;padding:13px;
                ${actual === k ? 'border-color:var(--acc);background:var(--acc-d)' : ''}">
          <div class="grow">
            <div style="font-weight:700;font-size:.95rem">${gset.label}</div>
            <div class="tiny">${gset.note}</div>
            <div class="tiny" style="color:var(--acc);margin-top:2px">
              ${UI.num(cuantosEn(k))} ejercicios disponibles</div>
          </div>
          ${raw(actual === k ? '<span class="chip solid">Actual</span>' : '')}
        </button>`;
    }).join('');
  }

  function viewBienvenida() {
    return html`
      <div style="padding:26px 0 6px" class="center">
        <img src="icons/logo.svg" alt="Training FR" width="94" height="119"
             style="margin:0 auto 12px">
        <div class="splash-name wordmark">TRAINING<sup>FR</sup></div>
      </div>
      <h1 class="center">¿Dónde vas a entrenar?</h1>
      <p class="muted center">Con esto te muestro solo los ejercicios que puedes hacer de verdad,
      y las rutinas que te genere usarán únicamente ese material. Si vienes a mirar,
      elige <b>Ver todo</b> y tendrás el catálogo entero.</p>
      <div class="stack" style="margin-top:18px">${raw(tarjetasLugar(''))}</div>
      <p class="tiny center" style="margin-top:16px">Podrás cambiarlo cuando quieras
      desde el botón de arriba o en Ajustes.</p>`;
  }

  viewBienvenida.mount = function (root) {
    bindAll(root, '[data-lugar]', function (el) {
      Store.setSetting('gear', el.dataset.lugar);
      planState.gear = el.dataset.lugar;
      exFilters = { q: '', group: '', muscle: '', equipment: '', level: '', favs: false, todo: false };
      go('inicio');
      UI.toast(el.dataset.lugar === 'todo'
        ? 'Listo. Verás el catálogo completo, sin filtrar por material.'
        : 'Listo. Verás solo lo que puedes hacer ' + Data.gearFrase(el.dataset.lugar));
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

  function viewInicio() {
    const st = Store.stats();
    const rutinas = Store.routines();
    const activa = Store.active();
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const deHoy = rutinas.filter(function (r) { return (r.days || []).indexOf(hoy) !== -1; });
    const ultimas = Store.sessions().slice(0, 3);
    const nombre = Store.settings().name;

    /* Al volver tras un rato, la portada saluda antes que nada */
    const bienvenida = Saludo.pendiente();

    return html`
      ${raw(bienvenida ? html`
        <div class="card saludo">
          <div class="row between" style="align-items:flex-start">
            <div class="grow">
              <h1 style="margin:0 0 4px">${bienvenida.titulo}</h1>
              <p style="margin:0;font-size:.95rem">${bienvenida.texto}</p>
            </div>
            <button class="btn icon ghost" data-a="cerrarSaludo"
                    aria-label="Cerrar">${raw(icon('close'))}</button>
          </div>
        </div>`
      : html`
        <h1>Hola${nombre ? ', ' + nombre : ''}</h1>
        <p class="muted">${st.week === 0 ? 'Aún no has entrenado esta semana. Buen momento para empezar.'
          : st.week === 1 ? 'Llevas 1 entrenamiento esta semana. Sigue así.'
          : 'Llevas ' + st.week + ' entrenamientos esta semana. Muy bien.'}</p>`)}

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
      : html`
        <button class="btn primary block grande" data-a="empezarlibre" style="margin-top:14px">
          ${raw(icon('play'))} Iniciar entrenamiento
        </button>
        <p class="tiny center" style="margin:7px 4px 0">Arranca el cronómetro ahora y añade los
        ejercicios sobre la marcha. El tiempo se ve desde cualquier pantalla.</p>`)}

      <div class="stats" style="margin-top:14px">
        <div class="stat"><b>${st.streak}</b><span>Días seguidos</span></div>
        <div class="stat"><b>${st.total}</b><span>Entrenos</span></div>
        <div class="stat"><b>${UI.num(Store.settings().registro === 'simple' || st.totalVolume === 0
          ? st.weekSets : st.weekVolume)}</b><span>${Store.settings().registro === 'simple' ||
          st.totalVolume === 0 ? 'Series semana' : 'Volumen semana'}</span></div>
      </div>

      ${raw(deHoy.length ? html`
        <div class="list-title">Toca hoy (${hoy})</div>
        <div class="stack">${raw(deHoy.map(function (r) { return routineCard(r); }).join(''))}</div>` : '')}

      <div class="list-title">¿Qué entrenas hoy?</div>
      <p class="tiny" style="margin:-4px 4px 8px">Elige una zona y te la enseño músculo a
      músculo, con la opción de montar la sesión entera de una vez.</p>
      <div class="pill-scroll">
        ${raw(I18N.REGIONES.map(function (r) {
          return '<button class="chip" data-zona="' + r.id + '">' + esc(r.label) + '</button>';
        }).join(''))}
      </div>

      <div class="card" style="margin-top:14px;border-color:var(--acc)">
        <div class="row between">
          <div class="grow">
            <div style="font-weight:700">Tu programa personal</div>
            <div class="tiny">Volumen, repeticiones y ejercicios según tu edad, tu nivel,
              tu objetivo y tus limitaciones</div>
          </div>
          <button class="btn primary sm" data-a="programa">Crear</button>
        </div>
      </div>

      <div class="list-head">
        <span class="list-title">Mis rutinas</span>
        <button class="btn sm" data-a="nueva">${raw(icon('plus'))} Nueva</button>
      </div>

      ${raw(rutinas.length ? html`
        <div class="stack">${raw(rutinas.filter(function (r) {
          return (r.days || []).indexOf(hoy) === -1;
        }).map(function (r) { return routineCard(r); }).join(''))}</div>`
      : html`
        <div class="card center">
          <p class="muted" style="margin-bottom:12px">Todavía no tienes rutinas. Empieza con una plantilla
          probada y edítala a tu gusto, o créala desde cero.</p>
          <button class="btn primary block" data-a="plantillas">Ver rutinas de ejemplo</button>
        </div>`)}

      ${raw(ultimas.length ? html`
        <div class="list-head">
          <span class="list-title">Últimos entrenamientos</span>
          <button class="btn sm ghost" data-a="verprogreso">Ver todo</button>
        </div>
        <div class="stack">${raw(ultimas.map(function (s) {
          return html`
            <div class="card row between">
              <div class="grow">
                <div style="font-weight:600">${s.routineName}</div>
                <div class="tiny">${UI.fecha(s.start)} · ${s.setsDone} series${raw(
                  s.volume ? ' · ' + esc(UI.kg(s.volume)) : '')}</div>
              </div>
              <div class="chip">${UI.mmss(((s.end || s.start) - s.start) / 1000)}</div>
            </div>`;
        }).join(''))}` : '')}`;
  }

  function routineCard(r, i, total) {
    const n = r.exercises.length;
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const esDeHoy = (r.days || []).indexOf(hoy) !== -1;
    const conFlechas = ordenando && total > 1;

    return html`
      <div class="card ${esDeHoy && !ordenando ? 'card-hoy' : ''}">
        <div class="row between" style="align-items:flex-start">
          ${raw(conFlechas ? html`
            <div class="mover">
              <button class="btn sm" data-sube="${r.id}" ${i === 0 ? 'disabled' : ''}
                      aria-label="Subir">${raw(icon('up'))}</button>
              <button class="btn sm" data-baja="${r.id}" ${i === total - 1 ? 'disabled' : ''}
                      aria-label="Bajar">${raw(icon('down'))}</button>
            </div>` : '')}
          <div class="grow" style="cursor:pointer" data-open="${r.id}">
            <div style="font-weight:700">${r.name || 'Rutina sin nombre'}
              ${raw(esDeHoy && !ordenando ? '<span class="chip solid tiny-chip">HOY</span>' : '')}</div>
            <div class="tiny">${n} ${n === 1 ? 'ejercicio' : 'ejercicios'}${raw(
              (r.days || []).length ? ' · ' + esc(r.days.join(', ')) : '')}</div>
          </div>
          ${raw(conFlechas ? '' : html`
            <button class="btn primary sm" data-train="${r.id}">${raw(icon('play'))} Entrenar</button>`)}
        </div>
        ${raw(n ? html`<div class="row wrap" style="margin-top:9px;gap:5px">
          ${raw(r.exercises.slice(0, 4).map(function (re) {
            const ex = Data.get(re.exId);
            return '<span class="chip">' + esc(ex ? ex.nameEs : re.exId) + '</span>';
          }).join(''))}
          ${raw(n > 4 ? '<span class="chip">+' + (n - 4) + '</span>' : '')}
        </div>` : '')}
      </div>`;
  }

  viewInicio.mount = function (root) {
    bind(root, '[data-a=cerrarSaludo]', function () { Saludo.descartar(); render(); });
    bind(root, '[data-a=resume]', function () { go('entrenar'); });
    bind(root, '[data-a=empezarlibre]', function () {
      Workout.startLibre();
      go('entrenar');
      UI.toast('Cronómetro en marcha');
    });
    bind(root, '[data-a=nueva]', function () { go('rutina', 'nueva'); });
    bind(root, '[data-a=programa]', function () { go('programa'); });
    bind(root, '[data-a=plantillas]', function () { go('rutinas'); });
    bind(root, '[data-a=verprogreso]', function () { go('progreso'); });
    bindAll(root, '[data-open]', function (el) { go('rutina', el.dataset.open); });
    bindAll(root, '[data-train]', function (el) { empezar(el.dataset.train); });
    bindAll(root, '[data-zona]', function (el) { irAZona(el.dataset.zona); });
  };

  /* Abre el catálogo centrado en una zona del cuerpo */
  function irAZona(id) {
    exFilters = { q: '', group: id, muscle: '', equipment: '', level: '', favs: false, todo: exFilters.todo };
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

  function viewEjercicios() {
    const gear = gearActual();

    /* Escribir "pierna" o "femoral" no es buscar esas palabras en los nombres:
       es querer entrenar esa zona. Se convierte en filtro, no en texto suelto. */
    const zonaQ = exFilters.q && !exFilters.favs ? I18N.zona(exFilters.q) : null;
    const musculoQ = zonaQ && zonaQ.tipo === 'musculo' ? zonaQ.muscle : '';
    const musculo = exFilters.muscle || musculoQ;

    /* La zona activa: del texto buscado o del chip de grupo */
    const region = zonaQ && zonaQ.tipo === 'region' ? zonaQ.region
      : (!musculo && !exFilters.favs ? I18N.region(exFilters.group) : null);

    const base = {
      q: zonaQ ? '' : exFilters.q,
      group: region ? '' : exFilters.group,
      muscles: region ? region.muscles : null,
      muscle: musculo,
      equipment: exFilters.equipment, level: exFilters.level, favs: exFilters.favs, gear: gear
    };
    const res = Data.search(base);

    /* Se segmenta por músculo salvo que se esté mirando un músculo concreto */
    const segmentar = !musculo && !base.q && !exFilters.favs && !exFilters.equipment;
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

    return html`
      <div class="row between">
        <h1 style="margin:0">Ejercicios</h1>
        ${raw(Store.settings().gear === 'todo' ? '' : html`
          <button class="chip ${exFilters.todo ? '' : 'on'}" data-a="togglegear">
            ${exFilters.todo ? 'Solo mi material' : 'Ver todo'}
          </button>`)}
      </div>
      <p class="muted" style="margin-top:6px">
        ${UI.num(res.length)} ejercicios${raw(sinFiltro
          ? ' del catálogo completo'
          : ' que puedes hacer ' + esc(lugar))}, con la técnica animada.
      </p>

      <div class="search-wrap" style="margin-bottom:10px">
        ${raw(icon('search'))}
        <input id="ex-q" type="search" placeholder="Buscar: pierna, femoral, peso muerto…"
               value="${exFilters.q}" autocomplete="off">
      </div>

      <div class="pill-scroll">
        <button class="chip ${!exFilters.group && !exFilters.favs && !zonaQ ? 'on' : ''}" data-grp="">Todos</button>
        <button class="chip ${exFilters.favs ? 'on' : ''}" data-favs="1">${raw(icon('star'))} Favoritos</button>
        ${raw(I18N.GROUPS.map(function (gr) {
          return '<button class="chip ' + (exFilters.group === gr.id && !zonaQ ? 'on' : '') +
                 '" data-grp="' + gr.id + '">' + esc(gr.label) + '</button>';
        }).join(''))}
      </div>

      ${raw(zonaQ ? html`
        <p class="tiny" style="margin:-2px 4px 10px">Has buscado una zona del cuerpo:
        te enseño ${raw(zonaQ.tipo === 'region'
          ? 'todos sus músculos por separado'
          : 'todos los ejercicios de ' + esc(I18N.muscle(musculo).toLowerCase()))}, no solo
        los que llevan esa palabra en el nombre.</p>` : '')}

      ${raw(exFilters.muscle ? html`
        <div class="row wrap" style="gap:6px;margin-bottom:12px">
          <button class="chip on" data-a="quitarmusculo">${I18N.muscle(exFilters.muscle)} ×</button>
        </div>` : '')}

      ${raw(tarjetaZona)}

      <div class="row" style="margin-bottom:14px">
        <select id="ex-eq" class="grow">
          <option value="">Todo el material</option>
          ${raw(Object.keys(I18N.EQUIP).filter(function (k) {
            return !gear || Data.gearAllows(gear, k);
          }).map(function (k) {
            return '<option value="' + esc(k) + '"' + (exFilters.equipment === k ? ' selected' : '') +
                   '>' + esc(I18N.EQUIP[k]) + '</option>';
          }).join(''))}
        </select>
        <select id="ex-lv" class="grow">
          <option value="">Cualquier nivel</option>
          ${raw(Object.keys(I18N.LEVEL).map(function (k) {
            return '<option value="' + esc(k) + '"' + (exFilters.level === k ? ' selected' : '') +
                   '>' + esc(I18N.LEVEL[k]) + '</option>';
          }).join(''))}
        </select>
      </div>

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

    bindAll(root, '[data-grp]', function (el) {
      /* el chip manda: se limpia la búsqueda para no cruzar dos criterios y
         acabar sin resultados ("banca" + pierna no existe) */
      exFilters.group = el.dataset.grp; exFilters.favs = false; exFilters.muscle = '';
      exFilters.q = '';
      exLimit = 40; render();
    });
    bind(root, '[data-favs]', function () {
      exFilters.favs = !exFilters.favs; exFilters.group = ''; exFilters.muscle = '';
      exLimit = 40; render();
    });
    bindAll(root, '[data-vermusculo]', function (el) {
      exFilters.muscle = el.dataset.vermusculo; exLimit = 40; render();
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
    root.querySelector('#ex-eq').onchange = function (e) {
      exFilters.equipment = e.target.value; exLimit = 40; render();
    };
    root.querySelector('#ex-lv').onchange = function (e) {
      exFilters.level = e.target.value; exLimit = 40; render();
    };
    bind(root, '[data-a=mas]', function () {
      exLimit += 40;
      const pos = window.scrollY; render(); window.scrollTo(0, pos);
    });
    bind(root, '[data-a=limpiar]', function () {
      exFilters = { q: '', group: '', muscle: '', equipment: '', level: '', favs: false, todo: exFilters.todo };
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

    return html`
      <div class="list-title">Si está ocupado o no lo tienes</div>
      <p class="tiny" style="margin:-4px 4px 10px">${raw(fuera
        ? 'Con tu material no hay recambio, así que estas son del catálogo completo.'
        : 'Mismo trabajo con otro material. Toca cualquiera para ver su técnica.')}</p>
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
    const traducidas = localStorage.getItem('trainingfr.tr.' + ex.id);
    const pasos = traducidas ? JSON.parse(traducidas) : ex.instructions;

    return html`
      <button class="guia-tit" data-a="verOriginal" style="margin-top:18px">
        ${raw(icon('chevron'))} Instrucciones originales del catálogo
      </button>
      <div class="guia" id="orig" hidden>
        <div class="card">
          <ol class="instr" id="instr">
            ${raw(pasos.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join(''))}
          </ol>
          ${raw(traducidas ? '' : '<button class="btn sm block" data-a="traducir">' +
            'Traducir al español</button>')}
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
    bind(root, '[data-a=traducir]', function (el) { traducirInstrucciones(ex, el); });
    bind(root, '[data-a=verOriginal]', function (el) {
      const c = root.querySelector('#orig');
      if (c) { c.hidden = !c.hidden; el.classList.toggle('abierta', !c.hidden); }
    });
  };

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
    const deHoy = rutinas.filter(function (r) { return (r.days || []).indexOf(hoy) !== -1; });
    const resto = rutinas.filter(function (r) { return (r.days || []).indexOf(hoy) === -1; });
    return deHoy.concat(resto);
  }

  function viewRutinas() {
    const rutinas = rutinasOrdenadas();
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const hayHoy = rutinas.some(function (r) { return (r.days || []).indexOf(hoy) !== -1; });

    return html`
      <div class="row between">
        <h1>Rutinas</h1>
        <button class="btn sm" data-a="nueva">${raw(icon('plus'))} Nueva</button>
      </div>

      <button class="btn primary block" data-a="programa" style="margin:6px 0 4px">
        ${raw(icon('chispa'))} Crear mi programa personal
      </button>
      <p class="tiny">Ajustado a tu edad, tu nivel, tu objetivo y tus limitaciones, con la
      progresión de las cinco semanas siguientes.</p>

      ${raw(rutinas.length > 1 ? html`
        <div class="list-head">
          <span class="list-title">${ordenando ? 'Colócalas a tu gusto'
            : hayHoy ? 'Hoy es ' + hoy + ', y esto es lo que toca' : 'Mis rutinas'}</span>
          <button class="btn sm ${ordenando ? 'primary' : 'ghost'}" data-a="ordenar">
            ${ordenando ? 'Hecho' : 'Ordenar'}</button>
        </div>` : '')}

      ${raw(rutinas.length ? html`
        <div class="stack" style="margin-top:8px">${raw(rutinas.map(function (r, i) {
          return routineCard(r, i, rutinas.length);
        }).join(''))}</div>`
      : '<p class="muted">Aún no tienes rutinas propias. Copia una plantilla de abajo para empezar.</p>')}

      ${raw(ordenando ? '<p class="tiny center" style="margin-top:10px">El orden se guarda ' +
        'y viaja a tus demás dispositivos. Al salir de aquí, la rutina de hoy vuelve a ' +
        'ponerse la primera.</p>' : '')}

      <div class="list-title">Rutinas de ejemplo</div>
      <p class="muted">Al usar una plantilla se copia a tus rutinas; puedes cambiar ejercicios,
      series y descansos sin límite.</p>
      <div class="stack">
        ${raw(Templates.list.map(function (t) {
          return html`
            <div class="card">
              <div class="row between" style="align-items:flex-start">
                <div class="grow">
                  <div style="font-weight:700">${t.name}</div>
                  <div class="tiny">${t.goal} · ${t.level} · ${t.exercises.length} ejercicios · ${t.days.join(', ')}</div>
                </div>
                <button class="btn sm" data-tpl="${t.id}">${raw(icon('copy'))} Usar</button>
              </div>
              <p class="muted" style="margin:9px 0 0;font-size:.82rem">${t.note}</p>
            </div>`;
        }).join(''))}
      </div>`;
  }

  viewRutinas.mount = function (root) {
    bind(root, '[data-a=nueva]', function () { go('rutina', 'nueva'); });
    bind(root, '[data-a=programa]', function () { go('programa'); });

    bind(root, '[data-a=ordenar]', function () {
      ordenando = !ordenando;
      render();
      if (ordenando) UI.toast('Coloca las rutinas con las flechas');
    });

    const mover = function (id, delta) {
      const pos = window.scrollY;
      if (Store.moverRutina(id, delta)) { render(); window.scrollTo(0, pos); }
    };
    bindAll(root, '[data-sube]', function (el) { mover(el.dataset.sube, -1); });
    bindAll(root, '[data-baja]', function (el) { mover(el.dataset.baja, 1); });
    bindAll(root, '[data-open]', function (el) { go('rutina', el.dataset.open); });
    bindAll(root, '[data-train]', function (el) { empezar(el.dataset.train); });
    bindAll(root, '[data-tpl]', function (el) {
      const tpl = Templates.list.find(function (t) { return t.id === el.dataset.tpl; });
      const r = Store.saveRoutine(Templates.toRoutine(tpl));
      UI.toast('Rutina copiada. Ya puedes editarla.');
      go('rutina', r.id);
    });
  };

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
                   '" data-pday="' + d + '">' + d + '</button>';
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
      <p class="tiny center" style="margin-top:10px">Guardar añade ${plan.length} rutinas nuevas;
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
        <label class="tiny">NOMBRE</label>
        <input id="r-name" value="${draft.name}" placeholder="Ej. Pierna pesada" style="margin:5px 0 12px">
        <label class="tiny">NOTAS (opcional)</label>
        <textarea id="r-note" rows="2" placeholder="Objetivo, progresión, recordatorios…"
                  style="margin:5px 0 12px">${draft.note || ''}</textarea>
        <label class="tiny">DÍAS DE LA SEMANA</label>
        <div class="row wrap" style="gap:6px;margin-top:6px">
          ${raw(dias.map(function (d) {
            return '<button class="chip ' + ((draft.days || []).indexOf(d) !== -1 ? 'on' : '') +
                   '" data-day="' + d + '">' + d + '</button>';
          }).join(''))}
        </div>
      </div>

      <div class="list-head">
        <span class="list-title">Ejercicios (${draft.exercises.length})</span>
        <button class="btn sm primary" data-a="add">${raw(icon('plus'))} Añadir</button>
      </div>

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
                    <button class="btn icon sm danger" data-del="${i}"
                            aria-label="Quitar">${raw(icon('trash'))}</button>
                  </div>
                </div>
                <div class="row" style="margin-top:10px;gap:8px">
                  <div class="grow"><div class="tiny center">Series</div>
                    <input type="number" min="1" max="15" value="${re.sets}" data-i="${i}" data-f="sets"
                           style="text-align:center"></div>
                  <div class="grow"><div class="tiny center">Reps</div>
                    <input type="number" min="1" max="200" value="${re.reps}" data-i="${i}" data-f="reps"
                           style="text-align:center"></div>
                  <div class="grow"><div class="tiny center">Descanso (s)</div>
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
          ${raw(icon('play'))} Guardar y entrenar ahora</button>` : '')}`;
  }

  viewRutina.mount = function (root) {
    function leerCampos() {
      draft.name = root.querySelector('#r-name').value.trim();
      draft.note = root.querySelector('#r-note').value.trim();
    }
    function guardar() {
      leerCampos();
      if (!draft.name) draft.name = 'Rutina sin nombre';
      return Store.saveRoutine(draft);
    }

    bind(root, '[data-a=atras]', function () { go('rutinas'); });

    bindAll(root, '[data-day]', function (el) {
      const d = el.dataset.day;
      draft.days = draft.days || [];
      const i = draft.days.indexOf(d);
      if (i === -1) draft.days.push(d); else draft.days.splice(i, 1);
      el.classList.toggle('on', i === -1);
    });

    root.querySelectorAll('input[data-f]').forEach(function (inp) {
      inp.onchange = function () {
        const v = Number(inp.value) || 0;
        draft.exercises[Number(inp.dataset.i)][inp.dataset.f] = v;
      };
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
      draft.exercises.splice(Number(el.dataset.del), 1);
      leerCampos(); Store.saveRoutine(draft); render();
    });

    bindAll(root, '[data-a=add]', function () {
      leerCampos();
      pickExerciseSheet(function (ex) {
        draft.exercises.push(Store.newRoutineExercise(ex.id));
        const saved = Store.saveRoutine(draft);
        UI.closeModal();
        /* una rutina nueva ya tiene id: se navega a él para no perder el borrador */
        go('rutina', saved.id);
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
      }).join('') || '<p class="muted center">Sin resultados</p>';

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

  function viewProgreso() {
    const st = Store.stats();
    const sesiones = Store.sessions();
    const semanas = Store.weeklyVolume(8);
    /* sin peso anotado el volumen es cero: en ese caso la medida son las series */
    const porSeries = Store.settings().registro === 'simple' || st.totalVolume === 0;
    const valor = function (w) { return porSeries ? w.sets : w.volume; };
    const max = Math.max.apply(null, semanas.map(valor).concat([1]));

    /* récords ordenados por peso */
    const prs = [];
    const vistos = {};
    sesiones.forEach(function (s) {
      (s.entries || []).forEach(function (e) {
        if (vistos[e.exId]) return;
        vistos[e.exId] = true;
        const p = Store.prOf(e.exId);
        if (p.best && p.best.weight > 0) prs.push({ exId: e.exId, name: e.name, pr: p.best });
      });
    });
    prs.sort(function (a, b) { return b.pr.weight - a.pr.weight; });

    /* calendario de las últimas 5 semanas */
    const dias = new Set(sesiones.map(function (s) { return Store.dayKey(s.start); }));
    const hoyKey = Store.dayKey(Date.now());
    const celdas = [];
    const base = new Date(); base.setHours(0, 0, 0, 0);
    const offset = (base.getDay() + 6) % 7;
    const finSemana = base.getTime() - offset * 864e5 + 6 * 864e5;
    for (let i = 34; i >= 0; i--) {
      const t = finSemana - i * 864e5;
      const k = Store.dayKey(t);
      celdas.push({ t: t, on: dias.has(k), hoy: k === hoyKey, d: new Date(t).getDate() });
    }

    return html`
      <h1>Progreso</h1>

      <div class="stats">
        <div class="stat"><b>${st.total}</b><span>Entrenos</span></div>
        <div class="stat"><b>${st.streak}</b><span>Racha</span></div>
        <div class="stat"><b>${UI.num(porSeries ? st.totalSets : st.totalVolume)}</b>
          <span>${porSeries ? 'Series totales' : 'Volumen total'}</span></div>
        <div class="stat"><b>${st.totalMinutes < 60 ? st.totalMinutes + 'm'
          : Math.round(st.totalMinutes / 60) + 'h'}</b><span>Tiempo</span></div>
      </div>

      <div class="list-title">${porSeries ? 'Series por semana' : 'Volumen por semana'}</div>
      <div class="card">
        <div class="bars">
          ${raw(semanas.map(function (w) {
            const v = valor(w);
            return html`<div class="b" title="${porSeries ? v + ' series' : UI.kg(w.volume)}"
                 data-h="${Math.max(3, Math.round(v / max * 100))}">
              <em>${v ? UI.num(v) : ''}</em>
              <i></i>
              <span>${UI.fechaCorta(w.from)}</span></div>`;
          }).join(''))}
        </div>
        <div class="tiny center" style="margin-top:8px">
          ${porSeries ? 'Series completadas en cada semana'
            : 'Volumen = peso × repeticiones de las series completadas'}
        </div>
      </div>

      <div class="list-title">Últimas 5 semanas</div>
      <div class="card">
        <div class="cal">
          ${raw(celdas.map(function (c) {
            return '<div class="d ' + (c.on ? 'on ' : '') + (c.hoy ? 'today' : '') + '">' + c.d + '</div>';
          }).join(''))}
        </div>
      </div>

      ${raw(prs.length ? html`
        <div class="list-title">Récords personales</div>
        <div class="stack">
          ${raw(prs.slice(0, 12).map(function (p) {
            return html`<button class="card row between" data-ex="${p.exId}" style="width:100%;text-align:left">
              <div class="grow"><div style="font-weight:600;font-size:.88rem">${p.name}</div>
                <div class="tiny">${UI.fecha(p.pr.date)}</div></div>
              <div class="chip solid">${UI.kg(p.pr.weight)} × ${p.pr.reps}</div>
            </button>`;
          }).join(''))}
        </div>` : '')}

      <div class="list-title">Historial</div>
      ${raw(sesiones.length ? html`
        <div class="stack">
          ${raw(sesiones.slice(0, 30).map(function (s) {
            return html`
              <div class="card">
                <div class="row between">
                  <div class="grow" style="cursor:pointer" data-ses="${s.id}">
                    <div style="font-weight:700">${s.routineName}</div>
                    <div class="tiny">${UI.fecha(s.start)} · ${s.setsDone} series${raw(
                      s.volume ? ' · ' + esc(UI.kg(s.volume)) : '')} ·
                      ${UI.mmss(((s.end || s.start) - s.start) / 1000)}</div>
                  </div>
                  <button class="btn icon sm danger" data-delses="${s.id}"
                          aria-label="Borrar">${raw(icon('trash'))}</button>
                </div>
                <div class="stack" data-detail="${s.id}" hidden style="margin-top:10px">
                  ${raw((s.entries || []).map(function (e) {
                    const hechas = (e.sets || []).filter(function (x) { return x.done; });
                    if (!hechas.length) return '';
                    return html`<div class="row between" style="font-size:.82rem">
                      <span class="grow">${e.name}</span>
                      <span class="tiny">${hechas.map(function (x) {
                        return UI.num(x.weight) + '×' + x.reps;
                      }).join(' · ')}</span></div>`;
                  }).join(''))}
                </div>
              </div>`;
          }).join(''))}
        </div>`
      : html`<div class="empty">${raw(icon('flag'))}
          <p>Aquí aparecerán tus entrenamientos cuando completes el primero.</p></div>`)}`;
  }

  viewProgreso.mount = function (root) {
    /* las barras arrancan a cero y crecen escalonadas en el siguiente fotograma */
    requestAnimationFrame(function () {
      root.querySelectorAll('.bars .b').forEach(function (b, i) {
        setTimeout(function () {
          b.classList.add('in');
          const bar = b.querySelector('i');
          if (bar) bar.style.height = b.dataset.h + '%';
        }, i * 55);
      });
      root.querySelectorAll('.cal .d').forEach(function (d, i) {
        d.style.animationDelay = (i * 8) + 'ms';
      });
    });

    bindAll(root, '[data-ex]', function (el) { go('ejercicio', el.dataset.ex); });
    bindAll(root, '[data-ses]', function (el) {
      const d = root.querySelector('[data-detail="' + el.dataset.ses + '"]');
      if (d) d.hidden = !d.hidden;
    });
    bindAll(root, '[data-delses]', function (el) {
      UI.confirm('Borrar entrenamiento', 'Se eliminará de tu historial y de las estadísticas.',
        'Borrar', true).then(function (ok) {
        if (ok) { Store.deleteSession(el.dataset.delses); render(); }
      });
    });
  };

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
          ${raw(s.registro !== 'simple' ? '<span class="chip solid">' + icon('check') + '</span>' : '')}
        </button>
        <button class="list-row tap" data-reg="simple">
          <span class="row-icon">${raw(icon('check'))}</span>
          <div class="grow">
            <div class="list-row-title">Solo marcar como hecho</div>
            <div class="list-row-sub">Te propongo el objetivo (por ejemplo 3 × 12) y solo
              marcas cada serie. El peso queda opcional.</div>
          </div>
          ${raw(s.registro === 'simple' ? '<span class="chip solid">' + icon('check') + '</span>' : '')}
        </button>
      </div>
      ${raw(s.registro === 'simple'
        ? '<p class="tiny" style="margin:8px 4px 0">Sin peso anotado no hay récords ni ' +
          'volumen; el progreso se mide por series y entrenamientos completados.</p>' : '')}

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

      <p class="tiny center" style="margin-top:22px">
        Training FR · Catálogo de ejercicios de
        <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener noreferrer">free-exercise-db</a>
        (dominio público).<br>Tus datos se quedan en tu dispositivo salvo que
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

    root.querySelector('#s-name').onchange = function (e) {
      Store.setSetting('name', e.target.value.trim());
    };
    root.querySelector('#s-rest').onchange = function (e) {
      Store.setSetting('rest', Math.max(0, Number(e.target.value) || 90));
    };
    bindAll(root, '[data-reg]', function (el) {
      Store.setSetting('registro', el.dataset.reg);
      render();
      UI.toast(el.dataset.reg === 'simple'
        ? 'Ahora solo marcarás las series como hechas'
        : 'Ahora anotarás peso y repeticiones');
    });
    bindAll(root, '[data-unit]', function (el) { Store.setSetting('unit', el.dataset.unit); render(); });
    bindAll(root, '[data-theme]', function (el) {
      Store.setSetting('theme', el.dataset.theme);
      aplicarTema();
      render();
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
    if (g.IA && IA.activa()) puestas.push('Gemini');
    if (g.Spotify && Spotify.configurado()) puestas.push('Spotify');
    if (Sync.configurado()) puestas.push('Supabase');
    return puestas.length ? puestas.join(' · ') : 'Gemini, Spotify y sincronización';
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
          ${raw(filaSync('perfil', 'Perfil y hábitos', Perfil.completo() ? 'Completo' : 'Sin completar'))}
          ${raw(filaSync('llave', 'Claves de Gemini y Spotify',
            Sync.sincronizaClaves() ? 'Incluidas' : 'Solo en este dispositivo'))}
        </div>
        <p class="tiny" style="margin-top:10px">Los cambios suben solos unos segundos
        después de hacerlos, y al abrir la app se descarga lo que hayas hecho en otro sitio.</p>` : '')}

      ${raw(Sync.configurado() && !Sync.activa() ? html`
        <div class="card" style="margin-top:12px">
          <div style="font-weight:600;margin-bottom:4px">Cómo funciona</div>
          <ol class="instr" style="margin-top:8px">
            <li>Escribes tu correo y tu contraseña, los mismos en todos tus dispositivos.</li>
            <li>Al entrar se descarga lo que tengas en la nube y se une con lo de aquí.</li>
            <li>A partir de ahí, cada cambio sube solo unos segundos después.</li>
          </ol>
          <p class="tiny" style="margin:0">No hace falta configurar nada más: la app ya sabe
          a qué cuenta conectarse. Si prefieres entrar sin contraseña, tienes la opción del
          enlace por correo debajo.</p>
        </div>` : '')}`;
  }

  function filaSync(ico, titulo, valor) {
    return '<div class="list-row"><span class="row-icon">' + icon(ico) + '</span>' +
      '<div class="grow"><div class="list-row-title">' + esc(titulo) + '</div></div>' +
      '<span class="list-row-val">' + esc(String(valor)) + '</span></div>';
  }

  viewCuenta.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    mountCuenta(root);
  };

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
        <button class="btn primary block" data-a="configsync">
          ${raw(icon('llave'))} Abrir la bóveda con el paso a paso</button>
      </div>`;
  }

  function mountCuenta(root) {
    bindAll(root, '[data-alta]', function (el) {
      altaModo = el.dataset.alta || '';
      render();
    });

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
        <ol class="instr" style="margin-top:14px">
          ${raw((JSON.parse(localStorage.getItem('trainingfr.tr.' + ex.id) || 'null') || ex.instructions)
            .map(function (s) { return '<li>' + esc(s) + '</li>'; }).join(''))}
        </ol>`)}

      <div class="row" style="margin-top:16px">
        <button class="btn grow" data-x="ficha">Ver ficha completa</button>
        <button class="btn primary grow" data-x="cerrar">Seguir</button>
      </div>`,
      function (el) {
        UI.mountDemos(el);
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

  function init() {
    aplicarTema();
    planState.gear = Store.settings().gear || 'gym';

    document.querySelectorAll('[data-nav]').forEach(function (el) {
      el.onclick = function () { go(el.dataset.nav); };
    });

    window.addEventListener('hashchange', render);

    /* si venimos del enlace del correo o de autorizar Spotify, se resuelve antes de pintar */
    const entrando = Sync.configurado()
      ? Sync.capturarRedireccion().catch(function () { return false; })
      : Promise.resolve(false);

    const spotify = Spotify.configurado()
      ? Spotify.capturarRedireccion().catch(function () { return { ok: false }; })
      : Promise.resolve({ ok: false });

    Promise.all([Data.load(), entrando, spotify]).then(function (res) {
      const reciénEntrado = res[1];
      const sp = res[2] || {};
      const splash = document.getElementById('splash');
      splash.classList.add('hide');
      setTimeout(function () { splash.remove(); }, 400);
      if (!location.hash) location.hash = '#/inicio';
      render();

      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('sw.js').catch(function () { /* opcional */ });
      }

      if (reciénEntrado && reciénEntrado.ok) trasEntrar(reciénEntrado);
      else if (reciénEntrado && reciénEntrado.error) {
        go('cuenta');
        setTimeout(function () { UI.toast(reciénEntrado.error); }, 500);
      }
      else if (Sync.activa()) {
        /* al abrir la app se traen los cambios hechos en otro dispositivo */
        Sync.sincronizar().then(function (r) {
          if (r === 'bajado') { aplicarTema(); render(); UI.toast('Datos actualizados desde la nube'); }
        }).catch(function () { /* sin conexión: se sincroniza más tarde */ });
      }

      if (sp.ok) UI.toast('Spotify conectado');
      else if (sp.error) UI.toast(sp.error);

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

      /* Al volver a la app se traen los cambios hechos en otro dispositivo.
         Con un intervalo mínimo para no llamar en cada cambio de pestaña. */
      let ultimaVuelta = Date.now();
      document.addEventListener('visibilitychange', function () {
        if (document.hidden || !Sync.activa()) return;
        if (Date.now() - ultimaVuelta < 60000) return;
        ultimaVuelta = Date.now();
        Sync.sincronizar().then(function (r) {
          if (r === 'bajado') {
            aplicarTema();
            render();
            UI.toast('Actualizado desde otro dispositivo');
          }
        }).catch(function () { /* sin conexión: ya se reintentará */ });
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
    lugarSheet: lugarSheet, cuantosEn: cuantosEn, temaEfectivo: temaEfectivo
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
