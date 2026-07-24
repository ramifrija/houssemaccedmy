-- ============================================================================
-- FICHIER  : 008 / 14 — TABLES: attendance_sessions  ET  attendance_records
-- EXÉCUTER : en 8ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 004 (classes), fichier 005 (student_enrollments)
-- DESCRIPTION :
--   Gère le système de présences :
--     attendance_sessions → session de prise de présence (un cours, une date)
--     attendance_records  → fiche de présence individuelle (un élève par session)
--   Flux d'utilisation :
--     1. Le prof crée une session (→ attendance_sessions)
--     2. Pour chaque élève inscrit dans la classe, un enregistrement est créé
--        automatiquement avec statut 'absent' (→ attendance_records)
--     3. Le prof marque chaque élève comme présent / retard / excusé
--   Fonctions incluses :
--     get_attendance_with_names()   → vue enrichie avec noms des élèves
--     create_attendance_session()   → crée session + enregistrements en une seule transaction
-- ============================================================================


-- ============================================================================
-- SECTION A — TABLE: attendance_sessions  (sessions de présence)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id     INTEGER      NOT NULL                              -- Classe concernée
                 REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id   UUID         NOT NULL                              -- Prof qui prend les présences
                 REFERENCES auth.users(id) ON DELETE CASCADE,
  subject      TEXT         NOT NULL,                            -- Matière (ex: "Mathématiques")
  session_date DATE         NOT NULL,                            -- Date de la session
  start_time   TIME         NOT NULL,                            -- Heure de début
  end_time     TIME         NOT NULL,                            -- Heure de fin
  status       TEXT         NOT NULL DEFAULT 'scheduled'
                 CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  notes        TEXT,                                              -- Notes du professeur
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes : "sessions de cette classe" et "sessions de ce prof"
CREATE INDEX IF NOT EXISTS idx_att_sessions_class_id   ON public.attendance_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_att_sessions_teacher_id ON public.attendance_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_att_sessions_date       ON public.attendance_sessions(session_date);

DROP TRIGGER IF EXISTS trg_att_sessions_updated_at ON public.attendance_sessions;
CREATE TRIGGER trg_att_sessions_updated_at
  BEFORE UPDATE ON public.attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- SECTION B — TABLE: attendance_records  (présences individuelles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID         NOT NULL                              -- FK vers la session
                 REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id   UUID         NOT NULL                              -- FK vers l'élève
                 REFERENCES auth.users(id) ON DELETE CASCADE,
  status       TEXT         NOT NULL DEFAULT 'absent'
                 CHECK (status IN ('present','absent','late','excused')),  -- Statut de présence
  arrival_time TIME,                                              -- Heure d'arrivée si retard
  notes        TEXT,                                              -- Notes sur la présence
  marked_by    UUID         REFERENCES auth.users(id),           -- Qui a marqué la présence
  marked_at    TIMESTAMPTZ  DEFAULT NOW(),                       -- Quand a-t-on marqué
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- Un élève ne peut avoir qu'une seule fiche de présence par session
  UNIQUE(session_id, student_id)
);

-- Index pour les statistiques de présence par élève ou par session
CREATE INDEX IF NOT EXISTS idx_att_records_session_id ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_att_records_student_id ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_att_records_status     ON public.attendance_records(status);


-- ============================================================================
-- SECTION C — ROW LEVEL SECURITY : attendance_sessions
-- ============================================================================

ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Admin : accès total
DROP POLICY IF EXISTS "att_sessions: admin ALL" ON public.attendance_sessions;
CREATE POLICY "att_sessions: admin ALL"
  ON public.attendance_sessions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Professeur : peut créer une session pour ses classes
DROP POLICY IF EXISTS "att_sessions: prof INSERT ses classes" ON public.attendance_sessions;
CREATE POLICY "att_sessions: prof INSERT ses classes"
  ON public.attendance_sessions FOR INSERT
  WITH CHECK (
    public.is_prof()
    AND auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM public.teacher_classes tc
      WHERE tc.teacher_id = auth.uid()
        AND tc.class_id = attendance_sessions.class_id
    )
  );

-- Professeur : peut lire et modifier SES sessions
DROP POLICY IF EXISTS "att_sessions: prof SELECT et UPDATE ses sessions" ON public.attendance_sessions;
CREATE POLICY "att_sessions: prof SELECT et UPDATE ses sessions"
  ON public.attendance_sessions FOR SELECT
  USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "att_sessions: prof UPDATE ses sessions" ON public.attendance_sessions;
