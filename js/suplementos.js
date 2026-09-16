/* suplementos.js — qué tomas, cuándo, y que el resto de la app lo sepa.

   Los suplementos estaban en el aire: se podía crear un recordatorio de tipo
   «suplemento», pero decía «Toca tu suplemento» sin saber cuál, a qué hora ni
   por qué. Y el menú que monta la IA proponía batidos de proteína a alguien que
   ya se toma dos al día, porque nadie se lo había contado.

   Aquí se apunta una vez y lo usa todo: los recordatorios se crean solos con el
   nombre y la dosis, el menú deja de repetir lo que ya tomas, y las calorías y
   la proteína que aportan cuentan en el día.

   LAS HORAS NO SE ESCRIBEN DOS VECES. «Con el desayuno» no guarda una hora:
   guarda que es con el desayuno, y la hora sale de las franjas de Alimentación.
   Si un día mueves el desayuno de las ocho a las seis, la creatina se mueve
   sola. Lo mismo con «antes de entrenar», que sale de la hora a la que sueles
   entrenar de verdad.

   Y NO SE RECETA NADA. El catálogo trae lo que suele venir en la etiqueta del
   bote como relleno del formulario, editable entero, porque teclear «creatina»
   y «5 g» en un móvil es justo lo que hace que nadie apunte nada. Lo que hay
   que tomar y si conviene tomarlo no lo decide una app. */
