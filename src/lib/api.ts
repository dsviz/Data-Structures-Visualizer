import { AuthResponse, LoginCredentials, SignupCredentials, User } from '../types/api';
import { supabase } from './supabase';

class ApiClient {
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

        // Check if user already exists (Supabase returns a fake user with empty identities when "prevent email enumeration" is on)
        if (data.user?.identities?.length === 0) {
            throw new Error('Email address is already registered');
        }

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

    async updateProfile(id: string, name: string, avatarUrl?: string): Promise<void> {
        const { error } = await supabase
            .from('profiles')
            .update({
                name,
                avatar_url: avatarUrl
            })
            .eq('id', id);

        if (error) throw error;
    }

    async uploadAvatar(file: File, userId: string): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log("Attempting upload to bucket: AVATAR with file path:", filePath);

        const { error: uploadError } = await supabase.storage
            .from('avatar')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error("Supabase Storage Upload Error Full Object:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        console.log("Upload successful, getting public URL...");

        const { data } = supabase.storage
            .from('avatar')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
    async updatePassword(newPassword: string): Promise<void> {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
    }
}

export const apiClient = new ApiClient();
