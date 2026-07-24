-- Migration 038: RPC pour créer un groupe de classe avec titre personnalisé
-- Permet de créer une nouvelle conversation de groupe pour une classe
-- (sans recycler une conversation existante), accessible aux profs et admins.

CREATE OR REPLACE FUNCTION public.create_class_group_conversation(
  p_class_id   integer,
  p_title      text,
  p_content    text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv_id uuid;
  v_user_id uuid := auth.uid();
BEGIN
  -- Vérifier que l'appelant est authentifié et a le droit (prof ou admin)
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  IF NOT (public.is_admin() OR public.is_prof()) THEN
    RAISE EXCEPTION 'Accès refusé : réservé aux professeurs et administrateurs';
  END IF;

  -- Créer la conversation
  INSERT INTO public.conversations (title, is_group, created_by)
  VALUES (p_title, true, v_user_id)
  RETURNING id INTO v_conv_id;

  -- Ajouter le créateur comme participant
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (v_conv_id, v_user_id)
  ON CONFLICT DO NOTHING;

  -- Ajouter tous les élèves de la classe
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  SELECT v_conv_id, se.student_id
  FROM public.student_enrollments se
  WHERE se.class_id = p_class_id
    AND se.student_id <> v_user_id
  ON CONFLICT DO NOTHING;

  -- Ajouter tous les professeurs de la classe
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  SELECT v_conv_id, tc.teacher_id
  FROM public.teacher_classes tc
  WHERE tc.class_id = p_class_id
    AND tc.teacher_id <> v_user_id
  ON CONFLICT DO NOTHING;

  -- Envoyer le premier message
  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (v_conv_id, v_user_id, p_content);

  RETURN v_conv_id;
END;
$$;

-- Accorder l'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.create_class_group_conversation(integer, text, text) TO authenticated;
