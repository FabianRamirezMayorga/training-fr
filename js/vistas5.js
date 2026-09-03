/* vistas5.js — cómo se entra a la app y cómo se monta la base de datos.

   La app funciona de dos maneras y conviene que se note desde el principio:

     1. Modo invitado. Todo se guarda en este dispositivo y solo en este. No
        hace falta cuenta, correo ni nada. Es cómodo para probar y es un riesgo
        para quedarse: si se borran los datos del navegador, se pierde todo.
     2. Con cuenta. Correo y contraseña, y lo mismo en todos los dispositivos.

   Quien no tenga cuenta necesita su propia base de datos gratuita en Supabase,
   y ahí es donde la gente se atasca. Por eso el paso a paso de abajo dice
   exactamente qué botón tocar en cada pantalla. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  /* ================= modo invitado ================= */

  function esInvitado() { return !Sync.activa(); }
  function avisoAceptado() { return !!Store.settings().avisoInvitado; }

  /* El aviso de que esto es temporal. Se enseña una vez y se puede repetir
     desde el perfil; no tiene sentido repetirlo en cada pantalla. */
  function avisarInvitado(alSeguir) {
    UI.modal(html`
      <h2>Vas a seguir como invitado</h2>
      <p class="muted">Es la forma rápida de empezar, pero conviene que sepas dónde
      queda lo tuyo.</p>

      <div class="card aviso-seguridad">
        <b>Tus datos se guardan solo en este dispositivo</b>
        <ul class="instr" style="margin:8px 0 0">
          <li>Se pierden si borras los datos del navegador o desinstalas la app.</li>
          <li>No hay copia en ningún servidor: si cambias de móvil, empiezas de cero.</li>
          <li>No los verás en tu otro dispositivo.</li>
        </ul>
      </div>

      <p class="tiny">Puedes crear la cuenta más adelante desde <b>Perfil, Mi cuenta</b>:
      lo que hayas hecho hasta entonces se sube y no se pierde nada.</p>

      <button class="btn primary block" data-x="cuenta" style="margin-top:6px">
        Mejor creo mi cuenta</button>
      <button class="btn ghost block" data-x="seguir" style="margin-top:8px">
        Entiendo, seguir como invitado</button>`,
      function (el) {
        el.querySelector('[data-x=cuenta]').onclick = function () {
          UI.closeModal();
          go('cuenta');
        };
        el.querySelector('[data-x=seguir]').onclick = function () {
          Store.setSetting('avisoInvitado', Date.now());
          UI.closeModal();
          if (alSeguir) alSeguir();
        };
      });
  }

  /* Se llama cuando el invitado va a personalizar algo que merece la pena
     conservar. Si ya aceptó el aviso, no se le vuelve a molestar. */
  function pedirCuenta(motivo, alSeguir) {
    if (!esInvitado() || avisoAceptado()) { if (alSeguir) alSeguir(); return; }

    UI.modal(html`
      <h2>Esto es tuyo: guárdalo bien</h2>
      <p class="muted">${motivo}</p>
      <p class="muted">Con una cuenta lo tienes en el móvil, en el portátil y en el que
      venga después. Es gratis y no hay servidor mío de por medio: los datos van a tu
      propia base de datos.</p>

      <button class="btn primary block" data-x="cuenta">Crear mi cuenta</button>
      <button class="btn block" data-x="seguir" style="margin-top:8px">
        Continuar sin cuenta</button>`,
      function (el) {
        el.querySelector('[data-x=cuenta]').onclick = function () {
          UI.closeModal();
          go('cuenta');
        };
        el.querySelector('[data-x=seguir]').onclick = function () {
          UI.closeModal();
          avisarInvitado(alSeguir);
        };
      });
  }

  /* Franja discreta para que no se olvide dónde están los datos */
  function franjaInvitado() {
    if (!esInvitado()) return '';
    return html`
      <button class="card franja-invitado" data-a="irCuenta">
        <span class="row-icon">${raw(icon('nube'))}</span>
        <span class="grow" style="text-align:left">
          <b style="display:block;font-size:.88rem">Modo invitado</b>
          <span class="tiny">Tus datos están solo en este dispositivo. Toca para
          guardarlos en tu cuenta.</span>
        </span>
        <span class="chevron">${raw(icon('chevron'))}</span>
      </button>`;
  }

  /* ================= paso a paso de la base de datos ================= */

  const PASOS = [
    {
      titulo: 'Crea tu cuenta en Supabase',
      pasos: [
        'Abre <b>supabase.com</b> y pulsa <b>Start your project</b>.',
        'Entra con GitHub o con tu correo. Es gratis y no pide tarjeta.'
      ]
    },
    {
      titulo: 'Crea el proyecto',
      pasos: [
        'Pulsa <b>New project</b>.',
        '<b>Name</b>: el que quieras, por ejemplo Training.',
        '<b>Database Password</b>: genera una y guárdala donde guardes tus contraseñas. ' +
          'No es la que usarás en la app, pero la necesitarás si algún día entras a la base de datos.',
        '<b>Region</b>: la más cercana a ti.',
        'Pulsa <b>Create new project</b> y espera un par de minutos a que termine de montarse.'
      ]
    },
    {
      titulo: 'Crea la tabla donde van tus datos',
      pasos: [
        'En el menú de la izquierda entra en <b>SQL Editor</b>.',
        'Pulsa <b>New query</b>, pega el bloque de abajo y pulsa <b>Run</b> (o Ctrl+Intro).',
        'Tiene que responder <b>Success. No rows returned</b>. Eso es que ha ido bien.'
      ],
      sql: true,
      nota: 'Ese SQL crea la tabla y la política de seguridad que hace que solo tú ' +
        'puedas ver tus filas, aunque la clave de la app sea pública.'
    },
    {
      titulo: 'Quita la confirmación por correo',
      pasos: [
        'Ve a <b>Authentication</b> y luego a <b>Sign In / Providers</b>.',
        'En <b>User Signups</b>, deja <b>Allow new users to sign up</b> encendido de momento.',
        'Apaga <b>Confirm email</b> y pulsa <b>Save changes</b>.'
      ],
      nota: 'El correo que trae Supabase de serie solo manda un par de mensajes por hora. ' +
        'Sin esa confirmación entras con contraseña al momento y no dependes de ningún correo.'
    },
    {
      titulo: 'Autoriza la dirección de la app',
      pasos: [
        'En <b>Authentication</b>, entra en <b>URL Configuration</b>.',
        'Pega esta dirección en <b>Site URL</b> y también en <b>Redirect URLs</b> ' +
          '(<b>Add URL</b>).',
        'Guarda con <b>Save changes</b>.'
      ],
      url: true
    },
    {
      titulo: 'Copia los dos datos de conexión',
      pasos: [
        'Ve a <b>Project Settings</b> (la rueda dentada) y entra en <b>Data API</b>: ' +
          'copia la <b>Project URL</b>, que acaba en <b>.supabase.co</b>.',
        'Entra en <b>API Keys</b> y copia la <b>Publishable key</b>, la que empieza por ' +
          '<b>sb_publishable_</b>. Si tu proyecto es antiguo, se llama <b>anon public</b> ' +
          'y empieza por <b>eyJ</b>.',
        'No copies nunca las <b>Secret keys</b> ni la <b>service_role</b>: esas dan acceso ' +
          'total y no pintan nada en una app que corre en el navegador.'
      ]
    },
    {
      titulo: 'Pégalos aquí abajo y ya está',
      pasos: [
        'Pega la Project URL y la Publishable key en los dos campos del final.',
        'Pulsa <b>Guardar la conexión</b>.',
        'Después crea tu cuenta con tu correo y una contraseña de al menos 8 caracteres.',
        'Cuando ya estés dentro, vuelve a Supabase y apaga <b>Allow new users to sign up</b>: ' +
          'así nadie más puede crearse cuentas en tu proyecto.'
      ]
    }
  ];

  V.basedatos = function () {
    const c = Sync.config() || {};
    const propia = Sync.configPropia();

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Mi cuenta</button>
      <h1>Tu base de datos</h1>
      <p class="muted">Para sincronizar entre dispositivos hace falta una base de datos.
      Se crea una vez, es gratis y es tuya: ni yo ni nadie más ve lo que hay dentro.
      Son siete pasos y unos diez minutos.</p>

      ${raw(propia ? html`
        <div class="card" style="border-color:var(--acc)">
          <b>Ya tienes una conexión propia guardada</b>
          <p class="tiny" style="margin:6px 0 0">${c.url}</p>
        </div>` : '')}

      <div class="stack" style="margin-top:14px">
        ${raw(PASOS.map(function (p, i) {
          return html`
            <div class="card paso">
              <div class="row" style="align-items:flex-start;gap:11px">
                <span class="paso-n">${i + 1}</span>
                <div class="grow">
                  <b>${p.titulo}</b>
                  <ol class="instr" style="margin:8px 0 0">
                    ${raw(p.pasos.map(function (x) { return '<li>' + x + '</li>'; }).join(''))}
                  </ol>
                  ${raw(p.sql ? html`
                    <div class="row between" style="margin:11px 0 6px">
                      <span class="tiny">SQL PARA CREAR LA TABLA</span>
                      <button class="btn sm" data-a="copiarsql">${raw(icon('copy'))} Copiar</button>
                    </div>
                    <pre id="sql-box">${Sync.SQL}</pre>` : '')}
                  ${raw(p.url ? html`
                    <div class="row between" style="margin:11px 0 0;gap:8px">
                      <code class="tiny grow" style="word-break:break-all">${Sync.urlRetorno()}</code>
                      <button class="btn sm" data-a="copiarurl">${raw(icon('copy'))} Copiar</button>
                    </div>` : '')}
                  ${raw(p.nota ? '<p class="tiny" style="margin:10px 0 0">' + p.nota + '</p>' : '')}
                </div>
              </div>
            </div>`;
        }).join(''))}
      </div>

      <div class="list-title">Los dos datos de conexión</div>
      <div class="card">
        <label class="tiny">PROJECT URL</label>
        <input id="bd-url" placeholder="https://xxxxxxxx.supabase.co" value="${propia ? c.url : ''}"
               autocomplete="off" spellcheck="false" style="margin:5px 0 10px">
        <label class="tiny">PUBLISHABLE KEY</label>
        <input id="bd-key" placeholder="sb_publishable_..." value="${propia ? c.key : ''}"
               autocomplete="off" spellcheck="false" style="margin:5px 0 12px">
        <button class="btn primary block" data-a="guardarbd">Guardar la conexión</button>
        ${raw(propia ? '<button class="btn danger block sm" data-a="borrarbd" ' +
          'style="margin-top:8px">Borrar esta conexión</button>' : '')}
      </div>

      <p class="tiny" style="margin-top:12px">¿Se te ha atascado algún paso? Los nombres de
      los menús son los de Supabase en inglés, que es como vienen aunque el navegador esté
      en español.</p>`;
  };

  V.basedatos.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('cuenta'); });

    bind(root, '[data-a=copiarsql]', function () {
      const t = root.querySelector('#sql-box').textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t);
      UI.toast('SQL copiado');
    });

    bind(root, '[data-a=copiarurl]', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(Sync.urlRetorno());
      UI.toast('Dirección copiada');
    });

    bind(root, '[data-a=guardarbd]', function () {
      try {
        Sync.guardarConfig(root.querySelector('#bd-url').value,
          root.querySelector('#bd-key').value);
        go('cuenta');
        UI.toast('Conexión guardada. Ahora crea tu cuenta con tu correo.');
      } catch (e) {
        UI.toast(e.message);
      }
    });

    bind(root, '[data-a=borrarbd]', function () {
      UI.confirm('Borrar la conexión',
        'Este dispositivo dejará de usar tu base de datos. Tus datos locales no se tocan.',
        'Borrar', true).then(function (ok) {
        if (ok) { Sync.borrarConfig(); render(); UI.toast('Conexión borrada'); }
      });
    });
  };

  g.Modo = {
    esInvitado: esInvitado, avisoAceptado: avisoAceptado,
    avisarInvitado: avisarInvitado, pedirCuenta: pedirCuenta,
    franjaInvitado: franjaInvitado
  };
})(window);
