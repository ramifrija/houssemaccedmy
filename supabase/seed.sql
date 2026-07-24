-- ============================================================================
-- FICHIER DE SEEDING / DONNÉES D'EXEMPLE — HOUSSEM ACADEMY
-- EXÉCUTER : dans le SQL Editor de Supabase (APRÈS avoir joué les 14 migrations)
-- DESCRIPTION :
--   Ce script génère un jeu complet de données de démonstration :
--     1. Niveaux académiques (Lycée, Collège)
--     2. Classes (Terminale S, 1ère ES, 3ème A)
--     3. Utilisateurs d'exemple (Admin, Profs, Élèves, Parents) dans auth.users et profiles
--     4. Inscriptions élèves ↔ classes (student_enrollments)
--     5. Assignations profs ↔ classes (teacher_classes)
--     6. Cours et horaires (courses, course_schedules, course_sessions)
--     7. Présences (attendance_sessions, attendance_records)
--     8. Notes (grades)
--     9. Annonces (announcements)
--    10. Messagerie (conversations, messages)
--    11. Notifications
-- ============================================================================


-- ============================================================================
-- ÉTAPE 1 — NIVEAUX ACADÉMIQUES (academic_levels)
-- ============================================================================

INSERT INTO public.academic_levels (id, name) VALUES
  (1, 'Lycée - Terminale'),
  (2, 'Lycée - Première'),
  (3, 'Collège - Troisième')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('public.academic_levels_id_seq', 3);


-- ============================================================================
-- ÉTAPE 2 — CLASSES (classes)
-- ============================================================================

