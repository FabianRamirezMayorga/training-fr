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

  /* Se pregunta al servidor si esta cuenta administra.

     Tres estados, no dos: sí, no, y «todavía no se ha podido preguntar». Antes
     eran dos, y cualquier fallo al preguntar —sin red al arrancar, o la sesión
     caducada, que es lo que pasaba— se guardaba como un «no» que ya no se
     revisaba en toda la sesión. La entrada de Cuentas desaparecía y no volvia
     ni al arreglarse la conexion ni al entrar de nuevo: habia que cerrar la app
     del todo y abrirla con red a la primera.

     Se recuerda ademas de que cuenta es la respuesta. Si entra otra persona en
     el mismo dispositivo, la de antes no vale. */
  let esAdmin = null;
  let deQuien = '';
  let preguntando = null;
  let ultimoFallo = 0;
  let porQueNoSeSupo = '';

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
      return Promise.reject(new Error(T('Entra en tu cuenta para administrar.')));
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
            throw new Error(T('La función «admin» no está desplegada en tu proyecto de Supabase.'));
          }
          throw new Error(d.error || ('Error ' + r.status));
        }
        return d;
      });
    });
  }

  /* De quien es la sesion abierta ahora mismo */
  function cuentaActual() {
    const s = Sync.sesion && Sync.sesion();
    if (!s || !Sync.activa || !Sync.activa()) return '';
    return s.user_id || s.email || '';
  }

  /* Lo que se sabe ahora mismo: true, false, o null si no se ha podido
     preguntar todavia.

     Caduca la respuesta aqui, al leerla, y no solo al preguntar. Si la
     invalidacion vive dentro de comprobar(), la pantalla que pinta antes de
     preguntar lee la respuesta de la cuenta anterior y enseña un «tu cuenta no
     administra» que es de otra persona. */
  function vigente() {
    const quien = cuentaActual();
    if (quien !== deQuien) {
      deQuien = quien;
      esAdmin = quien ? null : false;
      ultimoFallo = 0;
      porQueNoSeSupo = '';
      usuarios = null;
      fallo = '';
    }
    return esAdmin;
  }

  /* ¿Enseñamos la entrada en Perfil? Se pregunta sin bloquear nada: mientras no
     conteste, la entrada no está, y si contesta que no, tampoco aparece. Lo que
     sí cambia es que un fallo al preguntar ya no cuenta como respuesta: se
     vuelve a intentar la próxima vez que haga falta. */
  function comprobar() {
    const ya = vigente();

    /* Sin sesión no hay a quién preguntar. */
    if (!deQuien) return Promise.resolve(false);

    if (ya !== null) return Promise.resolve(ya);
    if (preguntando) return preguntando;

    /* Falló hace nada: se reintenta, pero no en cada repintado. */
    if (ultimoFallo && Date.now() - ultimoFallo < 15000) return Promise.resolve(false);

    preguntando = llamar({ accion: 'soyAdmin' })
      .then(function (d) {
        esAdmin = !!d.admin; porQueNoSeSupo = '';
        return esAdmin;
      })
      .catch(function (e) {
        /* No haber podido preguntar no es un «no». Se queda sin respuesta para
           poder volver a intentarlo. */
        esAdmin = null;
        ultimoFallo = Date.now();
        porQueNoSeSupo = e.message || T('No se pudo preguntar al servidor.');
        return false;
      });

    const soltar = function () { preguntando = null; };
    preguntando.then(soltar, soltar);

    return preguntando;
  }

  function administra() { return vigente() === true; }

  /* Ni si ni no: se intento preguntar y no se pudo. Perfil lo usa para dejar la
     entrada a la vista de todos modos, porque si no la unica pantalla que
     explica el porque es justo la que queda escondida —y quien administra se
     queda sin saber que ha pasado ni como reintentarlo. */
  function sinRespuesta() { return vigente() === null && !!porQueNoSeSupo; }

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
    const estado = vigente();

    if (estado === false) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} ${T('Perfil')}</button>
        <h1>${T('Cuentas')}</h1>
        <p class="muted">${T('Esta pantalla es para quien administra el proyecto. Tu ' +
        'cuenta no lo es.')}</p>`;
    }

    /* Ni sí ni no: no se ha podido preguntar. Antes esto se veía igual que un
       «no lo eres», que es justo lo que despista cuando sí lo eres. */
    if (estado === null && porQueNoSeSupo) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} ${T('Perfil')}</button>
        <h1>${T('Cuentas')}</h1>
        <div class="card" style="border-color:var(--warn)">
          <b>${T('No he podido comprobar si administras')}</b>
          <p class="tiny" style="margin:6px 0 0">${porQueNoSeSupo}</p>
          <button class="btn sm block" data-a="reintentar" style="margin-top:10px">
            ${T('Probar otra vez')}</button>
        </div>
        <p class="tiny" style="margin-top:10px">${T('Mientras no conteste, la entrada de ' +
        'Cuentas no aparece en Perfil. No es que hayas dejado de administrar.')}</p>`;
    }

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Perfil')}</button>
      <div class="row between">
        <h1 style="margin:0">${T('Cuentas')}</h1>
        <button class="btn primary sm" data-a="nueva">${raw(icon('plus'))} ${T('Nueva')}</button>
      </div>
      <p class="muted" style="margin-top:8px">${T('Las personas que pueden entrar en tu ' +
      'proyecto. Cada una ve solo sus datos y tú no ves los suyos: eso lo garantiza la ' +
      'base de datos, no esta pantalla.')}</p>

      ${raw(cargando ? html`
        <div class="card center"><div class="spinner" style="margin:6px auto"></div>
        <p class="tiny" style="margin:8px 0 0">${T('Pidiendo la lista…')}</p></div>` : '')}

      ${raw(fallo ? html`
        <div class="card" style="border-color:var(--bad)">
          <b>${T('No he podido leer las cuentas')}</b>
          <p class="tiny" style="margin:6px 0 0">${fallo}</p>
          <button class="btn sm block" data-a="recargar" style="margin-top:10px">
            ${T('Probar otra vez')}</button>
        </div>` : '')}

      ${raw(usuarios && usuarios.length ? html`
        ${raw(resumenHTML(usuarios))}
        <div class="cuentas">
          ${raw(usuarios.map(fichaCuenta).join(''))}
        </div>`
      : (!cargando && !fallo ? html`
        <div class="card center" style="padding:26px 18px">
          <span class="cu-vacio">${raw(icon('perfil'))}</span>
          <b style="display:block;margin-top:11px">${T('Solo estás tú')}</b>
          <p class="tiny" style="margin:5px 0 0">${T('Todavía no hay ninguna cuenta ' +
          'aparte de la tuya. Crea una con «Nueva» y dale el correo y la contraseña a ' +
          'quien la vaya a usar.')}</p>
        </div>` : ''))}`;
  };

  /* Cuándo fue, dicho como lo diría alguien. «13 sep» obliga a mirar el
     calendario para saber si eso fue ayer o hace tres semanas, que es justo lo
     que se quiere saber de una cuenta ajena. */
  /* Le llega una fecha ISO de Supabase, no un número de milisegundos. Restarle
     Date.now() a una cadena da NaN, y con NaN fallan todas las comparaciones de
     abajo: caía siempre en la última línea y esto no dijo «hoy» ni «ayer» una
     sola vez desde que existe. */
  function hace(t) {
    const cuando = typeof t === 'number' ? t : Date.parse(t);
    if (!cuando) return '';
    const dias = Math.floor((Date.now() - cuando) / 86400000);
    if (dias <= 0) return T('hoy');
    if (dias === 1) return T('ayer');
    if (dias < 7) return Tn('hace {n} días', { n: dias });
    if (dias < 30) return Tn('hace {n} semanas', { n: Math.round(dias / 7) });
    return UI.fechaCorta(cuando);
  }

  /* La cuenta, como una ficha. Eran filas de lista con el correo en una línea,
     dos fechas sueltas en otra y un botón gris al final; con tres cuentas ya
     costaba distinguir cuál estaba activa y cuál no. */
  function fichaCuenta(u) {
    const correo = u.email || T('(sin correo)');
    const inicial = (correo.trim()[0] || '?').toUpperCase();
    const etiqueta = u.yo ? T('tu cuenta') : Tn('Gestionar {correo}', { correo: correo });

    return '<' + (u.yo ? 'div' : 'button') + ' class="cuenta' +
      (u.yo ? ' yo' : '') + (u.activo ? '' : ' apagada') + '"' +
      (u.yo ? '' : ' data-gestionar="' + esc(u.id) + '" aria-label="' + esc(etiqueta) + '"') +
      '>' +
      '<span class="cu-avatar">' + esc(inicial) + '</span>' +
      '<span class="grow">' +
        '<span class="cu-correo">' + esc(correo) + '</span>' +
        '<span class="cu-linea">' +
          '<span class="cu-punto"></span>' +
          esc(u.activo ? T('Puede entrar') : T('Desactivada')) +
          /* Lo que se mira de una lista de cuentas es quién la usa, no quién
             tecleó su contraseña. Si hay marca de uso manda ella; el inicio de
             sesión sigue estando, pero en el detalle. */
          (u.visto
            ? '<span class="cu-sep">·</span>' +
              esc(Tn('activo {cuando}', { cuando: hace(u.visto) }))
            : u.ultimoAcceso
            ? '<span class="cu-sep">·</span>' +
              esc(Tn('inició sesión {cuando}', { cuando: hace(u.ultimoAcceso) }))
            : '<span class="cu-sep">·</span>' + esc(T('no ha entrado nunca'))) +
        '</span>' +
        '<span class="cu-alta">' +
        esc(Tn('Alta {fecha}', { fecha: UI.fechaCorta(u.creado) })) + '</span>' +
      '</span>' +
      (u.yo ? '<span class="cu-tu">' + esc(T('TÚ')) + '</span>'
        : '<span class="chevron">' + icon('chevron') + '</span>') +
      '</' + (u.yo ? 'div' : 'button') + '>';
  }

  /* Cuántas hay y cuántas pueden entrar. Era una línea de texto al final, y es
     lo primero que se quiere saber al abrir la pantalla. */
  function resumenHTML(lista) {
    const activas = lista.filter(function (u) { return u.activo; }).length;
    const fuera = lista.length - activas;
    return '<div class="cu-resumen">' +
      '<span class="cur-dato"><b>' + lista.length + '</b>' +
        esc(lista.length === 1 ? T('cuenta') : T('cuentas')) + '</span>' +
      '<span class="cur-dato ok"><b>' + activas + '</b>' +
        esc(activas === 1 ? T('puede entrar') : T('pueden entrar')) + '</span>' +
      (fuera ? '<span class="cur-dato mal"><b>' + fuera + '</b>' +
        esc(fuera === 1 ? T('desactivada') : T('desactivadas')) + '</span>' : '') +
      '</div>';
  }

  V.usuarios.mount = function (root) {
    App.bind(root, '[data-a=atras]', function () { App.go('perfil'); });
    App.bind(root, '[data-a=recargar]', cargar);
    App.bind(root, '[data-a=reintentar]', function () {
      ultimoFallo = 0; porQueNoSeSupo = ''; deQuien = '';
      comprobar().then(function () { App.render(); });
    });
    App.bind(root, '[data-a=nueva]', nuevaSheet);
    App.bindAll(root, '[data-gestionar]', function (el) {
      gestionarSheet(el.dataset.gestionar);
    });

    /* Si se llegó aquí sin saber todavía si administra —por el enlace directo,
       sin pasar por la entrada de Perfil—, se pregunta ahora. */
    const estado = vigente();
    if (estado === null && !porQueNoSeSupo) {
      comprobar().then(function () { App.render(); });
      return;
    }
    if (usuarios === null && !cargando && !fallo && estado === true) cargar();
  };

  /* ---------- crear ---------- */

  function nuevaSheet() {
    UI.modal(html`
      <div class="conf-disco"><span class="cu-disco-txt">+</span></div>
      <h2 class="conf-tit">${T('Cuenta nueva')}</h2>
      <p class="muted conf-txt">${T('Se crea con el correo y la contraseña que le pongas, ' +
      'y ya puede entrar. Dile que la cambie cuando entre.')}</p>

      <div class="clave-bloque">
        <div class="cb-cab"><span class="cb-lab">${T('Correo')}</span></div>
        <input id="ad-email" type="email" inputmode="email"
               autocomplete="off" placeholder="alguien@correo.com">
      </div>

      <div class="clave-bloque">
        <div class="cb-cab"><span class="cb-lab">${T('Contraseña para empezar')}</span>
          <button class="btn sm vidrio cb-mini" id="ad-dado">${raw(icon('cambiar'))}
            ${T('Inventar una')}</button></div>
        <input id="ad-clave" type="text" autocomplete="off"
               placeholder="${T('Ocho caracteres o más')}">
      </div>

      <div class="nota-prov" style="--tono:var(--warn);margin-top:13px">
        <span class="np-ico">${raw(icon('aviso'))}</span>
        <span class="grow"><span class="np-txt">${T('Se la tienes que dar tú por donde ' +
        'quieras: la app no manda correos. Y no la escribas en un sitio donde quede ' +
        'guardada.')}</span></span>
      </div>

      <div class="cb-acciones" style="margin-top:16px">
        <button class="btn primary grow btn-arranque" id="ad-ok">${raw(icon('plus'))}
          ${T('Crear')}</button>
        <button class="btn vidrio" id="ad-no">${T('Cancelar')}</button>
      </div>`,
      function (el) {
        el.querySelector('#ad-no').onclick = function () { UI.closeModal(); };

        /* Una contraseña de empezar no la tiene que pensar nadie: se usa una
           vez y se cambia. Inventarla aquí evita el «1234» de siempre. */
        el.querySelector('#ad-dado').onclick = function () {
          const abc = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let clave = '';
          const azar = new Uint32Array(12);
          (window.crypto || window.msCrypto).getRandomValues(azar);
          for (let i = 0; i < 12; i++) clave += abc[azar[i] % abc.length];
          el.querySelector('#ad-clave').value = clave;
        };

        el.querySelector('#ad-ok').onclick = function () {
          const email = el.querySelector('#ad-email').value.trim();
          const clave = el.querySelector('#ad-clave').value;
          if (!email) { UI.toast(T('Escribe el correo')); return; }
          if (clave.length < 8) { UI.toast(T('La contraseña necesita 8 caracteres o más')); return; }

          const boton = el.querySelector('#ad-ok');
          boton.disabled = true;
          boton.innerHTML = T('Creando…');
          llamar({ accion: 'crear', email: email, clave: clave })
            .then(function () {
              UI.closeModal();
              UI.toast(Tn('Cuenta creada para {correo}', { correo: email }));
              cargar();
            })
            .catch(function (e) {
              boton.disabled = false;
              boton.innerHTML = icon('plus') + ' ' + esc(T('Crear'));
              UI.toast(e.message);
            });
        };
      });
  }

  /* ---------- gestionar una ---------- */

  function gestionarSheet(id) {
    const u = (usuarios || []).find(function (x) { return x.id === id; });
    if (!u) { UI.toast(T('Esa cuenta ya no está')); return; }

    const correo = u.email || T('Cuenta');
    const inicial = (correo.trim()[0] || '?').toUpperCase();

    UI.modal(html`
      <div class="cu-cab">
        <span class="cu-avatar grande">${inicial}</span>
        <span class="grow">
          <span class="cu-correo">${correo}</span>
          <span class="cu-linea"><span class="cu-punto"></span>${u.activo
            ? T('Puede entrar con normalidad')
            : T('Desactivada: no puede entrar, pero sus datos siguen ahí')}</span>
        </span>
      </div>

      <div class="aj-caja" style="margin-top:14px">
        <div class="aj-fila"><span class="grow"><span class="aj-tit">${T('Alta')}</span></span>
          <span class="cu-val">${UI.fechaCorta(u.creado)}</span></div>
        <div class="aj-fila"><span class="grow"><span class="aj-tit">${T('Última vez que la usó')}</span>
          </span><span class="cu-val">${u.visto
            ? UI.fechaCorta(u.visto) : T('sin datos')}</span></div>
        <!-- Las dos cosas, porque no son la misma: una dice cuándo abrió la app
             y la otra cuándo tuvo que volver a escribir su contraseña. -->
        <div class="aj-fila"><span class="grow"><span class="aj-tit">${T('Último inicio de sesión')}</span>
          </span><span class="cu-val">${u.ultimoAcceso
            ? UI.fechaCorta(u.ultimoAcceso) : T('nunca')}</span></div>
      </div>

      <div class="plan-acciones" style="margin:14px 0 0">
        <button class="fila-plan" id="ad-estado"
                style="--fp:${raw(u.activo ? 'var(--warn)' : 'var(--acc)')}">
          <span class="fp-ico">${raw(icon(u.activo ? 'salir' : 'check'))}</span>
          <span class="grow"><span class="fp-tit">${u.activo
            ? T('Desactivar la cuenta') : T('Volver a activarla')}</span>
            <span class="fp-sub">${u.activo
              ? T('Deja de poder entrar. Sus datos se quedan donde están y vuelve todo al activarla.')
              : T('Podrá entrar otra vez con su correo y su contraseña de siempre.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
        <button class="fila-plan es-peligro" id="ad-borrar" style="--fp:var(--bad)">
          <span class="fp-ico">${raw(icon('trash'))}</span>
          <span class="grow"><span class="fp-tit">${T('Borrar la cuenta y sus datos')}</span>
            <span class="fp-sub">${T('No se puede deshacer: se va la cuenta y con ella ' +
            'todo lo que tenga guardado.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
      </div>

      <button class="btn vidrio block" id="ad-no" style="margin-top:12px">${T('Cerrar')}</button>`,
      function (el) {
        el.querySelector('#ad-no').onclick = function () { UI.closeModal(); };

        el.querySelector('#ad-estado').onclick = function () {
          const boton = el.querySelector('#ad-estado');
          const tit = boton.querySelector('.fp-tit');
          boton.disabled = true;
          if (tit) tit.textContent = T('Un momento…');
          llamar({ accion: u.activo ? 'desactivar' : 'activar', id: id })
            .then(function () {
              UI.closeModal();
              UI.toast(u.activo ? T('Cuenta desactivada') : T('Cuenta activada'));
              cargar();
            })
            .catch(function (e) {
              boton.disabled = false;
              if (tit) tit.textContent = u.activo ? T('Desactivar la cuenta') : T('Volver a activarla');
              UI.toast(e.message);
            });
        };

        el.querySelector('#ad-borrar').onclick = function () {
          UI.closeModal();
          UI.confirm(Tn('Borrar {que}', { que: u.email || T('esta cuenta') }),
            T('Se va la cuenta y todo lo que tenga guardado: sus rutinas, sus ' +
            'entrenamientos y su historial. No hay vuelta atrás.'),
            T('Borrar'), true).then(function (ok) {
            if (!ok) return;
            llamar({ accion: 'borrar', id: id })
              .then(function () { UI.toast(T('Cuenta borrada')); cargar(); })
              .catch(function (e) { UI.toast(e.message); });
          });
        };
      });
  }

  g.Admin = {
    comprobar: comprobar,
    administra: administra, sinRespuesta: sinRespuesta,
    llamar: llamar,
    urlFuncion: urlFuncion
  };
})(window);
