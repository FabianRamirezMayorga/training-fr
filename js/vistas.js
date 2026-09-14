/* vistas.js — perfil, objetivos, alertas, nutrición, entrenador con IA y música.
   Se registran en g.VISTAS y el router de app.js las recoge. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  /* Fila de lista agrupada, al estilo de Ajustes de iOS */
  function fila(opciones) {
    const o = opciones || {};
    return html`
      <div class="list-row ${o.accion ? 'tap' : ''}" ${raw(o.accion ? 'data-fila="' + esc(o.accion) + '"' : '')}>
        ${raw(o.icono ? '<span class="row-icon">' + icon(o.icono) + '</span>' : '')}
        <div class="grow">
          <div class="list-row-title">${o.titulo}</div>
          ${raw(o.sub ? '<div class="list-row-sub">' + esc(o.sub) + '</div>' : '')}
        </div>
        ${raw(o.valor ? '<span class="list-row-val">' + esc(o.valor) + '</span>' : '')}
        ${raw(o.derecha || '')}
        ${raw(o.accion ? '<span class="chevron">' + icon('chevron') + '</span>' : '')}
      </div>`;
  }

  /* ================= perfil (índice) ================= */

  V.perfil = function () {
    const p = Perfil.datos();
    const listo = Perfil.completo(p);
    const m = listo ? Perfil.macros(p) : null;
    const v = listo ? Perfil.imc(p) : null;
    const cat = Perfil.categoriaIMC(v);
    const metas = Objetivos.lista();
    const cumplidas = metas.filter(function (x) { return x.logrado; }).length;
    const alertas = Alertas.lista().filter(function (a) { return a.activa; }).length;

    return html`
      <h1>Perfil</h1>

      ${raw(listo ? html`
        <div class="stats" style="margin-bottom:6px">
          <div class="stat"><b>${UI.num(p.peso)}</b><span>kg</span></div>
          <div class="stat"><b>${v.toFixed(1)}</b><span>IMC · ${esc(cat.label)}</span></div>
          <div class="stat"><b>${m ? UI.num(m.kcal) : '—'}</b><span>kcal objetivo</span></div>
        </div>`
      : html`
        <div class="card" style="border-color:var(--acc)">
          <div style="font-weight:600;margin-bottom:4px">Completa tus datos</div>
          <p class="muted" style="margin-bottom:12px">Con tu peso, altura, edad y hábitos
          puedo calcular tus calorías, ajustar las rutinas y prepararte el plan de comidas.</p>
          <button class="btn primary block" data-a="datos">Empezar</button>
        </div>`)}

      ${raw(Modo.franjaInvitado())}

      <div class="list-title">Tú</div>
      <div class="list">
        ${raw(fila({ icono: 'perfil', titulo: 'Datos y hábitos', accion: 'datos',
          sub: !Store.settings().name ? 'Dime tu nombre para empezar'
            : listo ? Store.settings().name + ' · ' + p.edad + ' años · ' +
              Perfil.ACTIVIDAD[p.actividad].label
            : 'Sin completar' }))}
        ${raw(fila({ icono: 'trofeo', titulo: 'Objetivos', accion: 'objetivos',
          sub: metas.length ? metas.length + ' en marcha · ' + cumplidas + ' cumplidos'
            : 'Ninguno todavía' }))}
        ${raw(fila({ icono: 'nutricion', titulo: 'Alimentación', accion: 'nutricion',
          sub: m ? m.kcal + ' kcal · ' + m.prot + ' g de proteína' : 'Necesita tus datos' }))}
        ${raw(fila({ icono: 'campana', titulo: 'Alertas', accion: 'alertas',
          sub: alertas ? alertas + (alertas === 1 ? ' recordatorio activo' : ' recordatorios activos')
            : 'Sin recordatorios' }))}
      </div>

      <div class="list-title">Entrenamiento</div>
      <div class="list">
        ${raw(fila({ icono: 'chispa', titulo: 'Entrenador con IA', accion: 'entrenador',
          sub: IA.activa() ? 'Listo para usar' : 'Sin configurar' }))}
        ${raw(fila({ icono: 'musica', titulo: 'Música', accion: 'musica',
          sub: Spotify.activa() ? 'Spotify conectado'
            : Spotify.configurado() ? 'Sin conectar' : 'Sin configurar' }))}
        ${raw(fila({ icono: 'dumbbell', titulo: 'Dónde entrenas', accion: 'lugar',
          valor: (Data.GEAR[Store.settings().gear] || {}).label }))}
      </div>

      <div class="list-title">Aplicación</div>
      <div class="list">
        ${raw(fila({ icono: 'nube', titulo: 'Mi cuenta', accion: 'cuenta',
          sub: Sync.activa() ? Sync.email() : 'Sin sincronizar' }))}
        ${raw(fila({ icono: 'timer', titulo: 'Ajustes', accion: 'ajustes',
          sub: 'Unidades, tema, descanso, copias y sin conexión' }))}
        ${raw(g.Admin && Admin.administra()
          ? fila({ icono: 'llave', titulo: 'Cuentas', accion: 'usuarios',
              sub: 'Crear, desactivar y borrar cuentas del proyecto' })
          : '')}
      </div>

      <p class="tiny" style="margin:22px 0 0">Training FR</p>`;
  };

  V.perfil.mount = function (root) {
    const ir = { datos: 'datos', objetivos: 'objetivos', nutricion: 'nutricion',
      alertas: 'alertas', entrenador: 'entrenador', musica: 'musica',
      cuenta: 'cuenta', ajustes: 'ajustes', usuarios: 'usuarios' };

    /* Se pregunta al servidor si esta cuenta administra; mientras no conteste,
       la entrada no está. Enseñarla o no es comodidad: el permiso lo decide la
       función, no esta pantalla. */
    if (g.Admin && !Admin.administra()) {
      Admin.comprobar().then(function (si) { if (si) render(); });
    }
    bindAll(root, '[data-fila]', function (el) {
      const d = el.dataset.fila;
      if (d === 'lugar') return App.lugarSheet();
      go(ir[d] || 'ajustes');
    });
    bind(root, '[data-a=datos]', function () { go('datos'); });
    bind(root, '[data-a=irCuenta]', function () { go('cuenta'); });
  };

  /* ================= datos y hábitos ================= */

  /* «la edad» / «la edad y el peso» / «la edad, el peso y la altura» */
  function listaEs(xs) {
    if (xs.length === 1) return esc(xs[0]);
    return esc(xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1]);
  }

  V.datos = function () {
    const p = Perfil.datos();
    const faltan = Perfil.loQueFalta(p);
    const horas = Perfil.horasDeSueno(p.acostar, p.despertar);
    const grupo = function (titulo, contenido) {
      return '<div class="list-title">' + esc(titulo) + '</div><div class="card">' + contenido + '</div>';
    };
    const opciones = function (campo, mapa, actual) {
      return '<div class="row wrap" style="gap:6px;margin-top:7px">' +
        Object.keys(mapa).map(function (k) {
          const label = typeof mapa[k] === 'string' ? mapa[k] : mapa[k].label;
          return '<button class="chip ' + (actual === k ? 'on' : '') + '" data-set="' +
            campo + '" data-val="' + esc(k) + '">' + esc(label) + '</button>';
        }).join('') + '</div>';
    };

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <h1>Datos y hábitos</h1>
      <p class="muted">Sirven para calcular tus calorías y ajustar lo que te propongo.
      No salen de tu dispositivo salvo que actives la sincronización o el entrenador con IA.</p>

      ${raw(faltan.length ? html`
        <div class="card" style="border-color:var(--warn)">
          <b>Falta ${raw(listaEs(faltan))}</b>
          <p class="tiny" style="margin:6px 0 0">Sin eso no puedo calcular tus calorías ni
          ajustarte el entrenamiento. Es lo único obligatorio; lo demás lo vas rellenando
          cuando quieras.</p>
        </div>` : html`
        <p class="tiny" style="margin:-4px 0 0">Todo lo que cambies aquí se guarda solo al
        salir del campo. No hay que pulsar nada.</p>`)}

      ${raw(grupo('Quién eres', html`
        <label class="tiny">TU NOMBRE</label>
        <div class="tiny" style="margin:2px 0 0">Para saludarte al abrir la app y para que
        el entrenador con IA te hable a ti, no a un usuario.</div>
        <input id="p-nombre" value="${Store.settings().name || ''}" placeholder="Tu nombre"
               autocomplete="given-name" style="margin-top:6px">`))}

      ${raw(grupo('Cuerpo', html`
        <label class="tiny">SEXO BIOLÓGICO</label>
        <div class="tiny" style="margin:2px 0 0">Cambia la fórmula del metabolismo basal.</div>
        ${raw(opciones('sexo', { hombre: 'Hombre', mujer: 'Mujer' }, p.sexo))}
        <div class="hr"></div>
        <div class="row" style="gap:10px">
          <div class="grow"><div class="tiny">EDAD</div>
            <input type="number" inputmode="numeric" min="14" max="99" value="${p.edad || ''}"
                   data-num="edad" placeholder="años" style="text-align:center;margin-top:4px"></div>
          <div class="grow"><div class="tiny">ALTURA (CM)</div>
            <input type="number" inputmode="numeric" min="120" max="230" value="${p.altura || ''}"
                   data-num="altura" placeholder="cm" style="text-align:center;margin-top:4px"></div>
        </div>
        <div class="row" style="gap:10px;margin-top:10px">
          <div class="grow"><div class="tiny">PESO (KG)</div>
            <input type="number" inputmode="decimal" step="0.1" min="30" max="250" value="${p.peso || ''}"
                   data-num="peso" placeholder="kg" style="text-align:center;margin-top:4px"></div>
          <div class="grow"><div class="tiny">GRASA % (OPCIONAL)</div>
            <input type="number" inputmode="decimal" step="0.5" min="3" max="60" value="${p.grasa || ''}"
                   data-num="grasa" placeholder="—" style="text-align:center;margin-top:4px"></div>
        </div>`))}

      ${raw(grupo('Actividad diaria', opciones('actividad', Perfil.ACTIVIDAD, p.actividad) +
        '<div class="tiny" style="margin-top:8px">' +
        esc((Perfil.ACTIVIDAD[p.actividad] || {}).note || '') + '</div>'))}

      ${raw(grupo('Objetivo', opciones('objetivo', Perfil.OBJETIVO, p.objetivo) +
        (p.objetivo !== 'mantener'
          ? '<div class="hr"></div><label class="tiny">A QUÉ RITMO</label>' +
            opciones('ritmo', Perfil.RITMO, p.ritmo) +
            '<div class="tiny" style="margin-top:8px">Unos ' +
            (Perfil.RITMO[p.ritmo] || {}).kgSemana + ' kg por semana.</div>'
          : '')))}

      ${raw(grupo('Hábitos', html`
        <label class="tiny">TU DÍA</label>
        <div class="tiny" style="margin:2px 0 0">Con esto reparto los recordatorios de agua
        y comidas por tus horas reales, no por unas por defecto, y saco cuánto duermes.</div>
        <div class="row" style="gap:10px;margin-top:8px">
          <div class="grow"><div class="tiny">ME LEVANTO</div>
            <input type="time" value="${p.despertar || '07:00'}" data-txt="despertar"
                   style="margin-top:4px"></div>
          <div class="grow"><div class="tiny">ME ACUESTO</div>
            <input type="time" value="${p.acostar || '23:00'}" data-txt="acostar"
                   style="margin-top:4px"></div>
        </div>
        ${raw(horas != null ? html`
          <div class="row between" style="margin-top:10px;gap:10px;align-items:center">
            <span class="tiny">DUERMES</span>
            <b>${String(horas).replace('.', ',')} h</b>
          </div>
          <div class="tiny" style="margin-top:2px">Sale de esas dos horas, no hace falta
          apuntarlo aparte.${raw(horas < 6
            ? ' Con menos de 6 h cuesta recuperar entre sesiones.' : '')}</div>`
          : html`<div class="tiny" style="margin-top:8px">Pon las dos horas y calculo
          cuánto duermes.</div>`)}
        <div class="hr"></div>
        <div class="tiny">COMIDAS AL DÍA</div>
        <input type="number" inputmode="numeric" min="2" max="7" value="${p.comidas}"
               data-num="comidas" style="text-align:center;margin-top:4px;max-width:120px">
        <div style="height:10px"></div>
        <div class="tiny">HORA A LA QUE ENTRENAS (OPCIONAL)</div>
        <input type="time" value="${p.horaEntreno || ''}" data-txt="horaEntreno"
               style="margin-top:4px">
        <div class="tiny" style="margin-top:4px">Si la dejas vacía, la deduzco de las horas a
        las que sueles entrenar.</div>
        <div class="hr"></div>
        <div class="destacado-clave" style="padding:11px 12px;border-radius:var(--r-s)">
          <b style="font-size:.88rem">Lo de aquí abajo es lo que más cambia lo que te propongo</b>
          <p class="tiny" style="margin:5px 0 0">De estos cuatro campos salen los menús que
          te sugiero y los ejercicios que entran o no en tus rutinas. Si los dejas vacíos,
          te propongo lo de siempre para cualquiera; si los rellenas, te propongo lo tuyo.</p>
        </div>
        <div style="height:12px"></div>
        <label class="tiny">ALIMENTACIÓN</label>
        <div class="tiny" style="margin:2px 0 0">Ningún menú te va a ofrecer algo que no comas.</div>
        ${raw(opciones('dieta', Perfil.DIETA, p.dieta))}
        <div class="hr"></div>
        <label class="tiny">ALERGIAS O ALIMENTOS QUE EVITAS</label>
        <div class="tiny" style="margin:2px 0 0">Quedan fuera de todo lo que te proponga, y si
        salen en la foto de un plato te aviso.</div>
        <input value="${p.alergias}" data-txt="alergias" placeholder="Lactosa, frutos secos…"
               style="margin-top:5px">
        <div style="height:10px"></div>
        <label class="tiny">LESIONES O LIMITACIONES</label>
        <div class="tiny" style="margin:2px 0 0">Lo que escribas aquí retira ejercicios de tus
        rutinas y de lo que te propone el entrenador. Es lo que evita que te ofrezca algo que
        te haga daño.</div>
        <input value="${p.lesiones}" data-txt="lesiones" placeholder="Hombro derecho, rodilla…"
               style="margin-top:5px">
        <div style="height:10px"></div>
        <label class="tiny">CONDICIONES DE SALUD</label>
        <div class="tiny" style="margin:2px 0 0">Para que el menú las tenga en cuenta.
        No sustituye a tu médico ni a un dietista.</div>
        <input value="${p.condiciones || ''}" data-txt="condiciones"
               placeholder="Tensión alta, colesterol, diabetes…" style="margin-top:5px">`))}

      ${raw(Perfil.completo(p) ? html`
        <div class="list-title">Tus números</div>
        <div class="list">
          ${raw(fila({ titulo: 'Metabolismo basal', valor: UI.num(Math.round(Perfil.tmb(p))) + ' kcal' }))}
          ${raw(fila({ titulo: 'Gasto diario estimado', valor: UI.num(Math.round(Perfil.tdee(p))) + ' kcal' }))}
          ${raw(fila({ titulo: 'Objetivo diario', valor: UI.num(Perfil.calorias(p)) + ' kcal' }))}
          ${raw(fila({ titulo: 'Agua al día', valor: Perfil.agua(p) + ' L' }))}
          ${raw(fila({ titulo: 'Peso saludable',
            valor: Perfil.pesoSaludable(p).min.toFixed(0) + '–' +
                   Perfil.pesoSaludable(p).max.toFixed(0) + ' kg' }))}
        </div>
        <p class="tiny" style="margin-top:10px">Estimaciones para población general
        (Mifflin-St Jeor). No sustituyen la valoración de un profesional sanitario.</p>` : '')}

      <div class="list-title">Registro de peso</div>
      <div class="card">
        <div class="tiny">Esto no guarda la página: apunta cuánto pesas hoy para ver tu
        evolución. Tu peso de siempre se cambia arriba, en Cuerpo.</div>
        <div class="row" style="margin-top:8px">
          <input type="number" inputmode="decimal" step="0.1" id="peso-hoy"
                 placeholder="Peso de hoy" class="grow">
          <button class="btn primary" data-a="pesar">Apuntar</button>
        </div>
        ${raw(pesoHistorial())}
      </div>`;
  };

  function pesoHistorial() {
    const lista = Perfil.pesajes();
    if (lista.length < 2) {
      return '<p class="tiny" style="margin:10px 0 0">Registra tu peso cada semana para ver la evolución.</p>';
    }
    const ultimos = lista.slice(-12);
    const min = Math.min.apply(null, ultimos.map(function (x) { return x.peso; }));
    const max = Math.max.apply(null, ultimos.map(function (x) { return x.peso; }));
    const rango = max - min || 1;
    const t = Perfil.tendencia(30);

    return html`
      <div class="bars" style="height:100px;margin-top:12px">
        ${raw(ultimos.map(function (x) {
          const alto = 20 + Math.round((x.peso - min) / rango * 75);
          return '<div class="b" title="' + esc(UI.num(x.peso)) + ' kg"><i style="height:' +
            alto + '%"></i><span>' + esc(UI.fechaCorta(x.fecha)) + '</span></div>';
        }).join(''))}
      </div>
      ${raw(t ? '<div class="tiny" style="margin-top:8px">' +
        (t.dif > 0 ? '+' : '') + t.dif.toFixed(1) + ' kg en 30 días</div>' : '')}`;
  }

  /* ---------- que se vea que se ha guardado ----------
     Los campos se guardaban al salir de ellos, y ahí había dos problemas: si
     escribías y te ibas de la pantalla sin salir del campo —que en un móvil es
     lo normal, se toca otra pestaña y ya está— lo escrito se perdía; y aunque
     se guardara, nada lo decía, así que uno se queda buscando un botón de
     guardar que no existe.

     Ahora se guarda mientras se escribe, con medio segundo de margen para no
     escribir en disco en cada tecla, y el propio campo lo confirma. */
  function marcaDeGuardado(inp) {
    let caja = inp.parentNode;
    if (!caja || !caja.classList || !caja.classList.contains('campo-ok')) {
      caja = document.createElement('span');
      caja.className = 'campo-ok';
      inp.parentNode.insertBefore(caja, inp);
      caja.appendChild(inp);
      const ok = document.createElement('span');
      ok.className = 'campo-ok-aviso';
      ok.textContent = 'Guardado';
      caja.appendChild(ok);
    }
    return caja.querySelector('.campo-ok-aviso');
  }

  function avisarGuardado(inp) {
    const ok = marcaDeGuardado(inp);
    if (!ok) return;
    ok.classList.remove('visible');
    /* reiniciar la animación aunque se guarde dos veces seguidas */
    void ok.offsetWidth;
    ok.classList.add('visible');
    clearTimeout(ok._t);
    ok._t = setTimeout(function () { ok.classList.remove('visible'); }, 1600);
  }

  /* Guarda sin esperar a que se salga del campo */
  function alEscribir(inp, guardar) {
    inp.addEventListener('input', function () {
      clearTimeout(inp._espera);
      inp._espera = setTimeout(function () {
        guardar();
        avisarGuardado(inp);
      }, 500);
    });
  }

  V.datos.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });

    /* Si se sale de la pantalla con el cursor todavía dentro de un campo, el
       navegador no avisa de nada: lo escrito se quedaba sin guardar. */
    const alSalir = function () {
      const foco = document.activeElement;
      if (foco && root.contains(foco) && (foco.dataset.txt || foco.dataset.num ||
          foco.id === 'p-nombre')) {
        foco.dispatchEvent(new Event('change', { bubbles: true }));
      }
      window.removeEventListener('hashchange', alSalir);
      window.removeEventListener('pagehide', alSalir);
    };
    window.addEventListener('hashchange', alSalir);
    window.addEventListener('pagehide', alSalir);

    /* Personalizar es justo el momento de decidir dónde va a vivir todo esto */
    Modo.pedirCuenta('Vas a guardar tu peso, tus hábitos y tus limitaciones. Es lo que ' +
      'hace que las rutinas y el menú sean tuyos y no de cualquiera.');

    bindAll(root, '[data-set]', function (el) {
      const cambio = {};
      cambio[el.dataset.set] = el.dataset.val;
      Perfil.guardar(cambio);
      render();
    });

    root.querySelectorAll('[data-num]').forEach(function (inp) {
      const guardar = function () {
        const cambio = {};
        cambio[inp.dataset.num] = Number(inp.value) || 0;
        Perfil.guardar(cambio);
      };
      alEscribir(inp, guardar);
      inp.onchange = function () { guardar(); avisarGuardado(inp); render(); };
    });

    root.querySelectorAll('[data-txt]').forEach(function (inp) {
      const esHora = inp.dataset.txt === 'despertar' || inp.dataset.txt === 'acostar';
      const guardar = function () {
        const cambio = {};
        cambio[inp.dataset.txt] = inp.value.trim();
        Perfil.guardar(cambio);
      };
      if (!esHora) alEscribir(inp, guardar);
      inp.onchange = function () {
        guardar();
        avisarGuardado(inp);
        /* Las horas cambian lo que dice la pantalla —cuánto duermes—, así que hay
           que repintar. Los demás campos son texto libre y repintar solo serviría
           para dar un salto mientras se escribe. */
        if (esHora) {
          const pos = window.scrollY;
          render();
          window.scrollTo(0, pos);
        }
      };
    });

    const campoNombre = root.querySelector('#p-nombre');
    if (campoNombre) {
      const guardarNombre = function () {
        Store.setSetting('name', campoNombre.value.trim());
      };
      alEscribir(campoNombre, guardarNombre);
      campoNombre.onchange = function () {
        guardarNombre();
        avisarGuardado(campoNombre);
      };
    }

    bind(root, '[data-a=pesar]', function () {
      const campo = root.querySelector('#peso-hoy');
      const kg = Number(campo.value);
      /* El único botón de la pantalla era este, así que quien cambiaba cualquier
         otra cosa lo pulsaba creyendo que guardaba, y se encontraba con que le
         pedían un peso que no venía a poner. */
      if (!String(campo.value || '').trim()) {
        UI.toast('Lo demás ya está guardado. Esto es solo para apuntar tu peso.');
        campo.focus();
        return;
      }
      if (!kg || kg < 25 || kg > 300) { UI.toast('Escribe un peso válido'); return; }
      Perfil.registrarPeso(kg);
      Objetivos.revisar();
      render();
      UI.toast('Peso registrado');
    });
  };

  /* ================= objetivos ================= */

  V.objetivos = function () {
    const metas = Objetivos.lista();

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <div class="row between">
        <h1 style="margin:0">Objetivos</h1>
        <button class="btn primary sm" data-a="nuevo">${raw(icon('plus'))} Nuevo</button>
      </div>
      <p class="muted" style="margin-top:8px">Se actualizan solos con lo que entrenas
      y con tus pesajes. No hay que apuntar nada a mano.</p>

      ${raw(metas.length ? '<div class="stack">' + metas.map(tarjetaMeta).join('') + '</div>'
        : html`<div class="empty">${raw(icon('trofeo'))}
            <p>Ponte una meta y te enseño cuánto te falta cada vez que abras la app.</p>
            <button class="btn primary" data-a="nuevo">Crear mi primer objetivo</button>
          </div>`)}`;
  };

  function tarjetaMeta(m) {
    const p = Objetivos.progreso(m);
    const pct = Math.round(p.pct * 100);
    const pre = Objetivos.prevision(m);

    return html`
      <div class="card tarjeta-premium ${p.cumplido ? 'meta-ok' : ''}">
        <div class="row between" style="align-items:flex-start">
          <div class="grow">
            <div class="pre-encima">${Objetivos.etiqueta(m)}</div>
            <div class="pre-num" style="margin-top:2px">${Objetivos.formato(m, p.actual)}
              <span class="tiny" style="font-weight:600">de ${Objetivos.formato(m, m.meta)}</span></div>
          </div>
          ${raw(p.cumplido
            ? '<span class="chip solid">' + icon('check') + ' Cumplido</span>'
            : '<span class="chip">' + pct + '%</span>')}
          <button class="btn icon sm danger" data-del="${m.id}"
                  aria-label="Borrar objetivo">${raw(icon('trash'))}</button>
        </div>

        <div class="prog" style="margin-top:10px"><i style="width:${pct}%"></i></div>

        ${raw(previsionHTML(m, pre))}

        ${raw(m.nota ? '<div class="tiny" style="margin-top:8px">' + esc(m.nota) + '</div>' : '')}
      </div>`;
  }

  /* ---------- cuando llegas ----------
     La barra dice donde estas; esto dice cuando llegas, que es lo que se
     pregunta uno al ponerse una meta. El dibujo lleva lo que ya has hecho en
     linea continua y lo que queda en linea de puntos hasta cruzar la meta: asi
     se ve de un vistazo que la parte de la derecha es una estimacion y no un
     dato. Debajo, el ritmo del que sale, para que el numero no venga de la
     nada. */
  function previsionHTML(m, pre) {
    if (!pre || pre.cumplido) return '';

    const llega = pre.clase === 'meta' && pre.haciaMeta && pre.dias > 0;

    return html`
      <div class="meta-prevision">
        ${raw(llega ? html`
          <div class="mp-cab">
            <div>
              <div class="pre-encima">${pre.segunPlan ? 'Según tu plan' : 'Si sigues así'}</div>
              <div class="mp-cuanto">${Objetivos.cuanto(pre.dias)}</div>
            </div>
            <div class="mp-fecha">${UI.fechaCorta(pre.fecha)}</div>
          </div>` : '')}

        ${raw(graficaMeta(m, pre))}

        <p class="tiny mp-nota">${pre.frase}${raw(llega ? '. ' + salvedad(m, pre) : '')}</p>
      </div>`;
  }

  /* Por que el numero puede no cumplirse, dicho para cada meta. Antes salia la
     coletilla del peso —«los ultimos kilos cuestan mas»— tambien en la meta de
     sesiones totales, donde no significa nada. */
  function salvedad(m, pre) {
    /* Cuando el numero sale del plan y no de la bascula hay que decirlo: es una
       intencion, no una medida. */
    if (pre && pre.segunPlan) {
      return 'Sale de tu plan —tu gasto, tus calorías y el ritmo que elegiste—, ' +
        'no de la báscula. Apunta tu peso una vez por semana y paso a medir lo ' +
        'que pasa de verdad.';
    }
    if (m.tipo === 'peso') {
      return 'Es una recta sobre lo que llevas: cuenta con que los últimos kilos ' +
        'cuesten más que los primeros.';
    }
    if (m.tipo === 'marca') {
      return 'Es una recta sobre lo que llevas: la fuerza sube a tirones, no a ' +
        'ritmo constante.';
    }
    return 'Es una recta sobre lo que llevas, contando con que sigas igual.';
  }

  /* El dibujo: linea de lo hecho, punteada de lo que falta y la meta como raya
     horizontal. Sin ejes ni rejilla, que en 60px de alto solo estorban. */
  function graficaMeta(m, pre) {
    let pts = (pre.puntos || []).slice(-24);

    /* Sin historial pero con plan, el dibujo es la linea de lo que deberia
       pasar: de donde estas hoy a la meta. Toda punteada, que aqui no hay ni un
       dato medido. */
    if (pts.length < 2 && pre.segunPlan) {
      const p = Objetivos.progreso(m);
      pts = [{ t: Date.now(), v: p.actual }];
    }
    if (!pts.length) return '';
    if (pts.length < 2 && !pre.segunPlan) return '';

    const W = 280, H = 64, P = 3;
    const meta = Number(m.meta) || 0;

    const tIni = pts[0].t;
    const tFin = pre.fecha && pre.fecha > pts[pts.length - 1].t
      ? pre.fecha : pts[pts.length - 1].t;
    const anchoT = Math.max(1, tFin - tIni);

    const vals = pts.map(function (x) { return x.v; }).concat([meta]);
    const min = Math.min.apply(null, vals);
    const max = Math.max.apply(null, vals);
    const alto = Math.max(1e-6, max - min);

    const x = function (t) { return P + (t - tIni) / anchoT * (W - 2 * P); };
    const y = function (v) { return H - P - (v - min) / alto * (H - 2 * P); };

    const linea = pts.length > 1 ? pts.map(function (q, i) {
      return (i ? 'L' : 'M') + x(q.t).toFixed(1) + ' ' + y(q.v).toFixed(1);
    }).join(' ') : '';

    const ultimo = pts[pts.length - 1];
    const proyeccion = pre.fecha && pre.haciaMeta
      ? '<path class="mg-futuro" d="M' + x(ultimo.t).toFixed(1) + ' ' + y(ultimo.v).toFixed(1) +
        ' L' + x(pre.fecha).toFixed(1) + ' ' + y(meta).toFixed(1) + '"/>'
      : '';

    return '<svg class="meta-graf" viewBox="0 0 ' + W + ' ' + H + '" ' +
      'preserveAspectRatio="none" aria-label="Tu evolución y lo que falta">' +
      '<path class="mg-meta" d="M0 ' + y(meta).toFixed(1) + ' H' + W + '"/>' +
      (linea ? '<path class="mg-linea" d="' + linea + '"/>' : '') +
      proyeccion +
      '<circle class="mg-hoy" cx="' + x(ultimo.t).toFixed(1) + '" cy="' +
      y(ultimo.v).toFixed(1) + '" r="3.2"/>' +
      (pre.fecha && pre.haciaMeta
        ? '<circle class="mg-fin" cx="' + x(pre.fecha).toFixed(1) + '" cy="' +
          y(meta).toFixed(1) + '" r="3.2"/>' : '') +
      '</svg>';
  }

  V.objetivos.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bindAll(root, '[data-a=nuevo]', nuevaMetaSheet);
    bindAll(root, '[data-del]', function (el) {
      UI.confirm('Borrar objetivo', 'Se quitará de tu lista.', 'Borrar', true).then(function (ok) {
        if (ok) { Objetivos.borrar(el.dataset.del); render(); }
      });
    });
  };

  function nuevaMetaSheet() {
    let tipo = '';
    UI.modal(html`
      <h2>Nuevo objetivo</h2>
      <p class="muted">Elige qué quieres conseguir.</p>
      <div class="list" id="tipos">
        ${raw(Object.keys(Objetivos.TIPOS).map(function (k) {
          const t = Objetivos.TIPOS[k];
          return fila({ icono: t.icono, titulo: t.label, sub: t.note, accion: k });
        }).join(''))}
      </div>
      <div id="meta-detalle" style="margin-top:14px"></div>`,
      function (el) {
        el.querySelectorAll('[data-fila]').forEach(function (f) {
          f.onclick = function () {
            tipo = f.dataset.fila;
            el.querySelectorAll('[data-fila]').forEach(function (x) { x.classList.remove('sel'); });
            f.classList.add('sel');
            pintarDetalle(el, tipo);
          };
        });
      });
  }

  function pintarDetalle(el, tipo) {
    const t = Objetivos.TIPOS[tipo];
    const caja = el.querySelector('#meta-detalle');
    const actual = tipo === 'marca' ? 0 : t.actual({});

    caja.innerHTML = html`
      ${raw(tipo === 'marca' ? html`
        <label class="tiny">EJERCICIO</label>
        <select id="meta-ex" style="margin:5px 0 12px">
          ${raw(Data.search({ gear: Store.settings().gear }).slice(0, 200).map(function (ex) {
            return '<option value="' + esc(ex.id) + '">' + esc(ex.nameEs) + '</option>';
          }).join(''))}
        </select>` : '')}
      <label class="tiny">META (${esc(t.unidad)})</label>
      <input type="number" inputmode="decimal" step="0.5" id="meta-val"
             placeholder="${esc(t.unidad)}" style="margin:5px 0 12px">
      <div class="tiny" style="margin-bottom:12px">Ahora mismo vas por
        ${esc(t.formato(actual))}.</div>
      <button class="btn primary block" data-x="crear">Crear objetivo</button>`;

    caja.querySelector('[data-x=crear]').onclick = function () {
      const valor = Number(caja.querySelector('#meta-val').value);
      if (!valor) { UI.toast('Escribe la meta'); return; }
      const m = Objetivos.nuevo(tipo);
      m.meta = valor;
      if (tipo === 'marca') {
        m.exId = caja.querySelector('#meta-ex').value;
        const pr = Store.prOf(m.exId);
        m.desde = pr.best ? pr.best.weight : 0;
      } else {
        m.desde = Objetivos.TIPOS[tipo].actual(m);
      }
      Objetivos.guardar(m);
      UI.closeModal();
      render();
      UI.toast('Objetivo creado');
    };
  }

  /* ================= alertas ================= */

  V.alertas = function () {
    const lista = Alertas.lista();
    const permiso = Alertas.permiso();

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <div class="row between">
        <h1 style="margin:0">Alertas</h1>
        <button class="btn primary sm" data-a="nueva">${raw(icon('plus'))} Nueva</button>
      </div>

      ${raw(permiso === 'granted' ? '' : html`
        <div class="card" style="margin-top:12px;border-color:var(--acc)">
          <div style="font-weight:600;margin-bottom:4px">Permite los avisos</div>
          <p class="muted" style="margin-bottom:10px">Sin permiso solo verás los
          recordatorios dentro de la app.</p>
          <button class="btn primary block" data-a="permiso"
            ${permiso === 'denied' ? 'disabled' : ''}>
            ${permiso === 'denied' ? 'Bloqueados en el navegador' : 'Activar los avisos'}</button>
          ${raw(permiso === 'denied'
            ? '<p class="tiny" style="margin-top:8px">Los has bloqueado. Actívalos en los ' +
              'ajustes del navegador para este sitio.</p>' : '')}
        </div>`)}

      ${raw(lista.length ? '<div class="stack" style="margin-top:12px">' +
        lista.map(tarjetaAlerta).join('') + '</div>'
        : html`<div class="empty" style="padding-top:28px">${raw(icon('campana'))}
            <p>Sin recordatorios todavía. Abajo tienes los que te propongo con tus datos,
            con las horas ya calculadas.</p>
          </div>`)}

      ${raw(sugerenciasHTML())}

      <div class="row" style="margin-top:14px">
        <button class="btn grow" data-a="desdeRutinas">${raw(icon('dumbbell'))} Crear desde mis rutinas</button>
      </div>

      <div class="list-title">Que suenen con la app cerrada</div>
      <div class="card">
        <p class="muted">Una página web no puede avisarte sola si está cerrada, salvo
        pagando un servidor de notificaciones. La vía que sí funciona y no cuesta nada
        es llevarlos al calendario del móvil, que sí avisa siempre.</p>
        <button class="btn block" data-a="calendario" ${lista.length ? '' : 'disabled'}>
          ${raw(icon('down'))} Descargar para el calendario</button>
        <p class="tiny" style="margin-top:8px">Abre el archivo en el móvil y acepta
        añadirlo. Se crean como eventos semanales con aviso.</p>
      </div>`;
  };

  /* ---------- sugerencias calculadas con tus datos ---------- */
  function sugerenciasHTML() {
    if (!Perfil.completo()) {
      return html`
        <div class="card" style="margin-top:14px">
          <div style="font-weight:600;margin-bottom:4px">Puedo proponerte las horas</div>
          <p class="muted" style="margin-bottom:10px">Con tu peso, tu actividad y a qué hora
          te levantas calculo cuántos vasos de agua te tocan y a qué horas, cuándo comer y
          cuándo entrenar. Necesito el perfil completo.</p>
          <button class="btn primary block" data-a="irperfil">Completar mi perfil</button>
        </div>`;
    }

    const sug = Alertas.sugerencias().filter(function (x) { return !Alertas.yaExiste(x); });
    if (!sug.length) {
      return html`
        <div class="card" style="margin-top:14px">
          <p class="muted" style="margin:0">Ya tienes creados todos los recordatorios que te
          propondría con tus datos. Si cambias de peso, de horarios o de rutinas, vuelve por
          aquí y recalculo.</p>
        </div>`;
    }

    return html`
      <div class="list-head" style="margin-top:20px">
        <span class="list-title">Lo que te propongo</span>
        <button class="btn sm ghost" data-a="crearTodas">Crear todas</button>
      </div>
      <p class="tiny" style="margin:-4px 0 10px">Calculado con tus datos, no son horas por
      defecto. Puedes cambiarlas después.</p>
      <div class="stack">
        ${raw(sug.map(function (x, i) {
          const t = Alertas.TIPOS[x.tipo] || Alertas.TIPOS.libre;
          return html`
            <div class="card">
              <div class="row" style="align-items:flex-start">
                <span class="row-icon">${raw(icon(t.icono))}</span>
                <div class="grow">
                  <div style="font-weight:600">${x.titulo}</div>
                  <div class="tiny">${Alertas.resumenHoras({ horas: x.horas })}</div>
                  <div class="tiny">${Alertas.resumenDias({ dias: x.dias })}</div>
                </div>
                <button class="btn sm primary" data-sug="${i}">Crear</button>
              </div>
              <div class="row wrap" style="gap:5px;margin-top:9px">
                ${raw(x.horas.map(function (h) {
                  return '<span class="chip">' + esc(h) + '</span>';
                }).join(''))}
              </div>
              <p class="tiny" style="margin:9px 0 0">${x.porque}</p>
            </div>`;
        }).join(''))}
      </div>`;
  }

  function tarjetaAlerta(a) {
    const t = Alertas.TIPOS[a.tipo] || Alertas.TIPOS.libre;
    return html`
      <div class="card">
        <div class="row" style="align-items:flex-start">
          <span class="row-icon">${raw(icon(t.icono))}</span>
          <div class="grow" data-edit="${a.id}" style="cursor:pointer">
            <div style="font-weight:600">${a.titulo}</div>
            <div class="tiny">${Alertas.resumenHoras(a)}</div>
            <div class="tiny">${Alertas.resumenDias(a)}</div>
          </div>
          <button class="sw ${a.activa ? 'on' : ''}" data-tog="${a.id}"
                  role="switch" aria-checked="${a.activa}" aria-label="Activar"></button>
        </div>
      </div>`;
  }

  V.alertas.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=nueva]', function () { alertaSheet(null); });

    bind(root, '[data-a=permiso]', function () {
      Alertas.pedirPermiso().then(function (r) {
        render();
        if (r === 'granted') {
          Alertas.avisar('Avisos activados', 'Así te avisaré cuando toque entrenar.');
        } else if (r === 'denied') {
          UI.toast('Has bloqueado los avisos');
        }
      });
    });

    bindAll(root, '[data-tog]', function (el) {
      const a = Alertas.lista().find(function (x) { return x.id === el.dataset.tog; });
      if (!a) return;
      a.activa = !a.activa;
      Alertas.guardar(a);
      el.classList.toggle('on', a.activa);
      el.setAttribute('aria-checked', String(a.activa));
    });

    bindAll(root, '[data-edit]', function (el) {
      alertaSheet(Alertas.lista().find(function (x) { return x.id === el.dataset.edit; }));
    });

    bind(root, '[data-a=irperfil]', function () { go('datos'); });

    bindAll(root, '[data-sug]', function (el) {
      const sug = Alertas.sugerencias().filter(function (x) { return !Alertas.yaExiste(x); });
      const s = sug[Number(el.dataset.sug)];
      if (!s) return;
      Alertas.crearDesdeSugerencia(s);
      render();
      UI.toast('«' + s.titulo + '» creado con ' + s.horas.length +
        (s.horas.length === 1 ? ' aviso' : ' avisos'));
    });

    bind(root, '[data-a=crearTodas]', function () {
      const sug = Alertas.sugerencias().filter(function (x) { return !Alertas.yaExiste(x); });
      sug.forEach(Alertas.crearDesdeSugerencia);
      render();
      UI.toast(sug.length + ' recordatorios creados');
    });

    bind(root, '[data-a=desdeRutinas]', function () {
      const a = Alertas.desdeRutinas();
      if (!a) { UI.toast('Antes asigna días a alguna rutina'); return; }
      render();
      UI.toast('Recordatorio creado para tus días de entrenamiento');
    });

    bind(root, '[data-a=calendario]', function () {
      const blob = new Blob([Alertas.ics()], { type: 'text/calendar;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'training-fr-alertas.ics';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      UI.toast('Archivo descargado. Ábrelo para añadirlo al calendario.');
    });
  };

  function alertaSheet(existente) {
    const a = existente ? JSON.parse(JSON.stringify(existente)) : Alertas.nueva('entreno');

    UI.modal(html`
      <h2>${existente ? 'Editar recordatorio' : 'Nuevo recordatorio'}</h2>

      <label class="tiny">TIPO</label>
      <div class="row wrap" style="gap:6px;margin:6px 0 12px">
        ${raw(Object.keys(Alertas.TIPOS).map(function (k) {
          return '<button class="chip ' + (a.tipo === k ? 'on' : '') + '" data-tipo="' + k + '">' +
            esc(Alertas.TIPOS[k].label) + '</button>';
        }).join(''))}
      </div>

      <label class="tiny">TEXTO</label>
      <input id="al-tit" value="${a.titulo}" placeholder="Título" style="margin:5px 0 8px">
      <input id="al-msg" value="${a.mensaje}" placeholder="Mensaje (opcional)" style="margin:0 0 6px">
      <p class="tiny" id="al-nota-ia" style="margin:0 0 12px">El texto lo escribe tu
      entrenador cada día con lo que llevas hecho, así que el de aquí arriba solo sale
      si la IA no está disponible a esa hora.</p>

      <label class="tiny">HORAS</label>
      <div class="row wrap" style="gap:6px;margin:6px 0 8px" id="al-horas"></div>
      <div class="row" style="gap:8px;margin-bottom:8px">
        <input id="al-hora" type="time" value="${a.horas[0]}" class="grow">
        <button class="btn sm" data-x="addhora">${raw(icon('plus'))} Añadir</button>
      </div>
      <button class="guia-tit" data-x="verRepartir">${raw(icon('chevron'))}
        Repartir varias veces al día</button>
      <div class="guia" id="al-repartir" hidden>
        <div class="card">
          <p class="tiny" style="margin:0 0 9px">Para el agua o las comidas: dime cuántas
          veces y entre qué horas, y las coloco repartidas.</p>
          <div class="row" style="gap:8px">
            <div class="grow"><div class="tiny">VECES</div>
              <input id="rep-n" type="number" inputmode="numeric" min="2" max="12" value="8"
                     style="text-align:center;margin-top:4px"></div>
            <div class="grow"><div class="tiny">DESDE</div>
              <input id="rep-a" type="time" value="08:00" style="margin-top:4px"></div>
            <div class="grow"><div class="tiny">HASTA</div>
              <input id="rep-b" type="time" value="21:00" style="margin-top:4px"></div>
          </div>
          <button class="btn block sm" data-x="repartir" style="margin-top:10px">Repartir</button>
        </div>
      </div>

      <label class="tiny">DÍAS</label>
      <div class="row wrap" style="gap:6px;margin:6px 0 16px">
        ${raw([1, 2, 3, 4, 5, 6, 0].map(function (d) {
          return '<button class="chip ' + (a.dias.indexOf(d) !== -1 ? 'on' : '') +
            '" data-dia="' + d + '">' + UI.diaLargo(Alertas.DIAS[d]) + '</button>';
        }).join(''))}
      </div>

      <button class="btn primary block" data-x="guardar">Guardar</button>
      ${raw(existente ? '<button class="btn danger block sm" data-x="borrar" ' +
        'style="margin-top:8px">Borrar recordatorio</button>' : '')}`,
      function (el) {
        el.querySelectorAll('[data-tipo]').forEach(function (b) {
          b.onclick = function () {
            a.tipo = b.dataset.tipo;
            const t = Alertas.TIPOS[a.tipo];
            el.querySelectorAll('[data-tipo]').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            el.querySelector('#al-tit').value = t.titulo;
            el.querySelector('#al-msg').value = t.mensaje;
            notaIA();
          };
        });

        /* La advertencia de que el texto lo pone la IA solo tiene sentido en el
           tipo que lo hace; en los demás estorba. */
        const notaIA = function () {
          const nota = el.querySelector('#al-nota-ia');
          if (nota) nota.hidden = !(Alertas.esDeIA && Alertas.esDeIA(a.tipo));
        };
        notaIA();

        /* las horas se pintan como fichas que se quitan al tocarlas */
        const pintarHoras = function () {
          const caja = el.querySelector('#al-horas');
          a.horas = a.horas.slice().sort();
          caja.innerHTML = a.horas.map(function (h) {
            return '<button class="chip on" data-quitar="' + esc(h) + '">' + esc(h) + ' ×</button>';
          }).join('') || '<span class="tiny">Sin horas: añade al menos una.</span>';
          caja.querySelectorAll('[data-quitar]').forEach(function (b) {
            b.onclick = function () {
              a.horas = a.horas.filter(function (h) { return h !== b.dataset.quitar; });
              pintarHoras();
            };
          });
        };
        pintarHoras();

        el.querySelector('[data-x=addhora]').onclick = function () {
          const v = el.querySelector('#al-hora').value;
          if (!v) return;
          if (a.horas.indexOf(v) === -1) a.horas.push(v);
          pintarHoras();
        };

        el.querySelector('[data-x=verRepartir]').onclick = function () {
          const c = el.querySelector('#al-repartir');
          c.hidden = !c.hidden;
          this.classList.toggle('abierta', !c.hidden);
        };

        el.querySelector('[data-x=repartir]').onclick = function () {
          const n = Number(el.querySelector('#rep-n').value) || 2;
          const desde = el.querySelector('#rep-a').value || '08:00';
          const hasta = el.querySelector('#rep-b').value || '21:00';
          if (Alertas.enMinutos(hasta) <= Alertas.enMinutos(desde)) {
            UI.toast('La hora de fin tiene que ser posterior');
            return;
          }
          a.horas = Alertas.repartir(desde, hasta, Math.max(2, Math.min(12, n)));
          pintarHoras();
          UI.toast(a.horas.length + ' avisos repartidos');
        };

        el.querySelectorAll('[data-dia]').forEach(function (b) {
          b.onclick = function () {
            const d = Number(b.dataset.dia);
            const i = a.dias.indexOf(d);
            if (i === -1) a.dias.push(d); else a.dias.splice(i, 1);
            b.classList.toggle('on', i === -1);
          };
        });

        el.querySelector('[data-x=guardar]').onclick = function () {
          a.titulo = el.querySelector('#al-tit').value.trim() || 'Recordatorio';
          a.mensaje = el.querySelector('#al-msg').value.trim();
          if (!a.horas.length) { UI.toast('Añade al menos una hora'); return; }
          if (!a.dias.length) { UI.toast('Elige al menos un día'); return; }
          Alertas.guardar(a);
          UI.closeModal();
          render();
          UI.toast('Recordatorio guardado');
        };

        const borrar = el.querySelector('[data-x=borrar]');
        if (borrar) borrar.onclick = function () {
          Alertas.borrar(a.id);
          UI.closeModal();
          render();
          UI.toast('Recordatorio borrado');
        };
      });
  }

})(window);
