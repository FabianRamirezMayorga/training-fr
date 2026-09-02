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
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private'
  ].join(' ');

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
    escribir(CFG, { clientId: clientId, playlist: String(playlist || '').trim() });
  }

  function guardarPlaylist(url) {
    const c = config();
    c.playlist = String(url || '').trim();
    escribir(CFG, c);
  }

  function borrarConfig() { escribir(CFG, null); escribir(SES, null); }

  function sesion() { return leer(SES); }
  function activa() { return !!(configurado() && sesion()); }
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
          expires_at: Date.now() + (j.expires_in || 3600) * 1000
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

  function play() { return pedir('/me/player/play', { method: 'PUT' }); }
  function pausa() { return pedir('/me/player/pause', { method: 'PUT' }); }
  function siguiente() { return pedir('/me/player/next', { method: 'POST' }); }
  function anterior() { return pedir('/me/player/previous', { method: 'POST' }); }

  function alternar() {
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

  g.Spotify = {
    config: config, configurado: configurado, guardarConfig: guardarConfig,
    guardarPlaylist: guardarPlaylist, borrarConfig: borrarConfig,
    activa: activa, entrar: entrar, salir: salir, capturarRedireccion: capturarRedireccion,
    urlRetorno: urlRetorno, sonando: sonando, play: play, pausa: pausa,
    siguiente: siguiente, anterior: anterior, alternar: alternar,
    ponerPlaylist: ponerPlaylist, misListas: misListas,
    urlEmbed: urlEmbed, idDePlaylist: idDePlaylist, requierePremium: requierePremium
  };
})(window);
