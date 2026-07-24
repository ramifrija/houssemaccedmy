-- ============================================================================
-- COMPLETE BACKEND IMPLEMENTATION
-- Gestion des Présences, Calendrier, Notifications, et Export
-- ============================================================================

-- ============================================================================
-- 1. GESTION DES PRÉSENCES
-- ============================================================================

-- Table pour les sessions d'attendance (cours où on prend les présences)
CREATE TABLE public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id BIGINT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les enregistrements de présence individuels
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  arrival_time TIME,
  notes TEXT,
  marked_by UUID REFERENCES auth.users(id),
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- ============================================================================
-- 2. CALENDRIER DE COURS
-- ============================================================================

-- Table pour les cours (matières enseignées)
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  class_id BIGINT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  semester TEXT CHECK (semester IN ('1', '2', 'annual')),
  credits INTEGER DEFAULT 1,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les horaires récurrents des cours
CREATE TABLE public.course_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dimanche, 1=Lundi, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL,
  effective_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les sessions individuelles de cours (générées automatiquement ou manuelles)
CREATE TABLE public.course_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.course_schedules(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
  topic TEXT,
  notes TEXT,
  is_exam BOOLEAN DEFAULT false,
  is_makeup BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. NOTIFICATIONS
-- ============================================================================

-- Table pour les modèles de notifications
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  content_template TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('attendance', 'grade', 'announcement', 'reminder', 'system')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les paramètres de notification des utilisateurs
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  attendance_notifications BOOLEAN DEFAULT true,
  grade_notifications BOOLEAN DEFAULT true,
  announcement_notifications BOOLEAN DEFAULT true,
  reminder_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table pour les notifications individuelles
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('attendance', 'grade', 'announcement', 'reminder', 'system')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  related_id UUID, -- ID de l'objet lié (cours, présence, etc.)
  related_table TEXT, -- nom de la table liée
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour l'historique d'export des données
CREATE TABLE public.data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('attendance', 'grades', 'students', 'courses', 'full')),
  file_name TEXT NOT NULL,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  filters JSONB,
  error_message TEXT,
  file_size BIGINT,
  download_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - ATTENDANCE
-- ============================================================================

-- Attendance Sessions
CREATE POLICY "Teachers can manage their attendance sessions" ON public.attendance_sessions
  FOR ALL USING (teacher_id = auth.uid() OR is_admin());

CREATE POLICY "Students can view their class attendance sessions" ON public.attendance_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se 
      WHERE se.student_id = auth.uid() AND se.class_id = attendance_sessions.class_id
    )
  );

-- Attendance Records
CREATE POLICY "Teachers can manage attendance records for their sessions" ON public.attendance_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.attendance_sessions ats 
      WHERE ats.id = attendance_records.session_id AND (ats.teacher_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Students can view their own attendance records" ON public.attendance_records
  FOR SELECT USING (student_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - COURSES
-- ============================================================================

-- Courses
CREATE POLICY "Teachers can manage their courses" ON public.courses
  FOR ALL USING (teacher_id = auth.uid() OR is_admin());

CREATE POLICY "Students can view courses for their classes" ON public.courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments se 
      WHERE se.student_id = auth.uid() AND se.class_id = courses.class_id
    )
  );

-- Course Schedules
CREATE POLICY "Teachers can manage schedules for their courses" ON public.course_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_schedules.course_id AND (c.teacher_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Students can view schedules for their courses" ON public.course_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.student_enrollments se ON se.class_id = c.class_id
      WHERE c.id = course_schedules.course_id AND se.student_id = auth.uid()
    )
  );

