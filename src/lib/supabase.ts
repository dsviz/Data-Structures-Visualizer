import { createClient } from '@supabase/supabase-js';
// Debug logging to help identify why the connection is failing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// We use an empty string for development if missing to prevent crash, 
// but it will trigger a "Failed to fetch" if keys are missing.
export const supabase = createClient(
    supabaseUrl || 'https://invalid.supabase.co',
    supabaseAnonKey || 'invalid'
);
