-- Inscrire l'étudiant trouvé dans la classe 1
INSERT INTO public.student_enrollments (id, student_id, class_id)
VALUES (gen_random_uuid(), '5a8a4074-8f4e-4201-aeb4-67f1e5e4ef1a', 1);

-- Créer une nouvelle session de test avec des fiches de présence
SELECT public.create_test_attendance_session(
  1, -- class_id
  '1bdc3e2c-4e47-4beb-b6dc-f9c58c6057d7'::UUID, -- teacher_id
  'Test avec étudiant inscrit'
) as new_session_id;