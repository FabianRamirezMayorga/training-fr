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
      a.carbo += Number(x.carbo) || 0;
      a.grasa += Number(x.grasa) || 0;
      /* Cuántos de los apuntes saben de hidratos y grasa: con esto la pantalla
         puede decir «esto es de lo que hay dato» en vez de dar un reparto por
         completo cuando la mitad son ceros. */
      if (x.carbo != null && x.grasa != null && (x.carbo || x.grasa)) a.conMacros++;
      return a;
    }, { kcal: 0, prot: 0, carbo: 0, grasa: 0, conMacros: 0 });
  }

  function hoy() {
    const l = del();
    const s = suma(l);
    return {
      lista: l, kcal: Math.round(s.kcal), prot: Math.round(s.prot),
      carbo: Math.round(s.carbo), grasa: Math.round(s.grasa),
      conMacros: s.conMacros, cuantas: l.length
    };
  }

  function anotar(c) {
    const l = todas();
    const x = {
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      t: c.t || Date.now(),
      plato: String(c.plato || 'Comida').slice(0, 80),
      kcal: Math.max(0, Math.round(Number(c.kcal) || 0)),
      prot: Math.max(0, Math.round(Number(c.prot) || 0)),
      /* Hidratos y grasa: sin ellos el recuento del día solo sabía decir
         calorías y proteína, y el reparto del día —que es lo que dice si estás
         comiendo bien o solo comiendo poco— no se podía dibujar. Lo apuntado
         antes de esto no los lleva, y se nota en el dibujo en vez de rellenarlo
         con ceros como si fueran un dato. */
      carbo: Math.max(0, Math.round(Number(c.carbo) || 0)),
      grasa: Math.max(0, Math.round(Number(c.grasa) || 0)),
      detalle: String(c.detalle || '').slice(0, 300),
      confianza: c.confianza || '',
      fuente: c.fuente || 'mano',
      /* A qué plato del menú corresponde, si es que corresponde a alguno. Con
         esto la pantalla del menú puede pintar marcado lo que ya te comiste y
         no apuntarlo dos veces. */
      ref: String(c.ref || ''),
      /* Y qué plato del menú vino a sustituir, cuando comiste otra cosa: sin
         esto, el registro dice lo que comiste pero no de qué te desviaste. */
      sustituye: String(c.sustituye || '').slice(0, 80),
      /* Lo que te dijo el entrenador sobre ese cambio, guardado con el
         registro. Sin esto, mañana el diario dice que cambiaste el salmón por
         una empanada pero no lo que se te contestó entonces, que es la mitad
         del valor de haberlo apuntado. */
      consejo: String(c.consejo || '').slice(0, 400),
      veredicto: String(c.veredicto || '')
    };
    l.push(x);
    escribir(l);
    return x;
  }

  function borrar(id) {
    escribir(todas().filter(function (x) { return x.id !== id; }));
  }

  /* Cambiar algo de lo ya apuntado sin volver a apuntarlo. Hace falta para
     cruzar a posteriori una foto que se subió suelta: lo comido es lo mismo
     —los números no cambian—, lo que cambia es a qué comida del menú
     corresponde, y borrarlo y volver a crearlo le cambiaría la hora. */
  function actualizar(id, cambios) {
    const l = todas();
    const x = l.filter(function (y) { return y.id === id; })[0];
    if (!x) return null;
    Object.keys(cambios || {}).forEach(function (k) {
      if (k === 'id' || k === 't') return;
      x[k] = cambios[k];
    });
    escribir(l);
    return x;
  }

  /* ¿Está ya apuntado hoy este plato del menú? */
  function marcada(ref) {
    if (!ref) return null;
    return del().filter(function (x) { return x.ref === ref; })[0] || null;
  }

  /* ---------- si esto se lleva o no ----------
     Ir marcando cada comida del menú no le apetece a todo el mundo. Se pregunta
     una vez en los ajustes y se respeta; por defecto sí, que quien no lo quiera
     lo apaga y quien no sepa que existe lo descubre. */
  function seLleva() { return Store.settings().registroComida !== 'no'; }

  /* Lo comido agrupado por días, solo los días en los que hay algo.
     Registrando cinco o seis cosas al día, una lista plana de tres semanas son
     más de cien filas y no hay quien encuentre nada: se agrupa y cada día se
     abre si se quiere. Los días vacíos no salen —no aportan— y por eso esto no
     sirve para «ultimos()», que sí necesita los huecos para pintar la racha. */
  function porDias(limite) {
    const grupos = {};
    const orden = [];
    todas().forEach(function (x) {
      const d = claveDia(x.t);
      if (!grupos[d]) { grupos[d] = []; orden.push(d); }
      grupos[d].push(x);
    });

    return orden.slice(0, limite || 60).map(function (d) {
      const lista = grupos[d];
      const s = suma(lista);
      return {
        dia: d,
        /* la hora del registro más tardío: vale para saber qué día es y para
           ordenar, sin volver a parsear la clave */
        t: lista[0].t,
        lista: lista,
        kcal: Math.round(s.kcal),
        prot: Math.round(s.prot)
      };
    });
  }

  /* Los últimos días con su total, para ver si es un mal día o una costumbre */
  function ultimos(dias) {
    const n = dias || 7;
    const fuera = [];
    for (let i = 0; i < n; i++) {
      const t = Date.now() - i * 86400000;
      const d = claveDia(t);
      const s = suma(del(d));
      fuera.push({ dia: d, t: t, kcal: Math.round(s.kcal), prot: Math.round(s.prot),
        carbo: Math.round(s.carbo), grasa: Math.round(s.grasa) });
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
      if (!file) { mal(new Error(T('No has elegido ninguna foto.'))); return; }
      if (!/^image\//.test(file.type || '')) {
        mal(new Error(T('Eso no es una imagen.'))); return;
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
          mal(new Error(T('No he podido leer esa foto.')));
        }
      };

      img.onerror = function () {
        URL.revokeObjectURL(url);
        mal(new Error(T('No he podido abrir esa foto.')));
      };
      img.src = url;
    });
  }

  g.Comidas = {
    hoy: hoy, todas: todas, del: del, anotar: anotar, borrar: borrar,
    ultimos: ultimos, porDias: porDias, vaciar: vaciar, claveDia: claveDia,
    marcada: marcada, seLleva: seLleva, actualizar: actualizar,
    prepararFoto: prepararFoto
  };
})(window);
