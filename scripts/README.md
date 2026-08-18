# Scripts de base de datos

## ⚠️ Verificá el proyecto antes de ejecutar

Todo el SQL va en **un solo** proyecto de Supabase:

```
ubbojwlsfiutsarwvsyd
https://ubbojwlsfiutsarwvsyd.supabase.co
```

Es el mismo que usa la app (`VITE_SUPABASE_URL` en `.env.local` y en las
variables de entorno de Vercel).

Correr el SQL en otro proyecto es silencioso: el script termina sin errores,
pero la app no ve ninguno de los cambios. Si algo "se aplicó" y la app sigue
fallando igual, lo primero a descartar es esto.

**Cómo confirmarlo:** la URL del navegador, con el SQL Editor abierto, tiene que
contener `ubbojwlsfiutsarwvsyd`. El PASO 0 del script también lo verifica
contando registros.

## Ejecución

Un único script: **`SETUP-COMPLETO.sql`**.

1. Abrí el SQL Editor en el proyecto correcto
2. Ejecutá primero el PASO 0 (verificación) — debe decir `✅ PROYECTO CORRECTO`
3. Ejecutá el resto del archivo
4. Revisá el PASO 6: las tres consultas de verificación tienen que dar OK

Es idempotente: se puede correr más de una vez sin romper nada.

## Qué hace

| Paso | Contenido |
|------|-----------|
| 0 | Verifica que sea el proyecto correcto |
| 1 | Crea `public.users` y los usuarios base (**login**) |
| 2 | Columnas faltantes: contactos, cuit_rut, codigo, historial_log |
| 3 | Afloja los NOT NULL que bloquean los inserts |
| 4 | Policies de RLS |
| 5 | Índices |
| 6 | Verificación final |

## Credenciales

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `superadmin@fujitec.com` | `admin123` | Superadmin |
| `vendedor@fujitec.com` | `vendedor123` | Comercial |

El admin las cambia desde **Configuración → Gestión de Usuarios**.

## Notas

`public.users` es la tabla propia de la app y **no** es `auth.users`, la tabla
interna de Supabase Auth. La app no usa Supabase Auth: valida contra esta tabla
para que el admin pueda ver y cambiar las contraseñas.

Las contraseñas se guardan en texto plano porque el requisito es que el admin
las vea en todo momento. Aceptable para un MVP interno; conviene revisarlo si la
app pasa a manejar datos reales de clientes.
