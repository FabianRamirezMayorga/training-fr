/* vistas2.js — alimentación, entrenador con IA y música.
   Continuación de vistas.js; se registran igual en g.VISTAS. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};
  const BAJA = String.fromCharCode(10);

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  /* Con qué se hizo un menú. Si luego cambian los ingredientes o lo que pide,
     el menú guardado sigue en pantalla como si nada y vuelve a proponer cosas
     que no tiene: más vale decirlo que dejarlo pasar. */
  function huellaMenu() {
    const p = Perfil.datos();
    const m = Perfil.macros(p);
    return [p.despensa, p.ordenesComida, p.dieta, p.alergias, p.condiciones,
      p.comidas, m ? m.kcal : 0, m ? m.prot : 0].join('|');
  }

  /* ¿Este menú se hizo con lo de ahora? */
  function estaViejo(m, p) {
    if (!m) return false;
    if (m.huella) return m.huella !== huellaMenu();
    /* Un menú de antes de que existiera la huella no la lleva, y desde luego no
       tuvo en cuenta unos ingredientes que entonces no se podían poner. */
    return !!(p.despensa || p.ordenesComida);
  }

  /* Qué menús están desplegados. Vive fuera de la función que pinta porque el
     repintado rehace la pantalla entera, y si el estado viviera dentro se
     cerrarían todos cada vez que se toca cualquier cosa. */
  const menusAbiertos = {};

  /* Y qué días de un menú están desplegados. Vivía solo en el DOM —un atributo
     `hidden` que se ponía y se quitaba—, y desde que marcar una comida repinta
     la pantalla eso significaba que el día se te cerraba en las narices justo
     al marcar. */
  const diasAbiertosPlan = {};

  /* ================= alimentación ================= */

  /* ---------- lo que comiste esta semana ----------
     Toda la parte de alimentación vivía en el día de hoy: las dos barras, el
     menú, lo apuntado. Y comer bien un martes no significa nada; lo que
     significa algo es cómo fue la semana.

     Los siete días de la semana en curso, en el mismo orden que la tira de
     entrenamientos de la portada: así se leen los dos juntos y se ve si los
     días que entrenas son también los que comes. */
  function semanaComidaHTML(m) {
    if (!m || !g.Comidas) return '';

    const ahora = new Date();
    const desdeLunes = (ahora.getDay() + 6) % 7;
    const lunes = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - desdeLunes);
    /* De lunes a domingo, que es como se mira una semana */
    const INICIALES = [1, 2, 3, 4, 5, 6, 0].map(function (d) { return UI.inicialDia(d); });

    /* Lo apuntado, por clave de día, para no recorrer la lista siete veces */
    const porDia = {};
    (Comidas.porDias(60) || []).forEach(function (d) { porDia[d.dia] = d; });

    let conAlgo = 0;
    let sumaKcal = 0;
    let diasProte = 0;

    const celdas = INICIALES.map(function (ini, i) {
      const f = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i);
      const d = porDia[Comidas.claveDia(f.getTime())];
      const esHoy = i === desdeLunes;
      const futuro = i > desdeLunes;
      const kcal = d ? d.kcal : 0;
      const prot = d ? d.prot : 0;

      if (kcal > 0) { conAlgo++; sumaKcal += kcal; }
      if (prot >= m.prot) diasProte++;

      /* La barra mide contra el objetivo y se corta en el 100 %: pasarse de
         calorías no hace la barra más alta que las demás, lo dice el color.
         Una barra de 160 px por un día de fiesta aplasta a las otras seis. */
      const alto = Math.max(4, Math.min(100, Math.round(kcal / m.kcal * 100)));
      const clase = !kcal ? 'vacio'
        : prot >= m.prot ? 'bien'
        : kcal >= m.kcal * 0.8 ? 'flojo' : 'poco';

      return '<div class="sc-dia' + (esHoy ? ' es-hoy' : '') +
        (futuro ? ' futuro' : '') + '">' +
        '<div class="sc-barra"><i class="' + clase + '" style="height:' + alto + '%"></i></div>' +
        '<span class="sc-ini">' + esc(esHoy ? T('Hoy') : ini) + '</span>' +
        '<span class="sc-num">' + f.getDate() + '</span></div>';
    }).join('');

    const media = conAlgo ? Math.round(sumaKcal / conAlgo) : 0;

    return html`
      <div class="list-title">${T('Lo que comiste esta semana')}</div>
      <div class="card tarjeta-premium">
        <div class="pre-encima">${raw(conAlgo
          ? esc(Tp(conAlgo, 'Media de {n} día apuntado', 'Media de {n} días apuntados'))
          : esc(T('Sin nada apuntado')))}</div>
        <div class="pre-num" style="margin:1px 0 13px">${raw(conAlgo
          ? UI.num(media) + ' <span class="tiny" style="font-weight:600">' +
            esc(Tn('de {n} kcal', { n: UI.num(m.kcal) })) + '</span>'
          : '—')}</div>

        <div class="sc-semana">
          <span class="sc-meta" aria-hidden="true"></span>
          ${raw(celdas)}
        </div>

        <p class="tiny sc-pie">${raw(conAlgo
          ? esc(Tp(diasProte, '{n} día llegaste a los {g} g de proteína. La raya es tu objetivo de calorías.',
                   '{n} días llegaste a los {g} g de proteína. La raya es tu objetivo de calorías.')
              .split('{g}').join(String(m.prot)))
          : esc(T('Apunta lo que comes y aquí verás la semana entera de un vistazo.')))}</p>

        <div class="sc-leyenda">
          <span><i class="bien"></i> ${T('Proteína cubierta')}</span>
          <span><i class="flojo"></i> ${T('Cerca')}</span>
          <span><i class="poco"></i> ${T('Corto')}</span>
        </div>
      </div>`;
  }

  V.nutricion = function () {
    const p = Perfil.datos();
    if (!Perfil.completo(p)) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} ${T('Perfil')}</button>
        <h1>${T('Alimentación')}</h1>
        <div class="empty">${raw(icon('nutricion'))}
          <p>${T('Necesito tu peso, altura, edad y sexo para calcular tus calorías.')}</p>
          <button class="btn primary" data-a="datos">${T('Completar mis datos')}</button>
        </div>`;
    }

    const m = Perfil.macros(p);
    const menus = g.Menus ? Menus.lista() : [];
    const activo = g.Menus ? Menus.activoId() : '';

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Perfil')}</button>
      <h1>${T('Alimentación')}</h1>
      <p class="muted">${T('Calculado a partir de tus datos con la fórmula de Mifflin-St Jeor. Es una orientación, no una pauta médica.')}</p>

      ${raw(numerosHTML(m))}
      ${raw(comidasHoyHTML(m))}
      ${raw(semanaComidaHTML(m))}

      <div class="list-title">${T('Mis números')}</div>
      <div class="card tarjeta-premium campos">
        ${raw(filaSimple(T('Gasto diario estimado'), UI.num(Math.round(Perfil.tdee(p))) + ' kcal'))}
        ${raw(filaSimple(T('Objetivo'), T((Perfil.OBJETIVO[p.objetivo] || {}).label)))}
        ${raw(filaSimple(T('Agua al día'), Perfil.agua(p) + ' L'))}
        ${raw(filaSimple(T('Comidas al día'), String(p.comidas)))}
      </div>

      <div class="list-title">${T('Con qué cocino')}</div>
      <div class="card tarjeta-premium">
        <p class="muted" style="margin:0 0 10px;font-size:.88rem">${T('Un menú con ingredientes que no tienes —o que ni conoces— no lo sigue nadie. Dime con qué sueles cocinar y el menú sale de ahí.')}</p>

        <label class="tiny">${T('LO QUE SUELES TENER O COMPRAR')}</label>
        <textarea id="nu-despensa" rows="4" placeholder="${T('Ej. arroz, pasta, lentejas, huevos, pollo, atún en lata, yogur griego, plátano, avena, aceite de oliva, tomate, cebolla, pan integral')}">${p.despensa || ''}</textarea>
        <p class="tiny" style="margin:6px 0 0">${T('Ponlo a tu manera, separado por comas. Si para cuadrar tus números hiciera falta algo que no esté aquí, te lo dirá aparte en vez de colártelo en un plato.')}</p>

        <div class="hr"></div>
        <label class="tiny">${T('¿LE PIDES ALGO CONCRETO AL ENTRENADOR?')}</label>
        <div class="tiny" style="margin:2px 0 6px">${T('Lo de arriba es con qué cuentas; esto son órdenes. Manda sobre lo demás, menos sobre tus alergias y tus condiciones de salud.')}</div>
        <textarea id="nu-ordenes" rows="3" placeholder="${T('Ej. nada de pescado; la cena siempre ligera; el desayuno que se prepare en cinco minutos; los domingos cocino para toda la semana')}">${p.ordenesComida || ''}</textarea>
      </div>

      <!-- Las horas de comer se fueron a Perfil › Ajustes. Aquí estaban
           enterradas debajo de la despensa y las órdenes al entrenador, y no son
           de esta pantalla: no se tocan al montar un menú, se ponen una vez y
           las usan el cruce de las fotos, las alertas de comer, el reparto de
           los suplementos y el propio menú. Un dato del que depende media app
           no vive dentro de una de sus pantallas. -->

      <div class="row between" style="margin-top:20px;align-items:center">
        <span class="list-title" style="margin:0">${T('Mis menús')}</span>
        <!-- Siempre el mismo botón, con IA o sin ella: desde que se puede crear
             un menú genérico, mandar a configurar el entrenador era negarle a
             quien no lo tiene la única forma que sí podía usar. La hoja ya
             ofrece las dos, y la de IA lleva a configurarla si hace falta. -->
        ${raw(menus.length
          ? '<button class="btn primary sm btn-arranque" data-a="generar">' +
            icon('plus') + ' ' + esc(T('Nuevo')) + '</button>'
          : '')}
      </div>

      ${raw(menus.length
        ? menus.map(function (x, i) { return menuCaja(x, i, x.id === activo, p); }).join('')
        : html`
        <div class="card tarjeta-premium">
          <p class="muted" style="margin:0 0 12px;font-size:.9rem">${T('Un menú semanal que cuadre con tus calorías, tu dieta, lo que no puedes comer y lo que tienes en casa. Lo prepara el entrenador con IA, o se hace uno genérico con tus números si prefieres poner tú los platos. Puedes guardar los que quieras —el de la semana fuerte, el de cuando viajas— y marcar cuál manda.')}</p>
          <button class="btn primary block btn-arranque" data-a="generar">
            ${raw(icon('plus'))} ${T('Crear mi primer menú')}</button>
        </div>`)}

      ${raw(menus.length > 1 ? html`
        <p class="tiny" style="margin-top:12px">El menú marcado como principal es el que
        sale en «hoy» y en la portada. Los demás siguen aquí.</p>` : '')}`;
  };

  /* ---------- el objetivo del día ----------
     Eran cuatro cifras en fila, la barra de macros debajo y su leyenda más
     abajo repitiendo los mismos tres nombres que ya estaban escritos arriba.

     Ahora manda la cifra que manda —las calorías— y los tres macros van en sus
     propias láminas, cada una teñida de su color, con los gramos, el nombre y
     el porcentaje del total. La leyenda sobra: el color ya está en la lámina,
     al lado de su nombre, que es donde sirve. */
  function numerosHTML(m) {
    const pct = function (gr, cal) { return Math.round(gr * cal / m.kcal * 100); };

    const macro = function (color, gramos, nombre, porciento) {
      return '<div class="nu-macro" style="--mc:' + color + '">' +
        '<span class="nm-cif">' + gramos + '<i>g</i></span>' +
        '<span class="nm-nom">' + esc(nombre) + '</span>' +
        '<span class="nm-pct">' + esc(Tn('{n}% de las kcal', { n: porciento })) + '</span>' +
        '</div>';
    };

    return html`
      <div class="card tarjeta-premium nu-objetivo">
        <div class="pre-encima">${T('Tu objetivo del día')}</div>
        <div class="nu-kcal"><b>${UI.num(m.kcal)}</b><span>kcal</span></div>

        <div class="macro-bar nu-bar">
          <i style="width:${pct(m.prot, 4)}%;background:var(--brand-1)"></i>
          <i style="width:${pct(m.carbo, 4)}%;background:var(--acc)"></i>
          <i style="width:${pct(m.grasa, 9)}%;background:var(--warn)"></i>
        </div>

        <div class="nu-macros">
          ${raw(macro('var(--brand-1)', m.prot, T('Proteína'), pct(m.prot, 4)))}
          ${raw(macro('var(--acc)', m.carbo, T('Hidratos'), pct(m.carbo, 4)))}
          ${raw(macro('var(--warn)', m.grasa, T('Grasa'), pct(m.grasa, 9)))}
        </div>
      </div>`;
  }

  /* El aro de las calorías del día. Una barra dice «vas por aquí»; un aro dice
     además cuánto falta para cerrarlo, que es la forma en que uno se mira el
     día: no como un tramo recorrido sino como algo que se completa.

     El hueco del centro lleva lo comido, porque es el número que se busca. */
  function aroKcal(hechas, meta) {
    const p = Math.max(0, Math.min(1, meta ? hechas / meta : 0));
    const R = 31, C = 2 * Math.PI * R;

    return '<div class="nu-aro">' +
      '<svg viewBox="0 0 72 72" aria-hidden="true">' +
      '<circle class="ak-pista" cx="36" cy="36" r="' + R + '"/>' +
      '<circle class="ak-hecho" cx="36" cy="36" r="' + R + '" ' +
      'stroke-dasharray="' + C.toFixed(1) + '" ' +
      'stroke-dashoffset="' + (C * (1 - p)).toFixed(1) + '"/>' +
      '</svg>' +
      '<span class="ak-centro"><b>' + Math.round(p * 100) + '</b><i>%</i></span>' +
      '</div>';
  }

  /* Una barra de las de esta pantalla: raíl hundido, relleno con su degradado y
     un punto de luz en la punta, que es lo que hace que se lea como algo que
     avanza y no como un rectángulo pintado. */
  function barra(porciento, color) {
    return '<div class="nu-barra"><i style="width:' + porciento + '%;--bc:' + color +
      '"></i></div>';
  }

  /* ---------- un menú, en su caja ----------
     La misma caja que un plan de entrenamiento, y por lo mismo: son lo mismo
     —una cosa guardada, con nombre, que se abre para verla y que puede ser la
     que manda—. Plegada de entrada, con su color, su marca de «en curso» y las
     acciones al deslizar. Abierta, el menú entero y lo que se le puede hacer. */
  function menuCaja(menu, i, esActivo, p) {
    const abierto = menusAbiertos[menu.id] === true;
    const plan = menu.plan || {};
    const dias = (plan.dias || []).length;
    const comidas = (plan.dias || []).reduce(function (n, d) {
      return n + ((d.comidas || []).length);
    }, 0);
    const viejo = estaViejo(menu, p);

    const cabecera = html`
      <button class="dia-grupo" data-menu="${menu.id}">
        <div class="grow">
          <div class="rt-titulo">${menu.nombre}
            ${raw(esActivo ? '<span class="chip tiny-chip plan-marca">' +
              esc(T('EN CURSO')) + '</span>' : '')}
            ${raw(viejo ? '<span class="chip tiny-chip">' + esc(T('DE ANTES')) + '</span>' : '')}</div>
          <div class="tiny plan-meta">${Tp(dias, '{n} día', '{n} días')} ·
            ${Tp(comidas, '{n} comida', '{n} comidas')} · ${UI.fechaCorta(menu.t)}</div>
        </div>
        <span class="plegador ${abierto ? 'abierto' : ''}">
          <span class="plegador-txt">${abierto ? T('Ocultar') : T('Ver')}</span>
          ${raw(icon('chevron'))}</span>
      </button>`;

    const desliza = App.deslizable ? App.deslizable(cabecera, [
      { icono: 'copiar', texto: T('Duplicar'), attr: 'data-duplicarmenu="' + esc(menu.id) + '"' },
      { icono: 'trash', texto: T('Borrar'), tono: 'malo',
        attr: 'data-borrarmenu="' + esc(menu.id) + '"' }
    ], [
      { icono: esActivo ? 'close' : 'check',
        texto: esActivo ? T('Quitar') + BAJA + T('principal')
          : T('Marcar') + BAJA + T('principal'),
        tono: esActivo ? '' : 'suave',
        attr: 'data-menuactivo="' + (esActivo ? '' : esc(menu.id)) + '"' },
      { icono: 'edit', texto: T('Renombrar'), tono: 'suave',
        attr: 'data-renombrarmenu="' + esc(menu.id) + '"' }
    ]) : cabecera;

    return html`
      <div class="plan-caja${raw(abierto ? ' abierta' : '')}"
           style="--tono:${g.Menus ? Menus.tono(i) : 'var(--acc)'}">
        ${raw(desliza)}
        ${raw(abierto
          ? '<div class="menu-cuerpo">' +
            (viejo ? avisoViejoHTML() : '') + planHTML(menu) +
            accionesMenuHTML(menu, esActivo) + '</div>'
          : '')}
      </div>`;
  }

  function avisoViejoHTML() {
    return html`
      <div class="card" style="border-color:var(--warn)">
        <b>${T('Este menú es de antes')}</b>
        <p class="tiny" style="margin:6px 0 0">${T('Has cambiado algo desde que se hizo ' +
        '—los ingredientes, lo que le pides o tus números—, así que puede llevar cosas ' +
        'que ya no encajan. Rehazlo y se vuelve a montar con lo de ahora.')}</p>
        ${raw(IA.activa() ? '<button class="btn block sm" data-a="regenerar" ' +
          'style="margin-top:10px">' + icon('chispa') + ' ' +
          esc(T('Rehacer este menú')) + '</button>' : '')}
      </div>`;
  }

  /* Lo que se le puede hacer a un menú entero, con el mismo patrón que las
     acciones de un plan: una fila por cosa, cada una con su icono de color, y
     la de borrar aparte abajo, que es lo único irreversible. */
  function accionesMenuHTML(menu, esActivo) {
    const id = esc(menu.id);

    const fila = function (attr, ico, color, titulo, sub, extra) {
      return '<button class="fila-plan' + (extra || '') + '" ' + attr +
        ' style="--fp:' + color + '">' +
        '<span class="fp-ico">' + icon(ico) + '</span>' +
        '<span class="grow"><span class="fp-tit">' + esc(titulo) + '</span>' +
        (sub ? '<span class="fp-sub">' + esc(sub) + '</span>' : '') + '</span>' +
        '<span class="chevron">' + icon('chevron') + '</span></button>';
    };

    return '<div class="plan-acciones">' +
      (esActivo
        ? fila('data-menuactivo=""', 'check', 'var(--tono)',
            T('Dejar de ser el menú principal'),
            T('Ahora manda este: es el que sale en «hoy» y en la portada.'), ' es-principal')
        : fila('data-menuactivo="' + id + '"', 'check', 'var(--tono)',
            T('Usar este como menú principal'),
            T('Será el que salga en «hoy» y en la portada.'))) +

      fila('data-renombrarmenu="' + id + '"', 'edit', '#f0a23c', T('Cambiarle el nombre'),
        T('Para saber cuál es sin abrirlo.')) +

      (IA.activa()
        ? fila('data-a="regenerar"', 'chispa', '#c06bf0', T('Rehacer este menú'),
            T('Se monta otro con tus números y tus ingredientes de ahora.'))
        : '') +

      fila('data-duplicarmenu="' + id + '"', 'copiar', '#4f8cf5', T('Duplicar el menú'),
        T('Una copia para probar cambios sin tocar este.')) +

      fila('data-borrarmenu="' + id + '"', 'trash', 'var(--bad)', T('Borrar el menú'),
        T('No se puede deshacer.'), ' es-peligro') +
      '</div>';
  }

  /* Lo que llevas hoy contra lo que te toca. Es la pregunta de verdad —¿voy
     corto de proteína?— y hasta ahora la app decía el objetivo y se
     desentendía de si se cumplía. */
  function comidasHoyHTML(m) {
    if (!g.Comidas) return '';
    const h = Comidas.hoy();
    const pk = Math.min(100, Math.round(h.kcal / m.kcal * 100));
    const pp = Math.min(100, Math.round(h.prot / m.prot * 100));
    const faltaProt = Math.max(0, m.prot - h.prot);
    const faltaKcal = Math.max(0, m.kcal - h.kcal);

    return html`
      <div class="list-title">${T('Hoy')}</div>
      <div class="card tarjeta-premium nu-hoy">
        <div class="nu-hoy-cab">
          ${raw(aroKcal(h.kcal, m.kcal))}
          <div class="grow" style="min-width:0">
            <div class="nu-grande">${UI.num(h.kcal)}<i>${Tn('de {n} kcal',
              { n: UI.num(m.kcal) })}</i></div>
            <div class="nu-falta">${raw(faltaKcal > 0
              ? Tn('Te quedan <b>{n}</b> kcal', { n: UI.num(faltaKcal) })
              : esc(T('Objetivo de calorías cubierto')))}</div>
          </div>
        </div>

        <div class="nu-linea">
          <span class="nl-nom"><i class="dot" style="background:var(--brand-1)"></i>
            ${T('Proteína')}</span>
          <span class="nl-cif">${h.prot}<i> ${Tn('de {n} g', { n: m.prot })}</i></span>
        </div>
        ${raw(barra(pp, 'var(--brand-1)'))}

        <p class="tiny" style="margin:10px 0 0">${raw(faltaProt > 0
          ? Tn('Te faltan <b>{n} g de proteína</b> para llegar al objetivo del día.',
              { n: faltaProt })
          : esc(T('Proteína del día cubierta.')))}</p>

        <div class="row" style="margin-top:13px;gap:9px">
          <label class="btn primary grow btn-arranque" for="foto-comida" style="cursor:pointer">
            ${raw(icon('camara'))} ${T('Foto de lo que comes')}</label>
          <button class="btn icon-vidrio" data-a="comidaMano"
                  aria-label="${T('Apuntar a mano')}"
                  title="${T('Apuntar a mano')}">${raw(icon('plus'))}</button>
        </div>
        <input type="file" id="foto-comida" accept="image/*" capture="environment" hidden>
        <p class="tiny" style="margin:9px 0 0">${T('La foto se encoge en el móvil, se manda para que la IA la lea y se suelta: no se guarda ni aquí ni en ningún sitio. Solo quedan el nombre del plato y los números.')}</p>
      </div>

      <div id="comida-pensando"></div>

      ${raw(historialHTML(m))}`;
  }

  /* Qué días quedan abiertos. Vive fuera del pintado porque la app repinta la
     pantalla entera a cada cambio —al borrar un plato, por ejemplo— y sin esto
     el día que acabas de abrir se te cierra en la cara. */
  const diasAbiertos = {};

  /* Lo comido, por días y plegado.
     Registrando de verdad son cinco o seis platos diarios: en una semana la
     lista plana pasaba de cuarenta filas y el día de hoy quedaba enterrado.
     Cada día es una fila con su total; se abre el que interese. */
  function historialHTML(m) {
    const dias = Comidas.porDias(60);
    if (!dias.length) return '';

    /* Todo plegado, hoy incluido: los totales del día ya están arriba, en la
       tarjeta grande, así que abrir hoy solo alargaba la pantalla repitiendo lo
       que ya se ve. Se abre lo que se quiera mirar. */
    const hoyClave = Comidas.claveDia();

    return html`
      <div class="list-title" style="margin-top:18px">${T('Lo que has comido')}</div>
      <div class="stack">
        ${raw(dias.map(function (d) { return diaComidasHTML(d, m, hoyClave); }).join(''))}
      </div>`;
  }

  function diaComidasHTML(d, m, hoyClave) {
    const abierto = !!diasAbiertos[d.dia];
    const cuantos = d.lista.length;
    /* El objetivo de proteína es el de hoy; para días pasados sirve igual de
       referencia, que el objetivo no cambia de un día para otro. */
    const cumple = m && m.prot && d.prot >= m.prot;

    return html`
      <details class="dia-comidas" data-dia="${d.dia}"${raw(abierto ? ' open' : '')}>
        <summary>
          <span class="row-icon dia-flecha">${raw(icon('chevron'))}</span>
          <div class="grow">
            <div class="dia-nombre">${nombreDeDia(d, hoyClave)}</div>
            <div class="tiny">${Tp(cuantos, '{n} registro', '{n} registros')}</div>
          </div>
          <div class="dia-suma">
            <b>${UI.num(d.kcal)}</b><span class="tiny"> kcal</span>
            <div class="tiny"${raw(cumple ? ' style="color:var(--brand-1)"' : '')}>${
              Tn('{n} g de proteína', { n: d.prot })}</div>
          </div>
        </summary>
        <div class="stack" style="padding:0 0 11px">
          ${raw(d.lista.map(comidaFilaHTML).join(''))}
        </div>
      </details>`;
  }

  /* «Hoy», «Ayer» y, más atrás, el día de la semana con su fecha: es como se
     acuerda uno de lo que comió, no por «2026-09-07». */
  function nombreDeDia(d, hoyClave) {
    if (d.dia === hoyClave) return T('Hoy');
    const ayer = Comidas.claveDia(Date.now() - 864e5);
    if (d.dia === ayer) return T('Ayer');
    const p = d.dia.split('-');
    const f = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return UI.diaLargo(UI.DAY_NAMES[f.getDay()]) + ' ' + UI.fechaCorta(f.getTime());
  }

  function comidaFilaHTML(c) {
    const dudosa = c.confianza === 'baja';
    return html`
      <div class="card" style="padding:11px 13px">
        <div class="row between" style="align-items:flex-start;gap:10px">
          <div class="grow">
            <div style="font-weight:600;font-size:.92rem">${c.plato}</div>
            <div class="tiny">${Tn('{kcal} kcal · {prot} g de proteína',
              { kcal: UI.num(c.kcal), prot: c.prot })}
              · ${raw(UI.hora ? UI.hora(c.t) : new Date(c.t).toTimeString().slice(0, 5))}
              ${raw(dudosa ? ' · <span style="color:var(--warn)">' +
                esc(T('estimación floja')) + '</span>' : '')}</div>
            ${raw(c.detalle ? '<div class="tiny" style="margin-top:3px">' +
              esc(c.detalle) + '</div>' : '')}
          </div>
          <button class="btn icon sm danger" data-borrar-comida="${c.id}"
                  aria-label="${T('Borrar')}">${raw(icon('trash'))}</button>
        </div>
      </div>`;
  }

  function filaSimple(titulo, valor) {
    return '<div class="list-row"><div class="grow"><div class="list-row-title">' +
      esc(titulo) + '</div></div><span class="list-row-val">' + esc(valor) + '</span></div>';
  }

  /* La hidratación va aparte y arriba: es la parte del plan que más se olvida */
  function planHTML(menu) {
    const plan = menu.plan || {};
    return html`
      ${raw(plan.resumen ? html`
        <div class="card tarjeta-premium">
          <div class="pre-encima">${Tn('Creado el {fecha}', { fecha: UI.fecha(menu.t) })}</div>
          <p class="muted" style="margin:6px 0 0;font-size:.9rem">${plan.resumen}</p>
        </div>` : html`
        <p class="tiny" style="margin:0 0 10px">${Tn('Creado el {fecha}',
          { fecha: UI.fecha(menu.t) })}</p>`)}

      ${raw(Marcar.aguaHTML(plan.hidratacion, menu.id))}

      <div class="stack" style="margin-top:11px">
        ${raw((plan.dias || []).map(function (d, i) {
          const k = menu.id + '-' + i;
          const hoy = Menus.esElDiaDeHoy(d, i, plan.dias.length);
          return html`
            <div class="card menu-dia${raw(hoy ? ' es-hoy' : '')}">
              <div class="row between" data-dia="${k}" style="cursor:pointer">
                <div class="grow" style="min-width:0">
                  <div class="md-nom">${T(d.dia)}${raw(hoy
                    ? ' <span class="chip solid tiny-chip">' + esc(T('HOY')) + '</span>' : '')}${raw(d.entreno
                    ? ' <span class="chip tiny-chip">' + esc(T('ENTRENO')) + '</span>' : '')}</div>
                  <div class="tiny md-meta">${d.total
                    ? Tn('{kcal} kcal · {prot} g de proteína',
                        { kcal: UI.num(d.total.kcal), prot: d.total.prot })
                    : Tp((d.comidas || []).length, '{n} comida', '{n} comidas')}</div>
                </div>
                <span class="chevron down${raw(diasAbiertosPlan[k]
                  ? ' abierto' : '')}">${raw(icon('chevron'))}</span>
              </div>
              <div class="stack" data-cuerpo="${k}"${raw(diasAbiertosPlan[k]
                ? '' : ' hidden')} style="margin-top:11px">
                ${raw((d.comidas || []).map(function (c, j) {
                  return Marcar.platoHTML(menu.id, i, j, c, hoy);
                }).join(''))}
              </div>
            </div>`;
        }).join(''))}
      </div>

      ${raw((plan.compra || []).length ? html`
        <div class="list-title">Lista de la compra</div>
        <div class="card">
          <div class="row wrap" style="gap:6px">
            ${raw(plan.compra.map(function (x) {
              return '<span class="chip">' + esc(x) + '</span>';
            }).join(''))}
          </div>
        </div>` : '')}

      ${raw(plan.flexibilidad ? html`
        <div class="card destacado-clave" style="margin-top:14px">
          <h3 class="guia-h">${raw(icon('chispa'))} Hasta dónde puedes salirte</h3>
          <p style="margin:0">${plan.flexibilidad}</p>
        </div>` : '')}

      ${raw((plan.consejos || []).length ? html`
        <div class="list-title">${T('Consejos')}</div>
        <div class="card"><ol class="instr">
          ${raw(plan.consejos.map(function (x) { return '<li>' + esc(T(x)) + '</li>'; }).join(''))}
        </ol></div>` : '')}

      <div class="list-title">¿No te encaja?</div>
      <div class="card tarjeta-premium">
        <p class="muted" style="margin:0 0 10px;font-size:.88rem">Dile qué cambiarías y lo
        rehace con eso delante. Lo que escribas aquí se guarda con tus preferencias, así
        que los siguientes menús también lo tendrán en cuenta.</p>
        <textarea id="nu-cambios" rows="3" placeholder="Ej. demasiada merluza, cambia el pescado por carne; el desayuno que sea más rápido; quita el pan"></textarea>
        <button class="btn primary block btn-arranque" data-a="rehacerCon" style="margin-top:10px">
          ${raw(icon('chispa'))} Rehacer este menú con esto</button>
        <button class="btn block sm" data-a="otroMenu" style="margin-top:8px">
          ${raw(icon('plus'))} ${T('Guardar otro distinto, sin tocar este')}</button>
      </div>

      <p class="tiny" style="margin-top:14px">${T('Generado por IA a partir de tus datos. ' +
      'Revísalo con criterio y consulta a un dietista si tienes alguna condición de salud.')}</p>`;
  }

  /* Manda la foto, apunta lo que la IA vea y suelta la imagen. Mientras piensa
     se enseña la foto en pequeño, que es la única copia que existe y vive en
     memoria hasta que se acaba. */
  function mirarFoto(file) {
    if (!IA.activa()) {
      UI.toast(T('Esto necesita un proveedor de IA con su clave, en la bóveda de Ajustes.'));
      go('entrenador');
      return;
    }

    /* La caja donde se enseña la foto mientras se piensa. Se busca en el
       documento y no dentro de una pantalla concreta: la misma función la usan
       Alimentación y el acceso rápido de la portada. */
    const caja = document.getElementById('comida-pensando');
    let foto = null;

    const soltar = function () {
      foto = null;                      // la imagen deja de existir aquí
      if (caja) caja.innerHTML = '';
    };

    Comidas.prepararFoto(file).then(function (f) {
      foto = f;
      if (caja) {
        caja.innerHTML = html`
          <div class="card row" style="margin-top:11px;gap:12px;align-items:center">
            <img src="${f.vista}" alt="" style="width:64px;height:64px;object-fit:cover;
                 border-radius:10px;flex:none">
            <div class="grow">
              <div style="font-weight:600;font-size:.9rem">Mirando el plato…</div>
              <div class="tiny">La foto se borra en cuanto termine.</div>
            </div>
            <div class="spinner" style="flex:none"></div>
          </div>`;
      }
      /* Antes de mirarla a secas: si el menú dice que a esta hora toca el
         desayuno, esta foto ES el desayuno. Cruzarla evita que el día cuente
         dos cosas —lo que comió por un lado, lo que tenía previsto por otro—
         sin saber nunca si lo cumplió. Si no hay con qué cruzar, sigue por el
         camino de siempre. */
      const img = { mime: f.mime, datos: f.datos };
      if (g.Marcar && Marcar.cruzarFoto) {
        return Marcar.cruzarFoto(img).then(function (x) {
          if (x && x.cruzado) return null;
          return IA.analizarComida(img);
        });
      }
      return IA.analizarComida(img);
    }).then(function (r) {
      soltar();
      /* null = ya lo ha resuelto el cruce con el menú */
      if (r === null) return;
      if (!r || !(Number(r.kcal) > 0)) {
        UI.toast(T('No he visto comida en esa foto. Prueba con más luz o más cerca.'));
        return;
      }
      const detalle = (r.alimentos || []).map(function (a) {
        return a.que + (a.cuanto ? ' (' + a.cuanto + ')' : '');
      }).join(', ');

      Comidas.anotar({
        plato: r.plato || T('Comida'),
        kcal: r.kcal, prot: r.prot, carbo: r.carbo, grasa: r.grasa,
        detalle: detalle || r.nota || '',
        confianza: r.confianza || '',
        fuente: 'foto'
      });
      render();
      UI.toast(Tn('Anotado: {kcal} kcal y {prot} g de proteína',
        { kcal: Math.round(r.kcal), prot: Math.round(r.prot) }) +
        (r.confianza === 'baja' ? T(' (a ojo, retócalo si quieres)') : ''));
    }).catch(function (e) {
      soltar();
      UI.toast(e.message || T('No he podido leer esa foto.'));
    });
  }

  /* A mano, para lo que no tiene foto o para corregir lo que la IA no acertó */
  function comidaAMano() {
    const conIA = IA.activa() && IA.estimarComida;

    UI.modal(html`
      <h2>${T('Apuntar a mano')}</h2>
      <p class="muted">${conIA
        ? T('Escribe lo que has comido y yo calculo las calorías y la proteína. Si ya te ' +
          'sabes los números, pónlos tú y mando los tuyos.')
        : T('Para lo que ya sabes de memoria, o para arreglar una estimación que se ' +
          'quedó corta.')}</p>

      <label class="tiny">${T('QUÉ HAS COMIDO')}</label>
      <input id="cm-plato" placeholder="${T('Ej. arroz con lentejas y carne asada')}" autocomplete="off">

      ${raw(conIA ? html`
        <button class="btn block sm" id="cm-calcular" style="margin-top:10px">
          ${raw(icon('chispa'))} ${T('Calcular con IA')}</button>` : '')}

      <div id="cm-visto" class="tiny" style="margin-top:10px"></div>

      <div class="row" style="margin-top:10px">
        <div class="grow">
          <label class="tiny">${T('CALORÍAS')}</label>
          <input id="cm-kcal" type="number" inputmode="numeric" min="0" placeholder="0">
        </div>
        <div class="grow">
          <label class="tiny">${T('PROTEÍNA (g)')}</label>
          <input id="cm-prot" type="number" inputmode="numeric" min="0" placeholder="0">
        </div>
      </div>

      <button class="btn primary block" id="cm-ok" style="margin-top:14px">${T('Anotar')}</button>`,
      function (el) {
        const campoPlato = el.querySelector('#cm-plato');
        const campoKcal = el.querySelector('#cm-kcal');
        const campoProt = el.querySelector('#cm-prot');
        const visto = el.querySelector('#cm-visto');
        const btnCalc = el.querySelector('#cm-calcular');
        const btnOk = el.querySelector('#cm-ok');
        let detalle = '';
        let confianza = '';
        /* El formulario solo pide calorías y proteína —son las que se saben de
           memoria—, pero si ha pasado por la IA también hay hidratos y grasa, y
           tirarlos sería quedarse sin el reparto del día por no guardar dos
           números que ya están calculados. */
        let carbo = 0;
        let grasa = 0;

        /* Rellena los números con lo que calcule la IA, pero SIN guardar: lo que
           sale de una estimación se mira antes, y si algo no cuadra se corrige
           encima. */
        const calcular = function () {
          const t = campoPlato.value.trim();
          if (!t) { UI.toast(T('Escribe antes qué has comido')); campoPlato.focus(); return; }
          if (btnCalc) { btnCalc.disabled = true; btnCalc.textContent = T('Calculando…'); }
          visto.textContent = '';

          return IA.estimarComida(t).then(function (r) {
            if (!r || !(Number(r.kcal) > 0)) {
              visto.innerHTML = '<span style="color:var(--warn)">' +
                esc((r && r.nota) || T('No he sabido qué es eso. Pon tú los números.')) + '</span>';
              return;
            }
            campoKcal.value = Math.round(r.kcal);
            campoProt.value = Math.round(r.prot || 0);
            if (r.plato) campoPlato.value = r.plato;
            carbo = Math.round(r.carbo || 0);
            grasa = Math.round(r.grasa || 0);

            detalle = (r.alimentos || []).map(function (a) {
              return a.que + (a.cuanto ? ' (' + a.cuanto + ')' : '');
            }).join(', ');
            confianza = r.confianza || '';

            visto.innerHTML = (detalle ? esc(detalle) + '<br>' : '') +
              '<span style="opacity:.8">' + esc(r.nota ||
                T('Estimación: corrige los números si no te cuadra.')) +
              '</span>';
          }).catch(function (e) {
            visto.innerHTML = '<span style="color:var(--bad)">' +
              esc(e.message || T('No he podido calcularlo.')) + '</span>';
          }).then(function () {
            if (btnCalc) {
              btnCalc.disabled = false;
              btnCalc.innerHTML = icon('chispa') + ' ' + esc(T('Calcular con IA'));
            }
          });
        };

        const guardar = function () {
          const plato = campoPlato.value.trim();
          const kcal = Number(campoKcal.value) || 0;
          const prot = Number(campoProt.value) || 0;

          /* Sin números y con IA disponible, se calculan y SE GUARDA. Antes esto
             solo rellenaba los campos y esperaba un segundo toque en Anotar:
             daba igual lo claro que fuera el aviso, uno le da a Anotar, ve los
             números aparecer y cierra convencido de que ya está apuntado. Se
             quedaba sin guardar. Quien quiera revisar antes tiene el botón de
             calcular; Anotar apunta. */
          if (!kcal && !prot) {
            if (conIA && plato) {
              btnOk.disabled = true;
              btnOk.textContent = T('Calculando…');
              calcular().then(function () {
                btnOk.disabled = false;
                btnOk.textContent = T('Anotar');
                if (Number(campoKcal.value) > 0) guardar();
              });
              return;
            }
            UI.toast(plato ? T('Pon al menos las calorías o la proteína')
              : T('Escribe qué has comido'));
            return;
          }

          Comidas.anotar({
            plato: plato || T('Comida'), kcal: kcal, prot: prot,
            carbo: carbo, grasa: grasa,
            detalle: detalle, confianza: confianza,
            fuente: detalle ? 'texto' : 'mano'
          });
          UI.closeModal();
          render();
          UI.toast(detalle
            ? Tn('Anotado: {kcal} kcal y {prot} g de proteína',
                { kcal: UI.num(kcal), prot: prot })
            : T('Anotado'));
        };

        if (btnCalc) btnCalc.onclick = calcular;
        btnOk.onclick = guardar;
        campoProt.onkeydown = function (ev) { if (ev.key === 'Enter') guardar(); };
        campoPlato.onkeydown = function (ev) {
          if (ev.key === 'Enter' && conIA) { ev.preventDefault(); calcular(); }
        };
      });
  }

  /* Las usa también la portada y la pantalla del día, que tienen sus propios
     botones de cámara y de apuntar a mano. */
  V.mirarFotoComida = mirarFoto;
  V.comidaAMano = comidaAMano;

  V.nutricion.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=datos]', function () { go('datos'); });
    bind(root, '[data-a=configIA]', function () { go('entrenador'); });

    /* ---- lo que has comido hoy ---- */
    /* Abrir y cerrar no repinta nada: solo se apunta, para que el repintado
       siguiente respete lo que tenías abierto. */
    root.querySelectorAll('details.dia-comidas').forEach(function (el) {
      el.addEventListener('toggle', function () {
        if (el.open) diasAbiertos[el.dataset.dia] = true;
        else delete diasAbiertos[el.dataset.dia];
      });
    });

    bindAll(root, '[data-borrar-comida]', function (el) {
      Comidas.borrar(el.dataset.borrarComida);
      render();
      UI.toast('Borrado');
    });

    bind(root, '[data-a=comidaMano]', function () { comidaAMano(); });

    /* Se guardan mientras se escribe, como en el perfil: esperar a salir del
       campo se traga lo escrito cuando uno cambia de pantalla sin más. */
    [['#nu-despensa', 'despensa'], ['#nu-ordenes', 'ordenesComida']].forEach(function (par) {
      const campo = root.querySelector(par[0]);
      if (!campo) return;
      const guardar = function () {
        const cambio = {};
        cambio[par[1]] = campo.value.trim();
        Perfil.guardar(cambio);
      };
      campo.addEventListener('input', function () {
        clearTimeout(campo._espera);
        campo._espera = setTimeout(guardar, 500);
      });
      campo.onchange = guardar;
    });

    const campoFoto = root.querySelector('#foto-comida');
    if (campoFoto) campoFoto.onchange = function () {
      const file = campoFoto.files && campoFoto.files[0];
      /* se vacía ya: si no, elegir dos veces la misma foto no dispara nada */
      campoFoto.value = '';
      if (file) mirarFoto(file);
    };

    bindAll(root, '[data-dia]', function (el) {
      const k = el.dataset.dia;
      const c = root.querySelector('[data-cuerpo="' + CSS.escape(k) + '"]');
      if (!c) return;
      c.hidden = !c.hidden;
      if (c.hidden) delete diasAbiertosPlan[k]; else diasAbiertosPlan[k] = true;
      el.querySelector('.chevron').classList.toggle('abierto', !c.hidden);
    });

    /* Marcar comidas y agua lo lleva su módulo: lo mismo sale en la
       portada y en «mi día», y tres copias se separan en dos semanas. */
    Marcar.bind(root);

    /* ---- los menús ---- */

    bindAll(root, '[data-menu]', function (el) {
      const id = el.dataset.menu;
      if (menusAbiertos[id]) { delete menusAbiertos[id]; render(); return; }

      menusAbiertos[id] = true;
      /* Y con el menú, el día de hoy abierto. Es el que se viene a mirar, y
         dejarlo cerrado obliga a buscarlo entre siete iguales antes de poder
         hacer nada con él. Solo la primera vez: si lo cerraste a mano, se
         respeta. */
      abrirHoyDe(id);
      render();
    });

    bindAll(root, '[data-menuactivo]', function (el) {
      Menus.marcarActivo(el.dataset.menuactivo || '');
      render();
      UI.toast(el.dataset.menuactivo
        ? Tn('Ahora manda «{que}»',
            { que: (Menus.porId(el.dataset.menuactivo) || {}).nombre })
        : T('Sin menú principal'));
    });

    bindAll(root, '[data-renombrarmenu]', function (el) {
      const m = Menus.porId(el.dataset.renombrarmenu);
      if (m) renombrarMenuSheet(m);
    });

    bindAll(root, '[data-duplicarmenu]', function (el) {
      const copia = Menus.duplicar(el.dataset.duplicarmenu);
      if (copia) {
        menusAbiertos[copia.id] = true;
        render();
        UI.toast(Tn('Copiado como «{que}»', { que: copia.nombre }));
      }
    });

    bindAll(root, '[data-borrarmenu]', function (el) {
      const m = Menus.porId(el.dataset.borrarmenu);
      if (!m) return;
      UI.confirm(Tn('Borrar «{que}»', { que: m.nombre }),
        T('Se quita de tus menús. No se puede deshacer.'), T('Borrar'), true)
        .then(function (ok) {
          if (!ok) return;
          delete menusAbiertos[m.id];
          Menus.borrar(m.id);
          render();
          UI.toast(T('Menú borrado'));
        });
    });

    /* Rehacer un menú que ya existe: la respuesta ocupa su sitio y conserva su
       nombre. Crear uno nuevo NO pasa por aquí —tiene su hoja, con sus
       preferencias y su paso de mirarlo antes de guardarlo—, porque pedir y
       guardar a ciegas era justo el problema. */
    const rehacerMenu = function (sobre) {
      if (!sobre) { UI.toast(T('Abre el menú que quieres rehacer')); return; }
      const btn = root.querySelector('[data-a=regenerar]');
      if (btn) { btn.disabled = true; btn.textContent = T('Rehaciendo el menú…'); }

      IA.planNutricion({ forzar: true, variante: Date.now() % 1000 })
        .then(function (plan) {
          Menus.actualizar(sobre.id, { plan: plan, t: Date.now(), huella: huellaMenu() });
          menusAbiertos[sobre.id] = true;
          render();
          UI.toast(Tn('«{que}» rehecho', { que: sobre.nombre }));
        })
        .catch(function (e) {
          if (btn) { btn.disabled = false; }
          render();
          UI.toast(e.message || T('No se pudo rehacer el menú'));
        });
    };

    /* Cuál se está viendo: el desplegado, y si hay varios abiertos, el activo. */
    const menuALaVista = function () {
      const abiertos = Menus.lista().filter(function (x) { return menusAbiertos[x.id]; });
      if (!abiertos.length) return null;
      const act = Menus.activoId();
      return abiertos.filter(function (x) { return x.id === act; })[0] || abiertos[0];
    };

    bind(root, '[data-a=generar]', function () { nuevoMenuSheet(); });
    bind(root, '[data-a=regenerar]', function () {
      rehacerMenu(menuALaVista());
    });
    bind(root, '[data-a=otroMenu]', function () { nuevoMenuSheet(); });

    /* Reformular es rehacer, pero guardando antes lo que pide: así no hay que
       ir a buscar el campo de órdenes y vale también para los menús siguientes. */
    bind(root, '[data-a=rehacerCon]', function () {
      const campo = root.querySelector('#nu-cambios');
      const texto = campo ? campo.value.trim() : '';
      if (!texto) { UI.toast('Escribe qué quieres cambiar'); if (campo) campo.focus(); return; }
      const antes = String(Perfil.datos().ordenesComida || '').trim();
      Perfil.guardar({ ordenesComida: antes ? antes + '; ' + texto : texto });
      rehacerMenu(menuALaVista());
    });

  };

  /* ---------- a qué hora come cada cosa ----------
     Sirve para cruzar una foto con la comida que tocaba: a las 9:00 eso es el
     desayuno y a las 13:00 es el almuerzo, y eso no lo sabe la app si no se lo
     dices. Lo tenía a ojo —la comida del menú más cercana en minutos— y eso
     falla justo donde importa: una foto de las 11:30 está a hora y media del
     desayuno de las 10 y a media hora del almuerzo de las 12, y aun así es el
     desayuno.

     Solo se pregunta dónde EMPIEZA cada una; la anterior termina donde empieza
     la siguiente. Pidiendo las dos puntas se puede dejar un hueco entre la una
     y las dos —y entonces una foto de la una y media no es de ninguna comida—
     o solaparlas, y entonces es de dos. */
  /* Se llama desde Ajustes, que vive en otro archivo, así que sale del módulo.
     La hoja es la misma: cambiarla en dos sitios acabaría con dos que no dicen
     lo mismo. */
  function franjasSheet() {
    const actuales = Perfil.franjas();

    UI.modal(html`
      <div class="conf-disco cambio">${raw(icon('reloj'))}</div>
      <h2 class="conf-tit">${T('Tus horas de comer')}</h2>
      <p class="muted conf-txt">${T('Dime a qué hora empieza cada comida. Cada una llega ' +
      'hasta que empieza la siguiente, y la cena se estira hasta el desayuno del día ' +
      'siguiente.')}</p>

      <div class="fr-lista">
        ${raw(actuales.map(function (f, i) {
          const sig = actuales[(i + 1) % actuales.length];
          return '<div class="fr-fila">' +
            '<span class="grow"><span class="fr-nom">' + esc(T(f.label)) + '</span>' +
            '<span class="fr-rango" data-rango="' + esc(f.id) + '">' +
            esc(Tn('desde las {a} hasta las {b}', {
              a: UI.hora ? UI.hora(f.desde) : f.desde,
              b: UI.hora ? UI.hora(sig.desde) : sig.desde
            })) + '</span></span>' +
            '<input type="time" class="fr-hora" data-franja="' + esc(f.id) +
            '" value="' + esc(f.desde) + '"></div>';
        }).join(''))}
      </div>

      <div class="cb-acciones" style="margin-top:16px">
        <button class="btn primary grow btn-arranque" data-x="ok">
          ${raw(icon('check'))} ${T('Guardar')}</button>
        <button class="btn vidrio" data-x="no">${T('Cancelar')}</button>
      </div>
      <button class="btn ghost block sm" data-x="reset" style="margin-top:9px">
        ${T('Volver a las horas de siempre')}</button>`,
      function (el) {
        const pintarRangos = function () {
          const vals = {};
          el.querySelectorAll('[data-franja]').forEach(function (c) {
            vals[c.dataset.franja] = c.value;
          });
          actuales.forEach(function (f, i) {
            const sig = actuales[(i + 1) % actuales.length];
            const caja = el.querySelector('[data-rango="' + f.id + '"]');
            if (!caja) return;
            const a = vals[f.id] || f.desde;
            const b = vals[sig.id] || sig.desde;
            caja.textContent = Tn('desde las {a} hasta las {b}', {
              a: UI.hora ? UI.hora(a) : a, b: UI.hora ? UI.hora(b) : b });
          });
        };

        el.querySelectorAll('[data-franja]').forEach(function (c) {
          c.onchange = pintarRangos;
          c.oninput = pintarRangos;
        });

        el.querySelector('[data-x=no]').onclick = function () { UI.closeModal(); };

        el.querySelector('[data-x=reset]').onclick = function () {
          el.querySelectorAll('[data-franja]').forEach(function (c) {
            c.value = { desayuno: '06:00', almuerzo: '12:00', merienda: '16:00',
              cena: '20:00' }[c.dataset.franja];
          });
          pintarRangos();
        };

        el.querySelector('[data-x=ok]').onclick = function () {
          const f = {};
          let faltan = false;
          el.querySelectorAll('[data-franja]').forEach(function (c) {
            if (!c.value) faltan = true;
            f[c.dataset.franja] = c.value;
          });
          if (faltan) { UI.toast(T('Dale una hora a cada comida')); return; }
          Perfil.guardar({ franjas: f });
          /* Las alertas de comer que ya existan se mueven con las horas nuevas:
             dejarlas sonando a la hora de antes sería que la app dijera una cosa
             y sonara otra. No crea ninguna: quien no las tenga sigue igual. */
          const movidas = g.Alertas && Alertas.moverComidas ? Alertas.moverComidas() : 0;
          UI.closeModal();
          render();
          UI.toast(movidas
            ? T('Guardado') + ' · ' +
              Tp(movidas, '{n} alerta movida', '{n} alertas movidas')
            : T('Guardado'));
        };
      });
  }

  /* ---------- un menú nuevo ----------
     Antes «Nuevo» llamaba al entrenador y guardaba lo que saliera, sin
     preguntar nada y sin enseñarlo: pulsabas un botón y te aparecía un menú
     guardado con un nombre puesto por la app.

     Eso está mal por tres sitios. No te pregunta con qué cuentas ni qué quieres
     de ESTE menú —que es justo lo que hace que un menú te sirva o no—; no te
     deja elegir cómo hacerlo, y quien no tenga la IA configurada no podía
     crear ninguno; y guarda antes de que lo hayas visto, así que un menú que no
     te gusta ya está en tu lista y hay que ir a borrarlo.

     Ahora son tres pasos: dices lo tuyo, eliges cómo se hace, y lo miras antes
     de guardarlo. Y sin nombre no se guarda: «Mi menú 4» dentro de un mes no
     dice nada, y el nombre es lo único que no puede poner la app por ti. */
  function nuevoMenuSheet(alGuardar) {
    const p = Perfil.datos();
    if (!Perfil.completo(p)) {
      UI.toast(T('Completa tus datos para calcular el menú'));
      go('datos');
      return;
    }

    /* El pais no entra en el calculo de calorias, asi que el perfil puede estar
       «completo» sin el; para un menu, no. Sin saber de donde es, la lista de
       la compra sale de otro pais y media no esta en su super. */
    if (!Perfil.datos().pais) {
      UI.toast(T('Dime de qué país eres: el menú sale de tu supermercado'));
      go('datos');
      return;
    }

    let plan = null;      // lo generado, todavía sin guardar
    let comoSeHizo = '';

    UI.modal(html`
      <h2>${T('Nuevo menú')}</h2>
      <p class="muted">${T('Primero lo tuyo, y después decides cómo se hace.')}</p>

      <div id="nm-paso1">
        <label class="tiny" style="margin-top:12px;display:block">${T('CÓMO SE LLAMA')}</label>
        <input id="nm-nombre" class="input" autocomplete="off"
               placeholder="${T('Semana fuerte, Cuando viajo, Sin lactosa…')}">
        <p class="tiny" style="margin:5px 0 0">${T('Hace falta para guardarlo. Dentro de ' +
        'un mes, «Mi menú 4» no te va a decir cuál es.')}</p>

        <label class="tiny" style="margin-top:14px;display:block">${T('CON QUÉ CUENTAS')}</label>
        <textarea id="nm-despensa" rows="3"
          placeholder="${T('Ej. arroz, lentejas, huevos, pollo, atún, yogur griego, avena')}">${p.despensa || ''}</textarea>
        <p class="tiny" style="margin:5px 0 0">${T('Se guarda con tus preferencias: vale ' +
        'también para los menús siguientes.')}</p>

        <label class="tiny" style="margin-top:14px;display:block">${T('QUÉ LE PIDES SIEMPRE')}</label>
        <textarea id="nm-ordenes" rows="2"
          placeholder="${T('Ej. nada de pescado; la cena siempre ligera')}">${p.ordenesComida || ''}</textarea>

        <!-- Se pregunta aquí y no en el perfil: no es un dato de forma física
             que se rellena una vez, es algo que cambia de un mes a otro y que
             solo sirve para esto. Se acuerda de la respuesta para no
             preguntarlo cada vez, y se puede cambiar justo aquí. -->
        <label class="tiny" style="margin-top:16px;display:block">${T('¿TOMAS ALGUNA MEDICACIÓN?')}</label>
        <div class="row wrap sup-pills" id="nm-meds">
          <button class="chip" data-med="no">${T('No tomo ninguna')}</button>
          <button class="chip" data-med="si">${T('Sí, tomo')}</button>
        </div>
        <div id="nm-medcaja" hidden>
          <textarea id="nm-med" rows="2" style="margin-top:8px"
            placeholder="${T('Cuál y a qué hora. Ej. levotiroxina en ayunas; metformina con la comida')}"></textarea>
          <p class="tiny" style="margin:5px 0 0">${T('Sirve para colocar las comidas y lo ' +
          'que tomas alrededor, y para avisarte de lo que se pisa. La app no receta ni ' +
          'cambia nada de tu tratamiento: para eso está tu médico. Se queda en tu móvil, ' +
          'no sale en tu perfil y viaja al entrenador con tu propia clave.')}</p>
        </div>

        <label class="tiny" style="margin-top:14px;display:block">${T('Y PARA ESTE MENÚ EN CONCRETO')}</label>
        <textarea id="nm-extra" rows="2"
          placeholder="${T('Ej. esta semana viajo y como fuera; cocino solo los domingos')}"></textarea>
        <p class="tiny" style="margin:5px 0 0">${T('Esto no se guarda: vale solo para el ' +
        'menú que vas a crear ahora.')}</p>

        <div class="list-title" style="margin-top:18px">${T('Cómo lo hago')}</div>
        <div class="stack">
          ${raw(IA.activa() ? html`
            <button class="btn primary block btn-arranque" data-x="ia">
              ${raw(icon('chispa'))} ${T('Crearlo con el entrenador')}</button>
            <p class="tiny" style="margin:0">${T('Platos concretos con tus ingredientes, ' +
            'tus horarios y tus condiciones. Tarda unos segundos.')}</p>` : html`
            <button class="btn block" data-x="configIA">
              ${raw(icon('chispa'))} ${T('Crearlo con el entrenador (necesita configurarse)')}</button>`)}

          <button class="btn block" data-x="generico" style="margin-top:6px">
            ${raw(icon('lista'))} ${T('Crear uno genérico, sin IA')}</button>
          <p class="tiny" style="margin:0">${T('Reparte tus calorías y tu proteína entre ' +
          'tus comidas y dice qué debe llevar cada una. Los platos los pones tú.')}</p>
        </div>
      </div>

      <div id="nm-paso2" hidden></div>

      <button class="btn ghost block sm" data-x="cerrar" style="margin-top:12px">${T('Cancelar')}</button>`,
      function (el) {
        const campoNombre = el.querySelector('#nm-nombre');
        const paso1 = el.querySelector('#nm-paso1');
        const paso2 = el.querySelector('#nm-paso2');

        /* Lo que vale para siempre se guarda en el perfil; lo de este menú, no */
        const guardarPreferencias = function () {
          Perfil.guardar({
            despensa: el.querySelector('#nm-despensa').value.trim(),
            ordenesComida: el.querySelector('#nm-ordenes').value.trim()
          });
          /* Fuera de Perfil a propósito: así no entra en Perfil.resumen() y no
             se cuela en los prompts de entrenamiento, donde no pinta nada. */
          Store.setSetting('medicacionDicho', dicho);
          Store.setSetting('medicacion',
            dicho === 'si' ? el.querySelector('#nm-med').value.trim() : '');
        };

        /* ---------- la medicación ---------- */
        const cajaMeds = el.querySelector('#nm-meds');
        const cajaMed = el.querySelector('#nm-medcaja');
        let dicho = Store.settings().medicacionDicho || '';

        const pintarMeds = function () {
          cajaMeds.querySelectorAll('[data-med]').forEach(function (b) {
            b.classList.toggle('on', b.dataset.med === dicho);
          });
          cajaMed.hidden = dicho !== 'si';
        };
        el.querySelector('#nm-med').value = Store.settings().medicacion || '';
        pintarMeds();

        cajaMeds.onclick = function (ev) {
          const b = ev.target.closest('[data-med]');
          if (!b) return;
          dicho = b.dataset.med;
          pintarMeds();
          if (dicho === 'si') el.querySelector('#nm-med').focus();
        };

        const pintarPaso2 = function () {
          const dias = (plan.dias || []).length;
          const comidas = (plan.dias || []).reduce(function (n, d) {
            return n + ((d.comidas || []).length);
          }, 0);
          const primero = (plan.dias || [])[0];

          paso1.hidden = true;
          paso2.hidden = false;
          paso2.innerHTML =
            '<div class="card tarjeta-premium" style="margin-top:12px">' +
            '<div class="pre-encima">' + esc(comoSeHizo) + '</div>' +
            '<div class="pre-num" style="margin:2px 0 6px">' +
            esc(Tp(dias, '{n} día', '{n} días') + ' · ' +
              Tp(comidas, '{n} comida', '{n} comidas')) + '</div>' +
            (plan.resumen ? '<p class="muted" style="margin:0;font-size:.88rem">' +
              esc(plan.resumen) + '</p>' : '') +
            '</div>' +
            (primero ? '<div class="list-title">' + esc(T('Un día de ejemplo')) + '</div>' +
              '<div class="stack">' + (primero.comidas || []).map(function (c) {
                return '<div class="meal"><div class="row between">' +
                  '<b style="font-size:.88rem">' + esc(T(c.nombre || '')) +
                  (c.hora ? ' <span class="tiny">· ' + esc(c.hora) + '</span>' : '') + '</b>' +
                  '<span class="tiny">' + UI.num(c.kcal || 0) + ' kcal</span></div>' +
                  '<div class="muted" style="font-size:.86rem;margin-top:3px">' +
                  esc(T(c.plato || '')) + '</div></div>';
              }).join('') + '</div>' : '') +
            '<button class="btn primary block btn-arranque" data-x="guardar" ' +
            'style="margin-top:14px">' + icon('check') + ' ' +
            esc(T('Guardar este menú')) + '</button>' +
            '<button class="btn block sm" data-x="otra" style="margin-top:8px">' +
            esc(T('Volver y probar de otra forma')) + '</button>';

          paso2.querySelector('[data-x=guardar]').onclick = guardar;
          paso2.querySelector('[data-x=otra]').onclick = function () {
            plan = null;
            paso2.hidden = true;
            paso2.innerHTML = '';
            paso1.hidden = false;
          };
        };

        /* Aquí y solo aquí se guarda. Sin nombre no hay menú: es lo único que
           no puede poner la app por ti. */
        const guardar = function () {
          const nombre = campoNombre.value.trim();
          if (!nombre) {
            UI.toast(T('Ponle un nombre antes de guardarlo'));
            paso2.hidden = true;
            paso1.hidden = false;
            campoNombre.focus();
            return;
          }
          UI.closeModal();
          const m = Menus.crear(plan, nombre, huellaMenu());
          menusAbiertos[m.id] = true;
          abrirHoyDe(m.id);
          render();
          UI.toast(Tn('«{que}» guardado', { que: m.nombre }));
          if (alGuardar) alGuardar(m);
        };

        el.querySelector('[data-x=cerrar]').onclick = UI.closeModal;

        const botonIA = el.querySelector('[data-x=ia]');
        if (botonIA) botonIA.onclick = function () {
          /* Se pregunta una vez, no cada vez. Pero esa una vez se pregunta de
             verdad: un menú montado sin saberlo puede ponerle el café justo
             donde no toca, y eso no se arregla luego. */
          if (!dicho) {
            UI.toast(T('Dime si tomas medicación: cambia a qué hora conviene comer'));
            cajaMeds.classList.add('pide');
            cajaMeds.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(function () { cajaMeds.classList.remove('pide'); }, 1400);
            return;
          }
          if (dicho === 'si' && !el.querySelector('#nm-med').value.trim()) {
            UI.toast(T('Escribe cuál y a qué hora'));
            el.querySelector('#nm-med').focus();
            return;
          }
          guardarPreferencias();
          botonIA.disabled = true;
          botonIA.textContent = T('Preparando el menú…');

          IA.planNutricion({
            forzar: true,
            extra: el.querySelector('#nm-extra').value.trim(),
            variante: Date.now() % 1000
          }).then(function (r) {
            plan = r;
            comoSeHizo = T('Hecho por el entrenador');
            pintarPaso2();
          }).catch(function (e) {
            botonIA.disabled = false;
            botonIA.innerHTML = icon('chispa') + ' ' + esc(T('Crearlo con el entrenador'));
            UI.toast(e.message || T('No se pudo crear el menú'));
          });
        };

        const botonConf = el.querySelector('[data-x=configIA]');
        if (botonConf) botonConf.onclick = function () {
          UI.closeModal();
          go('entrenador');
        };

        el.querySelector('[data-x=generico]').onclick = function () {
          guardarPreferencias();
          const r = Menus.generico();
          if (!r) { UI.toast(T('Completa tus datos para calcular el menú')); return; }
          plan = r;
          comoSeHizo = T('Genérico, con tus números');
          pintarPaso2();
        };

        setTimeout(function () { campoNombre.focus(); }, 60);
      });
  }

  /* Despliega el día de hoy de un menú, si no se ha tocado ya ninguno suyo.
     Es el que se viene a mirar, y dejarlo cerrado obliga a buscarlo entre siete
     iguales antes de poder hacer nada con él. */
  function abrirHoyDe(id) {
    const m = g.Menus ? Menus.porId(id) : null;
    const dias = (m && m.plan && m.plan.dias) || [];
    if (!dias.length) return;
    if (Object.keys(diasAbiertosPlan).some(function (k) {
      return k.indexOf(id + '-') === 0;
    })) return;

    for (let i = 0; i < dias.length; i++) {
      if (Menus.esElDiaDeHoy(dias[i], i, dias.length)) {
        diasAbiertosPlan[id + '-' + i] = true;
        return;
      }
    }
  }

  /* Ponerle nombre a un menú. Con varios guardados, «Mi menú 2» no dice nada
     dentro de un mes; «Semana fuerte» o «Cuando viajo», sí. */
  function renombrarMenuSheet(menu) {
    UI.modal(html`
      <h2>${T('Cambiar el nombre')}</h2>
      <p class="muted">${T('Para saber cuál es sin abrirlo.')}</p>
      <input id="mn-nombre" class="input" style="margin-top:12px"
             value="${menu.nombre}" placeholder="${T('Semana fuerte, Cuando viajo…')}"
             autocomplete="off">
      <button class="btn primary block" data-x="ok" style="margin-top:14px">${T('Guardar')}</button>
      <button class="btn ghost block sm" data-x="no" style="margin-top:8px">${T('Cancelar')}</button>`,
      function (el) {
        const campo = el.querySelector('#mn-nombre');
        const guardar = function () {
          const n = campo.value.trim();
          if (!n) { UI.toast(T('Ponle un nombre')); campo.focus(); return; }
          UI.closeModal();
          Menus.renombrar(menu.id, n);
          render();
        };
        el.querySelector('[data-x=ok]').onclick = guardar;
        el.querySelector('[data-x=no]').onclick = UI.closeModal;
        campo.onkeydown = function (e) { if (e.key === 'Enter') guardar(); };
        setTimeout(function () { campo.focus(); campo.select(); }, 60);
      });
  }

  /* ================= entrenador con IA ================= */

  V.entrenador = function () {
    if (!IA.activa()) return configIAHTML();

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Perfil')}</button>
      <!-- Su marca al lado del título: es el único sitio de la app donde
           contesta alguien, y conviene que se note de quién es la voz. -->
      <div class="ia-cab">
        <span class="ia-marca">${raw(icon('chispa'))}</span>
        <div class="grow" style="min-width:0">
          <h1 style="margin:0">${T('Entrenador')}</h1>
          <div class="tiny ia-estado">${IA.proveedorActual().label}${raw(
            IA.config().modelo ? ' · ' + esc(IA.config().modelo) : '')}</div>
        </div>
      </div>
      <p class="muted">${T('Conoce tu perfil, tus rutinas y tu progreso. No está aquí ' +
      'para darte la razón: si algo lo estás haciendo mal, te lo dice.')}</p>

      <!-- Preguntar es lo que se viene a hacer, así que va primero y con el
           material bueno. La caja de antes era un campo de formulario gris con
           un botón debajo. -->
      <div class="card tarjeta-premium ia-caja">
        <div class="pre-encima">${T('Pregúntale lo que sea')}</div>
        <textarea id="ia-q" rows="3"
          placeholder="${T('¿Estoy entrenando bien el pecho? ¿Cómo bajo grasa sin perder fuerza?')}"></textarea>

        <!-- Un cuadro en blanco es lo más difícil de empezar. Estas salen de
             tus datos, no de una lista fija: preguntan por lo que de verdad
             tienes flojo esta semana. -->
        <div class="ia-sugeridas">
          ${raw(preguntasSugeridas().map(function (q) {
            return '<button class="ia-sug" data-preg="' + esc(q) + '">' + esc(q) + '</button>';
          }).join(''))}
        </div>

        <button class="btn primary block btn-arranque" data-a="preguntar" style="margin-top:12px">
          ${raw(icon('chispa'))} ${T('Preguntar')}</button>
      </div>

      <div id="ia-respuesta"></div>

      <div class="list-title">${T('Lo que puede hacer por ti')}</div>
      <div class="plan-acciones">
        ${raw(filaAccion('grafica', '#4f8cf5', T('Cómo voy'),
          T('Lee tus últimos entrenamientos sin adornos y dice qué se sostiene y qué no.'),
          'analizar'))}
        ${raw(filaAccion('dumbbell', 'var(--acc)', T('Audita mis rutinas'),
          T('Les pone nota del uno al diez y dice exactamente qué falla.'), 'revisar'))}
        ${raw(filaAccion('nutricion', '#f0a23c', T('Prepararme el menú'),
          T('Semanal, con tus calorías, tu dieta y lo que tienes en casa.'), 'nutricion'))}
      </div>

      <!-- Lo que sabe de ti, dicho por la app y no por el modelo. Es la
           pregunta que se hace todo el mundo antes de fiarse de una respuesta,
           y la contestación honesta es enumerarlo. -->
      <details class="seccion" data-sec="iasabe">
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="list-title" style="margin:0">${T('Qué sabe de ti')}</span>
        </summary>
        <div class="sec-cuerpo">
          <div class="list">
            ${raw(loQueSabe().map(function (x) {
              return '<div class="list-row"><span class="row-icon">' + icon(x.icono) +
                '</span><div class="grow"><div class="list-row-title">' + esc(x.que) +
                '</div><div class="list-row-sub">' + esc(x.detalle) + '</div></div></div>';
            }).join(''))}
          </div>
          <p class="tiny" style="margin-top:10px">${T('Se manda en cada pregunta para ' +
          'que la respuesta sea tuya y no de cualquiera. Tu clave no sale de este ' +
          'dispositivo, y las fotos de comida se sueltan al terminar: no se guardan en ' +
          'ningún sitio.')}</p>
        </div>
      </details>

      <div class="list-title">${T('Ajustes')}</div>
      <div class="plan-acciones">
        ${raw(filaAccion('llave', '#c06bf0', T('Proveedor y clave'),
          IA.proveedorActual().label + (IA.config().modelo ? ' · ' + IA.config().modelo : ''),
          'config'))}
      </div>`;
  };

  /* ---------- por dónde empezar ----------
     Un cuadro de texto en blanco es lo más difícil de rellenar que hay. Estas
     preguntas no son una lista fija: salen de sus datos, así que preguntan por
     lo que de verdad tiene flojo. Una sugerencia que le vale a cualquiera no
     sirve para nada. */
  function preguntasSugeridas() {
    const fuera = [];

    const s = Store.stats();

    if (s.total < 3) {
      fuera.push(T('¿Por dónde empiezo con mi nivel?'));
      fuera.push(T('¿Cuántos días a la semana me conviene entrenar?'));
    } else {
      fuera.push(T('¿Voy bien de volumen para mi objetivo?'));
      fuera.push(T('¿Qué músculo tengo más flojo?'));
    }

    const p = Perfil.datos();
    if (Perfil.completo(p)) {
      const o = (Perfil.OBJETIVO[p.objetivo] || {}).label;
      if (o) fuera.push(Tn('¿Mi plan encaja con «{que}»?', { que: T(o).toLowerCase() }));
    }
    if (p.lesiones) fuera.push(T('¿Qué ejercicios debería evitar por mis lesiones?'));
    if (p.condiciones) fuera.push(T('¿Qué cambio por mis condiciones de salud?'));
    if (!p.lesiones && !p.condiciones) fuera.push(T('¿Cómo evito lesionarme?'));

    return fuera.slice(0, 4);
  }

  /* Lo que va en cada pregunta, contado por la app. Es lo que se pregunta todo
     el mundo antes de fiarse de una respuesta. */
  function loQueSabe() {
    const p = Perfil.datos();
    const s = Store.stats();
    const rutinas = Store.routines();
    const fuera = [];

    fuera.push({
      icono: 'perfil', que: T('Tu perfil'),
      detalle: Perfil.completo(p)
        ? Tn('{edad} años, {peso} kg, {altura} cm, objetivo {objetivo}',
            { edad: p.edad, peso: p.peso, altura: p.altura,
              objetivo: T((Perfil.OBJETIVO[p.objetivo] || {}).label || '').toLowerCase() }) +
          (p.lesiones ? T(', y tus lesiones') : '') +
          (p.condiciones ? T(', y tus condiciones de salud') : '')
        : T('Sin completar. Si falta, no se lo inventa: lo dice.')
    });

    fuera.push({
      icono: 'dumbbell', que: T('Tus rutinas'),
      detalle: rutinas.length
        ? Tp(rutinas.length,
            '{n} rutina con sus ejercicios, series y repeticiones',
            '{n} rutinas con sus ejercicios, series y repeticiones')
        : T('Ninguna guardada todavía')
    });

    fuera.push({
      icono: 'grafica', que: T('Tu progreso'),
      detalle: s.total
        ? Tp(s.total,
            '{n} entrenamiento, tus series por músculo y lo que llevas sin tocar',
            '{n} entrenamientos, tus series por músculo y lo que llevas sin tocar')
        : T('Sin entrenamientos registrados; no opina de lo que no ve')
    });

    if (g.Comidas) {
      const h = Comidas.hoy();
      fuera.push({
        icono: 'nutricion', que: T('Lo que comes'),
        detalle: h.cuantas
          ? T('Lo apuntado hoy y tus calorías objetivo')
          : T('Tus calorías objetivo; hoy no has apuntado nada')
      });
    }

    return fuera;
  }

  /* Una cosa que puede hacer, con su icono de color. El mismo patrón que las
     acciones de un plan: una fila por cosa y el color diciendo cuál es cuál. */
  function filaAccion(ico, color, titulo, sub, accion) {
    return '<button class="fila-plan" data-ia="' + accion + '" style="--fp:' + color + '">' +
      '<span class="fp-ico">' + icon(ico) + '</span>' +
      '<span class="grow"><span class="fp-tit">' + esc(titulo) + '</span>' +
      '<span class="fp-sub">' + esc(sub) + '</span></span>' +
      '<span class="chevron">' + icon('chevron') + '</span></button>';
  }

  function configIAHTML() {
    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Perfil')}</button>
      <h1>${T('Entrenador con IA')}</h1>
      <p class="muted">${T('Analiza tu progreso, revisa tus rutinas y te prepara el plan ' +
      'de comidas. Funciona con el proveedor que elijas: Gemini tiene capa gratuita.')}</p>

      <div class="card tarjeta-premium">
        <div class="pre-encima">${T('Se hace una vez')}</div>
        <ol class="instr" style="margin:10px 0 0">
          <li>${raw(Tn('Entra en {enlace} con tu cuenta de Google.',
            { enlace: '<a href="https://aistudio.google.com/apikey" target="_blank" ' +
              'rel="noopener noreferrer">aistudio.google.com/apikey</a>' }))}</li>
          <li>${raw(Tn('Pulsa {boton} y copia la clave.',
            { boton: '<b>Create API key</b>' }))}</li>
          <li>${T('Pégala aquí abajo. Se guarda solo en este dispositivo.')}</li>
        </ol>
        <button class="btn primary block btn-arranque" data-a="boveda" style="margin-top:14px">
          ${raw(icon('llave'))} ${T('Ir a la bóveda de claves')}</button>
      </div>

      <div class="list-title">${T('Qué hace y qué no')}</div>
      <div class="list">
        ${raw(filaEstadoIA(true, T('Lee tus datos reales'),
          T('Tu perfil, tus rutinas, tu progreso y lo que comes.')))}
        ${raw(filaEstadoIA(true, T('Tu clave no sale de aquí'),
          T('Se guarda en este dispositivo y no viaja con la sincronización salvo que lo actives.')))}
        ${raw(filaEstadoIA(false, T('No hace falta para lo demás'),
          T('Las calorías, las rutinas y el registro funcionan igual sin ella.')))}
      </div>

      <p class="tiny" style="margin-top:12px">${T('La capa gratuita tiene un límite diario ' +
      'que sobra para uso personal. Si lo superas, la app te avisa y sigue funcionando.')}</p>`;
  }

  /* La nota, en un aro. Un número grande y suelto es un número; el aro dice
     además cuánto le falta para el diez, que es lo que se mira al ver una nota. */
  function aroNota(n) {
    const p = Math.max(0, Math.min(1, n / 10));
    const R = 26, C = 2 * Math.PI * R;
    const tono = n >= 8 ? 'var(--acc)' : n >= 6 ? 'var(--warn)' : 'var(--bad)';

    return '<div class="ia-nota" style="--tn:' + tono + '">' +
      '<div class="ia-aro">' +
      '<svg viewBox="0 0 62 62" aria-hidden="true">' +
      '<circle class="in-pista" cx="31" cy="31" r="' + R + '"/>' +
      '<circle class="in-hecho" cx="31" cy="31" r="' + R + '" ' +
      'stroke-dasharray="' + C.toFixed(1) + '" ' +
      'stroke-dashoffset="' + (C * (1 - p)).toFixed(1) + '"/>' +
      '</svg><span class="in-cifra">' + n + '</span></div>' +
      '<div class="grow"><div class="in-tit">' +
      esc(n >= 8 ? T('Van bien') : n >= 6 ? T('Se sostienen, con peros') : T('Hay que tocarlas')) +
      '</div><div class="tiny">' +
      esc(T('Nota que les pone a tus rutinas tal y como están.')) + '</div></div>' +
      '</div>';
  }

  function filaEstadoIA(si, titulo, sub) {
    return '<div class="list-row"><span class="fe-marca ' + (si ? 'si' : 'no') + '">' +
      icon(si ? 'check' : 'close') + '</span>' +
      '<div class="grow"><div class="list-row-title">' + esc(titulo) + '</div>' +
      '<div class="list-row-sub">' + esc(sub) + '</div></div></div>';
  }

  V.entrenador.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });

    bind(root, '[data-a=boveda]', function () { go('claves'); });

    const caja = root.querySelector('#ia-respuesta');
    /* Mientras piensa, el hueco de la respuesta con su forma. Una rueda
       centrada no dice cuánto falta ni qué va a aparecer; unos renglones que
       laten donde van a ir las frases, sí. */
    const cargando = function (texto) {
      caja.innerHTML = '<div class="card tarjeta-premium ia-resp ia-pensando">' +
        '<div class="ia-firma">' + icon('chispa') + '<span>' + esc(texto) + '</span></div>' +
        '<div class="ia-fantasma"></div>' +
        '<div class="ia-fantasma"></div>' +
        '<div class="ia-fantasma corto"></div>' +
        '</div>';
    };

    /* Tocar una sugerencia la escribe en la caja y deja el cursor al final: es
       un punto de partida, no una pregunta cerrada, y casi siempre se retoca. */
    bindAll(root, '[data-preg]', function (el) {
      const campo = root.querySelector('#ia-q');
      campo.value = el.dataset.preg;
      campo.focus();
      campo.setSelectionRange(campo.value.length, campo.value.length);
    });

    bind(root, '[data-a=preguntar]', function () {
      const q = root.querySelector('#ia-q').value.trim();
      if (!q) { UI.toast(T('Escribe tu pregunta')); return; }
      cargando(T('Pensando…'));
      IA.preguntar(q).then(function (r) {
        caja.innerHTML = '<div class="card tarjeta-premium ia-resp">' +
          '<div class="ia-firma">' + icon('chispa') + '<span>' +
          esc(T('Tu entrenador')) + '</span></div>' + parrafos(r) + '</div>';
      }).catch(function (e) {
        caja.innerHTML = '<div class="card tarjeta-premium"><div class="muted">' +
          esc(e.message) + '</div></div>';
      });
    });

    bindAll(root, '[data-ia]', function (el) {
      const a = el.dataset.ia;
      if (a === 'nutricion') return go('nutricion');
      if (a === 'config') return go('claves');

      cargando(a === 'analizar' ? T('Revisando tus entrenamientos…') : T('Auditando tus rutinas…'));
      window.scrollTo({ top: caja.offsetTop - 80, behavior: 'smooth' });

      const peticion = a === 'analizar' ? IA.analizarProgreso() : IA.revisarRutinas();
      peticion.then(function (r) {
        caja.innerHTML = a === 'analizar'
          ? html`<div class="card tarjeta-premium ia-resp">
              <div class="ia-firma">${raw(icon('chispa'))}<span>${T('Tu entrenador')}</span></div>
              <div class="ia-bloque"><b>${T('Lo que se sostiene')}</b><p>${r.bien}</p></div>
              <div class="ia-bloque"><b>${T('Lo que hay que arreglar')}</b><p>${r.flojo}</p></div>
              <div class="ia-bloque destacado"><b>${T('Esta semana')}</b><p>${r.accion}</p></div>
            </div>`
          : html`<div class="card tarjeta-premium ia-resp">
              ${raw(Number(r.nota) > 0 ? aroNota(Number(r.nota)) : '')}
              <p class="muted">${r.veredicto}</p>
              ${raw((r.puntos || []).map(function (x) {
                return '<div class="ia-bloque"><b>' + esc(x.titulo) + '</b><p>' +
                  esc(x.detalle) + '</p></div>';
              }).join(''))}
            </div>`;
      }).catch(function (e) {
        caja.innerHTML = '<div class="card"><div class="muted">' + esc(e.message) + '</div></div>';
      });
    });
  };

  function parrafos(texto) {
    return String(texto).split(/\n{2,}/).map(function (p) {
      return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  /* ================= música ================= */

  const LISTA_KEY = 'trainingfr.playlist';

  function listaGuardada() {
    try { return JSON.parse(localStorage.getItem(LISTA_KEY) || 'null'); } catch (e) { return null; }
  }
  function guardarLista(l) {
    if (l === null) localStorage.removeItem(LISTA_KEY);
    else localStorage.setItem(LISTA_KEY, JSON.stringify(l));
  }

  V.musica = function () {
    if (!Spotify.configurado()) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} ${T('Perfil')}</button>
        <h1>${T('Música')}</h1>
        <p class="muted">${T('Reproduce dentro de la app y deja que la IA te prepare ' +
        'listas distintas para cada entrenamiento.')}</p>
        <div class="card tarjeta-premium">
          <div class="pre-encima">${T('Se hace una vez')}</div>
          <p class="muted" style="margin:6px 0 12px;font-size:.88rem">${T('Necesita el ' +
          'Client ID de una app de Spotify: se crea en un minuto y es gratis. Tienes el ' +
          'paso a paso en la bóveda.')}</p>
          <button class="btn primary block btn-arranque" data-a="boveda">
            ${raw(icon('llave'))} ${T('Ir a la bóveda de claves')}</button>
        </div>

        <div class="list-title">${T('Qué hace y qué no')}</div>
        <div class="list">
          ${raw(filaEstadoIA(true, T('Suena dentro de la app'),
            T('Sin salir a Spotify y sin perder el cronómetro de vista.')))}
          ${raw(filaEstadoIA(true, T('Listas a medida del entrenamiento'),
            T('La IA propone artistas distintos cada vez, así que descubres algo.')))}
          ${raw(filaEstadoIA(false, T('Reproducir aquí pide Premium'),
            T('Es condición de Spotify, no de la app. Sin Premium puedes crear las listas '
            + 'y abrirlas en Spotify.')))}
        </div>`;
    }

    if (!Spotify.activa()) {
      return html`
        <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
          ${raw(icon('back'))} ${T('Perfil')}</button>
        <h1>${T('Música')}</h1>
        <div class="card tarjeta-premium">
          <div class="pre-encima">${T('Un toque')}</div>
          <p class="muted" style="margin:6px 0 12px;font-size:.88rem">${T('Conecta tu ' +
          'cuenta para reproducir aquí y generar listas.')}</p>
          <button class="btn block btn-arranque btn-spotify" data-a="conectar">
            ${raw(icon('musica'))} ${T('Conectar Spotify')}</button>
        </div>
        ${raw(falloSpotifyHTML())}

        <p class="tiny" style="margin-top:12px">${T('Al pulsar te lleva a Spotify para ' +
        'dar permiso y vuelve aquí solo. Si vuelves sin conectar, aquí abajo aparecerá ' +
        'el motivo exacto.')}</p>`;
    }

    const lista = listaGuardada();
    const mem = IA.activa() ? IA.memoriaMusical() : { listas: 0, artistas: [] };
    const faltantes = Spotify.permisosQueFaltan ? Spotify.permisosQueFaltan() : [];

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Perfil')}</button>
      <div class="row between">
        <h1 style="margin:0">${T('Música')}</h1>
        <!-- Vidrio neutro y no verde: desconectar no es lo que se viene a hacer
             aquí, y un botón del color de la marca al lado del título pide que lo
             pulses. -->
        <button class="btn sm vidrio" data-a="desconectar">${T('Desconectar')}</button>
      </div>

      ${raw(falloSpotifyHTML())}

      ${raw(Spotify.permisosCaducados() ? html`
        <div class="card" style="border-color:var(--warn);margin-top:12px">
          <b>${T('Vuelve a conectar')}</b>
          <p class="muted" style="margin:5px 0 10px">${faltantes.length
            ? T('A la conexión con Spotify le faltan permisos, y por eso tus listas y el '
              + 'buscador dan error. Reconecta y acepta la pantalla de Spotify tal cual '
              + 'sale.')
            : T('Hay funciones nuevas —tus listas de Spotify y el buscador— y Spotify pide '
              + 'permiso otra vez para eso. Es un toque y no pierdes nada.')}</p>
          ${raw(faltantes.length
            ? '<p class="tiny" style="margin:0 0 10px">' +
              esc(Tn('Falta: {lista}', { lista: faltantes.join(', ') })) + '</p>'
            : '')}
          <button class="btn block btn-arranque btn-spotify" data-a="conectar">
            ${raw(icon('musica'))} ${T('Reconectar Spotify')}</button>
        </div>` : '')}

      <div id="sp-player" style="margin-top:12px"></div>

      ${raw(permisosHTML(faltantes))}

      <div class="list-title">${T('Lista para entrenar')}</div>
      ${raw(lista ? listaHTML(lista) : html`
        <div class="card">
          <p class="muted">${T('Deja que la IA te prepare una lista a medida del ' +
          'entrenamiento de hoy. Cada vez propone artistas distintos, así que siempre ' +
          'descubres algo.')}</p>
          ${raw(IA.activa()
            ? '<button class="btn primary block" data-a="generar">' + icon('chispa') +
              ' ' + esc(T('Crear una lista')) + '</button>'
            : '<button class="btn block" data-a="boveda">' +
              esc(T('Necesita la clave de la IA')) + '</button>')}
        </div>`)}

      ${raw(mem.listas ? '<p class="tiny" style="margin-top:10px">' +
        esc(Tp(mem.listas, '{n} lista creada', '{n} listas creadas')) + ' · ' +
        esc(Tn('{n} artistas ya propuestos que no se repetirán.',
          { n: mem.artistas.length })) + ' ' +
        '<button class="btn sm ghost" data-a="olvidar">' +
        esc(T('Empezar de cero')) + '</button></p>' : '')}

      <div class="list-head">
        <span class="list-title">${T('Tus listas de Spotify')}</span>
        <button class="btn sm ghost" data-a="recargarListas">${T('Actualizar')}</button>
      </div>
      <div class="search-wrap" style="margin-bottom:10px">
        ${raw(icon('search'))}
        <input id="sp-buscar" type="search" placeholder="${T('Canciones, listas, álbumes o pódcast')}"
               autocomplete="off">
      </div>
      <div class="pill-scroll" id="sp-filtros" style="padding-bottom:10px">
        <button class="chip ${filtrosBusca.length ? '' : 'on'}" data-tipo="">${T('Todo')}</button>
        ${raw(TIPOS_BUSCA.map(function (t) {
          return '<button class="chip ' + (filtrosBusca.indexOf(t.k) !== -1 ? 'on' : '') +
            '" data-tipo="' + t.k + '">' + esc(T(t.n)) + '</button>';
        }).join(''))}
      </div>
      <div id="sp-listas"><p class="tiny">${T('Cargando tus listas…')}</p></div>

      <div class="list-title">${T('Lista fija')}</div>
      <div class="card tarjeta-premium">
        <p class="muted" style="font-size:.88rem;margin-top:0">${T('La que quieras tener ' +
        'siempre a mano: pega su enlace y queda guardada para lanzarla de un toque.')}</p>
        <input id="sp-pl" value="${Spotify.config().playlist || ''}"
               placeholder="https://open.spotify.com/playlist/..." autocomplete="off" spellcheck="false">
        <div class="row" style="margin-top:10px">
          <button class="btn grow" data-a="guardarPl">${T('Guardar')}</button>
          ${raw(Spotify.config().playlist
            ? '<button class="btn primary grow" data-a="ponerPl">' + icon('play') + ' ' +
              esc(T('Reproducir')) + '</button>'
            : '')}
        </div>
      </div>`;
  };

  /* ---------- qué le has dejado hacer a la app ----------
     Era un volcado de los catorce permisos tal y como los escribe Spotify
     —«user-modify-playback-state»— y debajo un botón gris. Eso no lo lee nadie,
     y quien lo lea sigue sin saber qué deja de funcionar si falta uno.

     Así que los catorce se agrupan en las cinco cosas que la app hace con
     ellos, dichas en castellano, cada una con su estado. El volcado crudo sigue
     estando, plegado al final, porque es lo único que sirve para pegarlo en un
     correo cuando algo falla de verdad. */
  const GRUPOS_PERMISO = [
    { ico: 'altavoz', tit: 'Reproducir aquí dentro',
      /* El texto se traduce al pintarlo, no aquí: esta tabla se arma al cargar
         el archivo y el idioma se cambia con la app abierta. */
      sub: 'Sonar sin salir de la app y manejar el play, la pausa y el volumen.',
      p: ['streaming', 'user-read-email', 'user-read-private', 'user-read-playback-state',
        'user-modify-playback-state', 'user-read-currently-playing'] },
    { ico: 'lista', tit: 'Ver tus listas',
      sub: 'Las tuyas y las compartidas, para lanzarlas desde aquí.',
      p: ['playlist-read-private', 'playlist-read-collaborative'] },
    { ico: 'chispa', tit: 'Guardarte las listas que crea la IA',
      sub: 'Se crean en tu cuenta para oírlas en el móvil o en el coche.',
      p: ['playlist-modify-private', 'playlist-modify-public'] },
    { ico: 'corazon', tit: 'Tus me gusta',
      sub: 'Saber si una canción ya es tuya y poder darle al corazón.',
      p: ['user-library-read', 'user-library-modify'] },
    { ico: 'star', tit: 'Afinar a tu gusto',
      sub: 'Lo que más escuchas, para que las listas se te parezcan.',
      p: ['user-top-read'] }
  ];

  function permisosHTML(faltantes) {
    const crudo = Spotify.permisosConcedidos ? Spotify.permisosConcedidos() : '';
    const falla = function (g) {
      return g.p.filter(function (x) { return faltantes.indexOf(x) !== -1; });
    };
    const rotos = GRUPOS_PERMISO.filter(function (g) { return falla(g).length; }).length;
    const bien = GRUPOS_PERMISO.length - rotos;

    return html`
      <details class="card sp-permisos" style="margin-top:12px">
        <summary>
          <span class="sp-escudo ${raw(rotos ? 'mal' : 'bien')}">
            ${raw(icon(rotos ? 'close' : 'check'))}</span>
          <span class="grow">
            <span class="sp-e-tit">${T('Qué le has dejado hacer a la app')}</span>
            <span class="sp-e-sub">${rotos
              ? Tp(rotos,
                  '{n} cosa no puede hacerla: reconecta y acepta la pantalla tal cual sale',
                  '{n} cosas no puede hacerlas: reconecta y acepta la pantalla tal cual sale')
              : (crudo
                ? Tn('Las {n} cosas que necesita, concedidas', { n: bien })
                : T('La sesión es anterior y no apuntó los permisos'))}</span>
          </span>
          <span class="chevron sp-e-flecha">${raw(icon('chevron'))}</span>
        </summary>

        <div class="sp-e-cuerpo">
          <div class="sp-grupos">
            ${raw(GRUPOS_PERMISO.map(function (g) {
              const mal = falla(g);
              return '<div class="sp-g' + (mal.length ? ' no' : '') + '">' +
                '<span class="sp-g-ico">' + icon(g.ico) + '</span>' +
                '<span class="grow"><span class="sp-g-tit">' + esc(T(g.tit)) + '</span>' +
                '<span class="sp-g-sub">' + esc(mal.length
                  ? Tp(mal.length, 'No puede: Spotify no dio {n} de los permisos que pide.',
                      'No puede: Spotify no dio {n} de los permisos que pide.')
                  : T(g.sub)) + '</span></span>' +
                '<span class="sp-g-marca">' + icon(mal.length ? 'close' : 'check') +
                '</span></div>';
            }).join(''))}
          </div>

          <!-- Lo de desarrollo: aquí abajo y en su propia caja, porque es lo que se
               mira el día que algo falla y no el resto de los días. -->
          <div class="sp-dev">
            <div class="sp-dev-cab">
              <span class="sp-dev-ico">${raw(icon('llave'))}</span>
              <span class="grow"><b>${T('Si aún así algo falla')}</b>
                <span class="tiny">${T('Prueba una a una las llamadas a Spotify y te ' +
                'dice cuál se cae y por qué.')}</span></span>
            </div>
            <button class="btn vidrio block sm" data-a="diagnostico">
              ${raw(icon('beep'))} ${T('Probar las llamadas que fallan')}</button>
            <pre class="tiny sp-salida" id="sp-diag" hidden></pre>

            <details class="sp-crudo">
              <summary class="tiny">${T('Los permisos tal cual los escribe Spotify')}</summary>
              <p class="tiny sp-crudo-txt">${crudo || T('la sesión es anterior y no lo apuntó')}</p>
              ${raw(faltantes.length
                ? '<p class="tiny sp-crudo-falta">' +
                  esc(Tn('Falta: {lista}', { lista: faltantes.join(', ') })) + '</p>'
                : '')}
            </details>
          </div>
        </div>
      </details>`;
  }

  /* Si la última autorización falló, se enseña aquí con el texto exacto que
     devolvió Spotify: un aviso de dos segundos no da tiempo ni a leerlo. */
  function falloSpotifyHTML() {
    const f = Spotify.ultimoFallo && Spotify.ultimoFallo();
    if (!f) return '';
    return html`
      <div class="card" style="margin-top:12px;border-color:var(--bad)">
        <div class="row between" style="align-items:flex-start">
          <div class="grow">
            <b style="color:var(--bad)">${T('La última conexión con Spotify falló')}</b>
            <p class="tiny" style="margin:6px 0 0">${UI.fecha(f.t)}</p>
          </div>
          <button class="btn icon sm" data-a="olvidarFallo" aria-label="${T('Descartar')}">
            ${raw(icon('close'))}</button>
        </div>
        <pre style="margin:10px 0 0;font-size:.72rem;white-space:pre-wrap">${f.texto}</pre>
        ${raw(f.detalle ? '<pre class="tiny" style="margin:8px 0 0;opacity:.75;' +
          'white-space:pre-wrap">' + esc(f.detalle) + '</pre>' : '')}
        ${raw(f.deSpotify ? html`
          <p class="tiny" style="margin:9px 0 0">${raw(Tn('Esto lo ha rechazado Spotify. ' +
          'Comprueba en su panel que en {campo} está exactamente {url} y que tu cuenta ' +
          'figura en {gestion} si la app está en modo desarrollo.',
          { campo: '<b>Redirect URIs</b>', url: '<code>' + esc(Spotify.urlRetorno()) + '</code>',
            gestion: '<b>User Management</b>' }))}</p>`
        : html`
          <p class="tiny" style="margin:9px 0 0">${raw(Tn('Esto no es cosa del panel de ' +
          'Spotify: no hace falta tocar nada allí. Pulsa Conectar {aqui} y deja que ' +
          'vuelva sin abrir otras pestañas ni cambiar entre la app instalada y el ' +
          'navegador.', { aqui: '<b>' + esc(T('desde esta misma pantalla')) + '</b>' }))}</p>`)}
        <button class="btn block sm btn-arranque btn-spotify" data-a="conectar"
                style="margin-top:10px">
          ${raw(icon('musica'))} ${T('Reintentar aquí')}</button>
      </div>`;
  }

  /* ---------- tus listas de Spotify ---------- */

  /* Qué se busca. Vacío es todo, que es como se abre: quien busca «Fred again»
     no quiere elegir antes si es canción, álbum o artista. */
  let filtrosBusca = [];

  const TIPOS_BUSCA = [
    { k: 'track', n: 'Canciones' },
    { k: 'playlist', n: 'Listas' },
    { k: 'album', n: 'Álbumes' },
    { k: 'artist', n: 'Artistas' },
    { k: 'show', n: 'Pódcast' }
  ];

  /* Spotify tiene cerrada la ruta que devuelve las canciones de una lista, así
     que no hay desplegable que valga: la fila entera suena y ya está. */
  const SORPRESA = 'Spotify no deja ver las canciones desde aquí, así que la '
    + 'siguiente siempre es sorpresa. Tú dale al play y déjate sorprender.';

  /* ---------- lo que trae de Spotify ----------
     Eran filas con una miniatura apaisada, el nombre en pequeno y un boton
     verde al lado. Una portada de lista es cuadrada, asi que recortarla a 56x44
     le cortaba la cabeza a todas; y con el nombre del mismo tamano que sus
     datos habia que leer la fila entera para saber cual era cual.

     Ahora la portada es cuadrada y lleva su canto de luz, el nombre manda, y lo
     que es —lista, album, artista— va en su pastilla. Entran escalonadas, como
     las canciones. */
  function tarjetasListas(listas, propias) {
    if (!listas.length) {
      return '<p class="tiny">' + esc(propias
        ? T('No tienes listas guardadas en Spotify todavía.')
        : T('Ninguna lista con ese nombre.')) + '</p>';
    }

    return (propias ? '<p class="tiny" style="margin:0 0 10px">' + esc(T(SORPRESA)) + '</p>' : '')
      + '<div class="stack sp-listas">' + listas.map(function (l, i) {
      const datos = [
        l.temas != null ? esc(Tp(l.temas, '{n} canción', '{n} canciones')) : '',
        l.de ? esc(l.de) : ''
      ].filter(Boolean).join(' · ');

      return html`
        <div class="sp-lista" style="--n:${i}">
          <button class="sp-cara" data-poner-ya="${l.uri}" data-nombre="${l.nombre}">
            <span class="sp-portada">${raw(l.portada
              ? '<img src="' + esc(l.portada) + '" alt="" loading="lazy">'
              : icon('lista'))}</span>
            <span class="grow" style="min-width:0">
              <span class="sp-nom">${l.nombre}</span>
              <span class="sp-meta">${raw(l.tipo
                ? '<i class="sp-tipo">' + esc(T(l.tipo)) + '</i>' : '')}${raw(
                datos ? '<i class="sp-datos">' + datos + '</i>' : '')}</span>
            </span>
          </button>
          <button class="sp-play" data-poner-ya="${l.uri}" data-nombre="${l.nombre}"
                  aria-label="${Tn('Reproducir {que}', { que: l.nombre })}">${raw(icon('play'))}</button>
        </div>`;
    }).join('') + '</div>';
  }

  function subirArriba(l) {
    UI.toast(Tn('Poniendo «{que}» arriba…', { que: l.nombre }));
    return Spotify.cancionesDeLista(l.id, 100).then(function (temas) {
      if (!temas.length) { UI.toast(Tn('Reproduciendo {que}', { que: l.nombre })); return; }
      guardarLista({
        nombre: l.nombre,
        descripcion: T('Tu lista de Spotify') + (l.de ? ' · ' + l.de : ''),
        deSpotify: true,
        uri: l.uri,
        pistas: temas.map(function (t) {
          return { uri: t.uri, titulo: t.titulo, artista: t.artista };
        })
      });
      render();
    }).catch(function () {
      /* si no deja leer sus canciones, al menos suena y se dice por qué */
      UI.toast(Tn('Sonando {que}. La siguiente es sorpresa — déjate llevar.',
        { que: l.nombre }));
    });
  }

  function pintarListas(root, texto) {
    const caja = root.querySelector('#sp-listas');
    if (!caja) return;
    caja.innerHTML = '<p class="tiny">' + esc(T('Buscando…')) + '</p>';

    const q = String(texto || '').trim();
    /* Primero lo suyo, que es lo que más se busca, y detrás lo que haya en
       Spotify: canciones, álbumes, artistas y pódcast. Antes, si una lista
       suya coincidía, lo de Spotify no llegaba a verse. */
    const pedir = q
      ? Spotify.misListas().catch(function () { return []; }).then(function (mias) {
          const filtro = I18N.norm(q);
          /* Si ha marcado tipos y las listas no están entre ellos, las suyas
             tampoco pintan nada aquí */
          const quiereListas = !filtrosBusca.length || filtrosBusca.indexOf('playlist') !== -1;
          const suyas = !quiereListas ? [] : mias.filter(function (l) {
            return I18N.norm(l.nombre).indexOf(filtro) !== -1;
          }).map(function (l) {
            return Object.assign({}, l, { tipo: 'Lista tuya' });   /* se traduce al pintar */
          });
          return Spotify.buscarListas(q, filtrosBusca).then(function (fuera) {
            const vistas = {};
            const todo = suyas.concat(fuera).filter(function (x) {
              if (!x || !x.uri || vistas[x.uri]) return false;
              vistas[x.uri] = 1;
              return true;
            });
            /* concat pierde lo que colgaba del array; se pasa aparte */
            todo.noSePudo = fuera.noSePudo || [];
            return todo;
          }).catch(function (e) {
            /* si falla del todo y él tiene listas suyas, al menos eso se ve */
            if (!suyas.length) throw e;
            suyas.noSePudo = [];
            suyas.fallo = e.message;
            return suyas;
          });
        })
      : Spotify.misListas();

    pedir.then(function (listas) {
      caja.innerHTML = tarjetasListas(listas, !q)
        + ((listas.noSePudo && listas.noSePudo.length)
          ? '<p class="tiny" style="margin:10px 0 0;color:var(--warn)">' +
            esc(Tn('Spotify no ha dejado buscar {que} desde esta app.',
              { que: listas.noSePudo.map(T).join(T(' ni ')) })) + '</p>'
          : '');
      caja.querySelectorAll('[data-poner-ya]').forEach(function (b) {
        b.onclick = function (ev) {
          ev.stopPropagation();
          Spotify.desbloquearAudio();
          const l = listas.find(function (x) { return x.uri === b.dataset.ponerYa; });
          /* ya sabemos de qué lista es: se apunta para que salga su nombre en
             el reproductor sin esperar a preguntárselo a Spotify */
          if (l) Spotify.apuntarContexto(l.uri, l.nombre);
          const uri = b.dataset.ponerYa;
          const esLista = uri.indexOf(':playlist:') !== -1;
          Spotify.iniciarReproductor()
            .catch(function () { /* sin reproductor propio, donde se pueda */ })
            .then(function () { return Spotify.ponerUri(uri); })
            .then(function () {
              /* sólo una lista puede subir arriba; una canción suelta o un
                 pódcast no tienen nada que poner ahí */
              if (l && esLista) subirArriba(l);
              else UI.toast(l ? Tn('Sonando {que}', { que: l.nombre }) : T('Sonando'));
            })
            .catch(function (e) { UI.toast(e.message); });
        };
      });

    }).catch(function (e) {
      caja.innerHTML = '<p class="tiny" style="color:var(--bad)">' + esc(e.message) + '</p>';
    });
  }

  /* Las canciones de la lista se pueden plegar: diecinueve seguidas dejan los
     botones de arriba fuera de la pantalla y hay que subir a buscarlos. */
  let temasAbiertos = true;

  function etiquetaPlegar(n) {
    return temasAbiertos ? T('Ocultar las canciones')
      : Tn('Ver las {n} canciones', { n: n });
  }

  /* ---------- la lista, como una portada ----------
     Era una tarjeta gris con el nombre en negrita y cuatro botones apilados
     debajo. Una lista de música no se mira como una ficha de datos: se mira
     como una portada, y lo que se busca en ella es el botón de darle.

     Así que manda el nombre, su ambiente va en una pastilla al lado, y
     reproducir es lo único que pesa. Lo demás —guardarla en Spotify, hacer
     otra, borrarla— baja a filas con su icono de color, que es donde va lo que
     se hace de vez en cuando. */
  function listaHTML(l) {
    return html`
      <div class="card tarjeta-premium mus-portada">
        <span class="mus-onda">${raw(icon('musica'))}</span>
        <div class="pre-encima">${T('Tu lista de hoy')}</div>
        <div class="mus-nom">${l.nombre}</div>
        <div class="mus-meta">
          ${raw(l.ambiente ? '<span class="mus-chip">' + esc(l.ambiente) + '</span>' : '')}
          <span class="tiny">${Tp(l.pistas.length, '{n} canción', '{n} canciones')} ·
            ${UI.fecha(l.creada)}</span>
        </div>
        ${raw(l.descripcion ? '<p class="muted mus-desc">' + esc(l.descripcion) + '</p>' : '')}

        <button class="btn primary block btn-arranque" data-a="reproducirLista"
                style="margin-top:13px">
          ${raw(icon('play'))} ${T('Reproducir aquí')}</button>

        <button class="btn ghost block sm plegar ${temasAbiertos ? 'abierta' : ''}"
                data-a="plegarTemas" style="margin-top:9px"
                aria-expanded="${temasAbiertos}">
          ${raw(icon('chevron'))} ${raw(etiquetaPlegar(l.pistas.length))}</button>
      </div>

      <div class="stack mus-temas" data-temas-lista style="margin-top:11px"
           ${raw(temasAbiertos ? '' : 'hidden')}>
        ${raw(l.pistas.map(function (p, i) {
          return html`
            <button class="pista" data-pista="${i}" style="--n:${i}">
              <span class="pi-num">${i + 1}</span>
              <span class="pi-eq" aria-hidden="true"><i></i><i></i><i></i></span>
              <div class="grow">
                <div class="player-t">${p.titulo}</div>
                <div class="tiny">${p.artista}${raw(p.porque ? ' · ' + esc(p.porque) : '')}</div>
              </div>
              ${raw(icon('play'))}
            </button>`;
        }).join(''))}
      </div>

      <div class="plan-acciones" style="margin-top:12px">
        ${raw(l.spotify
          ? '<a class="fila-plan" href="' + esc(l.spotify) + '" target="_blank" ' +
            'rel="noopener noreferrer" style="--fp:#1db954">' +
            '<span class="fp-ico">' + icon('musica') + '</span>' +
            '<span class="grow"><span class="fp-tit">' + esc(T('Abrirla en Spotify')) + '</span>' +
            '<span class="fp-sub">' + esc(T('Ya está en tu cuenta: en el móvil, en el ' +
            'coche o donde la abras.')) + '</span></span>' +
            '<span class="chevron">' + icon('chevron') + '</span></a>'
          : '<button class="fila-plan" data-a="aSpotify" style="--fp:#1db954">' +
            '<span class="fp-ico">' + icon('musica') + '</span>' +
            '<span class="grow"><span class="fp-tit">' + esc(T('Guardarla en mi Spotify')) + '</span>' +
            '<span class="fp-sub">' + esc(T('Se crea como lista privada con estas mismas ' +
            'canciones.')) + '</span></span>' +
            '<span class="chevron">' + icon('chevron') + '</span></button>')}

        <button class="fila-plan" data-a="generar" style="--fp:#c06bf0">
          <span class="fp-ico">${raw(icon('chispa'))}</span>
          <span class="grow"><span class="fp-tit">${T('Crear otra distinta')}</span>
            <span class="fp-sub">${T('Con otros artistas: no repite los que ya te ha ' +
            'propuesto.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span></button>

        <button class="fila-plan es-peligro" data-a="borrarLista" style="--fp:var(--bad)">
          <span class="fp-ico">${raw(icon('trash'))}</span>
          <span class="grow"><span class="fp-tit">${T('Borrar la lista')}</span>
            <span class="fp-sub">${T('Si ya la guardaste en Spotify, allí se queda.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span></button>
      </div>`;
  }

  /* Subirla a la cuenta de Spotify. La lista ya está resuelta —cada canción
     tiene su uri de cuando se buscó—, así que esto es crearla y meterlas: no hay
     que volver a buscar nada ni gastar una llamada a la IA. */
  /* Crear una lista necesita «playlist-modify-private», y Spotify no amplía los
     permisos al renovar el token: una conexión hecha antes de que existiera esta
     función se renueva sola para siempre sin ese permiso, y lo único que se ve
     es un «Forbidden» pelado. Así que se dice antes de intentarlo. */
  function reconectarSheet(motivo) {
    UI.modal(html`
      <h2>${T('Hay que reconectar Spotify')}</h2>
      <p class="muted">${motivo}</p>
      <p class="tiny" style="margin:10px 0 0">${T('Spotify da los permisos el día que ' +
      'autorizas y ya no los amplía: el token se renueva solo, pero con los permisos de ' +
      'aquel día. Reconectar es un toque y no pierdes nada —ni tus listas, ni lo que ' +
      'suena.')}</p>
      <button class="btn primary block" id="sp-re" style="margin-top:16px">
        ${T('Reconectar Spotify')}</button>
      <button class="btn ghost block" id="sp-no" style="margin-top:8px">${T('Ahora no')}</button>`,
      function (el) {
        el.querySelector('#sp-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#sp-re').onclick = function () {
          UI.closeModal();
          UI.toast(T('Abriendo Spotify para dar permiso…'));
          Spotify.entrar().catch(function (e) { UI.toast(e.message); });
        };
      });
  }

  /* Permisos completos y Spotify sigue diciendo que no. Entonces no es el
     token: o es la app del panel de Spotify, o es esa cuenta. Se averigua aquí
     mismo en vez de mandarle a otra pantalla. */
  function noSonLosPermisosSheet(mensaje) {
    UI.modal(html`
      <h2>${T('Esto no son los permisos')}</h2>
      <p class="muted">${T('Tu conexión tiene todos los permisos que la app pide y aun ' +
      'así Spotify rechaza crear la lista. Estoy probando qué pasa y qué no.')}</p>
      <pre class="tiny" style="white-space:pre-wrap;word-break:break-word;margin:10px 0 0;
        opacity:.8">${mensaje}</pre>

      <div id="sp-espera" class="center" style="margin:16px 0 0">
        <div class="spinner" style="margin:0 auto"></div>
        <p class="tiny" style="margin:8px 0 0">${T('Probando las llamadas…')}</p>
      </div>

      <pre class="tiny" id="sp-res" hidden style="white-space:pre-wrap;word-break:break-word;
        margin:12px 0 0"></pre>
      <div id="sp-fin" hidden>
        <button class="btn block sm" id="sp-copiar" style="margin-top:10px">
          ${T('Copiar el resultado')}</button>
        <button class="btn block sm" id="sp-otra" style="margin-top:8px">
          ${T('Probar otra vez')}</button>
        <p class="tiny" style="margin:12px 0 0">${T('Si acabas de tocar algo en el panel ' +
        'de Spotify, tu conexión es de antes del cambio: reconecta y vuelve a probar.')}</p>
        <button class="btn block sm" id="sp-re2" style="margin-top:8px">
          ${T('Reconectar Spotify')}</button>
      </div>
      <button class="btn ghost block" id="sp-cerrar" style="margin-top:10px">${T('Cerrar')}</button>`,
      function (el) {
        const espera = el.querySelector('#sp-espera');
        const res = el.querySelector('#sp-res');
        const fin = el.querySelector('#sp-fin');

        el.querySelector('#sp-cerrar').onclick = function () { UI.closeModal(); };
        el.querySelector('#sp-re2').onclick = function () {
          UI.closeModal();
          UI.toast(T('Abriendo Spotify para dar permiso…'));
          Spotify.entrar().catch(function (e) { UI.toast(e.message); });
        };
        el.querySelector('#sp-copiar').onclick = function () {
          navigator.clipboard.writeText(res.textContent)
            .then(function () { UI.toast(T('Copiado')); })
            .catch(function () { UI.toast(T('Selecciona el texto y cópialo a mano')); });
        };
        el.querySelector('#sp-otra').onclick = function () { probar(); };

        /* Sin botón de por medio: si se ha llegado hasta aquí es porque algo va
           mal, y hacerle pulsar otra vez para empezar a mirar no aporta nada. */
        function probar() {
          espera.hidden = false;
          fin.hidden = true;
          res.hidden = true;
          Spotify.diagnostico().then(function (t) {
            /* La llamada que lo decide no pide ningún permiso: si hasta esa
               falla, el problema es la app del panel y no la cuenta. */
            const publicoFalla = /público hondo: (401|403)/.test(t);
            const crearVa = /crear lista: 20\d/.test(t);
            /* Un cambio en el panel de Spotify no toca un token ya dado. Si la
               conexión es vieja, lo que falle aquí no dice nada todavía: es la
               foto de antes del cambio. */
            const reciente = Spotify.conexionReciente && Spotify.conexionReciente(20);

            res.textContent = t + BAJA + BAJA + (crearVa
              ? T('CONCLUSIÓN: ahora sí deja crear listas. Cierra esto y dale otra vez a '
                + 'guardar.')
              : !reciente
                ? T('CONCLUSIÓN: esta conexión es anterior a cualquier cambio que hayas '
                  + 'hecho hoy en el panel de Spotify, y un cambio en el panel no toca un '
                  + 'token ya dado. Reconecta aquí abajo y vuelve a probar: hasta '
                  + 'entonces esto es la foto de antes.')
                : publicoFalla
                  ? T('CONCLUSIÓN: falla hasta el catálogo público, que no pide ningún '
                    + 'permiso. El problema está en la app del panel de Spotify, no en tu '
                    + 'cuenta: mira si sigue en modo desarrollo y si tu cuenta está en '
                    + 'User Management.')
                  : T('CONCLUSIÓN: conexión recién hecha, el catálogo público responde y '
                    + 'aun así Spotify no deja escribir en tu cuenta. Esto ya no es ni el '
                    + 'token ni el panel. Mándame estas líneas.'));
            espera.hidden = true;
            res.hidden = false;
            fin.hidden = false;
          }).catch(function (e) {
            res.textContent = Tn('No se ha podido probar: {error}', { error: e.message });
            espera.hidden = true;
            res.hidden = false;
            fin.hidden = false;
          });
        }

        probar();
      });
  }

  function subirASpotify(root) {
    const l = listaGuardada();
    if (!l || !l.pistas || !l.pistas.length) { UI.toast(T('No hay lista que guardar')); return; }
    if (!Spotify.activa()) { UI.toast(T('Entra en Spotify primero')); return; }

    /* Si ya se sabe que al token le falta el permiso, no se gasta el intento ni
       se le enseña un error críptico: se le ofrece lo que lo arregla. */
    if (Spotify.permisosCaducados && Spotify.permisosCaducados()) {
      const faltan = (Spotify.permisosQueFaltan && Spotify.permisosQueFaltan()) || [];
      reconectarSheet(faltan.length
        ? Tn('A tu conexión con Spotify le falta el permiso «{permiso}», que es justo ' +
          'el que hace falta para crear la lista en tu cuenta.', { permiso: faltan[0] })
        : T('Tu conexión con Spotify es anterior a esta función, así que no incluye el ' +
          'permiso para crear listas en tu cuenta.'));
      return;
    }

    const boton = root.querySelector('[data-a=aSpotify]');
    if (boton) { boton.disabled = true; boton.textContent = T('Guardándola en Spotify…'); }

    const uris = l.pistas.map(function (p) { return p.uri; }).filter(Boolean);
    if (!uris.length) {
      UI.toast(T('Estas canciones no tienen enlace de Spotify.'));
      if (boton) { boton.disabled = false; boton.textContent = T('Guardarla en mi Spotify'); }
      return;
    }

    Spotify.crearPlaylist(l.nombre || T('Entrenamiento'),
      (l.descripcion || '') + T(' — hecha con Training FR'), uris)
      .then(function (pl) {
        const url = (pl.external_urls && pl.external_urls.spotify) ||
          ('https://open.spotify.com/playlist/' + pl.id);
        guardarLista(Object.assign({}, l, { spotify: url }));
        render();
        UI.toast(T('Guardada en tu Spotify'));
      })
      .catch(function (e) {
        if (boton) { boton.disabled = false; boton.textContent = T('Guardarla en mi Spotify'); }
        /* Un 403 al crear la lista es, casi siempre, permisos: se ofrece el
           arreglo en vez de dejarlo en un aviso que se va solo. */
        if (/\[40[13] /.test(e.message || '')) {
          /* Si a la conexión le falta algo, reconectar lo arregla. Si no le
             falta nada —como le pasó a él tras reconectar— decirle que
             reconecte es mandarle a dar otra vuelta para nada. */
          const faltan = (Spotify.permisosQueFaltan && Spotify.permisosQueFaltan()) || [];
          const aOscuras = Spotify.sesionSinApuntar && Spotify.sesionSinApuntar();
          if (faltan.length || aOscuras) {
            reconectarSheet(T('Spotify ha rechazado crear la lista.') + ' ' + e.message);
          } else {
            noSonLosPermisosSheet(e.message);
          }
          return;
        }
        UI.toast(e.message || T('No se ha podido guardar en Spotify.'));
      });
  }

  V.musica.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=aSpotify]', function () { subirASpotify(root); });
    bind(root, '[data-a=boveda]', function () { go('claves'); });
    bind(root, '[data-a=olvidarFallo]', function () {
      Spotify.apuntarFallo(null); render();
    });

    /* hay dos botones de conectar: el principal y el de reintentar del aviso */
    bindAll(root, '[data-a=conectar]', function (btn) {
      root.querySelectorAll('[data-a=conectar]').forEach(function (b) { b.disabled = true; });
      Spotify.apuntarFallo(null);
      UI.toast(T('Abriendo Spotify para dar permiso…'));
      Spotify.entrar().catch(function (e) {
        root.querySelectorAll('[data-a=conectar]').forEach(function (b) { b.disabled = false; });
        UI.toast(e.message);
      });
    });
    bind(root, '[data-a=desconectar]', function () {
      Spotify.apagarReproductor();
      Spotify.salir(); render(); UI.toast(T('Spotify desconectado'));
    });

    bind(root, '[data-a=guardarPl]', function () {
      const val = root.querySelector('#sp-pl').value;
      if (val && !Spotify.idDePlaylist(val)) {
        const que = Spotify.queEs(val);
        UI.toast(que
          ? Tn('Eso es el enlace de {que}, no de una lista de reproducción.', { que: T(que) })
          : T('No reconozco ese enlace. Abre la lista en Spotify, pulsa los tres puntos ' +
            'y elige Compartir, Copiar enlace.'));
        return;
      }
      Spotify.guardarPlaylist(val); render(); UI.toast(T('Lista guardada'));
    });

    /* tus listas, con buscador */
    if (root.querySelector('#sp-listas')) {
      pintarListas(root, '');
      const busca = root.querySelector('#sp-buscar');
      let deb = null;
      busca.oninput = function () {
        clearTimeout(deb);
        deb = setTimeout(function () { pintarListas(root, busca.value); }, 350);
      };
      bind(root, '[data-a=recargarListas]', function () { pintarListas(root, busca.value); });

      /* Los filtros se pintan a mano y no por render(), que si no el buscador
         pierde el foco y el teclado se cierra a cada toque. */
      const filtros = root.querySelector('#sp-filtros');
      if (filtros) filtros.onclick = function (ev) {
        const b = ev.target.closest('[data-tipo]');
        if (!b) return;
        const k = b.dataset.tipo;
        if (!k) filtrosBusca = [];
        else {
          const i = filtrosBusca.indexOf(k);
          if (i === -1) filtrosBusca.push(k); else filtrosBusca.splice(i, 1);
        }
        filtros.querySelectorAll('[data-tipo]').forEach(function (x) {
          const suyo = x.dataset.tipo;
          x.classList.toggle('on', suyo
            ? filtrosBusca.indexOf(suyo) !== -1
            : !filtrosBusca.length);
        });
        pintarListas(root, busca.value);
      };
    }

    bind(root, '[data-a=ponerPl]', function () {
      Spotify.ponerPlaylist().then(function () { UI.toast(T('Reproduciendo')); })
        .catch(function (e) { UI.toast(e.message); });
    });

    bind(root, '[data-a=olvidar]', function () {
      IA.olvidarMusica(); render();
      UI.toast(T('Memoria musical borrada: podrán repetirse artistas'));
    });

    bind(root, '[data-a=borrarLista]', function () {
      UI.confirm(T('Borrar la lista'), T('Podrás generar otra cuando quieras.'), T('Borrar'), true)
        .then(function (ok) { if (ok) { guardarLista(null); render(); } });
    });

    /* reproductor propio */
    const host = root.querySelector('#sp-player');
    if (host) montarPlayer(host);

    bindAll(root, '[data-a=generar]', function (btn) { generarLista(btn); });

    bind(root, '[data-a=plegarTemas]', function (btn) {
      const caja = root.querySelector('[data-temas-lista]');
      if (!caja) return;
      temasAbiertos = !temasAbiertos;
      caja.hidden = !temasAbiertos;
      btn.classList.toggle('abierta', temasAbiertos);
      btn.setAttribute('aria-expanded', String(temasAbiertos));
      btn.innerHTML = icon('chevron') + ' ' +
        etiquetaPlegar(caja.querySelectorAll('[data-pista]').length);
    });

    bind(root, '[data-a=reproducirLista]', function (btn) {
      const l = listaGuardada();
      if (!l) return;
      btn.disabled = true;
      lanzar(l.pistas.map(function (p) { return p.uri; }))
        .then(function () { btn.disabled = false; })
        .catch(function () { btn.disabled = false; });
    });

    bindAll(root, '[data-pista]', function (el) {
      const l = listaGuardada();
      if (!l) return;
      const desde = Number(el.dataset.pista);
      lanzar(l.pistas.slice(desde).map(function (p) { return p.uri; }));
    });

    bind(root, '[data-a=diagnostico]', function (btn) {
      const caja = root.querySelector('#sp-diag');
      btn.disabled = true;
      caja.hidden = false;
      caja.textContent = T('Probando…');
      Spotify.diagnostico()
        .then(function (t) { caja.textContent = t; btn.disabled = false; })
        .catch(function (e) {
          caja.textContent = Tn('No se pudo probar: {error}', { error: e.message });
          btn.disabled = false;
        });
    });

  };

  /* Poner a sonar una lista.
     Primero se intenta el reproductor de la app; si no puede (hace falta
     Premium, o el navegador no lo admite), no se deja al usuario con un error
     y sin música: se lanza en el dispositivo de Spotify que esté activo y se
     le dice dónde ha sonado. El desbloqueo del audio va antes de cualquier
     espera, que es lo único que acepta Safari. */
  function lanzar(uris) {
    if (!uris.length) { UI.toast(T('Esa lista no tiene canciones')); return Promise.resolve(); }
    Spotify.desbloquearAudio();

    return Spotify.iniciarReproductor()
      .then(function () {
        return Spotify.reproducirUris(uris).then(function () { UI.toast(T('Sonando en la app')); });
      })
      .catch(function (e) {
        return Spotify.reproducirUris(uris)
          .then(function () { UI.toast(T('Aquí no se pudo, suena en tu Spotify abierto')); })
          .catch(function () {
            UI.toast(e.message + ' ' + T('Abre Spotify en algún dispositivo y vuelve a probar.'));
            throw e;
          });
      });
  }

  /* Asistente de generación: ambiente, duración y una indicación libre */
  function generarLista(btnOrigen) {
    const rutinaHoy = (App.rutinasDeHoy ? App.rutinasDeHoy() : [])[0];

    let ambiente = 'ritmo';

    /* Cuánto dura una lista. Nadie elige «veinte canciones»: se elige cuánto
       va a durar el entreno, y tres minutos y medio de media es lo que mide una
       canción. Con el número a secas hay que hacer la cuenta de cabeza. */
    const duracion = function (n) {
      const min = Math.round(n * 3.5);
      const h = Math.floor(min / 60);
      return h ? h + ' h' + (min % 60 ? ' ' + (min % 60) : '') : Tn('{n} min', { n: min });
    };

    UI.modal(html`
      <h2>${T('Nueva lista')}</h2>
      <p class="muted">${T('La IA propone las canciones y la app las busca en Spotify. ' +
      'Las que no existan se descartan solas.')}</p>

      <!-- Lo que vas a pedir, antes de pedirlo. La misma portada que va a salir
           en la pantalla, para no tener que imaginársela. -->
      <div class="pl-previo" id="pl-previo"></div>

      <label class="tiny">${T('A QUÉ TIENE QUE SONAR')}</label>
      <div class="opciones">
        ${raw(Object.keys(IA.AMBIENTES).map(function (k) {
          const a = IA.AMBIENTES[k];
          return '<button class="opcion' + (k === ambiente ? ' on' : '') + '" data-amb="' + k +
            '" style="--tono:' + (a.tono || 'var(--acc)') + '">' +
            '<span class="op-ico">' + icon(a.icono || 'musica') + '</span>' +
            '<span class="grow"><span class="op-nom">' + esc(T(a.label)) + '</span>' +
            '<span class="op-sub">' + esc(T(a.corto || '')) + '</span></span>' +
            '<span class="op-marca">' + icon('check') + '</span></button>';
        }).join(''))}
      </div>

      <label class="tiny" style="margin-top:16px;display:block">${T('CUÁNTO VA A DURAR')}</label>
      <div class="pl-cuantas">
        ${raw([12, 20, 30].map(function (n) {
          return '<button class="pl-n' + (n === 20 ? ' on' : '') + '" data-num="' + n + '">' +
            '<b>' + n + '</b><i>' + duracion(n) + '</i></button>';
        }).join(''))}
      </div>

      <label class="tiny" style="margin-top:16px;display:block">${T('ALGO MÁS (OPCIONAL)')}</label>
      <input id="pl-libre" placeholder="${T('Nada de reguetón, más rock de los noventa…')}"
             style="margin-top:6px">

      ${raw(rutinaHoy ? html`
        <div class="pl-hoy">
          <span class="ph-ico">${raw(icon('dumbbell'))}</span>
          <span class="grow"><b>${T('Se adapta a lo de hoy')}</b>
            <span class="tiny">${Tn('{rutina}: más pesada en las series duras y más ' +
            'constante entre ellas.', { rutina: rutinaHoy.name })}</span></span>
        </div>` : '')}

      <button class="btn primary block btn-arranque" data-x="crear" style="margin-top:16px">
        ${raw(icon('chispa'))} ${T('Crear lista')}</button>
      <div class="tiny" id="pl-estado" style="margin-top:12px"></div>`,
      function (el) {
        let num = 20;

        /* La portada de lo que vas a pedir, rehecha con cada toque. Es lo que
           convierte tres listas de opciones en una sola decisión que se ve. */
        const pintarPrevio = function () {
          const a = IA.AMBIENTES[ambiente];
          el.querySelector('#pl-previo').innerHTML =
            '<div class="card tarjeta-premium mus-portada" style="margin:0">' +
            '<span class="mus-onda">' + icon(a.icono || 'musica') + '</span>' +
            '<div class="pre-encima">' + esc(T('Vas a pedir')) + '</div>' +
            '<div class="mus-nom">' + esc(T(a.label)) + '</div>' +
            '<div class="mus-meta"><span class="mus-chip">' +
            esc(Tp(num, '{n} canción', '{n} canciones')) + '</span>' +
            '<span class="tiny">' + esc(Tn('{cuanto} de música',
              { cuanto: duracion(num) })) + '</span></div>' +
            '<p class="muted mus-desc">' + esc(T(a.corto || '')) + '</p>' +
            '</div>';
        };
        pintarPrevio();

        el.querySelectorAll('[data-amb]').forEach(function (b) {
          b.onclick = function () {
            ambiente = b.dataset.amb;
            el.querySelectorAll('[data-amb]').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            pintarPrevio();
          };
        });
        el.querySelectorAll('[data-num]').forEach(function (b) {
          b.onclick = function () {
            num = Number(b.dataset.num);
            el.querySelectorAll('[data-num]').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            pintarPrevio();
          };
        });

        el.querySelector('[data-x=crear]').onclick = function (ev) {
          const boton = ev.currentTarget;
          const estado = el.querySelector('#pl-estado');
          boton.disabled = true;
          estado.textContent = T('Pensando la lista…');

          const mostrarFallo = function (e) {
            boton.disabled = false;
            estado.innerHTML = '<span style="color:var(--bad)">' + esc(e.message) + '</span>';
          };

          /* Promise.resolve() antes de nada: si algo falla de forma síncrona,
             el error entra en el catch en vez de dejar el botón bloqueado y el
             "Pensando la lista…" para siempre. */
          Promise.resolve().then(function () { return Spotify.misArtistas(); }).then(function (gustos) {
            return IA.playlistEntreno({
              ambiente: ambiente,
              canciones: num,
              rutina: rutinaHoy ? rutinaHoy.name : '',
              gustos: gustos,
              libre: el.querySelector('#pl-libre').value.trim(),
              semilla: Date.now().toString(36)
            });
          }).then(function (r) {
            estado.textContent = T('Buscando las canciones en Spotify…');
            return Spotify.buscarPistas(r.canciones, function (hechas, total, halladas) {
              estado.textContent = Tn('Buscando {hechas} de {total} · {halladas} encontradas',
                { hechas: hechas, total: total, halladas: halladas });
            }).then(function (pistas) {
              if (!pistas.length) throw new Error(T('Ninguna de las canciones apareció en Spotify.'));
              IA.recordarMusica(pistas.map(function (p) { return p.artista.split(',')[0].trim(); }));
              guardarLista({
                nombre: r.nombre || T('Lista de entrenamiento'),
                descripcion: r.descripcion || '',
                ambiente: T(IA.AMBIENTES[ambiente].label),
                creada: Date.now(),
                pistas: pistas
              });
              UI.closeModal();
              render();
              UI.toast(Tp(pistas.length, '{n} canción lista', '{n} canciones listas'));
            });
          }).catch(mostrarFallo);
        };
      });
  }

  /* Reproductor propio: se conecta al pulsar, porque el navegador exige un gesto */
  function montarPlayer(host) {
    const pintar = function (s) {
      host.innerHTML = s ? Reproductor.html(s) : html`
        <div class="card">
          <div class="row between">
            <div class="grow">
              <div style="font-weight:600">${T('Reproductor de la app')}</div>
              <div class="tiny">${T('Suena aquí mismo, sin abrir Spotify')}</div>
            </div>
            <button class="btn primary sm" data-a="activar">${raw(icon('play'))} ${T('Activar')}</button>
          </div>
        </div>`;
      if (s) Reproductor.montar(host);
      const activar = host.querySelector('[data-a=activar]');
      if (activar) activar.onclick = function () {
        activar.disabled = true;
        activar.textContent = T('Conectando…');
        Spotify.iniciarReproductor()
          .then(function () { return Spotify.traerAqui(); })
          .then(function () {
            UI.toast(T('Listo: la música sonará en la app'));
            pintar(Spotify.estado());
          })
          .catch(function (e) {
            activar.disabled = false;
            activar.innerHTML = icon('play') + ' ' + esc(T('Activar'));
            UI.toast(e.message);
          });
      };
    };

    pintar(Spotify.reproductorActivo() ? Spotify.estado() : null);
    Spotify.alCambiar(function (s) { if (s) pintar(s); });

    if (!Spotify.reproductorActivo()) {
      Spotify.sonando().then(function (s) { if (s) pintar(s); }).catch(function () { /* nada */ });
    }
  }

  /* Reproductor completo. La portada manda: es lo que hace que parezca un
     reproductor y no una fila de botones. */
  /* Si la canción de ahora está en tus favoritas de Spotify. Se consulta al
     pintar y se recuerda mientras no cambie de tema. */
  let favoritaActual = false;
  let favoritaDe = '';
  /* De qué lista sale lo que suena. Se guarda la uri para no volver a
     preguntar el nombre mientras no cambie. */
  let ctxUri = '';
  let ctxNombre = '';

  /* null = todavía no se sabe si Spotify deja guardar favoritas */
  let favVa = null;
  let favPreguntado = false;
  /* null = todavía no se sabe; false = este aparato no deja tocar el volumen */
  let volumenVa = null;
  let volActual = 0.6;            // el que trae el reproductor al arrancar

  function comprobarFavorita(s, alSaber) {
    if (favVa === false) return;   /* aquí Spotify ni lee ni escribe favoritas */
    if (!s || !s.id || s.id === favoritaDe) return;
    favoritaDe = s.id;
    Spotify.esFavorita(s.id).then(function (si) {
      if (si !== favoritaActual) { favoritaActual = si; if (alSaber) alSaber(); }
    });
  }

  /* El nombre de donde sale la canción. El reproductor propio a veces lo trae
     puesto; si no, se pregunta una vez y se pinta cuando llegue. */
  function comprobarContexto(s, alSaber) {
    const uri = (s && s.contexto) || '';
    if (uri === ctxUri) return;
    ctxUri = uri;
    if (!uri) { ctxNombre = ''; return; }

    if (s.contextoNombre) {
      ctxNombre = s.contextoNombre;
      if (alSaber) alSaber();
      return;
    }
    ctxNombre = '';
    Spotify.nombreDeContexto(uri).then(function (n) {
      if (uri !== ctxUri || !n) return;
      ctxNombre = n;
      if (alSaber) alSaber();
    });
  }

  /* Lo último que se pintó. montar() no recibe el estado y, cuando la música
     suena en otro aparato, Spotify.estado() no devuelve nada. */
  let pintado = null;

  function reproductorHTML(s) {
    pintado = s;
    const pct = s.duracion ? Math.min(100, Math.round(s.progreso / s.duracion * 100)) : 0;

    return html`
      <div class="player ${s.sonando ? 'sonando' : ''}">
        ${raw(s.portada
          ? '<img class="player-art" src="' + esc(s.portada) + '" alt="">'
          : '<div class="player-art vacia">' + icon('musica') + '</div>')}

        <div class="player-info">
          <div class="player-t">${s.titulo}</div>
          <div class="player-a">${s.artista}</div>
          ${raw(ctxNombre ? html`
            <div class="player-de">${raw(icon('lista'))} <span>${ctxNombre}</span></div>` : '')}
        </div>

        <div class="player-barra"><i style="width:${pct}%"></i></div>
        <div class="player-tiempos">
          <span>${UI.mmss((s.progreso || 0) / 1000)}</span>
          <span>${s.duracion ? UI.mmss(s.duracion / 1000) : ''}</span>
        </div>

        <div class="player-mandos">
          <button class="player-b chico ${s.aleatorio ? 'on' : ''}" data-sp="aleatorio"
            aria-label="Aleatorio" aria-pressed="${!!s.aleatorio}">
            ${raw(icon('aleatorio'))}</button>
          <button class="player-b" data-sp="anterior" aria-label="Anterior">
            ${raw(icon('anterior'))}</button>
          <button class="player-b grande" data-sp="alternar"
            aria-label="${s.sonando ? 'Pausar' : 'Reproducir'}">
            ${raw(icon(s.sonando ? 'pausaLleno' : 'playLleno'))}</button>
          <button class="player-b" data-sp="siguiente" aria-label="${T('Siguiente')}">
            ${raw(icon('siguiente'))}</button>
          ${raw(favVa === false ? '<span class="player-b chico hueco"></span>' : html`
          <button class="player-b chico ${favoritaActual ? 'fav' : ''}" data-sp="corazon"
            aria-label="${T('Guardar en favoritas')}" aria-pressed="${!!favoritaActual}">
            ${raw(icon('corazon'))}</button>`)}
        </div>

        ${raw(s.local && volumenVa !== false ? html`
          <div class="player-vol" style="--pct:${Math.round(volActual * 100)}%">
            ${raw(icon('altavoz'))}
            <input type="range" min="0" max="100" value="${Math.round(volActual * 100)}"
                   id="player-vol" aria-label="${T('Volumen')}">
          </div>` : '')}

        ${raw(s.dispositivo ? html`
          <div class="player-donde">
            ${raw(icon('altavoz'))} <span>${s.dispositivo}</span>
            ${raw(s.local ? '' : '<button class="btn sm" data-sp="traer">' +
              esc(T('Traer aquí')) + '</button>')}
          </div>` : '')}
      </div>`;
  }

  function montarReproductor(root) {
    const vol = root.querySelector('#player-vol');
    if (vol) {
      vol.oninput = function () {
        volActual = Number(vol.value) / 100;
        vol.parentNode.style.setProperty('--pct', vol.value + '%');
        Spotify.volumen(volActual).catch(function () { /* sin reproductor propio */ });
      };
      if (volumenVa === null && Spotify.admiteVolumen) {
        Spotify.admiteVolumen().then(function (va) {
          volumenVa = va;
          if (!va && root.isConnected) {
            const s = Spotify.estado();
            if (s) { root.innerHTML = reproductorHTML(s); montarReproductor(root); }
          }
        });
      }
    }

    if (!favPreguntado && Spotify.puedeGuardar) {
      favPreguntado = true;
      Spotify.puedeGuardar().then(function (va) {
        if (va === favVa) return;
        favVa = va;
        if (!va && root.isConnected) {
          const s = Spotify.estado();
          if (s) { root.innerHTML = reproductorHTML(s); montarReproductor(root); }
        }
      });
    }

    comprobarContexto(pintado, function () {
      const s = pintado;
      if (s && root.isConnected) { root.innerHTML = reproductorHTML(s); montarReproductor(root); }
    });

    const s0 = pintado;
    comprobarFavorita(s0, function () {
      const c = root.querySelector('[data-sp=corazon]');
      if (c) { c.classList.toggle('fav', favoritaActual); c.setAttribute('aria-pressed', String(favoritaActual)); }
    });

    root.querySelectorAll('[data-sp]').forEach(function (b) {
      b.onclick = function () {
        /* Safari solo desbloquea el audio dentro del gesto: si se hace después
           de esperar a una promesa, ya no vale y el sonido no sale. */
        Spotify.desbloquearAudio();
        const acciones = {
          alternar: Spotify.alternar, siguiente: Spotify.siguiente,
          anterior: Spotify.anterior, traer: Spotify.traerAqui,
          aleatorio: function () {
            const s = Spotify.estado() || {};
            return Spotify.aleatorio(!s.aleatorio).then(function () {
              UI.toast(!s.aleatorio ? T('Aleatorio activado') : T('Aleatorio desactivado'));
            });
          },
          corazon: function () {
            const propio = Spotify.estado();
            const dame = propio && propio.id
              ? Promise.resolve(propio)
              : Spotify.sonando();
            return dame.then(function (s) {
              return Spotify.marcarFavorita(s && s.id, !favoritaActual);
            }).then(function () {
              favoritaActual = !favoritaActual;
              UI.toast(favoritaActual ? T('Guardada en tus favoritas de Spotify')
                : T('Quitada de favoritas'));
            });
          }
        };
        const fn = acciones[b.dataset.sp];
        if (!fn) return;
        b.disabled = true;
        fn().then(function () {
          setTimeout(function () {
            Spotify.sonando().then(function (s) {
              if (s) { root.innerHTML = reproductorHTML(s); montarReproductor(root); }
            }).catch(function () { b.disabled = false; });
          }, 400);
        }).catch(function (e) {
          b.disabled = false;
          UI.toast(e.message);
        });
      };
    });
  }

  /* ---------- barra de música en toda la app ----------
     Igual que el cronómetro: mientras suena algo, se controla desde cualquier
     pantalla sin ir a buscar el reproductor. En la pantalla de música sobra,
     que allí está el grande. */
  let latidoMusica = null;
  let ultimoEstado = null;

  function pintarBarraMusica() {
    const host = document.getElementById('musica-host');
    if (!host) return;

    /* al vaciar hay que olvidar la firma: si no, al volver cree que ya está
       pintada y la barra no reaparece */
    const vaciar = function () {
      if (host.innerHTML) { host.innerHTML = ''; document.body.classList.remove('con-musica'); }
      ultimoEstado = null;
    };

    const enMusica = location.hash.indexOf('musica') !== -1;
    if (!Spotify.activa() || !Spotify.reproductorActivo() || enMusica) {
      vaciar();
      clearInterval(latidoMusica); latidoMusica = null;
      return;
    }

    const s = Spotify.estado();
    if (!s) { vaciar(); return; }

    /* solo se redibuja cuando cambia la canción o el estado */
    const firma = s.titulo + '|' + s.sonando;
    if (firma !== ultimoEstado) {
      ultimoEstado = firma;
      host.innerHTML = html`
        <div class="barra-musica">
          <button class="bm-ir" data-m="ir">
            ${raw(s.portada ? '<img src="' + esc(s.portada) + '" alt="">'
              : '<span class="bm-sin">' + icon('musica') + '</span>')}
            <span class="bm-txt">
              <b>${s.titulo}</b>
              <span>${s.artista}</span>
            </span>
          </button>
          <button class="bm-b" data-m="alternar"
                  aria-label="${s.sonando ? 'Pausar' : 'Reproducir'}">
            ${raw(icon(s.sonando ? 'pausaLleno' : 'playLleno'))}</button>
          <button class="bm-b" data-m="siguiente" aria-label="Siguiente">
            ${raw(icon('siguiente'))}</button>
        </div>`;

      host.querySelector('[data-m=ir]').onclick = function () { App.go('musica'); };
      host.querySelectorAll('[data-m=alternar],[data-m=siguiente]').forEach(function (b) {
        b.onclick = function () {
          Spotify.desbloquearAudio();
          const fn = b.dataset.m === 'siguiente' ? Spotify.siguiente : Spotify.alternar;
          b.disabled = true;
          fn().catch(function (e) { UI.toast(e.message); })
            .then(function () { setTimeout(function () { b.disabled = false; }, 300); });
        };
      });
    }

    document.body.classList.add('con-musica');
    if (!latidoMusica) latidoMusica = setInterval(pintarBarraMusica, 3000);
  }

  /* el propio reproductor avisa de cada cambio: la barra se entera al momento */
  if (g.Spotify && Spotify.alCambiar) Spotify.alCambiar(function () { pintarBarraMusica(); });

  g.Reproductor = {
    html: reproductorHTML, montar: montarReproductor, barra: pintarBarraMusica
  };
  V.franjasSheet = franjasSheet;
})(window);
