-- HotelOS Seed Data
-- Run AFTER schema.sql

-- =====================================================
-- DEPARTMENTS
-- =====================================================
INSERT INTO departments (id, name, icon) VALUES
  ('engineering',   'Engineering',   '🔧'),
  ('housekeeping',  'Housekeeping',  '🧹'),
  ('front-office',  'Front Office',  '🛎️'),
  ('it',            'IT',            '💻'),
  ('fb',            'F&B',           '🍽️'),
  ('security',      'Security',      '🔒'),
  ('hr',            'HR',            '👥'),
  ('finance',       'Finance',       '💰')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DEMO USERS
--
-- The handle_new_user trigger automatically creates a
-- public.users profile when an auth user is created.
-- Use ONE of these methods to create auth users:
--
-- METHOD 1: Supabase Dashboard (manual)
--   Go to: Authentication → Users → Invite user
--   Create each user with the email and a password.
--   The trigger creates the profile automatically.
--
-- METHOD 2: seed-users.js (automated)
--   Run: node database/seed-users.js
--   This uses the Supabase Admin API to create users
--   with the correct metadata for roles/departments.
--
-- METHOD 3: SQL helper below (if auth users exist)
--   If you already created auth users in the Dashboard,
--   call set_seed_user_role() to set their role/department.
--   The trigger may have already created profiles with
--   default values; this function updates them.
-- =====================================================

-- Helper function: update a user's role and department
-- Call this after creating auth users in the Dashboard.
-- Example:
--   SELECT set_seed_user_role('admin@hotel.com', 'Administrator', 'all');

CREATE OR REPLACE FUNCTION set_seed_user_role(
  user_email TEXT,
  user_name TEXT,
  user_role TEXT,
  user_department TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET name = user_name,
      role = user_role,
      department = user_department
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- If auth users already exist, uncomment and run these:
-- SELECT set_seed_user_role('admin@hotel.com',         'Admin User',      'Administrator',      'all');
-- SELECT set_seed_user_role('eng.manager@hotel.com',    'Eng Manager',     'Department Manager', 'engineering');
-- SELECT set_seed_user_role('engineer1@hotel.com',      'Engineer One',    'Staff',              'engineering');
-- SELECT set_seed_user_role('hk.manager@hotel.com',     'HK Manager',      'Department Manager', 'housekeeping');
-- SELECT set_seed_user_role('housekeeping1@hotel.com',  'Housekeeper One', 'Staff',              'housekeeping');
-- SELECT set_seed_user_role('fo.manager@hotel.com',     'FO Manager',      'Department Manager', 'front-office');
-- SELECT set_seed_user_role('finance1@hotel.com',       'Finance Staff',   'Staff',              'finance');
