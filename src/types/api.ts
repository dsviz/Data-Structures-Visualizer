export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface AuthResponse {
    user: User;
    token?: string;
    verifyNeeded?: boolean;
    email?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    name: string;
    email: string;
    password: string;
}
