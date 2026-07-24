-- ============================================================================
-- FICHIER  : 009 / 14 — TABLE: grades  (notes des élèves)
-- EXÉCUTER : en 9ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 002 (profiles), fichier 007 (courses)
-- DESCRIPTION :
--   Stocke les notes attribuées aux élèves par les professeurs.
--   Une note (grade) lie :
--     • Un élève (student_id via profiles.user_id)
--     • Un professeur qui a noté (teacher_id via profiles.user_id)
--     • Un cours optionnel (course_id)
--   Champs clés :
--     score     → note obtenue (entre 0 et max_score)
--     max_score → note maximale (défaut 20)
--     term      → trimestre / semestre (ex: "Trimestre 1")
-- ============================================================================


-- ============================================================================
-- SECTION A — CRÉATION DE LA TABLE grades
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.grades (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID          NOT NULL                                -- Élève noté
                 REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  teacher_id   UUID          NOT NULL                                -- Professeur notant
                 REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  course_id    UUID          REFERENCES public.courses(id)           -- Cours concerné (optionnel)
                 ON DELETE SET NULL,
  subject      TEXT          NOT NULL,                               -- Matière (si pas de cours)
  score        NUMERIC(5,2)  NOT NULL                                -- Note obtenue
                 CHECK (score >= 0),
  max_score    NUMERIC(5,2)  NOT NULL DEFAULT 20                     -- Note maximale
                 CHECK (max_score > 0),
  observations TEXT,                                                  -- Commentaire du prof
  term         TEXT,                                                  -- Trimestre/semestre
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher_id ON public.grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id  ON public.grades(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_term       ON public.grades(term);

DROP TRIGGER IF EXISTS trg_grades_updated_at ON public.grades;
CREATE TRIGGER trg_grades_updated_at
  BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- SECTION B — ROW LEVEL SECURITY (RLS)
-- • Admin : accès total
-- • Prof  : peut créer, modifier et supprimer SES propres notes
--           peut lire TOUTES les notes de ses cours
-- • Élève : peut lire UNIQUEMENT SES propres notes
-- • Parent: peut lire les notes de son enfant
-- ============================================================================

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Admin : gestion complète
DROP POLICY IF EXISTS "grades: admin ALL" ON public.grades;
CREATE POLICY "grades: admin ALL"
  ON public.grades FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Élève : lecture de ses propres notes uniquement
DROP POLICY IF EXISTS "grades: élève SELECT propres" ON public.grades;
CREATE POLICY "grades: élève SELECT propres"
  ON public.grades FOR SELECT
  USING (student_id = auth.uid());

-- Professeur : peut lire les notes qu'il a attribuées
DROP POLICY IF EXISTS "grades: prof SELECT ses notes" ON public.grades;
CREATE POLICY "grades: prof SELECT ses notes"
  ON public.grades FOR SELECT
  USING (teacher_id = auth.uid());

-- Professeur : peut insérer une note (teacher_id doit être lui-même)
DROP POLICY IF EXISTS "grades: prof INSERT" ON public.grades;
CREATE POLICY "grades: prof INSERT"
  ON public.grades FOR INSERT
  WITH CHECK (
    public.is_prof()
    AND teacher_id = auth.uid()
  );

-- Professeur : peut modifier SES propres notes
DROP POLICY IF EXISTS "grades: prof UPDATE ses notes" ON public.grades;
CREATE POLICY "grades: prof UPDATE ses notes"
  ON public.grades FOR UPDATE
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Professeur : peut supprimer SES propres notes
DROP POLICY IF EXISTS "grades: prof DELETE ses notes" ON public.grades;
CREATE POLICY "grades: prof DELETE ses notes"
  ON public.grades FOR DELETE
  USING (teacher_id = auth.uid());

-- Parent : peut consulter les notes de son enfant
DROP POLICY IF EXISTS "grades: parent SELECT enfant" ON public.grades;
CREATE POLICY "grades: parent SELECT enfant"
  ON public.grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = grades.student_id
        AND p.parent_id = auth.uid()
    )
  );

-- Grant pour les utilisateurs authentifiés
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grades TO authenticated;
