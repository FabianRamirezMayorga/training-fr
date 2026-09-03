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

  V.claves = function () {
    const cfgIA = IA.config();
    const cfgSp = Spotify.config();
    const cfgSync = Sync.config() || {};
    const retorno = location.origin + location.pathname;

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Ajustes</button>
      <h1>Bóveda de claves</h1>
      <p class="muted">Aquí se guardan las claves de los servicios que usa la app.
      Se quedan en este dispositivo: no viajan al repositorio ni las ve nadie más.</p>

      <!-- ============ Gemini ============ -->
      <div class="list-title">Entrenador con IA · Google Gemini</div>
      <div class="card">
        <div class="row between" style="margin-bottom:11px">
          <div class="grow">
            <div style="font-weight:600">Clave de Gemini</div>
            <div class="tiny">Análisis de progreso, revisión de rutinas y plan de comidas</div>
          </div>
          ${raw(estado(IA.activa(), 'Activa', 'Sin configurar'))}
        </div>

        <label class="tiny">CLAVE DE API</label>
        ${raw(campoSecreto('k-ia', cfgIA.clave, 'AIzaSy...'))}
        ${raw(cfgIA.clave ? '<div class="tiny" style="margin:6px 0 10px">Guardada: <code>' +
          esc(resumida(cfgIA.clave)) + '</code></div>' : '<div style="height:10px"></div>')}

        <div class="row between" style="margin-bottom:5px">
          <span class="tiny">MODELO</span>
          ${raw(IA.activa()
            ? '<button class="btn sm ghost" data-a="refrescarModelos">Actualizar lista</button>' : '')}
        </div>
        <select id="k-ia-modelo" style="margin:0 0 12px">
          ${raw((function () {
            const actual = cfgIA.modelo || IA.MODELOS[0];
            const lista = IA.MODELOS.indexOf(actual) === -1
              ? [actual].concat(IA.MODELOS) : IA.MODELOS;
            return lista.map(function (m) {
              return '<option value="' + esc(m) + '"' + (actual === m ? ' selected' : '') +
                '>' + esc(m) + '</option>';
            }).join('');
          })())}
        </select>

        <div class="row">
          <button class="btn primary grow" data-a="guardarIA">Guardar</button>
          <button class="btn" data-a="probarIA" ${IA.activa() ? '' : 'disabled'}>Probar</button>
        </div>
        <div class="tiny" id="ia-estado" style="margin-top:9px"></div>

        ${raw(guia('ia', 'Cómo consigo esta clave', [
          '<li>Entra en <a href="https://aistudio.google.com/apikey" target="_blank" ' +
          'rel="noopener noreferrer">aistudio.google.com/apikey</a> e inicia sesión con tu ' +
          'cuenta de Google.</li>',
          '<li>Pulsa <b>Create API key</b>. Si te pide un proyecto, deja el que te propone ' +
          'o crea uno nuevo con cualquier nombre.</li>',
          '<li>Copia la clave que aparece (empieza por <code>AIza</code>).</li>',
          '<li>Pégala aquí arriba y pulsa <b>Guardar</b>. Después <b>Probar</b> para ' +
          'confirmar que responde.</li>',
          '<li>Es gratis dentro del límite diario de la capa gratuita, que sobra para uso ' +
          'personal. Al superarlo la app te avisa y el resto sigue funcionando.</li>'
        ].join('')))}

        ${raw(IA.activa() ? '<button class="btn danger block sm" data-a="borrarIA" ' +
          'style="margin-top:10px">Borrar la clave de Gemini</button>' : '')}
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

        ${raw(guia('sb', 'Cómo configuro Supabase', [
          '<li>Entra en <a href="https://supabase.com" target="_blank" ' +
          'rel="noopener noreferrer">supabase.com</a>, crea una cuenta y pulsa ' +
          '<b>New project</b>. Elige nombre, contraseña y la región más cercana.</li>',
          '<li>Copia la <b>Project URL</b> en <b>Project Settings &rarr; Data API</b>.</li>',
          '<li>En <b>Project Settings &rarr; API Keys</b> copia la <b>Publishable key</b> ' +
          '(empieza por <code>sb_publishable_</code>). Si tu proyecto es antiguo, sirve ' +
          'igual la <b>anon public</b> de la pestaña <i>Legacy</i>.</li>',
          '<li>Ve a <b>SQL Editor</b>, pega el bloque de abajo y pulsa <b>Run</b>. Crea la ' +
          'tabla de tus datos con la seguridad que impide que nadie más los vea.</li>',
          '<li>Ve a <b>Authentication &rarr; URL Configuration</b> y pon la dirección de ' +
          'retorno en <b>Site URL</b> y en <b>Redirect URLs</b>.</li>',
          '<li>Vuelve aquí, pega los dos valores y guarda. Después entra con tu correo ' +
          'desde Ajustes.</li>'
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
            <div class="tiny">La clave de Gemini y el Client ID de Spotify viajan con tus
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
        secretos. La de Gemini sí lo es: no la compartas ni la pegues en el código.</p>
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

    const sql = root.querySelector('[data-a=copiarsql]');
    if (sql) sql.onclick = function () {
      const t = root.querySelector('#sql-box').textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t);
      UI.toast('SQL copiado');
    };

    /* ---- Gemini ---- */

    /* Al abrir la bóveda se consulta qué modelos admite la clave: Google retira
       los antiguos y una lista escrita a mano deja de valer al poco tiempo. */
    const selectorModelo = root.querySelector('#k-ia-modelo');
    const rellenarModelos = function (forzar) {
      if (!selectorModelo || !IA.activa()) return;
      IA.listarModelos(forzar).then(function (lista) {
        if (!lista || !lista.length) return;
        const actual = selectorModelo.value;
        selectorModelo.innerHTML = lista.map(function (m) {
          return '<option value="' + esc(m) + '"' + (m === actual ? ' selected' : '') +
            '>' + esc(m) + '</option>';
        }).join('');
        /* si el guardado ya no existe, se pasa al primero disponible */
        if (lista.indexOf(actual) === -1) {
          selectorModelo.value = lista[0];
          IA.guardarConfig(IA.config().clave, lista[0]);
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
      const campo = root.querySelector('#k-ia');
      const modelo = root.querySelector('#k-ia-modelo').value;
      const clave = campo.value.trim() || IA.config().clave || '';
      if (!clave) { UI.toast('Pega la clave de Gemini'); return; }
      try {
        IA.guardarConfig(clave, modelo);
        IA.listarModelos(true).then(function (lista) {
          if (lista && lista.length && lista.indexOf(IA.config().modelo) === -1) {
            IA.guardarConfig(clave, lista[0]);
            UI.toast('Clave guardada. Modelo ajustado a ' + lista[0]);
            render();
          }
        }).catch(function () { /* nada */ });
        render();
        UI.toast('Clave guardada');
      } catch (e) { UI.toast(e.message); }
    });

    bind(root, '[data-a=probarIA]', function (btn) {
      const salida = root.querySelector('#ia-estado');
      btn.disabled = true;
      salida.textContent = 'Probando la conexión…';
      IA.llamar('Responde solo con la palabra: listo', { maxTokens: 20, temperatura: 0 })
        .then(function (r) {
          salida.innerHTML = '<span style="color:var(--acc)">Funciona. La IA respondió: ' +
            esc(r.slice(0, 40)) + '</span>';
          btn.disabled = false;
        })
        .catch(function (e) {
          salida.innerHTML = '<span style="color:var(--bad)">' + esc(e.message) + '</span>';
          btn.disabled = false;
        });
    });

    bind(root, '[data-a=borrarIA]', function () {
      UI.confirm('Borrar la clave', 'El entrenador con IA dejará de funcionar en este dispositivo.',
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
        'Se olvidarán Gemini, Spotify y Supabase en este dispositivo. Tus rutinas y tu ' +
        'historial no se tocan.', 'Borrar todas', true).then(function (ok) {
        if (!ok) return;
        IA.borrarConfig();
        Spotify.borrarConfig();
        Sync.borrarConfig();
        render();
        UI.toast('Claves borradas');
      });
    });
  };
})(window);
