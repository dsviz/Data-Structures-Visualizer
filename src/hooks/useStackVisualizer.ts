import { useState, useRef, useEffect } from 'react';

// --- Types ---
export type Operation = 'create' | 'push' | 'pop' | 'peek' | 'app_reverse' | 'app_balanced_parentheses' | 'app_postfix_eval' | 'app_browser_history' | null;
export type StackItem = number | string | null;

export const MAX_CAPACITY = 8;
export const DEFAULT_STACK = [10, 20, 30];

export interface Pointer {
    index: number;
    label: string; // 'top'
    color: string; // 'primary', 'red', 'green'
}

export interface Frame {
    stacks: StackItem[][]; // Array of stacks
    stackLabels?: string[];
    highlights: number[];
    pointers: Pointer[];
    codeLine: number;
    description: string;
    internalState: {
        capacity: number;
        size: number;
        top: number; // index of top element
        currentOp: string;
        output?: string;
    };
}

// --- Complexity Data ---
export const COMPLEXITY = {
    push: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    pop: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    peek: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(1)' },
    create: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(N)' },
    app_reverse: { best: 'O(N)', avg: 'O(N)', worst: 'O(N)', space: 'O(N)' },
    app_balanced_parentheses: { best: 'O(N)', avg: 'O(N)', worst: 'O(N)', space: 'O(N)' },
    app_postfix_eval: { best: 'O(N)', avg: 'O(N)', worst: 'O(N)', space: 'O(N)' },
    app_browser_history: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(N)' }
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
    ],
    app_balanced_parentheses: [
        "for each char in input:",
        "  if char is '(', '{', '[': push(char)",
        "  else if char is ')', '}', ']':",
        "    if stack empty: return Invalid",
        "    top = pop()",
        "    if top matches char: continue",
        "    else: return Invalid",
        "if stack empty: return Valid",
        "else: return Invalid"
    ],
    app_postfix_eval: [
        "for each token in expression:",
        "  if token is number: push(token)",
        "  if token is operator (+, -, *, /):",
        "    a = pop(), b = pop()",
        "    result = evaluate(b, a, operator)",
        "    push(result)",
        "return pop() (final result)"
    ],
    app_browser_history: [
        "Visit(url):",
        "  BackStack.push(current)",
        "  ForwardStack.clear()",
        "  current = url",
        "Back():",
        "  ForwardStack.push(current)",
        "  current = BackStack.pop()",
        "Forward():",
        "  BackStack.push(current)",
        "  current = ForwardStack.pop()"
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
    const [initialStacks, setInitialStacks] = useState<StackItem[][]>([DEFAULT_STACK]); // Array of stacks

    // Playback State
    const [frames, setFrames] = useState<Frame[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x default

    // UI State
    const [activeOp, setActiveOp] = useState<Operation>(null);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'standard' | 'applications'>('standard');
    const [activeStackIndex, setActiveStackIndex] = useState<number>(0);

    // Inputs (Managed here for convenience, or passed in)
    const [createSize, setCreateSize] = useState('5');
    const [createInput, setCreateInput] = useState(DEFAULT_STACK.join(', '));
    const [pushValue, setPushValue] = useState('42');
    const [appInput, setAppInput] = useState('HELLO');
    const [balancedInput, setBalancedInput] = useState('{[()]}');
    const [postfixInput, setPostfixInput] = useState('5 3 + 2 *');
    const [browserCurrent, setBrowserCurrent] = useState('Home');
    const [browserInput, setBrowserInput] = useState('google.com');

    const timerRef = useRef<number | null>(null);

    // --- Generator Functions ---

    const createFrame = (
        stks: StackItem[][],
        highlights: number[],
        pointers: Pointer[],
        line: number,
        desc: string,
        opName: string,
        outputStr: string = ""
    ): Frame => ({
        stacks: stks.map(s => [...s]),
        highlights,
        pointers,
        codeLine: line,
        description: desc,
        internalState: {
            capacity: MAX_CAPACITY,
            size: stks[activeStackIndex]?.length || 0,
            top: (stks[activeStackIndex]?.length || 0) - 1,
            currentOp: opName,
            output: outputStr
        }
    });

    const generatePushFrames = (currentStacks: StackItem[][], value: StackItem, stackIdx: number) => {
        const frames: Frame[] = [];
        const opName = `PUSH (Stack ${stackIdx + 1})`;
        const newStacks = currentStacks.map(s => [...s]);
        const targetStack = newStacks[stackIdx];

        // Ensure stack exists
        if (!targetStack) {
            // Handle case where stack doesn't exist? Should be initialized.
            return { endStacks: currentStacks, timeline: [] };
        }

        // 1. Check Overflow (Visualized)
        frames.push(createFrame(newStacks, [], [{ index: targetStack.length - 1, label: 'top', color: 'primary' }], 0, `Check Stack ${stackIdx + 1} Overflow`, opName));

        if (targetStack.length >= MAX_CAPACITY) {
            frames.push(createFrame(newStacks, [], [{ index: targetStack.length - 1, label: 'top', color: 'red' }], 1, "Stack Overflow Error!", opName));
            return { endStacks: newStacks, timeline: frames };
        }

        // 2. Increment Top
        frames.push(createFrame(newStacks, [], [{ index: targetStack.length, label: 'top', color: 'primary' }], 1, "Increment Top", opName));

        // 3. Insert Value
        targetStack.push(value);
        frames.push(createFrame(newStacks, [targetStack.length - 1], [{ index: targetStack.length - 1, label: 'top', color: 'green' }], 2, `Insert ${value} at Top`, opName));

        return { endStacks: newStacks, timeline: frames };
    };

    const generatePopFrames = (currentStacks: StackItem[][], stackIdx: number) => {
        const frames: Frame[] = [];
        const opName = `POP (Stack ${stackIdx + 1})`;
        const newStacks = currentStacks.map(s => [...s]);
        const targetStack = newStacks[stackIdx];

        // 1. Check Underflow
        frames.push(createFrame(newStacks, [], [{ index: targetStack.length - 1, label: 'top', color: 'primary' }], 0, `Check Stack ${stackIdx + 1} Underflow`, opName));

        if (targetStack.length === 0) {
            frames.push(createFrame(newStacks, [], [], 1, "Stack Underflow Error!", opName));
            return { endStacks: newStacks, timeline: frames };
        }

        // 2. Retrieve Value
        const val = targetStack[targetStack.length - 1];
        frames.push(createFrame(newStacks, [targetStack.length - 1], [{ index: targetStack.length - 1, label: 'top', color: 'red' }], 2, `Retrieve Value: ${val}`, opName));

        // 3. Decrement Top (Remove Element)
        targetStack.pop();
        frames.push(createFrame(newStacks, [], [{ index: targetStack.length - 1, label: 'top', color: 'primary' }], 3, "Decrement Top", opName));

        return { endStacks: newStacks, timeline: frames };
    };

    const generatePeekFrames = (currentStacks: StackItem[][], stackIdx: number) => {
        const frames: Frame[] = [];
        const opName = `PEEK (Stack ${stackIdx + 1})`;
        const newStacks = currentStacks.map(s => [...s]);
        const targetStack = newStacks[stackIdx];

        if (targetStack.length === 0) {
            frames.push(createFrame(newStacks, [], [], 0, "Stack Empty", opName));
            return { endStacks: newStacks, timeline: frames };
        }

        frames.push(createFrame(newStacks, [targetStack.length - 1], [{ index: targetStack.length - 1, label: 'top', color: 'primary' }], 1, `Peek Top: ${targetStack[targetStack.length - 1]}`, opName));
        return { endStacks: newStacks, timeline: frames };
    };

    // ... (Applications use specific stacks logic, mostly fine to leave as is or update if needed)
    // For now, applications create their own stack environments or use existing slots.
    // The previous implementation of apps (Reverse, Balanced, Postfix) created fresh stacks ([[]]).
    // Browser history used [0] and [1].

    // We'll keep applications as is for now, as they generally reset the view.
    // Browser history logic is already multi-stack aware (uses 0 and 1).

    // --- Application Generators (Keep existing logic, they reset state usually) ---
    const generateStringReversalFrames = (input: string) => {
        const frames: Frame[] = [];
        const opName = "REVERSE STRING";
        let currentStack: StackItem[] = [];

        // Stack 1: Main Stack. We'll show just one stack for this app usually, or maybe 2?
        // Existing logic used [[]]. Let's keep it consistent.

        frames.push(createFrame([[]], [], [], 0, "Initialize empty stack", opName));

        frames.push(createFrame([[]], [], [], 1, `Pushing characters of "${input}"...`, opName));

        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (currentStack.length >= MAX_CAPACITY) {
                frames.push(createFrame([currentStack], [], [{ index: currentStack.length - 1, label: 'top', color: 'red' }], 1, "Stack Overflow during push!", opName));
                return { endStacks: [currentStack], timeline: frames };
            }

            currentStack.push(char);
            frames.push(createFrame([[...currentStack]], [currentStack.length - 1], [{ index: currentStack.length - 1, label: 'top', color: 'green' }], 1, `Pushed '${char}'`, opName));
        }

        frames.push(createFrame([[...currentStack]], [], [{ index: currentStack.length - 1, label: 'top', color: 'primary' }], 2, "Now popping to reverse...", opName, ""));

        let result = "";

        while (currentStack.length > 0) {
            const char = currentStack[currentStack.length - 1];
            frames.push(createFrame([[...currentStack]], [currentStack.length - 1], [{ index: currentStack.length - 1, label: 'top', color: 'primary' }], 3, `Pop '${char}'`, opName, result));
            currentStack.pop();
            result += char;
            frames.push(createFrame([[...currentStack]], [], [{ index: Math.max(-1, currentStack.length - 1), label: 'top', color: 'primary' }], 4, "Building result...", opName, result));
        }

        frames.push(createFrame([[]], [], [], 5, "Reversal Complete", opName, result));
        return { endStacks: [[]], timeline: frames };
    };

    const generateBalancedParenthesesFrames = (input: string) => {
        // (Keep existing logic)
        const frames: Frame[] = [];
        const opName = "CHECK BALANCE";
        let currentStack: StackItem[] = [];
        let output = "";

        const isMatch = (open: string, close: string) => {
            if (open === '(' && close === ')') return true;
            if (open === '{' && close === '}') return true;
            if (open === '[' && close === ']') return true;
            return false;
        };

        frames.push(createFrame([[]], [], [], 0, "Initialize empty stack", opName));

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if (['(', '{', '['].includes(char)) {
                if (currentStack.length >= MAX_CAPACITY) {
                    frames.push(createFrame([currentStack], [], [{ index: currentStack.length - 1, label: 'top', color: 'red' }], 1, "Stack Overflow!", opName, output));
                    return { endStacks: [currentStack], timeline: frames };
                }
                currentStack.push(char);
                frames.push(createFrame([[...currentStack]], [currentStack.length - 1], [{ index: currentStack.length - 1, label: 'top', color: 'green' }], 1, `Push open bracket '${char}'`, opName, output));
            } else if ([')', '}', ']'].includes(char)) {
                if (currentStack.length === 0) {
                    output = "Invalid";
                    frames.push(createFrame([[]], [], [], 3, `Found '${char}' but stack empty. Mismatch!`, opName, output));
                    return { endStacks: [[]], timeline: frames };
                }

                const top = currentStack[currentStack.length - 1] as string;
                frames.push(createFrame([[...currentStack]], [currentStack.length - 1], [{ index: currentStack.length - 1, label: 'top', color: 'primary' }], 4, `Found '${char}', checking top...`, opName, output));

                currentStack.pop();

                if (isMatch(top, char)) {
                    frames.push(createFrame([[...currentStack]], [], [{ index: Math.max(-1, currentStack.length - 1), label: 'top', color: 'primary' }], 5, `Match! '${top}' and '${char}'`, opName, output));
                } else {
                    output = "Invalid";
                    frames.push(createFrame([[...currentStack]], [], [], 6, `Mismatch! '${top}' and '${char}'`, opName, output));
                    return { endStacks: [currentStack], timeline: frames };
                }
            }
        }

        if (currentStack.length === 0) {
            output = "Valid";
            frames.push(createFrame([[]], [], [], 7, "Stack empty. All matched.", opName, output));
        } else {
            output = "Invalid";
            frames.push(createFrame([[...currentStack]], [], [{ index: currentStack.length - 1, label: 'top', color: 'red' }], 8, "Stack not empty. Unmatched brackets.", opName, output));
        }

        return { endStacks: [currentStack], timeline: frames };
    };

    const generatePostfixEvalFrames = (input: string) => {
        const frames: Frame[] = [];
        const opName = "POSTFIX EVAL";
        let output = "";

        const tokens = input.trim().split(/\s+/);

        // Stack 1: Input Tokens (Reverse so we pop from top)
        // Stack 2: Evaluation Stack
        const inputStack: StackItem[] = [...tokens].reverse();
        const evalStack: StackItem[] = [];

        // Initial State
        frames.push(createFrame([inputStack, evalStack], [], [], 0, "Initialize: Stack 1 (Input), Stack 2 (Eval)", opName));

        while (inputStack.length > 0) {
            // 1. Pop Token from Input Stack
            const token = inputStack.pop() as string;
            frames.push(createFrame([inputStack, evalStack], [], [{ index: inputStack.length, label: 'top', color: 'primary' }], 1, `Read token '${token}' from Input`, opName, output));

            if (!isNaN(parseFloat(token)) && isFinite(Number(token))) {
                // Operand -> Push to Eval Stack
                if (evalStack.length >= MAX_CAPACITY) {
                    frames.push(createFrame([inputStack, evalStack], [], [{ index: evalStack.length - 1, label: 'top', color: 'red' }], 1, "Eval Stack Overflow!", opName, output));
                    return { endStacks: [inputStack, evalStack], timeline: frames };
                }
                evalStack.push(Number(token));
                frames.push(createFrame([inputStack, evalStack], [evalStack.length - 1], [{ index: evalStack.length - 1, label: 'top', color: 'green' }], 1, `Push number ${token} to Eval Stack`, opName, output));
            } else if (['+', '-', '*', '/'].includes(token)) {
                // Operator -> Pop 2 from Eval Stack
                if (evalStack.length < 2) {
                    output = "Error";
                    frames.push(createFrame([inputStack, evalStack], [], [], 3, `Operator '${token}' needs 2 operands`, opName, output));
                    return { endStacks: [inputStack, evalStack], timeline: frames };
                }

                const b = evalStack.pop() as number;
                const a = evalStack.pop() as number;
                frames.push(createFrame([inputStack, evalStack], [], [], 3, `Pop ${b}, Pop ${a} from Eval Stack`, opName, output));

                let result = 0;
                switch (token) {
                    case '+': result = a + b; break;
                    case '-': result = a - b; break;
                    case '*': result = a * b; break;
                    case '/': result = Math.trunc(a / b); break;
                }

                // Push Result back to Eval Stack
                if (evalStack.length >= MAX_CAPACITY) {
                    frames.push(createFrame([inputStack, evalStack], [], [{ index: evalStack.length - 1, label: 'top', color: 'red' }], 1, "Stack Overflow on Result!", opName, output));
                    return { endStacks: [inputStack, evalStack], timeline: frames };
                }

                frames.push(createFrame([inputStack, evalStack], [], [], 4, `Calc: ${a} ${token} ${b} = ${result}`, opName, output));
                evalStack.push(result);
                frames.push(createFrame([inputStack, evalStack], [evalStack.length - 1], [{ index: evalStack.length - 1, label: 'top', color: 'primary' }], 5, `Push result ${result} to Eval Stack`, opName, output));
            } else {
                output = "Invalid Token";
                frames.push(createFrame([inputStack, evalStack], [], [], 0, `Unknown token: ${token}`, opName, output));
                return { endStacks: [inputStack, evalStack], timeline: frames };
            }
        }

        if (evalStack.length === 1) {
            output = String(evalStack[0]);
            frames.push(createFrame([inputStack, evalStack], [0], [{ index: 0, label: 'top', color: 'green' }], 6, `Final Result: ${output}`, opName, output));
        } else {
            output = "Error";
            frames.push(createFrame([inputStack, evalStack], [], [], 6, "Eval Stack should have 1 item left", opName, output));
        }

        return { endStacks: [inputStack, evalStack], timeline: frames };
    };

    const generateBrowserVisitFrames = (currentStacks: StackItem[][], current: string, url: string) => {
        const frames: Frame[] = [];
        const opName = `VISIT: ${url}`;
        const output = `Current: ${current}`;
        const backStack = [...(currentStacks[0] || [])];
        const forwardStack = [...(currentStacks[1] || [])];

        // This is specifically for browser history, uses fixed indices 0 and 1
        frames.push(createFrame([backStack, forwardStack], [], [], 0, `Starting visit to ${url}`, opName, output));

        // 1. Push current page to Back Stack
        if (backStack.length >= MAX_CAPACITY) {
            frames.push(createFrame([backStack, forwardStack], [], [], 1, "Back Stack Overflow! Truncating...", opName, output));
            backStack.shift(); // Remove oldest
        }
        backStack.push(current);
        frames.push(createFrame([backStack, forwardStack], [backStack.length - 1], [{ index: backStack.length - 1, label: 'top', color: 'green' }], 1, `Pushed '${current}' to Back History`, opName, output));

        // 2. Clear Forward Stack
        const clearedForward: StackItem[] = [];
        frames.push(createFrame([backStack, clearedForward], [], [], 2, "Cleared Forward History", opName, output));

        // 3. Update Current
        const newOutput = `Current: ${url}`;
        frames.push(createFrame([backStack, clearedForward], [], [], 3, `Updated Current Page to '${url}'`, opName, newOutput));

        return { endStacks: [backStack, clearedForward], timeline: frames, newCurrent: url };
    };

    const generateBrowserBackFrames = (currentStacks: StackItem[][], current: string) => {
        const frames: Frame[] = [];
        const opName = "BACK";
        const output = `Current: ${current}`;
        const backStack = [...(currentStacks[0] || [])];
        const forwardStack = [...(currentStacks[1] || [])];

        if (backStack.length === 0) {
            frames.push(createFrame([backStack, forwardStack], [], [], 0, "No Back History", opName, output));
            return { endStacks: [backStack, forwardStack], timeline: frames, newCurrent: current };
        }

        frames.push(createFrame([backStack, forwardStack], [], [], 0, "Going Back...", opName, output));

        // 1. Push current to Forward Stack
        if (forwardStack.length >= MAX_CAPACITY) {
            frames.push(createFrame([backStack, forwardStack], [], [], 1, "Forward Stack Overflow! Truncating...", opName, output));
            forwardStack.shift();
        }
        forwardStack.push(current);
        frames.push(createFrame([backStack, forwardStack], [backStack.length - 1], [{ index: forwardStack.length - 1, label: 'top', color: 'primary' }], 1, `Pushed '${current}' to Forward History`, opName, output));

        // 2. Pop from Back Stack -> New Current
        const prev = backStack.pop() as string;
        const newOutput = `Current: ${prev}`;
        frames.push(createFrame([backStack, forwardStack], [], [], 2, `Popped '${prev}' from Back History. Revisit it.`, opName, newOutput));

        return { endStacks: [backStack, forwardStack], timeline: frames, newCurrent: prev };
    };

    const generateBrowserForwardFrames = (currentStacks: StackItem[][], current: string) => {
        const frames: Frame[] = [];
        const opName = "FORWARD";
        const output = `Current: ${current}`;
        const backStack = [...(currentStacks[0] || [])];
        const forwardStack = [...(currentStacks[1] || [])];

        if (forwardStack.length === 0) {
            frames.push(createFrame([backStack, forwardStack], [], [], 0, "No Forward History", opName, output));
            return { endStacks: [backStack, forwardStack], timeline: frames, newCurrent: current };
        }

        frames.push(createFrame([backStack, forwardStack], [], [], 0, "Going Forward...", opName, output));

        // 1. Push current to Back Stack
        if (backStack.length >= MAX_CAPACITY) {
            frames.push(createFrame([backStack, forwardStack], [], [], 1, "Back Stack Overflow! Truncating...", opName, output));
            backStack.shift();
        }
        backStack.push(current);
        frames.push(createFrame([backStack, forwardStack], [backStack.length - 1], [{ index: backStack.length - 1, label: 'top', color: 'primary' }], 1, `Pushed '${current}' to Back History`, opName, output));

        // 2. Pop from Forward Stack -> New Current
        const next = forwardStack.pop() as string;
        const newOutput = `Current: ${next}`;
        frames.push(createFrame([backStack, forwardStack], [], [], 2, `Popped '${next}' from Forward History. Revisit it.`, opName, newOutput));

        return { endStacks: [backStack, forwardStack], timeline: frames, newCurrent: next };
    };

    // --- Handlers ---

    const runSimulation = (generatorResult: { endStacks: StackItem[][], timeline: Frame[] }) => {
        setFrames(generatorResult.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
        setInitialStacks(generatorResult.endStacks);
    };

    const handlePush = () => {
        // Try parsing as number, if NaN use string
        let val: StackItem = parseInt(pushValue);
        if (isNaN(val)) val = pushValue.trim();
        if (val === '') { setError("Invalid Input"); return; }

        if (!initialStacks[activeStackIndex]) {
            // If stack doesn't exist, create it?
            // For now assume logic handles it or we initialize properly.
            // We can auto-expand initialStacks if needed, but safe to check.
            // const newStacks = [...initialStacks];
            // newStacks[activeStackIndex] = [];
        }

        const currentStack = initialStacks[activeStackIndex] || [];
        if (currentStack.length >= MAX_CAPACITY) { setError("Stack Overflow"); return; }

        // We need to pass FULL stacks to generator, but it needs to know which to modify
        const stacksToUse = initialStacks.length > activeStackIndex ? initialStacks : [...initialStacks, []];
        // Ensure we have enough stacks
        while (stacksToUse.length <= activeStackIndex) stacksToUse.push([]);

        const result = generatePushFrames(stacksToUse, val, activeStackIndex);
        runSimulation(result);
    };

    const handlePop = () => {
        const currentStack = initialStacks[activeStackIndex] || [];
        if (currentStack.length === 0) { setError("Stack Underflow"); return; }

        const stacksToUse = initialStacks.length > activeStackIndex ? initialStacks : [...initialStacks, []];
        while (stacksToUse.length <= activeStackIndex) stacksToUse.push([]);

        const result = generatePopFrames(stacksToUse, activeStackIndex);
        runSimulation(result);
    };

    const handlePeek = () => {
        const currentStack = initialStacks[activeStackIndex] || [];
        if (currentStack.length === 0) { setError("Stack Empty"); return; }

        const stacksToUse = initialStacks.length > activeStackIndex ? initialStacks : [...initialStacks, []];
        while (stacksToUse.length <= activeStackIndex) stacksToUse.push([]);

        const result = generatePeekFrames(stacksToUse, activeStackIndex);
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

        // Update ONLY active stack
        const newStacks = [...initialStacks];
        // Ensure previous stacks exist
        while (newStacks.length <= activeStackIndex) newStacks.push([]);

        newStacks[activeStackIndex] = vals;

        setInitialStacks(newStacks);
        setFrames([createFrame(newStacks, [], [{ index: vals.length - 1, label: 'top', color: 'primary' }], 2, `Stack ${activeStackIndex + 1} Initialized (Size ${vals.length})`, "CREATE")]);
        setCurrentStep(0);
        setIsPlaying(false);
    };

    const handleCreateRandom = () => {
        const size = parseInt(createSize);
        const len = (isNaN(size) || size < 1 || size > MAX_CAPACITY) ? 5 : size;
        const vals = Array.from({ length: len }, () => Math.floor(Math.random() * 99) + 1);

        const newStacks = [...initialStacks];
        while (newStacks.length <= activeStackIndex) newStacks.push([]);
        newStacks[activeStackIndex] = vals;

        setInitialStacks(newStacks);
        setCreateInput(vals.join(', '));
        setFrames([createFrame(newStacks, [], [{ index: vals.length - 1, label: 'top', color: 'primary' }], 2, `Random Stack ${activeStackIndex + 1} (Size ${len}) Created`, "CREATE")]);
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
        stacks: initialStacks,
        highlights: [],
        pointers: initialStacks[activeStackIndex]?.length > 0 ? [{ index: initialStacks[activeStackIndex].length - 1, label: 'top', color: 'primary' }] : [],
        codeLine: -1,
        description: "Ready",
        internalState: {
            capacity: MAX_CAPACITY,
            size: initialStacks[activeStackIndex]?.length || 0,
            top: (initialStacks[activeStackIndex]?.length || 0) - 1,
            currentOp: "None"
        }
    };



    // --- Application Handlers ---

    const handleReverseString = () => {
        if (!appInput.trim()) { setError("Invalid Input"); return; }
        const result = generateStringReversalFrames(appInput);
        runSimulation(result);
    };

    const handleBalancedParentheses = () => {
        if (!balancedInput.trim()) { setError("Invalid Input"); return; }
        const result = generateBalancedParenthesesFrames(balancedInput);
        runSimulation(result);
    };

    const handlePostfixEval = () => {
        if (!postfixInput.trim()) { setError("Invalid Input"); return; }
        const result = generatePostfixEvalFrames(postfixInput);
        runSimulation(result);
    };

    const handleBrowserVisit = () => {
        if (!browserInput.trim()) { setError("Invalid URL"); return; }
        // Ensure stacks initialized
        const existingStacks = initialStacks.length >= 2 ? initialStacks : [[], []];

        const result = generateBrowserVisitFrames(existingStacks, browserCurrent, browserInput);
        // Special runSimulation because we update browserCurrent
        setBrowserCurrent(result.newCurrent);
        setInitialStacks(result.endStacks);
        setFrames(result.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const handleBrowserBack = () => {
        const existingStacks = initialStacks.length >= 2 ? initialStacks : [[], []];
        if (existingStacks[0].length === 0) { setError("No back history"); return; }

        const result = generateBrowserBackFrames(existingStacks, browserCurrent);
        setBrowserCurrent(result.newCurrent);
        setInitialStacks(result.endStacks);
        setFrames(result.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    const handleBrowserForward = () => {
        const existingStacks = initialStacks.length >= 2 ? initialStacks : [[], []];
        if (existingStacks[1].length === 0) { setError("No forward history"); return; }

        const result = generateBrowserForwardFrames(existingStacks, browserCurrent);
        setBrowserCurrent(result.newCurrent);
        setInitialStacks(result.endStacks);
        setFrames(result.timeline);
        setCurrentStep(0);
        setIsPlaying(true);
    };

    return {
        // State
        initialStacks,
        frames,
        currentStep,
        isPlaying,
        playbackSpeed,
        activeOp,
        error,
        mode,
        activeStackIndex,
        // State (Values)
        createSize,
        createInput,
        pushValue,
        appInput,
        balancedInput,
        postfixInput,
        browserCurrent,
        browserInput,
        currentFrame,

        // Setters
        setIsPlaying,
        setCurrentStep,
        setPlaybackSpeed,
        setActiveOp,
        setError,
        setMode,
        setActiveStackIndex,
        setCreateSize,
        setCreateInput,
        setPushValue,
        setAppInput,
        setBalancedInput,
        setPostfixInput,
        setBrowserCurrent,
        setBrowserInput,

        // Handlers
        handlePush,
        handlePop,
        handlePeek,
        handleCreateCustom,
        handleCreateRandom,
        handleReverseString,
        handleBalancedParentheses,
        handlePostfixEval,
        handleBrowserVisit,
        handleBrowserBack,
        handleBrowserForward
    };
};