(function (g) {
  'use strict';

  /* ---------- lo que la gente toma ----------
     Ocho de cada diez listas caben aquí, y el resto se escribe a mano. La
     dosis es la que suele traer el bote, no una recomendación: sale como texto
     editable en el formulario y se puede cambiar entera.

     `aporta` solo lo llevan los que de verdad suman al día. Un multivitamínico
     no cambia tus calorías; un batido de proteína, sí, y no contarlo hace que
     el menú te pida 30 g de proteína que ya te has tomado. */
  const CATALOGO = [
    { id: 'creatina', nombre: 'Creatina', dosis: '5 g', momento: 'con:desayuno' },
    { id: 'proteina', nombre: 'Proteína en polvo', dosis: '1 cazo (30 g)',
      momento: 'tras:entreno', aporta: { kcal: 120, prot: 24 } },
    { id: 'omega3', nombre: 'Omega 3', dosis: '1 cápsula', momento: 'con:almuerzo' },
    { id: 'multi', nombre: 'Multivitamínico', dosis: '1 toma', momento: 'con:desayuno' },
    { id: 'vitd', nombre: 'Vitamina D', dosis: '1 cápsula', momento: 'con:almuerzo' },
    { id: 'magnesio', nombre: 'Magnesio', dosis: '1 toma', momento: 'con:cena' },
    { id: 'cafeina', nombre: 'Cafeína o pre-entreno', dosis: '1 toma',
      momento: 'antes:entreno' },
    { id: 'colageno', nombre: 'Colágeno', dosis: '10 g', momento: 'con:desayuno',
      aporta: { kcal: 36, prot: 9 } },
    { id: 'aminos', nombre: 'Aminoácidos (EAA o BCAA)', dosis: '1 toma',
      momento: 'antes:entreno' },
    { id: 'glutamina', nombre: 'Glutamina', dosis: '5 g', momento: 'con:cena' },
    { id: 'zinc', nombre: 'Zinc', dosis: '1 toma', momento: 'con:cena' },
    { id: 'otro', nombre: 'Otro', dosis: '', momento: 'con:desayuno' }
  ];

  /* ---------- cada cuánto ----------
     «Los días que entreno» es el que más falta hacía y el que ninguna lista de
     frecuencias trae: media suplementación de gimnasio va atada al entreno, no
     al calendario. */
  /* El `corto` es para las pastillas del formulario y el `label` para leerlo en
     la lista. Una pastilla con «Los días que entreno» dentro ocupa una línea
     entera y deja de parecer una pastilla. */
  const FRECUENCIAS = [
    { id: 'diario', label: 'Todos los días', corto: 'Cada día', sub: 'Los siete' },
    { id: 'entreno', label: 'Los días que entreno', corto: 'Días que entreno',
      sub: 'Sale de los días de tu plan' },
    { id: 'alterno', label: 'Un día sí y otro no', corto: 'Día sí, día no',
      sub: 'Empezando hoy' },
    { id: 'semanal', label: 'Un día a la semana', corto: 'Un día/semana',
      sub: 'El que elijas' },
    /* Lo que faltaba y no trae ninguna lista de frecuencias: media
       suplementación se reparte en el día —magnesio en dos tomas, aminoácidos
       cada pocas horas, enzimas con cada comida— y con «todos los días» solo se
       podía apuntar una. */
    { id: 'varias', label: 'Varias veces al día', corto: 'Varias al día',
      sub: 'Repartido en el día', reparte: true }
  ];

  /* ---------- cómo se reparte ----------
     Las dos familias son distintas de raíz. «Cada tantas horas» es un reloj:
     arranca a una hora y va sumando. «Con las comidas» no mira el reloj, mira
     tus franjas, así que si mueves el almuerzo la toma se mueve con él.

     Las de reloj se cortan en la cena y no siguen toda la noche: nadie quiere
     que le suene el magnesio a las tres de la mañana por haber puesto «cada
     seis horas». */
  const PATRONES = [
    { id: 'cada:4', label: 'Cada 4 horas', de: 'reloj', horas: 4 },
    { id: 'cada:6', label: 'Cada 6 horas', de: 'reloj', horas: 6 },
    { id: 'cada:8', label: 'Cada 8 horas', de: 'reloj', horas: 8 },
    { id: 'cada:12', label: 'Cada 12 horas', de: 'reloj', horas: 12 },
    { id: 'antes:comidas', label: 'Antes de cada comida', de: 'comidas', desfase: -15 },
    { id: 'con:comidas', label: 'Con cada comida', de: 'comidas', desfase: 0 },
    { id: 'tras:comidas', label: 'Después de cada comida', de: 'comidas', desfase: 30 }
  ];

  function patronDe(id) {
    return PATRONES.filter(function (x) { return x.id === id; })[0] || PATRONES[2];
  }

  /* ---------- en qué momento ----------
     Lo que se guarda es el momento, no la hora: así una sola cosa manda sobre
     las dos. La hora se resuelve al preguntarla. */
  const MOMENTOS = [
    { id: 'con:desayuno', label: 'Con el desayuno', corto: 'Desayuno', de: 'franja' },
    { id: 'con:almuerzo', label: 'Con el almuerzo', corto: 'Almuerzo', de: 'franja' },
    { id: 'con:merienda', label: 'Con la merienda', corto: 'Merienda', de: 'franja' },
    { id: 'con:cena', label: 'Con la cena', corto: 'Cena', de: 'franja' },
    { id: 'antes:entreno', label: 'Antes de entrenar', corto: 'Pre-entreno',
      de: 'entreno', desfase: -30 },
    { id: 'tras:entreno', label: 'Después de entrenar', corto: 'Post-entreno',
      de: 'entreno', desfase: 60 },
    { id: 'fija', label: 'A una hora puntual', corto: 'Hora puntual', de: 'fija' }
  ];

  function momentoDe(id) {
    return MOMENTOS.filter(function (m) { return m.id === id; })[0] || MOMENTOS[0];
  }

  function delCatalogo(id) {
    return CATALOGO.filter(function (x) { return x.id === id; })[0] || null;
  }

  /* ---------- la hora de verdad ----------
     Aquí es donde esto se cruza con el resto: «con el desayuno» pregunta a las
     franjas de Alimentación, y «antes de entrenar» a la hora a la que entrenas
     de verdad, que la app ya calcula de tu historial. Guardar la hora a mano
     habría obligado a repasar los suplementos cada vez que se mueve una
     comida, y nadie lo haría. */
  function horaDe(s) {
    const m = momentoDe(s.momento);

    if (m.de === 'fija') return s.hora || '08:00';

    if (m.de === 'franja') {
      const cual = s.momento.split(':')[1];
      const f = (g.Perfil && Perfil.franjas ? Perfil.franjas() : [])
        .filter(function (x) { return x.id === cual; })[0];
      return (f && f.desde) || '08:00';
    }

    /* Antes o después de entrenar: se parte de la hora habitual y se desplaza.
       Media hora antes para lo que hay que notar entrenando; una hora después
       para lo que va con la comida de recuperación. */
    const base = (g.Alertas && Alertas.horaHabitualDeEntreno)
      ? Alertas.horaHabitualDeEntreno() : '18:00';
    if (!g.Alertas || !Alertas.enMinutos) return base;
    return Alertas.aHora(Alertas.enMinutos(base) + (m.desfase || 0));
  }

  /* ---------- todas las horas de un suplemento ----------
     Dejó de poder ser una sola en cuanto entró «varias veces al día», y media
     app preguntaba por la hora en singular. Se devuelve siempre una lista: con
     una toma trae un elemento, y así nadie tiene que saber de qué caso es. */
  function horasDe(s) {
    if (s.frecuencia !== 'varias') return [horaDe(s)];

    const p = patronDe(s.patron);
    const min = function (h) { return g.Alertas ? Alertas.enMinutos(h) : 0; };
    const txt = function (m) { return g.Alertas ? Alertas.aHora(m) : '08:00'; };

    if (p.de === 'comidas') {
      return (g.Perfil && Perfil.franjas ? Perfil.franjas() : [])
        .map(function (f) { return txt(min(f.desde) + (p.desfase || 0)); });
    }

    /* De reloj: desde donde arranque hasta la cena, sin pasarse a la noche. */
    const franjas = g.Perfil && Perfil.franjas ? Perfil.franjas() : [];
    const arranque = min(s.hora || (franjas[0] && franjas[0].desde) || '08:00');
    const ultima = franjas.length ? min(franjas[franjas.length - 1].desde) + 60
      : 22 * 60;
    const paso = (p.horas || 8) * 60;
    const out = [];
    for (let m = arranque; m <= ultima && out.length < 12; m += paso) out.push(txt(m));
    return out.length ? out : [txt(arranque)];
  }

  function etiquetaMomento(s) {
    if (s.frecuencia === 'varias') return patronDe(s.patron).label;
    const m = momentoDe(s.momento);
    return m.id === 'fija' ? 'A las ' + (g.UI && UI.hora ? UI.hora(horaDe(s)) : horaDe(s))
      : m.label;
  }

  /* ---------- guardado ---------- */

  function lista() {
    return (Store.settings().suplementos || []).map(function (s) {
      return Object.assign({ frecuencia: 'diario', momento: 'con:desayuno', dosis: '' }, s);
    });
  }

  function guardarLista(arr) { Store.setSetting('suplementos', arr); }

  function nuevo(base) {
    return Object.assign({
      id: 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nombre: '', dosis: '', frecuencia: 'diario', momento: 'con:desayuno',
      hora: '08:00', dia: 1, nota: '', aporta: null
    }, base || {});
  }

  function guardar(s) {
    const arr = lista();
    const i = arr.findIndex(function (x) { return x.id === s.id; });
    if (i === -1) arr.push(s); else arr[i] = s;
    guardarLista(arr);
    return s;
  }

  function borrar(id) {
    guardarLista(lista().filter(function (x) { return x.id !== id; }));
  }

  /* ---------- qué toca hoy ----------
     «Un día sí y otro no» se cuenta sobre los días transcurridos desde una
     fecha fija, no desde que abriste la app: así el mismo día da siempre la
     misma respuesta, la mires cuando la mires, y dos móviles distintos
     coinciden. */
  const DIA = 864e5;

  function diaAbsoluto(cuando) {
    const d = cuando ? new Date(cuando) : new Date();
    return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / DIA);
  }

  function tocaHoy(s, cuando) {
    if (s.frecuencia === 'diario') return true;

    if (s.frecuencia === 'semanal') {
      const d = cuando ? new Date(cuando) : new Date();
      return d.getDay() === (Number(s.dia) || 1);
    }

    if (s.frecuencia === 'alterno') return diaAbsoluto(cuando) % 2 === 0;

    if (s.frecuencia === 'entreno') {
      if (!g.App || !App.rutinasDeHoy) return true;
      return (App.rutinasDeHoy() || []).length > 0;
    }
    return true;
  }

  function tomasDeHoy() {
    const out = [];
    lista().filter(tocaHoy).forEach(function (s) {
      horasDe(s).forEach(function (h) { out.push({ sup: s, hora: h }); });
    });
    return out.sort(function (a, b) {
      return (g.Alertas ? Alertas.enMinutos(a.hora) - Alertas.enMinutos(b.hora) : 0);
    });
  }

  /* ---------- lo que suman al día ----------
     Solo los que aportan de verdad. Sin esto, el menú te pide la proteína
     entera en comida y acabas pasándote todos los días por el batido que no
     contaba nadie. */
  function aportaDiario() {
    let kcal = 0, prot = 0;
    lista().forEach(function (s) {
      if (!s.aporta || !tocaHoy(s)) return;
      /* Por toma, no por bote: dos batidos al día son el doble de proteína, y
         contarlo una vez dejaba la mitad sin descontar del menú. */
      const veces = horasDe(s).length;
      kcal += (Number(s.aporta.kcal) || 0) * veces;
      prot += (Number(s.aporta.prot) || 0) * veces;
    });
    return { kcal: Math.round(kcal), prot: Math.round(prot) };
  }

  /* ---------- lo que se le cuenta a la IA ----------
     En una línea por suplemento, con lo que cambia una decisión: qué es, cuánto
     y cuándo. La IA no necesita el identificador ni la nota privada. */
  function resumenIA() {
    const l = lista();
    if (!l.length) return '';
    const frec = function (s) {
      const f = FRECUENCIAS.filter(function (x) { return x.id === s.frecuencia; })[0];
      return f ? f.label.toLowerCase() : 'todos los días';
    };
    return l.map(function (s) {
      const hs = horasDe(s);
      const veces = hs.length;
      return '- ' + s.nombre + (s.dosis ? ', ' + s.dosis : '') +
        ', ' + frec(s) + ', ' + etiquetaMomento(s).toLowerCase() +
        ' (sobre las ' + hs.join(', ') + ')' +
        (s.aporta ? ' [aporta ~' + (s.aporta.kcal * veces) + ' kcal y ' +
          (s.aporta.prot * veces) + ' g de proteína al día]' : '');
    }).join('\n');
  }

  /* ---------- los recordatorios ----------
     Se generan desde aquí y no se escriben a mano: el nombre, la dosis y la
     hora ya están, y pedirlos otra vez en el formulario de alertas es pedir lo
     mismo dos veces y que un día dejen de coincidir.

     Se reconocen por el campo `sup`, que lleva el identificador del suplemento:
     así se pueden rehacer sin tocar los recordatorios que hayas creado tú. */
  function alertasDe() {
    const porHora = {};
    lista().forEach(function (s) {
      /* Varios a la misma hora van en un solo aviso. Tres notificaciones
         seguidas a las ocho para tres botes que están en el mismo cajón es
         ruido, y el ruido se acaba silenciando entero. */
      horasDe(s).forEach(function (h) {
        if (!porHora[h]) porHora[h] = [];
        if (porHora[h].indexOf(s) === -1) porHora[h].push(s);
      });
    });

    return Object.keys(porHora).map(function (h) {
      const grupo = porHora[h];
      const dias = diasDe(grupo);
      if (!dias.length) return null;

      const que = grupo.map(function (s) {
        return s.nombre + (s.dosis ? ' (' + s.dosis + ')' : '');
      });

      return {
        id: 'sup:' + h.replace(':', ''),
        sup: grupo.map(function (s) { return s.id; }).join(','),
        tipo: 'suplemento',
        titulo: grupo.length === 1 ? grupo[0].nombre : 'Tus suplementos',
        mensaje: que.join(' · '),
        horas: [h],
        dias: dias,
        activa: true,
        ultima: {}
      };
    }).filter(Boolean);
  }

  /* Qué días de la semana aplica un grupo. Si conviven frecuencias distintas a
     la misma hora, manda la más amplia: es mejor que suene un día de más y lo
     saltes que perder la toma del que sí tocaba. */
  function diasDe(grupo) {
    let todos = false;
    const dias = {};

    grupo.forEach(function (s) {
      /* Alterno cae en cualquier día de la semana, así que el aviso tiene que
         existir los siete; el que decide si hoy toca es tocaHoy(). */
      if (s.frecuencia === 'diario' || s.frecuencia === 'alterno' ||
        s.frecuencia === 'varias') { todos = true; return; }
      if (s.frecuencia === 'semanal') { dias[Number(s.dia) || 1] = 1; return; }
      if (s.frecuencia === 'entreno') {
        diasDeEntreno().forEach(function (d) { dias[d] = 1; });
      }
    });

    if (todos) return [0, 1, 2, 3, 4, 5, 6];
    return Object.keys(dias).map(Number).sort(function (a, b) { return a - b; });
  }

  /* Los días con rutina asignada, en el 0-6 que usan las alertas */
  function diasDeEntreno() {
    const CORTO = { Dom: 0, Lun: 1, Mar: 2, 'Mié': 3, Jue: 4, Vie: 5, 'Sáb': 6 };
    const out = [];
    Store.routines().forEach(function (r) {
      (r.days || []).forEach(function (d) {
        const n = CORTO[d];
        if (n != null && out.indexOf(n) === -1) out.push(n);
      });
    });
    return out.length ? out : [1, 3, 5];
  }

  /* Deja los recordatorios de suplementos igual que la lista de suplementos, y
     no toca los demás. Devuelve cuántos han quedado. */
  function sincronizarAlertas() {
    const otras = (Store.settings().alertas || []).filter(function (a) { return !a.sup; });
    const nuevas = alertasDe();
    Store.setSetting('alertas', otras.concat(nuevas));
    return nuevas.length;
  }

  function hayAlertas() {
    return (Store.settings().alertas || []).some(function (a) { return !!a.sup; });
  }

  /* ¿Lo que hay creado sigue coincidiendo con los suplementos y sus horas? */
  function alertasDesfasadas() {
    if (!lista().length) return false;
    const actuales = (Store.settings().alertas || []).filter(function (a) { return !!a.sup; });
    const deberian = alertasDe();
    if (actuales.length !== deberian.length) return true;
    const clave = function (a) {
      return a.id + '|' + a.mensaje + '|' + (a.horas || []).join(',') +
        '|' + (a.dias || []).slice().sort().join('');
    };
    return actuales.map(clave).sort().join(';') !== deberian.map(clave).sort().join(';');
  }

  g.Suplementos = {
    CATALOGO: CATALOGO, FRECUENCIAS: FRECUENCIAS, MOMENTOS: MOMENTOS,
    delCatalogo: delCatalogo, momentoDe: momentoDe,
    lista: lista, nuevo: nuevo, guardar: guardar, borrar: borrar,
    horaDe: horaDe, horasDe: horasDe, etiquetaMomento: etiquetaMomento,
    PATRONES: PATRONES, patronDe: patronDe,
    tocaHoy: tocaHoy, tomasDeHoy: tomasDeHoy, aportaDiario: aportaDiario,
    resumenIA: resumenIA, alertasDe: alertasDe,
    sincronizarAlertas: sincronizarAlertas, hayAlertas: hayAlertas,
    alertasDesfasadas: alertasDesfasadas, diasDeEntreno: diasDeEntreno
  };
})(window);
