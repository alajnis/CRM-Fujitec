# Configuración de Supabase - CRM Fujitec

## Proyecto Supabase
- **URL:** https://ubbojwlsfiutsarwvsyd.supabase.co
- **Proyecto:** CRM Fujitec
- **Región:** ca-central-1

## Variables de Entorno

Copia el archivo `.env.example` a `.env.local` y rellena los valores:

```bash
cp .env.example .env.local
```

Luego actualiza con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://ubbojwlsfiutsarwvsyd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NUNCA** hagas commit de `.env.local` - está en `.gitignore`

## Estructura de Base de Datos

La base de datos contiene las siguientes tablas:

### 1. **users** - Usuarios del sistema
- Roles: admin, vendedor, supervisor, cliente
- 5 usuarios de prueba incluidos

### 2. **clientes** - Clientes/Empresas
- 15 clientes de prueba
- Contacto, ubicación, estado

### 3. **obras** - Proyectos
- 22 proyectos de ejemplo
- Estados: prospeccion, evaluacion, propuesta, negociacion, orden, ejecucion, cierre
- Presupuestos y fechas

### 4. **tipos_equipos** - Tipos de Equipos
- Ascensor, Escalera, Rampa

### 5. **equipos** - Equipos/Máquinas
- 25+ equipos de prueba
- Modelos, especificaciones, estado de instalación

### 6. **actividades** - Tareas y Actividades
- 7 actividades de ejemplo
- Estados: pendiente, en_proceso, completada

### 7. **stage_log** - Historial de Cambios de Etapa
- 4 registros de ejemplo
- Tracking de cambios en proyectos

### 8. **annual_plans** - Planes Anuales
- 6 planes anuales de prueba
- Objetivos de ventas, obras, equipos

### 9. **notas** - Notas y Comentarios
- 3 notas de ejemplo
- Públicas e internas

### 10. **system_log** - Registro de Auditoría
- Tracking de cambios en el sistema

### 11. **asignaciones_equipo** - Asignaciones de Equipos
- Relación entre equipos y obras

## Servicios Disponibles

En `src/services/` tienes acceso a estos servicios:

```typescript
import { 
  obrasService, 
  clientesService, 
  equiposService, 
  actividadesService, 
  usersService 
} from '@/services';

// Ejemplo de uso:
const obras = await obrasService.getObras();
const obra = await obrasService.getObraById(id);
await obrasService.createObra({...});
await obrasService.softDeleteObra(id); // Soft delete
```

## Tipos TypeScript

Todos los tipos están definidos en `src/types/supabase.ts`:

```typescript
import { Obra, Cliente, Equipo, Actividad, User } from '@/types/supabase';
```

## Pruebas de Conexión

Para verificar que Supabase está conectado correctamente:

```typescript
import { testSupabaseConnection } from '@/utils/testSupabase';

await testSupabaseConnection();
// Imprime logs en la consola confirmando conexión
```

## Datos de Prueba

### Usuarios Disponibles:
- **admin@fujitec.com** - Admin
- **vendedor1@fujitec.com** - Vendedor Senior
- **vendedor2@fujitec.com** - Vendedor
- **supervisor@fujitec.com** - Supervisor
- **cliente@fujitec.com** - Cliente

### Clientes de Prueba:
- Edificios Torres S.L.
- Constructora Ibérica
- Proyectos Residenciales S.A.
- Y 12 más...

## Funcionalidades de Soft Delete

Todas las tablas principales (obras, clientes, equipos, actividades) incluyen un campo `deleted_at`. Cuando haces "delete", el registro se marca como borrado pero no se elimina realmente:

```typescript
// Esto NO elimina, solo marca como borrado
await obrasService.softDeleteObra(id);

// Las queries ignoran registros borrados:
const obras = await obrasService.getObras(); 
// Solo retorna registros donde deleted_at IS NULL
```

## Próximos Pasos

1. ✅ Base de datos creada en Supabase
2. ✅ Servicios implementados
3. ⏳ Integrar servicios en componentes React
4. ⏳ Crear pantallas de CRUD
5. ⏳ Implementar autenticación Supabase

## Soporte

Para más información sobre Supabase:
- Documentación: https://supabase.com/docs
- Dashboard: https://supabase.com/dashboard
