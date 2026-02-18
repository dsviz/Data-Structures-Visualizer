<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useHeader } from '../context/HeaderContext';
import { useLayout } from '../context/LayoutContext'; // Import useLayout

const Stack = () => {
    // --- State ---
    const [stack, setStack] = useState<number[]>([15, 8, 23]);
    const [inputValue, setInputValue] = useState<string>('42');
    const [message, setMessage] = useState<string>('Idle');
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

    // Zoom & Pan
    const { isSidebarOpen } = useLayout();
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-Resize
    useEffect(() => {
        if (!containerRef.current) return;
        // Estimate height: each block is 4rem (16) + maybe gap?
        // Actually Stack is vertical. Height matters.
        const totalHeight = stack.length * 80 + 200; // rough
        const availableHeight = containerRef.current.clientHeight;

        if (totalHeight > availableHeight && availableHeight > 0) {
            const newScale = Math.max(0.4, availableHeight / totalHeight);
            if (newScale < 0.9) setScale(newScale);
        } else {
            setScale(1);
        }
    }, [stack.length, isSidebarOpen]);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey || true) {
            const delta = -e.deltaY;
            setScale(prev => {
                const newScale = prev + (delta * 0.001);
                return Math.min(Math.max(0.2, newScale), 3);
            });
        }
    };

    // --- Handlers ---
    const handlePush = () => {
        const val = parseInt(inputValue);
        if (isNaN(val)) return;

        if (stack.length >= 7) {
            setMessage('Stack Overflow! Cannot push more items.');
            return;
        }

        setMessage(`Pushing ${val}...`);
        setStack(prev => [...prev, val]);
        setInputValue('');

        // Reset message after animation
        setTimeout(() => setMessage('Idle'), 1000);
    };

    const handlePop = () => {
        if (stack.length === 0) {
            setMessage('Stack Underflow! Stack is empty.');
            return;
        }

        const poppedVal = stack[stack.length - 1];
        setMessage(`Popping ${poppedVal}...`);

        setStack(prev => prev.slice(0, -1));

        setTimeout(() => setMessage('Idle'), 1000);
    };

    const handlePeek = () => {
        if (stack.length === 0) {
            setMessage('Stack is empty.');
            return;
        }

        const topIndex = stack.length - 1;
        setMessage(`Peeking at top element: ${stack[topIndex]}`);
        setHighlightIndex(topIndex);

        setTimeout(() => {
            setHighlightIndex(null);
            setMessage('Idle');
        }, 1500);
    };

    // --- Renderers ---

    const sidebar = (
        <div className="flex flex-col gap-6">
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stack Operations</h3>

                {/* Push Control */}
                <div className="bg-white dark:bg-[#1e1c33] p-4 rounded-xl border border-indigo-100 dark:border-[#323055] shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
                        <span className="material-symbols-outlined">arrow_forward</span>
                        <span className="font-bold">Push (v)</span>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">VALUE (v)</label>
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#131221] border border-gray-200 dark:border-[#323055] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-sm"
                                placeholder="Enter value"
                                onKeyDown={(e) => e.key === 'Enter' && handlePush()}
                            />
                        </div>
                        <button
                            onClick={handlePush}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                        >
                            Execute Push
                        </button>
                    </div>
                </div>

                {/* Other Controls */}
                <div className="space-y-2">
                    <button
                        onClick={handlePop}
                        className="w-full p-4 flex items-center gap-3 bg-white dark:bg-[#1e1c33] border border-transparent hover:border-red-200 dark:hover:border-red-900/50 rounded-xl text-left transition-all active:scale-95 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-lg">remove</span>
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Pop</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Remove top element</div>
                        </div>
                    </button>

                    <button
                        onClick={handlePeek}
                        className="w-full p-4 flex items-center gap-3 bg-white dark:bg-[#1e1c33] border border-transparent hover:border-amber-200 dark:hover:border-amber-900/50 rounded-xl text-left transition-all active:scale-95 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Peek</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">View top element</div>
                        </div>
                    </button>
=======
import { useState } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useStackVisualizer, CODE_CPP, PSEUDOCODE, COMPLEXITY, MAX_CAPACITY } from '../hooks/useStackVisualizer';

