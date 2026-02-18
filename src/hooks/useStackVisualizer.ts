import { useState, useRef, useEffect } from 'react';

// --- Types ---
export type Operation = 'create' | 'push' | 'pop' | 'peek' | 'app_reverse' | null;
export type StackItem = number | string | null;

export const MAX_CAPACITY = 8;
export const DEFAULT_STACK = [10, 20, 30];

export interface Pointer {
    index: number;
    label: string; // 'top'
    color: string; // 'primary', 'red', 'green'
}

export interface Frame {
    stack: StackItem[];
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
export const COMPLEXITY = {
    push: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    pop: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    peek: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    create: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(N)' },
    app_reverse: { best: 'O(N)', avg: 'O(N)', worst: 'O(N)', space: 'O(N)' }
};

// --- Pseudocode Data ---
export const PSEUDOCODE = {
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
    ],
    app_reverse: [
        "create empty string result",
        "push all characters of input to stack",
        "while stack is not empty:",
        "  char = pop()",
        "  result += char",
        "return result"
    ]
};

export const CODE_CPP = `class Stack {
private:
    int* stack;
    int top;
    int capacity;

public:
    Stack(int size) {
        stack = new int[size];
        capacity = size;
        top = -1;
    }

    void push(int value) {
        if (top == capacity - 1) {
            cout << "Stack Overflow";
            return;
        }
        stack[++top] = value;
    }

    int pop() {
        if (top == -1) {
            cout << "Stack Underflow";
            return -1;
        }
        return stack[top--];
    }

    int peek() {
        if (top == -1) {
            cout << "Stack Empty";
            return -1;
        }
        return stack[top];
    }
};`;


