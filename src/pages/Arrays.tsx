import { useState, useEffect, useRef } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useLayout } from '../context/LayoutContext';
import { ARRAYS_CODE } from '../data/ArraysCode';
import { Language } from '../data/LinkedListCode'; // Reuse Language type

// --- Types ---
type Operation = 'create' | 'search' | 'insert' | 'remove' | 'update' | null;
type SearchType = 'linear' | 'binary';

const MAX_CAPACITY = 16;
const DEFAULT_ARRAY = [2, 7, 12, 23, 45, 56, 88, 99]; // Sorted for binary search demo

interface Pointer {
    index: number;
    label: string; // 'i', 'j', 'low', 'high', 'mid'
    color: string; // 'primary', 'red', 'green'
}

interface Frame {
    array: (number | null)[];
    highlights: number[]; // indices to highlight boxes
    pointers: Pointer[];
    codeLine: number;
    description: string;
    internalState: {
        capacity: number;
        size: number;
        currentOp: string;
    };
    opValues?: { [key: string]: string | number }; // For dynamic code replacement
}

// --- Complexity Data ---
const COMPLEXITY = {
    insert: { best: 'O(1)', avg: 'O(N)', worst: 'O(N)', space: 'O(1)' },
    linear: { best: 'O(1)', avg: 'O(N)', worst: 'O(N)', space: 'O(1)' },
    binary: { best: 'O(1)', avg: 'O(log N)', worst: 'O(log N)', space: 'O(1)' },
    remove: { best: 'O(1)', avg: 'O(N)', worst: 'O(N)', space: 'O(1)' },
    update: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    create: { best: 'O(N)', avg: 'O(N)', worst: 'O(N)', space: 'O(N)' }
};

// --- Pseudocode Data (Simplified as it's now in ArraysCode.ts mostly, but kept for Fallback/Structure) ---
const PSEUDOCODE = {
    insert: [
        "if n == capacity, return error",
        "shift elements from index i to n-1 to right",
        "arr[i] = val",
        "n = n + 1"
    ],
    remove: [
        "if index out of bounds, return error",
        "shift elements from index i+1 to n-1 to left",
        "n = n - 1",
        "return"
    ],
    update: [
        "if index out of bounds, return error",
        "arr[i] = newValue",
        "return"
    ],
    linear: [ // Linear
        "for i from 0 to n-1",
        "  if arr[i] == target",
        "    return i",
        "return -1"
    ],
    binary: [
        "low = 0, high = n - 1",
        "while low <= high:",
        "  mid = (low + high) / 2",
        "  if arr[mid] == target return mid",
        "  else if arr[mid] < target low = mid + 1",
        "  else high = mid - 1"
    ],
    create: [
        "allocate memory for size N",
        "initialize size = 0",
        "return array reference"
    ]
};

