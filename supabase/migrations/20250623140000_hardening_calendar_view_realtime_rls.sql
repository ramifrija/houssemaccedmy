-- Vue calendrier unifiée (security invoker = RLS des tables sous-jacentes)
CREATE OR REPLACE VIEW public.calendar_sessions_view
WITH (security_invoker = true) AS
SELECT
  cs.id AS session_id,
  cs.session_date,
  cs.start_time,
  cs.end_time,
  cs.room,
  cs.notes,
  cs.schedule_id,
  cs.status AS session_status,
  c.id AS course_id,
  c.name AS course_name,
  c.color AS course_color,
  c.class_id,
  c.teacher_id,
  cl.name AS class_name,
  p.first_name AS teacher_first_name,
  p.last_name AS teacher_last_name
FROM public.course_sessions cs
JOIN public.courses c ON c.id = cs.course_id
JOIN public.classes cl ON cl.id = c.class_id
LEFT JOIN public.profiles p ON p.user_id = c.teacher_id;

GRANT SELECT ON public.calendar_sessions_view TO authenticated;

DROP POLICY IF EXISTS "System can manage participants" ON public.conversation_participants;

CREATE POLICY "Users can add themselves to conversations"
ON public.conversation_participants FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR public.is_admin()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;
END $$;
