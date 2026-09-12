/* vistas3.js — la bóveda: un único sitio para las claves de los servicios
   externos, con el paso a paso para conseguir cada una.

   Todas se guardan en el almacenamiento de este navegador. Ninguna viaja al
   repositorio, que es público, ni se envía a nadie salvo al servicio que le
   corresponde. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  /* Bloque plegable con las instrucciones de cada servicio */
  function guia(id, titulo, pasos) {
    return html`
      <button class="guia-tit" data-guia="${id}">
        ${raw(icon('chevron'))} ${titulo}
      </button>
      <div class="guia" data-guia-cuerpo="${id}" hidden>
        <ol class="instr">${raw(pasos)}</ol>
      </div>`;
  }

  function estado(ok, textoOk, textoNo) {
    return ok
      ? '<span class="chip solid">' + icon('check') + ' ' + esc(textoOk) + '</span>'
      : '<span class="chip">' + esc(textoNo) + '</span>';
  }

  /* Campo de clave: siempre oculto de entrada, con un botón para revelarlo.
     Antes se veían enteras en pantalla, que es justo lo que no debe pasar
     cuando alguien mira por encima del hombro. */
  function campoSecreto(id, valor, marcador) {
    return html`
      <div class="secreto">
        <input id="${id}" type="password" autocomplete="off" spellcheck="false"
               value="${valor || ''}" placeholder="${marcador}">
        <button class="btn sm" data-ver="${id}" aria-label="Mostrar u ocultar">
          ${raw(icon('ojo'))}</button>
      </div>`;
  }

  /* Muestra solo el principio y el final: suficiente para reconocerla */
  function resumida(clave) {
    const s = String(clave || '');
    if (s.length < 14) return '••••••••';
    return s.slice(0, 6) + '••••••' + s.slice(-4);
  }

  /* Campo para copiar al portapapeles: la URL de retorno hay que pegarla
     literalmente en el panel de cada servicio */
  function copiable(valor, etiqueta) {
    return html`
      <div class="copiable">
        <code>${valor}</code>
        <button class="btn sm" data-copiar="${valor}"
          aria-label="Copiar ${etiqueta || 'valor'}">${raw(icon('copy'))}</button>
      </div>`;
  }

  /* Cómo se consigue la clave de cada uno. Son cuatro consolas distintas y
     ninguna se parece a otra, así que no vale un texto genérico. */
  const PASOS_CLAVE = {
    groq: [
      '<li>Entra en <a href="https://console.groq.com/keys" target="_blank" ' +
      'rel="noopener noreferrer">console.groq.com/keys</a> y crea una cuenta. ' +
      'No pide tarjeta.</li>',
      '<li>Pulsa <b>Create API Key</b>, ponle un nombre y cópiala ' +
      '(empieza por <code>gsk_</code>). Solo se enseña una vez.</li>',
      '<li>Pégala aquí y <b>Guardar</b>. Después toca <b>Ver los suyos</b> para que la ' +
      'lista de modelos se llene con los que tengas de verdad.</li>',
      '<li>Mil peticiones al día gratis. Para lo que hace esta app, no las gastas.</li>'
    ].join(''),
    openrouter: [
      '<li>Entra en <a href="https://openrouter.ai/keys" target="_blank" ' +
      'rel="noopener noreferrer">openrouter.ai/keys</a> y crea una cuenta.</li>',
      '<li>Pulsa <b>Create Key</b> y cópiala (empieza por <code>sk-or-v1-</code>).</li>',
      '<li>Pégala aquí y <b>Guardar</b>. En la lista de modelos salen primero los que ' +
      'acaban en <b>:free</b>: esos no cuestan nada y no hace falta meter saldo.</li>',
      '<li>Si algún día quieres uno de pago —Claude, Gemini, GPT— metes saldo y lo ' +
      'eliges de la misma lista, con la misma clave.</li>'
    ].join(''),
    mistral: [
      '<li>Entra en <a href="https://console.mistral.ai/api-keys" target="_blank" ' +
      'rel="noopener noreferrer">console.mistral.ai</a> y crea una cuenta.</li>',
      '<li>Crea una clave en <b>API Keys</b> y cópiala.</li>',
      '<li>Pégala aquí y <b>Guardar</b>, y toca <b>Ver los suyos</b> para la lista de ' +
      'modelos.</li>',
      '<li>Tiene capa gratuita; si la agotas, te lo dirá al llamar.</li>'
    ].join(''),
    gemini: [
      '<li>Entra en <a href="https://aistudio.google.com/apikey" target="_blank" ' +
      'rel="noopener noreferrer">aistudio.google.com/apikey</a> con tu cuenta de Google.</li>',
      '<li>Pulsa <b>Create API key</b>. Si pide proyecto, deja el que propone.</li>',
      '<li>Copia la clave (empieza por <code>AIza</code>), pégala aquí y <b>Guardar</b>.</li>',
      '<li>Es gratis dentro del límite diario, que sobra para uso personal. Al superarlo ' +
      'la app avisa y el resto sigue funcionando.</li>'
    ].join(''),
    anthropic: [
      '<li>Entra en <a href="https://console.anthropic.com/settings/keys" target="_blank" ' +
      'rel="noopener noreferrer">console.anthropic.com</a> y crea una cuenta.</li>',
      '<li>Mete saldo en <b>Billing</b>: se paga por uso y no hay capa gratuita. ' +
      'Si tienes Claude Pro, <b>no vale aquí</b>: la suscripción y la API se facturan ' +
      'por separado.</li>',
      '<li>En <b>API Keys</b> pulsa <b>Create Key</b> y copia la clave ' +
      '(empieza por <code>sk-ant-</code>). Solo se enseña una vez.</li>',
      '<li>Pégala aquí y <b>Guardar</b>. Con lo que hace esta app, unos pocos euros ' +
      'duran meses.</li>'
    ].join(''),
    deepseek: [
      '<li>Entra en <a href="https://platform.deepseek.com/api_keys" target="_blank" ' +
      'rel="noopener noreferrer">platform.deepseek.com</a> y crea una cuenta.</li>',
      '<li>Mete saldo: se paga por uso y es de lo más barato que hay.</li>',
      '<li>En <b>API keys</b> crea una y cópiala (empieza por <code>sk-</code>).</li>',
      '<li>Pégala aquí y <b>Guardar</b>. Ojo: no lee fotos, así que deja Gemini o ' +
      'Anthropic puestos si usas el cálculo de comida por foto.</li>'
    ].join(''),
    grok: [
      '<li>Entra en <a href="https://console.x.ai" target="_blank" ' +
      'rel="noopener noreferrer">console.x.ai</a> y crea una cuenta.</li>',
      '<li>Mete saldo en <b>Billing</b> y crea una clave en <b>API Keys</b> ' +
      '(empieza por <code>xai-</code>).</li>',
      '<li>Pégala aquí y <b>Guardar</b>.</li>',
      '<li>Los nombres de sus modelos cambian a menudo. Si da error de modelo, mira ' +
      'cuál tienes disponible en tu consola y escríbelo en el campo de abajo.</li>'
    ].join('')
  };

  V.claves = function () {
    const cfgIA = IA.config();
    const provId = IA.proveedor();
    const prov = IA.proveedorActual();
    const claveProv = IA.claveDe(provId);
    const puestos = IA.configurados();
    const cfgSp = Spotify.config();
    const cfgSync = Sync.config() || {};
    const retorno = location.origin + location.pathname;

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Ajustes</button>
      <h1>Bóveda de claves</h1>
      <p class="muted">Aquí se guardan las claves de los servicios que usa la app.
      Se quedan en este dispositivo: no viajan al repositorio ni las ve nadie más.</p>

      <!-- ============ nucleo inteligente ============ -->
      <div class="list-title">Núcleo inteligente</div>
      <div class="card">
        <div class="row between" style="margin-bottom:11px">
          <div class="grow">
            <div style="font-weight:600">Quién piensa por la app</div>
            <div class="tiny">Auditoría de rutinas, plan de comidas, foto del plato,
            entrenador y listas de música</div>
          </div>
          ${raw(estado(IA.activa(), 'Activo', 'Sin configurar'))}
        </div>

        <p class="tiny" style="margin:0 0 9px">Elige quién contesta. Cada uno guarda su
        propia clave, así que puedes tener varios puestos y cambiar de uno a otro con un
        toque; lo que cambies aquí vale para toda la app.</p>

        <div class="row wrap" style="gap:6px;margin-bottom:12px" id="ia-provs">
          ${raw(IA.PROVEEDORES.map(function (pv) {
            const tiene = puestos.indexOf(pv.id) !== -1;
            return '<button class="chip ' + (pv.id === provId ? 'on' : '') +
              '" data-prov="' + pv.id + '">' + esc(pv.label) +
              (pv.gratis ? ' <span class="tiny" style="opacity:.7">gratis</span>' : '') +
              (tiene ? ' <span class="punto-ok"></span>' : '') + '</button>';
          }).join(''))}
        </div>

        <div class="card" style="background:var(--bg);margin-bottom:12px">
          <div class="tiny">${prov.nota}</div>
          <div class="tiny" style="margin-top:5px">La clave se saca en
            <a href="${prov.donde}" target="_blank" rel="noopener noreferrer">${prov.dondeTxt}</a>.
            ${raw(prov.imagen ? '' : '<b>No lee fotos</b>, así que el cálculo de la comida ' +
              'por foto necesita Gemini o Anthropic.')}</div>
        </div>

        <label class="tiny">CLAVE DE ${esc(prov.label.toUpperCase())}</label>
        ${raw(campoSecreto('k-ia', claveProv, prov.pista))}
        ${raw(claveProv ? '<div class="tiny" style="margin:6px 0 10px">Guardada: <code>' +
          esc(resumida(claveProv)) + '</code></div>' : '<div style="height:10px"></div>')}

        <div class="row between" style="margin-bottom:5px">
          <span class="tiny">MODELO</span>
          ${raw(claveProv || prov.listaPublica
            ? '<button class="btn sm ghost" data-a="refrescarModelos">Ver los suyos</button>' : '')}
        </div>
        <select id="k-ia-modelo" style="margin:0 0 8px">
          ${raw((function () {
            const actual = IA.modeloDe(prov.id);
            const lista = prov.modelos.indexOf(actual) === -1
              ? [actual].concat(prov.modelos) : prov.modelos;
            return lista.map(function (m) {
              return '<option value="' + esc(m) + '"' + (actual === m ? ' selected' : '') +
                '>' + esc(m) + '</option>';
            }).join('');
          })())}
        </select>
        <input id="k-ia-modelo-libre" placeholder="o escribe otro nombre de modelo"
               autocomplete="off" spellcheck="false" style="margin:0 0 12px">

        <div class="row">
          <button class="btn primary grow" data-a="guardarIA">Guardar</button>
          <button class="btn" data-a="probarIA" ${claveProv ? '' : 'disabled'}>Probar</button>
        </div>
        <div class="tiny" id="ia-estado" style="margin-top:9px"></div>

        ${raw(guia('ia', 'Cómo consigo la clave de ' + prov.label, PASOS_CLAVE[prov.id]))}

        ${raw(claveProv ? '<button class="btn danger block sm" data-a="borrarIA" ' +
          'style="margin-top:10px">Borrar la clave de ' + esc(prov.label) + '</button>' : '')}
      </div>

      <!-- ============ Spotify ============ -->
      <div class="list-title">Música · Spotify</div>
      <div class="card">
        <div class="row between" style="margin-bottom:11px">
          <div class="grow">
            <div style="font-weight:600">Client ID de Spotify</div>
            <div class="tiny">Controlar la música desde la pantalla de entrenamiento</div>
          </div>
          ${raw(Spotify.permisosCaducados()
            ? '<span class="chip" style="border-color:var(--warn);color:var(--warn)">Reconectar</span>'
            : estado(Spotify.activa(), 'Conectado',
                Spotify.configurado() ? 'Sin conectar' : 'Sin configurar'))}
        </div>
        ${raw(Spotify.permisosCaducados()
          ? '<p class="tiny" style="margin:0 0 11px;color:var(--warn)">La app ya puede ' +
            'reproducir por sí misma y crear listas. Pulsa Conectar para dar los permisos nuevos.</p>'
          : '')}

        <label class="tiny">CLIENT ID</label>
        ${raw(campoSecreto('k-sp', cfgSp.clientId, '32 caracteres'))}
        ${raw(cfgSp.clientId ? '<div class="tiny" style="margin:6px 0 12px">Guardado: <code>' +
          esc(resumida(cfgSp.clientId)) + '</code></div>' : '<div style="height:12px"></div>')}

        <div class="row">
          <button class="btn primary grow" data-a="guardarSp">Guardar</button>
          ${raw(Spotify.configurado()
            ? (Spotify.activa()
              ? '<button class="btn" data-a="salirSp">Desconectar</button>'
              : '<button class="btn" data-a="conectarSp">Conectar</button>')
            : '')}
        </div>

        <div style="margin-top:12px">
          <div class="tiny" style="margin-bottom:5px">DIRECCIÓN DE RETORNO (cópiala en el panel)</div>
          ${raw(copiable(retorno, 'dirección de retorno'))}
        </div>

        ${raw(guia('sp', 'Cómo consigo el Client ID', [
          '<li>Entra en <a href="https://developer.spotify.com/dashboard" target="_blank" ' +
          'rel="noopener noreferrer">developer.spotify.com/dashboard</a> con tu cuenta de ' +
          'Spotify y acepta las condiciones de desarrollador.</li>',
          '<li>Pulsa <b>Create app</b>. En nombre y descripción pon lo que quieras, ' +
          'por ejemplo <i>Training FR</i>.</li>',
          '<li>En <b>Redirect URIs</b> pega la dirección de retorno de arriba, tal cual, ' +
          'y pulsa <b>Add</b>. Tiene que coincidir carácter por carácter.</li>',
          '<li>Marca la casilla <b>Web API</b> y guarda.</li>',
          '<li>Abre la app recién creada, ve a <b>Settings</b> y copia el <b>Client ID</b>. ' +
          'El <i>Client Secret</i> no hace falta: esta app usa PKCE, que no necesita secretos.</li>',
          '<li>Pégalo aquí, pulsa <b>Guardar</b> y luego <b>Conectar</b> para autorizar tu cuenta.</li>',
          '<li>Al publicar la app en internet, vuelve al panel y añade también la ' +
          'dirección definitiva en <b>Redirect URIs</b>.</li>'
        ].join('')))}

        ${raw(Spotify.configurado() ? '<button class="btn danger block sm" data-a="borrarSp" ' +
          'style="margin-top:10px">Borrar la configuración de Spotify</button>' : '')}
      </div>

      <!-- ============ Supabase ============ -->
      <div class="list-title">Cuenta y sincronización · Supabase</div>
      <div class="card">
        <div class="row between" style="margin-bottom:11px">
          <div class="grow">
            <div style="font-weight:600">Proyecto de Supabase</div>
            <div class="tiny">Entrar con tu correo y sincronizar entre dispositivos</div>
          </div>
          ${raw(estado(Sync.activa(), 'Conectado',
            Sync.configurado() ? 'Sin sesión' : 'Sin configurar'))}
        </div>

        <label class="tiny">PROJECT URL</label>
        <input id="k-sb-url" autocomplete="off" spellcheck="false"
               value="${cfgSync.url || ''}" placeholder="https://xxxxxxxx.supabase.co"
               style="margin:5px 0 10px">
        <label class="tiny">CLAVE PUBLISHABLE (O ANON)</label>
        ${raw(campoSecreto('k-sb-key', cfgSync.key, 'sb_publishable_... o eyJhbGciOi...'))}
        ${raw(cfgSync.key ? '<div class="tiny" style="margin:6px 0 12px">Guardada: <code>' +
          esc(resumida(cfgSync.key)) + '</code></div>' : '<div style="height:12px"></div>')}
        <button class="btn primary block" data-a="guardarSb">Guardar</button>

        <div style="margin-top:12px">
          <div class="tiny" style="margin-bottom:5px">DIRECCIÓN DE RETORNO</div>
          ${raw(copiable(retorno, 'dirección de retorno'))}
        </div>

        <button class="btn block sm" data-a="verpasoapaso" style="margin-top:12px">
          ${raw(icon('chevron'))} Montarla paso a paso, con capturas de cada menú</button>
        <p class="tiny" style="margin:7px 0 0">Si es tu primera vez, ve por ahí: son ocho
        pasos y dice exactamente qué botón tocar. Esta pantalla es el atajo para quien ya
        tiene el proyecto montado y solo viene a pegar los dos datos.</p>

        ${raw(guia('sb', 'El resumen, si ya te lo sabes', [
          '<li><b>Project Settings &rarr; Data API</b>: copia la <b>Project URL</b>.</li>',
          '<li><b>Project Settings &rarr; API Keys</b>: copia la <b>Publishable key</b> ' +
          '(empieza por <code>sb_publishable_</code>). En proyectos antiguos es la ' +
          '<b>anon public</b> de la pestaña <i>Legacy</i>. Las <b>Secret</b> no, nunca.</li>',
          '<li><b>SQL Editor</b>: pega el bloque de abajo y <b>Run</b>. Sin este paso la ' +
          'app se conecta pero no tiene dónde escribir, y es el que más se salta la gente.</li>',
          '<li><b>Authentication &rarr; Sign In / Providers</b>: apaga <b>Confirm email</b>. ' +
          'Viene encendido de fábrica y el correo de Supabase manda dos mensajes por hora.</li>',
          '<li><b>Authentication &rarr; URL Configuration</b>: la dirección de retorno de ' +
          'aquí arriba, en <b>Site URL</b> y en <b>Redirect URLs</b>.</li>',
          '<li>Pega los dos valores aquí y guarda. Luego crea tu cuenta en ' +
          '<b>Perfil &rarr; Mi cuenta</b>.</li>'
        ].join('')) + html`
          <div class="row between" style="margin:12px 0 6px">
            <span class="tiny">SQL PARA CREAR LA TABLA</span>
            <button class="btn sm" data-a="copiarsql">${raw(icon('copy'))} Copiar</button>
          </div>
          <pre id="sql-box">${Sync.SQL}</pre>`)}

        ${raw(Sync.configurado() ? '<button class="btn danger block sm" data-a="borrarSb" ' +
          'style="margin-top:10px">Borrar la configuración de Supabase</button>' : '')}
      </div>

      <!-- ============ varios dispositivos ============ -->
      <div class="list-title">Varios dispositivos</div>
      <div class="card">
        <div class="row between">
          <div class="grow">
            <div style="font-weight:600">Sincronizar mis claves</div>
            <div class="tiny">Las claves de IA y el Client ID de Spotify viajan con tus
              datos, para no repetirlos en cada dispositivo</div>
          </div>
          <button class="sw ${Store.settings().sincronizarClaves !== false ? 'on' : ''}"
                  data-a="togglesync" role="switch"
                  aria-checked="${Store.settings().sincronizarClaves !== false}"
                  aria-label="Sincronizar claves"></button>
        </div>
        <p class="tiny" style="margin:10px 0 0">Las sesiones abiertas nunca se sincronizan:
        cada dispositivo abre la suya, que es lo correcto. En uno nuevo solo tendrás que
        pulsar Conectar en Spotify.</p>
      </div>

      ${raw(Sync.configurado() ? html`
        <div class="card">
          <div style="font-weight:600;margin-bottom:4px">Enlazar un dispositivo nuevo</div>
          <p class="muted" style="margin:0 0 10px">La configuración de Supabase no puede
          venir de la nube, porque es justo la que abre la puerta. Abre este enlace en el
          otro dispositivo y quedará listo para entrar con tu correo.</p>
          <div class="row">
            <button class="btn primary grow" data-a="compartirEnlace">
              ${raw(icon('share'))} Compartir enlace</button>
            <button class="btn" data-a="copiarEnlace" aria-label="Copiar enlace">
              ${raw(icon('copy'))}</button>
          </div>
          <p class="tiny" style="margin:10px 0 0">El enlace lleva la URL del proyecto y la
          clave anon, que son públicas por diseño: sin entrar con tu correo no dan acceso a
          ningún dato.</p>
        </div>` : '')}

      <!-- ============ seguridad ============ -->
      <div class="list-title">Seguridad</div>
      <div class="card">
        <p class="muted" style="margin:0 0 10px">Las claves viven en el almacenamiento de
        este navegador y, si la sincronización de claves está activada, también en tu base
        de datos de Supabase, donde solo tú puedes leerlas.</p>
        <p class="tiny" style="margin:0 0 12px">La clave <i>publishable</i> de Supabase y el
        <i>Client ID</i> de Spotify están pensados para ir en el navegador y no son
        secretos. Las de IA sí lo son: no las compartas ni las pegues en el código.</p>
        <button class="btn danger block" data-a="borrarTodo">Borrar todas las claves</button>
      </div>`;
  };

  V.claves.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('ajustes'); });

    /* guías plegables */
    bindAll(root, '[data-guia]', function (el) {
      const c = root.querySelector('[data-guia-cuerpo="' + el.dataset.guia + '"]');
      if (!c) return;
      c.hidden = !c.hidden;
      el.classList.toggle('abierta', !c.hidden);
    });

    bindAll(root, '[data-ver]', function (el) {
      const campo = root.querySelector('#' + el.dataset.ver);
      if (!campo) return;
      const oculto = campo.type === 'password';
      campo.type = oculto ? 'text' : 'password';
      el.classList.toggle('on', oculto);
    });

    bindAll(root, '[data-copiar]', function (el) {
      const v = el.dataset.copiar;
      if (navigator.clipboard) navigator.clipboard.writeText(v);
      UI.toast('Copiado');
    });

    bind(root, '[data-a=verpasoapaso]', function () { go('basedatos'); });

    const sql = root.querySelector('[data-a=copiarsql]');
    if (sql) sql.onclick = function () {
      const t = root.querySelector('#sql-box').textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t);
      UI.toast('SQL copiado');
    };

    /* ---- núcleo inteligente ---- */

    /* Cambiar de proveedor no guarda nada todavía: solo cambia qué se está
       mirando. Lo que ya tenga clave puesta se queda como estaba. */
    bindAll(root, '[data-prov]', function (el) {
      IA.elegirProveedor(el.dataset.prov);
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    });

    /* Solo Gemini publica su catálogo con la clave del usuario; los demás llevan
       una lista escrita a mano y un campo para escribir cualquier otra. */
    const selectorModelo = root.querySelector('#k-ia-modelo');
    const rellenarModelos = function (forzar) {
      const prov = IA.proveedorActual();
      if (!selectorModelo || !(IA.claveDe(prov.id) || prov.listaPublica)) return;
      IA.listarModelos(forzar).then(function (lista) {
        if (!lista || !lista.length) return;
        const actual = selectorModelo.value;
        selectorModelo.innerHTML = lista.map(function (m) {
          return '<option value="' + esc(m) + '"' + (m === actual ? ' selected' : '') +
            '>' + esc(m) + '</option>';
        }).join('');
        if (lista.indexOf(actual) === -1) {
          selectorModelo.value = lista[0];
          IA.guardarProveedor(prov.id, IA.claveDe(prov.id), lista[0]);
        }
      }).catch(function () { /* se queda la lista por defecto */ });
    };
    rellenarModelos(false);

    bind(root, '[data-a=refrescarModelos]', function (btn) {
      btn.disabled = true;
      btn.textContent = 'Consultando…';
      IA.listarModelos(true).then(function (lista) {
        rellenarModelos(false);
        btn.disabled = false;
        btn.textContent = 'Actualizar lista';
        UI.toast(lista.length + ' modelos disponibles con tu clave');
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = 'Actualizar lista';
        UI.toast('No se pudo consultar la lista');
      });
    });

    bind(root, '[data-a=guardarIA]', function () {
      const prov = IA.proveedorActual();
      const campo = root.querySelector('#k-ia');
      const libre = root.querySelector('#k-ia-modelo-libre');
      const modelo = (libre && libre.value.trim()) ||
        root.querySelector('#k-ia-modelo').value;
      const clave = campo.value.trim() || IA.claveDe(prov.id) || '';

      if (!clave) { UI.toast('Pega la clave de ' + prov.label); return; }
      try {
        IA.guardarProveedor(prov.id, clave, modelo);
        {
          IA.listarModelos(true).then(function (lista) {
            if (lista && lista.length && lista.indexOf(IA.modeloDe(prov.id)) === -1) {
              IA.guardarProveedor(prov.id, clave, lista[0]);
              UI.toast('Clave guardada. Modelo ajustado a ' + lista[0]);
              render();
            }
          }).catch(function () { /* nada */ });
        }
        render();
        UI.toast(prov.label + ' guardado. Ahora piensa por toda la app.');
      } catch (e) { UI.toast(e.message); }
    });

    /* El test comprueba las dos cosas de las que depende la app, no una.
       Contestar en texto lo hace cualquiera; devolver JSON bien formado no, y
       de eso viven la auditoría de rutinas, el menú semanal y la foto del
       plato. Un modelo pequeño pasa la primera y falla la segunda, y sin este
       aviso te enterabas a mitad de una auditoría. */
    bind(root, '[data-a=probarIA]', function (btn) {
      const salida = root.querySelector('#ia-estado');
      const prov = IA.proveedorActual();
      const linea = function (color, txt) {
        return '<div style="color:var(--' + color + ')">' + txt + '</div>';
      };

      btn.disabled = true;
      salida.innerHTML = '<div class="row" style="gap:8px;align-items:center">' +
        '<span class="spinner" style="width:14px;height:14px"></span>' +
        '<span>Probando ' + esc(prov.label) + '…</span></div>';

      const resultados = [];
      IA.llamar('Responde solo con la palabra: listo', { maxTokens: 512, temperatura: 0 })
        .then(function (r) {
          resultados.push(linea('acc', '✓ Responde: «' + esc(r.slice(0, 40)) + '»'));
          salida.innerHTML = resultados.join('') +
            '<div class="tiny">Comprobando que sepa devolver JSON…</div>';

          return IA.llamarJSON('Devuelve JSON y nada más, con esta forma exacta: ' +
            '{"ok":true,"musculo":"pecho"}', { maxTokens: 512, temperatura: 0 });
        })
        .then(function (j) {
          if (j && typeof j === 'object') {
            resultados.push(linea('acc', '✓ Devuelve JSON bien formado'));
            resultados.push('<div class="tiny" style="margin-top:4px">Listo. ' +
              esc(prov.label) + ' con <b>' + esc(IA.modeloDe(prov.id)) + '</b> vale para ' +
              'todo lo de la app.</div>');
          } else {
            resultados.push(linea('warn', '⚠ Contesta, pero su JSON no se entiende'));
          }
          salida.innerHTML = resultados.join('');
          btn.disabled = false;
        })
        .catch(function (e) {
          /* si falló la primera llamada no hay nada verde que enseñar */
          if (!resultados.length) {
            salida.innerHTML = linea('bad', '✕ ' + esc(e.message));
          } else {
            resultados.push(linea('warn', '⚠ Contesta en texto, pero falla al pedirle ' +
              'JSON: ' + esc(e.message)));
            resultados.push('<div class="tiny" style="margin-top:4px">Sirve para preguntarle ' +
              'cosas, pero la auditoría de rutinas, el menú y la foto del plato van a ' +
              'fallar. Prueba con otro modelo de la lista.</div>');
            salida.innerHTML = resultados.join('');
          }
          btn.disabled = false;
        });
    });

    bind(root, '[data-a=borrarIA]', function () {
      const prov = IA.proveedorActual();
      UI.confirm('Borrar la clave de ' + prov.label,
        'Se olvida solo esa. Si tienes otro proveedor puesto, la app pasa a usarlo.',
        'Borrar', true).then(function (ok) {
        if (ok) { IA.borrarConfig(); render(); UI.toast('Clave borrada'); }
      });
    });

    /* ---- Spotify ---- */
    bind(root, '[data-a=guardarSp]', function () {
      try {
        Spotify.guardarConfig(root.querySelector('#k-sp').value, Spotify.config().playlist || '');
        render();
        UI.toast('Client ID guardado. Ahora pulsa Conectar.');
      } catch (e) { UI.toast(e.message); }
    });

    bind(root, '[data-a=conectarSp]', function () {
      Spotify.entrar().catch(function (e) { UI.toast(e.message); });
    });

    bind(root, '[data-a=salirSp]', function () {
      Spotify.salir(); render(); UI.toast('Spotify desconectado');
    });

    bind(root, '[data-a=borrarSp]', function () {
      UI.confirm('Borrar Spotify', 'Se olvidará el Client ID y la sesión.', 'Borrar', true)
        .then(function (ok) {
          if (ok) { Spotify.borrarConfig(); render(); UI.toast('Configuración borrada'); }
        });
    });

    /* ---- Supabase ---- */
    bind(root, '[data-a=guardarSb]', function () {
      try {
        Sync.guardarConfig(root.querySelector('#k-sb-url').value,
          root.querySelector('#k-sb-key').value);
        render();
        UI.toast('Guardado. Entra con tu correo desde Ajustes.');
      } catch (e) { UI.toast(e.message); }
    });

    bind(root, '[data-a=borrarSb]', function () {
      UI.confirm('Borrar Supabase', 'Se cerrará la sesión en este dispositivo. ' +
        'Tus datos locales y los de la nube no se tocan.', 'Borrar', true).then(function (ok) {
        if (ok) { Sync.borrarConfig(); render(); UI.toast('Configuración borrada'); }
      });
    });

    /* ---- varios dispositivos ---- */
    bind(root, '[data-a=togglesync]', function (el) {
      const nuevo = Store.settings().sincronizarClaves === false;
      Store.setSetting('sincronizarClaves', nuevo);
      el.classList.toggle('on', nuevo);
      el.setAttribute('aria-checked', String(nuevo));
      UI.toast(nuevo
        ? 'Tus claves se sincronizarán con los demás dispositivos'
        : 'Las claves se quedarán solo en este dispositivo');
      if (nuevo && Sync.activa()) Sync.subir().catch(function () { /* ya se reintentará */ });
    });

    const conEnlace = function (fn) {
      return function () {
        try { fn(Sync.enlaceConfiguracion()); }
        catch (e) { UI.toast(e.message); }
      };
    };

    bind(root, '[data-a=copiarEnlace]', conEnlace(function (url) {
      if (navigator.clipboard) navigator.clipboard.writeText(url);
      UI.toast('Enlace copiado. Ábrelo en el otro dispositivo.');
    }));

    bind(root, '[data-a=compartirEnlace]', conEnlace(function (url) {
      if (navigator.share) {
        navigator.share({ title: 'Configurar Training FR', url: url })
          .catch(function () { /* el usuario canceló */ });
      } else {
        if (navigator.clipboard) navigator.clipboard.writeText(url);
        UI.toast('Enlace copiado: pégalo en el otro dispositivo.');
      }
    }));

    /* ---- todo ---- */
    bind(root, '[data-a=borrarTodo]', function () {
      UI.confirm('Borrar todas las claves',
        'Se olvidarán todos los proveedores de IA, Spotify y Supabase en este ' +
        'dispositivo. Tus rutinas y tu ' +
        'historial no se tocan.', 'Borrar todas', true).then(function (ok) {
        if (!ok) return;
        IA.borrarTodo();
        Spotify.borrarConfig();
        Sync.borrarConfig();
        render();
        UI.toast('Claves borradas');
      });
    });
  };
})(window);
