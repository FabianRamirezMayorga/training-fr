/* marcar.js — marcar lo que comes y lo que bebes, esté donde esté.

   Esto nació dentro de la pantalla de Alimentación, que es donde vive el menú
   entero. Pero el menú del día sale en tres sitios —la portada, «mi día» y la
   propia Alimentación— y en los tres se quiere lo mismo: decir que te comiste
   lo que ponía, o que comiste otra cosa. Dejarlo donde nació obligaba a bajar
   a Alimentación para marcar algo que tenías delante.

   Así que vive aquí, una sola vez. Tres copias de esto en tres pantallas se
   separan en dos semanas: una arreglaría un fallo, otra añadiría un botón y la
   tercera se quedaría atrás sin que nadie se diera cuenta. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const render = function () { return App.render(); };

  /* ---------- a qué plato señala una marca ----------
     «menú|día|comida». La referencia lleva el id del menú, así que marcar desde
     un menú secundario no se confunde con el mismo plato del principal. */
  function ref(menuId, diaIdx, comidaIdx) {
    return menuId + '|' + diaIdx + '|' + comidaIdx;
  }

  function comidaDeRef(r) {
    const trozos = String(r || '').split('|');
    const menu = g.Menus ? Menus.porId(trozos[0]) : null;
    if (!menu || !menu.plan) return null;
    const dia = (menu.plan.dias || [])[Number(trozos[1])];
    if (!dia) return null;
    const c = (dia.comidas || [])[Number(trozos[2])];
    return c ? { menu: menu, dia: dia, comida: c, ref: r } : null;
  }

  function seLleva() { return !!(g.Comidas && Comidas.seLleva()); }

  /* ---------- los botones de un plato ----------
     Se puede marcar desde cualquier día del menú y siempre cuenta en el día de
     hoy: el plato es el plato, que viva en el lunes no significa que no te lo
     hayas comido hoy. Lo que no puede pasar es que se apunte en otro día, así
     que en los días que no son hoy se dice a las claras dónde va. */
  function comidaHTML(r, c, esHoy) {
    if (!seLleva()) return '';

    const hecha = Comidas.marcada(r);
    if (hecha) {
      const cambiada = !!hecha.sustituye;
      return '<div class="ml-hecha">' +
        '<span class="mh-ico">' + icon('check') + '</span>' +
        '<span class="grow"><span class="mh-tit">' +
        esc(cambiada ? T('Comiste otra cosa') : T('Te lo comiste')) + '</span>' +
        '<span class="mh-sub">' + esc((cambiada ? hecha.plato + ' · ' : '') +
          Tn('{kcal} kcal · {prot} g de proteína',
            { kcal: UI.num(hecha.kcal), prot: hecha.prot })) + '</span></span>' +
        '<button class="btn sm ghost" data-descomer="' + esc(hecha.id) + '">' +
        esc(T('Deshacer')) + '</button>' +
        '</div>';
    }

    return '<div class="ml-acciones">' +
      '<button class="btn sm ml-si" data-comi="' + esc(r) + '">' +
      icon('check') + ' ' + esc(T('Me lo comí')) + '</button>' +
      '<button class="btn sm" data-cambie="' + esc(r) + '">' +
      icon('cambiar') + ' ' + esc(T('Comí otra cosa')) + '</button>' +
      '</div>' +
      (esHoy === false ? '<p class="tiny ml-aviso">' +
        esc(T('Se apunta en el día de hoy.')) + '</p>' : '');
  }

  /* Los macros de un plato. Los menús no siempre traen los tres: con un «H»
     vacío quedaba una etiqueta colgando sin número detrás. */
  function macrosHTML(c) {
    const partes = [];
    if (c.prot != null && c.prot !== '') partes.push('P ' + c.prot);
    if (c.carbo != null && c.carbo !== '') partes.push('H ' + c.carbo);
    if (c.grasa != null && c.grasa !== '') partes.push('G ' + c.grasa);
    if (!partes.length) return '';
    return '<div class="tiny" style="margin-top:4px">' + esc(partes.join(' · ')) + '</div>';
  }

  /* Un plato entero: lo que es y lo que se puede hacer con él. Igual en las
     tres pantallas, que para eso está aquí. */
  function platoHTML(menuId, diaIdx, j, c, esHoy) {
    const r = ref(menuId, diaIdx, j);
    const hecha = seLleva() ? Comidas.marcada(r) : null;

    return '<div class="meal' + (hecha ? ' es-hecha' : '') + '">' +
      '<div class="row between">' +
      '<b style="font-size:.9rem">' + esc(T(c.nombre) || T('Comida')) +
      (c.hora ? ' <span class="tiny">· ' + esc(c.hora) + '</span>' : '') + '</b>' +
      '<span class="tiny">' + UI.num(c.kcal || 0) + ' kcal</span></div>' +
      '<div class="muted" style="font-size:.9rem;margin-top:3px">' +
      esc(T(c.plato || '')) + '</div>' +
      ((c.alternativas || []).length
        ? '<div class="tiny" style="margin-top:5px;color:var(--acc)">' +
          esc(Tn('O bien: {lista}', { lista: c.alternativas.join(' · ') })) + '</div>' : '') +
      macrosHTML(c) +
      comidaHTML(r, c, esHoy) +
      '</div>';
  }

  /* El día de hoy del menú activo, con sus platos y sus marcas. Lo usan la
     portada y «mi día», que enseñan el menú del día y nada más. */
  function hoyHTML() {
    const d = g.Menus ? Menus.hoyConRef() : null;
    if (!d || !(d.dia.comidas || []).length) return '';

    return '<div class="stack menu-platos">' +
      d.dia.comidas.map(function (c, j) {
        return platoHTML(d.menu.id, d.i, j, c, true);
      }).join('') + '</div>';
  }

  /* ---------- el agua ----------
     La pauta decía cuánta tomar y a qué horas, y ahí se acababa. Cada toma es
     una casilla: tocarla la marca y volver a tocarla la quita. */
  function aguaHTML(h, menuId, opciones) {
    if (!h) return '';
    /* Dentro de un cajón que ya se titula «Hidratación», repetir el título y
       los litros dentro de la tarjeta es decir dos veces lo mismo. */
    const conCabecera = !(opciones && opciones.sinCabecera);
    const marcable = !!(g.Agua && Agua.seLleva());
    const llevo = marcable ? Agua.hoy() : null;
    const metaL = Number(String(h.total || '').replace(',', '.').match(/[\d.]+/) || [0]) ||
      Number(Perfil.agua()) || 0;

    const pauta = (h.pauta || []).map(function (x, i) {
      const r = (menuId || 'pauta') + '#' + i;
      const ml = g.Agua ? Agua.mlDeTexto(x) : 250;
      const ya = marcable && g.Agua ? Agua.marcada(r) : null;

      /* Sin el registro de agua activado se queda como estaba: un renglón con
         su punto, que es lo que era antes de que se pudiera marcar nada. */
      if (!marcable) {
        return '<div class="tiny" style="display:flex;gap:8px">' +
          '<span style="color:var(--agua)">•</span><span>' + esc(T(x)) + '</span></div>';
      }

      return '<button class="agua-toma' + (ya ? ' bebida' : '') +
        '" data-agua="' + esc(r) + '" data-ml="' + ml + '">' +
        '<span class="at-casilla">' + (ya ? icon('check') : '') + '</span>' +
        '<span class="grow at-txt">' + esc(T(x)) + '</span>' +
        '</button>';
    }).join('');

    return html`
      <div class="card tarjeta-premium agua-caja">
        ${raw(conCabecera ? html`
          <div class="row between">
            <div class="row" style="gap:9px;align-items:center">
              <span class="row-icon" style="color:var(--agua)">${raw(icon('vaso'))}</span>
              <b>${T('Hidratación')}</b>
            </div>
            <span class="chip solid">${h.total || (Perfil.agua() + ' L')}</span>
          </div>` : '')}

        ${raw(marcable ? html`
          <div class="agua-hoy"${raw(conCabecera ? '' : ' style="margin-top:0"')}>
            <div class="row between" style="align-items:baseline">
              <span class="tiny">${T('Llevas hoy')}</span>
              <span class="ah-cif">${UI.dec(llevo.litros)}<i>
                ${Tn('de {n} L', { n: UI.dec(metaL) })}</i></span>
            </div>
            <div class="nu-barra"><i style="width:${metaL
              ? Math.min(100, Math.round(llevo.litros / metaL * 100)) : 0}%;--bc:var(--agua)"></i></div>
          </div>` : '')}

        ${raw(pauta ? '<div class="agua-pauta">' + pauta + '</div>' : '')}
        ${raw(h.nota ? '<p class="tiny" style="margin:10px 0 0">' + esc(T(h.nota)) + '</p>' : '')}

        <div class="row" style="margin-top:11px;gap:9px">
          <button class="btn sm grow" data-a="alertasAgua">
            ${raw(icon('campana'))} ${T('Ponerme los recordatorios')}</button>
          ${raw(marcable
            ? '<button class="btn sm icon-vidrio" data-a="vaso" ' +
              'title="' + UI.esc(T('Un vaso suelto')) + '" ' +
              'aria-label="' + UI.esc(T('Apuntar un vaso suelto')) + '">' + icon('plus') + '</button>'
            : '')}
        </div>
      </div>`;
  }

  /* La hidratación del menú activo, para las pantallas que no tienen el menú
     entero delante. */
  function aguaDeHoyHTML() {
    const m = g.Menus ? Menus.activo() : null;
    const h = m && m.plan && m.plan.hidratacion;
    if (!h) return '';
    return aguaHTML(h, m.id, { sinCabecera: true });
  }

  /* ---------- lo previsto, tal cual ----------
     Los números ya están calculados: no hay nada que estimar ni a quién
     preguntar. */
  function comerLoPrevisto(r) {
    const d = comidaDeRef(r);
    if (!d) { UI.toast(T('Ese plato ya no está en el menú')); return; }
    Comidas.anotar({
      plato: d.comida.plato || d.comida.nombre || 'Comida',
      kcal: d.comida.kcal, prot: d.comida.prot,
      carbo: d.comida.carbo, grasa: d.comida.grasa,
      detalle: d.comida.nombre || '',
      fuente: 'menu', ref: r
    });
    render();
    UI.toast(Tn('Apuntado: {n} kcal',
      { n: UI.num(Math.round(Number(d.comida.kcal) || 0)) }));
  }

  /* ---------- comí otra cosa ----------
     Se escribe lo que fuera —o se le hace una foto— y la IA hace el trabajo
     entero de una vez: los números y el dictamen. Estimar las calorías y
     callarse el resto deja a medias justo la parte que la app no puede hacer
     sola: restar sabe, pero no sabe si cambiar el salmón por una empanada se
     sostiene un día de entreno.

     El reparto es ese: la resta contra lo previsto la hace la app, porque los
     dos números están aquí y restarlos es exacto; el juicio lo hace la IA,
     porque hace falta saber de comida. */
  function sustituirComidaSheet(r) {
    const d = comidaDeRef(r);
    if (!d) { UI.toast(T('Ese plato ya no está en el menú')); return; }

    const c = d.comida;
    const conIA = IA.activa() && IA.revisarCambioComida;

    UI.modal(html`
      <h2>${T('Comí otra cosa')}</h2>
      <p class="muted">${raw(Tn('En lugar de {plato} ({kcal} kcal · {prot} g de proteína).',
        { plato: '<b>' + esc(c.plato || c.nombre) + '</b>',
          kcal: UI.num(c.kcal), prot: c.prot }))}</p>

      <label class="tiny" style="margin-top:12px;display:block">${T('QUÉ COMISTE')}</label>
      <input id="sc-plato" placeholder="${T('Ej. dos arepas con queso y un café con leche')}"
             autocomplete="off">

      ${raw(conIA ? html`
        <div class="row" style="margin-top:10px;gap:9px">
          <button class="btn primary grow btn-arranque" id="sc-calcular">
            ${raw(icon('chispa'))} ${T('Calcular')}</button>
          <!-- «Foto» y ya no «Hacer foto»: el campo dejó de forzar la cámara,
               así que también se puede sacar de la galería y el botón no debe
               prometer una sola de las dos cosas. -->
          <label class="btn grow" for="sc-foto" style="cursor:pointer">
            ${raw(icon('camara'))} ${T('Foto')}</label>
        </div>
        <input type="file" id="sc-foto" accept="image/*" hidden>
        <p class="tiny" style="margin:7px 0 0">${T('Escríbelo o hazle una foto. Saca las ' +
        'calorías y la proteína, y te dice si el cambio se sostiene. La foto no se guarda ' +
        'en ningún sitio: se manda para que la lea y se suelta.')}</p>` : html`
        <p class="tiny" style="margin:8px 0 0">${T('Sin el entrenador con IA configurado ' +
        'tendrás que poner tú los números.')}</p>`)}

      <div id="sc-foto-vista"></div>
      <div id="sc-visto" class="tiny" style="margin-top:10px"></div>
      <div id="sc-dictamen"></div>

      <div class="row" style="margin-top:10px">
        <div class="grow">
          <label class="tiny">${T('CALORÍAS')}</label>
          <input id="sc-kcal" type="number" inputmode="numeric" min="0" placeholder="0">
        </div>
        <div class="grow">
          <label class="tiny">${T('PROTEÍNA (g)')}</label>
          <input id="sc-prot" type="number" inputmode="numeric" min="0" placeholder="0">
        </div>
      </div>

      <div id="sc-diag"></div>

      <button class="btn primary block" id="sc-ok" style="margin-top:14px">
        ${T('Anotar el cambio')}</button>`,
      function (el) {
        const campoPlato = el.querySelector('#sc-plato');
        const campoKcal = el.querySelector('#sc-kcal');
        const campoProt = el.querySelector('#sc-prot');
        const visto = el.querySelector('#sc-visto');
        const dictamen = el.querySelector('#sc-dictamen');
        const diag = el.querySelector('#sc-diag');
        const verFoto = el.querySelector('#sc-foto-vista');
        const btnCalc = el.querySelector('#sc-calcular');
        const btnOk = el.querySelector('#sc-ok');
        let detalle = '';
        let confianza = '';
        let consejo = '';
        let veredicto = '';
        let carbo = 0;
        let grasa = 0;

        /* La resta, que es de la app. Se repinta cada vez que cambian los
           números —también si los corriges a mano—, porque lo que importa es lo
           que vas a apuntar y no lo que dijo el modelo. */
        const pintarDiag = function () {
          const kcal = Number(campoKcal.value) || 0;
          const prot = Number(campoProt.value) || 0;
          if (!kcal && !prot) { diag.innerHTML = ''; return; }

          const dk = Math.round(kcal - (Number(c.kcal) || 0));
          const dp = Math.round(prot - (Number(c.prot) || 0));

          const linea = function (nombre, dif, unidad) {
            const signo = dif > 0 ? '+' : '';
            const tono = dif === 0 ? 'igual' : dif > 0 ? 'sube' : 'baja';
            return '<div class="sc-fila ' + tono + '"><span>' + esc(nombre) + '</span>' +
              '<b>' + signo + UI.num(dif) + ' ' + esc(unidad) + '</b></div>';
          };

          diag.innerHTML = '<div class="sc-diag">' +
            '<div class="pre-encima">' + esc(T('Respecto a lo que tocaba')) + '</div>' +
            linea(T('Calorías'), dk, 'kcal') +
            linea(T('Proteína'), dp, 'g') +
            '</div>';
        };

        /* Y el dictamen, que es de la IA: si el cambio se sostiene y con qué
           puede alternar. Sin esto, la pantalla decía cuánto te habías desviado
           pero no si eso importaba, que es lo que se pregunta uno. */
        const pintarDictamen = function (r2) {
          if (!r2 || !r2.consejo) { dictamen.innerHTML = ''; return; }

          const titulo = r2.veredicto === 'bien' ? T('Buen cambio')
            : r2.veredicto === 'mal' ? T('Este no te conviene')
            : T('Pasa, pero justo');

          dictamen.innerHTML = '<div class="sc-dictamen es-' + esc(r2.veredicto) + '">' +
            '<div class="sd-cab">' +
            '<span class="sd-ico">' +
            icon(r2.veredicto === 'mal' ? 'close'
              : r2.veredicto === 'regular' ? 'flag' : 'check') + '</span>' +
            '<b>' + esc(titulo) + '</b></div>' +
            '<p class="sd-txt">' + esc(r2.consejo) + '</p>' +
            (r2.alternativas.length
              ? '<div class="sd-alt"><span class="pre-encima">' +
                esc(T('También puedes alternar con')) + '</span>' +
                r2.alternativas.map(function (x) {
                  return '<div class="sd-fila">' + esc(x) + '</div>';
                }).join('') + '</div>'
              : '') +
            '</div>';
        };

        const calcular = function (imagen) {
          const t = campoPlato.value.trim();
          if (!t && !imagen) {
            UI.toast(T('Escribe qué comiste o hazle una foto'));
            campoPlato.focus();
            return;
          }
          if (btnCalc) { btnCalc.disabled = true; btnCalc.textContent = T('Mirándolo…'); }
          visto.textContent = '';
          dictamen.innerHTML = '';

          return IA.revisarCambioComida(t, c, imagen).then(function (r2) {
            if (!r2 || !(Number(r2.kcal) > 0)) {
              visto.innerHTML = '<span style="color:var(--warn)">' +
                esc((r2 && r2.nota) || T('No he sabido qué es eso. Pon tú los números.')) +
                '</span>';
              return;
            }
            campoKcal.value = r2.kcal;
            campoProt.value = r2.prot;
            if (r2.plato) campoPlato.value = r2.plato;
            detalle = r2.nota || '';
            confianza = r2.confianza || '';
            consejo = r2.consejo || '';
            veredicto = r2.veredicto || '';
            carbo = r2.carbo || 0;
            grasa = r2.grasa || 0;
            visto.innerHTML = esc(r2.nota || '') +
              (r2.confianza ? ' <span class="chip tiny-chip">' + esc(r2.confianza) + '</span>' : '');
            pintarDiag();
            pintarDictamen(r2);
          }).catch(function (e) {
            visto.innerHTML = '<span style="color:var(--warn)">' +
              esc(e.message || T('No se pudo calcular')) + '</span>';
          }).then(function () {
            if (btnCalc) {
              btnCalc.disabled = false;
              btnCalc.innerHTML = icon('chispa') + ' ' + esc(T('Calcular'));
            }
            /* Se suelta en cuanto termina, salga bien o mal */
            if (verFoto) verFoto.innerHTML = '';
          });
        };

        if (btnCalc) btnCalc.onclick = function () { calcular(null); };
        campoKcal.oninput = pintarDiag;
        campoProt.oninput = pintarDiag;

        const campoFoto = el.querySelector('#sc-foto');
        if (campoFoto) campoFoto.onchange = function () {
          const file = campoFoto.files && campoFoto.files[0];
          /* se vacía ya: si no, elegir dos veces la misma foto no dispara nada */
          campoFoto.value = '';
          if (!file) return;

          Comidas.prepararFoto(file).then(function (img) {
            verFoto.innerHTML = '<img class="sc-foto" src="' + img.vista + '" alt="">';
            return calcular(img);
          }).catch(function (e) {
            UI.toast(e.message || T('No he podido leer esa foto'));
          });
        };

        btnOk.onclick = function () {
          const plato = campoPlato.value.trim();
          const kcal = Number(campoKcal.value) || 0;
          if (!plato) { UI.toast(T('Escribe qué comiste')); campoPlato.focus(); return; }
          if (!kcal) { UI.toast(T('Faltan las calorías')); campoKcal.focus(); return; }

          UI.closeModal();
          Comidas.anotar({
            plato: plato, kcal: kcal, prot: Number(campoProt.value) || 0,
            carbo: carbo, grasa: grasa,
            detalle: detalle, confianza: confianza,
            fuente: 'cambio', ref: r,
            sustituye: c.plato || c.nombre || '',
            /* El dictamen se guarda con el registro: sin él, mañana el diario
               dice que cambiaste el salmón por una empanada pero no lo que se
               te contestó entonces, que es la mitad del valor de apuntarlo. */
            consejo: consejo, veredicto: veredicto
          });
          render();
          UI.toast(T('Cambio apuntado'));
        };

        setTimeout(function () { campoPlato.focus(); }, 60);
      });
  }

  /* ---------- el cruce por la hora ----------
     Si el menú dice que a las 8:00 toca avena y a las 8:05 le hace una foto a
     un plato, ese plato es el desayuno. Hasta ahora la foto se apuntaba suelta
     y el desayuno se quedaba sin marcar, así que el día contaba dos veces lo
     mismo: lo que comió por un lado y lo que tenía previsto por otro, sin
     saber nunca si lo cumplió.

     Lo que decide es la franja del día —desayuno, almuerzo, merienda, cena—,
     que la pone él en sus preferencias. La ventana de minutos se queda como
     red por debajo: para menús sin horas claras o comidas a deshora, cruzar
     con la más cercana es mejor que no cruzar nada. */
  const VENTANA = 150;

  function comidaDeLaHora(cuando) {
    if (!g.Menus || !g.Comidas) return null;
    const d = Menus.hoyConRef ? Menus.hoyConRef() : null;
    if (!d || !d.dia) return null;

    const t = new Date(cuando || Date.now());
    const min = t.getHours() * 60 + t.getMinutes();
    const ahora = String(t.getHours()).padStart(2, '0') + ':' +
      String(t.getMinutes()).padStart(2, '0');

    /* Primero la franja: a las 9:00 eso es el desayuno y a las 13:00 el
       almuerzo, lo diga el reloj del menú lo que diga. Es más fiable que la
       distancia en minutos, porque una foto de las 11:30 está a hora y media
       del desayuno de las 10 y a media hora del almuerzo de las 12, y aun así
       es el desayuno. */
    const franja = g.Perfil && Perfil.franjaDe ? Perfil.franjaDe(ahora) : null;

    let mejor = null;
    let enFranja = null;

    (d.dia.comidas || []).forEach(function (c, j) {
      const r = ref(d.menu.id, d.i, j);
      /* Una comida ya marcada no se vuelve a cruzar: si ya dijo que se comió
         el desayuno, la foto de las 8:30 es otra cosa. */
      if (Comidas.marcada && Comidas.marcada(r)) return;
      const h = String(c.hora || '').match(/^(\d{1,2}):(\d{2})/);
      if (!h) return;
      const suyo = Number(h[1]) * 60 + Number(h[2]);
      const dif = Math.abs(suyo - min);
      const cand = { ref: r, comida: c, dif: dif, hora: c.hora, franja: franja };

      /* La del menú que cae en la misma franja manda. Si hay dos —media mañana
         y desayuno, por ejemplo— gana la más cercana en hora. */
      if (franja && Perfil.franjaDe(c.hora) &&
          Perfil.franjaDe(c.hora).id === franja.id) {
        if (!enFranja || dif < enFranja.dif) enFranja = cand;
        return;
      }
      /* Y si ninguna cae en la franja —un menú sin horas claras, o una comida
         a deshora— queda el criterio de antes: la más cercana dentro de una
         ventana, que es mejor que no cruzar nada. */
      if (dif > VENTANA) return;
      if (!mejor || dif < mejor.dif) mejor = cand;
    });

    return enFranja || mejor;
  }

  /* La foto, cruzada con el menú. Devuelve una promesa que se resuelve cuando
     ya está apuntado —de una forma o de otra— o cuando no había con qué
     cruzar, y entonces lo dice para que quien llamó siga por su camino. */
  function cruzarFoto(imagen, cuando) {
    const cand = comidaDeLaHora(cuando);
    if (!cand || !g.IA || !IA.activa() || !IA.revisarCambioComida) {
      return Promise.resolve({ cruzado: false });
    }
    return IA.revisarCambioComida('', cand.comida, imagen).then(function (r) {
      if (!r || !(Number(r.kcal) > 0)) return { cruzado: false, nota: r && r.nota };
      cruceSheet(cand, r);
      return { cruzado: true };
    });
  }

  /* ---------- cruzar algo que ya está apuntado ----------
     Lo que se subió suelto antes de que existiera el cruce —o lo que se apuntó
     a mano— se puede cruzar después. La foto ya no está: se suelta en cuanto la
     IA la mira, y eso no va a cambiar. Pero para cruzar no hace falta la foto,
     hace falta saber qué comiste y a qué hora, y las dos cosas están apuntadas.

     Así que se le pregunta a la IA con el texto, que es el mismo camino que
     cuando escribes lo que comiste en vez de fotografiarlo. Los números no se
     tocan: ya están contados en tu día y reescribirlos a posteriori te cambiaría
     el recuento por detrás. Lo que se añade es a qué comida del menú
     corresponde, que es justo lo que faltaba. */
  function apuntesSinCruzar(cuando) {
    if (!g.Comidas || !g.Menus) return [];
    const hoy = Comidas.hoy ? Comidas.del() : [];
    return (hoy || []).filter(function (x) {
      if (x.ref) return false;                 // ya está cruzado
      return !!comidaDeLaHora(x.t);            // y hay con qué cruzarlo
    });
  }

  function cruzarApunte(id) {
    const x = (g.Comidas ? Comidas.del() : []).filter(function (y) {
      return y.id === id;
    })[0];
    if (!x) { UI.toast(T('Ese apunte ya no está')); return; }

    const cand = comidaDeLaHora(x.t);
    if (!cand) { UI.toast(T('A esa hora no tenías nada en el menú')); return; }

    if (!g.IA || !IA.activa() || !IA.revisarCambioComida) {
      /* Sin IA no hay dictamen, pero cruzar sí se puede: la resta la hace la
         app y saber si es el mismo plato lo puede decir él. */
      cruceSheet(cand, {
        plato: x.plato, kcal: x.kcal, prot: x.prot, carbo: x.carbo, grasa: x.grasa,
        esLoPrevisto: false, nota: x.detalle || '', confianza: x.confianza || '',
        veredicto: '', consejo: ''
      }, { apunte: x });
      return;
    }

    UI.toast(T('Mirándolo…'));
    const texto = x.plato + (x.detalle ? '. ' + x.detalle : '');
    IA.revisarCambioComida(texto, cand.comida, null).then(function (r) {
      cruceSheet(cand, {
        /* Los números apuntados mandan sobre los que vuelva a estimar la IA:
           los primeros salieron de mirar la foto de verdad y estos de leer una
           descripción. */
        plato: x.plato, kcal: x.kcal, prot: x.prot, carbo: x.carbo, grasa: x.grasa,
        esLoPrevisto: !!(r && r.esLoPrevisto),
        nota: x.detalle || (r && r.nota) || '',
        confianza: x.confianza || '',
        veredicto: (r && r.veredicto) || '',
        consejo: (r && r.consejo) || ''
      }, { apunte: x });
    }).catch(function (e) {
      UI.toast(e.message || T('No he podido mirarlo'));
    });
  }

  /* Lo previsto contra lo que hay en el plato, y la resta hecha. La resta la
     hace la app y no la IA: los dos números están aquí y restarlos es exacto.
     El juicio sí es suyo, que para eso hace falta saber de comida. */
  function difHTML(etiqueta, previsto, real, unidad) {
    const d = Math.round(real - previsto);
    /* El menos tiene que estar: «1 g» a secas se lee como «un gramo más»
       cuando es uno menos, y ahí el signo es todo el dato. */
    const signo = d > 0 ? '+' : '−';
    const clase = d === 0 ? '' : (d > 0 ? ' mas' : ' menos');
    return '<div class="cr-dato"><span class="cr-lab">' + esc(etiqueta) + '</span>' +
      '<span class="cr-cifra">' + UI.num(Math.round(real)) +
      '<i>' + esc(unidad) + '</i></span>' +
      '<span class="cr-dif' + clase + '">' + (d === 0 ? 'clavado'
        : signo + UI.num(Math.abs(d)) + ' ' + esc(unidad)) + '</span></div>';
  }

  function cruceSheet(cand, r, opciones) {
    const o = opciones || {};
    const yaApuntado = o.apunte || null;
    const c = cand.comida;
    /* El nombre que usa el menú manda; si no trae ninguno, el de la franja en
       la que cae, que es como lo llama él. */
    const nombre = T(c.nombre) || T((cand.franja && cand.franja.label) || '') ||
      T('esa comida');
    const previsto = c.plato || T(c.nombre) || T('lo del menú');
    const igual = r.esLoPrevisto;

    UI.modal(html`
      <div class="conf-disco ${raw(igual ? '' : 'cambio')}">
        ${raw(icon(igual ? 'check' : 'cambiar'))}</div>
      <h2 class="conf-tit">${igual
        ? Tn('Eso es tu {comida}', { comida: nombre.toLowerCase() })
        : Tn('¿Esto es tu {comida}?', { comida: nombre.toLowerCase() })}</h2>
      <p class="muted conf-txt">${igual
        ? Tn('A las {hora} tocaba «{plato}» y eso es lo que veo en la foto.',
            { hora: UI.hora ? UI.hora(cand.hora) : cand.hora, plato: previsto })
        : Tn('A las {hora} tocaba «{plato}», y en la foto veo otra cosa.',
            { hora: UI.hora ? UI.hora(cand.hora) : cand.hora, plato: previsto })}</p>

      <div class="cr-plato">${r.plato}</div>
      ${raw(r.nota ? '<p class="tiny cr-nota">' + esc(r.nota) +
        (r.confianza ? ' · ' + esc(r.confianza) : '') + '</p>' : '')}

      <div class="cr-tabla">
        ${raw(difHTML(T('Calorías'), Number(c.kcal) || 0, r.kcal, 'kcal'))}
        ${raw(difHTML(T('Proteína'), Number(c.prot) || 0, r.prot, 'g'))}
      </div>
      <p class="tiny cr-pie">${Tn('Frente a las {kcal} kcal y {prot} g que tenía el menú.',
        { kcal: UI.num(Number(c.kcal) || 0), prot: UI.num(Number(c.prot) || 0) })}</p>

      ${raw(r.consejo ? '<div class="sc-dictamen ' + esc(r.veredicto || 'regular') + '">' +
        '<p class="sd-txt">' + esc(r.consejo) + '</p></div>' : '')}

      <div class="cb-acciones" style="margin-top:16px">
        <button class="btn primary grow btn-arranque" data-x="si">
          ${raw(icon('check'))} ${igual ? T('Marcar como hecho') : T('Sí, es esa comida')}</button>
        <button class="btn vidrio" data-x="no">${yaApuntado ? T('Dejarlo') : T('Es aparte')}</button>
      </div>
      <p class="tiny" style="margin:10px 0 0;text-align:center">${yaApuntado
        ? T('Los números no cambian: ya están contados en tu día. Lo que se añade es a '
          + 'qué comida del menú corresponde.')
        : Tn('«Es aparte» lo apunta como un extra del día y deja tu {comida} sin marcar.',
            { comida: nombre.toLowerCase() })}</p>`,
      function (el) {
        el.querySelector('[data-x=si]').onclick = function () {
          UI.closeModal();

          /* Ya estaba apuntado: no se crea nada, se le pone el sitio que le
             faltaba. Borrarlo y volver a crearlo le cambiaría la hora. */
          if (yaApuntado) {
            Comidas.actualizar(yaApuntado.id, {
              ref: cand.ref,
              fuente: igual ? 'menu' : 'cambio',
              sustituye: igual ? '' : previsto,
              consejo: r.consejo || yaApuntado.consejo || '',
              veredicto: r.veredicto || yaApuntado.veredicto || ''
            });
            render();
            UI.toast(Tn('Cruzado con tu {comida}', { comida: nombre.toLowerCase() }));
            return;
          }

          /* Si es lo previsto, valen los números del menú: son los que él
             mismo aceptó y los que cuadran con el resto del plan. Si es otra
             cosa, valen los de la foto, que es lo que se ha comido de verdad. */
          if (igual) {
            comerLoPrevisto(cand.ref);
            return;
          }
          Comidas.anotar({
            plato: r.plato, kcal: r.kcal, prot: r.prot,
            carbo: r.carbo, grasa: r.grasa,
            detalle: r.nota || '', confianza: r.confianza || '',
            fuente: 'cambio', ref: cand.ref,
            sustituye: previsto,
            consejo: r.consejo || '', veredicto: r.veredicto || ''
          });
          render();
          UI.toast(Tn('Apuntado en tu {comida}', { comida: nombre.toLowerCase() }));
        };

        el.querySelector('[data-x=no]').onclick = function () {
          UI.closeModal();
          if (yaApuntado) return;   // se queda como estaba
          Comidas.anotar({
            plato: r.plato, kcal: r.kcal, prot: r.prot,
            carbo: r.carbo, grasa: r.grasa,
            detalle: r.nota || '', confianza: r.confianza || '',
            fuente: 'foto'
          });
          render();
          UI.toast('Apuntado aparte: ' + UI.num(Math.round(r.kcal)) + ' kcal');
        };
      });
  }

  /* ---------- los oyentes ----------
     Una sola llamada por pantalla. Quien pinte cualquiera de estos trozos
     llama a esto en su mount y ya funciona todo. */
  function bind(root) {
    const bindAll = App.bindAll, bind1 = App.bind;

    bindAll(root, '[data-comi]', function (el) { comerLoPrevisto(el.dataset.comi); });
    bindAll(root, '[data-cambie]', function (el) { sustituirComidaSheet(el.dataset.cambie); });
    bindAll(root, '[data-cruzar]', function (el) { cruzarApunte(el.dataset.cruzar); });
    bindAll(root, '[data-descomer]', function (el) {
      Comidas.borrar(el.dataset.descomer);
      render();
      UI.toast('Desmarcado');
    });

    bindAll(root, '[data-agua]', function (el) {
      const puesto = Agua.alternar(el.dataset.agua, Number(el.dataset.ml) || Agua.VASO);
      render();
      UI.toast(puesto ? Tn('Apuntados {n} ml', { n: puesto.ml }) : T('Desmarcado'));
    });

    bind1(root, '[data-a=vaso]', function () {
      const x = Agua.anotar(Agua.VASO);
      render();
      UI.toast(Tn('Un vaso más: {n} ml', { n: x.ml }));
    });

    /* Puente con las alertas: el plan dice cuánta agua y las alertas la
       recuerdan. Vive aquí porque el bloque de hidratación lo pintan tres
       pantallas y el botón va dentro. */
    bind1(root, '[data-a=alertasAgua]', function () {
      const sug = Alertas.sugerencias().filter(function (x) { return x.clave === 'agua'; })[0];
      if (!sug) { UI.toast(T('Completa tu perfil para calcular el agua')); return; }
      if (Alertas.yaExiste(sug)) { App.go('alertas'); UI.toast(T('Ya los tienes puestos')); return; }
      Alertas.crearDesdeSugerencia(sug);
      App.go('alertas');
      UI.toast(Tp(sug.horas.length,
        '{n} recordatorio de agua creado', '{n} recordatorios de agua creados'));
    });
  }

  g.Marcar = {
    ref: ref, comidaDeRef: comidaDeRef, comidaHTML: comidaHTML, platoHTML: platoHTML,
    macrosHTML: macrosHTML, hoyHTML: hoyHTML, aguaHTML: aguaHTML,
    aguaDeHoyHTML: aguaDeHoyHTML, comerLoPrevisto: comerLoPrevisto,
    comidaDeLaHora: comidaDeLaHora, cruzarFoto: cruzarFoto,
    cruzarApunte: cruzarApunte, apuntesSinCruzar: apuntesSinCruzar,
    sustituirComidaSheet: sustituirComidaSheet, bind: bind
  };
})(window);
