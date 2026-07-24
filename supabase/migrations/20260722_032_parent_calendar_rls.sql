-- =============================================================================
-- MIGRATION 032 — POLITIQUES RLS CALENDRIER POUR LES PARENTS
-- Permet aux parents de consulter les cours et les séances de cours des classes
-- dans lesquelles leurs enfants sont inscrits.
-- =============================================================================

-- ── 1. RLS sur courses ────────────────────────────────────────────────────────
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses: parent SELECT" ON public.courses;
CREATE POLICY "courses: parent SELECT"
  ON public.courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se
      WHERE se.class_id = courses.class_id
        AND (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = se.student_id AND p.parent_id = auth.uid()
          )
          OR
          EXISTS (
            SELECT 1 FROM public.parent_students ps
            WHERE ps.student_id = se.student_id AND ps.parent_id = auth.uid()
          )
        )
    )
  );

-- ── 2. RLS sur course_sessions ────────────────────────────────────────────────
ALTER TABLE public.course_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions: parent SELECT" ON public.course_sessions;
CREATE POLICY "sessions: parent SELECT"
  ON public.course_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.student_enrollments se ON se.class_id = c.class_id
      WHERE c.id = course_sessions.course_id
        AND (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = se.student_id AND p.parent_id = auth.uid()
          )
          OR
          EXISTS (
            SELECT 1 FROM public.parent_students ps
            WHERE ps.student_id = se.student_id AND ps.parent_id = auth.uid()
          )
        )
    )
  );
