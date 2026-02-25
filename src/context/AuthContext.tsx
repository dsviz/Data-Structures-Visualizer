import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';
import { supabase } from '../lib/supabase';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<{ verifyNeeded?: boolean }>;
    verifyOtp: (email: string, token: string) => Promise<void>;
    updateUserProfile: (name: string, avatarUrl?: string) => Promise<void>;
    logout: () => void;
    isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const enhanceUser = (payload: { id: string; name: string; email: string; avatar?: string | null }): User => ({
        id: payload.id,
        name: payload.name,
        email: payload.email,
        avatar: payload.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name)}`
    });

    useEffect(() => {
        // 1. Fetch initial session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Fetch full profile from API
                apiClient.fetchCurrentUser()
                    .then(current => setUser(enhanceUser(current)))
                    .catch(() => setUser(null))
                    .finally(() => setIsInitializing(false));
            } else {
                setUser(null);
                setIsInitializing(false);
            }
        });

        // 2. Set up real-time listener for all future auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Supabase Auth Event:", event);

            if (event === 'SIGNED_IN' && session?.user) {
                try {
                    const current = await apiClient.fetchCurrentUser();
                    setUser(enhanceUser(current));
                } catch (e) {
                    console.error("Failed to fetch user after sign in", e);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        await apiClient.login({ email, password });
        // The onAuthStateChange listener will automatically pick up the SIGNED_IN event
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            const response = await apiClient.signup({ name, email, password });
            // onAuthStateChange handles session if auto-login occurs
            return { verifyNeeded: response.verifyNeeded };
        } catch (error) {
            console.error('AuthContext Signup Error:', error);
            throw error;
        }
    };

    const verifyOtp = async (email: string, token: string) => {
        await apiClient.verifyOtp(email, token);
        // onAuthStateChange handles session
    };

    const updateUserProfile = async (name: string, avatarUrl?: string) => {
        if (!user) throw new Error('Not logged in');

        // Update in database first
        await apiClient.updateProfile(user.id, name, avatarUrl);

        // Update local state
        const updatedUser = enhanceUser({
            ...user,
            name,
            avatar: avatarUrl
        });

        setUser(updatedUser);
        // localStorage is now managed by Supabase cookies
    };

    const logout = async () => {
        await supabase.auth.signOut();
        // onAuthStateChange handles SIGNED_OUT event and clears local state
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, verifyOtp, updateUserProfile, logout, isInitializing }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
