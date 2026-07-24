-- =============================================================================
-- MIGRATION 028 — RPCs DE MESSAGERIE HAUTE FIABILITÉ (SECURITY DEFINER)
-- Évite tout blocage RLS lors de la lecture et de l'envoi de messages.
-- =============================================================================

-- ── 1. RPC : get_conversation_messages ───────────────────────────────────────
DROP FUNCTION IF EXISTS public.get_conversation_messages(uuid);

CREATE OR REPLACE FUNCTION public.get_conversation_messages(p_conversation_id UUID)
RETURNS TABLE (
  id           UUID,
  sender_id    UUID,
  sender_name  TEXT,
  content      TEXT,
  sent_at      TIMESTAMPTZ,
  is_own       BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  -- S'assurer que l'utilisateur est inscrit comme participant
  IF NOT public.is_admin() THEN
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (p_conversation_id, auth.uid())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.sender_id,
    COALESCE(
      NULLIF(TRIM(p.first_name || ' ' || p.last_name), ''),
      p.email,
      'Utilisateur'
    ) AS sender_name,
    m.content,
    m.sent_at,
    (m.sender_id = auth.uid()) AS is_own
  FROM public.messages m
  LEFT JOIN public.profiles p ON p.user_id = m.sender_id
  WHERE m.conversation_id = p_conversation_id
    AND COALESCE(m.is_deleted, false) = false
  ORDER BY m.sent_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_conversation_messages(UUID) TO authenticated;


-- ── 2. RPC : send_message ───────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.send_message(uuid, text);

CREATE OR REPLACE FUNCTION public.send_message(
  p_conversation_id UUID,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_message_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  IF p_content IS NULL OR TRIM(p_content) = '' THEN
    RAISE EXCEPTION 'Le message ne peut pas être vide';
  END IF;

  -- S'assurer que l'expéditeur est inscrit comme participant
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (p_conversation_id, auth.uid())
  ON CONFLICT DO NOTHING;

  -- Poster le message
  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (p_conversation_id, auth.uid(), TRIM(p_content))
  RETURNING id INTO v_message_id;

  -- Mettre à jour la date de modification de la conversation
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = p_conversation_id;

  RETURN v_message_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_message(UUID, TEXT) TO authenticated;
