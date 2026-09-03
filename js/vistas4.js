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

  /* Lo elegido sobrevive mientras dure la sesión de la app */
  let est = {
    dias: ['Lun', 'Mar', 'Jue', 'Vie'],
    minutos: 60,
    objetivo: '',
    foco: 'equilibrado',
    prog: null,
    ia: null,
    cargandoIA: false,
    abierto: {}
  };

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
              '" data-dia="' + d + '">' + d + '</button>';
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

    return html`
      <div class="list-title">Series por semana</div>
      <p class="tiny" style="margin:-4px 4px 10px">La línea es tu objetivo:
      <b>${prog.objetivoSeries} series</b> semanales por músculo. Debajo de 8 el estímulo se
      queda corto; muy por encima ya no se recupera.</p>
      <div class="card">
        ${raw(musculos.map(function (m) {
          const v = prog.volumen[m];
          const pct = Math.round(v / tope * 100);
          const meta = Math.round(prog.objetivoSeries / tope * 100);
          const flojo = v < 8;
          return html`
            <div class="vol-fila">
              <span class="vol-nom">${I18N.muscle(m)}</span>
              <span class="vol-barra">
                <i style="width:${pct}%${raw(flojo ? ';background:var(--warn)' : '')}"></i>
                <u style="left:${meta}%"></u>
              </span>
              <span class="vol-num">${String(v).replace('.', ',')}</span>
            </div>`;
        }).join(''))}
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

  function bloqueIA() {
    if (est.cargandoIA) {
      return html`<div class="card center"><div class="spinner" style="margin:6px auto"></div>
        <p class="tiny" style="margin:8px 0 0">El entrenador está revisando tu programa…</p></div>`;
    }
    const r = est.ia;
    if (!r) {
      return html`
        <button class="btn block" data-a="afinar" style="margin-top:12px">
          ${raw(icon('chispa'))} Que la IA revise este programa
        </button>
        <p class="tiny center" style="margin:7px 4px 0">${raw(IA.activa()
          ? 'Revisa el reparto de volumen, los patrones que falten y el riesgo para tus limitaciones.'
          : 'Necesita la clave de Gemini, que se configura en la bóveda de Ajustes.')}</p>`;
    }

    return html`
      <div class="list-title">Lo que dice el entrenador</div>
      <div class="card">
        <p style="margin:0 0 10px">${r.veredicto || ''}</p>
        ${raw((r.puntos || []).map(function (x) {
          return '<div class="error-item"><b>' + esc(x.titulo || '') + '</b><p>' +
            esc(x.detalle || '') + '</p></div>';
        }).join(''))}
      </div>
      ${raw(r.cambios && r.cambios.length ? html`
        <div class="card">
          <b>Cambios que propone</b>
          <div class="stack" style="margin-top:9px">
            ${raw(r.cambios.map(function (c, i) {
              return html`
                <div class="row between" style="gap:10px;align-items:flex-start">
                  <div class="grow">
                    <div style="font-size:.86rem"><b>${c.poner}</b> en lugar de ${c.quitar}</div>
                    <div class="tiny">${c.porque || ''}</div>
                  </div>
                  <button class="btn sm" data-cambio="${i}">Aplicar</button>
                </div>`;
            }).join(''))}
          </div>
          <p class="tiny" style="margin:10px 0 0">Cada cambio se comprueba antes de aplicarlo:
          si el ejercicio no existe, no cabe con tu material o choca con tus limitaciones,
          se descarta.</p>
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
      <div class="card">
        ${raw(prog.razones.map(function (t, i) {
          return '<div class="razon"><span class="rt-idx">' + (i + 1) + '</span><p>' +
            esc(t) + '</p></div>';
        }).join(''))}
      </div>

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

      ${raw(bloqueIA())}

      <div class="row" style="margin-top:16px">
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

    bindAll(root, '[data-min]', function (el) { est.minutos = Number(el.dataset.min); render(); });
    bindAll(root, '[data-obj]', function (el) { est.objetivo = el.dataset.obj; render(); });
    bindAll(root, '[data-foco]', function (el) { est.foco = el.dataset.foco; render(); });

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
      const rutinas = Programa.aRutinas(est.prog);
      rutinas.forEach(function (r) { Store.saveRoutine(r); });
      UI.toast(rutinas.length + ' rutinas creadas con sus días');
      go('rutinas');
      Offline.precargarRutinas();
    });

    bind(root, '[data-a=afinar]', afinar);
    bindAll(root, '[data-cambio]', function (el) { aplicarCambio(Number(el.dataset.cambio)); });
  };

  function crear() {
    if (!est.dias.length) { UI.toast('Elige al menos un día de entrenamiento'); return; }
    est.prog = Programa.crear({
      dias: est.dias, minutos: est.minutos, objetivo: objetivoActual(),
      foco: est.foco, gear: Store.settings().gear
    });
    est.ia = null;
    est.abierto = {};
    render();
    const caja = document.querySelector('.stats');
    if (caja) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function afinar() {
    if (!IA.activa()) { go('claves'); UI.toast('Configura la clave de Gemini para esto'); return; }
    est.cargandoIA = true;
    render();
    IA.afinarPrograma(est.prog)
      .then(function (r) { est.ia = r; })
      .catch(function (e) { UI.toast(e.message); })
      .then(function () { est.cargandoIA = false; render(); });
  }

  /* Un cambio propuesto por la IA solo entra si el ejercicio existe de verdad,
     lo permite el material y no choca con las limitaciones. */
  function aplicarCambio(i) {
    const c = (est.ia.cambios || [])[i];
    if (!c) return;

    const gear = Store.settings().gear;
    const candidatos = Data.search({ q: c.poner, gear: gear });
    const nuevo = candidatos[0];
    if (!nuevo) {
      UI.toast('No encuentro «' + c.poner + '» en el catálogo. Cambio descartado.');
      return;
    }

    /* ¿choca con alguna limitación? */
    const claves = Programa.lesionesDe(Perfil.datos().lesiones);
    const patron = Alt.patron(nuevo);
    const prohibido = claves.some(function (k) {
      return (Programa.LESIONES[k].patronesFuera || []).indexOf(patron) !== -1;
    });
    if (prohibido) {
      UI.toast('«' + nuevo.nameEs + '» no encaja con tus limitaciones. Cambio descartado.');
      return;
    }

    let hecho = false;
    est.prog.sesiones.forEach(function (s) {
      s.ejercicios.forEach(function (e) {
        const ex = Data.get(e.exId);
        if (hecho || !ex) return;
        if (I18N.norm(ex.nameEs) === I18N.norm(c.quitar) || ex.id === c.quitar) {
          e.exId = nuevo.id;
          e.note = 'Cambiado a propuesta del entrenador: ' + (c.porque || '');
          hecho = true;
        }
      });
    });

    if (!hecho) { UI.toast('Ya no está «' + c.quitar + '» en el plan.'); return; }
    est.ia.cambios.splice(i, 1);
    render();
    UI.toast('Cambiado por ' + nuevo.nameEs);
  }
})(window);
