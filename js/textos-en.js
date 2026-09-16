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
    'Terminar entrenamiento': 'Finish workout',
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
    'Lo que comiste esta semana': 'What you ate this week'
  };
})(window);
