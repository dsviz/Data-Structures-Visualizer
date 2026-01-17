import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check for persisted user on mount
        const storedUser = localStorage.getItem('dsv_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user from local storage');
                localStorage.removeItem('dsv_user');
            }
        }
    }, []);

    const login = async (email: string, password: string) => {
        // Mock login
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const mockUser: User = {
                    id: '1',
                    name: 'Shubham Kumar Sharma', // Mocking the main user for now
                    email: email,
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh085DeaEB1T1gxBPF4sZVzTohP-8qmp_qL1u76Qv07UNXcRRbdWqQUr39XKW9CZMf-g3kxbLT0JYWzDHFEWrkda8ZWKskE9uNkzThzlrzNgZbwLCmbqneW-vAM7SG5ps6E-n9UDj2VWf0bvC8kJ_TDoB_y78rBC1zmqXULbH1Kv-ZoE4qBo6o9VGs57cR6c7aU1WijM2mtZfmt6CCT4-UVCCyUclcaqWfuH9ikkHuFpilNSxn7o4Za6eT64sl_GYYBeAcDKPb3cs'
                };
                setUser(mockUser);
                localStorage.setItem('dsv_user', JSON.stringify(mockUser));
                resolve();
            }, 800);
        });
    };

    const signup = async (name: string, email: string, password: string) => {
        // Mock signup
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const mockUser: User = {
                    id: Date.now().toString(),
                    name: name,
                    email: email,
                    // Generate a random avatar for new users
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
                };
                setUser(mockUser);
                localStorage.setItem('dsv_user', JSON.stringify(mockUser));
                resolve();
            }, 800);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('dsv_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
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