const Arrays = () => {
    // --- State ---
    const [initialArray, setInitialArray] = useState<(number | null)[]>(DEFAULT_ARRAY);
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // UI State
    const [activeOp, setActiveOp] = useState<Operation>(null);
    const [searchType, setSearchType] = useState<SearchType>('linear');
    const [isComplexityOpen, setIsComplexityOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inputs
    const [createStep, setCreateStep] = useState<'size' | 'values'>('size');
    const [createSize, setCreateSize] = useState('8');
    const [createInput, setCreateInput] = useState(DEFAULT_ARRAY.join(', '));
    const [searchInput, setSearchInput] = useState('');
    const [insertIndex, setInsertIndex] = useState('3');
    const [insertValue, setInsertValue] = useState('88');
    const [removeIndex, setRemoveIndex] = useState('');
    const [updateIndex, setUpdateIndex] = useState('');
    const [updateValue, setUpdateValue] = useState('');

    // Sidebar & Code State
    const { isSidebarOpen, setIsSidebarOpen } = useLayout();
    const [showPseudocode, setShowPseudocode] = useState(false);
    const [showRealCode, setShowRealCode] = useState(false);
    const [codeLanguage, setCodeLanguage] = useState<Language>('python');


    // Canvas State
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.6);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const timerRef = useRef<number | null>(null);

    // Effects for Code Toggle
    useEffect(() => {
        if (showPseudocode || showRealCode) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [showPseudocode, showRealCode, setIsSidebarOpen]);

    const togglePseudocode = () => {
        if (!showPseudocode) setShowRealCode(false);
        setShowPseudocode(prev => !prev);
    };

    const toggleRealCode = () => {
        if (!showRealCode) setShowPseudocode(false);
        setShowRealCode(prev => !prev);
    };

    // --- Generator Functions ---
    const createFrame = (
        arr: (number | null)[],
        highlights: number[],
        pointers: Pointer[],
        line: number,
        desc: string,
        opName: string,
        opValues?: { [key: string]: string | number }
    ): Frame => ({
        array: [...arr],
        highlights,
        pointers,
        codeLine: line,
        description: desc,
        internalState: {
            capacity: MAX_CAPACITY,
            size: arr.filter(x => x !== null).length,
            currentOp: opName
        },
        opValues
    });

    const generateInsertFrames = (arr: (number | null)[], idx: number, val: number) => {
        const frames: Frame[] = [];
        const opName = 'insert';
        const opValues = { index: idx, val, n: arr.filter(x => x !== null).length, capacity: MAX_CAPACITY };
        let currentArr = [...arr];

        // 0. Capacity Check
        frames.push(createFrame(currentArr, [], [], 0, "Check capacity", opName, opValues));
        if (arr.filter(x => x !== null).length >= MAX_CAPACITY) {
            frames.push(createFrame(currentArr, [], [], 0, "Error: Capacity Reached", opName, opValues));
            return { startArr: arr, endArr: arr, timeline: frames };
        }

        // 1. Shift Loop
        const size = currentArr.filter(x => x !== null).length;
        frames.push(createFrame(currentArr, [], [{ index: size - 1, label: 'i', color: 'primary' }], 1, `Shift loop start from ${size - 1}`, opName, opValues));

        for (let i = size - 1; i >= idx; i--) {
            frames.push(createFrame(currentArr, [i], [{ index: i, label: 'i', color: 'primary' }], 1, `i=${i} >= ${idx}`, opName, opValues));
            frames.push(createFrame(currentArr, [i, i + 1], [{ index: i, label: 'i', color: 'primary' }, { index: i + 1, label: 'i+1', color: 'primary' }], 2, `Wait shift`, opName, opValues));

            // Move
            currentArr[i + 1] = currentArr[i];
            currentArr[i] = null;
            frames.push(createFrame(currentArr, [i + 1], [{ index: i + 1, label: 'i+1', color: 'primary' }], 2, `Shifted arr[${i}] to arr[${i + 1}]`, opName, opValues));
        }

        // 3. Insert
        frames.push(createFrame(currentArr, [idx], [], 3, `Insert ${val} at index ${idx}`, opName, opValues));
        currentArr[idx] = val;
        frames.push(createFrame(currentArr, [idx], [{ index: idx, label: 'new', color: 'green' }], 3, `Inserted`, opName, opValues));

        // 4. Update Size
        frames.push(createFrame(currentArr, [], [], 4, "n++", opName, opValues));

        return { startArr: arr, endArr: currentArr, timeline: frames };
    };

    const generateRemoveFrames = (arr: (number | null)[], idx: number) => {
        const frames: Frame[] = [];
        const opName = 'remove';
        const opValues = { index: idx, n: arr.filter(x => x !== null).length };
        let currentArr = [...arr];
        const size = currentArr.filter(x => x !== null).length;

        // 0. Bounds
        frames.push(createFrame(currentArr, [], [{ index: idx, label: 'target', color: 'red' }], 0, `Check bounds`, opName, opValues));

        // 1. Shift Loop
        for (let i = idx; i < size - 1; i++) {
            frames.push(createFrame(currentArr, [i, i + 1], [{ index: i, label: 'i', color: 'primary' }], 1, `Shift loop i=${i}`, opName, opValues));
            currentArr[i] = currentArr[i + 1];
            currentArr[i + 1] = null;
            frames.push(createFrame(currentArr, [i], [{ index: i, label: 'i', color: 'primary' }], 1, `Shifted`, opName, opValues));
        }
        if (size > 0 && idx < size) {
            currentArr[size - 1] = null;
        }

        // 2. Size
        frames.push(createFrame(currentArr, [], [], 2, "n--", opName, opValues));

        return { startArr: arr, endArr: currentArr, timeline: frames };
    };

    const generateLinearSearchFrames = (arr: (number | null)[], target: number) => {
        const frames: Frame[] = [];
        const opName = 'search_linear';
        const opValues = { target, n: arr.filter(x => x !== null).length };
        const currentArr = [...arr];
        const size = currentArr.filter(x => x !== null).length;

        for (let i = 0; i < size; i++) {
            frames.push(createFrame(currentArr, [i], [{ index: i, label: 'i', color: 'primary' }], 1, `Check arr[${i}]`, opName, opValues));

            if (currentArr[i] === target) {
                frames.push(createFrame(currentArr, [i], [{ index: i, label: 'FOUND', color: 'green' }], 2, `Found ${target}!`, opName, opValues));
                return { startArr: arr, endArr: arr, timeline: frames };
            }
        }

        frames.push(createFrame(currentArr, [], [], 3, `Not found`, opName, opValues));
        return { startArr: arr, endArr: arr, timeline: frames };
    };

    const generateBinarySearchFrames = (arr: (number | null)[], target: number) => {
        const frames: Frame[] = [];
        const opName = 'search_binary';
        const opValues = { target, n: arr.filter(x => x !== null).length };
        const currentArr = [...arr];
        const size = currentArr.filter(x => x !== null).length;

        let low = 0;
        let high = size - 1;

        frames.push(createFrame(currentArr, [], [{ index: low, label: 'L', color: 'primary' }, { index: high, label: 'H', color: 'primary' }], 0, `Init low=0, high=${high}`, opName, opValues));

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            frames.push(createFrame(
                currentArr,
                [mid],
                [
                    { index: low, label: 'L', color: 'primary' },
                    { index: high, label: 'H', color: 'primary' },
                    { index: mid, label: 'M', color: 'green' }
                ],
                2,
                `Check mid ${mid}`,
                opName, opValues
            ));

            if (currentArr[mid] === target) {
                frames.push(createFrame(currentArr, [mid], [{ index: mid, label: 'FOUND', color: 'green' }], 3, `Found ${target}!`, opName, opValues));
                return { startArr: arr, endArr: arr, timeline: frames };
            } else if ((currentArr[mid] as number) < target) {
                frames.push(createFrame(currentArr, [mid], [], 4, `Go Right`, opName, opValues));
                low = mid + 1;
            } else {
                frames.push(createFrame(currentArr, [mid], [], 5, `Go Left`, opName, opValues));
                high = mid - 1;
            }
        }

        frames.push(createFrame(currentArr, [], [], 6, `Not found`, opName, opValues));
        return { startArr: arr, endArr: arr, timeline: frames };
    };

    const generateUpdateFrames = (arr: (number | null)[], idx: number, val: number) => {
        const frames: Frame[] = [];
        const opName = 'update';
        const opValues = { index: idx, val, n: arr.filter(x => x !== null).length };
        const currentArr = [...arr];

        frames.push(createFrame(currentArr, [idx], [{ index: idx, label: 'i', color: 'primary' }], 0, `Locate`, opName, opValues));

        currentArr[idx] = val;
        frames.push(createFrame(currentArr, [idx], [{ index: idx, label: 'i', color: 'green' }], 1, `Update`, opName, opValues));

        return { startArr: arr, endArr: currentArr, timeline: frames };
    }

    // --- Execution ---
    const runSimulation = (generatorResult: { endArr: (number | null)[], timeline: Frame[] }) => {
        setFrames(generatorResult.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
        setInitialArray(generatorResult.endArr);
    };

    const handleInsert = () => {
        const idx = parseInt(insertIndex);
        const val = parseInt(insertValue);
        if (isNaN(idx) || isNaN(val)) { setError("Invalid Inputs"); return; }
        if (idx < 0 || idx > initialArray.filter(x => x !== null).length) { setError("Bounds Error"); return; }
        if (initialArray.filter(x => x !== null).length >= MAX_CAPACITY) { setError("Full"); return; }
        runSimulation(generateInsertFrames(initialArray, idx, val));
    };

    const handleRemove = () => {
        const idx = parseInt(removeIndex);
        if (isNaN(idx)) { setError("Invalid Input"); return; }
        const size = initialArray.filter(x => x !== null).length;
        if (idx < 0 || idx >= size) { setError("Bounds Error"); return; }
        runSimulation(generateRemoveFrames(initialArray, idx));
    };

    const handleUpdate = () => {
        const idx = parseInt(updateIndex);
        const val = parseInt(updateValue);
        if (isNaN(idx) || isNaN(val)) { setError("Invalid Inputs"); return; }
        const size = initialArray.filter(x => x !== null).length;
        if (idx < 0 || idx >= size) { setError("Bounds Error"); return; }
        runSimulation(generateUpdateFrames(initialArray, idx, val));
    };

    const handleSearch = () => {
        const val = parseInt(searchInput);
        if (isNaN(val)) { setError("Invalid Input"); return; }
        const result = searchType === 'linear'
            ? generateLinearSearchFrames(initialArray, val)
            : generateBinarySearchFrames(initialArray, val);
        runSimulation(result);
    };

    const handleCreateCustom = () => {
        const size = parseInt(createSize);
        if (isNaN(size) || size <= 0 || size > MAX_CAPACITY) { setError(`Max ${MAX_CAPACITY}`); return; }
        let vals: number[] = [];
        if (createInput.trim()) {
            vals = createInput.split(',').map(s => s.trim()).filter(s => s !== '').map(s => parseInt(s));
            if (vals.some(isNaN)) { setError("Invalid numbers"); return; }
        }
        if (vals.length < size) vals = [...vals, ...Array(size - vals.length).fill(0)];
        else if (vals.length > size) vals = vals.slice(0, size);
        setInitialArray(vals);
        setFrames([createFrame(vals, [], [], 2, `Initialized`, "create")]);
        setCurrentStep(0); setCreateStep('size');
    };

    const handleCreateRandom = () => {
        const size = parseInt(createSize) || 8;
        const vals = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1).sort((a, b) => a - b);
        setInitialArray(vals);
        setCreateInput(vals.join(', '));
        setFrames([createFrame(vals, [], [], 2, `Randomized`, "create")]);
        setCurrentStep(0); setCreateStep('size');
    };

    // --- Playback Effect ---
    useEffect(() => {
        if (isPlaying && frames.length > 0) {
            timerRef.current = window.setInterval(() => {
                setCurrentStep(prev => {
                    if (prev < frames.length - 1) return prev + 1;
                    setIsPlaying(false);
                    return prev;
                });
            }, 1000 / playbackSpeed);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying, frames.length, playbackSpeed]);

    // Zoom/Pan
    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setLastMousePos({ x: e.clientX, y: e.clientY }); };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan(prev => ({ x: prev.x + e.clientX - lastMousePos.x, y: prev.y + e.clientY - lastMousePos.y }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseUp = () => setIsDragging(false);
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || true) {
            e.preventDefault();
            const delta = -e.deltaY;
            setScale(prev => Math.min(Math.max(0.2, prev + (delta * 0.001)), 3));
        }
    };

    // Auto-Resize
    const currentFrame = frames[currentStep] || {
        array: initialArray, highlights: [], pointers: [], codeLine: -1, description: "Ready",
        internalState: { capacity: MAX_CAPACITY, size: initialArray.filter(x => x !== null).length, currentOp: "None" }
    };

    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const contentWidth = currentFrame.array.length * 70 + 100;
            if (contentWidth > containerWidth) setScale(Math.max(0.2, (containerWidth / contentWidth) * 0.6));
            else setScale(0.6);
        }
    }, [currentFrame.array.length, isSidebarOpen]);

    // Data for UI
    const currentComplexity = activeOp === 'search' ? COMPLEXITY[searchType] : (activeOp ? COMPLEXITY[activeOp] : COMPLEXITY['insert']);
    const currentPseudocode = activeOp === 'search' ? PSEUDOCODE[searchType] : (activeOp ? PSEUDOCODE[activeOp] : []);

    // --- Right Sidebar (Code) ---
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
                            {currentPseudocode.length > 0 ? currentPseudocode.map((line, idx) => (
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
                        <div className="flex p-1 bg-gray-100 dark:bg-[#151426] rounded-lg">
                            {(['c', 'cpp', 'java', 'python'] as Language[]).map(lang => (
                                <button key={lang} onClick={() => setCodeLanguage(lang)} className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all duration-200 ${codeLanguage === lang ? 'bg-white dark:bg-[#272546] text-primary shadow-sm scale-100' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5'}`}>
                                    {lang === 'c' ? 'C' : lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : 'Python'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-y-auto">
                        <div className="space-y-0.5">
                            {(() => {
                                // Resolve op key for code lookup
                                let codeOpKey = '';
                                if (activeOp === 'insert') codeOpKey = 'insert';
                                else if (activeOp === 'remove') codeOpKey = 'remove';
                                else if (activeOp === 'search') codeOpKey = searchType === 'binary' ? 'search_binary' : 'search_linear';
                                else if (activeOp === 'update') codeOpKey = 'update';
                                else if (activeOp === 'create') codeOpKey = 'create';

                                if (!codeOpKey || !ARRAYS_CODE[codeOpKey]) return <span className="text-gray-500 italic px-2">No code available.</span>;

                                const codeData = ARRAYS_CODE[codeOpKey][codeLanguage];
                                const activeLines = codeData.mapping[currentFrame.codeLine];
                                const activeLineIndices = Array.isArray(activeLines) ? activeLines : (activeLines !== undefined ? [activeLines] : []);

                                return codeData.lines.map((lineRaw: string, idx: number) => {
                                    let line = lineRaw;
                                    if (currentFrame.opValues) {
                                        Object.keys(currentFrame.opValues).forEach((key) => {
                                            const val = currentFrame.opValues![key];
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

    // --- Left Sidebar (Controls) ---
    const sidebarControls = (
        <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Operations</h3>

            {/* Create */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'create' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => { toggleOp('create'); setCreateStep('size'); }} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'create' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>add_circle</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'create' ? 'text-primary font-bold' : ''}`}>Create</p></div>
                </button>
                {activeOp === 'create' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3">
                        {createStep === 'size' ? (
                            <>
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Size</span><input type="number" value={createSize} onChange={e => setCreateSize(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white mt-1" /></label>
                                <button onClick={() => setCreateStep('values')} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Next</button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleCreateRandom} className="w-full border border-gray-600 hover:bg-white/5 text-white text-xs font-bold py-2 rounded">Random</button>
                                <div className="text-center text-[10px] text-gray-500">- OR -</div>
                                <input value={createInput} onChange={e => setCreateInput(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm font-mono text-white" placeholder="10, 20..." />
                                <button onClick={handleCreateCustom} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Set</button>
                            </>
                        )}
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>

            {/* Search */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'search' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => toggleOp('search')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'search' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>search</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'search' ? 'text-primary font-bold' : ''}`}>Search</p></div>
                </button>
                {activeOp === 'search' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3">
                        <div className="flex gap-2">
                            <button onClick={() => setSearchType('linear')} className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border ${searchType === 'linear' ? 'bg-primary text-white border-primary' : 'border-gray-600 text-gray-400'}`}>Linear</button>
                            <button onClick={() => setSearchType('binary')} className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border ${searchType === 'binary' ? 'bg-primary text-white border-primary' : 'border-gray-600 text-gray-400'}`}>Binary</button>
                        </div>
                        <input type="number" value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" placeholder="Target..." />
                        <button onClick={handleSearch} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Find</button>
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>

            {/* Insert */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'insert' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => toggleOp('insert')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'insert' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>arrow_right_alt</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'insert' ? 'text-primary font-bold' : ''}`}>Insert</p></div>
                </button>
                {activeOp === 'insert' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                            <label><span className="text-[10px] text-gray-400 uppercase font-bold">Idx</span><input type="number" value={insertIndex} onChange={e => setInsertIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                            <label><span className="text-[10px] text-gray-400 uppercase font-bold">Val</span><input type="number" value={insertValue} onChange={e => setInsertValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                        </div>
                        <button onClick={handleInsert} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Execute</button>
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>

            {/* Remove */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'remove' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => toggleOp('remove')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'remove' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>delete</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'remove' ? 'text-primary font-bold' : ''}`}>Remove</p></div>
                </button>
                {activeOp === 'remove' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3">
                        <label><span className="text-[10px] text-gray-400 uppercase font-bold">Index</span><input type="number" value={removeIndex} onChange={e => setRemoveIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                        <button onClick={handleRemove} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Execute</button>
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>

            {/* Update */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'update' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => toggleOp('update')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'update' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>edit</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'update' ? 'text-primary font-bold' : ''}`}>Update</p></div>
                </button>
                {activeOp === 'update' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                            <label><span className="text-[10px] text-gray-400 uppercase font-bold">Idx</span><input type="number" value={updateIndex} onChange={e => setUpdateIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                            <label><span className="text-[10px] text-gray-400 uppercase font-bold">Val</span><input type="number" value={updateValue} onChange={e => setUpdateValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                        </div>
                        <button onClick={handleUpdate} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Execute</button>
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>
        </div>
    );

    const toggleOp = (op: Operation) => {
        if (activeOp === op) setActiveOp(null);
        else { setActiveOp(op); setError(null); }
    };

    return (
        <VisualizationLayout
            title="Arrays"
            sidebarPosition="left"
            contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden"
            sidebar={sidebarControls}
            rightSidebar={rightSidebarContent}
            controls={
                <div className={`transition-all duration-300 z-30 w-full bg-white dark:bg-[#131221] border-t border-gray-200 dark:border-[#272546] px-8 py-4 flex items-center justify-between gap-8 h-20 shadow-md relative`}>
                    {/* Playback Buttons */}
                    <div className={`flex items-center gap-4`}>
                        <button onClick={() => setCurrentStep(0)} className="text-gray-400 hover:text-white transition-colors"><span className={`material-symbols-outlined text-[24px]`}>skip_previous</span></button>
                        <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} className="text-gray-400 hover:text-white transition-colors"><span className={`material-symbols-outlined text-[28px]`}>fast_rewind</span></button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className={`rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 bg-primary size-12`}>
                            <span className={`material-symbols-outlined filled text-[28px]`}>{isPlaying ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button onClick={() => setCurrentStep(s => Math.min(frames.length - 1, s + 1))} className="text-gray-400 hover:text-white transition-colors"><span className={`material-symbols-outlined text-[28px]`}>fast_forward</span></button>
                        <button onClick={() => setCurrentStep(frames.length - 1)} className="text-gray-400 hover:text-white transition-colors"><span className={`material-symbols-outlined text-[24px]`}>skip_next</span></button>
                    </div>
                    {/* Timeline */}
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
                    {/* Speed */}
                    <div className={`flex items-center gap-3 border-l border-gray-200 dark:border-[#272546] w-40 pl-6`}>
                        <span className="material-symbols-outlined text-gray-400 text-sm">speed</span>
                        <input type="range" min="0.5" max="3" step="0.5" value={playbackSpeed} onChange={e => setPlaybackSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-gray-200 dark:bg-[#272546] rounded-lg appearance-none cursor-pointer accent-primary" />
                        <span className="text-xs font-mono text-gray-500 w-8">{playbackSpeed}x</span>
                    </div>
                </div>
            }
        >
            {/* Top Right Toggles */}
            <div className="absolute top-6 right-6 z-30 flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2">
                    <button onClick={() => setIsComplexityOpen(prev => !prev)} className={`relative h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-all ${isComplexityOpen ? 'bg-primary text-white border-primary' : 'bg-white/90 dark:bg-[#1c1a32]/90 border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#9794c7]'}`} title="Complexity">
                        <span className="material-symbols-outlined text-[20px] transition-transform duration-300" style={{ transform: isComplexityOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>{isComplexityOpen ? 'close' : 'query_stats'}</span>
                    </button>
                    <button onClick={togglePseudocode} className={`h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-all ${showPseudocode ? 'bg-primary text-white border-primary' : 'bg-white/90 dark:bg-[#1c1a32]/90 border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#9794c7]'}`} title="Pseudocode">
                        <span className="material-symbols-outlined text-[20px]">code</span>
                    </button>
                    <button onClick={toggleRealCode} className={`h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-all ${showRealCode ? 'bg-primary text-white border-primary' : 'bg-white/90 dark:bg-[#1c1a32]/90 border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#9794c7]'}`} title="Real Code">
                        <span className="material-symbols-outlined text-[20px]">terminal</span>
                    </button>
                </div>
                {/* Complexity Panel */}
                <div className={`transition-all duration-300 origin-top-right ${isComplexityOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                    <div className="w-64 backdrop-blur-xl bg-white/90 dark:bg-[#1c1a32]/90 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden p-4 text-xs font-mono text-gray-400 ml-auto">
                        <div className="flex justify-between border-b border-white/10 pb-2 mb-2"><span className="text-gray-900 dark:text-white font-bold uppercase">{activeOp || 'Insert'}</span><span className="text-primary">{currentComplexity.avg}</span></div>
                        <div className="space-y-1">
                            <div className="flex justify-between"><span>Best</span><span className="text-emerald-500">{currentComplexity.best}</span></div>
                            <div className="flex justify-between"><span>Avg</span><span className="text-amber-500">{currentComplexity.avg}</span></div>
                            <div className="flex justify-between"><span>Worst</span><span className="text-rose-500">{currentComplexity.worst}</span></div>
                            <div className="flex justify-between border-t border-white/10 pt-1 mt-1"><span>Space</span><span className="text-blue-500">{currentComplexity.space}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div ref={containerRef} className={`flex-1 flex flex-col items-center justify-start pt-32 overflow-hidden relative z-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
                <div ref={contentRef} className="flex flex-col items-start gap-2 transition-transform duration-75 ease-out origin-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale * 1.1})` }}>
                    <div className="flex gap-1 ml-1 select-none">{(currentFrame.array).map((_, i) => <div key={i} className="w-14 text-center text-xs font-mono text-gray-500">{i}</div>)}</div>
                    <div className="flex gap-1">
                        {currentFrame.array.map((val, i) => {
                            const highlight = currentFrame.highlights.indexOf(i) !== -1;
                            const pointers = currentFrame.pointers.filter(p => p.index === i);
                            return (
                                <div key={i} className={`w-14 h-14 rounded flex items-center justify-center text-lg font-mono font-medium shadow-sm relative group transition-all duration-300 ${highlight ? 'bg-primary text-white border-2 border-primary scale-110 z-10 shadow-[0_0_20px_rgba(66,54,231,0.4)]' : 'bg-white dark:bg-[#1c1a32] border border-gray-300 dark:border-[#383564] text-slate-900 dark:text-white'} ${val === null ? 'border-dashed opacity-50' : ''}`}>
                                    {val === null ? 'null' : val}
                                    {pointers.map((p, pIdx) => (
                                        <div key={p.label} className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ marginTop: `-${pIdx * 24}px` }}>
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border mb-1 ${p.color === 'primary' ? 'text-primary bg-[#121121] border-primary/30' : p.color === 'green' ? 'text-emerald-400 bg-[#121121] border-emerald-400/30' : 'text-red-400 bg-[#121121] border-red-400/30'}`}>{p.label}</span>
                                            {pIdx === 0 && <span className={`material-symbols-outlined text-xl font-bold animate-bounce ${p.color === 'primary' ? 'text-primary' : p.color === 'green' ? 'text-emerald-400' : 'text-red-400'}`}>arrow_downward</span>}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </VisualizationLayout>
    );
};

export default Arrays;
