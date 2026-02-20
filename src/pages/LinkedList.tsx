
import { useState, useEffect, useRef } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useLinkedListVisualizer } from '../hooks/useLinkedListVisualizer';
import { LinkedListControls } from '../components/linkedlist/LinkedListControls';
import { LinkedListTabs } from '../components/linkedlist/LinkedListTabs';
import { Language } from '../data/LinkedListCode';
import { useLayout } from '../context/LayoutContext';

export default function LinkedList() {
    const {
        // State
        mode,
        frames,
        currentStep,
        isPlaying,
        playbackSpeed,
        activeOp,
        error,
        createInput,
        createStep,
        createSize,
        inputValue,
        inputIndex,
        listType,
        currentFrame,

        // Setters
        setMode,
        setIsPlaying,
        setCurrentStep,
        setPlaybackSpeed,
        setActiveOp,
        setCreateInput,
        setCreateStep,
        setCreateSize,
        setInputValue,
        setInputIndex,
        setListType,

        // Handlers
        handleCreate,
        handleCreateRandom,
        handleInsert,
        handleRemove,
        handleSearch
    } = useLinkedListVisualizer();

    const [splitRatio, setSplitRatio] = useState(0.6); // 60% controls, 40% tabs
    const sidebarRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [codeLanguage, setCodeLanguage] = useState<Language>('python');
    const { setIsSidebarOpen } = useLayout();

    // Ensure Left Sidebar is Closed
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [setIsSidebarOpen]);

    // Resizing Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startRatio = splitRatio;

        const handleMouseMove = (ev: MouseEvent) => {
            if (!sidebarRef.current) return;
            const h = sidebarRef.current.offsetHeight;
            const delta = ev.clientY - startY;
            const newRatio = Math.min(0.8, Math.max(0.2, startRatio + delta / h));
            setSplitRatio(newRatio);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Auto-Zoom Logic
    useEffect(() => {
        if (!containerRef.current || currentFrame.nodes.length === 0) return;
        const totalWidth = currentFrame.nodes.length * 150 + 200; // rough estimate
        const available = containerRef.current.clientWidth - 40;

        let newScale = 0.8;
        if (totalWidth > available) {
            newScale = Math.min(0.8, available / totalWidth);
        }
        // Only update if significantly different to avoid jitter during generic resizing, 
        // but for initial load or big changes it's good.
        setScale(newScale);
    }, [currentFrame.nodes.length]);


    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey || true) {
            const delta = -e.deltaY;
            setScale(prev => Math.min(Math.max(0.2, prev + (delta * 0.001)), 3));
        }
    };

    // --- Render ---

    const sidebarContent = (
        <div className="h-full flex flex-col relative" ref={sidebarRef}>
            {/* Controls Section */}
            <div style={{ height: `${splitRatio * 100}%` }} className="min-h-0 overflow-y-auto border-b border-gray-200 dark:border-[#272546] p-4">
                <LinkedListControls
                    activeOp={activeOp} setActiveOp={setActiveOp}
                    mode={mode} setMode={setMode}
                    listType={listType} setListType={setListType}
                    createInput={createInput} setCreateInput={setCreateInput}
                    createStep={createStep} setCreateStep={setCreateStep}
                    createSize={createSize} setCreateSize={setCreateSize}
                    inputValue={inputValue} setInputValue={setInputValue}
                    inputIndex={inputIndex} setInputIndex={setInputIndex}
                    error={error}
                    handleCreate={handleCreate} handleCreateRandom={handleCreateRandom}
                    handleInsert={handleInsert} handleRemove={handleRemove}
                    handleSearch={handleSearch}
                />
            </div>

            {/* Resizer Handle */}
            <div
                className="h-1 bg-gray-100 dark:bg-[#272546] hover:bg-primary cursor-row-resize transition-colors absolute w-full z-10"
                style={{ top: `${splitRatio * 100}%` }}
                onMouseDown={handleMouseDown}
            ></div>

            {/* Tabs Section */}
            <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-[#1e1c33]">
                <LinkedListTabs
                    currentFrame={currentFrame}

                    codeLanguage={codeLanguage}
                    setCodeLanguage={setCodeLanguage}
                />
            </div>
        </div>
    );

    const playbackControls = (
        <div className="w-full bg-white dark:bg-[#131221] border-t border-gray-200 dark:border-[#272546] px-8 py-4 flex items-center justify-between gap-8 h-20 shadow-md relative z-20">
            <div className="flex items-center gap-4">
                <button onClick={() => setCurrentStep(0)} className="text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-[24px]">skip_previous</span></button>
                <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} className="text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-[28px]">fast_rewind</span></button>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="rounded-full flex items-center justify-center text-white bg-primary size-12 shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined filled text-[28px]">{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>
                <button onClick={() => setCurrentStep(s => Math.min(frames.length - 1, s + 1))} className="text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-[28px]">fast_forward</span></button>
                <button onClick={() => setCurrentStep(frames.length - 1)} className="text-gray-400 hover:text-white transition-colors"><span className="material-symbols-outlined text-[24px]">skip_next</span></button>
            </div>

            <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between text-xs font-medium font-mono text-gray-500 dark:text-gray-400">
                    <span>Step {currentStep + 1}/{frames.length || 1}</span>
                    <span className="text-primary">{Math.round(((currentStep + 1) / (frames.length || 1)) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-[#272546] rounded-full overflow-hidden relative cursor-pointer"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = (e.clientX - rect.left) / rect.width;
                        setCurrentStep(Math.floor(pct * (frames.length - 1)));
                    }}
                >
                    <div className="h-full bg-primary relative rounded-full" style={{ width: `${((currentStep + 1) / (frames.length || 1)) * 100}%` }}></div>
                </div>
            </div>

            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-[#272546] w-40 pl-6">
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
    );

    return (
        <VisualizationLayout
            title="Linked List"
            sidebarPosition="right"
            contentClassName="flex-1 flex flex-col relative z-0 overflow-hidden"
            sidebarNoPadding={true}
            sidebarNoScroll={true}
            sidebar={sidebarContent}
            rightSidebar={null}
            leftSidebar={null}
            controls={playbackControls}
        >
            {/* Canvas */}
            <div ref={containerRef} className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-gray-50/50 dark:bg-black/20 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={(e) => { setIsDragging(true); setLastMousePos({ x: e.clientX, y: e.clientY }); }}
                onMouseMove={(e) => {
                    if (isDragging) { setPan(p => ({ x: p.x + e.clientX - lastMousePos.x, y: p.y + e.clientY - lastMousePos.y })); setLastMousePos({ x: e.clientX, y: e.clientY }); }
                }}
                onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}
                onWheel={handleWheel}
            >
                <div className="flex items-center transition-transform duration-100 ease-out origin-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
                    {currentFrame.nodes.length === 0 && (!currentFrame.tempNodes || currentFrame.tempNodes.length === 0) ? <div className="opacity-30 text-2xl font-bold uppercase text-gray-400">Empty List</div> : (
                        currentFrame.nodes.map((val, i) => {
                            const isHighlight = currentFrame.highlights.includes(i);
                            let nodePointers = currentFrame.pointers.filter(p => p.index === i);

                            // Persistent Head/Tail logic
                            if (i === 0 && !nodePointers.some(p => p.label === 'HEAD')) {
                                nodePointers.push({ index: i, label: 'HEAD', color: 'red' });
                            }
                            if (i === currentFrame.nodes.length - 1 && !nodePointers.some(p => p.label === 'TAIL')) {
                                nodePointers.push({ index: i, label: 'TAIL', color: 'green' });
                            }

                            return (
                                <div key={i} className="flex items-center group relative">
                                    <div className="relative z-10">
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-1">
                                            {nodePointers.map((p, idx) => (
                                                <div key={idx} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm whitespace-nowrap ${p.color === 'red' ? 'bg-rose-500 text-white' : p.color === 'green' ? 'bg-emerald-500 text-white' : p.color === 'blue' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-[#383564] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300'}`}>{p.label}</div>
                                            ))}
                                        </div>
                                        <div className={`w-28 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold font-mono shadow-sm transition-all ${isHighlight ? 'border-primary bg-primary/10 text-primary scale-110 shadow-[0_0_15px_rgba(66,54,231,0.3)]' : 'border-indigo-200 dark:border-[#383564] bg-blue-50/50 dark:bg-[#1e1e24] text-slate-800 dark:text-white'}`}>
                                            {val}
                                            <div className="absolute top-0 left-1 text-[9px] text-gray-400 p-1 opacity-50 border-r border-b border-gray-100 dark:border-[#2e2b4d] rounded-br">idx: {i}</div>
                                            {listType === 'doubly' && <div className="absolute left-0 h-full w-4 border-r border-gray-200 dark:border-[#383564]"></div>}
                                            <div className="absolute right-0 h-full w-8 border-l border-gray-200 dark:border-[#383564] bg-gray-50 dark:bg-[#151426] flex items-center justify-center"><div className="size-2 rounded-full bg-gray-400"></div></div>
                                        </div>
                                    </div>
                                    {i < currentFrame.nodes.length - 1 && (
                                        <div className="w-16 h-8 relative flex items-center justify-center text-gray-400">
                                            <svg className="w-full h-full overflow-visible" viewBox="0 0 64 32">
                                                <path d="M0 16 H62" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                                {listType === 'doubly' && <path d="M64 24 H2" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" opacity="0.5" />}
                                            </svg>
                                        </div>
                                    )}
                                    {i === currentFrame.nodes.length - 1 && listType === 'circular' && (
                                        <div className="absolute top-full left-1/2 w-full h-16 border-b-2 border-l-2 border-r-2 border-dashed border-gray-400/50 rounded-b-3xl pointer-events-none" style={{ left: `calc(-${i * 100}% - ${i * 64}px + 56px)`, width: `calc(${i * 100}% + ${i * 64}px)` }}>
                                            <div className="absolute bottom-2 right-1/2 translate-x-1/2 bg-white dark:bg-[#121121] px-2 text-[10px] text-gray-400 font-mono">Next pts to Head</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                    {/* Temp Nodes */}
                    {currentFrame.tempNodes?.map((node, i) => {
                        let left = 0;
                        let top = 0;
                        const NODE_WIDTH = 112;
                        const GAP = 64;
                        const TOTAL_WIDTH = NODE_WIDTH + GAP;

                        if (node.position === 'left-of-head') left = -TOTAL_WIDTH;
                        else if (node.position === 'right-of-tail') left = currentFrame.nodes.length * TOTAL_WIDTH;
                        else if (node.position === 'above-at-index') {
                            left = (node.offsetIndex || 0) * TOTAL_WIDTH;
                            top = -100;
                        }

                        return (
                            <div key={`temp-${i}`} className="absolute top-0 flex items-center z-20 transition-all duration-500 ease-out" style={{ left: `${left}px`, transform: `translateY(${top}px)` }}>
                                <div className="relative">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2"><div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm whitespace-nowrap bg-blue-500 text-white">{node.label}</div></div>
                                    <div className="w-28 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold font-mono shadow-xl border-blue-500 bg-blue-500/10 text-blue-500">
                                        {node.val}
                                        <div className="absolute right-0 h-full w-8 border-l border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-center"><div className="size-2 rounded-full bg-blue-400"></div></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {listType !== 'circular' && currentFrame.nodes.length > 0 && (
                        <div className="ml-2 flex items-center gap-1 opacity-50">
                            <div className="w-8 h-[2px] bg-gray-400"></div>
                            <div className="px-2 py-1 text-xs font-bold text-gray-400 border border-dashed border-gray-300 dark:border-white/10 rounded bg-gray-50 dark:bg-white/5">NULL</div>
                        </div>
                    )}

                    {/* Arrows Overlay */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0" style={{ minWidth: '100%', minHeight: '100%' }}>
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="currentColor" /></marker>
                            <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" /></marker>
                            <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" /></marker>
                            <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#10b981" /></marker>
                        </defs>
                        {currentFrame.tempArrows?.map((arrow, i) => {
                            const NODE_WIDTH = 112;
                            const GAP = 64;
                            const TOTAL_WIDTH = NODE_WIDTH + GAP;

                            const getX = (target: 'temp' | number | 'null') => {
                                if (typeof target === 'number') return target * TOTAL_WIDTH + NODE_WIDTH / 2;
                                if (target === 'null') return currentFrame.nodes.length * TOTAL_WIDTH + 20;
                                if (target === 'temp') {
                                    const temp = currentFrame.tempNodes?.[0];
                                    if (!temp) return 0;
                                    if (temp.position === 'left-of-head') return -TOTAL_WIDTH + NODE_WIDTH / 2;
                                    if (temp.position === 'right-of-tail') return currentFrame.nodes.length * TOTAL_WIDTH + NODE_WIDTH / 2;
                                    if (temp.position === 'above-at-index') return (temp.offsetIndex || 0) * TOTAL_WIDTH + NODE_WIDTH / 2;
                                }
                                return 0;
                            };

                            const getY = (target: 'temp' | number | 'null') => {
                                if (target === 'temp') {
                                    const temp = currentFrame.tempNodes?.[0];
                                    if (temp?.position === 'above-at-index') return -100 + 24;
                                    return 24;
                                }
                                return 24;
                            };

                            const sx = getX(arrow.from);
                            const sy = getY(arrow.from);
                            const ex = getX(arrow.to);
                            const ey = getY(arrow.to);

                            if (arrow.curved) {
                                const mx = (sx + ex) / 2;
                                const my = sy - 60;
                                return <path key={i} d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`} stroke={arrow.color || 'red'} strokeWidth="2" fill="none" markerEnd={`url(#arrowhead-${arrow.color === 'green' ? 'green' : 'red'})`} />;
                            }
                            return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke={arrow.color || 'blue'} strokeWidth="2" markerEnd={`url(#arrowhead-${arrow.color === 'green' ? 'green' : 'blue'})`} />;
                        })}
                    </svg>
                </div>
            </div>
        </VisualizationLayout>
    );
}
