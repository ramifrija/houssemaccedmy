-- ============================================================================
-- FICHIER  : 003 / 14 — FONCTIONS UTILITAIRES ET TRIGGERS
-- EXÉCUTER : en 3ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 001 (user_roles), fichier 002 (profiles)
-- DESCRIPTION :
--   Crée toutes les fonctions helper du système :
--     - Vérification de rôle : is_admin(), is_prof(), is_student(), is_parent()
--     - Statut d'approbation : get_user_approval_status()
--     - Mise à jour automatique de updated_at : update_updated_at_column()
--     - Création automatique de profil à l'inscription : handle_new_user()
--   Ces fonctions sont ensuite appelées dans les RLS policies de toutes
--   les autres tables pour filtrer les accès selon le rôle.
-- ============================================================================


-- ============================================================================
-- SECTION A — FONCTIONS DE VÉRIFICATION DE RÔLE
-- Toutes ces fonctions sont SECURITY DEFINER (s'exécutent avec les droits
-- du propriétaire, pas de l'appelant) pour éviter les boucles RLS récursives.
-- SET search_path = '' force l'usage de noms de schéma complets, sécurité ++.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- is_admin() — Retourne TRUE si l'utilisateur courant (auth.uid()) est admin
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.user_id = auth.uid()
      AND ur.role_name = 'admin'
  );
END;
$$;

-- Variante avec UUID explicite (utile pour les vérifications admin sur un tiers)
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.user_id = user_uuid
      AND ur.role_name = 'admin'
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- is_prof() — Retourne TRUE si l'utilisateur courant est professeur
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_prof()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.user_id = auth.uid()
      AND ur.role_name = 'teacher'
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- is_student() — Retourne TRUE si l'utilisateur courant est élève
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.user_id = auth.uid()
      AND ur.role_name = 'student'
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- is_parent() — Retourne TRUE si l'utilisateur courant est parent
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.user_id = auth.uid()
      AND ur.role_name = 'parent'
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_user_role_name() — Retourne le nom du rôle de l'utilisateur courant
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_role_name()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT ur.role_name
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_user_approval_status(uuid) — Retourne le statut d'approbation d'un user
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_approval_status(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT status FROM public.profiles WHERE user_id = user_uuid;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_user_role_id() — Retourne l'ID entier du rôle de l'utilisateur courant
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_role_id()
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role_id FROM public.profiles WHERE user_id = auth.uid();
$$;


-- ============================================================================
-- SECTION B — FONCTION DE MISE À JOUR AUTOMATIQUE DES TIMESTAMPS
-- Trigger BEFORE UPDATE : met à jour updated_at = NOW() à chaque modification.
-- Utilisé sur toutes les tables possédant un champ updated_at.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Attacher le trigger de timestamp sur profiles
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- SECTION C — TRIGGER handle_new_user : INSCRIPTION AUTOMATIQUE
-- Se déclenche APRÈS chaque INSERT dans auth.users (nouvelle inscription).
-- Crée automatiquement un profil avec le rôle et le statut appropriés :
--   • Email admin connu → rôle 'admin', statut 'approved' (accès immédiat)
--   • Tous les autres   → rôle demandé (ou 'student'), statut 'pending'
--                         (attente de validation par un admin)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role_id    INTEGER;  -- ID entier du rôle dans user_roles
  v_role_name  TEXT;     -- Nom du rôle à assigner
  v_status     TEXT;     -- Statut du compte (pending / approved)
BEGIN
  -- Détecter si c'est l'email admin principal de l'académie
  IF NEW.email = 'houssemacademie@gmail.com' THEN
    v_role_name := 'admin';
    v_status    := 'approved';    -- Admin actif immédiatement
  ELSE
    -- Utiliser le rôle indiqué dans les métadonnées, sinon 'student'
    v_role_name := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
    -- Valider que le rôle est acceptable, sinon 'student'
    IF v_role_name NOT IN ('admin','teacher','student','parent') THEN
      v_role_name := 'student';
    END IF;
    v_status := 'pending';        -- Doit être approuvé par un admin
  END IF;

  -- Récupérer l'ID entier correspondant au rôle
  SELECT id INTO v_role_id
  FROM public.user_roles
  WHERE role_name = v_role_name;

  -- Créer le profil (ON CONFLICT protège contre les doubles inserts)
  INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    role_id,
    requested_role,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    v_role_id,
    v_role_name,
    v_status
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Lier le trigger à la table auth.users (remplace si déjà existant)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- SECTION D — FUNCTION admin_delete_user
-- Permet à un admin de supprimer un utilisateur côté profil (le compte
-- auth.users est supprimé en cascade automatiquement).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Seul un admin peut utiliser cette fonction
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission refusée : seul un admin peut supprimer un utilisateur';
  END IF;

  -- Interdire l'auto-suppression
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Impossible de supprimer votre propre compte';
  END IF;

  -- Supprimer le profil (la cascade supprime auth.users via la FK)
  DELETE FROM public.profiles WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$;

-- Autoriser les utilisateurs authentifiés à appeler cette fonction
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
