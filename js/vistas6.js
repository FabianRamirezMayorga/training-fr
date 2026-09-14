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

  /* Rangos que se pueden mirar. dias: cuánto abarca; paso: si se agrupa por día
     o por semana, que 365 puntos diarios no se leen en un móvil. */
  const RANGOS = [
    { id: 'semana', label: 'Semana', dias: 7, paso: 'dia', frase: 'la última semana' },
    { id: 'mes', label: 'Mes', dias: 30, paso: 'dia', frase: 'el último mes' },
    { id: '2meses', label: '2 meses', dias: 60, paso: 'semana', frase: 'los últimos dos meses' },
    { id: '3meses', label: '3 meses', dias: 91, paso: 'semana', frase: 'los últimos tres meses' },
    { id: 'año', label: 'Año', dias: 364, paso: 'semana', frase: 'el último año' }
  ];

  /* El elegido dura lo que dure la sesión de la app */
  let rango = '3meses';
  function rangoActual() {
    return RANGOS.find(function (r) { return r.id === rango; }) || RANGOS[3];
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

    if (r.paso === 'dia') {
      return dias.map(function (d) {
        return { y: dato(d), etiqueta: UI.fechaCorta(d.t) };
      });
    }

    /* se agrupa de siete en siete, terminando en hoy */
    const out = [];
    for (let i = 0; i < dias.length; i += 7) {
      const trozo = dias.slice(i, i + 7);
      out.push({
        y: trozo.reduce(function (a2, d) { return a2 + dato(d); }, 0),
        etiqueta: UI.fechaCorta(trozo[0].t)
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

  function repartoMuscular(dias) {
    const desde = Date.now() - dias * DIA;
    const cuenta = {};
    let total = 0;

    Store.sessions().forEach(function (s) {
      if (s.start < desde) return;
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

    if (!total) return { total: 0, filas: [] };
    const filas = I18N.GROUPS.map(function (gr) {
      return { id: gr.id, label: gr.label, series: Math.round((cuenta[gr.id] || 0) * 10) / 10 };
    }).filter(function (f) { return f.series > 0; })
      .sort(function (a, b) { return b.series - a.series; });

    return { total: Math.round(total), filas: filas };
  }

  /* ---------- gráficos ---------- */

  /* Curva suave con relleno. puntos: [{x, y, etiqueta}] */
  function grafica(puntos, unidad) {
    const W = 320, H = 120, P = 6;
    const max = Math.max.apply(null, puntos.map(function (p) { return p.y; }).concat([1]));
    const paso = puntos.length > 1 ? (W - P * 2) / (puntos.length - 1) : 0;

    const xy = puntos.map(function (p, i) {
      return { x: P + i * paso, y: H - P - (p.y / max) * (H - P * 2), v: p.y, et: p.etiqueta };
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
          return '<circle class="graf-p" cx="' + p.x + '" cy="' + p.y + '" r="2.5"/>';
        }).join(''))}
        <circle class="graf-ultimo" cx="${ultimo.x}" cy="${ultimo.y}" r="4.5"/>
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
  function porEjercicio(sesiones, desdeT) {
    const mapa = {};
    sesiones.filter(function (x) { return x.start >= desdeT; }).forEach(function (x) {
      (x.entries || []).forEach(function (e) {
        const hechas = (e.sets || []).filter(function (st) { return st.done; });
        if (!hechas.length) return;
        const m = mapa[e.exId] || (mapa[e.exId] = {
          exId: e.exId, name: e.name, veces: 0, series: 0, puntos: [], conPeso: false
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
      ? { rotulo: 'El que más sube',
          nombre: (Data.get(conPeso[0].m.exId) || {}).nameEs || conPeso[0].m.name,
          dato: '+' + conPeso[0].dif + '%' }
      : { rotulo: 'El que más repites',
          nombre: (Data.get(lista[0].exId) || {}).nameEs || lista[0].name,
          dato: lista[0].veces + ' veces' };

    return html`
      <div class="list-title">Tus ejercicios</div>
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
    const coma = function (n) { return String(n).replace('.', ','); };

    return html`
      <div class="list-title">Tu peso</div>
      <div class="card tarjeta-premium">
        <div class="row between" style="align-items:flex-end">
          <div>
            <div class="pre-encima">Ahora</div>
            <div class="pre-num">${UI.num(fin)}
              <span class="tiny" style="font-weight:600">${Store.settings().unit || 'kg'}</span></div>
          </div>
          <span class="delta ${tono}">
            ${dif > 0 ? '+' : ''}${coma(dif)} <span class="tiny">en el periodo</span></span>
        </div>
        ${raw(curvaPeso(lista))}
        <p class="tiny" style="margin:8px 0 0">${lista.length} pesajes ·
          ${porSemana > 0 ? '+' : ''}${coma(porSemana)} ${Store.settings().unit || 'kg'}
          por semana de media</p>
      </div>`;
  }

  /* La semana, dia a dia: inicial, numero y una barra con lo que hiciste. Lo
     que en un mapa de calor de siete cuadros no se puede poner. */
  function tiraSemana(dias, max, hoyKey) {
    const DIAS_SEM = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    return '<div class="tira-sem">' + dias.map(function (d) {
      const nivel = !d.series ? 0 : Math.min(4, Math.ceil(d.series / max * 4));
      const f = new Date(d.t);
      return '<div class="ts-dia' + (d.k === hoyKey ? ' hoy' : '') + '">' +
        '<span class="ts-letra">' + DIAS_SEM[(f.getDay() + 6) % 7] + '</span>' +
        '<span class="ts-num">' + f.getDate() + '</span>' +
        '<i class="n' + nivel + '"></i>' +
        '<span class="ts-series">' + (d.series || '·') + '</span>' +
        '</div>';
    }).join('') + '</div>';
  }

  /* Mapa de calor del rango elegido. Con pocos días va en una fila, día a día;
     con muchos, en columnas de siete, que es como se lee la constancia. */
  function mapaCalor(dias) {
    const max = Math.max.apply(null, dias.map(function (d) { return d.series; }).concat([1]));
    const hoyKey = Store.dayKey(Date.now());
    const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const DIAS_SEM = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

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
        return DIAS_SEM[(new Date(d.t).getDay() + 6) % 7];
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
      const nivel = !d.series ? 0 : Math.min(4, Math.ceil(d.series / max * 4));
      const titulo = UI.fechaCorta(d.t) + (d.series
        ? ': ' + d.series + ' series' + (d.volumen ? ', ' + UI.kg(d.volumen) : '')
        : ': descanso');
      return '<i class="n' + nivel + (d.k === hoyKey ? ' hoy' : '') +
        '" title="' + esc(titulo) + '"></i>';
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
        <span>Menos</span>
        <i class="n0"></i><i class="n1"></i><i class="n2"></i><i class="n3"></i><i class="n4"></i>
        <span>Más</span>
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
      <div class="list-title">Lo que llevas abandonado</div>
      <div class="card tarjeta-premium">
        <div class="pre-encima">Sin tocar</div>
        <div class="pre-num" style="margin:1px 0 12px">${olvido.length}
          <span class="tiny" style="font-weight:600">${raw(olvido.length === 1
            ? 'zona' : 'zonas')}</span></div>
        <div class="stack" style="gap:7px">
          ${raw(olvido.map(function (f) {
            return '<div class="row between"><span style="font-size:.9rem">' +
              esc(I18N.muscle(f.m)) + '</span><span class="tiny">' +
              (f.dias === null ? 'nunca' : 'hace ' + f.dias + ' días') + '</span></div>';
          }).join(''))}
        </div>
        <p class="tiny" style="margin:11px 0 0">Un músculo que no se toca en más de una
        semana se estanca. Toca la zona en Ejercicios y te monto la sesión.</p>
        <button class="btn sm block" data-a="programa" style="margin-top:9px">
          Rehacer mi programa con esto en cuenta</button>
      </div>`;
  }

  V.progreso = function () {
    const st = Store.stats();
    const sesiones = Store.sessions();
    const porSeries = Store.settings().registro !== 'detallado' || st.totalVolume === 0;

    if (!sesiones.length) {
      return html`
        <h1>Progreso</h1>
        <div class="empty" style="padding-top:40px">${raw(icon('grafica'))}
          <p>Aquí verás tu evolución, tu constancia y qué músculos trabajas de más
          y de menos. Aparece en cuanto termines tu primer entrenamiento.</p>
          <button class="btn primary" data-a="ir">Elegir una rutina</button>
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
        if (p.best && p.best.weight > 0) prs.push({ exId: e.exId, name: e.name, pr: p.best });
      });
    });
    prs.sort(function (a, b) { return b.pr.weight - a.pr.weight; });

    return html`
      <h1>Progreso</h1>

      <!-- El periodo manda sobre toda la pantalla, no solo sobre la grafica:
           tambien cambia el mapa de constancia y el reparto por zona. Debajo
           del titulo de la grafica parecia el mando de esa caja, y para cambiar
           de mes habia que buscarlo a media pantalla. -->
      <div class="pill-scroll periodo-arriba">
        ${raw(RANGOS.map(function (x) {
          return '<button class="chip ' + (x.id === rango ? 'on' : '') +
            '" data-rango="' + x.id + '">' + esc(x.label) + '</button>';
        }).join(''))}
      </div>

      <!-- Las cuatro cifras, del periodo elegido y no de toda la vida. Antes
           eran totales historicos: no cambiaban al tocar los botones de arriba,
           y una de ellas repetia el numero de la grafica. Ahora las cuatro
           contestan a «¿como voy en estos tres meses?», que es la pregunta de
           esta pantalla. La racha se queda como esta: una racha es de hoy, no
           de un periodo. -->
      <div class="stats">
        <div class="stat"><b>${resumen.sesiones}</b><span>Entrenos</span></div>
        <div class="stat"><b>${resumen.porSemana}</b><span>Por semana</span></div>
        <div class="stat"><b>${st.streak}</b><span>Racha</span></div>
        <div class="stat"><b>${resumen.minutos < 60 ? resumen.minutos + 'm'
          : Math.round(resumen.minutos / 60) + 'h'}</b><span>Tiempo</span></div>
      </div>

      <div class="list-title">${porSeries ? 'Series completadas' : 'Volumen levantado'}</div>

      <div class="card graf-caja tarjeta-premium">
        <div class="row between" style="align-items:flex-end;margin-bottom:6px">
          <div>
            <div class="pre-encima">${porSeries ? 'Series' : 'Volumen'}</div>
            <div class="graf-dato">${UI.num(total)}</div>
            <div class="tiny">${porSeries ? 'series' : (Store.settings().unit || 'kg')}
              en ${r.frase}</div>
          </div>
          <!-- La diferencia con el periodo anterior, al lado del numero y no
               en una etiqueta con seis palabras: es la segunda cosa que se mira
               y con la flecha se lee sin terminar de leerla. -->
          ${raw(delta === null ? '' : html`
            <span class="delta ${delta >= 0 ? 'sube' : 'baja'}">
              ${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}%
              <span class="tiny">vs. antes</span></span>`)}
        </div>
        ${raw(grafica(puntos, porSeries ? 'series' : 'kg'))}
        <div class="tiny" style="margin-top:8px">${r.paso === 'dia'
          ? 'Un punto por día' : 'Un punto por semana'}</div>
      </div>

      <div class="list-title">Constancia</div>
      <div class="card tarjeta-premium">
        <!-- El rotulo con la cuenta: el mapa dice como se reparten los dias,
             pero cuantos son hay que contarlos a ojo cuadro a cuadro. -->
        <div class="pre-encima">Días entrenados</div>
        <div class="pre-num" style="margin:1px 0 10px">${diasEntrenados(r.dias)}
          <span class="tiny" style="font-weight:600">de ${r.dias}</span></div>
        ${raw(mapaCalor(porDia(r.dias)))}
        <p class="tiny" style="margin:10px 0 0">${r.dias <= 8
          ? 'El número de abajo son las series de ese día.'
          : 'Un cuadro por día.'} Los huecos también cuentan: el descanso forma
        parte del plan.</p>
      </div>

      ${raw(reparto.total || planPorZona().total ? html`
        <div class="list-title">Reparto por zona (${Math.min(r.dias, 90)} días)</div>
        <div class="card tarjeta-premium">
          ${raw(reparto.filas.length ? '<div class="pre-encima">Lo que m\u00e1s trabajas</div>' +
            '<div class="pre-num" style="margin:1px 0 12px">' + esc(reparto.filas[0].label) +
            ' <span class="tiny" style="font-weight:600">' +
            Math.round(reparto.filas[0].series / reparto.total * 100) + '% de las series</span></div>'
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
        <div class="list-title">Récords personales${raw((function () {
          const nuevos = prs.filter(function (x) { return x.pr.date >= desdeT; }).length;
          return nuevos ? ' <span class="chip solid tiny-chip">' + nuevos +
            (nuevos === 1 ? ' nuevo' : ' nuevos') + '</span>' : '';
        })())}</div>
        <div class="card lista-prs tarjeta-premium">
          <div class="ejs-cab row between">
            <div class="grow" style="min-width:0">
              <div class="pre-encima">Tu marca más alta</div>
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
                    ? ' <span class="pr-nuevo">nuevo</span>' : '')}</span>
                  <span class="pr-sub">${UI.fecha(p.pr.date)}</span>
                </span>
                <span class="pr-marca">${UI.kg(p.pr.weight)} × ${p.pr.reps}</span>
              </button>`;
          }).join(''))}
        </div>` : '')}

      <div class="list-title">Historial</div>
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
        <div class="list-title">Tus metas</div>
        <div class="card center tarjeta-premium">
          <p class="muted" style="margin-bottom:12px">Ponte una meta y la verás avanzar
          aquí sola: llegar a un peso, entrenar x veces por semana, una racha o un récord
          en un ejercicio.</p>
          <button class="btn primary block" data-a="metas">Crear mi primera meta</button>
        </div>`;
    }

    const hechas = metas.filter(function (m) { return m.logrado; }).length;

    return html`
      <div class="list-head">
        <span class="list-title">Tus metas${raw(hechas
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
                <div class="tiny">${Objetivos.formato(m, p.actual)} de
                  ${Objetivos.formato(m, m.meta)}</div>
                <div class="tiny" style="margin-top:3px;color:${raw(p.cumplido
                  ? 'var(--acc)' : 'var(--dim2)')}">${raw(p.cumplido
                  ? 'Cumplida el ' + esc(UI.fechaCorta(m.logrado))
                  : esc(loQueFalta(m, falta)))}</div>
              </div>
            </div>`;
        }).join(''))}
      </div>`;
  }

  /* "Te falta 1 sesión", no "Te faltan 1 sesiones" */
  function loQueFalta(m, falta) {
    const txt = Objetivos.formato(m, falta);
    const uno = Math.round(falta) === 1;
    if (!uno) return 'Te faltan ' + txt;
    return 'Te falta ' + txt.replace(/sesiones$/, 'sesión').replace(/días$/, 'día');
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
  function zonasHTML(reparto, rango) {
    const plan = planPorZona();
    const semanas = Math.max(1, Math.round(Math.min(rango.dias, 90) / 7));

    const hecho = {};
    reparto.filas.forEach(function (f) {
      hecho[f.id] = Math.round(f.series / semanas * 10) / 10;
    });

    const etiqueta = function (id) {
      const r2 = I18N.REGIONES.find(function (x) { return x.id === id; });
      return r2 ? r2.label : id;
    };
    /* Aqui se escribe en espanol: 2,2 y no 2.2 */
    const coma = function (n2) { return String(n2).replace('.', ','); };

    const ids = [];
    reparto.filas.forEach(function (f) { if (ids.indexOf(f.id) === -1) ids.push(f.id); });
    Object.keys(plan.zonas).forEach(function (id) {
      if (plan.zonas[id] > 0 && ids.indexOf(id) === -1) ids.push(id);
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
              </span>
              <span class="zona-num">${coma(hace)}${raw(pide > 0
                ? '<span class="zona-de"> / ' + coma(pide) + '</span>' : '')}</span>
            </div>`;
        }).join(''))}
      </div>

      <div class="zona-leyenda tiny">
        <span><i class="zl-hago"></i> series por semana que haces</span>
        ${raw(plan.total ? '<span><i class="zl-pide"></i> lo que pide tu plan</span>' : '')}
      </div>

      ${raw(peor && peor.falta > 0.5
        ? '<p class="tiny" style="margin:9px 0 0">Donde más te separas es <b>' +
          esc(etiqueta(peor.id)) + '</b>: tu plan pide ' +
          coma(Math.round((plan.zonas[peor.id] || 0) * 10) / 10) + ' series por semana y ' +
          'estás haciendo ' + coma(hecho[peor.id] || 0) + '.</p>'
        : reparto.total
        ? '<p class="tiny" style="margin:9px 0 0">' + pistaReparto(reparto) + '</p>'
        : '<p class="tiny" style="margin:9px 0 0">Todavía no has completado series en ' +
          'este periodo.</p>')}`;
  }

  function pistaReparto(r) {
    const nombres = r.filas.map(function (f) { return f.id; });
    const falta = I18N.GROUPS.filter(function (gr) { return nombres.indexOf(gr.id) === -1; });
    if (falta.length) {
      return 'En este periodo no has entrenado ' +
        esc(falta.map(function (f) { return f.label.toLowerCase(); }).join(', ')) + '.';
    }
    const arriba = r.filas[0], abajo = r.filas[r.filas.length - 1];
    if (arriba.series > abajo.series * 3) {
      return esc(arriba.label) + ' se lleva el triple que ' + esc(abajo.label.toLowerCase()) +
        '. Si no es a propósito, conviene equilibrarlo.';
    }
    return 'Reparto equilibrado entre las zonas que entrenas.';
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
    if (lunes === hoyLunes) return 'Esta semana';
    if (lunes === hoyLunes - 7 * 86400000) return 'La semana pasada';

    const a = new Date(lunes);
    const b = new Date(lunes + 6 * 86400000);
    return a.getMonth() === b.getMonth()
      ? 'Del ' + a.getDate() + ' al ' + b.getDate() + ' de ' + MESES[b.getMonth()]
      : 'Del ' + a.getDate() + ' de ' + MESES[a.getMonth()] + ' al ' +
        b.getDate() + ' de ' + MESES[b.getMonth()];
  }

  /* Qué se trabajó en una sesión. De los ejercicios si los hubo, y de lo que
     dijo la IA si fue una actividad de fuera del gimnasio. Sin esto el historial
     decía «19 series» y había que abrirlo para saber de qué. */
  function musculosDeSesion(s) {
    const fuera = [];
    const mete = function (m) { if (m && fuera.indexOf(m) === -1) fuera.push(m); };
    (s.entries || []).forEach(function (e) {
      const ex = g.Data ? Data.get(e.exId) : null;
      if (ex) (ex.primaryMuscles || []).forEach(mete);
    });
    (s.musculos || []).forEach(mete);
    return fuera.slice(0, 4).map(function (m) { return I18N.muscle(m); });
  }

  function lineaSesion(s) {
    const dura = UI.mmss(((s.end || s.start) - s.start) / 1000);
    const que = s.manual
      ? 'apuntado a mano' + (s.kcal ? ' · ~' + UI.num(s.kcal) + ' kcal' : '')
      : s.actividad && !s.setsDone
      ? '~' + UI.num(s.kcal || 0) + ' kcal'
      : s.setsDone + ' series' + (s.volume ? ' · ' + UI.kg(s.volume) : '');
    return que + ' · ' + dura;
  }

  function sesionHTML(s) {
    const musculos = musculosDeSesion(s);
    return html`
      <div class="ses-fila">
        <div class="row between" style="gap:10px">
          <div class="grow" style="cursor:pointer;min-width:0" data-ses="${s.id}">
            <div style="font-weight:700;font-size:.92rem">${s.routineName}</div>
            <div class="tiny">${UI.fecha(s.start)} · ${lineaSesion(s)}</div>
            ${raw(musculos.length
              ? '<div class="ses-musculos">' + musculos.map(function (m) {
                  return '<span class="chip tiny-chip">' + esc(m) + '</span>';
                }).join('') + '</div>'
              : '')}
          </div>
          <button class="btn icon sm danger" data-delses="${s.id}"
                  aria-label="Borrar">${raw(icon('trash'))}</button>
        </div>
        <div class="stack" data-detail="${s.id}" hidden style="margin-top:9px">
          ${raw((s.entries || []).map(function (e) {
            const hechas = (e.sets || []).filter(function (x) { return x.done; });
            if (!hechas.length) return '';
            return html`<div class="row between" style="font-size:.82rem">
              <span class="grow">${e.name}</span>
              <span class="tiny">${hechas.map(function (x) {
                return UI.num(x.weight) + '×' + x.reps;
              }).join(' · ')}</span></div>`;
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
            <span class="tiny nowrap">${lista.length} ${lista.length === 1
              ? 'entreno' : 'entrenos'}${raw(series ? ' · ' + series + ' series' : '')}</span>
          </summary>
          <div class="fino-cuerpo">
            ${raw(lista.map(sesionHTML).join(''))}
          </div>
        </details>`;
    }).join('') + '</div>';
  }

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

    bindAll(root, '[data-ex]', function (el) { go('ejercicio', el.dataset.ex); });
    root.querySelectorAll('details[data-sem]').forEach(function (d) {
      d.addEventListener('toggle', function () { semanasAbiertas[d.dataset.sem] = d.open; });
    });

    bindAll(root, '[data-ses]', function (el) {
      const d = root.querySelector('[data-detail="' + el.dataset.ses + '"]');
      if (d) d.hidden = !d.hidden;
    });
    bindAll(root, '[data-delses]', function (el) {
      UI.confirm('Borrar entrenamiento', 'Se eliminará de tu historial y de las estadísticas.',
        'Borrar', true).then(function (ok) {
        if (ok) { Store.deleteSession(el.dataset.delses); render(); }
      });
    });
  };
})(window);
