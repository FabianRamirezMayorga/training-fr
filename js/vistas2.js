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

      ${raw(comidasHoyHTML(m))}

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

  /* Lo que llevas hoy contra lo que te toca. Es la pregunta de verdad —¿voy
     corto de proteína?— y hasta ahora la app decía el objetivo y se
     desentendía de si se cumplía. */
  function comidasHoyHTML(m) {
    if (!g.Comidas) return '';
    const h = Comidas.hoy();
    const pk = Math.min(100, Math.round(h.kcal / m.kcal * 100));
    const pp = Math.min(100, Math.round(h.prot / m.prot * 100));
    const faltaProt = Math.max(0, m.prot - h.prot);

    return html`
      <div class="list-title">Hoy</div>
      <div class="card">
        <div class="row between" style="align-items:flex-end">
          <div><b style="font-size:1.3rem">${UI.num(h.kcal)}</b>
            <span class="tiny"> de ${UI.num(m.kcal)} kcal</span></div>
          <div class="tiny">${pk}%</div>
        </div>
        <div class="prog" style="margin:6px 0 12px"><i style="width:${pk}%"></i></div>

        <div class="row between" style="align-items:flex-end">
          <div><b style="font-size:1.3rem;color:var(--brand-1)">${h.prot}</b>
            <span class="tiny"> de ${m.prot} g de prote\u00edna</span></div>
          <div class="tiny">${pp}%</div>
        </div>
        <div class="prog" style="margin:6px 0 0">
          <i style="width:${pp}%;background:var(--brand-1)"></i></div>

        <p class="tiny" style="margin:11px 0 0">${raw(faltaProt > 0
          ? 'Te faltan <b>' + faltaProt + ' g de prote\u00edna</b> para llegar al objetivo del d\u00eda.'
          : 'Prote\u00edna del d\u00eda cubierta.')}</p>

        <div class="row" style="margin-top:12px">
          <label class="btn primary grow" for="foto-comida" style="cursor:pointer">
            ${raw(icon('nutricion'))} Foto de lo que comes</label>
          <button class="btn" data-a="comidaMano">${raw(icon('plus'))}</button>
        </div>
        <input type="file" id="foto-comida" accept="image/*" capture="environment" hidden>
        <p class="tiny" style="margin:8px 0 0">La foto se encoge en el m\u00f3vil, se manda para
        que la IA la lea y se suelta: no se guarda ni aqu\u00ed ni en ning\u00fan sitio. Solo quedan
        el nombre del plato y los n\u00fameros.</p>
      </div>

      <div id="comida-pensando"></div>

      ${raw(h.lista.length ? '<div class="stack" style="margin-top:11px">' +
        h.lista.map(comidaFilaHTML).join('') + '</div>' : '')}`;
  }

  function comidaFilaHTML(c) {
    const dudosa = c.confianza === 'baja';
    return html`
      <div class="card" style="padding:11px 13px">
        <div class="row between" style="align-items:flex-start;gap:10px">
          <div class="grow">
            <div style="font-weight:600;font-size:.92rem">${c.plato}</div>
            <div class="tiny">${UI.num(c.kcal)} kcal \u00b7 ${c.prot} g de prote\u00edna
              \u00b7 ${raw(UI.hora ? UI.hora(c.t) : new Date(c.t).toTimeString().slice(0, 5))}
              ${raw(dudosa ? ' \u00b7 <span style="color:var(--warn)">estimaci\u00f3n floja</span>' : '')}</div>
            ${raw(c.detalle ? '<div class="tiny" style="margin-top:3px">' +
              esc(c.detalle) + '</div>' : '')}
          </div>
          <button class="btn icon sm danger" data-borrar-comida="${c.id}"
                  aria-label="Borrar">${raw(icon('trash'))}</button>
        </div>
      </div>`;
  }

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

  /* Manda la foto, apunta lo que la IA vea y suelta la imagen. Mientras piensa
     se enseña la foto en pequeño, que es la única copia que existe y vive en
     memoria hasta que se acaba. */
  function mirarFoto(file) {
    if (!IA.activa()) {
      UI.toast('Esto necesita la clave de Gemini, que se pone en la b\u00f3veda de Ajustes.');
      go('entrenador');
      return;
    }

    /* La caja donde se enseña la foto mientras se piensa. Se busca en el
       documento y no dentro de una pantalla concreta: la misma función la usan
       Alimentación y el acceso rápido de la portada. */
    const caja = document.getElementById('comida-pensando');
    let foto = null;

    const soltar = function () {
      foto = null;                      // la imagen deja de existir aqu\u00ed
      if (caja) caja.innerHTML = '';
    };

    Comidas.prepararFoto(file).then(function (f) {
      foto = f;
      if (caja) {
        caja.innerHTML = html`
          <div class="card row" style="margin-top:11px;gap:12px;align-items:center">
            <img src="${f.vista}" alt="" style="width:64px;height:64px;object-fit:cover;
                 border-radius:10px;flex:none">
            <div class="grow">
              <div style="font-weight:600;font-size:.9rem">Mirando el plato\u2026</div>
              <div class="tiny">La foto se borra en cuanto termine.</div>
            </div>
            <div class="spinner" style="flex:none"></div>
          </div>`;
      }
      return IA.analizarComida({ mime: f.mime, datos: f.datos });
    }).then(function (r) {
      soltar();
      if (!r || !(Number(r.kcal) > 0)) {
        UI.toast('No he visto comida en esa foto. Prueba con m\u00e1s luz o m\u00e1s cerca.');
        return;
      }
      const detalle = (r.alimentos || []).map(function (a) {
        return a.que + (a.cuanto ? ' (' + a.cuanto + ')' : '');
      }).join(', ');

      Comidas.anotar({
        plato: r.plato || 'Comida',
        kcal: r.kcal, prot: r.prot,
        detalle: detalle || r.nota || '',
        confianza: r.confianza || '',
        fuente: 'foto'
      });
      render();
      UI.toast('Anotado: ' + Math.round(r.kcal) + ' kcal y ' + Math.round(r.prot) +
        ' g de prote\u00edna' + (r.confianza === 'baja' ? ' (a ojo, ret\u00f3calo si quieres)' : ''));
    }).catch(function (e) {
      soltar();
      UI.toast(e.message || 'No he podido leer esa foto.');
    });
  }

  /* A mano, para lo que no tiene foto o para corregir lo que la IA no acertó */
  /* A mano, para lo que no tiene foto o para corregir lo que la IA no acertó */
  function comidaAMano() {
    UI.modal(html`
      <h2>Apuntar a mano</h2>
      <p class="muted">Para lo que ya sabes de memoria, o para arreglar una estimaci\u00f3n
      que se qued\u00f3 corta.</p>
      <label class="tiny">QU\u00c9 HAS COMIDO</label>
      <input id="cm-plato" placeholder="Ej. Arroz con pollo" autocomplete="off">
      <div class="row" style="margin-top:10px">
        <div class="grow">
          <label class="tiny">CALOR\u00cdAS</label>
          <input id="cm-kcal" type="number" inputmode="numeric" min="0" placeholder="0">
        </div>
        <div class="grow">
          <label class="tiny">PROTE\u00cdNA (g)</label>
          <input id="cm-prot" type="number" inputmode="numeric" min="0" placeholder="0">
        </div>
      </div>
      <button class="btn primary block" id="cm-ok" style="margin-top:14px">Anotar</button>`,
      function (el) {
        const guardar = function () {
          const plato = el.querySelector('#cm-plato').value.trim();
          const kcal = Number(el.querySelector('#cm-kcal').value) || 0;
          const prot = Number(el.querySelector('#cm-prot').value) || 0;
          if (!kcal && !prot) {
            UI.toast('Pon al menos las calor\u00edas o la prote\u00edna');
            return;
          }
          Comidas.anotar({ plato: plato || 'Comida', kcal: kcal, prot: prot, fuente: 'mano' });
          UI.closeModal();
          render();
          UI.toast('Anotado');
        };
        el.querySelector('#cm-ok').onclick = guardar;
        el.querySelector('#cm-prot').onkeydown = function (ev) {
          if (ev.key === 'Enter') guardar();
        };
      });
  }

  /* La usa también la portada, que tiene su propio botón de cámara */
  V.mirarFotoComida = mirarFoto;

  V.nutricion.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=datos]', function () { go('datos'); });
    bind(root, '[data-a=configIA]', function () { go('entrenador'); });

    /* ---- lo que has comido hoy ---- */
    bindAll(root, '[data-borrar-comida]', function (el) {
      Comidas.borrar(el.dataset.borrarComida);
      render();
      UI.toast('Borrado');
    });

    bind(root, '[data-a=comidaMano]', function () { comidaAMano(); });

    const campoFoto = root.querySelector('#foto-comida');
    if (campoFoto) campoFoto.onchange = function () {
      const file = campoFoto.files && campoFoto.files[0];
      /* se vac\u00eda ya: si no, elegir dos veces la misma foto no dispara nada */
      campoFoto.value = '';
      if (file) mirarFoto(file);
    };

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
      <p class="muted">Conoce tu perfil, tus rutinas y tu progreso. No está aquí para
      darte la razón: si algo lo estás haciendo mal, te lo dice.</p>

      <div class="card">
        <textarea id="ia-q" rows="3"
          placeholder="¿Estoy entrenando bien el pecho? ¿Cómo bajo grasa sin perder fuerza?"></textarea>
        <button class="btn primary block" data-a="preguntar" style="margin-top:10px">
          ${raw(icon('chispa'))} Preguntar</button>
      </div>

      <div id="ia-respuesta"></div>

      <div class="list-title">Análisis rápidos</div>
      <div class="list">
        ${raw(filaAccion('grafica', 'Cómo voy', 'Lee tus últimos entrenamientos sin adornos', 'analizar'))}
        ${raw(filaAccion('dumbbell', 'Audita mis rutinas', 'Les pone nota y dice qué falla', 'revisar'))}
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

      cargando(a === 'analizar' ? 'Revisando tus entrenamientos…' : 'Auditando tus rutinas…');
      window.scrollTo({ top: caja.offsetTop - 80, behavior: 'smooth' });

      const peticion = a === 'analizar' ? IA.analizarProgreso() : IA.revisarRutinas();
      peticion.then(function (r) {
        caja.innerHTML = a === 'analizar'
          ? html`<div class="card ia-resp">
              <div class="ia-bloque"><b>Lo que se sostiene</b><p>${r.bien}</p></div>
              <div class="ia-bloque"><b>Lo que hay que arreglar</b><p>${r.flojo}</p></div>
              <div class="ia-bloque destacado"><b>Esta semana</b><p>${r.accion}</p></div>
            </div>`
          : html`<div class="card ia-resp">
              ${raw(Number(r.nota) > 0 ? html`
                <div class="row" style="gap:12px;align-items:center;margin-bottom:10px">
                  <div style="flex:none;font-size:1.9rem;font-weight:700;line-height:1;color:${raw(
                    Number(r.nota) >= 8 ? 'var(--acc)'
                      : Number(r.nota) >= 6 ? 'var(--warn)' : 'var(--bad)')}">${Number(r.nota)}<span
                       style="font-size:.9rem;color:var(--dim2)">/10</span></div>
                  <div class="tiny grow">Nota que les pone a tus rutinas tal y como están.</div>
                </div>` : '')}
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
    const faltantes = Spotify.permisosQueFaltan ? Spotify.permisosQueFaltan() : [];

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
          <p class="muted" style="margin:5px 0 10px">${raw(faltantes.length
            ? 'A la conexión con Spotify le faltan permisos, y por eso tus listas y el '
              + 'buscador dan error. Reconecta y acepta la pantalla de Spotify tal cual '
              + 'sale.'
            : 'Hay funciones nuevas —tus listas de Spotify y el buscador— y Spotify pide '
              + 'permiso otra vez para eso. Es un toque y no pierdes nada.')}</p>
          ${raw(faltantes.length
            ? '<p class="tiny" style="margin:0 0 10px">Falta: ' + esc(faltantes.join(', ')) + '</p>'
            : '')}
          <button class="btn primary block" data-a="conectar">Reconectar Spotify</button>
        </div>` : '')}

      <div id="sp-player" style="margin-top:12px"></div>

      <details class="card" style="margin-top:12px">
        <summary class="tiny">Qué permisos ha dado Spotify</summary>
        <p class="tiny" style="margin:8px 0 0;word-break:break-word">${
          Spotify.permisosConcedidos ? (Spotify.permisosConcedidos()
            || 'la sesión es anterior y no lo apuntó') : ''}</p>
        ${raw(faltantes.length
          ? '<p class="tiny" style="margin:6px 0 0;color:var(--bad)">Falta: '
            + esc(faltantes.join(', ')) + '</p>'
          : '<p class="tiny" style="margin:6px 0 0">No falta ninguno de los que pide la app.</p>')}
        <button class="btn sm block" data-a="diagnostico" style="margin-top:10px">
          Probar las llamadas que fallan</button>
        <pre class="tiny" id="sp-diag" style="white-space:pre-wrap;word-break:break-word;
          margin:10px 0 0"></pre>
      </details>

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
        <input id="sp-buscar" type="search" placeholder="Canciones, listas, álbumes o pódcast"
               autocomplete="off">
      </div>
      <div class="pill-scroll" id="sp-filtros" style="padding-bottom:10px">
        <button class="chip ${filtrosBusca.length ? '' : 'on'}" data-tipo="">Todo</button>
        ${raw(TIPOS_BUSCA.map(function (t) {
          return '<button class="chip ' + (filtrosBusca.indexOf(t.k) !== -1 ? 'on' : '') +
            '" data-tipo="' + t.k + '">' + esc(t.n) + '</button>';
        }).join(''))}
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

  /* Qué se busca. Vacío es todo, que es como se abre: quien busca «Fred again»
     no quiere elegir antes si es canción, álbum o artista. */
  let filtrosBusca = [];

  const TIPOS_BUSCA = [
    { k: 'track', n: 'Canciones' },
    { k: 'playlist', n: 'Listas' },
    { k: 'album', n: 'Álbumes' },
    { k: 'artist', n: 'Artistas' },
    { k: 'show', n: 'Pódcast' }
  ];

  /* Spotify tiene cerrada la ruta que devuelve las canciones de una lista, así
     que no hay desplegable que valga: la fila entera suena y ya está. */
  const SORPRESA = 'Spotify no deja ver las canciones desde aquí, así que la '
    + 'siguiente siempre es sorpresa. Tú dale al play y déjate sorprender.';

  function tarjetasListas(listas, propias) {
    if (!listas.length) {
      return '<p class="tiny">' + (propias
        ? 'No tienes listas guardadas en Spotify todavía.'
        : 'Ninguna lista con ese nombre.') + '</p>';
    }
    return (propias ? '<p class="tiny" style="margin:0 0 10px">' + SORPRESA + '</p>' : '')
      + '<div class="stack">' + listas.map(function (l) {
      return html`
        <div class="card lista-card" style="padding:0;overflow:hidden">
          <button class="rt-item" data-poner-ya="${l.uri}" data-nombre="${l.nombre}"
                  style="width:100%;text-align:left;background:none;border:0">
            ${raw(l.portada
              ? '<img src="' + esc(l.portada) + '" alt="" loading="lazy">'
              : '<span class="bm-sin">' + icon('lista') + '</span>')}
            <div class="grow">
              <div style="font-weight:600;font-size:.86rem">${l.nombre}</div>
              <div class="tiny">${raw([
                l.tipo ? esc(l.tipo) : '',
                l.temas != null ? l.temas + ' canciones' : '',
                l.de ? esc(l.de) : ''
              ].filter(Boolean).join(' · '))}</div>
            </div>
          </button>
          <button class="lista-play" data-poner-ya="${l.uri}" data-nombre="${l.nombre}"
                  aria-label="Reproducir ${l.nombre}">${raw(icon('play'))}</button>
        </div>`;
    }).join('') + '</div>';
  }

  /* La lista que elige él manda: sustituye arriba a la que hizo la IA, que era
     lo que seguía viendo por mucho que eligiera otra. */
  function subirArriba(l) {
    UI.toast('Poniendo «' + l.nombre + '» arriba…');
    return Spotify.cancionesDeLista(l.id, 100).then(function (temas) {
      if (!temas.length) { UI.toast('Reproduciendo ' + l.nombre); return; }
      guardarLista({
        nombre: l.nombre,
        descripcion: 'Tu lista de Spotify' + (l.de ? ' · ' + l.de : ''),
        deSpotify: true,
        uri: l.uri,
        pistas: temas.map(function (t) {
          return { uri: t.uri, titulo: t.titulo, artista: t.artista };
        })
      });
      render();
    }).catch(function () {
      /* si no deja leer sus canciones, al menos suena y se dice por qué */
      UI.toast('Sonando ' + l.nombre + '. La siguiente es sorpresa — déjate llevar.');
    });
  }

  function pintarListas(root, texto) {
    const caja = root.querySelector('#sp-listas');
    if (!caja) return;
    caja.innerHTML = '<p class="tiny">Buscando…</p>';

    const q = String(texto || '').trim();
    /* Primero lo suyo, que es lo que más se busca, y detrás lo que haya en
       Spotify: canciones, álbumes, artistas y pódcast. Antes, si una lista
       suya coincidía, lo de Spotify no llegaba a verse. */
    const pedir = q
      ? Spotify.misListas().catch(function () { return []; }).then(function (mias) {
          const filtro = I18N.norm(q);
          /* Si ha marcado tipos y las listas no están entre ellos, las suyas
             tampoco pintan nada aquí */
          const quiereListas = !filtrosBusca.length || filtrosBusca.indexOf('playlist') !== -1;
          const suyas = !quiereListas ? [] : mias.filter(function (l) {
            return I18N.norm(l.nombre).indexOf(filtro) !== -1;
          }).map(function (l) {
            return Object.assign({}, l, { tipo: 'Lista tuya' });
          });
          return Spotify.buscarListas(q, filtrosBusca).then(function (fuera) {
            const vistas = {};
            const todo = suyas.concat(fuera).filter(function (x) {
              if (!x || !x.uri || vistas[x.uri]) return false;
              vistas[x.uri] = 1;
              return true;
            });
            /* concat pierde lo que colgaba del array; se pasa aparte */
            todo.noSePudo = fuera.noSePudo || [];
            return todo;
          }).catch(function (e) {
            /* si falla del todo y él tiene listas suyas, al menos eso se ve */
            if (!suyas.length) throw e;
            suyas.noSePudo = [];
            suyas.fallo = e.message;
            return suyas;
          });
        })
      : Spotify.misListas();

    pedir.then(function (listas) {
      caja.innerHTML = tarjetasListas(listas, !q)
        + ((listas.noSePudo && listas.noSePudo.length)
          ? '<p class="tiny" style="margin:10px 0 0;color:var(--warn)">Spotify no ha '
            + 'dejado buscar ' + esc(listas.noSePudo.join(' ni ')) + ' desde esta app.</p>'
          : '');
      caja.querySelectorAll('[data-poner-ya]').forEach(function (b) {
        b.onclick = function (ev) {
          ev.stopPropagation();
          Spotify.desbloquearAudio();
          const l = listas.find(function (x) { return x.uri === b.dataset.ponerYa; });
          /* ya sabemos de qué lista es: se apunta para que salga su nombre en
             el reproductor sin esperar a preguntárselo a Spotify */
          if (l) Spotify.apuntarContexto(l.uri, l.nombre);
          const uri = b.dataset.ponerYa;
          const esLista = uri.indexOf(':playlist:') !== -1;
          Spotify.iniciarReproductor()
            .catch(function () { /* sin reproductor propio, donde se pueda */ })
            .then(function () { return Spotify.ponerUri(uri); })
            .then(function () {
              /* sólo una lista puede subir arriba; una canción suelta o un
                 pódcast no tienen nada que poner ahí */
              if (l && esLista) subirArriba(l);
              else UI.toast('Sonando' + (l ? ' ' + l.nombre : ''));
            })
            .catch(function (e) { UI.toast(e.message); });
        };
      });

    }).catch(function (e) {
      caja.innerHTML = '<p class="tiny" style="color:var(--bad)">' + esc(e.message) + '</p>';
    });
  }

  /* Las canciones de la lista se pueden plegar: diecinueve seguidas dejan los
     botones de arriba fuera de la pantalla y hay que subir a buscarlos. */
  let temasAbiertos = true;

  function etiquetaPlegar(n) {
    return temasAbiertos ? 'Ocultar las canciones' : 'Ver las ' + n + ' canciones';
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
        </div>
        <div class="row" style="margin-top:8px">
          <button class="btn ghost grow sm" data-a="generar">${raw(icon('chispa'))} Crear otra distinta</button>
        </div>
        <button class="btn ghost block sm plegar ${temasAbiertos ? 'abierta' : ''}"
                data-a="plegarTemas" style="margin-top:8px"
                aria-expanded="${temasAbiertos}">
          ${raw(icon('chevron'))} ${raw(etiquetaPlegar(l.pistas.length))}</button>
      </div>

      <div class="stack" data-temas-lista style="margin-top:11px"
           ${raw(temasAbiertos ? '' : 'hidden')}>
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

      /* Los filtros se pintan a mano y no por render(), que si no el buscador
         pierde el foco y el teclado se cierra a cada toque. */
      const filtros = root.querySelector('#sp-filtros');
      if (filtros) filtros.onclick = function (ev) {
        const b = ev.target.closest('[data-tipo]');
        if (!b) return;
        const k = b.dataset.tipo;
        if (!k) filtrosBusca = [];
        else {
          const i = filtrosBusca.indexOf(k);
          if (i === -1) filtrosBusca.push(k); else filtrosBusca.splice(i, 1);
        }
        filtros.querySelectorAll('[data-tipo]').forEach(function (x) {
          const suyo = x.dataset.tipo;
          x.classList.toggle('on', suyo
            ? filtrosBusca.indexOf(suyo) !== -1
            : !filtrosBusca.length);
        });
        pintarListas(root, busca.value);
      };
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

    bind(root, '[data-a=plegarTemas]', function (btn) {
      const caja = root.querySelector('[data-temas-lista]');
      if (!caja) return;
      temasAbiertos = !temasAbiertos;
      caja.hidden = !temasAbiertos;
      btn.classList.toggle('abierta', temasAbiertos);
      btn.setAttribute('aria-expanded', String(temasAbiertos));
      btn.innerHTML = icon('chevron') + ' ' +
        etiquetaPlegar(caja.querySelectorAll('[data-pista]').length);
    });

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

    bind(root, '[data-a=diagnostico]', function (btn) {
      const caja = root.querySelector('#sp-diag');
      btn.disabled = true;
      caja.textContent = 'Probando…';
      Spotify.diagnostico()
        .then(function (t) { caja.textContent = t; btn.disabled = false; })
        .catch(function (e) { caja.textContent = 'No se pudo probar: ' + e.message; btn.disabled = false; });
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
  /* De qué lista sale lo que suena. Se guarda la uri para no volver a
     preguntar el nombre mientras no cambie. */
  let ctxUri = '';
  let ctxNombre = '';

  /* null = todavía no se sabe si Spotify deja guardar favoritas */
  let favVa = null;
  let favPreguntado = false;
  /* null = todavía no se sabe; false = este aparato no deja tocar el volumen */
  let volumenVa = null;
  let volActual = 0.6;            // el que trae el reproductor al arrancar

  function comprobarFavorita(s, alSaber) {
    if (favVa === false) return;   /* aquí Spotify ni lee ni escribe favoritas */
    if (!s || !s.id || s.id === favoritaDe) return;
    favoritaDe = s.id;
    Spotify.esFavorita(s.id).then(function (si) {
      if (si !== favoritaActual) { favoritaActual = si; if (alSaber) alSaber(); }
    });
  }

  /* El nombre de donde sale la canción. El reproductor propio a veces lo trae
     puesto; si no, se pregunta una vez y se pinta cuando llegue. */
  function comprobarContexto(s, alSaber) {
    const uri = (s && s.contexto) || '';
    if (uri === ctxUri) return;
    ctxUri = uri;
    if (!uri) { ctxNombre = ''; return; }

    if (s.contextoNombre) {
      ctxNombre = s.contextoNombre;
      if (alSaber) alSaber();
      return;
    }
    ctxNombre = '';
    Spotify.nombreDeContexto(uri).then(function (n) {
      if (uri !== ctxUri || !n) return;
      ctxNombre = n;
      if (alSaber) alSaber();
    });
  }

  /* Lo último que se pintó. montar() no recibe el estado y, cuando la música
     suena en otro aparato, Spotify.estado() no devuelve nada. */
  let pintado = null;

  function reproductorHTML(s) {
    pintado = s;
    const pct = s.duracion ? Math.min(100, Math.round(s.progreso / s.duracion * 100)) : 0;

    return html`
      <div class="player ${s.sonando ? 'sonando' : ''}">
        ${raw(s.portada
          ? '<img class="player-art" src="' + esc(s.portada) + '" alt="">'
          : '<div class="player-art vacia">' + icon('musica') + '</div>')}

        <div class="player-info">
          <div class="player-t">${s.titulo}</div>
          <div class="player-a">${s.artista}</div>
          ${raw(ctxNombre ? html`
            <div class="player-de">${raw(icon('lista'))} <span>${ctxNombre}</span></div>` : '')}
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
          ${raw(favVa === false ? '<span class="player-b chico hueco"></span>' : html`
          <button class="player-b chico ${favoritaActual ? 'fav' : ''}" data-sp="corazon"
            aria-label="Guardar en favoritas" aria-pressed="${!!favoritaActual}">
            ${raw(icon('corazon'))}</button>`)}
        </div>

        ${raw(s.local && volumenVa !== false ? html`
          <div class="player-vol" style="--pct:${Math.round(volActual * 100)}%">
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
        vol.parentNode.style.setProperty('--pct', vol.value + '%');
        Spotify.volumen(volActual).catch(function () { /* sin reproductor propio */ });
      };
      if (volumenVa === null && Spotify.admiteVolumen) {
        Spotify.admiteVolumen().then(function (va) {
          volumenVa = va;
          if (!va && root.isConnected) {
            const s = Spotify.estado();
            if (s) { root.innerHTML = reproductorHTML(s); montarReproductor(root); }
          }
        });
      }
    }

    if (!favPreguntado && Spotify.puedeGuardar) {
      favPreguntado = true;
      Spotify.puedeGuardar().then(function (va) {
        if (va === favVa) return;
        favVa = va;
        if (!va && root.isConnected) {
          const s = Spotify.estado();
          if (s) { root.innerHTML = reproductorHTML(s); montarReproductor(root); }
        }
      });
    }

    comprobarContexto(pintado, function () {
      const s = pintado;
      if (s && root.isConnected) { root.innerHTML = reproductorHTML(s); montarReproductor(root); }
    });

    const s0 = pintado;
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
            const propio = Spotify.estado();
            const dame = propio && propio.id
              ? Promise.resolve(propio)
              : Spotify.sonando();
            return dame.then(function (s) {
              return Spotify.marcarFavorita(s && s.id, !favoritaActual);
            }).then(function () {
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
