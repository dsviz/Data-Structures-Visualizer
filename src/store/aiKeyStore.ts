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

const getStorageKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;

const getLocalStorage = () => (typeof window !== 'undefined' ? window.localStorage : null);
const getSessionStorage = () => (typeof window !== 'undefined' ? window.sessionStorage : null);

export const useAiKeyStore = create<AiKeyState>((set) => ({
    provider: DEFAULT_PROVIDER,
    apiKey: '',
    isConfigured: false,

    setKey: (provider, apiKey, userId) => {
        const safeProvider = isValidProvider(provider) ? provider : DEFAULT_PROVIDER;
        const safeApiKey = typeof apiKey === 'string' ? apiKey.trim() : '';
        const data = JSON.stringify({ provider: safeProvider, apiKey: safeApiKey });

        const localStore = getLocalStorage();
        localStore?.setItem(getStorageKey(userId), data);

        // Clean up old session-only value so one source of truth remains.
        getSessionStorage()?.removeItem(getStorageKey(userId));
        set({ provider: safeProvider, apiKey: safeApiKey, isConfigured: !!safeApiKey });
    },

    clearKey: (userId) => {
        getLocalStorage()?.removeItem(getStorageKey(userId));
        getSessionStorage()?.removeItem(getStorageKey(userId));
        set({ provider: DEFAULT_PROVIDER, apiKey: '', isConfigured: false });
    },

    loadKey: (userId) => {
        try {
            const storageKey = getStorageKey(userId);
            const localStore = getLocalStorage();
            const sessionStore = getSessionStorage();

            // Prefer persistent localStorage; fall back once to legacy sessionStorage and migrate it.
            let raw = localStore?.getItem(storageKey) ?? null;
            if (!raw && sessionStore) {
                raw = sessionStore.getItem(storageKey);
                if (raw) {
                    localStore?.setItem(storageKey, raw);
                    sessionStore.removeItem(storageKey);
                }
            }

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
