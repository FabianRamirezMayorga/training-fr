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
        (cambiada ? 'Comiste otra cosa' : 'Te lo comiste') + '</span>' +
        '<span class="mh-sub">' + esc((cambiada ? hecha.plato + ' · ' : '') +
          UI.num(hecha.kcal) + ' kcal · ' + hecha.prot + ' g de proteína') + '</span></span>' +
        '<button class="btn sm ghost" data-descomer="' + esc(hecha.id) + '">Deshacer</button>' +
        '</div>';
    }

    return '<div class="ml-acciones">' +
      '<button class="btn sm ml-si" data-comi="' + esc(r) + '">' +
      icon('check') + ' Me lo comí</button>' +
      '<button class="btn sm" data-cambie="' + esc(r) + '">' +
      icon('cambiar') + ' Comí otra cosa</button>' +
      '</div>' +
      (esHoy === false ? '<p class="tiny ml-aviso">Se apunta en el día de hoy.</p>' : '');
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
      '<b style="font-size:.9rem">' + esc(c.nombre || 'Comida') +
      (c.hora ? ' <span class="tiny">· ' + esc(c.hora) + '</span>' : '') + '</b>' +
      '<span class="tiny">' + UI.num(c.kcal || 0) + ' kcal</span></div>' +
      '<div class="muted" style="font-size:.9rem;margin-top:3px">' + esc(c.plato || '') + '</div>' +
      ((c.alternativas || []).length
        ? '<div class="tiny" style="margin-top:5px;color:var(--acc)">O bien: ' +
          esc(c.alternativas.join(' · ')) + '</div>' : '') +
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
          '<span style="color:var(--blue)">•</span><span>' + esc(x) + '</span></div>';
      }

      return '<button class="agua-toma' + (ya ? ' bebida' : '') +
        '" data-agua="' + esc(r) + '" data-ml="' + ml + '">' +
        '<span class="at-casilla">' + (ya ? icon('check') : '') + '</span>' +
        '<span class="grow at-txt">' + esc(x) + '</span>' +
        '</button>';
    }).join('');

    return html`
      <div class="card tarjeta-premium agua-caja">
        ${raw(conCabecera ? html`
          <div class="row between">
            <div class="row" style="gap:9px;align-items:center">
              <span class="row-icon" style="color:var(--blue)">${raw(icon('gota'))}</span>
              <b>Hidratación</b>
            </div>
            <span class="chip solid">${h.total || (Perfil.agua() + ' L')}</span>
          </div>` : '')}

        ${raw(marcable ? html`
          <div class="agua-hoy"${raw(conCabecera ? '' : ' style="margin-top:0"')}>
            <div class="row between" style="align-items:baseline">
              <span class="tiny">Llevas hoy</span>
              <span class="ah-cif">${String(llevo.litros).replace('.', ',')}<i>
                de ${String(metaL).replace('.', ',')} L</i></span>
            </div>
            <div class="nu-barra"><i style="width:${metaL
              ? Math.min(100, Math.round(llevo.litros / metaL * 100)) : 0}%;--bc:var(--blue)"></i></div>
          </div>` : '')}

        ${raw(pauta ? '<div class="agua-pauta">' + pauta + '</div>' : '')}
        ${raw(h.nota ? '<p class="tiny" style="margin:10px 0 0">' + esc(h.nota) + '</p>' : '')}

        <div class="row" style="margin-top:11px;gap:9px">
          <button class="btn sm grow" data-a="alertasAgua">
            ${raw(icon('campana'))} Ponerme los recordatorios</button>
          ${raw(marcable
            ? '<button class="btn sm icon-vidrio" data-a="vaso" title="Un vaso suelto" ' +
              'aria-label="Apuntar un vaso suelto">' + icon('plus') + '</button>'
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
    if (!d) { UI.toast('Ese plato ya no está en el menú'); return; }
    Comidas.anotar({
      plato: d.comida.plato || d.comida.nombre || 'Comida',
      kcal: d.comida.kcal, prot: d.comida.prot,
      detalle: d.comida.nombre || '',
      fuente: 'menu', ref: r
    });
    render();
    UI.toast('Apuntado: ' + UI.num(Math.round(Number(d.comida.kcal) || 0)) + ' kcal');
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
    if (!d) { UI.toast('Ese plato ya no está en el menú'); return; }

    const c = d.comida;
    const conIA = IA.activa() && IA.revisarCambioComida;

    UI.modal(html`
      <h2>Comí otra cosa</h2>
      <p class="muted">En lugar de <b>${c.plato || c.nombre}</b>
      (${UI.num(c.kcal)} kcal · ${c.prot} g de proteína).</p>

      <label class="tiny" style="margin-top:12px;display:block">QUÉ COMISTE</label>
      <input id="sc-plato" placeholder="Ej. dos arepas con queso y un café con leche"
             autocomplete="off">

      ${raw(conIA ? html`
        <div class="row" style="margin-top:10px;gap:9px">
          <button class="btn primary grow btn-arranque" id="sc-calcular">
            ${raw(icon('chispa'))} Calcular</button>
          <label class="btn grow" for="sc-foto" style="cursor:pointer">
            ${raw(icon('camara'))} Hacer foto</label>
        </div>
        <input type="file" id="sc-foto" accept="image/*" capture="environment" hidden>
        <p class="tiny" style="margin:7px 0 0">Escríbelo o hazle una foto. Saca las calorías
        y la proteína, y te dice si el cambio se sostiene. La foto no se guarda en ningún
        sitio: se manda para que la lea y se suelta.</p>` : html`
        <p class="tiny" style="margin:8px 0 0">Sin el entrenador con IA configurado
        tendrás que poner tú los números.</p>`)}

      <div id="sc-foto-vista"></div>
      <div id="sc-visto" class="tiny" style="margin-top:10px"></div>
      <div id="sc-dictamen"></div>

      <div class="row" style="margin-top:10px">
        <div class="grow">
          <label class="tiny">CALORÍAS</label>
          <input id="sc-kcal" type="number" inputmode="numeric" min="0" placeholder="0">
        </div>
        <div class="grow">
          <label class="tiny">PROTEÍNA (g)</label>
          <input id="sc-prot" type="number" inputmode="numeric" min="0" placeholder="0">
        </div>
      </div>

      <div id="sc-diag"></div>

      <button class="btn primary block" id="sc-ok" style="margin-top:14px">
        Anotar el cambio</button>`,
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
            '<div class="pre-encima">Respecto a lo que tocaba</div>' +
            linea('Calorías', dk, 'kcal') +
            linea('Proteína', dp, 'g') +
            '</div>';
        };

        /* Y el dictamen, que es de la IA: si el cambio se sostiene y con qué
           puede alternar. Sin esto, la pantalla decía cuánto te habías desviado
           pero no si eso importaba, que es lo que se pregunta uno. */
        const pintarDictamen = function (r2) {
          if (!r2 || !r2.consejo) { dictamen.innerHTML = ''; return; }

          const titulo = r2.veredicto === 'bien' ? 'Buen cambio'
            : r2.veredicto === 'mal' ? 'Este no te conviene'
            : 'Pasa, pero justo';

          dictamen.innerHTML = '<div class="sc-dictamen es-' + esc(r2.veredicto) + '">' +
            '<div class="sd-cab">' +
            '<span class="sd-ico">' +
            icon(r2.veredicto === 'mal' ? 'close'
              : r2.veredicto === 'regular' ? 'flag' : 'check') + '</span>' +
            '<b>' + esc(titulo) + '</b></div>' +
            '<p class="sd-txt">' + esc(r2.consejo) + '</p>' +
            (r2.alternativas.length
              ? '<div class="sd-alt"><span class="pre-encima">También puedes alternar con</span>' +
                r2.alternativas.map(function (x) {
                  return '<div class="sd-fila">' + esc(x) + '</div>';
                }).join('') + '</div>'
              : '') +
            '</div>';
        };

        const calcular = function (imagen) {
          const t = campoPlato.value.trim();
          if (!t && !imagen) {
            UI.toast('Escribe qué comiste o hazle una foto');
            campoPlato.focus();
            return;
          }
          if (btnCalc) { btnCalc.disabled = true; btnCalc.textContent = 'Mirándolo…'; }
          visto.textContent = '';
          dictamen.innerHTML = '';

          return IA.revisarCambioComida(t, c, imagen).then(function (r2) {
            if (!r2 || !(Number(r2.kcal) > 0)) {
              visto.innerHTML = '<span style="color:var(--warn)">' +
                esc((r2 && r2.nota) || 'No he sabido qué es eso. Pon tú los números.') +
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
            visto.innerHTML = esc(r2.nota || '') +
              (r2.confianza ? ' <span class="chip tiny-chip">' + esc(r2.confianza) + '</span>' : '');
            pintarDiag();
            pintarDictamen(r2);
          }).catch(function (e) {
            visto.innerHTML = '<span style="color:var(--warn)">' +
              esc(e.message || 'No se pudo calcular') + '</span>';
          }).then(function () {
            if (btnCalc) {
              btnCalc.disabled = false;
              btnCalc.innerHTML = icon('chispa') + ' Calcular';
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
            UI.toast(e.message || 'No he podido leer esa foto');
          });
        };

        btnOk.onclick = function () {
          const plato = campoPlato.value.trim();
          const kcal = Number(campoKcal.value) || 0;
          if (!plato) { UI.toast('Escribe qué comiste'); campoPlato.focus(); return; }
          if (!kcal) { UI.toast('Faltan las calorías'); campoKcal.focus(); return; }

          UI.closeModal();
          Comidas.anotar({
            plato: plato, kcal: kcal, prot: Number(campoProt.value) || 0,
            detalle: detalle, confianza: confianza,
            fuente: 'cambio', ref: r,
            sustituye: c.plato || c.nombre || '',
            /* El dictamen se guarda con el registro: sin él, mañana el diario
               dice que cambiaste el salmón por una empanada pero no lo que se
               te contestó entonces, que es la mitad del valor de apuntarlo. */
            consejo: consejo, veredicto: veredicto
          });
          render();
          UI.toast('Cambio apuntado');
        };

        setTimeout(function () { campoPlato.focus(); }, 60);
      });
  }

  /* ---------- los oyentes ----------
     Una sola llamada por pantalla. Quien pinte cualquiera de estos trozos
     llama a esto en su mount y ya funciona todo. */
  function bind(root) {
    const bindAll = App.bindAll, bind1 = App.bind;

    bindAll(root, '[data-comi]', function (el) { comerLoPrevisto(el.dataset.comi); });
    bindAll(root, '[data-cambie]', function (el) { sustituirComidaSheet(el.dataset.cambie); });
    bindAll(root, '[data-descomer]', function (el) {
      Comidas.borrar(el.dataset.descomer);
      render();
      UI.toast('Desmarcado');
    });

    bindAll(root, '[data-agua]', function (el) {
      const puesto = Agua.alternar(el.dataset.agua, Number(el.dataset.ml) || Agua.VASO);
      render();
      UI.toast(puesto ? 'Apuntados ' + puesto.ml + ' ml' : 'Desmarcado');
    });

    bind1(root, '[data-a=vaso]', function () {
      const x = Agua.anotar(Agua.VASO);
      render();
      UI.toast('Un vaso más: ' + x.ml + ' ml');
    });

    /* Puente con las alertas: el plan dice cuánta agua y las alertas la
       recuerdan. Vive aquí porque el bloque de hidratación lo pintan tres
       pantallas y el botón va dentro. */
    bind1(root, '[data-a=alertasAgua]', function () {
      const sug = Alertas.sugerencias().filter(function (x) { return x.clave === 'agua'; })[0];
      if (!sug) { UI.toast('Completa tu perfil para calcular el agua'); return; }
      if (Alertas.yaExiste(sug)) { App.go('alertas'); UI.toast('Ya los tienes puestos'); return; }
      Alertas.crearDesdeSugerencia(sug);
      App.go('alertas');
      UI.toast(sug.horas.length + ' recordatorios de agua creados');
    });
  }

  g.Marcar = {
    ref: ref, comidaDeRef: comidaDeRef, comidaHTML: comidaHTML, platoHTML: platoHTML,
    macrosHTML: macrosHTML, hoyHTML: hoyHTML, aguaHTML: aguaHTML,
    aguaDeHoyHTML: aguaDeHoyHTML, comerLoPrevisto: comerLoPrevisto,
    sustituirComidaSheet: sustituirComidaSheet, bind: bind
  };
})(window);
