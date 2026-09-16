/* menus.js — los menús de comida, en plural.

   Hasta ahora había exactamente uno: se guardaba en `settings.menu` y al pedir
   otro se machacaba el anterior. Eso obliga a elegir entre el menú de la semana
   fuerte y el de la semana de descanso, o entre el de casa y el de cuando viaja
   —y quien tiene los dos los quiere los dos—.

   Aquí viven varios, con el mismo trato que los planes de entrenamiento: cada
   uno con su nombre, uno marcado como el que manda, y las mismas cosas que se
   le pueden hacer (renombrar, duplicar, borrar). Lo que sale en «hoy» y en la
   portada es el del menú activo, igual que las rutinas de hoy salen del plan
   activo.

   Se sigue escribiendo `settings.menu` con el menú activo. No lo lee ya nadie
   de aquí, pero un dispositivo que todavía no se haya actualizado sí, y
   dejárselo vacío sería quitarle el menú sin haber tocado nada. */
(function (g) {
  'use strict';

  const CLAVE_VIEJA = 'trainingfr.plan.nutricion';   // dónde vivía antes de los ajustes

  /* Los mismos colores que los planes de entrenamiento: es el mismo gesto —una
     caja que se abre y lleva su color— y dos escalas distintas para lo mismo
     solo confunden. */
  const TONOS = ['#8bc34a', '#4f8cf5', '#f0a23c', '#c06bf0', '#2fc4b2'];

  function tono(i) { return TONOS[i % TONOS.length]; }

  /* ---------- de uno a varios ----------
     Se hace una sola vez y no borra lo de antes: si algo saliera mal, el menú
     viejo sigue en su sitio. */
  function migrar() {
    const s = Store.settings();
    if (Array.isArray(s.menus)) return;

    let viejo = s.menu && s.menu.plan ? s.menu : null;
    if (!viejo) {
      try {
        const l = JSON.parse(localStorage.getItem(CLAVE_VIEJA) || 'null');
        if (l && l.plan) viejo = l;
      } catch (e) { /* nada que migrar */ }
    }

    const arr = [];
    if (viejo) {
      arr.push({
        id: Store.uid(),
        nombre: 'Mi menú',
        t: viejo.t || Date.now(),
        plan: viejo.plan,
        huella: viejo.huella || ''
      });
    }

    Store.setSetting('menus', arr);
    if (arr.length) Store.setSetting('menuActivo', arr[0].id);
    try { localStorage.removeItem(CLAVE_VIEJA); } catch (e) { /* nada */ }
  }

  function lista() {
    migrar();
    const arr = Store.settings().menus;
    return Array.isArray(arr) ? arr : [];
  }

  function guardarLista(arr) {
    Store.setSetting('menus', arr);
    escribirElViejo();
  }

  /* El espejo para los dispositivos que aún no se han actualizado */
  function escribirElViejo() {
    const a = activo();
    Store.setSetting('menu', a ? { t: a.t, plan: a.plan, huella: a.huella } : null);
  }

  function porId(id) {
    return lista().filter(function (m) { return m.id === id; })[0] || null;
  }

  /* Cuál manda. Si el marcado ya no existe —lo borró otro dispositivo—, manda
     el primero, que es mejor que quedarse sin ninguno. */
  function activoId() {
    const arr = lista();
    if (!arr.length) return '';
    const id = Store.settings().menuActivo;
    return arr.some(function (m) { return m.id === id; }) ? id : arr[0].id;
  }

  function activo() {
    const id = activoId();
    return id ? porId(id) : null;
  }

  function marcarActivo(id) {
    Store.setSetting('menuActivo', id || null);
    escribirElViejo();
  }

  /* Un nombre que no choque con los que ya hay: «Mi menú 2», «Mi menú 3»… */
  function nombreLibre(base) {
    base = String(base || 'Mi menú').trim() || 'Mi menú';
    const usados = lista().map(function (m) { return m.nombre; });
    if (usados.indexOf(base) === -1) return base;
    let n = 2;
    while (usados.indexOf(base + ' ' + n) !== -1) n++;
    return base + ' ' + n;
  }

  /* Uno nuevo, y pasa a ser el que manda: quien acaba de pedir un menú quiere
     ver ese, no el de la semana pasada. */
  function crear(plan, nombre, huella) {
    const m = {
      id: Store.uid(),
      nombre: nombreLibre(nombre),
      t: Date.now(),
      plan: plan,
      huella: huella || ''
    };
    const arr = lista().slice();
    arr.unshift(m);
    guardarLista(arr);
    marcarActivo(m.id);
    return m;
  }

  function actualizar(id, cambios) {
    const arr = lista().map(function (m) {
      if (m.id !== id) return m;
      const copia = {};
      Object.keys(m).forEach(function (k) { copia[k] = m[k]; });
      Object.keys(cambios || {}).forEach(function (k) { copia[k] = cambios[k]; });
      return copia;
    });
    guardarLista(arr);
    return porId(id);
  }

  function renombrar(id, nombre) {
    nombre = String(nombre || '').trim();
    if (!nombre) return null;
    const otros = lista().filter(function (m) { return m.id !== id; })
      .map(function (m) { return m.nombre; });
    if (otros.indexOf(nombre) !== -1) {
      let n = 2;
      while (otros.indexOf(nombre + ' ' + n) !== -1) n++;
      nombre = nombre + ' ' + n;
    }
    return actualizar(id, { nombre: nombre });
  }

  function duplicar(id) {
    const m = porId(id);
    if (!m) return null;
    /* Copia de verdad del plan: si compartieran el objeto, tocar uno cambiaría
       el otro y la copia no serviría para lo que se pide —probar cambios sin
       estropear el bueno—. */
    let plan;
    try { plan = JSON.parse(JSON.stringify(m.plan)); } catch (e) { plan = m.plan; }
    const copia = {
      id: Store.uid(),
      nombre: nombreLibre(m.nombre),
      t: Date.now(),
      plan: plan,
      huella: m.huella
    };
    const arr = lista().slice();
    arr.splice(indice(id) + 1, 0, copia);
    guardarLista(arr);
    return copia;
  }

  function indice(id) {
    const arr = lista();
    for (let i = 0; i < arr.length; i++) if (arr[i].id === id) return i;
    return arr.length - 1;
  }

  function borrar(id) {
    const arr = lista().filter(function (m) { return m.id !== id; });
    guardarLista(arr);
    if (Store.settings().menuActivo === id) marcarActivo(arr.length ? arr[0].id : '');
    else escribirElViejo();
    return arr;
  }

  /* ---------- el día de hoy, dentro del menú que manda ----------
     Lo pedían por separado la portada y la pantalla del día; dos copias del
     mismo cálculo acaban diciendo días distintos. */
  const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves',
    'Viernes', 'Sábado'];

  function diaDeHoy(menu) {
    const m = menu || activo();
    const plan = m && m.plan;
    if (!plan || !plan.dias || !plan.dias.length) return null;

    const nombre = DIAS_LARGOS[new Date().getDay()];
    const suyo = plan.dias.filter(function (d) {
      return g.I18N && I18N.norm(String(d.dia || '')) === I18N.norm(nombre);
    })[0];
    if (suyo) return suyo;

    /* Un menú de siete días puede venir sin nombrar los días; entonces se coge
       por posición, con el lunes primero, que es como se lee un plan semanal. */
    const i = (new Date().getDay() + 6) % 7;
    return plan.dias[i] || null;
  }

  /* ¿Este día del menú es hoy? Si el menú no nombra los días —los hay que
     vienen numerados—, se cuenta por posición con el lunes primero, que es como
     se lee un plan semanal. */
  function esElDiaDeHoy(d, i, cuantos) {
    const hoy = DIAS_LARGOS[new Date().getDay()];
    if (d && d.dia && g.I18N) return I18N.norm(String(d.dia)) === I18N.norm(hoy);
    return cuantos === 7 && i === (new Date().getDay() + 6) % 7;
  }

  /* El día de hoy con su sitio: qué menú es y qué índice ocupa el día dentro.
     diaDeHoy() devuelve el día suelto, y con eso no se puede construir la
     referencia «menú|día|comida» que necesita marcar una comida. */
  function hoyConRef() {
    const m = activo();
    const dias = (m && m.plan && m.plan.dias) || [];
    if (!dias.length) return null;

    const hoy = DIAS_LARGOS[new Date().getDay()];
    for (let i = 0; i < dias.length; i++) {
      if (g.I18N && I18N.norm(String(dias[i].dia || '')) === I18N.norm(hoy)) {
        return { menu: m, dia: dias[i], i: i };
      }
    }
    const i = (new Date().getDay() + 6) % 7;
    return dias[i] ? { menu: m, dia: dias[i], i: i } : null;
  }

  /* ---------- un menú sin IA ----------
     No todo el mundo quiere —o puede— gastar una llamada al entrenador cada vez
     que quiere un menú nuevo, y quien no tiene la clave configurada se quedaba
     sin poder crear ninguno.

     Esto no se inventa platos: reparte tus números entre tus comidas y deja
     dicho qué tiene que llevar cada una. Es un esqueleto honesto —«desayuno de
     620 kcal con 32 g de proteína: una de proteína, una de hidrato y fruta»— y
     no una lista de recetas fingidas. Los platos los pones tú, o pides el menú
     con IA y te los propone.

     El reparto no es a partes iguales: la comida del mediodía pesa más que la
     media mañana, que es como come la gente. */
  const REPARTOS = {
    2: [{ n: 'Comida', h: '14:00', p: 0.55 }, { n: 'Cena', h: '21:00', p: 0.45 }],
    3: [{ n: 'Desayuno', h: '08:00', p: 0.28 }, { n: 'Comida', h: '14:00', p: 0.42 },
        { n: 'Cena', h: '21:00', p: 0.30 }],
    4: [{ n: 'Desayuno', h: '08:00', p: 0.25 }, { n: 'Comida', h: '14:00', p: 0.35 },
        { n: 'Merienda', h: '17:30', p: 0.15 }, { n: 'Cena', h: '21:00', p: 0.25 }],
    5: [{ n: 'Desayuno', h: '07:30', p: 0.22 }, { n: 'Media mañana', h: '10:30', p: 0.12 },
        { n: 'Comida', h: '14:00', p: 0.32 }, { n: 'Merienda', h: '17:30', p: 0.12 },
        { n: 'Cena', h: '21:00', p: 0.22 }],
    6: [{ n: 'Desayuno', h: '07:30', p: 0.20 }, { n: 'Media mañana', h: '10:30', p: 0.10 },
        { n: 'Comida', h: '14:00', p: 0.28 }, { n: 'Merienda', h: '17:00', p: 0.12 },
        { n: 'Cena', h: '21:00', p: 0.20 }, { n: 'Antes de dormir', h: '22:30', p: 0.10 }]
  };

  const QUE_LLEVA = {
    'Desayuno': 'Proteína (huevos, yogur griego, queso fresco), un hidrato ' +
      '(avena, pan integral) y fruta',
    'Media mañana': 'Algo de proteína y fruta o frutos secos',
    'Comida': 'Una ración de proteína, un hidrato (arroz, pasta, patata, legumbre) ' +
      'y verdura, con aceite de oliva',
    'Merienda': 'Proteína (yogur, atún, pavo) con un hidrato ligero',
    'Cena': 'Proteína (pescado, huevo, pollo) y verdura, con poco hidrato',
    'Antes de dormir': 'Proteína de digestión lenta: yogur griego o requesón'
  };

  function generico(opciones) {
    opciones = opciones || {};
    const p = Perfil.datos();
    const m = Perfil.macros(p);
    if (!m) return null;

    const cuantas = Math.min(6, Math.max(2, Number(p.comidas) || 4));
    const reparto = REPARTOS[cuantas] || REPARTOS[4];

    const diasEntreno = {};
    Store.routines().forEach(function (r) {
      (r.days || []).forEach(function (d) { diasEntreno[d] = true; });
    });
    const cortos = (g.UI && UI.DAY_NAMES) || [];

    const dias = DIAS_LARGOS.slice(1).concat([DIAS_LARGOS[0]]).map(function (nombre, i) {
      /* DIAS_LARGOS empieza en domingo; aquí se rota para que la semana empiece
         en lunes, que es como se lee un plan semanal. */
      const corto = cortos[(i + 1) % 7];
      const comidas = reparto.map(function (c) {
        return {
          nombre: c.n,
          hora: c.h,
          plato: QUE_LLEVA[c.n] || 'A tu elección, cuadrando los números',
          kcal: Math.round(m.kcal * c.p),
          prot: Math.round(m.prot * c.p),
          carbo: Math.round(m.carbo * c.p),
          grasa: Math.round(m.grasa * c.p)
        };
      });
      return {
        dia: nombre,
        entreno: !!diasEntreno[corto],
        total: { kcal: m.kcal, prot: m.prot },
        comidas: comidas
      };
    });

    const litros = Perfil.agua(p);

    return {
      resumen: 'Reparto de tus ' + m.kcal + ' kcal y ' + m.prot + ' g de proteína entre ' +
        cuantas + ' comidas. Los platos los eliges tú: aquí están los números que ' +
        'tiene que cuadrar cada comida y qué debe llevar.',
      dias: dias,
      hidratacion: litros ? {
        total: UI.dec(litros) + ' L',
        pauta: ['Al levantarte: un vaso grande',
          'A media mañana: un vaso', 'Antes de entrenar: un vaso',
          'Al terminar de entrenar: un vaso', 'Con la cena: un vaso'],
        nota: 'El café y las infusiones cuentan para el líquido total, pero no ' +
          'sustituyen al agua.'
      } : null,
      compra: String(p.despensa || '').split(',').map(function (x) { return x.trim(); })
        .filter(Boolean).slice(0, 20),
      consejos: [
        'Cuadra primero la proteína de cada comida; las calorías se ajustan con el ' +
        'hidrato y el aceite.',
        'Si un día te pasas, no compenses saltándote la siguiente comida: vuelve al ' +
        'plan en la siguiente.'
      ],
      /* Que quede dicho de dónde sale, porque no es lo mismo que un menú
         pensado plato a plato y no debe parecerlo. */
      generico: true
    };
  }

  g.Menus = {
    lista: lista, porId: porId, activo: activo, activoId: activoId,
    marcarActivo: marcarActivo, crear: crear, actualizar: actualizar,
    renombrar: renombrar, duplicar: duplicar, borrar: borrar,
    nombreLibre: nombreLibre, diaDeHoy: diaDeHoy, hoyConRef: hoyConRef,
    esElDiaDeHoy: esElDiaDeHoy, generico: generico,
    tono: tono, migrar: migrar
  };
})(window);
