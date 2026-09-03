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

  /* ---- Conexión de fábrica ----
     Si estos dos datos vienen rellenos, cualquier dispositivo que abra la app ya
     está conectado y solo tiene que escribir correo y contraseña: nada de pegar
     enlaces. La clave publishable está pensada precisamente para viajar en el
     navegador; lo que protege los datos son las políticas RLS de la tabla, que
     solo dejan ver y escribir las filas del usuario autenticado.
     Vacío = la app pide la configuración como antes. */
  const DE_FABRICA = {
    url: 'https://jeigxeunjofhfxbcfazp.supabase.co',
    key: 'sb_publishable_YqkEVOKGpx7DF8_eOgqnFg_Ew5lVRQY'
  };

  function hayFabrica() { return !!(DE_FABRICA.url && DE_FABRICA.key); }

  /* Manda lo guardado en el dispositivo; si no hay nada, la conexión de fábrica */
  function config() {
    const c = leer(CFG_KEY);
    if (c && c.url && c.key) return c;
    return hayFabrica() ? DE_FABRICA : c;
  }
  function configurado() { const c = config(); return !!(c && c.url && c.key); }
  /* ¿La configuración es propia de este dispositivo o la que trae la app? */
  function configPropia() { const c = leer(CFG_KEY); return !!(c && c.url && c.key); }

  function guardarConfig(url, key) {
    url = String(url || '').trim().replace(/\/+$/, '');
    key = String(key || '').trim();
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
      throw new Error('La URL debe tener la forma https://xxxxx.supabase.co');
    }
    /* vale tanto la clave publishable actual como la anon de los proyectos antiguos */
    const formatoOk = /^sb_publishable_[A-Za-z0-9_-]{10,}$/.test(key) ||
      /^eyJ[A-Za-z0-9._-]{30,}$/.test(key);
    if (!formatoOk) {
      throw new Error('Esa clave no parece la publishable ni la anon. Cópiala de Project Settings, API Keys.');
    }
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
    }).then(function () { return dir; })
      .catch(function (e) {
        if (/rate limit/i.test(String(e.message || ''))) {
          throw new Error('Supabase solo deja enviar un par de correos por hora en el plan ' +
            'gratuito y ya se han agotado. Entra con contraseña, que no tiene ese límite.');
        }
        throw e;
      });
  }

  /* ---------- entrar con contraseña ----------
     El servidor de correo que trae Supabase de serie solo deja mandar un par de
     mensajes por hora, así que el enlace por correo se agota enseguida cuando se
     prueban varios dispositivos. Con contraseña no hay ese límite ni depende de
     que el enlace se abra en el navegador correcto. */

  function validarCredenciales(correo, clave) {
    correo = String(correo || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      throw new Error('Escribe un correo válido.');
    }
    if (String(clave || '').length < 8) {
      throw new Error('La contraseña necesita al menos 8 caracteres.');
    }
    return correo;
  }

  /* Crea la cuenta. Si el proyecto exige confirmar el correo, Supabase no
     devuelve sesión y hay que confirmar antes: se avisa en ese caso. */
  function registrar(correo, clave) {
    let dir;
    try { dir = validarCredenciales(correo, clave); }
    catch (e) { return Promise.reject(e); }

    return pedir('/auth/v1/signup', {
      method: 'POST',
      headers: cabeceras(false),
      body: JSON.stringify({ email: dir, password: clave })
    }).then(function (r) {
      if (r && r.access_token) {
        return abrirSesion(r.access_token, r.refresh_token, r.expires_in);
      }
      return {
        ok: false,
        pendiente: true,
        error: 'Cuenta creada. Tu proyecto pide confirmar el correo: ábrelo y pulsa el ' +
          'enlace, o desactiva esa confirmación en Supabase (Authentication, Sign In, ' +
          'Confirm email) para entrar directamente.'
      };
    }).catch(function (e) {
      const t = String(e.message || '');
      if (/already registered|already been registered/i.test(t)) {
        throw new Error('Ese correo ya tiene cuenta. Usa "Ya tengo contraseña" para entrar.');
      }
      if (/rate limit/i.test(t)) {
        throw new Error('Supabase ha limitado los correos por ahora. Desactiva la ' +
          'confirmación por correo en tu proyecto y vuelve a intentarlo.');
      }
      /* El proyecto tiene cerrado el alta de cuentas nuevas, que es lo
         recomendable una vez creadas las tuyas */
      if (/signup.{0,12}disabled|signups not allowed/i.test(t)) {
        throw new Error('Tu proyecto tiene cerrado el registro de cuentas nuevas. ' +
          'Entra con tu correo y tu contraseña de siempre. Si de verdad quieres otra ' +
          'cuenta, ábrelo en Supabase: Authentication, Sign In, Allow new users to sign up.');
      }
      throw new Error(t || 'No se pudo crear la cuenta.');
    });
  }

  /* Establece o cambia la contraseña de la sesión abierta. Sirve para las
     cuentas creadas con enlace por correo, que nacen sin contraseña y por eso
     no pueden entrar en otro dispositivo sin gastar otro correo. */
  function establecerClave(clave) {
    if (String(clave || '').length < 8) {
      return Promise.reject(new Error('La contraseña necesita al menos 8 caracteres.'));
    }
    return conSesion(function () {
      return pedir('/auth/v1/user', {
        method: 'PUT',
        headers: cabeceras(true),
        body: JSON.stringify({ password: clave })
      });
    }).then(function () { return true; })
      .catch(function (e) {
        const t = String(e.message || '');
        if (/same.*password|should be different/i.test(t)) {
          throw new Error('Esa ya es tu contraseña actual.');
        }
        if (/weak|password/i.test(t) && /short|length/i.test(t)) {
          throw new Error('La contraseña es demasiado corta para tu proyecto.');
        }
        throw new Error(t || 'No se pudo guardar la contraseña.');
      });
  }

  function entrarConClave(correo, clave) {
    let dir;
    try { dir = validarCredenciales(correo, clave); }
    catch (e) { return Promise.reject(e); }

    return pedir('/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: cabeceras(false),
      body: JSON.stringify({ email: dir, password: clave })
    }).then(function (r) {
      if (!r || !r.access_token) throw new Error('No se pudo iniciar sesión.');
      return abrirSesion(r.access_token, r.refresh_token, r.expires_in);
    }).catch(function (e) {
      const t = String(e.message || '');
      if (/invalid login credentials/i.test(t)) {
        throw new Error('Correo o contraseña incorrectos. Si es tu primera vez, crea la cuenta.');
      }
      if (/email not confirmed/i.test(t)) {
        throw new Error('Falta confirmar el correo. Ábrelo y pulsa el enlace, o desactiva ' +
          'esa confirmación en Supabase.');
      }
      throw new Error(t || 'No se pudo iniciar sesión.');
    });
  }

  /* Al volver del correo, Supabase puede devolver la sesión de tres formas según
     la versión del proyecto y la plantilla de correo:

       1. #access_token=...        el token ya listo, en el fragmento
       2. ?token_hash=...&type=... hay que canjearlo en /auth/v1/verify
       3. ?code=...                hay que canjearlo en /auth/v1/token

     Antes solo se miraba la primera, así que con las otras dos no pasaba
     absolutamente nada: ni sesión ni aviso. Ahora se contemplan las tres, y
     también los errores que Supabase devuelve por el mismo camino. */

  function parametros(url) {
    const u = url ? new URL(url, location.href) : location;
    const query = new URLSearchParams(u.search || '');
    const hash = new URLSearchParams((u.hash || '').replace(/^#/, ''));
    return function (nombre) { return hash.get(nombre) || query.get(nombre); };
  }

  /* Guarda la sesión y completa los datos del usuario */
  function abrirSesion(access, refresh, expira) {
    guardar(SES_KEY, {
      access_token: access,
      refresh_token: refresh || '',
      expires_at: Date.now() + (Number(expira) || 3600) * 1000,
      email: '', user_id: ''
    });

    return usuario().then(function (u) {
      const ses = sesion();
      ses.email = u.email; ses.user_id = u.id;
      guardar(SES_KEY, ses);

      /* si en este dispositivo había otra cuenta, sus datos se van ahora */
      if (esOtraCuenta(u.id)) {
        const anterior = ultimoUsuario();
        limpiarDatosDeCuenta();
        guardar(SES_KEY, ses);   // la sesión recién abierta se conserva
        recordarUsuario(u.id, u.email);
        return { ok: true, cambioDeCuenta: true, anterior: anterior && anterior.correo };
      }
      recordarUsuario(u.id, u.email);
      return { ok: true, cambioDeCuenta: false };
    }).catch(function (e) {
      guardar(SES_KEY, null);
      return { ok: false, error: e.message || 'No se pudo abrir la sesión.' };
    });
  }

  /* Canjea el token de un enlace de correo (formato token_hash o token) */
  function canjearToken(token, tipo) {
    return pedir('/auth/v1/verify', {
      method: 'POST',
      headers: cabeceras(false),
      body: JSON.stringify({ type: tipo || 'magiclink', token_hash: token })
    }).then(function (r) {
      if (!r || !r.access_token) throw new Error('El enlace no devolvió una sesión.');
      return abrirSesion(r.access_token, r.refresh_token, r.expires_in);
    });
  }

  /* Canjea el código del flujo con verificador */
  function canjearCodigo(code) {
    const guardadoVerif = leer('trainingfr.sync.verificador');
    const cuerpo = { auth_code: code };
    if (guardadoVerif) cuerpo.code_verifier = guardadoVerif;
    localStorage.removeItem('trainingfr.sync.verificador');

    return pedir('/auth/v1/token?grant_type=pkce', {
      method: 'POST',
      headers: cabeceras(false),
      body: JSON.stringify(cuerpo)
    }).then(function (r) {
      if (!r || !r.access_token) throw new Error('El código no devolvió una sesión.');
      return abrirSesion(r.access_token, r.refresh_token, r.expires_in);
    });
  }

  function limpiarURLRetorno() {
    history.replaceState(null, '', location.pathname + '#/cuenta');
  }

  /* Procesa una vuelta del correo. Sin argumento mira la URL actual; con una
     URL pegada a mano, la analiza igual (útil si el correo abre en otro
     navegador y hay que traerse el enlace hasta aquí). */
  function procesarRetorno(url) {
    const p = parametros(url);

    const error = p('error_description') || p('error');
    if (error) {
      if (!url) limpiarURLRetorno();
      return Promise.resolve({ ok: false, error: descifrarError(error) });
    }

    const access = p('access_token');
    if (access) {
      if (!url) limpiarURLRetorno();
      return abrirSesion(access, p('refresh_token'), p('expires_in'));
    }

    const tokenHash = p('token_hash') || p('token');
    if (tokenHash) {
      if (!url) limpiarURLRetorno();
      return canjearToken(tokenHash, p('type'))
        .catch(function (e) { return { ok: false, error: descifrarError(e.message) }; });
    }

    const code = p('code');
    if (code) {
      if (!url) limpiarURLRetorno();
      return canjearCodigo(code)
        .catch(function (e) { return { ok: false, error: descifrarError(e.message) }; });
    }

    return Promise.resolve({ ok: false });
  }

  /* Traduce los fallos más habituales a algo accionable */
  function descifrarError(msg) {
    const t = String(msg || '');
    if (/expired|caduc/i.test(t)) {
      return 'El enlace ha caducado. Pide uno nuevo: solo valen unos minutos y un único uso.';
    }
    if (/already been used|used/i.test(t)) {
      return 'Ese enlace ya se usó. Pide uno nuevo desde la app.';
    }
    if (/redirect|not allowed/i.test(t)) {
      return 'La dirección de retorno no está autorizada en Supabase. Añádela en Authentication, URL Configuration.';
    }
    if (/invalid|not found/i.test(t)) {
      return 'El enlace no es válido. Pide uno nuevo desde este mismo dispositivo.';
    }
    return t || 'No se pudo completar el acceso.';
  }

  function capturarRedireccion() {
    return procesarRetorno(null);
  }

  /* Entrar pegando el enlace del correo: la salida cuando el correo se abre en
     un navegador distinto del que tiene la app instalada. */
  function entrarConEnlace(url) {
    url = String(url || '').trim();
    if (!url) return Promise.reject(new Error('Pega el enlace que te llegó al correo.'));

    let limpio = url;
    /* si es el enlace directo de Supabase, se le quita el redirect para que
       devuelva la sesión aquí en lugar de reenviar a otra parte */
    try {
      const u = new URL(url);
      const token = u.searchParams.get('token') || u.searchParams.get('token_hash');
      if (token && /\/auth\/v1\/verify/.test(u.pathname)) {
        return canjearToken(token, u.searchParams.get('type') || 'magiclink');
      }
      limpio = u.href;
    } catch (e) {
      return Promise.reject(new Error('Eso no parece un enlace. Cópialo entero desde el correo.'));
    }

    return procesarRetorno(limpio).then(function (r) {
      if (!r.ok && !r.error) {
        throw new Error('Ese enlace no lleva ningún acceso. Copia el del botón del correo.');
      }
      if (!r.ok) throw new Error(r.error);
      return r;
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

  function salir(borrarDatos) {
    const s = sesion();
    guardar(SES_KEY, null);
    if (borrarDatos) {
      limpiarDatosDeCuenta();
      guardar(USUARIO_KEY, null);
    }
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

  /* ---------- una cuenta, sus datos ----------
     Cada correo tiene sus rutinas, sus preferencias y sus claves. Si en este
     dispositivo entra otra cuenta, primero se borra lo del anterior: de lo
     contrario, quien entrase después se encontraría con las claves ajenas. */

  const USUARIO_KEY = 'trainingfr.ultimoUsuario';

  /* Todo lo que pertenece a una cuenta concreta y no debe sobrevivir al cambio */
  const DATOS_DE_CUENTA = [
    'trainingfr.v1',                 // rutinas, historial, perfil, objetivos, alertas
    'trainingfr.ia', 'trainingfr.ia.cache', 'trainingfr.ia.modelos',
    'trainingfr.spotify', 'trainingfr.spotify.sesion',
    'trainingfr.plan.nutricion', 'trainingfr.playlist', 'trainingfr.musica.memoria',
    'trainingfr.ultimoSync'
  ];

  function ultimoUsuario() { return leer(USUARIO_KEY); }

  function recordarUsuario(id, correo) {
    guardar(USUARIO_KEY, { id: id, correo: correo });
  }

  /* Borra lo de la cuenta anterior. No toca la configuración de Supabase:
     esa es del dispositivo y hace falta para que el siguiente pueda entrar. */
  function limpiarDatosDeCuenta() {
    DATOS_DE_CUENTA.forEach(function (k) { localStorage.removeItem(k); });
    /* las traducciones de ejercicios se guardan una por clave */
    Object.keys(localStorage)
      .filter(function (k) { return k.indexOf('trainingfr.tr.') === 0; })
      .forEach(function (k) { localStorage.removeItem(k); });
  }

  /* ¿El que entra es distinto del que había? */
  function esOtraCuenta(id) {
    const prev = ultimoUsuario();
    return !!(prev && prev.id && id && prev.id !== id);
  }

  /* De cada servicio se queda la configuración guardada más tarde, para que
     cambiar una clave en un dispositivo no la pise la versión vieja del otro. */
  function aplicarClaves(claves) {
    if (!claves || !sincronizaClaves()) return 0;
    let n = 0;
    CLAVES_SINCRONIZABLES.forEach(function (c) {
      const remota = claves[c.campo];
      if (!remota) return;
      const local = leer(c.origen);
      const tLocal = (local && local._ts) || 0;
      const tRemota = remota._ts || 0;
      /* sin marca de tiempo se asume antigua: solo entra si aquí no hay nada */
      if (!local || tRemota > tLocal) { guardar(c.origen, remota); n++; }
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

  /* La base de datos ya filtra por usuario con su política de seguridad, pero la
     petición pide además su propia fila por identificador: si alguna vez esa
     política se desactivara, el cliente seguiría sin pedir datos de nadie más. */
  function bajar() {
    return conSesion(function () {
      const s = sesion();
      const filtro = s && s.user_id ? '&user_id=eq.' + encodeURIComponent(s.user_id) : '';
      return pedir('/rest/v1/' + TABLA + '?select=data,updated_at' + filtro + '&limit=1',
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

  /* ---------- fusión ----------
     Añadir un dispositivo no puede costarle datos a nadie. Por eso no se
     reemplaza un estado por otro: se fusionan los dos, elemento a elemento.

     La regla es simple: algo desaparece solo si alguien lo borró a propósito,
     y de eso queda constancia. Si el mismo elemento cambió en los dos sitios,
     gana la versión editada más tarde. */

  function indexar(lista) {
    const m = {};
    (lista || []).forEach(function (x) { if (x && x.id) m[x.id] = x; });
    return m;
  }

  /* Une dos colecciones respetando los borrados deliberados de ambos lados */
  function fusionarColeccion(locales, remotos, borrados) {
    const a = indexar(locales), b = indexar(remotos);
    const ids = Object.keys(a).concat(Object.keys(b).filter(function (id) { return !a[id]; }));

    return ids.map(function (id) {
      const x = a[id], y = b[id];
      if (!y) return x;
      if (!x) return y;
      /* el mismo elemento en ambos lados: se queda el editado más tarde */
      return (y.updatedAt || 0) > (x.updatedAt || 0) ? y : x;
    }).filter(function (x) {
      /* fuera lo que se borró después de su última edición */
      const cuandoSeBorro = borrados[x.id];
      return !cuandoSeBorro || cuandoSeBorro < (x.updatedAt || 0);
    });
  }

  /* Los ajustes se fusionan campo a campo con su propia marca de cambio */
  function fusionarAjustes(local, remoto, sellosLocal, sellosRemoto) {
    const out = Object.assign({}, local);
    Object.keys(remoto || {}).forEach(function (k) {
      const tLocal = (sellosLocal || {})[k] || 0;
      const tRemoto = (sellosRemoto || {})[k] || 0;
      /* solo pisa el valor local si allí se cambió más tarde */
      if (!(k in out) || tRemoto > tLocal) out[k] = remoto[k];
    });
    return out;
  }

  function fusionarMarcas(a, b) {
    const out = Object.assign({}, a || {});
    Object.keys(b || {}).forEach(function (k) {
      if (!out[k] || b[k] > out[k]) out[k] = b[k];
    });
    return out;
  }

  /* Combina el estado de este dispositivo con el de la nube */
  function fusionar(local, remoto) {
    local = local || {};
    remoto = remoto || {};

    const borrados = {
      routines: fusionarMarcas((local.borrados || {}).routines, (remoto.borrados || {}).routines),
      sessions: fusionarMarcas((local.borrados || {}).sessions, (remoto.borrados || {}).sessions),
      favorites: fusionarMarcas((local.borrados || {}).favorites, (remoto.borrados || {}).favorites)
    };

    const sellos = fusionarMarcas(local.sellos, remoto.sellos);

    const favoritos = [].concat(local.favorites || [], remoto.favorites || [])
      .filter(function (id, i, arr) { return arr.indexOf(id) === i; })
      .filter(function (id) { return !borrados.favorites[id]; });

    return {
      version: local.version || remoto.version || 1,
      settings: fusionarAjustes(local.settings, remoto.settings, local.sellos, remoto.sellos),
      routines: fusionarColeccion(local.routines, remoto.routines, borrados.routines),
      sessions: fusionarColeccion(local.sessions, remoto.sessions, borrados.sessions),
      favorites: favoritos,
      /* el entrenamiento a medias es de este dispositivo y no viaja */
      active: local.active || null,
      sellos: sellos,
      borrados: borrados,
      updatedAt: Math.max(local.updatedAt || 0, remoto.updatedAt || 0, Date.now())
    };
  }

  /* Reemplazo completo por lo que hay en la nube. Solo desde "traer lo de la nube". */
  function aplicar(remoto) {
    const datos = remoto.data || {};
    const n = aplicarClaves(datos.claves);
    const limpio = Object.assign({}, datos);
    delete limpio.claves;
    Store.importar(limpio);
    marcarSync();
    return n;
  }

  function marcarSync() { guardar('trainingfr.ultimoSync', Date.now()); }
  function ultimoSync() { return leer('trainingfr.ultimoSync') || 0; }

  /* Sincroniza fusionando los dos lados. Nada desaparece salvo lo que se haya
     borrado a propósito; si un mismo elemento cambió en ambos, gana el último.

     'subir' y 'bajar' fuerzan un reemplazo completo y solo se usan cuando el
     usuario lo pide expresamente desde la pantalla de cuenta. */
  function sincronizar(forzar) {
    if (forzar === 'subir') return subir().then(function () { return 'subido'; });

    return bajar().then(function (remoto) {
      if (forzar === 'bajar') {
        if (!remoto) throw new Error('No hay nada guardado en la nube todavía.');
        aplicar(remoto);
        return 'bajado';
      }

      const local = Store.exportar();
      if (!remoto) return subir().then(function () { return 'subido'; });

      const fusionado = fusionar(local, remoto.data || {});
      const cambiaAqui = huella(fusionado) !== huella(local);
      let cambiaAlla = huella(fusionado) !== huella(remoto.data || {});

      /* Las claves viajan aparte del estado, así que hay que compararlas por
         separado: si solo faltan ellas en la nube, el resto coincide y sin esta
         comprobación la app daría por hecho que no hay nada que subir. */
      const clavesRemotas = (remoto.data || {}).claves || null;
      aplicarClaves(clavesRemotas);

      const clavesLocales = recogerClaves();
      if (JSON.stringify(clavesLocales) !== JSON.stringify(clavesRemotas)) cambiaAlla = true;

      if (cambiaAqui) Store.importar(fusionado);
      if (cambiaAlla) return subir().then(function () { return cambiaAqui ? 'fusionado' : 'subido'; });

      marcarSync();
      return cambiaAqui ? 'bajado' : 'igual';
    });
  }

  /* Resumen barato del contenido, para saber si la fusión cambió algo */
  function huella(e) {
    e = e || {};
    const ids = function (lista) {
      return (lista || []).map(function (x) {
        return x.id + ':' + (x.updatedAt || 0);
      }).sort().join(',');
    };
    return ids(e.routines) + '|' + ids(e.sessions) + '|' +
      (e.favorites || []).slice().sort().join(',') + '|' +
      JSON.stringify(e.settings || {});
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
    configPropia: configPropia, hayFabrica: hayFabrica,
    aplicarEnlace: aplicarEnlace, ultimoUsuario: ultimoUsuario,
    limpiarDatosDeCuenta: limpiarDatosDeCuenta, fusionar: fusionar,
    enviarEnlace: enviarEnlace, capturarRedireccion: capturarRedireccion, salir: salir,
    entrarConEnlace: entrarConEnlace, registrar: registrar, entrarConClave: entrarConClave,
    establecerClave: establecerClave,
    bajar: bajar, subir: subir, sincronizar: sincronizar,
    hayDatosLocales: hayDatosLocales, programarSubida: programarSubida,
    ultimoSync: ultimoSync, urlRetorno: urlRetorno
  };
})(window);
