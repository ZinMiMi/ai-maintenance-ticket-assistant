/**
 * Supabase Client Configuration
 *
 * Initialize the Supabase client for use throughout the application.
 * Replace URL and ANON_KEY with your Supabase project credentials.
 *
 * Get these from: https://app.supabase.com → Project Settings → API
 */

// Supabase configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Initialize Supabase client
// The Supabase library is loaded via CDN in index.html
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other scripts
window.supabaseClient = supabase;
