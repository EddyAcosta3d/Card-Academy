import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
// Strip /rest/v1/ if the user accidentally included it
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback to prevent app crash if URL is invalid at boot
let validUrl = supabaseUrl;
try {
  new URL(supabaseUrl);
} catch {
  validUrl = 'https://invalid-config-url.supabase.co'; // Dummy URL to prevent crash
}

export const supabase = createClient(validUrl, supabaseAnonKey);
