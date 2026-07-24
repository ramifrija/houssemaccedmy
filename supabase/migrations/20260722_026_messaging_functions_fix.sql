-- =============================================================================
-- MIGRATION 026 — CORRECTION DES FONCTIONS DE MESSAGERIE & GROUPES DE CLASSE
-- Crée start_individual_conversation, start_group_conversation, send_message_to_class
-- =============================================================================

-- ── 1. Démarrer une conversation individuelle (1:1) ──────────────────────────
DROP FUNCTION IF EXISTS public.start_individual_conversation(uuid, text);

CREATE OR REPLACE FUNCTION public.start_individual_conversation(
  p_recipient_id UUID,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_conv_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  -- Chercher une conversation 1:1 existante
  SELECT c.id INTO v_conv_id
  FROM public.conversations c
  JOIN public.conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = auth.uid()
  JOIN public.conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = p_recipient_id
  WHERE c.is_group = false
  LIMIT 1;

  -- Si elle n'existe pas, la créer
  IF v_conv_id IS NULL THEN
    INSERT INTO public.conversations (is_group, created_by)
    VALUES (false, auth.uid())
    RETURNING id INTO v_conv_id;

    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES
      (v_conv_id, auth.uid()),
      (v_conv_id, p_recipient_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insérer le premier message si du texte est fourni
  IF p_content IS NOT NULL AND TRIM(p_content) <> '' THEN
    INSERT INTO public.messages (conversation_id, sender_id, content)
    VALUES (v_conv_id, auth.uid(), TRIM(p_content));

    UPDATE public.conversations
    SET updated_at = NOW()
    WHERE id = v_conv_id;
  END IF;

  RETURN v_conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_individual_conversation(UUID, TEXT) TO authenticated;


-- ── 2. Démarrer une conversation de groupe (Multi-contacts) ───────────────────
DROP FUNCTION IF EXISTS public.start_group_conversation(text, uuid[], text);

CREATE OR REPLACE FUNCTION public.start_group_conversation(
  p_title TEXT,
  p_participant_ids UUID[],
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_conv_id UUID;
  v_pid UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  INSERT INTO public.conversations (is_group, title, created_by)
  VALUES (true, COALESCE(NULLIF(TRIM(p_title), ''), 'Groupe de discussion'), auth.uid())
  RETURNING id INTO v_conv_id;

  -- Ajouter l'expéditeur
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (v_conv_id, auth.uid())
  ON CONFLICT DO NOTHING;

  -- Ajouter tous les membres sélectionnés
  IF p_participant_ids IS NOT NULL THEN
    FOREACH v_pid IN ARRAY p_participant_ids
    LOOP
      IF v_pid IS NOT NULL AND v_pid <> auth.uid() THEN
        INSERT INTO public.conversation_participants (conversation_id, user_id)
        VALUES (v_conv_id, v_pid)
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  -- Insérer le message initial
  IF p_content IS NOT NULL AND TRIM(p_content) <> '' THEN
    INSERT INTO public.messages (conversation_id, sender_id, content)
    VALUES (v_conv_id, auth.uid(), TRIM(p_content));

    UPDATE public.conversations
    SET updated_at = NOW()
    WHERE id = v_conv_id;
  END IF;

  RETURN v_conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_group_conversation(TEXT, UUID[], TEXT) TO authenticated;


-- ── 3. Démarrer / Envoyer un message à toute une classe (Groupe de Classe) ───
DROP FUNCTION IF EXISTS public.send_message_to_class(bigint, text, text);

CREATE OR REPLACE FUNCTION public.send_message_to_class(
  p_class_id BIGINT,
  p_content TEXT,
  p_title TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_conv_id UUID;
  v_class_name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  SELECT name INTO v_class_name FROM public.classes WHERE id = p_class_id;

  -- Chercher si un groupe existe déjà pour cette classe
  SELECT c.id INTO v_conv_id
  FROM public.conversations c
  WHERE c.is_group = true
    AND c.title = 'Groupe — ' || COALESCE(v_class_name, 'Classe ' || p_class_id)
  LIMIT 1;

  IF v_conv_id IS NULL THEN
    INSERT INTO public.conversations (is_group, title, created_by)
    VALUES (true, 'Groupe — ' || COALESCE(v_class_name, 'Classe ' || p_class_id), auth.uid())
    RETURNING id INTO v_conv_id;
  END IF;

  -- Ajouter les élèves de la classe
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  SELECT DISTINCT v_conv_id, se.student_id
  FROM public.student_enrollments se
  WHERE se.class_id = p_class_id
  ON CONFLICT DO NOTHING;

  -- Ajouter l'expéditeur
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (v_conv_id, auth.uid())
  ON CONFLICT DO NOTHING;

  -- Ajouter les profs de la classe
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  SELECT DISTINCT v_conv_id, tc.teacher_id
  FROM public.teacher_classes tc
  WHERE tc.class_id = p_class_id
  ON CONFLICT DO NOTHING;

  -- Envoyer le message
  IF p_content IS NOT NULL AND TRIM(p_content) <> '' THEN
    INSERT INTO public.messages (conversation_id, sender_id, content)
    VALUES (v_conv_id, auth.uid(), TRIM(p_content));

    UPDATE public.conversations
    SET updated_at = NOW()
    WHERE id = v_conv_id;
  END IF;

  RETURN v_conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_message_to_class(BIGINT, TEXT, TEXT) TO authenticated;
