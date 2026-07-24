-- ============================================================================
-- FICHIER  : 012 / 14 — TABLES: conversations, conversation_participants,
--                               messages, message_attachments
-- EXÉCUTER : en 12ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 002 (profiles)
-- DESCRIPTION :
--   Système de messagerie interne complet entre les utilisateurs.
--   Architecture :
--     conversations           → fil de discussion (1:1 ou groupe)
--     conversation_participants → participants du fil
--     messages                → messages individuels
--     message_attachments     → pièces jointes des messages
--   Fonctions incluses :
--     get_my_conversations()         → liste des conversations de l'utilisateur
--     get_messageable_contacts()     → contacts joignables selon le rôle
--     get_messageable_classes()      → classes disponibles pour messages de groupe
--     start_individual_conversation() → démarrer une conv 1:1
--     send_message_to_role()         → envoyer un message à tous les utilisateurs d'un rôle
--     update_conversation_timestamp() → trigger MAJ updated_at
-- ============================================================================


-- ============================================================================
-- SECTION A — TABLE: conversations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT,                                              -- Titre (pour les groupes)
  is_group   BOOLEAN      NOT NULL DEFAULT false,              -- true = groupe, false = 1:1
  created_by UUID         NOT NULL                             -- Créateur de la conversation
               REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()               -- Mis à jour à chaque message
);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);


-- ============================================================================
-- SECTION B — TABLE: conversation_participants
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID         NOT NULL
                    REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID         NOT NULL
                    REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),         -- Date d'ajout au fil
  last_read_at    TIMESTAMPTZ  DEFAULT NOW(),                 -- Dernière lecture (badge non-lu)

  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv_id ON public.conversation_participants(conversation_id);


-- ============================================================================
-- SECTION C — TABLE: messages
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID         NOT NULL
                    REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID         NOT NULL                        -- Expéditeur
                    REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT         NOT NULL,                       -- Contenu du message
  sent_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),         -- Heure d'envoi
  edited_at       TIMESTAMPTZ,                                  -- Heure de dernière modification (NULL si non modifié)
  is_deleted      BOOLEAN      NOT NULL DEFAULT false          -- Soft delete
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id       ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at         ON public.messages(sent_at DESC);


-- ============================================================================
-- SECTION D — TABLE: message_attachments
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.message_attachments (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID         NOT NULL
                REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name   TEXT         NOT NULL,                           -- Nom du fichier original
  file_path   TEXT         NOT NULL,                           -- Chemin dans Supabase Storage
  file_size   BIGINT       NOT NULL,                           -- Taille en octets
  file_type   TEXT         NOT NULL,                           -- MIME type
  uploaded_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON public.message_attachments(message_id);


-- ============================================================================
-- SECTION E — BUCKET STORAGE pour les pièces jointes
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- SECTION F — TRIGGER : mise à jour de conversations.updated_at
-- Se déclenche après chaque INSERT dans messages pour garder updated_at à jour.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_conv_on_message ON public.messages;
CREATE TRIGGER trg_update_conv_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();


-- ============================================================================
-- SECTION G — ROW LEVEL SECURITY : conversations
-- ============================================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Un utilisateur peut voir les conversations auxquelles il participe
DROP POLICY IF EXISTS "conversations: SELECT participant" ON public.conversations;
CREATE POLICY "conversations: SELECT participant"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
    )
  );

-- Un utilisateur peut créer une conversation (créateur = lui-même)
DROP POLICY IF EXISTS "conversations: INSERT" ON public.conversations;
CREATE POLICY "conversations: INSERT"
  ON public.conversations FOR INSERT
  WITH CHECK (created_by = auth.uid());


-- ============================================================================
-- SECTION H — ROW LEVEL SECURITY : conversation_participants
-- ============================================================================

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Peut voir les participants si on est soi-même participant
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
  );

-- Un utilisateur peut s'ajouter ou être ajouté par un admin/prof
DROP POLICY IF EXISTS "conv_participants: INSERT" ON public.conversation_participants;
CREATE POLICY "conv_participants: INSERT"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_admin()
    OR public.is_prof()
  );

-- Mise à jour de last_read_at (propre fiche uniquement)
DROP POLICY IF EXISTS "conv_participants: UPDATE propre" ON public.conversation_participants;
CREATE POLICY "conv_participants: UPDATE propre"
  ON public.conversation_participants FOR UPDATE
  USING (user_id = auth.uid());


