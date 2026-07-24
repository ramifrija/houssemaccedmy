-- ============================================================================
-- FICHIER  : 007 / 14 — TABLES: courses, course_schedules, course_sessions
-- EXÉCUTER : en 7ème dans le SQL Editor de Supabase
-- DÉPENDANCES : fichier 004 (classes), fichier 002 (profiles / auth.users)
-- DESCRIPTION :
--   Trois tables pour le système de cours et calendrier :
--     courses          → matière enseignée (ex: "Mathématiques - Terminale A")
--     course_schedules → horaires récurrents (ex: "Lundi 8h-9h")
--     course_sessions  → séances individuelles générées ou créées manuellement
--   Cette structure permet de gérer :
--     • L'emploi du temps hebdomadaire (schedules)
--     • Chaque séance de cours avec son statut (planifiée, terminée, annulée)
--     • Les séances de rattrapage (is_makeup = true) et les examens (is_exam = true)
-- ============================================================================


-- ============================================================================
-- SECTION A — TABLE: courses  (matières / cours)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(), -- ID unique du cours
  name          TEXT         NOT NULL,                              -- Nom du cours (ex: "Mathématiques")
  code          TEXT         NOT NULL UNIQUE,                       -- Code cours unique (ex: "MATH-TER-A")
  description   TEXT,                                               -- Description optionnelle
  class_id      INTEGER      NOT NULL                               -- FK vers la classe
                  REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id    UUID         NOT NULL                               -- FK vers le professeur
                  REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_year TEXT         NOT NULL,                              -- Année scolaire (ex: "2024-2025")
  semester      TEXT         CHECK (semester IN ('1','2','annual')), -- Semestre
  credits       INTEGER      DEFAULT 1,                              -- Nombre de crédits
  color         TEXT         DEFAULT '#3B82F6',                     -- Couleur affichée dans le calendrier
  is_active     BOOLEAN      DEFAULT true,                          -- Cours actif ou archivé
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index fréquents pour les jointures
CREATE INDEX IF NOT EXISTS idx_courses_class_id   ON public.courses(class_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_active  ON public.courses(is_active);

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- SECTION B — TABLE: course_schedules  (horaires récurrents)
-- Définit les créneaux hebdomadaires récurrents d'un cours.
-- Exemple : "Ce cours a lieu tous les lundis de 8h à 9h".
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.course_schedules (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID         NOT NULL
                    REFERENCES public.courses(id) ON DELETE CASCADE,
  day_of_week     INTEGER      NOT NULL                             -- 0=Dimanche, 1=Lundi ... 6=Samedi
                    CHECK (day_of_week BETWEEN 0 AND 6),
  start_time      TIME         NOT NULL,                           -- Heure de début (ex: 08:00)
  end_time        TIME         NOT NULL,                           -- Heure de fin   (ex: 09:00)
  room            TEXT,                                             -- Salle de cours (optionnel)
  is_active       BOOLEAN      DEFAULT true,                       -- Créneau actif ?
  effective_from  DATE         NOT NULL,                           -- Date de début de validité
  effective_until DATE,                                             -- Date de fin (NULL = illimité)
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_course_id ON public.course_schedules(course_id);


-- ============================================================================
-- SECTION C — TABLE: course_sessions  (séances individuelles)
-- Chaque séance concrète d'un cours (générée ou manuelle).
-- Exemple : "Séance du lundi 10 janvier 2025, 8h-9h, Salle 12, Statut: planifiée"
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.course_sessions (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID         NOT NULL
                   REFERENCES public.courses(id) ON DELETE CASCADE,
  schedule_id    UUID                                               -- FK optionnelle vers l'horaire source
                   REFERENCES public.course_schedules(id) ON DELETE SET NULL,
  session_date   DATE         NOT NULL,                            -- Date de la séance
  start_time     TIME         NOT NULL,                            -- Heure de début
  end_time       TIME         NOT NULL,                            -- Heure de fin
  room           TEXT,                                              -- Salle
  status         TEXT         NOT NULL DEFAULT 'scheduled'
                   CHECK (status IN ('scheduled','in_progress','completed','cancelled','rescheduled')),
  topic          TEXT,                                              -- Sujet du cours ce jour-là
  notes          TEXT,                                              -- Notes du professeur
  is_exam        BOOLEAN      DEFAULT false,                       -- Est-ce un examen ?
  is_makeup      BOOLEAN      DEFAULT false,                       -- Est-ce un cours de rattrapage ?
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_course_id    ON public.course_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON public.course_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_status       ON public.course_sessions(status);

DROP TRIGGER IF EXISTS trg_course_sessions_updated_at ON public.course_sessions;
CREATE TRIGGER trg_course_sessions_updated_at
  BEFORE UPDATE ON public.course_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- SECTION D — ROW LEVEL SECURITY : courses
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Admin : accès total
DROP POLICY IF EXISTS "courses: admin ALL" ON public.courses;
CREATE POLICY "courses: admin ALL"
  ON public.courses FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Professeur : lecture de SES cours uniquement
DROP POLICY IF EXISTS "courses: prof SELECT ses cours" ON public.courses;
CREATE POLICY "courses: prof SELECT ses cours"
  ON public.courses FOR SELECT
  USING (auth.uid() = teacher_id);

-- Professeur : peut créer un cours pour ses classes
DROP POLICY IF EXISTS "courses: prof INSERT ses cours" ON public.courses;
CREATE POLICY "courses: prof INSERT ses cours"
  ON public.courses FOR INSERT
  WITH CHECK (public.is_prof() AND auth.uid() = teacher_id);

-- Professeur : peut modifier SES propres cours
DROP POLICY IF EXISTS "courses: prof UPDATE ses cours" ON public.courses;
CREATE POLICY "courses: prof UPDATE ses cours"
  ON public.courses FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Élève : peut voir les cours de SA classe
DROP POLICY IF EXISTS "courses: élève SELECT sa classe" ON public.courses;
CREATE POLICY "courses: élève SELECT sa classe"
  ON public.courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se
      WHERE se.student_id = auth.uid()
        AND se.class_id = courses.class_id
    )
  );


-- ============================================================================
-- SECTION E — ROW LEVEL SECURITY : course_schedules
-- ============================================================================

ALTER TABLE public.course_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schedules: admin ALL" ON public.course_schedules;
CREATE POLICY "schedules: admin ALL"
  ON public.course_schedules FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "schedules: prof ses cours" ON public.course_schedules;
CREATE POLICY "schedules: prof ses cours"
  ON public.course_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_schedules.course_id
        AND c.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_schedules.course_id
        AND c.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "schedules: élève SELECT" ON public.course_schedules;
CREATE POLICY "schedules: élève SELECT"
  ON public.course_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.courses c
      JOIN public.student_enrollments se ON se.class_id = c.class_id
      WHERE c.id = course_schedules.course_id
        AND se.student_id = auth.uid()
    )
  );


-- ============================================================================
-- SECTION F — ROW LEVEL SECURITY : course_sessions
-- ============================================================================

ALTER TABLE public.course_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions: admin ALL" ON public.course_sessions;
CREATE POLICY "sessions: admin ALL"
  ON public.course_sessions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "sessions: prof ses cours" ON public.course_sessions;
CREATE POLICY "sessions: prof ses cours"
  ON public.course_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_sessions.course_id
        AND c.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_sessions.course_id
        AND c.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "sessions: élève SELECT sa classe" ON public.course_sessions;
CREATE POLICY "sessions: élève SELECT sa classe"
  ON public.course_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.courses c
      JOIN public.student_enrollments se ON se.class_id = c.class_id
      WHERE c.id = course_sessions.course_id
        AND se.student_id = auth.uid()
    )
  );
