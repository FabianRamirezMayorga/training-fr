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
      ${raw(seccionPlan(m))}

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

  /* Un cajón. Lleva su título, lo que dice plegado, una frase que explica para
     qué sirve y, al fondo, la silueta de lo que es.

     La frase no es adorno: plegado, «HIDRATACIÓN · 2,5 L hoy» dice cuánto has
     bebido pero no que ahí dentro se marca cada vaso. Quien no lo abra no se
     entera de que existe, y quien lo abra tendrá que deducirlo. */
  /* Cuánto llevas de lo que pide el cajón, en la propia cabecera. Plegado
     decía «llevas 3 de 5» con palabras, y una cuenta escrita hay que leerla:
     cinco trozos con tres encendidos se ve sin leer nada. Cuando lo que se
     cuenta no son cosas sino calorías —que no van de una en una— es una barra
     y no trozos. */
  function barra(pr) {
    if (!pr || !pr.total) return '';
    if (pr.continuo) {
      const pct = Math.max(0, Math.min(100, Math.round(pr.hecho / pr.total * 100)));
      const casi = pct >= 100 ? ' lleno' : '';
      return '<span class="sec-barra' + casi + '"><i style="width:' + pct + '%"></i></span>';
    }
    let trozos = '';
    for (let i = 0; i < pr.total; i++) {
      trozos += '<i' + (i < pr.hecho ? ' class="si"' : '') + '></i>';
    }
    return '<span class="sec-trozos' +
      (pr.hecho >= pr.total ? ' lleno' : '') + '">' + trozos + '</span>';
  }

  function plegable(o) {
    if (!o.cuerpo) return '';
    return html`
      <details class="seccion sec-marcada" data-sec="${o.id}"
               style="--tono:${raw(o.tono || 'var(--acc)')}"${raw(
        seccionesDia[o.id] ? ' open' : '')}>
        <summary>
          <!-- La silueta va DENTRO del summary y no suelta en el details: un
               details oculta todos sus hijos menos el summary mientras está
               plegado, así que ahí fuera no se veía nunca —que es justo cuando
               más falta hace, para distinguir un cajón de otro sin leerlos—. -->
          ${raw(o.marca ? '<span class="sec-silueta">' + icon(o.marca) + '</span>' : '')}
          ${raw(o.marca ? '<span class="sec-ico">' + icon(o.marca) + '</span>' : '')}
          <span class="grow" style="min-width:0">
            <span class="sec-tit">${o.titulo}</span>
            ${raw(o.sub ? '<span class="sec-sub">' + esc(o.sub) + '</span>' : '')}
            ${raw(barra(o.progreso))}
          </span>
          ${raw(o.cola ? '<span class="tiny sec-cola">' + esc(o.cola) + '</span>' : '')}
          ${raw(o.extra || '')}
          <span class="chevron sec-flecha">${raw(icon('chevron'))}</span>
        </summary>
        <div class="sec-cuerpo"><div class="stack">${raw(o.cuerpo)}</div></div>
      </details>`;
  }

  function seccionAgua() {
    const cuerpo = g.Marcar ? Marcar.aguaDeHoyHTML() : '';
    if (!cuerpo) return '';

    const m = g.Menus ? Menus.activo() : null;
    const h = m && m.plan && m.plan.hidratacion;
    const tomas = (h && h.pauta || []).length;
    const llevo = g.Agua && Agua.seLleva() ? Agua.hoy() : null;
    const hechas = llevo
      ? (h && h.pauta || []).filter(function (x, i) {
          return Agua.marcada(m.id + '#' + i);
        }).length
      : 0;

    return plegable({
      id: 'agua', titulo: 'Hidratación', marca: 'vaso', tono: '#4f8cf5',
      progreso: { hecho: hechas, total: tomas },
      cola: llevo ? UI.dec(llevo.litros) + ' L hoy' : '',
      /* «Llevas 0» a secas contradecía al «2,5 L hoy» de al lado cuando el agua
         venía de vasos sueltos: lo que cuenta la frase son las tomas de la
         pauta marcadas, y hay que decirlo. */
      sub: !llevo ? 'Tu pauta de agua del día.'
        : tomas
          ? 'Tu pauta son ' + tomas + ' tomas y llevas ' + hechas +
            ' marcadas. Marca cada vez que bebas.'
          : 'Marca cada vaso y aquí verás cuánto llevas.',
      cuerpo: cuerpo
    });
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

    const cuantas = (menu && menu.comidas || []).length;
    const hechas = cuantas && g.Menus && g.Comidas && Comidas.seLleva()
      ? (function () {
          const d = Menus.hoyConRef();
          if (!d) return 0;
          return (d.dia.comidas || []).filter(function (c, j) {
            return Comidas.marcada(Marcar.ref(d.menu.id, d.i, j));
          }).length;
        })()
      : 0;

    return plegable({
      id: 'comer', titulo: 'Lo que debo comer', marca: 'nutricion', tono: '#2fc4b2',
      progreso: { hecho: hechas, total: cuantas },
      cola: total ? UI.num(total) + ' kcal' : '',
      sub: !cuantas ? 'Todavía no tienes menú para hoy.'
        : hechas >= cuantas
          ? 'Las ' + cuantas + ' comidas de hoy, resueltas.'
          : 'Son ' + cuantas + ' comidas y llevas ' + hechas +
            '. Marca la que te comas, o dime si comiste otra cosa.',
      cuerpo: cuerpo
    });
  }

  function seccionEntrenar(rutina) {
    if (!rutina) {
      return plegable({
        id: 'entrenar', titulo: 'Lo que voy a entrenar', marca: 'dumbbell',
        tono: 'var(--acc)', cola: 'Hoy descansas',
        sub: 'Hoy no toca nada. Descansar también es parte del plan.',
        cuerpo: html`
        <div class="card">
          <b>Hoy descansas</b>
          <p class="tiny" style="margin:6px 0 0">No hay ninguna rutina puesta para hoy.
          Descansar es parte del plan; si te apetece moverte, camina o apunta lo que hagas.</p>
          <button class="btn block sm" data-a="rutinas" style="margin-top:10px">
            Elegir una rutina igualmente</button>
        </div>`
      });
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
    /* Qué músculos se llevan el trabajo de hoy. Es lo que uno tiene en la
       cabeza —«hoy toca pierna»— y lo que hace que la frase diga algo en vez
       de repetir el número de ejercicios que ya está a la derecha. */
    const zonas = [];
    rutina.exercises.forEach(function (re) {
      const ex = Data.get(re.exId);
      ((ex && ex.primaryMuscles) || []).forEach(function (mu) {
        const n = I18N.muscle(mu);
        if (n && zonas.indexOf(n) === -1) zonas.push(n);
      });
    });

    const listaZonas = zonas.length > 3
      ? zonas.slice(0, 3).join(', ') + ' y ' + (zonas.length - 3) + ' más'
      : zonas.length > 1
        ? zonas.slice(0, -1).join(', ') + ' y ' + zonas[zonas.length - 1]
        : zonas[0] || '';

    /* Solo los ejercicios en la cola: con el botón de entrenar al lado no cabe
       «5 ejercicios · 20 series» sin partir el título en dos renglones, y las
       series ya salen dentro. */
    return plegable({
      id: 'entrenar', titulo: 'Lo que voy a entrenar', marca: 'dumbbell',
      tono: 'var(--acc)',
      cola: rutina.exercises.length + ' ejercicios',
      sub: (listaZonas ? 'Hoy le das a ' + listaZonas + '. ' : '') +
        rutina.exercises.length + ' ejercicios y ' + series + ' series.',
      cuerpo: cuerpo,
      extra: '<button class="btn primary sm sec-boton" data-a="entrenar">' +
        icon('play') + ' Entrenar</button>'
    });
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

    /* Lo que se apuntó suelto y encaja con una comida del menú. La foto ya no
       está —se suelta en cuanto la IA la mira— pero para cruzar no hace falta la
       foto: hace falta saber qué comiste y a qué hora, y las dos cosas están
       apuntadas. */
    const sueltos = g.Marcar && Marcar.apuntesSinCruzar ? Marcar.apuntesSinCruzar() : [];
    const aviso = sueltos.length ? html`
      <div class="cruzar-aviso">
        <span class="ca-ico">${raw(icon('cambiar'))}</span>
        <span class="grow"><b>${sueltos.length}
          ${raw(sueltos.length === 1 ? 'apunte de hoy va suelto' : 'apuntes de hoy van sueltos')}</b>
          <span class="tiny">Encajan con una comida de tu menú. Crúzalos y quedará
          marcada, con la diferencia contra lo que tenías previsto.</span></span>
      </div>` : '';

    const lista = comidas.length ? html`
      ${raw(aviso)}
      <div class="list">
        ${raw(comidas.map(function (c) {
          const cruzable = !c.ref && g.Marcar && Marcar.comidaDeLaHora &&
            Marcar.comidaDeLaHora(c.t);
          return '<div class="list-row"><div class="grow">' +
            '<div class="list-row-title">' + esc(c.plato) + '</div>' +
            '<div class="list-row-sub">' + UI.num(c.kcal) + ' kcal · ' + c.prot + ' g' +
            (c.fuente === 'foto' ? ' · de una foto' : '') +
            (c.sustituye ? ' · en vez de ' + esc(c.sustituye) : '') + '</div></div>' +
            (cruzable
              ? '<button class="btn sm vidrio" data-cruzar="' + esc(c.id) + '">' +
                icon('cambiar') + ' Cruzar</button>'
              : '') +
            '<button class="btn sm ghost danger" data-quitar="' + esc(c.id) +
            '" aria-label="Quitar">' + icon('trash') + '</button></div>';
        }).join(''))}
      </div>` : '';

    return plegable({
      id: 'comido', titulo: 'Lo que llevo comido', marca: 'proteina', tono: '#f0a23c',
      progreso: m ? { hecho: h.kcal, total: m.kcal, continuo: true } : null,
      cola: m ? UI.num(h.kcal) + ' / ' + UI.num(m.kcal) + ' kcal' : '',
      sub: !m ? 'Sin tus datos no puedo calcular nada.'
        : !h.cuantas ? 'Todavía no has apuntado nada hoy.'
        : faltanProt
          ? 'Te faltan ' + faltanProt + ' g de proteína y ' + UI.num(faltanKcal) + ' kcal.'
          : 'Proteína del día cubierta.',
      cuerpo: cuerpo + repartoHTML(h, m) + lista
    });
  }

  /* ---------- el reparto del día ----------
     Las dos barras dicen cuánto llevas de calorías y de proteína. Esto dice de
     dónde salen esas calorías, que es otra pregunta: se puede ir bien de kcal y
     estar comiendo solo pan.

     Lo apuntado antes de que se guardaran hidratos y grasa no los lleva. En vez
     de rellenarlos con ceros —que dibujaría una dieta sin hidratos, que es
     mentira— se dice cuántos apuntes se están contando. */
  function repartoHTML(h, m) {
    if (!h || !h.conMacros) return '';

    const total = h.prot * 4 + h.carbo * 4 + h.grasa * 9;
    if (!total) return '';
    const pct = function (gr, cal) { return Math.round(gr * cal / total * 100); };

    const trozo = function (color, gramos, nombre) {
      return '<div class="rep-dato"><span class="rd-punto" style="background:' + color +
        '"></span><b>' + gramos + '<i>g</i></b><span class="tiny">' + esc(nombre) +
        '</span></div>';
    };

    return html`
      <div class="card tarjeta-premium">
        <div class="pre-encima">De dónde salen esas calorías</div>
        <div class="macro-bar nu-bar" style="margin-top:9px">
          <i style="width:${pct(h.prot, 4)}%;background:var(--brand-1)"></i>
          <i style="width:${pct(h.carbo, 4)}%;background:var(--acc)"></i>
          <i style="width:${pct(h.grasa, 9)}%;background:var(--warn)"></i>
        </div>
        <div class="rep-tira">
          ${raw(trozo('var(--brand-1)', h.prot, 'proteína'))}
          ${raw(trozo('var(--acc)', h.carbo, 'hidratos'))}
          ${raw(trozo('var(--warn)', h.grasa, 'grasa'))}
        </div>
        ${raw(h.conMacros < h.cuantas ? '<p class="tiny" style="margin:9px 0 0">' +
          'De ' + h.conMacros + ' de los ' + h.cuantas + ' apuntes de hoy; los demás ' +
          'se anotaron cuando solo se guardaban calorías y proteína.</p>' : '')}
      </div>`;
  }

  /* ---------- cómo voy con el plan ----------
     Un día suelto no dice nada: se puede fallar un martes y llevar una semana
     impecable. Esto son los últimos siete días, y en cada uno las tres cosas
     que el plan pide —entrenar, llegar a la proteína y beber el agua—.

     Sin nota ni porcentaje: tres marcas por día y la semana se lee de un
     vistazo. Un número sobre esto solo serviría para sentirse mal un día malo. */
  function seccionPlan(m) {
    if (!m || !g.Comidas) return '';

    const dias = [];
    const sesiones = Store.sessions();
    const aguaMeta = (Number(Perfil.agua()) || 0) * 1000;

    /* Qué días toca entrenar según el plan que manda. Un domingo de descanso no
       puede contar como día fallado por no haber entrenado: lo que el plan pide
       ese día es precisamente no entrenar. */
    const DIAS_CORTOS = UI.DAY_NAMES || [];
    const tocaEntrenar = {};
    Store.routines().forEach(function (r) {
      if (App.planActivo && App.planActivo() && App.nombreRutina &&
          App.nombreRutina(r) !== App.planActivo()) return;
      (r.days || []).forEach(function (d) { tocaEntrenar[d] = true; });
    });
    const hayPlanDeDias = Object.keys(tocaEntrenar).length > 0;

    for (let i = 6; i >= 0; i--) {
      const t = Date.now() - i * 86400000;
      const clave = Comidas.claveDia(t);
      const lista = Comidas.del(clave);
      const kcal = lista.reduce(function (n, x) { return n + (Number(x.kcal) || 0); }, 0);
      const prot = lista.reduce(function (n, x) { return n + (Number(x.prot) || 0); }, 0);
      const ml = g.Agua ? Agua.del(clave).reduce(function (n, x) {
        return n + (Number(x.ml) || 0);
      }, 0) : 0;

      const nombreDia = DIAS_CORTOS[new Date(t).getDay()];
      /* Si no hay ningún plan con días puestos, se le pide entrenar todos: sin
         plan no hay días de descanso que respetar. */
      const tocaba = !hayPlanDeDias || !!tocaEntrenar[nombreDia];

      const d = {
        t: t,
        letra: UI.inicialDia(new Date(t).getDay()),
        num: new Date(t).getDate(),
        esHoy: i === 0,
        tocaba: tocaba,
        entreno: sesiones.some(function (x) {
          return Comidas.claveDia(x.start) === clave;
        }),
        /* «Llegar» es el 90 %: exigir el 100 % de una estimación es exigir
           suerte, no constancia. */
        proteina: m.prot > 0 && prot >= m.prot * 0.9,
        agua: aguaMeta > 0 && ml >= aguaMeta * 0.9
      };

      /* Un día sale si cumple todo lo que ese día se le pedía. Lo que no se le
         pedía no cuenta ni a favor ni en contra. */
      let pedidas = 0, hechas = 0;
      if (tocaba) { pedidas++; if (d.entreno) hechas++; }
      if (m.prot > 0) { pedidas++; if (d.proteina) hechas++; }
      if (aguaMeta > 0) { pedidas++; if (d.agua) hechas++; }
      d.pedidas = pedidas;
      d.hechas = hechas;
      d.cumplido = pedidas > 0 && hechas === pedidas;

      dias.push(d);
    }

    const hechas = dias.reduce(function (n, d) { return n + d.hechas; }, 0);
    const pedidas = dias.reduce(function (n, d) { return n + d.pedidas; }, 0);
    const salieron = dias.filter(function (d) { return d.cumplido; }).length;

    const cuerpo = html`
      <div class="card tarjeta-premium">
        <div class="plan-sem">
          ${raw(dias.map(function (d) {
            const punto = function (ok, clase, titulo) {
              return '<span class="ps-punto ' + clase + (ok ? ' si' : '') + '" ' +
                'title="' + esc(titulo) + '"></span>';
            };
            /* Hoy se queda neutro hasta que salga: el día no ha terminado, y
               pintarlo en rojo a las once de la mañana por no haber cenado
               todavía es regañar por algo que aún no ha pasado. */
            const tono = d.cumplido ? ' cumplido' : d.esHoy ? '' : ' fallado';
            return '<div class="ps-dia' + (d.esHoy ? ' es-hoy' : '') + tono + '">' +
              '<span class="ps-letra">' + d.letra + '</span>' +
              '<span class="ps-num">' + d.num + '</span>' +
              '<span class="ps-marcas">' +
              punto(d.entreno, 'entreno', d.tocaba ? 'Entrenaste' : 'Día de descanso') +
              punto(d.proteina, 'prote', 'Llegaste a la proteína') +
              punto(d.agua, 'agua', 'Bebiste el agua') +
              '</span></div>';
          }).join(''))}
        </div>
        <div class="plan-leyenda">
          <span><i class="ps-punto entreno si"></i> Entreno</span>
          <span><i class="ps-punto prote si"></i> Proteína</span>
          <span><i class="ps-punto agua si"></i> Agua</span>
        </div>
        ${raw(dias.some(function (d) { return !d.tocaba; })
          ? '<p class="tiny" style="margin:9px 0 0;text-align:center">Los días de ' +
            'descanso no piden entreno: ahí solo cuentan la proteína y el agua.</p>' : '')}
      </div>`;

    return plegable({
      id: 'plan', titulo: 'Cómo voy con el plan', marca: 'grafica', tono: '#c06bf0',
      progreso: { hecho: salieron, total: 7 },
      cola: salieron + ' de 7 días',
      sub: 'Los últimos siete días: si entrenaste, si llegaste a la proteína y si ' +
        'bebiste el agua. Llevas ' + hechas + ' de ' + pedidas + '.',
      cuerpo: cuerpo
    });
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
