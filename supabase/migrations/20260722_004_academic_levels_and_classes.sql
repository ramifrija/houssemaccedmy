-- ============================================================================
-- FICHIER  : 004 / 14 — TABLES: academic_levels  ET  classes
-- EXÉCUTER : en 4ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 003 (fonctions is_admin, is_prof disponibles)
-- DESCRIPTION :
--   Crée la hiérarchie géographique des classes :
--     academic_levels → niveaux académiques (ex: "Terminale", "1ère", "2nde")
--     classes         → classes concrètes (ex: "Terminale A", rattachée à un niveau)
--   Cette structure permet d'organiser les élèves par niveau puis par classe.
--   Les professeurs sont assignés à des classes, les élèves y sont inscrits.
-- ============================================================================


-- ============================================================================
-- SECTION A — TABLE: academic_levels  (niveaux académiques)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.academic_levels (
  id         SERIAL       PRIMARY KEY,                  -- Identifiant auto-incrémenté
  name       TEXT         NOT NULL UNIQUE,              -- Nom du niveau (ex: "Terminale")
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()        -- Date de création
);

-- Pas d'index supplémentaire : le PRIMARY KEY couvre les jointures par id


-- ============================================================================
-- SECTION B — TABLE: classes  (classes concrètes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.classes (
  id                  SERIAL       PRIMARY KEY,                    -- ID auto-incrémenté
  name                TEXT         NOT NULL,                       -- Nom de la classe (ex: "Terminale A")
  academic_level_id   INTEGER      NOT NULL                        -- FK vers le niveau académique
                        REFERENCES public.academic_levels(id)
                        ON DELETE CASCADE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()          -- Date de création
);

-- Contrainte : pas deux classes du même nom dans le même niveau
CREATE UNIQUE INDEX IF NOT EXISTS uq_class_name_per_level
  ON public.classes(name, academic_level_id);

-- Index pour les jointures fréquentes
CREATE INDEX IF NOT EXISTS idx_classes_academic_level_id
  ON public.classes(academic_level_id);


-- ============================================================================
-- SECTION C — ROW LEVEL SECURITY : academic_levels
-- • Lecture : tous les utilisateurs authentifiés (nécessaire pour les menus)
-- • Écriture : admins uniquement
-- ============================================================================

ALTER TABLE public.academic_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "academic_levels: SELECT pour authentifiés" ON public.academic_levels;
CREATE POLICY "academic_levels: SELECT pour authentifiés"
  ON public.academic_levels FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "academic_levels: INSERT admin" ON public.academic_levels;
CREATE POLICY "academic_levels: INSERT admin"
  ON public.academic_levels FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "academic_levels: UPDATE admin" ON public.academic_levels;
CREATE POLICY "academic_levels: UPDATE admin"
  ON public.academic_levels FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "academic_levels: DELETE admin" ON public.academic_levels;
CREATE POLICY "academic_levels: DELETE admin"
  ON public.academic_levels FOR DELETE
  USING (public.is_admin());


-- ============================================================================
-- SECTION D — ROW LEVEL SECURITY : classes
-- • Lecture : tous les utilisateurs authentifiés (profs, élèves ont besoin)
-- • Écriture / Modification / Suppression : admins uniquement
-- ============================================================================

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "classes: SELECT pour authentifiés" ON public.classes;
CREATE POLICY "classes: SELECT pour authentifiés"
  ON public.classes FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "classes: INSERT admin" ON public.classes;
CREATE POLICY "classes: INSERT admin"
  ON public.classes FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "classes: UPDATE admin" ON public.classes;
CREATE POLICY "classes: UPDATE admin"
  ON public.classes FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "classes: DELETE admin" ON public.classes;
CREATE POLICY "classes: DELETE admin"
  ON public.classes FOR DELETE
  USING (public.is_admin());


-- ============================================================================
-- SECTION E — TRIGGER updated_at sur classes (si besoin futur)
-- (academic_levels et classes n'ont pas de updated_at pour l'instant)
-- ============================================================================

-- Aucun trigger updated_at requis ici car ces tables sont rarement modifiées.
-- Ajouter une colonne updated_at et un trigger si le besoin se présente.