const Stack = () => {
    const {
        // State
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
        setCreateSize,
        setCreateInput,
        setPushValue,
        setAppInput,
        setMode,

        // Handlers
        handlePush,
        handlePop,
        handlePeek,
        handleCreateCustom,
        handleCreateRandom,
        handleReverseString
    } = useStackVisualizer();

    const [activeTab, setActiveTab] = useState<'controls' | 'code' | 'pseudo' | 'info'>('controls');

    // Dragging & Zoom - Canvas (UI Stuff usually stays in component unless very complex)
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

    const currentComplexity = activeOp ? COMPLEXITY[activeOp] : COMPLEXITY['push'];
    const currentPseudocode = activeOp ? PSEUDOCODE[activeOp] : [];

    // --- Components for Tabs ---

    const ControlsTab = () => (
        <div className="flex flex-col gap-2">

            {/* Mode Switcher */}
            <div className="bg-gray-100 dark:bg-[#121121] p-1 rounded-lg flex mb-2">
                <button
                    onClick={() => { setMode('standard'); setActiveOp(null); }}
                    className={`flex-1 py-1 text-[10px] uppercase font-bold rounded ${mode === 'standard' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow' : 'text-gray-400'}`}
                >
                    Standard
                </button>
                <button
                    onClick={() => { setMode('applications'); setActiveOp(null); }}
                    className={`flex-1 py-1 text-[10px] uppercase font-bold rounded ${mode === 'applications' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow' : 'text-gray-400'}`}
                >
                    Apps
                </button>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Operations</h3>

            {mode === 'standard' ? (
                <>
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
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">Stack Size (Max {MAX_CAPACITY})</span>
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

                    {/* Operation: Push */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'push' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => setActiveOp(prev => prev === 'push' ? null : 'push')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'push' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>publish</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'push' ? 'text-primary font-bold' : ''}`}>Push (v)</p></div>
                        </button>
                        {activeOp === 'push' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Value</span><input type="text" value={pushValue} onChange={e => setPushValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                <button onClick={handlePush} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Push</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Operation: Pop */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'pop' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => setActiveOp(prev => prev === 'pop' ? null : 'pop')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
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
                        <button onClick={() => setActiveOp(prev => prev === 'peek' ? null : 'peek')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
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
                </>
            ) : (
                <>
                    {/* Application: String Reversal */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'app_reverse' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => setActiveOp(prev => prev === 'app_reverse' ? null : 'app_reverse')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'app_reverse' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>swap_horiz</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'app_reverse' ? 'text-primary font-bold' : ''}`}>Reverse String</p></div>
                        </button>
                        {activeOp === 'app_reverse' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Input String</span><input type="text" value={appInput} onChange={e => setAppInput(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" maxLength={MAX_CAPACITY} /></label>
                                <button onClick={handleReverseString} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Run Reversal</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    const CodeTab = () => (
        <div className="flex flex-col gap-2 h-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Implementation</h3>
            <div className="bg-[#121121] border border-[#383564] rounded-lg p-3 overflow-auto flex-1 font-mono text-xs text-gray-300">
                <pre>{CODE_CPP}</pre>
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
>>>>>>> stack
                </div>
            </div>
        </div>
    );

<<<<<<< HEAD
    const { setHeaderContent } = useHeader();

    useEffect(() => {
        setHeaderContent(
            <div className="flex justify-center items-center gap-8 text-sm font-mono text-gray-500 dark:text-gray-400 h-full">
                <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wider text-xs">STACK</span>
                    <div className="px-3 py-1 bg-white dark:bg-[#1e1c33] rounded border border-gray-200 dark:border-[#323055]">
                        Top Index: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{stack.length > 0 ? stack.length - 1 : -1}</span>
                    </div>
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

                <div className="flex items-center gap-2">
                    <span>current_op:</span>
                    <span className={`px-2 py-0.5 rounded ${message === 'Idle' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                        {message}
                    </span>
                </div>
            </div>
        );

        return () => setHeaderContent(null);
    }, [stack.length, message, setHeaderContent]);

    return (
        <VisualizationLayout
            title="Stack & Queue"
            sidebar={sidebar}
            sidebarPosition="left"
        >
            <div className="flex flex-col w-full h-full">
                {/* Top Info Bar moved to Header */}


                {/* Visualization Area */}
                <div
                    ref={containerRef}
                    className="flex-1 flex items-center justify-center relative overflow-hidden"
                    onWheel={handleWheel}
                >
                    {/* Vertical Stack Container */}
                    <div
                        className="flex flex-col items-center transition-transform duration-100 ease-out origin-center"
                        style={{ transform: `scale(${scale})` }}
                    >
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-4 text-center">VERTICAL STACK</h3>

                        <div className="relative w-48 min-h-[400px] bg-gray-100/50 dark:bg-[#1c1a32]/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#323055] p-4 flex flex-col-reverse justify-start items-center gap-3 transition-all">
                            {stack.map((val, idx) => {
                                const isTop = idx === stack.length - 1;
                                const isHighlighted = highlightIndex === idx;

                                return (
                                    <div
                                        key={idx}
                                        className={`
                                            relative w-full h-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm border-2 transition-all duration-300
                                            ${!isTop ? 'dark:bg-[#272546] dark:text-white dark:border-[#323055] bg-white text-gray-800 border-gray-100' : 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/30'}
                                            ${isHighlighted ? 'scale-110 ring-4 ring-amber-400' : ''}
                                        `}
                                    >
                                        {val}

                                        {/* Top Pointer */}
                                        {isTop && (
                                            <div className="absolute -right-16 flex items-center gap-2 animate-bounce">
                                                <span className="material-symbols-outlined text-indigo-500 rotate-180">arrow_right_alt</span>
                                                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">TOP</span>
                                            </div>
                                        )}

                                        {/* Index Label */}
                                        <div className="absolute -left-8 text-xs font-mono text-gray-400">
                                            {idx}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty State */}
                            {stack.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm italic">
                                    Stack is empty
                                </div>
                            )}
                        </div>

                        {/* Base of container visual */}
                        <div className="w-56 h-4 bg-gray-200 dark:bg-[#272546] rounded-full mt-2 mx-auto"></div>
                    </div>
                </div>
            </div>
=======
    const InfoTab = () => (
        <div className="flex flex-col gap-4">
            {/* Complexity Section */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Complexity</h3>
                <div className="bg-white/5 dark:bg-[#1c1a32]/50 border border-gray-200 dark:border-[#383564] rounded-xl p-4 text-xs font-mono text-gray-400">
                    <div className="flex justify-between border-b border-white/10 pb-2 mb-2"><span className="text-white font-bold uppercase">{activeOp || 'STACK'}</span><span className="text-primary">{currentComplexity.avg}</span></div>
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
        </div>
    );


    return (
        <VisualizationLayout
            title="Stack"
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
                    className="flex flex-col-reverse items-center justify-end gap-1 transition-transform duration-75 ease-out origin-center p-10 min-h-[400px] relative"
                    style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                >
                    {/* Base of Stack Visual */}
                    <div className="w-40 h-2 bg-gray-300 dark:bg-gray-700 rounded-full mb-1"></div>

                    {/* Stack Elements - Rendered bottom-up via flex-col-reverse */}
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
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${p.color === 'primary' ? 'text-primary bg-white dark:bg-[#121121] border-primary/30' :
                                            p.color === 'green' ? 'text-emerald-400 bg-white dark:bg-[#121121] border-emerald-400/30' :
                                                'text-red-400 bg-white dark:bg-[#121121] border-red-400/30'
                                            }`}>
                                            {p.label}
                                        </span>
                                        <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })}

                    {/* Visual Capacity Ceiling: 12 (h-12) * 8 (capacity) = 96 (spacing) + gap-1 (0.25rem * 7)... approx calculation
                        Actually, simplified approach: position it based on known heights.
                        h-12 = 3rem = 48px. gap-1 = 0.25rem = 4px.
                        Height per item = 52px. Max capacity 8. Total height = 8 * 52 = 416px.
                        We can place it absolutely at bottom: 416px.
                    */}
                    <div className="absolute bottom-[2px] w-56 border-t-2 border-dashed border-red-500/30 pointer-events-none flex justify-center" style={{ height: `${MAX_CAPACITY * 52}px` }}> {/* 52px is approx item height + gap */}
                        <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold absolute -top-3">Max Capacity</span>
                    </div>

                    {/* Empty State */}
                    {currentFrame.stack.length === 0 && (
                        <div className="text-gray-400 text-sm py-4">Stack Empty</div>
                    )}
                </div>

            </div>

>>>>>>> stack
        </VisualizationLayout>
    );
};

export default Stack;
