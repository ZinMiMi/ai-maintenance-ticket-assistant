-- HotelOS Supabase Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DEPARTMENTS
-- =====================================================
CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO departments (id, name, icon) VALUES
  ('engineering', 'Engineering', '🔧'),
  ('housekeeping', 'Housekeeping', '🧹'),
  ('front-office', 'Front Office', '🛎️'),
  ('it', 'IT', '💻'),
  ('fb', 'F&B', '🍽️'),
  ('security', 'Security', '🔒'),
  ('hr', 'HR', '👥'),
  ('finance', 'Finance', '💰');

-- =====================================================
-- USERS (extends Supabase auth.users)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Staff' CHECK (role IN ('Administrator', 'Department Manager', 'Staff', 'Guest')),
  department TEXT REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TICKETS
-- =====================================================
CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT REFERENCES departments(id),
  category TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'pending', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users(id),
  assigned_department TEXT REFERENCES departments(id),
  created_by UUID REFERENCES users(id),
  eta TEXT,
  image_url TEXT,
  source TEXT DEFAULT 'staff',
  guest_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TICKET HISTORY
-- =====================================================
CREATE TABLE ticket_history (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  department TEXT REFERENCES departments(id),
  ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMENTS
-- =====================================================
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_department ON tickets(assigned_department);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);
CREATE INDEX idx_notifications_department ON notifications(department);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users: can read all, admins can write all
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Administrator')
);

-- Tickets: role-based access
CREATE POLICY "Admins can do all with tickets" ON tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Administrator')
);
CREATE POLICY "Managers can read department tickets" ON tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Department Manager' AND department = tickets.assigned_department)
);
CREATE POLICY "Staff can read assigned tickets" ON tickets FOR SELECT USING (
  assigned_to = auth.uid()
);
CREATE POLICY "Guests can read own tickets" ON tickets FOR SELECT USING (
  created_by = auth.uid()
);
CREATE POLICY "Authenticated users can create tickets" ON tickets FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Managers can update department tickets" ON tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Department Manager' AND department = tickets.assigned_department)
);
CREATE POLICY "Staff can update assigned tickets" ON tickets FOR UPDATE USING (
  assigned_to = auth.uid()
);

-- Ticket history: read with ticket, write if ticket accessible
CREATE POLICY "Read history with ticket access" ON ticket_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM tickets WHERE id = ticket_history.ticket_id)
);
CREATE POLICY "Insert history with ticket access" ON ticket_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id)
);

-- Notifications: department-based
CREATE POLICY "Admins can read all notifications" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Administrator')
);
CREATE POLICY "Managers can read department notifications" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Department Manager' AND department = notifications.department)
);
CREATE POLICY "Staff can read department notifications" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Staff' AND department = notifications.department)
);
CREATE POLICY "Authenticated users can create notifications" ON notifications FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Users can update notifications" ON notifications FOR UPDATE USING (
  auth.uid() IS NOT NULL
);
CREATE POLICY "Admins can delete notifications" ON notifications FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Administrator')
);

-- Comments: read with ticket, write if authenticated
CREATE POLICY "Read comments with ticket access" ON comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM tickets WHERE id = comments.ticket_id)
);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
