-- Migration 034: Permettre à l'admin de mettre à jour le mot de passe d'un utilisateur
-- Activer pgcrypto si ce n'est pas déjà fait
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Nettoyer les versions précédentes
DROP FUNCTION IF EXISTS public.admin_update_user_password(UUID, TEXT);
DROP FUNCTION IF EXISTS public.admin_update_user_password(TEXT, TEXT);

-- Créer la fonction avec qualification explicite du schéma extensions
CREATE OR REPLACE FUNCTION public.admin_update_user_password(
  p_user_id UUID,
  p_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Sécurité : Seul un administrateur peut exécuter cette fonction
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Non autorisé : Réservé aux administrateurs.';
  END IF;

  -- Validation de la longueur minimale du mot de passe
  IF p_password IS NULL OR length(trim(p_password)) < 6 THEN
    RAISE EXCEPTION 'Le mot de passe doit contenir au moins 6 caractères.';
  END IF;

  -- Mise à jour du mot de passe dans auth.users
  UPDATE auth.users
  SET encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_password(UUID, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
