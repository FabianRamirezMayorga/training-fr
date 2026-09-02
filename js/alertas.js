/* alertas.js — recordatorios de entrenamiento, agua, comidas y pesaje.

   Una web no puede despertar el teléfono por su cuenta sin un servidor de push
   (que costaría dinero). Aquí se cubren los tres caminos que sí funcionan gratis:
     1. Aviso del sistema mientras la app está abierta o en segundo plano.
     2. Descarga al calendario del móvil, que sí avisa siempre con la app cerrada.
     3. Lo pendiente aparece al abrir la app. */
(function (g) {
  'use strict';

  const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const TIPOS = {
    entreno: { label: 'Entrenamiento', icono: 'dumbbell', titulo: 'Toca entrenar',
      mensaje: 'Tu rutina de hoy te está esperando.' },
    agua: { label: 'Beber agua', icono: 'gota', titulo: 'Hidrátate',
      mensaje: 'Un vaso de agua ahora.' },
    comida: { label: 'Comida', icono: 'nutricion', titulo: 'Hora de comer',
      mensaje: 'Toca comida según tu plan.' },
    peso: { label: 'Pesarte', icono: 'perfil', titulo: 'Pésate',
      mensaje: 'Registra tu peso para seguir la evolución.' },
    suplemento: { label: 'Suplemento', icono: 'nutricion', titulo: 'Suplemento',
      mensaje: 'Toca tu suplemento.' },
    libre: { label: 'Personalizada', icono: 'campana', titulo: 'Recordatorio', mensaje: '' }
  };

  function lista() { return Store.settings().alertas || []; }
  function guardarLista(arr) { Store.setSetting('alertas', arr); }

  function nueva(tipo) {
    const t = TIPOS[tipo] || TIPOS.libre;
    return {
      id: Store.uid(), tipo: tipo, titulo: t.titulo, mensaje: t.mensaje,
      dias: [1, 2, 3, 4, 5], hora: '18:00', activa: true, ultima: 0
    };
  }

  function guardar(a) {
    const arr = lista().slice();
    const i = arr.findIndex(function (x) { return x.id === a.id; });
    if (i === -1) arr.push(a); else arr[i] = a;
    arr.sort(function (x, y) { return x.hora.localeCompare(y.hora); });
    guardarLista(arr);
    return a;
  }

  function borrar(id) {
    guardarLista(lista().filter(function (a) { return a.id !== id; }));
  }

  /* Crea los recordatorios de entrenamiento a partir de los días de tus rutinas */
  function desdeRutinas(hora) {
    const mapa = { 'Lun': 1, 'Mar': 2, 'Mié': 3, 'Jue': 4, 'Vie': 5, 'Sáb': 6, 'Dom': 0 };
    const dias = {};
    Store.routines().forEach(function (r) {
      (r.days || []).forEach(function (d) { if (mapa[d] !== undefined) dias[mapa[d]] = true; });
    });
    const nums = Object.keys(dias).map(Number);
    if (!nums.length) return null;

    const a = nueva('entreno');
    a.dias = nums.sort();
    a.hora = hora || '18:00';
    return guardar(a);
  }

  /* ---------- permiso y aviso del sistema ---------- */

  function soportado() { return 'Notification' in window; }

  function permiso() { return soportado() ? Notification.permission : 'unsupported'; }

  function pedirPermiso() {
    if (!soportado()) return Promise.resolve('unsupported');
    return Notification.requestPermission();
  }

  function avisar(titulo, cuerpo) {
    if (!soportado() || Notification.permission !== 'granted') return false;
    try {
      const opciones = {
        body: cuerpo, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
        tag: 'trainingfr', renotify: true
      };
      /* con service worker el aviso sobrevive aunque la pestaña esté en segundo plano */
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(function (reg) {
          reg.showNotification(titulo, opciones);
        }).catch(function () { new Notification(titulo, opciones); });
      } else {
        new Notification(titulo, opciones);
      }
      return true;
    } catch (e) { return false; }
  }

  /* ---------- comprobación periódica ---------- */

  function minutosDelDia(hhmm) {
    const p = String(hhmm || '0:00').split(':');
    return (Number(p[0]) || 0) * 60 + (Number(p[1]) || 0);
  }

  /* Alertas que ya deberían haber sonado hoy y aún no lo han hecho */
  function pendientes() {
    const ahora = new Date();
    const hoy = Store.dayKey(ahora.getTime());
    const min = ahora.getHours() * 60 + ahora.getMinutes();

    return lista().filter(function (a) {
      if (!a.activa) return false;
      if (a.dias.indexOf(ahora.getDay()) === -1) return false;
      if (minutosDelDia(a.hora) > min) return false;
      return Store.dayKey(a.ultima || 0) !== hoy;
    });
  }

  function marcarLanzada(id) {
    const arr = lista().slice();
    const a = arr.find(function (x) { return x.id === id; });
    if (a) { a.ultima = Date.now(); guardarLista(arr); }
  }

  let temporizador = null;

  /* Revisa cada minuto mientras la app esté abierta. onAviso recibe las que tocan. */
  function arrancar(onAviso) {
    clearInterval(temporizador);
    const comprobar = function () {
      const p = pendientes();
      if (!p.length) return;
      p.forEach(function (a) {
        avisar(a.titulo, a.mensaje);
        marcarLanzada(a.id);
      });
      if (onAviso) onAviso(p);
    };
    comprobar();
    temporizador = setInterval(comprobar, 60000);
  }

  function parar() { clearInterval(temporizador); temporizador = null; }

  /* ---------- exportar al calendario ---------- */

  function dosDigitos(n) { return String(n).padStart(2, '0'); }

  /* Un archivo .ics con un evento repetido por alerta y su aviso 5 minutos antes.
     Al abrirlo, el móvil crea los recordatorios de verdad, incluso con la app cerrada. */
  function ics() {
    const NOMBRE_DIA = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const ahora = new Date();
    const sello = ahora.getUTCFullYear() + dosDigitos(ahora.getUTCMonth() + 1) +
      dosDigitos(ahora.getUTCDate()) + 'T' + dosDigitos(ahora.getUTCHours()) +
      dosDigitos(ahora.getUTCMinutes()) + '00Z';

    const lineas = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Training FR//ES', 'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH', 'X-WR-CALNAME:Training FR'
    ];

    lista().filter(function (a) { return a.activa && a.dias.length; }).forEach(function (a) {
      const hm = a.hora.split(':');
      /* primera aparición: el próximo día de la semana que corresponda */
      const inicio = new Date();
      inicio.setHours(Number(hm[0]) || 0, Number(hm[1]) || 0, 0, 0);
      let saltos = 0;
      while (a.dias.indexOf(inicio.getDay()) === -1 || inicio < ahora) {
        inicio.setDate(inicio.getDate() + 1);
        if (++saltos > 14) break;
      }
      const fecha = inicio.getFullYear() + dosDigitos(inicio.getMonth() + 1) +
        dosDigitos(inicio.getDate()) + 'T' + dosDigitos(inicio.getHours()) +
        dosDigitos(inicio.getMinutes()) + '00';

      lineas.push(
        'BEGIN:VEVENT',
        'UID:' + a.id + '@trainingfr',
        'DTSTAMP:' + sello,
        'DTSTART:' + fecha,
        'DURATION:PT30M',
        'RRULE:FREQ=WEEKLY;BYDAY=' + a.dias.map(function (d) { return NOMBRE_DIA[d]; }).join(','),
        'SUMMARY:' + escaparICS(a.titulo),
        'DESCRIPTION:' + escaparICS(a.mensaje || ''),
        'BEGIN:VALARM', 'TRIGGER:-PT5M', 'ACTION:DISPLAY',
        'DESCRIPTION:' + escaparICS(a.titulo), 'END:VALARM',
        'END:VEVENT'
      );
    });

    lineas.push('END:VCALENDAR');
    return lineas.join('\r\n');
  }

  function escaparICS(s) {
    return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;')
      .replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  function resumenDias(a) {
    if (a.dias.length === 7) return 'Todos los días';
    if (a.dias.length === 5 && a.dias.every(function (d) { return d >= 1 && d <= 5; })) {
      return 'De lunes a viernes';
    }
    return a.dias.slice().sort().map(function (d) { return DIAS[d]; }).join(', ');
  }

  g.Alertas = {
    TIPOS: TIPOS, DIAS: DIAS,
    lista: lista, nueva: nueva, guardar: guardar, borrar: borrar, desdeRutinas: desdeRutinas,
    soportado: soportado, permiso: permiso, pedirPermiso: pedirPermiso, avisar: avisar,
    pendientes: pendientes, arrancar: arrancar, parar: parar,
    ics: ics, resumenDias: resumenDias
  };
})(window);
