/**
 * Supabase Client
 *
 * Loads the Supabase JS library from CDN and creates a client instance.
 * Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project credentials.
 *
 * Get these from: https://app.supabase.com -> Project Settings -> API
 */

const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...your-anon-key-here';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Auth helpers ----

/**
 * Sign in with email and password.
 * Returns { data, error } from Supabase Auth.
 */
async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign out the current user.
 * Returns { error } from Supabase Auth.
 */
async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Get the current session (if any).
 * Returns { data: { session }, error }.
 */
async function getSession() {
  return supabase.auth.getSession();
}

/**
 * Listen for auth state changes (SIGNED_IN, SIGNED_OUT, etc.).
 * Returns the unsubscribe function from Supabase.
 */
function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

/**
 * Fetch the current user's profile from the public.users table.
 * Returns { data: user | null, error }.
 */
async function getUserProfile(userId) {
  return supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
}

window.db = supabase;
window.signIn = signIn;
window.signOut = signOut;
window.getSession = getSession;
window.onAuthStateChange = onAuthStateChange;
window.getUserProfile = getUserProfile;
