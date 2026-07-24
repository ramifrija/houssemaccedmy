-- ============================================================================
-- FICHIER  : 001 / 14 — TABLE: user_roles  (table de référence des rôles)
-- EXÉCUTER : en 1er dans le SQL Editor de Supabase
-- DÉPENDANCES : aucune
-- DESCRIPTION :
--   Crée la table de référence qui liste les 4 rôles possibles du système :
--     1 = admin   → administrateur, accès total
--     2 = teacher → professeur, gère ses cours et présences
--     3 = student → élève, consulte ses notes et son emploi du temps
--     4 = parent  → parent, suit son enfant
--   Cette table est utilisée via FK (role_id) dans la table profiles pour
--   associer chaque utilisateur à son rôle dans l'application.
-- ============================================================================


-- ============================================================================
-- SECTION A — CRÉATION DE LA TABLE user_roles
-- Table de "lookup" (référentiel statique) avec des IDs entiers stables.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id         SERIAL       PRIMARY KEY,                        -- ID entier stable (1‑4)
  role_name  TEXT         NOT NULL UNIQUE                     -- Nom du rôle
               CHECK (role_name IN ('admin','teacher','student','parent')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()              -- Date d'insertion
);

-- Index sur role_name pour les recherches fréquentes dans les fonctions RLS
CREATE INDEX IF NOT EXISTS idx_user_roles_role_name
  ON public.user_roles(role_name);


-- ============================================================================
-- SECTION B — ROW LEVEL SECURITY (RLS)
-- La table est en lecture seule pour tous les utilisateurs authentifiés.
-- Seul le backend (service_role) peut y insérer / modifier des lignes.
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Politique : tout utilisateur authentifié peut lire les rôles disponibles
DROP POLICY IF EXISTS "user_roles: SELECT pour authentifiés" ON public.user_roles;
CREATE POLICY "user_roles: SELECT pour authentifiés"
  ON public.user_roles
  FOR SELECT
  USING (auth.role() = 'authenticated');


-- ============================================================================
-- SECTION C — DONNÉES INITIALES
-- Insertion des 4 rôles avec IDs fixes.
-- ON CONFLICT DO NOTHING = idempotent, sûr de rejouer plusieurs fois.
-- ============================================================================

INSERT INTO public.user_roles (id, role_name) VALUES
  (1, 'admin'),
  (2, 'teacher'),
  (3, 'student'),
  (4, 'parent')
ON CONFLICT (role_name) DO NOTHING;

-- Réinitialiser la séquence SERIAL après insertion manuelle avec IDs fixés
SELECT setval('public.user_roles_id_seq', 4);
