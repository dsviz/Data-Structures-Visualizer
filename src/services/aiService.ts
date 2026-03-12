import { AiProvider } from '../store/aiKeyStore';

const AI_SERVER_URL = 'http://localhost:3001';

export const generateNarrationBatch = async (descriptions: string[], dataStructure?: string): Promise<{ original: string, narrated: string }[]> => {
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const apiUrl = supabaseUrl
            ? `${supabaseUrl}/functions/v1/ai-narrate`
            : `${AI_SERVER_URL}/api/narrate`;

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
            if (supabaseUrl && apiUrl !== `${AI_SERVER_URL}/api/narrate`) {
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
        const response = await fetch(`${AI_SERVER_URL}/api/narrate`, {
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
        const response = await fetch(`${AI_SERVER_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context, dataStructure, provider, apiKey })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const detail = errorData.details || errorData.error || `Server error (${response.status})`;
            return { response: `⚠️ ${detail}` };
        }
        return await response.json();
    } catch (e) {
        console.error(e);
        return { response: "An error occurred while connecting to the AI server. Is the backend running on port 3001?" };
    }
};

export const parseNaturalLanguageIntent = async (
    command: string,
    provider?: AiProvider,
    apiKey?: string
) => {
    try {
        const response = await fetch(`${AI_SERVER_URL}/api/intent`, {
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
