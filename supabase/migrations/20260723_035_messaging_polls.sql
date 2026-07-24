-- =============================================================================
-- MIGRATION 035 — SONDAGES DANS LA MESSAGERIE
-- =============================================================================

-- 1. Ajouter les colonnes type et metadata à messages
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' NOT NULL CHECK (message_type IN ('text', 'poll')),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Créer la table poll_votes
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(message_id, user_id)
);

-- Activer RLS sur poll_votes
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Politique : Tout utilisateur authentifié peut voir les votes
CREATE POLICY "Les utilisateurs peuvent voir tous les votes"
ON public.poll_votes FOR SELECT TO authenticated
USING (true);

-- Politique : Un utilisateur peut insérer son propre vote
CREATE POLICY "Un utilisateur peut voter"
ON public.poll_votes FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Politique : Un utilisateur peut modifier son propre vote
CREATE POLICY "Un utilisateur peut modifier son vote"
ON public.poll_votes FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Mettre à jour la fonction get_conversation_messages pour inclure message_type et metadata
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
  is_own       BOOLEAN,
  message_type TEXT,
  metadata     JSONB
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
    sub.is_own,
    sub.message_type,
    sub.metadata
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
      (m.sender_id = auth.uid()) AS is_own,
      m.message_type,
      m.metadata
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

-- 4. Fonction pour voter sur un sondage
CREATE OR REPLACE FUNCTION public.vote_on_poll(
  p_message_id UUID,
  p_option_index INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  -- Vérifier que le message est bien un sondage
  IF NOT EXISTS (SELECT 1 FROM public.messages WHERE id = p_message_id AND message_type = 'poll') THEN
    RAISE EXCEPTION 'Le message n''est pas un sondage';
  END IF;

  -- Insérer ou mettre à jour le vote
  INSERT INTO public.poll_votes (message_id, user_id, option_index)
  VALUES (p_message_id, auth.uid(), p_option_index)
  ON CONFLICT (message_id, user_id) 
  DO UPDATE SET option_index = p_option_index, created_at = NOW();

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.vote_on_poll(UUID, INTEGER) TO authenticated;

-- 5. Fonction pour obtenir les résultats d'un sondage
CREATE OR REPLACE FUNCTION public.get_poll_votes(
  p_message_id UUID
)
RETURNS TABLE (
  option_index INTEGER,
  vote_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT pv.option_index, COUNT(*)::BIGINT AS vote_count
  FROM public.poll_votes pv
  WHERE pv.message_id = p_message_id
  GROUP BY pv.option_index;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_poll_votes(UUID) TO authenticated;

-- 6. Fonction pour envoyer un message de sondage
CREATE OR REPLACE FUNCTION public.send_poll_message(
  p_conversation_id UUID,
  p_content TEXT,
  p_metadata JSONB
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

  INSERT INTO public.messages (conversation_id, sender_id, content, message_type, metadata)
  VALUES (p_conversation_id, auth.uid(), p_content, 'poll', p_metadata)
  RETURNING id INTO v_message_id;

  RETURN v_message_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_poll_message(UUID, TEXT, JSONB) TO authenticated;
