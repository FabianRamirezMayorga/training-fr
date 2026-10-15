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
    /* «Cómo funciona» vive ahora en el diccionario de la interfaz, que es el
       que manda al fusionar. Se quita de aquí para que haya una sola. */
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

    'Los dos pasos al crear tu cuenta': 'The two steps when you create your account',
    'Tus datos y, si quieres, las dos conexiones': 'Your details and, if you want, the two connections',
    'Recién creada la cuenta, la app te lleva por dos pantallas antes de soltarte. No son un trámite: son lo que separa una app que calcula lo tuyo de una que enseña números genéricos.': 'With your account just created, the app walks you through two screens before letting you go. They are not paperwork: they are what separates an app that works out your numbers from one that shows generic ones.',
    'Rellena tus datos.': 'Fill in your details.',
    'Sexo, edad, altura y peso son los cuatro con los que se calcula todo lo demás: tus calorías, tus macros, el IMC y lo que te propongo entrenar. El resto de esa pantalla —país, sueño, actividad diaria, limitaciones— afina el menú y las rutinas, y se puede rellenar otro día.': 'Sex, age, height and weight are the four everything else is worked out from: your calories, your macros, your BMI and what I suggest you train. The rest of that screen —country, sleep, daily activity, limitations— fine-tunes the meal plan and the routines, and can wait for another day.',
    'Abrir mis datos': 'Open my details',
    'Mira las dos conexiones.': 'Look at the two connections.',
    'El entrenador con IA y la música. Las dos son gratis, las dos van con una clave tuya y las dos son opcionales de verdad: el catálogo, las rutinas, el cronómetro, el historial y las estadísticas funcionan sin ninguna de ellas.': 'The AI coach and the music. Both are free, both run on a key of your own, and both are genuinely optional: the catalogue, the routines, the timer, your history and the stats all work without either.',
    'Y ya está.': 'And that is it.',
    'De ahí sales a la app normal, a crear tus rutinas.': 'From there you land in the app proper, ready to build your routines.',
    'Puedes salirte a mitad cuando quieras, que la barra de abajo sigue funcionando: la guía se queda pendiente y te espera en la portada, con un aviso que la retoma por donde ibas. Y si entras en otro móvil con la misma cuenta no te sale nada, porque tus datos llegan con la sincronización antes de que la app pregunte.': 'You can step out halfway whenever you like —the bottom bar still works—: the guide stays pending and waits for you on the home screen, with a notice that picks it up where you left it. And if you sign in on another phone with the same account nothing shows up, because your details arrive with the sync before the app asks.',

    'El entrenador con IA no me contesta, ¿qué miro?':
      'The AI coach is not answering. What should I check?',
    'Lo que te salga escrito dice cuál de las cuatro cosas es. No hay una quinta.':
      'Whatever message you get tells you which of the four it is. There is no fifth.',
    '*No se pudo conectar con el servicio de IA.* La petición no llegó ni a salir del móvil. No es tu clave: es la red. Los wifis de oficina, las VPN de empresa, algunas operadoras y los bloqueadores de contenido del navegador cortan las llamadas a Google. Pruébalo con otra red —datos si estabas en wifi, o al revés— y, si usas bloqueador, apágalo un momento. Para salir de dudas, abre en el navegador *generativelanguage.googleapis.com/v1beta/models?key=TU_CLAVE*: si eso carga texto, la red va bien y el que corta es el bloqueador.':
      '*Could not reach the AI service.* The request never even left your phone. It is not your key: it is the network. Office Wi-Fi, company VPNs, some carriers and browser content blockers cut off calls to Google. Try another network —mobile data if you were on Wi-Fi, or the other way round— and, if you use a blocker, switch it off for a moment. To settle it, open *generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY* in your browser: if that loads text, the network is fine and the blocker is what is cutting in.',
    '*La clave de la IA no es válida.* Google la rechaza. O se borró en AI Studio, o el proyecto se quedó sin permisos, o la clave tiene puestas restricciones de sitio web y no incluye el de la app. Haz una nueva y pégala en la bóveda.':
      '*The AI key is not valid.* Google is rejecting it. Either it was deleted in AI Studio, or the project lost its permissions, or the key has website restrictions that do not include the app. Make a new one and paste it into the vault.',
    '*Has agotado la cuota.* Es lo normal con la capa gratuita. El límite por minuto se repone en un minuto; el diario, al día siguiente. Si tienes otro proveedor puesto, cambia a él mientras.':
      '*You have used up your quota.* That is normal on the free tier. The per-minute limit comes back in a minute; the daily one, the next day. If you have another provider set up, switch to it meanwhile.',
    '*El modelo ya no está disponible* o *ningún modelo respondió*. Google retira modelos por cuenta, no para todos a la vez. Abre la bóveda y pulsa *Ver los suyos*: la app le pregunta a Google qué admite tu clave y se queda con esos.':
      '*The model is no longer available* or *no model answered*. Google retires models account by account, not for everyone at once. Open the vault and tap *See yours*: the app asks Google which ones your key accepts and keeps those.',
    'Y pase lo que pase, la app entera sigue funcionando sin la IA. Lo que se calcula con reglas —el peso de hoy, la nota del plan, el reparto por zona— no se entera de nada.':
      'And whatever happens, the whole app keeps working without the AI. Everything worked out by rules —today’s weight, the plan’s score, the split by area— never notices.',
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
    'Apunté una actividad sin cobertura, ¿se pierde el cálculo?':
      'I logged an activity with no signal — do I lose the calculation?',
    'No. Se guarda con lo que la app sabe por sus propias reglas: el día, los minutos y, si reconoce lo que escribiste, la actividad con los músculos que mueve. Eso ya cuenta en tu historial, en tu racha y en el reparto por zona desde ese momento.':
      'No. It is saved with what the app knows from its own rules: the day, the minutes and, if it recognises what you wrote, the activity with the muscles it moves. That already counts towards your history, your streak and your split by area from that moment on.',
    'Lo que no puede hacer sin red es preguntarle a la IA cuánto cuesta eso de verdad. Y ahí está la diferencia: «subí a Monserrate andando» con la regla es una caminata, y con la IA son setecientos metros de desnivel.':
      'What it cannot do without a connection is ask the AI what that really costs. And that is where the difference is: “I walked up Monserrate” is a stroll by the rule, and seven hundred metres of climb by the AI.',
    'Así que queda marcado. En el historial verás *A falta de afinar con internet* debajo de ese apunte. En cuanto vuelva la cobertura —al recuperarla con la app abierta, o la próxima vez que la abras— la app lo repasa sola, recalcula las calorías y los músculos, y te avisa de cuántos apuntes ha afinado.':
      'So it is flagged. In your history you will see *Waiting on internet to be fine-tuned* under that entry. As soon as you have signal again —either while the app is open or the next time you open it— the app goes over it on its own, recalculates the calories and the muscles, and tells you how many entries it has fine-tuned.',
    'Lo que pusiste tú no se toca nunca: ni el día, ni los minutos, ni el nombre. Lo que se rellena es lo que la app había estimado a ojo.':
      'What you put in is never touched: not the day, not the minutes, not the name. What gets filled in is what the app had estimated by eye.',
    'Si la IA acaba diciendo que eso no era una actividad física, se le quita la marca y se queda como lo apuntaste. No se te va a quedar preguntando lo mismo cada vez que haya red.':
      'If the AI ends up saying that was not physical activity, the flag comes off and it stays as you logged it. It is not going to keep asking the same thing every time you get a connection.',
    '¿Puedo ver qué entrené un día concreto?':
      'Can I see what I trained on a particular day?',
    'Sí. En Progreso, en el mapa de *Constancia*, toca el cuadro de ese día: te sale la rutina que hiciste, los músculos que movió y lo que levantaste, serie a serie.':
      'Yes. In Progress, on the *Consistency* map, tap that day\'s square: you get the routine you did, the muscles it moved and what you lifted, set by set.',
    'Los días en blanco no se abren, porque no hay nada que enseñar.':
      'Blank days do not open, because there is nothing to show.',
    'Funciona igual con la tira de la semana y con la rejilla de los meses: son el mismo mapa dibujado de dos maneras, según el periodo que tengas puesto arriba.':
      'It works the same on the week strip and on the month grid: they are the same map drawn two ways, depending on the period you have set at the top.',
    'Si lo que quieres es recorrer varias semanas seguidas en vez de mirar un día suelto, eso está en el historial, al final de esa misma pantalla.':
      'If what you want is to go through several weeks in a row rather than look at one day, that is in the history, at the bottom of that same screen.',
    '¿Por qué Progreso me abre en la semana?':
      'Why does Progress open on the week?',
    'Porque al entrar la pregunta suele ser «¿cómo voy?», y eso es lo de estos días. Con tres meses por delante, una semana buena o mala no se nota en la curva y el mapa sale casi entero en gris.':
      'Because when you come in the question is usually “how am I doing?”, and that means these last few days. With three months in front of you, a good or a bad week does not show in the curve and the map comes out almost all grey.',
    'El mando de arriba cambia el periodo, y manda sobre toda la pantalla: la gráfica, la constancia, el reparto por zona y las cuatro cifras de arriba. La racha no, que una racha es de hoy y no de un periodo.':
      'The control at the top changes the period, and it rules the whole screen: the chart, the consistency map, the split by area and the four figures at the top. Not the streak, because a streak is about today and not about a period.',
    'Lo que elijas dura mientras tengas la app abierta. Al volver a entrar arranca otra vez por la semana.':
      'Whatever you pick lasts as long as you keep the app open. Next time you come in it starts on the week again.',
    '¿Puedo apuntar una comida con foto sin internet?':
      'Can I log a meal by photo with no internet?',
    'Apuntarla no, porque quien lee la foto es la IA y la IA vive fuera del móvil. La app te lo dice en cuanto lo intentas, en vez de dejarte con una rueda girando.':
      'Logging it, no, because the one reading the photo is the AI and the AI lives outside your phone. The app tells you as soon as you try, instead of leaving you with a spinner going round.',
    'Pero no tienes que renunciar al plato: hazle la foto con la cámara del móvil, como una foto cualquiera, y cuando vuelvas a tener cobertura tócala desde *Foto de lo que comes* y elígela de la galería.':
      'But you do not have to give up on the plate: photograph it with your phone camera, like any other photo, and when you have signal again tap *Photo of what you eat* and pick it from your gallery.',
    'Se apunta a la hora en que la hiciste y no a la hora en que la subes, así que se cruza con la comida que tocaba. Eso vale para las fotos del mismo día: una de ayer se apunta como de hoy.':
      'It is logged at the time you took it and not at the time you upload it, so it is matched against the meal that was due. That holds for photos from the same day: one from yesterday is logged as today.',
    'Lo demás de la app sí va sin conexión: apuntar a mano, el agua, el entrenamiento y el historial. Lo único que necesita internet es lo que pasa por la IA.':
      'The rest of the app does work offline: logging by hand, your water, your training and your history. The only thing that needs the internet is whatever goes through the AI.',
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
    '¿Por qué la IA dice que lo de ayer son 6 series y no me las suma?':
      'Why does the AI say yesterday was 6 sets and then not add them up?',
    'Porque una cosa es hacerte una idea y otra apuntar un dato. Que el partido de ayer te deje la pierna cargada se sabe: lo trabajaste y está apuntado. Cuántas series de gimnasio vale ese partido no lo sabe nadie —depende de cómo jugaste— y la IA te da un número aproximado para que sepas con qué cuerpo llegas hoy.':
      'Because getting an idea of something is one thing and logging a figure is another. That yesterday\u2019s match left your legs loaded is known: you worked them and it is logged. How many gym sets that match is worth nobody knows —it depends on how you played— and the AI gives you a rough number so you know what body you are turning up with today.',
    'Si ese número entrara en el reparto por zona, tu gráfica de pierna subiría sin que hayas hecho una sola serie, y la semana que juegues dos partidos parecería mejor que la que entrenaste de verdad. Dejarías de poder comparar una semana con otra, que es para lo único que sirve esa cifra.':
      'If that number went into the split by area, your leg chart would go up without you having done a single set, and the week you play two matches would look better than the one you actually trained. You would no longer be able to compare one week against another, which is the only thing that figure is for.',
    'Por eso va en otro color y en una frase suelta: es contexto para hoy, no un dato de tu historial.':
      'That is why it is a different colour and a sentence of its own: it is context for today, not a figure in your history.',
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
    'En la portada, «Tu semana» son los últimos quince días con tres puntos cada uno: si entrenaste, si llegaste a la proteína y si bebiste el agua. Se rueda con el dedo y siempre abre en hoy, vengas de donde vengas. Mira hacia atrás y no hacia delante a propósito: un lunes, la semana que viene está vacía y no cuenta nada. Toca cualquier día y te cuenta qué pasó ese día: qué entrenaste y qué músculos movió, cuánta agua bebiste y cuánta proteína y cuántas calorías comiste, cada una con su objetivo al lado. Los puntos dicen si llegaste; esto dice por cuánto. Y el número del día habla solo del entreno: verde si entrenaste, tocara o no —un entrenamiento libre un sábado suelto también se ve—; rojo el día que pedía entreno y no lo hubo; y gris el día que no pedía nada y descansaste, que un domingo de descanso no es un día fallado. El agua y la proteína no le cambian el color: tienen su punto, que es donde se cuentan. El contador de al lado cuenta justo eso, para que diga lo mismo que estás viendo: en cuántos de esos quince días entrenaste. Son días y no sesiones, así que dos entrenos el mismo sábado son un día, no dos. Hoy se queda neutro hasta que termine. Es la misma tira que en *Ver mi día*, donde además está explicada.':
      'On the home screen, “Your consistency” is the last fifteen days with three dots each: whether you trained, whether you hit your protein and whether you drank your water. You scroll it with your finger and it always opens on today, wherever you come from. It looks back and not forward on purpose: on a Monday, the week ahead is empty and says nothing. Tap any day and it tells you what happened that day: what you trained and which muscles it moved, how much water you drank and how much protein and how many calories you ate, each with its target next to it. The dots say whether you got there; this says by how much. And the day number speaks only about training: green if you trained, whether it was due or not —a free workout on an odd Saturday shows up too—; red for a day that asked for training and got none; and grey for a day that asked for nothing and you rested, because a rest Sunday is not a failed day. Water and protein do not change its colour: they have their own dot, which is where they are counted. The counter next to it counts exactly that, so it says the same thing you are looking at: how many of those fifteen days you trained. It counts days and not sessions, so two workouts on the same Saturday are one day, not two. Today stays neutral until it is over. It is the same strip as in *See my day*, where it is also explained.',
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
      'With bodyweight or bands it says nothing: there you progress in reps and the routine already handles that. And the number can always be changed by hand: it is a suggestion, not an order.',

    /* ---------- Reparto por zona y aviso de exceso ---------- */
    'En Progreso, zona por zona, ves las series por semana que haces de verdad y una marca con lo que pide tu plan.':
      'In Progress, area by area, you see the sets per week you actually do and a marker for what your plan asks for.',
    'La app avisa por defecto —una zona que se queda corta— y también por exceso, que es lo que casi nadie mira.':
      'The app warns you when an area falls short \u2014 and also when it goes over, which is the one almost nobody watches.',
    'El aviso de exceso salta si una zona pasa de *veinte series por semana* y además no está subiendo peso. Por encima de veinte, lo que se añade suele ser fatiga y no músculo; si encima ningún ejercicio de esa zona ha subido de peso en el periodo, no estás entrenando duro, estás cavando.':
      'The overload warning fires if an area goes past *twenty sets a week* and is not adding weight. Above twenty, what you add tends to be fatigue rather than muscle; and if on top of that no exercise for that area has gone up in weight over the period, you are not training hard, you are digging.',
    'Si pasa de veinte pero sí estás subiendo, te lo dice en verde: es mucho, pero te lo estás recuperando, y no hay nada que corregir.':
      'If it goes past twenty but you are going up, it says so in green: it is a lot, but you are recovering from it, and there is nothing to fix.',
    'No se mide contra tu plan, se mide contra lo que sirve para crecer. Tu plan puede estar mal escrito, y entonces el que está mal es el plan, no lo que haces.':
      'It is not measured against your plan, it is measured against what actually builds muscle. Your plan can be badly written, and then it is the plan that is wrong, not what you are doing.',

    /* ---------- El menú y el cruce de fotos ---------- */
    'Tus calorías y tu proteína salen de tus datos: sexo, peso, altura, edad, actividad y objetivo.':
      'Your calories and protein come from your data: sex, weight, height, age, activity and goal.',
    'El día está partido en cuatro franjas —desayuno, almuerzo, merienda y cena— y *las horas las pones tú*, porque la hora a la que desayuna cada uno no es la misma. Cada franja llega hasta la hora de la siguiente, así que con cuatro horas queda el día entero repartido.':
      'The day is split into four windows \u2014 breakfast, lunch, afternoon snack and dinner \u2014 and *you set the times*, because nobody has breakfast at the same hour. Each window runs until the next one starts, so four times cover the whole day.',
    'Cuando subes una foto dentro de la franja del desayuno, la app la cruza con el desayuno de tu menú: te dice si comiste lo previsto o algo distinto, y cuánta proteína o cuántas calorías te has dejado o te has pasado.':
      'When you upload a photo inside the breakfast window, the app matches it to the breakfast on your plan: it tells you whether you ate what was planned or something else, and how much protein or how many calories you are short or over by.',
    'Si la hora de la foto no cae en ninguna franja, busca la comida del menú más cercana dentro de dos horas y media. Si tampoco, la apunta sin cruzar y no se inventa nada.':
      'If the photo\u2019s time falls in no window, it looks for the nearest meal on the plan within two and a half hours. If there is none, it logs it unmatched and invents nothing.',
    'Lo que quedó sin cruzar no se pierde: la app te ofrece cruzarlo después con las fotos que ya tienes apuntadas.':
      'What went unmatched is not lost: the app offers to match it later against the photos you have already logged.',

    /* ---------- La suplementación ---------- */
    'En Perfil › Suplementación apuntas qué tomas, cuánto, cada cuánto y en qué momento. A partir de ahí no hay que repetirlo en ningún otro sitio.':
      'In Profile › Supplements you log what you take, how much, how often and at what moment. From then on you never have to repeat it anywhere else.',
    '*Las alertas se crean solas*, con el nombre y la dosis puestos. Las que caen a la misma hora van en un solo aviso: tres notificaciones seguidas a las ocho para tres botes del mismo cajón es ruido, y el ruido acaba silenciándose entero.':
      '*The reminders create themselves*, with the name and dose already in. Ones falling at the same time go into a single alert: three notifications in a row at eight for three tubs from the same drawer is noise, and noise ends up being silenced altogether.',
    '*El momento no guarda una hora*, guarda que es «con el desayuno» o «después de entrenar». La hora sale de tus horas de comer y de la hora a la que entrenas de verdad, así que si mueves el desayuno de las ocho a las seis, la creatina se mueve sola.':
      '*The moment does not store a time*, it stores that it is "with breakfast" or "after training". The time comes from your meal times and from the hour you actually train, so if you move breakfast from eight to six, the creatine moves itself.',
    '*Lo que aportan cuenta*: un batido de proteína son unas 120 kcal y 24 g, y el menú los descuenta en vez de pedírtelos otra vez en comida.':
      '*What they contribute counts*: a protein shake is around 120 kcal and 24 g, and your meal plan deducts them instead of asking you for them again in food.',
    '*Y la IA lo sabe*: al montarte un menú no te propone lo que ya tomas, y si una toma va con una comida concreta la menciona ahí en vez de inventar otra.':
      '*And the AI knows*: when building your meal plan it does not suggest what you already take, and if a dose goes with a particular meal it mentions it there instead of inventing another one.',
    'Las frecuencias que hay: todos los días, los días que entrenas —sale de los días de tu plan—, un día sí y otro no, un día a la semana, y *varias veces al día*.':
      'The frequencies available: every day, training days \u2014 taken from your plan\u2019s days \u2014 every other day, one day a week, and *several times a day*.',
    'Lo de varias veces al día se reparte de tres maneras, y primero se elige por cuál: *por reloj*, *con tus comidas* o *a mano*. Dentro de cada una solo están las suyas, con las horas que salen con tus datos escritas debajo de cada opción, así que se ve lo que va a pasar antes de elegirlo.':
      'Several times a day splits three ways, and you pick which one first: *by the clock*, *with your meals* or *by hand*. Inside each one there are only its own options, with the times your data produces written under each, so you can see what will happen before choosing it.',
    '*Por reloj* es cada 4, 6, 8 o 12 horas, arrancando a la hora que digas y cortando en la cena, que nadie quiere el magnesio a las tres de la mañana. *Con tus comidas* es antes, con o después de cada una, y entonces las tomas se mueven si mueves una comida. *A mano* es para lo que no sigue ningún patrón —lo que manda una receta, o los turnos de quien no come a las mismas horas—: ahí pones cada hora una a una.':
      '*By the clock* is every 4, 6, 8 or 12 hours, starting at whatever time you say and stopping at dinner, because nobody wants magnesium at three in the morning. *With your meals* is before, with or after each one, and then the doses move if you move a meal. *By hand* is for what follows no pattern \u2014 what a prescription dictates, or the shifts of someone who does not eat at the same times \u2014 there you set each hour one by one.',
    'No confundir *a mano* con *hora puntual*: hora puntual es UNA hora, para algo que se toma una vez al día; a mano son VARIAS horas sueltas dentro del mismo día.':
      'Do not confuse *by hand* with *a set time*: a set time is ONE hour, for something taken once a day; by hand is SEVERAL separate hours within the same day.',
    '*Las horas se ponen siempre en una rueda*, como la del reloj del móvil: la de «a mano», la de «hora puntual» y la de «empezando a las». Antes eran el campo de hora del navegador, que en el móvil abre la rueda del sistema encima de todo y tapa la ficha justo cuando hay que mirarla.':
      '*Times are always set on a wheel*, like your phone\u2019s clock: the one for "by hand", the one for "a set time" and the one for "starting at". They used to be the browser\u2019s time field, which on a phone opens the system wheel over everything and covers the sheet exactly when you need to look at it.',
    '*Lo que aportan lo calcula el entrenador solo*, en cuanto apuntas algo, y lo verás en «Lo que suman a tu día». Sumarlo a mano salía mal: no contaba lo que escribes tú ni decía nada de vitaminas o minerales, que es justo para lo que se toma un multivitamínico. Lo que salga se descuenta solo de tu menú, así que no te pedirá en comida la proteína que ya te bebiste.':
      '*What they contribute is worked out by the coach itself*, as soon as you log something, and you will see it under "What they add to your day". Adding it up by hand went wrong: it did not count what you type in yourself and said nothing about vitamins or minerals, which is exactly what a multivitamin is taken for. Whatever comes out is deducted from your meal plan automatically, so it will not ask you for the protein you already drank.',
    'La tarjeta de arriba dice lo que hay que tomar hoy, entero: la hora, qué es y cuánto. No hay nada que marcar ahí: es para acordarse, no un diario de cumplimiento.':
      'The card at the top says what is due today, in full: the time, what it is and how much. There is nothing to tick off there: it is for remembering, not a compliance diary.',

    /* ---------- Donde entrenas ---------- */
    'Lo que elijas —gimnasio completo, casa con mancuernas, solo bandas, peso corporal— filtra el catálogo entero.':
      'What you choose \u2014 full gym, home with dumbbells, bands only, bodyweight \u2014 filters the whole catalogue.',
    'Es la causa más habitual de que un ejercicio «no exista»: está, pero lo tienes fuera porque necesita material que has dicho que no tienes. En el buscador de Ejercicios puedes quitar el filtro y ver el catálogo completo.':
      'It is the commonest reason an exercise "does not exist": it is there, but it is filtered out because it needs equipment you have said you do not have. In the Exercises search you can drop the filter and see the whole catalogue.',
    'También lo usa la auditoría: si tu plan lleva press de banca y has dicho que entrenas en casa con bandas, eso sale como fallo con su arreglo.':
      'The audit uses it too: if your plan has bench press and you have said you train at home with bands, that comes up as a fault with its fix.',
    'Se cambia desde el botón del sitio, arriba a la derecha en cualquier pantalla, o en Perfil › Dónde entrenas.':
      'You change it from the place button, top right on any screen, or in Profile › Where you train.',

    /* ---------- Donde estan tus datos ---------- */
    'Todo se guarda en el propio móvil, en el almacenamiento del navegador. Sin cuenta la app funciona entera y nada sale de ahí.':
      'Everything is saved on the phone itself, in the browser\u2019s storage. With no account the app works in full and nothing leaves it.',
    'Si creas una cuenta, tus datos se copian a la nube y vuelven al entrar desde otro móvil. Es lo que te cubre si pierdes el teléfono, cambias de móvil o borras la app.':
      'If you create an account, your data is copied to the cloud and comes back when you sign in from another phone. That is what covers you if you lose your phone, change it or delete the app.',
    'De las dos maneras puedes bajarte una copia en un archivo desde Ajustes › Copia de seguridad, y volver a cargarla cuando quieras. Es la red de seguridad que no depende de nadie.':
      'Either way you can download a copy as a file from Settings › Backup, and load it back whenever you like. It is the safety net that depends on nobody.',

    /* ---------- El entrenador con IA ---------- */
    'Es la parte opcional de la app. Sirve para lo que de verdad es una opinión: montarte un programa leyendo lo que le cuentes, proponerte un menú, leer una foto de comida, contestarte una duda.':
      'It is the optional part of the app. It is for what genuinely is an opinion: building you a programme from what you tell it, suggesting a meal plan, reading a photo of food, answering a question.',
    'Funciona con tu propia clave, que guardas en la Bóveda de claves. La app no cobra nada; lo que gastes con tu clave se lo pagas a quien te la dio.':
      'It runs on your own key, which you keep in the Key vault. The app charges nothing; what you spend with your key you pay to whoever gave it to you.',
    'Lo que es una regla no pasa por la IA: el peso de hoy, la nota del plan, el reparto por zona, el mínimo de series. Una regla tiene que dar siempre el mismo número y funcionar sin cobertura.':
      'What is a rule does not go through the AI: today\u2019s weight, your plan\u2019s score, the split by area, the minimum number of sets. A rule has to give the same number every time and work with no signal.',
    'Sin activarla, todo lo demás funciona igual. Lo único que pierdes es lo que hace falta pensar, no lo que hace falta contar.':
      'Without turning it on, everything else works the same. The only thing you lose is what needs thinking about, not what needs counting.',

    /* ---------- Entrenar sin internet ---------- */
    'La app entera funciona sin conexión: las rutinas, el entrenamiento, el cronómetro, apuntar series, el historial y las estadísticas. Todo eso vive en el móvil.':
      'The whole app works offline: routines, workouts, the timer, logging sets, history and stats. All of that lives on the phone.',
    'Lo único que conviene bajar antes son las *imágenes de los ejercicios*, porque pesan y no vienen de serie. Puedes bajar solo las de tus rutinas —lo más rápido—, las principales del catálogo o el catálogo completo.':
      'The only thing worth downloading beforehand is the *exercise images*, because they are heavy and do not come built in. You can download just the ones in your routines \u2014 the quickest \u2014 the main ones from the catalogue, or the whole catalogue.',
    'Se hace desde Perfil › Actualizaciones, y te dice cuánto ocupa antes de empezar y cuánto llevas ya guardado.':
      'You do it from Profile › Updates, and it tells you how much space it takes before you start and how much you already have saved.',
    'Lo que sí necesita conexión: el entrenador con IA, sincronizar con tu cuenta y actualizar la app.':
      'What does need a connection: the AI coach, syncing with your account and updating the app.',

    /* ---------- Como se hace: rutinas y entrenar ---------- */
    'El salto es el de cada material, no un número inventado: {barra} en barra, máquina y polea; {mancuerna} en mancuernas; {kettlebell} en kettlebell. Una barra admite discos de 1,25 por lado; un par de mancuernas del gimnasio va de dos en dos y no hay nada entre medias.':
      'The jump is the one for each piece of kit, not an invented number: {barra} on the barbell, machines and cables; {mancuerna} on dumbbells; {kettlebell} on kettlebells. A barbell takes 1.25 plates a side; a pair of gym dumbbells goes up two at a time and there is nothing in between.',
    'Marca los días de la semana en que la vas a hacer.':
      'Tick the days of the week you are going to do it.',
    'Están en la misma ficha, debajo de las notas. Esto es lo que convierte una lista de ejercicios en un plan: sin días, la portada no sabe qué ofrecerte.':
      'They are on the same sheet, under the notes. This is what turns a list of exercises into a plan: with no days, the home screen does not know what to offer you.',
    'Decide si es mixta.':
      'Decide whether it is a mixed routine.',
    'Apagado, la rutina se queda en su zona y te avisa si metes un ejercicio de otra. Enciéndelo solo si quieres mezclar tren superior e inferior a propósito.':
      'Off, the routine stays in its own area and warns you if you add an exercise from another. Turn it on only if you mean to mix upper and lower body on purpose.',
    'Añade ejercicios con el botón *Añadir*.':
      'Add exercises with the *Add* button.',
    'Se abre el buscador con tu material ya filtrado. El mínimo son {n} ejercicios; por arriba, los que quieras.':
      'The search opens with your equipment already filtered. The minimum is {n} exercises; above that, as many as you like.',
    'Pon series, repeticiones y descanso de cada uno.':
      'Set the sets, reps and rest for each one.',
    'Los tres campos están debajo de cada ejercicio. El descanso va en segundos, y la auditoría te dirá si te has quedado corto para lo que pesa ese ejercicio.':
      'The three fields are under each exercise. Rest is in seconds, and the audit will tell you if you have gone too short for how heavy that exercise is.',
    'Con las flechas de cada ejercicio. Lo pesado va delante: un básico detrás de tres aislamientos se hace con lo que queda. El icono de cambiar te propone recambios del mismo patrón.':
      'With the arrows on each exercise. The heavy work goes first: a compound after three isolations gets done with whatever is left. The swap icon suggests replacements from the same pattern.',
    'Botón *Guardar* al final. Si ya tiene ejercicios, también tienes *Guardar y entrenar ahora* para estrenarla en el momento.':
      '*Save* button at the end. If it already has exercises, there is also *Save and train now* to give it a first run there and then.',
    'Cuando la tengas, pásala por la auditoría: son treinta segundos y te dice qué falla antes de hacerla ocho semanas.':
      'Once you have it, run it through the audit: it takes thirty seconds and tells you what is wrong before you spend eight weeks on it.',
    'Que me la monte la app':
      'Let the app build it',
    'Con o sin IA, y luego la editas igual':
      'With or without AI, and you edit it the same either way',
    'Abre el generador de programa.':
      'Open the programme generator.',
    'Está en Rutinas › *Generar programa*. No monta una rutina suelta: monta la semana entera.':
      'It is in Routines › *Generate programme*. It does not build a single routine: it builds the whole week.',
    'Abrir «Generar programa»':
      'Open “Generate programme”',
    'Paso 1: repasa tus datos.':
      'Step 1: check your data.',
    'Sexo, edad, peso, altura y nivel. De ahí salen el volumen, las repeticiones y el esfuerzo. Si algo no cuadra, corrígelo antes de generar.':
      'Sex, age, weight, height and level. Volume, reps and effort all come from those. If something is off, fix it before generating.',
    'Paso 2: di cuándo puedes entrenar.':
      'Step 2: say when you can train.',
    'Qué días y cuántos minutos tienes. Ponlo realista: es mejor un plan de tres días que cumples que uno de cinco que no. Los minutos se respetan de verdad —si pones media hora, la sesión dura media hora— recortando primero los accesorios y solo al final las series de los básicos.':
      'Which days and how many minutes you have. Be realistic: a three-day plan you stick to beats a five-day plan you do not. The minutes are honoured for real —put half an hour and the session lasts half an hour— by trimming the accessories first and the big lifts’ sets only at the end.',
    'Paso 3: di qué buscas.':
      'Step 3: say what you are after.',
    'Tu objetivo, el sitio donde entrenas y la zona en la que quieres poner el foco.':
      'Your goal, where you train and the area you want to focus on.',
    'Paso 4: cuéntale lo que no cabe en ningún campo.':
      'Step 4: tell it what fits in no field.',
    'Qué te molesta ahora mismo, qué más debe saber, y qué le pides en concreto. Esto es opcional, pero es lo que separa un plan tuyo de uno genérico. Solo lo aprovecha la IA: la calculadora no lee texto.':
      'What is bothering you right now, what else it should know, and what exactly you are asking for. This is optional, but it is what separates a plan that is yours from a generic one. Only the AI uses it: the calculator does not read text.',
    'Elige con qué generarlo.':
      'Choose what to generate it with.',
    '*Generar rutina con IA* lee todo lo anterior, más lo que levantas y lo que llevas abandonado, y elige los ejercicios uno a uno. *Generar rutina automáticamente* es al momento y sin conexión, repartiendo patrones según tu edad y tu nivel, pero no lee lo que hayas escrito.':
      '*Generate routine with AI* reads all of the above, plus what you lift and what you have been neglecting, and picks the exercises one by one. *Generate routine automatically* is instant and works offline, splitting patterns by your age and level, but it does not read anything you wrote.',
    'Míralo antes de quedártelo.':
      'Look at it before you keep it.',
    'Te enseña la semana entera, por qué ese plan, y cómo progresar. Si no te convence, *Otra propuesta* lo vuelve a montar.':
      'It shows you the whole week, why that plan, and how to progress. If it does not convince you, *Another suggestion* builds it again.',
    'Botón *Guardar* al final del plan. Se convierte en rutinas normales, con sus días puestos, y a partir de ahí las editas como cualquier otra.':
      '*Save* button at the end of the plan. It turns into ordinary routines, with their days assigned, and from then on you edit them like any other.',
    'Lo generado no es intocable: entra en cualquiera de sus rutinas y cámbiale lo que quieras.':
      'What it generates is not untouchable: go into any of its routines and change whatever you like.',
    'Entra en Rutinas.':
      'Go to Routines.',
    'Abrir Rutinas':
      'Open Routines',
    'Toca la rutina para desplegarla.':
      'Tap the routine to open it up.',
    'Se abre con sus ejercicios y, debajo, la fila *Qué días la hago*.':
      'It opens with its exercises and, underneath, the *Which days I do it* row.',
    'Toca los días.':
      'Tap the days.',
    'Se encienden y se apagan. Una rutina puede tener varios días, y entonces cuenta como que la haces varias veces por semana.':
      'They turn on and off. A routine can have several days, and then it counts as doing it several times a week.',
    'Si dos rutinas se pelean por un día, quítaselo a una.':
      'If two routines fight over a day, take it off one of them.',
    'Si el viernes quieres pecho en vez de pierna, quita el viernes de la de pierna y pónselo a la de pecho.':
      'If on Friday you want chest instead of legs, take Friday off the leg routine and give it to the chest one.',
    'El cambio es inmediato: la portada y las estadísticas ya cuentan con los días nuevos.':
      'The change is immediate: the home screen and the stats already count the new days.',
    'Abre la portada.':
      'Open the home screen.',
    'El botón grande arranca lo que te toca hoy según tu plan. Si hoy no toca nada, te ofrece el entrenamiento libre.':
      'The big button starts what is due today on your plan. If nothing is due today, it offers you a free workout.',
    'Ir a Inicio':
      'Go to Home',
    'Mira el peso propuesto antes de la primera serie.':
      'Look at the suggested weight before the first set.',
    'Encima de cada ejercicio te dice si hoy subes, repites o bajas, y por qué. Si no te cuadra, cámbialo: es una propuesta. Esto solo sale si apuntas peso y repeticiones.':
      'Above each exercise it tells you whether today you go up, repeat or go down, and why. If it does not add up for you, change it: it is a suggestion. This only appears if you log weight and reps.',

    /* ---------- Como se hace: entrenar, comida y suplementos ---------- */
    'Ve marcando según avanzas.':
      'Tick things off as you go.',
    'Qué marcas depende de cómo tengas puesto el registro en Ajustes: cada serie con su peso, cada serie a secas, o el ejercicio entero de una vez. El descanso arranca solo al marcar, y el cronómetro te acompaña por toda la app: puedes salir a mirar otra cosa sin perderlo.':
      'What you tick depends on how logging is set in Settings: every set with its weight, every set plain, or the whole exercise in one go. Rest starts on its own when you tick, and the timer follows you around the app: you can go and look at something else without losing it.',
    'Apunta lo que de verdad hiciste.':
      'Log what you actually did.',
    'Si sacaste ocho en vez de diez, pon ocho. De ahí sale la propuesta de la próxima vez, y una cifra inflada hoy es un peso que no podrás mover la semana que viene.':
      'If you got eight instead of ten, put eight. Next time’s suggestion comes from that, and a number inflated today is a weight you will not be able to move next week.',
    'Si un ejercicio no puedes hacerlo, cámbialo ahí mismo.':
      'If you cannot do an exercise, swap it right there.',
    '*Otra opción* te propone recambios que trabajan lo mismo con otro material, y las series que ya llevas marcadas no se pierden. *Cómo se hace* enseña la técnica sin salir del entrenamiento.':
      '*Another option* suggests replacements that work the same thing with different kit, and the sets you have already ticked are not lost. *How it is done* shows the technique without leaving the workout.',
    'Termina cuando esté todo marcado.':
      'Finish when everything is ticked.',
    'El botón de terminar se enciende en verde cuando ya no queda nada por marcar. Se suma al historial, a los récords, al volumen levantado y a la constancia.':
      'The finish button turns green when there is nothing left to tick. It adds to your history, your records, the volume lifted and your consistency.',
    'En la portada, toca *O un entrenamiento libre*.':
      'On the home screen, tap *Or a free workout*.',
    'Está debajo del botón grande. Si ya entrenaste hoy, es la única opción que verás, y es a propósito.':
      'It is under the big button. If you have already trained today it is the only option you will see, and that is on purpose.',
    'Añade los ejercicios que has hecho, uno a uno.':
      'Add the exercises you did, one by one.',
    'El buscador es el mismo que en todas partes, con tu material filtrado.':
      'The search is the same one as everywhere else, with your equipment filtered.',
    'Apunta cada serie con su peso y sus repeticiones.':
      'Log each set with its weight and reps.',
    'Cuenta exactamente igual que una rutina del plan: historial, récords y estadísticas.':
      'It counts exactly the same as a routine from your plan: history, records and stats.',
    'Para algo que hiciste otro día —una caminata el domingo, la pachanga del sábado—, en Rutinas tienes *Apuntar algo que ya hice*. Ahí no hay series que apuntar, así que ese día sale en azul con los minutos debajo en vez del número de series; y la app sabe qué músculos mueve cada actividad, y no solo de pierna: nadar y remar van a la espalda, la escalada a espalda y antebrazos, y el boxeo a hombro, core y brazo. Si lo escribes con tus palabras, la app reconoce lo que pone y elige el esfuerzo sola: «Jugué fútbol» es un deporte de equipo, «subida al cerro» es senderismo y «clase de muay thai» es boxeo. La ficha de debajo del campo enseña siempre lo que ha entendido y qué músculos va a apuntar, para que no haya que guardarlo para enterarse. Si no reconoce nada se queda en «Otra cosa», que no apunta músculos porque puede ser cualquier cosa; toca *Cambiar* y elige de la lista, donde cada una dice lo que registra. Escribe también el rato y el día si quieres: «trote una hora» o «jugué fútbol ayer 90 minutos» rellenan solos el cuándo y el cuánto. Y si lo tuyo no cabe en la rueda —una caminata de hace tres semanas, cuarenta y siete minutos justos— debajo tienes la fecha y los minutos para escribirlos a mano; entonces la rueda se apaga, porque marcar «45» con 47 puestos al lado sería mentir. Y con el entrenador puesto no hay que pedírselo: en cuanto dejas de escribir lo mira solo y te lo afina —distingue un partido de once de una pachanga, y el botón de esfuerzo no—, y lo que diga sale abajo, encima del botón de guardar. Lo mismo al empezar algo con el cronómetro: escribes qué estás haciendo y te dice los músculos antes de arrancar, sin pedirle nada. Y al terminar cualquier entrenamiento —de pesas o de fuera— tienes *Guardar y analizarlo con la IA*, que lo guarda y te lo lee: cómo de exigente fue, qué te deja tocado, si construye músculo y qué vigilar en la próxima, contando las series de tu semana. Ahí mismo, al lado de *Apuntar*, tienes *Analizar*: con la actividad y el rato ya puestos, te dice cómo de duro fue de verdad, qué te deja cargado y cuánto dura, si eso construye músculo o solo lo mantiene, y qué vigilar mañana. Y si en lo que escribiste hay un sitio que conoce —un cerro, una carrera, una ruta— abre con eso: qué es, cuánto desnivel tiene y cómo queda tu tiempo frente al normal de allí. Si no lo conoce, esa línea no sale: se le pide callarse antes que inventarse un desnivel, porque un número falso sobre un sitio real suena a dato y te lo crees. Cuenta con las series que llevas esta semana en esas zonas, que es lo que separa un consejo tuyo de un horóscopo. Es una lectura para leerla y cerrarla: no se guarda ni entra en ninguna gráfica.':
      'For something you did on another day — a walk on Sunday, Saturday’s kickabout — Routines has *Log something I already did*. There are no sets to log there, so that day shows up blue with the minutes underneath instead of a set count; and the app knows which muscles each activity moves, and not only leg ones: swimming and rowing go to the back, climbing to back and forearms, and boxing to shoulder, core and arm. If you write it in your own words, the app recognises what it says and picks the effort itself: “played football” is a team sport, “climbed the hill” is hiking and “muay thai class” is boxing. The card under the field always shows what it understood and which muscles it is going to log, so you do not have to save it to find out. If it recognises nothing it stays on “Something else”, which logs no muscles because it could be anything; tap *Change* and pick from the list, where each one says what it records. Write the length and the day in there too if you like: “ran for an hour” or “played football yesterday for 90 minutes” fill in the when and the how long by themselves. And if yours does not fit the wheel —a walk from three weeks ago, forty-seven minutes exactly— underneath it you have the date and the minutes to type by hand; the wheel then dims, because showing “45” with 47 set next to it would be lying. And with the AI coach set up you do not have to ask: as soon as you stop typing it looks at it by itself and fine-tunes it —it can tell a proper match from a kickabout, and the effort button cannot— and whatever it says appears at the bottom, above the save button. Same when you start something with the stopwatch: you write what you are doing and it tells you the muscles before you begin, without being asked. And when you finish any session —weights or outside— you have *Save and have the AI look at it*, which saves it and reads it back to you: how demanding it was, what it leaves sore, whether it builds muscle and what to watch out for next time, counting your sets for the week. And right there, next to *Log it*, you have *Analyse*: with the activity and the length already in, it tells you how hard it really was, what it leaves loaded and for how long, whether that builds muscle or only maintains it, and what to watch out for tomorrow. And if what you wrote names a place it knows —a hill, a race, a route— it opens with that: what it is, how much climb it has and how your time compares with the usual one there. If it does not know it, that line does not appear: it is told to keep quiet rather than invent a climb, because a false number about a real place sounds like a fact and you believe it. It counts the sets you have done this week in those areas, which is what separates advice about you from a horoscope. It is a read to read and close: it is not saved and it does not enter any chart.',
    'Abre las acciones del plan que quieres revisar.':
      'Open the actions for the plan you want reviewed.',
    'En la cabecera del plan, y ahí *Revisar el plan con IA*. Lee sus días juntos, que es como hay que leerlos: el reparto entre músculos, lo que se repite y lo que falta se cuentan sobre la semana, no sobre una sesión.':
      'In the plan’s header, and there *Review the plan with AI*. It reads its days together, which is how they have to be read: the split between muscles, what repeats and what is missing are all counted over the week, not over one session.',
    'Lee la nota y los fallos.':
      'Read the score and the faults.',
    'Cada fallo dice qué se ha medido, no solo que algo está mal. Están ordenados por gravedad: lo de arriba es lo que más importa.':
      'Each fault says what was measured, not just that something is wrong. They are ordered by severity: the top one matters most.',
    'Aplica los arreglos que te convenzan.':
      'Apply the fixes that convince you.',
    'Casi todos traen el cambio hecho —quitar esto, meter aquello, subir ese descanso— y se aplican de una vez. Los que no te convenzan, déjalos: es tu plan.':
      'Nearly all of them come with the change ready — drop this, add that, raise that rest — and apply in one go. Leave the ones you do not agree with: it is your plan.',
    'Para una rutina suelta hay auditoría también, dentro del editor, y se salta las reglas que solo tienen sentido sobre una semana entera.':
      'There is an audit for a single routine too, inside the editor, and it skips the rules that only make sense over a whole week.',
    'Entra en Alimentación.':
      'Go to Food.',
    'Ir a Alimentación':
      'Go to Food',
    'Toca *Foto de lo que comes*.':
      'Tap *Photo of what you eat*.',
    'Puedes hacerla en el momento o elegir una de la galería. Lo segundo es para cuando comes sin cobertura: fotografía el plato con la cámara del móvil y súbelo luego, que la IA necesita internet para leerla.':
      'You can take it there and then or pick one from your gallery. The second one is for when you eat with no signal: photograph the plate with your phone camera and upload it later, because the AI needs the internet to read it.',
    'Deja que la lea.':
      'Let it read the photo.',
    'Calcula lo que llevaba: calorías, proteína y el resto. Esto sí usa la IA, así que necesita conexión y tu clave puesta. Si la subes sin cobertura te lo dice y no se pierde nada: la foto sigue en tu galería.':
      'It works out what was in it: calories, protein and the rest. This one does use the AI, so it needs a connection and your key set up. If you upload it with no signal it tells you so and nothing is lost: the photo is still in your gallery.',
    'La hora es la de la foto, no la de ahora.':
      'The time is the photo\'s, not right now.',
    'Una foto de la galería se apunta a la hora en que la hiciste, así que el plato de las dos se cruza con la comida y no con la cena. Solo si es del mismo día: una de ayer se apunta como de hoy.':
      'A photo from your gallery is logged at the time you took it, so the two o\'clock plate is matched against lunch and not against dinner. Only for the same day: one from yesterday is logged as today.',
    'Mira el cruce.':
      'Look at the match.',
    'Si la hora cae en una franja con menú, te dice si comiste lo previsto o algo distinto, y la diferencia en calorías y en proteína.':
      'If the time falls in a window with a planned meal, it tells you whether you ate what was planned or something else, and the difference in calories and protein.',
    'Si no se cruzó, crúzalo a mano.':
      'If it did not match, match it by hand.',
    'La app te ofrece las comidas candidatas del menú para que elijas cuál era.':
      'The app offers you the candidate meals from your plan so you can pick which one it was.',
    'Entra en *Perfil › Suplementación*.':
      'Go to *Profile › Supplements*.',
    'Abrir Suplementación':
      'Open Supplements',
    'Toca *Añadir* y elige cuál.':
      'Tap *Add* and choose which one.',
    'Creatina, proteína, omega 3, multivitamínico, magnesio… Salen en rejilla, con el dibujo de en qué vienen —bote, cápsula, comprimido— para que se distingan antes de leerlos. Los que ya tomas salen apagados y con un visto. Si el tuyo no está, abajo del todo está *Otro* y lo escribes tú.':
      'Creatine, protein, omega 3, multivitamin, magnesium… They come up in a grid, with a drawing of what they come in — tub, capsule, tablet — so you can tell them apart before reading them. The ones you already take are greyed out with a tick. If yours is not there, right at the bottom is *Other* and you type it in.',
    'Di cuánto tomas de una vez.':
      'Say how much you take at a time.',
    'Un número con su más y su menos, y debajo en qué se mide: cápsulas, comprimidos, cazos, gramos, mililitros, gotas, sobres o tomas. No se teclea, por eso la lista nunca acaba con «1 capsula», «una cápsula» y «1 cap» diciendo lo mismo de tres maneras. Si lo repartes en el día, eso se dice después.':
      'A number with a plus and a minus, and under it what it is measured in: capsules, tablets, scoops, grams, millilitres, drops, sachets or doses. You do not type it, which is why the list never ends up with “1 capsul”, “one capsule” and “1 cap” saying the same thing three ways. If you spread it through the day, that comes later.',
    'Di cada cuánto.':
      'Say how often.',
    'Todos los días, los días que entrenas, un día sí y otro no, o un día a la semana. «Los días que entreno» sale de los días que tengas asignados en tu plan.':
      'Every day, training days, every other day, or one day a week. “Training days” comes from the days assigned in your plan.',
    'Di en qué momento.':
      'Say at what moment.',
    'Con el desayuno, el almuerzo, la merienda o la cena; antes o después de entrenar; o a una *hora puntual*, que va en otro color porque es el único que no depende de nada tuyo. Si eliges hora puntual, debajo aparece la hora: tócala y se abre una rueda, como la del reloj del móvil.':
      'With breakfast, lunch, the afternoon snack or dinner; before or after training; or at *a set time*, which is a different colour because it is the only one that depends on nothing of yours. If you choose a set time, the hour appears underneath: tap it and a wheel opens, like your phone’s clock.',
    'Si lo tomas varias veces al día, elige *Varias al día*.':
      'If you take it several times a day, choose *Several a day*.',
    'Te pregunta en el momento cómo lo repartes y te da tres caminos: *Por reloj*, *Con tus comidas* y *A mano*. Toca uno y dentro están solo sus opciones, cada una con las horas que salen con tus datos de ahora. En las dos primeras eliges y ya está: la hoja se cierra y vuelves a la ficha con el reparto puesto.':
      'It asks you right then how you spread it and gives you three routes: *By the clock*, *With your meals* and *By hand*. Tap one and inside are only its own options, each with the times your current data produces. With the first two you choose and that is it: the sheet closes and you are back on the card with the split set.',
    'Si fuiste por reloj, di a qué hora empiezas.':
      'If you went by the clock, say what time you start.',
    'Aparece *Empezando a las* debajo del reparto. Tócalo y pon la hora en la rueda: de ahí salen las demás, contando hacia delante y cortando en la cena.':
      '*Starting at* appears under the split. Tap it and set the hour on the wheel: the rest come from there, counting forwards and stopping at dinner.',
    'Y si vas *A mano*, pon cada hora en la rueda.':
      'And if you go *By hand*, set each hour on the wheel.',
    'Se abre un panel con la misma rueda. Gírala hasta la hora que quieras, toca *Añadir esta hora* y se queda abajo en «Tus horas». Repite hasta tenerlas todas —las que sobren se quitan tocando la × de cada una— y termina con *Listo*. Se crea una alerta por cada hora.':
      'A panel opens with the same wheel. Spin it to the hour you want, tap *Add this time* and it stays below under “Your times”. Repeat until you have them all — spare ones come off by tapping the × on each — and finish with *Done*. One reminder is created per hour.',

    /* ---------- Como se hace: pais, horas, clave y alertas ---------- */
    'Para cambiarlo o quitarlo, *desliza la fila*.':
      'To change it or remove it, *swipe the row*.',
    'En «Lo que tomas», *Borrar* está a la derecha y *Editar* a la izquierda: empuja la fila hacia el lado contrario para descubrir el que quieras. Tocar la fila sin deslizar abre la ficha, como siempre. Es el mismo gesto que en tus rutinas y tus menús.':
      'Under “What you take”, *Delete* is on the right and *Edit* on the left: push the row the opposite way to uncover the one you want. Tapping the row without swiping opens the card, as always. It is the same gesture as in your routines and your meal plans.',
    'Guarda y, abajo, toca *Crear alertas*.':
      'Save and, at the bottom, tap *Create reminders*.',
    'Se crean con el nombre y la dosis. Solo toca las de suplementos: las alertas que hayas creado tú se quedan como están.':
      'They are created with the name and the dose. It only touches supplement ones: reminders you created yourself stay as they are.',
    'Si luego cambias las horas de comer, los días de tu plan o los propios suplementos, la pantalla te avisa de que las alertas no coinciden y se rehacen con un toque.':
      'If you later change your meal times, your plan’s days or the supplements themselves, the screen warns you the reminders no longer match and they are rebuilt with one tap.',
    'Entra en *Perfil › Datos y hábitos*.':
      'Go to *Profile › Data and habits*.',
    'Abrir Datos y hábitos':
      'Open Data and habits',
    'Toca *Editar*, arriba a la derecha.':
      'Tap *Edit*, top right.',
    'Debajo de tu nombre, toca *País*.':
      'Under your name, tap *Country*.',
    'Se abre la lista entera con su bandera. Arriba hay un buscador: escribe tres letras y aparece el tuyo. Si tu móvil ya lo sabe, te lo propone el primero para que lo toques y listo.':
      'The whole list opens with each flag. There is a search box at the top: type three letters and yours appears. If your phone already knows it, it is suggested first so you can just tap it and be done.',
    'Tócalo y guarda.':
      'Tap it and save.',
    'Se queda con la bandera puesta. A partir de ahí el menú, la lista de la compra y los consejos del entrenador salen de lo que hay en tu país y con los nombres que usas tú.':
      'It stays with the flag showing. From then on your meal plan, your shopping list and the coach’s advice come from what exists in your country and use the names you use.',
    'Es obligatorio, y por eso: media lista de la compra de un menú de otro país no está en tu súper, y la otra media se llama de otra manera.':
      'It is required, and this is why: half the shopping list from another country’s meal plan is not in your supermarket, and the other half goes by a different name.',
    'Entra en *Perfil › Ajustes*.':
      'Go to *Profile › Settings*.',
    'Estaban en Alimentación y se movieron aquí: no son de aquella pantalla, porque no se tocan al montar un menú. De estas horas dependen los avisos de comer, con qué comida se cruza la foto de un plato y a qué hora te toca cada suplemento.':
      'They used to be under Food and moved here: they do not belong on that screen, because you do not touch them while building a meal plan. Your meal reminders, which meal a photo of a plate gets matched to, and what time each supplement is due all depend on these times.',
    'Abrir Ajustes':
      'Open Settings',
    'Toca *A qué hora comes*.':
      'Tap *What time you eat*.',
    'Justo debajo de «Dónde entrenas».':
      'Right under “Where you train”.',
    'Abrir mis horas de comer':
      'Open my meal times',
    'Pon la hora a la que empieza cada comida.':
      'Set the time each meal starts.',
    'Desayuno, almuerzo, merienda y cena. Si desayunas a las seis, ponlo a las seis: lo que viene de fábrica es una media que probablemente no es la tuya.':
      'Breakfast, lunch, afternoon snack and dinner. If you have breakfast at six, put six: what comes out of the box is an average that is probably not yours.',
    'No hace falta poner la hora de fin.':
      'There is no need to set an end time.',
    'Cada franja llega hasta la hora de la siguiente, y la cena se estira hasta el desayuno del día siguiente aunque cruce la medianoche.':
      'Each window runs until the next one starts, and dinner stretches to the next day’s breakfast even though it crosses midnight.',
    'A partir de ahí, cada foto se cruza con la comida que tocaba a esa hora, y los avisos de comer suenan a tus horas y no a las de un horario estándar.':
      'From then on, each photo is matched to the meal that was due at that time, and your meal reminders go off at your hours and not at some standard timetable’s.',
    'Entra en Perfil › Entrenador con IA.':
      'Go to Profile › AI coach.',
    'Abrir el entrenador':
      'Open the coach',
    'Elige proveedor.':
      'Choose a provider.',
    'Cada uno tiene su forma de darte una clave; en la propia pantalla se dice dónde se consigue la de cada uno.':
      'Each one has its own way of giving you a key; the screen itself says where to get each one.',
    'Pega tu clave en la bóveda.':
      'Paste your key into the vault.',
    'Se queda en tu móvil, igual que el resto de tus datos. La app no la manda a ningún sitio que no sea el proveedor que has elegido.':
      'It stays on your phone, like the rest of your data. The app does not send it anywhere other than the provider you chose.',
    'Cada servicio de la bóveda tiene su botón de probar, que hace una llamada de verdad y te dice si responde.':
      'Each service in the vault has its own test button, which makes a real call and tells you whether it answers.',
    'Si algo deja de funcionar, vuelve aquí antes que a ningún otro sitio: casi siempre es una clave caducada o sin saldo.':
      'If something stops working, come back here before anywhere else: it is nearly always an expired key or one out of credit.',
    'Entra en *Perfil › Alertas*.':
      'Go to *Profile › Reminders*.',
    'Abrir Alertas':
      'Open Reminders',
    'Arriba, toca *Automáticas*.':
      'At the top, tap *Automatic*.',
    'Está al lado de «Nueva». Se abre una hoja que te dice exactamente qué va a crear antes de tocar nada.':
      'It is next to “New”. A sheet opens telling you exactly what it will create before it touches anything.',
    'Mira lo que te propone y confirma.':
      'Look at what it suggests and confirm.',
    'El agua que te toca por tu peso repartida en vasos; *una alerta por cada comida*, a la hora que tú has puesto en Ajustes y diciendo cuál es —«es hora de desayunar», «es hora de almorzar»—; el entrenamiento en los días que tienen rutina y a la hora a la que entrenas de verdad; pesarte los lunes en ayunas; y tus suplementos.':
      'The water you need for your weight split into glasses; *one reminder per meal*, at the time you set in Settings and saying which one it is — “time for breakfast”, “time for lunch” — training on the days that have a routine and at the hour you actually train; weighing yourself on Mondays before eating; and your supplements.',
    'Lo que tomas varias veces al día va en *una sola alerta*.':
      'What you take several times a day goes into *a single reminder*.',
    'Si tomas magnesio a las diez y a las dos, es una alerta con dos horas y no dos que se llaman igual. Y si a una de esas horas coincide con otro bote, esa hora se agrupa aparte para no sonarte dos veces seguidas.':
      'If you take magnesium at ten and at two, that is one reminder with two times and not two reminders with the same name. And if one of those hours coincides with another tub, that hour is grouped separately so it does not go off twice in a row.',
    'Ya está. Cámbialas si quieres.':
      'That is it. Change them if you like.',
    'Son alertas normales: puedes tocarles la hora, los días o apagarlas, una a una.':
      'They are ordinary reminders: you can change their time, their days or switch them off, one by one.',
    'Vuelve a pulsarlo cuando cambies de peso, de horarios o de rutina: *no te duplica nada*, pone al día las que ya tienes.':
      'Press it again when your weight, your times or your routine change: it *duplicates nothing*, it brings the ones you have up to date.',
    'Antes de nada, crea un calendario llamado *Training FR* en tu móvil.':
      'First of all, create a calendar called *Training FR* on your phone.',
    'En iPhone, Calendario › Calendarios › Añadir calendario. En Android, desde Google Calendar en el navegador: Configuración › Añadir otro calendario. Este paso es el que hace que luego puedas administrarlos: en un calendario propio los apagas, los escondes o los borras todos de una vez.':
      'On iPhone, Calendar › Calendars › Add calendar. On Android, from Google Calendar in the browser: Settings › Add another calendar. This step is what lets you manage them afterwards: in a calendar of their own you can turn them off, hide them or delete them all at once.',
    'Entra en Perfil › Alertas y baja hasta *Que suenen con la app cerrada*.':
      'Go to Profile › Reminders and scroll down to *Make them go off with the app closed*.',

    /* ---------- Como se hace: calendario, copia, sin internet e instalar ---------- */
    'Toca *Descargar para el calendario* y elige hasta cuándo.':
      'Tap *Download for your calendar* and choose how far ahead.',
    'Un mes, tres, seis, un año o sin límite. Los avisos se repiten cada semana hasta esa fecha; te dice el día exacto en el que se acabarían. Con plazo se acaban solos el día que dejes de usar la app; sin límite no, y hay que quitarlos a mano.':
      'One month, three, six, a year or no limit. The alerts repeat every week until that date; it tells you the exact day they would run out. With an end date they stop on their own the day you stop using the app; with no limit they do not, and you have to remove them by hand.',
    'Se baja un archivo .ics.':
      'An .ics file is downloaded.',
    'Lleva un evento semanal por cada hora de cada recordatorio activo, con su aviso cinco minutos antes.':
      'It carries one weekly event for every hour of every active reminder, each with an alert five minutes before.',
    'Ábrelo y elige el calendario Training FR.':
      'Open it and choose the Training FR calendar.',
    'El móvil te pregunta a cuál añadirlos. Ahí es donde se decide si luego son fáciles de administrar o si quedan mezclados con el resto de tu agenda.':
      'Your phone asks which one to add them to. That is where it is decided whether they are easy to manage later or end up mixed in with the rest of your diary.',
    'Compruébalo: se llaman *Training FR · algo*.':
      'Check: they are called *Training FR · something*.',
    'Ese prefijo va en todos, así que buscando «Training FR» en tu calendario salen todos aunque los hayas metido mezclados.':
      'That prefix is on all of them, so searching “Training FR” in your calendar finds them all even if you mixed them in.',
    'Si luego cambias horas o días, o si el plazo se está acabando, la pantalla de Alertas te avisa y el botón pasa a decir «Volver a descargar». Los eventos que ya tienes se actualizan en vez de duplicarse, porque cada uno lleva su identificador.':
      'If you later change times or days, or the end date is approaching, the Reminders screen warns you and the button changes to “Download again”. The events you already have are updated rather than duplicated, because each one carries its own identifier.',
    'Toca *Quitarlos del calendario*.':
      'Tap *Remove them from the calendar*.',
    'Solo aparece si alguna vez descargaste el archivo.':
      'It only appears if you have downloaded the file at some point.',
    'Ábrelo igual que el otro.':
      'Open it just like the other one.',
    'Es un archivo de cancelación: el calendario retira los eventos en vez de añadirlos.':
      'It is a cancellation file: the calendar withdraws the events instead of adding them.',
    'Se van todos, incluidos los que ya no existen en la app.':
      'They all go, including the ones that no longer exist in the app.',
    'La app recuerda todo lo que te ha exportado alguna vez, así que también quita los avisos de horas que cambiaste después y que se habían quedado sonando por su cuenta.':
      'The app remembers everything it has ever exported for you, so it also removes alerts for times you changed afterwards and that had been going off on their own.',
    'Tus recordatorios dentro de la app no se tocan: esto solo limpia el calendario del móvil.':
      'Your reminders inside the app are untouched: this only cleans up the phone’s calendar.',
    'Entra en Ajustes y baja hasta *Copia de seguridad*.':
      'Go to Settings and scroll down to *Backup*.',
    'Ir a Ajustes':
      'Go to Settings',
    '*Exportar* baja un archivo con todo.':
      '*Export* downloads a file with everything.',
    'Rutinas, historial, perfil y ajustes. Guárdalo donde no se te pierda.':
      'Routines, history, profile and settings. Keep it somewhere you will not lose it.',
    'Para recuperarlo, *Importar* y elige ese archivo.':
      'To get it back, *Import* and choose that file.',
    'En la misma pantalla. Sirve también para llevártelo a otro móvil sin crear cuenta.':
      'On the same screen. It also works for moving everything to another phone without creating an account.',
    'Si además tienes cuenta, tus datos ya viajan solos entre tus dispositivos; el archivo es la red de seguridad de todo lo demás.':
      'If you also have an account, your data already travels between your devices on its own; the file is the safety net for everything else.',
    'Entra en Perfil › Actualizaciones.':
      'Go to Profile › Updates.',
    'Abrir Actualizaciones':
      'Open Updates',
    'En *Entrenar sin internet*, elige qué bajar.':
      'Under *Training offline*, choose what to download.',
    'Solo las de tus rutinas es lo más rápido y suele bastar. Los ejercicios principales o el catálogo completo, si te gusta buscar sobre la marcha.':
      'Just the ones in your routines is the quickest and usually enough. The main exercises or the whole catalogue, if you like browsing as you go.',
    'Espera a que termine la barra.':
      'Wait for the bar to finish.',
    'Te dice cuánto llevas guardado. Hazlo con wifi.':
      'It tells you how much you have saved. Do it on wi-fi.',
    'A partir de ahí puedes entrenar sin datos y sin wifi, con las imágenes y todo.':
      'From then on you can train with no data and no wi-fi, images and all.',
    'Ábrela desde el icono nuevo.':
      'Open it from the new icon.',
    'Arranca a pantalla completa, sin barra de navegador, y funciona sin conexión.':
      'It starts full screen, with no browser bar, and works offline.',
    'Sí, entera. Las rutinas, el entrenamiento, el cronómetro, el historial y las estadísticas no necesitan conexión.':
      'Yes, all of it. Routines, workouts, the timer, history and stats need no connection.',
    'Solo necesitan internet tres cosas: el entrenador con IA, sincronizar con tu cuenta y actualizar la app. Las imágenes de los ejercicios hay que bajarlas una vez.':
      'Only three things need the internet: the AI coach, syncing with your account and updating the app. The exercise images have to be downloaded once.',
    'En tu propio móvil, en el almacenamiento del navegador. Sin cuenta, no salen de ahí.':
      'On your own phone, in the browser’s storage. With no account, they never leave it.',
    'Si creas una cuenta, además se copian a la nube para que vuelvan al entrar desde otro dispositivo.':
      'If you create an account, they are also copied to the cloud so they come back when you sign in from another device.',
    'Sin cuenta, sí: los datos viven en ese navegador y se van con él.':
      'With no account, yes: the data lives in that browser and goes with it.',
    'Con cuenta, no: entras con tu correo en el móvil nuevo y vuelve todo.':
      'With an account, no: you sign in with your email on the new phone and everything comes back.',
    'Y en cualquiera de los dos casos, un archivo exportado te cubre.':
      'And either way, an exported file covers you.',
    'Porque la app decide el peso de hoy con tu historial, en vez de repetir el último.':
      'Because the app decides today’s weight from your history, instead of repeating the last one.',

    /* ---------- Preguntas (1) ---------- */
    'Encima del ejercicio te dice cuál de los tres casos es —subes, repites o bajas— y por qué. Y el número se puede cambiar siempre.':
      'Above the exercise it tells you which of the three cases it is — up, repeat or down — and why. And the number can always be changed.',
    'Porque esa serie no salió como pedía la rutina: hiciste más o menos repeticiones de las previstas.':
      'Because that set did not come out as the routine asked: you did more or fewer reps than planned.',
    'No es un error ni un aviso. Es el dato: si la rutina pide cuatro series de siete y la tercera se quedó en cinco, eso es justo lo que hay que ver al mirar la sesión, y es lo que decide el peso de la próxima vez.':
      'It is not an error or a warning. It is the data: if the routine asks for four sets of seven and the third stopped at five, that is exactly what you need to see when you look at the session, and it is what decides next time’s weight.',
    'Se cambia con el más y el menos de cada serie, en el modo «marcar cada serie», o escribiendo el número en «peso y repeticiones».':
      'You change it with the plus and minus on each set, in “tick off each set” mode, or by typing the number in “weight and reps”.',
    'Porque los récords se calculan con el peso, y si no apuntas peso no hay nada que comparar.':
      'Because records are worked out from the weight, and if you do not log weight there is nothing to compare.',
    'Pasa en los modos «marcar cada serie» sin poner peso y «marcar el ejercicio y ya». En ese caso la app no te enseña un récord de cero kilos: te dice cuántas veces has hecho ese ejercicio y cuándo fue la última, que es la historia que sí existe.':
      'It happens in “tick off each set” without a weight and in “just tick off the exercise”. In that case the app does not show you a zero-kilo record: it tells you how many times you have done that exercise and when the last one was, which is the story that does exist.',
    'Si quieres récords, volumen y gráficas de peso, cambia el registro a «peso y repeticiones» en Ajustes.':
      'If you want records, volume and weight charts, switch logging to “weight and reps” in Settings.',
    'La nota parte de un 10 y baja por cada fallo encontrado, según su gravedad.':
      'The score starts at 10 and comes down for each fault found, according to how serious it is.',
    'Los fallos están listados uno a uno con lo que se ha medido: no es un número a secas. Casi todos traen un arreglo automático.':
      'The faults are listed one by one with what was measured: it is not just a bare number. Nearly all of them come with an automatic fix.',
    'Son reglas fijas, así que la misma rutina saca siempre la misma nota.':
      'They are fixed rules, so the same routine always gets the same score.',
    'Casi siempre es el material. Lo que hayas puesto en «Dónde entrenas» filtra el catálogo: si has dicho que entrenas en casa con bandas, el press de banca no aparece.':
      'It is nearly always the equipment. What you set under “Where you train” filters the catalogue: if you have said you train at home with bands, bench press does not appear.',
    'En el buscador puedes quitar el filtro y ver el catálogo completo, o cambiar el sitio desde el botón de arriba a la derecha.':
      'In the search you can drop the filter and see the whole catalogue, or change the place from the button at the top right.',
    'Por una de tres: la hora de la foto cae fuera de todas las franjas, no tienes un menú activo para ese día, o las franjas no están puestas a tus horas.':
      'For one of three reasons: the photo’s time falls outside every window, you have no active meal plan for that day, or the windows are not set to your hours.',
    'Lo que quedó sin cruzar se puede cruzar después, y también a mano eligiendo tú la comida.':
      'What went unmatched can be matched later, and by hand too, with you picking the meal.',
    'Sí, y se calcula solo: en cuanto apuntas o cambias algo, el entrenador lo mira y el resultado queda en el bloque plegado «Lo que suman a tu día».':
      'Yes, and it works itself out: as soon as you log or change something, the coach looks at it and the result sits in the collapsed “What they add to your day” block.',
    'Lo hace él y no la app porque una suma a mano no cuenta lo que escribes tú, ni las vitaminas, ni los minerales. Te dice las calorías y los macros que suman todas las tomas juntas, qué micronutrientes quedan cubiertos, y qué debería tener en cuenta tu menú.':
      'It does it rather than the app because adding up by hand does not count what you type in yourself, nor vitamins, nor minerals. It tells you the calories and macros all your doses add up to, which micronutrients end up covered, and what your meal plan should take into account.',
    'Y eso entra en el menú automáticamente: si tus batidos ya te dan 48 g de proteína, el menú te pide el resto en comida, no el total otra vez.':
      'And that feeds into your meal plan automatically: if your shakes already give you 48 g of protein, the plan asks you for the rest in food, not the whole total again.',
    'Se guarda con la lista que analizó: si cambias un bote, hay que volver a pedirlo.':
      'It is saved along with the list it analysed: if you change a tub, you have to ask for it again.',
    'En «cada cuánto» elige *Varias al día* y te pregunta ahí mismo cómo lo repartes.':
      'Under “how often” choose *Several a day* and it asks you right there how you spread it.',
    'Primero eliges por dónde: por reloj, con tus comidas o a mano. Por reloj es cada 4, 6, 8 o 12 horas, arrancando a la hora que digas y cortando en la cena. Con tus comidas es antes, con o después de cada una, y entonces se mueven solas si cambias una hora de comer. A mano abre la rueda y vas añadiendo las que quieras, una a una.':
      'First you pick which route: by the clock, with your meals or by hand. By the clock is every 4, 6, 8 or 12 hours, starting at whatever time you say and stopping at dinner. With your meals is before, with or after each one, and then they move by themselves if you change a meal time. By hand opens the wheel and you add as many as you like, one by one.',
    'Se crea una alerta por cada hora, y lo que aporte se cuenta tantas veces como tomas tengas.':
      'One reminder is created per hour, and what it contributes counts as many times as you have doses.',
    'No, y a propósito. La lista es para acordarte y para que las cuentas cuadren, no una recomendación.':
      'No, and on purpose. The list is for remembering and for making the maths add up, not a recommendation.',
    'La dosis que sale puesta al elegir del catálogo es la que suele traer la etiqueta del bote, como relleno para no ponerla a mano; se cambia entera con el más, el menos y la lista de unidades.':
      'The dose filled in when you pick from the catalogue is the one usually printed on the tub’s label, as a starting point so you do not have to type it; you can change all of it with the plus, the minus and the list of units.',
    'Qué tomar, cuánto y si te conviene lo decides tú con quien te lleve la salud, sobre todo si tomas medicación.':
      'What to take, how much and whether it suits you is for you to decide with whoever looks after your health, especially if you are on medication.',
    'Porque «hora de comer» a las ocho de la mañana no dice nada que no diga el reloj.':
      'Because “time to eat” at eight in the morning says nothing the clock does not.',
    'La app mira en qué franja cae esa hora —las mismas horas que usas para cruzar las fotos—, coge las calorías y la proteína que le tocan a esa comida, y si tienes un menú activo añade lo que te sugiere para ella.':
      'The app looks at which window that hour falls in — the same times used to match your photos — takes the calories and protein due for that meal, and if you have an active plan it adds what it suggests for it.',
    'Se calcula al lanzar el aviso, no al crear el recordatorio: el menú de hoy no es el de la semana que viene. En el calendario del móvil va el título y las calorías, pero no el plato, porque ese archivo se escribe hoy y el evento suena dentro de tres semanas.':
      'It is worked out when the alert fires, not when the reminder is created: today’s plan is not next week’s. In the phone’s calendar you get the title and the calories, but not the dish, because that file is written today and the event goes off three weeks from now.',
    'Sí. El entrenamiento libre no necesita nada: abres, añades lo que vas haciendo y guardas.':
      'Yes. A free workout needs nothing: you open it, add what you do as you go, and save.',
    'Cuenta igual para el historial, los récords y las estadísticas. Lo único que te pierdes sin plan es lo que se calcula sobre la semana: qué toca hoy, el reparto por zona y la auditoría.':
      'It counts just the same for your history, your records and your stats. The only thing you miss without a plan is what is worked out over the week: what is due today, the split by area and the audit.',
    'Nada. No tiene suscripción, ni anuncios, ni compras.':
      'Nothing. There is no subscription, no ads and no purchases.',
    'Lo único que puede costar dinero es el entrenador con IA, porque funciona con tu propia clave: lo que gastes se lo pagas a quien te la dio, no a la app. Sin activarlo, todo lo demás funciona igual.':
      'The only thing that can cost money is the AI coach, because it runs on your own key: what you spend you pay to whoever gave it to you, not to the app. Without turning it on, everything else works the same.',
    'Por el nombre: todos se llaman *Training FR · algo*, así que buscando «Training FR» en tu calendario salen todos.':
      'By the name: they are all called *Training FR · something*, so searching “Training FR” in your calendar finds them all.',
    'Pero lo que de verdad los hace fáciles de administrar es meterlos en un calendario propio llamado Training FR, creado antes de importarlos. Así se apagan, se esconden o se borran enteros de un toque.':
      'But what really makes them easy to manage is putting them in a calendar of their own called Training FR, created before you import them. That way they all turn off, hide or delete in one tap.',
    'Eso no lo decide el archivo, lo decide tu app de calendario al preguntarte dónde meterlos. El archivo ya trae el nombre puesto para que te lo ofrezca.':
      'The file does not decide that, your calendar app does when it asks you where to put them. The file already carries the name so it can offer it to you.',
    'Y si los quieres quitar, no hace falta buscarlos: en Alertas hay un botón que descarga un archivo que los retira de golpe.':
      'And if you want them gone, there is no need to hunt for them: Reminders has a button that downloads a file which withdraws them all at once.',
    'Por el que tú elijas al descargarlo: un mes, tres, seis, un año o sin límite. La app te dice el día exacto en el que se acabarían con cada opción.':
      'Whichever you choose when you download it: one month, three, six, a year or no limit. The app tells you the exact day they would run out with each option.',
    'Con plazo, los avisos se apagan solos el día que dejes de usar la app, que es lo cómodo. Sin límite se repiten para siempre y hay que quitarlos a mano el día que sobren.':
      'With an end date, the alerts switch themselves off the day you stop using the app, which is the convenient part. With no limit they repeat forever and have to be removed by hand the day they are no longer wanted.',
    'Cuando quedan tres semanas para que se acabe, la pantalla de Alertas te avisa y basta con volver a descargarlo: se estiran desde donde estaban, sin duplicar nada.':
      'When three weeks are left, the Reminders screen warns you and all you have to do is download it again: they extend from where they were, duplicating nothing.',
    'No. Lo que descargas es un archivo, y un archivo es una foto del momento: si mañana cambias la hora del agua, el calendario sigue avisando a la de antes hasta que lo vuelvas a bajar.':
      'No. What you download is a file, and a file is a snapshot: if tomorrow you change your water time, the calendar keeps alerting at the old one until you download it again.',
    'Para que se actualizara solo haría falta una suscripción por URL, es decir, un servidor sirviendo esto todo el rato. Y aun así no valdría: los calendarios refrescan lo suscrito con mucha pereza —algunos una vez al día—, y un aviso que tarda un día en enterarse de que cambiaste la hora es peor que volver a bajar el archivo.':
      'For it to update itself you would need a URL subscription, which means a server serving this all the time. And even then it would not do: calendars refresh what they subscribe to very lazily — some once a day — and an alert that takes a day to find out you changed the time is worse than downloading the file again.',
    'Lo que sí hace la app es no dejar que se te olvide: cuando lo que tienes en el calendario ya no coincide con tus recordatorios —o cuando el plazo que elegiste se está acabando—, la pantalla de Alertas te lo dice y el botón pasa a «Volver a descargar».':
      'What the app does do is not let you forget: when what you have in your calendar no longer matches your reminders — or when the end date you chose is approaching — the Reminders screen tells you and the button changes to “Download again”.',
    'Y volver a bajarlo es seguro: los eventos que ya tienes se actualizan en vez de duplicarse.':
      'And downloading it again is safe: the events you already have are updated rather than duplicated.',

    /* ---------- Preguntas (2) ---------- */
    'Porque la app se sigue construyendo y cada mejora se publica en cuanto está probada.':
      'Because the app is still being built and each improvement is published as soon as it is tested.',
    'La actualización pesa muy poco y no toca tus datos: rutinas, historial y perfil se quedan como están.':
      'The update is tiny and does not touch your data: routines, history and profile stay as they are.',
    'En *Perfil › Actualizaciones* sale la que llevas puesta. Si hay una nueva, ahí mismo aparece un botón que la baja: no hay que buscar nada más.':
      '*Profile › Updates* shows the one you are on. If there is a new one, a button to download it appears right there: there is nothing else to look for.',
    'Sin conexión la pantalla te enseña igual la versión que llevas, y te dice que no ha podido comprobar si hay otra en vez de callarse.':
      'Offline the screen still shows you the version you are on, and says it could not check whether there is another rather than staying quiet.',
    'Si algo se comporta raro justo después de actualizar, casi siempre es que el móvil se ha quedado con archivos de dos versiones mezclados. Para eso está *¿Algo va raro?*, debajo de la versión.':
      'If something behaves oddly right after an update, it is nearly always that the phone has kept files from two versions mixed together. That is what *Something not right?* is for, under the version.',
    'Sí. Se va de la lista, de «que no se te olvide», de las cuentas del día y *de sus alertas*, todo a la vez. Antes no: la alerta se quedaba sonando a las diez para algo que ya no tomabas, y un aviso que te manda tomar lo que has dejado de tomar te enseña a ignorar los avisos.':
      'Yes. It goes from the list, from “do not forget”, from the day’s totals and *from its reminders*, all at once. It did not before: the reminder kept going off at ten for something you no longer took, and an alert telling you to take what you have stopped taking teaches you to ignore alerts.',
    'Si ese suplemento compartía hora con otro, la alerta *no se borra*: se queda con el que sigues tomando. «Tus suplementos» a las 20:00 pasa a llamarse por el que queda.':
      'If that supplement shared an hour with another, the reminder *is not deleted*: it stays with the one you still take. “Your supplements” at 20:00 gets renamed after whichever is left.',
    'Y si cambias la hora de uno que ya tiene alerta, la alerta se mueve con él. Lo que no hace es crearte alertas sin pedirlo: un suplemento nuevo no la tiene hasta que pulses el botón de crearlas.':
      'And if you change the time of one that already has a reminder, the reminder moves with it. What it does not do is create reminders unasked: a new supplement has none until you press the button to create them.',
    'Lo que apagaste sigue apagado y lo que ya sonó hoy no vuelve a sonar, aunque se rehagan.':
      'What you switched off stays off and what has already gone off today does not go off again, even when they are rebuilt.',
    'Sí, si ya la tenías creada. Guardas tus horas en *Perfil › Ajustes* y las alertas de comer que existan se mueven con ellas: te dice cuántas al guardar.':
      'Yes, if you already had it created. You save your times in *Profile › Settings* and whatever meal reminders exist move with them: it tells you how many when you save.',
    'No te crea ninguna: si no tenías alertas de comer, sigues sin tenerlas.':
      'It creates none for you: if you had no meal reminders, you still have none.',
    'Lo mismo pasa con el reparto de los suplementos que van «con el desayuno» o «con la cena»: no guardan una hora, guardan el momento, así que se recolocan solos.':
      'The same goes for supplements set to “with breakfast” or “with dinner”: they do not store an hour, they store the moment, so they reposition themselves.',
    'Sí. El plato no se guarda dentro de la alerta: *se busca en el momento de sonar*, en el menú que tengas activo y en el día que toque. Por eso el martes te dice el plato del martes.':
      'Yes. The dish is not stored inside the reminder: *it is looked up at the moment it goes off*, in whatever plan is active and on the right day. That is why on Tuesday it tells you Tuesday’s dish.',
    'Lo mismo en la tarjeta de la lista: lo que ves ahí es lo de hoy, y mañana enseñará lo de mañana.':
      'The same on the card in the list: what you see there is today’s, and tomorrow it will show tomorrow’s.',
    'Si cambias de menú o creas otro, los avisos siguen al nuevo sin que tengas que rehacer nada.':
      'If you switch meal plans or create another, the alerts follow the new one without you having to redo anything.',
    'Lo único que no cambia solo es *la hora*, que sale de tus horas de comer. Y en el calendario del móvil no va el plato, porque ese archivo se escribe hoy y el evento suena dentro de tres semanas; ahí van el título y las calorías, que no caducan.':
      'The only thing that does not change by itself is *the time*, which comes from your meal times. And the dish does not go into the phone’s calendar, because that file is written today and the event goes off three weeks from now; what goes there is the title and the calories, which do not expire.',
    'Sí. En el archivo del calendario *cada hora va como un evento suyo*, con su repetición semanal y su aviso cinco minutos antes.':
      'Yes. In the calendar file *each hour goes in as its own event*, with its weekly repeat and its alert five minutes before.',
    'Los diez vasos de agua son diez eventos, y un suplemento que tomas a las diez y a las dos son dos. Dentro de la app se ven como una sola tarjeta porque son una sola cosa; en el calendario tienen que ir sueltos porque el calendario no entiende de «diez veces al día».':
      'Ten glasses of water are ten events, and a supplement you take at ten and at two is two. Inside the app they appear as a single card because they are a single thing; in the calendar they have to go separately because a calendar does not understand “ten times a day”.',
    'Por eso el archivo trae más eventos que alertas tienes, y está bien que así sea.':
      'That is why the file carries more events than you have reminders, and that is as it should be.',
    'Porque a esa hora ya comes. La de antes de entrenar va hora y media antes de tu entrenamiento, y si eso cae a menos de tres cuartos de hora de una de tus comidas, *esa comida ya es la de antes de entrenar*.':
      'Because you already eat at that time. The pre-workout one goes an hour and a half before your session, and if that lands less than forty-five minutes from one of your meals, *that meal already is the pre-workout meal*.',
    'Antes salían las dos: con el entreno a las 17:40 y la merienda a las 16:00, tenías un aviso a las 16:00 y otro a las 16:10 mandándote hacer lo mismo. Dos avisos para una comida no son el doble de ayuda, son la mitad de credibilidad.':
      'Both used to appear: with training at 17:40 and the snack at 16:00, you got one alert at 16:00 and another at 16:10 telling you to do the same thing. Two alerts for one meal are not twice the help, they are half the credibility.',
    'Si mueves el entrenamiento o la hora de esa comida y dejan de pisarse, vuelve a aparecer al pulsar «Automáticas».':
      'If you move the workout or that meal’s time so they no longer overlap, it comes back when you press “Automatic”.',
    'Porque un plato entero no cabe en una línea, y tres líneas de menú taparían las horas y los días, que es a lo que se viene a esa pantalla.':
      'Because a whole dish does not fit on one line, and three lines of meal plan would cover the times and days, which is what you come to that screen for.',
    '*Tócalo y se abre entero.* La flecha del lado derecho es la que dice que hay más debajo; vuelve a tocarlo y se cierra.':
      '*Tap it and it opens in full.* The arrow on the right is what says there is more underneath; tap it again and it closes.',
    'Lo que se ve ahí es un adelanto de lo que va a decir el aviso cuando suene: el plato que te toca a esa comida según tu menú de hoy, y sus calorías y su proteína.':
      'What you see there is a preview of what the alert will say when it goes off: the dish due at that meal on today’s plan, with its calories and its protein.',
    'No. Cada alerta que crea la app lleva por dentro una marca de qué la generó: la del agua sabe que es la del agua aunque le cambies el nombre. Al volver a pulsarlo busca esa marca y *actualiza la que ya está* en vez de crear otra.':
      'No. Every reminder the app creates carries a mark inside saying what generated it: the water one knows it is the water one even if you rename it. When you press again it looks for that mark and *updates the one already there* instead of creating another.',
    'Las que has creado tú no llevan esa marca, así que *no se tocan nunca*: ni se cambian ni se borran. La hoja te dice cuántas son antes de que confirmes.':
      'The ones you created yourself do not carry that mark, so they *are never touched*: not changed, not deleted. The sheet tells you how many there are before you confirm.',
    'Y respeta dos cosas más: si apagaste una, sigue apagada —recalcular una hora no es motivo para volver a encenderte algo que decidiste callar—, y lo que ya sonó hoy no vuelve a sonar.':
      'And it respects two more things: if you switched one off, it stays off — recalculating an hour is no reason to switch back on something you decided to silence — and what has already gone off today does not go off again.',
    '*Sí retira* las que creó la app y que ya no tienen sentido: si dejas de tener rutinas, o si una comida pasa a pisarse con otra, esa alerta se va. Te dice cuántas antes de que confirmes, y nunca toca una tuya.':
      '*It does remove* the ones the app created that no longer make sense: if you stop having routines, or one meal starts overlapping another, that reminder goes. It tells you how many before you confirm, and it never touches one of yours.',
    'Por eso tiene sentido pulsarlo cada vez que cambies de peso, de horas de comer o de rutina: las horas se recalculan solas.':
      'That is why it is worth pressing every time your weight, your meal times or your routine change: the times recalculate themselves.',
    'Lo de comer sale de las horas que tienes puestas en *Perfil › Ajustes*, no de un reparto inventado: si desayunas a las 8:15, el aviso es a las 8:15 y dice «es hora de desayunar».':
      'The meal ones come from the times set in *Profile › Settings*, not from an invented schedule: if you have breakfast at 8:15, the alert is at 8:15 and says “time for breakfast”.',
    'Porque cambia a qué hora conviene comer. Hay tratamientos que se toman en ayunas y otros que piden comida delante, y algunos no se llevan bien con el café, con los lácteos o con un suplemento que ya tomas. Un menú montado sin saberlo puede ponerte justo lo que no toca donde no toca.':
      'Because it changes what time it makes sense to eat. Some treatments are taken on an empty stomach and others need food first, and some do not get on with coffee, with dairy or with a supplement you already take. A meal plan built without knowing can put exactly the wrong thing exactly where it should not be.',
    '*La app no receta ni cambia nada de tu tratamiento.* Lo único que hace es colocar las comidas y lo que tomas alrededor de tus tomas, y avisarte si algo se pisa. Cualquier cambio lo decide tu médico o tu farmacéutico.':
      '*The app does not prescribe or change anything about your treatment.* All it does is arrange your meals and what you take around your doses, and warn you if something clashes. Any change is your doctor’s or your pharmacist’s decision.',
    'No está en tu perfil a propósito: se pregunta al crear el menú, se acuerda de tu respuesta para no repetirlo cada vez, y se cambia ahí mismo. Se queda en tu móvil como el resto de tus datos y solo viaja al entrenador con tu propia clave.':
      'It is deliberately not in your profile: you are asked when you create a meal plan, it remembers your answer so it does not ask every time, and you change it right there. It stays on your phone like the rest of your data and only travels to the coach with your own key.',
    'Si dices que no tomas ninguna, no vuelve a preguntártelo y no te mete avisos de interacciones que no tienes.':
      'If you say you take none, it does not ask again and does not put in warnings about interactions you do not have.',
    'Lo primero: mira que tengas puesto tu país en *Perfil › Datos y hábitos*, justo debajo de tu nombre. Es obligatorio, y de ahí sale de qué supermercado se monta el menú.':
      'First: check that your country is set in *Profile › Data and habits*, right under your name. It is required, and which supermarket the plan is built from comes from there.',
    'Con el país puesto, los nombres son los de tu sitio: las mismas verduras, los mismos cortes de carne y los mismos pescados que pides tú, no los de otro país. Si una cosa se conoce por dos nombres, te pone el tuyo y el otro entre paréntesis la primera vez.':
      'With the country set, the names are the ones where you live: the same vegetables, the same cuts of meat and the same fish you actually ask for, not another country’s. If something goes by two names, it puts yours first and the other in brackets the first time.',
    'Si no lo has puesto, la app lo deduce de la zona horaria del móvil. Acierta casi siempre, pero no avisa cuando falla: por eso se pregunta.':
      'If you have not set it, the app works it out from the phone’s time zone. It is nearly always right, but it does not warn you when it is wrong: which is why it asks.',
    'Y lo que de verdad manda es lo que pones en *Con qué cuentas*: si el menú sale con cosas que no tienes, escribe ahí lo que sueles comprar y el siguiente se monta con eso.':
      'And what really decides is what you put under *What you have to work with*: if the plan comes out with things you do not have, write there what you usually buy and the next one is built from that.',
    'Son una estimación calculada con tus datos —sexo, peso, altura, edad, actividad y objetivo— con las fórmulas habituales.':
      'They are an estimate worked out from your data — sex, weight, height, age, activity and goal — with the usual formulas.',
    'Sirven como punto de partida, no como verdad absoluta: dos personas con los mismos números gastan distinto. Lo que manda es cómo responde tu peso a lo largo de varias semanas; si no se mueve como esperabas, ajusta.':
      'They work as a starting point, not as absolute truth: two people with the same numbers burn differently. What matters is how your weight responds over several weeks; if it does not move the way you expected, adjust.',
    'Sí, en Ajustes. Y no es solo cambiar la etiqueta: los saltos de peso que te propone la app también cambian, porque en libras el gimnasio va de cinco en cinco.':
      'Yes, in Settings. And it is not just changing the label: the weight jumps the app suggests change too, because in pounds a gym goes up five at a time.',

    /* ---------- Pasos de una palabra ---------- */
    'Guarda.':
      'Save.',
    'Ordena.':
      'Put them in order.',
    'Pruébala.':
      'Give it a go.',

    /* ---------- la app en dos idiomas ---------- */
    'La app en dos idiomas': 'The app in two languages',
    'Español o inglés, de un toque y sin perder nada':
      'Spanish or English, one tap, nothing lost',
    'La app entera está en español y en inglés: los botones, este manual, las guías de técnica, los avisos y lo que te escribe el entrenador.':
      'The whole app is in Spanish and English: the buttons, this manual, the technique guides, the reminders and whatever the coach writes you.',
    'Se cambia con el botón *ES / EN* de arriba a la derecha, al lado del que cambia el tema, o desde Ajustes › Idioma. Igual que el del tema, dice el idioma al que te lleva, no el que tienes puesto.':
      'You switch with the *ES / EN* button at the top right, next to the one that changes the theme, or from Settings › Language. Like the theme one, it names the language it takes you to, not the one you are on.',
    'No hay nada que descargar ni que esperar: el cambio es inmediato y funciona sin conexión en los dos idiomas, porque las traducciones viajan dentro de la app.':
      'There is nothing to download and nothing to wait for: the switch is immediate and works offline in both languages, because the translations travel inside the app.',
    'Lo que has escrito tú no se toca: el nombre de tus rutinas, tus notas, tus comidas y tus suplementos se quedan tal y como los escribiste. Lo que cambia de idioma es lo que pone la app.':
      'What you wrote yourself is left alone: your routine names, your notes, your meals and your supplements stay exactly as you typed them. What changes language is what the app puts there.',
    'El catálogo de ejercicios es caso aparte: viene en inglés de origen. Con la app en inglés ves los nombres y las instrucciones originales, y en español los ves traducidos.':
      'The exercise catalogue is its own case: it comes in English to begin with. With the app in English you see the original names and instructions; in Spanish you see them translated.',
    'Al entrenador con IA se le habla en el idioma que tengas puesto, y contesta en ese mismo.':
      'The AI coach is spoken to in whichever language you have set, and it answers in that one.',
    '¿Puedo poner la app en inglés?': 'Can I switch the app to English?',
    'Sí, entera. El botón *ES / EN* de arriba a la derecha la cambia de un toque, y también está en Ajustes › Idioma.':
      'Yes, all of it. The *ES / EN* button at the top right switches it with one tap, and it is also in Settings › Language.',
    'Cambia todo lo que pone la app: botones, manual, guías de técnica, avisos y el entrenador. Lo que has escrito tú se queda como está.':
      'Everything the app puts there changes: buttons, manual, technique guides, reminders and the coach. What you wrote yourself stays as it is.',
    /* ---------- instalar la app ---------- */
    'La app te lo ofrece sola al poco de abrirla, con un aviso abajo. Si lo cerraste o quieres hacerlo ahora, el camino depende de dónde la hayas abierto:':
      'The app offers it on its own shortly after you open it, with a prompt at the bottom. If you closed it or want to do it now, the route depends on where you opened the app:',
    'Android o el ordenador': 'Android or the computer',
    'Hay un botón que lo hace de una vez': 'There is a button that does it in one go',
    'Pulsa *Instalar* en el aviso de abajo.': 'Tap *Install* in the prompt at the bottom.',
    'Si no está en pantalla, el mismo botón vive en Ajustes › Instalar en el móvil.':
      'If it is not on screen, the same button lives under Settings › Install on your phone.',
    'Acepta el cuadro que saca el navegador.': 'Accept the box the browser puts up.',
    'Es el diálogo del sistema, no de la app: ahí se decide de verdad.':
      'That is the system’s dialog, not the app’s: that is where it really happens.',
    'iPhone o iPad': 'iPhone or iPad',
    'A mano, porque Apple no deja hacerlo de otra forma':
      'By hand, because Apple allows no other way',
    'Toca el botón de *Compartir* en la barra de Safari.':
      'Tap the *Share* button in the Safari bar.',
    'Es el cuadrado con la flecha hacia arriba. En Chrome está arriba a la derecha.':
      'It is the square with the arrow pointing up. In Chrome it is at the top right.',
    'Baja por la lista hasta *Añadir a pantalla de inicio*.':
      'Scroll down the list to *Add to Home Screen*.',
    'Está más abajo de lo que parece, pasadas las opciones de compartir.':
      'It is further down than you would think, past the sharing options.',
    'Dale a *Añadir*.': 'Tap *Add*.',
    'Sale con su icono, como una app más. Desde ahí arranca a pantalla completa y funciona sin conexión.':
      'It shows up with its icon, like any other app. From there it opens full screen and works offline.',
    'La abrí desde WhatsApp o Instagram': 'I opened it from WhatsApp or Instagram',
    'Primero hay que salir de ahí': 'You have to get out of there first',
    'Toca los tres puntos de esa ventana, arriba a la derecha.':
      'Tap the three dots in that window, at the top right.',
    'El navegador que esas apps abren por dentro no puede instalar nada. Es cosa del sistema, no de Training FR.':
      'The browser those apps open inside themselves cannot install anything. That is the system, not Training FR.',
    'Elige *Abrir en Safari* o *Abrir en el navegador*.':
      'Choose *Open in Safari* or *Open in browser*.',
    'Ya fuera, sigue los pasos de tu móvil de aquí arriba.':
      'Once outside, follow the steps for your phone above.',
    'Se instale como se instale, es la misma app y los mismos datos: no se descarga nada de ninguna tienda, solo se crea el acceso. Si ya la tienes en la pantalla de inicio y aun así te sale el aviso, es que abriste el enlace en el navegador: desde ahí Safari no puede saberlo. Pulsa «Ya la tengo» y no vuelve a salir.':
      'However it gets installed, it is the same app and the same data: nothing is downloaded from any store, it just creates the shortcut. If you already have it on your home screen and the prompt still shows up, it is because you opened the link in the browser: from there Safari has no way of knowing. Tap “I already have it” and it will not come back.',
    '¿Por qué no me sale el botón de instalar?': 'Why is there no install button?',
    'Porque no todos los navegadores lo tienen. El botón que instala de una vez lo dan Chrome y Edge, en Android y en el ordenador; ahí la app te lo ofrece sola.':
      'Because not every browser has one. The button that installs in one go comes from Chrome and Edge, on Android and on the computer; there the app offers it on its own.',
    'En el iPhone ese botón no existe en ningún sitio: Apple obliga a añadirla a mano desde Compartir. La app te enseña los pasos en vez del botón.':
      'On the iPhone that button exists nowhere: Apple requires you to add it by hand from Share. The app shows you the steps instead of the button.',
    'Y si abriste el enlace dentro de WhatsApp, Instagram o parecidos, ahí no se puede instalar de ninguna manera: hay que abrirlo antes en el navegador de verdad.':
      'And if you opened the link inside WhatsApp, Instagram or the like, nothing can be installed there at all: you have to open it in a real browser first.',
    'También desaparece cuando ya la tienes instalada, que es lo normal si arrancaste desde el icono.':
      'It also goes away once you have it installed, which is the usual case if you started from the icon.',

    /* ---------- la actividad en el reparto ---------- */
    'Lo que hiciste fuera del gimnasio sale *dentro* de la barra de su zona, como un trozo azul en el extremo. No es una parte de tus series y no mueve el número de la derecha: un partido trabaja la pierna, pero sumarlo te diría que estás más cerca de tu objetivo de pesas de lo que estás, que es justo lo que esta pantalla sirve para ver.':
      'What you did outside the gym shows *inside* its area’s bar, as a blue piece at the end. It is not part of your sets and it does not move the number on the right: a match works your legs, but adding it would tell you that you are closer to your lifting target than you are, which is exactly what this screen is for.',
    'Si tienes el entrenador puesto, dentro de esa hoja te añade a cuántas series de gimnasio equivaldría todo ese tiempo. Es una opinión suya —por eso va en azul y con su chispa— y sigue sin entrar en el número: está ahí porque es la pregunta que lleva a tocar el azul, no para que la app se corrija a sí misma.':
      'If you have the AI coach set up, inside that sheet it adds how many gym sets all that time would be worth. That is its opinion —which is why it is blue and has its spark— and it still does not enter the number: it is there because it is the question that makes you tap the blue, not so the app can correct itself.',
    'Toca ese trozo azul y te cuenta qué fue: los minutos, cada actividad por su nombre y los músculos que movió. Su ancho cambia con los minutos, así que sirve para comparar una zona con otra, pero no con el verde de al lado: minutos y series no son la misma unidad y no caben en la misma regla.':
      'Tap that blue piece and it tells you what it was: the minutes, each activity by name and the muscles it moved. Its width changes with the minutes, so it is good for comparing one area against another, but not against the green next to it: minutes and sets are not the same unit and do not fit on the same scale.',

    /* ---------- llegar cargado de lo de fuera ---------- */
    'Llegar cargado de lo de fuera':
      'Arriving loaded from what you did outside',
    'Lo que un partido o una caminata le hacen al entrenamiento de hoy':
      'What a match or a long walk does to today’s session',
    'Un partido o una subida al monte no dejan series, así que no cuentan en el reparto por zona: no hay forma honesta de decir cuántas series valen, y meterlos ahí te diría que estás más cerca de tu objetivo de pesas de lo que estás.':
      'A match or a climb up the mountain leaves no sets, so they do not count in the breakdown by area: there is no honest way to say how many sets they are worth, and putting them there would tell you that you are closer to your lifting target than you are.',
    'Pero sí dejan la pierna cargada, y eso sí cambia algo: cómo te sale el entrenamiento de hoy.':
      'What they do leave is loaded legs, and that does change something: how today’s session goes.',
    'Si en las *36 horas* anteriores apuntaste una actividad de *media hora o más* que trabaja los mismos músculos que te tocan hoy, la portada te lo dice debajo del botón de entrenar, con los minutos y las zonas.':
      'If in the previous *36 hours* you logged an activity of *half an hour or more* that works the same muscles you are due to train today, the home screen tells you underneath the train button, with the minutes and the areas.',
    'No es un regaño ni te quita nada: es un dato para que no te extrañe ir flojo. Si las notas pesadas, baja una serie por ejercicio o quita algo de peso. Rendir menos el día después de dos horas de fútbol es lo normal.':
      'It is not a telling-off and it takes nothing away: it is there so that feeling weak does not surprise you. If they feel heavy, drop a set per exercise or take some weight off. Performing worse the day after two hours of football is normal.',
    'El aviso es una regla: se calcula con lo que tienes apuntado y funciona sin conexión.':
      'The warning is a rule: it is worked out from what you have logged and works offline.',
    'Si tienes el entrenador puesto, detrás te añade *en azul* a cuántas series de gimnasio equivale, más o menos, lo que ya llevas encima. Eso sí es una opinión, y por eso va en otro color y no entra en el reparto ni en ninguna gráfica: no hay tabla que diga cuánto vale un partido, y meter ahí un número inventado ensuciaría la única cifra con la que comparas una semana con otra.':
      'If you have the AI coach set up, after it you get *in blue* roughly how many gym sets what you already have on you is worth. That one is an opinion, which is why it is a different colour and never enters the split or any chart: no table says what a football match is worth, and putting a made-up number in there would spoil the one figure you compare one week against another with.',
    /* ---------- Qué puede leer la app de tu reloj ---------- */
    'Qué puede leer la app de tu reloj': 'What the app can read from your watch',
    'Por qué hay tres caminos y no uno solo': 'Why there are three routes and not just one',
    'La app puede traer lo que mide tu reloj —pasos, pulso, sueño, calorías, peso— y enseñarlo junto a lo que entrenas. Pero hay una realidad que conviene saber de entrada: *una página web no puede leer el Apple Watch*. Safari no da acceso a Salud ni a Bluetooth, y eso no es un fallo de la app ni algo que se arregle con código.':
      'The app can bring in what your watch measures —steps, heart rate, sleep, calories, weight— and show it next to what you train. But there is one fact worth knowing up front: *a web page cannot read the Apple Watch*. Safari gives access to neither Health nor Bluetooth, and that is not a bug in the app nor something code can fix.',
    'Por eso hay tres caminos, y cada uno se enciende cuando tu dispositivo lo permite:':
      'That is why there are three routes, and each one lights up when your device allows it:',
    '*Un archivo*: el export.xml de Salud de Apple, o los .gpx, .tcx, .csv y .json que exporta cualquier reloj. Esto funciona en todos los dispositivos, siempre.':
      '*A file*: the export.xml from Apple Health, or the .gpx, .tcx, .csv and .json any watch exports. This works on every device, always.',
    '*Un atajo de iOS*: Atajos sí puede leer Salud. Le dices qué quieres, lo copia y lo pegas en la app. Es la única vía cómoda con Apple Watch, y se monta una vez.':
      '*An iOS Shortcut*: Shortcuts can read Health. You tell it what you want, it copies it and you paste it into the app. It is the only comfortable route with an Apple Watch, and you set it up once.',
    'Cada fuente rellena lo que sabe y no pisa lo que ya había: si el atajo trae los pasos de la mañana y por la tarde importas un archivo con el pulso, el día queda con las dos cosas. Del pulso máximo se queda siempre el mayor.':
      'Each source fills in what it knows and does not tread on what was already there: if the shortcut brings in the morning steps and in the afternoon you import a file with your heart rate, the day ends up with both. Of the maximum heart rate it always keeps the higher one.',
    'El día se guarda tal y como lo escribió el reloj, no convertido a tu hora: si exportas en Madrid y abres el archivo en otro país, los datos siguen en el día en que los mediste.':
      'The day is saved exactly as the watch wrote it, not converted to your time: if you export in Madrid and open the file in another country, the data stays on the day you measured it.',

    /* ---------- Traer los datos de tu reloj ---------- */
    'Traer los datos de tu reloj': 'Bring in your watch data',
    'Bluetooth, un archivo o un atajo de iOS': 'Bluetooth, a file or an iOS Shortcut',
    'Tres caminos, y el que te sirve depende del móvil desde el que abras la app. Puedes usar los tres a la vez: cada uno rellena lo que sabe sin pisar al otro.':
      'Three routes, and which one serves you depends on the phone you open the app from. You can use all three at once: each fills in what it knows without treading on the others.',

    /* La rama del Bluetooth */
    'Pulso en vivo por Bluetooth': 'Live heart rate over Bluetooth',
    'Android, Windows, Mac y Linux. En iPhone no existe':
      'Android, Windows, Mac and Linux. On iPhone it does not exist',
    'Abre Reloj y salud.': 'Open Watch and health.',
    'Está en Perfil, en el grupo de Entrenamiento.': 'It is in Profile, in the Training group.',
    'Abrir Reloj y salud': 'Open Watch and health',
    'Pon el sensor a emitir.': 'Set the sensor to broadcast.',
    'Banda de pecho: humedece la tira y póntela. Pulsera o reloj: activa el modo de difusión de pulso (suele llamarse «Emitir frecuencia cardiaca» o «Broadcast»). Si el reloj está emparejado con otro móvil, ciérralo allí primero: solo emite a uno.':
      'Chest strap: wet the band and put it on. Band or watch: turn on heart-rate broadcast mode (it is usually called «Broadcast heart rate»). If the watch is paired with another phone, close it there first: it only broadcasts to one.',
    'El navegador enseña su propia lista de dispositivos cercanos. Elige el tuyo y acepta. Esa ventana es del navegador, no de la app: la app nunca ve más dispositivos que el que tú elijas.':
      'The browser shows its own list of nearby devices. Pick yours and accept. That window belongs to the browser, not to the app: the app never sees any device other than the one you choose.',
    'Entrena.': 'Train.',
    'Suéltalo cuando acabes.': 'Disconnect it when you are done.',
    'Si el bloque de arriba dice «Pulso en vivo: aquí no», es el navegador el que no lo trae. Ahí te dice cuál es el motivo y te quedan los otros dos caminos.':
      'If the block at the top says «Live heart rate: not here», it is the browser that does not bring it. It tells you the reason there, and the other two routes are still open.',

    /* La rama del archivo */
    'Funciona en cualquier móvil y con cualquier marca':
      'Works on any phone and with any brand',
    'Exporta desde donde estén tus datos.': 'Export from wherever your data lives.',
    'Salud de Apple: tu foto arriba a la derecha › *Exportar todos los datos de salud*. Garmin, Polar, Suunto, Coros y similares: exporta la actividad en .tcx o .gpx. Otros: cualquier .csv o .json con una fila por día vale.':
      'Apple Health: your photo at the top right › *Export All Health Data*. Garmin, Polar, Suunto, Coros and the like: export the activity as .tcx or .gpx. Others: any .csv or .json with one row per day will do.',
    'Si lo que te dan es un .zip, descomprímelo.': 'If what you get is a .zip, unzip it.',
    'El de Salud de Apple viene comprimido y dentro está el *export.xml*, que es el que hay que traer. Un .fit no sirve: es binario cerrado y el navegador no puede abrirlo; exporta en .tcx o .gpx en su lugar.':
      'The one from Apple Health comes compressed, and inside is the *export.xml*, which is the one to bring. A .fit is no good: it is closed binary and the browser cannot open it; export as .tcx or .gpx instead.',
    'Abre Reloj y salud y pulsa *Elegir archivo*.': 'Open Watch and health and tap *Choose a file*.',
    'Elegir un archivo ahora': 'Choose a file now',
    'Espera a que termine de leer.': 'Wait for it to finish reading.',
    'El export de Salud puede pesar cientos de megas, así que se lee a trozos y verás el porcentaje. Se puede seguir usando la app mientras tanto.':
      'The Health export can weigh hundreds of megabytes, so it is read in chunks and you will see the percentage. You can keep using the app in the meantime.',
    'Al acabar te dice cuántos días ha traído. Los días se guardan con la fecha que escribió el reloj, no con la hora de donde abras el archivo.':
      'When it is done it tells you how many days it brought in. Days are saved with the date the watch wrote, not with the time of wherever you open the file.',

    /* La rama del atajo */
    'Con un atajo de iOS': 'With an iOS Shortcut',
    'La única vía cómoda con Apple Watch': 'The only comfortable route with an Apple Watch',
    'Abre Reloj y salud y despliega *Ver cómo* en el bloque del atajo.':
      'Open Watch and health and open up *See how* in the shortcut block.',
    'Ahí tienes el texto exacto que hay que escribir, listo para copiar.':
      'The exact text to write is there, ready to copy.',
    'Ver cómo se monta': 'See how it is set up',
    'En la app Atajos del iPhone, crea uno nuevo.': 'In the Shortcuts app on the iPhone, create a new one.',
    'Botón *+* arriba a la derecha.': '*+* button at the top right.',
    'Añade una acción *Obtener muestras de salud* por cada dato.':
      'Add one *Find Health Samples* action per figure.',
    'Pasos con tipo Suma y periodo Hoy; pulso en reposo con Promedio; calorías activas con Suma; sueño con Suma; peso con El más reciente. Los que no te interesen, no los pongas.':
      'Steps with type Sum and period Today; resting heart rate with Average; active calories with Sum; sleep with Sum; weight with Latest. The ones you do not care about, leave out.',
    'Añade una acción *Texto* con una línea por dato.':
      'Add a *Text* action with one line per figure.',
    'Nombre del dato, dos puntos, y detrás el resultado de su acción. La app entiende los nombres en español y en inglés, y le da igual el orden de las líneas.':
      'The name of the figure, a colon, and after it the result of its action. The app understands the names in Spanish and in English, and the order of the lines makes no difference.',
    'Termina con *Copiar al portapapeles*.': 'Finish with *Copy to Clipboard*.',
    'Ejecuta el atajo, vuelve a la app y pega en el recuadro. Botón *Guardar estos datos*.':
      'Run the shortcut, come back to the app and paste into the box. *Save this data* button.',
    'Si quieres que se haga solo, ponle una automatización diaria.':
      'If you want it to happen on its own, give it a daily automation.',
    'En Atajos › Automatización, a la hora que quieras. Con sesión iniciada puedes ir más lejos: en vez de copiar y pegar, la acción *Obtener contenido de URL* sube los datos directamente. La dirección sale en esa misma pantalla.':
      'In Shortcuts › Automation, at whatever time you like. Signed in you can go further: instead of copying and pasting, the *Get Contents of URL* action uploads the data straight away. The address is shown on that same screen.',
    'Se monta una vez y ya no se toca. Es la forma de que un Apple Watch acabe dentro de la app, porque Safari no deja leer Salud desde una página web.':
      'You set it up once and never touch it again. It is the way an Apple Watch ends up inside the app, because Safari does not let a web page read Health.',

    /* ---------- El mapa de aparatos ---------- */
    'La primera vez, pulsa *Buscar*.': 'The first time, tap *Search*.',
    'Las siguientes, tócalo en *Los tuyos*.': 'After that, tap it under *Yours*.',
    'Desde la primera vez queda guardado con su nombre, y aparece en una lista debajo. Un toque y se vuelve a enganchar. Si ya no lo usas, *Olvidar* lo quita de ahí; lo que midió se queda.':
      'From the first time it is saved with its name and shows up in a list below. One tap and it hooks back up. If you no longer use it, *Forget* takes it off that list; what it measured stays.',
    'Durante la sesión verás las pulsaciones junto al cronómetro, y si tienes uno guardado se engancha solo al empezar. Al terminar, el pulso medio y el máximo se guardan con ese entrenamiento y en el día.':
      'During the session you will see your beats next to the timer, and if you have one saved it hooks up by itself when you start. When you finish, the average and maximum heart rate are saved with that workout and in the day.',
    'Botón *Soltar*. Si no, la conexión sigue gastando batería del sensor. Un corte a mitad de serie no hace falta soltarlo: se vuelve a enganchar solo.':
      '*Disconnect* button. Otherwise the connection keeps draining the sensor battery. A drop mid-set needs no disconnecting: it hooks back up on its own.',

    'Guardé mi banda, ¿por qué me la sigue preguntando al conectar?':
      'I saved my strap, why does it keep asking me when I connect?',
    'Porque eso no lo decide la app, lo decide el navegador. Volver a un aparato ya autorizado sin preguntar nada necesita una función que solo traen Chrome en Android y en ChromeOS; el de escritorio la lleva detrás de un ajuste que viene apagado.':
      'Because the app does not decide that, the browser does. Going back to an already authorised device without asking anything needs a feature only Chrome on Android and on ChromeOS carry; the desktop one keeps it behind a setting that ships switched off.',
    'Donde está, tocar el tuyo en *Los tuyos* conecta directamente y no sale ninguna ventana. Donde no está, sale la del navegador, pero filtrada por el nombre que guardaste: en vez de una lista de diez cosas aparece él solo, y es un toque más, no una búsqueda.':
      'Where it is there, tapping yours under *Yours* connects straight away and no window appears. Where it is not, the browser\'s window comes up, but filtered by the name you saved: instead of a list of ten things, only it appears, and that is one more tap, not a search.',
    'La lista sirve igual en los dos casos, y vale la pena por otra cosa: viaja con tu cuenta. Lo que enganches en el móvil aparece en el portátil.':
      'The list is just as useful either way, and it earns its keep for another reason: it travels with your account. What you hook up on your phone shows up on your laptop.',
    'Dentro de un entrenamiento sí se engancha solo, sin preguntar, cuando el navegador lo permite. Cuando no lo permite, la app prefiere quedarse sin pulso antes que abrirte una ventana en medio de una serie.':
      'Inside a workout it does hook up by itself, without asking, when the browser allows it. When it does not, the app would rather go without a heart rate than open a window on you in the middle of a set.',

    '*Bluetooth en vivo*: cualquier banda de pecho, pulsera o reloj que emita pulso se conecta directamente y verás las pulsaciones mientras entrenas, con el medio y el máximo guardados en la sesión. El aparato queda guardado con su nombre, así que la segunda vez es un toque y no una búsqueda, y dentro de un entrenamiento se engancha solo. Funciona en Chrome y Edge, en Android, Windows, Mac y Linux. En iPhone y iPad no existe en ningún navegador.':
      '*Live Bluetooth*: any chest strap, band or watch that broadcasts heart rate connects directly and you will see your beats while you train, with the average and the maximum saved in the session. The device is saved with its name, so the second time is a tap and not a search, and inside a workout it hooks up by itself. It works in Chrome and Edge, on Android, Windows, Mac and Linux. On iPhone and iPad it exists in no browser at all.',

    /* ---------- Las dudas del reloj ---------- */
    '¿Por qué no puedo conectar mi Apple Watch a la app?':
      'Why can I not connect my Apple Watch to the app?',
    'Porque ningún navegador del iPhone puede. Safari no da acceso ni a Salud ni a Bluetooth, y en iOS todos los navegadores —Chrome, Firefox, el que sea— son Safari por dentro. No es un permiso que se pueda pedir ni algo que se arregle con código: esa puerta no existe.':
      'Because no browser on the iPhone can. Safari gives access to neither Health nor Bluetooth, and on iOS every browser —Chrome, Firefox, whichever— is Safari underneath. It is not a permission that can be asked for nor something code can fix: that door does not exist.',
    'Lo que sí existe es Atajos, que es de Apple y sí lee Salud. Montas un atajo una vez, le dices qué datos quieres, y con un toque los deja en la app. Si le pones una automatización diaria, ni eso.':
      'What does exist is Shortcuts, which is Apple\'s own and can read Health. You build a shortcut once, tell it which figures you want, and with one tap it drops them into the app. Give it a daily automation and not even that.',
    'Y siempre queda exportar Salud entera a un archivo y traerlo aquí: eso funciona en cualquier móvil.':
      'And there is always exporting the whole of Health to a file and bringing it here: that works on any phone.',
    'El pulso en vivo por Bluetooth sí funciona con cualquier banda de pecho o pulsera que emita, pero solo desde Android, Windows, Mac o Linux.':
      'Live heart rate over Bluetooth does work with any chest strap or band that broadcasts, but only from Android, Windows, Mac or Linux.',

    '¿Por qué no me sale el botón de buscar por Bluetooth?':
      'Why is there no Bluetooth search button?',
    'El bloque de arriba te dice el motivo concreto, que siempre es uno de estos cuatro.':
      'The block at the top tells you the exact reason, which is always one of these four.',
    '*Estás en iPhone o iPad.* Ningún navegador de iOS trae Bluetooth. No hay vuelta a esto; usa el atajo o un archivo.':
      '*You are on iPhone or iPad.* No iOS browser carries Bluetooth. There is no way around this; use the shortcut or a file.',
    '*Estás en Firefox.* Firefox decidió no implementarlo. Con Chrome o Edge en el mismo ordenador o móvil funciona.':
      '*You are on Firefox.* Firefox chose not to implement it. It works with Chrome or Edge on the same computer or phone.',
    '*La página no va por https.* Bluetooth solo se ofrece en conexiones seguras. Si abriste la app por una dirección normal de internet, ya va por https; si la abriste desde un archivo local, no.':
      '*The page is not on https.* Bluetooth is only offered on secure connections. If you opened the app from a normal internet address it is already on https; if you opened it from a local file, it is not.',
    '*Tu navegador no lo trae.* Algunos navegadores de escritorio lo traen apagado o directamente no lo tienen.':
      '*Your browser does not carry it.* Some desktop browsers ship it switched off or simply do not have it.',
    'En todos los casos los otros dos caminos siguen ahí, y traen más cosas que el pulso: pasos, sueño, calorías y peso.':
      'In every case the other two routes are still there, and they bring in more than heart rate: steps, sleep, calories and weight.',

    'Mi reloj exporta en .fit y la app no lo acepta, ¿qué hago?':
      'My watch exports .fit and the app will not take it, what do I do?',
    'Un .fit es un formato binario cerrado de Garmin. Leerlo en el navegador necesitaría una librería pesada solo para eso, y todos los relojes que exportan .fit exportan también .tcx o .gpx, que son texto y llevan lo mismo.':
      'A .fit is a closed binary format from Garmin. Reading it in the browser would need a heavy library just for that, and every watch that exports .fit also exports .tcx or .gpx, which are text and carry the same thing.',
    'En Garmin Connect: abre la actividad, menú de los tres puntos, *Exportar a TCX* o *Exportar a GPX*. En Strava y en casi cualquier otro sitio hay una opción equivalente.':
      'In Garmin Connect: open the activity, the three-dot menu, *Export to TCX* or *Export to GPX*. Strava and almost anywhere else has an equivalent option.',
    'Del .tcx sale la distancia, las calorías, los minutos y el pulso medio y máximo. Del .gpx sale la distancia calculada punto a punto, y el pulso si el archivo lo lleva dentro.':
      'From a .tcx come the distance, the calories, the minutes and the average and maximum heart rate. From a .gpx comes the distance worked out point by point, and the heart rate if the file carries it inside.',

    'Si importo dos veces o mezclo fuentes, ¿se pisan los datos?':
      'If I import twice or mix sources, does the data get overwritten?',
    'No. Cada fuente rellena lo que sabe y deja en paz lo demás. Si el atajo de por la mañana trae los pasos y por la tarde importas un archivo con el pulso y el sueño, ese día acaba con las tres cosas.':
      'No. Each source fills in what it knows and leaves the rest alone. If the morning shortcut brings in the steps and in the afternoon you import a file with heart rate and sleep, that day ends up with all three.',
    'Un dato repetido se queda con el valor nuevo, salvo el pulso máximo: de ese se queda siempre el mayor, porque un máximo menor casi nunca significa que el anterior estuviera mal, sino que esa fuente vio menos rato.':
      'A repeated figure keeps the new value, except the maximum heart rate: of that it always keeps the higher one, because a lower maximum almost never means the earlier one was wrong, only that this source watched for less time.',
    'Los ceros y los vacíos no cuentan como dato: si una fuente no trae los pasos, no te borra los que ya tenías.':
      'Zeros and blanks do not count as data: if a source does not bring in the steps, it will not wipe the ones you already had.',
    'Así que importar dos veces el mismo archivo no duplica nada ni estropea nada: deja el día como estaba.':
      'So importing the same file twice duplicates nothing and spoils nothing: it leaves the day as it was.',

    'Importé el archivo y los días salen corridos, ¿por qué?':
      'I imported the file and the days are shifted, why?',
    'No deberían. La app guarda cada dato en el día que escribió el reloj, tal cual, sin convertirlo a la hora del sitio donde abras el archivo. Un pulso en reposo medido a las seis de la mañana en Madrid se queda en ese día aunque abras el archivo en Bogotá.':
      'They should not be. The app saves every figure on the day the watch wrote, as it stands, without converting it to the time of wherever you open the file. A resting heart rate measured at six in the morning in Madrid stays on that day even if you open the file in Bogotá.',
    'Si aun así ves algo corrido, el sitio donde mirar es el archivo. La app entiende *2026-09-24* y *24/09/2026*, y si el segundo número pasa de 12 —*09/24/2026*— sabe que viene en orden americano y lo endereza. Lo que no puede adivinar nadie es un *03/04*: ahí no hay forma de saber si es el tres de abril o el cuatro de marzo. Si tu reloj exporta así, pásalo a *2026-09-24*, que no es ambiguo en ningún país.':
      'If you still see something shifted, the place to look is the file. The app understands *2026-09-24* and *24/09/2026*, and if the second number goes above 12 —*09/24/2026*— it knows it comes in American order and straightens it out. What nobody can guess is a *03/04*: there is no way of telling the third of April from the fourth of March. If your watch exports like that, convert it to *2026-09-24*, which is ambiguous in no country.',


    /* ---------- Medir con el GPS ---------- */
    'Qué hace la app con el GPS': 'What the app does with GPS',
    'De dónde salen los kilómetros y por qué tira la mitad de los puntos':
      'Where the kilometres come from and why it throws half the points away',
    'Cuando apuntas un paseo a mano, las calorías salen de los minutos: la app sabe cuánto anduviste pero no a qué paso, así que usa el ritmo medio de andar. Midiendo con el GPS deja de hacer falta suponerlo.':
      'When you log a walk by hand, the calories come from the minutes: the app knows how long you walked but not how fast, so it uses an average walking pace. Measuring with GPS, there is no longer anything to assume.',
    'Lo importante es que *el GPS no sustituye la cuenta, se la completa*. Las calorías siguen saliendo de lo de siempre —tu peso por el esfuerzo por el tiempo—, pero el esfuerzo ya no es el de una tabla: sale de la velocidad que de verdad llevaste. Andar a 4 por hora y andar a 7 dejan de valer lo mismo, que es justo lo que pasaba antes.':
      'The important part is that *GPS does not replace the sum, it completes it*. The calories still come from the usual thing —your weight times the effort times the time— but the effort no longer comes from a table: it comes from the speed you actually kept. Walking at 4 an hour and walking at 7 stop being worth the same, which is exactly what used to happen.',
    '*La app tira puntos a propósito, y eso es lo que hace que el número valga.* Un GPS de móvil, entre edificios o recién encendido, da posiciones que se van cien metros y vuelven. Si se sumaran todas, un café sentado en una terraza serían dos kilómetros. Por eso no se suma nada cuando la precisión es peor que veinticinco metros, ni los saltos que implicarían ir más rápido de lo humano, ni los movimientos de menos de cuatro metros, que son el aparato respirando en el sitio.':
      '*The app throws points away on purpose, and that is what makes the number worth anything.* A phone GPS, among buildings or freshly switched on, gives positions that wander a hundred metres and come back. If they were all added up, a coffee sitting on a terrace would be two kilometres. So nothing is added when the accuracy is worse than twenty-five metres, nor jumps that would mean going faster than a human can, nor movements under four metres, which are the device breathing on the spot.',
    'Cuando eso pasa te lo dice en pantalla, para que no parezca que la app no cuenta por su cuenta.':
      'When that happens it tells you on screen, so it does not look as if the app had stopped counting on its own.',
    'El senderismo se queda con su esfuerzo fijo aunque midas la velocidad. Lo que lo hace duro es la cuesta, no el paso, y la altura que da el GPS se mueve veinte metros estando quieto: con un dato así, afinar sería inventar con más decimales.':
      'Hiking keeps its fixed effort even when you measure the speed. What makes it hard is the slope, not the pace, and the altitude GPS gives moves twenty metres while you stand still: with a figure like that, refining would be inventing with more decimals.',
    'El recorrido se guarda como una forma, no como un mapa: un punto cada veinticinco metros, para verlo dibujado sin llenarte el móvil de coordenadas.':
      'The route is saved as a shape, not as a map: one point every twenty-five metres, so you can see it drawn without filling your phone with coordinates.',

    'Medir una salida con el GPS': 'Measuring an outing with GPS',
    'Para andar, correr, bici y senderismo, que es donde la distancia significa algo. Nadar no entra: el GPS no atraviesa el agua.':
      'For walking, running, cycling and hiking, which is where distance means something. Swimming is out: GPS does not go through water.',
    'Abre Medir con el GPS.': 'Open Measure with GPS.',
    'Está en Perfil, debajo de Reloj y salud.': 'It is in Profile, below Watch and health.',
    'Abrir Medir con el GPS': 'Open Measure with GPS',
    'Elige qué vas a hacer y pulsa Empezar a medir.':
      'Pick what you are going to do and tap Start measuring.',
    'El navegador te pedirá permiso de ubicación la primera vez. Si también das permiso al sensor de movimiento, cuenta los pasos y las zancadas por minuto.':
      'The browser will ask for location permission the first time. If you also allow the motion sensor, it counts your steps and your strides per minute.',
    'Lleva el móvil a la vista o en la mano.': 'Keep the phone visible or in your hand.',
    'Mientras mide, la app impide que la pantalla se apague sola. Pero si bloqueas el móvil, el navegador congela la página y se deja de contar: eso no tiene arreglo desde una web.':
      'While it measures, the app stops the screen going off by itself. But if you lock the phone, the browser freezes the page and counting stops: there is no fixing that from a web page.',
    'Pausa si paras de verdad.': 'Pause if you really stop.',
    'En pausa no se suma distancia ni tiempo, y el GPS se apaga para no gastar batería. Al seguir, el camino que hiciste con la medición parada no se cuenta.':
      'Paused, neither distance nor time is added, and GPS switches off so it does not drain the battery. When you resume, the ground you covered with the measurement stopped does not count.',
    'Pulsa Terminar y queda guardado.': 'Tap Finish and it is saved.',
    'Se guarda como una actividad más: entra en tu historial, en tu racha y en los músculos de la semana, y encima con los kilómetros, el ritmo y el dibujo del recorrido.':
      'It is saved as one more activity: it goes into your history, your streak and the muscles of the week, and on top of that with the kilometres, the pace and the drawing of the route.',
    'Si no quieres guardarla, *Descartar sin guardar* la tira entera.':
      'If you do not want to keep it, *Discard without saving* throws the whole thing away.',

    '¿Por qué dejó de contar al bloquear el móvil?':
      'Why did it stop counting when I locked the phone?',
    'Porque esto es una página web, y cuando bloqueas el móvil el navegador congela la página entera para ahorrar batería. No hay forma de evitarlo desde una web: lo que cuenta con la pantalla apagada es una app instalada de las de la tienda.':
      'Because this is a web page, and when you lock the phone the browser freezes the whole page to save battery. There is no way round it from a web page: what counts with the screen off is an installed app from a store.',
    'Mientras mides, la app sí impide que la pantalla se apague sola, que es la mitad del problema. La otra mitad es no pulsar el botón de bloqueo.':
      'While you measure, the app does stop the screen going off by itself, which is half the problem. The other half is not pressing the lock button.',
    'Si lo que quieres son los pasos de todo el día sin llevar nada abierto, eso sí se puede: lo trae el atajo de Salud o un archivo de tu reloj.':
      'If what you want is the steps for the whole day without keeping anything open, that can be done: the Health shortcut or a file from your watch brings them.',
    'Y si al volver ves menos kilómetros de los que esperabas, mira si la app te avisó de señal floja: lo que se mueve con mala precisión no se suma a propósito, porque sumarlo es como acaban saliendo paseos de dos kilómetros sin levantarse de la silla.':
      'And if you come back to fewer kilometres than you expected, check whether the app warned you of a weak signal: what moves with poor accuracy is not added on purpose, because adding it is how you end up with two-kilometre walks without getting out of the chair.',


    /* ---------- Permisos ---------- */
    'Dar o quitar un permiso': 'Giving or taking back a permission',
    'Avisos, ubicación, movimiento, cámara y Bluetooth: todos están en la misma pantalla, con el estado de cada uno.':
      'Alerts, location, motion, camera and Bluetooth: they are all on the same screen, each with its state.',
    'Abre Perfil › Permisos.': 'Open Profile › Permissions.',
    'Cada fila dice para qué hace falta y cómo está: concedido, bloqueado, sin pedir, o que en este aparato no existe.':
      'Each row says what it is needed for and how it stands: granted, blocked, not yet asked, or that it does not exist on this device.',
    'Abrir Permisos': 'Open Permissions',
    'Para darlo, pulsa *Permitir*.': 'To give it, tap *Allow*.',
    'Sale el cartel del navegador y contestas ahí. La app no puede responder por ti.':
      'The browser prompt comes up and you answer there. The app cannot answer for you.',
    'Para quitarlo, hay que ir al navegador.': 'To take it back, you have to go to the browser.',
    'Esto no se hace desde la app: toca el candado —o la «i», o «Aa» en Safari— en la barra de direcciones, entra en *Ajustes del sitio* y ahí están todos, con su interruptor de verdad.':
      'This is not done from the app: tap the padlock —or the «i», or «Aa» in Safari— in the address bar, go into *Site settings* and they are all there, with a switch that really is one.',
    'El Bluetooth no se da de una vez.': 'Bluetooth is not given once and for all.',
    'Se concede aparato a aparato, cuando buscas uno desde Reloj y salud. Por eso en Permisos no sale como concedido aunque ya tengas una banda guardada.':
      'It is granted device by device, when you search for one from Watch and health. That is why Permissions does not show it as granted even when you already have a strap saved.',
    'Dar un permiso no manda nada a ningún sitio: lo que midas se queda en tu dispositivo igual que el resto.':
      'Giving a permission sends nothing anywhere: what you measure stays on your device like everything else.',
    '¿Por qué la app no puede quitarme un permiso?': 'Why can the app not take a permission back?',
    'Porque una página web puede *pedir* un permiso y puede *mirar* cómo está, pero no puede dárselo ni quitárselo a sí misma. Eso lo decide el navegador, y a propósito: si una web pudiera concederse la cámara sola, el permiso no valdría para nada.':
      'Because a web page can *ask* for a permission and can *look* at how it stands, but it cannot grant or revoke one for itself. The browser decides that, and on purpose: if a site could grant itself the camera, the permission would be worth nothing.',
    'Por eso en Permisos no hay interruptores. Un interruptor promete que al apagarlo se apaga, y el de la ubicación se habría quedado encendido solo, que es la peor forma de enterarse de que un control era de mentira. Lo que hay es el estado de verdad, el botón donde todavía se puede pedir, y dónde ir cuando ya no.':
      'That is why Permissions has no switches. A switch promises that turning it off turns it off, and the location one would have stayed on by itself, which is the worst way to find out a control was fake. What there is instead is the real state, a button where it can still be asked for, and where to go when it cannot.',
    'Para quitarlo: el candado de la barra de direcciones —en Safari de iPhone es la *Aa* de la izquierda— y de ahí a los ajustes del sitio.':
      'To take it back: the padlock in the address bar —in Safari on iPhone it is the *Aa* on the left— and from there into site settings.',
    'Y si una fila dice *Aquí no*, no es que lo hayas bloqueado: es que ese navegador no lo tiene. El Bluetooth en iPhone es el caso de siempre.':
      'And if a row says *Not here*, it is not that you blocked it: that browser does not have it. Bluetooth on iPhone is the usual case.',


    /* ---------- Poner tu foto ---------- */
    'Poner tu foto': 'Setting your photo',
    'Sale arriba a la izquierda en todas las pantallas y en tu tarjeta de Perfil.':
      'It shows top left on every screen and on your Profile card.',
    'Abre Perfil y toca tu círculo.': 'Open Profile and tap your circle.',
    'El de la tarjeta de arriba, el que lleva la cámara pegada en la esquina. El resto de la tarjeta lleva a tus datos; el círculo, a la foto.':
      'The one on the card at the top, with the camera stuck in its corner. The rest of the card takes you to your data; the circle takes you to the photo.',
    'Abrir Perfil': 'Open Profile',
    'Elige una del carrete.': 'Pick one from your camera roll.',
    'Se recorta en cuadrado desde el centro y se reduce, así que da igual si es apaisada: no te va a salir la cara aplastada.':
      'It is cropped square from the middle and scaled down, so it does not matter if it is landscape: your face will not come out squashed.',
    'Para cambiarla o quitarla, vuelve a tocarla.': 'To change it or remove it, tap it again.',
    'Con una foto puesta, el círculo pregunta antes: elegir otra o quitarla.':
      'With a photo set, the circle asks first: pick another or remove it.',
    'Sin foto no se queda vacío: sale la inicial de tu nombre sobre un grafito. La foto se guarda en este dispositivo como el resto, pesa unos quince kilobytes y no sale de aquí salvo que tengas la sincronización puesta.':
      'With no photo it is not left empty: your name initial shows on graphite. The photo is saved on this device like everything else, it weighs about fifteen kilobytes and it does not leave here unless you have sync switched on.',

    'Si lo bloqueaste por error, pulsa *Reintentar*.': 'If you blocked it by mistake, tap *Retry*.',
    'Si lo denegaste solo esa vez, el navegador vuelve a preguntar. Y si ya lo arreglaste en los ajustes del móvil, con eso la app se entera: desde fuera no puede verlo sola.':
      'If you only denied it that once, the browser asks again. And if you already sorted it out in your phone settings, that is how the app finds out: it cannot see it from outside on its own.',
    'Para quitarlo de verdad, hay que ir al sistema.': 'To really take it away, you have to go to the system.',
    'Con la app abierta desde su icono: *Ajustes del iPhone › Aplicaciones › Training FR*. Desde Safari: la *Aa* de la barra de direcciones › *Configuración para este sitio web*. El candado que se suele buscar no existe cuando la app está instalada en la pantalla de inicio.':
      'With the app opened from its icon: *iPhone Settings › Apps › Training FR*. From Safari: the *Aa* in the address bar › *Settings for this website*. The padlock people look for does not exist once the app is installed on the home screen.',


    /* ---------- Por que el plan se renueva solo ---------- */
    'Por qué el plan se renueva solo': 'Why your plan refreshes itself',
    'Quince días el menú, cuatro semanas las rutinas, y por qué no es el mismo plazo':
      'Fifteen days for the menu, four weeks for the routines, and why they are not the same',
    'Ni un menú ni un plan de entrenamiento caducan como la leche, pero los dos dejan de servir. La app lleva la cuenta y te avisa *tres días antes*, porque un plan que cambia de golpe te pilla con la compra hecha.':
      'Neither a menu nor a training plan goes off like milk, but both stop working. The app keeps count and warns you *three days ahead*, because a plan that changes all at once catches you with the shopping already done.',
    '*El menú, cada quince días.* Es lo que aguanta la variedad antes de que comer se convierta en un trámite, y es corto porque cambiarlo no cuesta nada: mañana comes otra cosa y ya.':
      '*The menu, every fifteen days.* That is how long the variety lasts before eating turns into a chore, and it is short because changing it costs nothing: tomorrow you eat something else and that is that.',
    '*Las rutinas, cada cuatro semanas.* Cambiarlas sí cuesta: hay que volver a aprender con qué peso vas en cada ejercicio, y tu progreso se mide comparándote contigo mismo en el mismo movimiento. Cambiarlas cada dos semanas sería borrar la referencia justo cuando empieza a valer. Cuatro semanas es lo que tarda el cuerpo en adaptarse a un estímulo y dejar de responder igual.':
      '*The routines, every four weeks.* Changing those does cost: you have to learn again what weight you are on for each exercise, and your progress is measured by comparing you with yourself on the same movement. Changing them every two weeks would wipe the reference just as it starts to be worth something. Four weeks is how long the body takes to adapt to a stimulus and stop responding the same.',
    'El aviso sale en la portada y trae dos botones: renovar, que te lleva a hacerlo, y dejarlo para mañana. Lo que no se puede es apagarlo para siempre, porque entonces el plazo no significaría nada.':
      'The notice shows on the home screen with two buttons: refresh, which takes you there, and leave it for tomorrow. What you cannot do is switch it off for good, because then the deadline would mean nothing.',
    'Nada se cambia a tus espaldas: la app avisa y propone, pero el plan nuevo lo guardas tú. Tus rutinas viejas no se borran solas.':
      'Nothing is changed behind your back: the app warns and proposes, but you are the one who saves the new plan. Your old routines are not deleted on their own.',


    /* ---------- Comer fuera ---------- */
    'Comer fuera sin salirte': 'Eating out without going off track',
    'Una foto de la carta y la app te dice qué pedir, mirando lo que ya has comido hoy.':
      'A photo of the menu and the app tells you what to order, looking at what you have already eaten today.',
    'En Alimentación, pulsa *Voy a comer fuera*.': 'In Food, tap *Eating out*.',
    'Haz la foto a la carta. Vale una de papel, una pizarra o el menú del día escrito a mano: lo que hace falta es que se lea.':
      'Photograph the menu. A paper one, a chalkboard or the handwritten set menu all work: what matters is that it can be read.',
    'Abrir Alimentación': 'Open Food',
    'Mira la primera opción, que es la que te cuadra mejor.':
      'Look at the first option, which is the one that fits you best.',
    'No están ordenadas por sanas, sino por lo que te queda hoy: un plato que sería perfecto a mediodía puede no caber a las nueve de la noche.':
      'They are not ordered by how healthy they are, but by what you have left today: a dish that would be perfect at lunchtime may not fit at nine in the evening.',
    'Lee el *pídelo así*, que es lo que más cambia.':
      'Read the *ask for it like this*, which is what changes the most.',
    'Cambiar la guarnición o pedir la salsa aparte mueve el plato más que elegir otro, y se pide sin quedar raro.':
      'Swapping the side or asking for the sauce on the side moves the dish more than picking another one, and you can ask for it without feeling awkward.',
    'Cuando te lo sirvan, apúntalo con la foto de siempre.':
      'When it arrives, log it with the usual photo.',
    'La carta solo sugiere; lo que cuenta en tu día es lo que te comes. Esto aún no se apunta solo.':
      'The menu only suggests; what counts in your day is what you eat. This does not log itself yet.',
    'La foto se encoge en tu móvil, se manda para leerla y se suelta: no se guarda en ningún sitio.':
      'The photo is shrunk on your phone, sent to be read and released: it is not stored anywhere.',
    '¿Por qué las calorías de la carta salen con un rango?':
      'Why do the menu calories come as a range?',
    'Porque una carta no dice los gramos. Un entrecot son doscientos o cuatrocientos según la casa, y una paella «para uno» varía el doble de un sitio a otro.':
      'Because a menu does not give grams. A steak is two hundred or four hundred depending on the place, and a paella «for one» varies twofold from one spot to another.',
    'Dar una cifra exacta ahí quedaría mejor y sería mentira. Y es la clase de mentira que se paga cara: la primera vez que te pasas por quinientas calorías dejas de creerte el resto, incluido lo que sí está bien calculado.':
      'Giving an exact figure there would look better and would be a lie. And it is the kind of lie you pay for: the first time you overshoot by five hundred calories you stop believing the rest, including what is properly worked out.',
    'Por eso ves un rango y a veces un aviso de que es una estimación. Cuando te sirvan el plato y le hagas la foto, ahí sí hay algo que medir: el tamaño de la ración se ve contra el plato y los cubiertos.':
      'That is why you see a range and sometimes a note saying it is an estimate. Once the dish is in front of you and you photograph it, there is something to measure: portion size shows against the plate and the cutlery.',


    /* ---------- Cuando se agota la cuota ---------- */
    '¿Qué hago cuando se agota la cuota de la IA?': 'What do I do when the AI quota runs out?',
    'Ponerle otra clave. La cuota gratis de Google va *por clave y por día*, no por persona, así que con dos o tres puestas la app salta sola a la siguiente cuando una se acaba, y tú no te enteras.':
      'Give it another key. Google\u2019s free quota goes *per key and per day*, not per person, so with two or three in place the app moves to the next one by itself when one runs out, and you never notice.',
    'Se añaden en Ajustes › Bóveda de claves, en *Claves de repuesto*. Son gratis y se sacan en un minuto en la misma página de siempre.':
      'You add them in Settings › Key vault, under *Spare keys*. They are free and take a minute to get on the same page as always.',
    'La app prueba primero todos los modelos con la clave que esté en uso —cada modelo tiene su propia cuota— y solo cuando se le acaban todos cambia de clave. Y se queda en la que funcione, para no gastar un viaje de ida y vuelta en la agotada cada vez que preguntas.':
      'The app first tries every model with the key in use —each model has its own quota— and only changes key once they are all spent. And it stays on the one that works, so it does not waste a round trip on the exhausted one every time you ask.',
    'Al abrir la app al día siguiente vuelve a la primera, porque la cuota se repone sola y quedarse en la última sería desperdiciar las otras.':
      'When you open the app the next day it goes back to the first one, because the quota refills by itself and staying on the last one would waste the others.',


    /* ---------- La lista de la compra ---------- */
    'Y porque ya no hay que fiarse: arriba de la lista salen las tres cifras al día, lo que trae frente a lo que pide tu menú, sumadas por la app. Si la proteína se queda por debajo del 85 %, te lo dice en ámbar y te sugiere rehacerla.':
      'And because you no longer have to take it on trust: the three daily figures are at the top of the list, what it brings against what your menu asks for, added up by the app. If protein falls below 85 %, it says so in amber and suggests redoing it.',
    '¿Cómo sé que la compra me da lo que come el menú?':
      'How do I know the shopping covers what the menu eats?',
    'Porque las cifras salen de tu propio menú: se suman la proteína, los hidratos y la grasa de todas sus comidas y se reparten entre sus días. Y porque el entrenador ya no multiplica nada: de cada alimento dice solo dos cosas —cuánto lleva una ración y cuántas raciones hay— y la multiplicación la hace la app. Doscientos gramos de pollo treinta veces son seis kilos, siempre.':
      'Because the figures come from your own menu: the protein, carbs and fat in all its meals are added up and spread across its days. And because the coach no longer multiplies anything: for each food it says only two things —how much one portion takes and how many portions there are— and the app does the multiplying. Two hundred grams of chicken thirty times is six kilos, every time.',
    'Y todo va en crudo. La carne y el pescado pierden como un 25 % de peso al cocinarse, así que 150 g de pechuga ya hecha salen de unos 200 g crudos: lo que se compra son los 200. Con el arroz y las legumbres pasa al revés, 100 g cocidos son unos 33 en seco.':
      'And everything is raw weight. Meat and fish lose about 25 % of their weight when cooked, so 150 g of cooked chicken breast comes from about 200 g raw: what you buy is the 200. With rice and pulses it works the other way, 100 g cooked is about 33 g dry.',
    'Es lo que más se falla, y no se ve mirando la lista —parece mucha comida—: solo se ve sumando.':
      'It is the thing that goes wrong most often, and you cannot see it by looking at the list —it looks like a lot of food—: you only see it by adding up.',
    'Lo que falte lo añades tú.': 'Whatever is missing, you add it.',
    'Con «Añadir algo» al final: dices qué es, cuánto si quieres, y en qué zona del súper va, para que te caiga donde vas a pasar y no en un cajón de sastre al final. Y para quitar algo de la lista, desliza su fila hacia la izquierda.':
      'With “Add something” at the end: you say what it is, how much if you want, and which aisle it goes in, so it lands where you will be walking and not in a catch-all at the bottom. And to take something off the list, swipe its row to the left.',
    'En cada cosa ves lo que hace falta y cómo se vende.':
      'On each item you see what you need and how it is sold.',
    'Arriba, lo que te vas a comer. Debajo y en gris, el envase más pequeño que hay, cuando es mayor que eso. Separados a propósito: juntarlos hacía que una compra de un día pareciera la de una semana. Y va en cantidad de compra, no de plato: lo que se vende por piezas sale en piezas —un plátano, tres papas—, porque 86 g de papa no se pueden pedir en ningún sitio.':
      'On top, what you are going to eat. Below and in grey, the smallest pack there is, when it is bigger than that. Kept apart on purpose: putting them together made one day\'s shopping read like a week\'s. And it is shopping quantity, not plate quantity: what is sold by the piece comes in pieces —one banana, three potatoes— because you cannot ask for 86 g of potato anywhere.',
    '¿Por qué la lista pone 160 g y debajo «bandeja de 500 g»?':
      'Why does the list say 160 g and then "500 g tray" underneath?',
    'Porque son dos cosas distintas y conviene ver las dos. El primero es lo que te vas a comer, sumado de los platos. El segundo es cómo lo vende la tienda, que casi nunca coincide.':
      'Because they are two different things and both are worth seeing. The first is what you are going to eat, added up from the dishes. The second is how the shop sells it, which hardly ever matches.',
    'Antes solo salía el segundo, y eso hacía que la compra de un día se leyera como la de una semana: cinco carnes redondeadas a su envase son dos kilos de carne para una cena. El número que manda es el primero; el segundo solo te avisa de lo que va a sobrar.':
      'It used to show only the second, and that made one day\'s shopping read like a week\'s: five meats each rounded up to its pack is two kilos of meat for one dinner. The number that counts is the first; the second only warns you what will be left over.',
    'Dos rodillos, como la hora y los minutos del despertador: el número en uno y días, semanas o meses en el otro. Tres semanas son veintiún días, y esa cuenta la hace la app. Más de un mes no te deja, y es aposta: el menú se cambia cada treinta días, así que una compra más larga sería la de un menú que ya no vas a comer.':
      'Two wheels, like the hours and minutes on an alarm clock: the number on one, days, weeks or months on the other. Three weeks is twenty-one days, and the app does that sum. It will not let you go past one month, and that is on purpose: the menu changes every thirty days, so a longer shop would be for a menu you are no longer going to eat.',
    'Primero se te enseña el resumen por zonas. Si no te convence, se vuelve a pedir sin guardar nada. Al guardarla le pones nombre —viene uno propuesto— para reconocerla luego entre las demás.':
      'First you get the summary by aisle. If you are not convinced, it asks again without saving anything. When you save it you give it a name —one comes suggested— so you can tell it from the others later.',
    'Primero si cuentas por días, por semanas o por meses, y luego giras el rodillo: dos semanas son catorce días y esa cuenta la hace la app. El lápiz del final es para el número que no cae redondo en ninguna de las tres. Si pides veinte días de un menú de siete, se multiplican las cantidades antes de redondear.':
      'First whether you count in days, weeks or months, then you spin the wheel: two weeks is fourteen days and the app does that sum. The pencil at the end is for the number that fits none of the three. If you ask for twenty days from a seven-day menu, the amounts are multiplied before rounding.',
    'Las que tengas a medias están debajo del todo.':
      'The ones you have half done are right at the bottom.',
    'Una lista no se abandona porque cambies de menú: se sigue comprando con ella. Ahí salen todas, con lo que llevas tachado de cada una, y se abren tocándolas. Desliza una hacia la izquierda y aparecen sus dos botones: renombrarla o borrarla.':
      'You do not drop a list because you switch menus: you carry on shopping with it. They are all there, with what you have ticked off each one, and they open with a tap. Swipe one to the left and its two buttons appear: rename it or delete it.',
    '¿Por qué mi menú de cinco días pone treinta?':
      'Why does my five-day menu say thirty?',
    'Porque debajo del nombre no te dice lo que trae el menú, sino lo que vas a comprar: los días que has pedido y las comidas que salen de repetirlo hasta cubrirlos.':
      'Because under the name it does not tell you what the menu brings, but what you are going to buy: the days you asked for and the meals that come from repeating it to cover them.',
    'El menú sigue siendo de cinco días. Lo que cambia es la compra, y es el número que importa cuando estás decidiendo cuánto llevarte.':
      'The menu is still five days. What changes is the shopping, and that is the number that matters when you are deciding how much to take home.',
    'La lista vive ahí dentro, encima de tus menús.':
      'The list lives in there, above your menus.',
    'Elige de qué menú.': 'Pick which menu.',
    'Cada uno te dice cuántos días cubre y cuántas comidas trae, que es lo que hace falta saber antes de comprar: a veces se compra para el que empieza el lunes, no para el que está acabando.':
      'Each one tells you how many days it covers and how many meals it brings, which is what you need to know before shopping: sometimes you shop for the one starting on Monday, not the one finishing.',
    'El rodillo va de uno a sesenta y debajo están los saltos de una, dos y tres semanas y un mes. Si pides veinte días de un menú de siete, se multiplican las cantidades antes de redondear.':
      'The wheel runs from one to sixty, and below it are the jumps for one, two and three weeks and a month. If you ask for twenty days from a seven-day menu, the amounts are multiplied before rounding.',
    'Púlsale a *Generar la lista*.': 'Tap *Build the list*.',
    'La lista de la compra': 'The shopping list',
    'Sale de tu menú, agrupada por zonas del súper y con casillas para ir tachando.':
      'It comes from your menu, grouped by supermarket aisle and with boxes to tick off.',
    'Abre Alimentación: está arriba del todo.': 'Open Food: it is right at the top.',
    'Si tienes varios menús guardados, dentro puedes elegir de cuál la quieres: a veces se compra para el que empieza el lunes, no para el que está acabando.':
      'If you have several menus saved, inside you can pick which one it comes from: sometimes you shop for the one starting on Monday, not the one finishing.',
    'Si ese menú aún no tiene lista, púlsale a *Generar la lista*.':
      'If that menu has no list yet, tap *Build the list*.',
    'La saca el entrenador de los propios platos del menú, sin tocarlo: suma las raciones de todos los días, redondea a lo que de verdad se vende —560 g de avena son un paquete de kilo— y lo agrupa por zonas. Mientras suma, el menú y los rodillos se quedan quietos: cambiarlos a mitad acabaría dándote la lista del menú anterior. Si te arrepientes, el botón de al lado la cancela.':
      'The coach works it out from the menu’s own dishes, without touching it: it adds up the portions across every day, rounds to what is actually sold —560 g of oats is a one-kilo bag— and groups it by aisle. While it adds up, the menu and the wheels stay put: changing them halfway would end up giving you the previous menu’s list. If you change your mind, the button next to it cancels.',
    'Di para cuántos días.': 'Say how many days.',
    'Hay atajos de una, dos, tres semanas y un mes, y un campo para escribir el número que quieras. Si pides veinte días de un menú de siete, se multiplican las cantidades antes de redondear.':
      'There are shortcuts for one, two, three weeks and a month, plus a field to type any number. If you ask for twenty days from a seven-day menu, the amounts are multiplied before rounding.',
    'Mira cómo queda y pulsa *Crear la lista*.': 'See how it looks and tap *Create the list*.',
    'Primero se te enseña el resumen por zonas. Si no te convence, se vuelve a pedir sin guardar nada.':
      'First you get the summary by aisle. If you do not like it, it is asked again without saving anything.',
    'Si algo no lo vas a llevar, toca el botón de la derecha.':
      'If you are not taking something, tap the button on the right.',
    'Escribes tú con qué lo cambias, o le preguntas al entrenador por cuál puedes cambiarlo: te da hasta tres opciones con la cantidad equivalente y lo que te mueve en tus números, y eliges una tocando.':
      'You type what you are swapping it for, or ask the coach what you can swap it for: it gives up to three options with the equivalent amount and what it moves in your numbers, and you pick one by tapping.',
    'Y el cambio llega al menú si quieres.': 'And the change reaches the menu if you want.',
    'Después de sustituir se te pregunta si lo cambio también en los platos. Se pregunta y no se hace solo porque reescribe comidas que tú no has tocado: quien cambia una marca de arroz por otra no quiere que le reescriban la semana.':
      'After a swap you are asked whether to change it in the dishes too. You are asked rather than it happening on its own because it rewrites meals you have not touched: someone swapping one brand of rice for another does not want their week rewritten.',
    'Tu menú cubre una semana; si eliges catorce días es darle dos vueltas, y las cantidades se doblan solas. Esa cuenta la hace la app, no la IA: multiplicar tiene un solo resultado y tiene que dar siempre el mismo, también sin cobertura.':
      'Your menu covers a week; choosing fourteen days means going round it twice, and the amounts double by themselves. That sum is done by the app, not the AI: multiplying has one single answer and has to give the same one every time, with no signal too.',
    'Ve tachando mientras compras.': 'Tick things off as you shop.',
    'Lo tachado se queda guardado: puedes salir del súper, volver a entrar y seguir donde lo dejaste. Lo comprado no desaparece, se apaga, porque la lista también sirve para ver lo que ya llevas.':
      'What you tick stays saved: you can leave the shop, come back in and carry on where you left off. What is bought does not vanish, it dims, because the list is also there to show what is already in the trolley.',
    'La lista se guarda aparte del menú, así que sustituir algo en el súper no te toca el plan salvo que lo digas. Y *Rehacer* empieza de cero cuando cambies de menú o de semana.':
      'The list is saved separately from the menu, so swapping something at the shop does not touch your plan unless you say so. And *Redo* starts from scratch when you change menu or week.',

  };

  /* Se fusiona con el general. Si alguna frase estuviera en los dos —no debería,
     pero es el fallo que no avisa— manda la que ya estaba: el diccionario
     general es el de la interfaz y es el que se mira primero al depurar. */
  g.TEXTOS_EN = g.TEXTOS_EN || {};
  Object.keys(AYUDA).forEach(function (k) {
    if (!Object.prototype.hasOwnProperty.call(g.TEXTOS_EN, k)) g.TEXTOS_EN[k] = AYUDA[k];
  });
})(window);
