-- =============================================================================
-- MIGRATION 025 — AUTORISER LES PROFESSEURS À LIRE LES PROFILS D'ÉLÈVES
-- Résout le problème où seul l'admin pouvait voir la liste complète des élèves.
-- =============================================================================

-- 1. Permettre aux professeurs (is_prof()) de lire les profils de la table profiles
DROP POLICY IF EXISTS "profiles: prof SELECT total" ON public.profiles;

CREATE POLICY "profiles: prof SELECT total"
  ON public.profiles FOR SELECT
  USING (
    public.is_prof()
    OR public.is_admin()
    OR auth.uid() = user_id
  );


-- 2. Permettre aux professeurs d'accéder aux inscriptions student_enrollments
DROP POLICY IF EXISTS "enrollments: prof SELECT total" ON public.student_enrollments;

CREATE POLICY "enrollments: prof SELECT total"
  ON public.student_enrollments FOR SELECT
  USING (
    public.is_prof()
    OR public.is_admin()
    OR auth.uid() = student_id
  );
