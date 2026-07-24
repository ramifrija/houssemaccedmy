-- ============================================================================
-- FICHIER  : 010 / 14 — TABLE: announcements  (annonces / publications)
-- EXÉCUTER : en 10ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 002 (profiles)
-- DESCRIPTION :
--   Système d'annonces permettant aux admins et professeurs de publier
--   des informations destinées à un groupe cible d'utilisateurs.
--   Champ target_role : 'all' = tout le monde, sinon filtre par rôle.
--   Les annonces sont lues par les élèves, parents, et profs selon la cible.
-- ============================================================================


-- ============================================================================
-- SECTION A — CRÉATION DE LA TABLE announcements
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT         NOT NULL,                               -- Titre de l'annonce
  content     TEXT         NOT NULL,                               -- Corps de l'annonce (Markdown OK)
  author_id   UUID         NOT NULL                                -- Auteur (admin ou prof)
                REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  audience    TEXT         NOT NULL DEFAULT 'all',                 -- Public cible ('all','students','teachers','parents')
  priority    TEXT         NOT NULL DEFAULT 'normal',              -- Priorité ('low','normal','high')
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes de listing et de filtrage
CREATE INDEX IF NOT EXISTS idx_announcements_author_id  ON public.announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_audience   ON public.announcements(audience);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- SECTION B — ROW LEVEL SECURITY (RLS)
-- • Admin : accès total (créer, modifier, supprimer n'importe quelle annonce)
-- • Prof  : peut créer des annonces et modifier SES propres annonces
-- • Élève / Parent : lecture des annonces qui leur sont destinées
-- ============================================================================

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Admin : accès total
DROP POLICY IF EXISTS "announcements: admin ALL" ON public.announcements;
CREATE POLICY "announcements: admin ALL"
  ON public.announcements FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Professeur : peut créer une annonce (author_id = soi-même)
DROP POLICY IF EXISTS "announcements: prof INSERT" ON public.announcements;
CREATE POLICY "announcements: prof INSERT"
  ON public.announcements FOR INSERT
  WITH CHECK (
    (public.is_prof() OR public.is_admin())
    AND author_id = auth.uid()
  );

-- Professeur : peut modifier SES propres annonces
DROP POLICY IF EXISTS "announcements: prof UPDATE propres" ON public.announcements;
CREATE POLICY "announcements: prof UPDATE propres"
  ON public.announcements FOR UPDATE
  USING (author_id = auth.uid() AND public.is_prof())
  WITH CHECK (author_id = auth.uid());

-- Professeur : peut supprimer SES propres annonces
DROP POLICY IF EXISTS "announcements: prof DELETE propres" ON public.announcements;
CREATE POLICY "announcements: prof DELETE propres"
  ON public.announcements FOR DELETE
  USING (author_id = auth.uid() AND public.is_prof());

-- Tous les utilisateurs authentifiés : lecture des annonces qui les concernent
DROP POLICY IF EXISTS "announcements: SELECT par cible" ON public.announcements;
CREATE POLICY "announcements: SELECT par cible"
  ON public.announcements FOR SELECT
  USING (
    audience = 'all'
    OR author_id = auth.uid()
    OR public.is_admin()
    OR (audience = 'teachers' AND public.is_prof())
    OR (audience = 'students' AND public.is_student())
    OR (audience = 'parents'  AND public.is_parent())
  );

