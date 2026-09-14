/* objetivos.js — metas medibles con seguimiento automático.
   Cada meta sabe leer su propio progreso de los datos que ya tiene la app,
   así que no hay que actualizarlas a mano. */
(function (g) {
  'use strict';

  /* Cada tipo declara cómo se mide y cómo se lee su valor actual */
  const TIPOS = {
    peso: {
      label: 'Llegar a un peso', unidad: 'kg', icono: 'perfil',
      note: 'Se actualiza con cada pesaje que registres',
      actual: function () { return Perfil.datos().peso || 0; },
      inicio: function (m) { return m.desde || 0; },
      formato: function (v) { return UI.num(v) + ' kg'; }
    },
    entrenos: {
      label: 'Entrenar por semana', unidad: 'sesiones', icono: 'dumbbell',
      note: 'Cuenta los entrenamientos de los últimos 7 días',
      actual: function () { return Store.stats().week; },
      inicio: function () { return 0; },
      formato: function (v) { return Math.round(v) + ' sesiones'; }
    },
    racha: {
      label: 'Mantener una racha', unidad: 'días', icono: 'flag',
      note: 'Días seguidos entrenando',
      actual: function () { return Store.stats().streak; },
      inicio: function () { return 0; },
      formato: function (v) { return Math.round(v) + ' días'; }
    },
    volumen: {
      label: 'Volumen semanal', unidad: 'kg movidos', icono: 'grafica',
      note: 'Peso por repeticiones de los últimos 7 días',
      actual: function () { return Store.stats().weekVolume; },
      inicio: function () { return 0; },
      formato: function (v) { return UI.num(v) + ' kg'; }
    },
    marca: {
      label: 'Récord en un ejercicio', unidad: 'kg', icono: 'trofeo',
      note: 'Tu mejor serie en el ejercicio elegido',
      actual: function (m) {
        const pr = Store.prOf(m.exId);
        return pr.best ? pr.best.weight : 0;
      },
      inicio: function (m) { return m.desde || 0; },
      formato: function (v) { return UI.num(v) + ' kg'; }
    },
    total: {
      label: 'Entrenamientos totales', unidad: 'sesiones', icono: 'flag',
      note: 'Todos los entrenamientos registrados',
      actual: function () { return Store.stats().total; },
      inicio: function (m) { return m.desde || 0; },
      formato: function (v) { return Math.round(v) + ' sesiones'; }
    }
  };

  function lista() { return Store.settings().objetivos || []; }

  function guardarLista(arr) { Store.setSetting('objetivos', arr); }

  function nuevo(tipo) {
    return {
      id: Store.uid(), tipo: tipo, meta: 0, desde: 0, exId: '',
      creado: Date.now(), fin: 0, logrado: 0, nota: ''
    };
  }

  function guardar(m) {
    const arr = lista().slice();
    const i = arr.findIndex(function (x) { return x.id === m.id; });
    if (i === -1) arr.push(m); else arr[i] = m;
    guardarLista(arr);
    return m;
  }

  function borrar(id) {
    guardarLista(lista().filter(function (m) { return m.id !== id; }));
  }

  /* Progreso de 0 a 1, contando desde el punto de partida hasta la meta.
     Sirve igual para subir (ganar peso, más volumen) que para bajar (perder peso). */
  function progreso(m) {
    const t = TIPOS[m.tipo];
    if (!t) return { pct: 0, actual: 0, cumplido: false };

    const actual = t.actual(m);
    const inicio = t.inicio(m);
    const meta = Number(m.meta) || 0;

    let pct;
    if (meta === inicio) pct = actual >= meta ? 1 : 0;
    else pct = (actual - inicio) / (meta - inicio);

    pct = Math.max(0, Math.min(1, pct));
    const bajando = meta < inicio;
    const cumplido = bajando ? actual <= meta : actual >= meta;

    return { pct: cumplido ? 1 : pct, actual: actual, inicio: inicio, cumplido: cumplido };
  }

  /* ---------- cuando llegas ----------
     Una barra de progreso dice donde estas, no cuando llegas. Lo segundo es lo
     que de verdad se pregunta uno al ponerse una meta, y sale de un dato que la
     app ya tiene: a que ritmo te has movido hasta ahora.

     La cuenta es deliberadamente simple —una recta por minimos cuadrados sobre
     lo que llevas— y no un modelo de nada. Perder peso no es lineal y adelgazar
     los ultimos tres kilos cuesta mas que los tres primeros, asi que esto es
     "si sigues como vas", no una promesa. Por eso la pantalla dice el ritmo que
     usa: con el a la vista, uno sabe de donde sale el numero.

     No todas las metas se proyectan igual:
     - las que tienen meta (peso, record, entrenos totales) se proyectan a una
       fecha;
     - las de ritmo (entrenar X por semana, volumen semanal) no tienen linea de
       llegada: lo util ahi es cuantas de las ultimas semanas lo cumpliste;
     - la racha se cuenta sola: los dias que faltan son los dias que faltan. */

  const SEMANA = 7 * 864e5;

  /* La historia de la meta, en puntos {t, v}. */
  function serie(m) {
    const ses = Store.sessions().slice().sort(function (a, b) { return a.start - b.start; });

    if (m.tipo === 'peso') {
      return (g.Perfil ? Perfil.pesajes() : []).map(function (x) {
        return { t: x.fecha, v: Number(x.peso) || 0 };
      }).filter(function (x) { return x.v > 0; });
    }

    if (m.tipo === 'marca') {
      /* El mejor peso hasta cada fecha: un record no baja. */
      let mejor = 0;
      const out = [];
      ses.forEach(function (x) {
        (x.entries || []).forEach(function (e) {
          if (e.exId !== m.exId) return;
          (e.sets || []).forEach(function (st) {
            if (st.done && Number(st.weight) > mejor) mejor = Number(st.weight);
          });
        });
        if (mejor > 0) out.push({ t: x.start, v: mejor });
      });
      return out;
    }

    if (m.tipo === 'total') {
      let n = Number(m.desde) || 0;
      return ses.map(function (x) { n++; return { t: x.start, v: n }; });
    }

    /* Las de ritmo: una semana, un punto. */
    if (m.tipo === 'entrenos' || m.tipo === 'volumen') {
      const out = [];
      const hoy = Date.now();
      for (let i = 11; i >= 0; i--) {
        const fin = hoy - i * SEMANA;
        const ini = fin - SEMANA;
        const dentro = ses.filter(function (x) { return x.start > ini && x.start <= fin; });
        out.push({
          t: fin,
          v: m.tipo === 'entrenos' ? dentro.length
            : dentro.reduce(function (a, x) { return a + (x.volume || 0); }, 0)
        });
      }
      return out;
    }

    return [];
  }

  /* Recta por minimos cuadrados: devuelve cuanto se mueve por semana. */
  function ritmoSemanal(puntos) {
    if (puntos.length < 2) return null;
    const t0 = puntos[0].t;
    let sx = 0, sy = 0, sxy = 0, sxx = 0;
    puntos.forEach(function (p) {
      const x = (p.t - t0) / SEMANA;
      sx += x; sy += p.v; sxy += x * p.v; sxx += x * x;
    });
    const n = puntos.length;
    const den = n * sxx - sx * sx;
    if (!den) return null;
    return (n * sxy - sx * sy) / den;
  }

  function prevision(m) {
    const t = TIPOS[m.tipo];
    if (!t) return null;

    const p = progreso(m);
    const meta = Number(m.meta) || 0;
    const puntos = serie(m).slice(-60);

    /* La racha no necesita estadistica: un dia, un dia. */
    if (m.tipo === 'racha') {
      const faltan = Math.max(0, Math.ceil(meta - p.actual));
      return {
        clase: 'racha', puntos: puntos, cumplido: p.cumplido,
        falta: faltan, dias: faltan, fecha: Date.now() + faltan * 864e5,
        haciaMeta: true, ritmo: 1,
        frase: faltan === 0 ? 'Ya la tienes'
          : 'Entrenando cada día la tienes en ' + faltan +
            (faltan === 1 ? ' día' : ' días')
      };
    }

    /* Las de ritmo: cuantas de las ultimas semanas cumpliste. */
    if (m.tipo === 'entrenos' || m.tipo === 'volumen') {
      const ultimas = puntos.slice(-6);
      const logradas = ultimas.filter(function (x) { return x.v >= meta; }).length;
      const media = ultimas.length
        ? ultimas.reduce(function (a, x) { return a + x.v; }, 0) / ultimas.length : 0;
      return {
        clase: 'ritmo', puntos: puntos, cumplido: p.cumplido,
        media: media, logradas: logradas, de: ultimas.length, meta: meta,
        frase: !ultimas.length ? 'Aún no hay semanas que comparar'
          : 'Lo cumpliste ' + logradas + ' de las últimas ' + ultimas.length +
            ' semanas; promedias ' + t.formato(Math.round(media * 10) / 10) + ' por semana'
      };
    }

    /* Las que tienen linea de llegada. */
    const ritmo = ritmoSemanal(puntos);
    const falta = meta - p.actual;
    const bajando = meta < (p.inicio || 0);

    if (p.cumplido) {
      return { clase: 'meta', puntos: puntos, cumplido: true, falta: 0,
        frase: 'Cumplido' };
    }

    if (ritmo === null || Math.abs(ritmo) < 1e-9) {
      return { clase: 'meta', puntos: puntos, cumplido: false, falta: falta,
        ritmo: ritmo, haciaMeta: false,
        frase: puntos.length < 2
          ? 'Con un solo dato no se puede estimar: apúntate alguno más'
          : 'Llevas semanas parado en el mismo sitio: así no hay fecha que dar' };
    }

    const haciaMeta = (falta > 0 && ritmo > 0) || (falta < 0 && ritmo < 0);
    if (!haciaMeta) {
      return { clase: 'meta', puntos: puntos, cumplido: false, falta: falta,
        ritmo: ritmo, haciaMeta: false,
        frase: 'A este ritmo te alejas ' + t.formato(Math.abs(Math.round(ritmo * 10) / 10)) +
          ' por semana' };
    }

    const semanas = Math.abs(falta / ritmo);
    const dias = Math.ceil(semanas * 7);

    return {
      clase: 'meta', puntos: puntos, cumplido: false,
      falta: falta, ritmo: ritmo, haciaMeta: true, bajando: bajando,
      semanas: semanas, dias: dias, fecha: Date.now() + dias * 864e5,
      frase: 'A este ritmo, ' + (bajando ? '-' : '+') +
        t.formato(Math.abs(Math.round(ritmo * 10) / 10)) + ' por semana'
    };
  }

  /* «en 8 semanas», «en 3 meses», «en 12 dias»: la unidad que se entiende sin
     dividir de cabeza. */
  function cuanto(dias) {
    if (!(dias > 0)) return '';
    if (dias <= 21) return dias === 1 ? '1 día' : dias + ' días';
    const sem = Math.round(dias / 7);
    if (sem <= 10) return sem + ' semanas';
    const mes = Math.round(dias / 30.4);
    if (mes <= 18) return mes === 1 ? '1 mes' : mes + ' meses';
    return Math.round(dias / 365 * 10) / 10 + ' años';
  }

  /* Revisa las metas y marca las recién cumplidas. Devuelve las que acaban de lograrse. */
  function revisar() {
    const arr = lista().slice();
    const nuevas = [];
    let cambio = false;
    arr.forEach(function (m) {
      const p = progreso(m);
      if (p.cumplido && !m.logrado) { m.logrado = Date.now(); nuevas.push(m); cambio = true; }
      if (!p.cumplido && m.logrado) { m.logrado = 0; cambio = true; }
    });
    if (cambio) guardarLista(arr);
    return nuevas;
  }

  function etiqueta(m) {
    const t = TIPOS[m.tipo];
    if (!t) return 'Objetivo';
    if (m.tipo === 'marca') {
      const ex = Data.get(m.exId);
      return 'Récord en ' + (ex ? ex.nameEs : 'un ejercicio');
    }
    return t.label;
  }

  function formato(m, valor) {
    const t = TIPOS[m.tipo];
    return t ? t.formato(valor) : String(valor);
  }

  /* Resumen para la IA */
  function resumen() {
    const arr = lista();
    if (!arr.length) return '';
    return arr.map(function (m) {
      const p = progreso(m);
      return etiqueta(m) + ': ' + formato(m, p.actual) + ' de ' + formato(m, m.meta) +
        (p.cumplido ? ' (cumplido)' : ' (' + Math.round(p.pct * 100) + '%)');
    }).join('; ') + '.';
  }

  g.Objetivos = {
    TIPOS: TIPOS, lista: lista, nuevo: nuevo, guardar: guardar, borrar: borrar,
    progreso: progreso, revisar: revisar, etiqueta: etiqueta, formato: formato,
    resumen: resumen, prevision: prevision, serie: serie, cuanto: cuanto
  };
})(window);
