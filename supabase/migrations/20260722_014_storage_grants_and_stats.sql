-- ============================================================================
-- FICHIER  : 014 / 14 — STORAGE, GRANTS FINAUX ET VARIABLES D'ENVIRONNEMENT
-- EXÉCUTER : en 14ème (dernier fichier) dans le SQL Editor de Supabase
-- DÉPENDANCES : tous les fichiers précédents (001 → 013)
-- DESCRIPTION :
--   Ce fichier final configure les éléments transversaux :
--     1. Buckets Supabase Storage (stockage des fichiers)
--     2. Politiques RLS Storage (qui peut upload/download quoi)
--     3. Grants de permissions sur les schémas et tables
--     4. Politiques Realtime (pour le temps réel des messages)
--     5. Fonctions de recherche / statistiques utiles
-- ============================================================================


-- ============================================================================
-- SECTION A — SUPABASE STORAGE BUCKETS
-- Création des buckets de stockage (si non créés dans les fichiers précédents)
-- ============================================================================

-- Bucket pour les avatars des profils utilisateurs (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,          -- 5 MB max par avatar
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les pièces jointes des messages (privé)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  52428800          -- 50 MB max
)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les exports de données (privé)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'data-exports',
  'data-exports',
  false,
  104857600         -- 100 MB max
)
ON CONFLICT (id) DO NOTHING;

-- Bucket pour les documents pédagogiques (supports de cours, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'course-materials',
  'course-materials',
  false,
  52428800          -- 50 MB max
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- SECTION B — STORAGE RLS POLICIES
-- Qui peut uploader / télécharger dans chaque bucket
-- ============================================================================

-- ─── Bucket: avatars ────────────────────────────────────────────────────────

-- Tout le monde peut lire les avatars (bucket public)
DROP POLICY IF EXISTS "avatars: SELECT public" ON storage.objects;
CREATE POLICY "avatars: SELECT public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Un utilisateur peut uploader son propre avatar (chemin: {user_id}/...)
DROP POLICY IF EXISTS "avatars: INSERT propre" ON storage.objects;
CREATE POLICY "avatars: INSERT propre"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Un utilisateur peut mettre à jour / supprimer son propre avatar
DROP POLICY IF EXISTS "avatars: UPDATE propre" ON storage.objects;
CREATE POLICY "avatars: UPDATE propre"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "avatars: DELETE propre" ON storage.objects;
CREATE POLICY "avatars: DELETE propre"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );


-- ─── Bucket: message-attachments ────────────────────────────────────────────

-- Participants d'une conversation peuvent voir les fichiers de cette conv
DROP POLICY IF EXISTS "msg-attach: SELECT participant" ON storage.objects;
CREATE POLICY "msg-attach: SELECT participant"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-attachments'
    AND auth.role() = 'authenticated'
  );

-- Un utilisateur peut uploader des pièces jointes
DROP POLICY IF EXISTS "msg-attach: INSERT authentifié" ON storage.objects;
CREATE POLICY "msg-attach: INSERT authentifié"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND auth.role() = 'authenticated'
  );


-- ─── Bucket: data-exports ───────────────────────────────────────────────────

-- Seuls les admins et les propriétaires peuvent accéder aux exports
DROP POLICY IF EXISTS "exports: SELECT propre ou admin" ON storage.objects;
CREATE POLICY "exports: SELECT propre ou admin"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'data-exports'
    AND (
      auth.uid()::TEXT = (storage.foldername(name))[1]
      OR public.is_admin()
    )
  );

-- Seul le service_role peut uploader des exports générés automatiquement
DROP POLICY IF EXISTS "exports: INSERT service" ON storage.objects;
CREATE POLICY "exports: INSERT service"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'data-exports'
    AND (auth.role() = 'service_role' OR public.is_admin())
  );


-- ─── Bucket: course-materials ───────────────────────────────────────────────

-- Utilisateurs authentifiés peuvent lire les supports de cours
DROP POLICY IF EXISTS "course-mat: SELECT authentifié" ON storage.objects;
CREATE POLICY "course-mat: SELECT authentifié"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'course-materials'
    AND auth.role() = 'authenticated'
  );

