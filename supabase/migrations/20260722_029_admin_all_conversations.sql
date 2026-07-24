-- =============================================================================
-- MIGRATION 029 — FONCTION DE SUPERVISION ADMIN MESSAGERIE
-- Permet à l'administrateur de consulter toutes les conversations du système
-- avec filtrage optionnel par utilisateur.
-- =============================================================================

DROP FUNCTION IF EXISTS public.get_admin_all_conversations(uuid);

CREATE OR REPLACE FUNCTION public.get_admin_all_conversations(p_filter_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  conversation_id   UUID,
  title             TEXT,
  is_group          BOOLEAN,
  participants_list TEXT,
  last_message      TEXT,
  last_message_at   TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.is_group,
    (
      SELECT string_agg(COALESCE(NULLIF(TRIM(p.first_name || ' ' || p.last_name), ''), p.email, 'Utilisateur'), ', ')
      FROM public.conversation_participants cp
      JOIN public.profiles p ON p.user_id = cp.user_id
      WHERE cp.conversation_id = c.id
    ) AS participants_list,
    (
      SELECT m.content
      FROM public.messages m
      WHERE m.conversation_id = c.id AND COALESCE(m.is_deleted, false) = false
      ORDER BY m.sent_at DESC LIMIT 1
    ),
    (
      SELECT m.sent_at
      FROM public.messages m
      WHERE m.conversation_id = c.id AND COALESCE(m.is_deleted, false) = false
      ORDER BY m.sent_at DESC LIMIT 1
    ),
    c.updated_at
  FROM public.conversations c
  WHERE (
    p_filter_user_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = c.id AND cp.user_id = p_filter_user_id
    )
  )
  ORDER BY c.updated_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_all_conversations(UUID) TO authenticated;
