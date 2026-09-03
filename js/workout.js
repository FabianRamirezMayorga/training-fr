/* workout.js — sesión de entrenamiento en curso.
   Registra series, pesos y repeticiones, cronometra el descanso entre series y
   guarda todo al terminar. La sesión activa se persiste en cada cambio, así que
   si se cierra el navegador a mitad de entrenamiento no se pierde nada. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon;

  let restTimer = null;      // intervalo del descanso
  let restEnd = 0;           // marca de tiempo en que termina el descanso
  let clockTimer = null;     // intervalo del cronómetro total

  /* ---------- ciclo de vida ---------- */

  function start(routine) {
    const entries = routine.exercises.map(function (re) {
      const ex = Data.get(re.exId);
      const last = Store.lastPerformance(re.exId);
      const prevWeight = last && last.sets.length ? Number(last.sets[0].weight) || 0 : Number(re.weight) || 0;
      return {
        exId: re.exId,
        name: ex ? ex.nameEs : re.exId,
        targetReps: re.reps,
        rest: re.rest || Store.settings().rest,
        note: re.note || '',
        sets: Array.from({ length: Math.max(1, re.sets) }, function () {
          return { weight: prevWeight, reps: re.reps, done: false };
        })
      };
    });

    Store.setActive({
      routineId: routine.id,
      routineName: routine.name,
      start: Date.now(),
      idx: 0,
      entries: entries
    });
  }

  function isActive() { return !!Store.active(); }

  function stopTimers() {
    clearInterval(restTimer); restTimer = null;
    clearInterval(clockTimer); clockTimer = null;
    restEnd = 0;
    const host = document.getElementById('rest-host');
    if (host) host.innerHTML = '';
  }

  function discard() {
    stopTimers();
    Store.clearActive();
  }

  function finish() {
    const a = Store.active();
    if (!a) return null;
    const done = a.entries.reduce(function (n, e) {
      return n + e.sets.filter(function (s) { return s.done; }).length;
    }, 0);

    const session = {
      routineId: a.routineId,
      routineName: a.routineName,
      start: a.start,
      end: Date.now(),
      entries: a.entries.map(function (e) {
        return {
          exId: e.exId, name: e.name,
          sets: e.sets.map(function (s) {
            return { weight: Number(s.weight) || 0, reps: Number(s.reps) || 0, done: !!s.done };
          })
        };
      }),
      setsDone: done
    };
    session.volume = Store.volumeOf(session);

    stopTimers();
    Store.clearActive();
    return Store.addSession(session);
  }

  /* ---------- descanso ---------- */

  function startRest(seconds) {
    restEnd = Date.now() + seconds * 1000;
    clearInterval(restTimer);
    restTimer = setInterval(paintRest, 250);
    paintRest();
  }

  function addRest(seconds) {
    if (!restEnd) return;
    restEnd += seconds * 1000;
    paintRest();
  }

  function skipRest() {
    restEnd = 0;
    clearInterval(restTimer); restTimer = null;
    paintRest();
  }

  /* Se dibuja una sola vez y después solo cambia el número: si se reescribiera
     el HTML en cada tic, la animación de entrada se reiniciaría sin parar. */
  function paintRest() {
    const host = document.getElementById('rest-host');
    if (!host) return;

    if (!restEnd) { host.innerHTML = ''; return; }

    const left = (restEnd - Date.now()) / 1000;
    if (left <= 0) {
      UI.beep(2);
      restEnd = 0;
      clearInterval(restTimer); restTimer = null;
      host.innerHTML = '';
      UI.toast('Descanso terminado. ¡A por la siguiente serie!');
      return;
    }

    let out = host.querySelector('[data-rest-out]');
    if (!out) {
      host.innerHTML = html`
        <div class="rest"><div class="rest-in">
          ${raw(icon('timer'))}
          <div class="grow">
            <div style="font-size:.7rem;font-weight:700;opacity:.75">DESCANSO</div>
            <b data-rest-out>${UI.mmss(left)}</b>
          </div>
          <button data-r="+30">+30s</button>
          <button data-r="skip">Saltar</button>
        </div></div>`;
      host.querySelector('[data-r="+30"]').onclick = function () { addRest(30); };
      host.querySelector('[data-r=skip]').onclick = skipRest;
      return;
    }
    out.textContent = UI.mmss(left);
  }

  /* ---------- vista ---------- */

  function view() {
    const a = Store.active();
    if (!a) return '<div class="empty">No hay ningún entrenamiento en curso.</div>';

    const entry = a.entries[a.idx];
    const ex = Data.get(entry.exId);
    const totalSets = a.entries.reduce(function (n, e) { return n + e.sets.length; }, 0);
    const doneSets = a.entries.reduce(function (n, e) {
      return n + e.sets.filter(function (s) { return s.done; }).length;
    }, 0);
    const pct = totalSets ? Math.round(doneSets / totalSets * 100) : 0;
    const pr = Store.prOf(entry.exId);
    const last = Store.lastPerformance(entry.exId);
    const simple = Store.settings().registro === 'simple';

    return html`
      <div class="wo-head">
        <div class="row between" style="margin-bottom:8px">
          <div class="grow" style="min-width:0">
            <div class="tiny">ENTRENANDO</div>
            <h2 style="margin:0;font-size:1.05rem">${a.routineName}</h2>
          </div>
          <div class="center nowrap">
            <b id="wo-clock" style="font-variant-numeric:tabular-nums">0:00</b>
            <div class="tiny"><span id="wo-count">${doneSets}</span>/${totalSets} series</div>
          </div>
        </div>
        <div class="prog"><i style="width:${pct}%"></i></div>
      </div>

      <div id="wo-musica"></div>

      <div class="card" style="padding:0;overflow:hidden">
        ${raw(ex ? UI.demoHTML(ex, { speed: 800 }) : '')}
        <div style="padding:13px">
          <div class="row between">
            <div class="grow">
              <h2 style="margin:0 0 2px">${entry.name}</h2>
              <div class="tiny">${raw(ex ? UI.esc(ex.name) : '')}${raw(ex && ex.primaryMuscles.length
                ? ' · ' + UI.esc(ex.primaryMuscles.map(I18N.muscle).join(', ')) : '')}</div>
            </div>
            <button class="btn icon" data-w="cambiar"
                    aria-label="Cambiar por otro ejercicio">${raw(icon('cambiar'))}</button>
            <button class="btn icon" data-w="info" aria-label="Ver instrucciones">${raw(icon('search'))}</button>
          </div>
          ${raw(entry.note ? html`<p class="muted" style="margin:8px 0 0">${entry.note}</p>` : '')}
          ${raw(last || pr.best ? html`<div class="row wrap" style="margin-top:10px;gap:6px">
              ${raw(pr.best ? html`<span class="chip solid">Récord: ${UI.kg(pr.best.weight)} × ${pr.best.reps}</span>` : '')}
              ${raw(last ? html`<span class="chip">Última vez: ${last.sets.map(function (s) {
                return UI.num(s.weight) + '×' + s.reps;
              }).join(' · ')}</span>` : '')}
            </div>` : '')}
        </div>
      </div>

      <div class="card">
        ${raw(simple ? html`
          <div class="objetivo">
            <b>${entry.sets.length} × ${entry.targetReps}</b>
            <span>series por repeticiones${raw(entry.rest ? ' · descanso ' + entry.rest + ' s' : '')}</span>
          </div>` : html`
          <div class="setgrid" style="margin-bottom:8px">
            <div class="hd">#</div><div class="hd">${Store.settings().unit === 'lb' ? 'Lb' : 'Kg'}</div>
            <div class="hd">Reps</div><div class="hd"></div>
          </div>`)}

        <div class="stack" id="wo-sets">
          ${raw(entry.sets.map(function (s, i) {
            if (simple) {
              return html`
                <button class="serie-simple ${s.done ? 'on' : ''}" data-set="${i}" data-f="done">
                  <span class="rt-idx">${i + 1}</span>
                  <span class="grow">Serie ${i + 1}</span>
                  <span class="tiny">${entry.targetReps} reps</span>
                  <span class="chk ${s.done ? 'on' : ''}">${raw(icon('check'))}</span>
                </button>`;
            }
            return html`
              <div class="setgrid" data-set="${i}">
                <div class="rt-idx">${i + 1}</div>
                <input type="number" inputmode="decimal" step="0.5" min="0" value="${s.weight}" data-f="weight">
                <input type="number" inputmode="numeric" step="1" min="0" value="${s.reps}" data-f="reps">
                <button class="chk ${s.done ? 'on' : ''}" data-f="done"
                        aria-label="Marcar serie ${i + 1}">${raw(icon('check'))}</button>
              </div>`;
          }).join(''))}
        </div>

        ${raw(simple ? html`
          <div class="row" style="margin-top:12px;align-items:center">
            <span class="tiny grow">Peso usado (opcional)</span>
            <input type="number" inputmode="decimal" step="0.5" min="0" id="peso-opcional"
                   value="${entry.sets[0] && entry.sets[0].weight ? entry.sets[0].weight : ''}"
                   placeholder="—" style="max-width:96px;text-align:center">
            <span class="tiny">${Store.settings().unit}</span>
          </div>` : '')}
        <div class="row" style="margin-top:11px">
          <button class="btn sm grow" data-w="addset">${raw(icon('plus'))} Añadir serie</button>
          ${raw(entry.sets.length > 1
            ? html`<button class="btn sm" data-w="delset">${raw(icon('trash'))}</button>` : '')}
          <button class="btn sm" data-w="rest">${raw(icon('timer'))} ${entry.rest}s</button>
        </div>
      </div>

      <div class="row" style="margin-top:12px">
        <button class="btn grow" data-w="prev" ${a.idx === 0 ? 'disabled' : ''}>${raw(icon('back'))} Anterior</button>
        <button class="btn grow primary" data-w="next">
          ${a.idx === a.entries.length - 1 ? 'Terminar' : 'Siguiente'}
        </button>
      </div>

      <div class="list-title">Ejercicios de hoy</div>
      <div class="stack">
        ${raw(a.entries.map(function (e, i) {
          const exx = Data.get(e.exId);
          const d = e.sets.filter(function (s) { return s.done; }).length;
          return html`
            <button class="rt-item ${i === a.idx ? 'set-current' : ''}" data-goto="${i}"
                    style="${i === a.idx ? 'border-color:var(--acc)' : ''};width:100%;text-align:left">
              <img src="${exx ? Data.img(exx, 0) : Data.PLACEHOLDER}" alt="" loading="lazy">
              <div class="grow">
                <div style="font-weight:600;font-size:.86rem">${e.name}</div>
                <div class="tiny">${d}/${e.sets.length} series · objetivo ${e.targetReps} reps</div>
              </div>
              ${raw(d === e.sets.length ? '<span class="chip solid">Hecho</span>' : '')}
            </button>`;
        }).join(''))}
      </div>

      <button class="btn danger block" data-w="finish" style="margin-top:16px">
        ${raw(icon('flag'))} Terminar y guardar entrenamiento
      </button>
      <button class="btn ghost block" data-w="cancel" style="margin-top:8px">Descartar entrenamiento</button>`;
  }

  /* ---------- interacción ---------- */

  function mount(root, rerender) {
    const a = Store.active();
    if (!a) return;
    const entry = a.entries[a.idx];

    UI.mountDemos(root);
    pintarMusica(root);

    /* cronómetro total */
    const clock = root.querySelector('#wo-clock');
    function paintClock() {
      if (!clock || !Store.active()) return;
      clock.textContent = UI.mmss((Date.now() - Store.active().start) / 1000);
    }
    paintClock();
    clearInterval(clockTimer);
    clockTimer = setInterval(paintClock, 1000);

    /* el descanso sobrevive a los re-render */
    paintRest();

    const simple = Store.settings().registro === 'simple';

    /* en modo simple el peso es uno solo para todo el ejercicio, y es opcional */
    const campoPeso = root.querySelector('#peso-opcional');
    if (campoPeso) {
      campoPeso.onchange = function () {
        const kg = Number(campoPeso.value) || 0;
        entry.sets.forEach(function (s) { s.weight = kg; });
        Store.setActive(a);
      };
    }

    /* pesos y repeticiones */
    root.querySelectorAll('#wo-sets [data-set]').forEach(function (rowEl) {
      const i = Number(rowEl.dataset.set);
      rowEl.querySelectorAll('input').forEach(function (inp) {
        inp.onchange = function () {
          entry.sets[i][inp.dataset.f] = Number(inp.value) || 0;
          Store.setActive(a);
        };
      });
      const marcar = rowEl.matches('[data-f=done]') ? rowEl : rowEl.querySelector('[data-f=done]');
      marcar.onclick = function (e) {
        const btn = e.currentTarget;
        const set = entry.sets[i];
        set.done = !set.done;

        if (simple) {
          /* sin campos: se da por hecho el objetivo de la rutina */
          set.reps = entry.targetReps;
          set.weight = campoPeso ? (Number(campoPeso.value) || 0) : (set.weight || 0);
          btn.classList.toggle('on', set.done);
          const marca = btn.querySelector('.chk');
          if (marca) marca.classList.toggle('on', set.done);
        } else {
          set.weight = Number(rowEl.querySelector('[data-f=weight]').value) || 0;
          set.reps = Number(rowEl.querySelector('[data-f=reps]').value) || 0;
          btn.classList.toggle('on', set.done);
        }
        Store.setActive(a);

        if (set.done) {
          const prev = Store.prOf(entry.exId).best;
          if (!simple && set.weight > 0 && (!prev || set.weight > prev.weight)) {
            UI.toast('¡Nuevo récord en ' + entry.name + '!');
          }
          startRest(entry.rest);
          /* la barra de progreso de la cabecera se actualiza sin recargar la vista */
          const totalSets = a.entries.reduce(function (n, x) { return n + x.sets.length; }, 0);
          const doneSets = a.entries.reduce(function (n, x) {
            return n + x.sets.filter(function (s) { return s.done; }).length;
          }, 0);
          const bar = root.querySelector('.prog i');
          if (bar) bar.style.width = Math.round(doneSets / totalSets * 100) + '%';
          const cnt = root.querySelector('#wo-count');
          if (cnt) cnt.textContent = doneSets;
        } else {
          skipRest();
          const cnt = root.querySelector('#wo-count');
          const bar = root.querySelector('.prog i');
          const total = a.entries.reduce(function (n, x) { return n + x.sets.length; }, 0);
          const hechas = a.entries.reduce(function (n, x) {
            return n + x.sets.filter(function (y) { return y.done; }).length;
          }, 0);
          if (cnt) cnt.textContent = hechas;
          if (bar) bar.style.width = Math.round(hechas / total * 100) + '%';
        }
      };
    });

    function act(name, fn) {
      const el = root.querySelector('[data-w=' + name + ']');
      if (el) el.onclick = fn;
    }

    act('addset', function () {
      const lastSet = entry.sets[entry.sets.length - 1];
      entry.sets.push({ weight: lastSet ? lastSet.weight : 0, reps: entry.targetReps, done: false });
      Store.setActive(a); rerender();
    });

    act('delset', function () {
      if (entry.sets.length > 1) { entry.sets.pop(); Store.setActive(a); rerender(); }
    });

    act('rest', function () { startRest(entry.rest); });

    act('prev', function () {
      if (a.idx > 0) { a.idx--; Store.setActive(a); rerender(); }
    });

    act('next', function () {
      if (a.idx < a.entries.length - 1) { a.idx++; Store.setActive(a); rerender(); }
      else doFinish();
    });

    act('info', function () {
      const ex = Data.get(entry.exId);
      if (ex && g.App) g.App.exerciseSheet(ex);
    });

    /* La máquina está ocupada: se cambia el ejercicio sin perder las series
       ya marcadas ni el sitio en el entrenamiento. */
    act('cambiar', function () {
      const ex = Data.get(entry.exId);
      if (ex) cambiarSheet(ex, rerender);
    });

    act('finish', doFinish);

    act('cancel', function () {
      UI.confirm('Descartar entrenamiento',
        'Se perderán las series registradas en esta sesión. Esta acción no se puede deshacer.',
        'Descartar', true).then(function (ok) {
        if (ok) { discard(); g.App.go('inicio'); UI.toast('Entrenamiento descartado'); }
      });
    });

    root.querySelectorAll('[data-goto]').forEach(function (btn) {
      btn.onclick = function () {
        a.idx = Number(btn.dataset.goto);
        Store.setActive(a); rerender();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });
  }

  /* Reproductor de Spotify durante la sesión, si está conectado */
  /* ---- Cambiar el ejercicio en marcha ----
     Pasa constantemente: la máquina está ocupada. Se ofrece el mismo trabajo
     con otro material y se conserva lo que ya llevas hecho: las series ya
     marcadas se quedan con el ejercicio original y el recambio arranca con
     las que faltan. */
  function cambiarSheet(ex, rerender) {
    const gear = Store.settings().gear || '';
    let lista = g.Alt ? Alt.para(ex, { limite: 10, soloDisponible: !!gear }) : [];
    let fuera = false;
    if (lista.length < 2 && g.Alt) {
      lista = Alt.para(ex, { limite: 10, gear: '' });
      fuera = true;
    }

    if (!lista.length) {
      UI.toast('No encuentro un recambio para este ejercicio');
      return;
    }

    UI.modal(UI.html`
      <h2>Cambiar «${ex.nameEs}»</h2>
      <p class="muted">${raw(fuera
        ? 'Con tu material no hay recambio directo; estas son del catálogo completo.'
        : 'Mismo trabajo, otro material. Las series que ya has marcado no se pierden.')}</p>
      <div class="stack">
        ${raw(lista.map(function (a) {
          return UI.html`
            <button class="rt-item" data-alt="${a.ex.id}" style="width:100%;text-align:left">
              <img src="${Data.img(a.ex, 0)}" alt="" loading="lazy">
              <div class="grow">
                <div style="font-weight:600;font-size:.86rem">${a.ex.nameEs}</div>
                <div class="tiny">${a.motivo} · ${I18N.equip(a.ex.equipment)}</div>
              </div>
            </button>`;
        }).join(''))}
      </div>`,
      function (el) {
        el.querySelectorAll('[data-alt]').forEach(function (btn) {
          btn.onclick = function () {
            reemplazarEjercicio(Data.get(btn.dataset.alt));
            UI.closeModal();
            rerender();
            UI.toast('Ejercicio cambiado');
          };
        });
      });
  }

  function reemplazarEjercicio(nuevo) {
    const a = Store.active();
    if (!a || !nuevo) return;
    const e = a.entries[a.idx];
    const hechas = e.sets.filter(function (s) { return s.done; }).length;
    const last = Store.lastPerformance(nuevo.id);
    const peso = last && last.sets.length ? Number(last.sets[0].weight) || 0 : 0;

    const entrada = {
      exId: nuevo.id,
      name: nuevo.nameEs,
      targetReps: e.targetReps,
      rest: e.rest,
      note: e.note,
      sets: Array.from({ length: Math.max(1, e.sets.length - hechas) }, function () {
        return { weight: peso, reps: e.targetReps, done: false };
      })
    };

    if (hechas) {
      /* lo ya hecho se queda con su ejercicio; el recambio continúa detrás */
      e.sets = e.sets.filter(function (s) { return s.done; });
      a.entries.splice(a.idx + 1, 0, entrada);
      a.idx += 1;
    } else {
      a.entries[a.idx] = entrada;
    }
    Store.setActive(a);
  }

  function pintarMusica(root) {
    const host = root.querySelector('#wo-musica');
    if (!host || !g.Spotify || !Spotify.activa()) return;

    const pintar = function (s) {
      if (s) {
        host.innerHTML = g.Reproductor.html(s);
        g.Reproductor.montar(host);
        return;
      }
      /* nada sonando: acceso directo a la música sin salir del entrenamiento */
      host.innerHTML = html`
        <button class="card row" data-w="musica" style="width:100%;text-align:left;gap:11px">
          <span class="row-icon">${raw(icon('musica'))}</span>
          <span class="grow" style="font-weight:600;font-size:.92rem">Poner música</span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>`;
      const b = host.querySelector('[data-w=musica]');
      if (b) b.onclick = function () { g.App.go('musica'); };
    };

    Spotify.sonando()
      .then(pintar)
      .catch(function () { pintar(null); });

    /* el reproductor propio avisa de cada cambio de canción */
    if (Spotify.alCambiar) Spotify.alCambiar(function (s) { if (s) pintar(s); });
  }

  function doFinish() {
    const a = Store.active();
    if (!a) return;
    const done = a.entries.reduce(function (n, e) {
      return n + e.sets.filter(function (s) { return s.done; }).length;
    }, 0);

    if (!done) {
      UI.confirm('Sin series marcadas',
        'No has marcado ninguna serie como completada. ¿Quieres descartar el entrenamiento?',
        'Descartar', true).then(function (ok) {
        if (ok) { discard(); g.App.go('inicio'); }
      });
      return;
    }

    UI.confirm('Terminar entrenamiento',
      'Se guardarán ' + done + (done === 1 ? ' serie completada.' : ' series completadas.'),
      'Guardar').then(function (ok) {
      if (!ok) return;
      const s = finish();
      g.App.go('inicio');
      UI.toast('¡Entrenamiento guardado! Volumen: ' + UI.kg(s.volume));
    });
  }

  g.Workout = {
    start: start, view: view, mount: mount, isActive: isActive,
    finish: finish, discard: discard, stopTimers: stopTimers
  };
})(window);
