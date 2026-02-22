import { useState, useRef, useEffect } from 'react';
export { QUEUE_CODE } from '../data/QueueCode';

// --- Types ---
export type Operation = 'create' | 'enqueue' | 'dequeue' | 'peek' | 'binaryNum' | 'hotPotato' | null;
export type QueueItem = number | string | null;

export const MAX_CAPACITY = 15;
export const DEFAULT_QUEUE = [10, 20, 30];

export interface Pointer {
    index: number;
    label: string; // 'front', 'rear'
    color: string; // 'primary', 'red', 'green'
}

export interface Frame {
    queue: QueueItem[];
    highlights: number[];
    pointers: Pointer[];
    codeLine: number;
    description: string;
    internalState: {
        capacity: number;
        size: number;
        front: number;
        rear: number;
        currentOp: string;
    };
}

// --- Complexity Data ---
export const COMPLEXITY = {
    enqueue: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    dequeue: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    peek: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    create: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(N)' },
    binaryNum: { best: 'O(N)', avg: 'O(N)', worst: 'O(N)', space: 'O(N)' },
    hotPotato: { best: 'O(N*K)', avg: 'O(N*K)', worst: 'O(N*K)', space: 'O(N)' }
};

// --- Pseudocode Data ---
export const PSEUDOCODE = {
    enqueue: [
        "if rear == capacity - 1, return Queue Overflow",
        "if front == -1, front = 0",
        "rear = rear + 1",
        "queue[rear] = value",
        "return"
    ],
    dequeue: [
        "if front == -1, return Queue Underflow",
        "value = queue[front]",
        "if front == rear, front = rear = -1",
        "else front = front + 1",
        "return value"
    ],
    peek: [
        "if front == -1, return Queue Empty",
        "return queue[front]"
    ],
    create: [
        "allocate memory for size N",
        "front = -1, rear = -1",
        "return queue reference"
    ],
    binaryNum: [
        "queue.enqueue('1')",
        "while N > 0:",
        "  current = queue.dequeue()",
        "  print(current)",
        "  queue.enqueue(current + '0')",
        "  queue.enqueue(current + '1')",
        "  N--"
    ],
    hotPotato: [
        "for player in players: queue.enqueue(player)",
        "while queue.size > 1:",
        "  for i = 0 to K:",
        "    queue.enqueue(queue.dequeue())",
        "  queue.dequeue() // eliminate",
        "return queue.dequeue() // winner"
    ]
};

export const CODE_CPP = `class Queue {
private:
    int* queue;
    int front, rear;
    int capacity;

public:
    Queue(int size) {
        queue = new int[size];
        capacity = size;
        front = rear = -1;
    }

    void enqueue(int value) {
        if (rear == capacity - 1) {
            cout << "Queue Overflow";
            return;
        }
        if (front == -1) front = 0;
        queue[++rear] = value;
    }

    int dequeue() {
        if (front == -1) {
            cout << "Queue Underflow";
            return -1;
        }
        int val = queue[front];
        if (front == rear) front = rear = -1;
        else front++;
        return val;
    }

    int peek() {
        if (front == -1) {
            cout << "Queue Empty";
            return -1;
        }
        return queue[front];
    }
};`;


