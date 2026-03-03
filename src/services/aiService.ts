export const generateNarrationBatch = async (descriptions: string[], dataStructure?: string): Promise<{ original: string, narrated: string }[]> => {
    try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const apiUrl = supabaseUrl
            ? `${supabaseUrl}/functions/v1/ai-narrate`
            : 'http://localhost:3001/api/narrate';

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
            // Fallback to local if Supabase fails (optional, but good for dev)
            if (supabaseUrl && apiUrl !== 'http://localhost:3001/api/narrate') {
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
        const response = await fetch('http://localhost:3001/api/narrate', {
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
