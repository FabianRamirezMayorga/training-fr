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
    'playlist-modify-private',    // guardar las listas que genera la IA
    'playlist-modify-public',
    'user-top-read'               // conocer tus gustos para afinar las listas
  ].join(' ');

  /* La versión de permisos: si cambia, hay que volver a autorizar la cuenta */
  const SCOPES_V = 2;

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

  /* Los permisos han cambiado desde la última vez: hay que reconectar */
  function permisosCaducados() {
    const s = sesion();
    return !!(s && (s.scopes_v || 1) < SCOPES_V);
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

    const verificador = aleatorio(64);
    const estado = aleatorio(16);
    localStorage.setItem(VERIF, JSON.stringify({ v: verificador, s: estado }));

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
    });
  }

  /* Al volver de Spotify, el código llega en la query de la URL */
  function capturarRedireccion() {
    const q = new URLSearchParams(location.search);
    const code = q.get('code');
    const estado = q.get('state');
    const error = q.get('error');

    if (error) {
      limpiarURL();
      return Promise.resolve({ ok: false, error: 'Spotify denegó el permiso.' });
    }
    if (!code) return Promise.resolve({ ok: false });

    const guardado = leer(VERIF);
    localStorage.removeItem(VERIF);
    limpiarURL();

    if (!guardado || guardado.s !== estado) {
      return Promise.resolve({ ok: false, error: 'La respuesta de Spotify no coincide con la petición.' });
    }

    return token({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: urlRetorno(),
      code_verifier: guardado.v
    }).then(function () { return { ok: true }; })
      .catch(function (e) { return { ok: false, error: e.message }; });
  }

  function limpiarURL() {
    history.replaceState(null, '', location.pathname + (location.hash || '#/inicio'));
  }

  function token(params) {
    const c = config();
    params.client_id = c.clientId;
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
          scopes_v: SCOPES_V
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

    return fetch(API + ruta, opciones).catch(function () {
      throw new Error('Sin conexión con Spotify.');
    }).then(function (r) {
      if (r.status === 401 && !reintento) {
        return refrescar().then(function () { return pedir(ruta, opciones, true); });
      }
      if (r.status === 403) {
        sinPremium = true;
        throw new Error('Spotify solo permite controlar la reproducción con Premium.');
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
        titulo: r.item.name,
        artista: (r.item.artists || []).map(function (a) { return a.name; }).join(', '),
        album: r.item.album && r.item.album.name,
        portada: r.item.album && r.item.album.images && r.item.album.images.length
          ? r.item.album.images[r.item.album.images.length - 1].url : '',
        sonando: !!r.is_playing,
        progreso: r.progress_ms || 0,
        duracion: r.item.duration_ms || 0,
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
    if (local()) return player.setVolume(Math.max(0, Math.min(1, v)));
    return pedir('/me/player/volume?volume_percent=' + Math.round(v * 100), { method: 'PUT' });
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
    return pedir('/me/player/play', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context_uri: 'spotify:playlist:' + id })
    });
  }

  /* Acepta enlace web, URI o el identificador suelto */
  function idDePlaylist(v) {
    v = String(v || '').trim();
    if (!v) return '';
    let m = v.match(/playlist[/:]([a-zA-Z0-9]+)/);
    if (m) return m[1];
    if (/^[a-zA-Z0-9]{22}$/.test(v)) return v;
    return '';
  }

  /* Reproductor incrustado: es el camino cuando no hay Premium */
  function urlEmbed(v) {
    const id = idDePlaylist(v || config().playlist);
    if (!id) return '';
    return 'https://open.spotify.com/embed/playlist/' + id + '?utm_source=generator&theme=0';
  }

  function misListas() {
    return pedir('/me/playlists?limit=30').then(function (r) {
      return ((r && r.items) || []).map(function (p) {
        return {
          id: p.id, nombre: p.name, temas: p.tracks && p.tracks.total,
          portada: p.images && p.images.length ? p.images[p.images.length - 1].url : ''
        };
      });
    });
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

  function cargarSDK() {
    if (sdkListo) return sdkListo;
    sdkListo = new Promise(function (resolve, reject) {
      if (window.Spotify && window.Spotify.Player) return resolve();

      /* el SDK llama a esta función global cuando termina de cargarse */
      const previo = window.onSpotifyWebPlaybackSDKReady;
      window.onSpotifyWebPlaybackSDKReady = function () {
        if (previo) { try { previo(); } catch (e) { /* nada */ } }
        resolve();
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
        player = new window.Spotify.Player({
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
      titulo: t.name,
      artista: (t.artists || []).map(function (a) { return a.name; }).join(', '),
      album: t.album && t.album.name,
      portada: t.album && t.album.images && t.album.images.length
        ? t.album.images[t.album.images.length - 1].url : '',
      sonando: !estadoActual.paused,
      progreso: estadoActual.position,
      duracion: estadoActual.duration,
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

    /* si el reproductor propio está listo, suena aquí; si no, en el dispositivo activo */
    if (reproductorActivo()) {
      desbloquearAudio();
      return lanzar(deviceId);
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

  g.Spotify = {
    SCOPES_V: SCOPES_V, permisosCaducados: permisosCaducados, volumen: volumen,
    iniciarReproductor: iniciarReproductor, reproductorActivo: reproductorActivo,
    estado: estado, alCambiar: alCambiar, traerAqui: traerAqui,
    apagarReproductor: apagarReproductor, desbloquearAudio: desbloquearAudio,
    buscarPista: buscarPista, buscarPistas: buscarPistas, reproducirUris: reproducirUris,
    crearPlaylist: crearPlaylist, misArtistas: misArtistas,
    config: config, configurado: configurado, guardarConfig: guardarConfig,
    guardarPlaylist: guardarPlaylist, borrarConfig: borrarConfig,
    activa: activa, entrar: entrar, salir: salir, capturarRedireccion: capturarRedireccion,
    urlRetorno: urlRetorno, sonando: sonando, play: play, pausa: pausa,
    siguiente: siguiente, anterior: anterior, alternar: alternar,
    ponerPlaylist: ponerPlaylist, misListas: misListas,
    urlEmbed: urlEmbed, idDePlaylist: idDePlaylist, requierePremium: requierePremium
  };
})(window);
