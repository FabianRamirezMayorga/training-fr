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
    creando: false,
    ordenes: '',
    gear: '',
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

  /* El sitio donde va a entrenar ESTE plan. Por defecto el de los ajustes, pero
     se puede cambiar aquí sin tocar el global: montar un plan para las vacaciones
     no debería cambiarle el catálogo de toda la app. */
  /* Al irse de la pantalla, el plan abierto deja de estar «abierto»: sigue
     guardado, pero al volver se ve otra vez la lista y no lo que se tocó hace
     media hora. Lo que aún no está en rutinas se respeta, que si no se pierde. */
  window.addEventListener('hashchange', function () {
    if (location.hash.indexOf('programa') !== -1) return;
    if (!est.prog || est.recuperado) return;
    if (!vivas().length) return;
    est.recuperado = true;
    est.creando = false;
    guardarEstado();
  });

  /* Se arma al leerlo y no en una constante: los tres niveles tienen que salir
     en el idioma que esté puesto ahora, no en el que había al cargar. */
  function nivelesDe() {
    return { beginner: T('Principiante'), intermediate: T('Intermedio'),
      expert: T('Avanzado') };
  }

  function gearActual() {
    const g = est.gear || Store.settings().gear || 'gym';
    /* «Ver todo» es un filtro para curiosear el catálogo, no un sitio donde se
       entrena: con ese ajuste no se marcaba ninguna opción y el plan salía con
       el catálogo entero sin que nadie lo hubiera pedido. */
    return (g === 'todo' || !Data.GEAR[g]) ? 'gym' : g;
  }

  function objetivoActual() {
    if (est.objetivo) return est.objetivo;
    const p = Perfil.datos();
    return Programa.OBJETIVOS[p.objetivo] ? p.objetivo : 'mantener';
  }

  function focoActual() {
    return FOCOS.filter(function (f) { return f.id === est.foco; })[0] || FOCOS[0];
  }

  /* Los cinco saltos del mando. Fuera de esta lista, la duración la escribió él
     y hay que enseñarla en el lápiz, que si no no se ve por ninguna parte. */
  const MINUTOS = [30, 45, 60, 75, 90];
  function minutosAMano() { return MINUTOS.indexOf(est.minutos) === -1; }

  /* Escribir los minutos a mano. Con límites y no con un campo libre: media
     hora es el suelo por debajo del cual no hay plan que repartir, y tres horas
     el techo que ningún generador va a llenar con algo sensato. */
  function pedirMinutos() {
    UI.modal(html`
      <h2>${T('Cuánto dura cada sesión')}</h2>
      <p class="muted" style="margin-top:0">${T('En minutos, entre 20 y 180.')}</p>
      <input id="pg-min" type="number" inputmode="numeric" min="20" max="180" step="5"
             value="${est.minutos}">
      <button class="btn primary block" id="pg-min-ok" style="margin-top:14px">
        ${T('Vale')}</button>`,
      function (el) {
        const campo = el.querySelector('#pg-min');
        setTimeout(function () { campo.focus(); campo.select(); }, 80);
        const guardar = function () {
          const n = Math.round(Number(campo.value) || 0);
          if (!n) { UI.closeModal(); return; }
          est.minutos = Math.min(180, Math.max(20, n));
          guardarEstado();
          UI.closeModal();
          const pos = window.scrollY;
          render();
          window.scrollTo(0, pos);
        };
        el.querySelector('#pg-min-ok').onclick = guardar;
        campo.onkeydown = function (ev) { if (ev.key === 'Enter') guardar(); };
      });
  }

  /* Una opción de una lista de una sola elección, con su explicación debajo si
     la tiene. La misma pieza que la hoja de filtrar ejercicios: aquí eran
     píldoras y «Perder grasa sin perder músculo» ocupaba una burbuja de dos
     renglones, con lo que el paso entero se leía como un montón de globos.

     La explicación va en cada fila y no al pie del grupo: al pie solo salía la
     del elegido, así que comparar dos objetivos era tocarlos por turnos. */
  function opcion(attr, valor, texto, activo, sub) {
    return '<button class="filtro-op' + (activo ? ' on' : '') + '" data-' + attr + '="' +
      esc(valor) + '"><span class="grow"><span class="op-et">' + esc(texto) + '</span>' +
      (sub ? '<span class="op-sub">' + esc(sub) + '</span>' : '') + '</span>' +
      '<span class="filtro-tick">' + icon('check') + '</span></button>';
  }

  /* ---------- lo que la app sabe de ti ---------- */
  function fichaPerfil(p) {
    const nivel = nivelesDe();
    const lesiones = Programa.lesionesDe(p.lesiones)
      .map(function (k) { return T(Programa.LESIONES[k].label); });

    return html`
      <div class="card">
        <div class="row between" style="align-items:flex-start">
          <div class="grow">
            <div class="tiny" style="color:var(--acc)">${T('TU PERFIL')}</div>
            <div class="row wrap" style="gap:6px;margin-top:8px">
              <span class="chip">${p.sexo === 'mujer' ? T('Mujer') : T('Hombre')}</span>
              <span class="chip">${Tn('{n} años', { n: p.edad })}</span>
              <span class="chip">${p.peso} kg · ${p.altura} cm</span>
              <span class="chip">${nivel[p.experiencia] || T('Intermedio')}</span>
              <span class="chip">${Tn('Duerme {h} h', { h: p.sueño })}</span>
              ${raw(lesiones.map(function (l) {
                return '<span class="chip solid">' + esc(l) + '</span>';
              }).join(''))}
            </div>
          </div>
          <button class="btn sm" data-a="editarperfil">${T('Editar')}</button>
        </div>
        ${raw(lesiones.length ? html`
          <p class="tiny" style="margin:10px 0 0">${raw(Tn('De lo que has escrito en ' +
          'limitaciones he entendido: {lista}. Abajo verás qué se evita por eso.',
          { lista: '<b>' + esc(lesiones.join(', ')) + '</b>' }))}</p>`
        : html`
          <p class="tiny" style="margin:10px 0 0">${T('Sin limitaciones apuntadas. Si tienes ' +
          'alguna molestia, escríbela en el perfil y el plan la esquiva.')}</p>`)}
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
  /* ---------- comparar los planes ----------
     Con varios guardados y todos aprobando la revisión, no hay forma de elegir:
     la revisión busca defectos, y no tener defectos no es lo mismo que ser el
     mejor. Aquí se ven los números que de verdad los separan —series por
     músculo, en cuántos días se reparte cada uno, cómo de parejas son las
     sesiones— y se dice cuál seguir. */
  function compararSheet() {
    const planes = {};
    const orden = [];
    Store.routines().forEach(function (r) {
      if (!(r.days || []).length || !(r.exercises || []).length) return;
      const k = App.nombreRutina(r);
      if (!planes[k]) { planes[k] = []; orden.push(k); }
      planes[k].push(r);
    });
    if (orden.length < 2) { UI.toast(T('Necesitas al menos dos planes para comparar')); return; }

    const progs = orden.map(function (k) {
      const suyas = planes[k].slice().sort(function (a, b) {
        return DIAS.indexOf((a.days || [])[0]) - DIAS.indexOf((b.days || [])[0]);
      });
      return {
        nombre: k, gear: Store.settings().gear,
        sesiones: suyas.map(function (r) {
          return { nombre: App.tituloRutina(r), ejercicios: r.exercises };
        })
      };
    });

    const filas = Revisar.comparar(progs);
    const ganador = filas[0];

    /* Los músculos que se enseñan: los que algún plan entrena de verdad */
    const musculos = Revisar.GRANDES.filter(function (m) {
      return filas.some(function (f) { return (f.directas[m] || 0) > 0; });
    });

    UI.modal(html`
      <h2>${T('Cuál seguir')}</h2>
      <p class="muted">${T('Los cuatro pueden pasar la revisión y no valer lo mismo: la ' +
        'revisión busca fallos, y no tener fallos no es lo mismo que ser el mejor. ' +
        'Estos son los números que los separan.')}</p>

      <div class="card" style="border-color:var(--acc)">
        <div class="row" style="gap:11px;align-items:center">
          <div style="flex:none;font-size:1.7rem;font-weight:700;line-height:1;
                      color:var(--acc)">${ganador.nota}<span
               style="font-size:.8rem;color:var(--dim2)">/10</span></div>
          <div class="grow">
            <b>${ganador.nombre}</b>
            <div class="tiny" style="margin-top:2px">${T('Es el que yo seguiría')}</div>
          </div>
        </div>
        <p class="tiny" style="margin:9px 0 0">${Revisar.porQueGana(filas)}</p>
      </div>

      <div class="tiny" style="margin:15px 0 6px">${T('CÓMO QUEDAN')}</div>
      <div class="tabla-scroll">
        <table class="comparativa">
          <thead><tr><th>${T('Plan')}</th><th>${T('Nota')}</th><th>${T('Días')}</th>
            <th>${T('Ejer.')}</th><th>${T('Series')}</th><th>${T('Repartidos')}</th>
            <th>${T('Cortos')}</th></tr></thead>
          <tbody>
            ${raw(filas.map(function (f, i) {
              return '<tr' + (i === 0 ? ' class="gana"' : '') + '>' +
                '<td>' + esc(f.nombre) + '</td>' +
                '<td><b>' + f.nota + '</b></td>' +
                '<td>' + f.dias + '</td>' +
                '<td>' + f.minEjercicios + '-' + f.maxEjercicios + '</td>' +
                '<td>' + f.series + '</td>' +
                '<td>' + f.dosDias + '</td>' +
                '<td>' + (f.cortos || '—') + '</td></tr>';
            }).join(''))}
          </tbody>
        </table>
      </div>
      <p class="tiny" style="margin:7px 0 0">${raw(Tn('{a}: del día más corto al más ' +
        'largo. {b}: músculos que entrenas dos días o más a la semana, que rinden más ' +
        'que los de un solo día. {c}: músculos por debajo de ocho series semanales.',
        { a: '<b>' + esc(T('Ejer.')) + '</b>', b: '<b>' + esc(T('Repartidos')) + '</b>',
          c: '<b>' + esc(T('Cortos')) + '</b>' }))}</p>

      <div class="tiny" style="margin:15px 0 6px">${T('SERIES POR MÚSCULO A LA SEMANA')}</div>
      <div class="tabla-scroll">
        <table class="comparativa">
          <thead><tr><th>${T('Músculo')}</th>
            ${raw(filas.map(function (f) {
              return '<th>' + esc(f.nombre.replace(/^Fabian ?/, '') || f.nombre) + '</th>';
            }).join(''))}</tr></thead>
          <tbody>
            ${raw(musculos.map(function (m) {
              return '<tr><td>' + esc(I18N.muscle(m)) + '</td>' +
                filas.map(function (f) {
                  const n = f.directas[m] || 0;
                  const veces = f.frecuencia[m] || 0;
                  const flojo = n > 0 && n < 8;
                  return '<td' + (flojo ? ' class="flojo"' : '') + '>' +
                    (n || '—') + (veces ? '<span class="tiny"> · x' + veces + '</span>' : '') +
                    '</td>';
                }).join('') + '</tr>';
            }).join(''))}
          </tbody>
        </table>
      </div>
      <p class="tiny" style="margin:7px 0 0">${raw(T('El <b>x2</b> es en cuántos días ' +
        'distintos entrenas ese músculo. En rojo, lo que se queda por debajo de ocho ' +
        'series.'))}</p>

      <button class="btn primary block" id="cmp-abrir" style="margin-top:16px">
        ${Tn('Abrir «{que}»', { que: ganador.nombre })}</button>
      <button class="btn ghost block" id="cmp-no" style="margin-top:8px">${T('Cerrar')}</button>`,
      function (el) {
        el.querySelector('#cmp-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#cmp-abrir').onclick = function () {
          UI.closeModal();
          abrirPlan(ganador.nombre);
        };
      });
  }

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
    /* Se guardan en español porque son la clave: resultado() las pasa por T(). */

    Programa.revolumen(prog);

    est.dias = dias;
    est.nombre = nombre;
    est.guardadas = suyas.map(function (r) { return r.id; });
    est.recuperado = false;
    est.creando = false;
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

  /* Lo mismo pero sin pedir nada a la IA: abrir el plan para verlo y tocarlo. */
  let planParaVer = null;

  V.verPlan = function (nombre) {
    planParaVer = nombre;
    go('programa');
  };

  function abrirPlan(nombre) {
    const prog = planDesdeRutinas(nombre);
    if (!prog) { UI.toast(T('Ese plan ya no está')); return; }
    est.prog = prog;
    guardarEstado();
    render();
    const caja = document.querySelector('.stats');
    if (caja) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Entrar en la pantalla no es pedir nada: al abrirla solo se listan los planes
     y el botón de crear. El plan de la sesión anterior se recupera igual —sigue
     guardado— pero no se despliega solo; se abre tocándolo. Lo único que sí se
     enseña sin pedirlo es un plan recién generado que aún no está en rutinas,
     porque si no se perdería. */
  /* El asistente solo aparece cuando se ha pedido crear algo. Estaba siempre
     desplegado debajo de la lista de planes, así que la pantalla parecía estar a
     medio camino de generar uno sin que nadie lo hubiera pedido. Si no hay
     ningún plan todavía sí se abre solo: no habría nada más que hacer. */
  function hayPlanes() {
    return Store.routines().some(function (r) { return (r.days || []).length; });
  }

  function mostrarAsistente() {
    if (mostrandoPlan()) return !est.prog.deRutinas;
    if (est.creando) return true;
    return !hayPlanes();
  }

  function mostrandoPlan() {
    if (!est.prog) return false;
    if (!est.recuperado) return true;
    return !vivas().length;
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
        <span class="list-title">${T('Lo que ya tienes')}</span>
        <button class="btn sm primary" data-a="irgenerar">${raw(icon('plus'))} ${T('Nuevo')}</button>
      </div>
      ${raw(sinGuardar ? html`
        <div class="card" style="border-color:var(--acc)">
          <div class="row between" style="align-items:flex-start">
            <div class="grow">
              <b>${est.prog.nombreIA || T('Plan recién montado')}</b>
              <div class="tiny" style="margin-top:2px">${Tp(est.prog.sesiones.length, '{n} sesión', '{n} sesiones')}
                \u00b7 ${est.prog.porIA ? T('montado con IA') : T('montado con la calculadora')}
                \u00b7 <span style="color:var(--warn)">${T('sin pasar a tus rutinas')}</span></div>
            </div>
            <button class="btn sm" data-a="verplan">${T('Ver')}</button>
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
              '<div class="list-row-sub">' +
              esc(Tp(suyas.length, '{n} rutina', '{n} rutinas') + ' · ' +
                Tp(n, '{n} ejercicio', '{n} ejercicios') + ' · ' +
                dias.map(function (d) { return UI.diaLargo(d).slice(0, 3); }).join(', ')) +
              '</div></div>' +
              '<span class="chevron">' + icon('chevron') + '</span></div>';
          }).join(''))}
        </div>
        ${raw(orden.length > 1 ? '<button class="btn block sm" data-a="comparar" ' +
          'style="margin-top:10px">' + icon('grafica') + ' ' +
          esc(Tn('Comparar mis {n} planes', { n: orden.length })) + '</button>' : '')}
        <p class="tiny" style="margin:8px 0 0">${T('Toca uno para abrirlo aquí: verás ' +
        'sus días y su reparto, podrás pedirle al entrenador que lo audite y aplicar lo ' +
        'que proponga sobre estas mismas rutinas.')}</p>` : '')}`;
  }

  /* `cabecera` va en la misma línea del título. Lo pide el botón de corregir
     los datos: al lado del texto se comían el ancho entre los dos y el perfil
     salía en tres renglones, y arriba está donde se busca lo que actúa sobre
     el paso entero. */
  function paso(n, titulo, cuerpo, nota, cabecera) {
    return html`
      <div class="card paso-plan">
        <div class="row" style="align-items:flex-start;gap:11px">
          <span class="paso-n">${n}</span>
          <div class="grow">
            <div class="row between" style="gap:10px;align-items:center">
              <b class="grow">${titulo}</b>
              ${raw(cabecera || '')}
            </div>
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
    const nivel = nivelesDe();

    /* Una línea y un botón. Este paso no enseña nada nuevo —son sus propios
       datos, se los sabe—: está para mirarlos de reojo antes de generar y
       corregir si algo baila. Cinco filas con su rótulo eran media pantalla
       para eso.

       En fila y separados por puntos se leen igual, porque cada valor lleva su
       unidad pegada: «34 años», «80 kg», «8 h de sueño». El único sin
       unidad es el nivel, y ese no la necesita. */
    const datos = html`
      <div class="dato-linea">
        <p>${raw([
          p.sexo === 'mujer' ? T('Mujer') : T('Hombre'),
          Tn('{n} años', { n: p.edad }),
          p.peso + ' kg',
          p.altura + ' cm',
          nivel[p.experiencia] || T('Intermedio'),
          Tn('{n} h de sueño', { n: p['sue\u00f1o'] })
        ].map(function (x) {
          /* Cada dato entero o nada: sin esto se partía en «178» y «cm» en dos
             renglones, y un número separado de su unidad no es un dato. */
          return '<span class="nowrap">' + esc(x) + '</span>';
        }).join(' · '))}</p>
      </div>`;

    const cuando = html`
      <div class="row between" style="margin:9px 0 7px">
        <span class="tiny">${T('QUÉ DÍAS')}</span>
        <span class="chip solid tiny-chip">${Tp(est.dias.length, '{n} día', '{n} días')}</span>
      </div>
      <!-- Una semana, no siete etiquetas. Con los nombres enteros se iban a dos
           renglones y se leían como siete botones sueltos; con las iniciales en
           fila se ve de un vistazo qué días caen y cuáles no, que es lo que uno
           está decidiendo. -->
      <div class="sem-pick">
        ${raw(DIAS.map(function (d) {
          return '<button class="sp-dia' + (est.dias.indexOf(d) !== -1 ? ' on' : '') +
            '" data-dia="' + d + '" aria-pressed="' +
            (est.dias.indexOf(d) !== -1 ? 'true' : 'false') + '">' +
            esc(UI.inicialDia(UI.DAY_NAMES.indexOf(d))) + '</button>';
        }).join(''))}
      </div>

      <!-- Plegado y con lo elegido a la derecha: contestada la pregunta, las
           otras tres opciones no pintan nada ocupando pantalla. Se cierra solo
           al elegir porque el formulario se repinta y nace cerrado. -->
      <details class="plegable-fino filtro-mas" data-mas="gear">
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="grow">${T('Dónde entrenas')}</span>
          <span class="tiny nowrap">${T(Data.GEAR[gearActual()].label)}</span>
        </summary>
        <div class="fino-cuerpo">
          <div class="filtro-lista">
            ${raw(Object.keys(Data.GEAR).filter(function (k) { return k !== 'todo'; })
              .map(function (k) {
                return opcion('gear', k, T(Data.GEAR[k].label), gearActual() === k,
                  T(Data.GEAR[k].note));
              }).join(''))}
          </div>
        </div>
      </details>
      <p class="tiny" style="margin:8px 0 0">${T('Solo vale para este plan; no cambia el catálogo del resto de la app.')}</p>

      <!-- Cinco opciones cortas: eso es un mando de una pieza, no cinco
           burbujas. Se ve la escala entera y dónde caes dentro de ella. -->
      <div class="tiny" style="margin:15px 0 7px">${T('MINUTOS POR SESIÓN')}</div>
      <!-- Las cinco de siempre y, al final, el lápiz para escribirla. Cinco
           saltos de quince minutos cubren casi todo, pero no a quien tiene
           cincuenta justos entre dos cosas, y redondear a cuarenta y cinco o a
           sesenta le cambia el plan. Cuando el número no es ninguno de los
           cinco, el lápiz lleva la cifra puesta: si no, no se vería en ningún
           sitio cuánto dura la sesión. -->
      <div class="segmento segmento-auto">
        ${raw([30, 45, 60, 75, 90].map(function (m) {
          return '<button class="' + (est.minutos === m ? 'on' : '') +
            '" data-min="' + m + '">' + m + '</button>';
        }).join(''))}
        <button class="seg-lapiz${raw(minutosAMano() ? ' on' : '')}" data-minmano="1"
                aria-label="${T('Escribir los minutos')}" title="${T('Escribir los minutos')}"
          >${raw(icon('edit'))}${raw(minutosAMano()
            ? '<span>' + esc(String(est.minutos)) + '</span>' : '')}</button>
      </div>`;

    const busca = html`
      <!-- Cada objetivo con lo que significa debajo. Antes el resumen salía
           suelto al pie del grupo y solo el del elegido: para comparar dos había
           que tocarlos por turnos y leer abajo cada vez. Y plegado tras elegir,
           que son cuatro explicaciones y ya has decidido. -->
      <details class="plegable-fino filtro-mas" data-mas="obj" style="margin-top:9px">
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="grow">${T('Tu objetivo')}</span>
          <span class="tiny nowrap">${T(Programa.OBJETIVOS[objetivoActual()].label)}</span>
        </summary>
        <div class="fino-cuerpo">
          <div class="filtro-lista">
            ${raw(Object.keys(Programa.OBJETIVOS).map(function (k) {
              return opcion('obj', k, T(Programa.OBJETIVOS[k].label), objetivoActual() === k,
                T(Programa.OBJETIVOS[k].resumen));
            }).join(''))}
          </div>
        </div>
      </details>

      <!-- Plegada: es opcional y casi siempre se queda en «Equilibrado», así
           que ocho zonas abiertas eran ocho renglones para no tocar nada. -->
      <details class="plegable-fino filtro-mas" data-mas="foco">
        <summary>
          <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
          <span class="grow">${T('Priorizar una zona')}</span>
          <span class="tiny nowrap">${T(focoActual().label)}</span>
        </summary>
        <div class="fino-cuerpo">
          <div class="filtro-lista">
            ${raw(FOCOS.map(function (f) {
              return opcion('foco', f.id, T(f.label), est.foco === f.id, '');
            }).join(''))}
          </div>
        </div>
      </details>`;

    /* Lo que no está en ningún campo y es justo lo que hace que un plan deje de
       parecer de plantilla: lo que le molesta hoy y lo que quiere o no quiere. */
    const extra = html`
      <label class="tiny" style="display:block;margin:9px 0 5px">
        ${T('¿ALGO TE MOLESTA AHORA MISMO?')}</label>
      <input id="pg-molestias" value="${est.molestias || ''}" autocomplete="off"
             placeholder="${T('Ej. la rodilla al bajar, el hombro por encima de la cabeza')}">
      <label class="tiny" style="display:block;margin:12px 0 5px">
        ${T('¿ALGO MÁS QUE DEBA SABER?')}</label>
      <textarea id="pg-notas" rows="3" placeholder="${T('Ej. quiero mejorar en dominadas; odio las sentadillas; los viernes voy con prisa; tengo una carrera en dos meses')}">${est.notas || ''}</textarea>

      <div class="hr"></div>
      <label class="tiny" style="display:block;margin:0 0 5px">
        ${T('¿LE PIDES ALGO CONCRETO AL ENTRENADOR?')}</label>
      <div class="tiny" style="margin:0 0 6px">${T('Lo de arriba es contexto sobre ti; esto ' +
        'son órdenes. Lo que escribas aquí manda sobre lo demás, siempre que no sea un ' +
        'riesgo ni choque con tus limitaciones.')}</div>
      <textarea id="pg-ordenes" rows="3" placeholder="${T('Ej. nada de peso muerto; empieza siempre por dominadas; que el viernes no pase de 40 minutos; mete abdomen todos los días')}">${est.ordenes || ''}</textarea>`;

    return html`
      <div class="list-head" id="generar">
        <span class="list-title">${T('Generar uno nuevo')}</span>
        ${raw(hayPlanes() ? '<button class="btn sm ghost" data-a="cancelarnuevo">' +
          icon('close') + ' ' + esc(T('Cancelar')) + '</button>' : '')}
      </div>

      ${raw(paso(1, T('Tus datos'), datos,
        T('Si algo no cuadra, corrígelo antes de generar.'),
        '<button class="btn sm" data-a="editarperfil">' + esc(T('Corregir')) + '</button>'))}
      ${raw(paso(2, T('¿Cuándo puedes entrenar?'), cuando,
        T('Ponlo realista: es mejor un plan de tres días que cumples que uno de cinco ' +
        'que no.')))}
      ${raw(paso(3, T('¿Qué buscas?'), busca, ''))}
      ${raw(paso(4, T('¿Algo que deba saber?'), extra,
        T('Esto es opcional, pero es lo que separa un plan tuyo de uno genérico. ' +
        'Solo lo aprovecha la IA; la calculadora no lee texto.')))}

      ${raw(est.falloIA ? html`
        <div class="card aviso-seguridad">
          <b>${T('La IA no ha podido montarlo')}</b>
          <p style="margin:7px 0 0;font-size:.9rem">${est.falloIA}</p>
          <p class="tiny" style="margin:9px 0 0">${raw(Tn('Lo que ves abajo lo ha montado ' +
          'la calculadora, no la IA. Arregla lo de arriba y vuelve a darle a {boton}.',
          { boton: '<b>' + esc(T('Generar rutina con IA')) + '</b>' }))}</p>
          <button class="btn block" data-a="irclaves" style="margin-top:11px">
            ${T('Revisar mi proveedor de IA')}</button>
        </div>` : '')}

      ${raw(est.cargandoPlan ? html`
        <div class="card center">
          <div class="spinner" style="margin:6px auto"></div>
          <p class="tiny" style="margin:8px 0 0">${T('Montándote la semana entera con ' +
          'tus datos delante… esto tarda unos segundos.')}</p>
        </div>`
      : html`
        <button class="btn primary block grande" data-a="crearia">
          ${raw(icon('chispa'))} ${T('Generar rutina con IA')}
        </button>
        <p class="tiny" style="margin:7px 0 0">${IA.activa()
          ? T('Lee todo lo anterior más lo que levantas, lo que llevas abandonado y los ' +
            'días que cumples de verdad, y elige los ejercicios uno a uno del catálogo.')
          : T('Necesita un proveedor de IA con su clave, en la bóveda de Ajustes.')}</p>

        <button class="btn block" data-a="crear" style="margin-top:10px">
          ${T('Generar rutina automáticamente')}
        </button>
        <p class="tiny" style="margin:7px 0 0">${T('Sin IA y al momento: reparte patrones ' +
        'de movimiento según tu edad, tu nivel y tu objetivo. Cada vez que la pidas ' +
        'cambia algunos ejercicios, pero no lee lo que hayas escrito arriba.')}</p>`)}`;
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
        return { id: id, label: r ? T(r.label) : id, series: Math.round(zonas[id] * 10) / 10 };
      })
      .filter(function (f) { return f.series > 0; })
      .sort(function (a, b) { return b.series - a.series; });

    if (!filas.length || !total) return '';

    const mayor = filas[0].series;

    return html`
      <div class="list-title">${T('De qué está hecha tu semana')}</div>
      <p class="tiny" style="margin:-4px 0 10px">${raw(Tn('Cómo se reparten las {series} ' +
      'del plan entre las zonas del cuerpo. Es la composición de lo que vas a hacer; si ' +
      'cumples o no con ello se ve en {donde}.',
      { series: '<b>' + esc(Tp(Math.round(total), '{n} serie', '{n} series')) + '</b>',
        donde: esc(T('Progreso')) }))}</p>

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
                <span class="comp-num">${UI.dec(f.series)}
                  <span class="comp-pct">${pct}%</span></span>
              </div>`;
          }).join(''))}
        </div>
        <p class="tiny" style="margin:11px 0 0">${filas.length === 1
          ? T('Todo el plan cae en una sola zona. Para una semana completa conviene ' +
            'repartir más.')
          : T('La cifra grande son series por semana; el porcentaje, qué parte del total ' +
            'se lleva esa zona.')}</p>
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
            <span class="dia-nom">${Programa.nombreSesion(s)}</span>
            <span class="dia-mus">${musculos || T('sin ejercicios')}</span>
          </span>
          <span class="dia-chev ${abierto ? 'abierto' : ''}">${raw(icon('chevron'))}</span>
        </button>

        <div class="dia-datos">
          <span>${raw(Tn('{n} ejercicios',
            { n: '<b>' + s.ejercicios.length + '</b>' }))}</span>
          <span>${raw(Tn('{n} series', { n: '<b>' + series + '</b>' }))}</span>
          <span>${raw(Tn('{n} min', { n: '<b>' + s.minutos + '</b>' }))}</span>
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
                    <i>·</i> ${Tn('{n}s de descanso', { n: e.rest })}</span>
                  ${raw(e.note
                    ? '<span class="ejer-nota">' + esc(T(e.note)) + '</span>' : '')}
                </span>
                <span class="ejer-mus">${I18N.muscle(e.musculo)}</span>
              </button>`;
          }).join(''))}

          ${raw(suya ? html`
            <div class="dia-pie">
              <button class="btn sm grow" data-editardia="${suya.id}">
                ${raw(icon('edit'))} ${T('Editar')}</button>
              <button class="btn sm primary grow" data-entrenardia="${suya.id}">
                ${raw(icon('play'))} ${T('Entrenar este día')}</button>
            </div>` : '')}
        </div>
      </div>`;
  }

  function colorNota(n) {
    if (n >= 8) return 'var(--acc)';
    if (n >= 6) return 'var(--warn)';
    return 'var(--bad)';
  }

  /* Se arma al leerla: si fuera una constante saldría en el idioma que hubiera
     puesto al cargar la app y no en el de ahora. */
  function etiquetaAccion(a) {
    const t = { cambiar: 'Sustituir', quitar: 'Quitar', anadir: 'Añadir',
      orden: 'Reordenar', descanso: 'Descanso', series: 'Series' };
    return t[a] ? T(t[a]) : a;
  }

  /* Cómo se lee un cambio antes de aplicarlo. Escrito como lo diría alguien de
     viva voz: qué se toca y a cambio de qué. */
  function textoCambio(c) {
    const acc = accionDe(c);
    if (acc === 'quitar') return html`<b>${c.quitar}</b>`;
    /* Los que llevan HTML dentro salen ya escapados con raw(); el de quitar es
       solo el nombre y puede seguir pasando por la plantilla. */
    if (acc === 'anadir') {
      const donde = Number(c.dia) > 0 && est.prog.sesiones[Number(c.dia) - 1]
        ? Tn(' en {donde}',
          { donde: Programa.nombreSesion(est.prog.sesiones[Number(c.dia) - 1]) }) : '';
      return html`<b>${c.poner}</b>${donde}`;
    }
    if (acc === 'orden') {
      return (c.lista || []).length
        ? Tn('Los básicos delante en {que}', { que: '<b>' + esc(c.sobre) + '</b>' })
        : Tn('{que} al {n}.º', { que: '<b>' + esc(c.sobre) + '</b>', n: c.posicion || 1 });
    }
    if (acc === 'descanso') {
      return Tn('{que} a {n}s de descanso',
        { que: '<b>' + esc(c.sobre) + '</b>', n: c.rest || 0 });
    }
    if (acc === 'series') {
      return Tn('{que} a {n} series',
        { que: '<b>' + esc(c.sobre) + '</b>', n: c.series || 0 });
    }
    return Tn('{nuevo} en lugar de {viejo}',
      { nuevo: '<b>' + esc(c.poner) + '</b>', viejo: esc(c.quitar) });
  }

  function accionDe(c) {
    const a = String(c.accion || '').toLowerCase().replace('ñ', 'n');
    /* Las que no cambian qué ejercicios hay, sino cómo se hacen. Sin
       reconocerlas caen en el «si no trae poner, es un quitar» del final. */
    if (a === 'orden') return 'orden';
    if (a === 'descanso') return 'descanso';
    if (a === 'series') return 'series';
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
        <p class="tiny" style="margin:8px 0 0">${T('El entrenador está auditando tu programa…')}</p></div>`;
    }
    const r = est.ia;
    if (!r) {
      return html`
        <button class="btn ${IA.activa() ? 'primary' : ''} block" data-a="afinar"
                style="margin-top:12px">
          ${raw(icon('chispa'))} ${T('Que un entrenador con IA audite tu plan')}
        </button>
        <p class="tiny" style="margin:7px 0 0">${IA.activa()
          ? T('No viene a darte la razón: le pedimos que le ponga nota, que señale lo que '
            + 'falla y que proponga quitar, meter o cambiar ejercicios. Lo que diga se '
            + 'queda guardado y se aplica de un toque.')
          : T('Necesita un proveedor de IA con su clave, en la bóveda de Ajustes. Sin eso '
            + 'el plan funciona igual, pero esta lectura no.')}</p>`;
    }

    const nota = Number(r.nota);
    const pendientes = (r.cambios || []).length;

    return html`
      <div class="list-head">
        <span class="list-title">${T('Lo que dice el entrenador')}</span>
        <button class="btn sm ghost" data-a="olvidaIA">${T('Descartar')}</button>
      </div>

      <div class="card">
        ${raw(nota > 0 ? html`
          <div class="row" style="gap:12px;align-items:center;margin-bottom:10px">
            <div style="flex:none;font-size:1.9rem;font-weight:700;line-height:1;
                        color:${raw(colorNota(nota))}">${nota}<span
                 style="font-size:.9rem;color:var(--dim2)">/10</span></div>
            <div class="tiny grow">${r.revision
              ? Tp(r.revision.hallazgos.length,
                  'Sale de {n} fallo encontrado al repasar el plan y de lo graves que son. ' +
                  'La calcula la app, no la IA: el mismo plan da siempre la misma nota.',
                  'Sale de {n} fallos encontrados al repasar el plan y de lo graves que son. ' +
                  'La calcula la app, no la IA: el mismo plan da siempre la misma nota.')
              : T('Nota de este plan tal y como está ahora.')}</div>
          </div>` : '')}
        <p style="margin:0 0 10px">${r.veredicto || ''}</p>
        ${raw((r.puntos || []).map(function (x) {
          return '<div class="error-item"><b>' + esc(x.titulo || '') + '</b><p>' +
            esc(x.detalle || '') + '</p></div>';
        }).join(''))}
      </div>

      ${raw(r.nutricion ? html`
        <div class="card">
          <h3 class="guia-h">${raw(icon('nutricion'))} ${T('De comida')}</h3>
          <p style="margin:0">${r.nutricion}</p>
        </div>` : '')}

      ${raw(!pendientes && est.aplicados.length === 0 ? html`
        <div class="card">
          <b>${T('No propone tocar ningún ejercicio')}</b>
          <p class="tiny" style="margin:6px 0 0">${T('Sus avisos son sobre hábitos ' +
          '—registrar entrenamientos, apuntar la comida— o sobre el reparto general, no ' +
          'sobre qué ejercicio cambiar. El plan, como lista de ejercicios, le parece ' +
          'defendible.')}</p>
        </div>` : '')}

      ${raw(pendientes ? html`
        <div class="card">
          <b>${T('Cambios que propone')}</b>
          <div class="stack" style="margin-top:9px">
            ${raw((r.cambios || []).map(function (c, i) {
              const acc = accionDe(c);
              return html`
                <div class="row between" style="gap:10px;align-items:flex-start">
                  <div class="grow">
                    <div style="font-size:.86rem">
                      <span class="chip tiny-chip">${etiquetaAccion(acc)}</span>
                      ${raw(textoCambio(c))}</div>
                    <div class="tiny">${c.porque || ''}</div>
                  </div>
                  <div class="row" style="gap:6px;flex:none">
                    <button class="btn sm" data-cambio="${i}">${T('Aplicar')}</button>
                    <button class="btn sm ghost" data-nocambio="${i}"
                            aria-label="${T('Descartar')}">✕</button>
                  </div>
                </div>`;
            }).join(''))}
          </div>
          <p class="tiny" style="margin:10px 0 0">${T('Cada cambio se comprueba antes de ' +
          'aplicarlo: si el ejercicio no existe, no cabe con tu material o choca con tus ' +
          'limitaciones, se descarta. Lo que apliques se guarda y viaja a tus rutinas al ' +
          'pulsar Guardar.')}</p>
        </div>` : '')}

      ${raw(est.aplicados.length ? html`
        <div class="card">
          <b>${T('Ya aplicado')}</b>
          <div class="stack" style="margin-top:8px">
            ${raw(est.aplicados.map(function (t) {
              return '<div class="tiny">✓ ' + esc(t) + '</div>';
            }).join(''))}
          </div>
          <p class="tiny" style="margin:9px 0 0">${raw(Tn('Estos cambios ya están en el ' +
          'plan de arriba. Se guardan con él; para que lleguen a tus rutinas pulsa {boton}.',
          { boton: '<b>' + esc(T('Guardar mis rutinas')) + '</b>' }))}</p>
        </div>` : '')}

      ${raw(r.consejo ? html`
        <div class="card destacado-clave">
          <h3 class="guia-h">${raw(icon('chispa'))} ${T('Si solo haces una cosa')}</h3>
          <p style="margin:0">${r.consejo}</p>
        </div>` : '')}

      <button class="btn block" data-a="afinar" style="margin-top:12px">
        ${raw(icon('chispa'))} ${T('Auditar otra vez')}</button>
      <p class="tiny" style="margin:7px 0 0">${r.deCache
        ? T('Este dictamen es el que ya se hizo para este plan: mientras no lo cambies, ' +
          'volver a pulsar enseña lo mismo en vez de inventarse otra cosa. En cuanto ' +
          'apliques un cambio, se rehace solo.')
        : T('Se guarda para este plan. Si aplicas cambios, la próxima auditoría será nueva.')}</p>
      ${raw(r.deCache ? html`
        <button class="btn ghost block sm" data-a="reafinar" style="margin-top:8px">
          ${T('Pedir otra redacción')}</button>
        <p class="tiny" style="margin:6px 0 0">${T('Los fallos serán los mismos —son ' +
        'cuentas sobre el plan—; lo que cambia es cómo están explicados. Gasta una ' +
        'llamada a la IA.')}</p>` : '')}`;
  }

  /* Un plan abierto tiene que poder cerrarse. Sin esto, tocar uno por error
     dejaba la pantalla ocupada y volver a entrar la encontraba igual, porque el
     plan se guarda entre sesiones. */
  function cabeceraPlan(prog) {
    const nombre = prog.deRutinas || prog.nombreIA || T('Plan sin guardar');
    return html`
      <div class="list-head" style="margin-top:18px">
        <span class="list-title" style="margin:0">${Tn('Viendo: {que}', { que: nombre })}</span>
        <button class="btn sm ghost" data-a="cerrarplan">${raw(icon('close'))} ${T('Cerrar')}</button>
      </div>`;
  }

  function resultado(prog) {
    const series = prog.sesiones.reduce(function (n, s) {
      return n + s.ejercicios.reduce(function (m, e) { return m + e.sets; }, 0);
    }, 0);

    return html`
      ${raw(cabeceraPlan(prog))}

      <div class="stats" style="margin-top:12px">
        <div class="stat"><b>${prog.sesiones.length}</b><span>${T('Días')}</span></div>
        <div class="stat"><b>${series}</b><span>${T('Series semana')}</span></div>
        <div class="stat"><b>RPE ${prog.rpe}</b><span>${T('Esfuerzo tope')}</span></div>
      </div>

      <div class="list-title">${T('Por qué este plan')}</div>
      <p class="tiny" style="margin:-4px 0 10px">${!prog.porIA && !prog.deRutinas && est.falloIA
        ? T('Ojo: esto lo ha montado la calculadora porque la IA ha fallado. No es el plan ' +
          'que pediste.')
        : prog.deRutinas
        ? T('Este es tu plan guardado, tal y como está ahora. Abajo puedes pedirle al ' +
          'entrenador que lo audite; lo que apliques se guarda sobre estas mismas rutinas.')
        : prog.porIA
          ? T('Lo ha montado la IA leyendo todo lo que la app sabe de ti, y ha elegido cada ' +
            'ejercicio del catálogo. Abajo puedes pedirle además que se lo lea como ' +
            'auditor, que es otra cosa.')
          : T('Esto lo calcula la app con tus datos, sin pedirle nada a nadie: por eso ' +
            'funciona sin conexión y sin clave. La lectura de un entrenador, que es otra ' +
            'cosa, está justo debajo.')}</p>
      <div class="card">
        ${raw(prog.razones.map(function (t, i) {
          return '<div class="razon"><span class="rt-idx">' + (i + 1) + '</span><p>' +
            esc(Programa.leer(t)) + '</p></div>';
        }).join(''))}
      </div>

      ${raw(prog.porIA && prog.descartados && prog.descartados.length ? html`
        <div class="card">
          <b>${T('Lo que no le dejé poner')}</b>
          <p class="tiny" style="margin:6px 0 0">${Tn('Propuso esto y no entró, así que el ' +
          'hueco lo completé yo: {lista}.',
          { lista: prog.descartados.map(T).join('; ') })}</p>
        </div>` : '')}

      ${raw(bloqueIA())}

      ${raw(prog.avisos.length ? html`
        <div class="list-title">${T('Lo que evito por tus limitaciones')}</div>
        <div class="card aviso-seguridad">
          ${raw(prog.avisos.map(function (t) {
            return '<p style="margin:0 0 8px">' + esc(Programa.leer(t)) + '</p>';
          }).join(''))}
          <p class="tiny" style="margin:6px 0 0">${T('Con una lesión diagnosticada, esto ' +
          'no sustituye a tu fisio: enséñale el plan antes de empezar.')}</p>
        </div>` : '')}

      ${raw(barraVolumen(prog))}

      <div class="list-head">
        <span class="list-title">${T('Tu semana')}</span>
        <button class="btn sm ghost" data-a="plegardias">${est.todoAbierto
          ? T('Plegar todo') : T('Abrir todo')}</button>
      </div>
      <div class="semana-plan">
        ${raw(prog.sesiones.map(function (s, i) { return tarjetaDia(s, i, prog); }).join(''))}
      </div>

      <div class="list-title">${T('Cómo progresar')}</div>
      <p class="tiny" style="margin:-4px 0 10px">${T('Repetir el mismo peso cinco semanas ' +
      'no construye nada. Este es el bloque:')}</p>
      <div class="card">
        ${raw(prog.progresion.map(function (x) {
          return '<div class="fase-txt"><b>' + esc(T(x.semana)) + '</b><p>' +
            esc(Programa.leer(x.texto)) + '</p></div>';
        }).join(''))}
      </div>

      ${raw(prog.cardio ? html`
        <div class="card">
          <b>${T('Fuera del gimnasio')}</b>
          <p class="muted" style="margin:6px 0 0">${Programa.leer(prog.cardio)}</p>
        </div>` : '')}

      <div class="card" style="margin-top:16px">
        <label class="tiny">${T('CÓMO QUIERES LLAMARLAS')}</label>
        <div class="tiny" style="margin:2px 0 0">${T('Cada rutina se llamará «día · lo ' +
        'que pongas aquí». Déjalo vacío y uso el nombre de cada sesión.')}</div>
        <input id="prog-nombre" value="${est.nombre}" placeholder="${T('Ej. Mi plan de otoño')}"
               style="margin:6px 0 0">
      </div>

      <div class="row" style="margin-top:12px">
        <button class="btn grow" data-a="otra">${T('Otra propuesta')}</button>
        <button class="btn primary grow" data-a="guardar">${vivas().length
          ? T('Actualizar mis rutinas') : T('Guardar mis rutinas')}</button>
      </div>
      <p class="tiny" style="margin-top:8px">${vivas().length
        ? Tp(vivas().length,
            'Este plan ya está en tus rutinas: se reescribe esa {n}, no se añaden otras. ' +
            'El resto de tus rutinas no se toca.',
            'Este plan ya está en tus rutinas: se reescriben esas {n}, no se añaden otras. ' +
            'El resto de tus rutinas no se toca.')
        : Tp(prog.sesiones.length,
            'Se crea {n} rutina con su día asignado. Lo que ya tengas no se borra.',
            'Se crean {n} rutinas con sus días asignados. Lo que ya tengas no se borra.')}</p>`;
  }

  /* ---------- vista ---------- */

  V.programa = function () {
    const p = Perfil.datos();

    if (!Perfil.completo(p)) {
      return html`
        <h1>${T('Tu programa')}</h1>
        <p class="muted">${T('Para que el plan sea tuyo de verdad y no una plantilla, ' +
        'necesito cuatro datos: sexo, edad, altura y peso. Con eso ajusto el volumen, las ' +
        'repeticiones, los descansos y el esfuerzo al que llegas.')}</p>
        <div class="card center">
          <p class="muted" style="margin-bottom:12px">${T('Te llevo un minuto rellenarlo.')}</p>
          <button class="btn primary block" data-a="editarperfil">${T('Completar mi perfil')}</button>
        </div>
        <button class="btn ghost block sm" data-a="plangenerico" style="margin-top:10px">
          ${T('O crear un plan genérico sin perfil')}</button>`;
    }

    return html`
      <h1>${T('Tu programa')}</h1>
      <p class="muted">${T('Construido con tu perfil: sexo, edad, nivel, objetivo y ' +
      'limitaciones. No es una plantilla con tu nombre encima.')}</p>

      ${raw(misProgramasHTML())}

      ${raw(!mostrandoPlan() ? '<div id="pildora" class="pildora-hueco"></div>' : '')}

      ${raw(mostrarAsistente() ? controles() : '')}
      ${raw(mostrandoPlan() ? resultado(est.prog) : '')}`;
  };

  V.programa.mount = function (root) {
    /* viene de Rutinas pidiendo solo verlo, sin gastar una llamada a la IA */
    if (planParaVer) {
      const cual = planParaVer;
      planParaVer = null;
      abrirPlan(cual);
      return;
    }

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
          UI.toast(T('Elige proveedor de IA y pon su clave'));
          go('claves');
          return;
        }
      } else {
        UI.toast(T('Ese plan ya no está'));
      }
    }

    bind(root, '[data-a=editarperfil]', function () { go('datos'); });
    bind(root, '[data-a=plangenerico]', function () { go('plan'); });

    bindAll(root, '[data-dia]', function (el) {
      const d = el.dataset.dia;
      const i = est.dias.indexOf(d);
      if (i === -1) {
        if (est.dias.length >= 6) { UI.toast(T('Seis días es el máximo recomendable')); return; }
        est.dias.push(d);
        est.dias.sort(function (a, b) { return DIAS.indexOf(a) - DIAS.indexOf(b); });
      } else est.dias.splice(i, 1);
      el.classList.toggle('on', i === -1);
      const chip = root.querySelector('.chip.solid');
      if (chip) chip.textContent = Tp(est.dias.length, '{n} día', '{n} días');
    });

    /* Todos repintan sin moverse del sitio. Antes solo lo hacía el material, y
       elegir objetivo o minutos te devolvía al principio del formulario: en un
       formulario de cuatro pasos, cada toque costaba volver a bajar. */
    const enElSitio = function (fn) {
      return function (el) {
        fn(el);
        guardarEstado();
        const pos = window.scrollY;
        render();
        window.scrollTo(0, pos);
      };
    };
    bindAll(root, '[data-min]', enElSitio(function (el) {
      est.minutos = Number(el.dataset.min);
    }));
    bindAll(root, '[data-minmano]', function () { pedirMinutos(); });
    bindAll(root, '[data-obj]', enElSitio(function (el) {
      est.objetivo = el.dataset.obj;
    }));
    bindAll(root, '[data-foco]', enElSitio(function (el) {
      est.foco = el.dataset.foco;
    }));
    bindAll(root, '[data-gear]', enElSitio(function (el) {
      est.gear = el.dataset.gear;
    }));

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
    const ordenes = root.querySelector('#pg-ordenes');
    if (ordenes) ordenes.oninput = function () { est.ordenes = ordenes.value; };

    /* «Nuevo» tiene que dejar la pantalla en blanco: si abajo sigue colgando el
       plan de antes, parece que ya te ha generado algo sin haberlo pedido. */
    /* La frase del día. Se pide en segundo plano: si no hay clave o falla, el
       hueco se queda vacío y no se nota. */
    const hueco = root.querySelector('#pildora');
    if (hueco && IA.activa() && IA.pildora) {
      IA.pildora().then(function (p) {
        if (!p || !p.frase) return;
        hueco.className = 'card pildora';
        hueco.innerHTML = html`
          <span class="pildora-ico">${raw(icon('chispa'))}</span>
          <span class="grow">${p.frase}</span>`;
      }).catch(function () { /* sin frase hoy, no pasa nada */ });
    }

    /* Arrepentirse de crear tiene que costar un toque, no salir de la pantalla */
    /* Cerrar lo que se está mirando y volver a la lista de planes */
    bind(root, '[data-a=cerrarplan]', function () {
      const cerrar = function () {
        est.prog = null; est.ia = null; est.aplicados = []; est.guardadas = [];
        est.recuperado = false; est.creando = false; est.abierto = {};
        guardarEstado();
        render();
        window.scrollTo(0, 0);
      };
      if (est.prog && !vivas().length) {
        UI.confirm(T('Cerrar sin guardar'),
          T('Este plan no está en tus rutinas. Si lo cierras, se pierde.'),
          T('Cerrar igual'), true).then(function (ok) { if (ok) cerrar(); });
        return;
      }
      cerrar();
    });

    bind(root, '[data-a=cancelarnuevo]', function () {
      const cerrar = function () {
        est.creando = false;
        est.prog = null; est.ia = null; est.aplicados = []; est.guardadas = [];
        est.recuperado = false; est.abierto = {};
        guardarEstado();
        render();
        window.scrollTo(0, 0);
      };
      /* si hay un plan montado y sin guardar, se avisa antes de tirarlo */
      if (est.prog && !vivas().length) {
        UI.confirm(T('Descartar lo generado'),
          T('El plan que hay en pantalla no está en tus rutinas. Si cancelas, se pierde.'),
          T('Descartar'), true).then(function (ok) { if (ok) cerrar(); });
        return;
      }
      cerrar();
    });

    bind(root, '[data-a=comparar]', compararSheet);

    bind(root, '[data-a=irgenerar]', function () {
      const bajar = function () {
        const caja = document.querySelector('#generar');
        if (caja) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      est.creando = true;
      if (!est.prog) { render(); setTimeout(bajar, 60); return; }

      const sinGuardar = !vivas().length;
      const limpiar = function () {
        est.prog = null; est.ia = null; est.aplicados = []; est.guardadas = [];
        est.recuperado = false; est.abierto = {}; est.creando = true;
        guardarEstado();
        render();
        setTimeout(bajar, 60);
      };

      if (sinGuardar) {
        UI.confirm(T('Empezar uno nuevo'),
          T('El plan que tienes en pantalla no está en tus rutinas todavía. Si sigues, ' +
          'se pierde.'), T('Empezar de cero'), true).then(function (ok) { if (ok) limpiar(); });
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
      if (!r) { UI.toast(T('Esa rutina ya no está')); return; }
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
          ? Tp(ids.length, '{n} rutina actualizada', '{n} rutinas actualizadas')
          : Tp(ids.length, '{n} rutina creada con su día',
              '{n} rutinas creadas con sus días'));
        go('rutinas');
        Offline.precargarRutinas();
      };

      /* Reescribir rutinas que no se crearon en esta sesión no puede pasar en
         silencio: puede haberlas editado a mano desde entonces. */
      const deAntes = yaHay.filter(function (r) { return est.guardadas.indexOf(r.id) === -1; });
      if (deAntes.length) {
        UI.confirm(Tn('Ya tienes un plan llamado «{que}»', { que: etiqueta }),
          Tp(yaHay.length,
            'Tiene {n} rutina. Voy a reescribirla con este plan y a borrar las que sobren, ' +
            'para que no se te dupliquen. Si quieres conservarlo, cancela y ponle otro ' +
            'nombre a este.',
            'Tiene {n} rutinas. Voy a reescribirlas con este plan y a borrar las que sobren, ' +
            'para que no se te dupliquen. Si quieres conservarlo, cancela y ponle otro ' +
            'nombre a este.'),
          T('Reescribir')).then(function (ok) { if (ok) seguir(); });
        return;
      }
      seguir();
    });

    bindAll(root, '[data-a=afinar]', function () { afinar(false); });
    bindAll(root, '[data-a=reafinar]', function () { afinar(true); });
    bindAll(root, '[data-cambio]', function (el) { aplicarCambio(Number(el.dataset.cambio)); });

    bindAll(root, '[data-nocambio]', function (el) {
      est.ia.cambios.splice(Number(el.dataset.nocambio), 1);
      guardarEstado();
      repintarQuieto();
    });

    bind(root, '[data-a=olvidaIA]', function () {
      UI.confirm(T('Descartar la lectura'), T('Se borra lo que dijo el entrenador y la ' +
        'lista de cambios que quedan sin aplicar. Los que ya aplicaste siguen en el plan.'),
        T('Descartar'), true).then(function (ok) {
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
    const gear = gearActual();
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
        if (!Data.permiteNombre(gear, ex.nameEs)) {
          descartados.push(Tn('{que} (no lo tienes donde entrenas)', { que: ex.nameEs }));
          return;
        }
        if (prohibido(ex)) {
          descartados.push(Tn('{que} (tus limitaciones)', { que: ex.nameEs }));
          return;
        }
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
      if (ejercicios.length < 5) {
        const deLaBase = (base.sesiones.find(function (x) { return x.dia === dia; }) ||
          base.sesiones[i] || {}).ejercicios || [];
        deLaBase.forEach(function (e) {
          if (ejercicios.length >= 5) return;
          if (vistos[e.exId]) return;
          const ex = Data.get(e.exId);
          if (!ex || prohibido(ex)) return;
          vistos[e.exId] = true;
          ejercicios.push(Object.assign({}, e, {
            note: T('Lo añade la app para completar el día.')
          }));
        });
      }
      /* El mínimo de la app son 6 ejercicios, pero la calculadora monta días de
         5 con sesiones de una hora: exigir 6 aquí podía tirar un día entero que
         la propia app habría dado por bueno. Con cuatro ya es una sesión. */
      if (ejercicios.length < 4) return null;

      const minutos = ejercicios.reduce(function (n, e) {
        return n + Math.round(e.sets * (e.rest + 35) / 60);
      }, 0);

      return {
        dia: dia,
        nombre: UI.diaLargo(dia) + ' · ' + (ses.nombre || T('Sesión')),
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
    if (!est.dias.length) { UI.toast(T('Elige al menos un día de entrenamiento')); return; }
    if (!IA.activa()) { go('claves'); UI.toast(T('Elige proveedor de IA y pon su clave')); return; }

    /* la calculadora primero: garantiza una forma válida y es la red si algo falla */
    const base = Programa.crear({
      dias: est.dias, minutos: est.minutos, objetivo: objetivoActual(),
      foco: est.foco, gear: gearActual(), variante: est.variante
    });

    est.cargandoPlan = true;
    est.falloIA = '';
    render();

    IA.crearPrograma({
      dias: est.dias, minutos: est.minutos, objetivo: objetivoActual(), foco: est.foco,
      gear: gearActual(), objetivoSeries: base.objetivoSeries,
      lesiones: base.lesiones, musculos: Object.keys(base.volumen || {}),
      molestias: est.molestias, notas: est.notas, ordenes: est.ordenes
    }).then(function (r) {
      const prog = fusionarIA(base, r);
      if (!prog) {
        UI.toast(T('La IA no devolvió un plan aprovechable. Te dejo el de la calculadora.'));
        est.prog = base;
      } else {
        est.prog = prog;
        const faltan = est.dias.length - prog.sesiones.length;
        if (faltan > 0) {
          UI.toast(Tn('Plan listo, pero solo salieron {salieron} de los {pedidos} días. ' +
            'Prueba a generarlo otra vez.',
            { salieron: prog.sesiones.length, pedidos: est.dias.length }));
        } else if (prog.descartados.length) {
          UI.toast(Tp(prog.descartados.length,
            'Plan listo. Descarté {n} ejercicio que no encajaba y completé el hueco.',
            'Plan listo. Descarté {n} ejercicios que no encajaban y completé el hueco.'));
        } else {
          UI.toast(T('Plan montado a tu medida'));
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
    if (!est.dias.length) { UI.toast(T('Elige al menos un día de entrenamiento')); return; }
    /* cada vez que se pide, otra variante: antes devolvía el plan idéntico */
    est.variante = (est.variante || 0) + 1;
    est.prog = Programa.crear({
      dias: est.dias, minutos: est.minutos, objetivo: objetivoActual(),
      foco: est.foco, gear: gearActual(), variante: est.variante
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

  function afinar(rehacer) {
    if (!IA.activa()) { go('claves'); UI.toast(T('Elige proveedor de IA y pon su clave')); return; }
    est.cargandoIA = true;
    render();
    IA.afinarPrograma(est.prog, rehacer)
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

    /* Sobre un ejercicio que ya está: ni catálogo ni material que validar. */
    /* La sesión entera de una vez: ver app.js, mismo motivo. */
    if (accion === 'orden' && (c.lista || []).length) {
      const ses = est.prog.sesiones[Number(c.dia) - 1];
      if (!ses) {
        UI.toast(T('Ese día ya no está en el plan.'));
        est.ia.cambios.splice(i, 1);
        guardarEstado();
        repintarQuieto();
        return;
      }
      const pedido = c.lista.map(function (n) { return I18N.norm(String(n || '')); });
      const quedan = ses.ejercicios.slice();
      const puestos = [];
      pedido.forEach(function (n) {
        const k = quedan.findIndex(function (e) {
          const ex = Data.get(e.exId);
          return ex && I18N.norm(ex.nameEs) === n;
        });
        if (k !== -1) puestos.push(quedan.splice(k, 1)[0]);
      });
      ses.ejercicios = puestos.concat(quedan);
      est.ia.cambios.splice(i, 1);
      apuntarAplicado(Tn('{que}: reordenada, los básicos delante',
        { que: Programa.nombreSesion(ses) }));
      return;
    }

    if (accion === 'orden' || accion === 'descanso' || accion === 'series') {
      const sitio = enElPlan(c.sobre || c.quitar || c.poner);
      if (!sitio) {
        UI.toast(Tn('Ya no está «{que}» en el plan.',
          { que: c.sobre || c.quitar || '' }));
        est.ia.cambios.splice(i, 1);
        guardarEstado();
        repintarQuieto();
        return;
      }

      if (accion === 'orden') {
        const lista = sitio.ses.ejercicios;
        const destino = Math.max(0, Math.min(lista.length - 1, (Number(c.posicion) || 1) - 1));
        const movido = lista.splice(sitio.i, 1)[0];
        lista.splice(destino, 0, movido);
        est.ia.cambios.splice(i, 1);
        apuntarAplicado(Tn('{que}: pasa al {n}.º en {donde}',
          { que: sitio.ex.nameEs, n: destino + 1,
            donde: Programa.nombreSesion(sitio.ses) }));
        return;
      }

      if (accion === 'descanso') {
        const seg = Math.max(0, Math.min(600, Number(c.rest) || 0));
        if (!seg) { UI.toast(T('Ese cambio no dice cuánto descanso poner.')); return; }
        sitio.ses.ejercicios[sitio.i].rest = seg;
        est.ia.cambios.splice(i, 1);
        apuntarAplicado(Tn('{que}: descanso a {n}s',
          { que: sitio.ex.nameEs, n: seg }));
        return;
      }

      const series = Math.max(1, Math.min(15, Number(c.series) || 0));
      if (!series) { UI.toast(T('Ese cambio no dice cuántas series poner.')); return; }
      const antes = sitio.ses.ejercicios[sitio.i];
      sitio.ses.minutos = Math.max(15, sitio.ses.minutos - minutosDe(antes));
      antes.sets = series;
      sitio.ses.minutos += minutosDe(antes);
      Programa.revolumen(est.prog);
      est.ia.cambios.splice(i, 1);
      apuntarAplicado(Tn('{que}: {n} series', { que: sitio.ex.nameEs, n: series }));
      return;
    }

    if (accion === 'quitar') {
      const sitio = enElPlan(c.quitar);
      if (!sitio) {
        UI.toast(Tn('Ya no está «{que}» en el plan.', { que: c.quitar || '' }));
        return;
      }
      if (sitio.ses.ejercicios.length <= 2) {
        UI.toast(T('Ese día se quedaría en un ejercicio. No lo quito.'));
        return;
      }
      sitio.ses.minutos = Math.max(15, sitio.ses.minutos -
        minutosDe(sitio.ses.ejercicios[sitio.i]));
      sitio.ses.ejercicios.splice(sitio.i, 1);
      est.ia.cambios.splice(i, 1);
      apuntarAplicado(Tn('{que}: fuera de {donde}',
        { que: sitio.ex.nameEs, donde: Programa.nombreSesion(sitio.ses) }));
      return;
    }

    const nuevo = delCatalogo(c.poner);
    const aOjo = nuevo && I18N.norm(nuevo.nameEs) !== I18N.norm(String(c.poner || ''));
    if (!nuevo) {
      UI.toast(Tn('No encuentro «{que}» en el catálogo. Cambio descartado.',
        { que: c.poner || '' }));
      est.ia.cambios.splice(i, 1);
      guardarEstado();
      repintarQuieto();
      return;
    }
    if (chocaConLesiones(nuevo)) {
      UI.toast(Tn('«{que}» no encaja con tus limitaciones. Cambio descartado.',
        { que: nuevo.nameEs }));
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
        UI.toast(Tn('«{que}» ya está en ese día.', { que: nuevo.nameEs }));
        est.ia.cambios.splice(i, 1);
        guardarEstado();
        repintarQuieto();
        return;
      }

      const modelo = destino.ejercicios[destino.ejercicios.length - 1] || {};
      const compuesto = nuevo.mechanic === 'compound';
      const entra = {
        exId: nuevo.id,
        patron: Alt.patron(nuevo),
        musculo: (nuevo.primaryMuscles || [])[0] || modelo.musculo || 'abdominals',
        rol: compuesto ? 'principal' : 'accesorio',
        sets: Math.min(6, Number(c.series) || modelo.sets || 3),
        reps: Math.min(60, Number(c.reps) || modelo.reps || 12),
        weight: 0,
        /* El descanso viene con el cambio cuando lo calcula la app; el del último
           ejercicio del día es de un aislamiento y deja corto a un básico. */
        rest: Number(c.rest) || modelo.rest || 75,
        note: Tn('Lo mete el entrenador: {porque}', { porque: c.porque || '' })
      };
      /* Un compuesto al final queda detrás de los aislamientos y se hace cansado:
         entra delante del primer ejercicio de aislamiento que haya. */
      const corte = c.alPrincipio === false ? -1 : destino.ejercicios.findIndex(function (e) {
        const x = Data.get(e.exId);
        return x && x.mechanic === 'isolation';
      });
      if (compuesto && corte !== -1) destino.ejercicios.splice(corte, 0, entra);
      else destino.ejercicios.push(entra);
      destino.minutos += minutosDe(entra);
      est.ia.cambios.splice(i, 1);
      apuntarAplicado(Tn('{que}: entra en {donde}',
        { que: nuevo.nameEs, donde: destino.nombre }));
      if (aOjo) UI.toast(Tn('Pedía «{pedido}», que no está en el catálogo. He puesto ' +
        '{puesto}.', { pedido: c.poner, puesto: nuevo.nameEs }));
      return;
    }

    /* sustituir */
    const sitio = enElPlan(c.quitar);
    if (!sitio) {
      UI.toast(Tn('Ya no está «{que}» en el plan.', { que: c.quitar || '' }));
      return;
    }
    const antes = sitio.ex.nameEs;
    const e = sitio.ses.ejercicios[sitio.i];
    e.exId = nuevo.id;
    e.patron = Alt.patron(nuevo);
    e.musculo = (nuevo.primaryMuscles || [])[0] || e.musculo;
    e.note = Tn('Cambiado a propuesta del entrenador: {porque}', { porque: c.porque || '' });
    est.ia.cambios.splice(i, 1);
    apuntarAplicado(Tn('{nuevo} en lugar de {viejo}',
      { nuevo: nuevo.nameEs, viejo: antes }));
    if (aOjo) UI.toast(Tn('Pedía «{pedido}», que no está en el catálogo. He puesto ' +
      '{puesto}.', { pedido: c.poner, puesto: nuevo.nameEs }));
  }
})(window);
