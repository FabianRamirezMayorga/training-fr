/* comidas.js — lo que has comido hoy, en calorías y proteína.

   Guarda solo números y un nombre: nunca la foto. La imagen se encoge en el
   propio móvil, se manda a la IA en la misma petición que la pregunta y se
   suelta al terminar; no se escribe en disco en ningún momento, ni siquiera
   mientras se mira.

   Vive en su propia clave de almacenamiento y no viaja con la sincronización:
   el registro de comida es de este teléfono. Se prefiere eso a meterlo en el
   estado que se fusiona entre dispositivos y arriesgar los entrenamientos por
   una lista de platos. */
(function (g) {
  'use strict';

  const CLAVE = 'trainingfr.comidas';
  const DIAS_QUE_SE_GUARDAN = 120;

  function leer() {
    try {
      const raw = localStorage.getItem(CLAVE);
      const l = raw ? JSON.parse(raw) : [];
      return Array.isArray(l) ? l : [];
    } catch (e) { return []; }
  }

  function escribir(l) {
    try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch (e) { /* sin sitio */ }
  }

  /* El día natural, no las 24 horas anteriores: quien cena a las once quiere
     verlo en la cena de hoy, no repartido entre dos días. */
  function claveDia(t) {
    const d = new Date(t || Date.now());
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function todas() {
    /* de paso se tira lo viejo, que si no la lista crece sin fin */
    const corte = Date.now() - DIAS_QUE_SE_GUARDAN * 86400000;
    const l = leer().filter(function (x) { return x && x.t >= corte; });
    return l.sort(function (a, b) { return b.t - a.t; });
  }

  function del(dia) {
    const d = dia || claveDia();
    return todas().filter(function (x) { return claveDia(x.t) === d; });
  }

  function suma(lista) {
    return (lista || []).reduce(function (a, x) {
      a.kcal += Number(x.kcal) || 0;
      a.prot += Number(x.prot) || 0;
      return a;
    }, { kcal: 0, prot: 0 });
  }

  function hoy() {
    const l = del();
    const s = suma(l);
    return { lista: l, kcal: Math.round(s.kcal), prot: Math.round(s.prot) };
  }

  function anotar(c) {
    const l = todas();
    const x = {
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      t: c.t || Date.now(),
      plato: String(c.plato || 'Comida').slice(0, 80),
      kcal: Math.max(0, Math.round(Number(c.kcal) || 0)),
      prot: Math.max(0, Math.round(Number(c.prot) || 0)),
      detalle: String(c.detalle || '').slice(0, 300),
      confianza: c.confianza || '',
      fuente: c.fuente || 'mano'
    };
    l.push(x);
    escribir(l);
    return x;
  }

  function borrar(id) {
    escribir(todas().filter(function (x) { return x.id !== id; }));
  }

  /* Los últimos días con su total, para ver si es un mal día o una costumbre */
  function ultimos(dias) {
    const n = dias || 7;
    const fuera = [];
    for (let i = 0; i < n; i++) {
      const t = Date.now() - i * 86400000;
      const d = claveDia(t);
      const s = suma(del(d));
      fuera.push({ dia: d, t: t, kcal: Math.round(s.kcal), prot: Math.round(s.prot) });
    }
    return fuera;
  }

  function vaciar() { localStorage.removeItem(CLAVE); }

  /* ---------- la foto ----------
     Se encoge antes de salir del móvil: una foto de iPhone son cuatro megas y
     para reconocer un plato sobra con el lado largo a 900 px. Así la subida es
     corta con datos móviles y la llamada cuesta menos. */
  function prepararFoto(file, ladoMax) {
    const lado = ladoMax || 900;
    return new Promise(function (ok, mal) {
      if (!file) { mal(new Error('No has elegido ninguna foto.')); return; }
      if (!/^image\//.test(file.type || '')) {
        mal(new Error('Eso no es una imagen.')); return;
      }

      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = function () {
        try {
          const escala = Math.min(1, lado / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * escala));
          const h = Math.max(1, Math.round(img.height * escala));

          const lienzo = document.createElement('canvas');
          lienzo.width = w; lienzo.height = h;
          lienzo.getContext('2d').drawImage(img, 0, 0, w, h);

          const dataUrl = lienzo.toDataURL('image/jpeg', 0.72);
          URL.revokeObjectURL(url);
          ok({
            mime: 'image/jpeg',
            datos: dataUrl.slice(dataUrl.indexOf(',') + 1),
            /* para enseñarla mientras se piensa, y soltarla después */
            vista: dataUrl,
            ancho: w, alto: h
          });
        } catch (e) {
          URL.revokeObjectURL(url);
          mal(new Error('No he podido leer esa foto.'));
        }
      };

      img.onerror = function () {
        URL.revokeObjectURL(url);
        mal(new Error('No he podido abrir esa foto.'));
      };
      img.src = url;
    });
  }

  g.Comidas = {
    hoy: hoy, todas: todas, del: del, anotar: anotar, borrar: borrar,
    ultimos: ultimos, vaciar: vaciar, claveDia: claveDia,
    prepararFoto: prepararFoto
  };
})(window);