-- Course Sessions
CREATE POLICY "Teachers can manage sessions for their courses" ON public.course_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_sessions.course_id AND (c.teacher_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Students can view sessions for their courses" ON public.course_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.student_enrollments se ON se.class_id = c.class_id
      WHERE c.id = course_sessions.course_id AND se.student_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================================================

-- Notification Templates
CREATE POLICY "Only admins can manage notification templates" ON public.notification_templates
  FOR ALL USING (is_admin());

CREATE POLICY "All authenticated users can read templates" ON public.notification_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Notification Settings
CREATE POLICY "Users can manage their own notification settings" ON public.notification_settings
  FOR ALL USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (is_admin());

-- Data Exports
CREATE POLICY "Users can manage their own exports" ON public.data_exports
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all exports" ON public.data_exports
  FOR SELECT USING (is_admin());

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Attendance indexes
CREATE INDEX idx_attendance_sessions_class_date ON public.attendance_sessions(class_id, session_date);
CREATE INDEX idx_attendance_sessions_teacher ON public.attendance_sessions(teacher_id);
CREATE INDEX idx_attendance_records_session ON public.attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON public.attendance_records(student_id);

-- Course indexes
CREATE INDEX idx_courses_class ON public.courses(class_id);
CREATE INDEX idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX idx_course_schedules_course ON public.course_schedules(course_id);
CREATE INDEX idx_course_schedules_day ON public.course_schedules(day_of_week, start_time);
CREATE INDEX idx_course_sessions_course ON public.course_sessions(course_id);
CREATE INDEX idx_course_sessions_date ON public.course_sessions(session_date);

-- Notification indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_scheduled ON public.notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

-- Attendance Sessions
CREATE TRIGGER update_attendance_sessions_updated_at
  BEFORE UPDATE ON public.attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Courses
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Course Sessions
CREATE TRIGGER update_course_sessions_updated_at
  BEFORE UPDATE ON public.course_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notification Settings
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR ATTENDANCE MANAGEMENT
-- ============================================================================

-- Fonction pour créer une session d'attendance
CREATE OR REPLACE FUNCTION public.create_attendance_session(
  p_class_id BIGINT,
  p_subject TEXT,
  p_session_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session_id UUID;
  v_user_role TEXT;
BEGIN
  -- Vérifier que l'utilisateur est professeur ou admin
  SELECT ur.role_name INTO v_user_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = auth.uid();
  
  IF v_user_role NOT IN ('prof', 'admin') THEN
    RAISE EXCEPTION 'Permission denied: Only teachers and admins can create attendance sessions';
  END IF;

  -- Créer la session
  INSERT INTO public.attendance_sessions (
    class_id, teacher_id, subject, session_date, start_time, end_time, notes
  ) VALUES (
    p_class_id, auth.uid(), p_subject, p_session_date, p_start_time, p_end_time, p_notes
  ) RETURNING id INTO v_session_id;

  -- Créer automatiquement les enregistrements pour tous les étudiants de la classe
  INSERT INTO public.attendance_records (session_id, student_id, status)
  SELECT v_session_id, se.student_id, 'absent'
  FROM public.student_enrollments se
  WHERE se.class_id = p_class_id;

  RETURN v_session_id;
END;
$$;

-- Fonction pour marquer la présence
CREATE OR REPLACE FUNCTION public.mark_attendance(
  p_session_id UUID,
  p_student_id UUID,
  p_status TEXT,
  p_arrival_time TIME DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_role TEXT;
BEGIN
  -- Vérifier que l'utilisateur est professeur ou admin
  SELECT ur.role_name INTO v_user_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.user_id = auth.uid();
  
  IF v_user_role NOT IN ('prof', 'admin') THEN
    RAISE EXCEPTION 'Permission denied: Only teachers and admins can mark attendance';
  END IF;

  -- Mettre à jour l'enregistrement de présence
  UPDATE public.attendance_records 
  SET 
    status = p_status,
    arrival_time = p_arrival_time,
    notes = p_notes,
    marked_by = auth.uid(),
    marked_at = NOW()
  WHERE session_id = p_session_id AND student_id = p_student_id;

  RETURN FOUND;
END;
$$;

-- ============================================================================
-- FUNCTIONS FOR COURSE MANAGEMENT
-- ============================================================================

-- Fonction pour générer les sessions de cours basées sur les horaires
CREATE OR REPLACE FUNCTION public.generate_course_sessions(
  p_course_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_schedule RECORD;
  v_current_date DATE;
  v_sessions_created INTEGER := 0;
BEGIN
  -- Vérifier les permissions
  IF NOT (is_admin() OR is_prof()) THEN
    RAISE EXCEPTION 'Permission denied: Only teachers and admins can generate course sessions';
  END IF;

  -- Pour chaque horaire du cours
  FOR v_schedule IN 
    SELECT * FROM public.course_schedules 
    WHERE course_id = p_course_id AND is_active = true
  LOOP
    v_current_date := p_start_date;
    
    -- Générer les sessions pour chaque occurrence
    WHILE v_current_date <= p_end_date LOOP
      -- Vérifier si c'est le bon jour de la semaine
      IF EXTRACT(DOW FROM v_current_date) = v_schedule.day_of_week THEN
        -- Insérer la session si elle n'existe pas déjà
        INSERT INTO public.course_sessions (
          course_id, schedule_id, session_date, start_time, end_time, room
        )
        SELECT 
          p_course_id, v_schedule.id, v_current_date, 
          v_schedule.start_time, v_schedule.end_time, v_schedule.room
        WHERE NOT EXISTS (
          SELECT 1 FROM public.course_sessions 
          WHERE course_id = p_course_id 
          AND session_date = v_current_date
          AND start_time = v_schedule.start_time
        );
        
        IF FOUND THEN
          v_sessions_created := v_sessions_created + 1;
        END IF;
      END IF;
      
      v_current_date := v_current_date + INTERVAL '1 day';
    END LOOP;
  END LOOP;

  RETURN v_sessions_created;
END;
$$;

-- ============================================================================
-- FUNCTIONS FOR NOTIFICATIONS
-- ============================================================================

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_type TEXT,
  p_priority TEXT DEFAULT 'normal',
  p_related_id UUID DEFAULT NULL,
  p_related_table TEXT DEFAULT NULL,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, content, type, priority, related_id, related_table, scheduled_for
  ) VALUES (
    p_user_id, p_title, p_content, p_type, p_priority, p_related_id, p_related_table, p_scheduled_for
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Fonction pour marquer une notification comme lue
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, read_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();

  RETURN FOUND;
END;
$$;

-- ============================================================================
-- FUNCTIONS FOR DATA EXPORT
-- ============================================================================

-- Fonction pour créer une demande d'export
CREATE OR REPLACE FUNCTION public.request_data_export(
  p_export_type TEXT,
  p_filters JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_export_id UUID;
  v_file_name TEXT;
BEGIN
  -- Générer le nom du fichier
  v_file_name := p_export_type || '_export_' || 
                 to_char(NOW(), 'YYYY_MM_DD_HH24_MI_SS') || 
                 '_' || substr(gen_random_uuid()::text, 1, 8) || '.csv';

  -- Créer l'enregistrement d'export
  INSERT INTO public.data_exports (
    user_id, export_type, file_name, filters, expires_at
  ) VALUES (
    auth.uid(), p_export_type, v_file_name, p_filters, NOW() + INTERVAL '7 days'
  ) RETURNING id INTO v_export_id;

  RETURN v_export_id;
END;
$$;

-- ============================================================================
-- INSERT DEFAULT NOTIFICATION TEMPLATES
-- ============================================================================

INSERT INTO public.notification_templates (name, title_template, content_template, type) VALUES
('attendance_absent', 'Absence remarquée', 'Votre absence a été notée pour le cours {{course_name}} du {{date}}.', 'attendance'),
('attendance_late', 'Retard noté', 'Votre retard a été noté pour le cours {{course_name}} du {{date}}.', 'attendance'),
('course_cancelled', 'Cours annulé', 'Le cours {{course_name}} du {{date}} à {{time}} a été annulé.', 'announcement'),
('course_rescheduled', 'Cours reporté', 'Le cours {{course_name}} a été reporté du {{old_date}} au {{new_date}}.', 'announcement'),
('exam_reminder', 'Rappel d''examen', 'N''oubliez pas votre examen de {{course_name}} le {{date}} à {{time}}.', 'reminder');

-- ============================================================================
-- ENABLE EXTENSIONS FOR SCHEDULING (if needed later)
-- ============================================================================

-- Ces extensions peuvent être activées plus tard pour les tâches programmées
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;