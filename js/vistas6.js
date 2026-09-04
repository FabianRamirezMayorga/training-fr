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

  /* Mapa de calor del rango elegido. Con pocos días va en una fila, día a día;
     con muchos, en columnas de siete, que es como se lee la constancia. */
  function mapaCalor(dias) {
    const max = Math.max.apply(null, dias.map(function (d) { return d.series; }).concat([1]));
    const hoyKey = Store.dayKey(Date.now());
    const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const DIAS_SEM = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

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

      <div class="stats">
        <div class="stat"><b>${st.total}</b><span>Entrenos</span></div>
        <div class="stat"><b>${st.streak}</b><span>Racha</span></div>
        <div class="stat"><b>${UI.num(porSeries ? st.totalSets : st.totalVolume)}</b>
          <span>${porSeries ? 'Series totales' : 'Volumen total'}</span></div>
        <div class="stat"><b>${st.totalMinutes < 60 ? st.totalMinutes + 'm'
          : Math.round(st.totalMinutes / 60) + 'h'}</b><span>Tiempo</span></div>
      </div>

      <div class="list-title">${porSeries ? 'Series completadas' : 'Volumen levantado'}</div>
      <div class="pill-scroll">
        ${raw(RANGOS.map(function (x) {
          return '<button class="chip ' + (x.id === rango ? 'on' : '') +
            '" data-rango="' + x.id + '">' + esc(x.label) + '</button>';
        }).join(''))}
      </div>

      <div class="card graf-caja">
        <div class="row between" style="align-items:flex-end;margin-bottom:6px">
          <div>
            <div class="graf-dato">${UI.num(total)}</div>
            <div class="tiny">${porSeries ? 'series' : (Store.settings().unit || 'kg')}
              en ${r.frase}</div>
          </div>
          ${raw(delta === null ? '' : html`
            <span class="chip ${delta >= 0 ? 'solid' : ''}" style="${raw(delta < 0
              ? 'color:var(--warn);border-color:var(--warn)' : '')}">
              ${delta >= 0 ? '+' : ''}${delta}% vs. periodo anterior</span>`)}
        </div>
        ${raw(grafica(puntos, porSeries ? 'series' : 'kg'))}
        <div class="tiny center" style="margin-top:8px">${r.paso === 'dia'
          ? 'Cada punto es un día' : 'Cada punto es una semana'}</div>
      </div>

      <div class="list-title">Constancia</div>
      <div class="card">
        ${raw(mapaCalor(porDia(r.dias)))}
        <p class="tiny" style="margin:12px 0 0">Cada cuadro es un día de ${r.frase};
        cuanto más oscuro, más series. Los huecos también cuentan: el descanso forma
        parte del plan.</p>
      </div>

      ${raw(reparto.total ? html`
        <div class="list-title">Reparto por zona (${Math.min(r.dias, 90)} días)</div>
        <div class="card">
          ${raw(reparto.filas.map(function (f) {
            const pct = Math.round(f.series / maxMusculo * 100);
            const share = Math.round(f.series / reparto.total * 100);
            return html`
              <div class="zona-fila">
                <span class="zona-nom">${f.label}</span>
                <span class="zona-barra"><i style="width:${pct}%"></i></span>
                <span class="zona-num">${share}%</span>
              </div>`;
          }).join(''))}
          <p class="tiny" style="margin:11px 0 0">${raw(pistaReparto(reparto))}</p>
        </div>` : '')}

      ${raw(metasHTML())}

      ${raw(prs.length ? html`
        <div class="list-title">Récords personales</div>
        <div class="stack">
          ${raw(prs.slice(0, 12).map(function (p) {
            return html`<button class="card row between" data-ex="${p.exId}" style="width:100%;text-align:left">
              <div class="grow"><div style="font-weight:600;font-size:.88rem">${p.name}</div>
                <div class="tiny">${UI.fecha(p.pr.date)}</div></div>
              <div class="chip solid">${UI.kg(p.pr.weight)} × ${p.pr.reps}</div>
            </button>`;
          }).join(''))}
        </div>` : '')}

      <div class="list-title">Historial</div>
      <div class="stack">
        ${raw(sesiones.slice(0, 30).map(function (s) {
          return html`
            <div class="card">
              <div class="row between">
                <div class="grow" style="cursor:pointer" data-ses="${s.id}">
                  <div style="font-weight:700">${s.routineName}</div>
                  <div class="tiny">${UI.fecha(s.start)} · ${s.setsDone} series${raw(
                    s.volume ? ' · ' + esc(UI.kg(s.volume)) : '')} ·
                    ${UI.mmss(((s.end || s.start) - s.start) / 1000)}</div>
                </div>
                <button class="btn icon sm danger" data-delses="${s.id}"
                        aria-label="Borrar">${raw(icon('trash'))}</button>
              </div>
              <div class="stack" data-detail="${s.id}" hidden style="margin-top:10px">
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
        }).join(''))}
      </div>`;
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
        <div class="card center">
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
            <div class="card meta ${p.cumplido ? 'lograda' : ''}">
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

  V.progreso.mount = function (root) {
    bind(root, '[data-a=ir]', function () { go('rutinas'); });

    bind(root, '[data-a=metas]', function () { go('objetivos'); });

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
