import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';
import { AuthResponse } from '../types/api';

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
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const TOKEN_KEY = 'dsv_token';
    const USER_KEY = 'dsv_user';

    const enhanceUser = (payload: { id: string; name: string; email: string; avatar?: string | null }): User => ({
        id: payload.id,
        name: payload.name,
        email: payload.email,
        avatar: payload.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name)}`
    });

    const persistSession = (response: AuthResponse) => {
        const sessionUser = enhanceUser(response.user);
        setUser(sessionUser);
        apiClient.setAuthToken();
        if (response.token) {
            localStorage.setItem(TOKEN_KEY, response.token);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    };

    useEffect(() => {
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem(USER_KEY);
            }
        }

        // Always verify with Supabase on mount
        apiClient.fetchCurrentUser()
            .then((current) => {
                const sessionUser = enhanceUser(current);
                setUser(sessionUser);
                localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
                // We don't save token manually anymore as Supabase handles it in cookies/storage
            })
            .catch(() => {
                // Only clear if we were previously "logged in" in UI
                if (storedUser) {
                    setUser(null);
                    localStorage.removeItem(USER_KEY);
                    localStorage.removeItem(TOKEN_KEY);
                }
            });
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiClient.login({ email, password });
        persistSession(response);
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            const response = await apiClient.signup({ name, email, password });
            if (!response.verifyNeeded) {
                persistSession(response);
            }
            return { verifyNeeded: response.verifyNeeded };
        } catch (error) {
            console.error('AuthContext Signup Error:', error);
            throw error;
        }
    };

    const verifyOtp = async (email: string, token: string) => {
        const response = await apiClient.verifyOtp(email, token);
        persistSession(response);
    };

    const logout = () => {
        setUser(null);
        apiClient.clearAuthToken();
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, verifyOtp, logout }}>
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
