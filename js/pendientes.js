/* pendientes.js — lo que se apuntó sin internet y quedó a medias.

   Apuntar una actividad a mano —«subí a Monserrate andando y bajé»— se puede
   sin cobertura: la app sabe el día, los minutos y, si la palabra le suena, de
   qué actividad se trata. Lo que no puede sin red es preguntarle a la IA cuánto
   cuesta eso de verdad y qué músculos mueve, que es la diferencia entre un
   paseo y subir setecientos metros de desnivel.

   Antes eso se perdía: se guardaba con el MET del chip —o con ninguno— y ahí se
   quedaba para siempre, aunque diez minutos después hubiera wifi. La otra
   salida era no dejar apuntarlo, que es peor: lo que no se apunta en el
   momento no se apunta nunca.

   Así que se guarda con lo que se sepa y se marca. Cuando vuelve la red, esto
   las repasa y las afina. El apunte nunca depende de tener cobertura; solo la
   opinión, que es lo que la IA aporta.

   Lo que NO hace: reescribir lo que tú pusiste. Los minutos y el día son tuyos
   y no se tocan. Lo que se rellena es lo que la app había estimado a ojo. */
(function (g) {
  'use strict';

  /* Que no se solapen dos repasos: el evento «online» llega a veces dos veces
     seguidas, y con la app abierta en dos pestañas llega en las dos. */
  let repasando = false;

  /* ---------- qué está a medias ---------- */

  /* Una sesión está pendiente si se apuntó a mano con un texto escrito y la IA
     no llegó a mirarlo. El texto es imprescindible: sin él no hay nada que
     preguntar, y una actividad elegida solo con el chip ya tiene todo lo que la
     app puede saber de ella por reglas. */
  function esPendiente(s) {
    return !!(s && s.pendiente && String(s.texto || '').trim());
  }

  function lista() {
    if (!g.Store) return [];
    return Store.sessions().filter(esPendiente);
  }

  function cuantas() { return lista().length; }

  /* ---------- afinar una ---------- */

  /* Se le pregunta lo mismo que se le habría preguntado en la hoja de apuntar:
     qué actividad es, cuánto cuesta por minuto y qué mueve. La cuenta de
     calorías la sigue haciendo la app con el MET y el peso —una multiplicación
     es una regla, no una opinión— para que salga el mismo número que habría
     salido con cobertura. */
  function afinar(s) {
    return IA.estimarActividad(s.texto).then(function (r) {
      if (!r || !r.met) {
        /* No es una actividad física, o la IA no supo verla. Se desmarca: si no,
           se le vuelve a preguntar lo mismo cada vez que haya red, para siempre,
           y cada pregunta cuesta. Lo apuntado se queda como está. */
        return { id: s.id, cambios: { pendiente: false, origen: 'medio' }, mejorada: false };
      }

      const p = g.Perfil ? Perfil.datos() : null;
      const peso = Number(p && p.peso) || 75;
      const minutos = Number(s.minutos) || Math.round(((s.end || s.start) - s.start) / 60000);

      const cambios = {
        pendiente: false,
        met: r.met,
        kcal: Math.round(r.met * peso * minutos / 60),
        nota: r.nota || s.nota || '',
        origen: 'ia'
      };
      /* Los músculos solo si los hay: los del chip, aunque sean genéricos, son
         mejores que ninguno, y una lista vacía borraría la zona del reparto. */
      if (r.musculos && r.musculos.length) cambios.musculos = r.musculos.slice();

      return { id: s.id, cambios: cambios, mejorada: true };
    });
  }

  /* ---------- el repaso ---------- */

  /* De una en una y no todas a la vez: son llamadas a la IA con la clave del
     usuario, y diez peticiones de golpe al volver el wifi es la clase de cosa
     que hace que un proveedor te corte. Además, si la red vuelve floja, la
     primera que falle para el repaso y las demás se quedan para la próxima. */
  function repasar() {
    if (repasando) return Promise.resolve(0);
    if (!g.IA || !IA.activa() || !IA.estimarActividad) return Promise.resolve(0);
    if (navigator.onLine === false) return Promise.resolve(0);

    const cola = lista();
    if (!cola.length) return Promise.resolve(0);

    repasando = true;
    let hechas = 0;

    const siguiente = function (i) {
      if (i >= cola.length) return Promise.resolve();
      return afinar(cola[i]).then(function (res) {
        Store.actualizarSesion(res.id, res.cambios);
        if (res.mejorada) hechas++;
        return siguiente(i + 1);
      }).catch(function () {
        /* Se corta y se deja para la próxima: siguen marcadas, así que no se
           pierde nada. Un fallo aquí casi siempre es que la red volvió a irse. */
      });
    };

    return siguiente(0).then(function () {
      repasando = false;
      if (hechas && g.UI && UI.toast) {
        UI.toast(Tp(hechas, 'Ya tengo internet: he afinado {n} apunte.',
          'Ya tengo internet: he afinado {n} apuntes.'));
      }
      /* Repintar para que el cambio se vea donde esté mirando: el reparto por
         zona y las calorías del día son de los que acaban de cambiar. */
      if (hechas && g.App && App.render) App.render();
      return hechas;
    });
  }

  /* ---------- cuándo se repasa ----------
     Al volver la red y al abrir la app. Lo segundo hace falta porque el evento
     «online» no salta si la app estaba cerrada cuando volvió la cobertura, que
     es justo el caso normal: se apunta en el monte y se abre en casa.

     Con un respiro de por medio: «online» salta en cuanto hay interfaz de red,
     que es antes de que haya internet de verdad. Sin la espera, la primera
     llamada se iba al vacío y dejaba todo pendiente otra vez. */
  function enMarcha() {
    const luego = function () { setTimeout(repasar, 2500); };
    window.addEventListener('online', luego);
    if (document.readyState === 'complete') luego();
    else window.addEventListener('load', luego);
  }

  g.Pendientes = {
    esPendiente: esPendiente,
    cuantas: cuantas,
    repasar: repasar,
    enMarcha: enMarcha
  };
})(window);
