/* spotify.js — control de la música desde la app durante el entrenamiento.

   Autorización con PKCE, que es la que Spotify recomienda para aplicaciones que
   viven en el navegador: no necesita ningún secreto, así que el código puede ser
   público sin riesgo.

   Aviso importante: ver qué suena funciona con cuenta gratuita, pero **cambiar la
   reproducción (play, pausa, siguiente) solo funciona con Spotify Premium**. Es una
   limitación de Spotify, no de esta app. Sin Premium queda el reproductor incrustado. */
(function (g) {
  'use strict';

  const CFG = 'trainingfr.spotify';
  const SES = 'trainingfr.spotify.sesion';
  const VERIF = 'trainingfr.spotify.verificador';
  const API = 'https://api.spotify.com/v1';
  const SCOPES = [
    'streaming',                  // reproducir dentro de la propia app
    'user-read-email',            // exigidos por el reproductor web
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-private',    // guardar las listas que genera la IA
    'playlist-modify-public',
    'user-library-read',          // saber si una canción ya es favorita
    'user-library-modify',        // el corazón
    'user-top-read'               // conocer tus gustos para afinar las listas
  ].join(' ');

  /* La versión de permisos: si cambia, hay que volver a autorizar la cuenta */
  /* Sube cuando cambian los permisos. Sube también a 4 porque las sesiones
     anteriores no guardaban qué concedió Spotify: sin eso no hay forma de
     saber si al token le falta algo, y los 403 se quedaban sin explicación. */
  const SCOPES_V = 4;

  function leer(k) {
    try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
  }
  function escribir(k, v) {
    if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v));
  }

  function config() { return leer(CFG) || {}; }
  function configurado() { return !!config().clientId; }

  function guardarConfig(clientId, playlist) {
    clientId = String(clientId || '').trim();
    if (!/^[a-f0-9]{32}$/i.test(clientId)) {
      throw new Error('El Client ID son 32 caracteres. Cópialo del panel de Spotify.');
    }
    escribir(CFG, {
      clientId: clientId, playlist: String(playlist || '').trim(), _ts: Date.now()
    });
  }

  function guardarPlaylist(url) {
    const c = config();
    c.playlist = String(url || '').trim();
    c._ts = Date.now();
    escribir(CFG, c);
  }

  function borrarConfig() { escribir(CFG, null); escribir(SES, null); }

  function sesion() { return leer(SES); }
  function activa() { return !!(configurado() && sesion()); }

  /* Los permisos que faltan en la sesión de ahora mismo */
  function permisosQueFaltan() {
    const s = sesion();
    if (!s) return [];
    /* Sesiones viejas no guardaban lo concedido; ahí manda la versión */
    if (typeof s.scope !== 'string') return [];
    const tiene = s.scope.split(' ').filter(Boolean);
    return SCOPES.split(' ').filter(function (p) { return tiene.indexOf(p) === -1; });
  }

  /* Los permisos han cambiado o Spotify no concedió todos: hay que reconectar */
  function permisosCaducados() {
    const s = sesion();
    if (!s) return false;
    if ((s.scopes_v || 1) < SCOPES_V) return true;
    return permisosQueFaltan().length > 0;
  }
  function salir() { escribir(SES, null); }

  /* La dirección de retorno debe coincidir con la registrada en el panel de Spotify */
  function urlRetorno() { return location.origin + location.pathname; }

  /* ---------- PKCE ---------- */

  function aleatorio(n) {
    const bytes = new Uint8Array(n);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(function (b) {
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[b % 66];
    }).join('');
  }

  function base64url(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function reto(verificador) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(verificador))
      .then(base64url);
  }

  /* Lleva al usuario a Spotify a dar permiso */
  function entrar() {
    const c = config();
    if (!c.clientId) return Promise.reject(new Error('Falta el Client ID de Spotify.'));

    /* PKCE necesita SHA-256 del navegador, que solo existe en páginas seguras.
       Sin esto el botón se quedaba mudo y parecía que no hacía nada. */
    if (!window.crypto || !crypto.subtle || !crypto.subtle.digest) {
      return Promise.reject(new Error('Este navegador no permite la conexión segura con ' +
        'Spotify. Abre la app en https, no en una copia local.'));
    }

    const verificador = aleatorio(64);
    const estado = aleatorio(16);

    /* Si esto deja de ser una cadena, el error aparece a los dos redirecciones
       y disfrazado de otra cosa. Mejor cortar aquí. */
    if (typeof verificador !== 'string' || typeof estado !== 'string') {
      return Promise.reject(new Error('Fallo interno preparando la conexión con Spotify.'));
    }

    /* Se guardan los últimos intentos, no solo el último.
       Un doble toque en el botón, o volver atrás y reintentar, dejaba guardado
       el verificador del segundo intento mientras Spotify respondía al primero:
       el "state" no cuadraba y la conexión se caía con un mensaje que no ayuda
       a nadie. Guardando varios, el código que vuelve encuentra el suyo. */
    guardarIntento({
      v: verificador, s: estado, t: Date.now(), volver: location.hash || '#/musica'
    });

    return reto(verificador).then(function (challenge) {
      const q = new URLSearchParams({
        client_id: c.clientId,
        response_type: 'code',
        redirect_uri: urlRetorno(),
        code_challenge_method: 'S256',
        code_challenge: challenge,
        scope: SCOPES,
        state: estado
      });
      location.href = 'https://accounts.spotify.com/authorize?' + q.toString();
    }).catch(function (e) {
      throw new Error(e.message || 'No se pudo iniciar la conexión con Spotify.');
    });
  }

  /* ---------- intentos de autorización en curso ----------
     Como mucho tres, y solo los de los últimos quince minutos. */
  function intentos() {
    const g2 = leer(VERIF);
    if (!g2) return [];
    const lista = Array.isArray(g2) ? g2 : [g2];         // formato anterior
    const desde = Date.now() - 15 * 60000;
    return lista.filter(function (x) { return x && x.s && (x.t || Date.now()) > desde; });
  }

  function guardarIntento(x) {
    escribir(VERIF, intentos().concat([x]).slice(-3));
  }

  function buscarIntento(estado) {
    return intentos().find(function (x) { return x.s === estado; }) || null;
  }

  function olvidarIntentos() { escribir(VERIF, null); }

  /* ¿Esta vuelta a la app es de Spotify?
     Supabase también responde con ?code=, así que sin esto el módulo de la
     cuenta se quedaba el código de Spotify, limpiaba la URL y aquí no llegaba
     nada: la conexión no se completaba nunca y sin ruido. El "state" lo pone
     esta app y solo ella lo conoce. */
  function esperandoRedireccion(estado) {
    return !!(estado && buscarIntento(estado));
  }

  /* Al volver de Spotify, el código llega en la query de la URL */
  function capturarRedireccion() {
    const q = new URLSearchParams(location.search);
    const code = q.get('code');
    const estado = q.get('state');
    const error = q.get('error');
    const detalle = q.get('error_description');
    const guardado = estado ? buscarIntento(estado) : null;
    const hayIntentos = intentos().length;

    /* Sin "state" esto no viene de aquí: será el enlace de la cuenta. Se deja
       intacto, sin limpiar la URL. */
    if (!estado) return Promise.resolve({ ok: false });

    /* Con state pero sin su verificador, la vuelta es de Spotify pero no se
       puede completar: se perdió el almacenamiento por el camino (otro
       navegador, modo privado, limpieza). Se limpia la URL y se dice qué pasó,
       en vez de dejar el código ahí para que lo malinterprete otro módulo. */
    if (!guardado) {
      limpiarURL('#/musica');
      /* Aquí no ha fallado Spotify: falta en ESTE almacenamiento el verificador
         de la petición que responde. Pasa cuando se empieza en un sitio y se
         vuelve en otro (la app instalada y el navegador guardan aparte). Se
         apuntan los datos para poder verlo, no para adivinarlo. */
      const guardados = intentos();
      const texto = hayIntentos
        ? 'La vuelta de Spotify no encaja con ningún intento guardado aquí. Suele pasar ' +
          'cuando se empieza en la app instalada y se vuelve en el navegador, o al revés: ' +
          'cada uno guarda sus datos por separado.'
        : 'La conexión con Spotify se interrumpió por el camino: en este navegador no ' +
          'queda constancia de la petición.';
      apuntarFallo(texto, {
        detalle: 'state recibido: ' + estado + SALTO +
          'intentos guardados aquí: ' + (guardados.length
            ? guardados.map(function (x) {
                return x.s + ' (hace ' + Math.round((Date.now() - (x.t || 0)) / 60000) + ' min)';
              }).join(', ')
            : 'ninguno') + SALTO +
          'contexto: ' + (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ? 'app instalada' : 'navegador')
      });
      olvidarIntentos();
      return Promise.resolve({ ok: false, error: texto, volver: '#/musica' });
    }

    /* Lo que responda Spotify se guarda tal cual: un aviso de dos segundos se
       pierde, y sin el texto exacto no hay forma de saber qué ha rechazado. */
    if (error) {
      const volver = (guardado && guardado.volver) || '#/musica';
      olvidarIntentos();
      limpiarURL(volver);
      const texto = traducirError(error, detalle);
      apuntarFallo(error + (detalle ? ': ' + detalle : ''), { deSpotify: true });
      return Promise.resolve({ ok: false, error: texto, volver: volver });
    }
    if (!code) return Promise.resolve({ ok: false });

    olvidarIntentos();
    limpiarURL(guardado.volver);

    return token({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: urlRetorno(),
      code_verifier: guardado.v
    }).then(function () {
      apuntarFallo(null);
      return { ok: true, volver: guardado.volver || '#/musica' };
    }).catch(function (e) {
      apuntarFallo('Al canjear el código: ' + e.message);
      return { ok: false, error: e.message, volver: guardado.volver };
    });
  }

  /* Último fallo de autorización, para poder enseñarlo con calma en la pantalla */
  const FALLO = 'trainingfr.spotify.fallo';
  const SALTO = String.fromCharCode(10);
  function apuntarFallo(texto, datos) {
    if (!texto) { localStorage.removeItem(FALLO); return; }
    escribir(FALLO, { t: Date.now(), texto: String(texto), deSpotify: !!(datos && datos.deSpotify),
      detalle: (datos && datos.detalle) || '' });
  }
  function ultimoFallo() { return leer(FALLO); }

  /* Los errores de Spotify vienen en inglés y en clave */
  function traducirError(error, detalle) {
    const e = String(error || '');
    if (/access_denied/i.test(e)) return 'No diste permiso a la app en la pantalla de Spotify.';
    if (/invalid_client/i.test(e)) {
      return 'Spotify no reconoce el Client ID. Cópialo otra vez del panel de desarrollador.';
    }
    if (/invalid_redirect_uri|redirect/i.test(e)) {
      return 'La dirección de retorno no está dada de alta en tu app de Spotify. Añade ' +
        urlRetorno() + ' en Redirect URIs.';
    }
    if (/invalid_scope/i.test(e)) return 'Spotify ha rechazado alguno de los permisos pedidos.';
    if (/unsupported_response_type|invalid_request/i.test(e)) {
      return 'Spotify ha rechazado la petición: ' + (detalle || e);
    }
    return 'Spotify respondió: ' + e + (detalle ? ' (' + detalle + ')' : '');
  }

  function limpiarURL(destino) {
    history.replaceState(null, '', location.pathname + (destino || location.hash || '#/inicio'));
  }

  function token(params) {
    const c = config();
    params.client_id = c.clientId;
    const esRenovacion = params.grant_type === 'refresh_token';
    return fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString()
    }).catch(function () {
      throw new Error('No se pudo conectar con Spotify.');
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error_description || j.error || 'Error de autorización.');
        const previo = sesion() || {};
        escribir(SES, {
          access_token: j.access_token,
          refresh_token: j.refresh_token || previo.refresh_token,
          expires_at: Date.now() + (j.expires_in || 3600) * 1000,
          scopes_v: esRenovacion ? (previo.scopes_v || 1) : SCOPES_V,
          /* Lo que Spotify ha concedido de verdad, que no siempre es lo que se
             pidió: si falta alguno, las llamadas fallan con un 403 seco y sin
             esto no había manera de saber por qué. */
          scope: j.scope || previo.scope || ''
        });
        return true;
      });
    });
  }

  function refrescar() {
    const s = sesion();
    if (!s || !s.refresh_token) return Promise.reject(new Error('Vuelve a conectar Spotify.'));
    return token({ grant_type: 'refresh_token', refresh_token: s.refresh_token });
  }

  /* ---------- llamadas a la API ---------- */

  let sinPremium = false;

  function pedir(ruta, opciones, reintento) {
    const s = sesion();
    if (!s) return Promise.reject(new Error('Conecta Spotify primero.'));

    if (s.expires_at - Date.now() < 60000 && !reintento) {
      return refrescar().then(function () { return pedir(ruta, opciones, true); });
    }

    opciones = opciones || {};
    opciones.headers = Object.assign({ 'Authorization': 'Bearer ' + s.access_token },
      opciones.headers || {});

    /* con límite de tiempo: una petición colgada dejaba la pantalla esperando */
    const corte = new AbortController();
    const reloj = setTimeout(function () { corte.abort(); }, 20000);
    opciones.signal = corte.signal;

    return fetch(API + ruta, opciones).catch(function (e) {
      clearTimeout(reloj);
      if (e && e.name === 'AbortError') throw new Error('Spotify ha tardado demasiado en responder.');
      throw new Error('Sin conexión con Spotify.');
    }).then(function (r) { clearTimeout(reloj); return r; }).then(function (r) {
      if (r.status === 401 && !reintento) {
        return refrescar().then(function () { return pedir(ruta, opciones, true); });
      }
      if (r.status === 403) {
        /* Un 403 no siempre es falta de Premium: también sale cuando al token
           le falta un permiso, o cuando el aparato no admite esa orden (el
           reproductor de la web, por ejemplo, no siempre deja el aleatorio).
           Antes lo dábamos todo por «hace falta Premium» y era mentira. */
        return r.json().catch(function () { return {}; }).then(function (j) {
          const e = j.error || {};
          const dice = String(e.reason || '') + ' ' + String(e.message || '');
          if (/PREMIUM/i.test(dice)) {
            sinPremium = true;
            throw new Error('Spotify solo permite controlar la reproducción con Premium.');
          }
          if (/Restriction|NO_PREV|NO_NEXT|UNKNOWN/i.test(dice)) {
            throw new Error('Esa orden no la admite el aparato donde suena la música.');
          }
          const suyo = e.message ? ' Spotify dice: "' + e.message + '".' : '';
          if (ruta.indexOf('/me/player') !== 0) {
            const faltan = permisosQueFaltan();
            throw new Error('Spotify no ha autorizado esta acción'
              + (faltan.length ? ' (falta el permiso ' + faltan[0] + ')' : '')
              + '.' + suyo + ' [403 ' + ruta.split('?')[0] + ']');
          }
          throw new Error((e.message || 'Spotify ha rechazado la orden.')
            + ' [403 ' + ruta.split('?')[0] + ']');
        });
      }
      if (r.status === 404) throw new Error('No hay ningún dispositivo de Spotify activo.');
      if (r.status === 204) return null;
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          throw new Error((j.error && j.error.message) || ('Error ' + r.status));
        });
      }
      return r.status === 204 ? null : r.json().catch(function () { return null; });
    });
  }

  function requierePremium() { return sinPremium; }

  /* Qué está sonando ahora mismo */
  function sonando() {
    const propio = estado();
    if (propio) return Promise.resolve(propio);
    return pedir('/me/player').then(function (r) {
      if (!r || !r.item) return null;
      return {
        id: r.item.id,
        titulo: r.item.name,
        artista: (r.item.artists || []).map(function (a) { return a.name; }).join(', '),
        album: r.item.album && r.item.album.name,
        portada: r.item.album && r.item.album.images && r.item.album.images.length
          ? r.item.album.images[r.item.album.images.length - 1].url : '',
        sonando: !!r.is_playing,
        progreso: r.progress_ms || 0,
        duracion: r.item.duration_ms || 0,
        aleatorio: !!r.shuffle_state,
        dispositivo: r.device && r.device.name
      };
    });
  }

  /* Si la música suena dentro de la app, se controla el reproductor propio;
     si no, se manda la orden al dispositivo activo de la cuenta. */
  function local() { return player && deviceId; }

  function play() {
    if (local()) { desbloquearAudio(); return player.resume(); }
    return pedir('/me/player/play', { method: 'PUT' });
  }
  function pausa() {
    if (local()) return player.pause();
    return pedir('/me/player/pause', { method: 'PUT' });
  }
  function siguiente() {
    if (local()) return player.nextTrack();
    return pedir('/me/player/next', { method: 'POST' });
  }
  function anterior() {
    if (local()) return player.previousTrack();
    return pedir('/me/player/previous', { method: 'POST' });
  }
  function volumen(v) {
    const vol = Math.max(0, Math.min(1, v));
    if (local()) return player.setVolume(vol);
    return pedir('/me/player/volume?volume_percent=' + Math.round(vol * 100) +
      (deviceId ? '&device_id=' + encodeURIComponent(deviceId) : ''), { method: 'PUT' });
  }

  /* En iPhone el volumen es del aparato: iOS no deja que una web lo cambie.
     Preguntarle al SDK no sirve, porque se apunta el valor y lo devuelve tal
     cual aunque el sonido siga igual —por eso la barra parecía funcionar y
     estaba de adorno—. Lo que de verdad lo dice es si este navegador permite
     cambiar el volumen de un elemento de audio: en iOS se queda en 1. */
  function admiteVolumen() {
    /* Si suena en otro aparato la orden va por la API y sí llega */
    if (!local()) return Promise.resolve(true);
    return Promise.resolve(!esIOS());
  }

  /* iOS y iPadOS: ninguna web puede tocar el volumen, lo lleva el aparato. Se
     mira el sistema y no el comportamiento, porque las dos comprobaciones que
     probé —preguntar al SDK y probar un elemento de audio— decían que sí y la
     barra seguía sin hacer nada. El iPad se hace pasar por Mac, de ahí lo del
     táctil. */
  function esIOS() {
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return true;
    return /Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1;
  }

  function alternar() {
    if (local()) {
      desbloquearAudio();
      return player.togglePlay().then(function () {
        return !(estadoActual && estadoActual.paused);
      });
    }
    return sonando().then(function (s) {
      if (s && s.sonando) return pausa().then(function () { return false; });
      return play().then(function () { return true; });
    });
  }

  /* Lanza la lista guardada como favorita para entrenar */
  function ponerPlaylist(uri) {
    const id = idDePlaylist(uri || config().playlist);
    if (!id) return Promise.reject(new Error('Guarda antes una lista de reproducción.'));

    const lanzar = function (dev) {
      return pedir('/me/player/play' + (dev ? '?device_id=' + encodeURIComponent(dev) : ''), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context_uri: 'spotify:playlist:' + id })
      });
    };

    /* igual que con las canciones sueltas: primero se trae el mando aquí */
    if (reproductorActivo()) {
      desbloquearAudio();
      return pedir('/me/player', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_ids: [deviceId], play: false })
      }).catch(function () { /* si ya era el activo, da igual */ })
        .then(function () { return lanzar(deviceId); });
    }
    return lanzar('');
  }

  /* Acepta el enlace que comparte la aplicación, la dirección con idioma
     (open.spotify.com/intl-es/playlist/...), el URI interno y el identificador
     suelto. Los parámetros de seguimiento del final se ignoran. */
  function idDePlaylist(v) {
    v = String(v || '').trim();
    if (!v) return '';
    const m = v.match(/playlist[/:]([a-zA-Z0-9]{10,})/);
    if (m) return m[1];
    if (/^[a-zA-Z0-9]{22}$/.test(v)) return v;
    return '';
  }

  /* Qué pegó el usuario, cuando no es una lista: sirve para explicárselo */
  function queEs(v) {
    const m = String(v || '').match(/(album|track|artist|show|episode|user)[/:]/i);
    const nombres = {
      album: 'un álbum', track: 'una canción', artist: 'un artista',
      show: 'un pódcast', episode: 'un episodio', user: 'un perfil'
    };
    return m ? (nombres[m[1].toLowerCase()] || '') : '';
  }

  /* Reproductor incrustado: es el camino cuando no hay Premium */
  function urlEmbed(v) {
    const id = idDePlaylist(v || config().playlist);
    if (!id) return '';
    return 'https://open.spotify.com/embed/playlist/' + id + '?utm_source=generator&theme=0';
  }

  function misListas() {
    return pedir('/me/playlists?limit=50').then(function (r) {
      return ((r && r.items) || []).map(function (p) {
        return {
          id: p.id, nombre: p.name, temas: p.tracks && p.tracks.total,
          uri: p.uri, de: p.owner && p.owner.display_name,
          portada: p.images && p.images.length ? p.images[p.images.length - 1].url : ''
        };
      });
    });
  }

  /* Busca listas por todo Spotify, no solo entre las tuyas */
  function buscarListas(texto) {
    const q = String(texto || '').trim();
    if (!q) return Promise.resolve([]);
    return pedir('/search?type=playlist&limit=20&q=' + encodeURIComponent(q)).then(function (r) {
      return ((r && r.playlists && r.playlists.items) || []).filter(Boolean).map(function (p) {
        return {
          id: p.id, nombre: p.name, temas: p.tracks && p.tracks.total,
          uri: p.uri, de: p.owner && p.owner.display_name,
          portada: p.images && p.images.length ? p.images[p.images.length - 1].url : ''
        };
      });
    });
  }

  /* Las canciones de una lista, para poder verlas antes de darle al play */
  function cancionesDeLista(id, limite) {
    const pl = encodeURIComponent(idDePlaylist(id) || id);
    const campos = 'tracks.items(track(id,uri,name,duration_ms,artists(name)))';
    const sueltas = '/playlists/' + pl + '/tracks?limit=' + (limite || 50);

    function ordenar(items) {
      return (items || []).map(function (it) {
        const t = it && it.track;
        if (!t) return null;
        return {
          id: t.id, uri: t.uri, titulo: t.name, duracion: t.duration_ms,
          artista: (t.artists || []).map(function (a) { return a.name; }).join(', ')
        };
      }).filter(Boolean);
    }

    /* La lista entera trae dentro sus canciones, y ese camino sí lo deja
       Spotify: /playlists/{id}/tracks devuelve un 403 seco en cuentas donde
       /playlists/{id} responde de sobra. Se pide primero el que funciona y el
       otro queda de reserva, que en listas de más de cien hace falta. */
    return pedir('/playlists/' + pl + '?fields=' + encodeURIComponent(campos))
      .then(function (r) { return ordenar(r && r.tracks && r.tracks.items); })
      .catch(function () {
        return pedir('/playlists/' + pl)
          .then(function (r) { return ordenar(r && r.tracks && r.tracks.items); });
      })
      .then(function (temas) {
        if (temas.length) return temas;
        return pedir(sueltas).then(function (r) { return ordenar(r && r.items); });
      })
      .catch(function (e) {
        return pedir(sueltas).then(function (r) { return ordenar(r && r.items); })
          .catch(function () { throw e; });
      });
  }

  /* Prueba de las llamadas que fallan, para ver el motivo en crudo en vez de
     seguir deduciéndolo desde fuera. */
  function diagnostico() {
    const ses = sesion() || {};
    const c = config() || {};
    const partes = [];
    let pl = '';

    /* Cada prueba imprime el código y el motivo tal cual llegan. La del catálogo
       público es la que separa las dos causas posibles: no pide ningún permiso,
       así que si esa también falla el problema es la app de Spotify y no el
       token ni esta web. */
    function probar(nombre, ruta, opciones) {
      return fetch(API + ruta, Object.assign({
        headers: { 'Authorization': 'Bearer ' + ses.access_token }
      }, opciones || {})).then(function (r) {
        return r.text().then(function (t) {
          let d = t.slice(0, 90);
          try {
            const j = JSON.parse(t);
            if (j && j.error && j.error.message) d = j.error.message;
            else if (r.ok) d = 'bien';
          } catch (e) { if (r.ok) d = 'bien'; }
          partes.push(nombre + ': ' + r.status + ' ' + d);
        });
      }).catch(function (e) { partes.push(nombre + ': sin red (' + e.message + ')'); });
    }

    return pedir('/me').then(function (yo) {
      partes.push('cuenta: ' + (yo && yo.id) + ' · ' + (yo && yo.product));
      partes.push('app: ' + String(c.clientId || '').slice(0, 8) + '…');
      return pedir('/me/playlists?limit=1');
    }).then(function (r) {
      const uno = r && r.items && r.items[0];
      pl = uno ? uno.id : '';
      partes.push('tus listas: bien' + (uno ? ' (' + (uno.name || '') + ')' : ''));
    }).catch(function (e) {
      partes.push('fallo antes de empezar: ' + e.message);
    }).then(function () {
      return probar('canciones de la lista', '/playlists/' + (pl || 'x') + '/tracks?limit=1');
    }).then(function () {
      return probar('favorita (contains)', '/me/tracks/contains?ids=4uLU6hMCjMI75M1A2tKUQC');
    }).then(function () {
      return probar('contains de álbumes', '/me/albums/contains?ids=4aawyAB9vmqN3uQ7FjRGTy');
    }).then(function () {
      return probar('público hondo', '/artists/0TnOYISbd1XYRBk9myaseg/albums?limit=1');
    }).then(function () {
      /* Con la lista de ids vacía no toca nada de su biblioteca: si Spotify deja
         escribir contesta 400 por la petición mal formada, y si no, 403. Es la
         única forma de probar el corazón sin guardarle una canción que no ha pedido. */
      return probar('escribir favorita', '/me/tracks', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + ses.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: [] })
      });
    }).then(function () {
      return partes.join(SALTO);
    });
  }

  /* ---------- favoritos, aleatorio y repetición ---------- */

  function esFavorita(id) {
    if (!id) return Promise.resolve(false);
    return pedir('/me/tracks/contains?ids=' + encodeURIComponent(id))
      .then(function (r) { return !!(r && r[0]); })
      .catch(function () { return false; });
  }

  /* Spotify no deja guardar favoritas en todas las cuentas: responde un 403
     seco aunque el permiso esté concedido y la lectura de la biblioteca pase
     sin problema. Se pregunta una vez, con la lista de ids vacía para no tocar
     nada suyo: si autoriza contesta 400 por la petición mal formada. Así el
     corazón aparece sólo donde de verdad hace algo, en vez de dar error. */
  let guardarVa = null;

  function puedeGuardar() {
    if (guardarVa !== null) return Promise.resolve(guardarVa);
    if (!sesion()) return Promise.resolve(false);
    return pedir('/me/tracks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [] })
    }).then(function () { guardarVa = true; return true; }).catch(function (e) {
      const m = String((e && e.message) || '');
      if (m.indexOf('[403 ') !== -1) { guardarVa = false; return false; }
      /* Sin red no se decide nada: mejor dejarlo como estaba que esconderlo */
      if (/Sin conexi|tardado demasiado/i.test(m)) return true;
      guardarVa = true;
      return true;
    });
  }

  function marcarFavorita(id, si) {
    if (!id) return Promise.reject(new Error('No hay ninguna canción sonando.'));
    /* Spotify acepta el id en el cuerpo o en la ruta, y no siempre trata
       igual a los dos. Se prueba primero por el cuerpo y, si lo rechaza, por
       la ruta, antes de dar el corazón por roto. */
    return pedir('/me/tracks', {
      method: si ? 'PUT' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] })
    }).catch(function (e) {
      return pedir('/me/tracks?ids=' + encodeURIComponent(id),
        { method: si ? 'PUT' : 'DELETE' }).catch(function () { throw e; });
    }).then(function () { return si; });
  }

  /* Ojo con el nombre: arriba ya hay un aleatorio() que genera las cadenas de
     PKCE. Al llamarse igual, esta declaración se comía a aquella y el "state"
     que se mandaba a Spotify era una promesa, no una cadena. */
  function ponerAleatorio(si) {
    return pedir('/me/player/shuffle?state=' + (si ? 'true' : 'false') +
      (deviceId ? '&device_id=' + encodeURIComponent(deviceId) : ''), { method: 'PUT' });
  }

  function repetir(modo) {
    return pedir('/me/player/repeat?state=' + encodeURIComponent(modo) +
      (deviceId ? '&device_id=' + encodeURIComponent(deviceId) : ''), { method: 'PUT' });
  }

  /* ---------- reproductor dentro de la app ----------
     El Web Playback SDK convierte esta pestaña en un dispositivo más de Spotify,
     así que la música suena aquí sin necesidad de tener la aplicación abierta.
     Requiere Premium: es condición de Spotify para el SDK. */

  const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';
  let player = null;
  let deviceId = '';
  let sdkListo = null;
  let estadoActual = null;
  const oyentes = [];

  /* ---- El SDK de Spotify se apodera de window.Spotify ----
     Su script hace literalmente window.Spotify = { Player }, que es el mismo
     nombre global que usa este módulo. A partir de ese momento Spotify.play,
     Spotify.traerAqui y todo lo demás desaparecen, y salta el
     "Spotify.traerAqui is not a function" justo al activar el reproductor.
     Aquí se guarda su Player, se devuelve el global a su sitio y se deja
     también el Player colgado del nuestro por si algo lo busca ahí. */
  let PlayerSDK = null;

  function recuperarGlobal() {
    const suyo = window.Spotify;
    if (suyo && suyo.Player && suyo !== g.Spotify) {
      PlayerSDK = suyo.Player;
      if (g.Spotify) g.Spotify.Player = suyo.Player;
    }
    if (g.Spotify) window.Spotify = g.Spotify;
  }

  function cargarSDK() {
    if (sdkListo) return sdkListo;
    sdkListo = new Promise(function (resolve, reject) {
      recuperarGlobal();
      if (PlayerSDK) return resolve();

      /* el SDK llama a esta función global cuando termina de cargarse */
      const previo = window.onSpotifyWebPlaybackSDKReady;
      window.onSpotifyWebPlaybackSDKReady = function () {
        recuperarGlobal();
        if (previo) { try { previo(); } catch (e) { /* nada */ } }
        if (PlayerSDK) resolve();
        else reject(new Error('El reproductor de Spotify no se cargó bien.'));
      };

      const s = document.createElement('script');
      s.src = SDK_URL;
      s.async = true;
      s.onerror = function () { reject(new Error('No se pudo cargar el reproductor de Spotify.')); };
      document.head.appendChild(s);

      setTimeout(function () { reject(new Error('El reproductor de Spotify tardó demasiado.')); }, 15000);
    });
    return sdkListo;
  }

  /* Arranca el reproductor y devuelve el identificador del dispositivo */
  function iniciarReproductor() {
    if (deviceId && player) return Promise.resolve(deviceId);
    if (!sesion()) return Promise.reject(new Error('Conecta Spotify primero.'));

    return cargarSDK().then(function () {
      return new Promise(function (resolve, reject) {
        recuperarGlobal();
        player = new PlayerSDK({
          name: 'Training FR',
          volume: 0.6,
          getOAuthToken: function (cb) {
            const s = sesion();
            if (!s) return;
            if (s.expires_at - Date.now() < 60000) {
              refrescar().then(function () { cb(sesion().access_token); })
                .catch(function () { cb(s.access_token); });
            } else cb(s.access_token);
          }
        });

        player.addListener('ready', function (ev) {
          deviceId = ev.device_id;
          desbloquearAudio();
          resolve(deviceId);
        });

        player.addListener('not_ready', function () { deviceId = ''; });

        player.addListener('player_state_changed', function (st) {
          estadoActual = st;
          oyentes.forEach(function (fn) { try { fn(estado()); } catch (e) { /* nada */ } });
        });

        const fallo = function (tipo) {
          return function (ev) {
            const msg = (ev && ev.message) || '';
            if (tipo === 'account') {
              sinPremium = true;
              reject(new Error('Reproducir dentro de la app requiere Spotify Premium.'));
            } else if (tipo === 'authentication') {
              reject(new Error('La sesión de Spotify caducó. Vuelve a conectar.'));
            } else {
              reject(new Error(msg || 'El reproductor de Spotify falló.'));
            }
          };
        };
        player.addListener('initialization_error', fallo('init'));
        player.addListener('authentication_error', fallo('authentication'));
        player.addListener('account_error', fallo('account'));

        player.connect().then(function (ok) {
          if (!ok) reject(new Error('No se pudo conectar el reproductor.'));
        });

        setTimeout(function () {
          if (!deviceId) reject(new Error('El reproductor no llegó a estar listo.'));
        }, 12000);
      });
    });
  }

  /* Estado normalizado del reproductor propio */
  function estado() {
    if (!estadoActual || !estadoActual.track_window || !estadoActual.track_window.current_track) return null;
    const t = estadoActual.track_window.current_track;
    return {
      id: t.id,
      titulo: t.name,
      artista: (t.artists || []).map(function (a) { return a.name; }).join(', '),
      album: t.album && t.album.name,
      portada: t.album && t.album.images && t.album.images.length
        ? t.album.images[t.album.images.length - 1].url : '',
      sonando: !estadoActual.paused,
      progreso: estadoActual.position,
      duracion: estadoActual.duration,
      aleatorio: !!estadoActual.shuffle,
      dispositivo: 'Training FR',
      local: true
    };
  }

  function alCambiar(fn) {
    oyentes.push(fn);
    return function () {
      const i = oyentes.indexOf(fn);
      if (i !== -1) oyentes.splice(i, 1);
    };
  }

  function reproductorActivo() { return !!(player && deviceId); }

  /* En móviles el navegador exige un gesto del usuario antes de sonar */
  function desbloquearAudio() {
    if (player && player.activateElement) {
      try { player.activateElement(); } catch (e) { /* no siempre existe */ }
    }
  }

  function apagarReproductor() {
    if (player) { try { player.disconnect(); } catch (e) { /* nada */ } }
    player = null; deviceId = ''; estadoActual = null;
  }

  /* Manda la reproducción a este dispositivo */
  function traerAqui() {
    return iniciarReproductor().then(function (id) {
      return pedir('/me/player', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_ids: [id], play: false })
      });
    });
  }

  /* ---------- búsqueda y listas ---------- */

  /* Busca una canción concreta y devuelve su URI, o null si no existe */
  function buscarPista(artista, titulo) {
    const q = 'track:' + titulo + ' artist:' + artista;
    return pedir('/search?type=track&limit=1&q=' + encodeURIComponent(q))
      .then(function (r) {
        const it = r && r.tracks && r.tracks.items && r.tracks.items[0];
        if (it) return { uri: it.uri, titulo: it.name, artista: (it.artists || []).map(function (a) { return a.name; }).join(', '), id: it.id };
        /* segundo intento con búsqueda libre: los títulos exactos fallan a menudo */
        return pedir('/search?type=track&limit=1&q=' + encodeURIComponent(artista + ' ' + titulo))
          .then(function (r2) {
            const it2 = r2 && r2.tracks && r2.tracks.items && r2.tracks.items[0];
            return it2 ? { uri: it2.uri, titulo: it2.name, artista: (it2.artists || []).map(function (a) { return a.name; }).join(', '), id: it2.id } : null;
          });
      })
      .catch(function () { return null; });
  }

  /* Resuelve una lista de canciones sugeridas a pistas reales de Spotify */
  function buscarPistas(canciones, onProgress) {
    const encontradas = [];
    let i = 0;

    function siguiente() {
      if (i >= canciones.length) return Promise.resolve(encontradas);
      const c = canciones[i++];
      return buscarPista(c.artista, c.titulo).then(function (p) {
        if (p) encontradas.push(Object.assign({}, p, { porque: c.porque || '' }));
        if (onProgress) onProgress(i, canciones.length, encontradas.length);
        return siguiente();
      });
    }
    return siguiente();
  }

  function reproducirUris(uris) {
    if (!uris || !uris.length) return Promise.reject(new Error('No hay canciones que reproducir.'));

    const lanzar = function (id) {
      return pedir('/me/player/play' + (id ? '?device_id=' + encodeURIComponent(id) : ''), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: uris })
      });
    };

    /* Si el reproductor propio está listo, suena aquí. Se transfiere el mando
       antes de lanzar: con otro dispositivo de Spotify activo (el móvil, el
       ordenador), la reproducción se iba allí y aquí no sonaba nada. */
    if (reproductorActivo()) {
      desbloquearAudio();
      return pedir('/me/player', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_ids: [deviceId], play: false })
      }).catch(function () { /* si ya era el activo, da igual */ })
        .then(function () { return lanzar(deviceId); });
    }
    return lanzar('');
  }

  function miUsuario() {
    return pedir('/me').then(function (r) { return r && r.id; });
  }

  /* Guarda la lista en la cuenta del usuario, para poder volver a ella */
  function crearPlaylist(nombre, descripcion, uris) {
    return miUsuario().then(function (uid) {
      return pedir('/users/' + encodeURIComponent(uid) + '/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nombre,
          description: (descripcion || '').slice(0, 280),
          public: false
        })
      });
    }).then(function (pl) {
      if (!pl || !pl.id) throw new Error('No se pudo crear la lista.');
      return pedir('/playlists/' + pl.id + '/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: uris })
      }).then(function () { return pl; });
    });
  }

  /* Tus artistas más escuchados, para que la IA parta de tus gustos */
  function misArtistas() {
    return pedir('/me/top/artists?limit=15&time_range=medium_term')
      .then(function (r) {
        return ((r && r.items) || []).map(function (a) { return a.name; });
      })
      .catch(function () { return []; });
  }

  const PUBLICO = {
    SCOPES_V: SCOPES_V, permisosCaducados: permisosCaducados, volumen: volumen,
    permisosQueFaltan: permisosQueFaltan, diagnostico: diagnostico,
    puedeGuardar: puedeGuardar,
    permisosConcedidos: function () { const x = sesion(); return (x && x.scope) || ''; },
    admiteVolumen: admiteVolumen,
    iniciarReproductor: iniciarReproductor, reproductorActivo: reproductorActivo,
    estado: estado, alCambiar: alCambiar, traerAqui: traerAqui,
    apagarReproductor: apagarReproductor, desbloquearAudio: desbloquearAudio,
    buscarPista: buscarPista, buscarPistas: buscarPistas, reproducirUris: reproducirUris,
    crearPlaylist: crearPlaylist, misArtistas: misArtistas,
    config: config, configurado: configurado, guardarConfig: guardarConfig,
    esperandoRedireccion: esperandoRedireccion, ultimoFallo: ultimoFallo,
    apuntarFallo: apuntarFallo,
    guardarPlaylist: guardarPlaylist, borrarConfig: borrarConfig,
    buscarListas: buscarListas, cancionesDeLista: cancionesDeLista,
    esFavorita: esFavorita, marcarFavorita: marcarFavorita,
    aleatorio: ponerAleatorio, repetir: repetir,
    activa: activa, entrar: entrar, salir: salir, capturarRedireccion: capturarRedireccion,
    urlRetorno: urlRetorno, sonando: sonando, play: play, pausa: pausa,
    siguiente: siguiente, anterior: anterior, alternar: alternar,
    ponerPlaylist: ponerPlaylist, misListas: misListas,
    urlEmbed: urlEmbed, idDePlaylist: idDePlaylist, queEs: queEs,
    requierePremium: requierePremium
  };

  g.Spotify = PUBLICO;

  /* Blindaje: el script del SDK hace window.Spotify = { Player }. Con este
     descriptor, esa asignación no borra nada: se queda con su Player y el
     global sigue siendo este módulo. Es la red por si el SDK lo reasigna en un
     momento que no controlamos. */
  try {
    Object.defineProperty(window, 'Spotify', {
      configurable: true,
      get: function () { return PUBLICO; },
      set: function (v) {
        if (v && v.Player) { PlayerSDK = v.Player; PUBLICO.Player = v.Player; }
      }
    });
  } catch (e) { /* si el navegador no deja, queda recuperarGlobal() */ }

})(window);
