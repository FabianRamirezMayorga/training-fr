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
  /* ---------- en qué viene cada cosa ----------
     La forma no es decoración: decide el icono de la ficha y, sobre todo, en
     qué unidad se mide. Un polvo se mide en gramos o en cazos y una cápsula en
     cápsulas, y ofrecer «gramos» para el omega 3 es pedirle a alguien que pese
     una perla de aceite. */
  const FORMAS = {
    polvo: { icono: 'polvo', unidad: 'g' },
    capsula: { icono: 'capsula', unidad: 'capsula' },
    comprimido: { icono: 'comprimido', unidad: 'comprimido' },
    liquido: { icono: 'gota', unidad: 'ml' }
  };

  /* Las unidades, en el orden en que la gente las mide. `paso` es lo que suma
     el más y el menos: un gramo de gramo en gramo y cinco mililitros de golpe,
     que nadie ajusta un jarabe de uno en uno. */
  /* `sing` y `plur` son como se escribe en la lista de suplementos —«5 g»— y
     `lista` como se llama al elegirla, que ahí «G» no es una palabra. */
  const UNIDADES = [
    { id: 'capsula', sing: 'cápsula', plur: 'cápsulas', lista: 'Cápsulas', paso: 1 },
    { id: 'comprimido', sing: 'comprimido', plur: 'comprimidos',
      lista: 'Comprimidos o pastillas', paso: 1 },
    { id: 'cazo', sing: 'cazo', plur: 'cazos', lista: 'Cazos o scoops', paso: 1 },
    { id: 'g', sing: 'g', plur: 'g', lista: 'Gramos', paso: 1 },
    { id: 'ml', sing: 'ml', plur: 'ml', lista: 'Mililitros', paso: 5 },
    { id: 'gota', sing: 'gota', plur: 'gotas', lista: 'Gotas', paso: 1 },
    { id: 'sobre', sing: 'sobre', plur: 'sobres', lista: 'Sobres', paso: 1 },
    { id: 'toma', sing: 'toma', plur: 'tomas', lista: 'Tomas', paso: 1 }
  ];

  function unidadDe(id) {
    return UNIDADES.filter(function (u) { return u.id === id; })[0] || UNIDADES[7];
  }

  /* «2 cápsulas», «5 g», «1 cazo». El texto se compone aquí y no se escribe a
     mano: así la lista de suplementos y los avisos dicen lo mismo, y el plural
     nunca se queda cojo. */
  function textoDosis(n, unidad) {
    const u = unidadDe(unidad);
    const cant = Number(n) || 0;
    if (!cant) return '';
    const num = String(Math.round(cant * 10) / 10).replace('.', ',');
    return num + ' ' + (cant === 1 ? u.sing : u.plur);
  }

  const CATALOGO = [
    { id: 'creatina', nombre: 'Creatina', forma: 'polvo',
      dosisN: 5, dosisU: 'g', momento: 'con:desayuno' },
    { id: 'proteina', nombre: 'Proteína en polvo', forma: 'polvo',
      dosisN: 1, dosisU: 'cazo', momento: 'tras:entreno', aporta: { kcal: 120, prot: 24 } },
    { id: 'omega3', nombre: 'Omega 3', forma: 'capsula',
      dosisN: 1, dosisU: 'capsula', momento: 'con:almuerzo' },
    { id: 'multi', nombre: 'Multivitamínico', forma: 'comprimido',
      dosisN: 1, dosisU: 'comprimido', momento: 'con:desayuno' },
    { id: 'vitd', nombre: 'Vitamina D', forma: 'capsula',
      dosisN: 1, dosisU: 'capsula', momento: 'con:almuerzo' },
    { id: 'magnesio', nombre: 'Magnesio', forma: 'comprimido',
      dosisN: 1, dosisU: 'comprimido', momento: 'con:cena' },
    { id: 'cafeina', nombre: 'Pre-entreno', forma: 'polvo',
      dosisN: 1, dosisU: 'toma', momento: 'antes:entreno' },
    { id: 'colageno', nombre: 'Colágeno', forma: 'polvo',
      dosisN: 10, dosisU: 'g', momento: 'con:desayuno', aporta: { kcal: 36, prot: 9 } },
    { id: 'aminos', nombre: 'Aminoácidos', forma: 'polvo',
      dosisN: 1, dosisU: 'cazo', momento: 'antes:entreno' },
    { id: 'glutamina', nombre: 'Glutamina', forma: 'polvo',
      dosisN: 5, dosisU: 'g', momento: 'con:cena' },
    { id: 'zinc', nombre: 'Zinc', forma: 'comprimido',
      dosisN: 1, dosisU: 'comprimido', momento: 'con:cena' },
    { id: 'probiotico', nombre: 'Probiótico', forma: 'capsula',
      dosisN: 1, dosisU: 'capsula', momento: 'con:desayuno' },
    { id: 'otro', nombre: 'Otro', forma: 'polvo',
      dosisN: 1, dosisU: 'toma', momento: 'con:desayuno' }
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
    { id: 'tras:comidas', label: 'Después de cada comida', de: 'comidas', desfase: 30 },
    /* Y el que no entra en ningún patrón. Hay pautas que no son «cada tantas
       horas» ni van con las comidas —las que manda una receta, o las de quien
       trabaja a turnos—, y sin esto había que forzarlas a la opción más
       parecida y luego vivir con un aviso a deshora. */
    { id: 'manual', label: 'Las pongo yo', de: 'manual' }
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

    if (p.de === 'manual') {
      const hs = (s.horasManuales || []).filter(Boolean);
      return hs.length ? hs.slice().sort() : ['08:00'];
    }
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
    if (s.frecuencia === 'varias') {
      const p = patronDe(s.patron);
      /* A mano, la etiqueta son las horas: «las pongo yo» no dice ninguna. */
      if (p.de === 'manual') {
        return horasDe(s).map(function (h) {
          return g.UI && UI.hora ? UI.hora(h) : h;
        }).join(', ');
      }
      return p.label;
    }
    const m = momentoDe(s.momento);
    return m.id === 'fija' ? 'A las ' + (g.UI && UI.hora ? UI.hora(horaDe(s)) : horaDe(s))
      : m.label;
  }

  /* ---------- guardado ---------- */

  function lista() {
    return (Store.settings().suplementos || []).map(function (s) {
      const x = Object.assign({ frecuencia: 'diario', momento: 'con:desayuno',
        dosis: '', forma: 'polvo' }, s);
      /* La dosis se guardaba como texto libre y ahora son número y unidad. Lo
         que se apuntó antes sigue valiendo tal cual: se enseña el texto viejo
         hasta que se toque la ficha, en vez de intentar adivinar qué quiso
         decir «1 cazo (30 g)». */
      if (x.dosisN && x.dosisU) x.dosis = textoDosis(x.dosisN, x.dosisU);
      return x;
    });
  }

  function guardarLista(arr) { Store.setSetting('suplementos', arr); }

  function nuevo(base) {
    return Object.assign({
      id: 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nombre: '', dosis: '', dosisN: 1, dosisU: 'toma', forma: 'polvo',
      frecuencia: 'diario', momento: 'con:desayuno',
      hora: '08:00', dia: 1, nota: '', aporta: null,
      patron: '', horasManuales: []
    }, base || {});
  }

  /* Cambiar la hora de algo que ya tiene aviso lo mueve con él. Solo si ya lo
     tenía: crear avisos a quien no los ha pedido es otra cosa, y para eso está
     el botón de abajo. */
  function guardar(s) {
    const arr = lista();
    const i = arr.findIndex(function (x) { return x.id === s.id; });
    if (i === -1) arr.push(s); else arr[i] = s;
    guardarLista(arr);
    if (tieneAlerta(s.id)) sincronizarAlertas();
    return s;
  }

  /* ---------- quitar un bote se lleva su aviso ----------
     Antes no: la alerta se quedaba sonando a las diez para algo que ya no
     tomas, y el propio mensaje de confirmación tenía que avisar de que eso iba
     a pasar. Un aviso que te manda tomar lo que has dejado de tomar es peor que
     no tener aviso: te enseña a ignorarlos.

     Se rehacen todas las de suplementos en vez de buscar la suya, porque una
     alerta puede llevar dos botes: quitar uno de los dos no borra la alerta,
     la deja con el que queda. */
  function borrar(id) {
    guardarLista(lista().filter(function (x) { return x.id !== id; }));
    if (hayAlertas()) sincronizarAlertas();
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

  /* Aquí llegó a haber un registro de tomas —marcar cada una como hecha— y se
     ha quitado: esta pantalla es para acordarse de lo que hay que tomar, no un
     diario de cumplimiento. Apuntar seis veces al día que sí te tomaste algo es
     trabajo que nadie hace más de una semana, y una lista de casillas sin
     marcar acaba siendo un reproche.

     Se borra lo que se llegara a guardar, para no dejar un ajuste muerto
     viajando en cada copia de seguridad. */
  (function () {
    try {
      if (Store.settings().supTomas) Store.setSetting('supTomas', null);
    } catch (e) { /* si no se puede, tampoco pasa nada */ }
  })();

  /* ---------- lo que suman al día ----------
     Sumar a mano las fichas del catálogo estaba mal por dos sitios: no contaba
     lo que uno escribe a mano —la mitad de los botes de cualquier casa— y no
     decía nada de micronutrientes, que es justo para lo que se toma un
     multivitamínico. Un número incompleto presentado como total es peor que
     ninguno, así que la cuenta buena la hace el entrenador y esta se queda de
     reserva para cuando no hay IA.

     Se guarda con la huella de lo que se analizó: si cambias un bote, lo
     anterior deja de valer y hay que volver a preguntarlo. */
  function analisis() {
    const a = Store.settings().supAnalisis;
    if (!a || a.huella !== resumenIA()) return null;
    return a;
  }

  function guardarAnalisis(a) { Store.setSetting('supAnalisis', a); }

  function aportaDiario() {
    const a = analisis();
    if (a) return { kcal: a.kcal, prot: a.prot, deIA: true };

    let kcal = 0, prot = 0;
    lista().forEach(function (s) {
      if (!s.aporta || !tocaHoy(s)) return;
      /* Por toma, no por bote: dos batidos al día son el doble de proteína, y
         contarlo una vez dejaba la mitad sin descontar del menú. */
      const veces = horasDe(s).length;
      kcal += (Number(s.aporta.kcal) || 0) * veces;
      prot += (Number(s.aporta.prot) || 0) * veces;
    });
    return { kcal: Math.round(kcal), prot: Math.round(prot), deIA: false };
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

    /* ---------- y una alerta por BOTE, no por hora ----------
       Agrupar solo por hora dejaba el magnesio de las 10:00 y el de las 14:00
       como dos alertas distintas que decían lo mismo: en la lista salía
       «Magnesio» dos veces y había que leer la hora para distinguirlas, cuando
       lo que hay es una cosa que se toma dos veces.

       Ahora se juntan las horas que llevan EXACTAMENTE los mismos botes, que es
       lo que conserva las dos cosas a la vez: el magnesio de las diez y el de
       las dos son una sola alerta con dos horas, y si a las diez además toca la
       creatina, esa hora se va a su propia alerta en vez de sonar dos veces
       seguidas. */
    const porFirma = {};
    Object.keys(porHora).forEach(function (h) {
      const firma = porHora[h].map(function (s) { return s.id; }).sort().join(',');
      if (!porFirma[firma]) porFirma[firma] = { grupo: porHora[h], horas: [] };
      porFirma[firma].horas.push(h);
    });

    return Object.keys(porFirma).map(function (firma) {
      const grupo = porFirma[firma].grupo;
      const horas = porFirma[firma].horas.slice().sort();
      const dias = diasDe(grupo);
      if (!dias.length) return null;

      const que = grupo.map(function (s) {
        return s.nombre + (s.dosis ? ' (' + s.dosis + ')' : '');
      });

      return {
        /* El id sale de los botes y no de la hora: así cambiar la hora de una
           toma actualiza la alerta que ya había en vez de dejar la vieja. Sin
           comas: este id acaba siendo el UID de los eventos del calendario, y
           ahí la coma es el separador de valores del formato. */
        id: 'sup:' + firma.replace(/[^A-Za-z0-9]+/g, '-'),
        sup: firma,
        tipo: 'suplemento',
        titulo: grupo.length === 1 ? grupo[0].nombre : 'Tus suplementos',
        mensaje: que.join(' · '),
        horas: horas,
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
  /* ¿Este bote concreto ya tiene aviso creado? */
  function tieneAlerta(id) {
    return (Store.settings().alertas || []).some(function (a) {
      /* `sup` lleva los ids separados por comas; el id de la alerta lleva
         guiones porque acaba siendo el UID del calendario. Aqui se mira el
         campo, no el id. */
      return a.sup && String(a.sup).split(',').indexOf(String(id)) !== -1;
    });
  }

  function sincronizarAlertas() {
    const todas = Store.settings().alertas || [];
    const otras = todas.filter(function (a) { return !a.sup; });

    /* Rehacerlas de cero las devolvía encendidas y con el día limpio: si habías
       apagado la del magnesio, volvía sola, y lo que ya había sonado hoy sonaba
       otra vez. Se rehace el contenido —nombres, dosis, horas, días— y se
       conserva lo que es decisión tuya o historia del día. */
    const antes = {};
    todas.forEach(function (a) { if (a.sup) antes[a.id] = a; });

    const nuevas = alertasDe().map(function (n) {
      const v = antes[n.id];
      if (v) {
        n.activa = v.activa !== false;
        n.ultima = v.ultima || {};
      }
      return n;
    });

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
    FORMAS: FORMAS, UNIDADES: UNIDADES, unidadDe: unidadDe, textoDosis: textoDosis,
    lista: lista, nuevo: nuevo, guardar: guardar, borrar: borrar,
    horaDe: horaDe, horasDe: horasDe, etiquetaMomento: etiquetaMomento,
    PATRONES: PATRONES, patronDe: patronDe,
    tocaHoy: tocaHoy, tomasDeHoy: tomasDeHoy, aportaDiario: aportaDiario,
    analisis: analisis, guardarAnalisis: guardarAnalisis,
    resumenIA: resumenIA, alertasDe: alertasDe,
    sincronizarAlertas: sincronizarAlertas, hayAlertas: hayAlertas,
    alertasDesfasadas: alertasDesfasadas, diasDeEntreno: diasDeEntreno
  };
})(window);
