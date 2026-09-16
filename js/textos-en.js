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
    'A mano': 'By hand'
  };
})(window);
