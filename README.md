# PatientVoice - Sistema de Reportes Médicos con IA

Una aplicación web moderna para la generación de reportes médicos asistidos por inteligencia artificial, con análisis automático de complejidad del paciente.

## 🚀 Características

- **Autenticación completa** con Supabase
- **Sistema de roles** (Paciente/Doctor/Admin) con permisos específicos
- **Creación de reportes médicos** solo por doctores
- **Análisis médico inteligente** con IA avanzada
- **Análisis automático de complejidad** del paciente
- **Panel de administración** para gestión de reportes
- **Interfaz moderna** con diseño responsive
- **Campos de paciente**: nombre, cédula, teléfono, email y foto
- **Edición y eliminación** de reportes por roles autorizados
- **Vista de historial clínico** para pacientes

## 🏗️ Arquitectura

- **Frontend**: React 19 + Vite
- **Backend**: Supabase (Auth + Database)
- **Styling**: CSS moderno con variables y componentes
- **AI Service**: Integración con API de IA externa

## 📋 Análisis de Complejidad

La aplicación incluye un sistema inteligente de análisis de complejidad que evalúa automáticamente cada reporte médico basado en:

### Niveles de Complejidad:
- **🔴 Alta**: Requiere atención médica inmediata (urgencias, emergencias, condiciones críticas)
- **🟡 Media**: Requiere evaluación médica en 24-48 horas (infecciones, dolores moderados)
- **🟢 Baja**: Puede manejarse con atención primaria (síntomas leves, preventivos)

### Factores Analizados:
- Palabras clave médicas específicas
- Combinación de síntomas múltiples
- Condiciones crónicas mencionadas
- Longitud y detalle de la descripción
- Patrones de urgencia médica
## 🏠 Página de Inicio

La aplicación incluye una página de inicio dedicada (`/home`) accesible desde el logo y el botón "Inicio" en la barra de navegación. Esta página proporciona:

### Para Doctores y Administradores:
- **Guía completa** de uso de la plataforma médica
- **Instrucciones detalladas** para crear y gestionar reportes
- **Información sobre análisis de complejidad** automática
- **Consejos de mejores prácticas** médicas

### Para Pacientes:
- **Explicación clara** de cómo acceder a sus reportes médicos
- **Información sobre privacidad** y seguridad de datos
- **Guía de comunicación** con el equipo médico
- **Consejos de uso** de la plataforma

### Características de la Página:
- **Contenido adaptativo** según el rol del usuario
- **Interfaz intuitiva** con tarjetas informativas
- **Información de contacto** y soporte técnico
- **Recordatorios importantes** sobre atención médica
## � Sistema de Roles y Permisos

### Paciente
- **Puede ver**: Sus propios informes médicos creados por doctores
- **No puede**: Crear informes, editar o eliminar reportes
- **Acceso**: Dashboard con historial clínico personal

### Doctor
- **Puede ver**: Todos los informes de pacientes asignados
- **Puede crear**: Nuevos informes médicos con análisis IA
- **Puede editar**: Informes que creó
- **Puede eliminar**: Informes que creó
- **Acceso**: Dashboard completo, creación de reportes, vista de pacientes

### Admin
- **Puede ver**: Todos los informes del sistema
- **Puede crear**: Nuevos informes médicos
- **Puede editar**: Todos los informes
- **Puede eliminar**: Todos los informes
- **Acceso**: Dashboard completo, panel de administración

## 🧠 Análisis Médico con IA

La aplicación incluye un sistema de IA avanzado que genera análisis médicos profesionales:

### Características del Análisis:
- **Evaluación clínica estructurada** con síntomas identificados
- **Análisis de complejidad** automática (bajo/medio/alto)
- **Impresión diagnóstica preliminar** basada en síntomas
- **Recomendaciones terapéuticas** específicas por nivel de complejidad
- **Notas de seguimiento** y signos de alarma

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd patientvoice
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Configurar la base de datos Supabase

#### Crear tablas necesarias:
```sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Tabla de reportes
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  ai_output TEXT NOT NULL,
  complexity_level TEXT,
  complexity_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para reports
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own reports" ON reports FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Admins can view all reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);
CREATE POLICY "Admins can update reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);
CREATE POLICY "Admins can delete reports" ON reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);
CREATE POLICY "Doctors can view all reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);
CREATE POLICY "Doctors can update reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);
CREATE POLICY "Doctors can delete reports" ON reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);
CREATE POLICY "Doctors can view all reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);
CREATE POLICY "Doctors can delete reports" ON reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);
```

#### Ejecutar migración de complejidad:
Ejecuta el archivo `supabase_migration_complexity.sql` en el SQL Editor de Supabase para agregar las columnas de complejidad.

### 5. Ejecutar la aplicación
```bash
npm run dev
```

## 🎯 Uso de la Aplicación

### Para Usuarios:
1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Crear Reporte**: Describe los síntomas del paciente
3. **Análisis Automático**: La IA analiza la complejidad automáticamente
4. **Revisar Reportes**: Visualiza todos tus reportes en el dashboard

### Para Administradores:
1. **Panel Admin**: Acceso completo a todos los reportes
2. **Estadísticas**: Visualiza estadísticas de complejidad
3. **Filtros**: Filtra reportes por nivel de complejidad
4. **Gestión**: Elimina reportes cuando sea necesario

## 🔧 Desarrollo

### Scripts disponibles:
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Vista previa de la build
- `npm run lint` - Ejecuta ESLint

### Estructura del proyecto:
```
src/
├── components/          # Componentes reutilizables
├── context/            # Contextos de React (Auth)
├── pages/              # Páginas principales
├── services/           # Servicios (Supabase, AI)
└── index.css           # Estilos globales
```

## 🤖 Servicio de IA

El servicio de IA incluye:
- Generación de reportes médicos profesionales
- Análisis de complejidad automática
- Fallback local en caso de error de API
- Validación de respuestas

## 📊 Dashboard y Estadísticas

- **Dashboard Usuario**: Reportes personales con indicadores de complejidad
- **Panel Admin**: Vista global con estadísticas y filtros
- **Visualización**: Colores e iconos intuitivos para cada nivel de complejidad

## 🔒 Seguridad

- Autenticación segura con Supabase
- Row Level Security (RLS) en base de datos
- Validación de inputs del usuario
- Manejo seguro de errores

## 📱 Responsive Design

La aplicación está optimizada para:
- Desktop
- Tablet
- Mobile
- Diferentes tamaños de pantalla

## 🚀 Despliegue

Para desplegar en producción:
1. Configurar variables de entorno en el hosting
2. Ejecutar `npm run build`
3. Desplegar los archivos generados

## 📝 Licencia

Este proyecto es privado y confidencial.
