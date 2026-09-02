# GymFlow

App web para entrenar en el gimnasio: catálogo de **876 ejercicios con animación de la
técnica correcta**, creador de rutinas, modo entrenamiento con temporizador de descanso
y seguimiento del progreso.

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
| Traducción de instrucciones | API pública de MyMemory, bajo demanda | 0 € |

No hay cuentas ni contraseñas: los datos se quedan en tu dispositivo. Para llevarlos a
otro móvil u ordenador se usa **Ajustes → Exportar / Importar**.

---

## Publicarla en internet (GitHub Pages)

Necesitas una cuenta gratuita en [github.com](https://github.com).

1. Crea un repositorio **público** llamado `gymflow` (sin README, sin .gitignore).

2. Desde esta carpeta, en la terminal:

```bash
git remote add origin https://github.com/TU-USUARIO/gymflow.git
```

```bash
git push -u origin main
```

3. En GitHub: pestaña **Settings → Pages**. En *Source* elige **Deploy from a branch**,
   rama `main`, carpeta `/ (root)`, y pulsa *Save*.

4. Al cabo de un minuto la app estará en:

   `https://TU-USUARIO.github.io/gymflow/`

Esa URL es pública, con HTTPS, y no caduca. Cada `git push` la actualiza.

### Alternativa en 30 segundos: Netlify Drop

Entra en [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra la carpeta
`gymflow` entera. Te da una URL al momento. El plan gratuito es suficiente de sobra
para uso personal.

---

## Instalarla en el móvil

Abre la URL en el navegador del teléfono y usa **«Añadir a la pantalla de inicio»**:

- **Android (Chrome)**: menú ⋮ → *Añadir a pantalla de inicio*
- **iPhone (Safari)**: botón Compartir → *Añadir a pantalla de inicio*

Queda como una app más: icono propio, pantalla completa y funciona sin datos una vez
que has abierto los ejercicios al menos una vez.

---

## Qué hace

- **Eliges dónde entrenas al abrirla** — gimnasio, casa con mancuernas, casa con bandas
  o sin material. A partir de ahí el catálogo, el buscador y las rutinas generadas
  solo ofrecen ejercicios que puedas hacer de verdad ahí. Se cambia en un toque.
- **Plan semanal automático** — dices qué días entrenas y cuánto dura cada sesión, y la
  app reparte los grupos musculares por día (*Lun · Pecho y tríceps*, *Mar · Espalda y
  bíceps*…) y elige los ejercicios ajustando series, repeticiones y descansos a tu
  objetivo. Sin repetir ejercicio en la misma semana. Verás la propuesta antes de guardarla.
- **Ejercicios segmentados por músculo** — al entrar en *Pierna* aparecen secciones
  separadas de cuádriceps, isquiotibiales, glúteos, gemelos, aductores y abductores,
  cada una con su carrusel. Buscador en español (*«peso muerto»*, *«femoral»*, *«glúteo»*).
  Cada ficha muestra la técnica **animada**, los músculos implicados, las instrucciones
  paso a paso (traducibles con un toque) y un enlace a vídeos de YouTube.
- **Rutinas** — crea las tuyas, genera el plan o parte de 8 plantillas probadas (Full Body,
  Push/Pull/Legs, Torso/Pierna, 5x5, en casa sin material). Series, repeticiones y descanso
  por ejercicio. Asigna días y la portada te recuerda qué toca hoy.
- **Entrenar** — marca cada serie con su peso y repeticiones, con el temporizador de
  descanso automático y aviso sonoro. Te muestra tu récord y lo que hiciste la vez
  anterior en ese mismo ejercicio. Si cierras el navegador a mitad, se recupera.
- **Progreso** — racha, volumen por semana en gráfico animado, calendario de
  entrenamientos, récords personales y el historial completo.
- **Sin conexión** — desde Ajustes puedes descargar las imágenes de tus rutinas, de los
  ejercicios principales o del catálogo completo. Una vez descargadas, la app funciona
  entera sin internet: en el gimnasio sin cobertura, en el metro o sin datos.

---

## Desarrollo

No hay que instalar nada. Para verla en local basta con servir la carpeta:

```bash
npx http-server . -p 5178 -c-1
```

Estructura:

```
index.html              maquetación y orden de carga
css/styles.css          estilos (tema oscuro y claro)
js/i18n.js              traducción del catálogo al español
js/store.js             persistencia en localStorage
js/ui.js                utilidades, animación de los ejercicios
js/data.js              descarga y búsqueda del catálogo
js/templates.js         rutinas de ejemplo
js/planner.js           generador del plan semanal (splits y selección de ejercicios)
js/offline.js           descarga de imágenes para uso sin conexión
js/workout.js           modo entrenamiento
js/app.js               router y vistas
sw.js                   service worker (uso sin conexión)
```

Al cambiar la lista de archivos hay que subir `VERSION` en `sw.js` para que los
navegadores que ya tienen la app instalada se actualicen.

```
```

## Créditos

Ejercicios, imágenes e instrucciones: [free-exercise-db](https://github.com/yuhonas/free-exercise-db),
de dominio público (licencia Unlicense).
