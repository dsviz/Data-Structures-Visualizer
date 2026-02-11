import { AuthResponse, LoginCredentials, SignupCredentials, User } from '../types/api';

const MOCK_USER: User = {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
};

const MOCK_AUTH_RESPONSE: AuthResponse = {
    user: MOCK_USER,
    token: 'mock-jwt-token'
};

class ApiClient {
    private token: string | null = null;

    setAuthToken(token: string) {
        this.token = token;
    }

    clearAuthToken() {
        this.token = null;
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        console.log('Logging in with', credentials);
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_AUTH_RESPONSE), 500);
        });
    }

    async signup(credentials: SignupCredentials): Promise<AuthResponse> {
        console.log('Signing up with', credentials);
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_AUTH_RESPONSE), 500);
        });
    }

    async fetchCurrentUser(): Promise<User> {
        return new Promise((resolve, reject) => {
            if (this.token) {
                setTimeout(() => resolve(MOCK_USER), 500);
            } else {
                setTimeout(() => reject(new Error('Unauthorized')), 500);
            }
        });
    }
}

export const apiClient = new ApiClient();
