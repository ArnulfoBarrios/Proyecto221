-- Agregar columnas de complejidad y datos del paciente a la tabla reports
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS complexity_level TEXT,
ADD COLUMN IF NOT EXISTS complexity_score INTEGER,
ADD COLUMN IF NOT EXISTS patient_name TEXT,
ADD COLUMN IF NOT EXISTS patient_id_number TEXT,
ADD COLUMN IF NOT EXISTS patient_phone TEXT,
ADD COLUMN IF NOT EXISTS patient_email TEXT,
ADD COLUMN IF NOT EXISTS patient_photo_url TEXT;

-- Crear índices para búsquedas por complejidad y paciente
CREATE INDEX IF NOT EXISTS idx_reports_complexity_level ON reports(complexity_level);
CREATE INDEX IF NOT EXISTS idx_reports_complexity_score ON reports(complexity_score);
CREATE INDEX IF NOT EXISTS idx_reports_patient_email ON reports(patient_email);

-- Comentarios para documentación
COMMENT ON COLUMN reports.complexity_level IS 'Nivel de complejidad del paciente: bajo, medio, alto';
COMMENT ON COLUMN reports.complexity_score IS 'Puntuación numérica de complejidad (0-100)';
COMMENT ON COLUMN reports.patient_name IS 'Nombre completo del paciente asignado al reporte';
COMMENT ON COLUMN reports.patient_id_number IS 'Número de cédula o identificación del paciente';
COMMENT ON COLUMN reports.patient_phone IS 'Teléfono de contacto del paciente';
COMMENT ON COLUMN reports.patient_email IS 'Correo electrónico del paciente asignado al reporte';
COMMENT ON COLUMN reports.patient_photo_url IS 'URL de la foto del paciente asignado al reporte';

-- Políticas RLS corregidas para evitar re-evaluación por fila y habilitar eliminación segura
-- Crear la tabla profiles primero si aún no existe
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si ya existen para evitar conflictos
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
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

-- Crear políticas actualizadas
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own reports" ON reports FOR DELETE USING ((select auth.uid()) = user_id);

CREATE POLICY "Patients can view assigned reports" ON reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
      AND role = 'patient'
      AND email = patient_email
  )
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
CREATE POLICY "Doctors can view all reports" ON reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);
CREATE POLICY "Doctors can update reports" ON reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);
CREATE POLICY "Doctors can delete reports" ON reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'doctor')
);
