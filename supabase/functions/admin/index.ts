/* admin — la única parte de Training FR que no vive en el navegador.

   Crear cuentas ajenas, desactivarlas o borrarlas son operaciones de
   administrador, y Supabase solo las permite con la service_role key, que se
   salta las políticas RLS por completo. Esa clave no puede estar en la app: es
   HTML servido en abierto y cualquiera que mire el código fuente la leería, con
   acceso total a los datos de todos. Por eso vive aquí, en el servidor, como
   secreto de la función.

   Quien llama tiene que demostrar quién es: manda su token de sesión, la
   función se lo pregunta a Supabase y solo sigue si ese usuario está en la
   lista de administradores. El navegador no decide nada; si alguien llama a
   esta función a mano sin ser administrador, se le responde 403 y ya está.

   Para desplegarla:
     supabase functions deploy admin --project-ref <tu-ref>
     supabase secrets set ADMINS=<tu-user-id>
   La SUPABASE_SERVICE_ROLE_KEY y la SUPABASE_URL ya las pone Supabase sola. */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function responder(cuerpo: unknown, estado = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const url = Deno.env.get('SUPABASE_URL')!;
  const servicio = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  /* Uno o varios ids separados por comas. Sin esto no hay administradores y la
     función no deja hacer nada, que es lo que debe pasar si se despliega mal. */
  const admins = (Deno.env.get('ADMINS') || '')
    .split(',').map((x) => x.trim()).filter(Boolean);

  const supabase = createClient(url, servicio, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  /* ---------- quién llama ---------- */
  const cabecera = req.headers.get('Authorization') || '';
  const token = cabecera.replace(/^Bearer\s+/i, '').trim();
  if (!token) return responder({ error: 'Falta el token de sesión.' }, 401);

  const { data: quien, error: malToken } = await supabase.auth.getUser(token);
  if (malToken || !quien?.user) {
    return responder({ error: 'Sesión no válida.' }, 401);
  }
  const yo = quien.user;
  const soyAdmin = admins.includes(yo.id);

  let cuerpo: { accion?: string; email?: string; clave?: string; id?: string };
  try {
    cuerpo = await req.json();
  } catch {
    return responder({ error: 'Cuerpo ilegible.' }, 400);
  }
  const accion = String(cuerpo.accion || '');

  /* Lo único que puede preguntar cualquiera: si es administrador o no. Así la
     app sabe si enseñar la pantalla, pero el permiso de verdad se comprueba
     abajo en cada operación. */
  if (accion === 'soyAdmin') return responder({ admin: soyAdmin, id: yo.id });

  if (!soyAdmin) return responder({ error: 'No eres administrador.' }, 403);

  /* ---------- operaciones de administrador ---------- */

  if (accion === 'listar') {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
    if (error) return responder({ error: error.message }, 500);
    return responder({
      usuarios: data.users.map((u) => ({
        id: u.id,
        email: u.email,
        creado: u.created_at,
        ultimoAcceso: u.last_sign_in_at,
        confirmado: !!u.email_confirmed_at,
        /* banned_until viene en el futuro mientras está desactivado */
        activo: !u.banned_until || new Date(u.banned_until) <= new Date(),
        yo: u.id === yo.id
      }))
    });
  }

  if (accion === 'crear') {
    const email = String(cuerpo.email || '').trim().toLowerCase();
    const clave = String(cuerpo.clave || '');
    if (!email) return responder({ error: 'Falta el correo.' }, 400);
    if (clave.length < 8) {
      return responder({ error: 'La contraseña necesita 8 caracteres o más.' }, 400);
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: clave,
      email_confirm: true
    });
    if (error) return responder({ error: error.message }, 400);
    return responder({ id: data.user?.id, email: data.user?.email });
  }

  const id = String(cuerpo.id || '');
  if (!id) return responder({ error: 'Falta el usuario.' }, 400);
  /* Que nadie se cierre a sí mismo la puerta desde su propia pantalla */
  if (id === yo.id && accion !== 'listar') {
    return responder({ error: 'No puedes desactivarte ni borrarte a ti mismo.' }, 400);
  }

  if (accion === 'desactivar' || accion === 'activar') {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      /* cien años es «para siempre» sin tener que inventar otra tabla */
      ban_duration: accion === 'desactivar' ? '876000h' : 'none'
    });
    if (error) return responder({ error: error.message }, 500);
    return responder({ ok: true });
  }

  if (accion === 'borrar') {
    /* La fila de datos se va sola: estado.user_id lleva on delete cascade */
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) return responder({ error: error.message }, 500);
    return responder({ ok: true });
  }

  return responder({ error: 'Acción desconocida.' }, 400);
});
