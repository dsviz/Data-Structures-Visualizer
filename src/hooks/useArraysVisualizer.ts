import { useState, useRef, useEffect } from 'react';


// --- Types ---
export type Operation = 'create' | 'search' | 'insert' | 'remove' | 'update' | null;
export type SearchType = 'linear' | 'binary';

export const MAX_CAPACITY = 16;
export const DEFAULT_ARRAY = [2, 7, 12, 23, 45, 56, 88, 99];

export interface Pointer {
    index: number;
    label: string; // 'i', 'j', 'low', 'high', 'mid'
    color: string; // 'primary', 'red', 'green'
}

export interface Frame {
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
    opValues?: { [key: string]: string | number };
}

// --- Complexity Data ---
export const COMPLEXITY = {
    insert: { best: 'O(1)', avg: 'O(N)', worst: 'O(N)', space: 'O(1)' },
    linear: { best: 'O(1)', avg: 'O(N)', worst: 'O(N)', space: 'O(1)' },
    binary: { best: 'O(1)', avg: 'O(log N)', worst: 'O(log N)', space: 'O(1)' },
    remove: { best: 'O(1)', avg: 'O(N)', worst: 'O(N)', space: 'O(1)' },
    update: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    create: { best: 'O(N)', avg: 'O(N)', worst: 'O(N)', space: 'O(N)' }
};

// --- Pseudocode Data (Simplified as it's now in ArraysCode.ts mostly, but kept for Fallback/Structure) ---
export const PSEUDOCODE: Record<string, string[]> = {
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


export const useArraysVisualizer = () => {
    // --- State ---
    const [initialArray, setInitialArray] = useState<(number | null)[]>(DEFAULT_ARRAY);
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // UI State
    const [mode, setMode] = useState<'standard' | 'apps'>('standard');
    const [activeOp, setActiveOp] = useState<Operation>(null);
    const [searchType, setSearchType] = useState<SearchType>('linear');
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

    const timerRef = useRef<number | null>(null);

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
        setError(null);
        runSimulation(generateInsertFrames(initialArray, idx, val));
    };

    const handleRemove = () => {
        const idx = parseInt(removeIndex);
        if (isNaN(idx)) { setError("Invalid Input"); return; }
        const size = initialArray.filter(x => x !== null).length;
        if (idx < 0 || idx >= size) { setError("Bounds Error"); return; }
        setError(null);
        runSimulation(generateRemoveFrames(initialArray, idx));
    };

    const handleUpdate = () => {
        const idx = parseInt(updateIndex);
        const val = parseInt(updateValue);
        if (isNaN(idx) || isNaN(val)) { setError("Invalid Inputs"); return; }
        const size = initialArray.filter(x => x !== null).length;
        if (idx < 0 || idx >= size) { setError("Bounds Error"); return; }
        setError(null);
        runSimulation(generateUpdateFrames(initialArray, idx, val));
    };

    const handleSearch = () => {
        const val = parseInt(searchInput);
        if (isNaN(val)) { setError("Invalid Input"); return; }
        setError(null);
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
        setError(null);
        setInitialArray(vals);
        setFrames([createFrame(vals, [], [], 2, `Initialized`, "create")]);
        setCurrentStep(0); setCreateStep('size');
    };

    const handleCreateRandom = () => {
        const size = parseInt(createSize) || 8;
        const vals = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1).sort((a, b) => a - b);
        setError(null);
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

    // Current Frame Accessor
    const currentFrame = frames[currentStep] || {
        array: initialArray, highlights: [], pointers: [], codeLine: -1, description: "Ready",
        internalState: { capacity: MAX_CAPACITY, size: initialArray.filter(x => x !== null).length, currentOp: "None" }
    };

    return {
        // State
        mode,
        frames,
        currentStep,
        isPlaying,
        playbackSpeed,
        activeOp,
        searchType,
        error,
        createStep,
        createSize,
        createInput,
        searchInput,
        insertIndex,
        insertValue,
        removeIndex,
        updateIndex,
        updateValue,
        currentFrame,

        // Setters
        setMode,
        setIsPlaying,
        setCurrentStep,
        setPlaybackSpeed,
        setActiveOp,
        setSearchType,
        setCreateStep,
        setCreateSize,
        setCreateInput,
        setSearchInput,
        setInsertIndex,
        setInsertValue,
        setRemoveIndex,
        setUpdateIndex,
        setUpdateValue,

        // Handlers
        handleCreateCustom,
        handleCreateRandom,
        handleSearch,
        handleInsert,
        handleRemove,
        handleUpdate
    };
};
