import { useState, useEffect, useRef } from 'react';

export interface GraphNode {
    id: number;
    x: number;
    y: number;
    value: number;
}

export interface GraphEdge {
    from: number;
    to: number;
    weight: number;
    isManual?: boolean;
}

export interface Frame {
    nodes: GraphNode[];
    edges: GraphEdge[];
    highlights: number[]; // Node IDs
    visited: number[]; // Node IDs
    queue: number[]; // Node IDs for BFS
    stack: number[]; // Node IDs for DFS
    edgeHighlights: { from: number; to: number }[];
    codeLine: number;
    pseudoLines: string[];
    description: string;
    distances?: Record<number, number | string>; // For algorithms like Bellman-Ford/Dijkstra
    distances2D?: Record<number, Record<number, number | string>>; // For Floyd-Warshall
    output?: string; // For traversal output
}

const INITIAL_NODES = [
    { id: 0, x: 100, y: 100, value: 0 },
    { id: 1, x: 300, y: 100, value: 1 },
    { id: 2, x: 100, y: 300, value: 2 },
    { id: 3, x: 300, y: 300, value: 3 },
    { id: 4, x: 500, y: 200, value: 4 },
];

const INITIAL_EDGES = [
    { from: 0, to: 1, weight: 1 },
    { from: 1, to: 2, weight: 1 },
    { from: 2, to: 3, weight: 1 },
    { from: 3, to: 4, weight: 1 },
    { from: 1, to: 4, weight: 1 },
    { from: 0, to: 2, weight: 1 },
];

