/* calistenia.js — 53 ejercicios de calistenia que se suman al catálogo.

   El catálogo principal (free-exercise-db) trae lo básico —dominadas, fondos,
   flexiones, muscle-up— pero no tiene calistenia: ni front lever, ni planche,
   ni bandera, ni L-sit, ni una sola progresión. Y la calistenia ES la
   progresión: nadie «hace» un front lever, se sube por escalones desde la
   tuck hasta la completa, y cada escalón es un ejercicio distinto con su
   propio volumen y su propia técnica.

   Escrito a mano, en español desde el principio. El catálogo de fuera viene en
   inglés y se traduce por diccionario, que es de donde salen cosas como
   «Around del mundo»; aquí el nombre, la descripción y las claves son texto
   propio y no pasan por ningún traductor.

   Sin fotos: no hay ninguna fuente libre de imágenes de calistenia que se
   pueda copiar con garantías, y una foto rota es peor que ninguna. Cada
   ejercicio lleva su enlace a YouTube, como todos los demás.

   El material: lo que se hace en el suelo va como «body only» y sale con
   cualquier ajuste. Lo que necesita barra, paralelas o anillas va como
   «other», igual que el catálogo etiqueta el muscle-up o los fondos en
   anillas, para que no se le ofrezca a quien entrena sin nada. */
