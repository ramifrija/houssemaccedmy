-- ============================================================================
-- FICHIER  : 017_parent_profiles_rls.sql
-- EXÉCUTER : dans le SQL Editor de Supabase
-- DESCRIPTION :
--   Autorise un parent à consulter les profils de SES enfants dans la table profiles.
--   Sans cette politique, la requête RLS de l'Espace Parent bloque la lecture des
--   profils des élèves associés, ce qui affichait "Aucun enfant rattaché".
-- ============================================================================

DROP POLICY IF EXISTS "profiles: parent SELECT enfants" ON public.profiles;
CREATE POLICY "profiles: parent SELECT enfants"
  ON public.profiles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR parent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.parent_students ps
      WHERE ps.student_id = profiles.user_id AND ps.parent_id = auth.uid()
    )
  );