export const useGraphVisualizer = () => {
    // --- State ---
    const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
    const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);
    const [isDirected, setIsDirected] = useState(true);
    const [isWeighted, setIsWeighted] = useState(false);

    // Animation State
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [activeAlgorithm, setActiveAlgorithm] = useState<string | null>(null);

    // Inputs
    const [startNode, setStartNode] = useState<string>('0');

    // Refs for animation loop
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [nextId, setNextId] = useState(INITIAL_NODES.length);
    const [activeTool, setActiveTool] = useState<'move' | 'node' | 'edge' | 'delete' | 'clear'>('move');
    const [selectedNode, setSelectedNode] = useState<number | null>(null); // For edge creation

    // Grid Snapping
    const [isGridSnapped, setIsGridSnapped] = useState(false);
    const GRID_SIZE = 40;
    const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

    // Snapshot for "Reset" functionality
    const [graphSnapshot, setGraphSnapshot] = useState<{ nodes: GraphNode[], edges: GraphEdge[], isDirected: boolean, isWeighted: boolean } | null>(null);

    const saveSnapshot = () => {
        setGraphSnapshot({ nodes: [...nodes], edges: [...edges], isDirected, isWeighted });
    };

    const resetGraph = () => {
        if (graphSnapshot) {
            setNodes(graphSnapshot.nodes);
            setEdges(graphSnapshot.edges);
            setIsDirected(graphSnapshot.isDirected);
            setIsWeighted(graphSnapshot.isWeighted);
            setGraphSnapshot(null);
        }
        resetAnimation();
        setActiveTool('move');
        setSelectedNode(null);
    };

    const hardReset = () => {
        setNodes(INITIAL_NODES);
        setEdges(INITIAL_EDGES);
        setNextId(INITIAL_NODES.length);
        setIsDirected(true);
        setGraphSnapshot(null);
        resetAnimation();
        setActiveTool('move');
        setSelectedNode(null);
    };

    const clearCanvas = () => {
        setNodes([]);
        setEdges([]);
        setNextId(0);
        resetAnimation();
        setSelectedNode(null);
    };

    const addNode = (x: number, y: number) => {
        const finalX = isGridSnapped ? snapToGrid(x) : x;
        const finalY = isGridSnapped ? snapToGrid(y) : y;

        const newNode: GraphNode = {
            id: nextId,
            x: finalX,
            y: finalY,
            value: nextId
        };
        setNodes(prev => [...prev, newNode]);
        setNextId(prev => prev + 1);
        setGraphSnapshot(null);
        resetAnimation();
    };

    const moveNode = (id: number, x: number, y: number) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
        setGraphSnapshot(null);
        resetAnimation();
    };

    const removeNode = (id: number) => {
        setNodes(prev => prev.filter(n => n.id !== id));
        setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
        if (selectedNode === id) setSelectedNode(null);
        setGraphSnapshot(null);
        resetAnimation();
    };

    const addEdge = (from: number, to: number, weight: number = 1, isManual: boolean = false) => {
        if (from === to) return; // Prevent self-loops for now

        // Remove existing edge if any
        setEdges(prev => {
            const newEdges = prev.filter(e => !((e.from === from && e.to === to) || (!isDirected && e.from === to && e.to === from)));
            return [...newEdges, { from, to, weight, isManual }];
        });

        setGraphSnapshot(null);
        resetAnimation();
    };

    const removeEdge = (from: number, to: number) => {
        setEdges(prev => prev.filter(e => !(e.from === from && e.to === to) && !(!isDirected && e.from === to && e.to === from)));
        setGraphSnapshot(null);
        resetAnimation();
    };

    // Helper to get Label (A, B, C...)
    const getNodeLabel = (id: number) => {
        let label = '';
        let num = id;
        do {
            label = String.fromCharCode(65 + (num % 26)) + label;
            num = Math.floor(num / 26) - 1;
        } while (num >= 0);
        return label;
    };

    const getInverseNodeLabel = (label: string): number | null => {
        const upper = label.toUpperCase();
        const node = nodes.find(n => getNodeLabel(n.id) === upper);
        return node ? node.id : null;
    };

    const parseNodeId = (input: string): number | null => {
        // Try to parse as ID first (backward compatibility or if user types number)
        const num = parseInt(input);
        if (!isNaN(num) && nodes.some(n => n.id === num)) return num;

        // Try as Label
        return getInverseNodeLabel(input);
    };

    useEffect(() => {
        resetGraph();
    }, []);

    const resetAnimation = () => {
        setFrames([]);
        setCurrentStep(0);
        setIsPlaying(false);
        setActiveAlgorithm(null);
    }

    // --- Helpers ---
    const getAdjList = () => {
        const adj: Record<number, number[]> = {};
        nodes.forEach(n => adj[n.id] = []);
        edges.forEach(e => {
            adj[e.from].push(e.to);
            if (!isDirected) {
                adj[e.to].push(e.from);
            }
        });
        // Sort for deterministic behavior
        Object.keys(adj).forEach(key => adj[parseInt(key)].sort((a, b) => a - b));
        return adj;
    };

    // --- Algorithms ---

    const runBFS = () => {
        const start = parseNodeId(startNode);
        if (start === null) {
            alert('Invalid start node');
            return;
        }

        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('bfs');
        // ... (rest of logic)
        const newFrames: Frame[] = [];
        const adj = getAdjList();
        const visited = new Set<number>();
        const queue: number[] = [];

        // Initial Frame
        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [],
            visited: [],
            queue: [],
            stack: [],
            edgeHighlights: [],
            codeLine: 0,
            pseudoLines: ["Initialize visited set and queue", "Add start node to visited and queue", "While queue is not empty:", "  Dequeue node u", "  For each neighbor v of u:", "    If v not visited:", "      Mark v visited, enqueue v"],
            description: `Starting BFS from node ${getNodeLabel(start)}.`,
            output: `BFS: `
        });

        // Start
        visited.add(start);
        queue.push(start);
        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [start],
            visited: [start],
            queue: [...queue],
            stack: [],
            edgeHighlights: [],
            codeLine: 1,
            pseudoLines: ["Initialize visited set and queue", "Add start node to visited and queue", "While queue is not empty:", "  Dequeue node u", "  For each neighbor v of u:", "    If v not visited:", "      Mark v visited, enqueue v"],
            description: `Added start node ${getNodeLabel(start)} to queue and visited set.`,
            output: `BFS: ${Array.from(visited).map(id => getNodeLabel(id)).join(', ')}`
        });

        while (queue.length > 0) {
            newFrames.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [queue[0]],
                visited: Array.from(visited),
                queue: [...queue],
                stack: [],
                edgeHighlights: [],
                codeLine: 2,
                pseudoLines: ["Initialize visited set and queue", "Add start node to visited and queue", "While queue is not empty:", "  Dequeue node u", "  For each neighbor v of u:", "    If v not visited:", "      Mark v visited, enqueue v"],
                description: `Checking if queue is empty. It's not.`,
                output: `BFS: ${Array.from(visited).map(id => getNodeLabel(id)).join(', ')}`
            });

            const u = queue.shift()!;

            newFrames.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [u],
                visited: Array.from(visited),
                queue: [...queue],
                stack: [],
                edgeHighlights: [],
                codeLine: 3,
                pseudoLines: ["Initialize visited set and queue", "Add start node to visited and queue", "While queue is not empty:", "  Dequeue node u", "  For each neighbor v of u:", "    If v not visited:", "      Mark v visited, enqueue v"],
                description: `Dequeued node ${getNodeLabel(u)}.`,
                output: `BFS: ${Array.from(visited).map(id => getNodeLabel(id)).join(', ')}`
            });

            const neighbors = adj[u] || [];
            for (const v of neighbors) {
                newFrames.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [u],
                    visited: Array.from(visited),
                    queue: [...queue],
                    stack: [],
                    edgeHighlights: [{ from: u, to: v }],
                    codeLine: 4,
                    pseudoLines: ["Initialize visited set and queue", "Add start node to visited and queue", "While queue is not empty:", "  Dequeue node u", "  For each neighbor v of u:", "    If v not visited:", "      Mark v visited, enqueue v"],
                    description: `Checking neighbor ${getNodeLabel(v)} of node ${getNodeLabel(u)}.`,
                    output: `BFS: ${Array.from(visited).map(id => getNodeLabel(id)).join(', ')}`
                });

                if (!visited.has(v)) {
                    visited.add(v);
                    queue.push(v);

                    newFrames.push({
                        nodes: [...nodes],
                        edges: [...edges],
                        highlights: [u, v],
                        visited: Array.from(visited),
                        queue: [...queue],
                        stack: [],
                        edgeHighlights: [{ from: u, to: v }],
                        codeLine: 6,
                        pseudoLines: ["Initialize visited set and queue", "Add start node to visited and queue", "While queue is not empty:", "  Dequeue node u", "  For each neighbor v of u:", "    If v not visited:", "      Mark v visited, enqueue v"],
                        description: `Node ${getNodeLabel(v)} is not visited. Marking as visited and adding to queue.`,
                        output: `BFS: ${Array.from(visited).map(id => getNodeLabel(id)).join(', ')}`
                    });
                }
            }
        }

        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [],
            visited: Array.from(visited),
            queue: [],
            stack: [],
            edgeHighlights: [],
            codeLine: 0, // End
            pseudoLines: ["Initialize visited set and queue", "Add start node to visited and queue", "While queue is not empty:", "  Dequeue node u", "  For each neighbor v of u:", "    If v not visited:", "      Mark v visited, enqueue v"],
            description: `BFS traversal completed.`,
            output: `BFS: ${Array.from(visited).map(id => getNodeLabel(id)).join(', ')}`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runDFS = () => {
        const start = parseNodeId(startNode);
        if (start === null) {
            alert('Invalid start node');
            return;
        }

        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('dfs');
        const newFrames: Frame[] = [];
        const adj = getAdjList();
        const visited = new Set<number>();

        const stack: number[] = [];

        const dfsRecursive = (u: number) => {
            stack.push(u);
            visited.add(u);
            newFrames.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [u],
                visited: Array.from(visited),
                queue: [],
                stack: [...stack], // Visualize current path in stack overlay
                edgeHighlights: [],
                codeLine: 0,
                pseudoLines: ["Function DFS(u):", "  Mark u as visited", "  For each neighbor v of u:", "    If v not visited:", "      DFS(v)"],
                description: `Visiting node ${getNodeLabel(u)}.`,
                output: `DFS: ${Array.from(visited).map(id => getNodeLabel(id)).join(', ')}`
            });

            const neighbors = adj[u] || [];
            for (const v of neighbors) {
                newFrames.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [u],
                    visited: Array.from(visited),
                    queue: [], // Added queue back to match Frame type
                    stack: [...stack],
                    edgeHighlights: [{ from: u, to: v }],
                    codeLine: 2,
                    pseudoLines: ["Function DFS(u):", "  Mark u as visited", "  For each neighbor v of u:", "    If v not visited:", "      DFS(v)"],
                    description: `Checking neighbor ${getNodeLabel(v)} of node ${getNodeLabel(u)}.`,
                    output: `DFS: ${Array.from(visited).map(id => getNodeLabel(id)).join(', ')}`
                });

                if (!visited.has(v)) {
                    dfsRecursive(v);
                }
            }
            stack.pop();
        };

        dfsRecursive(start);

        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [],
            visited: Array.from(visited),
            queue: [],
            stack: [],
            edgeHighlights: [],
            codeLine: 0, // End
            pseudoLines: ["Function DFS(u):", "  Mark u as visited", "  For each neighbor v of u:", "    If v not visited:", "      DFS(v)"],
            description: `DFS traversal completed.`,
            output: `DFS: ${Array.from(visited).map(id => getNodeLabel(id)).join(', ')}`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    // --- Advanced Algorithms ---

    const runDijkstra = () => {
        const start = parseNodeId(startNode);
        if (start === null) {
            alert('Invalid start node');
            return;
        }

        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('dijkstra');
        const newFrames: Frame[] = [];
        const adj = getAdjList();

        // dist[i] = shortest distance from start to i
        const dist: Record<number, number> = {};
        const prev: Record<number, number | null> = {};
        nodes.forEach(n => {
            dist[n.id] = Infinity;
            prev[n.id] = null;
        });
        dist[start] = 0;

        // Priority Queue (simulated with array sort for visualization simplicity)
        // items: { node: number, dist: number }
        const pq: { node: number, dist: number }[] = [{ node: start, dist: 0 }];
        const visited = new Set<number>();

        // Helper to get SPT edges for visualization
        const getSPTEdges = () => {
            const result: { from: number, to: number }[] = [];
            Object.entries(prev).forEach(([toStr, fromVal]) => {
                if (fromVal !== null) {
                    result.push({ from: fromVal, to: parseInt(toStr) });
                }
            });
            return result;
        };

        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [],
            visited: [],
            queue: [start],
            stack: [],
            edgeHighlights: [],
            codeLine: 0,
            pseudoLines: ["Init dist = infinity, dist[start] = 0", "Push (0, start) to PQ", "While PQ not empty:", "  u = PQ.pop()", "  For v in adj[u]:", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "      PQ.push(dist[v], v)"],
            description: `Dijkstra started. Initialized distances to infinity, dist[${getNodeLabel(start)}] = 0.`
        });

        while (pq.length > 0) {
            // Sort to simulate Min-Heap
            pq.sort((a, b) => a.dist - b.dist);
            const { node: u, dist: d } = pq.shift()!;

            if (d > dist[u]) continue;
            visited.add(u);

            newFrames.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [u],
                visited: Array.from(visited),
                queue: pq.map(item => item.node),
                stack: [],
                edgeHighlights: getSPTEdges(),
                codeLine: 2,
                pseudoLines: ["Init dist = infinity, dist[start] = 0", "Push (0, start) to PQ", "While PQ not empty:", "  u = PQ.pop()", "  For v in adj[u]:", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "      PQ.push(dist[v], v)"],
                description: `Processing node ${getNodeLabel(u)} with distance ${d}.`
            });

            const neighbors = adj[u] || [];
            for (const v of neighbors) {
                // Find weight
                const edge = edges.find(e => (e.from === u && e.to === v) || (!isDirected && e.from === v && e.to === u));
                const weight = isWeighted && edge ? edge.weight : 1;

                newFrames.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [u],
                    visited: Array.from(visited),
                    queue: pq.map(item => item.node),
                    stack: [],
                    edgeHighlights: [...getSPTEdges(), { from: u, to: v }],
                    codeLine: 4,
                    pseudoLines: ["Init dist = infinity, dist[start] = 0", "Push (0, start) to PQ", "While PQ not empty:", "  u = PQ.pop()", "  For v in adj[u]:", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "      PQ.push(dist[v], v)"],
                    description: `Checking neighbor ${getNodeLabel(v)} with weight ${weight}.`
                });

                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    prev[v] = u;
                    pq.push({ node: v, dist: dist[v] });

                    newFrames.push({
                        nodes: [...nodes],
                        edges: [...edges],
                        highlights: [u, v],
                        visited: Array.from(visited),
                        queue: pq.map(item => item.node),
                        stack: [],
                        edgeHighlights: [...getSPTEdges(), { from: u, to: v }], // Current edge + SPT
                        codeLine: 6,
                        pseudoLines: ["Init dist = infinity, dist[start] = 0", "Push (0, start) to PQ", "While PQ not empty:", "  u = PQ.pop()", "  For v in adj[u]:", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "      PQ.push(dist[v], v)"],
                        description: `Relaxed edge (${getNodeLabel(u)}, ${getNodeLabel(v)}). New distance to ${getNodeLabel(v)} is ${dist[v]}.`
                    });
                }
            }
        }

        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [],
            visited: Array.from(visited),
            queue: [],
            stack: [],
            edgeHighlights: getSPTEdges(),
            codeLine: 0,
            pseudoLines: ["Init dist = infinity, dist[start] = 0", "Push (0, start) to PQ", "While PQ not empty:", "  u = PQ.pop()", "  For v in adj[u]:", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "      PQ.push(dist[v], v)"],
            description: `Dijkstra completed.`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runPrim = () => {
        const start = parseNodeId(startNode);
        if (start === null) {
            alert('Invalid start node');
            return;
        }

        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('prim');
        const newFrames: Frame[] = [];
        const adj = getAdjList();

        const mstEdges: GraphEdge[] = [];
        const visited = new Set<number>();
        visited.add(start);

        // Edges available to pick from (cut)
        // { from, to, weight }
        let cutEdges: { from: number, to: number, weight: number }[] = [];

        const addEdges = (u: number) => {
            const neighbors = adj[u] || [];
            for (const v of neighbors) {
                if (!visited.has(v)) {
                    const edge = edges.find(e => (e.from === u && e.to === v) || (!isDirected && e.from === v && e.to === u));
                    const weight = isWeighted && edge ? edge.weight : 1;
                    cutEdges.push({ from: u, to: v, weight });
                }
            }
        };

        addEdges(start);

        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [start],
            visited: [start],
            queue: [],
            stack: [],
            edgeHighlights: [],
            codeLine: 0,
            pseudoLines: ["Init MST set, visited = {start}", "Add edges from start to cut", "While visited != V:", "  Pick min weight edge (u, v) from cut where v not visited", "  Add v to visited, add (u, v) to MST", "  Add edges from v to cut"],
            description: `Prim's Algorithm started. Added start node ${getNodeLabel(start)} to visited.`
        });

        // Loop until all nodes visited or no edges left
        while (visited.size < nodes.length && cutEdges.length > 0) {
            // Sort edges by weight
            cutEdges.sort((a, b) => a.weight - b.weight);

            // Filter out edges where 'to' is already visited (lazy removal)
            let bestEdge = cutEdges.shift();
            while (bestEdge && visited.has(bestEdge.to)) {
                bestEdge = cutEdges.shift();
            }

            if (!bestEdge) break;

            const { from, to, weight } = bestEdge;
            visited.add(to);
            mstEdges.push({ from, to, weight });

            newFrames.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [to],
                visited: Array.from(visited),
                queue: [],
                stack: [], // Not used
                edgeHighlights: mstEdges.map(e => ({ from: e.from, to: e.to })),
                codeLine: 3,
                pseudoLines: ["Init MST set, visited = {start}", "Add edges from start to cut", "While visited != V:", "  Pick min weight edge (u, v) from cut where v not visited", "  Add v to visited, add (u, v) to MST", "  Add edges from v to cut"],
                description: `Picked minimum edge (${getNodeLabel(from)}, ${getNodeLabel(to)}) with weight ${weight}. Added ${getNodeLabel(to)} to MST.`
            });

            addEdges(to);
            newFrames.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [to],
                visited: Array.from(visited),
                queue: [],
                stack: [], // Not used
                edgeHighlights: mstEdges.map(e => ({ from: e.from, to: e.to })),
                codeLine: 5,
                pseudoLines: ["Init MST set, visited = {start}", "Add edges from start to cut", "While visited != V:", "  Pick min weight edge (u, v) from cut where v not visited", "  Add v to visited, add (u, v) to MST", "  Add edges from v to cut"],
                description: `Added edges from ${getNodeLabel(to)} to the cut.`
            });
        }

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runKruskal = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('kruskal');
        const newFrames: Frame[] = [];

        // Sort all edges by weight
        const sortedEdges = [...edges].sort((a, b) => (isWeighted ? a.weight : 1) - (isWeighted ? b.weight : 1));

        // Disjoint Set (Union-Find)
        const parent: Record<number, number> = {};
        nodes.forEach(n => parent[n.id] = n.id);

        const find = (i: number): number => {
            if (parent[i] === i) return i;
            return find(parent[i]);
        };

        const union = (i: number, j: number) => {
            const rootI = find(i);
            const rootJ = find(j);
            if (rootI !== rootJ) {
                parent[rootI] = rootJ;
                return true;
            }
            return false;
        };

        const mstEdges: GraphEdge[] = [];
        const visited = new Set<number>();

        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [],
            visited: [],
            queue: [],
            stack: [],
            edgeHighlights: [],
            codeLine: 0,
            pseudoLines: ["Sort all edges by weight", "Init Union-Find", "For each edge (u, v) in sorted edges:", "  check if u and v in same set", "  if not, union(u, v) and add to MST"],
            description: `Kruskal's Algorithm started. Edges sorted by weight.`
        });

        for (const edge of sortedEdges) {
            const u = edge.from;
            const v = edge.to;

            // Visualizing "Checking Edge"
            newFrames.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [u, v],
                visited: Array.from(visited),
                queue: [],
                stack: [],
                edgeHighlights: [...mstEdges.map(e => ({ from: e.from, to: e.to })), { from: u, to: v }], // Highlight current candidate
                codeLine: 2,
                pseudoLines: ["Sort all edges by weight", "Init Union-Find", "For each edge (u, v) in sorted edges:", "  check if u and v in same set", "  if not, union(u, v) and add to MST"],
                description: `Checking edge (${getNodeLabel(u)}, ${getNodeLabel(v)}) with weight ${edge.weight}.`
            });

            if (union(u, v)) {
                mstEdges.push(edge);
                visited.add(u);
                visited.add(v);

                newFrames.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [u, v],
                    visited: Array.from(visited),
                    queue: [],
                    stack: [],
                    edgeHighlights: mstEdges.map(e => ({ from: e.from, to: e.to })),
                    codeLine: 4,
                    pseudoLines: ["Sort all edges by weight", "Init Union-Find", "For each edge (u, v) in sorted edges:", "  check if u and v in same set", "  if not, union(u, v) and add to MST"],
                    description: `Added edge (${getNodeLabel(u)}, ${getNodeLabel(v)}) to MST.`
                });
            } else {
                newFrames.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [],
                    visited: Array.from(visited),
                    queue: [],
                    stack: [],
                    edgeHighlights: mstEdges.map(e => ({ from: e.from, to: e.to })),
                    codeLine: 3,
                    pseudoLines: ["Sort all edges by weight", "Init Union-Find", "For each edge (u, v) in sorted edges:", "  check if u and v in same set", "  if not, union(u, v) and add to MST"],
                    description: `Edge (${getNodeLabel(u)}, ${getNodeLabel(v)}) forms a cycle. Skipped.`
                });
            }
        }

        // Final Frame
        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [],
            visited: Array.from(visited),
            queue: [],
            stack: [],
            edgeHighlights: mstEdges.map(e => ({ from: e.from, to: e.to })),
            codeLine: 0,
            pseudoLines: ["Sort all edges by weight", "Init Union-Find", "For each edge (u, v) in sorted edges:", "  check if u and v in same set", "  if not, union(u, v) and add to MST"],
            description: `Kruskal's Algorithm completed. MST size: ${mstEdges.length}.`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runBoruvka = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('boruvka');
        const newFrames: Frame[] = [];

        // Disjoint Set (Union-Find)
        const parent: Record<number, number> = {};
        nodes.forEach(n => parent[n.id] = n.id);

        const find = (i: number): number => {
            if (parent[i] === i) return i;
            return find(parent[i]);
        };

        const union = (i: number, j: number) => {
            const rootI = find(i);
            const rootJ = find(j);
            if (rootI !== rootJ) {
                parent[rootI] = rootJ;
                return true;
            }
            return false;
        };

        const mstEdges: GraphEdge[] = [];
        let numTrees = nodes.length;
        const visited = new Set<number>();

        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [],
            visited: [],
            queue: [],
            stack: [],
            edgeHighlights: [],
            codeLine: 0,
            pseudoLines: ["Init components (each node is a component)", "While numTrees > 1:", "  Find cheapest edge for each component", "  Add valid cheapest edges to MST", "  Merge components"],
            description: `Boruvka's Algorithm started. Components: ${numTrees}.`
        });

        // Loop until we have 1 component (or cannot merge anymore)
        while (numTrees > 1 && mstEdges.length < nodes.length - 1) {
            // Store cheapest edge for each component (indexed by component root ID)
            const cheapest: Record<number, GraphEdge | null> = {};
            nodes.forEach(n => cheapest[n.id] = null);

            // Find cheapest edge for each component
            for (const edge of edges) {
                const u = edge.from;
                const v = edge.to;

                const set1 = find(u);
                const set2 = find(v);

                if (set1 !== set2) {
                    const weight = isWeighted ? edge.weight : 1;

                    if (cheapest[set1] === null || (isWeighted ? cheapest[set1]!.weight : 1) > weight) {
                        cheapest[set1] = edge;
                    }
                    if (cheapest[set2] === null || (isWeighted ? cheapest[set2]!.weight : 1) > weight) {
                        cheapest[set2] = edge;
                    }
                }
            }

            // Highlighting Phase: Show cheapest edges identified
            const cheapestEdges = Object.values(cheapest).filter((e): e is GraphEdge => e !== null);
            newFrames.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [...nodes.map(n => n.id)], // Highlight all nodes as we are checking them
                visited: Array.from(visited),
                queue: [],
                stack: [],
                edgeHighlights: [...mstEdges.map(e => ({ from: e.from, to: e.to })), ...cheapestEdges.map(e => ({ from: e.from, to: e.to }))],
                codeLine: 2,
                pseudoLines: ["Init components (each node is a component)", "While numTrees > 1:", "  Find cheapest edge for each component", "  Add valid cheapest edges to MST", "  Merge components"],
                description: `Identified cheapest outgoing edges for components.`
            });

            let merged = false;

            // Correct Iteration for adding edges:
            // Since multiple nodes might point to the same component and same cheapest edge, we need to be careful not to add same edge twice or cycle.
            // But Boruvka handles this naturally because union checks.

            for (const key in cheapest) {
                const edge = cheapest[key];
                if (edge) {
                    const set1 = find(edge.from);
                    const set2 = find(edge.to);

                    if (set1 !== set2) {
                        if (union(set1, set2)) {
                            mstEdges.push(edge);
                            visited.add(edge.from);
                            visited.add(edge.to);
                            numTrees--;
                            merged = true;

                            newFrames.push({
                                nodes: [...nodes],
                                edges: [...edges],
                                highlights: [edge.from, edge.to],
                                visited: Array.from(visited),
                                queue: [],
                                stack: [],
                                edgeHighlights: mstEdges.map(e => ({ from: e.from, to: e.to })),
                                codeLine: 3,
                                pseudoLines: ["Init components (each node is a component)", "While numTrees > 1:", "  Find cheapest edge for each component", "  Add valid cheapest edges to MST", "  Merge components"],
                                description: `Added edge (${getNodeLabel(edge.from)}, ${getNodeLabel(edge.to)}) connecting components.`
                            });
                        }
                    }
                }
            }

            if (!merged) break; // Should not happen if connected and numTrees > 1
        }

        // Final Frame
        newFrames.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [],
            visited: Array.from(visited),
            queue: [],
            stack: [],
            edgeHighlights: mstEdges.map(e => ({ from: e.from, to: e.to })),
            codeLine: 0,
            pseudoLines: ["Init components (each node is a component)", "While numTrees > 1:", "  Find cheapest edge for each component", "  Add valid cheapest edges to MST", "  Merge components"],
            description: `Boruvka's Algorithm completed. MST size: ${mstEdges.length}.`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    // --- Basics Concept Algorithms ---

    const runNodeDegree = () => {
        const start = parseNodeId(startNode);
        if (start === null) {
            alert('Invalid start node');
            return;
        }

        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('nodeDegree');
        const newFrames: Frame[] = [];

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [start], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["Find the node", "Count all edges safely connected to it"],
            description: `Starting Node Degree check for node ${getNodeLabel(start)}.`
        });

        const connectedEdges = edges.filter(e => e.from === start || e.to === start);
        let inDegree = 0;
        let outDegree = 0;
        let totalDegree = 0;

        const highlightedEdges: { from: number, to: number }[] = [];

        connectedEdges.forEach((edge) => {
            highlightedEdges.push({ from: edge.from, to: edge.to });

            if (isDirected) {
                if (edge.from === start) outDegree++;
                if (edge.to === start) inDegree++;
                totalDegree = inDegree + outDegree;
            } else {
                totalDegree++;
            }

            const degreeStr = isDirected ? `(In: ${inDegree}, Out: ${outDegree}, Total: ${totalDegree})` : `(Total Degree: ${totalDegree})`;

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [start], visited: [], queue: [], stack: [],
                edgeHighlights: [...highlightedEdges], codeLine: 1,
                pseudoLines: ["Find the node", "Count all edges safely connected to it"],
                description: `Found connected edge between ${getNodeLabel(edge.from)} and ${getNodeLabel(edge.to)}. Current Degree: ${degreeStr}`
            });
        });

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [start], visited: [], queue: [], stack: [],
            edgeHighlights: [...highlightedEdges], codeLine: 0,
            pseudoLines: ["Find the node", "Count all edges safely connected to it"],
            description: `Check complete! ${isDirected ? `In-Degree: ${inDegree}, Out-Degree: ${outDegree}` : `Total Degree: ${totalDegree}`}`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runHighlightNeighbors = () => {
        const start = parseNodeId(startNode);
        if (start === null) {
            alert('Invalid start node');
            return;
        }

        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('neighbors');
        const newFrames: Frame[] = [];

        const adj = getAdjList();
        const neighbors = adj[start] || [];

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [start], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["Find target node", "Highlight all immediate neighbors (1-hop)"],
            description: `Highlighting neighbors for node ${getNodeLabel(start)}.`
        });

        const edgeH = neighbors.map(v => ({ from: start, to: v }));

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [start, ...neighbors], visited: [], queue: [], stack: [],
            edgeHighlights: edgeH, codeLine: 1,
            pseudoLines: ["Find target node", "Highlight all immediate neighbors (1-hop)"],
            description: `Node ${getNodeLabel(start)} has ${neighbors.length} neighbor(s): ${neighbors.map(n => getNodeLabel(n)).join(', ') || 'None'}`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runCheckConnectivity = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('connectivity');
        const newFrames: Frame[] = [];

        const adj = getAdjList();
        const visited = new Set<number>();
        let components = 0;

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["For each node:", "  If not visited, start a new traversal", "  Mark all reachable nodes as same component", "Count distinct components"],
            description: `Starting Connectivity Check. Sweeping graph to find isolated components.`
        });

        for (const node of nodes) {
            if (!visited.has(node.id)) {
                components++;
                const componentNodes: number[] = [];
                const queue = [node.id];
                visited.add(node.id);

                newFrames.push({
                    nodes: [...nodes], edges: [...edges], highlights: [node.id], visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [], codeLine: 1,
                    pseudoLines: ["For each node:", "  If not visited, start a new traversal", "  Mark all reachable nodes as same component", "Count distinct components"],
                    description: `Found unvisited node ${getNodeLabel(node.id)}. Starting Component #${components}.`
                });

                // Simple BFS to find all connected parts
                while (queue.length > 0) {
                    const u = queue.shift()!;
                    componentNodes.push(u);

                    for (const v of (adj[u] || [])) {
                        if (!visited.has(v)) {
                            visited.add(v);
                            queue.push(v);
                        }
                    }
                }

                newFrames.push({
                    nodes: [...nodes], edges: [...edges], highlights: componentNodes, visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [], codeLine: 2,
                    pseudoLines: ["For each node:", "  If not visited, start a new traversal", "  Mark all reachable nodes as same component", "Count distinct components"],
                    description: `Component #${components} contains ${componentNodes.length} nodes: ${componentNodes.map(n => getNodeLabel(n)).join(', ')}`
                });
            }
        }

        const msg = components === 1
            ? (isDirected ? "Graph is Weakly/Strongly Connected." : "Graph is Fully Connected.")
            : `Graph is Disconnected! Found ${components} isolated components.`;

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [...nodes.map(n => n.id)], queue: [], stack: [], edgeHighlights: [], codeLine: 3,
            pseudoLines: ["For each node:", "  If not visited, start a new traversal", "  Mark all reachable nodes as same component", "Count distinct components"],
            description: msg
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runDetectCycle = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('detectCycle');
        const newFrames: Frame[] = [];

        const adj = getAdjList();

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["Run DFS from each unvisited node", "Keep track of the recursion 'stack'", "If we see a node already in the current stack:", "  Cycle detected!"],
            description: `Starting Cycle Detection...`
        });

        // For directed graphs, we track current recursion stack.
        // For undirected, we track the 'parent' to avoid trivial cycles (A-B-A)
        const visited = new Set<number>();
        const recStack = new Set<number>();
        let foundCycle = false;

        const dfsUndirected = (v: number, parent: number): boolean => {
            visited.add(v);

            for (const neighbor of (adj[v] || [])) {
                if (!visited.has(neighbor)) {
                    if (dfsUndirected(neighbor, v)) return true;
                } else if (neighbor !== parent) {
                    // Back edge found!
                    return true;
                }
            }
            return false;
        };

        const dfsDirected = (v: number): boolean => {
            visited.add(v);
            recStack.add(v);

            for (const neighbor of (adj[v] || [])) {
                if (!visited.has(neighbor)) {
                    if (dfsDirected(neighbor)) return true;
                } else if (recStack.has(neighbor)) {
                    // Back edge found!
                    return true;
                }
            }
            recStack.delete(v);
            return false;
        };

        for (const node of nodes) {
            if (!visited.has(node.id)) {
                const hasCycle = isDirected ? dfsDirected(node.id) : dfsUndirected(node.id, -1);
                if (hasCycle) {
                    foundCycle = true;
                    break;
                }
            }
        }

        if (foundCycle) {
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 3,
                pseudoLines: ["Run DFS from each unvisited node", "Keep track of the recursion 'stack'", "If we see a node already in the current stack:", "  Cycle detected!"],
                description: `Cycle Detected! The graph contains at least one cycle (a closed loop).`
            });
        } else {
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 4,
                pseudoLines: ["Run DFS from each unvisited node", "Keep track of the recursion 'stack'", "If we see a node already in the current stack:", "  Cycle detected!"],
                description: `No cycles found. This graph is Acyclic${!isDirected && visited.size === nodes.length ? ' (It is a Tree/Forest)' : ''}.`
            });
        }

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runBellmanFord = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('bellmanFord');
        const newFrames: Frame[] = [];
        const n = nodes.length;

        if (n === 0) return;
        const start = startNode !== null ? (startNode as unknown as number) : (nodes[0].id as unknown as number);

        const dist: Record<number, number> = {};
        const p: Record<number, number | null> = {};
        nodes.forEach(node => {
            dist[node.id as number] = Infinity;
            p[node.id as number] = null;
        });
        dist[start as number] = 0;

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [start], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, "for i from 1 to V-1:", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
            description: `Initializing distances. Distance to start node ${getNodeLabel(start)} is 0, others Infinity.`,
            distances: { ...dist } as Record<number, number | string>
        });

        // Relax edges V-1 times
        for (let i = 1; i <= n - 1; i++) {
            let relaxedAny = false;

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 2,
                pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, `for i from 1 to V-1 (Iteration ${i}):`, "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
                description: `Iteration ${i} of ${n - 1}: Relaxing all edges.`,
                distances: { ...dist } as Record<number, number | string>
            });

            for (const edge of edges) {
                const u = edge.from as number;
                const v = edge.to as number;
                const weight = edge.weight || 0;

                newFrames.push({
                    nodes: [...nodes], edges: [...edges], highlights: [u, v], visited: [], queue: [], stack: [], edgeHighlights: [{ from: u, to: v }], codeLine: 3,
                    pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, "for i from 1 to V-1:", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
                    description: `Checking edge ${getNodeLabel(u)}->${getNodeLabel(v)} (weight ${weight}). dist[${getNodeLabel(u)}] = ${dist[u] === Infinity ? '∞' : dist[u]}, dist[${getNodeLabel(v)}] = ${dist[v] === Infinity ? '∞' : dist[v]}`,
                    distances: { ...dist } as Record<number, number | string>
                });

                if (dist[u as number] !== Infinity && dist[u as number] + weight < dist[v as number]) {
                    dist[v as number] = dist[u as number] + weight;
                    p[v as number] = u as number;
                    relaxedAny = true;

                    newFrames.push({
                        nodes: [...nodes], edges: [...edges], highlights: [v], visited: [], queue: [], stack: [], edgeHighlights: [{ from: u, to: v }], codeLine: 5,
                        pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, "for i from 1 to V-1:", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
                        description: `Relaxed! dist[${getNodeLabel(v)}] is now ${dist[v as number]}.`,
                        distances: { ...dist } as Record<number, number | string>
                    });
                }

                // If undirected, we must also check the reverse direction v -> u
                if (!isDirected) {
                    newFrames.push({
                        nodes: [...nodes], edges: [...edges], highlights: [v, u], visited: [], queue: [], stack: [], edgeHighlights: [{ from: u, to: v }], codeLine: 3,
                        pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, "for i from 1 to V-1:", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
                        description: `Checking reverse edge ${getNodeLabel(v)}->${getNodeLabel(u)} (weight ${weight}).`,
                        distances: { ...dist } as Record<number, number | string>
                    });

                    if (dist[v as number] !== Infinity && dist[v as number] + weight < dist[u as number]) {
                        dist[u as number] = dist[v as number] + weight;
                        p[u as number] = v as number;
                        relaxedAny = true;

                        newFrames.push({
                            nodes: [...nodes], edges: [...edges], highlights: [u], visited: [], queue: [], stack: [], edgeHighlights: [{ from: u, to: v }], codeLine: 5,
                            pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, "for i from 1 to V-1:", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
                            description: `Relaxed! dist[${getNodeLabel(u)}] is now ${dist[u as number]}.`,
                            distances: { ...dist } as Record<number, number | string>
                        });
                    }
                }
            }

            // Optimization: if no edges were relaxed in this iteration, we can stop early.
            if (!relaxedAny) {
                newFrames.push({
                    nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: -1,
                    pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, "for i from 1 to V-1:", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
                    description: `Optimization: No edges relaxed during iteration ${i}. Algorithm can terminate early.`,
                    distances: { ...dist } as Record<number, number | string>
                });
                break;
            }
        }

        // Check for negative-weight cycles
        let negativeCycle = false;

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 6,
            pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, "for i from 1 to V-1:", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
            description: `Checking for negative weight cycles.`,
            distances: { ...dist } as Record<number, number | string>
        });

        for (const edge of edges) {
            const u = edge.from as number;
            const v = edge.to as number;
            const weight = edge.weight || 0;
            if (dist[u as number] !== Infinity && dist[u as number] + weight < dist[v as number]) {
                negativeCycle = true;
                newFrames.push({
                    nodes: [...nodes], edges: [...edges], highlights: [u, v], visited: [], queue: [], stack: [], edgeHighlights: [{ from: u, to: v }], codeLine: 8,
                    pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, "for i from 1 to V-1:", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
                    description: `Negative Weight Cycle Detected along edge ${getNodeLabel(u as number)}->${getNodeLabel(v as number)}!`,
                    distances: { ...dist } as Record<number, number | string>
                });
                break; // One is enough to prove it exists
            }
            if (!isDirected && dist[v as number] !== Infinity && dist[v as number] + weight < dist[u as number]) {
                negativeCycle = true;
                newFrames.push({
                    nodes: [...nodes], edges: [...edges], highlights: [v, u], visited: [], queue: [], stack: [], edgeHighlights: [{ from: u, to: v }], codeLine: 8,
                    pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, "for i from 1 to V-1:", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
                    description: `Negative Weight Cycle Detected along reverse edge ${getNodeLabel(v as number)}->${getNodeLabel(u as number)}!`,
                    distances: { ...dist } as Record<number, number | string>
                });
                break;
            }
        }

        const finalEdgeHighlights: { from: number, to: number }[] = [];
        if (!negativeCycle) {
            nodes.forEach(node => {
                const parent = p[node.id as number];
                if (parent !== null) {
                    finalEdgeHighlights.push({ from: parent, to: node.id as number });
                }
            });
        }

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: finalEdgeHighlights, codeLine: -1,
            pseudoLines: ["dist = [Infinity] * V", `dist[${getNodeLabel(start)}] = 0`, "for i from 1 to V-1:", "  for each edge (u, v, w):", "    if dist[u] + w < dist[v]:", "      dist[v] = dist[u] + w", "for each edge (u, v, w):", "  if dist[u] + w < dist[v]:", "    Negative Cycle Detected!"],
            description: negativeCycle ? `Bellman-Ford failed due to a negative-weight cycle.` : `Bellman-Ford completed. Shortest paths found!`,
            distances: { ...dist } as Record<number, number | string>
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runFloydWarshall = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('floydWarshall');
        const newFrames: Frame[] = [];
        const n = nodes.length;

        if (n === 0) return;

        // Initialize distance matrix
        const dist: Record<number, Record<number, number>> = {};
        nodes.forEach(u => {
            dist[u.id] = {};
            nodes.forEach(v => {
                dist[u.id][v.id] = u.id === v.id ? 0 : Infinity;
            });
        });

        edges.forEach(edge => {
            const u = edge.from as number;
            const v = edge.to as number;
            const weight = edge.weight || 0; // Use 0 for unweighted just in case, though usually 1 is better, let's stick to edge.weight
            dist[u][v] = Math.min(dist[u][v], weight);
            if (!isDirected) {
                dist[v][u] = Math.min(dist[v][u], weight);
            }
        });

        const getDistMatrixSnapshot = () => {
            const snapshot: Record<number, Record<number, number | string>> = {};
            nodes.forEach(u => {
                snapshot[u.id] = {};
                nodes.forEach(v => {
                    snapshot[u.id][v.id] = dist[u.id][v.id] === Infinity ? '∞' : dist[u.id][v.id];
                });
            });
            return snapshot;
        };

        const pseudocode = [
            "dist = matrix initialized to Infinity",
            "for each edge (u, v, weight): dist[u][v] = weight",
            "for k from 1 to V:",
            "  for i from 1 to V:",
            "    for j from 1 to V:",
            "      if dist[i][k] + dist[k][j] < dist[i][j]:",
            "        dist[i][j] = dist[i][k] + dist[k][j]"
        ];

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: pseudocode,
            description: `Initializing all-pairs distance matrix with given edges.`,
            distances2D: getDistMatrixSnapshot()
        });

        for (let k = 0; k < n; k++) {
            const nodeK = nodes[k];

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [nodeK.id], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 2,
                pseudoLines: pseudocode,
                description: `Considering node ${getNodeLabel(nodeK.id)} as an intermediate vertex (k).`,
                distances2D: getDistMatrixSnapshot()
            });

            for (let i = 0; i < n; i++) {
                const nodeI = nodes[i];
                if (i === k) continue; // Small optimization

                for (let j = 0; j < n; j++) {
                    const nodeJ = nodes[j];
                    if (j === k || i === j) continue; // Optimization: dist to self is likely 0 unless negative cycle, and same node k

                    if (dist[nodeI.id][nodeK.id] !== Infinity && dist[nodeK.id][nodeJ.id] !== Infinity) {
                        const newDist = dist[nodeI.id][nodeK.id] + dist[nodeK.id][nodeJ.id];

                        // Show checking the path
                        newFrames.push({
                            nodes: [...nodes], edges: [...edges], highlights: [nodeK.id, nodeI.id, nodeJ.id], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 5,
                            pseudoLines: pseudocode,
                            description: `Checking path ${getNodeLabel(nodeI.id)} -> ${getNodeLabel(nodeK.id)} -> ${getNodeLabel(nodeJ.id)}. Distance is ${dist[nodeI.id][nodeK.id]} + ${dist[nodeK.id][nodeJ.id]} = ${newDist}, current shortest is ${dist[nodeI.id][nodeJ.id] === Infinity ? '∞' : dist[nodeI.id][nodeJ.id]}`,
                            distances2D: getDistMatrixSnapshot()
                        });

                        if (newDist < dist[nodeI.id][nodeJ.id]) {
                            dist[nodeI.id][nodeJ.id] = newDist;

                            newFrames.push({
                                nodes: [...nodes], edges: [...edges], highlights: [nodeK.id, nodeI.id, nodeJ.id], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 6,
                                pseudoLines: pseudocode,
                                description: `Shorter path found! dist[${getNodeLabel(nodeI.id)}][${getNodeLabel(nodeJ.id)}] updated to ${newDist}.`,
                                distances2D: getDistMatrixSnapshot()
                            });
                        }
                    }
                }
            }
        }

        // Negative cycle check
        let hasNegativeCycle = false;
        for (let i = 0; i < n; i++) {
            if (dist[nodes[i].id][nodes[i].id] < 0) {
                hasNegativeCycle = true;
                break;
            }
        }

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: -1,
            pseudoLines: pseudocode,
            description: hasNegativeCycle ? "Negative weight cycle detected (diagonal has negative values)!" : "Floyd-Warshall completed. All pairs shortest paths calculated.",
            distances2D: getDistMatrixSnapshot()
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runAStar = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('aStar');
        const newFrames: Frame[] = [];

        if (nodes.length === 0) return;
        const start = startNode !== null ? (startNode as unknown as number) : (nodes[0].id as unknown as number);

        let target = (nodes[nodes.length - 1].id as number);
        if (target === start && nodes.length > 1) {
            target = (nodes[nodes.length - 2].id as number);
        }

        const targetNodeObj = nodes.find(n => n.id === target);
        if (!targetNodeObj) return;

        // heuristic function: Euclidean distance
        const heuristic = (nodeId: number) => {
            const n = nodes.find(n => n.id === nodeId);
            if (!n) return Infinity;
            return Math.sqrt(Math.pow(n.x - targetNodeObj.x, 2) + Math.pow(n.y - targetNodeObj.y, 2));
        };

        const gScore: Record<number, number> = {};
        const fScore: Record<number, number | string> = {};
        const p: Record<number, number | null> = {};

        nodes.forEach(node => {
            gScore[node.id as number] = Infinity;
            fScore[node.id as number] = '∞';
            p[node.id as number] = null;
        });

        gScore[start] = 0;
        fScore[start] = heuristic(start).toFixed(1);

        const openSet = new Set<number>([start]);
        const closedSet = new Set<number>();
        const adj = getAdjList();

        const pseudocode = [
            `gScore[start] = 0, fScore[start] = h(start)`,
            "openSet = {start}",
            "while openSet is not empty:",
            "  current = node in openSet with lowest fScore",
            "  if current == target:",
            "    return RECONSTRUCT_PATH()",
            "  openSet.remove(current), closedSet.add(current)",
            "  for each neighbor of current:",
            "    tentative_gScore = gScore[current] + weight(current, neighbor)",
            "    if tentative_gScore < gScore[neighbor]:",
            "      gScore[neighbor] = tentative_gScore",
            "      fScore[neighbor] = tentative_gScore + h(neighbor)",
            "      if neighbor not in openSet:",
            "        openSet.add(neighbor)"
        ];

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [start, target], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: pseudocode,
            description: `A* Search starting. Start Node: ${getNodeLabel(start)}, Target Node: ${getNodeLabel(target)}.\nh(n) = Euclidean distance to target. Displying fScore = g(n) + h(n)`,
            distances: { ...fScore } as Record<number, number | string>
        });

        const edgeHighlights: { from: number; to: number }[] = [];
        let found = false;

        while (openSet.size > 0) {
            let currentStr = Array.from(openSet).reduce((a, b) => Number(fScore[a]) < Number(fScore[b]) ? a : b);
            const current = currentStr as number;

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [current], visited: Array.from(closedSet), queue: Array.from(openSet), stack: [], edgeHighlights: [...edgeHighlights], codeLine: 3,
                pseudoLines: pseudocode,
                description: `Selected ${getNodeLabel(current)} from openSet with lowest fScore: ${fScore[current]}.`,
                distances: { ...fScore } as Record<number, number | string>
            });

            if (current === target) {
                found = true;
                newFrames.push({
                    nodes: [...nodes], edges: [...edges], highlights: [current], visited: Array.from(closedSet), queue: Array.from(openSet), stack: [], edgeHighlights: [...edgeHighlights], codeLine: 5,
                    pseudoLines: pseudocode,
                    description: `Target ${getNodeLabel(target)} reached! Reconstructing path...`,
                    distances: { ...fScore } as Record<number, number | string>
                });
                break;
            }

            openSet.delete(current);
            closedSet.add(current);

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [current], visited: Array.from(closedSet), queue: Array.from(openSet), stack: [], edgeHighlights: [...edgeHighlights], codeLine: 6,
                pseudoLines: pseudocode,
                description: `Moved ${getNodeLabel(current)} to closedSet. Checking neighbors...`,
                distances: { ...fScore } as Record<number, number | string>
            });

            const neighbors = adj[current] || [];

            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor)) continue;

                const edge = edges.find(e =>
                    (e.from === current && e.to === neighbor) ||
                    (!isDirected && e.from === neighbor && e.to === current)
                );
                const weight = edge ? (edge.weight || 1) : 1;

                const tentative_gScore = gScore[current] + weight;

                newFrames.push({
                    nodes: [...nodes], edges: [...edges], highlights: [neighbor, current], visited: Array.from(closedSet), queue: Array.from(openSet), stack: [], edgeHighlights: [...edgeHighlights, { from: current, to: neighbor }], codeLine: 8,
                    pseudoLines: pseudocode,
                    description: `Checking neighbor ${getNodeLabel(neighbor)}. Tentative gScore: ${gScore[current]} + ${weight} = ${tentative_gScore}. Current gScore: ${gScore[neighbor] === Infinity ? '∞' : gScore[neighbor]}.`,
                    distances: { ...fScore } as Record<number, number | string>
                });

                if (tentative_gScore < gScore[neighbor]) {
                    p[neighbor] = current;
                    gScore[neighbor] = tentative_gScore;
                    const hDist = heuristic(neighbor);
                    fScore[neighbor] = (gScore[neighbor] + hDist).toFixed(1);

                    edgeHighlights.push({ from: current, to: neighbor });

                    if (!openSet.has(neighbor)) {
                        openSet.add(neighbor);
                    }

                    newFrames.push({
                        nodes: [...nodes], edges: [...edges], highlights: [neighbor], visited: Array.from(closedSet), queue: Array.from(openSet), stack: [], edgeHighlights: [...edgeHighlights], codeLine: 10,
                        pseudoLines: pseudocode,
                        description: `Found shorter path to ${getNodeLabel(neighbor)}. Updated gScore=${gScore[neighbor]}, h=${hDist.toFixed(1)}, fScore=${fScore[neighbor]}. Added to openSet.`,
                        distances: { ...fScore } as Record<number, number | string>
                    });
                }
            }
        }

        if (!found) {
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: Array.from(closedSet), queue: Array.from(openSet), stack: [], edgeHighlights: [...edgeHighlights], codeLine: -1,
                pseudoLines: pseudocode,
                description: `Open set exhausted. Target ${getNodeLabel(target)} is unreachable from ${getNodeLabel(start)}.`,
                distances: { ...fScore } as Record<number, number | string>
            });
        } else {
            // Reconstruct path
            const path: number[] = [];
            let curr: number | null = target;
            const pathEdges: { from: number, to: number }[] = [];
            while (curr !== null) {
                path.unshift(curr);
                const parentNode = p[curr as number];
                if (parentNode !== null) {
                    pathEdges.unshift({ from: parentNode as number, to: curr as number });
                }
                curr = parentNode as number | null;
            }
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: path, visited: Array.from(closedSet), queue: Array.from(openSet), stack: [], edgeHighlights: pathEdges, codeLine: -1,
                pseudoLines: pseudocode,
                description: `A* Search Path found! Cost: ${gScore[target]}. Path: ${path.map(n => getNodeLabel(n as number)).join(' -> ')}`,
                distances: { ...fScore } as Record<number, number | string>
            });
        }

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runTopologicalSort = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('topological');
        const newFrames: Frame[] = [];

        if (!isDirected) {
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: -1,
                pseudoLines: ["Topological Sort requires a Directed graph."],
                description: "Graph must be Directed."
            });
            setFrames(newFrames);
            setCurrentStep(0);
            setIsPlaying(true);
            return;
        }

        const adj = getAdjList();
        const visited = new Set<number>();
        const visiting = new Set<number>();
        const topoOrder: number[] = [];
        let hasCycle = false;

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["Run DFS on graph", "If cycle detected, stop (not a DAG)", "On DFS post-order, push add to stack", "Reverse stack for Topo Order"],
            description: "Starting Topological Sort (DFS-based)."
        });

        const dfs = (u: number): void => {
            if (hasCycle) return;
            visiting.add(u);

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [u], visited: Array.from(visited), queue: [], stack: [...topoOrder], edgeHighlights: [], codeLine: 0,
                pseudoLines: ["Run DFS on graph", "If cycle detected, stop (not a DAG)", "On DFS post-order, push add to stack", "Reverse stack for Topo Order"],
                description: `Visiting node ${getNodeLabel(u)}.`
            });

            for (const v of (adj[u] || [])) {
                if (hasCycle) return;
                if (visiting.has(v)) {
                    hasCycle = true;
                    newFrames.push({
                        nodes: [...nodes], edges: [...edges], highlights: [u, v], visited: Array.from(visited), queue: [], stack: [...topoOrder], edgeHighlights: [{ from: u, to: v }], codeLine: 1,
                        pseudoLines: ["Run DFS on graph", "If cycle detected, stop (not a DAG)", "On DFS post-order, push add to stack", "Reverse stack for Topo Order"],
                        description: `Cycle detected at edge ${getNodeLabel(u)} -> ${getNodeLabel(v)}. Graph is not a DAG.`
                    });
                    return;
                }
                if (!visited.has(v)) {
                    dfs(v);
                }
            }
            if (hasCycle) return;

            visiting.delete(u);
            visited.add(u);
            topoOrder.push(u);

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [u], visited: Array.from(visited), queue: [], stack: [...topoOrder], edgeHighlights: [], codeLine: 2,
                pseudoLines: ["Run DFS on graph", "If cycle detected, stop (not a DAG)", "On DFS post-order, push add to stack", "Reverse stack for Topo Order"],
                description: `Finished DFS for ${getNodeLabel(u)}. Adding to Topological Sort stack.`
            });
        };

        for (const node of nodes) {
            if (hasCycle) break;
            if (!visited.has(node.id)) {
                dfs(node.id);
            }
        }

        if (!hasCycle) {
            const finalOrder = topoOrder.reverse();
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: Array.from(visited), queue: [], stack: [...finalOrder], edgeHighlights: [], codeLine: 3,
                pseudoLines: ["Run DFS on graph", "If cycle detected, stop (not a DAG)", "On DFS post-order, push add to stack", "Reverse stack for Topo Order"],
                description: `Topological Sort complete! Order: ${finalOrder.map(n => getNodeLabel(n)).join(' → ')}`
            });
        }

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runKahn = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('kahn');
        const newFrames: Frame[] = [];

        if (!isDirected) {
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: -1,
                pseudoLines: ["Kahn's Algorithm requires a Directed graph."],
                description: "Graph must be Directed."
            });
            setFrames(newFrames);
            setCurrentStep(0);
            setIsPlaying(true);
            return;
        }

        const adj = getAdjList();
        const inDegree: Record<number, number> = {};
        nodes.forEach(n => inDegree[n.id] = 0);
        edges.forEach(e => inDegree[e.to]++);

        const queue: number[] = [];
        const topoOrder: number[] = [];

        nodes.forEach(n => {
            if (inDegree[n.id] === 0) queue.push(n.id);
        });

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [...queue], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["Compute in-degree of all nodes", "Enqueue all nodes with in-degree 0", "While queue not empty: dequeue, add to order", "  Decrease in-degree of neighbors, enqueue if 0"],
            description: `Starting Kahn's Algorithm. Found nodes with 0 in-degree: ${queue.length > 0 ? queue.map(n => getNodeLabel(n)).join(', ') : 'None'}`
        });

        while (queue.length > 0) {
            const u = queue.shift()!;
            topoOrder.push(u);

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [u], visited: [...topoOrder], queue: [...queue], stack: [], edgeHighlights: [], codeLine: 2,
                pseudoLines: ["Compute in-degree of all nodes", "Enqueue all nodes with in-degree 0", "While queue not empty: dequeue, add to order", "  Decrease in-degree of neighbors, enqueue if 0"],
                description: `Dequeued node ${getNodeLabel(u)} and added to topological order.`
            });

            for (const v of (adj[u] || [])) {
                inDegree[v]--;
                const edgeH = { from: u, to: v };

                let desc = `Decreased in-degree of neighbor ${getNodeLabel(v)} to ${inDegree[v]}.`;
                if (inDegree[v] === 0) {
                    queue.push(v);
                    desc += ` Node ${getNodeLabel(v)} now has 0 in-degree. Enqueuing.`;
                }

                newFrames.push({
                    nodes: [...nodes], edges: [...edges], highlights: [u, v], visited: [...topoOrder], queue: [...queue], stack: [], edgeHighlights: [edgeH], codeLine: 3,
                    pseudoLines: ["Compute in-degree of all nodes", "Enqueue all nodes with in-degree 0", "While queue not empty: dequeue, add to order", "  Decrease in-degree of neighbors, enqueue if 0"],
                    description: desc
                });
            }
        }

        if (topoOrder.length === nodes.length) {
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: [...topoOrder], queue: [], stack: [], edgeHighlights: [], codeLine: -1,
                pseudoLines: ["Compute in-degree of all nodes", "Enqueue all nodes with in-degree 0", "While queue not empty: dequeue, add to order", "  Decrease in-degree of neighbors, enqueue if 0"],
                description: `Kahn's Algorithm complete! Order: ${topoOrder.map(n => getNodeLabel(n)).join(' → ')}`
            });
        } else {
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: [...topoOrder], queue: [], stack: [], edgeHighlights: [], codeLine: -1,
                pseudoLines: ["Compute in-degree of all nodes", "Enqueue all nodes with in-degree 0", "While queue not empty: dequeue, add to order", "  Decrease in-degree of neighbors, enqueue if 0"],
                description: `Graph has a cycle! Could not process all nodes. Remaining nodes have in-degree > 0.`
            });
        }

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runTarjanBridges = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('tarjan');
        const newFrames: Frame[] = [];

        const adj = getAdjList();
        const visited = new Set<number>();
        const disc: Record<number, number> = {};
        const low: Record<number, number> = {};
        const parent: Record<number, number> = {};
        let time = 0;
        const bridges: { from: number, to: number }[] = [];

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["Run DFS, tracking discovery time & lowest reachable time", "If neighbor is visited, update low[u] = min(low[u], disc[v])", "If unvisited, recurse. Then low[u] = min(low[u], low[v])", "If low[v] > disc[u], edge (u, v) is a bridge!"],
            description: "Starting Tarjan's Bridge-Finding Algorithm. We will run DFS to find critical edges."
        });

        const dfs = (u: number): void => {
            visited.add(u);
            disc[u] = low[u] = ++time;

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [u], visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [...bridges], codeLine: 0,
                pseudoLines: ["Run DFS, tracking discovery time & lowest reachable time", "If neighbor is visited, update low[u] = min(low[u], disc[v])", "If unvisited, recurse. Then low[u] = min(low[u], low[v])", "If low[v] > disc[u], edge (u, v) is a bridge!"],
                description: `Visited node ${getNodeLabel(u)} at time ${time}.`
            });

            for (const v of (adj[u] || [])) {
                if (!visited.has(v)) {
                    parent[v] = u;
                    dfs(v);

                    low[u] = Math.min(low[u], low[v]);

                    if (low[v] > disc[u]) {
                        bridges.push({ from: u, to: v });
                        newFrames.push({
                            nodes: [...nodes], edges: [...edges], highlights: [u, v], visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [...bridges], codeLine: 3,
                            pseudoLines: ["Run DFS, tracking discovery time & lowest reachable time", "If neighbor is visited, update low[u] = min(low[u], disc[v])", "If unvisited, recurse. Then low[u] = min(low[u], low[v])", "If low[v] > disc[u], edge (u, v) is a bridge!"],
                            description: `Bridge found! Edge ${getNodeLabel(u)}-${getNodeLabel(v)} is critical to connectivity.`
                        });
                    }
                } else if (v !== parent[u]) {
                    low[u] = Math.min(low[u], disc[v]);
                }
            }

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [u], visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [...bridges], codeLine: 0,
                pseudoLines: ["Run DFS, tracking discovery time & lowest reachable time", "If neighbor is visited, update low[u] = min(low[u], disc[v])", "If unvisited, recurse. Then low[u] = min(low[u], low[v])", "If low[v] > disc[u], edge (u, v) is a bridge!"],
                description: `Finished checking neighbors for node ${getNodeLabel(u)}.`
            });
        };

        for (const node of nodes) {
            if (!visited.has(node.id)) {
                dfs(node.id);
            }
        }

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [...bridges], codeLine: -1,
            pseudoLines: ["Run DFS, tracking discovery time & lowest reachable time", "If neighbor is visited, update low[u] = min(low[u], disc[v])", "If unvisited, recurse. Then low[u] = min(low[u], low[v])", "If low[v] > disc[u], edge (u, v) is a bridge!"],
            description: `Algorithm complete. Found ${bridges.length} bridge(s).`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runArticulationPoints = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('articulation');
        const newFrames: Frame[] = [];

        const adj = getAdjList();
        const visited = new Set<number>();
        const disc: Record<number, number> = {};
        const low: Record<number, number> = {};
        const parent: Record<number, number> = {};
        const ap = new Set<number>();
        let time = 0;

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["Run DFS, tracking discovery time & lowest reachable time", "If root has > 1 child, it's an AP", "If low[v] >= disc[u], non-root u is an AP"],
            description: "Starting Articulation Points Algorithm to find Cut Vertices."
        });

        const dfs = (u: number): void => {
            let children = 0;
            visited.add(u);
            disc[u] = low[u] = ++time;

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [u, ...Array.from(ap)], visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [], codeLine: 0,
                pseudoLines: ["Run DFS, tracking discovery time & lowest reachable time", "If root has > 1 child, it's an AP", "If low[v] >= disc[u], non-root u is an AP"],
                description: `Visited node ${getNodeLabel(u)} at time ${time}.`
            });

            for (const v of (adj[u] || [])) {
                if (!visited.has(v)) {
                    children++;
                    parent[v] = u;
                    dfs(v);

                    low[u] = Math.min(low[u], low[v]);

                    if (parent[u] === undefined && children > 1) {
                        ap.add(u);
                        newFrames.push({
                            nodes: [...nodes], edges: [...edges], highlights: [u, ...Array.from(ap)], visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [], codeLine: 1,
                            pseudoLines: ["Run DFS, tracking discovery time & lowest reachable time", "If root has > 1 child, it's an AP", "If low[v] >= disc[u], non-root u is an AP"],
                            description: `Root node ${getNodeLabel(u)} has >1 children in DFS tree. It is a Cut Vertex!`
                        });
                    }
                    if (parent[u] !== undefined && low[v] >= disc[u]) {
                        ap.add(u);
                        newFrames.push({
                            nodes: [...nodes], edges: [...edges], highlights: [u, ...Array.from(ap)], visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [], codeLine: 2,
                            pseudoLines: ["Run DFS, tracking discovery time & lowest reachable time", "If root has > 1 child, it's an AP", "If low[v] >= disc[u], non-root u is an AP"],
                            description: `Node ${getNodeLabel(u)} is an Articulation Point! Removing it disconnects the graph.`
                        });
                    }
                } else if (v !== parent[u]) {
                    low[u] = Math.min(low[u], disc[v]);
                }
            }
        };

        for (const node of nodes) {
            if (!visited.has(node.id)) {
                dfs(node.id);
            }
        }

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: Array.from(ap), visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [], codeLine: -1,
            pseudoLines: ["Run DFS, tracking discovery time & lowest reachable time", "If root has > 1 child, it's an AP", "If low[v] >= disc[u], non-root u is an AP"],
            description: `Algorithm complete. Found ${ap.size} Articulation Point(s).`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runFordFulkerson = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('fordFulkerson');
        const newFrames: Frame[] = [];

        if (!isDirected || !isWeighted) {
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: -1,
                pseudoLines: ["Ford-Fulkerson requires a Directed, Weighted graph.", "Weights represent capacities."],
                description: "Graph must be Directed and Weighted."
            });
            setFrames(newFrames);
            setCurrentStep(0);
            setIsPlaying(true);
            return;
        }

        const source: any = startNode !== null ? startNode : (nodes.length > 0 ? nodes[0].id : -1);
        let sink: any = source;
        nodes.forEach(n => { if (Number(n.id) > Number(sink)) sink = n.id; });
        if (source === sink && nodes.length > 1) {
            sink = nodes.find(n => n.id !== source)?.id || source;
        }

        if (source === -1 || source === sink) return;

        const capacity: any = {};
        const originalAdj: any = {};

        nodes.forEach(n => {
            capacity[n.id] = {};
            originalAdj[n.id] = [];
            nodes.forEach(m => {
                capacity[n.id][m.id] = 0;
            });
        });

        edges.forEach(e => {
            capacity[e.from][e.to] = e.weight || 0;
            originalAdj[e.from].push(e.to);
            originalAdj[e.to].push(e.from); // for residual graph traversal
        });

        let maxFlow = 0;

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [source, sink], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["Let Max Flow = 0", "While there is an augmenting path from Source to Sink (using DFS):", "  Find bottleneck capacity on path", "  Push flow: flow += bottleneck, update residual graph", "Return Max Flow"],
            description: `Starting Ford-Fulkerson. Source: ${getNodeLabel(source)}, Sink: ${getNodeLabel(sink)}.`
        });

        const dfs = (u: any, flow: number, visited: Set<any>, path: { from: any, to: any }[]): number => {
            if (u === sink) return flow;
            visited.add(u);

            for (const v of originalAdj[u]) {
                if (!visited.has(v) && capacity[u][v] > 0) {
                    path.push({ from: u, to: v });

                    newFrames.push({
                        nodes: [...nodes], edges: [...edges], highlights: [v], visited: Array.from(visited), queue: [], stack: [], edgeHighlights: [...path], codeLine: 1,
                        pseudoLines: ["Let Max Flow = 0", "While there is an augmenting path from Source to Sink (using DFS):", "  Find bottleneck capacity on path", "  Push flow: flow += bottleneck, update residual graph", "Return Max Flow"],
                        description: `DFS Traversing edge ${getNodeLabel(u)}->${getNodeLabel(v)} with available capacity ${capacity[u][v]}.`
                    });

                    const pushed = dfs(v, Math.min(flow, capacity[u][v]), visited, path);
                    if (pushed > 0) {
                        return pushed;
                    }
                    path.pop(); // backtrack visually
                }
            }
            return 0;
        };

        while (true) {
            const path: { from: any, to: any }[] = [];
            const visited = new Set<any>();
            const pushed = dfs(source, Infinity, visited, path);

            if (pushed === 0) break;

            maxFlow += pushed;

            path.forEach(edge => {
                capacity[edge.from][edge.to] -= pushed;
                capacity[edge.to][edge.from] += pushed;
            });

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [source, sink], visited: [], queue: [], stack: [], edgeHighlights: [...path], codeLine: 3,
                pseudoLines: ["Let Max Flow = 0", "While there is an augmenting path from Source to Sink (using DFS):", "  Find bottleneck capacity on path", "  Push flow: flow += bottleneck, update residual graph", "Return Max Flow"],
                description: `Found augmenting path! Pushing flow of ${pushed}. Current Max Flow: ${maxFlow}.`
            });
        }

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [source, sink], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 4,
            pseudoLines: ["Let Max Flow = 0", "While there is an augmenting path from Source to Sink (using DFS):", "  Find bottleneck capacity on path", "  Push flow: flow += bottleneck, update residual graph", "Return Max Flow"],
            description: `Ford-Fulkerson complete. Total Max Flow: ${maxFlow}.`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const runEdmondsKarp = () => {
        saveSnapshot();
        resetAnimation();
        setActiveAlgorithm('edmondsKarp');
        const newFrames: Frame[] = [];

        if (!isDirected || !isWeighted) {
            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: -1,
                pseudoLines: ["Edmonds-Karp requires a Directed, Weighted graph.", "Weights represent capacities."],
                description: "Graph must be Directed and Weighted."
            });
            setFrames(newFrames);
            setCurrentStep(0);
            setIsPlaying(true);
            return;
        }

        const source: any = startNode !== null ? startNode : (nodes.length > 0 ? nodes[0].id : -1);
        let sink: any = source;
        nodes.forEach(n => { if (Number(n.id) > Number(sink)) sink = n.id; });
        if (source === sink && nodes.length > 1) {
            sink = nodes.find(n => n.id !== source)?.id || source;
        }

        if (source === -1 || source === sink) return;

        const capacity: any = {};
        const originalAdj: any = {};

        nodes.forEach(n => {
            capacity[n.id] = {};
            originalAdj[n.id] = [];
            nodes.forEach(m => {
                capacity[n.id][m.id] = 0;
            });
        });

        edges.forEach(e => {
            capacity[e.from][e.to] = e.weight || 0;
            originalAdj[e.from].push(e.to);
            originalAdj[e.to].push(e.from);
        });

        let maxFlow = 0;

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [source, sink], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 0,
            pseudoLines: ["Let Max Flow = 0", "While there is an augmenting path from Source to Sink (using BFS):", "  Find bottleneck capacity on path", "  Push flow: flow += bottleneck, update residual graph", "Return Max Flow"],
            description: `Starting Edmonds-Karp. Source: ${getNodeLabel(source)}, Sink: ${getNodeLabel(sink)}.`
        });

        const bfs = (): { from: any, to: any }[] | null => {
            const visited = new Set<any>();
            const queue: any[] = [source];
            const parent: any = {};
            visited.add(source);

            while (queue.length > 0) {
                const u = queue.shift()!;

                newFrames.push({
                    nodes: [...nodes], edges: [...edges], highlights: [u], visited: Array.from(visited), queue: [...queue], stack: [], edgeHighlights: [], codeLine: 1,
                    pseudoLines: ["Let Max Flow = 0", "While there is an augmenting path from Source to Sink (using BFS):", "  Find bottleneck capacity on path", "  Push flow: flow += bottleneck, update residual graph", "Return Max Flow"],
                    description: `BFS Traversing node ${getNodeLabel(u)}.`
                });

                for (const v of originalAdj[u]) {
                    if (!visited.has(v) && capacity[u][v] > 0) {
                        visited.add(v);
                        parent[v] = u;
                        queue.push(v);
                        if (v === sink) {
                            const path: { from: any, to: any }[] = [];
                            let curr = sink;
                            while (curr !== source) {
                                path.unshift({ from: parent[curr], to: curr });
                                curr = parent[curr];
                            }
                            return path;
                        }
                    }
                }
            }
            return null;
        };

        while (true) {
            const path = bfs();
            if (!path) break;

            let pushed = Infinity;
            path.forEach(edge => {
                pushed = Math.min(pushed, capacity[edge.from][edge.to]);
            });

            maxFlow += pushed;

            path.forEach(edge => {
                capacity[edge.from][edge.to] -= pushed;
                capacity[edge.to][edge.from] += pushed;
            });

            newFrames.push({
                nodes: [...nodes], edges: [...edges], highlights: [source, sink], visited: [], queue: [], stack: [], edgeHighlights: [...path], codeLine: 3,
                pseudoLines: ["Let Max Flow = 0", "While there is an augmenting path from Source to Sink (using BFS):", "  Find bottleneck capacity on path", "  Push flow: flow += bottleneck, update residual graph", "Return Max Flow"],
                description: `Found augmenting path using BFS! Pushing flow of ${pushed}. Current Max Flow: ${maxFlow}.`
            });
        }

        newFrames.push({
            nodes: [...nodes], edges: [...edges], highlights: [source, sink], visited: [], queue: [], stack: [], edgeHighlights: [], codeLine: 4,
            pseudoLines: ["Let Max Flow = 0", "While there is an augmenting path from Source to Sink (using BFS):", "  Find bottleneck capacity on path", "  Push flow: flow += bottleneck, update residual graph", "Return Max Flow"],
            description: `Edmonds-Karp complete. Total Max Flow: ${maxFlow}.`
        });

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    // Helper interface for local use if needed    // --- Playback Logic ---
    useEffect(() => {
        if (isPlaying && currentStep < frames.length - 1) {
            timerRef.current = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1000 / playbackSpeed);
        } else {
            setIsPlaying(false);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentStep, frames.length, playbackSpeed]);

    const getCurrentFrame = () => {
        if (frames.length > 0 && currentStep < frames.length) {
            return frames[currentStep];
        }
        return {
            nodes: nodes,
            edges: edges,
            highlights: [],
            visited: [],
            queue: [],
            stack: [],
            edgeHighlights: [],
            codeLine: -1,
            pseudoLines: [],
            description: "Ready"
        };
    };

    const clearGraph = () => {
        setNodes([]);
        setEdges([]);
        resetAnimation();
    };

    const snapAllToGrid = () => {
        setNodes(prev => prev.map(n => ({
            ...n,
            x: snapToGrid(n.x),
            y: snapToGrid(n.y)
        })));
        setGraphSnapshot(null);
        resetAnimation();
    };

    const updateWeightsByDistance = () => {
        setEdges(prevEdges => prevEdges.map(edge => {
            if (edge.isManual) return edge; // Keep manually edited weights

            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (fromNode && toNode) {
                const dx = toNode.x - fromNode.x;
                const dy = toNode.y - fromNode.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const newWeight = Math.max(1, Math.round(distance / GRID_SIZE));
                return { ...edge, weight: newWeight };
            }
            return edge;
        }));
        setGraphSnapshot(null);
        resetAnimation();
    };

    const adjustPhysicalDistance = (fromId: number, toId: number, weight: number) => {
        setNodes(prevNodes => {
            const fromNode = prevNodes.find(n => n.id === fromId);
            const toNode = prevNodes.find(n => n.id === toId);
            if (!fromNode || !toNode) return prevNodes;

            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const currentDist = Math.sqrt(dx * dx + dy * dy);

            if (currentDist === 0) return prevNodes;

            const targetDist = weight * 40;
            const ratio = targetDist / currentDist;

            return prevNodes.map(n => {
                if (n.id === toId) {
                    return {
                        ...n,
                        x: fromNode.x + dx * ratio,
                        y: fromNode.y + dy * ratio
                    };
                }
                return n;
            });
        });
        setGraphSnapshot(null);
        resetAnimation();
    };

    const [mstExampleIndex, setMstExampleIndex] = useState(0);
    const [traversalExampleIndex, setTraversalExampleIndex] = useState(0);
    const [basicsExampleIndex, setBasicsExampleIndex] = useState(0);
    const [shortestPathExampleIndex, setShortestPathExampleIndex] = useState(0);
    const [dagExampleIndex, setDagExampleIndex] = useState(0);
    const [connectivityExampleIndex, setConnectivityExampleIndex] = useState(0);
    const [flowExampleIndex, setFlowExampleIndex] = useState(0);

    const loadExampleGraph = (category: string) => {
        // ... (existing templates for other categories) ...

        const MST_EXAMPLES = [
            {
                nodes: [
                    { id: 0, x: 300, y: 100, value: 0 },
                    { id: 1, x: 150, y: 200, value: 0 },
                    { id: 2, x: 450, y: 200, value: 0 },
                    { id: 3, x: 200, y: 320, value: 0 },
                    { id: 4, x: 400, y: 320, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 2 },
                    { from: 0, to: 2, weight: 3 },
                    { from: 1, to: 2, weight: 5 },
                    { from: 1, to: 3, weight: 4 },
                    { from: 2, to: 3, weight: 1 },
                    { from: 2, to: 4, weight: 7 },
                    { from: 3, to: 4, weight: 8 },
                ],
                directed: false,
                weighted: true
            },
            {
                // Complex Cycle Graph
                nodes: [
                    { id: 0, x: 100, y: 200, value: 0 },
                    { id: 1, x: 200, y: 100, value: 0 },
                    { id: 2, x: 400, y: 100, value: 0 },
                    { id: 3, x: 500, y: 200, value: 0 },
                    { id: 4, x: 400, y: 300, value: 0 },
                    { id: 5, x: 200, y: 300, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 4 },
                    { from: 1, to: 2, weight: 3 },
                    { from: 2, to: 3, weight: 2 },
                    { from: 3, to: 4, weight: 4 },
                    { from: 4, to: 5, weight: 3 },
                    { from: 5, to: 0, weight: 2 },
                    { from: 1, to: 5, weight: 5 },
                    { from: 2, to: 4, weight: 1 },
                    { from: 1, to: 4, weight: 8 },
                ],
                directed: false,
                weighted: true
            },
            {
                // Disconnected Components (Forest) - Good for Kruskal
                nodes: [
                    { id: 0, x: 100, y: 100, value: 0 },
                    { id: 1, x: 100, y: 300, value: 0 },
                    { id: 2, x: 250, y: 200, value: 0 },

                    { id: 3, x: 400, y: 100, value: 0 },
                    { id: 4, x: 400, y: 300, value: 0 },
                    { id: 5, x: 550, y: 200, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 6 },
                    { from: 0, to: 2, weight: 2 },
                    { from: 1, to: 2, weight: 3 },

                    { from: 3, to: 4, weight: 5 },
                    { from: 3, to: 5, weight: 4 },
                    { from: 4, to: 5, weight: 6 },
                ],
                directed: false,
                weighted: true
            }
        ];

        const TRAVERSAL_EXAMPLES = [
            {
                // Standard Binary Tree
                nodes: [
                    { id: 0, x: 300, y: 80, value: 0 },
                    { id: 1, x: 200, y: 160, value: 0 },
                    { id: 2, x: 400, y: 160, value: 0 },
                    { id: 3, x: 140, y: 240, value: 0 },
                    { id: 4, x: 260, y: 240, value: 0 },
                    { id: 5, x: 340, y: 240, value: 0 },
                    { id: 6, x: 460, y: 240, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 0, to: 2, weight: 1 },
                    { from: 1, to: 3, weight: 1 },
                    { from: 1, to: 4, weight: 1 },
                    { from: 2, to: 5, weight: 1 },
                    { from: 2, to: 6, weight: 1 },
                ],
                directed: false,
                weighted: false
            },
            {
                // Linear Graph / Linked List type
                nodes: [
                    { id: 0, x: 100, y: 200, value: 0 },
                    { id: 1, x: 200, y: 200, value: 0 },
                    { id: 2, x: 300, y: 200, value: 0 },
                    { id: 3, x: 400, y: 200, value: 0 },
                    { id: 4, x: 500, y: 200, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 1, to: 2, weight: 1 },
                    { from: 2, to: 3, weight: 1 },
                    { from: 3, to: 4, weight: 1 },
                ],
                directed: true,
                weighted: false
            },
            {
                // Web/Star Graph
                nodes: [
                    { id: 0, x: 300, y: 200, value: 0 }, // Center
                    { id: 1, x: 300, y: 100, value: 0 }, // Top
                    { id: 2, x: 400, y: 200, value: 0 }, // Right
                    { id: 3, x: 300, y: 300, value: 0 }, // Bottom
                    { id: 4, x: 200, y: 200, value: 0 }, // Left
                    { id: 5, x: 200, y: 100, value: 0 }, // Top Left
                    { id: 6, x: 400, y: 300, value: 0 }, // Bottom Right
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 0, to: 2, weight: 1 },
                    { from: 0, to: 3, weight: 1 },
                    { from: 0, to: 4, weight: 1 },
                    { from: 0, to: 5, weight: 1 },
                    { from: 0, to: 6, weight: 1 },
                    // Outer ring
                    { from: 1, to: 2, weight: 1 },
                    { from: 2, to: 3, weight: 1 },
                    { from: 3, to: 4, weight: 1 },
                    { from: 4, to: 1, weight: 1 },
                ],
                directed: false,
                weighted: false
            }
        ];

        const BASICS_EXAMPLES = [
            {
                // Simple Undirected Cyclic (Square with cross)
                nodes: [
                    { id: 0, x: 200, y: 120, value: 0 },
                    { id: 1, x: 400, y: 120, value: 0 },
                    { id: 2, x: 200, y: 280, value: 0 },
                    { id: 3, x: 400, y: 280, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 1, to: 3, weight: 1 },
                    { from: 3, to: 2, weight: 1 },
                    { from: 2, to: 0, weight: 1 },
                    { from: 0, to: 3, weight: 1 },
                ],
                directed: false,
                weighted: false
            },
            {
                // Star Graph (Good for Degree and Neighbors)
                nodes: [
                    { id: 0, x: 300, y: 200, value: 0 },
                    { id: 1, x: 300, y: 80, value: 0 },
                    { id: 2, x: 420, y: 200, value: 0 },
                    { id: 3, x: 300, y: 320, value: 0 },
                    { id: 4, x: 180, y: 200, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 0, to: 2, weight: 1 },
                    { from: 0, to: 3, weight: 1 },
                    { from: 0, to: 4, weight: 1 },
                ],
                directed: false,
                weighted: false
            },
            {
                // Disconnected Components (Good for Connectivity)
                nodes: [
                    { id: 0, x: 150, y: 150, value: 0 },
                    { id: 1, x: 250, y: 150, value: 0 },
                    { id: 2, x: 200, y: 250, value: 0 },
                    { id: 3, x: 400, y: 150, value: 0 },
                    { id: 4, x: 500, y: 250, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 1, to: 2, weight: 1 },
                    { from: 2, to: 0, weight: 1 },
                    { from: 3, to: 4, weight: 1 },
                ],
                directed: false,
                weighted: false
            },
            {
                // Directed Graph with Cycles (Good for In/Out Degree and Cycle Detection)
                nodes: [
                    { id: 0, x: 200, y: 150, value: 0 },
                    { id: 1, x: 400, y: 150, value: 0 },
                    { id: 2, x: 300, y: 250, value: 0 },
                    { id: 3, x: 100, y: 250, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 1, to: 2, weight: 1 },
                    { from: 2, to: 0, weight: 1 },
                    { from: 0, to: 3, weight: 1 },
                    { from: 3, to: 2, weight: 1 },
                ],
                directed: true,
                weighted: false
            }
        ];

        const SHORTEST_PATH_EXAMPLES = [
            {
                // Standard Dijkstra Example
                nodes: [
                    { id: 0, x: 100, y: 200, value: 0 }, // A
                    { id: 1, x: 250, y: 100, value: 0 }, // B
                    { id: 2, x: 250, y: 300, value: 0 }, // C
                    { id: 3, x: 400, y: 100, value: 0 }, // D
                    { id: 4, x: 400, y: 300, value: 0 }, // E
                    { id: 5, x: 550, y: 200, value: 0 }, // F
                ],
                edges: [
                    { from: 0, to: 1, weight: 4 },
                    { from: 0, to: 2, weight: 2 },
                    { from: 1, to: 2, weight: 1 },
                    { from: 1, to: 3, weight: 5 },
                    { from: 2, to: 3, weight: 8 },
                    { from: 2, to: 4, weight: 10 },
                    { from: 3, to: 4, weight: 2 },
                    { from: 3, to: 5, weight: 6 },
                    { from: 4, to: 5, weight: 3 },
                ],
                directed: false,
                weighted: true
            },
            {
                // Directed web
                nodes: [
                    { id: 0, x: 100, y: 200, value: 0 },
                    { id: 1, x: 250, y: 100, value: 0 },
                    { id: 2, x: 250, y: 300, value: 0 },
                    { id: 3, x: 400, y: 200, value: 0 },
                    { id: 4, x: 550, y: 200, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 3 },
                    { from: 0, to: 2, weight: 6 },
                    { from: 1, to: 3, weight: 2 },
                    { from: 2, to: 3, weight: 1 },
                    { from: 3, to: 4, weight: 4 },
                    { from: 1, to: 4, weight: 8 },
                ],
                directed: true,
                weighted: true
            },
            {
                // Unweighted Grid-like
                nodes: [
                    { id: 0, x: 150, y: 100, value: 0 },
                    { id: 1, x: 300, y: 100, value: 0 },
                    { id: 2, x: 450, y: 100, value: 0 },
                    { id: 3, x: 150, y: 250, value: 0 },
                    { id: 4, x: 300, y: 250, value: 0 },
                    { id: 5, x: 450, y: 250, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 1, to: 2, weight: 1 },
                    { from: 0, to: 3, weight: 1 },
                    { from: 1, to: 4, weight: 1 },
                    { from: 2, to: 5, weight: 1 },
                    { from: 3, to: 4, weight: 1 },
                    { from: 4, to: 5, weight: 1 },
                ],
                directed: false,
                weighted: false
            }
        ];

        const DAG_EXAMPLES = [
            {
                // Simple DAG
                nodes: [
                    { id: 0, x: 100, y: 100, value: 0 },
                    { id: 1, x: 300, y: 100, value: 0 },
                    { id: 2, x: 500, y: 100, value: 0 },
                    { id: 3, x: 200, y: 280, value: 0 },
                    { id: 4, x: 400, y: 280, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 1, to: 2, weight: 1 },
                    { from: 0, to: 3, weight: 1 },
                    { from: 3, to: 4, weight: 1 },
                    { from: 1, to: 4, weight: 1 },
                    { from: 4, to: 2, weight: 1 },
                ],
                directed: true,
                weighted: false
            },
            {
                // Complex DAG 
                nodes: [
                    { id: 0, x: 100, y: 100, value: 0 },
                    { id: 1, x: 300, y: 100, value: 0 },
                    { id: 2, x: 500, y: 100, value: 0 },
                    { id: 3, x: 100, y: 300, value: 0 },
                    { id: 4, x: 250, y: 300, value: 0 },
                    { id: 5, x: 100, y: 200, value: 0 },
                    { id: 6, x: 400, y: 200, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 1, to: 2, weight: 1 },
                    { from: 0, to: 6, weight: 1 },
                    { from: 5, to: 6, weight: 1 },
                    { from: 5, to: 4, weight: 1 },
                    { from: 3, to: 4, weight: 1 },
                    { from: 6, to: 2, weight: 1 },
                ],
                directed: true,
                weighted: false
            }
        ];

        const CONNECTIVITY_EXAMPLES = [
            {
                // Simple Graph with 1 Bridge and 2 Articulation Points
                nodes: [
                    { id: 0, x: 150, y: 150, value: 0 },
                    { id: 1, x: 300, y: 150, value: 0 },
                    { id: 2, x: 150, y: 300, value: 0 },
                    { id: 3, x: 450, y: 150, value: 0 },
                    { id: 4, x: 450, y: 300, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 1, to: 2, weight: 1 },
                    { from: 2, to: 0, weight: 1 },
                    { from: 1, to: 3, weight: 1 }, // Bridge
                    { from: 3, to: 4, weight: 1 },
                ],
                directed: false,
                weighted: false
            },
            {
                // Disconnected Components 
                nodes: [
                    { id: 0, x: 100, y: 150, value: 0 },
                    { id: 1, x: 200, y: 100, value: 0 },
                    { id: 2, x: 200, y: 200, value: 0 },

                    { id: 3, x: 400, y: 100, value: 0 },
                    { id: 4, x: 500, y: 150, value: 0 },
                    { id: 5, x: 400, y: 200, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 1, to: 2, weight: 1 },
                    { from: 2, to: 0, weight: 1 },

                    { from: 3, to: 4, weight: 1 },
                    { from: 4, to: 5, weight: 1 },
                    { from: 5, to: 3, weight: 1 },
                ],
                directed: false,
                weighted: false
            },
            {
                // Bowtie Graph (One central Articulation Point)
                nodes: [
                    { id: 0, x: 150, y: 100, value: 0 },
                    { id: 1, x: 150, y: 300, value: 0 },
                    { id: 2, x: 300, y: 200, value: 0 }, // AP
                    { id: 3, x: 450, y: 100, value: 0 },
                    { id: 4, x: 450, y: 300, value: 0 },
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 0, to: 2, weight: 1 },
                    { from: 1, to: 2, weight: 1 },
                    { from: 2, to: 3, weight: 1 },
                    { from: 2, to: 4, weight: 1 },
                    { from: 3, to: 4, weight: 1 },
                ],
                directed: false,
                weighted: false
            }
        ];

        const FLOW_EXAMPLES = [
            {
                // Simple Flow Network
                nodes: [
                    { id: 0, x: 100, y: 200, value: 0 }, // S
                    { id: 1, x: 250, y: 100, value: 0 },
                    { id: 2, x: 250, y: 300, value: 0 },
                    { id: 3, x: 400, y: 100, value: 0 },
                    { id: 4, x: 400, y: 300, value: 0 },
                    { id: 5, x: 550, y: 200, value: 0 }, // T
                ],
                edges: [
                    { from: 0, to: 1, weight: 10 },
                    { from: 0, to: 2, weight: 10 },
                    { from: 1, to: 2, weight: 2 },
                    { from: 1, to: 3, weight: 4 },
                    { from: 1, to: 4, weight: 8 },
                    { from: 2, to: 4, weight: 9 },
                    { from: 3, to: 5, weight: 10 },
                    { from: 4, to: 3, weight: 6 },
                    { from: 4, to: 5, weight: 10 },
                ],
                directed: true,
                weighted: true
            },
            {
                // Bipartite Matching pattern
                nodes: [
                    { id: 0, x: 100, y: 200, value: 0 }, // S

                    { id: 1, x: 250, y: 100, value: 0 },
                    { id: 2, x: 250, y: 200, value: 0 },
                    { id: 3, x: 250, y: 300, value: 0 },

                    { id: 4, x: 400, y: 100, value: 0 },
                    { id: 5, x: 400, y: 200, value: 0 },
                    { id: 6, x: 400, y: 300, value: 0 },

                    { id: 7, x: 550, y: 200, value: 0 }, // T
                ],
                edges: [
                    { from: 0, to: 1, weight: 1 },
                    { from: 0, to: 2, weight: 1 },
                    { from: 0, to: 3, weight: 1 },

                    { from: 1, to: 4, weight: 1 },
                    { from: 1, to: 5, weight: 1 },
                    { from: 2, to: 4, weight: 1 },
                    { from: 3, to: 5, weight: 1 },
                    { from: 3, to: 6, weight: 1 },

                    { from: 4, to: 7, weight: 1 },
                    { from: 5, to: 7, weight: 1 },
                    { from: 6, to: 7, weight: 1 },
                ],
                directed: true,
                weighted: true
            }
        ];

        let template: { nodes: GraphNode[], edges: GraphEdge[], directed: boolean, weighted: boolean } | undefined;

        if (category === 'MST') {
            template = MST_EXAMPLES[mstExampleIndex % MST_EXAMPLES.length];
            setMstExampleIndex(prev => prev + 1);
        } else if (category === 'Traversal') {
            template = TRAVERSAL_EXAMPLES[traversalExampleIndex % TRAVERSAL_EXAMPLES.length];
            setTraversalExampleIndex(prev => prev + 1);
        } else if (category === 'Basics') {
            template = BASICS_EXAMPLES[basicsExampleIndex % BASICS_EXAMPLES.length];
            setBasicsExampleIndex(prev => prev + 1);
        } else if (category === 'Shortest Path') {
            template = SHORTEST_PATH_EXAMPLES[shortestPathExampleIndex % SHORTEST_PATH_EXAMPLES.length];
            setShortestPathExampleIndex(prev => prev + 1);
        } else if (category === 'DAG') {
            template = DAG_EXAMPLES[dagExampleIndex % DAG_EXAMPLES.length];
            setDagExampleIndex(prev => prev + 1);
        } else if (category === 'Connectivity') {
            template = CONNECTIVITY_EXAMPLES[connectivityExampleIndex % CONNECTIVITY_EXAMPLES.length];
            setConnectivityExampleIndex(prev => prev + 1);
        } else if (category === 'Flow') {
            template = FLOW_EXAMPLES[flowExampleIndex % FLOW_EXAMPLES.length];
            setFlowExampleIndex(prev => prev + 1);
        } else {
            // ... (rest of existing logic, use `templates` variable)
            const templates: Record<string, { nodes: GraphNode[], edges: GraphEdge[], directed: boolean, weighted: boolean }> = {
                'Special': {
                    nodes: [
                        { id: 0, x: 150, y: 100, value: 0 },
                        { id: 1, x: 150, y: 200, value: 0 },
                        { id: 2, x: 150, y: 300, value: 0 },
                        { id: 3, x: 450, y: 100, value: 0 },
                        { id: 4, x: 450, y: 200, value: 0 },
                        { id: 5, x: 450, y: 300, value: 0 },
                    ],
                    edges: [
                        { from: 0, to: 3, weight: 1 },
                        { from: 0, to: 4, weight: 1 },
                        { from: 1, to: 3, weight: 1 },
                        { from: 1, to: 5, weight: 1 },
                        { from: 2, to: 4, weight: 1 },
                        { from: 2, to: 5, weight: 1 },
                    ],
                    directed: false,
                    weighted: false
                }
            };
            template = templates[category];
        }

        if (template) {
            setNodes(template.nodes);
            setEdges(template.edges);
            setIsDirected(template.directed);
            setIsWeighted(template.weighted);
            setNextId(Math.max(...template.nodes.map(n => n.id)) + 1);
            setGraphSnapshot(null);
            resetAnimation();
        }
    };

    return {
        nodes, setNodes,
        edges, setEdges,
        isDirected, setIsDirected,
        isWeighted, setIsWeighted,
        frames,
        currentStep, setCurrentStep,
        isPlaying, setIsPlaying,
        playbackSpeed, setPlaybackSpeed,
        activeAlgorithm,
        startNode, setStartNode,
        runBFS,
        runDFS,
        runDijkstra,
        runPrim,
        runKruskal,
        runBoruvka,
        runNodeDegree,
        runHighlightNeighbors,
        runCheckConnectivity,
        runDetectCycle,
        runTopologicalSort,
        runKahn,
        runTarjanBridges,
        runArticulationPoints,
        runFordFulkerson,
        runEdmondsKarp,
        runBellmanFord,
        runFloydWarshall,
        runAStar,
        clearGraph,
        resetGraph,
        hardReset,
        clearCanvas,
        getCurrentFrame,
        activeTool, setActiveTool,
        selectedNode, setSelectedNode,
        addNode, removeNode,
        moveNode,
        addEdge, removeEdge,
        isGridSnapped, setIsGridSnapped,
        snapAllToGrid,
        updateWeightsByDistance,
        adjustPhysicalDistance,
        loadExampleGraph,
        getNodeLabel, getInverseNodeLabel
    };
};
