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

  /* El día de hoy dentro del menú semanal, si es que hay menú generado */
  function menuDeHoy() {
    const guardado = Store.settings().menu;
    const plan = guardado && guardado.plan;
    if (!plan || !plan.dias || !plan.dias.length) return null;

    const nombre = DIAS_LARGOS[new Date().getDay()];
    const suyo = plan.dias.filter(function (d) {
      return I18N.norm(String(d.dia || '')) === I18N.norm(nombre);
    })[0];
    /* Un menú de siete días puede venir sin nombrar los días; entonces se coge
       por posición, con el lunes primero, que es como se lee un plan semanal. */
    if (suyo) return suyo;
    const i = (new Date().getDay() + 6) % 7;
    return plan.dias[i] || null;
  }

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

      <!-- ============ entrenamiento ============ -->
      <div class="list-title">Lo que toca entrenar</div>
      ${raw(rutina ? html`
        <div class="card">
          <div class="row between" style="align-items:flex-start;gap:10px">
            <div class="grow">
              <div style="font-weight:700;font-size:1.02rem">${App.tituloRutina(rutina)}</div>
              <div class="tiny" style="margin-top:3px">${rutina.exercises.length} ejercicios
                · ${rutina.exercises.reduce(function (n, e) { return n + e.sets; }, 0)} series</div>
            </div>
            <button class="btn primary" data-a="entrenar">${raw(icon('play'))} Entrenar</button>
          </div>
          <div class="rt-detalle" style="margin-top:10px">
            ${raw(rutina.exercises.slice(0, 4).map(function (e, k) {
              const ex = Data.get(e.exId);
              return '<div class="row between" style="padding:4px 0;gap:10px">' +
                '<span style="font-size:.86rem">' + (k + 1) + '. ' +
                esc(ex ? ex.nameEs : e.exId) + '</span>' +
                '<span class="tiny">' + e.sets + ' × ' + e.reps + '</span></div>';
            }).join(''))}
            ${raw(rutina.exercises.length > 4
              ? '<div class="tiny" style="padding:4px 0">y ' +
                (rutina.exercises.length - 4) + ' más</div>' : '')}
          </div>
        </div>`
      : html`
        <div class="card">
          <b>Hoy descansas</b>
          <p class="tiny" style="margin:6px 0 0">No hay ninguna rutina puesta para hoy.
          Descansar es parte del plan; si te apetece moverte, camina o apunta lo que hagas.</p>
          <button class="btn block sm" data-a="rutinas" style="margin-top:10px">
            Elegir una rutina igualmente</button>
        </div>`)}

      <!-- ============ comida ============ -->
      <div class="list-title">Lo que llevas comido</div>
      ${raw(m ? html`
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
              ${raw(icon('nutricion'))} Foto</label>
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
        </div>`)}

      ${raw(comidas.length ? html`
        <div class="list">
          ${raw(comidas.map(function (c) {
            return '<div class="list-row"><div class="grow">' +
              '<div class="list-row-title">' + esc(c.plato) + '</div>' +
              '<div class="list-row-sub">' + UI.num(c.kcal) + ' kcal · ' + c.prot + ' g' +
              (c.fuente === 'foto' ? ' · de una foto' : '') + '</div></div>' +
              '<button class="btn sm ghost danger" data-quitar="' + esc(c.id) +
              '" aria-label="Quitar">' + icon('trash') + '</button></div>';
          }).join(''))}
        </div>` : '')}

      <!-- ============ qué comer ============ -->
      <div class="list-title">Qué te toca comer hoy</div>
      ${raw(menu ? html`
        <div class="card">
          ${raw((menu.comidas || []).map(function (c) {
            return '<div style="padding:7px 0">' +
              '<div class="row between" style="gap:10px">' +
              '<b style="font-size:.92rem">' + esc(c.nombre || 'Comida') +
              (c.hora ? ' <span class="tiny">' + esc(c.hora) + '</span>' : '') + '</b>' +
              '<span class="tiny">' + UI.num(c.kcal || 0) + ' kcal · ' +
              (c.prot || 0) + ' g</span></div>' +
              '<p style="margin:3px 0 0;font-size:.88rem">' + esc(c.plato || '') + '</p>' +
              ((c.alternativas || []).length
                ? '<p class="tiny" style="margin:3px 0 0">O bien: ' +
                  esc(c.alternativas.join(' · ')) + '</p>' : '') +
              '</div>';
          }).join('<div class="hr"></div>'))}
        </div>
        <p class="tiny" style="margin:8px 0 0">Del menú que te preparó el
        entrenador. <b data-a="menu" style="color:var(--acc)">Ver la semana entera</b></p>`
      : html`
        <div class="card">
          <b>Todavía no tienes menú</b>
          <p class="tiny" style="margin:6px 0 0">El entrenador puede prepararte uno semanal
          con tus calorías, tu dieta y tus horarios, y entonces aquí verás lo que te toca
          comer hoy y a qué hora.</p>
          <button class="btn primary block sm" data-a="menu" style="margin-top:10px">
            ${raw(icon('chispa'))} Prepararme el menú</button>
        </div>`)}

      <div style="height:10px"></div>`;
  };

  V.dia.mount = function (root) {
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
