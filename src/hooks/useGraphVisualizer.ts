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
            description: `Starting BFS from node ${start}.`
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
            description: `Added start node ${start} to queue and visited set.`
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
                description: `Checking if queue is empty. It's not.`
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
                description: `Dequeued node ${u}.`
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
                    description: `Checking neighbor ${v} of node ${u}.`
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
                        description: `Node ${v} is not visited. Marking as visited and adding to queue.`
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
            description: `BFS traversal completed.`
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

        const dfsRecursive = (u: number) => {
            visited.add(u);
            newFrames.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [u],
                visited: Array.from(visited),
                queue: [],
                stack: [], // Could visualize recursion stack here if needed
                edgeHighlights: [],
                codeLine: 0,
                pseudoLines: ["Function DFS(u):", "  Mark u as visited", "  For each neighbor v of u:", "    If v not visited:", "      DFS(v)"],
                description: `Visiting node ${u}.`
            });

            const neighbors = adj[u] || [];
            for (const v of neighbors) {
                newFrames.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [u],
                    visited: Array.from(visited),
                    queue: [],
                    stack: [],
                    edgeHighlights: [{ from: u, to: v }],
                    codeLine: 2,
                    pseudoLines: ["Function DFS(u):", "  Mark u as visited", "  For each neighbor v of u:", "    If v not visited:", "      DFS(v)"],
                    description: `Checking neighbor ${v} of node ${u}.`
                });

                if (!visited.has(v)) {
                    dfsRecursive(v);
                }
            }
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
            description: `DFS traversal completed.`
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
            description: `Prim's Algorithm started. Added start node ${start} to visited.`
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
                description: `Picked minimum edge (${from}, ${to}) with weight ${weight}. Added ${to} to MST.`
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
                description: `Added edges from ${to} to the cut.`
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
                visited: [],
                queue: [],
                stack: [],
                edgeHighlights: [...mstEdges.map(e => ({ from: e.from, to: e.to })), { from: u, to: v }], // Highlight current candidate
                codeLine: 2,
                pseudoLines: ["Sort all edges by weight", "Init Union-Find", "For each edge (u, v) in sorted edges:", "  check if u and v in same set", "  if not, union(u, v) and add to MST"],
                description: `Checking edge (${u}, ${v}) with weight ${edge.weight}.`
            });

            if (union(u, v)) {
                mstEdges.push(edge);
                newFrames.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [u, v],
                    visited: [],
                    queue: [],
                    stack: [],
                    edgeHighlights: mstEdges.map(e => ({ from: e.from, to: e.to })),
                    codeLine: 4,
                    pseudoLines: ["Sort all edges by weight", "Init Union-Find", "For each edge (u, v) in sorted edges:", "  check if u and v in same set", "  if not, union(u, v) and add to MST"],
                    description: `Added edge (${u}, ${v}) to MST.`
                });
            } else {
                newFrames.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [],
                    visited: [],
                    queue: [],
                    stack: [],
                    edgeHighlights: mstEdges.map(e => ({ from: e.from, to: e.to })),
                    codeLine: 3,
                    pseudoLines: ["Sort all edges by weight", "Init Union-Find", "For each edge (u, v) in sorted edges:", "  check if u and v in same set", "  if not, union(u, v) and add to MST"],
                    description: `Edge (${u}, ${v}) forms a cycle. Skipped.`
                });
            }
        }

        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    // Helper interface for local use if needed



    // --- Playback Logic ---
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
        getNodeLabel, getInverseNodeLabel
    };
};
