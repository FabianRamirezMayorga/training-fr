/* saludo.js — la bienvenida al abrir la app.
   No es una frase de galleta de la suerte: cada mensaje sale de lo que la app
   sabe de verdad (cuánto llevas sin venir, tu racha, lo que hiciste la última
   vez), así que dice algo cierto. Si dijera "¡a por todas!" sin más, a la
   tercera vez sobraría.

   La marca de la última visita se guarda solo en este dispositivo: si viajara
   con la cuenta, abrir la app en el móvil haría creer al portátil que acabas
   de pasar por ahí. */
(function (g) {
  'use strict';

  const CLAVE = 'trainingfr.visita';
  const HORAS_PARA_SALUDAR = 8;

  let yaSaludado = false;      // una vez por sesión de la app
  let descartado = false;

  function ultimaVisita() {
    const v = Number(localStorage.getItem(CLAVE) || 0);
    return v > 0 ? v : 0;
  }

  function marcarVisita() {
    try { localStorage.setItem(CLAVE, String(Date.now())); } catch (e) { /* nada */ }
  }

  function diasFuera() {
    const v = ultimaVisita();
    if (!v) return null;
    return Math.floor((Date.now() - v) / 864e5);
  }

  /* ¿Toca saludar? Solo al volver tras un rato, y una vez por sesión */
  function toca() {
    if (yaSaludado || descartado) return false;
    const v = ultimaVisita();
    if (!v) return true;                                  // primera vez en este dispositivo
    const horas = (Date.now() - v) / 36e5;
    if (horas >= HORAS_PARA_SALUDAR) return true;
    /* o si es otro día, aunque hayan pasado pocas horas */
    return Store.dayKey(v) !== Store.dayKey(Date.now());
  }

  function franjaHoraria() {
    const h = new Date().getHours();
    if (h < 6) return T('Buenas noches');
    if (h < 13) return T('Buenos días');
    if (h < 21) return T('Buenas tardes');
    return T('Buenas noches');
  }

  function nombre() {
    return String(Store.settings().name || '').trim();
  }

  function conNombre(saludo) {
    const n = nombre();
    return n ? Tn('{saludo}, {nombre}', { saludo: saludo, nombre: n }) : saludo;
  }

  /* El mensaje: se elige por la situación real, de la más excepcional a la más
     corriente. Corto, en segunda persona y sin exclamaciones de más. */
  function mensaje() {
    const st = Store.stats();
    const dias = diasFuera();
    const sesiones = Store.sessions();
    const ultima = sesiones.length ? sesiones[0] : null;
    const diasSinEntrenar = ultima
      ? Math.floor((Date.now() - ultima.start) / 864e5)
      : null;

    /* 1. Todavía no ha entrenado nunca */
    if (!sesiones.length) {
      return {
        titulo: conNombre(T('Bienvenido')),
        texto: T('Todo esto empieza con una serie. Elige una rutina y hazla: lo demás ' +
          'ya se va colocando solo.')
      };
    }

    /* 2. Vuelve después de mucho tiempo */
    if (diasSinEntrenar >= 21) {
      return {
        titulo: conNombre(T('Cuánto tiempo')),
        texto: T('Volver es la parte difícil y ya la has hecho. Hoy no busques tu mejor ' +
          'día: busca el primero.')
      };
    }
    if (diasSinEntrenar >= 8) {
      return {
        titulo: conNombre(T('Otra vez por aquí')),
        texto: Tn('Una semana parada no borra {n} entrenamientos. Baja algo el peso hoy ' +
          'y en dos sesiones estás donde estabas.', { n: st.total })
      };
    }

    /* 3. Racha viva */
    if (st.streak >= 5) {
      return {
        titulo: conNombre(franjaHoraria()),
        texto: Tn('{n} días seguidos. Lo raro ya no es entrenar hoy: sería no hacerlo.',
          { n: st.streak })
      };
    }
    if (st.streak >= 2) {
      return {
        titulo: conNombre(franjaHoraria()),
        texto: Tn('Llevas {n} días seguidos. Hoy es el que convierte la casualidad ' +
          'en costumbre.', { n: st.streak })
      };
    }

    /* 4. Semana en marcha */
    if (st.week >= 4) {
      return {
        titulo: conNombre(franjaHoraria()),
        texto: Tn('{n} entrenamientos esta semana. A este ritmo el descanso también ' +
          'entrena: si hoy toca parar, para.', { n: st.week })
      };
    }
    if (st.week >= 1) {
      return {
        titulo: conNombre(franjaHoraria()),
        texto: Tp(st.week,
          'Llevas {n} entrenamiento esta semana. Uno más y la semana ya cuenta.',
          'Llevas {n} entrenamientos esta semana. Uno más y la semana ya cuenta.')
      };
    }

    /* 5. Empieza la semana */
    if (diasSinEntrenar <= 2) {
      return {
        titulo: conNombre(franjaHoraria()),
        texto: T('Semana nueva y el cuerpo descansado. Es el mejor día para el ' +
          'ejercicio que peor se te da.')
      };
    }

    return {
      titulo: conNombre(franjaHoraria()),
      texto: Tn('Van {n} días desde la última. Con media hora hoy la semana cambia ' +
        'de signo.', { n: diasSinEntrenar })
    };
  }

  /* Se llama al pintar la portada. Devuelve el saludo o null. */
  function pendiente() {
    if (!toca()) return null;
    const m = mensaje();
    yaSaludado = true;
    marcarVisita();
    return m;
  }

  function descartar() { descartado = true; }

  g.Saludo = {
    pendiente: pendiente, descartar: descartar, mensaje: mensaje,
    marcarVisita: marcarVisita, diasFuera: diasFuera, nombre: nombre
  };
})(window);
