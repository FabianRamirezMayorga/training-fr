/* compartir.js — pasarle un plan o una rutina a otra persona.

   Cada usuario de la app monta su propio Supabase, así que no hay ninguna base
   común donde dejar un plan y darle un identificador. Compartir por el Supabase
   de quien envía significaría abrirle la base entera a quien recibe para que vea
   una lista de ejercicios, y montar un servidor común cuesta dinero. Así que el
   plan viaja dentro del propio enlace.

   Cabe de sobra: el catálogo de ejercicios ya está dentro de la app de quien lo
   abre, de modo que el enlace solo lleva [id, series, reps, descanso]. Un plan
   de cinco días con veinticinco ejercicios son unos 600 caracteres; siete días
   con cincuenta y seis, unos 1100. Entra en WhatsApp, en un correo y en un QR.

   Lo que recibe la otra persona es solo lectura de verdad, y no porque se le
   bloquee nada: el plan no existe en su cuenta, así que no hay qué editar, ni
   dónde apuntar series, ni cronómetro que arrancar. Lo único que puede hacer es
   quedárselo, y eso crea una copia suya que ya no tiene nada que ver con la
   nuestra. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;

  const BASE = location.origin + location.pathname;
  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  /* ---------- el envoltorio ----------
     base64url porque el payload viaja en un segmento del hash: sin «+», sin «/»
     y sin «=» nadie tiene que escaparlo por el camino. */

  function aBase64url(bytes) {
    let s = '';
    bytes.forEach(function (b) { s += String.fromCharCode(b); });
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function deBase64url(txt) {
    const s = atob(String(txt).replace(/-/g, '+').replace(/_/g, '/'));
    const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return a;
  }

  /* deflate del propio navegador: sin librerías, sin build, coste cero. Donde no
     esté —algún navegador viejo— se manda en claro con otro prefijo, que es más
     largo pero sigue cabiendo. El prefijo dice cuál de los dos es, así que un
     enlace hecho hoy se sigue leyendo mañana aunque cambie el soporte. */
  function codificar(datos) {
    const texto = JSON.stringify(datos);
    if (typeof CompressionStream === 'undefined') {
      return Promise.resolve('0' + aBase64url(new TextEncoder().encode(texto)));
    }
    const cs = new CompressionStream('deflate-raw');
    const w = cs.writable.getWriter();
    /* El escritor rechaza por su cuenta si el flujo muere, y esa promesa suelta
       sale por consola como error sin capturar aunque el fallo ya se atienda
       donde toca. */
    w.write(new TextEncoder().encode(texto)).catch(function () {});
    w.close().catch(function () {});
    return new Response(cs.readable).arrayBuffer().then(function (buf) {
      return '1' + aBase64url(new Uint8Array(buf));
    });
  }

  function descodificar(txt) {
    return new Promise(function (resolver, fallar) {
      try {
        const modo = String(txt).charAt(0);
        const cuerpo = String(txt).slice(1);
        if (modo === '0') {
          resolver(JSON.parse(new TextDecoder().decode(deBase64url(cuerpo))));
          return;
        }
        if (modo !== '1') { fallar(new Error('formato')); return; }
        const ds = new DecompressionStream('deflate-raw');
        const w = ds.writable.getWriter();
        w.write(deBase64url(cuerpo)).catch(function () {});
        w.close().catch(function () {});
        new Response(ds.readable).text().then(function (t) {
          resolver(JSON.parse(t));
        }).catch(fallar);
      } catch (e) { fallar(e); }
    });
  }

  /* ---------- lo que se mete en el enlace ----------
     Solo entrenamiento: ejercicio, series, repeticiones y descanso. El nombre de
     quien lo manda y las notas van aparte porque son suyos, y se preguntan. */
  function empaquetar(rutinas, nombre, de, conNotas) {
    return {
      v: 1,
      n: nombre,
      de: de || '',
      r: rutinas.map(function (r) {
        return [
          (r.days || []).join(','),
          (r.exercises || []).map(function (e) {
            const fila = [e.exId, e.sets, e.reps, e.rest];
            if (conNotas && e.note) fila.push(e.note);
            return fila;
          })
        ];
      })
    };
  }

  function enlaceDe(payload) { return BASE + '#/ver/' + payload; }

  /* ---------- las hojas de compartir ---------- */

  function hoja(titulo, rutinas, nombreSugerido) {
    const ejercicios = rutinas.reduce(function (n, r) { return n + r.exercises.length; }, 0);
    const notas = rutinas.reduce(function (n, r) {
      return n + r.exercises.filter(function (e) { return e.note; }).length;
    }, 0);

    let conNotas = false;
    let de = String(Store.settings().name || '').trim();

    UI.modal(html`
      <h2>${titulo}</h2>
      <p class="muted">Se crea un enlace que lleva el entrenamiento dentro.
        Quien lo abra lo ve, pero no puede tocarlo ni apuntar nada: no es su plan,
        es una copia de lectura.</p>

      <div class="card">
        ${raw(rutinas.map(function (r) {
          return '<div class="row between" style="padding:4px 0;gap:10px">' +
            '<span style="font-size:.86rem">' + esc(App.tituloRutina(r)) + '</span>' +
            '<span class="tiny">' + r.exercises.length + ' ejercicios</span></div>';
        }).join(''))}
      </div>

      <div class="tiny" style="margin:14px 0 6px">QUÉ VIAJA EN EL ENLACE</div>
      <p class="tiny" style="margin:0">Los ${ejercicios} ejercicios con sus series,
        repeticiones y descansos. Nada más: ni tus entrenamientos, ni tus pesos,
        ni tu comida, ni tu perfil.</p>

      <label class="row" style="gap:9px;align-items:center;margin-top:14px">
        <input type="checkbox" id="cp-de-on" ${de ? 'checked' : ''}>
        <span style="font-size:.88rem">Decir que es mío</span>
      </label>
      <input id="cp-de" class="input" value="${de}" maxlength="30"
             placeholder="Tu nombre" style="margin-top:7px">

      ${raw(notas ? html`
      <label class="row" style="gap:9px;align-items:center;margin-top:14px">
        <input type="checkbox" id="cp-notas">
        <span style="font-size:.88rem">Incluir mis notas</span>
      </label>
      <p class="tiny" style="margin:5px 0 0">Tienes ${notas}
        ${notas === 1 ? 'nota escrita' : 'notas escritas'} en estos ejercicios. Van
        fuera salvo que lo marques, por si hay algo tuyo dentro.</p>` : '')}

      <p class="tiny" style="margin:14px 0 0"><b>Antes de mandarlo:</b> quien tenga
        el enlace lo verá siempre, no se puede retirar. Y es una foto de hoy: si
        mañana cambias el plan, el enlace sigue enseñando lo de ahora.</p>

      <div id="cp-salida" hidden style="margin-top:14px">
        <div class="tiny" style="margin-bottom:6px">TU ENLACE</div>
        <textarea id="cp-url" class="input" rows="3" readonly
                  style="font-size:.74rem;word-break:break-all"></textarea>
        <div class="row" style="gap:8px;margin-top:8px">
          <button class="btn sm grow" id="cp-copiar">${raw(icon('copiar'))} Copiar</button>
          <button class="btn sm grow primary" id="cp-enviar" hidden>Compartir</button>
        </div>
      </div>

      <button class="btn primary block" id="cp-ok" style="margin-top:16px">
        Crear el enlace</button>
      <button class="btn ghost block" id="cp-no" style="margin-top:8px">Cerrar</button>`,
      function (el) {
        const campoDe = el.querySelector('#cp-de');
        const deOn = el.querySelector('#cp-de-on');
        const chkNotas = el.querySelector('#cp-notas');
        const salida = el.querySelector('#cp-salida');
        const area = el.querySelector('#cp-url');
        const enviar = el.querySelector('#cp-enviar');

        campoDe.disabled = !deOn.checked;
        deOn.onchange = function () { campoDe.disabled = !deOn.checked; };

        el.querySelector('#cp-no').onclick = function () { UI.closeModal(); };

        el.querySelector('#cp-ok').onclick = function () {
          conNotas = !!(chkNotas && chkNotas.checked);
          de = deOn.checked ? String(campoDe.value || '').trim() : '';

          codificar(empaquetar(rutinas, nombreSugerido, de, conNotas))
            .then(function (p) {
              const url = enlaceDe(p);
              area.value = url;
              salida.hidden = false;
              el.querySelector('#cp-ok').textContent = 'Rehacer el enlace';

              if (navigator.share) {
                enviar.hidden = false;
                enviar.onclick = function () {
                  navigator.share({ title: nombreSugerido, text: 'Mira este plan', url: url })
                    .catch(function () {});
                };
              }
            })
            .catch(function () { UI.toast('No se ha podido crear el enlace'); });
        };

        el.querySelector('#cp-copiar').onclick = function () {
          area.select();
          const listo = function () { UI.toast('Enlace copiado'); };
          if (navigator.clipboard) {
            navigator.clipboard.writeText(area.value).then(listo, function () {
              document.execCommand('copy'); listo();
            });
          } else { document.execCommand('copy'); listo(); }
        };
      });
  }

  function compartirRutina(id) {
    const r = Store.routine(id);
    if (!r) { UI.toast('Esa rutina ya no está'); return; }
    if (!r.exercises.length) { UI.toast('Esa rutina no tiene ejercicios'); return; }
    hoja('Compartir rutina', [r], App.nombreRutina(r));
  }

  function compartirPlan(nombre) {
    const suyas = Store.routines().filter(function (r) {
      return (r.days || []).length && App.nombreRutina(r) === nombre && r.exercises.length;
    }).sort(function (a, b) {
      return DIAS.indexOf((a.days || [])[0]) - DIAS.indexOf((b.days || [])[0]);
    });
    if (!suyas.length) { UI.toast('Ese plan no tiene nada que compartir'); return; }
    hoja('Compartir «' + nombre + '»', suyas, nombre);
  }

  /* ---------- la vista de quien recibe ----------
     El router es síncrono y descomprimir no lo es, así que la primera pasada
     pinta que está abriéndose y la segunda ya con el plan dentro. */

  let cache = { clave: null, datos: null, error: null };

  function vistaVer() {
    const clave = (g.App && App.ruta && App.ruta().arg) || null;

    if (!clave) {
      return html`<h1>Enlace incompleto</h1>
        <p class="muted">Este enlace no trae ningún plan dentro. Pídele a quien te
        lo mandó que lo copie entero: suelen cortarse al pegarlos.</p>
        <button class="btn block" data-a="acasa" style="margin-top:14px">Ir a mi app</button>`;
    }

    if (cache.clave !== clave) {
      return html`<h1>Abriendo el plan…</h1>
        <p class="muted">Un segundo.</p>`;
    }

    if (cache.error) {
      return html`<h1>Este enlace no se puede leer</h1>
        <p class="muted">O se ha cortado al copiarlo, o se hizo con una versión de
        la app muy distinta a esta. Pide que te lo manden otra vez.</p>
        <button class="btn block" data-a="acasa" style="margin-top:14px">Ir a mi app</button>`;
    }

    const d = cache.datos;
    const sesiones = d.r.map(function (par) {
      return {
        dias: String(par[0] || '').split(',').filter(Boolean),
        ejercicios: par[1].map(function (f) {
          return { ex: Data.get(f[0]), sets: f[1], reps: f[2], rest: f[3], note: f[4] || '' };
        }).filter(function (x) { return x.ex; })
      };
    });

    const total = sesiones.reduce(function (n, s) { return n + s.ejercicios.length; }, 0);
    const perdidos = d.r.reduce(function (n, p) { return n + p[1].length; }, 0) - total;

    /* El mismo reparto que se enseña dentro de la app, con las series directas
       separadas de las que caen de rebote. */
    const directas = {};
    sesiones.forEach(function (s) {
      s.ejercicios.forEach(function (e) {
        (e.ex.primaryMuscles || []).forEach(function (m) {
          directas[m] = (directas[m] || 0) + e.sets;
        });
      });
    });
    const reparto = Object.keys(directas).sort(function (a, b) {
      return directas[b] - directas[a];
    }).slice(0, 8);

    return html`
      <h1>${d.n || 'Plan compartido'}</h1>
      <p class="muted">${d.de ? 'Te lo ha pasado ' + d.de + '. ' : ''}Son
        ${sesiones.length} ${sesiones.length === 1 ? 'sesión' : 'sesiones'} y
        ${total} ${total === 1 ? 'ejercicio' : 'ejercicios'}.</p>

      <div class="card" style="margin-top:12px">
        <b>Esto es solo para verlo</b>
        <p class="tiny" style="margin:6px 0 0">No está en tu cuenta, así que no hay
        nada que editar ni que apuntar aquí. Si te gusta, quédatelo abajo y pasa a
        ser tuyo: a partir de ahí lo cambias como quieras.</p>
      </div>

      ${raw(perdidos ? '<div class="card" style="margin-top:10px"><b>Faltan ' + perdidos +
        ' ejercicios</b><p class="tiny" style="margin:6px 0 0">No están en el catálogo ' +
        'de esta app. El resto se ve entero.</p></div>' : '')}

      ${raw(reparto.length ? html`
        <div class="list-title">Series por músculo a la semana</div>
        <div class="card">
          ${raw(reparto.map(function (m) {
            return '<div class="row between" style="padding:3px 0;gap:10px">' +
              '<span style="font-size:.86rem">' + esc(I18N.muscle(m)) + '</span>' +
              '<span class="tiny">' + directas[m] + '</span></div>';
          }).join(''))}
        </div>` : '')}

      <div class="list-title">El plan</div>
      <div class="stack">
        ${raw(sesiones.map(function (s, i) {
          return html`
            <div class="card" style="padding:0;overflow:hidden">
              <div style="padding:13px 13px 9px">
                <div class="rt-titulo">${s.dias.length
                  ? s.dias.map(UI.diaLargo).join(' y ')
                  : 'Sesión ' + (i + 1)}</div>
                <div class="tiny" style="margin-top:3px">${s.ejercicios.length} ejercicios</div>
              </div>
              <div class="rt-detalle">
                ${raw(s.ejercicios.map(function (e, k) {
                  return html`
                    <button class="rt-item" data-ver="${e.ex.id}" style="width:100%;text-align:left">
                      <img src="${Data.img(e.ex, 0)}" alt="" loading="lazy">
                      <div class="grow">
                        <div style="font-weight:600;font-size:.85rem">${k + 1}. ${e.ex.nameEs}</div>
                        <div class="tiny">${e.sets} × ${e.reps} · ${e.rest}s de descanso${raw(
                          e.ex.primaryMuscles.length
                            ? ' · ' + esc(e.ex.primaryMuscles.map(I18N.muscle).join(', ')) : '')}</div>
                        ${raw(e.note ? '<div class="tiny" style="margin-top:3px;opacity:.85">' +
                          esc(e.note) + '</div>' : '')}
                      </div>
                    </button>`;
                }).join(''))}
              </div>
            </div>`;
        }).join(''))}
      </div>

      <button class="btn primary block" data-a="quedarmelo" style="margin-top:16px">
        ${raw(icon('copiar'))} Guardarlo en mis rutinas</button>
      <button class="btn ghost block" data-a="acasa" style="margin-top:8px">Ir a mi app</button>
      <p class="tiny center" style="margin:10px 4px 0">Al guardarlo se crea una copia
        tuya. Lo que hagas con ella no le llega a quien te lo pasó.</p>`;
  }

  vistaVer.mount = function (root) {
    const clave = (g.App && App.ruta && App.ruta().arg) || null;

    if (clave && cache.clave !== clave) {
      descodificar(clave).then(function (d) {
        if (!d || !d.r || !d.r.length) throw new Error('vacío');
        cache = { clave: clave, datos: d, error: null };
        App.render();
      }).catch(function () {
        cache = { clave: clave, datos: null, error: true };
        App.render();
      });
      return;
    }

    root.querySelectorAll('[data-ver]').forEach(function (b) {
      b.onclick = function () { location.hash = '#/ejercicio/' + b.dataset.ver; };
    });

    const casa = root.querySelector('[data-a=acasa]');
    if (casa) casa.onclick = function () { location.hash = '#/inicio'; };

    const mio = root.querySelector('[data-a=quedarmelo]');
    if (mio) mio.onclick = function () { quedarmelo(cache.datos); };
  };

  /* Quedárselo no es editar lo del otro: se crea una copia propia, y nace sin
     días puestos para no pisar lo que ya se entrena esa semana. */
  function quedarmelo(d) {
    if (!d) return;

    let nombre = d.n || 'Plan compartido';
    while (Store.routines().some(function (r) { return App.nombreRutina(r) === nombre; })) {
      nombre = nombre + ' (copia)';
    }

    /* El día es parte del plan: quitarlo siempre obligaba a recolocar cinco
       rutinas a mano justo cuando lo normal —quien estrena la app con el plan
       que le han pasado— es no tener nada en esos días. Se conserva el día
       donde esté libre y se deja sin él donde ya haya algo, que es lo único que
       de verdad estorba. */
    const ocupados = {};
    Store.routines().forEach(function (r) {
      (r.days || []).forEach(function (x) { ocupados[x] = true; });
    });
    const diasDe = d.r.map(function (par) {
      return String(par[0] || '').split(',').filter(function (x) {
        return x && DIAS.indexOf(x) !== -1 && !ocupados[x];
      });
    });
    const total = d.r.length;
    const libres = diasDe.filter(function (x) { return x.length; }).length;

    UI.modal(html`
      <h2>Guardarlo como mío</h2>
      <p class="muted">Se crean ${d.r.length}
        ${d.r.length === 1 ? 'rutina' : 'rutinas'} en tus rutinas. A partir de ahí
        son tuyas: las editas, les pones los días y las entrenas.</p>

      <div class="tiny" style="margin:14px 0 6px">CÓMO LO LLAMO</div>
      <input id="qm-nombre" class="input" value="${nombre}" maxlength="40">
      <p class="tiny" style="margin:7px 0 0">${libres === total
        ? 'Cada rutina se queda con el día que tenía en el plan original, porque ' +
          'ninguno de esos días lo tienes ocupado.'
        : libres
          ? 'De las ' + total + ', ' + libres + ' se quedan con su día original; el ' +
            'resto entra sin día para no pisar lo que ya entrenas. Se los pones tú ' +
            'cuando decidas qué dejas.'
          : 'Entran sin día asignado: esos días ya los tienes ocupados y dos rutinas ' +
            'el mismo día se pisan. Ábrelas y colócalas cuando decidas.'}</p>

      <button class="btn primary block" id="qm-ok" style="margin-top:16px">Guardar</button>
      <button class="btn ghost block" id="qm-no" style="margin-top:8px">Cancelar</button>`,
      function (el) {
        el.querySelector('#qm-no').onclick = function () { UI.closeModal(); };
        el.querySelector('#qm-ok').onclick = function () {
          const destino = String(el.querySelector('#qm-nombre').value || '').trim();
          if (!destino) { UI.toast('Ponle un nombre'); return; }

          let creadas = 0;
          d.r.forEach(function (par, i) {
            const exercises = par[1].map(function (f) {
              const ex = Data.get(f[0]);
              if (!ex) return null;
              return { exId: f[0], sets: f[1], reps: f[2], weight: 0, rest: f[3], note: f[4] || '' };
            }).filter(Boolean);
            if (!exercises.length) return;

            const dias = diasDe[i];
            const largos = dias.map(UI.diaLargo);
            Store.saveRoutine({
              name: largos.length ? largos.join(' y ') + ' · ' + destino : destino,
              days: dias, note: '', exercises: exercises
            });
            creadas++;
          });

          UI.closeModal();
          location.hash = '#/rutinas';
          UI.toast(creadas + (creadas === 1 ? ' rutina guardada' : ' rutinas guardadas'));
        };
      });
  }

  g.VISTAS = g.VISTAS || {};
  g.VISTAS.ver = vistaVer;

  g.Compartir = {
    codificar: codificar,
    descodificar: descodificar,
    enlaceDe: enlaceDe,
    compartirRutina: compartirRutina,
    compartirPlan: compartirPlan
  };
})(window);
