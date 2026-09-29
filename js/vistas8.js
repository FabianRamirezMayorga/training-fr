/* vistas8.js — Reloj y salud.

   La pantalla se ordena por lo que el usuario viene a hacer, no por lo que la
   app sabe hacer: primero lo que ya tiene medido, y abajo del todo cómo traer
   más. Al revés obligaba a pasar por delante de tres formularios cada vez que
   uno entra solo a mirar los pasos de ayer.

   El Bluetooth va arriba pero pequeño y solo cuando el navegador lo tiene: en
   iPhone no existe, y una tarjeta grande ofreciendo algo imposible es peor que
   no ofrecer nada. Ahí se explica por qué y qué hacer en su lugar. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  /* Estado de la pantalla mientras dura la visita */
  let leyendo = false;
  let progreso = 0;
  let aviso = '';
  let error = '';
  let verAtajo = false;
  let metrica = 'pasos';

  /* Qué se puede enseñar de cada medida, y cómo se escribe */
  const MEDIDAS = {
    pasos: { label: 'Pasos', unidad: '', icono: 'grafica', dec: 0 },
    pulsoReposo: { label: 'Pulso en reposo', unidad: ' ppm', icono: 'corazon', dec: 0 },
    sueno: { label: 'Sueño', unidad: ' h', icono: 'luna', dec: 1 },
    kcal: { label: 'Calorías activas', unidad: ' kcal', icono: 'chispa', dec: 0 },
    peso: { label: 'Peso', unidad: '', icono: 'perfil', dec: 1 },
    distancia: { label: 'Distancia', unidad: ' km', icono: 'grafica', dec: 1 },
    minutos: { label: 'Minutos de ejercicio', unidad: ' min', icono: 'reloj', dec: 0 },
    pulsoMedio: { label: 'Pulso medio', unidad: ' ppm', icono: 'corazon', dec: 0 }
  };

  /* UI.fecha siempre pega la hora detrás, y un día del reloj no tiene hora:
     salía «Hoy · 00:00» en todas las filas, que parece un dato roto. Aquí solo
     hace falta el día, con el mismo «Hoy» y «Ayer» del resto de la app. */
  function etiquetaDia(ts) {
    const d = new Date(ts);
    const hoy = new Date();
    if (d.toDateString() === hoy.toDateString()) return T('Hoy');
    if (new Date(hoy.getTime() - 864e5).toDateString() === d.toDateString()) return T('Ayer');
    return UI.diaCorto(d) + ' ' + UI.fechaCorta(ts);
  }

  /* Lo que hay que escribir en la acción Texto del atajo. Va en el idioma de
     la app porque es lo que el usuario copia tal cual: en un iPhone en inglés
     las acciones se llaman Steps y Sleep, y copiar nombres en español obligaría
     a traducirlos a mano. El módulo lee los dos, así que cualquiera vale. */
  function plantillaAtajo() {
    return ['Pasos', 'Pulso en reposo', 'Sueño', 'Calorías activas', 'Peso']
      .map(function (c) { return T(c) + ': [' + T(c) + ']'; })
      .join('\n');
  }

  function numero(v, dec) {
    const n = Number(v) || 0;
    return dec ? UI.num(Math.round(n * 10) / 10) : UI.num(Math.round(n));
  }

  /* ---------- en vivo ---------- */

  function bloqueVivo() {
    const e = Reloj.estado();

    if (!Reloj.soportaBluetooth()) {
      return html`
        <div class="card reloj-nope">
          <div class="row" style="gap:11px;align-items:flex-start">
            <span class="row-icon">${raw(icon('corazon'))}</span>
            <div class="grow">
              <b style="font-size:.92rem">${T('Pulso en vivo: aquí no')}</b>
              <p class="tiny" style="margin:5px 0 0">${Reloj.porQueNoBluetooth()}</p>
            </div>
          </div>
        </div>`;
    }

    if (!e.conectado) {
      return html`
        <div class="card">
          <div class="row between" style="align-items:flex-start;gap:12px">
            <div class="grow">
              <b>${T('Pulso en vivo')}</b>
              <p class="tiny" style="margin:5px 0 0">${T('Conecta una banda de pecho, ' +
                'una pulsera o un reloj que emita pulso y lo verás mientras entrenas, ' +
                'con el medio y el máximo guardados en la sesión.')}</p>
            </div>
            <button class="btn primary sm" data-a="conectar">${T('Buscar')}</button>
          </div>
        </div>`;
    }

    return html`
      <div class="card vivo">
        <div class="row between">
          <div class="row" style="gap:10px;align-items:center">
            <span class="vivo-pulso">${raw(icon('corazon'))}</span>
            <div>
              <div class="vivo-bpm">${e.pulso || '--'}<span>ppm</span></div>
              <div class="tiny">${esc(e.nombre)}${raw(e.bateria != null
                ? ' · ' + e.bateria + '%' : '')}</div>
            </div>
          </div>
          <button class="btn sm" data-a="desconectar">${T('Soltar')}</button>
        </div>
        ${raw(e.muestras ? html`
          <div class="row" style="gap:14px;margin-top:11px">
            <span class="chip">${T('Medio')} ${e.medio} ppm</span>
            <span class="chip">${T('Máximo')} ${e.max} ppm</span>
            <span class="tiny">${Tp(e.muestras, '{n} lectura', '{n} lecturas')}</span>
          </div>` : '')}
      </div>`;
  }

  /* ---------- lo medido ---------- */

  function bloqueDatos() {
    const dias = Reloj.dias();
    if (!dias.length) return '';

    const r = Reloj.resumen(30);
    const disponibles = Object.keys(MEDIDAS).filter(function (k) { return r[k]; });
    if (!disponibles.length) return '';
    if (disponibles.indexOf(metrica) === -1) metrica = disponibles[0];

    const def = MEDIDAS[metrica];
    const ultimos = dias.slice(-30).filter(function (d) { return Number(d[metrica]) > 0; });
    const puntos = ultimos.map(function (d) {
      return { y: Number(d[metrica]), etiqueta: UI.fechaCorta(d.t) };
    });
    const ultimo = ultimos.length ? ultimos[ultimos.length - 1] : null;

    return html`
      <div class="list-head">
        <span class="list-title">${T('Lo que ha medido')}</span>
        <span class="tiny">${Tp(dias.length, '{n} día', '{n} días')}</span>
      </div>

      <div class="pill-scroll">
        ${raw(disponibles.map(function (k) {
          return '<button class="chip ' + (k === metrica ? 'on' : '') + '" data-medida="' +
            k + '">' + esc(T(MEDIDAS[k].label)) + '</button>';
        }).join(''))}
      </div>

      <div class="card graf-caja" style="margin-top:10px">
        <div class="row between" style="align-items:flex-end;margin-bottom:6px">
          <div>
            <div class="graf-dato">${numero(ultimo ? ultimo[metrica] : 0, def.dec)}<span
              style="font-size:.9rem;font-weight:600">${raw(esc(def.unidad))}</span></div>
            <div class="tiny">${ultimo ? etiquetaDia(ultimo.t) : ''}</div>
          </div>
          <span class="chip">${T('Media')} ${numero(r[metrica].media, def.dec)}${raw(esc(def.unidad))}</span>
        </div>
        ${raw(puntos.length > 1 ? Graficos.grafica(puntos)
          : '<p class="tiny">' + T('Con un solo día todavía no hay curva que dibujar.') + '</p>')}
      </div>

      <div class="stack" style="margin-top:11px">
        ${raw(dias.slice(-7).reverse().map(function (d) {
          const partes = Object.keys(MEDIDAS)
            .filter(function (k) { return Number(d[k]) > 0; })
            .slice(0, 4)
            .map(function (k) {
              return numero(d[k], MEDIDAS[k].dec) + (MEDIDAS[k].unidad || '') + ' ' +
                T(MEDIDAS[k].label).toLowerCase();
            });
          return html`
            <div class="card row between">
              <div class="grow">
                <div style="font-weight:600;font-size:.86rem">${etiquetaDia(d.t)}</div>
                <div class="tiny">${partes.join(' · ')}</div>
              </div>
              ${raw(d.fuente ? '<span class="chip tiny-chip">' + esc(T(d.fuente)) + '</span>' : '')}
            </div>`;
        }).join(''))}
      </div>`;
  }

  /* ---------- traer datos ---------- */

  function bloqueTraer() {
    const destino = Reloj.destinoAtajo();

    return html`
      <div class="list-title">${T('Traer datos del reloj')}</div>

      <div class="card">
        <div class="row" style="gap:11px;align-items:flex-start">
          <span class="row-icon">${raw(icon('down'))}</span>
          <div class="grow">
            <b style="font-size:.92rem">${T('Desde un archivo')}</b>
            <p class="tiny" style="margin:5px 0 0">${T('Vale el export.xml de Salud de ' +
              'Apple, y los .gpx, .tcx, .csv o .json que exporte cualquier reloj.')}</p>
          </div>
        </div>
        <input type="file" id="reloj-archivo" accept=".xml,.gpx,.tcx,.csv,.json,.txt" hidden>
        <button class="btn block" data-a="elegir" style="margin-top:11px"
                ${leyendo ? 'disabled' : ''}>
          ${leyendo ? Tn('Leyendo… {p}%', { p: progreso }) : T('Elegir archivo')}</button>
        ${raw(leyendo ? '<div class="dl" style="margin-top:9px"><i style="width:' +
          progreso + '%"></i></div>' : '')}
      </div>

      <div class="card">
        <div class="row between" style="align-items:flex-start;gap:12px">
          <div class="grow">
            <b style="font-size:.92rem">${T('Desde Salud, con un atajo (iPhone)')}</b>
            <p class="tiny" style="margin:5px 0 0">${T('Es la única forma automática con ' +
              'Apple Watch: un atajo lee Salud y deja aquí los datos. Se monta una vez.')}</p>
          </div>
          <button class="btn sm" data-a="verAtajo">${verAtajo ? T('Ocultar') : T('Ver cómo')}</button>
        </div>

        ${raw(verAtajo ? html`
          <div class="hr"></div>
          <ol class="instr">
            <li>${raw(T('Abre <b>Atajos</b> en el iPhone y pulsa <b>+</b> para crear uno nuevo.'))}</li>
            <li>${raw(T('Añade la acción <b>Obtener muestras de salud</b>. Elige <b>Pasos</b>, ' +
              'tipo <b>Suma</b>, periodo <b>Hoy</b>.'))}</li>
            <li>${raw(T('Repite la acción para lo que quieras traer: pulso en reposo (Promedio), ' +
              'calorías activas (Suma), sueño (Suma) y peso (El más reciente).'))}</li>
            <li>${raw(T('Añade <b>Texto</b> y escribe una línea por dato, con el resultado de ' +
              'cada acción detrás de los dos puntos:'))}
              <pre class="atajo-plantilla">${plantillaAtajo()}</pre></li>
            <li>${raw(T('Termina con <b>Copiar al portapapeles</b>. Ejecuta el atajo y vuelve ' +
              'aquí a pegarlo. Si quieres que te lo recuerde solo, en Atajos puedes ponerle ' +
              'una automatización diaria.'))}</li>
          </ol>

          <label class="tiny">${T('PEGA AQUÍ LO QUE COPIÓ EL ATAJO')}</label>
          <textarea id="reloj-pegar" rows="4" style="margin:6px 0 10px"
            placeholder="${T('Pasos')}: 8123&#10;${T('Pulso en reposo')}: 54"></textarea>
          <button class="btn primary block" data-a="pegar">${T('Guardar estos datos')}</button>

          ${raw(destino ? html`
            <div class="hr"></div>
            <p class="tiny">${T('Si te manejas con Atajos, en vez de copiar y pegar puedes ' +
              'usar <b>Obtener contenido de URL</b> y que suba solo a tu base de datos. ' +
              'Esta es la dirección:')}</p>
            <code class="tiny" style="word-break:break-all">${destino.url}</code>` : '')}
        </div>` : '')}
      </div>`;
  }

  /* ---------- vista ---------- */

  V.reloj = function () {
    /* La ayuda entra con /reloj/atajo para dejar el bloque del atajo abierto.
       Antes el enlace pulsaba el botón, y si el usuario ya lo tenía desplegado
       lo que hacía era cerrárselo: un enlace que dice «ver cómo se monta» no
       puede esconder lo que el usuario venía a ver. */
    if (App.ruta().arg === 'atajo') verAtajo = true;

    const hay = Reloj.hayDatos();
    const d = Reloj.datos();
    const fuentes = Object.keys(d.fuentes || {});

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Perfil')}</button>
      <h1>${T('Reloj y salud')}</h1>
      <p class="muted">${hay
        ? Tn('Lo que ha medido tu reloj, junto a lo que entrenas. Última entrada: {f}.',
            { f: d.ultima ? UI.fecha(d.ultima) : '—' })
        : T('Pasos, pulso, sueño y calorías de tu reloj, dentro de la app y junto a tus ' +
            'entrenamientos. Ningún dato sale de aquí.')}</p>

      ${raw(aviso ? '<div class="card" style="border-color:var(--acc)"><p style="margin:0">' +
        esc(aviso) + '</p></div>' : '')}
      ${raw(error ? '<div class="card aviso-seguridad"><p style="margin:0">' +
        esc(error) + '</p></div>' : '')}

      ${raw(bloqueVivo())}
      ${raw(bloqueDatos())}
      ${raw(bloqueTraer())}

      ${raw(fuentes.length ? html`
        <p class="tiny" style="margin-top:14px">${Tn('Fuentes usadas: {f}.',
          { f: fuentes.map(function (x) { return T(x); }).join(', ') })}
          <button class="btn sm ghost" data-a="borrar">${T('Borrar lo importado')}</button></p>`
      : '')}`;
  };

  V.reloj.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });

    bindAll(root, '[data-medida]', function (el) {
      metrica = el.dataset.medida;
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    });

    /* --- Bluetooth --- */
    bind(root, '[data-a=conectar]', function (el) {
      el.disabled = true;
      error = '';
      Reloj.conectar().then(function () {
        aviso = T('Conectado. El pulso se verá también mientras entrenas.');
        render();
      }).catch(function (e) {
        error = e.message;
        render();
      });
    });

    bind(root, '[data-a=desconectar]', function () {
      guardarMedicion();
      Reloj.desconectar();
      render();
    });

    /* mientras está conectado, el número se refresca solo */
    if (Reloj.estado().conectado) {
      const suelta = Reloj.alPulso(function (e) {
        const caja = document.querySelector('.vivo-bpm');
        if (!caja) { suelta(); return; }
        caja.innerHTML = (e.pulso || '--') + '<span>ppm</span>';
      });
    }

    /* --- archivo --- */
    const campo = root.querySelector('#reloj-archivo');
    bind(root, '[data-a=elegir]', function () { if (campo) campo.click(); });

    if (campo) {
      campo.onchange = function () {
        const file = campo.files && campo.files[0];
        if (!file) return;
        leyendo = true; progreso = 0; error = ''; aviso = '';
        render();

        Reloj.importarArchivo(file, function (p) {
          progreso = p;
          const barra = document.querySelector('.dl i');
          if (barra) barra.style.width = p + '%';
          const btn = document.querySelector('[data-a=elegir]');
          if (btn) btn.textContent = Tn('Leyendo… {p}%', { p: p });
        }).then(function (filas) {
          const n = Reloj.anotarVarios(filas, nombreFuente(file.name));
          leyendo = false;
          aviso = n
            ? Tp(n, 'Listo: {n} día importado.', 'Listo: {n} días importados.')
            : T('El archivo se leyó bien, pero no traía ningún dato nuevo.');
          render();
        }).catch(function (e) {
          leyendo = false;
          error = e.message;
          render();
        });
      };
    }

    /* --- pegado del atajo --- */
    bind(root, '[data-a=verAtajo]', function () {
      verAtajo = !verAtajo;
      /* Si se llegó por /reloj/atajo hay que soltar ese trozo de la dirección
         al cerrar: si no, el repintado vuelve a leerlo y el bloque se abre
         solo otra vez, y el botón de ocultar parece roto. */
      if (App.ruta().arg) go('reloj'); else render();
    });

    bind(root, '[data-a=pegar]', function () {
      const caja = root.querySelector('#reloj-pegar');
      if (!caja) return;
      error = ''; aviso = '';
      Reloj.pegar(caja.value).then(function (filas) {
        const n = Reloj.anotarVarios(filas, 'Atajo');
        aviso = n ? T('Guardado.') : T('Ahí no había nada que guardar.');
        render();
      }).catch(function (e) { error = e.message; render(); });
    });

    bind(root, '[data-a=borrar]', function () {
      UI.confirm(T('Borrar lo importado'),
        T('Se quitan los datos traídos del reloj. Tus entrenamientos no se tocan.'),
        T('Borrar'), true).then(function (ok) {
        if (ok) { Reloj.borrarTodo(); aviso = ''; render(); }
      });
    });
  };

  /* El nombre de la fuente sale del archivo: así en la lista se ve de dónde
     vino cada día sin tener que abrir nada. */
  function nombreFuente(nombre) {
    const n = (nombre || '').toLowerCase();
    if (/export/.test(n) || /\.xml$/.test(n)) return 'Salud';
    if (/\.tcx$/.test(n)) return 'TCX';
    if (/\.gpx$/.test(n)) return 'GPX';
    if (/\.csv$/.test(n)) return 'CSV';
    return 'Archivo';
  }

  /* Al soltar la banda se guarda lo medido en el día de hoy, que si no se
     pierde el rato que ha estado puesta. */
  function guardarMedicion() {
    const m = Reloj.cerrarMedicion();
    if (!m) return;
    Reloj.anotar(Store.dayKey(Date.now()),
      { pulsoMedio: m.medio, pulsoMax: m.max }, 'Bluetooth');
  }

  g.VistaReloj = { guardarMedicion: guardarMedicion };
})(window);
