/* tecnica.js — cómo se hace cada ejercicio, en español y sin depender de internet.

   El catálogo original trae instrucciones en inglés y bastante secas. Aquí hay
   guías escritas por patrón de movimiento: la sentadilla se ejecuta igual con
   barra, con mancuernas o en multipower, así que una sola guía sirve para todas
   sus variantes. El patrón se deduce del nombre del ejercicio con el mismo motor
   que traduce los títulos.

   Cada guía cubre lo que faltaba: dónde colocarse, hasta dónde llega el
   recorrido, cómo respirar, qué se suele hacer mal y en qué fijarse. */
(function (g) {
  'use strict';

  const GUIAS = {

    /* ---------------- empuje horizontal ---------------- */
    'bench press': {
      titulo: 'Press de banca',
      inicial: [
        'Túmbate con los ojos justo debajo de la barra. Cinco puntos de apoyo: cabeza, espalda alta, glúteos y los dos pies en el suelo.',
        'Junta las escápulas y húndelas hacia los glúteos, como si quisieras guardarlas en los bolsillos traseros. El pecho queda alto y aparece un arco natural en la zona lumbar.',
        'Agarra la barra algo más ancho que los hombros. Rodea con el pulgar, nunca por encima.'
      ],
      recorrido: [
        { fase: 'Bajada', texto: 'Baja la barra en 2 segundos hacia la parte baja del pecho, a la altura de los pezones. Los codos van a unos 45 grados del torso, no abiertos en cruz. La barra toca el pecho sin rebotar.' },
        { fase: 'Subida', texto: 'Empuja el suelo con los pies y sube la barra en línea ligeramente diagonal, hacia los hombros. Termina con los codos extendidos pero sin bloquearlos de golpe.' }
      ],
      respiracion: 'Coge aire arriba, aguántalo durante la bajada y suelta al superar la mitad de la subida. Ese aire mantiene la caja torácica firme.',
      tempo: '2 s bajando · 0 s abajo · 1 s subiendo',
      errores: [
        { fallo: 'Abrir los codos a 90 grados', arreglo: 'Castiga el hombro y resta fuerza. Mantenlos a unos 45 grados del cuerpo.' },
        { fallo: 'Rebotar la barra en el pecho', arreglo: 'Toca y empuja, sin impulso. Si necesitas rebote, tienes demasiado peso.' },
        { fallo: 'Despegar los glúteos del banco', arreglo: 'Deja los glúteos pegados. Si se levantan, baja el peso.' },
        { fallo: 'Perder la retracción de las escápulas', arreglo: 'Mantén el pecho alto durante toda la serie; si se redondea la espalda alta, el pectoral deja de trabajar.' }
      ],
      clave: 'Piensa en separar el suelo del banco con los pies mientras empujas. La fuerza sale de todo el cuerpo, no solo de los brazos.',
      seguridad: 'Con barra libre y sin compañero, usa los seguros del rack a la altura del pecho.'
    },

    'push up': {
      titulo: 'Flexión',
      inicial: [
        'Manos en el suelo un poco más abiertas que los hombros, a la altura del pecho, con los dedos apuntando al frente.',
        'Cuerpo en línea recta desde la cabeza hasta los talones. Aprieta glúteos y abdomen como si fueras una tabla.',
        'Empuja el suelo para separar ligeramente las escápulas: el torso no debe hundirse entre los brazos.'
      ],
      recorrido: [
        { fase: 'Bajada', texto: 'Baja el cuerpo entero como un bloque hasta que el pecho quede a un puño del suelo. Los codos se cierran hacia atrás formando una flecha con el torso, no una T.' },
        { fase: 'Subida', texto: 'Empuja el suelo y vuelve arriba manteniendo la línea. Al final, separa un poco más las escápulas para completar el recorrido.' }
      ],
      respiracion: 'Inspira al bajar, espira al empujar.',
      tempo: '2 s bajando · 1 s subiendo',
      errores: [
        { fallo: 'La cadera se hunde', arreglo: 'Aprieta glúteos y abdomen. Si no aguantas la línea, apoya las rodillas.' },
        { fallo: 'La cabeza se adelanta', arreglo: 'Mira un punto del suelo un palmo por delante de las manos y mantén el cuello alineado.' },
        { fallo: 'Recorrido corto', arreglo: 'Baja hasta que el pecho casi roce. Media flexión da medio resultado.' }
      ],
      clave: 'Es una plancha que se mueve: si el abdomen se relaja, el ejercicio se convierte en otra cosa.'
    },

    'dip': {
      titulo: 'Fondos',
      inicial: [
        'Agárrate a las paralelas con los brazos extendidos y los hombros lejos de las orejas.',
        'Cruza los tobillos y mantén el cuerpo firme, sin balanceo.',
        'Para dar más al pecho, inclina el torso hacia delante. Para dar más al tríceps, mantente vertical.'
      ],
      recorrido: [
        { fase: 'Bajada', texto: 'Baja controlado hasta que los codos formen unos 90 grados. No bajes más: el hombro sufre en exceso por debajo de ese punto.' },
        { fase: 'Subida', texto: 'Empuja hasta extender los codos, sin bloquear con un golpe seco.' }
      ],
      respiracion: 'Aire al bajar, suéltalo al subir.',
      tempo: '2 s bajando · 1 s subiendo',
      errores: [
        { fallo: 'Encoger los hombros', arreglo: 'Mantén el pecho alto y los hombros lejos de las orejas durante todo el recorrido.' },
        { fallo: 'Bajar demasiado', arreglo: 'Para en 90 grados si notas tirón en la parte delantera del hombro.' },
        { fallo: 'Balancearse para subir', arreglo: 'Si necesitas impulso, usa una goma o la máquina asistida.' }
      ],
      clave: 'Ejercicio exigente para el hombro. Si notas pinchazos delante del hombro, cambia a fondos en banco o press cerrado.'
    },

    'fly': {
      titulo: 'Aperturas',
      inicial: [
        'Túmbate o colócate con el pecho alto y las escápulas juntas.',
        'Brazos abiertos con los codos ligeramente flexionados. Esa flexión no cambia en todo el ejercicio.'
      ],
      recorrido: [
        { fase: 'Apertura', texto: 'Abre los brazos en arco hasta notar el estiramiento del pectoral, con las manos a la altura del pecho. No bajes más allá de la línea del torso.' },
        { fase: 'Cierre', texto: 'Junta las manos dibujando el mismo arco, como si abrazaras un barril. Aprieta el pectoral arriba.' }
      ],
      respiracion: 'Inspira al abrir, espira al juntar.',
      tempo: '3 s abriendo · 1 s cerrando',
      errores: [
        { fallo: 'Convertirlo en un press', arreglo: 'Si flexionas y extiendes los codos, ya no es una apertura. El ángulo del codo se queda fijo.' },
        { fallo: 'Bajar demasiado los brazos', arreglo: 'Pasar de la línea del torso estresa la cápsula del hombro sin ganar nada.' },
        { fallo: 'Usar demasiado peso', arreglo: 'Es un ejercicio de aislamiento: manda la sensación en el pectoral, no la cifra.' }
      ],
      clave: 'Imagina que abrazas un árbol grueso: los brazos dibujan un arco amplio, nunca líneas rectas.'
    },

    /* ---------------- empuje vertical ---------------- */
    'military press': {
      titulo: 'Press militar',
      inicial: [
        'De pie, pies al ancho de las caderas, barra apoyada en la parte alta del pecho.',
        'Manos algo más abiertas que los hombros, codos ligeramente por delante de la barra.',
        'Aprieta glúteos y abdomen: son los que evitan que la espalda se arquee al empujar.'
      ],
      recorrido: [
        { fase: 'Subida', texto: 'Mete la barbilla hacia atrás para dejar paso a la barra y empuja en vertical. Cuando la barra pase la frente, mete la cabeza hacia delante: la barra acaba justo encima de la coronilla, no por delante.' },
        { fase: 'Bajada', texto: 'Baja controlado por la misma línea hasta las clavículas.' }
      ],
      respiracion: 'Coge aire abajo, aguanta durante el empuje y suelta arriba.',
      tempo: '1 s subiendo · 2 s bajando',
      errores: [
        { fallo: 'Arquear la espalda baja', arreglo: 'Aprieta glúteos y costillas hacia abajo. Si sigue pasando, baja el peso o hazlo sentado con respaldo.' },
        { fallo: 'Dejar la barra por delante arriba', arreglo: 'Termina con la barra sobre la cabeza; si queda adelantada, el hombro trabaja en desventaja.' },
        { fallo: 'Empujar con las piernas', arreglo: 'En el militar estricto las piernas no ayudan. Si flexionas rodillas, estás haciendo push press.' }
      ],
      clave: 'La cabeza se aparta y vuelve: ese pequeño movimiento es lo que permite que la barra suba recta.'
    },

    'shoulder press': { alias: 'military press' },
    'press': { alias: 'military press' },

    /* ---------------- tracción vertical ---------------- */
    'pull up': {
      titulo: 'Dominadas',
      inicial: [
        'Agarre algo más ancho que los hombros, palmas hacia delante, pulgar rodeando la barra.',
        'Cuelga con los brazos extendidos pero con los hombros activos: baja las escápulas antes de tirar, sin quedar descolgado del todo.',
        'Aprieta glúteos y abdomen, piernas juntas y algo por delante para no balancearte.'
      ],
      recorrido: [
        { fase: 'Subida', texto: 'Empieza bajando las escápulas y después tira con los codos hacia el suelo, llevándolos al costado. Sube hasta pasar la barbilla por encima de la barra, con el pecho hacia ella.' },
        { fase: 'Bajada', texto: 'Baja en 3 segundos hasta extender los brazos. La bajada controlada es la que más hace crecer la espalda.' }
      ],
      respiracion: 'Espira al subir, inspira al bajar.',
      tempo: '1 s subiendo · 3 s bajando',
      errores: [
        { fallo: 'Balancear el cuerpo', arreglo: 'Si necesitas impulso, usa una goma o la máquina asistida y haz repeticiones limpias.' },
        { fallo: 'Recorrido corto', arreglo: 'Sube hasta pasar la barbilla y baja hasta estirar. Media dominada no cuenta.' },
        { fallo: 'Tirar solo con los brazos', arreglo: 'Piensa en llevar los codos al bolsillo trasero: así entra la espalda antes que el bíceps.' }
      ],
      clave: 'Primero bajan los hombros, después suben los codos. Si empiezas tirando con los brazos, la espalda apenas participa.'
    },

    'chin up': { alias: 'pull up' },

    'lat pulldown': {
      titulo: 'Jalón al pecho',
      inicial: [
        'Ajusta el rodillo para que las piernas queden bien sujetas y no te levantes al tirar.',
        'Agarre algo más ancho que los hombros. Siéntate con el pecho alto y una inclinación hacia atrás de unos 20 grados, sin más.'
      ],
      recorrido: [
        { fase: 'Tirón', texto: 'Baja las escápulas y lleva la barra hacia la parte alta del pecho, con los codos apuntando al suelo. Para cuando la barra llegue a las clavículas.' },
        { fase: 'Vuelta', texto: 'Deja que la barra suba en 3 segundos hasta estirar los brazos y permitir que los hombros suban un poco: ese estiramiento final es parte del ejercicio.' }
      ],
      respiracion: 'Espira al tirar, inspira al volver.',
      tempo: '1 s tirando · 3 s volviendo',
      errores: [
        { fallo: 'Tirar por detrás de la nuca', arreglo: 'Es incómodo para el hombro y el cuello y no aporta nada. Siempre al pecho.' },
        { fallo: 'Echarse muy atrás', arreglo: 'Más de 30 grados convierte el jalón en un remo. Inclinación ligera y constante.' },
        { fallo: 'Soltar de golpe', arreglo: 'La vuelta controlada es donde más trabaja el dorsal.' }
      ],
      clave: 'Si notas más el bíceps que la espalda, prueba con agarre neutro y piensa en empujar los codos hacia abajo.'
    },

    'pulldown': { alias: 'lat pulldown' },

    /* ---------------- tracción horizontal ---------------- */
    'row': {
      titulo: 'Remo',
      inicial: [
        'Con barra: pies al ancho de caderas, rodillas algo flexionadas, cadera hacia atrás hasta que el torso quede a unos 45 grados o algo más horizontal.',
        'Espalda recta y neutra: ni redondeada ni exageradamente arqueada. La mirada al suelo un metro por delante.',
        'Barra colgando con los brazos extendidos, cerca de las espinillas.'
      ],
      recorrido: [
        { fase: 'Tirón', texto: 'Lleva la barra hacia el ombligo o la parte baja del abdomen, con los codos pegados al cuerpo. Aprieta las escápulas al final, como si sujetaras un lápiz entre ellas.' },
        { fase: 'Vuelta', texto: 'Baja en 2 o 3 segundos hasta estirar los brazos, sin dejar que los hombros se vayan hacia delante en exceso ni que la espalda se redondee.' }
      ],
      respiracion: 'Espira al tirar, inspira al bajar.',
      tempo: '1 s tirando · 2 s bajando',
      errores: [
        { fallo: 'Incorporarse en cada repetición', arreglo: 'El torso mantiene su ángulo. Si te levantas para subir el peso, está pesando demasiado.' },
        { fallo: 'Redondear la espalda baja', arreglo: 'Riesgo real para la lumbar. Baja el peso y apoya el pecho en un banco inclinado si te cuesta mantener la posición.' },
        { fallo: 'Tirar hacia el pecho con barra', arreglo: 'Con agarre prono, la barra va al abdomen. Al pecho es un ejercicio distinto y más incómodo.' }
      ],
      clave: 'La cadera va hacia atrás, no las rodillas hacia delante. Si notas la lumbar, revisa esa posición antes que el peso.',
      seguridad: 'Con molestias lumbares, elige remo con apoyo en el pecho o remo sentado en polea.'
    },

    'face pull': {
      titulo: 'Face pull',
      inicial: [
        'Polea a la altura de la cara con cuerda. Agarre con las palmas enfrentadas.',
        'Da un paso atrás hasta notar tensión, pies escalonados para mantener el equilibrio.'
      ],
      recorrido: [
        { fase: 'Tirón', texto: 'Tira de la cuerda hacia la frente separando las manos, con los codos altos, a la altura de los hombros. Termina con las manos a los lados de la cabeza, como haciendo un doble bíceps.' },
        { fase: 'Vuelta', texto: 'Vuelve despacio hasta que los brazos se extiendan y los hombros se adelanten un poco.' }
      ],
      respiracion: 'Espira al tirar, inspira al volver.',
      tempo: '1 s tirando · 2 s volviendo · 1 s de pausa al final',
      errores: [
        { fallo: 'Bajar los codos', arreglo: 'Si los codos caen, se convierte en un remo. Manténlos altos.' },
        { fallo: 'Demasiado peso', arreglo: 'Es un ejercicio de salud del hombro. Con exceso de carga el trapecio se lo lleva todo.' }
      ],
      clave: 'De los mejores ejercicios para compensar tantos empujes. Encaja bien al final de los días de pecho.'
    },

    'shrug': {
      titulo: 'Encogimientos',
      inicial: [
        'De pie, peso colgando a los lados o delante, brazos extendidos.',
        'Pecho alto, mirada al frente y abdomen firme.'
      ],
      recorrido: [
        { fase: 'Subida', texto: 'Sube los hombros en vertical, hacia las orejas, todo lo que puedas. Aguanta un segundo arriba.' },
        { fase: 'Bajada', texto: 'Baja despacio hasta notar el estiramiento del trapecio.' }
      ],
      respiracion: 'Espira al subir, inspira al bajar.',
      tempo: '1 s subiendo · 1 s de pausa · 2 s bajando',
      errores: [
        { fallo: 'Girar los hombros', arreglo: 'Los círculos no aportan y comprometen el hombro. El movimiento es solo arriba y abajo.' },
        { fallo: 'Flexionar los codos', arreglo: 'Los brazos son ganchos: si tiras con ellos, deja de trabajar el trapecio.' }
      ],
      clave: 'La pausa arriba vale más que añadir peso.'
    },

    /* ---------------- dominante de rodilla ---------------- */
    'squat': {
      titulo: 'Sentadilla',
      inicial: [
        'Barra apoyada en la parte alta de la espalda, sobre los trapecios, no sobre el cuello.',
        'Pies al ancho de los hombros o algo más, puntas ligeramente hacia fuera, entre 15 y 30 grados.',
        'Coge aire, llena el abdomen y aprieta como si fueras a recibir un golpe. Mirada al frente o algo abajo.'
      ],
      recorrido: [
        { fase: 'Bajada', texto: 'Rompe a la vez con cadera y rodillas. Baja en 2 o 3 segundos hasta que la cadera quede por debajo de la rodilla, o hasta donde puedas mantener la espalda neutra. Las rodillas siguen la dirección de las puntas de los pies.' },
        { fase: 'Subida', texto: 'Empuja el suelo con todo el pie y sube. La cadera y el pecho suben a la vez: si la cadera se adelanta, el ejercicio se convierte en un buenos días.' }
      ],
      respiracion: 'Coge aire arriba, aguanta durante toda la repetición y suelta al pasar el punto difícil de la subida.',
      tempo: '3 s bajando · 0 s abajo · 1 s subiendo',
      errores: [
        { fallo: 'Las rodillas se van hacia dentro', arreglo: 'Piensa en separar el suelo con los pies. Si persiste, refuerza glúteo medio con banda.' },
        { fallo: 'Los talones se levantan', arreglo: 'Suele ser falta de movilidad de tobillo. Prueba con calzado de suela dura o una cuña; abrir un poco más las puntas también ayuda.' },
        { fallo: 'La espalda se redondea abajo', arreglo: 'Ese es tu límite de profundidad hoy. Baja hasta justo antes de que ocurra.' },
        { fallo: 'Mirar al techo', arreglo: 'Hiperextiende el cuello. Mirada al frente o ligeramente abajo, y que se mueva con el torso.' }
      ],
      clave: 'La profundidad útil es hasta donde mantienes la espalda neutra. Ganarás más bajando bien con menos peso.',
      seguridad: 'Ajusta los seguros del rack a la altura de la posición más baja antes de empezar.'
    },

    'front squat': { alias: 'squat' },
    'leg press': {
      titulo: 'Prensa de piernas',
      inicial: [
        'Espalda y glúteos completamente pegados al respaldo. Si el glúteo se despega abajo, la lumbar paga la factura.',
        'Pies en la plataforma al ancho de los hombros, a media altura. Más arriba trabaja más el glúteo e isquios; más abajo, el cuádriceps.'
      ],
      recorrido: [
        { fase: 'Bajada', texto: 'Baja en 3 segundos hasta que las rodillas lleguen a unos 90 grados, o hasta justo antes de que la cadera se despegue del asiento.' },
        { fase: 'Empuje', texto: 'Empuja con toda la planta del pie hasta casi extender las piernas, sin bloquear las rodillas de golpe.' }
      ],
      respiracion: 'Inspira al bajar, espira al empujar.',
      tempo: '3 s bajando · 1 s empujando',
      errores: [
        { fallo: 'Bajar tanto que la cadera se levanta', arreglo: 'Es la causa más común de molestia lumbar en la prensa. Reduce el recorrido.' },
        { fallo: 'Bloquear las rodillas de golpe', arreglo: 'Deja un grado de flexión al final.' },
        { fallo: 'Ayudarse con las manos en las rodillas', arreglo: 'Agárrate a las asas laterales.' }
      ],
      clave: 'Permite cargar mucho peso con poco riesgo, pero solo si la cadera no se despega del asiento.'
    },

    'lunge': {
      titulo: 'Zancadas',
      inicial: [
        'De pie, tronco erguido, abdomen firme y mirada al frente.',
        'Peso en las manos a los lados o barra en la espalda.'
      ],
      recorrido: [
        { fase: 'Bajada', texto: 'Da un paso largo al frente y baja en vertical hasta que la rodilla de atrás quede a un dedo del suelo y la de delante forme 90 grados. El torso se mantiene vertical.' },
        { fase: 'Subida', texto: 'Empuja con el talón de la pierna delantera para volver a la posición inicial.' }
      ],
      respiracion: 'Inspira al bajar, espira al subir.',
      tempo: '2 s bajando · 1 s subiendo',
      errores: [
        { fallo: 'Paso demasiado corto', arreglo: 'La rodilla delantera se adelanta en exceso. Alarga el paso.' },
        { fallo: 'Inclinar el torso', arreglo: 'Mantén el pecho alto; si te caes hacia delante, baja el peso.' },
        { fallo: 'La rodilla se va hacia dentro', arreglo: 'Que apunte en la dirección del pie. Ir más despacio suele bastar.' }
      ],
      clave: 'Baja en vertical, como si te sentaras entre las dos piernas, en lugar de lanzarte hacia delante.'
    },

    'leg extension': {
      titulo: 'Extensión de cuádriceps',
      inicial: [
        'Ajusta el respaldo para que la rodilla coincida con el eje de giro de la máquina.',
        'El rodillo debe apoyar sobre el tobillo, no sobre el empeine.'
      ],
      recorrido: [
        { fase: 'Extensión', texto: 'Extiende las rodillas hasta casi bloquear y aguanta un segundo apretando el cuádriceps.' },
        { fase: 'Vuelta', texto: 'Baja en 3 segundos, sin dejar que el peso caiga.' }
      ],
      respiracion: 'Espira al extender, inspira al bajar.',
      tempo: '1 s subiendo · 1 s de pausa · 3 s bajando',
      errores: [
        { fallo: 'Coger impulso con la cadera', arreglo: 'Agárrate al asiento y mueve solo las rodillas.' },
        { fallo: 'Soltar el peso de golpe', arreglo: 'La bajada controlada es la mitad del ejercicio.' }
      ],
      clave: 'La pausa arriba, apretando, da más que subir el peso.'
    },

    /* ---------------- dominante de cadera ---------------- */
    'deadlift': {
      titulo: 'Peso muerto',
      inicial: [
        'Barra sobre el medio del pie, casi tocando la espinilla. Pies al ancho de las caderas.',
        'Cadera atrás y baja hasta agarrar la barra por fuera de las piernas, con los brazos verticales.',
        'Pecho alto, espalda neutra, hombros ligeramente por delante de la barra. Coge aire y aprieta el abdomen.',
        'Antes de tirar, "quita la holgura" a la barra: tensa los brazos hasta oír cómo los discos asientan.'
      ],
      recorrido: [
        { fase: 'Despegue', texto: 'Empuja el suelo con las piernas manteniendo la barra pegada al cuerpo. La cadera y el pecho suben a la vez; la espalda no cambia de ángulo.' },
        { fase: 'Bloqueo', texto: 'Al pasar las rodillas, lleva la cadera hacia delante y termina de pie, apretando glúteos. Sin echarte hacia atrás ni encoger los hombros.' },
        { fase: 'Bajada', texto: 'Lleva primero la cadera atrás, y cuando la barra pase las rodillas, flexiónalas. La barra baja rozando las piernas.' }
      ],
      respiracion: 'Coge aire abajo, aguántalo toda la repetición y suéltalo arriba. Vuelve a coger aire antes de la siguiente.',
      tempo: '1 s subiendo · 2 s bajando',
      errores: [
        { fallo: 'La barra se separa del cuerpo', arreglo: 'Es la causa número uno de lumbares cargadas. Piensa en arrastrar la barra por las piernas.' },
        { fallo: 'La cadera sube antes que el pecho', arreglo: 'Se convierte en un buenos días con mucho peso. Empuja el suelo en lugar de tirar con la espalda.' },
        { fallo: 'Redondear la espalda', arreglo: 'Si no puedes mantenerla neutra abajo, eleva la barra sobre unos discos y trabaja desde ahí.' },
        { fallo: 'Hiperextender arriba', arreglo: 'Termina de pie y firme, no arqueado hacia atrás.' }
      ],
      clave: 'Es un empuje de piernas con la espalda rígida, no un tirón de espalda. Cada repetición empieza de cero desde el suelo.',
      seguridad: 'Si notas la lumbar en lugar de glúteo e isquios, para la serie y revisa la posición de la cadera.'
    },

    'romanian deadlift': {
      titulo: 'Peso muerto rumano',
      inicial: [
        'De pie con la barra a la altura de la cadera, brazos extendidos, pies al ancho de las caderas.',
        'Rodillas ligeramente flexionadas: ese ángulo se mantiene todo el ejercicio.',
        'Pecho alto y escápulas ligeramente juntas.'
      ],
      recorrido: [
        { fase: 'Bajada', texto: 'Lleva la cadera hacia atrás, como si empujaras una puerta con el glúteo, mientras la barra baja rozando los muslos. Baja hasta notar un estiramiento fuerte en los isquios, normalmente a media espinilla. La espalda no se redondea.' },
        { fase: 'Subida', texto: 'Empuja la cadera hacia delante y aprieta los glúteos para volver arriba. La barra sigue pegada a la pierna.' }
      ],
      respiracion: 'Inspira arriba, aguanta durante la bajada y espira al terminar de subir.',
      tempo: '3 s bajando · 1 s subiendo',
      errores: [
        { fallo: 'Flexionar las rodillas al bajar', arreglo: 'Entonces es un peso muerto convencional. El ángulo de rodilla no cambia.' },
        { fallo: 'Bajar hasta el suelo', arreglo: 'El recorrido lo marca el estiramiento del isquio, no el suelo.' },
        { fallo: 'Separar la barra del cuerpo', arreglo: 'Debe rozar el muslo. Si se aleja, la lumbar se lleva la carga.' }
      ],
      clave: 'El movimiento es de cadera hacia atrás, no de columna hacia delante. Si no notas los isquios, no estás llevando la cadera atrás.'
    },

    'good morning': { alias: 'romanian deadlift' },

    'hip thrust': {
      titulo: 'Empuje de cadera',
      inicial: [
        'Espalda alta apoyada en el borde de un banco, justo debajo de las escápulas.',
        'Pies al ancho de las caderas, colocados de forma que al subir la tibia quede vertical.',
        'Barra sobre el pliegue de la cadera, con una almohadilla.'
      ],
      recorrido: [
        { fase: 'Subida', texto: 'Empuja con los talones y sube la cadera hasta que el cuerpo forme una línea recta de rodillas a hombros. Aprieta el glúteo un segundo arriba.' },
        { fase: 'Bajada', texto: 'Baja controlado sin llegar a apoyar del todo, para no perder tensión.' }
      ],
      respiracion: 'Espira al subir, inspira al bajar.',
      tempo: '1 s subiendo · 1 s de pausa · 2 s bajando',
      errores: [
        { fallo: 'Hiperextender la espalda arriba', arreglo: 'Mete las costillas hacia dentro y termina el movimiento con el glúteo, no con la lumbar.' },
        { fallo: 'Pies mal colocados', arreglo: 'Si quedan muy cerca trabaja el cuádriceps; muy lejos, los isquios. Busca la tibia vertical arriba.' },
        { fallo: 'Empujar con las puntas', arreglo: 'Presiona con el talón.' }
      ],
      clave: 'Mira hacia delante durante todo el movimiento: si sigues la barra con la vista, la lumbar se arquea.'
    },

    'glute bridge': { alias: 'hip thrust' },
    'bridge': { alias: 'hip thrust' },

    'leg curl': {
      titulo: 'Curl femoral',
      inicial: [
        'Ajusta la máquina para que la rodilla coincida con su eje de giro.',
        'El rodillo apoya justo encima del talón, no en el gemelo.'
      ],
      recorrido: [
        { fase: 'Flexión', texto: 'Flexiona las rodillas llevando los talones hacia los glúteos, todo el recorrido que permita la máquina. Aguanta un instante.' },
        { fase: 'Vuelta', texto: 'Baja en 3 segundos hasta casi extender, sin soltar el peso.' }
      ],
      respiracion: 'Espira al flexionar, inspira al volver.',
      tempo: '1 s subiendo · 3 s bajando',
      errores: [
        { fallo: 'Despegar la cadera', arreglo: 'Mantén la pelvis pegada; si se levanta, baja el peso.' },
        { fallo: 'Recorrido corto', arreglo: 'Lleva los talones lo más cerca posible del glúteo.' }
      ],
      clave: 'Los isquios responden muy bien a la fase negativa: baja despacio.'
    },

    'calf raise': {
      titulo: 'Elevación de talones',
      inicial: [
        'Punta del pie sobre el escalón o la plataforma, con el talón en el aire.',
        'Piernas rectas para el gemelo; sentado y con las rodillas dobladas para el sóleo.'
      ],
      recorrido: [
        { fase: 'Subida', texto: 'Sube hasta ponerte de puntillas todo lo alto que puedas y aprieta un segundo arriba.' },
        { fase: 'Bajada', texto: 'Baja despacio hasta notar el estiramiento completo del gemelo, con el talón por debajo del nivel del escalón.' }
      ],
      respiracion: 'Espira al subir, inspira al bajar.',
      tempo: '1 s subiendo · 1 s de pausa · 3 s bajando',
      errores: [
        { fallo: 'Rebotar', arreglo: 'El tendón devuelve la energía y el músculo no trabaja. Pausa abajo y arriba.' },
        { fallo: 'Recorrido corto', arreglo: 'El gemelo necesita rango completo: estiramiento abajo y contracción máxima arriba.' }
      ],
      clave: 'Es de los músculos que más pausa y rango necesita, y menos peso de lo que la gente cree.'
    },

    /* ---------------- brazos ---------------- */
    'curl': {
      titulo: 'Curl de bíceps',
      inicial: [
        'De pie, pies al ancho de las caderas, abdomen firme.',
        'Codos pegados al costado y ligeramente por delante del torso. Ahí se quedan.',
        'Hombros atrás y abajo, pecho alto.'
      ],
      recorrido: [
        { fase: 'Subida', texto: 'Flexiona el codo llevando el peso hacia el hombro. El codo no se mueve del sitio: solo gira el antebrazo. Aprieta el bíceps arriba.' },
        { fase: 'Bajada', texto: 'Baja en 3 segundos hasta extender casi por completo. Ese estiramiento final es donde más crece el bíceps.' }
      ],
      respiracion: 'Espira al subir, inspira al bajar.',
      tempo: '1 s subiendo · 3 s bajando',
      errores: [
        { fallo: 'Balancear el cuerpo', arreglo: 'Si necesitas impulso, el peso sobra. Prueba de espaldas a una pared.' },
        { fallo: 'Adelantar los codos al subir', arreglo: 'Al llevar el codo hacia delante entra el hombro y descansa el bíceps.' },
        { fallo: 'No estirar abajo', arreglo: 'Media repetición, medio resultado. Extiende casi del todo.' }
      ],
      clave: 'El bíceps es un músculo pequeño: manda la técnica y la sensación, nunca la cifra del peso.'
    },

    'hammer curl': { alias: 'curl' },
    'preacher curl': { alias: 'curl' },
    'wrist curl': {
      titulo: 'Curl de muñeca',
      inicial: [
        'Antebrazos apoyados en un banco o en los muslos, muñecas por fuera del apoyo.',
        'Palmas hacia arriba para el flexor, hacia abajo para el extensor.'
      ],
      recorrido: [
        { fase: 'Subida', texto: 'Flexiona solo la muñeca, todo el recorrido, y aprieta arriba.' },
        { fase: 'Bajada', texto: 'Baja despacio hasta el estiramiento completo, dejando incluso que la barra ruede hasta los dedos.' }
      ],
      respiracion: 'Normal y continua.',
      tempo: '1 s subiendo · 2 s bajando',
      errores: [
        { fallo: 'Mover el antebrazo', arreglo: 'Solo se mueve la muñeca; el antebrazo queda fijo en el apoyo.' }
      ],
      clave: 'Poco peso y muchas repeticiones funcionan mejor en antebrazo.'
    },

    'triceps extension': {
      titulo: 'Extensión de tríceps',
      inicial: [
        'Codos apuntando al techo si es por encima de la cabeza, o pegados al costado si es en polea.',
        'La posición del codo no cambia durante el ejercicio: es la referencia de todo el movimiento.'
      ],
      recorrido: [
        { fase: 'Extensión', texto: 'Extiende el codo hasta estirar el brazo del todo y aprieta el tríceps un segundo.' },
        { fase: 'Vuelta', texto: 'Flexiona controlado hasta notar el estiramiento del tríceps, sin que el codo se desplace.' }
      ],
      respiracion: 'Espira al extender, inspira al volver.',
      tempo: '1 s extendiendo · 2 s volviendo',
      errores: [
        { fallo: 'Los codos se abren', arreglo: 'Manténlos apuntando al frente o al techo. Al abrirse, el pecho y el hombro ayudan.' },
        { fallo: 'Mover el hombro', arreglo: 'Solo se mueve el antebrazo.' },
        { fallo: 'Demasiado peso', arreglo: 'Con exceso de carga el movimiento se convierte en un press.' }
      ],
      clave: 'La cabeza larga del tríceps solo se estira con el brazo por encima de la cabeza: incluye alguna variante así.'
    },

    'triceps pushdown': { alias: 'triceps extension' },
    'pushdown': { alias: 'triceps extension' },
    'kickback': { alias: 'triceps extension' },

    'lateral raise': {
      titulo: 'Elevación lateral',
      inicial: [
        'De pie, mancuernas a los lados, codos con una ligera flexión constante.',
        'Inclínate un par de grados hacia delante y mantén el abdomen firme.'
      ],
      recorrido: [
        { fase: 'Subida', texto: 'Sube los brazos por los lados hasta la altura del hombro, no más. Lidera el movimiento con el codo, como si vertieras agua de una jarra con el meñique algo más alto.' },
        { fase: 'Bajada', texto: 'Baja en 3 segundos resistiendo el peso, sin dejar que caiga.' }
      ],
      respiracion: 'Espira al subir, inspira al bajar.',
      tempo: '1 s subiendo · 3 s bajando',
      errores: [
        { fallo: 'Subir por encima del hombro', arreglo: 'A partir de ahí trabaja el trapecio, no el deltoides.' },
        { fallo: 'Impulsar con las piernas', arreglo: 'Con exceso de peso es inevitable. Baja la carga: aquí funcionan mejor pesos ligeros.' },
        { fallo: 'Encoger los hombros', arreglo: 'Mantén los hombros lejos de las orejas durante todo el recorrido.' }
      ],
      clave: 'De los ejercicios donde menos importa el peso y más la ejecución. Con 5 o 6 kg bien hechos sobra.'
    },

    'raise': { alias: 'lateral raise' },
    'front raise': { alias: 'lateral raise' },

    /* ---------------- core ---------------- */
    'plank': {
      titulo: 'Plancha',
      inicial: [
        'Antebrazos en el suelo, codos justo debajo de los hombros, manos al frente.',
        'Cuerpo en línea recta de la cabeza a los talones, con los pies al ancho de las caderas.'
      ],
      recorrido: [
        { fase: 'Sostener', texto: 'Aprieta glúteos y abdomen, mete la pelvis ligeramente hacia dentro y empuja el suelo con los antebrazos para separar las escápulas. Mantén la posición el tiempo indicado.' }
      ],
      respiracion: 'Respira de forma continua y superficial. Si aguantas la respiración, no llegas a los segundos previstos.',
      tempo: 'De 20 a 60 segundos por serie',
      errores: [
        { fallo: 'La cadera se hunde', arreglo: 'Es la señal de que el abdomen se ha rendido. Termina la serie ahí: más tiempo mal hecho no suma.' },
        { fallo: 'Subir demasiado la cadera', arreglo: 'Descansa la posición pero no entrena. Busca la línea recta.' },
        { fallo: 'Aguantar la respiración', arreglo: 'Respira siempre.' }
      ],
      clave: 'Es calidad, no cronómetro. Treinta segundos apretando de verdad valen más que dos minutos aguantando.'
    },

    'crunch': {
      titulo: 'Crunch abdominal',
      inicial: [
        'Boca arriba, rodillas flexionadas y pies apoyados.',
        'Manos en el pecho o al lado de la cabeza, sin tirar del cuello.'
      ],
      recorrido: [
        { fase: 'Subida', texto: 'Enrolla la columna despegando los omóplatos del suelo, acercando las costillas a la pelvis. Es un movimiento corto: no hay que sentarse.' },
        { fase: 'Bajada', texto: 'Baja despacio desenrollando vértebra a vértebra, sin apoyar del todo la cabeza entre repeticiones.' }
      ],
      respiracion: 'Espira con fuerza al subir, como si soplaras una vela; inspira al bajar.',
      tempo: '1 s subiendo · 2 s bajando',
      errores: [
        { fallo: 'Tirar del cuello con las manos', arreglo: 'Apoya la lengua en el paladar y mantén un puño de distancia entre la barbilla y el pecho.' },
        { fallo: 'Subir todo el torso', arreglo: 'Entonces trabaja el flexor de la cadera. El recorrido del crunch es corto.' }
      ],
      clave: 'Espirar fuerte al subir activa el abdomen profundo mucho más que añadir repeticiones.'
    },

    'leg raise': {
      titulo: 'Elevación de piernas',
      inicial: [
        'Colgado de la barra o tumbado con la lumbar pegada al suelo.',
        'Antes de empezar, mete la pelvis hacia dentro para eliminar el arco lumbar.'
      ],
      recorrido: [
        { fase: 'Subida', texto: 'Sube las piernas llevando la pelvis hacia las costillas. El abdomen empieza a trabajar de verdad cuando la pelvis se enrolla, no solo cuando suben las piernas.' },
        { fase: 'Bajada', texto: 'Baja en 3 segundos sin perder el contacto de la lumbar con el suelo, o sin balancearte si estás colgado.' }
      ],
      respiracion: 'Espira al subir, inspira al bajar.',
      tempo: '2 s subiendo · 3 s bajando',
      errores: [
        { fallo: 'Arquear la lumbar', arreglo: 'Reduce el recorrido o flexiona las rodillas hasta poder mantenerla apoyada.' },
        { fallo: 'Balancearse en la barra', arreglo: 'Aprieta los glúteos y empieza cada repetición desde parado.' }
      ],
      clave: 'Si solo suben las piernas y la pelvis no se mueve, estás trabajando el psoas y no el abdomen.'
    },

    'russian twist': {
      titulo: 'Giro ruso',
      inicial: [
        'Sentado, rodillas flexionadas, torso inclinado unos 45 grados hacia atrás.',
        'Espalda recta, pecho alto, peso sujeto con las dos manos frente al pecho.'
      ],
      recorrido: [
        { fase: 'Giro', texto: 'Gira el torso hacia un lado llevando el peso junto a la cadera. El giro sale del tronco, no de los brazos.' },
        { fase: 'Vuelta', texto: 'Pasa al otro lado con control, sin dejar caer el peso.' }
      ],
      respiracion: 'Espira en cada giro.',
      tempo: 'Controlado, sin prisa',
      errores: [
        { fallo: 'Mover solo los brazos', arreglo: 'Que giren los hombros con el torso; la mirada acompaña al peso.' },
        { fallo: 'Redondear la espalda', arreglo: 'Pecho alto. Si se hunde, incorpórate un poco.' }
      ],
      clave: 'Mejor despacio y girando de verdad que rápido moviendo los brazos.'
    },

    /* ---------------- otros ---------------- */
    'stretch': {
      titulo: 'Estiramiento',
      inicial: [
        'Colócate en la posición sin forzar y busca una tensión cómoda, nunca dolor.'
      ],
      recorrido: [
        { fase: 'Mantener', texto: 'Sostén la posición entre 20 y 40 segundos respirando despacio. En cada espiración gana un poco de rango, sin rebotes.' }
      ],
      respiracion: 'Lenta y profunda: la espiración es la que permite ganar rango.',
      tempo: 'De 20 a 40 segundos por lado',
      errores: [
        { fallo: 'Rebotar', arreglo: 'Los rebotes provocan que el músculo se contraiga por reflejo. Estiramiento sostenido.' },
        { fallo: 'Estirar hasta el dolor', arreglo: 'Tensión sí, dolor no.' }
      ],
      clave: 'Los estiramientos largos van mejor al terminar de entrenar. Antes, mejor movilidad en movimiento.'
    },

    'smr': {
      titulo: 'Liberación miofascial',
      inicial: [
        'Coloca el rodillo bajo el músculo que quieres tratar y reparte el peso con las manos o el pie libre.'
      ],
      recorrido: [
        { fase: 'Rodar', texto: 'Rueda despacio, unos 3 centímetros por segundo. Cuando encuentres un punto sensible, párate ahí entre 20 y 30 segundos y respira hasta que ceda.' }
      ],
      respiracion: 'Profunda y lenta, sobre todo en los puntos sensibles.',
      tempo: 'De 1 a 2 minutos por zona',
      errores: [
        { fallo: 'Ir demasiado rápido', arreglo: 'Rodar rápido no relaja nada. Despacio y con pausas.' },
        { fallo: 'Pasar por encima de una articulación o hueso', arreglo: 'Trabaja solo sobre masa muscular; evita rodillas, codos y la zona lumbar baja.' }
      ],
      clave: 'Molestia tolerable sí, dolor agudo no. Si no puedes respirar tranquilo, quita presión.'
    },

    'clean': {
      titulo: 'Cargada',
      inicial: [
        'Posición de peso muerto con la barra sobre el medio del pie.',
        'Hombros ligeramente por delante de la barra, espalda neutra, brazos rectos y relajados.'
      ],
      recorrido: [
        { fase: 'Primer tirón', texto: 'Despega la barra del suelo empujando con las piernas, manteniendo el ángulo de la espalda. La barra sube pegada a las piernas.' },
        { fase: 'Extensión', texto: 'Al pasar la rodilla, extiende cadera, rodilla y tobillo con potencia. Los brazos siguen relajados: la barra sube por el impulso, no por tirar con los brazos.' },
        { fase: 'Recepción', texto: 'Métete debajo de la barra girando los codos hacia delante y recíbela sobre los deltoides, en media sentadilla frontal. Levántate.' }
      ],
      respiracion: 'Coge aire antes de cada repetición y suéltalo al terminar de incorporarte.',
      tempo: 'Explosivo al subir, sin prisa entre repeticiones',
      errores: [
        { fallo: 'Tirar con los brazos demasiado pronto', arreglo: 'Los brazos son cuerdas hasta la extensión completa de la cadera.' },
        { fallo: 'La barra se separa del cuerpo', arreglo: 'Debe rozar el muslo. Si se aleja, se pierde toda la potencia.' },
        { fallo: 'Recibir con los codos bajos', arreglo: 'Gira los codos rápido y alto; con codos bajos la barra cae sobre las muñecas.' }
      ],
      clave: 'Los levantamientos olímpicos son técnicos de verdad. Aprende con barra vacía y, a ser posible, con alguien que sepa mirándote.',
      seguridad: 'Hazlos en una zona despejada y con discos que puedan soltarse sin peligro. Ante la duda, elige otro ejercicio.'
    },

    'snatch': { alias: 'clean' },
    'jerk': { alias: 'clean' },

    'jump': {
      titulo: 'Saltos',
      inicial: [
        'Pies al ancho de las caderas, rodillas y cadera algo flexionadas.',
        'Asegúrate de que la superficie no resbala y de que tienes espacio libre alrededor.'
      ],
      recorrido: [
        { fase: 'Salto', texto: 'Baja rápido a media sentadilla y salta extendiendo cadera, rodilla y tobillo con toda la potencia que puedas. Los brazos acompañan hacia arriba.' },
        { fase: 'Aterrizaje', texto: 'Cae con la punta primero y amortigua flexionando rodillas y cadera, en silencio. Un aterrizaje ruidoso es un aterrizaje duro.' }
      ],
      respiracion: 'Espira en el salto.',
      tempo: 'Máxima potencia, con descanso completo entre series',
      errores: [
        { fallo: 'Aterrizar con las piernas rígidas', arreglo: 'Amortigua siempre: rodillas y cadera absorben el impacto.' },
        { fallo: 'Las rodillas se van hacia dentro al caer', arreglo: 'Baja la altura del salto hasta controlarlo.' },
        { fallo: 'Hacer muchas repeticiones seguidas', arreglo: 'Es trabajo de potencia: pocas repeticiones y buen descanso.' }
      ],
      clave: 'La calidad se pierde en cuanto llega el cansancio. Series cortas y descanso generoso.'
    }
  };

  /* Variantes que se ejecutan igual que un patrón ya descrito. Un press en el
     suelo se hace como un press de banca, y una sentadilla goblet como una
     sentadilla: no hace falta repetir la guía, basta con enlazarla. */
  const EQUIVALENTES = {
    'floor press': 'bench press', 'chest press': 'bench press',
    'push press': 'military press', 'arnold press': 'military press',
    'thruster': 'military press', 'handstand push up': 'military press',
    'landmine press': 'military press',
    'crossover': 'fly', 'pullover': 'fly',
    'muscle up': 'pull up', 'inverted row': 'row', 'bent over row': 'row',
    't bar row': 'row', 'pull': 'row', 'push': 'push up',
    'upright row': 'lateral raise', 'delt raise': 'lateral raise',
    'front squat': 'squat', 'overhead squat': 'squat', 'goblet squat': 'squat',
    'hack squat': 'squat', 'sissy squat': 'squat', 'pistol squat': 'squat',
    'wall sit': 'squat', 'split squat': 'lunge', 'step up': 'lunge',
    'walking lunge': 'lunge',
    'sumo deadlift': 'deadlift', 'rack pull': 'deadlift', 'lift': 'deadlift',
    'stiff leg deadlift': 'romanian deadlift',
    'straight leg deadlift': 'romanian deadlift',
    'hyperextension': 'romanian deadlift', 'back extension': 'romanian deadlift',
    'swing': 'hip thrust', 'kettlebell swing': 'hip thrust',
    'pull through': 'hip thrust', 'hip bridge': 'hip thrust',
    'glute kickback': 'hip thrust', 'clam': 'hip thrust',
    'heel raise': 'calf raise',
    'biceps curl': 'curl', 'concentration curl': 'curl', 'spider curl': 'curl',
    'drag curl': 'curl',
    'french press': 'triceps extension', 'skullcrusher': 'triceps extension',
    'skull crusher': 'triceps extension', 'jm press': 'triceps extension',
    'sit up': 'crunch', 'bicycle': 'crunch',
    'knee raise': 'leg raise', 'windshield wiper': 'leg raise',
    'flutter kick': 'leg raise', 'scissor kick': 'leg raise',
    'hollow hold': 'plank', 'ab roller': 'plank', 'roll out': 'plank',
    'rollout': 'plank', 'mountain climber': 'plank', 'bird dog': 'plank',
    'superman': 'plank', 'hold': 'plank', 'carry': 'plank',
    'farmers walk': 'shrug',
    'wood chop': 'russian twist', 'woodchop': 'russian twist',
    'chop': 'russian twist', 'twist': 'russian twist', 'rotation': 'russian twist',
    'circle': 'stretch',
    'power clean': 'clean', 'hang clean': 'clean', 'power snatch': 'clean',
    'hang snatch': 'clean', 'muscle snatch': 'clean', 'clean and jerk': 'clean',
    'clean and press': 'clean', 'clean pull': 'clean', 'snatch pull': 'clean',
    'box jump': 'jump', 'broad jump': 'jump', 'jump squat': 'jump',
    'hop': 'jump', 'burpee': 'jump', 'jump rope': 'jump',
    'throw': 'jump', 'slam': 'jump', 'toss': 'jump',
    'bench dip': 'dip'
  };

  Object.keys(EQUIVALENTES).forEach(function (k) {
    if (!GUIAS[k]) GUIAS[k] = { alias: EQUIVALENTES[k] };
  });

  /* Un ejercicio hereda la guía de su patrón; los alias apuntan a otra guía */
  function resolver(clave, saltos) {
    const gu = GUIAS[clave];
    if (!gu) return null;
    if (gu.alias && (saltos || 0) < 3) return resolver(gu.alias, (saltos || 0) + 1);
    return gu;
  }

  /* Hay palabras que por sí solas no dicen qué ejercicio es: un "press" puede ser
     de banca, militar o de piernas. El músculo principal deshace la ambigüedad. */
  const AMBIGUOS = {
    'press': {
      chest: 'bench press', triceps: 'bench press', shoulders: 'military press',
      quadriceps: 'leg press', calves: 'calf raise'
    },
    'raise': {
      shoulders: 'lateral raise', calves: 'calf raise', abdominals: 'leg raise',
      quadriceps: 'leg raise', traps: 'shrug', hamstrings: 'romanian deadlift'
    },
    'extension': {
      triceps: 'triceps extension', quadriceps: 'leg extension',
      'lower back': 'romanian deadlift', glutes: 'hip thrust'
    },
    'curl': {
      biceps: 'curl', hamstrings: 'leg curl', forearms: 'wrist curl'
    },
    'pull': {
      lats: 'lat pulldown', 'middle back': 'row', traps: 'shrug',
      hamstrings: 'romanian deadlift', shoulders: 'face pull'
    },
    'fly': {
      chest: 'fly', shoulders: 'lateral raise'
    },
    'row': {
      shoulders: 'lateral raise', traps: 'shrug'
    }
  };

  /* Guía de técnica para un ejercicio del catálogo, o null si no hay ninguna */
  function para(ex) {
    if (!ex) return null;
    let clave = I18N.nucleo(ex.name);
    if (!clave) return null;

    const ambiguo = AMBIGUOS[clave];
    if (ambiguo) {
      const musculos = ex.primaryMuscles || [];
      for (let i = 0; i < musculos.length; i++) {
        if (ambiguo[musculos[i]]) { clave = ambiguo[musculos[i]]; break; }
      }
    }
    return resolver(clave);
  }

  /* Cuántos ejercicios del catálogo tienen guía, para poder medirlo */
  function cobertura() {
    const todos = Data.all();
    const con = todos.filter(function (e) { return !!para(e); }).length;
    return { con: con, total: todos.length };
  }

  g.Tecnica = { GUIAS: GUIAS, para: para, cobertura: cobertura };
})(window);
