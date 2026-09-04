/* vistas4.js — el programa de entrenamiento personal.
   Enseña qué ha entendido la app de tu perfil, deja ajustar los cuatro datos
   que cambian el plan y presenta el programa con el porqué de cada decisión:
   sin la explicación, un plan es una lista de ejercicios y no hay forma de
   saber si sirve. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const FOCOS = [
    { id: 'equilibrado', label: 'Equilibrado' },
    { id: 'gluteo', label: 'Glúteo' },
    { id: 'pierna', label: 'Pierna' },
    { id: 'pecho', label: 'Pecho' },
    { id: 'espalda', label: 'Espalda' },
    { id: 'hombro', label: 'Hombro' },
    { id: 'brazo', label: 'Brazo' },
    { id: 'core', label: 'Core' }
  ];

  /* El plan y la lectura del entrenador se guardan en el dispositivo. Antes
     vivían en memoria: salías de la pantalla y había que generarlo otra vez y,
     lo que es peor, pagar otra llamada a la IA para volver a leer lo mismo. */
  const CLAVE = 'trainingfr.programa';

  let est = {
    dias: ['Lun', 'Mar', 'Jue', 'Vie'],
    minutos: 60,
    objetivo: '',
    foco: 'equilibrado',
    nombre: '',
    prog: null,
    ia: null,
    aplicados: [],
    cargandoIA: false,
    abierto: {}
  };

  (function recuperar() {
    try {
      const x = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (!x || x.v !== 1) return;
      ['dias', 'minutos', 'objetivo', 'foco', 'nombre', 'prog', 'ia'].forEach(function (k) {
        if (x[k] !== undefined && x[k] !== null) est[k] = x[k];
      });
      est.aplicados = x.aplicados || [];
    } catch (e) { /* si el guardado está roto, se empieza de cero */ }
  })();

  function guardarEstado() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        v: 1, ts: Date.now(),
        dias: est.dias, minutos: est.minutos, objetivo: est.objetivo, foco: est.foco,
        nombre: est.nombre, prog: est.prog, ia: est.ia, aplicados: est.aplicados
      }));
    } catch (e) { /* sin sitio: el plan sigue en pantalla, solo no sobrevive */ }
  }

  function objetivoActual() {
    if (est.objetivo) return est.objetivo;
    const p = Perfil.datos();
    return Programa.OBJETIVOS[p.objetivo] ? p.objetivo : 'mantener';
  }

  /* ---------- lo que la app sabe de ti ---------- */
  function fichaPerfil(p) {
    const nivel = { beginner: 'Principiante', intermediate: 'Intermedio', expert: 'Avanzado' };
    const lesiones = Programa.lesionesDe(p.lesiones)
      .map(function (k) { return Programa.LESIONES[k].label; });

    return html`
      <div class="card">
        <div class="row between" style="align-items:flex-start">
          <div class="grow">
            <div class="tiny" style="color:var(--acc)">TU PERFIL</div>
            <div class="row wrap" style="gap:6px;margin-top:8px">
              <span class="chip">${p.sexo === 'mujer' ? 'Mujer' : 'Hombre'}</span>
              <span class="chip">${p.edad} años</span>
              <span class="chip">${p.peso} kg · ${p.altura} cm</span>
              <span class="chip">${nivel[p.experiencia] || 'Intermedio'}</span>
              <span class="chip">Duerme ${p.sueño} h</span>
              ${raw(lesiones.map(function (l) {
                return '<span class="chip solid">' + esc(l) + '</span>';
              }).join(''))}
            </div>
          </div>
          <button class="btn sm" data-a="editarperfil">Editar</button>
        </div>
        ${raw(lesiones.length ? html`
          <p class="tiny" style="margin:10px 0 0">De lo que has escrito en limitaciones he
          entendido: <b>${lesiones.join(', ')}</b>. Abajo verás qué se evita por eso.</p>`
        : html`
          <p class="tiny" style="margin:10px 0 0">Sin limitaciones apuntadas. Si tienes alguna
          molestia, escríbela en el perfil y el plan la esquiva.</p>`)}
      </div>`;
  }

  /* ---------- controles ---------- */
  function controles() {
    return html`
      <div class="card">
        <div class="row between" style="margin-bottom:9px">
          <b>¿Qué días entrenas?</b>
          <span class="chip solid">${est.dias.length} ${est.dias.length === 1 ? 'día' : 'días'}</span>
        </div>
        <div class="row wrap" style="gap:6px">
          ${raw(DIAS.map(function (d) {
            return '<button class="chip ' + (est.dias.indexOf(d) !== -1 ? 'on' : '') +
              '" data-dia="' + d + '">' + UI.diaLargo(d) + '</button>';
          }).join(''))}
        </div>
      </div>

      <div class="card">
        <b>¿Cuánto dura cada sesión?</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw([30, 45, 60, 75, 90].map(function (m) {
            return '<button class="chip ' + (est.minutos === m ? 'on' : '') +
              '" data-min="' + m + '">' + m + ' min</button>';
          }).join(''))}
        </div>
      </div>

      <div class="card">
        <b>¿Qué buscas entrenando?</b>
        <div class="row wrap" style="gap:6px;margin-top:9px">
          ${raw(Object.keys(Programa.OBJETIVOS).map(function (k) {
            return '<button class="chip ' + (objetivoActual() === k ? 'on' : '') +
              '" data-obj="' + k + '">' + esc(Programa.OBJETIVOS[k].label) + '</button>';
          }).join(''))}
        </div>
        <p class="tiny" style="margin:10px 0 0">${Programa.OBJETIVOS[objetivoActual()].resumen}</p>
      </div>

      <div class="card">
        <b>¿Quieres priorizar alguna zona?</b>
        <div class="pill-scroll" style="margin:9px -4px 0;padding-left:0">
          ${raw(FOCOS.map(function (f) {
            return '<button class="chip ' + (est.foco === f.id ? 'on' : '') +
              '" data-foco="' + f.id + '">' + esc(f.label) + '</button>';
          }).join(''))}
        </div>
        <p class="tiny" style="margin:10px 0 0">Añade una serie extra de esa zona en los días
        que ya la trabajan. El resto del plan no se toca.</p>
      </div>

      <button class="btn primary block grande" data-a="crear" style="margin-top:4px">
        ${raw(icon('chispa'))} ${est.prog ? 'Rehacer el programa' : 'Crear mi programa'}
      </button>`;
  }

  /* ---------- el programa ---------- */

  function barraVolumen(prog) {
    const musculos = Object.keys(prog.volumen).sort(function (a, b) {
      return prog.volumen[b] - prog.volumen[a];
    });
    if (!musculos.length) return '';
    const tope = Math.max(prog.objetivoSeries, prog.volumen[musculos[0]]);

    const real = prog.real;
    const topeReal = real ? Math.max.apply(null, [0].concat(musculos.map(function (m) {
      return real.porMusculo[m] || 0;
    }))) : 0;
    const escala = Math.max(tope, topeReal);

    return html`
      <div class="list-title">Series por semana</div>
      <p class="tiny" style="margin:-4px 4px 10px">La línea es tu objetivo:
      <b>${prog.objetivoSeries} series</b> semanales por músculo. Debajo de 8 el estímulo se
      queda corto; muy por encima ya no se recupera.${raw(real
        ? ' La barra fina de debajo es lo que has hecho de verdad estas ' + real.semanas +
          ' semanas, para que se vea la distancia entre el plan y la realidad.'
        : ' Cuando lleves unas semanas entrenando, aquí saldrá también lo que haces de verdad.')}</p>
      <div class="card">
        ${raw(musculos.map(function (m) {
          const v = prog.volumen[m];
          const pct = Math.round(v / escala * 100);
          const meta = Math.round(prog.objetivoSeries / escala * 100);
          const flojo = v < 8;
          const hecho = real ? (real.porMusculo[m] || 0) : null;
          return html`
            <div class="vol-fila">
              <span class="vol-nom">${I18N.muscle(m)}</span>
              <span class="vol-barra">
                <i style="width:${pct}%${raw(flojo ? ';background:var(--warn)' : '')}"></i>
                <u style="left:${meta}%"></u>
                ${raw(real ? '<b class="vol-real" style="width:' +
                  Math.round(hecho / escala * 100) + '%"></b>' : '')}
              </span>
              <span class="vol-num">${String(v).replace('.', ',')}${raw(real
                ? '<span class="vol-hecho">' + String(hecho).replace('.', ',') + '</span>' : '')}</span>
            </div>`;
        }).join(''))}
        ${raw(real ? html`
          <p class="tiny" style="margin:10px 0 0">Barra gruesa: el plan. Barra fina: tú, de
          media, en las últimas ${real.semanas} semanas (${real.sesiones}
          ${real.sesiones === 1 ? 'entrenamiento' : 'entrenamientos'} guardados).</p>` : '')}
      </div>`;
  }

  function tarjetaDia(s, i, prog) {
    const abierto = est.abierto[i] !== false;
    return html`
      <div class="card" style="padding:0;overflow:hidden">
        <button class="dia-cab" data-dia-abrir="${i}">
          <div class="grow">
            <div style="font-weight:700">${s.nombre}</div>
            <div class="tiny">${s.ejercicios.length} ejercicios · ${s.minutos} min ·
              ${s.ejercicios.reduce(function (n, e) { return n + e.sets; }, 0)} series</div>
          </div>
          <span class="chevron ${abierto ? 'abierta' : ''}">${raw(icon('chevron'))}</span>
        </button>
        <div ${raw(abierto ? '' : 'hidden')}>
          ${raw(s.ejercicios.map(function (e, n) {
            const ex = Data.get(e.exId);
            return html`
              <button class="rt-item" data-ver="${e.exId}" style="width:100%;text-align:left;
                      border:0;border-top:1px solid var(--line);border-radius:0">
                <img src="${ex ? Data.img(ex, 0) : Data.PLACEHOLDER}" alt="" loading="lazy">
                <div class="grow">
                  <div style="font-weight:600;font-size:.86rem">
                    ${n + 1}. ${ex ? ex.nameEs : e.exId}
                    ${raw(e.rol === 'principal' ? '<span class="chip solid tiny-chip">Principal</span>' : '')}
                  </div>
                  <div class="tiny">${e.sets} × ${e.reps} · descanso ${e.rest}s ·
                    ${I18N.muscle(e.musculo)}</div>
                  ${raw(e.note ? '<div class="tiny" style="color:var(--acc)">' + esc(e.note) + '</div>' : '')}
                </div>
              </button>`;
          }).join(''))}
        </div>
      </div>`;
  }

  function colorNota(n) {
    if (n >= 8) return 'var(--acc)';
    if (n >= 6) return 'var(--warn)';
    return 'var(--bad)';
  }

  const ETIQUETA_ACCION = {
    cambiar: 'Sustituir', quitar: 'Quitar', anadir: 'Añadir'
  };

  /* Cómo se lee un cambio antes de aplicarlo. Escrito como lo diría alguien de
     viva voz: qué se toca y a cambio de qué. */
  function textoCambio(c) {
    const acc = accionDe(c);
    if (acc === 'quitar') return html`<b>${c.quitar}</b>`;
    if (acc === 'anadir') {
      const donde = Number(c.dia) > 0 && est.prog.sesiones[Number(c.dia) - 1]
        ? ' en ' + est.prog.sesiones[Number(c.dia) - 1].nombre : '';
      return html`<b>${c.poner}</b>${donde}`;
    }
    return html`<b>${c.poner}</b> en lugar de ${c.quitar}`;
  }

  function accionDe(c) {
    const a = String(c.accion || '').toLowerCase().replace('ñ', 'n');
    if (a === 'quitar' || a === 'eliminar' || a === 'sacar') return 'quitar';
    if (a === 'anadir' || a === 'agregar' || a === 'meter' || a === 'sumar') return 'anadir';
    if (a === 'cambiar' || a === 'sustituir' || a === 'reemplazar') return 'cambiar';
    /* sin acción declarada se deduce de lo que venga relleno */
    if (c.quitar && c.poner) return 'cambiar';
    if (c.poner) return 'anadir';
    return 'quitar';
  }

  function bloqueIA() {
    if (est.cargandoIA) {
      return html`<div class="card center"><div class="spinner" style="margin:6px auto"></div>
        <p class="tiny" style="margin:8px 0 0">El entrenador está auditando tu programa…</p></div>`;
    }
    const r = est.ia;
    if (!r) {
      return html`
        <button class="btn ${IA.activa() ? 'primary' : ''} block" data-a="afinar"
                style="margin-top:12px">
          ${raw(icon('chispa'))} Que un entrenador con IA audite tu plan
        </button>
        <p class="tiny center" style="margin:7px 4px 0">${raw(IA.activa()
          ? 'No viene a darte la razón: le pedimos que le ponga nota, que señale lo que '
            + 'falla y que proponga quitar, meter o cambiar ejercicios. Lo que diga se '
            + 'queda guardado y se aplica de un toque.'
          : 'Necesita la clave de Gemini, que se configura en la bóveda de Ajustes. Sin ella '
            + 'el plan funciona igual, pero esta lectura no.')}</p>`;
    }

    const nota = Number(r.nota);
    const pendientes = (r.cambios || []).length;

    return html`
      <div class="list-head">
        <span class="list-title">Lo que dice el entrenador</span>
        <button class="btn sm ghost" data-a="olvidaIA">Descartar</button>
      </div>

      <div class="card">
        ${raw(nota > 0 ? html`
          <div class="row" style="gap:12px;align-items:center;margin-bottom:10px">
            <div style="flex:none;font-size:1.9rem;font-weight:700;line-height:1;
                        color:${raw(colorNota(nota))}">${nota}<span
                 style="font-size:.9rem;color:var(--dim2)">/10</span></div>
            <div class="tiny grow">Nota que le pone a este plan tal y como está ahora.</div>
          </div>` : '')}
        <p style="margin:0 0 10px">${r.veredicto || ''}</p>
        ${raw((r.puntos || []).map(function (x) {
          return '<div class="error-item"><b>' + esc(x.titulo || '') + '</b><p>' +
            esc(x.detalle || '') + '</p></div>';
        }).join(''))}
      </div>

      ${raw(r.nutricion ? html`
        <div class="card">
          <b>${raw(icon('nutricion'))} De comida</b>
          <p class="muted" style="margin:6px 0 0">${r.nutricion}</p>
        </div>` : '')}

      ${raw(pendientes ? html`
        <div class="card">
          <b>Cambios que propone</b>
          <div class="stack" style="margin-top:9px">
            ${raw((r.cambios || []).map(function (c, i) {
              const acc = accionDe(c);
              return html`
                <div class="row between" style="gap:10px;align-items:flex-start">
                  <div class="grow">
                    <div style="font-size:.86rem">
                      <span class="chip tiny-chip">${ETIQUETA_ACCION[acc] || acc}</span>
                      ${raw(textoCambio(c))}</div>
                    <div class="tiny">${c.porque || ''}</div>
                  </div>
                  <div class="row" style="gap:6px;flex:none">
                    <button class="btn sm" data-cambio="${i}">Aplicar</button>
                    <button class="btn sm ghost" data-nocambio="${i}"
                            aria-label="Descartar">✕</button>
                  </div>
                </div>`;
            }).join(''))}
          </div>
          <p class="tiny" style="margin:10px 0 0">Cada cambio se comprueba antes de aplicarlo:
          si el ejercicio no existe, no cabe con tu material o choca con tus limitaciones,
          se descarta. Lo que apliques se guarda y viaja a tus rutinas al pulsar Guardar.</p>
        </div>` : '')}

      ${raw(est.aplicados.length ? html`
        <div class="card">
          <b>Ya aplicado</b>
          <div class="stack" style="margin-top:8px">
            ${raw(est.aplicados.map(function (t) {
              return '<div class="tiny">✓ ' + esc(t) + '</div>';
            }).join(''))}
          </div>
          <p class="tiny" style="margin:9px 0 0">Estos cambios ya están en el plan de arriba.
          Se guardan con él; para que lleguen a tus rutinas pulsa
          <b>Guardar mis rutinas</b>.</p>
        </div>` : '')}

      ${raw(r.consejo ? html`
        <div class="card destacado-clave">
          <h3 class="guia-h">${raw(icon('chispa'))} Si solo haces una cosa</h3>
          <p style="margin:0">${r.consejo}</p>
        </div>` : '')}`;
  }

  function resultado(prog) {
    const series = prog.sesiones.reduce(function (n, s) {
      return n + s.ejercicios.reduce(function (m, e) { return m + e.sets; }, 0);
    }, 0);

    return html`
      <div class="stats" style="margin-top:16px">
        <div class="stat"><b>${prog.sesiones.length}</b><span>Días</span></div>
        <div class="stat"><b>${series}</b><span>Series semana</span></div>
        <div class="stat"><b>RPE ${prog.rpe}</b><span>Esfuerzo tope</span></div>
      </div>

      <div class="list-title">Por qué este plan</div>
      <p class="tiny" style="margin:-4px 4px 10px">Esto lo calcula la app con tus datos, sin
      pedirle nada a nadie: por eso funciona sin conexión y sin clave. La lectura de un
      entrenador, que es otra cosa, está justo debajo.</p>
      <div class="card">
        ${raw(prog.razones.map(function (t, i) {
          return '<div class="razon"><span class="rt-idx">' + (i + 1) + '</span><p>' +
            esc(t) + '</p></div>';
        }).join(''))}
      </div>

      ${raw(bloqueIA())}

      ${raw(prog.avisos.length ? html`
        <div class="list-title">Lo que evito por tus limitaciones</div>
        <div class="card aviso-seguridad">
          ${raw(prog.avisos.map(function (t) {
            return '<p style="margin:0 0 8px">' + esc(t) + '</p>';
          }).join(''))}
          <p class="tiny" style="margin:6px 0 0">Con una lesión diagnosticada, esto no
          sustituye a tu fisio: enséñale el plan antes de empezar.</p>
        </div>` : '')}

      ${raw(barraVolumen(prog))}

      <div class="list-title">Tu semana</div>
      <div class="stack">
        ${raw(prog.sesiones.map(function (s, i) { return tarjetaDia(s, i, prog); }).join(''))}
      </div>

      <div class="list-title">Cómo progresar</div>
      <p class="tiny" style="margin:-4px 4px 10px">Repetir el mismo peso cinco semanas no
      construye nada. Este es el bloque:</p>
      <div class="card">
        ${raw(prog.progresion.map(function (x) {
          return '<div class="fase-txt"><b>' + esc(x.semana) + '</b><p>' + esc(x.texto) + '</p></div>';
        }).join(''))}
      </div>

      ${raw(prog.cardio ? html`
        <div class="card">
          <b>Fuera del gimnasio</b>
          <p class="muted" style="margin:6px 0 0">${prog.cardio}</p>
        </div>` : '')}

      <div class="card" style="margin-top:16px">
        <label class="tiny">CÓMO QUIERES LLAMARLAS</label>
        <div class="tiny" style="margin:2px 0 0">Cada rutina se llamará «día · lo que pongas
        aquí». Déjalo vacío y uso el nombre de cada sesión.</div>
        <input id="prog-nombre" value="${est.nombre}" placeholder="Ej. Mi plan de otoño"
               style="margin:6px 0 0">
      </div>

      <div class="row" style="margin-top:12px">
        <button class="btn grow" data-a="otra">Otra propuesta</button>
        <button class="btn primary grow" data-a="guardar">Guardar mis rutinas</button>
      </div>
      <p class="tiny center" style="margin-top:8px">Se crean ${prog.sesiones.length} rutinas
      con sus días asignados. Lo que ya tengas no se borra.</p>`;
  }

  /* ---------- vista ---------- */

  V.programa = function () {
    const p = Perfil.datos();

    if (!Perfil.completo(p)) {
      return html`
        <h1>Tu programa</h1>
        <p class="muted">Para que el plan sea tuyo de verdad y no una plantilla, necesito
        cuatro datos: sexo, edad, altura y peso. Con eso ajusto el volumen, las repeticiones,
        los descansos y el esfuerzo al que llegas.</p>
        <div class="card center">
          <p class="muted" style="margin-bottom:12px">Te llevo un minuto rellenarlo.</p>
          <button class="btn primary block" data-a="editarperfil">Completar mi perfil</button>
        </div>
        <button class="btn ghost block sm" data-a="plangenerico" style="margin-top:10px">
          O crear un plan genérico sin perfil</button>`;
    }

    return html`
      <h1>Tu programa</h1>
      <p class="muted">Construido con tu perfil: sexo, edad, nivel, objetivo y limitaciones.
      No es una plantilla con tu nombre encima.</p>

      ${raw(fichaPerfil(p))}
      ${raw(controles())}
      ${raw(est.prog ? resultado(est.prog) : '')}`;
  };

  V.programa.mount = function (root) {
    bind(root, '[data-a=editarperfil]', function () { go('datos'); });
    bind(root, '[data-a=plangenerico]', function () { go('plan'); });

    bindAll(root, '[data-dia]', function (el) {
      const d = el.dataset.dia;
      const i = est.dias.indexOf(d);
      if (i === -1) {
        if (est.dias.length >= 6) { UI.toast('Seis días es el máximo recomendable'); return; }
        est.dias.push(d);
        est.dias.sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); });
      } else est.dias.splice(i, 1);
      el.classList.toggle('on', i === -1);
      const chip = root.querySelector('.chip.solid');
      if (chip) chip.textContent = est.dias.length + (est.dias.length === 1 ? ' día' : ' días');
    });

    bindAll(root, '[data-min]', function (el) {
      est.minutos = Number(el.dataset.min); guardarEstado(); render();
    });
    bindAll(root, '[data-obj]', function (el) {
      est.objetivo = el.dataset.obj; guardarEstado(); render();
    });
    bindAll(root, '[data-foco]', function (el) {
      est.foco = el.dataset.foco; guardarEstado(); render();
    });

    bind(root, '[data-a=crear]', crear);
    bind(root, '[data-a=otra]', crear);

    bindAll(root, '[data-dia-abrir]', function (el) {
      const i = el.dataset.diaAbrir;
      est.abierto[i] = est.abierto[i] === false;
      render();
    });

    bindAll(root, '[data-ver]', function (el) {
      const ex = Data.get(el.dataset.ver);
      if (ex) App.exerciseSheet(ex);
    });

    bind(root, '[data-a=guardar]', function () {
      const campo = root.querySelector('#prog-nombre');
      est.nombre = campo ? campo.value.trim() : '';
      guardarEstado();
      const rutinas = Programa.aRutinas(est.prog, est.nombre);
      rutinas.forEach(function (r) { Store.saveRoutine(r); });
      UI.toast(rutinas.length + ' rutinas creadas con sus días');
      go('rutinas');
      Offline.precargarRutinas();
    });

    bind(root, '[data-a=afinar]', afinar);
    bindAll(root, '[data-cambio]', function (el) { aplicarCambio(Number(el.dataset.cambio)); });

    bindAll(root, '[data-nocambio]', function (el) {
      est.ia.cambios.splice(Number(el.dataset.nocambio), 1);
      guardarEstado();
      render();
    });

    bind(root, '[data-a=olvidaIA]', function () {
      UI.confirm('Descartar la lectura', 'Se borra lo que dijo el entrenador y la lista de ' +
        'cambios que quedan sin aplicar. Los que ya aplicaste siguen en el plan.',
        'Descartar', true).then(function (ok) {
        if (!ok) return;
        est.ia = null;
        est.aplicados = [];
        guardarEstado();
        render();
      });
    });
  };

  function crear() {
    if (!est.dias.length) { UI.toast('Elige al menos un día de entrenamiento'); return; }
    est.prog = Programa.crear({
      dias: est.dias, minutos: est.minutos, objetivo: objetivoActual(),
      foco: est.foco, gear: Store.settings().gear
    });
    est.ia = null;
    est.aplicados = [];
    est.abierto = {};
    guardarEstado();
    render();
    const caja = document.querySelector('.stats');
    if (caja) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function afinar() {
    if (!IA.activa()) { go('claves'); UI.toast('Configura la clave de Gemini para esto'); return; }
    est.cargandoIA = true;
    render();
    IA.afinarPrograma(est.prog)
      .then(function (r) { est.ia = r; est.aplicados = []; })
      .catch(function (e) { UI.toast(e.message); })
      .then(function () { est.cargandoIA = false; guardarEstado(); render(); });
  }

  /* ---------- aplicar lo que propone el entrenador ----------
     Un cambio solo entra si el ejercicio existe de verdad en el catálogo, lo
     permite el material y no choca con las limitaciones. La IA se inventa
     nombres de vez en cuando y propone cosas que la persona no puede hacer:
     validar aquí es lo que separa una sugerencia de un destrozo. */

  function delCatalogo(nombre) {
    const gear = Store.settings().gear;
    const cand = Data.search({ q: String(nombre || ''), gear: gear });
    return cand[0] || null;
  }

  function chocaConLesiones(ex) {
    const claves = Programa.lesionesDe(Perfil.datos().lesiones);
    const patron = Alt.patron(ex);
    return claves.some(function (k) {
      return (Programa.LESIONES[k].patronesFuera || []).indexOf(patron) !== -1;
    });
  }

  /* Busca en el plan el ejercicio que la IA nombra. Primero exacto; si no,
     por coincidencia parcial, que los nombres los repite de memoria y a veces
     se deja media palabra. */
  function enElPlan(nombre) {
    const buscado = I18N.norm(String(nombre || ''));
    if (!buscado) return null;
    let exacto = null;
    let parecido = null;

    est.prog.sesiones.forEach(function (ses) {
      ses.ejercicios.forEach(function (e, i) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        const n = I18N.norm(ex.nameEs);
        if (!exacto && (n === buscado || ex.id === nombre)) exacto = { ses: ses, i: i, ex: ex };
        if (!parecido && (n.indexOf(buscado) !== -1 || buscado.indexOf(n) !== -1)) {
          parecido = { ses: ses, i: i, ex: ex };
        }
      });
    });
    return exacto || parecido;
  }

  /* Los minutos de la sesión dejan de valer en cuanto se mete o se saca algo.
     Es una cuenta gruesa —series por descanso más el trabajo— pero es la misma
     que hace programa.js y evita que el plan diga 60 min y dure 75. */
  function minutosDe(ejercicio) {
    return Math.round(ejercicio.sets * ((ejercicio.rest || 75) + 35) / 60);
  }

  function apuntarAplicado(texto) {
    est.aplicados.push(texto);
    Programa.revolumen(est.prog);
    guardarEstado();
    render();
    UI.toast(texto);
  }

  function aplicarCambio(i) {
    const c = (est.ia.cambios || [])[i];
    if (!c) return;
    const accion = accionDe(c);

    if (accion === 'quitar') {
      const sitio = enElPlan(c.quitar);
      if (!sitio) { UI.toast('Ya no está «' + (c.quitar || '') + '» en el plan.'); return; }
      if (sitio.ses.ejercicios.length <= 2) {
        UI.toast('Ese día se quedaría en un ejercicio. No lo quito.');
        return;
      }
      sitio.ses.minutos = Math.max(15, sitio.ses.minutos -
        minutosDe(sitio.ses.ejercicios[sitio.i]));
      sitio.ses.ejercicios.splice(sitio.i, 1);
      est.ia.cambios.splice(i, 1);
      apuntarAplicado('Fuera ' + sitio.ex.nameEs + ' de ' + sitio.ses.nombre);
      return;
    }

    const nuevo = delCatalogo(c.poner);
    if (!nuevo) {
      UI.toast('No encuentro «' + (c.poner || '') + '» en el catálogo. Cambio descartado.');
      est.ia.cambios.splice(i, 1);
      guardarEstado();
      render();
      return;
    }
    if (chocaConLesiones(nuevo)) {
      UI.toast('«' + nuevo.nameEs + '» no encaja con tus limitaciones. Cambio descartado.');
      est.ia.cambios.splice(i, 1);
      guardarEstado();
      render();
      return;
    }

    if (accion === 'anadir') {
      const n = Number(c.dia);
      const destino = (n > 0 && est.prog.sesiones[n - 1]) || est.prog.sesiones
        .slice()
        .sort(function (a, b) { return a.ejercicios.length - b.ejercicios.length; })[0];
      if (!destino) return;

      const repetido = destino.ejercicios.some(function (e) { return e.exId === nuevo.id; });
      if (repetido) {
        UI.toast('«' + nuevo.nameEs + '» ya está en ese día.');
        est.ia.cambios.splice(i, 1);
        guardarEstado();
        render();
        return;
      }

      const modelo = destino.ejercicios[destino.ejercicios.length - 1] || {};
      const entra = {
        exId: nuevo.id,
        patron: Alt.patron(nuevo),
        musculo: (nuevo.primaryMuscles || [])[0] || modelo.musculo || 'abdominals',
        rol: 'accesorio',
        sets: Math.min(6, Number(c.series) || modelo.sets || 3),
        reps: Math.min(60, Number(c.reps) || modelo.reps || 12),
        weight: 0,
        rest: modelo.rest || 75,
        note: 'Lo mete el entrenador: ' + (c.porque || '')
      };
      destino.ejercicios.push(entra);
      destino.minutos += minutosDe(entra);
      est.ia.cambios.splice(i, 1);
      apuntarAplicado('Entra ' + nuevo.nameEs + ' en ' + destino.nombre);
      return;
    }

    /* sustituir */
    const sitio = enElPlan(c.quitar);
    if (!sitio) { UI.toast('Ya no está «' + (c.quitar || '') + '» en el plan.'); return; }
    const antes = sitio.ex.nameEs;
    const e = sitio.ses.ejercicios[sitio.i];
    e.exId = nuevo.id;
    e.patron = Alt.patron(nuevo);
    e.musculo = (nuevo.primaryMuscles || [])[0] || e.musculo;
    e.note = 'Cambiado a propuesta del entrenador: ' + (c.porque || '');
    est.ia.cambios.splice(i, 1);
    apuntarAplicado(nuevo.nameEs + ' en lugar de ' + antes);
  }
})(window);
