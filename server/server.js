require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const AI_REQUEST_TIMEOUT_MS = Number.parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '10000', 10);

// Rate limiting to protect API quota
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 requests per windowMs
    message: { error: "Too many requests, please try again later." }
});

app.use(limiter);
app.use(cors());
app.use(express.json());

function sanitizeUserMessage(message) {
    if (typeof message !== 'string') return '';

    return message
        .slice(0, 1000)
        .replace(/[\u0000-\u001F\u007F]/g, ' ')
        .replace(/\b(system|assistant|developer|tool)\s*:/gi, '$1 ')
        .replace(/["'`]/g, '\\$&')
        .replace(/\s+/g, ' ')
        .trim();
}

function redactSensitiveFields(value) {
    if (Array.isArray(value)) {
        return value.map(redactSensitiveFields);
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, fieldValue]) => {
                if (/(api[-_]?key|token|authorization|password|secret)/i.test(key)) {
                    return [key, '[redacted]'];
                }
                return [key, redactSensitiveFields(fieldValue)];
            })
        );
    }

    return value;
}

function sanitizeContext(context) {
    if (context == null) return '';

    try {
        const text = JSON.stringify(redactSensitiveFields(context), null, 2);
        return text.length > 4000 ? `${text.slice(0, 4000)}\n... [truncated]` : text;
    } catch {
        return '{}';
    }
}

