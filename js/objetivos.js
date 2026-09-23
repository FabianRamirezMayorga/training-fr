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
      note: 'Cuenta los entrenamientos de esta semana, de lunes a hoy',
      actual: function () { return Store.stats().week; },
      inicio: function () { return 0; },
      formato: function (v) { return Tp(Math.round(v), '{n} sesión', '{n} sesiones'); }
    },
    racha: {
      label: 'Mantener una racha', unidad: 'días', icono: 'flag',
      note: 'Días seguidos entrenando',
      actual: function () { return Store.stats().streak; },
      inicio: function () { return 0; },
      formato: function (v) { return Tp(Math.round(v), '{n} día', '{n} días'); }
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
      formato: function (v) { return Tp(Math.round(v), '{n} sesión', '{n} sesiones'); }
    }
  };

  /* Una frase guardada sin resolver: la meta vive en el dispositivo y se lee
     en el idioma que tengas puesto ese día, no en el que había al crearla.
     Un valor puede ser un número, un texto, { dec } para un decimal,
     { minus } para pasarlo a minúsculas traducido, o { fmt, v } para que lo
     escriba el propio tipo de meta. */
  function frase(t, v) { return { t: t, v: v || {} }; }

  function leer(x) {
    if (x == null) return '';
    if (typeof x === 'string') return T(x);
    if (typeof x === 'number') return String(x);
    if (x.dec !== undefined) return UI.dec(x.dec);
    if (x.minus !== undefined) return T(x.minus).toLowerCase();
    if (x.fmt !== undefined) {
      const t = TIPOS[x.fmt];
      return t ? t.formato(x.v) : String(x.v);
    }
    if (!x.t) return '';
    const v = {};
    Object.keys(x.v || {}).forEach(function (k) { v[k] = leer(x.v[k]); });
    return Tn(x.t, v);
  }

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
          : frase(faltan === 1
              ? 'Entrenando cada día la tienes en {n} día'
              : 'Entrenando cada día la tienes en {n} días', { n: faltan })
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
          : frase('Lo cumpliste {veces} de las últimas {de} semanas; promedias ' +
              '{media} por semana',
              { veces: logradas, de: ultimas.length,
                media: { fmt: m.tipo, v: Math.round(media * 10) / 10 } })
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

    /* SIN HISTORIAL TODAVIA.
       Que no haya pesajes no quiere decir que no se pueda estimar nada: si el
       perfil esta completo, el plan ya dice a que ritmo deberia moverse la
       bascula —el deficit o el superavit salen de tu gasto y del ritmo que
       elegiste—. Eso no es lo que esta pasando, es lo que deberia pasar si
       sigues el plan, y la pantalla lo dice con esas palabras.

       Cuando haya dos pesajes manda la realidad: este apaño solo cubre el
       hueco del principio, que es justo cuando uno se pone la meta. */
    if ((ritmo === null || Math.abs(ritmo) < 1e-9) && m.tipo === 'peso' && g.Perfil) {
      const datos = Perfil.datos();
      const plan = Perfil.previsión(datos, meta);
      /* Hacia donde empuja su plan: lo dice el propio objetivo, que ya no son
         solo tres. */
      const quiere = (Perfil.OBJETIVO[datos.objetivo] || {}).signo || 0;
      const vaBien = (falta < 0 && quiere < 0) || (falta > 0 && quiere > 0);

      if (plan && plan.semanas > 0 && vaBien && Perfil.completo(datos)) {
        const r = Perfil.ritmoActual(datos);
        const dias = plan.semanas * 7;
        return {
          clase: 'meta', segunPlan: true, puntos: puntos, cumplido: false,
          falta: falta, ritmo: quiere * r.kgSemana, haciaMeta: true,
          bajando: quiere < 0, semanas: plan.semanas, dias: dias,
          fecha: Date.now() + dias * 864e5,
          frase: frase('Según tu plan: ritmo {ritmo}, {signo}{kg} kg por semana',
            { ritmo: { minus: r.label || '' }, signo: quiere < 0 ? '-' : '+',
              kg: { dec: r.kgSemana } })
        };
      }
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
        frase: frase('A este ritmo te alejas {cuanto} por semana',
          { cuanto: { fmt: m.tipo, v: Math.abs(Math.round(ritmo * 10) / 10) } }) };
    }

    const semanas = Math.abs(falta / ritmo);
    const dias = Math.ceil(semanas * 7);

    return {
      clase: 'meta', puntos: puntos, cumplido: false,
      falta: falta, ritmo: ritmo, haciaMeta: true, bajando: bajando,
      semanas: semanas, dias: dias, fecha: Date.now() + dias * 864e5,
      frase: frase('A este ritmo, {signo}{cuanto} por semana',
        { signo: bajando ? '-' : '+',
          cuanto: { fmt: m.tipo, v: Math.abs(Math.round(ritmo * 10) / 10) } })
    };
  }

  /* «en 8 semanas», «en 3 meses», «en 12 dias»: la unidad que se entiende sin
     dividir de cabeza. */
  function cuanto(dias) {
    if (!(dias > 0)) return '';
    if (dias <= 21) return Tp(dias, '{n} día', '{n} días');
    const sem = Math.round(dias / 7);
    if (sem <= 10) return Tp(sem, '{n} semana', '{n} semanas');
    const mes = Math.round(dias / 30.4);
    if (mes <= 18) return Tp(mes, '{n} mes', '{n} meses');
    return Tn('{n} años', { n: UI.dec(Math.round(dias / 365 * 10) / 10) });
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
    if (!t) return T('Objetivo');
    if (m.tipo === 'marca') {
      const ex = Data.get(m.exId);
      return Tn('Récord en {que}', { que: ex ? ex.nameEs : T('un ejercicio') });
    }
    return T(t.label);
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
      return etiqueta(m) + ': ' + formato(m, p.actual) + ' ' +
        Tn('de {meta}', { meta: formato(m, m.meta) }) +
        (p.cumplido ? T(' (cumplido)') : ' (' + Math.round(p.pct * 100) + '%)');
    }).join('; ') + '.';
  }

  g.Objetivos = {
    TIPOS: TIPOS, lista: lista, nuevo: nuevo, guardar: guardar, borrar: borrar,
    progreso: progreso, revisar: revisar, etiqueta: etiqueta, formato: formato,
    resumen: resumen, prevision: prevision, serie: serie, cuanto: cuanto,
    leer: leer
  };
})(window);
