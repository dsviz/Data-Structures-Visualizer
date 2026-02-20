import { useState, useEffect, useRef, useCallback } from 'react';


// --- Types ---
interface TreeNode {
    id: string;
    n: number;
    val?: number; // computed return value
    status: 'pending' | 'active' | 'computed';
    x: number;
    y: number;
    parentId?: string;
}

interface StackFrame {
    id: string;
    n: number;
    val?: number;
    status: 'active' | 'paused' | 'returning';
    line?: number; // current execution line
}

interface Step {
    treeNodes: TreeNode[];
    callStack: StackFrame[];
    logs: string[];
    activeLine: number;
    description: string;
}

// --- Layout Constants ---
const LEVEL_HEIGHT = 80;


const Recursion = () => {
    // --- State ---
    const [inputN, setInputN] = useState<number>(5);
    const [speed, setSpeed] = useState<number>(500);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [steps, setSteps] = useState<Step[]>([]);

    const intervalRef = useRef<number | null>(null);

    // --- Algorithm Logic: Fibonacci Generator ---
    const generateSteps = useCallback((n: number) => {
        const newSteps: Step[] = [];
        let nodes: TreeNode[] = [];
        let stack: StackFrame[] = [];
        let logs: string[] = [];

        // Helper to push a snapshot
        const snapshot = (line: number, desc: string) => {
            newSteps.push({
                treeNodes: JSON.parse(JSON.stringify(nodes)),
                callStack: JSON.parse(JSON.stringify(stack)),
                logs: [...logs],
                activeLine: line,
                description: desc
            });
        };

        const addLog = (msg: string) => {
            logs = [...logs, msg];
            if (logs.length > 5) logs.shift(); // keep limited history
        };

        // Recursive simulator
        // Returns the value, but primarily updates 'nodes' and 'stack' for the snapshot
        const fib = (val: number, x: number, y: number, parentId?: string, idPrefix = 'root'): number => {
            const id = `${idPrefix}_${val}`;

            // 1. Call initiated
            const node: TreeNode = { id, n: val, status: 'active', x, y, parentId };
            nodes.push(node);

            const frame: StackFrame = { id, n: val, status: 'active' };
            // Pause parent frame if exists
            if (stack.length > 0) {
                stack[stack.length - 1].status = 'paused';
            }
            stack.push(frame);

            addLog(`> Calling fib(${val})`);
            snapshot(2, `Calling fib(${val})`); // Line 2: function definition/start

            let result = val;

            // 2. Base case check
            snapshot(4, `Checking base case: n (${val}) <= 1?`);
            if (val <= 1) {
                // Base case hit
                node.status = 'computed';
                node.val = val;
                frame.status = 'returning';
                frame.val = val;
                addLog(`> Base case hit: returning ${val}`);
                snapshot(4, `Base case true. Returning ${val}.`);
            } else {
                // 3. Recursive Step: Left
                snapshot(7, `Recursive call: left = fib(${val} - 1)`);

                // Calculate simpler visual offset based on depth (naive approach for this tailored demo)
                // A real general tree layout is complex, here we assume n <= 6 for clean visuals
                const depth = y / LEVEL_HEIGHT;
                const offset = 150 / (depth + 1);

                const leftVal = fib(val - 1, x - offset, y + LEVEL_HEIGHT, id, `${id}_L`);

                // Back in current frame
                stack[stack.length - 1].status = 'active'; // resume
                snapshot(7, `Received left = ${leftVal}`);

                // 4. Recursive Step: Right
                snapshot(8, `Recursive call: right = fib(${val} - 2)`);
                const rightVal = fib(val - 2, x + offset, y + LEVEL_HEIGHT, id, `${id}_R`);

                // Back in current frame
                stack[stack.length - 1].status = 'active'; // resume
                snapshot(8, `Received right = ${rightVal}`);

                // 5. Combine
                result = leftVal + rightVal;
                snapshot(10, `Computing result: ${leftVal} + ${rightVal} = ${result}`);

                node.status = 'computed';
                node.val = result;
                frame.status = 'returning';
                frame.val = result;
            }

            // 6. Return
            addLog(`> fib(${val}) returning ${result}`);
            snapshot(10, `Returning ${result}`);

            stack.pop();
            // Resume parent if exists
            if (stack.length > 0) {
                stack[stack.length - 1].status = 'active';
            }

            return result;
        };

        // Start simulation (centered at 300, 40)
        snapshot(1, "Starting simulation...");
        fib(n, 300, 50);
        snapshot(11, "Simulation complete.");

        return newSteps;
    }, []);

    // --- Initialization ---
    useEffect(() => {
        // Reset when input changes
        if (inputN > 6) setInputN(6); // Clamp for visual sanity
        const generated = generateSteps(inputN);
        setSteps(generated);
        setCurrentStepIndex(0);
        setIsPlaying(false);
    }, [inputN, generateSteps]);

    // --- Playback Loop ---
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = window.setInterval(() => {
                setCurrentStepIndex(prev => {
                    if (prev < steps.length - 1) return prev + 1;
                    setIsPlaying(false);
                    return prev;
                });
            }, speed);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, steps.length, speed]);


    // --- Handlers ---
    const handleRun = () => {
        setCurrentStepIndex(0);
        setIsPlaying(true);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);
    const stepForward = () => {
        setIsPlaying(false);
        if (currentStepIndex < steps.length - 1) setCurrentStepIndex(curr => curr + 1);
    };
    const stepBack = () => {
        setIsPlaying(false);
        if (currentStepIndex > 0) setCurrentStepIndex(curr => curr - 1);
    };
    const reset = () => {
        setIsPlaying(false);
        setCurrentStepIndex(0);
    };

    // --- Current State Derivation ---
    const currentStep = steps[currentStepIndex] || { treeNodes: [], callStack: [], logs: [], activeLine: 0, description: "Ready" };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
            {/* Header Removed (duplicate) */}

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar: Config & Call Stack */}
                <aside className="w-80 border-r border-gray-200 dark:border-[#272546] flex flex-col bg-white dark:bg-[#131221] z-10 shrink-0">
                    <div className="p-4 border-b border-gray-200 dark:border-[#272546]">
                        <div className="flex flex-wrap gap-2 items-center text-xs mb-1">
                            <span className="text-gray-500 dark:text-[#9794c7]">Work Mode</span>
                            <span className="text-gray-400 dark:text-[#5a5875]">/</span>
                            <span className="text-slate-900 dark:text-white font-medium uppercase tracking-tighter">Recursion</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Configuration</h1>
                    </div>

                    {/* Selection Area */}
                    <div className="p-5 space-y-6 border-b border-gray-200 dark:border-[#272546] bg-gray-50/50 dark:bg-[#1c1a32]/30">
                        {/* Algorithm Selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Select Algorithm</label>
                            <div className="relative">
                                <select
                                    value="fibonacci"
                                    disabled
                                    className="w-full appearance-none bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-700 dark:text-gray-300 text-sm rounded-lg pl-3 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer shadow-sm opacity-80"
                                >
                                    <option value="fibonacci">Fibonacci Sequence</option>
                                    <option value="factorial">Factorial (Coming Soon)</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        {/* Numeric Inputs */}
                        <div className="space-y-4 bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Input N (Max 6)</label>
                                    <input
                                        type="number"
                                        value={inputN}
                                        max={6}
                                        min={0}
                                        onChange={(e) => setInputN(Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))}
                                        className="w-full bg-white dark:bg-[#0d0c15] border border-gray-200 dark:border-[#272546] rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Speed (ms)</label>
                                    <input
                                        type="number"
                                        value={speed}
                                        min={50}
                                        step={50}
                                        onChange={(e) => setSpeed(parseInt(e.target.value) || 500)}
                                        className="w-full bg-white dark:bg-[#0d0c15] border border-gray-200 dark:border-[#272546] rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleRun}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                                Start Simulation
                            </button>
                        </div>
                    </div>


                    {/* Call Stack Panel */}
                    <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-[#131221]">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-[#1c1a32] border-b border-gray-200 dark:border-[#272546] flex justify-between items-center">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">layers</span> Call Stack
                            </h3>
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-bold">Depth: {currentStep.callStack.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
                            {currentStep.callStack.slice().reverse().map((frame, idx) => (
                                <div
                                    key={`${frame.id}-${idx}`}
                                    className={`
                                        border rounded p-3 transition-all
                                        ${frame.status === 'active' || frame.status === 'returning'
                                            ? 'bg-white dark:bg-[#1c1a32] border-primary border-l-4 shadow-lg'
                                            : 'bg-gray-50 dark:bg-[#1c1a32]/50 border-gray-200 dark:border-[#272546] opacity-80'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-mono text-sm font-bold ${frame.status === 'active' ? 'text-slate-900 dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}>
                                            fib({frame.n})
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide ${frame.status === 'active' ? 'text-primary bg-primary/10' :
                                            frame.status === 'returning' ? 'text-emerald-500 bg-emerald-500/10' :
                                                'text-gray-500 border border-gray-200 dark:border-[#272546]'
                                            }`}>
                                            {frame.status}
                                        </span>
                                    </div>
                                    <div className="font-mono text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                        <div className="flex justify-between"><span>n:</span> <span className="text-slate-900 dark:text-white">{frame.n}</span></div>
                                        {frame.val !== undefined && (
                                            <div className="flex justify-between">
                                                <span>return:</span>
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{frame.val}</span>
                                            </div>
                                        )}
                                        {frame.status === 'paused' && (
                                            <div className="flex justify-between"><span>waiting...</span></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {currentStep.callStack.length === 0 && (
                                <div className="text-center text-gray-400 text-xs py-8">Stack is empty</div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Center: Visualization Canvas */}
                <main className="flex-1 flex flex-col relative bg-gray-50 dark:bg-[#0f0e1a] overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(to right, #4236e7 1px, transparent 1px), linear-gradient(to bottom, #4236e7 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}></div>

                    {/* Canvas Toolbar */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#1c1a32]/90 backdrop-blur border border-gray-200 dark:border-[#272546] rounded-full p-1.5 flex gap-1 shadow-xl z-20">
                        <button onClick={stepBack} className="size-9 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white transition-colors" title="Step Back">
                            <span className="material-symbols-outlined text-[20px]">skip_previous</span>
                        </button>
                        <button onClick={togglePlay} className={`size-9 rounded-full ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-all`} title={isPlaying ? "Pause" : "Play"}>
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button onClick={stepForward} className="size-9 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white transition-colors" title="Step Forward">
                            <span className="material-symbols-outlined text-[20px]">skip_next</span>
                        </button>
                        <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 self-center mx-1"></div>
                        <button onClick={reset} className="size-9 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" title="Reset">
                            <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                        </button>
                    </div>

                    {/* Visualization Area */}
                    <div className="flex-1 relative overflow-auto cursor-grab active:cursor-grabbing">
                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-[#1c1a32]/80 backdrop-blur border border-gray-200 dark:border-[#272546] rounded-lg p-3 text-xs z-10 shadow-lg pointer-events-none">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-3 rounded-full bg-primary animate-pulse"></div>
                                <span className="text-slate-600 dark:text-gray-300">Active (Computing)</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-3 rounded-full bg-emerald-500"></div>
                                <span className="text-slate-600 dark:text-gray-300">Returned (Computed)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-white dark:bg-[#131221] border border-gray-300 dark:border-gray-600 border-dashed"></div>
                                <span className="text-slate-600 dark:text-gray-300">Pending</span>
                            </div>
                        </div>

                        {/* Info Badge */}
                        <div className="absolute top-6 left-6 z-10 pointer-events-none">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#1e1c33]/80 backdrop-blur border border-gray-200 dark:border-[#272546] shadow-xl">
                                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{currentStep.description}</span>
                            </div>
                        </div>


                        {/* Tree SVG */}
                        <div className="absolute inset-0 flex items-center justify-center transform translate-y-[-10%] scale-90 origin-top">
                            <div className="relative w-[600px] h-[400px]">
                                {/* Connectors */}
                                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none stroke-gray-300 dark:stroke-gray-700" strokeWidth="2">
                                    {currentStep.treeNodes.map(node => {
                                        if (!node.parentId) return null;
                                        const parent = currentStep.treeNodes.find(p => p.id === node.parentId);
                                        if (!parent) return null;

                                        const isVisited = node.status !== 'pending';

                                        return (
                                            <path
                                                key={`edge-${node.id}`}
                                                d={`M${parent.x},${parent.y} C${parent.x},${parent.y + 40} ${node.x},${node.y - 40} ${node.x},${node.y}`}
                                                fill="none"
                                                className={`transition-all duration-300 ${isVisited ? 'stroke-primary' : 'opacity-30 stroke-dashed'}`}
                                                strokeDasharray={isVisited ? "0" : "4 4"}
                                                strokeWidth={isVisited ? 2 : 1}
                                            />
                                        );
                                    })}
                                </svg>

                                {/* Nodes */}
                                {currentStep.treeNodes.map(node => (
                                    <div
                                        key={node.id}
                                        className={`absolute -translate-x-1/2 -translate-y-1/2 size-14 rounded-full flex items-center justify-center z-10 shadow-lg transition-all duration-300
                                            ${node.status === 'active' ? 'bg-white dark:bg-[#1c1a32] border-4 border-primary scale-110 shadow-[0_0_30px_rgba(66,54,231,0.4)]' :
                                                node.status === 'computed' ? 'bg-emerald-50 dark:bg-[#1c1a32] border-2 border-emerald-500' :
                                                    'bg-gray-50 dark:bg-[#131221] border border-gray-300 dark:border-gray-800 border-dashed opacity-50'
                                            }
                                        `}
                                        style={{ left: node.x, top: node.y }}
                                    >
                                        <span className={`font-mono text-sm font-bold ${node.status === 'active' ? 'text-slate-900 dark:text-white' :
                                            node.status === 'computed' ? 'text-emerald-600 dark:text-emerald-400' :
                                                'text-gray-400 dark:text-gray-600'
                                            }`}>
                                            {node.val !== undefined ? node.val : node.n}
                                        </span>
                                        <div className={`absolute -top-6 text-xs font-mono transition-opacity ${node.status === 'active' ? 'text-primary font-bold opacity-100' : 'text-gray-500 opacity-0'}`}>
                                            fib({node.n})
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar: Code Editor */}
                <aside className="w-[400px] border-l border-gray-200 dark:border-[#272546] flex flex-col bg-slate-50 dark:bg-[#0d0c15] z-10 shrink-0 hidden xl:flex">
                    <div className="px-4 py-3 bg-white dark:bg-[#1c1a32] border-b border-gray-200 dark:border-[#272546] flex justify-between items-center">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">code</span> Source Code
                        </h3>
                        <div className="flex gap-2">
                            <span className="text-[10px] text-gray-500 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded font-mono">JS</span>
                        </div>
                    </div>
                    {/* Code Editor */}
                    <div className="flex-1 font-mono text-sm overflow-auto p-4 relative group">
                        <div
                            className="absolute left-0 w-full h-6 bg-primary/10 dark:bg-primary/20 border-l-2 border-primary pointer-events-none transition-all duration-300"
                            style={{ top: `${(currentStep.activeLine - 1) * 24 + 16}px` }} // Approximate line height calc
                        ></div>
                        <div className="flex">
                            <div className="flex flex-col text-right text-gray-400 dark:text-gray-600 select-none pr-4 border-r border-gray-200 dark:border-[#272546] mr-4 leading-[24px]">
                                {Array.from({ length: 11 }, (_, i) => <span key={i}>{i + 1}</span>)}
                            </div>
                            <div className="flex flex-col text-slate-800 dark:text-gray-300 whitespace-pre leading-[24px]">
                                <span className="text-gray-500">// Recursive Fibonacci</span>
                                <span><span className="text-purple-600 dark:text-purple-400">function</span> <span className="text-blue-600 dark:text-blue-400">fib</span><span className="text-yellow-600 dark:text-yellow-300">(</span><span className="text-orange-600 dark:text-orange-300">n</span><span className="text-yellow-600 dark:text-yellow-300">)</span> <span className="text-yellow-600 dark:text-yellow-300">{`{`}</span></span>
                                <span> <span className="text-gray-500">// Base cases</span></span>
                                <span> <span className="text-purple-600 dark:text-purple-400">if</span> <span className="text-yellow-600 dark:text-yellow-300">(</span>n <span className="text-purple-600 dark:text-purple-400">&lt;=</span> <span className="text-green-600 dark:text-green-400">1</span><span className="text-yellow-600 dark:text-yellow-300">)</span> <span className="text-purple-600 dark:text-purple-400">return</span> n;</span>
                                <span></span>
                                <span> <span className="text-gray-500">// Recursive step</span></span>
                                <span> <span className="text-purple-600 dark:text-purple-400">const</span> left <span className="text-purple-600 dark:text-purple-400">=</span> <span className="text-blue-600 dark:text-blue-400">fib</span><span className="text-yellow-600 dark:text-yellow-300">(</span>n <span className="text-purple-600 dark:text-purple-400">-</span> <span className="text-green-600 dark:text-green-400">1</span><span className="text-yellow-600 dark:text-yellow-300">)</span>;</span>
                                <span> <span className="text-purple-600 dark:text-purple-400">const</span> right <span className="text-purple-600 dark:text-purple-400">=</span> <span className="text-blue-600 dark:text-blue-400">fib</span><span className="text-yellow-600 dark:text-yellow-300">(</span>n <span className="text-purple-600 dark:text-purple-400">-</span> <span className="text-green-600 dark:text-green-400">2</span><span className="text-yellow-600 dark:text-yellow-300">)</span>;</span>
                                <span></span>
                                <span> <span className="text-purple-600 dark:text-purple-400">return</span> left <span className="text-purple-600 dark:text-purple-400">+</span> right;</span>
                                <span className="text-yellow-600 dark:text-yellow-300">{'}'}</span>
                            </div>
                        </div>
                    </div>
                    {/* Console */}
                    <div className="h-1/3 border-t border-gray-200 dark:border-[#272546] flex flex-col bg-gray-50 dark:bg-[#1c1a32]">
                        <div className="px-4 py-2 bg-gray-100 dark:bg-black/20 border-b border-gray-200 dark:border-[#272546] flex justify-between items-center">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Console Output</h3>
                            <button className="text-[10px] text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors">Clear</button>
                        </div>
                        <div className="flex-1 p-3 font-mono text-xs space-y-1 overflow-y-auto text-slate-700 dark:text-gray-300">
                            {currentStep.logs.map((log, i) => (
                                <div key={i} className={i === currentStep.logs.length - 1 ? 'text-primary font-bold' : 'opacity-75'}>{log}</div>
                            ))}
                            <div className="animate-pulse">_</div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default Recursion;
