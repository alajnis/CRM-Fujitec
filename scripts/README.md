# Scripts de base de datos

Ejecutar en el **SQL Editor de Supabase**, en este orden.

## Orden de ejecución

| # | Script | Qué hace |
|---|--------|----------|
| 1 | `03-crear-tabla-users.sql` | Crea `public.users` y los usuarios base. **Necesario para que funcione el login.** |
| 2 | `fix-schema-completo.sql` | Columnas faltantes en clientes/obras/equipos, RLS e índices. |
| 3 | `04-fix-constraints.sql` | Afloja los NOT NULL que bloquean los inserts (equipos sin obra, etc.). |

Los tres son idempotentes: se pueden correr más de una vez sin romper nada.

Al final de `04` hay dos queries de verificación. La segunda lista las columnas
`NOT NULL` sin default que quedan: **todo lo que aparezca ahí la app tiene que
mandarlo sí o sí en cada insert**. Si aparece algo inesperado, hay que agregarlo
al adapter en `src/adapters/supabaseAdapter.ts`.

## Credenciales base

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `superadmin@fujitec.com` | `admin123` | Superadmin |
| `vendedor@fujitec.com` | `vendedor123` | Comercial |

El admin las puede cambiar desde **Configuración → Gestión de Usuarios**.

## Notas

`public.users` es la tabla propia de la app y **no** es `auth.users`, la tabla
interna de Supabase Auth. La app no usa Supabase Auth: valida las credenciales
contra esta tabla, para que el admin pueda ver y cambiar las contraseñas.

Las contraseñas se guardan en texto plano porque el requisito es que el admin
las vea en todo momento. Es aceptable para un MVP interno; si la app pasa a
manejar datos reales de clientes, conviene revisar esta decisión.

## Scripts viejos

`add-*.sql` y `complete-supabase-setup.sql` son migraciones anteriores, ya
contenidas en `fix-schema-completo.sql`. Se conservan como referencia.
