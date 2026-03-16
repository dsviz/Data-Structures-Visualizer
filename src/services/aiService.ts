import { AiProvider } from '../store/aiKeyStore';

import { LEETCODE_PROBLEMS, DS_TO_TOPIC } from '../data/LeetcodeProblems';

/** Builds a short LeetCode context string for the AI based on the current data structure */
export function getLeetcodeContext(dataStructure?: string): string {
    if (!dataStructure) return '';
    const topicKey = DS_TO_TOPIC[dataStructure];
    if (!topicKey) return '';
    const problems = LEETCODE_PROBLEMS.filter(p => p.topics.includes(topicKey)).slice(0, 6);
    if (problems.length === 0) return '';
    const list = problems.map(p => `#${p.id} ${p.title} (${p.difficulty})`).join(', ');
    return `\nRelated LeetCode problems for ${dataStructure}: ${list}. Mention these when relevant to help students connect concepts to practice problems.`;
}
const normalizeBaseUrl = (value?: string) => {
    if (!value) return '';
    const trimmed = value.trim().replace(/\/+$/, '');
    // Accept values like https://host/api and normalize to https://host
    return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
};

const configuredAiBase = normalizeBaseUrl(import.meta.env.VITE_AI_SERVER_URL);
const configuredApiBase = normalizeBaseUrl(import.meta.env.VITE_API_URL);
const AI_SERVER_BASE = configuredAiBase || configuredApiBase || (import.meta.env.DEV ? 'http://localhost:3001' : '');

const aiApiUrl = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return AI_SERVER_BASE ? `${AI_SERVER_BASE}${normalizedPath}` : normalizedPath;
};

const AI_KEY_STORAGE_PREFIX = 'ai-key-';
const USER_STORAGE_KEY = 'app-user-data';

const getResolvedAiCredentials = (
    provider?: AiProvider,
    apiKey?: string
): { provider?: AiProvider; apiKey?: string } => {
    const safeProvider = typeof provider === 'string' ? provider : undefined;
    const safeApiKey = typeof apiKey === 'string' ? apiKey.trim() : '';

    if (safeProvider && safeApiKey) {
        return { provider: safeProvider, apiKey: safeApiKey };
    }

    if (typeof window === 'undefined') {
        return {};
    }

    try {
        const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
        if (!rawUser) return {};

        const parsedUser = JSON.parse(rawUser) as { id?: string };
        if (!parsedUser?.id) return {};

        const rawAiKey = window.localStorage.getItem(`${AI_KEY_STORAGE_PREFIX}${parsedUser.id}`)
            ?? window.sessionStorage.getItem(`${AI_KEY_STORAGE_PREFIX}${parsedUser.id}`);

        if (!rawAiKey) return {};

        const parsedAiConfig = JSON.parse(rawAiKey) as { provider?: AiProvider; apiKey?: string };
        const resolvedProvider = parsedAiConfig?.provider;
        const resolvedApiKey = typeof parsedAiConfig?.apiKey === 'string' ? parsedAiConfig.apiKey.trim() : '';

        if (!resolvedProvider || !resolvedApiKey) return {};
        return { provider: resolvedProvider, apiKey: resolvedApiKey };
    } catch {
        return {};
    }
};

export const resolveAiCredentials = (provider?: AiProvider, apiKey?: string) =>
    getResolvedAiCredentials(provider, apiKey);

export const hasConfiguredAiCredentials = (provider?: AiProvider, apiKey?: string): boolean => {
    const credentials = getResolvedAiCredentials(provider, apiKey);
    return !!credentials.provider && !!credentials.apiKey;
};

export const generateNarrationBatch = async (
    descriptions: string[],
    dataStructure?: string,
    provider?: AiProvider,
    apiKey?: string
): Promise<{ original: string, narrated: string }[]> => {
    try {
        const credentials = getResolvedAiCredentials(provider, apiKey);
        const apiUrl = aiApiUrl('/api/narrate');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                descriptions,
                dataStructure,
                provider: credentials.provider,
                apiKey: credentials.apiKey
            })
        });

        if (!response.ok) {
            console.error('AI Backend error:', response.status);
            return descriptions.map(d => ({ original: d, narrated: d }));
        }

        const data = await response.json();
        if (data.narrations && Array.isArray(data.narrations)) {
            return data.narrations.map((narrated: string, i: number) => ({
                original: descriptions[i],
                narrated
            }));
        }

        return descriptions.map(d => ({ original: d, narrated: d }));
    } catch (error) {
        console.error("Failed to connect to AI server.", error);
        return descriptions.map(d => ({ original: d, narrated: d }));
    }
};

export const sendChatMessage = async (
    message: string,
    context: any,
    dataStructure?: string,
    provider?: AiProvider,
    apiKey?: string
) => {
    try {
        const response = await fetch(aiApiUrl('/api/chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context, dataStructure, provider, apiKey, leetcodeContext: getLeetcodeContext(dataStructure) })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const fallbackDetail = response.status === 405
                ? 'Server error (405). Backend route not reachable. Set VITE_AI_SERVER_URL (or VITE_API_URL) to your Express API base URL.'
                : `Server error (${response.status})`;
            const detail = errorData.details || errorData.error || fallbackDetail;
            return { response: `⚠️ ${detail}` };
        }
        return await response.json();
    } catch (e) {
        console.error(e);
        return { response: "An error occurred while connecting to the AI server. Please verify the backend is reachable or set VITE_AI_SERVER_URL." };
    }
};

export const extractDataFromImage = async (
    prompt: string,
    image: string,
    mimeType: string,
    provider?: AiProvider,
    apiKey?: string
): Promise<{ text: string }> => {
    const credentials = getResolvedAiCredentials(provider, apiKey);
    const response = await fetch(aiApiUrl('/api/extract'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt,
            image,
            mimeType,
            provider: credentials.provider,
            apiKey: credentials.apiKey
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `Server error (${response.status})`);
    }

    return await response.json();
};

export const parseNaturalLanguageIntent = async (
    command: string,
    provider?: AiProvider,
    apiKey?: string
) => {
    try {
        const response = await fetch(aiApiUrl('/api/intent'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command, provider, apiKey })
        });
        if (!response.ok) return { intent: { action: "unknown", value: null } };
        return await response.json();
    } catch (e) {
        console.error(e);
        return { intent: { action: "unknown", value: null } };
    }
};
