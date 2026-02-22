import { useState, useEffect, useRef } from 'react';
import { TreeTool } from '../components/tree/TreeTools';

// Types
export interface TreeNode {
    id: number;
    value: number;
    x: number;
    y: number;
    left?: number; // ID of left child
    right?: number; // ID of right child
    parentId?: number; // ID of parent
}

export interface TreeEdge {
    from: number;
    to: number;
}

export interface Frame {
    nodes: TreeNode[];
    edges: TreeEdge[];
    highlights: number[]; // Node IDs
    evaluated?: number[]; // Nodes being compared
    codeLine: number;
    pseudoLines: string[];
    description: string;
    output?: string; // For traversal output
}

const INITIAL_NODES: TreeNode[] = [
    { id: 0, value: 50, x: 400, y: 200, left: 1, right: 2 },
    { id: 1, value: 30, x: 200, y: 300, parentId: 0, left: 3, right: 4 },
    { id: 2, value: 70, x: 600, y: 300, parentId: 0, left: 5, right: 6 },
    { id: 3, value: 20, x: 100, y: 400, parentId: 1 },
    { id: 4, value: 40, x: 300, y: 400, parentId: 1 },
    { id: 5, value: 60, x: 500, y: 400, parentId: 2 },
    { id: 6, value: 80, x: 700, y: 400, parentId: 2 },
];

const INITIAL_EDGES: TreeEdge[] = [
    { from: 0, to: 1 }, { from: 0, to: 2 },
    { from: 1, to: 3 }, { from: 1, to: 4 },
    { from: 2, to: 5 }, { from: 2, to: 6 },
];

