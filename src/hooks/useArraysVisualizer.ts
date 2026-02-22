import { useState, useRef, useEffect } from 'react';


// --- Types ---
export type Operation = 'create' | 'search' | 'insert' | 'remove' | 'update' | 'reverse' | '2sum' | 'cycle_detection' | null;
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
export const COMPLEXITY: Record<string, { best: string; avg: string; worst: string; space: string }> = {
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
    const [twoSumTarget, setTwoSumTarget] = useState('50');

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

    const generateReverseFrames = (arr: (number | null)[]) => {
        const frames: Frame[] = [];
        const opName = 'reverse';
        let currentArr = [...arr];
        const size = currentArr.filter(x => x !== null).length;
        let left = 0;
        let right = size - 1;

        while (left < right) {
            frames.push(createFrame(currentArr, [left, right], [{ index: left, label: 'L', color: 'primary' }, { index: right, label: 'R', color: 'primary' }], 1, `Check pointers L=${left}, R=${right}`, opName));

            // Swap
            const temp = currentArr[left];
            currentArr[left] = currentArr[right];
            currentArr[right] = temp;

            frames.push(createFrame(currentArr, [left, right], [{ index: left, label: 'L', color: 'green' }, { index: right, label: 'R', color: 'green' }], 2, `Swap elements`, opName));

            left++;
            right--;
        }

        frames.push(createFrame(currentArr, [], [], 3, "Reversal complete", opName));
        return { startArr: arr, endArr: currentArr, timeline: frames };
    };

    const generateTwoSumFrames = (arr: (number | null)[], target: number) => {
        const frames: Frame[] = [];
        const opName = '2sum';
        const sortedArr = [...arr].filter(x => x !== null).sort((a, b) => (a as number) - (b as number));
        let left = 0;
        let right = sortedArr.length - 1;

        frames.push(createFrame(sortedArr, [], [], 0, "Sorted array for two-pointer approach", opName, { target }));

        while (left < right) {
            const sum = (sortedArr[left] as number) + (sortedArr[right] as number);
            frames.push(createFrame(sortedArr, [left, right], [{ index: left, label: 'L', color: 'primary' }, { index: right, label: 'R', color: 'primary' }], 1, `Check L=${sortedArr[left]}, R=${sortedArr[right]} (Sum=${sum})`, opName, { target, sum }));

            if (sum === target) {
                frames.push(createFrame(sortedArr, [left, right], [{ index: left, label: 'L', color: 'green' }, { index: right, label: 'R', color: 'green' }], 2, `Found pair! ${sortedArr[left]} + ${sortedArr[right]} = ${target}`, opName, { target, sum }));
                return { startArr: arr, endArr: sortedArr, timeline: frames };
            } else if (sum < target) {
                frames.push(createFrame(sortedArr, [left], [], 3, `Sum ${sum} < ${target}, move Left pointer`, opName, { target, sum }));
                left++;
            } else {
                frames.push(createFrame(sortedArr, [right], [], 4, `Sum ${sum} > ${target}, move Right pointer`, opName, { target, sum }));
                right--;
            }
        }

        frames.push(createFrame(sortedArr, [], [], 5, "No pair found", opName, { target }));
        return { startArr: arr, endArr: sortedArr, timeline: frames };
    };

    const generateCycleDetectionFrames = (arr: (number | null)[]) => {
        const frames: Frame[] = [];
        const opName = 'cycle_detection';
        const currentArr = [...arr];
        const size = currentArr.length;

        // Floyd's Cycle Detection (Hare & Tortoise)
        let slow = 0;
        let fast = 0;

        frames.push(createFrame(currentArr, [0], [{ index: 0, label: 'S,F', color: 'primary' }], 0, "Init slow, fast pointers at index 0", opName));

        while (true) {
            // Move Slow
            slow = (currentArr[slow] as number) % size;
            // Move Fast
            fast = (currentArr[fast] as number) % size;
            fast = (currentArr[fast] as number) % size;

            frames.push(createFrame(currentArr, [slow, fast], [{ index: slow, label: 'S', color: 'primary' }, { index: fast, label: 'F', color: 'red' }], 1, `Slow moves 1 step to ${slow}, Fast moves 2 steps to ${fast}`, opName));

            if (slow === fast) {
                frames.push(createFrame(currentArr, [slow], [{ index: slow, label: 'MEET', color: 'green' }], 2, `Wait! slow == fast at index ${slow}. Cycle Detected!`, opName));
                break;
            }

            // Limit iterations to prevent infinite loop if no cycle (though in array as graph it eventually meets or stops if null, but here we assume valid indices)
            if (frames.length > 50) break;
        }

        return { startArr: arr, endArr: arr, timeline: frames };
    };

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

    const handleReverse = () => {
        setError(null);
        runSimulation(generateReverseFrames(initialArray));
    };

    const handleTwoSum = () => {
        const target = parseInt(twoSumTarget);
        if (isNaN(target)) { setError("Invalid Target"); return; }
        setError(null);
        runSimulation(generateTwoSumFrames(initialArray, target));
    };

    const handleCycleDetection = () => {
        setError(null);
        runSimulation(generateCycleDetectionFrames(initialArray));
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

    const handleExample = () => {
        const currentSize = initialArray.filter(x => x !== null).length;
        const validSize = currentSize > 0 ? currentSize : 8;
        const vals = Array.from({ length: validSize }, () => Math.floor(Math.random() * 99) + 1).sort((a, b) => a - b);
        setError(null);
        setInitialArray(vals);
        setCreateInput(vals.join(', '));
        setCreateSize(validSize.toString());
        setFrames([createFrame(vals, [], [], 2, "Example Loaded (Randomized)", "create")]);
        setCurrentStep(0);
        setCreateStep('size');
    };

    const handleCanvasAdd = () => {
        const size = initialArray.filter(x => x !== null).length;
        if (size >= MAX_CAPACITY) { setError(`Max capacity ${MAX_CAPACITY} reached`); return; }
        const vals = [...initialArray.filter(x => x !== null), Math.floor(Math.random() * 99) + 1];
        setInitialArray(vals);
        setFrames([createFrame(vals, [], [], 0, "Element Added", "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasDelete = (index: number) => {
        const vals = initialArray.filter((_, i) => i !== index);
        setInitialArray(vals);
        setFrames([createFrame(vals, [], [], 0, "Element Removed", "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasUpdate = (index: number, val: number) => {
        const vals = [...initialArray];
        vals[index] = val;
        setInitialArray(vals);
        setFrames([createFrame(vals, [], [], 0, "Element Updated", "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasClear = () => {
        setInitialArray([]);
        setFrames([createFrame([], [], [], 0, "Array Cleared", "None")]);
        setCurrentStep(0);
        setError(null);
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
        twoSumTarget,
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
        setTwoSumTarget,

        handleCreateCustom,
        handleCreateRandom,
        handleExample,
        handleSearch,
        handleInsert,
        handleRemove,
        handleUpdate,
        handleReverse,
        handleTwoSum,
        handleCycleDetection,
        handleCanvasAdd,
        handleCanvasDelete,
        handleCanvasUpdate,
        handleCanvasClear
    };
};
