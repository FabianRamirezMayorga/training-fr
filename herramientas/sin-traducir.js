/* Busca texto en español que se pinta sin pasar por T().

   El barrido por rutas encuentra lo que se ve al entrar en una pantalla, pero
   no lo que vive dentro de una hoja, un modal o un aviso que solo aparece al
   pulsar algo. Esto lee el código y señala las frases sospechosas para poder
   ir a mirarlas.

   No es exacto y no pretende serlo: hay falsos positivos —un comentario, una
   clave de datos— y lo que hace falta es una LISTA por la que pasar, no un
   veredicto. Por eso no sale con error: se lee y se decide.

   Se ejecuta a mano:  node herramientas/sin-traducir.js [archivo]  */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'js');
const soloUno = process.argv[2];

/* Una frase de interfaz tiene tilde o eñe, o alguna de estas palabras. Con
   menos que esto entran los identificadores en inglés del catálogo. */
const ESPANOL = /[áéíóúñ¿¡]|\b(el|la|los|las|de|del|que|con|para|por|tu|tus|sin|un|una|y|o|es|no|se|al)\b/i;

/* Lo que NO es texto de interfaz aunque lo parezca. */
function esRuido(s) {
  if (s.length < 4) return true;
  if (/^[a-z0-9_\-.:/#\[\]{}%$]+$/.test(s)) return true;   // selectores, rutas, claves
  if (/^[A-Z_]+$/.test(s)) return true;                    // constantes
  if (/^https?:/.test(s)) return true;
  if (!ESPANOL.test(s)) return true;
  return false;
}

const archivos = soloUno ? [soloUno]
  : fs.readdirSync(dir).filter(function (f) {
    return f.endsWith('.js') && !/^textos-en/.test(f) && f !== 'idioma.js';
  });

let total = 0;
archivos.forEach(function (f) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  const lineas = src.split('\n');
  const sueltas = [];

  /* Una llamada a T() se parte a menudo en dos líneas: el paréntesis en una y
     la frase en la siguiente, o la frase troceada con +. Si no se mira la línea
     anterior, la mitad de lo que sale ya estaba traducido y la lista no sirve
     para nada. */
  lineas.forEach(function (l, i) {
    if (/^\s*(\/\/|\/\*|\*)/.test(l)) return;
    const previa = i > 0 ? lineas[i - 1] : '';
    const abierta = /\bT[np]?\(\s*$/.test(previa) ||
      (/\bT[np]?\(/.test(previa) && /['+,(]\s*$/.test(previa));
    let limpia = l.replace(/\bT[np]?\(\s*'((?:[^'\\]|\\.)*)'/g, "T('')");
    if (abierta) limpia = limpia.replace(/'((?:[^'\\]|\\.)*)'/g, "''");

    const re = /'((?:[^'\\]|\\.)*)'/g;
    let m;
    while ((m = re.exec(limpia))) {
      const s = m[1].replace(/\\'/g, "'");
      if (!esRuido(s)) sueltas.push((i + 1) + ': ' + s.slice(0, 90));
    }
  });

  if (sueltas.length) {
    total += sueltas.length;
    console.log('\n--- ' + f + '  (' + sueltas.length + ') ---');
    sueltas.forEach(function (s) { console.log('  ' + s); });
  }
});

console.log('\nsospechosas: ' + total);
