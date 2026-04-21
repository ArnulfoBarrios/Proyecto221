-- Migración para vincular reportes por cédula en lugar de email
-- Actualizar tabla profiles con campos de nombre y cédula
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS cedula TEXT UNIQUE;

-- Crear índice único en cédula para garantizar que no se repita
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_cedula ON profiles(cedula) WHERE cedula IS NOT NULL;

-- Agregar columna de cédula del paciente en reports para facilitar búsquedas
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS patient_cedula TEXT;

-- Crear índice en patient_cedula para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_reports_patient_cedula ON reports(patient_cedula);

-- Comentarios para documentación
COMMENT ON COLUMN profiles.full_name IS 'Nombre completo del usuario';
COMMENT ON COLUMN profiles.cedula IS 'Número de cédula único del paciente';
COMMENT ON COLUMN reports.patient_cedula IS 'Cédula del paciente para vincular reportes';

-- ELIMINAR TODAS LAS POLÍTICAS ANTIGUAS RELACIONADAS CON REPORTS
DROP POLICY IF EXISTS "Patients can view assigned reports" ON reports;
DROP POLICY IF EXISTS "Patients can view assigned reports by cedula" ON reports;
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;
DROP POLICY IF EXISTS "Doctors can view all reports" ON reports;
DROP POLICY IF EXISTS "Doctors can update reports" ON reports;
DROP POLICY IF EXISTS "Doctors can delete reports" ON reports;

-- CREAR NUEVA POLÍTICA PARA PACIENTES POR CÉDULA
CREATE POLICY "Patients can view assigned reports by cedula" ON reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
      AND role = 'patient'
      AND cedula = patient_cedula
  )
);

-- CREAR POLÍTICAS PARA DOCTORES Y ADMINS
CREATE POLICY "Doctors can view all reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);

CREATE POLICY "Doctors can update reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);

CREATE POLICY "Doctors can delete reports" ON reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);

CREATE POLICY "Doctors can insert reports" ON reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);

CREATE POLICY "Admins can view all reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);

CREATE POLICY "Admins can update reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);

CREATE POLICY "Admins can delete reports" ON reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);

-- Trigger para crear automáticamente un profile cuando se registra un usuario
-- Primero, eliminar el trigger antiguo si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Primero, crear la función que será llamada por el trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    cedula,
    role,
    created_at
  ) VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'cedula',
    new.raw_user_meta_data->>'role',
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear el trigger que se ejecuta después de insertar un usuario en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Asegurar que las políticas RLS en profiles permitan que los usuarios vean su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Nota: No crear política INSERT porque el trigger lo hace automáticamente con permisos elevados
