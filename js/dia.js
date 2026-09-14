/* dia.js — todo lo de hoy en una pantalla.

   «Ver el día» llevaba a Alimentación, que es la pantalla de los números y del
   menú de la semana entera. Pero cuando uno mira el día no quiere el cálculo:
   quiere saber qué le toca entrenar, qué lleva comido, qué le queda por comer y
   con qué. Eso estaba repartido en tres sitios.

   No calcula nada nuevo: junta lo que ya hay —la rutina de hoy, las comidas
   apuntadas, el menú semanal si está generado y la frase del entrenador— y lo
   pone en el orden en que se mira. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves',
    'Viernes', 'Sábado'];

  /* La frase del entrenador tarda en llegar; se guarda aquí para no pedirla otra
     vez en cada repintado de la pantalla. */
  let frase = '';
  let pidiendoFrase = false;

  function rutinaDeHoy() {
    /* Por App y no a mano: así respeta el plan marcado como activo y no hay dos
       ideas distintas de qué toca hoy. */
    return (App.rutinasDeHoy ? App.rutinasDeHoy(true) : [])[0] || null;
  }

  /* El día de hoy dentro del menú semanal, si es que hay menú generado.

     Lo elige Menus y no esta pantalla: desde que hay varios menús guardados,
     «el menú» es el que está marcado, igual que «la rutina de hoy» es la del
     plan marcado. */
  function menuDeHoy() {
    return g.Menus ? Menus.diaDeHoy() : null;
  }

  /* La portada tambien pinta el menu de hoy, y una segunda copia de este
     calculo acabaria diciendo un dia distinto que esta. */
  V.menuDeHoy = menuDeHoy;

  /* La misma barra de la portada, que ya existe: dos barras distintas para lo
     mismo acaban separándose con el tiempo. */
  function barra(hecho, meta, clase) {
    const pct = meta > 0 ? Math.min(100, Math.round(hecho / meta * 100)) : 0;
    return '<div class="prog ' + (clase || '') + '" style="margin-top:5px">' +
      '<i style="width:' + pct + '%"></i></div>';
  }

  V.dia = function () {
    const p = Perfil.datos();
    const m = Perfil.completo(p) ? Perfil.macros(p) : null;
    const h = g.Comidas ? Comidas.hoy() : { kcal: 0, prot: 0 };
    const comidas = g.Comidas ? Comidas.todas().filter(function (c) {
      return Comidas.claveDia(c.t) === Comidas.claveDia(Date.now());
    }) : [];
    const rutina = rutinaDeHoy();
    const menu = menuDeHoy();
    const hoy = new Date();
    const nombre = String(Store.settings().name || '').trim();

    const faltanKcal = m ? Math.max(0, m.kcal - h.kcal) : 0;
    const faltanProt = m ? Math.max(0, m.prot - h.prot) : 0;

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Inicio</button>

      <h1 style="margin-bottom:2px">${DIAS_LARGOS[hoy.getDay()]}</h1>
      <p class="muted" style="margin-top:0">${hoy.toLocaleDateString('es-ES',
        { day: 'numeric', month: 'long' })}${nombre ? ' · ' + nombre : ''}</p>

      ${raw(frase ? html`
        <div class="card destacado-clave">
          <div class="row" style="gap:10px;align-items:flex-start">
            <span class="row-icon" style="flex:none">${raw(icon('chispa'))}</span>
            <p style="margin:0">${frase}</p>
          </div>
        </div>` : '')}

      ${raw(seccionAgua())}
      ${raw(seccionComer(menu))}
      ${raw(seccionEntrenar(rutina))}
      ${raw(seccionComido(m, h, comidas, faltanKcal, faltanProt))}

      <div style="height:10px"></div>`;
  };

  /* ---------- las cuatro secciones ----------
     Antes era una sola tirada: la rutina entera, el recuento, lo apuntado y el
     menú, uno detrás de otro. En un día con menú de cinco comidas y rutina de
     cinco ejercicios eso son tres pantallas de scroll para ver si has bebido
     agua.

     Ahora son cuatro cajones plegados, en el orden en que se usan a lo largo
     del día: el agua —que se marca a cada rato—, lo que toca comer, lo que toca
     entrenar y, al final, el recuento de lo que llevas, que es para mirar y no
     para hacer. Cada uno se abre tocándolo y se queda como lo dejes. */
  const seccionesDia = {};

  function plegable(id, titulo, cola, cuerpo, extra) {
    if (!cuerpo) return '';
    return html`
      <details class="seccion" data-sec="${id}"${raw(seccionesDia[id] ? ' open' : '')}>
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="list-title" style="margin:0">${titulo}</span>
          ${raw(cola ? '<span class="tiny sec-cola">' + esc(cola) + '</span>' : '')}
          ${raw(extra || '')}
        </summary>
        <div class="sec-cuerpo"><div class="stack">${raw(cuerpo)}</div></div>
      </details>`;
  }

  function seccionAgua() {
    const cuerpo = g.Marcar ? Marcar.aguaDeHoyHTML() : '';
    if (!cuerpo) return '';
    const llevo = g.Agua && Agua.seLleva() ? Agua.hoy() : null;
    return plegable('agua', 'Hidratación',
      llevo ? String(llevo.litros).replace('.', ',') + ' L hoy' : '', cuerpo);
  }

  function seccionComer(menu) {
    const total = (menu && menu.comidas || []).reduce(function (n, c) {
      return n + (Number(c.kcal) || 0);
    }, 0);

    const cuerpo = menu && g.Marcar ? Marcar.hoyHTML() + html`
        <p class="tiny" style="margin:2px 0 0">Del menú que te preparó el entrenador.
        <b data-a="menu" style="color:var(--acc)">Ver la semana entera</b></p>`
      : html`
        <div class="card">
          <b>Todavía no tienes menú</b>
          <p class="tiny" style="margin:6px 0 0">El entrenador puede prepararte uno semanal
          con tus calorías, tu dieta y tus horarios, y entonces aquí verás lo que te toca
          comer hoy y a qué hora.</p>
          <button class="btn primary block sm" data-a="menu" style="margin-top:10px">
            ${raw(icon('chispa'))} Prepararme el menú</button>
        </div>`;

    return plegable('comer', 'Lo que debo comer',
      total ? UI.num(total) + ' kcal' : '', cuerpo);
  }

  function seccionEntrenar(rutina) {
    if (!rutina) {
      return plegable('entrenar', 'Lo que voy a entrenar', 'Hoy descansas', html`
        <div class="card">
          <b>Hoy descansas</b>
          <p class="tiny" style="margin:6px 0 0">No hay ninguna rutina puesta para hoy.
          Descansar es parte del plan; si te apetece moverte, camina o apunta lo que hagas.</p>
          <button class="btn block sm" data-a="rutinas" style="margin-top:10px">
            Elegir una rutina igualmente</button>
        </div>`);
    }

    const series = rutina.exercises.reduce(function (n, e) { return n + e.sets; }, 0);

    /* Con su miniatura y su músculo: una lista de nombres no dice qué vas a
       hacer, y el dibujo se reconoce antes que el nombre. Tocar uno abre su
       ficha, igual que en Rutinas. */
    const cuerpo = html`
      <div class="card" style="padding:0;overflow:hidden">
        <div class="rt-detalle">
          ${raw(rutina.exercises.map(function (re, k) {
            const ex = Data.get(re.exId);
            return '<button class="rt-item" data-ver="' + esc(re.exId) + '" ' +
              'style="width:100%;text-align:left">' +
              '<img src="' + (ex ? Data.img(ex, 0) : Data.PLACEHOLDER) + '" alt="" ' +
              'loading="lazy">' +
              '<div class="grow"><div style="font-weight:600;font-size:.85rem">' +
              (k + 1) + '. ' + esc(ex ? ex.nameEs : re.exId) + '</div>' +
              '<div class="tiny">' + re.sets + ' × ' + re.reps +
              (ex && ex.primaryMuscles.length
                ? ' · ' + esc(ex.primaryMuscles.map(I18N.muscle).join(', ')) : '') +
              '</div></div></button>';
          }).join(''))}
        </div>
      </div>`;

    /* El botón de entrenar va en la cabecera y no dentro: si estuviera dentro
       habría que desplegar la rutina entera para poder empezarla. */
    /* Solo los ejercicios en la cola: con el botón de entrenar al lado no cabe
       «5 ejercicios · 20 series» sin partir el título en dos renglones, y las
       series ya salen dentro. */
    return plegable('entrenar', 'Lo que voy a entrenar',
      rutina.exercises.length + ' ejercicios', cuerpo,
      '<button class="btn primary sm sec-boton" data-a="entrenar">' +
      icon('play') + ' Entrenar</button>');
  }

  function seccionComido(m, h, comidas, faltanKcal, faltanProt) {
    const cuerpo = m ? html`
        <div class="card">
          <div class="row" style="gap:14px">
            <div class="grow">
              <div class="tiny">CALORÍAS</div>
              <div style="font-weight:700;font-size:1.15rem">${UI.num(h.kcal)}<span
                class="tiny"> / ${UI.num(m.kcal)}</span></div>
              ${raw(barra(h.kcal, m.kcal))}
            </div>
            <div class="grow">
              <div class="tiny">PROTEÍNA</div>
              <div style="font-weight:700;font-size:1.15rem;color:var(--blue)">${h.prot}<span
                class="tiny" style="color:var(--dim)"> / ${m.prot} g</span></div>
              ${raw(barra(h.prot, m.prot, 'azul'))}
            </div>
          </div>
          <p class="tiny" style="margin:10px 0 0">${faltanProt
            ? 'Te faltan ' + faltanProt + ' g de proteína y ' + UI.num(faltanKcal) + ' kcal.'
            : 'Ya has llegado a la proteína del día.'}</p>

          <div class="row" style="margin-top:12px">
            <label class="btn primary grow" for="foto-dia" style="cursor:pointer">
              ${raw(icon('camara'))} Foto</label>
            <button class="btn grow" data-a="amano">${raw(icon('plus'))} A mano</button>
          </div>
          <input type="file" id="foto-dia" accept="image/*" capture="environment" hidden>
        </div>`
      : html`
        <div class="card">
          <b>Faltan tus datos</b>
          <p class="tiny" style="margin:6px 0 0">Sin peso, altura, edad y sexo no puedo
          calcular tus calorías.</p>
          <button class="btn primary block sm" data-a="datos" style="margin-top:10px">
            Completar mis datos</button>
        </div>`;

    const lista = comidas.length ? html`
      <div class="list">
        ${raw(comidas.map(function (c) {
          return '<div class="list-row"><div class="grow">' +
            '<div class="list-row-title">' + esc(c.plato) + '</div>' +
            '<div class="list-row-sub">' + UI.num(c.kcal) + ' kcal · ' + c.prot + ' g' +
            (c.fuente === 'foto' ? ' · de una foto' : '') +
            (c.sustituye ? ' · en vez de ' + esc(c.sustituye) : '') + '</div></div>' +
            '<button class="btn sm ghost danger" data-quitar="' + esc(c.id) +
            '" aria-label="Quitar">' + icon('trash') + '</button></div>';
        }).join(''))}
      </div>` : '';

    return plegable('comido', 'Lo que llevo comido',
      m ? UI.num(h.kcal) + ' / ' + UI.num(m.kcal) + ' kcal' : '', cuerpo + lista);
  }

  V.dia.mount = function (root) {
    /* Marcar comidas y agua lo lleva su módulo, el mismo que en Alimentación */
    if (g.Marcar) Marcar.bind(root);

    /* Qué cajones quedan abiertos. Marcar una comida o un vaso repinta la
       pantalla, y sin esto se te cerraría el cajón en el que estabas justo al
       marcar algo dentro. */
    root.querySelectorAll('details.seccion').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) seccionesDia[d.dataset.sec] = true;
        else delete seccionesDia[d.dataset.sec];
      });
    });

    /* El botón de entrenar vive en la cabecera del cajón: al pulsarlo no debe
       abrirse ni cerrarse el cajón, que es lo que hace un clic en un summary. */
    const btnEntrenar = root.querySelector('.sec-boton[data-a=entrenar]');
    if (btnEntrenar) {
      btnEntrenar.addEventListener('click', function (e) { e.preventDefault(); });
    }

    /* Abrir la ficha de un ejercicio desde la lista de la rutina */
    App.bindAll(root, '[data-ver]', function (el) {
      App.exerciseSheet(el.dataset.ver);
    });

    App.bind(root, '[data-a=atras]', function () { App.go('inicio'); });
    App.bind(root, '[data-a=rutinas]', function () { App.go('rutinas'); });
    App.bind(root, '[data-a=datos]', function () { App.go('datos'); });
    App.bind(root, '[data-a=menu]', function () { App.go('nutricion'); });

    App.bind(root, '[data-a=entrenar]', function () {
      const r = rutinaDeHoy();
      if (!r) return;
      Workout.start(r);
      App.go('entrenar');
    });

    App.bind(root, '[data-a=amano]', function () {
      if (V.comidaAMano) V.comidaAMano();
    });

    App.bindAll(root, '[data-quitar]', function (el) {
      Comidas.borrar(el.dataset.quitar);
      App.render();
      UI.toast('Quitado');
    });

    const foto = root.querySelector('#foto-dia');
    if (foto) foto.onchange = function () {
      const f = foto.files && foto.files[0];
      if (f && V.mirarFotoComida) V.mirarFotoComida(f);
      foto.value = '';
    };

    /* La frase se pide una vez y se queda; si no hay entrenador configurado,
       esta pantalla vale igual y simplemente no la lleva. */
    if (!frase && !pidiendoFrase && g.IA && IA.activa()) {
      pidiendoFrase = true;
      IA.pildora().then(function (t) {
        frase = String((t && t.frase) || '').trim();
        pidiendoFrase = false;
        if (frase && location.hash.indexOf('dia') !== -1) App.render();
      }).catch(function () { pidiendoFrase = false; });
    }
  };
})(window);
