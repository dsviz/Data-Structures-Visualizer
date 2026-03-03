require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting to protect API quota
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 requests per windowMs
    message: { error: "Too many requests, please try again later." }
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/narrate', async (req, res) => {
    try {
        const { descriptions, dataStructure } = req.body;

        if (!descriptions || !Array.isArray(descriptions)) {
            return res.status(400).json({ error: 'Missing or invalid descriptions array' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
            // Fallback if no key is provided
            return res.json({ narrations: descriptions });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let dataStructureContext = "a visual algorithm execution";
        let additionalInstructions = "";

        if (dataStructure === 'Linked List') {
            dataStructureContext = "a Linked List algorithm (nodes, pointers, traversal, head/tail)";
            additionalInstructions = "For the Linked List, please act as an expert tutor. Use rich, descriptive English terms. When describing pointer manipulations (like 'Redirecting node X to bypass Y' or 'Linking X to Y'), you MUST briefly explain the logical consequence or the 'why' behind it. For example, explain that bypassing a node effectively removes it from the list sequence, or that linking to a new node inserts it into the chain. Make it educational but concise.";
        } else if (dataStructure === 'Graph') {
            dataStructureContext = "a Graph algorithm (nodes, edges, weights, BFS, DFS, Dijkstra)";
        } else if (dataStructure === 'Stack') {
            dataStructureContext = "a Stack data structure operation (LIFO - Last In First Out, push, pop, top pointer)";
            additionalInstructions = "For the Stack, act as an expert tutor. Explain why items are added or removed to/from the 'top' of the stack. Use terminology like 'pushing onto the stack' and 'popping off the stack'.";
        } else if (dataStructure === 'Queue') {
            dataStructureContext = "a Queue data structure operation (FIFO - First In First Out, enqueue, dequeue, front, rear pointers)";
            additionalInstructions = "For the Queue, act as an expert tutor. Explain why items enter at the 'rear' and leave from the 'front'. Use terms like 'enqueueing' and 'dequeueing' and emphasize the FIFO nature.";
        } else if (dataStructure === 'Binary Tree') {
            dataStructureContext = "a Binary Tree algorithm (nodes, root, left/right children, leaves, traversals)";
            additionalInstructions = "For the Binary Tree, act as an expert tutor. Explain the movement down the tree branches (left for smaller, right for larger if it's a BST) and describe the purpose of visiting nodes during traversals.";
        } else if (dataStructure === 'Array') {
            dataStructureContext = "an Array data structure operation (indices, contiguous memory, shifting elements, iteration)";
            additionalInstructions = "For the Array, act as an expert tutor. Explain the importance of index positions. When elements are inserted or removed in the middle, mention how other elements must shift left or right to maintain contiguous memory.";
        } else if (dataStructure) {
            dataStructureContext = `a ${dataStructure} algorithm`;
        }

        const prompt = `
You are JARVIS, Tony Stark's highly advanced AI assistant. 
I have an array of events that happen step by step in ${dataStructureContext}. 
Rewrite each event into a single sentence spoken by JARVIS. 
Use highly formal, precise, and sophisticated English. 
${additionalInstructions}
CRITICAL: You MUST NOT use the word "Sir" or address the user as "Sir". Keep it purely professional and objective.
CRITICAL: You MUST preserve all numerical values, target indices, and identifiers (e.g., "Node 42", "Index 2", "Value 10") mentioned in the raw descriptions.
Keep it very short and conversational in the style of the movie Iron Man. Do not use markdown or special characters.

Here are the raw step descriptions:
${JSON.stringify(descriptions, null, 2)}

Return a raw JSON array of strings containing ONLY the rewritten explanations in the exact same order. Do not return markdown blocks like \`\`\`json. Just the array.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

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

app.listen(PORT, () => {
    console.log(`AI Narration Backend running on http://localhost:${PORT}`);
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
        console.warn("WARNING: GEMINI_API_KEY is not set or is still the default template in .env. The API will return the original descriptions.");
    }
});
