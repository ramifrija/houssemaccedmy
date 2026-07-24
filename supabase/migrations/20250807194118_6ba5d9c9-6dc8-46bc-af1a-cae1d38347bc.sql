-- Create messaging system for the academy
-- This includes conversations, messages, and file attachments

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  is_group BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create conversation participants table
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS on conversation participants
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create message attachments table
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on message attachments
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_sent_at ON public.messages(sent_at DESC);
CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);

-- Create function to update conversation updated_at when a message is sent
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Create trigger for updating conversation timestamp
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();

-- Create function to send message to all users with specific role
CREATE OR REPLACE FUNCTION public.send_message_to_role(
  p_title TEXT,
  p_content TEXT,
  p_target_role TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_conversation_id UUID;
  v_user_record RECORD;
  v_sender_role TEXT;
BEGIN
  -- Check if sender has permission (admin or prof)
  SELECT ur.role_name INTO v_sender_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = auth.uid();
  
  IF v_sender_role NOT IN ('admin', 'prof') THEN
    RAISE EXCEPTION 'Permission denied: Only admins and professors can send group messages';
  END IF;

  -- Create the conversation
  INSERT INTO public.conversations (title, is_group, created_by)
  VALUES (p_title, true, auth.uid())
  RETURNING id INTO v_conversation_id;

  -- Add sender as participant
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (v_conversation_id, auth.uid());

  -- Add all users with target role as participants
  FOR v_user_record IN 
    SELECT p.user_id
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE ur.role_name = p_target_role
    AND p.user_id != auth.uid()
  LOOP
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (v_conversation_id, v_user_record.user_id);
  END LOOP;

  -- Send the initial message
  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (v_conversation_id, auth.uid(), p_content);

  RETURN v_conversation_id;
END;
$function$;

-- Create function to start individual conversation
CREATE OR REPLACE FUNCTION public.start_individual_conversation(
  p_recipient_id UUID,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_conversation_id UUID;
  v_sender_role TEXT;
  v_recipient_role TEXT;
BEGIN
  -- Get sender and recipient roles
  SELECT ur.role_name INTO v_sender_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = auth.uid();

  SELECT ur.role_name INTO v_recipient_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = p_recipient_id;

  -- Check permissions: students can only message profs
  IF v_sender_role = 'student' AND v_recipient_role NOT IN ('prof', 'admin') THEN
    RAISE EXCEPTION 'Permission denied: Students can only message professors and admins';
  END IF;

  -- Check if conversation already exists between these users
  SELECT c.id INTO v_conversation_id
  FROM public.conversations c
  WHERE c.is_group = false
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants cp1 
    WHERE cp1.conversation_id = c.id AND cp1.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants cp2 
    WHERE cp2.conversation_id = c.id AND cp2.user_id = p_recipient_id
  )
  AND (
    SELECT COUNT(*) FROM public.conversation_participants cp 
    WHERE cp.conversation_id = c.id
  ) = 2;

  -- Create new conversation if none exists
  IF v_conversation_id IS NULL THEN
    INSERT INTO public.conversations (is_group, created_by)
    VALUES (false, auth.uid())
    RETURNING id INTO v_conversation_id;

    -- Add both participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
      (v_conversation_id, auth.uid()),
      (v_conversation_id, p_recipient_id);
  END IF;

  -- Send the message
  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (v_conversation_id, auth.uid(), p_content);

  RETURN v_conversation_id;
END;
$function$;

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Admins and profs can create group conversations"
ON public.conversations FOR INSERT
WITH CHECK (
  is_group = false OR 
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.user_id = auth.uid() 
    AND ur.role_name IN ('admin', 'prof')
  )
);

CREATE POLICY "Users can create individual conversations"
ON public.conversations FOR INSERT
WITH CHECK (
  is_group = false AND created_by = auth.uid()
);

-- RLS Policies for conversation participants
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "System can manage participants"
ON public.conversation_participants FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own participation"
ON public.conversation_participants FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can edit their own messages"
ON public.messages FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- RLS Policies for message attachments
CREATE POLICY "Users can view attachments in their conversations"
ON public.message_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_attachments.message_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add attachments to their messages"
ON public.message_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id = message_attachments.message_id 
    AND m.sender_id = auth.uid()
  )
);

-- Storage policies for message attachments
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view message attachments they have access to"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM public.message_attachments ma
      JOIN public.messages m ON m.id = ma.message_id
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE ma.file_path = name AND cp.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete their own message attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);