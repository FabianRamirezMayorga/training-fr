/* textos-en-tecnica.js — las guías de técnica, en inglés.

   Tercer archivo de traducción, por la misma razón que el manual va aparte: son
   otras ocho mil palabras, y mezcladas con los botones no hay quien encuentre
   nada. Aquí viven las guías de tecnica.js —cómo colocarse, el recorrido, la
   respiración, los errores— y las de calistenia.js.

   La clave es la frase en español tal cual está escrita en aquellos archivos.
   Todas pasan por una sola función, `guiaHTML` en app.js, así que si una frase
   sale en español es que la clave no coincide carácter a carácter.

   Cuidado con el vocabulario: aquí «press de banca» es «bench press» y no una
   traducción literal. El lector en inglés es quien usa esos nombres, no quien
   los aprende. */
(function (g) {
  'use strict';

  const TECNICA = {

    /* ---------- lo que se repite en todas las guías ---------- */
    'Bajada': 'Lowering',
    'Subida': 'Lifting',
    'Ida': 'Out',
    'Vuelta': 'Back',
    'Aguante': 'Hold',
    'Salida': 'Start',
    'Recorrido': 'Movement',

    /* ---------- press de banca ---------- */
    'Press de banca': 'Bench press',
    'Túmbate con los ojos justo debajo de la barra. Cinco puntos de apoyo: cabeza, espalda alta, glúteos y los dos pies en el suelo.':
      'Lie down with your eyes directly under the bar. Five points of contact: head, upper back, glutes and both feet on the floor.',
    'Junta las escápulas y húndelas hacia los glúteos, como si quisieras guardarlas en los bolsillos traseros. El pecho queda alto y aparece un arco natural en la zona lumbar.':
      'Pull your shoulder blades together and down towards your glutes, as if tucking them into your back pockets. Your chest stays high and a natural arch appears in your lower back.',
    'Agarra la barra algo más ancho que los hombros. Rodea con el pulgar, nunca por encima.':
      'Grip the bar slightly wider than your shoulders. Wrap the thumb around, never over the top.',
    'Baja la barra en 2 segundos hacia la parte baja del pecho, a la altura de los pezones. Los codos van a unos 45 grados del torso, no abiertos en cruz. La barra toca el pecho sin rebotar.':
      'Lower the bar over 2 seconds to your lower chest, at nipple height. Elbows at about 45 degrees to your torso, not flared straight out. The bar touches your chest without bouncing.',
    'Empuja el suelo con los pies y sube la barra en línea ligeramente diagonal, hacia los hombros. Termina con los codos extendidos pero sin bloquearlos de golpe.':
      'Drive the floor with your feet and press the bar on a slightly diagonal path, back towards your shoulders. Finish with your elbows extended but without snapping them locked.',
    'Coge aire arriba, aguántalo durante la bajada y suelta al superar la mitad de la subida. Ese aire mantiene la caja torácica firme.':
      'Take a breath at the top, hold it on the way down and let it out past halfway up. That air is what keeps your ribcage solid.',
    '2 s bajando · 0 s abajo · 1 s subiendo': '2 s down · 0 s at the bottom · 1 s up',
    'Abrir los codos a 90 grados': 'Flaring your elbows to 90 degrees',
    'Castiga el hombro y resta fuerza. Mantenlos a unos 45 grados del cuerpo.':
      'It punishes the shoulder and costs you strength. Keep them at about 45 degrees to your body.',
    'Rebotar la barra en el pecho': 'Bouncing the bar off your chest',
    'Toca y empuja, sin impulso. Si necesitas rebote, tienes demasiado peso.':
      'Touch and press, no momentum. If you need the bounce, the weight is too heavy.',
    'Despegar los glúteos del banco': 'Lifting your glutes off the bench',
    'Deja los glúteos pegados. Si se levantan, baja el peso.':
      'Keep your glutes down. If they come up, drop the weight.',
    'Perder la retracción de las escápulas': 'Losing your shoulder blade retraction',
    'Mantén el pecho alto durante toda la serie; si se redondea la espalda alta, el pectoral deja de trabajar.':
      'Keep your chest high through the whole set; if your upper back rounds, the pec stops working.',
    'Piensa en separar el suelo del banco con los pies mientras empujas. La fuerza sale de todo el cuerpo, no solo de los brazos.':
      'Think about pushing the bench away from the floor with your feet as you press. The force comes from your whole body, not just your arms.',
    'Con barra libre y sin compañero, usa los seguros del rack a la altura del pecho.':
      'With a free barbell and no spotter, set the rack safeties at chest height.',

    /* ---------- flexión ---------- */
    'Flexión': 'Push-up',
    'Manos en el suelo un poco más abiertas que los hombros, a la altura del pecho, con los dedos apuntando al frente.':
      'Hands on the floor slightly wider than your shoulders, level with your chest, fingers pointing forwards.',
    'Cuerpo en línea recta desde la cabeza hasta los talones. Aprieta glúteos y abdomen como si fueras una tabla.':
      'Body in a straight line from head to heels. Squeeze your glutes and abs as if you were a plank.',
    'Empuja el suelo para separar ligeramente las escápulas: el torso no debe hundirse entre los brazos.':
      'Push the floor away to spread your shoulder blades slightly: your torso should not sag between your arms.',
    'Baja el cuerpo entero como un bloque hasta que el pecho quede a un puño del suelo. Los codos se cierran hacia atrás formando una flecha con el torso, no una T.':
      'Lower your whole body as one block until your chest is a fist off the floor. Your elbows travel back to form an arrow with your torso, not a T.',
    'Empuja el suelo y vuelve arriba manteniendo la línea. Al final, separa un poco más las escápulas para completar el recorrido.':
      'Push the floor away and come back up holding the line. At the top, spread your shoulder blades a little further to finish the movement.',
    'Inspira al bajar, espira al empujar.': 'Breathe in on the way down, out as you press.',
    '2 s bajando · 1 s subiendo': '2 s down · 1 s up',
    'La cadera se hunde': 'Your hips sag',
    'Aprieta glúteos y abdomen. Si no aguantas la línea, apoya las rodillas.':
      'Squeeze your glutes and abs. If you cannot hold the line, drop to your knees.',
    'La cabeza se adelanta': 'Your head juts forward',
    'Mira un punto del suelo un palmo por delante de las manos y mantén el cuello alineado.':
      'Look at a spot on the floor a hand’s width in front of your hands and keep your neck in line.',
    'Recorrido corto': 'Short range of motion',
    'Baja hasta que el pecho casi roce. Media flexión da medio resultado.':
      'Go down until your chest almost grazes the floor. Half a push-up gives you half the result.',
    'Es una plancha que se mueve: si el abdomen se relaja, el ejercicio se convierte en otra cosa.':
      'It is a moving plank: the moment your abs relax, the exercise turns into something else.',

    /* ---------- fondos, aperturas y press militar ---------- */
    'Fondos':
      'Dips',
    'Agárrate a las paralelas con los brazos extendidos y los hombros lejos de las orejas.':
      'Hold the bars with your arms extended and your shoulders away from your ears.',
    'Cruza los tobillos y mantén el cuerpo firme, sin balanceo.':
      'Cross your ankles and keep your body tight, with no swinging.',
    'Para dar más al pecho, inclina el torso hacia delante. Para dar más al tríceps, mantente vertical.':
      'To hit the chest more, lean your torso forwards. To hit the triceps more, stay upright.',
    'Baja controlado hasta que los codos formen unos 90 grados. No bajes más: el hombro sufre en exceso por debajo de ese punto.':
      'Lower under control until your elbows reach about 90 degrees. Do not go lower: below that point the shoulder takes too much.',
    'Empuja hasta extender los codos, sin bloquear con un golpe seco.':
      'Press until your elbows extend, without snapping them locked.',
    'Aire al bajar, suéltalo al subir.':
      'Breathe in on the way down, out on the way up.',
    'Encoger los hombros':
      'Shrugging your shoulders up',
    'Mantén el pecho alto y los hombros lejos de las orejas durante todo el recorrido.':
      'Keep your chest high and your shoulders away from your ears throughout.',
    'Bajar demasiado':
      'Going too deep',
    'Para en 90 grados si notas tirón en la parte delantera del hombro.':
      'Stop at 90 degrees if you feel a pull at the front of the shoulder.',
    'Balancearse para subir':
      'Swinging to get back up',
    'Si necesitas impulso, usa una goma o la máquina asistida.':
      'If you need momentum, use a band or the assisted machine.',
    'Ejercicio exigente para el hombro. Si notas pinchazos delante del hombro, cambia a fondos en banco o press cerrado.':
      'A demanding exercise for the shoulder. If you feel sharp pain at the front of the shoulder, switch to bench dips or close-grip press.',
    'Aperturas':
      'Flyes',
    'Túmbate o colócate con el pecho alto y las escápulas juntas.':
      'Lie down or set up with your chest high and your shoulder blades together.',
    'Brazos abiertos con los codos ligeramente flexionados. Esa flexión no cambia en todo el ejercicio.':
      'Arms out with your elbows slightly bent. That bend does not change for the whole exercise.',
    'Apertura':
      'Opening',
    'Abre los brazos en arco hasta notar el estiramiento del pectoral, con las manos a la altura del pecho. No bajes más allá de la línea del torso.':
      'Open your arms in an arc until you feel the pec stretch, hands level with your chest. Do not go past the line of your torso.',
    'Cierre':
      'Closing',
    'Junta las manos dibujando el mismo arco, como si abrazaras un barril. Aprieta el pectoral arriba.':
      'Bring your hands together along the same arc, as if hugging a barrel. Squeeze the pec at the top.',
    'Inspira al abrir, espira al juntar.':
      'Breathe in as you open, out as you bring your hands together.',
    '3 s abriendo · 1 s cerrando':
      '3 s opening · 1 s closing',
    'Convertirlo en un press':
      'Turning it into a press',
    'Si flexionas y extiendes los codos, ya no es una apertura. El ángulo del codo se queda fijo.':
      'If you bend and extend your elbows it is no longer a fly. The elbow angle stays fixed.',
    'Bajar demasiado los brazos':
      'Taking your arms down too far',
    'Pasar de la línea del torso estresa la cápsula del hombro sin ganar nada.':
      'Going past the line of your torso stresses the shoulder capsule for nothing.',
    'Usar demasiado peso':
      'Using too much weight',
    'Es un ejercicio de aislamiento: manda la sensación en el pectoral, no la cifra.':
      'It is an isolation exercise: what matters is the feeling in the pec, not the number.',
    'Imagina que abrazas un árbol grueso: los brazos dibujan un arco amplio, nunca líneas rectas.':
      'Imagine hugging a thick tree: your arms trace a wide arc, never straight lines.',
    'Press militar':
      'Overhead press',
    'De pie, pies al ancho de las caderas, barra apoyada en la parte alta del pecho.':
      'Standing, feet hip-width apart, bar resting on your upper chest.',
    'Manos algo más abiertas que los hombros, codos ligeramente por delante de la barra.':
      'Hands slightly wider than your shoulders, elbows just in front of the bar.',
    'Aprieta glúteos y abdomen: son los que evitan que la espalda se arquee al empujar.':
      'Squeeze your glutes and abs: they are what stop your back arching as you press.',
    'Mete la barbilla hacia atrás para dejar paso a la barra y empuja en vertical. Cuando la barra pase la frente, mete la cabeza hacia delante: la barra acaba justo encima de la coronilla, no por delante.':
      'Tuck your chin back to clear a path for the bar and press straight up. Once the bar passes your forehead, push your head through: the bar finishes directly over the crown of your head, not out in front.',
    'Baja controlado por la misma línea hasta las clavículas.':
      'Lower under control along the same line back to your collarbones.',
    'Coge aire abajo, aguanta durante el empuje y suelta arriba.':
      'Take a breath at the bottom, hold it through the press and let it out at the top.',
    '1 s subiendo · 2 s bajando':
      '1 s up · 2 s down',
    'Arquear la espalda baja':
      'Arching your lower back',
    'La cabeza se aparta y vuelve: ese pequeño movimiento es lo que permite que la barra suba recta.':
      'Your head moves out of the way and back: that small movement is what lets the bar travel straight up.',

    /* ---------- dominadas, jalon y remo ---------- */
    'Aprieta glúteos y costillas hacia abajo. Si sigue pasando, baja el peso o hazlo sentado con respaldo.':
      'Squeeze your glutes and pull your ribs down. If it keeps happening, drop the weight or do it seated with a back support.',
    'Dejar la barra por delante arriba':
      'Leaving the bar out in front at the top',
    'Termina con la barra sobre la cabeza; si queda adelantada, el hombro trabaja en desventaja.':
      'Finish with the bar over your head; if it stays forward, the shoulder works at a disadvantage.',
    'Empujar con las piernas':
      'Driving with your legs',
    'En el militar estricto las piernas no ayudan. Si flexionas rodillas, estás haciendo push press.':
      'In a strict overhead press the legs do not help. If you bend your knees, you are doing a push press.',
    'Dominadas':
      'Pull-ups',
    'Agarre algo más ancho que los hombros, palmas hacia delante, pulgar rodeando la barra.':
      'Grip slightly wider than your shoulders, palms facing away, thumb wrapped around the bar.',
    'Cuelga con los brazos extendidos pero con los hombros activos: baja las escápulas antes de tirar, sin quedar descolgado del todo.':
      'Hang with your arms extended but your shoulders active: pull your shoulder blades down before you pull, without hanging completely dead.',
    'Aprieta glúteos y abdomen, piernas juntas y algo por delante para no balancearte.':
      'Squeeze your glutes and abs, legs together and slightly forward so you do not swing.',
    'Empieza bajando las escápulas y después tira con los codos hacia el suelo, llevándolos al costado. Sube hasta pasar la barbilla por encima de la barra, con el pecho hacia ella.':
      'Start by pulling your shoulder blades down, then drive your elbows towards the floor and into your sides. Come up until your chin clears the bar, chest towards it.',
    'Baja en 3 segundos hasta extender los brazos. La bajada controlada es la que más hace crecer la espalda.':
      'Lower over 3 seconds until your arms are extended. The controlled descent is what builds the back most.',
    'Espira al subir, inspira al bajar.':
      'Breathe out on the way up, in on the way down.',
    '1 s subiendo · 3 s bajando':
      '1 s up · 3 s down',
    'Balancear el cuerpo':
      'Swinging your body',
    'Si necesitas impulso, usa una goma o la máquina asistida y haz repeticiones limpias.':
      'If you need momentum, use a band or the assisted machine and do clean reps.',
    'Sube hasta pasar la barbilla y baja hasta estirar. Media dominada no cuenta.':
      'Come up past your chin and go down to full extension. Half a pull-up does not count.',
    'Tirar solo con los brazos':
      'Pulling with your arms alone',
    'Piensa en llevar los codos al bolsillo trasero: así entra la espalda antes que el bíceps.':
      'Think about driving your elbows into your back pockets: that way the back works before the biceps.',
    'Primero bajan los hombros, después suben los codos. Si empiezas tirando con los brazos, la espalda apenas participa.':
      'The shoulders go down first, then the elbows come up. If you start by pulling with your arms, the back barely joins in.',
    'Jalón al pecho':
      'Lat pulldown',
    'Ajusta el rodillo para que las piernas queden bien sujetas y no te levantes al tirar.':
      'Set the thigh pad so your legs are held firmly and you do not lift off as you pull.',
    'Agarre algo más ancho que los hombros. Siéntate con el pecho alto y una inclinación hacia atrás de unos 20 grados, sin más.':
      'Grip slightly wider than your shoulders. Sit with your chest high and lean back about 20 degrees, no more.',
    'Tirón':
      'Pull',
    'Baja las escápulas y lleva la barra hacia la parte alta del pecho, con los codos apuntando al suelo. Para cuando la barra llegue a las clavículas.':
      'Pull your shoulder blades down and bring the bar to your upper chest, elbows pointing at the floor. Stop when the bar reaches your collarbones.',
    'Deja que la barra suba en 3 segundos hasta estirar los brazos y permitir que los hombros suban un poco: ese estiramiento final es parte del ejercicio.':
      'Let the bar rise over 3 seconds until your arms are straight and your shoulders come up a little: that final stretch is part of the exercise.',
    'Espira al tirar, inspira al volver.':
      'Breathe out as you pull, in as you return.',
    '1 s tirando · 3 s volviendo':
      '1 s pulling · 3 s returning',
    'Tirar por detrás de la nuca':
      'Pulling behind your neck',
    'Es incómodo para el hombro y el cuello y no aporta nada. Siempre al pecho.':
      'It is hard on the shoulder and neck and adds nothing. Always to the chest.',
    'Echarse muy atrás':
      'Leaning back too far',
    'Más de 30 grados convierte el jalón en un remo. Inclinación ligera y constante.':
      'More than 30 degrees turns the pulldown into a row. Keep the lean slight and constant.',
    'Soltar de golpe':
      'Letting it fly back',
    'La vuelta controlada es donde más trabaja el dorsal.':
      'The controlled return is where the lat works hardest.',
    'Si notas más el bíceps que la espalda, prueba con agarre neutro y piensa en empujar los codos hacia abajo.':
      'If you feel your biceps more than your back, try a neutral grip and think about driving your elbows down.',
    'Remo':
      'Row',
    'Con barra: pies al ancho de caderas, rodillas algo flexionadas, cadera hacia atrás hasta que el torso quede a unos 45 grados o algo más horizontal.':
      'With a barbell: feet hip-width apart, knees slightly bent, hips back until your torso is at about 45 degrees or a little closer to horizontal.',
    'Espalda recta y neutra: ni redondeada ni exageradamente arqueada. La mirada al suelo un metro por delante.':
      'Back straight and neutral: neither rounded nor heavily arched. Look at the floor a metre in front of you.',
    'Barra colgando con los brazos extendidos, cerca de las espinillas.':
      'Bar hanging with your arms extended, close to your shins.',
    'Lleva la barra hacia el ombligo o la parte baja del abdomen, con los codos pegados al cuerpo. Aprieta las escápulas al final, como si sujetaras un lápiz entre ellas.':
      'Pull the bar to your navel or lower abdomen, elbows close to your body. Squeeze your shoulder blades at the end, as if holding a pencil between them.',
    'Baja en 2 o 3 segundos hasta estirar los brazos, sin dejar que los hombros se vayan hacia delante en exceso ni que la espalda se redondee.':
      'Lower over 2 or 3 seconds until your arms are straight, without letting your shoulders drift too far forward or your back round.',
    'Espira al tirar, inspira al bajar.':
      'Breathe out as you pull, in as you lower.',
    '1 s tirando · 2 s bajando':
      '1 s pulling · 2 s lowering',
    'La cadera va hacia atrás, no las rodillas hacia delante. Si notas la lumbar, revisa esa posición antes que el peso.':
      'The hips go back, not the knees forward. If you feel it in your lower back, check that position before you check the weight.',
    'Con molestias lumbares, elige remo con apoyo en el pecho o remo sentado en polea.':
      'With lower back trouble, choose a chest-supported row or a seated cable row.',

    /* ---------- face pull, encogimientos y sentadilla ---------- */
    'Incorporarse en cada repetición':
      'Standing up on every rep',
    'El torso mantiene su ángulo. Si te levantas para subir el peso, está pesando demasiado.':
      'Your torso holds its angle. If you stand up to lift the weight, it is too heavy.',
    'Redondear la espalda baja':
      'Rounding your lower back',
    'Riesgo real para la lumbar. Baja el peso y apoya el pecho en un banco inclinado si te cuesta mantener la posición.':
      'A real risk for the lower back. Drop the weight and rest your chest on an incline bench if holding the position is hard.',
    'Tirar hacia el pecho con barra':
      'Pulling to your chest with a barbell',
    'Con agarre prono, la barra va al abdomen. Al pecho es un ejercicio distinto y más incómodo.':
      'With an overhand grip the bar goes to your abdomen. To the chest is a different and more awkward exercise.',
    'Face pull':
      'Face pull',
    'Polea a la altura de la cara con cuerda. Agarre con las palmas enfrentadas.':
      'Cable set at face height with a rope. Grip with your palms facing each other.',
    'Da un paso atrás hasta notar tensión, pies escalonados para mantener el equilibrio.':
      'Step back until you feel tension, one foot in front of the other for balance.',
    'Tira de la cuerda hacia la frente separando las manos, con los codos altos, a la altura de los hombros. Termina con las manos a los lados de la cabeza, como haciendo un doble bíceps.':
      'Pull the rope towards your forehead, pulling your hands apart, elbows high at shoulder height. Finish with your hands beside your head, as if striking a double biceps pose.',
    'Vuelve despacio hasta que los brazos se extiendan y los hombros se adelanten un poco.':
      'Return slowly until your arms extend and your shoulders come forward a little.',
    '1 s tirando · 2 s volviendo · 1 s de pausa al final':
      '1 s pulling · 2 s returning · 1 s pause at the end',
    'Bajar los codos':
      'Dropping your elbows',
    'Si los codos caen, se convierte en un remo. Manténlos altos.':
      'If your elbows drop it turns into a row. Keep them high.',
    'Demasiado peso':
      'Too much weight',
    'Es un ejercicio de salud del hombro. Con exceso de carga el trapecio se lo lleva todo.':
      'This is a shoulder health exercise. Overload it and the traps take over completely.',
    'De los mejores ejercicios para compensar tantos empujes. Encaja bien al final de los días de pecho.':
      'One of the best exercises for balancing out all that pressing. It fits well at the end of chest days.',
    'Encogimientos':
      'Shrugs',
    'De pie, peso colgando a los lados o delante, brazos extendidos.':
      'Standing, weight hanging at your sides or in front, arms extended.',
    'Pecho alto, mirada al frente y abdomen firme.':
      'Chest high, eyes forward and abs tight.',
    'Sube los hombros en vertical, hacia las orejas, todo lo que puedas. Aguanta un segundo arriba.':
      'Lift your shoulders straight up towards your ears, as far as you can. Hold for a second at the top.',
    'Baja despacio hasta notar el estiramiento del trapecio.':
      'Lower slowly until you feel the stretch in your traps.',
    '1 s subiendo · 1 s de pausa · 2 s bajando':
      '1 s up · 1 s pause · 2 s down',
    'Girar los hombros':
      'Rolling your shoulders',
    'Los círculos no aportan y comprometen el hombro. El movimiento es solo arriba y abajo.':
      'Circles add nothing and put the shoulder at risk. The movement is straight up and down.',
    'Flexionar los codos':
      'Bending your elbows',
    'Los brazos son ganchos: si tiras con ellos, deja de trabajar el trapecio.':
      'Your arms are hooks: if you pull with them, the traps stop working.',
    'La pausa arriba vale más que añadir peso.':
      'The pause at the top is worth more than adding weight.',
    'Sentadilla':
      'Squat',
    'Barra apoyada en la parte alta de la espalda, sobre los trapecios, no sobre el cuello.':
      'Bar resting on your upper back, on the traps, not on your neck.',
    'Pies al ancho de los hombros o algo más, puntas ligeramente hacia fuera, entre 15 y 30 grados.':
      'Feet shoulder-width apart or a little wider, toes turned out slightly, between 15 and 30 degrees.',
    'Coge aire, llena el abdomen y aprieta como si fueras a recibir un golpe. Mirada al frente o algo abajo.':
      'Take a breath, fill your abdomen and brace as if you were about to take a punch. Eyes forward or slightly down.',
    'Rompe a la vez con cadera y rodillas. Baja en 2 o 3 segundos hasta que la cadera quede por debajo de la rodilla, o hasta donde puedas mantener la espalda neutra. Las rodillas siguen la dirección de las puntas de los pies.':
      'Break at the hips and knees together. Lower over 2 or 3 seconds until your hips are below your knees, or as far as you can keep your back neutral. Your knees track the direction your toes point.',
    'Empuja el suelo con todo el pie y sube. La cadera y el pecho suben a la vez: si la cadera se adelanta, el ejercicio se convierte en un buenos días.':
      'Drive the floor with your whole foot and stand up. Hips and chest rise together: if your hips shoot up first, the exercise turns into a good morning.',
    'Coge aire arriba, aguanta durante toda la repetición y suelta al pasar el punto difícil de la subida.':
      'Take a breath at the top, hold it through the whole rep and let it out once you are past the hard point on the way up.',
    '3 s bajando · 0 s abajo · 1 s subiendo':
      '3 s down · 0 s at the bottom · 1 s up',
    'Las rodillas se van hacia dentro':
      'Your knees cave inwards',
    'Piensa en separar el suelo con los pies. Si persiste, refuerza glúteo medio con banda.':
      'Think about spreading the floor apart with your feet. If it persists, strengthen your glute medius with a band.',
    'Los talones se levantan':
      'Your heels lift',
    'Suele ser falta de movilidad de tobillo. Prueba con calzado de suela dura o una cuña; abrir un poco más las puntas también ayuda.':
      'It is usually a lack of ankle mobility. Try hard-soled shoes or a wedge; turning your toes out a little more also helps.',
    'La espalda se redondea abajo':
      'Your back rounds at the bottom',
    'Ese es tu límite de profundidad hoy. Baja hasta justo antes de que ocurra.':
      'That is your depth limit for today. Go down to just before it happens.',
    'Mirar al techo':
      'Looking at the ceiling',
    'Hiperextiende el cuello. Mirada al frente o ligeramente abajo, y que se mueva con el torso.':
      'It hyperextends your neck. Look forward or slightly down, and let your gaze move with your torso.',
    'La profundidad útil es hasta donde mantienes la espalda neutra. Ganarás más bajando bien con menos peso.':
      'Useful depth is as far as you can keep your back neutral. You will gain more going down properly with less weight.',
    'Ajusta los seguros del rack a la altura de la posición más baja antes de empezar.':
      'Set the rack safeties at the height of your lowest position before you start.',

    /* ---------- prensa, zancadas, extension y peso muerto ---------- */
    'Prensa de piernas':
      'Leg press',
    'Espalda y glúteos completamente pegados al respaldo. Si el glúteo se despega abajo, la lumbar paga la factura.':
      'Back and glutes flat against the pad. If your glutes lift at the bottom, your lower back pays for it.',
    'Pies en la plataforma al ancho de los hombros, a media altura. Más arriba trabaja más el glúteo e isquios; más abajo, el cuádriceps.':
      'Feet on the platform shoulder-width apart, at mid height. Higher works the glutes and hamstrings more; lower works the quads.',
    'Baja en 3 segundos hasta que las rodillas lleguen a unos 90 grados, o hasta justo antes de que la cadera se despegue del asiento.':
      'Lower over 3 seconds until your knees reach about 90 degrees, or until just before your hips lift off the seat.',
    'Empuje':
      'Press',
    'Empuja con toda la planta del pie hasta casi extender las piernas, sin bloquear las rodillas de golpe.':
      'Drive through your whole foot until your legs are nearly straight, without snapping your knees locked.',
    '3 s bajando · 1 s empujando':
      '3 s down · 1 s pressing',
    'Bajar tanto que la cadera se levanta':
      'Going so deep your hips lift',
    'Es la causa más común de molestia lumbar en la prensa. Reduce el recorrido.':
      'It is the commonest cause of lower back pain on the leg press. Shorten the range.',
    'Bloquear las rodillas de golpe':
      'Snapping your knees locked',
    'Deja un grado de flexión al final.':
      'Leave a degree of bend at the end.',
    'Ayudarse con las manos en las rodillas':
      'Pushing your knees with your hands',
    'Agárrate a las asas laterales.':
      'Hold the side handles.',
    'Permite cargar mucho peso con poco riesgo, pero solo si la cadera no se despega del asiento.':
      'It lets you load a lot of weight with little risk, but only if your hips stay on the seat.',
    'Zancadas':
      'Lunges',
    'De pie, tronco erguido, abdomen firme y mirada al frente.':
      'Standing, torso upright, abs tight and eyes forward.',
    'Peso en las manos a los lados o barra en la espalda.':
      'Weight in your hands at your sides or a bar on your back.',
    'Da un paso largo al frente y baja en vertical hasta que la rodilla de atrás quede a un dedo del suelo y la de delante forme 90 grados. El torso se mantiene vertical.':
      'Take a long step forward and drop straight down until your back knee is a finger off the floor and your front knee is at 90 degrees. Your torso stays upright.',
    'Empuja con el talón de la pierna delantera para volver a la posición inicial.':
      'Drive through the heel of your front leg to return to the start.',
    'Paso demasiado corto':
      'Too short a step',
    'La rodilla delantera se adelanta en exceso. Alarga el paso.':
      'Your front knee travels too far forward. Lengthen the step.',
    'Inclinar el torso':
      'Leaning your torso forward',
    'Mantén el pecho alto; si te caes hacia delante, baja el peso.':
      'Keep your chest high; if you fall forward, drop the weight.',
    'La rodilla se va hacia dentro':
      'Your knee caves inwards',
    'Que apunte en la dirección del pie. Ir más despacio suele bastar.':
      'Keep it tracking over your foot. Slowing down is usually enough.',
    'Baja en vertical, como si te sentaras entre las dos piernas, en lugar de lanzarte hacia delante.':
      'Drop straight down, as if sitting between your two legs, rather than lunging forwards.',
    'Extensión de cuádriceps':
      'Leg extension',
    'Ajusta el respaldo para que la rodilla coincida con el eje de giro de la máquina.':
      'Set the backrest so your knee lines up with the machine’s pivot.',
    'El rodillo debe apoyar sobre el tobillo, no sobre el empeine.':
      'The pad should sit on your ankle, not on the top of your foot.',
    'Extensión':
      'Extension',
    'Extiende las rodillas hasta casi bloquear y aguanta un segundo apretando el cuádriceps.':
      'Extend your knees to just short of lockout and hold for a second, squeezing the quad.',
    'Baja en 3 segundos, sin dejar que el peso caiga.':
      'Lower over 3 seconds, without letting the weight drop.',
    'Espira al extender, inspira al bajar.':
      'Breathe out as you extend, in as you lower.',
    '1 s subiendo · 1 s de pausa · 3 s bajando':
      '1 s up · 1 s pause · 3 s down',
    'Coger impulso con la cadera':
      'Using your hips for momentum',
    'Agárrate al asiento y mueve solo las rodillas.':
      'Hold the seat and move only your knees.',
    'Soltar el peso de golpe':
      'Dropping the weight',
    'La bajada controlada es la mitad del ejercicio.':
      'The controlled descent is half the exercise.',
    'La pausa arriba, apretando, da más que subir el peso.':
      'The squeeze and pause at the top gives you more than adding weight.',
    'Peso muerto':
      'Deadlift',
    'Barra sobre el medio del pie, casi tocando la espinilla. Pies al ancho de las caderas.':
      'Bar over mid-foot, almost touching your shin. Feet hip-width apart.',
    'Cadera atrás y baja hasta agarrar la barra por fuera de las piernas, con los brazos verticales.':
      'Hips back and down until you can grip the bar outside your legs, arms vertical.',
    'Pecho alto, espalda neutra, hombros ligeramente por delante de la barra. Coge aire y aprieta el abdomen.':
      'Chest high, back neutral, shoulders slightly in front of the bar. Take a breath and brace your abs.',
    'Antes de tirar, "quita la holgura" a la barra: tensa los brazos hasta oír cómo los discos asientan.':
      'Before you pull, “take the slack out” of the bar: pull your arms tight until you hear the plates settle.',
    'Coge aire abajo, aguántalo toda la repetición y suéltalo arriba. Vuelve a coger aire antes de la siguiente.':
      'Take a breath at the bottom, hold it for the whole rep and let it out at the top. Take another before the next one.',
    'Es un empuje de piernas con la espalda rígida, no un tirón de espalda. Cada repetición empieza de cero desde el suelo.':
      'It is a leg drive with a rigid back, not a back pull. Every rep starts from scratch on the floor.',
    'Si notas la lumbar en lugar de glúteo e isquios, para la serie y revisa la posición de la cadera.':
      'If you feel your lower back instead of your glutes and hamstrings, stop the set and check your hip position.',

    /* ---------- peso muerto, rumano, hip thrust y curl femoral ---------- */
    'Inspira al bajar, espira al subir.':
      'Breathe in on the way down, out on the way up.',
    'Despegue':
      'Off the floor',
    'Empuja el suelo con las piernas manteniendo la barra pegada al cuerpo. La cadera y el pecho suben a la vez; la espalda no cambia de ángulo.':
      'Drive the floor with your legs while keeping the bar against your body. Hips and chest rise together; your back does not change angle.',
    'Bloqueo':
      'Lockout',
    'Al pasar las rodillas, lleva la cadera hacia delante y termina de pie, apretando glúteos. Sin echarte hacia atrás ni encoger los hombros.':
      'Once past your knees, drive your hips forward and finish standing tall, squeezing your glutes. No leaning back, no shrugging.',
    'Lleva primero la cadera atrás, y cuando la barra pase las rodillas, flexiónalas. La barra baja rozando las piernas.':
      'Send your hips back first, and once the bar passes your knees, bend them. The bar comes down grazing your legs.',
    'La barra se separa del cuerpo':
      'The bar drifts away from your body',
    'Es la causa número uno de lumbares cargadas. Piensa en arrastrar la barra por las piernas.':
      'It is the number one cause of a wrecked lower back. Think about dragging the bar up your legs.',
    'La cadera sube antes que el pecho':
      'Your hips rise before your chest',
    'Se convierte en un buenos días con mucho peso. Empuja el suelo en lugar de tirar con la espalda.':
      'It becomes a very heavy good morning. Drive the floor instead of pulling with your back.',
    'Redondear la espalda':
      'Rounding your back',
    'Si no puedes mantenerla neutra abajo, eleva la barra sobre unos discos y trabaja desde ahí.':
      'If you cannot keep it neutral at the bottom, raise the bar on some plates and work from there.',
    'Hiperextender arriba':
      'Hyperextending at the top',
    'Termina de pie y firme, no arqueado hacia atrás.':
      'Finish standing tall and solid, not arched backwards.',
    'Peso muerto rumano':
      'Romanian deadlift',
    'De pie con la barra a la altura de la cadera, brazos extendidos, pies al ancho de las caderas.':
      'Standing with the bar at hip height, arms extended, feet hip-width apart.',
    'Rodillas ligeramente flexionadas: ese ángulo se mantiene todo el ejercicio.':
      'Knees slightly bent: that angle is held for the whole exercise.',
    'Pecho alto y escápulas ligeramente juntas.':
      'Chest high and shoulder blades slightly pulled together.',
    'Lleva la cadera hacia atrás, como si empujaras una puerta con el glúteo, mientras la barra baja rozando los muslos. Baja hasta notar un estiramiento fuerte en los isquios, normalmente a media espinilla. La espalda no se redondea.':
      'Send your hips back, as if pushing a door shut with your glutes, while the bar comes down grazing your thighs. Go down until you feel a strong hamstring stretch, usually at mid-shin. Your back does not round.',
    'Empuja la cadera hacia delante y aprieta los glúteos para volver arriba. La barra sigue pegada a la pierna.':
      'Drive your hips forward and squeeze your glutes to come back up. The bar stays against your leg.',
    'Inspira arriba, aguanta durante la bajada y espira al terminar de subir.':
      'Breathe in at the top, hold it on the way down and breathe out once you finish standing up.',
    '3 s bajando · 1 s subiendo':
      '3 s down · 1 s up',
    'Flexionar las rodillas al bajar':
      'Bending your knees on the way down',
    'Entonces es un peso muerto convencional. El ángulo de rodilla no cambia.':
      'Then it is a conventional deadlift. The knee angle does not change.',
    'Bajar hasta el suelo':
      'Going all the way to the floor',
    'El recorrido lo marca el estiramiento del isquio, no el suelo.':
      'The hamstring stretch sets the range, not the floor.',
    'Separar la barra del cuerpo':
      'Letting the bar drift off your body',
    'Debe rozar el muslo. Si se aleja, la lumbar se lleva la carga.':
      'It should graze your thigh. If it drifts away, your lower back takes the load.',
    'El movimiento es de cadera hacia atrás, no de columna hacia delante. Si no notas los isquios, no estás llevando la cadera atrás.':
      'The movement is hips going back, not spine going forward. If you do not feel your hamstrings, you are not sending your hips back.',
    'Empuje de cadera':
      'Hip thrust',
    'Espalda alta apoyada en el borde de un banco, justo debajo de las escápulas.':
      'Upper back against the edge of a bench, just below your shoulder blades.',
    'Pies al ancho de las caderas, colocados de forma que al subir la tibia quede vertical.':
      'Feet hip-width apart, placed so your shin is vertical at the top.',
    'Barra sobre el pliegue de la cadera, con una almohadilla.':
      'Bar across the crease of your hips, with a pad.',
    'Empuja con los talones y sube la cadera hasta que el cuerpo forme una línea recta de rodillas a hombros. Aprieta el glúteo un segundo arriba.':
      'Drive through your heels and lift your hips until your body is a straight line from knees to shoulders. Squeeze your glutes for a second at the top.',
    'Baja controlado sin llegar a apoyar del todo, para no perder tensión.':
      'Lower under control without fully touching down, so you keep the tension.',
    'Hiperextender la espalda arriba':
      'Hyperextending your back at the top',
    'Mete las costillas hacia dentro y termina el movimiento con el glúteo, no con la lumbar.':
      'Tuck your ribs down and finish the movement with your glutes, not your lower back.',
    'Pies mal colocados':
      'Badly placed feet',
    'Si quedan muy cerca trabaja el cuádriceps; muy lejos, los isquios. Busca la tibia vertical arriba.':
      'Too close and the quads take over; too far and the hamstrings do. Aim for a vertical shin at the top.',
    'Empujar con las puntas':
      'Pushing through your toes',
    'Presiona con el talón.':
      'Press through your heel.',
    'Mira hacia delante durante todo el movimiento: si sigues la barra con la vista, la lumbar se arquea.':
      'Look straight ahead throughout: if you follow the bar with your eyes, your lower back arches.',
    'Curl femoral':
      'Leg curl',
    'Ajusta la máquina para que la rodilla coincida con su eje de giro.':
      'Set the machine so your knee lines up with its pivot.',
    'El rodillo apoya justo encima del talón, no en el gemelo.':
      'The pad sits just above your heel, not on your calf.',
    'Flexiona las rodillas llevando los talones hacia los glúteos, todo el recorrido que permita la máquina. Aguanta un instante.':
      'Bend your knees, bringing your heels towards your glutes, through the full range the machine allows. Hold for a moment.',
    'Baja en 3 segundos hasta casi extender, sin soltar el peso.':
      'Lower over 3 seconds to just short of full extension, without letting the weight go.',
    'Espira al flexionar, inspira al volver.':
      'Breathe out as you curl, in as you return.',
    'Despegar la cadera':
      'Lifting your hips',
    'Mantén la pelvis pegada; si se levanta, baja el peso.':
      'Keep your pelvis down; if it lifts, drop the weight.',
    'Lleva los talones lo más cerca posible del glúteo.':
      'Bring your heels as close to your glutes as you can.',
    'Los isquios responden muy bien a la fase negativa: baja despacio.':
      'Hamstrings respond very well to the negative: lower slowly.',

    /* ---------- gemelos, biceps, antebrazo, triceps y laterales ---------- */
    'Elevación de talones':
      'Calf raise',
    'Punta del pie sobre el escalón o la plataforma, con el talón en el aire.':
      'Balls of your feet on the step or platform, heels hanging in the air.',
    'Piernas rectas para el gemelo; sentado y con las rodillas dobladas para el sóleo.':
      'Legs straight for the gastrocnemius; seated with bent knees for the soleus.',
    'Sube hasta ponerte de puntillas todo lo alto que puedas y aprieta un segundo arriba.':
      'Rise onto your toes as high as you can and squeeze for a second at the top.',
    'Baja despacio hasta notar el estiramiento completo del gemelo, con el talón por debajo del nivel del escalón.':
      'Lower slowly until you feel a full calf stretch, with your heel below the level of the step.',
    'Rebotar':
      'Bouncing',
    'El tendón devuelve la energía y el músculo no trabaja. Pausa abajo y arriba.':
      'The tendon gives the energy back and the muscle does nothing. Pause at the bottom and at the top.',
    'El gemelo necesita rango completo: estiramiento abajo y contracción máxima arriba.':
      'The calf needs full range: a stretch at the bottom and a maximal squeeze at the top.',
    'Es de los músculos que más pausa y rango necesita, y menos peso de lo que la gente cree.':
      'It is one of the muscles that needs the most pause and range, and less weight than people think.',
    'Curl de bíceps':
      'Biceps curl',
    'De pie, pies al ancho de las caderas, abdomen firme.':
      'Standing, feet hip-width apart, abs tight.',
    'Codos pegados al costado y ligeramente por delante del torso. Ahí se quedan.':
      'Elbows tucked to your sides and slightly in front of your torso. That is where they stay.',
    'Hombros atrás y abajo, pecho alto.':
      'Shoulders back and down, chest high.',
    'Flexiona el codo llevando el peso hacia el hombro. El codo no se mueve del sitio: solo gira el antebrazo. Aprieta el bíceps arriba.':
      'Bend your elbow, bringing the weight towards your shoulder. The elbow does not move: only the forearm rotates. Squeeze the biceps at the top.',
    'Baja en 3 segundos hasta extender casi por completo. Ese estiramiento final es donde más crece el bíceps.':
      'Lower over 3 seconds to almost full extension. That final stretch is where the biceps grows most.',
    'Si necesitas impulso, el peso sobra. Prueba de espaldas a una pared.':
      'If you need momentum, the weight is too heavy. Try it with your back against a wall.',
    'Adelantar los codos al subir':
      'Letting your elbows drift forward',
    'Al llevar el codo hacia delante entra el hombro y descansa el bíceps.':
      'Bringing your elbow forward brings in the shoulder and rests the biceps.',
    'No estirar abajo':
      'Not straightening at the bottom',
    'Media repetición, medio resultado. Extiende casi del todo.':
      'Half a rep, half the result. Extend almost all the way.',
    'El bíceps es un músculo pequeño: manda la técnica y la sensación, nunca la cifra del peso.':
      'The biceps is a small muscle: technique and feel decide, never the number on the weight.',
    'Curl de muñeca':
      'Wrist curl',
    'Antebrazos apoyados en un banco o en los muslos, muñecas por fuera del apoyo.':
      'Forearms resting on a bench or on your thighs, wrists off the edge.',
    'Palmas hacia arriba para el flexor, hacia abajo para el extensor.':
      'Palms up for the flexors, palms down for the extensors.',
    'Flexiona solo la muñeca, todo el recorrido, y aprieta arriba.':
      'Bend only the wrist, through the full range, and squeeze at the top.',
    'Baja despacio hasta el estiramiento completo, dejando incluso que la barra ruede hasta los dedos.':
      'Lower slowly to a full stretch, even letting the bar roll down to your fingers.',
    'Normal y continua.':
      'Normal and steady.',
    'Mover el antebrazo':
      'Moving your forearm',
    'Solo se mueve la muñeca; el antebrazo queda fijo en el apoyo.':
      'Only the wrist moves; the forearm stays fixed on the support.',
    'Poco peso y muchas repeticiones funcionan mejor en antebrazo.':
      'Light weight and high reps work better for forearms.',
    'Extensión de tríceps':
      'Triceps extension',
    'Codos apuntando al techo si es por encima de la cabeza, o pegados al costado si es en polea.':
      'Elbows pointing at the ceiling if it is overhead, or tucked to your sides if it is on a cable.',
    'La posición del codo no cambia durante el ejercicio: es la referencia de todo el movimiento.':
      'The elbow position does not change during the exercise: it is the reference for the whole movement.',
    'Extiende el codo hasta estirar el brazo del todo y aprieta el tríceps un segundo.':
      'Extend your elbow until your arm is completely straight and squeeze the triceps for a second.',
    'Flexiona controlado hasta notar el estiramiento del tríceps, sin que el codo se desplace.':
      'Bend under control until you feel the triceps stretch, without the elbow moving.',
    '1 s extendiendo · 2 s volviendo':
      '1 s extending · 2 s returning',
    'Los codos se abren':
      'Your elbows flare out',
    'Manténlos apuntando al frente o al techo. Al abrirse, el pecho y el hombro ayudan.':
      'Keep them pointing forward or at the ceiling. When they flare, the chest and shoulder help out.',
    'Mover el hombro':
      'Moving your shoulder',
    'Solo se mueve el antebrazo.':
      'Only the forearm moves.',
    'Con exceso de carga el movimiento se convierte en un press.':
      'Overload it and the movement turns into a press.',
    'La cabeza larga del tríceps solo se estira con el brazo por encima de la cabeza: incluye alguna variante así.':
      'The long head of the triceps only stretches with your arm overhead: include a variation like that.',
    'Elevación lateral':
      'Lateral raise',
    'De pie, mancuernas a los lados, codos con una ligera flexión constante.':
      'Standing, dumbbells at your sides, elbows with a slight constant bend.',
    'Inclínate un par de grados hacia delante y mantén el abdomen firme.':
      'Lean forward a couple of degrees and keep your abs tight.',
    'Sube los brazos por los lados hasta la altura del hombro, no más. Lidera el movimiento con el codo, como si vertieras agua de una jarra con el meñique algo más alto.':
      'Raise your arms out to the sides to shoulder height, no higher. Lead with your elbow, as if pouring water from a jug with your little finger slightly higher.',
    'Baja en 3 segundos resistiendo el peso, sin dejar que caiga.':
      'Lower over 3 seconds resisting the weight, without letting it drop.',
    'Subir por encima del hombro':
      'Going above shoulder height',
    'A partir de ahí trabaja el trapecio, no el deltoides.':
      'Past that point it is the traps working, not the delts.',
    'Impulsar con las piernas':
      'Bouncing with your legs',
    'De los ejercicios donde menos importa el peso y más la ejecución. Con 5 o 6 kg bien hechos sobra.':
      'One of the exercises where the weight matters least and the execution most. Five or six kilos done properly is plenty.',

    /* ---------- abdomen: plancha, crunch, elevaciones y giros ---------- */
    'Espira al extender, inspira al volver.':
      'Breathe out as you extend, in as you return.',
    'Con exceso de peso es inevitable. Baja la carga: aquí funcionan mejor pesos ligeros.':
      'With too much weight it is unavoidable. Drop the load: light weights work better here.',
    'Mantén los hombros lejos de las orejas durante todo el recorrido.':
      'Keep your shoulders away from your ears throughout.',
    'Plancha':
      'Plank',
    'Antebrazos en el suelo, codos justo debajo de los hombros, manos al frente.':
      'Forearms on the floor, elbows directly under your shoulders, hands forward.',
    'Cuerpo en línea recta de la cabeza a los talones, con los pies al ancho de las caderas.':
      'Body in a straight line from head to heels, feet hip-width apart.',
    'Sostener':
      'Holding',
    'Aprieta glúteos y abdomen, mete la pelvis ligeramente hacia dentro y empuja el suelo con los antebrazos para separar las escápulas. Mantén la posición el tiempo indicado.':
      'Squeeze your glutes and abs, tuck your pelvis slightly and push the floor away with your forearms to spread your shoulder blades. Hold for the time given.',
    'Respira de forma continua y superficial. Si aguantas la respiración, no llegas a los segundos previstos.':
      'Breathe continuously and shallowly. If you hold your breath, you will not last the seconds.',
    'De 20 a 60 segundos por serie':
      '20 to 60 seconds per set',
    'Es la señal de que el abdomen se ha rendido. Termina la serie ahí: más tiempo mal hecho no suma.':
      'It is the sign that your abs have given up. End the set there: more time done badly adds nothing.',
    'Subir demasiado la cadera':
      'Lifting your hips too high',
    'Descansa la posición pero no entrena. Busca la línea recta.':
      'It rests the position but does not train anything. Find the straight line.',
    'Aguantar la respiración':
      'Holding your breath',
    'Respira siempre.':
      'Always keep breathing.',
    'Es calidad, no cronómetro. Treinta segundos apretando de verdad valen más que dos minutos aguantando.':
      'It is quality, not the clock. Thirty seconds genuinely braced beats two minutes of hanging on.',
    'Crunch abdominal':
      'Crunch',
    'Boca arriba, rodillas flexionadas y pies apoyados.':
      'On your back, knees bent and feet flat.',
    'Manos en el pecho o al lado de la cabeza, sin tirar del cuello.':
      'Hands on your chest or beside your head, without pulling on your neck.',
    'Enrolla la columna despegando los omóplatos del suelo, acercando las costillas a la pelvis. Es un movimiento corto: no hay que sentarse.':
      'Curl your spine, lifting your shoulder blades off the floor and bringing your ribs towards your pelvis. It is a short movement: you do not sit up.',
    'Baja despacio desenrollando vértebra a vértebra, sin apoyar del todo la cabeza entre repeticiones.':
      'Lower slowly, uncurling vertebra by vertebra, without fully resting your head between reps.',
    'Espira con fuerza al subir, como si soplaras una vela; inspira al bajar.':
      'Breathe out hard as you come up, as if blowing out a candle; breathe in as you lower.',
    'Tirar del cuello con las manos':
      'Pulling on your neck with your hands',
    'Apoya la lengua en el paladar y mantén un puño de distancia entre la barbilla y el pecho.':
      'Rest your tongue on the roof of your mouth and keep a fist’s gap between your chin and your chest.',
    'Subir todo el torso':
      'Lifting your whole torso',
    'Entonces trabaja el flexor de la cadera. El recorrido del crunch es corto.':
      'Then the hip flexors do the work. A crunch has a short range.',
    'Espirar fuerte al subir activa el abdomen profundo mucho más que añadir repeticiones.':
      'Breathing out hard on the way up switches on your deep abs far more than adding reps.',
    'Elevación de piernas':
      'Leg raise',
    'Colgado de la barra o tumbado con la lumbar pegada al suelo.':
      'Hanging from the bar or lying with your lower back pressed into the floor.',
    'Antes de empezar, mete la pelvis hacia dentro para eliminar el arco lumbar.':
      'Before you start, tuck your pelvis to flatten out the arch in your lower back.',
    'Sube las piernas llevando la pelvis hacia las costillas. El abdomen empieza a trabajar de verdad cuando la pelvis se enrolla, no solo cuando suben las piernas.':
      'Raise your legs, bringing your pelvis towards your ribs. Your abs only really start working when the pelvis curls, not just when the legs come up.',
    'Baja en 3 segundos sin perder el contacto de la lumbar con el suelo, o sin balancearte si estás colgado.':
      'Lower over 3 seconds without losing contact between your lower back and the floor, or without swinging if you are hanging.',
    '2 s subiendo · 3 s bajando':
      '2 s up · 3 s down',
    'Arquear la lumbar':
      'Arching your lower back',
    'Reduce el recorrido o flexiona las rodillas hasta poder mantenerla apoyada.':
      'Shorten the range or bend your knees until you can keep it flat.',
    'Balancearse en la barra':
      'Swinging on the bar',
    'Aprieta los glúteos y empieza cada repetición desde parado.':
      'Squeeze your glutes and start every rep from a dead stop.',
    'Si solo suben las piernas y la pelvis no se mueve, estás trabajando el psoas y no el abdomen.':
      'If only your legs come up and your pelvis does not move, you are working your hip flexors and not your abs.',
    'Giro ruso':
      'Russian twist',
    'Sentado, rodillas flexionadas, torso inclinado unos 45 grados hacia atrás.':
      'Seated, knees bent, torso leaning back about 45 degrees.',
    'Espalda recta, pecho alto, peso sujeto con las dos manos frente al pecho.':
      'Back straight, chest high, weight held in both hands in front of your chest.',
    'Giro':
      'Twist',
    'Gira el torso hacia un lado llevando el peso junto a la cadera. El giro sale del tronco, no de los brazos.':
      'Twist your torso to one side, bringing the weight beside your hip. The rotation comes from your trunk, not your arms.',
    'Pasa al otro lado con control, sin dejar caer el peso.':
      'Move to the other side under control, without letting the weight drop.',
    'Espira en cada giro.':
      'Breathe out on each twist.',
    'Controlado, sin prisa':
      'Controlled, unhurried',
    'Mover solo los brazos':
      'Moving only your arms',
    'Que giren los hombros con el torso; la mirada acompaña al peso.':
      'Let your shoulders turn with your torso; your eyes follow the weight.',
    'Pecho alto. Si se hunde, incorpórate un poco.':
      'Chest high. If it collapses, sit up a little.',
    'Mejor despacio y girando de verdad que rápido moviendo los brazos.':
      'Better slow with real rotation than fast with just your arms moving.',

    /* ---------- estiramiento, foam roller, cargada y saltos ---------- */
    'Estiramiento':
      'Stretch',
    'Colócate en la posición sin forzar y busca una tensión cómoda, nunca dolor.':
      'Get into position without forcing it and look for a comfortable tension, never pain.',
    'Mantener':
      'Holding',
    'Sostén la posición entre 20 y 40 segundos respirando despacio. En cada espiración gana un poco de rango, sin rebotes.':
      'Hold the position for 20 to 40 seconds, breathing slowly. Gain a little range on each exhale, with no bouncing.',
    'Lenta y profunda: la espiración es la que permite ganar rango.':
      'Slow and deep: the exhale is what lets you gain range.',
    'De 20 a 40 segundos por lado':
      '20 to 40 seconds per side',
    'Los rebotes provocan que el músculo se contraiga por reflejo. Estiramiento sostenido.':
      'Bouncing makes the muscle contract by reflex. Hold the stretch instead.',
    'Estirar hasta el dolor':
      'Stretching into pain',
    'Tensión sí, dolor no.':
      'Tension yes, pain no.',
    'Los estiramientos largos van mejor al terminar de entrenar. Antes, mejor movilidad en movimiento.':
      'Long stretches work better at the end of a session. Before it, go for mobility on the move.',
    'Liberación miofascial':
      'Foam rolling',
    'Coloca el rodillo bajo el músculo que quieres tratar y reparte el peso con las manos o el pie libre.':
      'Place the roller under the muscle you want to work and share your weight with your hands or your free foot.',
    'Rodar':
      'Rolling',
    'Rueda despacio, unos 3 centímetros por segundo. Cuando encuentres un punto sensible, párate ahí entre 20 y 30 segundos y respira hasta que ceda.':
      'Roll slowly, about 3 centimetres a second. When you find a tender spot, stop there for 20 to 30 seconds and breathe until it releases.',
    'Profunda y lenta, sobre todo en los puntos sensibles.':
      'Deep and slow, especially on the tender spots.',
    'De 1 a 2 minutos por zona':
      '1 to 2 minutes per area',
    'Ir demasiado rápido':
      'Going too fast',
    'Rodar rápido no relaja nada. Despacio y con pausas.':
      'Rolling fast releases nothing. Slow, with pauses.',
    'Pasar por encima de una articulación o hueso':
      'Rolling over a joint or bone',
    'Trabaja solo sobre masa muscular; evita rodillas, codos y la zona lumbar baja.':
      'Work on muscle only; avoid knees, elbows and the low lumbar area.',
    'Molestia tolerable sí, dolor agudo no. Si no puedes respirar tranquilo, quita presión.':
      'Tolerable discomfort yes, sharp pain no. If you cannot breathe calmly, ease off the pressure.',
    'Cargada':
      'Clean',
    'Posición de peso muerto con la barra sobre el medio del pie.':
      'Deadlift position with the bar over mid-foot.',
    'Hombros ligeramente por delante de la barra, espalda neutra, brazos rectos y relajados.':
      'Shoulders slightly in front of the bar, back neutral, arms straight and relaxed.',
    'Primer tirón':
      'First pull',
    'Despega la barra del suelo empujando con las piernas, manteniendo el ángulo de la espalda. La barra sube pegada a las piernas.':
      'Break the bar off the floor by driving with your legs, keeping your back angle. The bar travels up against your legs.',
    'Al pasar la rodilla, extiende cadera, rodilla y tobillo con potencia. Los brazos siguen relajados: la barra sube por el impulso, no por tirar con los brazos.':
      'Once past the knee, extend hips, knees and ankles explosively. Your arms stay relaxed: the bar rises on momentum, not by pulling with your arms.',
    'Recepción':
      'Catch',
    'Métete debajo de la barra girando los codos hacia delante y recíbela sobre los deltoides, en media sentadilla frontal. Levántate.':
      'Drop under the bar, whipping your elbows forward, and catch it on your front delts in a quarter front squat. Stand up.',
    'Coge aire antes de cada repetición y suéltalo al terminar de incorporarte.':
      'Take a breath before each rep and let it out once you have stood up.',
    'Explosivo al subir, sin prisa entre repeticiones':
      'Explosive on the way up, unhurried between reps',
    'Tirar con los brazos demasiado pronto':
      'Pulling with your arms too soon',
    'Los brazos son cuerdas hasta la extensión completa de la cadera.':
      'Your arms are ropes until your hips are fully extended.',
    'Debe rozar el muslo. Si se aleja, se pierde toda la potencia.':
      'It should graze your thigh. If it drifts away, all the power is lost.',
    'Recibir con los codos bajos':
      'Catching with low elbows',
    'Gira los codos rápido y alto; con codos bajos la barra cae sobre las muñecas.':
      'Whip your elbows round fast and high; with low elbows the bar lands on your wrists.',
    'Los levantamientos olímpicos son técnicos de verdad. Aprende con barra vacía y, a ser posible, con alguien que sepa mirándote.':
      'The Olympic lifts are genuinely technical. Learn with an empty bar and, if you can, with someone who knows watching you.',
    'Hazlos en una zona despejada y con discos que puedan soltarse sin peligro. Ante la duda, elige otro ejercicio.':
      'Do them in a clear area with plates you can safely drop. When in doubt, choose another exercise.',
    'Saltos':
      'Jumps',
    'Pies al ancho de las caderas, rodillas y cadera algo flexionadas.':
      'Feet hip-width apart, knees and hips slightly bent.',
    'Asegúrate de que la superficie no resbala y de que tienes espacio libre alrededor.':
      'Make sure the surface is not slippery and that you have clear space around you.',
    'Salto':
      'Jump',
    'Baja rápido a media sentadilla y salta extendiendo cadera, rodilla y tobillo con toda la potencia que puedas. Los brazos acompañan hacia arriba.':
      'Dip quickly to a half squat and jump, extending hips, knees and ankles with everything you have. Your arms swing up with you.',
    'Aterrizaje':
      'Landing',
    'Cae con la punta primero y amortigua flexionando rodillas y cadera, en silencio. Un aterrizaje ruidoso es un aterrizaje duro.':
      'Land toes first and absorb it by bending your knees and hips, silently. A noisy landing is a hard landing.',
    'Espira en el salto.':
      'Breathe out as you jump.',
    'Máxima potencia, con descanso completo entre series':
      'Maximum power, with full rest between sets',
    'Aterrizar con las piernas rígidas':
      'Landing with stiff legs',
    'Amortigua siempre: rodillas y cadera absorben el impacto.':
      'Always absorb it: knees and hips take the impact.',
    'Las rodillas se van hacia dentro al caer':
      'Your knees cave in on landing',
    'Baja la altura del salto hasta controlarlo.':
      'Lower the height of the jump until you can control it.',
    'Hacer muchas repeticiones seguidas':
      'Doing lots of reps in a row',
    'Es trabajo de potencia: pocas repeticiones y buen descanso.':
      'This is power work: few reps and plenty of rest.',
    'La calidad se pierde en cuanto llega el cansancio. Series cortas y descanso generoso.':
      'Quality goes the moment fatigue arrives. Short sets and generous rest.'
  };

  /* Se fusiona con lo que ya haya, sin pisar nada: si una frase estuviera en dos
     archivos manda la primera, que es la de la interfaz. */
  g.TEXTOS_EN = g.TEXTOS_EN || {};
  Object.keys(TECNICA).forEach(function (k) {
    if (!Object.prototype.hasOwnProperty.call(g.TEXTOS_EN, k)) g.TEXTOS_EN[k] = TECNICA[k];
  });
})(window);