export const useTreeVisualizer = () => {
    // --- State ---
    const [nodes, setNodes] = useState<TreeNode[]>(INITIAL_NODES);
    const [edges, setEdges] = useState<TreeEdge[]>(INITIAL_EDGES);

    // Derived root from nodes (node with no parent)
    const [rootId, setRootId] = useState<number | null>(0);

    // Animation State
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [activeAlgorithm, setActiveAlgorithm] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<TreeTool>('move');
    const [selectedNode, setSelectedNode] = useState<number | null>(null);

    // Refs
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Find max ID to ensure uniqueness for new nodes
    const maxId = nodes.reduce((max, node) => Math.max(max, node.id), 0);
    const nextIdRef = useRef(maxId + 1);

    // Update rootId when nodes change
    useEffect(() => {
        if (nodes.length === 0) {
            setRootId(null);
        } else {
            const root = nodes.find(n => n.parentId === undefined || n.parentId === null);
            setRootId(root ? root.id : null);
        }
    }, [nodes]);

    // --- Layout Logic ---
    const calculateLayout = (currentNodes: TreeNode[], root: number | null): TreeNode[] => {
        if (root === null) return [];

        const newNodes = [...currentNodes];
        const width = 800; // SVG Width
        const startX = width / 2;
        const startY = 200;
        const levelHeight = 80;

        // Map ID to Node Index for quick lookup
        const nodeMap = new Map<number, number>();
        newNodes.forEach((n, i) => nodeMap.set(n.id, i));

        const positionNode = (id: number, x: number, y: number, offset: number) => {
            const idx = nodeMap.get(id);
            if (idx === undefined) return;

            newNodes[idx] = { ...newNodes[idx], x, y };

            // Find children IDs from edges is hard if edges store IDs but nodes store structure
            // Let's rely on the 'nodes' structure (left/right) if available, or reconstruct it?
            // Actually, best to reconstruct references from edges + values since it is a BST.
            // BUT, for the visualizer, 'left' and 'right' properties in TreeNode are best.
            // Let's assume nodes have left/right populated correctly.

            const node = newNodes[idx];

            // Check edges to verify children
            // const children = edges.filter(e => e.from === id); 
            // Better to rely on the node.left and node.right properties which we will maintain.

            if (node.left !== undefined) {
                positionNode(node.left, x - offset, y + levelHeight, offset / 2);
            }
            if (node.right !== undefined) {
                positionNode(node.right, x + offset, y + levelHeight, offset / 2);
            }
        };

        // Initialize structure from nodes array if needed, but we expect it to be maintained.
        // Re-populate left/right/parent based on edges for safety?
        // Let's trust the state maintenance.

        positionNode(root, startX, startY, 200);
        return newNodes;
    };

    // Helper to get edges from nodes structure
    const getEdgesFromNodes = (nodeList: TreeNode[]): TreeEdge[] => {
        const newEdges: TreeEdge[] = [];
        nodeList.forEach(node => {
            if (node.left !== undefined) newEdges.push({ from: node.id, to: node.left });
            if (node.right !== undefined) newEdges.push({ from: node.id, to: node.right });
        });
        return newEdges;
    };


    // --- Actions ---

    const insert = (val: number) => {
        setActiveAlgorithm('insert');
        setFrames([]);
        setCurrentStep(0);

        let currentNodes = JSON.parse(JSON.stringify(nodes));
        let framesBuffer: Frame[] = [];

        // Initial Frame
        framesBuffer.push({
            nodes: [...currentNodes],
            edges: getEdgesFromNodes(currentNodes),
            highlights: [],
            codeLine: 0,
            pseudoLines: ["if root is NULL, return createNode(val)", "if val < root->val, root->left = insert(root->left, val)", "else if val > root->val, root->right = insert(root->right, val)", "return root"],
            description: `Starting insertion of ${val}.`
        });

        if (currentNodes.length === 0) {
            // Create root
            const newNode: TreeNode = { id: nextIdRef.current++, value: val, x: 400, y: 50 };
            currentNodes = [newNode];
            setNodes(currentNodes);
            setEdges([]);

            framesBuffer.push({
                nodes: currentNodes,
                edges: [],
                highlights: [newNode.id],
                codeLine: 1,
                pseudoLines: ["if root is NULL, return createNode(val)", "if val < root->val, root->left = insert(root->left, val)", "else if val > root->val, root->right = insert(root->right, val)", "return root"],
                description: `Root was empty. Created new root with value ${val}.`
            });
            setFrames(framesBuffer);
            setIsPlaying(true);
            return;
        }

        // Search and Insert
        let curr = currentNodes.find((n: TreeNode) => n.parentId === undefined || n.parentId === null); // Find root
        if (!curr) curr = currentNodes[0]; // Fallback

        while (true) {
            framesBuffer.push({
                nodes: calculateLayout([...currentNodes], rootId),
                edges: getEdgesFromNodes(currentNodes),
                highlights: [curr.id],
                codeLine: 1, // Generic check
                pseudoLines: ["if root is NULL, return createNode(val)", "if val < root->val, root->left = insert(root->left, val)", "else if val > root->val, root->right = insert(root->right, val)", "return root"],
                description: `Comparing ${val} with ${curr.value}.`
            });

            if (val === curr.value) {
                framesBuffer.push({
                    nodes: calculateLayout([...currentNodes], rootId),
                    edges: getEdgesFromNodes(currentNodes),
                    highlights: [curr.id],
                    evaluated: [curr.id],
                    codeLine: 3,
                    pseudoLines: ["if root is NULL, return createNode(val)", "if val < root->val, root->left = insert(root->left, val)", "else if val > root->val, root->right = insert(root->right, val)", "return root"],
                    description: `Value ${val} already exists. Duplicates not allowed.`
                });
                break;
            }

            if (val < curr.value) {
                if (curr.left === undefined) {
                    const newNode: TreeNode = { id: nextIdRef.current++, value: val, x: 0, y: 0, parentId: curr.id };
                    curr.left = newNode.id;
                    currentNodes.push(newNode);

                    framesBuffer.push({
                        nodes: calculateLayout([...currentNodes], rootId),
                        edges: getEdgesFromNodes(currentNodes),
                        highlights: [newNode.id],
                        codeLine: 2,
                        pseudoLines: ["if root is NULL, return createNode(val)", "if val < root->val, root->left = insert(root->left, val)", "else if val > root->val, root->right = insert(root->right, val)", "return root"],
                        description: `Inserted ${val} as left child of ${curr.value}.`
                    });
                    break;
                } else {
                    framesBuffer.push({
                        nodes: calculateLayout([...currentNodes], rootId),
                        edges: getEdgesFromNodes(currentNodes),
                        highlights: [curr.id], // Highlight current before moving
                        evaluated: [curr.id], // Show comparison
                        codeLine: 2,
                        pseudoLines: ["if root is NULL, return createNode(val)", "if val < root->val, root->left = insert(root->left, val)", "else if val > root->val, root->right = insert(root->right, val)", "return root"],
                        description: `${val} < ${curr.value}, going left.`
                    });
                    // Move to left
                    const nextId = curr.left;
                    curr = currentNodes.find((n: TreeNode) => n.id === nextId);
                }
            } else {
                if (curr.right === undefined) {
                    const newNode: TreeNode = { id: nextIdRef.current++, value: val, x: 0, y: 0, parentId: curr.id };
                    curr.right = newNode.id;
                    currentNodes.push(newNode);

                    framesBuffer.push({
                        nodes: calculateLayout([...currentNodes], rootId),
                        edges: getEdgesFromNodes(currentNodes),
                        highlights: [newNode.id],
                        codeLine: 3,
                        pseudoLines: ["if root is NULL, return createNode(val)", "if val < root->val, root->left = insert(root->left, val)", "else if val > root->val, root->right = insert(root->right, val)", "return root"],
                        description: `Inserted ${val} as right child of ${curr.value}.`
                    });
                    break;
                } else {
                    framesBuffer.push({
                        nodes: calculateLayout([...currentNodes], rootId),
                        edges: getEdgesFromNodes(currentNodes),
                        highlights: [curr.id],
                        evaluated: [curr.id],
                        codeLine: 3,
                        pseudoLines: ["if root is NULL, return createNode(val)", "if val < root->val, root->left = insert(root->left, val)", "else if val > root->val, root->right = insert(root->right, val)", "return root"],
                        description: `${val} > ${curr.value}, going right.`
                    });
                    // Move to right
                    const nextId = curr.right;
                    curr = currentNodes.find((n: TreeNode) => n.id === nextId);
                }
            }
        }

        // Final State Update
        const finalNodes = calculateLayout(currentNodes, rootId);
        setNodes(finalNodes);
        setEdges(getEdgesFromNodes(finalNodes));
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const deleteNode = (val: number) => {
        setActiveAlgorithm('delete');
        setFrames([]);
        setCurrentStep(0);

        let framesBuffer: Frame[] = [];
        // Deep copy
        let currentNodes: TreeNode[] = JSON.parse(JSON.stringify(nodes));
        // Need to rebuild pointers since JSON.parse removes function/prop links if they existed? No, just data.

        const deleteRecursive = (nodeId: number | undefined, key: number, _parentId: number | null): number | undefined => {
            if (nodeId === undefined) return undefined;
            const nodeIndex = currentNodes.findIndex(n => n.id === nodeId);
            const node = currentNodes[nodeIndex];

            framesBuffer.push({
                nodes: calculateLayout([...currentNodes], rootId),
                edges: getEdgesFromNodes(currentNodes),
                highlights: [node.id],
                codeLine: 1,
                pseudoLines: ["if root == NULL return root", "if key < root->val delete(left)", "else if key > root->val delete(right)", "else (found):", "  if one child: return child", "  if two children: replace with successor, delete successor"],
                description: `Visiting node ${node.value} searching for ${key}.`
            });

            if (key < node.value) {
                framesBuffer.push({
                    nodes: calculateLayout([...currentNodes], rootId),
                    edges: getEdgesFromNodes(currentNodes),
                    highlights: [node.id],
                    evaluated: [node.id],
                    codeLine: 2,
                    pseudoLines: ["if root == NULL return root", "if key < root->val delete(left)", "else if key > root->val delete(right)", "else (found):", "  if one child: return child", "  if two children: replace with successor, delete successor"],
                    description: `${key} < ${node.value}, going left.`
                });
                const newLeft = deleteRecursive(node.left, key, node.id);
                currentNodes[nodeIndex].left = newLeft;
                return node.id;
            } else if (key > node.value) {
                framesBuffer.push({
                    nodes: calculateLayout([...currentNodes], rootId),
                    edges: getEdgesFromNodes(currentNodes),
                    highlights: [node.id],
                    evaluated: [node.id],
                    codeLine: 3,
                    pseudoLines: ["if root == NULL return root", "if key < root->val delete(left)", "else if key > root->val delete(right)", "else (found):", "  if one child: return child", "  if two children: replace with successor, delete successor"],
                    description: `${key} > ${node.value}, going right.`
                });
                const newRight = deleteRecursive(node.right, key, node.id);
                currentNodes[nodeIndex].right = newRight;
                return node.id;
            } else {
                // Found node
                framesBuffer.push({
                    nodes: calculateLayout([...currentNodes], rootId),
                    edges: getEdgesFromNodes(currentNodes),
                    highlights: [node.id],
                    codeLine: 4,
                    pseudoLines: ["if root == NULL return root", "if key < root->val delete(left)", "else if key > root->val delete(right)", "else (found):", "  if one child: return child", "  if two children: replace with successor, delete successor"],
                    description: `Found node ${key} to delete.`
                });

                // Case 1: No child or 1 child
                if (node.left === undefined) {
                    const temp = node.right;
                    // Remove node from array
                    currentNodes = currentNodes.filter(n => n.id !== node.id);
                    framesBuffer.push({
                        nodes: calculateLayout([...currentNodes], rootId),
                        edges: getEdgesFromNodes(currentNodes),
                        highlights: [],
                        codeLine: 5,
                        pseudoLines: ["if root == NULL return root", "if key < root->val delete(left)", "else if key > root->val delete(right)", "else (found):", "  if one child: return child", "  if two children: replace with successor, delete successor"],
                        description: `Node has no left child. Replacing with right child.`
                    });
                    return temp;
                } else if (node.right === undefined) {
                    const temp = node.left;
                    currentNodes = currentNodes.filter(n => n.id !== node.id);
                    framesBuffer.push({
                        nodes: calculateLayout([...currentNodes], rootId),
                        edges: getEdgesFromNodes(currentNodes),
                        highlights: [],
                        codeLine: 5,
                        pseudoLines: ["if root == NULL return root", "if key < root->val delete(left)", "else if key > root->val delete(right)", "else (found):", "  if one child: return child", "  if two children: replace with successor, delete successor"],
                        description: `Node has no right child. Replacing with left child.`
                    });
                    return temp;
                }

                // Get inorder successor (min in right subtree)
                let succ = currentNodes.find(n => n.id === node.right)!;
                while (succ.left !== undefined) {
                    succ = currentNodes.find(n => n.id === succ.left)!;
                }

                framesBuffer.push({
                    nodes: calculateLayout([...currentNodes], rootId),
                    edges: getEdgesFromNodes(currentNodes),
                    highlights: [node.id, succ.id],
                    codeLine: 6,
                    pseudoLines: ["if root == NULL return root", "if key < root->val delete(left)", "else if key > root->val delete(right)", "else (found):", "  if one child: return child", "  if two children: replace with successor, delete successor"],
                    description: `Found successor ${succ.value}. Replacing ${node.value} with ${succ.value}.`
                });

                // Swap values
                node.value = succ.value;

                // Delete successor
                const newRight = deleteRecursive(node.right, succ.value, node.id);
                node.right = newRight;
                return node.id;
            }
        };

        const newRootId = deleteRecursive(rootId ?? undefined, val, null);

        // Handling if root changed (only if original root was deleted)
        // But logic returns the node struct for the subtree.

        // Final cleanup of parentIds which might be messy now?
        // Layout function relies on 'left' and 'right' from the nodes, which we updated.
        // It recursively positions.

        // Filter out nodes not reachable from root (garbage collection)
        // This is complex, but the delete logic above removes them from 'currentNodes'.

        // Re-calculate layout with new structure
        // If root was deleted, we need to know the new root.
        // If 'rootId' passed to recursive was deleted, it returned the new child.
        // We need to update rootId state if the root was the one called.

        // Actually we need to update 'currentNodes' properly in state.
        const finalNodes = calculateLayout(currentNodes, rootId === val ? (newRootId ?? null) : rootId); // Only simple check, might need better root tracking

        // Better root tracking:
        const realRoot = currentNodes.find(n => !currentNodes.some(other => other.left === n.id || other.right === n.id));

        setNodes(finalNodes);
        setEdges(getEdgesFromNodes(finalNodes));
        if (realRoot) setRootId(realRoot.id);
        else setRootId(null);

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const search = (val: number) => {
        setActiveAlgorithm('search');
        setFrames([]);
        setCurrentStep(0);

        const framesBuffer: Frame[] = [];
        let outputStr = "";
        let curr = nodes.find(n => n.id === rootId);

        framesBuffer.push({
            nodes: [...nodes],
            edges: [...edges],
            highlights: [],
            codeLine: 0,
            pseudoLines: ["if root == NULL or root->val == target, return root", "if target < root->val, search(root->left)", "else search(root->right)"],
            description: `Starting search for ${val}.`,
            output: `Searching: ${outputStr}`
        });

        while (curr) {
            outputStr += (outputStr ? " -> " : "") + curr.value;
            framesBuffer.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [curr.id],
                codeLine: 1,
                pseudoLines: ["if root == NULL or root->val == target, return root", "if target < root->val, search(root->left)", "else search(root->right)"],
                description: `Checking node ${curr.value}.`,
                output: `Path: ${outputStr}`
            });

            if (curr.value === val) {
                framesBuffer.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [curr.id],
                    evaluated: [curr.id],
                    codeLine: 1,
                    pseudoLines: ["if root == NULL or root->val == target, return root", "if target < root->val, search(root->left)", "else search(root->right)"],
                    description: `Found ${val}!`,
                    output: `Found: ${outputStr}`
                });
                break;
            }

            if (val < curr.value) {
                framesBuffer.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [curr.id],
                    evaluated: [curr.id],
                    codeLine: 2,
                    pseudoLines: ["if root == NULL or root->val == target, return root", "if target < root->val, search(root->left)", "else search(root->right)"],
                    description: `${val} < ${curr.value}, going left.`,
                    output: `Path: ${outputStr}`
                });
                if (curr.left === undefined) break;
                curr = nodes.find(n => n.id === curr!.left);
            } else {
                framesBuffer.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [curr.id],
                    evaluated: [curr.id],
                    codeLine: 3,
                    pseudoLines: ["if root == NULL or root->val == target, return root", "if target < root->val, search(root->left)", "else search(root->right)"],
                    description: `${val} > ${curr.value}, going right.`,
                    output: `Path: ${outputStr}`
                });
                if (curr.right === undefined) break;
                curr = nodes.find(n => n.id === curr!.right);
            }
        }

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    // Traversals
    const traverse = (type: 'inorder' | 'preorder' | 'postorder' | 'bfs') => {
        setActiveAlgorithm(type);
        setFrames([]);
        setCurrentStep(0);

        const framesBuffer: Frame[] = [];
        const visited: number[] = [];

        // Definition
        let pseudoLines: string[] = [];
        if (type === 'inorder') pseudoLines = ["inorder(left)", "print(root)", "inorder(right)"];
        if (type === 'preorder') pseudoLines = ["print(root)", "preorder(left)", "preorder(right)"];
        if (type === 'postorder') pseudoLines = ["postorder(left)", "postorder(right)", "print(root)"];
        if (type === 'bfs') pseudoLines = ["queue.push(root)", "while queue not empty:", "  node = queue.pop()", "  print(node)", "  if node.left: queue.push(node.left)", "  if node.right: queue.push(node.right)"];

        if (type === 'bfs') {
            if (rootId === null) return;
            const queue: number[] = [rootId];

            // Initial Frame
            framesBuffer.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [],
                codeLine: 0,
                pseudoLines,
                description: `Starting Level Order Traversal (BFS).`,
                output: ''
            });

            while (queue.length > 0) {
                const nodeId = queue.shift()!;
                const node = nodes.find(n => n.id === nodeId)!;

                // Visit Node
                visited.push(node.value);
                const currentOutput = visited.join(', ');

                framesBuffer.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [node.id],
                    evaluated: [node.id],
                    codeLine: 2,
                    pseudoLines,
                    description: `Dequeued ${node.value}. Visiting.`,
                    output: currentOutput
                });

                // Add left child
                if (node.left !== undefined) {
                    queue.push(node.left);
                    framesBuffer.push({
                        nodes: [...nodes],
                        edges: [...edges],
                        highlights: [node.id, node.left],
                        codeLine: 4,
                        pseudoLines,
                        description: `Enqueuing left child ${nodes.find(n => n.id === node.left)!.value}.`,
                        output: currentOutput
                    });
                }

                // Add right child
                if (node.right !== undefined) {
                    queue.push(node.right);
                    framesBuffer.push({
                        nodes: [...nodes],
                        edges: [...edges],
                        highlights: [node.id, node.right],
                        codeLine: 5,
                        pseudoLines,
                        description: `Enqueuing right child ${nodes.find(n => n.id === node.right)!.value}.`,
                        output: currentOutput
                    });
                }
            }

            setFrames(framesBuffer);
            setIsPlaying(true);
            return;
        }

        const recurse = (nodeId: number | undefined) => {
            if (nodeId === undefined) return;
            const node = nodes.find(n => n.id === nodeId)!;

            // Just entering node
            framesBuffer.push({
                nodes: [...nodes],
                edges: [...edges],
                highlights: [node.id],
                codeLine: 0,
                pseudoLines,
                description: `Visiting ${node.value}.`,
                output: visited.join(', ')
            });

            if (type === 'preorder') {
                visited.push(node.value);
                framesBuffer.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [node.id],
                    evaluated: [node.id], // Show printed
                    codeLine: 0,
                    pseudoLines,
                    description: `Processed ${node.value}.`,
                    output: visited.join(', ')
                });
            }

            if (type !== 'preorder') recurse(node.left); // for in/post
            if (type === 'preorder') recurse(node.left);

            if (type === 'inorder') {
                visited.push(node.value);
                framesBuffer.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [node.id],
                    evaluated: [node.id],
                    codeLine: 1,
                    pseudoLines,
                    description: `Processed ${node.value}.`,
                    output: visited.join(', ')
                });
            }

            if (type !== 'postorder') recurse(node.right); // for in/pre
            if (type === 'postorder') recurse(node.right);

            if (type === 'postorder') {
                visited.push(node.value);
                framesBuffer.push({
                    nodes: [...nodes],
                    edges: [...edges],
                    highlights: [node.id],
                    evaluated: [node.id],
                    codeLine: 2,
                    pseudoLines,
                    description: `Processed ${node.value}.`,
                    output: visited.join(', ')
                });
            }
        };

        if (rootId !== null) recurse(rootId);

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    // --- Playback Control ---
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


    // Reset
    const reset = () => {
        setNodes(INITIAL_NODES);
        setEdges(INITIAL_EDGES);
        setRootId(0);
        setFrames([]);
        setCurrentStep(0);
        setIsPlaying(false);
        setActiveAlgorithm(null);
    };

    const clear = () => {
        setNodes([]);
        setEdges([]);
        setRootId(null);
        setFrames([]);
        setCurrentStep(0);
        setIsPlaying(false);
        setActiveAlgorithm(null);
    }

    const handleExample = () => {
        reset();
    };

    // --- INTERACTIVE EDITING ---
    const addNode = (x: number, y: number) => {
        // Find existing values to propose a new unique value
        let val = 10;
        const existingValues = new Set(nodes.map(n => n.value));
        while (existingValues.has(val)) {
            val += 5;
        }

        // Simple prompt for now, could be improved with UI
        const input = prompt("Enter value for new node:", val.toString());
        if (input === null) return;
        const value = parseInt(input);
        if (isNaN(value)) return;

        const newNode: TreeNode = {
            id: nextIdRef.current++,
            value,
            x,
            y
        };

        setNodes(prev => [...prev, newNode]);
        setFrames([]); // Clear animation frames
        setCurrentStep(0);
        setIsPlaying(false);
        setActiveAlgorithm(null);

        // If it's the first node, make it root
        if (nodes.length === 0) {
            setRootId(newNode.id);
        }
    };

    const addEdge = (from: number, to: number) => {
        if (from === to) return; // No self-loops

        // Check if edge already exists
        const existingEdge = edges.find(e => e.from === from && e.to === to);
        if (existingEdge) return;

        // Validation: Parent (from) can have max 2 children
        const children = edges.filter(e => e.from === from);
        if (children.length >= 2) {
            alert("Node already has 2 children!");
            return;
        }

        // Cycle Detection (Simple: Check if 'to' is ancestor of 'from')
        let currId = from;
        const parentMap = new Map<number, number>();
        edges.forEach(e => parentMap.set(e.to, e.from));

        let path = new Set<number>();
        while (parentMap.has(currId)) {
            currId = parentMap.get(currId)!;
            path.add(currId);
            if (currId === to) {
                alert("Cannot create cycle!");
                return;
            }
        }

        // Also check if 'to' already has a parent
        if (parentMap.has(to)) {
            alert("Target node already has a parent!");
            return;
        }

        // Decide Left or Right child
        // If no children, check values to decide BST property? 
        // Or just fill left then right? 
        // Let's try to maintain BST property if values allow, 
        // otherwise default to Left first, then Right.

        const fromNode = nodes.find(n => n.id === from);
        const toNode = nodes.find(n => n.id === to);

        if (!fromNode || !toNode) return;

        // Update Node Structure
        const newNodes = nodes.map(n => {
            if (n.id === from) {
                // If BST property matches
                if (toNode.value < fromNode.value && !n.left) {
                    return { ...n, left: to };
                } else if (toNode.value > fromNode.value && !n.right) {
                    return { ...n, right: to };
                } else {
                    // Fallback: fill empty slot
                    if (!n.left) return { ...n, left: to };
                    if (!n.right) return { ...n, right: to };
                }
            }
            // Also need to set parentId for 'to' node
            if (n.id === to) {
                return { ...n, parentId: from };
            }
            return n;
        });

        const newEdges = [...edges, { from, to }];
        setNodes(newNodes);
        setEdges(newEdges);

        // Clear animation
        setFrames([]);
        setCurrentStep(0);
        setIsPlaying(false);
    };

    const removeNodeById = (id: number) => {
        // Remove node
        const newNodes = nodes.filter(n => n.id !== id).map(n => {
            // Remove references from parents
            if (n.left === id) return { ...n, left: undefined };
            if (n.right === id) return { ...n, right: undefined };
            return n;
        });

        // Remove connected edges
        const newEdges = edges.filter(e => e.from !== id && e.to !== id);

        setNodes(newNodes);
        setEdges(newEdges);

        // Update root if root was deleted
        if (rootId === id) {
            // Find new potential root (node with no parent)
            // Or set to null if empty
            if (newNodes.length === 0) setRootId(null);
            else {
                // Anyone without parent could be a root of a subtree
                // We'll just let the effect handle it or pick one
                // The effect: const root = nodes.find(n => n.parentId === undefined || n.parentId === null);
                // But we modified nodes to remove parent refs? No, we didn't update parentId of children of deleted node.
                // Their parentId is now pointing to deleted node.
                // We should clear their parentId.
                const cleanedNodes = newNodes.map(n => {
                    if (n.parentId === id) return { ...n, parentId: undefined };
                    return n;
                });
                setNodes(cleanedNodes);
            }
        } else {
            const cleanedNodes = newNodes.map(n => {
                if (n.parentId === id) return { ...n, parentId: undefined };
                return n;
            });
            setNodes(cleanedNodes);
        }

        setFrames([]);
        setCurrentStep(0);
        setIsPlaying(false);
    };

    const removeEdge = (from: number, to: number) => {
        const newEdges = edges.filter(e => !(e.from === from && e.to === to));
        const newNodes = nodes.map(n => {
            if (n.id === from) {
                if (n.left === to) return { ...n, left: undefined };
                if (n.right === to) return { ...n, right: undefined };
            }
            if (n.id === to) {
                return { ...n, parentId: undefined };
            }
            return n;
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setFrames([]);
        setCurrentStep(0);
        setIsPlaying(false);
    };

    const moveNode = (id: number, x: number, y: number) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
        // We might want to clear frames if layout changes significantly, 
        // but for dragging we might want to keep state? 
        // Usually better to clear to avoid confusion between "visualized layout" and "manual layout"
        // setFrames([]); 
        // setCurrentStep(0);
    };

    // --- DATA TRANSFORMATION / HELPERS ---
    const generateRandomTree = () => {
        const count = Math.floor(Math.random() * 8) + 7; // 7 to 14 nodes
        const values = new Set<number>();
        while (values.size < count) {
            values.add(Math.floor(Math.random() * 99) + 1);
        }

        // Build generic BST from scratch without animation frames to start fresh
        let currentNodes: TreeNode[] = [];
        let nextId = 0;
        const insertHelper = (rootId: number | null, val: number, parentId: number | null): number => {
            if (rootId === null) {
                const id = nextId++;
                currentNodes.push({ id, value: val, x: 0, y: 0, parentId: parentId ?? undefined }); // Layout will fix x,y
                return id;
            }
            const node = currentNodes.find(n => n.id === rootId)!;
            if (val < node.value) {
                node.left = insertHelper(node.left ?? null, val, node.id);
            } else {
                node.right = insertHelper(node.right ?? null, val, node.id);
            }
            return rootId;
        }

        let root: number | null = null;
        for (const val of values) {
            root = insertHelper(root, val, null);
        }

        const layoutNodes = calculateLayout(currentNodes, root);
        setNodes(layoutNodes);
        setEdges(getEdgesFromNodes(layoutNodes));
        setRootId(root);
        nextIdRef.current = nextId;
        setFrames([]);
        setCurrentStep(0);
        setIsPlaying(false);
    };

    // --- TRAVERSALS (Extended) ---
    const traverseZigZag = () => {
        if (rootId === null) return;
        setActiveAlgorithm('zigzag');
        setFrames([]);
        setCurrentStep(0);

        const framesBuffer: Frame[] = [];
        const queue: { id: number, level: number }[] = [{ id: rootId, level: 0 }];
        const result: number[] = [];
        const visitedIds = new Set<number>();

        const pseudoLines = [
            "queue = [(root, 0)]",
            "while queue not empty:",
            "  level_nodes = process_level(queue)",
            "  if level % 2 == 1: reverse(level_nodes)",
            "  print(level_nodes)"
        ];

        framesBuffer.push({
            nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines,
            description: "Starting Zig-Zag (Spiral) Traversal.", output: ""
        });

        while (queue.length > 0) {
            const levelSize = queue.length;
            const currentLevelNodes: number[] = [];
            const level = queue[0].level;

            // Collect level
            for (let i = 0; i < levelSize; i++) {
                const item = queue.shift()!;
                currentLevelNodes.push(item.id);
                const node = nodes.find(n => n.id === item.id)!;

                if (node.left !== undefined) queue.push({ id: node.left, level: level + 1 });
                if (node.right !== undefined) queue.push({ id: node.right, level: level + 1 });
            }

            // Process level
            const processOrder = (level % 2 === 1) ? [...currentLevelNodes].reverse() : currentLevelNodes;

            for (const nodeId of processOrder) {
                const node = nodes.find(n => n.id === nodeId)!;
                result.push(node.value);
                visitedIds.add(nodeId);

                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges],
                    highlights: [...visitedIds],
                    evaluated: [nodeId],
                    codeLine: 2, pseudoLines,
                    description: `Level ${level} (${level % 2 === 0 ? 'L->R' : 'R->L'}): Visiting ${node.value}.`,
                    output: result.join(', ')
                });
            }
        }

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    // --- BST OPERATIONS ---
    const findMin = () => {
        if (rootId === null) return;
        setActiveAlgorithm('findMin');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let curr = nodes.find(n => n.id === rootId);

        const pseudoLines = ["curr = root", "while curr.left != NULL:", "  curr = curr.left", "return curr.val"];

        while (curr) {
            if (curr.left === undefined) {
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [curr.id], evaluated: [curr.id], codeLine: 3, pseudoLines,
                    description: `No left child. Min value is ${curr.value}.`
                });
                break;
            }
            curr = nodes.find(n => n.id === curr!.left);
        }
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const findMax = () => {
        if (rootId === null) return;
        setActiveAlgorithm('findMax');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let curr = nodes.find(n => n.id === rootId);

        const pseudoLines = ["curr = root", "while curr.right != NULL:", "  curr = curr.right", "return curr.val"];

        while (curr) {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [curr.id], codeLine: 1, pseudoLines,
                description: `Visiting ${curr.value}.`
            });

            if (curr.right === undefined) {
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [curr.id], evaluated: [curr.id], codeLine: 3, pseudoLines,
                    description: `No right child. Max value is ${curr.value}.`
                });
                break;
            }
            curr = nodes.find(n => n.id === curr!.right);
        }
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const findSuccessor = (val: number) => {
        // Implementation for successor
        // 1. Search node
        // 2. If node has right subtree: min(right)
        // 3. Else: ancestor where node is in left subtree
        setActiveAlgorithm('successor');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];

        let curr = nodes.find(n => n.id === rootId);
        let targetNode: TreeNode | undefined;
        let ancestor: TreeNode | undefined;

        // Search
        while (curr) {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [curr.id], codeLine: 0, pseudoLines: ["Search node", "If right child: return min(right)", "Else: return deepest ancestor where node is in left subtree"],
                description: `Searching for ${val}... At ${curr.value}`
            });
            if (curr.value === val) {
                targetNode = curr;
                break;
            } else if (val < curr.value) {
                ancestor = curr; // Potential successor
                curr = nodes.find(n => n.id === curr!.left);
            } else {
                curr = nodes.find(n => n.id === curr!.right);
            }
        }

        if (!targetNode) {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["Search node", "If right child: return min(right)", "Else: return deepest ancestor where node is in left subtree"],
                description: `Node ${val} not found.`
            });
            setFrames(framesBuffer);
            setIsPlaying(true);
            return;
        }

        if (targetNode.right !== undefined) {
            // Case 1: Min of right subtree
            let temp = nodes.find(n => n.id === targetNode!.right)!;
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [targetNode.id, temp.id], codeLine: 1, pseudoLines: ["Search node", "If right child: return min(right)", "Else: return deepest ancestor where node is in left subtree"],
                description: `Node has right child. Successor is min of right subtree.`
            });
            while (temp.left !== undefined) {
                temp = nodes.find(n => n.id === temp!.left)!;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [targetNode.id, temp.id], codeLine: 1, pseudoLines: ["Search node", "If right child: return min(right)", "Else: return deepest ancestor where node is in left subtree"],
                    description: `Going left... At ${temp.value}`
                });
            }
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [targetNode.id], evaluated: [temp.id], codeLine: 1, pseudoLines: ["Search node", "If right child: return min(right)", "Else: return deepest ancestor where node is in left subtree"],
                description: `Successor of ${val} is ${temp.value}.`
            });
        } else {
            // Case 2: Ancestor
            if (ancestor) {
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [targetNode.id], evaluated: [ancestor.id], codeLine: 2, pseudoLines: ["Search node", "If right child: return min(right)", "Else: return deepest ancestor where node is in left subtree"],
                    description: `No right child. Successor is first ancestor where we went left: ${ancestor.value}.`
                });
            } else {
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [targetNode.id], codeLine: 2, pseudoLines: ["Search node", "If right child: return min(right)", "Else: return deepest ancestor where node is in left subtree"],
                    description: `No right child and no such ancestor. ${val} is the maximum node.`
                });
            }
        }
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const findPredecessor = (val: number) => {
        // Symmetric to successor
        // 1. Search node
        // 2. If node has left subtree: max(left)
        // 3. Else: ancestor where node is in right subtree
        setActiveAlgorithm('predecessor');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let outputStr = "";

        let curr = nodes.find(n => n.id === rootId);
        let targetNode: TreeNode | undefined;
        let ancestor: TreeNode | undefined;

        // Search
        while (curr) {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [curr.id], codeLine: 0, pseudoLines: ["Search node", "If left child: return max(left)", "Else: return deepest ancestor where node is in right subtree"],
                description: `Searching for ${val}... At ${curr.value}`,
                output: outputStr
            });
            if (curr.value === val) {
                targetNode = curr;
                break;
            } else if (val < curr.value) {
                curr = nodes.find(n => n.id === curr!.left);
            } else {
                ancestor = curr; // Potential predecessor
                curr = nodes.find(n => n.id === curr!.right);
            }
        }

        if (!targetNode) {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["Search node", "If left child: return max(left)", "Else: return deepest ancestor where node is in right subtree"],
                description: `Node ${val} not found.`,
                output: `Node ${val} not found.`
            });
            setFrames(framesBuffer);
            setIsPlaying(true);
            return;
        }

        if (targetNode.left !== undefined) {
            // Case 1: Max of left subtree
            let temp = nodes.find(n => n.id === targetNode!.left)!;
            outputStr += ` -> (max of left subtree starting from ${temp.value})`;
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [targetNode.id, temp.id], codeLine: 1, pseudoLines: ["Search node", "If left child: return max(left)", "Else: return deepest ancestor where node is in right subtree"],
                description: `Node has left child. Predecessor is max of left subtree.`,
                output: outputStr
            });
            while (temp.right !== undefined) {
                temp = nodes.find(n => n.id === temp!.right)!;
                outputStr += ` -> ${temp.value}`;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [targetNode.id, temp.id], codeLine: 1, pseudoLines: ["Search node", "If left child: return max(left)", "Else: return deepest ancestor where node is in right subtree"],
                    description: `Going right... At ${temp.value}`,
                    output: outputStr
                });
            }
            outputStr += ` -> Predecessor: ${temp.value}`;
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [targetNode.id], evaluated: [temp.id], codeLine: 1, pseudoLines: ["Search node", "If left child: return max(left)", "Else: return deepest ancestor where node is in right subtree"],
                description: `Predecessor of ${val} is ${temp.value}.`,
                output: outputStr
            });
        } else {
            // Case 2: Ancestor
            if (ancestor) {
                outputStr += ` -> Ancestor: ${ancestor.value}`;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [targetNode.id], evaluated: [ancestor.id], codeLine: 2, pseudoLines: ["Search node", "If left child: return max(left)", "Else: return deepest ancestor where node is in right subtree"],
                    description: `No left child. Predecessor is first ancestor where we went right: ${ancestor.value}.`,
                    output: outputStr
                });
            } else {
                outputStr += ` -> No predecessor (min node)`;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [targetNode.id], codeLine: 2, pseudoLines: ["Search node", "If left child: return max(left)", "Else: return deepest ancestor where node is in right subtree"],
                    description: `No left child and no such ancestor. ${val} is the minimum node.`,
                    output: outputStr
                });
            }
        }
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const validateBST = () => {
        setActiveAlgorithm('validate');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let outputStr = "";

        const isValid = (nodeId: number | undefined, min: number | null, max: number | null): boolean => {
            if (nodeId === undefined) return true;
            const node = nodes.find(n => n.id === nodeId)!;

            outputStr += (outputStr ? " -> " : "") + node.value;
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [node.id], codeLine: 0, pseudoLines: ["validate(node, min, max)", "if node.val <= min or node.val >= max: return false", "return validate(left, min, node.val) && validate(right, node.val, max)"],
                description: `Checking ${node.value} in range (${min ?? '-inf'}, ${max ?? 'inf'}).`,
                output: outputStr
            });

            if ((min !== null && node.value <= min) || (max !== null && node.value >= max)) {
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [node.id], evaluated: [node.id], codeLine: 1, pseudoLines: ["validate(node, min, max)", "if node.val <= min or node.val >= max: return false", "return validate(left, min, node.val) && validate(right, node.val, max)"],
                    description: `Invalid! ${node.value} is not in range (${min ?? '-inf'}, ${max ?? 'inf'}).`,
                    output: `Invalid: ${node.value}`
                });
                return false;
            }

            if (!isValid(node.left, min, node.value)) return false;
            if (!isValid(node.right, node.value, max)) return false;

            return true;
        };

        if (isValid(rootId ?? undefined, null, null)) {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 2, pseudoLines: ["validate(node, min, max)", "if node.val <= min or node.val >= max: return false", "return validate(left, min, node.val) && validate(right, node.val, max)"],
                description: `Tree is a Valid BST.`,
                output: `Valid BST`
            });
        } else {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 1, pseudoLines: ["validate(node, min, max)", "if node.val <= min or node.val >= max: return false", "return validate(left, min, node.val) && validate(right, node.val, max)"],
                description: `Tree is NOT a Valid BST.`,
                output: `Not a Valid BST`
            });
        }

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    // --- PROPERTIES ---
    const checkHeight = () => {
        setActiveAlgorithm('height');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];

        const getHeight = (nodeId: number | undefined): number => {
            if (nodeId === undefined) {
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["height(node)", "l = height(left), r = height(right)", "return 1 + max(l, r)"],
                    description: `Reached null node. Height is -1.`,
                    output: `Height: -1`
                });
                return -1; // Height of empty is -1 or 0? Usually -1 for edges count or 0 for nodes count. Let's say height is max edges from root to leaf. Single node is 0. Empty is -1.
            }
            const node = nodes.find(n => n.id === nodeId)!;

            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [node.id], codeLine: 0, pseudoLines: ["height(node)", "l = height(left), r = height(right)", "return 1 + max(l, r)"],
                description: `Visiting ${node.value}. Computing height of children.`,
                output: `Current: ${node.value}`
            });

            const l = getHeight(node.left);
            const r = getHeight(node.right);
            const h = 1 + Math.max(l, r);

            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [node.id], evaluated: [node.id], codeLine: 2, pseudoLines: ["height(node)", "l = height(left), r = height(right)", "return 1 + max(l, r)"],
                description: `Height of ${node.value} is 1 + max(${l}, ${r}) = ${h}.`,
                output: `Height(${node.value}): ${h}`
            });
            return h;
        };

        const h = getHeight(rootId ?? undefined);
        framesBuffer.push({
            nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 2, pseudoLines: ["height(node)", "l = height(left), r = height(right)", "return 1 + max(l, r)"],
            description: `Total height of the tree is ${h}.`,
            output: `Total Height: ${h}`
        });
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const countNodes = () => {
        // Simple recursive count
        setActiveAlgorithm('count');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let count = 0;
        let outputStr = "";

        const traverse = (nodeId: number | undefined) => {
            if (nodeId === undefined) return;
            const node = nodes.find(n => n.id === nodeId)!;
            count++;
            outputStr += (outputStr ? " -> " : "") + node.value;

            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [node.id], codeLine: 0, pseudoLines: ["count++", "traverse(left)", "traverse(right)"],
                description: `Found node ${node.value}. Current count: ${count}.`,
                output: outputStr
            });

            traverse(node.left);
            traverse(node.right);
        };
        traverse(rootId ?? undefined);
        framesBuffer.push({
            nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["count++", "traverse(left)", "traverse(right)"],
            description: `Total nodes in the tree: ${count}.`,
            output: `Total Nodes: ${count}`
        });
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const countLeafNodes = () => {
        setActiveAlgorithm('countLeaves');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let count = 0;
        let outputStr = "";

        const traverse = (nodeId: number | undefined) => {
            if (nodeId === undefined) return;
            const node = nodes.find(n => n.id === nodeId)!;

            const isLeaf = node.left === undefined && node.right === undefined;
            if (isLeaf) {
                count++;
                outputStr += (outputStr ? " -> " : "") + node.value;
            }

            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [node.id], evaluated: isLeaf ? [node.id] : [], codeLine: 0, pseudoLines: ["if isLeaf: count++", "traverse(left)", "traverse(right)"],
                description: `Visiting ${node.value}. ${isLeaf ? 'Is Leaf. Current count: ' + count : 'Not a leaf.'}`,
                output: `Leaves: ${outputStr}`
            });

            traverse(node.left);
            traverse(node.right);
        };
        traverse(rootId ?? undefined);
        framesBuffer.push({
            nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["if isLeaf: count++", "traverse(left)", "traverse(right)"],
            description: `Total leaf nodes in the tree: ${count}.`,
            output: `Total Leaves: ${count}`
        });
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const checkDiameter = () => {
        setActiveAlgorithm('diameter');
        // Diameter is max dist between any two nodes. O(N^2) naive or O(N) optimized.
        // We do O(N) using height.
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let maxDiameter = 0;
        let outputStr = "";

        const traverse = (nodeId: number | undefined): number => {
            if (nodeId === undefined) return 0; // height approach: 0 for null
            const node = nodes.find(n => n.id === nodeId)!;

            outputStr += (outputStr ? " -> " : "") + node.value;
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [node.id], codeLine: 0, pseudoLines: ["l = height(left), r = height(right)", "diameter = max(diameter, l+r)", "return 1 + max(l, r)"],
                description: `Visiting ${node.value}.`,
                output: outputStr
            });

            const l = traverse(node.left);
            const r = traverse(node.right);

            maxDiameter = Math.max(maxDiameter, l + r);

            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [node.id], evaluated: [node.id], codeLine: 1, pseudoLines: ["l = height(left), r = height(right)", "diameter = max(diameter, l+r)", "return 1 + max(l, r)"],
                description: `At ${node.value}: L-height=${l}, R-height=${r}. Path through node=${l + r}. Max Diameter so far=${maxDiameter}.`,
                output: `Max Diameter: ${maxDiameter}`
            });

            return 1 + Math.max(l, r);
        };
        traverse(rootId ?? undefined);
        framesBuffer.push({
            nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 1, pseudoLines: ["l = height(left), r = height(right)", "diameter = max(diameter, l+r)", "return 1 + max(l, r)"],
            description: `The diameter of the tree is ${maxDiameter}.`,
            output: `Final Diameter: ${maxDiameter}`
        });
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const checkBalanced = () => {
        setActiveAlgorithm('balanced');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let isTreeBalanced = true;

        const check = (nodeId: number | undefined): number => {
            if (nodeId === undefined) return 0;
            const node = nodes.find(n => n.id === nodeId)!;

            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [node.id], codeLine: 0, pseudoLines: ["l = check(left), r = check(right)", "if abs(l-r) > 1 return -1", "if l==-1 or r==-1 return -1", "return 1+max(l,r)"],
                description: `Checking balance of ${node.value}.`,
                output: `Checking: ${node.value}`
            });

            const l = check(node.left);
            if (l === -1) {
                isTreeBalanced = false;
                return -1;
            }
            const r = check(node.right);
            if (r === -1) {
                isTreeBalanced = false;
                return -1;
            }

            if (Math.abs(l - r) > 1) {
                isTreeBalanced = false;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [node.id], evaluated: [node.id], codeLine: 1, pseudoLines: ["l = check(left), r = check(right)", "if abs(l-r) > 1 return -1", "if l==-1 or r==-1 return -1", "return 1+max(l,r)"],
                    description: `Unbalanced at ${node.value}! Left height ${l}, Right height ${r}.`,
                    output: `Unbalanced at ${node.value}`
                });
                return -1;
            }
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [node.id], codeLine: 3, pseudoLines: ["l = check(left), r = check(right)", "if abs(l-r) > 1 return -1", "if l==-1 or r==-1 return -1", "return 1+max(l,r)"],
                description: `${node.value} is balanced (lh=${l}, rh=${r}).`,
                output: `Balanced: ${node.value}`
            });
            return 1 + Math.max(l, r);
        };

        check(rootId ?? undefined); // Call check, result is stored in isTreeBalanced
        if (isTreeBalanced) {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 3, pseudoLines: ["Tree is Balanced."], description: "Tree is Balanced.",
                output: "Tree is Balanced."
            });
        } else {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 1, pseudoLines: ["Tree is Unbalanced."], description: "Tree is Unbalanced.",
                output: "Tree is Unbalanced."
            });
        }
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const isFull = () => {
        // Full: every node has 0 or 2 children
        setActiveAlgorithm('isFull');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let isTreeFull = true;

        const check = (nodeId: number | undefined): boolean => {
            if (nodeId === undefined) return true;
            const node = nodes.find(n => n.id === nodeId)!;

            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [node.id], codeLine: 0, pseudoLines: ["if (left && !right) or (!left && right) return false", "check(left) && check(right)"], description: `Checking ${node.value}.`,
                output: `Checking: ${node.value}`
            });

            if ((node.left === undefined && node.right !== undefined) || (node.left !== undefined && node.right === undefined)) {
                isTreeFull = false;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [node.id], evaluated: [node.id], codeLine: 0, pseudoLines: ["if (left && !right) or (!left && right) return false", "check(left) && check(right)"], description: `Checking ${node.value}: Has only one child. Not Full.`,
                    output: `Not Full: ${node.value}`
                });
                return false;
            }

            if (!check(node.left)) return false;
            if (!check(node.right)) return false;
            return true;
        };

        check(rootId ?? undefined); // Call check, result is stored in isTreeFull
        if (isTreeFull) {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 1, pseudoLines: ["Tree is Full (0 or 2 children)."], description: "Tree is Full.",
                output: "Tree is Full."
            });
        } else {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["Tree is Not Full."], description: "Tree is Not Full.",
                output: "Tree is Not Full."
            });
        }
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const isComplete = () => {
        setActiveAlgorithm('isComplete');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let outputStr = "";

        if (rootId === null) {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["Empty tree is complete."], description: "Empty tree is complete.",
                output: "Empty tree is complete."
            });
            setFrames(framesBuffer);
            setIsPlaying(true);
            return;
        }

        const queue: (number | undefined)[] = [rootId];
        let foundNonFullNode = false;

        const pseudoLines = [
            "queue = [root]",
            "while queue not empty:",
            "  node = queue.dequeue()",
            "  if node is null:",
            "    foundNonFullNode = true",
            "  else:",
            "    if foundNonFullNode and (node.left or node.right): return false",
            "    queue.enqueue(node.left)",
            "    queue.enqueue(node.right)"
        ];

        while (queue.length > 0) {
            const nodeId = queue.shift();

            if (nodeId === undefined) {
                foundNonFullNode = true;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 4, pseudoLines,
                    description: `Encountered a null child. All subsequent nodes must be null.`,
                    output: outputStr + " -> null"
                });
            } else {
                const node = nodes.find(n => n.id === nodeId)!;
                outputStr += (outputStr ? " -> " : "") + node.value;

                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [node.id], codeLine: 2, pseudoLines,
                    description: `Visiting ${node.value}.`,
                    output: outputStr
                });

                if (foundNonFullNode && (node.left !== undefined || node.right !== undefined)) {
                    framesBuffer.push({
                        nodes: [...nodes], edges: [...edges], highlights: [node.id], evaluated: [node.id], codeLine: 6, pseudoLines,
                        description: `Found a non-null node (${node.value}) after encountering a null. Not Complete.`,
                        output: `Not Complete: ${node.value}`
                    });
                    setFrames(framesBuffer);
                    setIsPlaying(true);
                    return;
                }

                queue.push(node.left);
                queue.push(node.right);
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [node.id], codeLine: 7, pseudoLines,
                    description: `Enqueued children of ${node.value}.`,
                    output: outputStr
                });
            }
        }

        framesBuffer.push({
            nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 8, pseudoLines,
            description: `Tree is Complete.`,
            output: `Tree is Complete.`
        });
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    // --- CONSTRUCTION ---
    // --- CONSTRUCTION ---
    // --- CONSTRUCTION ---
    const buildFromArray = (input: string) => {
        const values = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        if (values.length === 0) return;

        setActiveAlgorithm('buildFromArray');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let outputStr = "";

        // Start fresh
        let currentNodes: TreeNode[] = [];
        let edgesList: TreeEdge[] = [];
        let nextId = 0;

        const getNextId = () => nextId++;

        // Helper to insert into currentNodes (non-recursive for state update)
        // We need to visualize the insertion of each value

        framesBuffer.push({
            nodes: [], edges: [], highlights: [], codeLine: 0, pseudoLines: ["foreach val in input:", "  insert(root, val)"],
            description: `Starting construction with: ${values.join(', ')}`,
            output: `Input: ${values.join(', ')}`
        });

        for (const val of values) {
            outputStr += (outputStr ? " -> " : "") + val;
            if (currentNodes.length === 0) {
                const rootId = getNextId();
                currentNodes.push({ id: rootId, value: val, x: 0, y: 0 });
                // Cannot rely on setRootId(state) during loop, use local tracking
            } else {
                let currId = currentNodes[0].id; // Root always at 0 if constructed this way? Yes for first node.
                while (true) {
                    const currNode = currentNodes.find(n => n.id === currId)!;
                    if (val < currNode.value) {
                        if (currNode.left === undefined) {
                            const newNodeId = getNextId();
                            currNode.left = newNodeId;
                            currentNodes.push({ id: newNodeId, value: val, x: 0, y: 0, parentId: currId });
                            edgesList.push({ from: currId, to: newNodeId });
                            break;
                        }
                        currId = currNode.left;
                    } else {
                        if (currNode.right === undefined) {
                            const newNodeId = getNextId();
                            currNode.right = newNodeId;
                            currentNodes.push({ id: newNodeId, value: val, x: 0, y: 0, parentId: currId });
                            edgesList.push({ from: currId, to: newNodeId });
                            break;
                        }
                        currId = currNode.right;
                    }
                }
            }

            // Snapshot after each insertion
            const rootNode = currentNodes.length > 0 ? currentNodes[0].id : null;
            const layoutNodes = calculateLayout([...currentNodes], rootNode);

            framesBuffer.push({
                nodes: layoutNodes,
                edges: getEdgesFromNodes(layoutNodes),
                highlights: [currentNodes[currentNodes.length - 1].id],
                codeLine: 1,
                pseudoLines: ["foreach val in input:", "  insert(root, val)"],
                description: `Inserted ${val}.`,
                output: outputStr
            });
        }

        setNodes(currentNodes);
        setEdges(getEdgesFromNodes(currentNodes));
        if (currentNodes.length > 0) setRootId(currentNodes[0].id);
        else setRootId(null);
        nextIdRef.current = nextId; // Update ref for future manual insertions

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const buildFromPreIn = (preStr: string, inStr: string) => {
        const preorder = preStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        const inorder = inStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

        if (preorder.length === 0 || inorder.length === 0 || preorder.length !== inorder.length) return;

        setActiveAlgorithm('buildPreIn');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let outputStr = "";

        let currentNodes: TreeNode[] = [];
        let nextId = 0;
        const getNextId = () => nextId++;
        let preIndex = 0;

        const build = (inStart: number, inEnd: number, parentId: number | null): number | null => {
            if (inStart > inEnd) return null;

            const val = preorder[preIndex++];
            const nodeId = getNextId();
            const node: TreeNode = { id: nodeId, value: val, x: 0, y: 0, parentId: parentId ?? undefined };
            currentNodes.push(node);
            outputStr += (outputStr ? " -> " : "") + val;

            // Find in inorder
            const inIndex = inorder.indexOf(val, inStart); // basic check, assumes unique values for simplicity

            framesBuffer.push({
                nodes: calculateLayout([...currentNodes], currentNodes.length > 0 ? currentNodes[0].id : null),
                edges: getEdgesFromNodes(currentNodes),
                highlights: [nodeId],
                codeLine: 0,
                pseudoLines: ["root = pre[preIndex++]", "inIndex = find(inorder, root.val)", "root.left = build(inStart, inIndex-1)", "root.right = build(inIndex+1, inEnd)"],
                description: `Created node ${val}. Found at index ${inIndex} in Inorder array.`,
                output: outputStr
            });

            node.left = build(inStart, inIndex - 1, nodeId) ?? undefined;
            node.right = build(inIndex + 1, inEnd, nodeId) ?? undefined;
            return nodeId;
        };

        const rootId = build(0, inorder.length - 1, null);
        const layoutNodes = calculateLayout(currentNodes, rootId);

        setNodes(layoutNodes);
        setEdges(getEdgesFromNodes(layoutNodes));
        setRootId(rootId);
        nextIdRef.current = nextId;
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const buildFromPostIn = (postStr: string, inStr: string) => {
        const postorder = postStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        const inorder = inStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

        if (postorder.length === 0 || inorder.length === 0 || postorder.length !== inorder.length) return;

        setActiveAlgorithm('buildPostIn');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let outputStr = "";

        let currentNodes: TreeNode[] = [];
        let nextId = 0;
        const getNextId = () => nextId++;
        let postIndex = postorder.length - 1;

        const build = (inStart: number, inEnd: number, parentId: number | null): number | null => {
            if (inStart > inEnd) return null;

            const val = postorder[postIndex--];
            const nodeId = getNextId();
            const node: TreeNode = { id: nodeId, value: val, x: 0, y: 0, parentId: parentId ?? undefined };
            currentNodes.push(node);
            outputStr += (outputStr ? " -> " : "") + val;

            const inIndex = inorder.indexOf(val, inStart);

            framesBuffer.push({
                nodes: calculateLayout([...currentNodes], currentNodes.length > 0 ? currentNodes[0].id : null),
                edges: getEdgesFromNodes(currentNodes),
                highlights: [nodeId],
                codeLine: 0,
                pseudoLines: ["root = post[postIndex--]", "inIndex = find(inorder, root.val)", "root.right = build(inIndex+1, inEnd)", "root.left = build(inStart, inIndex-1)"],
                description: `Created node ${val}. Found at index ${inIndex} in Inorder array.`,
                output: outputStr
            });

            // Right first in Postorder (L R Root -> Reverse: Root R L)
            node.right = build(inIndex + 1, inEnd, nodeId) ?? undefined;
            node.left = build(inStart, inIndex - 1, nodeId) ?? undefined;
            return nodeId;
        };

        const rootId = build(0, inorder.length - 1, null);
        const layoutNodes = calculateLayout(currentNodes, rootId);

        setNodes(layoutNodes);
        setEdges(getEdgesFromNodes(layoutNodes));
        setRootId(rootId);
        nextIdRef.current = nextId;
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const buildBalancedBST = (input: string) => {
        const values = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        if (values.length === 0) return;

        // Sort values
        values.sort((a, b) => a - b);

        setActiveAlgorithm('buildBalanced');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let outputStr = "";

        let currentNodes: TreeNode[] = [];
        let nextId = 0;
        const getNextId = () => nextId++;

        const build = (start: number, end: number, parentId: number | null): number | null => {
            if (start > end) return null;

            const mid = Math.floor((start + end) / 2);
            const val = values[mid];
            const nodeId = getNextId();

            const newNode: TreeNode = { id: nodeId, value: val, x: 0, y: 0, parentId: parentId ?? undefined };
            currentNodes.push(newNode);
            outputStr += (outputStr ? " -> " : "") + val;

            framesBuffer.push({
                nodes: calculateLayout([...currentNodes], currentNodes.length > 0 ? currentNodes[0].id : null),
                edges: getEdgesFromNodes(currentNodes),
                highlights: [nodeId],
                codeLine: 0,
                pseudoLines: ["mid = (start + end) / 2", "node = createNode(arr[mid])", "node.left = build(start, mid-1)", "node.right = build(mid+1, end)"],
                description: `Processing range [${values[start]}...${values[end]}]. Middle is ${val}.`,
                output: outputStr
            });

            newNode.left = build(start, mid - 1, nodeId) ?? undefined;
            newNode.right = build(mid + 1, end, nodeId) ?? undefined;
            return nodeId;
        };

        const rootId = build(0, values.length - 1, null);

        const layoutNodes = calculateLayout(currentNodes, rootId);

        framesBuffer.push({
            nodes: layoutNodes,
            edges: getEdgesFromNodes(layoutNodes),
            highlights: [],
            codeLine: 3,
            pseudoLines: ["mid = (start + end) / 2", "node = createNode(arr[mid])", "node.left = build(start, mid-1)", "node.right = build(mid+1, end)"],
            description: `Built Balanced BST.`,
            output: `Balanced BST: ${outputStr}`
        });

        setNodes(layoutNodes);
        setEdges(getEdgesFromNodes(layoutNodes));
        setRootId(rootId);
        nextIdRef.current = nextId;
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const deserialize = (input: string) => {
        // Format: "1,2,x,x,3" (Preorder with nulls) or "1,2,3,x,x,4,5" (Level Order)
        // Let's assume Level Order (BFS) as it's common for visualizers.
        // 'x' or 'null' means empty.
        const parts = input.split(',').map(s => s.trim());
        if (parts.length === 0) return;

        setActiveAlgorithm('deserialize');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let outputStr = "";

        let currentNodes: TreeNode[] = [];
        let nextId = 0;
        const getNextId = () => nextId++;

        if (parts[0] === 'x' || parts[0] === 'null' || parts[0] === '') return;

        const rootVal = parseInt(parts[0]);
        const rootId = getNextId();
        const root: TreeNode = { id: rootId, value: rootVal, x: 0, y: 0 };
        currentNodes.push(root);
        outputStr += rootVal;

        const queue: TreeNode[] = [root];
        let i = 1;

        framesBuffer.push({
            nodes: calculateLayout([...currentNodes], rootId),
            edges: getEdgesFromNodes(currentNodes),
            highlights: [rootId],
            codeLine: 0, pseudoLines: ["queue.push(root)", "while i < len:", "  curr.left = parts[i++]", "  curr.right = parts[i++]"],
            description: `Created root ${rootVal}.`,
            output: outputStr
        });

        while (queue.length > 0 && i < parts.length) {
            const curr = queue.shift()!;

            // Left child
            if (i < parts.length) {
                const leftValStr = parts[i++];
                if (leftValStr !== 'x' && leftValStr !== 'null') {
                    const leftVal = parseInt(leftValStr);
                    const leftNodeId = getNextId();
                    const leftNode: TreeNode = { id: leftNodeId, value: leftVal, x: 0, y: 0, parentId: curr.id };
                    curr.left = leftNodeId;
                    currentNodes.push(leftNode);
                    queue.push(leftNode);
                    outputStr += ` -> ${leftVal}`;

                    framesBuffer.push({
                        nodes: calculateLayout([...currentNodes], rootId),
                        edges: getEdgesFromNodes(currentNodes),
                        highlights: [leftNodeId],
                        codeLine: 2, pseudoLines: ["queue.push(root)", "while i < len:", "  curr.left = parts[i++]", "  curr.right = parts[i++]"],
                        description: `Attached ${leftVal} to left of ${curr.value}.`,
                        output: outputStr
                    });
                } else {
                    outputStr += ` -> x`;
                    framesBuffer.push({
                        nodes: calculateLayout([...currentNodes], rootId),
                        edges: getEdgesFromNodes(currentNodes),
                        highlights: [],
                        codeLine: 2, pseudoLines: ["queue.push(root)", "while i < len:", "  curr.left = parts[i++]", "  curr.right = parts[i++]"],
                        description: `Left child of ${curr.value} is null.`,
                        output: outputStr
                    });
                }
            }

            // Right child
            if (i < parts.length) {
                const rightValStr = parts[i++];
                if (rightValStr !== 'x' && rightValStr !== 'null') {
                    const rightVal = parseInt(rightValStr);
                    const rightNodeId = getNextId();
                    const rightNode: TreeNode = { id: rightNodeId, value: rightVal, x: 0, y: 0, parentId: curr.id };
                    curr.right = rightNodeId;
                    currentNodes.push(rightNode);
                    queue.push(rightNode);
                    outputStr += ` -> ${rightVal}`;

                    framesBuffer.push({
                        nodes: calculateLayout([...currentNodes], rootId),
                        edges: getEdgesFromNodes(currentNodes),
                        highlights: [rightNodeId],
                        codeLine: 3, pseudoLines: ["queue.push(root)", "while i < len:", "  curr.left = parts[i++]", "  curr.right = parts[i++]"],
                        description: `Attached ${rightVal} to right of ${curr.value}.`,
                        output: outputStr
                    });
                } else {
                    outputStr += ` -> x`;
                    framesBuffer.push({
                        nodes: calculateLayout([...currentNodes], rootId),
                        edges: getEdgesFromNodes(currentNodes),
                        highlights: [],
                        codeLine: 3, pseudoLines: ["queue.push(root)", "while i < len:", "  curr.left = parts[i++]", "  curr.right = parts[i++]"],
                        description: `Right child of ${curr.value} is null.`,
                        output: outputStr
                    });
                }
            }
        }

        const layoutNodes = calculateLayout(currentNodes, rootId);
        setNodes(layoutNodes);
        setEdges(getEdgesFromNodes(layoutNodes));
        setRootId(rootId);
        nextIdRef.current = nextId;
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    // --- BALANCING (AVL) ---
    const getHeight = (nodeId: number | undefined): number => {
        if (nodeId === undefined) return 0;
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return 0;
        return 1 + Math.max(getHeight(node.left), getHeight(node.right));
    };

    const getBalanceFactor = (nodeId: number | undefined): number => {
        if (nodeId === undefined) return 0;
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return 0;
        return getHeight(node.left) - getHeight(node.right);
    };

    const showBalanceFactors = () => {
        setActiveAlgorithm('balanceFactors');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let outputStr = "";

        const bfMap = new Map<number, number>();
        nodes.forEach(n => {
            const bf = getBalanceFactor(n.id);
            bfMap.set(n.id, bf);
            outputStr += (outputStr ? ", " : "") + `${n.value}: ${bf}`;
        });

        const descriptions = nodes.map(n => `Node ${n.value}: BF=${bfMap.get(n.id)}`).join('\n');

        framesBuffer.push({
            nodes: [...nodes], edges: [...edges], highlights: nodes.map(n => n.id), codeLine: 0, pseudoLines: ["Calculate Height(L)", "Calculate Height(R)", "BF = H(L) - H(R)"],
            description: `Balance Factors calculated:\n${descriptions}`,
            output: `BFs: ${outputStr}`
        });

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const rotateLeft = (val: number) => {
        setActiveAlgorithm('rotateLeft');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];

        let currentNodes = JSON.parse(JSON.stringify(nodes));
        let edgesList = getEdgesFromNodes(currentNodes);

        const nodeIndex = currentNodes.findIndex((n: any) => n.value === val);
        if (nodeIndex === -1) return;

        const node = currentNodes[nodeIndex];
        const rightChildId = node.right;
        if (rightChildId === undefined) {
            framesBuffer.push({ nodes: [...currentNodes], edges: [...edgesList], highlights: [node.id], codeLine: 0, pseudoLines: [], description: `Cannot rotate left: Node ${val} has no right child.`, output: `Cannot rotate left: ${val} has no right child.` });
            setFrames(framesBuffer); setIsPlaying(true); return;
        }

        const rightChild = currentNodes.find((n: any) => n.id === rightChildId)!;

        framesBuffer.push({ nodes: calculateLayout([...currentNodes], rootId), edges: getEdgesFromNodes(currentNodes), highlights: [node.id, rightChild.id], codeLine: 0, pseudoLines: ["newRoot = node.right", "node.right = newRoot.left", "newRoot.left = node"], description: `Rotating Left around ${val}. New root will be ${rightChild.value}.`, output: `Rotating Left around ${val}` });

        const parentId = node.parentId;
        const isLeftChild = parentId !== undefined ? currentNodes.find((n: any) => n.id === parentId)?.left === node.id : false;

        node.right = rightChild.left;
        if (node.right !== undefined) {
            const rightGrandChild = currentNodes.find((n: any) => n.id === node.right)!;
            rightGrandChild.parentId = node.id;
        }

        rightChild.left = node.id;
        node.parentId = rightChild.id;

        rightChild.parentId = parentId;
        let newRootId = rootId;
        if (parentId !== undefined) {
            const parent = currentNodes.find((n: any) => n.id === parentId)!;
            if (isLeftChild) parent.left = rightChild.id;
            else parent.right = rightChild.id;
        } else {
            newRootId = rightChild.id;
            setRootId(newRootId);
        }

        framesBuffer.push({ nodes: calculateLayout([...currentNodes], newRootId), edges: getEdgesFromNodes(currentNodes), highlights: [node.id, rightChild.id], codeLine: 1, pseudoLines: ["newRoot = node.right"], description: `Rotated.`, output: `Rotated. New root: ${rightChild.value}` });

        setNodes(currentNodes);
        setEdges(getEdgesFromNodes(currentNodes));
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const rotateRight = (val: number) => {
        setActiveAlgorithm('rotateRight');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];

        let currentNodes = JSON.parse(JSON.stringify(nodes));
        let edgesList = getEdgesFromNodes(currentNodes);

        const nodeIndex = currentNodes.findIndex((n: any) => n.value === val);
        if (nodeIndex === -1) return;

        const node = currentNodes[nodeIndex];
        const leftChildId = node.left;
        if (leftChildId === undefined) {
            framesBuffer.push({ nodes: [...currentNodes], edges: [...edgesList], highlights: [node.id], codeLine: 0, pseudoLines: [], description: `Cannot rotate right: Node ${val} has no left child.`, output: `Cannot rotate right: ${val} has no left child.` });
            setFrames(framesBuffer); setIsPlaying(true); return;
        }

        const leftChild = currentNodes.find((n: any) => n.id === leftChildId)!;

        framesBuffer.push({ nodes: calculateLayout([...currentNodes], rootId), edges: getEdgesFromNodes(currentNodes), highlights: [node.id, leftChild.id], codeLine: 0, pseudoLines: ["newRoot = node.left", "node.left = newRoot.right", "newRoot.right = node"], description: `Rotating Right around ${val}. New root will be ${leftChild.value}.`, output: `Rotating Right around ${val}` });

        const parentId = node.parentId;
        const isLeftChild = parentId !== undefined ? currentNodes.find((n: any) => n.id === parentId)?.left === node.id : false;

        node.left = leftChild.right;
        if (node.left !== undefined) {
            const leftGrandChild = currentNodes.find((n: any) => n.id === node.left)!;
            leftGrandChild.parentId = node.id;
        }

        leftChild.right = node.id;
        node.parentId = leftChild.id;

        leftChild.parentId = parentId;
        let newRootId = rootId;
        if (parentId !== undefined) {
            const parent = currentNodes.find((n: any) => n.id === parentId)!;
            if (isLeftChild) parent.left = leftChild.id;
            else parent.right = leftChild.id;
        } else {
            newRootId = leftChild.id;
            setRootId(newRootId);
        }

        framesBuffer.push({ nodes: calculateLayout([...currentNodes], newRootId), edges: getEdgesFromNodes(currentNodes), highlights: [node.id, leftChild.id], codeLine: 1, pseudoLines: ["newRoot = node.left"], description: `Rotated.`, output: `Rotated. New root: ${leftChild.value}` });

        setNodes(currentNodes);
        setEdges(getEdgesFromNodes(currentNodes));
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const insertAVL = (val: number) => {
        setActiveAlgorithm('insertAVL');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let outputStr = "";

        let nextId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
        let currentNodes = JSON.parse(JSON.stringify(nodes));
        let root = currentNodes.find((n: any) => n.id === rootId);
        let localRootId = rootId;

        if (!root) {
            const newNode = { id: nextId, value: val, x: 0, y: 0 };
            currentNodes = [newNode];
            setNodes(currentNodes); setEdges([]); setRootId(nextId);
            framesBuffer.push({
                nodes: calculateLayout([...currentNodes], nextId), edges: getEdgesFromNodes(currentNodes), highlights: [nextId], codeLine: 0, pseudoLines: ["Insert(val)"], description: `Inserted ${val}. Tree is now balanced.`, output: `${val}`
            });
            setFrames(framesBuffer);
            setIsPlaying(true);
            return;
        }

        let curr = root;
        const pathStack: number[] = [];

        while (true) {
            pathStack.push(curr.id);
            outputStr += (outputStr ? " -> " : "") + curr.value;
            if (val < curr.value) {
                if (curr.left === undefined) {
                    const newNodeId = nextId++;
                    curr.left = newNodeId;
                    currentNodes.push({ id: newNodeId, value: val, x: 0, y: 0, parentId: curr.id });
                    pathStack.push(newNodeId);
                    outputStr += ` -> ${val}`;
                    break;
                }
                curr = currentNodes.find((n: any) => n.id === curr.left)!;
            } else {
                if (curr.right === undefined) {
                    const newNodeId = nextId++;
                    curr.right = newNodeId;
                    currentNodes.push({ id: newNodeId, value: val, x: 0, y: 0, parentId: curr.id });
                    pathStack.push(newNodeId);
                    outputStr += ` -> ${val}`;
                    break;
                }
                curr = currentNodes.find((n: any) => n.id === curr.right)!;
            }
        }

        let layoutNodes = calculateLayout([...currentNodes], localRootId);
        framesBuffer.push({
            nodes: layoutNodes, edges: getEdgesFromNodes(layoutNodes), highlights: [currentNodes[currentNodes.length - 1].id], codeLine: 0, pseudoLines: ["Insert(val)"], description: `Inserted ${val}. Checking Balance...`, output: outputStr
        });

        while (pathStack.length > 0) {
            const nodeId = pathStack.pop()!;
            const getHeightLocal = (nid: number | undefined): number => {
                if (nid === undefined) return 0;
                const n = currentNodes.find((no: any) => no.id === nid);
                if (!n) return 0;
                return 1 + Math.max(getHeightLocal(n.left), getHeightLocal(n.right));
            };
            const getBFLocal = (nid: number) => {
                const n = currentNodes.find((no: any) => no.id === nid)!;
                return getHeightLocal(n.left) - getHeightLocal(n.right);
            };

            const bf = getBFLocal(nodeId);
            const nodeVal = currentNodes.find((n: any) => n.id === nodeId).value;
            framesBuffer.push({
                nodes: layoutNodes, edges: getEdgesFromNodes(layoutNodes), highlights: [nodeId], codeLine: 1, pseudoLines: ["BF = H(L) - H(R)"], description: `Node ${nodeVal} BF: ${bf}`, output: `BF(${nodeVal}): ${bf}`
            });

            if (bf > 1 || bf < -1) {
                framesBuffer.push({
                    nodes: layoutNodes, edges: getEdgesFromNodes(layoutNodes), highlights: [nodeId], evaluated: [nodeId], codeLine: 2, pseudoLines: ["if |BF| > 1: Rotate"], description: `Imbalance detected at ${nodeVal}!`, output: `Imbalance at ${nodeVal}`
                });
                framesBuffer.push({
                    nodes: layoutNodes, edges: getEdgesFromNodes(layoutNodes), highlights: [nodeId], codeLine: 3, pseudoLines: [], description: `(Auto-rotation not fully implemented in this demo)`, output: `Rotation needed at ${nodeVal}`
                });
                break;
            }
        }

        setNodes(currentNodes);
        setEdges(getEdgesFromNodes(currentNodes));
        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const deleteAVL = (val: number) => { console.log("deleteAVL", val); };

    // --- SPECIAL ---
    const findLCA = (v1: number, v2: number) => {
        setActiveAlgorithm('lca');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        let foundLCA: number | null = null;
        const path1: number[] = [];
        const path2: number[] = [];

        // Helper to find path from root to node
        const findPath = (nodeId: number | undefined, targetVal: number, path: number[], outputRef: { str: string }): boolean => {
            if (nodeId === undefined) return false;
            const node = nodes.find(n => n.id === nodeId)!;
            path.push(node.id);
            outputRef.str += (outputRef.str ? " -> " : "") + node.value;
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [...path], evaluated: [node.id], codeLine: 0, pseudoLines: ["function findPath(root, target):", "  if root == null return false", "  path.add(root)", "  if root.val == target return true", "  if findPath(left) or findPath(right) return true", "  path.pop(); return false"],
                description: `Visiting ${node.value} while searching for ${targetVal}.`,
                output: `Path to ${targetVal}: ${outputRef.str}`
            });

            if (node.value === targetVal) return true;

            if (findPath(node.left, targetVal, path, outputRef) || findPath(node.right, targetVal, path, outputRef)) return true;

            path.pop();
            outputRef.str = outputRef.str.substring(0, outputRef.str.lastIndexOf(" -> ")); // Remove last element
            return false;
        };

        const root = nodes.find(n => n.id === rootId);
        if (!root) return;

        framesBuffer.push({
            nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: [],
            description: `Searching for LCA of ${v1} and ${v2}.`,
            output: `Searching LCA for ${v1}, ${v2}`
        });

        const path1Ref = { str: "" };
        const path2Ref = { str: "" };

        if (findPath(root.id, v1, path1, path1Ref) && findPath(root.id, v2, path2, path2Ref)) {
            // Find last common element
            let i = 0;
            while (i < path1.length && i < path2.length && path1[i] === path2[i]) {
                foundLCA = path1[i];
                i++;
            }

            if (foundLCA !== null) {
                const lcaNode = nodes.find(n => n.id === foundLCA)!;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [lcaNode.id], evaluated: [lcaNode.id], codeLine: 1, pseudoLines: [],
                    description: `LCA is ${lcaNode.value}.`,
                    output: `LCA(${v1}, ${v2}): ${lcaNode.value}`
                });
            }
        } else {
            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 2, pseudoLines: [],
                description: `One or both nodes not found.`,
                output: `One or both nodes not found.`
            });
        }

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const getLeftView = () => {
        setActiveAlgorithm('leftView');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        const viewNodes: number[] = [];
        let outputStr = "";

        if (nodes.length === 0) return;

        const queue: { id: number, level: number }[] = [{ id: rootId!, level: 0 }];
        let maxLevel = -1;

        framesBuffer.push({ nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["maxLevel = -1", "queue = [(root, 0)]"], description: "Starting Left View Traversal.", output: "Left View:" });

        while (queue.length > 0) {
            const { id, level } = queue.shift()!;
            const node = nodes.find(n => n.id === id)!;

            if (level > maxLevel) {
                maxLevel = level;
                viewNodes.push(id);
                outputStr += (outputStr ? " -> " : "") + node.value;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [...viewNodes], evaluated: [id], codeLine: 1, pseudoLines: ["if level > maxLevel:", "  print node", "  maxLevel = level"],
                    description: `First node at level ${level}: ${node.value}. Added to view.`,
                    output: `Left View: ${outputStr}`
                });
            }

            // Standard BFS but check visible
            if (node.left !== undefined) queue.push({ id: node.left, level: level + 1 });
            if (node.right !== undefined) queue.push({ id: node.right, level: level + 1 });
        }

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const getRightView = () => {
        setActiveAlgorithm('rightView');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        const viewNodes: number[] = [];
        let outputStr = "";

        if (nodes.length === 0) return;


        let maxLevel = -1; // Or check if level processed?
        // Actually BFS processes level by level. Last node at level is right view.
        // Better: DFS Root -> Right -> Left. First node at each level is Right View.

        const rightViewDFS = (nodeId: number | undefined, level: number) => {
            if (nodeId === undefined) return;
            const node = nodes.find(n => n.id === nodeId)!;

            if (level > maxLevel) {
                maxLevel = level;
                viewNodes.push(nodeId);
                outputStr += (outputStr ? " -> " : "") + node.value;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [...viewNodes], evaluated: [nodeId], codeLine: 1, pseudoLines: ["if level > maxLevel:", "  print node", "  maxLevel = level", "recurse(right)", "recurse(left)"],
                    description: `First node (from right) at level ${level}: ${node.value}. Added to view.`,
                    output: `Right View: ${outputStr}`
                });
            }

            rightViewDFS(node.right, level + 1);
            rightViewDFS(node.left, level + 1);
        };

        framesBuffer.push({ nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["maxLevel = -1", "dfs(root, 0)"], description: "Starting Right View Traversal (DFS Right-first).", output: "Right View:" });
        rightViewDFS(rootId!, 0);

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const getTopView = () => {
        setActiveAlgorithm('topView');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        const topViewMap = new Map<number, number>(); // HD -> NodeId
        let outputStr = "";

        if (nodes.length === 0) return;

        const queue: { id: number, hd: number }[] = [{ id: rootId!, hd: 0 }];

        framesBuffer.push({ nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["queue = [(root, 0)]", "map = {}"], description: "Starting Top View Traversal.", output: "Top View:" });

        while (queue.length > 0) {
            const { id, hd } = queue.shift()!;
            const node = nodes.find(n => n.id === id)!;

            if (!topViewMap.has(hd)) {
                topViewMap.set(hd, id);
                const sortedValues = Array.from(topViewMap.entries()).sort((a, b) => a[0] - b[0]).map(entry => nodes.find(n => n.id === entry[1])!.value);
                outputStr = sortedValues.join(' -> ');

                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: Array.from(topViewMap.values()), evaluated: [id], codeLine: 1, pseudoLines: ["if hd not in map:", "  map[hd] = node", "  print node"],
                    description: `First node at HD ${hd}: ${node.value}. Added to view.`,
                    output: `Top View: ${outputStr}`
                });
            }

            if (node.left !== undefined) queue.push({ id: node.left, hd: hd - 1 });
            if (node.right !== undefined) queue.push({ id: node.right, hd: hd + 1 });
        }

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const getBottomView = () => {
        setActiveAlgorithm('bottomView');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        const bottomViewMap = new Map<number, number>(); // HD -> NodeId
        let outputStr = "";

        if (nodes.length === 0) return;

        const queue: { id: number, hd: number }[] = [{ id: rootId!, hd: 0 }];

        framesBuffer.push({ nodes: [...nodes], edges: [...edges], highlights: [], codeLine: 0, pseudoLines: ["queue = [(root, 0)]", "map = {}"], description: "Starting Bottom View Traversal.", output: "Bottom View:" });

        while (queue.length > 0) {
            const { id, hd } = queue.shift()!;
            const node = nodes.find(n => n.id === id)!;

            // Always update for bottom view
            bottomViewMap.set(hd, id);
            const sortedValues = Array.from(bottomViewMap.entries()).sort((a, b) => a[0] - b[0]).map(entry => nodes.find(n => n.id === entry[1])!.value);
            outputStr = sortedValues.join(' -> ');

            framesBuffer.push({
                nodes: [...nodes], edges: [...edges], highlights: Array.from(bottomViewMap.values()), evaluated: [id], codeLine: 1, pseudoLines: ["map[hd] = node"],
                description: `Node at HD ${hd}: ${node.value}. Updating view.`,
                output: `Bottom View: ${outputStr}`
            });

            if (node.left !== undefined) queue.push({ id: node.left, hd: hd - 1 });
            if (node.right !== undefined) queue.push({ id: node.right, hd: hd + 1 });
        }

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const boundaryTraversal = () => {
        setActiveAlgorithm('boundary');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];
        const boundaryNodes: number[] = [];
        let outputStr = "";

        if (nodes.length === 0) return;
        const root = nodes.find(n => n.id === rootId)!;

        // Add root
        if (root.left !== undefined || root.right !== undefined) {
            boundaryNodes.push(root.id);
            outputStr += root.value;
        }

        framesBuffer.push({ nodes: [...nodes], edges: [...edges], highlights: [...boundaryNodes], codeLine: 0, pseudoLines: ["add root", "addLeftBoundary", "addLeaves", "addRightBoundary"], description: "Added root.", output: `Boundary: ${outputStr}` });

        // Left Boundary
        const addLeft = (nodeId: number | undefined) => {
            let currId = nodeId;
            while (currId !== undefined) {
                const node = nodes.find(n => n.id === currId)!;
                if (node.left === undefined && node.right === undefined) break; // Leaf

                boundaryNodes.push(node.id);
                outputStr += (outputStr ? " -> " : "") + node.value;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [...boundaryNodes], evaluated: [node.id], codeLine: 1, pseudoLines: ["Left Boundary"],
                    description: `Added Left Boundary node: ${node.value}`,
                    output: `Boundary: ${outputStr}`
                });

                if (node.left !== undefined) currId = node.left;
                else currId = node.right;
            }
        };

        const addLeaves = (nodeId: number | undefined) => {
            if (nodeId === undefined) return;
            const node = nodes.find(n => n.id === nodeId)!;
            if (node.left === undefined && node.right === undefined) {
                boundaryNodes.push(node.id);
                outputStr += (outputStr ? " -> " : "") + node.value;
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [...boundaryNodes], evaluated: [node.id], codeLine: 2, pseudoLines: ["Leaves"],
                    description: `Added Leaf node: ${node.value}`,
                    output: `Boundary: ${outputStr}`
                });
                return;
            }
            addLeaves(node.left);
            addLeaves(node.right);
        };

        const addRight = (nodeId: number | undefined) => {
            let currId = nodeId;
            const stack: number[] = [];
            while (currId !== undefined) {
                const node = nodes.find(n => n.id === currId)!;
                if (node.left === undefined && node.right === undefined) break; // Leaf

                stack.push(node.id);
                if (node.right !== undefined) currId = node.right;
                else currId = node.left;
            }

            while (stack.length > 0) {
                const id = stack.pop()!;
                boundaryNodes.push(id);
                framesBuffer.push({
                    nodes: [...nodes], edges: [...edges], highlights: [...boundaryNodes], evaluated: [id], codeLine: 3, pseudoLines: ["Right Boundary (Reverse)"],
                    description: `Added Right Boundary node: ${nodes.find(n => n.id === id)!.value}`
                });
            }
        };

        addLeft(root.left);
        addLeaves(root.id); // Or start from left/right if optimizations needed
        addRight(root.right);

        setFrames(framesBuffer);
        setIsPlaying(true);
    };

    const mirrorTree = () => {
        setActiveAlgorithm('mirror');
        setFrames([]);
        setCurrentStep(0);
        const framesBuffer: Frame[] = [];

        // Clone nodes deeply to avoid mutating state directly during animation gen
        // But we need to update state at the end.
        // We will simulate swap on a local copy.
        let tempNodes = JSON.parse(JSON.stringify(nodes));

        const mirror = (nodeId: number | undefined) => {
            if (nodeId === undefined) return;

            const node = tempNodes.find((n: any) => n.id === nodeId)!;

            framesBuffer.push({
                nodes: calculateLayout([...tempNodes], rootId), edges: getEdgesFromNodes(tempNodes), highlights: [nodeId], codeLine: 0, pseudoLines: ["swap(left, right)", "mirror(left)", "mirror(right)"],
                description: `Visiting ${node.value}. Swapping children.`
            });

            // Swap
            const temp = node.left;
            node.left = node.right;
            node.right = temp;

            // Update parent refs for children?
            // The parent ref is stored on child. We must update children.
            if (node.left !== undefined) {
                const leftChild = tempNodes.find((n: any) => n.id === node.left)!;
                leftChild.parentId = node.id; // Already set but good to ensure
            }
            if (node.right !== undefined) {
                const rightChild = tempNodes.find((n: any) => n.id === node.right)!;
                rightChild.parentId = node.id;
            }

            framesBuffer.push({
                nodes: calculateLayout([...tempNodes], rootId), edges: getEdgesFromNodes(tempNodes), highlights: [nodeId], codeLine: 1, pseudoLines: ["swap(left, right)", "mirror(left)", "mirror(right)"],
                description: `Swapped children of ${node.value}.`
            });

            mirror(node.left);
            mirror(node.right);
        }

        if (rootId !== null) mirror(rootId);

        // Final state
        const layoutNodes = calculateLayout(tempNodes, rootId);
        setNodes(layoutNodes);
        setEdges(getEdgesFromNodes(layoutNodes));

        setFrames(framesBuffer);
        setIsPlaying(true);
    };


    return {
        nodes,
        edges,
        insert,
        deleteNode,
        search,
        traverse,
        reset,
        clear,
        handleExample,
        // New Ops
        generateRandomTree,
        traverseZigZag,
        findMin, findMax, findSuccessor, findPredecessor, validateBST,
        checkHeight,
        countNodes,
        countLeafNodes,
        checkDiameter,
        checkBalanced,
        isFull,
        isComplete,

        // Construction
        buildFromArray,
        buildFromPreIn,
        buildFromPostIn,
        buildBalancedBST,
        deserialize,

        // Balancing
        insertAVL,
        deleteAVL,
        rotateLeft,
        rotateRight,
        showBalanceFactors,

        // Special
        findLCA,
        getLeftView,
        getRightView,
        getTopView,
        getBottomView,
        boundaryTraversal,
        mirrorTree,

        // Interactive Tools
        activeTool, setActiveTool,
        selectedNode, setSelectedNode,
        addNode,
        addEdge,
        removeNode: removeNodeById,
        removeEdge,
        moveNode,

        // playback props
        frames,
        currentStep,
        setCurrentStep,
        isPlaying,
        setIsPlaying,
        playbackSpeed,
        setPlaybackSpeed,
        activeAlgorithm,
        getCurrentFrame: () => {
            if (frames.length > 0 && currentStep < frames.length) return frames[currentStep];
            return {
                nodes,
                edges,
                highlights: [],
                evaluated: [],
                codeLine: -1,
                pseudoLines: [],
                description: 'Ready'
            };
        }
    };
};
