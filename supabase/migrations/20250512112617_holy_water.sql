/*
  # Update Authentication System

  1. Changes
    - Create admin and qualidade users with username/password
    - Assign appropriate roles
    
  2. Security
    - Store encrypted passwords
    - Assign admin role to admin user
*/

DO $$
DECLARE
  admin_user_id uuid;
  qualidade_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Only create admin user if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE raw_user_meta_data->>'username' = 'admin'
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
      'admin@' || gen_random_uuid() || '.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"username","providers":["username"]}',
      '{"username": "admin"}',
      false,
      'authenticated'
    ) RETURNING id INTO admin_user_id;
  END IF;

  -- Create qualidade user if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE raw_user_meta_data->>'username' = 'qualidade'
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
      'qualidade@' || gen_random_uuid() || '.com',
      crypt('qualidade123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"username","providers":["username"]}',
      '{"username": "qualidade"}',
      false,
      'authenticated'
    ) RETURNING id INTO qualidade_user_id;
  END IF;

  -- Get user IDs if not already set
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE raw_user_meta_data->>'username' = 'admin';
  END IF;

  IF qualidade_user_id IS NULL THEN
    SELECT id INTO qualidade_user_id
    FROM auth.users
    WHERE raw_user_meta_data->>'username' = 'qualidade';
  END IF;

  -- Get the admin role id
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  -- Assign admin role to admin user if not already assigned
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = admin_user_id 
    AND role_id = admin_role_id
  ) THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id);
  END IF;
END $$;