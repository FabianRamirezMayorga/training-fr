/* guia.js — los primeros pasos de una cuenta nueva.

   Quien acaba de crear su cuenta entraba a la portada de la app con todo vacío:
   sin peso no hay calorías, sin altura no hay IMC, sin edad no hay nada que
   ajustar. La app se lo decía luego, a trozos, cada vez que se topaba con una
   pantalla que no podía calcular lo suyo. Eso es hacerle descubrir a base de
   tropiezos lo que se pregunta una vez en dos minutos.

   Así que después de entrar hay dos pasos: sus datos, y si quiere conectar el
   entrenador con IA y la música. Dos, y se acabó.

   Con salida, y esto es lo importante: la guía no encierra a nadie. La barra de
   abajo sigue ahí y se puede ir a mirar el catálogo el primer día. Lo que hace
   la guía es quedarse pendiente —vuelve al abrir la app— hasta que la termine o
   la descarte. Una app que no te deja salir de su formulario es una app en la
   que no se puede entrar a mirar.

   Quién la ve: solo quien entra con cuenta y no tiene sus datos. Al entrar en
   un móvil nuevo, la sincronización se los trae antes de que esto mire, así que
   a quien ya los tenía no le sale nada. */
(function (g) {
  'use strict';

  const html = UI.html, raw = UI.raw, icon = UI.icon, esc = UI.esc;
  const V = g.VISTAS = g.VISTAS || {};

  const bind = function (r, s, f) { return App.bind(r, s, f); };
  const go = function (n, a) { return App.go(n, a); };

  const CLAVE = 'guia';

  /* Ya se ha llevado a su sitio en esta apertura de la app. Sin esto, cada
     repintado —y hay uno por cada toque— lo devolvería a la pantalla del paso,
     que es exactamente la jaula que no queremos. Vive en memoria y no en los
     ajustes a propósito: al cerrar y abrir vuelve a llevarle, que es lo que
     significa «se queda pendiente». */
  let yaLlevado = false;

  function paso() { return Store.settings()[CLAVE] || ''; }

  function enMarcha() { return paso() === 'datos' || paso() === 'conexiones'; }

  /* Arranca solo si hace falta. Sin cuenta no se arranca: el modo invitado tiene
     su propia bienvenida y meterle un segundo cuestionario a quien ha dicho «no
     quiero dar datos» es no haberle escuchado. */
  function arrancar() {
    if (!g.Sync || !Sync.email()) return false;
    if (g.Perfil && Perfil.completo()) return false;
    Store.setSetting(CLAVE, 'datos');
    yaLlevado = true;
    return true;
  }

  function avanzar() {
    Store.setSetting(CLAVE, 'conexiones');
    yaLlevado = true;
    go('conexiones');
  }

  function terminar(aviso) {
    Store.setSetting(CLAVE, null);
    yaLlevado = true;
    go('inicio');
    if (aviso) UI.toast(aviso);
  }

  /* Al abrir la app, una vez. Lo llama el arranque, no el pintado. */
  function alAbrir() {
    if (yaLlevado || !enMarcha()) return '';
    yaLlevado = true;
    return paso();
  }

  /* ---------- la banda del paso ----------
     Va arriba del todo de la pantalla del paso: dice en cuál va y de cuántos.
     Sin esto, quien aterriza en «Datos y hábitos» recién creada la cuenta no
     sabe si eso es un trámite de dos minutos o el primero de quince. */
  function bandaHTML(n, titulo, texto) {
    return html`
      <div class="guia-banda">
        <div class="guia-cuenta">
          <span class="guia-bolas">
            <i class="${n >= 1 ? 'si' : ''}"></i><i class="${n >= 2 ? 'si' : ''}"></i>
          </span>
          ${Tn('Paso {n} de 2', { n: n })}
        </div>
        <b>${titulo}</b>
        <p>${texto}</p>
      </div>`;
  }

  /* Lo que se pinta dentro de «Datos y hábitos» mientras la guía está en ese
     paso: la banda arriba y, al final, el botón de seguir. */
  function bandaDatos() {
    if (paso() !== 'datos') return '';
    return bandaHTML(1, T('Cuéntame de ti'),
      T('El sexo, la edad, la altura y el peso son los cuatro con los que se calcula ' +
        'todo lo demás: tus calorías, tus macros y lo que te propongo entrenar. Lo ' +
        'demás de esta página es opcional y se puede rellenar otro día.'));
  }

  function pieDatos() {
    if (paso() !== 'datos') return '';
    const falta = g.Perfil ? Perfil.loQueFalta() : [];
    return html`
      <div class="guia-pie">
        ${raw(falta.length
          ? '<p class="tiny guia-falta">' + esc(Tn('Todavía falta {que}. Puedes seguir y ' +
              'volver luego, pero hasta que estén no puedo calcular tus calorías.',
              { que: falta.join(', ') })) + '</p>'
          : '')}
        <button class="btn primary block" data-a="guiaSigue">
          ${T('Continuar')} ${raw(icon('chevron'))}</button>
      </div>`;
  }

  function montarDatos(root) {
    bind(root, '[data-a=guiaSigue]', function () { avanzar(); });
  }

  /* ---------- paso 2: las dos conexiones ----------
     Las dos son opcionales de verdad y cuestan una clave ajena, así que aquí no
     se pide nada: se cuenta qué hacen y se deja el botón. Quien diga que ahora
     no, entra a la app y las dos siguen en Perfil el día que le apetezca. */
  function fila(ico, tono, titulo, texto, hecho, ruta, cta) {
    return html`
      <button class="rt-item guia-con" data-ir="${ruta}" style="width:100%;text-align:left">
        <span class="row-icon" style="color:${tono};background:${'color-mix(in srgb, ' + tono + ' 16%, transparent)'}">
          ${raw(icon(ico))}</span>
        <div class="grow">
          <div class="guia-con-tit">${titulo}
            ${raw(hecho ? '<span class="guia-ok">' + icon('check') + esc(T('Puesto')) +
              '</span>' : '')}</div>
          <div class="tiny">${texto}</div>
        </div>
        <span class="chevron">${raw(icon('chevron'))}</span>
      </button>`;
  }

  V.conexiones = function () {
    const conIA = !!(g.IA && IA.activa());
    const conMusica = !!(g.Spotify && Spotify.configurado());

    return html`
      ${raw(bandaHTML(2, T('Dos conexiones, si te apetece'),
        T('Las dos son gratis y opcionales, y las dos van con una clave tuya que la app ' +
          'no ve ni guarda en ningún servidor. Puedes saltártelas y ponerlas otro día ' +
          'desde Perfil.')))}

      <div class="stack" style="margin-top:16px">
        ${raw(fila('chispa', 'var(--acc)', T('Entrenador con IA'),
          T('Lee tus entrenamientos y te dice qué ajustar, te monta el programa y el menú ' +
            'de comidas, y calcula un plato con una foto. Con la capa gratuita de Google ' +
            'sobra y no pide tarjeta.'),
          conIA, 'entrenador', ''))}

        ${raw(fila('musica', 'var(--brand-1)', T('Música mientras entrenas'),
          T('Conecta tu Spotify y la app te pone la lista al empezar la rutina y la para ' +
            'al terminar. Hace falta cuenta Premium y un Client ID, que se saca gratis en ' +
            'la web de desarrolladores de Spotify.'),
          conMusica, 'musica', ''))}
      </div>

      <!-- Lo que ya funciona sin nada de esto. Quien se salta los dos pasos tiene
           que irse sabiendo que no se deja media app atrás. -->
      <div class="card" style="margin-top:16px">
        <div class="row" style="gap:10px;align-items:flex-start">
          <span class="row-icon">${raw(icon('check'))}</span>
          <div class="grow">
            <b style="font-size:.9rem">${T('Lo que va sin conectar nada')}</b>
            <p class="tiny" style="margin:5px 0 0">${T('El catálogo entero con su técnica, ' +
            'tus rutinas, el generador de programas, el cronómetro, el historial, las ' +
            'estadísticas y la constancia. Todo eso no necesita ni clave ni internet.')}</p>
          </div>
        </div>
      </div>

      <div class="guia-pie">
        <button class="btn primary block" data-a="guiaFin">
          ${raw(icon('check'))} ${T('Listo, llévame a la app')}</button>
      </div>`;
  };

  V.conexiones.mount = function (root) {
    App.bindAll(root, '[data-ir]', function (el) { go(el.dataset.ir); });
    bind(root, '[data-a=guiaFin]', function () {
      terminar(T('Todo tuyo. Las dos conexiones están en Perfil cuando las quieras.'));
    });
  };

  /* ---------- el recordatorio de la portada ----------
     Se fue de la guía sin terminarla. No se le persigue por las pantallas: se
     le deja una tira en la portada que la retoma o la quita para siempre. */
  function avisoHTML() {
    if (!enMarcha()) return '';
    return html`
      <button class="card guia-aviso" data-a="guiaSeguir">
        <span class="row-icon">${raw(icon('chispa'))}</span>
        <span class="grow">
          <b>${T('Te falta terminar de configurar')}</b>
          <span class="tiny">${paso() === 'datos'
            ? T('Sin tus datos no puedo calcular calorías ni ajustarte las rutinas.')
            : T('Te quedaba mirar el entrenador con IA y la música.')}</span>
        </span>
        <span class="chevron">${raw(icon('chevron'))}</span>
      </button>`;
  }

  function montarAviso(root) {
    bind(root, '[data-a=guiaSeguir]', function () { go(paso()); });
  }

  g.Guia = {
    paso: paso, enMarcha: enMarcha, arrancar: arrancar, avanzar: avanzar,
    terminar: terminar, alAbrir: alAbrir,
    bandaDatos: bandaDatos, pieDatos: pieDatos, montarDatos: montarDatos,
    avisoHTML: avisoHTML, montarAviso: montarAviso
  };
})(window);