(function (g) {
  'use strict';

  /* paso: en qué escalón de su familia está, de 1 en adelante.
     requisito: qué hay que tener antes de tocar este. Es la mitad del valor de
     una progresión — sin eso, uno se planta en el escalón cuatro y se lesiona. */
  const EJERCICIOS = [

    /* ---------------- EMPUJE: de la flexión al planche ---------------- */
    { id: 'cal_flex_pica', foto: 'es_pike_push_ups', name: 'Pike Push-Up', nameEs: 'Flexión en pica',
      nivel: 'beginner', fuerza: 'push', suelo: true,
      primary: 'shoulders', secondary: ['triceps', 'chest'],
      familia: 'Vertical: hacia el pino', paso: 1,
      requisito: '10 flexiones normales seguidas y limpias.',
      desc: 'De pie, manos y pies en el suelo formando una uve invertida con la cadera bien alta. Baja la coronilla hacia el suelo entre las manos doblando los codos, y empuja. Cuanto más vertical pongas el torso, más peso llevan los hombros y menos el pecho.',
      claves: ['La cadera alta todo el rato: en cuanto se cae, esto se convierte en una flexión.',
        'Los codos hacia delante y algo abiertos, no pegados al cuerpo.',
        'La coronilla toca por delante de las manos, no entre ellas.'] },

    { id: 'cal_flex_pica_elev', foto: 'es_pike_push_ups', name: 'Elevated Pike Push-Up', nameEs: 'Flexión en pica elevada',
      nivel: 'intermediate', fuerza: 'push', suelo: true,
      primary: 'shoulders', secondary: ['triceps'],
      familia: 'Vertical: hacia el pino', paso: 2,
      requisito: '3 series de 10 flexiones en pica.',
      desc: 'La misma flexión en pica pero con los pies subidos a un cajón, un sofá o unas escaleras. Al elevar los pies el torso se acerca a la vertical y el hombro carga más peso. Es el escalón entre la pica y el pino.',
      claves: ['Sube la altura poco a poco: cada palmo es bastante más difícil.',
        'Si la espalda baja se arquea, has subido demasiado.'] },

    { id: 'cal_pino_pared', foto: 'es_handstand_push_ups', name: 'Wall Handstand Hold', nameEs: 'Pino contra la pared (aguante)',
      nivel: 'beginner', fuerza: 'static', suelo: true,
      primary: 'shoulders', secondary: ['triceps', 'abdominals'],
      familia: 'Vertical: hacia el pino', paso: 3,
      requisito: 'Hombros sin dolor y muñecas calentadas.',
      desc: 'Boca abajo, manos a un palmo de la pared y los pies apoyados en ella, el cuerpo recto. Aguanta. Lo que se entrena aquí no es fuerza, es tolerancia del hombro y de la muñeca a estar bajo el peso del cuerpo.',
      claves: ['Empuja el suelo lejos: hombros a la altura de las orejas, no hundidos.',
        'Costillas metidas y glúteo apretado, que la espalda no se arquee.',
        'Empieza por aguantes de 20 s y sube hasta el minuto.'] },

    { id: 'cal_pino_libre', foto: 'es_handstand_push_ups', name: 'Freestanding Handstand', nameEs: 'Pino libre',
      nivel: 'expert', fuerza: 'static', suelo: true,
      primary: 'shoulders', secondary: ['abdominals', 'forearms'],
      familia: 'Vertical: hacia el pino', paso: 4,
      requisito: 'Un minuto de pino contra la pared, cómodo.',
      desc: 'El pino sin pared. El equilibrio se corrige con los dedos y la muñeca, no con la cadera: se aprieta con las yemas para no caer hacia delante y se suelta para no caer hacia atrás.',
      claves: ['Ten una salida ensayada antes: rueda de lado o da un paso, no caigas de espaldas.',
        'Mira al suelo entre las manos, no hacia delante.',
        'Es coordinación, así que va mejor muchos intentos cortos que pocos largos.'] },

    { id: 'cal_flex_pino', foto: 'es_handstand_push_ups', name: 'Wall Handstand Push-Up', nameEs: 'Flexión en pino contra pared',
      nivel: 'expert', fuerza: 'push', suelo: true,
      primary: 'shoulders', secondary: ['triceps', 'traps'],
      familia: 'Vertical: hacia el pino', paso: 5,
      requisito: 'Pino contra la pared 45 s y flexión en pica elevada con soltura.',
      desc: 'En pino contra la pared, baja la cabeza hasta rozar el suelo y sube. Es el press militar de la calistenia: todo el peso del cuerpo por encima de la cabeza.',
      claves: ['Manos, cabeza y suelo forman un triángulo: la cabeza cae por delante, no en línea.',
        'Baja controlado; la parte que fabrica fuerza es la bajada.',
        'Si no sale entera, empieza por bajadas lentas y sube con los pies.'] },

    { id: 'cal_planche_lean', foto: 'es_pseudo_planche_push_ups', name: 'Planche Lean', nameEs: 'Planche lean (inclinación)',
      nivel: 'beginner', fuerza: 'static', suelo: true,
      primary: 'shoulders', secondary: ['chest', 'abdominals', 'forearms'],
      familia: 'Planche', paso: 1,
      requisito: 'Aguantar un minuto en posición de flexión sin que se caiga la cadera.',
      desc: 'En posición de flexión con los brazos rectos, lleva los hombros por delante de las manos inclinando todo el cuerpo hacia delante, sin doblar los codos. Cuanto más adelante, más peso sobre el hombro. Es el ejercicio que construye el planche y el que más lo acerca.',
      claves: ['Las manos giradas hacia fuera o hacia atrás, que la muñeca lo agradece.',
        'Escápulas separadas y hacia abajo, nunca juntas.',
        'Mide con los pies: cuanto más lejos quedan los hombros de las manos, más avanzas.'] },

    { id: 'cal_planche_tuck', foto: 'es_planche', name: 'Tuck Planche', nameEs: 'Planche agrupado (tuck)',
      nivel: 'intermediate', fuerza: 'static', suelo: true,
      primary: 'shoulders', secondary: ['chest', 'abdominals'],
      familia: 'Planche', paso: 2,
      requisito: '30 s de planche lean con los hombros bien por delante de las manos.',
      desc: 'Brazos rectos, rodillas pegadas al pecho y los pies despegados del suelo: todo el cuerpo hecho una bola sostenida solo por las manos. El primer escalón en el que de verdad no tocas el suelo con nada más.',
      claves: ['Brazos completamente rectos: si el codo se dobla, ya no es planche.',
        'Empuja el suelo y redondea la espalda alta.',
        'La cadera a la altura de los hombros, no más baja.'] },

    { id: 'cal_planche_tuck_av', foto: 'es_planche', name: 'Advanced Tuck Planche', nameEs: 'Planche agrupado avanzado',
      nivel: 'expert', fuerza: 'static', suelo: true,
      primary: 'shoulders', secondary: ['chest', 'abdominals', 'lower back'],
      familia: 'Planche', paso: 3,
      requisito: '20 s de planche agrupado.',
      desc: 'Como el agrupado, pero con la espalda plana y los muslos en línea con el torso, solo las rodillas dobladas. Alargar la palanca es lo que sube la dificultad, y aquí es donde la mayoría se atasca un año.',
      claves: ['La espalda deja de estar redondeada: costillas metidas y cadera abierta.',
        'Si la cadera se hunde, vuelve al agrupado normal unas semanas.'] },

    { id: 'cal_planche_straddle', foto: 'es_planche', name: 'Straddle Planche', nameEs: 'Planche en straddle',
      nivel: 'expert', fuerza: 'static', suelo: true,
      primary: 'shoulders', secondary: ['chest', 'abdominals', 'glutes'],
      familia: 'Planche', paso: 4,
      requisito: '15 s de planche agrupado avanzado.',
      desc: 'Piernas rectas y muy abiertas, cuerpo paralelo al suelo, sostenido solo con las manos. Abrir las piernas acerca el peso a las manos y por eso va antes que el completo.',
      claves: ['Cuanto más abras, más fácil: se cierra poco a poco con los meses.',
        'Glúteo y cuádriceps apretados; las piernas no cuelgan.'] },

    { id: 'cal_planche_full', foto: 'es_planche', name: 'Full Planche', nameEs: 'Planche completo',
      nivel: 'expert', fuerza: 'static', suelo: true,
      primary: 'shoulders', secondary: ['chest', 'abdominals', 'lower back'],
      familia: 'Planche', paso: 5,
      requisito: '10 s de planche en straddle.',
      desc: 'El cuerpo entero recto y paralelo al suelo sobre las manos. Son años de trabajo, no meses, y el hombro y el bíceps distal se lo toman en serio: aquí las prisas se pagan con una lesión larga.',
      claves: ['Antes de entrar, codos y muñecas bien calentados; el tendón del codo es el que avisa.',
        'Mejor aguantes de 3-5 s muy limpios que uno de 10 doblando los brazos.'] },

    { id: 'cal_flex_planche', foto: 'es_planche', name: 'Planche Push-Up', nameEs: 'Flexión planche',
      nivel: 'expert', fuerza: 'push', suelo: true,
      primary: 'shoulders', secondary: ['chest', 'triceps'],
      familia: 'Planche', paso: 6,
      requisito: 'Aguantar el escalón de planche que trabajes, y hacerlo con solvencia.',
      desc: 'La flexión hecha desde la posición de planche, sin que los pies toquen el suelo. Se hace en el escalón que domines: hay flexión planche agrupada, en straddle y completa.',
      claves: ['El cuerpo no se mueve hacia atrás al bajar: el hombro se queda por delante.',
        'Recorrido corto al principio; ya se irá ganando.'] },

    { id: 'cal_flex_arquera', foto: 'es_archer_push_ups', name: 'Archer Push-Up', nameEs: 'Flexión arquera',
      nivel: 'intermediate', fuerza: 'push', suelo: true,
      primary: 'chest', secondary: ['triceps', 'shoulders'],
      familia: 'Hacia la flexión a una mano', paso: 1,
      requisito: '20 flexiones normales seguidas.',
      desc: 'Manos muy separadas. Bajas cargando el peso sobre un brazo, que se dobla, mientras el otro se queda estirado como el arco de un arquero. Reparte el peso sin llegar a ser a una mano.',
      claves: ['El brazo estirado ayuda lo justo: cuanto menos empuje, mejor.',
        'La cadera mirando al suelo, sin girar el torso para hacer trampa.'] },

    { id: 'cal_flex_una_mano', foto: 'es_archer_push_ups', name: 'One-Arm Push-Up Progression',
      nameEs: 'Flexión a una mano (progresión)',
      nivel: 'expert', fuerza: 'push', suelo: true,
      primary: 'chest', secondary: ['triceps', 'abdominals', 'obliques'],
      familia: 'Hacia la flexión a una mano', paso: 2,
      requisito: '8 flexiones arqueras por lado.',
      desc: 'Una mano en el suelo, la otra a la espalda, pies separados para no volcar. Se llega por pasos: primero con la mano libre elevada en un cajón alto, luego más bajo, y por último sin nada.',
      claves: ['Los pies anchos: es lo que evita que el cuerpo gire.',
        'Aprieta el glúteo y el abdominal como si fueras a recibir un puñetazo.',
        'Baja lento; a una mano, el hombro no perdona un rebote.'] },

    /* ---------------- TRACCIÓN: dominadas y palancas ---------------- */
    { id: 'cal_dominada_negativa', foto: 'es_negative_pull_ups', name: 'Negative Pull-Up', nameEs: 'Dominada negativa',
      nivel: 'beginner', fuerza: 'pull', suelo: false,
      primary: 'lats', secondary: ['biceps', 'middle back'],
      familia: 'Base de tracción', paso: 3,
      requisito: 'Dominada escapular con soltura.',
      desc: 'Te colocas arriba con un salto o un cajón, barbilla por encima de la barra, y bajas lo más lento que puedas hasta quedar colgado. La bajada fabrica casi toda la fuerza que hace falta para la primera dominada.',
      claves: ['Apunta a 5 segundos de bajada; si bajas en dos, usa el cajón para arrancar más alto.',
        'Hombros abajo y atrás desde el principio, no encogidos.',
        '3 series de 4 bajadas, tres veces por semana, y llega sola.'] },

    { id: 'cal_dominada_arquera', foto: 'es_archer_pull_ups', name: 'Archer Pull-Up', nameEs: 'Dominada arquera',
      nivel: 'expert', fuerza: 'pull', suelo: false,
      primary: 'lats', secondary: ['biceps', 'middle back'],
      familia: 'Hacia la dominada a un brazo', paso: 1,
      requisito: '12 dominadas seguidas y limpias.',
      desc: 'Agarre ancho. Subes tirando de un lado mientras el otro brazo se queda estirado. Es el paso natural hacia la dominada a un brazo porque enseña a tirar en desequilibrio.',
      claves: ['El brazo estirado no se dobla: si se dobla, es una dominada normal desplazada.',
        'La barbilla va a la mano que trabaja, no al centro.'] },

    { id: 'cal_dominada_typewriter', foto: 'es_archer_pull_ups', name: 'Typewriter Pull-Up', nameEs: 'Dominada typewriter',
      nivel: 'expert', fuerza: 'pull', suelo: false,
      primary: 'lats', secondary: ['biceps', 'middle back'],
      familia: 'Hacia la dominada a un brazo', paso: 2,
      requisito: '6 dominadas arqueras por lado.',
      desc: 'Subes al centro y, arriba, te desplazas de una mano a la otra manteniendo la barbilla a la altura de la barra, como el carro de una máquina de escribir. Suma tiempo bajo tensión en la parte alta, que es la que más cuesta.',
      claves: ['La barbilla no baja mientras te desplazas.',
        'Ve despacio: el valor está en el recorrido, no en el número.'] },

    { id: 'cal_dominada_un_brazo_asist', foto: 'es_archer_pull_ups', name: 'Assisted One-Arm Pull-Up',
      nameEs: 'Dominada a un brazo asistida',
      nivel: 'expert', fuerza: 'pull', suelo: false,
      primary: 'lats', secondary: ['biceps', 'forearms'],
      familia: 'Hacia la dominada a un brazo', paso: 3,
      requisito: 'Dominadas typewriter con control.',
      desc: 'Una mano en la barra y la otra agarrando tu propia muñeca, una toalla colgada o una goma. Se va bajando la ayuda: de la muñeca al antebrazo, del antebrazo a dos dedos, de dos dedos a nada.',
      claves: ['La ayuda tiene que ser medible, para saber si progresas.',
        'El hombro que trabaja, abajo y atrás antes de tirar: si se encoge, se resiente.'] },

    { id: 'cal_dominada_un_brazo', foto: 'es_archer_pull_ups', name: 'One-Arm Pull-Up', nameEs: 'Dominada a un brazo',
      nivel: 'expert', fuerza: 'pull', suelo: false,
      primary: 'lats', secondary: ['biceps', 'forearms', 'middle back'],
      familia: 'Hacia la dominada a un brazo', paso: 4,
      requisito: 'Dominada asistida con un solo dedo de ayuda.',
      desc: 'Subir la barbilla por encima de la barra con un solo brazo. De las cosas más duras que se pueden hacer con el propio peso, y muy dependiente de lo que peses.',
      claves: ['El cuerpo gira solo: se compensa apretando el abdominal y el glúteo del lado libre.',
        'El codo y el bíceps son los que sufren; calienta de verdad antes.'] },

    { id: 'cal_dominada_explosiva', foto: 'es_muscle_ups', name: 'Explosive Pull-Up', nameEs: 'Dominada explosiva',
      nivel: 'intermediate', fuerza: 'pull', suelo: false,
      primary: 'lats', secondary: ['biceps', 'traps'],
      familia: 'Hacia el muscle-up', paso: 1,
      requisito: '10 dominadas estrictas.',
      desc: 'Una dominada tirando tan fuerte como puedas para que el pecho —y luego el ombligo— llegue a la barra. Es lo que construye la altura que el muscle-up necesita para pasar por encima.',
      claves: ['Tira del pecho a la barra, no de la barbilla.',
        'Sin balanceo: si la haces con impulso, no estás ganando nada.'] },

    { id: 'cal_transicion_mu', foto: 'es_muscle_ups', name: 'Muscle-Up Transition Drill',
      nameEs: 'Transición de muscle-up (en banda o salto)',
      nivel: 'intermediate', fuerza: 'pull', suelo: false,
      primary: 'lats', secondary: ['triceps', 'chest', 'shoulders'],
      familia: 'Hacia el muscle-up', paso: 2,
      requisito: 'Dominada explosiva al ombligo.',
      desc: 'El muscle-up se cae casi siempre en el paso de tirar a empujar. Se ensaya suelto: con una banda, desde un salto o partiendo de una barra baja, repitiendo solo ese trozo del movimiento.',
      claves: ['Las muñecas giran por encima de la barra: es un giro, no un tirón más fuerte.',
        'Mete el pecho por delante en cuanto pases; quedarte debajo te devuelve abajo.'] },

    { id: 'cal_mu_negativo', foto: 'es_muscle_ups', name: 'Negative Muscle-Up', nameEs: 'Muscle-up negativo',
      nivel: 'expert', fuerza: 'pull', suelo: false,
      primary: 'lats', secondary: ['triceps', 'chest'],
      familia: 'Hacia el muscle-up', paso: 3,
      requisito: 'La transición ensayada con banda.',
      desc: 'Empiezas arriba, en apoyo sobre la barra con los brazos rectos, y deshaces el movimiento despacio hasta quedar colgado. Enseña el camino exacto que tiene que hacer el cuerpo.',
      claves: ['Cuanto más lento bajes la transición, antes sale la subida.',
        'Fíjate en dónde se te van los codos: ahí es donde se rompe la subida.'] },

    { id: 'cal_fl_tuck', foto: 'es_front_lever', name: 'Tuck Front Lever', nameEs: 'Front lever agrupado (tuck)',
      nivel: 'intermediate', fuerza: 'static', suelo: false,
      primary: 'lats', secondary: ['abdominals', 'middle back', 'lower back'],
      familia: 'Front lever', paso: 1,
      requisito: '8 dominadas estrictas y colgarte con los hombros activos.',
      desc: 'Colgado de la barra con los brazos rectos, te agrupas y llevas la espalda hasta quedar horizontal, boca arriba, con las rodillas en el pecho. El primer escalón de la palanca frontal.',
      claves: ['Brazos rectos y escápulas deprimidas: el tirón sale del dorsal, no del codo.',
        'La espalda paralela al suelo; si la cadera queda más baja, aún no estás en la posición.',
        'Aguantes de 10-15 s.'] },

    { id: 'cal_fl_tuck_av', foto: 'es_front_lever', name: 'Advanced Tuck Front Lever',
      nameEs: 'Front lever agrupado avanzado',
      nivel: 'expert', fuerza: 'static', suelo: false,
      primary: 'lats', secondary: ['abdominals', 'lower back'],
      familia: 'Front lever', paso: 2,
      requisito: '20 s de front lever agrupado.',
      desc: 'El mismo agrupado pero abriendo la cadera hasta que muslos y torso formen una línea, con las rodillas todavía dobladas. La palanca se alarga y el dorsal pasa a trabajar de verdad.',
      claves: ['La espalda baja plana: si se arquea, has abierto más de lo que aguantas.',
        'Costillas metidas, como si quisieras juntarlas con la pelvis.'] },

    { id: 'cal_fl_straddle', foto: 'es_front_lever', name: 'Straddle Front Lever', nameEs: 'Front lever en straddle',
      nivel: 'expert', fuerza: 'static', suelo: false,
      primary: 'lats', secondary: ['abdominals', 'glutes', 'lower back'],
      familia: 'Front lever', paso: 3,
      requisito: '15 s de front lever agrupado avanzado.',
      desc: 'Piernas rectas y abiertas, cuerpo horizontal colgado de la barra. Abrir las piernas acorta la palanca, y por eso va antes que el completo.',
      claves: ['Abre todo lo que puedas al principio y ve cerrando con los meses.',
        'Punta de pie estirada y glúteo apretado: si las piernas cuelgan, pesan más.'] },

    { id: 'cal_fl_full', foto: 'es_front_lever', name: 'Full Front Lever', nameEs: 'Front lever completo',
      nivel: 'expert', fuerza: 'static', suelo: false,
      primary: 'lats', secondary: ['abdominals', 'lower back', 'middle back'],
      familia: 'Front lever', paso: 4,
      requisito: '10 s de front lever en straddle.',
      desc: 'El cuerpo entero recto y horizontal, colgado de la barra con los brazos rectos, boca arriba. La postura insignia de la calistenia de tracción.',
      claves: ['Todo el cuerpo en una línea: hombros, cadera y talones.',
        'Cuenta solo el tiempo en el que estás horizontal de verdad.'] },

    { id: 'cal_fl_remo', foto: 'es_front_lever', name: 'Front Lever Row', nameEs: 'Remo en front lever',
      nivel: 'expert', fuerza: 'pull', suelo: false,
      primary: 'lats', secondary: ['middle back', 'biceps', 'abdominals'],
      familia: 'Front lever', paso: 5,
      requisito: 'Aguantar 10 s el escalón que trabajes.',
      desc: 'Desde la posición de front lever —en el escalón que domines— tiras del cuerpo hacia la barra manteniendo la horizontal. Es el ejercicio que más fuerza de tracción da de toda la calistenia.',
      claves: ['El cuerpo sube paralelo al suelo, sin que la cadera se hunda.',
        'Hazlo en el escalón anterior al que aguantas: en agrupado si tu aguante es el avanzado.'] },

    { id: 'cal_bl_tuck', foto: 'es_back_lever', name: 'Tuck Back Lever', nameEs: 'Back lever agrupado',
      nivel: 'intermediate', fuerza: 'static', suelo: false,
      primary: 'chest', secondary: ['shoulders', 'biceps', 'lower back'],
      familia: 'Back lever', paso: 1,
      requisito: 'Saber darte la vuelta colgado (skin the cat) sin forzar el hombro.',
      desc: 'Pasas por dentro de los brazos hasta quedar boca abajo, agrupado, con el cuerpo horizontal y los brazos rectos por detrás. Es la palanca que más abre el hombro y el bíceps.',
      claves: ['Los hombros y el bíceps se estiran mucho: entra despacio la primera vez.',
        'Mejor agarre prono para proteger el codo.'] },

    { id: 'cal_bl_straddle', foto: 'es_back_lever', name: 'Straddle Back Lever', nameEs: 'Back lever en straddle',
      nivel: 'expert', fuerza: 'static', suelo: false,
      primary: 'chest', secondary: ['shoulders', 'biceps', 'glutes'],
      familia: 'Back lever', paso: 2,
      requisito: '20 s de back lever agrupado.',
      desc: 'Boca abajo, horizontal, piernas rectas y abiertas. Igual que en el front lever, abrir acorta la palanca.',
      claves: ['Mirada al suelo y cuerpo en línea, sin arquear la lumbar.'] },

    { id: 'cal_bl_full', foto: 'es_back_lever', name: 'Full Back Lever', nameEs: 'Back lever completo',
      nivel: 'expert', fuerza: 'static', suelo: false,
      primary: 'chest', secondary: ['shoulders', 'biceps', 'lower back'],
      familia: 'Back lever', paso: 3,
      requisito: '15 s de back lever en straddle.',
      desc: 'Cuerpo recto y horizontal, boca abajo, brazos rectos por detrás. Pide bastante movilidad de hombro además de fuerza.',
      claves: ['Si notas tirón en la parte interna del codo, sal: es la lesión típica de esta postura.'] },

    { id: 'cal_skin_the_cat', foto: 'es_ring_dead_hang', name: 'Skin the Cat', nameEs: 'Skin the cat (vuelta colgado)',
      nivel: 'intermediate', fuerza: 'pull', suelo: false,
      primary: 'lats', secondary: ['shoulders', 'abdominals', 'biceps'],
      familia: 'Back lever', paso: 0,
      requisito: 'Colgarte 30 s y no tener molestias de hombro.',
      desc: 'Colgado, subes las piernas y pasas por dentro de los brazos hasta quedar estirado boca abajo, y vuelves. Es el ejercicio que prepara el hombro para todo lo que va por detrás: back lever, anillas, invertidos.',
      claves: ['Empieza con poco recorrido y ve ganando rango semana a semana.',
        'Hazlo lento en los dos sentidos; la vuelta es tan importante como la ida.'] },

    /* ---------------- CORE: L-sit, dragon flag y compañía ---------------- */
    { id: 'cal_hollow', foto: 'es_hollow_body_hold', name: 'Hollow Body Hold', nameEs: 'Hollow body (aguante hueco)',
      nivel: 'beginner', fuerza: 'static', suelo: true,
      primary: 'abdominals', secondary: ['quadriceps'],
      familia: 'Base de core', paso: 1,
      requisito: 'Ninguno. Este es el punto de partida de todo lo demás.',
      desc: 'Tumbado boca arriba, lumbar pegada al suelo, y levantas piernas y hombros hasta quedar con forma de plátano. No hay postura de calistenia que no dependa de saber hacer esto.',
      claves: ['La lumbar NO se despega del suelo: si se despega, sube más las piernas.',
        'Si aguantas un minuto, baja las piernas en vez de alargar el tiempo.'] },

    { id: 'cal_hollow_rock', foto: 'es_hollow_body_hold', name: 'Hollow Rock', nameEs: 'Hollow rock (balanceo hueco)',
      nivel: 'beginner', fuerza: 'static', suelo: true,
      primary: 'abdominals', secondary: ['hip flexors'],
      familia: 'Base de core', paso: 2,
      requisito: '40 s de hollow body.',
      desc: 'La misma posición hueca, meciéndote adelante y atrás como una mecedora, sin romper la forma. Enseña a mantener la tensión mientras el cuerpo se mueve, que es lo que pasa en cualquier palanca.',
      claves: ['El balanceo sale de los hombros, no de doblar la cadera.',
        'Si el cuerpo se «rompe» por la mitad, vuelve al aguante.'] },

    { id: 'cal_lsit_tuck', foto: 'es_l_sit', name: 'Tuck L-Sit', nameEs: 'L-sit agrupado',
      nivel: 'beginner', fuerza: 'static', suelo: true,
      primary: 'abdominals', secondary: ['triceps', 'shoulders', 'quadriceps'],
      familia: 'L-sit', paso: 1,
      requisito: '30 s de hollow body.',
      desc: 'Sentado en el suelo o sobre dos apoyos, manos al lado de la cadera, brazos rectos, te elevas con las rodillas dobladas al pecho y los pies en el aire.',
      claves: ['Hombros abajo, lejos de las orejas: es lo que permite subir la cadera.',
        'Si no despegas, usa dos libros o unas paralelas bajas.'] },

    { id: 'cal_lsit_una', foto: 'es_l_sit', name: 'One-Leg L-Sit', nameEs: 'L-sit a una pierna',
      nivel: 'intermediate', fuerza: 'static', suelo: true,
      primary: 'abdominals', secondary: ['triceps', 'quadriceps'],
      familia: 'L-sit', paso: 2,
      requisito: '20 s de L-sit agrupado.',
      desc: 'Igual que el agrupado pero estirando una pierna, alternando. Medio escalón que evita el salto brusco al L-sit completo.',
      claves: ['La pierna estirada, a la altura de la cadera y con el cuádriceps apretado.'] },

    { id: 'cal_lsit', foto: 'es_l_sit', name: 'L-Sit', nameEs: 'L-sit',
      nivel: 'intermediate', fuerza: 'static', suelo: true,
      primary: 'abdominals', secondary: ['triceps', 'shoulders', 'quadriceps'],
      familia: 'L-sit', paso: 3,
      requisito: '15 s de L-sit a una pierna por lado.',
      desc: 'Las dos piernas rectas y paralelas al suelo, el cuerpo sostenido solo con las manos, formando una L. Fuerza de abdomen, sí, pero sobre todo isquiotibiales flexibles y hombros fuertes.',
      claves: ['Si no llegas, casi siempre son los isquios y no el abdomen: estíralos.',
        'Codos bloqueados y escápulas hacia abajo.'] },

    { id: 'cal_vsit', foto: 'es_v_sit', name: 'V-Sit', nameEs: 'V-sit',
      nivel: 'expert', fuerza: 'static', suelo: true,
      primary: 'abdominals', secondary: ['hip flexors', 'triceps'],
      familia: 'L-sit', paso: 4,
      requisito: '30 s de L-sit.',
      desc: 'Desde el L-sit, subes las piernas rectas por encima de la cadera hasta formar una uve. Pide compresión, que es una cualidad que se entrena aparte.',
      claves: ['Entrena la compresión sentado en el suelo, levantando las piernas rectas con las manos apoyadas.'] },

    { id: 'cal_dragon_negativa', foto: 'es_dragon_flag', name: 'Negative Dragon Flag', nameEs: 'Dragon flag negativa',
      nivel: 'intermediate', fuerza: 'static', suelo: true,
      primary: 'abdominals', secondary: ['lower back', 'lats'],
      familia: 'Dragon flag', paso: 1,
      requisito: '45 s de hollow body.',
      desc: 'Tumbado, agarrado a algo firme detrás de la cabeza, subes el cuerpo recto apoyado solo en los omóplatos y lo bajas lo más lento posible sin doblar la cadera.',
      claves: ['Solo los omóplatos tocan: ni la lumbar, ni el glúteo.',
        'El cuerpo baja recto como una tabla; si se dobla por la cadera, es otro ejercicio.'] },

    { id: 'cal_dragon_tuck', foto: 'es_dragon_flag', name: 'Tuck Dragon Flag', nameEs: 'Dragon flag agrupada',
      nivel: 'intermediate', fuerza: 'static', suelo: true,
      primary: 'abdominals', secondary: ['lower back'],
      familia: 'Dragon flag', paso: 2,
      requisito: '5 negativas de 5 s.',
      desc: 'La dragon flag con las rodillas dobladas, subiendo y bajando con control. Palanca corta para poder hacer repeticiones de verdad.',
      claves: ['Sube y baja sin apoyar la espalda entre repeticiones.'] },

    { id: 'cal_dragon_full', foto: 'es_dragon_flag', name: 'Dragon Flag', nameEs: 'Dragon flag completa',
      nivel: 'expert', fuerza: 'static', suelo: true,
      primary: 'abdominals', secondary: ['lower back', 'lats', 'glutes'],
      familia: 'Dragon flag', paso: 3,
      requisito: '8 dragon flags agrupadas.',
      desc: 'Cuerpo recto de arriba abajo apoyado solo en los omóplatos, subiendo y bajando con control. Una de las cosas más duras que se le pueden pedir al abdomen.',
      claves: ['Glúteo apretado: es lo que impide que la cadera se rompa por la mitad.',
        'Mejor 3 repeticiones perfectas que 8 dobladas.'] },

    { id: 'cal_limpia_parabrisas', foto: 'es_hanging_leg_raise', name: 'Hanging Windshield Wipers',
      nameEs: 'Limpiaparabrisas colgado',
      nivel: 'expert', fuerza: 'static', suelo: false,
      primary: 'abdominals', secondary: ['lats', 'obliques'],
      familia: 'Core colgado', paso: 2,
      requisito: '10 elevaciones de piernas a la barra.',
      desc: 'Colgado con las piernas rectas arriba, junto a la barra, las llevas de lado a lado como un limpiaparabrisas. Oblicuos y agarre a la vez.',
      claves: ['Las piernas no bajan mientras cruzas.',
        'Aguanta un segundo en cada lado en vez de dejarte caer.'] },

    /* ---------------- BANDERA ---------------- */
    { id: 'cal_bandera_apoyo', foto: 'es_human_flag', name: 'Human Flag Support Hold',
      nameEs: 'Bandera: apoyo vertical',
      nivel: 'intermediate', fuerza: 'static', suelo: false,
      primary: 'shoulders', secondary: ['lats', 'abdominals', 'obliques'],
      familia: 'Bandera humana', paso: 1,
      requisito: 'Hombros sanos y una barra o poste vertical firme.',
      desc: 'Agarras el poste con una mano alta y otra baja y te cuelgas en vertical, con el cuerpo pegado, aprendiendo a repartir: la de arriba tira, la de abajo empuja. Es el gesto que hay que automatizar antes de intentar nada horizontal.',
      claves: ['La mano de abajo EMPUJA, no tira: ahí se decide la bandera entera.',
        'Los brazos rectos los dos.'] },

    { id: 'cal_bandera_tuck', foto: 'es_human_flag', name: 'Tuck Human Flag', nameEs: 'Bandera agrupada',
      nivel: 'expert', fuerza: 'static', suelo: false,
      primary: 'shoulders', secondary: ['lats', 'obliques', 'abdominals'],
      familia: 'Bandera humana', paso: 2,
      requisito: 'Apoyo vertical cómodo y 20 s de plancha lateral.',
      desc: 'Con las rodillas agrupadas al pecho, despegas el cuerpo del poste hasta quedar de lado en el aire. Aquí la bandera empieza a ser bandera.',
      claves: ['Sal desde arriba, dejándote caer poco a poco, no desde abajo subiendo.',
        'Cadera y hombros en el mismo plano; si te giras boca abajo, es más fácil pero no es bandera.'] },

    { id: 'cal_bandera_straddle', foto: 'es_human_flag', name: 'Straddle Human Flag', nameEs: 'Bandera en straddle',
      nivel: 'expert', fuerza: 'static', suelo: false,
      primary: 'shoulders', secondary: ['lats', 'obliques', 'glutes'],
      familia: 'Bandera humana', paso: 3,
      requisito: '10 s de bandera agrupada.',
      desc: 'Piernas rectas y abiertas, cuerpo horizontal sostenido de lado en el poste.',
      claves: ['La pierna de arriba tira hacia el techo; es lo que sostiene la horizontal.'] },

    { id: 'cal_bandera_full', foto: 'es_human_flag', name: 'Full Human Flag', nameEs: 'Bandera humana completa',
      nivel: 'expert', fuerza: 'static', suelo: false,
      primary: 'shoulders', secondary: ['lats', 'obliques', 'abdominals'],
      familia: 'Bandera humana', paso: 4,
      requisito: '8 s de bandera en straddle.',
      desc: 'El cuerpo entero recto y horizontal, de lado, agarrado a un poste vertical. La postura más reconocible de la calistenia de calle.',
      claves: ['Cuerpo en una línea de las manos a los pies.',
        'Un poste que no se mueva: esto se prueba una vez en algo que aguante.'] },

    /* ---------------- PIERNA SIN MATERIAL ---------------- */
    { id: 'cal_sent_caja_una', foto: 'es_pistol_squat', name: 'Single-Leg Box Squat', nameEs: 'Sentadilla a una pierna a cajón',
      nivel: 'beginner', fuerza: 'push', suelo: true,
      primary: 'quadriceps', secondary: ['glutes', 'hamstrings'],
      familia: 'Hacia la pistol', paso: 1,
      requisito: '20 sentadillas con tu propio peso.',
      desc: 'A una pierna, bajas hasta sentarte en un cajón o una silla y te levantas sin ayuda, con la otra pierna estirada delante. Bajando la altura del asiento se va ganando recorrido.',
      claves: ['La rodilla apuntando a la punta del pie, sin irse hacia dentro.',
        'Baja el asiento un par de dedos cada vez que te salgan 8 repeticiones.'] },

    { id: 'cal_shrimp', foto: 'es_pistol_squat', name: 'Shrimp Squat', nameEs: 'Sentadilla shrimp',
      nivel: 'intermediate', fuerza: 'push', suelo: true,
      primary: 'quadriceps', secondary: ['glutes', 'hamstrings'],
      familia: 'Hacia la pistol', paso: 2,
      requisito: '8 sentadillas a una pierna a cajón bajo.',
      desc: 'De pie, agarras el empeine de un pie por detrás y bajas hasta que la rodilla toque el suelo, y subes. Pide menos flexibilidad de tobillo que la pistol, por eso suele salir antes.',
      claves: ['El torso recto; inclinarte convierte esto en otra cosa.',
        'Pon una toalla bajo la rodilla las primeras semanas.'] },

    { id: 'cal_pistol_asistida', foto: 'es_pistol_squat', name: 'Assisted Pistol Squat', nameEs: 'Pistol asistida',
      nivel: 'intermediate', fuerza: 'push', suelo: true,
      primary: 'quadriceps', secondary: ['glutes', 'hamstrings', 'calves'],
      familia: 'Hacia la pistol', paso: 3,
      requisito: '6 shrimp squats por pierna.',
      desc: 'La pistol agarrándote a un marco de puerta o a una anilla, usando el brazo solo para equilibrarte. Va bajando la ayuda hasta que sea un dedo.',
      claves: ['El brazo equilibra, no tira. Si tiras, no estás progresando.',
        'Si el talón se despega, el problema es el tobillo: estira gemelo y sóleo.'] },

    { id: 'cal_pistol', foto: 'es_pistol_squat', name: 'Pistol Squat', nameEs: 'Pistol squat (sentadilla a una pierna)',
      nivel: 'expert', fuerza: 'push', suelo: true,
      primary: 'quadriceps', secondary: ['glutes', 'hamstrings', 'abdominals'],
      familia: 'Hacia la pistol', paso: 4,
      requisito: 'Pistol asistida con un dedo.',
      desc: 'Bajar hasta abajo del todo sobre una pierna, con la otra estirada delante sin tocar el suelo, y subir. Fuerza, equilibrio y movilidad de tobillo a la vez.',
      claves: ['El talón pegado al suelo todo el recorrido.',
        'Los brazos delante hacen de contrapeso.'] },

    { id: 'cal_nordic', foto: 'es_nordic_hamstring_curl', name: 'Nordic Hamstring Curl', nameEs: 'Curl nórdico',
      nivel: 'expert', fuerza: 'pull', suelo: true,
      primary: 'hamstrings', secondary: ['glutes', 'calves'],
      familia: 'Pierna sin material', paso: 1,
      requisito: 'Alguien que te sujete los tobillos, o algo firme donde meterlos.',
      desc: 'De rodillas con los tobillos sujetos, dejas caer el cuerpo recto hacia delante aguantando con los isquiotibiales y vuelves. Lo más duro que existe para isquios sin material, y de lo mejor para prevenir roturas.',
      claves: ['El cuerpo cae recto desde la rodilla: sin doblar la cadera.',
        'Al principio frena solo el primer tramo y empuja con las manos para volver.'] },

    { id: 'cal_gemelo_una', foto: 'es_single_leg_calf_raise', name: 'Single-Leg Calf Raise', nameEs: 'Elevación de gemelo a una pierna',
      nivel: 'beginner', fuerza: 'push', suelo: true,
      primary: 'calves', secondary: [],
      familia: 'Pierna sin material', paso: 2,
      requisito: 'Ninguno.',
      desc: 'A una pierna, en el borde de un escalón, bajas el talón todo lo que dé y subes hasta la punta. Sin material, el gemelo solo crece a una pierna: con las dos, el propio peso se queda corto enseguida.',
      claves: ['Recorrido completo: abajo del todo, arriba del todo.',
        'Un segundo arriba en cada repetición.'] },

    /* ---------------- ESTÁTICOS DE APOYO ---------------- */
    { id: 'cal_apoyo_paralelas', foto: 'es_ring_dips', name: 'Parallel Bar Support Hold',
      nameEs: 'Apoyo en paralelas (aguante)',
      nivel: 'beginner', fuerza: 'static', suelo: false,
      primary: 'triceps', secondary: ['chest', 'shoulders', 'abdominals'],
      familia: 'Base de apoyo', paso: 1,
      requisito: 'Ninguno.',
      desc: 'Sostenerte en unas paralelas con los brazos rectos y bloqueados, cuerpo recto. Es el primer paso antes de cualquier fondo, y el que enseña al hombro a aguantar el peso desde arriba.',
      claves: ['Hombros abajo, lejos de las orejas.',
        'Codos bloqueados del todo.',
        'Aguantes de 30 s hasta llegar al minuto.'] },

    { id: 'cal_colgado', foto: 'es_dead_hang', name: 'Dead Hang', nameEs: 'Colgarse de la barra',
      nivel: 'beginner', fuerza: 'static', suelo: false,
      primary: 'forearms', secondary: ['lats', 'shoulders'],
      familia: 'Base de tracción', paso: 1,
      requisito: 'Ninguno. Esto es el escalón cero de todo lo que se hace en barra.',
      desc: 'Colgarse de la barra con los brazos rectos y aguantar. Construye el agarre, que es lo que se acaba antes en casi todo lo de tracción, y descomprime el hombro.',
      claves: ['Primero colgado suelto, después activo: bajando los hombros sin doblar los codos.',
        'Si buscas agarre, suma tiempo total del día; no hace falta que sea seguido.'] },

    { id: 'cal_escapular', foto: 'es_scapular_pull_ups', name: 'Scapular Pull-Up', nameEs: 'Dominada escapular',
      nivel: 'beginner', fuerza: 'pull', suelo: false,
      primary: 'traps', secondary: ['lats', 'middle back'],
      familia: 'Base de tracción', paso: 2,
      requisito: '20 s colgado.',
      desc: 'Colgado con los brazos rectos, subes el cuerpo un palmo bajando los hombros, sin doblar los codos en ningún momento. Es el recorrido que casi nadie hace y el que falta cuando la dominada se atasca.',
      claves: ['Codos rectos de principio a fin: si se doblan, es una dominada corta.',
        'El movimiento es pequeño, de unos centímetros. Está bien así.'] }
  ];

  /* Las posturas, para el muñeco de figura.js. Cada una son unos cuantos
     ángulos: 0 mira a la derecha y crecen en el sentido de las agujas del
     reloj, o sea 90 abajo y 270 arriba. El suelo está en y=66, la barra alta en
     y=14 y las paralelas en y=40.

     Las que solo traen una postura son los aguantes, y está bien que no se
     muevan: un front lever no se mueve, se sostiene. */
const FIGURAS = {

  /* ---- empuje en el suelo ---- */
  cal_flex_pica: { escena: 'suelo', a:
    { cadera: [48, 26], tronco: 35, cabeza: 35, brazo1: [70, 70], brazo2: [66, 66],
      pierna1: [130, 108, 50], pierna2: [126, 112, 50] },
    b:
    { cadera: [48, 26], tronco: 35, cabeza: 50, brazo1: [95, 25], brazo2: [91, 21],
      pierna1: [130, 108, 50], pierna2: [126, 112, 50] } },

  cal_flex_pica_elev: { escena: 'cajon', a:
    { cadera: [62, 30], tronco: 125, cabeza: 125, brazo1: [82, 82], brazo2: [78, 78],
      pierna1: [5, 5, 75], pierna2: [8, 2, 72] },
    b:
    { cadera: [62, 30], tronco: 125, cabeza: 140, brazo1: [110, 35], brazo2: [106, 31],
      pierna1: [5, 5, 75], pierna2: [8, 2, 72] } },

  cal_pino_pared: { escena: 'pared', a:
    { cadera: [32, 30], tronco: 95, cabeza: 100, brazo1: [78, 82], brazo2: [72, 78],
      pierna1: [272, 268, 200], pierna2: [268, 272, 200] } },

  cal_pino_libre: { escena: 'suelo', a:
    { cadera: [50, 30], tronco: 95, cabeza: 100, brazo1: [78, 82], brazo2: [72, 78],
      pierna1: [272, 268, 200], pierna2: [266, 274, 200] },
    b:
    { cadera: [52, 31], tronco: 100, cabeza: 105, brazo1: [80, 84], brazo2: [74, 80],
      pierna1: [280, 262, 195], pierna2: [258, 278, 205] } },

  cal_flex_pino: { escena: 'pared', a:
    { cadera: [32, 28], tronco: 95, cabeza: 100, brazo1: [78, 82], brazo2: [72, 78],
      pierna1: [272, 268, 200], pierna2: [268, 272, 200] },
    b:
    { cadera: [32, 40], tronco: 95, cabeza: 100, brazo1: [35, 130], brazo2: [30, 125],
      pierna1: [272, 268, 200], pierna2: [268, 272, 200] } },

  cal_planche_lean: { escena: 'suelo', a:
    { cadera: [40, 52], tronco: 345, cabeza: 335, brazo1: [80, 80], brazo2: [80, 80],
      pierna1: [160, 160, 60], pierna2: [160, 160, 60] },
    b:
    { cadera: [36, 50], tronco: 350, cabeza: 340, brazo1: [65, 65], brazo2: [65, 65],
      pierna1: [165, 165, 60], pierna2: [165, 165, 60] } },

  cal_planche_tuck: { escena: 'suelo', a:
    { cadera: [40, 48], tronco: 350, cabeza: 340, brazo1: [70, 70], brazo2: [70, 70],
      pierna1: [330, 80, 150], pierna2: [330, 80, 150] } },

  cal_planche_tuck_av: { escena: 'suelo', a:
    { cadera: [38, 46], tronco: 355, cabeza: 345, brazo1: [70, 70], brazo2: [70, 70],
      pierna1: [185, 105, 175], pierna2: [185, 105, 175] } },

  cal_planche_straddle: { escena: 'suelo', a:
    { cadera: [38, 45], tronco: 358, cabeza: 348, brazo1: [70, 70], brazo2: [70, 70],
      pierna1: [200, 200, 270], pierna2: [160, 160, 230] } },

  cal_planche_full: { escena: 'suelo', a:
    { cadera: [38, 45], tronco: 0, cabeza: 350, brazo1: [70, 70], brazo2: [70, 70],
      pierna1: [180, 180, 250], pierna2: [180, 180, 250] } },

  cal_flex_planche: { escena: 'suelo', a:
    { cadera: [38, 45], tronco: 0, cabeza: 350, brazo1: [70, 70], brazo2: [70, 70],
      pierna1: [180, 180, 250], pierna2: [180, 180, 250] },
    b:
    { cadera: [38, 53], tronco: 0, cabeza: 350, brazo1: [40, 120], brazo2: [40, 120],
      pierna1: [180, 180, 250], pierna2: [180, 180, 250] } },

  cal_flex_arquera: { escena: 'suelo', a:
    { cadera: [45, 51], tronco: 340, cabeza: 330, brazo1: [85, 85], brazo2: [110, 110],
      pierna1: [150, 150, 60], pierna2: [150, 150, 60] },
    b:
    { cadera: [45, 57], tronco: 340, cabeza: 330, brazo1: [125, 55], brazo2: [120, 120],
      pierna1: [150, 150, 60], pierna2: [150, 150, 60] } },

  cal_flex_una_mano: { escena: 'suelo', a:
    { cadera: [45, 51], tronco: 340, cabeza: 330, brazo1: [85, 85], brazo2: [230, 200],
      pierna1: [150, 150, 60], pierna2: [140, 140, 60] },
    b:
    { cadera: [45, 57], tronco: 340, cabeza: 330, brazo1: [125, 55], brazo2: [230, 200],
      pierna1: [150, 150, 60], pierna2: [140, 140, 60] } },

  /* ---- tracción en barra ---- */
  cal_colgado: { escena: 'barra', a:
    { cadera: [50, 47], tronco: 270, cabeza: 270, brazo1: [275, 275], brazo2: [265, 265],
      pierna1: [90, 90, 160], pierna2: [90, 90, 160] } },

  cal_escapular: { escena: 'barra', a:
    { cadera: [50, 49], tronco: 270, cabeza: 270, brazo1: [272, 272], brazo2: [268, 268],
      pierna1: [90, 90, 160], pierna2: [90, 90, 160] },
    b:
    { cadera: [50, 44], tronco: 270, cabeza: 270, brazo1: [272, 272], brazo2: [268, 268],
      pierna1: [90, 90, 160], pierna2: [90, 90, 160] } },

  cal_dominada_negativa: { escena: 'barra', a:
    { cadera: [50, 38], tronco: 270, cabeza: 270, brazo1: [310, 240], brazo2: [230, 300],
      pierna1: [95, 105, 175], pierna2: [95, 105, 175] },
    b:
    { cadera: [50, 48], tronco: 270, cabeza: 270, brazo1: [273, 273], brazo2: [267, 267],
      pierna1: [90, 90, 160], pierna2: [90, 90, 160] } },

  cal_dominada_explosiva: { escena: 'barra', a:
    { cadera: [50, 48], tronco: 270, cabeza: 270, brazo1: [273, 273], brazo2: [267, 267],
      pierna1: [90, 90, 160], pierna2: [90, 90, 160] },
    b:
    { cadera: [50, 34], tronco: 265, cabeza: 265, brazo1: [320, 230], brazo2: [220, 310],
      pierna1: [100, 110, 180], pierna2: [100, 110, 180] } },

  cal_dominada_arquera: { escena: 'barra', a:
    { cadera: [56, 46], tronco: 270, cabeza: 275, brazo1: [300, 250], brazo2: [215, 215],
      pierna1: [95, 100, 170], pierna2: [95, 100, 170] },
    b:
    { cadera: [60, 38], tronco: 272, cabeza: 278, brazo1: [320, 225], brazo2: [205, 205],
      pierna1: [98, 105, 175], pierna2: [98, 105, 175] } },

  cal_dominada_typewriter: { escena: 'barra', a:
    { cadera: [60, 38], tronco: 272, cabeza: 278, brazo1: [320, 225], brazo2: [205, 205],
      pierna1: [98, 105, 175], pierna2: [98, 105, 175] },
    b:
    { cadera: [40, 38], tronco: 268, cabeza: 262, brazo1: [220, 315], brazo2: [335, 335],
      pierna1: [82, 75, 5], pierna2: [82, 75, 5] } },

  cal_dominada_un_brazo_asist: { escena: 'barra', a:
    { cadera: [50, 46], tronco: 268, cabeza: 272, brazo1: [280, 262], brazo2: [290, 250],
      pierna1: [95, 100, 170], pierna2: [95, 100, 170] },
    b:
    { cadera: [50, 36], tronco: 268, cabeza: 272, brazo1: [310, 235], brazo2: [315, 230],
      pierna1: [100, 108, 178], pierna2: [100, 108, 178] } },

  cal_dominada_un_brazo: { escena: 'barra', a:
    { cadera: [52, 46], tronco: 272, cabeza: 276, brazo1: [278, 268], brazo2: [120, 150],
      pierna1: [95, 100, 170], pierna2: [95, 100, 170] },
    b:
    { cadera: [54, 36], tronco: 274, cabeza: 280, brazo1: [312, 232], brazo2: [125, 155],
      pierna1: [100, 108, 178], pierna2: [100, 108, 178] } },

  cal_transicion_mu: { escena: 'barra', a:
    { cadera: [50, 34], tronco: 265, cabeza: 265, brazo1: [320, 230], brazo2: [220, 310],
      pierna1: [100, 110, 180], pierna2: [100, 110, 180] },
    b:
    { cadera: [50, 30], tronco: 280, cabeza: 290, brazo1: [340, 80], brazo2: [200, 100],
      pierna1: [95, 95, 165], pierna2: [95, 95, 165] } },

  cal_mu_negativo: { escena: 'barra', a:
    { cadera: [50, 26], tronco: 275, cabeza: 275, brazo1: [95, 85], brazo2: [85, 95],
      pierna1: [92, 92, 162], pierna2: [92, 92, 162] },
    b:
    { cadera: [50, 46], tronco: 270, cabeza: 270, brazo1: [275, 275], brazo2: [265, 265],
      pierna1: [90, 90, 160], pierna2: [90, 90, 160] } },

  cal_skin_the_cat: { escena: 'barra', a:
    { cadera: [50, 40], tronco: 270, cabeza: 270, brazo1: [280, 265], brazo2: [260, 275],
      pierna1: [30, 0, 330], pierna2: [30, 0, 330] },
    b:
    { cadera: [46, 30], tronco: 100, cabeza: 100, brazo1: [340, 300], brazo2: [340, 300],
      pierna1: [95, 95, 165], pierna2: [95, 95, 165] } },

  /* ---- palancas ---- */
  cal_fl_tuck: { escena: 'barra', a:
    { cadera: [58, 36], tronco: 180, cabeza: 190, brazo1: [265, 265], brazo2: [265, 265],
      pierna1: [320, 60, 130], pierna2: [320, 60, 130] } },

  cal_fl_tuck_av: { escena: 'barra', a:
    { cadera: [58, 36], tronco: 180, cabeza: 190, brazo1: [265, 265], brazo2: [265, 265],
      pierna1: [0, 70, 140], pierna2: [0, 70, 140] } },

  cal_fl_straddle: { escena: 'barra', a:
    { cadera: [58, 36], tronco: 180, cabeza: 190, brazo1: [265, 265], brazo2: [265, 265],
      pierna1: [20, 20, 90], pierna2: [340, 340, 50] } },

  cal_fl_full: { escena: 'barra', a:
    { cadera: [58, 36], tronco: 180, cabeza: 190, brazo1: [265, 265], brazo2: [265, 265],
      pierna1: [0, 0, 70], pierna2: [0, 0, 70] } },

  cal_fl_remo: { escena: 'barra', a:
    { cadera: [64, 40], tronco: 180, cabeza: 190, brazo1: [280, 280], brazo2: [280, 280],
      pierna1: [0, 0, 70], pierna2: [0, 0, 70] },
    b:
    { cadera: [64, 26], tronco: 180, cabeza: 190, brazo1: [225, 315], brazo2: [225, 315],
      pierna1: [0, 0, 70], pierna2: [0, 0, 70] } },

  cal_bl_tuck: { escena: 'barra', a:
    { cadera: [42, 36], tronco: 0, cabeza: 10, brazo1: [255, 275], brazo2: [255, 275],
      pierna1: [220, 120, 50], pierna2: [220, 120, 50] } },

  cal_bl_straddle: { escena: 'barra', a:
    { cadera: [42, 36], tronco: 0, cabeza: 10, brazo1: [255, 275], brazo2: [255, 275],
      pierna1: [200, 200, 270], pierna2: [160, 160, 230] } },

  cal_bl_full: { escena: 'barra', a:
    { cadera: [42, 36], tronco: 0, cabeza: 10, brazo1: [255, 275], brazo2: [255, 275],
      pierna1: [180, 180, 250], pierna2: [180, 180, 250] } },

  /* ---- core en el suelo ---- */
  cal_hollow: { escena: 'suelo', a:
    { cadera: [50, 60], tronco: 200, cabeza: 215, brazo1: [200, 200], brazo2: [200, 200],
      pierna1: [340, 340, 50], pierna2: [340, 340, 50] } },

  cal_hollow_rock: { escena: 'suelo', a:
    { cadera: [48, 60], tronco: 205, cabeza: 220, brazo1: [205, 205], brazo2: [205, 205],
      pierna1: [335, 335, 45], pierna2: [335, 335, 45] },
    b:
    { cadera: [52, 58], tronco: 190, cabeza: 205, brazo1: [190, 190], brazo2: [190, 190],
      pierna1: [350, 350, 60], pierna2: [350, 350, 60] } },

  cal_lsit_tuck: { escena: 'suelo', a:
    { cadera: [50, 50], tronco: 280, cabeza: 280, brazo1: [95, 95], brazo2: [95, 95],
      pierna1: [350, 80, 150], pierna2: [350, 80, 150] } },

  cal_lsit_una: { escena: 'suelo', a:
    { cadera: [50, 50], tronco: 280, cabeza: 280, brazo1: [95, 95], brazo2: [95, 95],
      pierna1: [0, 0, 70], pierna2: [350, 80, 150] } },

  cal_lsit: { escena: 'suelo', a:
    { cadera: [50, 50], tronco: 280, cabeza: 280, brazo1: [95, 95], brazo2: [95, 95],
      pierna1: [0, 0, 70], pierna2: [0, 0, 70] } },

  cal_vsit: { escena: 'suelo', a:
    { cadera: [50, 54], tronco: 300, cabeza: 300, brazo1: [95, 95], brazo2: [92, 92],
      pierna1: [305, 305, 15], pierna2: [302, 302, 12] } },

  cal_dragon_negativa: { escena: 'suelo', a:
    { cadera: [50, 38], tronco: 160, cabeza: 170, brazo1: [190, 175], brazo2: [190, 175],
      pierna1: [340, 340, 50], pierna2: [340, 340, 50] },
    b:
    { cadera: [56, 56], tronco: 195, cabeza: 205, brazo1: [175, 165], brazo2: [175, 165],
      pierna1: [10, 10, 80], pierna2: [10, 10, 80] } },

  cal_dragon_tuck: { escena: 'suelo', a:
    { cadera: [50, 40], tronco: 165, cabeza: 175, brazo1: [190, 175], brazo2: [190, 175],
      pierna1: [300, 40, 110], pierna2: [300, 40, 110] },
    b:
    { cadera: [56, 54], tronco: 195, cabeza: 205, brazo1: [175, 165], brazo2: [175, 165],
      pierna1: [330, 60, 130], pierna2: [330, 60, 130] } },

  cal_dragon_full: { escena: 'suelo', a:
    { cadera: [50, 36], tronco: 160, cabeza: 170, brazo1: [190, 175], brazo2: [190, 175],
      pierna1: [340, 340, 50], pierna2: [340, 340, 50] },
    b:
    { cadera: [56, 58], tronco: 200, cabeza: 210, brazo1: [175, 165], brazo2: [175, 165],
      pierna1: [15, 15, 85], pierna2: [15, 15, 85] } },

  cal_limpia_parabrisas: { escena: 'barra', a:
    { cadera: [50, 44], tronco: 270, cabeza: 270, brazo1: [275, 275], brazo2: [265, 265],
      pierna1: [330, 330, 40], pierna2: [330, 330, 40] },
    b:
    { cadera: [50, 44], tronco: 270, cabeza: 270, brazo1: [275, 275], brazo2: [265, 265],
      pierna1: [210, 210, 280], pierna2: [210, 210, 280] } },

  /* ---- bandera ---- */
  cal_bandera_apoyo: { escena: 'poste', a:
    { cadera: [34, 44], tronco: 275, cabeza: 275, brazo1: [255, 250], brazo2: [175, 185],
      pierna1: [92, 92, 162], pierna2: [92, 92, 162] } },

  cal_bandera_tuck: { escena: 'poste', a:
    { cadera: [52, 34], tronco: 180, cabeza: 190, brazo1: [230, 200], brazo2: [160, 190],
      pierna1: [320, 60, 130], pierna2: [320, 60, 130] } },

  cal_bandera_straddle: { escena: 'poste', a:
    { cadera: [52, 34], tronco: 180, cabeza: 190, brazo1: [230, 200], brazo2: [160, 190],
      pierna1: [20, 20, 90], pierna2: [340, 340, 50] } },

  cal_bandera_full: { escena: 'poste', a:
    { cadera: [52, 34], tronco: 180, cabeza: 190, brazo1: [230, 200], brazo2: [160, 190],
      pierna1: [0, 0, 70], pierna2: [0, 0, 70] } },

  /* ---- pierna ---- */
  cal_sent_caja_una: { escena: 'cajon', a:
    { cadera: [56, 38], tronco: 275, cabeza: 275, brazo1: [10, 10], brazo2: [10, 10],
      pierna1: [90, 90, 160], pierna2: [20, 90, 160] },
    b:
    { cadera: [58, 52], tronco: 300, cabeza: 300, brazo1: [350, 350], brazo2: [350, 350],
      pierna1: [130, 60, 130], pierna2: [350, 85, 155] } },

  cal_shrimp: { escena: 'suelo', a:
    { cadera: [50, 40], tronco: 275, cabeza: 275, brazo1: [200, 200], brazo2: [10, 10],
      pierna1: [90, 90, 160], pierna2: [120, 200, 270] },
    b:
    { cadera: [52, 48], tronco: 285, cabeza: 285, brazo1: [200, 200], brazo2: [350, 350],
      pierna1: [110, 70, 140], pierna2: [150, 230, 300] } },

  cal_pistol_asistida: { escena: 'suelo', a:
    { cadera: [50, 40], tronco: 275, cabeza: 275, brazo1: [340, 340], brazo2: [340, 340],
      pierna1: [90, 90, 160], pierna2: [10, 10, 80] },
    b:
    { cadera: [48, 56], tronco: 300, cabeza: 300, brazo1: [340, 340], brazo2: [340, 340],
      pierna1: [140, 50, 120], pierna2: [350, 350, 60] } },

  cal_pistol: { escena: 'suelo', a:
    { cadera: [50, 40], tronco: 275, cabeza: 275, brazo1: [0, 0], brazo2: [0, 0],
      pierna1: [90, 90, 160], pierna2: [10, 10, 80] },
    b:
    { cadera: [48, 56], tronco: 300, cabeza: 300, brazo1: [350, 350], brazo2: [350, 350],
      pierna1: [140, 50, 120], pierna2: [350, 350, 60] } },

  cal_nordic: { escena: 'suelo', a:
    { cadera: [50, 44], tronco: 270, cabeza: 270, brazo1: [0, 0], brazo2: [0, 0],
      pierna1: [110, 175, 245], pierna2: [110, 175, 245] },
    b:
    { cadera: [42, 52], tronco: 330, cabeza: 330, brazo1: [40, 60], brazo2: [40, 60],
      pierna1: [150, 175, 245], pierna2: [150, 175, 245] } },

  cal_gemelo_una: { escena: 'suelo', a:
    { cadera: [50, 40], tronco: 275, cabeza: 275, brazo1: [90, 90], brazo2: [90, 90],
      pierna1: [90, 90, 160], pierna2: [70, 110, 180] },
    b:
    { cadera: [50, 34], tronco: 275, cabeza: 275, brazo1: [90, 90], brazo2: [90, 90],
      pierna1: [90, 90, 120], pierna2: [70, 110, 180] } },

  /* ---- apoyo ---- */
  cal_apoyo_paralelas: { escena: 'paralelas', a:
    { cadera: [50, 48], tronco: 272, cabeza: 272, brazo1: [272, 272], brazo2: [268, 268],
      pierna1: [90, 90, 160], pierna2: [90, 90, 160] } }
};

  /* Al catálogo. Lo de siempre —id, músculos, material— más lo propio de la
     calistenia, que es de dónde vienes y qué necesitas para estar aquí: eso va
     dentro de las instrucciones, porque es donde la app ya sabe enseñarlo. */
  /* Se compone al leerlo, no al cargar el archivo: lleva el nombre de la
     familia y el número de escalón dentro de la frase, y pegarlos con + deja
     tres trozos que ningún diccionario puede casar. */
  function pasosDe(e) {
    const T = (g.Idioma && g.Idioma.T) || function (x) { return x; };
    const Tn = (g.Idioma && g.Idioma.Tn) || function (x) { return x; };
    const pasos = [];
    if (e.familia) {
      pasos.push(e.paso
        ? Tn('Progresión: {familia} · escalón {n}.', { familia: T(e.familia), n: e.paso })
        : Tn('Progresión: {familia}.', { familia: T(e.familia) }));
    }
    if (e.requisito) {
      pasos.push(Tn('Antes de empezar con este: {que}', { que: T(e.requisito) }));
    }
    pasos.push(T(e.desc));
    (e.claves || []).forEach(function (c) { pasos.push(T(c)); });
    return pasos;
  }

  function crudos() {
    return EJERCICIOS.map(function (e) {
      const pasos = pasosDe(e);

      return {
        id: e.id,
        name: e.name,
        nameEs: e.nameEs,
        force: e.fuerza,
        level: e.nivel,
        mechanic: 'compound',
        /* «body only» sale con cualquier ajuste de material; «other» queda
           fuera de casa, que es lo correcto para lo que pide barra o
           paralelas. Es la misma etiqueta que el catálogo le pone al
           muscle-up y a los fondos en anillas. */
        equipment: e.suelo ? 'body only' : 'other',
        primaryMuscles: e.primary ? [e.primary] : [],
        /* El catálogo no tiene «obliques» ni «hip flexors» como músculos, así
           que se traducen a los que sí existen y no se pierde el filtro. */
        secondaryMuscles: (e.secondary || []).map(function (m) {
          if (m === 'obliques') return 'abdominals';
          if (m === 'hip flexors') return 'quadriceps';
          return m;
        }).filter(function (m, i, a) { return a.indexOf(m) === i; }),
        instructions: pasos,
        _pasos: function () { return pasosDe(e); },
        /* Los fotogramas salen dibujados, no de una foto: entran por el mismo
           sitio que las del catálogo y el reproductor de siempre los anima. */
        /* La ilustracion de verdad manda sobre el dibujo. El muñeco se queda
           solo donde no hay foto de nada. */
        foto: e.foto || null,
        figura: FIGURAS[e.id] || null,
        /* Escrito en español de origen. Sin esto, la app las mandaría a
           traducir «del catálogo original» como hace con las del inglés, y lo
           que saldría sería español pasado por un traductor: peor que lo que
           ya hay, y gastando una llamada por ejercicio. */
        yaEnEspanol: true,
        category: 'calistenia',
        images: (g.Figura && FIGURAS[e.id])
          ? Figura.fotogramas(FIGURAS[e.id]) : []
      };
    });
  }

  /* Las familias, en el orden en el que se entrenan, para poder enseñar una
     progresión entera de un vistazo. */
  function familias() {
    const vistas = [];
    EJERCICIOS.forEach(function (e) {
      if (e.familia && vistas.indexOf(e.familia) === -1) vistas.push(e.familia);
    });
    return vistas.map(function (f) {
      return {
        nombre: f,
        pasos: EJERCICIOS.filter(function (e) { return e.familia === f; })
          .sort(function (a, b) { return (a.paso || 0) - (b.paso || 0); })
          .map(function (e) {
            return { id: e.id, nameEs: e.nameEs, paso: e.paso, requisito: e.requisito };
          })
      };
    });
  }

  g.Calistenia = {
    crudos: crudos, familias: familias, cuantos: EJERCICIOS.length
  };
})(window);
