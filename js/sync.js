/* sync.js — cuenta por correo y sincronización entre dispositivos.
   Se apoya en Supabase (plan gratuito) usando solo su API REST: no hace falta
   ninguna librería externa. Entras con un enlace que llega a tu correo, sin
   contraseña, y tus rutinas e historial viajan contigo.

   La clave que se guarda aquí es la "anon key", pensada para ser pública: quien
   la tenga solo puede leer y escribir sus propios datos, porque las políticas de
   seguridad de la tabla (RLS) filtran por el usuario autenticado. */
(function (g) {
  'use strict';

  const CFG_KEY = 'trainingfr.supabase';
  const SES_KEY = 'trainingfr.sesion';
  const TABLA = 'estado';

  /* SQL que hay que ejecutar una vez en el proyecto de Supabase */
  const SQL = [
    'create table if not exists public.estado (',
    '  user_id uuid primary key references auth.users on delete cascade,',
    '  data jsonb not null,',
    '  updated_at timestamptz not null default now()',
    ');',
    '',
    'alter table public.estado enable row level security;',
    '',
    'create policy "solo lo mio" on public.estado',
    '  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);'
  ].join('\n');

  function leer(k) {
    try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
  }
  function guardar(k, v) {
    if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v));
  }

  function config() { return leer(CFG_KEY); }
  function configurado() { const c = config(); return !!(c && c.url && c.key); }

  function guardarConfig(url, key) {
    url = String(url || '').trim().replace(/\/+$/, '');
    key = String(key || '').trim();
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
      throw new Error('La URL debe tener la forma https://xxxxx.supabase.co');
    }
    if (key.length < 30) throw new Error('La clave anon no parece válida.');
    guardar(CFG_KEY, { url: url, key: key });
  }

  function borrarConfig() { guardar(CFG_KEY, null); guardar(SES_KEY, null); }

  function sesion() { return leer(SES_KEY); }
  function email() { const s = sesion(); return s ? s.email : ''; }
  function activa() { return !!(configurado() && sesion()); }

  function cabeceras(conToken) {
    const c = config();
    const h = { 'apikey': c.key, 'Content-Type': 'application/json' };
    if (conToken) {
      const s = sesion();
      h['Authorization'] = 'Bearer ' + (s ? s.access_token : c.key);
    }
    return h;
  }

  function pedir(ruta, opciones) {
    const c = config();
    if (!c) return Promise.reject(new Error('Falta configurar la sincronización.'));
    return fetch(c.url + ruta, opciones).catch(function () {
      /* fetch solo falla así cuando no hay red o la URL del proyecto no existe */
      throw new Error('No se pudo conectar. Revisa tu conexión y la URL del proyecto.');
    }).then(function (r) {
      if (r.status === 204) return null;
      return r.text().then(function (t) {
        let cuerpo = null;
        try { cuerpo = t ? JSON.parse(t) : null; } catch (e) { cuerpo = t; }
        if (!r.ok) {
          const msg = (cuerpo && (cuerpo.error_description || cuerpo.msg ||
            cuerpo.message || cuerpo.error)) || ('Error ' + r.status);
          throw new Error(msg);
        }
        return cuerpo;
      });
    });
  }

  /* ---------- entrar con el correo ---------- */

  /* A dónde vuelve el enlace del correo: la propia app, sin hash de ruta */
  function urlRetorno() {
    return location.origin + location.pathname;
  }

  function enviarEnlace(dir) {
    dir = String(dir || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dir)) {
      return Promise.reject(new Error('Escribe un correo válido.'));
    }
    return pedir('/auth/v1/otp?redirect_to=' + encodeURIComponent(urlRetorno()), {
      method: 'POST',
      headers: cabeceras(false),
      body: JSON.stringify({ email: dir, create_user: true })
    }).then(function () { return dir; });
  }

  /* Al volver del correo, Supabase deja los tokens en el hash de la URL */
  function capturarRedireccion() {
    const h = location.hash || '';
    if (h.indexOf('access_token=') === -1) return Promise.resolve(false);

    const p = new URLSearchParams(h.replace(/^#/, ''));
    const access = p.get('access_token');
    const refresh = p.get('refresh_token');
    const expira = Number(p.get('expires_in') || 3600);
    if (!access) return Promise.resolve(false);

    guardar(SES_KEY, {
      access_token: access, refresh_token: refresh,
      expires_at: Date.now() + expira * 1000, email: '', user_id: ''
    });

    /* se limpia la URL para que no quede el token a la vista */
    history.replaceState(null, '', location.pathname + '#/inicio');

    return usuario().then(function (u) {
      const s = sesion();
      s.email = u.email; s.user_id = u.id;
      guardar(SES_KEY, s);
      return true;
    }).catch(function () {
      guardar(SES_KEY, null);
      return false;
    });
  }

  function usuario() {
    return pedir('/auth/v1/user', { headers: cabeceras(true) });
  }

  function refrescar() {
    const s = sesion();
    if (!s || !s.refresh_token) return Promise.reject(new Error('No hay sesión.'));
    return pedir('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: cabeceras(false),
      body: JSON.stringify({ refresh_token: s.refresh_token })
    }).then(function (r) {
      guardar(SES_KEY, {
        access_token: r.access_token, refresh_token: r.refresh_token,
        expires_at: Date.now() + (r.expires_in || 3600) * 1000,
        email: (r.user && r.user.email) || s.email,
        user_id: (r.user && r.user.id) || s.user_id
      });
      return true;
    });
  }

  /* Renueva el token si le queda menos de un minuto */
  function conSesion(fn) {
    const s = sesion();
    if (!s) return Promise.reject(new Error('Entra con tu correo primero.'));
    if (s.expires_at && s.expires_at - Date.now() < 60000) {
      return refrescar().then(fn);
    }
    return Promise.resolve().then(fn);
  }

  function salir() {
    const s = sesion();
    guardar(SES_KEY, null);
    if (!s) return Promise.resolve();
    return pedir('/auth/v1/logout', { method: 'POST', headers: cabeceras(true) })
      .catch(function () { /* la sesión local ya está cerrada */ });
  }

  /* ---------- claves de los demás servicios ----------
     Con la sincronización de claves activada, la configuración de Gemini y de
     Spotify viaja con el resto de datos, para no tener que copiarla a mano en
     cada dispositivo.

     Las sesiones abiertas nunca se sincronizan: los tokens caducan en una hora,
     cada dispositivo necesita el suyo y repartirlos no aporta nada. Tampoco viaja
     la configuración de Supabase, porque es justo la que hace falta para llegar
     hasta aquí; para eso está el enlace de configuración. */

  const CLAVES_SINCRONIZABLES = [
    { origen: 'trainingfr.ia', campo: 'ia' },
    { origen: 'trainingfr.spotify', campo: 'spotify' }
  ];

  function sincronizaClaves() {
    return Store.settings().sincronizarClaves !== false;
  }

  function recogerClaves() {
    if (!sincronizaClaves()) return null;
    const out = {};
    CLAVES_SINCRONIZABLES.forEach(function (c) {
      const v = leer(c.origen);
      if (v) out[c.campo] = v;
    });
    return Object.keys(out).length ? out : null;
  }

  function aplicarClaves(claves) {
    if (!claves || !sincronizaClaves()) return 0;
    let n = 0;
    CLAVES_SINCRONIZABLES.forEach(function (c) {
      if (claves[c.campo]) { guardar(c.origen, claves[c.campo]); n++; }
    });
    return n;
  }

  /* ---------- enlace para configurar otro dispositivo ----------
     Lleva la URL del proyecto y la clave anon, que son públicas por diseño en
     cualquier aplicación de Supabase: sin entrar con el correo no dan acceso a
     ningún dato, porque las políticas de seguridad filtran por usuario. */

  function enlaceConfiguracion() {
    const c = config();
    if (!c || !c.url || !c.key) throw new Error('Configura antes la sincronización.');
    const dato = btoa(JSON.stringify({ u: c.url, k: c.key }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return location.origin + location.pathname + '#/enlazar/' + dato;
  }

  /* Lee el enlace y deja el dispositivo listo para entrar con el correo */
  function aplicarEnlace(dato) {
    try {
      const json = atob(String(dato).replace(/-/g, '+').replace(/_/g, '/'));
      const d = JSON.parse(json);
      if (!d.u || !d.k) throw new Error('faltan datos');
      guardarConfig(d.u, d.k);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- datos ---------- */

  function bajar() {
    return conSesion(function () {
      return pedir('/rest/v1/' + TABLA + '?select=data,updated_at&limit=1',
        { headers: cabeceras(true) });
    }).then(function (filas) {
      if (!filas || !filas.length) return null;
      return { data: filas[0].data, updatedAt: Date.parse(filas[0].updated_at) || 0 };
    });
  }

  function subir() {
    return conSesion(function () {
      const s = sesion();
      const estado = Store.exportar();
      const claves = recogerClaves();
      if (claves) estado.claves = claves;
      const cuerpo = [{
        user_id: s.user_id,
        data: estado,
        updated_at: new Date(estado.updatedAt || Date.now()).toISOString()
      }];
      const h = cabeceras(true);
      h['Prefer'] = 'resolution=merge-duplicates,return=minimal';
      return pedir('/rest/v1/' + TABLA, {
        method: 'POST', headers: h, body: JSON.stringify(cuerpo)
      });
    }).then(function () {
      marcarSync();
      return true;
    });
  }

  function aplicar(remoto) {
    const datos = remoto.data || {};
    /* las claves se guardan aparte, no dentro del estado principal */
    const n = aplicarClaves(datos.claves);
    const limpio = Object.assign({}, datos);
    delete limpio.claves;
    Store.importar(limpio);
    marcarSync();
    return n;
  }

  function marcarSync() { guardar('trainingfr.ultimoSync', Date.now()); }
  function ultimoSync() { return leer('trainingfr.ultimoSync') || 0; }

  /* Sincroniza: gana la versión más reciente.
     Devuelve 'subido', 'bajado', 'igual' o 'conflicto' (para que decida el usuario). */
  function sincronizar(forzar) {
    return bajar().then(function (remoto) {
      const local = Store.exportar();
      const tLocal = local.updatedAt || 0;

      if (forzar === 'subir') return subir().then(function () { return 'subido'; });
      if (forzar === 'bajar') {
        if (!remoto) throw new Error('No hay nada guardado en la nube todavía.');
        aplicar(remoto);
        return 'bajado';
      }

      if (!remoto) return subir().then(function () { return 'subido'; });
      if (remoto.updatedAt > tLocal) { aplicar(remoto); return 'bajado'; }
      if (tLocal > remoto.updatedAt) return subir().then(function () { return 'subido'; });
      marcarSync();
      return 'igual';
    });
  }

  /* ¿Hay datos propios en este dispositivo que podrían pisarse al entrar? */
  function hayDatosLocales() {
    const e = Store.exportar();
    return (e.routines && e.routines.length) || (e.sessions && e.sessions.length);
  }

  /* Subida automática tras cambiar algo, agrupando ráfagas de cambios */
  let pendiente = null;
  function programarSubida() {
    if (!activa()) return;
    clearTimeout(pendiente);
    pendiente = setTimeout(function () {
      subir().catch(function () { /* se reintentará en la próxima sincronización */ });
    }, 4000);
  }

  g.Sync = {
    SQL: SQL,
    config: config, configurado: configurado, guardarConfig: guardarConfig, borrarConfig: borrarConfig,
    sesion: sesion, email: email, activa: activa,
    sincronizaClaves: sincronizaClaves, enlaceConfiguracion: enlaceConfiguracion,
    aplicarEnlace: aplicarEnlace,
    enviarEnlace: enviarEnlace, capturarRedireccion: capturarRedireccion, salir: salir,
    bajar: bajar, subir: subir, sincronizar: sincronizar,
    hayDatosLocales: hayDatosLocales, programarSubida: programarSubida,
    ultimoSync: ultimoSync, urlRetorno: urlRetorno
  };
})(window);
