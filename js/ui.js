/* ui.js — utilidades de interfaz compartidas: plantillas HTML, toasts, modales,
   iconos y formateo. Sin dependencias externas. */
(function (g) {
  'use strict';

  /* Escapa texto para insertarlo en HTML */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Etiqueta de plantilla: html`<p>${valor}</p>` escapa cada interpolación.
     Para insertar HTML ya construido, envuélvelo con raw(). */
  function html(strings) {
    let out = strings[0];
    for (let i = 1; i < arguments.length; i++) {
      const v = arguments[i];
      out += (v && v.__raw ? v.value : Array.isArray(v) ? v.join('') : esc(v)) + strings[i];
    }
    return out;
  }
  function raw(value) { return { __raw: true, value: value == null ? '' : value }; }

  const ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M7 4h4v16H7zM13 4h4v16h-4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    menos: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
    aviso: '<svg viewBox="0 0 24 24"><path d="M12 3.6L1.8 20.4h20.4z"/>'
      + '<path d="M12 9.6v4.6M12 17.4v.1"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM14 5l4 4"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><path d="M8 8h11v11H8zM5 16V5h11"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M12 5v13M6 13l6 6 6-6"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 19V6M6 11l6-6 6 6"/></svg>',
    timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path d="M6 21V4h12l-2.5 4L18 12H6"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24"><path d="M4 8v8M8 6v12M16 6v12M20 8v8M8 12h8"/></svg>',
    youtube: '<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10.5 9.5l5 2.5-5 2.5z"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 15V3M8 7l4-4 4 4M4 14v5a2 2 0 002 2h12a2 2 0 002-2v-5"/></svg>',
    sol: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>',
    luna: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/></svg>',
    correo: '<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M3 7l9 6 9-6"/></svg>',
    nube: '<svg viewBox="0 0 24 24"><path d="M7 18a4 4 0 01-.5-7.97A5.5 5.5 0 0117.9 9.2 3.9 3.9 0 0117 18z"/></svg>',
    salir: '<svg viewBox="0 0 24 24"><path d="M15 17l5-5-5-5M20 12H9M12 3H5v18h7"/></svg>',
    perfil: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1"/></svg>',
    campana: '<svg viewBox="0 0 24 24"><path d="M18 15V10a6 6 0 10-12 0v5l-2 3h16zM10 21h4"/></svg>',
    /* Era una manzana, y una manzana es «fruta», no «alimentación»: en la fila
       de Perfil, al lado del cuerpo y de la campana, se leía como una sección
       de dieta de fruta. Un tenedor y un cuchillo es lo que todo el mundo
       reconoce como comer, y a 18 píxeles se distingue de todo lo demás. */
    nutricion: '<svg viewBox="0 0 24 24">'
      + '<path d="M4.2 3v4.4a2.8 2.8 0 005.6 0V3M7 3v4.4M7 10.2V21"/>'
      + '<path d="M17 21v-7.2c-1.9-.4-2.8-1.9-2.8-4.4 0-2.7 1.3-4.8 3.8-6.3.5-.3 1.2.05 1.2.65V21"/>'
      + '</svg>',

    /* Ajustes llevaba el cronómetro del descanso. El mismo dibujo para «cuánto
       descanso entre series» y para «cómo se comporta la app» hacía que uno de
       los dos estuviera siempre mintiendo. Deslizadores: lo que se viene a
       hacer aquí es mover cosas de sitio. */
    ajustes: '<svg viewBox="0 0 24 24">'
      + '<path d="M4 7.5h8.5M17.5 7.5H20M4 16.5h3.5M12.5 16.5H20"/>'
      + '<circle cx="15" cy="7.5" r="2.4"/><circle cx="10" cy="16.5" r="2.4"/></svg>',

    /* Buscar actualizaciones: la flecha de bajar dentro del círculo de volver a
       mirar. La flecha sola ya la usa descargar, y son cosas distintas. */
    actualizar: '<svg viewBox="0 0 24 24">'
      + '<path d="M21 12a9 9 0 11-3.4-7"/><path d="M21.2 3.8v4.6h-4.6"/>'
      + '<path d="M12 8.4v6.2M9.3 11.9L12 14.6l2.7-2.7"/></svg>',
    trofeo: '<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 01-8 0zM8 5H5v2a3 3 0 003 3M16 5h3v2a3 3 0 01-3 3M9 21h6M12 13v8"/></svg>',
    grafica: '<svg viewBox="0 0 24 24"><path d="M4 19h16M7 16V9M12 16V5M17 16v-5"/></svg>',
    gota: '<svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 10.5a6 6 0 01-12 0C6 9.5 12 3 12 3z"/></svg>',
    /* La llama de las calorias: cuerpo exterior y una lengua interior, que es
       la que parpadea. Trazo, sin relleno, como todos los demas. */
    llama: '<svg viewBox="0 0 24 24">' +
      '<path class="llama-fuera" d="M12 3c.4 3 2 4 3.4 5.4A6.5 6.5 0 0118.5 14a6.5 6.5 0 11-13 0c0-2.4 1.2-4.2 2.6-5.6C9.7 6.7 10.6 5 12 3z"/>' +
      '<path class="llama-dentro" d="M12 20a3.2 3.2 0 01-3.2-3.2c0-1.9 1.6-2.6 2.3-4.3.9 1.3 1.5 1.7 2.4 2.6a3.2 3.2 0 011.7 2.8A3.2 3.2 0 0112 20z"/>' +
      '</svg>',
    /* La proteina: un pescado. Probe tambien el muslo de pollo, el huevo y el
       filete; a este tamano el muslo se lee como una llave y el filete como una
       pastilla. El pez se reconoce sin leer la etiqueta. */
    proteina: '<svg viewBox="0 0 24 24">' +
      '<path d="M21 12c-2.2 3.2-5 4.8-8.3 4.8S6.6 15.2 4.4 12c2.2-3.2 5-4.8 8.3-4.8S18.8 8.8 21 12z"/>' +
      '<path d="M4.4 12L1.6 8.6v6.8L4.4 12z"/>' +
      '<circle cx="16.6" cy="10.8" r=".9"/>' +
      '</svg>',
    musica: '<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
    compartir: '<svg viewBox="0 0 24 24"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M12 3v13"/><path d="m8 7 4-4 4 4"/></svg>',
    copiar: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    chispa: '<svg viewBox="0 0 24 24"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/></svg>',
    reloj: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
    /* Una camara es una camara. Los botones de hacer foto llevaban el icono
       de nutricion —una pera— porque era el de la pantalla donde nacio el
       primero, y desde entonces habia que adivinar que ese boton abria la
       camara. Un icono que no dice lo que hace su boton es peor que ninguno. */
    /* Un vaso con su linea de agua. La gota valia para un icono pequeno, pero
       de silueta al fondo de una tarjeta de hidratacion un vaso se lee antes. */
    vaso: '<svg viewBox="0 0 24 24"><path d="M6 3h12l-1.3 17a1 1 0 01-1 .9H8.3a1 1 0 01-1-.9L6 3z"/><path d="M6.6 10.5h10.8"/></svg>',
    camara: '<svg viewBox="0 0 24 24"><path d="M9 8l1.2-2.4h3.6L15 8h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z"/><circle cx="12" cy="14" r="3.4"/></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    calendario: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/>'
      + '<path d="M3 10h18M8 3v4M16 3v4"/><path d="M7.5 14.5h2M14.5 14.5h2M7.5 17.5h2M14.5 17.5h2"/></svg>',
    bote: '<svg viewBox="0 0 24 24"><path d="M9 2.8h6v3H9z"/>'
      + '<path d="M6.8 5.8h10.4a1.8 1.8 0 011.8 1.8v11.6a1.8 1.8 0 01-1.8 1.8H6.8A1.8 1.8 0 015 19.2V7.6a1.8 1.8 0 011.8-1.8z"/>'
      + '<path d="M12 10.6v5.2M9.4 13.2h5.2"/></svg>',
    ayuda: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/>'
      + '<path d="M9.4 9.3a2.7 2.7 0 015.2.9c0 1.8-2.6 2.3-2.6 4M12 17.2v.1"/></svg>',
    filtro: '<svg viewBox="0 0 24 24"><path d="M3 7h18M6 12h12M10 17h4"/></svg>',
    casa: '<svg viewBox="0 0 24 24"><path d="M3.6 10.6L12 4l8.4 6.6V19a1.6 1.6 0 01-1.6 1.6H5.2A1.6 1.6 0 013.6 19z"/>'
      + '<path d="M9.4 20.6V14h5.2v6.6"/></svg>',
    banda: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9.2" ry="5.2" transform="rotate(-28 12 12)"/>'
      + '<ellipse cx="12" cy="12" rx="5" ry="1.9" transform="rotate(-28 12 12)"/></svg>',
    catalogo: '<svg viewBox="0 0 24 24"><rect x="3.4" y="3.4" width="7.2" height="7.2" rx="1.8"/>'
      + '<rect x="13.4" y="3.4" width="7.2" height="7.2" rx="1.8"/>'
      + '<rect x="3.4" y="13.4" width="7.2" height="7.2" rx="1.8"/>'
      + '<rect x="13.4" y="13.4" width="7.2" height="7.2" rx="1.8"/></svg>',
    llave: '<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="4.2"/><path d="M11 11l9 9M17 17l2-2M14 14l2-2"/></svg>',
    ojo: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/></svg>',
    cambiar: '<svg viewBox="0 0 24 24"><path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/></svg>',
    /* transporte del reproductor: macizos, que a este tamaño se leen mejor */
    anterior: '<svg viewBox="0 0 24 24" class="lleno"><path d="M7 6a1 1 0 012 0v4.6l8.5-4.9A1 1 0 0119 6.6v10.8a1 1 0 01-1.5.9L9 13.4V18a1 1 0 01-2 0z"/></svg>',
    siguiente: '<svg viewBox="0 0 24 24" class="lleno"><path d="M17 6a1 1 0 00-2 0v4.6L6.5 5.7A1 1 0 005 6.6v10.8a1 1 0 001.5.9l8.5-4.9V18a1 1 0 002 0z"/></svg>',
    playLleno: '<svg viewBox="0 0 24 24" class="lleno"><path d="M8 5.1a1 1 0 011.5-.9l9.2 5.9a1 1 0 010 1.7l-9.2 5.9a1 1 0 01-1.5-.9z"/></svg>',
    pausaLleno: '<svg viewBox="0 0 24 24" class="lleno"><path d="M8 4.5h3v15H8zM13 4.5h3v15h-3z"/></svg>',
    altavoz: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 010 7"/></svg>',
    corazon: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-7-9.4A4.1 4.1 0 0112 8.2a4.1 4.1 0 017 2.4c0 4.8-7 9.4-7 9.4z"/></svg>',
    aleatorio: '<svg viewBox="0 0 24 24"><path d="M4 6h3.5l9 12H20M17 3l3 3-3 3M4 18h3.5l2.2-3M14.2 9l2.3-3H20M17 21l3-3-3-3"/></svg>',
    lista: '<svg viewBox="0 0 24 24"><path d="M4 7h11M4 12h11M4 17h7M18 8v9M18 8l3-1"/></svg>'
  };
  function icon(n) { return ICON[n] || ''; }

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2200);
  }

  /* ---------- modal ----------
     La barrita de arriba prometía un gesto que no existía: se tiraba de ella y
     la hoja se quedaba quieta, y en una hoja larga —la de un ejercicio, con su
     vídeo y su guía— tampoco se veía fondo que tocar para salir. Ahora la
     cabecera se queda fija arriba, arrastra de verdad y lleva una X, que es lo
     que busca quien no conoce el gesto. */
  /* ---------- la hoja y el teclado ----------
     En iOS el teclado no encoge la ventana: la hoja está fija al fondo de la
     pantalla y el teclado se le pone encima, así que al escribir el nombre no
     se veía ni el campo ni los botones. visualViewport sí sabe cuánto queda
     libre de verdad, y la hoja se apoya ahí. */
  function ajustarAlTeclado() {
    const box = document.getElementById('modal');
    const vv = window.visualViewport;
    if (vv) {
      /* para que el CSS pueda apartar lo que esté fijo abajo sin adivinar
         cuánto ocupa el teclado */
      document.documentElement.style.setProperty('--vv-alto', vv.height + 'px');
    }
    if (!box || box.hidden) return;
    if (!vv) { box.style.height = ''; box.style.top = ''; box.style.bottom = ''; return; }
    box.style.height = vv.height + 'px';
    box.style.top = vv.offsetTop + 'px';
    box.style.bottom = 'auto';
  }

  function vigilarTeclado(encender) {
    const vv = window.visualViewport;
    if (!vv) return;
    if (encender) {
      vv.addEventListener('resize', ajustarAlTeclado);
      vv.addEventListener('scroll', ajustarAlTeclado);
    } else {
      vv.removeEventListener('resize', ajustarAlTeclado);
      vv.removeEventListener('scroll', ajustarAlTeclado);
    }
  }

  /* ---------- escribir en cualquier sitio ----------
     Lo de la hoja vale para las hojas, pero hay campos sueltos por toda la app
     —el editor de una rutina, el perfil, el buscador, los kilos de una serie—
     y ahí pasa lo mismo: el teclado se pone encima y tapa justo lo que estás
     escribiendo, o lo tapa la barra de pestañas, que también está fija abajo.

     Al enfocar un campo se aparta lo que estorba y se sube el campo a la zona
     que queda libre de verdad, la que dice visualViewport y no la ventana. */
  const ESCRIBIBLE = 'input, textarea, select, [contenteditable="true"]';
  const SIN_TECLADO = ['checkbox', 'radio', 'range', 'color', 'file', 'button', 'submit'];

  function pideTeclado(el) {
    if (!el || !el.matches || !el.matches(ESCRIBIBLE)) return false;
    if (el.tagName === 'INPUT' && SIN_TECLADO.indexOf(el.type) !== -1) return false;
    return !el.disabled && !el.readOnly;
  }

  function aLaVista(el) {
    if (!el || !el.getBoundingClientRect) return;
    const vv = window.visualViewport;
    const alto = vv ? vv.height : window.innerHeight;
    const arriba = vv ? vv.offsetTop : 0;
    const r = el.getBoundingClientRect();
    const margen = 20;

    /* dentro de una hoja o de cualquier caja con scroll propio */
    const caja = el.closest('.modal-box, .tabla-scroll');
    if (caja) el.scrollIntoView({ block: 'nearest' });

    const abajo = arriba + alto - margen;
    if (r.bottom > abajo) window.scrollBy({ top: r.bottom - abajo, behavior: 'smooth' });
    else if (r.top < arriba + margen) {
      window.scrollBy({ top: r.top - arriba - margen, behavior: 'smooth' });
    }
  }

  let campoActivo = null;

  document.addEventListener('focusin', function (e) {
    if (!pideTeclado(e.target)) return;
    campoActivo = e.target;
    document.body.classList.add('escribiendo');
    ajustarAlTeclado();
    vigilarTeclado(true);
    /* el teclado tarda en subir; sin esperar, la cuenta sale con la pantalla
       todavía entera y el campo se queda debajo igual */
    setTimeout(function () { aLaVista(campoActivo); }, 120);
    setTimeout(function () { aLaVista(campoActivo); }, 400);
  });

  document.addEventListener('focusout', function (e) {
    if (!pideTeclado(e.target)) return;
    campoActivo = null;
    setTimeout(function () {
      /* si el foco ha saltado a otro campo, esto no es el final de nada */
      if (campoActivo) return;
      document.body.classList.remove('escribiendo');
      if (document.getElementById('modal').hidden) vigilarTeclado(false);
    }, 60);
  });

  function modal(contentHTML, onMount) {
    /* Si se abre una hoja desde una fila deslizada, esa fila se queda abierta
       detrás y al cerrar la hoja sigue ahí, con los botones al aire. */
    cerrarDeslizadas();
    const box = document.getElementById('modal');
    box.innerHTML = '<div class="modal-box"><div class="modal-cab">' +
      '<span class="modal-grab"></span>' +
      '<button class="modal-x" data-cerrar aria-label="Cerrar">' + ICON.close + '</button>' +
      '</div>' + contentHTML + '</div>';
    box.hidden = false;
    ajustarAlTeclado();
    vigilarTeclado(true);
    box.onclick = function (e) { if (e.target === box) closeModal(); };

    const inner = box.querySelector('.modal-box');
    inner.querySelector('[data-cerrar]').onclick = closeModal;
    tirarParaCerrar(inner);

    if (onMount) onMount(inner);
    return inner;
  }

  /* Arrastrar la cabecera hacia abajo cierra la hoja; un toque seco, también.
     Solo desde arriba del todo: si no, bajar por el contenido cerraría la hoja
     en lugar de desplazarla. */
  function tirarParaCerrar(inner) {
    const cab = inner.querySelector('.modal-cab');
    if (!cab) return;

    let desde = null;
    let recorrido = 0;

    const soltar = function () {
      if (desde === null) return;
      desde = null;
      inner.style.transition = 'transform .22s cubic-bezier(.32,.72,0,1)';
      if (recorrido > 90) {
        inner.style.transform = 'translateY(100%)';
        setTimeout(closeModal, 170);
      } else {
        inner.style.transform = '';
      }
    };

    cab.addEventListener('touchstart', function (e) {
      if (inner.scrollTop > 0) return;
      desde = e.touches[0].clientY;
      recorrido = 0;
    }, { passive: true });

    cab.addEventListener('touchmove', function (e) {
      if (desde === null) return;
      recorrido = Math.max(0, e.touches[0].clientY - desde);
      inner.style.transition = 'none';
      inner.style.transform = 'translateY(' + recorrido + 'px)';
    }, { passive: true });

    cab.addEventListener('touchend', soltar);
    cab.addEventListener('touchcancel', soltar);

    cab.addEventListener('click', function (e) {
      if (e.target.closest('.modal-x')) return;   // la X ya cierra por su cuenta
      if (recorrido > 8) return;                  // venía de arrastrar y volver
      closeModal();
    });
  }

  function closeModal() {
    const box = document.getElementById('modal');
    box.hidden = true;
    box.innerHTML = '';
    vigilarTeclado(false);
    box.style.height = '';
    box.style.top = '';
    box.style.bottom = '';
  }

  /* Confirmación con botones; devuelve una promesa */
  /* La pregunta de «¿seguro?» era un titulo, un parrafo y dos botones iguales.
     Un disco con el icono arriba dice de que va antes de leer nada —rojo si
     algo se va a perder, verde si no— y es lo que separa una confirmacion de
     un aviso cualquiera. */
  function confirm(title, message, okLabel, danger, ico) {
    return new Promise(function (resolve) {
      modal(
        html`<div class="conf-disco ${danger ? 'mal' : ''}">
               ${raw(ICON[ico] || ICON[danger ? 'aviso' : 'check'])}</div>
             <h2 class="conf-tit">${title}</h2>
             <p class="muted conf-txt">${message}</p>
             <div class="row" style="margin-top:18px">
               <button class="btn grow vidrio" data-x="no">Cancelar</button>
               <button class="btn grow ${danger ? 'danger' : 'primary'}" data-x="si">${okLabel || 'Aceptar'}</button>
             </div>`,
        function (el) {
          el.querySelector('[data-x=no]').onclick = function () { closeModal(); resolve(false); };
          el.querySelector('[data-x=si]').onclick = function () { closeModal(); resolve(true); };
        }
      );
    });
  }

  /* ---------- formateo ---------- */
  function num(n) {
    n = Number(n) || 0;
    return n.toLocaleString('es-ES', { maximumFractionDigits: n < 100 ? 1 : 0 });
  }

  function kg(n) {
    return num(n) + ' ' + (Store.settings().unit === 'lb' ? 'lb' : 'kg');
  }

  function mmss(sec) {
    sec = Math.max(0, Math.round(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  /* ---------- la hora, como la escribe su teléfono ----------
     Dentro se guarda siempre «HH:MM» de 24 h: es lo que entiende el campo de
     hora del navegador, lo que se ordena bien alfabéticamente y lo que no
     depende de dónde esté nadie. Pero enseñarlo así obliga a media España —y a
     toda América— a traducir «18:00» mentalmente cada vez.

     Así que se guarda en 24 h y se enseña como lo enseñe el sistema: quien
     tenga el móvil en a. m./p. m. lo ve así, y quien lo tenga en 24 h lo sigue
     viendo igual que antes. No hace falta preguntárselo a nadie. */
  function hora(hhmm) {
    const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})/);
    if (!m) return String(hhmm || '');
    const d = new Date();
    d.setHours(Number(m[1]), Number(m[2]), 0, 0);
    try {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        /* El espacio fino que meten algunos navegadores entre la cifra y el
           a. m. parte la hora en dos renglones donde no cabe. */
        .replace(/ /g, ' ');
    } catch (e) { return String(hhmm); }
  }

  /* Los días se guardan abreviados desde la primera versión, pero al leerlos
     "Jue" suena a nota de la compra. Se muestran enteros. */
  const DIA_LARGO = {
    Dom: 'Domingo', Lun: 'Lunes', Mar: 'Martes', 'Mié': 'Miércoles',
    Jue: 'Jueves', Vie: 'Viernes', 'Sáb': 'Sábado'
  };
  function diaLargo(d) { return DIA_LARGO[d] || d; }
  function diasLargos(lista) { return (lista || []).map(diaLargo).join(', '); }
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function fecha(ts) {
    const d = new Date(ts);
    const hoy = new Date();
    const mismoDia = d.toDateString() === hoy.toDateString();
    const ayer = new Date(hoy.getTime() - 864e5).toDateString() === d.toDateString();
    const hora = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    if (mismoDia) return 'Hoy · ' + hora;
    if (ayer) return 'Ayer · ' + hora;
    return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' · ' + hora;
  }

  function fechaCorta(ts) {
    const d = new Date(ts);
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  /* ---------- sonido y vibración ---------- */
  let audioCtx = null;
  function beep(times) {
    if (!Store.settings().sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const n = times || 1;
      for (let i = 0; i < n; i++) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode); gainNode.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        const t0 = audioCtx.currentTime + i * 0.22;
        gainNode.gain.setValueAtTime(0.0001, t0);
        gainNode.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
        osc.start(t0); osc.stop(t0 + 0.2);
      }
    } catch (e) { /* el navegador puede bloquear el audio hasta la primera interacción */ }
    if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
  }

  /* ---------- reproductor de la animación del movimiento ----------
     Cada ejercicio trae 2 fotogramas (posición inicial y final). Alternándolos
     a ritmo constante se ve el recorrido correcto, igual que un GIF. */
  let demoTimers = [];

  function clearDemos() {
    demoTimers.forEach(clearInterval);
    demoTimers = [];
  }

  function demoHTML(ex, opts) {
    opts = opts || {};
    const frames = Data.frames(ex);
    const speed = opts.speed || 900;
    const controls = opts.controls !== false && frames.length > 1;
    return html`
      <div class="demo${raw(Data.esIlustracion && Data.esIlustracion(ex) ? ' ilus' : '')}"
           data-demo="${JSON.stringify(frames)}" data-speed="${speed}"
           ${raw(opts.fases ? 'data-fases="' + esc(JSON.stringify(opts.fases)) + '"' : '')}>
        ${raw(frames.map(function (src, i) {
          return '<img class="' + (i === 0 ? 'on' : '') + '" src="' + esc(src) +
                 '" alt="' + (i === 0 ? 'Técnica de ' + esc(ex.nameEs) : '') +
                 '" decoding="async">';
        }).join(''))}
        ${raw(frames.length > 1
          ? '<div class="frame-dots">' + frames.map(function (_, i) {
              return '<i class="' + (i === 0 ? 'on' : '') + '"></i>';
            }).join('') + '</div>'
          : '')}
        ${raw(opts.fases ? '<div class="fase"><span data-fase>' + esc(opts.fases[0]) +
          '</span></div>' : '')}
        ${raw(controls ? `
          <div class="demo-ctl">
            <button data-act="toggle" aria-label="Pausar animación">${icon('pause')}</button>
            <input type="range" min="350" max="2000" step="50" value="${speed}" data-act="speed"
                   aria-label="Velocidad de la animación">
            <span data-out>${(speed / 1000).toFixed(1)}s</span>
          </div>` : '')}
      </div>`;
  }

  /* Arranca todas las animaciones presentes dentro de root */
  /* ---------- deslizar para descubrir acciones ----------
     Lo de iOS: se empuja la fila hacia la izquierda y detrás aparecen los
     botones. Sirve para no tener que desplegar un plan entero solo para
     borrarlo o duplicarlo.

     Se usa el puntero, no el táctil, para que funcione igual con el ratón, y
     la cara lleva touch-action:pan-y: así el navegador sigue encargándose del
     desplazamiento vertical —que es el que no hay que romper— y a nosotros nos
     llega el horizontal. Hasta que el dedo no deja claro que va de lado no se
     mueve nada, porque si no cualquier scroll con un poco de inclinación abría
     filas sin querer. */
  const UMBRAL = 10;
  let abierta = null;

  function cerrarDeslizada(fila) {
    if (!fila) return;
    const cara = fila.querySelector(':scope > .desliza-cara');
    if (cara) cara.style.transform = '';
    fila.classList.remove('abierta', 'abierta-izq');
    if (abierta === fila) abierta = null;
  }

  function cerrarDeslizadas() { cerrarDeslizada(abierta); }

  function deslizables(root) {
    (root || document).querySelectorAll('.desliza').forEach(function (fila) {
      if (fila._listo) return;
      fila._listo = true;

      const cara = fila.querySelector(':scope > .desliza-cara');
      const panel = fila.querySelector(':scope > .desliza-acciones.der');
      const panelIzq = fila.querySelector(':scope > .desliza-acciones.izq');
      if (!cara || (!panel && !panelIzq)) return;

      let x0 = 0, y0 = 0, dx = 0, eje = '', activo = false, movido = false;

      /* Nunca se empuja tanto como para que la fila deje de decir qué es: con
         los botones ocupando casi todo el ancho, al abrir un plan solo se veía
         el final de su texto y no se sabía cuál se estaba tocando. */
      const tope = function (el) {
        if (!el) return 0;
        return Math.min(el.offsetWidth || 0, Math.max(0, fila.offsetWidth - 112));
      };
      const ancho = function () { return tope(panel); };
      const anchoIzq = function () { return tope(panelIzq); };

      cara.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        activo = true; movido = false; eje = '';
        x0 = e.clientX; y0 = e.clientY; dx = 0;
        cara.style.transition = 'none';
      });

      cara.addEventListener('pointermove', function (e) {
        if (!activo) return;
        const ex = e.clientX - x0;
        const ey = e.clientY - y0;

        if (!eje) {
          if (Math.abs(ex) < UMBRAL && Math.abs(ey) < UMBRAL) return;
          eje = Math.abs(ex) > Math.abs(ey) ? 'x' : 'y';
          /* si va en vertical, esto no es asunto nuestro */
          if (eje === 'y') { activo = false; cara.style.transition = ''; return; }
          /* al empezar a deslizar una, cualquier otra abierta se cierra */
          if (abierta && abierta !== fila) cerrarDeslizada(abierta);
        }

        movido = true;
        fila.classList.add('moviendo');
        const base = fila.classList.contains('abierta') ? -ancho()
          : fila.classList.contains('abierta-izq') ? anchoIzq() : 0;
        /* a la izquierda las acciones, a la derecha el renombrar; un poco de
           resistencia al pasarse de cualquiera de los dos lados */
        dx = Math.max(-ancho() - 20, Math.min(anchoIzq() + 20, base + ex));
        cara.style.transform = 'translateX(' + dx + 'px)';
        fila.classList.toggle('mirando-izq', dx > 0);
      });

      const soltar = function () {
        if (!activo) return;
        activo = false;
        cara.style.transition = '';
        fila.classList.remove('moviendo');
        if (!movido) return;

        const abrirDer = ancho() && dx < -ancho() / 2;
        const abrirIzq = anchoIzq() && dx > anchoIzq() / 2;
        cara.style.transform = abrirDer ? 'translateX(' + (-ancho()) + 'px)'
          : abrirIzq ? 'translateX(' + anchoIzq() + 'px)' : '';
        fila.classList.toggle('abierta', !!abrirDer);
        fila.classList.toggle('abierta-izq', !!abrirIzq);
        fila.classList.toggle('mirando-izq', !!abrirIzq);
        abierta = (abrirDer || abrirIzq) ? fila : (abierta === fila ? null : abierta);
      };

      cara.addEventListener('pointerup', soltar);
      cara.addEventListener('pointercancel', soltar);
      cara.addEventListener('pointerleave', soltar);

      /* Un deslizamiento no es un toque: sin esto, abrir la fila abría también
         el plan que hay debajo. */
      cara.addEventListener('click', function (e) {
        if (!movido) return;
        e.preventDefault();
        e.stopPropagation();
        movido = false;
      }, true);

      /* Al usar una acción, la fila se cierra: lo que hay debajo va a repintarse */
      [panel, panelIzq].forEach(function (pl) {
        if (pl) pl.addEventListener('click', function () { cerrarDeslizada(fila); });
      });
    });
  }

  /* Tocar en cualquier otro sitio, o desplazar, cierra la que esté abierta */
  document.addEventListener('pointerdown', function (e) {
    if (abierta && !abierta.contains(e.target)) cerrarDeslizadas();
  }, true);
  window.addEventListener('scroll', function () { cerrarDeslizadas(); }, { passive: true });

  function mountDemos(root) {
    (root || document).querySelectorAll('[data-demo]').forEach(function (box) {
      if (box.dataset.mounted) return;
      box.dataset.mounted = '1';

      let frames;
      try { frames = JSON.parse(box.dataset.demo); } catch (e) { return; }
      if (frames.length < 2) return;

      /* los fotogramas están apilados: se alterna la opacidad, nunca el src,
         así el movimiento se ve continuo sin parpadeo */
      const layers = box.querySelectorAll('img');
      const dots = box.querySelectorAll('.frame-dots i');
      const out = box.querySelector('[data-out]');
      const toggleBtn = box.querySelector('[data-act=toggle]');
      const speedInput = box.querySelector('[data-act=speed]');

      let i = 0, playing = true, timer = null;
      let speed = Number(box.dataset.speed) || 900;
      const fade = function () { box.style.setProperty('--fade', Math.round(speed * 0.55) + 'ms'); };
      fade();

      const fase = box.querySelector('[data-fase]');
      let etiquetas = [];
      try { etiquetas = JSON.parse(box.dataset.fases || '[]'); } catch (e) { etiquetas = []; }

      function tick() {
        i = (i + 1) % frames.length;
        layers.forEach(function (l, k) { l.classList.toggle('on', k === i); });
        dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
        if (fase && etiquetas[i]) fase.textContent = etiquetas[i];
      }
      function run() {
        clearInterval(timer);
        fade();
        timer = setInterval(tick, speed);
        demoTimers.push(timer);
      }
      run();

      if (toggleBtn) toggleBtn.onclick = function (e) {
        e.stopPropagation();
        playing = !playing;
        toggleBtn.innerHTML = icon(playing ? 'pause' : 'play');
        toggleBtn.setAttribute('aria-label', playing ? 'Pausar animación' : 'Reproducir animación');
        box.classList.toggle('paused', !playing);
        if (playing) run(); else clearInterval(timer);
      };

      if (speedInput) speedInput.oninput = function (e) {
        e.stopPropagation();
        speed = Number(speedInput.value);
        if (out) out.textContent = (speed / 1000).toFixed(1) + 's';
        if (playing) run();
      };
    });
  }

  g.UI = {
    esc: esc, html: html, raw: raw, icon: icon,
    demoHTML: demoHTML, mountDemos: mountDemos, clearDemos: clearDemos,
    deslizables: deslizables, cerrarDeslizadas: cerrarDeslizadas,
    toast: toast, modal: modal, closeModal: closeModal, confirm: confirm,
    num: num, kg: kg, mmss: mmss, fecha: fecha, fechaCorta: fechaCorta,
    beep: beep, DAY_NAMES: DAY_NAMES, diaLargo: diaLargo, diasLargos: diasLargos,
    hora: hora
  };
})(window);
