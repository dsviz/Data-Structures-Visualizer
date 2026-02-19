
import { useState, useRef, useEffect } from 'react';

// --- Types ---
export type Operation = 'create' | 'insert' | 'remove' | 'search' | null;
export type ListType = 'singly' | 'doubly' | 'circular';

export interface Pointer {
    index: number;
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
    offsetIndex?: number;
}

export interface TempArrow {
    from: 'temp' | number; // 'temp' refers to the unique temp node (simplification), or index in main list
    to: 'temp' | number | 'null'; // target index, temp node, or null
    label?: string;
    curved?: boolean;
    color?: string;
}

export interface Frame {
    nodes: number[];
    highlights: number[];
    pointers: Pointer[];
    codeLine: number;
    description: string;
    listType: ListType;
    pseudoLines: string[]; // Store relevant pseudocode lines for this op
    opName: string;
    opValues?: { [key: string]: string | number }; // For dynamic code replacement
    tempNodes?: TempNode[];
    tempArrows?: TempArrow[];
}

// --- Constants ---
export const MAX_NODES = 20;
export const DEFAULT_NODES = [12, 45, 99];
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
    ]
};

// --- Complexity Data ---
export const COMPLEXITY = {
    insertHead: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    insertTail: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' }, // assuming tail pointer
    insertIndex: { best: 'O(1)', avg: 'O(N)', worst: 'O(N)', space: 'O(1)' },
    removeHead: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    removeTail: { best: 'O(N)', avg: 'O(N)', worst: 'O(N)', space: 'O(1)' }, // O(N) for singly list
    removeIndex: { best: 'O(1)', avg: 'O(N)', worst: 'O(N)', space: 'O(1)' },
    search: { best: 'O(1)', avg: 'O(N)', worst: 'O(N)', space: 'O(1)' },
    create: { best: 'O(N)', avg: 'O(N)', worst: 'O(N)', space: 'O(N)' }
};

