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
      bienvenida: viewBienvenida
    };

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
        <img src="icons/logo.svg" alt="Training FR" width="130" height="94"
             style="margin:0 auto 10px">
        <div class="splash-name">TRAINING <b>FR</b></div>
      </div>
      <h1 class="center">¿Dónde vas a entrenar?</h1>
      <p class="muted center">Con esto te muestro solo los ejercicios que puedes hacer de verdad,
      y las rutinas que te genere usarán únicamente ese material.</p>
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
      UI.toast('Listo. Verás solo ejercicios de ' + Data.GEAR[el.dataset.lugar].label.toLowerCase());
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
            UI.toast('Ahora entrenas ' + Data.GEAR[b.dataset.lugar].label.toLowerCase());
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

    return html`
      <h1>Hola${nombre ? ', ' + nombre : ''}</h1>
      <p class="muted">${st.week === 0 ? 'Aún no has entrenado esta semana. Buen momento para empezar.'
        : st.week === 1 ? 'Llevas 1 entrenamiento esta semana. Sigue así.'
        : 'Llevas ' + st.week + ' entrenamientos esta semana. Muy bien.'}</p>

      ${raw(activa ? html`
        <div class="card" style="border-color:var(--acc);background:var(--acc-d)">
          <div class="row between">
            <div class="grow">
              <div class="tiny" style="color:var(--acc)">ENTRENAMIENTO EN CURSO</div>
              <h3 style="margin:2px 0 0">${activa.routineName}</h3>
            </div>
            <button class="btn primary" data-a="resume">Continuar</button>
          </div>
        </div>` : '')}

      <div class="stats" style="margin-top:14px">
        <div class="stat"><b>${st.streak}</b><span>Días seguidos</span></div>
        <div class="stat"><b>${st.total}</b><span>Entrenos</span></div>
        <div class="stat"><b>${UI.num(st.weekVolume)}</b><span>Volumen semana</span></div>
      </div>

      ${raw(deHoy.length ? html`
        <div class="sec-title"><h2>Toca hoy (${hoy})</h2></div>
        <div class="stack">${raw(deHoy.map(routineCard).join(''))}</div>` : '')}

      <div class="card" style="margin-top:14px;border-color:var(--acc)">
        <div class="row between">
          <div class="grow">
            <div style="font-weight:700">Organiza tu semana</div>
            <div class="tiny">Reparto los grupos musculares por día según tu tiempo</div>
          </div>
          <button class="btn primary sm" data-a="plan">Crear plan</button>
        </div>
      </div>

      <div class="sec-title">
        <h2>Mis rutinas</h2>
        <button class="btn sm" data-a="nueva">${raw(icon('plus'))} Nueva</button>
      </div>

      ${raw(rutinas.length ? html`
        <div class="stack">${raw(rutinas.filter(function (r) {
          return (r.days || []).indexOf(hoy) === -1;
        }).map(routineCard).join(''))}</div>`
      : html`
        <div class="card center">
          <p class="muted" style="margin-bottom:12px">Todavía no tienes rutinas. Empieza con una plantilla
          probada y edítala a tu gusto, o créala desde cero.</p>
          <button class="btn primary block" data-a="plantillas">Ver rutinas de ejemplo</button>
        </div>`)}

      ${raw(ultimas.length ? html`
        <div class="sec-title">
          <h2>Últimos entrenamientos</h2>
          <button class="btn sm ghost" data-a="verprogreso">Ver todo</button>
        </div>
        <div class="stack">${raw(ultimas.map(function (s) {
          return html`
            <div class="card row between">
              <div class="grow">
                <div style="font-weight:600">${s.routineName}</div>
                <div class="tiny">${UI.fecha(s.start)} · ${s.setsDone} series · ${UI.kg(s.volume)}</div>
              </div>
              <div class="chip">${UI.mmss(((s.end || s.start) - s.start) / 1000)}</div>
            </div>`;
        }).join(''))}` : '')}`;
  }

  function routineCard(r) {
    const n = r.exercises.length;
    return html`
      <div class="card">
        <div class="row between" style="align-items:flex-start">
          <div class="grow" style="cursor:pointer" data-open="${r.id}">
            <div style="font-weight:700">${r.name || 'Rutina sin nombre'}</div>
            <div class="tiny">${n} ${n === 1 ? 'ejercicio' : 'ejercicios'}${raw(
              (r.days || []).length ? ' · ' + esc(r.days.join(', ')) : '')}</div>
          </div>
          <button class="btn primary sm" data-train="${r.id}">${raw(icon('play'))} Entrenar</button>
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
    bind(root, '[data-a=resume]', function () { go('entrenar'); });
    bind(root, '[data-a=nueva]', function () { go('rutina', 'nueva'); });
    bind(root, '[data-a=plan]', function () { go('plan'); });
    bind(root, '[data-a=plantillas]', function () { go('rutinas'); });
    bind(root, '[data-a=verprogreso]', function () { go('progreso'); });
    bindAll(root, '[data-open]', function (el) { go('rutina', el.dataset.open); });
    bindAll(root, '[data-train]', function (el) { empezar(el.dataset.train); });
  };

  function empezar(routineId) {
    const r = Store.routine(routineId);
    if (!r) return;
    if (!r.exercises.length) { UI.toast('Añade ejercicios a la rutina antes de entrenar'); return; }

    const run = function () { Workout.start(r); go('entrenar'); };
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

  /* Músculos que se muestran como secciones, según el grupo elegido */
  function musculosVisibles() {
    if (exFilters.group) {
      const gr = I18N.GROUPS.find(function (x) { return x.id === exFilters.group; });
      return gr ? gr.muscles : [];
    }
    return I18N.GROUPS.reduce(function (acc, gr) { return acc.concat(gr.muscles); }, []);
  }

  function viewEjercicios() {
    const gear = gearActual();
    const base = {
      q: exFilters.q, group: exFilters.group, muscle: exFilters.muscle,
      equipment: exFilters.equipment, level: exFilters.level, favs: exFilters.favs, gear: gear
    };
    const res = Data.search(base);

    /* Se segmenta por músculo salvo que haya una búsqueda concreta en marcha */
    const segmentar = !exFilters.q && !exFilters.muscle && !exFilters.favs && !exFilters.equipment;
    const gset = Data.GEAR[Store.settings().gear];
    const lugar = gset ? gset.label.toLowerCase() : '';

    const secciones = segmentar ? musculosVisibles().map(function (m) {
      return { muscle: m, lista: Data.search(Object.assign({}, base, { muscle: m })) };
    }).filter(function (s) { return s.lista.length; }) : [];

    return html`
      <div class="row between">
        <h1 style="margin:0">Ejercicios</h1>
        <button class="chip ${exFilters.todo ? '' : 'on'}" data-a="togglegear">
          ${exFilters.todo ? 'Solo mi material' : 'Ver todo'}
        </button>
      </div>
      <p class="muted" style="margin-top:6px">
        ${UI.num(res.length)} ejercicios${raw(exFilters.todo
          ? ' del catálogo completo'
          : ' que puedes hacer ' + esc(lugar))}, con la técnica animada.
      </p>

      <div class="search-wrap" style="margin-bottom:10px">
        ${raw(icon('search'))}
        <input id="ex-q" type="search" placeholder="Buscar: peso muerto, glúteo, femoral…"
               value="${exFilters.q}" autocomplete="off">
      </div>

      <div class="pill-scroll">
        <button class="chip ${!exFilters.group && !exFilters.favs ? 'on' : ''}" data-grp="">Todos</button>
        <button class="chip ${exFilters.favs ? 'on' : ''}" data-favs="1">${raw(icon('star'))} Favoritos</button>
        ${raw(I18N.GROUPS.map(function (gr) {
          return '<button class="chip ' + (exFilters.group === gr.id ? 'on' : '') +
                 '" data-grp="' + gr.id + '">' + esc(gr.label) + '</button>';
        }).join(''))}
      </div>

      ${raw(exFilters.muscle ? html`
        <div class="row wrap" style="gap:6px;margin-bottom:12px">
          <button class="chip on" data-a="quitarmusculo">${I18N.muscle(exFilters.muscle)} ×</button>
        </div>` : '')}

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
          <div class="sec-title" style="margin:18px 0 8px">
            <h2 style="font-size:1.02rem">${I18N.muscle(s.muscle)}
              <span class="tiny" style="font-weight:600">${s.lista.length}</span></h2>
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
          <p>Ningún ejercicio coincide${raw(gear ? ' entre los que puedes hacer ' + esc(lugar) : '')}.</p>
          <div class="row" style="justify-content:center;gap:8px">
            <button class="btn sm" data-a="limpiar">Limpiar filtros</button>
            ${raw(gear ? '<button class="btn sm primary" data-a="togglegear">Buscar en todo el catálogo</button>' : '')}
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
      exFilters.group = el.dataset.grp; exFilters.favs = false; exFilters.muscle = '';
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

  /* ================= ficha de ejercicio ================= */

  function viewEjercicio() {
    const ex = Data.get(route.arg);
    if (!ex) return '<div class="empty"><p>Ejercicio no encontrado.</p></div>';

    const pr = Store.prOf(ex.id);
    const hist = Store.historyOf(ex.id).slice(0, 6);
    const fav = Store.isFav(ex.id);
    const cached = localStorage.getItem('trainingfr.tr.' + ex.id);

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">${raw(icon('back'))} Volver</button>

      ${raw(UI.demoHTML(ex, { speed: 900 }))}

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
        ${raw(ex.force ? '<span class="chip">' + esc(I18N.force(ex.force)) + '</span>' : '')}
        ${raw(ex.mechanic ? '<span class="chip">' + esc(I18N.mechanic(ex.mechanic)) + '</span>' : '')}
      </div>

      <div class="row">
        <button class="btn primary grow" data-a="addrutina">${raw(icon('plus'))} Añadir a rutina</button>
        <a class="btn" href="${Data.youtube(ex)}" target="_blank" rel="noopener noreferrer"
           aria-label="Buscar vídeo en YouTube">${raw(icon('youtube'))}</a>
      </div>

      <div class="sec-title">
        <h2>Cómo se ejecuta</h2>
        ${raw(cached ? '' : '<button class="btn sm ghost" data-a="traducir">Traducir</button>')}
      </div>
      <div class="card">
        <ol class="instr" id="instr">
          ${raw((cached ? JSON.parse(cached) : ex.instructions).map(function (s) {
            return '<li>' + esc(s) + '</li>';
          }).join(''))}
        </ol>
        ${raw(cached ? '' : '<div class="tiny">Texto original de la base de datos, en inglés. ' +
          'Pulsa «Traducir» para verlo en español.</div>')}
      </div>

      ${raw(pr.best ? html`
        <div class="sec-title"><h2>Tus marcas</h2></div>
        <div class="stats">
          <div class="stat"><b>${UI.num(pr.best.weight)}</b><span>Máx. ${Store.settings().unit}</span></div>
          <div class="stat"><b>${pr.best.reps}</b><span>Reps de esa serie</span></div>
          ${raw(pr.orm ? '<div class="stat"><b>' + UI.num(pr.orm.orm) + '</b><span>1RM estimado</span></div>' : '')}
        </div>` : '')}

      ${raw(hist.length ? html`
        <div class="sec-title"><h2>Historial</h2></div>
        <div class="stack">
          ${raw(hist.map(function (h) {
            return html`<div class="card row between">
              <div class="tiny">${UI.fecha(h.date)}</div>
              <div style="font-size:.85rem;font-weight:600">${h.sets.map(function (s) {
                return UI.num(s.weight) + '×' + s.reps;
              }).join(' · ')}</div>
            </div>`;
          }).join(''))}
        </div>` : '')}`;
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
    bind(root, '[data-a=traducir]', function (el) { traducirInstrucciones(ex, el); });
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

  function viewRutinas() {
    const rutinas = Store.routines();
    return html`
      <div class="row between">
        <h1>Rutinas</h1>
        <button class="btn sm" data-a="nueva">${raw(icon('plus'))} Nueva</button>
      </div>

      <button class="btn primary block" data-a="plan" style="margin:6px 0 4px">
        ${raw(icon('flag'))} Organizar mi semana automáticamente
      </button>
      <p class="tiny">Eliges días, tiempo y objetivo; yo reparto los músculos y los ejercicios.</p>

      ${raw(rutinas.length ? html`
        <div class="stack" style="margin-top:8px">${raw(rutinas.map(routineCard).join(''))}</div>`
      : '<p class="muted">Aún no tienes rutinas propias. Copia una plantilla de abajo para empezar.</p>')}

      <div class="sec-title"><h2>Rutinas de ejemplo</h2></div>
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
    bind(root, '[data-a=plan]', function () { go('plan'); });
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
            <b>Entrenas ${raw(esc((Data.GEAR[p.gear] || Data.GEAR.gym).label.toLowerCase()))}</b>
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

      <div class="sec-title">
        <h2>Ejercicios (${draft.exercises.length})</h2>
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
          : 'Solo lo que puedes hacer ' + gset.label.toLowerCase();
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
    const max = Math.max.apply(null, semanas.map(function (w) { return w.volume; }).concat([1]));

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
        <div class="stat"><b>${UI.num(st.totalVolume)}</b><span>Volumen total</span></div>
        <div class="stat"><b>${st.totalMinutes < 60 ? st.totalMinutes + 'm'
          : Math.round(st.totalMinutes / 60) + 'h'}</b><span>Tiempo</span></div>
      </div>

      <div class="sec-title"><h2>Volumen por semana</h2></div>
      <div class="card">
        <div class="bars">
          ${raw(semanas.map(function (w) {
            return html`<div class="b" title="${UI.kg(w.volume)}"
                 data-h="${Math.max(3, Math.round(w.volume / max * 100))}">
              <em>${w.volume ? UI.num(w.volume) : ''}</em>
              <i></i>
              <span>${UI.fechaCorta(w.from)}</span></div>`;
          }).join(''))}
        </div>
        <div class="tiny center" style="margin-top:8px">
          Volumen = peso × repeticiones de las series completadas
        </div>
      </div>

      <div class="sec-title"><h2>Últimas 5 semanas</h2></div>
      <div class="card">
        <div class="cal">
          ${raw(celdas.map(function (c) {
            return '<div class="d ' + (c.on ? 'on ' : '') + (c.hoy ? 'today' : '') + '">' + c.d + '</div>';
          }).join(''))}
        </div>
      </div>

      ${raw(prs.length ? html`
        <div class="sec-title"><h2>Récords personales</h2></div>
        <div class="stack">
          ${raw(prs.slice(0, 12).map(function (p) {
            return html`<button class="card row between" data-ex="${p.exId}" style="width:100%;text-align:left">
              <div class="grow"><div style="font-weight:600;font-size:.88rem">${p.name}</div>
                <div class="tiny">${UI.fecha(p.pr.date)}</div></div>
              <div class="chip solid">${UI.kg(p.pr.weight)} × ${p.pr.reps}</div>
            </button>`;
          }).join(''))}
        </div>` : '')}

      <div class="sec-title"><h2>Historial</h2></div>
      ${raw(sesiones.length ? html`
        <div class="stack">
          ${raw(sesiones.slice(0, 30).map(function (s) {
            return html`
              <div class="card">
                <div class="row between">
                  <div class="grow" style="cursor:pointer" data-ses="${s.id}">
                    <div style="font-weight:700">${s.routineName}</div>
                    <div class="tiny">${UI.fecha(s.start)} · ${s.setsDone} series ·
                      ${UI.kg(s.volume)} · ${UI.mmss(((s.end || s.start) - s.start) / 1000)}</div>
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

      <div class="sec-title"><h2>Mi cuenta</h2></div>
      ${raw(vistaCuenta())}

      <div class="sec-title"><h2>Copia de seguridad</h2></div>
      <div class="card">
        <p class="muted">Tus rutinas y tu historial se guardan solo en este navegador. Exporta un archivo
        para conservarlos o para llevarlos a otro dispositivo.</p>
        <div class="row">
          <button class="btn grow" data-a="export">${raw(icon('down'))} Exportar</button>
          <button class="btn grow" data-a="import">${raw(icon('up'))} Importar</button>
        </div>
        <input type="file" id="s-file" accept="application/json,.json" hidden>
      </div>

      <div class="sec-title"><h2>Uso sin conexión</h2></div>
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

      <div class="sec-title"><h2>Instalar en el móvil</h2></div>
      <div class="card">
        <p class="muted">Training FR funciona como una app: ábrela en el navegador del móvil y usa
        <b>«Añadir a la pantalla de inicio»</b> (en Android, desde el menú del navegador; en iPhone, desde el botón Compartir).
        Después arranca a pantalla completa y funciona sin conexión.</p>
        <button class="btn primary block" data-a="install" hidden id="btn-install">Instalar aplicación</button>
      </div>

      <div class="sec-title"><h2>Zona peligrosa</h2></div>
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
    mountCuenta(root);

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

  /* ================= cuenta y sincronización ================= */

  function vistaCuenta() {
    /* 1. sin configurar: hace falta el proyecto gratuito de Supabase */
    if (!Sync.configurado()) {
      return html`
        <div class="card">
          <p class="muted">Entra con tu correo y tus rutinas, tu historial y tus marcas
          estarán en todos tus dispositivos. Sin contraseñas: recibes un enlace y ya está.</p>
          <p class="tiny">Para activarlo hay que crear una base de datos gratuita (una sola vez,
          cinco minutos). Te guío paso a paso.</p>
          <button class="btn primary block" data-a="configsync" style="margin-top:8px">
            ${raw(icon('nube'))} Activar la sincronización</button>
        </div>`;
    }

    /* 2. configurado pero sin sesión: pedir el correo */
    if (!Sync.activa()) {
      return html`
        <div class="card">
          <label class="tiny">TU CORREO</label>
          <input id="sync-mail" type="email" inputmode="email" autocomplete="email"
                 placeholder="tucorreo@ejemplo.com" value="${Store.settings().name ? '' : ''}"
                 style="margin:5px 0 10px">
          <button class="btn primary block" data-a="enviarenlace">
            ${raw(icon('correo'))} Enviarme el enlace de acceso</button>
          <p class="tiny" style="margin-top:9px">Te llega un correo con un enlace. Al pulsarlo
          vuelves aquí ya dentro. Revisa la carpeta de spam la primera vez.</p>
          <button class="btn ghost sm block" data-a="configsync" style="margin-top:6px">
            Cambiar la configuración</button>
        </div>`;
    }

    /* 3. sesión abierta */
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
      </div>`;
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
      ${raw(c.url ? '<button class="btn danger block sm" data-a="borrarcfg" style="margin-top:8px">' +
        'Desconectar y borrar la configuración</button>' : '')}`,
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
          UI.confirm('Desconectar', 'Se borrará la configuración y la sesión de este dispositivo. ' +
            'Tus datos locales y los de la nube no se tocan.', 'Desconectar', true).then(function (ok) {
            if (ok) { Sync.borrarConfig(); UI.closeModal(); render(); UI.toast('Desconectado'); }
          });
        };
      });
  }

  function mountCuenta(root) {
    bind(root, '[data-a=configsync]', configSyncSheet);

    bind(root, '[data-a=enviarenlace]', function (btn) {
      const campo = root.querySelector('#sync-mail');
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
      UI.confirm('Cerrar sesión',
        'Tus datos seguirán en este dispositivo y en la nube. Podrás volver a entrar cuando quieras.',
        'Cerrar sesión').then(function (ok) {
        if (ok) Sync.salir().then(function () { render(); UI.toast('Sesión cerrada'); });
      });
    });
  }

  /* Al volver del enlace del correo: decidir qué hacer con lo que ya hay aquí */
  function trasEntrar() {
    const hayLocal = Sync.hayDatosLocales();

    return Sync.bajar().then(function (remoto) {
      const tieneRemoto = remoto && remoto.data &&
        ((remoto.data.routines || []).length || (remoto.data.sessions || []).length);

      if (hayLocal && tieneRemoto) {
        return new Promise(function (resolve) {
          UI.modal(html`
            <h2>Ya tenías datos guardados</h2>
            <p class="muted">En la nube hay rutinas de este correo y en este dispositivo también.
            ¿Con cuáles te quedas?</p>
            <div class="stack" style="margin-top:14px">
              <button class="btn primary block" data-x="bajar">
                Usar los de la nube (${(remoto.data.routines || []).length} rutinas)</button>
              <button class="btn block" data-x="subir">
                Usar los de este dispositivo (${Store.routines().length} rutinas)</button>
            </div>
            <p class="tiny" style="margin-top:10px">La opción que no elijas se reemplaza.
            Si quieres conservar ambas, cancela y exporta antes una copia desde Ajustes.</p>`,
            function (el) {
              el.querySelector('[data-x=bajar]').onclick = function () {
                UI.closeModal(); resolve(Sync.sincronizar('bajar'));
              };
              el.querySelector('[data-x=subir]').onclick = function () {
                UI.closeModal(); resolve(Sync.sincronizar('subir'));
              };
            });
        });
      }
      return Sync.sincronizar();
    }).then(function () {
      aplicarTema();
      render();
      UI.toast('Has entrado como ' + Sync.email());
    }).catch(function (e) {
      render();
      UI.toast(e.message || 'Entraste, pero no se pudo sincronizar todavía');
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

  /* hoja de detalle rápida, usada desde el modo entrenamiento */
  function exerciseSheet(ex) {
    UI.modal(html`
      <h2>${ex.nameEs}</h2>
      <div class="tiny" style="margin-bottom:10px">${ex.name}</div>
      ${raw(UI.demoHTML(ex, { speed: 800 }))}
      <ol class="instr" style="margin-top:14px">
        ${raw((JSON.parse(localStorage.getItem('trainingfr.tr.' + ex.id) || 'null') || ex.instructions)
          .map(function (s) { return '<li>' + esc(s) + '</li>'; }).join(''))}
      </ol>
      <button class="btn block" data-x="cerrar">Cerrar</button>`,
      function (el) {
        UI.mountDemos(el);
        el.querySelector('[data-x=cerrar]').onclick = UI.closeModal;
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

    /* si venimos del enlace del correo, primero se abre la sesión */
    const entrando = Sync.configurado()
      ? Sync.capturarRedireccion().catch(function () { return false; })
      : Promise.resolve(false);

    Promise.all([Data.load(), entrando]).then(function (res) {
      const reciénEntrado = res[1];
      const splash = document.getElementById('splash');
      splash.classList.add('hide');
      setTimeout(function () { splash.remove(); }, 400);
      if (!location.hash) location.hash = '#/inicio';
      render();

      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('sw.js').catch(function () { /* opcional */ });
      }

      if (reciénEntrado) trasEntrar();
      else if (Sync.activa()) {
        /* al abrir la app se traen los cambios hechos en otro dispositivo */
        Sync.sincronizar().then(function (r) {
          if (r === 'bajado') { aplicarTema(); render(); UI.toast('Datos actualizados desde la nube'); }
        }).catch(function () { /* sin conexión: se sincroniza más tarde */ });
      }

      /* en segundo plano se guardan las imágenes de lo que ya tienes planificado */
      setTimeout(function () { Offline.precargarRutinas(); }, 2500);
    }).catch(function (err) {
      console.error(err);
      fallo('No se pudo descargar el catálogo de ejercicios. Comprueba tu conexión.');
    });
  }

  g.App = { go: go, render: render, exerciseSheet: exerciseSheet };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
