/*
  # Add Admin System Tables

  1. New Tables
    - `roles`: Stores user roles (admin, user, etc.)
    - `permissions`: Stores available system permissions
    - `user_roles`: Maps users to roles
    - `role_permissions`: Maps roles to permissions
    - `database_configs`: Stores external database configurations
    
  2. Security
    - Enable RLS on all tables
    - Add policies for admin users
*/

-- Create roles table
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  module text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id, role_id)
);

-- Create role_permissions table
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(role_id, permission_id)
);

-- Create database_configs table
CREATE TABLE database_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host text NOT NULL,
  port integer NOT NULL,
  database_name text NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "roles_admin_all" ON roles
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  ));

-- Repeat similar policies for other tables
CREATE POLICY "permissions_admin_all" ON permissions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  ));

CREATE POLICY "user_roles_admin_all" ON user_roles FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  ));

CREATE POLICY "role_permissions_admin_all" ON role_permissions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  ));

CREATE POLICY "database_configs_admin_all" ON database_configs FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  ));

-- Insert initial admin role and permissions
INSERT INTO roles (name, description) 
VALUES ('admin', 'System administrator with full access');

INSERT INTO permissions (name, description, module) VALUES
  ('users.view', 'View users', 'users'),
  ('users.create', 'Create users', 'users'),
  ('users.edit', 'Edit users', 'users'),
  ('users.delete', 'Delete users', 'users'),
  ('roles.view', 'View roles', 'roles'),
  ('roles.manage', 'Manage roles', 'roles'),
  ('database.view', 'View database settings', 'database'),
  ('database.manage', 'Manage database settings', 'database'),
  ('toners.view', 'View toners', 'toners'),
  ('toners.manage', 'Manage toners', 'toners'),
  ('unidades.view', 'View units', 'unidades'),
  ('unidades.manage', 'Manage units', 'unidades'),
  ('auditorias.view', 'View audits', 'auditorias'),
  ('auditorias.manage', 'Manage audits', 'auditorias'),
  ('garantias.view', 'View warranties', 'garantias'),
  ('garantias.manage', 'Manage warranties', 'garantias'),
  ('movimentacoes.view', 'View movements', 'movimentacoes'),
  ('movimentacoes.manage', 'Manage movements', 'movimentacoes'),
  ('retornados.view', 'View returns', 'retornados'),
  ('retornados.manage', 'Manage returns', 'retornados'),
  ('tco.view', 'View TCO', 'tco'),
  ('tco.manage', 'Manage TCO', 'tco'),
  ('nc.view', 'View NC', 'nc'),
  ('nc.manage', 'Manage NC', 'nc');