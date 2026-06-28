/**
 * Supabase Client
 *
 * Loads the Supabase JS library from CDN and creates a client instance.
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project credentials.
 *
 * Get these from: https://app.supabase.com → Project Settings → API
 */

const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...your-anon-key-here';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.db = supabase;
