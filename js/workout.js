/* workout.js — sesión de entrenamiento en curso.
   Registra series, pesos y repeticiones, cronometra el descanso entre series y
   guarda todo al terminar. La sesión activa se persiste en cada cambio, así que
   si se cierra el navegador a mitad de entrenamiento no se pierde nada. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon;

  let restTimer = null;      // intervalo del descanso
  let restEnd = 0;           // marca de tiempo en que termina el descanso
  let clockTimer = null;     // intervalo del cronómetro total

  /* ---------- ciclo de vida ---------- */

  function construir(routine) {
    return routine.exercises.map(function (re) {
      const ex = Data.get(re.exId);
      const last = Store.lastPerformance(re.exId);

      /* El peso de hoy lo decide la progresión con lo que ya está apuntado. Si
         no tiene con qué decidir —primer día con ese ejercicio, o uno que no
         lleva peso— se queda lo de siempre: el de la última vez. */
      const prog = g.Progresion ? Progresion.sugerir(re.exId, re.sets, re.reps) : null;
      const prevWeight = prog ? prog.peso
        : (last && last.sets.length ? Number(last.sets[0].weight) || 0 : Number(re.weight) || 0);

      return {
        exId: re.exId,
        name: ex ? ex.nameEs : re.exId,
        targetReps: re.reps,
        rest: re.rest || Store.settings().rest,
        note: re.note || '',
        /* Se guarda el porqué con la sesión en marcha: si la pantalla se
           repinta a mitad del entreno, la explicación sigue ahí sin volver a
           recorrer el historial. */
        prog: prog ? { estado: prog.estado, peso: prog.peso, anterior: prog.anterior,
          salto: prog.salto, porque: prog.porque } : null,
        sets: Array.from({ length: Math.max(1, re.sets) }, function () {
          return { weight: prevWeight, reps: re.reps, done: false };
        })
      };
    });
  }

  function start(routine) {
    Store.setActive({
      routineId: routine.id,
      routineName: routine.name,
      start: Date.now(),
      idx: 0,
      entries: construir(routine)
    });
    pintarBanner();
  }

  /* Mete una rutina en el entrenamiento que ya está corriendo, sin tocar el
     cronómetro: quien empezó libre no pierde el tiempo acumulado. */
  function cargar(routine) {
    const a = Store.active();
    if (!a) { start(routine); return; }
    const nuevas = construir(routine);
    if (!nuevas.length) return;
    a.idx = a.entries.length;
    a.entries = a.entries.concat(nuevas);
    if (a.libre && a.idx === 0) { a.routineName = routine.name; a.routineId = routine.id; }
    Store.setActive(a);
  }

  /* Entrenamiento libre: solo el cronómetro. Los ejercicios se van añadiendo
     sobre la marcha, o ninguno, y lo que se guarda es el tiempo entrenado. */
  function startLibre() {
    Store.setActive({
      routineId: null,
      routineName: 'Entrenamiento libre',
      libre: true,
      start: Date.now(),
      idx: 0,
      entries: []
    });
    pintarBanner();
  }

  /* Añade un ejercicio a la sesión en curso y salta a él */
  function añadirEjercicio(ex) {
    const a = Store.active();
    if (!a || !ex) return;
    const ajustes = Store.settings();
    const last = Store.lastPerformance(ex.id);
    const peso = last && last.sets.length ? Number(last.sets[0].weight) || 0 : 0;
    const reps = 12;

    a.entries.push({
      exId: ex.id,
      name: ex.nameEs,
      targetReps: reps,
      rest: ajustes.rest || 90,
      note: '',
      sets: Array.from({ length: 3 }, function () {
        return { weight: peso, reps: reps, done: false };
      })
    });
    a.idx = a.entries.length - 1;
    Store.setActive(a);
  }

  function isActive() { return !!Store.active(); }

  /* ---------- cronómetro visible en toda la app ----------
     Mientras hay entrenamiento en curso, un banner acompaña al usuario por
     cualquier pantalla con el tiempo corriendo y el botón de terminar. En la
     propia pantalla de entrenamiento sobra: allí ya está el cronómetro. */

  let bannerTimer = null;

  function pintarBanner() {
    const host = document.getElementById('crono-host');
    if (!host) return;

    const a = Store.active();
    const enEntrenar = location.hash.indexOf('entrenar') !== -1;

    if (!a || enEntrenar) {
      if (host.innerHTML) host.innerHTML = '';
      document.body.classList.remove('con-crono');
      clearInterval(bannerTimer); bannerTimer = null;
      return;
    }
    /* el banner tapa el final de la página: se le hace hueco */
    document.body.classList.add('con-crono');

    /* se dibuja una vez; después solo cambia el número, para no reiniciar
       la animación de entrada en cada segundo */
    let salida = host.querySelector('[data-crono-out]');
    if (!salida) {
      host.innerHTML = html`
        <div class="crono">
          <button class="crono-ir" data-c="ir">
            <span class="crono-pulso"></span>
            <span class="crono-txt">
              <span>${T('ENTRENANDO')}</span>
              <b data-crono-nombre>${a.routineName}</b>
            </span>
          </button>
          <b class="crono-t" data-crono-out>0:00</b>
          <button class="crono-fin" data-c="fin">${T('Finalizar')}</button>
        </div>`;
      host.querySelector('[data-c=ir]').onclick = function () { g.App.go('entrenar'); };
      host.querySelector('[data-c=fin]').onclick = doFinish;
      salida = host.querySelector('[data-crono-out]');
    }

    /* El banner se dibuja una sola vez para no reiniciar su animación, pero eso
       dejaba el nombre congelado: cambiabas la rutina de día mientras la
       entrenabas y el banner seguía anunciando el día de antes. El texto se
       repasa en cada pintado; cuesta una comparación de cadenas. */
    const nombre = host.querySelector('[data-crono-nombre]');
    if (nombre && nombre.textContent !== a.routineName) nombre.textContent = a.routineName;

    salida.textContent = UI.mmss((Date.now() - a.start) / 1000);
    if (!bannerTimer) bannerTimer = setInterval(pintarBanner, 1000);
  }

  function stopTimers() {
    clearInterval(restTimer); restTimer = null;
    clearInterval(clockTimer); clockTimer = null;
    restEnd = 0;
    const host = document.getElementById('rest-host');
    if (host) host.innerHTML = '';
  }

  function discard() {
    stopTimers();
    Store.clearActive();
    pintarBanner();
  }

  function finish() {
    const a = Store.active();
    if (!a) return null;
    const done = a.entries.reduce(function (n, e) {
      return n + e.sets.filter(function (s) { return s.done; }).length;
    }, 0);

    const session = {
      routineId: a.routineId,
      routineName: a.routineName,
      start: a.start,
      end: Date.now(),
      entries: a.entries.map(function (e) {
        return {
          exId: e.exId, name: e.name,
          sets: e.sets.map(function (s) {
            return { weight: Number(s.weight) || 0, reps: Number(s.reps) || 0, done: !!s.done };
          })
        };
      }),
      setsDone: done
    };
    session.volume = Store.volumeOf(session);

    /* Una actividad no deja series ni volumen, pero sí calorías y músculos:
       sin esto el partido no contaba para nada y «lo que llevas abandonado»
       seguía diciendo que hace un mes que no tocas la pierna. */
    if (a.actividad) {
      session.actividad = 'otro';
      session.minutos = Math.max(1, Math.round((session.end - session.start) / 60000));
      session.kcal = kcalActividad(a, session.end);
      session.musculos = a.actividad.musculos || [];
      session.nota = a.actividad.nota || '';
      session.origen = a.actividad.origen || '';
    }

    stopTimers();
    Store.clearActive();
    pintarBanner();
    return Store.addSession(session);
  }

  /* ---------- descanso ---------- */

  function startRest(seconds) {
    restEnd = Date.now() + seconds * 1000;
    clearInterval(restTimer);
    restTimer = setInterval(paintRest, 250);
    paintRest();
  }

  function addRest(seconds) {
    if (!restEnd) return;
    restEnd += seconds * 1000;
    paintRest();
  }

  function skipRest() {
    restEnd = 0;
    clearInterval(restTimer); restTimer = null;
    paintRest();
  }

  /* ---------- el botón de descansar, mientras corre ----------
     Se pulsaba y no cambiaba nada: el aviso salía abajo del todo, pegado a la
     barra de pestañas, y desde el botón no había manera de saber si lo habías
     dado o si no te había cogido el toque. Ahora el propio botón dice que está
     corriendo y enseña lo que queda, que es donde estás mirando cuando lo
     pulsas. El aviso de abajo se queda: es el que se ve desde cualquier
     pantalla de la app. */
  function pintarBotonDescanso(left) {
    const b = document.querySelector('.wo-descanso');
    if (!b) return;
    const lado = b.querySelector('.wa-lado');
    const txt = b.querySelector('.wa-t');
    if (!lado || !txt) return;

    if (left == null) {
      b.classList.remove('corriendo');
      txt.textContent = 'Descansar';
      lado.innerHTML = UI.esc(lado.dataset.seg || '') + '<i>s</i>';
      return;
    }
    b.classList.add('corriendo');
    txt.textContent = 'Descansando';
    lado.textContent = UI.mmss(left);
  }

  /* Se dibuja una sola vez y después solo cambia el número: si se reescribiera
     el HTML en cada tic, la animación de entrada se reiniciaría sin parar. */
  function paintRest() {
    const host = document.getElementById('rest-host');
    if (!host) return;

    if (!restEnd) { host.innerHTML = ''; pintarBotonDescanso(null); return; }

    const left = (restEnd - Date.now()) / 1000;
    if (left <= 0) {
      UI.beep(2);
      restEnd = 0;
      clearInterval(restTimer); restTimer = null;
      host.innerHTML = '';
      pintarBotonDescanso(null);
      UI.toast('Descanso terminado. ¡A por la siguiente serie!');
      return;
    }

    pintarBotonDescanso(left);

    let out = host.querySelector('[data-rest-out]');
    if (!out) {
      host.innerHTML = html`
        <div class="rest"><div class="rest-in">
          ${raw(icon('timer'))}
          <div class="grow">
            <div style="font-size:.7rem;font-weight:700;opacity:.75">DESCANSO</div>
            <b data-rest-out>${UI.mmss(left)}</b>
          </div>
          <button data-r="+30">+30s</button>
          <button data-r="skip">Saltar</button>
        </div></div>`;
      host.querySelector('[data-r="+30"]').onclick = function () { addRest(30); };
      host.querySelector('[data-r=skip]').onclick = skipRest;
      return;
    }
    out.textContent = UI.mmss(left);
  }

  /* ---------- vista ---------- */

  /* Entrenamiento en marcha al que todavía no se le ha puesto ningún ejercicio */
  function vistaVacia(a) {
    return html`
      <div class="wo-head">
        <div class="row between" style="margin-bottom:8px">
          <div class="grow" style="min-width:0">
            <div class="tiny">${T('ENTRENANDO')}</div>
            <h2 style="margin:0;font-size:1.05rem">${a.routineName}</h2>
          </div>
          <div class="center nowrap">
            <b id="wo-clock" style="font-variant-numeric:tabular-nums">0:00</b>
            <div class="tiny">${T('en marcha')}</div>
          </div>
        </div>
      </div>

      <div id="wo-musica"></div>

      ${raw(a.actividad ? tarjetaActividad(a) : html`
      <div class="card center">
        <p class="muted" style="margin-bottom:12px">El cronómetro ya está corriendo. Puedes
        entrenar así, solo con el tiempo, contarme qué estás haciendo, o ir añadiendo
        los ejercicios para registrar series y pesos.</p>
        <button class="btn primary block" data-w="actividad">
          ${raw(icon('chispa'))} Cuéntame qué estoy haciendo</button>
        <button class="btn block" data-w="anadir" style="margin-top:8px">
          ${raw(icon('plus'))} ${T('Añadir ejercicio')}</button>
        <button class="btn block" data-w="rutina" style="margin-top:8px">Cargar una rutina</button>
      </div>`)}

      <button class="btn danger block" data-w="finish" style="margin-top:16px">
        ${raw(icon('flag'))} Terminar y guardar el tiempo
      </button>
      <button class="btn ghost block" data-w="cancel" style="margin-top:8px">Descartar entrenamiento</button>`;
  }

  /* Lo que se está haciendo cuando no son series: un partido, una subida, la
     ciclovía. Las calorías se pintan con el reloj en marcha —salen del MET, del
     peso y del tiempo que lleve— así que suben solas mientras dura. */
  function pesoDelPerfil() {
    const datos = g.Perfil ? Perfil.datos() : null;
    return Number(datos && datos.peso) || 75;
  }

  function kcalDe(act, minutos) {
    if (!act || !act.met) return 0;
    return Math.round(act.met * pesoDelPerfil() * Math.max(0, minutos) / 60);
  }

  function kcalActividad(a, hasta) {
    if (!a || !a.actividad) return 0;
    return kcalDe(a.actividad, ((hasta || Date.now()) - a.start) / 60000);
  }

  /* Lo que ya se hizo: no hay cronómetro que valga, se apunta con los minutos
     que diga y se cierra. La sesión se coloca terminando ahora y empezando los
     minutos antes, que es como se cuenta cualquier otra. */
  function apuntarHecha(act, minutos) {
    const fin = Date.now();
    const sesion = {
      routineId: null,
      routineName: act.nombre,
      start: fin - minutos * 60000,
      end: fin,
      entries: [],
      setsDone: 0,
      volume: 0,
      actividad: 'otro',
      minutos: minutos,
      kcal: kcalDe(act, minutos),
      musculos: act.musculos || [],
      nota: act.nota || '',
      origen: act.origen || ''
    };

    if (Store.active()) {
      stopTimers();
      Store.clearActive();
      pintarBanner();
    }
    return Store.addSession(sesion);
  }

  function tarjetaActividad(a) {
    const act = a.actividad;
    const musculos = (act.musculos || []).map(function (m) {
      return g.I18N ? I18N.muscle(m) : m;
    });

    return html`
      <div class="card">
        <div class="row between" style="align-items:flex-start">
          <div class="grow" style="min-width:0">
            <div class="tiny">ESTÁS HACIENDO</div>
            <div style="font-weight:700;font-size:1.05rem">${act.nombre}</div>
          </div>
          <div class="center nowrap">
            <b id="wo-kcal" style="font-size:1.15rem">~${UI.num(kcalActividad(a))}</b>
            <div class="tiny">kcal</div>
          </div>
        </div>

        ${raw(musculos.length ? '<div class="row wrap" style="gap:6px;margin-top:10px">' +
          musculos.map(function (m) { return '<span class="chip">' + UI.esc(m) + '</span>'; }).join('') +
          '</div>' : '')}

        ${raw(act.nota ? '<p class="tiny" style="margin:10px 0 0">' + UI.esc(act.nota) + '</p>' : '')}

        ${raw(act.origen === 'ia'
          ? '<p class="tiny" style="margin:8px 0 0;opacity:.75">Analizado por tu entrenador: ' +
            UI.esc(String(act.met).replace('.', ',')) + ' MET' +
            (act.intensidad ? ' · intensidad ' + UI.esc(act.intensidad) : '') +
            ' · ' + pesoDelPerfil() + ' kg' +
            (act.tardo ? ' · ' + (act.tardo / 1000).toFixed(1).replace('.', ',') + ' s' : '') +
            '</p>'
          : '<p class="tiny" style="margin:8px 0 0;color:var(--warn)">Sin analizar: gasto medio ' +
            'de 4 MET. Conecta la IA en Ajustes para que lo calcule de verdad.</p>')}

        <div class="row" style="margin-top:12px">
          <button class="btn sm grow" data-w="actividad">Cambiarlo</button>
          <button class="btn sm grow" data-w="anadir">${raw(icon('plus'))} ${T('Añadir ejercicio')}</button>
        </div>
      </div>`;
  }

  /* Los recambios y la guía de técnica, plegados. Estaban sólo en la ficha del
     ejercicio, y en mitad de una serie no se va uno a otra pantalla a buscar
     con qué sustituir la máquina ocupada. Van cerrados porque las dos son
     largas y aquí lo que manda es el peso y las repeticiones. */
  /* Cambiar de ejercicio y ver cómo se hace estaban dos veces en la misma
     pantalla: dos iconos mudos en la esquina de la tarjeta y, tres centímetros
     más abajo, los dos mismos botones con su texto. Se quedan los de abajo,
     que dicen lo que hacen.

     Y aquí ya no se puede devolver cadena vacía. Cuando el ejercicio no tenía
     recambios ni guía, esta fila no se pintaba, y con los iconos fuera uno se
     quedaba sin manera de cambiarlo: los botones están siempre, y el que no
     tiene nada que desplegar abre la hoja que corresponda. */
  function ayudaHTML(ex) {
    const hayAlt = !!(g.App && g.App.alternativasHTML && g.App.alternativasHTML(ex));
    const guia = g.Tecnica ? Tecnica.para(ex) : null;

    function plegable(clave, titulo, icono) {
      const abierto = ayudaAbierta === clave;
      return html`
        <button class="btn sm grow plegar ${abierto ? 'abierta' : ''}"
                data-ayuda="${clave}" aria-expanded="${abierto}">
          ${raw(icono)} ${titulo}</button>`;
    }

    function hoja(accion, titulo, icono) {
      return html`
        <button class="btn sm grow" data-w="${accion}">${raw(icono)} ${titulo}</button>`;
    }

    /* Los dos en la misma línea: uno debajo del otro se comían el sitio de lo
       que de verdad se mira aquí, el peso y las repeticiones. */
    return '<div class="row ayuda-fila">'
      + (hayAlt ? plegable('alt', T('Otra opción'), icon('cambiar'))
                : hoja('cambiar', T('Otra opción'), icon('cambiar')))
      + (guia ? plegable('guia', T('Cómo se hace'), icon('search'))
              : hoja('info', T('Cómo se hace'), icon('search')))
      + '</div>'
      + (hayAlt ? '<div data-ayuda-caja="alt"' + (ayudaAbierta === 'alt' ? '' : ' hidden') + '></div>' : '')
      + (guia ? '<div data-ayuda-caja="guia"' + (ayudaAbierta === 'guia' ? '' : ' hidden') + '></div>' : '');
  }

  /* «Hace tres días» se lee; «14 sep» hay que restarlo de cabeza. */
  function haceQue(ts) {
    const dias = Math.floor((Date.now() - ts) / 864e5);
    if (dias <= 0) return 'hoy';
    if (dias === 1) return 'ayer';
    if (dias < 7) return 'hace ' + dias + ' días';
    if (dias < 14) return 'hace una semana';
    if (dias < 60) return 'hace ' + Math.round(dias / 7) + ' semanas';
    return 'hace ' + Math.round(dias / 30) + ' meses';
  }

  /* ---------- lo que se enseña del historial ----------
     Con «marcar el ejercicio y ya» no se apunta ningún peso, y la tarjeta
     seguía enseñando «Récord: 0 kg × 7» y «Última vez: 0×7 · 0×7». Números de
     una pregunta que ese modo no hace: un récord de cero kilos no es un
     récord, es la prueba de que ahí no hay nada que medir.

     En ese modo la historia que sí existe es otra —cuántas veces lo has hecho
     y cuándo fue la última— y es la que se cuenta. En los demás modos el peso
     también es opcional, así que tampoco se enseña si no lo hay: entonces se
     enseñan las repeticiones, que es lo único que de verdad se apuntó. */
  function historialHTML(exId, pr, last, soloEjercicio) {
    if (soloEjercicio) {
      const hist = Store.historyOf(exId);
      if (!hist.length) return '';
      return '<div class="row wrap" style="margin-top:10px;gap:6px">' +
        '<span class="chip solid">' + (hist.length === 1
          ? 'Lo has hecho una vez' : 'Lo has hecho ' + hist.length + ' veces') + '</span>' +
        '<span class="chip">' + UI.esc(Tn('Última vez, {c}',
          { c: haceQue(hist[0].date) })) + '</span></div>';
    }

    const record = pr.best && Number(pr.best.weight) > 0
      ? '<span class="chip solid">' + UI.esc(T('Récord')) + ': ' + UI.kg(pr.best.weight) + ' × ' +
        pr.best.reps + '</span>' : '';

    let ultima = '';
    if (last && last.sets.length) {
      const conPeso = last.sets.some(function (x) { return Number(x.weight) > 0; });
      ultima = '<span class="chip">' + UI.esc(T('Última vez')) + ': ' + (conPeso
        ? last.sets.map(function (x) { return UI.num(x.weight) + '×' + x.reps; }).join(' · ')
        : last.sets.map(function (x) { return x.reps; }).join(' · ') + ' reps') + '</span>';
    }

    if (!record && !ultima) return '';
    return '<div class="row wrap" style="margin-top:10px;gap:6px">' + record + ultima + '</div>';
  }

  /* Cuál de las dos está abierta, para que sobreviva a los re-render que hace
     cada serie marcada. Sólo una a la vez: las dos juntas son media pantalla. */
  let ayudaAbierta = '';

  function view() {
    const a = Store.active();
    if (!a) return '<div class="empty">' +
      UI.esc(T('No hay ningún entrenamiento en curso.')) + '</div>';

    /* Un entrenamiento libre empieza sin ejercicios: solo corre el reloj */
    if (!a.entries.length) return vistaVacia(a);

    const entry = a.entries[a.idx];
    const ex = Data.get(entry.exId);
    const totalSets = a.entries.reduce(function (n, e) { return n + e.sets.length; }, 0);
    const doneSets = a.entries.reduce(function (n, e) {
      return n + e.sets.filter(function (s) { return s.done; }).length;
    }, 0);
    const pct = totalSets ? Math.round(doneSets / totalSets * 100) : 0;
    const pr = Store.prOf(entry.exId);
    const last = Store.lastPerformance(entry.exId);
    const modo = Store.settings().registro || 'detallado';
    const simple = modo === 'simple';
    const soloEjercicio = modo === 'ejercicio';
    const hecho = entry.sets.every(function (x) { return x.done; });
    /* Si queda algo por marcar, terminar todavia no es lo que toca */
    const todoHecho = a.entries.every(function (e) {
      return e.sets.every(function (x) { return x.done; });
    });

    return html`
      <div class="wo-head">
        <div class="row between" style="margin-bottom:8px">
          <div class="grow" style="min-width:0">
            <div class="tiny">${T('ENTRENANDO')}</div>
            <h2 style="margin:0;font-size:1.05rem">${a.routineName}</h2>
          </div>
          <div class="center nowrap">
            <b id="wo-clock" style="font-variant-numeric:tabular-nums">0:00</b>
            <div class="tiny"><span id="wo-count">${doneSets}</span>/${totalSets} ${T('series')}</div>
          </div>
        </div>
        <div class="prog"><i style="width:${pct}%"></i></div>
      </div>

      <div id="wo-musica"></div>

      <div class="card" style="padding:0;overflow:hidden">
        ${raw(ex ? UI.demoHTML(ex, { speed: 800 }) : '')}
        <div style="padding:13px">
          <div class="row between">
            ${raw(ex && g.Musculos && Musculos.siluetas
              ? Musculos.siluetas(ex.primaryMuscles, ex.secondaryMuscles) : '')}
            <div class="grow">
              <!-- El nombre sale del catálogo y no del que se guardó en la
                   sesión: ese se escribió al empezar el entrenamiento y se
                   queda congelado en el idioma de ese momento. El de la sesión
                   solo se usa si el ejercicio ya no está en el catálogo.

                   Y debajo iba el nombre original en inglés, que con la app en
                   inglés es el mismo dos veces. -->
              <h2 style="margin:0 0 2px">${(ex && ex.nameEs) || entry.name}</h2>
              <div class="tiny">${raw(ex && ex.name !== ((ex && ex.nameEs) || entry.name)
                ? UI.esc(ex.name) : '')}</div>
              ${raw(ex && ex.primaryMuscles.length ? html`
                <div class="musculos">
                  <b>${raw(ex.primaryMuscles.map(function (m) {
                    return UI.esc(I18N.muscle(m));
                  }).join(', '))}</b>${raw((ex.secondaryMuscles || []).length
                    ? ' · ' + UI.esc(ex.secondaryMuscles.map(I18N.muscle).join(', ')) : '')}
                </div>` : '')}
            </div>
          </div>
          ${raw(entry.note ? html`<p class="muted" style="margin:8px 0 0">${entry.note}</p>` : '')}
          ${raw(historialHTML(entry.exId, pr, last, soloEjercicio))}

          <!-- Qué peso poner hoy y por qué. Iba en la casilla y en silencio:
               el número aparecía puesto y nadie sabía de dónde salía ni si
               había cambiado respecto a la última vez. -->
          ${raw(entry.prog && !simple && !soloEjercicio ? html`
            <div class="prog-hoy ${entry.prog.estado}">
              <span class="ph-ico">${raw(icon(entry.prog.estado === 'sube' ? 'up'
                : entry.prog.estado === 'baja' ? 'down' : 'reloj'))}</span>
              <span class="grow">
                <span class="ph-tit">${raw(entry.prog.estado === 'sube'
                  ? 'Hoy subes a ' + UI.kg(entry.prog.peso)
                  : entry.prog.estado === 'baja'
                    ? 'Hoy bajas a ' + UI.kg(entry.prog.peso)
                    : 'Hoy repites ' + UI.kg(entry.prog.peso))}</span>
                <span class="ph-sub">${entry.prog.porque}</span>
              </span>
            </div>` : '')}
        </div>
      </div>

      ${raw(ex ? ayudaHTML(ex) : '')}

      ${raw(soloEjercicio ? html`
        <div class="card wo-solo ${hecho ? 'listo' : ''}">
          <div class="objetivo">
            <b>${entry.sets.length} × ${entry.targetReps}</b>
            <span>${T('lo que te propongo')}</span>
          </div>

          <!-- Las dos, la misma pieza: casilla o icono a la izquierda, lo que
               hace en el centro, y el dato a la derecha. El subtitulo que
               llevaba esta —«3 series de 10 repeticiones»— repetia el «3 × 10»
               que esta dos centimetros mas arriba, y de paso la hacia mas alta
               que la de descansar. Fuera el subtitulo: se igualan solas. -->
          <button class="wo-accion wo-hecho ${hecho ? 'on' : ''}" data-w="hechoya">
            <span class="wa-ico">${raw(icon('check'))}</span>
            <span class="wa-t">${hecho ? T('Hecho') : T('Marcar como hecho')}</span>
            ${raw(hecho ? '<span class="wa-lado deshacer">' + UI.esc(T('deshacer')) +
              '</span>' : '')}
          </button>

          ${raw(entry.rest ? html`
            <button class="wo-accion wo-descanso" data-w="rest">
              <span class="wa-ico">${raw(icon('timer'))}</span>
              <span class="wa-t">${T('Descansar')}</span>
              <span class="wa-lado seg" data-seg="${entry.rest}">${entry.rest}<i>s</i></span>
            </button>` : '')}
        </div>` : html`
      <div class="card">
        ${raw(simple ? html`
          <div class="objetivo">
            <b>${entry.sets.length} × ${entry.targetReps}</b>
            <span>${T('series por repeticiones')}${raw(entry.rest
              ? ' · ' + UI.esc(Tn('descanso {n} s', { n: entry.rest })) : '')}</span>
          </div>` : html`
          <div class="objetivo">
            <b>${entry.sets.length} × ${entry.targetReps}</b>
            <span>${T('lo que te propongo')}${raw(entry.rest
              ? ' · ' + UI.esc(Tn('descanso {n} s', { n: entry.rest })) : '')}</span>
          </div>`)}

        <div class="stack" id="wo-sets">
          ${raw(entry.sets.map(function (s, i) {
            if (simple) {
              /* Las repeticiones, con su mas y su menos. Antes la fila decia
                 «7 reps» y era mentira a partir de la tercera serie: el
                 objetivo es lo que pide la rutina, no lo que sacaste. Si
                 cambias el numero se marca, para que se vea de un vistazo en
                 que series te quedaste corto.

                 Y ya no es un <button> con cosas dentro: un boton dentro de
                 otro boton no es HTML valido y el navegador lo desarma. La
                 fila es una caja, y marcar es su propio boton. */
              const cambiado = Number(s.reps) !== Number(entry.targetReps);
              return html`
                <div class="serie-fila ${s.done ? 'on' : ''}" data-set="${i}">
                  <span class="sf-n">${i + 1}</span>
                  <span class="sf-lbl">Serie ${i + 1}</span>
                  <span class="sf-reps">
                    <button class="sf-pm" data-f="menos"
                            aria-label="Una repetición menos en la serie ${i + 1}">
                      ${raw(icon('menos'))}</button>
                    <span class="sf-num ${cambiado ? 'cambiado' : ''}">
                      <b>${s.reps}</b><i>${T('reps')}</i></span>
                    <button class="sf-pm" data-f="mas"
                            aria-label="Una repetición más en la serie ${i + 1}">
                      ${raw(icon('plus'))}</button>
                  </span>
                  <button class="sf-chk" data-f="done"
                          aria-label="Marcar serie ${i + 1} como hecha">
                    ${raw(icon('check'))}</button>
                </div>`;
            }
            /* La misma pieza que en «marcar cada serie», con dos campos en
               vez de un contador. Era una rejilla de tres columnas con «# KG
               REPS» de cabecera: se leia como una hoja de calculo y no como la
               app. La unidad va dentro de cada campo, asi que la cabecera
               sobra y la tarjeta encoge cuatro filas de golpe. */
            return html`
              <div class="serie-fila detalle ${s.done ? 'on' : ''}" data-set="${i}">
                <span class="sf-n">${i + 1}</span>
                <label class="sf-campo">
                  <input type="number" inputmode="decimal" step="0.5" min="0"
                         value="${s.weight}" data-f="weight"
                         aria-label="${Tn('Peso de la serie {n}', { n: i + 1 })}">
                  <span>${raw(Store.settings().unit === 'lb' ? 'lb' : 'kg')}</span>
                </label>
                <label class="sf-campo">
                  <input type="number" inputmode="numeric" step="1" min="0"
                         value="${s.reps}" data-f="reps"
                         aria-label="${Tn('Repeticiones de la serie {n}', { n: i + 1 })}">
                  <span>${T('reps')}</span>
                </label>
                <button class="sf-chk" data-f="done"
                        aria-label="Marcar serie ${i + 1} como hecha">
                  ${raw(icon('check'))}</button>
              </div>`;
          }).join(''))}
        </div>

        ${raw(simple ? html`
          <div class="row" style="margin-top:12px;align-items:center">
            <span class="tiny grow">Peso usado (opcional)</span>
            <input type="number" inputmode="decimal" step="0.5" min="0" id="peso-opcional"
                   value="${entry.sets[0] && entry.sets[0].weight ? entry.sets[0].weight : ''}"
                   placeholder="—" style="max-width:96px;text-align:center">
            <span class="tiny">${Store.settings().unit}</span>
          </div>` : '')}
        <div class="row" style="margin-top:11px">
          <button class="btn sm grow" data-w="addset">${raw(icon('plus'))} ${T('Añadir serie')}</button>
          ${raw(entry.sets.length > 1
            ? html`<button class="btn sm" data-w="delset">${raw(icon('trash'))}</button>` : '')}
          <button class="btn sm" data-w="rest">${raw(icon('timer'))} ${entry.rest}s</button>
        </div>
      </div>`)}

      <!-- Esto es navegación, no la acción del día. En verde y del mismo
           tamaño que «marcar como hecho», los dos botones se disputaban la
           mirada y no ganaba ninguno. Ir al siguiente es firme pero neutro; el
           verde se guarda para terminar, que sí cierra la sesión. -->
      <div class="wo-nav">
        <button class="wo-nav-b atras" data-w="prev" ${a.idx === 0 ? 'disabled' : ''}
                aria-label="${T('Ejercicio anterior')}">
          ${raw(icon('back'))}<span>${T('Anterior')}</span></button>
        <button class="wo-nav-b sig ${a.idx === a.entries.length - 1
          ? (todoHecho ? 'fin listo' : 'fin') : ''}" data-w="next">
          <span>${a.idx === a.entries.length - 1 ? T('Terminar') : T('Siguiente')}</span>
          ${raw(icon(a.idx === a.entries.length - 1 ? 'check' : 'chevron'))}</button>
      </div>

      <button class="btn ghost block" data-w="anadir" style="margin-top:10px">
        ${raw(icon('plus'))} ${T('Añadir otro ejercicio a esta sesión')}
      </button>

      <div class="list-title">${T('Ejercicios de hoy')}</div>
      <div class="stack">
        ${raw(a.entries.map(function (e, i) {
          const exx = Data.get(e.exId);
          const d = e.sets.filter(function (s) { return s.done; }).length;
          return html`
            <button class="rt-item ${i === a.idx ? 'set-current' : ''}" data-goto="${i}"
                    style="${i === a.idx ? 'border-color:var(--acc)' : ''};width:100%;text-align:left">
              <img src="${exx ? Data.img(exx, 0) : Data.PLACEHOLDER}" alt="" loading="lazy">
              <div class="grow">
                <div style="font-weight:600;font-size:.86rem">${(exx && exx.nameEs) || e.name}</div>
                <div class="tiny">${Tn('{d}/{t} series · objetivo {r} reps',
                  { d: d, t: e.sets.length, r: e.targetReps })}</div>
              </div>
              ${raw(d === e.sets.length ? '<span class="chip solid">Hecho</span>' : '')}
            </button>`;
        }).join(''))}
      </div>

      <button class="btn danger block" data-w="finish" style="margin-top:16px">
        ${raw(icon('flag'))} Terminar y guardar entrenamiento
      </button>
      <button class="btn ghost block" data-w="cancel" style="margin-top:8px">Descartar entrenamiento</button>`;
  }

  /* ---------- interacción ---------- */

  function mount(root, rerender) {
    const a = Store.active();
    if (!a) return;
    const entry = a.entries[a.idx];

    UI.mountDemos(root);
    pintarMusica(root);

    /* cronómetro total */
    const clock = root.querySelector('#wo-clock');
    const campoKcal = root.querySelector('#wo-kcal');
    function paintClock() {
      const viva = Store.active();
      if (!viva) return;
      if (clock) clock.textContent = UI.mmss((Date.now() - viva.start) / 1000);
      if (campoKcal) campoKcal.textContent = '~' + UI.num(kcalActividad(viva));
    }
    paintClock();
    clearInterval(clockTimer);
    clockTimer = setInterval(paintClock, 1000);

    /* el descanso sobrevive a los re-render */
    paintRest();

    /* La ayuda se rellena al abrirla y no antes: son dos bloques largos, con
       imágenes, y en la mayoría de las series no se abren. */
    const exActual = entry ? Data.get(entry.exId) : null;

    function llenarAyuda(clave) {
      const caja = root.querySelector('[data-ayuda-caja="' + clave + '"]');
      if (!caja || caja.dataset.puesta || !exActual || !g.App) return;
      caja.innerHTML = clave === 'alt'
        ? g.App.alternativasHTML(exActual)
        : g.App.guiaHTML(Tecnica.para(exActual));
      caja.dataset.puesta = '1';
      /* los recambios llevan a su ficha, igual que en la pantalla del
         ejercicio: si no, son fotos que no hacen nada */
      caja.querySelectorAll('[data-ex]').forEach(function (t) {
        t.onclick = function () { g.App.go('ejercicio', t.dataset.ex); };
      });
    }

    /* si venía abierta de antes del repintado, se rellena sola: si no, quedaba
       el bloque abierto y vacío al cambiar de ejercicio */
    if (ayudaAbierta) llenarAyuda(ayudaAbierta);

    root.querySelectorAll('[data-ayuda]').forEach(function (b) {
      b.onclick = function () {
        const clave = b.dataset.ayuda;
        ayudaAbierta = ayudaAbierta === clave ? '' : clave;

        root.querySelectorAll('[data-ayuda]').forEach(function (x) {
          const suyo = x.dataset.ayuda;
          const abierta = suyo === ayudaAbierta;
          const caja = root.querySelector('[data-ayuda-caja="' + suyo + '"]');
          x.classList.toggle('abierta', abierta);
          x.setAttribute('aria-expanded', String(abierta));
          if (!caja) return;
          caja.hidden = !abierta;
          if (abierta) llenarAyuda(suyo);
        });
      };
    });

    const modo = Store.settings().registro || 'detallado';
    const simple = modo === 'simple';
    const soloEjercicio = modo === 'ejercicio';
    const hecho = !!entry && entry.sets.every(function (x) { return x.done; });

    /* en modo simple el peso es uno solo para todo el ejercicio, y es opcional */
    const campoPeso = root.querySelector('#peso-opcional');
    if (campoPeso) {
      campoPeso.onchange = function () {
        const kg = Number(campoPeso.value) || 0;
        entry.sets.forEach(function (s) { s.weight = kg; });
        Store.setActive(a);
      };
    }

    /* pesos y repeticiones */
    root.querySelectorAll('#wo-sets [data-set]').forEach(function (rowEl) {
      const i = Number(rowEl.dataset.set);
      rowEl.querySelectorAll('input').forEach(function (inp) {
        inp.onchange = function () {
          entry.sets[i][inp.dataset.f] = Number(inp.value) || 0;
          Store.setActive(a);
        };
      });
      /* El mas y el menos no repintan la pantalla entera: se toca un numero
         y repintar aqui es perder el sitio en la lista a mitad de serie. */
      const paso = function (delta) {
        return function () {
          const set = entry.sets[i];
          const base = Number(set.reps) || Number(entry.targetReps) || 1;
          set.reps = Math.max(1, Math.min(200, base + delta));
          Store.setActive(a);
          const caja = rowEl.querySelector('.sf-num');
          if (caja) {
            const b = caja.querySelector('b');
            if (b) b.textContent = set.reps;
            caja.classList.toggle('cambiado',
              Number(set.reps) !== Number(entry.targetReps));
          }
        };
      };
      const menos = rowEl.querySelector('[data-f=menos]');
      const mas = rowEl.querySelector('[data-f=mas]');
      if (menos) menos.onclick = paso(-1);
      if (mas) mas.onclick = paso(1);

      const marcar = rowEl.matches('[data-f=done]') ? rowEl : rowEl.querySelector('[data-f=done]');
      marcar.onclick = function () {
        const set = entry.sets[i];
        set.done = !set.done;

        if (simple) {
          /* Se respeta lo que diga el contador. Aqui se escribia el objetivo de
             la rutina encima de lo apuntado, asi que bajar a seis con el menos
             y marcar la serie la devolvia a siete: el boton nuevo no habria
             servido para nada. El objetivo solo se usa si no hay nada. */
          if (!set.reps) set.reps = entry.targetReps;
          set.weight = campoPeso ? (Number(campoPeso.value) || 0) : (set.weight || 0);
          rowEl.classList.toggle('on', set.done);
        } else {
          set.weight = Number(rowEl.querySelector('[data-f=weight]').value) || 0;
          set.reps = Number(rowEl.querySelector('[data-f=reps]').value) || 0;
          rowEl.classList.toggle('on', set.done);
        }
        Store.setActive(a);

        if (set.done) {
          const prev = Store.prOf(entry.exId).best;
          if (!simple && set.weight > 0 && (!prev || set.weight > prev.weight)) {
            UI.toast('¡Nuevo récord en ' + entry.name + '!');
          }
          startRest(entry.rest);
          /* la barra de progreso de la cabecera se actualiza sin recargar la vista */
          const totalSets = a.entries.reduce(function (n, x) { return n + x.sets.length; }, 0);
          const doneSets = a.entries.reduce(function (n, x) {
            return n + x.sets.filter(function (s) { return s.done; }).length;
          }, 0);
          const bar = root.querySelector('.prog i');
          if (bar) bar.style.width = Math.round(doneSets / totalSets * 100) + '%';
          const cnt = root.querySelector('#wo-count');
          if (cnt) cnt.textContent = doneSets;
        } else {
          skipRest();
          const cnt = root.querySelector('#wo-count');
          const bar = root.querySelector('.prog i');
          const total = a.entries.reduce(function (n, x) { return n + x.sets.length; }, 0);
          const hechas = a.entries.reduce(function (n, x) {
            return n + x.sets.filter(function (y) { return y.done; }).length;
          }, 0);
          if (cnt) cnt.textContent = hechas;
          if (bar) bar.style.width = Math.round(hechas / total * 100) + '%';
        }
      };
    });

    function act(name, fn) {
      const el = root.querySelector('[data-w=' + name + ']');
      if (el) el.onclick = fn;
    }

    act('addset', function () {
      const lastSet = entry.sets[entry.sets.length - 1];
      entry.sets.push({ weight: lastSet ? lastSet.weight : 0, reps: entry.targetReps, done: false });
      Store.setActive(a); rerender();
    });

    act('delset', function () {
      if (entry.sets.length > 1) { entry.sets.pop(); Store.setActive(a); rerender(); }
    });

    act('rest', function () { startRest(entry.rest); });

    /* Modo "marcar el ejercicio y ya": un toque da por hechas todas sus series */
    act('hechoya', function () {
      const todas = entry.sets.every(function (x) { return x.done; });
      entry.sets.forEach(function (x) {
        x.done = !todas;
        if (!x.reps) x.reps = entry.targetReps;
      });
      Store.setActive(a);
      if (!todas && entry.rest) startRest(entry.rest);
      rerender();
      UI.toast(todas ? 'Ejercicio desmarcado' : 'Hecho. A por el siguiente.');
    });

    act('prev', function () {
      if (a.idx > 0) { a.idx--; Store.setActive(a); rerender(); }
    });

    act('next', function () {
      if (a.idx < a.entries.length - 1) { a.idx++; Store.setActive(a); rerender(); }
      else doFinish();
    });

    act('info', function () {
      const ex = Data.get(entry.exId);
      if (ex && g.App) g.App.exerciseSheet(ex);
    });

    /* La máquina está ocupada: se cambia el ejercicio sin perder las series
       ya marcadas ni el sitio en el entrenamiento. */
    act('cambiar', function () {
      const ex = Data.get(entry.exId);
      if (ex) cambiarSheet(ex, rerender);
    });

    /* se puede añadir cualquier ejercicio sobre la marcha, venga de rutina
       o de un entrenamiento libre */
    act('anadir', function () {
      if (!g.App || !g.App.pickExercise) return;
      g.App.pickExercise(function (ex) {
        UI.closeModal();
        añadirEjercicio(ex);
        rerender();
        UI.toast('«' + ex.nameEs + '» añadido a la sesión');
      });
    });

    act('actividad', function () { actividadSheet(rerender); });

    act('rutina', function () { g.App.go('rutinas'); });

    act('finish', doFinish);

    act('cancel', function () {
      UI.confirm('Descartar entrenamiento',
        'Se perderán las series registradas en esta sesión. Esta acción no se puede deshacer.',
        'Descartar', true).then(function (ok) {
        if (ok) { discard(); g.App.go('inicio'); UI.toast('Entrenamiento descartado'); }
      });
    });

    root.querySelectorAll('[data-goto]').forEach(function (btn) {
      btn.onclick = function () {
        a.idx = Number(btn.dataset.goto);
        Store.setActive(a); rerender();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });
  }

  /* Reproductor de Spotify durante la sesión, si está conectado */
  /* ---- Cambiar el ejercicio en marcha ----
     Pasa constantemente: la máquina está ocupada. Se ofrece el mismo trabajo
     con otro material y se conserva lo que ya llevas hecho: las series ya
     marcadas se quedan con el ejercicio original y el recambio arranca con
     las que faltan. */
  /* «Jugué un partido de fútbol». Pedirle el MET y los músculos a quien viene
     de jugar no tiene sentido: lo escribe con sus palabras y la IA pone los
     números. Sin IA se apunta igual, con un coste medio, que es mejor que no
     registrar nada. */
  function actividadSheet(rerender) {
    const a = Store.active();
    if (!a) return;
    const conIA = g.IA && IA.activa() && IA.estimarActividad;
    const yaHay = a.actividad || null;

    /* Dos salidas, porque hay dos momentos: se abre la app al empezar el
       partido, o se abre al volver a casa. Con solo cronómetro, lo segundo
       obligaba a inventarse un tiempo mirando el reloj. */
    let cuando = 'ahora';
    let minutos = 60;

    UI.modal(html`
      <h2>¿Qué estás haciendo?</h2>
      <p class="muted">Escríbelo como lo dirías: «partido de fútbol», «subí a
      Monserrate», «ciclovía». ${raw(conIA
        ? 'Yo calculo el gasto y qué partes del cuerpo trabajas.'
        : 'Sin la IA conectada lo apunto con un gasto medio.')}</p>

      <input id="ac-que" placeholder="Partido de fútbol" autocomplete="off"
             value="${yaHay ? yaHay.nombre : ''}">

      <label class="tiny" style="display:block;margin-top:14px">CUÁNDO</label>
      <div class="row wrap" style="gap:6px;margin-top:6px" id="ac-cuando">
        <button class="chip on" data-cuando="ahora">Lo estoy haciendo</button>
        <button class="chip" data-cuando="hecho">Ya lo hice</button>
      </div>

      <div id="ac-tiempo" hidden>
        <label class="tiny" style="display:block;margin-top:14px">CUÁNTO DURÓ</label>
        <div class="row wrap" style="gap:6px;margin-top:6px" id="ac-mins">
          ${raw([20, 30, 45, 60, 90, 120].map(function (m) {
            return '<button class="chip ' + (m === 60 ? 'on' : '') + '" data-min="' + m +
              '">' + m + ' min</button>';
          }).join(''))}
        </div>
        <input id="ac-otro" type="number" inputmode="numeric" min="1" max="600"
               placeholder="u otro número de minutos" style="margin-top:8px">
      </div>

      <div id="ac-visto" class="tiny" style="margin-top:10px"></div>

      <button class="btn primary block" id="ac-listo" style="margin-top:14px"></button>`,
      function (el) {
        const campo = el.querySelector('#ac-que');
        const visto = el.querySelector('#ac-visto');
        const btn = el.querySelector('#ac-listo');
        const caja = el.querySelector('#ac-tiempo');

        const textoBoton = function () {
          return cuando === 'ahora'
            ? (conIA ? 'Calcular y empezar' : 'Empezar')
            : (conIA ? 'Calcular y apuntar' : 'Apuntar');
        };
        const pintarBoton = function () { btn.textContent = textoBoton(); };
        pintarBoton();

        const marcar = function (sel, uno) {
          el.querySelectorAll(sel + ' .chip').forEach(function (c) {
            c.classList.toggle('on', c === uno);
          });
        };

        el.querySelectorAll('#ac-cuando .chip').forEach(function (c) {
          c.onclick = function () {
            cuando = c.dataset.cuando;
            marcar('#ac-cuando', c);
            caja.hidden = cuando !== 'hecho';
            pintarBoton();
          };
        });

        el.querySelectorAll('#ac-mins .chip').forEach(function (c) {
          c.onclick = function () {
            minutos = Number(c.dataset.min);
            el.querySelector('#ac-otro').value = '';
            marcar('#ac-mins', c);
          };
        });

        el.querySelector('#ac-otro').oninput = function (ev) {
          const v = Number(ev.target.value);
          if (v > 0) { minutos = Math.min(600, v); marcar('#ac-mins', null); }
        };

        /* Ponerlo en marcha: el cronómetro sigue y las calorías suben solas. */
        const enMarcha = function (act) {
          const viva = Store.active();
          if (!viva) return;
          viva.actividad = act;
          viva.routineName = act.nombre;
          Store.setActive(viva);
          UI.closeModal();
          rerender();
          pintarBanner();
          UI.toast(act.nombre + ' en marcha');
        };

        /* Ya hecho: se apunta con sus minutos y se cierra el entrenamiento. */
        const yaHecho = function (act) {
          apuntarHecha(act, minutos);
          UI.closeModal();
          if (g.App) g.App.go('inicio');
          UI.toast(act.nombre + ': ' + minutos + ' min, ~' +
            UI.num(kcalDe(act, minutos)) + ' kcal' +
            (act.origen === 'ia' ? '' : ' (gasto medio, sin analizar)'));
        };

        const rematar = function (act) {
          if (cuando === 'hecho') yaHecho(act); else enMarcha(act);
        };

        btn.onclick = function () {
          const t = campo.value.trim();
          if (!t) { UI.toast('Escribe qué has hecho'); campo.focus(); return; }

          if (!conIA) {
            rematar({ nombre: t, met: 4, musculos: [], nota: '', intensidad: '',
              origen: 'medio' });
            return;
          }

          btn.disabled = true;
          btn.textContent = 'Calculando…';
          visto.textContent = '';

          IA.estimarActividad(t).then(function (r) {
            if (!r || !r.met) {
              visto.innerHTML = '<span style="color:var(--warn)">' +
                UI.esc(r && r.nota ? r.nota : 'Eso no me suena a actividad física.') + '</span>';
              btn.disabled = false;
              pintarBoton();
              return;
            }
            rematar(r);
          }).catch(function (e) {
            visto.innerHTML = '<span style="color:var(--bad)">' +
              UI.esc(e.message || 'No he podido calcularlo.') + '</span>';
            btn.disabled = false;
            pintarBoton();
          });
        };

        campo.onkeydown = function (ev) {
          if (ev.key === 'Enter') { ev.preventDefault(); btn.click(); }
        };
      });
  }

  function cambiarSheet(ex, rerender) {
    const gear = Store.settings().gear || '';
    let lista = g.Alt ? Alt.para(ex, { limite: 10, soloDisponible: !!gear }) : [];
    let fuera = false;
    if (lista.length < 2 && g.Alt) {
      lista = Alt.para(ex, { limite: 10, gear: '' });
      fuera = true;
    }

    if (!lista.length) {
      UI.toast('No encuentro un recambio para este ejercicio');
      return;
    }

    UI.modal(UI.html`
      <h2>Cambiar «${ex.nameEs}»</h2>
      <p class="muted">${raw(fuera
        ? 'Con tu material no hay recambio directo; estas son del catálogo completo.'
        : 'Mismo trabajo, otro material. Las series que ya has marcado no se pierden.')}</p>
      <div class="stack">
        ${raw(lista.map(function (a) {
          return UI.html`
            <button class="rt-item" data-alt="${a.ex.id}" style="width:100%;text-align:left">
              <img src="${Data.img(a.ex, 0)}" alt="" loading="lazy">
              <div class="grow">
                <div style="font-weight:600;font-size:.86rem">${a.ex.nameEs}</div>
                <div class="tiny">${a.motivo} · ${I18N.equip(a.ex.equipment)}</div>
              </div>
            </button>`;
        }).join(''))}
      </div>`,
      function (el) {
        el.querySelectorAll('[data-alt]').forEach(function (btn) {
          btn.onclick = function () {
            reemplazarEjercicio(Data.get(btn.dataset.alt));
            UI.closeModal();
            rerender();
            UI.toast('Ejercicio cambiado');
          };
        });
      });
  }

  function reemplazarEjercicio(nuevo) {
    const a = Store.active();
    if (!a || !nuevo) return;
    const e = a.entries[a.idx];
    const hechas = e.sets.filter(function (s) { return s.done; }).length;
    const last = Store.lastPerformance(nuevo.id);
    const peso = last && last.sets.length ? Number(last.sets[0].weight) || 0 : 0;

    const entrada = {
      exId: nuevo.id,
      name: nuevo.nameEs,
      targetReps: e.targetReps,
      rest: e.rest,
      note: e.note,
      sets: Array.from({ length: Math.max(1, e.sets.length - hechas) }, function () {
        return { weight: peso, reps: e.targetReps, done: false };
      })
    };

    if (hechas) {
      /* lo ya hecho se queda con su ejercicio; el recambio continúa detrás */
      e.sets = e.sets.filter(function (s) { return s.done; });
      a.entries.splice(a.idx + 1, 0, entrada);
      a.idx += 1;
    } else {
      a.entries[a.idx] = entrada;
    }
    Store.setActive(a);
  }

  function pintarMusica(root) {
    const host = root.querySelector('#wo-musica');
    if (!host || !g.Spotify || !Spotify.activa()) return;

    const pintar = function (s) {
      /* Aquí no va nunca el reproductor grande: con la barra flotante abajo es
         lo mismo dos veces y empuja el ejercicio fuera de la pantalla. Si la
         música suena en otro aparato no hay barra que valga, así que se pone
         una línea igual de estrecha con lo mínimo para no quedarse sin mando. */
      if (s && Spotify.reproductorActivo && Spotify.reproductorActivo()) {
        host.innerHTML = '';
        return;
      }
      if (s) {
        host.innerHTML = html`
          <div class="card" style="padding:9px 11px">
            <div class="barra-musica">
              <button class="bm-ir" data-w2="ir">
                ${raw(s.portada ? '<img src="' + UI.esc(s.portada) + '" alt="">'
                  : '<span class="bm-sin">' + icon('musica') + '</span>')}
                <span class="bm-txt"><b>${s.titulo}</b><span>${s.artista}</span></span>
              </button>
              <button class="bm-b" data-w2="alternar"
                      aria-label="${s.sonando ? 'Pausar' : 'Reproducir'}">
                ${raw(icon(s.sonando ? 'pausaLleno' : 'playLleno'))}</button>
              <button class="bm-b" data-w2="siguiente" aria-label="Siguiente">
                ${raw(icon('siguiente'))}</button>
            </div>
          </div>`;
        host.querySelector('[data-w2=ir]').onclick = function () { g.App.go('musica'); };
        host.querySelectorAll('[data-w2=alternar],[data-w2=siguiente]').forEach(function (b) {
          b.onclick = function () {
            Spotify.desbloquearAudio();
            const fn = b.dataset.w2 === 'siguiente' ? Spotify.siguiente : Spotify.alternar;
            b.disabled = true;
            fn().catch(function (e) { UI.toast(e.message); })
              .then(function () { setTimeout(function () { b.disabled = false; }, 300); });
          };
        });
        return;
      }
      /* nada sonando: acceso directo a la música sin salir del entrenamiento */
      host.innerHTML = html`
        <button class="card row" data-w="musica" style="width:100%;text-align:left;gap:11px">
          <span class="row-icon">${raw(icon('musica'))}</span>
          <span class="grow" style="font-weight:600;font-size:.92rem">Poner música</span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>`;
      const b = host.querySelector('[data-w=musica]');
      if (b) b.onclick = function () { g.App.go('musica'); };
    };

    Spotify.sonando()
      .then(pintar)
      .catch(function () { pintar(null); });

    /* el reproductor propio avisa de cada cambio de canción */
    if (Spotify.alCambiar) Spotify.alCambiar(function (s) { if (s) pintar(s); });
  }

  /* Volver a empezar la misma rutina: las series sin marcar, el cronómetro a
     cero y otra vez por el primer ejercicio. Los pesos que hubiera escritos se
     quedan, que es lo que uno quiere al repetir. */
  function reiniciar() {
    const a = Store.active();
    if (!a) return;
    a.entries.forEach(function (e) {
      e.sets.forEach(function (x) { x.done = false; });
    });
    a.idx = 0;
    a.start = Date.now();
    Store.setActive(a);
    /* el descanso que estuviera corriendo no tiene sentido al empezar de cero */
    skipRest();
    pintarBanner();
  }

  /* Qué se pierde si se descarta, dicho con números y no con «se perderán los
     datos»: es lo que hace que uno sepa si de verdad quiere. */
  function loQueHay() {
    const a = Store.active();
    if (!a) return null;
    const done = a.entries.reduce(function (n, e) {
      return n + e.sets.filter(function (s) { return s.done; }).length;
    }, 0);
    return { done: done, segundos: (Date.now() - a.start) / 1000 };
  }

  function resumen(h) {
    if (!h.done) {
      return 'Llevas ' + UI.mmss(h.segundos) + ' entrenando y no has anotado ninguna serie.';
    }
    return h.done + (h.done === 1 ? ' serie completada' : ' series completadas') +
      ' y ' + UI.mmss(h.segundos) + ' de entrenamiento.';
  }

  /* Las cuatro salidas de un entrenamiento en curso. Antes solo había guardar o
     volver atrás: descartar estaba en la pantalla, abajo del todo, y reiniciar
     no existía —había que descartar y montar la rutina otra vez—. Las dos que
     borran algo piden confirmación aparte, con lo que se pierde delante. */
  function doFinish() {
    const h = loQueHay();
    if (!h) return;

    UI.modal(UI.html`
      <h2>${T('Terminar entrenamiento')}</h2>
      <p class="muted">${resumen(h)}</p>

      <button class="btn primary block" data-f="guardar" style="margin-top:18px">
        ${UI.raw(icon('check'))} ${h.done ? 'Guardar el entrenamiento' : 'Guardar el tiempo'}</button>

      <button class="btn block" data-f="reiniciar" style="margin-top:8px">
        ${UI.raw(icon('cambiar'))} Reiniciar y empezar de cero</button>

      <button class="btn danger block" data-f="descartar" style="margin-top:8px">
        ${UI.raw(icon('trash'))} Descartar, no guardar nada</button>

      <button class="btn ghost block" data-f="cancelar" style="margin-top:8px">Cancelar</button>`,
      function (el) {
        el.querySelector('[data-f=cancelar]').onclick = function () { UI.closeModal(); };

        el.querySelector('[data-f=guardar]').onclick = function () {
          UI.closeModal();
          const s = finish();
          g.App.go('inicio');
          UI.toast(s && s.volume
            ? '¡Entrenamiento guardado! Volumen: ' + UI.kg(s.volume)
            : '¡Entrenamiento guardado! ' + UI.mmss(h.segundos));
        };

        el.querySelector('[data-f=reiniciar]').onclick = function () {
          UI.closeModal();
          UI.confirm('¿Reiniciar el entrenamiento?',
            h.done
              ? 'Se borran las ' + h.done + (h.done === 1 ? ' serie que llevas marcada' :
                ' series que llevas marcadas') + ' y el cronómetro vuelve a cero. ' +
                'La rutina se queda igual y los pesos que hayas escrito también.'
              : 'El cronómetro vuelve a cero y empiezas otra vez por el primer ejercicio.',
            'Reiniciar', true).then(function (ok) {
            if (!ok) return;
            reiniciar();
            g.App.render();
            UI.toast('Entrenamiento reiniciado');
          });
        };

        el.querySelector('[data-f=descartar]').onclick = function () {
          UI.closeModal();
          UI.confirm('¿Descartar el entrenamiento?',
            h.done
              ? 'No se guarda nada: ni las ' + h.done + (h.done === 1 ? ' serie' : ' series') +
                ' que llevas ni los ' + UI.mmss(h.segundos) + ' de entrenamiento. ' +
                'Esto no se puede deshacer.'
              : 'No se guarda nada, ni el tiempo. Esto no se puede deshacer.',
            'Descartar', true).then(function (ok) {
            if (!ok) return;
            discard();
            g.App.go('inicio');
            UI.toast('Entrenamiento descartado');
          });
        };
      });
  }

  g.Workout = {
    start: start, startLibre: startLibre, cargar: cargar, view: view, mount: mount,
    isActive: isActive, finish: finish, discard: discard, reiniciar: reiniciar, stopTimers: stopTimers,
    pintarBanner: pintarBanner
  };
})(window);
