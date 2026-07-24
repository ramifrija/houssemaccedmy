-- ============================================================================
-- FICHIER  : 006 / 14 — TABLE: teacher_classes  (assignation prof → classe)
-- EXÉCUTER : en 6ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 002 (profiles), fichier 004 (classes)
-- DESCRIPTION :
--   Table de liaison Many-to-Many entre les professeurs et les classes.
--   Un professeur peut être assigné à plusieurs classes.
--   Une classe peut avoir plusieurs professeurs (différentes matières).
--   Cette table est le point de référence pour :
--     • Savoir quels élèves un professeur peut superviser
--     • Filtrer les ressources (présences, notes) par classe du prof
-- ============================================================================


-- ============================================================================
-- SECTION A — CRÉATION DE LA TABLE teacher_classes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teacher_classes (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),  -- ID unique de l'assignation
  teacher_id  UUID         NOT NULL                                -- FK vers le professeur (auth.users)
                REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id    INTEGER      NOT NULL                                -- FK vers la classe
                REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),                         -- Date d'assignation

  -- Un professeur ne peut être assigné qu'une fois par classe
  UNIQUE(teacher_id, class_id)
);

-- Index pour : "quels profs pour cette classe ?"
CREATE INDEX IF NOT EXISTS idx_teacher_classes_class_id
  ON public.teacher_classes(class_id);

-- Index pour : "quelles classes pour ce prof ?"
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher_id
  ON public.teacher_classes(teacher_id);


-- ============================================================================
-- SECTION B — ROW LEVEL SECURITY (RLS)
-- • Admin : accès total (assigner / retirer des profs des classes)
-- • Prof  : peut voir SES propres assignations de classes
-- • Élève : ne voit pas cette table directement
-- ============================================================================

ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;

-- Admin : gestion complète des assignations
DROP POLICY IF EXISTS "teacher_classes: admin ALL" ON public.teacher_classes;
CREATE POLICY "teacher_classes: admin ALL"
  ON public.teacher_classes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Professeur : voir ses propres classes assignées
DROP POLICY IF EXISTS "teacher_classes: prof SELECT propres" ON public.teacher_classes;
CREATE POLICY "teacher_classes: prof SELECT propres"
  ON public.teacher_classes FOR SELECT
  USING (auth.uid() = teacher_id);