-- Profs et admins peuvent uploader des supports de cours
DROP POLICY IF EXISTS "course-mat: INSERT prof ou admin" ON storage.objects;
CREATE POLICY "course-mat: INSERT prof ou admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'course-materials'
    AND (public.is_prof() OR public.is_admin())
  );

-- Profs et admins peuvent supprimer des supports de cours
DROP POLICY IF EXISTS "course-mat: DELETE prof ou admin" ON storage.objects;
CREATE POLICY "course-mat: DELETE prof ou admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'course-materials'
    AND (public.is_prof() OR public.is_admin())
  );


-- ============================================================================
-- SECTION C — GRANTS DE PERMISSIONS sur le schéma public
-- Permet aux utilisateurs authentifiés d'accéder aux tables via la REST API
-- ============================================================================

-- Utilisation du schéma public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Accès SELECT sur toutes les tables (les RLS filtrent ensuite)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Accès DML sur les tables principales
GRANT INSERT, UPDATE, DELETE ON public.profiles              TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements         TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notifications         TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notification_settings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.conversations         TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.conversation_participants TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.messages              TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.message_attachments   TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.attendance_sessions   TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.attendance_records    TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.data_exports          TO authenticated;

-- Accès aux séquences (pour les tables avec SERIAL)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;


