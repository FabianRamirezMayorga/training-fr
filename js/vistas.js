/* vistas.js — perfil, objetivos, alertas, nutrición, entrenador con IA y música.
   Se registran en g.VISTAS y el router de app.js las recoge. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  /* Fila de lista agrupada, al estilo de Ajustes de iOS */
  function fila(opciones) {
    const o = opciones || {};
    return html`
      <div class="list-row ${o.accion ? 'tap' : ''}" ${raw(o.accion ? 'data-fila="' + esc(o.accion) + '"' : '')}>
        ${raw(o.icono ? '<span class="row-icon">' + icon(o.icono) + '</span>' : '')}
        <div class="grow">
          <div class="list-row-title">${o.titulo}</div>
          ${raw(o.sub ? '<div class="list-row-sub">' + esc(o.sub) + '</div>' : '')}
        </div>
        ${raw(o.valor ? '<span class="list-row-val">' + esc(o.valor) + '</span>' : '')}
        ${raw(o.derecha || '')}
        ${raw(o.accion ? '<span class="chevron">' + icon('chevron') + '</span>' : '')}
      </div>`;
  }

  /* ================= perfil (índice) ================= */

  /* ---------- la cabecera del perfil ----------
     Eran tres cajas con tres numeros sueltos, y en la pantalla que se llama
     «Perfil» no salia por ninguna parte quien eres: ni tu nombre ni tus datos,
     solo kilos, IMC y calorias.

     Ahora es una tarjeta de identidad: la inicial, el nombre y la linea de
     siempre —edad, sexo, altura—, y debajo las tres cifras en una tira con sus
     separadores, que es como se leen tres datos de la misma persona y no tres
     cosas distintas. El IMC va con su categoria del color que le toca: en
     naranja si estas fuera de rango, que para eso se calcula.

     Toda la tarjeta lleva a tus datos: es lo que uno quiere tocar al verla. */
  function cabeceraPerfil(p, m, v, cat) {
    const nombre = String(Store.settings().name || '').trim();
    const inicial = nombre ? nombre.charAt(0).toUpperCase() : '';
    const t = Perfil.tendencia(30);
    const sexo = p.sexo === 'mujer' ? 'Mujer' : p.sexo === 'hombre' ? 'Hombre' : '';

    const partes = [];
    if (p.edad) partes.push(p.edad + ' años');
    if (sexo) partes.push(sexo);
    if (p.altura) partes.push(p.altura + ' cm');

    return html`
      <div class="card tarjeta-premium perfil-cab" data-a="datos" role="button" tabindex="0">
        <div class="row" style="gap:12px;align-items:center">
          <span class="pc-avatar">${raw(inicial || icon('perfil'))}</span>
          <span class="grow" style="min-width:0">
            <span class="pc-nombre">${nombre || 'Sin nombre'}</span>
            <span class="pc-sub">${partes.join(' · ') || 'Completa tus datos'}</span>
          </span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </div>

        <div class="pc-tira">
          <div class="pc-dato">
            <b>${UI.num(p.peso)}<span class="pc-u">${Store.settings().unit || 'kg'}</span></b>
            <span class="tiny">${raw(t
              ? (t.dif > 0 ? '+' : '') + String(Math.round(t.dif * 10) / 10).replace('.', ',') +
                ' en 30 d\u00edas'
              : 'peso de hoy')}</span>
          </div>
          <div class="pc-dato">
            <b>${String(v.toFixed(1)).replace('.', ',')}</b>
            <span class="tiny pc-imc ${esc(cat.tono)}">${esc(cat.label)}</span>
          </div>
          <div class="pc-dato">
            <b>${m ? UI.num(m.kcal) : '—'}</b>
            <span class="tiny">kcal al día</span>
          </div>
        </div>
      </div>`;
  }

  V.perfil = function () {
    const p = Perfil.datos();
    const listo = Perfil.completo(p);
    const m = listo ? Perfil.macros(p) : null;
    const v = listo ? Perfil.imc(p) : null;
    const cat = Perfil.categoriaIMC(v);
    const metas = Objetivos.lista();
    const cumplidas = metas.filter(function (x) { return x.logrado; }).length;
    const alertas = Alertas.lista().filter(function (a) { return a.activa; }).length;

    return html`
      <h1>Perfil</h1>

      ${raw(listo ? cabeceraPerfil(p, m, v, cat) : html`
        <div class="card tarjeta-premium">
          <div class="pre-encima">Falta lo principal</div>
          <div class="pre-num" style="margin:2px 0 8px">Completa tus datos</div>
          <p class="muted" style="margin-bottom:12px;font-size:.88rem">Con tu peso, altura,
          edad y hábitos puedo calcular tus calorías, ajustar las rutinas y prepararte el
          plan de comidas.</p>
          <button class="btn primary block" data-a="datos">Empezar</button>
        </div>`)}

      ${raw(Modo.franjaInvitado())}

      <div class="list-title">Tú</div>
      <div class="list">
        ${raw(fila({ icono: 'perfil', titulo: 'Datos y hábitos', accion: 'datos',
          sub: !Store.settings().name ? 'Dime tu nombre para empezar'
            : listo ? Store.settings().name + ' · ' + p.edad + ' años · ' +
              Perfil.ACTIVIDAD[p.actividad].label
            : 'Sin completar' }))}
        ${raw(fila({ icono: 'trofeo', titulo: 'Objetivos', accion: 'objetivos',
          sub: metas.length ? metas.length + ' en marcha · ' + cumplidas + ' cumplidos'
            : 'Ninguno todavía' }))}
        ${raw(fila({ icono: 'nutricion', titulo: 'Alimentación', accion: 'nutricion',
          sub: m ? m.kcal + ' kcal · ' + m.prot + ' g de proteína' : 'Necesita tus datos' }))}
        ${raw(fila({ icono: 'campana', titulo: 'Alertas', accion: 'alertas',
          sub: alertas ? alertas + (alertas === 1 ? ' recordatorio activo' : ' recordatorios activos')
            : 'Sin recordatorios' }))}
      </div>

      <div class="list-title">Entrenamiento</div>
      <div class="list">
        ${raw(fila({ icono: 'chispa', titulo: 'Entrenador con IA', accion: 'entrenador',
          sub: IA.activa() ? 'Listo para usar' : 'Sin configurar' }))}
        ${raw(fila({ icono: 'musica', titulo: 'Música', accion: 'musica',
          sub: Spotify.activa() ? 'Spotify conectado'
            : Spotify.configurado() ? 'Sin conectar' : 'Sin configurar' }))}
        ${raw(fila({ icono: 'dumbbell', titulo: 'Dónde entrenas', accion: 'lugar',
          valor: (Data.GEAR[Store.settings().gear] || {}).label }))}
      </div>

      <div class="list-title">Aplicación</div>
      <div class="list">
        ${raw(fila({ icono: 'nube', titulo: 'Mi cuenta', accion: 'cuenta',
          sub: Sync.activa() ? Sync.email() : 'Sin sincronizar' }))}
        ${raw(fila({ icono: 'timer', titulo: 'Ajustes', accion: 'ajustes',
          sub: 'Unidades, tema, descanso, copias y sin conexión' }))}
        ${raw(g.Admin && Admin.administra()
          ? fila({ icono: 'llave', titulo: 'Cuentas', accion: 'usuarios',
              sub: 'Crear, desactivar y borrar cuentas del proyecto' })
          : '')}
      </div>

      <p class="tiny" style="margin:22px 0 0">Training FR</p>`;
  };

  V.perfil.mount = function (root) {
    const ir = { datos: 'datos', objetivos: 'objetivos', nutricion: 'nutricion',
      alertas: 'alertas', entrenador: 'entrenador', musica: 'musica',
      cuenta: 'cuenta', ajustes: 'ajustes', usuarios: 'usuarios' };

    /* Se pregunta al servidor si esta cuenta administra; mientras no conteste,
       la entrada no está. Enseñarla o no es comodidad: el permiso lo decide la
       función, no esta pantalla. */
    if (g.Admin && !Admin.administra()) {
      Admin.comprobar().then(function (si) { if (si) render(); });
    }
    bindAll(root, '[data-fila]', function (el) {
      const d = el.dataset.fila;
      if (d === 'lugar') return App.lugarSheet();
      go(ir[d] || 'ajustes');
    });
    bind(root, '[data-a=datos]', function () { go('datos'); });
    bind(root, '[data-a=irCuenta]', function () { go('cuenta'); });
  };

  /* ================= datos y hábitos ================= */

  /* «la edad» / «la edad y el peso» / «la edad, el peso y la altura» */
  function listaEs(xs) {
    if (xs.length === 1) return esc(xs[0]);
    return esc(xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1]);
  }

  /* ---------- datos y habitos ----------
     Una lista agrupada, como las de Ajustes: el nombre del campo a la
     izquierda, su valor a la derecha y la explicacion debajo en pequeno.

     Con dos modos, que es lo que faltaba: de entrada la pantalla solo SE LEE
     —los datos son texto, no cajas—, y hasta que no se pulsa Editar no se
     puede tocar nada. Un formulario de veinte campos siempre abierto invita a
     cambiar algo sin querer, y aqui de estos numeros salen las calorias y los
     ejercicios que se proponen.

     Al editar se guarda una copia: Cancelar la devuelve entera. Guardar no
     tiene que escribir nada —cada campo ya se guardo al salir de el— y lo que
     hace es cerrar el modo y decirlo. */
  let editandoDatos = false;
  let copiaDatos = null;

  V.datos = function () {
    const p = Perfil.datos();
    const faltan = Perfil.loQueFalta(p);
    const horas = Perfil.horasDeSueno(p.acostar, p.despertar);
    const edita = editandoDatos;
    const ritmo = Perfil.ritmoActual(p);

    const grupo = function (titulo, contenido) {
      return '<div class="list-title">' + esc(titulo) + '</div>' +
        '<div class="card tarjeta-premium campos">' + contenido + '</div>';
    };

    const campo = function (o) {
      return '<div class="campo">' +
        '<div class="campo-cab">' +
        '<span class="campo-tit">' + esc(o.tit) + '</span>' +
        (o.control || '') +
        '</div>' +
        (o.nota ? '<div class="campo-nota">' + o.nota + '</div>' : '') +
        (o.abajo || '') +
        '</div>';
    };

    /* Leyendo, el dato es texto. Editando, una pastilla que se escribe. */
    const valor = function (attrs, unidad, ancho, lectura) {
      if (!edita) {
        return '<span class="campo-val"><span class="campo-fijo">' +
          esc(lectura || '\u2014') + '</span>' +
          (unidad ? '<span class="val-u">' + esc(unidad) + '</span>' : '') + '</span>';
      }
      return '<span class="campo-val">' +
        '<input class="val-in" style="width:' + (ancho || 74) + 'px" ' + attrs + '>' +
        (unidad ? '<span class="val-u">' + esc(unidad) + '</span>' : '') + '</span>';
    };

    /* Las opciones, en filas con su explicacion y su marca de elegida: son
       cinco niveles de actividad con matiz, no cinco etiquetas sueltas. */
    const filasOpcion = function (campoId, mapa, actual) {
      return '<div class="opts">' + Object.keys(mapa).map(function (k) {
        const o = mapa[k];
        const label = typeof o === 'string' ? o : o.label;
        const nota = typeof o === 'string' ? '' : (o.note || '');
        const on = actual === k;
        if (!edita && !on) return '';
        return '<button class="opt-fila' + (on ? ' on' : '') + '"' +
          (edita ? ' data-set="' + campoId + '" data-val="' + esc(k) + '"' : ' disabled') + '>' +
          '<span class="grow"><span class="opt-tit">' + esc(label) + '</span>' +
          (nota ? '<span class="opt-sub">' + esc(nota) + '</span>' : '') + '</span>' +
          '<span class="opt-check">' + (on ? icon('check') : '') + '</span>' +
          '</button>';
      }).join('') + '</div>';
    };

    const largo = function (campoId, val, ph, lectura) {
      if (!edita) {
        return '<div class="campo-leido">' + esc(val || lectura || 'Sin poner') + '</div>';
      }
      return '<input class="campo-largo" value="' + esc(val) + '" data-txt="' + campoId +
        '" placeholder="' + esc(ph) + '">';
    };

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>

      <div class="row between" style="align-items:flex-start;gap:12px">
        <h1 style="margin:0">Datos y hábitos</h1>
        ${raw(edita ? '' : '<button class="btn sm primary" data-a="editar">' +
          icon('edit') + ' Editar</button>')}
      </div>

      <p class="muted" style="margin-top:8px">Sirven para calcular tus calorías y ajustar lo
      que te propongo. No salen de tu dispositivo salvo que actives la sincronización o el
      entrenador con IA.</p>

      ${raw(faltan.length ? html`
        <div class="card tarjeta-premium" style="border-color:var(--warn)">
          <b>Falta ${raw(listaEs(faltan))}</b>
          <p class="tiny" style="margin:6px 0 0">Sin eso no puedo calcular tus calorías ni
          ajustarte el entrenamiento. Es lo único obligatorio; lo demás lo vas rellenando
          cuando quieras.</p>
        </div>` : '')}

      ${raw(grupo('Quién soy',
        campo({
          tit: 'Mi nombre',
          control: valor('id="p-nombre" value="' + esc(Store.settings().name || '') +
            '" placeholder="Tu nombre" autocomplete="given-name"', '', 132,
            Store.settings().name),
          nota: 'Para saludarte al abrir la app y para que el entrenador con IA te hable a ' +
            'ti, no a un usuario.'
        })))}

      ${raw(grupo('Mi cuerpo',
        campo({
          tit: 'Sexo biológico',
          nota: 'Cambia la fórmula del metabolismo basal.',
          abajo: filasOpcion('sexo', { hombre: 'Hombre', mujer: 'Mujer' }, p.sexo)
        }) +
        campo({
          tit: 'Edad',
          control: valor('type="number" inputmode="numeric" min="14" max="99" value="' +
            (p.edad || '') + '" data-num="edad" placeholder="—"', 'años', 68, p.edad)
        }) +
        campo({
          tit: 'Altura',
          control: valor('type="number" inputmode="numeric" min="120" max="230" value="' +
            (p.altura || '') + '" data-num="altura" placeholder="—"', 'cm', 68, p.altura)
        }) +
        campo({
          tit: 'Peso',
          control: valor('type="number" inputmode="decimal" step="0.1" min="30" max="250" ' +
            'value="' + (p.peso || '') + '" data-num="peso" placeholder="—"',
            Store.settings().unit || 'kg', 72,
            p.peso ? String(p.peso).replace('.', ',') : '')
        }) +
        campo({
          tit: 'Grasa corporal',
          nota: 'Opcional. Si la sabes, afina el cálculo del metabolismo.',
          control: valor('type="number" inputmode="decimal" step="0.5" min="3" max="60" ' +
            'value="' + (p.grasa || '') + '" data-num="grasa" placeholder="—"', '%', 68,
            p.grasa ? String(p.grasa).replace('.', ',') : '')
        })))}

      ${raw(grupo('Mi actividad diaria',
        campo({
          tit: 'Lo que me muevo al día',
          nota: 'Sin contar el entrenamiento: es el trabajo, los recados y lo que andas.',
          abajo: filasOpcion('actividad', Perfil.ACTIVIDAD, p.actividad)
        })))}

      ${raw(grupo('Mi objetivo',
        campo({
          tit: 'Qué busco',
          abajo: filasOpcion('objetivo', Perfil.OBJETIVO, p.objetivo)
        }) +
        (p.objetivo !== 'mantener'
          ? campo({
              tit: 'A qué ritmo',
              nota: 'Unos ' + String(ritmo.kgSemana).replace('.', ',') + ' kg por semana' +
                (p.objetivo === 'perder' ? ' menos' : ' más') + '.',
              abajo: filasOpcion('ritmo', Object.assign({}, Perfil.RITMO, {
                propio: { label: 'El mío', note: 'Lo pongo yo en kilos por semana' }
              }), p.ritmo) +
              (p.ritmo === 'propio'
                ? '<div class="campo-propio">' +
                  (edita
                    ? '<input class="val-in" style="width:82px" type="number" ' +
                      'inputmode="decimal" step="0.05" min="0.1" max="1.2" value="' +
                      (p.ritmoKg || 0.45) + '" data-num="ritmoKg">'
                    : '<span class="campo-fijo">' +
                      String(p.ritmoKg || 0.45).replace('.', ',') + '</span>') +
                  '<span class="val-u">kg por semana</span></div>'
                : '')
            })
          : '')))}

      ${raw(grupo('Mi día',
        campo({
          tit: 'Me levanto',
          control: valor('type="time" value="' + (p.despertar || '07:00') +
            '" data-txt="despertar"', '', 142, p.despertar || '07:00')
        }) +
        campo({
          tit: 'Me acuesto',
          control: valor('type="time" value="' + (p.acostar || '23:00') +
            '" data-txt="acostar"', '', 142, p.acostar || '23:00'),
          nota: 'Con esto reparto los recordatorios de agua y comidas por tus horas reales, ' +
            'no por unas por defecto, y saco cuánto duermes.'
        }) +
        campo({
          tit: 'Duermo',
          control: '<span class="campo-val"><span class="campo-fijo">' +
            (horas != null ? String(horas).replace('.', ',') + ' h' : '—') + '</span></span>',
          nota: horas != null
            ? 'Sale de esas dos horas, no hace falta apuntarlo aparte.' +
              (horas < 6 ? ' Con menos de 6 h cuesta recuperar entre sesiones.' : '')
            : 'Pon las dos horas y calculo cuánto duermes.'
        }) +
        campo({
          tit: 'Comidas al día',
          control: valor('type="number" inputmode="numeric" min="2" max="7" value="' +
            p.comidas + '" data-num="comidas"', '', 62, p.comidas)
        }) +
        campo({
          tit: 'Hora a la que entreno',
          nota: 'Opcional. Si la dejas vacía, la deduzco de las horas a las que sueles entrenar.',
          control: valor('type="time" value="' + (p.horaEntreno || '') +
            '" data-txt="horaEntreno"', '', 142, p.horaEntreno || 'Sin poner')
        })))}

      ${raw(grupo('Lo mío',
        '<div class="campo campo-aviso">' +
        '<b style="font-size:.88rem">Esto es lo que más cambia lo que te propongo</b>' +
        '<p class="tiny" style="margin:5px 0 0">De estos cuatro campos salen los menús que ' +
        'te sugiero y los ejercicios que entran o no en tus rutinas. Si los dejas vacíos, ' +
        'te propongo lo de siempre para cualquiera; si los rellenas, te propongo lo tuyo.</p>' +
        '</div>' +
        campo({
          tit: 'Alimentación',
          nota: 'Ningún menú te va a ofrecer algo que no comas.',
          abajo: filasOpcion('dieta', Perfil.DIETA, p.dieta)
        }) +
        campo({
          tit: 'Alergias o alimentos que evito',
          nota: 'Quedan fuera de todo lo que te proponga, y si salen en la foto de un plato ' +
            'te aviso.',
          abajo: largo('alergias', p.alergias, 'Lactosa, frutos secos…')
        }) +
        campo({
          tit: 'Lesiones o limitaciones',
          nota: 'Lo que escribas aquí retira ejercicios de tus rutinas y de lo que te propone ' +
            'el entrenador. Es lo que evita que te ofrezca algo que te haga daño.',
          abajo: largo('lesiones', p.lesiones, 'Hombro derecho, rodilla…')
        }) +
        campo({
          tit: 'Condiciones de salud',
          nota: 'Para que el menú las tenga en cuenta. No sustituye a tu médico ni a un dietista.',
          abajo: largo('condiciones', p.condiciones || '', 'Tensión alta, colesterol, diabetes…')
        })))}

      ${raw(Perfil.completo(p) ? html`
        <div class="list-title">Mis números</div>
        <div class="card tarjeta-premium campos">
          <div class="campo">
            <div class="campo-cab">
              <span class="campo-tit">Objetivo diario</span>
              <span class="campo-val"><span class="pre-num">${UI.num(Perfil.calorias(p))}</span>
                <span class="val-u">kcal</span></span>
            </div>
            <div class="campo-nota">Es tu gasto ajustado a lo que buscas y al ritmo que has
              elegido.</div>
          </div>
          ${raw([
            { t: 'Metabolismo basal', v: UI.num(Math.round(Perfil.tmb(p))) + ' kcal' },
            { t: 'Gasto diario estimado', v: UI.num(Math.round(Perfil.tdee(p))) + ' kcal' },
            { t: 'Agua al día', v: Perfil.agua(p) + ' L' },
            { t: 'Peso saludable', v: Perfil.pesoSaludable(p).min.toFixed(0) + '–' +
              Perfil.pesoSaludable(p).max.toFixed(0) + ' kg' }
          ].map(function (x) {
            return '<div class="campo"><div class="campo-cab">' +
              '<span class="campo-tit">' + x.t + '</span>' +
              '<span class="campo-fijo">' + x.v + '</span></div></div>';
          }).join(''))}
        </div>
        <p class="tiny" style="margin-top:10px">Estimaciones para población general
        (Mifflin-St Jeor). Si tienes una condición médica, manda tu médico.</p>` : '')}

      <div style="height:${edita ? 90 : 14}px"></div>

      ${raw(edita ? html`
        <!-- La barra de guardar, fija abajo: editando, lo que uno busca con el
             pulgar es salir de aqui sin perder nada. -->
        <div class="barra-edicion">
          <button class="btn grow" data-a="cancelar">Cancelar</button>
          <button class="btn primary grow" data-a="guardar">${raw(icon('check'))} Guardar</button>
        </div>` : '')}`;
  };

  function pesoHistorial() {
    const lista = Perfil.pesajes();
    if (lista.length < 2) {
      return '<p class="tiny" style="margin:10px 0 0">Registra tu peso cada semana para ver la evolución.</p>';
    }
    const ultimos = lista.slice(-12);
    const min = Math.min.apply(null, ultimos.map(function (x) { return x.peso; }));
    const max = Math.max.apply(null, ultimos.map(function (x) { return x.peso; }));
    const rango = max - min || 1;
    const t = Perfil.tendencia(30);

    return html`
      <div class="bars" style="height:100px;margin-top:12px">
        ${raw(ultimos.map(function (x) {
          const alto = 20 + Math.round((x.peso - min) / rango * 75);
          return '<div class="b" title="' + esc(UI.num(x.peso)) + ' kg"><i style="height:' +
            alto + '%"></i><span>' + esc(UI.fechaCorta(x.fecha)) + '</span></div>';
        }).join(''))}
      </div>
      ${raw(t ? '<div class="tiny" style="margin-top:8px">' +
        (t.dif > 0 ? '+' : '') + t.dif.toFixed(1) + ' kg en 30 días</div>' : '')}`;
  }

  /* ---------- que se vea que se ha guardado ----------
     Los campos se guardaban al salir de ellos, y ahí había dos problemas: si
     escribías y te ibas de la pantalla sin salir del campo —que en un móvil es
     lo normal, se toca otra pestaña y ya está— lo escrito se perdía; y aunque
     se guardara, nada lo decía, así que uno se queda buscando un botón de
     guardar que no existe.

     Ahora se guarda mientras se escribe, con medio segundo de margen para no
     escribir en disco en cada tecla, y el propio campo lo confirma. */
  function marcaDeGuardado(inp) {
    let caja = inp.parentNode;
    if (!caja || !caja.classList || !caja.classList.contains('campo-ok')) {
      caja = document.createElement('span');
      caja.className = 'campo-ok';
      inp.parentNode.insertBefore(caja, inp);
      caja.appendChild(inp);
      const ok = document.createElement('span');
      ok.className = 'campo-ok-aviso';
      ok.textContent = 'Guardado';
      caja.appendChild(ok);
    }
    return caja.querySelector('.campo-ok-aviso');
  }

  function avisarGuardado(inp) {
    const ok = marcaDeGuardado(inp);
    if (!ok) return;
    ok.classList.remove('visible');
    /* reiniciar la animación aunque se guarde dos veces seguidas */
    void ok.offsetWidth;
    ok.classList.add('visible');
    clearTimeout(ok._t);
    ok._t = setTimeout(function () { ok.classList.remove('visible'); }, 1600);
  }

  /* Guarda sin esperar a que se salga del campo */
  function alEscribir(inp, guardar) {
    inp.addEventListener('input', function () {
      clearTimeout(inp._espera);
      inp._espera = setTimeout(function () {
        guardar();
        avisarGuardado(inp);
      }, 500);
    });
  }

  V.datos.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });

    /* Editar, guardar y cancelar. La copia se hace al entrar en edicion y
       Cancelar la devuelve entera: incluye el nombre, que no vive en el perfil
       sino en los ajustes. */
    bind(root, '[data-a=editar]', function () {
      copiaDatos = {
        perfil: JSON.parse(JSON.stringify(Perfil.datos())),
        nombre: Store.settings().name || ''
      };
      editandoDatos = true;
      render();
      UI.toast('Toca los campos para cambiarlos');
    });

    bind(root, '[data-a=guardar]', function () {
      /* Si el cursor sigue dentro de un campo, lo escrito aun no ha disparado
         su guardado: se fuerza antes de cerrar. */
      const foco = document.activeElement;
      if (foco && root.contains(foco) && (foco.dataset.txt || foco.dataset.num ||
          foco.id === 'p-nombre')) {
        foco.dispatchEvent(new Event('change', { bubbles: true }));
      }
      editandoDatos = false;
      copiaDatos = null;
      render();
      UI.toast('Guardado');
    });

    bind(root, '[data-a=cancelar]', function () {
      if (copiaDatos) {
        Perfil.guardar(copiaDatos.perfil);
        Store.setSetting('name', copiaDatos.nombre);
      }
      editandoDatos = false;
      copiaDatos = null;
      render();
      UI.toast('Sin cambios');
    });

    /* Si se sale de la pantalla con el cursor todavía dentro de un campo, el
       navegador no avisa de nada: lo escrito se quedaba sin guardar. */
    const alSalir = function () {
      const foco = document.activeElement;
      if (foco && root.contains(foco) && (foco.dataset.txt || foco.dataset.num ||
          foco.id === 'p-nombre')) {
        foco.dispatchEvent(new Event('change', { bubbles: true }));
      }
      window.removeEventListener('hashchange', alSalir);
      window.removeEventListener('pagehide', alSalir);
    };
    window.addEventListener('hashchange', alSalir);
    window.addEventListener('pagehide', alSalir);

    /* Personalizar es justo el momento de decidir dónde va a vivir todo esto */
    Modo.pedirCuenta('Vas a guardar tu peso, tus hábitos y tus limitaciones. Es lo que ' +
      'hace que las rutinas y el menú sean tuyos y no de cualquiera.');

    bindAll(root, '[data-set]', function (el) {
      const cambio = {};
      cambio[el.dataset.set] = el.dataset.val;
      Perfil.guardar(cambio);
      render();
    });

    root.querySelectorAll('[data-num]').forEach(function (inp) {
      const guardar = function () {
        const cambio = {};
        cambio[inp.dataset.num] = Number(inp.value) || 0;
        Perfil.guardar(cambio);
      };
      alEscribir(inp, guardar);
      inp.onchange = function () { guardar(); avisarGuardado(inp); render(); };
    });

    root.querySelectorAll('[data-txt]').forEach(function (inp) {
      const esHora = inp.dataset.txt === 'despertar' || inp.dataset.txt === 'acostar';
      const guardar = function () {
        const cambio = {};
        cambio[inp.dataset.txt] = inp.value.trim();
        Perfil.guardar(cambio);
      };
      if (!esHora) alEscribir(inp, guardar);
      inp.onchange = function () {
        guardar();
        avisarGuardado(inp);
        /* Las horas cambian lo que dice la pantalla —cuánto duermes—, así que hay
           que repintar. Los demás campos son texto libre y repintar solo serviría
           para dar un salto mientras se escribe. */
        if (esHora) {
          const pos = window.scrollY;
          render();
          window.scrollTo(0, pos);
        }
      };
    });

    const campoNombre = root.querySelector('#p-nombre');
    if (campoNombre) {
      const guardarNombre = function () {
        Store.setSetting('name', campoNombre.value.trim());
      };
      alEscribir(campoNombre, guardarNombre);
      campoNombre.onchange = function () {
        guardarNombre();
        avisarGuardado(campoNombre);
      };
    }

    bind(root, '[data-a=pesar]', function () {
      const campo = root.querySelector('#peso-hoy');
      const kg = Number(campo.value);
      /* El único botón de la pantalla era este, así que quien cambiaba cualquier
         otra cosa lo pulsaba creyendo que guardaba, y se encontraba con que le
         pedían un peso que no venía a poner. */
      if (!String(campo.value || '').trim()) {
        UI.toast('Lo demás ya está guardado. Esto es solo para apuntar tu peso.');
        campo.focus();
        return;
      }
      if (!kg || kg < 25 || kg > 300) { UI.toast('Escribe un peso válido'); return; }
      Perfil.registrarPeso(kg);
      Objetivos.revisar();
      render();
      UI.toast('Peso registrado');
    });
  };

  /* ================= objetivos ================= */

  V.objetivos = function () {
    const metas = Objetivos.lista();

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <div class="row between">
        <h1 style="margin:0">Objetivos</h1>
        <button class="btn primary sm" data-a="nuevo">${raw(icon('plus'))} Nuevo</button>
      </div>
      <p class="muted" style="margin-top:8px">Se actualizan solos con lo que entrenas
      y con tus pesajes. No hay que apuntar nada a mano.</p>

      ${raw(metas.length ? '<div class="stack">' + metas.map(tarjetaMeta).join('') + '</div>'
        : html`<div class="empty">${raw(icon('trofeo'))}
            <p>Ponte una meta y te enseño cuánto te falta cada vez que abras la app.</p>
            <button class="btn primary" data-a="nuevo">Crear mi primer objetivo</button>
          </div>`)}`;
  };

  function tarjetaMeta(m) {
    const p = Objetivos.progreso(m);
    const pct = Math.round(p.pct * 100);
    const pre = Objetivos.prevision(m);

    return html`
      <div class="card tarjeta-premium ${p.cumplido ? 'meta-ok' : ''}">
        <div class="row between" style="align-items:flex-start">
          <div class="grow">
            <div class="pre-encima">${Objetivos.etiqueta(m)}</div>
            <div class="pre-num" style="margin-top:2px">${Objetivos.formato(m, p.actual)}
              <span class="tiny" style="font-weight:600">de ${Objetivos.formato(m, m.meta)}</span></div>
          </div>
          ${raw(p.cumplido
            ? '<span class="chip solid">' + icon('check') + ' Cumplido</span>'
            : '<span class="chip">' + pct + '%</span>')}
          <button class="btn icon sm danger" data-del="${m.id}"
                  aria-label="Borrar objetivo">${raw(icon('trash'))}</button>
        </div>

        <div class="prog" style="margin-top:10px"><i style="width:${pct}%"></i></div>

        ${raw(previsionHTML(m, pre))}

        ${raw(m.nota ? '<div class="tiny" style="margin-top:8px">' + esc(m.nota) + '</div>' : '')}
      </div>`;
  }

  /* ---------- cuando llegas ----------
     La barra dice donde estas; esto dice cuando llegas, que es lo que se
     pregunta uno al ponerse una meta. El dibujo lleva lo que ya has hecho en
     linea continua y lo que queda en linea de puntos hasta cruzar la meta: asi
     se ve de un vistazo que la parte de la derecha es una estimacion y no un
     dato. Debajo, el ritmo del que sale, para que el numero no venga de la
     nada. */
  function previsionHTML(m, pre) {
    if (!pre || pre.cumplido) return '';

    const llega = pre.clase === 'meta' && pre.haciaMeta && pre.dias > 0;

    return html`
      <div class="meta-prevision">
        ${raw(llega ? html`
          <div class="mp-cab">
            <div>
              <div class="pre-encima">${pre.segunPlan ? 'Según tu plan' : 'Si sigues así'}</div>
              <div class="mp-cuanto">${Objetivos.cuanto(pre.dias)}</div>
            </div>
            <div class="mp-fecha">${UI.fechaCorta(pre.fecha)}</div>
          </div>` : '')}

        ${raw(graficaMeta(m, pre))}

        <p class="tiny mp-nota">${pre.frase}${raw(llega ? '. ' + salvedad(m, pre) : '')}</p>
      </div>`;
  }

  /* Por que el numero puede no cumplirse, dicho para cada meta. Antes salia la
     coletilla del peso —«los ultimos kilos cuestan mas»— tambien en la meta de
     sesiones totales, donde no significa nada. */
  function salvedad(m, pre) {
    /* Cuando el numero sale del plan y no de la bascula hay que decirlo: es una
       intencion, no una medida. */
    if (pre && pre.segunPlan) {
      return 'Sale de tu plan —tu gasto, tus calorías y el ritmo que elegiste—, ' +
        'no de la báscula. Apunta tu peso una vez por semana y paso a medir lo ' +
        'que pasa de verdad.';
    }
    if (m.tipo === 'peso') {
      return 'Es una recta sobre lo que llevas: cuenta con que los últimos kilos ' +
        'cuesten más que los primeros.';
    }
    if (m.tipo === 'marca') {
      return 'Es una recta sobre lo que llevas: la fuerza sube a tirones, no a ' +
        'ritmo constante.';
    }
    return 'Es una recta sobre lo que llevas, contando con que sigas igual.';
  }

  /* El dibujo: linea de lo hecho, punteada de lo que falta y la meta como raya
     horizontal. Sin ejes ni rejilla, que en 60px de alto solo estorban. */
  function graficaMeta(m, pre) {
    let pts = (pre.puntos || []).slice(-24);

    /* Sin historial pero con plan, el dibujo es la linea de lo que deberia
       pasar: de donde estas hoy a la meta. Toda punteada, que aqui no hay ni un
       dato medido. */
    if (pts.length < 2 && pre.segunPlan) {
      const p = Objetivos.progreso(m);
      pts = [{ t: Date.now(), v: p.actual }];
    }
    if (!pts.length) return '';
    if (pts.length < 2 && !pre.segunPlan) return '';

    const W = 280, H = 64, P = 3;
    const meta = Number(m.meta) || 0;

    const tIni = pts[0].t;
    const tFin = pre.fecha && pre.fecha > pts[pts.length - 1].t
      ? pre.fecha : pts[pts.length - 1].t;
    const anchoT = Math.max(1, tFin - tIni);

    const vals = pts.map(function (x) { return x.v; }).concat([meta]);
    const min = Math.min.apply(null, vals);
    const max = Math.max.apply(null, vals);
    const alto = Math.max(1e-6, max - min);

    const x = function (t) { return P + (t - tIni) / anchoT * (W - 2 * P); };
    const y = function (v) { return H - P - (v - min) / alto * (H - 2 * P); };

    const linea = pts.length > 1 ? pts.map(function (q, i) {
      return (i ? 'L' : 'M') + x(q.t).toFixed(1) + ' ' + y(q.v).toFixed(1);
    }).join(' ') : '';

    const ultimo = pts[pts.length - 1];
    const proyeccion = pre.fecha && pre.haciaMeta
      ? '<path class="mg-futuro" d="M' + x(ultimo.t).toFixed(1) + ' ' + y(ultimo.v).toFixed(1) +
        ' L' + x(pre.fecha).toFixed(1) + ' ' + y(meta).toFixed(1) + '"/>'
      : '';

    return '<svg class="meta-graf" viewBox="0 0 ' + W + ' ' + H + '" ' +
      'preserveAspectRatio="none" aria-label="Tu evolución y lo que falta">' +
      '<path class="mg-meta" d="M0 ' + y(meta).toFixed(1) + ' H' + W + '"/>' +
      (linea ? '<path class="mg-linea" d="' + linea + '"/>' : '') +
      proyeccion +
      '<circle class="mg-hoy" cx="' + x(ultimo.t).toFixed(1) + '" cy="' +
      y(ultimo.v).toFixed(1) + '" r="3.2"/>' +
      (pre.fecha && pre.haciaMeta
        ? '<circle class="mg-fin" cx="' + x(pre.fecha).toFixed(1) + '" cy="' +
          y(meta).toFixed(1) + '" r="3.2"/>' : '') +
      '</svg>';
  }

  V.objetivos.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bindAll(root, '[data-a=nuevo]', nuevaMetaSheet);
    bindAll(root, '[data-del]', function (el) {
      UI.confirm('Borrar objetivo', 'Se quitará de tu lista.', 'Borrar', true).then(function (ok) {
        if (ok) { Objetivos.borrar(el.dataset.del); render(); }
      });
    });
  };

  function nuevaMetaSheet() {
    let tipo = '';
    UI.modal(html`
      <h2>Nuevo objetivo</h2>
      <p class="muted">Elige qué quieres conseguir.</p>
      <div class="list" id="tipos">
        ${raw(Object.keys(Objetivos.TIPOS).map(function (k) {
          const t = Objetivos.TIPOS[k];
          return fila({ icono: t.icono, titulo: t.label, sub: t.note, accion: k });
        }).join(''))}
      </div>
      <div id="meta-detalle" style="margin-top:14px"></div>`,
      function (el) {
        el.querySelectorAll('[data-fila]').forEach(function (f) {
          f.onclick = function () {
            tipo = f.dataset.fila;
            el.querySelectorAll('[data-fila]').forEach(function (x) { x.classList.remove('sel'); });
            f.classList.add('sel');
            pintarDetalle(el, tipo);
          };
        });
      });
  }

  function pintarDetalle(el, tipo) {
    const t = Objetivos.TIPOS[tipo];
    const caja = el.querySelector('#meta-detalle');
    const actual = tipo === 'marca' ? 0 : t.actual({});

    caja.innerHTML = html`
      ${raw(tipo === 'marca' ? html`
        <label class="tiny">EJERCICIO</label>
        <select id="meta-ex" style="margin:5px 0 12px">
          ${raw(Data.search({ gear: Store.settings().gear }).slice(0, 200).map(function (ex) {
            return '<option value="' + esc(ex.id) + '">' + esc(ex.nameEs) + '</option>';
          }).join(''))}
        </select>` : '')}
      <label class="tiny">META (${esc(t.unidad)})</label>
      <input type="number" inputmode="decimal" step="0.5" id="meta-val"
             placeholder="${esc(t.unidad)}" style="margin:5px 0 12px">
      <div class="tiny" style="margin-bottom:12px">Ahora mismo vas por
        ${esc(t.formato(actual))}.</div>
      <button class="btn primary block" data-x="crear">Crear objetivo</button>`;

    caja.querySelector('[data-x=crear]').onclick = function () {
      const valor = Number(caja.querySelector('#meta-val').value);
      if (!valor) { UI.toast('Escribe la meta'); return; }
      const m = Objetivos.nuevo(tipo);
      m.meta = valor;
      if (tipo === 'marca') {
        m.exId = caja.querySelector('#meta-ex').value;
        const pr = Store.prOf(m.exId);
        m.desde = pr.best ? pr.best.weight : 0;
      } else {
        m.desde = Objetivos.TIPOS[tipo].actual(m);
      }
      Objetivos.guardar(m);
      UI.closeModal();
      render();
      UI.toast('Objetivo creado');
    };
  }

  /* ================= alertas ================= */

  V.alertas = function () {
    const lista = Alertas.lista();
    const permiso = Alertas.permiso();

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <div class="row between">
        <h1 style="margin:0">Alertas</h1>
        <button class="btn primary sm" data-a="nueva">${raw(icon('plus'))} Nueva</button>
      </div>

      ${raw(permiso === 'granted' ? '' : html`
        <div class="card" style="margin-top:12px;border-color:var(--acc)">
          <div style="font-weight:600;margin-bottom:4px">Permite los avisos</div>
          <p class="muted" style="margin-bottom:10px">Sin permiso solo verás los
          recordatorios dentro de la app.</p>
          <button class="btn primary block" data-a="permiso"
            ${permiso === 'denied' ? 'disabled' : ''}>
            ${permiso === 'denied' ? 'Bloqueados en el navegador' : 'Activar los avisos'}</button>
          ${raw(permiso === 'denied'
            ? '<p class="tiny" style="margin-top:8px">Los has bloqueado. Actívalos en los ' +
              'ajustes del navegador para este sitio.</p>' : '')}
        </div>`)}

      ${raw(lista.length ? '<div class="stack" style="margin-top:12px">' +
        lista.map(tarjetaAlerta).join('') + '</div>'
        : html`<div class="empty" style="padding-top:28px">${raw(icon('campana'))}
            <p>Sin recordatorios todavía. Abajo tienes los que te propongo con tus datos,
            con las horas ya calculadas.</p>
          </div>`)}

      ${raw(sugerenciasHTML())}

      <div class="row" style="margin-top:14px">
        <button class="btn grow" data-a="desdeRutinas">${raw(icon('dumbbell'))} Crear desde mis rutinas</button>
      </div>

      <div class="list-title">Que suenen con la app cerrada</div>
      <div class="card">
        <p class="muted">Una página web no puede avisarte sola si está cerrada, salvo
        pagando un servidor de notificaciones. La vía que sí funciona y no cuesta nada
        es llevarlos al calendario del móvil, que sí avisa siempre.</p>
        <button class="btn block" data-a="calendario" ${lista.length ? '' : 'disabled'}>
          ${raw(icon('down'))} Descargar para el calendario</button>
        <p class="tiny" style="margin-top:8px">Abre el archivo en el móvil y acepta
        añadirlo. Se crean como eventos semanales con aviso.</p>
      </div>`;
  };

  /* ---------- sugerencias calculadas con tus datos ---------- */
  function sugerenciasHTML() {
    if (!Perfil.completo()) {
      return html`
        <div class="card" style="margin-top:14px">
          <div style="font-weight:600;margin-bottom:4px">Puedo proponerte las horas</div>
          <p class="muted" style="margin-bottom:10px">Con tu peso, tu actividad y a qué hora
          te levantas calculo cuántos vasos de agua te tocan y a qué horas, cuándo comer y
          cuándo entrenar. Necesito el perfil completo.</p>
          <button class="btn primary block" data-a="irperfil">Completar mi perfil</button>
        </div>`;
    }

    const sug = Alertas.sugerencias().filter(function (x) { return !Alertas.yaExiste(x); });
    if (!sug.length) {
      return html`
        <div class="card" style="margin-top:14px">
          <p class="muted" style="margin:0">Ya tienes creados todos los recordatorios que te
          propondría con tus datos. Si cambias de peso, de horarios o de rutinas, vuelve por
          aquí y recalculo.</p>
        </div>`;
    }

    return html`
      <div class="list-head" style="margin-top:20px">
        <span class="list-title">Lo que te propongo</span>
        <button class="btn sm ghost" data-a="crearTodas">Crear todas</button>
      </div>
      <p class="tiny" style="margin:-4px 0 10px">Calculado con tus datos, no son horas por
      defecto. Puedes cambiarlas después.</p>
      <div class="stack">
        ${raw(sug.map(function (x, i) {
          const t = Alertas.TIPOS[x.tipo] || Alertas.TIPOS.libre;
          return html`
            <div class="card">
              <div class="row" style="align-items:flex-start">
                <span class="row-icon">${raw(icon(t.icono))}</span>
                <div class="grow">
                  <div style="font-weight:600">${x.titulo}</div>
                  <div class="tiny">${Alertas.resumenHoras({ horas: x.horas })}</div>
                  <div class="tiny">${Alertas.resumenDias({ dias: x.dias })}</div>
                </div>
                <button class="btn sm primary" data-sug="${i}">Crear</button>
              </div>
              <div class="row wrap" style="gap:5px;margin-top:9px">
                ${raw(x.horas.map(function (h) {
                  return '<span class="chip">' + esc(h) + '</span>';
                }).join(''))}
              </div>
              <p class="tiny" style="margin:9px 0 0">${x.porque}</p>
            </div>`;
        }).join(''))}
      </div>`;
  }

  function tarjetaAlerta(a) {
    const t = Alertas.TIPOS[a.tipo] || Alertas.TIPOS.libre;
    return html`
      <div class="card">
        <div class="row" style="align-items:flex-start">
          <span class="row-icon">${raw(icon(t.icono))}</span>
          <div class="grow" data-edit="${a.id}" style="cursor:pointer">
            <div style="font-weight:600">${a.titulo}</div>
            <div class="tiny">${Alertas.resumenHoras(a)}</div>
            <div class="tiny">${Alertas.resumenDias(a)}</div>
          </div>
          <button class="sw ${a.activa ? 'on' : ''}" data-tog="${a.id}"
                  role="switch" aria-checked="${a.activa}" aria-label="Activar"></button>
        </div>
      </div>`;
  }

  V.alertas.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=nueva]', function () { alertaSheet(null); });

    bind(root, '[data-a=permiso]', function () {
      Alertas.pedirPermiso().then(function (r) {
        render();
        if (r === 'granted') {
          Alertas.avisar('Avisos activados', 'Así te avisaré cuando toque entrenar.');
        } else if (r === 'denied') {
          UI.toast('Has bloqueado los avisos');
        }
      });
    });

    bindAll(root, '[data-tog]', function (el) {
      const a = Alertas.lista().find(function (x) { return x.id === el.dataset.tog; });
      if (!a) return;
      a.activa = !a.activa;
      Alertas.guardar(a);
      el.classList.toggle('on', a.activa);
      el.setAttribute('aria-checked', String(a.activa));
    });

    bindAll(root, '[data-edit]', function (el) {
      alertaSheet(Alertas.lista().find(function (x) { return x.id === el.dataset.edit; }));
    });

    bind(root, '[data-a=irperfil]', function () { go('datos'); });

    bindAll(root, '[data-sug]', function (el) {
      const sug = Alertas.sugerencias().filter(function (x) { return !Alertas.yaExiste(x); });
      const s = sug[Number(el.dataset.sug)];
      if (!s) return;
      Alertas.crearDesdeSugerencia(s);
      render();
      UI.toast('«' + s.titulo + '» creado con ' + s.horas.length +
        (s.horas.length === 1 ? ' aviso' : ' avisos'));
    });

    bind(root, '[data-a=crearTodas]', function () {
      const sug = Alertas.sugerencias().filter(function (x) { return !Alertas.yaExiste(x); });
      sug.forEach(Alertas.crearDesdeSugerencia);
      render();
      UI.toast(sug.length + ' recordatorios creados');
    });

    bind(root, '[data-a=desdeRutinas]', function () {
      const a = Alertas.desdeRutinas();
      if (!a) { UI.toast('Antes asigna días a alguna rutina'); return; }
      render();
      UI.toast('Recordatorio creado para tus días de entrenamiento');
    });

    bind(root, '[data-a=calendario]', function () {
      const blob = new Blob([Alertas.ics()], { type: 'text/calendar;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'training-fr-alertas.ics';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      UI.toast('Archivo descargado. Ábrelo para añadirlo al calendario.');
    });
  };

  function alertaSheet(existente) {
    const a = existente ? JSON.parse(JSON.stringify(existente)) : Alertas.nueva('entreno');

    UI.modal(html`
      <h2>${existente ? 'Editar recordatorio' : 'Nuevo recordatorio'}</h2>

      <label class="tiny">TIPO</label>
      <div class="row wrap" style="gap:6px;margin:6px 0 12px">
        ${raw(Object.keys(Alertas.TIPOS).map(function (k) {
          return '<button class="chip ' + (a.tipo === k ? 'on' : '') + '" data-tipo="' + k + '">' +
            esc(Alertas.TIPOS[k].label) + '</button>';
        }).join(''))}
      </div>

      <label class="tiny">TEXTO</label>
      <input id="al-tit" value="${a.titulo}" placeholder="Título" style="margin:5px 0 8px">
      <input id="al-msg" value="${a.mensaje}" placeholder="Mensaje (opcional)" style="margin:0 0 6px">
      <p class="tiny" id="al-nota-ia" style="margin:0 0 12px">El texto lo escribe tu
      entrenador cada día con lo que llevas hecho, así que el de aquí arriba solo sale
      si la IA no está disponible a esa hora.</p>

      <label class="tiny">HORAS</label>
      <div class="row wrap" style="gap:6px;margin:6px 0 8px" id="al-horas"></div>
      <div class="row" style="gap:8px;margin-bottom:8px">
        <input id="al-hora" type="time" value="${a.horas[0]}" class="grow">
        <button class="btn sm" data-x="addhora">${raw(icon('plus'))} Añadir</button>
      </div>
      <button class="guia-tit" data-x="verRepartir">${raw(icon('chevron'))}
        Repartir varias veces al día</button>
      <div class="guia" id="al-repartir" hidden>
        <div class="card">
          <p class="tiny" style="margin:0 0 9px">Para el agua o las comidas: dime cuántas
          veces y entre qué horas, y las coloco repartidas.</p>
          <div class="row" style="gap:8px">
            <div class="grow"><div class="tiny">VECES</div>
              <input id="rep-n" type="number" inputmode="numeric" min="2" max="12" value="8"
                     style="text-align:center;margin-top:4px"></div>
            <div class="grow"><div class="tiny">DESDE</div>
              <input id="rep-a" type="time" value="08:00" style="margin-top:4px"></div>
            <div class="grow"><div class="tiny">HASTA</div>
              <input id="rep-b" type="time" value="21:00" style="margin-top:4px"></div>
          </div>
          <button class="btn block sm" data-x="repartir" style="margin-top:10px">Repartir</button>
        </div>
      </div>

      <label class="tiny">DÍAS</label>
      <div class="row wrap" style="gap:6px;margin:6px 0 16px">
        ${raw([1, 2, 3, 4, 5, 6, 0].map(function (d) {
          return '<button class="chip ' + (a.dias.indexOf(d) !== -1 ? 'on' : '') +
            '" data-dia="' + d + '">' + UI.diaLargo(Alertas.DIAS[d]) + '</button>';
        }).join(''))}
      </div>

      <button class="btn primary block" data-x="guardar">Guardar</button>
      ${raw(existente ? '<button class="btn danger block sm" data-x="borrar" ' +
        'style="margin-top:8px">Borrar recordatorio</button>' : '')}`,
      function (el) {
        el.querySelectorAll('[data-tipo]').forEach(function (b) {
          b.onclick = function () {
            a.tipo = b.dataset.tipo;
            const t = Alertas.TIPOS[a.tipo];
            el.querySelectorAll('[data-tipo]').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            el.querySelector('#al-tit').value = t.titulo;
            el.querySelector('#al-msg').value = t.mensaje;
            notaIA();
          };
        });

        /* La advertencia de que el texto lo pone la IA solo tiene sentido en el
           tipo que lo hace; en los demás estorba. */
        const notaIA = function () {
          const nota = el.querySelector('#al-nota-ia');
          if (nota) nota.hidden = !(Alertas.esDeIA && Alertas.esDeIA(a.tipo));
        };
        notaIA();

        /* las horas se pintan como fichas que se quitan al tocarlas */
        const pintarHoras = function () {
          const caja = el.querySelector('#al-horas');
          a.horas = a.horas.slice().sort();
          caja.innerHTML = a.horas.map(function (h) {
            return '<button class="chip on" data-quitar="' + esc(h) + '">' + esc(h) + ' ×</button>';
          }).join('') || '<span class="tiny">Sin horas: añade al menos una.</span>';
          caja.querySelectorAll('[data-quitar]').forEach(function (b) {
            b.onclick = function () {
              a.horas = a.horas.filter(function (h) { return h !== b.dataset.quitar; });
              pintarHoras();
            };
          });
        };
        pintarHoras();

        el.querySelector('[data-x=addhora]').onclick = function () {
          const v = el.querySelector('#al-hora').value;
          if (!v) return;
          if (a.horas.indexOf(v) === -1) a.horas.push(v);
          pintarHoras();
        };

        el.querySelector('[data-x=verRepartir]').onclick = function () {
          const c = el.querySelector('#al-repartir');
          c.hidden = !c.hidden;
          this.classList.toggle('abierta', !c.hidden);
        };

        el.querySelector('[data-x=repartir]').onclick = function () {
          const n = Number(el.querySelector('#rep-n').value) || 2;
          const desde = el.querySelector('#rep-a').value || '08:00';
          const hasta = el.querySelector('#rep-b').value || '21:00';
          if (Alertas.enMinutos(hasta) <= Alertas.enMinutos(desde)) {
            UI.toast('La hora de fin tiene que ser posterior');
            return;
          }
          a.horas = Alertas.repartir(desde, hasta, Math.max(2, Math.min(12, n)));
          pintarHoras();
          UI.toast(a.horas.length + ' avisos repartidos');
        };

        el.querySelectorAll('[data-dia]').forEach(function (b) {
          b.onclick = function () {
            const d = Number(b.dataset.dia);
            const i = a.dias.indexOf(d);
            if (i === -1) a.dias.push(d); else a.dias.splice(i, 1);
            b.classList.toggle('on', i === -1);
          };
        });

        el.querySelector('[data-x=guardar]').onclick = function () {
          a.titulo = el.querySelector('#al-tit').value.trim() || 'Recordatorio';
          a.mensaje = el.querySelector('#al-msg').value.trim();
          if (!a.horas.length) { UI.toast('Añade al menos una hora'); return; }
          if (!a.dias.length) { UI.toast('Elige al menos un día'); return; }
          Alertas.guardar(a);
          UI.closeModal();
          render();
          UI.toast('Recordatorio guardado');
        };

        const borrar = el.querySelector('[data-x=borrar]');
        if (borrar) borrar.onclick = function () {
          Alertas.borrar(a.id);
          UI.closeModal();
          render();
          UI.toast('Recordatorio borrado');
        };
      });
  }

})(window);
