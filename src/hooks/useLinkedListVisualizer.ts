
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
    visited?: number[];
    output?: string;
}

// --- Constants ---
export const MAX_NODES = 20;
export const DEFAULT_NODES = [12, 45, 99, 33, 42, 57];
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
    const createFrame = (nodes: number[], highlights: number[], pointers: Pointer[], line: number, desc: string, pLines: string[], opName: string, opValues?: { [key: string]: string | number }, tempNodes: TempNode[] = [], tempArrows: TempArrow[] = [], visited?: number[], output?: string): Frame => ({
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
        const isTraversal = target === -9999;
        const opName = isTraversal ? 'iterativeTraversal' : 'search';
        const pLines = PSEUDOCODE.search;
        const opValues: Record<string, string | number> = isTraversal ? {} : { target };
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        const visited: number[] = [];
        let output = isTraversal ? "Start traversal: " : "";

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 0, "curr = head", pLines, opName, opValues, [], [], [...visited], output));

        for (let i = 0; i < currentNodes.length; i++) {
            visited.push(currentNodes[i]);
            output += (i > 0 ? " -> " : "") + currentNodes[i];

            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 1, "while curr != null", pLines, opName, opValues, [], [], [...visited], output));

            if (!isTraversal) {
                frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 2, `val ${currentNodes[i]} == ${target}?`, pLines, opName, opValues, [], [], [...visited], output));

                if (currentNodes[i] === target) {
                    return { endNodes: currentNodes, timeline: [...frames, createFrame(currentNodes, [i], [{ index: i, label: 'FOUND', color: 'green' }], 1, "Found match", pLines, opName, opValues, [], [], [...visited], output + " (Found!)")] };
                }
            }

            if (i < currentNodes.length - 1) {
                frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 3, "curr = curr.next", pLines, opName, opValues, [], [], [...visited], output));
            }
        }

        frames.push(createFrame(currentNodes, [], [], 1, "while curr == null", pLines, opName, opValues, [], [], [...visited], output));
        frames.push(createFrame(currentNodes, [], [], 4, isTraversal ? "Traversal Complete" : "return false", pLines, opName, opValues, [], [], [...visited], isTraversal ? output + " -> null" : output + " (Not Found)"));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateConvertToArray = () => {
        const opName = 'convertToArray';
        const pLines = ["arr = []", "curr = head", "while curr != null", "  arr.push(curr.val)", "  curr = curr.next", "return arr"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        let arr: number[] = [];
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List is empty", pLines, opName, {}, [], [], [], "[]")] };

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 1, "curr = head", pLines, opName, {}, [], [], [], "[]"));
        for (let i = 0; i < currentNodes.length; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 2, "while curr != null", pLines, opName, {}, [], [], [], JSON.stringify(arr)));
            arr.push(currentNodes[i]);
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 3, "arr.push(curr.val)", pLines, opName, {}, [], [], [], JSON.stringify(arr)));
            if (i < currentNodes.length - 1) frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 4, "curr = curr.next", pLines, opName, {}, [], [], [], JSON.stringify(arr)));
        }
        frames.push(createFrame(currentNodes, [], [], 5, "return arr", pLines, opName, {}, [], [], [], "Final Array: " + JSON.stringify(arr)));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateShowLength = () => {
        const opName = 'showLength';
        const pLines = ["count = 0", "curr = head", "while curr != null", "  count++", "  curr = curr.next", "return count"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        let count = 0;
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List is empty", pLines, opName, {}, [], [], [], "0")] };

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 1, "curr = head", pLines, opName, {}, [], [], [], `count = ${count}`));
        for (let i = 0; i < currentNodes.length; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 2, "while curr != null", pLines, opName, {}, [], [], [], `count = ${count}`));
            count++;
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 3, "count++", pLines, opName, {}, [], [], [], `count = ${count}`));
            if (i < currentNodes.length - 1) frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 4, "curr = curr.next", pLines, opName, {}, [], [], [], `count = ${count}`));
        }
        frames.push(createFrame(currentNodes, [], [], 5, "return count", pLines, opName, {}, [], [], [], `Final Length: ${count}`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateDeleteList = () => {
        const opName = 'deleteList';
        const pLines = ["head = null", "tail = null"];
        const frames: Frame[] = [];
        frames.push(createFrame([...initialNodes], [], [], 0, "head = null", pLines, opName));
        frames.push(createFrame([], [], [], 1, "List cleared", pLines, opName));
        return { endNodes: [], timeline: frames };
    };

    const generateReverseList = () => {
        const opName = 'reverseList';
        const pLines = ["prev = null, curr = head", "while curr != null", "  nextTemp = curr.next", "  curr.next = prev", "  prev = curr", "  curr = nextTemp", "head = prev"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "Empty list", pLines, opName)] };

        frames.push(createFrame([...currentNodes], [0], [{ index: 0, label: 'curr', color: 'primary' }], 0, "prev = null, curr = head", pLines, opName));

        for (let i = 0; i < currentNodes.length; i++) {
            frames.push(createFrame([...currentNodes], [i], [{ index: i, label: 'curr', color: 'primary' }, ...(i > 0 ? [{ index: i - 1, label: 'prev', color: 'green' }] : [])], 1, "while curr != null", pLines, opName));
        }

        const finalNodes = [...currentNodes].reverse();
        frames.push(createFrame([...finalNodes], [], [], 6, "head = prev (Reversed!)", pLines, opName));
        return { endNodes: finalNodes, timeline: frames };
    };

    const generateFindMiddle = () => {
        const opName = 'findMiddle';
        const pLines = ["slow = head, fast = head", "while fast != null && fast.next != null", "  slow = slow.next", "  fast = fast.next.next", "return slow"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "Empty List", pLines, opName)] };

        let slow = 0, fast = 0;
        frames.push(createFrame(currentNodes, [0], [{ index: slow, label: 'slow=fast', color: 'blue' }], 0, "slow = fast = head", pLines, opName));

        while (fast + 1 < currentNodes.length && fast + 2 < currentNodes.length) {
            frames.push(createFrame(currentNodes, [slow], [{ index: slow, label: 'slow', color: 'blue' }, { index: fast, label: 'fast', color: 'orange' }], 1, "while fast && fast.next", pLines, opName));
            slow++;
            fast += 2;
            frames.push(createFrame(currentNodes, [slow], [{ index: slow, label: 'slow', color: 'blue' }, { index: fast, label: 'fast', color: 'orange' }], 2, "slow = slow.next; fast = fast.next.next", pLines, opName));
        }

        frames.push(createFrame(currentNodes, [slow], [{ index: slow, label: 'FOUND', color: 'green' }], 4, `Mid is at index ${slow}`, pLines, opName));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateCountOccurrences = (target: number) => {
        const opName = 'countOccurrences';
        const pLines = ["count = 0", "curr = head", "while curr != null", "  if curr.val == target", "    count++", "  curr = curr.next", "return count"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        let count = 0;

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 1, "curr = head", pLines, opName, { target }, [], [], [], `count = ${count}`));

        for (let i = 0; i < currentNodes.length; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 2, "while curr != null", pLines, opName, { target }, [], [], [], `count = ${count}`));
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 3, "if curr.val == target", pLines, opName, { target }, [], [], [], `count = ${count}`));

            if (currentNodes[i] === target) {
                count++;
                frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'MATCH', color: 'green' }], 4, "count++", pLines, opName, { target }, [], [], [], `count = ${count}`));
            }
            if (i < currentNodes.length - 1) frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 5, "curr = curr.next", pLines, opName, { target }, [], [], [], `count = ${count}`));
        }
        frames.push(createFrame(currentNodes, [], [], 6, "return count", pLines, opName, { target }, [], [], [], `Final Count: ${count}`));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateDeleteByValue = (target: number) => {
        const opName = 'deleteByValue';
        const pLines = ["if head == null return", "if head.val == target: head = head.next", "curr = head", "while curr.next != null", "  if curr.next.val == target", "    curr.next = curr.next.next", "  else curr = curr.next"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List Empty", pLines, opName, { target })] };

        if (currentNodes[0] === target) {
            frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'MATCH', color: 'red' }], 1, "if head.val == target", pLines, opName, { target }));
            const newNodes = currentNodes.slice(1);
            frames.push(createFrame(newNodes, [], [], 1, "head = head.next", pLines, opName, { target }));
            return { endNodes: newNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 2, "curr = head", pLines, opName, { target }));

        let i = 0;
        while (i < currentNodes.length - 1) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 3, "while curr.next != null", pLines, opName, { target }));
            frames.push(createFrame(currentNodes, [i + 1], [{ index: i, label: 'CURR', color: 'primary' }, { index: i + 1, label: 'NEXT', color: 'orange' }], 4, `curr.next.val == target?`, pLines, opName, { target }));

            if (currentNodes[i + 1] === target) {
                frames.push(createFrame(currentNodes, [i + 1], [{ index: i, label: 'CURR', color: 'primary' }, { index: i + 1, label: 'MATCH', color: 'red' }], 5, "curr.next = curr.next.next", pLines, opName, { target }, [], [{ from: i, to: i + 2, color: 'red', curved: true }]));
                const newNodes = [...currentNodes];
                newNodes.splice(i + 1, 1);
                frames.push(createFrame(newNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 5, "Node removed", pLines, opName, { target }));
                return { endNodes: newNodes, timeline: frames };
            } else {
                frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 6, "curr = curr.next", pLines, opName, { target }));
                i++;
            }
        }

        frames.push(createFrame(currentNodes, [], [], 3, "Not Found", pLines, opName, { target }));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateFindNthNode = (n: number) => {
        const opName = 'findNthNode';
        const pLines = ["curr = head", "for (i=0; i<N; i++)", "  if curr == null return null", "  curr = curr.next", "return curr"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        if (n < 0 || n >= currentNodes.length) return { endNodes: currentNodes, timeline: [createFrame(currentNodes, [], [], 0, "Invalid N", pLines, opName, { N: n })] };

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 1, "curr = head", pLines, opName, { N: n }));

        for (let i = 0; i < n; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 2, `i < N`, pLines, opName, { N: n }));
            frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 4, "curr = curr.next", pLines, opName, { N: n }));
        }

        frames.push(createFrame(currentNodes, [n], [{ index: n, label: 'FOUND', color: 'green' }], 5, `Found node at index ${n}`, pLines, opName, { N: n }));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateFindNthFromEnd = (n: number) => {
        const opName = 'findNthFromEnd';
        const pLines = ["main = head, ref = head", "for (i=0; i<N; i++) ref = ref.next", "while ref != null", "  main = main.next", "  ref = ref.next", "return main"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        if (n <= 0 || n > currentNodes.length) return { endNodes: currentNodes, timeline: [createFrame(currentNodes, [], [], 0, "Invalid N", pLines, opName, { N: n })] };

        let ref = 0;
        let main = 0;
        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'main/ref', color: 'primary' }], 1, "main = ref = head", pLines, opName, { N: n }));

        for (let i = 0; i < n; i++) {
            frames.push(createFrame(currentNodes, [ref], [{ index: main, label: 'main', color: 'primary' }, { index: ref, label: 'ref', color: 'orange' }], 2, `Advance ref (${i + 1}/${n})`, pLines, opName, { N: n }));
            ref++;
        }

        while (ref < currentNodes.length) {
            frames.push(createFrame(currentNodes, [main, ref], [{ index: main, label: 'main', color: 'primary' }, { index: ref, label: 'ref', color: 'orange' }], 3, "while ref != null", pLines, opName, { N: n }));
            main++;
            ref++;
            if (ref < currentNodes.length) {
                frames.push(createFrame(currentNodes, [main, ref], [{ index: main, label: 'main', color: 'primary' }, { index: ref, label: 'ref', color: 'orange' }], 4, "Advance both pointers", pLines, opName, { N: n }));
            }
        }

        frames.push(createFrame(currentNodes, [main], [{ index: main, label: 'FOUND', color: 'green' }], 6, `Found ${n}th from end`, pLines, opName, { N: n }));
        return { endNodes: currentNodes, timeline: frames };
    };

    const generateInsertAfterValue = (target: number, insertVal: number) => {
        const opName = 'insertAfterValue';
        const pLines = ["curr = head", "while curr != null && curr.val != target", "  curr = curr.next", "if curr == null return", "v = new Node(val)", "v.next = curr.next", "curr.next = v"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        if (currentNodes.length >= MAX_NODES) return { endNodes: currentNodes, timeline: [createFrame(currentNodes, [], [], 0, "List Full", pLines, opName, { target, val: insertVal })] };
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List Empty", pLines, opName, { target, val: insertVal })] };

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 1, "curr = head", pLines, opName, { target, val: insertVal }));

        let foundIdx = -1;
        for (let i = 0; i < currentNodes.length; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 2, `curr != null && curr.val != target?`, pLines, opName, { target, val: insertVal }));
            if (currentNodes[i] === target) {
                foundIdx = i;
                frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'MATCH', color: 'green' }], 2, "Found target", pLines, opName, { target, val: insertVal }));
                break;
            }
            if (i < currentNodes.length - 1) {
                frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 3, "curr = curr.next", pLines, opName, { target, val: insertVal }));
            }
        }

        if (foundIdx === -1) {
            frames.push(createFrame(currentNodes, [], [], 4, "Target not found", pLines, opName, { target, val: insertVal }));
            return { endNodes: currentNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [foundIdx], [{ index: foundIdx, label: 'curr', color: 'primary' }], 5, "v = new Node(val)", pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetIndex: foundIdx + 1 }]));
        frames.push(createFrame(currentNodes, [foundIdx], [{ index: foundIdx, label: 'curr', color: 'primary' }], 6, "v.next = curr.next", pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetIndex: foundIdx + 1 }], [{ from: 'temp', to: foundIdx + 1, curved: true }]));
        frames.push(createFrame(currentNodes, [foundIdx], [{ index: foundIdx, label: 'curr', color: 'primary' }], 7, "curr.next = v", pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetIndex: foundIdx + 1 }], [{ from: foundIdx, to: 'temp', curved: true }, { from: 'temp', to: foundIdx + 1, curved: true }]));

        const newNodes = [...currentNodes];
        newNodes.splice(foundIdx + 1, 0, insertVal);
        frames.push(createFrame(newNodes, [foundIdx + 1], [{ index: foundIdx + 1, label: 'Inserted', color: 'green' }], 7, "Inserted!", pLines, opName, { target, val: insertVal }));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateInsertBeforeValue = (target: number, insertVal: number) => {
        const opName = 'insertBeforeValue';
        const pLines = ["if head == null return", "if head.val == target", "  v = new Node(val)", "  v.next = head; head = v", "curr = head", "while curr.next != null && curr.next.val != target", "  curr = curr.next", "if curr.next == null return", "v = new Node(val)", "v.next = curr.next", "curr.next = v"];
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        if (currentNodes.length >= MAX_NODES) return { endNodes: currentNodes, timeline: [createFrame(currentNodes, [], [], 0, "List Full", pLines, opName, { target, val: insertVal })] };
        if (currentNodes.length === 0) return { endNodes: [], timeline: [createFrame([], [], [], 0, "List Empty", pLines, opName, { target, val: insertVal })] };

        if (currentNodes[0] === target) {
            frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'MATCH', color: 'green' }], 2, "if head.val == target", pLines, opName, { target, val: insertVal }));
            const newNodes = [insertVal, ...currentNodes];
            frames.push(createFrame(currentNodes, [0], [], 3, "v = new Node(val)", pLines, opName, { target, val: insertVal }, [{ id: 't', val: insertVal, label: 'v', position: 'left-of-head' }]));
            frames.push(createFrame(newNodes, [0], [{ index: 0, label: 'HEAD', color: 'green' }], 4, "head = v", pLines, opName, { target, val: insertVal }));
            return { endNodes: newNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 5, "curr = head", pLines, opName, { target, val: insertVal }));

        let foundIdx = -1;
        for (let i = 0; i < currentNodes.length - 1; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 6, `curr.next.val != target?`, pLines, opName, { target, val: insertVal }));
            if (currentNodes[i + 1] === target) {
                foundIdx = i;
                frames.push(createFrame(currentNodes, [i + 1], [{ index: i, label: 'CURR', color: 'primary' }, { index: i + 1, label: 'MATCH', color: 'green' }], 6, "Found target", pLines, opName, { target, val: insertVal }));
                break;
            }
            if (i < currentNodes.length - 2) {
                frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 7, "curr = curr.next", pLines, opName, { target, val: insertVal }));
            }
        }

        if (foundIdx === -1) {
            frames.push(createFrame(currentNodes, [], [], 8, "Target not found", pLines, opName, { target, val: insertVal }));
            return { endNodes: currentNodes, timeline: frames };
        }

        frames.push(createFrame(currentNodes, [foundIdx], [{ index: foundIdx, label: 'curr', color: 'primary' }], 9, "v = new Node(val)", pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetIndex: foundIdx + 1 }]));
        frames.push(createFrame(currentNodes, [foundIdx], [{ index: foundIdx, label: 'curr', color: 'primary' }], 10, "v.next = curr.next", pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetIndex: foundIdx + 1 }], [{ from: 'temp', to: foundIdx + 1, curved: true }]));
        frames.push(createFrame(currentNodes, [foundIdx], [{ index: foundIdx, label: 'curr', color: 'primary' }], 11, "curr.next = v", pLines, opName, { target, val: insertVal }, [{ id: 'temp', val: insertVal, label: 'v', position: 'above-at-index', offsetIndex: foundIdx + 1 }], [{ from: foundIdx, to: 'temp', curved: true }, { from: 'temp', to: foundIdx + 1, curved: true }]));

        const newNodes = [...currentNodes];
        newNodes.splice(foundIdx + 1, 0, insertVal);
        frames.push(createFrame(newNodes, [foundIdx + 1], [{ index: foundIdx + 1, label: 'Inserted', color: 'green' }], 11, "Inserted", pLines, opName, { target, val: insertVal }));

        return { endNodes: newNodes, timeline: frames };
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
            case 'reverseTraversal':
                res = generateFeatureComingSoon(actionId);
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
                res = generateFeatureComingSoon(actionId);
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
                res = generateFeatureComingSoon(actionId);
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
            default:
                res = generateFeatureComingSoon(actionId);
                break;
        }

        if (res) {
            run(res);
        }
    };

    const handleExample = () => {
        if (mode === 'apps') {
            // For now, apps might be things like 'findMiddleNode', 'reverseList', etc.
            // These don't usually require special input, but we can set defaults if needed.
            setInputValue("42");
            setInputIndex("2");
        } else {
            const currentSize = initialNodes.length;
            const validSize = currentSize > 0 ? currentSize : 5;
            const vals = Array.from({ length: validSize }, () => Math.floor(Math.random() * 99) + 1);
            setInitialNodes(vals);
            setCreateInput(vals.join(', '));
            setCreateSize(validSize.toString());
            setFrames([createFrame(vals, [], [], 0, "Example List Loaded", PSEUDOCODE.create, "create")]);
            setCurrentStep(0);
            setIsPlaying(false);
        }
    };

    const handleCanvasAdd = () => {
        if (initialNodes.length >= MAX_NODES) { setError(`Max capacity ${MAX_NODES} reached`); return; }
        const vals = [...initialNodes, Math.floor(Math.random() * 99) + 1];
        setInitialNodes(vals);
        setFrames([createFrame(vals, [], [], 0, "Node Added", [], "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasDelete = (index: number) => {
        const vals = initialNodes.filter((_, i) => i !== index);
        setInitialNodes(vals);
        setFrames([createFrame(vals, [], [], 0, "Node Removed", [], "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasUpdate = (index: number, val: number) => {
        const vals = [...initialNodes];
        vals[index] = val;
        setInitialNodes(vals);
        setFrames([createFrame(vals, [], [], 0, "Node Updated", [], "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasClear = () => {
        setInitialNodes([]);
        setFrames([createFrame([], [], [], 0, "List Cleared", [], "None")]);
        setCurrentStep(0);
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
        runAction,
        handleExample,
        handleCanvasAdd,
        handleCanvasDelete,
        handleCanvasUpdate,
        handleCanvasClear
    };
};
