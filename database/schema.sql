-- HotelOS Database Schema for Supabase
-- Run this in the Supabase SQL Editor (SQL → New Query → Paste → Run)

-- Enable UUID generation
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

-- =====================================================
-- USERS
-- Links to Supabase auth.users via UUID foreign key
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Staff'
    CHECK (role IN ('Administrator', 'Department Manager', 'Staff', 'Guest')),
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
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open', 'in-progress', 'pending', 'resolved', 'closed')),
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
-- Timeline of status changes and assignments
-- =====================================================
CREATE TABLE ticket_history (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS
-- Department-scoped alerts tied to tickets
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
-- Discussion thread on each ticket
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

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- DEPARTMENTS: everyone can read
CREATE POLICY "departments_select" ON departments
  FOR SELECT USING (true);

-- USERS: everyone can read, admins can write
CREATE POLICY "users_select" ON users
  FOR SELECT USING (true);

CREATE POLICY "users_admin_insert" ON users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Administrator')
  );

CREATE POLICY "users_admin_update" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Administrator')
  );

CREATE POLICY "users_admin_delete" ON users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Administrator')
  );

-- TICKETS: role-based visibility
CREATE POLICY "tickets_admin_all" ON tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Administrator')
  );

CREATE POLICY "tickets_manager_select" ON tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'Department Manager'
        AND department = tickets.assigned_department
    )
  );

CREATE POLICY "tickets_manager_update" ON tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'Department Manager'
        AND department = tickets.assigned_department
    )
  );

CREATE POLICY "tickets_staff_select" ON tickets
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "tickets_staff_update" ON tickets
  FOR UPDATE USING (assigned_to = auth.uid());

CREATE POLICY "tickets_guest_select" ON tickets
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "tickets_authenticated_insert" ON tickets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- TICKET HISTORY: readable if ticket is readable, writable if ticket is writable
CREATE POLICY "ticket_history_select" ON ticket_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tickets WHERE id = ticket_history.ticket_id)
  );

CREATE POLICY "ticket_history_insert" ON ticket_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id)
  );

-- NOTIFICATIONS: department-scoped
CREATE POLICY "notifications_admin_select" ON notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Administrator')
  );

CREATE POLICY "notifications_manager_select" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'Department Manager'
        AND department = notifications.department
    )
  );

CREATE POLICY "notifications_staff_select" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'Staff'
        AND department = notifications.department
    )
  );

CREATE POLICY "notifications_authenticated_insert" ON notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "notifications_admin_delete" ON notifications
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Administrator')
  );

-- COMMENTS: readable with ticket, writable by authenticated users
CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tickets WHERE id = comments.ticket_id)
  );

CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- AUTO-UPDATE TRIGGER for tickets.updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
