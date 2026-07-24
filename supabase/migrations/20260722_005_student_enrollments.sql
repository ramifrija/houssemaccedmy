-- ============================================================================
-- FICHIER  : 005 / 14 — TABLE: student_enrollments  (inscriptions élèves)
-- EXÉCUTER : en 5ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 002 (profiles), fichier 004 (classes)
-- DESCRIPTION :
--   Gère les inscriptions des élèves dans leurs classes.
--   C'est une table de liaison Many-to-Many entre profiles et classes.
--   Un élève peut être inscrit dans une seule classe (ou plusieurs selon règle métier).
--   Les professeurs et admins peuvent consulter les inscriptions.
--   Seuls les admins peuvent créer / supprimer des inscriptions.
-- ============================================================================


-- ============================================================================
-- SECTION A — CRÉATION DE LA TABLE student_enrollments
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),  -- ID unique de l'inscription
  student_id  UUID         NOT NULL                                -- FK vers l'élève (via profiles)
                REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  class_id    INTEGER      NOT NULL                                -- FK vers la classe
                REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ  DEFAULT NOW(),                         -- Date d'inscription

  -- Un élève ne peut être inscrit qu'une seule fois dans la même classe
  UNIQUE(student_id, class_id)
);

-- Index pour accélérer les requêtes : "quels élèves dans cette classe ?"
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id
  ON public.student_enrollments(class_id);

-- Index pour : "dans quelles classes est cet élève ?"
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id
  ON public.student_enrollments(student_id);


-- ============================================================================
-- SECTION B — ROW LEVEL SECURITY (RLS)
-- • Admin : accès total (CRUD)
-- • Prof  : lecture des inscriptions de SES classes uniquement (via teacher_classes)
-- • Élève : peut voir sa propre inscription
-- • Parent: peut voir les inscriptions de son enfant
-- ============================================================================

ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- Admin : gestion complète
DROP POLICY IF EXISTS "enrollments: admin ALL" ON public.student_enrollments;
CREATE POLICY "enrollments: admin ALL"
  ON public.student_enrollments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Élève : voir sa propre inscription
DROP POLICY IF EXISTS "enrollments: élève SELECT propre" ON public.student_enrollments;
CREATE POLICY "enrollments: élève SELECT propre"
  ON public.student_enrollments FOR SELECT
  USING (auth.uid() = student_id);

-- Professeur : voir les inscriptions des classes qui lui sont assignées
DROP POLICY IF EXISTS "enrollments: prof SELECT ses classes" ON public.student_enrollments;
CREATE POLICY "enrollments: prof SELECT ses classes"
  ON public.student_enrollments FOR SELECT
  USING (
    public.is_prof()
    AND EXISTS (
      SELECT 1 FROM public.teacher_classes tc
      WHERE tc.teacher_id = auth.uid()
        AND tc.class_id = student_enrollments.class_id
    )
  );

-- Parent : voir les inscriptions de son enfant (via profiles.parent_id)
DROP POLICY IF EXISTS "enrollments: parent SELECT enfant" ON public.student_enrollments;
CREATE POLICY "enrollments: parent SELECT enfant"
  ON public.student_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = student_enrollments.student_id
        AND p.parent_id = auth.uid()
    )
  );
