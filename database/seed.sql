-- HotelOS Seed Data
-- Run AFTER schema.sql and AFTER creating auth users in Supabase Dashboard

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
-- Before running this, create auth users in:
--   Supabase Dashboard → Authentication → Users → Invite user
--
-- Create these 7 auth users with any password you choose:
--   admin@hotel.com
--   eng.manager@hotel.com
--   engineer1@hotel.com
--   hk.manager@hotel.com
--   housekeeping1@hotel.com
--   fo.manager@hotel.com
--   finance1@hotel.com
--
-- Then replace the UUIDs below with the actual auth user IDs
-- from the Authentication → Users table.
-- =====================================================

-- Replace these placeholder UUIDs with real auth user IDs:
--   '00000000-0000-0000-0000-000000000001' → admin@hotel.com
--   '00000000-0000-0000-0000-000000000002' → eng.manager@hotel.com
--   '00000000-0000-0000-0000-000000000003' → engineer1@hotel.com
--   '00000000-0000-0000-0000-000000000004' → hk.manager@hotel.com
--   '00000000-0000-0000-0000-000000000005' → housekeeping1@hotel.com
--   '00000000-0000-0000-0000-000000000006' → fo.manager@hotel.com
--   '00000000-0000-0000-0000-000000000007' → finance1@hotel.com

INSERT INTO users (id, name, email, role, department) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin User',      'admin@hotel.com',          'Administrator',      'all'),
  ('00000000-0000-0000-0000-000000000002', 'Eng Manager',     'eng.manager@hotel.com',    'Department Manager', 'engineering'),
  ('00000000-0000-0000-0000-000000000003', 'Engineer One',    'engineer1@hotel.com',      'Staff',              'engineering'),
  ('00000000-0000-0000-0000-000000000004', 'HK Manager',      'hk.manager@hotel.com',     'Department Manager', 'housekeeping'),
  ('00000000-0000-0000-0000-000000000005', 'Housekeeper One', 'housekeeping1@hotel.com',  'Staff',              'housekeeping'),
  ('00000000-0000-0000-0000-000000000006', 'FO Manager',      'fo.manager@hotel.com',     'Department Manager', 'front-office'),
  ('00000000-0000-0000-0000-000000000007', 'Finance Staff',   'finance1@hotel.com',       'Staff',              'finance')
ON CONFLICT (id) DO NOTHING;
