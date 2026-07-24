-- ============================================================================
-- FICHIER  : 015 / 15 — TABLE: parent_students (Liaison Multi-enfants pour les parents)
-- EXÉCUTER : dans le SQL Editor de Supabase
-- DESCRIPTION :
--   Permet d'associer PLUSIEURS enfants à UN SEUL parent (relation N:N).
--   Crée une table de liaison parent_students et met à jour les politiques RLS.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.parent_students (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID         NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  student_id  UUID         NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id ON public.parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student_id ON public.parent_students(student_id);

ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

-- Politiques RLS sur parent_students
DROP POLICY IF EXISTS "parent_students: admin ALL" ON public.parent_students;
CREATE POLICY "parent_students: admin ALL"
  ON public.parent_students FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "parent_students: parent SELECT" ON public.parent_students;
CREATE POLICY "parent_students: parent SELECT"
  ON public.parent_students FOR SELECT
  USING (parent_id = auth.uid() OR student_id = auth.uid());

-- Mettre à jour les politiques de grades et attendance pour supporter parent_students
DROP POLICY IF EXISTS "grades: parent SELECT enfant" ON public.grades;
CREATE POLICY "grades: parent SELECT enfant"
  ON public.grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = grades.student_id AND p.parent_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.student_id = grades.student_id AND ps.parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "att_records: parent SELECT enfant" ON public.attendance_records;
CREATE POLICY "att_records: parent SELECT enfant"
  ON public.attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = attendance_records.student_id AND p.parent_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.student_id = attendance_records.student_id AND ps.parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "payments: parent SELECT enfant" ON public.student_payments;
CREATE POLICY "payments: parent SELECT enfant"
  ON public.student_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = student_payments.student_id AND p.parent_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.student_id = student_payments.student_id AND ps.parent_id = auth.uid()
    )
  );
