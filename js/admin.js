/* admin.js — la pantalla de cuentas, para quien administra el proyecto.

   Aquí no hay ningún permiso: lo que se ve o se deja de ver en esta pantalla es
   comodidad, no seguridad. Quien decide es la función del servidor, que mira el
   token de quien llama y contesta 403 a quien no sea administrador. Si alguien
   se salta esta pantalla y llama a la función a mano, se encuentra lo mismo.

   La app no lleva la service_role key por ningún lado, y no puede: cualquiera
   que abra el código fuente la leería. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  /* Se pregunta una vez por sesión: la respuesta no cambia mientras dure */
  let esAdmin = null;
  let usuarios = null;
  let cargando = false;
  let fallo = '';

  function urlFuncion() {
    const c = Sync.config();
    if (!c || !c.url) return '';
    return c.url.replace(/\/+$/, '') + '/functions/v1/admin';
  }

  function llamar(cuerpo) {
    const c = Sync.config();
    const s = Sync.sesion();
    if (!c || !s || !s.access_token) {
      return Promise.reject(new Error('Entra en tu cuenta para administrar.'));
    }
    return fetch(urlFuncion(), {
      method: 'POST',
      headers: {
        apikey: c.key,
        Authorization: 'Bearer ' + s.access_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cuerpo)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) {
          /* Si la función no está desplegada, Supabase responde 404 y el
             mensaje no dice nada útil: más vale decirlo con nombre y apellidos. */
          if (r.status === 404) {
            throw new Error('La función «admin» no está desplegada en tu proyecto de Supabase.');
          }
          throw new Error(d.error || ('Error ' + r.status));
        }
        return d;
      });
    });
  }

  /* ¿Enseñamos la entrada en Perfil? Se pregunta sin bloquear nada: mientras no
     conteste, la entrada no está, y si contesta que no, tampoco aparece. */
  function comprobar() {
    if (esAdmin !== null) return Promise.resolve(esAdmin);
    if (!Sync.activa || !Sync.activa()) { esAdmin = false; return Promise.resolve(false); }
    return llamar({ accion: 'soyAdmin' })
      .then(function (d) { esAdmin = !!d.admin; return esAdmin; })
      .catch(function () { esAdmin = false; return false; });
  }

  function administra() { return esAdmin === true; }

  function cargar() {
    cargando = true;
    fallo = '';
    return llamar({ accion: 'listar' })
      .then(function (d) { usuarios = d.usuarios || []; })
      .catch(function (e) { fallo = e.message; usuarios = null; })
      .then(function () { cargando = false; App.render(); });
  }

  /* ---------- la pantalla ---------- */

  V.usuarios = function () {
    if (esAdmin === false) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} Perfil</button>
        <h1>Cuentas</h1>
        <p class="muted">Esta pantalla es para quien administra el proyecto. Tu cuenta
        no lo es.</p>`;
    }

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <div class="row between">
        <h1 style="margin:0">Cuentas</h1>
        <button class="btn primary sm" data-a="nueva">${raw(icon('plus'))} Nueva</button>
      </div>
      <p class="muted" style="margin-top:8px">Las personas que pueden entrar en tu
      proyecto. Cada una ve solo sus datos y tú no ves los suyos: eso lo garantiza la
      base de datos, no esta pantalla.</p>

      ${raw(cargando ? html`
        <div class="card center"><div class="spinner" style="margin:6px auto"></div>
        <p class="tiny" style="margin:8px 0 0">Pidiendo la lista…</p></div>` : '')}

      ${raw(fallo ? html`
        <div class="card" style="border-color:var(--bad)">
          <b>No he podido leer las cuentas</b>
          <p class="tiny" style="margin:6px 0 0">${fallo}</p>
          <button class="btn sm block" data-a="recargar" style="margin-top:10px">
            Probar otra vez</button>
        </div>` : '')}

      ${raw(usuarios && usuarios.length ? html`
        <div class="list">
          ${raw(usuarios.map(function (u) {
            return '<div class="list-row">' +
              '<span class="row-icon">' + icon('perfil') + '</span>' +
              '<div class="grow"><div class="list-row-title">' + esc(u.email || '(sin correo)') +
              (u.yo ? ' <span class="chip tiny-chip">TÚ</span>' : '') +
              (u.activo ? '' : ' <span class="chip tiny-chip">DESACTIVADA</span>') +
              '</div><div class="list-row-sub">' +
              (u.ultimoAcceso ? 'Última entrada ' + UI.fechaCorta(u.ultimoAcceso)
                : 'No ha entrado nunca') +
              ' · alta ' + UI.fechaCorta(u.creado) + '</div></div>' +
              (u.yo ? '' :
                '<button class="btn sm" data-gestionar="' + esc(u.id) + '">Gestionar</button>') +
              '</div>';
          }).join(''))}
        </div>
        <p class="tiny center" style="margin:10px 4px 0">${usuarios.length}
        ${usuarios.length === 1 ? 'cuenta' : 'cuentas'} en el proyecto.</p>`
      : (!cargando && !fallo ? html`
        <p class="muted">Todavía no hay ninguna cuenta aparte de la tuya.</p>` : ''))}`;
  };

  V.usuarios.mount = function (root) {
    App.bind(root, '[data-a=atras]', function () { App.go('perfil'); });
    App.bind(root, '[data-a=recargar]', cargar);
    App.bind(root, '[data-a=nueva]', nuevaSheet);
    App.bindAll(root, '[data-gestionar]', function (el) {
      gestionarSheet(el.dataset.gestionar);
    });

    if (usuarios === null && !cargando && !fallo && esAdmin !== false) cargar();
  };

  /* ---------- crear ---------- */

  function nuevaSheet() {
    UI.modal(html`
      <h2>Cuenta nueva</h2>
      <p class="muted">Se crea con el correo y la contraseña que le pongas, y ya puede
      entrar. Dile que la cambie cuando entre.</p>

      <div class="tiny" style="margin:14px 0 6px">CORREO</div>
      <input id="ad-email" class="input" type="email" inputmode="email"
             autocomplete="off" placeholder="alguien@correo.com">

      <div class="tiny" style="margin:12px 0 6px">CONTRASEÑA PARA EMPEZAR</div>
      <input id="ad-clave" class="input" type="text" autocomplete="off"
             placeholder="Ocho caracteres o más">
      <p class="tiny" style="margin:7px 0 0">Se la tienes que dar tú por donde quieras;
      la app no manda correos. Y no la escribas en un sitio donde quede guardada.</p>

      <button class="btn primary block" id="ad-ok" style="margin-top:16px">Crear</button>
      <button class="btn ghost block" id="ad-no" style="margin-top:8px">Cancelar</button>`,
      function (el) {
        el.querySelector('#ad-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#ad-ok').onclick = function () {
          const email = el.querySelector('#ad-email').value.trim();
          const clave = el.querySelector('#ad-clave').value;
          if (!email) { UI.toast('Escribe el correo'); return; }
          if (clave.length < 8) { UI.toast('La contraseña necesita 8 caracteres o más'); return; }

          const boton = el.querySelector('#ad-ok');
          boton.disabled = true;
          boton.textContent = 'Creando…';
          llamar({ accion: 'crear', email: email, clave: clave })
            .then(function () {
              UI.closeModal();
              UI.toast('Cuenta creada para ' + email);
              cargar();
            })
            .catch(function (e) {
              boton.disabled = false;
              boton.textContent = 'Crear';
              UI.toast(e.message);
            });
        };
      });
  }

  /* ---------- gestionar una ---------- */

  function gestionarSheet(id) {
    const u = (usuarios || []).find(function (x) { return x.id === id; });
    if (!u) { UI.toast('Esa cuenta ya no está'); return; }

    UI.modal(html`
      <h2>${u.email || 'Cuenta'}</h2>
      <p class="muted">${u.activo ? 'Puede entrar con normalidad.'
        : 'Está desactivada: no puede entrar, pero sus datos siguen ahí.'}</p>

      <div class="card">
        <div class="row between" style="padding:3px 0"><span class="tiny">ALTA</span>
          <span class="tiny">${UI.fechaCorta(u.creado)}</span></div>
        <div class="row between" style="padding:3px 0"><span class="tiny">ÚLTIMA ENTRADA</span>
          <span class="tiny">${u.ultimoAcceso ? UI.fechaCorta(u.ultimoAcceso) : 'nunca'}</span></div>
      </div>

      <button class="btn block" id="ad-estado" style="margin-top:14px">
        ${u.activo ? 'Desactivar la cuenta' : 'Volver a activarla'}</button>
      <p class="tiny" style="margin:7px 0 0">${u.activo
        ? 'Deja de poder entrar. Sus datos se quedan donde están y vuelve todo al activarla.'
        : 'Podrá entrar otra vez con su correo y su contraseña de siempre.'}</p>

      <button class="btn ghost block danger" id="ad-borrar" style="margin-top:14px">
        ${raw(icon('trash'))} Borrar la cuenta y sus datos</button>
      <p class="tiny" style="margin:7px 0 0">Esto no se puede deshacer: se va la cuenta y
      con ella todo lo que tenga guardado.</p>

      <button class="btn ghost block" id="ad-no" style="margin-top:14px">Cerrar</button>`,
      function (el) {
        el.querySelector('#ad-no').onclick = function () { UI.closeModal(); };

        el.querySelector('#ad-estado').onclick = function () {
          const boton = el.querySelector('#ad-estado');
          boton.disabled = true;
          boton.textContent = 'Un momento…';
          llamar({ accion: u.activo ? 'desactivar' : 'activar', id: id })
            .then(function () {
              UI.closeModal();
              UI.toast(u.activo ? 'Cuenta desactivada' : 'Cuenta activada');
              cargar();
            })
            .catch(function (e) {
              boton.disabled = false;
              boton.textContent = u.activo ? 'Desactivar la cuenta' : 'Volver a activarla';
              UI.toast(e.message);
            });
        };

        el.querySelector('#ad-borrar').onclick = function () {
          UI.closeModal();
          UI.confirm('Borrar ' + (u.email || 'esta cuenta'),
            'Se va la cuenta y todo lo que tenga guardado: sus rutinas, sus ' +
            'entrenamientos y su historial. No hay vuelta atrás.',
            'Borrar', true).then(function (ok) {
            if (!ok) return;
            llamar({ accion: 'borrar', id: id })
              .then(function () { UI.toast('Cuenta borrada'); cargar(); })
              .catch(function (e) { UI.toast(e.message); });
          });
        };
      });
  }

  g.Admin = {
    comprobar: comprobar,
    administra: administra,
    llamar: llamar,
    urlFuncion: urlFuncion
  };
})(window);
