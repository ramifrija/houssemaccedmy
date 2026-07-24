-- =============================================================================
-- MIGRATION 027 — CORRECTION RLS MESSAGERIE & ACCÈS READ-ONLY ADMIN
-- 1. Corrige le filtre is_deleted (COALESCE) qui bloquait le chargement des messages
-- 2. Donne à l'admin l'accès en LECTURE SEULE à toutes les conversations/messages
-- =============================================================================

-- ── 1. RLS pour conversations ────────────────────────────────────────────────
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations: SELECT participant" ON public.conversations;
CREATE POLICY "conversations: SELECT participant"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
    )
    OR public.is_admin() -- Admin voit toutes les conversations en consultation
  );

DROP POLICY IF EXISTS "conversations: INSERT" ON public.conversations;
CREATE POLICY "conversations: INSERT"
  ON public.conversations FOR INSERT
  WITH CHECK (
    created_by = auth.uid() OR public.is_admin()
  );


-- ── 2. RLS pour conversation_participants ────────────────────────────────────
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conv_participants: SELECT" ON public.conversation_participants;
CREATE POLICY "conv_participants: SELECT"
  ON public.conversation_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
        AND cp2.user_id = auth.uid()
    )
    OR public.is_admin() -- Admin voit tous les participants
  );

DROP POLICY IF EXISTS "conv_participants: INSERT" ON public.conversation_participants;
CREATE POLICY "conv_participants: INSERT"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_admin()
    OR public.is_prof()
  );


-- ── 3. RLS pour messages ──────────────────────────────────────────────────────
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages: SELECT participant" ON public.messages;
CREATE POLICY "messages: SELECT participant"
  ON public.messages FOR SELECT
  USING (
    COALESCE(is_deleted, false) = false
    AND (
      EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = messages.conversation_id
          AND cp.user_id = auth.uid()
      )
      OR public.is_admin() -- Admin consulte TOUS les messages en lecture seule
    )
  );

DROP POLICY IF EXISTS "messages: INSERT participant" ON public.messages;
CREATE POLICY "messages: INSERT participant"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
    -- L'admin consulte les messages des autres mais n'y insère que s'il est participant
  );
