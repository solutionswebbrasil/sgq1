/*
  # Create Initial Admin User

  1. Changes
    - Create admin user with email admin@admin
    - Assign admin role to the user
    
  2. Security
    - Password is hashed using Supabase auth
    - User is automatically confirmed
*/

-- Create admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@admin',
  crypt('admin', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
);

-- Get the admin user id
DO $$
DECLARE
  admin_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get the admin user id
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@admin';

  -- Get the admin role id
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  -- Assign admin role to user
  INSERT INTO user_roles (user_id, role_id)
  VALUES (admin_user_id, admin_role_id);
END $$;