import { useState } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useQueueVisualizer, PSEUDOCODE, COMPLEXITY, MAX_CAPACITY } from '../hooks/useQueueVisualizer';

const Queue = () => {
    const {
        // State
        frames,
        currentStep,
        isPlaying,
        playbackSpeed,
        activeOp,
        error,
        createSize,
        createInput,
        enqueueValue,
        currentFrame,

        // Setters
        setIsPlaying,
        setCurrentStep,
        setPlaybackSpeed,
        setActiveOp,
        setCreateSize,
        setCreateInput,
        setEnqueueValue,

        // Handlers
        handleEnqueue,
        handleDequeue,
        handlePeek,
        handleCreateCustom,
        handleCreateRandom
    } = useQueueVisualizer();

    const [activeTab, setActiveTab] = useState<'controls' | 'code' | 'pseudo' | 'info'>('controls');

    // Dragging & Zoom - Canvas
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [createStep, setCreateStep] = useState<'size' | 'values'>('size');

    // Draggable Logic - Canvas Only
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

    // Zoom Logic
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) return;
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        setZoom(prev => Math.min(Math.max(0.5, prev + scaleAmount), 3));
    };

    const currentComplexity = activeOp ? COMPLEXITY[activeOp] : COMPLEXITY['enqueue'];
    const currentPseudocode = activeOp ? PSEUDOCODE[activeOp] : [];

    // --- Components for Tabs ---

    const ControlsTab = () => (
        <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Operations</h3>

            {/* Operation: Create */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'create' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => { setActiveOp(prev => prev === 'create' ? null : 'create'); setCreateStep('size'); }} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'create' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>add_circle</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'create' ? 'text-primary font-bold' : ''}`}>Create</p></div>
                </button>
                {activeOp === 'create' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                        {createStep === 'size' ? (
                            <>
                                <label>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Queue Size (Max {MAX_CAPACITY})</span>
                                    <input type="number" value={createSize} onChange={e => setCreateSize(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-md px-3 py-2 text-sm font-mono focus:border-primary outline-none mt-1" />
                                </label>
                                <button onClick={() => setCreateStep('values')} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Next</button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <button onClick={() => setCreateStep('size')} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-sm">arrow_back</span></button>
                                    <span className="text-xs font-bold text-gray-500">Method</span>
                                </div>
                                <button onClick={handleCreateRandom} className="w-full border border-gray-600 hover:bg-white/5 text-white text-xs font-bold py-2 rounded">Generate Random</button>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400"><div className="h-px bg-gray-600 flex-1"></div>OR<div className="h-px bg-gray-600 flex-1"></div></div>
                                <input value={createInput} onChange={e => setCreateInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-md px-3 py-2 text-sm font-mono focus:border-primary outline-none" placeholder="1, 2, 3..." />
                                <button onClick={handleCreateCustom} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Set Values</button>
                            </>
                        )}
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>

            {/* Operation: Enqueue */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'enqueue' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => setActiveOp(prev => prev === 'enqueue' ? null : 'enqueue')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'enqueue' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>login</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'enqueue' ? 'text-primary font-bold' : ''}`}>Enqueue (v)</p></div>
                </button>
                {activeOp === 'enqueue' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                        <label><span className="text-[10px] text-gray-400 uppercase font-bold">Value</span><input type="text" value={enqueueValue} onChange={e => setEnqueueValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                        <button onClick={handleEnqueue} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Enqueue</button>
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>

            {/* Operation: Dequeue */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'dequeue' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => setActiveOp(prev => prev === 'dequeue' ? null : 'dequeue')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'dequeue' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>logout</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'dequeue' ? 'text-primary font-bold' : ''}`}>Dequeue</p></div>
                </button>
                {activeOp === 'dequeue' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs text-gray-400 mb-2">Remove front element?</p>
                        <button onClick={handleDequeue} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Dequeue</button>
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>

            {/* Operation: Peek */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'peek' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => setActiveOp(prev => prev === 'peek' ? null : 'peek')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'peek' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>visibility</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'peek' ? 'text-primary font-bold' : ''}`}>Peek</p></div>
                </button>
                {activeOp === 'peek' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs text-gray-400 mb-2">View front element?</p>
                        <button onClick={handlePeek} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Peek</button>
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>
        </div>
    );

    const CodeTab = () => (
        <div className="flex flex-col gap-2 h-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Implementation</h3>
            <div className="bg-[#121121] border border-[#383564] rounded-lg p-3 overflow-auto flex-1 font-mono text-xs text-gray-300">
                <pre>{`class Queue {
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
};`}</pre>
            </div>
        </div>
    );

    const PseudoTab = () => (
        <div className="flex flex-col gap-2 h-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Pseudocode</h3>
            <div className="bg-[#121121] border border-[#383564] rounded-lg p-4 font-mono text-xs text-gray-400">
                <div className="space-y-1">
                    {currentPseudocode.map((line: string, idx: number) => (
                        <p key={idx} className={`px-2 py-1 -mx-2 rounded border-l-2 transition-colors ${idx === currentFrame.codeLine ? 'text-primary dark:text-white bg-primary/10 dark:bg-primary/20 border-primary' : 'border-transparent'}`}>
                            {idx + 1}. {line}
                        </p>
                    ))}
                    {currentPseudocode.length === 0 && <span className="text-gray-500 italic">Select an operation to see logic...</span>}
                </div>
            </div>
        </div>
    );

    const InfoTab = () => (
        <div className="flex flex-col gap-4">
            {/* Complexity Section */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Complexity</h3>
                <div className="bg-white/5 dark:bg-[#1c1a32]/50 border border-gray-200 dark:border-[#383564] rounded-xl p-4 text-xs font-mono text-gray-400">
                    <div className="flex justify-between border-b border-white/10 pb-2 mb-2"><span className="text-white font-bold uppercase">{activeOp || 'QUEUE'}</span><span className="text-primary">{currentComplexity.avg}</span></div>
                    <div className="space-y-1">
                        <div className="flex justify-between"><span>Best</span><span className="text-emerald-400">{currentComplexity.best}</span></div>
                        <div className="flex justify-between"><span>Avg</span><span className="text-amber-400">{currentComplexity.avg}</span></div>
                        <div className="flex justify-between"><span>Worst</span><span className="text-rose-400">{currentComplexity.worst}</span></div>
                        <div className="flex justify-between border-t border-white/10 pt-1 mt-1"><span>Space</span><span className="text-blue-400">{currentComplexity.space}</span></div>
                    </div>
                </div>
            </div>

            {/* Internal State Section */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Internal State</h3>
                <div className="bg-white/5 dark:bg-[#1c1a32]/50 border border-gray-200 dark:border-[#383564] rounded-xl p-4 text-xs font-mono text-gray-400">
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
                            <span>Front Index</span>
                            <span className="text-slate-900 dark:text-white font-bold">{currentFrame.internalState.front}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                            <span>Rear Index</span>
                            <span className="text-slate-900 dark:text-white font-bold">{currentFrame.internalState.rear}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Op</span>
                            <span className="text-orange-400 font-bold uppercase">{currentFrame.internalState.currentOp}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <VisualizationLayout
            title="Queue"
            sidebarPosition="right"
            contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden"
            sidebar={
                <div className="h-full flex flex-col">
                    {/* Tab Header */}
                    <div className="flex p-1 bg-gray-100 dark:bg-[#121121] rounded-lg mb-4">
                        {(['controls', 'code', 'pseudo', 'info'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-md transition-all ${activeTab === tab
                                    ? 'bg-white dark:bg-[#1c1a32] text-primary shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
                        {activeTab === 'controls' && <ControlsTab />}
                        {activeTab === 'code' && <CodeTab />}
                        {activeTab === 'pseudo' && <PseudoTab />}
                        {activeTab === 'info' && <InfoTab />}
                    </div>
                </div>
            }
            controls={
                <div className="w-full h-16 bg-white dark:bg-[#1e1c33] border-t border-gray-200 dark:border-[#272546] flex items-center px-6 gap-6 z-20">
                    <div className="flex items-center gap-2" >
                        <button onClick={() => setCurrentStep(0)} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors hover:bg-white/5" title="Start"><span className="material-symbols-outlined text-[20px]">skip_previous</span></button>
                        <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors hover:bg-white/5" title="Prev"><span className="material-symbols-outlined text-[20px]">fast_rewind</span></button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className={`size-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-red-500' : 'bg-primary'}`}>
                            <span className="material-symbols-outlined text-[24px] filled">{isPlaying ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button onClick={() => setCurrentStep(s => Math.min(frames.length - 1, s + 1))} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors hover:bg-white/5" title="Next"><span className="material-symbols-outlined text-[20px]">fast_forward</span></button>
                        <button onClick={() => setCurrentStep(frames.length - 1)} className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors hover:bg-white/5" title="End"><span className="material-symbols-outlined text-[20px]">skip_next</span></button>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1.5" >
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
                    <div className="flex items-center gap-3 w-32 border-l border-[#272546] pl-4" >
                        <span className="material-symbols-outlined text-gray-500 text-sm">speed</span>
                        <input type="range" min="0.5" max="3" step="0.5" value={playbackSpeed} onChange={e => setPlaybackSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-[#272546] rounded-lg appearance-none cursor-pointer accent-primary" />
                    </div>
                </div>
            }
        >
            {/* Canvas */}
            <div
                className={`flex-1 flex flex-col items-center justify-center overflow-hidden relative z-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <div
                    className="flex flex-row items-center justify-center gap-1 transition-transform duration-75 ease-out origin-center p-10 min-h-[400px] relative items-end pb-32"
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                >
                    {/* Queue Elements - Horizontal List */}
                    {/* Visual Container */}
                    <div className="relative flex items-end gap-1 px-4 py-8 border-b-2 border-gray-300 dark:border-gray-700 min-w-[300px] min-h-[100px] justify-start">
                        {currentFrame.queue.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">Queue Empty</div>
                        )}

                        {currentFrame.queue.map((val, i) => {
                            const highlight = currentFrame.highlights.includes(i);
                            const pointers = currentFrame.pointers.filter(p => p.index === i);

                            return (
                                <div key={i} className="relative w-16 h-16 flex-shrink-0 animate-in fade-in zoom-in duration-300">
                                    {/* Value Box */}
                                    <div className={`
                                            w-full h-full rounded-lg flex items-center justify-center text-lg font-mono font-bold shadow-md border-2 transition-all duration-300
                                            ${highlight
                                            ? 'bg-primary text-white border-primary scale-110 z-10 shadow-[0_0_20px_rgba(66,54,231,0.5)]'
                                            : 'bg-white dark:bg-[#1c1a32] border-gray-300 dark:border-[#383564] text-slate-900 dark:text-white'
                                        }
                                        `}>
                                        {val}
                                    </div>

                                    {/* Index Label */}
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 font-mono">
                                        {i}
                                    </div>

                                    {/* Pointers */}
                                    {pointers.map((p, idx) => (
                                        <div key={p.label} className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20" style={{ top: `-${3 + (idx * 2.5)}rem` }}>
                                            <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded shadow-sm border mb-0.5 whitespace-nowrap ${p.color === 'primary' ? 'text-white bg-primary border-primary' :
                                                p.color === 'green' ? 'text-white bg-emerald-500 border-emerald-500' :
                                                    'text-white bg-rose-500 border-rose-500'
                                                }`}>
                                                {p.label}
                                            </span>
                                            <span className={`material-symbols-outlined text-2xl drop-shadow-md ${p.color === 'primary' ? 'text-primary' :
                                                p.color === 'green' ? 'text-emerald-500' :
                                                    'text-rose-500'
                                                }`}>arrow_drop_down</span>
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

export default Queue;
