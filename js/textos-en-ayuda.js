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
    'Cómo se hace': 'How to',
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
    'Dónde entrenas': 'Where you train',
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
    '¿Por qué me pide actualizar tan a menudo?': 'Why does it ask me to update so often?'
  };

  /* Se fusiona con el general. Si alguna frase estuviera en los dos —no debería,
     pero es el fallo que no avisa— manda la que ya estaba: el diccionario
     general es el de la interfaz y es el que se mira primero al depurar. */
  g.TEXTOS_EN = g.TEXTOS_EN || {};
  Object.keys(AYUDA).forEach(function (k) {
    if (!Object.prototype.hasOwnProperty.call(g.TEXTOS_EN, k)) g.TEXTOS_EN[k] = AYUDA[k];
  });
})(window);
