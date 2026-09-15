# Training FR

PWA de gimnasio en JavaScript sin compilación: módulos IIFE sobre `window`, sin
npm y sin paso de build. Se sirve tal cual desde GitHub Pages.

## Reglas que no se saltan

**Coste cero.** Nada que haya que pagar: ni dependencias de pago, ni servicios
con factura. La IA es opcional y va con la clave del propio usuario.

**Cada despliegue sube `VERSION` en `sw.js`.** Si no sube, el móvil se queda con
los archivos viejos y la mitad de una versión llamando a la otra mitad de otra.

**Un archivo JS nuevo se registra en tres sitios**: `index.html` (el orden
importa: un módulo va antes que quien lo usa), la lista `FILES` de `sw.js` (si
no, no existe sin conexión) y, si es una vista, en `g.VISTAS`.

**Lo que es una regla no pasa por la IA.** El peso de hoy, la nota del plan, el
reparto por zona, los mínimos de volumen: reglas deterministas, que dan siempre
el mismo número y funcionan sin cobertura. La IA es para lo que es opinión.

## La ayuda se actualiza con la app

`js/ayuda.js` es el manual que el usuario lee dentro de la app. **Toda función
nueva o cambiada pasa por ahí antes de darse por terminada.** Un manual que
miente en un sitio hace dudar de todos los demás, y es la clase de deuda que no
avisa: nadie abre la ayuda hasta que está perdido.

Al terminar una función, preguntarse las tres y actuar:

1. **¿Es un concepto nuevo —algo que la app ahora decide o calcula por su
   cuenta?** Entonces va una entrada en `TEMAS`, con el porqué, no solo el qué.
2. **¿Hay algo que el usuario tenga que hacer?** Entonces va en `PASOS`, paso a
   paso, con `ir` en el paso que lleva a un botón concreto. Si el camino se
   bifurca de verdad, se parte en `ramas` en vez de contar los dos a la vez.
3. **¿Va a generar una duda —«por qué me sale esto», «por qué no aparece
   aquello»?** Entonces va en `PREGUNTAS`, escrita como la preguntaría alguien
   que no construyó la app.

Y si la función cambia algo que la ayuda ya cuenta, se corrige la entrada
existente en lugar de añadir una nueva.

Dos cosas que ayudan a que no se pudra:

- **Los números se preguntan, no se copian.** Los saltos de peso salen de
  `Progresion.SALTOS_KG`, el mínimo de ejercicios de `Store.MINIMO_EJERCICIOS`.
  Si un dato vive en otro módulo, se lee de ahí: así no puede mentir solo.
- **Se cuenta por conceptos, no por pantallas.** «Cómo decide la app tu peso de
  hoy» envejece despacio; «pulsa el tercer icono de arriba» envejece en el
  siguiente rediseño.

Los enlaces usan `App.irYHacer(ruta, arg, selector)`: navega y pulsa lo que haya
que pulsar al llegar. Si el selector deja de existir, se queda en la pantalla en
vez de fallar.

## Estilo

Español de España, en el tono del resto del código: directo, sin jerga y
explicando el porqué. Los comentarios cuentan **por qué** está así, y sobre todo
qué se intentó antes y por qué no valía.

Diseño de referencia: macOS/iOS. Listas agrupadas, vidrio calibrado al tamaño de
la pieza, y el color reservado para lo que distingue algo de verdad (un estado,
una gravedad, una zona). Color decorativo, no.
