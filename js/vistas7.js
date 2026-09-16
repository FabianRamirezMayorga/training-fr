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

  /* Plegada de entrada. La lista completa es para el día que se cambia algo, y
     eso pasa una vez al mes; lo que se mira a diario es la tarjeta de arriba.
     Con cinco botes desplegados había que pasar media pantalla para llegar a
     los recordatorios. Como render() repinta entero, el estado vive fuera. */
  let listaAbierta = false;
  let aportaAbierto = false;
  /* Se calcula solo al entrar, pero una sola vez por lista: si la IA falla y se
     reintenta en cada repintado, se gasta la clave en bucle sin que nadie haya
     pedido nada. El fallo se recuerda por huella, así que cambiar un bote vuelve
     a darle una oportunidad. */
  let calculando = false;
  let falloEn = '';

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
     esto es para acordarse, no un diario de cumplimiento.

     Va agrupado por bote y no por toma: con un magnesio cada seis horas salían
     tres renglones que decían «Magnesio» tres veces.

     Y TODAS LAS FILAS IGUALES. Se probó a poner la hora al lado cuando era una
     sola y debajo cuando eran varias, y quedaba un escalonado horrible: cada
     fila con la hora en un sitio distinto obliga a buscarla en cada renglón. El
     formato lo decide la tarjeta entera, no cada fila: si ninguno se toma varias
     veces, todas llevan la hora al lado; en cuanto uno la lleva debajo, la
     llevan todas. Se pierde alto en un caso y se gana en poder leer la columna
     de un vistazo, que es para lo que está. */
  function hoyHTML() {
    const l = S().lista().filter(function (x) { return S().tocaHoy(x); })
      .map(function (x) { return { sup: x, horas: S().horasDe(x) }; })
      .sort(function (a, b) {
        return Alertas.enMinutos(a.horas[0]) - Alertas.enMinutos(b.horas[0]);
      });

    if (!l.length) {
      return html`
        <div class="list-title">Que no se te olvide</div>
        <div class="card sup-hoy2 vacia">
          <p class="tiny" style="margin:0">Hoy no toca ninguno. Los de «los días que
          entreno» y «un día sí y otro no» se saltan solos.</p>
        </div>`;
    }

    const tomas = l.reduce(function (n, x) { return n + x.horas.length; }, 0);
    const alLado = l.every(function (x) { return x.horas.length === 1; });

    return html`
      <div class="list-head">
        <span class="list-title">Que no se te olvide</span>
        <span class="sh-cuenta">${tomas} ${tomas === 1 ? 'toma' : 'tomas'}</span>
      </div>

      <div class="card sup-hoy2 ${alLado ? 'al-lado' : 'debajo'}">
        ${raw(l.map(function (x) {
          return '<div class="sh-linea">' +
            '<span class="sl-cab"><span class="sl-n">' + esc(x.sup.nombre) + '</span>' +
            (x.sup.dosis ? '<span class="sl-d">' + esc(x.sup.dosis) + '</span>' : '') +
            '</span>' +
            '<span class="sl-h">' + x.horas.map(function (h) {
              return esc(UI.hora ? UI.hora(h) : h);
            }).join('<i>·</i>') + '</span></div>';
        }).join(''))}
      </div>`;
  }

  /* ---------- lo que suman a tu día ----------
     Estaba dentro de la tarjeta de arriba y era un número mal calculado: la app
     sumaba a mano las fichas del catálogo, así que no contaba lo que uno
     escribe a mano ni decía nada de vitaminas o minerales, que es justo para lo
     que se toma un multivitamínico. Un total incompleto presentado como total
     es peor que ninguno.

     Ahora lo calcula el entrenador, va fuera y plegado —es una consulta, no
     algo que haga falta ver cada vez que se abre la pantalla— y lo que
     devuelve entra en el menú, que es lo que hacía falta para que no te pida
     otra vez la proteína que ya te bebiste. */
  function aportanHTML() {
    if (!S().lista().length) return '';
    const a = S().analisis();
    const hayIA = g.IA && IA.activa && IA.activa();

    return html`
      <details class="sup-plegable menor" ${raw(aportaAbierto ? 'open' : '')}
               data-det="aporta">
        <summary>
          <span class="grow">Lo que suman a tu día</span>
          ${raw(a ? '<span class="sp-cuantos">' + a.kcal + ' kcal</span>'
            : calculando ? '<span class="sp-cargando">calculando…</span>'
              : '<span class="sp-falta">sin calcular</span>')}
          <span class="sp-flecha">${raw(icon('chevron'))}</span>
        </summary>

        <div class="sup-aportan">
          ${raw(a ? html`
            <div class="sa-nums">
              ${raw([['kcal', a.kcal, ''], ['proteína', a.prot, 'g'],
                ['hidratos', a.carbo, 'g'], ['grasa', a.grasa, 'g']]
                .map(function (n) {
                  return '<span class="sa-n"><b>' + UI.num(n[1]) + '<i>' + n[2] +
                    '</i></b><span>' + n[0] + '</span></span>';
                }).join(''))}
            </div>
            ${raw(a.cubre ? '<p class="tiny"><b>Cubre.</b> ' + esc(a.cubre) + '</p>' : '')}
            ${raw(a.horario ? '<p class="tiny"><b>Horarios.</b> ' + esc(a.horario) + '</p>' : '')}
            ${raw(a.solapa ? '<p class="tiny"><b>Se pisan.</b> ' + esc(a.solapa) + '</p>' : '')}
            ${raw(a.menu ? '<p class="tiny"><b>En tu menú.</b> ' + esc(a.menu) + '</p>' : '')}
            ${raw(a.dudas ? '<p class="tiny"><b>Sin calcular.</b> ' + esc(a.dudas) + '</p>' : '')}
            <p class="tiny sa-pie">Lo ha calculado el entrenador con tu lista, no es una
            suma del catálogo. Ya está contado en tu menú: no te pedirá en comida lo que
            estos te dan.</p>
            <button class="btn sm block" data-a="analizar" style="margin-top:10px">
              ${raw(icon('cambiar'))} Volver a calcularlo</button>` : calculando ? html`
            <p class="tiny" style="margin:0">Calculando lo que suman, con lo que tienes
            apuntado…</p>` : html`
            <p class="tiny" style="margin:0 0 10px">Sumar esto a mano sale mal: no cuenta
            lo que escribes tú, ni las vitaminas ni los minerales. Lo calcula el
            entrenador, y lo que salga se descuenta solo de tu menú.</p>
            <button class="btn sm primary block" data-a="analizar" ${raw(hayIA ? '' : 'disabled')}>
              ${raw(icon('chispa'))} ${raw(hayIA ? 'Calcularlo ahora' : 'Calcularlo')}</button>
            ${raw(hayIA ? '' : '<p class="tiny" style="margin:8px 0 0">Necesita el ' +
              'entrenador con IA configurado, en Perfil.</p>')}`)}
        </div>
      </details>`;
  }

  V.suplementos = function () {
    if (!g.Suplementos) return '<div class="empty"><p>Módulo no disponible.</p></div>';

    const l = S().lista();
    const desfase = S().alertasDesfasadas();

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <h1>Suplementos</h1>
      <p class="muted">Lo que tomas, cuánto y cuándo. Con esto la app te crea las alertas
      sola, deja de proponerte en el menú lo que ya tomas y cuenta lo que aportan.</p>

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

        ${raw(hoyHTML())}

        ${raw(aportanHTML())}

        <!-- Plegable y cerrada de entrada: lo que se mira a diario es la
             tarjeta de arriba, y la lista completa es para el día que se cambia
             algo. El botón de añadir se queda fuera: si estuviera dentro,
             plegada no habría manera de añadir nada. -->
        <details class="sup-plegable" ${raw(listaAbierta ? 'open' : '')}>
          <summary>
            <span class="grow">Lo que tomas</span>
            <span class="sp-cuantos">${l.length}</span>
            <span class="sp-flecha">${raw(icon('chevron'))}</span>
          </summary>
          <!-- Por hora y no por orden de alta: la lista se lee como la agenda
               del día, y con cuatro botes el orden en que los apuntaste no le
               importa a nadie. -->
          <div class="sup-lista">
            ${raw(l.slice().sort(function (a, b) {
              return Alertas.enMinutos(S().horasDe(a)[0]) -
                Alertas.enMinutos(S().horasDe(b)[0]);
            }).map(filaHTML).join(''))}
          </div>
        </details>

        <button class="btn block" data-a="nuevo" style="margin-top:12px">
          ${raw(icon('plus'))} Añadir otro</button>

        <div class="list-title">Alertas</div>
        <div class="card">
          <p class="muted" style="margin:0 0 12px;font-size:.88rem">Se crean con el nombre y
          la dosis puestos, y a la hora que salga de cada momento. Si cambias las horas de
          tus comidas o los días de tu plan, vuelve aquí y se rehacen.</p>

          ${raw(desfase ? html`
            <div class="cal-viejo" style="margin-bottom:12px">
              <span class="cv-ico">${raw(icon('aviso'))}</span>
              <span class="grow"><b>Tus alertas no coinciden</b>
              <span class="tiny">Has cambiado suplementos, horas de comer o días de
              entreno desde la última vez.</span></span>
            </div>` : '')}

          <button class="btn ${desfase ? 'primary' : ''} block" data-a="sincronizar">
            ${raw(icon('campana'))} ${raw(S().hayAlertas()
              ? 'Rehacer las alertas' : 'Crear alertas')}</button>
          <p class="tiny" style="margin-top:8px">Solo toca las de suplementos: las alertas
          que hayas creado tú se quedan como están.</p>
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

    root.querySelectorAll('.sup-plegable').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.dataset.det !== 'aporta') { listaAbierta = d.open; return; }
        aportaAbierto = d.open;
        /* Abrirlo es pedirlo. Si al entrar no se pudo calcular —sin conexión, o
           la IA falló— quedarse mirando un bloque vacío no lleva a ningún
           sitio: el gesto de desplegarlo ya dice que se quiere ver, así que se
           vuelve a intentar ahí mismo. */
        if (d.open && !S().analisis() && !calculando &&
          g.IA && IA.activa && IA.activa()) {
          pedirAnalisis(false);
        }
      });
    });

    bind(root, '[data-a=analizar]', function () { pedirAnalisis(true); });

    /* Nada más entrar, si hay algo que contar y no está contado. Nadie va a
       tocar un botón para que le cuadren los números de su menú: o se hace
       solo, o no se hace. */
    const l = S().lista();
    if (l.length && !S().analisis() && !calculando &&
      falloEn !== S().resumenIA() && g.IA && IA.activa && IA.activa()) {
      pedirAnalisis(false);
    }

    bind(root, '[data-a=sincronizar]', function () {
      const n = S().sincronizarAlertas();
      render();
      UI.toast(n ? n + (n === 1 ? ' alerta lista' : ' alertas listas')
        : 'No hay nada que recordar');
    });
  };

  function pedirAnalisis(aMano) {
    if (!g.IA || !IA.analizarSuplementos || calculando) return;
    calculando = true;
    render();
    IA.analizarSuplementos({ forzar: !!aMano })
      .then(function () {
        calculando = false;
        if (aMano) aportaAbierto = true;
        render();
      })
      .catch(function (e) {
        calculando = false;
        falloEn = S().resumenIA();
        render();
        if (aMano) UI.toast(e.message || 'No he podido calcularlo');
      });
  }

  /* ---------- elegir del catálogo ----------
     Doce filas de lista para elegir un bote era tratar un catálogo como si
     fuera configuración. En rejilla se ve todo casi de una vez y se elige
     señalando, que es lo que de verdad se hace aquí.

     Y sin la dosis debajo. Era información de más en el momento equivocado: al
     elegir se está decidiendo QUÉ, no cuánto —eso se ajusta en el paso
     siguiente—, y una segunda línea en cada ficha las hacía el doble de altas
     para decir algo que nadie lee ahí. Lo que sí ayuda es el dibujo de en qué
     viene: en una rejilla de doce nombres, distinguir el bote del blíster pasa
     antes de leer. */
  function elegirSheet() {
    const ya = {};
    S().lista().forEach(function (x) { if (x.cat) ya[x.cat] = 1; });

    UI.modal(html`
      <div class="conf-disco cambio">${raw(icon('bote'))}</div>
      <h2 class="conf-tit">Añadir suplemento</h2>
      <p class="muted conf-txt">Elige cuál y en el paso siguiente pones la dosis, cada
      cuánto y a qué hora.</p>

      <div class="sup-rejilla">
        ${raw(S().CATALOGO.filter(function (c) { return c.id !== 'otro'; })
          .map(function (c) {
            const f = S().FORMAS[c.forma] || S().FORMAS.polvo;
            return '<button class="sup-chip' + (ya[c.id] ? ' ya' : '') +
              '" data-cat="' + esc(c.id) + '">' +
              '<span class="sc-ico">' + icon(f.icono) + '</span>' +
              '<span class="sc-nom">' + esc(c.nombre) + '</span>' +
              (ya[c.id] ? '<span class="sc-ya">' + icon('check') + '</span>' : '') +
              '</button>';
          }).join(''))}
      </div>

      <!-- Fuera de la rejilla y con su propio color: no es un suplemento más de
           la lista, es la salida para lo que no está en ella. Dentro y con
           borde de puntos se perdía entre los doce, y en claro no se veía. -->
      <button class="sup-otro" data-cat="otro">
        <span class="so-ico">${raw(icon('plus'))}</span>
        <span class="grow"><b>Otro</b><i>El tuyo no está: lo escribes tú</i></span>
        <span class="chevron">${raw(icon('chevron'))}</span>
      </button>`,
      function (el) {
        el.onclick = function (ev) {
          const b = ev.target.closest('[data-cat]');
          if (!b) return;
          const c = S().delCatalogo(b.dataset.cat);
          UI.closeModal();
          setTimeout(function () {
            fichaSheet(S().nuevo({
              cat: c.id === 'otro' ? '' : c.id,
              nombre: c.id === 'otro' ? '' : c.nombre,
              forma: c.forma || 'polvo',
              dosisN: c.dosisN || 1,
              dosisU: c.dosisU || 'toma',
              momento: c.momento || 'con:desayuno',
              aporta: c.aporta || null
            }), true);
          }, 180);
        };
      });
  }

  /* ---------- cuánto ----------
     Era una caja de texto donde había que escribir «1 cápsula» a mano, y eso
     daba «1 capsula», «una cápsula», «1 cap» y «1cápsula» en la misma lista.
     Ahora es un número y una unidad de una lista cerrada: se toca dos veces y
     lo que se guarda siempre se escribe igual.

     Las unidades que salen las manda la forma del suplemento: ofrecerle gramos
     a alguien para su omega 3 es pedirle que pese una perla de aceite. Están
     todas, pero primero las que tienen sentido. */
  function dosisSheet(dat, alElegir) {
    let n = Number(dat.dosisN) || 1;
    let u = dat.dosisU || 'toma';

    const paso = function () { return S().unidadDe(u).paso || 1; };
    const enCasa = function (x) { return Math.max(paso(), Math.min(999, x || paso())); };
    const escrito = function (x) { return String(Math.round(x * 10) / 10).replace('.', ','); };

    /* `escribe` manda cuándo se toca el campo. Con los botones sí, porque el
       número lo cambian ellos; mientras se teclea no, porque reescribirlo a
       cada tecla mueve el cursor al final y convierte «15» en «51». */
    const pintar = function (el, escribe) {
      const campo = el.querySelector('#do-num');
      if (escribe) campo.value = escrito(n);
      el.querySelector('#do-uni').textContent = S().unidadDe(u)[n === 1 ? 'sing' : 'plur'];
      el.querySelectorAll('[data-uni]').forEach(function (x) {
        const suya = x.dataset.uni === u;
        x.classList.toggle('on', suya);
        x.setAttribute('aria-checked', suya ? 'true' : 'false');
      });
      el.querySelector('[data-d=menos]').disabled = n <= paso();
    };

    UI.modal(html`
      <div class="conf-disco cambio">${raw(icon('polvo'))}</div>
      <h2 class="conf-tit">¿Cuánto tomas?</h2>
      <p class="muted conf-txt">De una vez. Si lo repartes en el día, eso se dice
      después.</p>

      <!-- El número se escribe además de subirlo y bajarlo. Con el más y el
           menos solos, poner 30 g de proteína son veintinueve toques, y a quien
           le cueste apuntar al botón le cuestan veintinueve. Es un campo de
           texto y no un <input type=number> a propósito: así no salen las
           flechitas del navegador encima del número, y el teclado que abre el
           móvil es el de cifras con coma, que es como se escriben las dosis. -->
      <div class="do-caja">
        <button class="do-pm" data-d="menos" aria-label="Menos">${raw(icon('menos'))}</button>
        <span class="do-val">
          <input id="do-num" class="do-num" type="text" inputmode="decimal"
                 value="1" maxlength="5" autocomplete="off" aria-label="Cuánto tomas">
          <i id="do-uni">toma</i>
        </span>
        <button class="do-pm" data-d="mas" aria-label="Más">${raw(icon('plus'))}</button>
      </div>

      <div class="list-title" style="margin-top:16px" id="do-tit">En qué se mide</div>
      <div class="list do-unidades" role="radiogroup" aria-labelledby="do-tit">
        ${raw(S().UNIDADES.map(function (x) {
          return '<button class="list-row tap do-uni" role="radio" aria-checked="false"' +
            ' data-uni="' + esc(x.id) + '">' +
            '<span class="grow"><span class="list-row-title">' + esc(x.lista) +
            '</span></span><span class="do-marca">' + icon('check') + '</span></button>';
        }).join(''))}
      </div>

      <div class="cb-acciones" style="margin-top:16px">
        <button class="btn primary grow btn-arranque" data-d="ok">
          ${raw(icon('check'))} Listo</button>
        <button class="btn vidrio" data-d="no">Cancelar</button>
      </div>`,
      function (el) {
        const campo = el.querySelector('#do-num');
        pintar(el, true);

        /* Al entrar, todo seleccionado: se viene a poner otra cantidad, no a
           añadirle cifras a la que había. */
        campo.onfocus = function () { setTimeout(function () { campo.select(); }, 0); };

        campo.oninput = function () {
          const v = parseFloat(String(campo.value).replace(',', '.'));
          n = isNaN(v) ? 0 : Math.min(999, Math.abs(v));
          pintar(el, false);
        };

        /* Al salir se cuadra: vacío, cero o algo que no es un número vuelve al
           mínimo de esa unidad, y se reescribe con el formato de la app. */
        campo.onblur = function () { n = enCasa(n); pintar(el, true); };

        campo.onkeydown = function (ev) {
          if (ev.key === 'Enter') { ev.preventDefault(); campo.blur(); }
        };

        el.onclick = function (ev) {
          const uni = ev.target.closest('[data-uni]');
          if (uni) {
            u = uni.dataset.uni;
            /* Cambiar de unidad cambia el paso, y 1 ml con paso de cinco se
               queda descolgado del más y el menos. */
            n = enCasa(n);
            pintar(el, true);
            return;
          }

          const b = ev.target.closest('[data-d]');
          if (!b) return;
          if (b.dataset.d === 'mas') { n = enCasa(n) + paso(); n = Math.min(999, n); pintar(el, true); return; }
          if (b.dataset.d === 'menos') { n = Math.max(paso(), enCasa(n) - paso()); pintar(el, true); return; }
          if (b.dataset.d === 'no') { UI.closeModal(); alElegir(false); return; }
          if (b.dataset.d === 'ok') {
            n = enCasa(n);
            dat.dosisN = n;
            dat.dosisU = u;
            dat.dosis = S().textoDosis(n, u);
            UI.closeModal();
            setTimeout(function () { alElegir(true); }, 180);
          }
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
    const DIAS = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      return [d, UI.inicialDia(d)];
    });

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

      el.querySelectorAll('.sf-horatxt').forEach(function (x) {
        x.textContent = UI.hora ? UI.hora(dat.hora || '08:00') : (dat.hora || '08:00');
      });
    };

    UI.modal(html`
      <div class="conf-disco cambio">${raw(icon('bote'))}</div>
      <h2 class="conf-tit">${esNuevo ? 'Nuevo suplemento' : dat.nombre || 'Suplemento'}</h2>

      <label class="sup-campo" style="display:block">
        <span>Nombre</span>
        <input id="sf-nombre" value="${dat.nombre}" placeholder="Creatina" autocomplete="off">
      </label>

      <label class="tiny sup-lbl">CUÁNTO</label>
      <button class="sup-reparto dosis" data-x="dosis">
        <span class="grow" id="sf-dosistxt">${dat.dosis || 'Elige la dosis'}</span>
        <span class="chevron">${raw(icon('chevron'))}</span>
      </button>

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
          <button class="sup-reparto" data-x="hora">
            <span class="grow sf-horatxt"></span>
            <span class="chevron">${raw(icon('chevron'))}</span>
          </button>
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

        <!-- La misma rueda que el resto de la app, y no el campo de hora del
             navegador: aqui es donde se pone una hora a mano, asi que se pone
             como se ponen las horas en todas partes. -->
        <div id="sf-fija" hidden>
          <label class="tiny sup-lbl">A QUÉ HORA</label>
          <button class="sup-reparto" data-x="hora">
            <span class="grow sf-horatxt"></span>
            <span class="chevron">${raw(icon('chevron'))}</span>
          </button>
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

        el.querySelectorAll('[data-x=hora]').forEach(function (b) {
          b.onclick = function () {
            dat.nombre = (el.querySelector('#sf-nombre').value || '').trim();
            const fija = S().momentoDe(dat.momento).de === 'fija' &&
              dat.frecuencia !== 'varias';
            horaSheet(dat.hora || '08:00',
              fija ? '¿A qué hora?' : '¿A qué hora empiezas?',
              fija ? 'La que tú digas. Es el único momento que no depende de tus ' +
                'comidas ni de tu entreno.'
                : 'De ahí salen las demás, contando hacia delante y cortando en la cena.',
              function (h) {
                if (h) dat.hora = h;
                fichaSheet(dat, esNuevo);
              });
          };
        });

        /* La hoja del reparto reemplaza a esta —UI.modal solo tiene un sitio—,
           así que hay que guardar lo escrito antes de irse y volver a abrir la
           ficha al elegir. Sin esto, elegir el reparto cerraba el formulario
           entero y se perdía lo tecleado. */
        el.querySelector('[data-x=dosis]').onclick = function () {
          dat.nombre = (el.querySelector('#sf-nombre').value || '').trim();
          dosisSheet(dat, function () { fichaSheet(dat, esNuevo); });
        };

        el.querySelector('[data-x=reparto]').onclick = function () {
          dat.nombre = (el.querySelector('#sf-nombre').value || '').trim();
          repartoSheet(dat, function () { fichaSheet(dat, esNuevo); });
        };

        el.querySelector('[data-x=no]').onclick = function () { UI.closeModal(); };

        const borrarB = el.querySelector('[data-x=borrar]');
        if (borrarB) {
          borrarB.onclick = function () {
            UI.closeModal();
            UI.confirm('Quitar ' + (dat.nombre || 'el suplemento'),
              'Se va de la lista, de las cuentas y de sus alertas. Si compartía hora con ' +
              'otro, esa alerta se queda con el que sigues tomando.',
              'Quitar', true).then(function (ok) {
              if (!ok) return;
              S().borrar(dat.id);
              render();
              UI.toast('Quitado');
            });
          };
        }

        el.querySelector('[data-x=ok]').onclick = function () {
          dat.nombre = (el.querySelector('#sf-nombre').value || '').trim();
          if (!dat.nombre) { UI.toast('Ponle nombre'); return; }
          S().guardar(dat);
          UI.closeModal();
          render();
          UI.toast(esNuevo ? dat.nombre + ' añadido' : 'Guardado');
        };
      });
  }

  /* ---------- cómo se reparte en el día ----------
     Ocho opciones de tres familias distintas puestas una debajo de otra se leen
     como ocho cosas sueltas, y había que bajar por todas para ver la última.
     Ahora se pregunta primero POR DÓNDE: reloj, comidas o a mano. Dentro de
     cada una solo están las suyas, con las horas que salen con tus datos.

     Recibe el suplemento entero y no solo el patrón, porque la tercera familia
     necesita escribir horas dentro de él. Al cerrar avisa de si se eligió algo:
     quedarse en «varias veces al día» sin reparto es quedarse sin horas. */
  const FAMILIAS = [
    { de: 'reloj', ico: 'reloj', nom: 'Por reloj',
      sub: 'Cada 4, 6, 8 o 12 horas',
      pie: 'Arrancan a la hora que elijas y se cortan en la cena: nadie quiere el ' +
        'magnesio a las tres de la mañana.' },
    { de: 'comidas', ico: 'nutricion', nom: 'Con tus comidas',
      sub: 'Antes, con o después de cada una',
      pie: 'Salen de tus horas de comer, así que si mueves una comida la toma se ' +
        'mueve con ella.' },
    { de: 'manual', ico: 'edit', nom: 'A mano',
      sub: 'Pones tú cada hora, una a una',
      pie: 'Para lo que no encaja en ningún patrón: lo que manda una receta, o los ' +
        'turnos de quien no come a las mismas horas.' }
  ];

  /* ---------- la rueda de la hora ----------
     Era un <input type="time">. En el móvil abre la rueda del sistema, que está
     bien, pero en un panel que existe solo para poner horas la rueda es el
     panel: se ve lo que hay arriba y abajo de la hora elegida, se gira con el
     dedo y no tapa lo que se estaba mirando.

     Se guarda «HH:MM» de 24 h como en todo el resto, pero se enseña como lo
     enseñe el teléfono: quien lo tenga en a. m./p. m. ve doce horas y la
     columna de a. m./p. m., y quien lo tenga en 24 h ve veinticuatro y ninguna
     columna de más. */
  const RD_ALTO = 40;

  const DOCE = (function () {
    try {
      return /[ap]/i.test(new Date(2020, 0, 1, 13, 0)
        .toLocaleTimeString([], { hour: 'numeric' }));
    } catch (e) { return false; }
  })();

  function rdMarca(h) {
    try {
      return new Date(2020, 0, 1, h, 0).toLocaleTimeString([], { hour: 'numeric' })
        .replace(/[0-9]/g, '').replace(/[\u202f\u00a0]/g, ' ').trim() ||
        (h < 12 ? 'AM' : 'PM');
    } catch (e) { return h < 12 ? 'AM' : 'PM'; }
  }

  /* 12, 1, 2… como en el reloj de verdad, no 0, 1, 2. La cifra que sale en la
     rueda es la que sale en la pantalla del móvil. */
  const RD_HORAS = DOCE
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const RD_MINS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const RD_AP = [rdMarca(9), rdMarca(21)];

  function dosCifras(n) { return (n < 10 ? '0' : '') + n; }

  function aRueda(hhmm) {
    const m = String(hhmm || '08:00').match(/^(\d{1,2}):(\d{2})/) || [0, 8, 0];
    const H = Number(m[1]) || 0;
    const M = Number(m[2]) || 0;
    return {
      h: DOCE ? (H % 12) : H,
      m: Math.round(M / 5) % 12,
      ap: H >= 12 ? 1 : 0
    };
  }

  function deRueda(r) {
    const H = DOCE ? ((r.h % 12) + (r.ap ? 12 : 0)) : r.h;
    return dosCifras(H) + ':' + dosCifras(RD_MINS[r.m]);
  }

  /* Montar la rueda es ponerla donde toca y encender el desvanecido. Vive
     fuera de las hojas porque la usan dos: la de «a qué hora» y la de las horas
     a mano. */
  function montarRueda(caja, r) {
    caja.querySelectorAll('.rd-col').forEach(function (col) {
      const id = col.dataset.col;
      col.scrollTop = r[id] * RD_ALTO;
      relieve(col);

      /* La cifra elegida se apunta en el mismo momento del scroll, no dentro
         del requestAnimationFrame. Estaba dentro, y el rAF no corre con la
         pantalla apagada o la app en segundo plano: bastaba con que el movil
         se bloqueara a media rueda para que el `if (t) return` se quedara
         encallado y a partir de ahi la rueda girara sin cambiar la hora. Lo
         que se difiere es solo el desvanecido, que es pintar. */
      let t = 0;
      col.addEventListener('scroll', function () {
        r[id] = Math.max(0, Math.min(col.children.length - 1,
          Math.round(col.scrollTop / RD_ALTO)));
        if (t) return;
        t = requestAnimationFrame(function () { t = 0; relieve(col); });
      });
    });
  }

  /* La hora buena se lee de la rueda en el momento de confirmarla, y no de lo
     que fueran apuntando los eventos de scroll. Apuntarlos no basta: el evento
     se entrega cuando el navegador pinta, y con la app en segundo plano o la
     pantalla apagada a media rueda el ultimo no llega nunca. Entonces la rueda
     se quedaba en una hora y se guardaba otra, que es la peor clase de fallo:
     el que no se ve. La posicion en la que esta parada cada columna, en cambio,
     siempre es verdad. */
  function leerRueda(caja, r) {
    const fin = { h: r.h, m: r.m, ap: r.ap };
    caja.querySelectorAll('.rd-col').forEach(function (col) {
      fin[col.dataset.col] = Math.max(0, Math.min(col.children.length - 1,
        Math.round(col.scrollTop / RD_ALTO)));
    });
    return fin;
  }

  /* El desvanecido de arriba y abajo no es adorno: es lo que dice cuál está en
     el centro cuando dos cifras seguidas se parecen. */
  function relieve(col) {
    const c = col.scrollTop / RD_ALTO;
    const ops = col.children;
    for (let i = 0; i < ops.length; i++) {
      const d = Math.min(3, Math.abs(i - c));
      ops[i].style.opacity = String(Math.max(.22, 1 - d * .3));
      ops[i].style.transform = 'scale(' + (1 - d * .1).toFixed(3) + ')';
    }
  }

  /* Girar la rueda con el dedo funciona solo, pero un clic en una cifra de
     arriba o de abajo también la trae al centro: con ratón, y para quien no
     arrastre bien, arrastrar una columna de doce es la parte difícil. */
  function ruedaClic(ev) {
    const op = ev.target.closest('.rd-op');
    if (!op) return false;
    op.parentNode.scrollTo({ top: Number(op.dataset.i) * RD_ALTO, behavior: 'smooth' });
    return true;
  }

  /* ---------- a qué hora ----------
     Una hoja con la rueda y nada más, para las horas sueltas de la ficha: la
     de «hora puntual» y la de «empezando a las». Eran dos <input type="time">,
     que en el móvil abren la rueda del sistema encima de todo y tapan la ficha
     entera justo cuando hay que mirarla. */
  function horaSheet(valor, titulo, texto, alElegir) {
    const r = aRueda(valor || '08:00');

    UI.modal(html`
      <div class="conf-disco cambio">${raw(icon('reloj'))}</div>
      <h2 class="conf-tit">${titulo}</h2>
      <p class="muted conf-txt">${texto}</p>

      ${raw(ruedaHTML(r))}

      <div class="cb-acciones" style="margin-top:16px">
        <button class="btn primary grow btn-arranque" data-h="ok">
          ${raw(icon('check'))} Listo</button>
        <button class="btn vidrio" data-h="no">Cancelar</button>
      </div>`,
      function (el) {
        montarRueda(el, r);
        el.onclick = function (ev) {
          if (ruedaClic(ev)) return;
          const b = ev.target.closest('[data-h]');
          if (!b) return;
          const elegida = b.dataset.h === 'ok' ? deRueda(leerRueda(el, r)) : null;
          UI.closeModal();
          setTimeout(function () { alElegir(elegida); }, 180);
        };
      });
  }

  function ruedaHTML(r) {
    const col = function (id, valores, sel, ancho) {
      return '<div class="rd-col" data-col="' + id + '" style="--ancho:' + ancho + '">' +
        valores.map(function (v, i) {
          return '<button class="rd-op' + (i === sel ? ' aqui' : '') +
            '" data-col="' + id + '" data-i="' + i + '">' + esc(String(v)) + '</button>';
        }).join('') + '</div>';
    };
    return '<div class="rueda" id="rp-rueda">' +
      '<div class="rd-banda"></div>' +
      col('h', RD_HORAS, r.h, '2.1em') +
      '<span class="rd-dos">:</span>' +
      col('m', RD_MINS.map(dosCifras), r.m, '2.1em') +
      (DOCE ? col('ap', RD_AP, r.ap, '3.2em') : '') +
      '</div>';
  }

  function repartoSheet(dat, alSalir) {
    let eligio = false;
    let dentro = '';
    const rueda = aRueda('08:00');

    const horasDelPatron = function (id) {
      return S().horasDe({ frecuencia: 'varias', patron: id,
        hora: dat.hora || '08:00', horasManuales: dat.horasManuales });
    };

    /* ---------- el primer panel: por dónde ----------
       «A mano» se quitó una versión por parecerse a «hora puntual», y volvió:
       no son lo mismo. «Hora puntual» es UNA hora para algo que se toma una
       vez al día; «a mano» son VARIAS horas sueltas que no siguen ningún
       patrón. Sin él, dos tomas a las 7 y a las 22 había que apuntarlas como
       dos suplementos distintos con el mismo nombre. */
    const familiasHTML = function () {
      const suya = dat.patron ? S().patronDe(dat.patron).de : '';
      return '<div class="opciones" style="margin-top:14px">' +
        FAMILIAS.map(function (f) {
          let sub = f.sub;
          if (suya === f.de && f.de !== 'manual') {
            const hs = horasDelPatron(dat.patron);
            sub = S().patronDe(dat.patron).label + ' · ' +
              hs.map(function (h) { return UI.hora ? UI.hora(h) : h; }).join(', ');
          } else if (f.de === 'manual' && (dat.horasManuales || []).length) {
            sub = (dat.horasManuales || []).slice().sort().map(function (h) {
              return UI.hora ? UI.hora(h) : h;
            }).join(', ');
          }
          return '<button class="opcion ' + (suya === f.de ? 'on' : '') +
            '" data-fam="' + esc(f.de) + '" style="--tono:var(--acc)">' +
            '<span class="op-ico">' + icon(f.ico) + '</span>' +
            '<span class="grow"><span class="op-nom">' + esc(f.nom) + '</span>' +
            '<span class="op-sub">' + esc(sub) + '</span></span>' +
            /* Sin el visto redondo de las otras listas: aqui la fila se abre,
               y el visto mas la flecha mas el subtitulo con las horas dejaba el
               nombre en dos renglones. Que esta elegida ya lo dicen el tinte y
               el propio subtitulo, que en vez de la promesa ensena las horas. */
            '<span class="op-flecha">' + icon('chevron') + '</span></button>';
        }).join('') + '</div>';
    };

    /* ---------- dentro de una familia ---------- */
    const dentroHTML = function (de) {
      const f = FAMILIAS.filter(function (x) { return x.de === de; })[0];
      return atrasHTML() +
        '<div class="opciones" style="margin-top:12px">' +
        S().PATRONES.filter(function (p) { return p.de === de; }).map(function (p) {
          const hs = horasDelPatron(p.id);
          return '<button class="opcion ' + (dat.patron === p.id ? 'on' : '') +
            '" data-pat="' + esc(p.id) + '" style="--tono:var(--acc)">' +
            '<span class="grow"><span class="op-nom">' + esc(p.label) + '</span>' +
            '<span class="op-sub">' + esc(hs.length +
              (hs.length === 1 ? ' toma' : ' tomas') + ' al día · ' +
              hs.map(function (h) { return UI.hora ? UI.hora(h) : h; }).join(', ')) +
            '</span></span>' +
            '<span class="op-marca">' + icon('check') + '</span></button>';
        }).join('') + '</div>' +
        '<p class="tiny" style="margin:9px 2px 0">' + esc(f.pie) + '</p>';
    };

    /* ---------- a mano: la rueda ---------- */
    const manualHTML = function () {
      const hs = (dat.horasManuales || []).slice().sort();
      return atrasHTML() +
        ruedaHTML(rueda) +
        '<button class="btn primary block" data-x="add" style="margin-top:14px">' +
        icon('plus') + ' Añadir esta hora</button>' +

        '<div class="list-title" style="margin-top:16px">Tus horas' +
        (hs.length ? ' <span class="rd-cuenta">' + hs.length + '</span>' : '') + '</div>' +
        (hs.length
          ? '<div class="row wrap sup-pills" style="margin-top:7px">' + hs.map(function (h) {
              return '<button class="chip on" data-quitar="' + esc(h) + '">' +
                esc(UI.hora ? UI.hora(h) : h) + ' ' + icon('close') + '</button>';
            }).join('') + '</div>'
          : '<p class="tiny" style="margin:4px 2px 0">Todavía ninguna. Gira la rueda y ' +
            'añade la primera.</p>') +

        '<button class="btn block btn-arranque" data-x="listo" style="margin-top:16px">' +
        icon('check') + ' Listo</button>';
    };

    const atrasHTML = function () {
      return '<button class="rp-atras" data-x="atras">' + icon('back') +
        ' Cómo lo repartes</button>';
    };

    UI.modal(html`
      <div class="conf-disco cambio" id="rp-disco">${raw(icon('reloj'))}</div>
      <h2 class="conf-tit" id="rp-tit">¿Cómo lo repartes?</h2>
      <p class="muted conf-txt" id="rp-txt">Tres maneras. Elige una y dentro verás las
      horas que salen con tus datos de ahora.</p>

      <div id="rp-caja"></div>`,
      function (el) {
        const caja = el.querySelector('#rp-caja');
        const disco = el.querySelector('#rp-disco');
        const tit = el.querySelector('#rp-tit');
        const txt = el.querySelector('#rp-txt');

        const cabecera = function (ico, t, p) {
          disco.innerHTML = icon(ico);
          tit.textContent = t;
          txt.textContent = p;
        };

        const pintar = function () {
          if (!dentro) {
            cabecera('reloj', '¿Cómo lo repartes?', 'Tres maneras. Elige una y dentro ' +
              'verás las horas que salen con tus datos de ahora.');
            caja.innerHTML = familiasHTML();
            return;
          }
          const f = FAMILIAS.filter(function (x) { return x.de === dentro; })[0];
          if (dentro === 'manual') {
            cabecera(f.ico, 'Pon tus horas', 'Gira la rueda, añade, y repite hasta ' +
              'tenerlas todas. Se crea una alerta por cada una.');
            caja.innerHTML = manualHTML();
            montarRueda(caja, rueda);
            return;
          }
          cabecera(f.ico, f.nom, 'Debajo de cada una van las horas que salen con tus ' +
            'datos de ahora.');
          caja.innerHTML = dentroHTML(dentro);
        };

        caja.onclick = function (ev) {
          const fam = ev.target.closest('[data-fam]');
          if (fam) { dentro = fam.dataset.fam; pintar(); return; }

          if (ruedaClic(ev)) return;

          const pat = ev.target.closest('[data-pat]');
          if (pat) {
            dat.patron = pat.dataset.pat;
            eligio = true;
            UI.closeModal();
            setTimeout(function () { alSalir(true); }, 180);
            return;
          }

          const quitar = ev.target.closest('[data-quitar]');
          if (quitar) {
            dat.horasManuales = (dat.horasManuales || []).filter(function (h) {
              return h !== quitar.dataset.quitar;
            });
            pintar();
            return;
          }

          const b = ev.target.closest('[data-x]');
          if (!b) return;

          if (b.dataset.x === 'atras') { dentro = ''; pintar(); return; }

          if (b.dataset.x === 'add') {
            const puesta = leerRueda(caja, rueda);
            /* La rueda se queda donde la dejo, que es lo que espera quien va a
               poner la siguiente hora cerca de esta. */
            rueda.h = puesta.h; rueda.m = puesta.m; rueda.ap = puesta.ap;
            const v = deRueda(puesta);
            const hs = (dat.horasManuales || []).slice();
            if (hs.indexOf(v) !== -1) { UI.toast('Esa hora ya está'); return; }
            hs.push(v);
            dat.horasManuales = hs;
            pintar();
            UI.toast((UI.hora ? UI.hora(v) : v) + ' añadida');
            return;
          }

          if (b.dataset.x === 'listo') {
            if (!(dat.horasManuales || []).length) {
              UI.toast('Añade al menos una hora'); return;
            }
            dat.patron = 'manual';
            eligio = true;
            UI.closeModal();
            setTimeout(function () { alSalir(true); }, 180);
          }
        };

        /* Si ya venía con horas puestas a mano, se abre donde lo dejó */
        if (dat.patron === 'manual') dentro = 'manual';
        pintar();

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
