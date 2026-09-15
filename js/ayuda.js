/* ayuda.js — el manual, dentro de la app.

   La app sabe hacer muchas cosas que nadie adivina: de dónde sale el peso que
   aparece puesto en la casilla, por qué el plan saca un 6, por qué una foto se
   cruza con el desayuno y otra no, por qué un ejercicio «no existe» al
   buscarlo. Todo eso estaba en la cabeza de quien la construyó y en ningún
   sitio más.

   Dos decisiones que explican cómo está escrito esto:

   Se cuenta por CONCEPTOS, no por pantallas. «Cómo decide la app tu peso de
   hoy» envejece despacio; «pulsa el tercer icono de arriba» envejece en el
   siguiente rediseño, y un manual que miente en un sitio hace dudar de todos
   los demás.

   Y se escribe a mano, sin IA. Quien abre la ayuda ya está perdido: es el peor
   momento posible para que le conteste algo que puede inventarse una función
   que no existe. Además así funciona sin cobertura, que es justo donde estás
   cuando no sabes qué hacer: en el gimnasio. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  /* Como render() repinta la pantalla entera, lo que está desplegado y la
     pestaña elegida no pueden vivir en el DOM: se irían en cada repintado. */
  let pestana = 'guia';
  let busqueda = '';
  const abiertos = {};

  /* Negritas sin meter HTML en el contenido: se escapa todo y luego se
     convierte *lo que va entre asteriscos*. Escribir <b> a mano en cada
     párrafo invita a que un día se cuele una etiqueta sin cerrar. */
  function fmt(s) {
    return esc(s).replace(/\*([^*]+)\*/g, '<b>$1</b>');
  }

  /* ================= qué hace la app ================= */

  const TEMAS = [
    { id: 'entrenar', icono: 'play', tono: 'var(--acc)',
      titulo: 'Cómo se entrena',
      resumen: 'Siguiendo una rutina o apuntando sobre la marcha',
      cuerpo: [
        'Hay dos maneras y las dos valen igual. *Seguir una rutina*: la app te lleva serie a serie, con el peso ya puesto, las repeticiones y el descanso contado. *Entrenamiento libre*: empiezas con la hoja en blanco y vas añadiendo lo que haces.',
        'Lo que apuntas cuenta lo mismo en los dos casos: historial, récords, volumen, reparto por zona. El libre no es un modo de segunda.',
        'En la portada, si ya has entrenado hoy, la app te lo dice y te deja solo el libre: ofrecerte empezar otra vez lo que ya has hecho no tiene sentido.'
      ],
      ir: { ruta: 'inicio', label: 'Ir a Inicio' } },

    { id: 'plan', icono: 'flag', tono: '#f0a23c',
      titulo: 'El plan y los días',
      resumen: 'Por qué asignar días no es cosmético',
      cuerpo: [
        'Una *rutina* es una lista de ejercicios. Un *plan* es esa lista con días de la semana puestos.',
        'Poner los días cambia lo que la app puede saber de ti: cuántas series por semana haces de cada zona, qué te toca hoy en la portada, si el reparto está equilibrado y qué nota saca tu plan. Sin días asignados no hay una semana que contar, y media app se queda muda.',
        'Se ponen en Rutinas: toca la rutina para desplegarla y verás *Qué días la hago*. Si el viernes quieres pecho en vez de pierna, quita el viernes de una y pónselo a la otra.'
      ],
      ir: { ruta: 'rutinas', label: 'Ver mis rutinas' } },

    { id: 'auditoria', icono: 'check', tono: '#4f8cf5',
      titulo: 'La nota de tu plan',
      resumen: 'De dónde sale y por qué no la pone una IA',
      cuerpo: [
        'La auditoría son *reglas fijas*, no una opinión. Se comprueba el volumen de cada músculo, los patrones de movimiento que faltan, si hay dos básicos pesados el mismo día, el orden dentro de la sesión, los descansos, el material que de verdad tienes y las limitaciones que hayas dicho.',
        'También mira si un ejercicio está en el día equivocado: un movimiento pesado de tren inferior entre los tres primeros de un día de empuje se lleva la fuerza que necesitabas para el press.',
        'Se parte de un 10 y cada fallo resta según lo gordo que sea. Un 6 no es un suspenso: es una lista de cosas concretas, y casi todas vienen con el arreglo hecho para aplicarlo de una vez.',
        'Es con reglas y no con IA a propósito: una regla da siempre la misma respuesta y funciona en el gimnasio sin cobertura.'
      ],
      ir: { ruta: 'rutinas', label: 'Ver mis rutinas' } },

    { id: 'progresion', icono: 'up', tono: 'var(--acc)',
      titulo: 'El peso que aparece puesto',
      resumen: 'Por qué a veces no es el de la última vez',
      cuerpo: [
        'Antes la app dejaba puesto el peso de la última vez. Eso no es progresar, es repetir.',
        'Ahora lo decide con lo que ya tienes apuntado. Si la última vez *sacaste todas las series* con las repeticiones pedidas, sube. Si *te quedaste corto*, repite peso hasta sacarlo entero. Si llevas *tres sesiones seguidas* sin sacarlo al mismo peso, baja un 10 % para cogerle la técnica y volver a subir.',
        'El salto es el de cada material, no un número inventado: 2,5 kg en barra, máquina y polea; 2 en mancuernas; 4 en kettlebell. En libras, de cinco en cinco. Pedirte 2,5 kg en mancuernas sería pedirte un peso que no existe en la sala.',
        'Con peso corporal o bandas no dice nada: ahí se progresa en repeticiones y eso ya lo lleva la propia rutina. Y el número siempre se puede cambiar: es una propuesta, no una orden.'
      ],
      ir: { ruta: 'rutinas', label: 'Ver mis rutinas' } },

    { id: 'reparto', icono: 'grafica', tono: '#c06bf0',
      titulo: 'Reparto por zona',
      resumen: 'Lo que haces de verdad frente a lo que pide tu plan',
      cuerpo: [
        'En Progreso ves, zona por zona, las series por semana que haces y una marca con lo que pide tu plan.',
        'La app avisa también por exceso, no solo por defecto. Si una zona pasa de *veinte series por semana* y además no está subiendo peso, te lo dice: por encima de ahí lo que se añade es fatiga, no músculo. Si pasa de veinte pero sí estás subiendo, te lo dice en verde y no hay nada que corregir.',
        'No se mide contra tu plan, se mide contra lo que sirve para crecer. Tu plan puede estar mal escrito, y entonces el que está mal es el plan.'
      ],
      ir: { ruta: 'progreso', label: 'Ver mi progreso' } },

    { id: 'comida', icono: 'nutricion', tono: '#2fc4b2',
      titulo: 'La comida y el cruce de fotos',
      resumen: 'Menú, franjas horarias y qué comiste de verdad',
      cuerpo: [
        'Tus calorías y tu proteína salen de tus datos: peso, altura, edad, actividad y objetivo.',
        'El día está partido en cuatro franjas —desayuno, almuerzo, merienda y cena— y *las horas las pones tú*, porque la hora a la que desayuna cada uno no es la misma.',
        'Cuando subes una foto dentro de la franja del desayuno, la app la cruza con el desayuno de tu menú: te dice si comiste lo previsto o algo distinto, y cuánta proteína o cuántas calorías te has dejado o te has pasado.',
        'Si subiste fotos antes de tener menú, no se pierden: la app te ofrece cruzarlas después con lo que ya está apuntado.'
      ],
      ir: { ruta: 'nutricion', label: 'Ir a Alimentación' } },

    { id: 'lugar', icono: 'casa', tono: '#e0679a',
      titulo: 'Dónde entrenas',
      resumen: 'Por qué a veces un ejercicio no aparece',
      cuerpo: [
        'Lo que elijas —gimnasio, casa con mancuernas, solo bandas, peso corporal— filtra el catálogo entero.',
        'Es la causa más habitual de que un ejercicio «no exista»: está, pero lo tienes fuera porque necesita material que has dicho que no tienes. En el buscador puedes quitar el filtro y verlo todo.',
        'Se cambia desde el botón del sitio, arriba a la derecha en cualquier pantalla, o en Perfil › Dónde entrenas.'
      ],
      ir: { ruta: 'ejercicios', label: 'Ir a Ejercicios' } },

    { id: 'datos', icono: 'nube', tono: '#4f8cf5',
      titulo: 'Dónde están tus datos',
      resumen: 'En tu móvil, y en la nube solo si tú quieres',
      cuerpo: [
        'Todo se guarda en el propio móvil. Sin cuenta la app funciona entera y nada sale de ahí.',
        'Si creas una cuenta, tus datos se copian a la nube y vuelven al entrar desde otro móvil. Es lo que te cubre si pierdes el teléfono o borras la app.',
        'De las dos maneras puedes bajarte una copia en un archivo desde Ajustes › Copia de seguridad, y volver a cargarla cuando quieras.'
      ],
      ir: { ruta: 'cuenta', label: 'Ver mi cuenta' } },

    { id: 'ia', icono: 'chispa', tono: 'var(--acc)',
      titulo: 'El entrenador con IA',
      resumen: 'Opcional, con tu clave, y nunca donde debe haber una regla',
      cuerpo: [
        'Es la parte opcional. Sirve para lo que de verdad es una opinión: montarte un programa, proponerte un menú, contestarte una duda, leerte una foto de comida.',
        'Funciona con tu propia clave, que guardas en la Bóveda de claves. La app no cobra nada; lo que gastes con tu clave se lo pagas a quien te la dio.',
        'Lo que es una regla no pasa por la IA: el peso de hoy, la nota del plan, el reparto por zona. Una regla tiene que dar siempre el mismo número y funcionar sin cobertura.'
      ],
      ir: { ruta: 'entrenador', label: 'Configurar el entrenador' } },

    { id: 'offline', icono: 'down', tono: '#39b8c9',
      titulo: 'Entrenar sin internet',
      resumen: 'Qué hay que bajar antes y qué no hace falta',
      cuerpo: [
        'La app entera funciona sin conexión: las rutinas, el cronómetro, apuntar series, el historial, las estadísticas. Todo.',
        'Lo único que conviene bajar antes son las *imágenes de los ejercicios*, porque pesan. Puedes bajar solo las de tus rutinas —lo más rápido—, las principales o el catálogo completo.',
        'Se hace desde Perfil › Versión y espacio, y te dice cuánto ocupa antes de empezar.'
      ],
      ir: { ruta: 'version', label: 'Ir a Versión y espacio' } }
  ];

  /* ================= preguntas frecuentes ================= */

  const PREGUNTAS = [
    { id: 'p-offline', q: '¿Funciona sin internet?',
      a: ['Sí, entera. Las rutinas, el entrenamiento, el cronómetro, el historial y las estadísticas no necesitan conexión.',
        'Solo necesitan internet tres cosas: el entrenador con IA, sincronizar con tu cuenta y descargar las imágenes de los ejercicios la primera vez.'],
      ir: { ruta: 'version', label: 'Descargar para usar sin conexión' } },

    { id: 'p-datos', q: '¿Dónde se guardan mis datos?',
      a: ['En tu propio móvil, en el almacenamiento del navegador. Sin cuenta, no salen de ahí.',
        'Si creas una cuenta, además se copian a la nube para que vuelvan al entrar desde otro dispositivo.'],
      ir: { ruta: 'cuenta', label: 'Ver mi cuenta' } },

    { id: 'p-perder', q: '¿Pierdo todo si cambio de móvil o borro la app?',
      a: ['Sin cuenta, sí: los datos viven en ese navegador y se van con él.',
        'Con cuenta, no: entras con tu correo en el móvil nuevo y vuelve todo.',
        'Y en cualquier caso puedes exportar un archivo con todo desde Ajustes › Copia de seguridad, e importarlo donde quieras.'],
      ir: { ruta: 'ajustes', label: 'Ir a Ajustes' } },

    { id: 'p-peso', q: '¿Por qué el peso que sale no es el que puse la última vez?',
      a: ['Porque la app decide el peso de hoy con tu historial, no repitiendo el último.',
        'Si la última vez sacaste todas las series completas, sube el salto que corresponda a ese material. Si te quedaste corto, repite. Si llevas tres sesiones seguidas sin sacarlo, baja un 10 %.',
        'Encima del ejercicio te dice cuál de los tres casos es y por qué. Y el número lo puedes cambiar siempre: es una propuesta.'] },

    { id: 'p-nota', q: '¿Por qué mi plan saca esa nota?',
      a: ['La nota parte de un 10 y baja por cada fallo encontrado, según su gravedad.',
        'Los fallos están listados uno a uno con lo que se ha medido: no es un número a secas. Casi todos traen un arreglo automático que puedes aplicar de una vez.',
        'Son reglas fijas, así que la misma rutina saca siempre la misma nota.'],
      ir: { ruta: 'rutinas', label: 'Ver mis rutinas' } },

    { id: 'p-ejercicio', q: '¿Por qué no encuentro un ejercicio que sé que existe?',
      a: ['Casi siempre es el material. Lo que hayas puesto en «Dónde entrenas» filtra el catálogo: si has dicho que entrenas en casa con bandas, el press de banca no aparece.',
        'En el buscador puedes quitar el filtro y ver el catálogo completo, o cambiar el sitio desde el botón de arriba a la derecha.'],
      ir: { ruta: 'ejercicios', label: 'Ir a Ejercicios' } },

    { id: 'p-foto', q: '¿Por qué mi foto no se cruzó con el menú?',
      a: ['Por una de tres: la hora de la foto cae fuera de todas las franjas, no tienes un menú activo para ese día, o las franjas horarias no están puestas a tus horas.',
        'Las horas de desayuno, almuerzo, merienda y cena las decides tú en Alimentación. Si desayunas a las seis, ponlo a las seis.',
        'Y lo que quedó sin cruzar se puede cruzar después: la app te lo ofrece con las fotos ya apuntadas.'],
      ir: { ruta: 'nutricion', label: 'Ir a Alimentación' } },

    { id: 'p-sinplan', q: '¿Puedo entrenar sin crear ningún plan?',
      a: ['Sí. El entrenamiento libre no necesita nada: abres, añades lo que vas haciendo y guardas.',
        'Cuenta igual para el historial, los récords y las estadísticas. Lo único que te pierdes sin plan es lo que se calcula sobre la semana: qué toca hoy, el reparto por zona y la auditoría.'],
      ir: { ruta: 'inicio', label: 'Ir a Inicio' } },

    { id: 'p-precio', q: '¿Cuánto cuesta la app?',
      a: ['Nada. No tiene suscripción, ni anuncios, ni compras.',
        'Lo único que puede costar dinero es el entrenador con IA, y porque funciona con tu propia clave: lo que gastes se lo pagas a quien te la dio, no a la app. Sin activarlo, todo lo demás funciona igual.'] },

    { id: 'p-actualiza', q: '¿Por qué me pide actualizar tan a menudo?',
      a: ['Porque la app se sigue construyendo y cada mejora se publica en cuanto está probada.',
        'La actualización pesa muy poco y no toca tus datos: rutinas, historial y perfil se quedan como están.',
        'Si algo se comporta raro justo después de actualizar, casi siempre es que el móvil se ha quedado con archivos de dos versiones mezclados. Para eso está «Forzar actualización».'],
      ir: { ruta: 'version', label: 'Ir a Versión y espacio' } },

    { id: 'p-kcal', q: '¿Las calorías que me da son exactas?',
      a: ['Son una estimación calculada con tus datos —peso, altura, edad, actividad y objetivo— con las fórmulas habituales.',
        'Sirven como punto de partida, no como verdad absoluta: dos personas con los mismos números gastan distinto. Lo que manda es cómo responde tu peso a lo largo de varias semanas; si no se mueve como esperabas, ajusta.'],
      ir: { ruta: 'nutricion', label: 'Ir a Alimentación' } },

    { id: 'p-libras', q: '¿Puedo usar libras en vez de kilos?',
      a: ['Sí, en Ajustes. Y no es solo cambiar la etiqueta: los saltos de peso que te propone la app también cambian, porque en libras el gimnasio va de cinco en cinco.'],
      ir: { ruta: 'ajustes', label: 'Ir a Ajustes' } }
  ];

  /* ================= cómo se hace ================= */

  const PASOS = [
    { id: 'c-instalar', icono: 'casa', tono: '#4f8cf5',
      titulo: 'Instalar la app en el móvil',
      pasos: [
        'Abre Training FR en el navegador del móvil.',
        'En Android, menú del navegador › *Añadir a la pantalla de inicio*. En iPhone, botón Compartir › *Añadir a pantalla de inicio*.',
        'A partir de ahí arranca a pantalla completa, con su icono, como cualquier otra app.',
        'En Ajustes también hay un botón de instalar, si tu navegador lo permite.'
      ],
      ir: { ruta: 'ajustes', label: 'Ir a Ajustes' } },

    { id: 'c-plan', icono: 'flag', tono: '#f0a23c',
      titulo: 'Crear un plan y ponerle días',
      pasos: [
        'Entra en *Rutinas*. *Crear la mía* si la montas tú; *Generar programa* si prefieres que la monte la app con tus datos y luego la editas.',
        'Añade los ejercicios y pon a cada uno sus series y sus repeticiones.',
        'Vuelve a la lista y toca la rutina para desplegarla.',
        'En *Qué días la hago*, toca los días de la semana en que la vas a hacer.',
        'Ya te sale en la portada el día que toca, y ya cuenta para las estadísticas y para la auditoría.'
      ],
      ir: { ruta: 'rutinas', label: 'Ir a Rutinas' } },

    { id: 'c-entrenar', icono: 'play', tono: 'var(--acc)',
      titulo: 'Entrenar hoy',
      pasos: [
        'En Inicio, el botón grande arranca lo que te toca hoy según tu plan.',
        'Ve marcando cada serie según la haces. El descanso se cuenta solo.',
        'Si cambias el peso o las repeticiones, escríbelo tal cual: de ahí sale la propuesta de la próxima vez.',
        'Al terminar, guarda. Se suma al historial, a los récords y a las estadísticas.'
      ],
      ir: { ruta: 'inicio', label: 'Ir a Inicio' } },

    { id: 'c-libre', icono: 'plus', tono: 'var(--acc)',
      titulo: 'Registrar un entrenamiento libre',
      pasos: [
        'En Inicio, *O un entrenamiento libre*.',
        'Busca y añade los ejercicios que has hecho, uno a uno.',
        'Apunta cada serie con su peso y sus repeticiones.',
        'Guarda. Cuenta exactamente igual que una rutina del plan.'
      ],
      ir: { ruta: 'inicio', label: 'Ir a Inicio' } },

    { id: 'c-foto', icono: 'camara', tono: '#2fc4b2',
      titulo: 'Apuntar una comida con foto',
      pasos: [
        'Entra en *Alimentación*.',
        'Toca *Foto de lo que comes* y haz la foto o elige una de la galería.',
        'La app calcula lo que llevaba y, si la hora cae en una franja con menú, la cruza con lo que tocaba.',
        'Te dice si comiste lo previsto o algo distinto, y la diferencia en calorías y en proteína.'
      ],
      ir: { ruta: 'nutricion', label: 'Ir a Alimentación' } },

    { id: 'c-franjas', icono: 'reloj', tono: '#f0a23c',
      titulo: 'Cambiar las horas de tus comidas',
      pasos: [
        'En *Alimentación*, busca la fila de las franjas horarias.',
        'Pon la hora a la que empieza cada comida: desayuno, almuerzo, merienda y cena.',
        'Cada franja llega hasta la hora de la siguiente, así que con esas cuatro horas queda el día entero repartido.',
        'Desde ese momento, cada foto se cruza con la comida que tocaba a esa hora.'
      ],
      ir: { ruta: 'nutricion', label: 'Ir a Alimentación' } },

    { id: 'c-copia', icono: 'nube', tono: '#c06bf0',
      titulo: 'Guardar una copia de tus datos',
      pasos: [
        'Entra en *Ajustes* y baja hasta *Copia de seguridad*.',
        '*Exportar* baja un archivo con todo lo tuyo: rutinas, historial, perfil y ajustes.',
        'Para recuperarlo, en la misma pantalla, *Importar* y elige ese archivo.',
        'Si además tienes cuenta, tus datos ya viajan solos entre tus móviles; el archivo es la red de seguridad de todo lo demás.'
      ],
      ir: { ruta: 'ajustes', label: 'Ir a Ajustes' } },

    { id: 'c-offline', icono: 'down', tono: '#39b8c9',
      titulo: 'Dejarla lista para un gimnasio sin cobertura',
      pasos: [
        'Entra en *Perfil › Versión y espacio*.',
        'En *Entrenar sin internet*, elige qué bajar. Solo las de tus rutinas es lo más rápido.',
        'Espera a que termine la barra; te dice cuánto ocupa.',
        'Ya puedes entrenar sin datos y sin wifi.'
      ],
      ir: { ruta: 'version', label: 'Ir a Versión y espacio' } }
  ];

  /* ================= buscar ================= */

  /* Todo el texto de una entrada junto y normalizado, para que buscar «foto»
     encuentre también la pregunta que solo la menciona en la respuesta. Se
     calcula una vez: el contenido no cambia mientras la app está abierta. */
  function texto(x) {
    return I18N.norm([x.titulo || '', x.q || '', x.resumen || '']
      .concat(x.cuerpo || [], x.a || [], x.pasos || []).join(' '));
  }

  const INDICE = [].concat(
    TEMAS.map(function (x) { return { tipo: 'guia', x: x, t: texto(x) }; }),
    PREGUNTAS.map(function (x) { return { tipo: 'preguntas', x: x, t: texto(x) }; }),
    PASOS.map(function (x) { return { tipo: 'pasos', x: x, t: texto(x) }; })
  );

  const ETIQUETA = { guia: 'Guía', preguntas: 'Pregunta', pasos: 'Cómo se hace' };

  function buscar(q) {
    const n = I18N.norm(q);
    if (n.length < 2) return [];
    const partes = n.split(' ').filter(function (p) { return p.length > 1; });
    if (!partes.length) return [];
    return INDICE.filter(function (e) {
      return partes.every(function (p) { return e.t.indexOf(p) !== -1; });
    });
  }

  /* ================= piezas ================= */

  function irBoton(ir) {
    if (!ir) return '';
    return '<button class="btn vidrio block sm ay-ir" data-ir="' + esc(ir.ruta) + '">' +
      esc(ir.label) + ' ' + icon('chevron') + '</button>';
  }

  function temaHTML(t) {
    return html`
      <details class="ay-tema" data-ab="${t.id}" ${raw(abiertos[t.id] ? 'open' : '')}
               style="--tono:${raw(t.tono)}">
        <summary>
          <span class="ay-ico">${raw(icon(t.icono))}</span>
          <span class="grow">
            <span class="ay-tit">${t.titulo}</span>
            <span class="ay-sub">${t.resumen}</span>
          </span>
          <span class="ay-flecha">${raw(icon('chevron'))}</span>
        </summary>
        <div class="ay-cuerpo">
          ${raw(t.cuerpo.map(function (p) { return '<p>' + fmt(p) + '</p>'; }).join(''))}
          ${raw(irBoton(t.ir))}
        </div>
      </details>`;
  }

  function preguntaHTML(p) {
    return html`
      <details class="ay-tema ay-p" data-ab="${p.id}" ${raw(abiertos[p.id] ? 'open' : '')}
               style="--tono:var(--acc)">
        <summary>
          <span class="ay-marca">?</span>
          <span class="grow"><span class="ay-tit">${p.q}</span></span>
          <span class="ay-flecha">${raw(icon('chevron'))}</span>
        </summary>
        <div class="ay-cuerpo">
          ${raw(p.a.map(function (x) { return '<p>' + fmt(x) + '</p>'; }).join(''))}
          ${raw(irBoton(p.ir))}
        </div>
      </details>`;
  }

  function pasoHTML(c) {
    return html`
      <details class="ay-tema" data-ab="${c.id}" ${raw(abiertos[c.id] ? 'open' : '')}
               style="--tono:${raw(c.tono)}">
        <summary>
          <span class="ay-ico">${raw(icon(c.icono))}</span>
          <span class="grow">
            <span class="ay-tit">${c.titulo}</span>
            <span class="ay-sub">${c.pasos.length} pasos</span>
          </span>
          <span class="ay-flecha">${raw(icon('chevron'))}</span>
        </summary>
        <div class="ay-cuerpo">
          <ol class="instr ay-pasos">
            ${raw(c.pasos.map(function (p) { return '<li>' + fmt(p) + '</li>'; }).join(''))}
          </ol>
          ${raw(irBoton(c.ir))}
        </div>
      </details>`;
  }

  function pinta(e) {
    if (e.tipo === 'guia') return temaHTML(e.x);
    if (e.tipo === 'preguntas') return preguntaHTML(e.x);
    return pasoHTML(e.x);
  }

  /* ================= la pantalla ================= */

  const PESTANAS = [
    { id: 'guia', label: 'Guía' },
    { id: 'preguntas', label: 'Preguntas' },
    { id: 'pasos', label: 'Cómo se hace' }
  ];

  V.ayuda = function () {
    const hallados = busqueda ? buscar(busqueda) : null;

    const lista = hallados
      ? (hallados.length
          ? hallados.map(function (e) {
              return '<div class="ay-de">' + ETIQUETA[e.tipo] + '</div>' + pinta(e);
            }).join('')
          : html`
            <div class="card" style="text-align:center">
              <p class="muted" style="margin:6px 0 2px;font-size:.9rem">Nada con
              «${busqueda}».</p>
              <p class="tiny" style="margin:0">Prueba con una palabra suelta: peso, foto,
              días, datos, internet.</p>
            </div>`)
      : pestana === 'guia' ? TEMAS.map(temaHTML).join('')
        : pestana === 'preguntas' ? PREGUNTAS.map(preguntaHTML).join('')
          : PASOS.map(pasoHTML).join('');

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <h1>Ayuda</h1>
      <p class="muted">Qué hace la app, cómo se usa y por qué hace lo que hace. Está escrito
      aquí dentro, así que funciona sin conexión.</p>

      <div class="search-wrap" style="margin:12px 0 10px">
        ${raw(icon('search'))}
        <input id="ay-q" type="search" placeholder="Buscar: peso, foto, días, internet…"
               value="${busqueda}" autocomplete="off">
      </div>

      ${raw(hallados ? '<p class="tiny" style="margin:0 0 10px">' +
        (hallados.length === 1 ? '1 resultado' : hallados.length + ' resultados') +
        '</p>' : html`
        <div class="row" style="gap:6px;margin-bottom:12px">
          ${raw(PESTANAS.map(function (p) {
            return '<button class="chip' + (pestana === p.id ? ' on' : '') +
              '" data-pes="' + p.id + '">' + p.label + '</button>';
          }).join(''))}
        </div>`)}

      ${raw(lista)}

      <p class="tiny pie-marca" style="margin-top:18px">Esta ayuda se escribe a mano y se
      amplía con lo que la gente pregunta.</p>`;
  };

  V.ayuda.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });

    bindAll(root, '[data-pes]', function (el) {
      pestana = el.dataset.pes;
      render();
    });

    bindAll(root, '[data-ir]', function (el) { go(el.dataset.ir); });

    /* Lo desplegado se recuerda fuera del DOM: si no, abrir una pregunta y que
       algo repinte la pantalla la volvía a cerrar. */
    root.querySelectorAll('details[data-ab]').forEach(function (d) {
      d.addEventListener('toggle', function () { abiertos[d.dataset.ab] = d.open; });
    });

    /* Se busca mientras se escribe, pero repintar en cada tecla le quitaría el
       foco al campo. Se repinta y se devuelve el cursor al final. */
    const q = root.querySelector('#ay-q');
    if (q) {
      let espera = null;
      q.addEventListener('input', function () {
        clearTimeout(espera);
        espera = setTimeout(function () {
          busqueda = q.value.trim();
          render();
          const nuevo = document.querySelector('#ay-q');
          if (nuevo) {
            nuevo.focus();
            nuevo.setSelectionRange(nuevo.value.length, nuevo.value.length);
          }
        }, 220);
      });
    }
  };

  /* Entrar por la puerta principal deja la ayuda como nueva. Volver de seguir
     un enlace, no: ahí estabas a mitad de una pregunta y encontrarte la
     búsqueda borrada sería empezar otra vez. */
  g.Ayuda = {
    reiniciar: function () { busqueda = ''; pestana = 'guia'; }
  };
})(window);
