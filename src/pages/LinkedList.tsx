import { useState, useEffect, useRef } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useLayout } from '../context/LayoutContext';

import { LINKED_LIST_CODE, Language } from '../data/LinkedListCode';

// --- Types ---
type Operation = 'create' | 'insert' | 'remove' | 'search' | null;
type ListType = 'singly' | 'doubly' | 'circular';

interface Pointer {
    index: number;
    label: string;
    color: string;
}

interface TempNode {
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

interface TempArrow {
    from: 'temp' | number; // 'temp' refers to the unique temp node (simplification), or index in main list
    to: 'temp' | number | 'null'; // target index, temp node, or null
    label?: string;
    curved?: boolean;
    color?: string;
}

interface Frame {
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
const MAX_NODES = 20;
const DEFAULT_NODES = [12, 45, 99];
const PSEUDOCODE = {
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

export default function LinkedList() {
    // --- State ---
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [initialNodes, setInitialNodes] = useState<number[]>(DEFAULT_NODES);
    const [listType, setListType] = useState<ListType>('singly');
    const [activeOp, setActiveOp] = useState<Operation>(null);
    const [createInput, setCreateInput] = useState('');
    const [createStep, setCreateStep] = useState<'size' | 'values'>('size');
    const [createSize, setCreateSize] = useState('5');
    const [inputValue, setInputValue] = useState('');
    const [inputIndex, setInputIndex] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Canvas state
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Sidebar state
    // Sidebar state
    const { setIsSidebarOpen, setIsNavbarVisible } = useLayout();
    const [showPseudocode, setShowPseudocode] = useState(false);
    const [showRealCode, setShowRealCode] = useState(false);
    const [isFullMode, setIsFullMode] = useState(false);
    const [codeLanguage, setCodeLanguage] = useState<Language>('python');
    const timerRef = useRef<number | null>(null);

    // Mutual Exclusivity: If Code is Open -> Left Closed. If Code is Closed -> Left Open.
    useEffect(() => {
        if (showPseudocode || showRealCode) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [showPseudocode, showRealCode, setIsSidebarOpen]);

    // Toggle Helpers
    const togglePseudocode = () => {
        if (!showPseudocode) setShowRealCode(false);
        setShowPseudocode(prev => !prev);
    };

    const toggleRealCode = () => {
        if (!showRealCode) setShowPseudocode(false);
        setShowRealCode(prev => !prev);
    };

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

    // ... (Generators mostly same but updated to pass pseudoLines)
    // For brevity in this edit, I will adapt them inline

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
        frames.push(createFrame(newNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 0, "Update Head = v", pLines, opName, opValues)); // Line 0 highlight? Wait, line 2 is head=v

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

    // --- UI Handlers ---
    const toggleOp = (op: Operation) => {
        if (activeOp === op) setActiveOp(null);
        else { setActiveOp(op); setError(null); }
    };

    const handleCreate = () => {
        const vals = createInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
        if (vals.length > MAX_NODES) return setError(`Max ${MAX_NODES}`);

        const res = generateCreateFrames(vals);
        run(res);
        setIsPlaying(true); // Ensure play starts
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

    // --- Effects & Drag ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === 'f' || e.key === 'F')) {
                e.preventDefault();
                setIsFullMode(prev => !prev);
            }
            if (e.key === 'Escape' && isFullMode) {
                setIsFullMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullMode]);

    // Manage Navbar Visibility
    useEffect(() => {
        setIsNavbarVisible(!isFullMode);
        return () => setIsNavbarVisible(true);
    }, [isFullMode, setIsNavbarVisible]);

    useEffect(() => {
        if (!containerRef.current) return;
        // Recalculate based on current visible space
        const totalWidth = initialNodes.length * 150;
        // We use a timeout to let the layout transition finish before measuring
        const timer = setTimeout(() => {
            if (!containerRef.current) return;
            const available = containerRef.current.clientWidth - 40; // 40px padding

            // Auto-resize logic: always maximize space utilization
            let newScale = 0.75; // Default to 75% as requested
            if (totalWidth > available) {
                // Shrink to fit, but cap at 75% max
                newScale = Math.min(0.75, available / totalWidth);
            } else {
                newScale = 0.75;
            }
            // Apply slight padding scale if needed, but 0.6 is already small.

            setScale(newScale);
        }, 300); // 300ms matches sidebar transition duration

        return () => clearTimeout(timer);
    }, [initialNodes.length, showPseudocode, showRealCode, isFullMode]);

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
        return () => clearInterval(timerRef.current!);
    }, [isPlaying, frames, playbackSpeed]);

