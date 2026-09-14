/* importar.js — traer a la app una rutina que ya tienes en papel.

   La hoja del gimnasio, la foto de la libreta, el PDF que te pasa tu
   entrenador. Se lee con la IA, se resuelve contra el catálogo y se enseña
   antes de crear nada: lo que sale de una foto hay que mirarlo, no tragárselo.

   El archivo no se guarda en ninguna parte. Se lee en memoria, se manda para
   que lo lean y se suelta; lo único que queda es la rutina que decidas crear. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};
  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  /* Lo leído de la última vez, solo mientras dura la pantalla */
  let leido = null;
  let cargando = false;
  let fallo = '';
  let pista = '';
  /* El archivo ya preparado, en memoria y nada más: hace falta para poder
     corregir la lectura sin obligar a buscar la foto otra vez en el carrete. No
     se escribe en disco ni se sincroniza; se suelta al salir de la pantalla. */
  let archivoEnMano = null;

  const LIMITE = 8 * 1024 * 1024;

  function aBase64(file) {
    return new Promise(function (ok, mal) {
      const lector = new FileReader();
      lector.onload = function () {
        const t = String(lector.result || '');
        const coma = t.indexOf(',');
        ok({ datos: coma === -1 ? t : t.slice(coma + 1), mime: file.type });
      };
      lector.onerror = function () { mal(new Error('No he podido leer ese archivo.')); };
      lector.readAsDataURL(file);
    });
  }

  /* Las fotos se encogen antes de mandarlas; un PDF va tal cual, que Gemini lo
     lee directo y convertirlo a imagen necesitaría una librería. */
  function preparar(file) {
    if (!file) return Promise.reject(new Error('No has elegido ningún archivo.'));
    if (file.size > LIMITE) {
      return Promise.reject(new Error('Ese archivo pesa demasiado. Prueba con una foto ' +
        'o con un PDF de menos de 8 MB.'));
    }
    if (/^image\//.test(file.type)) {
      return Comidas.prepararFoto(file, 1400);
    }
    if (file.type === 'application/pdf') return aBase64(file);
    return Promise.reject(new Error('Tiene que ser una foto o un PDF.'));
  }

  function analizar(file) {
    cargando = true;
    fallo = '';
    leido = null;
    App.render();

    /* Con archivo nuevo se prepara; sin él se reusa el que ya está en memoria,
       que es lo que permite corregir la lectura sin volver a buscar la foto. */
    const listo = file ? preparar(file).then(function (a) { archivoEnMano = a; return a; })
      : (archivoEnMano ? Promise.resolve(archivoEnMano)
        : Promise.reject(new Error('Elige antes una foto o un PDF.')));

    listo
      .then(function (archivo) { return IA.leerRutina(archivo, pista); })
      .then(function (r) { leido = resolver(r); })
      .catch(function (e) { fallo = e.message || 'No he podido leerla.'; })
      .then(function () { cargando = false; App.render(); });
  }

  /* Al salir de la pantalla no queda nada del archivo en ninguna parte. */
  function olvidar() {
    archivoEnMano = null;
    leido = null;
    pista = '';
    fallo = '';
  }

  /* Lo que dice la IA contra lo que existe de verdad. Un nombre que no resuelve
     no se puede entrenar, así que se aparta y se dice, en vez de crear una
     rutina con huecos. */
  function resolver(r) {
    /* El material NO filtra aquí. Copiar una hoja no es diseñar una rutina: si
       el papel pone prensa de piernas, es la prensa, aunque en los ajustes
       ponga «Sin material». Filtrando, una hoja de gimnasio entera acababa
       convertida en estiramientos, porque con «Sin material» el catálogo son
       184 ejercicios de suelo y no había otra cosa que ofrecer.

       Lo que sí se hace es contarlo y decirlo abajo, para que se vea que la
       rutina pide más de lo que hay marcado. */
    const gear = Store.settings().gear;
    const fuera = [];

    const dias = (r.dias || []).map(function (d) {
      const ejercicios = (d.ejercicios || []).map(function (e) {
        const nombre = String(e.ejercicio || '').trim();
        /* Lo que ponía en el papel, sin las series ni los tiempos, que van
           pegados en la misma línea. */
        const delPapel = String(e.comoVenia || '')
          .replace(/\d+\s*[x×]\s*\d+/gi, ' ')
          .replace(/\d+\s*(min|s|seg|segundos|minutos|reps?|series?)\b/gi, ' ')
          /* Las unidades que quedan sueltas cuando su número ya se fue con la
             regla de arriba: «Plancha 3 x 45 s» dejaba un «Plancha s» que no
             casa con nada del catálogo. */
          .replace(/\b(min|s|seg|segundos|minutos|reps?|series?|kg)\b/gi, ' ')
          .replace(/[\d.,;:–-]+/g, ' ')
          .replace(/\s{2,}/g, ' ').trim();

        /* El orden importa. A la IA se le pasa un catálogo recortado —unos
           cuantos por músculo— y sustituía ejercicios que SÍ existen tal cual,
           como el peso muerto rumano, porque no los tenía delante: por eso se
           prueba antes el nombre del papel, pero solo si casa EXACTO con una
           entrada del catálogo.

           Buscar por texto el nombre del papel va al final del todo, porque es
           lo que peor acierta: «gemelo de pie» devuelve una prensa de piernas.
           La IA entiende de qué va el ejercicio; el buscador solo compara
           palabras. */
        const ex = (delPapel && Data.porNombreEs(delPapel)) ||
          Data.porNombreEs(nombre) ||
          (Data.search({ q: nombre }) || [])[0] ||
          (delPapel && (Data.search({ q: delPapel }) || [])[0]);

        if (!ex) {
          fuera.push((delPapel || nombre) + ' (no está en el catálogo)');
          return null;
        }
        return {
          ex: ex,
          comoVenia: e.comoVenia || '',
          fila: {
            exId: ex.id,
            sets: Math.min(12, Math.max(1, Number(e.series) || 3)),
            reps: Math.min(120, Math.max(1, Number(e.reps) || 10)),
            weight: 0,
            rest: Math.min(600, Math.max(0, Number(e.descanso) || 90)),
            note: ''
          }
        };
      }).filter(Boolean);

      return {
        dia: DIAS.indexOf(d.dia) !== -1 ? d.dia : '',
        titulo: d.titulo || '',
        ejercicios: ejercicios
      };
    }).filter(function (d) { return d.ejercicios.length; });

    return {
      nombre: r.nombre || 'Mi rutina',
      dias: dias,
      dudas: (r.dudas || []).concat(fuera)
    };
  }

  /* ---------- la pantalla ---------- */

  V.importar = function () {
    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Rutinas</button>
      <h1>Traer una rutina que ya tienes</h1>
      <p class="muted">Una foto de la hoja del gimnasio, de tu libreta o el PDF que te
      hayan dado. La leo, te enseño lo que he entendido y tú decides si se crea.</p>

      <div class="card">
        <div class="row" style="gap:8px">
          <label class="btn primary grow" for="imp-archivo" style="cursor:pointer">
            ${raw(icon('camara'))} Elegir foto o PDF</label>
        </div>
        <input type="file" id="imp-archivo" accept="image/*,application/pdf" hidden>

        <div class="tiny" style="margin:12px 0 5px">¿ALGO QUE DEBA SABER?</div>
        <textarea id="imp-pista" rows="2" placeholder="Ej. es la rutina de mi entrenador, respétala tal cual; la columna de la derecha son los kilos, no las repeticiones">${pista}</textarea>
        <p class="tiny" style="margin:7px 0 0">El archivo no se guarda en ningún sitio: se
        lee, se manda para que lo interpreten y se suelta. Lo único que queda es la rutina
        si decides crearla.</p>
      </div>

      ${raw(cargando ? html`
        <div class="card center"><div class="spinner" style="margin:6px auto"></div>
        <p class="tiny" style="margin:8px 0 0">Leyendo lo que pone…</p></div>` : '')}

      ${raw(fallo ? html`
        <div class="card" style="border-color:var(--bad)">
          <b>No he podido leerla</b>
          <p class="tiny" style="margin:6px 0 0">${fallo}</p>
        </div>` : '')}

      ${raw(leido ? resultadoHTML(leido) : '')}`;
  };

  function resultadoHTML(r) {
    const total = r.dias.reduce(function (n, d) { return n + d.ejercicios.length; }, 0);

    if (!total) {
      return html`
        <div class="card" style="border-color:var(--warn)">
          <b>No he encontrado ninguna rutina ahí</b>
          <p class="tiny" style="margin:6px 0 0">${r.dudas.length ? esc(r.dudas.join('. '))
            : 'Prueba con una foto más nítida, o recorta solo la tabla de ejercicios.'}</p>
        </div>`;
    }

    return html`
      <div class="list-head" style="margin-top:18px">
        <span class="list-title" style="margin:0">Esto es lo que he entendido</span>
      </div>
      <p class="tiny" style="margin:-4px 0 10px">Míralo antes de crearla: lo que sale de
      una foto conviene revisarlo. Luego se edita como cualquier otra rutina.</p>

      ${raw(r.dias.map(function (d, i) {
        return html`
          <div class="card" style="padding:0;overflow:hidden">
            <div style="padding:13px 13px 8px">
              <div class="rt-titulo">${d.dia ? UI.diaLargo(d.dia) : 'Sesión ' + (i + 1)}${raw(
                d.titulo ? ' · ' + esc(d.titulo) : '')}</div>
              <div class="tiny" style="margin-top:3px">${d.ejercicios.length} ejercicios</div>
            </div>
            <div class="rt-detalle">
              ${raw(d.ejercicios.map(function (e, k) {
                return html`
                  <div class="rt-item" style="cursor:default">
                    <img src="${Data.img(e.ex, 0)}" alt="" loading="lazy">
                    <div class="grow">
                      <div style="font-weight:600;font-size:.85rem">${k + 1}. ${e.ex.nameEs}</div>
                      <div class="tiny">${e.fila.sets} × ${e.fila.reps} · ${e.fila.rest}s${raw(
                        e.comoVenia && I18N.norm(e.comoVenia) !== I18N.norm(e.ex.nameEs)
                          ? ' · en el papel: <b>' + esc(e.comoVenia) + '</b>' : '')}</div>
                    </div>
                  </div>`;
              }).join(''))}
            </div>
          </div>`;
      }).join(''))}

      ${raw(avisoMaterial(r))}

      ${raw(r.dudas.length ? html`
        <div class="card" style="border-color:var(--warn)">
          <b>Esto no lo tengo claro</b>
          <ul class="instr" style="margin:8px 0 0">
            ${raw(r.dudas.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''))}
          </ul>
        </div>` : '')}

      <div class="tiny" style="margin:16px 0 5px">¿CORRIJO ALGO ANTES DE CREARLA?</div>
      <textarea id="imp-ajuste" rows="2" placeholder="Ej. el segundo día son 4 series, no 3; el último ejercicio es en polea"></textarea>
      <button class="btn block sm" data-a="reintentar" style="margin-top:8px">
        ${raw(icon('cambiar'))} Volver a leerla con esto en cuenta</button>

      <button class="btn primary block" data-a="crear" style="margin-top:16px">
        ${raw(icon('check'))} Crear esta rutina</button>
      <p class="tiny" style="margin:7px 0 0">Se guarda en tus rutinas y desde ahí
      puedes editarla, ponerle los días y pedirle al entrenador que la analice.</p>`;
  }

  /* La hoja pide un material y en los ajustes hay otro. No se toca la rutina
     por eso —lo que pone en el papel manda— pero decirlo evita la sorpresa de
     llegar al gimnasio con media rutina que no puedes hacer, o al revés. */
  function avisoMaterial(r) {
    /* Se cuenta al pintar, no al leer: el botón de aquí abajo cambia el sitio y
       el aviso tiene que enterarse en el mismo repintado. */
    const gear = Store.settings().gear;
    const gset = Data.GEAR[gear];
    if (!gset) return '';

    let total = 0, ajenos = 0;
    r.dias.forEach(function (d) {
      d.ejercicios.forEach(function (e) {
        total++;
        if (!Data.gearAllows(gear, e.ex.equipment) ||
            !Data.permiteNombre(gear, e.ex.nameEs)) ajenos++;
      });
    });
    if (!ajenos) return '';
    const todos = ajenos === total;

    const cuantos = todos
      ? 'Todos los ejercicios de esta rutina piden'
      : ajenos + ' de los ' + total + ' ejercicios piden';

    return html`
      <div class="card" style="border-color:var(--warn)">
        <b>Pide más material del que tienes marcado</b>
        <p class="tiny" style="margin:6px 0 0">${cuantos} material que
        «${esc(gset.label)}» no contempla. La he copiado tal cual, que para eso
        la traes, pero si vas a entrenarla cambia dónde entrenas o no te va a
        cuadrar.</p>
        <button class="btn sm block" data-a="lugar" style="margin-top:10px">
          ${raw(icon('dumbbell'))} Cambiar dónde entreno</button>
      </div>`;
  }

  V.importar.mount = function (root) {
    App.bind(root, '[data-a=atras]', function () { App.go('rutinas'); });

    /* En cuanto se sale de aquí, el archivo deja de existir para la app. */
    const alSalir = function () {
      if (location.hash.indexOf('importar') !== -1) return;
      olvidar();
      window.removeEventListener('hashchange', alSalir);
    };
    window.addEventListener('hashchange', alSalir);

    const campoPista = root.querySelector('#imp-pista');
    if (campoPista) campoPista.oninput = function () { pista = campoPista.value; };

    const archivo = root.querySelector('#imp-archivo');
    if (archivo) archivo.onchange = function () {
      const f = archivo.files && archivo.files[0];
      archivo.value = '';
      if (!f) return;
      if (!IA.activa()) {
        App.go('entrenador');
        UI.toast('Necesita el entrenador con IA para leer la hoja');
        return;
      }
      analizar(f);
    };

    App.bind(root, '[data-a=reintentar]', function () {
      const ajuste = root.querySelector('#imp-ajuste');
      const texto = ajuste ? ajuste.value.trim() : '';
      if (!texto) { UI.toast('Escribe qué hay que corregir'); return; }
      pista = (pista ? pista + '. ' : '') + texto;
      analizar(null);
    });

    App.bind(root, '[data-a=lugar]', function () { App.lugarSheet(); });
    App.bind(root, '[data-a=crear]', function () { crearSheet(); });
  };

  /* ---------- crearla de verdad ---------- */

  function crearSheet() {
    if (!leido || !leido.dias.length) return;

    let nombre = leido.nombre;
    while (Store.routines().some(function (r) { return App.nombreRutina(r) === nombre; })) {
      nombre = nombre + ' (2)';
    }

    const ocupados = {};
    Store.routines().forEach(function (r) {
      (r.days || []).forEach(function (d) { ocupados[d] = true; });
    });

    UI.modal(html`
      <h2>Crear la rutina</h2>
      <p class="muted">Se crean ${leido.dias.length}
        ${leido.dias.length === 1 ? 'rutina' : 'rutinas'} en tus rutinas. A partir de ahí
        son tuyas y las editas como cualquier otra.</p>

      <div class="tiny" style="margin:14px 0 6px">CÓMO SE LLAMA</div>
      <input id="imp-nombre" class="input" value="${nombre}" maxlength="40">
      <p class="tiny" style="margin:7px 0 0">Los días que traía el papel se respetan si los
      tienes libres; si no, entra sin día y se lo pones tú.</p>

      <button class="btn primary block" id="imp-ok" style="margin-top:16px">Crear</button>
      <button class="btn ghost block" id="imp-no" style="margin-top:8px">Cancelar</button>`,
      function (el) {
        el.querySelector('#imp-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#imp-ok').onclick = function () {
          const destino = String(el.querySelector('#imp-nombre').value || '').trim();
          if (!destino) { UI.toast('Ponle un nombre'); return; }

          let creadas = 0;
          let ultima = null;
          leido.dias.forEach(function (d) {
            const dias = (d.dia && !ocupados[d.dia]) ? [d.dia] : [];
            if (dias.length) ocupados[d.dia] = true;
            const largos = dias.map(UI.diaLargo);
            ultima = Store.saveRoutine({
              name: largos.length ? largos.join(' y ') + ' · ' + destino : destino,
              days: dias,
              note: '',
              exercises: d.ejercicios.map(function (e) { return e.fila; })
            });
            creadas++;
          });

          UI.closeModal();
          olvidar();

          /* Lo que se trae de fuera es justo lo que conviene pasar por el
             entrenador: no la ha montado la app y nadie la ha mirado todavía. */
          if (creadas === 1 && ultima && App.auditarRutina) {
            App.auditarRutina(ultima.id);
          } else if (creadas > 1 && g.VISTAS && VISTAS.auditarPlan) {
            VISTAS.auditarPlan(destino);
          } else {
            App.go('rutinas');
          }
          UI.toast(creadas + (creadas === 1 ? ' rutina creada' : ' rutinas creadas'));
        };
      });
  }
})(window);
