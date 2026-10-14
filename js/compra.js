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
      return {
        menuId: menu.id,
        menuNombre: menu.nombre,
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
              const cuanto = typeof c === 'string' ? '' : String(c.cuanto || '');
              return { que: que, cuanto: cuanto, hecho: false, antes: '' };
            }).filter(function (c) { return c.que; })
          };
        }).filter(function (z) { return z.cosas.length; })
      };
    });
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

  g.ListaCompra = {
    de: de, poner: poner, borrar: borrar, generar: generar,
    marcar: marcar, limpiarMarcas: limpiarMarcas, cuenta: cuenta,
    sustituir: sustituir, deshacerSustitucion: deshacerSustitucion
  };
})(window);