INSERT INTO public.classes (id, name, academic_level_id) VALUES
  (1, 'Terminale Scientifique (TS1)', 1),
  (2, 'Première Économique (1ère ES)', 2),
  (3, 'Troisième A (3ème A)', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('public.classes_id_seq', 3);


-- ============================================================================
-- ÉTAPE 3 — CRÉATION DES UTILISATEURS DÉMO (auth.users et profiles)
-- UUIDs fixes générés pour maintenir une intégrité référentielle parfaite.
-- Mot de passe de démonstration pour tous les comptes : "Password123!"
-- ============================================================================

DO $$
DECLARE
  -- UUIDs de démonstration fixes
  v_admin_id    UUID := 'a1111111-1111-1111-1111-111111111111';
  v_prof1_id    UUID := 'b2222222-2222-2222-2222-222222222222';
  v_prof2_id    UUID := 'b3333333-3333-3333-3333-333333333333';
  v_eleve1_id   UUID := 'c4444444-4444-4444-4444-444444444444';
  v_eleve2_id   UUID := 'c5555555-5555-5555-5555-555555555555';
  v_eleve3_id   UUID := 'c6666666-6666-6666-6666-666666666666';
  v_parent1_id  UUID := 'd7777777-7777-7777-7777-777777777777';

  -- Hash bcrypt pour le mot de passe "Password123!"
  v_encrypted_pw TEXT := '$2a$10$wT8K4SgZ9FzYp3XyU1V8e.6nJ2Z9.Y5Lq.R9m1v5.X8Z7K6J5H4G3';
BEGIN

  -- --------------------------------------------------------------------------
  -- A. Insertion dans auth.users
  -- --------------------------------------------------------------------------

  -- 1. Admin Principal
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud)
  VALUES (v_admin_id, '00000000-0000-0000-0000-000000000000', 'houssemacademie@gmail.com', v_encrypted_pw, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Houssem","last_name":"Admin","role":"admin"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET created_at = COALESCE(auth.users.created_at, NOW()), updated_at = NOW();

  -- 2. Professeur 1 (Mathématiques)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud)
  VALUES (v_prof1_id, '00000000-0000-0000-0000-000000000000', 'prof.math@houssem.edu', v_encrypted_pw, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Karim","last_name":"Benali","role":"teacher"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET created_at = COALESCE(auth.users.created_at, NOW()), updated_at = NOW();

  -- 3. Professeur 2 (Physique)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud)
  VALUES (v_prof2_id, '00000000-0000-0000-0000-000000000000', 'prof.physique@houssem.edu', v_encrypted_pw, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Sarah","last_name":"Mansouri","role":"teacher"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET created_at = COALESCE(auth.users.created_at, NOW()), updated_at = NOW();

  -- 4. Élève 1 (Yassine)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud)
  VALUES (v_eleve1_id, '00000000-0000-0000-0000-000000000000', 'yassine.eleve@houssem.edu', v_encrypted_pw, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Yassine","last_name":"Trabelsi","role":"student"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET created_at = COALESCE(auth.users.created_at, NOW()), updated_at = NOW();

  -- 5. Élève 2 (Amina)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud)
  VALUES (v_eleve2_id, '00000000-0000-0000-0000-000000000000', 'amina.eleve@houssem.edu', v_encrypted_pw, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Amina","last_name":"Karray","role":"student"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET created_at = COALESCE(auth.users.created_at, NOW()), updated_at = NOW();

  -- 6. Élève 3 (Mehdi)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud)
  VALUES (v_eleve3_id, '00000000-0000-0000-0000-000000000000', 'mehdi.eleve@houssem.edu', v_encrypted_pw, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Mehdi","last_name":"Gharbi","role":"student"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET created_at = COALESCE(auth.users.created_at, NOW()), updated_at = NOW();

  -- 7. Parent (Parent de Yassine)
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role, aud)
  VALUES (v_parent1_id, '00000000-0000-0000-0000-000000000000', 'parent.trabelsi@gmail.com', v_encrypted_pw, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"first_name":"Mohamed","last_name":"Trabelsi","role":"parent"}', 'authenticated', 'authenticated')
  ON CONFLICT (id) DO UPDATE SET created_at = COALESCE(auth.users.created_at, NOW()), updated_at = NOW();



  -- --------------------------------------------------------------------------
  -- B. Insertion / Mise à jour des profils dans public.profiles (statut APPROVED)
  -- --------------------------------------------------------------------------

  INSERT INTO public.profiles (user_id, email, first_name, last_name, role_id, status) VALUES
    (v_admin_id,   'houssemacademie@gmail.com',  'Houssem', 'Admin',    1, 'approved'),
    (v_prof1_id,   'prof.math@houssem.edu',     'Karim',   'Benali',   2, 'approved'),
    (v_prof2_id,   'prof.physique@houssem.edu', 'Sarah',   'Mansouri', 2, 'approved'),
    (v_eleve1_id,  'yassine.eleve@houssem.edu', 'Yassine', 'Trabelsi', 3, 'approved'),
    (v_eleve2_id,  'amina.eleve@houssem.edu',   'Amina',   'Karray',   3, 'approved'),
    (v_eleve3_id,  'mehdi.eleve@houssem.edu',   'Mehdi',   'Gharbi',   3, 'approved'),
    (v_parent1_id, 'parent.trabelsi@gmail.com', 'Mohamed', 'Trabelsi', 4, 'approved')
  ON CONFLICT (user_id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    status = 'approved',
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

  -- Lier l'élève Yassine à son parent Mohamed
  UPDATE public.profiles SET parent_id = v_parent1_id WHERE user_id = v_eleve1_id;

  -- --------------------------------------------------------------------------
  -- C. Insertion des identités GoTrue (auth.identities)
  --    OBLIGATOIRE : sans ces entrées, GoTrue ne peut pas authentifier les
  --    comptes insérés directement en SQL (erreur 500 "database error querying schema")
  -- --------------------------------------------------------------------------

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_admin_id,   jsonb_build_object('sub', v_admin_id::text,   'email', 'houssemacademie@gmail.com'),  'email', v_admin_id::text,   NOW(), NOW(), NOW()),
    (gen_random_uuid(), v_prof1_id,   jsonb_build_object('sub', v_prof1_id::text,   'email', 'prof.math@houssem.edu'),       'email', v_prof1_id::text,   NOW(), NOW(), NOW()),
    (gen_random_uuid(), v_prof2_id,   jsonb_build_object('sub', v_prof2_id::text,   'email', 'prof.physique@houssem.edu'),   'email', v_prof2_id::text,   NOW(), NOW(), NOW()),
    (gen_random_uuid(), v_eleve1_id,  jsonb_build_object('sub', v_eleve1_id::text,  'email', 'yassine.eleve@houssem.edu'),  'email', v_eleve1_id::text,  NOW(), NOW(), NOW()),
    (gen_random_uuid(), v_eleve2_id,  jsonb_build_object('sub', v_eleve2_id::text,  'email', 'amina.eleve@houssem.edu'),    'email', v_eleve2_id::text,  NOW(), NOW(), NOW()),
    (gen_random_uuid(), v_eleve3_id,  jsonb_build_object('sub', v_eleve3_id::text,  'email', 'mehdi.eleve@houssem.edu'),    'email', v_eleve3_id::text,  NOW(), NOW(), NOW()),
    (gen_random_uuid(), v_parent1_id, jsonb_build_object('sub', v_parent1_id::text, 'email', 'parent.trabelsi@gmail.com'),  'email', v_parent1_id::text, NOW(), NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

END $$;



-- ============================================================================
-- ÉTAPE 4 — INSCRIPTIONS ÉLÈVES ↔ CLASSES (student_enrollments)
-- ============================================================================

INSERT INTO public.student_enrollments (student_id, class_id) VALUES
  ('c4444444-4444-4444-4444-444444444444', 1), -- Yassine en TS1
  ('c5555555-5555-5555-5555-555555555555', 1), -- Amina en TS1
  ('c6666666-6666-6666-6666-666666666666', 2)  -- Mehdi en 1ère ES
ON CONFLICT (student_id, class_id) DO NOTHING;


-- ============================================================================
-- ÉTAPE 5 — ASSIGNATIONS PROFESSEURS ↔ CLASSES (teacher_classes)
-- ============================================================================

INSERT INTO public.teacher_classes (teacher_id, class_id) VALUES
  ('b2222222-2222-2222-2222-222222222222', 1), -- Prof Benali (Maths) -> TS1
  ('b2222222-2222-2222-2222-222222222222', 2), -- Prof Benali (Maths) -> 1ère ES
  ('b3333333-3333-3333-3333-333333333333', 1)  -- Prof Mansouri (Physique) -> TS1
ON CONFLICT (teacher_id, class_id) DO NOTHING;


-- ============================================================================
-- ÉTAPE 6 — COURS (courses) ET EMPLOI DU TEMPS (course_schedules)
-- ============================================================================

DO $$
DECLARE
  v_course_math_id UUID := 'e1111111-1111-1111-1111-111111111111';
  v_course_phys_id UUID := 'e2222222-2222-2222-2222-222222222222';
BEGIN

  -- A. Cours
  INSERT INTO public.courses (id, name, code, description, class_id, teacher_id, academic_year, semester, color) VALUES
    (v_course_math_id, 'Mathématiques Avancées', 'MATH-TS1', 'Analyse, Algèbre et Géométrie dans l espace', 1, 'b2222222-2222-2222-2222-222222222222', '2024-2025', '1', '#3B82F6'),
    (v_course_phys_id, 'Physique - Chimie',     'PHYS-TS1', 'Mécanique newtonienne et Chimie organique',  1, 'b3333333-3333-3333-3333-333333333333', '2024-2025', '1', '#EF4444')
  ON CONFLICT (id) DO NOTHING;

  -- B. Horaires récurrents
  INSERT INTO public.course_schedules (course_id, day_of_week, start_time, end_time, room, effective_from) VALUES
    (v_course_math_id, 1, '08:00', '10:00', 'Salle 102', CURRENT_DATE - INTERVAL '30 days'), -- Lundi 8h-10h
    (v_course_phys_id, 3, '10:00', '12:00', 'Labo Phys 1', CURRENT_DATE - INTERVAL '30 days') -- Mercredi 10h-12h
  ON CONFLICT DO NOTHING;

  -- C. Sessions de cours (derniers jours)
  INSERT INTO public.course_sessions (course_id, session_date, start_time, end_time, room, status, topic) VALUES
    (v_course_math_id, CURRENT_DATE - INTERVAL '2 days', '08:00', '10:00', 'Salle 102', 'completed', 'Dérivées et études de fonctions'),
    (v_course_math_id, CURRENT_DATE + INTERVAL '5 days', '08:00', '10:00', 'Salle 102', 'scheduled', 'Intégrales et calcul d aires')
  ON CONFLICT DO NOTHING;

END $$;


-- ============================================================================
-- ÉTAPE 7 — PRÉSENCES (attendance_sessions & attendance_records)
-- ============================================================================

DO $$
DECLARE
  v_att_session_id UUID := 'f1111111-1111-1111-1111-111111111111';
BEGIN

  -- Session de prise de présence
  INSERT INTO public.attendance_sessions (id, class_id, teacher_id, subject, session_date, start_time, end_time, status, notes)
  VALUES (
    v_att_session_id, 1, 'b2222222-2222-2222-2222-222222222222', 'Mathématiques', CURRENT_DATE - INTERVAL '2 days', '08:00', '10:00', 'completed', 'Séance régulière - Chapitre 3'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Fiches de présence des élèves
  INSERT INTO public.attendance_records (session_id, student_id, status, notes, marked_by) VALUES
    (v_att_session_id, 'c4444444-4444-4444-4444-444444444444', 'present', 'Présent et très participatif', 'b2222222-2222-2222-2222-222222222222'),
    (v_att_session_id, 'c5555555-5555-5555-5555-555555555555', 'late',    'Retard de 15 minutes',        'b2222222-2222-2222-2222-222222222222')
  ON CONFLICT (session_id, student_id) DO NOTHING;

END $$;


-- ============================================================================
-- ÉTAPE 8 — NOTES (grades)
-- ============================================================================

INSERT INTO public.grades (student_id, teacher_id, course_id, subject, score, max_score, observations, term) VALUES
  ('c4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Mathématiques', 17.5, 20, 'Excellent travail au devoir surveillé n°1', 'Trimestre 1'),
  ('c5555555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Mathématiques', 14.0, 20, 'Bon travail, attention à la rédaction',    'Trimestre 1'),
  ('c4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'e2222222-2222-2222-2222-222222222222', 'Physique-Chimie',16.0, 20, 'Bonne maîtrise des TP de mécanique',      'Trimestre 1')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- ÉTAPE 9 — ANNONCES (announcements)
-- ============================================================================

INSERT INTO public.announcements (title, content, author_id, audience, priority) VALUES
  (
    'Bienvenue sur la plateforme Houssem Academy !',
    'Chers élèves, parents et professeurs, nous sommes ravis de vous accueillir sur notre nouvelle plateforme académique. Consultez vos emplois du temps et notes en ligne.',
    'a1111111-1111-1111-1111-111111111111',
    'all',
    'normal'
  ),
  (
    'Rappel : Devoir Surveillé de Mathématiques',
    'Le devoir surveillé de Mathématiques pour la classe de Terminale S aura lieu ce vendredi à 10h00 en Salle 102. N oubliez pas vos calculatrices.',
    'b2222222-2222-2222-2222-222222222222',
    'students',
    'high'
  )
ON CONFLICT DO NOTHING;


-- ============================================================================
-- ÉTAPE 10 — MESSAGERIE (conversations & messages)
-- ============================================================================

DO $$
DECLARE
  v_conv_id UUID := 'g1111111-1111-1111-1111-111111111111';
BEGIN

  -- Conversation entre Prof Benali et l'élève Yassine
  INSERT INTO public.conversations (id, is_group, created_by)
  VALUES (v_conv_id, false, 'b2222222-2222-2222-2222-222222222222')
  ON CONFLICT (id) DO NOTHING;

  -- Participants
  INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES
    (v_conv_id, 'b2222222-2222-2222-2222-222222222222'),
    (v_conv_id, 'c4444444-4444-4444-4444-444444444444')
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  -- Messages
  INSERT INTO public.messages (conversation_id, sender_id, content, sent_at) VALUES
    (v_conv_id, 'c4444444-4444-4444-4444-444444444444', 'Bonjour Monsieur, auriez-vous des exercices supplémentaires sur les intégrales ?', NOW() - INTERVAL '1 hour'),
    (v_conv_id, 'b2222222-2222-2222-2222-222222222222', 'Bonjour Yassine, oui je vais publier une fiche de révision cet après-midi.', NOW() - INTERVAL '30 minutes')
  ON CONFLICT DO NOTHING;

END $$;


-- ============================================================================
-- ÉTAPE 11 — NOTIFICATIONS
-- ============================================================================

INSERT INTO public.notifications (user_id, title, content, type, priority) VALUES
  ('c4444444-4444-4444-4444-444444444444', 'Nouvelle note disponible', 'Votre professeur M. Benali a ajouté une note en Mathématiques (17.5/20).', 'grade', 'high'),
  ('d7777777-7777-7777-7777-777777777777', 'Bulletin de présence',    'Yassine a été marqué présent au cours de Mathématiques du 20 Juillet.', 'attendance', 'normal')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- AFFICHAGE DU RÉSUMÉ DES COMPTES CRÉÉS (Identifiants de connexion)
-- ============================================================================
-- Tous les comptes créés utilisent le mot de passe : Password123!
--
--  Rôle       | Email                      | Mot de passe
--  -----------+----------------------------+--------------
--  Admin      | houssemacademie@gmail.com  | Password123!
--  Prof 1     | prof.math@houssem.edu      | Password123!
--  Prof 2     | prof.physique@houssem.edu  | Password123!
--  Élève 1    | yassine.eleve@houssem.edu  | Password123!
--  Élève 2    | amina.eleve@houssem.edu    | Password123!
--  Élève 3    | mehdi.eleve@houssem.edu    | Password123!
--  Parent 1   | parent.trabelsi@gmail.com  | Password123!
-- ============================================================================
