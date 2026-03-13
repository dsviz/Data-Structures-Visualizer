import { AiProvider } from '../store/aiKeyStore';

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

export const generateNarrationBatch = async (descriptions: string[], dataStructure?: string): Promise<{ original: string, narrated: string }[]> => {
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const apiUrl = supabaseUrl
            ? `${supabaseUrl}/functions/v1/ai-narrate`
            : aiApiUrl('/api/narrate');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ descriptions, dataStructure })
        });

        if (!response.ok) {
            console.error('AI Backend error:', response.status);
            if (supabaseUrl && apiUrl !== aiApiUrl('/api/narrate')) {
                console.log("Attempting local fallback...");
                return generateNarrationBatchLocal(descriptions, dataStructure);
            }
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

const generateNarrationBatchLocal = async (descriptions: string[], dataStructure?: string) => {
    try {
        const response = await fetch(aiApiUrl('/api/narrate'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descriptions, dataStructure })
        });
        if (!response.ok) return descriptions.map(d => ({ original: d, narrated: d }));
        const data = await response.json();
        return data.narrations.map((narrated: string, i: number) => ({
            original: descriptions[i],
            narrated
        }));
    } catch (e) {
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
            body: JSON.stringify({ message, context, dataStructure, provider, apiKey })
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
