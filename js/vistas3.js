/* vistas3.js — la bóveda: un único sitio para las claves de los servicios
   externos, con el paso a paso para conseguir cada una.

   Todas se guardan en el almacenamiento de este navegador. Ninguna viaja al
   repositorio, que es público, ni se envía a nadie salvo al servicio que le
   corresponde. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const bindAll = function (r, s, f) { return App.bindAll(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };
  const render = function () { return App.render(); };

  /* Bloque plegable con las instrucciones de cada servicio */
  /* Los pasos llegan como lista y no pegados: asi cada <li> es una frase
     entera que el diccionario puede casar. La etiqueta viaja dentro, como los
     asteriscos del manual, porque en ingles la negrita no cae en la misma
     palabra. */
  function guia(id, titulo, pasos) {
    const lista = Array.isArray(pasos) ? pasos.map(function (x) { return T(x); }).join('')
      : raw(pasos);
    return html`
      <button class="guia-tit" data-guia="${id}">
        ${raw(icon('chevron'))} ${titulo}
      </button>
      <div class="guia" data-guia-cuerpo="${id}" hidden>
        <ol class="instr">${raw(lista)}</ol>
      </div>`;
  }

  /* Qué secciones quedan abiertas. Vive fuera del pintado porque esta pantalla
     se repinta entera al guardar una clave o cambiar de proveedor, y sin esto la
     sección que acabas de abrir se te cierra sola. */
  const abiertas = {};

  /* Cada servicio, plegado. Antes la bóveda era una tira de seis tarjetas
     abiertas: para llegar a Supabase había que pasar por toda la configuración
     de la IA y de Spotify. Plegadas se ve el estado de todo de un vistazo y se
     abre lo que se va a tocar.

     El botón de probar va EN la cabecera, que es lo que se quiere hacer sin
     tener que abrir nada; y al probar se abre la sección sola, porque la
     respuesta entera se pinta dentro. */
  /* Cada servicio con su cara: su icono, su color y su silueta al fondo. Eran
     cinco cajas grises iguales con un galón pequeño a la izquierda, y para
     saber cuál era la de Spotify había que leer el título. El dibujo y el color
     se reconocen antes que la palabra.

     El galón se va al canto derecho, que es donde lo busca la mano, y el estado
     deja de ser una pastilla más para ser un punto de color con su palabra: lo
     único que uno quiere saber de un vistazo es si está puesto. */
  function plegable(o) {
    return html`
      <details class="bov" data-bov="${o.id}" style="--tono:${raw(o.tono || 'var(--acc)')}"
               ${raw(abiertas[o.id] ? ' open' : '')}>
        <summary>
          <span class="bov-silueta" aria-hidden="true">${raw(icon(o.ico || 'llave'))}</span>
          <span class="bov-ico">${raw(icon(o.ico || 'llave'))}</span>
          <span class="grow">
            <span class="bov-tit">${T(o.titulo)}</span>
            <span class="tiny bov-sub">${o.resumen}</span>
          </span>
          ${raw(o.probar ? '<button class="btn sm vidrio bov-probar" data-probar="' +
            esc(o.probar) + '">' + esc(T('Probar')) + '</button>' : '')}
          ${raw(o.chip || '')}
          <span class="chevron bov-flecha">${raw(icon('chevron'))}</span>
        </summary>
        <div class="bov-cuerpo">${raw(o.cuerpo)}</div>
      </details>`;
  }

  /* El estado, como un punto y una palabra. Verde puesto, gris sin poner,
     ámbar cuando hay algo que hacer. */
  function estadoPunto(clase, texto) {
    return '<span class="bov-estado ' + clase + '"><i></i>' + esc(T(texto)) + '</span>';
  }

  function estado(ok, textoOk, textoNo) {
    return ok ? estadoPunto('ok', textoOk) : estadoPunto('no', textoNo);
  }

  /* Campo de clave: siempre oculto de entrada, con un botón para revelarlo.
     Antes se veían enteras en pantalla, que es justo lo que no debe pasar
     cuando alguien mira por encima del hombro. */
  function campoSecreto(id, valor, marcador) {
    return html`
      <div class="secreto">
        <input id="${id}" type="password" autocomplete="off" spellcheck="false"
               value="${valor || ''}" placeholder="${marcador}">
        <button class="btn sm" data-ver="${id}" aria-label="Mostrar u ocultar">
          ${raw(icon('ojo'))}</button>
      </div>`;
  }

  /* El campo de una clave, entero: el rótulo, la huella de la que ya está
     guardada en la misma línea —a la derecha, donde no estorba— y el campo
     debajo. Antes el rótulo iba en una línea, el campo en otra y «Guardada:
     AQ.Ab8…o01g» en una tercera, con lo que cada clave ocupaba tres renglones
     para decir dos cosas. */
  function campoClave(etiqueta, id, valor, marcador) {
    return html`
      <div class="clave-bloque">
        <div class="cb-cab">
          <span class="cb-lab">${etiqueta}</span>
          ${raw(valor
            ? '<span class="cb-huella">' + icon('check') + '<code>' +
              esc(resumida(valor)) + '</code></span>'
            : '<span class="cb-huella vacia">' + esc(T('sin guardar')) + '</span>')}
        </div>
        ${raw(campoSecreto(id, valor, marcador))}
      </div>`;
  }

  /* La fila de acciones de cada servicio. Guardar es lo que se viene a hacer y
     pesa; lo de al lado —probar, conectar, desconectar— es vidrio, que es como
     se dice «esto también se pulsa, pero no es lo principal». */
  function acciones(principal, resto) {
    return '<div class="cb-acciones">' + principal + (resto || '') + '</div>';
  }

  /* Muestra solo el principio y el final: suficiente para reconocerla */
  function resumida(clave) {
    const s = String(clave || '');
    if (s.length < 14) return '••••••••';
    return s.slice(0, 6) + '••••••' + s.slice(-4);
  }

  /* Campo para copiar al portapapeles: la URL de retorno hay que pegarla
     literalmente en el panel de cada servicio */
  function copiable(valor, etiqueta) {
    return html`
      <div class="copiable">
        <code>${valor}</code>
        <button class="cop-b" data-copiar="${valor}"
          aria-label="Copiar ${etiqueta || 'valor'}">${raw(icon('copy'))}</button>
      </div>`;
  }

  /* Cómo se consigue la clave de cada uno. Son cuatro consolas distintas y
     ninguna se parece a otra, así que no vale un texto genérico. */
  const PASOS_CLAVE = {
    groq: [
      '<li>Entra en <a href="https://console.groq.com/keys" target="_blank" ' +
      'rel="noopener noreferrer">console.groq.com/keys</a> y crea una cuenta. ' +
      'No pide tarjeta.</li>',
      '<li>Pulsa <b>Create API Key</b>, ponle un nombre y cópiala ' +
      '(empieza por <code>gsk_</code>). Solo se enseña una vez.</li>',
      '<li>Pégala aquí y <b>Guardar</b>. Después toca <b>Ver los suyos</b> para que la ' +
      'lista de modelos se llene con los que tengas de verdad.</li>',
      '<li>La capa gratuita da de sobra para esta app. El límite exacto lo ves en tu ' +
      'propia consola: lo cambian cada poco y no me lo invento aquí.</li>'
    ],
    openrouter: [
      '<li>Entra en <a href="https://openrouter.ai/keys" target="_blank" ' +
      'rel="noopener noreferrer">openrouter.ai/keys</a> y crea una cuenta.</li>',
      '<li>Pulsa <b>Create Key</b> y cópiala (empieza por <code>sk-or-v1-</code>).</li>',
      '<li>Pégala aquí y <b>Guardar</b>. En la lista de modelos salen primero los que ' +
      'acaban en <b>:free</b>: esos no cuestan nada y no hace falta meter saldo.</li>',
      '<li>Si algún día quieres uno de pago —Claude, Gemini, GPT— metes saldo y lo ' +
      'eliges de la misma lista, con la misma clave.</li>'
    ],
    mistral: [
      '<li>Entra en <a href="https://console.mistral.ai/api-keys" target="_blank" ' +
      'rel="noopener noreferrer">console.mistral.ai</a> y crea una cuenta.</li>',
      '<li>Crea una clave en <b>API Keys</b> y cópiala.</li>',
      '<li>Pégala aquí y <b>Guardar</b>, y toca <b>Ver los suyos</b> para la lista de ' +
      'modelos.</li>',
      '<li>Tiene capa gratuita; si la agotas, te lo dirá al llamar.</li>'
    ],
    gemini: [
      '<li>Entra en <a href="https://aistudio.google.com/apikey" target="_blank" ' +
      'rel="noopener noreferrer">aistudio.google.com/apikey</a> con tu cuenta de Google.</li>',
      '<li>Pulsa <b>Create API key</b>. Si pide proyecto, deja el que propone.</li>',
      '<li>Copia la clave (empieza por <code>AIza</code>), pégala aquí y <b>Guardar</b>.</li>',
      '<li>Es gratis dentro del límite diario, que sobra para uso personal. Al superarlo ' +
      'la app avisa y el resto sigue funcionando.</li>'
    ],
    anthropic: [
      '<li>Entra en <a href="https://console.anthropic.com/settings/keys" target="_blank" ' +
      'rel="noopener noreferrer">console.anthropic.com</a> y crea una cuenta.</li>',
      '<li>Mete saldo en <b>Billing</b>: se paga por uso y no hay capa gratuita. ' +
      'Si tienes Claude Pro, <b>no vale aquí</b>: la suscripción y la API se facturan ' +
      'por separado.</li>',
      '<li>En <b>API Keys</b> pulsa <b>Create Key</b> y copia la clave ' +
      '(empieza por <code>sk-ant-</code>). Solo se enseña una vez.</li>',
      '<li>Pégala aquí y <b>Guardar</b>. Con lo que hace esta app, unos pocos euros ' +
      'duran meses.</li>'
    ],
    deepseek: [
      '<li>Entra en <a href="https://platform.deepseek.com/api_keys" target="_blank" ' +
      'rel="noopener noreferrer">platform.deepseek.com</a> y crea una cuenta.</li>',
      '<li>Mete saldo: se paga por uso y es de lo más barato que hay.</li>',
      '<li>En <b>API keys</b> crea una y cópiala (empieza por <code>sk-</code>).</li>',
      '<li>Pégala aquí y <b>Guardar</b>. Ojo: no lee fotos, así que deja Gemini o ' +
      'Anthropic puestos si usas el cálculo de comida por foto.</li>'
    ],
    grok: [
      '<li>Entra en <a href="https://console.x.ai" target="_blank" ' +
      'rel="noopener noreferrer">console.x.ai</a> y crea una cuenta.</li>',
      '<li>Mete saldo en <b>Billing</b> y crea una clave en <b>API Keys</b> ' +
      '(empieza por <code>xai-</code>).</li>',
      '<li>Pégala aquí y <b>Guardar</b>.</li>',
      '<li>Los nombres de sus modelos cambian a menudo. Si da error de modelo, mira ' +
      'cuál tienes disponible en tu consola y escríbelo en el campo de abajo.</li>'
    ]
  };

  V.claves = function () {
    const cfgIA = IA.config();
    const provId = IA.proveedor();
    const prov = IA.proveedorActual();
    const claveProv = IA.claveDe(provId);
    const puestos = IA.configurados();
    const cfgSp = Spotify.config();
    const cfgSync = Sync.config() || {};
    const retorno = location.origin + location.pathname;

    /* La línea que se lee sin abrir. Dice lo único que uno quiere saber de un
       vistazo: si está puesto y con qué. */
    const resumenIA = claveProv
      ? esc(Tn('{prov} · clave guardada · {modelo}',
          { prov: prov.label, modelo: IA.modeloDe(prov.id) }))
      : (puestos.length
        ? esc(Tn('Activo con otro proveedor; {prov} aún sin clave', { prov: prov.label }))
        : esc(T('Sin clave: el entrenador y el plan de comidas no funcionan')));

    const resumenSp = esc(Spotify.permisosCaducados()
      ? T('Hay que reconectar para dar los permisos nuevos')
      : (Spotify.activa() ? T('Conectado · puede reproducir y crear listas')
        : (Spotify.configurado() ? T('Client ID puesto, falta conectar la cuenta')
          : T('Sin Client ID: la música no se puede controlar desde aquí'))));

    const resumenSb = esc(Sync.activa()
      ? T('Sesión abierta · tus datos viajan entre dispositivos')
      : (Sync.configurado() ? T('Proyecto configurado, sin sesión iniciada')
        : T('Sin configurar: los datos solo viven en este dispositivo')));

    return html`
      <button class="btn sm ghost" data-a="atras" style="margin-bottom:10px">
        ${raw(icon('back'))} ${T('Ajustes')}</button>
      <h1>${T('Bóveda de claves')}</h1>
      <p class="muted">${T('Aquí se guardan las claves de los servicios que usa la app. ' +
      'Se quedan en este dispositivo: no viajan al repositorio ni las ve nadie más.')}</p>

      <!-- ============ nucleo inteligente ============ -->
      <div class="list-title">${T('Núcleo inteligente')}</div>
      ${raw(plegable({
        id: 'ia',
        ico: 'chispa',
        tono: 'var(--acc)',
        titulo: 'Quién piensa por la app',
        resumen: resumenIA,
        chip: estado(IA.activa(), 'Activo', 'Sin configurar'),
        probar: claveProv ? 'ia' : '',
        cuerpo: html`
        <p class="tiny" style="margin:0 0 9px">${T('Auditoría de rutinas, plan de ' +
        'comidas, foto del plato, entrenador y listas de música.')}</p>

        <p class="tiny" style="margin:0 0 9px">${T('Elige quién contesta. Cada uno guarda ' +
        'su propia clave, así que puedes tener varios puestos y cambiar de uno a otro con ' +
        'un toque; lo que cambies aquí vale para toda la app.')}</p>

        <div class="row wrap" style="gap:6px;margin-bottom:12px" id="ia-provs">
          ${raw(IA.PROVEEDORES.map(function (pv) {
            const tiene = puestos.indexOf(pv.id) !== -1;
            return '<button class="chip ' + (pv.id === provId ? 'on' : '') +
              '" data-prov="' + pv.id + '">' + esc(pv.label) +
              (pv.gratis ? ' <span class="tiny" style="opacity:.7">' +
                esc(T('gratis')) + '</span>' : '') +
              (tiene ? ' <span class="punto-ok"></span>' : '') + '</button>';
          }).join(''))}
        </div>

        <div class="nota-prov">
          <span class="np-ico">${raw(icon('chispa'))}</span>
          <span class="grow">
            <span class="np-txt">${T(prov.nota)}</span>
            <span class="np-txt">${raw(Tn('La clave se saca en {donde}.',
              { donde: '<a href="' + esc(prov.donde) + '" target="_blank" ' +
                'rel="noopener noreferrer">' + esc(prov.dondeTxt) + '</a>' }))}
              ${raw(prov.imagen ? '' : Tn('{no}, así que el cálculo de la comida por foto ' +
                'necesita Gemini o Anthropic.',
                { no: '<b>' + esc(T('No lee fotos')) + '</b>' }))}</span>
          </span>
        </div>

        ${raw(campoClave(Tn('Clave de {prov}', { prov: prov.label }),
          'k-ia', claveProv, prov.pista === 'sin prefijo fijo'
            ? T(prov.pista) : prov.pista))}

        <div class="clave-bloque">
          <div class="cb-cab">
            <span class="cb-lab">${T('Modelo')}</span>
            ${raw(claveProv || prov.listaPublica
              ? '<button class="btn sm vidrio cb-mini" data-a="refrescarModelos">' +
                icon('cambiar') + ' ' + esc(T('Ver los suyos')) + '</button>' : '')}
          </div>
        <select id="k-ia-modelo" style="margin:0 0 8px">
          ${raw((function () {
            const actual = IA.modeloDe(prov.id);
            const lista = prov.modelos.indexOf(actual) === -1
              ? [actual].concat(prov.modelos) : prov.modelos;
            return lista.map(function (m) {
              return '<option value="' + esc(m) + '"' + (actual === m ? ' selected' : '') +
                '>' + esc(m) + '</option>';
            }).join('');
          })())}
        </select>
        <input id="k-ia-modelo-libre" placeholder="${T('o escribe otro nombre de modelo')}"
               autocomplete="off" spellcheck="false" style="margin:0">
        </div>

        ${raw(acciones(
          '<button class="btn primary grow btn-arranque" data-a="guardarIA">' +
            icon('check') + ' ' + esc(T('Guardar')) + '</button>',
          '<button class="btn vidrio" data-a="probarIA"' + (claveProv ? '' : ' disabled') + '>' +
            icon('beep') + ' ' + esc(T('Probar')) + '</button>'))}
        <div class="tiny cb-estado" id="ia-estado"></div>

        ${raw(guia('ia', Tn('Cómo consigo la clave de {prov}', { prov: prov.label }),
          PASOS_CLAVE[prov.id]))}

        ${raw(claveProv ? '<button class="btn danger block sm" data-a="borrarIA" ' +
          'style="margin-top:10px">' +
          esc(Tn('Borrar la clave de {prov}', { prov: prov.label })) + '</button>' : '')}`
      }))}

      <!-- ============ Spotify ============ -->
      <div class="list-title">${T('Música · Spotify')}</div>
      ${raw(plegable({
        id: 'sp',
        ico: 'musica',
        tono: '#1db954',
        titulo: 'Client ID de Spotify',
        resumen: resumenSp,
        chip: Spotify.permisosCaducados()
          ? estadoPunto('avisa', 'Reconectar')
          : estado(Spotify.activa(), 'Conectado',
              Spotify.configurado() ? 'Sin conectar' : 'Sin configurar'),
        cuerpo: html`
        <p class="tiny" style="margin:0 0 9px">${T('Controlar la música desde la pantalla ' +
        'de entrenamiento.')}</p>
        ${raw(Spotify.permisosCaducados()
          ? '<p class="tiny" style="margin:0 0 11px;color:var(--warn)">' +
            esc(T('La app ya puede reproducir por sí misma y crear listas. Pulsa Conectar ' +
            'para dar los permisos nuevos.')) + '</p>'
          : '')}

        ${raw(campoClave('Client ID', 'k-sp', cfgSp.clientId, T('32 caracteres')))}

        ${raw(acciones(
          '<button class="btn primary grow btn-arranque" data-a="guardarSp">' +
            icon('check') + ' ' + esc(T('Guardar')) + '</button>',
          Spotify.configurado()
            ? (Spotify.activa()
              ? '<button class="btn vidrio" data-a="salirSp">' +
                esc(T('Desconectar')) + '</button>'
              : '<button class="btn vidrio" data-a="conectarSp">' + icon('musica') +
                ' ' + esc(T('Conectar')) + '</button>')
            : ''))}

        <div class="clave-bloque" style="margin-top:14px">
          <div class="cb-cab"><span class="cb-lab">${T('Dirección de retorno')}</span>
            <span class="cb-pista">${T('cópiala en el panel')}</span></div>
          ${raw(copiable(retorno, T('dirección de retorno')))}
        </div>

        ${raw(guia('sp', T('Cómo consigo el Client ID'), [
          '<li>Entra en <a href="https://developer.spotify.com/dashboard" target="_blank" ' +
          'rel="noopener noreferrer">developer.spotify.com/dashboard</a> con tu cuenta de ' +
          'Spotify y acepta las condiciones de desarrollador.</li>',
          '<li>Pulsa <b>Create app</b>. En nombre y descripción pon lo que quieras, ' +
          'por ejemplo <i>Training FR</i>.</li>',
          '<li>En <b>Redirect URIs</b> pega la dirección de retorno de arriba, tal cual, ' +
          'y pulsa <b>Add</b>. Tiene que coincidir carácter por carácter.</li>',
          '<li>Marca la casilla <b>Web API</b> y guarda.</li>',
          '<li>Abre la app recién creada, ve a <b>Settings</b> y copia el <b>Client ID</b>. ' +
          'El <i>Client Secret</i> no hace falta: esta app usa PKCE, que no necesita secretos.</li>',
          '<li>Pégalo aquí, pulsa <b>Guardar</b> y luego <b>Conectar</b> para autorizar tu cuenta.</li>',
          '<li>Al publicar la app en internet, vuelve al panel y añade también la ' +
          'dirección definitiva en <b>Redirect URIs</b>.</li>'
        ]))}

        ${raw(Spotify.configurado() ? '<button class="btn danger block sm" data-a="borrarSp" ' +
          'style="margin-top:10px">' + esc(T('Borrar la configuración de Spotify')) +
          '</button>' : '')}`
      }))}

      <!-- ============ Supabase ============ -->
      ${raw(!Sync.puedeConfigurar() ? html`
        <div class="list-title">${T('Cuenta y sincronización')}</div>
        <div class="card tarjeta-premium">
          <div class="pre-encima">${T('No tienes que tocar nada')}</div>
          <div style="font-weight:700;font-size:1rem;margin:5px 0 4px">${T('La lleva quien ' +
          'administra')}</div>
          <p class="muted" style="margin:0;font-size:.88rem">${T('Tus datos viajan a la ' +
          'base de datos de quien te dio el acceso, y solo los ves tú: la base no deja que ' +
          'nadie lea lo de otra persona.')}</p>
        </div>` : html`
      <div class="list-title">${T('Cuenta y sincronización · Supabase')}</div>
      ${raw(plegable({
        id: 'sb',
        ico: 'nube',
        tono: '#4f8cf5',
        titulo: 'Proyecto de Supabase',
        resumen: resumenSb,
        chip: estado(Sync.activa(), 'Conectado',
          Sync.configurado() ? 'Sin sesión' : 'Sin configurar'),
        cuerpo: html`
        <p class="tiny" style="margin:0 0 9px">${T('Entrar con tu correo y sincronizar ' +
        'entre dispositivos.')}</p>

        <div class="clave-bloque">
          <div class="cb-cab"><span class="cb-lab">Project URL</span></div>
          <input id="k-sb-url" autocomplete="off" spellcheck="false"
                 value="${cfgSync.url || ''}" placeholder="https://xxxxxxxx.supabase.co">
        </div>
        ${raw(campoClave(T('Clave publishable (o anon)'), 'k-sb-key', cfgSync.key,
          'sb_publishable_... o eyJhbGciOi...'))}
        ${raw(acciones('<button class="btn primary grow btn-arranque" data-a="guardarSb">' +
          icon('check') + ' ' + esc(T('Guardar')) + '</button>'))}

        <div class="clave-bloque" style="margin-top:14px">
          <div class="cb-cab"><span class="cb-lab">${T('Dirección de retorno')}</span>
            <span class="cb-pista">${T('cópiala en el panel')}</span></div>
          ${raw(copiable(retorno, T('dirección de retorno')))}
        </div>

        <button class="fila-plan fila-suelta" data-a="verpasoapaso" style="--fp:#4f8cf5">
          <span class="fp-ico">${raw(icon('lista'))}</span>
          <span class="grow"><span class="fp-tit">${T('Montarla paso a paso')}</span>
            <span class="fp-sub">${T('Ocho pasos con capturas de cada menú, diciendo qué ' +
            'botón tocar. Esta pantalla es el atajo para quien ya lo tiene montado.')}</span></span>
          <span class="chevron">${raw(icon('chevron'))}</span>
        </button>

        ${raw(guia('sb', T('El resumen, si ya te lo sabes'), [
          '<li><b>Project Settings &rarr; Data API</b>: copia la <b>Project URL</b>.</li>',
          '<li><b>Project Settings &rarr; API Keys</b>: copia la <b>Publishable key</b> ' +
          '(empieza por <code>sb_publishable_</code>). En proyectos antiguos es la ' +
          '<b>anon public</b> de la pestaña <i>Legacy</i>. Las <b>Secret</b> no, nunca.</li>',
          '<li><b>SQL Editor</b>: pega el bloque de abajo y <b>Run</b>. Sin este paso la ' +
          'app se conecta pero no tiene dónde escribir, y es el que más se salta la gente.</li>',
          '<li><b>Authentication &rarr; Sign In / Providers</b>: apaga <b>Confirm email</b>. ' +
          'Viene encendido de fábrica y el correo de Supabase manda dos mensajes por hora.</li>',
          '<li><b>Authentication &rarr; URL Configuration</b>: la dirección de retorno de ' +
          'aquí arriba, en <b>Site URL</b> y en <b>Redirect URLs</b>.</li>',
          '<li>Pega los dos valores aquí y guarda. Luego crea tu cuenta en ' +
          '<b>Perfil &rarr; Mi cuenta</b>.</li>'
        ]) + html`
          <div class="cb-cab" style="margin:12px 0 7px">
            <span class="cb-lab">${T('SQL para crear la tabla')}</span>
            <button class="btn sm vidrio cb-mini" data-a="copiarsql">${raw(icon('copy'))}
              ${T('Copiar')}</button>
          </div>
          <pre class="consola" id="sql-box">${Sync.SQL}</pre>`)}

        ${raw(Sync.configurado() ? '<button class="btn danger block sm" data-a="borrarSb" ' +
          'style="margin-top:10px">' + esc(T('Borrar la configuración de Supabase')) +
          '</button>' : '')}`
      }))}`)}

      <!-- ============ varios dispositivos ============ -->
      <div class="list-title">${T('Varios dispositivos')}</div>
      ${raw(plegable({
        id: 'disp',
        ico: 'compartir',
        tono: '#c06bf0',
        titulo: 'Sincronizar mis claves',
        resumen: esc(Store.settings().sincronizarClaves !== false
          ? T('Encendido · no hay que repetirlas en cada dispositivo')
          : T('Apagado · cada dispositivo lleva las suyas')),
        chip: '',
        cuerpo: html`
        <div class="aj-fila" style="padding-top:0">
          <span class="grow"><span class="aj-tit">${T('Que viajen con mis datos')}</span>
            <span class="aj-sub">${T('Las claves de IA y el Client ID de Spotify, para no ' +
            'repetirlos en cada dispositivo')}</span></span>
          <button class="sw ${Store.settings().sincronizarClaves !== false ? 'on' : ''}"
                  data-a="togglesync" role="switch"
                  aria-checked="${Store.settings().sincronizarClaves !== false}"
                  aria-label="${T('Sincronizar claves')}"></button>
        </div>
        <p class="tiny" style="margin:10px 0 0">${T('Las sesiones abiertas nunca se ' +
        'sincronizan: cada dispositivo abre la suya, que es lo correcto. En uno nuevo solo ' +
        'tendrás que pulsar Conectar en Spotify.')}</p>`
      }))}

      ${raw(Sync.configurado() && Sync.puedeConfigurar() ? html`
        <div class="card tarjeta-premium">
          <div class="pre-encima">${T('Un enlace y ya')}</div>
          <div style="font-weight:700;font-size:1rem;margin:5px 0 4px">${T('Enlazar un ' +
          'dispositivo nuevo')}</div>
          <p class="muted" style="margin:0 0 12px;font-size:.88rem">${T('La configuración ' +
          'de Supabase no puede venir de la nube, porque es justo la que abre la puerta. ' +
          'Abre este enlace en el otro dispositivo y quedará listo para entrar con tu ' +
          'correo.')}</p>
          <div class="row">
            <button class="btn primary grow btn-arranque" data-a="compartirEnlace">
              ${raw(icon('share'))} ${T('Compartir enlace')}</button>
            <button class="btn icon vidrio" data-a="copiarEnlace" aria-label="${T('Copiar enlace')}">
              ${raw(icon('copy'))}</button>
          </div>
          <p class="tiny" style="margin:10px 0 0">${T('El enlace lleva la URL del proyecto ' +
          'y la clave anon, que son públicas por diseño: sin entrar con tu correo no dan ' +
          'acceso a ningún dato.')}</p>
        </div>` : '')}

      <!-- ============ seguridad ============ -->
      <div class="list-title">${T('Seguridad')}</div>
      ${raw(plegable({
        id: 'seg',
        ico: 'llave',
        tono: '#f0a23c',
        titulo: 'Dónde viven las claves',
        resumen: esc(T('Y cómo borrarlas todas de golpe')),
        chip: '',
        cuerpo: html`
        <p class="muted" style="margin:0 0 10px">${T('Las claves viven en el ' +
        'almacenamiento de este navegador y, si la sincronización de claves está activada, ' +
        'también en tu base de datos de Supabase, donde solo tú puedes leerlas.')}</p>
        <p class="tiny" style="margin:0 0 12px">${raw(T('La clave <i>publishable</i> de ' +
        'Supabase y el <i>Client ID</i> de Spotify están pensados para ir en el navegador ' +
        'y no son secretos. Las de IA sí lo son: no las compartas ni las pegues en el ' +
        'código.'))}</p>
        <button class="btn danger block" data-a="borrarTodo">${T('Borrar todas las claves')}</button>`
      }))}`;
  };

  V.claves.mount = function (root) {
    bind(root, '[data-a=atras]', function () { go('ajustes'); });

    /* Abrir y cerrar no repinta nada; solo se apunta, para que el repintado
       siguiente —guardar una clave, cambiar de proveedor— respete lo abierto. */
    root.querySelectorAll('details.bov').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) abiertas[d.dataset.bov] = true;
        else delete abiertas[d.dataset.bov];
      });
    });

    /* Probar desde la cabecera: se abre la sección y se lanza la prueba de
       siempre, porque la respuesta entera se pinta dentro. */
    /* A mano y no con bindAll: hace falta preventDefault, porque un clic dentro
       de un <summary> pliega o despliega por defecto y aquí queremos abrir
       siempre, nunca cerrar. */
    root.querySelectorAll('[data-probar]').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const caja = btn.closest('details.bov');
        if (caja) { caja.open = true; abiertas[caja.dataset.bov] = true; }
        const real = root.querySelector('[data-a=probarIA]');
        if (real) real.click();
      });
    });

    /* guías plegables */
    bindAll(root, '[data-guia]', function (el) {
      const c = root.querySelector('[data-guia-cuerpo="' + el.dataset.guia + '"]');
      if (!c) return;
      c.hidden = !c.hidden;
      el.classList.toggle('abierta', !c.hidden);
    });

    bindAll(root, '[data-ver]', function (el) {
      const campo = root.querySelector('#' + el.dataset.ver);
      if (!campo) return;
      const oculto = campo.type === 'password';
      campo.type = oculto ? 'text' : 'password';
      el.classList.toggle('on', oculto);
    });

    bindAll(root, '[data-copiar]', function (el) {
      const v = el.dataset.copiar;
      if (navigator.clipboard) navigator.clipboard.writeText(v);
      UI.toast('Copiado');
    });

    bind(root, '[data-a=verpasoapaso]', function () { go('basedatos'); });

    const sql = root.querySelector('[data-a=copiarsql]');
    if (sql) sql.onclick = function () {
      const t = root.querySelector('#sql-box').textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t);
      UI.toast('SQL copiado');
    };

    /* ---- núcleo inteligente ---- */

    /* Cambiar de proveedor no guarda nada todavía: solo cambia qué se está
       mirando. Lo que ya tenga clave puesta se queda como estaba. */
    bindAll(root, '[data-prov]', function (el) {
      IA.elegirProveedor(el.dataset.prov);
      const pos = window.scrollY;
      render();
      window.scrollTo(0, pos);
    });

    /* Solo Gemini publica su catálogo con la clave del usuario; los demás llevan
       una lista escrita a mano y un campo para escribir cualquier otra. */
    const selectorModelo = root.querySelector('#k-ia-modelo');
    const rellenarModelos = function (forzar) {
      const prov = IA.proveedorActual();
      if (!selectorModelo || !(IA.claveDe(prov.id) || prov.listaPublica)) return;
      IA.listarModelos(forzar).then(function (lista) {
        if (!lista || !lista.length) return;
        const actual = selectorModelo.value;
        selectorModelo.innerHTML = lista.map(function (m) {
          return '<option value="' + esc(m) + '"' + (m === actual ? ' selected' : '') +
            '>' + esc(m) + '</option>';
        }).join('');
        if (lista.indexOf(actual) === -1) {
          selectorModelo.value = lista[0];
          IA.guardarProveedor(prov.id, IA.claveDe(prov.id), lista[0]);
        }
      }).catch(function () { /* se queda la lista por defecto */ });
    };
    rellenarModelos(false);

    bind(root, '[data-a=refrescarModelos]', function (btn) {
      btn.disabled = true;
      btn.textContent = 'Consultando…';
      IA.listarModelos(true).then(function (lista) {
        rellenarModelos(false);
        btn.disabled = false;
        btn.textContent = 'Actualizar lista';
        UI.toast(lista.length + ' modelos disponibles con tu clave');
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = 'Actualizar lista';
        UI.toast('No se pudo consultar la lista');
      });
    });

    bind(root, '[data-a=guardarIA]', function () {
      const prov = IA.proveedorActual();
      const campo = root.querySelector('#k-ia');
      const libre = root.querySelector('#k-ia-modelo-libre');
      const modelo = (libre && libre.value.trim()) ||
        root.querySelector('#k-ia-modelo').value;
      const clave = campo.value.trim() || IA.claveDe(prov.id) || '';

      if (!clave) { UI.toast('Pega la clave de ' + prov.label); return; }
      try {
        IA.guardarProveedor(prov.id, clave, modelo);
        {
          IA.listarModelos(true).then(function (lista) {
            if (lista && lista.length && lista.indexOf(IA.modeloDe(prov.id)) === -1) {
              IA.guardarProveedor(prov.id, clave, lista[0]);
              UI.toast('Clave guardada. Modelo ajustado a ' + lista[0]);
              render();
            }
          }).catch(function () { /* nada */ });
        }
        render();
        UI.toast(prov.label + ' guardado. Ahora piensa por toda la app.');
      } catch (e) { UI.toast(e.message); }
    });

    /* El test comprueba las dos cosas de las que depende la app, no una.
       Contestar en texto lo hace cualquiera; devolver JSON bien formado no, y
       de eso viven la auditoría de rutinas, el menú semanal y la foto del
       plato. Un modelo pequeño pasa la primera y falla la segunda, y sin este
       aviso te enterabas a mitad de una auditoría. */
    bind(root, '[data-a=probarIA]', function (btn) {
      const salida = root.querySelector('#ia-estado');
      const prov = IA.proveedorActual();
      const linea = function (color, txt) {
        return '<div style="color:var(--' + color + ')">' + txt + '</div>';
      };

      btn.disabled = true;
      salida.innerHTML = '<div class="row" style="gap:8px;align-items:center">' +
        '<span class="spinner" style="width:14px;height:14px"></span>' +
        '<span>Probando ' + esc(prov.label) + '…</span></div>';

      const resultados = [];
      IA.llamar('Responde solo con la palabra: listo', { maxTokens: 512, temperatura: 0 })
        .then(function (r) {
          resultados.push(linea('acc', '✓ Responde: «' + esc(r.slice(0, 40)) + '»'));
          salida.innerHTML = resultados.join('') +
            '<div class="tiny">Comprobando que sepa devolver JSON…</div>';

          return IA.llamarJSON('Devuelve JSON y nada más, con esta forma exacta: ' +
            '{"ok":true,"musculo":"pecho"}', { maxTokens: 512, temperatura: 0 });
        })
        .then(function (j) {
          if (j && typeof j === 'object') {
            resultados.push(linea('acc', '✓ Devuelve JSON bien formado'));
            resultados.push('<div class="tiny" style="margin-top:4px">Listo. ' +
              esc(prov.label) + ' con <b>' + esc(IA.modeloDe(prov.id)) + '</b> vale para ' +
              'todo lo de la app.</div>');
          } else {
            resultados.push(linea('warn', '⚠ Contesta, pero su JSON no se entiende'));
          }
          salida.innerHTML = resultados.join('');
          btn.disabled = false;
        })
        .catch(function (e) {
          /* si falló la primera llamada no hay nada verde que enseñar */
          if (!resultados.length) {
            salida.innerHTML = linea('bad', '✕ ' + esc(e.message));
          } else {
            resultados.push(linea('warn', '⚠ Contesta en texto, pero falla al pedirle ' +
              'JSON: ' + esc(e.message)));
            resultados.push('<div class="tiny" style="margin-top:4px">Sirve para preguntarle ' +
              'cosas, pero la auditoría de rutinas, el menú y la foto del plato van a ' +
              'fallar. Prueba con otro modelo de la lista.</div>');
            salida.innerHTML = resultados.join('');
          }
          btn.disabled = false;
        });
    });

    bind(root, '[data-a=borrarIA]', function () {
      const prov = IA.proveedorActual();
      UI.confirm('Borrar la clave de ' + prov.label,
        'Se olvida solo esa. Si tienes otro proveedor puesto, la app pasa a usarlo.',
        'Borrar', true).then(function (ok) {
        if (ok) { IA.borrarConfig(); render(); UI.toast('Clave borrada'); }
      });
    });

    /* ---- Spotify ---- */
    bind(root, '[data-a=guardarSp]', function () {
      try {
        Spotify.guardarConfig(root.querySelector('#k-sp').value, Spotify.config().playlist || '');
        render();
        UI.toast('Client ID guardado. Ahora pulsa Conectar.');
      } catch (e) { UI.toast(e.message); }
    });

    bind(root, '[data-a=conectarSp]', function () {
      Spotify.entrar().catch(function (e) { UI.toast(e.message); });
    });

    bind(root, '[data-a=salirSp]', function () {
      Spotify.salir(); render(); UI.toast('Spotify desconectado');
    });

    bind(root, '[data-a=borrarSp]', function () {
      UI.confirm('Borrar Spotify', 'Se olvidará el Client ID y la sesión.', 'Borrar', true)
        .then(function (ok) {
          if (ok) { Spotify.borrarConfig(); render(); UI.toast('Configuración borrada'); }
        });
    });

    /* ---- Supabase ---- */
    bind(root, '[data-a=guardarSb]', function () {
      try {
        Sync.guardarConfig(root.querySelector('#k-sb-url').value,
          root.querySelector('#k-sb-key').value);
        render();
        UI.toast('Guardado. Entra con tu correo desde Ajustes.');
      } catch (e) { UI.toast(e.message); }
    });

    bind(root, '[data-a=borrarSb]', function () {
      UI.confirm('Borrar Supabase', 'Se cerrará la sesión en este dispositivo. ' +
        'Tus datos locales y los de la nube no se tocan.', 'Borrar', true).then(function (ok) {
        if (ok) { Sync.borrarConfig(); render(); UI.toast('Configuración borrada'); }
      });
    });

    /* ---- varios dispositivos ---- */
    bind(root, '[data-a=togglesync]', function (el) {
      const nuevo = Store.settings().sincronizarClaves === false;
      Store.setSetting('sincronizarClaves', nuevo);
      el.classList.toggle('on', nuevo);
      el.setAttribute('aria-checked', String(nuevo));
      UI.toast(nuevo
        ? 'Tus claves se sincronizarán con los demás dispositivos'
        : 'Las claves se quedarán solo en este dispositivo');
      if (nuevo && Sync.activa()) Sync.subir().catch(function () { /* ya se reintentará */ });
    });

    const conEnlace = function (fn) {
      return function () {
        try { fn(Sync.enlaceConfiguracion()); }
        catch (e) { UI.toast(e.message); }
      };
    };

    bind(root, '[data-a=copiarEnlace]', conEnlace(function (url) {
      if (navigator.clipboard) navigator.clipboard.writeText(url);
      UI.toast('Enlace copiado. Ábrelo en el otro dispositivo.');
    }));

    bind(root, '[data-a=compartirEnlace]', conEnlace(function (url) {
      if (navigator.share) {
        navigator.share({ title: 'Configurar Training FR', url: url })
          .catch(function () { /* el usuario canceló */ });
      } else {
        if (navigator.clipboard) navigator.clipboard.writeText(url);
        UI.toast('Enlace copiado: pégalo en el otro dispositivo.');
      }
    }));

    /* ---- todo ---- */
    bind(root, '[data-a=borrarTodo]', function () {
      UI.confirm('Borrar todas las claves',
        'Se olvidarán todos los proveedores de IA, Spotify y Supabase en este ' +
        'dispositivo. Tus rutinas y tu ' +
        'historial no se tocan.', 'Borrar todas', true).then(function (ok) {
        if (!ok) return;
        IA.borrarTodo();
        Spotify.borrarConfig();
        Sync.borrarConfig();
        render();
        UI.toast('Claves borradas');
      });
    });
  };
})(window);