    const handleWheel = (e: React.WheelEvent) => {
        // e.preventDefault(); // Let it bubble if not prevented, but we want zoom
        if (e.ctrlKey || e.metaKey || true) {
            const delta = -e.deltaY;
            setScale(prev => {
                const newScale = prev + (delta * 0.001);
                return Math.min(Math.max(0.2, newScale), 3);
            });
        }
    };




    const currentFrame = frames[currentStep] || { nodes: initialNodes, highlights: [], pointers: [], codeLine: -1, description: "Ready", listType, pseudoLines: [], opName: '', opValues: {} };

    const rightSidebarContent = (showPseudocode || showRealCode) ? (
        <div className="flex flex-col h-full bg-white dark:bg-[#1e1c33] border-l border-gray-200 dark:border-[#272546]">
            {/* Pseudocode Panel */}
            {showPseudocode && (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="px-4 py-3 bg-gray-50/50 dark:bg-black/20 border-b border-gray-100 dark:border-[#272546] flex justify-between items-center shrink-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7] flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">code</span>
                            Pseudocode
                        </span>
                        <button onClick={() => setShowPseudocode(false)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">close</span></button>
                    </div>
                    <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-y-auto">
                        <div className="space-y-1">
                            {currentFrame.pseudoLines.length > 0 ? currentFrame.pseudoLines.map((line, idx) => (
                                <div key={idx} className={`px-2 py-1.5 rounded-sm border-l-2 transition-all ${idx === currentFrame.codeLine ? 'bg-primary/10 text-primary dark:text-white border-primary font-bold shadow-sm' : 'border-transparent opacity-80'}`}>
                                    <span className="mr-3 select-none opacity-50">{idx}</span>
                                    {line}
                                </div>
                            )) : <span className="text-gray-500 italic px-2">No operation selected...</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* Real Code Panel */}
            {showRealCode && (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="px-4 py-3 bg-gray-50/50 dark:bg-black/20 border-b border-gray-100 dark:border-[#272546] flex flex-col gap-3 shrink-0">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7] flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">terminal</span>
                                Implementation
                            </span>
                            <button onClick={() => setShowRealCode(false)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">close</span></button>
                        </div>
                        {/* Improved Language Selector */}
                        <div className="flex p-1 bg-gray-100 dark:bg-[#151426] rounded-lg">
                            {(['c', 'cpp', 'java', 'python'] as Language[]).map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setCodeLanguage(lang)}
                                    className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all duration-200 ${codeLanguage === lang
                                        ? 'bg-white dark:bg-[#272546] text-primary shadow-sm scale-100'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {lang === 'c' ? 'C' : lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : 'Python'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-y-auto">
                        <div className="space-y-0.5">
                            {(() => {
                                if (!currentFrame.opName || !LINKED_LIST_CODE[currentFrame.opName]) {
                                    return <span className="text-gray-500 italic px-2">No code available.</span>;
                                }
                                const codeData = LINKED_LIST_CODE[currentFrame.opName][codeLanguage];
                                const activeLines = codeData.mapping[currentFrame.codeLine];
                                const activeLineIndices = Array.isArray(activeLines) ? activeLines : (activeLines !== undefined ? [activeLines] : []);

                                return codeData.lines.map((lineRaw, idx) => {
                                    // 🚀 Dynamic Value Replacement
                                    let line = lineRaw;
                                    if (currentFrame.opValues) {
                                        Object.entries(currentFrame.opValues).forEach(([key, val]) => {
                                            line = line.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val));
                                        });
                                    }

                                    return (
                                        <div key={idx} className={`px-2 py-1 -mx-2 rounded flex gap-3 transition-colors duration-200 ${activeLineIndices.includes(idx) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}>
                                            <span className="text-gray-300 dark:text-gray-600 select-none w-4 text-right">{idx + 1}</span>
                                            <span className="whitespace-pre">{line}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : null;

    const playbackControls = (
        <div className={`transition-all duration-300 z-30 ${isFullMode
            ? 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#131221]/90 backdrop-blur-md rounded-full shadow-2xl border border-gray-200 dark:border-[#272546] px-6 py-2 flex items-center gap-6'
            : 'w-full bg-white dark:bg-[#131221] border-t border-gray-200 dark:border-[#272546] px-8 py-4 flex items-center justify-between gap-8 h-20 shadow-md relative'
            }`}>
            {/* Playback Buttons */}
            <div className={`flex items-center ${isFullMode ? 'gap-2' : 'gap-4'}`}>
                <button onClick={() => setCurrentStep(0)} className="text-gray-400 hover:text-white transition-colors"><span className={`material-symbols-outlined ${isFullMode ? 'text-[20px]' : 'text-[24px]'}`}>skip_previous</span></button>
                <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} className="text-gray-400 hover:text-white transition-colors"><span className={`material-symbols-outlined ${isFullMode ? 'text-[24px]' : 'text-[28px]'}`}>fast_rewind</span></button>

                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-primary' : 'bg-primary'} ${isFullMode ? 'size-10' : 'size-12'}`}
                >
                    <span className={`material-symbols-outlined filled ${isFullMode ? 'text-[24px]' : 'text-[28px]'}`}>{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>

                <button onClick={() => setCurrentStep(s => Math.min(frames.length - 1, s + 1))} className="text-gray-400 hover:text-white transition-colors"><span className={`material-symbols-outlined ${isFullMode ? 'text-[24px]' : 'text-[28px]'}`}>fast_forward</span></button>
                <button onClick={() => setCurrentStep(frames.length - 1)} className="text-gray-400 hover:text-white transition-colors"><span className={`material-symbols-outlined ${isFullMode ? 'text-[20px]' : 'text-[24px]'}`}>skip_next</span></button>
            </div>

            {/* Timeline (Hidden in minimal mode or simplified?) -> Let's keep it but smaller */}
            {!isFullMode && (
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium font-mono text-gray-500 dark:text-gray-400">
                        <span>Step {currentStep + 1}/{frames.length || 1}</span>
                        <span className="text-primary">{Math.round(((currentStep + 1) / (frames.length || 1)) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-[#272546] rounded-full overflow-hidden relative cursor-pointer group"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pct = (e.clientX - rect.left) / rect.width;
                            setCurrentStep(Math.floor(pct * (frames.length - 1)));
                        }}
                    >
                        <div className="h-full bg-primary relative rounded-full transition-all duration-100 ease-out" style={{ width: `${((currentStep + 1) / (frames.length || 1)) * 100}%` }}></div>
                    </div>
                </div>
            )}

            {/* Simple Step Counter for Minimal Mode */}
            {isFullMode && (
                <div className="text-xs font-mono text-gray-400 w-16 text-center">
                    {currentStep + 1}/{frames.length || 1}
                </div>
            )}

            {/* Speed Control (Keep in both but compact in minimal) */}
            <div className={`flex items-center gap-3 border-l border-gray-200 dark:border-[#272546] ${isFullMode ? 'pl-4 w-auto' : 'w-40 pl-6'}`}>
                <span className="material-symbols-outlined text-gray-400 text-sm">speed</span>
                {!isFullMode && (
                    <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.5"
                        value={playbackSpeed}
                        onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-200 dark:bg-[#272546] rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                )}
                <span className="text-xs font-mono text-gray-500 w-8">{playbackSpeed}x</span>
            </div>
        </div>
    );

    return (
        <VisualizationLayout
            title="Linked List"
            contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden"
            rightSidebar={rightSidebarContent} // Always pass right sidebar (it returns null internally if closed)
            controls={playbackControls} // Always pass controls
            sidebar={ // Left sidebar: Visible if Open (Full Mode allowed)
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Operations</h3>

                    {/* Create */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'create' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('create')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'create' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>add_circle</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'create' ? 'text-primary font-bold' : ''}`}>Create</p>
                                <p className={`text-xs mt-1 ${activeOp === 'create' ? 'text-primary' : 'text-gray-400'}`}>New List</p>
                            </div>
                        </button>
                        {activeOp === 'create' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                {createStep === 'size' ? (
                                    <>
                                        <label><span className="text-[10px] text-gray-400 uppercase font-bold">Size</span><input type="number" value={createSize} onChange={e => setCreateSize(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white mt-1" /></label>
                                        <button onClick={() => setCreateStep('values')} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Next</button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <button onClick={() => setCreateStep('size')} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-sm">arrow_back</span></button>
                                            <span className="text-xs font-bold text-gray-500">Method</span>
                                        </div>
                                        <button onClick={handleCreateRandom} className="w-full border border-gray-600 hover:bg-white/5 text-white text-xs font-bold py-2 rounded">Random</button>
                                        <div className="text-center text-[10px] text-gray-500">- OR -</div>
                                        <input value={createInput} onChange={e => setCreateInput(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm font-mono text-white" placeholder="10, 20..." />
                                        <button onClick={handleCreate} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Set</button>
                                    </>
                                )}
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Insert */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'insert' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('insert')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'insert' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>arrow_right_alt</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'insert' ? 'text-primary font-bold' : ''}`}>Insert</p>
                                <p className={`text-xs mt-1 ${activeOp === 'insert' ? 'text-primary' : 'text-gray-400'}`}>Add Node</p>
                            </div>
                        </button>
                        {activeOp === 'insert' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Val</span><input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Idx</span><input type="number" value={inputIndex} onChange={e => setInputIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                    <button onClick={() => handleInsert('head')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Head</button>
                                    <button onClick={() => handleInsert('tail')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Tail</button>
                                    <button onClick={() => handleInsert('index')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Index</button>
                                </div>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Remove */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'remove' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('remove')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'remove' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>delete</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'remove' ? 'text-primary font-bold' : ''}`}>Remove</p>
                                <p className={`text-xs mt-1 ${activeOp === 'remove' ? 'text-primary' : 'text-gray-400'}`}>Delete Node</p>
                            </div>
                        </button>
                        {activeOp === 'remove' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Index</span><input type="number" value={inputIndex} onChange={e => setInputIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                <div className="grid grid-cols-3 gap-1 mt-2">
                                    <button onClick={() => handleRemove('head')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Head</button>
                                    <button onClick={() => handleRemove('tail')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Tail</button>
                                    <button onClick={() => handleRemove('index')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Index</button>
                                </div>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'search' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('search')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'search' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>search</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'search' ? 'text-primary font-bold' : ''}`}>Search</p>
                                <p className={`text-xs mt-1 ${activeOp === 'search' ? 'text-primary' : 'text-gray-400'}`}>Find Value</p>
                            </div>
                        </button>
                        {activeOp === 'search' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" placeholder="Value..." />
                                <button onClick={handleSearch} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Find</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>
                </div>
            }
            leftSidebar={null}
        >
            {/* List Type Toggle - Floating Top Center */}
            {
                !isFullMode && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 transition-opacity duration-300">
                        {(['singly', 'doubly', 'circular'] as const).map(t => (
                            <button key={t} onClick={() => setListType(t)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase backdrop-blur-md border transition-all ${listType === t ? 'bg-primary text-white border-primary' : 'bg-white/10 border-white/10 text-gray-400 hover:bg-white/20'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                )
            }

            {/* Canvas */}
            <div ref={containerRef} className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-gray-50/50 dark:bg-black/20 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={(e) => { setIsDragging(true); setLastMousePos({ x: e.clientX, y: e.clientY }); }}
                onMouseMove={(e) => {
                    if (isDragging) { setPan(p => ({ x: p.x + e.clientX - lastMousePos.x, y: p.y + e.clientY - lastMousePos.y })); setLastMousePos({ x: e.clientX, y: e.clientY }); }
                }}
                onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}
                onWheel={handleWheel}
            >
                <div className="flex items-center transition-transform duration-100 ease-out origin-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
                    {currentFrame.nodes.length === 0 && (!currentFrame.tempNodes || currentFrame.tempNodes.length === 0) ? <div className="opacity-30 text-2xl font-bold uppercase">Empty List</div> : (
                        currentFrame.nodes.map((val, i) => {
                            const isHighlight = currentFrame.highlights.includes(i);
                            let nodePointers = currentFrame.pointers.filter(p => p.index === i);

                            // Persistent Head/Tail logic
                            if (i === 0 && !nodePointers.some(p => p.label === 'HEAD')) {
                                nodePointers.push({ index: i, label: 'HEAD', color: 'red' });
                            }
                            if (i === currentFrame.nodes.length - 1 && !nodePointers.some(p => p.label === 'TAIL')) {
                                nodePointers.push({ index: i, label: 'TAIL', color: 'green' });
                            }

                            return (
                                <div key={i} className="flex items-center group relative">
                                    <div className="relative z-10">
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-1">
                                            {nodePointers.map((p, idx) => (
                                                <div key={idx} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm whitespace-nowrap ${p.color === 'red' ? 'bg-rose-500 text-white' : p.color === 'green' ? 'bg-emerald-500 text-white' : p.color === 'blue' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-[#383564] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300'}`}>{p.label}</div>
                                            ))}
                                        </div>
                                        <div className={`w-28 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold font-mono shadow-sm transition-all ${isHighlight ? 'border-primary bg-primary/10 text-primary scale-110 shadow-[0_0_15px_rgba(66,54,231,0.3)]' : 'border-indigo-200 dark:border-[#383564] bg-blue-50/50 dark:bg-[#1e1e24] text-slate-800 dark:text-white'}`}>
                                            {val}
                                            <div className="absolute top-0 left-1 text-[9px] text-gray-400 p-1 opacity-50 border-r border-b border-gray-100 dark:border-[#2e2b4d] rounded-br">idx: {i}</div>
                                            {listType === 'doubly' && <div className="absolute left-0 h-full w-4 border-r border-gray-200 dark:border-[#383564]"></div>}
                                            <div className="absolute right-0 h-full w-8 border-l border-gray-200 dark:border-[#383564] bg-gray-50 dark:bg-[#151426] flex items-center justify-center"><div className="size-2 rounded-full bg-gray-400"></div></div>
                                        </div>
                                    </div>
                                    {i < currentFrame.nodes.length - 1 && (
                                        <div className="w-16 h-8 relative flex items-center justify-center text-gray-400">
                                            <svg className="w-full h-full overflow-visible" viewBox="0 0 64 32">
                                                <path d="M0 16 H62" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                                {listType === 'doubly' && <path d="M64 24 H2" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" opacity="0.5" />}
                                            </svg>
                                        </div>
                                    )}
                                    {i === currentFrame.nodes.length - 1 && listType === 'circular' && (
                                        <div className="absolute top-full left-1/2 w-full h-16 border-b-2 border-l-2 border-r-2 border-dashed border-gray-400/50 rounded-b-3xl pointer-events-none" style={{ left: `calc(-${i * 100}% - ${i * 64}px + 56px)`, width: `calc(${i * 100}% + ${i * 64}px)` }}>
                                            <div className="absolute bottom-2 right-1/2 translate-x-1/2 bg-white dark:bg-[#121121] px-2 text-[10px] text-gray-400 font-mono">Next pts to Head</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                    {/* Temp Nodes */}
                    {currentFrame.tempNodes?.map((node, i) => {
                        let left = 0;
                        let top = 0;
                        const NODE_WIDTH = 112;
                        const GAP = 64;
                        const TOTAL_WIDTH = NODE_WIDTH + GAP;

                        // Simple offset logic assuming 0 is standard start
                        if (node.position === 'left-of-head') left = -TOTAL_WIDTH;
                        else if (node.position === 'right-of-tail') left = currentFrame.nodes.length * TOTAL_WIDTH;
                        else if (node.position === 'above-at-index') {
                            left = (node.offsetIndex || 0) * TOTAL_WIDTH;
                            top = -100;
                        }

                        return (
                            <div key={`temp-${i}`} className="absolute top-0 flex items-center z-20 transition-all duration-500 ease-out" style={{ left: `${left}px`, transform: `translateY(${top}px)` }}>
                                <div className="relative">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2"><div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm whitespace-nowrap bg-blue-500 text-white">{node.label}</div></div>
                                    <div className="w-28 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold font-mono shadow-xl border-blue-500 bg-blue-500/10 text-blue-500">
                                        {node.val}
                                        <div className="absolute right-0 h-full w-8 border-l border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-center"><div className="size-2 rounded-full bg-blue-400"></div></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {listType !== 'circular' && currentFrame.nodes.length > 0 && (
                        <div className="ml-2 flex items-center gap-1 opacity-50">
                            <div className="w-8 h-[2px] bg-gray-400"></div>
                            <div className="px-2 py-1 text-xs font-bold text-gray-400 border border-dashed border-gray-300 dark:border-white/10 rounded bg-gray-50 dark:bg-white/5">NULL</div>
                        </div>
                    )}

                    {/* Arrows Overlay - Moved Inside Wrapper */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0" style={{ minWidth: '100%', minHeight: '100%' }}>
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="currentColor" /></marker>
                            <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" /></marker>
                            <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" /></marker>
                            <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#10b981" /></marker>
                        </defs>
                        {currentFrame.tempArrows?.map((arrow, i) => {
                            const NODE_WIDTH = 112;
                            const GAP = 64;
                            const TOTAL_WIDTH = NODE_WIDTH + GAP;

                            const getX = (target: 'temp' | number | 'null') => {
                                // Node center = Index * TOTAL + NODE_WIDTH/2
                                if (typeof target === 'number') return target * TOTAL_WIDTH + NODE_WIDTH / 2;
                                if (target === 'null') return currentFrame.nodes.length * TOTAL_WIDTH + 20;
                                if (target === 'temp') {
                                    const temp = currentFrame.tempNodes?.[0];
                                    if (!temp) return 0;
                                    if (temp.position === 'left-of-head') return -TOTAL_WIDTH + NODE_WIDTH / 2;
                                    if (temp.position === 'right-of-tail') return currentFrame.nodes.length * TOTAL_WIDTH + NODE_WIDTH / 2;
                                    if (temp.position === 'above-at-index') return (temp.offsetIndex || 0) * TOTAL_WIDTH + NODE_WIDTH / 2;
                                }
                                return 0;
                            };

                            const getY = (target: 'temp' | number | 'null') => {
                                if (target === 'temp') {
                                    const temp = currentFrame.tempNodes?.[0];
                                    if (temp?.position === 'above-at-index') return -100 + 24;
                                    return 24;
                                }
                                return 24; // Node center Y (height 48)
                            };

                            const sx = getX(arrow.from);
                            const sy = getY(arrow.from);
                            const ex = getX(arrow.to);
                            const ey = getY(arrow.to);

                            if (arrow.curved) {
                                const mx = (sx + ex) / 2;
                                const my = sy - 60;
                                return <path key={i} d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`} stroke={arrow.color || 'red'} strokeWidth="2" fill="none" markerEnd={`url(#arrowhead-${arrow.color === 'green' ? 'green' : 'red'})`} />;
                            }
                            return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke={arrow.color || 'blue'} strokeWidth="2" markerEnd={`url(#arrowhead-${arrow.color === 'green' ? 'green' : 'blue'})`} />;
                        })}
                    </svg>
                </div> {/* Closing Wrapper */}
            </div> {/* Closing Canvas */}

            {/* Toggle Buttons (Top Right) */}
            <div className="absolute top-6 right-6 z-30 flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2">
                    <button
                        onClick={togglePseudocode}
                        className={`h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-all ${showPseudocode
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white/90 dark:bg-[#1c1a32]/90 border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#9794c7]'
                            }`}
                        title="Pseudocode"
                    >
                        <span className="material-symbols-outlined text-[20px]">code</span>
                    </button>
                    <button
                        onClick={toggleRealCode}
                        className={`h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-all ${showRealCode
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white/90 dark:bg-[#1c1a32]/90 border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#9794c7]'
                            }`}
                        title="Real Code"
                    >
                        <span className="material-symbols-outlined text-[20px]">terminal</span>
                    </button>
                </div>
            </div>
        </VisualizationLayout >
    );
};


