import { useState, useEffect, useRef } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';

// --- Types ---
type Operation = 'create' | 'push' | 'pop' | 'peek' | null;

const MAX_CAPACITY = 8;
const DEFAULT_STACK = [10, 20, 30];

interface Pointer {
    index: number;
    label: string; // 'top'
    color: string; // 'primary', 'red', 'green'
}

interface Frame {
    stack: (number | null)[];
    highlights: number[];
    pointers: Pointer[];
    codeLine: number;
    description: string;
    internalState: {
        capacity: number;
        size: number;
        top: number; // index of top element
        currentOp: string;
    };
}

// --- Complexity Data ---
const COMPLEXITY = {
    push: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    pop: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    peek: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    create: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(N)' }
};

// --- Pseudocode Data ---
const PSEUDOCODE = {
    push: [
        "if top == capacity - 1, return Stack Overflow",
        "top = top + 1",
        "stack[top] = value",
        "return"
    ],
    pop: [
        "if top == -1, return Stack Underflow",
        "value = stack[top]",
        "top = top - 1",
        "return value"
    ],
    peek: [
        "if top == -1, return Stack Empty",
        "return stack[top]"
    ],
    create: [
        "allocate memory for size N",
        "top = -1",
        "return stack reference"
    ]
};

const Stack = () => {
    // --- State ---
    // Core Data
    const [initialStack, setInitialStack] = useState<(number | null)[]>(DEFAULT_STACK);

    // Playback State
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x default

    // UI State
    const [activeOp, setActiveOp] = useState<Operation>(null);
    const [isComplexityOpen, setIsComplexityOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inputs
    const [createStep, setCreateStep] = useState<'size' | 'values'>('size');
    const [createSize, setCreateSize] = useState('5');
    const [createInput, setCreateInput] = useState(DEFAULT_STACK.join(', '));
    const [pushValue, setPushValue] = useState('42');

    // Dragging - Canvas
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Dragging - Pseudocode
    const [pseudoPos, setPseudoPos] = useState({ x: 0, y: 0 });
    const [isDraggingPseudo, setIsDraggingPseudo] = useState(false);
    const [pseudoDragStart, setPseudoDragStart] = useState({ x: 0, y: 0 });

    // Dragging - Controls
    const [controlsPos, setControlsPos] = useState({ x: 0, y: 0 });
    const [isDraggingControls, setIsDraggingControls] = useState(false);
    const [controlsDragStart, setControlsDragStart] = useState({ x: 0, y: 0 });

    // Dragging - Internal State
    const [internalPos, setInternalPos] = useState({ x: 0, y: 0 });
    const [isDraggingInternal, setIsDraggingInternal] = useState(false);
    const [internalDragStart, setInternalDragStart] = useState({ x: 0, y: 0 });

    const timerRef = useRef<number | null>(null);

    // --- Generator Functions ---

    const createFrame = (
        stk: (number | null)[],
        highlights: number[],
        pointers: Pointer[],
        line: number,
        desc: string,
        opName: string
    ): Frame => ({
        stack: [...stk],
        highlights,
        pointers,
        codeLine: line,
        description: desc,
        internalState: {
            capacity: MAX_CAPACITY,
            size: stk.length, // Total elements currently in stack visual
            top: stk.length - 1, // Visual top is simply last element
            currentOp: opName
        }
    });

    const generatePushFrames = (stk: (number | null)[], val: number) => {
        const frames: Frame[] = [];
        const opName = `PUSH(${val})`;
        let currentStack = [...stk];
        let visualTop = currentStack.length - 1;

        // 1. Check Overflow
        frames.push(createFrame(currentStack, [], [{ index: visualTop, label: 'top', color: 'primary' }], 0, "Check for Stack Overflow...", opName));
        if (currentStack.length >= MAX_CAPACITY) {
            frames.push(createFrame(currentStack, [], [{ index: visualTop, label: 'top', color: 'red' }], 0, "Error: Stack Overflow", opName));
            return { startStack: stk, endStack: stk, timeline: frames };
        }

        // 2. Increment Top
        frames.push(createFrame(currentStack, [], [{ index: visualTop + 1, label: 'top', color: 'primary' }], 1, "Increment top pointer", opName));
        visualTop++;

        // 3. Insert Value
        // Animate the value appearing
        frames.push(createFrame(currentStack, [], [{ index: visualTop, label: 'top', color: 'primary' }], 2, `Assign stack[top] = ${val}`, opName));

        currentStack.push(val);
        frames.push(createFrame(currentStack, [visualTop], [{ index: visualTop, label: 'top', color: 'green' }], 2, `Pushed ${val}`, opName));

        // 4. Return
        frames.push(createFrame(currentStack, [], [{ index: visualTop, label: 'top', color: 'primary' }], 3, "Done", opName));

        return { startStack: stk, endStack: currentStack, timeline: frames };
    };

    const generatePopFrames = (stk: (number | null)[]) => {
        const frames: Frame[] = [];
        const opName = "POP()";
        let currentStack = [...stk];
        let visualTop = currentStack.length - 1;

        // 1. Check Underflow
        frames.push(createFrame(currentStack, [], [{ index: visualTop, label: 'top', color: 'primary' }], 0, "Check for Stack Underflow...", opName));
        if (visualTop < 0) {
            frames.push(createFrame(currentStack, [], [], 0, "Error: Stack Underflow", opName));
            return { startStack: stk, endStack: stk, timeline: frames };
        }

        // 2. Read Value
        const val = currentStack[visualTop];
        frames.push(createFrame(currentStack, [visualTop], [{ index: visualTop, label: 'top', color: 'primary' }], 1, `Read value ${val}`, opName));

        // 3. Decrement Top (simulate removal)
        frames.push(createFrame(currentStack, [visualTop], [{ index: visualTop - 1, label: 'top', color: 'primary' }], 2, "Decrement top pointer", opName));

        currentStack.pop();
        visualTop--;

        // 4. Return
        frames.push(createFrame(currentStack, [], [{ index: visualTop, label: 'top', color: 'primary' }], 3, `Returned ${val}`, opName));

        return { startStack: stk, endStack: currentStack, timeline: frames };
    };

    const generatePeekFrames = (stk: (number | null)[]) => {
        const frames: Frame[] = [];
        const opName = "PEEK()";
        let currentStack = [...stk];
        let visualTop = currentStack.length - 1;

        // 1. Check Empty
        frames.push(createFrame(currentStack, [], [{ index: visualTop, label: 'top', color: 'primary' }], 0, "Check if empty...", opName));
        if (visualTop < 0) {
            frames.push(createFrame(currentStack, [], [], 0, "Error: Stack Empty", opName));
            return { startStack: stk, endStack: stk, timeline: frames };
        }

        // 2. Return Top
        frames.push(createFrame(currentStack, [visualTop], [{ index: visualTop, label: 'top', color: 'green' }], 1, `Top value is ${currentStack[visualTop]}`, opName));

        return { startStack: stk, endStack: stk, timeline: frames };
    };


    // --- Handlers ---
    const toggleOp = (op: Operation) => {
        if (activeOp === op) {
            setActiveOp(null);
        } else {
            setActiveOp(op);
            setError(null);
        }
    };

    const runSimulation = (generatorResult: { endStack: (number | null)[], timeline: Frame[] }) => {
        setFrames(generatorResult.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
        setInitialStack(generatorResult.endStack);
    };

    const handlePush = () => {
        const val = parseInt(pushValue);
        if (isNaN(val)) { setError("Invalid Input"); return; }
        if (initialStack.length >= MAX_CAPACITY) { setError("Stack Overflow"); return; }

        const result = generatePushFrames(initialStack, val);
        runSimulation(result);
    };

    const handlePop = () => {
        if (initialStack.length === 0) { setError("Stack Underflow"); return; }
        const result = generatePopFrames(initialStack);
        runSimulation(result);
    };

    const handlePeek = () => {
        if (initialStack.length === 0) { setError("Stack Empty"); return; }
        const result = generatePeekFrames(initialStack);
        runSimulation(result);
    };

    const handleCreateSizeConfirm = () => {
        const size = parseInt(createSize);
        if (isNaN(size) || size <= 0 || size > MAX_CAPACITY) {
            setError(`Size must be 1-${MAX_CAPACITY}`);
            return;
        }
        setError(null);
        setCreateStep('values');
    };

    const handleCreateStepBack = () => {
        setCreateStep('size');
        setError(null);
    };

    const handleCreateCustom = () => {
        const size = parseInt(createSize);
        if (isNaN(size) || size <= 0 || size > MAX_CAPACITY) return;

        let vals: number[] = [];
        if (createInput.trim()) {
            vals = createInput.split(',')
                .map(s => s.trim())
                .filter(s => s !== '')
                .map(s => parseInt(s));
            if (vals.some(isNaN)) { setError("Invalid numbers"); return; }
        }

        // Truncate or limit
        if (vals.length > size) vals = vals.slice(0, size);

        setInitialStack(vals);
        setFrames([createFrame(vals, [], [{ index: vals.length - 1, label: 'top', color: 'primary' }], 2, `Stack Initialized (Size ${vals.length})`, "CREATE")]);
        setCurrentStep(0);
        setIsPlaying(false);
        setCreateStep('size');
    };

    const handleCreateRandom = () => {
        const size = parseInt(createSize);
        const len = (isNaN(size) || size < 1 || size > MAX_CAPACITY) ? 5 : size;
        const vals = Array.from({ length: len }, () => Math.floor(Math.random() * 99) + 1);

        setInitialStack(vals);
        setCreateInput(vals.join(', '));
        setFrames([createFrame(vals, [], [{ index: vals.length - 1, label: 'top', color: 'primary' }], 2, `Random Stack (Size ${len}) Created`, "CREATE")]);
        setCurrentStep(0);
        setIsPlaying(false);
        setCreateStep('size');
    };


    // Playback Effect - same as Arrays
    useEffect(() => {
        if (isPlaying && frames.length > 0) {
            timerRef.current = window.setInterval(() => {
                setCurrentStep(prev => {
                    if (prev < frames.length - 1) return prev + 1;
                    setIsPlaying(false);
                    return prev;
                });
            }, 1000 / playbackSpeed);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying, frames.length, playbackSpeed]);


    // Draggable Logic - Copy of Arrays.tsx logic
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseUp = () => setIsDragging(false);

    // Draggable Hooks
    const useDraggable = (
        isDragging: boolean,
        setIsDragging: (b: boolean) => void,
        dragStart: { x: number, y: number },
        setDragStart: (p: { x: number, y: number }) => void,
        setPos: (updater: (prev: { x: number, y: number }) => { x: number, y: number }) => void
    ) => {
        useEffect(() => {
            const handleWindowMouseMove = (e: MouseEvent) => {
                if (!isDragging) return;
                const dx = e.clientX - dragStart.x;
                const dy = e.clientY - dragStart.y;
                setPos(prev => ({ x: prev.x + dx, y: prev.y + dy }));
                setDragStart({ x: e.clientX, y: e.clientY });
            };
            const handleWindowMouseUp = () => setIsDragging(false);

            if (isDragging) {
                window.addEventListener('mousemove', handleWindowMouseMove);
                window.addEventListener('mouseup', handleWindowMouseUp);
            }
            return () => {
                window.removeEventListener('mousemove', handleWindowMouseMove);
                window.removeEventListener('mouseup', handleWindowMouseUp);
            };
        }, [isDragging, dragStart]);
    };

    useDraggable(isDraggingPseudo, setIsDraggingPseudo, pseudoDragStart, setPseudoDragStart, setPseudoPos);
    useDraggable(isDraggingControls, setIsDraggingControls, controlsDragStart, setControlsDragStart, setControlsPos);
    useDraggable(isDraggingInternal, setIsDraggingInternal, internalDragStart, setInternalDragStart, setInternalPos);

    const handlePseudoMouseDown = (e: React.MouseEvent) => { e.stopPropagation(); setIsDraggingPseudo(true); setPseudoDragStart({ x: e.clientX, y: e.clientY }); };
    const handleControlsMouseDown = (e: React.MouseEvent) => { e.stopPropagation(); setIsDraggingControls(true); setControlsDragStart({ x: e.clientX, y: e.clientY }); };
    const handleInternalMouseDown = (e: React.MouseEvent) => { e.stopPropagation(); setIsDraggingInternal(true); setInternalDragStart({ x: e.clientX, y: e.clientY }); };

    // Derivations
    const currentFrame = frames[currentStep] || {
        stack: initialStack,
        highlights: [],
        pointers: initialStack.length > 0 ? [{ index: initialStack.length - 1, label: 'top', color: 'primary' }] : [],
        codeLine: -1,
        description: "Ready",
        internalState: {
            capacity: MAX_CAPACITY,
            size: initialStack.length,
            top: initialStack.length - 1,
            currentOp: "None"
        }
    };

    const currentComplexity = activeOp ? COMPLEXITY[activeOp] : COMPLEXITY['push'];
    const currentPseudocode = activeOp ? PSEUDOCODE[activeOp] : [];


    return (
        <VisualizationLayout
            title="Stack"
            sidebarPosition="left"
            contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden"
            sidebar={
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Operations</h3>

                    {/* Operation: Create */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'create' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => { toggleOp('create'); setCreateStep('size'); }} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'create' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>add_circle</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'create' ? 'text-primary font-bold' : ''}`}>Create</p></div>
                        </button>
                        {activeOp === 'create' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                {createStep === 'size' ? (
                                    <>
                                        <label>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">Stack Size (Max {MAX_CAPACITY})</span>
                                            <input type="number" value={createSize} onChange={e => setCreateSize(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-md px-3 py-2 text-sm font-mono focus:border-primary outline-none mt-1" />
                                        </label>
                                        <button onClick={handleCreateSizeConfirm} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Next</button>
                                        {error && <div className="text-red-400 text-xs">{error}</div>}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <button onClick={handleCreateStepBack} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-sm">arrow_back</span></button>
                                            <span className="text-xs font-bold text-gray-500">Method</span>
                                        </div>
                                        <button onClick={handleCreateRandom} className="w-full border border-gray-600 hover:bg-white/5 text-white text-xs font-bold py-2 rounded">Generate Random</button>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400"><div className="h-px bg-gray-600 flex-1"></div>OR<div className="h-px bg-gray-600 flex-1"></div></div>
                                        <input value={createInput} onChange={e => setCreateInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-md px-3 py-2 text-sm font-mono focus:border-primary outline-none" placeholder="1, 2, 3..." />
                                        <button onClick={handleCreateCustom} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Set Values</button>
                                        {error && <div className="text-red-400 text-xs">{error}</div>}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Operation: Push */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'push' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('push')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'push' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>publish</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'push' ? 'text-primary font-bold' : ''}`}>Push (v)</p></div>
                        </button>
                        {activeOp === 'push' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Value</span><input type="number" value={pushValue} onChange={e => setPushValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                <button onClick={handlePush} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Push</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Operation: Pop */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'pop' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('pop')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'pop' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>arrow_upward</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'pop' ? 'text-primary font-bold' : ''}`}>Pop</p></div>
                        </button>
                        {activeOp === 'pop' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <p className="text-xs text-gray-400 mb-2">Remove top element?</p>
                                <button onClick={handlePop} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Pop</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Operation: Peek */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'peek' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('peek')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'peek' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>visibility</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'peek' ? 'text-primary font-bold' : ''}`}>Peek</p></div>
                        </button>
                        {activeOp === 'peek' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <p className="text-xs text-gray-400 mb-2">View top element?</p>
                                <button onClick={handlePeek} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Peek</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                </div>
            }
        >
            {/* Complexity Toggle */}
            < div className="absolute top-16 right-6 z-30 flex flex-col items-end pointer-events-none" >
                <div className="pointer-events-auto relative">
                    <button
                        onClick={() => setIsComplexityOpen(prev => !prev)}
                        className={`relative z-50 h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-all ${isComplexityOpen
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white/90 dark:bg-[#1c1a32]/90 border-gray-200 dark:border-white/10 text-primary'
                            }`}
                    >
                        <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: isComplexityOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            {isComplexityOpen ? 'close' : 'query_stats'}
                        </span>
                    </button>
                    <div className={`absolute top-0 right-0 pt-12 transition-all duration-300 origin-top-right ${isComplexityOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                        <div className="w-64 backdrop-blur-xl bg-white/80 dark:bg-[#1c1a32]/80 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden p-4 text-xs font-mono text-gray-400">
                            <div className="flex justify-between border-b border-white/10 pb-2 mb-2"><span className="text-white font-bold uppercase">{activeOp || 'STACK'}</span><span className="text-primary">{currentComplexity.avg}</span></div>
                            <div className="space-y-1">
                                <div className="flex justify-between"><span>Best</span><span className="text-emerald-400">{currentComplexity.best}</span></div>
                                <div className="flex justify-between"><span>Avg</span><span className="text-amber-400">{currentComplexity.avg}</span></div>
                                <div className="flex justify-between"><span>Worst</span><span className="text-rose-400">{currentComplexity.worst}</span></div>
                                <div className="flex justify-between border-t border-white/10 pt-1 mt-1"><span>Space</span><span className="text-blue-400">{currentComplexity.space}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Canvas */}
            <div
                className={`flex-1 flex flex-col items-center justify-center overflow-hidden relative z-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    className="flex flex-col-reverse items-center justify-end gap-1 transition-transform duration-75 ease-out origin-center p-10 min-h-[400px]"
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(1.1)` }}
                >
                    {/* Base of Stack Visual */}
                    <div className="w-40 h-2 bg-gray-300 dark:bg-gray-700 rounded-full mb-1"></div>

                    {/* Stack Elements - Rendered bottom-up via flex-col-reverse */}
                    {/* We need to map so index 0 is at bottom */}
                    {currentFrame.stack.map((val, i) => {
                        const highlight = currentFrame.highlights.includes(i);
                        const pointers = currentFrame.pointers.filter(p => p.index === i);

                        return (
                            <div key={i} className="relative w-32 h-12 flex-shrink-0">
                                {/* Value Box */}
                                <div className={`
                                        w-full h-full rounded-md flex items-center justify-center text-lg font-mono font-medium shadow-sm border-2 transition-all duration-300
                                        ${highlight
                                        ? 'bg-primary text-white border-primary scale-105 z-10 shadow-[0_0_20px_rgba(66,54,231,0.4)]'
                                        : 'bg-white dark:bg-[#1c1a32] border-gray-300 dark:border-[#383564] text-slate-900 dark:text-white'
                                    }
                                    `}>
                                    {val}
                                </div>

                                {/* Index Label (Right side) */}
                                <div className="absolute top-1/2 -translate-y-1/2 -right-8 text-xs text-gray-400 font-mono">
                                    [{i}]
                                </div>

                                {/* Pointers (Left side) */}
                                {pointers.map((p, pIdx) => (
                                    <div key={p.label} className="absolute top-1/2 -translate-y-1/2 -left-20 flex items-center justify-end w-16 gap-2">
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${p.color === 'primary' ? 'text-primary bg-[#121121] border-primary/30' :
                                                p.color === 'green' ? 'text-emerald-400 bg-[#121121] border-emerald-400/30' :
                                                    'text-red-400 bg-[#121121] border-red-400/30'
                                            }`}>
                                            {p.label}
                                        </span>
                                        <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}

                    {/* Empty State / Ghost slots if desired, or just space */}
                    {currentFrame.stack.length === 0 && (
                        <div className="text-gray-400 text-sm py-4">Stack Empty</div>
                    )}
                </div>
            </div>

            {/* Pseudocode Panel */}
            <div
                className="absolute bottom-40 right-8 w-80 backdrop-blur-xl bg-white/70 dark:bg-[#1c1a32]/70 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ transform: `translate(${pseudoPos.x}px, ${pseudoPos.y}px)` }}
            >
                <div
                    className="bg-gray-100/50 dark:bg-white/5 px-4 py-2 border-b border-gray-200 dark:border-white/5 flex justify-between items-center cursor-move select-none active:cursor-grabbing"
                    onMouseDown={handlePseudoMouseDown}
                >
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Pseudocode</span>
                    <span className="material-symbols-outlined text-gray-400 text-sm">drag_indicator</span>
                </div>
                <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                    <div className="space-y-1">
                        {currentPseudocode.map((line: string, idx: number) => (
                            <p key={idx} className={`px-2 py-1 -mx-2 rounded border-l-2 transition-colors ${idx === currentFrame.codeLine ? 'text-primary dark:text-white bg-primary/10 dark:bg-primary/20 border-primary' : 'border-transparent'}`}>
                                {idx + 1}. {line}
                            </p>
                        ))}
                        {currentPseudocode.length === 0 && <span className="text-gray-500 italic">Select an operation...</span>}
                    </div>
                </div>
            </div>

            {/* Internal State Panel */}
            <div
                className="absolute bottom-40 left-8 w-80 backdrop-blur-xl bg-white/70 dark:bg-[#1c1a32]/70 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ transform: `translate(${internalPos.x}px, ${internalPos.y}px)` }}
            >
                <div
                    className="bg-gray-100/50 dark:bg-white/5 px-4 py-2 border-b border-gray-200 dark:border-white/5 flex justify-between items-center cursor-move select-none active:cursor-grabbing"
                    onMouseDown={handleInternalMouseDown}
                >
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Internal State</span>
                    <span className="material-symbols-outlined text-gray-400 text-sm">drag_indicator</span>
                </div>
                <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                            <span>Capacity</span>
                            <span className="text-primary font-bold">{currentFrame.internalState.capacity}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                            <span>Size</span>
                            <span className="text-slate-900 dark:text-white font-bold">{currentFrame.internalState.size}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                            <span>Top Index</span>
                            <span className="text-slate-900 dark:text-white font-bold">{currentFrame.internalState.top}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Op</span>
                            <span className="text-orange-400 font-bold uppercase">{currentFrame.internalState.currentOp}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Playbar Controls */}
            <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[600px] h-20 bg-white/80 dark:bg-[#1c1a32]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl flex items-center px-8 gap-6 z-20 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ transform: `translate(calc(-50% + ${controlsPos.x}px), ${controlsPos.y}px)` }}
            >
                {/* Drag Handle */}
                <div
                    className="absolute top-0 left-0 w-full h-full cursor-move z-0 rounded-2xl group"
                    onMouseDown={handleControlsMouseDown}
                >
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" ></div>
                </div>

                <div className="relative z-10 flex items-center gap-6 w-full pointer-events-none" >
                    <div className="flex items-center gap-2 pointer-events-auto" >
                        <button onClick={() => setCurrentStep(0)} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors" title="Start"><span className="material-symbols-outlined text-[20px]">skip_previous</span></button>
                        <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors" title="Prev"><span className="material-symbols-outlined text-[20px]">fast_rewind</span></button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className={`size-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-red-500' : 'bg-primary'}`}>
                            <span className="material-symbols-outlined text-[24px] filled">{isPlaying ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button onClick={() => setCurrentStep(s => Math.min(frames.length - 1, s + 1))} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors" title="Next"><span className="material-symbols-outlined text-[20px]">fast_forward</span></button>
                        <button onClick={() => setCurrentStep(frames.length - 1)} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors" title="End"><span className="material-symbols-outlined text-[20px]">skip_next</span></button>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1.5 pointer-events-auto" >
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
                    <div className="flex items-center gap-3 w-32 border-l border-[#272546] pl-4 pointer-events-auto" >
                        <span className="material-symbols-outlined text-gray-500 text-sm">speed</span>
                        <input type="range" min="0.5" max="3" step="0.5" value={playbackSpeed} onChange={e => setPlaybackSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-[#272546] rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>
                </div>
            </div>

        </VisualizationLayout>
    );
};

export default Stack;
