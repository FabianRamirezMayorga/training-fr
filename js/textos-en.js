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
      '{n} alerts · from {desde} to {hasta} every {cada}',

    /* ---------- Suplementos: el catálogo ---------- */
    'Creatina': 'Creatine',
    'Proteína en polvo': 'Protein powder',
    'Omega 3': 'Omega 3',
    'Multivitamínico': 'Multivitamin',
    'Vitamina D': 'Vitamin D',
    'Magnesio': 'Magnesium',
    'Pre-entreno': 'Pre-workout',
    'Colágeno': 'Collagen',
    'Aminoácidos': 'Amino acids',
    'Glutamina': 'Glutamine',
    'Zinc': 'Zinc',
    'Probiótico': 'Probiotic',
    'Añadir suplemento': 'Add a supplement',
    'Elige cuál y en el paso siguiente pones la dosis, cada cuánto y a qué hora.':
      'Pick which one, and on the next step you set the dose, how often and what time.',
    'El tuyo no está: lo escribes tú': 'Yours isn\'t here: write it yourself',

    /* ---------- Suplementos: la dosis y las unidades ---------- */
    'Cuánto tomas': 'How much you take',
    'En qué se mide': 'How it is measured',
    'Cápsulas': 'Capsules',
    'Comprimidos o pastillas': 'Tablets or pills',
    'Cazos o scoops': 'Scoops',
    'Gramos': 'Grams',
    'Mililitros': 'Millilitres',
    'Gotas': 'Drops',
    'Sobres': 'Sachets',
    'Tomas': 'Doses',
    'cápsula': 'capsule',
    'cápsulas': 'capsules',
    'comprimido': 'tablet',
    'comprimidos': 'tablets',
    'cazo': 'scoop',
    'cazos': 'scoops',
    'gota': 'drop',
    'gotas': 'drops',
    'sobre': 'sachet',
    'sobres': 'sachets',
    'toma': 'dose',
    'tomas': 'doses',
    'Elige la dosis': 'Pick the dose',

    /* ---------- Suplementos: cada cuánto y en qué momento ---------- */
    'Cada día': 'Daily',
    'Los siete': 'All seven',
    'Días que entreno': 'Training days',
    'Sale de los días de tu plan': 'Taken from the days in your plan',
    'Día sí, día no': 'Alternate days',
    'Empezando hoy': 'Starting today',
    'Un día/semana': 'One day/week',
    'El que elijas': 'Whichever you pick',
    'Varias al día': 'Several a day',
    'Repartido en el día': 'Spread over the day',
    'Con el desayuno': 'With breakfast',
    'Con el almuerzo': 'With lunch',
    'Con la merienda': 'With the afternoon snack',
    'Con la cena': 'With dinner',
    'A una hora puntual': 'At a set time',
    'Post-entreno': 'Post-workout',
    'Hora puntual': 'Set time',
    'A las {hora}': 'At {hora}',

    /* ---------- Suplementos: la ficha ---------- */
    'Nuevo suplemento': 'New supplement',
    'Nombre': 'Name',
    'CUÁNTO': 'HOW MUCH',
    'CADA CUÁNTO': 'HOW OFTEN',
    'EN QUÉ MOMENTO': 'WHEN',
    'Ponle nombre': 'Give it a name',
    'Quitarlo de la lista': 'Remove it from the list',
    'Quitar {que}': 'Remove {que}',
    'el suplemento': 'the supplement',
    'Se va de la lista, de las cuentas y de sus alertas. Si compartía hora con otro, esa alerta se queda con el que sigues tomando.':
      'It goes from the list, from the totals and from its reminders. If it shared a time with another one, that reminder stays with the one you still take.',
    '{que} quitado': '{que} removed',
    'Quitado': 'Removed',
    '{que} añadido': '{que} added',
    '{n} alerta lista': '{n} reminder ready',
    '{n} alertas listas': '{n} reminders ready',
    'No hay nada que recordar': 'There is nothing to remind you about',
    'No he podido calcularlo': 'I couldn\'t work it out',
    '¿A qué hora?': 'What time?',
    '¿A qué hora empiezas?': 'What time do you start?',
    'La que tú digas. Es el único momento que no depende de tus comidas ni de tu entreno.':
      'Whatever you say. It\'s the only slot that doesn\'t depend on your meals or your training.',
    'De ahí salen las demás, contando hacia delante y cortando en la cena.':
      'The rest follow from there, counting forwards and stopping at dinner.',

    /* ---------- Suplementos: cómo lo repartes ---------- */
    '¿Cómo lo repartes?': 'How do you spread it out?',
    'Tres maneras. Elige una y dentro verás las horas que salen con tus datos de ahora.':
      'Three ways. Pick one and inside you\'ll see the times that come out of your data right now.',
    'Cómo lo repartes': 'How you spread it out',
    'Elige cómo lo repartes': 'Pick how you spread it out',
    'Por reloj': 'By the clock',
    'Cada 4, 6, 8 o 12 horas': 'Every 4, 6, 8 or 12 hours',
    'Arrancan a la hora que elijas y se cortan en la cena: nadie quiere el magnesio a las tres de la mañana.':
      'They start at the time you pick and stop at dinner: nobody wants magnesium at three in the morning.',
    'Con tus comidas': 'With your meals',
    'Antes, con o después de cada una': 'Before, with or after each one',
    'Salen de tus horas de comer, así que si mueves una comida la toma se mueve con ella.':
      'They come from your meal times, so if you move a meal the dose moves with it.',
    'Pones tú cada hora, una a una': 'You set each time, one by one',
    'Para lo que no encaja en ningún patrón: lo que manda una receta, o los turnos de quien no come a las mismas horas.':
      'For anything that fits no pattern: what a prescription says, or shift work where you don\'t eat at the same times.',
    'Debajo de cada una van las horas que salen con tus datos de ahora.':
      'Under each one are the times that come out of your data right now.',
    'Pon tus horas': 'Set your times',
    'Gira la rueda, añade, y repite hasta tenerlas todas. Se crea una alerta por cada una.':
      'Spin the dial, add, and repeat until you have them all. One reminder is created for each.',
    'Añadir esta hora': 'Add this time',
    'Tus horas': 'Your times',
    'Todavía ninguna. Gira la rueda y añade la primera.':
      'None yet. Spin the dial and add the first one.',
    'Esa hora ya está': 'That time is already there',
    '{hora} añadida': '{hora} added',
    '{n} toma al día': '{n} dose a day',
    '{n} tomas al día': '{n} doses a day',

    /* ---------- Suplementos: lo que ve el entrenador ---------- */
    ' (sobre las {horas})': ' (around {horas})',
    ' [aporta ~{kcal} kcal y {prot} g de proteína al día]':
      ' [adds ~{kcal} kcal and {prot} g of protein a day]',

    /* ---------- Programa: el perfil y comparar ---------- */
    'Tu programa': 'Your program',
    'Construido con tu perfil: sexo, edad, nivel, objetivo y limitaciones. No es una plantilla con tu nombre encima.':
      'Built from your profile: sex, age, level, goal and limitations. It isn\'t a template with your name on it.',
    'Para que el plan sea tuyo de verdad y no una plantilla, necesito cuatro datos: sexo, edad, altura y peso. Con eso ajusto el volumen, las repeticiones, los descansos y el esfuerzo al que llegas.':
      'For the plan to really be yours and not a template, I need four things: sex, age, height and weight. With those I set the volume, the reps, the rest and how hard you go.',
    'Te llevo un minuto rellenarlo.': 'It\'ll take you a minute to fill in.',
    'O crear un plan genérico sin perfil': 'Or create a generic plan with no profile',
    'Principiante': 'Beginner',
    'Intermedio': 'Intermediate',
    'Avanzado': 'Advanced',
    'TU PERFIL': 'YOUR PROFILE',
    'Duerme {h} h': 'Sleeps {h} h',
    'De lo que has escrito en limitaciones he entendido: {lista}. Abajo verás qué se evita por eso.':
      'From what you wrote under limitations I understood: {lista}. Below you\'ll see what gets avoided because of it.',
    'Sin limitaciones apuntadas. Si tienes alguna molestia, escríbela en el perfil y el plan la esquiva.':
      'No limitations noted. If something bothers you, write it in your profile and the plan works around it.',
    'Necesitas al menos dos planes para comparar':
      'You need at least two plans to compare',
    'Cuál seguir': 'Which one to follow',
    'Los cuatro pueden pasar la revisión y no valer lo mismo: la revisión busca fallos, y no tener fallos no es lo mismo que ser el mejor. Estos son los números que los separan.':
      'All four can pass the review and still not be worth the same: the review looks for faults, and having no faults isn\'t the same as being the best. These are the numbers that tell them apart.',
    'Es el que yo seguiría': 'It\'s the one I\'d follow',
    'CÓMO QUEDAN': 'HOW THEY COMPARE',
    'Plan': 'Plan',
    'Nota': 'Score',
    'Días': 'Days',
    'Ejer.': 'Exer.',
    'Repartidos': 'Spread out',
    'Cortos': 'Short',
    '{a}: del día más corto al más largo. {b}: músculos que entrenas dos días o más a la semana, que rinden más que los de un solo día. {c}: músculos por debajo de ocho series semanales.':
      '{a}: from the shortest day to the longest. {b}: muscles you train two or more days a week, which do better than the ones trained on a single day. {c}: muscles under eight sets a week.',
    'SERIES POR MÚSCULO A LA SEMANA': 'SETS PER MUSCLE PER WEEK',
    'Músculo': 'Muscle',
    'El <b>x2</b> es en cuántos días distintos entrenas ese músculo. En rojo, lo que se queda por debajo de ocho series.':
      'The <b>x2</b> is how many different days you train that muscle. In red, anything under eight sets.',
    'Abrir «{que}»': 'Open «{que}»',

    /* ---------- Programa: mis planes ---------- */
    'Lo que ya tienes': 'What you already have',
    'Plan recién montado': 'Freshly built plan',
    '{n} sesión': '{n} session',
    '{n} sesiones': '{n} sessions',
    'montado con IA': 'built with AI',
    'montado con la calculadora': 'built by the calculator',
    'sin pasar a tus rutinas': 'not moved into your routines',
    '{n} ejercicio': '{n} exercise',
    'Comparar mis {n} planes': 'Compare my {n} plans',
    'Toca uno para abrirlo aquí: verás sus días y su reparto, podrás pedirle al entrenador que lo audite y aplicar lo que proponga sobre estas mismas rutinas.':
      'Tap one to open it here: you\'ll see its days and its split, you can have the coach audit it, and apply what it proposes to these same routines.',
    'Ese plan ya no está': 'That plan is gone',
    'Esa rutina ya no está': 'That routine is gone',

    /* ---------- Programa: el asistente ---------- */
    'Generar uno nuevo': 'Generate a new one',
    'Corregir mis datos': 'Fix my details',
    '{n} día': '{n} day',
    '{n} días': '{n} days',
    'DÓNDE VAS A ENTRENAR': 'WHERE YOU WILL TRAIN',
    'Solo vale para este plan; no cambia el catálogo del resto de la app.':
      'It only applies to this plan; it doesn\'t change the catalogue for the rest of the app.',
    'CUÁNTO DURA CADA SESIÓN': 'HOW LONG EACH SESSION LASTS',
    '¿PRIORIZAR ALGUNA ZONA?': 'PRIORITISE AN AREA?',
    '¿ALGO TE MOLESTA AHORA MISMO?': 'ANYTHING BOTHERING YOU RIGHT NOW?',
    'Ej. la rodilla al bajar, el hombro por encima de la cabeza':
      'E.g. my knee on the way down, my shoulder overhead',
    '¿ALGO MÁS QUE DEBA SABER?': 'ANYTHING ELSE I SHOULD KNOW?',
    'Ej. quiero mejorar en dominadas; odio las sentadillas; los viernes voy con prisa; tengo una carrera en dos meses':
      'E.g. I want to get better at pull-ups; I hate squats; Fridays I am in a rush; I have a race in two months',
    'Lo de arriba es contexto sobre ti; esto son órdenes. Lo que escribas aquí manda sobre lo demás, siempre que no sea un riesgo ni choque con tus limitaciones.':
      'What\'s above is context about you; this is orders. What you write here overrides the rest, as long as it isn\'t a risk and doesn\'t clash with your limitations.',
    'Ej. nada de peso muerto; empieza siempre por dominadas; que el viernes no pase de 40 minutos; mete abdomen todos los días':
      'E.g. no deadlifts; always start with pull-ups; keep Friday under 40 minutes; put abs in every day',
    'Tus datos': 'Your details',
    'Son los que usa el plan para el volumen, las repeticiones y el esfuerzo. Si algo no cuadra, corrígelo antes de generar.':
      'These are what the plan uses for volume, reps and effort. If something doesn\'t look right, fix it before generating.',
    '¿Cuándo puedes entrenar?': 'When can you train?',
    'Ponlo realista: es mejor un plan de tres días que cumples que uno de cinco que no.':
      'Be realistic: a three-day plan you stick to beats a five-day one you don\'t.',
    '¿Qué buscas?': 'What are you after?',
    '¿Algo que deba saber?': 'Anything I should know?',
    'Esto es opcional, pero es lo que separa un plan tuyo de uno genérico. Solo lo aprovecha la IA; la calculadora no lee texto.':
      'This is optional, but it\'s what separates a plan of your own from a generic one. Only the AI uses it; the calculator doesn\'t read text.',
    'La IA no ha podido montarlo': 'The AI couldn\'t build it',
    'Lo que ves abajo lo ha montado la calculadora, no la IA. Arregla lo de arriba y vuelve a darle a {boton}.':
      'What you see below was built by the calculator, not the AI. Fix what is above and press {boton} again.',
    'Generar rutina con IA': 'Generate a routine with AI',
    'Revisar mi proveedor de IA': 'Check my AI provider',
    'Montándote la semana entera con tus datos delante… esto tarda unos segundos.':
      'Building your whole week with your data in front of me… this takes a few seconds.',
    'Lee todo lo anterior más lo que levantas, lo que llevas abandonado y los días que cumples de verdad, y elige los ejercicios uno a uno del catálogo.':
      'It reads everything above plus what you lift, what you\'ve been neglecting and the days you actually turn up, and picks the exercises one by one from the catalogue.',
    'Necesita un proveedor de IA con su clave, en la bóveda de Ajustes.':
      'It needs an AI provider with its key, in the vault in Settings.',
    'Generar rutina automáticamente': 'Generate a routine automatically',
    'Sin IA y al momento: reparte patrones de movimiento según tu edad, tu nivel y tu objetivo. Cada vez que la pidas cambia algunos ejercicios, pero no lee lo que hayas escrito arriba.':
      'No AI and instant: it spreads movement patterns by your age, your level and your goal. Each time you ask it swaps some exercises, but it doesn\'t read what you wrote above.',
    'Elige al menos un día de entrenamiento': 'Pick at least one training day',
    'Seis días es el máximo recomendable': 'Six days is the most I would recommend',

    /* ---------- Programa: el resultado ---------- */
    'Plan sin guardar': 'Unsaved plan',
    'Viendo: {que}': 'Viewing: {que}',
    'Esfuerzo tope': 'Effort cap',
    'Por qué este plan': 'Why this plan',
    'Ojo: esto lo ha montado la calculadora porque la IA ha fallado. No es el plan que pediste.':
      'Careful: the calculator built this because the AI failed. It isn\'t the plan you asked for.',
    'Este es tu plan guardado, tal y como está ahora. Abajo puedes pedirle al entrenador que lo audite; lo que apliques se guarda sobre estas mismas rutinas.':
      'This is your saved plan, exactly as it stands. Below you can have the coach audit it; whatever you apply is saved to these same routines.',
    'Lo ha montado la IA leyendo todo lo que la app sabe de ti, y ha elegido cada ejercicio del catálogo. Abajo puedes pedirle además que se lo lea como auditor, que es otra cosa.':
      'The AI built it by reading everything the app knows about you, and picked each exercise from the catalogue. Below you can also ask it to read it back as an auditor, which is a different job.',
    'Esto lo calcula la app con tus datos, sin pedirle nada a nadie: por eso funciona sin conexión y sin clave. La lectura de un entrenador, que es otra cosa, está justo debajo.':
      'The app works this out from your data, asking nobody: that\'s why it works offline and with no key. A coach\'s read, which is a different thing, is right below.',
    'Lo que no le dejé poner': 'What I didn\'t let it put in',
    'Propuso esto y no entró, así que el hueco lo completé yo: {lista}.':
      'It proposed these and they didn\'t make it, so I filled the gap myself: {lista}.',
    '{que} (no lo tienes donde entrenas)': '{que} (you don\'t have it where you train)',
    '{que} (tus limitaciones)': '{que} (your limitations)',
    'Lo que evito por tus limitaciones': 'What I avoid because of your limitations',
    'Con una lesión diagnosticada, esto no sustituye a tu fisio: enséñale el plan antes de empezar.':
      'With a diagnosed injury this is no substitute for your physio: show them the plan before you start.',
    'De qué está hecha tu semana': 'What your week is made of',
    'Cómo se reparten las {series} del plan entre las zonas del cuerpo. Es la composición de lo que vas a hacer; si cumples o no con ello se ve en {donde}.':
      'How the plan\'s {series} are spread across the areas of your body. It\'s the make-up of what you\'re going to do; whether you stick to it shows up in {donde}.',
    'Todo el plan cae en una sola zona. Para una semana completa conviene repartir más.':
      'The whole plan lands on a single area. For a full week you want to spread it more.',
    'La cifra grande son series por semana; el porcentaje, qué parte del total se lleva esa zona.':
      'The big number is sets a week; the percentage is how much of the total that area takes.',
    'Plegar todo': 'Collapse all',
    'Abrir todo': 'Expand all',
    'sin ejercicios': 'no exercises',
    '{n}s de descanso': '{n}s rest',
    'Entrenar este día': 'Train this day',
    'Cómo progresar': 'How to progress',
    'Repetir el mismo peso cinco semanas no construye nada. Este es el bloque:':
      'Repeating the same weight for five weeks builds nothing. Here is the block:',
    'Fuera del gimnasio': 'Outside the gym',
    'CÓMO QUIERES LLAMARLAS': 'WHAT YOU WANT THEM CALLED',
    'Cada rutina se llamará «día · lo que pongas aquí». Déjalo vacío y uso el nombre de cada sesión.':
      'Each routine will be called «day · whatever you put here». Leave it empty and I\'ll use each session\'s name.',
    'Ej. Mi plan de otoño': 'E.g. My autumn plan',
    'Otra propuesta': 'Another suggestion',
    'Actualizar mis rutinas': 'Update my routines',
    'Guardar mis rutinas': 'Save my routines',
    'Este plan ya está en tus rutinas: se reescribe esa {n}, no se añaden otras. El resto de tus rutinas no se toca.':
      'This plan is already in your routines: that {n} gets rewritten, no others are added. The rest of your routines aren\'t touched.',
    'Este plan ya está en tus rutinas: se reescriben esas {n}, no se añaden otras. El resto de tus rutinas no se toca.':
      'This plan is already in your routines: those {n} get rewritten, no others are added. The rest of your routines aren\'t touched.',
    'Se crea {n} rutina con su día asignado. Lo que ya tengas no se borra.':
      '{n} routine is created with its day assigned. Nothing you already have is deleted.',
    'Se crean {n} rutinas con sus días asignados. Lo que ya tengas no se borra.':
      '{n} routines are created with their days assigned. Nothing you already have is deleted.',

    /* ---------- Programa: el entrenador con IA ---------- */
    'El entrenador está auditando tu programa…': 'The coach is auditing your program…',
    'Que un entrenador con IA audite tu plan': 'Have an AI coach audit your plan',
    'No viene a darte la razón: le pedimos que le ponga nota, que señale lo que falla y que proponga quitar, meter o cambiar ejercicios. Lo que diga se queda guardado y se aplica de un toque.':
      'It isn\'t here to agree with you: we ask it to score the plan, point out what\'s wrong and propose removing, adding or swapping exercises. What it says is saved and applied with one tap.',
    'Necesita un proveedor de IA con su clave, en la bóveda de Ajustes. Sin eso el plan funciona igual, pero esta lectura no.':
      'It needs an AI provider with its key, in the vault in Settings. Without it the plan works the same, but this read does not.',
    'Lo que dice el entrenador': 'What the coach says',
    'Sale de {n} fallo encontrado al repasar el plan y de lo graves que son. La calcula la app, no la IA: el mismo plan da siempre la misma nota.':
      'It comes from {n} fault found while going over the plan, and how serious it is. The app works it out, not the AI: the same plan always gets the same score.',
    'Sale de {n} fallos encontrados al repasar el plan y de lo graves que son. La calcula la app, no la IA: el mismo plan da siempre la misma nota.':
      'It comes from {n} faults found while going over the plan, and how serious they are. The app works it out, not the AI: the same plan always gets the same score.',
    'Nota de este plan tal y como está ahora.':
      'Score for this plan exactly as it stands.',
    'De comida': 'On food',
    'No propone tocar ningún ejercicio': 'It proposes no exercise changes',
    'Sus avisos son sobre hábitos —registrar entrenamientos, apuntar la comida— o sobre el reparto general, no sobre qué ejercicio cambiar. El plan, como lista de ejercicios, le parece defendible.':
      'Its notes are about habits —logging workouts, writing down your food— or about the overall split, not about which exercise to change. As a list of exercises, it finds the plan defensible.',
    'Cambios que propone': 'Changes it proposes',
    'Sustituir': 'Swap',
    'Reordenar': 'Reorder',
    'Descanso': 'Rest',
    'Aplicar': 'Apply',
    'Cada cambio se comprueba antes de aplicarlo: si el ejercicio no existe, no cabe con tu material o choca con tus limitaciones, se descarta. Lo que apliques se guarda y viaja a tus rutinas al pulsar Guardar.':
      'Every change is checked before it\'s applied: if the exercise doesn\'t exist, doesn\'t fit your equipment or clashes with your limitations, it\'s dropped. Whatever you apply is saved and travels to your routines when you press Save.',
    'Ya aplicado': 'Already applied',
    'Estos cambios ya están en el plan de arriba. Se guardan con él; para que lleguen a tus rutinas pulsa {boton}.':
      'These changes are already in the plan above. They are saved with it; to get them into your routines press {boton}.',
    'Si solo haces una cosa': 'If you only do one thing',
    'Auditar otra vez': 'Audit again',
    'Este dictamen es el que ya se hizo para este plan: mientras no lo cambies, volver a pulsar enseña lo mismo en vez de inventarse otra cosa. En cuanto apliques un cambio, se rehace solo.':
      'This verdict is the one already made for this plan: until you change it, pressing again shows the same thing instead of making something up. As soon as you apply a change, it redoes itself.',
    'Se guarda para este plan. Si aplicas cambios, la próxima auditoría será nueva.':
      'It is saved for this plan. If you apply changes, the next audit will be a fresh one.',
    'Pedir otra redacción': 'Ask for another wording',
    'Los fallos serán los mismos —son cuentas sobre el plan—; lo que cambia es cómo están explicados. Gasta una llamada a la IA.':
      'The faults will be the same —they are sums about the plan—; what changes is how they are explained. It costs one AI call.',
    ' en {donde}': ' in {donde}',
    'Los básicos delante en {que}': 'The basics first in {que}',
    '{que} al {n}.º': '{que} to position {n}',
    '{que} a {n}s de descanso': '{que} to {n}s rest',
    '{que} a {n} series': '{que} to {n} sets',
    '{nuevo} en lugar de {viejo}': '{nuevo} instead of {viejo}',
    'Ese día ya no está en el plan.': 'That day is no longer in the plan.',
    '{que}: reordenada, los básicos delante': '{que}: reordered, basics first',
    'Ya no está «{que}» en el plan.': '«{que}» is no longer in the plan.',
    '{que}: pasa al {n}.º en {donde}': '{que}: moves to position {n} in {donde}',
    'Ese cambio no dice cuánto descanso poner.':
      'That change doesn\'t say how much rest to set.',
    '{que}: descanso a {n}s': '{que}: rest set to {n}s',
    'Ese cambio no dice cuántas series poner.':
      'That change doesn\'t say how many sets to set.',
    '{que}: {n} series': '{que}: {n} sets',
    'Ese día se quedaría en un ejercicio. No lo quito.':
      'That day would be left with one exercise. I\'m not removing it.',
    '{que}: fuera de {donde}': '{que}: out of {donde}',
    'No encuentro «{que}» en el catálogo. Cambio descartado.':
      'I can\'t find «{que}» in the catalogue. Change dropped.',
    '«{que}» no encaja con tus limitaciones. Cambio descartado.':
      '«{que}» does not fit your limitations. Change dropped.',
    '«{que}» ya está en ese día.': '«{que}» is already on that day.',
    'Lo mete el entrenador: {porque}': 'The coach put it in: {porque}',
    '{que}: entra en {donde}': '{que}: goes into {donde}',
    'Pedía «{pedido}», que no está en el catálogo. He puesto {puesto}.':
      'It asked for «{pedido}», which is not in the catalogue. I put in {puesto}.',
    'Cambiado a propuesta del entrenador: {porque}':
      'Changed at the coach’s suggestion: {porque}',
    'Cerrar sin guardar': 'Close without saving',
    'Este plan no está en tus rutinas. Si lo cierras, se pierde.':
      'This plan is not in your routines. If you close it, it is lost.',
    'Cerrar igual': 'Close anyway',
    'Descartar lo generado': 'Discard what was generated',
    'El plan que hay en pantalla no está en tus rutinas. Si cancelas, se pierde.':
      'The plan on screen is not in your routines. If you cancel, it is lost.',
    'Empezar uno nuevo': 'Start a new one',
    'El plan que tienes en pantalla no está en tus rutinas todavía. Si sigues, se pierde.':
      'The plan on screen is not in your routines yet. If you go on, it is lost.',
    'Empezar de cero': 'Start from scratch',
    '{n} rutina actualizada': '{n} routine updated',
    '{n} rutinas actualizadas': '{n} routines updated',
    '{n} rutina creada con su día': '{n} routine created with its day',
    '{n} rutinas creadas con sus días': '{n} routines created with their days',
    'Ya tienes un plan llamado «{que}»': 'You already have a plan called «{que}»',
    'Tiene {n} rutina. Voy a reescribirla con este plan y a borrar las que sobren, para que no se te dupliquen. Si quieres conservarlo, cancela y ponle otro nombre a este.':
      'It has {n} routine. I\'m going to rewrite it with this plan and delete any left over, so you don\'t end up with duplicates. If you want to keep it, cancel and give this one another name.',
    'Tiene {n} rutinas. Voy a reescribirlas con este plan y a borrar las que sobren, para que no se te dupliquen. Si quieres conservarlo, cancela y ponle otro nombre a este.':
      'It has {n} routines. I\'m going to rewrite them with this plan and delete any left over, so you don\'t end up with duplicates. If you want to keep it, cancel and give this one another name.',
    'Reescribir': 'Rewrite',
    'Descartar la lectura': 'Discard the read',
    'Se borra lo que dijo el entrenador y la lista de cambios que quedan sin aplicar. Los que ya aplicaste siguen en el plan.':
      'What the coach said and the list of changes still unapplied are deleted. The ones you already applied stay in the plan.',
    'La IA no devolvió un plan aprovechable. Te dejo el de la calculadora.':
      'The AI didn\'t return a usable plan. I\'m leaving you the calculator\'s.',
    'Plan listo, pero solo salieron {salieron} de los {pedidos} días. Prueba a generarlo otra vez.':
      'Plan ready, but only {salieron} of the {pedidos} days came out. Try generating it again.',
    'Plan listo. Descarté {n} ejercicio que no encajaba y completé el hueco.':
      'Plan ready. I dropped {n} exercise that didn\'t fit and filled the gap.',
    'Plan listo. Descarté {n} ejercicios que no encajaban y completé el hueco.':
      'Plan ready. I dropped {n} exercises that didn\'t fit and filled the gaps.',
    'Plan montado a tu medida': 'Plan built to your measure',
    'Lo añade la app para completar el día.': 'The app adds it to round out the day.',
    'Sesión': 'Session',
    'Elige proveedor de IA y pon su clave': 'Pick an AI provider and enter its key',

    /* ---------- Programa: los objetivos ---------- */
    'Volumen alto y cargas medias, que es lo que más masa construye.':
      'High volume and medium loads, which is what builds the most mass.',
    'Perder grasa sin perder músculo': 'Lose fat without losing muscle',
    'Se mantiene la carga alta para conservar músculo y se acorta el descanso; la grasa la quita el déficit de calorías, no las mancuernas ligeras.':
      'The load stays high to keep muscle and the rest gets shorter; fat comes off through a calorie deficit, not light dumbbells.',
    'Tonificar y mantenerme': 'Tone up and maintain',
    'Recomposición: mismo trabajo de fuerza con algo más de repeticiones y algo de acondicionamiento.':
      'Recomposition: the same strength work with a few more reps and some conditioning.',
    'Levantar más peso': 'Lift heavier',
    'Pocas repeticiones, cargas altas y descansos largos en los básicos; el accesorio queda para el volumen.':
      'Few reps, heavy loads and long rests on the basics; the accessory work carries the volume.',

    /* ---------- Programa: edad, sexo y limitaciones ---------- */
    'Antes de los 18 la prioridad es la técnica, no la carga: se deja margen en cada serie y se sube peso solo cuando el movimiento sale limpio.':
      'Before 18 the priority is technique, not load: you leave room in every set and add weight only when the movement comes out clean.',
    'A partir de los 60 se recorta el volumen y se quita el impacto: la fuerza se mantiene igual de bien con menos series y más calidad.':
      'From 60 the volume is trimmed and impact is removed: strength holds up just as well with fewer sets and better quality.',
    'Dos de los ejercicios accesorios se pueden cambiar por trabajo de equilibrio y movilidad sin perder nada.':
      'Two of the accessory exercises can be swapped for balance and mobility work without losing anything.',
    'Pasados los 50 la recuperación tarda más: menos series por sesión, sin saltos y sin llevar las series al fallo.':
      'Past 50 recovery takes longer: fewer sets per session, no jumping and no taking sets to failure.',
    'A partir de los 40 conviene calentar más y dejar una repetición en recámara en los básicos pesados.':
      'From 40 it pays to warm up more and leave one rep in reserve on the heavy basics.',
    'Los descansos van algo más cortos y las repeticiones algo más altas: de media se recupera antes entre series con la misma carga relativa.':
      'Rests run a little shorter and reps a little higher: on average you recover faster between sets at the same relative load.',
    'Rodilla': 'Knee',
    'Sin saltos ni impacto, y la sentadilla en versión guiada o parcial. El trabajo de cadera (peso muerto, empuje de cadera) sí entra: no carga la rodilla.':
      'No jumping or impact, and squats in a guided or partial version. Hip work (deadlift, hip thrust) does go in: it doesn\'t load the knee.',
    'Hombro': 'Shoulder',
    'Fuera el remo al mentón y los fondos, que son los que más pinzan. El press por encima de la cabeza va con mancuernas, que dejan girar el hombro.':
      'Upright rows and dips are out, as they pinch the most. Overhead pressing goes with dumbbells, which let the shoulder rotate.',
    'Espalda baja': 'Lower back',
    'Nada de peso muerto ni remo con barra de pie: el mismo trabajo va con el pecho apoyado o en máquina, que quita la carga de la columna.':
      'No deadlifts or standing barbell rows: the same work goes chest-supported or on a machine, which takes the load off your spine.',
    'Codo': 'Elbow',
    'El tríceps y el bíceps van en polea o con mancuernas: la barra fija la muñeca y es justo lo que irrita el codo.':
      'Triceps and biceps go on a cable or with dumbbells: a bar locks the wrist, and that is exactly what irritates the elbow.',
    'Muñeca': 'Wrist',
    'Sin trabajo directo de muñeca. Donde se pueda, agarre neutro (mancuerna o barra Z) en vez de barra recta.':
      'No direct wrist work. Where possible, a neutral grip (dumbbell or EZ bar) instead of a straight bar.',
    'Cadera': 'Hip',
    'Sin impacto y sin rango profundo de cadera: mejor recorridos cortos y controlados que forzar la flexión.':
      'No impact and no deep hip range: short, controlled ranges beat forcing the flexion.',
    'Tobillo': 'Ankle',
    'Fuera el impacto. El gemelo se entrena sentado, que no carga el tendón igual.':
      'Impact is out. Calves are trained seated, which doesn\'t load the tendon the same way.',
    'Cuello': 'Neck',
    'Sin encogimientos ni cargas por detrás de la nuca.':
      'No shrugs and nothing loaded behind the neck.',
    'Corazón o tensión': 'Heart or blood pressure',
    'Nada de series al fallo ni de aguantar la respiración: se para con margen y se respira en cada repetición. Con esto conviene que lo vea tu médico.':
      'No sets to failure and no holding your breath: you stop with room to spare and breathe on every rep. With this, your doctor should take a look.',

    /* ---------- Programa: las plantillas de sesión ---------- */
    'Cuerpo completo A': 'Full body A',
    'Cuerpo completo B': 'Full body B',
    'Cuerpo completo C': 'Full body C',
    'Tren superior': 'Upper body',
    'Tren inferior': 'Lower body',
    'Tren superior (volumen)': 'Upper body (volume)',
    'Tren inferior (volumen)': 'Lower body (volume)',
    'Empuje': 'Push',
    'Tracción': 'Pull',
    'Pierna': 'Legs',
    'Entra para que el día no se quede corto con el material que tienes.':
      'It goes in so the day is not short with the equipment you have.',
    'Aguanta la posición: las repeticiones son segundos.':
      'Hold the position: the reps are seconds.',
    'Es el ejercicio fuerte del día: haz dos series de aproximación con poco peso antes de la primera seria.':
      'This is the big lift of the day: do two light warm-up sets before the first real one.',
    'Recorrido cómodo, sin bajar a donde molesta.':
      'Comfortable range, without going down to where it hurts.',

    /* ---------- Programa: los porqués ---------- */
    'Objetivo: {obj}. {resumen}': 'Goal: {obj}. {resumen}',
    'Nivel {nivel}: el plan apunta a unas {series} series semanales por músculo, que es donde está el mejor equilibrio entre estímulo y recuperación.':
      '{nivel} level: the plan aims for around {series} sets a week per muscle, which is where the balance between stimulus and recovery sits best.',
    '{dias} día a la semana con {unicas} sesiones distintas: así cada músculo recibe dos estímulos por semana, que rinde más que machacarlo una vez.':
      '{dias} day a week with {unicas} different sessions: that way each muscle gets two stimuli a week, which beats hammering it once.',
    '{dias} días a la semana con {unicas} sesiones distintas: así cada músculo recibe dos estímulos por semana, que rinde más que machacarlo una vez.':
      '{dias} days a week with {unicas} different sessions: that way each muscle gets two stimuli a week, which beats hammering it once.',
    '{edad} años: se recorta el volumen un {pct}% y se para en RPE {rpe}, dejando repeticiones en recámara.':
      '{edad} years old: the volume is cut by {pct}% and it stops at RPE {rpe}, leaving reps in reserve.',
    '{edad} años: volumen completo, sin recortes por edad.':
      '{edad} years old: full volume, no cuts for age.',
    'Con tu perfil salen {kcal} kcal y {prot} g de proteína al día: sin ese déficit y esa proteína, el gimnasio solo no baja la grasa.':
      'Your profile works out to {kcal} kcal and {prot} g of protein a day: without that deficit and that protein, the gym alone will not take the fat off.',
    'Para ganar músculo hacen falta {kcal} kcal y {prot} g de proteína al día: el estímulo lo pone el plan, el material lo pone la comida.':
      'To build muscle you need {kcal} kcal and {prot} g of protein a day: the plan supplies the stimulus, the food supplies the material.',
    'Duermes {h} h: por debajo de 7 la recuperación se resiente y el plan rinde menos de lo que puede. Es la palanca más barata que tienes.':
      'You sleep {h} h: under 7 your recovery suffers and the plan gives less than it could. It is the cheapest lever you have.',
    'En el último mes has entrenado {hechos} días por semana y este plan pide {pide}. O bajas los días y los cumples, o el plan se queda en papel: vale más un plan de tres días hecho que uno de cinco a medias.':
      'Over the last month you have trained {hechos} days a week and this plan asks for {pide}. Either you drop the days and stick to them, or the plan stays on paper: a three-day plan done beats a five-day one half done.',
    'Lo que vienes dejando de lado: {lista}. Ahí es donde este plan te va a cambiar algo.':
      'What you have been neglecting: {lista}. That is where this plan is going to change something for you.',
    '{mus} ({n} serie por semana, el plan te pide {pide})':
      '{mus} ({n} set a week, the plan asks you for {pide})',
    '{mus} ({n} series por semana, el plan te pide {pide})':
      '{mus} ({n} sets a week, the plan asks you for {pide})',
    'Todavía no tienes entrenamientos guardados, así que el plan sale solo de tu perfil. En cuanto entrenes unas semanas, este análisis mira lo que de verdad haces y deja de hablar en general.':
      'You have no saved workouts yet, so the plan comes from your profile alone. Once you have trained for a few weeks, this analysis looks at what you actually do and stops speaking in general terms.',
    'Con {dias} días de {min} min no da tiempo a todo: {lista} y alguno más se quedan por debajo de 8 series semanales. Si te importan, añade 15 min a la sesión, otro día, o priorízalos con el selector de zona.':
      'With {dias} days of {min} min there is not time for everything: {lista} and a few more stay under 8 sets a week. If they matter to you, add 15 min to the session, another day, or prioritise them with the area selector.',
    'Con {dias} días de {min} min no da tiempo a todo: {lista} se quedan por debajo de 8 series semanales. Si te importan, añade 15 min a la sesión, otro día, o priorízalos con el selector de zona.':
      'With {dias} days of {min} min there is not time for everything: {lista} stay under 8 sets a week. If they matter to you, add 15 min to the session, another day, or prioritise them with the area selector.',
    'Además del gimnasio: {pasos} pasos al día y dos sesiones de 25 a 35 min de cardio suave (el que te deje hablar) en los días que no entrenes. El cardio duro y el gimnasio el mismo día se pisan.':
      'On top of the gym: {pasos} steps a day and two 25-to-35-minute easy cardio sessions (the kind you can talk through) on the days you do not train. Hard cardio and the gym on the same day get in each other’s way.',

    /* ---------- Programa: la progresión ---------- */
    'Semana 1': 'Week 1',
    'Semana 2': 'Week 2',
    'Semana 3': 'Week 3',
    'Semana 4': 'Week 4',
    'Semana 5': 'Week 5',
    'Coge las cargas con las que completas todas las series con la técnica limpia, nunca al fallo. Apunta el peso de cada ejercicio.':
      'Take the loads that let you finish every set with clean technique, never to failure. Write down the weight for each exercise.',
    'Coge las cargas con las que completas todas las series con la técnica limpia, dejando 1 o 2 repeticiones en recámara. Apunta el peso de cada ejercicio.':
      'Take the loads that let you finish every set with clean technique, leaving 1 or 2 reps in reserve. Write down the weight for each exercise.',
    'Mismo peso, una repetición más por serie. Si todas las series llegan arriba del rango, sube peso en la siguiente.':
      'Same weight, one more rep per set. If every set reaches the top of the range, add weight next time.',
    'Sube entre un 2 y un 5% en los básicos, o añade una serie al ejercicio que mejor notes. Es la semana más dura del bloque.':
      'Add 2 to 5% on the basics, or add a set to the exercise that feels best. It is the hardest week of the block.',
    'Descarga: mismos ejercicios con la mitad de series y un 10% menos de peso. No es perder tiempo, es cuando el cuerpo consolida lo ganado.':
      'Deload: same exercises with half the sets and 10% less weight. It is not wasted time, it is when your body locks in what you gained.',
    'Vuelta a empezar con los pesos de la semana 3. Si ya no suben, cambia los accesorios y repite el bloque.':
      'Start again with the week 3 weights. If they stop going up, change the accessories and repeat the block.',

    /* ---------- Programa: priorizar una zona ---------- */
    'Equilibrado': 'Balanced',
    'Glúteo': 'Glutes',
    'Pecho': 'Chest',
    'Espalda': 'Back',
    'Brazo': 'Arms',
    'Core': 'Core',

    /* ---------- Objetivos: la pantalla ---------- */
    'Se actualizan solos con lo que entrenas y con tus pesajes. No hay que apuntar nada a mano.':
      'They update themselves from what you train and from your weigh-ins. Nothing to log by hand.',
    'Ponte una meta y te enseño cuánto te falta cada vez que abras la app.':
      'Set yourself a goal and I\'ll show you how far you have to go every time you open the app.',
    'Crear mi primer objetivo': 'Create my first goal',
    'de {meta}': 'of {meta}',
    'Cumplido': 'Done',
    ' (cumplido)': ' (done)',
    'Según tu plan': 'Going by your plan',
    'Si sigues así': 'If you keep this up',
    'Sale de tu plan —tu gasto, tus calorías y el ritmo que elegiste—, no de la báscula. Apunta tu peso una vez por semana y paso a medir lo que pasa de verdad.':
      'It comes from your plan —your expenditure, your calories and the pace you chose—, not from the scale. Log your weight once a week and I\'ll switch to measuring what actually happens.',
    'Es una recta sobre lo que llevas: cuenta con que los últimos kilos cuesten más que los primeros.':
      'It is a straight line drawn through what you have done so far: expect the last kilos to be harder than the first.',
    'Es una recta sobre lo que llevas: la fuerza sube a tirones, no a ritmo constante.':
      'It is a straight line drawn through what you have done so far: strength goes up in jumps, not at a steady pace.',
    'Es una recta sobre lo que llevas, contando con que sigas igual.':
      'It is a straight line drawn through what you have done so far, assuming you carry on the same.',
    'Tu evolución y lo que falta hasta {meta}':
      'Your progress and what is left to reach {meta}',
    'Se quitará de tu lista.': 'It will be removed from your list.',
    'Nuevo objetivo': 'New goal',
    'Elige qué quieres conseguir.': 'Pick what you want to achieve.',
    'EJERCICIO': 'EXERCISE',
    'META ({unidad})': 'TARGET ({unidad})',
    'Ahora mismo vas por {valor}.': 'Right now you are on {valor}.',
    'Crear objetivo': 'Create goal',
    'Escribe la meta': 'Write the target',
    'Objetivo creado': 'Goal created',

    /* ---------- Objetivos: los tipos y el pronóstico ---------- */
    'Llegar a un peso': 'Reach a weight',
    'Se actualiza con cada pesaje que registres': 'Updates with every weigh-in you log',
    'Entrenar por semana': 'Train per week',
    'Cuenta los entrenamientos de los últimos 7 días':
      'Counts the workouts from the last 7 days',
    'Mantener una racha': 'Keep a streak going',
    'Días seguidos entrenando': 'Days training in a row',
    'Volumen semanal': 'Weekly volume',
    'Peso por repeticiones de los últimos 7 días':
      'Weight times reps over the last 7 days',
    'Récord en un ejercicio': 'Record on an exercise',
    'Tu mejor serie en el ejercicio elegido': 'Your best set on the exercise you pick',
    'Entrenamientos totales': 'Total workouts',
    'Todos los entrenamientos registrados': 'Every workout you have logged',
    'sesiones': 'sessions',
    'kg movidos': 'kg moved',
    'Récord en {que}': 'Record on {que}',
    'un ejercicio': 'an exercise',
    'Ya la tienes': 'You already have it',
    'Entrenando cada día la tienes en {n} día':
      'Training every day you get there in {n} day',
    'Entrenando cada día la tienes en {n} días':
      'Training every day you get there in {n} days',
    'Aún no hay semanas que comparar': 'No weeks to compare yet',
    'Lo cumpliste {veces} de las últimas {de} semanas; promedias {media} por semana':
      'You hit it {veces} of the last {de} weeks; you average {media} a week',
    'Según tu plan: ritmo {ritmo}, {signo}{kg} kg por semana':
      'Going by your plan: {ritmo} pace, {signo}{kg} kg a week',
    'Con un solo dato no se puede estimar: apúntate alguno más':
      'With a single data point there is nothing to estimate: log a few more',
    'Llevas semanas parado en el mismo sitio: así no hay fecha que dar':
      'You have been stuck in the same place for weeks: there is no date to give',
    'A este ritmo te alejas {cuanto} por semana':
      'At this rate you are moving {cuanto} further away a week',
    'A este ritmo, {signo}{cuanto} por semana': 'At this rate, {signo}{cuanto} a week',
    '{n} semana': '{n} week',
    '{n} semanas': '{n} weeks',
    '{n} mes': '{n} month',
    '{n} meses': '{n} months',

    /* ---------- Alimentación: los menús guardados ---------- */
    'DE ANTES': 'OUT OF DATE',
    '{n} comida': '{n} meal',
    '{n} comidas': '{n} meals',
    'principal': 'main',
    'Marcar': 'Set as',
    'Renombrar': 'Rename',
    'Este menú es de antes': 'This meal plan is out of date',
    'Has cambiado algo desde que se hizo —los ingredientes, lo que le pides o tus números—, así que puede llevar cosas que ya no encajan. Rehazlo y se vuelve a montar con lo de ahora.':
      'Something has changed since it was made —the ingredients, what you ask of it, or your numbers—, so it may carry things that no longer fit. Redo it and it gets rebuilt with what you have now.',
    'Rehacer este menú': 'Redo this meal plan',
    'Dejar de ser el menú principal': 'Stop being the main meal plan',
    'Ahora manda este: es el que sale en «hoy» y en la portada.':
      'This one is in charge: it is the one that shows under «today» and on the home screen.',
    'Usar este como menú principal': 'Use this as the main meal plan',
    'Será el que salga en «hoy» y en la portada.':
      'It will be the one that shows under «today» and on the home screen.',
    'Cambiarle el nombre': 'Change its name',
    'Para saber cuál es sin abrirlo.':
      'So you know which one it is without opening it.',
    'Se monta otro con tus números y tus ingredientes de ahora.':
      'Another one is built with your current numbers and ingredients.',
    'Duplicar el menú': 'Duplicate the meal plan',
    'Una copia para probar cambios sin tocar este.':
      'A copy for trying changes without touching this one.',
    'Borrar el menú': 'Delete the meal plan',
    'No se puede deshacer.': 'It cannot be undone.',
    'Creado el {fecha}': 'Created on {fecha}',
    'ENTRENO': 'TRAINING',
    'Guardar otro distinto, sin tocar este':
      'Save a different one, without touching this',
    'Generado por IA a partir de tus datos. Revísalo con criterio y consulta a un dietista si tienes alguna condición de salud.':
      'Generated by AI from your data. Look it over with judgement and see a dietitian if you have any health condition.',
    'Ahora manda «{que}»': '«{que}» is in charge now',
    'Sin menú principal': 'No main meal plan',
    'Copiado como «{que}»': 'Copied as «{que}»',
    'Borrar «{que}»': 'Delete «{que}»',
    'Se quita de tus menús. No se puede deshacer.':
      'It goes from your meal plans. It cannot be undone.',
    'Menú borrado': 'Meal plan deleted',
    'Abre el menú que quieres rehacer': 'Open the meal plan you want to redo',
    'Rehaciendo el menú…': 'Redoing the meal plan…',
    '«{que}» rehecho': '«{que}» redone',
    'No se pudo rehacer el menú': 'The meal plan could not be redone',

    /* ---------- Alimentación: apuntar comida ---------- */
    '{kcal} kcal · {prot} g de proteína': '{kcal} kcal · {prot} g of protein',
    'estimación floja': 'rough estimate',
    'Esto necesita un proveedor de IA con su clave, en la bóveda de Ajustes.':
      'This needs an AI provider with its key, in the vault in Settings.',
    'No he visto comida en esa foto. Prueba con más luz o más cerca.':
      'I didn\'t see food in that photo. Try with more light or closer up.',
    'Anotado: {kcal} kcal y {prot} g de proteína':
      'Logged: {kcal} kcal and {prot} g of protein',
    ' (a ojo, retócalo si quieres)': ' (rough guess, tweak it if you like)',
    'No he podido leer esa foto.': 'I couldn\'t read that photo.',
    'Escribe lo que has comido y yo calculo las calorías y la proteína. Si ya te sabes los números, pónlos tú y mando los tuyos.':
      'Write what you ate and I work out the calories and the protein. If you already know the numbers, put them in and yours win.',
    'Para lo que ya sabes de memoria, o para arreglar una estimación que se quedó corta.':
      'For what you already know by heart, or to fix an estimate that fell short.',
    'QUÉ HAS COMIDO': 'WHAT YOU ATE',
    'Ej. arroz con lentejas y carne asada': 'E.g. rice with lentils and roast beef',
    'Calcular con IA': 'Work it out with AI',
    'CALORÍAS': 'CALORIES',
    'PROTEÍNA (g)': 'PROTEIN (g)',
    'Anotar': 'Log it',
    'Anotado': 'Logged',
    'Escribe antes qué has comido': 'Write what you ate first',
    'No he sabido qué es eso. Pon tú los números.':
      'I couldn\'t tell what that is. Put the numbers in yourself.',
    'Estimación: corrige los números si no te cuadra.':
      'Estimate: correct the numbers if they don\'t add up for you.',
    'Pon al menos las calorías o la proteína':
      'Put in at least the calories or the protein',
    'Escribe qué has comido': 'Write what you ate',

    /* ---------- Alimentación: un menú nuevo ---------- */
    'Dale una hora a cada comida': 'Give every meal a time',
    '{n} alerta movida': '{n} reminder moved',
    '{n} alertas movidas': '{n} reminders moved',
    'Completa tus datos para calcular el menú':
      'Fill in your details so I can work out the meal plan',
    'Dime de qué país eres: el menú sale de tu supermercado':
      'Tell me which country you are in: the meal plan comes from your supermarket',
    'Nuevo menú': 'New meal plan',
    'Primero lo tuyo, y después decides cómo se hace.':
      'Your side first, then you decide how it gets made.',
    'CÓMO SE LLAMA': 'WHAT IT IS CALLED',
    'Semana fuerte, Cuando viajo, Sin lactosa…':
      'Heavy week, When I travel, Dairy free…',
    'Hace falta para guardarlo. Dentro de un mes, «Mi menú 4» no te va a decir cuál es.':
      'It is needed to save it. A month from now, «My meal plan 4» will not tell you which one it is.',
    'CON QUÉ CUENTAS': 'WHAT YOU HAVE',
    'Ej. arroz, lentejas, huevos, pollo, atún, yogur griego, avena':
      'E.g. rice, lentils, eggs, chicken, tuna, Greek yoghurt, oats',
    'Se guarda con tus preferencias: vale también para los menús siguientes.':
      'It is saved with your preferences: it applies to the next meal plans too.',
    'QUÉ LE PIDES SIEMPRE': 'WHAT YOU ALWAYS ASK FOR',
    'Ej. nada de pescado; la cena siempre ligera': 'E.g. no fish; dinner always light',
    '¿TOMAS ALGUNA MEDICACIÓN?': 'DO YOU TAKE ANY MEDICATION?',
    'No tomo ninguna': 'I don\'t take any',
    'Sí, tomo': 'Yes, I do',
    'Cuál y a qué hora. Ej. levotiroxina en ayunas; metformina con la comida':
      'Which one and at what time. E.g. levothyroxine on an empty stomach; metformin with food',
    'Sirve para colocar las comidas y lo que tomas alrededor, y para avisarte de lo que se pisa. La app no receta ni cambia nada de tu tratamiento: para eso está tu médico. Se queda en tu móvil, no sale en tu perfil y viaja al entrenador con tu propia clave.':
      'It is used to place your meals and what you take around them, and to warn you about clashes. The app does not prescribe or change anything in your treatment: that is your doctor’s job. It stays on your phone, it does not appear in your profile, and it travels to the coach with your own key.',
    'Y PARA ESTE MENÚ EN CONCRETO': 'AND FOR THIS MEAL PLAN IN PARTICULAR',
    'Ej. esta semana viajo y como fuera; cocino solo los domingos':
      'E.g. this week I am travelling and eating out; I only cook on Sundays',
    'Esto no se guarda: vale solo para el menú que vas a crear ahora.':
      'This is not saved: it only applies to the meal plan you are about to create.',
    'Cómo lo hago': 'How I make it',
    'Crearlo con el entrenador': 'Create it with the coach',
    'Platos concretos con tus ingredientes, tus horarios y tus condiciones. Tarda unos segundos.':
      'Real dishes with your ingredients, your times and your conditions. It takes a few seconds.',
    'Crearlo con el entrenador (necesita configurarse)':
      'Create it with the coach (needs setting up)',
    'Crear uno genérico, sin IA': 'Create a generic one, no AI',
    'Reparte tus calorías y tu proteína entre tus comidas y dice qué debe llevar cada una. Los platos los pones tú.':
      'It splits your calories and protein across your meals and says what each one should have. You supply the dishes.',
    'Un día de ejemplo': 'A sample day',
    'Guardar este menú': 'Save this meal plan',
    'Volver y probar de otra forma': 'Go back and try another way',
    'Ponle un nombre antes de guardarlo': 'Give it a name before saving it',
    '«{que}» guardado': '«{que}» saved',
    'Dime si tomas medicación: cambia a qué hora conviene comer':
      'Tell me whether you take medication: it changes when it suits you to eat',
    'Escribe cuál y a qué hora': 'Write which one and at what time',
    'Preparando el menú…': 'Preparing the meal plan…',
    'Hecho por el entrenador': 'Made by the coach',
    'No se pudo crear el menú': 'The meal plan could not be created',
    'Genérico, con tus números': 'Generic, with your numbers',
    'Cambiar el nombre': 'Change the name',
    'Semana fuerte, Cuando viajo…': 'Heavy week, When I travel…',
    'Ponle un nombre': 'Give it a name',

    /* ---------- El entrenador con IA ---------- */
    'Entrenador': 'Coach',
    'Conoce tu perfil, tus rutinas y tu progreso. No está aquí para darte la razón: si algo lo estás haciendo mal, te lo dice.':
      'It knows your profile, your routines and your progress. It is not here to agree with you: if you are doing something wrong, it says so.',
    'Pregúntale lo que sea': 'Ask it anything',
    '¿Estoy entrenando bien el pecho? ¿Cómo bajo grasa sin perder fuerza?':
      'Am I training my chest well? How do I lose fat without losing strength?',
    'Preguntar': 'Ask',
    'Lo que puede hacer por ti': 'What it can do for you',
    'Cómo voy': 'How I am doing',
    'Lee tus últimos entrenamientos sin adornos y dice qué se sostiene y qué no.':
      'It reads your last workouts plainly and says what holds up and what does not.',
    'Audita mis rutinas': 'Audit my routines',
    'Les pone nota del uno al diez y dice exactamente qué falla.':
      'It scores them out of ten and says exactly what is wrong.',
    'Prepararme el menú': 'Prepare my meal plan',
    'Semanal, con tus calorías, tu dieta y lo que tienes en casa.':
      'Weekly, with your calories, your diet and what you have at home.',
    'Qué sabe de ti': 'What it knows about you',
    'Se manda en cada pregunta para que la respuesta sea tuya y no de cualquiera. Tu clave no sale de este dispositivo, y las fotos de comida se sueltan al terminar: no se guardan en ningún sitio.':
      'It is sent with every question so the answer is yours and not anyone’s. Your key never leaves this device, and food photos are released when done: they are not stored anywhere.',
    'Proveedor y clave': 'Provider and key',
    '¿Por dónde empiezo con mi nivel?': 'Where do I start at my level?',
    '¿Cuántos días a la semana me conviene entrenar?':
      'How many days a week should I train?',
    '¿Voy bien de volumen para mi objetivo?': 'Is my volume right for my goal?',
    '¿Qué músculo tengo más flojo?': 'Which muscle is my weakest?',
    '¿Mi plan encaja con «{que}»?': 'Does my plan fit «{que}»?',
    '¿Qué ejercicios debería evitar por mis lesiones?':
      'Which exercises should I avoid because of my injuries?',
    '¿Qué cambio por mis condiciones de salud?':
      'What do I change because of my health conditions?',
    '¿Cómo evito lesionarme?': 'How do I avoid getting injured?',
    'Tu perfil': 'Your profile',
    '{edad} años, {peso} kg, {altura} cm, objetivo {objetivo}':
      '{edad} years old, {peso} kg, {altura} cm, goal {objetivo}',
    ', y tus lesiones': ', and your injuries',
    ', y tus condiciones de salud': ', and your health conditions',
    'Sin completar. Si falta, no se lo inventa: lo dice.':
      'Not filled in. If something is missing, it does not make it up: it says so.',
    'Tus rutinas': 'Your routines',
    '{n} rutina con sus ejercicios, series y repeticiones':
      '{n} routine with its exercises, sets and reps',
    '{n} rutinas con sus ejercicios, series y repeticiones':
      '{n} routines with their exercises, sets and reps',
    'Ninguna guardada todavía': 'None saved yet',
    'Tu progreso': 'Your progress',
    '{n} entrenamiento, tus series por músculo y lo que llevas sin tocar':
      '{n} workout, your sets per muscle and what you have been neglecting',
    '{n} entrenamientos, tus series por músculo y lo que llevas sin tocar':
      '{n} workouts, your sets per muscle and what you have been neglecting',
    'Sin entrenamientos registrados; no opina de lo que no ve':
      'No workouts logged; it does not comment on what it cannot see',
    'Lo que comes': 'What you eat',
    'Lo apuntado hoy y tus calorías objetivo':
      'What you logged today and your target calories',
    'Tus calorías objetivo; hoy no has apuntado nada':
      'Your target calories; you have logged nothing today',
    'Analiza tu progreso, revisa tus rutinas y te prepara el plan de comidas. Funciona con el proveedor que elijas: Gemini tiene capa gratuita.':
      'It analyses your progress, reviews your routines and prepares your meal plan. It works with whichever provider you pick: Gemini has a free tier.',
    'Entra en {enlace} con tu cuenta de Google.':
      'Go to {enlace} with your Google account.',
    'Pulsa {boton} y copia la clave.': 'Press {boton} and copy the key.',
    'Pégala aquí abajo. Se guarda solo en este dispositivo.':
      'Paste it below. It is saved on this device only.',
    'Ir a la bóveda de claves': 'Go to the key vault',
    'Qué hace y qué no': 'What it does and what it does not',
    'Lee tus datos reales': 'It reads your real data',
    'Tu perfil, tus rutinas, tu progreso y lo que comes.':
      'Your profile, your routines, your progress and what you eat.',
    'Tu clave no sale de aquí': 'Your key never leaves here',
    'Se guarda en este dispositivo y no viaja con la sincronización salvo que lo actives.':
      'It is stored on this device and does not travel with sync unless you turn that on.',
    'No hace falta para lo demás': 'It is not needed for anything else',
    'Las calorías, las rutinas y el registro funcionan igual sin ella.':
      'Calories, routines and logging all work the same without it.',
    'La capa gratuita tiene un límite diario que sobra para uso personal. Si lo superas, la app te avisa y sigue funcionando.':
      'The free tier has a daily limit that is more than enough for personal use. If you go over it, the app tells you and keeps working.',
    'Van bien': 'They are fine',
    'Se sostienen, con peros': 'They hold up, with caveats',
    'Hay que tocarlas': 'They need work',
    'Nota que les pone a tus rutinas tal y como están.':
      'The score it gives your routines exactly as they stand.',
    'Escribe tu pregunta': 'Write your question',
    'Pensando…': 'Thinking…',
    'Revisando tus entrenamientos…': 'Going over your workouts…',
    'Auditando tus rutinas…': 'Auditing your routines…',
    'Lo que se sostiene': 'What holds up',
    'Lo que hay que arreglar': 'What needs fixing',
    'Esta semana': 'This week',

    /* ---------- Música: conectar Spotify ---------- */
    'Reproduce dentro de la app y deja que la IA te prepare listas distintas para cada entrenamiento.':
      'Play inside the app and let the AI put together a different playlist for every workout.',
    'Necesita el Client ID de una app de Spotify: se crea en un minuto y es gratis. Tienes el paso a paso en la bóveda.':
      'It needs the Client ID of a Spotify app: it takes a minute to create and it is free. The step by step is in the vault.',
    'Suena dentro de la app': 'It plays inside the app',
    'Sin salir a Spotify y sin perder el cronómetro de vista.':
      'Without leaving for Spotify and without losing sight of the timer.',
    'Listas a medida del entrenamiento': 'Playlists made for the workout',
    'La IA propone artistas distintos cada vez, así que descubres algo.':
      'The AI suggests different artists every time, so you discover something.',
    'Reproducir aquí pide Premium': 'Playing here needs Premium',
    'Es condición de Spotify, no de la app. Sin Premium puedes crear las listas y abrirlas en Spotify.':
      'That is Spotify’s rule, not the app’s. Without Premium you can still create the playlists and open them in Spotify.',
    'Un toque': 'One tap',
    'Conecta tu cuenta para reproducir aquí y generar listas.':
      'Connect your account to play here and generate playlists.',
    'Conectar Spotify': 'Connect Spotify',
    'Al pulsar te lleva a Spotify para dar permiso y vuelve aquí solo. Si vuelves sin conectar, aquí abajo aparecerá el motivo exacto.':
      'Pressing it takes you to Spotify to give permission and comes back here on its own. If you come back unconnected, the exact reason appears below.',
    'Vuelve a conectar': 'Connect again',
    'A la conexión con Spotify le faltan permisos, y por eso tus listas y el buscador dan error. Reconecta y acepta la pantalla de Spotify tal cual sale.':
      'The Spotify connection is missing permissions, and that is why your playlists and the search fail. Reconnect and accept the Spotify screen exactly as it comes.',
    'Hay funciones nuevas —tus listas de Spotify y el buscador— y Spotify pide permiso otra vez para eso. Es un toque y no pierdes nada.':
      'There are new features —your Spotify playlists and the search— and Spotify asks for permission again for them. It is one tap and you lose nothing.',
    'Falta: {lista}': 'Missing: {lista}',
    'Reconectar Spotify': 'Reconnect Spotify',
    'Spotify desconectado': 'Spotify disconnected',
    'La última conexión con Spotify falló': 'The last Spotify connection failed',
    'Esto lo ha rechazado Spotify. Comprueba en su panel que en {campo} está exactamente {url} y que tu cuenta figura en {gestion} si la app está en modo desarrollo.':
      'Spotify rejected this. Check in its dashboard that {campo} contains exactly {url} and that your account is listed under {gestion} if the app is in development mode.',
    'Esto no es cosa del panel de Spotify: no hace falta tocar nada allí. Pulsa Conectar {aqui} y deja que vuelva sin abrir otras pestañas ni cambiar entre la app instalada y el navegador.':
      'This is not about the Spotify dashboard: there is nothing to change there. Press Connect {aqui} and let it come back without opening other tabs or switching between the installed app and the browser.',
    'desde esta misma pantalla': 'from this very screen',
    'Reintentar aquí': 'Try again here',

    /* ---------- Música: las listas ---------- */
    'Lista para entrenar': 'Workout playlist',
    'Deja que la IA te prepare una lista a medida del entrenamiento de hoy. Cada vez propone artistas distintos, así que siempre descubres algo.':
      'Let the AI put together a playlist made for today\'s workout. It suggests different artists every time, so you always discover something.',
    'Crear una lista': 'Create a playlist',
    'Necesita la clave de la IA': 'It needs the AI key',
    '{n} lista creada': '{n} playlist created',
    '{n} listas creadas': '{n} playlists created',
    '{n} artistas ya propuestos que no se repetirán.':
      '{n} artists already suggested that will not repeat.',
    'Tus listas de Spotify': 'Your Spotify playlists',
    'Actualizar': 'Refresh',
    'Canciones, listas, álbumes o pódcast': 'Songs, playlists, albums or podcasts',
    'Cargando tus listas…': 'Loading your playlists…',
    'Lista fija': 'Pinned playlist',
    'La que quieras tener siempre a mano: pega su enlace y queda guardada para lanzarla de un toque.':
      'The one you want always to hand: paste its link and it stays saved to launch with one tap.',
    'Canciones': 'Songs',
    'Listas': 'Playlists',
    'Álbumes': 'Albums',
    'Artistas': 'Artists',
    'Pódcast': 'Podcasts',
    'Lista tuya': 'Your playlist',
    'Spotify no deja ver las canciones desde aquí, así que la siguiente siempre es sorpresa. Tú dale al play y déjate sorprender.':
      'Spotify will not let the songs be seen from here, so the next one is always a surprise. Press play and let it surprise you.',
    'No tienes listas guardadas en Spotify todavía.':
      'You have no playlists saved in Spotify yet.',
    'Ninguna lista con ese nombre.': 'No playlist with that name.',
    '{n} canción': '{n} song',
    '{n} canciones': '{n} songs',
    'Reproducir {que}': 'Play {que}',
    'Poniendo «{que}» arriba…': 'Putting «{que}» up top…',
    'Reproduciendo {que}': 'Playing {que}',
    'Tu lista de Spotify': 'Your Spotify playlist',
    'Sonando {que}. La siguiente es sorpresa — déjate llevar.':
      'Playing {que}. The next one is a surprise — go with it.',
    'Buscando…': 'Searching…',
    'Spotify no ha dejado buscar {que} desde esta app.':
      'Spotify would not let {que} be searched from this app.',
    ' ni ': ' or ',
    'Sonando {que}': 'Playing {que}',
    'Sonando': 'Playing',
    'Ocultar las canciones': 'Hide the songs',
    'Ver las {n} canciones': 'Show the {n} songs',
    'Tu lista de hoy': 'Today\'s playlist',
    'Reproducir aquí': 'Play here',
    'Abrirla en Spotify': 'Open it in Spotify',
    'Ya está en tu cuenta: en el móvil, en el coche o donde la abras.':
      'It is already in your account: on your phone, in the car or wherever you open it.',
    'Guardarla en mi Spotify': 'Save it to my Spotify',
    'Se crea como lista privada con estas mismas canciones.':
      'It is created as a private playlist with these same songs.',
    'Crear otra distinta': 'Create a different one',
    'Con otros artistas: no repite los que ya te ha propuesto.':
      'With other artists: it does not repeat the ones it has already suggested.',
    'Borrar la lista': 'Delete the playlist',
    'Si ya la guardaste en Spotify, allí se queda.':
      'If you already saved it to Spotify, it stays there.',
    'Podrás generar otra cuando quieras.':
      'You can generate another whenever you like.',
    'Lista guardada': 'Playlist saved',
    'Reproduciendo': 'Playing',
    'Memoria musical borrada: podrán repetirse artistas':
      'Music memory cleared: artists may repeat',
    'Eso es el enlace de {que}, no de una lista de reproducción.':
      'That is the link for {que}, not for a playlist.',
    'No reconozco ese enlace. Abre la lista en Spotify, pulsa los tres puntos y elige Compartir, Copiar enlace.':
      'I do not recognise that link. Open the playlist in Spotify, press the three dots and choose Share, Copy link.',

    /* ---------- Música: los permisos y el diagnóstico ---------- */
    'Qué le has dejado hacer a la app': 'What you have let the app do',
    '{n} cosa no puede hacerla: reconecta y acepta la pantalla tal cual sale':
      '{n} thing it cannot do: reconnect and accept the screen exactly as it comes',
    '{n} cosas no puede hacerlas: reconecta y acepta la pantalla tal cual sale':
      '{n} things it cannot do: reconnect and accept the screen exactly as it comes',
    'Las {n} cosas que necesita, concedidas': 'All {n} things it needs, granted',
    'La sesión es anterior y no apuntó los permisos':
      'The session predates this and did not record the permissions',
    'No puede: Spotify no dio {n} de los permisos que pide.':
      'It cannot: Spotify did not grant {n} of the permissions it asks for.',
    'Reproducir aquí dentro': 'Play in here',
    'Sonar sin salir de la app y manejar el play, la pausa y el volumen.':
      'Play without leaving the app and control play, pause and volume.',
    'Ver tus listas': 'See your playlists',
    'Las tuyas y las compartidas, para lanzarlas desde aquí.':
      'Yours and the shared ones, to launch from here.',
    'Guardarte las listas que crea la IA': 'Save the playlists the AI creates',
    'Se crean en tu cuenta para oírlas en el móvil o en el coche.':
      'They are created in your account so you can listen on your phone or in the car.',
    'Tus me gusta': 'Your likes',
    'Saber si una canción ya es tuya y poder darle al corazón.':
      'Know whether a song is already yours and be able to hit the heart.',
    'Afinar a tu gusto': 'Tune it to your taste',
    'Lo que más escuchas, para que las listas se te parezcan.':
      'What you listen to most, so the playlists sound like you.',
    'Si aún así algo falla': 'If something still fails',
    'Prueba una a una las llamadas a Spotify y te dice cuál se cae y por qué.':
      'It tries the Spotify calls one by one and tells you which falls over and why.',
    'Probar las llamadas que fallan': 'Test the calls that fail',
    'Los permisos tal cual los escribe Spotify':
      'The permissions exactly as Spotify writes them',
    'la sesión es anterior y no lo apuntó':
      'the session predates this and did not record it',
    'Hay que reconectar Spotify': 'Spotify needs reconnecting',
    'Spotify da los permisos el día que autorizas y ya no los amplía: el token se renueva solo, pero con los permisos de aquel día. Reconectar es un toque y no pierdes nada —ni tus listas, ni lo que suena.':
      'Spotify grants permissions on the day you authorise and never widens them: the token renews itself, but with that day’s permissions. Reconnecting is one tap and you lose nothing —not your playlists, not what is playing.',
    'Abriendo Spotify para dar permiso…': 'Opening Spotify to grant permission…',
    'Esto no son los permisos': 'This is not about permissions',
    'Tu conexión tiene todos los permisos que la app pide y aun así Spotify rechaza crear la lista. Estoy probando qué pasa y qué no.':
      'Your connection has every permission the app asks for and Spotify still refuses to create the playlist. I am testing what works and what does not.',
    'Probando las llamadas…': 'Testing the calls…',
    'Copiar el resultado': 'Copy the result',
    'Probar otra vez': 'Test again',
    'Si acabas de tocar algo en el panel de Spotify, tu conexión es de antes del cambio: reconecta y vuelve a probar.':
      'If you have just changed something in the Spotify dashboard, your connection predates the change: reconnect and test again.',
    'Copiado': 'Copied',
    'Selecciona el texto y cópialo a mano': 'Select the text and copy it by hand',
    'CONCLUSIÓN: ahora sí deja crear listas. Cierra esto y dale otra vez a guardar.':
      'CONCLUSION: it does let playlists be created now. Close this and press save again.',
    'CONCLUSIÓN: esta conexión es anterior a cualquier cambio que hayas hecho hoy en el panel de Spotify, y un cambio en el panel no toca un token ya dado. Reconecta aquí abajo y vuelve a probar: hasta entonces esto es la foto de antes.':
      'CONCLUSION: this connection predates anything you changed in the Spotify dashboard today, and a dashboard change does not touch a token already granted. Reconnect below and test again: until then this is the old picture.',
    'CONCLUSIÓN: falla hasta el catálogo público, que no pide ningún permiso. El problema está en la app del panel de Spotify, no en tu cuenta: mira si sigue en modo desarrollo y si tu cuenta está en User Management.':
      'CONCLUSION: even the public catalogue fails, and that asks for no permission at all. The problem is the app in the Spotify dashboard, not your account: check whether it is still in development mode and whether your account is under User Management.',
    'CONCLUSIÓN: conexión recién hecha, el catálogo público responde y aun así Spotify no deja escribir en tu cuenta. Esto ya no es ni el token ni el panel. Mándame estas líneas.':
      'CONCLUSION: freshly made connection, the public catalogue responds, and Spotify still will not write to your account. This is neither the token nor the dashboard any more. Send me these lines.',
    'No se ha podido probar: {error}': 'It could not be tested: {error}',
    'No se pudo probar: {error}': 'Could not test: {error}',
    'Probando…': 'Testing…',
    'No hay lista que guardar': 'There is no playlist to save',
    'Entra en Spotify primero': 'Sign in to Spotify first',
    'A tu conexión con Spotify le falta el permiso «{permiso}», que es justo el que hace falta para crear la lista en tu cuenta.':
      'Your Spotify connection is missing the «{permiso}» permission, which is exactly the one needed to create the playlist in your account.',
    'Tu conexión con Spotify es anterior a esta función, así que no incluye el permiso para crear listas en tu cuenta.':
      'Your Spotify connection predates this feature, so it does not include permission to create playlists in your account.',
    'Guardándola en Spotify…': 'Saving it to Spotify…',
    'Estas canciones no tienen enlace de Spotify.': 'These songs have no Spotify link.',
    ' — hecha con Training FR': ' — made with Training FR',
    'Guardada en tu Spotify': 'Saved to your Spotify',
    'Spotify ha rechazado crear la lista.': 'Spotify refused to create the playlist.',
    'No se ha podido guardar en Spotify.': 'It could not be saved to Spotify.',

    /* ---------- Música: crear una lista y el reproductor ---------- */
    'Esa lista no tiene canciones': 'That playlist has no songs',
    'Sonando en la app': 'Playing in the app',
    'Aquí no se pudo, suena en tu Spotify abierto':
      'It could not play here, it is playing on your open Spotify',
    'Abre Spotify en algún dispositivo y vuelve a probar.':
      'Open Spotify on some device and try again.',
    'Nueva lista': 'New playlist',
    'La IA propone las canciones y la app las busca en Spotify. Las que no existan se descartan solas.':
      'The AI suggests the songs and the app looks them up in Spotify. Any that do not exist drop out by themselves.',
    'A QUÉ TIENE QUE SONAR': 'WHAT IT SHOULD SOUND LIKE',
    'CUÁNTO VA A DURAR': 'HOW LONG IT WILL LAST',
    'ALGO MÁS (OPCIONAL)': 'ANYTHING ELSE (OPTIONAL)',
    'Nada de reguetón, más rock de los noventa…': 'No reggaeton, more nineties rock…',
    'Se adapta a lo de hoy': 'It adapts to today\'s session',
    '{rutina}: más pesada en las series duras y más constante entre ellas.':
      '{rutina}: heavier on the hard sets and steadier in between.',
    'Crear lista': 'Create playlist',
    'Vas a pedir': 'You are about to ask for',
    '{cuanto} de música': '{cuanto} of music',
    'Pensando la lista…': 'Thinking up the playlist…',
    'Buscando las canciones en Spotify…': 'Looking the songs up in Spotify…',
    'Buscando {hechas} de {total} · {halladas} encontradas':
      'Searching {hechas} of {total} · {halladas} found',
    'Ninguna de las canciones apareció en Spotify.':
      'None of the songs turned up in Spotify.',
    'Lista de entrenamiento': 'Workout playlist',
    '{n} canción lista': '{n} song ready',
    '{n} canciones listas': '{n} songs ready',
    'Reproductor de la app': 'The app\'s player',
    'Suena aquí mismo, sin abrir Spotify':
      'It plays right here, without opening Spotify',
    'Activar': 'Turn on',
    'Conectando…': 'Connecting…',
    'Listo: la música sonará en la app': 'Done: the music will play in the app',
    'Guardar en favoritas': 'Save to your likes',
    'Traer aquí': 'Bring it here',
    'Aleatorio activado': 'Shuffle on',
    'Aleatorio desactivado': 'Shuffle off',
    'Guardada en tus favoritas de Spotify': 'Saved to your Spotify likes',
    'Quitada de favoritas': 'Removed from your likes',

    /* ---------- Progreso: ejercicios, peso y zonas ---------- */
    'El que más sube': 'The one going up most',
    'El que más repites': 'The one you repeat most',
    '{n} vez': '{n} time',
    '{n} veces': '{n} times',
    'Tus ejercicios': 'Your exercises',
    'Tu peso': 'Your weight',
    'Ahora': 'Now',
    'en el periodo': 'over the period',
    '{n} pesaje': '{n} weigh-in',
    '{n} pesajes': '{n} weigh-ins',
    '{signo}{n} {unidad} por semana de media': '{signo}{n} {unidad} a week on average',
    'Lo que llevas abandonado': 'What you have been neglecting',
    'Sin tocar': 'Untouched',
    'zona': 'area',
    'zonas': 'areas',
    'nunca': 'never',
    'Un músculo que no se toca en más de una semana se estanca. Toca la zona en Ejercicios y te monto la sesión.':
      'A muscle you do not touch for more than a week stalls. Tap the area under Exercises and I will build you the session.',
    'Rehacer mi programa con esto en cuenta':
      'Redo my program taking this into account',
    '{n} nuevo': '{n} new',
    '{n} nuevos': '{n} new',
    'Tu marca más alta': 'Your highest lift',
    'nuevo': 'new',
    'Tus metas': 'Your goals',
    'Cumplida el {fecha}': 'Achieved on {fecha}',
    'Te falta {que}': '{que} to go',
    'Te faltan {que}': '{que} to go',
    'Borrar entrenamiento': 'Delete workout',
    'Se eliminará de tu historial y de las estadísticas.':
      'It will be removed from your history and from the stats.',
    'La semana pasada': 'Last week',
    'Del {a} al {b}': '{a} to {b}',

    /* ---------- Progreso: el reparto por zonas ---------- */
    '{n} series de {zona} a la semana, y sin subir':
      '{n} sets of {zona} a week, and not going up',
    'Por encima de veinte series lo que se añade es fatiga, no músculo, y en {cuando} ninguno de los {cuantos} ejercicios de esa zona ha subido de peso. Baja el volumen una semana y vuelve: es cuando se crece.':
      'Above twenty sets what you add is fatigue, not muscle, and over {cuando} none of the {cuantos} exercises in that area has gone up in weight. Drop the volume for a week and come back: that is when you grow.',
    'las últimas cinco semanas': 'the last five weeks',
    'este periodo': 'this period',
    'Lo mismo con {lista}.': 'Same with {lista}.',
    '{n} series de {zona} a la semana': '{n} sets of {zona} a week',
    'Es mucho —de diez a veinte es lo que suele hacer falta—, pero estás subiendo peso, así que te lo estás recuperando. Si un día se para el progreso, ahí es donde hay que recortar.':
      'That is a lot —ten to twenty is usually what it takes—, but you are adding weight, so you are recovering from it. The day progress stalls, that is where to cut.',
    'series por semana que haces': 'sets a week you do',
    'lo que pide tu plan': 'what your plan asks for',
    'Donde más te separas es {zona}: tu plan pide {pide} series por semana y estás haciendo {haces}.':
      'Where you differ most is {zona}: your plan asks for {pide} sets a week and you are doing {haces}.',
    'Todavía no has completado series en este periodo.':
      'You have not completed any sets in this period yet.',
    'En este periodo no has entrenado {lista}.':
      'In this period you have not trained {lista}.',
    '{mas} se lleva el triple que {menos}. Si no es a propósito, conviene equilibrarlo.':
      '{mas} gets three times as much as {menos}. If that is not on purpose, it is worth evening out.',
    'Reparto equilibrado entre las zonas que entrenas.':
      'Balanced split across the areas you train.',

    /* ---------- Modo invitado ---------- */
    'Vas a seguir como invitado': 'You are carrying on as a guest',
    'Es la forma rápida de empezar, pero conviene que sepas dónde queda lo tuyo.':
      'It is the quick way to start, but you should know where your things end up.',
    'Tus datos se guardan solo en este dispositivo':
      'Your data is stored on this device only',
    'Se pierden si borras los datos del navegador o desinstalas la app.':
      'It is lost if you clear your browser data or uninstall the app.',
    'No hay copia en ningún servidor: si cambias de móvil, empiezas de cero.':
      'There is no copy on any server: change phone and you start from scratch.',
    'No los verás en tu otro dispositivo.': 'You will not see it on your other device.',
    'Puedes crear la cuenta más adelante desde {donde}: lo que hayas hecho hasta entonces se sube y no se pierde nada.':
      'You can create the account later from {donde}: whatever you have done up to then is uploaded and nothing is lost.',
    'Perfil, Mi cuenta': 'Profile, My account',
    'Mejor creo mi cuenta': 'I will create my account instead',
    'Entiendo, seguir como invitado': 'Understood, carry on as a guest',
    'Esto es tuyo: guárdalo bien': 'This is yours: keep it safe',
    'Con una cuenta lo tienes en el móvil, en el portátil y en el que venga después. Es gratis y no hay servidor mío de por medio: los datos van a tu propia base de datos.':
      'With an account you have it on your phone, on your laptop and on whatever comes next. It is free and there is no server of mine in between: the data goes to your own database.',
    'Crear mi cuenta': 'Create my account',
    'Continuar sin cuenta': 'Carry on without an account',

    /* ---------- La base de datos ---------- */
    'Tu base de datos': 'Your database',
    'Tus datos se guardan en el proyecto de quien te dio el acceso, y solo los ves tú: la base de datos no deja que nadie lea lo de otra persona, ni siquiera quien administra.':
      'Your data is stored in the project of whoever gave you access, and only you can see it: the database does not let anyone read another person’s rows, not even the administrator.',
    'De la conexión se encarga quien administra; no hay nada que configures aquí.':
      'The administrator handles the connection; there is nothing for you to set up here.',
    'Se crea una vez, es gratis, no pide tarjeta y es tuya: los datos van a tu propio Supabase, no a ningún servidor mío. Ocho pasos y unos diez minutos.':
      'You create it once, it is free, it asks for no card and it is yours: the data goes to your own Supabase, not to any server of mine. Eight steps and about ten minutes.',
    'Ya tienes una conexión propia guardada':
      'You already have your own connection saved',
    'Antes de empezar: ¿te hace falta?': 'Before you start: do you need this?',
    'Si usas la app en un solo móvil': 'If you use the app on one phone only',
    'No necesitas nada de esto. Todo funciona y se guarda en el dispositivo. Lo único: si borras los datos del navegador, se pierde.':
      'You need none of this. Everything works and is stored on the device. The one catch: clear your browser data and it is gone.',
    'Si ya tienes cuenta en esta app': 'If you already have an account in this app',
    'Tampoco. Ve a {donde} y entra con tu correo; la conexión ya está puesta.':
      'Not that either. Go to {donde} and sign in with your email; the connection is already set.',
    'Si quieres tus datos en varios dispositivos y no tienes cuenta':
      'If you want your data on several devices and have no account',
    'Entonces sí: la conexión que trae la app tiene el alta cerrada a propósito, así que la tuya te la montas aquí.':
      'Then yes: the connection the app ships with has sign-ups closed on purpose, so you set up your own here.',
    'Los nombres de los menús van en inglés porque Supabase viene así, aunque tu navegador esté en español.':
      'The menu names are in English because that is how Supabase comes, whatever language your browser is in.',
    'SQL PARA CREAR LA TABLA': 'SQL TO CREATE THE TABLE',
    'Los dos datos de conexión': 'The two connection details',
    'Guardar la conexión': 'Save the connection',
    'Borrar esta conexión': 'Delete this connection',
    'La <b>Publishable key</b> es pública a propósito: va dentro de la app y cualquiera puede verla. Lo que protege tus datos es la política del paso 3, que hace que cada fila solo la lea quien la escribió.':
      'The <b>Publishable key</b> is public on purpose: it ships inside the app and anyone can see it. What protects your data is the policy from step 3, which means each row can only be read by whoever wrote it.',
    'SQL copiado': 'SQL copied',
    'Dirección copiada': 'Address copied',
    'Conexión guardada. Ahora crea tu cuenta con tu correo.':
      'Connection saved. Now create your account with your email.',
    'Borrar la conexión': 'Delete the connection',
    'Este dispositivo dejará de usar tu base de datos. Tus datos locales no se tocan.':
      'This device will stop using your database. Your local data is not touched.',
    'Conexión borrada': 'Connection deleted',

    /* ---------- La base de datos: el paso a paso ---------- */
    'Crea tu cuenta en Supabase': 'Create your Supabase account',
    'Abre <b>supabase.com</b> y pulsa <b>Start your project</b>.':
      'Open <b>supabase.com</b> and press <b>Start your project</b>.',
    'Entra con GitHub o con tu correo. Es gratis y no pide tarjeta.':
      'Sign in with GitHub or with your email. It is free and asks for no card.',
    'Crea el proyecto': 'Create the project',
    '<b>Name</b>: el que quieras, por ejemplo Training.':
      '<b>Name</b>: whatever you like, Training for example.',
    '<b>Database Password</b>: genera una y guárdala donde guardes tus contraseñas. No es la que usarás en la app, pero la necesitarás si algún día entras a la base de datos.':
      '<b>Database Password</b>: generate one and keep it wherever you keep your passwords. It is not the one you will use in the app, but you will need it if you ever go into the database.',
    '<b>Region</b>: la más cercana a ti.': '<b>Region</b>: the one closest to you.',
    'Pulsa <b>Create new project</b> y espera un par de minutos a que termine de montarse.':
      'Press <b>Create new project</b> and wait a couple of minutes for it to finish setting up.',
    'Crea la tabla donde van tus datos': 'Create the table your data goes in',
    'En el menú de la izquierda entra en <b>SQL Editor</b>.':
      'In the left-hand menu go into <b>SQL Editor</b>.',
    'Pulsa <b>New query</b>, pega el bloque de abajo y pulsa <b>Run</b> (o Ctrl+Intro).':
      'Press <b>New query</b>, paste the block below and press <b>Run</b> (or Ctrl+Enter).',
    'Tiene que responder <b>Success. No rows returned</b>. Eso es que ha ido bien.':
      'It should answer <b>Success. No rows returned</b>. That means it worked.',
    'Ese SQL crea la tabla y la política de seguridad que hace que solo tú puedas ver tus filas, aunque la clave de la app sea pública.':
      'That SQL creates the table and the security policy that means only you can see your rows, even though the app key is public.',
    'Quita la confirmación por correo': 'Turn off email confirmation',
    'Ve a <b>Authentication</b> y luego a <b>Sign In / Providers</b>.':
      'Go to <b>Authentication</b> and then to <b>Sign In / Providers</b>.',
    'En <b>User Signups</b>, deja <b>Allow new users to sign up</b> encendido de momento.':
      'Under <b>User Signups</b>, leave <b>Allow new users to sign up</b> on for now.',
    'Apaga <b>Confirm email</b> y pulsa <b>Save changes</b>.':
      'Turn off <b>Confirm email</b> and press <b>Save changes</b>.',
    'El correo que trae Supabase de serie solo manda un par de mensajes por hora. Sin esa confirmación entras con contraseña al momento y no dependes de ningún correo.':
      'The email Supabase ships with only sends a couple of messages an hour. Without that confirmation you sign in with a password straight away and depend on no email.',
    'Autoriza la dirección de la app': 'Authorise the app address',
    'Pega esta dirección en <b>Site URL</b> y también en <b>Redirect URLs</b>':
      'Paste this address into <b>Site URL</b> and also into <b>Redirect URLs</b>',
    'Guarda con <b>Save changes</b>.': 'Save with <b>Save changes</b>.',
    'Copia los dos datos de conexión': 'Copy the two connection details',
    'Ve a <b>Project Settings</b> (la rueda dentada) y entra en <b>Data API</b>: copia la <b>Project URL</b>, que acaba en <b>.supabase.co</b>.':
      'Go to <b>Project Settings</b> (the cog) and into <b>Data API</b>: copy the <b>Project URL</b>, which ends in <b>.supabase.co</b>.',
    'Entra en <b>API Keys</b> y copia la <b>Publishable key</b>, la que empieza por <b>sb_publishable_</b>. Si tu proyecto es antiguo, se llama <b>anon public</b> y empieza por <b>eyJ</b>.':
      'Go into <b>API Keys</b> and copy the <b>Publishable key</b>, the one starting with <b>sb_publishable_</b>. On an older project it is called <b>anon public</b> and starts with <b>eyJ</b>.',
    'No copies nunca las <b>Secret keys</b> ni la <b>service_role</b>: esas dan acceso total y no pintan nada en una app que corre en el navegador.':
      'Never copy the <b>Secret keys</b> or the <b>service_role</b>: those give full access and have no business in an app that runs in the browser.',
    'Pégalos aquí abajo y crea tu cuenta': 'Paste them below and create your account',
    'Pega la Project URL y la Publishable key en los dos campos del final.':
      'Paste the Project URL and the Publishable key into the two fields at the bottom.',
    'Pulsa <b>Guardar la conexión</b>.': 'Press <b>Save the connection</b>.',
    'Ve a <b>Perfil &rarr; Mi cuenta</b> y crea tu cuenta con tu correo y una contraseña de al menos 8 caracteres.':
      'Go to <b>Profile &rarr; My account</b> and create your account with your email and a password of at least 8 characters.',
    'Cuando ya estés dentro, vuelve a Supabase y apaga <b>Allow new users to sign up</b>: así nadie más puede crearse cuentas en tu proyecto.':
      'Once you are in, go back to Supabase and turn off <b>Allow new users to sign up</b>: that way nobody else can create accounts in your project.',
    'Comprueba que ha funcionado': 'Check that it worked',
    'En <b>Mi cuenta</b> tiene que salir tu correo y <b>Todo al día</b>.':
      'Under <b>My account</b> your email should show, along with <b>All up to date</b>.',
    'Entra con el mismo correo en el otro dispositivo: en un minuto deberías ver ahí tus rutinas.':
      'Sign in with the same email on the other device: within a minute you should see your routines there.',
    'Si algo falla, la app te dice qué pasa con sus palabras; abajo tienes qué significa cada aviso.':
      'If something fails, the app tells you what is happening in its own words; below is what each message means.',
    '«Falta la tabla donde van los datos»': '«The table the data goes in is missing»',
    'El paso 3 no llegó a ejecutarse. Vuelve al <b>SQL Editor</b>, pega el bloque otra vez y comprueba que responde <b>Success</b>.':
      'Step 3 never ran. Go back to the <b>SQL Editor</b>, paste the block again and check it answers <b>Success</b>.',
    '«Esa clave no vale para este proyecto»':
      '«That key is not valid for this project»',
    'La clave y la URL son de proyectos distintos, o copiaste una <b>Secret key</b>. Vuelve a <b>Project Settings &rarr; API Keys</b> y copia la <b>Publishable</b>.':
      'The key and the URL are from different projects, or you copied a <b>Secret key</b>. Go back to <b>Project Settings &rarr; API Keys</b> and copy the <b>Publishable</b> one.',
    '«Correo o contraseña incorrectos» recién creada la cuenta':
      '«Wrong email or password» on a freshly created account',
    'O el alta estaba cerrada y la cuenta no llegó a crearse, o la creaste con el enlace del correo y todavía no tiene contraseña. En <b>Authentication &rarr; Users</b> de Supabase ves si existe de verdad.':
      'Either sign-ups were closed and the account never got created, or you created it through the email link and it has no password yet. Under <b>Authentication &rarr; Users</b> in Supabase you can see whether it really exists.',
    'El correo de confirmación no llega': 'The confirmation email never arrives',
    'El correo de serie de Supabase manda dos o tres mensajes por hora y nada más. Por eso el paso 4 apaga <b>Confirm email</b>: así no depende de ningún correo.':
      'The email Supabase ships with sends two or three messages an hour and no more. That is why step 4 turns off <b>Confirm email</b>: that way it depends on no email at all.',

    /* ---------- Mi día ---------- */
    '{n} L hoy': '{n} L today',
    'Tu pauta de agua del día.': 'Your water schedule for the day.',
    'Tu pauta son {tomas} tomas y llevas {hechas} marcadas. Marca cada vez que bebas.':
      'Your schedule is {tomas} drinks and you have {hechas} ticked. Tick each time you drink.',
    'Marca cada vaso y aquí verás cuánto llevas.':
      'Tick each glass and here you will see how much you have had.',
    'Del menú que te preparó el entrenador.':
      'From the meal plan the coach prepared for you.',
    'Ver la semana entera': 'See the whole week',
    'Todavía no tienes menú': 'You have no meal plan yet',
    'El entrenador puede prepararte uno semanal con tus calorías, tu dieta y tus horarios, y entonces aquí verás lo que te toca comer hoy y a qué hora.':
      'The coach can prepare a weekly one with your calories, your diet and your times, and then here you will see what you are due to eat today and when.',
    '{n} kcal': '{n} kcal',
    'Todavía no tienes menú para hoy.': 'You have no meal plan for today yet.',
    'Las {n} comidas de hoy, resueltas.': 'Today\'s {n} meals, all sorted.',
    'Son {cuantas} comidas y llevas {hechas}. Marca la que te comas, o dime si comiste otra cosa.':
      'That is {cuantas} meals and you have had {hechas}. Tick the one you eat, or tell me if you ate something else.',
    'Hoy descansas': 'You rest today',
    'Hoy no toca nada. Descansar también es parte del plan.':
      'Nothing is due today. Resting is part of the plan too.',
    'No hay ninguna rutina puesta para hoy. Descansar es parte del plan; si te apetece moverte, camina o apunta lo que hagas.':
      'There is no routine set for today. Resting is part of the plan; if you fancy moving, walk or log whatever you do.',
    'Elegir una rutina igualmente': 'Pick a routine anyway',
    '{lista} y {n} más': '{lista} and {n} more',
    '{lista} y {ultima}': '{lista} and {ultima}',
    'Hoy le das a {zonas}.': 'Today you hit {zonas}.',
    '{ejercicios} ejercicios y {series} series.':
      '{ejercicios} exercises and {series} sets.',
    'PROTEÍNA': 'PROTEIN',
    'Te faltan {prot} g de proteína y {kcal} kcal.':
      'You are {prot} g of protein and {kcal} kcal short.',
    'Ya has llegado a la proteína del día.': 'You have hit today\'s protein.',
    '{n} apunte de hoy va suelto': '{n} of today\'s entries is unmatched',
    '{n} apuntes de hoy van sueltos': '{n} of today\'s entries are unmatched',
    'Encajan con una comida de tu menú. Crúzalos y quedará marcada, con la diferencia contra lo que tenías previsto.':
      'They match a meal in your plan. Match them up and it gets ticked, with the difference against what you had planned.',
    '{kcal} kcal · {prot} g': '{kcal} kcal · {prot} g',
    ' · de una foto': ' · from a photo',
    ' · en vez de {que}': ' · instead of {que}',
    'Cruzar': 'Match up',
    'Sin tus datos no puedo calcular nada.':
      'Without your details I cannot work anything out.',
    'Todavía no has apuntado nada hoy.': 'You have logged nothing today yet.',
    'De dónde salen esas calorías': 'Where those calories come from',
    'De {con} de los {total} apuntes de hoy; los demás se anotaron cuando solo se guardaban calorías y proteína.':
      'From {con} of today\'s {total} entries; the rest were logged when only calories and protein were stored.',
    'Entrenaste': 'You trained',
    'Día de descanso': 'Rest day',
    'Llegaste a la proteína': 'You hit your protein',
    'Bebiste el agua': 'You drank your water',
    'Entreno': 'Training',
    'Los días de descanso no piden entreno: ahí solo cuentan la proteína y el agua.':
      'Rest days ask for no training: there only protein and water count.',
    '{n} de 7 días': '{n} of 7 days',
    'Los últimos siete días: si entrenaste, si llegaste a la proteína y si bebiste el agua.':
      'The last seven days: whether you trained, whether you hit your protein and whether you drank your water.',
    'Llevas {hechas} de {pedidas}.': 'You are on {hechas} of {pedidas}.',

    /* ---------- Marcar comidas y agua ---------- */
    'Comiste otra cosa': 'You ate something else',
    'Te lo comiste': 'You ate it',
    'Deshacer': 'Undo',
    'Me lo comí': 'I ate it',
    'Comí otra cosa': 'I ate something else',
    'Se apunta en el día de hoy.': 'It gets logged under today\'s date.',
    'O bien: {lista}': 'Or: {lista}',
    'Ponerme los recordatorios': 'Set my reminders',
    'Un vaso suelto': 'A one-off glass',
    'Ese plato ya no está en el menú': 'That dish is no longer in the meal plan',
    'Apuntado: {n} kcal': 'Logged: {n} kcal',
    'En lugar de {plato} ({kcal} kcal · {prot} g de proteína).':
      'Instead of {plato} ({kcal} kcal · {prot} g of protein).',
    'QUÉ COMISTE': 'WHAT YOU ATE',
    'Ej. dos arepas con queso y un café con leche':
      'E.g. two cheese arepas and a white coffee',
    'Calcular': 'Work it out',
    'Hacer foto': 'Take a photo',
    'Escríbelo o hazle una foto. Saca las calorías y la proteína, y te dice si el cambio se sostiene. La foto no se guarda en ningún sitio: se manda para que la lea y se suelta.':
      'Write it down or take a photo. It works out the calories and the protein, and tells you whether the swap holds up. The photo is not stored anywhere: it is sent to be read and then released.',
    'Sin el entrenador con IA configurado tendrás que poner tú los números.':
      'Without the AI coach set up you will have to put the numbers in yourself.',
    'Anotar el cambio': 'Log the swap',
    'Respecto a lo que tocaba': 'Against what was due',
    'Buen cambio': 'Good swap',
    'Este no te conviene': 'This one does not suit you',
    'Pasa, pero justo': 'It passes, but only just',
    'También puedes alternar con': 'You can also alternate with',
    'Escribe qué comiste o hazle una foto': 'Write what you ate or take a photo',
    'Mirándolo…': 'Looking at it…',
    'No se pudo calcular': 'It could not be worked out',
    'No he podido leer esa foto': 'I could not read that photo',
    'Escribe qué comiste': 'Write what you ate',
    'Faltan las calorías': 'The calories are missing',
    'Cambio apuntado': 'Swap logged',
    'Ese apunte ya no está': 'That entry is gone',
    'A esa hora no tenías nada en el menú':
      'You had nothing in the meal plan at that time',
    'No he podido mirarlo': 'I could not look at it',
    'esa comida': 'that meal',
    'lo del menú': 'what the plan said',
    'Eso es tu {comida}': 'That is your {comida}',
    '¿Esto es tu {comida}?': 'Is this your {comida}?',
    'A las {hora} tocaba «{plato}» y eso es lo que veo en la foto.':
      'At {hora} «{plato}» was due, and that is what I see in the photo.',
    'A las {hora} tocaba «{plato}», y en la foto veo otra cosa.':
      'At {hora} «{plato}» was due, and in the photo I see something else.',
    'Frente a las {kcal} kcal y {prot} g que tenía el menú.':
      'Against the {kcal} kcal and {prot} g the plan had.',
    'Sí, es esa comida': 'Yes, that is the meal',
    'Dejarlo': 'Leave it',
    'Es aparte': 'It is separate',
    'Los números no cambian: ya están contados en tu día. Lo que se añade es a qué comida del menú corresponde.':
      'The numbers do not change: they are already counted in your day. What gets added is which meal in the plan it belongs to.',
    '«Es aparte» lo apunta como un extra del día y deja tu {comida} sin marcar.':
      '«It is separate» logs it as an extra for the day and leaves your {comida} unticked.',
    'Cruzado con tu {comida}': 'Matched to your {comida}',
    'Apuntado en tu {comida}': 'Logged under your {comida}',
    'Apuntados {n} ml': '{n} ml logged',
    'Desmarcado': 'Unticked',
    'Un vaso más: {n} ml': 'One more glass: {n} ml',
    'Completa tu perfil para calcular el agua':
      'Fill in your profile so I can work out your water',
    'Ya los tienes puestos': 'You already have them set',
    '{n} recordatorio de agua creado': '{n} water reminder created',
    '{n} recordatorios de agua creados': '{n} water reminders created',
    'No has elegido ninguna foto.': 'You have not picked a photo.',
    'Eso no es una imagen.': 'That is not an image.',
    'No he podido abrir esa foto.': 'I could not open that photo.',

    /* ---------- El menú genérico ---------- */
    'Reparto de tus {kcal} kcal y {prot} g de proteína entre {comidas} comidas. Los platos los eliges tú: aquí están los números que tiene que cuadrar cada comida y qué debe llevar.':
      'A split of your {kcal} kcal and {prot} g of protein across {comidas} meals. You pick the dishes: here are the numbers each meal has to add up to and what it should contain.',
    'Media mañana': 'Mid-morning',
    'Antes de dormir': 'Before bed',
    'Proteína (huevos, yogur griego, queso fresco), un hidrato (avena, pan integral) y fruta':
      'Protein (eggs, Greek yoghurt, fresh cheese), a carb (oats, wholemeal bread) and fruit',
    'Algo de proteína y fruta o frutos secos': 'Some protein and fruit or nuts',
    'Una ración de proteína, un hidrato (arroz, pasta, patata, legumbre) y verdura, con aceite de oliva':
      'A portion of protein, a carb (rice, pasta, potato, pulses) and vegetables, with olive oil',
    'Proteína (yogur, atún, pavo) con un hidrato ligero':
      'Protein (yoghurt, tuna, turkey) with a light carb',
    'Proteína (pescado, huevo, pollo) y verdura, con poco hidrato':
      'Protein (fish, egg, chicken) and vegetables, with few carbs',
    'Proteína de digestión lenta: yogur griego o requesón':
      'Slow-digesting protein: Greek yoghurt or cottage cheese',
    'A tu elección, cuadrando los números':
      'Your choice, as long as the numbers add up',
    'Al levantarte: un vaso grande': 'On waking: a large glass',
    'A media mañana: un vaso': 'Mid-morning: a glass',
    'Antes de entrenar: un vaso': 'Before training: a glass',
    'Al terminar de entrenar: un vaso': 'After training: a glass',
    'Con la cena: un vaso': 'With dinner: a glass',
    'El café y las infusiones cuentan para el líquido total, pero no sustituyen al agua.':
      'Coffee and herbal teas count towards your total fluid, but they do not replace water.',
    'Cuadra primero la proteína de cada comida; las calorías se ajustan con el hidrato y el aceite.':
      'Get each meal’s protein right first; the calories are adjusted with the carbs and the oil.',
    'Si un día te pasas, no compenses saltándote la siguiente comida: vuelve al plan en la siguiente.':
      'If you overdo it one day, do not make up for it by skipping the next meal: get back on plan at the next one.',

    /* ---------- Zonas y el catálogo ---------- */
    'Ver {n} más': 'Show {n} more',
    'Nada por aquí con tu material': 'Nothing here with your equipment',
    'Cambia dónde entrenas y vuelve a mirar: el catálogo entero tiene bastante más.':
      'Change where you train and look again: the full catalogue has plenty more.',

    /* ---------- El perfil, en texto ---------- */
    'el sexo biológico': 'your biological sex',
    'la edad': 'your age',
    'la altura': 'your height',
    'el peso': 'your weight',
    'el país': 'your country',
    '{n}% de grasa corporal': '{n}% body fat',
    'actividad {que}': '{que} activity',
    'objetivo: {que}': 'goal: {que}',
    ' (con sus palabras: "{texto}")': ' (in their words: "{texto}")',
    'ritmo {que}': '{que} pace',
    'gasto estimado {n} kcal': 'estimated expenditure {n} kcal',
    'objetivo diario {kcal} kcal ({prot} g proteína, {carbo} g hidratos, {grasa} g grasa)':
      'daily target {kcal} kcal ({prot} g protein, {carbo} g carbs, {grasa} g fat)',
    'duerme {n} h': 'sleeps {n} h',
    'se levanta a las {a} y se acuesta a las {b}':
      'gets up at {a} and goes to bed at {b}',
    '{n} comidas al día': '{n} meals a day',
    'dieta: {que}': 'diet: {que}',
    'vive en {pais}': 'lives in {pais}',
    'alergias o intolerancias: {texto}': 'allergies or intolerances: {texto}',
    'lesiones o limitaciones: {texto}': 'injuries or limitations: {texto}',
    'condiciones de salud: {texto}': 'health conditions: {texto}',
    'notas: {texto}': 'notes: {texto}',

    /* ---------- El saludo de la portada ---------- */
    'Buenas noches': 'Good evening',
    'Buenos días': 'Good morning',
    'Buenas tardes': 'Good afternoon',
    '{saludo}, {nombre}': '{saludo}, {nombre}',
    'Bienvenido': 'Welcome',
    'Todo esto empieza con una serie. Elige una rutina y hazla: lo demás ya se va colocando solo.':
      'All of this starts with one set. Pick a routine and do it: the rest falls into place on its own.',
    'Cuánto tiempo': 'Long time no see',
    'Volver es la parte difícil y ya la has hecho. Hoy no busques tu mejor día: busca el primero.':
      'Coming back is the hard part and you have already done it. Do not look for your best day today: look for the first one.',
    'Otra vez por aquí': 'Back again',
    'Una semana parada no borra {n} entrenamientos. Baja algo el peso hoy y en dos sesiones estás donde estabas.':
      'A week off does not erase {n} workouts. Drop the weight a bit today and in two sessions you are back where you were.',
    '{n} días seguidos. Lo raro ya no es entrenar hoy: sería no hacerlo.':
      '{n} days in a row. Training today is no longer the odd thing: not doing it would be.',
    'Llevas {n} días seguidos. Hoy es el que convierte la casualidad en costumbre.':
      'You are on {n} days in a row. Today is the one that turns a fluke into a habit.',
    '{n} entrenamientos esta semana. A este ritmo el descanso también entrena: si hoy toca parar, para.':
      '{n} workouts this week. At this rate rest is training too: if today is a stop day, stop.',
    'Llevas {n} entrenamiento esta semana. Uno más y la semana ya cuenta.':
      'You are on {n} workout this week. One more and the week counts.',
    'Llevas {n} entrenamientos esta semana. Uno más y la semana ya cuenta.':
      'You are on {n} workouts this week. One more and the week counts.',
    'Semana nueva y el cuerpo descansado. Es el mejor día para el ejercicio que peor se te da.':
      'New week and a rested body. It is the best day for the exercise you are worst at.',
    'Van {n} días desde la última. Con media hora hoy la semana cambia de signo.':
      'It has been {n} days since the last one. Half an hour today turns the week around.',
    'Generado para {min} min · {objetivo} · {donde}. Ajusta lo que quieras.':
      'Generated for {min} min · {objetivo} · {donde}. Adjust whatever you like.',
    'Cuerpo completo': 'Full body',
    'Torso': 'Upper body',
    'Pierna y core': 'Legs and core',
    'Pecho y tríceps': 'Chest and triceps',
    'Espalda y bíceps': 'Back and biceps',
    'Hombro y core': 'Shoulders and core',
    'Hombro y trapecio': 'Shoulders and traps',
    'Glúteo y core': 'Glutes and core',
    'Empuje pesado': 'Heavy push',
    'Tracción pesada': 'Heavy pull',
    'Pierna pesada': 'Heavy legs',
    'Empuje volumen': 'Push volume',
    'Tracción volumen': 'Pull volume',
    'Definir y resistencia': 'Cutting and endurance',

    /* ---------- Compartir un plan ---------- */
    'Se crea un enlace que lleva el entrenamiento dentro. Quien lo abra lo ve, pero no puede tocarlo ni apuntar nada: no es su plan, es una copia de lectura.':
      'A link is created with the training inside it. Whoever opens it can see it, but cannot change it or log anything: it is not their plan, it is a read-only copy.',
    'QUÉ VIAJA EN EL ENLACE': 'WHAT TRAVELS IN THE LINK',
    'Los {n} ejercicios con sus series, repeticiones y descansos. Nada más: ni tus entrenamientos, ni tus pesos, ni tu comida, ni tu perfil.':
      'The {n} exercises with their sets, reps and rests. Nothing else: not your workouts, not your weights, not your food, not your profile.',
    'Decir que es mío': 'Say it is mine',
    'Incluir mis notas': 'Include my notes',
    'Tienes {n} nota escrita en estos ejercicios. Va fuera salvo que lo marques, por si hay algo tuyo dentro.':
      'You have {n} note written on these exercises. It stays out unless you tick this, in case there is something personal in it.',
    'Tienes {n} notas escritas en estos ejercicios. Van fuera salvo que lo marques, por si hay algo tuyo dentro.':
      'You have {n} notes written on these exercises. They stay out unless you tick this, in case there is something personal in them.',
    '{aviso} quien tenga el enlace lo verá siempre, no se puede retirar. Y es una foto de hoy: si mañana cambias el plan, el enlace sigue enseñando lo de ahora.':
      '{aviso} whoever has the link will always see it, it cannot be withdrawn. And it is a snapshot of today: if you change the plan tomorrow, the link still shows what it is now.',
    'Antes de mandarlo:': 'Before you send it:',
    'TU ENLACE': 'YOUR LINK',
    'Crear el enlace': 'Create the link',
    'Rehacer el enlace': 'Redo the link',
    'Mira este plan': 'Take a look at this plan',
    'No se ha podido crear el enlace': 'The link could not be created',
    'Enlace copiado': 'Link copied',
    'Esa rutina no tiene ejercicios': 'That routine has no exercises',
    'Compartir rutina': 'Share routine',
    'Ese plan no tiene nada que compartir': 'That plan has nothing to share',
    'Compartir «{que}»': 'Share «{que}»',
    'Este enlace no se puede leer': 'This link cannot be read',
    'O se ha cortado al copiarlo, o se hizo con una versión de la app muy distinta a esta. Pide que te lo manden otra vez.':
      'Either it got cut off when copied, or it was made with a very different version of the app. Ask for it to be sent again.',
    'Ir a mi app': 'Go to my app',
    'Plan compartido': 'Shared plan',
    'Te lo ha pasado {quien}.': '{quien} sent it to you.',
    'Son {sesiones} y {ejercicios}.': 'It is {sesiones} and {ejercicios}.',
    'Esto es solo para verlo': 'This is just to look at',
    'No está en tu cuenta, así que no hay nada que editar ni que apuntar aquí. Si te gusta, quédatelo abajo y pasa a ser tuyo: a partir de ahí lo cambias como quieras.':
      'It is not in your account, so there is nothing to edit or log here. If you like it, keep it below and it becomes yours: from then on you change it however you like.',
    'Falta {n} ejercicio': '{n} exercise is missing',
    'Faltan {n} ejercicios': '{n} exercises are missing',
    'No están en el catálogo de esta app. El resto se ve entero.':
      'They are not in this app’s catalogue. The rest is all there.',
    'Series por músculo a la semana': 'Sets per muscle per week',
    'El plan': 'The plan',
    'Sesión {n}': 'Session {n}',
    'Guardarlo como mío': 'Save it as mine',
    'Se crea {n} rutina en tus rutinas. A partir de ahí es tuya: la editas, le pones los días y la entrenas.':
      '{n} routine is created in your routines. From then on it is yours: you edit it, set its days and train it.',
    'Se crean {n} rutinas en tus rutinas. A partir de ahí son tuyas: las editas, les pones los días y las entrenas.':
      '{n} routines are created in your routines. From then on they are yours: you edit them, set their days and train them.',
    'CÓMO LO LLAMO': 'WHAT I CALL IT',
    'Cada rutina se queda con el día que tenía en el plan original, porque ninguno de esos días lo tienes ocupado.':
      'Each routine keeps the day it had in the original plan, because none of those days are taken.',
    'De las {total}, {libres} se quedan con su día original; el resto entra sin día para no pisar lo que ya entrenas. Se los pones tú cuando decidas qué dejas.':
      'Of the {total}, {libres} keep their original day; the rest come in without a day so they do not clash with what you already train. You set those once you decide what stays.',
    'Entran sin día asignado: esos días ya los tienes ocupados y dos rutinas el mismo día se pisan. Ábrelas y colócalas cuando decidas.':
      'They come in with no day assigned: those days are already taken and two routines on the same day clash. Open them and place them when you decide.',
    '{n} rutina guardada': '{n} routine saved',
    '{n} rutinas guardadas': '{n} routines saved',

    /* ---------- Traer una rutina de una foto ---------- */
    'No he podido leer ese archivo.': 'I could not read that file.',
    'No has elegido ningún archivo.': 'You have not picked a file.',
    'Ese archivo pesa demasiado. Prueba con una foto o con un PDF de menos de 8 MB.':
      'That file is too big. Try a photo or a PDF under 8 MB.',
    'Tiene que ser una foto o un PDF.': 'It has to be a photo or a PDF.',
    'Elige antes una foto o un PDF.': 'Pick a photo or a PDF first.',
    'No he podido leerla.': 'I could not read it.',
    '{que} (no está en el catálogo)': '{que} (not in the catalogue)',
    'Mi rutina': 'My routine',
    'Traer una rutina que ya tienes': 'Bring in a routine you already have',
    'Una foto de la hoja del gimnasio, de tu libreta o el PDF que te hayan dado. La leo, te enseño lo que he entendido y tú decides si se crea.':
      'A photo of the sheet from the gym, of your notebook, or the PDF you were given. I read it, show you what I understood and you decide whether it gets created.',
    'Elegir foto o PDF': 'Pick a photo or PDF',
    '¿ALGO QUE DEBA SABER?': 'ANYTHING I SHOULD KNOW?',
    'Ej. es la rutina de mi entrenador, respétala tal cual; la columna de la derecha son los kilos, no las repeticiones':
      'E.g. this is my trainer’s routine, keep it exactly; the right-hand column is kilos, not reps',
    'El archivo no se guarda en ningún sitio: se lee, se manda para que lo interpreten y se suelta. Lo único que queda es la rutina si decides crearla.':
      'The file is not stored anywhere: it is read, sent to be interpreted and released. All that is left is the routine, if you decide to create it.',
    'Leyendo lo que pone…': 'Reading what it says…',
    'No he podido leerla': 'I could not read it',
    'No he encontrado ninguna rutina ahí': 'I did not find any routine in there',
    'Prueba con una foto más nítida, o recorta solo la tabla de ejercicios.':
      'Try a sharper photo, or crop to just the exercise table.',
    'Esto es lo que he entendido': 'This is what I understood',
    'Míralo antes de crearla: lo que sale de una foto conviene revisarlo. Luego se edita como cualquier otra rutina.':
      'Look it over before creating it: what comes out of a photo is worth checking. After that you edit it like any other routine.',
    'en el papel: {que}': 'on the sheet: {que}',
    'Esto no lo tengo claro': 'I am not sure about this',
    '¿CORRIJO ALGO ANTES DE CREARLA?': 'ANYTHING TO FIX BEFORE I CREATE IT?',
    'Ej. el segundo día son 4 series, no 3; el último ejercicio es en polea':
      'E.g. the second day is 4 sets, not 3; the last exercise is on the cable',
    'Volver a leerla con esto en cuenta': 'Read it again with this in mind',
    'Crear esta rutina': 'Create this routine',
    'Se guarda en tus rutinas y desde ahí puedes editarla, ponerle los días y pedirle al entrenador que la analice.':
      'It is saved in your routines, and from there you can edit it, set its days and ask the coach to analyse it.',
    'Todos los ejercicios de esta rutina piden':
      'Every exercise in this routine asks for',
    '{ajenos} de los {total} ejercicios piden':
      '{ajenos} of the {total} exercises ask for',
    'Pide más material del que tienes marcado':
      'It asks for more equipment than you have set',
    '{cuantos} material que «{donde}» no contempla. La he copiado tal cual, que para eso la traes, pero si vas a entrenarla cambia dónde entrenas o no te va a cuadrar.':
      '{cuantos} equipment that «{donde}» does not cover. I copied it as it is, which is why you brought it, but if you are going to train it, change where you train or it will not add up.',
    'Cambiar dónde entreno': 'Change where I train',
    'Necesita el entrenador con IA para leer la hoja':
      'It needs the AI coach to read the sheet',
    'Escribe qué hay que corregir': 'Write what needs fixing',
    'Crear la rutina': 'Create the routine',
    'Se crea {n} rutina en tus rutinas. A partir de ahí es tuya y la editas como cualquier otra.':
      '{n} routine is created in your routines. From then on it is yours and you edit it like any other.',
    'Se crean {n} rutinas en tus rutinas. A partir de ahí son tuyas y las editas como cualquier otra.':
      '{n} routines are created in your routines. From then on they are yours and you edit them like any other.',
    'Los días que traía el papel se respetan si los tienes libres; si no, entra sin día y se lo pones tú.':
      'The days on the sheet are kept if you have them free; if not, it comes in without a day and you set it yourself.',

    /* ---------- Cuentas ---------- */
    'Entra en tu cuenta para administrar.': 'Sign in to your account to administer.',
    'La función «admin» no está desplegada en tu proyecto de Supabase.':
      'The «admin» function is not deployed in your Supabase project.',
    'No se pudo preguntar al servidor.': 'The server could not be asked.',
    'Esta pantalla es para quien administra el proyecto. Tu cuenta no lo es.':
      'This screen is for whoever administers the project. Your account is not one.',
    'Mientras no conteste, la entrada de Cuentas no aparece en Perfil. No es que hayas dejado de administrar.':
      'While it does not answer, the Accounts entry does not show under Profile. It is not that you stopped being an administrator.',
    'Las personas que pueden entrar en tu proyecto. Cada una ve solo sus datos y tú no ves los suyos: eso lo garantiza la base de datos, no esta pantalla.':
      'The people who can sign in to your project. Each one sees only their own data and you do not see theirs: the database guarantees that, not this screen.',
    'Pidiendo la lista…': 'Asking for the list…',
    'No he podido leer las cuentas': 'I could not read the accounts',
    'Solo estás tú': 'It is just you',
    'Todavía no hay ninguna cuenta aparte de la tuya. Crea una con «Nueva» y dale el correo y la contraseña a quien la vaya a usar.':
      'There are no accounts besides yours yet. Create one with «New» and give the email and password to whoever will use it.',
    '(sin correo)': '(no email)',
    'tu cuenta': 'your account',
    'Gestionar {correo}': 'Manage {correo}',
    'Puede entrar': 'Can sign in',
    'Desactivada': 'Deactivated',
    'entró {cuando}': 'signed in {cuando}',
    'no ha entrado nunca': 'has never signed in',
    'Alta {fecha}': 'Joined {fecha}',
    'TÚ': 'YOU',
    'cuenta': 'account',
    'cuentas': 'accounts',
    'puede entrar': 'can sign in',
    'pueden entrar': 'can sign in',
    'desactivada': 'deactivated',
    'desactivadas': 'deactivated',
    'Cuenta nueva': 'New account',
    'Se crea con el correo y la contraseña que le pongas, y ya puede entrar. Dile que la cambie cuando entre.':
      'It is created with the email and password you set, and it can sign in right away. Tell them to change it once they are in.',
    'Correo': 'Email',
    'Contraseña para empezar': 'Starter password',
    'Inventar una': 'Make one up',
    'Ocho caracteres o más': 'Eight characters or more',
    'Se la tienes que dar tú por donde quieras: la app no manda correos. Y no la escribas en un sitio donde quede guardada.':
      'You have to pass it on however you like: the app sends no emails. And do not write it anywhere it gets stored.',
    'Escribe el correo': 'Write the email',
    'La contraseña necesita 8 caracteres o más':
      'The password needs 8 characters or more',
    'Creando…': 'Creating…',
    'Cuenta creada para {correo}': 'Account created for {correo}',
    'Esa cuenta ya no está': 'That account is gone',
    'Cuenta': 'Account',
    'Puede entrar con normalidad': 'Can sign in normally',
    'Desactivada: no puede entrar, pero sus datos siguen ahí':
      'Deactivated: cannot sign in, but their data is still there',
    'Alta': 'Joined',
    'Última entrada': 'Last sign-in',
    'Desactivar la cuenta': 'Deactivate the account',
    'Volver a activarla': 'Activate it again',
    'Deja de poder entrar. Sus datos se quedan donde están y vuelve todo al activarla.':
      'They can no longer sign in. Their data stays where it is and it all comes back when you activate it.',
    'Podrá entrar otra vez con su correo y su contraseña de siempre.':
      'They will be able to sign in again with their usual email and password.',
    'Borrar la cuenta y sus datos': 'Delete the account and its data',
    'No se puede deshacer: se va la cuenta y con ella todo lo que tenga guardado.':
      'It cannot be undone: the account goes and everything stored with it goes too.',
    'Un momento…': 'One moment…',
    'Cuenta desactivada': 'Account deactivated',
    'Cuenta activada': 'Account activated',
    'Borrar {que}': 'Delete {que}',
    'esta cuenta': 'this account',
    'Se va la cuenta y todo lo que tenga guardado: sus rutinas, sus entrenamientos y su historial. No hay vuelta atrás.':
      'The account goes and everything stored with it: their routines, their workouts and their history. There is no going back.',
    'Cuenta borrada': 'Account deleted',

    /* ---------- Las rutinas de arranque ---------- */
    'Full Body 3 días': 'Full Body 3 days',
    'Fuerza general': 'General strength',
    'Tres sesiones por semana en días alternos (lunes, miércoles, viernes). La mejor opción para empezar: cada músculo se trabaja tres veces por semana.':
      'Three sessions a week on alternate days (Monday, Wednesday, Friday). The best way to start: every muscle is worked three times a week.',
    'Push (empuje)': 'Push',
    'Hipertrofia': 'Hypertrophy',
    'Día de empuje del clásico Push / Pull / Legs: pecho, hombro y tríceps.':
      'The push day of the classic Push / Pull / Legs: chest, shoulders and triceps.',
    'Pull (tracción)': 'Pull',
    'Día de tracción: espalda y bíceps.': 'Pull day: back and biceps.',
    'Legs (pierna)': 'Legs',
    'Día de pierna completo: cuádriceps, isquios, glúteo y gemelo.':
      'A full leg day: quads, hamstrings, glutes and calves.',
    'Fuerza e hipertrofia': 'Strength and hypertrophy',
    'Mitad superior del clásico Torso / Pierna, dos veces por semana.':
      'The upper half of the classic Upper / Lower, twice a week.',
    'Mitad inferior del clásico Torso / Pierna, dos veces por semana.':
      'The lower half of the classic Upper / Lower, twice a week.',
    'En casa sin material': 'At home with no equipment',
    'Mantenimiento': 'Maintenance',
    'Solo peso corporal. Ideal para viajes o días sin gimnasio. Las repeticiones de plancha son segundos.':
      'Bodyweight only. Ideal for travelling or days without a gym. The plank reps are seconds.',
    'Fuerza 5x5': 'Strength 5x5',
    'Fuerza máxima': 'Maximal strength',
    'Los tres grandes básicos con series pesadas de 5. Sube 2,5 kg cada vez que completes todas las series.':
      'The three big lifts with heavy sets of 5. Add 2.5 kg every time you complete all the sets.',
    'Estiramiento completo': 'Full stretch',
    'Flexibilidad': 'Flexibility',
    'Para después de entrenar, con el músculo caliente. Las repeticiones son segundos y las dos series son un lado cada una. Sin rebotes: se entra hasta notar tensión, no dolor, y se respira.':
      'For after training, with the muscle warm. The reps are seconds and the two sets are one side each. No bouncing: go in until you feel tension, not pain, and keep breathing.',
    'Movilidad para calentar': 'Mobility to warm up',
    'Calentamiento': 'Warm-up',
    'Diez minutos antes de tocar una barra. Movimiento suave y de recorrido creciente, sin quedarse quieto en ninguna posición: esto es para despertar la articulación, no para ganar flexibilidad.':
      'Ten minutes before you touch a bar. Gentle movement through a growing range, never holding a position: this is to wake the joint up, not to gain flexibility.',
    'Cuello y espalda de oficina': 'Office neck and back',
    'Terapia': 'Therapy',
    'Para la espalda cargada de estar sentado. Se puede hacer a media tarde y sin cambiarse de ropa. Si algo da un dolor agudo o baja por el brazo o la pierna, se para: eso lo mira un fisioterapeuta, no una app.':
      'For a back stiff from sitting. You can do it mid-afternoon without changing clothes. If anything gives sharp pain or runs down your arm or leg, stop: that is for a physio to look at, not an app.',
    'Rodillo miofascial': 'Foam rolling',
    'Recuperación': 'Recovery',
    'Hace falta un rodillo de espuma. Se rueda despacio y, al dar con un punto sensible, se para ahí y se respira hasta que afloja. No lleva zona lumbar a propósito: ahí el rodillo no tiene nada donde apoyar y se acaba forzando la columna.':
      'You need a foam roller. Roll slowly and, when you hit a tender spot, stop there and breathe until it lets go. It leaves out the lower back on purpose: there the roller has nothing to rest on and you end up straining your spine.',
    'Pilates: centro fuerte': 'Pilates: strong centre',
    'Core y control': 'Core and control',
    'Trabajo de suelo inspirado en pilates: control, respiración y lumbar pegada al suelo. Mejor pocas repeticiones bien hechas que muchas deprisa. En plancha y puente las repeticiones son segundos.':
      'Floor work inspired by pilates: control, breathing and lower back pressed to the floor. A few reps done well beat many done fast. In the plank and the bridge the reps are seconds.',
    'Pilates: espalda y cadera': 'Pilates: back and hips',
    'Espalda sana': 'Healthy back',
    'La otra mitad: cadena posterior y cadera, en el suelo y sin material. Va bien en los días que no se entrena fuerte, o el día después de pierna.':
      'The other half: posterior chain and hips, on the floor and with no equipment. It works well on days you do not train hard, or the day after legs.',
    'Usar': 'Use',
    'Rutina copiada. Ya puedes editarla.': 'Routine copied. You can edit it now.',

    /* ---------- La portada y el arranque ---------- */
    'Dispositivo enlazado. Entra con tu correo.':
      'Device linked. Sign in with your email.',
    'Ese enlace de configuración no es válido.': 'That setup link is not valid.',
    'Listo. Puedes crear la cuenta cuando quieras desde Perfil.':
      'Done. You can create the account whenever you like from Profile.',
    'lo de hoy': 'today\'s session',
    '{lista} y {ultimo}': '{lista} and {ultimo}',
    'Mixta': 'Mixed',
    'Sin ejercicios': 'No exercises',
    'Rutina sin nombre': 'Unnamed routine',
    'Hoy · hecho': 'Today · done',
    '{rutina} se queda sin día': '{rutina} is left without a day',
    'Cronómetro en marcha': 'Timer running',
    'Tú tienes la {v}. Toca para actualizar; tus datos no se tocan.':
      'You have {v}. Tap to update; your data is not touched.',
    'Actualizando…': 'Updating…',
    'Añade ejercicios a la rutina antes de entrenar':
      'Add exercises to the routine before training',
    '«{que}» añadida al entrenamiento en curso':
      '«{que}» added to the workout in progress',
    'Rutina': 'Routine',
    'Ya hay un entrenamiento en curso': 'There is already a workout in progress',
    'Si empiezas otro, se descartará el que tienes a medias.':
      'If you start another, the half-finished one is discarded.',
    'Empezar de nuevo': 'Start again',
    'Hay una versión nueva': 'There is a new version',
    'Se instala sola en un momento. Tus datos no se tocan.':
      'It installs itself in a moment. Your data is not touched.',
    'Recarga cuando termines. Tus datos no se tocan.':
      'Reload when you are done. Your data is not touched.',
    'Actualizar ya': 'Update now',
    'Ya estás en la versión nueva': 'You are on the new version',
    'Spotify conectado. Ya puedes activar el reproductor.':
      'Spotify connected. You can turn the player on now.',
    'Objetivo cumplido: {que}': 'Goal achieved: {que}',
    'Objetivo cumplido': 'Goal achieved',
    'Actualizado desde otro dispositivo': 'Updated from another device',
    'No se pudo descargar el catálogo de ejercicios. Comprueba tu conexión.':
      'The exercise catalogue could not be downloaded. Check your connection.',

    /* ---------- Los planes de rutinas ---------- */
    'Dejar de ser el plan principal': 'Stop being the main plan',
    'Ahora manda este: en «hoy» solo salen sus rutinas.':
      'This one is in charge: only its routines show under «today».',
    'Usar este como plan principal': 'Use this as the main plan',
    'En «hoy» solo saldrán las suyas. Los demás siguen aquí.':
      'Only its routines will show under «today». The others stay here.',
    'Revisar el plan con IA': 'Review the plan with AI',
    'Lee los {n} días juntos: el reparto entre músculos, lo que se repite y lo que falta.':
      'It reads the {n} days together: the split across muscles, what repeats and what is missing.',
    'Duplicar el plan entero': 'Duplicate the whole plan',
    'Una copia con sus rutinas, para probar cambios sin tocar este.':
      'A copy with its routines, to try changes without touching this one.',
    'Compartir el plan': 'Share the plan',
    'Un enlace con las {n} rutinas dentro.': 'A link with the {n} routines inside.',
    'Borrar el plan entero': 'Delete the whole plan',
    '{n} rutina. No se puede deshacer.': '{n} routine. It cannot be undone.',
    '{n} rutinas. No se puede deshacer.': '{n} routines. It cannot be undone.',
    'Revisar esta rutina con IA': 'Review this routine with AI',
    'Colócalas con las flechas o bórralas con la papelera':
      'Place them with the arrows or delete them with the bin',
    'esta rutina': 'this routine',
    'Se quita de tu lista. Los entrenamientos que ya hiciste con ella se conservan en tu historial.':
      'It goes from your list. The workouts you already did with it stay in your history.',
    'Rutina borrada': 'Routine deleted',
    'Plan principal: {que}': 'Main plan: {que}',
    'Ya no hay plan principal': 'There is no main plan now',
    'Duplicar rutina': 'Duplicate routine',
    'Copias {rutina} con sus {ejercicios}, series y descansos. La original no se toca.':
      'You copy {rutina} with its {ejercicios}, sets and rests. The original is not touched.',
    'A QUÉ PLAN VA': 'WHICH PLAN IT GOES TO',
    'Plan nuevo': 'New plan',
    'Nombre del plan nuevo': 'Name of the new plan',
    'QUÉ DÍA LA HAGO': 'WHICH DAY I DO IT',
    'Puedes dejarla sin día y ponérselo luego. Si le das un día que ya tiene otra rutina, tendrás dos para ese día y la portada solo puede enseñar una.':
      'You can leave it without a day and set one later. If you give it a day another routine already has, you will have two for that day and the home screen can only show one.',
    'Ponle nombre al plan nuevo': 'Give the new plan a name',
    'Duplicada en «{que}»': 'Duplicated into «{que}»',
    'Duplicar «{que}»': 'Duplicate «{que}»',
    'Se copia {n} rutina con sus mismos días. El plan original se queda como está.':
      '{n} routine is copied with the same days. The original plan stays as it is.',
    'Se copian las {n} rutinas con sus mismos días. El plan original se queda como está.':
      'The {n} routines are copied with the same days. The original plan stays as it is.',
    'CÓMO SE LLAMA LA COPIA': 'WHAT THE COPY IS CALLED',
    'Tendrás dos rutinas para cada día —la del plan viejo y la del nuevo—. Borra el que no uses cuando decidas, o quítale los días al que dejes aparcado.':
      'You will have two routines for each day —the old plan’s and the new one’s—. Delete the one you do not use once you decide, or take the days off whichever you park.',
    'Duplicar las {n}': 'Duplicate all {n}',
    'Ponle un nombre distinto al original':
      'Give it a different name from the original',
    'Plan «{que}» creado': 'Plan «{que}» created',
    'Renombrar plan': 'Rename plan',
    'Se cambia en la {n} rutina del plan. Los días y los ejercicios no se tocan.':
      'It changes on the plan’s {n} routine. The days and the exercises are not touched.',
    'Se cambia en las {n} rutinas del plan. Los días y los ejercicios no se tocan.':
      'It changes on the plan’s {n} routines. The days and the exercises are not touched.',
    'Lo verás aquí, en el banner del entrenamiento en curso y en tu historial.':
      'You will see it here, on the workout-in-progress banner and in your history.',
    'Ya tienes un plan con ese nombre': 'You already have a plan with that name',
    'Ahora se llama «{que}»': 'It is now called «{que}»',
    'Renombrar rutina': 'Rename routine',
    '{rutina} — ahora está en el plan «{plan}». El día se mantiene delante solo.':
      '{rutina} — it is currently in the «{plan}» plan. The day stays in front on its own.',
    'A QUÉ PLAN PERTENECE': 'WHICH PLAN IT BELONGS TO',
    'Si le pones un nombre distinto al de sus compañeras, esta rutina se va sola a un plan nuevo.':
      'If you give it a different name from its siblings, this routine goes off into a new plan on its own.',
    'Ahora está en «{que}»': 'It is now in «{que}»',
    'Se va esta {n} rutina y el plan desaparece de tu lista.':
      'This {n} routine goes and the plan disappears from your list.',
    'Se van estas {n} rutinas y el plan desaparece de tu lista.':
      'These {n} routines go and the plan disappears from your list.',
    'Los {n} entrenamientos que ya hiciste con ellas se quedan en tu historial: esto no borra nada de Progreso.':
      'The {n} workouts you already did with them stay in your history: this deletes nothing from Progress.',
    'Tu historial de entrenamientos no se toca.':
      'Your workout history is not touched.',
    'Borrar las {n}': 'Delete all {n}',
    'Dejarlo como está': 'Leave it as it is',
    'Plan «{que}» borrado': 'Plan «{que}» deleted',
    'No hay rutinas repetidas': 'There are no duplicate routines',
    'sin fecha': 'no date',
    'Rutinas repetidas': 'Duplicate routines',
    'Tienes {n} rutina repetida: mismo plan y mismo día que otra. Se va esta y se queda la más reciente.':
      'You have {n} duplicate routine: same plan and same day as another. This one goes and the most recent stays.',
    'Tienes {n} rutinas repetidas: mismo plan y mismo día que otra. Se van estas y se queda la más reciente de cada una.':
      'You have {n} duplicate routines: same plan and same day as another. These go and the most recent of each stays.',
    'Tu historial de entrenamientos no se toca: lo que hiciste con ellas se queda en Progreso.':
      'Your workout history is not touched: what you did with them stays in Progress.',
    'Borrar las {n} repetidas': 'Delete the {n} duplicates',
    '{n} rutina borrada': '{n} routine deleted',
    '{n} rutinas borradas': '{n} routines deleted',
    'Ninguna rutina tiene día asignado': 'No routine has a day assigned',
    'Correr el plan de día': 'Shift the plan by a day',
    'Hoy no has podido ir, pero la semana no se tira: se empuja. Lo del lunes pasa al martes, lo del martes al miércoles, y así con todo.':
      'You could not go today, but the week is not wasted: it gets pushed along. Monday’s moves to Tuesday, Tuesday’s to Wednesday, and so on.',
    'Correr un día adelante': 'Shift one day forward',
    'Adelantarlo un día en vez de eso': 'Shift it one day back instead',
    'Solo cambia el día en el que te toca cada rutina. Los ejercicios, las series y tu historial no se tocan.':
      'It only changes which day each routine falls on. The exercises, the sets and your history are not touched.',
    '{n} rutina corrida': '{n} routine shifted',
    '{n} rutinas corridas': '{n} routines shifted',
    'un día adelante': 'one day forward',
    'un día atrás': 'one day back',

    /* ---------- El catálogo de ejercicios ---------- */
    'Ningún ejercicio coincide entre los que puedes hacer {donde}.':
      'No exercise matches among the ones you can do {donde}.',
    'Ningún ejercicio coincide.': 'No exercise matches.',
    'Limpiar filtros': 'Clear filters',
    'Buscar en todo el catálogo': 'Search the whole catalogue',
    'No hay ejercicios para este filtro.': 'There are no exercises for this filter.',
    'Mostrando solo lo que puedes hacer donde entrenas':
      'Showing only what you can do where you train',
    'No hay ejercicios de esa zona con tu material':
      'There are no exercises for that area with your equipment',
    'Sesión añadida al entrenamiento en curso':
      'Session added to the workout in progress',
    'Sesión de {zona} generada automáticamente.':
      '{zona} session generated automatically.',
    'Traduciendo…': 'Translating…',
    'Instrucciones traducidas': 'Instructions translated',
    'Traducir': 'Translate',
    'No se pudo traducir ahora. Prueba más tarde.':
      'It could not be translated now. Try later.',
    'Añadir «{que}»': 'Add «{que}»',
    'Elige a qué rutina quieres añadirlo.': 'Pick which routine to add it to.',
    '{n} ej.': '{n} ex.',
    'Crear rutina nueva': 'Create a new routine',
    'Nueva rutina': 'New routine',
    'Añadido a «{que}»': 'Added to «{que}»',
    'rutina': 'routine',
    'Sin resultados': 'No results',

    /* ---------- El editor de una rutina ---------- */
    'Rutina no encontrada.': 'Routine not found.',
    'Editar rutina': 'Edit routine',
    'NOMBRE DE LA RUTINA': 'ROUTINE NAME',
    'El que te sirva a ti para reconocerla de un vistazo: «Pierna dura», «Lunes de espalda», «La corta de casa»…':
      'Whatever helps you recognise it at a glance: «Hard legs», «Monday back», «The short one at home»…',
    'NOTAS (opcional)': 'NOTES (optional)',
    'Objetivo, progresión, recordatorios…': 'Goal, progression, reminders…',
    'DÍAS DE LA SEMANA': 'DAYS OF THE WEEK',
    'Apagado, la rutina se queda en su zona{zona} y avisa si metes un ejercicio de otra. Enciéndelo para mezclar tren superior e inferior.':
      'Off, the routine stays in its area{zona} and warns you if you put in an exercise from another. Turn it on to mix upper and lower body.',
    'Ejercicios ({n})': 'Exercises ({n})',
    'Te faltan {n} para llegar al mínimo de {min}.':
      'You are {n} short of the minimum of {min}.',
    'Puedes añadir los que quieras y cambiar cualquiera por otro. Quitar, hasta dejarla en {min}.':
      'You can add as many as you like and swap any of them. You can remove down to {min}.',
    'Reps': 'Reps',
    'Descanso (s)': 'Rest (s)',
    'Esta rutina todavía no tiene ejercicios.': 'This routine has no exercises yet.',
    'Guardar y entrenar ahora': 'Save and train now',
    'Guárdala antes de pasarla por la IA': 'Save it before running it past the AI',
    'Esa propuesta ya no se puede aplicar.': 'That proposal can no longer be applied.',
    'Se sustituyen los {ahora} ejercicios de ahora por los {luego} que propone. Lo que ya entrenaste sigue en tu historial.':
      'The {ahora} current exercises are replaced by the {luego} it proposes. What you already trained stays in your history.',
    'Reemplazar': 'Replace',
    'Rutina rehecha con {n} ejercicios': 'Routine rebuilt with {n} exercises',
    'Una rutina no baja de {n} ejercicios. Cámbialo por otro en vez de quitarlo.':
      'A routine does not go below {n} exercises. Swap it for another instead of removing it.',
    'Cambiado por {que}': 'Swapped for {que}',
    'Eso es de otra zona': 'That belongs to another area',
    '«{que}» no es de {zona}. Puedo marcar la rutina como mixta y meterlo igual.':
      '«{que}» is not {zona}. I can mark the routine as mixed and put it in anyway.',
    'esta zona': 'this area',
    'Marcar mixta y añadir': 'Mark as mixed and add',
    'Rutina guardada': 'Routine saved',
    'Rutina duplicada': 'Routine duplicated',
    'Se eliminará «{que}». Los entrenamientos ya registrados se conservan.':
      '«{que}» will be deleted. The workouts already logged are kept.',

    /* ---------- La auditoría de una rutina ---------- */
    'Con {dias} te propongo: {split}': 'With {dias} I suggest: {split}',
    'Elige al menos un día.': 'Pick at least one day.',
    'Auditando esta rutina…': 'Auditing this routine…',
    'Que la IA revise esta rutina': 'Have the AI review this routine',
    'La lee con tu perfil y tu historial delante, le pone nota y propone cambios que aplicas de un toque.':
      'It reads it with your profile and your history in front of it, scores it and proposes changes you apply with one tap.',
    'Necesita un proveedor de IA con su clave, en Ajustes → Bóveda de claves.':
      'It needs an AI provider with its key, under Settings → Key vault.',
    'Nota que le pone a esta rutina tal y como está.':
      'The score it gives this routine exactly as it stands.',
    'Los cambios, para aplicarlos de uno en uno': 'The changes, to apply one at a time',
    'Cambiar': 'Change',
    '{que} a {n}s': '{que} to {n}s',
    'Se comprueba antes de aplicarlo: si el ejercicio no existe, no cabe con tu material o choca con tus limitaciones, se descarta. Lo que apliques se guarda en la rutina al momento.':
      'It is checked before being applied: if the exercise does not exist, does not fit your equipment or clashes with your limitations, it is dropped. Whatever you apply is saved to the routine right away.',
    'Analizar otra vez': 'Analyse again',
    'Con los cambios que acabas de aplicar delante, el dictamen cambia. Cada pulsación es una llamada a la IA.':
      'With the changes you just applied in front of it, the verdict changes. Each press is one AI call.',
    '{que} (choca con tus limitaciones)': '{que} (clashes with your limitations)',
    'Cómo la dejaría él': 'How he would leave it',
    'La rutina entera rehecha, en el orden en que hay que hacerla. Sustituye a la de arriba de una vez.':
      'The whole routine rebuilt, in the order it should be done. It replaces the one above in one go.',
    'descanso {n}s': '{n}s rest',
    'Se ha descartado: {lista}.': 'Dropped: {lista}.',
    'Dejar la rutina así': 'Leave the routine like this',
    'Se reemplazan los ejercicios de esta rutina y se guarda. Tu historial no se toca.':
      'The exercises in this routine are replaced and it is saved. Your history is not touched.',
    'Sesión reordenada': 'Session reordered',
    'Ya no está «{que}» en la rutina.': '«{que}» is no longer in the routine.',
    '{que} pasa al {n}.º': '{que} moves to position {n}',
    'La rutina se quedaría por debajo del mínimo de {n} ejercicios.':
      'The routine would drop below the minimum of {n} exercises.',
    'Fuera {que}': '{que} removed',
    'No encuentro «{que}» en el catálogo.': 'I cannot find «{que}» in the catalogue.',
    '«{que}» no encaja con tus limitaciones.': '«{que}» does not fit your limitations.',
    '«{que}» ya está en la rutina.': '«{que}» is already in the routine.',
    'Pedía «{pedido}»; he puesto {puesto}':
      'It asked for «{pedido}»; I put in {puesto}',
    'Entra {que}': '{que} goes in',

    /* ---------- Actualizaciones y uso sin internet ---------- */
    'Si hay una versión nueva, y qué llevas descargado para usar la app sin internet.':
      'Whether there is a new version, and what you have downloaded to use the app offline.',
    'Tu versión': 'Your version',
    'Comprobando si hay una nueva…': 'Checking whether there is a new one…',
    '¿Algo va raro?': 'Something off?',
    'Borra los archivos que hayan quedado mezclados de dos versiones y vuelve a bajar la app. Tus datos no se tocan.':
      'It deletes any files left mixed from two versions and downloads the app again. Your data is not touched.',
    'Descarga las imágenes de los ejercicios y la app funciona entera sin conexión: en el gimnasio sin cobertura, en el metro o sin datos.':
      'Download the exercise images and the whole app works offline: in a gym with no signal, on the underground, or with no data.',
    'Comprobando lo que ya tienes guardado…': 'Checking what you already have saved…',
    'Solo los ejercicios que usas. Lo más rápido.':
      'Only the exercises you use. The fastest option.',
    'Los ejercicios principales': 'The main exercises',
    'Los más usados del catálogo': 'The most used ones in the catalogue',
    'El catálogo completo': 'The whole catalogue',
    'Todo. Ocupa bastante y tarda un rato.':
      'Everything. It takes up a fair amount of space and a while to do.',
    'Liberar espacio': 'Free up space',
    'Borra las imágenes guardadas. Se vuelven a bajar solas con internet.':
      'It deletes the saved images. They download again by themselves when you are online.',
    '{n} imágenes guardadas (~{mb} MB). Esos ejercicios ya funcionan sin internet.':
      '{n} images saved (~{mb} MB). Those exercises already work offline.',
    'Todavía no has guardado ninguna imagen.': 'You have not saved any images yet.',
    'Este navegador no permite guardar contenido sin conexión.':
      'This browser does not allow saving content for offline use.',
    'Se borrarán las imágenes guardadas. La app seguirá funcionando con internet.':
      'The saved images will be deleted. The app will keep working online.',
    'Liberar': 'Free up',
    'Espacio liberado': 'Space freed up',
    'Aún no tienes rutinas que descargar': 'You have no routines to download yet',
    'Nada que descargar': 'Nothing to download',
    'Descargar el catálogo completo': 'Download the whole catalogue',
    '{n} imágenes, unos {mb} MB. Mejor con wifi.':
      '{n} images, about {mb} MB. Best on wifi.',
    'Descargando {hechas} de {total}…': 'Downloading {hechas} of {total}…',
    'Descarga terminada ({n} no se pudieron guardar)':
      'Download finished ({n} could not be saved)',
    'Listo: ya puedes entrenar sin internet': 'Done: you can train offline now',
    'No se pudo completar la descarga': 'The download could not be completed',
    'Esta es la que llevas. No he podido preguntar si hay otra: hace falta conexión.':
      'This is the one you have. I could not ask whether there is another: that needs a connection.',
    'Recién instalada. Es la última que hay publicada.':
      'Freshly installed. It is the latest one published.',
    'Volver a comprobar': 'Check again',
    'Estás en la última versión.': 'You are on the latest version.',
    'Nueva versión. Tú llevas la {v}.': 'New version. You have {v}.',
    'Actualizar ahora': 'Update now',

    /* ---------- Los ajustes que quedaban ---------- */
    'Ahora solo marcarás las series como hechas':
      'From now on you will just tick sets as done',
    'Ahora marcas el ejercicio entero de un toque':
      'From now on you tick the whole exercise with one tap',
    'Ahora anotarás peso y repeticiones': 'From now on you will log weight and reps',
    'Lo irás marcando': 'You will tick it off',
    'Sin casillas de por medio': 'No boxes in the way',
    'Memoria de frases borrada': 'Phrase memory cleared',
    'Copia descargada': 'Backup downloaded',
    'Importar copia': 'Import backup',
    'Se reemplazarán las rutinas y el historial actuales por los del archivo.':
      'Your current routines and history will be replaced by the ones in the file.',
    'Datos importados': 'Data imported',
    'El archivo no es válido': 'The file is not valid',
    'Borrar todo': 'Delete everything',
    'Se eliminarán rutinas, entrenamientos y ajustes de este dispositivo. No se puede deshacer.':
      'Routines, workouts and settings will be deleted from this device. It cannot be undone.',
    'Datos borrados': 'Data deleted',

    /* ---------- Mi cuenta y la sincronización ---------- */
    'Tu cuenta': 'Your account',
    'Sesión abierta en este dispositivo': 'Signed in on this device',
    'Qué se sincroniza': 'What gets synced',
    'Entrenamientos': 'Workouts',
    'Menús de comida': 'Meal plans',
    'Perfil y hábitos': 'Profile and habits',
    'Completo': 'Complete',
    'A medias': 'Half done',
    'Claves de IA y Spotify': 'AI and Spotify keys',
    'Incluidas': 'Included',
    'Solo en este dispositivo': 'This device only',
    'No hay que pulsar nada: lo que cambies sube solo unos segundos después, y lo que cambies en otro dispositivo baja al abrir la app, al volver a ella y cada minuto y medio mientras la tengas delante. Si falla, se reintenta solo.':
      'There is nothing to press: what you change goes up a few seconds later on its own, and what you change on another device comes down when you open the app, when you come back to it, and every minute and a half while you have it in front of you. If it fails, it retries by itself.',
    'Cambiar contraseña': 'Change password',
    'Poner contraseña': 'Set a password',
    'Ya tienes una: con ella entras en cualquier dispositivo':
      'You already have one: with it you sign in on any device',
    'Sin contraseña solo puedes entrar con enlaces por correo':
      'Without a password you can only sign in with email links',
    'NUEVA CONTRASEÑA': 'NEW PASSWORD',
    'REPÍTELA': 'REPEAT IT',
    'La misma otra vez': 'The same one again',
    'Guardar contraseña': 'Save password',
    'Solo viaja a tu proyecto de Supabase, que la guarda cifrada.':
      'It only travels to your Supabase project, which stores it encrypted.',
    'Cerrar sesión aquí': 'Sign out here',
    'Lo que ya subió se queda en la nube. Este dispositivo deja de sincronizar.':
      'What already went up stays in the cloud. This device stops syncing.',
    'Si algo no cuadra': 'If something does not add up',
    'Traer lo de la nube': 'Bring down what is in the cloud',
    'Reemplaza lo de este dispositivo por lo guardado':
      'Replaces what is on this device with what is stored',
    'Subir lo de este dispositivo': 'Upload what is on this device',
    'Reemplaza lo de la nube por lo de aquí':
      'Replaces what is in the cloud with what is here',
    'Úsalos solo si la sincronización automática se ha quedado con la versión equivocada.':
      'Only use these if automatic syncing has ended up with the wrong version.',
    'hace un momento': 'a moment ago',
    'hace {n} min': '{n} min ago',
    'hace {n} h': '{n} h ago',
    'Subiendo tus cambios…': 'Uploading your changes…',
    'Buscando cambios de otros dispositivos…':
      'Looking for changes from other devices…',
    'Cambios pendientes de subir': 'Changes waiting to upload',
    'No se pudo sincronizar': 'It could not sync',
    'Todo al día': 'All up to date',
    'Esperando el primer cambio': 'Waiting for the first change',
    'Última sincronización completa {cuando}.': 'Last full sync {cuando}.',
    'Comprobar': 'Check',
    'Hay cambios de este dispositivo esperando a subir. Se reintenta solo.':
      'There are changes from this device waiting to upload. It retries by itself.',
    'Ya estaba todo al día': 'It was all up to date already',
    'Tus cambios están en la nube': 'Your changes are in the cloud',
    'Comprobado hace un momento': 'Checked a moment ago',
    'Datos actualizados': 'Data updated',
    'Activar la sincronización': 'Turn on syncing',
    'Se hace una vez y es gratis. Guarda tus datos en tu propia base de datos.':
      'You do it once and it is free. It stores your data in your own database.',
    'Entra en {enlace}, crea una cuenta y pulsa {boton}. Elige cualquier nombre y contraseña.':
      'Go to {enlace}, create an account and press {boton}. Pick any name and password.',
    'Cuando termine, ve a <b>Project Settings → API</b> y copia la <b>Project URL</b> y la clave <b>anon public</b>.':
      'When it finishes, go to <b>Project Settings → API</b> and copy the <b>Project URL</b> and the <b>anon public</b> key.',
    'Ve a <b>SQL Editor</b>, pega el bloque de abajo y pulsa <b>Run</b>. Crea la tabla donde se guardan tus datos, protegida para que solo tú puedas verlos.':
      'Go to <b>SQL Editor</b>, paste the block below and press <b>Run</b>. It creates the table your data is stored in, protected so only you can see it.',
    'Ve a <b>Authentication → URL Configuration</b> y añade esta dirección en <b>Redirect URLs</b>:':
      'Go to <b>Authentication → URL Configuration</b> and add this address under <b>Redirect URLs</b>:',
    'CLAVE ANON PUBLIC': 'ANON PUBLIC KEY',
    'Guardar y continuar': 'Save and continue',
    'Volver a la conexión que trae la app':
      'Go back to the connection the app ships with',
    'Configuración guardada. Ahora entra con tu correo.':
      'Settings saved. Now sign in with your email.',
    'Volver a la conexión de la app': 'Go back to the app’s connection',
    'Se borrará la configuración propia de este dispositivo y su sesión. Tus datos locales y los de la nube no se tocan.':
      'This device’s own configuration and its session will be deleted. Your local data and your cloud data are not touched.',
    'Desconectado': 'Disconnected',
    'Las cuentas las crea quien administra':
      'Accounts are created by whoever administers',
    'Pídele que te dé de alta con tu correo y te pase una contraseña. Luego entras aquí arriba con esos datos y ya puedes cambiarla desde Mi cuenta.':
      'Ask them to sign you up with your email and give you a password. Then you sign in above with those details and can change it from My account.',
    'Crear tu base de datos': 'Create your database',
    'Es gratis y se hace una sola vez. Tus datos quedan en tu propia cuenta de Supabase, no en un servidor mío ni de nadie.':
      'It is free and you do it once. Your data stays in your own Supabase account, not on a server of mine or anyone else’s.',
    'Entra en {enlace}, crea una cuenta y pulsa {boton}. Nombre y contraseña, los que quieras; elige la región más cercana.':
      'Go to {enlace}, create an account and press {boton}. Any name and password you like; pick the nearest region.',
    'Cuando termine, ve a <b>SQL Editor</b>, pega el bloque que te da la bóveda y pulsa <b>Run</b>. Crea la tabla de tus datos.':
      'When it finishes, go to <b>SQL Editor</b>, paste the block the vault gives you and press <b>Run</b>. It creates your data table.',
    'En <b>Authentication → URL Configuration</b>, pon esta dirección en <b>Site URL</b> y en <b>Redirect URLs</b>.':
      'Under <b>Authentication → URL Configuration</b>, put this address in <b>Site URL</b> and in <b>Redirect URLs</b>.',
    'En <b>Project Settings → API Keys</b> copia la <b>Publishable key</b>, y la <b>Project URL</b> de <b>Data API</b>.':
      'Under <b>Project Settings → API Keys</b> copy the <b>Publishable key</b>, and the <b>Project URL</b> from <b>Data API</b>.',
    'Pega los dos valores en la bóveda y vuelve aquí a entrar con tu correo.':
      'Paste both values into the vault and come back here to sign in with your email.',
    'Abrir el paso a paso completo': 'Open the full step by step',
    'Ese enlace no es válido. Cópialo entero.':
      'That link is not valid. Copy the whole thing.',
    'Dispositivo conectado. Ahora entra con tu correo.':
      'Device connected. Now sign in with your email.',
    'Guardado. Ahora entra con tu correo.': 'Saved. Now sign in with your email.',
    'Enviando…': 'Sending…',
    'Revisa tu correo': 'Check your email',
    'Hemos enviado un enlace de acceso a {correo}. Ábrelo en este mismo dispositivo y entrarás automáticamente.':
      'We have sent a sign-in link to {correo}. Open it on this same device and you will be signed in automatically.',
    'Si no aparece en unos minutos, mira en spam.':
      'If it does not turn up in a few minutes, check your spam.',
    'Entendido': 'Got it',
    'No se pudo enviar el enlace': 'The link could not be sent',
    'Entrando…': 'Signing in…',
    'Datos traídos de la nube': 'Data brought down from the cloud',
    'Datos subidos a la nube': 'Data uploaded to the cloud',
    'Lo que tengas en este dispositivo se reemplaza por lo guardado en la nube.':
      'Whatever is on this device is replaced by what is stored in the cloud.',
    'Lo guardado en la nube se reemplaza por lo que tengas en este dispositivo.':
      'What is stored in the cloud is replaced by whatever is on this device.',
    'Las dos contraseñas no coinciden': 'The two passwords do not match',
    'Guardando…': 'Saving…',
    'Contraseña guardada. Ya puedes entrar con ella en otros dispositivos.':
      'Password saved. You can sign in with it on other devices now.',
    'Sincronizando…': 'Syncing…',
    'Datos actualizados desde la nube': 'Data updated from the cloud',
    'Tus datos están guardados en la nube': 'Your data is stored in the cloud',
    'Cerrar sesión': 'Sign out',
    'Tus datos siguen guardados en la nube y volverán al entrar de nuevo. Elige qué hacer con la copia de este dispositivo.':
      'Your data stays stored in the cloud and comes back when you sign in again. Choose what to do with this device’s copy.',
    'Cerrar y conservarlos aquí': 'Sign out and keep it here',
    'Cerrar y borrarlos de este dispositivo': 'Sign out and delete it from this device',
    'Borrarlos es lo apropiado si el dispositivo no es tuyo o lo va a usar otra persona con su cuenta.':
      'Deleting is the right call if the device is not yours or someone else will use it with their account.',
    'Sesión cerrada y datos borrados': 'Signed out and data deleted',
    'Sesión cerrada': 'Signed out',
    'Ahora estás como {correo}': 'You are now {correo}',
    'Has entrado como {correo}': 'You signed in as {correo}',
    '{n} entrenamiento': '{n} workout',
    '{n} entrenamientos': '{n} workouts',
    'tus claves': 'your keys',
    'Listo: {lista} en este dispositivo': 'Done: {lista} on this device',
    'Entraste, pero no se pudo sincronizar todavía':
      'You signed in, but it could not sync yet',

    /* ---------- La conexión con Spotify ---------- */
    'El Client ID son 32 caracteres. Cópialo del panel de Spotify.':
      'The Client ID is 32 characters long. Copy it from the Spotify panel.',
    'Falta el Client ID de Spotify.': 'The Spotify Client ID is missing.',
    'Este navegador no permite la conexión segura con Spotify. Abre la app en https, no en una copia local.':
      'This browser does not allow a secure connection with Spotify. Open the app over https, not from a local copy.',
    'Fallo interno preparando la conexión con Spotify.':
      'Internal failure while preparing the connection with Spotify.',
    'No se pudo iniciar la conexión con Spotify.':
      'The connection with Spotify could not be started.',
    'La vuelta de Spotify no encaja con ningún intento guardado aquí. Suele pasar cuando se empieza en la app instalada y se vuelve en el navegador, o al revés: cada uno guarda sus datos por separado.':
      'Spotify came back with something that matches no attempt saved here. It usually happens when you start in the installed app and come back in the browser, or the other way round: each one stores its data separately.',
    'La conexión con Spotify se interrumpió por el camino: en este navegador no queda constancia de la petición.':
      'The connection with Spotify was interrupted along the way: this browser has no record of the request.',
    'state recibido: {state}': 'state received: {state}',
    'intentos guardados aquí: {lista}': 'attempts saved here: {lista}',
    '{state} (hace {n} min)': '{state} ({n} min ago)',
    'ninguno': 'none',
    'contexto: {donde}': 'context: {donde}',
    'app instalada': 'installed app',
    'navegador': 'browser',
    'Al canjear el código: {fallo}': 'While redeeming the code: {fallo}',
    'No diste permiso a la app en la pantalla de Spotify.':
      'You did not give the app permission on the Spotify screen.',
    'Spotify no reconoce el Client ID. Cópialo otra vez del panel de desarrollador.':
      'Spotify does not recognise the Client ID. Copy it again from the developer panel.',
    'La dirección de retorno no está dada de alta en tu app de Spotify. Añade {url} en Redirect URIs.':
      'The return address is not registered in your Spotify app. Add {url} under Redirect URIs.',
    'Spotify ha rechazado alguno de los permisos pedidos.':
      'Spotify rejected one of the permissions requested.',
    'Spotify ha rechazado la petición: {porque}':
      'Spotify rejected the request: {porque}',
    'Spotify respondió: {que}': 'Spotify replied: {que}',
    'No se pudo conectar con Spotify.': 'Spotify could not be reached.',
    'Error de autorización.': 'Authorisation error.',
    'Vuelve a conectar Spotify.': 'Connect Spotify again.',
    'Conecta Spotify primero.': 'Connect Spotify first.',
    'Spotify ha tardado demasiado en responder.': 'Spotify took too long to answer.',
    'Sin conexión con Spotify.': 'No connection with Spotify.',
    'Spotify solo permite controlar la reproducción con Premium.':
      'Spotify only allows playback control with Premium.',
    'Esa orden no la admite el aparato donde suena la música.':
      'The device the music is playing on does not accept that command.',
    'Tu conexión con Spotify es anterior a esta función y no incluye el permiso para crear listas. Los permisos no se amplían solos al renovar: hay que reconectar la cuenta una vez.':
      'Your Spotify connection predates this feature and does not include permission to create playlists. Permissions do not widen on their own when the session renews: the account has to be reconnected once.',
    'Spotify no ha autorizado esta acción': 'Spotify did not authorise this action',
    ' (falta el permiso {cual})': ' (the {cual} permission is missing)',
    'Spotify ha rechazado la orden.': 'Spotify rejected the command.',
    'No hay ningún dispositivo de Spotify activo.':
      'There is no active Spotify device.',
    'Error {n}': 'Error {n}',
    'No sé qué es eso.': 'I do not know what that is.',
    'Guarda antes una lista de reproducción.': 'Save a playlist first.',
    'No se pudo buscar.': 'The search could not be run.',
    'No hay ninguna canción sonando.': 'No song is playing.',
    'El reproductor de Spotify no se cargó bien.':
      'The Spotify player did not load properly.',
    'No se pudo cargar el reproductor de Spotify.':
      'The Spotify player could not be loaded.',
    'El reproductor de Spotify tardó demasiado.': 'The Spotify player took too long.',
    'Reproducir dentro de la app requiere Spotify Premium.':
      'Playing inside the app requires Spotify Premium.',
    'La sesión de Spotify caducó. Vuelve a conectar.':
      'The Spotify session expired. Connect again.',
    'El reproductor de Spotify falló.': 'The Spotify player failed.',
    'No se pudo conectar el reproductor.': 'The player could not be connected.',
    'El reproductor no llegó a estar listo.': 'The player never became ready.',
    'No hay canciones que reproducir.': 'There are no songs to play.',
    'No se pudo crear la lista.': 'The playlist could not be created.',
    'Spotify ha creado la lista pero no deja meterle las canciones, así que se ha deshecho.':
      'Spotify created the playlist but will not let the songs in, so it has been undone.',
    'Canción': 'Song',
    'Lista': 'Playlist',
    'Álbum': 'Album',
    'Artista': 'Artist',
    'un álbum': 'an album',
    'una canción': 'a song',
    'un artista': 'an artist',
    'un pódcast': 'a podcast',
    'un episodio': 'an episode',
    'un perfil': 'a profile',
    'canciones': 'songs',
    'listas': 'playlists',
    'álbumes': 'albums',
    'artistas': 'artists',
    'pódcast': 'podcasts',

    /* ---------- La sincronización con Supabase ---------- */
    'La URL debe tener la forma https://xxxxx.supabase.co':
      'The URL has to look like https://xxxxx.supabase.co',
    'Esa clave no parece la publishable ni la anon. Cópiala de Project Settings, API Keys.':
      'That key looks like neither the publishable nor the anon one. Copy it from Project Settings, API Keys.',
    'Falta configurar la sincronización.': 'Sync has not been set up yet.',
    'No se pudo conectar. Revisa tu conexión y la URL del proyecto.':
      'It could not connect. Check your connection and the project URL.',
    'En ese proyecto de Supabase falta la tabla donde van los datos. Ve a Ajustes → Bóveda de claves, copia el SQL que hay bajo la conexión de Supabase y ejecútalo una vez en el SQL Editor de tu proyecto.':
      'That Supabase project is missing the table the data goes into. Go to Settings → Key vault, copy the SQL under the Supabase connection and run it once in your project’s SQL Editor.',
    'Esa clave no vale para este proyecto. Copia otra vez la Publishable key en Project Settings → API Keys.':
      'That key is not valid for this project. Copy the Publishable key again from Project Settings → API Keys.',
    'Ojo: este proyecto tiene cerrado el alta de cuentas nuevas, así que si intentaste registrarte, la cuenta no llegó a crearse. Ábrelo en Supabase (Authentication → Sign In / Providers → Allow new users to sign up), regístrate y vuelve a cerrarlo.':
      'Careful: this project has sign-ups closed, so if you tried to register, the account was never created. Open it in Supabase (Authentication → Sign In / Providers → Allow new users to sign up), register and close it again.',
    'Escribe un correo válido.': 'Type a valid email address.',
    'Supabase solo deja enviar un par de correos por hora en el plan gratuito y ya se han agotado. Entra con contraseña, que no tiene ese límite.':
      'Supabase only allows a couple of emails per hour on the free plan and they are used up. Sign in with a password, which has no such limit.',
    'La contraseña necesita al menos 8 caracteres.':
      'The password needs at least 8 characters.',
    'Cuenta creada. Tu proyecto pide confirmar el correo: ábrelo y pulsa el enlace, o desactiva esa confirmación en Supabase (Authentication, Sign In, Confirm email) para entrar directamente.':
      'Account created. Your project asks you to confirm the email: open it and tap the link, or turn that confirmation off in Supabase (Authentication, Sign In, Confirm email) to sign in straight away.',
    'Ese correo ya tiene cuenta. Usa "Ya tengo contraseña" para entrar.':
      'That email already has an account. Use “I already have a password” to sign in.',
    'Supabase ha limitado los correos por ahora. Desactiva la confirmación por correo en tu proyecto y vuelve a intentarlo.':
      'Supabase has rate-limited emails for now. Turn email confirmation off in your project and try again.',
    'Tu proyecto tiene cerrado el registro de cuentas nuevas. Entra con tu correo y tu contraseña de siempre. Si de verdad quieres otra cuenta, ábrelo en Supabase: Authentication, Sign In, Allow new users to sign up.':
      'Your project has sign-ups closed. Sign in with your usual email and password. If you really want another account, open it in Supabase: Authentication, Sign In, Allow new users to sign up.',
    'No se pudo crear la cuenta.': 'The account could not be created.',
    'Esa ya es tu contraseña actual.': 'That is already your current password.',
    'La contraseña es demasiado corta para tu proyecto.':
      'The password is too short for your project.',
    'No se pudo guardar la contraseña.': 'The password could not be saved.',
    'No se pudo iniciar sesión.': 'Signing in failed.',
    'Correo o contraseña incorrectos. Si creaste la cuenta con el enlace del correo, todavía no tiene contraseña: entra con el enlace en el dispositivo de siempre y pónsela desde la pantalla de cuenta.':
      'Wrong email or password. If you created the account with the email link, it has no password yet: sign in with the link on your usual device and set one from the account screen.',
    'Falta confirmar el correo. Ábrelo y pulsa el enlace, o desactiva esa confirmación en Supabase.':
      'The email still has to be confirmed. Open it and tap the link, or turn that confirmation off in Supabase.',
    'No se pudo abrir la sesión.': 'The session could not be opened.',
    'El enlace no devolvió una sesión.': 'The link did not return a session.',
    'El código no devolvió una sesión.': 'The code did not return a session.',
    'El enlace ha caducado. Pide uno nuevo: solo valen unos minutos y un único uso.':
      'The link has expired. Ask for a new one: they last a few minutes and work only once.',
    'Ese enlace ya se usó. Pide uno nuevo desde la app.':
      'That link has already been used. Ask for a new one from the app.',
    'La dirección de retorno no está autorizada en Supabase. Añádela en Authentication, URL Configuration.':
      'The return address is not allowed in Supabase. Add it under Authentication, URL Configuration.',
    'El enlace no es válido. Pide uno nuevo desde este mismo dispositivo.':
      'The link is not valid. Ask for a new one from this same device.',
    'No se pudo completar el acceso.': 'Signing in could not be completed.',
    'Pega el enlace que te llegó al correo.':
      'Paste the link that arrived in your email.',
    'Eso no parece un enlace. Cópialo entero desde el correo.':
      'That does not look like a link. Copy the whole thing from the email.',
    'Ese enlace no lleva ningún acceso. Copia el del botón del correo.':
      'That link carries no sign-in. Copy the one on the button in the email.',
    'No hay sesión.': 'There is no session.',
    'Tu sesión caducó en este dispositivo. Entra otra vez con tu correo y contraseña; lo que tienes aquí no se pierde.':
      'Your session expired on this device. Sign in again with your email and password; what you have here is not lost.',
    'Entra con tu correo primero.': 'Sign in with your email first.',
    'Configura antes la sincronización.': 'Set up sync first.',
    'faltan datos': 'data is missing',
    'No hay nada guardado en la nube todavía.':
      'There is nothing saved in the cloud yet.',
    'Tu sesión ha caducado. Entra otra vez con tu correo y contraseña.':
      'Your session has expired. Sign in again with your email and password.',
    'Sin conexión ahora mismo. Lo intento solo cuando vuelva.':
      'No connection right now. I will try again on my own when it comes back.',
    'La base de datos rechazó el guardado. Revisa la política de seguridad de la tabla.':
      'The database rejected the save. Check the table’s security policy.',

    /* ---------- La revisión del plan ---------- */
    'sesión {n}': 'session {n}',
    'empuje horizontal': 'horizontal push',
    'empuje vertical': 'vertical push',
    'traccion horizontal': 'horizontal pull',
    'traccion vertical': 'vertical pull',
    'sentadilla': 'squat',
    'bisagra de cadera': 'hip hinge',
    'empujar por delante (press de banca y parecidos)':
      'pushing straight ahead (bench press and the like)',
    'empujar por encima de la cabeza': 'pushing overhead',
    'remar': 'rowing',
    'dominadas o jalones': 'pull-ups or pulldowns',
    'flexión de rodilla con carga': 'loaded knee bend',
    'bisagra de cadera (peso muerto y variantes)': 'hip hinge (deadlift and variants)',
    'tren superior': 'upper body',
    'tren inferior': 'lower body',
    '{que} se queda corto': '{que} is coming up short',
    '{n} músculos por debajo del mínimo': '{n} muscles below the minimum',
    'series directas a la semana: {lista}; por debajo de {min} cuesta que crezcan':
      'direct sets per week: {lista}; below {min} they struggle to grow',
    'Demasiado {que}': 'Too much {que}',
    '{n} músculos pasados de volumen': '{n} muscles over on volume',
    'series directas a la semana: {lista}; por encima de {max} se acumula fatiga sin más músculo':
      'direct sets per week: {lista}; above {max} fatigue piles up with no extra muscle',
    'No hay nada de {patron}': 'There is no {patron} at all',
    'en toda la semana no aparece ningún ejercicio de {que}':
      'not one exercise for {que} shows up all week',
    '{que}, dos veces el mismo día': '{que}, twice on the same day',
    'sale repetido en {donde}': 'it comes up twice in {donde}',
    'Dos básicos pesados el mismo día': 'Two heavy compounds on the same day',
    '{lista} caen juntos en {donde}, y el segundo se hace con la espalda baja ya cargada':
      '{lista} land together in {donde}, and the second one is done with the lower back already loaded',
    '{que} va demasiado tarde': '{que} comes too late',
    '{n} básicos van demasiado tarde': '{n} compounds come too late',
    'en {donde}, {lista}: llegas cansado a lo que más peso mueve':
      'in {donde}, {lista}: you reach the heaviest lifts already tired',
    '{que} es el {n}.º, detrás de {tras}': '{que} is number {n}, behind {tras}',
    '{que} no es de ese día': '{que} does not belong on that day',
    'en {donde} va el {n}.º, y es un movimiento pesado de {suyo} en una sesión de {dia}: se lleva la fuerza que necesitas para lo principal':
      'in {donde} it is number {n}, and it is a heavy {suyo} movement in a {dia} session: it takes the strength you need for the main work',
    '{que}, un solo día a la semana': '{que}, only one day a week',
    '{n} músculos entrenados un solo día': '{n} muscles trained on a single day',
    '{lista}; repartidas en dos días rinden más, porque el estímulo de una sesión dura unas 48 horas':
      '{lista}; split over two days they pay off more, because one session’s stimulus lasts about 48 hours',
    '{mus} {n} series en 1 día': '{mus} {n} sets on 1 day',
    'Los días están muy desiguales': 'The days are very uneven',
    '{corto} lleva {min} ejercicios y {largo} lleva {max}: el corto se queda flojo y el largo se hace eterno':
      '{corto} has {min} exercises and {largo} has {max}: the short one falls flat and the long one drags on',
    'Poco descanso en {que}': 'Too little rest on {que}',
    'Poco descanso en {n} básicos': 'Too little rest on {n} compounds',
    '{lista}; con menos de 120 en un básico pesado la serie siguiente sale corta de fuerza':
      '{lista}; under 120 on a heavy compound the next set comes out short on strength',
    '{que} no lo puedes hacer': 'You cannot do {que}',
    'entrenas {donde} y ese ejercicio necesita material que no tienes':
      'you train {donde} and that exercise needs equipment you do not have',
    '{que} choca con tus limitaciones': '{que} clashes with your limitations',
    'está desaconsejado con lo que has apuntado en tu perfil':
      'it is not advised given what you have put in your profile',
    'los básicos delante y el aislamiento al final, para llegar descansado a lo que más peso mueve':
      'compounds first and isolation last, so you reach the heaviest lifts rested',
    'subir el descanso a {n} segundos, que es lo que necesita un básico pesado para repetir la serie con fuerza':
      'raise the rest to {n} seconds, which is what a heavy compound needs to repeat the set with strength',
    'un segundo día de {mus}, que ahora solo entrenas uno':
      'a second {mus} day, since right now you only train one',
    'no encaja en ese día y no hay otro donde llevarlo, así que sale':
      'it does not fit on that day and there is nowhere else to move it, so it goes',
    'dos básicos pesados el mismo día; no hay otro día libre donde colocarlo, así que sale':
      'two heavy compounds on the same day; there is no other free day to put it on, so it goes',
    'sacarlo de un día que es de la otra mitad del cuerpo':
      'take it off a day that belongs to the other half of the body',
    'sacarlo del día en que choca con el otro básico pesado':
      'take it off the day where it clashes with the other heavy compound',
    'llevarlo a un día que ya trabaja esa zona y llegas descansado':
      'move it to a day that already works that area and where you arrive rested',
    'cubrir el patrón que falta en toda la semana':
      'cover the pattern missing from the whole week',
    'de {antes} a {luego} series para subir {mus}, que está en {tiene} y el mínimo es {min}':
      'from {antes} to {luego} sets to bring up {mus}, which is at {tiene} and the minimum is {min}',
    'subir las series de {mus}, que está en {tiene} y el mínimo es {min}':
      'raise the sets for {mus}, which is at {tiene} and the minimum is {min}',
    'bajar las series de {mus}, que está en {tiene}':
      'lower the sets for {mus}, which is at {tiene}',
    'Es el único que tienes.': 'It is the only one you have.',
    'saca {a} frente a {b}, y la nota sale de los fallos encontrados':
      'it scores {a} against {b}, and the score comes from the faults found',
    'reparte {a} músculos en dos o más días, frente a {b}':
      'it spreads {a} muscles over two or more days, against {b}',
    'no deja ningún músculo por debajo del mínimo y el otro deja {n}':
      'it leaves no muscle below the minimum and the other leaves {n}',
    'tiene los días más parejos (de {a} a {b} ejercicios, frente a {c} a {d})':
      'its days are more even ({a} to {b} exercises, against {c} to {d})',
    'Van muy igualados: quédate con el que te apetezca más entrenar, que es el que acabarás cumpliendo.':
      'They are very close: keep the one you fancy training more, because that is the one you will actually stick to.',
    'Frente a «{otro}», {razones}.': 'Against «{otro}», {razones}.',
    'FALLOS ENCONTRADOS AL REVISAR EL PLAN: ninguno. Las comprobaciones —volumen por músculo, patrones, repeticiones, orden, descansos, material y limitaciones— salen todas limpias.':
      'FAULTS FOUND WHEN REVIEWING THE PLAN: none. The checks —volume per muscle, patterns, repetitions, order, rest, equipment and limitations— all come out clean.',
    'FALLOS ENCONTRADOS AL REVISAR EL PLAN (calculados sobre el propio plan, no son opiniones):':
      'FAULTS FOUND WHEN REVIEWING THE PLAN (worked out from the plan itself, they are not opinions):',
    '[gravedad {n} sobre 3]': '[severity {n} out of 3]',

    /* ---------- La sesión por zona y el asistente del plan ---------- */
    'Favoritos': 'Favourites',
    'Quitar todo': 'Clear all',
    'Entrenar {zona}': 'Train {zona}',
    'Monto una sesión equilibrada entre {musculos}. Empiezo por lo pesado y termino con lo accesorio.':
      'I put together a balanced session across {musculos}. I start with the heavy work and finish with the accessories.',
    '¿Cuánto tiempo tienes?': 'How much time do you have?',
    '¿Con qué objetivo?': 'With what goal?',
    'Ver la sesión': 'See the session',
    '{n} ejercicios · unos {min} min · {objetivo}':
      '{n} exercises · about {min} min · {objetivo}',
    'Guardar como rutina': 'Save as a routine',
    'Guardada como rutina': 'Saved as a routine',
    'Entra en tu historial y en tu racha como un entrenamiento más. Las calorías son una estimación por tu peso y el tiempo.':
      'It goes into your history and your streak like any other workout. The calories are an estimate from your weight and the time.',
    'QUÉ HICE': 'WHAT I DID',
    'Escríbelo tú: pickleball, mudanza, subir al pueblo…':
      'Write it yourself: pickleball, moving house, walking up to the village…',
    'Si lo escribes tú, elige abajo lo que más se le parezca en esfuerzo: de ahí salen las calorías.':
      'If you write it yourself, pick the closest thing below in effort: that is where the calories come from.',
    'CUÁNTO TIEMPO': 'HOW LONG',
    'ESTIMACIÓN': 'ESTIMATE',
    '~{kcal} kcal en {min} min': '~{kcal} kcal in {min} min',
    '{que} apuntado: {min} min': '{que} logged: {min} min',
    'Caminar': 'Walking',
    'Correr': 'Running',
    'Bici': 'Cycling',
    'Nadar': 'Swimming',
    'Senderismo': 'Hiking',
    'Deporte de equipo': 'Team sport',
    'Raqueta o pádel': 'Racket or padel',
    'Baile': 'Dancing',
    'Pilates o yoga': 'Pilates or yoga',
    'Estirar y movilidad': 'Stretching and mobility',
    'Pesas por mi cuenta': 'Weights on my own',
    'Otra cosa': 'Something else',
    'Crea tu plan semanal': 'Build your weekly plan',
    'Responde cuatro cosas y te organizo la semana: qué grupo muscular toca cada día y con qué ejercicios, ajustado al tiempo que tengas.':
      'Answer four things and I will lay out your week: which muscle group each day covers and with which exercises, fitted to the time you have.',
    '¿Qué días entrenas?': 'Which days do you train?',
    '¿Cuánto dura cada sesión?': 'How long is each session?',
    'Entrenas {donde}': 'You train {donde}',
    'Solo usaré ejercicios que puedas hacer ahí':
      'I will only use exercises you can do there',
    '¿Cuál es tu objetivo?': 'What is your goal?',
    '¿Qué experiencia tienes?': 'How much experience do you have?',
    'Generar mi plan': 'Generate my plan',
    'Cambiar respuestas': 'Change answers',
    'Tu plan de {n} días': 'Your {n}-day plan',
    'Así queda tu semana. Al guardarlo se crea una rutina por día, y podrás editarlas como quieras.':
      'This is how your week looks. Saving it creates one routine per day, and you can edit them however you like.',
    '{n} ejercicios · ~{min} min': '{n} exercises · ~{min} min',
    'Guardar plan': 'Save plan',
    'Guardar añade {n} rutinas nuevas; no se borra nada de lo que ya tengas.':
      'Saving adds {n} new routines; nothing you already have is deleted.',
    'Nueva propuesta generada': 'New proposal generated',
    'Plan guardado: {n} rutinas creadas': 'Plan saved: {n} routines created',
    'Buscar ejercicio…': 'Search for an exercise…',

    /* ---------- La pantalla de cada músculo ---------- */
    'El pecho empuja. Trabaja bien con press y flexiones, y crece cuando el recorrido es completo: abajo hasta tocar, arriba sin bloquear de golpe.':
      'The chest pushes. It responds well to presses and push-ups, and it grows when the range is full: down until you touch, up without snapping the elbows straight.',
    'Los dorsales son lo que da espalda ancha, y lo que más se descuida frente al pecho. Tirón vertical —dominadas, jalón— y horizontal —remo—, las dos cosas cada semana.':
      'The lats are what make a back wide, and what gets neglected most next to the chest. Vertical pulling —pull-ups, pulldowns— and horizontal —rows—, both every week.',
    'La espalda media sostiene la postura y aguanta lo que el dorsal tira. Se entrena con remo y con todo lo que junte los omóplatos.':
      'The mid back holds your posture and takes what the lats pull. You train it with rows and with anything that squeezes the shoulder blades together.',
    'La zona lumbar no se entrena a repeticiones sueltas: se refuerza aguantando posición en peso muerto, puentes y extensiones.':
      'The lower back is not trained with loose reps: it gets stronger by holding position in deadlifts, bridges and extensions.',
    'Los trapecios trabajan en casi todo lo que levantas del suelo. Encogimientos y remos altos si quieres darles algo suyo.':
      'The traps work in almost everything you lift off the floor. Shrugs and upright rows if you want to give them something of their own.',
    'El cuádriceps es la pierna que se ve de frente y el motor de la sentadilla. Profundidad antes que peso: media sentadilla con mucho disco no entrena lo mismo.':
      'The quads are the leg you see from the front and the engine of the squat. Depth before weight: a half squat with a lot of plates is not training the same thing.',
    'Los isquiotibiales frenan la pierna al correr y son los que más se rompen cuando están débiles. Peso muerto rumano, curl y nórdico.':
      'The hamstrings brake the leg when you run and are the ones that tear most when they are weak. Romanian deadlift, curls and Nordics.',
    'El glúteo es el músculo más fuerte que tienes y el que más rinde en sentadilla, peso muerto y puente de cadera.':
      'The glutes are the strongest muscle you have and the one that pays off most in squats, deadlifts and hip thrusts.',
    'Los gemelos aguantan tu peso todo el día, así que con poco no notan nada: recorrido completo, arriba del todo y abajo del todo.':
      'The calves carry your weight all day, so a little does nothing for them: full range, all the way up and all the way down.',
    'El hombro tiene tres cabezas y casi todo el mundo entrena solo la de delante. Press para la frontal, elevaciones laterales para la media y pájaro para la posterior.':
      'The shoulder has three heads and almost everyone trains only the front one. Presses for the front, lateral raises for the middle and reverse flyes for the rear.',
    'El bíceps ya trabaja en cada tirón de espalda. El curl añade lo que falta; no hace falta mucho más volumen del que crees.':
      'The biceps already work in every back pull. Curls add what is missing; you need less extra volume than you think.',
    'El tríceps son dos tercios del brazo. Fondos, press cerrado y extensiones: con el codo quieto, que es donde se pierde el ejercicio.':
      'The triceps are two thirds of the arm. Dips, close-grip presses and extensions: keep the elbow still, which is where the exercise gets lost.',
    'El antebrazo es lo que se agota antes en dominadas y peso muerto. Colgarse de la barra es el ejercicio más simple y el que más da.':
      'The forearms are what give out first in pull-ups and deadlifts. Hanging from the bar is the simplest exercise and the one that gives most.',
    'El abdomen se entrena aguantando, no solo encogiendo. Plancha, hollow y elevaciones de piernas valen más que doscientos abdominales.':
      'The abs are trained by holding, not only by crunching. Planks, hollow holds and leg raises are worth more than two hundred sit-ups.',
    'Los abductores estabilizan la cadera en cada paso y en cada sentadilla a una pierna.':
      'The abductors steady the hip on every step and every single-leg squat.',
    'Los aductores cierran la pierna y sujetan la rodilla. Suelen estar cortos y débiles a la vez.':
      'The adductors close the leg and hold the knee. They tend to be tight and weak at the same time.',
    'El cuello se entrena con muy poco y con mucho cuidado: rango corto y sin tirones.':
      'The neck is trained with very little and a lot of care: short range and no jerking.',

    /* ---------- El menú genérico y la hidratación ---------- */
    'Hidratación': 'Hydration',
    'Llevas hoy': 'So far today',
    'de {n} L': 'of {n} L',
    'Consejos': 'Tips',

    /* ---------- Los cajones de mi día ---------- */
    'Lo que debo comer': 'What I should eat',
    'Lo que voy a entrenar': 'What I am training',
    'Lo que llevo comido': 'What I have eaten',
    'Cómo voy con el plan': 'How I am doing on the plan',
    'Técnica de {que}': '{que} technique',
    'Reproducir animación': 'Play animation',

    /* ---------- El historial de comidas y el menú de hoy ---------- */
    'Lo que has comido': 'What you have eaten',
    '{n} registro': '{n} entry',
    '{n} registros': '{n} entries',
    '{n} g de proteína': '{n} g of protein',
    'Menú de hoy': 'Today’s menu',
    'Ahora: {que}': 'Now: {que}',
    'comer': 'eating',

    /* ---------- El botón del tema ---------- */
    'Cambiar a modo oscuro': 'Switch to dark mode',
    'Cambiar a modo claro': 'Switch to light mode',

    /* ---------- Las acciones de un plan ---------- */
    'Abrir': 'Open',

    /* ---------- El porqué del peso de hoy ---------- */
    'La última vez sacaste las {series} series a {reps}. Toca subir.':
      'Last time you got all {series} sets at {reps}. Time to go up.',
    'Llevas {n} sesiones sin sacarlo. Baja, cógele la técnica y vuelve a subir.':
      'You have gone {n} sessions without getting it. Drop the weight, get the technique down and build back up.',
    'Segunda vez que te quedas corto. Repite peso hasta sacarlo entero.':
      'Second time you have fallen short. Stay on this weight until you get it all.',
    'Te quedaste corto la última vez. Repite peso y sácalo entero.':
      'You fell short last time. Stay on this weight and get it all.',
    'Otro': 'Other',

    /* ---------- Instalar la app ---------- */
    'Ya la tienes instalada': 'It is installed now',
    'Ábrela en el navegador': 'Open it in the browser',
    'Desde aquí dentro no se puede instalar. Toca los tres puntos y elige «Abrir en Safari».':
      'Nothing can be installed from in here. Tap the three dots and choose “Open in Safari”.',
    'Desde aquí dentro no se puede instalar. Toca los tres puntos y elige «Abrir en el navegador».':
      'Nothing can be installed from in here. Tap the three dots and choose “Open in browser”.',
    'Instala Training FR': 'Install Training FR',
    'Dos toques y la tienes en la pantalla de inicio, como cualquier otra app.':
      'Two taps and it is on your home screen, like any other app.',
    'Ver cómo': 'Show me how',
    'Ocupa poco, arranca a pantalla completa y funciona sin conexión.':
      'It takes up little space, opens full screen and works offline.',
    'Instalar': 'Install',
    'Instalar la aplicación': 'Install the app',
    'Estás dentro de otra aplicación, y desde aquí ningún navegador puede instalar nada. Es cosa del sistema, no de la app.':
      'You are inside another app, and from in here no browser can install anything. That is the system, not this app.',
    'Toca los tres puntos de esta ventana, arriba a la derecha.':
      'Tap the three dots in this window, at the top right.',
    'Elige «Abrir en Safari».': 'Choose “Open in Safari”.',
    'Elige «Abrir en Chrome» o «Abrir en el navegador».':
      'Choose “Open in Chrome” or “Open in browser”.',
    'Una vez fuera, vuelve aquí y te saldrá el botón de instalar.':
      'Once you are out, come back here and the install button will show up.',
    'Copiar el enlace': 'Copy the link',
    'Añadirla a la pantalla de inicio': 'Add it to the home screen',
    'En el iPhone las apps que no vienen de la App Store se añaden así. Se hace una vez.':
      'On the iPhone this is how apps that do not come from the App Store get added. You do it once.',
    'Toca el botón de Compartir, arriba a la derecha.':
      'Tap the Share button, at the top right.',
    'Baja por la lista hasta «Añadir a pantalla de inicio».':
      'Scroll down the list to “Add to Home Screen”.',
    'Dale a «Añadir». Ya está: sale con su icono, como una app más.':
      'Tap “Add”. That is it: it shows up with its icon, like any other app.',
    'Desde ahí arranca a pantalla completa, sin la barra del navegador, y funciona sin conexión.':
      'From there it opens full screen, with no browser bar, and works offline.',
    'No se pudo copiar': 'It could not be copied',
    'Cómo se instala en el iPhone': 'How to install it on the iPhone',
    'Por qué no puedo instalarla aquí': 'Why I cannot install it here',

    /* ---------- El aviso de instalar, más corto ---------- */
    'Desde dentro de otra app no se puede. Se abre fuera y ya está.':
      'It cannot be done from inside another app. Open it outside and that is it.',
    'Dos toques y la tienes en la pantalla de inicio.':
      'Two taps and it is on your home screen.',
    'Arranca a pantalla completa y funciona sin conexión.':
      'It opens full screen and works offline.',

    /* ---------- Los pasos del iPhone ---------- */
    'Toca el botón de Compartir {ico}, arriba a la derecha.':
      'Tap the Share button {ico}, at the top right.',
    'Toca el botón de Compartir {ico}, en la barra de abajo.':
      'Tap the Share button {ico}, in the bar at the bottom.',

    /* ---------- Ya la tengo instalada ---------- */
    'No te lo vuelvo a ofrecer': 'I will not offer it again',
    'Ya la tengo': 'I already have it',
    'Ya la tengo instalada, no me lo vuelvas a decir':
      'I already have it installed, stop telling me',

    /* ---------- Los días con actividad ---------- */
    '{n}′': '{n}′',
    'El número de abajo son las series de ese día, o los minutos si fue una actividad.':
      'The number underneath is that day’s sets, or the minutes if it was an activity.',
    'apuntado a mano': 'logged by hand',
    '~{n} kcal': '~{n} kcal',

    /* ---------- Lo que decide el chip de actividad ---------- */
    'Si lo escribes tú, elige abajo lo que más se le parezca: de ahí salen las calorías y los músculos que se apuntan.':
      'If you write it yourself, pick the closest one below: that is where the calories and the muscles logged come from.',

    /* ---------- Que lo mire la IA ---------- */
    'Que lo mire la IA': 'Let the AI look at it',
    'Escribe antes qué has hecho': 'Write what you did first',
    'Mirando…': 'Looking…',
    'Que lo mire otra vez': 'Have it look again',

    /* ---------- La barra de actividad ---------- */
    'actividad': 'activity',
    'minutos de actividad': 'minutes of activity',

    /* ---------- El rótulo de la actividad ---------- */
    'Actividad': 'Activity',

    /* ---------- El día de actividad en verde no, en azul ---------- */
    '{n}′ de actividad': '{n}′ of activity',
    'descanso': 'rest',

    /* ---------- El aviso de carga ---------- */
    '{cuando} hiciste {min} min de actividad que cargan {zonas}. Si las notas pesadas, baja una serie por ejercicio o quita algo de peso: hoy vas a rendir menos y no pasa nada.':
      '{cuando} you did {min} min of activity that loads {zonas}. If they feel heavy, drop a set per exercise or take some weight off: you will perform worse today and that is fine.',
    'Sube a {peso}': 'Go up to {peso}',
    'Baja a {peso}': 'Drop to {peso}',
    'Repite {peso}': 'Stay at {peso}'
  };
})(window);
