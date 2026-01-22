import { useState, useEffect, useRef } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useLayout } from '../context/LayoutContext'; // Import useLayout

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

// --- Pseudocode Data ---
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
    // Core Data
    const [initialArray, setInitialArray] = useState<(number | null)[]>(DEFAULT_ARRAY);
    // Note: We use 'initialArray' as the base for new operations. 
    // The visualization renders 'frames[currentStep].array'.
    // When an op finishes, we update 'initialArray' to the matching final state.

    // Playback State
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x default

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

    // Toggle States for Panels
    const [showPseudocode, setShowPseudocode] = useState(false);
    const [showInternalState, setShowInternalState] = useState(false);

    // Canvas Dragging (Keep this)
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    const timerRef = useRef<number | null>(null);

    // --- Generator Functions ---
    // These create the timeline of frames based on the operation

    const createFrame = (
        arr: (number | null)[],
        highlights: number[],
        pointers: Pointer[],
        line: number,
        desc: string,
        opName: string
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
        }
    });

    const generateInsertFrames = (arr: (number | null)[], idx: number, val: number) => {
        const frames: Frame[] = [];
        const opName = `INSERT(${idx}, ${val})`;
        let currentArr = [...arr];

        // 1. Check Capacity
        frames.push(createFrame(currentArr, [], [], 0, "Check capacity...", opName));
        if (arr.filter(x => x !== null).length >= MAX_CAPACITY) {
            frames.push(createFrame(currentArr, [], [], 0, "Error: Capacity Reached", opName));
            return { startArr: arr, endArr: arr, timeline: frames };
        }

        // 2. Shift Elements
        // Visualizing the shift loop
        // We start from the end and move right
        const size = currentArr.filter(x => x !== null).length;

        // Temporarily expand array visualization if needed
        if (currentArr.length < MAX_CAPACITY) {
            // Ensure we have enough null spots for visualization if we strictly filtered before
            // But here we usually keep size = elements, so just push if needed
        }

        frames.push(createFrame(currentArr, [], [], 1, `Shift elements from ${idx} to right`, opName));

        for (let i = size - 1; i >= idx; i--) {
            // Highlight moving element
            frames.push(createFrame(currentArr, [i], [{ index: i, label: 'i', color: 'primary' }], 1, `Shifting arr[${i}] -> arr[${i + 1}]`, opName));

            // Move
            currentArr[i + 1] = currentArr[i];
            currentArr[i] = null; // visualization gap

            frames.push(createFrame(currentArr, [i + 1], [{ index: i + 1, label: 'i+1', color: 'primary' }], 1, `Shifted`, opName));
        }

        // 3. Insert
        frames.push(createFrame(currentArr, [idx], [], 2, `Insert ${val} at index ${idx}`, opName));
        currentArr[idx] = val;
        frames.push(createFrame(currentArr, [idx], [{ index: idx, label: 'new', color: 'green' }], 2, `Inserted ${val}`, opName));

        // 4. Update Size
        frames.push(createFrame(currentArr, [], [], 3, "Increment size (n++)", opName));

        return { startArr: arr, endArr: currentArr, timeline: frames };
    };

    const generateRemoveFrames = (arr: (number | null)[], idx: number) => {
        const frames: Frame[] = [];
        const opName = `REMOVE(${idx})`;
        let currentArr = [...arr];
        const size = currentArr.filter(x => x !== null).length;

        // 1. Check Bounds
        frames.push(createFrame(currentArr, [], [{ index: idx, label: 'target', color: 'red' }], 0, `Check bounds for index ${idx}`, opName));

        // 2. Shift Left
        frames.push(createFrame(currentArr, [idx], [], 1, `Shift elements left to overwrite index ${idx}`, opName));

        for (let i = idx; i < size - 1; i++) {
            frames.push(createFrame(currentArr, [i, i + 1], [{ index: i, label: 'i', color: 'primary' }], 1, `Copy arr[${i + 1}] to arr[${i}]`, opName));
            currentArr[i] = currentArr[i + 1];
            currentArr[i + 1] = null; // clear after move
            frames.push(createFrame(currentArr, [i], [{ index: i, label: 'i', color: 'primary' }], 1, `Shifted`, opName));
        }

        // Clean up last element if it wasn't nullified (if full)
        if (size > 0 && idx < size) {
            currentArr[size - 1] = null; // The last element is now duplicate or cleared
        }

        // 3. Update Size
        frames.push(createFrame(currentArr, [], [], 2, "Decrement size (n--)", opName));

        return { startArr: arr, endArr: currentArr, timeline: frames };
    };

    const generateLinearSearchFrames = (arr: (number | null)[], target: number) => {
        const frames: Frame[] = [];
        const opName = `SEARCH_LINEAR(${target})`;
        const currentArr = [...arr];
        const size = currentArr.filter(x => x !== null).length;

        for (let i = 0; i < size; i++) {
            frames.push(createFrame(currentArr, [i], [{ index: i, label: 'i', color: 'primary' }], 1, `Checking if arr[${i}] (${currentArr[i]}) == ${target}`, opName));

            if (currentArr[i] === target) {
                frames.push(createFrame(currentArr, [i], [{ index: i, label: 'FOUND', color: 'green' }], 2, `Found ${target} at index ${i}!`, opName));
                return { startArr: arr, endArr: arr, timeline: frames };
            }
        }

        frames.push(createFrame(currentArr, [], [], 3, `${target} not found`, opName));
        return { startArr: arr, endArr: arr, timeline: frames };
    };

    const generateBinarySearchFrames = (arr: (number | null)[], target: number) => {
        const frames: Frame[] = [];
        const opName = `SEARCH_BINARY(${target})`;
        const currentArr = [...arr]; // Note: Binary Search assumes sorted. We visualize 'as-is' but user should create sorted array.
        const size = currentArr.filter(x => x !== null).length;

        let low = 0;
        let high = size - 1;

        frames.push(createFrame(currentArr, [], [{ index: low, label: 'L', color: 'primary' }, { index: high, label: 'H', color: 'primary' }], 0, `Initialize low=0, high=${high}`, opName));

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
                `Checking mid index ${mid} (${currentArr[mid]})`,
                opName
            ));

            if (currentArr[mid] === target) {
                frames.push(createFrame(currentArr, [mid], [{ index: mid, label: 'FOUND', color: 'green' }], 3, `Found ${target} at index ${mid}!`, opName));
                return { startArr: arr, endArr: arr, timeline: frames };
            } else if ((currentArr[mid] as number) < target) {
                frames.push(createFrame(currentArr, [mid], [], 4, `${currentArr[mid]} < ${target}, look right`, opName));
                low = mid + 1;
            } else {
                frames.push(createFrame(currentArr, [mid], [], 5, `${currentArr[mid]} > ${target}, look left`, opName));
                high = mid - 1;
            }
        }

        frames.push(createFrame(currentArr, [], [], 6, `${target} not found`, opName));
        return { startArr: arr, endArr: arr, timeline: frames };
    };

    const generateUpdateFrames = (arr: (number | null)[], idx: number, val: number) => {
        const frames: Frame[] = [];
        const opName = `UPDATE(${idx}, ${val})`;
        const currentArr = [...arr];

        frames.push(createFrame(currentArr, [idx], [{ index: idx, label: 'i', color: 'primary' }], 0, `Locate index ${idx}`, opName));

        currentArr[idx] = val;
        frames.push(createFrame(currentArr, [idx], [{ index: idx, label: 'i', color: 'green' }], 1, `Update value to ${val}`, opName));

        return { startArr: arr, endArr: currentArr, timeline: frames };
    }


    // --- Handlers ---

    // Toggle Logic
    const toggleOp = (op: Operation) => {
        if (activeOp === op) {
            setActiveOp(null); // Collapse if already open
        } else {
            setActiveOp(op);
            setError(null); // Clear errors on switch
        }
    };

    // Execution Logic
    const runSimulation = (generatorResult: { endArr: (number | null)[], timeline: Frame[] }) => {
        setFrames(generatorResult.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
        // Important: We don't update 'initialArray' immediately.
        // We update it ONLY at the end of animation so the next op starts from correct state,
        // OR we can update it immediately but the visualizer uses 'frames'.
        // To allow 'Reset', usually better to keep start state.
        // For this simple linear flow, we'll update the 'initialArray' at the end of the timeline?
        // Actually, if we want to allow 'Prev' step, we should generate frames from current state,
        // and only commit the mutation to 'initialArray' once the user confirms or starts a NEW op.
        // Simplification: We will just commit the result to 'initialArray' immediately for generating *next* op,
        // but the VISUALIZATION uses the 'frames'.
        setInitialArray(generatorResult.endArr);
    };

    const handleInsert = () => {
        const idx = parseInt(insertIndex);
        const val = parseInt(insertValue);

        if (isNaN(idx) || isNaN(val)) { setError("Invalid Inputs"); return; }
        if (idx < 0 || idx > initialArray.filter(x => x !== null).length) { setError("Index out of bounds"); return; }
        if (initialArray.filter(x => x !== null).length >= MAX_CAPACITY) { setError("Array Full"); return; }

        const result = generateInsertFrames(initialArray, idx, val);
        runSimulation(result);
    };

    const handleRemove = () => {
        const idx = parseInt(removeIndex);
        if (isNaN(idx)) { setError("Invalid Input"); return; }
        const size = initialArray.filter(x => x !== null).length;
        if (idx < 0 || idx >= size) { setError(`Index ${idx} out of bounds`); return; }

        const result = generateRemoveFrames(initialArray, idx);
        runSimulation(result);
    };

    const handleUpdate = () => {
        const idx = parseInt(updateIndex);
        const val = parseInt(updateValue);
        if (isNaN(idx) || isNaN(val)) { setError("Invalid Inputs"); return; }
        const size = initialArray.filter(x => x !== null).length;
        if (idx < 0 || idx >= size) { setError("Index out of bounds"); return; }

        const result = generateUpdateFrames(initialArray, idx, val);
        runSimulation(result);
    };

    const handleSearch = () => {
        const val = parseInt(searchInput);
        if (isNaN(val)) { setError("Invalid Input"); return; }

        const result = searchType === 'linear'
            ? generateLinearSearchFrames(initialArray, val)
            : generateBinarySearchFrames(initialArray, val);
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
        // Parse size constraint
        const size = parseInt(createSize);
        if (isNaN(size) || size <= 0 || size > MAX_CAPACITY) {
            setError(`Invalid Size (Max ${MAX_CAPACITY})`);
            return;
        }

        // Parse input values
        let vals: number[] = [];
        if (createInput.trim()) {
            vals = createInput.split(',')
                .map(s => s.trim())
                .filter(s => s !== '') // Handle "1, 2, " trailing comma
                .map(s => parseInt(s));

            if (vals.some(isNaN)) { setError("Invalid numbers in input"); return; }
        }

        // Enforce Size Constraint (Pad or Truncate)
        if (vals.length < size) {
            // Pad with zeros
            const zerosNeeded = size - vals.length;
            vals = [...vals, ...Array(zerosNeeded).fill(0)];
        } else if (vals.length > size) {
            // Truncate
            vals = vals.slice(0, size);
        }

        setInitialArray(vals);
        // Clear timeline
        setFrames([createFrame(vals, [], [], 2, `Array Initialized (Size ${size})`, "CREATE")]);
        setCurrentStep(0);
        setIsPlaying(false);
        setCreateStep('size'); // Reset
    };

    const handleCreateRandom = () => {
        // Generate random array of specific size from Step 1
        const size = parseInt(createSize);
        // Fallback if invalid (should be caught by step 1 check though)
        const len = (isNaN(size) || size < 1 || size > MAX_CAPACITY) ? 8 : size;

        const vals = Array.from({ length: len }, () => Math.floor(Math.random() * 99) + 1).sort((a, b) => a - b);
        setInitialArray(vals);
        setCreateInput(vals.join(', '));
        setFrames([createFrame(vals, [], [], 2, `Random Array (Size ${len}) Initialized`, "CREATE")]);
        setCurrentStep(0);
        setIsPlaying(false);
        setCreateStep('size'); // Reset
    };

    // Playback Effect
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


    // Draggable Logic - Canvas
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

    // Derivations


    // Derivations
    const currentFrame = frames[currentStep] || {
        array: initialArray,
        highlights: [],
        pointers: [],
        codeLine: -1,
        description: "Ready",
        internalState: {
            capacity: MAX_CAPACITY,
            size: initialArray.filter(x => x !== null).length,
            currentOp: "None"
        }
    };

    const currentComplexity = activeOp === 'search' ? COMPLEXITY[searchType] : (activeOp ? COMPLEXITY[activeOp] : COMPLEXITY['insert']);
    const currentPseudocode = activeOp === 'search' ? PSEUDOCODE[searchType] : (activeOp ? PSEUDOCODE[activeOp] : []);

    // Layout Context
    const { isSidebarOpen } = useLayout();

    // Zoom & Pan State
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Auto-Resize Logic
    useEffect(() => {
        if (containerRef.current && contentRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            // Approximate width: each box is w-14 (3.5rem=56px) + gap
            const contentWidth = currentFrame.array.length * 70 + 100; // rough estimate

            if (contentWidth > containerWidth) {
                const newScale = Math.max(0.5, containerWidth / contentWidth);
                // Only scale down, don't auto-scale up above 1 unless user wants to
                if (newScale < 1) setScale(newScale * 0.9); // 90% fit
            } else {
                // Reset to 1 if it fits comfortably
                setScale(1);
            }
        }
    }, [currentFrame.array.length, isSidebarOpen]);

    // Zoom Handler
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey || true) { // Always Zoom on wheel for this area? Or just Ctrl? User asked "zoom in when scroll up ... cursor on visualized image" matches standard map behavior usually without ctrl.
            // Let's rely on standard scroll unless ctrl is pressed? 
            // User "zoom in when scrool up" -> implied direct mapping.
            e.preventDefault();
            const delta = -e.deltaY;
            setScale(prev => {
                const newScale = prev + (delta * 0.001);
                return Math.min(Math.max(0.2, newScale), 3); // Limit 0.2x to 3x
            });
        }
    };

    return (
        <VisualizationLayout
            title="Arrays"
            sidebarPosition="left"
            contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden"
            sidebar={
                <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Operations</h3>

                    {/* Operation: Create */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'create' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => { toggleOp('create'); setCreateStep('size'); }} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'create' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>add_circle</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'create' ? 'text-primary font-bold' : ''}`}>Create</p>
                                <p className={`text-xs mt-1 ${activeOp === 'create' ? 'text-primary' : 'text-gray-400'}`}>Initialize new array</p>
                            </div>
                        </button>
                        {activeOp === 'create' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                {createStep === 'size' ? (
                                    <>
                                        <label>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">Array Size (Max {MAX_CAPACITY})</span>
                                            <input
                                                type="number"
                                                value={createSize}
                                                onChange={e => setCreateSize(e.target.value)}
                                                className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-md px-3 py-2 text-sm font-mono focus:border-primary outline-none mt-1"
                                                placeholder="Size..."
                                            />
                                        </label>
                                        <button onClick={handleCreateSizeConfirm} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Next</button>
                                        {error && <div className="text-red-400 text-xs">{error}</div>}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <button onClick={handleCreateStepBack} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-sm">arrow_back</span></button>
                                            <span className="text-xs font-bold text-gray-500">Method (Size: {createSize})</span>
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

                    {/* Operation: Search */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'search' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('search')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'search' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>search</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'search' ? 'text-primary font-bold' : ''}`}>Search</p>
                                <p className={`text-xs mt-1 ${activeOp === 'search' ? 'text-primary' : 'text-gray-400'}`}>Find index of value</p>
                            </div>
                        </button>
                        {activeOp === 'search' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex gap-2">
                                    <button onClick={() => setSearchType('linear')} className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border ${searchType === 'linear' ? 'bg-primary text-white border-primary' : 'border-gray-600 text-gray-400'}`}>Linear</button>
                                    <button onClick={() => setSearchType('binary')} className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border ${searchType === 'binary' ? 'bg-primary text-white border-primary' : 'border-gray-600 text-gray-400'}`}>Binary</button>
                                </div>
                                <input type="number" value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-md px-3 py-2 text-sm font-mono focus:border-primary outline-none" placeholder="Target..." />
                                <button onClick={handleSearch} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Search</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Operation: Insert */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'insert' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('insert')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'insert' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>arrow_right_alt</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'insert' ? 'text-primary font-bold' : ''}`}>Insert (i, v)</p>
                                <p className={`text-xs mt-1 ${activeOp === 'insert' ? 'text-primary' : 'text-gray-400'}`}>Add element at index</p>
                            </div>
                        </button>
                        {activeOp === 'insert' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Index</span><input type="number" value={insertIndex} onChange={e => setInsertIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Value</span><input type="number" value={insertValue} onChange={e => setInsertValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                </div>
                                <button onClick={handleInsert} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Execute Insert</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Operation: Remove */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'remove' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('remove')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'remove' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>delete</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'remove' ? 'text-primary font-bold' : ''}`}>Remove (i)</p>
                                <p className={`text-xs mt-1 ${activeOp === 'remove' ? 'text-primary' : 'text-gray-400'}`}>Delete element at index</p>
                            </div>
                        </button>
                        {activeOp === 'remove' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Index</span><input type="number" value={removeIndex} onChange={e => setRemoveIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                <button onClick={handleRemove} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Execute Remove</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Operation: Update */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'update' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('update')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'update' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>edit</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'update' ? 'text-primary font-bold' : ''}`}>Update (i, v)</p>
                                <p className={`text-xs mt-1 ${activeOp === 'update' ? 'text-primary' : 'text-gray-400'}`}>Modify value at index</p>
                            </div>
                        </button>
                        {activeOp === 'update' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Index</span><input type="number" value={updateIndex} onChange={e => setUpdateIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Value</span><input type="number" value={updateValue} onChange={e => setUpdateValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                </div>
                                <button onClick={handleUpdate} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Execute Update</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            {/* Top Bar: Internal State REMOVED */}

            {/* Top Right Toggles */}
            <div className="absolute top-6 right-6 z-30 flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2">
                    {/* Internal State Button */}
                    <button
                        onClick={() => setShowInternalState(prev => !prev)}
                        className={`h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-all ${showInternalState
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white/90 dark:bg-[#1c1a32]/90 border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#9794c7]'
                            }`}
                        title="Internal State"
                    >
                        <span className="material-symbols-outlined text-[20px]">memory</span>
                    </button>

                    {/* Pseudocode Button */}
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

                    {/* Complexity Button */}
                    <button
                        onClick={() => setIsComplexityOpen(prev => !prev)}
                        className={`relative h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-all ${isComplexityOpen
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white/90 dark:bg-[#1c1a32]/90 border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#9794c7]'
                            }`}
                        title="Complexity Analysis"
                    >
                        <span className="material-symbols-outlined text-[20px] transition-transform duration-300" style={{ transform: isComplexityOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            {isComplexityOpen ? 'close' : 'query_stats'}
                        </span>
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
            <div
                ref={containerRef}
                className={`flex-1 flex flex-col items-center justify-start pt-32 overflow-hidden relative z-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <div
                    ref={contentRef}
                    className="flex flex-col items-start gap-2 transition-transform duration-75 ease-out origin-center"
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale * 1.1})` }}
                >
                    {/* Indices */}
                    <div className="flex gap-1 ml-1 select-none">
                        {(currentFrame.array).map((_, i) => (
                            <div key={i} className="w-14 text-center text-xs font-mono text-gray-500">{i}</div>
                        ))}
                    </div>
                    {/* Array Boxes */}
                    <div className="flex gap-1">
                        {currentFrame.array.map((val, i) => {
                            const highlight = currentFrame.highlights.includes(i);
                            const pointers = currentFrame.pointers.filter(p => p.index === i);
                            return (
                                <div
                                    key={i}
                                    className={`
                                        w-14 h-14 rounded flex items-center justify-center text-lg font-mono font-medium shadow-sm relative group transition-all duration-300
                                        ${highlight
                                            ? 'bg-primary text-white border-2 border-primary scale-110 z-10 shadow-[0_0_20px_rgba(66,54,231,0.4)]'
                                            : 'bg-white dark:bg-[#1c1a32] border border-gray-300 dark:border-[#383564] text-slate-900 dark:text-white'
                                        }
                                        ${val === null ? 'border-dashed opacity-50' : ''}
                                    `}
                                >
                                    {val === null ? 'null' : val}
                                    {/* Pointers (i, j, mid, etc) */}
                                    {pointers.map((p, pIdx) => (
                                        <div key={p.label} className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ marginTop: `-${pIdx * 24}px` }}> {/* Stack pointers */}
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border mb-1 ${p.color === 'primary' ? 'text-primary bg-[#121121] border-primary/30' :
                                                p.color === 'green' ? 'text-emerald-400 bg-[#121121] border-emerald-400/30' :
                                                    'text-red-400 bg-[#121121] border-red-400/30'
                                                }`}>
                                                {p.label}
                                            </span>
                                            {pIdx === 0 && <span className={`material-symbols-outlined text-xl font-bold animate-bounce ${p.color === 'primary' ? 'text-primary' :
                                                p.color === 'green' ? 'text-emerald-400' :
                                                    'text-red-400'
                                                }`}>arrow_downward</span>}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div >

            {/* Pseudocode Panel (Fixed Position, Toggleable) */}
            {showPseudocode && (
                <div className="absolute top-20 right-6 w-80 backdrop-blur-xl bg-white/90 dark:bg-[#1c1a32]/90 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-20">
                    <div className="bg-gray-50/50 dark:bg-white/5 px-4 py-2 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Pseudocode</span>
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
            )}

            {/* Internal State Panel (Fixed Position, Toggleable) */}
            {showInternalState && (
                <div className="absolute top-20 right-[24rem] w-64 backdrop-blur-xl bg-white/90 dark:bg-[#1c1a32]/90 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-20">
                    <div className="bg-gray-50/50 dark:bg-white/5 px-4 py-2 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Internal State</span>
                    </div>
                    <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                                <span>Capacity</span>
                                <span className="text-primary font-bold">{currentFrame.internalState.capacity}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                                <span>Size (N)</span>
                                <span className="text-slate-900 dark:text-white font-bold">{currentFrame.internalState.size}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Current Op</span>
                                <span className="text-orange-400 font-bold uppercase">{currentFrame.internalState.currentOp}</span>
                            </div>
                        </div>
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

        </VisualizationLayout >
    );
};

export default Arrays;
