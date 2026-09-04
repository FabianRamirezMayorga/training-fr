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

  const PLAN_KEY = 'trainingfr.plan.nutricion';   // dónde vivía antes, solo se migra

  /* El menú vive en los ajustes, no en una clave suelta del navegador: así viaja
     a los demás dispositivos con el resto de la cuenta. Lo que hubiera guardado
     a la antigua se sube la primera vez que se abre esta pantalla. */
  function planGuardado() {
    const enAjustes = Store.settings().menu;
    if (enAjustes && enAjustes.plan) return enAjustes;

    try {
      const viejo = JSON.parse(localStorage.getItem(PLAN_KEY) || 'null');
      if (viejo && viejo.plan) {
        Store.setSetting('menu', viejo);
        localStorage.removeItem(PLAN_KEY);
        return viejo;
      }
    } catch (e) { /* nada que migrar */ }
    return null;
  }

  function guardarPlan(p) {
    Store.setSetting('menu', p === null ? null : { t: Date.now(), plan: p });
    try { localStorage.removeItem(PLAN_KEY); } catch (e) { /* nada */ }
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

  /* La hidratación va aparte y arriba: es la parte del plan que más se olvida */
  function hidratacionHTML(h) {
    if (!h) return '';
    return html`
      <div class="card" style="margin-top:11px;border-color:var(--blue)">
        <div class="row between">
          <div class="row" style="gap:9px;align-items:center">
            <span class="row-icon" style="color:var(--blue)">${raw(icon('gota'))}</span>
            <b>Hidratación</b>
          </div>
          <span class="chip solid">${h.total || (Perfil.agua() + ' L')}</span>
        </div>
        ${raw((h.pauta || []).length ? '<div class="stack" style="margin-top:10px">' +
          h.pauta.map(function (x) {
            return '<div class="tiny" style="display:flex;gap:8px">' +
              '<span style="color:var(--blue)">•</span><span>' + esc(x) + '</span></div>';
          }).join('') + '</div>' : '')}
        ${raw(h.nota ? '<p class="tiny" style="margin:10px 0 0">' + esc(h.nota) + '</p>' : '')}
        <button class="btn sm block" data-a="alertasAgua" style="margin-top:11px">
          ${raw(icon('campana'))} Ponerme los recordatorios de agua
        </button>
      </div>`;
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

      ${raw(hidratacionHTML(plan.hidratacion))}

      <div class="stack" style="margin-top:11px">
        ${raw((plan.dias || []).map(function (d, i) {
          return html`
            <div class="card">
              <div class="row between" data-dia="${i}" style="cursor:pointer">
                <div class="grow">
                  <div style="font-weight:600">${d.dia}${raw(d.entreno
                    ? ' <span class="chip solid tiny-chip">ENTRENO</span>' : '')}</div>
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
                        <b style="font-size:.9rem">${c.nombre}${raw(c.hora
                          ? ' <span class="tiny">· ' + esc(c.hora) + '</span>' : '')}</b>
                        <span class="tiny">${c.kcal} kcal</span>
                      </div>
                      <div class="muted" style="font-size:.9rem;margin-top:3px">${c.plato}</div>
                      ${raw((c.alternativas || []).length ? '<div class="tiny" ' +
                        'style="margin-top:5px;color:var(--acc)">O bien: ' +
                        esc(c.alternativas.join(' · ')) + '</div>' : '')}
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

      ${raw(plan.flexibilidad ? html`
        <div class="card destacado-clave" style="margin-top:14px">
          <h3 class="guia-h">${raw(icon('chispa'))} Hasta dónde puedes salirte</h3>
          <p style="margin:0">${plan.flexibilidad}</p>
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

    /* Puente con las alertas: el plan dice cuánta agua y las alertas la recuerdan */
    bind(root, '[data-a=alertasAgua]', function () {
      const sug = Alertas.sugerencias().find(function (x) { return x.clave === 'agua'; });
      if (!sug) { UI.toast('Completa tu perfil para calcular el agua'); return; }
      if (Alertas.yaExiste(sug)) { go('alertas'); UI.toast('Ya los tienes puestos'); return; }
      Alertas.crearDesdeSugerencia(sug);
      go('alertas');
      UI.toast(sug.horas.length + ' recordatorios de agua creados');
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
        <button class="btn primary block" data-a="boveda" style="margin-top:6px">
          ${raw(icon('llave'))} Ir a la bóveda de claves</button>
      </div>

      <p class="tiny" style="margin-top:12px">La capa gratuita tiene un límite diario que
      sobra para uso personal. Si lo superas, la app te avisa y sigue funcionando: los
      cálculos de calorías y las rutinas no dependen de la IA.</p>`;
  }

  V.entrenador.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });

    bind(root, '[data-a=boveda]', function () { go('claves'); });

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
      if (a === 'config') return go('claves');

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

  const LISTA_KEY = 'trainingfr.playlist';

  function listaGuardada() {
    try { return JSON.parse(localStorage.getItem(LISTA_KEY) || 'null'); } catch (e) { return null; }
  }
  function guardarLista(l) {
    if (l === null) localStorage.removeItem(LISTA_KEY);
    else localStorage.setItem(LISTA_KEY, JSON.stringify(l));
  }

  V.musica = function () {
    if (!Spotify.configurado()) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} Perfil</button>
        <h1>Música</h1>
        <p class="muted">Reproduce dentro de la app y deja que la IA te prepare listas
        distintas para cada entrenamiento.</p>
        <div class="card">
          <p class="muted">Necesita el Client ID de una app de Spotify: se crea en un
          minuto y es gratis. Tienes el paso a paso en la bóveda.</p>
          <button class="btn primary block" data-a="boveda">
            ${raw(icon('llave'))} Ir a la bóveda de claves</button>
        </div>
        <p class="tiny" style="margin-top:12px">Reproducir dentro de la app requiere
        Spotify Premium; es condición de su plataforma.</p>`;
    }

    if (!Spotify.activa()) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} Perfil</button>
        <h1>Música</h1>
        <div class="card">
          <p class="muted">Conecta tu cuenta para reproducir aquí y generar listas.</p>
          <button class="btn primary block" data-a="conectar">
            ${raw(icon('musica'))} Conectar Spotify</button>
        </div>
        ${raw(falloSpotifyHTML())}
        <p class="tiny" style="margin-top:12px">Al pulsar te lleva a Spotify para dar
        permiso y vuelve aquí solo. Si vuelves sin conectar, aquí abajo aparecerá el
        motivo exacto.</p>`;
    }

    const lista = listaGuardada();
    const mem = IA.activa() ? IA.memoriaMusical() : { listas: 0, artistas: [] };

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <div class="row between">
        <h1 style="margin:0">Música</h1>
        <button class="btn sm" data-a="desconectar">Desconectar</button>
      </div>

      ${raw(falloSpotifyHTML())}

      ${raw(Spotify.permisosCaducados() ? html`
        <div class="card" style="border-color:var(--warn);margin-top:12px">
          <b>Vuelve a conectar</b>
          <p class="muted" style="margin:5px 0 10px">Hay funciones nuevas —guardar canciones
          en tus favoritas y ver tus listas de Spotify— y Spotify pide permiso otra vez para
          eso. Es un toque y no pierdes nada.</p>
          <button class="btn primary block" data-a="conectar">Reconectar Spotify</button>
        </div>` : '')}

      <div id="sp-player" style="margin-top:12px"></div>

      <div class="list-title">Lista para entrenar</div>
      ${raw(lista ? listaHTML(lista) : html`
        <div class="card">
          <p class="muted">Deja que la IA te prepare una lista a medida del entrenamiento
          de hoy. Cada vez propone artistas distintos, así que siempre descubres algo.</p>
          ${raw(IA.activa()
            ? '<button class="btn primary block" data-a="generar">' + icon('chispa') +
              ' Crear una lista</button>'
            : '<button class="btn block" data-a="boveda">Necesita la clave de la IA</button>')}
        </div>`)}

      ${raw(mem.listas ? '<p class="tiny" style="margin-top:10px">' + mem.listas +
        (mem.listas === 1 ? ' lista creada' : ' listas creadas') + ' · ' + mem.artistas.length +
        ' artistas ya propuestos que no se repetirán. ' +
        '<button class="btn sm ghost" data-a="olvidar">Empezar de cero</button></p>' : '')}

      <div class="list-head">
        <span class="list-title">Tus listas de Spotify</span>
        <button class="btn sm ghost" data-a="recargarListas">Actualizar</button>
      </div>
      <div class="search-wrap" style="margin-bottom:10px">
        ${raw(icon('search'))}
        <input id="sp-buscar" type="search" placeholder="Buscar entre las tuyas o en Spotify"
               autocomplete="off">
      </div>
      <div id="sp-listas"><p class="tiny">Cargando tus listas…</p></div>

      <div class="list-title">Lista fija</div>
      <div class="card">
        <p class="muted">La que quieras tener siempre a mano: pega su enlace y queda
        guardada para lanzarla de un toque.</p>
        <input id="sp-pl" value="${Spotify.config().playlist || ''}"
               placeholder="https://open.spotify.com/playlist/..." autocomplete="off" spellcheck="false">
        <div class="row" style="margin-top:10px">
          <button class="btn grow" data-a="guardarPl">Guardar</button>
          ${raw(Spotify.config().playlist
            ? '<button class="btn primary grow" data-a="ponerPl">' + icon('play') + ' Reproducir</button>'
            : '')}
        </div>
      </div>`;
  };

  /* Si la última autorización falló, se enseña aquí con el texto exacto que
     devolvió Spotify: un aviso de dos segundos no da tiempo ni a leerlo. */
  function falloSpotifyHTML() {
    const f = Spotify.ultimoFallo && Spotify.ultimoFallo();
    if (!f) return '';
    return html`
      <div class="card" style="margin-top:12px;border-color:var(--bad)">
        <div class="row between" style="align-items:flex-start">
          <div class="grow">
            <b style="color:var(--bad)">La última conexión con Spotify falló</b>
            <p class="tiny" style="margin:6px 0 0">${UI.fecha(f.t)}</p>
          </div>
          <button class="btn icon sm" data-a="olvidarFallo" aria-label="Descartar">
            ${raw(icon('close'))}</button>
        </div>
        <pre style="margin:10px 0 0;font-size:.72rem;white-space:pre-wrap">${f.texto}</pre>
        ${raw(f.detalle ? '<pre class="tiny" style="margin:8px 0 0;opacity:.75;' +
          'white-space:pre-wrap">' + esc(f.detalle) + '</pre>' : '')}
        ${raw(f.deSpotify ? html`
          <p class="tiny" style="margin:9px 0 0">Esto lo ha rechazado Spotify. Comprueba en
          su panel que en <b>Redirect URIs</b> está exactamente
          <code>${Spotify.urlRetorno()}</code> y que tu cuenta figura en
          <b>User Management</b> si la app está en modo desarrollo.</p>`
        : html`
          <p class="tiny" style="margin:9px 0 0">Esto no es cosa del panel de Spotify: no
          hace falta tocar nada allí. Pulsa Conectar <b>desde esta misma pantalla</b> y deja
          que vuelva sin abrir otras pestañas ni cambiar entre la app instalada y el
          navegador.</p>`)}
        <button class="btn primary block sm" data-a="conectar" style="margin-top:10px">
          ${raw(icon('musica'))} Reintentar aquí</button>
      </div>`;
  }

  /* ---------- tus listas de Spotify ---------- */

  function tarjetasListas(listas, propias) {
    if (!listas.length) {
      return '<p class="tiny">' + (propias
        ? 'No tienes listas guardadas en Spotify todavía.'
        : 'Ninguna lista con ese nombre.') + '</p>';
    }
    return '<div class="stack">' + listas.map(function (l) {
      return html`
        <button class="rt-item" data-lista="${l.uri}" style="width:100%;text-align:left">
          ${raw(l.portada
            ? '<img src="' + esc(l.portada) + '" alt="" loading="lazy">'
            : '<span class="bm-sin">' + icon('lista') + '</span>')}
          <div class="grow">
            <div style="font-weight:600;font-size:.86rem">${l.nombre}</div>
            <div class="tiny">${raw(l.temas != null ? l.temas + ' canciones' : '')}${raw(
              l.de ? ' · ' + esc(l.de) : '')}</div>
          </div>
          ${raw(icon('play'))}
        </button>`;
    }).join('') + '</div>';
  }

  function pintarListas(root, texto) {
    const caja = root.querySelector('#sp-listas');
    if (!caja) return;
    caja.innerHTML = '<p class="tiny">Buscando…</p>';

    const q = String(texto || '').trim();
    const pedir = q
      ? Spotify.misListas().then(function (mias) {
          const filtro = I18N.norm(q);
          const suyas = mias.filter(function (l) { return I18N.norm(l.nombre).indexOf(filtro) !== -1; });
          /* si entre las tuyas no hay nada, se busca en todo Spotify */
          return suyas.length ? suyas : Spotify.buscarListas(q);
        })
      : Spotify.misListas();

    pedir.then(function (listas) {
      caja.innerHTML = tarjetasListas(listas, !q);
      caja.querySelectorAll('[data-lista]').forEach(function (b) {
        b.onclick = function () {
          Spotify.desbloquearAudio();
          Spotify.iniciarReproductor()
            .catch(function () { /* sin reproductor propio, suena donde puedas */ })
            .then(function () { return Spotify.ponerPlaylist(b.dataset.lista); })
            .then(function () { UI.toast('Reproduciendo'); })
            .catch(function (e) { UI.toast(e.message); });
        };
      });
    }).catch(function (e) {
      caja.innerHTML = '<p class="tiny" style="color:var(--bad)">' + esc(e.message) + '</p>';
    });
  }

  function listaHTML(l) {
    return html`
      <div class="card">
        <div class="row between" style="align-items:flex-start">
          <div class="grow">
            <div style="font-weight:700">${l.nombre}</div>
            <div class="tiny">${l.pistas.length} canciones${raw(l.ambiente
              ? ' · ' + esc(l.ambiente) : '')} · ${UI.fecha(l.creada)}</div>
          </div>
          <button class="btn icon sm danger" data-a="borrarLista"
                  aria-label="Borrar lista">${raw(icon('trash'))}</button>
        </div>
        ${raw(l.descripcion ? '<p class="muted" style="margin:9px 0 0">' +
          esc(l.descripcion) + '</p>' : '')}
        <div class="row" style="margin-top:12px">
          <button class="btn primary grow" data-a="reproducirLista">
            ${raw(icon('play'))} Reproducir aquí</button>
          <button class="btn" data-a="guardarEnSpotify" aria-label="Guardar en Spotify">
            ${raw(icon('down'))}</button>
        </div>
        <div class="row" style="margin-top:8px">
          <button class="btn ghost grow sm" data-a="generar">${raw(icon('chispa'))} Crear otra distinta</button>
        </div>
      </div>

      <div class="stack" style="margin-top:11px">
        ${raw(l.pistas.map(function (p, i) {
          return html`
            <button class="pista" data-pista="${i}">
              <span class="rt-idx">${i + 1}</span>
              <div class="grow">
                <div class="player-t">${p.titulo}</div>
                <div class="tiny">${p.artista}${raw(p.porque ? ' · ' + esc(p.porque) : '')}</div>
              </div>
              ${raw(icon('play'))}
            </button>`;
        }).join(''))}
      </div>`;
  }

  V.musica.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=boveda]', function () { go('claves'); });
    bind(root, '[data-a=olvidarFallo]', function () {
      Spotify.apuntarFallo(null); render();
    });

    /* hay dos botones de conectar: el principal y el de reintentar del aviso */
    bindAll(root, '[data-a=conectar]', function (btn) {
      root.querySelectorAll('[data-a=conectar]').forEach(function (b) { b.disabled = true; });
      Spotify.apuntarFallo(null);
      UI.toast('Abriendo Spotify para dar permiso…');
      Spotify.entrar().catch(function (e) {
        root.querySelectorAll('[data-a=conectar]').forEach(function (b) { b.disabled = false; });
        UI.toast(e.message);
      });
    });
    bind(root, '[data-a=desconectar]', function () {
      Spotify.apagarReproductor();
      Spotify.salir(); render(); UI.toast('Spotify desconectado');
    });

    bind(root, '[data-a=guardarPl]', function () {
      const val = root.querySelector('#sp-pl').value;
      if (val && !Spotify.idDePlaylist(val)) {
        const que = Spotify.queEs(val);
        UI.toast(que
          ? 'Eso es el enlace de ' + que + ', no de una lista de reproducción.'
          : 'No reconozco ese enlace. Abre la lista en Spotify, pulsa los tres puntos ' +
            'y elige Compartir, Copiar enlace.');
        return;
      }
      Spotify.guardarPlaylist(val); render(); UI.toast('Lista guardada');
    });

    /* tus listas, con buscador */
    if (root.querySelector('#sp-listas')) {
      pintarListas(root, '');
      const busca = root.querySelector('#sp-buscar');
      let deb = null;
      busca.oninput = function () {
        clearTimeout(deb);
        deb = setTimeout(function () { pintarListas(root, busca.value); }, 350);
      };
      bind(root, '[data-a=recargarListas]', function () { pintarListas(root, busca.value); });
    }

    bind(root, '[data-a=ponerPl]', function () {
      Spotify.ponerPlaylist().then(function () { UI.toast('Reproduciendo'); })
        .catch(function (e) { UI.toast(e.message); });
    });

    bind(root, '[data-a=olvidar]', function () {
      IA.olvidarMusica(); render();
      UI.toast('Memoria musical borrada: podrán repetirse artistas');
    });

    bind(root, '[data-a=borrarLista]', function () {
      UI.confirm('Borrar la lista', 'Podrás generar otra cuando quieras.', 'Borrar', true)
        .then(function (ok) { if (ok) { guardarLista(null); render(); } });
    });

    /* reproductor propio */
    const host = root.querySelector('#sp-player');
    if (host) montarPlayer(host);

    bindAll(root, '[data-a=generar]', function (btn) { generarLista(btn); });

    bind(root, '[data-a=reproducirLista]', function (btn) {
      const l = listaGuardada();
      if (!l) return;
      btn.disabled = true;
      lanzar(l.pistas.map(function (p) { return p.uri; }))
        .then(function () { btn.disabled = false; })
        .catch(function () { btn.disabled = false; });
    });

    bindAll(root, '[data-pista]', function (el) {
      const l = listaGuardada();
      if (!l) return;
      const desde = Number(el.dataset.pista);
      lanzar(l.pistas.slice(desde).map(function (p) { return p.uri; }));
    });

    bind(root, '[data-a=guardarEnSpotify]', function (btn) {
      const l = listaGuardada();
      if (!l) return;
      btn.disabled = true;
      Spotify.crearPlaylist(l.nombre, l.descripcion, l.pistas.map(function (p) { return p.uri; }))
        .then(function () { UI.toast('Guardada en tu Spotify'); btn.disabled = false; })
        .catch(function (e) { btn.disabled = false; UI.toast(e.message); });
    });
  };

  /* Poner a sonar una lista.
     Primero se intenta el reproductor de la app; si no puede (hace falta
     Premium, o el navegador no lo admite), no se deja al usuario con un error
     y sin música: se lanza en el dispositivo de Spotify que esté activo y se
     le dice dónde ha sonado. El desbloqueo del audio va antes de cualquier
     espera, que es lo único que acepta Safari. */
  function lanzar(uris) {
    if (!uris.length) { UI.toast('Esa lista no tiene canciones'); return Promise.resolve(); }
    Spotify.desbloquearAudio();

    return Spotify.iniciarReproductor()
      .then(function () {
        return Spotify.reproducirUris(uris).then(function () { UI.toast('Sonando en la app'); });
      })
      .catch(function (e) {
        return Spotify.reproducirUris(uris)
          .then(function () { UI.toast('Aquí no se pudo, suena en tu Spotify abierto'); })
          .catch(function () {
            UI.toast(e.message + ' Abre Spotify en algún dispositivo y vuelve a probar.');
            throw e;
          });
      });
  }

  /* Asistente de generación: ambiente, duración y una indicación libre */
  function generarLista(btnOrigen) {
    const hoy = UI.DAY_NAMES[new Date().getDay()];
    const rutinaHoy = Store.routines().find(function (r) {
      return (r.days || []).indexOf(hoy) !== -1;
    });

    let ambiente = 'ritmo';

    UI.modal(html`
      <h2>Nueva lista</h2>
      <p class="muted">La IA propone las canciones y la app las busca en Spotify.
      Las que no existan se descartan solas.</p>

      <label class="tiny">AMBIENTE</label>
      <div class="row wrap" style="gap:6px;margin:7px 0 14px">
        ${raw(Object.keys(IA.AMBIENTES).map(function (k) {
          return '<button class="chip ' + (k === ambiente ? 'on' : '') + '" data-amb="' + k + '">' +
            esc(IA.AMBIENTES[k].label) + '</button>';
        }).join(''))}
      </div>

      <label class="tiny">CUÁNTAS CANCIONES</label>
      <div class="row wrap" style="gap:6px;margin:7px 0 14px">
        ${raw([12, 20, 30].map(function (n) {
          return '<button class="chip ' + (n === 20 ? 'on' : '') + '" data-num="' + n + '">' +
            n + '</button>';
        }).join(''))}
      </div>

      <label class="tiny">ALGO MÁS (OPCIONAL)</label>
      <input id="pl-libre" placeholder="Nada de reguetón, más rock de los noventa…"
             style="margin:6px 0 14px">

      ${raw(rutinaHoy ? '<p class="tiny">Se adaptará a tu entrenamiento de hoy: ' +
        esc(rutinaHoy.name) + '.</p>' : '')}

      <button class="btn primary block" data-x="crear">${raw(icon('chispa'))} Crear lista</button>
      <div class="tiny center" id="pl-estado" style="margin-top:12px"></div>`,
      function (el) {
        let num = 20;

        el.querySelectorAll('[data-amb]').forEach(function (b) {
          b.onclick = function () {
            ambiente = b.dataset.amb;
            el.querySelectorAll('[data-amb]').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
          };
        });
        el.querySelectorAll('[data-num]').forEach(function (b) {
          b.onclick = function () {
            num = Number(b.dataset.num);
            el.querySelectorAll('[data-num]').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
          };
        });

        el.querySelector('[data-x=crear]').onclick = function (ev) {
          const boton = ev.currentTarget;
          const estado = el.querySelector('#pl-estado');
          boton.disabled = true;
          estado.textContent = 'Pensando la lista…';

          const mostrarFallo = function (e) {
            boton.disabled = false;
            estado.innerHTML = '<span style="color:var(--bad)">' + esc(e.message) + '</span>';
          };

          /* Promise.resolve() antes de nada: si algo falla de forma síncrona,
             el error entra en el catch en vez de dejar el botón bloqueado y el
             "Pensando la lista…" para siempre. */
          Promise.resolve().then(function () { return Spotify.misArtistas(); }).then(function (gustos) {
            return IA.playlistEntreno({
              ambiente: ambiente,
              canciones: num,
              rutina: rutinaHoy ? rutinaHoy.name : '',
              gustos: gustos,
              libre: el.querySelector('#pl-libre').value.trim(),
              semilla: Date.now().toString(36)
            });
          }).then(function (r) {
            estado.textContent = 'Buscando las canciones en Spotify…';
            return Spotify.buscarPistas(r.canciones, function (hechas, total, halladas) {
              estado.textContent = 'Buscando ' + hechas + ' de ' + total +
                ' · ' + halladas + ' encontradas';
            }).then(function (pistas) {
              if (!pistas.length) throw new Error('Ninguna de las canciones apareció en Spotify.');
              IA.recordarMusica(pistas.map(function (p) { return p.artista.split(',')[0].trim(); }));
              guardarLista({
                nombre: r.nombre || 'Lista de entrenamiento',
                descripcion: r.descripcion || '',
                ambiente: IA.AMBIENTES[ambiente].label,
                creada: Date.now(),
                pistas: pistas
              });
              UI.closeModal();
              render();
              UI.toast(pistas.length + ' canciones listas');
            });
          }).catch(mostrarFallo);
        };
      });
  }

  /* Reproductor propio: se conecta al pulsar, porque el navegador exige un gesto */
  function montarPlayer(host) {
    const pintar = function (s) {
      host.innerHTML = s ? Reproductor.html(s) : html`
        <div class="card">
          <div class="row between">
            <div class="grow">
              <div style="font-weight:600">Reproductor de la app</div>
              <div class="tiny">Suena aquí mismo, sin abrir Spotify</div>
            </div>
            <button class="btn primary sm" data-a="activar">${raw(icon('play'))} Activar</button>
          </div>
        </div>`;
      if (s) Reproductor.montar(host);
      const activar = host.querySelector('[data-a=activar]');
      if (activar) activar.onclick = function () {
        activar.disabled = true;
        activar.textContent = 'Conectando…';
        Spotify.iniciarReproductor()
          .then(function () { return Spotify.traerAqui(); })
          .then(function () {
            UI.toast('Listo: la música sonará en la app');
            pintar(Spotify.estado());
          })
          .catch(function (e) {
            activar.disabled = false;
            activar.innerHTML = icon('play') + ' Activar';
            UI.toast(e.message);
          });
      };
    };

    pintar(Spotify.reproductorActivo() ? Spotify.estado() : null);
    Spotify.alCambiar(function (s) { if (s) pintar(s); });

    if (!Spotify.reproductorActivo()) {
      Spotify.sonando().then(function (s) { if (s) pintar(s); }).catch(function () { /* nada */ });
    }
  }

  /* Reproductor completo. La portada manda: es lo que hace que parezca un
     reproductor y no una fila de botones. */
  /* Si la canción de ahora está en tus favoritas de Spotify. Se consulta al
     pintar y se recuerda mientras no cambie de tema. */
  let favoritaActual = false;
  let favoritaDe = '';
  let volActual = 0.6;            // el que trae el reproductor al arrancar

  function comprobarFavorita(s, alSaber) {
    if (!s || !s.id || s.id === favoritaDe) return;
    favoritaDe = s.id;
    Spotify.esFavorita(s.id).then(function (si) {
      if (si !== favoritaActual) { favoritaActual = si; if (alSaber) alSaber(); }
    });
  }

  function reproductorHTML(s) {
    const pct = s.duracion ? Math.min(100, Math.round(s.progreso / s.duracion * 100)) : 0;

    return html`
      <div class="player ${s.sonando ? 'sonando' : ''}">
        ${raw(s.portada
          ? '<img class="player-art" src="' + esc(s.portada) + '" alt="">'
          : '<div class="player-art vacia">' + icon('musica') + '</div>')}

        <div class="player-info">
          <div class="player-t">${s.titulo}</div>
          <div class="player-a">${s.artista}</div>
        </div>

        <div class="player-barra"><i style="width:${pct}%"></i></div>
        <div class="player-tiempos">
          <span>${UI.mmss((s.progreso || 0) / 1000)}</span>
          <span>${s.duracion ? UI.mmss(s.duracion / 1000) : ''}</span>
        </div>

        <div class="player-mandos">
          <button class="player-b chico ${s.aleatorio ? 'on' : ''}" data-sp="aleatorio"
            aria-label="Aleatorio" aria-pressed="${!!s.aleatorio}">
            ${raw(icon('aleatorio'))}</button>
          <button class="player-b" data-sp="anterior" aria-label="Anterior">
            ${raw(icon('anterior'))}</button>
          <button class="player-b grande" data-sp="alternar"
            aria-label="${s.sonando ? 'Pausar' : 'Reproducir'}">
            ${raw(icon(s.sonando ? 'pausaLleno' : 'playLleno'))}</button>
          <button class="player-b" data-sp="siguiente" aria-label="Siguiente">
            ${raw(icon('siguiente'))}</button>
          <button class="player-b chico ${favoritaActual ? 'fav' : ''}" data-sp="corazon"
            aria-label="Guardar en favoritas" aria-pressed="${!!favoritaActual}">
            ${raw(icon('corazon'))}</button>
        </div>

        ${raw(s.local ? html`
          <div class="player-vol">
            ${raw(icon('altavoz'))}
            <input type="range" min="0" max="100" value="${Math.round(volActual * 100)}"
                   id="player-vol" aria-label="Volumen">
          </div>` : '')}

        ${raw(s.dispositivo ? html`
          <div class="player-donde">
            ${raw(icon('altavoz'))} <span>${s.dispositivo}</span>
            ${raw(s.local ? '' : '<button class="btn sm" data-sp="traer">Traer aquí</button>')}
          </div>` : '')}
      </div>`;
  }

  function montarReproductor(root) {
    const vol = root.querySelector('#player-vol');
    if (vol) {
      vol.oninput = function () {
        volActual = Number(vol.value) / 100;
        Spotify.volumen(volActual).catch(function () { /* sin reproductor propio */ });
      };
    }

    const s0 = Spotify.estado();
    comprobarFavorita(s0, function () {
      const c = root.querySelector('[data-sp=corazon]');
      if (c) { c.classList.toggle('fav', favoritaActual); c.setAttribute('aria-pressed', String(favoritaActual)); }
    });

    root.querySelectorAll('[data-sp]').forEach(function (b) {
      b.onclick = function () {
        /* Safari solo desbloquea el audio dentro del gesto: si se hace después
           de esperar a una promesa, ya no vale y el sonido no sale. */
        Spotify.desbloquearAudio();
        const acciones = {
          alternar: Spotify.alternar, siguiente: Spotify.siguiente,
          anterior: Spotify.anterior, traer: Spotify.traerAqui,
          aleatorio: function () {
            const s = Spotify.estado() || {};
            return Spotify.aleatorio(!s.aleatorio).then(function () {
              UI.toast(!s.aleatorio ? 'Aleatorio activado' : 'Aleatorio desactivado');
            });
          },
          corazon: function () {
            const s = Spotify.estado() || {};
            return Spotify.marcarFavorita(s.id, !favoritaActual).then(function () {
              favoritaActual = !favoritaActual;
              UI.toast(favoritaActual ? 'Guardada en tus favoritas de Spotify'
                : 'Quitada de favoritas');
            });
          }
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

  /* ---------- barra de música en toda la app ----------
     Igual que el cronómetro: mientras suena algo, se controla desde cualquier
     pantalla sin ir a buscar el reproductor. En la pantalla de música sobra,
     que allí está el grande. */
  let latidoMusica = null;
  let ultimoEstado = null;

  function pintarBarraMusica() {
    const host = document.getElementById('musica-host');
    if (!host) return;

    /* al vaciar hay que olvidar la firma: si no, al volver cree que ya está
       pintada y la barra no reaparece */
    const vaciar = function () {
      if (host.innerHTML) { host.innerHTML = ''; document.body.classList.remove('con-musica'); }
      ultimoEstado = null;
    };

    const enMusica = location.hash.indexOf('musica') !== -1;
    if (!Spotify.activa() || !Spotify.reproductorActivo() || enMusica) {
      vaciar();
      clearInterval(latidoMusica); latidoMusica = null;
      return;
    }

    const s = Spotify.estado();
    if (!s) { vaciar(); return; }

    /* solo se redibuja cuando cambia la canción o el estado */
    const firma = s.titulo + '|' + s.sonando;
    if (firma !== ultimoEstado) {
      ultimoEstado = firma;
      host.innerHTML = html`
        <div class="barra-musica">
          <button class="bm-ir" data-m="ir">
            ${raw(s.portada ? '<img src="' + esc(s.portada) + '" alt="">'
              : '<span class="bm-sin">' + icon('musica') + '</span>')}
            <span class="bm-txt">
              <b>${s.titulo}</b>
              <span>${s.artista}</span>
            </span>
          </button>
          <button class="bm-b" data-m="alternar"
                  aria-label="${s.sonando ? 'Pausar' : 'Reproducir'}">
            ${raw(icon(s.sonando ? 'pausaLleno' : 'playLleno'))}</button>
          <button class="bm-b" data-m="siguiente" aria-label="Siguiente">
            ${raw(icon('siguiente'))}</button>
        </div>`;

      host.querySelector('[data-m=ir]').onclick = function () { App.go('musica'); };
      host.querySelectorAll('[data-m=alternar],[data-m=siguiente]').forEach(function (b) {
        b.onclick = function () {
          Spotify.desbloquearAudio();
          const fn = b.dataset.m === 'siguiente' ? Spotify.siguiente : Spotify.alternar;
          b.disabled = true;
          fn().catch(function (e) { UI.toast(e.message); })
            .then(function () { setTimeout(function () { b.disabled = false; }, 300); });
        };
      });
    }

    document.body.classList.add('con-musica');
    if (!latidoMusica) latidoMusica = setInterval(pintarBarraMusica, 3000);
  }

  /* el propio reproductor avisa de cada cambio: la barra se entera al momento */
  if (g.Spotify && Spotify.alCambiar) Spotify.alCambiar(function () { pintarBarraMusica(); });

  g.Reproductor = {
    html: reproductorHTML, montar: montarReproductor, barra: pintarBarraMusica
  };
})(window);