async function fetchWithTimeout(url, options, timeoutMs = AI_REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } catch (error) {
        if (error && error.name === 'AbortError') {
            throw new Error('request timed out');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

app.post('/api/narrate', async (req, res) => {
    try {
        const { descriptions, dataStructure, provider, apiKey } = req.body;

        if (!descriptions || !Array.isArray(descriptions)) {
            return res.status(400).json({ error: 'Missing or invalid descriptions array' });
        }

        if (!provider || !apiKey) {
            return res.status(400).json({ error: 'Missing provider or apiKey. Please configure your API key in Profile -> AI Settings.' });
        }

        let dataStructureContext = "a visual algorithm execution";
        let additionalInstructions = "";

        if (dataStructure === 'Linked List') {
            dataStructureContext = "a Linked List algorithm (nodes, pointers, traversal, head/tail)";
            additionalInstructions = `When describing pointer changes, explain the logical reason — e.g., "We redirect node A's next pointer past node B to remove B from the chain, effectively unlinking it." When traversing, mention what the algorithm is searching for and why it moves to the next node.`;
        } else if (dataStructure === 'Graph') {
            dataStructureContext = "a Graph algorithm (nodes, edges, weights, BFS, DFS, Dijkstra, etc.)";
            additionalInstructions = `Explain why each node or edge is visited — e.g., "We explore node 5 next because it has the smallest tentative distance in Dijkstra's algorithm." Mention queue/stack behavior for BFS/DFS. When relaxing edges, explain the comparison being made.`;
        } else if (dataStructure === 'Stack') {
            dataStructureContext = "a Stack data structure (LIFO — Last In, First Out)";
            additionalInstructions = `Explain the LIFO principle in context — e.g., "We pop 7 off the top because the stack always removes the most recently added item first." When pushing, mention what will happen to this item later.`;
        } else if (dataStructure === 'Queue') {
            dataStructureContext = "a Queue data structure (FIFO — First In, First Out)";
            additionalInstructions = `Explain the FIFO principle — e.g., "Node 3 is dequeued first because it's been waiting the longest, following the First-In-First-Out rule." Mention the front/rear relationship.`;
        } else if (dataStructure === 'Binary Tree') {
            dataStructureContext = "a Binary Tree algorithm (BST, AVL, traversals, balancing)";
            additionalInstructions = `Explain tree navigation logic — e.g., "We go left because 15 is less than the current node's value 20, following BST ordering." For traversals, explain the visit order and why it matters. For rotations, explain what imbalance is being fixed.`;
        } else if (dataStructure === 'Array') {
            dataStructureContext = "an Array algorithm (sorting, searching, insertion, deletion)";
            additionalInstructions = `Explain comparisons and swaps with reasons — e.g., "Swapping 7 and 3 because 7 > 3 and we need the smaller element to bubble to the left in this pass of Bubble Sort." For searches, explain why the search window narrows. For insertions, explain element shifting.`;
        } else if (dataStructure === 'Sorting') {
            dataStructureContext = "a Sorting algorithm (Bubble, Selection, Insertion, Merge, Quick Sort)";
            additionalInstructions = `Always explain WHY a swap or comparison happens — e.g., "Comparing positions 2 and 3: since 9 > 4, we swap them to move the larger value rightward in pass 3 of Bubble Sort." Mention which pass/partition/merge step we're in and how it contributes to the final sorted order.`;
        } else if (dataStructure === 'Recursion') {
            dataStructureContext = "a Recursive algorithm (call stack, base case, recursive case)";
            additionalInstructions = `Explain the recursion depth and what each call is solving — e.g., "Making a recursive call with n=3, which will compute fib(2) + fib(1). We're 4 levels deep in the call stack now." Mention when we hit the base case and when we start unwinding.`;
        } else if (dataStructure) {
            dataStructureContext = `a ${dataStructure} algorithm`;
        }

        const prompt = `
You are a warm, knowledgeable Computer Science tutor narrating ${dataStructureContext} step-by-step to a student.

YOUR NARRATION STYLE:
- Speak naturally, like a friendly expert explaining to a curious student sitting next to you
- For EVERY step, explain both WHAT is happening AND WHY it's happening
- Reference the algorithm's logic, not just the data — connect each action to the bigger picture
- Use the actual numbers, indices, and node names from the descriptions
- Keep each narration to 1-2 sentences — rich but concise, not verbose
- Avoid jargon without context — if using a technical term, briefly explain it inline
- Sound human and engaging, not robotic or overly formal
- Do NOT use markdown, asterisks, or special formatting — plain text only

${additionalInstructions}

BAD example (too terse/robotic): "Comparing index 2 and 3."
GOOD example: "Now we compare positions 2 and 3 — since 7 is greater than 3, we need to swap them so the smaller value moves left, which is exactly what Bubble Sort does each pass."

Here are the raw step descriptions to rewrite:
${JSON.stringify(descriptions, null, 2)}

Return a raw JSON array of strings containing ONLY the rewritten narrations in the exact same order. No markdown blocks, no code fences — just the JSON array.
`;

        let text = await callAI(provider, apiKey, prompt);

        // Strip markdown if it exists
        if (text.startsWith('```json')) {
            text = text.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (text.startsWith('```')) {
            text = text.replace(/^```/, '').replace(/```$/, '').trim();
        }

        try {
            const narrations = JSON.parse(text);
            if (Array.isArray(narrations) && narrations.length === descriptions.length) {
                res.json({ narrations });
            } else {
                console.error("AI returned invalid array length/format");
                res.json({ narrations: descriptions });
            }
        } catch (parseError) {
            console.error("Failed to parse AI response", text);
            res.json({ narrations: descriptions });
        }

    } catch (error) {
        console.error('Error in /api/narrate:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// === Multi-Provider Helper ===
// Calls the appropriate AI API based on user-provided provider + apiKey.
async function callAI(provider, apiKey, prompt, jsonMode = false) {
    if (provider === 'gemini') {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const ai = new GoogleGenerativeAI(apiKey);
        const config = jsonMode ? { responseMimeType: "application/json" } : {};
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: config });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    }

    if (provider === 'groq') {
        const body = {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
        };
        if (jsonMode) body.response_format = { type: "json_object" };
        const res = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
        const data = await res.json();
        return data.choices[0].message.content.trim();
    }

    if (provider === 'openai') {
        const body = {
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
        };
        if (jsonMode) body.response_format = { type: "json_object" };
        const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
        const data = await res.json();
        return data.choices[0].message.content.trim();
    }

    throw new Error(`Unknown provider: ${provider}`);
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message, context, dataStructure, provider, apiKey } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Missing message' });
        }

        if (!provider || !apiKey) {
            return res.status(400).json({ error: 'Missing provider or apiKey. Please configure your API key in Profile → AI Settings.' });
        }

        const sanitizedMessage = sanitizeUserMessage(message);
        const sanitizedContext = sanitizeContext(context);
        const sanitizedDataStructure = sanitizeUserMessage(dataStructure || '');

        let prompt;

        if (dataStructure && context) {
            // === VISUALIZER MODE: Step-by-step CS Tutor ===
            prompt = `
You are an expert Computer Science tutor embedded in a Data Structures & Algorithms Visualizer web app.
    The user is currently viewing the "${sanitizedDataStructure}" visualizer with this state:
    ${sanitizedContext}

    The user asks: "${sanitizedMessage}"

Provide a clear, educational, and concise response. Refer to the specific numbers/nodes in the context when relevant.
`;
        } else {
            // === PLATFORM MODE: Platform Assistant ===
            prompt = `
You are "DSA Buddy", the friendly AI assistant for the "Web-Based Data Structures & Algorithms Visualizer" platform.

ABOUT THE PLATFORM:
- An interactive educational web app that helps students visually understand data structures and algorithms through step-by-step animations.
- Built with React, TypeScript, Vite, and Tailwind CSS.

SUPPORTED DATA STRUCTURES & ALGORITHMS:
1. **Arrays** — Linear Search, Binary Search, Insert, Remove, Update, Reverse, Two Sum, Cycle Detection
2. **Linked Lists** (Singly, Doubly, Circular) — Traversal, Insertion, Deletion, Reverse, Floyd's Cycle Detection, Merge, Palindrome Check
3. **Stacks** — Push, Pop, Peek, Reverse String, Balanced Parentheses, Postfix Evaluator, Browser History
4. **Queues** — Enqueue, Dequeue, Peek, Binary Number Generator, Hot Potato
5. **Trees** (BST, AVL) — Insert, Delete, Search, In/Pre/Post/BFS/ZigZag Traversals, Validate BST, LCA, Height, Diameter, Views
6. **Graphs** (Directed/Undirected/Weighted) — BFS, DFS, Dijkstra, A*, Prim, Kruskal, Topological Sort, Ford-Fulkerson
7. **Sorting** — Bubble, Selection, Insertion, Merge, Quick Sort
8. **Recursion** — Fibonacci Sequence

KEY FEATURES:
- Step-by-step visual animations with play/pause/step controls
- Speed control for animation playback
- AI Narration (JARVIS-style) that explains each step
- AI Tutor that answers questions in real-time during visualizations
- Voice commands to control the visualizer hands-free
- Interactive canvas tools to build your own trees and graphs
- Code & pseudocode panels for each algorithm
- Dark mode support

NAVIGATION:
- Homepage: / (overview of all data structures)
- Arrays: /arrays
- Linked Lists: /linked-list
- Stacks: /stack
- Queues: /queue
- Trees: /trees
- Graphs: /graphs
- Sorting: /sorting
- Recursion: /recursion

The user asks: "${sanitizedMessage}"

Respond in a friendly, helpful, and concise way. If they ask about a specific algorithm, explain what it does and suggest which visualizer page to visit. If they ask general questions, answer them warmly. Keep responses short — 2-4 sentences max.
`;
        }

        const text = await callAI(provider, apiKey, prompt);
        res.json({ response: text });
    } catch (error) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({ error: 'AI request failed', details: error.message });
    }
});

