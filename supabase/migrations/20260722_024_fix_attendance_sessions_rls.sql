-- =============================================================================
-- MIGRATION 024 — CORRECTION RLS ATTENDANCE SESSIONS & RECORDS
-- Permet aux professeurs et administrateurs d'insérer et gérer les sessions
-- et fiches de présence sans blocage RLS sur teacher_classes.
-- =============================================================================

-- 1. Réinitialiser les politiques RLS sur public.attendance_sessions
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "att_sessions: admin ALL" ON public.attendance_sessions;
DROP POLICY IF EXISTS "att_sessions: prof INSERT ses classes" ON public.attendance_sessions;
DROP POLICY IF EXISTS "att_sessions: prof SELECT et UPDATE ses sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "att_sessions: prof UPDATE ses sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "att_sessions: élève SELECT sa classe" ON public.attendance_sessions;
DROP POLICY IF EXISTS "att_sessions: prof et admin ALL" ON public.attendance_sessions;

-- Politique globale Admin & Prof pour attendance_sessions
CREATE POLICY "att_sessions: prof et admin ALL"
  ON public.attendance_sessions FOR ALL
  USING (
    public.is_admin() OR public.is_prof() OR auth.uid() = teacher_id
  )
  WITH CHECK (
    public.is_admin() OR public.is_prof() OR auth.uid() = teacher_id
  );

-- Politique de lecture pour les étudiants
CREATE POLICY "att_sessions: élève SELECT sa classe"
  ON public.attendance_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se
      WHERE se.student_id = auth.uid()
        AND se.class_id = attendance_sessions.class_id
    )
  );


-- 2. Réinitialiser les politiques RLS sur public.attendance_records
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "att_records: admin ALL" ON public.attendance_records;
DROP POLICY IF EXISTS "att_records: prof ALL ses sessions" ON public.attendance_records;
DROP POLICY IF EXISTS "att_records: élève SELECT propre" ON public.attendance_records;
DROP POLICY IF EXISTS "att_records: parent SELECT enfant" ON public.attendance_records;
DROP POLICY IF EXISTS "att_records: prof et admin ALL" ON public.attendance_records;

-- Politique globale Admin & Prof pour attendance_records
CREATE POLICY "att_records: prof et admin ALL"
  ON public.attendance_records FOR ALL
  USING (
    public.is_admin() OR public.is_prof()
  )
  WITH CHECK (
    public.is_admin() OR public.is_prof()
  );

-- Politique de lecture pour les étudiants
CREATE POLICY "att_records: élève SELECT propre"
  ON public.attendance_records FOR SELECT
  USING (auth.uid() = student_id);

-- Politique de lecture pour les parents
CREATE POLICY "att_records: parent SELECT enfant"
  ON public.attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = attendance_records.student_id
        AND p.parent_id = auth.uid()
    )
  );
