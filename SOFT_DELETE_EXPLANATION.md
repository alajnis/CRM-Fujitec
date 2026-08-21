# Borrado Lógico (Soft Delete) en Fujitec CRM

## ¿Cómo funciona?

Cuando eliminas un cliente, obra, equipo o actividad, **no se borra realmente de la base de datos**. En su lugar, se marca con un timestamp en la columna `deleted_at`:

- Cliente borrado → `deleted_at = 2026-08-21 14:30:00`
- Cliente activo → `deleted_at = NULL`

Este método se llama **soft delete** (borrado lógico) y es mejor que borrar porque:
1. **Los datos nunca se pierden** - Puedes recuperarlos más adelante si cambias de idea
2. **Auditoría** - Queda registro de cuándo se eliminó algo
3. **Integridad referencial** - Las obras/equipos vinculados a clientes no quedan huérfanas

## ¿Por qué no veo la opción de recuperar?

La interfaz actual no tiene una pantalla de "papelera" o "registros eliminados" para recuperar clientes borrados.

Esto es intencional porque:
- La mayoría del tiempo un borrado es definitivo
- Evita complejidad innecesaria en la UI
- El recupero es manual pero posible (ver abajo)

## ¿Cómo recuperar un cliente que borraste?

Tienes dos opciones:

### Opción 1: A través de SQL en Supabase (Recomendado)
1. Abre el SQL Editor en Supabase (en tu proyecto)
2. Ejecuta:
```sql
UPDATE public.clientes
SET deleted_at = NULL
WHERE email = 'cliente@ejemplo.com'  -- o usa el ID del cliente
RETURNING *;
```

El cliente volverá a aparecer en la lista inmediatamente.

### Opción 2: Agregar una UI de administración

Si quieres que haya una pantalla donde se puedan ver y recuperar registros borrados, hay que:

1. Crear un componente `PantallaRecuperacion` que muestre solo los registros con `deleted_at != NULL`
2. Agregar botón "Recuperar" que haga `deleted_at = NULL`
3. Agregar también botón "Eliminar permanentemente" que sí borre de la base (con confirmación)

Esto sería útil si los borrados son frecuentes, pero requiere desarrollo.

## Registros borrados en cada tabla

Los soft delete aplican a:
- **Clientes** - `clientes.deleted_at`
- **Obras** - `obras.deleted_at`
- **Equipos** - `equipos.deleted_at`
- **Actividades** - `actividades.deleted_at`

Todos usan la misma lógica: marcar con timestamp en lugar de borrar.

## Cambios futuros posibles

Si después necesitas una UI para recuperar registros, la funcionalidad backend ya está lista. Solo falta:
- Crear pantalla de administración con filtro para mostrar borrados
- Botones de "Recuperar" y "Eliminar permanentemente"
- Auditoría de quién y cuándo borró algo