export const useQueueVisualizer = () => {
    // --- State ---
    // Core Data
    const [initialQueue, setInitialQueue] = useState<QueueItem[]>(DEFAULT_QUEUE);

    // Playback State
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x default

    // UI State
    const [activeOp, setActiveOp] = useState<Operation>(null);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'standard' | 'apps'>('standard');

    // Inputs
    const [createSize, setCreateSize] = useState('5');
    const [createInput, setCreateInput] = useState(DEFAULT_QUEUE.join(', '));
    const [enqueueValue, setEnqueueValue] = useState('42');

    // App Inputs
    const [binaryNumInput, setBinaryNumInput] = useState('5');
    const [hotPotatoPlayers, setHotPotatoPlayers] = useState('6');
    const [hotPotatoPasses, setHotPotatoPasses] = useState('2');

    const timerRef = useRef<number | null>(null);

    // --- Generator Functions ---

    const createFrame = (
        q: QueueItem[],
        highlights: number[],
        pointers: Pointer[],
        line: number,
        desc: string,
        opName: string
    ): Frame => ({
        queue: [...q],
        highlights,
        pointers,
        codeLine: line,
        description: desc,
        internalState: {
            capacity: MAX_CAPACITY,
            size: q.length,
            front: q.length > 0 ? 0 : -1,
            rear: q.length > 0 ? q.length - 1 : -1,
            currentOp: opName
        }
    });

    const generateEnqueueFrames = (q: QueueItem[], val: QueueItem) => {
        const frames: Frame[] = [];
        const opName = `ENQUEUE(${val})`;
        let currentQueue = [...q];
        let front = currentQueue.length > 0 ? 0 : -1;
        let rear = currentQueue.length > 0 ? currentQueue.length - 1 : -1;

        // 1. Check Overflow
        frames.push(createFrame(currentQueue, [], [{ index: rear, label: 'rear', color: 'primary' }, { index: front, label: 'front', color: 'primary' }], 0, "Check for Queue Overflow...", opName));
        if (currentQueue.length >= MAX_CAPACITY) {
            frames.push(createFrame(currentQueue, [], [{ index: rear, label: 'rear', color: 'red' }], 0, "Error: Queue Overflow", opName));
            return { startQueue: q, endQueue: q, timeline: frames };
        }

        // 2. Update Front/Rear
        if (front === -1) {
            frames.push(createFrame(currentQueue, [], [{ index: 0, label: 'front', color: 'green' }], 1, "Initialize front = 0", opName));
            front = 0;
        }

        frames.push(createFrame(currentQueue, [], [{ index: rear + 1, label: 'rear', color: 'primary' }, { index: front, label: 'front', color: 'primary' }], 2, "Increment rear pointer", opName));
        rear++;

        // 3. Insert Value
        frames.push(createFrame(currentQueue, [], [{ index: rear, label: 'rear', color: 'primary' }, { index: front, label: 'front', color: 'primary' }], 3, `Assign queue[rear] = "${val}"`, opName));
        currentQueue.push(val);
        frames.push(createFrame(currentQueue, [rear], [{ index: rear, label: 'rear', color: 'green' }, { index: front, label: 'front', color: 'primary' }], 4, `Enqueued "${val}"`, opName));

        // 4. Return
        frames.push(createFrame(currentQueue, [], [{ index: rear, label: 'rear', color: 'primary' }, { index: front, label: 'front', color: 'primary' }], 4, "Done", opName));

        return { startQueue: q, endQueue: currentQueue, timeline: frames };
    };

    const generateDequeueFrames = (q: QueueItem[]) => {
        const frames: Frame[] = [];
        const opName = "DEQUEUE()";
        let currentQueue = [...q];
        let front = currentQueue.length > 0 ? 0 : -1;
        let rear = currentQueue.length > 0 ? currentQueue.length - 1 : -1;

        // 1. Check Underflow
        frames.push(createFrame(currentQueue, [], [{ index: front, label: 'front', color: 'primary' }], 0, "Check for Queue Underflow...", opName));
        if (currentQueue.length === 0) {
            frames.push(createFrame(currentQueue, [], [], 0, "Error: Queue Underflow", opName));
            return { startQueue: q, endQueue: q, timeline: frames };
        }

        // 2. Read Value
        const val = currentQueue[0];
        frames.push(createFrame(currentQueue, [0], [{ index: front, label: 'front', color: 'primary' }, { index: rear, label: 'rear', color: 'primary' }], 1, `Read value "${val}"`, opName));

        // 3. Update Pointers / Shift
        // In array implementation of queue (simplified for visualization), we shift elements left or move front.
        // For standard visualization, typically we move front pointer. But to keep array visual clean, we'll shift for now or just pop front.
        // Let's visualize the "shift" or "removal"
        frames.push(createFrame(currentQueue, [0], [{ index: front, label: 'front', color: 'red' }], 3, "Removing element from front...", opName));

        currentQueue.shift(); // Remove first element
        // Adjust indices effectively
        rear--;
        if (rear < 0) {
            front = -1;
            rear = -1;
        }

        // 4. Return
        frames.push(createFrame(currentQueue, [], [{ index: front, label: 'front', color: 'primary' }, { index: rear, label: 'rear', color: 'primary' }], 4, `Returned "${val}"`, opName));

        return { startQueue: q, endQueue: currentQueue, timeline: frames };
    };

    const generatePeekFrames = (q: QueueItem[]) => {
        const frames: Frame[] = [];
        const opName = "PEEK()";
        let currentQueue = [...q];
        let front = currentQueue.length > 0 ? 0 : -1;
        let rear = currentQueue.length > 0 ? currentQueue.length - 1 : -1;

        if (currentQueue.length === 0) {
            frames.push(createFrame(currentQueue, [], [], 0, "Error: Queue Empty", opName));
            return { startQueue: q, endQueue: q, timeline: frames };
        }

        frames.push(createFrame(currentQueue, [0], [{ index: front, label: 'front', color: 'green' }, { index: rear, label: 'rear', color: 'primary' }], 1, `Front value is "${currentQueue[0]}"`, opName));
        return { startQueue: q, endQueue: q, timeline: frames };
    };


    // --- Handlers ---

    const runSimulation = (generatorResult: { endQueue: QueueItem[], timeline: Frame[] }) => {
        setFrames(generatorResult.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
        setInitialQueue(generatorResult.endQueue);
    };

    const handleEnqueue = () => {
        // Try parsing as number, if NaN use string
        let val: QueueItem = parseInt(enqueueValue);
        if (isNaN(val)) val = enqueueValue.trim(); // Use string if not number
        if (val === '') { setError("Invalid Input"); return; }

        if (initialQueue.length >= MAX_CAPACITY) { setError("Queue Overflow"); return; }

        const result = generateEnqueueFrames(initialQueue, val);
        runSimulation(result);
    };

    const handleDequeue = () => {
        if (initialQueue.length === 0) { setError("Queue Underflow"); return; }
        const result = generateDequeueFrames(initialQueue);
        runSimulation(result);
    };

    const handlePeek = () => {
        if (initialQueue.length === 0) { setError("Queue Empty"); return; }
        const result = generatePeekFrames(initialQueue);
        runSimulation(result);
    };

    const handleCreateCustom = () => {
        const size = parseInt(createSize);
        if (isNaN(size) || size <= 0 || size > MAX_CAPACITY) return;

        let vals: QueueItem[] = [];
        if (createInput.trim()) {
            vals = createInput.split(',')
                .map(s => s.trim())
                .filter(s => s !== '')
                .map(s => {
                    const n = parseInt(s);
                    return isNaN(n) ? s : n;
                });
        }

        if (vals.length > size) vals = vals.slice(0, size);

        setInitialQueue(vals);
        // Create frame needs to handle empty queue pointer logic
        const front = vals.length > 0 ? 0 : -1;
        const rear = vals.length > 0 ? vals.length - 1 : -1;
        const pointers: Pointer[] = [];
        if (front !== -1) pointers.push({ index: front, label: 'front', color: 'primary' });
        if (rear !== -1) pointers.push({ index: rear, label: 'rear', color: 'primary' });

        setFrames([createFrame(vals, [], pointers, 2, `Queue Initialized (Size ${vals.length})`, "CREATE")]);
        setCurrentStep(0);
        setIsPlaying(false);
    };



    const handleExample = () => {
        const currentSize = initialQueue.length;
        const validSize = currentSize > 0 ? currentSize : 5;
        const vals = Array.from({ length: validSize }, () => Math.floor(Math.random() * 99) + 1);

        setInitialQueue(vals);
        setCreateInput(vals.join(', '));
        setCreateSize(validSize.toString());

        const front = 0;
        const rear = vals.length - 1;

        setFrames([createFrame(vals, [], [{ index: front, label: 'front', color: 'primary' }, { index: rear, label: 'rear', color: 'primary' }], 2, "Example Queue Loaded", "EXAMPLE")]);
        setCurrentStep(0);
        setIsPlaying(false);
    };

    const handleCanvasEnqueue = () => {
        if (initialQueue.length >= MAX_CAPACITY) { setError("Queue Overflow"); return; }
        const newVal = Math.floor(Math.random() * 99) + 1;
        const vals = [...initialQueue, newVal];
        setInitialQueue(vals);

        const front = 0;
        const rear = vals.length - 1;
        setFrames([createFrame(vals, [], [{ index: front, label: 'front', color: 'primary' }, { index: rear, label: 'rear', color: 'primary' }], 0, `Enqueued ${newVal}`, "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasDequeue = () => {
        if (initialQueue.length === 0) { setError("Queue Underflow"); return; }
        const vals = initialQueue.slice(1);
        setInitialQueue(vals);

        const front = vals.length > 0 ? 0 : -1;
        const rear = vals.length > 0 ? vals.length - 1 : -1;
        const pointers: Pointer[] = [];
        if (front !== -1) pointers.push({ index: front, label: 'front', color: 'primary' });
        if (rear !== -1) pointers.push({ index: rear, label: 'rear', color: 'primary' });

        setFrames([createFrame(vals, [], pointers, 0, "Dequeued front element", "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasClear = () => {
        setInitialQueue([]);
        setFrames([createFrame([], [], [], 0, "Queue Cleared", "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleCanvasUpdate = (index: number, newValue: string) => {
        const vals = [...initialQueue];
        vals[index] = newValue;
        setInitialQueue(vals);

        const front = vals.length > 0 ? 0 : -1;
        const rear = vals.length > 0 ? vals.length - 1 : -1;
        const pointers: Pointer[] = [];
        if (front !== -1) pointers.push({ index: front, label: 'front', color: 'primary' });
        if (rear !== -1) pointers.push({ index: rear, label: 'rear', color: 'primary' });

        setFrames([createFrame(vals, [index], pointers, 0, `Updated index ${index} to ${newValue}`, "None")]);
        setCurrentStep(0);
        setError(null);
    };

    const handleBinaryNumbers = () => {
        const n = parseInt(binaryNumInput);
        if (isNaN(n) || n < 1 || n > 15) {
            setError("Please enter a valid number between 1 and 15");
            return;
        }

        const newFrames: Frame[] = [];
        let currQueue: string[] = ["1"];

        newFrames.push(createFrame(currQueue, [0], [{ index: 0, label: 'front', color: 'primary' }, { index: 0, label: 'rear', color: 'primary' }], 0, `Initial Queue: ["1"]`, "APP"));

        for (let i = 1; i <= n; i++) {
            const current = currQueue[0];
            currQueue = currQueue.slice(1);

            const s1 = current + "0";
            const s2 = current + "1";
            if (currQueue.length < MAX_CAPACITY) currQueue.push(s1);
            if (currQueue.length < MAX_CAPACITY) currQueue.push(s2);

            const front = currQueue.length > 0 ? 0 : -1;
            const rear = currQueue.length > 0 ? currQueue.length - 1 : -1;
            const ptrs: Pointer[] = [];
            if (front !== -1) ptrs.push({ index: front, label: 'front', color: 'primary' });
            if (rear !== -1) ptrs.push({ index: rear, label: 'rear', color: 'primary' });

            newFrames.push(createFrame(currQueue, [], ptrs, 0, `Generated ${current}. Appended ${s1}, ${s2}`, "APP"));
        }

        setInitialQueue([]);
        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
        setError(null);
    };

    const handleHotPotato = () => {
        const p = parseInt(hotPotatoPlayers);
        const k = parseInt(hotPotatoPasses);

        if (isNaN(p) || p < 2 || p > MAX_CAPACITY) {
            setError(`Players must be between 2 and ${MAX_CAPACITY}`);
            return;
        }
        if (isNaN(k) || k < 0) {
            setError("Passes must be >= 0");
            return;
        }

        const newFrames: Frame[] = [];
        let currQueue = Array.from({ length: p }, (_, i) => `P${i + 1}`);

        newFrames.push(createFrame(currQueue, [], [{ index: 0, label: 'front', color: 'primary' }, { index: currQueue.length - 1, label: 'rear', color: 'primary' }], 0, `Initialized with ${p} players`, "APP"));

        while (currQueue.length > 1) {
            for (let i = 0; i < k; i++) {
                const frontElement = currQueue[0] as string;
                currQueue = [...currQueue.slice(1), frontElement];
                newFrames.push(createFrame(currQueue, [currQueue.length - 1], [{ index: 0, label: 'front', color: 'primary' }, { index: currQueue.length - 1, label: 'rear', color: 'primary' }], 0, `Passed potato to ${frontElement}`, "APP"));
            }
            const eliminated = currQueue[0] as string;
            currQueue = currQueue.slice(1);

            const ptrs: Pointer[] = [];
            if (currQueue.length > 0) {
                ptrs.push({ index: 0, label: 'front', color: 'primary' });
                ptrs.push({ index: currQueue.length - 1, label: 'rear', color: 'primary' });
            }
            newFrames.push(createFrame(currQueue, [], ptrs, 0, `${eliminated} is eliminated!`, "APP"));
        }

        newFrames.push(createFrame(currQueue, [0], [{ index: 0, label: 'front', color: 'primary' }, { index: 0, label: 'rear', color: 'primary' }], 0, `${currQueue[0]} wins the game!`, "APP"));

        setInitialQueue([]);
        setFrames(newFrames);
        setCurrentStep(0);
        setIsPlaying(true);
        setError(null);
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

    // Current State Derivations
    const currentFrame = frames[currentStep] || {
        queue: initialQueue,
        highlights: [],
        pointers: initialQueue.length > 0 ? [{ index: 0, label: 'front', color: 'primary' }, { index: initialQueue.length - 1, label: 'rear', color: 'primary' }] : [],
        codeLine: -1,
        description: "Ready",
        internalState: {
            capacity: MAX_CAPACITY,
            size: initialQueue.length,
            front: initialQueue.length > 0 ? 0 : -1,
            rear: initialQueue.length > 0 ? initialQueue.length - 1 : -1,
            currentOp: "None"
        }
    };

    return {
        // State
        initialQueue,
        frames,
        currentStep,
        isPlaying,
        playbackSpeed,
        activeOp,
        error,
        mode,
        createSize,
        createInput,
        enqueueValue,
        binaryNumInput,
        hotPotatoPlayers,
        hotPotatoPasses,
        currentFrame,

        // Setters
        setIsPlaying,
        setCurrentStep,
        setPlaybackSpeed,
        setActiveOp,
        setError,
        setMode,
        setCreateSize,
        setCreateInput,
        setEnqueueValue,
        setBinaryNumInput,
        setHotPotatoPlayers,
        setHotPotatoPasses,

        // Handlers
        handleEnqueue,
        handleDequeue,
        handlePeek,
        handleCreateCustom,
        handleExample,
        handleCanvasEnqueue,
        handleCanvasDequeue,
        handleCanvasClear,
        handleCanvasUpdate,
        handleBinaryNumbers,
        handleHotPotato
    };
};
