-- ============================================================================
-- FICHIER  : 016_generate_course_sessions_and_notifications_fix.sql
-- EXÉCUTER : dans le SQL Editor de Supabase
-- DESCRIPTION :
--   1. Crée la fonction RPC generate_course_sessions pour générer automatiquement 
--      les séances de cours lors de la création d'un cours récurrent dans le calendrier.
--   2. S'assure que les administrateurs peuvent insérer des notifications pour 
--      n'importe quel utilisateur (relances de paiement parent).
-- ============================================================================

-- 1. Fonction RPC pour générer les séances d'un cours récurrent
CREATE OR REPLACE FUNCTION public.generate_course_sessions(
  p_course_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  r_sched RECORD;
  v_curr DATE;
  v_dow INT;
BEGIN
  FOR r_sched IN
    SELECT * FROM public.course_schedules WHERE course_id = p_course_id
  LOOP
    v_curr := p_start_date;
    WHILE v_curr <= p_end_date LOOP
      v_dow := EXTRACT(DOW FROM v_curr)::INT;
      IF v_dow = r_sched.day_of_week THEN
        INSERT INTO public.course_sessions (
          course_id, schedule_id, session_date, start_time, end_time, room
        ) VALUES (
          p_course_id, r_sched.id, v_curr, r_sched.start_time, r_sched.end_time, r_sched.room
        )
        ON CONFLICT DO NOTHING;
      END IF;
      v_curr := v_curr + INTERVAL '1 day';
    END LOOP;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_course_sessions(UUID, DATE, DATE) TO authenticated;

-- 2. Accorder l'accès d'insertion des notifications pour les administrateurs
DROP POLICY IF EXISTS "notifications: INSERT admin ou service" ON public.notifications;
CREATE POLICY "notifications: INSERT admin ou service"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');
