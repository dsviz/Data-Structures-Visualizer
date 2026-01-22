import { useState, useEffect, useRef } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useLayout } from '../context/LayoutContext';

// --- Types ---
type Operation = 'create' | 'insert' | 'remove' | 'search' | null;
type ListType = 'singly' | 'doubly' | 'circular';

interface Pointer {
    index: number;
    label: string;
    color: string;
}

interface Frame {
    nodes: number[];
    highlights: number[];
    pointers: Pointer[];
    codeLine: number;
    description: string;
    listType: ListType;
    pseudoLines: string[]; // Store relevant pseudocode lines for this op
}

// --- Constants ---
const MAX_NODES = 20;
const DEFAULT_NODES = [12, 45, 99];

const PSEUDOCODE = {
    insertHead: [
        "Vertex v = new Vertex(val)",
        "v.next = head",
        "head = v",
        "if tail == null then tail = v"
    ],
    insertTail: [
        "Vertex v = new Vertex(val)",
        "if tail != null then tail.next = v",
        "tail = v",
        "if head == null then head = v"
    ],
    insertIndex: [
        "Vertex v = new Vertex(val)",
        "curr = head",
        "for (i = 0; i < index - 1; i++)",
        "  curr = curr.next",
        "v.next = curr.next",
        "curr.next = v"
    ],
    removeHead: [
        "if head == null return",
        "head = head.next",
        "if head == null then tail = null"
    ],
    removeTail: [
        "if head == null return",
        "curr = head",
        "while (curr.next != tail)",
        "  curr = curr.next",
        "curr.next = null",
        "tail = curr"
    ],
    removeIndex: [
        "curr = head",
        "for (i = 0; i < index - 1; i++)",
        "  curr = curr.next",
        "curr.next = curr.next.next"
    ],
    create: [
        "head = null, tail = null",
        "for each val in input:",
        "  v = new Node(val)",
        "  if head == null: head = v",
        "  else: tail.next = v",
        "  tail = v"
    ],
    search: [
        "curr = head",
        "while curr != null:",
        "  if curr.val == target return true",
        "  curr = curr.next",
        "return false"
    ]
};

