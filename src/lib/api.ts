import { AuthResponse, LoginCredentials, SignupCredentials, User } from '../types/api';
import { supabase } from './supabase';

class ApiClient {
    setAuthToken() {
        // Supabase handles session automatically, 
        // but we keep this for consistency with existing AuthContext
    }

    clearAuthToken() {
        // Supabase handles session automatically
    }

    async signup(credentials: SignupCredentials): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    full_name: credentials.name
                }
            }
        });

        if (error) throw error;
        if (!data.user) throw new Error('Signup failed: No user returned');

        // If session is null, it means Email Confirmation is enabled
        if (!data.session) {
            return {
                user: {
                    id: data.user.id,
                    email: data.user.email || '',
                    name: credentials.name,
                },
                verifyNeeded: true,
                email: credentials.email
            };
        }

        // Session exists (auto-confirm is ON), create profile
        await this.createProfile(data.user.id, credentials.name, credentials.email);

        return {
            user: {
                id: data.user.id,
                email: data.user.email || '',
                name: credentials.name,
                avatar: undefined
            },
            token: data.session.access_token
        };
    }

    async verifyOtp(email: string, token: string): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup'
        });

        if (error) throw error;
        if (!data.user || !data.session) throw new Error('Verification failed');

        // Fetch name from user metadata if possible
        const name = data.user.user_metadata?.full_name || 'User';

        // Ensure profile exists after verification
        await this.createProfile(data.user.id, name, email);

        return {
            user: {
                id: data.user.id,
                email: data.user.email || '',
                name: name,
            },
            token: data.session.access_token
        };
    }

    private async createProfile(id: string, name: string, email: string) {
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert([{ id, name, email }]);

        if (profileError) console.error('Error creating profile:', profileError);
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) throw error;
        if (!data.user || !data.session) throw new Error('Authentication failed');

        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        return {
            user: {
                id: data.user.id,
                email: data.user.email || '',
                name: profile?.name || 'User',
                avatar: profile?.avatar_url
            },
            token: data.session.access_token
        };
    }

    async fetchCurrentUser(): Promise<User> {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw new Error('Unauthorized');

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return {
            id: user.id,
            email: user.email || '',
            name: profile?.name || 'User',
            avatar: profile?.avatar_url
        };
    }
}

export const apiClient = new ApiClient();
