# Instrucciones para Ejecutar la Migración en Supabase

## Problema
Las cuentas se crean en `Authentication - Users` de Supabase pero NO en la tabla `profiles`. Esto impide que el sistema funcione correctamente.

## Solución
Ejecutar la migración SQL que crea un **trigger automático** que inserta en `profiles` cuando se registra un usuario.

---

## Pasos para Ejecutar la Migración

### 1. Acceder a Supabase SQL Editor
- Ve a [https://app.supabase.com](https://app.supabase.com)
- Selecciona tu proyecto
- En el menú izquierdo, ve a **SQL Editor**
- Haz clic en **New Query**

### 2. Copiar y Ejecutar el SQL

Copia TODO el contenido del archivo `supabase_migration_cedula.sql` y pégalo en el editor SQL de Supabase.

El archivo contiene:
- Actualización de tabla `profiles` con campos `full_name` y `cedula`
- Índices para búsquedas eficientes
- **Trigger automático** que crea el perfil cuando se registra un usuario
- Políticas RLS actualizadas

### 3. Ejecutar la Query
- Haz clic en **Run** (botón azul) o presiona `Ctrl+Enter`
- Espera a que se complete (debería mostrar "Success")

### 4. Verificar que Funcionó

#### Opción A: Via Supabase Dashboard
1. Ve a **Database - Tables**
2. Abre la tabla `profiles`
3. Verifica que tenga las columnas:
   - `id` (UUID)
   - `email` (TEXT)
   - `full_name` (TEXT)
   - `cedula` (TEXT, UNIQUE)
   - `role` (TEXT)
   - `created_at` (TIMESTAMP)

#### Opción B: Prueba de Registro
1. Abre la aplicación en `http://localhost:5173/register`
2. Registra un nuevo usuario con:
   - Nombre completo
   - Cédula
   - Email
   - Contraseña
   - Tipo de cuenta (Paciente o Doctor)
3. Verifica en Supabase:
   - **Authentication - Users**: Debe aparecer el nuevo usuario
   - **Database - Tables - profiles**: Debe aparecer un registro nuevo con los datos

---

## Si Tienes Errores

### Error: "Relation 'profiles' does not exist"
- Ejecuta primero la migración anterior (`supabase_migration_complexity.sql`)
- Luego ejecuta esta migración

### Error: "Column 'cedula' already exists"
- Eso es normal, significa que ya ejecutaste la migración
- La parte importante es que exista el trigger

### Error: "Function 'handle_new_user' already exists"
- Normal, simplemente reemplaza la función anterior
- El `CREATE OR REPLACE` maneja esto automáticamente

### El trigger no crea el perfil
1. Verifica que el trigger esté creado:
   - En Supabase, ve a **SQL Editor**
   - Ejecuta: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
   - Debe devolver un resultado

2. Verifica las políticas RLS:
   - Ve a **Database - Policies**
   - Busca `Patients can view assigned reports by cedula`
   - Verifica que exista y esté activa

---

## Flujo Después de la Migración

```
1. Usuario se registra (Register.jsx)
   ↓
2. Supabase crea entrada en auth.users
   ↓
3. TRIGGER automático crea entrada en profiles
   ↓
4. Usuario puede iniciar sesión
   ↓
5. AuthContext carga el perfil con cedula
   ↓
6. Dashboard filtra reportes por cedula
   ↓
7. ¡Todo funciona! ✅
```

---

## Comandos SQL Útiles para Diagnóstico

### Ver todos los usuarios registrados
```sql
SELECT id, email FROM auth.users;
```

### Ver todos los perfiles creados
```sql
SELECT id, email, full_name, cedula, role FROM public.profiles;
```

### Ver si el trigger existe
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Ver las políticas RLS en reports
```sql
SELECT * FROM pg_policies WHERE tablename = 'reports';
```

---

## Soporte

Si la migración no funciona:
1. Verifica que hayas copiado TODO el contenido de `supabase_migration_cedula.sql`
2. Asegúrate de que no haya errores de sintaxis
3. Revisa los logs en Supabase > Settings > Logs

Para más ayuda, consulta la documentación de Supabase: https://supabase.com/docs
