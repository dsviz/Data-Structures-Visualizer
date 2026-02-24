import { createClient } from '@supabase/supabase-js';

// Debug logging to help identify why the connection is failing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

console.log('--- Supabase Debug Info ---');
console.log('URL found:', supabaseUrl ? 'YES' : 'NO');
console.log('Key found:', supabaseAnonKey ? 'YES' : 'NO');
if (supabaseAnonKey) {
    console.log('Key format check:', supabaseAnonKey.startsWith('eyJ') ? 'VALID (JWT)' : 'INVALID (Does not start with eyJ)');
}

if (!supabaseUrl || !supabaseAnonKey || (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ'))) {
    console.warn('Supabase credentials may be incorrect! Real anon keys start with "eyJ".');
}

// We use an empty string for development if missing to prevent crash, 
// but it will trigger a "Failed to fetch" if keys are missing.
export const supabase = createClient(
    supabaseUrl || 'https://invalid.supabase.co',
    supabaseAnonKey || 'invalid'
);
