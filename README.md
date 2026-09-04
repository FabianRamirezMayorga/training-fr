# Training FR

<img src="icons/logo.svg" alt="Training FR" width="90">

App web para entrenar en el gimnasio: catálogo de **876 ejercicios con animación de la
técnica correcta**, creador de rutinas, plan semanal automático, modo entrenamiento con
temporizador de descanso y seguimiento del progreso.

Funciona en el móvil como una app instalable (PWA), sin conexión, y **sin coste alguno**:
no hay servidor, ni base de datos, ni almacenamiento que pagar.

---

## Cómo está montado (y por qué es gratis)

| Pieza | Solución | Coste |
|---|---|---|
| La app | HTML + CSS + JavaScript, sin compilación ni dependencias | 0 € |
| Hosting y URL pública | GitHub Pages (o Netlify Drop) | 0 € |
| Ejercicios, fotos e instrucciones | [free-exercise-db](https://github.com/yuhonas/free-exercise-db) servida por el CDN de jsDelivr | 0 € |
| Tus rutinas y tu historial | `localStorage` del navegador | 0 € |
| Cuenta y sincronización (opcional) | Supabase, plan gratuito | 0 € |
| Traducción de instrucciones | API pública de MyMemory, bajo demanda | 0 € |

Sin activar la cuenta, los datos se quedan en tu dispositivo y se mueven con
**Ajustes → Exportar / Importar**. Si activas la sincronización, entras con tu correo
(sin contraseña) y tus rutinas viajan solas entre el móvil y el ordenador.

---

## Publicarla en internet (GitHub Pages)

Necesitas una cuenta gratuita en [github.com](https://github.com).

1. Crea un repositorio **público** llamado `training-fr` (sin README, sin .gitignore).

2. Desde esta carpeta, en la terminal:

```bash
git remote add origin https://github.com/FabianRamirezMayorga/training-fr.git
```

```bash
git push -u origin main
```

3. En GitHub: pestaña **Settings → Pages**. En *Source* elige **Deploy from a branch**,
   rama `main`, carpeta `/ (root)`, y pulsa *Save*.

4. Al cabo de un minuto la app estará en:

   `https://FabianRamirezMayorga.github.io/training-fr/`

Esa URL es pública, con HTTPS, y no caduca. Cada `git push` la actualiza.

### Alternativa en 30 segundos: Netlify Drop

Entra en [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra la carpeta
del proyecto entera. Te da una URL al momento. El plan gratuito es suficiente de sobra
para uso personal.

---

## Instalarla en el móvil

Abre la URL en el navegador del teléfono y usa **«Añadir a la pantalla de inicio»**:

- **Android (Chrome)**: menú del navegador → *Añadir a pantalla de inicio*
- **iPhone (Safari)**: botón Compartir → *Añadir a pantalla de inicio*

Queda como una app más: icono propio, pantalla completa y funciona sin datos una vez
que has abierto los ejercicios al menos una vez.

---

## Dos formas de usarla

Al abrirla por primera vez pregunta dos cosas: dónde entrenas y cómo quieres empezar.

- **Como invitado.** Sin dar ningún dato. Todo se guarda en ese dispositivo y solo ahí, y
  la app lo dice claramente antes de seguir: se pierde si borras los datos del navegador,
  no hay copia en ningún servidor y no lo verás en tu otro móvil. Cuando vas a personalizar
  algo que merece la pena conservar —tu peso, tus hábitos, tus limitaciones— te ofrece crear
  la cuenta, y si prefieres seguir sin ella, adelante. Lo hecho hasta entonces no se pierde:
  al crear la cuenta después, se sube.
- **Con cuenta.** Correo y contraseña, y lo mismo en todos tus dispositivos.

El catálogo, las rutinas, el programa personal y el registro de entrenamientos **funcionan
sin cuenta y sin internet**. La cuenta es para no perderlos. La clave de IA (gratuita) es
para el entrenador, el menú de comidas, las listas de música y la revisión del programa.

Quien no tenga base de datos encuentra en *Mi cuenta* un **paso a paso de siete pasos** con
los nombres exactos de cada menú de Supabase, el SQL listo para copiar, la dirección que hay
que autorizar y dónde están los dos datos de conexión.

---

## Qué hace

- **Eliges dónde entrenas al abrirla** — gimnasio, casa con mancuernas, casa con bandas,
  sin material o **Ver todo** (el catálogo completo, sin filtrar, para curiosear o para
  quien todavía no sabe con qué va a entrenar). A partir de ahí el catálogo, el buscador y
  las rutinas generadas solo ofrecen ejercicios que puedas hacer de verdad ahí. Se cambia
  en un toque desde el botón de la barra superior.
- **Tu programa personal** — no es una plantilla con tu nombre encima. A partir de tu
  perfil (sexo, edad, nivel, objetivo, descanso y limitaciones) calcula las **series
  semanales por músculo** que te tocan, elige los rangos de repeticiones y descansos del
  objetivo, y construye la semana **por patrones de movimiento** (empuje horizontal,
  tracción vertical, bisagra de cadera, sentadilla…), que es lo que evita el plan de seis
  variantes de press y ni una dominada. Con el reparto que más rinde para tus días: cuerpo
  completo a 2-3 días, torso/pierna a 4, empuje-tracción-pierna a 5 o 6.

  Te enseña **por qué** cada decisión, cuántas series efectivas recibe cada músculo (el
  trabajo indirecto cuenta la mitad), qué músculos se quedan cortos con el tiempo que
  tienes, y el **bloque de cinco semanas** para progresar de verdad en vez de repetir el
  mismo peso. Si tienes clave de Gemini, la IA revisa el programa, señala desequilibrios y
  propone cambios de ejercicio: cada cambio se valida contra el catálogo, tu material y tus
  limitaciones antes de aplicarse, así que no puede colar algo que no existe o que te hace
  daño.
- **Las limitaciones se respetan solas** — escribe *«me duele la rodilla»* o *«manguito
  rotador»* en el perfil y el programa retira patrones completos: sin impacto, la sentadilla
  en versión guiada, el press por encima de la cabeza con mancuernas en vez de barra, fuera
  el remo al mentón y los fondos. Cubre rodilla, hombro, espalda baja, codo, muñeca, cadera,
  tobillo, cuello y tensión alta, y te dice exactamente qué ha quitado y por qué.
- **Plan semanal rápido** — si no quieres rellenar el perfil, sigue estando el asistente de
  siempre: días, tiempo y objetivo, y reparte los grupos musculares por día.
- **Guías de técnica en español** — cada ejercicio explica la posición inicial paso a
  paso, el recorrido dividido en fases, la respiración, el ritmo y los errores más
  frecuentes con su corrección. Están escritas por patrón de movimiento, así que cubren
  721 de los 876 ejercicios sin depender de internet ni de la IA. Durante el
  entrenamiento se abren en una hoja rápida sin salir de la serie.
- **Ejercicios segmentados por músculo** — al entrar en *Pierna* aparecen secciones
  separadas de cuádriceps, isquiotibiales, glúteos, gemelos, aductores y abductores,
  cada una con su carrusel. Cada ficha muestra la técnica **animada**, los músculos
  implicados, las instrucciones paso a paso (traducibles con un toque) y un enlace a
  vídeos de YouTube.
- **El buscador entiende zonas del cuerpo** — *«pierna»* no es una palabra que buscar en
  los nombres: es una zona. Al escribirla (o *«tren superior»*, *«empuje»*, *«tracción»*,
  *«cuerpo completo»*) la app abre todos sus músculos por separado. Y *«femoral»*,
  *«gemelo»* o *«glúteo»* filtran por ese músculo entero, no solo por los ejercicios que
  llevan la palabra en el nombre. Los términos concretos (*«peso muerto»*) siguen
  buscándose como texto.
- **Sesión completa de una zona** — elegida la zona, un botón monta el entrenamiento
  entero repartido entre todos sus músculos: pedir *pierna* da cuádriceps, isquiotibiales,
  glúteos y gemelos en la misma sesión, con el compuesto delante y los accesorios detrás,
  ajustado a los minutos que tengas. Se empieza al momento o se guarda como rutina.
- **Alternativas cuando la máquina está ocupada** — cada ejercicio propone recambios que
  entrenan lo mismo con otro material: la prensa se cambia por sentadilla con barra, con
  mancuernas, con bandas o con tu propio peso. No van por el nombre, sino por el **patrón
  de movimiento** y los músculos implicados, y se priorizan los que puedes hacer donde
  entrenas. En pleno entrenamiento el cambio es un botón: las series ya marcadas se
  quedan con el ejercicio original y el recambio continúa con las que faltan.
- **Mis rutinas, agrupadas por día** — cada bloque es un día de la semana, empezando por
  hoy. La tarjeta dice lo que importa en grande, *Jueves · Pierna*, con el nombre que le
  hayas puesto debajo y los músculos que toca; al tocarla se despliegan sus ejercicios sin
  salir de la lista, con la técnica de cada uno a un toque. Las plantillas de ejemplo
  indican dónde hace falta entrenar para poder hacerlas (deducido de su material, no
  escrito a mano).
- **Rutinas coherentes y completas** — una rutina no baja de 6 ejercicios: se cambian o se
  añaden, pero no se deja coja. Y no admite ejercicios de otra zona (pierna en una de
  brazo) salvo que la marques como **mixta** con el interruptor de su ficha, apagado por
  defecto. Cambiar un ejercicio por otro conserva sus series, repeticiones y descanso.
- **Dos caminos igual de visibles**: *Crear la mía*,
  donde le pones el nombre que te sirva a ti y eliges los ejercicios, o *Generar programa*,
  que te lo monta con tu perfil y luego lo editas igual (y puedes decidir cómo se llaman:
  *Lunes · Mi plan de otoño*). Se guardan solas mientras las editas, así que
  no se pierde ninguna por salir sin pulsar Guardar (una vacía del todo no se guarda, para
  no dejar restos). Parte también de 8
  plantillas probadas (Full Body, Push/Pull/Legs, Torso/Pierna, 5x5, en casa sin material).
  Series, repeticiones y descanso por ejercicio. Con el botón *Ordenar* las colocas a mano y
  ese orden viaja a tus demás dispositivos. Y **la del día va siempre la primera**: si hoy es
  jueves y tienes una rutina asignada al jueves, aparece arriba, marcada, sin que la busques.
- **Cronómetro siempre a la vista** — un botón en la portada arranca el entrenamiento y,
  a partir de ahí, un banner verde te acompaña por **cualquier pantalla** de la app con el
  tiempo corriendo y el botón de terminar. Puedes entrenar solo con el tiempo, ir añadiendo
  ejercicios sobre la marcha o cargar una rutina encima sin reiniciar el reloj. Al terminar
  se guarda aunque no hayas anotado ninguna serie: el tiempo entrenado cuenta.
- **Entrenar** — tres formas de registrar, a elegir en Ajustes: anotando **peso y
  repeticiones** de cada serie; **marcando cada serie** sobre el objetivo que te propone la
  app (3 × 12, por ejemplo), con el peso opcional; o **marcando el ejercicio y ya**, un solo
  botón sin peso, ni repeticiones, ni series. En los dos últimos el progreso se mide por
  series completadas en lugar de por volumen.
  Temporizador de descanso automático y aviso sonoro. Te muestra tu récord y lo que hiciste la vez
  anterior en ese mismo ejercicio. Si cierras el navegador a mitad, se recupera.
- **Progreso** — racha, volumen por semana en gráfico animado, calendario de
  entrenamientos, récords personales y el historial completo.
- **Sin conexión** — desde Ajustes puedes descargar las imágenes de tus rutinas, de los
  ejercicios principales o del catálogo completo. Una vez descargadas, la app funciona
  entera sin internet: en el gimnasio sin cobertura, en el metro o sin datos.
- **Modo claro, oscuro o el del sistema** — con un botón en la barra superior para
  alternar al vuelo.
- **Tu cuenta y la sincronización automática** *(opcional)* — entras con tu correo y
  contraseña (o con un enlace al email) y todo viaja entre tus dispositivos **sin pulsar
  nada**: lo que cambias sube solo unos segundos después, lo que cambia en otro dispositivo
  baja al abrir la app, al volver a ella, cada minuto y medio mientras la tienes delante y
  al recuperar la conexión. Si algo falla se reintenta solo con esperas crecientes, y al
  mandar la app a segundo plano lo pendiente sube antes de que el móvil la congele.

  La subida nunca es a ciegas: primero baja lo que haya, lo fusiona y solo entonces
  escribe, así que dos dispositivos cambiando cosas a la vez no se pisan. En *Mi cuenta*
  hay un indicador en vivo —al día, subiendo, pendiente o error, con el motivo en
  castellano— para no tener que fiarse de la fe.
- **Te saluda por tu nombre al volver** — la app pregunta cómo te llamas en el perfil, y
  cuando la abres después de unas horas te recibe con un mensaje corto que sale de tus
  datos reales, no de una frase hecha: *«6 días seguidos. Lo raro ya no es entrenar hoy:
  sería no hacerlo»*, *«Una semana parada no borra 14 entrenamientos. Baja algo el peso hoy
  y en dos sesiones estás donde estabas»*. Aparece una vez, se cierra de un toque, y el
  entrenador con IA también te habla por tu nombre.
- **Perfil y hábitos** — nombre, peso, altura, edad, actividad, sueño, tipo de dieta,
  alergias, lesiones y condiciones de salud. Con eso calcula tu metabolismo basal, tu gasto diario, las calorías objetivo,
  el reparto de macronutrientes y el agua del día. Registro de peso con evolución.
- **Objetivos** — metas de peso, entrenamientos por semana, racha, volumen o récord en un
  ejercicio. Se actualizan solas con lo que entrenas y te avisan al cumplirse.
- **Alertas con varias horas al día y calculadas con tus datos** — el agua no se bebe de
  una sentada: la app mira tu peso y tu actividad, saca los litros que te tocan, los divide
  en vasos de 250 ml y los reparte entre la hora a la que te levantas y dos horas antes de
  acostarte. Lo mismo con las comidas (según cuántas hagas, con las calorías y la proteína
  de cada una), el entrenamiento (en los días de tus rutinas y a la hora a la que **sueles
  entrenar de verdad**, deducida de tus sesiones), la comida de antes de entrenar, el pesaje
  del lunes en ayunas y el aviso para irte a dormir si duermes poco. Cada propuesta explica
  su porqué y se crea de un toque. También puedes montarlas a mano: añades y quitas horas
  una a una, o dices *«seis veces entre las 9:00 y las 19:00»* y las reparte. Todo se
  exporta al calendario del móvil, un evento por cada hora.
- **Alimentación e hidratación** — las calorías y los macros los calcula la app con tus
  datos (Mifflin-St Jeor, sin IA de por medio). Sobre esa base, la IA prepara un **menú
  semanal enfocado a tu caso**: tu objetivo, tu sexo y tu edad, tu tipo de dieta, tus
  alergias como línea roja (no aparecen ni en las alternativas ni en la lista de la compra)
  y tus **condiciones de salud** —tensión, colesterol, diabetes— adaptando sal, azúcares y
  grasas, siempre recordándote que lo confirmes con tu médico. Los días de entrenamiento
  llevan la comida de antes y la de después cuadradas con tu hora de entrenar.

  No es un régimen: cada comida trae **una o dos alternativas equivalentes** y el plan te
  dice hasta dónde puedes salirte sin romperlo. Incluye la **pauta de hidratación** —cuánta
  agua y en qué momentos, qué suma el café, qué cambia los días de gimnasio— con un botón
  para convertirla en recordatorios. El menú **se guarda en tu cuenta y se sincroniza**
  entre tus dispositivos junto con el resto de tus datos.
- **Entrenador con IA** *(opcional)* — analiza tu progreso, revisa tus rutinas y responde
  a lo que le preguntes, conociendo tu perfil y tu historial.
- **Música** *(opcional)* — reproduce Spotify **dentro de la propia app** (la pestaña se
  convierte en un dispositivo más de tu cuenta), con un reproductor de verdad: portada
  grande, barra de progreso y controles como los de cualquier app de música. Y mientras
  suene algo, una **barra de control en todas las pantallas**, igual que el cronómetro:
  canción, pausa y siguiente sin ir a buscarla. Lleva corazón para guardar la canción en tus
  favoritas de Spotify, aleatorio, volumen, y un buscador de **tus listas** que, si no
  encuentra nada entre las tuyas, busca en todo Spotify. Deja además que la IA te prepare
  listas de entrenamiento y las guarde en tu cuenta. Cada lista recuerda los artistas ya propuestos y no los repite, así que
  siempre descubres cosas nuevas. Se pueden guardar en tu Spotify con un toque.

---

## Activar la sincronización por correo

Es opcional y gratuita. Los datos se guardan en **tu propia** base de datos de Supabase.

1. Crea una cuenta en [supabase.com](https://supabase.com) y pulsa **New project**
   (cualquier nombre y contraseña; la región más cercana).
2. En **Project Settings → API**, copia la *Project URL* y la clave *anon public*.
3. En **SQL Editor**, pega esto y pulsa **Run**:

```sql
create table if not exists public.estado (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.estado enable row level security;

create policy "solo lo mio" on public.estado
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

4. En **Authentication → URL Configuration**, añade la dirección de tu app
   (`https://FabianRamirezMayorga.github.io/training-fr/`) en **Site URL** y en **Redirect URLs**.
5. En la app: **Ajustes → Mi cuenta → Activar la sincronización**, pega la URL y la clave,
   y entra con tu correo.

La clave *anon public* está pensada para ir en el código del navegador: no es un secreto.
Lo que protege tus datos es la política de seguridad (RLS) del paso 3, que impide a
cualquiera leer o escribir filas que no sean suyas.

---

## Servicios opcionales

Los tres son gratuitos y se configuran en un solo sitio: **Ajustes → Bóveda de claves**,
donde cada uno tiene su paso a paso desplegable, la dirección de retorno lista para copiar
y, en el caso de Gemini, un botón para comprobar que la clave responde.

**Las claves se guardan en el navegador, nunca en el repositorio.** Sin ellas la app
funciona entera: los cálculos, las rutinas, el progreso y las alertas no dependen de
ninguno de estos servicios.

### Entrenador con IA — Google Gemini

1. Entra en [aistudio.google.com/apikey](https://aistudio.google.com/apikey) con tu cuenta
   de Google y pulsa **Create API key**.
2. Copia la clave (empieza por `AIza`) y pégala en la bóveda.
3. Pulsa **Probar**: si responde, ya está.

La capa gratuita tiene un límite diario que sobra para uso personal; al superarlo la app
avisa y sigue funcionando.

Al preguntar se envían a Google tu perfil, tus rutinas y tu progreso. Si no quieres que
salgan de tu dispositivo, no configures esta parte.

### Varias claves, varios dispositivos

Con la sincronización activada, **la clave de Gemini y el Client ID de Spotify viajan con
tus datos**, así que solo hay que ponerlas una vez. Se controla desde el interruptor
*Sincronizar mis claves*, en la bóveda.

Las **sesiones abiertas nunca se sincronizan**: los tokens caducan en una hora y cada
dispositivo abre la suya. En uno nuevo solo hay que pulsar *Conectar* en Spotify.

La sincronización **fusiona**, no reemplaza: añadir un dispositivo nunca le cuesta datos
a ninguno. Las rutinas y los entrenamientos se unen por identificador; si el mismo
elemento cambió en dos sitios, gana la última edición; y los ajustes se combinan campo a
campo. Algo desaparece solo si se borró a propósito, y de ese borrado queda constancia
para que no reaparezca desde otro dispositivo.

Cada correo tiene lo suyo. Si en un dispositivo entra otra cuenta, lo del anterior se
borra antes de bajar lo nuevo: rutinas, historial, preferencias y claves. La conexión con
Supabase se conserva, porque es del dispositivo y hace falta para que el siguiente entre.
Al cerrar sesión se puede elegir si dejar la copia local o borrarla.

La configuración de Supabase no puede venir de la nube, porque es la que abre la puerta.
Para eso está **Enlazar un dispositivo nuevo**: genera un enlace que, abierto en el otro
aparato, lo deja listo para entrar con el correo. Ese enlace lleva la URL del proyecto y la
clave anon, ambas públicas por diseño: sin iniciar sesión no dan acceso a ningún dato.

### Música — Spotify

Con **Spotify Premium** la música suena dentro de la propia app: el Web Playback SDK
convierte la pestaña en un dispositivo de tu cuenta, con play, pausa y cambio de tema desde
la pantalla de entrenamiento. Sin Premium, Spotify solo deja ver qué suena y usar el
reproductor incrustado; es una limitación de su plataforma, no de la app.

La IA genera listas a medida del entrenamiento del día: eliges el ambiente (fuerza, ritmo,
cardio, clásicos, concentración o latino), propone las canciones, la app las busca una a una
en Spotify y descarta las que no existen. Recuerda los artistas ya usados para no repetirlos.

1. En [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) pulsa
   **Create app**. Nombre y descripción, los que quieras.
2. En **Redirect URIs** pega la dirección de retorno que muestra la bóveda —tiene que
   coincidir carácter por carácter—, marca **Web API** y guarda.
3. En **Settings** de esa app copia el **Client ID** y pégalo en la bóveda. El
   *Client Secret* no hace falta: la app usa PKCE, que no necesita secretos.
4. Pulsa **Conectar** para autorizar tu cuenta.

Al publicar en internet, vuelve al panel y añade también la dirección definitiva en
**Redirect URIs**: la de desarrollo y la de producción son distintas.

### Alertas con la app cerrada

Una web no puede despertar el móvil por su cuenta sin un servidor de notificaciones, que
sí costaría dinero. La app cubre lo que sí es posible gratis: avisos del sistema mientras
está abierta, recordatorios pendientes al abrirla y **exportación al calendario del
móvil**, que es lo único que avisa de verdad con la app cerrada.

---

## Aviso

Las calorías, los macronutrientes y los planes de comidas son estimaciones para población
general (fórmula de Mifflin-St Jeor). No son consejo médico ni sustituyen a un dietista o
a un médico, especialmente si tienes alguna condición de salud, estás embarazada o
tomas medicación.

---

## Desarrollo

No hay que instalar nada. Para verla en local basta con servir la carpeta:

```bash
npx http-server . -p 5178 -c-1
```

Estructura:

```
index.html              maquetación y orden de carga
css/styles.css          estilos (tema oscuro y claro, tipografía del sistema Apple)
js/i18n.js              traducción del catálogo al español y zonas del cuerpo
js/tecnica.js           guías de técnica por patrón de movimiento
js/store.js             persistencia en localStorage
js/ui.js                utilidades, animación de los ejercicios
js/data.js              descarga y búsqueda del catálogo
js/templates.js         rutinas de ejemplo
js/planner.js           generador del plan semanal y de la sesión de una zona
js/programa.js          programa personal: volumen, patrones, lesiones y progresión
js/alternativas.js      recambios por patrón de movimiento (máquina ocupada)
js/offline.js           descarga de imágenes para uso sin conexión
js/sync.js              cuenta por correo y sincronización (API REST de Supabase)
js/perfil.js            datos corporales y cálculos (IMC, metabolismo, calorías, macros)
js/objetivos.js         metas con seguimiento automático
js/alertas.js           recordatorios, avisos del sistema y exportación al calendario
js/saludo.js            la bienvenida al volver, a partir de tu historial
js/ia.js                entrenador con IA sobre Gemini (se adapta a lo que admite cada modelo)
js/spotify.js           control de música con autorización PKCE
js/vistas.js            perfil, objetivos y alertas
js/vistas2.js           alimentación, entrenador y música
js/vistas4.js           el programa personal
js/vistas5.js           modo invitado y guía para crear la base de datos
js/workout.js           modo entrenamiento
js/app.js               router y vistas
sw.js                   service worker (uso sin conexión, una versión coherente por despliegue)
```

Al cambiar la lista de archivos hay que subir `VERSION` en `sw.js` para que los
navegadores que ya tienen la app instalada se actualicen.

## Marca

El logotipo es el monograma **FR** de la marca: F en cian `#26C6DA` y R en verde
`#8BC34A`. Esos dos colores gobiernan toda la interfaz.

- `icons/logo.svg` — recortado al trazo, para la barra superior y la bienvenida.
- `icons/icon.svg` — centrado en lienzo cuadrado, para el favicon.
- `icons/icon-192.png`, `icons/icon-512.png` — iconos del instalador, con fondo transparente.

Todos comparten el mismo trazado y ninguno lleva fondo. Si cambia el logo, edita los dos
SVG y regenera los PNG:

```bash
node tools-generar-iconos.js icons
```

## Créditos

Ejercicios, imágenes e instrucciones: [free-exercise-db](https://github.com/yuhonas/free-exercise-db),
de dominio público (licencia Unlicense).
