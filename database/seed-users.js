/**
 * Seed Demo Users via Supabase Admin API
 *
 * Creates auth users with passwords and metadata so the
 * handle_new_user trigger automatically creates their
 * public.users profiles with the correct role/department.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJxxx \
 *   node database/seed-users.js
 *
 * Get the service role key from:
 *   https://app.supabase.com -> Project Settings -> API -> service_role
 */

const DEMO_USERS = [
  { email: 'admin@hotel.com',         password: 'admin123',     name: 'Admin User',      role: 'Administrator',      department: 'all' },
  { email: 'eng.manager@hotel.com',   password: 'manager123',   name: 'Eng Manager',     role: 'Department Manager', department: 'engineering' },
  { email: 'engineer1@hotel.com',     password: 'staff123',     name: 'Engineer One',    role: 'Staff',              department: 'engineering' },
  { email: 'hk.manager@hotel.com',    password: 'manager123',   name: 'HK Manager',      role: 'Department Manager', department: 'housekeeping' },
  { email: 'housekeeping1@hotel.com', password: 'staff123',     name: 'Housekeeper One', role: 'Staff',              department: 'housekeeping' },
  { email: 'fo.manager@hotel.com',    password: 'manager123',   name: 'FO Manager',      role: 'Department Manager', department: 'front-office' },
  { email: 'finance1@hotel.com',      password: 'staff123',     name: 'Finance Staff',   role: 'Staff',              department: 'finance' },
];

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  console.error('Usage:');
  console.error('  SUPABASE_URL=https://xxx.supabase.co \\');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJxxx \\');
  console.error('  node database/seed-users.js');
  process.exit(1);
}

async function createUser(user) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role,
        department: user.department,
      },
    }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log(`  ✓ ${user.email} (${user.role})`);
  } else if (data.msg?.includes('already registered') || data.code === 'email_exists') {
    console.log(`  · ${user.email} (already exists, skipped)`);
  } else {
    console.error(`  ✗ ${user.email}: ${data.msg || JSON.stringify(data)}`);
  }
}

async function main() {
  console.log('Seeding demo users...\n');
  for (const user of DEMO_USERS) {
    await createUser(user);
  }
  console.log('\nDone. The handle_new_user trigger creates public.users profiles automatically.');
  console.log('Default passwords:');
  console.log('  Admin: admin123');
  console.log('  Managers: manager123');
  console.log('  Staff: staff123');
}

main();
