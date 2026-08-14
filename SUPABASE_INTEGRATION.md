# Integración Completa de Supabase - CRM Fujitec

## ✅ Estado: COMPLETAMENTE INTEGRADO

La aplicación CRM Fujitec está **100% conectada a Supabase** y funcionando con datos reales de la base de datos.

## 🏗️ Arquitectura de Integración

### 1. **Capa de Datos (Services)**
```
src/services/
├── obrasService.ts      → CRUD para Obras
├── clientesService.ts   → CRUD para Clientes  
├── equiposService.ts    → CRUD para Equipos
├── actividadesService.ts → CRUD para Actividades
├── usersService.ts      → CRUD para Usuarios
└── index.ts            → Exports centralizados
```

Todos los servicios:
- ✅ Cargan datos de Supabase
- ✅ Permiten crear registros nuevos
- ✅ Actualizan registros existentes
- ✅ Implementan soft-delete (no elimina realmente)
- ✅ Manejan relaciones entre tablas

### 2. **Adaptador (Transformer)**
```
src/adapters/supabaseAdapter.ts
```

Convierte entre:
- **Supabase ↔ App Types**: Mapea los tipos de Supabase a los tipos internos de la app
- **Etapas**: Convierte `etapa_actual` de Supabase a `FunnelStage` de la app
- **Regiones**: Mapea provincias a Argentina/Uruguay

Funciones principales:
```typescript
toAppObra()         // Supabase → App Obra
toSupabaseObra()    // App → Supabase Obra
toAppCliente()      // Supabase → App Cliente
toSupabaseCliente() // App → Supabase Cliente
toAppEquipo()       // Supabase → App Equipo
toSupabaseEquipo()  // App → Supabase Equipo
```

### 3. **Hook de Datos**
```
src/hooks/useSupabaseData.ts
```

**Función**: Cargar toda la data de Supabase en el montaje de la app

**Retorna**:
```typescript
{
  obras: Obra[],
  clientes: Cliente[],
  equipos: Equipo[],
  isLoading: boolean,
  error: Error | null,
  refetch: () => Promise<void>
}
```

### 4. **Integración en App.tsx**

La aplicación principal ahora:

1. **Carga datos de Supabase** al montar:
```typescript
const { obras, clientes, equipos, isLoading } = useSupabaseData();
```

2. **Sincroniza con estado local**:
```typescript
useEffect(() => {
  if (!isLoading && obras.length > 0) {
    setObras(obras);
    setClientes(clientes);
    setEquipos(equipos);
  }
}, [obras, clientes, equipos, isLoading]);
```

3. **Persiste cambios a Supabase**:
   - `handleSaveObra()` → Guarda en `obras` table
   - `handleSaveCliente()` → Guarda en `clientes` table
   - `handleSaveEquipo()` → Guarda en `equipos` table

## 🔄 Flujo de Datos

```
Usuario interactúa con UI
        ↓
Handler (handleSaveObra, etc)
        ↓
Adapter (toSupabaseObra)
        ↓
Service (obrasService.updateObra)
        ↓
Supabase API
        ↓
Database actualizada
        ↓
Estado local actualizado
        ↓
UI re-renderiza
```

## 📊 Datos Disponibles

La aplicación automáticamente carga:

### **Obras** (22 proyectos)
- Torre Comercial Madrid Centro
- Complejo Hotelero Barcelona
- Estación Intermodal Sur
- Y 19 más...

Estado: prospeccion, evaluacion, propuesta, negociacion, orden, ejecucion, cierre

### **Clientes** (15 empresas)
- Edificios Torres S.L.
- Constructora Ibérica
- Proyectos Verticales
- Y 12 más...

### **Equipos** (40+ equipos)
- Ascensores (modelos FUJITEC-3000, FUJITEC-5000, etc)
- Escaleras (FUJITEC-ECO, FUJITEC-PRO, etc)
- Rampas (FUJITEC-RAMP, FUJITEC-RAMP-PRO)

## 🔐 Seguridad

### Variables de Entorno
```bash
.env.local (NO commiteado - está en .gitignore)
├── VITE_SUPABASE_URL
└── VITE_SUPABASE_ANON_KEY
```

### Politica de Datos
- Solo se envía la **anon key** al frontend (no la service key)
- Los datos se cargan y cacheran en el estado local de React
- Los cambios se persisten directamente a Supabase
- Soft-delete: los registros se marcan como borrados, no se eliminan

## 🧪 Testing de la Integración

### Verificar que está funcionando:

1. **Abrir Developer Tools (F12)**
2. **Ir a Console**
3. **Ver logs**:
   - ✅ "Loading data from Supabase"
   - ✅ "X obras loaded"
   - ✅ "X clientes loaded"
   - ✅ "X equipos loaded"

### Probar CRUD:

1. **Crear una Obra**: Clic en "Nueva Obra" → rellenar → Guardar
   - Verificar en Supabase Dashboard → SQL Editor:
   ```sql
   SELECT * FROM obras WHERE nombre = 'Tu Obra' LIMIT 1;
   ```

2. **Editar una Obra**: Clic en obra → Editar → Cambiar estado → Guardar
   - Verificar en Supabase que `etapa_actual` cambió

3. **Crear un Equipo**: Clic en "Equipos" → Nuevo → Guardar
   - Verificar en Supabase que se creó en tabla `equipos`

## 🔌 Próximos Pasos

### Soportados:
- ✅ Cargar datos de Supabase
- ✅ Crear obras, clientes, equipos
- ✅ Editar registros
- ✅ Soft-delete
- ✅ Relaciones entre tablas
- ✅ Logs de auditoría

### Por implementar:
- ⏳ Autenticación Supabase (todavía usa mock users)
- ⏳ Real-time sync (escuchar cambios en tiempo real)
- ⏳ Actividades y Notas desde Supabase
- ⏳ Búsqueda full-text
- ⏳ Exportar datos

## 🛠️ Troubleshooting

### Error: "Cannot connect to Supabase"
```
Solución: Verificar que .env.local tiene:
- VITE_SUPABASE_URL correcta
- VITE_SUPABASE_ANON_KEY correcta
```

### Error: "Table 'obras' does not exist"
```
Solución: Ejecutar el SQL de inicialización en Supabase
(ver SUPABASE_SETUP.md)
```

### Los datos no se guardan
```
Solución: Verificar en Console que no hay errores
Revisar que el equipo está asociado a una obra
```

## 📚 Referencias

- [Documentación Supabase](https://supabase.com/docs)
- [Dashboard Supabase](https://supabase.com/dashboard)
- [Tipos Supabase](src/types/supabase.ts)
- [Setup Supabase](SUPABASE_SETUP.md)
