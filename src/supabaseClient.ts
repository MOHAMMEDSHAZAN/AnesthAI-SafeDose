import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

// Clean surrounding quotes if any are present from copy-pasting
const cleanUrl = supabaseUrl.trim().replace(/^["']|["']$/g, '');
const cleanKey = supabaseAnonKey.trim().replace(/^["']|["']$/g, '');

export const isSupabaseConfigured = !!(cleanUrl && cleanKey && cleanUrl !== '""' && cleanKey !== '""');

if (isSupabaseConfigured) {
  console.log('%cSupabase: Active configuration detected. Syncing with remote database.', 'color: #00e5ff; font-weight: bold;');
} else {
  console.log('%cSupabase: No VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY found. Falling back to in-memory/localStorage cache.', 'color: #ff9100; font-weight: bold;');
}

export const supabase = isSupabaseConfigured
  ? createClient(cleanUrl, cleanKey)
  : null;
