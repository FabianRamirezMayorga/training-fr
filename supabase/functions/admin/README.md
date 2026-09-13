# La función `admin`

Lo único de Training FR que no vive en el navegador, y hay un motivo: crear
cuentas ajenas, desactivarlas o borrarlas son operaciones de administrador, y
Supabase solo las permite con la **service_role key**, que se salta las
políticas RLS por completo.

Esa clave no puede estar en la app. Training FR es HTML servido en abierto:
cualquiera que mire el código fuente la leería y tendría acceso total a los datos
de todos, los suyos y los de los demás. Por eso vive aquí, como secreto del
servidor, y el navegador nunca la ve.

## Cómo decide quién manda

Quien llama manda su token de sesión. La función se lo da a Supabase, pregunta
de quién es, y solo continúa si ese id está en el secreto `ADMINS`. La pantalla
de la app no decide nada: si alguien la salta y llama a la función a mano sin ser
administrador, se encuentra un 403 igual.

## Desplegarla

Hace falta la [CLI de Supabase](https://supabase.com/docs/guides/cli) una vez:

```bash
npm install -g supabase
supabase login
```

Y luego, desde la raíz del proyecto:

```bash
supabase functions deploy admin --project-ref jeigxeunjofhfxbcfazp
supabase secrets set ADMINS=9d50d288-f6ae-4ca6-826a-8c60f26da6f6 --project-ref jeigxeunjofhfxbcfazp
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` las pone Supabase sola en el entorno
de la función; no hay que tocarlas.

También se puede pegar el contenido de `index.ts` en el panel de Supabase, en
Edge Functions → Deploy a new function, y poner el secreto en Project Settings →
Edge Functions → Secrets.

## Comprobar que está

```bash
curl -i -X POST https://jeigxeunjofhfxbcfazp.supabase.co/functions/v1/admin \
  -H "Content-Type: application/json" -d '{"accion":"soyAdmin"}'
```

Sin token tiene que contestar **401**. Si contesta 404, no está desplegada.

Dentro de la app, la entrada «Cuentas» aparece sola en Perfil cuando la función
confirma que esa cuenta administra. Mientras no esté desplegada, la entrada no
sale y no se rompe nada.

## Qué hace

| Acción | Quién | Qué |
|---|---|---|
| `soyAdmin` | cualquiera con sesión | dice si administra o no |
| `listar` | administrador | las cuentas, con su alta, su última entrada y si están activas |
| `crear` | administrador | cuenta nueva con correo y contraseña, ya confirmada |
| `desactivar` / `activar` | administrador | impide o devuelve el acceso sin tocar los datos |
| `borrar` | administrador | se lleva la cuenta y, por el `on delete cascade` de `estado`, sus datos |

Nadie puede desactivarse ni borrarse a sí mismo: es la forma más fácil de
quedarse fuera de tu propio proyecto.