-- ============================================================================
-- SECTION I — ROW LEVEL SECURITY : messages
-- ============================================================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Peut lire les messages des conversations auxquelles on participe
DROP POLICY IF EXISTS "messages: SELECT participant" ON public.messages;
CREATE POLICY "messages: SELECT participant"
  ON public.messages FOR SELECT
  USING (
    NOT is_deleted
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

-- Peut envoyer un message si on est participant
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
  );

-- Peut modifier (éditer) son propre message
DROP POLICY IF EXISTS "messages: UPDATE propre" ON public.messages;
CREATE POLICY "messages: UPDATE propre"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());


-- ============================================================================
-- SECTION J — ROW LEVEL SECURITY : message_attachments
-- ============================================================================

ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attachments: SELECT participant" ON public.message_attachments;
CREATE POLICY "attachments: SELECT participant"
  ON public.message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_attachments.message_id
        AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "attachments: INSERT own" ON public.message_attachments;
CREATE POLICY "attachments: INSERT own"
  ON public.message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_attachments.message_id
        AND m.sender_id = auth.uid()
    )
  );


-- ============================================================================
-- SECTION K — FONCTIONS DE MESSAGERIE
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- get_my_conversations() — Liste toutes les conversations de l'utilisateur courant
-- avec les infos du dernier message et les informations de l'autre participant (1:1)
-- ─────────────────────────────────────────────────────────────────────────────
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
  updated_at        TIMESTAMPTZ
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
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
      WHERE m.conversation_id = c.id AND NOT m.is_deleted
      ORDER BY m.sent_at DESC LIMIT 1
    ),
    (
      SELECT m.sent_at
      FROM public.messages m
      WHERE m.conversation_id = c.id AND NOT m.is_deleted
      ORDER BY m.sent_at DESC LIMIT 1
    ),
    c.updated_at
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
$$;

GRANT EXECUTE ON FUNCTION public.get_my_conversations() TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- get_messageable_contacts() — Contacts joignables selon le rôle de l'utilisateur
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_messageable_contacts()
RETURNS TABLE (
  user_id    UUID,
  first_name TEXT,
  last_name  TEXT,
  role_name  TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT ur.role_name INTO v_role
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.id = p.role_id
  WHERE p.user_id = auth.uid();

  IF v_role = 'student' THEN
    -- Élève : peut contacter les profs et admins
    RETURN QUERY
      SELECT p.user_id, p.first_name, p.last_name, ur.role_name
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.id = p.role_id
      WHERE ur.role_name IN ('teacher','admin')
        AND p.user_id <> auth.uid()
      ORDER BY p.last_name, p.first_name;
  ELSE
    -- Profs et admins : peuvent contacter tout le monde
    RETURN QUERY
      SELECT p.user_id, p.first_name, p.last_name, ur.role_name
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.id = p.role_id
      WHERE p.user_id <> auth.uid()
      ORDER BY p.last_name, p.first_name;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_messageable_contacts() TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- get_messageable_classes() — Classes disponibles pour les messages de groupe
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_messageable_classes()
RETURNS TABLE (
  class_id      BIGINT,
  class_name    TEXT,
  student_count BIGINT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT ur.role_name INTO v_role
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.id = p.role_id
  WHERE p.user_id = auth.uid();

  IF v_role = 'admin' THEN
    -- Admin : toutes les classes
    RETURN QUERY
      SELECT c.id::BIGINT, c.name, COUNT(se.id)
      FROM public.classes c
      LEFT JOIN public.student_enrollments se ON se.class_id = c.id
      GROUP BY c.id, c.name ORDER BY c.name;
  ELSIF v_role = 'teacher' THEN
    -- Prof : seulement ses classes assignées
    RETURN QUERY
      SELECT c.id::BIGINT, c.name, COUNT(se.id)
      FROM public.classes c
      JOIN public.teacher_classes tc ON tc.class_id = c.id
      LEFT JOIN public.student_enrollments se ON se.class_id = c.id
      WHERE tc.teacher_id = auth.uid()
      GROUP BY c.id, c.name ORDER BY c.name;
  ELSE
    RETURN;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_messageable_classes() TO authenticated;