app.post('/api/intent', async (req, res) => {
    try {
        const { command, provider, apiKey } = req.body;

        if (!command) {
            return res.status(400).json({ error: 'Missing command' });
        }

        if (!provider || !apiKey) {
            return res.status(400).json({ error: 'Missing provider or apiKey.' });
        }

        const sanitizedCommand = sanitizeUserMessage(command);

        const prompt = `
    Analyze the following natural language user command for a data structures visualizer: "${sanitizedCommand}"

Map the intent to one of the following exact actions: "play", "pause", "step_forward", "step_backward", "reset", "insert", "delete", "search".
If the command involves an input value (like "insert 50"), extract the number as "value".

Return a strict JSON object with this shape:
{
  "action": "play" | "pause" | "step_forward" | "step_backward" | "reset" | "insert" | "delete" | "search" | "unknown",
  "value": number | null
}
For example, for "put 42 in the tree" return {"action": "insert", "value": 42}.
For "stop" return {"action": "pause", "value": null}.
For "next step" return {"action": "step_forward", "value": null}.
`;

        const text = await callAI(provider, apiKey, prompt, true);

        try {
            const intent = JSON.parse(text);
            res.json({ intent });
        } catch (parseError) {
            console.error("Failed to parse intent AI response", text);
            res.json({ intent: { action: "unknown", value: null } });
        }

    } catch (error) {
        console.error('Error in /api/intent:', error);
        res.status(500).json({ error: 'AI request failed', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`AI Narration Backend running on http://localhost:${PORT}`);
});
