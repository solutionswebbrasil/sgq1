/*
  # Add Admin User and Role Assignment

  1. Changes
    - Create admin user if it doesn't exist
    - Assign admin role to user
    
  2. Security
    - Uses secure password hashing
    - Handles existing user case
*/

DO $$
DECLARE
  admin_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Only create admin user if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@admin'
  ) THEN
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
  END IF;

  -- Get the admin user id
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@admin';

  -- Get the admin role id
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  -- Only assign role if not already assigned
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = admin_user_id 
    AND role_id = admin_role_id
  ) THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id);
  END IF;
END $$;