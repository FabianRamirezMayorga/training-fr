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

  /* ---------- la lista ----------
     La hora iba en una columna propia, en verde y con un «HOY» debajo, y
     robaba el sitio y la mirada a lo que de verdad identifica la fila: el
     nombre. Con cuatro botes uno busca «el magnesio», no «el de las ocho».

     Ahora manda el nombre, en el color de la app, y debajo van los tres datos
     que hacen falta para saber si hay que tocar algo: cuánto, a qué hora y cada
     cuánto. En ese orden, que es el de la etiqueta del bote. */
  function filaHTML(s) {
    const horas = S().horasDe(s);
    const f = S().FRECUENCIAS.filter(function (x) { return x.id === s.frecuencia; })[0];

    /* Con reparto, lo que dice «cada cuánto» es el patrón y no la frecuencia:
       «varias veces al día» ya se ve en que hay varias horas. */
    const cada = s.frecuencia === 'varias'
      ? S().patronDe(s.patron).label
      : (f ? f.label : '');

    const cuando = horas.map(function (h) {
      return UI.hora ? UI.hora(h) : h;
    }).join(', ');

    return html`
      <button class="sup-fila" data-sup="${s.id}">
        <span class="grow">
          <span class="sup-nom">${s.nombre}</span>
          <span class="sup-sub">${raw(esc([s.dosis, cuando, cada]
            .filter(Boolean).join(' · ')))}</span>
        </span>
        ${raw(s.aporta ? '<span class="sup-aporta">' + s.aporta.prot + '<i>g</i></span>' : '')}
        <span class="chevron">${raw(icon('chevron'))}</span>
      </button>`;
  }

  /* ---------- lo que hay que tomar hoy ----------
     Llegó a tener botón de «tomar» y casillas que se marcaban, y se ha quitado:
     esto es para acordarse, no un diario de cumplimiento. Apuntar seis veces al
     día que sí te tomaste algo es trabajo que nadie hace más de una semana, y
     una lista de casillas sin marcar acaba siendo un reproche.

     Así que información y nada más, pero dicha entera: el nombre, la hora y
     cuánto. Antes decía la hora y el nombre y había que abrir la ficha para
     saber si eran cinco gramos o un cazo, que es justo el dato que se va de la
     cabeza. Tres columnas, alineadas, y se lee de arriba abajo en dos segundos. */
  function hoyHTML(aporta) {
    const hoy = S().tomasDeHoy();

    if (!hoy.length) {
      return html`
        <div class="card sup-hoy2" style="margin-top:14px">
          <div class="sh-cab"><span class="sh-et">Hoy no toca nada</span></div>
          <p class="tiny" style="margin:6px 0 0">Los de «los días que entreno» y «un día
          sí y otro no» se saltan solos.</p>
        </div>`;
    }

    return html`
      <div class="card sup-hoy2" style="margin-top:14px">
        <div class="sh-cab">
          <span class="sh-et">Que no se te olvide</span>
          <span class="sh-cuenta">${hoy.length} ${hoy.length === 1 ? 'toma' : 'tomas'}</span>
        </div>

        <div class="sh-lista">
          ${raw(hoy.map(function (t) {
            return '<div class="sh-linea">' +
              '<span class="sl-h">' + esc(UI.hora ? UI.hora(t.hora) : t.hora) + '</span>' +
              '<span class="sl-n">' + esc(t.sup.nombre) + '</span>' +
              '<span class="sl-d">' + esc(t.sup.dosis || '') + '</span></div>';
          }).join(''))}
        </div>

        ${raw(aporta.kcal || aporta.prot ? html`
          <p class="tiny sup-pie">Suman <b>${aporta.kcal} kcal</b> y
          <b>${aporta.prot} g de proteína</b> al día, y el menú lo descuenta.</p>` : '')}
      </div>`;
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

        ${raw(hoyHTML(aporta))}

        <div class="list-title">Lo que tomas</div>
        <!-- Por hora y no por orden de alta: la lista se lee como la agenda del
             día, y con cuatro botes el orden en que los apuntaste no le importa
             a nadie. -->
        <div class="sup-lista">
          ${raw(l.slice().sort(function (a, b) {
            return Alertas.enMinutos(S().horasDe(a)[0]) -
              Alertas.enMinutos(S().horasDe(b)[0]);
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
     Sin la caja con la hora calculada. Enseñaba «7:00 PM» en grande al elegir
     post-entreno, y esa hora es una suposición: si un día entrenas por la
     mañana, la toma va después de ESE entreno. Un número grande y en color
     promete una exactitud que ahí no existe. La hora de verdad se ve en la
     lista, ya guardado.

     Lo que sí queda es el botón de hora puntual, y con color propio: los demás
     momentos son relativos a algo tuyo —tus comidas, tu entreno— y ese es el
     único absoluto. Distinta naturaleza, distinto color. */
  function fichaSheet(s, esNuevo) {
    const dat = JSON.parse(JSON.stringify(s));
    const DIAS = [[1, 'L'], [2, 'M'], [3, 'X'], [4, 'J'], [5, 'V'], [6, 'S'], [0, 'D']];

    const pintar = function (el) {
      const m = S().momentoDe(dat.momento);
      const reparte = dat.frecuencia === 'varias';

      el.querySelector('#sf-fija').hidden = reparte || m.de !== 'fija';
      el.querySelector('#sf-semanal').hidden = dat.frecuencia !== 'semanal';
      /* Repartido en el día, el momento suelto ya no manda: lo dice el patrón,
         así que se aparta en vez de quedarse contradiciéndolo. */
      el.querySelector('#sf-blmom').hidden = reparte;
      el.querySelector('#sf-blrep').hidden = !reparte;

      const rep = el.querySelector('#sf-repchip');
      if (rep) {
        rep.textContent = dat.patron
          ? S().etiquetaMomento(dat) : 'Elige cómo lo repartes';
        rep.classList.toggle('sin-elegir', !dat.patron);
      }

      const ini2 = el.querySelector('#sf-inicio');
      if (ini2) ini2.hidden = !reparte || !dat.patron ||
        S().patronDe(dat.patron).de !== 'reloj';
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
            (f.reparte ? ' chip-otro' : '') + '" data-frec="' + esc(f.id) + '">' +
            esc(f.corto || f.label) + '</button>';
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

      <div id="sf-blrep" hidden>
        <label class="tiny sup-lbl">CÓMO SE REPARTE</label>
        <button class="sup-reparto" data-x="reparto">
          <span class="grow" id="sf-repchip"></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>
        <div id="sf-inicio" hidden>
          <label class="tiny sup-lbl">EMPEZANDO A LAS</label>
          <input type="time" id="sf-horainicio" value="${dat.hora || '08:00'}">
        </div>
      </div>

      <div id="sf-blmom">
        <label class="tiny sup-lbl">EN QUÉ MOMENTO</label>
        <div class="row wrap sup-pills" id="sf-mom">
          ${raw(S().MOMENTOS.map(function (m) {
            return '<button class="chip ' + (dat.momento === m.id ? 'on' : '') +
              (m.de === 'fija' ? ' chip-otro' : '') + '" data-mom="' + esc(m.id) + '">' +
              esc(m.corto || m.label) + '</button>';
          }).join(''))}
        </div>

        <div id="sf-fija" hidden>
          <label class="tiny sup-lbl">A QUÉ HORA</label>
          <input type="time" id="sf-horafija" value="${dat.hora || '08:00'}">
        </div>
      </div>

      <div class="cb-acciones" style="margin-top:16px">
        <button class="btn primary grow btn-arranque" data-x="ok">
          ${raw(icon('check'))} Guardar</button>
        <button class="btn vidrio" data-x="no">Cancelar</button>
      </div>
      ${raw(esNuevo ? '' : '<button class="btn ghost block sm danger" data-x="borrar" ' +
        'style="margin-top:9px">Quitarlo de la lista</button>')}`,
      function (el) {
        /* Sin patrón por defecto: ponerle «cada 8 horas» de oficio era decidir
           por él y que se lo llevara sin haberlo elegido. */
        pintar(el);

        /* Un solo manejador por grupo: los botones se repintan al elegir, y
           enganchados uno a uno la primera elección se queda clavada. */
        const grupo = function (sel, attr, campo, num) {
          const caja = el.querySelector(sel);
          caja.onclick = function (ev) {
            const b = ev.target.closest('[data-' + attr + ']');
            if (!b) return;
            dat[campo] = num ? Number(b.dataset[attr]) : b.dataset[attr];
            caja.querySelectorAll('[data-' + attr + ']').forEach(function (x) {
              const suyo = num ? Number(x.dataset[attr]) : x.dataset[attr];
              x.classList.toggle('on', suyo === dat[campo]);
            });
            pintar(el);
          };
        };
        /* «Varias al día» no es una respuesta, es una pregunta: lo que hace
           falta saber es cómo se reparte. Se abría la ficha con «Cada 8 horas»
           puesto de oficio, y quien no se fijaba se lo llevaba sin haberlo
           elegido. Ahora pregunta en el momento. */
        const cajaF = el.querySelector('#sf-frec');
        cajaF.onclick = function (ev) {
          const b = ev.target.closest('[data-frec]');
          if (!b) return;
          const antes = dat.frecuencia;
          dat.frecuencia = b.dataset.frec;
          cajaF.querySelectorAll('[data-frec]').forEach(function (x) {
            x.classList.toggle('on', x.dataset.frec === dat.frecuencia);
          });
          pintar(el);

          if (dat.frecuencia === 'varias' && !dat.patron) {
            dat.nombre = (el.querySelector('#sf-nombre').value || '').trim();
            dat.dosis = (el.querySelector('#sf-dosis').value || '').trim();
            repartoSheet(dat, function (elegido) {
              /* Si se cierra sin elegir, la frecuencia vuelve a lo de antes:
                 dejarla en «varias» sin reparto es dejarla sin horas. */
              if (!elegido) dat.frecuencia = antes;
              fichaSheet(dat, esNuevo);
            });
          }
        };
        grupo('#sf-mom', 'mom', 'momento');
        grupo('#sf-semanal', 'dia', 'dia', true);

        el.querySelector('#sf-horafija').oninput = function () {
          dat.hora = el.querySelector('#sf-horafija').value;
        };
        el.querySelector('#sf-horainicio').oninput = function () {
          dat.hora = el.querySelector('#sf-horainicio').value;
        };

        /* La hoja del reparto reemplaza a esta —UI.modal solo tiene un sitio—,
           así que hay que guardar lo escrito antes de irse y volver a abrir la
           ficha al elegir. Sin esto, elegir el reparto cerraba el formulario
           entero y se perdía lo tecleado. */
        el.querySelector('[data-x=reparto]').onclick = function () {
          dat.nombre = (el.querySelector('#sf-nombre').value || '').trim();
          dat.dosis = (el.querySelector('#sf-dosis').value || '').trim();
          repartoSheet(dat, function () { fichaSheet(dat, esNuevo); });
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

  /* ---------- cómo se reparte en el día ----------
     En su propia hoja y no en más pastillas dentro de la ficha: son ocho
     opciones de tres familias distintas —las de reloj, las que van con tus
     comidas y las que pones a mano— y mezcladas en una fila de pastillas se
     leen como ocho cosas sueltas en vez de como tres maneras de repartir.

     Recibe el suplemento entero y no solo el patrón, porque la tercera familia
     necesita escribir horas dentro de él. Al cerrar avisa de si se eligió algo:
     quedarse en «varias veces al día» sin reparto es quedarse sin horas. */
  function repartoSheet(dat, alSalir) {
    let eligio = false;

    const filas = function (de) {
      return S().PATRONES.filter(function (p) { return p.de === de; })
        .map(function (p) {
          const horas = S().horasDe({ frecuencia: 'varias', patron: p.id,
            hora: dat.hora || '08:00', horasManuales: dat.horasManuales });
          const sub = p.de === 'manual'
            ? ((dat.horasManuales || []).length
                ? (dat.horasManuales || []).length + ' horas puestas'
                : 'Tú eliges las horas, una a una')
            : horas.length + (horas.length === 1 ? ' toma' : ' tomas') + ' al día · ' +
              horas.map(function (h) { return UI.hora ? UI.hora(h) : h; }).join(', ');
          return '<button class="opcion ' + (dat.patron === p.id ? 'on' : '') +
            '" data-pat="' + esc(p.id) + '" style="--tono:var(--acc)">' +
            '<span class="grow"><span class="op-nom">' + esc(p.label) + '</span>' +
            '<span class="op-sub">' + esc(sub) + '</span></span>' +
            '<span class="op-marca">' + icon('check') + '</span></button>';
        }).join('');
    };

    const listaHTML = function () {
      return '<div class="list-title" style="margin-top:12px">Por reloj</div>' +
        '<div class="opciones">' + filas('reloj') + '</div>' +
        '<p class="tiny" style="margin:7px 2px 0">Arrancan a la hora que elijas y se ' +
        'cortan en la cena: nadie quiere el magnesio a las tres de la mañana.</p>' +

        '<div class="list-title" style="margin-top:14px">Con tus comidas</div>' +
        '<div class="opciones">' + filas('comidas') + '</div>' +
        '<p class="tiny" style="margin:7px 2px 0">Salen de tus horas de comer, así que ' +
        'si mueves una comida la toma se mueve con ella.</p>' +

        '<div class="list-title" style="margin-top:14px">A mano</div>' +
        '<div class="opciones">' + filas('manual') + '</div>' +
        '<p class="tiny" style="margin:7px 2px 0">Para lo que no encaja en ningún patrón: ' +
        'lo que manda una receta, o los turnos de quien no come a las mismas horas.</p>';
    };

    /* El editor de horas vive en la misma hoja y no en una tercera: encadenar
       tres modales para poner dos horas es perder el sitio a cada paso. */
    const editorHTML = function () {
      const hs = (dat.horasManuales || []).slice().sort();
      return '<div class="list-title" style="margin-top:12px">Tus horas</div>' +
        (hs.length
          ? '<div class="row wrap sup-pills" id="rp-horas">' + hs.map(function (h) {
              return '<button class="chip on" data-quitar="' + esc(h) + '">' +
                esc(UI.hora ? UI.hora(h) : h) + ' ' + icon('close') + '</button>';
            }).join('') + '</div>'
          : '<p class="tiny" style="margin:2px 2px 0">Todavía ninguna. Añade la primera ' +
            'abajo.</p>') +
        '<div class="row" style="margin-top:11px;gap:8px">' +
        '<input type="time" id="rp-nueva" value="08:00" style="flex:1">' +
        '<button class="btn primary" data-x="add">' + icon('plus') + ' Añadir</button>' +
        '</div>' +
        '<button class="btn block" data-x="listo" style="margin-top:12px">' +
        icon('check') + ' Listo</button>' +
        '<button class="btn ghost block sm" data-x="volver" style="margin-top:7px">' +
        'Volver a los patrones</button>';
    };

    UI.modal(html`
      <div class="conf-disco cambio">${raw(icon('reloj'))}</div>
      <h2 class="conf-tit">¿Cómo lo repartes?</h2>
      <p class="muted conf-txt" id="rp-txt">Debajo de cada opción van las horas que salen
      con tus datos de ahora.</p>

      <div id="rp-caja"></div>`,
      function (el) {
        const caja = el.querySelector('#rp-caja');
        const txt = el.querySelector('#rp-txt');

        const pintarLista = function () {
          txt.textContent = 'Debajo de cada opción van las horas que salen con tus datos ' +
            'de ahora.';
          caja.innerHTML = listaHTML();
        };
        const pintarEditor = function () {
          txt.textContent = 'Añade cada hora a la que tomas esto. Se crea un recordatorio ' +
            'por cada una.';
          caja.innerHTML = editorHTML();
          const n = caja.querySelector('#rp-nueva');
          if (n) n.value = (dat.horasManuales || [])[0] ? '' : '08:00';
        };

        caja.onclick = function (ev) {
          const pat = ev.target.closest('[data-pat]');
          if (pat) {
            dat.patron = pat.dataset.pat;
            eligio = true;
            if (S().patronDe(dat.patron).de === 'manual') { pintarEditor(); return; }
            UI.closeModal();
            setTimeout(function () { alSalir(true); }, 180);
            return;
          }

          const quitar = ev.target.closest('[data-quitar]');
          if (quitar) {
            dat.horasManuales = (dat.horasManuales || []).filter(function (h) {
              return h !== quitar.dataset.quitar;
            });
            pintarEditor();
            return;
          }

          const b = ev.target.closest('[data-x]');
          if (!b) return;

          if (b.dataset.x === 'add') {
            const v = caja.querySelector('#rp-nueva').value;
            if (!v) { UI.toast('Elige una hora'); return; }
            dat.horasManuales = (dat.horasManuales || []).slice();
            if (dat.horasManuales.indexOf(v) === -1) dat.horasManuales.push(v);
            else UI.toast('Esa hora ya está');
            pintarEditor();
            return;
          }
          if (b.dataset.x === 'volver') { pintarLista(); return; }
          if (b.dataset.x === 'listo') {
            if (!(dat.horasManuales || []).length) { UI.toast('Añade al menos una hora'); return; }
            UI.closeModal();
            setTimeout(function () { alSalir(true); }, 180);
          }
        };

        /* Si ya venía con horas puestas a mano, se abre donde lo dejó */
        if (dat.patron === 'manual') pintarEditor(); else pintarLista();

        /* Cerrar con la X o el gesto cuenta como no haber elegido */
        const obs = new MutationObserver(function () {
          const caja2 = document.getElementById('modal');
          if (caja2 && caja2.hidden) { obs.disconnect(); if (!eligio) alSalir(false); }
        });
        const host = document.getElementById('modal');
        if (host) obs.observe(host, { attributes: true, attributeFilter: ['hidden'] });
      });
  }
})(window);
