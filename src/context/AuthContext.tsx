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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'supabase-auth-token';
const USER_KEY = 'app-user-data';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // 1. Synchronously initialize state from LocalStorage for an instant load
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }
        return null;
    });

    const enhanceUser = (payload: { id: string; name: string; email: string; avatar?: string | null }): User => ({
        id: payload.id,
        name: payload.name,
        email: payload.email,
        avatar: payload.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name)}`
    });

    // Helper to save session data safely to localStorage
    const persistSession = (userData: User, token?: string) => {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
    };

    // Keep token refreshed using basic autoRefresh, but rely on localStorage for the UI state
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // We still listen so supabase auto-refreshes tokens, but we don't
            // block the UI or rely on it for the initial instant load.
            if (event === 'SIGNED_IN' && session?.access_token) {
                localStorage.setItem(TOKEN_KEY, session.access_token);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiClient.login({ email, password });

        // Manual persist after successful API call
        if (response.user) {
            persistSession(enhanceUser(response.user), response.token);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            const response = await apiClient.signup({ name, email, password });
            if (response.user && !response.verifyNeeded) {
                persistSession(enhanceUser(response.user), response.token);
            }
            return { verifyNeeded: response.verifyNeeded };
        } catch (error) {
            console.error('AuthContext Signup Error:', error);
            throw error;
        }
    };

    const verifyOtp = async (email: string, token: string) => {
        const response = await apiClient.verifyOtp(email, token);
        if (response.user) {
            persistSession(enhanceUser(response.user), response.token);
        }
    };

    const updateUserProfile = async (name: string, avatarUrl?: string) => {
        if (!user) throw new Error('Not logged in');

        // Update in database first
        await apiClient.updateProfile(user.id, name, avatarUrl);

        // Update local state and localStorage
        const updatedUser = enhanceUser({
            ...user,
            name,
            avatar: avatarUrl
        });

        persistSession(updatedUser);
    };

    const logout = async () => {
        console.log("AuthContext: Starting LocalStorage logout process...");

        // Clear local storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);

        // Clear supabase 
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("AuthContext: Error during Supabase remote sign out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, verifyOtp, updateUserProfile, logout }}>
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
