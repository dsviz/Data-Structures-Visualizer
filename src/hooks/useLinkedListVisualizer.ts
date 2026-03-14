import { useState, useRef, useEffect } from 'react';
import { generateNarrationBatch } from '../services/aiService';

// --- Types ---
export type Operation = 'create' | 'insert' | 'remove' | 'search' | null;
export type ListType = 'singly' | 'doubly' | 'circular';

export interface ListNode {
    id: string;
    val: number;
}

export interface Pointer {
    id: string | null; // Node ID the pointer is pointing to
    label: string;
    color: string;
}

export interface TempNode {
    id: string | number;
    val: number;
    label: string;
    color?: string;
    // Position logic:
    // 'left-of-head': -1 index position
    // 'right-of-tail': length index position
    // 'above-at-index': at index, but Y offset -80px
    position: 'left-of-head' | 'right-of-tail' | 'above-at-index';
    offsetId?: string; // Target node ID for relative positioning
}

export interface TempArrow {
    from: 'temp' | string; // 'temp' or node ID
    to: 'temp' | string | 'null'; // target ID, temp node, or null
    label?: string;
    curved?: boolean;
    color?: string;
}

export interface Frame {
    nodes: ListNode[];
    highlights: string[]; // Node IDs
    pointers: Pointer[];
    codeLine: number;
    description: string;
    listType: ListType;
    pseudoLines: string[]; // Store relevant pseudocode lines for this op
    opName: string;
    opValues?: { [key: string]: string | number }; // For dynamic code replacement
    tempNodes?: TempNode[];
    tempArrows?: TempArrow[];
    visited?: number[]; // Values or IDs? Usually values for output
    output?: string;
    narration?: string;
}

// --- Constants ---
export const MAX_NODES = 20;
export const DEFAULT_NODES: ListNode[] = [
    { id: '1', val: 12 }, { id: '2', val: 45 }, { id: '3', val: 99 },
    { id: '4', val: 33 }, { id: '5', val: 42 }, { id: '6', val: 57 }
];
export const PSEUDOCODE = {
    create: [
        "head = null, tail = null",
        "for (val in values):",
        "  v = new Node(val)",
        "  if (head == null) head = v",
        "  else tail.next = v",
        "  tail = v"
    ],
    insertHead: [
        "v = new Node(val)",
        "v.next = head",
        "head = v"
    ],
    insertTail: [
        "v = new Node(val)",
        "if (tail != null) tail.next = v",
        "tail = v",
        "if (head == null) head = v"
    ],
    insertIndex: [
        "v = new Node(val)",
        "curr = head",
        "for (i=0; i<index-1; i++) curr = curr.next",
        "v.next = curr.next",
        "curr.next = v"
    ],
    removeHead: [
        "if (head == null) return",
        "head = head.next",
        "if (head == null) tail = null"
    ],
    removeTail: [
        "curr = head",
        "while (curr.next != tail) curr = curr.next",
        "curr.next = null",
        "tail = curr"
    ],
    removeIndex: [
        "curr = head",
        "for (i=0; i<index-1; i++) curr = curr.next",
        "curr.next = curr.next.next"
    ],
    search: [
        "curr = head",
        "while (curr != null)",
        "  if (curr.val == target) return true",
        "  curr = curr.next",
        "return false"
    ],
    countOccurrences: [
        "count = 0",
        "curr = head",
        "while (curr != null)",
        "  if (curr.val == target) count++",
        "  curr = curr.next",
        "return count"
    ],
    reverseList: [
        "prev = null, curr = head",
        "while (curr != null)",
        "  nextTemp = curr.next",
        "  curr.next = prev",
        "  prev = curr",
        "  curr = nextTemp",
        "head = prev"
    ],
    detectCycle: [
        "slow = head, fast = head",
        "while (fast != null && fast.next != null)",
        "  slow = slow.next",
        "  fast = fast.next.next",
        "  if (slow == fast) return true",
        "return false"
    ],
    sortedInsert: [
        "if (head == null || head.val >= val)",
        "  v.next = head; head = v",
        "else:",
        "  curr = head",
        "  while (curr.next != null && curr.next.val < val)",
        "    curr = curr.next",
        "  v.next = curr.next; curr.next = v"
    ],
    findMiddle: [
        "slow = head, fast = head",
        "while (fast != null && fast.next != null)",
        "  slow = slow.next",
        "  fast = fast.next.next",
        "return slow"
    ],
    deleteByValue: [
        "if (head.val == target) head = head.next",
        "else:",
        "  curr = head",
        "  while (curr.next != null && curr.next.val != target)",
        "    curr = curr.next",
        "  if (curr.next != null) curr.next = curr.next.next"
    ],
    findNthNode: [
        "curr = head",
        "for (i=0; i<N; i++) curr = curr.next",
        "return curr"
    ],
    findNthFromEnd: [
        "main = head, ref = head",
        "for (i=0; i<N; i++) ref = ref.next",
        "while (ref != null)",
        "  main = main.next, ref = ref.next",
        "return main"
    ],
    insertAfterValue: [
        "curr = head",
        "while (curr != null && curr.val != target) curr = curr.next",
        "if (curr != null)",
        "  v.next = curr.next; curr.next = v"
    ],
    insertBeforeValue: [
        "if (head.val == target) // insert at head",
        "else:",
        "  curr = head",
        "  while (curr.next != null && curr.next.val != target)",
        "    curr = curr.next",
        "  if (curr.next != null) v.next = curr.next; curr.next = v"
    ],
    deleteAllOccurrences: [
        "while (head != null && head.val == target)",
        "  head = head.next",
        "curr = head",
        "while (curr != null && curr.next != null)",
        "  if (curr.next.val == target)",
        "    curr.next = curr.next.next",
        "  else curr = curr.next"
    ],
    rotateList: [
        "if (head == null || k == 0) return head",
        "len = 1; tail = head",
        "while (tail.next != null) tail = tail.next, len++",
        "k = k % len",
        "if (k == 0) return head",
        "newTail = head",
        "for (i = 0; i < len - k - 1; i++) newTail = newTail.next",
        "newHead = newTail.next",
        "newTail.next = null",
        "tail.next = head; head = newHead"
    ],
    oddEvenRearrange: [
        "if (head == null || head.next == null) return head",
        "odd = head; even = head.next; evenHead = even",
        "while (even != null && even.next != null)",
        "  odd.next = even.next; odd = odd.next",
        "  even.next = odd.next; even = even.next",
        "odd.next = evenHead",
        "return head"
    ],
    swapNodesPairwise: [
        "dummy = new Node(0); dummy.next = head",
        "prev = dummy; curr = head",
        "while (curr != null && curr.next != null)",
        "  nextPair = curr.next.next",
        "  second = curr.next",
        "  second.next = curr; curr.next = nextPair",
        "  prev.next = second",
        "  prev = curr; curr = nextPair",
        "return dummy.next"
    ],
    reverseInKGroups: [
        "curr = head, count = 0",
        "while (curr != null && count < k)",
        "  curr = curr.next; count++",
        "if (count == k)",
        "  curr = reverseK(head, k)",
        "  head.next = reverseInK(curr, k)",
        "  return curr"
    ],
    recursiveTraversal: [
        "function traverse(node):",
        "  if (node == null) return",
        "  visit(node)",
        "  traverse(node.next)"
    ],
    reverseTraversal: [
        "function reversePrint(node):",
        "  if (node == null) return",
        "  reversePrint(node.next)",
        "  print(node.val)"
    ],
    checkPalindrome: [
        "slow = head; fast = head",
        "while (fast != null && fast.next != null)",
        "  slow = slow.next; fast = fast.next.next",
        "// Reverse second half",
        "prev = null; curr = slow",
        "while (curr != null)",
        "  next = curr.next; curr.next = prev",
        "  prev = curr; curr = next",
        "// Compare both halves",
        "left = head; right = prev",
        "while (right != null)",
        "  if (left.val != right.val) return false",
        "  left = left.next; right = right.next",
        "return true"
    ],
    mergeTwoLists: [
        "l1 = head; l2 = secondHead",
        "dummy = new Node(0); curr = dummy",
        "while (l1 != null && l2 != null)",
        "  if (l1.val <= l2.val)",
        "    curr.next = l1; l1 = l1.next",
        "  else",
        "    curr.next = l2; l2 = l2.next",
        "  curr = curr.next",
        "if (l1 != null) curr.next = l1",
        "if (l2 != null) curr.next = l2",
        "return dummy.next"
    ],
    removeCycle: [
        "// Step 1: Detect cycle with Floyd's algorithm",
        "slow = head; fast = head",
        "while (fast != null && fast.next != null)",
        "  slow = slow.next; fast = fast.next.next",
        "  if (slow == fast) break",
        "// Step 2: Find cycle entry",
        "slow = head",
        "while (slow != fast) slow = slow.next; fast = fast.next",
        "// Step 3: Find last node of cycle & remove",
        "while (fast.next != slow) fast = fast.next",
        "fast.next = null"
    ]
};



