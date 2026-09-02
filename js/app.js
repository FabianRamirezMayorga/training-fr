/* app.js — router por hash y todas las vistas de la aplicación. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const viewEl = document.getElementById('view');
  const actionsEl = document.getElementById('topbar-actions');

  let route = { name: 'inicio', arg: null };
  let exFilters = { q: '', group: '', equipment: '', level: '', favs: false };
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
      progreso: viewProgreso, ajustes: viewAjustes
    };
    const fn = views[route.name] || viewInicio;

    actionsEl.innerHTML = '';
    viewEl.innerHTML = fn();
    window.scrollTo(0, route.name === 'ejercicios' ? window.scrollY : 0);

    if (fn.mount) fn.mount(viewEl);
    UI.mountDemos(viewEl);

    document.querySelectorAll('.tab').forEach(function (t) {
      const target = t.dataset.nav;
      t.classList.toggle('on',
        target === route.name ||
        (target === 'rutinas' && (route.name === 'rutina' || route.name === 'entrenar')) ||
        (target === 'ejercicios' && route.name === 'ejercicio'));
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
      <h1>Hola${nombre ? ', ' + nombre : ''} 👋</h1>
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

  function viewEjercicios() {
    const res = Data.search(exFilters);
    const shown = res.slice(0, exLimit);

    return html`
      <h1>Ejercicios</h1>
      <p class="muted">${Data.all().length} ejercicios con animación de la técnica correcta.</p>

      <div class="search-wrap" style="margin-bottom:10px">
        ${raw(icon('search'))}
        <input id="ex-q" type="search" placeholder="Buscar: peso muerto, sentadilla, pecho…"
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

      <div class="row" style="margin-bottom:12px">
        <select id="ex-eq" class="grow">
          <option value="">Todo el material</option>
          ${raw(Object.keys(I18N.EQUIP).map(function (k) {
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

      <div class="tiny" style="margin-bottom:8px">${res.length} resultados</div>

      ${raw(shown.length ? html`
        <div class="grid">${raw(shown.map(exCard).join(''))}</div>
        ${raw(res.length > exLimit
          ? '<button class="btn block" data-a="mas" style="margin-top:14px">Ver más (' +
            (res.length - exLimit) + ' restantes)</button>' : '')}`
      : html`<div class="empty">${raw(icon('search'))}
          <p>Ningún ejercicio coincide con la búsqueda.</p>
          <button class="btn sm" data-a="limpiar">Limpiar filtros</button>
        </div>`)}`;
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
      exFilters.group = el.dataset.grp; exFilters.favs = false; exLimit = 40; render();
    });
    bind(root, '[data-favs]', function () {
      exFilters.favs = !exFilters.favs; exFilters.group = ''; exLimit = 40; render();
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
      exFilters = { q: '', group: '', equipment: '', level: '', favs: false }; exLimit = 40; render();
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
    const cached = localStorage.getItem('gymflow.tr.' + ex.id);

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
      localStorage.setItem('gymflow.tr.' + ex.id, JSON.stringify(frases));
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
        <button class="btn primary sm" data-a="nueva">${raw(icon('plus'))} Nueva</button>
      </div>

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
    bindAll(root, '[data-open]', function (el) { go('rutina', el.dataset.open); });
    bindAll(root, '[data-train]', function (el) { empezar(el.dataset.train); });
    bindAll(root, '[data-tpl]', function (el) {
      const tpl = Templates.list.find(function (t) { return t.id === el.dataset.tpl; });
      const r = Store.saveRoutine(Templates.toRoutine(tpl));
      UI.toast('Rutina copiada. Ya puedes editarla.');
      go('rutina', r.id);
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
        go('rutina', saved.id);
        render();
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
    let q = '', grupo = '';

    function lista() {
      return Data.search({ q: q, group: grupo }).slice(0, 30);
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
      <div class="stack" id="pick-list" style="margin-top:6px"></div>`,
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
            return html`<div class="b" title="${UI.kg(w.volume)}">
              <i style="height:${Math.max(3, Math.round(w.volume / max * 100))}%"></i>
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
        <div class="row between"><span>Unidad de peso</span>
          <div class="row" style="gap:6px">
            <button class="chip ${s.unit === 'kg' ? 'on' : ''}" data-unit="kg">kg</button>
            <button class="chip ${s.unit === 'lb' ? 'on' : ''}" data-unit="lb">lb</button>
          </div>
        </div>
        <div class="hr"></div>
        <div class="row between"><span>Tema</span>
          <div class="row" style="gap:6px">
            <button class="chip ${s.theme === 'dark' ? 'on' : ''}" data-theme="dark">Oscuro</button>
            <button class="chip ${s.theme === 'light' ? 'on' : ''}" data-theme="light">Claro</button>
          </div>
        </div>
        <div class="hr"></div>
        <div class="row between"><span>Descanso por defecto</span>
          <div class="row" style="gap:6px;max-width:130px">
            <input id="s-rest" type="number" min="0" max="600" step="15" value="${s.rest}"
                   style="text-align:center"><span class="tiny">seg</span>
          </div>
        </div>
        <div class="hr"></div>
        <div class="row between"><span>Aviso sonoro al terminar el descanso</span>
          <button class="chip ${s.sound ? 'on' : ''}" data-a="sound">${s.sound ? 'Activado' : 'Apagado'}</button>
        </div>
      </div>

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

      <div class="sec-title"><h2>Instalar en el móvil</h2></div>
      <div class="card">
        <p class="muted">GymFlow funciona como una app: ábrela en el navegador del móvil y usa
        <b>«Añadir a la pantalla de inicio»</b> (Android: menú ⋮ · iPhone: botón Compartir).
        Después arranca a pantalla completa y funciona sin conexión.</p>
        <button class="btn primary block" data-a="install" hidden id="btn-install">Instalar aplicación</button>
      </div>

      <div class="sec-title"><h2>Zona peligrosa</h2></div>
      <div class="card">
        <button class="btn danger block" data-a="wipe">${raw(icon('trash'))} Borrar todos mis datos</button>
      </div>

      <p class="tiny center" style="margin-top:22px">
        GymFlow · Catálogo de ejercicios de
        <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener noreferrer">free-exercise-db</a>
        (dominio público).<br>Los datos no salen de tu dispositivo.
      </p>`;
  }

  viewAjustes.mount = function (root) {
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
      a.download = 'gymflow-' + Store.dayKey(Date.now()) + '.json';
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

  function aplicarTema() {
    const t = Store.settings().theme;
    document.documentElement.dataset.theme = t;
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.content = t === 'light' ? '#f4f6fa' : '#0f1115';
  }

  /* hoja de detalle rápida, usada desde el modo entrenamiento */
  function exerciseSheet(ex) {
    UI.modal(html`
      <h2>${ex.nameEs}</h2>
      <div class="tiny" style="margin-bottom:10px">${ex.name}</div>
      ${raw(UI.demoHTML(ex, { speed: 800 }))}
      <ol class="instr" style="margin-top:14px">
        ${raw((JSON.parse(localStorage.getItem('gymflow.tr.' + ex.id) || 'null') || ex.instructions)
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

    document.querySelectorAll('[data-nav]').forEach(function (el) {
      el.onclick = function () { go(el.dataset.nav); };
    });

    window.addEventListener('hashchange', render);

    Data.load().then(function () {
      const splash = document.getElementById('splash');
      splash.classList.add('hide');
      setTimeout(function () { splash.remove(); }, 400);
      if (!location.hash) location.hash = '#/inicio';
      render();

      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('sw.js').catch(function () { /* opcional */ });
      }
    }).catch(function (err) {
      console.error(err);
      fallo('No se pudo descargar el catálogo de ejercicios. Comprueba tu conexión.');
    });
  }

  g.App = { go: go, render: render, exerciseSheet: exerciseSheet };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