CREATE POLICY "att_sessions: prof UPDATE ses sessions"
  ON public.attendance_sessions FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Élève : peut voir les sessions de SA classe
DROP POLICY IF EXISTS "att_sessions: élève SELECT sa classe" ON public.attendance_sessions;
CREATE POLICY "att_sessions: élève SELECT sa classe"
  ON public.attendance_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se
      WHERE se.student_id = auth.uid()
        AND se.class_id = attendance_sessions.class_id
    )
  );


-- ============================================================================
-- SECTION D — ROW LEVEL SECURITY : attendance_records
-- ============================================================================

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Admin : accès total
DROP POLICY IF EXISTS "att_records: admin ALL" ON public.attendance_records;
CREATE POLICY "att_records: admin ALL"
  ON public.attendance_records FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Professeur : peut gérer les présences des sessions qu'il a créées
DROP POLICY IF EXISTS "att_records: prof ALL ses sessions" ON public.attendance_records;
CREATE POLICY "att_records: prof ALL ses sessions"
  ON public.attendance_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.attendance_sessions s
      WHERE s.id = attendance_records.session_id
        AND s.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.attendance_sessions s
      WHERE s.id = attendance_records.session_id
        AND s.teacher_id = auth.uid()
    )
  );

-- Élève : peut voir uniquement SES propres enregistrements de présence
DROP POLICY IF EXISTS "att_records: élève SELECT propre" ON public.attendance_records;
CREATE POLICY "att_records: élève SELECT propre"
  ON public.attendance_records FOR SELECT
  USING (auth.uid() = student_id);

-- Parent : peut voir les présences de son enfant
DROP POLICY IF EXISTS "att_records: parent SELECT enfant" ON public.attendance_records;
CREATE POLICY "att_records: parent SELECT enfant"
  ON public.attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = attendance_records.student_id
        AND p.parent_id = auth.uid()
    )
  );


-- ============================================================================
-- SECTION E — FONCTIONS UTILITAIRES PRÉSENCES
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- get_attendance_with_names()
-- Vue enrichie des présences avec les noms et prénoms des élèves.
-- Utilisée par le frontend pour afficher les listes de présences complètes.
-- Retourne les enregistrements d'une session donnée avec informations élèves.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_attendance_with_names(p_session_id UUID)
RETURNS TABLE (
  record_id    UUID,
  student_id   UUID,
  first_name   TEXT,
  last_name    TEXT,
  email        TEXT,
  status       TEXT,
  arrival_time TIME,
  notes        TEXT,
  marked_at    TIMESTAMPTZ
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    ar.id,
    ar.student_id,
    p.first_name,
    p.last_name,
    p.email,
    ar.status,
    ar.arrival_time,
    ar.notes,
    ar.marked_at
  FROM public.attendance_records ar
  LEFT JOIN public.profiles p ON ar.student_id = p.user_id
  WHERE ar.session_id = p_session_id
  ORDER BY p.last_name, p.first_name;
$$;

GRANT EXECUTE ON FUNCTION public.get_attendance_with_names(UUID) TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- create_attendance_session()
-- Crée une session + initialise automatiquement les fiches présence (absent)
-- pour tous les élèves inscrits dans la classe concernée.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_attendance_session(
  p_class_id   BIGINT,
  p_subject    TEXT,
  p_date       DATE,
  p_start_time TIME,
  p_end_time   TIME,
  p_notes      TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session_id UUID;
  v_role       TEXT;
BEGIN
  -- Vérifier que l'appelant est prof ou admin
  SELECT ur.role_name INTO v_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = auth.uid();

  IF v_role NOT IN ('teacher', 'admin') THEN
    RAISE EXCEPTION 'Permission refusée : seuls les profs et admins peuvent créer des sessions';
  END IF;

  -- Créer la session
  INSERT INTO public.attendance_sessions (
    class_id, teacher_id, subject, session_date, start_time, end_time, notes
  )
  VALUES (
    p_class_id, auth.uid(), p_subject, p_date, p_start_time, p_end_time, p_notes
  )
  RETURNING id INTO v_session_id;

  -- Créer automatiquement une fiche "absent" pour chaque élève inscrit
  INSERT INTO public.attendance_records (session_id, student_id, status)
  SELECT v_session_id, se.student_id, 'absent'
  FROM public.student_enrollments se
  WHERE se.class_id = p_class_id;

  RETURN v_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_attendance_session(BIGINT, TEXT, DATE, TIME, TIME, TEXT) TO authenticated;
