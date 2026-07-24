-- =============================================================================
-- MIGRATION 033 — NOTIFICATION INSTANTANÉE AUX PARENTS
--                 Quand un élève est marqué ABSENT ou EN RETARD
--
-- MÉCANISME :
--   Un trigger AFTER INSERT OR UPDATE sur attendance_records déclenche
--   la fonction notify_parent_on_attendance() qui :
--     1. Récupère le nom de l'élève et la matière
--     2. Trouve les parent(s) liés (via profiles.parent_id OU parent_students)
--     3. Insère une notification "high" dans public.notifications pour chaque parent
--
-- La fonction est SECURITY DEFINER pour bypasser le RLS sur INSERT notifications
-- (car la RLS actuelle n'autorise que les admins à insérer).
-- =============================================================================

-- ── 1. Mettre à jour la politique INSERT notifications ────────────────────────
-- Permettre aussi aux professeurs et triggers de créer des notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications: INSERT admin ou service" ON public.notifications;
CREATE POLICY "notifications: INSERT admin ou service"
  ON public.notifications FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR public.is_prof()
    OR auth.role() = 'service_role'
  );

-- ── 2. Fonction trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_parent_on_attendance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_name  TEXT;
  v_subject       TEXT;
  v_session_date  DATE;
  v_notif_title   TEXT;
  v_notif_content TEXT;
  v_parent_id     UUID;
BEGIN
  -- Ignorer les présences normales
  IF NEW.status NOT IN ('absent', 'late') THEN
    RETURN NEW;
  END IF;

  -- Ne notifier que lors d'un CHANGEMENT réel de statut
  -- (insert ou update depuis un statut différent / null)
  IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Récupérer le nom de l'élève
  SELECT TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
    INTO v_student_name
    FROM public.profiles
   WHERE user_id = NEW.student_id;

  -- Récupérer la matière et la date depuis attendance_sessions
  SELECT s.subject, s.session_date
    INTO v_subject, v_session_date
    FROM public.attendance_sessions s
   WHERE s.id = NEW.session_id;

  -- Préparer le contenu selon le statut
  IF NEW.status = 'absent' THEN
    v_notif_title   := '🔴 Absence signalée — ' || COALESCE(v_student_name, 'Votre enfant');
    v_notif_content := COALESCE(v_student_name, 'Votre enfant') ||
                       ' a été marqué(e) absent(e) en ' ||
                       COALESCE(v_subject, 'cours') ||
                       ' le ' ||
                       TO_CHAR(COALESCE(v_session_date, CURRENT_DATE), 'DD/MM/YYYY') || '.';
  ELSE -- late
    v_notif_title   := '🟡 Retard signalé — ' || COALESCE(v_student_name, 'Votre enfant');
    v_notif_content := COALESCE(v_student_name, 'Votre enfant') ||
                       ' a été marqué(e) en retard en ' ||
                       COALESCE(v_subject, 'cours') ||
                       ' le ' ||
                       TO_CHAR(COALESCE(v_session_date, CURRENT_DATE), 'DD/MM/YYYY') || '.';
  END IF;

  -- ── Notifier via profiles.parent_id ─────────────────────────────────────────
  FOR v_parent_id IN
    SELECT DISTINCT parent_id
      FROM public.profiles
     WHERE user_id = NEW.student_id
       AND parent_id IS NOT NULL
  LOOP
    INSERT INTO public.notifications (user_id, title, content, type, priority, related_id, related_table)
    VALUES (v_parent_id, v_notif_title, v_notif_content, 'attendance', 'high', NEW.id, 'attendance_records');
  END LOOP;

  -- ── Notifier via parent_students ─────────────────────────────────────────────
  FOR v_parent_id IN
    SELECT DISTINCT ps.parent_id
      FROM public.parent_students ps
     WHERE ps.student_id = NEW.student_id
       -- Éviter les doublons si déjà notifié via profiles.parent_id
       AND NOT EXISTS (
         SELECT 1 FROM public.profiles p
          WHERE p.user_id = NEW.student_id AND p.parent_id = ps.parent_id
       )
  LOOP
    INSERT INTO public.notifications (user_id, title, content, type, priority, related_id, related_table)
    VALUES (v_parent_id, v_notif_title, v_notif_content, 'attendance', 'high', NEW.id, 'attendance_records');
  END LOOP;

  RETURN NEW;
END;
$$;

-- ── 3. Créer le trigger ───────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_notify_parent_on_attendance ON public.attendance_records;
CREATE TRIGGER trg_notify_parent_on_attendance
  AFTER INSERT OR UPDATE OF status
  ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_parent_on_attendance();
