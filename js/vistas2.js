/* vistas2.js — alimentación, entrenador con IA y música.
   Continuación de vistas.js; se registran igual en g.VISTAS. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  const PLAN_KEY = 'trainingfr.plan.nutricion';

  function planGuardado() {
    try { return JSON.parse(localStorage.getItem(PLAN_KEY) || 'null'); } catch (e) { return null; }
  }
  function guardarPlan(p) {
    if (p === null) localStorage.removeItem(PLAN_KEY);
    else localStorage.setItem(PLAN_KEY, JSON.stringify({ t: Date.now(), plan: p }));
  }

  /* ================= alimentación ================= */

  V.nutricion = function () {
    const p = Perfil.datos();
    if (!Perfil.completo(p)) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} Perfil</button>
        <h1>Alimentación</h1>
        <div class="empty">${raw(icon('nutricion'))}
          <p>Necesito tu peso, altura, edad y sexo para calcular las calorías.</p>
          <button class="btn primary" data-a="datos">Completar mis datos</button>
        </div>`;
    }

    const m = Perfil.macros(p);
    const guardado = planGuardado();
    const plan = guardado && guardado.plan;

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <h1>Alimentación</h1>
      <p class="muted">Calculado a partir de tus datos con la fórmula de Mifflin-St Jeor.
      Es una orientación, no una pauta médica.</p>

      <div class="stats">
        <div class="stat"><b>${UI.num(m.kcal)}</b><span>kcal al día</span></div>
        <div class="stat"><b>${m.prot}</b><span>g proteína</span></div>
        <div class="stat"><b>${m.carbo}</b><span>g hidratos</span></div>
        <div class="stat"><b>${m.grasa}</b><span>g grasa</span></div>
      </div>

      <div class="macro-bar">
        <i style="width:${Math.round(m.prot * 4 / m.kcal * 100)}%;background:var(--brand-1)"></i>
        <i style="width:${Math.round(m.carbo * 4 / m.kcal * 100)}%;background:var(--acc)"></i>
        <i style="width:${Math.round(m.grasa * 9 / m.kcal * 100)}%;background:var(--warn)"></i>
      </div>
      <div class="row" style="gap:14px;margin-top:8px;font-size:.78rem;color:var(--dim2)">
        <span><i class="dot" style="background:var(--brand-1)"></i> Proteína</span>
        <span><i class="dot" style="background:var(--acc)"></i> Hidratos</span>
        <span><i class="dot" style="background:var(--warn)"></i> Grasa</span>
      </div>

      <div class="list" style="margin-top:16px">
        ${raw(filaSimple('Gasto diario estimado', UI.num(Math.round(Perfil.tdee(p))) + ' kcal'))}
        ${raw(filaSimple('Objetivo', (Perfil.OBJETIVO[p.objetivo] || {}).label))}
        ${raw(filaSimple('Agua al día', Perfil.agua(p) + ' L'))}
        ${raw(filaSimple('Comidas al día', String(p.comidas)))}
      </div>

      <div class="list-title">Plan de comidas</div>
      ${raw(plan ? planHTML(plan, guardado.t) : html`
        <div class="card">
          <p class="muted">Puedo prepararte un menú semanal que cuadre con esas calorías,
          con tu tipo de dieta y lo que no puedes comer, más la lista de la compra.</p>
          ${raw(IA.activa()
            ? '<button class="btn primary block" data-a="generar">' + icon('chispa') +
              ' Crear mi plan semanal</button>'
            : '<button class="btn block" data-a="configIA">Necesita el entrenador con IA</button>')}
        </div>`)}`;
  };

  function filaSimple(titulo, valor) {
    return '<div class="list-row"><div class="grow"><div class="list-row-title">' +
      esc(titulo) + '</div></div><span class="list-row-val">' + esc(valor) + '</span></div>';
  }

  function planHTML(plan, cuando) {
    return html`
      <div class="card">
        <div class="row between">
          <div class="tiny">Creado el ${UI.fecha(cuando)}</div>
          <div class="row" style="gap:6px">
            <button class="btn sm" data-a="regenerar">Otro</button>
            <button class="btn sm danger" data-a="borrarPlan">${raw(icon('trash'))}</button>
          </div>
        </div>
        ${raw(plan.resumen ? '<p class="muted" style="margin:10px 0 0">' + esc(plan.resumen) + '</p>' : '')}
      </div>

      <div class="stack" style="margin-top:11px">
        ${raw((plan.dias || []).map(function (d, i) {
          return html`
            <div class="card">
              <div class="row between" data-dia="${i}" style="cursor:pointer">
                <div class="grow">
                  <div style="font-weight:600">${d.dia}</div>
                  <div class="tiny">${raw(d.total
                    ? esc(d.total.kcal + ' kcal · ' + d.total.prot + ' g proteína')
                    : (d.comidas || []).length + ' comidas')}</div>
                </div>
                <span class="chevron down">${raw(icon('chevron'))}</span>
              </div>
              <div class="stack" data-cuerpo="${i}" hidden style="margin-top:11px">
                ${raw((d.comidas || []).map(function (c) {
                  return html`
                    <div class="meal">
                      <div class="row between">
                        <b style="font-size:.9rem">${c.nombre}</b>
                        <span class="tiny">${c.kcal} kcal</span>
                      </div>
                      <div class="muted" style="font-size:.9rem;margin-top:3px">${c.plato}</div>
                      <div class="tiny" style="margin-top:4px">P ${c.prot} · H ${c.carbo} · G ${c.grasa}</div>
                    </div>`;
                }).join(''))}
              </div>
            </div>`;
        }).join(''))}
      </div>

      ${raw((plan.compra || []).length ? html`
        <div class="list-title">Lista de la compra</div>
        <div class="card">
          <div class="row wrap" style="gap:6px">
            ${raw(plan.compra.map(function (x) {
              return '<span class="chip">' + esc(x) + '</span>';
            }).join(''))}
          </div>
        </div>` : '')}

      ${raw((plan.consejos || []).length ? html`
        <div class="list-title">Consejos</div>
        <div class="card"><ol class="instr">
          ${raw(plan.consejos.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''))}
        </ol></div>` : '')}

      <p class="tiny" style="margin-top:14px">Generado por IA a partir de tus datos.
      Revísalo con criterio y consulta a un dietista si tienes alguna condición de salud.</p>`;
  }

  V.nutricion.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=datos]', function () { go('datos'); });
    bind(root, '[data-a=configIA]', function () { go('entrenador'); });

    bindAll(root, '[data-dia]', function (el) {
      const c = root.querySelector('[data-cuerpo="' + el.dataset.dia + '"]');
      if (c) {
        c.hidden = !c.hidden;
        el.querySelector('.chevron').classList.toggle('abierto', !c.hidden);
      }
    });

    const generar = function (forzar) {
      const btn = root.querySelector('[data-a=generar]') || root.querySelector('[data-a=regenerar]');
      if (btn) { btn.disabled = true; btn.textContent = 'Preparando el menú…'; }
      IA.planNutricion({ forzar: forzar, variante: forzar ? Date.now() % 1000 : 0 })
        .then(function (plan) {
          guardarPlan(plan);
          render();
          UI.toast('Plan de comidas listo');
        })
        .catch(function (e) {
          if (btn) { btn.disabled = false; }
          render();
          UI.toast(e.message || 'No se pudo crear el plan');
        });
    };

    bind(root, '[data-a=generar]', function () { generar(false); });
    bind(root, '[data-a=regenerar]', function () { generar(true); });
    bind(root, '[data-a=borrarPlan]', function () {
      UI.confirm('Borrar el plan', 'Podrás generar otro cuando quieras.', 'Borrar', true)
        .then(function (ok) { if (ok) { guardarPlan(null); render(); } });
    });
  };

  /* ================= entrenador con IA ================= */

  V.entrenador = function () {
    if (!IA.activa()) return configIAHTML();

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <h1>Entrenador</h1>
      <p class="muted">Conoce tu perfil, tus rutinas y tu progreso. Pregúntale lo que quieras.</p>

      <div class="card">
        <textarea id="ia-q" rows="3"
          placeholder="¿Estoy entrenando bien el pecho? ¿Cómo bajo grasa sin perder fuerza?"></textarea>
        <button class="btn primary block" data-a="preguntar" style="margin-top:10px">
          ${raw(icon('chispa'))} Preguntar</button>
      </div>

      <div id="ia-respuesta"></div>

      <div class="list-title">Análisis rápidos</div>
      <div class="list">
        ${raw(filaAccion('grafica', 'Cómo voy', 'Lee tus últimos entrenamientos', 'analizar'))}
        ${raw(filaAccion('dumbbell', 'Revisa mis rutinas', 'Qué cambiar para tu objetivo', 'revisar'))}
        ${raw(filaAccion('nutricion', 'Plan de comidas', 'Menú semanal con tus calorías', 'nutricion'))}
      </div>

      <div class="list-title">Ajustes de la IA</div>
      <div class="list">
        ${raw(filaAccion('chispa', 'Cambiar la clave', IA.config().modelo || 'gemini-2.5-flash', 'config'))}
      </div>
      <p class="tiny" style="margin-top:10px">Al preguntar se envían a Google tus datos de
      perfil, rutinas y progreso. Tu clave se guarda solo en este dispositivo.</p>`;
  };

  function filaAccion(ico, titulo, sub, accion) {
    return '<div class="list-row tap" data-ia="' + accion + '">' +
      '<span class="row-icon">' + icon(ico) + '</span>' +
      '<div class="grow"><div class="list-row-title">' + esc(titulo) + '</div>' +
      '<div class="list-row-sub">' + esc(sub) + '</div></div>' +
      '<span class="chevron">' + icon('chevron') + '</span></div>';
  }

  function configIAHTML() {
    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <h1>Entrenador con IA</h1>
      <p class="muted">Analiza tu progreso, revisa tus rutinas y te prepara el plan de comidas.
      Funciona con la capa gratuita de Google Gemini.</p>

      <div class="card">
        <ol class="instr">
          <li>Entra en <a href="https://aistudio.google.com/apikey" target="_blank"
            rel="noopener noreferrer">aistudio.google.com/apikey</a> con tu cuenta de Google.</li>
          <li>Pulsa <b>Create API key</b> y copia la clave.</li>
          <li>Pégala aquí abajo. Se guarda solo en este dispositivo.</li>
        </ol>
        <label class="tiny">CLAVE DE API</label>
        <input id="ia-key" type="password" autocomplete="off" spellcheck="false"
               placeholder="AIza..." style="margin:5px 0 12px">
        <button class="btn primary block" data-a="guardarIA">Guardar</button>
      </div>

      <p class="tiny" style="margin-top:12px">La capa gratuita tiene un límite diario que
      sobra para uso personal. Si lo superas, la app te avisa y sigue funcionando: los
      cálculos de calorías y las rutinas no dependen de la IA.</p>`;
  }

  V.entrenador.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });

    bind(root, '[data-a=guardarIA]', function () {
      try {
        IA.guardarConfig(root.querySelector('#ia-key').value);
        render();
        UI.toast('Entrenador activado');
      } catch (e) { UI.toast(e.message); }
    });

    const caja = root.querySelector('#ia-respuesta');
    const cargando = function (texto) {
      caja.innerHTML = '<div class="card center"><div class="spinner" ' +
        'style="margin:6px auto 10px"></div><div class="tiny">' + esc(texto) + '</div></div>';
    };

    bind(root, '[data-a=preguntar]', function () {
      const q = root.querySelector('#ia-q').value.trim();
      if (!q) { UI.toast('Escribe tu pregunta'); return; }
      cargando('Pensando…');
      IA.preguntar(q).then(function (r) {
        caja.innerHTML = '<div class="card ia-resp">' + parrafos(r) + '</div>';
      }).catch(function (e) {
        caja.innerHTML = '<div class="card"><div class="muted">' + esc(e.message) + '</div></div>';
      });
    });

    bindAll(root, '[data-ia]', function (el) {
      const a = el.dataset.ia;
      if (a === 'nutricion') return go('nutricion');
      if (a === 'config') {
        IA.borrarConfig();
        render();
        UI.toast('Introduce la clave de nuevo');
        return;
      }

      cargando(a === 'analizar' ? 'Revisando tus entrenamientos…' : 'Revisando tus rutinas…');
      window.scrollTo({ top: caja.offsetTop - 80, behavior: 'smooth' });

      const peticion = a === 'analizar' ? IA.analizarProgreso() : IA.revisarRutinas();
      peticion.then(function (r) {
        caja.innerHTML = a === 'analizar'
          ? html`<div class="card ia-resp">
              <div class="ia-bloque"><b>Lo que va bien</b><p>${r.bien}</p></div>
              <div class="ia-bloque"><b>Lo más flojo</b><p>${r.flojo}</p></div>
              <div class="ia-bloque destacado"><b>Esta semana</b><p>${r.accion}</p></div>
            </div>`
          : html`<div class="card ia-resp">
              <p class="muted">${r.veredicto}</p>
              ${raw((r.puntos || []).map(function (x) {
                return '<div class="ia-bloque"><b>' + esc(x.titulo) + '</b><p>' +
                  esc(x.detalle) + '</p></div>';
              }).join(''))}
            </div>`;
      }).catch(function (e) {
        caja.innerHTML = '<div class="card"><div class="muted">' + esc(e.message) + '</div></div>';
      });
    });
  };

  function parrafos(texto) {
    return String(texto).split(/\n{2,}/).map(function (p) {
      return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  /* ================= música ================= */

  V.musica = function () {
    const c = Spotify.config();

    if (!Spotify.configurado()) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} Perfil</button>
        <h1>Música</h1>
        <p class="muted">Controla Spotify desde la pantalla de entrenamiento, sin salir de la app.</p>

        <div class="card" style="border-color:var(--warn)">
          <div style="font-weight:600;margin-bottom:4px">Antes de empezar</div>
          <p class="muted" style="margin:0">Spotify solo deja <b>cambiar</b> la reproducción
          (play, pausa, siguiente) a las cuentas <b>Premium</b>. Con cuenta gratuita podrás
          ver qué suena y usar el reproductor incrustado, que es lo que permite su plataforma.</p>
        </div>

        <div class="card">
          <ol class="instr">
            <li>Entra en <a href="https://developer.spotify.com/dashboard" target="_blank"
              rel="noopener noreferrer">developer.spotify.com/dashboard</a> y pulsa
              <b>Create app</b>. Nombre y descripción, los que quieras.</li>
            <li>En <b>Redirect URIs</b> escribe exactamente:<br>
              <code class="tiny">${Spotify.urlRetorno()}</code></li>
            <li>Marca <b>Web API</b>, guarda y copia el <b>Client ID</b>.</li>
          </ol>
          <label class="tiny">CLIENT ID</label>
          <input id="sp-id" autocomplete="off" spellcheck="false" placeholder="32 caracteres"
                 style="margin:5px 0 12px">
          <button class="btn primary block" data-a="guardarSp">Guardar</button>
        </div>`;
    }

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <h1>Música</h1>

      ${raw(Spotify.activa() ? html`
        <div class="card">
          <div class="row between">
            <div class="grow">
              <div style="font-weight:600">Spotify conectado</div>
              <div class="tiny">Verás los controles durante el entrenamiento</div>
            </div>
            <button class="btn sm" data-a="desconectar">Desconectar</button>
          </div>
        </div>
        <div id="sp-ahora"></div>`
      : html`
        <div class="card">
          <p class="muted">Conecta tu cuenta para ver y controlar lo que suena.</p>
          <button class="btn primary block" data-a="conectar">${raw(icon('musica'))} Conectar Spotify</button>
        </div>`)}

      <div class="list-title">Lista para entrenar</div>
      <div class="card">
        <p class="muted">Pega el enlace de la lista que quieras lanzar al empezar.</p>
        <input id="sp-pl" value="${c.playlist || ''}" placeholder="https://open.spotify.com/playlist/..."
               autocomplete="off" spellcheck="false">
        <button class="btn block" data-a="guardarPl" style="margin-top:10px">Guardar lista</button>
        ${raw(c.playlist && Spotify.urlEmbed() ? html`
          <div style="margin-top:12px">
            <iframe src="${Spotify.urlEmbed()}" width="100%" height="152" frameborder="0"
              style="border-radius:12px" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
              loading="lazy" title="Lista de Spotify"></iframe>
            <p class="tiny" style="margin-top:8px">Este reproductor funciona también sin
            Premium, aunque en ese caso Spotify solo deja escuchar fragmentos.</p>
          </div>` : '')}
      </div>

      <button class="btn ghost block sm" data-a="borrarSp" style="margin-top:14px">
        Borrar la configuración de Spotify</button>`;
  };

  V.musica.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });

    bind(root, '[data-a=guardarSp]', function () {
      try {
        Spotify.guardarConfig(root.querySelector('#sp-id').value, '');
        render();
        UI.toast('Guardado. Ahora conecta tu cuenta.');
      } catch (e) { UI.toast(e.message); }
    });

    bind(root, '[data-a=conectar]', function () {
      Spotify.entrar().catch(function (e) { UI.toast(e.message); });
    });

    bind(root, '[data-a=desconectar]', function () {
      Spotify.salir(); render(); UI.toast('Spotify desconectado');
    });

    bind(root, '[data-a=guardarPl]', function () {
      const v = root.querySelector('#sp-pl').value;
      if (v && !Spotify.idDePlaylist(v)) { UI.toast('Ese enlace no parece de una lista'); return; }
      Spotify.guardarPlaylist(v);
      render();
      UI.toast('Lista guardada');
    });

    bind(root, '[data-a=borrarSp]', function () {
      UI.confirm('Borrar configuración', 'Se olvidará el Client ID y la sesión de Spotify.',
        'Borrar', true).then(function (ok) {
        if (ok) { Spotify.borrarConfig(); render(); UI.toast('Configuración borrada'); }
      });
    });

    const ahora = root.querySelector('#sp-ahora');
    if (ahora) {
      Spotify.sonando().then(function (s) {
        ahora.innerHTML = s
          ? reproductorHTML(s)
          : '<div class="card"><div class="muted">Nada sonando ahora mismo. ' +
            'Abre Spotify en cualquier dispositivo y aparecerá aquí.</div></div>';
        if (s) montarReproductor(ahora);
      }).catch(function (e) {
        ahora.innerHTML = '<div class="card"><div class="muted">' + esc(e.message) + '</div></div>';
      });
    }
  };

  /* Reproductor compacto, reutilizado en la pantalla de entrenamiento */
  function reproductorHTML(s) {
    return html`
      <div class="card player">
        <div class="row">
          ${raw(s.portada ? '<img class="player-art" src="' + esc(s.portada) + '" alt="">'
            : '<span class="row-icon">' + icon('musica') + '</span>')}
          <div class="grow" style="min-width:0">
            <div class="player-t">${s.titulo}</div>
            <div class="tiny">${s.artista}</div>
          </div>
        </div>
        <div class="row" style="justify-content:center;gap:18px;margin-top:12px">
          <button class="btn icon" data-sp="anterior" aria-label="Anterior">
            <svg viewBox="0 0 24 24" style="fill:currentColor;stroke:none">
              <path d="M6 5h2v14H6zM20 5v14l-11-7z"/></svg></button>
          <button class="btn icon primary" data-sp="alternar"
            aria-label="${s.sonando ? 'Pausar' : 'Reproducir'}">
            ${raw(icon(s.sonando ? 'pause' : 'play'))}</button>
          <button class="btn icon" data-sp="siguiente" aria-label="Siguiente">
            <svg viewBox="0 0 24 24" style="fill:currentColor;stroke:none">
              <path d="M16 5h2v14h-2zM4 5l11 7-11 7z"/></svg></button>
        </div>
        ${raw(s.dispositivo ? '<div class="tiny center" style="margin-top:8px">Sonando en ' +
          esc(s.dispositivo) + '</div>' : '')}
      </div>`;
  }

  function montarReproductor(root) {
    root.querySelectorAll('[data-sp]').forEach(function (b) {
      b.onclick = function () {
        const acciones = {
          alternar: Spotify.alternar, siguiente: Spotify.siguiente, anterior: Spotify.anterior
        };
        const fn = acciones[b.dataset.sp];
        if (!fn) return;
        b.disabled = true;
        fn().then(function () {
          setTimeout(function () {
            Spotify.sonando().then(function (s) {
              if (s) { root.innerHTML = reproductorHTML(s); montarReproductor(root); }
            }).catch(function () { b.disabled = false; });
          }, 400);
        }).catch(function (e) {
          b.disabled = false;
          UI.toast(e.message);
        });
      };
    });
  }

  g.Reproductor = { html: reproductorHTML, montar: montarReproductor };
})(window);
