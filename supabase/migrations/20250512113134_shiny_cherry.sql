-- Drop existing users and roles
DELETE FROM user_roles;
DELETE FROM auth.users;

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
  'admin@admin.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"username","providers":["username"]}',
  '{"username": "admin"}',
  false,
  'authenticated'
);

-- Create qualidade user
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
  'qualidade@qualidade.com',
  crypt('qualidade123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"username","providers":["username"]}',
  '{"username": "qualidade"}',
  false,
  'authenticated'
);

-- Assign admin role to admin user
DO $$
DECLARE
  admin_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get the admin user id
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE raw_user_meta_data->>'username' = 'admin';

  -- Get the admin role id
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  -- Assign admin role to user
  INSERT INTO user_roles (user_id, role_id)
  VALUES (admin_user_id, admin_role_id);
END $$;