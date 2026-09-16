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

  /* ---------- la fila del índice de Perfil ----------
     Eran diez filas idénticas con el mismo icono gris: para llegar a Música
     había que leer la lista entera de arriba abajo, porque nada distinguía una
     de otra más que la palabra. Cada sitio lleva ahora su color, que es lo que
     se reconoce antes de leer.

     Y lo que está sin montar lo dice un punto ámbar en la esquina del icono, en
     vez de esconderlo en el renglón gris de debajo: lo que falta por hacer se
     ve de un vistazo sin repasar diez subtítulos. */
  function filaPerfil(o) {
    return html`
      <button class="fila-plan" data-fila="${o.accion}" style="--fp:${raw(o.tono)}">
        <span class="fp-ico${raw(o.pendiente ? ' pendiente' : '')}">${raw(icon(o.icono))}</span>
        <span class="grow">
          <span class="fp-tit">${o.titulo}</span>
          ${raw(o.sub ? '<span class="fp-sub">' + esc(o.sub) + '</span>' : '')}
        </span>
        ${raw(o.valor ? '<span class="fp-val">' + esc(o.valor) + '</span>' : '')}
        <span class="chevron">${raw(icon('chevron'))}</span>
      </button>`;
  }

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

    /* El sitio donde entrenas, con la misma cara que lleva en Ajustes y en la
       cabecera: si en un sitio es una casa azul, en todos es una casa azul. */
    /* Si estás al día o no, sin ir a mirarlo. Lo pregunta el mount la primera
       vez y repinta; a partir de ahí sale de lo que ya se sabe. */
    const ver = App.versionSabida ? App.versionSabida() : null;

    const sitio = Data.GEAR[Store.settings().gear];
    const cara = (App.CARAS_LUGAR && App.CARAS_LUGAR[Store.settings().gear]) ||
      { icono: 'dumbbell', tono: 'var(--acc)' };

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
      <div class="plan-acciones indice" style="margin:10px 0 0">
        ${raw(filaPerfil({ icono: 'perfil', titulo: 'Datos y hábitos', accion: 'datos',
          tono: 'var(--acc)', pendiente: !listo,
          sub: !Store.settings().name ? 'Dime tu nombre para empezar'
            : listo ? Store.settings().name + ' · ' + p.edad + ' años · ' +
              Perfil.ACTIVIDAD[p.actividad].label
            : 'Sin completar' }))}
        <!-- El orden es el de la cadena, no el de cuándo se fue añadiendo cada
             cosa: tus datos mandan sobre tus calorías, tus calorías sobre lo
             que comes, lo que comes sobre lo que suplementas. Los objetivos y
             los recordatorios van después porque se apoyan en todo lo de
             arriba, no al revés. -->
        ${raw(filaPerfil({ icono: 'nutricion', titulo: 'Alimentación', accion: 'nutricion',
          tono: '#2fc4b2', pendiente: !m,
          sub: m ? m.kcal + ' kcal · ' + m.prot + ' g de proteína' : 'Necesita tus datos' }))}
        ${raw(filaPerfil({ icono: 'bote', titulo: 'Suplementación', accion: 'suplementos',
          tono: '#8e7cf0',
          sub: (function () {
            if (!g.Suplementos) return 'Qué tomas y cuándo';
            const n = Suplementos.lista().length;
            if (!n) return 'Creatina, proteína, omega 3…';
            const hoy = Suplementos.tomasDeHoy().length;
            return n + (n === 1 ? ' apuntado' : ' apuntados') + ' · ' +
              (hoy ? hoy + (hoy === 1 ? ' toma hoy' : ' tomas hoy') : 'hoy ninguna');
          })() }))}
        ${raw(filaPerfil({ icono: 'trofeo', titulo: 'Objetivos', accion: 'objetivos',
          tono: '#f0a23c',
          sub: metas.length ? metas.length + ' en marcha · ' + cumplidas + ' cumplidos'
            : 'Ninguno todavía' }))}
        ${raw(filaPerfil({ icono: 'campana', titulo: 'Alertas', accion: 'alertas',
          tono: '#e0679a',
          sub: alertas ? alertas + (alertas === 1 ? ' recordatorio activo' : ' recordatorios activos')
            : 'Sin recordatorios' }))}
      </div>

      <div class="list-title">Entrenamiento</div>
      <div class="plan-acciones indice" style="margin:10px 0 0">
        ${raw(filaPerfil({ icono: 'chispa', titulo: 'Entrenador con IA', accion: 'entrenador',
          tono: 'var(--acc)', pendiente: !IA.activa(),
          sub: IA.activa() ? 'Listo para usar' : 'Sin configurar' }))}
        ${raw(filaPerfil({ icono: 'musica', titulo: 'Música', accion: 'musica',
          tono: '#1db954', pendiente: !Spotify.activa(),
          sub: Spotify.activa() ? 'Spotify conectado'
            : Spotify.configurado() ? 'Sin conectar' : 'Sin configurar' }))}
        ${raw(filaPerfil({ icono: cara.icono, titulo: 'Dónde entrenas', accion: 'lugar',
          tono: cara.tono,
          sub: sitio ? sitio.label + ' · ' + UI.num(App.cuantosEn(Store.settings().gear)) +
            ' ejercicios a tu alcance' : 'Sin elegir' }))}
      </div>

      <div class="list-title">Aplicación</div>
      <div class="plan-acciones indice" style="margin:10px 0 0">
        ${raw(filaPerfil({ icono: 'nube', titulo: 'Mi cuenta', accion: 'cuenta',
          tono: '#4f8cf5', pendiente: !Sync.activa(),
          sub: Sync.activa() ? Sync.email() : 'Sin sincronizar' }))}
        ${raw(filaPerfil({ icono: 'ajustes', titulo: 'Ajustes', accion: 'ajustes',
          tono: '#c06bf0',
          sub: 'Unidades, tema, descanso y copias de seguridad' }))}
        ${raw(filaPerfil({ icono: 'actualizar', titulo: 'Actualizaciones', accion: 'version',
          tono: '#4f8cf5', pendiente: !!(ver && ver.local && !ver.alDia && !ver.sinRed),
          /* El punto naranja solo cuando se ha podido comprobar. Sin red el
             estado no es «hay una nueva», es «no se sabe», y marcar la fila
             manda al usuario a una pantalla que no puede contarle nada. */
          sub: !ver ? 'Comprobando si estás al día…'
            : ver.sinRed ? String(ver.local || '').replace('trainingfr-', '') +
              ' · sin conexión para comprobar si hay otra'
            : ver.alDia || !ver.local
              ? 'Al día · ' + String(ver.local || ver.servidor).replace('trainingfr-', '') +
                ' · y lo descargado para usarla sin internet'
              : 'Hay una versión nueva: ' +
                String(ver.servidor).replace('trainingfr-', '') }))}
        ${raw(g.Admin && Admin.administra()
          ? filaPerfil({ icono: 'llave', titulo: 'Cuentas', accion: 'usuarios',
              tono: '#f0a23c', sub: 'Crear, desactivar y borrar cuentas del proyecto' })
          : g.Admin && Admin.sinRespuesta()
            ? filaPerfil({ icono: 'llave', titulo: 'Cuentas', accion: 'usuarios',
                tono: '#f0a23c', pendiente: true,
                sub: 'No he podido comprobar si administras' })
            : '')}
      </div>

      <!-- La ayuda va al final y sola. Metida entre la cuenta y los ajustes
           parecia una opcion mas que configurar; aqui abajo es lo que es: el
           sitio al que se baja cuando algo no se entiende. -->
      <div class="plan-acciones indice" style="margin:22px 0 0">
        ${raw(filaPerfil({ icono: 'ayuda', titulo: 'Ayuda', accion: 'ayuda',
          tono: 'var(--dim2)',
          sub: 'Cómo se hace cada cosa, cómo funciona y las dudas de siempre' }))}
      </div>

      <p class="tiny pie-marca">Training FR</p>`;
  };

  V.perfil.mount = function (root) {
    const ir = { datos: 'datos', objetivos: 'objetivos', nutricion: 'nutricion',
      alertas: 'alertas', entrenador: 'entrenador', musica: 'musica',
      cuenta: 'cuenta', ajustes: 'ajustes', usuarios: 'usuarios', version: 'version',
      ayuda: 'ayuda', suplementos: 'suplementos' };

    /* La primera vez que se entra en Perfil se pregunta si hay versión nueva y
       se repinta con la respuesta. Después ya está sabida y no se vuelve a
       preguntar en cada repintado. */
    if (App.versionSabida && !App.versionSabida() && App.estadoVersion) {
      App.estadoVersion().then(function (v) { if (v) render(); });
    }

    /* Se pregunta al servidor si esta cuenta administra; mientras no conteste,
       la entrada no está. Enseñarla o no es comodidad: el permiso lo decide la
       función, no esta pantalla. */
    if (g.Admin && !Admin.administra()) {
      Admin.comprobar().then(function (si) { if (si) render(); });
    }
    bindAll(root, '[data-fila]', function (el) {
      const d = el.dataset.fila;
      if (d === 'lugar') return App.lugarSheet();
      if (d === 'ayuda' && g.Ayuda) Ayuda.reiniciar();
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
          <!-- Decia «sin eso no puedo calcular tus calorias» de todo, y con el pais
               dentro eso dejo de ser verdad: el pais no entra en ninguna formula,
               pero decide de que supermercado sale el menu. Cada cosa con su
               motivo, que un aviso que exagera se aprende a ignorar. -->
          <p class="tiny" style="margin:6px 0 0">${raw(faltan.length === 1 && !p.pais
            ? 'Sin el país el menú sale de un supermercado que no es el tuyo, con nombres ' +
              'que no usas.'
            : 'Sin tus datos no puedo calcular tus calorías ni ajustarte el entrenamiento, ' +
              'y sin el país el menú sale de otro supermercado.')} Es lo único obligatorio;
          lo demás lo vas rellenando cuando quieras.</p>
        </div>` : '')}

      ${raw(grupo('Quién soy',
        campo({
          tit: 'Mi nombre',
          control: valor('id="p-nombre" value="' + esc(Store.settings().name || '') +
            '" placeholder="Tu nombre" autocomplete="given-name"', '', 132,
            Store.settings().name),
          nota: 'Para saludarte al abrir la app y para que el entrenador con IA te hable a ' +
            'ti, no a un usuario.'
        }) +
        /* No es papeleo: de aquí sale si lo que te propongo comer existe en tu
           supermercado y cómo se llama. Antes se deducía de la zona horaria del
           móvil, que acierta casi siempre pero no avisa cuando falla. */
        /* En la misma linea que el titulo y a la derecha, igual que el nombre:
           en una tarjeta de dos campos, uno con el valor al lado y el otro con
           una fila entera debajo se ve desordenado aunque cada uno por separado
           este bien. Lo que manda es la tarjeta, no el campo. */
        campo({
          tit: 'País',
          nota: 'De aquí salen el menú y la lista de la compra: los nombres, los cortes ' +
            'de carne y lo que hay en el súper cambian de un país a otro.',
          control: '<button class="campo-val pais-val' + (edita ? '' : ' fijo') + '"' +
            (edita ? ' data-a="pais"' : ' disabled') + '>' +
            (p.pais
              ? '<span class="pais-bandera">' + esc(Paises.bandera(p.pais)) + '</span>' +
                '<span class="campo-fijo">' + esc(Paises.nombreDe(p.pais)) + '</span>'
              : '<span class="pais-bandera vacia">' + icon('mundo') + '</span>' +
                '<span class="campo-fijo sin">' +
                (edita ? 'Elegir' : 'Sin poner') + '</span>') +
            (edita ? '<span class="chevron">' + icon('chevron') + '</span>' : '') +
            '</button>'
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
        campo({
          tit: 'Con mis palabras',
          nota: 'Opcional. Lo lee el entrenador con IA para lo que te propone. Los números ' +
            'salen de la opción de arriba; esto es el matiz que ninguna lista recoge.',
          abajo: largo('objetivoTexto', p.objetivoTexto || '',
            'Volver a correr 10 km, quitarme el dolor de espalda…')
        }) +
        ((Perfil.OBJETIVO[p.objetivo] || {}).signo !== 0
          ? campo({
              tit: 'A qué ritmo',
              nota: 'Unos ' + String(ritmo.kgSemana).replace('.', ',') + ' kg por semana' +
                ((Perfil.OBJETIVO[p.objetivo] || {}).signo < 0 ? ' menos' : ' más') + '.',
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

  /* ---------- elegir país ----------
     Casi doscientos nombres. En una lista sin buscador hay que bajar un minuto
     para llegar a Venezuela, así que el buscador va arriba y con el foco
     puesto: se escriben tres letras y ya está. La bandera delante hace el
     trabajo del ojo, que reconoce un dibujo antes que una palabra.

     Y lo que el móvil sabe se ofrece arriba en vez de darse por hecho: quien
     tiene razón sobre dónde vive es la persona, no la zona horaria. */
  function paisSheet() {
    const actual = Perfil.datos().pais || '';
    const sugerido = !actual && g.Paises ? Paises.sugerido() : '';

    const filas = function (lista) {
      if (!lista.length) {
        return '<p class="tiny" style="margin:14px 2px">Ninguno con ese nombre. ' +
          'Prueba con menos letras.</p>';
      }
      return '<div class="list pais-lista">' + lista.map(function (x) {
        return '<button class="list-row tap pais-op' + (x.iso === actual ? ' on' : '') +
          '" data-pais="' + esc(x.iso) + '">' +
          '<span class="pais-bandera">' + esc(Paises.bandera(x.iso)) + '</span>' +
          '<span class="grow"><span class="list-row-title">' + esc(x.nombre) + '</span></span>' +
          '<span class="do-marca">' + icon('check') + '</span></button>';
      }).join('') + '</div>';
    };

    UI.modal(html`
      <div class="conf-disco cambio">${raw(icon('mundo'))}</div>
      <h2 class="conf-tit">¿De dónde eres?</h2>
      <p class="muted conf-txt">Con esto el menú sale del supermercado que tienes al lado,
      con los nombres que usas tú.</p>

      <div class="pais-buscar">
        ${raw(icon('search'))}
        <input id="pa-q" type="search" placeholder="Busca tu país" autocomplete="off"
               autocorrect="off" spellcheck="false">
      </div>

      ${raw(sugerido ? '<button class="pais-sug" data-pais="' + esc(sugerido) + '">' +
        '<span class="pais-bandera">' + esc(Paises.bandera(sugerido)) + '</span>' +
        '<span class="grow"><b>' + esc(Paises.nombreDe(sugerido)) + '</b>' +
        '<i>Es lo que dice tu móvil. Tócalo si es correcto.</i></span></button>' : '')}

      <div id="pa-lista">${raw(filas(Paises.LISTA))}</div>`,
      function (el) {
        const caja = el.querySelector('#pa-lista');
        const q = el.querySelector('#pa-q');

        /* Sin foco automático: en el móvil abrir el teclado de golpe tapa media
           lista, y quien ya ve su bandera no quiere escribir nada. */
        q.oninput = function () { caja.innerHTML = filas(Paises.buscar(q.value)); };

        el.onclick = function (ev) {
          const b = ev.target.closest('[data-pais]');
          if (!b) return;
          Perfil.guardar({ pais: b.dataset.pais });
          UI.closeModal();
          render();
          UI.toast(Paises.bandera(b.dataset.pais) + ' ' + Paises.nombreDe(b.dataset.pais));
        };
      });
  }

  V.datos.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=pais]', paisSheet);

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
        <button class="btn primary sm btn-arranque" data-a="nuevo">${raw(icon('plus'))} Nuevo</button>
      </div>
      <p class="muted" style="margin-top:8px">Se actualizan solos con lo que entrenas
      y con tus pesajes. No hay que apuntar nada a mano.</p>

      ${raw(metas.length ? '<div class="stack">' + metas.map(tarjetaMeta).join('') + '</div>'
        : html`<div class="empty">${raw(icon('trofeo'))}
            <p>Ponte una meta y te enseño cuánto te falta cada vez que abras la app.</p>
            <button class="btn primary btn-arranque" data-a="nuevo">Crear mi primer objetivo</button>
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

  /* ---------- el dibujo ----------
     Lo hecho va en linea llena con su relleno degradado, que es lo que le da
     peso: una linea sola sobre el fondo se lee como un garabato, con el
     relleno se lee como terreno recorrido. Lo que falta va en puntos hasta
     cruzar la meta, y esa diferencia de trazo es lo unico que hace falta para
     entender que la derecha es una estimacion y no un dato.

     La raya de la meta lleva su cifra al lado: una horizontal sin numero
     obliga a deducir a que altura esta, y el numero es justo lo que se busca.

     Los dos puntos no son circulos del SVG sino dos marcas encima: el dibujo
     se estira a lo ancho para llenar la tarjeta, y un circulo dentro de un SVG
     estirado sale ovalado. El de hoy late despacio —es lo unico de aqui que
     sigue en marcha— y el del final es un aro hueco, lo que todavia no ha
     pasado. */
  let nGraf = 0;

  function graficaMeta(m, pre) {
    let pts = (pre.puntos || []).slice(-24);

    /* Sin historial pero con plan, el dibujo es la linea de lo que deberia
       pasar: de donde estas hoy a la meta. Toda punteada, que aqui no hay ni un
       dato medido. */
    if (pts.length < 2 && pre.segunPlan) {
      const p0 = Objetivos.progreso(m);
      pts = [{ t: Date.now(), v: p0.actual }];
    }
    if (!pts.length) return '';
    if (pts.length < 2 && !pre.segunPlan) return '';

    const W = 300, H = 92, P = 9;
    const meta = Number(m.meta) || 0;
    const uid = 'mg' + (++nGraf);

    const tIni = pts[0].t;
    const ultimo = pts[pts.length - 1];
    const hayFuturo = !!(pre.fecha && pre.haciaMeta);
    const tFin = hayFuturo && pre.fecha > ultimo.t ? pre.fecha : ultimo.t;
    const anchoT = Math.max(1, tFin - tIni);

    const vals = pts.map(function (q) { return q.v; }).concat([meta]);
    const min = Math.min.apply(null, vals);
    const max = Math.max.apply(null, vals);
    /* Un respiro arriba y abajo: con la meta pegada al canto, su raya se
       confunde con el borde del dibujo. */
    const aire = Math.max(1e-6, (max - min) || Math.abs(max) * 0.08 || 1) * 0.2;
    const lo = min - aire, hi = max + aire;

    const x = function (t) { return P + (t - tIni) / anchoT * (W - 2 * P); };
    const y = function (v) { return H - P - (v - lo) / (hi - lo) * (H - 2 * P); };
    const pc = function (n, total) { return (n / total * 100).toFixed(2) + '%'; };

    const linea = pts.length > 1 ? pts.map(function (q, i) {
      return (i ? 'L' : 'M') + x(q.t).toFixed(1) + ' ' + y(q.v).toFixed(1);
    }).join(' ') : '';

    const yMeta = y(meta);

    const trazoFuturo = 'M' + x(ultimo.t).toFixed(1) + ' ' + y(ultimo.v).toFixed(1) +
      ' L' + x(tFin).toFixed(1) + ' ' + yMeta.toFixed(1);

    const proyeccion = hayFuturo
      ? '<path class="mg-futuro" vector-effect="non-scaling-stroke" d="' +
        trazoFuturo + '"/>'
      : '';

    /* El relleno va debajo de lo que se ha medido. Cuando no hay nada medido
       —un solo pesaje y el resto lo pone el plan— va debajo de la linea del
       plan, mas flojo: sin el, el dibujo se queda en una raya de puntos
       flotando en el vacio. */
    const bajo = linea || (hayFuturo ? trazoFuturo : '');
    const desde = linea ? pts[0].t : ultimo.t;
    const hasta = linea ? ultimo.t : tFin;
    const area = bajo
      ? bajo + ' L' + x(hasta).toFixed(1) + ' ' + H +
        ' L' + x(desde).toFixed(1) + ' ' + H + ' Z'
      : '';

    return '<div class="meta-graf-caja" role="img" aria-label="' +
      esc('Tu evolución y lo que falta hasta ' + Objetivos.formato(m, meta)) + '">' +
      '<svg class="meta-graf" viewBox="0 0 ' + W + ' ' + H + '" ' +
      'preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--acc)" stop-opacity=".38"/>' +
      '<stop offset="55%" stop-color="var(--acc)" stop-opacity=".13"/>' +
      '<stop offset="100%" stop-color="var(--acc)" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      (area ? '<path class="mg-area' + (linea ? '' : ' es-plan') + '" d="' + area +
        '" fill="url(#' + uid + ')"/>' : '') +
      '<path class="mg-meta" vector-effect="non-scaling-stroke" d="M0 ' +
      yMeta.toFixed(1) + ' H' + W + '"/>' +
      (linea ? '<path class="mg-linea" vector-effect="non-scaling-stroke" d="' +
        linea + '"/>' : '') +
      proyeccion +
      '</svg>' +
      '<span class="mg-hoy" style="left:' + pc(x(ultimo.t), W) +
      ';top:' + pc(y(ultimo.v), H) + '"></span>' +
      (hayFuturo
        ? '<span class="mg-fin" style="left:' + pc(x(tFin), W) +
          ';top:' + pc(yMeta, H) + '"></span>'
        : '') +
      '<span class="mg-etiqueta" style="top:' + pc(yMeta, H) + '">' +
      esc(Objetivos.formato(m, meta)) + '</span>' +
      '</div>';
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
    const activas = lista.filter(function (a) { return a.activa; }).length;

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} Perfil</button>
      <div class="row between">
        <h1 style="margin:0">Alertas</h1>
        <span class="row" style="gap:8px">
          <!-- El estado de los avisos se gestiona desde aquí. Con su punto
               cuando falta algo: si no, quien no los tenga dados no tiene por
               qué saber que detrás de una campana hay algo que arreglar. -->
          <button class="btn sm icon-vidrio campana-estado${raw(
            Alertas.diagnostico().permiso === 'granted' ? '' : ' pendiente')}"
            data-a="avisos" aria-label="Estado de los avisos"
            title="Estado de los avisos">${raw(icon('campana'))}</button>
          <button class="btn primary sm btn-arranque" data-a="nueva">
            ${raw(icon('plus'))} Nueva</button>
        </span>
      </div>
      <p class="muted" style="margin-top:8px">${raw(lista.length
        ? 'Tienes ' + lista.length + (lista.length === 1 ? ' recordatorio' : ' recordatorios') +
          (activas < lista.length
            ? ', ' + activas + ' encendidos.'
            : ', todos encendidos.') +
          ' ' + esc(proximoTexto(lista))
        : 'Las horas salen de tus datos: tu peso, a qué hora te levantas y cuándo entrenas.')}</p>

      ${raw(permisoHTML())}

      ${raw(lista.length ? '<div class="list-title">Mis recordatorios</div>' +
        '<div class="stack">' + lista.map(tarjetaAlerta).join('') + '</div>'
        : html`<div class="empty" style="padding-top:28px">${raw(icon('campana'))}
            <p>Sin recordatorios todavía. Abajo tienes los que te propongo con tus datos,
            con las horas ya calculadas.</p>
          </div>`)}

      ${raw(sugerenciasHTML())}

      <button class="btn block" data-a="desdeRutinas" style="margin-top:14px">
        ${raw(icon('dumbbell'))} Crear desde mis rutinas</button>

      <div class="list-title">Que suenen con la app cerrada</div>
      <div class="card tarjeta-premium">
        <p class="muted" style="margin:0 0 12px;font-size:.88rem">Una página web no puede
        avisarte sola si está cerrada, salvo pagando un servidor de notificaciones. La vía
        que sí funciona y no cuesta nada es llevarlos al calendario del móvil, que sí avisa
        siempre.</p>
        ${raw((function () {
          const caduca = Alertas.calendarioCaduca();
          const viejo = Alertas.calendarioDesfasado();
          if (!caduca && !viejo) return '';

          /* Se acaba manda sobre ha cambiado: si los avisos van a dejar de
             sonar, eso es lo urgente aunque además haya cambios. */
          const tit = caduca
            ? (caduca.caducado ? 'Tus avisos del calendario ya se acabaron'
              : caduca.dias <= 1 ? 'Tus avisos del calendario se acaban hoy'
                : 'Tus avisos del calendario se acaban en ' + caduca.dias + ' días')
            : 'Tu calendario está desfasado';
          const txt = caduca
            ? 'Los generaste con un plazo y ese plazo termina. Vuelve a descargarlo y ' +
              'siguen sonando desde donde estaban.'
            : 'Has cambiado recordatorios desde la última descarga. El calendario sigue ' +
              'avisando con lo de antes hasta que vuelvas a bajarlo.';

          return '<div class="cal-viejo">' +
            '<span class="cv-ico">' + icon('aviso') + '</span>' +
            '<span class="grow"><b>' + esc(tit) + '</b>' +
            '<span class="tiny">' + esc(txt) + '</span></span></div>';
        })())}

        <button class="btn primary block" data-a="calendario" ${lista.length ? '' : 'disabled'}>
          ${raw(icon('down'))} ${Alertas.calendarioDesfasado() || Alertas.calendarioCaduca()
            ? 'Volver a descargar' : 'Descargar para el calendario'}</button>
        <p class="tiny" style="margin-top:8px">Se crean como eventos semanales con aviso,
        llamados <b>«Training FR · …»</b>, y tocando uno se abre la app en la pantalla que
        toca. Antes de bajarlo eliges hasta cuándo quieres que suenen. Al volver a
        descargarlo, los que ya tengas se actualizan en vez de duplicarse.</p>

        <!-- Lo que hace que esto sea administrable no es el archivo, es dónde
             se mete: en un calendario propio se apaga o se borra entero de un
             toque, y mezclado con el del trabajo hay que ir uno por uno. Eso no
             lo decide el .ics, lo decide quien lo importa, así que se dice. -->
        <div class="cal-truco">
          <span class="ct-ico">${raw(icon('aviso'))}</span>
          <span class="grow"><b>Mételos en un calendario aparte</b>
          <span class="tiny">Crea antes un calendario llamado <b>Training FR</b> en tu móvil
          y elígelo al importar. Así los apagas, los escondes o los borras todos de una vez,
          sin tocar el resto de tu agenda.</span></span>
        </div>

        ${raw(Alertas.cuantosExportados() ? html`
          <button class="btn block sm" data-a="quitarcal" style="margin-top:10px">
            ${raw(icon('trash'))} Quitarlos del calendario</button>
          <p class="tiny" style="margin-top:7px">Descarga un archivo que los retira. Ábrelo
          igual que el otro: el calendario borra los ${Alertas.cuantosExportados()} avisos
          que le pusiste desde aquí, incluidos los de horas que ya cambiaste.</p>` : '')}
      </div>`;
  };

  /* ---------- activar los avisos ----------
     Para quien ya los tiene dados esto no existe. Para quien no, era un botón
     y una frase: «actívalos en los ajustes del navegador». Si el botón no hacía
     nada —que en iOS dentro de Safari es lo que pasa, porque ahí no hay ni
     permiso que pedir— no había forma de saber por qué, y quien instala la app
     por primera vez se queda sin avisos sin entender qué le falta.

     Ahora se mira en qué situación está y se dice esa y solo esa. Son cuatro, y
     cada una tiene una salida distinta: instalar la app, pulsar el botón,
     desbloquear en los ajustes del sistema, o nada porque ya está.

     Y cuando ya está, un botón de probar. Es lo único que demuestra que
     funciona; lo demás son suposiciones sobre permisos y ajustes. */
  function permisoHTML() {
    const d = Alertas.diagnostico();

    if (!d.soportado) {
      return html`
        <div class="card tarjeta-premium" style="margin-top:12px">
          <div class="pre-encima">Sin avisos aquí</div>
          <p class="muted" style="margin:6px 0 0;font-size:.88rem">Este navegador no sabe
          mostrar avisos del sistema. Los recordatorios los sigues viendo dentro de la app,
          y para que suenen con la app cerrada tienes el calendario, más abajo.</p>
        </div>`;
    }

    /* En iOS los avisos web solo existen dentro de la app instalada en la
       pantalla de inicio. En Safari el botón no falla: es que no hay nada que
       pulsar, y decirle «pulsa aquí» es mandarle a un sitio que no existe. */
    if (d.esIOS && !d.instalada && d.permiso !== 'granted') {
      return html`
        <div class="card tarjeta-premium" style="margin-top:12px">
          <div class="pre-encima">Falta instalar la app</div>
          <div class="pre-num" style="margin:2px 0 6px;font-size:1.05rem">Añádela a tu
          pantalla de inicio</div>
          <p class="muted" style="margin:0 0 10px;font-size:.88rem">En el iPhone los avisos
          solo funcionan desde la app instalada, no desde el navegador. Se hace una vez:</p>
          <ol class="instr" style="margin:0">
            <li>Toca el botón de compartir de Safari, el cuadrado con la flecha.</li>
            <li>Baja y elige <b>Añadir a pantalla de inicio</b>.</li>
            <li>Abre Training FR desde el icono nuevo y vuelve aquí.</li>
          </ol>
        </div>`;
    }

    if (d.permiso === 'denied') {
      return html`
        <div class="card tarjeta-premium" style="margin-top:12px;border-color:var(--warn)">
          <div class="pre-encima">Bloqueados</div>
          <div class="pre-num" style="margin:2px 0 6px;font-size:1.05rem">Los avisos están
          bloqueados</div>
          <p class="muted" style="margin:0 0 10px;font-size:.88rem">Se dijo que no una vez y
          el sistema no lo vuelve a preguntar. Hay que activarlos a mano:</p>
          <ol class="instr" style="margin:0">
            ${raw(d.esIOS
              ? '<li>Abre los <b>Ajustes</b> del iPhone.</li>' +
                '<li>Baja hasta <b>Training FR</b> y entra.</li>' +
                '<li>Entra en <b>Notificaciones</b> y enciende <b>Permitir notificaciones</b>.</li>'
              : '<li>Toca el candado de la barra de direcciones.</li>' +
                '<li>Busca <b>Notificaciones</b> y ponlo en <b>Permitir</b>.</li>' +
                '<li>Recarga esta página.</li>')}
          </ol>
        </div>`;
    }

    if (d.permiso !== 'granted') {
      return html`
        <div class="card tarjeta-premium" style="margin-top:12px">
          <div class="pre-encima">Falta un paso</div>
          <div class="pre-num" style="margin:2px 0 6px;font-size:1.05rem">Permite los avisos</div>
          <p class="muted" style="margin:0 0 12px;font-size:.88rem">Sin permiso solo verás los
          recordatorios dentro de la app. El sistema te lo va a preguntar una vez.</p>
          <button class="btn primary block btn-arranque" data-a="permiso">
            ${raw(icon('campana'))} Activar los avisos</button>
        </div>`;
    }

    /* Concedidos: aquí arriba no hay nada que arreglar, así que aquí arriba no
       va nada. La confirmación y el botón de probar se van al final de la
       pantalla, que es donde se buscan —cuando ya funciona, no urge—. */
    return '';
  }

  /* ---------- el estado de los avisos, en su hoja ----------
     Cuando ya funcionan no hay nada que hacer aquí, así que no tiene por qué
     ocupar sitio en la pantalla: vive detrás de la campana de la cabecera y se
     abre cuando se quiere mirar. Lo que sí sigue arriba, en la pantalla, es lo
     que hay que arreglar —eso no se esconde detrás de nada—. */
  function avisosSheet() {
    const d = Alertas.diagnostico();

    UI.modal(html`
      <h2>Los avisos</h2>

      <div class="card tarjeta-premium" style="margin-top:12px">
        <div class="pre-encima">${d.permiso === 'granted' ? 'Activados'
          : d.permiso === 'denied' ? 'Bloqueados' : 'Sin activar'}</div>
        <p class="muted" style="margin:6px 0 0;font-size:.88rem">${raw(
          d.permiso === 'granted'
            ? (d.ultimoAviso
                ? 'El último salió ' + esc(UI.fechaCorta(d.ultimoAviso)) + '.'
                : 'Todavía no ha salido ninguno.')
            : 'Ahora mismo no va a sonar nada. Cierra esto y mira la tarjeta de ' +
              'arriba: ahí están los pasos.')}</p>
        ${raw(d.permiso === 'granted'
          ? '<button class="btn block btn-arranque" data-x="probar" style="margin-top:12px">' +
            icon('campana') + ' Lanzar uno de prueba</button>'
          : '')}
      </div>

      <div class="list-title">Qué funciona y qué no</div>
      <div class="list">
        ${raw(filaEstado('Con la app abierta', true,
          'Suenan a su hora, aunque la tengas en segundo plano.'))}
        ${raw(filaEstado('Con la app cerrada', false,
          'Una página web no ejecuta nada cerrada. Para eso está el calendario, ' +
          'abajo del todo.'))}
        ${raw(filaEstado('En la pantalla de inicio', d.instalada || !d.esIOS,
          d.esIOS
            ? (d.instalada ? 'Instalada, que es donde el iPhone permite los avisos.'
                : 'En el iPhone hacen falta desde la app instalada, no desde el navegador.')
            : 'No hace falta instalarla en este dispositivo.'))}
      </div>

      <p class="tiny" style="margin-top:12px">${raw(d.activas
        ? esc(d.activas + (d.activas === 1 ? ' recordatorio encendido.' :
            ' recordatorios encendidos.'))
        : 'No tienes ninguno encendido, así que no hay nada que pueda sonar.')}</p>

      <button class="btn ghost block sm" data-x="cerrar" style="margin-top:12px">Cerrar</button>`,
      function (el) {
        el.querySelector('[data-x=cerrar]').onclick = UI.closeModal;
        const probar = el.querySelector('[data-x=probar]');
        if (probar) probar.onclick = function () {
          Alertas.probar()
            .then(function () { UI.toast('Aviso lanzado: mira la pantalla'); })
            .catch(function (e) { UI.toast(e.message || 'No se pudo lanzar'); });
        };
      });
  }

  /* Una fila de «esto sí / esto no». Un visto y un aspa dicen en medio segundo
     lo que un párrafo tarda en decir en tres líneas. */
  function filaEstado(titulo, si, sub) {
    return '<div class="list-row"><span class="fe-marca ' + (si ? 'si' : 'no') + '">' +
      icon(si ? 'check' : 'close') + '</span>' +
      '<div class="grow"><div class="list-row-title">' + esc(titulo) + '</div>' +
      '<div class="list-row-sub">' + esc(sub) + '</div></div></div>';
  }

  /* Cuál es el siguiente que va a sonar hoy. Una lista de recordatorios dice a
     qué horas suenan, pero no cuál toca ahora, que es lo que se mira al entrar. */
  function proximoTexto(lista) {
    const ahora = new Date().getHours() * 60 + new Date().getMinutes();
    const hoy = (UI.DAY_NAMES || [])[new Date().getDay()];

    let mejor = null;
    lista.forEach(function (a) {
      if (!a.activa) return;
      if ((a.dias || []).length && a.dias.indexOf(hoy) === -1) return;
      (a.horas || []).forEach(function (h) {
        const m = String(h).match(/^(\d{1,2}):(\d{2})$/);
        if (!m) return;
        const min = Number(m[1]) * 60 + Number(m[2]);
        if (min < ahora) return;
        if (!mejor || min < mejor.min) {
          mejor = { min: min, hora: h, titulo: Alertas.tituloEn(a, h) };
        }
      });
    });

    if (!mejor) return 'Hoy ya no queda ninguno.';
    return 'El siguiente, «' + mejor.titulo + '» a las ' + UI.hora(mejor.hora) + '.';
  }

  /* ---------- sugerencias calculadas con tus datos ---------- */
  function sugerenciasHTML() {
    if (!Perfil.completo()) {
      return html`
        <div class="card tarjeta-premium" style="margin-top:14px">
          <div class="pre-encima">Puedo proponerte las horas</div>
          <p class="muted" style="margin:6px 0 12px;font-size:.88rem">Con tu peso, tu
          actividad y a qué hora te levantas calculo cuántos vasos de agua te tocan y a qué
          horas, cuándo comer y cuándo entrenar. Necesito el perfil completo.</p>
          <button class="btn primary block btn-arranque" data-a="irperfil">
            Completar mi perfil</button>
        </div>`;
    }

    const sug = Alertas.sugerencias().filter(function (x) { return !Alertas.yaExiste(x); });
    if (!sug.length) {
      return html`
        <div class="card tarjeta-premium" style="margin-top:14px">
          <p class="muted" style="margin:0;font-size:.88rem">Ya tienes creados todos los
          recordatorios que te propondría con tus datos. Si cambias de peso, de horarios o
          de rutinas, vuelve por aquí y recalculo.</p>
        </div>`;
    }

    return html`
      <div class="row between" style="margin-top:20px;align-items:center">
        <span class="list-title" style="margin:0">Lo que te propongo</span>
        <button class="btn sm ghost" data-a="crearTodas">Crear todas</button>
      </div>
      <p class="tiny" style="margin:-2px 0 10px">Calculado con tus datos, no son horas por
      defecto. Puedes cambiarlas después.</p>

      <div class="stack">
        ${raw(sug.map(function (x, i) {
          /* La misma caja que un recordatorio de verdad: es lo que va a ser si
             lo creas, y enseñarlo con otra forma obliga a traducir. */
          return cajaAlerta(x, {
            activa: true,
            control: '<button class="btn sm primary rec-crear" data-sug="' + i + '">Crear</button>',
            pie: '<p class="tiny rec-porque">' + esc(x.porque) + '</p>'
          });
        }).join(''))}
      </div>`;
  }

  /* ---------- un recordatorio ----------
     Un recordatorio es una hora. Todo lo demás —cómo se llama, qué días, de qué
     tipo es— explica esa hora, pero el dato es la hora, y estaba escrita en
     letra pequeña dentro de un renglón de texto mientras el título se llevaba el
     tamaño grande.

     Así que manda la hora, como en el reloj del teléfono: grande, en cifras
     tabulares, y debajo en pequeño lo que es y qué días. Cuando hay varias —el
     agua son diez— la grande es la siguiente que va a sonar, que es la única
     que importa ahora mismo, y las demás quedan en una tira debajo con la
     siguiente marcada.

     El material es el de la app: vidrio teñido del color de su tipo, con su
     canto de luz, su sombra y un reflejo que se desplaza muy despacio. Apagado
     no se mueve nada y el color se va: un recordatorio que no va a sonar no
     tiene por qué brillar igual que uno que sí. */
  function tarjetaAlerta(a) {
    return cajaAlerta(a, {
      id: a.id,
      activa: !!a.activa,
      control: '<button class="sw ' + (a.activa ? 'on' : '') + '" data-tog="' + a.id + '" ' +
        'role="switch" aria-checked="' + a.activa + '" ' +
        'aria-label="Activar ' + esc(a.titulo) + '"></button>'
    });
  }

  function cajaAlerta(a, o) {
    const t = Alertas.TIPOS[a.tipo] || Alertas.TIPOS.libre;
    const horas = (a.horas || []).slice();
    const iSig = proximaHora(a, horas);
    const grande = horas[iSig] || horas[0] || '--:--';
    const editable = o.id ? ' data-edit="' + o.id + '"' : '';

    /* La tira solo cuando hay mas de una: con una sola hora, repetir debajo la
       que ya esta en grande es ruido. */
    const tira = horas.length > 1
      ? '<div class="rec-tira"' + editable + '>' +
        horas.map(function (h, i) {
          return '<span class="rec-h' + (i === iSig ? ' sig' : '') +
            (i < iSig ? ' ida' : '') + '">' + esc(UI.hora(h)) + '</span>';
        }).join('') + '</div>'
      : '';

    return '<div class="rec' + (o.activa ? '' : ' apagada') + '" ' +
      'style="--tono:' + (t.tono || 'var(--acc)') + '">' +
      /* Sin silueta al fondo: seria el mismo icono que ya lleva la baldosa a dos
         centimetros, y encima cae justo detras del interruptor. El color de la
         tarjeta ya dice de que tipo es. */
      '<div class="rec-cab">' +
      '<span class="rec-ico">' + icon(t.icono) + '</span>' +
      '<div class="grow" style="min-width:0"' + editable + '>' +
      '<div class="rec-hora">' + esc(UI.hora(grande)) +
      (horas.length > 1
        ? '<i>+' + (horas.length - 1) + '</i>' : '') + '</div>' +
      '<div class="rec-que">' + esc(Alertas.tituloEn(a, grande)) + '</div>' +
      '<div class="rec-dias">' + esc(Alertas.resumenDias(a)) + '</div>' +
      '</div>' +
      o.control +
      '</div>' +
      /* Lo que va a decir, en una línea y en pequeño. Sin esto hay que esperar
         a que suene para saber si el recordatorio sabe de tu menú. */
      (function () {
        const ad = Alertas.adelantoEn ? Alertas.adelantoEn(a, grande) : '';
        return ad ? '<div class="rec-adelanto">' + esc(ad) + '</div>' : '';
      })() +
      tira +
      (o.pie || '') +
      '</div>';
  }

  /* Cual de sus horas es la siguiente que va a sonar. Si ya han pasado todas,
     la primera: manana vuelve a empezar por ahi. */
  function proximaHora(a, horas) {
    const ahora = new Date().getHours() * 60 + new Date().getMinutes();
    for (let i = 0; i < horas.length; i++) {
      const m = String(horas[i]).match(/^(\d{1,2}):(\d{2})$/);
      if (m && Number(m[1]) * 60 + Number(m[2]) >= ahora) return i;
    }
    return 0;
  }

  V.alertas.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('perfil'); });
    bind(root, '[data-a=nueva]', function () { alertaSheet(null); });

    bind(root, '[data-a=avisos]', avisosSheet);

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

    /* Con la fecha en el nombre: de otra manera, la tercera descarga se llama
       «training-fr-alertas (2).ics» y no hay forma de saber cuál es la buena. */
    const bajarICS = function (texto, sufijo, aviso) {
      if (!texto) { UI.toast('No hay nada que llevar al calendario'); return; }
      const d = new Date();
      const dd = function (n) { return String(n).padStart(2, '0'); };
      const blob = new Blob([texto], { type: 'text/calendar;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'training-fr-alertas' + sufijo + '-' +
        d.getFullYear() + dd(d.getMonth() + 1) + dd(d.getDate()) + '.ics';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      UI.toast(aviso);
    };

    /* ---------- hasta cuándo ----------
       Se pregunta antes de bajarlo y no en una preferencia escondida: es una
       decisión que solo tiene sentido en el momento de descargar, y que cambia
       según para qué lo bajes. */
    const plazoSheet = function () {
      let elegido = Alertas.plazoActual().id;

      const fin = function (id) {
        const t = Alertas.finDe(id);
        return t ? 'Hasta el ' + UI.fechaCorta(t) + ' de ' + new Date(t).getFullYear()
          : 'Sin fecha de fin';
      };

      const opciones = function () {
        return Alertas.PLAZOS.map(function (p) {
          return '<button class="opcion ' + (elegido === p.id ? 'on' : '') +
            '" data-plazo="' + esc(p.id) + '" style="--tono:var(--acc)">' +
            '<span class="op-ico">' + icon(p.meses ? 'timer' : 'reloj') + '</span>' +
            '<span class="grow"><span class="op-nom">' + esc(p.label) + '</span>' +
            '<span class="op-sub">' + esc(p.sub) + ' · ' + esc(fin(p.id)) + '</span></span>' +
            '<span class="op-marca">' + icon('check') + '</span></button>';
        }).join('');
      };

      UI.modal(html`
        <div class="conf-disco cambio">${raw(icon('calendario'))}</div>
        <h2 class="conf-tit">¿Hasta cuándo?</h2>
        <p class="muted conf-txt">Los avisos se repiten cada semana. Dime hasta qué fecha
        los quieres en el calendario; puedes volver a descargarlo cuando quieras para
        estirarlos.</p>

        <div class="opciones" id="pz-lista">${raw(opciones())}</div>

        <div class="cb-acciones" style="margin-top:16px">
          <button class="btn primary grow btn-arranque" data-x="ok">
            ${raw(icon('down'))} Descargar</button>
          <button class="btn vidrio" data-x="no">Cancelar</button>
        </div>`,
        function (el) {
          /* El clic se escucha en la lista y no en cada botón: al repintarla
             para mover la marca, los botones son otros y los manejadores que
             tenían se van con los viejos. Enganchados uno a uno, la primera
             elección quedaba clavada y las siguientes no hacían nada. */
          const lista2 = el.querySelector('#pz-lista');
          lista2.onclick = function (ev) {
            const b = ev.target.closest('[data-plazo]');
            if (!b) return;
            elegido = b.dataset.plazo;
            lista2.innerHTML = opciones();
          };
          el.querySelector('[data-x=no]').onclick = function () { UI.closeModal(); };
          el.querySelector('[data-x=ok]').onclick = function () {
            UI.closeModal();
            bajarICS(Alertas.ics(elegido), '',
              'Archivo descargado. Ábrelo para añadirlo al calendario.');
            render();
          };
        });
    };

    bind(root, '[data-a=calendario]', plazoSheet);

    bind(root, '[data-a=quitarcal]', function () {
      UI.confirm('Quitarlos del calendario',
        'Se descarga un archivo que retira los avisos de Training FR de tu calendario. ' +
        'Ábrelo y acéptalo igual que el otro. Tus recordatorios de la app no se tocan.',
        'Descargar').then(function (ok) {
        if (!ok) return;
        bajarICS(Alertas.icsCancelar(), '-quitar',
          'Archivo descargado. Ábrelo para retirarlos del calendario.');
      });
    });
  };

  /* ---------- el formulario ----------
     Era una pila de campos sueltos: siete pastillas grises iguales para el tipo,
     dos cajas de texto sin decir cuál era cuál, las horas, un desplegable
     escondido y siete pastillas más para los días. Se rellenaba a ciegas: no
     sabías qué ibas a crear hasta crearlo.

     Ahora lo primero es lo que vas a crear. Arriba del todo va el recordatorio
     tal y como va a quedar en la lista —la misma tarjeta, no un dibujo
     parecido— y se rehace con cada cosa que tocas. Debajo, lo que se elige:
     el tipo con su icono y su color, los textos con su nombre, las horas y los
     días.

     Un formulario que enseña el resultado mientras lo rellenas no necesita
     explicar casi nada. */
  function alertaSheet(existente) {
    const a = existente ? JSON.parse(JSON.stringify(existente)) : Alertas.nueva('entreno');

    UI.modal(html`
      <h2>${existente ? 'Editar recordatorio' : 'Nuevo recordatorio'}</h2>

      <!-- Con su rotulo. Uno nuevo nace con los valores por defecto del tipo
           —«Toca entrenar», 18:00, de lunes a viernes— que son justo los del
           que ya suele tener creado, asi que la vista previa se lee como si
           hubieras abierto ese. Decir que es una vista previa lo desambigua. -->
      <div class="al-previo">${existente ? 'Así queda' : 'Así va a quedar'}</div>
      <div id="al-vista" class="al-vista"></div>
      <p class="tiny al-repe" id="al-repe" hidden></p>

      <label class="tiny">QUÉ ES</label>
      <div class="al-tipos">
        ${raw(Object.keys(Alertas.TIPOS).map(function (k) {
          const t = Alertas.TIPOS[k];
          return '<button class="al-tipo' + (a.tipo === k ? ' on' : '') + '" data-tipo="' + k +
            '" style="--tono:' + (t.tono || 'var(--acc)') + '">' +
            '<span class="alt-ico">' + icon(t.icono) + '</span>' +
            '<span class="alt-nom">' + esc(t.label) + '</span></button>';
        }).join(''))}
      </div>

      <label class="tiny">QUÉ DICE</label>
      <div class="al-campos">
        <div class="al-campo">
          <span class="alc-et">Título</span>
          <input id="al-tit" value="${a.titulo}" placeholder="Toca entrenar">
        </div>
        <div class="al-campo">
          <span class="alc-et">Debajo</span>
          <input id="al-msg" value="${a.mensaje}" placeholder="Opcional">
        </div>
      </div>
      <p class="tiny" id="al-nota-ia" style="margin:7px 0 0">El texto lo escribe tu
      entrenador cada día con lo que llevas hecho, así que el de aquí arriba solo sale
      si la IA no está disponible a esa hora.</p>

      <label class="tiny" style="margin-top:16px;display:block">A QUÉ HORA</label>
      <div class="al-horas" id="al-horas"></div>
      <div class="row" style="gap:8px;margin-top:9px">
        <input id="al-hora" type="time" value="${a.horas[0]}" class="grow">
        <button class="btn sm" data-x="addhora">${raw(icon('plus'))} Añadir</button>
      </div>

      <details class="al-repartir" id="al-repartir">
        <summary>${raw(icon('chevron'))} Repartir varias veces al día</summary>
        <p class="tiny" style="margin:9px 0">Para el agua o las comidas: dime cuántas veces
        y entre qué horas, y las coloco repartidas.</p>
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
      </details>

      <div class="row between" style="margin-top:16px;align-items:baseline">
        <label class="tiny" style="margin:0">QUÉ DÍAS</label>
        <span class="row" style="gap:6px">
          <button class="btn sm ghost" data-dias="todos">Todos</button>
          <button class="btn sm ghost" data-dias="semana">L-V</button>
        </span>
      </div>
      <!-- Siete circulos y no siete pastillas con el nombre entero: los dias de
           la semana se reconocen por su inicial, y en una fila entran de un
           vistazo en vez de en dos renglones. -->
      <div class="al-dias">
        ${raw([1, 2, 3, 4, 5, 6, 0].map(function (d) {
          return '<button class="al-dia' + (a.dias.indexOf(d) !== -1 ? ' on' : '') +
            '" data-dia="' + d + '" aria-label="' + esc(UI.diaLargo(Alertas.DIAS[d])) + '">' +
            esc(UI.inicialDia(d)) + '</button>';
        }).join(''))}
      </div>

      <button class="btn primary block btn-arranque" data-x="guardar"
              style="margin-top:18px">Guardar</button>
      ${raw(existente ? '<button class="btn danger block sm" data-x="borrar" ' +
        'style="margin-top:8px">Borrar recordatorio</button>' : '')}`,
      function (el) {
        /* La vista previa: la misma tarjeta que va a salir en la lista, rehecha
           cada vez que cambia algo. Es lo que convierte el formulario en algo
           que se entiende sin leer las etiquetas. */
        /* Y si ya tiene uno igual, se dice. Dos recordatorios del mismo tipo a
           la misma hora suenan dos veces por nada, y con los valores por
           defecto es facil crearlo sin darse cuenta. */
        const avisarRepetido = function () {
          const aviso = el.querySelector('#al-repe');
          if (!aviso) return;
          const choca = Alertas.lista().filter(function (x) {
            return x.id !== a.id && x.tipo === a.tipo &&
              (x.horas || []).some(function (h) { return a.horas.indexOf(h) !== -1; });
          })[0];
          aviso.hidden = !choca;
          if (choca) {
            aviso.textContent = 'Ya tienes «' + choca.titulo + '» a esa hora. Si lo ' +
              'guardas, sonarán los dos.';
          }
        };

        const pintarVista = function () {
          avisarRepetido();
          el.querySelector('#al-vista').innerHTML = cajaAlerta({
            tipo: a.tipo,
            titulo: el.querySelector('#al-tit').value.trim() ||
              (Alertas.TIPOS[a.tipo] || {}).titulo || 'Recordatorio',
            horas: a.horas.slice().sort(),
            dias: a.dias.slice()
          }, { activa: true, control: '' });
        };

        el.querySelectorAll('[data-tipo]').forEach(function (b) {
          b.onclick = function () {
            a.tipo = b.dataset.tipo;
            const t = Alertas.TIPOS[a.tipo];
            el.querySelectorAll('[data-tipo]').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            el.querySelector('#al-tit').value = t.titulo;
            el.querySelector('#al-msg').value = t.mensaje;
            notaIA();
            pintarVista();
          };
        });

        /* La advertencia de que el texto lo pone la IA solo tiene sentido en el
           tipo que lo hace; en los demás estorba. */
        const notaIA = function () {
          const nota = el.querySelector('#al-nota-ia');
          if (nota) nota.hidden = !(Alertas.esDeIA && Alertas.esDeIA(a.tipo));
        };
        notaIA();

        el.querySelector('#al-tit').oninput = pintarVista;

        /* las horas se pintan como fichas que se quitan al tocarlas */
        const pintarHoras = function () {
          const caja = el.querySelector('#al-horas');
          a.horas = a.horas.slice().sort();
          caja.innerHTML = a.horas.map(function (h) {
            return '<button class="al-h" data-quitar="' + esc(h) + '">' +
              esc(UI.hora(h)) + icon('close') + '</button>';
          }).join('') || '<span class="tiny">Sin horas: añade al menos una.</span>';
          caja.querySelectorAll('[data-quitar]').forEach(function (b) {
            b.onclick = function () {
              a.horas = a.horas.filter(function (h) { return h !== b.dataset.quitar; });
              pintarHoras();
            };
          });
          pintarVista();
        };
        pintarHoras();

        el.querySelector('[data-x=addhora]').onclick = function () {
          const v = el.querySelector('#al-hora').value;
          if (!v) return;
          if (a.horas.indexOf(v) === -1) a.horas.push(v);
          pintarHoras();
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
          el.querySelector('#al-repartir').open = false;
          UI.toast(a.horas.length + ' avisos repartidos');
        };

        const pintarDias = function () {
          el.querySelectorAll('[data-dia]').forEach(function (b) {
            b.classList.toggle('on', a.dias.indexOf(Number(b.dataset.dia)) !== -1);
          });
          pintarVista();
        };

        el.querySelectorAll('[data-dia]').forEach(function (b) {
          b.onclick = function () {
            const d = Number(b.dataset.dia);
            const i = a.dias.indexOf(d);
            if (i === -1) a.dias.push(d); else a.dias.splice(i, 1);
            pintarDias();
          };
        });

        el.querySelectorAll('[data-dias]').forEach(function (b) {
          b.onclick = function () {
            a.dias = b.dataset.dias === 'todos' ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
            pintarDias();
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