export const useLinkedListVisualizer = () => {
    // --- State ---
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isNarrationEnabled, setIsNarrationEnabled] = useState(false);
    const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
    const [initialNodes, setInitialNodes] = useState<ListNode[]>(DEFAULT_NODES);
    const [listType, setListType] = useState<ListType>('singly');

    // UI State
    const [mode, setMode] = useState<'standard' | 'apps'>('standard');
    const [activeOp, setActiveOp] = useState<Operation>(null);
    const [error, setError] = useState<string | null>(null);
    const [createInput, setCreateInput] = useState<string>('');
    const [createStep, setCreateStep] = useState(0);
    const [createSize, setCreateSize] = useState<string>('5');
    const [inputValue, setInputValue] = useState<string>('');
    const [inputIndex, setInputIndex] = useState<string>('');

    // Refs
    const timerRef = useRef<number | null>(null);

    // --- Generator Helpers ---
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const createFrame = (
        nodes: ListNode[],
        highlights: string[],
        pointers: Pointer[],
        line: number,
        desc: string,
        pLines: string[],
        opName: string,
        opValues: { [key: string]: string | number } = {},
        tempNodes: TempNode[] = [],
        tempArrows: TempArrow[] = [],
        visited: number[] = [],
        output: string = ""
    ): Frame => ({
        nodes: [...nodes],
        highlights,
        pointers,
        codeLine: line,
        description: desc,
        listType,
        pseudoLines: pLines,
        opName,
        opValues,
        tempNodes,
        tempArrows,
        visited,
        output
    });

    // --- Generator Implementations ---

    const generateCreateFrames = (vals: number[]) => {
        const opName = 'create';
        const pLines = PSEUDOCODE.create;
        const frames: Frame[] = [];
        const nodes: ListNode[] = [];

        frames.push(createFrame([], [], [], 0, "Initializing empty list", pLines, opName, {}, [], [], [], "Nodes: []"));

        for (let i = 0; i < vals.length; i++) {
            const newNode: ListNode = { id: generateId(), val: vals[i] };
            nodes.push(newNode);
            const pointers: Pointer[] = [{ id: nodes[0].id, label: 'head', color: 'primary' }];
            if (nodes.length > 1) {
                pointers.push({ id: nodes[nodes.length - 1].id, label: 'tail', color: 'secondary' });
            }
            frames.push(createFrame(nodes, [newNode.id], pointers, 4, `Created node with value ${vals[i]}`, pLines, opName, {}, [], [], [], `Nodes: [${nodes.map(n => n.val).join(', ')}]`));
        }

        return { endNodes: nodes, timeline: frames };
    };

    const dispatchAnimation = async (res: { endNodes: ListNode[], timeline: Frame[] }) => {
        setActiveOp(null);
        setFrames(res.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
        setInitialNodes(res.endNodes);

        if (isNarrationEnabled) {
            setIsGeneratingNarration(true);
            try {
                const descriptions = res.timeline.map(f => {
                    // Enrich description for AI
                    let enriched = f.description;
                    if (f.opValues) {
                        Object.entries(f.opValues).forEach(([key, val]) => {
                            enriched = enriched.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val));
                        });
                    }
                    return enriched;
                });

                const narrations = await generateNarrationBatch(descriptions, 'Linked List');

                const narratedFrames = res.timeline.map((frame, i) => ({
                    ...frame,
                    narration: narrations[i]?.narrated || frame.description
                }));

                setFrames(narratedFrames);
                setIsGeneratingNarration(false);
            } catch (err) {
                console.error("Narration error:", err);
                setIsGeneratingNarration(false);
                // Even on error, we already called setFrames(res.timeline) at the start
            }
        } else {
            // If narration is disabled, ensure frames are set (already done but for clarity)
            setFrames(res.timeline);
        }
    };

    // --- Generators with Pseudocode Mapping ---
    const generateInsertHeadFrames = (val: number) => {
        const opName = 'insertHead';
        const pLines = PSEUDOCODE.insertHead;
        const opValues = { val };
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        const headNode = currentNodes[0];

        frames.push(createFrame(currentNodes, [], [], 0, `Create node ${val}`, pLines, opName, opValues,
            [{ val, label: 'NEW', color: 'blue', position: 'left-of-head', id: 'new' }], [], [], "NEW node created"));

        frames.push(createFrame(currentNodes, headNode ? [headNode.id] : [], headNode ? [{ id: headNode.id, label: 'HEAD', color: 'red' }] : [], 1, "Link v.next to Head", pLines, opName, opValues,
            [{ val, label: 'NEW', color: 'blue', position: 'left-of-head', id: 'new' }],
            headNode ? [{ from: 'new', to: headNode.id, color: 'blue', label: 'next' }] : [{ from: 'new', to: 'null', color: 'blue' }],
            [], "Linking new node..."));

        const newNodeId = generateId();
        const newNode = { id: newNodeId, val };
        const newNodes = [newNode, ...currentNodes];
        frames.push(createFrame(newNodes, [newNodeId], [{ id: newNodeId, label: 'HEAD', color: 'red' }], 2, "Update Head = v", pLines, opName, opValues, [], [], [], "Head updated"));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateInsertTailFrames = (val: number) => {
        const opName = 'insertTail';
        const pLines = PSEUDOCODE.insertTail;
        const opValues = { val };
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        const tailNode = currentNodes[currentNodes.length - 1];

        frames.push(createFrame(currentNodes, [], [], 0, `Create node with value ${val}`, pLines, opName, opValues,
            [{ val, label: 'NEW', color: 'green', position: 'right-of-tail', id: 'new' }], [], [], "NEW node created"));

        if (tailNode) {
            frames.push(createFrame(currentNodes, [tailNode.id], [{ id: tailNode.id, label: 'TAIL', color: 'green' }], 1, `Point tail node ${tailNode.val} to new node ${val}`, pLines, opName, opValues,
                [{ val, label: 'NEW', color: 'green', position: 'right-of-tail', id: 'new' }],
                [{ from: tailNode.id, to: 'new', color: 'green' }], [], "Linking to tail..."));
        }

        const newNodeId = generateId();
        const newNode = { id: newNodeId, val };
        const newNodes = [...currentNodes, newNode];
        frames.push(createFrame(newNodes, [newNodeId], [{ id: newNodeId, label: 'TAIL', color: 'green' }], 2, `Update tail to node ${val}`, pLines, opName, opValues, [], [], [], "Tail updated"));
        return { endNodes: newNodes, timeline: frames };
    };

    const generateInsertIndexFrames = (idx: number, val: number) => {
        const opName = 'insertIndex';
        const pLines = PSEUDOCODE.insertIndex;
        const opValues = { val, index: idx };
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        if (idx === 0) return generateInsertHeadFrames(val);
        if (idx >= currentNodes.length) return generateInsertTailFrames(val);

        const targetNodeId = currentNodes[idx].id;

        // 0: Create node v
        frames.push(createFrame(currentNodes, [], [], 0, `Create node with value ${val}`, pLines, opName, opValues,
            [{ id: 'new', val, label: 'v', position: 'above-at-index', offsetId: targetNodeId }], [], [], "NEW node created"));

        // 1: curr = head
        frames.push(createFrame(currentNodes, [currentNodes[0].id], [{ id: currentNodes[0].id, label: 'curr', color: 'primary' }], 1, `Initialize curr at head node ${currentNodes[0].val}`, pLines, opName, opValues,
            [{ id: 'new', val, label: 'v', position: 'above-at-index', offsetId: targetNodeId }], [], [], `Index: 0`));

        // 2: Traverse
        for (let i = 0; i < idx - 1; i++) {
            const nodeId = currentNodes[i].id;
            const nodeVal = currentNodes[i].val;
            const nextNodeId = currentNodes[i + 1].id;
            const nextVal = currentNodes[i + 1].val;
            frames.push(createFrame(currentNodes, [nodeId], [{ id: nodeId, label: 'curr', color: 'primary' }], 2, `Wait at node ${nodeVal}, index ${i}`, pLines, opName, opValues,
                [{ id: 'new', val, label: 'v', position: 'above-at-index', offsetId: targetNodeId }], [], [], `Index: ${i}`));
            frames.push(createFrame(currentNodes, [nextNodeId], [{ id: nextNodeId, label: 'curr', color: 'primary' }], 3, `Move from ${nodeVal} to ${nextVal}`, pLines, opName, opValues,
                [{ id: 'new', val, label: 'v', position: 'above-at-index', offsetId: targetNodeId }], [], [], `Index: ${i + 1}`));
        }

        const prevNode = currentNodes[idx - 1];
        const targetNode = currentNodes[idx];

        // 4: Link v.next -> curr.next
        frames.push(createFrame(currentNodes, [prevNode.id], [{ id: prevNode.id, label: 'curr', color: 'primary' }], 4, `Link node ${val} to node ${targetNode.val}`, pLines, opName, opValues,
            [{ id: 'new', val, label: 'v', position: 'above-at-index', offsetId: targetNodeId }],
            [{ from: 'new', to: targetNode.id, color: 'blue', curved: true, label: 'next' }], [], "Linking vectors..."));

        // 5: curr.next -> v
        frames.push(createFrame(currentNodes, [prevNode.id], [{ id: prevNode.id, label: 'curr', color: 'primary' }], 5, `Link node ${prevNode.val} to ${val}`, pLines, opName, opValues,
            [{ id: 'new', val, label: 'v', position: 'above-at-index', offsetId: targetNodeId }],
            [
                { from: prevNode.id, to: 'new', color: 'primary', curved: true, label: 'next' },
                { from: 'new', to: targetNode.id, color: 'blue', curved: true, label: 'next' }
            ], [], "Insertion point linked"));

        const newNodeId = generateId();
        const newNode = { id: newNodeId, val };
        const newNodes = [...currentNodes];
        newNodes.splice(idx, 0, newNode);
        frames.push(createFrame(newNodes, [newNodeId], [{ id: newNodeId, label: 'NEW', color: 'blue' }], 5, `Inserted node ${val} at index ${idx}`, pLines, opName, opValues, [], [], [], "Insertion Complete"));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateRemoveHeadFrames = () => {
        const opName = 'removeHead';
        const pLines = PSEUDOCODE.removeHead;
        if (initialNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List Empty", pLines, opName)] };

        const frames: Frame[] = [];
        const headNode = initialNodes[0];
        const nextNode = initialNodes[1];
        const nextId = nextNode?.id || 'null';

        frames.push(createFrame(initialNodes, [headNode.id], [{ id: headNode.id, label: 'head', color: 'red' }], 0, `Analyzing head node with value ${headNode.val}`, pLines, opName, {}, [], [], [], "Target: head"));

        if (initialNodes.length === 1) {
            frames.push(createFrame(initialNodes, [headNode.id], [{ id: headNode.id, label: 'head', color: 'red' }], 2, `Removing head node ${headNode.val}`, pLines, opName, {}, [], [], [], "Last node removal"));
            frames.push(createFrame([], [], [], 3, "List is now empty", pLines, opName, {}, [], [], [], "List Empty"));
            return { endNodes: [], timeline: frames };
        }

        frames.push(createFrame(initialNodes, [headNode.id], [{ id: headNode.id, label: 'head', color: 'red' }], 2, `Redirecting head to node ${nextNode.val}`, pLines, opName, {}, [], [{ from: 'temp_start', to: nextId, color: 'red', curved: true, label: 'next' }], [], "Head redirecting..."));

        const newNodes = initialNodes.slice(1);
        frames.push(createFrame(newNodes, [nextId], [{ id: nextId, label: 'head', color: 'red' }], 2, `Node ${nextNode.val} is now head`, pLines, opName, {}, [], [], [], "Removal Successful"));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateRemoveTailFrames = () => {
        const opName = 'removeTail';
        const pLines = PSEUDOCODE.removeTail;
        if (initialNodes.length === 0) return { endNodes: [], timeline: [] };
        if (initialNodes.length === 1) return generateRemoveHeadFrames();

        const frames: Frame[] = [];
        const tailNode = initialNodes[initialNodes.length - 1];
        const penultimateNode = initialNodes[initialNodes.length - 2];

        // 0: curr = head
        frames.push(createFrame(initialNodes, [initialNodes[0].id], [{ id: initialNodes[0].id, label: 'curr', color: 'primary' }], 0, `Traversing to find node before tail ${tailNode.val}`, pLines, opName, {}, [], [], [], "Search for Tail Predecessor"));

        for (let i = 0; i < initialNodes.length - 2; i++) {
            const nodeId = initialNodes[i].id;
            const nodeVal = initialNodes[i].val;
            const nextNodeId = initialNodes[i + 1].id;
            const nextVal = initialNodes[i + 1].val;
            frames.push(createFrame(initialNodes, [nodeId], [{ id: nodeId, label: 'curr', color: 'primary' }], 1, `Currently at node ${nodeVal}`, pLines, opName, {}, [], [], [], `Index: ${i}`));
            frames.push(createFrame(initialNodes, [nextNodeId], [{ id: nextNodeId, label: 'curr', color: 'primary' }], 2, `Moving to node ${nextVal}`, pLines, opName, {}, [], [], [], `Index: ${i + 1}`));
        }

        // 3: while(curr.next != tail) loop ends at penultimate
        frames.push(createFrame(initialNodes, [penultimateNode.id], [{ id: penultimateNode.id, label: 'curr', color: 'primary' }], 2, `Found node ${penultimateNode.val} before tail`, pLines, opName, {}, [], [], [], "Tail Predecessor identified"));

        // 4: curr.next = null
        frames.push(createFrame(initialNodes, [penultimateNode.id], [{ id: penultimateNode.id, label: 'curr', color: 'primary' }], 4, `Setting node ${penultimateNode.val}.next to null`, pLines, opName, {}, [], [{ from: penultimateNode.id, to: 'null', color: 'red' }], [], "Severing tail link..."));

        const newNodes = initialNodes.slice(0, -1);
        frames.push(createFrame(newNodes, [penultimateNode.id], [{ id: penultimateNode.id, label: 'tail', color: 'secondary' }], 5, `Successfully removed node ${tailNode.val}`, pLines, opName, {}, [], [], [], "Removal Successful"));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateRemoveIndexFrames = (idx: number) => {
        const opName = 'removeIndex';
        const pLines = PSEUDOCODE.removeIndex;
        const opValues = { index: idx };

        if (idx === 0) return generateRemoveHeadFrames();
        if (idx >= initialNodes.length - 1) return generateRemoveTailFrames();

        const frames: Frame[] = [];
        const headNode = initialNodes[0];

        // 0: curr = head
        frames.push(createFrame(initialNodes, [headNode.id], [{ id: headNode.id, label: 'curr', color: 'primary' }], 0, `Initializing at head node ${headNode.val}`, pLines, opName, opValues, [], [], [], "Search for target index"));

        for (let i = 0; i < idx - 1; i++) {
            const node = initialNodes[i];
            const nextNode = initialNodes[i + 1];
            frames.push(createFrame(initialNodes, [node.id], [{ id: node.id, label: 'curr', color: 'primary' }], 1, `Passing through node ${node.val}, index ${i}`, pLines, opName, opValues, [], [], [], `Index: ${i}`));
            frames.push(createFrame(initialNodes, [nextNode.id], [{ id: nextNode.id, label: 'curr', color: 'primary' }], 2, `Advancing to node ${nextNode.val}`, pLines, opName, opValues, [], [], [], `Index: ${i + 1}`));
        }

        const prevNode = initialNodes[idx - 1];
        const targetNode = initialNodes[idx];
        const afterNode = initialNodes[idx + 1];
        const afterId = afterNode?.id || 'null';

        // 3: curr.next = curr.next.next
        frames.push(createFrame(initialNodes, [prevNode.id, targetNode.id], [{ id: prevNode.id, label: 'curr', color: 'primary' }], 3, `Redirecting node ${prevNode.val} to bypass ${targetNode.val}`, pLines, opName, opValues, [],
            [{ from: prevNode.id, to: afterId, color: 'red', curved: true, label: 'skip' }], [], "Rerouting pointers..."));

        const newNodes = initialNodes.filter((_, i) => i !== idx);
        frames.push(createFrame(newNodes, [prevNode.id], [{ id: prevNode.id, label: 'curr', color: 'primary' }], 3, `Node ${targetNode.val} removed`, pLines, opName, opValues, [], [], [], "Removal Successful"));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateSearchFrames = (target: number) => {
        const isTraversal = target === -9999;
        const opName = isTraversal ? 'iterativeTraversal' : 'search';
        const pLines = PSEUDOCODE.search;
        const opValues: Record<string, string | number> = isTraversal ? {} : { target };
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        const visited: number[] = [];
        let output = isTraversal ? "Start traversal: " : "";

        if (currentNodes.length === 0) {
            frames.push(createFrame([], [], [], 0, "List is empty", pLines, opName, opValues, [], [], [], isTraversal ? "[]" : "Not Found"));
            return { endNodes: [], timeline: frames };
        }

        const headId = currentNodes[0].id;
        frames.push(createFrame(currentNodes, [headId], [{ id: headId, label: 'CURR', color: 'primary' }], 0, "curr = head", pLines, opName, opValues, [], [], [...visited], ""));

        for (let i = 0; i < currentNodes.length; i++) {
            const nodeId = currentNodes[i].id;
            const nodeVal = currentNodes[i].val;
            visited.push(nodeVal);
            output += (i > 0 ? " -> " : "") + nodeVal;

            frames.push(createFrame(currentNodes, [nodeId], [{ id: nodeId, label: 'CURR', color: 'primary' }], 1, `Traversing node with value ${nodeVal}`, pLines, opName, opValues, [], [], [...visited], output));

            if (!isTraversal) {
                frames.push(createFrame(currentNodes, [nodeId], [{ id: nodeId, label: 'CURR', color: 'primary' }], 2, `Checking if ${nodeVal} matches target ${target}`, pLines, opName, opValues, [], [], [...visited], output));

                if (nodeVal === target) {
                    return { endNodes: currentNodes, timeline: [...frames, createFrame(currentNodes, [nodeId], [{ id: nodeId, label: 'FOUND', color: 'green' }], 1, `Match found: ${nodeVal} equals ${target}`, pLines, opName, opValues, [], [], [...visited], "Result: Found!")] };
                }
            }

            if (i < currentNodes.length - 1) {
                const nextId = currentNodes[i + 1].id;
                const nextVal = currentNodes[i + 1].val;
                frames.push(createFrame(currentNodes, [nextId], [{ id: nextId, label: 'CURR', color: 'primary' }], 3, `Moving curr pointer to next node with value ${nextVal}`, pLines, opName, opValues, [], [], [...visited], output));
            }
        }

        frames.push(createFrame(currentNodes, [], [], 1, "while curr == null", pLines, opName, opValues, [], [], [...visited], output));
        frames.push(createFrame(currentNodes, [], [], 4, isTraversal ? "Traversal Complete" : "return false", pLines, opName, opValues, [], [], [...visited], isTraversal ? "Traversal: " + output : "Result: Not Found"));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateCountOccurrences = (target: number) => {
        const opName = 'countOccurrences';
        const pLines = PSEUDOCODE.countOccurrences;
        const opValues = { target };
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        let count = 0;

        if (currentNodes.length === 0) {
            frames.push(createFrame([], [], [], 0, "List is empty", pLines, opName, opValues, [], [], [], "0"));
            return { endNodes: [], timeline: frames };
        }

        const headId = currentNodes[0].id;
        frames.push(createFrame(currentNodes, [headId], [{ id: headId, label: 'CURR', color: 'primary' }], 1, `Initializing traversal at node ${currentNodes[0].val}`, pLines, opName, opValues, [], [], [], `Count: ${count}`));

        for (let i = 0; i < currentNodes.length; i++) {
            const nodeId = currentNodes[i].id;
            const nodeVal = currentNodes[i].val;
            frames.push(createFrame(currentNodes, [nodeId], [{ id: nodeId, label: 'CURR', color: 'primary' }], 2, `Inspecting node ${nodeVal}`, pLines, opName, opValues, [], [], [], `Count: ${count}`));

            if (nodeVal === target) {
                count++;
                frames.push(createFrame(currentNodes, [nodeId], [{ id: nodeId, label: 'MATCH', color: 'green' }], 3, `Match found: ${nodeVal} == ${target}`, pLines, opName, opValues, [], [], [], `Count: ${count}`));
            } else {
                frames.push(createFrame(currentNodes, [nodeId], [{ id: nodeId, label: 'CURR', color: 'primary' }], 3, `${nodeVal} does not match ${target}`, pLines, opName, opValues, [], [], [], `Count: ${count}`));
            }

            if (i < currentNodes.length - 1) {
                const nextId = currentNodes[i + 1].id;
                const nextVal = currentNodes[i + 1].val;
                frames.push(createFrame(currentNodes, [nextId], [{ id: nextId, label: 'CURR', color: 'primary' }], 4, `Advancing to node ${nextVal}`, pLines, opName, opValues, [], [], [], `Count: ${count}`));
            }
        }

        frames.push(createFrame(currentNodes, [], [], 5, `Total occurrences of ${target} found: ${count}`, pLines, opName, opValues, [], [], [], `Final Count: ${count}`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateConvertToArray = () => {
        const opName = 'convertToArray';
        const pLines = ["arr = []", "curr = head", "while curr != null", "  arr.push(curr.val)", "  curr = curr.next", "return arr"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        let arr: number[] = [];
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List is empty", pLines, opName, {}, [], [], [], "[]")] };

        const headNode = currentNodes[0];
        frames.push(createFrame(currentNodes, [headNode.id], [{ id: headNode.id, label: 'CURR', color: 'primary' }], 1, `Initializing traversal at node ${headNode.val}`, pLines, opName, {}, [], [], [], "Array: []"));
        for (let i = 0; i < currentNodes.length; i++) {
            const node = currentNodes[i];
            frames.push(createFrame(currentNodes, [node.id], [{ id: node.id, label: 'CURR', color: 'primary' }], 2, `Wait at node ${node.val}`, pLines, opName, {}, [], [], [], `Array: ${JSON.stringify(arr)}`));
            arr.push(node.val);
            frames.push(createFrame(currentNodes, [node.id], [{ id: node.id, label: 'CURR', color: 'primary' }], 3, `Extracted value ${node.val}`, pLines, opName, {}, [], [], [], `Array: ${JSON.stringify(arr)}`));
            if (i < currentNodes.length - 1) {
                const nextNode = currentNodes[i + 1];
                frames.push(createFrame(currentNodes, [nextNode.id], [{ id: nextNode.id, label: 'CURR', color: 'primary' }], 4, `Advancing to node ${nextNode.val}`, pLines, opName, {}, [], [], [], `Array: ${JSON.stringify(arr)}`));
            }
        }
        frames.push(createFrame(currentNodes, [], [], 5, "Conversion Complete", pLines, opName, {}, [], [], [], "Final Array: " + JSON.stringify(arr)));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateShowLength = () => {
        const opName = 'showLength';
        const pLines = ["count = 0", "curr = head", "while curr != null", "  count++", "  curr = curr.next", "return count"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        let count = 0;
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List is empty", pLines, opName, {}, [], [], [], "0")] };

        const headNode = currentNodes[0];
        frames.push(createFrame(currentNodes, [headNode.id], [{ id: headNode.id, label: 'CURR', color: 'primary' }], 1, `Initializing counter at node ${headNode.val}`, pLines, opName, {}, [], [], [], "Length: 0"));
        for (let i = 0; i < currentNodes.length; i++) {
            const node = currentNodes[i];
            frames.push(createFrame(currentNodes, [node.id], [{ id: node.id, label: 'CURR', color: 'primary' }], 2, `Currently at node ${node.val}`, pLines, opName, {}, [], [], [], `Length: ${count}`));
            count++;
            frames.push(createFrame(currentNodes, [node.id], [{ id: node.id, label: 'CURR', color: 'primary' }], 3, `Count incremented to ${count}`, pLines, opName, {}, [], [], [], `Length: ${count}`));
            if (i < currentNodes.length - 1) {
                const nextNode = currentNodes[i + 1];
                frames.push(createFrame(currentNodes, [nextNode.id], [{ id: nextNode.id, label: 'CURR', color: 'primary' }], 4, `Advancing to node ${nextNode.val}`, pLines, opName, {}, [], [], [], `Length: ${count}`));
            }
        }
        frames.push(createFrame(currentNodes, [], [], 5, `Total Length identified: ${count}`, pLines, opName, {}, [], [], [], `Final Length: ${count}`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateDeleteList = () => {
        const opName = 'deleteList';
        const pLines = ["head = null", "tail = null"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List is already empty", pLines, opName, {}, [], [], [], "Status: Empty")] };

        frames.push(createFrame(currentNodes, [], [{ id: currentNodes[0].id, label: 'HEAD', color: 'red' }], 0, `Deallocating list starting from head ${currentNodes[0].val}`, pLines, opName, {}, [], [], [], "Deallocating..."));
        frames.push(createFrame([], [], [], 1, "All nodes deallocated", pLines, opName, {}, [], [], [], "Status: Cleared"));
        return { endNodes: [], timeline: frames };
    };

    const generateReverseList = () => {
        const opName = 'reverseList';
        const pLines = ["prev = null, curr = head", "while curr != null", "  nextTemp = curr.next", "  curr.next = prev", "  prev = curr", "  curr = nextTemp", "head = prev"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "Empty list", pLines, opName)] };

        let prevId: string | 'null' = 'null';
        let currIdx = 0;

        const headId = currentNodes[0].id;
        frames.push(createFrame(currentNodes, [], [{ id: headId, label: 'curr', color: 'primary' }], 0, "prev = null, curr = head", pLines, opName));

        while (currIdx < currentNodes.length) {
            const node = currentNodes[currIdx];
            const nodeId = node.id;
            const nodeVal = node.val;
            const nextIdx = currIdx + 1;
            const nextNode = currentNodes[nextIdx];
            const nextId = nextNode ? nextNode.id : 'null';
            const nextVal = nextNode ? nextNode.val : 'null';

            frames.push(createFrame(currentNodes, [nodeId], [
                { id: nodeId, label: 'curr', color: 'primary' },
                ...(prevId !== 'null' ? [{ id: prevId, label: 'prev', color: 'green' }] : []),
                ...(nextId !== 'null' ? [{ id: nextId, label: 'next', color: 'orange' }] : [])
            ], 1, `Processing node ${nodeVal}`, pLines, opName, {}, [], [], [], "Status: Reversing..."));

            frames.push(createFrame(currentNodes, [nodeId], [
                { id: nodeId, label: 'curr', color: 'primary' },
                ...(prevId !== 'null' ? [{ id: prevId, label: 'prev', color: 'green' }] : []),
                ...(nextId !== 'null' ? [{ id: nextId, label: 'next', color: 'orange' }] : [])
            ], 2, `Identifying next node: ${nextVal}`, pLines, opName, {}, [], [], [], "Storing next pointer"));

            frames.push(createFrame(currentNodes, [nodeId], [
                { id: nodeId, label: 'curr', color: 'primary' },
                ...(prevId !== 'null' ? [{ id: prevId, label: 'prev', color: 'green' }] : []),
                ...(nextId !== 'null' ? [{ id: nextId, label: 'next', color: 'orange' }] : [])
            ], 3, `Pointing ${nodeVal} back to ${prevId === 'null' ? 'null' : 'previous node'}`, pLines, opName, {}, [], [{ from: nodeId, to: prevId, color: 'red', curved: true }], [], "Reversing link"));

            prevId = nodeId;
            frames.push(createFrame(currentNodes, [nodeId], [
                { id: nodeId, label: 'prev/curr', color: 'green' },
                ...(nextId !== 'null' ? [{ id: nextId, label: 'next', color: 'orange' }] : [])
            ], 4, "prev = curr", pLines, opName));

            currIdx = nextIdx;
            if (currIdx < currentNodes.length) {
                const newCurrId = currentNodes[currIdx].id;
                frames.push(createFrame(currentNodes, [newCurrId], [
                    { id: newCurrId, label: 'curr', color: 'primary' },
                    { id: prevId, label: 'prev', color: 'green' }
                ], 5, "curr = nextTemp", pLines, opName));
            } else {
                frames.push(createFrame(currentNodes, [], [{ id: prevId, label: 'prev', color: 'green' }], 5, "curr = null", pLines, opName));
            }
        }

        const reversedNodes = [...currentNodes].reverse();
        const newHeadId = reversedNodes[0].id;
        const newHeadVal = reversedNodes[0].val;
        frames.push(createFrame(reversedNodes, [newHeadId], [{ id: newHeadId, label: 'HEAD', color: 'red' }], 6, `Updating head to point to node ${newHeadVal}`, pLines, opName, {}, [], [], [], "Reverse: " + JSON.stringify(reversedNodes.map(n => n.val))));
        return { endNodes: reversedNodes, timeline: frames };
    };

    const generateDetectCycle = () => {
        const opName = 'detectCycle';
        const pLines = ["slow = head, fast = head", "while fast != null && fast.next != null", "  slow = slow.next", "  fast = fast.next.next", "  if slow == fast return true", "return false"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "Empty List", pLines, opName)] };

        let slowIdx = 0, fastIdx = 0;
        const headId = currentNodes[0].id;
        frames.push(createFrame(currentNodes, [headId], [{ id: headId, label: 'slow/fast', color: 'blue' }], 0, "slow = fast = head", pLines, opName));

        // slowIdx/fastIdx tracking
        while (fastIdx + 1 < currentNodes.length && fastIdx + 2 < currentNodes.length) {
            const slowId = currentNodes[slowIdx].id;
            const slowVal = currentNodes[slowIdx].val;
            const fastId = currentNodes[fastIdx].id;
            const fastVal = currentNodes[fastIdx].val;
            frames.push(createFrame(currentNodes, [slowId, fastId], [{ id: slowId, label: 'slow', color: 'blue' }, { id: fastId, label: 'fast', color: 'orange' }], 1, `Currently: Slow at ${slowVal}, Fast at ${fastVal}`, pLines, opName, {}, [], [], [], "Status: Checking..."));

            slowIdx++;
            fastIdx += 2;
            const newSlowId = currentNodes[slowIdx].id;
            const newSlowVal = currentNodes[slowIdx].val;
            const newFastId = currentNodes[fastIdx].id;
            const newFastVal = currentNodes[fastIdx].val;

            frames.push(createFrame(currentNodes, [newSlowId, newFastId], [{ id: newSlowId, label: 'slow', color: 'blue' }, { id: newFastId, label: 'fast', color: 'orange' }], 2, `Slow moves to ${newSlowVal}`, pLines, opName, {}, [], [], [], "Slow pointer moved"));
            frames.push(createFrame(currentNodes, [newSlowId, newFastId], [{ id: newSlowId, label: 'slow', color: 'blue' }, { id: newFastId, label: 'fast', color: 'orange' }], 3, `Fast leaps to ${newFastVal}`, pLines, opName, {}, [], [], [], "Fast pointer moved"));

            if (slowIdx === fastIdx) {
                frames.push(createFrame(currentNodes, [newSlowId], [{ id: newSlowId, label: 'COLLISION', color: 'red' }], 4, `Meeting Point: Node ${newSlowVal}`, pLines, opName, {}, [], [], [], "Cycle Detected: YES"));
                return { endNodes: currentNodes, timeline: frames };
            }
            frames.push(createFrame(currentNodes, [newSlowId, newFastId], [{ id: newSlowId, label: 'slow', color: 'blue' }, { id: newFastId, label: 'fast', color: 'orange' }], 4, `No collision at node ${newSlowVal}`, pLines, opName, {}, [], [], [], "Cycle Detected: ?"));
        }

        frames.push(createFrame(currentNodes, [], [], 5, "fast reached null (No Cycle)", pLines, opName, {}, [], [], [], "Cycle Detected: NO"));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateSortedInsert = (val: number) => {
        const opName = 'sortedInsert';
        const pLines = ["if head == null || head.val >= val", "  v = new Node(val)", "  v.next = head; head = v", "curr = head", "while curr.next != null && curr.next.val < val", "  curr = curr.next", "v.next = curr.next; curr.next = v"];
        const frames: Frame[] = [];
        let currentNodes = [...initialNodes];

        if (currentNodes.length >= MAX_NODES) return { endNodes: currentNodes, timeline: [createFrame(currentNodes, [], [], 0, "List Full", pLines, opName, { val })] };

        if (currentNodes.length === 0 || currentNodes[0].val >= val) {
            const headId = currentNodes[0]?.id || 'null';
            frames.push(createFrame(currentNodes, headId !== 'null' ? [headId] : [], [], 0, "head == null || head.val >= val", pLines, opName, { val }));
            frames.push(createFrame(currentNodes, [], [], 1, "v = new Node(val)", pLines, opName, { val }, [{ id: 'new', val, label: 'NEW', position: 'left-of-head' }]));

            const newNodeId = generateId();
            const newNodes = [{ id: newNodeId, val }, ...currentNodes];
            frames.push(createFrame(newNodes, [newNodeId], [{ id: newNodeId, label: 'HEAD', color: 'red' }], 2, "head = v", pLines, opName, { val }));
            return { endNodes: newNodes, timeline: frames };
        }

        const headId = currentNodes[0].id;
        frames.push(createFrame(currentNodes, [headId], [{ id: headId, label: 'CURR', color: 'primary' }], 3, "curr = head", pLines, opName, { val }));

        let i = 0;
        while (i < currentNodes.length - 1 && currentNodes[i + 1].val < val) {
            const node = currentNodes[i];
            const nextNode = currentNodes[i + 1];
            frames.push(createFrame(currentNodes, [node.id, nextNode.id], [{ id: node.id, label: 'CURR', color: 'primary' }], 4, `Node ${nextNode.val} is less than ${val}`, pLines, opName, { val }, [], [], [], "Searching position..."));
            i++;
            const newCurr = currentNodes[i];
            frames.push(createFrame(currentNodes, [newCurr.id], [{ id: newCurr.id, label: 'CURR', color: 'primary' }], 5, `Advancing to node ${newCurr.val}`, pLines, opName, { val }, [], [], [], `Index: ${i}`));
        }

        const currNode = currentNodes[i];
        const afterNode = currentNodes[i + 1];
        const afterId = afterNode?.id || 'null';
        const afterVal = afterNode ? afterNode.val : 'null';

        frames.push(createFrame(currentNodes, [currNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }], 4, `Target position found after node ${currNode.val}`, pLines, opName, { val }, [], [], [], "Position Found"));

        frames.push(createFrame(currentNodes, [currNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }], 6, `Allocating node for value ${val}`, pLines, opName, { val }, [{ id: 'v', val, label: 'v', position: 'above-at-index', offsetId: currNode.id }], [], [], "NEW node created"));
        frames.push(createFrame(currentNodes, [currNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }], 6, `Linking new node ${val} to ${afterVal}`, pLines, opName, { val }, [{ id: 'v', val, label: 'v', position: 'above-at-index', offsetId: currNode.id }], [{ from: 'v', to: afterId, curved: true }], [], "Linking v.next"));
        frames.push(createFrame(currentNodes, [currNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }], 6, `Linking node ${currNode.val} to ${val}`, pLines, opName, { val }, [{ id: 'v', val, label: 'v', position: 'above-at-index', offsetId: currNode.id }], [{ from: currNode.id, to: 'v', curved: true }, { from: 'v', to: afterId, curved: true }], [], "Linking curr.next"));

        const newNodeId = generateId();
        const newNode = { id: newNodeId, val };
        const newNodes = [...currentNodes];
        newNodes.splice(i + 1, 0, newNode);
        frames.push(createFrame(newNodes, [newNodeId], [{ id: newNodeId, label: 'INSERTED', color: 'green' }], 6, `Node ${val} successfully inserted`, pLines, opName, { val }, [], [], [], "Insertion Complete"));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateFindMiddle = () => {
        const opName = 'findMiddle';
        const pLines = ["slow = head, fast = head", "while fast != null && fast.next != null", "  slow = slow.next", "  fast = fast.next.next", "return slow"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "Empty List", pLines, opName)] };

        let slowIdx = 0, fastIdx = 0;
        const headId = currentNodes[0].id;
        frames.push(createFrame(currentNodes, [headId], [{ id: headId, label: 'slow=fast', color: 'blue' }], 0, "slow = fast = head", pLines, opName));

        while (fastIdx + 1 < currentNodes.length && fastIdx + 2 < currentNodes.length) {
            const slowNode = currentNodes[slowIdx];
            const fastNode = currentNodes[fastIdx];
            frames.push(createFrame(currentNodes, [slowNode.id], [{ id: slowNode.id, label: 'slow', color: 'blue' }, { id: fastNode.id, label: 'fast', color: 'orange' }], 1, `Tracking: Slow at ${slowNode.val}, Fast at ${fastNode.val}`, pLines, opName, {}, [], [], [], "Analyzing midpoint..."));
            slowIdx++;
            fastIdx += 2;
            const newSlow = currentNodes[slowIdx];
            const newFast = currentNodes[fastIdx];
            frames.push(createFrame(currentNodes, [newSlow.id], [{ id: newSlow.id, label: 'slow', color: 'blue' }, { id: newFast.id, label: 'fast', color: 'orange' }], 2, `Slow moves to ${newSlow.val}`, pLines, opName, {}, [], [], [], "Pointers advanced"));
        }

        const midNode = currentNodes[slowIdx];
        frames.push(createFrame(currentNodes, [midNode.id], [{ id: midNode.id, label: 'MIDDLE', color: 'green' }], 4, `Middle Node Found: ${midNode.val}`, pLines, opName, {}, [], [], [], `Middle Value: ${midNode.val}`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateDeleteByValue = (target: number) => {
        const opName = 'deleteByValue';
        const pLines = ["if head == null return", "if head.val == target: head = head.next", "curr = head", "while curr.next != null", "  if curr.next.val == target", "    curr.next = curr.next.next", "  else curr = curr.next"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List Empty", pLines, opName, { target })] };

        const headNode = currentNodes[0];
        if (headNode.val === target) {
            frames.push(createFrame(currentNodes, [headNode.id], [{ id: headNode.id, label: 'MATCH', color: 'red' }], 1, `Head node ${headNode.val} matches target ${target}`, pLines, opName, { target }, [], [], [], "Target: head"));
            const newNodes = currentNodes.slice(1);
            frames.push(createFrame(newNodes, [], [], 1, `Bypassing head node ${headNode.val}`, pLines, opName, { target }, [], [], [], "Result: Removed"));
            return { endNodes: newNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [headNode.id], [{ id: headNode.id, label: 'CURR', color: 'primary' }], 2, `Initializing search at head node ${headNode.val}`, pLines, opName, { target }, [], [], [], "Search by value..."));

        let i = 0;
        while (i < currentNodes.length - 1) {
            const currNode = currentNodes[i];
            const nextNode = currentNodes[i + 1];
            frames.push(createFrame(currentNodes, [currNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }], 3, `Wait at node ${currNode.val}`, pLines, opName, { target }, [], [], [], `Index: ${i}`));
            frames.push(createFrame(currentNodes, [nextNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }, { id: nextNode.id, label: 'NEXT', color: 'orange' }], 4, `Is next node ${nextNode.val} our target?`, pLines, opName, { target }, [], [], [], `Checking node ${nextNode.val}`));

            if (nextNode.val === target) {
                const afterNode = currentNodes[i + 2];
                const afterId = afterNode?.id || 'null';
                frames.push(createFrame(currentNodes, [nextNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }, { id: nextNode.id, label: 'MATCH', color: 'red' }], 5, `Target ${target} found at node ${nextNode.val}`, pLines, opName, { target }, [], [{ from: currNode.id, to: afterId, color: 'red', curved: true }], [], "Target matched"));
                const newNodes = [...currentNodes];
                newNodes.splice(i + 1, 1);
                frames.push(createFrame(newNodes, [currNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }], 5, `Node ${target} successfully removed`, pLines, opName, { target }, [], [], [], "Result: Removed"));
                return { endNodes: newNodes, timeline: frames };
            } else {
                frames.push(createFrame(currentNodes, [nextNode.id], [{ id: nextNode.id, label: 'CURR', color: 'primary' }], 6, `Moving from ${currNode.val} to ${nextNode.val}`, pLines, opName, { target }, [], [], [], "Moving pointer..."));
                i++;
            }
        }

        frames.push(createFrame(currentNodes, [], [], 3, `Target value ${target} not found`, pLines, opName, { target }, [], [], [], "Result: Not Found"));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateFindNthNode = (n: number) => {
        const opName = 'findNthNode';
        const pLines = ["curr = head", "for (i=0; i<N; i++)", "  if curr == null return null", "  curr = curr.next", "return curr"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        if (n < 0 || n >= currentNodes.length) return { endNodes: currentNodes, timeline: [createFrame(currentNodes, [], [], 0, "Invalid N", pLines, opName, { N: n })] };

        const headNode = currentNodes[0];
        frames.push(createFrame(currentNodes, [headNode.id], [{ id: headNode.id, label: 'CURR', color: 'primary' }], 1, `Initializing at head node ${headNode.val}`, pLines, opName, { N: n }, [], [], [], "Search for index..."));

        for (let i = 0; i < n; i++) {
            const currNode = currentNodes[i];
            const nextNode = currentNodes[i + 1];
            frames.push(createFrame(currentNodes, [currNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }], 2, `Currently at index ${i}, value ${currNode.val}`, pLines, opName, { N: n }, [], [], [], `Index: ${i}`));
            frames.push(createFrame(currentNodes, [nextNode.id], [{ id: nextNode.id, label: 'CURR', color: 'primary' }], 4, `Advancing to index ${i + 1}, value ${nextNode.val}`, pLines, opName, { N: n }, [], [], [], `Index: ${i + 1}`));
        }

        const targetNode = currentNodes[n];
        frames.push(createFrame(currentNodes, [targetNode.id], [{ id: targetNode.id, label: 'FOUND', color: 'green' }], 5, `Target reached: Index ${n}, Value ${targetNode.val}`, pLines, opName, { N: n }, [], [], [], `Result: ${targetNode.val} found at index ${n}`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateFindNthFromEnd = (n: number) => {
        const opName = 'findNthFromEnd';
        const pLines = ["main = head, ref = head", "for (i=0; i<N; i++) ref = ref.next", "while ref != null", "  main = main.next", "  ref = ref.next", "return main"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        if (n <= 0 || n > currentNodes.length) return { endNodes: currentNodes, timeline: [createFrame(currentNodes, [], [], 0, "Invalid N", pLines, opName, { N: n })] };

        let refIdx = 0;
        let mainIdx = 0;
        const headNode = currentNodes[0];
        frames.push(createFrame(currentNodes, [headNode.id], [{ id: headNode.id, label: 'main/ref', color: 'primary' }], 1, `Initializing pointers at head node ${headNode.val}`, pLines, opName, { N: n }, [], [], [], "Search from end..."));

        for (let i = 0; i < n; i++) {
            const refNode = currentNodes[refIdx];
            const mainNode = currentNodes[mainIdx];
            frames.push(createFrame(currentNodes, [refNode.id], [{ id: mainNode.id, label: 'main', color: 'primary' }, { id: refNode.id, label: 'ref', color: 'orange' }], 2, `Gap creation: ref now at node ${refNode.val}`, pLines, opName, { n }, [], [], [], `Gap: ${i + 1}`));
            refIdx++;
        }

        while (refIdx < currentNodes.length) {
            const mainNode = currentNodes[mainIdx];
            const refNode = currentNodes[refIdx];
            frames.push(createFrame(currentNodes, [mainNode.id, refNode.id], [{ id: mainNode.id, label: 'main', color: 'primary' }, { id: refNode.id, label: 'ref', color: 'orange' }], 3, `Sliding gap: main at ${mainNode.val}, ref at ${refNode.val}`, pLines, opName, { n }, [], [], [], "Sliding..."));
            mainIdx++;
            refIdx++;
            if (refIdx < currentNodes.length) {
                const newMain = currentNodes[mainIdx];
                const newRef = currentNodes[refIdx];
                frames.push(createFrame(currentNodes, [newMain.id, newRef.id], [{ id: newMain.id, label: 'main', color: 'primary' }, { id: newRef.id, label: 'ref', color: 'orange' }], 4, `Advanced to ${newMain.val} and ${newRef.val}`, pLines, opName, { n }, [], [], [], "Sliding..."));
            }
        }

        const foundNode = currentNodes[mainIdx];
        frames.push(createFrame(currentNodes, [foundNode.id], [{ id: foundNode.id, label: 'FOUND', color: 'green' }], 6, `Found target node: ${foundNode.val}`, pLines, opName, { n }, [], [], [], `Result: ${foundNode.val} found`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateInsertAfterValue = (target: number, insertVal: number) => {
        const opName = 'insertAfterValue';
        const pLines = ["curr = head", "while curr != null && curr.val != target", "  curr = curr.next", "if curr == null return", "v = new Node(val)", "v.next = curr.next", "curr.next = v"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        if (currentNodes.length >= MAX_NODES) return { endNodes: currentNodes, timeline: [createFrame(currentNodes, [], [], 0, "List Full", pLines, opName, { target, val: insertVal })] };
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List Empty", pLines, opName, { target, val: insertVal })] };

        const headNode = currentNodes[0];
        frames.push(createFrame(currentNodes, [headNode.id], [{ id: headNode.id, label: 'CURR', color: 'primary' }], 1, `Initializing at head node ${headNode.val}`, pLines, opName, { target, val: insertVal }, [], [], [], `Starting the search for target ${target} at the head.`));

        let foundIdx = -1;
        for (let i = 0; i < currentNodes.length; i++) {
            const node = currentNodes[i];
            frames.push(createFrame(currentNodes, [node.id], [{ id: node.id, label: 'CURR', color: 'primary' }], 2, `Inspecting node ${node.val}`, pLines, opName, { target, val: insertVal }, [], [], [], `Index: ${i}`));
            if (node.val === target) {
                foundIdx = i;
                frames.push(createFrame(currentNodes, [node.id], [{ id: node.id, label: 'MATCH', color: 'green' }], 2, `Found target node ${target}`, pLines, opName, { target, val: insertVal }, [], [], [], "Target Matched"));
                break;
            }
            if (i < currentNodes.length - 1) {
                const nextNode = currentNodes[i + 1];
                frames.push(createFrame(currentNodes, [nextNode.id], [{ id: nextNode.id, label: 'CURR', color: 'primary' }], 3, `Advancing to node ${nextNode.val}`, pLines, opName, { target, val: insertVal }, [], [], [], `Index: ${i + 1}`));
            }
        }

        if (foundIdx === -1) {
            frames.push(createFrame(currentNodes, [], [], 4, `Target ${target} not found`, pLines, opName, { target, val: insertVal }, [], [], [], "Result: Not Found"));
            return { endNodes: currentNodes, timeline: frames };
        }

        const currNode = currentNodes[foundIdx];
        const nextNodeRef = currentNodes[foundIdx + 1];
        const nextId = nextNodeRef?.id || 'null';
        const nextVal = nextNodeRef ? nextNodeRef.val : 'null';

        frames.push(createFrame(currentNodes, [currNode.id], [{ id: currNode.id, label: 'curr', color: 'primary' }], 5, `Creating new node ${insertVal}`, pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetId: currNode.id }], [], [], "NEW node created"));
        frames.push(createFrame(currentNodes, [currNode.id], [{ id: currNode.id, label: 'curr', color: 'primary' }], 6, `Linking ${insertVal} to node ${nextVal}`, pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetId: currNode.id }], [{ from: 'temp', to: nextId, curved: true }], [], "Linking v.next"));
        frames.push(createFrame(currentNodes, [currNode.id], [{ id: currNode.id, label: 'curr', color: 'primary' }], 7, `Linking node ${currNode.val} to ${insertVal}`, pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetId: currNode.id }], [{ from: currNode.id, to: 'temp', curved: true }, { from: 'temp', to: nextId, curved: true }], [], "Linking curr.next"));

        const newNodeId = generateId();
        const newNode = { id: newNodeId, val: insertVal };
        const newNodes = [...currentNodes];
        newNodes.splice(foundIdx + 1, 0, newNode);
        frames.push(createFrame(newNodes, [newNodeId], [{ id: newNodeId, label: 'Inserted', color: 'green' }], 7, `Node ${insertVal} successfully inserted after ${target}`, pLines, opName, { target, val: insertVal }, [], [], [], "Insertion Successful"));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateInsertBeforeValue = (target: number, insertVal: number) => {
        const opName = 'insertBeforeValue';
        const pLines = ["if head == null return", "if head.val == target", "  v = new Node(val)", "  v.next = head; head = v", "curr = head", "while curr.next != null && curr.next.val != target", "  curr = curr.next", "if curr.next == null return", "v = new Node(val)", "v.next = curr.next", "curr.next = v"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        if (currentNodes.length >= MAX_NODES) return { endNodes: currentNodes, timeline: [createFrame(currentNodes, [], [], 0, "List Full", pLines, opName, { target, val: insertVal })] };
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List Empty", pLines, opName, { target, val: insertVal })] };

        const headNode = currentNodes[0];
        if (headNode.val === target) {
            frames.push(createFrame(currentNodes, [headNode.id], [{ id: headNode.id, label: 'MATCH', color: 'green' }], 2, `Head node ${headNode.val} matches target ${target}`, pLines, opName, { target, val: insertVal }, [], [], [], `Identifying the head node ${headNode.val} as our insertion target.`));

            const newNodeId = generateId();
            const newNodes = [{ id: newNodeId, val: insertVal }, ...currentNodes];
            frames.push(createFrame(currentNodes, [headNode.id], [], 3, `Creating new node ${insertVal} as head`, pLines, opName, { target, val: insertVal }, [{ id: 't', val: insertVal, label: 'v', position: 'left-of-head' }], [], [], `Allocating memory for a new head node with value ${insertVal}.`));
            frames.push(createFrame(newNodes, [newNodeId], [{ id: newNodeId, label: 'HEAD', color: 'green' }], 4, `Node ${insertVal} is now head`, pLines, opName, { target, val: insertVal }, [], [], [], `Successfully prepended node ${insertVal} to the list.`));
            return { endNodes: newNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [headNode.id], [{ id: headNode.id, label: 'CURR', color: 'primary' }], 5, `Initializing search at head node ${headNode.val}`, pLines, opName, { target, val: insertVal }, [], [], [], `Searching for pre-insertion point starting from head node ${headNode.val}.`));

        let foundIdx = -1;
        for (let i = 0; i < currentNodes.length - 1; i++) {
            const currNode = currentNodes[i];
            const nextNode = currentNodes[i + 1];
            frames.push(createFrame(currentNodes, [currNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }], 6, `Wait at node ${currNode.val}`, pLines, opName, { target, val: insertVal }, [], [], [], `Index: ${i}`));
            if (nextNode.val === target) {
                foundIdx = i;
                frames.push(createFrame(currentNodes, [nextNode.id], [{ id: currNode.id, label: 'CURR', color: 'primary' }, { id: nextNode.id, label: 'MATCH', color: 'green' }], 6, `Next node ${nextNode.val} matches target ${target}`, pLines, opName, { target, val: insertVal }, [], [], [], "Target Matched"));
                break;
            }
            if (i < currentNodes.length - 2) {
                const newCurr = currentNodes[i + 1];
                frames.push(createFrame(currentNodes, [newCurr.id], [{ id: newCurr.id, label: 'CURR', color: 'primary' }], 7, `Moving to node ${newCurr.val}`, pLines, opName, { target, val: insertVal }, [], [], [], `Index: ${i + 1}`));
            }
        }

        if (foundIdx === -1) {
            frames.push(createFrame(currentNodes, [], [], 8, `Target ${target} not found`, pLines, opName, { target, val: insertVal }, [], [], [], "Result: Not Found"));
            return { endNodes: currentNodes, timeline: frames };
        }

        const currNodePtr = currentNodes[foundIdx];
        const targetNodePtr = currentNodes[foundIdx + 1];
        frames.push(createFrame(currentNodes, [currNodePtr.id], [{ id: currNodePtr.id, label: 'curr', color: 'primary' }], 9, `Creating new node ${insertVal}`, pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetId: currNodePtr.id }], [], [], "NEW node created"));
        frames.push(createFrame(currentNodes, [currNodePtr.id], [{ id: currNodePtr.id, label: 'curr', color: 'primary' }], 10, `Linking ${insertVal} to node ${targetNodePtr.val}`, pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetId: currNodePtr.id }], [{ from: 'temp', to: targetNodePtr.id, curved: true }], [], "Linking v.next"));
        frames.push(createFrame(currentNodes, [currNodePtr.id], [{ id: currNodePtr.id, label: 'curr', color: 'primary' }], 11, `Linking node ${currNodePtr.val} to ${insertVal}`, pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetId: currNodePtr.id }], [{ from: currNodePtr.id, to: 'temp', curved: true }, { from: 'temp', to: targetNodePtr.id, curved: true }], [], "Linking curr.next"));

        const newNodeId = generateId();
        const newNode = { id: newNodeId, val: insertVal };
        const newNodes = [...currentNodes];
        newNodes.splice(foundIdx + 1, 0, newNode);
        frames.push(createFrame(newNodes, [newNodeId], [{ id: newNodeId, label: 'Inserted', color: 'green' }], 11, `Node ${insertVal} successfully inserted before ${target}`, pLines, opName, { target, val: insertVal }, [], [], [], "Insertion Successful"));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateDeleteAllOccurrences = (target: number) => {
        const opName = 'deleteAllOccurrences';
        const pLines = PSEUDOCODE.deleteAllOccurrences;
        const frames: Frame[] = [];
        let currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [], 0, `Starting deletion of all occurrences of ${target}`, pLines, opName, { target }, [], [], [], "Deletion Process Started"));

        if (currentNodes.length === 0) {
            frames.push(createFrame([], [], [], 0, "List is empty", pLines, opName, { target }, [], [], [], "Result: List Empty"));
            return { endNodes: currentNodes, timeline: frames };
        }

        let removals = 0;

        // Delete from head
        while (currentNodes.length > 0 && currentNodes[0].val === target) {
            const removedVal = currentNodes[0].val;
            frames.push(createFrame(currentNodes, [currentNodes[0].id], [{ id: currentNodes[0].id, label: 'HEAD', color: 'red' }], 0, `Head node contains target ${target}`, pLines, opName, { target }, [], [], [], `Target found at Head`));

            const headId = currentNodes[0].id;
            const newHeadId = currentNodes.length > 1 ? currentNodes[1].id : null;

            if (newHeadId) {
                frames.push(createFrame(currentNodes, [headId], [{ id: headId, label: 'HEAD', color: 'red' }], 1, `Advancing head to bypass target`, pLines, opName, { target }, [], [{ from: headId, to: 'null', color: 'red' }], [], "Head Rerouted"));
            }

            currentNodes = currentNodes.slice(1);
            frames.push(createFrame(currentNodes, newHeadId ? [newHeadId] : [], newHeadId ? [{ id: newHeadId, label: 'new head', color: 'green' }] : [], 1, `Removed head node ${removedVal}`, pLines, opName, { target }, [], [], [], "Node Removed"));
            removals++;
        }

        if (currentNodes.length === 0) {
            frames.push(createFrame(currentNodes, [], [], 2, "All nodes removed", pLines, opName, { target }, [], [], [], `Result: Removed ${removals} nodes`));
            return { endNodes: currentNodes, timeline: frames };
        }

        let currIdx = 0;
        frames.push(createFrame(currentNodes, [currentNodes[currIdx].id], [{ id: currentNodes[currIdx].id, label: 'curr', color: 'primary' }], 2, `Initializing curr pointer to head`, pLines, opName, { target }, [], [], [], "Searching List..."));

        while (currIdx < currentNodes.length - 1) {
            frames.push(createFrame(currentNodes, [currentNodes[currIdx].id], [{ id: currentNodes[currIdx].id, label: 'curr', color: 'primary' }], 3, `Checking next node`, pLines, opName, { target }, [], [], [], `Checking index ${currIdx + 1}`));

            if (currentNodes[currIdx + 1].val === target) {
                const targetNode = currentNodes[currIdx + 1];
                frames.push(createFrame(currentNodes, [targetNode.id], [{ id: currentNodes[currIdx].id, label: 'curr', color: 'primary' }, { id: targetNode.id, label: 'MATCH', color: 'red' }], 4, `Found target ${target} at next node`, pLines, opName, { target }, [], [], [], "Target Matched"));

                const nextNextId = currIdx + 2 < currentNodes.length ? currentNodes[currIdx + 2].id : 'null';
                frames.push(createFrame(currentNodes, [currentNodes[currIdx].id], [{ id: currentNodes[currIdx].id, label: 'curr', color: 'primary' }], 5, `Rerouting curr.next to bypass target node`, pLines, opName, { target }, [], [{ from: currentNodes[currIdx].id, to: nextNextId, curved: true }], [], "Bypassing Node"));

                // Remove the node at currIdx + 1
                currentNodes = [...currentNodes.slice(0, currIdx + 1), ...currentNodes.slice(currIdx + 2)];
                removals++;

                frames.push(createFrame(currentNodes, [currentNodes[currIdx].id], [{ id: currentNodes[currIdx].id, label: 'curr', color: 'primary' }], 5, `Successfully removed node.`, pLines, opName, { target }, [], [], [], "Node Removed"));
            } else {
                frames.push(createFrame(currentNodes, [currentNodes[currIdx].id], [{ id: currentNodes[currIdx].id, label: 'curr', color: 'primary' }], 6, `Next node is not target, advancing curr`, pLines, opName, { target }, [], [], [], "Advancing..."));
                currIdx++;
            }
        }

        frames.push(createFrame(currentNodes, [], [], 0, `Deletion complete. Removed ${removals} occurrences of ${target}.`, pLines, opName, { target }, [], [], [], `Result: Removed ${removals} nodes`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateRotateList = (k: number) => {
        const opName = 'rotateList';
        const pLines = PSEUDOCODE.rotateList;
        const frames: Frame[] = [];
        let currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [], 0, `Starting rotation to the right by ${k} positions`, pLines, opName, { k }, [], [], [], "Rotation Started"));

        if (currentNodes.length <= 1 || k === 0) {
            frames.push(createFrame(currentNodes, [], [], 0, "No rotation needed", pLines, opName, { k }, [], [], [], "Result: Unchanged"));
            return { endNodes: currentNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [currentNodes[0].id], [{ id: currentNodes[0].id, label: 'tail', color: 'primary' }], 1, `Initializing tail pointer and length counter`, pLines, opName, { k }, [], [], [], "Finding Tail & Length"));
        let length = 1;

        while (length < currentNodes.length) {
            frames.push(createFrame(currentNodes, [currentNodes[length].id], [{ id: currentNodes[length].id, label: 'tail', color: 'primary' }], 2, `Advancing tail, length is ${length + 1}`, pLines, opName, { k }, [], [], [], `Length: ${length + 1}`));
            length++;
        }

        let effectiveK = k % length;
        frames.push(createFrame(currentNodes, [currentNodes[length - 1].id], [{ id: currentNodes[length - 1].id, label: 'tail', color: 'primary' }], 3, `Calculated effective k: ${k} % ${length} = ${effectiveK}`, pLines, opName, { k }, [], [], [], `Effective k: ${effectiveK}`));

        if (effectiveK === 0) {
            frames.push(createFrame(currentNodes, [], [], 4, "Effective rotation is 0, no changes needed", pLines, opName, { k }, [], [], [], "Result: Unchanged"));
            return { endNodes: currentNodes, timeline: frames };
        }

        let breakIdx = length - effectiveK - 1;
        frames.push(createFrame(currentNodes, [currentNodes[breakIdx].id], [{ id: currentNodes[0].id, label: 'newTail', color: 'secondary' }], 5, `Finding new tail at index ${breakIdx}`, pLines, opName, { k }, [], [], [], `Target Break Pos: ${breakIdx}`));

        // Simulate moving newTail
        for (let i = 0; i <= breakIdx; i++) {
            frames.push(createFrame(currentNodes, [currentNodes[i].id], [{ id: currentNodes[i].id, label: 'newTail', color: 'secondary' }, { id: currentNodes[length - 1].id, label: 'tail', color: 'primary' }], 6, `Advancing newTail`, pLines, opName, { k }, [], [], [], `newTail Index: ${i}`));
        }

        const newTailId = currentNodes[breakIdx].id;
        const newHeadId = currentNodes[breakIdx + 1].id;
        const tailId = currentNodes[length - 1].id;

        frames.push(createFrame(currentNodes, [newHeadId], [{ id: newTailId, label: 'newTail', color: 'secondary' }, { id: newHeadId, label: 'newHead', color: 'green' }], 7, `Identified new head node ${currentNodes[breakIdx + 1].val}`, pLines, opName, { k }, [], [], [], "New Head Found"));

        frames.push(createFrame(currentNodes, [newTailId], [{ id: newTailId, label: 'newTail', color: 'secondary' }, { id: newHeadId, label: 'newHead', color: 'green' }], 8, `Breaking link at newTail`, pLines, opName, { k }, [], [{ from: newTailId, to: 'null', color: 'red' }], [], "Breaking Link"));

        frames.push(createFrame(currentNodes, [tailId, currentNodes[0].id], [{ id: tailId, label: 'tail', color: 'primary' }, { id: currentNodes[0].id, label: 'oldHead', color: 'gray' }], 9, `Connecting old tail to old head`, pLines, opName, { k }, [], [{ from: tailId, to: currentNodes[0].id, curved: true, color: 'blue' }], [], "Connecting Ends"));

        // Perform rotation in array
        currentNodes = [...currentNodes.slice(breakIdx + 1), ...currentNodes.slice(0, breakIdx + 1)];
        frames.push(createFrame(currentNodes, [currentNodes[0].id], [{ id: currentNodes[0].id, label: 'HEAD', color: 'green' }], 9, `Rotation complete`, pLines, opName, { k }, [], [], [], "Rotation Successful"));

        return { endNodes: currentNodes, timeline: frames };
    };

    const generateOddEvenRearrange = () => {
        const opName = 'oddEvenRearrange';
        const pLines = PSEUDOCODE.oddEvenRearrange;
        const frames: Frame[] = [];
        let currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [], 0, `Rearranging nodes such that odd-indexed nodes appear first`, pLines, opName, {}, [], [], [], "Odd-Even Rearrange Started"));

        if (currentNodes.length <= 2) {
            frames.push(createFrame(currentNodes, [], [], 0, "List is too small to rearrange", pLines, opName, {}, [], [], [], "Result: Unchanged"));
            return { endNodes: currentNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [currentNodes[0].id, currentNodes[1].id], [{ id: currentNodes[0].id, label: 'odd', color: 'primary' }, { id: currentNodes[1].id, label: 'even', color: 'secondary' }, { id: currentNodes[1].id, label: 'evenHead', color: 'gray' }], 1, `Initializing odd, even pointers`, pLines, opName, {}, [], [], [], "Pointers Ready"));

        let oddIdx = 0;
        let evenIdx = 1;

        while (evenIdx < currentNodes.length && evenIdx + 1 < currentNodes.length) {
            frames.push(createFrame(currentNodes, [currentNodes[evenIdx].id], [{ id: currentNodes[oddIdx].id, label: 'odd', color: 'primary' }, { id: currentNodes[evenIdx].id, label: 'even', color: 'secondary' }], 2, `Checking if even node and even.next are not null`, pLines, opName, {}, [], [], [], "Checking..."));

            const nextOddNodeId = currentNodes[evenIdx + 1].id;
            const currentOddId = currentNodes[oddIdx].id;
            frames.push(createFrame(currentNodes, [currentOddId, nextOddNodeId], [{ id: currentOddId, label: 'odd', color: 'primary' }, { id: currentNodes[evenIdx].id, label: 'even', color: 'secondary' }], 3, `Connecting current odd node to next odd node`, pLines, opName, {}, [], [{ from: currentOddId, to: nextOddNodeId, curved: true, color: 'blue' }], [], "Linking Odd"));
            oddIdx = evenIdx + 1;

            if (oddIdx + 1 < currentNodes.length) {
                const nextEvenNodeId = currentNodes[oddIdx + 1].id;
                const currentEvenId = currentNodes[evenIdx].id;
                frames.push(createFrame(currentNodes, [currentEvenId, nextEvenNodeId], [{ id: currentNodes[oddIdx].id, label: 'odd', color: 'primary' }, { id: currentEvenId, label: 'even', color: 'secondary' }], 4, `Connecting current even node to next even node`, pLines, opName, {}, [], [{ from: currentEvenId, to: nextEvenNodeId, curved: true, color: 'magenta' }], [], "Linking Even"));
                evenIdx = oddIdx + 1;
            } else {
                frames.push(createFrame(currentNodes, [currentNodes[evenIdx].id], [{ id: currentNodes[oddIdx].id, label: 'odd', color: 'primary' }, { id: currentNodes[evenIdx].id, label: 'even', color: 'secondary' }], 4, `Even node is at the tail, breaking link`, pLines, opName, {}, [], [{ from: currentNodes[evenIdx].id, to: 'null', color: 'red' }], [], "Breaking Even Tail"));
                break;
            }
        }

        frames.push(createFrame(currentNodes, [currentNodes[oddIdx].id, currentNodes[1].id], [{ id: currentNodes[oddIdx].id, label: 'odd', color: 'primary' }, { id: currentNodes[1].id, label: 'evenHead', color: 'gray' }], 5, `Connecting the end of the odd list to the head of the even list`, pLines, opName, {}, [], [{ from: currentNodes[oddIdx].id, to: currentNodes[1].id, curved: true, color: 'green' }], [], "Connecting Odd to Even"));

        // Logical array update
        const odds = currentNodes.filter((_, i) => i % 2 === 0);
        const evens = currentNodes.filter((_, i) => i % 2 !== 0);
        currentNodes = [...odds, ...evens];

        frames.push(createFrame(currentNodes, [], [], 6, "Rearrangement Complete", pLines, opName, {}, [], [], [], "Rearrangement Successful"));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateSwapNodesPairwise = () => {
        const opName = 'swapNodesPairwise';
        const pLines = PSEUDOCODE.swapNodesPairwise;
        const frames: Frame[] = [];
        let currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [], 0, `Swapping nodes in adjacent pairs`, pLines, opName, {}, [], [], [], "Pairwise Swap Started"));

        if (currentNodes.length <= 1) {
            frames.push(createFrame(currentNodes, [], [], 0, "Not enough nodes to swap pairs", pLines, opName, {}, [], [], [], "Result: Unchanged"));
            return { endNodes: currentNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [currentNodes[0].id], [{ id: currentNodes[0].id, label: 'curr', color: 'primary' }], 1, `Initializing pointers. Assuming a dummy node before head.`, pLines, opName, {}, [], [], [], "Pointers Ready"));

        let currIdx = 0;
        while (currIdx < currentNodes.length - 1) {
            const first = currentNodes[currIdx];
            const second = currentNodes[currIdx + 1];
            const nextPairId = currIdx + 2 < currentNodes.length ? currentNodes[currIdx + 2].id : 'null';

            frames.push(createFrame(currentNodes, [first.id, second.id], [{ id: first.id, label: 'curr', color: 'primary' }, { id: second.id, label: 'second', color: 'secondary' }], 2, `Identifying pair to swap: ${first.val} and ${second.val}`, pLines, opName, {}, [], [], [], "Identifying Pair"));

            frames.push(createFrame(currentNodes, [first.id, second.id], [{ id: first.id, label: 'curr', color: 'primary' }, { id: second.id, label: 'second', color: 'secondary' }], 5, `Linking second node ${second.val} to first node ${first.val}`, pLines, opName, {}, [], [{ from: second.id, to: first.id, curved: true, color: 'blue' }], [], "Swapping Links"));
            frames.push(createFrame(currentNodes, [first.id], [{ id: first.id, label: 'curr', color: 'primary' }], 5, `Linking first node to the next pair`, pLines, opName, {}, [], [{ from: first.id, to: nextPairId, curved: true }], [], "Linking to Next"));

            // Array swap
            currentNodes = [...currentNodes];
            currentNodes[currIdx] = second;
            currentNodes[currIdx + 1] = first;

            frames.push(createFrame(currentNodes, [first.id, second.id], [{ id: first.id, label: 'prev', color: 'gray' }], 6, `Updating prev pointer and advancing to next pair`, pLines, opName, {}, [], [], [], "Advancing"));
            currIdx += 2;
        }

        frames.push(createFrame(currentNodes, [], [], 8, "Pairwise swapping complete", pLines, opName, {}, [], [], [], "Swap Successful"));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateRecursiveTraversal = () => {
        const opName = 'recursiveTraversal';
        const pLines = PSEUDOCODE.recursiveTraversal;
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        const visited: number[] = [];

        frames.push(createFrame(currentNodes, [], [], 0, `Starting recursive traversal from head`, pLines, opName, {}, [], [], [], "Traversal Started"));

        if (currentNodes.length === 0) {
            frames.push(createFrame([], [], [], 1, "Base case reached: node is null", pLines, opName, {}, [], [], [], "List is Empty"));
            return { endNodes: currentNodes, timeline: frames };
        }

        for (let i = 0; i < currentNodes.length; i++) {
            const node = currentNodes[i];
            visited.push(node.val);
            frames.push(createFrame(currentNodes, [node.id], [{ id: node.id, label: `call(${i})`, color: 'primary' }], 2, `Visiting node ${node.val} at depth ${i}`, pLines, opName, {}, [], [], [...visited], `Visited: [${visited.join(', ')}]`));
            frames.push(createFrame(currentNodes, [node.id], [{ id: node.id, label: `call(${i})`, color: 'primary' }], 3, `Recursively calling traverse(node.next)`, pLines, opName, {}, [], [], [...visited], `Visited: [${visited.join(', ')}]`));
        }

        frames.push(createFrame(currentNodes, [], [], 1, "Base case: next is null, unwinding call stack", pLines, opName, {}, [], [], [...visited], `Traversed: [${visited.join(', ')}]`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateReverseTraversal = () => {
        const opName = 'reverseTraversal';
        const pLines = PSEUDOCODE.reverseTraversal;
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        const callStack: number[] = [];
        const visited: number[] = [];

        frames.push(createFrame(currentNodes, [], [], 0, `Starting reverse traversal (print on return)`, pLines, opName, {}, [], [], [], "Reverse Traversal Started"));

        // Simulate going forward (pushing calls)
        for (let i = 0; i < currentNodes.length; i++) {
            const node = currentNodes[i];
            callStack.push(node.val);
            frames.push(createFrame(currentNodes, [node.id], [{ id: node.id, label: `call(${i})`, color: 'secondary' }], 2, `Recursing into node ${node.val}`, pLines, opName, {}, [], [], [], `Call Stack: ${callStack.join(' → ')}`));
        }

        frames.push(createFrame(currentNodes, [], [], 1, "Base case reached: null, now returning and printing", pLines, opName, {}, [], [], [], "Unwinding..."));

        // Simulate returning (popping calls)
        for (let i = currentNodes.length - 1; i >= 0; i--) {
            const node = currentNodes[i];
            visited.push(node.val);
            frames.push(createFrame(currentNodes, [node.id], [{ id: node.id, label: 'print', color: 'green' }], 3, `Returning from depth ${i}: printing ${node.val}`, pLines, opName, {}, [], [], [...visited], `Output: [${visited.join(', ')}]`));
        }

        frames.push(createFrame(currentNodes, [], [], 0, "Reverse traversal complete", pLines, opName, {}, [], [], [...visited], `Result: [${visited.join(', ')}]`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateReverseInKGroups = (k: number) => {
        const opName = 'reverseInKGroups';
        const pLines = PSEUDOCODE.reverseInKGroups;
        const frames: Frame[] = [];
        let currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [], 0, `Reversing list in groups of k=${k}`, pLines, opName, { k }, [], [], [], "Reversal Started"));

        if (currentNodes.length === 0 || k <= 1) {
            frames.push(createFrame(currentNodes, [], [], 0, "No reversal needed", pLines, opName, { k }, [], [], [], "Result: Unchanged"));
            return { endNodes: currentNodes, timeline: frames };
        }

        const result: typeof currentNodes = [];
        let remaining = [...currentNodes];

        while (remaining.length > 0) {
            const group = remaining.slice(0, k);
            remaining = remaining.slice(k);

            const groupIds = group.map(n => n.id);
            frames.push(createFrame(currentNodes, groupIds, groupIds.map((id, i) => ({ id, label: `g[${i}]`, color: 'primary' })), 1, `Counting ${group.length} nodes for reversal group`, pLines, opName, { k }, [], [], [], `Group: [${group.map(n => n.val).join(', ')}]`));

            if (group.length === k) {
                frames.push(createFrame(currentNodes, groupIds, groupIds.map((id, i) => ({ id, label: `g[${k - 1 - i}]`, color: 'secondary' })), 4, `Reversing group of ${k} nodes`, pLines, opName, { k }, [], [], [], `Reversing: [${group.map(n => n.val).join(', ')}]`));
                const reversedGroup = [...group].reverse();
                result.push(...reversedGroup);
            } else {
                frames.push(createFrame(currentNodes, groupIds, [], 2, `Last group has fewer than k=${k} nodes, keeping as-is`, pLines, opName, { k }, [], [], [], `Keeping: [${group.map(n => n.val).join(', ')}]`));
                result.push(...group);
            }

            currentNodes = [...result, ...remaining];
            frames.push(createFrame(currentNodes, result.map(n => n.id), [{ id: result[0].id, label: 'HEAD', color: 'green' }], 5, `Group processed. List so far: [${result.map(n => n.val).join(', ')}]`, pLines, opName, { k }, [], [], [], `Progress: [${result.map(n => n.val).join(', ')}]`));
        }

        frames.push(createFrame(currentNodes, [], [{ id: currentNodes[0].id, label: 'HEAD', color: 'green' }], 0, "Reversal in K groups complete", pLines, opName, { k }, [], [], [], "Complete"));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateCheckPalindrome = () => {
        const opName = 'checkPalindrome';
        const pLines = PSEUDOCODE.checkPalindrome;
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [], 0, `Checking if linked list is a palindrome`, pLines, opName, {}, [], [], [], "Palindrome Check Started"));

        if (currentNodes.length === 0) {
            frames.push(createFrame(currentNodes, [], [], 0, "Empty list is a palindrome", pLines, opName, {}, [], [], [], "Result: True (trivial)"));
            return { endNodes: currentNodes, timeline: frames };
        }

        // Phase 1: Find middle with slow/fast
        frames.push(createFrame(currentNodes, [currentNodes[0].id], [{ id: currentNodes[0].id, label: 'slow', color: 'primary' }, { id: currentNodes[0].id, label: 'fast', color: 'secondary' }], 0, `Initializing slow and fast pointers at head`, pLines, opName, {}, [], [], [], "Phase 1: Find Middle"));

        let slowIdx = 0;
        let fastIdx = 0;
        while (fastIdx < currentNodes.length - 1 && fastIdx + 1 < currentNodes.length - 1) {
            slowIdx++;
            fastIdx += 2;
            frames.push(createFrame(currentNodes, [currentNodes[slowIdx].id, currentNodes[fastIdx].id], [{ id: currentNodes[slowIdx].id, label: 'slow', color: 'primary' }, { id: currentNodes[fastIdx].id, label: 'fast', color: 'secondary' }], 1, `Advancing pointers: slow→${currentNodes[slowIdx].val}, fast→${currentNodes[fastIdx].val}`, pLines, opName, {}, [], [], [], `Slow: ${currentNodes[slowIdx].val}, Fast: ${currentNodes[fastIdx].val}`));
        }

        const midIdx = slowIdx + 1;
        frames.push(createFrame(currentNodes, [currentNodes[midIdx].id], [{ id: currentNodes[midIdx].id, label: 'mid', color: 'primary' }], 2, `Middle found at index ${midIdx}, value ${currentNodes[midIdx].val}. Now reversing second half.`, pLines, opName, {}, [], [], [], `Middle: ${currentNodes[midIdx].val}`));

        // Phase 2: Reverse second half (visual only)
        const secondHalf = currentNodes.slice(midIdx);
        const reversedSecond = [...secondHalf].reverse();
        frames.push(createFrame(currentNodes, secondHalf.map(n => n.id), [], 5, `Reversing second half: [${secondHalf.map(n => n.val).join(', ')}] → [${reversedSecond.map(n => n.val).join(', ')}]`, pLines, opName, {}, [], [], [], `Second Half Reversed`));

        // Phase 3: Compare
        frames.push(createFrame(currentNodes, [], [], 9, `Comparing first half with reversed second half`, pLines, opName, {}, [], [], [], "Phase 3: Compare"));

        let isPalindrome = true;
        const firstHalf = currentNodes.slice(0, midIdx);
        for (let i = 0; i < Math.min(firstHalf.length, reversedSecond.length); i++) {
            const l = firstHalf[i];
            const r = reversedSecond[i];
            const match = l.val === r.val;
            frames.push(createFrame(currentNodes, [l.id, r.id], [{ id: l.id, label: 'left', color: 'primary' }, { id: r.id, label: 'right', color: match ? 'green' : 'red' }], 11, `Comparing ${l.val} (left) with ${r.val} (right): ${match ? 'Match' : 'Mismatch'}`, pLines, opName, {}, [], [], [], match ? `Match: ${l.val} == ${r.val}` : `Mismatch: ${l.val} != ${r.val}`));
            if (!match) { isPalindrome = false; break; }
        }

        frames.push(createFrame(currentNodes, [], [], 14, `Palindrome check complete`, pLines, opName, {}, [], [], [], `Result: ${isPalindrome ? 'TRUE ✓ (Palindrome)' : 'FALSE ✗ (Not Palindrome)'}`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateMergeTwoLists = () => {
        const opName = 'mergeTwoLists';
        const pLines = PSEUDOCODE.mergeTwoLists;
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [], 0, `Splitting current list in 2 halves then merging them to demonstrate the algorithm`, pLines, opName, {}, [], [], [], "Merge Two Lists Started"));

        if (currentNodes.length < 2) {
            frames.push(createFrame(currentNodes, [], [], 0, "Need at least 2 nodes", pLines, opName, {}, [], [], [], "Result: Unchanged"));
            return { endNodes: currentNodes, timeline: frames };
        }

        const mid = Math.floor(currentNodes.length / 2);
        const l1 = [...currentNodes.slice(0, mid)].sort((a, b) => a.val - b.val);
        const l2 = [...currentNodes.slice(mid)].sort((a, b) => a.val - b.val);

        frames.push(createFrame(currentNodes, l1.map(n => n.id), [{ id: l1[0].id, label: 'l1', color: 'primary' }], 0, `List 1 (sorted): [${l1.map(n => n.val).join(', ')}]`, pLines, opName, {}, [], [], [], `L1: [${l1.map(n => n.val).join(', ')}]`));
        frames.push(createFrame(currentNodes, l2.map(n => n.id), [{ id: l2[0].id, label: 'l2', color: 'secondary' }], 0, `List 2 (sorted): [${l2.map(n => n.val).join(', ')}]`, pLines, opName, {}, [], [], [], `L2: [${l2.map(n => n.val).join(', ')}]`));

        frames.push(createFrame(currentNodes, [], [], 1, `Initializing pointers at heads of both lists`, pLines, opName, {}, [], [], [], "Pointers Initialized"));

        const merged: typeof currentNodes = [];
        let i = 0;
        let j = 0;

        while (i < l1.length && j < l2.length) {
            frames.push(createFrame(currentNodes, [l1[i].id, l2[j].id], [{ id: l1[i].id, label: 'l1', color: 'primary' }, { id: l2[j].id, label: 'l2', color: 'secondary' }], 2, `Comparing ${l1[i].val} (l1) and ${l2[j].val} (l2)`, pLines, opName, {}, [], [], [], `Comparing: ${l1[i].val} vs ${l2[j].val}`));
            if (l1[i].val <= l2[j].val) {
                merged.push(l1[i]);
                frames.push(createFrame(currentNodes, [l1[i].id], [{ id: l1[i].id, label: 'picked', color: 'green' }], 3, `Picking ${l1[i].val} from L1 (smaller or equal)`, pLines, opName, {}, [], [], [], `Merged: [${merged.map(n => n.val).join(', ')}]`));
                i++;
            } else {
                merged.push(l2[j]);
                frames.push(createFrame(currentNodes, [l2[j].id], [{ id: l2[j].id, label: 'picked', color: 'green' }], 5, `Picking ${l2[j].val} from L2 (smaller)`, pLines, opName, {}, [], [], [], `Merged: [${merged.map(n => n.val).join(', ')}]`));
                j++;
            }
        }

        while (i < l1.length) {
            merged.push(l1[i]);
            frames.push(createFrame(currentNodes, [l1[i].id], [{ id: l1[i].id, label: 'rest', color: 'green' }], 8, `Appending remaining L1 node: ${l1[i].val}`, pLines, opName, {}, [], [], [], `Merged: [${merged.map(n => n.val).join(', ')}]`));
            i++;
        }

        while (j < l2.length) {
            merged.push(l2[j]);
            frames.push(createFrame(currentNodes, [l2[j].id], [{ id: l2[j].id, label: 'rest', color: 'green' }], 9, `Appending remaining L2 node: ${l2[j].val}`, pLines, opName, {}, [], [], [], `Merged: [${merged.map(n => n.val).join(', ')}]`));
            j++;
        }

        frames.push(createFrame(merged, merged.map(n => n.id), [{ id: merged[0].id, label: 'HEAD', color: 'green' }], 10, "Merge complete", pLines, opName, {}, [], [], [], `Merged: [${merged.map(n => n.val).join(', ')}]`));
        return { endNodes: merged, timeline: frames };
    };

    const generateRemoveCycle = () => {
        const opName = 'removeCycle';
        const pLines = PSEUDOCODE.removeCycle;
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [], 0, "Starting Remove Cycle. First, detecting cycle using Floyd's algorithm.", pLines, opName, {}, [], [], [], "Phase 1: Detect Cycle"));

        if (currentNodes.length <= 1) {
            frames.push(createFrame(currentNodes, [], [], 0, "List too short to have a cycle", pLines, opName, {}, [], [], [], "No Cycle"));
            return { endNodes: currentNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [currentNodes[0].id], [{ id: currentNodes[0].id, label: 'slow', color: 'primary' }, { id: currentNodes[0].id, label: 'fast', color: 'secondary' }], 1, `Initializing slow and fast at head`, pLines, opName, {}, [], [], [], "Pointers Ready"));

        let slowIdx = 0;
        let fastIdx = 0;
        let cycleDetected = false;

        // Simulate slow/fast traversal
        for (let step = 0; step < currentNodes.length; step++) {
            slowIdx = (slowIdx + 1) % currentNodes.length;
            fastIdx = (fastIdx + 2) % currentNodes.length;
            frames.push(createFrame(currentNodes, [currentNodes[slowIdx].id, currentNodes[fastIdx].id], [{ id: currentNodes[slowIdx].id, label: 'slow', color: 'primary' }, { id: currentNodes[fastIdx].id, label: 'fast', color: 'secondary' }], 2, `Slow→${currentNodes[slowIdx].val}, Fast→${currentNodes[fastIdx].val}`, pLines, opName, {}, [], [], [], `Slow: ${currentNodes[slowIdx].val}, Fast: ${currentNodes[fastIdx].val}`));
            if (slowIdx === fastIdx) { cycleDetected = true; break; }
        }

        if (!cycleDetected) {
            frames.push(createFrame(currentNodes, [], [], 0, "No cycle detected in this linear list", pLines, opName, {}, [], [], [], "Result: No Cycle Found"));
            return { endNodes: currentNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [currentNodes[slowIdx].id, currentNodes[fastIdx].id], [{ id: currentNodes[slowIdx].id, label: 'meet', color: 'red' }], 4, `Cycle detected! slow and fast met at node ${currentNodes[slowIdx].val}`, pLines, opName, {}, [], [], [], "Cycle Detected!"));

        // Phase 2: Find entry
        slowIdx = 0;
        frames.push(createFrame(currentNodes, [currentNodes[slowIdx].id, currentNodes[fastIdx].id], [{ id: currentNodes[slowIdx].id, label: 'slow', color: 'primary' }, { id: currentNodes[fastIdx].id, label: 'fast', color: 'secondary' }], 6, `Resetting slow to head to find cycle entry`, pLines, opName, {}, [], [], [], "Phase 2: Find Entry"));

        while (slowIdx !== fastIdx) {
            slowIdx = (slowIdx + 1) % currentNodes.length;
            fastIdx = (fastIdx + 1) % currentNodes.length;
            frames.push(createFrame(currentNodes, [currentNodes[slowIdx].id, currentNodes[fastIdx].id], [{ id: currentNodes[slowIdx].id, label: 'slow', color: 'primary' }, { id: currentNodes[fastIdx].id, label: 'fast', color: 'secondary' }], 7, `Moving both one step at a time`, pLines, opName, {}, [], [], [], `Slow: ${currentNodes[slowIdx].val}, Fast: ${currentNodes[fastIdx].val}`));
        }

        frames.push(createFrame(currentNodes, [currentNodes[slowIdx].id], [{ id: currentNodes[slowIdx].id, label: 'entry', color: 'orange' }], 7, `Cycle entry point: node ${currentNodes[slowIdx].val}`, pLines, opName, {}, [], [], [], `Cycle Entry: ${currentNodes[slowIdx].val}`));

        // Phase 3: Find end of cycle and remove
        const cycleEntryIdx = slowIdx;
        let tailIdx = cycleEntryIdx;
        while ((tailIdx + 1) % currentNodes.length !== cycleEntryIdx) {
            tailIdx = (tailIdx + 1) % currentNodes.length;
            frames.push(createFrame(currentNodes, [currentNodes[tailIdx].id], [{ id: currentNodes[tailIdx].id, label: 'tail', color: 'primary' }, { id: currentNodes[cycleEntryIdx].id, label: 'entry', color: 'orange' }], 9, `Advancing to find the last node of the cycle`, pLines, opName, {}, [], [], [], `Checking: ${currentNodes[tailIdx].val}`));
        }

        frames.push(createFrame(currentNodes, [currentNodes[tailIdx].id], [{ id: currentNodes[tailIdx].id, label: 'tail', color: 'red' }], 10, `Found cycle's last node ${currentNodes[tailIdx].val}. Removing the cycle by setting tail.next = null`, pLines, opName, {}, [], [{ from: currentNodes[tailIdx].id, to: 'null', color: 'red' }], [], "Cycle Removed"));
        frames.push(createFrame(currentNodes, [], [{ id: currentNodes[0].id, label: 'HEAD', color: 'green' }], 10, "Cycle successfully removed. List is now linear.", pLines, opName, {}, [], [], [], "Result: No Cycle ✓"));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateFeatureComingSoon = (opName: string, title?: string) => {
        const pLines = ["// Feature coming soon in the next update!"];
        const frames = [createFrame([...initialNodes], [], [], 0, `${title || opName} is currently in development!`, pLines, opName, {}, [], [], [], "This feature is coming soon.")];
        return { endNodes: [...initialNodes], timeline: frames };
    };



    // --- Actions ---
    const runAction = (actionId: string) => {
        setError(null);
        let res;

        const val = parseInt(inputValue);
        const idx = parseInt(inputIndex);

        switch (actionId) {
            case 'createEmpty':
                res = generateCreateFrames([]);
                break;
            case 'createRandom':
                {
                    const size = parseInt(createSize) || 5;
                    const vals = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
                    setCreateInput(vals.join(', '));
                    res = generateCreateFrames(vals);
                }
                break;
            case 'initFromArray':
                {
                    const vals = createInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
                    if (vals.length > MAX_NODES) { setError(`Max ${MAX_NODES}`); return; }
                    res = generateCreateFrames(vals);
                }
                break;
            case 'clearList':
                res = generateDeleteList();
                break;
            case 'convertToArray':
                res = generateConvertToArray();
                break;

            // Traversal
            case 'iterativeTraversal':
                res = generateSearchFrames(-9999); // Will traverse whole list
                break;
            case 'showLength':
                res = generateShowLength();
                break;
            case 'findMiddle':
                res = generateFindMiddle();
                break;
            case 'recursiveTraversal':
                res = generateRecursiveTraversal();
                break;
            case 'reverseTraversal':
                res = generateReverseTraversal();
                break;

            // Insertion
            case 'insertHead':
                if (isNaN(val)) { setError("Invalid Value"); return; }
                if (initialNodes.length >= MAX_NODES) { setError("List Full"); return; }
                res = generateInsertHeadFrames(val);
                break;
            case 'insertTail':
                if (isNaN(val)) { setError("Invalid Value"); return; }
                if (initialNodes.length >= MAX_NODES) { setError("List Full"); return; }
                res = generateInsertTailFrames(val);
                break;
            case 'insertPosition':
                if (isNaN(val)) { setError("Invalid Value"); return; }
                if (initialNodes.length >= MAX_NODES) { setError("List Full"); return; }
                if (isNaN(idx) || idx < 0 || idx > initialNodes.length) { setError("Bad Index"); return; }
                res = generateInsertIndexFrames(idx, val);
                break;
            case 'insertAfterValue':
                if (isNaN(val) || isNaN(idx)) { setError("Invalid Inputs: Need Val and Target"); return; }
                if (initialNodes.length >= MAX_NODES) { setError("List Full"); return; }
                res = generateInsertAfterValue(idx, val); // idx represents target input box
                break;
            case 'insertBeforeValue':
                if (isNaN(val) || isNaN(idx)) { setError("Invalid Inputs: Need Val and Target"); return; }
                if (initialNodes.length >= MAX_NODES) { setError("List Full"); return; }
                res = generateInsertBeforeValue(idx, val); // idx represents target input box
                break;
            case 'sortedInsert':
                if (isNaN(val)) { setError("Invalid Value"); return; }
                res = generateSortedInsert(val);
                break;

            // Deletion
            case 'deleteHead':
                if (initialNodes.length === 0) { setError("List Empty"); return; }
                res = generateRemoveHeadFrames();
                break;
            case 'deleteTail':
                if (initialNodes.length === 0) { setError("List Empty"); return; }
                res = generateRemoveTailFrames();
                break;
            case 'deletePosition':
                if (initialNodes.length === 0) { setError("List Empty"); return; }
                if (isNaN(idx) || idx < 0 || idx >= initialNodes.length) { setError("Bad Index"); return; }
                res = generateRemoveIndexFrames(idx);
                break;
            case 'deleteList':
                res = generateDeleteList();
                break;
            case 'deleteByValue':
                if (isNaN(val)) { setError("Invalid Value"); return; }
                res = generateDeleteByValue(val);
                break;
            case 'deleteAllOccurrences':
                if (isNaN(val)) { setError("Invalid Value"); return; }
                res = generateDeleteAllOccurrences(val);
                break;

            // Searching
            case 'linearSearch':
                if (isNaN(val)) { setError("Invalid Value"); return; }
                res = generateSearchFrames(val);
                break;
            case 'countOccurrences':
                if (isNaN(val)) { setError("Invalid Value"); return; }
                res = generateCountOccurrences(val);
                break;
            case 'findMiddleNode':
                res = generateFindMiddle();
                break;
            case 'findNthNode':
                if (isNaN(idx)) { setError("Invalid Index"); return; }
                res = generateFindNthNode(idx);
                break;
            case 'findNthFromEnd':
                if (isNaN(idx)) { setError("Invalid N"); return; }
                res = generateFindNthFromEnd(idx);
                break;

            // Advanced / Special
            case 'reverseList':
                res = generateReverseList();
                break;
            case 'detectCycle':
                res = generateDetectCycle();
                break;
            case 'rotateList':
                if (isNaN(idx)) { setError("Invalid Value (k)"); return; }
                res = generateRotateList(idx);
                break;
            case 'reverseInKGroups':
                if (isNaN(val) || val < 2) { setError("K must be >= 2"); return; }
                res = generateReverseInKGroups(val);
                break;
            case 'checkPalindrome':
                res = generateCheckPalindrome();
                break;
            case 'mergeTwoLists':
                res = generateMergeTwoLists();
                break;
            case 'removeCycle':
                res = generateRemoveCycle();
                break;
            case 'oddEvenRearrange':
                res = generateOddEvenRearrange();
                break;
            case 'swapNodesPairwise':
                res = generateSwapNodesPairwise();
                break;
            default:
                res = generateFeatureComingSoon(actionId);
                break;
        }

        if (res) {
            dispatchAnimation(res);
        }
    };

    const handleExample = () => {
        if (mode === 'apps') {
            setInputValue("42");
            setInputIndex("2");
        } else {
            const currentSize = initialNodes.length;
            const validSize = currentSize > 0 ? currentSize : 5;
            const vals = Array.from({ length: validSize }, () => Math.floor(Math.random() * 99) + 1);
            const nodes: ListNode[] = vals.map(v => ({ id: generateId(), val: v }));
            setInitialNodes(nodes);
            setCreateInput(vals.join(', '));
            setCreateSize(validSize.toString());
            setFrames([createFrame(nodes, [], [], 0, "Example List Loaded", PSEUDOCODE.create, "create")]);
            setCurrentStep(0);
            setIsPlaying(false);
        }
    };

    const handleImport = (arr: number[]) => {
        const vals = arr.slice(0, MAX_NODES);
        const result = generateCreateFrames(vals);
        dispatchAnimation(result);
        setIsPlaying(false);
    };

    const handleCanvasAdd = () => {
        if (initialNodes.length >= MAX_NODES) { setError(`Max capacity ${MAX_NODES} reached`); return; }
        const newNode: ListNode = { id: generateId(), val: Math.floor(Math.random() * 99) + 1 };
        const nodes = [...initialNodes, newNode];
        setInitialNodes(nodes);
        setFrames([createFrame(nodes, [newNode.id], [], 0, "Node Added", [], "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasDelete = (index: number) => {
        const nodes = initialNodes.filter((_, i) => i !== index);
        setInitialNodes(nodes);
        setFrames([createFrame(nodes, [], [], 0, "Node Removed", [], "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasUpdate = (index: number, val: number) => {
        const nodes = [...initialNodes];
        nodes[index] = { ...nodes[index], val };
        setInitialNodes(nodes);
        setFrames([createFrame(nodes, [nodes[index].id], [], 0, "Node Updated", [], "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasClear = () => {
        setInitialNodes([]);
        setFrames([createFrame([], [], [], 0, "List Cleared", [], "None")]);
        setCurrentStep(0);
        setError(null);
    };

    // --- Playback Effect (Updated for AI Narration & TTS) ---
    useEffect(() => {
        let isActive = true;

        const playNextStep = async () => {
            if (!isPlaying || currentStep >= frames.length || !isActive) return;

            const frame = frames[currentStep];
            const textToSpeak = frame.narration || frame.description;

            if (isNarrationEnabled && textToSpeak) {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);

                // JARVIS Voice Selection
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    let validVoices = voices.filter(v => v.lang === 'en-GB');
                    if (validVoices.length === 0) validVoices = voices.filter(v => v.lang.startsWith('en'));

                    const maleKeywords = ['male', 'man', 'boy', 'david', 'mark', 'daniel', 'george', 'arthur', 'ryan'];
                    let selectedVoice = validVoices.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));

                    if (!selectedVoice) {
                        const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'samantha', 'victoria', 'karen', 'tessa', 'melina', 'monica', 'paulina', 'luciana', 'amelie', 'marie', 'anna', 'helena', 'veena', 'lekha', 'hazel'];
                        selectedVoice = validVoices.find(v => !femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
                    }

                    if (selectedVoice) utterance.voice = selectedVoice;
                }

                utterance.rate = 1.1 * playbackSpeed;
                utterance.pitch = 1.0;
                utterance.lang = 'en-GB';

                utterance.onend = () => {
                    if (!isActive) return;
                    if (currentStep < frames.length - 1) {
                        setCurrentStep(s => s + 1);
                    } else {
                        setIsPlaying(false);
                    }
                };

                utterance.onerror = (e) => {
                    console.error("Speech error:", e);
                    setTimeout(() => {
                        if (isActive) {
                            if (currentStep < frames.length - 1) setCurrentStep(s => s + 1);
                            else setIsPlaying(false);
                        }
                    }, 1000 / playbackSpeed);
                };

                window.speechSynthesis.speak(utterance);
            } else {
                // Fallback for no audio
                timerRef.current = window.setTimeout(() => {
                    if (isActive) {
                        if (currentStep < frames.length - 1) setCurrentStep(s => s + 1);
                        else setIsPlaying(false);
                    }
                }, 1000 / playbackSpeed);
            }
        };

        playNextStep();

        return () => {
            isActive = false;
            window.speechSynthesis.cancel();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, currentStep, frames, playbackSpeed, isNarrationEnabled]);

    const currentFrame = frames[currentStep] || {
        nodes: initialNodes, highlights: [], pointers: [], codeLine: -1, description: "Ready",
        listType, pseudoLines: [], opName: '', opValues: {}, visited: [], output: ''
    };

    return {
        // State
        mode,
        frames,
        currentStep,
        isPlaying,
        playbackSpeed,
        activeOp,
        error,
        createInput,
        createStep,
        createSize,
        inputValue,
        inputIndex,
        listType,
        initialNodes,
        currentFrame,
        isNarrationEnabled,
        isGeneratingNarration,

        // Setters
        setMode,
        setIsPlaying,
        setCurrentStep,
        setPlaybackSpeed,
        setIsNarrationEnabled,
        setActiveOp,
        setCreateInput,
        setCreateStep,
        setCreateSize,
        setInputValue,
        setInputIndex,
        setListType,

        // Handlers
        runAction,
        handleExample,
        handleImport,
        handleCanvasAdd,
        handleCanvasDelete,
        handleCanvasUpdate,
        handleCanvasClear
    };
};
