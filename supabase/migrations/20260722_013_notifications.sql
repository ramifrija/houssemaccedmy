-- ============================================================================
-- FICHIER  : 013 / 14 — TABLES: notification_templates, notification_settings,
--                               notifications, data_exports
-- EXÉCUTER : en 13ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 002 (profiles / auth.users)
-- DESCRIPTION :
--   Système complet de notifications et d'exports de données :
--     notification_templates → modèles de notifications réutilisables
--     notification_settings  → préférences de notifications par utilisateur
--     notifications          → notifications individuelles envoyées
--     data_exports           → historique et statut des exports CSV/PDF
-- ============================================================================


-- ============================================================================
-- SECTION A — TABLE: notification_templates
-- Modèles prédéfinis de notifications (ex: "Rappel cours", "Note publiée")
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT         NOT NULL UNIQUE,               -- Identifiant du modèle (ex: "course_reminder")
  title_template   TEXT         NOT NULL,                      -- Titre avec variables (ex: "Cours {{subject}}")
  body_template    TEXT         NOT NULL,                      -- Corps avec variables
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- SECTION B — TABLE: notification_settings
-- Préférences de chaque utilisateur (email, push, SMS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_settings (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID         NOT NULL UNIQUE             -- Un paramètre par utilisateur
                          REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications   BOOLEAN      NOT NULL DEFAULT true,     -- Recevoir par email
  push_notifications    BOOLEAN      NOT NULL DEFAULT true,     -- Recevoir en push (mobile)
  sms_notifications     BOOLEAN      NOT NULL DEFAULT false,    -- Recevoir par SMS
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_settings_user_id ON public.notification_settings(user_id);


-- ============================================================================
-- SECTION C — TABLE: notifications
-- Notifications envoyées aux utilisateurs (centre de notifications)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         NOT NULL                          -- Destinataire
                    REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT         NOT NULL,                        -- Titre de la notification
  content         TEXT         NOT NULL,                        -- Corps de la notification
  type            TEXT         NOT NULL,                        -- Type (ex: "attendance", "grade", "announcement")
  priority        TEXT         NOT NULL DEFAULT 'normal'
                    CHECK (priority IN ('low','normal','high')),-- Priorité d'affichage
  read_at         TIMESTAMPTZ,                                   -- NULL = non lu, sinon date de lecture
  related_id      UUID,                                          -- ID de l'objet lié (optionnel)
  related_table   TEXT,                                          -- Table de l'objet lié (ex: "grades")
  scheduled_for   TIMESTAMPTZ,                                   -- Envoyer à cette date (NULL = immédiat)
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index pour le centre de notifications (non lus en premier)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id   ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at   ON public.notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created   ON public.notifications(created_at DESC);


-- ============================================================================
-- SECTION D — TABLE: data_exports
-- Suivi des demandes d'export de données (CSV des présences, PDF des notes…)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.data_exports (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL                            -- Utilisateur ayant demandé l'export
                  REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type   TEXT         NOT NULL,                          -- Type d'export (ex: "attendance_csv")
  status        TEXT         NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','completed','failed')),
  file_url      TEXT,                                            -- URL du fichier généré (Storage)
  error_message TEXT,                                            -- Message d'erreur si failed
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ                                      -- Date de fin du traitement
);

CREATE INDEX IF NOT EXISTS idx_exports_user_id ON public.data_exports(user_id);


-- ============================================================================
-- SECTION E — ROW LEVEL SECURITY : notification_templates
-- Templates visibles par les admins uniquement
-- ============================================================================

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_templates: admin ALL" ON public.notification_templates;
CREATE POLICY "notif_templates: admin ALL"
  ON public.notification_templates FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notif_templates: authentifiés SELECT" ON public.notification_templates;
CREATE POLICY "notif_templates: authentifiés SELECT"
  ON public.notification_templates FOR SELECT
  USING (auth.role() = 'authenticated');


-- ============================================================================
-- SECTION F — ROW LEVEL SECURITY : notification_settings
-- Chaque utilisateur gère SES propres préférences
-- ============================================================================

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_settings: propre ALL" ON public.notification_settings;
CREATE POLICY "notif_settings: propre ALL"
  ON public.notification_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notif_settings: admin SELECT" ON public.notification_settings;
CREATE POLICY "notif_settings: admin SELECT"
  ON public.notification_settings FOR SELECT
  USING (public.is_admin());


-- ============================================================================
-- SECTION G — ROW LEVEL SECURITY : notifications
-- Chaque utilisateur voit UNIQUEMENT ses propres notifications
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications: propre SELECT" ON public.notifications;
CREATE POLICY "notifications: propre SELECT"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications: propre UPDATE (marquer lu)" ON public.notifications;
CREATE POLICY "notifications: propre UPDATE (marquer lu)"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin et système (service_role) peuvent insérer des notifications
DROP POLICY IF EXISTS "notifications: INSERT admin ou service" ON public.notifications;
CREATE POLICY "notifications: INSERT admin ou service"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "notifications: admin SELECT total" ON public.notifications;
CREATE POLICY "notifications: admin SELECT total"
  ON public.notifications FOR SELECT
  USING (public.is_admin());


-- ============================================================================
-- SECTION H — ROW LEVEL SECURITY : data_exports
-- ============================================================================

ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exports: propre ALL" ON public.data_exports;
CREATE POLICY "exports: propre ALL"
  ON public.data_exports FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "exports: admin SELECT total" ON public.data_exports;
CREATE POLICY "exports: admin SELECT total"
  ON public.data_exports FOR SELECT
  USING (public.is_admin());


-- ============================================================================
-- SECTION I — FONCTION : create_notification()
-- Permet de créer une notification programmatiquement (backend ou admin)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id       UUID,
  p_title         TEXT,
  p_content       TEXT,
  p_type          TEXT,
  p_priority      TEXT DEFAULT 'normal',
  p_related_id    UUID DEFAULT NULL,
  p_related_table TEXT DEFAULT NULL,
  p_scheduled_for TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, content, type, priority, related_id, related_table, scheduled_for
  )
  VALUES (
    p_user_id, p_title, p_content, p_type, p_priority, p_related_id, p_related_table, p_scheduled_for
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TIMESTAMPTZ) TO authenticated;
