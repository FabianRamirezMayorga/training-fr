/* textos-en.js — la app en inglés.

   La clave es la frase en español, tal cual está escrita en el código. Si no
   coincide carácter a carácter —una tilde, un espacio de más— no traduce y sale
   en español, que es el fallo menos malo posible.

   El orden es el de la app: primero lo que se ve en todas las pantallas, luego
   pantalla por pantalla. Se busca con el buscador del editor, no con la vista,
   así que lo que importa es que cada frase esté una sola vez.

   NO se traducen aquí: los nombres de los ejercicios, los músculos ni el
   material. Esos ya vienen en inglés en el catálogo y es i18n.js quien los
   traduce AL español; en inglés simplemente no se toca nada. */
(function (g) {
  'use strict';

  g.TEXTOS_EN = {

    /* ---------- la barra de abajo y lo que sale en todas partes ---------- */
    'Inicio': 'Home',
    'Ejercicios': 'Exercises',
    'Rutinas': 'Routines',
    'Progreso': 'Progress',
    'Perfil': 'Profile',

    'Guardar': 'Save',
    'Cancelar': 'Cancel',
    'Guardado': 'Saved',
    'Sin cambios': 'No changes',
    'Quitar': 'Remove',
    'Borrar': 'Delete',
    'Editar': 'Edit',
    'Listo': 'Done',
    'Ahora no': 'Not now',
    'Añadir': 'Add',
    'Vale': 'OK',
    'Cerrar': 'Close',
    'Volver': 'Back',
    'Sin poner': 'Not set',
    'Elegir': 'Choose',
    'Reintentar': 'Try again',
    'Ver': 'View',
    'Ocultar': 'Hide',

    /* ---------- Ajustes ---------- */
    'Ajustes': 'Settings',
    'Cómo se comporta la app contigo: lo que te pregunta, lo que te propone y lo que se guarda.':
      'How the app behaves with you: what it asks, what it suggests and what it stores.',

    'Tu nombre': 'Your name',
    'Con el que te saluda la app': 'What the app greets you by',
    '¿Cómo te llamas?': "What's your name?",

    'Dónde entrenas': 'Where you train',

    /* ---------- la pantalla de un ejercicio y su guía ---------- */
    ' y ': ' and ',
    'Ejercicio no encontrado.': 'Exercise not found.',
    'Marcar como favorito': 'Mark as a favourite',
    'Añadido a favoritos': 'Added to favourites',
    'Quitado de favoritos': 'Removed from favourites',
    'Añadir a rutina': 'Add to a routine',
    'Buscar vídeo en YouTube': 'Search for a video on YouTube',
    'El recorrido': 'The movement',
    'Posición inicial': 'Starting position',
    'Posición final': 'Finishing position',
    'El movimiento va del punto 1 al 2 y vuelve controlando la bajada. Arriba lo ves animado.':
      'The movement goes from point 1 to point 2 and comes back controlling the descent. You can see it animated above.',
    'Cómo se ejecuta': 'How it is performed',
    'Este ejercicio todavía no tiene guía propia. Abajo tienes las instrucciones del catálogo y el enlace a vídeos.':
      'This exercise does not have a guide of its own yet. Below are the catalogue’s instructions and a link to videos.',
    'Cómo se hace · {que}': 'How it is done · {que}',
    'Errores frecuentes': 'Common mistakes',
    'La clave': 'The key',
    'Respiración': 'Breathing',
    'Ritmo': 'Tempo',
    'Seguridad': 'Safety',
    'Cómo se hace, paso a paso': 'How it is done, step by step',
    'Traduciendo del catálogo original…': 'Translating from the original catalogue…',
    'No he podido traducirlas; las dejo como vienen.':
      'I could not translate them; I am leaving them as they came.',
    'Si está ocupado o no lo tienes': 'If it is taken or you do not have it',
    'Entrenas el mismo músculo —{m}— con otra máquina, otro material u otro ejercicio.':
      'You train the same muscle — {m} — with another machine, other kit or another exercise.',
    'Entrenas el mismo músculo con otra máquina, otro material u otro ejercicio.':
      'You train the same muscle with another machine, other kit or another exercise.',
    'Con tu material no sale ninguno, así que estos son del catálogo completo.':
      'None come up with your equipment, so these are from the whole catalogue.',
    'Toca cualquiera para ver su técnica.': 'Tap any of them to see its technique.',
    'Mismo movimiento': 'Same movement',
    'Es lo que mueve el ejercicio': 'This is what drives the exercise',
    'Ayudan, pero no son el objetivo': 'They help, but they are not the target',
    'Vista de frente': 'Front view',
    'Vista de espaldas': 'Back view',
    'Zona del cuerpo': 'Area of the body',
    'Movimiento parecido': 'Similar movement',
    'Mismo músculo': 'Same muscle',
    'Trabajo parecido': 'Similar work',
    'Tus marcas': 'Your records',
    'Máx. {u}': 'Max {u}',
    'Reps de esa serie': 'Reps on that set',
    '1RM estimado': 'Estimated 1RM',

    'Gimnasio': 'Gym',
    'Con mancuernas': 'With dumbbells',
    'Con bandas': 'With bands',
    'Todo': 'Everything',
    'ejercicios': 'exercises',
    '{n}% del catálogo': '{n}% of the catalogue',
    'o mira el catálogo entero': 'or browse the whole catalogue',
    'Entrenas {sitio}. Cambiar de sitio': 'You train {sitio}. Change where you train',
    'Los mismos que en el gimnasio: el catálogo no tiene nada que el gimnasio no permita.':
      'The same as in the gym: the catalogue has nothing the gym does not allow.',
    'Sin elegir': 'Not chosen',
    'A qué hora comes': 'When you eat',
    'De ahí salen los avisos de comer, con qué comida se cruza la foto de un plato y a qué hora te toca cada suplemento.':
      'Your meal reminders come from this, along with which meal a food photo is matched to and when each supplement is due.',

    'Cómo registras las series': 'How you log sets',
    'Sin peso anotado no hay récords ni volumen; el progreso se mide por series y entrenamientos completados.':
      'With no weight logged there are no records and no volume; progress is measured in sets and completed workouts.',

    'Qué vas marcando': 'What you tick off',
    'Registrar cuando como': 'Log when I eat',
    'Cada plato lleva «me lo comí» y «comí otra cosa», y lo que marques entra en el recuento del día.':
      'Every dish gets "ate it" and "ate something else", and whatever you tick counts towards your day.',
    'Marcar cuando bebo agua': 'Tick off water',
    'Cada toma de la pauta es una casilla, y el total del día sale de lo que marcas en vez de lo que deberías.':
      'Each scheduled glass is a checkbox, and your daily total comes from what you tick rather than what you should drink.',
    'Apagarlos no borra nada de lo que ya llevas apuntado: solo quita las casillas de en medio.':
      'Turning these off deletes nothing you have already logged: it just gets the checkboxes out of the way.',

    'La app': 'The app',
    'Unidad de peso': 'Weight unit',
    'En la que anotas y ves los pesos': 'The one you log and read weights in',
    'Tema': 'Theme',
    'Claro, oscuro o lo que diga el móvil': 'Light, dark or whatever your phone says',
    'Claro': 'Light',
    'Oscuro': 'Dark',
    'Sistema': 'System',
    'Idioma': 'Language',
    'En qué idioma ves la app': 'What language you read the app in',
    'Ver la app en {idioma}': 'View the app in {idioma}',
    'Descanso por defecto': 'Default rest',
    'Entre serie y serie': 'Between sets',
    'La frase del entrenador': "Your coach's line",
    'Cada cuánto cambia': 'How often it changes',
    'Aviso sonoro': 'Sound alert',
    'Un pitido al terminar el descanso': 'A beep when rest is over',
    'Que empiece de cero': 'Start from scratch',

    'Claves y conexiones': 'Keys and connections',

    /* ---------- Perfil ---------- */
    'Datos y hábitos': 'Details and habits',
    'Alimentación': 'Nutrition',
    'Suplementos': 'Supplements',
    'Objetivos': 'Goals',
    'Alertas': 'Reminders',
    'Actualizaciones': 'Updates',
    'Ayuda': 'Help',

    /* ---------- Datos y hábitos ---------- */
    'Sirven para calcular tus calorías y ajustar lo que te propongo. No salen de tu dispositivo salvo que actives la sincronización o el entrenador con IA.':
      'These are used to work out your calories and tailor what I suggest. They never leave your device unless you turn on sync or the AI coach.',
    'Quién soy': 'About me',
    'Mi nombre': 'My name',
    'Para saludarte al abrir la app y para que el entrenador con IA te hable a ti, no a un usuario.':
      'To greet you when you open the app, and so the AI coach talks to you and not to "a user".',
    'País': 'Country',
    'De aquí salen el menú y la lista de la compra: los nombres, los cortes de carne y lo que hay en el súper cambian de un país a otro.':
      'Your meal plan and shopping list come from this: names, cuts of meat and what the supermarket stocks change from country to country.',
    'Mi cuerpo': 'My body',
    'Sexo biológico': 'Biological sex',
    'Cambia la fórmula del metabolismo basal.': 'Changes the basal metabolism formula.',
    'Hombre': 'Male',
    'Mujer': 'Female',
    'Edad': 'Age',
    'años': 'years',
    'Altura': 'Height',
    'Peso': 'Weight',
    'Grasa corporal': 'Body fat',
    'Opcional. Si la sabes, afina el cálculo del metabolismo.':
      'Optional. If you know it, it sharpens the metabolism estimate.',
    'Mi actividad diaria': 'My daily activity',
    'Lo que me muevo al día': 'How much I move each day',
    'Sin contar el entrenamiento: es el trabajo, los recados y lo que andas.':
      'Not counting training: work, errands and how much you walk.',
    'Toca los campos para cambiarlos': 'Tap the fields to change them',

    /* ---------- el país ---------- */
    '¿De dónde eres?': 'Where are you from?',
    'Con esto el menú sale del supermercado que tienes al lado, con los nombres que usas tú.':
      'With this, your meal plan comes from the supermarket next door, using the names you use.',
    'Busca tu país': 'Search for your country',
    'Es lo que dice tu móvil. Tócalo si es correcto.': "That's what your phone says. Tap it if it's right.",
    'Ninguno con ese nombre. Prueba con menos letras.': 'Nothing by that name. Try fewer letters.',
    'Elige tu país': 'Choose your country',
    'seg': 'sec',
    '{n} ejercicios a tu alcance': '{n} exercises within reach',

    /* ---------- Perfil ---------- */
    'Falta lo principal': 'The basics are missing',
    'Completa tus datos': 'Fill in your details',
    'Con tu peso, altura, edad y hábitos puedo calcular tus calorías, ajustar las rutinas y prepararte el plan de comidas.':
      'With your weight, height, age and habits I can work out your calories, tune your routines and put together your meal plan.',
    'Empezar': 'Get started',

    'Tú': 'You',
    'Entrenamiento': 'Training',
    'Aplicación': 'App',

    'Dime tu nombre para empezar': 'Tell me your name to get started',
    '{n} años': '{n} years old',
    'Sin completar': 'Not filled in',
    '{k} kcal · {p} g de proteína': '{k} kcal · {p} g protein',
    'Necesita tus datos': 'Needs your details',

    'Suplementación': 'Supplements',
    'Qué tomas y cuándo': 'What you take and when',
    'Creatina, proteína, omega 3…': 'Creatine, protein, omega 3…',
    '{n} apuntado': '{n} logged',
    '{n} apuntados': '{n} logged',
    '{n} toma hoy': '{n} dose today',
    '{n} tomas hoy': '{n} doses today',
    'hoy ninguna': 'none today',

    '{n} en marcha · {c} cumplidos': '{n} in progress · {c} achieved',
    'Ninguno todavía': 'None yet',
    '{n} recordatorio activo': '{n} reminder on',
    '{n} recordatorios activos': '{n} reminders on',
    'Sin recordatorios': 'No reminders',

    'Entrenador con IA': 'AI coach',
    'Listo para usar': 'Ready to use',
    'Sin configurar': 'Not set up',
    'Música': 'Music',
    'Spotify conectado': 'Spotify connected',
    'Sin conectar': 'Not connected',

    'Mi cuenta': 'My account',
    'Sin sincronizar': 'Not syncing',
    'Unidades, tema, idioma y copias de seguridad': 'Units, theme, language and backups',
    'Comprobando si estás al día…': 'Checking whether you are up to date…',
    '{v} · sin conexión para comprobar si hay otra':
      '{v} · no connection to check for a newer one',
    'Al día · {v} · y lo descargado para usarla sin internet':
      'Up to date · {v} · plus what you downloaded for offline use',
    'Hay una versión nueva: {v}': 'There is a new version: {v}',
    'Cuentas': 'Accounts',
    'Crear, desactivar y borrar cuentas del proyecto':
      'Create, disable and delete project accounts',
    'No he podido comprobar si administras': "I couldn't check whether you're an admin",
    'Cómo se hace cada cosa, cómo funciona y las dudas de siempre':
      'How to do each thing, how it works and the usual questions',

    'Cargando catálogo de ejercicios…': 'Loading exercise catalogue…',

    'Sin nombre': 'No name',
    'en 30 días': 'in 30 days',
    'peso de hoy': "today's weight",
    'kcal al día': 'kcal a day',
    'Modo invitado': 'Guest mode',
    'Tus datos están solo en este dispositivo. Toca para guardarlos en tu cuenta.':
      'Your data lives only on this device. Tap to save it to your account.',

    /* ---------- las tablas de perfil.js ----------
       Son datos, no interfaz, pero acaban en la pantalla: se traducen donde se
       pintan, con T() sobre la etiqueta. Aquí solo van las etiquetas. */
    'Sedentario': 'Sedentary',
    'Trabajo de oficina, sin ejercicio': 'Desk job, no exercise',
    'Ligero': 'Light',
    'Ejercicio suave 1-3 días por semana': 'Gentle exercise 1-3 days a week',
    'Moderado': 'Moderate',
    'Ejercicio 3-5 días por semana': 'Exercise 3-5 days a week',
    'Alto': 'High',
    'Ejercicio intenso 6-7 días por semana': 'Hard exercise 6-7 days a week',
    'Muy alto': 'Very high',
    'Trabajo físico o doble sesión': 'Physical job or two sessions a day',

    'Perder grasa': 'Lose fat',
    'Recomponer': 'Recomposition',
    'Ponerme fuerte': 'Get strong',
    'Mantenerme': 'Maintain',
    'Estar sano': 'Stay healthy',
    'Ganar músculo': 'Build muscle',

    'Suave': 'Gentle',
    'Rápido': 'Fast',

    'Bajo peso': 'Underweight',
    'Peso normal': 'Healthy weight',
    'Sobrepeso': 'Overweight',
    'Obesidad': 'Obesity',

    'Desayuno': 'Breakfast',
    'Almuerzo': 'Lunch',
    'Merienda': 'Afternoon snack',
    'Cena': 'Dinner',

    /* ---------- Inicio ---------- */
    'Hola': 'Hi',
    'Muy bien. Llevas {n} entrenamiento esta semana.':
      "Nicely done. That's {n} workout this week.",
    'Muy bien. Llevas {n} entrenamientos esta semana.':
      "Nicely done. That's {n} workouts this week.",
    'Semana en blanco. Buen momento para empezar.':
      'Blank week. Good moment to start one.',
    'Llevas 1 entrenamiento esta semana. Sigue así.':
      "That's 1 workout this week. Keep it up.",
    'Llevas {n} entrenamientos esta semana. Muy bien.':
      "That's {n} workouts this week. Nicely done.",

    'ENTRENAMIENTO EN CURSO': 'WORKOUT IN PROGRESS',
    'Continuar': 'Continue',

    'Hoy, {d} · hecho': 'Today, {d} · done',
    'Hoy, {d}': 'Today, {d}',
    'Ya entrenaste': 'You already trained',
    'Ya entrenaste dos veces': 'You already trained twice',
    'Hiciste {q}': 'You did {q}',
    'Apuntar otro entrenamiento': 'Log another workout',

    'Entrenar': 'Train',
    '{n} rutinas para hoy: te dejo elegir': '{n} routines for today: you pick',
    'O un entrenamiento libre': 'Or a free workout',
    'Iniciar entrenamiento': 'Start workout',
    'Arranca el cronómetro ahora y añade los ejercicios sobre la marcha. El tiempo se ve desde cualquier pantalla.':
      'Start the timer now and add exercises as you go. The clock shows on every screen.',

    'Días seguidos': 'Day streak',
    'Entrenos': 'Workouts',
    'Series semana': 'Sets this week',
    'Volumen semana': 'Volume this week',
    'Ver el día entero': 'See the whole day',

    'Hoy': 'Today',
    'Ayer': 'Yesterday',
    'Día libre': 'Rest day',
    'Empieza aquí': 'Start here',
    'No toca nada en tu plan': 'Nothing on your plan',
    'Todavía no tienes rutinas': "You don't have routines yet",
    'Si has hecho algo por tu cuenta, apúntalo. Y si te apetece entrenar, elige una rutina.':
      'If you did something on your own, log it. And if you fancy training, pick a routine.',
    'Copia una plantilla probada y edítala a tu gusto, o móntate el programa con tus datos.':
      'Copy a proven template and edit it, or build the programme from your own data.',
    'Apuntar algo': 'Log something',
    'Elegir rutina': 'Pick a routine',
    'Ver plantillas': 'See templates',
    'Crear mi programa': 'Build my programme',

    'y': 'and',
    '{n} más': '{n} more',
    '{n} serie': '{n} set',
    '{n} series': '{n} sets',
    '{v} levantados': '{v} lifted',
    'Queda apuntado en tu historial.': "It's logged in your history.",

    'Tu semana': 'Your week',
    '{c} de {p} días del plan': '{c} of {p} plan days',
    '{n} suelto': '{n} extra',
    '{n} sueltos': '{n} extra',
    '{n} días entrenados': '{n} days trained',

    'Lo que llevas comido': 'What you have eaten',
    'Calorías': 'Calories',
    'Proteína': 'Protein',
    'Hoy no has apuntado nada. Una foto del plato basta.':
      'Nothing logged today. A photo of the plate is enough.',
    'Te faltan {n} g de proteína para el objetivo del día.':
      "You're {n} g of protein short of today's target.",
    'Proteína del día cubierta.': "Today's protein is covered.",
    'Foto': 'Photo',
    'A mano': 'By hand',

    /* ---------- entrenar ---------- */
    'Hecho': 'Done',
    'Marcar como hecho': 'Mark as done',
    'deshacer': 'undo',
    'Descansar': 'Rest',
    'lo que te propongo': 'what I suggest',
    'series por repeticiones': 'sets by reps',
    'descanso {n} s': '{n} s rest',
    'Anterior': 'Previous',
    'Siguiente': 'Next',
    'Terminar': 'Finish',
    'Ejercicio anterior': 'Previous exercise',
    'Añadir ejercicio': 'Add exercise',
    'Añadir otro ejercicio a esta sesión': 'Add another exercise to this session',
    'Ejercicios de hoy': "Today's exercises",
    'Récord': 'Record',
    'Última vez': 'Last time',
    'Última vez, {c}': 'Last time, {c}',
    'No hay ningún entrenamiento en curso.': 'No workout in progress.',
    'ENTRENANDO': 'TRAINING',
    'Finalizar': 'Finish',
    'en marcha': 'elapsed',
    'series': 'sets',
    'reps': 'reps',
    'Otra opción': 'Another option',
    'Cómo se hace': 'How to do it',
    'Añadir serie': 'Add set',
    'Peso de la serie {n}': 'Weight for set {n}',
    'Repeticiones de la serie {n}': 'Reps for set {n}',
    '{d}/{t} series · objetivo {r} reps': '{d}/{t} sets · target {r} reps',

    /* ---------- Rutinas ---------- */
    'Crear la mía': 'Build my own',
    'la montas tú.': 'you put it together.',
    'Generar programa': 'Generate a programme',
    'te lo monto yo con tus datos y lo editas igual.':
      'I build it from your data and you can still edit it.',

    'Apuntar algo que ya hice': 'Log something I already did',
    'Caminar una hora el domingo o la pachanga del sábado cuentan igual, aunque no salgan de una rutina.':
      'An hour walking on Sunday or Saturday kickabout count the same, even if they come from no routine.',
    'Hoy no pude: correr el plan un día': "Couldn't today: push the plan a day",
    'Lo que tocaba hoy pasa a mañana, y así el resto, en vez de perder la sesión.':
      "Today's session moves to tomorrow, and so on down the line, instead of losing it.",
    'Traer una rutina que tengo en papel': 'Bring in a routine I have on paper',
    'Una foto de la hoja del gimnasio o el PDF de tu entrenador: la leo y tú decides.':
      "A photo of the gym sheet or your coach's PDF: I read it and you decide.",

    'Tienes rutinas repetidas': 'You have duplicate routines',
    'Hay {n} rutina que repite plan y día de otra, de haber generado el programa más de una vez. Se puede quitar de golpe.':
      '{n} routine repeats another one’s plan and day, from generating the programme more than once. It can be removed in one go.',
    'Hay {n} rutinas que repiten plan y día de otra, de haber generado el programa más de una vez. Se pueden quitar de golpe.':
      '{n} routines repeat another one’s plan and day, from generating the programme more than once. They can be removed in one go.',
    'Revisar y limpiar': 'Review and clean up',

    'Mis rutinas': 'My routines',
    'Ordena y borra lo que sobre': 'Reorder and delete what you don’t need',
    'Editar lista': 'Edit list',
    'Aún no tienes rutinas propias. Copia una plantilla de abajo para empezar.':
      'No routines of your own yet. Copy a template below to get going.',
    'Con las flechas las colocas a tu gusto y con la papelera las borras. El orden viaja a tus demás dispositivos, y al salir de aquí la rutina de hoy vuelve a ponerse la primera.':
      'The arrows reorder them and the bin deletes them. The order syncs to your other devices, and when you leave this screen today’s routine goes back to the top.',
    'Abre un plan para ver sus días. Toca una rutina para desplegar sus ejercicios y cambiarle el día, o pulsa Entrenar para hacerla ahora.':
      'Open a plan to see its days. Tap a routine to unfold its exercises and change its day, or hit Train to do it now.',

    'Rutinas de ejemplo': 'Example routines',
    'Al usar una plantilla se copia a tus rutinas; puedes cambiar ejercicios, series y descansos sin límite.':
      'Using a template copies it to your routines; you can change exercises, sets and rest as much as you like.',
    'Estiramientos, pilates y terapia': 'Stretching, pilates and rehab',
    'Se copian y se hacen igual que las demás, con su cronómetro y sus descansos. En estas las repeticiones son segundos.':
      'They copy and run like any other, with their timer and rest. In these, reps are seconds.',

    'Hoy es {d}, y esto es lo que toca': "Today is {d}, and here's what's on",
    'Hoy es {d}': 'Today is {d}',
    'Tu plan principal —{p}— no tiene nada para hoy. Otros planes sí: ábrelos abajo y entrena de ellos, o cambia de plan principal.':
      'Your main plan —{p}— has nothing for today. Other plans do: open them below and train from those, or switch your main plan.',
    'No tienes nada asignado a hoy. Abre un plan y toca los días de una rutina para moverla aquí.':
      'Nothing is assigned to today. Open a plan and tap a routine’s days to move it here.',
    'EN CURSO': 'ACTIVE',
    'HOY': 'TODAY',
    '{n} rutina': '{n} routine',
    '{n} rutinas': '{n} routines',
    '{n} ejercicios': '{n} exercises',
    'sin día': 'no day',
    'Analizar': 'Review',
    'con IA': 'with AI',
    'Duplicar': 'Duplicate',
    'Compartir': 'Share',
    'Mis planes de entrenamiento': 'My training plans',

    /* ---------- Ejercicios ---------- */
    'Filtro': 'Filter',
    'catálogo completo': 'full catalogue',
    'Buscar: pierna, femoral, peso muerto…': 'Search: leg, hamstring, deadlift…',
    'SESIÓN COMPLETA': 'FULL SESSION',
    'Entrenar {z} hoy': 'Train {z} today',
    'Reparto la sesión entre {m}': 'I split the session across {m}',
    'Crear': 'Create',
    'Ver todos': 'See all',
    'ver todos': 'see all',
    'Ver más ({n} restantes)': 'See more ({n} left)',
    'Has buscado una zona del cuerpo: te enseño {q}, no solo los que llevan esa palabra en el nombre.':
      'You searched for a body area: I’m showing you {q}, not just the ones with that word in the name.',
    'todos sus músculos por separado': 'every one of its muscles separately',
    'todos los ejercicios de {m}': 'every {m} exercise',
    'No existe ningún catálogo libre de pilates, así que estos están escogidos a mano del catálogo por lo que comparten con un mat de pilates: control del centro y trabajo de suelo.':
      'There is no free pilates catalogue, so these are hand-picked from the catalogue for what they share with pilates mat work: core control and floor work.',

    /* ---------- el material ---------- */
    'en el gimnasio': 'at the gym',
    'en casa con mancuernas': 'at home with dumbbells',
    'en casa con bandas': 'at home with bands',
    'sin material': 'with no equipment',
    'con todo el material': 'with all the equipment',
    'En el gimnasio': 'At the gym',
    'En casa con mancuernas': 'At home with dumbbells',
    'En casa con bandas': 'At home with bands',
    'Sin material': 'No equipment',
    'Ver todo': 'See everything',
    'Barras, mancuernas, poleas y máquinas': 'Barbells, dumbbells, cables and machines',
    'Mancuernas, kettlebells y peso corporal': 'Dumbbells, kettlebells and bodyweight',
    'Bandas elásticas y peso corporal': 'Resistance bands and bodyweight',
    'Solo tu peso corporal, en cualquier sitio': 'Just your bodyweight, anywhere',
    'El catálogo completo, sin filtrar por material':
      'The full catalogue, unfiltered by equipment',
    'Fuerza': 'Strength',
    'Calistenia': 'Calisthenics',
    'Halterofilia': 'Weightlifting',
    'Saltos y potencia': 'Plyometrics and power',
    'Estiramientos': 'Stretching',
    'Rodillo y terapia': 'Foam rolling and rehab',
    'Cardio': 'Cardio',
    'Yoga': 'Yoga',
    'Pilates': 'Pilates',

    /* ---------- Progreso ---------- */
    'Aquí verás tu evolución, tu constancia y qué músculos trabajas de más y de menos. Aparece en cuanto termines tu primer entrenamiento.':
      "Here you'll see how you're progressing, how consistent you are and which muscles you work too much or too little. It shows up as soon as you finish your first workout.",
    'Elegir una rutina': 'Pick a routine',
    'Semana': 'Week',
    'Mes': 'Month',
    '2 meses': '2 months',
    '3 meses': '3 months',
    'Año': 'Year',
    'la última semana': 'the last week',
    'el último mes': 'the last month',
    'los últimos dos meses': 'the last two months',
    'los últimos tres meses': 'the last three months',
    'el último año': 'the last year',
    'en {p}': 'in {p}',
    'Por semana': 'Per week',
    'Racha': 'Streak',
    'Tiempo': 'Time',
    'Series completadas': 'Sets completed',
    'Volumen levantado': 'Volume lifted',
    'Series': 'Sets',
    'Volumen': 'Volume',
    'vs. antes': 'vs. before',
    'Un punto por día': 'One dot per day',
    'Un punto por semana': 'One dot per week',
    'Constancia': 'Consistency',
    'Días entrenados': 'Days trained',
    'de {n}': 'of {n}',
    'El número de abajo son las series de ese día.': "The number below is that day's sets.",
    'Un cuadro por día.': 'One square per day.',
    'Los huecos también cuentan: el descanso forma parte del plan.':
      'The gaps count too: rest is part of the plan.',
    'Reparto por zona ({n} días)': 'Split by area ({n} days)',
    'Lo que más trabajas': 'What you work most',
    '{n}% de las series': '{n}% of your sets',
    'Récords personales': 'Personal records',
    'Menos': 'Less',
    'Más': 'More',

    /* ---------- Suplementos ---------- */
    'Módulo no disponible.': 'Module not available.',
    'Lo que tomas, cuánto y cuándo. Con esto la app te crea las alertas sola, deja de proponerte en el menú lo que ya tomas y cuenta lo que aportan.':
      'What you take, how much and when. With this the app creates your reminders itself, stops suggesting in your meal plan what you already take, and counts what they add.',
    'Todavía nada': 'Nothing yet',
    '¿Tomas algo?': 'Do you take anything?',
    'Creatina, proteína, omega 3, un multivitamínico… Apúntalo una vez y el resto de la app se entera: los recordatorios, el menú y las cuentas del día.':
      'Creatine, protein, omega 3, a multivitamin… Log it once and the rest of the app knows: your reminders, your meal plan and the day’s numbers.',
    'Añadir el primero': 'Add the first one',
    'Lo que tomas': 'What you take',
    'Añadir otro': 'Add another',
    'Se crean con el nombre y la dosis puestos, y a la hora que salga de cada momento. Si cambias las horas de tus comidas o los días de tu plan, vuelve aquí y se rehacen.':
      'They are created with the name and dose already in, at whatever time each moment works out to. If you change your meal times or your plan days, come back here and they are rebuilt.',
    'Tus alertas no coinciden': "Your reminders don't match",
    'Has cambiado suplementos, horas de comer o días de entreno desde la última vez.':
      'You have changed supplements, meal times or training days since last time.',
    'Rehacer las alertas': 'Rebuild the reminders',
    'Crear alertas': 'Create reminders',
    'Solo toca las de suplementos: las alertas que hayas creado tú se quedan como están.':
      'It only touches the supplement ones: reminders you created stay as they are.',

    'Que no se te olvide': "Don't forget",
    'Hoy no toca ninguno. Los de «los días que entreno» y «un día sí y otro no» se saltan solos.':
      'None due today. The "training days" and "every other day" ones skip themselves.',
    '{n} toma': '{n} dose',
    '{n} tomas': '{n} doses',

    'Lo que suman a tu día': 'What they add to your day',
    'calculando…': 'calculating…',
    'sin calcular': 'not calculated',
    'kcal': 'kcal',
    'proteína': 'protein',
    'hidratos': 'carbs',
    'grasa': 'fat',
    'Cubre.': 'Covers.',
    'Horarios.': 'Timing.',
    'Se pisan.': 'Overlap.',
    'En tu menú.': 'In your meal plan.',
    'Sin calcular.': 'Not calculated.',
    'Lo ha calculado el entrenador con tu lista, no es una suma del catálogo. Ya está contado en tu menú: no te pedirá en comida lo que estos te dan.':
      'Your coach worked this out from your list, not by adding up the catalogue. It is already counted in your meal plan: it won’t ask you to eat what these already give you.',
    'Volver a calcularlo': 'Work it out again',
    'Calculando lo que suman, con lo que tienes apuntado…':
      'Working out what they add, from what you have logged…',
    'Sumar esto a mano sale mal: no cuenta lo que escribes tú, ni las vitaminas ni los minerales. Lo calcula el entrenador, y lo que salga se descuenta solo de tu menú.':
      'Adding this up by hand goes wrong: it misses what you type in, and says nothing about vitamins or minerals. Your coach works it out, and whatever comes back is deducted from your meal plan automatically.',
    'Calcularlo ahora': 'Work it out now',
    'Calcularlo': 'Work it out',
    'Necesita el entrenador con IA configurado, en Perfil.':
      'Needs the AI coach set up, in Profile.',
    'Esto es una lista para acordarte y para que las cuentas cuadren, no una recomendación. Qué tomar, cuánto y si te conviene lo decides tú con quien te lleve la salud, sobre todo si tomas medicación.':
      'This is a list to help you remember and to make the numbers add up, not a recommendation. What to take, how much, and whether it suits you is between you and whoever looks after your health — especially if you take medication.',

    'Todos los días': 'Every day',
    'Los días que entreno': 'Training days',
    'Un día sí y otro no': 'Every other day',
    'Un día a la semana': 'One day a week',
    'Varias veces al día': 'Several times a day',
    'Cada 4 horas': 'Every 4 hours',
    'Cada 6 horas': 'Every 6 hours',
    'Cada 8 horas': 'Every 8 hours',
    'Cada 12 horas': 'Every 12 hours',
    'Antes de cada comida': 'Before every meal',
    'Con cada comida': 'With every meal',
    'Después de cada comida': 'After every meal',
    'Las pongo yo': 'I set them myself',

    /* ---------- Alertas ---------- */
    'Estado de los avisos': 'Notification status',
    'Automáticas': 'Automatic',
    'Nueva': 'New',
    'Tienes {n} recordatorio': 'You have {n} reminder',
    'Tienes {n} recordatorios': 'You have {n} reminders',
    ', {n} encendidos.': ', {n} switched on.',
    ', todos encendidos.': ', all switched on.',
    'Hoy ya no queda ninguno.': 'None left for today.',
    'El siguiente, «{t}» a las {h}.': 'Next up, "{t}" at {h}.',
    'Las horas salen de tus datos: tu peso, a qué hora te levantas y cuándo entrenas.':
      'The times come from your data: your weight, when you get up and when you train.',
    'Mis recordatorios': 'My reminders',
    'Sin recordatorios todavía. Abajo tienes los que te propongo con tus datos, con las horas ya calculadas.':
      'No reminders yet. Below are the ones I suggest from your data, with the times already worked out.',
    'Crear desde mis rutinas': 'Create from my routines',
    'Que suenen con la app cerrada': 'Make them fire with the app closed',
    'Una página web no puede avisarte sola si está cerrada, salvo pagando un servidor de notificaciones. La vía que sí funciona y no cuesta nada es llevarlos al calendario del móvil, que sí avisa siempre.':
      'A web page cannot notify you on its own once it is closed, unless you pay for a notification server. The route that does work and costs nothing is putting them in your phone calendar, which always fires.',
    'Tus avisos del calendario ya se acabaron': 'Your calendar reminders have run out',
    'Tus avisos del calendario se acaban hoy': 'Your calendar reminders run out today',
    'Tus avisos del calendario se acaban en {n} días':
      'Your calendar reminders run out in {n} days',
    'Tu calendario está desfasado': 'Your calendar is out of date',
    'Puedo proponerte las horas': 'I can suggest the times',
    'Con tu peso, tu actividad y a qué hora te levantas calculo cuántos vasos de agua te tocan y a qué horas, cuándo comer y cuándo entrenar. Necesito el perfil completo.':
      'From your weight, your activity and when you get up I work out how many glasses of water you need and when, when to eat and when to train. I need the full profile.',
    'Completar mi perfil': 'Complete my profile',
    'Ya tienes creados todos los recordatorios que te propondría con tus datos. Si cambias de peso, de horarios o de rutinas, vuelve por aquí y recalculo.':
      'You already have every reminder I would suggest from your data. If your weight, your times or your routines change, come back and I will recalculate.',
    'Lo que te propongo': 'What I suggest',
    'Crear todas': 'Create them all',
    'Calculado con tus datos, no son horas por defecto. Puedes cambiarlas después.':
      'Worked out from your data, not default times. You can change them afterwards.',

    /* «Entrenamiento» ya está arriba, en la sección de Perfil: es la misma
       palabra y la misma traducción. */
    'Beber agua': 'Drink water',
    'Comida': 'Meal',
    'Pesarte': 'Weigh in',
    'Suplemento': 'Supplement',
    'Mensaje del entrenador': 'Message from your coach',
    'Personalizada': 'Custom',

    /* Los títulos que la app escribe dentro de cada alerta. Van aquí porque se
       guardan en español dentro del propio recordatorio, y pasan por T() al
       pintarlos; lo que escribes tú no está en esta lista y sale tal cual. */
    'Toca entrenar': 'Time to train',
    'Hidrátate': 'Drink up',
    'Hora de comer': 'Meal time',
    'Pésate': 'Weigh yourself',
    'Recordatorio': 'Reminder',
    'Tu entrenador': 'Your coach',
    'Es hora de desayunar': 'Time for breakfast',
    'Es hora de almorzar': 'Time for lunch',
    'Es hora de merendar': 'Time for a snack',
    'Es hora de cenar': 'Time for dinner',
    'Es hora de ': 'Time for ',
    'Comida antes de entrenar': 'Pre-workout meal',
    'Empieza a apagar el día': 'Start winding down',
    'Tus suplementos': 'Your supplements',
    'De lunes a viernes': 'Monday to Friday',

    /* ---------- los avisos del sistema ---------- */
    'Sin avisos aquí': 'No notifications here',
    'Este navegador no sabe mostrar avisos del sistema. Los recordatorios los sigues viendo dentro de la app, y para que suenen con la app cerrada tienes el calendario, más abajo.':
      'This browser cannot show system notifications. You still see your reminders inside the app, and to have them fire with the app closed there is the calendar, further down.',
    'Falta instalar la app': 'The app needs installing',
    'Añádela a tu pantalla de inicio': 'Add it to your home screen',
    'En el iPhone los avisos solo funcionan desde la app instalada, no desde el navegador. Se hace una vez:':
      'On iPhone, notifications only work from the installed app, not from the browser. You do this once:',
    'Toca el botón de compartir de Safari, el cuadrado con la flecha.':
      'Tap the Safari share button, the square with the arrow.',
    'Baja y elige <b>{q}</b>.': 'Scroll down and pick <b>{q}</b>.',
    'Añadir a pantalla de inicio': 'Add to Home Screen',
    'Abre Training FR desde el icono nuevo y vuelve aquí.':
      'Open Training FR from the new icon and come back here.',
    'Bloqueados': 'Blocked',
    'Los avisos están bloqueados': 'Notifications are blocked',
    'Se dijo que no una vez y el sistema no lo vuelve a preguntar. Hay que activarlos a mano:':
      'You said no once and the system never asks again. You have to switch them on by hand:',
    'Abre los Ajustes del iPhone.': 'Open the iPhone Settings.',
    'Baja hasta Training FR y entra.': 'Scroll down to Training FR and open it.',
    'Entra en Notificaciones y enciende Permitir notificaciones.':
      'Go into Notifications and turn on Allow Notifications.',
    'Toca el candado de la barra de direcciones.': 'Tap the padlock in the address bar.',
    'Busca Notificaciones y ponlo en Permitir.': 'Find Notifications and set it to Allow.',
    'Recarga esta página.': 'Reload this page.',
    'Falta un paso': 'One step missing',
    'Permite los avisos': 'Allow notifications',
    'Sin permiso solo verás los recordatorios dentro de la app. El sistema te lo va a preguntar una vez.':
      'Without permission you will only see reminders inside the app. The system will ask you once.',
    'Activar los avisos': 'Turn on notifications',

    /* ---------- Alimentación ---------- */
    'Necesito tu peso, altura, edad y sexo para calcular tus calorías.':
      'I need your weight, height, age and sex to work out your calories.',
    'Completar mis datos': 'Fill in my details',
    'Calculado a partir de tus datos con la fórmula de Mifflin-St Jeor. Es una orientación, no una pauta médica.':
      'Worked out from your data with the Mifflin-St Jeor formula. It is a guide, not medical advice.',
    'Mis números': 'My numbers',
    'Gasto diario estimado': 'Estimated daily burn',
    'Objetivo': 'Goal',
    'Agua al día': 'Water a day',
    'Comidas al día': 'Meals a day',
    'Con qué cocino': 'What I cook with',
    'Un menú con ingredientes que no tienes —o que ni conoces— no lo sigue nadie. Dime con qué sueles cocinar y el menú sale de ahí.':
      'Nobody follows a meal plan full of ingredients they don’t have — or have never heard of. Tell me what you usually cook with and the plan comes from that.',
    'LO QUE SUELES TENER O COMPRAR': 'WHAT YOU USUALLY HAVE OR BUY',
    'Ej. arroz, pasta, lentejas, huevos, pollo, atún en lata, yogur griego, plátano, avena, aceite de oliva, tomate, cebolla, pan integral':
      'e.g. rice, pasta, lentils, eggs, chicken, tinned tuna, Greek yoghurt, banana, oats, olive oil, tomato, onion, wholemeal bread',
    'Ponlo a tu manera, separado por comas. Si para cuadrar tus números hiciera falta algo que no esté aquí, te lo dirá aparte en vez de colártelo en un plato.':
      'Write it however you like, separated by commas. If something not on this list is needed to make your numbers work, it will tell you separately instead of slipping it into a dish.',
    '¿LE PIDES ALGO CONCRETO AL ENTRENADOR?': 'ANYTHING SPECIFIC TO ASK YOUR COACH?',
    'Lo de arriba es con qué cuentas; esto son órdenes. Manda sobre lo demás, menos sobre tus alergias y tus condiciones de salud.':
      'Above is what you have; this is instructions. It overrides everything else except your allergies and health conditions.',
    'Ej. nada de pescado; la cena siempre ligera; el desayuno que se prepare en cinco minutos; los domingos cocino para toda la semana':
      'e.g. no fish; dinner always light; breakfast ready in five minutes; on Sundays I cook for the whole week',
    'Mis menús': 'My meal plans',
    'Nuevo': 'New',
    'Un menú semanal que cuadre con tus calorías, tu dieta, lo que no puedes comer y lo que tienes en casa. Lo prepara el entrenador con IA, o se hace uno genérico con tus números si prefieres poner tú los platos. Puedes guardar los que quieras —el de la semana fuerte, el de cuando viajas— y marcar cuál manda.':
      'A weekly plan that fits your calories, your diet, what you can’t eat and what you have at home. The AI coach builds it, or a generic one is made from your numbers if you would rather pick the dishes yourself. You can save as many as you like — the heavy week, the travelling one — and mark which one counts.',
    'Crear mi primer menú': 'Create my first meal plan',
    'Tu objetivo del día': "Today's target",
    '{n}% de las kcal': '{n}% of kcal',
    'Hidratos': 'Carbs',
    'Grasa': 'Fat',
    'de {n} kcal': 'of {n} kcal',
    'de {n} g': 'of {n} g',
    'Te quedan <b>{n}</b> kcal': '<b>{n}</b> kcal to go',
    'Objetivo de calorías cubierto': 'Calorie target met',
    'Te faltan <b>{n} g de proteína</b> para llegar al objetivo del día.':
      "You're <b>{n} g of protein</b> short of today's target.",
    'Foto de lo que comes': 'Photo of what you eat',
    'Apuntar a mano': 'Log by hand',
    'La foto se encoge en el móvil, se manda para que la IA la lea y se suelta: no se guarda ni aquí ni en ningún sitio. Solo quedan el nombre del plato y los números.':
      'The photo is shrunk on your phone, sent for the AI to read and then dropped: it is not stored here or anywhere. Only the dish name and the numbers stay.',
    'Media de {n} día apuntado': 'Average over {n} logged day',
    'Media de {n} días apuntados': 'Average over {n} logged days',
    'Sin nada apuntado': 'Nothing logged',
    '{n} día llegaste a los {g} g de proteína. La raya es tu objetivo de calorías.':
      'On {n} day you hit {g} g of protein. The line is your calorie target.',
    '{n} días llegaste a los {g} g de proteína. La raya es tu objetivo de calorías.':
      'On {n} days you hit {g} g of protein. The line is your calorie target.',
    'Apunta lo que comes y aquí verás la semana entera de un vistazo.':
      'Log what you eat and you will see the whole week at a glance here.',
    'Proteína cubierta': 'Protein met',
    'Cerca': 'Close',
    'Corto': 'Short',
    'Lo que comiste esta semana': 'What you ate this week',

    /* ---------- entrenar y las etiquetas de accesibilidad ---------- */
    'Descanso terminado. ¡A por la siguiente serie!': 'Rest over. On to the next set!',
    'Analizado por tu entrenador: {met} MET': 'Analysed by your coach: {met} MET',
    'intensidad {q}': '{q} intensity',
    'Sin analizar: gasto medio de 4 MET. Conecta la IA en Ajustes para que lo calcule de verdad.':
      'Not analysed: an average 4 MET. Connect the AI in Settings so it can work it out properly.',
    'Cambiarlo': 'Change it',
    'hoy': 'today',
    'ayer': 'yesterday',
    'hace {n} día': '{n} day ago',
    'hace {n} días': '{n} days ago',
    'hace una semana': 'a week ago',
    'hace {n} semana': '{n} week ago',
    'hace {n} semanas': '{n} weeks ago',
    'hace {n} mes': '{n} month ago',
    'hace {n} meses': '{n} months ago',
    'Lo has hecho {n} vez': 'You have done it {n} time',
    'Lo has hecho {n} veces': 'You have done it {n} times',
    'El cronómetro ya está corriendo. Puedes entrenar así, solo con el tiempo, contarme qué estás haciendo, o ir añadiendo los ejercicios para registrar series y pesos.':
      'The timer is already running. You can train like this, just on time, tell me what you are doing, or add the exercises as you go to log sets and weights.',
    'Cuéntame qué estoy haciendo': 'Tell me what I am doing',
    'Cargar una rutina': 'Load a routine',
    'Terminar y guardar el tiempo': 'Finish and save the time',
    'Terminar y guardar entrenamiento': 'Finish and save workout',
    'Descartar entrenamiento': 'Discard workout',
    '¡Nuevo récord en {que}!': 'New record on {que}!',
    'Ejercicio desmarcado': 'Exercise unticked',
    'Hecho. A por el siguiente.': 'Done. On to the next one.',
    '«{que}» añadido a la sesión': '“{que}” added to the session',
    'Se perderán las series registradas en esta sesión. Esta acción no se puede deshacer.':
      'The sets logged in this session will be lost. This cannot be undone.',
    'Descartar': 'Discard',
    'Entrenamiento descartado': 'Workout discarded',
    '¿Qué estás haciendo?': 'What are you doing?',
    'Escríbelo como lo dirías: «partido de fútbol», «subí a Monserrate», «ciclovía».':
      'Write it the way you would say it: “football match”, “walked up the hill”, “cycle lane”.',
    'Yo calculo el gasto y qué partes del cuerpo trabajas.':
      'I work out the burn and which parts of your body you are working.',
    'Sin la IA conectada lo apunto con un gasto medio.':
      'Without the AI connected I log it with an average burn.',
    'Partido de fútbol': 'Football match',
    'CUÁNDO': 'WHEN',
    'Lo estoy haciendo': 'I am doing it now',
    'Ya lo hice': 'I already did it',
    'CUÁNTO DURÓ': 'HOW LONG IT TOOK',
    '{n} min': '{n} min',
    'u otro número de minutos': 'or another number of minutes',
    'Calcular y empezar': 'Work it out and start',
    'Calcular y apuntar': 'Work it out and log it',
    'Apuntar': 'Log it',
    '{que} en marcha': '{que} under way',
    '{que}: {min} min, ~{kcal} kcal': '{que}: {min} min, ~{kcal} kcal',
    '(gasto medio, sin analizar)': '(average burn, not analysed)',
    'Escribe qué has hecho': 'Write what you did',
    'Calculando…': 'Working it out…',
    'Eso no me suena a actividad física.':
      'That does not sound like physical activity to me.',
    'No he podido calcularlo.': 'I could not work it out.',
    'No encuentro un recambio para este ejercicio':
      'I cannot find a replacement for this exercise',
    'Cambiar «{que}»': 'Swap “{que}”',
    'Con tu material no hay recambio directo; estas son del catálogo completo.':
      'There is no direct replacement with your equipment; these come from the whole catalogue.',
    'Mismo trabajo, otro material. Las series que ya has marcado no se pierden.':
      'Same work, different kit. The sets you have already ticked are not lost.',
    'Pausar': 'Pause',
    'Reproducir': 'Play',
    'Llevas {t} entrenando y no has anotado ninguna serie.':
      'You have been training for {t} and have not logged a single set.',
    '{n} serie completada y {t} de entrenamiento.':
      '{n} set completed and {t} of training.',
    '{n} series completadas y {t} de entrenamiento.':
      '{n} sets completed and {t} of training.',
    'Guardar el entrenamiento': 'Save the workout',
    'Guardar el tiempo': 'Save the time',
    'Reiniciar y empezar de cero': 'Reset and start from scratch',
    'Descartar, no guardar nada': 'Discard, save nothing',
    '¡Entrenamiento guardado! Volumen: {v}': 'Workout saved! Volume: {v}',
    '¡Entrenamiento guardado! {t}': 'Workout saved! {t}',
    '¿Reiniciar el entrenamiento?': 'Reset the workout?',
    'Reiniciar': 'Reset',
    'Entrenamiento reiniciado': 'Workout reset',
    '¿Descartar el entrenamiento?': 'Discard the workout?',
    'No se guarda nada, ni el tiempo. Esto no se puede deshacer.':
      'Nothing is saved, not even the time. This cannot be undone.',
    'Se borra la {n} serie que llevas marcada y el cronómetro vuelve a cero. La rutina se queda igual y los pesos que hayas escrito también.':
      'The {n} set you have ticked is cleared and the timer goes back to zero. The routine stays as it is, and so do any weights you typed in.',
    'Se borran las {n} series que llevas marcadas y el cronómetro vuelve a cero. La rutina se queda igual y los pesos que hayas escrito también.':
      'The {n} sets you have ticked are cleared and the timer goes back to zero. The routine stays as it is, and so do any weights you typed in.',
    'El cronómetro vuelve a cero y empiezas otra vez por el primer ejercicio.':
      'The timer goes back to zero and you start again from the first exercise.',
    'No se guarda nada: ni la {n} serie que llevas ni los {t} de entrenamiento. Esto no se puede deshacer.':
      'Nothing is saved: neither the {n} set you have done nor the {t} of training. This cannot be undone.',
    'No se guarda nada: ni las {n} series que llevas ni los {t} de entrenamiento. Esto no se puede deshacer.':
      'Nothing is saved: neither the {n} sets you have done nor the {t} of training. This cannot be undone.',
    'Subir': 'Move up',
    'Bajar': 'Move down',
    'Borrar rutina': 'Delete routine',
    'Ver ejercicios': 'See exercises',
    'Rutina mixta': 'Mixed routine',
    'Cambiar por otro': 'Swap for another',
    'Mostrar u ocultar': 'Show or hide',
    'Apuntar un vaso suelto': 'Log a single glass',
    'Pausar animación': 'Pause the animation',
    'Velocidad de la animación': 'Animation speed',
    'Borrar objetivo': 'Delete goal',
    'Activar {que}': 'Turn on {que}',
    'Marcar serie {n} como hecha': 'Tick set {n} as done',
    'Músculos que trabajan, de frente': 'Muscles worked, front view',
    'Músculos que trabajan, de espaldas': 'Muscles worked, back view',
    'Ir al inicio': 'Go to Home',
    'Terminar entrenamiento': 'Finish workout',

    /* ---------- filtrar y elegir ejercicio ---------- */
    'Filtrar': 'Filter',
    'ZONA DEL CUERPO': 'AREA OF THE BODY',
    'Todas': 'All',
    'TIPO DE TRABAJO': 'TYPE OF WORK',
    'Material': 'Equipment',
    'Nivel': 'Level',
    'Cualquiera': 'Any',
    'Solo mis favoritos': 'Only my favourites',
    'Los que has marcado con la estrella': 'The ones you starred',
    'Solo lo que puedo hacer': 'Only what I can do',
    'Con el material que tienes {donde}': 'With the equipment you have {donde}',
    'Quitar los filtros': 'Clear the filters',
    'Mostrando el catálogo completo': 'Showing the whole catalogue',
    'Solo lo que puedes hacer {donde}': 'Only what you can do {donde}',
    'Solo mi material': 'Only my equipment',
    'Ver todo el catálogo': 'See the whole catalogue',

    /* ---------- tipos de trabajo y la cuenta de ejercicios ---------- */
    'No hay ninguno así': 'There are none like that',
    'Ver el ejercicio': 'See the exercise',
    'Ver {n} ejercicios': 'See {n} exercises',

    /* ---------- Datos y hábitos ---------- */
    'A qué ritmo': 'At what rate',
    'Alergias o alimentos que evito': 'Allergies or foods I avoid',
    'Con esto reparto los recordatorios de agua y comidas por tus horas reales, no por unas por defecto, y saco cuánto duermes.':
      'With this I spread your water and meal reminders across your real hours rather than default ones, and work out how much you sleep.',
    'Con mis palabras': 'In my own words',
    'Condiciones de salud': 'Health conditions',
    'De estos cuatro campos salen los menús que te sugiero y los ejercicios que entran o no en tus rutinas. Si los dejas vacíos, te propongo lo de siempre para cualquiera; si los rellenas, te propongo lo tuyo.':
      'These four fields decide the meal plans I suggest and which exercises make it into your routines. Leave them empty and you get the same as anyone else; fill them in and you get yours.',
    'Duermo': 'I sleep',
    'Déficit sobre tu gasto, con la proteína alta para no perder músculo':
      'A deficit against your burn, with protein high so you do not lose muscle',
    'El mío': 'Mine',
    'Es tu gasto ajustado a lo que buscas y al ritmo que has elegido.':
      'It is your burn adjusted to what you are after and the rate you chose.',
    'Estimaciones para población general (Mifflin-St Jeor). Si tienes una condición médica, manda tu médico.':
      'Estimates for the general population (Mifflin-St Jeor). If you have a medical condition, your doctor decides.',
    'Esto es lo que más cambia lo que te propongo':
      'This is what changes my suggestions most',
    'Hombro derecho, rodilla…': 'Right shoulder, knee…',
    'Hora a la que entreno': 'The time I train',
    'Lactosa, frutos secos…': 'Lactose, nuts…',
    'Lesiones o limitaciones': 'Injuries or limitations',
    'Lo mío': 'What\'s mine',
    'Lo pongo yo en kilos por semana': 'I set it myself in kilos a week',
    'Lo que escribas aquí retira ejercicios de tus rutinas y de lo que te propone el entrenador. Es lo que evita que te ofrezca algo que te haga daño.':
      'What you write here removes exercises from your routines and from what the coach suggests. It is what stops it offering you something that would hurt you.',
    'Me acuesto': 'I go to bed',
    'Me levanto': 'I get up',
    'Metabolismo basal': 'Basal metabolism',
    'Mi día': 'My day',
    'Mi objetivo': 'My goal',
    'Moverme, dormir y comer bien, sin una meta de báscula':
      'Moving, sleeping and eating well, with no target on the scales',
    'Ni subir ni bajar; sostener lo que ya tienes':
      'Neither up nor down; holding on to what you have',
    'Ningún menú te va a ofrecer algo que no comas.':
      'No meal plan will offer you something you do not eat.',
    'Objetivo diario': 'Daily target',
    'Opcional. Lo lee el entrenador con IA para lo que te propone. Los números salen de la opción de arriba; esto es el matiz que ninguna lista recoge.':
      'Optional. The AI coach reads it for what it suggests. The numbers come from the option above; this is the nuance no list captures.',
    'Opcional. Si la dejas vacía, la deduzco de las horas a las que sueles entrenar.':
      'Optional. Leave it empty and I work it out from the hours you usually train.',
    'Para que el menú las tenga en cuenta. No sustituye a tu médico ni a un dietista.':
      'So your meal plan takes them into account. It does not replace your doctor or a dietitian.',
    'Perder grasa y ganar músculo a la vez: calorías de mantenimiento y mucha proteína':
      'Losing fat and building muscle at once: maintenance calories and plenty of protein',
    'Peso saludable': 'Healthy weight',
    'Quedan fuera de todo lo que te proponga, y si salen en la foto de un plato te aviso.':
      'They are left out of everything I suggest, and if they turn up in a photo of a plate I tell you.',
    'Qué busco': 'What I am after',
    'Sale de esas dos horas, no hace falta apuntarlo aparte.':
      'It comes from those two times, there is nothing extra to log.',
    'Con menos de 6 h cuesta recuperar entre sesiones.':
      'On under 6 h it is hard to recover between sessions.',
    'Pon las dos horas y calculo cuánto duermes.':
      'Set both times and I work out how much you sleep.',
    'Sin gluten': 'Gluten-free',
    'Sin lactosa': 'Lactose-free',
    'Sin restricciones': 'No restrictions',
    'Sin tocar el peso: lo que sube son los kilos de la barra':
      'Without touching your weight: what goes up is the kilos on the bar',
    'Superávit controlado sobre tu gasto': 'A controlled surplus over your burn',
    'Tensión alta, colesterol, diabetes…':
      'High blood pressure, cholesterol, diabetes…',
    'Unos {n} kg por semana más.': 'About {n} kg a week more.',
    'Unos {n} kg por semana menos.': 'About {n} kg a week less.',
    'Vegana': 'Vegan',
    'Vegetariana': 'Vegetarian',
    'Volver a correr 10 km, quitarme el dolor de espalda…':
      'Run 10 km again, get rid of my back pain…',
    'kg por semana': 'kg a week',
    'Falta {que}': 'Missing: {que}',
    'Sin el país el menú sale de un supermercado que no es el tuyo, con nombres que no usas.':
      'Without your country the meal plan comes from a supermarket that is not yours, using names you do not use.',
    'Sin tus datos no puedo calcular tus calorías ni ajustarte el entrenamiento, y sin el país el menú sale de otro supermercado.':
      'Without your details I cannot work out your calories or tune your training, and without your country the meal plan comes from another supermarket.',
    'Es lo único obligatorio; lo demás lo vas rellenando cuando quieras.':
      'It is the only thing that is required; the rest you fill in whenever you like.',

    /* ---------- peso e historial ---------- */
    'Registra tu peso cada semana para ver la evolución.':
      'Log your weight every week to see how it moves.',

    /* ---------- Ajustes: copia, instalar y zona peligrosa ---------- */
    'Borrar todos mis datos': 'Delete all my data',
    'Bóveda de claves': 'Key vault',
    'Copia de seguridad': 'Backup',
    'Entra con tu correo para tenerlo todo en cada dispositivo':
      'Sign in with your email to have everything on every device',
    'Exportar': 'Export',
    'Importar': 'Import',
    'Instalar aplicación': 'Install the app',
    'Instalar en el móvil': 'Install on your phone',
    'Rutinas, historial, perfil y ajustes de este dispositivo. No se puede deshacer.':
      'Routines, history, profile and settings on this device. This cannot be undone.',
    'Traer un archivo exportado desde otro dispositivo':
      'Bring in a file exported from another device',
    'Training FR funciona como una app: ábrela en el navegador del móvil y usa <b>{que}</b> (en Android, desde el menú del navegador; en iPhone, desde el botón Compartir). Después arranca a pantalla completa y funciona sin conexión.':
      'Training FR works like an app: open it in your phone’s browser and use <b>{que}</b> (on Android, from the browser menu; on iPhone, from the Share button). After that it starts full screen and works offline.',
    'Training FR · Catálogo de ejercicios de {a} (dominio público) y {b}, que es de donde salen los nombres y las instrucciones escritos en español.':
      'Training FR · Exercise catalogue from {a} (public domain) and {b}, which is where the hand-written Spanish names and instructions come from.',
    'Tus datos se quedan en tu dispositivo salvo que actives la sincronización con tu correo.':
      'Your data stays on your device unless you turn on sync with your email.',
    'Tus rutinas y tu historial se guardan solo en este navegador. Exporta un archivo para conservarlos o llevarlos a otro dispositivo.':
      'Your routines and history are saved in this browser only. Export a file to keep them or take them to another device.',
    'Un archivo con todo lo tuyo, listo para guardar':
      'One file with everything of yours, ready to keep',
    'Zona peligrosa': 'Danger zone',
    '«Añadir a la pantalla de inicio»': '“Add to Home Screen”',
    'Anotas cada serie. Necesario para los récords, el volumen y las gráficas.':
      'You log every set. Needed for records, volume and charts.',
    'Te propongo el objetivo (3 × 12) y solo marcas las que vas haciendo.':
      'I suggest the target (3 × 12) and you just tick off the ones you do.',
    'Un botón por ejercicio. Ni peso, ni repeticiones, ni series.':
      'One button per exercise. No weight, no reps, no sets.',
    'El entrenador recuerda la {n} frase que ya te ha dicho para no repetirse.':
      'The coach remembers the {n} line it has already said to you so it does not repeat itself.',
    'El entrenador recuerda las {n} frases que ya te ha dicho para no repetirse.':
      'The coach remembers the {n} lines it has already said to you so it does not repeat itself.',

    /* ---------- las tres formas de apuntar ---------- */
    'Peso y repeticiones': 'Weight and reps',
    'Marcar cada serie': 'Tick off each set',
    'Marcar el ejercicio y ya': 'Just tick off the exercise',
    '{a} de {b}': '{a} of {b}',

    /* ---------- donde entrenas y las horas de comer ---------- */
    '¿Dónde entrenas?': 'Where do you train?',
    'Cambia el sitio y el catálogo se ajusta al momento.':
      'Change the place and the catalogue adjusts straight away.',
    'Qué cambia al elegir': 'What choosing changes',
    'El catálogo, el buscador de ejercicios y las rutinas que te genere la IA: solo te ofrecerán lo que puedas hacer ahí. Lo que ya tengas guardado no se toca.':
      'The catalogue, the exercise search and any routine the AI builds you: they will only offer what you can do there. Anything you have already saved is untouched.',
    'Ahora entrenas {donde}': 'You now train {donde}',
    'Tus horas de comer': 'Your meal times',
    'Dime a qué hora empieza cada comida. Cada una llega hasta que empieza la siguiente, y la cena se estira hasta el desayuno del día siguiente.':
      'Tell me what time each meal starts. Each one runs until the next begins, and dinner stretches to the next day’s breakfast.',
    'desde las {a} hasta las {b}': 'from {a} to {b}',
    'Volver a las horas de siempre': 'Go back to the usual times',

    /* ---------- Bóveda de claves ---------- */
    'Aquí se guardan las claves de los servicios que usa la app. Se quedan en este dispositivo: no viajan al repositorio ni las ve nadie más.':
      'This is where the keys for the services the app uses are kept. They stay on this device: they never travel to the repository and nobody else sees them.',
    'Núcleo inteligente': 'The thinking core',
    'Quién piensa por la app': 'Who does the thinking for the app',
    'Sin clave: el entrenador y el plan de comidas no funcionan':
      'No key: the coach and the meal plan do not work',
    '{prov} · clave guardada · {modelo}': '{prov} · key saved · {modelo}',
    'Activo con otro proveedor; {prov} aún sin clave':
      'Active with another provider; {prov} still has no key',
    'Auditoría de rutinas, plan de comidas, foto del plato, entrenador y listas de música.':
      'Routine audits, meal plans, plate photos, the coach and music playlists.',
    'Elige quién contesta. Cada uno guarda su propia clave, así que puedes tener varios puestos y cambiar de uno a otro con un toque; lo que cambies aquí vale para toda la app.':
      'Choose who answers. Each one keeps its own key, so you can have several set up and switch between them with one tap; what you change here applies across the whole app.',
    'gratis': 'free',
    'La clave se saca en {donde}.': 'You get the key at {donde}.',
    'No lee fotos': 'It does not read photos',
    '{no}, así que el cálculo de la comida por foto necesita Gemini o Anthropic.':
      '{no}, so working out food from a photo needs Gemini or Anthropic.',
    'Clave de {prov}': '{prov} key',
    'Modelo': 'Model',
    'Ver los suyos': 'See theirs',
    'o escribe otro nombre de modelo': 'or type another model name',
    'Probar': 'Test',
    'Cómo consigo la clave de {prov}': 'How do I get a {prov} key',
    'Borrar la clave de {prov}': 'Delete the {prov} key',
    'Música · Spotify': 'Music · Spotify',
    'Client ID de Spotify': 'Spotify Client ID',
    'Hay que reconectar para dar los permisos nuevos':
      'You need to reconnect to grant the new permissions',
    'Conectado · puede reproducir y crear listas':
      'Connected · it can play and create playlists',
    'Client ID puesto, falta conectar la cuenta':
      'Client ID set, the account still needs connecting',
    'Sin Client ID: la música no se puede controlar desde aquí':
      'No Client ID: music cannot be controlled from here',
    'Controlar la música desde la pantalla de entrenamiento.':
      'Control the music from the workout screen.',
    'La app ya puede reproducir por sí misma y crear listas. Pulsa Conectar para dar los permisos nuevos.':
      'The app can now play by itself and create playlists. Press Connect to grant the new permissions.',
    '32 caracteres': '32 characters',
    'Desconectar': 'Disconnect',
    'Conectar': 'Connect',
    'Dirección de retorno': 'Redirect URI',
    'cópiala en el panel': 'copy it into the dashboard',
    'dirección de retorno': 'redirect URI',
    'Cómo consigo el Client ID': 'How do I get the Client ID',
    'Borrar la configuración de Spotify': 'Delete the Spotify setup',
    'Cuenta y sincronización': 'Account and sync',
    'Cuenta y sincronización · Supabase': 'Account and sync · Supabase',
    'No tienes que tocar nada': 'There is nothing for you to do',
    'La lleva quien administra': 'Whoever administers it runs it',
    'Tus datos viajan a la base de datos de quien te dio el acceso, y solo los ves tú: la base no deja que nadie lea lo de otra persona.':
      'Your data goes to the database of whoever gave you access, and only you see it: the database does not let anyone read someone else’s.',
    'Sesión abierta · tus datos viajan entre dispositivos':
      'Signed in · your data travels between devices',
    'Proyecto configurado, sin sesión iniciada': 'Project set up, not signed in',
    'Sin configurar: los datos solo viven en este dispositivo':
      'Not set up: your data lives on this device only',
    'Entrar con tu correo y sincronizar entre dispositivos.':
      'Sign in with your email and sync between devices.',
    'Clave publishable (o anon)': 'Publishable key (or anon)',
    'Montarla paso a paso': 'Set it up step by step',
    'Ocho pasos con capturas de cada menú, diciendo qué botón tocar. Esta pantalla es el atajo para quien ya lo tiene montado.':
      'Eight steps with a screenshot of every menu, saying which button to tap. This screen is the shortcut for anyone who already has it set up.',
    'El resumen, si ya te lo sabes': 'The short version, if you already know it',
    'SQL para crear la tabla': 'SQL to create the table',
    'Copiar': 'Copy',
    'Borrar la configuración de Supabase': 'Delete the Supabase setup',
    'Varios dispositivos': 'Several devices',
    'Sincronizar mis claves': 'Sync my keys',
    'Encendido · no hay que repetirlas en cada dispositivo':
      'On · no need to repeat them on every device',
    'Apagado · cada dispositivo lleva las suyas': 'Off · each device keeps its own',
    'Que viajen con mis datos': 'Let them travel with my data',
    'Las claves de IA y el Client ID de Spotify, para no repetirlos en cada dispositivo':
      'Your AI keys and Spotify Client ID, so you do not repeat them on every device',
    'Sincronizar claves': 'Sync keys',
    'Las sesiones abiertas nunca se sincronizan: cada dispositivo abre la suya, que es lo correcto. En uno nuevo solo tendrás que pulsar Conectar en Spotify.':
      'Open sessions are never synced: each device opens its own, which is as it should be. On a new one you will only have to press Connect in Spotify.',
    'Un enlace y ya': 'One link and that is it',
    'Enlazar un dispositivo nuevo': 'Link a new device',
    'La configuración de Supabase no puede venir de la nube, porque es justo la que abre la puerta. Abre este enlace en el otro dispositivo y quedará listo para entrar con tu correo.':
      'The Supabase setup cannot come from the cloud, because it is the very thing that opens the door. Open this link on the other device and it will be ready for you to sign in with your email.',
    'Compartir enlace': 'Share link',
    'Copiar enlace': 'Copy link',
    'El enlace lleva la URL del proyecto y la clave anon, que son públicas por diseño: sin entrar con tu correo no dan acceso a ningún dato.':
      'The link carries the project URL and the anon key, which are public by design: without signing in with your email they give access to no data.',
    'Dónde viven las claves': 'Where the keys live',
    'Y cómo borrarlas todas de golpe': 'And how to delete them all at once',
    'Las claves viven en el almacenamiento de este navegador y, si la sincronización de claves está activada, también en tu base de datos de Supabase, donde solo tú puedes leerlas.':
      'The keys live in this browser’s storage and, if key sync is on, in your Supabase database too, where only you can read them.',
    'La clave <i>publishable</i> de Supabase y el <i>Client ID</i> de Spotify están pensados para ir en el navegador y no son secretos. Las de IA sí lo son: no las compartas ni las pegues en el código.':
      'Supabase’s <i>publishable</i> key and Spotify’s <i>Client ID</i> are meant to live in the browser and are not secrets. The AI ones are: do not share them or paste them into code.',
    'Borrar todas las claves': 'Delete all the keys',
    '<li>Entra en <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> y crea una cuenta. No pide tarjeta.</li>':
      '<li>Go to <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> and create an account. No card needed.</li>',
    '<li>Pulsa <b>Create API Key</b>, ponle un nombre y cópiala (empieza por <code>gsk_</code>). Solo se enseña una vez.</li>':
      '<li>Press <b>Create API Key</b>, give it a name and copy it (it starts with <code>gsk_</code>). It is only shown once.</li>',
    '<li>Pégala aquí y <b>Guardar</b>. Después toca <b>Ver los suyos</b> para que la lista de modelos se llene con los que tengas de verdad.</li>':
      '<li>Paste it here and press <b>Save</b>. Then tap <b>See theirs</b> so the model list fills up with the ones you actually have.</li>',
    '<li>La capa gratuita da de sobra para esta app. El límite exacto lo ves en tu propia consola: lo cambian cada poco y no me lo invento aquí.</li>':
      '<li>The free tier is plenty for this app. The exact limit is in your own console: they change it often and I am not going to invent it here.</li>',
    '<li>Entra en <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">openrouter.ai/keys</a> y crea una cuenta.</li>':
      '<li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">openrouter.ai/keys</a> and create an account.</li>',
    '<li>Pulsa <b>Create Key</b> y cópiala (empieza por <code>sk-or-v1-</code>).</li>':
      '<li>Press <b>Create Key</b> and copy it (it starts with <code>sk-or-v1-</code>).</li>',
    '<li>Pégala aquí y <b>Guardar</b>. En la lista de modelos salen primero los que acaban en <b>:free</b>: esos no cuestan nada y no hace falta meter saldo.</li>':
      '<li>Paste it here and press <b>Save</b>. The models ending in <b>:free</b> come first in the list: those cost nothing and need no credit.</li>',
    '<li>Si algún día quieres uno de pago —Claude, Gemini, GPT— metes saldo y lo eliges de la misma lista, con la misma clave.</li>':
      '<li>If one day you want a paid one — Claude, Gemini, GPT — you add credit and pick it from the same list, with the same key.</li>',
    '<li>Entra en <a href="https://console.mistral.ai/api-keys" target="_blank" rel="noopener noreferrer">console.mistral.ai</a> y crea una cuenta.</li>':
      '<li>Go to <a href="https://console.mistral.ai/api-keys" target="_blank" rel="noopener noreferrer">console.mistral.ai</a> and create an account.</li>',
    '<li>Crea una clave en <b>API Keys</b> y cópiala.</li>':
      '<li>Create a key under <b>API Keys</b> and copy it.</li>',
    '<li>Pégala aquí y <b>Guardar</b>, y toca <b>Ver los suyos</b> para la lista de modelos.</li>':
      '<li>Paste it here and press <b>Save</b>, then tap <b>See theirs</b> for the model list.</li>',
    '<li>Tiene capa gratuita; si la agotas, te lo dirá al llamar.</li>':
      '<li>It has a free tier; if you use it up, it will tell you on the next call.</li>',
    '<li>Entra en <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com/apikey</a> con tu cuenta de Google.</li>':
      '<li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com/apikey</a> with your Google account.</li>',
    '<li>Pulsa <b>Create API key</b>. Si pide proyecto, deja el que propone.</li>':
      '<li>Press <b>Create API key</b>. If it asks for a project, keep the one it suggests.</li>',
    '<li>Copia la clave (empieza por <code>AIza</code>), pégala aquí y <b>Guardar</b>.</li>':
      '<li>Copy the key (it starts with <code>AIza</code>), paste it here and press <b>Save</b>.</li>',
    '<li>Es gratis dentro del límite diario, que sobra para uso personal. Al superarlo la app avisa y el resto sigue funcionando.</li>':
      '<li>It is free within the daily limit, which is plenty for personal use. If you go over, the app tells you and everything else keeps working.</li>',
    '<li>Entra en <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com</a> y crea una cuenta.</li>':
      '<li>Go to <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com</a> and create an account.</li>',
    '<li>Mete saldo en <b>Billing</b>: se paga por uso y no hay capa gratuita. Si tienes Claude Pro, <b>no vale aquí</b>: la suscripción y la API se facturan por separado.</li>':
      '<li>Add credit under <b>Billing</b>: it is pay-as-you-go and there is no free tier. If you have Claude Pro, <b>it does not count here</b>: the subscription and the API are billed separately.</li>',
    '<li>En <b>API Keys</b> pulsa <b>Create Key</b> y copia la clave (empieza por <code>sk-ant-</code>). Solo se enseña una vez.</li>':
      '<li>Under <b>API Keys</b> press <b>Create Key</b> and copy the key (it starts with <code>sk-ant-</code>). It is only shown once.</li>',
    '<li>Pégala aquí y <b>Guardar</b>. Con lo que hace esta app, unos pocos euros duran meses.</li>':
      '<li>Paste it here and press <b>Save</b>. With what this app does, a few euros last months.</li>',
    '<li>Entra en <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer">platform.deepseek.com</a> y crea una cuenta.</li>':
      '<li>Go to <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer">platform.deepseek.com</a> and create an account.</li>',
    '<li>Mete saldo: se paga por uso y es de lo más barato que hay.</li>':
      '<li>Add credit: it is pay-as-you-go and about the cheapest there is.</li>',
    '<li>En <b>API keys</b> crea una y cópiala (empieza por <code>sk-</code>).</li>':
      '<li>Under <b>API keys</b> create one and copy it (it starts with <code>sk-</code>).</li>',
    '<li>Pégala aquí y <b>Guardar</b>. Ojo: no lee fotos, así que deja Gemini o Anthropic puestos si usas el cálculo de comida por foto.</li>':
      '<li>Paste it here and press <b>Save</b>. Careful: it does not read photos, so keep Gemini or Anthropic set up if you use food-from-photo.',
    '<li>Entra en <a href="https://console.x.ai" target="_blank" rel="noopener noreferrer">console.x.ai</a> y crea una cuenta.</li>':
      '<li>Go to <a href="https://console.x.ai" target="_blank" rel="noopener noreferrer">console.x.ai</a> and create an account.</li>',
    '<li>Mete saldo en <b>Billing</b> y crea una clave en <b>API Keys</b> (empieza por <code>xai-</code>).</li>':
      '<li>Add credit under <b>Billing</b> and create a key under <b>API Keys</b> (it starts with <code>xai-</code>).</li>',
    '<li>Pégala aquí y <b>Guardar</b>.</li>':
      '<li>Paste it here and press <b>Save</b>.</li>',
    '<li>Los nombres de sus modelos cambian a menudo. Si da error de modelo, mira cuál tienes disponible en tu consola y escríbelo en el campo de abajo.</li>':
      '<li>Their model names change often. If you get a model error, check which one you have available in your console and type it in the field below.</li>',
    '<li>Entra en <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer">developer.spotify.com/dashboard</a> con tu cuenta de Spotify y acepta las condiciones de desarrollador.</li>':
      '<li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer">developer.spotify.com/dashboard</a> with your Spotify account and accept the developer terms.</li>',
    '<li>Pulsa <b>Create app</b>. En nombre y descripción pon lo que quieras, por ejemplo <i>Training FR</i>.</li>':
      '<li>Press <b>Create app</b>. Put whatever you like in the name and description, for example <i>Training FR</i>.</li>',
    '<li>En <b>Redirect URIs</b> pega la dirección de retorno de arriba, tal cual, y pulsa <b>Add</b>. Tiene que coincidir carácter por carácter.</li>':
      '<li>Under <b>Redirect URIs</b> paste the redirect URI from above, exactly as it is, and press <b>Add</b>. It has to match character for character.</li>',
    '<li>Marca la casilla <b>Web API</b> y guarda.</li>':
      '<li>Tick the <b>Web API</b> box and save.</li>',
    '<li>Abre la app recién creada, ve a <b>Settings</b> y copia el <b>Client ID</b>. El <i>Client Secret</i> no hace falta: esta app usa PKCE, que no necesita secretos.</li>':
      '<li>Open the app you just created, go to <b>Settings</b> and copy the <b>Client ID</b>. The <i>Client Secret</i> is not needed: this app uses PKCE, which needs no secrets.</li>',
    '<li>Pégalo aquí, pulsa <b>Guardar</b> y luego <b>Conectar</b> para autorizar tu cuenta.</li>':
      '<li>Paste it here, press <b>Save</b> and then <b>Connect</b> to authorise your account.</li>',
    '<li>Al publicar la app en internet, vuelve al panel y añade también la dirección definitiva en <b>Redirect URIs</b>.</li>':
      '<li>When you publish the app online, go back to the dashboard and add the final address under <b>Redirect URIs</b> too.</li>',

    /* ---------- las notas de cada proveedor de IA ---------- */
    'Capa gratuita generosa y sin tarjeta, y lee fotos. Es el que trae la app de serie y el que recomiendo si no quieres pagar nada. El límite que te toca lo ves en tu consola de AI Studio.':
      'A generous free tier with no card, and it reads photos. It is what the app ships with and what I recommend if you do not want to pay anything. Your particular limit is in your AI Studio console.',
    'Capa gratuita sin tarjeta y muy rápido: corre modelos abiertos (Llama, Qwen, GPT-OSS). Ojo, los de texto no leen fotos. El límite que te toca lo ves en tu consola.':
      'A free tier with no card and very fast: it runs open models (Llama, Qwen, GPT-OSS). Careful, the text ones do not read photos. Your particular limit is in your console.',
    'De pago por uso y de lo más barato que hay. No lee fotos: para el cálculo de la comida por foto hace falta otro.':
      'Pay-as-you-go and about the cheapest there is. It does not read photos: working out food from a photo needs another one.',
    'De pago por uso.': 'Pay-as-you-go.',
    'De pago por uso: tu suscripción de Claude Pro no sirve aquí, la API se factura aparte. Es el que mejor sigue instrucciones largas, que es lo que más hace esta app. Opus es el bueno; Haiku, el barato.':
      'Pay-as-you-go: your Claude Pro subscription does not count here, the API is billed separately. It is the best at following long instructions, which is most of what this app does. Opus is the good one; Haiku, the cheap one.',
    'Tiene capa gratuita. Europeo, por si te importa dónde acaban tus datos.':
      'It has a free tier. European, in case you care where your data ends up.',
    'Una sola clave para casi todos los modelos que existen. Los que acaban en «:free» no cuestan nada; el resto se paga por uso con saldo.':
      'One key for nearly every model there is. The ones ending in “:free” cost nothing; the rest are pay-as-you-go from your credit.',

    /* ---------- pistas de las claves ---------- */
    'sin guardar': 'not saved',
    'sin prefijo fijo': 'no fixed prefix',

    /* ---------- Mi cuenta ---------- */
    'IA, Spotify y sincronización': 'AI, Spotify and sync',
    'Se hace una vez': 'You do this once',
    'Entra con tu correo y tus rutinas, tu historial y tus marcas estarán en todos tus dispositivos. Sin contraseñas: recibes un enlace y ya está.':
      'Sign in with your email and your routines, history and records will be on every device. No passwords: you get a link and that is it.',
    '¿Por dónde empezamos?': 'Where do we start?',
    'Ya tengo cuenta': 'I already have an account',
    'Uso la app en otro dispositivo. Conecto este y listo.':
      'I use the app on another device. I connect this one and I am done.',
    'Es mi primera vez': 'This is my first time',
    'Creo la base de datos gratuita. Una vez, cinco minutos.':
      'I create the free database. Once, five minutes.',
    'Entrar': 'Sign in',
    'Crear cuenta': 'Create account',
    'CORREO': 'EMAIL',
    'CONTRASEÑA': 'PASSWORD',
    'Al menos 8 caracteres': 'At least 8 characters',
    'Tu contraseña': 'Your password',
    'Crear cuenta y sincronizar': 'Create account and sync',
    'Usa el mismo correo y contraseña en tus demás dispositivos y tendrás lo mismo en todos.':
      'Use the same email and password on your other devices and you will have the same everywhere.',
    'Si es tu primera vez, pulsa Crear cuenta.':
      'If this is your first time, press Create account.',
    'Prefiero entrar con un enlace al correo':
      'I would rather sign in with an emailed link',
    'Sin contraseña: te llega un enlace y entras al pulsarlo. El correo que trae Supabase de serie solo permite {limite}, así que si lo agotas tendrás que esperar.':
      'No password: a link arrives and you are in when you tap it. The email Supabase ships with only allows {limite}, so if you use them up you will have to wait.',
    'dos mensajes por hora': 'two messages an hour',
    'Enviarme el enlace': 'Send me the link',
    'Si el enlace se abre en otro navegador en vez de en la app, cópialo del correo y pégalo aquí.':
      'If the link opens in another browser instead of the app, copy it from the email and paste it here.',
    'Pega el enlace del correo': 'Paste the link from the email',
    'Entrar con ese enlace': 'Sign in with that link',
    'Cambiar la configuración de Supabase': 'Change the Supabase setup',
    'Cómo funciona': 'How it works',
    'Escribes tu correo y tu contraseña, los mismos en todos tus dispositivos.':
      'You type your email and password, the same on every device.',
    'Al entrar se descarga lo que tengas en la nube y se une con lo de aquí.':
      'When you sign in, whatever you have in the cloud comes down and joins what is here.',
    'A partir de ahí, cada cambio sube solo unos segundos después.':
      'From then on, every change goes up by itself a few seconds later.',
    'Si prefieres entrar sin contraseña, tienes la opción del enlace por correo debajo.':
      'If you would rather sign in without a password, the emailed-link option is below.',
    'Aquí no se pueden crear cuentas nuevas': 'New accounts cannot be created here',
    'Tu proyecto de Supabase tiene cerrada el alta. Ábrela un momento en Authentication → Sign In / Providers → Allow new users to sign up, regístrate, y vuelve a cerrarla.':
      'Your Supabase project has sign-ups closed. Open it for a moment under Authentication → Sign In / Providers → Allow new users to sign up, register, then close it again.',
    'La conexión que trae la app es la mía y está cerrada a propósito: si ya tienes cuenta, entra con tu correo aquí abajo. Si no la tienes, monta la tuya —es gratis, son diez minutos y los datos quedan en tu propia base de datos, no en la mía.':
      'The connection the app ships with is mine and it is closed on purpose: if you already have an account, sign in with your email below. If you do not, set up your own — it is free, it takes ten minutes and your data stays in your own database, not mine.',
    'Montar mi base de datos': 'Set up my database',

    /* ---------- cabecera de Mi cuenta ---------- */
    'Entra con tu correo y la app queda igual en todos tus dispositivos: rutinas, historial, perfil, objetivos, alertas y ajustes.':
      'Sign in with your email and the app looks the same on every device: routines, history, profile, goals, reminders and settings.',

    /* ---------- Alertas: el calendario ---------- */
    'Los generaste con un plazo y ese plazo termina. Vuelve a descargarlo y siguen sonando desde donde estaban.':
      'You set an end date when you made them, and it\'s running out. Download it again and they carry on from where they were.',
    'Has cambiado recordatorios desde la última descarga. El calendario sigue avisando con lo de antes hasta que vuelvas a bajarlo.':
      'You\'ve changed reminders since the last download. Your calendar keeps using the old ones until you download it again.',
    'Volver a descargar': 'Download again',
    'Descargar para el calendario': 'Download for your calendar',
    'Se crean como eventos semanales con aviso, llamados {nombre}, y tocando uno se abre la app en la pantalla que toca. Antes de bajarlo eliges hasta cuándo quieres que suenen. Al volver a descargarlo, los que ya tengas se actualizan en vez de duplicarse.':
      'They go in as weekly events with an alert, named {nombre}, and tapping one opens the app on the right screen. Before you download it you choose how long they should keep ringing. Download it again and the ones you already have are updated instead of duplicated.',
    'Mételos en un calendario aparte': 'Put them in a calendar of their own',
    'Crea antes un calendario llamado {nombre} en tu móvil y elígelo al importar. Así los apagas, los escondes o los borras todos de una vez, sin tocar el resto de tu agenda.':
      'Create a calendar called {nombre} on your phone first and pick it when you import. That way you can mute them, hide them or delete them all at once, without touching the rest of your schedule.',
    'Quitarlos del calendario': 'Remove them from your calendar',
    'Descarga un archivo que lo retira. Ábrelo igual que el otro: el calendario borra el aviso que le pusiste desde aquí, aunque ya le cambiaras la hora.':
      'Downloads a file that takes it out. Open it like the other one: your calendar deletes the alert you put there from here, even if you changed its time afterwards.',
    'Descarga un archivo que los retira. Ábrelo igual que el otro: el calendario borra los {n} avisos que le pusiste desde aquí, incluidos los de horas que ya cambiaste.':
      'Downloads a file that takes them out. Open it like the other one: your calendar deletes the {n} alerts you put there from here, including the ones whose time you already changed.',

    /* ---------- Alertas: la hoja de los avisos ---------- */
    'Los avisos': 'Notifications',
    'Activados': 'On',
    'Sin activar': 'Not turned on',
    'El último salió {cuando}.': 'The last one went out {cuando}.',
    'Todavía no ha salido ninguno.': 'None have gone out yet.',
    'Ahora mismo no va a sonar nada. Cierra esto y mira la tarjeta de arriba: ahí están los pasos.':
      'Nothing is going to ring right now. Close this and look at the card above: the steps are there.',
    'Lanzar uno de prueba': 'Send a test one',
    'Qué funciona y qué no': 'What works and what doesn\'t',
    'Con la app abierta': 'With the app open',
    'Suenan a su hora, aunque la tengas en segundo plano.':
      'They ring on time, even with the app in the background.',
    'Con la app cerrada': 'With the app closed',
    'Una página web no ejecuta nada cerrada. Para eso está el calendario, abajo del todo.':
      'A web page runs nothing once it\'s closed. That\'s what the calendar at the bottom is for.',
    'En la pantalla de inicio': 'On the home screen',
    'Instalada, que es donde el iPhone permite los avisos.':
      'Installed, which is where the iPhone allows notifications.',
    'En el iPhone hacen falta desde la app instalada, no desde el navegador.':
      'On the iPhone they only work from the installed app, not from the browser.',
    'No hace falta instalarla en este dispositivo.':
      'You don\'t need to install it on this device.',
    '{n} recordatorio encendido.': '{n} reminder on.',
    '{n} recordatorios encendidos.': '{n} reminders on.',
    'No tienes ninguno encendido, así que no hay nada que pueda sonar.':
      'You don\'t have any turned on, so there\'s nothing that could ring.',
    'Recordatorio creado para tus días de entrenamiento':
      'Reminder created for your training days',

    /* ---------- Alertas: generarlas automáticamente ---------- */
    'Generar alertas automáticamente': 'Generate reminders automatically',
    'Con lo que ya hay en la app: tu peso, tus horas, tus rutinas y lo que tomas. Las horas salen calculadas, no son horas por defecto.':
      'From what\'s already in the app: your weight, your hours, your routines and what you take. The times are worked out, they aren\'t defaults.',
    'Agua': 'Water',
    'Los vasos que te tocan por tu peso, repartidos entre que te levantas y dos horas antes de dormir':
      'The glasses you need for your weight, spread between getting up and two hours before bed',
    'Comidas': 'Meals',
    'Una por cada comida que haces, con las calorías y la proteína que le tocan a cada una':
      'One for each meal you eat, with the calories and protein each one gets',
    'Los días que tienen rutina asignada, a la hora a la que entrenas de verdad':
      'The days with a routine assigned, at the time you actually train',
    'Los lunes al levantarte, en ayunas': 'Mondays when you get up, before eating',
    'Te falta el perfil': 'Your profile is missing',
    'Sin tu peso, tu altura y tus horas no puedo calcular ninguna. Complétalo y vuelve.':
      'Without your weight, your height and your hours I can\'t work any of them out. Fill it in and come back.',
    '{n} apuntado, agrupados por hora para no sonar tres veces seguidas':
      '{n} logged, grouped by time so it doesn\'t ring three times in a row',
    '{n} apuntados, agrupados por hora para no sonar tres veces seguidas':
      '{n} logged, grouped by time so it doesn\'t ring three times in a row',
    'No te duplica nada.': 'Nothing gets duplicated.',
    'Las que ya existen se actualizan con las horas nuevas.':
      'The ones that already exist are updated with the new times.',
    'Se retira {n} que la app creó y que ya no tiene sentido con tus datos de ahora.':
      '{n} that the app created and no longer fits your current data is removed.',
    'Se retiran {n} que creó la app y que ya no tienen sentido con tus datos de ahora.':
      '{n} that the app created and no longer fit your current data are removed.',
    'La que has creado tú no se toca, y si apagaste alguna sigue apagada.':
      'The one you made yourself isn\'t touched, and if you turned any off it stays off.',
    'Las {n} que has creado tú no se tocan, y si apagaste alguna sigue apagada.':
      'The {n} you made yourself aren\'t touched, and if you turned any off they stay off.',
    'Y si apagaste alguna, sigue apagada.': 'And if you turned any off, it stays off.',
    'Generarlas': 'Generate them',
    'Generar y poner al día': 'Generate and update',

    /* ---------- Alertas: hasta cuándo ---------- */
    '¿Hasta cuándo?': 'Until when?',
    'Los avisos se repiten cada semana. Dime hasta qué fecha los quieres en el calendario; puedes volver a descargarlo cuando quieras para estirarlos.':
      'The alerts repeat every week. Tell me how long you want them in your calendar; you can download it again whenever you like to stretch them out.',
    'Hasta el {fecha} de {ano}': 'Until {fecha}, {ano}',
    'Sin fecha de fin': 'No end date',
    'Descargar': 'Download',
    'Archivo descargado. Ábrelo para añadirlo al calendario.':
      'File downloaded. Open it to add it to your calendar.',
    'Se descarga un archivo que retira los avisos de Training FR de tu calendario. Ábrelo y acéptalo igual que el otro. Tus recordatorios de la app no se tocan.':
      'This downloads a file that takes the Training FR alerts out of your calendar. Open it and accept it like the other one. Your reminders in the app aren\'t touched.',
    'Archivo descargado. Ábrelo para retirarlos del calendario.':
      'File downloaded. Open it to take them out of your calendar.',
    'Un mes': 'One month',
    'Para probar cómo queda': 'To see how it looks',
    'Tres meses': 'Three months',
    'Un bloque de entrenamiento': 'One training block',
    'Seis meses': 'Six months',
    'Media temporada': 'Half a season',
    'Un año': 'One year',
    'Y renovar una vez al año': 'And renew once a year',
    'Sin límite': 'No limit',
    'Hasta que los quites tú. Ojo si dejas de usar la app':
      'Until you take them out yourself. Careful if you stop using the app',

    /* ---------- Alertas: crear y editar un recordatorio ---------- */
    'Editar recordatorio': 'Edit reminder',
    'Nuevo recordatorio': 'New reminder',
    'Así queda': 'How it looks',
    'Así va a quedar': 'How it will look',
    'QUÉ ES': 'WHAT IT IS',
    'QUÉ DICE': 'WHAT IT SAYS',
    'Título': 'Title',
    'Debajo': 'Below',
    'Opcional': 'Optional',
    'El texto lo escribe tu entrenador cada día con lo que llevas hecho, así que el de aquí arriba solo sale si la IA no está disponible a esa hora.':
      'Your coach writes the text each day from what you\'ve done, so the one above only shows up if the AI isn\'t available at that time.',
    'A QUÉ HORA': 'WHAT TIME',
    'Repartir varias veces al día': 'Spread it over the day',
    'Para el agua o las comidas: dime cuántas veces y entre qué horas, y las coloco repartidas.':
      'For water or meals: tell me how many times and between which hours, and I\'ll space them out.',
    'VECES': 'TIMES',
    'DESDE': 'FROM',
    'HASTA': 'TO',
    'Repartir': 'Spread them',
    'QUÉ DÍAS': 'WHICH DAYS',
    'Todos': 'All',
    'L-V': 'M-F',
    'Borrar recordatorio': 'Delete reminder',

    /* ---------- suelto ---------- */
    'Historial': 'History',

    /* ---------- Alertas: aviso de repetido ---------- */
    'Ya tienes «{titulo}» a esa hora. Si lo guardas, sonarán los dos.':
      'You already have «{titulo}» at that time. If you save this, both will ring.',

    /* ---------- Alertas: avisos de la pantalla ---------- */
    'Has bloqueado los avisos': 'You have blocked notifications',
    '«{que}» creado con {n} aviso': '«{que}» created with {n} alert',
    '«{que}» creado con {n} avisos': '«{que}» created with {n} alerts',
    '{n} recordatorio creado': '{n} reminder created',
    '{n} recordatorios creados': '{n} reminders created',
    'Antes asigna días a alguna rutina': 'Assign days to a routine first',
    'No hay nada que llevar al calendario': 'There is nothing to take to your calendar',
    'La hora de fin tiene que ser posterior': 'The end time has to be later',
    '{n} aviso repartido': '{n} alert spread out',
    '{n} avisos repartidos': '{n} alerts spread out',
    'Añade al menos una hora': 'Add at least one time',
    'Elige al menos un día': 'Pick at least one day',
    'Recordatorio guardado': 'Reminder saved',
    'Recordatorio borrado': 'Reminder deleted',

    /* ---------- Alertas: los mensajes de cada tipo ---------- */
    'Tu rutina de hoy te está esperando.': 'Today\'s routine is waiting for you.',
    'Un vaso de agua ahora.': 'A glass of water now.',
    'Un vaso de agua (250 ml).': 'A glass of water (250 ml).',
    'Toca comida según tu plan.': 'Time to eat, according to your plan.',
    'Registra tu peso para seguir la evolución.': 'Log your weight to keep track.',
    'Toca tu suplemento.': 'Time for your supplement.',
    'Hoy toca. Abre y dale.': 'Today\'s the day. Open up and go.',
    'Algo con hidratos y proteína, ligero.': 'Something light, with carbs and protein.',
    'En ayunas y después del baño, para que sea comparable.':
      'On an empty stomach and after the bathroom, so it compares.',
    'Pantallas fuera y a preparar la cama.': 'Screens off and get ready for bed.',

    /* ---------- Alertas: por qué te propongo cada una ---------- */
    'Te tocan {litros} L al día por tu peso y tu actividad: son {vasos} vasos de 250 ml repartidos entre las {desde} y las {hasta}. De una sentada no se bebe.':
      'You need {litros} L a day for your weight and activity: that comes to {vasos} glasses of 250 ml spread between {desde} and {hasta}. You can’t drink it in one go.',
    'A las {hora}, que es la hora que has puesto para {comida} en Ajustes':
      'At {hora}, which is the time you set for {comida} in Settings',
    '. Le tocan unas {kcal} kcal y {prot} g de proteína':
      '. It gets about {kcal} kcal and {prot} g of protein',
    '. Si tienes menú, el aviso trae el plato de ese día.':
      '. If you have a meal plan, the alert brings that day\'s dish.',
    'Tus rutinas tienen días asignados ({dias}) y ':
      'Your routines have days assigned ({dias}) and ',
    'la hora es la que has puesto en tu perfil.':
      'the time is the one you set in your profile.',
    'sueles entrenar sobre las {hora}, según tus últimas sesiones.':
      'you usually train around {hora}, going by your last sessions.',
    'de momento propongo las {hora}; cuando entrenes unas cuantas veces lo ajusto a tu hora real.':
      'for now I\'m suggesting {hora}; once you\'ve trained a few times I\'ll adjust it to your real time.',
    'Hora y media antes de tu entrenamiento: da tiempo a digerir y llegas con energía en vez de vacío.':
      'An hour and a half before you train: time enough to digest, so you turn up with energy instead of empty.',
    'Los lunes al levantarte. Pesarse siempre en las mismas condiciones es lo único que hace comparable la báscula de una semana a otra.':
      'Mondays when you get up. Weighing yourself in the same conditions every time is the only thing that makes the scale comparable week to week.',
    'Duermes {h} h y por debajo de 7 el entrenamiento rinde menos. Un aviso 45 min antes de acostarte es lo que más suele mover la aguja.':
      'You sleep {h} h, and under 7 your training suffers. An alert 45 min before bed is usually what moves the needle most.',

    /* ---------- Alertas: el texto que llega al móvil ---------- */
    '{nombre}, un momento': '{nombre}, one moment',
    'Unas {kcal} kcal y {prot} g de proteína':
      'About {kcal} kcal and {prot} g of protein',
    'Unas {kcal} kcal': 'About {kcal} kcal',
    ' (a ojo, sin menú)': ' (rough guess, no meal plan)',
    'Este navegador no sabe mostrar avisos.': 'This browser can\'t show notifications.',
    'Primero hay que dar permiso a los avisos.':
      'You have to allow notifications first.',
    'Prueba de Training FR': 'Training FR test',
    'Si ves esto, los avisos funcionan con la app abierta.':
      'If you can see this, notifications work with the app open.',
    'El sistema no ha dejado mostrarlo.': 'Your system wouldn\'t show it.',
    'Recordatorios creados por la app Training FR':
      'Reminders created by the Training FR app',
    'Unas {kcal} kcal y {prot} g de proteína. Lo que toca hoy, en la app.':
      'About {kcal} kcal and {prot} g of protein. Today\'s is in the app.',
    'Unas {kcal} kcal. Lo que toca hoy, en la app.':
      'About {kcal} kcal. Today\'s is in the app.',
    'Abrir en Training FR: {enlace}': 'Open in Training FR: {enlace}',
    '{n} avisos · de {desde} a {hasta} cada {cada}':
      '{n} alerts · from {desde} to {hasta} every {cada}'
  };
})(window);
