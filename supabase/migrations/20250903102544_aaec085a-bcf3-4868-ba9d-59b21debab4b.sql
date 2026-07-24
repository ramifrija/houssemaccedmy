-- Ajouter des données de test pour rendre la page d'assiduité fonctionnelle

-- Créer quelques étudiants supplémentaires
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'ahmed.benali@test.com', 'encrypted', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'fatima.zohra@test.com', 'encrypted', NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'youssef.gharbi@test.com', 'encrypted', NOW(), NOW(), NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Créer les profils pour ces étudiants
INSERT INTO profiles (user_id, first_name, last_name, role_id)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Ahmed', 'Ben Ali', (SELECT id FROM user_roles WHERE role_name = 'student')),
  ('22222222-2222-2222-2222-222222222222', 'Fatima', 'Zohra', (SELECT id FROM user_roles WHERE role_name = 'student')),
  ('33333333-3333-3333-3333-333333333333', 'Youssef', 'Gharbi', (SELECT id FROM user_roles WHERE role_name = 'student'))
ON CONFLICT (user_id) DO NOTHING;

-- Inscrire ces étudiants dans la classe 1
INSERT INTO student_enrollments (student_id, class_id)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 1),
  ('22222222-2222-2222-2222-222222222222', 1),
  ('33333333-3333-3333-3333-333333333333', 1)
ON CONFLICT DO NOTHING;

-- Créer une nouvelle session d'assiduité pour aujourd'hui
INSERT INTO attendance_sessions (id, class_id, teacher_id, subject, session_date, start_time, end_time, status)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  1,
  (SELECT user_id FROM profiles WHERE role_id = (SELECT id FROM user_roles WHERE role_name = 'prof') LIMIT 1),
  'Mathématiques',
  CURRENT_DATE,
  '08:00:00',
  '09:00:00',
  'scheduled'
) ON CONFLICT (id) DO NOTHING;

-- Créer les enregistrements d'assiduité pour tous les étudiants de la classe 1
INSERT INTO attendance_records (session_id, student_id, status)
SELECT 
  '44444444-4444-4444-4444-444444444444',
  se.student_id,
  CASE 
    WHEN se.student_id = '11111111-1111-1111-1111-111111111111' THEN 'present'
    WHEN se.student_id = '22222222-2222-2222-2222-222222222222' THEN 'absent'  
    WHEN se.student_id = '33333333-3333-3333-3333-333333333333' THEN 'late'
    ELSE 'absent'
  END
FROM student_enrollments se 
WHERE se.class_id = 1
ON CONFLICT DO NOTHING;