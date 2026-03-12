import { create } from 'zustand';

export type AiProvider = 'gemini' | 'groq' | 'openai';

interface AiKeyState {
    provider: AiProvider;
    apiKey: string;
    isConfigured: boolean;
    setKey: (provider: AiProvider, apiKey: string, userId: string) => void;
    clearKey: (userId: string) => void;
    loadKey: (userId: string) => void;
}

const STORAGE_PREFIX = 'ai-key-';
const DEFAULT_PROVIDER: AiProvider = 'gemini';
const VALID_PROVIDERS: AiProvider[] = ['gemini', 'groq', 'openai'];

const isValidProvider = (value: unknown): value is AiProvider =>
    typeof value === 'string' && VALID_PROVIDERS.includes(value as AiProvider);

// sessionStorage reduces persistence, but client-side storage still remains XSS-sensitive.
const getStorageKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;

export const useAiKeyStore = create<AiKeyState>((set) => ({
    provider: DEFAULT_PROVIDER,
    apiKey: '',
    isConfigured: false,

    setKey: (provider, apiKey, userId) => {
        const safeProvider = isValidProvider(provider) ? provider : DEFAULT_PROVIDER;
        const safeApiKey = typeof apiKey === 'string' ? apiKey.trim() : '';
        const data = JSON.stringify({ provider: safeProvider, apiKey: safeApiKey });
        sessionStorage.setItem(getStorageKey(userId), data);
        set({ provider: safeProvider, apiKey: safeApiKey, isConfigured: !!safeApiKey });
    },

    clearKey: (userId) => {
        sessionStorage.removeItem(getStorageKey(userId));
        set({ provider: DEFAULT_PROVIDER, apiKey: '', isConfigured: false });
    },

    loadKey: (userId) => {
        try {
            const raw = sessionStorage.getItem(getStorageKey(userId));
            if (raw) {
                const { provider, apiKey } = JSON.parse(raw);
                const safeProvider = isValidProvider(provider) ? provider : DEFAULT_PROVIDER;
                const safeApiKey = typeof apiKey === 'string' ? apiKey : '';
                set({ provider: safeProvider, apiKey: safeApiKey, isConfigured: !!safeApiKey });
            } else {
                set({ provider: DEFAULT_PROVIDER, apiKey: '', isConfigured: false });
            }
        } catch {
            set({ provider: DEFAULT_PROVIDER, apiKey: '', isConfigured: false });
        }
    }
}));
