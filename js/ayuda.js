/* ayuda.js — el manual, dentro de la app.

   La app hace cosas que nadie adivina: de dónde sale el peso que aparece
   puesto en la casilla, por qué el plan saca un 6, por qué una foto se cruza
   con el desayuno y otra no, por qué un ejercicio «no existe» al buscarlo.

   Tres decisiones que explican cómo está hecho esto.

   UNA PANTALLA POR ENTRADA. La primera versión eran acordeones: treinta
   tarjetas de colores que se desplegaban unas encima de otras. Con un paso a
   paso de verdad —seis pasos, cada uno con su explicación y su enlace— eso es
   un muro. El índice es una lista limpia y cada entrada tiene su pantalla, con
   sitio para contarlo entero.

   LAS RAMAS SON PASOS, NO PÁRRAFOS. «Crear una rutina» no tiene un camino:
   tiene dos, y son distintos de arriba abajo. Meter los dos en la misma lista
   obliga a leer la mitad que no va contigo. Se pregunta primero cuál, y luego
   se cuenta solo ese.

   Y SE LLEGA AL BOTÓN, NO A LA PANTALLA. Media explicación es qué tocar al
   llegar, así que los enlaces llevan a la pantalla y pulsan lo que toca. Decir
   «vete a Rutinas y busca Crear la mía» teniendo la app delante es dejar el
   trabajo a medias.

   El contenido está escrito a mano, sin IA: quien abre la ayuda ya está
   perdido, que es el peor momento para que le conteste algo capaz de
   inventarse una función que no existe. Y así funciona sin cobertura, que es
   justo donde estás cuando no sabes qué hacer.

   SI AÑADES UNA FUNCIÓN A LA APP, AÑÁDELA AQUÍ. Los números que la ayuda
   cuenta salen de los módulos de verdad (los saltos de peso, el tope de
   series, el mínimo de ejercicios), así que esos no pueden mentir solos. Lo
   demás se escribe: una entrada en TEMAS si es un concepto nuevo, en PASOS si
   hay algo que hacer, en PREGUNTAS si va a generar dudas. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  let busqueda = '';

  /* Negritas sin meter HTML en el contenido: se escapa todo y luego se
     convierte *lo que va entre asteriscos*. Escribir <b> a mano en cada
     párrafo invita a que un día se cuele una etiqueta sin cerrar. */
  function fmt(s) {
    return esc(s).replace(/\*([^*]+)\*/g, '<b>$1</b>');
  }

  /* ---------- lo que la ayuda no se inventa ----------
     Un manual que repite a mano el número que hay en otro archivo miente el día
     que ese número cambia. Estos se preguntan. */
  function saltoDe(equipo) {
    if (!g.Progresion) return '';
    const lb = Store.settings().unit === 'lb';
    const t = lb ? Progresion.SALTOS_LB : Progresion.SALTOS_KG;
    return UI.num(t[equipo]) + (lb ? ' lb' : ' kg');
  }
  function minimoEjercicios() { return Store.MINIMO_EJERCICIOS || 6; }

  /* ================= cómo funciona ================= */

  const TEMAS = [
    { id: 'g-entrenar', titulo: 'Las dos formas de entrenar',
      resumen: 'Seguir el plan o apuntar sobre la marcha',
      cuerpo: [
        'Hay dos maneras y cuentan exactamente igual.',
        '*Seguir una rutina*: la app te lleva serie a serie, con el peso ya propuesto, las repeticiones y el descanso contado solo. Es lo que sale en el botón grande de la portada cuando hoy te toca algo.',
        '*Entrenamiento libre*: empiezas con la hoja en blanco y vas añadiendo lo que haces. Sirve para el día que improvisas, para el gimnasio del hotel o para apuntar algo que hiciste y no estaba en ningún plan.',
        'Las dos alimentan lo mismo: historial, récords, volumen levantado, reparto por zona y constancia. El libre no es un modo de segunda.',
        'En la portada, si ya has entrenado hoy, la app te lo dice y te deja solo el libre: ofrecerte empezar otra vez lo que ya has hecho no tiene sentido.'
      ],
      ver: ['c-entrenar', 'c-libre'] },

    { id: 'g-plan', titulo: 'Rutina, plan y días',
      resumen: 'Por qué asignar días no es cosmético',
      cuerpo: [
        'Una *rutina* es una lista de ejercicios con sus series y sus repeticiones.',
        'Un *plan* es un conjunto de rutinas con días de la semana puestos. Las rutinas que comparten nombre de plan se leen juntas como una semana.',
        'Poner los días cambia lo que la app puede saber de ti: qué te toca hoy en la portada, cuántas series por semana haces de cada zona, si el reparto está equilibrado y qué nota saca el plan.',
        'Sin días asignados no hay una semana que contar, y media app se queda muda: la portada no sabe qué ofrecerte y la auditoría no tiene nada que auditar.',
        'Si sigues más de un plan a la vez, marca uno como *plan principal*: en «hoy» solo salen sus rutinas, y las cuentas semanales se hacen con él. Los demás siguen guardados.'
      ],
      ver: ['c-dias', 'c-rutina'] },

    { id: 'g-nota', titulo: 'La nota de tu plan',
      resumen: 'De dónde sale y por qué no la pone una IA',
      cuerpo: [
        'La auditoría son *reglas fijas*, no una opinión. Se comprueba, una por una:',
        'El *volumen* de cada músculo, para ver si alguno se queda por debajo del mínimo semanal. Los *patrones de movimiento* que faltan: un plan sin ninguna tracción vertical está cojo aunque tenga veinte ejercicios. Los *ejercicios repetidos* entre días. Si hay *dos básicos pesados* el mismo día, que dejan la espalda baja frita para el segundo.',
        'El *orden* dentro de la sesión, porque un básico detrás de tres aislamientos se hace con lo que queda. Si algún ejercicio está en el *día equivocado*: un movimiento pesado de tren inferior entre los tres primeros de un día de empuje se lleva la fuerza que necesitaba el press. Los *descansos* demasiado cortos para lo que pesa el ejercicio. El *material* que de verdad tienes. Y tus *limitaciones*, si has dicho alguna.',
        'Se parte de un 10 y cada fallo resta según lo gordo que sea. Un 6 no es un suspenso: es una lista de cosas concretas, y casi todas vienen con el arreglo hecho para aplicarlo de una vez.',
        'Es con reglas y no con IA a propósito: una regla da siempre la misma respuesta —la misma rutina saca siempre la misma nota— y funciona en el gimnasio sin cobertura. La IA entra después, si la tienes, para lo que sí es opinión.'
      ],
      ver: ['c-auditar', 'g-plan'] },

    { id: 'g-peso', titulo: 'El peso que aparece puesto',
      resumen: 'Por qué a veces no es el de la última vez',
      cuerpo: [
        'Antes la app dejaba puesto el peso de la última vez. Eso no es progresar, es repetir.',
        'Ahora lo decide con lo que ya tienes apuntado, y te dice cuál de los tres casos es antes de empezar la serie:',
        '*Subes* si la última vez sacaste todas las series con las repeticiones pedidas. *Repites* si te quedaste corto: el mismo peso hasta sacarlo entero. *Bajas* un 10 % si llevas tres sesiones seguidas sin sacarlo al mismo peso, para cogerle la técnica y volver a subir.',
        'Dos veces cortas no bastan para bajar: un mal día o una mala noche le pasa a cualquiera, y bajar ahí desanima por nada. Tres seguidas ya no es mala suerte.',
        'El salto es el de cada material, no un número inventado: ' + saltoDe('barbell') + ' en barra, máquina y polea; ' + saltoDe('dumbbell') + ' en mancuernas; ' + saltoDe('kettlebells') + ' en kettlebell. Una barra admite discos de 1,25 por lado; un par de mancuernas del gimnasio va de dos en dos y no hay nada entre medias.',
        'Con peso corporal o con bandas no dice nada: ahí se progresa en repeticiones y eso ya lo lleva la propia rutina. Y el número siempre se puede cambiar a mano: es una propuesta, no una orden.'
      ],
      ver: ['g-nota'] },

    { id: 'g-reparto', titulo: 'Reparto por zona y aviso de exceso',
      resumen: 'Lo que haces de verdad frente a lo que pide tu plan',
      cuerpo: [
        'En Progreso, zona por zona, ves las series por semana que haces de verdad y una marca con lo que pide tu plan.',
        'La app avisa por defecto —una zona que se queda corta— y también por exceso, que es lo que casi nadie mira.',
        'El aviso de exceso salta si una zona pasa de *veinte series por semana* y además no está subiendo peso. Por encima de veinte, lo que se añade suele ser fatiga y no músculo; si encima ningún ejercicio de esa zona ha subido de peso en el periodo, no estás entrenando duro, estás cavando.',
        'Si pasa de veinte pero sí estás subiendo, te lo dice en verde: es mucho, pero te lo estás recuperando, y no hay nada que corregir.',
        'No se mide contra tu plan, se mide contra lo que sirve para crecer. Tu plan puede estar mal escrito, y entonces el que está mal es el plan, no lo que haces.'
      ],
      ver: ['g-plan'] },

    { id: 'g-comida', titulo: 'El menú y el cruce de fotos',
      resumen: 'Cómo sabe la app si comiste lo previsto',
      cuerpo: [
        'Tus calorías y tu proteína salen de tus datos: sexo, peso, altura, edad, actividad y objetivo.',
        'El día está partido en cuatro franjas —desayuno, almuerzo, merienda y cena— y *las horas las pones tú*, porque la hora a la que desayuna cada uno no es la misma. Cada franja llega hasta la hora de la siguiente, así que con cuatro horas queda el día entero repartido.',
        'Cuando subes una foto dentro de la franja del desayuno, la app la cruza con el desayuno de tu menú: te dice si comiste lo previsto o algo distinto, y cuánta proteína o cuántas calorías te has dejado o te has pasado.',
        'Si la hora de la foto no cae en ninguna franja, busca la comida del menú más cercana dentro de dos horas y media. Si tampoco, la apunta sin cruzar y no se inventa nada.',
        'Lo que quedó sin cruzar no se pierde: la app te ofrece cruzarlo después con las fotos que ya tienes apuntadas.'
      ],
      ver: ['c-foto', 'c-franjas'] },

    { id: 'g-lugar', titulo: 'Dónde entrenas',
      resumen: 'Por qué a veces un ejercicio no aparece',
      cuerpo: [
        'Lo que elijas —gimnasio completo, casa con mancuernas, solo bandas, peso corporal— filtra el catálogo entero.',
        'Es la causa más habitual de que un ejercicio «no exista»: está, pero lo tienes fuera porque necesita material que has dicho que no tienes. En el buscador de Ejercicios puedes quitar el filtro y ver el catálogo completo.',
        'También lo usa la auditoría: si tu plan lleva press de banca y has dicho que entrenas en casa con bandas, eso sale como fallo con su arreglo.',
        'Se cambia desde el botón del sitio, arriba a la derecha en cualquier pantalla, o en Perfil › Dónde entrenas.'
      ],
      ver: ['p-ejercicio'] },

    { id: 'g-datos', titulo: 'Dónde están tus datos',
      resumen: 'En tu móvil, y en la nube solo si tú quieres',
      cuerpo: [
        'Todo se guarda en el propio móvil, en el almacenamiento del navegador. Sin cuenta la app funciona entera y nada sale de ahí.',
        'Si creas una cuenta, tus datos se copian a la nube y vuelven al entrar desde otro móvil. Es lo que te cubre si pierdes el teléfono, cambias de móvil o borras la app.',
        'De las dos maneras puedes bajarte una copia en un archivo desde Ajustes › Copia de seguridad, y volver a cargarla cuando quieras. Es la red de seguridad que no depende de nadie.'
      ],
      ver: ['c-copia', 'p-perder'] },

    { id: 'g-ia', titulo: 'El entrenador con IA',
      resumen: 'Opcional, con tu clave, y nunca donde debe haber una regla',
      cuerpo: [
        'Es la parte opcional de la app. Sirve para lo que de verdad es una opinión: montarte un programa leyendo lo que le cuentes, proponerte un menú, leer una foto de comida, contestarte una duda.',
        'Funciona con tu propia clave, que guardas en la Bóveda de claves. La app no cobra nada; lo que gastes con tu clave se lo pagas a quien te la dio.',
        'Lo que es una regla no pasa por la IA: el peso de hoy, la nota del plan, el reparto por zona, el mínimo de series. Una regla tiene que dar siempre el mismo número y funcionar sin cobertura.',
        'Sin activarla, todo lo demás funciona igual. Lo único que pierdes es lo que hace falta pensar, no lo que hace falta contar.'
      ],
      ver: ['c-ia', 'g-nota'] },

    { id: 'g-offline', titulo: 'Entrenar sin internet',
      resumen: 'Qué hay que bajar antes y qué no hace falta',
      cuerpo: [
        'La app entera funciona sin conexión: las rutinas, el entrenamiento, el cronómetro, apuntar series, el historial y las estadísticas. Todo eso vive en el móvil.',
        'Lo único que conviene bajar antes son las *imágenes de los ejercicios*, porque pesan y no vienen de serie. Puedes bajar solo las de tus rutinas —lo más rápido—, las principales del catálogo o el catálogo completo.',
        'Se hace desde Perfil › Versión y espacio, y te dice cuánto ocupa antes de empezar y cuánto llevas ya guardado.',
        'Lo que sí necesita conexión: el entrenador con IA, sincronizar con tu cuenta y actualizar la app.'
      ],
      ver: ['c-offline'] }
  ];

  /* ================= cómo se hace ================= */

  /* Un paso es {t} y, si hace falta, {d} para el porqué y {ir} para llevarte
     al botón. Los tres campos son opcionales salvo el texto: un paso obvio no
     necesita explicación, y ponerle una lo hace más largo, no más claro. */
  const PASOS = [
    { id: 'c-rutina', titulo: 'Crear una rutina',
      resumen: 'A mano o con la app',
      primero: true,
      intro: 'Hay dos caminos y no se parecen en nada. Elige el tuyo:',
      ramas: [
        { id: 'mano', titulo: 'La monto yo', sub: 'Eliges tú cada ejercicio, uno a uno',
          pasos: [
            { t: 'Abre el editor de rutina nueva.',
              d: 'Está en Rutinas › *Crear la mía*. Se abre una ficha vacía.',
              ir: { ruta: 'rutina', arg: 'nueva', label: 'Abrir una rutina nueva' } },
            { t: 'Ponle nombre.',
              d: 'El que te sirva a ti para reconocerla de un vistazo: «Pierna dura», «Lunes de espalda», «La corta de casa». Si vas a montar un plan de varios días, usa el mismo nombre de plan en todas para que la app las lea como una semana.' },
            { t: 'Marca los días de la semana en que la vas a hacer.',
              d: 'Están en la misma ficha, debajo de las notas. Esto es lo que convierte una lista de ejercicios en un plan: sin días, la portada no sabe qué ofrecerte.' },
            { t: 'Decide si es mixta.',
              d: 'Apagado, la rutina se queda en su zona y te avisa si metes un ejercicio de otra. Enciéndelo solo si quieres mezclar tren superior e inferior a propósito.' },
            { t: 'Añade ejercicios con el botón *Añadir*.',
              d: 'Se abre el buscador con tu material ya filtrado. El mínimo son ' + minimoEjercicios() + ' ejercicios; por arriba, los que quieras.' },
            { t: 'Pon series, repeticiones y descanso de cada uno.',
              d: 'Los tres campos están debajo de cada ejercicio. El descanso va en segundos, y la auditoría te dirá si te has quedado corto para lo que pesa ese ejercicio.' },
            { t: 'Ordena.',
              d: 'Con las flechas de cada ejercicio. Lo pesado va delante: un básico detrás de tres aislamientos se hace con lo que queda. El icono de cambiar te propone recambios del mismo patrón.' },
            { t: 'Guarda.',
              d: 'Botón *Guardar* al final. Si ya tiene ejercicios, también tienes *Guardar y entrenar ahora* para estrenarla en el momento.' }
          ],
          cierre: 'Cuando la tengas, pásala por la auditoría: son treinta segundos y te dice qué falla antes de hacerla ocho semanas.',
          ver: ['c-auditar'] },

        { id: 'ia', titulo: 'Que me la monte la app', sub: 'Con o sin IA, y luego la editas igual',
          pasos: [
            { t: 'Abre el generador de programa.',
              d: 'Está en Rutinas › *Generar programa*. No monta una rutina suelta: monta la semana entera.',
              ir: { ruta: 'programa', label: 'Abrir «Generar programa»' } },
            { t: 'Paso 1: repasa tus datos.',
              d: 'Sexo, edad, peso, altura y nivel. De ahí salen el volumen, las repeticiones y el esfuerzo. Si algo no cuadra, corrígelo antes de generar.' },
            { t: 'Paso 2: di cuándo puedes entrenar.',
              d: 'Qué días y cuántos minutos tienes. Ponlo realista: es mejor un plan de tres días que cumples que uno de cinco que no.' },
            { t: 'Paso 3: di qué buscas.',
              d: 'Tu objetivo, el sitio donde entrenas y la zona en la que quieres poner el foco.' },
            { t: 'Paso 4: cuéntale lo que no cabe en ningún campo.',
              d: 'Qué te molesta ahora mismo, qué más debe saber, y qué le pides en concreto. Esto es opcional, pero es lo que separa un plan tuyo de uno genérico. Solo lo aprovecha la IA: la calculadora no lee texto.' },
            { t: 'Elige con qué generarlo.',
              d: '*Generar rutina con IA* lee todo lo anterior, más lo que levantas y lo que llevas abandonado, y elige los ejercicios uno a uno. *Generar rutina automáticamente* es al momento y sin conexión, repartiendo patrones según tu edad y tu nivel, pero no lee lo que hayas escrito.' },
            { t: 'Míralo antes de quedártelo.',
              d: 'Te enseña la semana entera, por qué ese plan, y cómo progresar. Si no te convence, *Otra propuesta* lo vuelve a montar.' },
            { t: 'Guarda.',
              d: 'Botón *Guardar* al final del plan. Se convierte en rutinas normales, con sus días puestos, y a partir de ahí las editas como cualquier otra.' }
          ],
          cierre: 'Lo generado no es intocable: entra en cualquiera de sus rutinas y cámbiale lo que quieras.',
          ver: ['c-auditar', 'c-dias'] }
      ] },

    { id: 'c-dias', titulo: 'Cambiar los días de una rutina',
      resumen: 'Mover el plan sin rehacerlo',
      pasos: [
        { t: 'Entra en Rutinas.',
          ir: { ruta: 'rutinas', label: 'Abrir Rutinas' } },
        { t: 'Toca la rutina para desplegarla.',
          d: 'Se abre con sus ejercicios y, debajo, la fila *Qué días la hago*.' },
        { t: 'Toca los días.',
          d: 'Se encienden y se apagan. Una rutina puede tener varios días, y entonces cuenta como que la haces varias veces por semana.' },
        { t: 'Si dos rutinas se pelean por un día, quítaselo a una.',
          d: 'Si el viernes quieres pecho en vez de pierna, quita el viernes de la de pierna y pónselo a la de pecho.' }
      ],
      cierre: 'El cambio es inmediato: la portada y las estadísticas ya cuentan con los días nuevos.',
      ver: ['g-plan'] },

    { id: 'c-entrenar', titulo: 'Entrenar hoy',
      resumen: 'Seguir lo que toca, serie a serie',
      primero: true,
      pasos: [
        { t: 'Abre la portada.',
          d: 'El botón grande arranca lo que te toca hoy según tu plan. Si hoy no toca nada, te ofrece el entrenamiento libre.',
          ir: { ruta: 'inicio', label: 'Ir a Inicio' } },
        { t: 'Mira el peso propuesto antes de la primera serie.',
          d: 'Encima de cada ejercicio te dice si hoy subes, repites o bajas, y por qué. Si no te cuadra, cámbialo: es una propuesta.' },
        { t: 'Marca cada serie según la vas haciendo.',
          d: 'El descanso arranca solo al marcarla, y el cronómetro te acompaña por toda la app: puedes salir a mirar otra cosa sin perderlo.' },
        { t: 'Apunta lo que de verdad hiciste.',
          d: 'Si sacaste ocho en vez de diez, pon ocho. De ahí sale la propuesta de la próxima vez, y una cifra inflada hoy es un peso que no podrás mover la semana que viene.' },
        { t: 'Guarda al terminar.',
          d: 'Se suma al historial, a los récords, al volumen levantado y a la constancia.' }
      ],
      ver: ['g-peso', 'c-libre'] },

    { id: 'c-libre', titulo: 'Registrar un entrenamiento libre',
      resumen: 'Apuntar lo que no estaba en ningún plan',
      pasos: [
        { t: 'En la portada, toca *O un entrenamiento libre*.',
          d: 'Está debajo del botón grande. Si ya entrenaste hoy, es la única opción que verás, y es a propósito.',
          ir: { ruta: 'inicio', label: 'Ir a Inicio' } },
        { t: 'Añade los ejercicios que has hecho, uno a uno.',
          d: 'El buscador es el mismo que en todas partes, con tu material filtrado.' },
        { t: 'Apunta cada serie con su peso y sus repeticiones.' },
        { t: 'Guarda.',
          d: 'Cuenta exactamente igual que una rutina del plan: historial, récords y estadísticas.' }
      ],
      cierre: 'Para algo que hiciste otro día —una caminata el domingo, la pachanga del sábado—, en Rutinas tienes *Apuntar algo que ya hice*.',
      ver: ['g-entrenar'] },

    { id: 'c-auditar', titulo: 'Pasar tu plan por la auditoría',
      resumen: 'Qué falla y cómo arreglarlo de una vez',
      pasos: [
        { t: 'Entra en Rutinas.',
          ir: { ruta: 'rutinas', label: 'Abrir Rutinas' } },
        { t: 'Abre las acciones del plan que quieres revisar.',
          d: 'En la cabecera del plan, y ahí *Revisar el plan con IA*. Lee sus días juntos, que es como hay que leerlos: el reparto entre músculos, lo que se repite y lo que falta se cuentan sobre la semana, no sobre una sesión.' },
        { t: 'Lee la nota y los fallos.',
          d: 'Cada fallo dice qué se ha medido, no solo que algo está mal. Están ordenados por gravedad: lo de arriba es lo que más importa.' },
        { t: 'Aplica los arreglos que te convenzan.',
          d: 'Casi todos traen el cambio hecho —quitar esto, meter aquello, subir ese descanso— y se aplican de una vez. Los que no te convenzan, déjalos: es tu plan.' }
      ],
      cierre: 'Para una rutina suelta hay auditoría también, dentro del editor, y se salta las reglas que solo tienen sentido sobre una semana entera.',
      ver: ['g-nota'] },

    { id: 'c-foto', titulo: 'Apuntar una comida con foto',
      resumen: 'Y cruzarla con tu menú',
      pasos: [
        { t: 'Entra en Alimentación.',
          ir: { ruta: 'nutricion', label: 'Ir a Alimentación' } },
        { t: 'Toca *Foto de lo que comes*.',
          d: 'Puedes hacerla en el momento o elegir una de la galería.' },
        { t: 'Deja que la lea.',
          d: 'Calcula lo que llevaba: calorías, proteína y el resto. Esto sí usa la IA, así que necesita conexión y tu clave puesta.' },
        { t: 'Mira el cruce.',
          d: 'Si la hora cae en una franja con menú, te dice si comiste lo previsto o algo distinto, y la diferencia en calorías y en proteína.' },
        { t: 'Si no se cruzó, crúzalo a mano.',
          d: 'La app te ofrece las comidas candidatas del menú para que elijas cuál era.' }
      ],
      ver: ['g-comida', 'c-franjas', 'p-foto'] },

    { id: 'c-franjas', titulo: 'Poner las horas de tus comidas',
      resumen: 'Para que el cruce acierte',
      pasos: [
        { t: 'Entra en Alimentación.' },
        { t: 'Busca la fila de las franjas horarias.',
          d: 'Está entre las acciones de la pantalla.',
          ir: { ruta: 'nutricion', sel: '[data-a=franjas]',
            label: 'Abrir las franjas horarias' } },
        { t: 'Pon la hora a la que empieza cada comida.',
          d: 'Desayuno, almuerzo, merienda y cena. Si desayunas a las seis, ponlo a las seis: lo que viene de fábrica es una media que probablemente no es la tuya.' },
        { t: 'No hace falta poner la hora de fin.',
          d: 'Cada franja llega hasta la hora de la siguiente, y la cena se estira hasta el desayuno del día siguiente aunque cruce la medianoche.' }
      ],
      cierre: 'A partir de ahí, cada foto se cruza con la comida que tocaba a esa hora.',
      ver: ['g-comida'] },

    { id: 'c-ia', titulo: 'Activar el entrenador con IA',
      resumen: 'Elegir proveedor y guardar tu clave',
      pasos: [
        { t: 'Entra en Perfil › Entrenador con IA.',
          ir: { ruta: 'entrenador', label: 'Abrir el entrenador' } },
        { t: 'Elige proveedor.',
          d: 'Cada uno tiene su forma de darte una clave; en la propia pantalla se dice dónde se consigue la de cada uno.' },
        { t: 'Pega tu clave en la bóveda.',
          d: 'Se queda en tu móvil, igual que el resto de tus datos. La app no la manda a ningún sitio que no sea el proveedor que has elegido.' },
        { t: 'Pruébala.',
          d: 'Cada servicio de la bóveda tiene su botón de probar, que hace una llamada de verdad y te dice si responde.' }
      ],
      cierre: 'Si algo deja de funcionar, vuelve aquí antes que a ningún otro sitio: casi siempre es una clave caducada o sin saldo.',
      ver: ['g-ia', 'p-precio'] },

    { id: 'c-copia', titulo: 'Guardar una copia de tus datos',
      resumen: 'El archivo que no depende de nadie',
      pasos: [
        { t: 'Entra en Ajustes y baja hasta *Copia de seguridad*.',
          ir: { ruta: 'ajustes', label: 'Ir a Ajustes' } },
        { t: '*Exportar* baja un archivo con todo.',
          d: 'Rutinas, historial, perfil y ajustes. Guárdalo donde no se te pierda.' },
        { t: 'Para recuperarlo, *Importar* y elige ese archivo.',
          d: 'En la misma pantalla. Sirve también para llevártelo a otro móvil sin crear cuenta.' }
      ],
      cierre: 'Si además tienes cuenta, tus datos ya viajan solos entre tus dispositivos; el archivo es la red de seguridad de todo lo demás.',
      ver: ['g-datos', 'p-perder'] },

    { id: 'c-offline', titulo: 'Dejarla lista para un gimnasio sin cobertura',
      resumen: 'Descargar lo que pesa, antes de ir',
      pasos: [
        { t: 'Entra en Perfil › Versión y espacio.',
          ir: { ruta: 'version', label: 'Abrir Versión y espacio' } },
        { t: 'En *Entrenar sin internet*, elige qué bajar.',
          d: 'Solo las de tus rutinas es lo más rápido y suele bastar. Los ejercicios principales o el catálogo completo, si te gusta buscar sobre la marcha.' },
        { t: 'Espera a que termine la barra.',
          d: 'Te dice cuánto llevas guardado. Hazlo con wifi.' }
      ],
      cierre: 'A partir de ahí puedes entrenar sin datos y sin wifi, con las imágenes y todo.',
      ver: ['g-offline'] },

    { id: 'c-instalar', titulo: 'Instalar la app en el móvil',
      resumen: 'Para que arranque como una app y no como una página',
      primero: true,
      pasos: [
        { t: 'Abre Training FR en el navegador del móvil.' },
        { t: 'En Android: menú del navegador › *Añadir a la pantalla de inicio*.' },
        { t: 'En iPhone: botón Compartir › *Añadir a pantalla de inicio*.' },
        { t: 'Ábrela desde el icono nuevo.',
          d: 'Arranca a pantalla completa, sin barra de navegador, y funciona sin conexión.' }
      ],
      cierre: 'En Ajustes hay también un botón de instalar, que aparece si tu navegador lo permite.',
      ver: ['c-offline'] }
  ];

  /* ================= preguntas ================= */

  const PREGUNTAS = [
    { id: 'p-offline', q: '¿Funciona sin internet?',
      a: ['Sí, entera. Las rutinas, el entrenamiento, el cronómetro, el historial y las estadísticas no necesitan conexión.',
        'Solo necesitan internet tres cosas: el entrenador con IA, sincronizar con tu cuenta y actualizar la app. Las imágenes de los ejercicios hay que bajarlas una vez.'],
      ver: ['c-offline', 'g-offline'] },

    { id: 'p-datos', q: '¿Dónde se guardan mis datos?',
      a: ['En tu propio móvil, en el almacenamiento del navegador. Sin cuenta, no salen de ahí.',
        'Si creas una cuenta, además se copian a la nube para que vuelvan al entrar desde otro dispositivo.'],
      ver: ['g-datos'] },

    { id: 'p-perder', q: '¿Pierdo todo si cambio de móvil o borro la app?',
      a: ['Sin cuenta, sí: los datos viven en ese navegador y se van con él.',
        'Con cuenta, no: entras con tu correo en el móvil nuevo y vuelve todo.',
        'Y en cualquiera de los dos casos, un archivo exportado te cubre.'],
      ver: ['c-copia', 'g-datos'] },

    { id: 'p-peso', q: '¿Por qué el peso que sale no es el que puse la última vez?',
      a: ['Porque la app decide el peso de hoy con tu historial, en vez de repetir el último.',
        'Encima del ejercicio te dice cuál de los tres casos es —subes, repites o bajas— y por qué. Y el número se puede cambiar siempre.'],
      ver: ['g-peso'] },

    { id: 'p-nota', q: '¿Por qué mi plan saca esa nota?',
      a: ['La nota parte de un 10 y baja por cada fallo encontrado, según su gravedad.',
        'Los fallos están listados uno a uno con lo que se ha medido: no es un número a secas. Casi todos traen un arreglo automático.',
        'Son reglas fijas, así que la misma rutina saca siempre la misma nota.'],
      ver: ['g-nota', 'c-auditar'] },

    { id: 'p-ejercicio', q: '¿Por qué no encuentro un ejercicio que sé que existe?',
      a: ['Casi siempre es el material. Lo que hayas puesto en «Dónde entrenas» filtra el catálogo: si has dicho que entrenas en casa con bandas, el press de banca no aparece.',
        'En el buscador puedes quitar el filtro y ver el catálogo completo, o cambiar el sitio desde el botón de arriba a la derecha.'],
      ver: ['g-lugar'] },

    { id: 'p-foto', q: '¿Por qué mi foto no se cruzó con el menú?',
      a: ['Por una de tres: la hora de la foto cae fuera de todas las franjas, no tienes un menú activo para ese día, o las franjas no están puestas a tus horas.',
        'Lo que quedó sin cruzar se puede cruzar después, y también a mano eligiendo tú la comida.'],
      ver: ['c-franjas', 'g-comida'] },

    { id: 'p-sinplan', q: '¿Puedo entrenar sin crear ningún plan?',
      a: ['Sí. El entrenamiento libre no necesita nada: abres, añades lo que vas haciendo y guardas.',
        'Cuenta igual para el historial, los récords y las estadísticas. Lo único que te pierdes sin plan es lo que se calcula sobre la semana: qué toca hoy, el reparto por zona y la auditoría.'],
      ver: ['c-libre', 'g-plan'] },

    { id: 'p-precio', q: '¿Cuánto cuesta la app?',
      a: ['Nada. No tiene suscripción, ni anuncios, ni compras.',
        'Lo único que puede costar dinero es el entrenador con IA, porque funciona con tu propia clave: lo que gastes se lo pagas a quien te la dio, no a la app. Sin activarlo, todo lo demás funciona igual.'],
      ver: ['g-ia', 'c-ia'] },

    { id: 'p-actualiza', q: '¿Por qué me pide actualizar tan a menudo?',
      a: ['Porque la app se sigue construyendo y cada mejora se publica en cuanto está probada.',
        'La actualización pesa muy poco y no toca tus datos: rutinas, historial y perfil se quedan como están.',
        'Si algo se comporta raro justo después de actualizar, casi siempre es que el móvil se ha quedado con archivos de dos versiones mezclados. Para eso está «Forzar actualización».'] },

    { id: 'p-kcal', q: '¿Las calorías que me da son exactas?',
      a: ['Son una estimación calculada con tus datos —sexo, peso, altura, edad, actividad y objetivo— con las fórmulas habituales.',
        'Sirven como punto de partida, no como verdad absoluta: dos personas con los mismos números gastan distinto. Lo que manda es cómo responde tu peso a lo largo de varias semanas; si no se mueve como esperabas, ajusta.'],
      ver: ['g-comida'] },

    { id: 'p-libras', q: '¿Puedo usar libras en vez de kilos?',
      a: ['Sí, en Ajustes. Y no es solo cambiar la etiqueta: los saltos de peso que te propone la app también cambian, porque en libras el gimnasio va de cinco en cinco.'],
      ver: ['g-peso'] }
  ];

  /* ================= índice y búsqueda ================= */

  const TODO = {};
  TEMAS.forEach(function (x) { x.tipo = 'guia'; TODO[x.id] = x; });
  PASOS.forEach(function (x) { x.tipo = 'pasos'; TODO[x.id] = x; });
  PREGUNTAS.forEach(function (x) { x.tipo = 'preguntas'; TODO[x.id] = x; });

  function titulo(x) { return x.titulo || x.q || ''; }

  /* Todo el texto de una entrada junto, ramas incluidas, para que buscar
     «guardar» encuentre el paso que lo explica aunque el título no lo diga. */
  function texto(x) {
    const trozos = [titulo(x), x.resumen || '', x.intro || '', x.cierre || '']
      .concat(x.cuerpo || [], x.a || []);
    const depasos = function (ps) {
      (ps || []).forEach(function (p) { trozos.push(p.t || '', p.d || ''); });
    };
    depasos(x.pasos);
    (x.ramas || []).forEach(function (r) {
      trozos.push(r.titulo || '', r.sub || '', r.cierre || '');
      depasos(r.pasos);
    });
    return I18N.norm(trozos.join(' '));
  }

  const INDICE = Object.keys(TODO).map(function (id) {
    return { id: id, x: TODO[id], t: texto(TODO[id]) };
  });

  function buscar(q) {
    const n = I18N.norm(q);
    const partes = n.split(' ').filter(function (p) { return p.length > 1; });
    if (!partes.length) return [];
    return INDICE.filter(function (e) {
      return partes.every(function (p) { return e.t.indexOf(p) !== -1; });
    }).map(function (e) { return e.x; });
  }

  const ETIQUETA = { guia: 'Cómo funciona', pasos: 'Cómo se hace', preguntas: 'Pregunta' };

  /* ================= piezas ================= */

  function filaHTML(x) {
    return '<button class="list-row tap ay-fila" data-ay="' + esc(x.id) + '">' +
      '<span class="grow"><span class="list-row-title">' + esc(titulo(x)) + '</span>' +
      (x.resumen ? '<span class="list-row-sub">' + esc(x.resumen) + '</span>' : '') +
      '</span><span class="chevron">' + icon('chevron') + '</span></button>';
  }

  function grupoHTML(titulo2, xs) {
    if (!xs.length) return '';
    return '<div class="list-title">' + esc(titulo2) + '</div>' +
      '<div class="list ay-lista">' + xs.map(filaHTML).join('') + '</div>';
  }

  function irHTML(ir) {
    if (!ir) return '';
    return '<button class="btn sm ay-ir" data-ir="' + esc(ir.ruta) + '"' +
      (ir.arg ? ' data-arg="' + esc(ir.arg) + '"' : '') +
      (ir.sel ? ' data-sel="' + esc(ir.sel) + '"' : '') + '>' +
      esc(ir.label) + ' ' + icon('chevron') + '</button>';
  }

  function pasosHTML(ps) {
    return '<ol class="ay-pasos">' + ps.map(function (p) {
      return '<li><span class="ay-paso-t">' + fmt(p.t) + '</span>' +
        (p.d ? '<span class="ay-paso-d">' + fmt(p.d) + '</span>' : '') +
        irHTML(p.ir) + '</li>';
    }).join('') + '</ol>';
  }

  function verTambienHTML(ids) {
    const xs = (ids || []).map(function (id) { return TODO[id]; })
      .filter(function (x) { return !!x; });
    if (!xs.length) return '';
    return '<div class="list-title">Ver también</div>' +
      '<div class="list ay-lista">' + xs.map(function (x) {
        return '<button class="list-row tap ay-fila" data-ay="' + esc(x.id) + '">' +
          '<span class="grow"><span class="list-row-title">' + esc(titulo(x)) + '</span>' +
          '<span class="list-row-sub">' + esc(ETIQUETA[x.tipo]) + '</span></span>' +
          '<span class="chevron">' + icon('chevron') + '</span></button>';
      }).join('') + '</div>';
  }

  /* ================= el índice ================= */

  V.ayuda = function () {
    const arg = App.ruta().arg;
    if (arg) return detalle(arg);

    const hallados = busqueda ? buscar(busqueda) : null;

    const cuerpo = hallados
      ? (hallados.length
          ? grupoHTML(hallados.length === 1 ? '1 resultado' : hallados.length + ' resultados',
              hallados)
          : '<div class="card ay-nada"><p>No hay nada con «' + esc(busqueda) + '».</p>' +
            '<p class="tiny">Prueba con una palabra suelta: peso, foto, días, copia, ' +
            'internet, clave.</p></div>')
      : grupoHTML('Para empezar', PASOS.filter(function (x) { return x.primero; })) +
        grupoHTML('Cómo se hace', PASOS.filter(function (x) { return !x.primero; })) +
        grupoHTML('Cómo funciona', TEMAS) +
        grupoHTML('Preguntas frecuentes', PREGUNTAS);

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <h1>Ayuda</h1>
      <p class="muted">Cómo se hace cada cosa, cómo funciona por dentro y las dudas de
      siempre. Escrito aquí dentro: no necesita conexión.</p>

      <div class="search-wrap" style="margin:14px 0 4px">
        ${raw(icon('search'))}
        <input id="ay-q" type="search" placeholder="Buscar en la ayuda"
               value="${busqueda}" autocomplete="off">
      </div>

      ${raw(cuerpo)}`;
  };

  /* ================= una entrada ================= */

  /* El id de una rama es «entrada.rama»: así el enlace de vuelta del navegador
     funciona solo y no hay que llevar a mano por dónde iba nadie. */
  function detalle(id) {
    const punto = id.indexOf('.');
    const base = punto === -1 ? id : id.slice(0, punto);
    const rama = punto === -1 ? '' : id.slice(punto + 1);
    const x = TODO[base];

    if (!x) {
      return html`
        <button class="btn sm ghost" data-a="indice" style="margin-bottom:10px">
          ${raw(icon('back'))} Ayuda</button>
        <div class="empty"><p>Esa página de la ayuda ya no está.</p></div>`;
    }

    const r = rama ? (x.ramas || []).filter(function (y) { return y.id === rama; })[0] : null;

    const arriba = html`
      <button class="btn sm ghost" data-a="${raw(r ? 'volverbase' : 'indice')}"
              data-base="${base}" style="margin-bottom:10px">
        ${raw(icon('back'))} ${r ? esc(titulo(x)) : 'Ayuda'}</button>
      <div class="ay-de">${ETIQUETA[x.tipo]}</div>
      <h1>${r ? r.titulo : titulo(x)}</h1>`;

    /* una rama concreta */
    if (r) {
      return html`
        ${raw(arriba)}
        ${raw(r.sub ? '<p class="muted">' + esc(r.sub) + '</p>' : '')}
        ${raw(pasosHTML(r.pasos))}
        ${raw(r.cierre ? '<div class="card ay-cierre"><p>' + fmt(r.cierre) + '</p></div>' : '')}
        ${raw(verTambienHTML(r.ver || x.ver))}`;
    }

    /* una entrada con ramas: se elige primero */
    if (x.ramas) {
      return html`
        ${raw(arriba)}
        ${raw(x.intro ? '<p class="muted">' + esc(x.intro) + '</p>' : '')}
        <div class="list ay-lista" style="margin-top:12px">
          ${raw(x.ramas.map(function (y) {
            return '<button class="list-row tap ay-fila" data-ay="' + esc(base + '.' + y.id) + '">' +
              '<span class="grow"><span class="list-row-title">' + esc(y.titulo) + '</span>' +
              '<span class="list-row-sub">' + esc(y.sub) + '</span></span>' +
              '<span class="chevron">' + icon('chevron') + '</span></button>';
          }).join(''))}
        </div>
        ${raw(verTambienHTML(x.ver))}`;
    }

    /* pasos, o texto corrido */
    return html`
      ${raw(arriba)}
      ${raw(x.resumen ? '<p class="muted">' + esc(x.resumen) + '</p>' : '')}
      ${raw(x.pasos ? pasosHTML(x.pasos)
        : '<div class="ay-texto">' +
          (x.cuerpo || x.a).map(function (p) { return '<p>' + fmt(p) + '</p>'; }).join('') +
          '</div>')}
      ${raw(x.cierre ? '<div class="card ay-cierre"><p>' + fmt(x.cierre) + '</p></div>' : '')}
      ${raw(verTambienHTML(x.ver))}`;
  }

  /* ================= enganches ================= */

  V.ayuda.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=indice]', function () { go('ayuda'); });
    bind(root, '[data-a=volverbase]', function (el) { go('ayuda', el.dataset.base); });

    bindAll(root, '[data-ay]', function (el) { go('ayuda', el.dataset.ay); });

    bindAll(root, '[data-ir]', function (el) {
      App.irYHacer(el.dataset.ir, el.dataset.arg || null, el.dataset.sel || null);
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
    reiniciar: function () { busqueda = ''; }
  };
})(window);
