-- =============================================================================
-- MIGRATION 030 — MESSAGERIE PAGINÉE ET COMPTEUR DE MESSAGES NON LUS
-- 1. Ajoute le support de la pagination (LIMIT/OFFSET) à get_conversation_messages
-- 2. Ajoute la colonne unread_count à get_my_conversations
-- 3. Ajoute la fonction mark_conversation_as_read pour marquer comme lu
-- =============================================================================

-- ── 1. RPC : get_conversation_messages avec pagination ───────────────────────
DROP FUNCTION IF EXISTS public.get_conversation_messages(uuid);
DROP FUNCTION IF EXISTS public.get_conversation_messages(uuid, integer, integer);

CREATE OR REPLACE FUNCTION public.get_conversation_messages(
  p_conversation_id UUID,
  p_limit           INTEGER DEFAULT 20,
  p_offset          INTEGER DEFAULT 0
)
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
    sub.id,
    sub.sender_id,
    sub.sender_name,
    sub.content,
    sub.sent_at,
    sub.is_own
  FROM (
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
    ORDER BY m.sent_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) sub
  ORDER BY sub.sent_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_conversation_messages(UUID, INTEGER, INTEGER) TO authenticated;


-- ── 2. RPC : get_my_conversations avec unread_count ──────────────────────────
DROP FUNCTION IF EXISTS public.get_my_conversations();

CREATE OR REPLACE FUNCTION public.get_my_conversations()
RETURNS TABLE (
  conversation_id   UUID,
  title             TEXT,
  is_group          BOOLEAN,
  other_user_id     UUID,
  other_first_name  TEXT,
  other_last_name   TEXT,
  other_role        TEXT,
  last_message      TEXT,
  last_message_at   TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ,
  unread_count      BIGINT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.is_group,
    other_p.user_id,
    other_p.first_name,
    other_p.last_name,
    other_ur.role_name,
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
    c.updated_at,
    (
      SELECT COALESCE(COUNT(*), 0)::BIGINT
      FROM public.messages m
      WHERE m.conversation_id = c.id
        AND COALESCE(m.is_deleted, false) = false
        AND m.sender_id <> auth.uid()
        AND m.sent_at > COALESCE(my_cp.last_read_at, '-infinity'::timestamptz)
    ) AS unread_count
  FROM public.conversations c
  JOIN public.conversation_participants my_cp
    ON my_cp.conversation_id = c.id AND my_cp.user_id = auth.uid()
  LEFT JOIN public.conversation_participants other_cp
    ON other_cp.conversation_id = c.id
   AND other_cp.user_id <> auth.uid()
   AND NOT c.is_group
  LEFT JOIN public.profiles other_p ON other_p.user_id = other_cp.user_id
  LEFT JOIN public.user_roles other_ur ON other_ur.id = other_p.role_id
  ORDER BY c.updated_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_conversations() TO authenticated;


-- ── 3. RPC : mark_conversation_as_read ───────────────────────────────────────
DROP FUNCTION IF EXISTS public.mark_conversation_as_read(uuid);

CREATE OR REPLACE FUNCTION public.mark_conversation_as_read(p_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.conversation_participants
  SET last_read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND user_id = auth.uid();

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_conversation_as_read(UUID) TO authenticated;
