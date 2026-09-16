/* textos-en-ayuda.js — el manual de la app, en inglés.

   Va aparte del diccionario general porque es otra cosa: aquello son botones y
   etiquetas, y esto son ocho mil palabras de prosa. Mezclados, buscar una
   etiqueta suelta entre párrafos de manual es imposible, y cada vez que se toca
   una frase del manual el archivo de la interfaz aparece cambiado.

   Se fusiona en el mismo diccionario, así que T() no distingue de dónde viene
   cada frase. La clave sigue siendo la frase en español tal cual está escrita
   en ayuda.js: si no coincide carácter a carácter, sale en español.

   Los asteriscos marcan negrita y viajan dentro de la frase. En la traducción
   se ponen donde toque en inglés, que no tiene por qué ser la misma palabra. */
(function (g) {
  'use strict';

  const AYUDA = {

    /* ---------- la pantalla ---------- */
    'Cómo se hace cada cosa, cómo funciona por dentro y las dudas de siempre. Escrito aquí dentro: no necesita conexión.':
      'How to do each thing, how it works underneath and the usual questions. Written in here: no connection needed.',
    'Buscar en la ayuda': 'Search the help',
    'Para empezar': 'To get started',
    /* «Cómo se hace» ya está en el diccionario de la interfaz —es el botón de
       la pantalla de entrenar— con la misma traducción. Aquí es el título de
       una sección del índice, y «How to do it» le vale igual. Esta es la única
       pega de usar la frase como clave: una frase que significa dos cosas tiene
       que conformarse con una traducción. Cuando no valga, se cambia la frase
       española para que sean dos. */
    'Cómo funciona': 'How it works',
    'Preguntas frecuentes': 'Common questions',
    'Pregunta': 'Question',
    'Ver también': 'See also',
    '{n} resultado': '{n} result',
    '{n} resultados': '{n} results',
    'No hay nada con «{q}».': 'Nothing found for "{q}".',
    'Prueba con una palabra suelta: peso, foto, días, copia, internet, clave.':
      'Try a single word: weight, photo, days, backup, offline, key.',
    'Esa página de la ayuda ya no está.': 'That help page is no longer here.',

    /* ---------- los títulos y resúmenes del índice ---------- */
    'Las dos formas de entrenar': 'The two ways to train',
    'Seguir el plan o apuntar sobre la marcha': 'Follow the plan or log as you go',
    'Las tres formas de apuntar': 'The three ways to log',
    'Cuánto detalle quieres llevar, y qué se pierde con cada uno':
      'How much detail you want to keep, and what each one costs you',
    'Rutina, plan y días': 'Routine, plan and days',
    'Por qué asignar días no es cosmético': 'Why assigning days is not cosmetic',
    'La nota de tu plan': 'Your plan score',
    'De dónde sale y por qué no la pone una IA':
      'Where it comes from and why an AI does not set it',
    'El peso que aparece puesto': 'The weight that comes pre-filled',
    'Por qué a veces no es el de la última vez': 'Why it is sometimes not last time’s',
    'Reparto por zona y aviso de exceso': 'Split by area and the overload warning',
    'Lo que haces de verdad frente a lo que pide tu plan':
      'What you actually do versus what your plan asks for',
    'El menú y el cruce de fotos': 'The meal plan and photo matching',
    'Cómo sabe la app si comiste lo previsto':
      'How the app knows whether you ate what was planned',
    'La suplementación': 'Supplements',
    'Se apuntan una vez y lo usa toda la app':
      'You log them once and the whole app uses them',
    /* «Dónde entrenas» también está en el general, con la misma traducción. */
    'Por qué a veces un ejercicio no aparece': 'Why an exercise sometimes does not show up',
    'Dónde están tus datos': 'Where your data lives',
    'En tu móvil, y en la nube solo si tú quieres':
      'On your phone, and in the cloud only if you want',
    'El entrenador con IA': 'The AI coach',
    'Opcional, con tu clave, y nunca donde debe haber una regla':
      'Optional, with your own key, and never where a rule belongs',
    'Entrenar sin internet': 'Training offline',
    'Qué hay que bajar antes y qué no hace falta':
      'What to download beforehand and what you do not need',

    /* ---------- crear una rutina ---------- */
    'Crear una rutina': 'Create a routine',
    'A mano o con la app': 'By hand or with the app',
    'Hay dos caminos y no se parecen en nada. Elige el tuyo:':
      'There are two routes and they are nothing alike. Pick yours:',
    'La monto yo': 'I build it myself',
    'Eliges tú cada ejercicio, uno a uno': 'You pick every exercise, one by one',
    'Abre el editor de rutina nueva.': 'Open the new routine editor.',
    'Está en Rutinas › *Crear la mía*. Se abre una ficha vacía.':
      'It is under Routines › *Build my own*. A blank sheet opens.',
    'Abrir una rutina nueva': 'Open a new routine',
    'Ponle nombre.': 'Give it a name.',
    'El que te sirva a ti para reconocerla de un vistazo: «Pierna dura», «Lunes de espalda», «La corta de casa». Si vas a montar un plan de varios días, usa el mismo nombre de plan en todas para que la app las lea como una semana.':
      'Whatever lets you recognise it at a glance: "Heavy legs", "Monday back", "The short one at home". If you are building a multi-day plan, use the same plan name on all of them so the app reads them as one week.',

    /* ---------- el resto de títulos y resúmenes del índice ---------- */
    'Entrenar hoy': 'Train today',
    'Seguir lo que toca, serie a serie': "Follow what's on, set by set",
    'Instalar la app en el móvil': 'Install the app on your phone',
    'Para que arranque como una app y no como una página':
      'So it launches like an app and not a web page',
    'Cambiar los días de una rutina': 'Change a routine’s days',
    'Mover el plan sin rehacerlo': 'Move the plan without rebuilding it',
    'Registrar un entrenamiento libre': 'Log a free workout',
    'Apuntar lo que no estaba en ningún plan': 'Log what was on no plan at all',
    'Pasar tu plan por la auditoría': 'Run your plan through the audit',
    'Qué falla y cómo arreglarlo de una vez': 'What is wrong and how to fix it in one go',
    'Apuntar una comida con foto': 'Log a meal with a photo',
    'Y cruzarla con tu menú': 'And match it to your meal plan',
    'Apuntar lo que tomas': 'Log what you take',
    'Y que se creen las alertas solas': 'And have the reminders create themselves',
    'Decir de qué país eres': 'Say what country you are from',
    'Para que el menú salga de tu supermercado':
      'So your meal plan comes from your supermarket',
    'Poner las horas de tus comidas': 'Set your meal times',
    'Para que el cruce acierte': 'So the matching gets it right',
    'Activar el entrenador con IA': 'Turn on the AI coach',
    'Elegir proveedor y guardar tu clave': 'Pick a provider and save your key',
    'Que la app te cree las alertas sola': 'Have the app create your reminders itself',
    'Todas de una vez, con tus horas calculadas':
      'All at once, with your times worked out',
    'Llevar los recordatorios al calendario': 'Send your reminders to the calendar',
    'Para que suenen con la app cerrada': 'So they fire with the app closed',
    'Quitar los recordatorios del calendario': 'Remove the reminders from the calendar',
    'Sin buscarlos uno a uno': 'Without hunting them down one by one',
    'Guardar una copia de tus datos': 'Save a backup of your data',
    'El archivo que no depende de nadie': 'The file that depends on nobody',
    'Dejarla lista para un gimnasio sin cobertura':
      'Get it ready for a gym with no signal',
    'Descargar lo que pesa, antes de ir': 'Download the heavy stuff before you go',

    /* ---------- las preguntas ---------- */
    '¿Cuánto cuesta la app?': 'What does the app cost?',
    '¿Dónde se guardan mis datos?': 'Where is my data stored?',
    '¿Pierdo todo si cambio de móvil o borro la app?':
      'Do I lose everything if I change phone or delete the app?',
    '¿Funciona sin internet?': 'Does it work offline?',
    '¿Puedo entrenar sin crear ningún plan?': 'Can I train without creating a plan?',
    '¿Por qué no encuentro un ejercicio que sé que existe?':
      'Why can I not find an exercise I know exists?',
    '¿Por qué el peso que sale no es el que puse la última vez?':
      'Why is the weight shown not the one I used last time?',
    '¿Por qué hay repeticiones en color ámbar?': 'Why are some reps in amber?',
    '¿Por qué no me sale ningún récord?': 'Why do no records show up?',
    '¿Por qué mi plan saca esa nota?': 'Why does my plan get that score?',
    '¿Por qué mi foto no se cruzó con el menú?':
      'Why did my photo not match the meal plan?',
    '¿La app cuenta lo que me aportan los suplementos?':
      'Does the app count what my supplements give me?',
    '¿Y si tomo algo varias veces al día?': 'What if I take something several times a day?',
    '¿La app me dice qué suplementos tomar?': 'Does the app tell me which supplements to take?',
    '¿Por qué el aviso de comer dice «toca desayunar» y las calorías?':
      'Why does the meal reminder say "time for breakfast" and give calories?',
    '¿Cómo distingo en mi calendario los avisos de la app?':
      'How do I tell the app’s events apart in my calendar?',
    '¿Por cuánto tiempo se ponen los avisos en el calendario?':
      'How long are the calendar events set for?',
    '¿El calendario se actualiza solo si cambio una alerta?':
      'Does the calendar update itself if I change a reminder?',
    '¿Por qué me pregunta si tomo medicación al crear un menú?':
      'Why does it ask whether I take medication when creating a meal plan?',
    '¿Por qué me propone comida que no encuentro?':
      'Why does it suggest food I cannot find?',
    'Si quito un suplemento, ¿se va también su alerta?':
      'If I remove a supplement, does its reminder go too?',
    'Si cambio una hora de comer, ¿se mueve la alerta?':
      'If I change a meal time, does the reminder move?',
    '¿El aviso de comer cambia cada día con el menú?':
      'Does the meal reminder change each day with the plan?',
    'Si llevo al calendario una alerta con varias horas, ¿suena en todas?':
      'If I send a reminder with several times to the calendar, does it fire at all of them?',
    '¿Por qué ya no me sale la alerta de comer antes de entrenar?':
      'Why has the pre-workout meal reminder stopped appearing?',
    '¿Por qué el aviso de comer me sale cortado?':
      'Why does my meal reminder look cut off?',
    'Si vuelvo a pulsar «Automáticas», ¿se me duplican las alertas?':
      'If I hit "Automatic" again, do my reminders get duplicated?',
    '¿Las calorías que me da son exactas?': 'Are the calories it gives me exact?',
    '¿Puedo usar libras en vez de kilos?': 'Can I use pounds instead of kilos?',
    '¿Por qué me pide actualizar tan a menudo?': 'Why does it ask me to update so often?',

    /* ---------- Las dos formas de entrenar ---------- */
    'Hay dos maneras y cuentan exactamente igual.':
      'There are two ways and they count exactly the same.',
    '*Seguir una rutina*: la app te lleva serie a serie, con el peso ya propuesto, las repeticiones y el descanso contado solo. Es lo que sale en el botón grande de la portada cuando hoy te toca algo.':
      '*Following a routine*: the app walks you through set by set, with the weight already suggested, the reps, and the rest timed for you. It is what the big button on the home screen offers when something is due today.',
    '*Entrenamiento libre*: empiezas con la hoja en blanco y vas añadiendo lo que haces. Sirve para el día que improvisas, para el gimnasio del hotel o para apuntar algo que hiciste y no estaba en ningún plan.':
      '*Free workout*: you start with a blank sheet and add what you do as you go. It is for the day you improvise, for the hotel gym, or to log something you did that was on no plan.',
    'Las dos alimentan lo mismo: historial, récords, volumen levantado, reparto por zona y constancia. El libre no es un modo de segunda.':
      'Both feed the same things: history, records, volume lifted, split by area and consistency. Free workouts are not a second-class mode.',
    'En la portada, si ya has entrenado hoy, la app te lo dice y te deja solo el libre: ofrecerte empezar otra vez lo que ya has hecho no tiene sentido.':
      'On the home screen, if you have already trained today the app says so and leaves only the free option: offering to start again what you have just done makes no sense.',

    /* ---------- Las tres formas de apuntar ---------- */
    'En Ajustes eliges cuánto apuntas de cada ejercicio, y eso cambia la pantalla de entrenamiento entera.':
      'In Settings you choose how much you log for each exercise, and that changes the whole workout screen.',
    '*Peso y repeticiones*: anotas cada serie. Es el único que da récords, volumen levantado, gráficas de peso y progresión de cargas, porque son las cuatro cosas que necesitan un número.':
      '*Weight and reps*: you log every set. It is the only one that gives records, volume lifted, weight charts and load progression, because those four things need a number.',
    '*Marcar cada serie*: la app te propone el objetivo —3 × 12— y tú solo marcas las que vas haciendo. Cada serie lleva un *más y un menos* para apuntar las repeticiones que de verdad sacaste, y cuando el número no coincide con lo que pedía la rutina se pone en ámbar: así se ve de un vistazo en qué serie te quedaste corto. El peso es opcional: si lo pones cuenta, y si no, no.':
      '*Ticking off each set*: the app suggests the target \u2014 3 \u00d7 12 \u2014 and you just tick off the ones you do. Each set has a *plus and a minus* to log the reps you actually got, and when the number differs from what the routine asked for it turns amber: you can see at a glance which set you fell short on. Weight is optional: if you put it in it counts, and if not, it does not.',
    '*Marcar el ejercicio y ya*: un botón por ejercicio y a otra cosa. Ni peso, ni repeticiones, ni series.':
      '*Just tick off the exercise*: one button per exercise and move on. No weight, no reps, no sets.',
    'Lo que se pierde al bajar de detalle no es la app, es la medida: sin peso apuntado no hay récords ni volumen, y el progreso se mide por series y entrenamientos hechos. Por eso, en los modos sin peso, la pantalla no te enseña récords: un récord de cero kilos no es un récord.':
      'What you lose by dropping detail is not the app, it is the measurement: with no weight logged there are no records and no volume, and progress is measured in sets and completed workouts. That is why, in the modes without weight, the screen shows you no records: a zero-kilo record is not a record.',
    'Se puede cambiar cuando quieras, y lo ya apuntado se queda como está.':
      'You can change it whenever you like, and what you have already logged stays as it is.',

    /* ---------- Rutina, plan y días ---------- */
    'Una *rutina* es una lista de ejercicios con sus series y sus repeticiones.':
      'A *routine* is a list of exercises with their sets and reps.',
    'Un *plan* es un conjunto de rutinas con días de la semana puestos. Las rutinas que comparten nombre de plan se leen juntas como una semana.':
      'A *plan* is a group of routines with days of the week assigned. Routines that share a plan name are read together as one week.',
    'Poner los días cambia lo que la app puede saber de ti: qué te toca hoy en la portada, cuántas series por semana haces de cada zona, si el reparto está equilibrado y qué nota saca el plan.':
      'Assigning days changes what the app can know about you: what is due today on the home screen, how many sets a week you do per area, whether the split is balanced and what score the plan gets.',
    'Sin días asignados no hay una semana que contar, y media app se queda muda: la portada no sabe qué ofrecerte y la auditoría no tiene nada que auditar.':
      'With no days assigned there is no week to count, and half the app goes quiet: the home screen does not know what to offer you and the audit has nothing to audit.',
    'Si sigues más de un plan a la vez, marca uno como *plan principal*: en «hoy» solo salen sus rutinas, y las cuentas semanales se hacen con él. Los demás siguen guardados.':
      'If you follow more than one plan at a time, mark one as your *main plan*: only its routines show up under "today", and the weekly maths is done with it. The rest stay saved.',

    /* ---------- La nota de tu plan ---------- */
    'La auditoría son *reglas fijas*, no una opinión. Se comprueba, una por una:':
      'The audit is *fixed rules*, not an opinion. Each one is checked, one by one:',
    'El *volumen* de cada músculo, para ver si alguno se queda por debajo del mínimo semanal. Los *patrones de movimiento* que faltan: un plan sin ninguna tracción vertical está cojo aunque tenga veinte ejercicios. Los *ejercicios repetidos* entre días. Si hay *dos básicos pesados* el mismo día, que dejan la espalda baja frita para el segundo.':
      'The *volume* on each muscle, to see whether any falls below the weekly minimum. The *movement patterns* that are missing: a plan with no vertical pull is lame even with twenty exercises. *Repeated exercises* across days. Whether there are *two heavy compounds* on the same day, which leave your lower back fried for the second one.',
    'El *orden* dentro de la sesión, porque un básico detrás de tres aislamientos se hace con lo que queda. Si algún ejercicio está en el *día equivocado*: un movimiento pesado de tren inferior entre los tres primeros de un día de empuje se lleva la fuerza que necesitaba el press. Los *descansos* demasiado cortos para lo que pesa el ejercicio. El *material* que de verdad tienes. Y tus *limitaciones*, si has dicho alguna.':
      'The *order* within the session, because a compound after three isolations gets done with whatever is left. Whether any exercise is on the *wrong day*: a heavy lower-body movement among the first three of a push day takes the strength the press needed. *Rest periods* too short for how heavy the exercise is. The *equipment* you actually have. And your *limitations*, if you have mentioned any.',
    'Se parte de un 10 y cada fallo resta según lo gordo que sea. Un 6 no es un suspenso: es una lista de cosas concretas, y casi todas vienen con el arreglo hecho para aplicarlo de una vez.':
      'It starts from 10 and each fault subtracts according to how serious it is. A 6 is not a fail: it is a list of specific things, and nearly all of them come with the fix ready to apply in one go.',
    'Es con reglas y no con IA a propósito: una regla da siempre la misma respuesta —la misma rutina saca siempre la misma nota— y funciona en el gimnasio sin cobertura. La IA entra después, si la tienes, para lo que sí es opinión.':
      'It is rules and not AI on purpose: a rule always gives the same answer \u2014 the same routine always gets the same score \u2014 and it works in a gym with no signal. The AI comes in afterwards, if you have it, for what genuinely is opinion.',

    /* ---------- El peso que aparece puesto ---------- */
    'Antes la app dejaba puesto el peso de la última vez. Eso no es progresar, es repetir.':
      'The app used to leave last time\u2019s weight in place. That is not progressing, it is repeating.',
    'Ahora lo decide con lo que ya tienes apuntado, y te dice cuál de los tres casos es antes de empezar la serie:':
      'Now it decides from what you have already logged, and tells you which of the three cases it is before you start the set:',
    '*Subes* si la última vez sacaste todas las series con las repeticiones pedidas. *Repites* si te quedaste corto: el mismo peso hasta sacarlo entero. *Bajas* un 10 % si llevas tres sesiones seguidas sin sacarlo al mismo peso, para cogerle la técnica y volver a subir.':
      '*You go up* if last time you got every set with the reps asked for. *You repeat* if you fell short: the same weight until you get it all. *You go down* 10% if you have gone three sessions in a row without getting it at the same weight, so you can get the technique back and climb again.',
    'Dos veces cortas no bastan para bajar: un mal día o una mala noche le pasa a cualquiera, y bajar ahí desanima por nada. Tres seguidas ya no es mala suerte.':
      'Two short attempts are not enough to drop the weight: a bad day or a bad night happens to anyone, and dropping there is discouraging for nothing. Three in a row is no longer bad luck.',
    'Con peso corporal o con bandas no dice nada: ahí se progresa en repeticiones y eso ya lo lleva la propia rutina. Y el número siempre se puede cambiar a mano: es una propuesta, no una orden.':
      'With bodyweight or bands it says nothing: there you progress in reps and the routine already handles that. And the number can always be changed by hand: it is a suggestion, not an order.'
  };

  /* Se fusiona con el general. Si alguna frase estuviera en los dos —no debería,
     pero es el fallo que no avisa— manda la que ya estaba: el diccionario
     general es el de la interfaz y es el que se mira primero al depurar. */
  g.TEXTOS_EN = g.TEXTOS_EN || {};
  Object.keys(AYUDA).forEach(function (k) {
    if (!Object.prototype.hasOwnProperty.call(g.TEXTOS_EN, k)) g.TEXTOS_EN[k] = AYUDA[k];
  });
})(window);
