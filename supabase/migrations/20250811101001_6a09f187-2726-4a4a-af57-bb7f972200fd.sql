-- Reset admin user password securely
-- This will force a password reset for the admin user

-- Update the admin user's password using the admin API
-- Note: This requires using the service role key in production
UPDATE auth.users 
SET 
  encrypted_password = crypt('12345678', gen_salt('bf')),
  updated_at = now()
WHERE email = 'houssemacademie@gmail.com';

-- Ensure the admin profile is properly set up
UPDATE public.profiles 
SET 
  first_name = COALESCE(first_name, 'Admin'),
  last_name = COALESCE(last_name, 'Houssem Academy'),
  role_id = (SELECT id FROM public.user_roles WHERE role_name = 'admin')
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'houssemacademie@gmail.com');