# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose organization and enter:
   - Project name: `hotel-ops`
   - Database password: (choose a strong password)
   - Region: (closest to your users)
5. Click "Create Project" and wait ~2 minutes

## Step 2: Get API Credentials

1. Go to Project Settings → API
2. Copy the **Project URL** (looks like `https://xxxx.supabase.co`)
3. Copy the **anon/public** key (long string starting with `eyJ...`)

## Step 3: Set Up Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Click "New Query"
3. Copy the contents of `supabase-schema.sql`
4. Paste and click "Run"
5. Verify tables created: departments, users, tickets, ticket_history, notifications, comments

## Step 4: Create Demo Users

In Supabase Dashboard → Authentication → Users → Invite user:

| Email | Name | Role | Department |
|-------|------|------|------------|
| admin@hotel.com | Admin User | Administrator | all |
| eng.manager@hotel.com | Eng Manager | Department Manager | engineering |
| engineer1@hotel.com | Engineer One | Staff | engineering |
| hk.manager@hotel.com | HK Manager | Department Manager | housekeeping |
| housekeeping1@hotel.com | Housekeeper One | Staff | housekeeping |
| fo.manager@hotel.com | FO Manager | Department Manager | front-office |
| finance1@hotel.com | Finance Staff | Staff | finance |

After creating auth users, insert into `users` table:

```sql
-- Run after creating auth users (replace UUIDs with actual auth user IDs)
INSERT INTO users (id, name, email, role, department) VALUES
  ('auth-uuid-1', 'Admin User', 'admin@hotel.com', 'Administrator', 'all'),
  ('auth-uuid-2', 'Eng Manager', 'eng.manager@hotel.com', 'Department Manager', 'engineering'),
  ('auth-uuid-3', 'Engineer One', 'engineer1@hotel.com', 'Staff', 'engineering'),
  ('auth-uuid-4', 'HK Manager', 'hk.manager@hotel.com', 'Department Manager', 'housekeeping'),
  ('auth-uuid-5', 'Housekeeper One', 'housekeeping1@hotel.com', 'Staff', 'housekeeping'),
  ('auth-uuid-6', 'FO Manager', 'fo.manager@hotel.com', 'Department Manager', 'front-office'),
  ('auth-uuid-7', 'Finance Staff', 'finance1@hotel.com', 'Staff', 'finance');
```

## Step 5: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your Supabase URL and anon key
3. For GitHub Pages: add secrets in repo Settings → Secrets

## Step 6: Test

1. Open `index.html` in browser
2. Log in with a demo user
3. Create a ticket
4. Verify it appears in Supabase dashboard → Table Editor → tickets

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│  index.html  │────▶│ supabase-client │────▶│   Supabase   │
│   app.js     │     │      .js        │     │   Database   │
│  guest.js    │     └─────────────────┘     └──────────────┘
└─────────────┘              │
                             ▼
                     ┌───────────────┐
                     │  Supabase CDN │
                     └───────────────┘
```

## Troubleshooting

- **CORS errors**: Add your domain to Supabase → Settings → API → CORS
- **RLS errors**: Check policies in Authentication → Policies
- **Auth errors**: Verify user exists in both auth.users and public.users tables
