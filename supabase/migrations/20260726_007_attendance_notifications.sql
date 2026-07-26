-- 1. Fonction qui va créer la notification pour les parents
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
  IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Récupérer le nom de l'élève
  SELECT TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
    INTO v_student_name
    FROM public.profiles
   WHERE user_id = NEW.student_id;

  -- Récupérer la matière et la date du cours
  SELECT s.subject, s.session_date
    INTO v_subject, v_session_date
    FROM public.attendance_sessions s
   WHERE s.id = NEW.session_id;

  -- Préparer le texte de la notification
  IF NEW.status = 'absent' THEN
    v_notif_title   := '🔴 Absence signalée — ' || COALESCE(v_student_name, 'Votre enfant');
    v_notif_content := COALESCE(v_student_name, 'Votre enfant') ||
                       ' a été marqué(e) absent(e) en ' ||
                       COALESCE(v_subject, 'cours') ||
                       ' le ' || TO_CHAR(COALESCE(v_session_date, CURRENT_DATE), 'DD/MM/YYYY') || '.';
  ELSE 
    v_notif_title   := '🟡 Retard signalé — ' || COALESCE(v_student_name, 'Votre enfant');
    v_notif_content := COALESCE(v_student_name, 'Votre enfant') ||
                       ' a été marqué(e) en retard en ' ||
                       COALESCE(v_subject, 'cours') ||
                       ' le ' || TO_CHAR(COALESCE(v_session_date, CURRENT_DATE), 'DD/MM/YYYY') || '.';
  END IF;

  -- Trouver les parents et envoyer la notification dans la table `notifications`
  FOR v_parent_id IN
    SELECT DISTINCT parent_id FROM public.profiles WHERE user_id = NEW.student_id AND parent_id IS NOT NULL
    UNION
    SELECT DISTINCT parent_id FROM public.parent_students WHERE student_id = NEW.student_id
  LOOP
    INSERT INTO public.notifications (user_id, title, content, type, priority, related_id, related_table)
    VALUES (v_parent_id, v_notif_title, v_notif_content, 'attendance', 'high', NEW.id, 'attendance_records');
  END LOOP;

  RETURN NEW;
END;
$$;

-- 2. Activer le déclencheur (Trigger) sur la table des présences
DROP TRIGGER IF EXISTS trg_notify_parent_on_attendance ON public.attendance_records;
CREATE TRIGGER trg_notify_parent_on_attendance
  AFTER INSERT OR UPDATE OF status
  ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_parent_on_attendance();
