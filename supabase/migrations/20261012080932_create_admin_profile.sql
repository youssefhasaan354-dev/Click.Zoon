/*
# Create admin profile for existing admin user

1. Inserts a profile row for the existing admin user (youssefhasaan354@gmail.com)
   with role='admin' so that is_admin() returns true for them.
2. This is a one-time data migration — the trigger will handle all future signups.
*/

INSERT INTO public.profiles (id, full_name, phone, role)
SELECT id, split_part(email, '@', 1), '0000000000', 'admin'
FROM auth.users
WHERE email = 'youssefhasaan354@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
