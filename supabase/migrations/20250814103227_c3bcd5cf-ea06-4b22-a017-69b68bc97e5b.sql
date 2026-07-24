
-- Vérifier et mettre à jour le rôle de l'administrateur
UPDATE public.profiles 
SET role_id = (SELECT id FROM public.user_roles WHERE role_name = 'admin')
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'houssemacademie@gmail.com')
  AND role_id IS NULL;

-- Vérifier que le profil existe et a bien le bon rôle
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  p.role_id,
  ur.role_name
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.role_id = ur.id
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'houssemacademie@gmail.com');
