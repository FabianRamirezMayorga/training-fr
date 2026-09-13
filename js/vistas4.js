/* vistas4.js — el programa de entrenamiento personal.
   Enseña qué ha entendido la app de tu perfil, deja ajustar los cuatro datos
   que cambian el plan y presenta el programa con el porqué de cada decisión:
   sin la explicación, un plan es una lista de ejercicios y no hay forma de
   saber si sirve. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const FOCOS = [
    { id: 'equilibrado', label: 'Equilibrado' },
    { id: 'gluteo', label: 'Glúteo' },
    { id: 'pierna', label: 'Pierna' },
    { id: 'pecho', label: 'Pecho' },
    { id: 'espalda', label: 'Espalda' },
    { id: 'hombro', label: 'Hombro' },
    { id: 'brazo', label: 'Brazo' },
    { id: 'core', label: 'Core' }
  ];

  /* El plan y la lectura del entrenador se guardan en el dispositivo. Antes
     vivían en memoria: salías de la pantalla y había que generarlo otra vez y,
     lo que es peor, pagar otra llamada a la IA para volver a leer lo mismo. */
  const CLAVE = 'trainingfr.programa';

  let est = {
    dias: ['Lun', 'Mar', 'Jue', 'Vie'],
    minutos: 60,
    objetivo: '',
    foco: 'equilibrado',
    nombre: '',
    prog: null,
    ia: null,
    aplicados: [],
    guardadas: [],
    cargandoIA: false,
    cargandoPlan: false,
    falloIA: '',
    todoAbierto: false,
    molestias: '',
    notas: '',
    variante: 0,
    abierto: {}
  };

  (function recuperar() {
    try {
      const x = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (!x || x.v !== 1) return;
      ['dias', 'minutos', 'objetivo', 'foco', 'nombre', 'prog', 'ia'].forEach(function (k) {
        if (x[k] !== undefined && x[k] !== null) est[k] = x[k];
      });
      est.aplicados = x.aplicados || [];
      est.guardadas = x.guardadas || [];
      est.recuperado = !!est.prog;
    } catch (e) { /* si el guardado está roto, se empieza de cero */ }
  })();

  function guardarEstado() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        v: 1, ts: Date.now(),
        dias: est.dias, minutos: est.minutos, objetivo: est.objetivo, foco: est.foco,
        nombre: est.nombre, prog: est.prog, ia: est.ia, aplicados: est.aplicados,
        guardadas: est.guardadas
      }));
    } catch (e) { /* sin sitio: el plan sigue en pantalla, solo no sobrevive */ }
  }

  /* De las rutinas que creó este plan, las que siguen existiendo. Si el usuario
     borró alguna a mano, deja de contar como suya. */
  function vivas() {
    return (est.guardadas || []).filter(function (id) { return !!Store.routine(id); });
  }

  /* Las rutinas que ya existen con el nombre de este plan. Recordar los ids de
     la vez anterior solo servía dentro de la misma sesión: generabas un plan,
     lo guardabas, y al volver otro día —u otro dispositivo— esa memoria ya no
     estaba y se creaba todo otra vez. De ahí los planes triplicados. Buscarlas
     por nombre funciona siempre. */
  function delMismoPlan(etiqueta) {
    const nombre = String(etiqueta || '').trim();
    if (!nombre) return [];
    return Store.routines().filter(function (r) {
      return (r.days || []).length && App.nombreRutina(r) === nombre;
    });
  }

  function objetivoActual() {
    if (est.objetivo) return est.objetivo;
    const p = Perfil.datos();
    return Programa.OBJETIVOS[p.objetivo] ? p.objetivo : 'mantener';
  }

  /* ---------- lo que la app sabe de ti ---------- */
  function fichaPerfil(p) {
    const nivel = { beginner: 'Principiante', intermediate: 'Intermedio', expert: 'Avanzado' };
    const lesiones = Programa.lesionesDe(p.lesiones)
      .map(function (k) { return Programa.LESIONES[k].label; });

    return html`
      <div class="card">
        <div class="row between" style="align-items:flex-start">
          <div class="grow">
            <div class="tiny" style="color:var(--acc)">TU PERFIL</div>
            <div class="row wrap" style="gap:6px;margin-top:8px">
              <span class="chip">${p.sexo === 'mujer' ? 'Mujer' : 'Hombre'}</span>
              <span class="chip">${p.edad} años</span>
              <span class="chip">${p.peso} kg · ${p.altura} cm</span>
              <span class="chip">${nivel[p.experiencia] || 'Intermedio'}</span>
              <span class="chip">Duerme ${p.sueño} h</span>
              ${raw(lesiones.map(function (l) {
                return '<span class="chip solid">' + esc(l) + '</span>';
              }).join(''))}
            </div>
          </div>
          <button class="btn sm" data-a="editarperfil">Editar</button>
        </div>
        ${raw(lesiones.length ? html`
          <p class="tiny" style="margin:10px 0 0">De lo que has escrito en limitaciones he
          entendido: <b>${lesiones.join(', ')}</b>. Abajo verás qué se evita por eso.</p>`
        : html`
          <p class="tiny" style="margin:10px 0 0">Sin limitaciones apuntadas. Si tienes alguna
          molestia, escríbela en el perfil y el plan la esquiva.</p>`)}
      </div>`;
  }

  /* ---------- controles ---------- */
  /* Lo que ya tiene montado, antes de nada. Entrar a esta pantalla y ver un
     formulario en blanco hace pensar que no hay nada guardado, y lo normal es
     venir a mirar el plan, no a rehacerlo. */
  /* Abrir un plan que ya está en rutinas: se reconstruye el mismo objeto que
     usa toda esta pantalla, así que se ve igual que uno recién generado —sus
     días, su reparto de volumen— y se le puede pedir la auditoría y aplicar
     lo que proponga. Antes tocarlo te echaba a la pantalla de Rutinas, que es
     justo donde no querías ir. */
  function planDesdeRutinas(nombre) {
    const suyas = Store.routines().filter(function (r) {
      return (r.days || []).length && App.nombreRutina(r) === nombre;
    });
    if (!suyas.length) return null;

    suyas.sort(function (a, b) {
      return DIAS.indexOf((a.days || [])[0]) - DIAS.indexOf((b.days || [])[0]);
    });

    const dias = [];
    suyas.forEach(function (r) {
      (r.days || []).forEach(function (d) { if (dias.indexOf(d) === -1) dias.push(d); });
    });
    dias.sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); });

    /* la calculadora da los campos derivados —rpe, calentamiento, progresión—
       que esta pantalla necesita y que una rutina guardada no guarda */
    const base = Programa.crear({
      dias: dias, minutos: est.minutos, objetivo: objetivoActual(),
      foco: est.foco, gear: Store.settings().gear
    });

    const prog = Object.assign({}, base);
    prog.sesiones = suyas.map(function (r) {
      return {
        dia: (r.days || [])[0],
        nombre: App.tituloRutina(r),
        plantilla: '',
        ejercicios: (r.exercises || []).map(function (e) {
          const ex = Data.get(e.exId);
          return {
            exId: e.exId,
            patron: ex ? Alt.patron(ex) : '',
            musculo: (ex && (ex.primaryMuscles || [])[0]) || 'abdominals',
            rol: 'accesorio',
            sets: e.sets, reps: e.reps, weight: 0, rest: e.rest, note: e.note || ''
          };
        }),
        minutos: (r.exercises || []).reduce(function (n, e) {
          return n + Math.round(e.sets * ((e.rest || 75) + 35) / 60);
        }, 0) + base.calentamiento
      };
    });

    prog.porIA = false;
    prog.deRutinas = nombre;
    prog.nombreIA = nombre;
    prog.descartados = [];
    prog.razones = ['Este es el plan que ya tienes guardado en tus rutinas, tal y como ' +
      'está ahora mismo.',
      'Debajo puedes pedirle al entrenador que lo audite y aplicar lo que proponga; los ' +
      'cambios se guardan sobre estas mismas rutinas.'];

    Programa.revolumen(prog);

    est.dias = dias;
    est.nombre = nombre;
    est.guardadas = suyas.map(function (r) { return r.id; });
    est.recuperado = false;
    est.ia = null;
    est.aplicados = [];
    est.abierto = {};
    return prog;
  }

  /* Lo que pide Rutinas cuando tocas «Revisar el plan con IA»: se abre aquí y
     la auditoría arranca sola, sin que haya que buscar el botón al final. */
  let planPendiente = null;

  V.auditarPlan = function (nombre) {
    planPendiente = nombre;
    go('programa');
  };

  function abrirPlan(nombre) {
    const prog = planDesdeRutinas(nombre);
    if (!prog) { UI.toast('Ese plan ya no está'); return; }
    est.prog = prog;
    guardarEstado();
    render();
    const caja = document.querySelector('.stats');
    if (caja) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function misProgramasHTML() {
    const rutinas = Store.routines().filter(function (r) { return (r.days || []).length; });
    if (!rutinas.length && !est.prog) return '';

    /* agrupadas por plan, igual que en la pantalla de Rutinas */
    const orden = [];
    const planes = {};
    rutinas.forEach(function (r) {
      const k = App.nombreRutina ? App.nombreRutina(r) : r.name;
      if (!planes[k]) { planes[k] = []; orden.push(k); }
      planes[k].push(r);
    });

    /* El plan en pantalla solo sale aparte si todavía NO está en rutinas. Si ya
       se guardó, es el mismo que aparece abajo con el nombre que le pusiste, y
       verlo dos veces con dos nombres distintos hace pensar que tienes planes
       que no has creado. */
    const sinGuardar = est.prog && !vivas().length;

    return html`
      <div class="list-head">
        <span class="list-title">Lo que ya tienes</span>
        <button class="btn sm primary" data-a="irgenerar">${raw(icon('plus'))} Nuevo</button>
      </div>
      ${raw(sinGuardar ? html`
        <div class="card" style="border-color:var(--acc)">
          <div class="row between" style="align-items:flex-start">
            <div class="grow">
              <b>${est.prog.nombreIA || 'Plan recién montado'}</b>
              <div class="tiny" style="margin-top:2px">${est.prog.sesiones.length} sesiones
                \u00b7 ${est.prog.porIA ? 'montado con IA' : 'montado con la calculadora'}
                \u00b7 <span style="color:var(--warn)">sin pasar a tus rutinas</span></div>
            </div>
            <button class="btn sm" data-a="verplan">Ver</button>
          </div>
        </div>` : '')}

      ${raw(orden.length ? html`
        <div class="list">
          ${raw(orden.map(function (k) {
            const suyas = planes[k];
            const dias = [];
            suyas.forEach(function (r) {
              (r.days || []).forEach(function (d) { if (dias.indexOf(d) === -1) dias.push(d); });
            });
            dias.sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); });
            const n = suyas.reduce(function (t, r) { return t + r.exercises.length; }, 0);
            const abierto = est.prog && est.prog.deRutinas === k;
            return '<div class="list-row tap' + (abierto ? ' sel' : '') +
              '" data-abrirplan="' + esc(k) + '">' +
              '<span class="row-icon">' + icon('dumbbell') + '</span>' +
              '<div class="grow"><div class="list-row-title">' + esc(k) + '</div>' +
              '<div class="list-row-sub">' + suyas.length +
              (suyas.length === 1 ? ' rutina' : ' rutinas') + ' \u00b7 ' + n +
              ' ejercicios \u00b7 ' + dias.join(', ') + '</div></div>' +
              '<span class="chevron">' + icon('chevron') + '</span></div>';
          }).join(''))}
        </div>
        <p class="tiny" style="margin:8px 4px 0">Toca uno para abrirlo aquí: verás sus días
        y su reparto, podrás pedirle al entrenador que lo audite y aplicar lo que
        proponga sobre estas mismas rutinas.</p>` : '')}`;
  }

  function paso(n, titulo, cuerpo, nota) {
    return html`
      <div class="card paso-plan">
        <div class="row" style="align-items:flex-start;gap:11px">
          <span class="paso-n">${n}</span>
          <div class="grow">
            <b>${titulo}</b>
            ${raw(cuerpo)}
            ${raw(nota ? '<p class="tiny" style="margin:10px 0 0">' + nota + '</p>' : '')}
          </div>
        </div>
      </div>`;
  }

  /* ---------- el asistente ----------
     Antes era una pantalla de fichas sueltas y un botón al final: se podía
     generar sin haber mirado nada, y el resultado salía idéntico una y otra
     vez. Ahora va por pasos —tus datos, cuándo entrenas, qué buscas, y lo que
     solo tú sabes— y los dos botones esperan al final, que es donde toca
     decidir quién lo monta. */
  function controles() {
    const p = Perfil.datos();
    const nivel = { beginner: 'Principiante', intermediate: 'Intermedio', expert: 'Avanzado' };

    const datos = html`
      <div class="row wrap" style="gap:6px;margin-top:9px">
        <span class="chip">${p.sexo === 'mujer' ? 'Mujer' : 'Hombre'}</span>
        <span class="chip">${p.edad} años</span>
        <span class="chip">${p.peso} kg · ${p.altura} cm</span>
        <span class="chip">${nivel[p.experiencia] || 'Intermedio'}</span>
        <span class="chip">Duerme ${p['sue\u00f1o']} h</span>
      </div>
      <button class="btn sm block" data-a="editarperfil" style="margin-top:10px">
        Corregir mis datos</button>`;

    const cuando = html`
      <div class="row between" style="margin:9px 0 6px">
        <span class="tiny">QUÉ DÍAS</span>
        <span class="chip solid tiny-chip">${est.dias.length}
          ${est.dias.length === 1 ? 'día' : 'días'}</span>
      </div>
      <div class="row wrap" style="gap:6px">
        ${raw(DIAS.map(function (d) {
          return '<button class="chip ' + (est.dias.indexOf(d) !== -1 ? 'on' : '') +
            '" data-dia="' + d + '">' + UI.diaLargo(d) + '</button>';
        }).join(''))}
      </div>
      <div class="tiny" style="margin:13px 0 6px">CUÁNTO DURA CADA SESIÓN</div>
      <div class="row wrap" style="gap:6px">
        ${raw([30, 45, 60, 75, 90].map(function (m) {
          return '<button class="chip ' + (est.minutos === m ? 'on' : '') +
            '" data-min="' + m + '">' + m + ' min</button>';
        }).join(''))}
      </div>`;

    const busca = html`
      <div class="row wrap" style="gap:6px;margin-top:9px">
        ${raw(Object.keys(Programa.OBJETIVOS).map(function (k) {
          return '<button class="chip ' + (objetivoActual() === k ? 'on' : '') +
            '" data-obj="' + k + '">' + esc(Programa.OBJETIVOS[k].label) + '</button>';
        }).join(''))}
      </div>
      <p class="tiny" style="margin:9px 0 0">${Programa.OBJETIVOS[objetivoActual()].resumen}</p>
      <div class="tiny" style="margin:13px 0 6px">¿PRIORIZAR ALGUNA ZONA?</div>
      <div class="pill-scroll" style="margin:0 -4px;padding-left:0">
        ${raw(FOCOS.map(function (f) {
          return '<button class="chip ' + (est.foco === f.id ? 'on' : '') +
            '" data-foco="' + f.id + '">' + esc(f.label) + '</button>';
        }).join(''))}
      </div>`;

    /* Lo que no está en ningún campo y es justo lo que hace que un plan deje de
       parecer de plantilla: lo que le molesta hoy y lo que quiere o no quiere. */
    const extra = html`
      <label class="tiny" style="display:block;margin:9px 0 5px">
        ¿ALGO TE MOLESTA AHORA MISMO?</label>
      <input id="pg-molestias" value="${est.molestias || ''}" autocomplete="off"
             placeholder="Ej. la rodilla al bajar, el hombro por encima de la cabeza">
      <label class="tiny" style="display:block;margin:12px 0 5px">
        ¿ALGO MÁS QUE DEBA SABER?</label>
      <textarea id="pg-notas" rows="3" placeholder="Ej. quiero mejorar en dominadas; odio las sentadillas; los viernes voy con prisa; tengo una carrera en dos meses">${est.notas || ''}</textarea>`;

    return html`
      <div class="list-title" id="generar">Generar uno nuevo</div>

      ${raw(paso(1, 'Tus datos', datos,
        'Son los que usa el plan para el volumen, las repeticiones y el esfuerzo. ' +
        'Si algo no cuadra, corr\u00edgelo antes de generar.'))}
      ${raw(paso(2, '\u00bfCu\u00e1ndo puedes entrenar?', cuando,
        'Ponlo realista: es mejor un plan de tres d\u00edas que cumples que uno de cinco que no.'))}
      ${raw(paso(3, '\u00bfQu\u00e9 buscas?', busca, ''))}
      ${raw(paso(4, '\u00bfAlgo que deba saber?', extra,
        'Esto es opcional, pero es lo que separa un plan tuyo de uno gen\u00e9rico. ' +
        'Solo lo aprovecha la IA; la calculadora no lee texto.'))}

      ${raw(est.falloIA ? html`
        <div class="card aviso-seguridad">
          <b>La IA no ha podido montarlo</b>
          <p style="margin:7px 0 0;font-size:.9rem">${est.falloIA}</p>
          <p class="tiny" style="margin:9px 0 0">Lo que ves abajo lo ha montado la
          calculadora, no la IA. Arregla lo de arriba y vuelve a darle a
          <b>Generar rutina con IA</b>.</p>
          <button class="btn block" data-a="irclaves" style="margin-top:11px">
            Revisar mi proveedor de IA</button>
        </div>` : '')}

      ${raw(est.cargandoPlan ? html`
        <div class="card center">
          <div class="spinner" style="margin:6px auto"></div>
          <p class="tiny" style="margin:8px 0 0">Mont\u00e1ndote la semana entera con tus datos
          delante\u2026 esto tarda unos segundos.</p>
        </div>`
      : html`
        <button class="btn primary block grande" data-a="crearia">
          ${raw(icon('chispa'))} Generar rutina con IA
        </button>
        <p class="tiny center" style="margin:7px 4px 0">${IA.activa()
          ? 'Lee todo lo anterior m\u00e1s lo que levantas, lo que llevas abandonado y los d\u00edas ' +
            'que cumples de verdad, y elige los ejercicios uno a uno del cat\u00e1logo.'
          : 'Necesita un proveedor de IA con su clave, en la b\u00f3veda de Ajustes.'}</p>

        <button class="btn block" data-a="crear" style="margin-top:10px">
          Generar rutina autom\u00e1ticamente
        </button>
        <p class="tiny center" style="margin:7px 4px 0">Sin IA y al momento: reparte patrones
        de movimiento seg\u00fan tu edad, tu nivel y tu objetivo. Cada vez que la pidas cambia
        algunos ejercicios, pero no lee lo que hayas escrito arriba.</p>`)}`;
  }

  /* ---------- un día del plan ----------
     Antes era una lista plana con todo desplegado de golpe: seis días abiertos
     a la vez son cincuenta filas iguales y no se distingue un básico de un
     accesorio ni se puede hacer nada con el día. Ahora la semana se lee de un
     vistazo —cada día dice qué trabaja y cuánto cuesta— y se abre el que
     interese, con el primero abierto para que no parezca vacío. */
  /* ---------- de qué está hecha la semana ----------
     Aquí lo que interesa es la composición del plan: qué vas a entrenar y en
     qué proporción. La comparación entre lo que el plan pide y lo que de verdad
     haces es otra pregunta —y otra pantalla—: vive en Progreso, que es donde uno
     va a ver si cumple. */
  function barraVolumen(prog) {
    const zonas = {};
    let total = 0;

    prog.sesiones.forEach(function (ses) {
      ses.ejercicios.forEach(function (e) {
        const ex = Data.get(e.exId);
        const grupos = (ex && ex.groups && ex.groups.length) ? ex.groups : null;
        if (!grupos) return;
        /* una serie se reparte entre las zonas que toca, sin inflar el total */
        grupos.forEach(function (gr) {
          zonas[gr] = (zonas[gr] || 0) + e.sets / grupos.length;
        });
        total += e.sets;
      });
    });

    const filas = Object.keys(zonas)
      .map(function (id) {
        const r = I18N.REGIONES.find(function (x) { return x.id === id; });
        return { id: id, label: r ? r.label : id, series: Math.round(zonas[id] * 10) / 10 };
      })
      .filter(function (f) { return f.series > 0; })
      .sort(function (a, b) { return b.series - a.series; });

    if (!filas.length || !total) return '';

    const mayor = filas[0].series;

    return html`
      <div class="list-title">De qué está hecha tu semana</div>
      <p class="tiny" style="margin:-4px 4px 10px">Cómo se reparten las
      <b>${Math.round(total)} series</b> del plan entre las zonas del cuerpo. Es la
      composición de lo que vas a hacer; si cumples o no con ello se ve en Progreso.</p>

      <div class="card">
        <div class="comp">
          ${raw(filas.map(function (f) {
            const pct = Math.round(f.series / total * 100);
            return html`
              <div class="comp-fila">
                <span class="comp-nom">${f.label}</span>
                <span class="comp-pista">
                  <i style="width:${Math.round(f.series / mayor * 100)}%"></i>
                </span>
                <span class="comp-num">${String(f.series).replace('.', ',')}
                  <span class="comp-pct">${pct}%</span></span>
              </div>`;
          }).join(''))}
        </div>
        <p class="tiny" style="margin:11px 0 0">${filas.length === 1
          ? 'Todo el plan cae en una sola zona. Para una semana completa conviene repartir más.'
          : 'La cifra grande son series por semana; el porcentaje, qué parte del total se lleva ' +
            'esa zona.'}</p>
      </div>`;
  }

  function tarjetaDia(s, i, prog) {
    const abierto = est.abierto[i] === undefined ? i === 0 : est.abierto[i];
    const series = s.ejercicios.reduce(function (n, e) { return n + e.sets; }, 0);

    /* qué se trabaja ese día, por orden de series */
    const porMusculo = {};
    s.ejercicios.forEach(function (e) {
      const ex = Data.get(e.exId);
      const m = (ex && (ex.primaryMuscles || [])[0]) || e.musculo;
      if (m) porMusculo[m] = (porMusculo[m] || 0) + e.sets;
    });
    const musculos = Object.keys(porMusculo)
      .sort(function (a, b) { return porMusculo[b] - porMusculo[a]; })
      .slice(0, 3).map(I18N.muscle).join(' · ');

    /* si el plan está guardado, el día se puede entrenar desde aquí */
    const suya = (prog.deRutinas || est.guardadas.length)
      ? Store.routines().find(function (r) {
          return (r.days || []).indexOf(s.dia) !== -1 &&
            est.guardadas.indexOf(r.id) !== -1;
        })
      : null;

    return html`
      <div class="dia ${abierto ? 'abierto' : ''}">
        <button class="dia-top" data-dia-abrir="${i}">
          <span class="dia-ini">${UI.diaLargo(s.dia).slice(0, 3)}</span>
          <span class="grow">
            <span class="dia-nom">${s.nombre}</span>
            <span class="dia-mus">${musculos || 'sin ejercicios'}</span>
          </span>
          <span class="dia-chev ${abierto ? 'abierto' : ''}">${raw(icon('chevron'))}</span>
        </button>

        <div class="dia-datos">
          <span><b>${s.ejercicios.length}</b> ejercicios</span>
          <span><b>${series}</b> series</span>
          <span><b>${s.minutos}</b> min</span>
        </div>

        <div class="dia-lista" ${raw(abierto ? '' : 'hidden')}>
          ${raw(s.ejercicios.map(function (e, n) {
            const ex = Data.get(e.exId);
            const principal = e.rol === 'principal';
            return html`
              <button class="ejer ${principal ? 'clave' : ''}" data-ver="${e.exId}">
                <span class="ejer-n">${n + 1}</span>
                <img src="${ex ? Data.img(ex, 0) : Data.PLACEHOLDER}" alt="" loading="lazy">
                <span class="grow">
                  <span class="ejer-nom">${ex ? ex.nameEs : e.exId}</span>
                  <span class="ejer-meta">${e.sets} × ${e.reps}
                    <i>·</i> ${e.rest}s de descanso</span>
                  ${raw(e.note ? '<span class="ejer-nota">' + esc(e.note) + '</span>' : '')}
                </span>
                <span class="ejer-mus">${I18N.muscle(e.musculo)}</span>
              </button>`;
          }).join(''))}

          ${raw(suya ? html`
            <div class="dia-pie">
              <button class="btn sm grow" data-editardia="${suya.id}">
                ${raw(icon('edit'))} Editar</button>
              <button class="btn sm primary grow" data-entrenardia="${suya.id}">
                ${raw(icon('play'))} Entrenar este día</button>
            </div>` : '')}
        </div>
      </div>`;
  }

  function colorNota(n) {
    if (n >= 8) return 'var(--acc)';
    if (n >= 6) return 'var(--warn)';
    return 'var(--bad)';
  }

  const ETIQUETA_ACCION = {
    cambiar: 'Sustituir', quitar: 'Quitar', anadir: 'Añadir'
  };

  /* Cómo se lee un cambio antes de aplicarlo. Escrito como lo diría alguien de
     viva voz: qué se toca y a cambio de qué. */
  function textoCambio(c) {
    const acc = accionDe(c);
    if (acc === 'quitar') return html`<b>${c.quitar}</b>`;
    if (acc === 'anadir') {
      const donde = Number(c.dia) > 0 && est.prog.sesiones[Number(c.dia) - 1]
        ? ' en ' + est.prog.sesiones[Number(c.dia) - 1].nombre : '';
      return html`<b>${c.poner}</b>${donde}`;
    }
    return html`<b>${c.poner}</b> en lugar de ${c.quitar}`;
  }

  function accionDe(c) {
    const a = String(c.accion || '').toLowerCase().replace('ñ', 'n');
    if (a === 'quitar' || a === 'eliminar' || a === 'sacar') return 'quitar';
    if (a === 'anadir' || a === 'agregar' || a === 'meter' || a === 'sumar') return 'anadir';
    if (a === 'cambiar' || a === 'sustituir' || a === 'reemplazar') return 'cambiar';
    /* sin acción declarada se deduce de lo que venga relleno */
    if (c.quitar && c.poner) return 'cambiar';
    if (c.poner) return 'anadir';
    return 'quitar';
  }

  function bloqueIA() {
    if (est.cargandoIA) {
      return html`<div class="card center"><div class="spinner" style="margin:6px auto"></div>
        <p class="tiny" style="margin:8px 0 0">El entrenador está auditando tu programa…</p></div>`;
    }
    const r = est.ia;
    if (!r) {
      return html`
        <button class="btn ${IA.activa() ? 'primary' : ''} block" data-a="afinar"
                style="margin-top:12px">
          ${raw(icon('chispa'))} Que un entrenador con IA audite tu plan
        </button>
        <p class="tiny center" style="margin:7px 4px 0">${raw(IA.activa()
          ? 'No viene a darte la razón: le pedimos que le ponga nota, que señale lo que '
            + 'falla y que proponga quitar, meter o cambiar ejercicios. Lo que diga se '
            + 'queda guardado y se aplica de un toque.'
          : 'Necesita un proveedor de IA con su clave, en la bóveda de Ajustes. Sin eso '
            + 'el plan funciona igual, pero esta lectura no.')}</p>`;
    }

    const nota = Number(r.nota);
    const pendientes = (r.cambios || []).length;

    return html`
      <div class="list-head">
        <span class="list-title">Lo que dice el entrenador</span>
        <button class="btn sm ghost" data-a="olvidaIA">Descartar</button>
      </div>

      <div class="card">
        ${raw(nota > 0 ? html`
          <div class="row" style="gap:12px;align-items:center;margin-bottom:10px">
            <div style="flex:none;font-size:1.9rem;font-weight:700;line-height:1;
                        color:${raw(colorNota(nota))}">${nota}<span
                 style="font-size:.9rem;color:var(--dim2)">/10</span></div>
            <div class="tiny grow">Nota que le pone a este plan tal y como está ahora.</div>
          </div>` : '')}
        <p style="margin:0 0 10px">${r.veredicto || ''}</p>
        ${raw((r.puntos || []).map(function (x) {
          return '<div class="error-item"><b>' + esc(x.titulo || '') + '</b><p>' +
            esc(x.detalle || '') + '</p></div>';
        }).join(''))}
      </div>

      ${raw(r.nutricion ? html`
        <div class="card">
          <h3 class="guia-h">${raw(icon('nutricion'))} De comida</h3>
          <p style="margin:0">${r.nutricion}</p>
        </div>` : '')}

      ${raw(pendientes ? html`
        <div class="card">
          <b>Cambios que propone</b>
          <div class="stack" style="margin-top:9px">
            ${raw((r.cambios || []).map(function (c, i) {
              const acc = accionDe(c);
              return html`
                <div class="row between" style="gap:10px;align-items:flex-start">
                  <div class="grow">
                    <div style="font-size:.86rem">
                      <span class="chip tiny-chip">${ETIQUETA_ACCION[acc] || acc}</span>
                      ${raw(textoCambio(c))}</div>
                    <div class="tiny">${c.porque || ''}</div>
                  </div>
                  <div class="row" style="gap:6px;flex:none">
                    <button class="btn sm" data-cambio="${i}">Aplicar</button>
                    <button class="btn sm ghost" data-nocambio="${i}"
                            aria-label="Descartar">✕</button>
                  </div>
                </div>`;
            }).join(''))}
          </div>
          <p class="tiny" style="margin:10px 0 0">Cada cambio se comprueba antes de aplicarlo:
          si el ejercicio no existe, no cabe con tu material o choca con tus limitaciones,
          se descarta. Lo que apliques se guarda y viaja a tus rutinas al pulsar Guardar.</p>
        </div>` : '')}

      ${raw(est.aplicados.length ? html`
        <div class="card">
          <b>Ya aplicado</b>
          <div class="stack" style="margin-top:8px">
            ${raw(est.aplicados.map(function (t) {
              return '<div class="tiny">✓ ' + esc(t) + '</div>';
            }).join(''))}
          </div>
          <p class="tiny" style="margin:9px 0 0">Estos cambios ya están en el plan de arriba.
          Se guardan con él; para que lleguen a tus rutinas pulsa
          <b>Guardar mis rutinas</b>.</p>
        </div>` : '')}

      ${raw(r.consejo ? html`
        <div class="card destacado-clave">
          <h3 class="guia-h">${raw(icon('chispa'))} Si solo haces una cosa</h3>
          <p style="margin:0">${r.consejo}</p>
        </div>` : '')}

      <button class="btn block" data-a="afinar" style="margin-top:12px">
        ${raw(icon('chispa'))} Auditar otra vez</button>
      <p class="tiny center" style="margin:7px 4px 0">Con los cambios que acabas de aplicar
      delante, el dictamen cambia. Cada pulsación es una llamada a la IA.</p>`;
  }

  function resultado(prog) {
    const series = prog.sesiones.reduce(function (n, s) {
      return n + s.ejercicios.reduce(function (m, e) { return m + e.sets; }, 0);
    }, 0);

    return html`
      <div class="stats" style="margin-top:16px">
        <div class="stat"><b>${prog.sesiones.length}</b><span>Días</span></div>
        <div class="stat"><b>${series}</b><span>Series semana</span></div>
        <div class="stat"><b>RPE ${prog.rpe}</b><span>Esfuerzo tope</span></div>
      </div>

      <div class="list-title">Por qué este plan</div>
      <p class="tiny" style="margin:-4px 4px 10px">${!prog.porIA && !prog.deRutinas && est.falloIA
        ? 'Ojo: esto lo ha montado la calculadora porque la IA ha fallado. No es el plan ' +
          'que pediste.'
        : prog.deRutinas
        ? 'Este es tu plan guardado, tal y como está ahora. Abajo puedes pedirle al ' +
          'entrenador que lo audite; lo que apliques se guarda sobre estas mismas rutinas.'
        : prog.porIA
          ? 'Lo ha montado la IA leyendo todo lo que la app sabe de ti, y ha elegido cada ' +
            'ejercicio del catálogo. Abajo puedes pedirle además que se lo lea como ' +
            'auditor, que es otra cosa.'
          : 'Esto lo calcula la app con tus datos, sin pedirle nada a nadie: por eso ' +
            'funciona sin conexión y sin clave. La lectura de un entrenador, que es otra ' +
            'cosa, está justo debajo.'}</p>
      <div class="card">
        ${raw(prog.razones.map(function (t, i) {
          return '<div class="razon"><span class="rt-idx">' + (i + 1) + '</span><p>' +
            esc(t) + '</p></div>';
        }).join(''))}
      </div>

      ${raw(prog.porIA && prog.descartados && prog.descartados.length ? html`
        <div class="card">
          <b>Lo que no le dejé poner</b>
          <p class="tiny" style="margin:6px 0 0">Propuso esto y no entró, así que el hueco lo
          completé yo: ${prog.descartados.join('; ')}.</p>
        </div>` : '')}

      ${raw(bloqueIA())}

      ${raw(prog.avisos.length ? html`
        <div class="list-title">Lo que evito por tus limitaciones</div>
        <div class="card aviso-seguridad">
          ${raw(prog.avisos.map(function (t) {
            return '<p style="margin:0 0 8px">' + esc(t) + '</p>';
          }).join(''))}
          <p class="tiny" style="margin:6px 0 0">Con una lesión diagnosticada, esto no
          sustituye a tu fisio: enséñale el plan antes de empezar.</p>
        </div>` : '')}

      ${raw(barraVolumen(prog))}

      <div class="list-head">
        <span class="list-title">Tu semana</span>
        <button class="btn sm ghost" data-a="plegardias">${est.todoAbierto
          ? 'Plegar todo' : 'Abrir todo'}</button>
      </div>
      <div class="semana-plan">
        ${raw(prog.sesiones.map(function (s, i) { return tarjetaDia(s, i, prog); }).join(''))}
      </div>

      <div class="list-title">Cómo progresar</div>
      <p class="tiny" style="margin:-4px 4px 10px">Repetir el mismo peso cinco semanas no
      construye nada. Este es el bloque:</p>
      <div class="card">
        ${raw(prog.progresion.map(function (x) {
          return '<div class="fase-txt"><b>' + esc(x.semana) + '</b><p>' + esc(x.texto) + '</p></div>';
        }).join(''))}
      </div>

      ${raw(prog.cardio ? html`
        <div class="card">
          <b>Fuera del gimnasio</b>
          <p class="muted" style="margin:6px 0 0">${prog.cardio}</p>
        </div>` : '')}

      <div class="card" style="margin-top:16px">
        <label class="tiny">CÓMO QUIERES LLAMARLAS</label>
        <div class="tiny" style="margin:2px 0 0">Cada rutina se llamará «día · lo que pongas
        aquí». Déjalo vacío y uso el nombre de cada sesión.</div>
        <input id="prog-nombre" value="${est.nombre}" placeholder="Ej. Mi plan de otoño"
               style="margin:6px 0 0">
      </div>

      <div class="row" style="margin-top:12px">
        <button class="btn grow" data-a="otra">Otra propuesta</button>
        <button class="btn primary grow" data-a="guardar">${vivas().length
          ? 'Actualizar mis rutinas' : 'Guardar mis rutinas'}</button>
      </div>
      <p class="tiny center" style="margin-top:8px">${vivas().length
        ? 'Este plan ya está en tus rutinas: se reescriben esas ' + vivas().length +
          ', no se añaden otras. El resto de tus rutinas no se toca.'
        : 'Se crean ' + prog.sesiones.length + ' rutinas con sus días asignados. ' +
          'Lo que ya tengas no se borra.'}</p>`;
  }

  /* ---------- vista ---------- */

  V.programa = function () {
    const p = Perfil.datos();

    if (!Perfil.completo(p)) {
      return html`
        <h1>Tu programa</h1>
        <p class="muted">Para que el plan sea tuyo de verdad y no una plantilla, necesito
        cuatro datos: sexo, edad, altura y peso. Con eso ajusto el volumen, las repeticiones,
        los descansos y el esfuerzo al que llegas.</p>
        <div class="card center">
          <p class="muted" style="margin-bottom:12px">Te llevo un minuto rellenarlo.</p>
          <button class="btn primary block" data-a="editarperfil">Completar mi perfil</button>
        </div>
        <button class="btn ghost block sm" data-a="plangenerico" style="margin-top:10px">
          O crear un plan genérico sin perfil</button>`;
    }

    return html`
      <h1>Tu programa</h1>
      <p class="muted">Construido con tu perfil: sexo, edad, nivel, objetivo y limitaciones.
      No es una plantilla con tu nombre encima.</p>

      ${raw(misProgramasHTML())}
      ${raw(est.recuperado && est.prog ? html`
        <div class="card" style="border-color:var(--acc)">
          <b>Este es el plan que ya tenías</b>
          <p class="tiny" style="margin:6px 0 0">Se guardó en este dispositivo con la lectura
          del entrenador y los cambios que aplicaste. ${est.guardadas.length
            ? 'Ya lo pasaste a tus rutinas: si vuelves a guardar, se actualizan esas mismas ' +
              'y no se crean otras nuevas.'
            : 'Todavía no lo has pasado a tus rutinas.'} Toca <b>Rehacer el programa</b>
          aquí arriba si quieres montar otro desde cero.</p>
        </div>` : '')}
      ${raw(est.prog && est.prog.deRutinas ? '' : controles())}
      ${raw(est.prog ? resultado(est.prog) : '')}`;
  };

  V.programa.mount = function (root) {
    /* viene de Rutinas pidiendo la auditoría de un plan concreto */
    if (planPendiente) {
      const quien = planPendiente;
      planPendiente = null;
      const prog = planDesdeRutinas(quien);
      if (prog) {
        est.prog = prog;
        guardarEstado();
        if (IA.activa()) {
          setTimeout(function () { afinar(); }, 40);
        } else {
          render();
          UI.toast('Elige proveedor de IA y pon su clave');
          go('claves');
          return;
        }
      } else {
        UI.toast('Ese plan ya no está');
      }
    }

    bind(root, '[data-a=editarperfil]', function () { go('datos'); });
    bind(root, '[data-a=plangenerico]', function () { go('plan'); });

    bindAll(root, '[data-dia]', function (el) {
      const d = el.dataset.dia;
      const i = est.dias.indexOf(d);
      if (i === -1) {
        if (est.dias.length >= 6) { UI.toast('Seis días es el máximo recomendable'); return; }
        est.dias.push(d);
        est.dias.sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); });
      } else est.dias.splice(i, 1);
      el.classList.toggle('on', i === -1);
      const chip = root.querySelector('.chip.solid');
      if (chip) chip.textContent = est.dias.length + (est.dias.length === 1 ? ' día' : ' días');
    });

    bindAll(root, '[data-min]', function (el) {
      est.minutos = Number(el.dataset.min); guardarEstado(); render();
    });
    bindAll(root, '[data-obj]', function (el) {
      est.objetivo = el.dataset.obj; guardarEstado(); render();
    });
    bindAll(root, '[data-foco]', function (el) {
      est.foco = el.dataset.foco; guardarEstado(); render();
    });

    bind(root, '[data-a=crear]', crear);
    bind(root, '[data-a=crearia]', crearConIA);
    bind(root, '[data-a=irclaves]', function () { go('claves'); });
    bind(root, '[data-a=otra]', function () {
      /* «otra propuesta» rehace por donde vino: si el plan lo montó la IA, con IA */
      if (est.prog && est.prog.porIA) crearConIA(); else crear();
    });
    bindAll(root, '[data-abrirplan]', function (el) { abrirPlan(el.dataset.abrirplan); });

    /* Los dos campos libres se guardan al escribir: si no, cualquier repintado
       —tocar un día, cambiar el objetivo— se los llevaba por delante. */
    const molestias = root.querySelector('#pg-molestias');
    if (molestias) molestias.oninput = function () { est.molestias = molestias.value; };
    const notas = root.querySelector('#pg-notas');
    if (notas) notas.oninput = function () { est.notas = notas.value; };

    /* «Nuevo» tiene que dejar la pantalla en blanco: si abajo sigue colgando el
       plan de antes, parece que ya te ha generado algo sin haberlo pedido. */
    bind(root, '[data-a=irgenerar]', function () {
      const bajar = function () {
        const caja = document.querySelector('#generar');
        if (caja) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      if (!est.prog) { bajar(); return; }

      const sinGuardar = !vivas().length;
      const limpiar = function () {
        est.prog = null; est.ia = null; est.aplicados = []; est.guardadas = [];
        est.recuperado = false; est.abierto = {};
        guardarEstado();
        render();
        setTimeout(bajar, 60);
      };

      if (sinGuardar) {
        UI.confirm('Empezar uno nuevo',
          'El plan que tienes en pantalla no está en tus rutinas todavía. Si sigues, ' +
          'se pierde.', 'Empezar de cero', true).then(function (ok) { if (ok) limpiar(); });
        return;
      }
      limpiar();
    });
    bind(root, '[data-a=verplan]', function () {
      const caja = document.querySelector('.stats');
      if (caja) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    bindAll(root, '[data-entrenardia]', function (el) {
      const r = Store.routine(el.dataset.entrenardia);
      if (!r) { UI.toast('Esa rutina ya no está'); return; }
      Workout.start(r);
      go('entrenar');
    });

    bindAll(root, '[data-editardia]', function (el) { go('rutina', el.dataset.editardia); });

    bind(root, '[data-a=plegardias]', function () {
      est.todoAbierto = !est.todoAbierto;
      (est.prog ? est.prog.sesiones : []).forEach(function (x, i) {
        est.abierto[i] = est.todoAbierto;
      });
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    });

    bindAll(root, '[data-dia-abrir]', function (el) {
      const i = el.dataset.diaAbrir;
      /* el estado se lee de lo pintado: el primer día viene abierto y el resto
         no, así que un booleano suelto no basta para saber en qué iba */
      const caja = el.closest('.dia');
      est.abierto[i] = !(caja && caja.classList.contains('abierto'));
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    });

    bindAll(root, '[data-ver]', function (el) {
      const ex = Data.get(el.dataset.ver);
      if (ex) App.exerciseSheet(ex);
    });

    bind(root, '[data-a=guardar]', function () {
      const campo = root.querySelector('#prog-nombre');
      est.nombre = campo ? campo.value.trim() : '';
      const etiqueta = est.nombre || est.prog.nombreIA || '';

      /* Se emparejan por nombre de plan y día, no por los ids que recordara la
         sesión: así reescribe las de verdad aunque el plan se generara otro día
         o en otro móvil. */
      const yaHay = delMismoPlan(etiqueta);
      const seguir = function () {
        const rutinas = Programa.aRutinas(est.prog, est.nombre);
        const sobran = yaHay.slice();
        const ids = [];

        rutinas.forEach(function (r, i) {
          /* primero la que ocupa ese mismo día */
          let k = sobran.findIndex(function (x) {
            return (x.days || [])[0] === (r.days || [])[0];
          });
          /* si no la hay, la siguiente libre, para no dejar huérfanas */
          if (k === -1) k = sobran.length ? 0 : -1;
          if (k === -1 && est.guardadas[i] && Store.routine(est.guardadas[i])) {
            r.id = est.guardadas[i];
          } else if (k !== -1) {
            r.id = sobran[k].id;
            sobran.splice(k, 1);
          }
          ids.push(Store.saveRoutine(r).id);
        });

        /* lo que sobra del plan viejo se va: si no, el plan crece cada vez */
        sobran.forEach(function (x) { Store.deleteRoutine(x.id); });
        (est.guardadas || []).forEach(function (id) {
          if (ids.indexOf(id) === -1 && Store.routine(id)) Store.deleteRoutine(id);
        });

        est.guardadas = ids;
        est.recuperado = true;
        guardarEstado();

        UI.toast(yaHay.length
          ? ids.length + ' rutinas actualizadas'
          : ids.length + ' rutinas creadas con sus días');
        go('rutinas');
        Offline.precargarRutinas();
      };

      /* Reescribir rutinas que no se crearon en esta sesión no puede pasar en
         silencio: puede haberlas editado a mano desde entonces. */
      const deAntes = yaHay.filter(function (r) { return est.guardadas.indexOf(r.id) === -1; });
      if (deAntes.length) {
        UI.confirm('Ya tienes un plan llamado \u00ab' + etiqueta + '\u00bb',
          'Tiene ' + yaHay.length + (yaHay.length === 1 ? ' rutina' : ' rutinas') +
          '. Voy a reescribirlas con este plan y a borrar las que sobren, para que no ' +
          'se te dupliquen. Si quieres conservarlo, cancela y ponle otro nombre a este.',
          'Reescribir').then(function (ok) { if (ok) seguir(); });
        return;
      }
      seguir();
    });

    bindAll(root, '[data-a=afinar]', afinar);
    bindAll(root, '[data-cambio]', function (el) { aplicarCambio(Number(el.dataset.cambio)); });

    bindAll(root, '[data-nocambio]', function (el) {
      est.ia.cambios.splice(Number(el.dataset.nocambio), 1);
      guardarEstado();
      repintarQuieto();
    });

    bind(root, '[data-a=olvidaIA]', function () {
      UI.confirm('Descartar la lectura', 'Se borra lo que dijo el entrenador y la lista de ' +
        'cambios que quedan sin aplicar. Los que ya aplicaste siguen en el plan.',
        'Descartar', true).then(function (ok) {
        if (!ok) return;
        est.ia = null;
        est.aplicados = [];
        guardarEstado();
        render();
      });
    });
  };

  /* ---------- montar el plan con IA ----------
     Lo que devuelve la IA se mete en el MISMO objeto que fabrica la calculadora.
     Así toda la pantalla —la barra de volumen, las tarjetas por día, guardar
     como rutinas, la auditoría— sigue funcionando sin enterarse de quién lo
     montó, y si la IA devuelve algo que no cuadra queda la base buena debajo. */
  function fusionarIA(base, r) {
    const gear = Store.settings().gear;
    const claves = Programa.lesionesDe(Perfil.datos().lesiones);
    const descartados = [];

    const prohibido = function (ex) {
      const patron = Alt.patron(ex);
      return claves.some(function (k) {
        return (Programa.LESIONES[k].patronesFuera || []).indexOf(patron) !== -1;
      });
    };

    const sesiones = (r.sesiones || []).map(function (ses, i) {
      const dia = est.dias.indexOf(ses.dia) !== -1 ? ses.dia : est.dias[i] || est.dias[0];
      const vistos = {};
      const ejercicios = [];

      (ses.ejercicios || []).forEach(function (f) {
        const nombre = String(f.ejercicio || '').trim();
        const ex = Data.porNombreEs(nombre) ||
          (Data.search({ q: nombre, gear: gear }) || [])[0];
        if (!ex) { descartados.push(nombre); return; }
        if (vistos[ex.id]) return;
        if (prohibido(ex)) { descartados.push(ex.nameEs + ' (tus limitaciones)'); return; }
        vistos[ex.id] = true;

        const sets = Math.min(8, Math.max(1, Number(f.series) || 3));
        const rest = Math.min(300, Math.max(20, Number(f.descanso) || 90));
        ejercicios.push({
          exId: ex.id,
          patron: Alt.patron(ex),
          musculo: (ex.primaryMuscles || [])[0] || 'abdominals',
          rol: ejercicios.length < 2 ? 'principal' : 'accesorio',
          sets: sets,
          reps: Math.min(90, Math.max(1, Number(f.reps) || 10)),
          weight: 0,
          rest: rest,
          note: f.porque || ''
        });
      });

      /* Si al filtrar se ha quedado corta —un ejercicio inventado, otro que
         choca con una lesión— se completa con los de la calculadora para ese
         mismo día. Perder un día entero de entrenamiento porque sobraba un
         nombre es peor que cualquier plan. */
      if (ejercicios.length < Store.MINIMO_EJERCICIOS) {
        const deLaBase = (base.sesiones.find(function (x) { return x.dia === dia; }) ||
          base.sesiones[i] || {}).ejercicios || [];
        deLaBase.forEach(function (e) {
          if (ejercicios.length >= Store.MINIMO_EJERCICIOS) return;
          if (vistos[e.exId]) return;
          const ex = Data.get(e.exId);
          if (!ex || prohibido(ex)) return;
          vistos[e.exId] = true;
          ejercicios.push(Object.assign({}, e, {
            note: 'Lo añade la app para completar el día.'
          }));
        });
      }
      if (ejercicios.length < Store.MINIMO_EJERCICIOS) return null;

      const minutos = ejercicios.reduce(function (n, e) {
        return n + Math.round(e.sets * (e.rest + 35) / 60);
      }, 0);

      return {
        dia: dia,
        nombre: UI.diaLargo(dia) + ' \u00b7 ' + (ses.nombre || 'Sesión'),
        plantilla: ses.nombre || '',
        ejercicios: ejercicios,
        minutos: minutos + base.calentamiento
      };
    }).filter(Boolean);

    /* si no ha salido ni una sesión aprovechable, se queda la de la calculadora */
    if (!sesiones.length) return null;

    const prog = Object.assign({}, base);
    prog.sesiones = sesiones;
    prog.porIA = true;
    prog.nombreIA = r.nombre || '';
    prog.descartados = descartados;

    if (r.razones && r.razones.length) prog.razones = r.razones.slice(0, 8);
    if (r.progresion && r.progresion.length) {
      prog.progresion = r.progresion.map(function (x) {
        return { semana: x.semana || '', texto: x.texto || '' };
      });
    }
    if (r.cardio) prog.cardio = r.cardio;
    if (r.aviso) prog.avisos = [r.aviso].concat(base.avisos || []);

    Programa.revolumen(prog);
    return prog;
  }

  function crearConIA() {
    if (!est.dias.length) { UI.toast('Elige al menos un día de entrenamiento'); return; }
    if (!IA.activa()) { go('claves'); UI.toast('Elige proveedor de IA y pon su clave'); return; }

    /* la calculadora primero: garantiza una forma válida y es la red si algo falla */
    const base = Programa.crear({
      dias: est.dias, minutos: est.minutos, objetivo: objetivoActual(),
      foco: est.foco, gear: Store.settings().gear, variante: est.variante
    });

    est.cargandoPlan = true;
    est.falloIA = '';
    render();

    IA.crearPrograma({
      dias: est.dias, minutos: est.minutos, objetivo: objetivoActual(), foco: est.foco,
      gear: Store.settings().gear, objetivoSeries: base.objetivoSeries,
      lesiones: base.lesiones, musculos: Object.keys(base.volumen || {}),
      molestias: est.molestias, notas: est.notas
    }).then(function (r) {
      const prog = fusionarIA(base, r);
      if (!prog) {
        UI.toast('La IA no devolvió un plan aprovechable. Te dejo el de la calculadora.');
        est.prog = base;
      } else {
        est.prog = prog;
        const faltan = est.dias.length - prog.sesiones.length;
        if (faltan > 0) {
          UI.toast('Plan listo, pero solo salieron ' + prog.sesiones.length + ' de los ' +
            est.dias.length + ' días. Prueba a generarlo otra vez.');
        } else if (prog.descartados.length) {
          UI.toast('Plan listo. Descarté ' + prog.descartados.length + ' ejercicio' +
            (prog.descartados.length === 1 ? '' : 's') + ' que no encajaban y completé el hueco.');
        } else {
          UI.toast('Plan montado a tu medida');
        }
      }
    }).catch(function (e) {
      /* Antes esto colaba el plan de la calculadora con un aviso que se iba en
         dos segundos: pulsabas «generar con IA», la llamada fallaba en medio
         segundo y te quedabas con un plan que parecía de la IA y no lo era.
         Ahora el fallo se queda escrito en la pantalla hasta que se resuelva. */
      est.falloIA = e.message;
      est.prog = base;
    }).then(function () {
      est.cargandoPlan = false;
      est.ia = null;
      est.aplicados = [];
      est.guardadas = [];
      est.recuperado = false;
      est.abierto = {};
      guardarEstado();
      render();
      const caja = document.querySelector('.stats');
      if (caja) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function crear() {
    if (!est.dias.length) { UI.toast('Elige al menos un día de entrenamiento'); return; }
    /* cada vez que se pide, otra variante: antes devolvía el plan idéntico */
    est.variante = (est.variante || 0) + 1;
    est.prog = Programa.crear({
      dias: est.dias, minutos: est.minutos, objetivo: objetivoActual(),
      foco: est.foco, gear: Store.settings().gear, variante: est.variante
    });
    est.ia = null;
    est.aplicados = [];
    est.guardadas = [];
    est.recuperado = false;
    est.abierto = {};
    guardarEstado();
    render();
    const caja = document.querySelector('.stats');
    if (caja) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function afinar() {
    if (!IA.activa()) { go('claves'); UI.toast('Elige proveedor de IA y pon su clave'); return; }
    est.cargandoIA = true;
    render();
    IA.afinarPrograma(est.prog)
      .then(function (r) { est.ia = r; })
      .catch(function (e) { UI.toast(e.message); })
      .then(function () { est.cargandoIA = false; guardarEstado(); render(); });
  }

  /* ---------- aplicar lo que propone el entrenador ----------
     Un cambio solo entra si el ejercicio existe de verdad en el catálogo, lo
     permite el material y no choca con las limitaciones. La IA se inventa
     nombres de vez en cuando y propone cosas que la persona no puede hacer:
     validar aquí es lo que separa una sugerencia de un destrozo. */

  /* Primero por nombre exacto: a la IA se le da la lista de la que puede
     elegir, así que lo normal es que acierte. El buscador queda de red por si
     se le escapa una tilde o le sobra una palabra, y entonces se avisa de con
     qué se ha quedado, que no es lo mismo que pidió. */
  function delCatalogo(nombre) {
    const exacto = Data.porNombreEs(nombre);
    if (exacto) return exacto;
    const cand = Data.search({ q: String(nombre || ''), gear: Store.settings().gear });
    return cand[0] || null;
  }

  function chocaConLesiones(ex) {
    const claves = Programa.lesionesDe(Perfil.datos().lesiones);
    const patron = Alt.patron(ex);
    return claves.some(function (k) {
      return (Programa.LESIONES[k].patronesFuera || []).indexOf(patron) !== -1;
    });
  }

  /* Busca en el plan el ejercicio que la IA nombra. Primero exacto; si no,
     por coincidencia parcial, que los nombres los repite de memoria y a veces
     se deja media palabra. */
  function enElPlan(nombre) {
    const buscado = I18N.norm(String(nombre || ''));
    if (!buscado) return null;
    let exacto = null;
    let parecido = null;

    est.prog.sesiones.forEach(function (ses) {
      ses.ejercicios.forEach(function (e, i) {
        const ex = Data.get(e.exId);
        if (!ex) return;
        const n = I18N.norm(ex.nameEs);
        if (!exacto && (n === buscado || ex.id === nombre)) exacto = { ses: ses, i: i, ex: ex };
        if (!parecido && (n.indexOf(buscado) !== -1 || buscado.indexOf(n) !== -1)) {
          parecido = { ses: ses, i: i, ex: ex };
        }
      });
    });
    return exacto || parecido;
  }

  /* Los minutos de la sesión dejan de valer en cuanto se mete o se saca algo.
     Es una cuenta gruesa —series por descanso más el trabajo— pero es la misma
     que hace programa.js y evita que el plan diga 60 min y dure 75. */
  function minutosDe(ejercicio) {
    return Math.round(ejercicio.sets * ((ejercicio.rest || 75) + 35) / 60);
  }

  /* Repintar devuelve la pantalla arriba del todo, y la lista de cambios está
     al final: aplicar uno significaba volver a bajar a mano cada vez. */
  function repintarQuieto() {
    const pos = window.scrollY;
    render();
    window.scrollTo(0, pos);
  }

  function apuntarAplicado(texto) {
    est.aplicados.push(texto);
    Programa.revolumen(est.prog);
    guardarEstado();
    repintarQuieto();
    UI.toast(texto);
  }

  function aplicarCambio(i) {
    const c = (est.ia.cambios || [])[i];
    if (!c) return;
    const accion = accionDe(c);

    if (accion === 'quitar') {
      const sitio = enElPlan(c.quitar);
      if (!sitio) { UI.toast('Ya no está «' + (c.quitar || '') + '» en el plan.'); return; }
      if (sitio.ses.ejercicios.length <= 2) {
        UI.toast('Ese día se quedaría en un ejercicio. No lo quito.');
        return;
      }
      sitio.ses.minutos = Math.max(15, sitio.ses.minutos -
        minutosDe(sitio.ses.ejercicios[sitio.i]));
      sitio.ses.ejercicios.splice(sitio.i, 1);
      est.ia.cambios.splice(i, 1);
      apuntarAplicado(sitio.ex.nameEs + ': fuera de ' + sitio.ses.nombre);
      return;
    }

    const nuevo = delCatalogo(c.poner);
    const aOjo = nuevo && I18N.norm(nuevo.nameEs) !== I18N.norm(String(c.poner || ''));
    if (!nuevo) {
      UI.toast('No encuentro «' + (c.poner || '') + '» en el catálogo. Cambio descartado.');
      est.ia.cambios.splice(i, 1);
      guardarEstado();
      repintarQuieto();
      return;
    }
    if (chocaConLesiones(nuevo)) {
      UI.toast('«' + nuevo.nameEs + '» no encaja con tus limitaciones. Cambio descartado.');
      est.ia.cambios.splice(i, 1);
      guardarEstado();
      repintarQuieto();
      return;
    }

    if (accion === 'anadir') {
      const n = Number(c.dia);
      const destino = (n > 0 && est.prog.sesiones[n - 1]) || est.prog.sesiones
        .slice()
        .sort(function (a, b) { return a.ejercicios.length - b.ejercicios.length; })[0];
      if (!destino) return;

      const repetido = destino.ejercicios.some(function (e) { return e.exId === nuevo.id; });
      if (repetido) {
        UI.toast('«' + nuevo.nameEs + '» ya está en ese día.');
        est.ia.cambios.splice(i, 1);
        guardarEstado();
        repintarQuieto();
        return;
      }

      const modelo = destino.ejercicios[destino.ejercicios.length - 1] || {};
      const entra = {
        exId: nuevo.id,
        patron: Alt.patron(nuevo),
        musculo: (nuevo.primaryMuscles || [])[0] || modelo.musculo || 'abdominals',
        rol: 'accesorio',
        sets: Math.min(6, Number(c.series) || modelo.sets || 3),
        reps: Math.min(60, Number(c.reps) || modelo.reps || 12),
        weight: 0,
        rest: modelo.rest || 75,
        note: 'Lo mete el entrenador: ' + (c.porque || '')
      };
      destino.ejercicios.push(entra);
      destino.minutos += minutosDe(entra);
      est.ia.cambios.splice(i, 1);
      apuntarAplicado(nuevo.nameEs + ': entra en ' + destino.nombre);
      if (aOjo) UI.toast('Pedía «' + c.poner + '», que no está en el catálogo. He puesto ' +
        nuevo.nameEs + '.');
      return;
    }

    /* sustituir */
    const sitio = enElPlan(c.quitar);
    if (!sitio) { UI.toast('Ya no está «' + (c.quitar || '') + '» en el plan.'); return; }
    const antes = sitio.ex.nameEs;
    const e = sitio.ses.ejercicios[sitio.i];
    e.exId = nuevo.id;
    e.patron = Alt.patron(nuevo);
    e.musculo = (nuevo.primaryMuscles || [])[0] || e.musculo;
    e.note = 'Cambiado a propuesta del entrenador: ' + (c.porque || '');
    est.ia.cambios.splice(i, 1);
    apuntarAplicado(nuevo.nameEs + ' en lugar de ' + antes);
    if (aOjo) UI.toast('Pedía «' + c.poner + '», que no está en el catálogo. He puesto ' +
      nuevo.nameEs + '.');
  }
})(window);
