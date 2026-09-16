/* vistas7.js — Suplementos.

   Podía vivir dentro de Alimentación, pero allí ya conviven el menú, las
   franjas, las fotos y el cruce: meterle una quinta cosa dentro habría hecho
   falta bajar dos niveles para tocar la creatina. Y tampoco es «datos y
   hábitos», que se rellena una vez y no se vuelve a abrir; esto se toca cada
   vez que cambias de bote.

   Así que pantalla propia, y con la lista primero: lo que se viene a hacer aquí
   el 90 % de las veces es mirar qué toca hoy, no configurar nada. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  const S = function () { return g.Suplementos; };

  /* ---------- la lista ---------- */

  function filaHTML(s) {
    const hora = S().horaDe(s);
    const f = S().FRECUENCIAS.filter(function (x) { return x.id === s.frecuencia; })[0];
    const toca = S().tocaHoy(s);

    return html`
      <button class="sup-fila ${toca ? '' : 'hoy-no'}" data-sup="${s.id}">
        <span class="sup-hora">
          <b>${raw(UI.hora ? UI.hora(hora) : hora)}</b>
          <i>${raw(toca ? 'hoy' : 'hoy no')}</i>
        </span>
        <span class="grow">
          <span class="sup-nom">${s.nombre}</span>
          <span class="sup-sub">${raw(esc([s.dosis, S().etiquetaMomento(s),
            (f ? f.label.toLowerCase() : '')].filter(Boolean).join(' · '))) }</span>
        </span>
        ${raw(s.aporta ? '<span class="sup-aporta">' + s.aporta.prot + '<i>g</i></span>' : '')}
        <span class="chevron">${raw(icon('chevron'))}</span>
      </button>`;
  }

  V.suplementos = function () {
    if (!g.Suplementos) return '<div class="empty"><p>Módulo no disponible.</p></div>';

    const l = S().lista();
    const hoy = S().tomasDeHoy();
    const aporta = S().aportaDiario();
    const desfase = S().alertasDesfasadas();

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <h1>Suplementos</h1>
      <p class="muted">Lo que tomas, cuánto y cuándo. Con esto la app te crea los
      recordatorios sola, deja de proponerte en el menú lo que ya tomas y cuenta lo que
      aportan.</p>

      ${raw(!l.length ? html`
        <div class="card tarjeta-premium" style="margin-top:14px">
          <div class="pre-encima">Todavía nada</div>
          <div class="pre-num" style="margin:2px 0 8px">¿Tomas algo?</div>
          <p class="muted" style="margin-bottom:12px;font-size:.88rem">Creatina, proteína,
          omega 3, un multivitamínico… Apúntalo una vez y el resto de la app se entera:
          los recordatorios, el menú y las cuentas del día.</p>
          <button class="btn primary block" data-a="nuevo">
            ${raw(icon('plus'))} Añadir el primero</button>
        </div>` : html`

        <div class="card tarjeta-premium" style="margin-top:14px">
          <div class="pre-encima">Hoy</div>
          <div class="pre-num" style="margin:1px 0 10px">${raw(hoy.length
            ? hoy.length + (hoy.length === 1 ? ' toma' : ' tomas')
            : 'Ninguna')}</div>
          ${raw(hoy.length ? html`
            <div class="sup-hoy">
              ${raw(hoy.map(function (t) {
                return '<span class="sh-pieza"><b>' +
                  esc(UI.hora ? UI.hora(t.hora) : t.hora) + '</b>' +
                  esc(t.sup.nombre) + '</span>';
              }).join(''))}
            </div>` : html`
            <p class="tiny" style="margin:0">Ninguno de los que tomas cae hoy. Los de «los
            días que entreno» y «un día sí y otro no» se saltan solos.</p>`)}
          ${raw(aporta.kcal || aporta.prot ? html`
            <p class="tiny sup-pie">Suman <b>${aporta.kcal} kcal</b> y
            <b>${aporta.prot} g de proteína</b> al día de hoy, y el menú lo descuenta.</p>` : '')}
        </div>

        <div class="list-title">Lo que tomas</div>
        <!-- Por hora y no por orden de alta: la lista se lee como la agenda del
             día, y con cuatro botes el orden en que los apuntaste no le importa
             a nadie. -->
        <div class="sup-lista">
          ${raw(l.slice().sort(function (a, b) {
            return Alertas.enMinutos(S().horaDe(a)) - Alertas.enMinutos(S().horaDe(b));
          }).map(filaHTML).join(''))}
        </div>

        <button class="btn block" data-a="nuevo" style="margin-top:12px">
          ${raw(icon('plus'))} Añadir otro</button>

        <div class="list-title">Recordatorios</div>
        <div class="card">
          <p class="muted" style="margin:0 0 12px;font-size:.88rem">Se crean con el nombre y
          la dosis puestos, y a la hora que salga de cada momento. Si cambias las horas de
          tus comidas o los días de tu plan, vuelve aquí y se rehacen.</p>

          ${raw(desfase ? html`
            <div class="cal-viejo" style="margin-bottom:12px">
              <span class="cv-ico">${raw(icon('aviso'))}</span>
              <span class="grow"><b>Tus recordatorios no coinciden</b>
              <span class="tiny">Has cambiado suplementos, horas de comer o días de
              entreno desde la última vez.</span></span>
            </div>` : '')}

          <button class="btn ${desfase ? 'primary' : ''} block" data-a="sincronizar">
            ${raw(icon('campana'))} ${raw(S().hayAlertas()
              ? 'Rehacer los recordatorios' : 'Crear los recordatorios')}</button>
          <p class="tiny" style="margin-top:8px">Solo toca los de suplementos: los
          recordatorios que hayas creado tú se quedan como están.</p>
        </div>`)}

      <!-- Una vez, y no en cada aviso. Repetirlo en cada pantalla es lo que
           hace que se deje de leer, y aquí es donde de verdad toca decirlo. -->
      <p class="tiny sup-aviso">Esto es una lista para acordarte y para que las cuentas
      cuadren, no una recomendación. Qué tomar, cuánto y si te conviene lo decides tú con
      quien te lleve la salud, sobre todo si tomas medicación.</p>`;
  };

  V.suplementos.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=nuevo]', function () { elegirSheet(); });
    bindAll(root, '[data-sup]', function (el) {
      const s = S().lista().filter(function (x) { return x.id === el.dataset.sup; })[0];
      if (s) fichaSheet(s);
    });

    bind(root, '[data-a=sincronizar]', function () {
      const n = S().sincronizarAlertas();
      render();
      UI.toast(n ? n + (n === 1 ? ' recordatorio listo' : ' recordatorios listos')
        : 'No hay nada que recordar');
    });
  };

  /* ---------- elegir del catálogo ----------
     Doce filas de lista para elegir un bote era tratar un catálogo como si
     fuera configuración: ocupaba tres pantallas de alto para decir doce
     nombres, y elegir obligaba a leerlo entero de arriba abajo.

     En rejilla se ve todo casi de una vez y se elige señalando, que es lo que
     de verdad se hace aquí. La dosis va debajo en pequeño porque no decide
     nada: se cambia en el paso siguiente. */
  function elegirSheet() {
    const ya = {};
    S().lista().forEach(function (x) { if (x.cat) ya[x.cat] = 1; });

    UI.modal(html`
      <div class="conf-disco cambio">${raw(icon('bote'))}</div>
      <h2 class="conf-tit">¿Qué tomas?</h2>
      <p class="muted conf-txt">Elige uno y ajustas el resto. Lo que sale puesto es lo que
      suele traer la etiqueta, no una recomendación.</p>

      <div class="sup-rejilla">
        ${raw(S().CATALOGO.map(function (c) {
          return '<button class="sup-chip' + (c.id === 'otro' ? ' otro' : '') +
            (ya[c.id] ? ' ya' : '') + '" data-cat="' + esc(c.id) + '">' +
            '<span class="sc-nom">' + esc(c.nombre) + '</span>' +
            '<span class="sc-dos">' + esc(c.id === 'otro' ? 'Lo escribes tú'
              : (c.dosis || '')) + '</span></button>';
        }).join(''))}
      </div>`,
      function (el) {
        el.querySelector('.sup-rejilla').onclick = function (ev) {
          const b = ev.target.closest('[data-cat]');
          if (!b) return;
          const c = S().delCatalogo(b.dataset.cat);
          UI.closeModal();
          setTimeout(function () {
            fichaSheet(S().nuevo({
              cat: c.id === 'otro' ? '' : c.id,
              nombre: c.id === 'otro' ? '' : c.nombre,
              dosis: c.dosis || '',
              momento: c.momento || 'con:desayuno',
              aporta: c.aporta || null
            }), true);
          }, 180);
        };
      });
  }

  /* ---------- la ficha ----------
     Eran once filas de lista apiladas —cuatro frecuencias y siete momentos, con
     su icono y su subtítulo cada una— para rellenar cuatro datos. Con pastillas
     cabe entero sin scroll y se lee de un vistazo qué hay elegido.

     Lo único que se queda grande es la hora calculada: elegir «con el desayuno»
     sin ver que eso son las 6:00 deja la duda de si la app sabe a qué hora
     desayunas, y es lo que hace que la gente acabe poniendo horas a mano. */
  function fichaSheet(s, esNuevo) {
    const dat = JSON.parse(JSON.stringify(s));
    const DIAS = [[1, 'L'], [2, 'M'], [3, 'X'], [4, 'J'], [5, 'V'], [6, 'S'], [0, 'D']];

    const pintar = function (el) {
      const caja = el.querySelector('#sf-hora');
      const h = S().horaDe(dat);
      const m = S().momentoDe(dat.momento);
      caja.innerHTML = '<b>' + esc(UI.hora ? UI.hora(h) : h) + '</b>' +
        '<span>' + esc(m.de === 'franja'
          ? 'sale de tus horas de comer, en Alimentación'
          : m.de === 'entreno'
            ? 'sale de la hora a la que sueles entrenar'
            : 'la que has puesto') + '</span>';
      el.querySelector('#sf-fija').hidden = m.de !== 'fija';
      el.querySelector('#sf-semanal').hidden = dat.frecuencia !== 'semanal';
    };

    UI.modal(html`
      <div class="conf-disco cambio">${raw(icon('bote'))}</div>
      <h2 class="conf-tit">${esNuevo ? 'Nuevo suplemento' : dat.nombre || 'Suplemento'}</h2>

      <div class="sup-campos">
        <label class="sup-campo grow">
          <span>Nombre</span>
          <input id="sf-nombre" value="${dat.nombre}" placeholder="Creatina" autocomplete="off">
        </label>
        <label class="sup-campo dosis">
          <span>Dosis</span>
          <input id="sf-dosis" value="${dat.dosis}" placeholder="5 g" autocomplete="off">
        </label>
      </div>

      <label class="tiny sup-lbl">CADA CUÁNTO</label>
      <div class="row wrap sup-pills" id="sf-frec">
        ${raw(S().FRECUENCIAS.map(function (f) {
          return '<button class="chip ' + (dat.frecuencia === f.id ? 'on' : '') +
            '" data-frec="' + esc(f.id) + '">' + esc(f.corto || f.label) + '</button>';
        }).join(''))}
      </div>

      <div id="sf-semanal" hidden>
        <label class="tiny sup-lbl">QUÉ DÍA</label>
        <div class="row wrap sup-pills">
          ${raw(DIAS.map(function (d) {
            return '<button class="chip ' + (Number(dat.dia) === d[0] ? 'on' : '') +
              '" data-dia="' + d[0] + '">' + d[1] + '</button>';
          }).join(''))}
        </div>
      </div>

      <label class="tiny sup-lbl">EN QUÉ MOMENTO</label>
      <div class="row wrap sup-pills" id="sf-mom">
        ${raw(S().MOMENTOS.map(function (m) {
          return '<button class="chip ' + (dat.momento === m.id ? 'on' : '') +
            '" data-mom="' + esc(m.id) + '">' + esc(m.corto || m.label) + '</button>';
        }).join(''))}
      </div>

      <div id="sf-fija" hidden>
        <label class="tiny sup-lbl">A QUÉ HORA</label>
        <input type="time" id="sf-horafija" value="${dat.hora || '08:00'}">
      </div>

      <div class="sup-calc" id="sf-hora"></div>

      <div class="cb-acciones" style="margin-top:14px">
        <button class="btn primary grow btn-arranque" data-x="ok">
          ${raw(icon('check'))} Guardar</button>
        <button class="btn vidrio" data-x="no">Cancelar</button>
      </div>
      ${raw(esNuevo ? '' : '<button class="btn ghost block sm danger" data-x="borrar" ' +
        'style="margin-top:9px">Quitarlo de la lista</button>')}`,
      function (el) {
        pintar(el);

        /* Un solo manejador por grupo: los botones se repintan al elegir, y
           enganchados uno a uno la primera elección se queda clavada. */
        const grupo = function (sel, campo, num) {
          const caja = el.querySelector(sel);
          caja.onclick = function (ev) {
            const b = ev.target.closest('[data-' + campo + ']');
            if (!b) return;
            dat[campo === 'frec' ? 'frecuencia' : campo === 'mom' ? 'momento' : 'dia'] =
              num ? Number(b.dataset[campo]) : b.dataset[campo];
            caja.querySelectorAll('[data-' + campo + ']').forEach(function (x) {
              const suyo = num ? Number(x.dataset[campo]) : x.dataset[campo];
              const actual = dat[campo === 'frec' ? 'frecuencia'
                : campo === 'mom' ? 'momento' : 'dia'];
              x.classList.toggle('on', suyo === actual);
            });
            pintar(el);
          };
        };
        grupo('#sf-frec', 'frec');
        grupo('#sf-mom', 'mom');
        grupo('#sf-semanal', 'dia', true);

        el.querySelector('#sf-horafija').oninput = function () {
          dat.hora = el.querySelector('#sf-horafija').value;
          pintar(el);
        };

        el.querySelector('[data-x=no]').onclick = function () { UI.closeModal(); };

        const borrarB = el.querySelector('[data-x=borrar]');
        if (borrarB) {
          borrarB.onclick = function () {
            UI.closeModal();
            UI.confirm('Quitar ' + (dat.nombre || 'el suplemento'),
              'Se va de la lista y de las cuentas. Los recordatorios ya creados no se ' +
              'borran hasta que los rehagas.', 'Quitar', true).then(function (ok) {
              if (!ok) return;
              S().borrar(dat.id);
              render();
              UI.toast('Quitado');
            });
          };
        }

        el.querySelector('[data-x=ok]').onclick = function () {
          dat.nombre = (el.querySelector('#sf-nombre').value || '').trim();
          dat.dosis = (el.querySelector('#sf-dosis').value || '').trim();
          if (!dat.nombre) { UI.toast('Ponle nombre'); return; }
          S().guardar(dat);
          UI.closeModal();
          render();
          UI.toast(esNuevo ? dat.nombre + ' añadido' : 'Guardado');
        };
      });
  }
})(window);