const LinkedList = () => {
    // --- State ---
    const [initialNodes, setInitialNodes] = useState<number[]>(DEFAULT_NODES);
    const [listType, setListType] = useState<ListType>('singly');
    const [activeOp, setActiveOp] = useState<Operation>(null);
    const [error, setError] = useState<string | null>(null);

    // Inputs
    const [createInput, setCreateInput] = useState(DEFAULT_NODES.join(', '));
    const [createStep, setCreateStep] = useState<'size' | 'values'>('size');
    const [createSize, setCreateSize] = useState('3');

    const [inputValue, setInputValue] = useState('42');
    const [inputIndex, setInputIndex] = useState('0');

    // Playback State
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // Canvas State
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Zoom & Layout
    const { isSidebarOpen } = useLayout();
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Toggle Panels
    const [showPseudocode, setShowPseudocode] = useState(false);

    const timerRef = useRef<number | null>(null);

    // --- Generator Helpers ---
    const createFrame = (nodes: number[], highlights: number[], pointers: Pointer[], line: number, desc: string, pLines: string[]): Frame => ({
        nodes: [...nodes],
        highlights,
        pointers,
        codeLine: line,
        description: desc,
        listType,
        pseudoLines: pLines
    });

    const generateCreateFrames = (vals: number[]) => {
        const pLines = PSEUDOCODE.create;
        const frames: Frame[] = [];
        let currentNodes: number[] = [];

        // 0: Init
        frames.push(createFrame([], [], [], 0, "head = null, tail = null", pLines));

        for (let i = 0; i < vals.length; i++) {
            const val = vals[i];
            // 1: Loop
            frames.push(createFrame(currentNodes, [], [], 1, `Process val: ${val}`, pLines));

            // 2: Create Node
            frames.push(createFrame(currentNodes, [], [{ index: -1, label: `New(${val})`, color: 'blue' }], 2, "v = new Node(val)", pLines));

            if (currentNodes.length === 0) {
                // 3: Head check (true)
                currentNodes = [val];
                frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 3, "head = v", pLines));
            } else {
                // 4: Tail next
                const lastIdx = currentNodes.length - 1;
                frames.push(createFrame(currentNodes, [lastIdx], [{ index: lastIdx, label: 'TAIL', color: 'green' }], 4, "tail.next = v", pLines));

                currentNodes = [...currentNodes, val];
            }

            // 5: Update Tail
            frames.push(createFrame(currentNodes, [currentNodes.length - 1], [{ index: currentNodes.length - 1, label: 'TAIL', color: 'green' }], 5, "tail = v", pLines));
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
        const pLines = PSEUDOCODE.insertHead;
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [], [{ index: -1, label: `New(${val})`, color: 'blue' }], 0, `Create node ${val}`, pLines));
        const newNodes = [val, ...currentNodes];
        frames.push(createFrame(newNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 1, "Link v.next to Head", pLines));
        frames.push(createFrame(newNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 2, "Update Head = v", pLines));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateInsertTailFrames = (val: number) => {
        const pLines = PSEUDOCODE.insertTail;
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];
        frames.push(createFrame(currentNodes, [], [{ index: -1, label: `New(${val})`, color: 'blue' }], 0, `Create node ${val}`, pLines));

        const lastIdx = currentNodes.length - 1;
        if (currentNodes.length > 0) {
            frames.push(createFrame(currentNodes, [lastIdx], [{ index: lastIdx, label: 'TAIL', color: 'green' }], 1, "Tail.next = v", pLines));
        }

        const newNodes = [...currentNodes, val];
        frames.push(createFrame(newNodes, [newNodes.length - 1], [{ index: newNodes.length - 1, label: 'TAIL', color: 'green' }], 2, "Update Tail = v", pLines));
        return { endNodes: newNodes, timeline: frames };
    };

    const generateInsertIndexFrames = (idx: number, val: number) => {
        const pLines = PSEUDOCODE.insertIndex;
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        if (idx === 0) return generateInsertHeadFrames(val);
        if (idx >= currentNodes.length) return generateInsertTailFrames(val);

        frames.push(createFrame(currentNodes, [], [], 0, "Create Node v", pLines));
        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 1, "curr = head", pLines));

        for (let i = 0; i < idx - 1; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 2, `i=${i} < ${idx - 1}`, pLines));
            frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 3, "curr = curr.next", pLines));
        }

        const newNodes = [...currentNodes];
        newNodes.splice(idx, 0, val);
        frames.push(createFrame(newNodes, [idx], [{ index: idx - 1, label: 'CURR', color: 'primary' }, { index: idx, label: 'NEW', color: 'blue' }], 4, "v.next = curr.next", pLines));
        frames.push(createFrame(newNodes, [idx], [{ index: idx - 1, label: 'CURR', color: 'primary' }, { index: idx, label: 'NEW', color: 'blue' }], 5, "curr.next = v", pLines));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateRemoveHeadFrames = () => {
        const pLines = PSEUDOCODE.removeHead;
        if (initialNodes.length === 0) return { endNodes: [], timeline: [] };

        const frames = [createFrame(initialNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 0, "Check Head", pLines)];
        frames.push(createFrame(initialNodes, [0], [{ index: 0, label: 'HEAD', color: 'red' }], 1, "Head = Head.next", pLines));
        const newNodes = initialNodes.slice(1);
        frames.push(createFrame(newNodes, [], [], 2, "Removed old head", pLines));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateRemoveTailFrames = () => {
        const pLines = PSEUDOCODE.removeTail;
        if (initialNodes.length === 0) return { endNodes: [], timeline: [] };
        if (initialNodes.length === 1) return generateRemoveHeadFrames();

        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 1, "curr = head", pLines));

        let curr = 0;
        while (curr < currentNodes.length - 2) {
            frames.push(createFrame(currentNodes, [curr], [{ index: curr, label: 'CURR', color: 'primary' }], 2, "curr.next != tail", pLines));
            curr++;
            frames.push(createFrame(currentNodes, [curr], [{ index: curr, label: 'CURR', color: 'primary' }], 3, "curr = curr.next", pLines));
        }

        frames.push(createFrame(currentNodes, [curr], [{ index: curr, label: 'CURR', color: 'primary' }], 2, "curr.next == tail (Found)", pLines));

        const newNodes = initialNodes.slice(0, -1);
        frames.push(createFrame(newNodes, [curr], [{ index: curr, label: 'TAIL', color: 'green' }], 4, "curr.next = null", pLines));
        frames.push(createFrame(newNodes, [curr], [{ index: curr, label: 'TAIL', color: 'green' }], 5, "tail = curr", pLines));
        return { endNodes: newNodes, timeline: frames };
    };

    const generateRemoveIndexFrames = (idx: number) => {
        const pLines = PSEUDOCODE.removeIndex;
        if (idx === 0) return generateRemoveHeadFrames();
        if (idx >= initialNodes.length - 1) return generateRemoveTailFrames();

        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 0, "curr = head", pLines));

        for (let i = 0; i < idx - 1; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 1, `i=${i} < ${idx - 1}`, pLines));
            frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 2, "curr = curr.next", pLines));
        }

        const newNodes = [...initialNodes];
        newNodes.splice(idx, 1);
        frames.push(createFrame(newNodes, [idx - 1], [{ index: idx - 1, label: 'CURR', color: 'primary' }], 3, "curr.next = curr.next.next", pLines));

        return { endNodes: newNodes, timeline: frames };
    };

    const generateSearchFrames = (target: number) => {
        const pLines = PSEUDOCODE.search;
        const frames: Frame[] = [];
        const currentNodes = [...initialNodes];

        frames.push(createFrame(currentNodes, [0], [{ index: 0, label: 'CURR', color: 'primary' }], 0, "curr = head", pLines));

        for (let i = 0; i < currentNodes.length; i++) {
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 1, "while curr != null", pLines));
            frames.push(createFrame(currentNodes, [i], [{ index: i, label: 'CURR', color: 'primary' }], 2, `val ${currentNodes[i]} == ${target}?`, pLines));

            if (currentNodes[i] === target) {
                return { endNodes: currentNodes, timeline: [...frames, createFrame(currentNodes, [i], [{ index: i, label: 'FOUND', color: 'green' }], 1, "Found match", pLines)] };
            }

            if (i < currentNodes.length - 1) {
                frames.push(createFrame(currentNodes, [i + 1], [{ index: i + 1, label: 'CURR', color: 'primary' }], 3, "curr = curr.next", pLines));
            }
        }

        frames.push(createFrame(currentNodes, [], [], 1, "while curr == null", pLines));
        frames.push(createFrame(currentNodes, [], [], 4, "return false", pLines));
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
        if (!containerRef.current) return;
        const totalWidth = initialNodes.length * 150;
        const available = containerRef.current.clientWidth - 20;

        // Auto-resize logic
        if (totalWidth > available) {
            const newScale = Math.max(0.5, available / totalWidth);
            if (newScale < 1) setScale(newScale * 0.9);
        } else {
            setScale(1);
        }
    }, [initialNodes.length, isSidebarOpen]);

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




    const currentFrame = frames[currentStep] || { nodes: initialNodes, highlights: [], pointers: [], codeLine: -1, description: "Ready", listType, pseudoLines: [] };

    return (
        <VisualizationLayout
            title="Linked List"
            contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden"
            sidebar={
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
        >
            {/* List Type Toggle - Floating Top */}
            <div className="absolute top-8 left-8 z-30 flex gap-2">
                {(['singly', 'doubly', 'circular'] as const).map(t => (
                    <button key={t} onClick={() => setListType(t)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase backdrop-blur-md border transition-all ${listType === t ? 'bg-primary text-white border-primary' : 'bg-white/10 border-white/10 text-gray-400 hover:bg-white/20'}`}>
                        {t}
                    </button>
                ))}
            </div>

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
                    {currentFrame.nodes.length === 0 ? <div className="opacity-30 text-2xl font-bold uppercase">Empty List</div> : (
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
                    {listType !== 'circular' && currentFrame.nodes.length > 0 && (
                        <div className="ml-2 flex items-center gap-1 opacity-50">
                            <div className="w-8 h-[2px] bg-gray-400"></div>
                            <div className="px-2 py-1 text-xs font-bold text-gray-400 border border-dashed border-gray-300 dark:border-white/10 rounded bg-gray-50 dark:bg-white/5">NULL</div>
                        </div>
                    )}
                </div>
                <svg className="absolute w-0 h-0"><defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="currentColor" /></marker></defs></svg>
            </div>

            {/* Toggle Buttons (Top Right) */}
            <div className="absolute top-6 right-6 z-30 flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2">
                    <button
                        onClick={() => setShowPseudocode(prev => !prev)}
                        className={`h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-all ${showPseudocode
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white/90 dark:bg-[#1c1a32]/90 border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#9794c7]'
                            }`}
                        title="Pseudocode"
                    >
                        <span className="material-symbols-outlined text-[20px]">code</span>
                    </button>
                </div>
            </div>

            {/* Pseudocode Panel (Fixed) */}
            {showPseudocode && (
                <div className="absolute top-20 right-6 w-80 backdrop-blur-xl bg-white/90 dark:bg-[#1c1a32]/90 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-20">
                    <div className="bg-gray-50/50 dark:bg-white/5 px-4 py-2 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Pseudocode</span>
                    </div>
                    <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {currentFrame.pseudoLines.length > 0 ? currentFrame.pseudoLines.map((line, idx) => (
                            <p key={idx} className={`px-2 py-1 -mx-2 rounded border-l-2 transition-colors ${idx === currentFrame.codeLine ? 'text-primary dark:text-white bg-primary/10 dark:bg-primary/20 border-primary' : 'border-transparent'}`}>
                                {idx}. {line}
                            </p>
                        )) : <span className="text-gray-500 italic">Select an operation...</span>}
                    </div>
                </div>
            )}

            {/* Fixed Bottom Playback Controls */}
            <div className={`fixed bottom-0 right-0 ${isSidebarOpen ? 'left-80' : 'left-0'} bg-white dark:bg-[#131221] border-t border-gray-200 dark:border-[#272546] px-8 py-4 z-50 flex items-center justify-between gap-8 h-20 transition-all duration-300`}>
                {/* Playback Buttons */}
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentStep(0)} className="text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-[24px]">skip_previous</span></button>
                    <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} className="text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-[28px]">fast_rewind</span></button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`size-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-primary' : 'bg-primary'}`}
                    >
                        <span className="material-symbols-outlined text-[28px] filled">{isPlaying ? 'pause' : 'play_arrow'}</span>
                    </button>

                    <button onClick={() => setCurrentStep(s => Math.min(frames.length - 1, s + 1))} className="text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-[28px]">fast_forward</span></button>
                    <button onClick={() => setCurrentStep(frames.length - 1)} className="text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-[24px]">skip_next</span></button>
                </div>

                {/* Timeline / Scrub Bar */}
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

                {/* Speed Control */}
                <div className="flex items-center gap-3 w-40 pl-6 border-l border-gray-200 dark:border-[#272546]">
                    <span className="material-symbols-outlined text-gray-400 text-sm">speed</span>
                    <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.5"
                        value={playbackSpeed}
                        onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-200 dark:bg-[#272546] rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-xs font-mono text-gray-500 w-8">{playbackSpeed}x</span>
                </div>
            </div>
        </VisualizationLayout>
    );
};

export default LinkedList;
