import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MemoryEngine, MemoryState } from '../utils/MemoryEngine';
import ArrayStructure from '../components/visualizer/ArrayStructure';
import MemoryBlock from '../components/visualizer/MemoryBlock';
import LinkedListStructure from '../components/visualizer/LinkedListStructure';
import TreeStructure from '../components/visualizer/TreeStructure';
import ScopePanel from '../components/visualizer/ScopePanel';
import DraggablePanel from '../components/visualizer/DraggablePanel';
// FloatableControls is no longer used, we inline it in header

type Language = 'c' | 'cpp' | 'java' | 'python';

const CodeVisualizer = () => {
    // === Core State ===
    const [language, setLanguage] = useState<Language>('c');
    const [code, setCode] = useState<string>(`#include <stdio.h>

// Simple Linked List & Tree Demo
struct Node { int val; Node* next; };

int main() {
    // 1. Array
    int arr[] = {10, 20, 30, 40};
    int* ptr = &arr[2];

    // 2. Linked List
    Node* head = new Node(1);
    head->next = new Node(2);
    // head->next->next = new Node(3); 

    // 3. Simple Variable
    int x = 100;

    return 0;
}`);
    const [executionHistory, setExecutionHistory] = useState<MemoryState[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);
    const [isOutputOpen, setIsOutputOpen] = useState(false); // DEFAULT CLOSED

    // === Layout State ===
    const [editorWidth, setEditorWidth] = useState(40); // Percentage
    const isResizing = useRef(false);

    // === Visualization View State ===
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const lastPanOrigin = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    const engineRef = useRef(new MemoryEngine());

    // === Logic: Memory State ===
    const currentMemoryState = useMemo(() => {
        if (currentStepIndex >= 0 && currentStepIndex < executionHistory.length) {
            return executionHistory[currentStepIndex];
        }
        return {
            stack: [],
            heap: [],
            output: ['> Ready to run...'],
            currentLineIndex: -1
        } as MemoryState;
    }, [currentStepIndex, executionHistory]);

    // === Logic: Playback ===
    const handleRun = useCallback(() => {
        const trace = engineRef.current.runCode(code);
        setExecutionHistory(trace);
        setCurrentStepIndex(0);
        setIsAutoPlaying(false);
        setPan({ x: 0, y: 0 });
        setZoom(1);
        setIsOutputOpen(true);
    }, [code]);

    const handleNext = useCallback(() => {
        if (currentStepIndex < executionHistory.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setIsAutoPlaying(false);
        }
    }, [currentStepIndex, executionHistory.length]);

    const handlePrev = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    const handleReset = useCallback(() => {
        setCurrentStepIndex(0);
        setIsAutoPlaying(false);
    }, []);

    useEffect(() => {
        let interval: any;
        if (isAutoPlaying) {
            interval = setInterval(handleNext, playbackSpeed);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, handleNext, playbackSpeed]);

    // === Logic: Resizing Sidebar ===
    const startResizing = useCallback(() => {
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        // Also stop panning
        isPanning.current = false;
        document.body.style.cursor = '';
    }, []);

    const handleResize = useCallback((e: MouseEvent) => {
        if (isResizing.current) {
            const newWidth = (e.clientX / window.innerWidth) * 100;
            if (newWidth > 20 && newWidth < 70) {
                setEditorWidth(newWidth);
            }
        }
    }, []);

    // === Logic: Pan & Zoom ===
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            setZoom(z => Math.min(Math.max(0.5, z + delta), 3));
        } else {
            // Pan
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    }, []);

    // Draggable Logic - Match Arrays.tsx
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only allow left click (0) or middle click (1), prevent if interactive
        if ((e.button === 0 || e.button === 1) && (e.target as HTMLElement).closest('.interactive') === null) {
            setIsDragging(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Global listeners for Sidebar Resizing ONLY
    useEffect(() => {
        const handleWindowMove = (e: MouseEvent) => {
            handleResize(e);
        };
        window.addEventListener('mousemove', handleWindowMove);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', handleWindowMove);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [handleResize, stopResizing]);


    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0f0e17] overflow-hidden font-sans">
            {/* Header - Sticky added to prevent scrolling */}
            <div className="sticky top-0 h-16 border-b border-gray-200 dark:border-[#2d2b42] bg-white dark:bg-[#131221] px-6 flex items-center justify-between z-50 shadow-sm shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 shadow-lg">
                            <span className="material-symbols-outlined text-lg">code_blocks</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Precision Code Visualizer</span>
                    </div>

                    <div className="h-6 w-px bg-gray-200 dark:bg-[#2d2b42]"></div>

                    {/* Language Dropdown */}
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-hover:text-indigo-500 transition-colors">language</span>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            disabled={executionHistory.length > 0}
                            className="pl-8 pr-8 py-1.5 bg-gray-100 dark:bg-[#2d2b42] border-none rounded-md text-sm font-semibold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-gray-200 transition-colors appearance-none outline-none disabled:opacity-50"
                        >
                            <option value="c">C Language</option>
                            <option value="cpp">C++</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">expand_more</span>
                    </div>

                    {/* Playback Controls (In Header) */}
                    {executionHistory.length > 0 && (
                        <div className="flex items-center gap-4 ml-4 bg-gray-50 dark:bg-[#1e1d32] px-3 py-1 rounded-lg border border-gray-100 dark:border-[#2d2b42]">
                            <div className="flex items-center gap-1">
                                <button onClick={handleReset} className="p-1 hover:bg-gray-200 dark:hover:bg-[#2d2b42] rounded text-gray-500 hover:text-red-500 transition-colors" title="Reset">
                                    <span className="material-symbols-outlined text-lg">restart_alt</span>
                                </button>
                                <button onClick={handlePrev} disabled={currentStepIndex <= 0} className="p-1 hover:bg-gray-200 dark:hover:bg-[#2d2b42] rounded text-gray-700 dark:text-gray-300 disabled:opacity-30 transition-colors">
                                    <span className="material-symbols-outlined text-lg">skip_previous</span>
                                </button>
                                <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className="p-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                                    <span className="material-symbols-outlined text-lg">{isAutoPlaying ? 'pause' : 'play_arrow'}</span>
                                </button>
                                <button onClick={handleNext} disabled={currentStepIndex >= executionHistory.length - 1} className="p-1 hover:bg-gray-200 dark:hover:bg-[#2d2b42] rounded text-gray-700 dark:text-gray-300 disabled:opacity-30 transition-colors">
                                    <span className="material-symbols-outlined text-lg">skip_next</span>
                                </button>
                            </div>

                            {/* Progres Bar & Step Count */}
                            <div className="flex flex-col w-32 gap-1">
                                <div className="h-1.5 w-full bg-gray-200 dark:bg-[#2d2b42] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                        style={{ width: `${executionHistory.length > 1 ? (currentStepIndex / (executionHistory.length - 1)) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-mono font-bold text-gray-400 uppercase leading-none">
                                    <span>Step</span>
                                    <span>{currentStepIndex + 1}/{executionHistory.length}</span>
                                </div>
                            </div>

                            {/* Speed */}
                            <div className="flex flex-col items-end border-l border-gray-200 dark:border-[#2d2b42] pl-3">
                                <span className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">Speed</span>
                                <select
                                    value={playbackSpeed}
                                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                    className="bg-transparent text-xs font-bold text-gray-800 dark:text-white focus:outline-none cursor-pointer p-0 border-none hover:text-indigo-600"
                                >
                                    <option value={2000}>0.5x</option>
                                    <option value={1000}>1.0x</option>
                                    <option value={500}>2.0x</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Zoom / View Controls */}
                    <div className="flex items-center bg-gray-100 dark:bg-[#2d2b42] rounded-md p-1 border border-gray-200 dark:border-[#383564]">
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:text-indigo-600 rounded hover:bg-white dark:hover:bg-[#383564] transition-colors"><span className="material-symbols-outlined text-sm">remove</span></button>
                        <span className="text-xs font-mono font-bold w-12 text-center text-gray-600 dark:text-gray-300">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 hover:text-indigo-600 rounded hover:bg-white dark:hover:bg-[#383564] transition-colors"><span className="material-symbols-outlined text-sm">add</span></button>
                    </div>

                    <button
                        onClick={handleRun}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all transform active:scale-95 ml-2"
                    >
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                        Run Code
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* 1. Editor Sidebar (Resizable) */}
                <div
                    style={{ width: `${editorWidth}%` }}
                    className="flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-[#2d2b42] bg-white dark:bg-[#131221] relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
                >
                    {/* Tab Bar */}
                    <div className="flex items-center px-4 h-10 border-b border-gray-100 dark:border-[#2d2b42] bg-gray-50/50 dark:bg-[#131221]">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#383564] border-b-0 rounded-t-lg text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm top-0.5 relative">
                            <span className="material-symbols-outlined text-sm">code</span>
                            main.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'c'}
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 relative overflow-hidden bg-gray-50/10 dark:bg-[#0f0e17]/50 font-mono text-sm leading-6 group">
                        <div className="absolute inset-0 flex">
                            {/* Gutter */}
                            <div className="w-12 pt-4 flex flex-col items-center text-gray-300 dark:text-gray-600 select-none bg-white dark:bg-[#131221] border-r border-gray-100 dark:border-[#2d2b42]">
                                {code.split('\n').map((_, i) => (
                                    <div key={i} className="h-6 leading-6 text-xs font-medium text-gray-300 dark:text-slate-600">{i + 1}</div>
                                ))}
                            </div>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="flex-1 p-4 bg-transparent resize-none focus:outline-none font-mono text-gray-800 dark:text-gray-200 leading-6 border-none selection:bg-indigo-100 dark:selection:bg-indigo-900/30"
                                spellCheck={false}
                            />
                        </div>
                        {/* Highlights */}
                        {currentMemoryState.currentLineIndex >= 0 && (
                            <div
                                className="absolute left-12 right-0 h-6 bg-indigo-500/10 border-l-2 border-indigo-500 pointer-events-none transition-all duration-100 mix-blend-multiply dark:mix-blend-screen"
                                style={{ top: `${16 + (currentMemoryState.currentLineIndex * 24)}px` }}
                            ></div>
                        )}
                    </div>
                </div>

                {/* Resizer Handle */}
                <div
                    onMouseDown={startResizing}
                    className="w-1 bg-gray-100 dark:bg-[#2d2b42] hover:bg-indigo-500 cursor-col-resize z-30 transition-all flex items-center justify-center group border-l border-white dark:border-[#524f70]"
                >
                    <div className="h-8 w-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-white transition-colors transform scale-0 group-hover:scale-100 duration-200"></div>
                </div>

                {/* 2. Visual Canvas Area (Zoomable/Pannable) */}
                <div
                    className={`flex-1 bg-[#F5F5FA] dark:bg-[#0c0c14] relative overflow-hidden selection:bg-transparent ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Dotted Grid Background */}
                    <div
                        className="absolute inset-0 opacity-40 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#a0a0a0 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                            // We can animate this based on pan to make it feel real infinite? 
                            // For now keep static as per "blueprint" feel
                        }}
                    ></div>

                    {/* Transform Container (The "Camera") */}
                    <div
                        ref={canvasRef}
                        className="w-full h-full flex items-center justify-center transform-gpu will-change-transform origin-center"
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                    >
                        {/* Render Logic */}
                        {currentMemoryState.stack.length > 0 ? (
                            <div className="flex flex-col gap-12 items-center interactive">
                                {/* Grid Layout for Visualization Components */}
                                <div className="flex flex-wrap items-start justify-center gap-12 p-12 w-full h-full content-start">
                                    {currentMemoryState.stack[0].variables.map((variable) => {

                                        // 1. Linked List Visualization (Heuristic: Type contains 'Node' or 'List' and is a pointer)
                                        if (variable.isPointer && (variable.type.includes('Node') || variable.type.includes('List')) && variable.targetAddress) {
                                            return (
                                                <div key={variable.id} className="interactive">
                                                    <LinkedListStructure
                                                        headAddress={variable.targetAddress}
                                                        heap={currentMemoryState.heap}
                                                        name={variable.name}
                                                    />
                                                </div>
                                            );
                                        }

                                        // 2. Tree Visualization (Heuristic: Type contains 'Tree' or 'Binary' and is a pointer)
                                        if (variable.isPointer && (variable.type.includes('Tree') || variable.type.includes('Binary')) && variable.targetAddress) {
                                            return (
                                                <div key={variable.id} className="interactive">
                                                    <TreeStructure
                                                        rootAddress={variable.targetAddress}
                                                        heap={currentMemoryState.heap}
                                                        name={variable.name}
                                                    />
                                                </div>
                                            );
                                        }

                                        // 3. Array Visualization
                                        if (variable.isArray) {
                                            const activePointers = currentMemoryState.stack[0].variables
                                                .filter(v => v.isPointer && v.targetAddress)
                                                .map(p => {
                                                    const targetAddr = parseInt(p.targetAddress!, 16);
                                                    const startAddr = parseInt(variable.address, 16);
                                                    const arrSize = (variable.arrayValues?.length || 0) * 4;

                                                    if (targetAddr >= startAddr && targetAddr < startAddr + arrSize) {
                                                        const index = (targetAddr - startAddr) / 4;
                                                        return { label: p.name, index };
                                                    }
                                                    return null;
                                                })
                                                .filter((p): p is { label: string; index: number } => p !== null);

                                            return (
                                                <div key={variable.id} className="interactive">
                                                    <ArrayStructure
                                                        data={variable.arrayValues || []}
                                                        name={variable.name}
                                                        pointers={activePointers}
                                                    />
                                                </div>
                                            );
                                        }

                                        // 4. Simple Variable / Pointer Visualization
                                        return (
                                            <div key={variable.id} className="interactive">
                                                <MemoryBlock variable={variable} />
                                            </div>
                                        );
                                    })}

                                    {/* Placeholder if empty */}
                                    {currentMemoryState.stack[0]?.variables.length === 0 && (
                                        <div className="text-gray-400 font-mono text-sm bg-white/50 p-6 rounded-xl border border-dashed text-center">
                                            No variables in current scope
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center opacity-40 select-none pointer-events-none">
                                <span className="material-symbols-outlined text-6xl text-gray-300">timeline</span>
                                <p className="text-gray-400 font-mono mt-2">Run code to visualize</p>
                            </div>
                        )}
                    </div>

                    {/* Floating Movable Panels (Overlay on top of canvas) */}

                    {/* 1. Scope Panel */}
                    {/* 1. Scope Panel (Fixed Bottom Right) */}
                    {currentMemoryState.stack.length > 0 && (
                        <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-1 items-end pointer-events-auto">
                            <div className="flex items-center gap-1.5 px-2 mb-1">
                                <span className="material-symbols-outlined text-gray-400 text-xs">memory</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Memory Inspector</span>
                            </div>
                            <ScopePanel
                                variables={currentMemoryState.stack[0].variables}
                                heap={currentMemoryState.heap}
                            />
                        </div>
                    )}

                    {/* 2. Playback Controls REMOVED from here, moved to header */}
                </div>
            </div>

            {/* Output Panel Overlay */}
            {isOutputOpen && (
                <DraggablePanel defaultPosition={{ x: 40, y: -240 }} className="bottom-0 left-0" title="Console Output">
                    <div className="w-[300px] h-[150px] bg-black text-white p-3 font-mono text-[10px] overflow-auto rounded-b-xl interactive">
                        <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2 sticky top-0 bg-black">
                            <span>Console</span>
                            <button onClick={() => setIsOutputOpen(false)}><span className="material-symbols-outlined text-sm">close</span></button>
                        </div>
                        {currentMemoryState.output.map((line, i) => (
                            <div key={i} className="py-0.5 opacity-90">{line}</div>
                        ))}
                        {currentMemoryState.output.length === 0 && <span className="text-gray-600 italic">No output</span>}
                    </div>
                </DraggablePanel>
            )}

            {/* Show toggle if closed */}
            {!isOutputOpen && (
                <button
                    onClick={() => setIsOutputOpen(true)}
                    className="absolute bottom-4 left-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110"
                    title="Open Console"
                >
                    <span className="material-symbols-outlined">terminal</span>
                </button>
            )}
        </div>
    );
};

export default CodeVisualizer;
