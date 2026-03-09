import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Only create the client if we have the credentials
// This prevents the app from crashing during local development if Supabase is not configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.warn('Supabase environment variables are missing. Auth features will be disabled.');
}

export const supabase = isSupabaseConfigured 
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            detectSessionInUrl: true,
            autoRefreshToken: true,
            persistSession: true,
            flowType: 'pkce',
        }
    })
    : (null as any); // Type cast to any to allow the app to boot, handled in AuthContext