export const useLinkedListVisualizer = () => {
    // --- State ---
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [initialNodes, setInitialNodes] = useState<number[]>(DEFAULT_NODES);
    const [listType, setListType] = useState<ListType>('singly');

    // UI State
    const [mode, setMode] = useState<'standard' | 'apps'>('standard');
    const [activeOp, setActiveOp] = useState<Operation>(null);
    const [error, setError] = useState<string | null>(null);

    // Inputs
    const [createInput, setCreateInput] = useState('');
    const [createStep, setCreateStep] = useState<'size' | 'values'>('size');
    const [createSize, setCreateSize] = useState('5');
    const [inputValue, setInputValue] = useState('');
    const [inputIndex, setInputIndex] = useState('');

    const timerRef = useRef<number | null>(null);

    // --- Generator Helpers ---
    const createFrame = (nodes: number[], highlights: number[], pointers: Pointer[], line: number, desc: string, pLines: string[], opName: string, opValues?: { [key: string]: string | number }, tempNodes: TempNode[] = [], tempArrows: TempArrow[] = []): Frame => ({
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
        tempArrows
    });

    const generateCreateFrames = (vals: number[]) => {
        const opName = 'create';
        const pLines = PSEUDOCODE.create;
        const frames: Frame[] = [];
        let currentNodes: number[] = [];

        // 0: Init
        frames.push(createFrame([], [], [], 0, "head = null, tail = null", pLines, opName));

        for (let i = 0; i < vals.length; i++) {
            const val = vals[i];
            const opValues = { val };
            // 1: Loop
            frames.push(createFrame(currentNodes, [], [], 1, `Process val: ${val}`, pLines, opName));

            // 2: Create Node
            frames.push(createFrame(currentNodes, [], [{ index: -1, label: `New(${val})`, color: 'blue' }], 2, "v = new Node(val)", pLines, opName, opValues));

            if (currentNodes.length === 0) {
                // 3: Head check (true)
                currentNodes = [val];
                frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 3, "head = v", pLines, opName, opValues));
            } else {
                // 4: Tail next
                const lastIdx = currentNodes.length - 1;
                frames.push(createFrame(currentNodes, [lastIdx], [{ index: lastIdx, label: 'TAIL', color: 'green' }], 4, "tail.next = v", pLines, opName, opValues));

                currentNodes = [...currentNodes, val];
            }

            // 5: Update Tail
            frames.push(createFrame(currentNodes, [currentNodes.length - 1], [{ index: currentNodes.length - 1, label: 'TAIL', color: 'green' }], 5, "tail = v", pLines, opName, opValues));
        }

        return { endNodes: currentNodes, timeline: frames };
    };

    const run = (res: { endNodes: number[], timeline: Frame[] }) => {
        setFrames(res.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
        setInitialNodes(res.endNodes);
    };

    // --- Generators with Pseudocode Mapping ---
    const generateInsertHeadFrames = (val: number) => {
        const opName = 'insertHead';
        const pLines = PSEUDOCODE.insertHead;
        const opValues = { val };
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [], 0, `Create node ${val}`, pLines, opName, opValues,
            [{ val, label: 'NEW', color: 'blue', position: 'left-of-head', id: 'new' }]
        ));

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 1, "Link v.next to Head", pLines, opName, opValues,
            [{ val, label: 'NEW', color: 'blue', position: 'left-of-head', id: 'new' }],
            [{ from: 'temp', to: 0, color: 'blue', label: 'next' }]
        ));

        const newNodes = [val, ...currentNodes];
        frames.push(createFrame(newNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 0, "Update Head = v", pLines, opName, opValues));

        frames.push(createFrame(newNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 2, "Update Head = v", pLines, opName, opValues));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateInsertTailFrames = (val: number) => {
        const opName = 'insertTail';
        const pLines = PSEUDOCODE.insertTail;
        const opValues = { val };
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [], 0, `Create node ${val}`, pLines, opName, opValues,
            [{ val, label: 'NEW', color: 'green', position: 'right-of-tail', id: 'new' }]
        ));

        const lastIdx = currentNodes.length - 1;
        if (currentNodes.length > 0) {
            frames.push(createFrame(currentNodes, [lastIdx], [{ index: lastIdx, label: 'TAIL', color: 'green' }], 1, "Tail.next = v", pLines, opName, opValues,
                [{ val, label: 'NEW', color: 'green', position: 'right-of-tail', id: 'new' }],
                [{ from: lastIdx, to: 'temp', color: 'green' }]
            ));
        }

        const newNodes = [...currentNodes, val];
        frames.push(createFrame(newNodes, [newNodes.length - 1], [{ index: newNodes.length - 1, label: 'TAIL', color: 'green' }], 2, "Update Tail = v", pLines, opName, opValues));
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

        frames.push(createFrame(currentNodes, [], [], 0, "Create Node v", pLines, opName, opValues,
            [{ val, label: 'NEW', color: 'blue', position: 'above-at-index', offsetIndex: idx, id: 'new' }]
        ));

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 1, "curr = head", pLines, opName, opValues,
            [{ val, label: 'NEW', color: 'blue', position: 'above-at-index', offsetIndex: idx, id: 'new' }]
        ));

        for (let i = 0; i < idx - 1; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 2, `i=${i} < ${idx - 1}`, pLines, opName, opValues,
                [{ val, label: 'NEW', color: 'blue', position: 'above-at-index', offsetIndex: idx, id: 'new' }]
            ));
            frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 3, "curr = curr.next", pLines, opName, opValues,
                [{ val, label: 'NEW', color: 'blue', position: 'above-at-index', offsetIndex: idx, id: 'new' }]
            ));
        }

        // Link v.next -> curr.next
        frames.push(createFrame(currentNodes, [idx - 1], [{ index: idx - 1, label: 'CURR', color: 'primary' }], 4, "v.next = curr.next", pLines, opName, opValues,
            [{ val, label: 'NEW', color: 'blue', position: 'above-at-index', offsetIndex: idx, id: 'new' }],
            [{ from: 'temp', to: idx, color: 'blue' }]
        ));

        // Link curr.next -> v
        frames.push(createFrame(currentNodes, [idx - 1], [{ index: idx - 1, label: 'CURR', color: 'primary' }], 5, "curr.next = v", pLines, opName, opValues,
            [{ val, label: 'NEW', color: 'blue', position: 'above-at-index', offsetIndex: idx, id: 'new' }],
            [{ from: 'temp', to: idx, color: 'blue' }, { from: idx - 1, to: 'temp', color: 'primary' }]
        ));

        const newNodes = [...currentNodes];
        newNodes.splice(idx, 0, val);
        frames.push(createFrame(newNodes, [idx], [{ index: idx - 1, label: 'CURR', color: 'primary' }, { index: idx, label: 'NEW', color: 'blue' }], 5, "Done", pLines, opName, opValues));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateRemoveHeadFrames = () => {
        const opName = 'removeHead';
        const pLines = PSEUDOCODE.removeHead;
        if (initialNodes.length === 0) return { endNodes: [], timeline: [] };

        const frames = [createFrame(initialNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 0, "Check Head", pLines, opName)];
        frames.push(createFrame(initialNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 1, "Head = Head.next", pLines, opName, {}, [], [{ from: 'temp', to: 1, color: 'red', curved: true, label: 'skip' }])); // abstract

        const newNodes = initialNodes.slice(1);
        frames.push(createFrame(newNodes, [], [], 2, "Removed old head", pLines, opName));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateRemoveTailFrames = () => {
        const opName = 'removeTail';
        const pLines = PSEUDOCODE.removeTail;
        if (initialNodes.length === 0) return { endNodes: [], timeline: [] };
        if (initialNodes.length === 1) return generateRemoveHeadFrames();

        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 1, "curr = head", pLines, opName));

        let curr = 0;
        while (curr < currentNodes.length - 2) {
            frames.push(createFrame(currentNodes, [curr], [{ index: curr, label: 'CURR', color: 'primary' }], 2, "curr.next != tail", pLines, opName));
            curr++;
            frames.push(createFrame(currentNodes, [curr], [{ index: curr, label: 'CURR', color: 'primary' }], 3, "curr = curr.next", pLines, opName));
        }

        frames.push(createFrame(currentNodes, [curr], [{ index: curr, label: 'CURR', color: 'primary' }], 2, "curr.next == tail (Found)", pLines, opName));

        const newNodes = initialNodes.slice(0, -1);
        frames.push(createFrame(currentNodes, [curr], [{ index: curr, label: 'TAIL', color: 'green' }], 4, "curr.next = null", pLines, opName, {}, [], [{ from: curr, to: 'null', color: 'red' }]));

        frames.push(createFrame(newNodes, [curr], [{ index: curr, label: 'TAIL', color: 'green' }], 5, "tail = curr", pLines, opName));
        return { endNodes: newNodes, timeline: frames };
    };

    const generateRemoveIndexFrames = (idx: number) => {
        const opName = 'removeIndex';
        const pLines = PSEUDOCODE.removeIndex;
        const opValues = { index: idx };
        if (idx === 0) return generateRemoveHeadFrames();
        if (idx >= initialNodes.length - 1) return generateRemoveTailFrames();

        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 0, "curr = head", pLines, opName, opValues));

        for (let i = 0; i < idx - 1; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 1, `i=${i} < ${idx - 1}`, pLines, opName, opValues));
            frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 2, "curr = curr.next", pLines, opName, opValues));
        }

        // Bypass
        frames.push(createFrame(currentNodes, [idx - 1], [{ index: idx - 1, label: 'CURR', color: 'primary' }], 3, "curr.next = curr.next.next", pLines, opName, opValues,
            [],
            [{ from: idx - 1, to: idx + 1, color: 'red', curved: true }]
        ));

        const newNodes = [...initialNodes];
        newNodes.splice(idx, 1);

        frames.push(createFrame(newNodes, [idx - 1], [{ index: idx - 1, label: 'CURR', color: 'primary' }], 3, "Removed Node", pLines, opName, opValues));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateSearchFrames = (target: number) => {
        const opName = 'search';
        const pLines = PSEUDOCODE.search;
        const opValues = { target };
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 0, "curr = head", pLines, opName, opValues));

        for (let i = 0; i < currentNodes.length; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 1, "while curr != null", pLines, opName, opValues));
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 2, `val ${currentNodes[i]} == ${target}?`, pLines, opName, opValues));

            if (currentNodes[i] === target) {
                return { endNodes: currentNodes, timeline: [...frames, createFrame(currentNodes, [i], [{ index: i, label: 'FOUND', color: 'green' }], 1, "Found match", pLines, opName, opValues)] };
            }

            if (i < currentNodes.length - 1) {
                frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 3, "curr = curr.next", pLines, opName, opValues));
            }
        }

        frames.push(createFrame(currentNodes, [], [], 1, "while curr == null", pLines, opName, opValues));
        frames.push(createFrame(currentNodes, [], [], 4, "return false", pLines, opName, opValues));
        return { endNodes: currentNodes, timeline: frames };
    };

    // --- Actions ---
    const handleCreate = () => {
        const vals = createInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
        if (vals.length > MAX_NODES) return setError(`Max ${MAX_NODES}`);

        const res = generateCreateFrames(vals);
        run(res);
        setIsPlaying(true);
        setCreateStep('size');
        setError(null);
    };

    const handleCreateRandom = () => {
        const size = parseInt(createSize) || 5;
        const vals = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
        setCreateInput(vals.join(', '));

        const res = generateCreateFrames(vals);
        run(res);
        setIsPlaying(true);
        setCreateStep('size');
    };

    const handleInsert = (type: 'head' | 'tail' | 'index') => {
        const val = parseInt(inputValue);
        if (isNaN(val)) return setError("Invalid Value");
        if (initialNodes.length >= MAX_NODES) return setError("Full");

        let res;
        if (type === 'head') res = generateInsertHeadFrames(val);
        else if (type === 'tail') res = generateInsertTailFrames(val);
        else {
            const idx = parseInt(inputIndex);
            if (isNaN(idx) || idx < 0 || idx > initialNodes.length) return setError("Bad Index");
            res = generateInsertIndexFrames(idx, val);
        }
        run(res);
        setError(null);
    };

    const handleRemove = (type: 'head' | 'tail' | 'index') => {
        if (initialNodes.length === 0) return setError("Empty");

        let res;
        if (type === 'head') res = generateRemoveHeadFrames();
        else if (type === 'tail') res = generateRemoveTailFrames();
        else {
            const idx = parseInt(inputIndex);
            if (isNaN(idx) || idx < 0 || idx >= initialNodes.length) return setError("Bad Index");
            res = generateRemoveIndexFrames(idx);
        }
        run(res);
        setError(null);
    };

    const handleSearch = () => {
        const val = parseInt(inputValue);
        if (isNaN(val)) return setError("Invalid Value");
        run(generateSearchFrames(val));
        setError(null);
    };

    // --- Playback Effect ---
    useEffect(() => {
        if (isPlaying && frames.length > 0) {
            timerRef.current = window.setInterval(() => {
                setCurrentStep(p => {
                    if (p < frames.length - 1) return p + 1;
                    setIsPlaying(false);
                    return p;
                });
            }, 1000 / playbackSpeed);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying, frames.length, playbackSpeed]);

    const currentFrame = frames[currentStep] || {
        nodes: initialNodes, highlights: [], pointers: [], codeLine: -1, description: "Ready",
        listType, pseudoLines: [], opName: '', opValues: {}
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

        // Setters
        setMode,
        setIsPlaying,
        setCurrentStep,
        setPlaybackSpeed,
        setActiveOp,
        setCreateInput,
        setCreateStep,
        setCreateSize,
        setInputValue,
        setInputIndex,
        setListType,

        // Handlers
        handleCreate,
        handleCreateRandom,
        handleInsert,
        handleRemove,
        handleSearch
    };
};
