import { createClient } from '@supabase/supabase-js';
import Cookies from 'js-cookie';

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

// Custom storage adapter using js-cookie for robust session management
const cookieStorage = {
    getItem: (key: string): string | null => {
        return Cookies.get(key) || null;
    },
    setItem: (key: string, value: string): void => {
        // Secure settings: expires in 30 days, SameSite strict
        Cookies.set(key, value, { expires: 30, sameSite: 'strict', path: '/' });
    },
    removeItem: (key: string): void => {
        Cookies.remove(key, { path: '/' });
    },
};

// We use an empty string for development if missing to prevent crash, 
// but it will trigger a "Failed to fetch" if keys are missing.
export const supabase = createClient(
    supabaseUrl || 'https://invalid.supabase.co',
    supabaseAnonKey || 'invalid',
    {
        auth: {
            storage: cookieStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        }
    }
);