export const useStackVisualizer = () => {
    // --- State ---
    // Core Data
    const [initialStack, setInitialStack] = useState<StackItem[]>(DEFAULT_STACK);

    // Playback State
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x default

    // UI State
    const [activeOp, setActiveOp] = useState<Operation>(null);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'standard' | 'applications'>('standard');

    // Inputs (Managed here for convenience, or passed in)
    const [createSize, setCreateSize] = useState('5');
    const [createInput, setCreateInput] = useState(DEFAULT_STACK.join(', '));
    const [pushValue, setPushValue] = useState('42');
    const [appInput, setAppInput] = useState('HELLO');

    const timerRef = useRef<number | null>(null);

    // --- Generator Functions ---

    const createFrame = (
        stk: StackItem[],
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
            size: stk.length,
            top: stk.length - 1,
            currentOp: opName
        }
    });

    const generatePushFrames = (stk: StackItem[], val: StackItem) => {
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
        frames.push(createFrame(currentStack, [], [{ index: visualTop, label: 'top', color: 'primary' }], 2, `Assign stack[top] = "${val}"`, opName));
        currentStack.push(val);
        frames.push(createFrame(currentStack, [visualTop], [{ index: visualTop, label: 'top', color: 'green' }], 2, `Pushed "${val}"`, opName));

        // 4. Return
        frames.push(createFrame(currentStack, [], [{ index: visualTop, label: 'top', color: 'primary' }], 3, "Done", opName));

        return { startStack: stk, endStack: currentStack, timeline: frames };
    };

    const generatePopFrames = (stk: StackItem[]) => {
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
        frames.push(createFrame(currentStack, [visualTop], [{ index: visualTop, label: 'top', color: 'primary' }], 1, `Read value "${val}"`, opName));

        // 3. Decrement Top
        frames.push(createFrame(currentStack, [visualTop], [{ index: visualTop - 1, label: 'top', color: 'primary' }], 2, "Decrement top pointer", opName));

        currentStack.pop();
        visualTop--;

        // 4. Return
        frames.push(createFrame(currentStack, [], [{ index: visualTop, label: 'top', color: 'primary' }], 3, `Returned "${val}"`, opName));

        return { startStack: stk, endStack: currentStack, timeline: frames };
    };

    const generatePeekFrames = (stk: StackItem[]) => {
        const frames: Frame[] = [];
        const opName = "PEEK()";
        let currentStack = [...stk];
        let visualTop = currentStack.length - 1;

        if (visualTop < 0) {
            frames.push(createFrame(currentStack, [], [], 0, "Error: Stack Empty", opName));
            return { startStack: stk, endStack: stk, timeline: frames };
        }

        frames.push(createFrame(currentStack, [visualTop], [{ index: visualTop, label: 'top', color: 'green' }], 1, `Top value is "${currentStack[visualTop]}"`, opName));
        return { startStack: stk, endStack: stk, timeline: frames };
    };

    const generateStringReversalFrames = (input: string) => {
        const frames: Frame[] = [];
        const opName = "REVERSE STRING";
        let currentStack: StackItem[] = []; // Start with empty stack for this op usually
        // But for visualizer, maybe we clear it first?

        // Let's assume we clear the stack for this demo
        frames.push(createFrame([], [], [], 0, "Initialize empty stack", opName));

        // Push Phase
        frames.push(createFrame([], [], [], 1, `Pushing characters of "${input}"...`, opName));

        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (currentStack.length >= MAX_CAPACITY) {
                frames.push(createFrame(currentStack, [], [{ index: currentStack.length - 1, label: 'top', color: 'red' }], 1, "Stack Overflow during push!", opName));
                return { startStack: [], endStack: currentStack, timeline: frames };
            }

            currentStack.push(char);
            frames.push(createFrame([...currentStack], [currentStack.length - 1], [{ index: currentStack.length - 1, label: 'top', color: 'green' }], 1, `Pushed '${char}'`, opName));
        }

        // Pop Phase
        frames.push(createFrame(currentStack, [], [{ index: currentStack.length - 1, label: 'top', color: 'primary' }], 2, "Now popping to reverse...", opName));

        let result = "";

        while (currentStack.length > 0) {
            const char = currentStack[currentStack.length - 1];

            // Pop Logic Visuals
            frames.push(createFrame([...currentStack], [currentStack.length - 1], [{ index: currentStack.length - 1, label: 'top', color: 'primary' }], 3, `Pop '${char}'`, opName));

            currentStack.pop();
            result += char;

            frames.push(createFrame([...currentStack], [], [{ index: Math.max(-1, currentStack.length - 1), label: 'top', color: 'primary' }], 4, `Result so far: "${result}"`, opName));
        }

        frames.push(createFrame([], [], [], 5, `Final Result: "${result}"`, opName));

        // We'll leave the stack empty at the end for this specific demo
        return { startStack: [], endStack: [], timeline: frames };
    };


    // --- Handlers ---

    const runSimulation = (generatorResult: { endStack: StackItem[], timeline: Frame[] }) => {
        setFrames(generatorResult.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
        setInitialStack(generatorResult.endStack);
    };

    const handlePush = () => {
        // Try parsing as number, if NaN use string
        let val: StackItem = parseInt(pushValue);
        if (isNaN(val)) val = pushValue.trim(); // Use string if not number
        if (val === '') { setError("Invalid Input"); return; }

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

    const handleReverseString = () => {
        if (!appInput) { setError("Enter text"); return; }
        if (appInput.length > MAX_CAPACITY) { setError(`Max length ${MAX_CAPACITY}`); return; }

        const result = generateStringReversalFrames(appInput);
        runSimulation(result);
    };

    const handleCreateCustom = () => {
        const size = parseInt(createSize);
        if (isNaN(size) || size <= 0 || size > MAX_CAPACITY) return;

        let vals: StackItem[] = [];
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

        setInitialStack(vals);
        setFrames([createFrame(vals, [], [{ index: vals.length - 1, label: 'top', color: 'primary' }], 2, `Stack Initialized (Size ${vals.length})`, "CREATE")]);
        setCurrentStep(0);
        setIsPlaying(false);
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

    return {
        // State
        initialStack,
        frames,
        currentStep,
        isPlaying,
        playbackSpeed,
        activeOp,
        error,
        mode,
        createSize,
        createInput,
        pushValue,
        appInput,
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
        setPushValue,
        setAppInput,

        // Handlers
        handlePush,
        handlePop,
        handlePeek,
        handleCreateCustom,
        handleCreateRandom,
        handleReverseString
    };
};
