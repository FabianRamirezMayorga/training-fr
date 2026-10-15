/* css-sano.js — que el CSS no tenga un comentario a medias.

   Esto existe por un fallo que costó una tarde encontrar: un parche dejó un
   comentario sin su `/*` de apertura, y el navegador, al toparse con texto
   suelto, se tragó como parte de un selector inválido todo lo que había hasta
   la siguiente llave. Resultado: una regla entera desaparecida, sin error en
   consola, sin nada en la pestaña de red, y el archivo del servidor correcto.

   No valida CSS: busca justo eso, que es lo que un parche puede romper sin que
   se note. Se corre con `node herramientas/css-sano.js`.

   Uso: node herramientas/css-sano.js [archivo.css ...]   (por defecto, css/) */
'use strict';

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const archivos = args.length ? args : fs.readdirSync('css')
  .filter(function (f) { return f.endsWith('.css'); })
  .map(function (f) { return path.join('css', f); });

let malos = 0;

/* Dónde cae un índice del archivo, para poder ir a arreglarlo. */
function linea(txt, i) { return txt.slice(0, i).split('\n').length; }

archivos.forEach(function (ruta) {
  const txt = fs.readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n');
  /* Se recorre a mano en vez de con una expresión regular: hace falta saber
     DÓNDE está lo que no cierra, y un `replace` global solo dice que algo
     sobra. */
  let i = 0, abierto = -1;
  const sueltos = [];
  while (i < txt.length) {
    if (abierto < 0) {
      const a = txt.indexOf('/*', i);
      const b = txt.indexOf('*/', i);
      if (b !== -1 && (a === -1 || b < a)) { sueltos.push(['cierre', b]); i = b + 2; continue; }
      if (a === -1) break;
      abierto = a;
      i = a + 2;
    } else {
      const b = txt.indexOf('*/', i);
      if (b === -1) { sueltos.push(['apertura', abierto]); abierto = -1; break; }
      abierto = -1;
      i = b + 2;
    }
  }

  if (!sueltos.length) {
    console.log(ruta + ': comentarios equilibrados');
    return;
  }
  malos++;
  sueltos.forEach(function (s) {
    const n = linea(txt, s[1]);
    const trozo = txt.slice(Math.max(0, s[1] - 70), s[1] + 2).split('\n').pop();
    console.log(ruta + ':' + n + '  ' +
      (s[0] === 'cierre' ? '*/ sin su /*' : '/* sin cerrar') + '   …' + trozo.trim());
  });
});

if (malos) {
  console.log('\nUn comentario roto se come la regla que viene detrás, y no avisa.');
  process.exit(1);
}
