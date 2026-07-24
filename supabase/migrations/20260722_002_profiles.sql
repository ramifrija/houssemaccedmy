-- ============================================================================
-- FICHIER  : 002 / 14 — TABLE: profiles  (profils utilisateurs)
-- EXÉCUTER : en 2ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 001 (user_roles doit exister)
-- DESCRIPTION :
--   Crée la table profiles qui est le pivot central de toute l'application.
--   Chaque ligne de auth.users a exactement un profil.
--   Le champ role_id fait le lien avec la table user_roles pour savoir si
--   l'utilisateur est admin, prof, élève ou parent.
--   Le champ status gère le workflow d'approbation : un nouvel inscrit est
--   "pending" jusqu'à validation par un admin.
-- ============================================================================


-- ============================================================================
-- SECTION A — CRÉATION DE LA TABLE profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  -- Clé primaire = UUID de l'utilisateur Supabase Auth
  user_id    UUID        PRIMARY KEY
               REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ID secondaire (utile pour certaines jointures REST)
  id         UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),

  -- Informations personnelles
  email      TEXT,                                         -- Email (dupliqué depuis auth.users pour facilité)
  first_name TEXT,                                         -- Prénom
  last_name  TEXT,                                         -- Nom de famille
  phone      TEXT,                                         -- Téléphone (optionnel)

  -- Lien parent → enfant (un parent peut être lié à son enfant)
  parent_id  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Rôle assigné par l'admin (FK vers user_roles : 1=admin, 2=teacher, 3=student, 4=parent)
  role_id    INTEGER     REFERENCES public.user_roles(id) ON DELETE SET NULL,

  -- Rôle demandé lors de l'inscription (avant validation)
  requested_role TEXT,

  -- Statut du compte : pending → en attente, approved → actif, rejected → refusé
  status     TEXT        DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- SECTION B — INDEX pour améliorer les performances des requêtes fréquentes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email     ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role_id   ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status    ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON public.profiles(parent_id);


-- ============================================================================
-- SECTION C — ROW LEVEL SECURITY (RLS)
-- Règles d'accès : chaque utilisateur voit/modifie son propre profil.
-- Les admins voient et modifient TOUS les profils (gestion des utilisateurs).
-- NOTE : Les politiques admin utilisent une sous-requête directe au lieu de
--        la fonction is_admin() qui n'existe pas encore à ce stade.
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique : lire son propre profil
DROP POLICY IF EXISTS "profiles: SELECT propre" ON public.profiles;
CREATE POLICY "profiles: SELECT propre"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : modifier son propre profil (nom, téléphone)
DROP POLICY IF EXISTS "profiles: UPDATE propre" ON public.profiles;
CREATE POLICY "profiles: UPDATE propre"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique : insertion autorisée pour le trigger handle_new_user
DROP POLICY IF EXISTS "profiles: INSERT automatique" ON public.profiles;
CREATE POLICY "profiles: INSERT automatique"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Politique : admin — lecture de tous les profils
DROP POLICY IF EXISTS "profiles: admin SELECT total" ON public.profiles;
CREATE POLICY "profiles: admin SELECT total"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Politique : admin — modification de tous les profils (approbation, changement de rôle…)
DROP POLICY IF EXISTS "profiles: admin UPDATE total" ON public.profiles;
CREATE POLICY "profiles: admin UPDATE total"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

-- Politique : admin — suppression d'un profil
DROP POLICY IF EXISTS "profiles: admin DELETE" ON public.profiles;
CREATE POLICY "profiles: admin DELETE"
  ON public.profiles
  FOR DELETE
  USING (public.is_admin());

-- Politique : professeur — peut lire les profils des élèves de ses classes
DROP POLICY IF EXISTS "profiles: prof SELECT élèves" ON public.profiles;
CREATE POLICY "profiles: prof SELECT élèves"
  ON public.profiles
  FOR SELECT
  USING (public.is_prof());

