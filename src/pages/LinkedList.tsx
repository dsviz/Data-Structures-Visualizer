import { useState, useEffect, useRef } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';

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
    const [scale, setScale] = useState(1);

    // Floating Panels State
    const [pseudoPos, setPseudoPos] = useState({ x: 0, y: 0 });
    const [isDraggingPseudo, setIsDraggingPseudo] = useState(false);
    const [pseudoDragStart, setPseudoDragStart] = useState({ x: 0, y: 0 });

    const [controlsPos, setControlsPos] = useState({ x: 0, y: 0 });
    const [isDraggingControls, setIsDraggingControls] = useState(false);
    const [controlsDragStart, setControlsDragStart] = useState({ x: 0, y: 0 });

    const timerRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
        setScale(Math.max(0.6, Math.min(1, available / totalWidth)));
    }, [initialNodes.length]);

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

    // Window Drag Listeners for Pseudo/Controls
    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (isDraggingPseudo) {
                setPseudoPos(p => ({ x: p.x + e.clientX - pseudoDragStart.x, y: p.y + e.clientY - pseudoDragStart.y }));
                setPseudoDragStart({ x: e.clientX, y: e.clientY });
            }
            if (isDraggingControls) {
                setControlsPos(p => ({ x: p.x + e.clientX - controlsDragStart.x, y: p.y + e.clientY - controlsDragStart.y }));
                setControlsDragStart({ x: e.clientX, y: e.clientY });
            }
        };
        const onUp = () => { setIsDraggingPseudo(false); setIsDraggingControls(false); };
        if (isDraggingPseudo || isDraggingControls) {
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, [isDraggingPseudo, isDraggingControls, pseudoDragStart, controlsDragStart]);

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
                            // Sort so Head/Tail usually appear at top or bottom? 
                            // Current CSS flex-col-reverse: last in DOM is top visually.
                            // We want HEAD/TAIL ideally at the very top (last in array).

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

            {/* Draggable Pseudocode */}
            <div className="absolute right-8 bottom-40 w-80 backdrop-blur-xl bg-white/70 dark:bg-[#1c1a32]/70 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ transform: `translate(${pseudoPos.x}px, ${pseudoPos.y}px)` }}
            >
                <div className="bg-gray-100/50 dark:bg-white/5 px-4 py-2 border-b border-gray-200 dark:border-white/5 flex justify-between items-center cursor-move select-none active:cursor-grabbing"
                    onMouseDown={(e) => { e.stopPropagation(); setIsDraggingPseudo(true); setPseudoDragStart({ x: e.clientX, y: e.clientY }); }}
                >
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Pseudocode</span>
                    <span className="material-symbols-outlined text-gray-400 text-sm">drag_indicator</span>
                </div>
                <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {currentFrame.pseudoLines.length > 0 ? currentFrame.pseudoLines.map((line, idx) => (
                        <p key={idx} className={`px-2 py-1 -mx-2 rounded border-l-2 transition-colors ${idx === currentFrame.codeLine ? 'text-primary dark:text-white bg-primary/10 dark:bg-primary/20 border-primary' : 'border-transparent'}`}>
                            {idx}. {line}
                        </p>
                    )) : <span className="text-gray-500 italic">Select an operation...</span>}
                </div>
            </div>

            {/* Draggable Controls */}
            <div className="absolute bottom-8 left-1/2 w-[600px] h-20 bg-white/80 dark:bg-[#1c1a32]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl flex items-center px-8 gap-6 z-20 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ transform: `translate(calc(-50% + ${controlsPos.x}px), ${controlsPos.y}px)` }}>
                <div className="absolute top-0 left-0 w-full h-full cursor-move z-0 rounded-2xl group"
                    onMouseDown={(e) => { e.stopPropagation(); setIsDraggingControls(true); setControlsDragStart({ x: e.clientX, y: e.clientY }); }}>
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="relative z-10 flex items-center gap-6 w-full pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button onClick={() => setCurrentStep(0)} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">skip_previous</span></button>
                        <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">fast_rewind</span></button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className={`size-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-red-500' : 'bg-primary'}`}>
                            <span className="material-symbols-outlined text-[24px] filled">{isPlaying ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button onClick={() => setCurrentStep(s => Math.min(frames.length - 1, s + 1))} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">fast_forward</span></button>
                        <button onClick={() => setCurrentStep(frames.length - 1)} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">skip_next</span></button>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1.5 pointer-events-auto">
                        <div className="flex justify-between text-xs font-medium text-gray-400">
                            <span>Step {currentStep + 1}/{frames.length || 1}</span>
                            <span className="truncate max-w-[200px]">{currentFrame.description}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#272546] rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pct = (e.clientX - rect.left) / rect.width;
                            setCurrentStep(Math.floor(pct * (frames.length - 1)));
                        }}>
                            <div className="h-full bg-primary relative rounded-full" style={{ width: `${((currentStep + 1) / (frames.length || 1)) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-32 border-l border-[#272546] pl-4 pointer-events-auto">
                        <span className="material-symbols-outlined text-gray-500 text-sm">speed</span>
                        <input type="range" min="0.5" max="3" step="0.5" value={playbackSpeed} onChange={e => setPlaybackSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-[#272546] rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>
                </div>
            </div>
        </VisualizationLayout>
    );
};

export default LinkedList;
