/* compra.js — la lista de la compra: se genera, se guarda y se cambia.

   Antes era un reflejo del menú: lo que la IA hubiera metido en el campo
   «compra» al crearlo, pintado tal cual. Eso vale para mirar y no para usar,
   porque en el súper pasan dos cosas que un reflejo no admite: compras para un
   número de días que decides tú, y la mitad de las veces acabas cambiando algo
   —no había, estaba caro, no te apetece—.

   Así que la lista pasa a ser un objeto propio, con su menú de origen, sus días
   y sus cosas, cada una con su estado y su posible sustitución. El menú sigue
   siendo la fuente, pero ya no es el dueño.

   Tres cosas viven aquí y no en la vista, porque no son de pintar:
     - generar (IA: leer platos, sumar raciones, redondear a formatos de venta),
     - sustituir un alimento y arrastrar el cambio al menú,
     - y el estado de lo comprado, que tiene que sobrevivir a cerrar la app en
       mitad del pasillo. */
(function (g) {
  'use strict';

  const CLAVE = 'listaCompra';

  function todas() {
    try { return Store.settings()[CLAVE] || {}; }
    catch (e) { return {}; }
  }

  function guardar(todo) { Store.setSetting(CLAVE, todo); }

  function de(menuId) { return todas()[menuId] || null; }

  function poner(menuId, lista) {
    const todo = Object.assign({}, todas());
    todo[menuId] = lista;
    guardar(todo);
  }

  function borrar(menuId) {
    const todo = Object.assign({}, todas());
    delete todo[menuId];
    guardar(todo);
  }

  /* Lo que hay que comprar de una cosa, calculado aquí.

     La IA dice dos números —cuánto lleva una ración y cuántas raciones hay— y
     la multiplicación se hace en esta función. No es desconfianza gratuita:
     pedírsela a ella daba listas que se quedaban en la mitad de la proteína
     del mes, y reforzar el encargo con tablas y con la cifra objetivo delante
     no lo arregló —salía incluso peor—. Leer «pechuga 200 g» en un plato es
     comprensión y es suya; 200 por 30 es una cuenta y es nuestra. */
  function cuantoHace(c) {
    const racion = Number(c.racion) || 0;
    const veces = Number(c.veces) || 0;
    if (!racion || !veces) return String(c.cuanto || '');
    const total = racion * veces;
    const u = String(c.unidad || 'g').toLowerCase();

    if (u === 'unidad' || u === 'unidades' || u === 'u') {
      /* Hacia arriba: media docena de huevos y media no se puede comprar. */
      const n = Math.ceil(total);
      return Tp(n, '{n} unidad', '{n} unidades');
    }
    if (u === 'ml' || u === 'l') {
      const ml = u === 'l' ? total * 1000 : total;
      return ml >= 1000 ? Tn('{n} l', { n: Math.round(ml / 100) / 10 })
        : Tn('{n} ml', { n: Math.round(ml) });
    }
    return total >= 1000 ? Tn('{n} kg', { n: Math.round(total / 100) / 10 })
      : Tn('{n} g', { n: Math.round(total) });
  }

  /* ---------- generar ----------
     Esto sí es para la IA, y conviene decir por qué: hay que leer platos
     escritos en castellano corriente, entender que «80 g de avena» siete veces
     son 560 g, y saber que 560 g de avena se compran en un paquete de kilo. Lo
     primero es comprensión, lo último es saber cómo se vende la comida. Ninguna
     de las dos sale de una tabla. */
  function generar(menu, dias) {
    if (!g.IA || !IA.activa()) {
      return Promise.reject(new Error(
        T('Esto necesita un proveedor de IA con su clave, en la bóveda de Ajustes.')));
    }
    return IA.listaDeCompra(menu.plan, dias).then(function (r) {
      const zonas = (r && r.compra) || [];
      if (!zonas.length) throw new Error(T('No he podido sacar la lista de ese menú.'));
      /* El objetivo se guarda con la lista: es del menú y de los días que
         pediste, y si luego cambias de menú la lista vieja sigue sabiendo
         contra qué se medía. */
      const dd = (menu.plan && menu.plan.dias) || [];
      let op = 0, oc = 0, og = 0;
      dd.forEach(function (d) {
        (d.comidas || []).forEach(function (co) {
          op += Number(co.prot) || 0;
          oc += Number(co.carbo) || 0;
          og += Number(co.grasa) || 0;
        });
      });
      const vueltas = dd.length ? dias / dd.length : 0;

      return {
        menuId: menu.id,
        menuNombre: menu.nombre,
        objetivo: dd.length ? {
          prot: Math.round(op * vueltas),
          carbo: Math.round(oc * vueltas),
          grasa: Math.round(og * vueltas)
        } : null,
        /* El nombre se lo pone el usuario al guardarla; hasta entonces vale el
           del menú, que es de donde sale. */
        nombre: '',
        dias: dias,
        t: Date.now(),
        zonas: zonas.map(function (z) {
          return {
            zona: String(z.zona || ''),
            cosas: (z.cosas || []).map(function (c) {
              /* La IA puede devolver un texto suelto o {que, cuanto}. Se
                 aceptan los dos: el formato lo decide ella y lo que no puede
                 pasar es que un día no se vea nada. */
              const que = typeof c === 'string' ? c : String(c.que || '');
              const cuanto = typeof c === 'string' ? '' : cuantoHace(c);
              /* Cómo se vende va aparte de cuánto hace falta: juntarlos es lo
                 que hacía que la compra de un día saliera con dos kilos de
                 carne, porque cada cosa se redondeaba a su envase y nadie veía
                 ya cuánto se iba a comer de verdad. */
              /* Y si viene redactado —«se vende por libra»— se le quita el
                 arranque: la fila ya pone «se vende en» delante, y juntos
                 salía «se vende en se vende por libra». */
              const venta = (typeof c === 'string' ? '' : String(c.venta || ''))
                .replace(/^\s*(se\s+vende\s+(en|por)?|viene\s+en)\s*/i, '').trim();
              /* Lo que aporta esto en todo el periodo. La IA da lo de UNA
                 ración —que es consulta de tabla, lo suyo— y aquí se multiplica
                 por las veces. Con eso la app puede decir sola si la compra
                 llega a lo que come el menú, en vez de fiarse. */
              const veces = typeof c === 'string' ? 0 : Number(c.veces) || 0;
              const mac = typeof c === 'string' ? null : {
                prot: Math.round((Number(c.prot) || 0) * veces),
                carbo: Math.round((Number(c.carbo) || 0) * veces),
                grasa: Math.round((Number(c.grasa) || 0) * veces)
              };
              return { que: que, cuanto: cuanto, venta: venta, hecho: false, antes: '',
                mac: mac && (mac.prot || mac.carbo || mac.grasa) ? mac : null };
            }).filter(function (c) { return c.que; })
          };
        }).filter(function (z) { return z.cosas.length; })
      };
    });
  }

  /* Lo que trae la lista, frente a lo que come el menú. Sale de sumar lo de
     cada cosa, que ya viene multiplicado: aritmética pura sobre números que
     están guardados. Devuelve null cuando no hay con qué comparar —listas
     viejas, o una IA que no mandó los macros—, porque medio balance confunde
     más que ninguno. */
  function balance(lista, dias) {
    if (!lista || !lista.objetivo) return null;
    let p = 0, cb = 0, g = 0, con = 0, total = 0;
    (lista.zonas || []).forEach(function (z) {
      (z.cosas || []).forEach(function (c) {
        total++;
        if (!c.mac) return;
        con++;
        p += c.mac.prot || 0;
        cb += c.mac.carbo || 0;
        g += c.mac.grasa || 0;
      });
    });
    /* Con menos de la mitad de las cosas medidas, el total no significa nada. */
    if (!total || con < total / 2) return null;
    const n = Math.max(1, Number(dias || lista.dias) || 1);
    return {
      dias: n,
      trae: { prot: p, carbo: cb, grasa: g },
      pide: lista.objetivo,
      /* Al día, que es como se piensa la comida. */
      traeDia: { prot: Math.round(p / n), carbo: Math.round(cb / n), grasa: Math.round(g / n) },
      pideDia: {
        prot: Math.round(lista.objetivo.prot / n),
        carbo: Math.round(lista.objetivo.carbo / n),
        grasa: Math.round(lista.objetivo.grasa / n)
      },
      /* Corto de verdad es quedarse por debajo del 85 %: por encima de eso la
         diferencia cabe en el margen de las tablas y de lo que sobra. */
      corto: lista.objetivo.prot > 0 && p < lista.objetivo.prot * 0.85
    };
  }

  /* ---------- en el súper ---------- */

  function marcar(menuId, zi, ci, si) {
    const l = de(menuId);
    if (!l || !l.zonas[zi] || !l.zonas[zi].cosas[ci]) return;
    l.zonas[zi].cosas[ci].hecho = !!si;
    poner(menuId, l);
  }

  function limpiarMarcas(menuId) {
    const l = de(menuId);
    if (!l) return;
    l.zonas.forEach(function (z) {
      z.cosas.forEach(function (c) { c.hecho = false; });
    });
    poner(menuId, l);
  }

  function cuenta(lista) {
    let total = 0, hechas = 0;
    (lista ? lista.zonas : []).forEach(function (z) {
      z.cosas.forEach(function (c) { total++; if (c.hecho) hechas++; });
    });
    return { total: total, hechas: hechas };
  }

  /* ---------- sustituir ----------
     Lo que se guarda es `antes`: con qué venía la lista. Sin eso, al cambiar
     pollo por pavo la lista dice pavo y nadie recuerda que el menú sigue
     hablando de pollo, que es justo la incoherencia que esto viene a evitar. */
  function sustituir(menuId, zi, ci, nuevo) {
    const l = de(menuId);
    if (!l || !l.zonas[zi] || !l.zonas[zi].cosas[ci]) return null;
    const c = l.zonas[zi].cosas[ci];
    if (!c.antes) c.antes = c.que;
    const viejo = c.que;
    c.que = String(nuevo || '').trim() || c.que;
    poner(menuId, l);
    return { viejo: viejo, nuevo: c.que };
  }

  function deshacerSustitucion(menuId, zi, ci) {
    const l = de(menuId);
    if (!l || !l.zonas[zi] || !l.zonas[zi].cosas[ci]) return;
    const c = l.zonas[zi].cosas[ci];
    if (!c.antes) return;
    c.que = c.antes;
    c.antes = '';
    poner(menuId, l);
  }

  /* Todas las listas vivas, de más nueva a más vieja, con el id del menú
     dentro. La pantalla las necesita para enseñártelas juntas: tener dos listas
     a medias y que solo se vea la del menú que esté activo era esconderlas. */
  function vivas() {
    const todo = todas();
    return Object.keys(todo).map(function (id) {
      return Object.assign({ menuId: id }, todo[id]);
    }).sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  }

  /* ---------- lo que falta y lo que sobra ----------
     Una lista hecha por otro siempre se queda corta en algo: el papel de
     cocina, lo que se acabó ayer, lo que no sale en ningún plato. Si no se
     puede añadir, acabas con la lista de la app en una mano y una nota en la
     otra, que es justo lo que esto viene a evitar. */
  function anadirCosa(menuId, zona, que, cuanto) {
    const l = de(menuId);
    if (!l) return;
    que = String(que || '').trim();
    if (!que) return;
    const nombre = String(zona || '').trim() || 'Otros';
    let z = l.zonas.filter(function (x) { return x.zona === nombre; })[0];
    if (!z) { z = { zona: nombre, cosas: [] }; l.zonas.push(z); }
    /* `mio` queda marcado para distinguir lo tuyo de lo que sacó el entrenador:
       rehacer la lista no debería llevarse por delante lo que añadiste tú. */
    z.cosas.push({ que: que, cuanto: String(cuanto || '').trim(), venta: '',
      hecho: false, antes: '', mio: true });
    poner(menuId, l);
  }

  function quitarCosa(menuId, zi, ci) {
    const l = de(menuId);
    if (!l || !l.zonas[zi] || !l.zonas[zi].cosas[ci]) return;
    l.zonas[zi].cosas.splice(ci, 1);
    /* Una zona sin nada no es una zona: solo es un rótulo por el que pasar. */
    if (!l.zonas[zi].cosas.length) l.zonas.splice(zi, 1);
    poner(menuId, l);
  }

  function renombrar(menuId, nombre) {
    const l = de(menuId);
    if (!l) return;
    l.nombre = String(nombre || '').trim();
    poner(menuId, l);
  }

  g.ListaCompra = {
    de: de, poner: poner, borrar: borrar, generar: generar, vivas: vivas,
    renombrar: renombrar, anadirCosa: anadirCosa, quitarCosa: quitarCosa,
    balance: balance,
    marcar: marcar, limpiarMarcas: limpiarMarcas, cuenta: cuenta,
    sustituir: sustituir, deshacerSustitucion: deshacerSustitucion
  };
})(window);
