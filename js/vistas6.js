/* vistas6.js — Progreso.

   Antes eran cuatro números, ocho barras y una cuadrícula con el día del mes.
   Se veía el dato pero no se leía la historia. Aquí se cuenta con gráficos:
   una curva con la evolución, un mapa de calor de tres meses donde se ve de un
   vistazo la constancia, y el reparto por músculo, que es lo que destapa los
   desequilibrios (dos meses de pecho y ni una tracción).

   Todo se dibuja con SVG a mano: cero librerías, coherente con el resto. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  const DIA = 864e5;

  /* Lo que hay detrás de cada marca azul del reparto, por zona. Lo llena el
     render y lo lee la hoja: el enganche corre después y no ve esas cuentas. */
  let actividadPorZona = {};

  /* Rangos que se pueden mirar. dias: cuánto abarca; paso: si se agrupa por día
     o por semana, que 365 puntos diarios no se leen en un móvil. */
  /* El texto se traduce al pintarlo: esta tabla se arma al cargar el archivo y
     el idioma se cambia con la app abierta. */
  const RANGOS = [
    { id: 'semana', label: 'Semana', dias: 7, paso: 'dia', frase: 'la última semana' },
    { id: 'mes', label: 'Mes', dias: 30, paso: 'dia', frase: 'el último mes' },
    { id: '2meses', label: '2 meses', dias: 60, paso: 'semana', frase: 'los últimos dos meses' },
    { id: '3meses', label: '3 meses', dias: 91, paso: 'semana', frase: 'los últimos tres meses' },
    { id: 'año', label: 'Año', dias: 364, paso: 'semana', frase: 'el último año' }
  ];

  /* El elegido dura lo que dure la sesión de la app.

     Se abre por la semana y no por los tres meses. Al entrar, la pregunta es
     «¿cómo voy?», y eso es lo de estos días: con tres meses por delante, una
     semana buena o mala no se nota en la curva y el mapa sale casi entero en
     gris. Los tres meses son para ir a buscarlos, que para eso está el mando. */
  let rango = 'semana';
  function rangoActual() {
    return RANGOS.find(function (r) { return r.id === rango; }) || RANGOS[0];
  }

  /* ---------- datos ---------- */

  /* Total por día de los últimos n días: series y volumen */
  /* Cuantos dias de los ultimos n se entreno. El mapa de calor lo ensena, pero
     contarlos cuadro a cuadro no lo hace nadie. */
  function diasEntrenados(n) {
    return porDia(n).filter(function (d) { return d.n > 0; }).length;
  }

  function porDia(n) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const mapa = {};
    Store.sessions().forEach(function (s) {
      const k = Store.dayKey(s.start);
      const d = mapa[k] || (mapa[k] = { series: 0, volumen: 0, minutos: 0, n: 0 });
      d.series += s.setsDone || 0;
      d.volumen += s.volume || 0;
      d.minutos += Math.round(((s.end || s.start) - s.start) / 60000);
      d.n++;
    });

    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const t = hoy.getTime() - i * DIA;
      const k = Store.dayKey(t);
      out.push(Object.assign({ t: t, k: k }, mapa[k] || { series: 0, volumen: 0, minutos: 0, n: 0 }));
    }
    return out;
  }

  /* La serie que se pinta: por día en los rangos cortos, por semana en los largos */
  function serie(r, porSeries) {
    const dias = porDia(r.dias);
    const dato = function (d) { return porSeries ? d.series : d.volumen; };

    /* `act` marca el punto en el que hubo algo pero no series: la línea
       sigue valiendo cero, que es la verdad, y el punto se pinta en azul para
       que el día no parezca vacío. */
    if (r.paso === 'dia') {
      return dias.map(function (d) {
        return { y: dato(d), etiqueta: UI.fechaCorta(d.t), act: !dato(d) && d.n > 0 };
      });
    }

    /* se agrupa de siete en siete, terminando en hoy */
    const out = [];
    for (let i = 0; i < dias.length; i += 7) {
      const trozo = dias.slice(i, i + 7);
      const suma = trozo.reduce(function (a2, d) { return a2 + dato(d); }, 0);
      out.push({
        y: suma,
        etiqueta: UI.fechaCorta(trozo[0].t),
        act: !suma && trozo.some(function (d) { return d.n > 0; })
      });
    }
    return out;
  }

  /* Qué músculos has trabajado en los últimos días, por series hechas */
  /* Lo que tus rutinas con día asignado piden cada semana, por zona. Enfrentarlo
     a lo que de verdad haces es la pregunta que se viene a responder aquí: en la
     pantalla del plan solo se ve su composición, que es otra cosa. */
  function planPorZona() {
    const zonas = {};
    let total = 0;

    /* Solo el plan que manda. Sumando todas las rutinas que uno tiene guardadas
       —las de dos o tres planes distintos— salian barbaridades como «tu plan
       pide 110 series de pierna por semana»: eran las de todos los planes
       juntos, incluidos los que no estas siguiendo. */
    const activo = g.App && App.planActivo ? App.planActivo() : '';

    Store.routines().forEach(function (r) {
      if (activo && g.App.nombreRutina && App.nombreRutina(r) !== activo) return;
      if (!(r.days || []).length) return;
      /* una rutina asignada a dos días se entrena dos veces por semana */
      const veces = r.days.length;
      (r.exercises || []).forEach(function (e) {
        const ex = Data.get(e.exId);
        const grupos = (ex && ex.groups && ex.groups.length) ? ex.groups : null;
        if (!grupos) return;
        grupos.forEach(function (gr) {
          zonas[gr] = (zonas[gr] || 0) + (e.sets * veces) / grupos.length;
        });
        total += e.sets * veces;
      });
    });
    return { zonas: zonas, total: total };
  }

  /* De qué zona es un músculo */
  function zonaDe(m) {
    const gr = I18N.GROUPS.filter(function (x) {
      return (x.muscles || []).indexOf(m) !== -1;
    })[0];
    return gr ? gr.id : '';
  }

  function repartoMuscular(dias) {
    const desde = Date.now() - dias * DIA;
    const cuenta = {};
    const minutos = {};
    const musAct = {};
    const actsAct = {};
    let total = 0;

    Store.sessions().forEach(function (s) {
      if (s.start < desde) return;

      /* Lo de fuera del gimnasio no deja series, solo tiempo, y va por su lado:
         sumarlo a las series diría que estás más cerca de tu objetivo de pesas
         de lo que estás, que es justo lo que esta pantalla sirve para ver. */
      const min = Number(s.minutos) || 0;
      if (min && (s.musculos || []).length) {
        const zonas = [];
        s.musculos.forEach(function (m) {
          const z = zonaDe(m);
          if (!z) return;
          if (zonas.indexOf(z) === -1) zonas.push(z);
          /* Y cuáles en concreto. El reparto habla de zonas, pero la actividad
             se apuntó músculo a músculo: sin esto había que bajar al historial
             para saber qué había movido el partido. */
          if (!musAct[z]) musAct[z] = [];
          if (musAct[z].indexOf(m) === -1) musAct[z].push(m);
        });
        /* El tiempo no se reparte entre zonas: los noventa minutos del partido
           los aguantó la pierna enteros, y el core también. */
        zonas.forEach(function (z) {
          minutos[z] = (minutos[z] || 0) + min;
          /* Y de qué actividad salieron, con los músculos que puso en esa zona:
             es lo que se cuenta al tocar la marca azul, y sin esto «hubo
             actividad» no se puede convertir en «jugaste al fútbol». */
          if (!actsAct[z]) actsAct[z] = [];
          actsAct[z].push({
            nombre: Store.nombreDeSesion(s),
            min: min,
            musculos: s.musculos.filter(function (m) { return zonaDe(m) === z; })
          });
        });
      }

      (s.entries || []).forEach(function (e) {
        const hechas = (e.sets || []).filter(function (x) { return x.done; }).length;
        if (!hechas) return;
        const ex = Data.get(e.exId);
        const grupos = ex && ex.groups && ex.groups.length ? ex.groups : null;
        if (!grupos) return;
        /* una serie reparte entre los grupos que toca, sin inflar el total */
        grupos.forEach(function (gr) {
          cuenta[gr] = (cuenta[gr] || 0) + hechas / grupos.length;
        });
        total += hechas;
      });
    });

    const filas = I18N.GROUPS.map(function (gr) {
      return { id: gr.id, label: T(gr.label), series: Math.round((cuenta[gr.id] || 0) * 10) / 10 };
    }).filter(function (f) { return f.series > 0; })
      .sort(function (a, b) { return b.series - a.series; });

    return { total: Math.round(total), filas: filas, minutos: minutos,
      musculos: musAct, actividades: actsAct };
  }

  /* ---------- gráficos ---------- */

  /* Curva suave con relleno. puntos: [{x, y, etiqueta}] */
  function grafica(puntos, unidad) {
    const W = 320, H = 120, P = 6;
    const max = Math.max.apply(null, puntos.map(function (p) { return p.y; }).concat([1]));
    const paso = puntos.length > 1 ? (W - P * 2) / (puntos.length - 1) : 0;

    const xy = puntos.map(function (p, i) {
      return { x: P + i * paso, y: H - P - (p.y / max) * (H - P * 2), v: p.y,
        et: p.etiqueta, act: !!p.act };
    });

    /* curva de Bézier entre puntos, que queda menos angulosa que las rectas */
    let d = 'M' + xy[0].x + ' ' + xy[0].y;
    for (let i = 1; i < xy.length; i++) {
      const a = xy[i - 1], b = xy[i], cx = (a.x + b.x) / 2;
      d += ' C' + cx + ' ' + a.y + ' ' + cx + ' ' + b.y + ' ' + b.x + ' ' + b.y;
    }
    const area = d + ' L' + xy[xy.length - 1].x + ' ' + H + ' L' + xy[0].x + ' ' + H + ' Z';
    const ultimo = xy[xy.length - 1];

    return html`
      <svg class="graf" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="gradGraf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--acc)" stop-opacity=".38"/>
            <stop offset="100%" stop-color="var(--acc)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path class="graf-area" d="${area}" fill="url(#gradGraf)"/>
        <path class="graf-linea" d="${d}"/>
        ${raw(xy.map(function (p) {
          return '<circle class="graf-p' + (p.act ? ' graf-act' : '') +
            '" cx="' + p.x + '" cy="' + p.y + '" r="' + (p.act ? 3.4 : 2.5) + '"/>';
        }).join(''))}
        <!-- El punto de cierre se pinta encima del suyo, más gordo, y sin esto
             iba siempre en verde: un día de solo actividad salía azul en toda la
             curva menos el último, que es justo el de hoy y el que se mira. -->
        <circle class="graf-ultimo${ultimo.act ? ' graf-act' : ''}"
                cx="${ultimo.x}" cy="${ultimo.y}" r="4.5"/>
      </svg>
      <div class="graf-ejes">
        ${raw(puntos.map(function (p, i) {
          /* como mucho seis etiquetas: con 52 semanas se solapaban en vertical
             y no se leía ninguna */
          const cada = Math.max(1, Math.ceil(puntos.length / 6));
          const mostrar = i % cada === 0 || i === puntos.length - 1;
          return '<span>' + (mostrar ? esc(p.etiqueta) : '') + '</span>';
        }).join(''))}
      </div>`;
  }

  /* ---------- como va cada ejercicio ----------
     La pregunta que la app no sabia contestar: «subo en press de banca?». En la
     ficha del ejercicio estaba el maximo, las reps y el 1RM, y debajo una lista
     de filas: numeros sueltos que hay que comparar de cabeza.

     IMPORTANTE: no todo el mundo apunta kilos. Con el registro puesto en
     «marcar el ejercicio como hecho» no hay pesos que dibujar, asi que la
     decision no se toma mirando el ajuste sino los datos: si ese ejercicio
     tiene pesos, se ensena la curva de peso; si no, cuantas veces lo has hecho.
     Asi tambien funciona para quien cambio de modo por el camino. */
  /* El nombre que se guardó con la sesión quedó escrito en el idioma de aquel
     día. El catálogo sabe decirlo en el de hoy, así que manda él; lo guardado
     solo sirve de respaldo para un ejercicio que ya no exista. */
  function nombreEj(e) {
    const ex = g.Data ? Data.get(e.exId) : null;
    return (ex && ex.nameEs) || e.name || e.exId;
  }

  function porEjercicio(sesiones, desdeT) {
    const mapa = {};
    sesiones.filter(function (x) { return x.start >= desdeT; }).forEach(function (x) {
      (x.entries || []).forEach(function (e) {
        const hechas = (e.sets || []).filter(function (st) { return st.done; });
        if (!hechas.length) return;
        const m = mapa[e.exId] || (mapa[e.exId] = {
          exId: e.exId, name: nombreEj(e), veces: 0, series: 0, puntos: [], conPeso: false
        });
        const mejor = hechas.reduce(function (a2, st) {
          return Math.max(a2, Number(st.weight) || 0);
        }, 0);
        if (mejor > 0) m.conPeso = true;
        m.veces++;
        m.series += hechas.length;
        m.puntos.push({ t: x.start, peso: mejor, series: hechas.length });
      });
    });

    return Object.keys(mapa).map(function (k) { return mapa[k]; })
      .filter(function (m) { return m.puntos.length >= 2; })
      .sort(function (a2, b2) { return b2.veces - a2.veces; });
  }

  /* Una curva de 60x20 sin ejes: a este tamano lo que se lee es la forma. */
  function chispa(valores) {
    if (valores.length < 2) return '';
    const W = 62, H = 20, P = 2;
    const min = Math.min.apply(null, valores);
    const max = Math.max.apply(null, valores);
    const alto = Math.max(1e-6, max - min);
    const d = valores.map(function (v, i) {
      const x = P + i / (valores.length - 1) * (W - 2 * P);
      const y = H - P - (v - min) / alto * (H - 2 * P);
      return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
    return '<svg class="chispa" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<path d="' + d + '"/></svg>';
  }

  function ejerciciosHTML(lista) {
    if (!lista.length) return '';

    /* El titular de la tarjeta: el que mas ha subido si hay pesos, y si no, el
       que mas repites. Es el dato que uno buscaria leyendo la lista entera. */
    const conPeso = lista.filter(function (m) { return m.conPeso; }).map(function (m) {
      const p = m.puntos.map(function (q) { return q.peso; })
        .filter(function (v) { return v > 0; });
      const ini = p[0], fin = p[p.length - 1];
      return { nombre: m.exId, dif: ini ? Math.round((fin - ini) / ini * 100) : 0, m: m };
    }).sort(function (a, b) { return b.dif - a.dif; });

    const cabeza = conPeso.length && conPeso[0].dif > 0
      ? { rotulo: T('El que más sube'),
          nombre: (Data.get(conPeso[0].m.exId) || {}).nameEs || conPeso[0].m.name,
          dato: '+' + conPeso[0].dif + '%' }
      : { rotulo: T('El que más repites'),
          nombre: (Data.get(lista[0].exId) || {}).nameEs || lista[0].name,
          dato: Tp(lista[0].veces, '{n} vez', '{n} veces') };

    return html`
      <div class="list-title">${T('Tus ejercicios')}</div>
      <div class="card lista-ejs tarjeta-premium">
        <div class="ejs-cab row between">
          <div class="grow" style="min-width:0">
            <div class="pre-encima">${raw(cabeza.rotulo)}</div>
            <!-- El nombre de un ejercicio puede ser largo: en una linea y con
                 puntos suspensivos, que si no empuja la cifra al renglon de
                 abajo y la cabecera crece el doble. -->
            <div class="pre-num">${cabeza.nombre}</div>
          </div>
          <span class="chip nowrap">${cabeza.dato}</span>
        </div>
        ${raw(lista.slice(0, 5).map(function (m, i) {
          const ex = Data.get(m.exId);
          const nombre = ex ? ex.nameEs : m.name;

          if (m.conPeso) {
            const pesos = m.puntos.map(function (q) { return q.peso; })
              .filter(function (v) { return v > 0; });
            const ini = pesos[0], fin = pesos[pesos.length - 1];
            const dif = ini ? Math.round((fin - ini) / ini * 100) : 0;
            return html`
              <button class="fila-ej" data-ex="${m.exId}" style="--turno:${i}">
                <span class="grow">
                  <span class="ej-tit">${nombre}</span>
                  <span class="ej-sub">${UI.num(ini)} → ${UI.num(fin)}
                    ${Store.settings().unit || 'kg'} · ${m.veces} veces</span>
                </span>
                ${raw(chispa(pesos))}
                <span class="ej-dif ${dif > 0 ? 'sube' : dif < 0 ? 'baja' : ''}">${raw(dif > 0
                  ? '▲ ' + dif + '%' : dif < 0 ? '▼ ' + Math.abs(dif) + '%' : '=')}</span>
              </button>`;
          }

          /* Sin pesos apuntados: lo que hay es cuantas veces y cuantas series. */
          const series = m.puntos.map(function (q) { return q.series; });
          return html`
            <button class="fila-ej" data-ex="${m.exId}" style="--turno:${i}">
              <span class="grow">
                <span class="ej-tit">${nombre}</span>
                <span class="ej-sub">${m.veces} veces · ${m.series} series</span>
              </span>
              ${raw(chispa(series))}
              <span class="ej-dif">${m.veces}×</span>
            </button>`;
        }).join(''))}
      </div>`;
  }

  /* La curva del peso va con su propia escala: la grafica de volumen arranca en
     cero, y con eso una bajada de 78 a 72 kg sale como una raya plana. Aqui el
     alto del dibujo es el rango real, que es lo que deja ver el movimiento. */
  function curvaPeso(lista) {
    const W = 300, H = 76, P = 5;
    const vals = lista.map(function (x) { return x.peso; });
    const min = Math.min.apply(null, vals);
    const max = Math.max.apply(null, vals);
    const alto = Math.max(1e-6, max - min);

    const xy = lista.map(function (x, i) {
      return {
        x: P + i / Math.max(1, lista.length - 1) * (W - 2 * P),
        y: H - P - (x.peso - min) / alto * (H - 2 * P)
      };
    });

    let d = 'M' + xy[0].x.toFixed(1) + ' ' + xy[0].y.toFixed(1);
    for (let i = 1; i < xy.length; i++) {
      const a = xy[i - 1], b = xy[i], cx = (a.x + b.x) / 2;
      d += ' C' + cx.toFixed(1) + ' ' + a.y.toFixed(1) + ' ' + cx.toFixed(1) + ' ' +
        b.y.toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
    }
    const ult = xy[xy.length - 1];

    return '<svg class="curva-peso" viewBox="0 0 ' + W + ' ' + H + '" ' +
      'preserveAspectRatio="none" aria-hidden="true">' +
      '<path class="cp-linea" d="' + d + '"/>' +
      '<circle class="cp-hoy" cx="' + ult.x.toFixed(1) + '" cy="' + ult.y.toFixed(1) +
      '" r="3.4"/></svg>';
  }

  /* ---------- tu peso ----------
     Vivia solo en Perfil > Cuerpo, dos pantallas adentro y en barras. El peso
     es el numero que mas se mira y esta es la pantalla de mirar numeros. Si no
     hay pesajes no sale nada: no todo el mundo se pesa. */
  function pesoHTML(dias) {
    if (!g.Perfil) return '';
    const todos = Perfil.pesajes();
    const desde = Date.now() - dias * 864e5;
    const lista = todos.filter(function (x) { return x.fecha >= desde; });
    if (lista.length < 2) return '';

    const ini = lista[0].peso, fin = lista[lista.length - 1].peso;
    const dif = Math.round((fin - ini) * 10) / 10;
    const semanas = Math.max(1, (lista[lista.length - 1].fecha - lista[0].fecha) / (7 * 864e5));
    const porSemana = Math.round(dif / semanas * 100) / 100;

    /* Subir de peso no es bueno ni malo: depende de a que juegue. Con el
       objetivo puesto en ganar, el verde es subir; en perder, bajar; y si no
       hay objetivo declarado, ningun color, que no somos quien para opinar. */
    const obj = (Perfil.datos() || {}).objetivo;
    const tono = obj === 'perder' ? (dif <= 0 ? 'sube' : 'baja')
      : obj === 'ganar' ? (dif >= 0 ? 'sube' : 'baja') : 'neutro';

    /* Con coma, que aqui se escribe en espanol. */
    const coma = function (n) { return UI.dec(n); };

    return html`
      <div class="list-title">${T('Tu peso')}</div>
      <div class="card tarjeta-premium">
        <div class="row between" style="align-items:flex-end">
          <div>
            <div class="pre-encima">${T('Ahora')}</div>
            <div class="pre-num">${UI.num(fin)}
              <span class="tiny" style="font-weight:600">${Store.settings().unit || 'kg'}</span></div>
          </div>
          <span class="delta ${tono}">
            ${dif > 0 ? '+' : ''}${coma(dif)} <span class="tiny">${T('en el periodo')}</span></span>
        </div>
        ${raw(curvaPeso(lista))}
        <p class="tiny" style="margin:8px 0 0">${Tp(lista.length, '{n} pesaje', '{n} pesajes')} ·
          ${Tn('{signo}{n} {unidad} por semana de media',
            { signo: porSemana > 0 ? '+' : '', n: coma(porSemana),
              unidad: Store.settings().unit || 'kg' })}</p>
      </div>`;
  }

  /* La semana, dia a dia: inicial, numero y una barra con lo que hiciste. Lo
     que en un mapa de calor de siete cuadros no se puede poner. */
  /* El color sale de las series, pero un día de actividad no tiene ninguna: un
     partido o una hora de bici dejaban el cuadro gris, como si no hubieras
     hecho nada. Y encima la cuenta de arriba sí lo contaba, así que ponía
     «4 de 7» con tres cuadros pintados. Cualquier día con algo apuntado se
     pinta; cuánto se pinta sigue saliendo de las series. */
  function nivelDia(d, max) {
    if (d.series) return Math.min(4, Math.ceil(d.series / max * 4));
    return d.n ? 1 : 0;
  }

  /* Un día en el que hubo algo pero ninguna serie. Se pinta en azul, como la
     barra de actividad del reparto: en verde parecía una semana floja de
     gimnasio en vez de un día de otra cosa. */
  function soloActividad(d) { return !d.series && d.n > 0; }

  /* Y debajo, lo que hubo: las series si las hubo, y si no los minutos, que es
     lo único que tiene una actividad. Un «0» bajo un cuadro verde no se
     entiende. */
  function cifraDia(d) {
    if (d.series) return String(d.series);
    if (d.n && d.minutos) return Tn('{n}′', { n: d.minutos });
    return '·';
  }

  /* Un día con algo dentro se puede tocar y cuenta lo que se hizo. Los dos
     dibujos del mapa lo llevan —la tira de la semana y la rejilla de los
     meses— porque es la misma pregunta hecha delante del mismo cuadrito, y
     que la respuesta dependa del periodo elegido no lo entiende nadie.

     Los días vacíos no: no hay nada que abrir, y un cuadro que se hunde al
     tocarlo para decir «no hiciste nada» es una burla. */
  function marcaTocable(d) {
    return d.n > 0
      ? ' tap" role="button" tabindex="0" data-diases="' + UI.esc(d.k) + '"'
      : '"';
  }

  function tiraSemana(dias, max, hoyKey) {
    return '<div class="tira-sem">' + dias.map(function (d) {
      const f = new Date(d.t);
      return '<div class="ts-dia' + (d.k === hoyKey ? ' hoy' : '') + marcaTocable(d) + '>' +
        '<span class="ts-letra">' + UI.inicialDia(f.getDay()) + '</span>' +
        '<span class="ts-num">' + f.getDate() + '</span>' +
        '<i class="n' + nivelDia(d, max) + (soloActividad(d) ? ' act' : '') + '"></i>' +
        '<span class="ts-series' + (soloActividad(d) ? ' es-act' : '') + '">' +
          UI.esc(cifraDia(d)) + '</span>' +
        '</div>';
    }).join('') + '</div>';
  }

  /* Mapa de calor del rango elegido. Con pocos días va en una fila, día a día;
     con muchos, en columnas de siete, que es como se lee la constancia. */
  function mapaCalor(dias) {
    const max = Math.max.apply(null, dias.map(function (d) { return d.series; }).concat([1]));
    const hoyKey = Store.dayKey(Date.now());
    /* Los meses tambien los sabe decir el sistema, como los dias: una lista
       por idioma es una lista mas que mantener. */
    const MESES = [0,1,2,3,4,5,6,7,8,9,10,11].map(function (m) {
      try {
        return new Date(2024, m, 1).toLocaleDateString(
          Idioma.actual() === 'en' ? 'en-US' : 'es-ES', { month: 'short' })
          .replace('.', '');
      } catch (e) {
        return ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][m];
      }
    });

    /* Con una semana el mapa de cuadros no aporta: siete cuadrados enormes en
       los que cabria escribir lo que hiciste. Ahi se cambia por la tira de
       dias, con su inicial, su numero y cuantas series llevas: la misma
       informacion, legible. */
    if (dias.length <= 8) return tiraSemana(dias, max, hoyKey);

    /* una sola fila solo en la semana: con un mes salían treinta letras de día
       seguidas y no se leía nada */
    const enFila = dias.length <= 14;
    const filas = enFila ? 1 : 7;
    const columnas = Math.ceil(dias.length / filas);

    /* cabecera: días de la semana si van en fila, meses si van en columnas */
    let cabecera;
    if (enFila) {
      cabecera = dias.map(function (d) {
        return UI.inicialDia(new Date(d.t).getDay());
      });
    } else {
      let mesAnterior = -1;
      cabecera = [];
      for (let i = 0; i < dias.length; i += 7) {
        const m = new Date(dias[i].t).getMonth();
        cabecera.push(m !== mesAnterior ? MESES[m] : '');
        mesAnterior = m;
      }
    }

    const celdas = dias.map(function (d) {
      const nivel = nivelDia(d, max);
      /* Decía «descanso» en cualquier día sin series, también en los que hubo
         una actividad. Y estaba sin traducir. */
      const titulo = UI.fechaCorta(d.t) + ': ' + (d.series
        ? Tn('{n} series', { n: d.series }) + (d.volumen ? ', ' + UI.kg(d.volumen) : '')
        : soloActividad(d) ? Tn('{n}′ de actividad', { n: d.minutos })
        : T('descanso'));
      return '<i class="n' + nivel + (soloActividad(d) ? ' act' : '') +
        (d.k === hoyKey ? ' hoy' : '') + marcaTocable(d) +
        ' title="' + esc(titulo) + '"></i>';
    }).join('');

    return html`
      <div class="calor-scroll ${columnas > 26 ? 'ancho' : ''}">
        <div class="calor-caja" style="--cols:${columnas}">
          <div class="calor-meses">
            ${raw(cabecera.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join(''))}
          </div>
          <div class="calor" style="grid-template-rows:repeat(${filas},1fr)">${raw(celdas)}</div>
        </div>
      </div>
      <div class="calor-pie">
        <span>${T('Menos')}</span>
        <i class="n0"></i><i class="n1"></i><i class="n2"></i><i class="n3"></i><i class="n4"></i>
        <span>${T('Más')}</span>
      </div>`;
  }

  /* ---------- vista ---------- */

  /* Qué músculos llevas sin tocar. La cuenta la hace la portada desde
     siempre —necesita el historial entero, no el periodo elegido aquí—, así
     que se le pide a ella en vez de repetirla. */
  function abandonadoHTML() {
    const olvido = App.abandonados ? App.abandonados() : [];
    if (!olvido.length) return '';
    return html`
      <div class="list-title">${T('Lo que llevas abandonado')}</div>
      <div class="card tarjeta-premium">
        <div class="pre-encima">${T('Sin tocar')}</div>
        <div class="pre-num" style="margin:1px 0 12px">${olvido.length}
          <span class="tiny" style="font-weight:600">${olvido.length === 1
            ? T('zona') : T('zonas')}</span></div>
        <div class="stack" style="gap:7px">
          ${raw(olvido.map(function (f) {
            return '<div class="row between"><span style="font-size:.9rem">' +
              esc(I18N.muscle(f.m)) + '</span><span class="tiny">' +
              esc(f.dias === null ? T('nunca')
                : Tp(f.dias, 'hace {n} día', 'hace {n} días')) + '</span></div>';
          }).join(''))}
        </div>
        <p class="tiny" style="margin:11px 0 0">${T('Un músculo que no se toca en más ' +
        'de una semana se estanca. Toca la zona en Ejercicios y te monto la sesión.')}</p>
        <button class="btn sm block" data-a="programa" style="margin-top:9px">
          ${T('Rehacer mi programa con esto en cuenta')}</button>
      </div>`;
  }

  V.progreso = function () {
    const st = Store.stats();
    const sesiones = Store.sessions();
    const porSeries = Store.settings().registro !== 'detallado' || st.totalVolume === 0;

    if (!sesiones.length) {
      return html`
        <h1>${T('Progreso')}</h1>
        <div class="empty" style="padding-top:40px">${raw(icon('grafica'))}
          <p>${T('Aquí verás tu evolución, tu constancia y qué músculos trabajas de más y de menos. Aparece en cuanto termines tu primer entrenamiento.')}</p>
          <button class="btn primary" data-a="ir">${T('Elegir una rutina')}</button>
        </div>`;
    }

    const r = rangoActual();
    const puntos = serie(r, porSeries);

    /* Total del rango y comparación con el periodo anterior de la misma
       duración: es lo que dice si vas a más o a menos. */
    const total = puntos.reduce(function (a, p) { return a + p.y; }, 0);
    const previos = porDia(r.dias * 2).slice(0, r.dias);
    const totalPrevio = previos.reduce(function (a, d) {
      return a + (porSeries ? d.series : d.volumen);
    }, 0);
    const delta = totalPrevio ? Math.round((total - totalPrevio) / totalPrevio * 100) : null;

    const reparto = repartoMuscular(Math.min(r.dias, 90));
    const maxMusculo = reparto.filas.length ? reparto.filas[0].series : 1;

    /* Lo del periodo elegido, que es de lo que va esta pantalla. */
    const desdeT = Date.now() - r.dias * 864e5;
    const enRango = sesiones.filter(function (x) { return x.start >= desdeT; });
    const resumen = {
      sesiones: enRango.length,
      minutos: enRango.reduce(function (a, x) {
        return a + Math.round(((x.end || x.start) - x.start) / 60000);
      }, 0),
      porSemana: Math.round(enRango.length / Math.max(1, r.dias / 7) * 10) / 10
    };

    /* récords ordenados por peso */
    const prs = [];
    const vistos = {};
    sesiones.forEach(function (s) {
      (s.entries || []).forEach(function (e) {
        if (vistos[e.exId]) return;
        vistos[e.exId] = true;
        const p = Store.prOf(e.exId);
        if (p.best && p.best.weight > 0) {
          prs.push({ exId: e.exId, name: nombreEj(e), pr: p.best });
        }
      });
    });
    prs.sort(function (a, b) { return b.pr.weight - a.pr.weight; });

    return html`
      <h1>${T('Progreso')}</h1>

      <!-- El periodo manda sobre toda la pantalla, no solo sobre la grafica:
           tambien cambia el mapa de constancia y el reparto por zona. Debajo
           del titulo de la grafica parecia el mando de esa caja, y para cambiar
           de mes habia que buscarlo a media pantalla.

           Y una sola pieza en vez de cinco pastillas sueltas. Cinco pastillas
           puestas en fila son cinco botones que da la casualidad de que van
           juntos: no se ve que sean las cinco caras de una misma pregunta, y
           la elegida se distinguia solo por el color. Ademas se iban de ancho
           y habia que arrastrarlas, asi que «Año» vivia fuera de la pantalla.
           Aqui caben las cinco de una vez, que es lo que hace que se compare
           un periodo con otro sin buscarlo. -->
      <div class="segmento segmento-auto periodo-arriba" role="tablist">
        ${raw(RANGOS.map(function (x) {
          return '<button class="' + (x.id === rango ? 'on' : '') +
            '" role="tab" aria-selected="' + (x.id === rango ? 'true' : 'false') +
            '" data-rango="' + x.id + '">' + esc(T(x.label)) + '</button>';
        }).join(''))}
      </div>

      <!-- Las cuatro cifras, del periodo elegido y no de toda la vida. Antes
           eran totales historicos: no cambiaban al tocar los botones de arriba,
           y una de ellas repetia el numero de la grafica. Ahora las cuatro
           contestan a «¿como voy en estos tres meses?», que es la pregunta de
           esta pantalla. La racha se queda como esta: una racha es de hoy, no
           de un periodo. -->
      <div class="stats">
        <div class="stat"><b>${resumen.sesiones}</b><span>${T('Entrenos')}</span></div>
        <div class="stat"><b>${resumen.porSemana}</b><span>${T('Por semana')}</span></div>
        <div class="stat"><b>${st.streak}</b><span>${T('Racha')}</span></div>
        <div class="stat"><b>${resumen.minutos < 60 ? resumen.minutos + 'm'
          : Math.round(resumen.minutos / 60) + 'h'}</b><span>${T('Tiempo')}</span></div>
      </div>

      <div class="list-title">${porSeries ? T('Series completadas')
        : T('Volumen levantado')}</div>

      <div class="card graf-caja tarjeta-premium">
        <div class="row between" style="align-items:flex-end;margin-bottom:6px">
          <div>
            <div class="pre-encima">${porSeries ? T('Series') : T('Volumen')}</div>
            <div class="graf-dato">${UI.num(total)}</div>
            <div class="tiny">${porSeries ? T('series') : (Store.settings().unit || 'kg')}
              ${Tn('en {p}', { p: T(r.frase) })}</div>
          </div>
          <!-- La diferencia con el periodo anterior, al lado del numero y no
               en una etiqueta con seis palabras: es la segunda cosa que se mira
               y con la flecha se lee sin terminar de leerla. -->
          ${raw(delta === null ? '' : html`
            <span class="delta ${delta >= 0 ? 'sube' : 'baja'}">
              ${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}%
              <span class="tiny">${T('vs. antes')}</span></span>`)}
        </div>
        ${raw(grafica(puntos, porSeries ? 'series' : 'kg'))}
        <div class="tiny" style="margin-top:8px">${r.paso === 'dia'
          ? T('Un punto por día') : T('Un punto por semana')}</div>
      </div>

      <div class="list-title">${T('Constancia')}</div>
      <div class="card tarjeta-premium">
        <!-- El rotulo con la cuenta: el mapa dice como se reparten los dias,
             pero cuantos son hay que contarlos a ojo cuadro a cuadro. -->
        <div class="pre-encima">${T('Días entrenados')}</div>
        <div class="pre-num" style="margin:1px 0 10px">${diasEntrenados(r.dias)}
          <span class="tiny" style="font-weight:600">${Tn('de {n}', { n: r.dias })}</span></div>
        ${raw(mapaCalor(porDia(r.dias)))}
        <p class="tiny" style="margin:10px 0 0">${r.dias <= 8
          ? T('El número de abajo son las series de ese día, o los minutos si fue una actividad.')
          : T('Un cuadro por día.')} ${T('Los huecos también cuentan: el descanso forma parte del plan.')}</p>
      </div>

      ${raw(reparto.total || planPorZona().total ||
        Object.keys(reparto.minutos || {}).length ? html`
        <div class="list-title">${Tn('Reparto por zona ({n} días)',
          { n: Math.min(r.dias, 90) })}</div>
        <div class="card tarjeta-premium">
          ${raw(reparto.total && reparto.filas.length ? '<div class="pre-encima">' +
            esc(T('Lo que más trabajas')) + '</div>' +
            '<div class="pre-num" style="margin:1px 0 12px">' + esc(T(reparto.filas[0].label)) +
            ' <span class="tiny" style="font-weight:600">' +
            esc(Tn('{n}% de las series',
              { n: Math.round(reparto.filas[0].series / reparto.total * 100) })) + '</span></div>'
            : '')}
          ${raw(zonasHTML(reparto, r))}
        </div>` : '')}

      <!-- Y al lado, lo contrario: lo que no tocas. Estaba plegado al fondo de
           la portada, y ahí era un dato de historial metido entre cosas de hoy.
           Aquí va con su pareja: lo que más trabajas, arriba; lo que llevas
           abandonado, debajo. -->
      ${raw(abandonadoHTML())}

      ${raw(pesoHTML(r.dias))}

      ${raw(ejerciciosHTML(porEjercicio(sesiones, desdeT)))}

      ${raw(metasHTML())}

      <!-- Los récords, en una sola lista con su medalla: doce tarjetas sueltas
           eran doce cajas iguales seguidas, y lo que se mira de un récord es el
           peso, no la caja. -->
      ${raw(prs.length ? html`
        <div class="list-title">${T('Récords personales')}${raw((function () {
          const nuevos = prs.filter(function (x) { return x.pr.date >= desdeT; }).length;
          return nuevos ? ' <span class="chip solid tiny-chip">' +
            esc(Tp(nuevos, '{n} nuevo', '{n} nuevos')) + '</span>' : '';
        })())}</div>
        <div class="card lista-prs tarjeta-premium">
          <div class="ejs-cab row between">
            <div class="grow" style="min-width:0">
              <div class="pre-encima">${T('Tu marca más alta')}</div>
              <div class="pre-num">${UI.kg(prs[0].pr.weight)}</div>
            </div>
            <span class="chip nowrap">${prs[0].name}</span>
          </div>
          ${raw(prs.slice(0, 12).map(function (p, i) {
            return html`
              <button class="fila-pr" data-ex="${p.exId}" style="--turno:${i}">
                <span class="pr-ico">${raw(icon('trofeo'))}</span>
                <span class="grow">
                  <span class="pr-tit">${p.name}${raw(p.pr.date >= desdeT
                    ? ' <span class="pr-nuevo">' + esc(T('nuevo')) + '</span>' : '')}</span>
                  <span class="pr-sub">${UI.fecha(p.pr.date)}</span>
                </span>
                <span class="pr-marca">${UI.kg(p.pr.weight)} × ${p.pr.reps}</span>
              </button>`;
          }).join(''))}
        </div>` : '')}

      <div class="list-title">${T('Historial')}</div>
      ${raw(historialHTML(sesiones))}`;
  };

  /* ---------- metas ----------
     El progreso vive en objetivos.js, que ya sabe leerlo solo de los datos.
     Aquí se enseña donde se mira la evolución, que es donde uno quiere verlo:
     un anillo por meta con el porcentaje y lo que falta. */
  function metasHTML() {
    const metas = Objetivos.lista();
    if (!metas.length) {
      return html`
        <div class="list-title">${T('Tus metas')}</div>
        <div class="card center tarjeta-premium">
          <p class="muted" style="margin-bottom:12px">${T('Ponte una meta y la verás ' +
          'avanzar aquí sola: llegar a un peso, entrenar x veces por semana, una racha o ' +
          'un récord en un ejercicio.')}</p>
          <button class="btn primary block" data-a="metas">${T('Crear mi primera meta')}</button>
        </div>`;
    }

    const hechas = metas.filter(function (m) { return m.logrado; }).length;

    return html`
      <div class="list-head">
        <span class="list-title">${T('Tus metas')}${raw(hechas
          ? ' <span class="chip solid tiny-chip">' + hechas + ' cumplida' +
            (hechas === 1 ? '' : 's') + '</span>' : '')}</span>
        <button class="btn sm ghost" data-a="metas">Gestionar</button>
      </div>
      <div class="stack">
        ${raw(metas.map(function (m) {
          const p = Objetivos.progreso(m);
          const pct = Math.round(p.pct * 100);
          const t = Objetivos.TIPOS[m.tipo] || {};
          const falta = Math.abs((Number(m.meta) || 0) - p.actual);

          return html`
            <div class="card meta tarjeta-premium ${p.cumplido ? 'lograda' : ''}">
              ${raw(anillo(pct, p.cumplido))}
              <div class="grow" style="min-width:0">
                <div class="meta-t">${Objetivos.etiqueta(m)}</div>
                <div class="tiny">${Objetivos.formato(m, p.actual)}
                  ${Tn('de {meta}', { meta: Objetivos.formato(m, m.meta) })}</div>
                <div class="tiny" style="margin-top:3px;color:${raw(p.cumplido
                  ? 'var(--acc)' : 'var(--dim2)')}">${raw(p.cumplido
                  ? esc(Tn('Cumplida el {fecha}', { fecha: UI.fechaCorta(m.logrado) }))
                  : esc(loQueFalta(m, falta)))}</div>
              </div>
            </div>`;
        }).join(''))}
      </div>`;
  }

  /* "Te falta 1 sesión", no "Te faltan 1 sesiones" */
  function loQueFalta(m, falta) {
    /* El plural ya lo resuelve el propio formato de la meta, que sabe si son
       sesiones o días; aquí solo hay que concordar el verbo. */
    const txt = Objetivos.formato(m, falta);
    return Tp(Math.round(falta), 'Te falta {que}', 'Te faltan {que}').replace('{que}', txt);
  }

  /* Anillo de progreso: un círculo con el trazo recortado al porcentaje */
  function anillo(pct, cumplida) {
    const R = 20, C = 2 * Math.PI * R;
    const corte = C * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return html`
      <svg class="anillo ${cumplida ? 'ok' : ''}" viewBox="0 0 48 48" aria-hidden="true">
        <circle class="anillo-fondo" cx="24" cy="24" r="${R}"/>
        <circle class="anillo-arco" cx="24" cy="24" r="${R}"
                stroke-dasharray="${C}" stroke-dashoffset="${corte}"/>
        <text x="24" y="24" class="anillo-txt">${pct}<tspan class="anillo-pc">%</tspan></text>
      </svg>`;
  }

  /* Una frase que diga algo del reparto, no solo los porcentajes */
  /* planVsRealHTML se fue: lo que contaba vive ahora en zonasHTML, en la misma
     tabla que el reparto. Eran dos graficas de barras iguales, una debajo de
     la otra. */

  /* ---------- una sola tabla de zonas ----------
     Eran dos graficas de barras por zona, una debajo de la otra y con la misma
     pinta: el reparto de lo que haces y lo que pide el plan. Dos dibujos casi
     identicos para dos preguntas que en realidad son una sola —de lo que
     entreno, cuanto va a cada zona, y cuadra con lo que deberia—.

     Ahora es una fila por zona: tu barra, una muesca donde esta lo que pide el
     plan y, a la derecha, las dos cifras. Donde la barra no llega a la muesca,
     vas corto. Se lee de un vistazo y ocupa la mitad. */
  /* ---------- pasarse ----------
     La app te decía dónde te quedabas corto y se callaba cuando te pasabas. Con
     un plan que pide once series de pecho y treinta y cuatro hechas, esa
     asimetría deja sin decir justo lo que más cuesta ver desde dentro.

     Pero el disparador no puede ser «el triple de lo que pide tu plan»: tu plan
     puede estar mal escrito, y entonces lo que está mal es el once, no el
     treinta y cuatro. Se mide contra lo que sirve para crecer —de diez a veinte
     series por grupo a la semana, y por encima de ahí lo que se añade es
     fatiga— y se cruza con si esa zona está avanzando.

     Volumen alto y subiendo peso es entrenar duro, y ahí no hay nada que decir.
     Volumen alto y semanas sin mover una barra es cavar un agujero, y eso sí
     merece una frase. */
  const TOPE_UTIL = 20;

  function excesoHTML(ids, hecho, plan, etiqueta, rango) {
    const pasados = ids.filter(function (id) {
      return (hecho[id] || 0) > TOPE_UTIL;
    }).sort(function (a, b) { return (hecho[b] || 0) - (hecho[a] || 0); });

    if (!pasados.length || !g.Progresion || !Progresion.zonaAvanza) return '';

    const dias = Math.min(rango.dias, 35);
    const atascadas = [];
    const duras = [];

    pasados.forEach(function (id) {
      const av = Progresion.zonaAvanza(id, dias);
      /* Sin con qué comparar no se dice nada: puede que lleve dos semanas con
         ese volumen y vaya estupendamente. */
      if (!av) return;
      (av.avanza ? duras : atascadas).push({ id: id, series: hecho[id] || 0, av: av });
    });

    if (!atascadas.length && !duras.length) return '';

    const nombres = function (lista) {
      return lista.map(function (x) { return etiqueta(x.id).toLowerCase(); }).join(', ');
    };

    if (atascadas.length) {
      const uno = atascadas[0];
      return '<div class="aviso-exceso">' +
        '<span class="ae-ico">' + icon('aviso') + '</span>' +
        '<span class="grow"><b>' + esc(Tn('{n} series de {zona} a la semana, y sin subir',
          { n: Math.round(uno.series), zona: etiqueta(uno.id).toLowerCase() })) + '</b>' +
        '<span class="tiny">' + esc(Tn('Por encima de veinte series lo que se añade es ' +
          'fatiga, no músculo, y en {cuando} ninguno de los {cuantos} ejercicios de esa ' +
          'zona ha subido de peso. Baja el volumen una semana y vuelve: es cuando se crece.',
          { cuando: dias === 35 ? T('las últimas cinco semanas') : T('este periodo'),
            cuantos: uno.av.ejercicios })) +
        (atascadas.length > 1
          ? ' ' + esc(Tn('Lo mismo con {lista}.', { lista: nombres(atascadas.slice(1)) }))
          : '') +
        '</span></span></div>';
    }

    const uno = duras[0];
    return '<div class="aviso-exceso ok">' +
      '<span class="ae-ico">' + icon('up') + '</span>' +
      '<span class="grow"><b>' + esc(Tn('{n} series de {zona} a la semana',
        { n: Math.round(uno.series), zona: etiqueta(uno.id).toLowerCase() })) + '</b>' +
      '<span class="tiny">' + esc(T('Es mucho —de diez a veinte es lo que suele hacer ' +
      'falta—, pero estás subiendo peso, así que te lo estás recuperando. Si un día se ' +
      'para el progreso, ahí es donde hay que recortar.')) + '</span></span></div>';
  }

  function zonasHTML(reparto, rango) {
    const plan = planPorZona();
    const semanas = Math.max(1, Math.round(Math.min(rango.dias, 90) / 7));

    const hecho = {};
    reparto.filas.forEach(function (f) {
      hecho[f.id] = Math.round(f.series / semanas * 10) / 10;
    });

    const etiqueta = function (id) {
      const r2 = I18N.REGIONES.find(function (x) { return x.id === id; });
      return r2 ? T(r2.label) : id;
    };
    /* Aqui se escribe en espanol: 2,2 y no 2.2 */
    const coma = function (n2) { return UI.dec(n2); };

    /* ---------- la actividad, dentro de la barra de su zona ----------
       Antes era una fila azul entera debajo de cada zona. Con su propia escala
       —minutos, que no son series— la más larga salía siempre al 100%, así que
       la barra más larga de la pantalla era la actividad, justo encima de un
       título que dice que lo que más trabajas es otra cosa. Y dos filas por
       zona hacían el cuadro el doble de alto sin decir el doble.

       Ahora es una marca en el extremo de la barra de la zona. NO mide series
       y no se suma al número: dice que ahí además hubo movimiento. Los datos
       —minutos, qué fue y qué movió— están al tocarla, que es donde hay sitio
       para contarlos sin mentir por el camino. */
    const mins = reparto.minutos || {};
    const topeMin = Math.max.apply(null, Object.keys(mins).map(function (id) {
      return mins[id];
    }).concat([1]));

    /* Entre el 12 y el 32% de la pista. Varía con los minutos, porque entre dos
       zonas eso sí es una comparación honesta, y va acotado porque contra las
       series no lo es: sin tope, una zona con actividad y sin series tendría la
       barra llena. */
    const anchoMarca = function (id) {
      return Math.round(12 + (mins[id] / topeMin) * 20);
    };

    /* «cuádriceps, isquiotibiales y glúteos». En minúscula porque van dentro de
       una frase y no encabezando su fila, que es donde el catálogo los da con
       mayúscula. */
    const listaMusculos = function (ms) {
      const l = (ms || []).map(function (m) {
        const n = String(I18N.muscle(m) || '');
        return n ? n.charAt(0).toLowerCase() + n.slice(1) : '';
      }).filter(Boolean);
      if (!l.length) return '';
      if (l.length === 1) return l[0];
      return Tn('{lista} y {ultimo}',
        { lista: l.slice(0, -1).join(', '), ultimo: l[l.length - 1] });
    };

    /* Lo que necesita la hoja al tocar la marca. Se guarda aquí porque el
       enganche corre después del render y no vuelve a ver estas cuentas. */
    actividadPorZona = {};
    Object.keys(mins).forEach(function (id) {
      actividadPorZona[id] = {
        zona: etiqueta(id),
        dias: rango.dias,
        minutos: mins[id],
        series: hecho[id] || 0,
        actividades: (reparto.actividades || {})[id] || [],
        musculos: listaMusculos((reparto.musculos || {})[id])
      };
    });

    const ids = [];
    reparto.filas.forEach(function (f) { if (ids.indexOf(f.id) === -1) ids.push(f.id); });
    Object.keys(plan.zonas).forEach(function (id) {
      if (plan.zonas[id] > 0 && ids.indexOf(id) === -1) ids.push(id);
    });
    /* Una zona que solo tiene actividad también sale: si el domingo jugaste,
       el core tiene algo que enseñar aunque no hayas hecho una serie. */
    Object.keys(mins).forEach(function (id) {
      if (mins[id] > 0 && ids.indexOf(id) === -1) ids.push(id);
    });
    if (!ids.length) return '';

    ids.sort(function (a, b) { return (plan.zonas[b] || 0) - (plan.zonas[a] || 0); });

    const tope = Math.max.apply(null, ids.map(function (id) {
      return Math.max(plan.zonas[id] || 0, hecho[id] || 0);
    }).concat([1]));

    let peor = null;
    if (plan.total) {
      ids.forEach(function (id) {
        const falta = (plan.zonas[id] || 0) - (hecho[id] || 0);
        if (!peor || falta > peor.falta) peor = { id: id, falta: falta };
      });
    }

    return html`
      <div class="zonas">
        ${raw(ids.map(function (id) {
          const pide = Math.round((plan.zonas[id] || 0) * 10) / 10;
          const hace = hecho[id] || 0;
          const corto = plan.total && pide > 0 && hace < pide * 0.8;
          return html`
            <div class="zona-fila">
              <span class="zona-nom">${etiqueta(id)}</span>
              <span class="zona-pista">
                <i class="zona-hago ${corto ? 'corto' : ''}"
                   style="width:${Math.round(hace / tope * 100)}%"></i>
                ${raw(pide > 0 ? '<b class="zona-pide" style="left:' +
                  Math.round(pide / tope * 100) + '%"></b>' : '')}
                ${raw(mins[id] ? '<button type="button" class="zona-marca" data-zact="' +
                  esc(id) + '" style="width:' + anchoMarca(id) + '%" aria-label="' +
                  esc(Tn('{n}′ de actividad en {zona}. Toca para ver qué fue.',
                    { n: mins[id], zona: etiqueta(id) })) + '"></button>' : '')}
              </span>
              <span class="zona-num">${coma(hace)}${raw(pide > 0
                ? '<span class="zona-de"> / ' + coma(pide) + '</span>' : '')}</span>
            </div>
`;
        }).join(''))}
      </div>

      <div class="zona-leyenda tiny">
        <span><i class="zl-hago"></i> ${T('series por semana que haces')}</span>
        ${raw(plan.total ? '<span><i class="zl-pide"></i> ' +
          esc(T('lo que pide tu plan')) + '</span>' : '')}
        ${raw(Object.keys(mins).length ? '<span><i class="zl-act"></i> ' +
          esc(T('actividad · toca el azul')) + '</span>' : '')}
      </div>

      ${raw(excesoHTML(ids, hecho, plan, etiqueta, rango))}

      ${raw(peor && peor.falta > 0.5
        ? '<p class="tiny" style="margin:9px 0 0">' + Tn('Donde más te separas es ' +
          '{zona}: tu plan pide {pide} series por semana y estás haciendo {haces}.',
          { zona: '<b>' + esc(etiqueta(peor.id)) + '</b>',
            pide: coma(Math.round((plan.zonas[peor.id] || 0) * 10) / 10),
            haces: coma(hecho[peor.id] || 0) }) + '</p>'
        : reparto.total
        ? '<p class="tiny" style="margin:9px 0 0">' + pistaReparto(reparto) + '</p>'
        : '<p class="tiny" style="margin:9px 0 0">' +
          esc(T('Todavía no has completado series en este periodo.')) + '</p>')}`;
  }

  function pistaReparto(r) {
    const nombres = r.filas.map(function (f) { return f.id; });
    const falta = I18N.GROUPS.filter(function (gr) { return nombres.indexOf(gr.id) === -1; });
    if (falta.length) {
      return esc(Tn('En este periodo no has entrenado {lista}.',
        { lista: falta.map(function (f) { return T(f.label).toLowerCase(); }).join(', ') }));
    }
    const arriba = r.filas[0], abajo = r.filas[r.filas.length - 1];
    if (arriba.series > abajo.series * 3) {
      return esc(Tn('{mas} se lleva el triple que {menos}. Si no es a propósito, ' +
        'conviene equilibrarlo.',
        { mas: arriba.label, menos: String(abajo.label).toLowerCase() }));
    }
    return esc(T('Reparto equilibrado entre las zonas que entrenas.'));
  }

  /* ---------- el historial, por semanas ----------
     Una lista plana de entrenamientos crece sin fin: a los tres meses son
     cincuenta tarjetas y encontrar la del martes pasado es bajar y bajar. Se
     agrupa por semana, cada una plegable como el menú del día —una línea fina
     que dice de cuándo a cuándo y cuántos entrenos hubo— y solo la semana en
     curso viene abierta, que es la que se mira. */
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  /* Qué semanas quedan abiertas. Fuera del pintado porque esta pantalla se
     repinta entera al borrar una sesión o al cambiar de rango. */
  const semanasAbiertas = {};

  function lunesDe(t) {
    const d = new Date(t);
    const dia = (d.getDay() + 6) % 7;           // lunes = 0
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - dia).getTime();
  }

  function tituloSemana(lunes) {
    const hoyLunes = lunesDe(Date.now());
    if (lunes === hoyLunes) return T('Esta semana');
    if (lunes === hoyLunes - 7 * 86400000) return T('La semana pasada');

    /* Con UI.fechaCorta, que ya pone el día y el mes en el orden del idioma. */
    const a = new Date(lunes);
    const b = new Date(lunes + 6 * 86400000);
    return Tn('Del {a} al {b}',
      { a: UI.fechaCorta(a.getTime()), b: UI.fechaCorta(b.getTime()) });
  }

  /* Qué se trabajó en una sesión. De los ejercicios si los hubo, y de lo que
     dijo la IA si fue una actividad de fuera del gimnasio. Sin esto el historial
     decía «19 series» y había que abrirlo para saber de qué. */
  /* De qué hora a qué hora. La duración ya estaba —«75:07»— pero un rato no
     dice cuándo: entrenar setenta y cinco minutos a las seis de la mañana y
     hacerlo a las nueve de la noche son dos días distintos, y al mirar atrás
     eso es justo lo que uno reconoce.

     Se pinta solo si la sesión llegó a cerrarse: sin final no hay franja que
     contar, y repetir la hora de inicio dos veces no añade nada. */
  function horaDe(t) {
    const d = new Date(t);
    return UI.hora(d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2));
  }

  function franjaHorasHTML(s) {
    if (!s.end || s.end <= s.start) return '';
    return '<div class="ses-horas">' + icon('timer') +
      esc(horaDe(s.start)) + '<span>→</span>' + esc(horaDe(s.end)) + '</div>';
  }

  /* Los músculos de una sesión, con cuántas series se llevó cada uno.

     Una serie cuenta entera para cada músculo principal del ejercicio, que es
     como las cuenta el reparto por zona: media serie de pecho no existe, y
     repartirla haría que seis series de press sumaran tres.

     Ordenados de más a menos, porque así el primero dice de qué fue la sesión
     sin tener que sumar nada. Lo apuntado a mano dice qué movió pero no en
     cuántas series, y entonces el chip se queda sin cifra. */
  function musculosConSeries(s) {
    const cuenta = {};
    (s.entries || []).forEach(function (e) {
      const ex = g.Data ? Data.get(e.exId) : null;
      if (!ex) return;
      const hechas = (e.sets || []).filter(function (x) { return x.done; }).length;
      if (!hechas) return;
      (ex.primaryMuscles || []).forEach(function (m) {
        cuenta[m] = (cuenta[m] || 0) + hechas;
      });
    });
    (s.musculos || []).forEach(function (m) {
      if (!Object.prototype.hasOwnProperty.call(cuenta, m)) cuenta[m] = 0;
    });
    return Object.keys(cuenta)
      .sort(function (a, b) { return cuenta[b] - cuenta[a]; })
      .slice(0, 6)
      .map(function (m) { return { nombre: I18N.muscle(m), series: cuenta[m] }; });
  }

  function chipsMusculosHTML(s) {
    const lista = musculosConSeries(s);
    if (!lista.length) return '';
    return '<div class="ses-musculos">' + lista.map(function (x) {
      return '<span class="chip-musculo">' + esc(x.nombre) +
        (x.series ? '<i>' + esc(UI.num(x.series)) + '</i>' : '') + '</span>';
    }).join('') + '</div>';
  }

  /* Si tiene puesto «solo cuento las series», el peso no se enseña en ninguna
     parte. En ese modo él no anota kilos, así que un «63,8×10» es un número que
     no puso; y si viene de cuando sí los anotaba, es un número que ya no mide
     su progreso, porque eligió medirlo por series. Lo guardado no se toca: deja
     de pintarse, que no es lo mismo.

     Se mira el ajuste de ahora y no lo que traiga la sesión: la pregunta es
     cómo quiere leer su historial hoy, no cómo lo escribió entonces. */
  function conPesos() { return Store.settings().registro === 'detallado'; }

  function seriesHechasHTML(hechas) {
    if (conPesos()) {
      return hechas.map(function (x) { return UI.num(x.weight) + '×' + x.reps; }).join(' · ');
    }
    return Tp(hechas.length, '{n} serie', '{n} series');
  }

  function lineaSesion(s) {
    const dura = UI.mmss(((s.end || s.start) - s.start) / 1000);
    const que = s.manual
      ? T('apuntado a mano') + (s.kcal ? ' · ' + Tn('~{n} kcal', { n: UI.num(s.kcal) }) : '')
      : s.actividad && !s.setsDone
      ? Tn('~{n} kcal', { n: UI.num(s.kcal || 0) })
      : Tn('{n} series', { n: s.setsDone }) +
        (conPesos() && s.volume ? ' · ' + UI.kg(s.volume) : '');
    return que + ' · ' + dura;
  }

  /* ---------- lo que se hizo un día ----------
     El mapa de constancia dice que ese día hubo entreno y ahí se queda: un
     cuadro verde no cuenta si fue pierna o fue una carrera, y esa es justo la
     pregunta que se hace uno al verlo. El dato ya estaba —es el mismo del
     historial—, solo que dos pantallas más abajo y ordenado por semanas.

     Se enseña lo mismo que la fila del historial, sin el botón de borrar: esto
     es una consulta desde una gráfica, y un cubo de basura al lado de un dato
     que se ha venido a mirar solo sirve para tocarlo sin querer. */
  function hojaDiaEntrenado(clave) {
    const delDia = Store.sessions().filter(function (s) {
      return Store.dayKey(s.start) === clave;
    }).sort(function (a, b) { return a.start - b.start; });
    if (!delDia.length) return;

    const series = delDia.reduce(function (n, s) { return n + (s.setsDone || 0); }, 0);
    const volumen = delDia.reduce(function (n, s) { return n + (s.volume || 0); }, 0);
    const minutos = delDia.reduce(function (n, s) {
      return n + Math.round(((s.end || s.start) - s.start) / 60000);
    }, 0);

    /* El total del día solo cuando hay más de un entreno: con uno repetiría
       palabra por palabra la línea que viene justo debajo. */
    const total = delDia.length > 1 ? [
      series ? Tn('{n} series', { n: series }) : '',
      volumen ? UI.kg(volumen) : '',
      minutos ? Tn('{n} min', { n: minutos }) : ''
    ].filter(Boolean).join(' · ') : '';

    /* El título sin la hora: es el resumen de un día entero y cada sesión trae
       la suya debajo. Con «Hoy · 13:11» arriba, esa hora se lee como si todo lo
       de abajo hubiera pasado a esa hora. */
    const ahora = new Date();
    const prim = new Date(delDia[0].start);
    const titulo = prim.toDateString() === ahora.toDateString() ? T('Hoy')
      : new Date(ahora.getTime() - 864e5).toDateString() === prim.toDateString() ? T('Ayer')
      : UI.fechaCorta(delDia[0].start);

    UI.modal(html`
      <h2>${titulo}</h2>
      ${raw(total ? '<p class="muted" style="margin:-4px 0 12px">' +
        esc(total) + '</p>' : '')}
      <div class="stack">
        ${raw(delDia.map(function (s) {
          const hechos = (s.entries || []).filter(function (e) {
            return (e.sets || []).some(function (x) { return x.done; });
          });
          return '<div class="card">' +
            '<div style="font-weight:700">' + esc(Store.nombreDeSesion(s)) + '</div>' +
            '<div class="tiny" style="margin-top:2px">' + esc(lineaSesion(s)) + '</div>' +
            franjaHorasHTML(s) +
            chipsMusculosHTML(s) +
            (hechos.length ? '<div class="stack dia-ejes">' + hechos.map(function (e) {
              const st = (e.sets || []).filter(function (x) { return x.done; });
              return '<div class="row between" style="font-size:.84rem;gap:10px">' +
                '<span class="grow">' + esc(nombreEj(e)) + '</span>' +
                '<span class="tiny nowrap">' + esc(seriesHechasHTML(st)) +
                '</span></div>';
            }).join('') + '</div>' : '') +
            '</div>';
        }).join(''))}
      </div>
      <button class="btn block" data-cerrar style="margin-top:14px">${T('Vale')}</button>`,
      function (el) {
        el.querySelector('[data-cerrar]').onclick = UI.closeModal;
      });
  }

  function sesionHTML(s) {
    return html`
      <div class="ses-fila">
        <div class="row between" style="gap:10px">
          <div class="grow" style="cursor:pointer;min-width:0" data-ses="${s.id}">
            <div style="font-weight:700;font-size:.92rem">${Store.nombreDeSesion(s)}</div>
            <div class="tiny">${UI.fecha(s.start)} · ${lineaSesion(s)}</div>
            <!-- Se apuntó sin cobertura y las cifras son las del chip. Se dice
                 en vez de callarlo: un número provisional que no avisa de que
                 lo es se lee como medido, y luego cambia solo. -->
            ${raw(g.Pendientes && Pendientes.esPendiente(s)
              ? '<div class="ses-medias">' + T('A falta de afinar con internet') + '</div>'
              : '')}
            ${raw(chipsMusculosHTML(s))}
          </div>
          <button class="btn icon sm danger" data-delses="${s.id}"
                  aria-label="${T('Borrar')}">${raw(icon('trash'))}</button>
        </div>
        <div class="stack" data-detail="${s.id}" hidden style="margin-top:9px">
          ${raw((s.entries || []).map(function (e) {
            const hechas = (e.sets || []).filter(function (x) { return x.done; });
            if (!hechas.length) return '';
            return html`<div class="row between" style="font-size:.82rem">
              <span class="grow">${nombreEj(e)}</span>
              <span class="tiny">${seriesHechasHTML(hechas)}</span></div>`;
          }).join(''))}
        </div>
      </div>`;
  }

  function historialHTML(sesiones) {
    if (!sesiones.length) return '';

    const orden = [];
    const grupos = {};
    sesiones.slice(0, 120).forEach(function (s) {
      const k = lunesDe(s.start);
      if (!grupos[k]) { grupos[k] = []; orden.push(k); }
      grupos[k].push(s);
    });

    const estaSemana = lunesDe(Date.now());

    return '<div class="stack">' + orden.map(function (k) {
      const lista = grupos[k];
      const abierta = k === estaSemana ? semanasAbiertas[k] !== false : !!semanasAbiertas[k];
      const series = lista.reduce(function (n, s) { return n + (s.setsDone || 0); }, 0);

      return html`
        <details class="card plegable-fino sem-caja${raw(k === estaSemana ? ' es-ahora' : '')}"
                 data-sem="${k}"${raw(abierta ? ' open' : '')}>
          <summary>
            <span class="chevron down sec-flecha">${raw(icon('chevron'))}</span>
            <span class="grow">${tituloSemana(k)}</span>
            <span class="tiny nowrap">${Tp(lista.length, '{n} entreno', '{n} entrenos')}${raw(
              series ? ' · ' + esc(Tn('{n} series', { n: series })) : '')}</span>
          </summary>
          <div class="fino-cuerpo">
            ${raw(lista.map(sesionHTML).join(''))}
          </div>
        </details>`;
    }).join('') + '</div>';
  }

  /* Al tocar la marca azul. La barra dice que ahí hubo algo; los números van
     aquí, que es donde caben sin tener que fingir que son series. */
  function hojaActividad(id) {
    const d = actividadPorZona[id];
    if (!d) return;

    const filas = d.actividades.map(function (a) {
      const ms = (a.musculos || []).map(function (m) {
        const n = String(I18N.muscle(m) || '');
        return n ? n.charAt(0).toLowerCase() + n.slice(1) : '';
      }).filter(Boolean).join(', ');
      return '<div class="list-row"><div class="grow">' +
        '<div class="list-row-title">' + esc(a.nombre || T('Actividad')) + '</div>' +
        (ms ? '<div class="list-row-sub">' + esc(ms) + '</div>' : '') +
        '</div><span class="act-min">' + esc(Tn('{n}′', { n: a.min })) + '</span></div>';
    }).join('');

    UI.modal(html`
      <h2>${Tn('{n}′ de actividad', { n: d.minutos })}</h2>
      <p class="muted">${Tn('Lo que hiciste fuera del gimnasio y que trabaja {zona}.',
        { zona: d.zona.toLowerCase() })}</p>
      <div class="list">${raw(filas)}</div>
      ${raw(hayIA() ? '<p class="ia-equiv tiny" id="ia-equiv">' + icon('chispa') +
        '<span>' + esc(T('Preguntando a la IA…')) + '</span></p>' : '')}
      <p class="tiny" style="margin:12px 0 0">${Tn('Estos minutos no cuentan en tus ' +
        '{series} series de {zona}, y por eso van en azul y aparte. Lo de fuera carga el ' +
        'músculo igual, pero para meterlo en la barra habría que inventarse cuántas ' +
        'series vale, y ese número estropearía la única cifra con la que puedes comparar ' +
        'una semana con otra.', { series: UI.dec(d.series), zona: d.zona.toLowerCase() })}</p>
      <button class="btn block" data-cerrar>${T('Vale')}</button>`,
      function (el) {
        el.querySelectorAll('[data-cerrar]').forEach(function (b) {
          b.onclick = UI.closeModal;
        });
        pintarEquivalencia(el, d);
      });
  }

  function hayIA() {
    return !!(g.IA && IA.activa && IA.activa() && IA.seriesDeActividad);
  }

  /* La estimación llega después de que la hoja esté abierta. Si falla —sin red,
     sin cuota— la línea se va entera: media frase de la IA es peor que ninguna,
     y lo que había que contar ya está contado debajo. */
  function pintarEquivalencia(el, d) {
    const hueco = el.querySelector('#ia-equiv');
    if (!hueco || !hayIA()) return;

    IA.seriesDeActividad(d).then(function (r) {
      const partes = [];
      if (r.series) {
        partes.push(Tn('La IA lo estima en unas {n} series de {zona}. Es su opinión, ' +
          'no una medida.', { n: r.series, zona: d.zona.toLowerCase() }));
      }
      if (r.nota) partes.push(r.nota);
      if (!partes.length) { hueco.remove(); return; }
      /* textContent: esto viene de fuera y no se pinta como código. */
      hueco.querySelector('span').textContent = partes.join(' ');
    }).catch(function () { hueco.remove(); });
  }

  /* La portada también la abre. La tarjeta de «ya entrenaste» pregunta lo
     mismo que un día del mapa de Progreso —qué hice ese día—, así que abre la
     misma hoja en vez de tener su propia versión a medias. Va colgada de la
     vista, como `mount`, para no estrenar un global por una función. */
  V.progreso.hojaDia = hojaDiaEntrenado;

  V.progreso.mount = function (root) {
    bind(root, '[data-a=ir]', function () { go('rutinas'); });

    bind(root, '[data-a=metas]', function () { go('objetivos'); });
    bind(root, '[data-a=programa]', function () { go('programa'); });

    bindAll(root, '[data-rango]', function (el) {
      rango = el.dataset.rango;
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    });

    /* Un día del mapa, tocado. Los dos dibujos usan la misma marca, así que
       esto vale para la tira de la semana y para la rejilla de los meses. */
    bindAll(root, '[data-diases]', function (el) {
      hojaDiaEntrenado(el.dataset.diases);
    });

    /* la curva se dibuja sola al entrar */
    requestAnimationFrame(function () {
      const linea = root.querySelector('.graf-linea');
      if (linea && linea.getTotalLength) {
        const largo = linea.getTotalLength();
        linea.style.strokeDasharray = largo;
        linea.style.strokeDashoffset = largo;
        requestAnimationFrame(function () {
          linea.style.transition = 'stroke-dashoffset 1s cubic-bezier(.3,.9,.3,1)';
          linea.style.strokeDashoffset = '0';
        });
      }
      root.querySelectorAll('.calor i').forEach(function (c, i) {
        c.style.animationDelay = (i * 4) + 'ms';
      });
      root.querySelectorAll('.anillo-arco').forEach(function (c, i) {
        const fin = c.getAttribute('stroke-dashoffset');
        c.style.strokeDashoffset = c.getAttribute('stroke-dasharray');
        setTimeout(function () {
          c.style.transition = 'stroke-dashoffset .9s cubic-bezier(.2,.9,.3,1)';
          c.style.strokeDashoffset = fin;
        }, 120 + i * 90);
      });

      root.querySelectorAll('.zona-barra i').forEach(function (b, i) {
        const w = b.style.width;
        b.style.width = '0';
        setTimeout(function () { b.style.width = w; }, 60 + i * 60);
      });
    });

    bindAll(root, '[data-zact]', function (el) { hojaActividad(el.dataset.zact); });

    bindAll(root, '[data-ex]', function (el) { go('ejercicio', el.dataset.ex); });
    root.querySelectorAll('details[data-sem]').forEach(function (d) {
      d.addEventListener('toggle', function () { semanasAbiertas[d.dataset.sem] = d.open; });
    });

    bindAll(root, '[data-ses]', function (el) {
      const d = root.querySelector('[data-detail="' + el.dataset.ses + '"]');
      if (d) d.hidden = !d.hidden;
    });
    bindAll(root, '[data-delses]', function (el) {
      UI.confirm(T('Borrar entrenamiento'), T('Se eliminará de tu historial y de las estadísticas.'),
        'Borrar', true).then(function (ok) {
        if (ok) { Store.deleteSession(el.dataset.delses); render(); }
      });
    });
  };
})(window);