-- ============================================================================
-- SECTION D — FONCTIONS DE STATISTIQUES ET RECHERCHE GLOBALE
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- get_student_stats(student_uuid) — Statistiques d'un élève
-- Retourne : taux de présence, nombre de cours, moyenne générale
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_student_stats(p_student_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total_sessions  BIGINT;
  v_present_count   BIGINT;
  v_grade_avg       NUMERIC;
  v_class_name      TEXT;
BEGIN
  -- Vérifier les droits : seul l'élève lui-même, son parent, un prof ou un admin peut appeler
  IF NOT (
    auth.uid() = p_student_id
    OR public.is_admin()
    OR public.is_prof()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = p_student_id AND p.parent_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Permission refusée';
  END IF;

  -- Nombre total de sessions d'attendance enregistrées pour cet élève
  SELECT COUNT(*) INTO v_total_sessions
  FROM public.attendance_records
  WHERE student_id = p_student_id;

  -- Nombre de sessions où l'élève était présent
  SELECT COUNT(*) INTO v_present_count
  FROM public.attendance_records
  WHERE student_id = p_student_id
    AND status = 'present';

  -- Moyenne des notes de l'élève (sur 20)
  SELECT AVG(score / max_score * 20) INTO v_grade_avg
  FROM public.grades
  WHERE student_id = p_student_id;

  -- Nom de la classe de l'élève
  SELECT c.name INTO v_class_name
  FROM public.student_enrollments se
  JOIN public.classes c ON c.id = se.class_id
  WHERE se.student_id = p_student_id
  LIMIT 1;

  RETURN JSON_BUILD_OBJECT(
    'student_id',       p_student_id,
    'class_name',       v_class_name,
    'total_sessions',   v_total_sessions,
    'present_count',    v_present_count,
    'absence_count',    v_total_sessions - v_present_count,
    'attendance_rate',  CASE WHEN v_total_sessions > 0
                             THEN ROUND((v_present_count::NUMERIC / v_total_sessions) * 100, 1)
                             ELSE 0 END,
    'grade_average',    ROUND(COALESCE(v_grade_avg, 0), 2)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_stats(UUID) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- get_class_stats(class_id) — Statistiques d'une classe
-- Retourne : nb élèves, taux de présence global, moyenne des notes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_class_stats(p_class_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_student_count   BIGINT;
  v_total_sessions  BIGINT;
  v_present_count   BIGINT;
  v_grade_avg       NUMERIC;
  v_class_name      TEXT;
BEGIN
  -- Vérification des droits
  IF NOT (public.is_admin() OR public.is_prof()) THEN
    RAISE EXCEPTION 'Permission refusée : réservé aux admins et professeurs';
  END IF;

  SELECT c.name INTO v_class_name FROM public.classes c WHERE c.id = p_class_id;

  SELECT COUNT(*) INTO v_student_count
  FROM public.student_enrollments
  WHERE class_id = p_class_id;

  SELECT COUNT(*) INTO v_total_sessions
  FROM public.attendance_sessions WHERE class_id = p_class_id;

  SELECT COUNT(*) INTO v_present_count
  FROM public.attendance_records ar
  JOIN public.attendance_sessions att_s ON att_s.id = ar.session_id
  WHERE att_s.class_id = p_class_id AND ar.status = 'present';

  SELECT AVG(g.score / g.max_score * 20) INTO v_grade_avg
  FROM public.grades g
  JOIN public.student_enrollments se ON se.student_id = g.student_id
  WHERE se.class_id = p_class_id;

  RETURN JSON_BUILD_OBJECT(
    'class_id',        p_class_id,
    'class_name',      v_class_name,
    'student_count',   v_student_count,
    'total_sessions',  v_total_sessions,
    'present_count',   v_present_count,
    'attendance_rate', CASE WHEN v_total_sessions > 0 AND v_student_count > 0
                            THEN ROUND((v_present_count::NUMERIC / (v_total_sessions * v_student_count)) * 100, 1)
                            ELSE 0 END,
    'grade_average',   ROUND(COALESCE(v_grade_avg, 0), 2)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_stats(INTEGER) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- get_dashboard_stats() — Statistiques globales pour le tableau de bord admin
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total_users     BIGINT;
  v_total_students  BIGINT;
  v_total_teachers  BIGINT;
  v_total_classes   BIGINT;
  v_pending_users   BIGINT;
  v_today_sessions  BIGINT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Réservé aux administrateurs';
  END IF;

  SELECT COUNT(*) INTO v_total_users FROM public.profiles;

  SELECT COUNT(*) INTO v_total_students
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.id = p.role_id
  WHERE ur.role_name = 'student' AND p.status = 'approved';

  SELECT COUNT(*) INTO v_total_teachers
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.id = p.role_id
  WHERE ur.role_name = 'teacher' AND p.status = 'approved';

  SELECT COUNT(*) INTO v_total_classes FROM public.classes;

  SELECT COUNT(*) INTO v_pending_users
  FROM public.profiles WHERE status = 'pending';

  SELECT COUNT(*) INTO v_today_sessions
  FROM public.attendance_sessions WHERE session_date = CURRENT_DATE;

  RETURN JSON_BUILD_OBJECT(
    'total_users',    v_total_users,
    'total_students', v_total_students,
    'total_teachers', v_total_teachers,
    'total_classes',  v_total_classes,
    'pending_users',  v_pending_users,
    'today_sessions', v_today_sessions
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;


-- ============================================================================
-- SECTION E — REALTIME (Temps réel Supabase)
-- Active le temps réel pour les tables qui nécessitent des mises à jour live
-- ============================================================================

-- Activer le temps réel pour la messagerie et les notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;


-- ============================================================================
-- SECTION F — RÉSUMÉ DES TABLES CRÉÉES
-- ============================================================================
-- Ce commentaire est un aide-mémoire des 20 tables créées dans l'ordre :
--
--  001 → user_roles              (rôles système : admin, teacher, student, parent)
--  002 → profiles                (profils utilisateurs liés à auth.users)
--  003 → [fonctions et triggers] (is_admin, is_prof, handle_new_user, etc.)
--  004 → academic_levels         (niveaux scolaires : Terminale, 1ère...)
--       classes                  (classes concrètes : Terminale A, etc.)
--  005 → student_enrollments     (inscription élève ↔ classe)
--  006 → teacher_classes         (assignation prof ↔ classe)
--  007 → courses                 (matières enseignées)
--       course_schedules         (horaires récurrents des cours)
--       course_sessions          (séances individuelles)
--  008 → attendance_sessions     (sessions de prise de présence)
--       attendance_records       (présences individuelles par élève)
--  009 → grades                  (notes des élèves)
--  010 → announcements           (annonces / publications)
--  011 → student_payments        (paiements et frais de scolarité)
--  012 → conversations           (fils de discussion messagerie)
--       conversation_participants (participants)
--       messages                 (messages individuels)
--       message_attachments      (pièces jointes)
--  013 → notification_templates  (modèles de notifications)
--       notification_settings    (préférences par utilisateur)
--       notifications            (notifications individuelles)
--       data_exports             (historique des exports)
--  014 → [storage + grants + stats] (buckets, permissions, fonctions globales)
-- ============================================================================
