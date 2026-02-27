import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { ArraysControls } from '../components/arrays/ArraysControls';
import { ArraysTabs } from '../components/arrays/ArraysTabs';
import { ArrayTools, ArrayTool } from '../components/arrays/ArrayTools';
import { useArraysVisualizer } from '../hooks/useArraysVisualizer';

const Arrays = () => {
    // --- Hook State ---
    const {
        // State
        mode,
        frames,
        currentStep,
        isPlaying,
        playbackSpeed,
        activeOp,
        searchType,
        error,
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
        setSearchInput,
        setInsertIndex,
        setInsertValue,
        setRemoveIndex,
        setUpdateIndex,
        setUpdateValue,
        setTwoSumTarget,

        // Handlers
        handleSearch,
        handleInsert,
        handleRemove,
        handleUpdate,
        handleReverse,
        handleTwoSum,
        handleCycleDetection,
        handleExample,
        handleCanvasAdd,
        handleCanvasDelete,
        handleCanvasUpdate,
        handleCanvasClear
    } = useArraysVisualizer();

    const [activeTool, setActiveTool] = useState<ArrayTool>(null);
    const [editPopup, setEditPopup] = useState<{ index: number, val: number, x: number, y: number } | null>(null);

    // --- Layout State ---
    const [activeTab, setActiveTab] = useState<'code' | 'pseudo' | 'info'>('pseudo');

    // --- Floating Card State ---
    const [isCodeExpanded, setIsCodeExpanded] = useState(false);
    const [isOpsExpanded, setIsOpsExpanded] = useState(false);
    const [isToolboxExpanded, setIsToolboxExpanded] = useState(false);
    const [isCurrentOpExpanded, setIsCurrentOpExpanded] = useState(false);

    // Auto-collapse logic when algorithm starts playing
    useEffect(() => {
        if (isPlaying) {
            setIsOpsExpanded(false);
            setIsToolboxExpanded(false);
            setIsCurrentOpExpanded(true);
        } else {
            // Optional: auto-expand when paused or reset. 
            // Commenting out so it doesn't annoy the user if they manually closed it.
        }
    }, [isPlaying]);


    // --- Canvas State ---
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.8);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // --- Canvas Handlers ---
    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setLastMousePos({ x: e.clientX, y: e.clientY }); };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan(prev => ({ x: prev.x + e.clientX - lastMousePos.x, y: prev.y + e.clientY - lastMousePos.y }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseUp = () => setIsDragging(false);
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || true) { // Always zoom for consistency
            e.preventDefault();
            const delta = -e.deltaY;
            setScale(prev => Math.min(Math.max(0.2, prev + (delta * 0.001)), 3));
        }
    };

    const handleElementClick = (index: number, val: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeTool === 'delete') {
            handleCanvasDelete(index);
        } else if (activeTool === 'edit') {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setEditPopup({
                index,
                val: val || 0,
                x: rect.left + rect.width / 2,
                y: rect.bottom + 10
            });
        }
    };

    const handleEditSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && editPopup) {
            const newVal = parseInt((e.target as HTMLInputElement).value);
            if (!isNaN(newVal)) {
                handleCanvasUpdate(editPopup.index, newVal);
            }
            setEditPopup(null);
        } else if (e.key === 'Escape') {
            setEditPopup(null);
        }
    };

    // Auto-Resize Canvas
    useEffect(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            // Est. width per item + padding
            const contentWidth = currentFrame.array.length * 70 + 100;
            if (contentWidth > containerWidth) setScale(Math.max(0.2, (containerWidth / contentWidth) * 0.6));
        }
    }, [currentFrame.array.length]);


    return (
        <>
            <Helmet>
                <title>Interactive Array Visualizer | Data Structures & Algorithms</title>
                <meta name="description" content="Learn array data structures with our interactive step-by-step visualizer. Watch insertions, deletions, linear search, binary search, and two-sum algorithms in real-time." />
            </Helmet>
            <VisualizationLayout
                title="Arrays"
                contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden p-0"
                controls={
                    <div className="w-full h-16 bg-white dark:bg-[#1e1c33] border-t border-gray-200 dark:border-[#272546] flex items-center px-6 gap-6 z-20 shrink-0">
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
                            <div className="flex justify-between text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                                <span className="text-primary/70">Step {currentStep + 1}/{frames.length || 1}</span>
                                <span className="text-primary">{Math.round(((currentStep + 1) / (frames.length || 1)) * 100)}%</span>
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
                <div className="flex w-full h-full relative overflow-hidden bg-gray-50 dark:bg-background-dark">

                    {/* === CENTRAL CANVAS === */}
                    <div className="absolute inset-0 z-0 flex flex-col overflow-hidden">
                        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#4236e7 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                        <div ref={containerRef} className={`absolute inset-0 flex flex-col items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${activeTool ? 'cursor-crosshair' : ''}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel} onClick={() => { if (activeTool) setEditPopup(null); }}>
                            <div ref={contentRef} className="flex flex-col items-start gap-2 transition-transform duration-75 ease-out origin-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale * 1.1})` }}>
                                <div className="flex gap-1 ml-1 select-none">{(currentFrame.array).map((_, i) => <div key={i} className="w-14 text-center text-xs font-mono text-gray-500">{i}</div>)}</div>
                                <div className="flex gap-1">
                                    {currentFrame.array.map((val, i) => {
                                        const highlight = currentFrame.highlights.indexOf(i) !== -1;
                                        const pointers = currentFrame.pointers.filter(p => p.index === i);
                                        return (
                                            <div key={i} onClick={(e) => handleElementClick(i, val === null ? 0 : val, e)} className={`w-14 h-14 rounded flex items-center justify-center text-lg font-mono font-medium shadow-sm relative group transition-all duration-300 ${highlight ? 'bg-primary text-white border-2 border-primary scale-110 z-10 shadow-[0_0_20px_rgba(66,54,231,0.4)]' : 'bg-white dark:bg-[#1c1a32] border border-gray-300 dark:border-[#383564] text-slate-900 dark:text-white'} ${val === null ? 'border-dashed opacity-50' : ''} ${activeTool ? 'hover:border-primary hover:shadow-md cursor-pointer' : ''}`}>
                                                {val === null ? 'null' : val}
                                                {pointers.map((p, pIdx) => (
                                                    <div key={p.label} className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ marginTop: `-${pIdx * 24}px` }}>
                                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border mb-1 ${p.color === 'primary' ? 'text-primary bg-[#121121] border-primary/30' : p.color === 'green' ? 'text-emerald-400 bg-[#121121] border-emerald-400/30' : 'text-red-400 bg-[#121121] border-red-400/30'}`}>{p.label}</span>
                                                        {pIdx === 0 && <span className={`material-symbols-outlined text-xl font-bold animate-bounce ${p.color === 'primary' ? 'text-primary' : p.color === 'green' ? 'text-emerald-400' : 'text-red-400'}`}>arrow_downward</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === CORNER DOCKS === */}

                    {/* Top-Left: All Operations */}
                    <div className="absolute top-0 left-0 flex items-start h-[75%] z-20 pointer-events-none drop-shadow-2xl">
                        <div className={`transition-[width] duration-300 ease-in-out h-full bg-white dark:bg-[#1c1a32] border-r border-[#272546] pointer-events-auto overflow-hidden ${isOpsExpanded ? 'w-[350px]' : 'w-0'}`}>
                            <div className="min-w-[350px] h-full flex flex-col">
                                <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 dark:border-[#272546] shrink-0 bg-gray-50/50 dark:bg-[#121121]">ALL OPERATIONS</div>
                                <div className="p-4 overflow-y-auto custom-scrollbar h-full">
                                    <ArraysControls
                                        activeOp={activeOp} setActiveOp={setActiveOp}
                                        mode={mode} setMode={setMode}
                                        searchType={searchType} setSearchType={setSearchType}
                                        searchInput={searchInput} setSearchInput={setSearchInput}
                                        handleSearch={handleSearch}
                                        insertIndex={insertIndex} setInsertIndex={setInsertIndex}
                                        insertValue={insertValue} setInsertValue={setInsertValue}
                                        handleInsert={handleInsert}
                                        removeIndex={removeIndex} setRemoveIndex={setRemoveIndex}
                                        handleRemove={handleRemove}
                                        updateIndex={updateIndex} setUpdateIndex={setUpdateIndex}
                                        updateValue={updateValue} setUpdateValue={setUpdateValue}
                                        handleUpdate={handleUpdate}
                                        twoSumTarget={twoSumTarget} setTwoSumTarget={setTwoSumTarget}
                                        handleReverse={handleReverse} handleTwoSum={handleTwoSum}
                                        handleCycleDetection={handleCycleDetection}
                                        handleExample={handleExample}
                                        error={error}
                                    />
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpsExpanded(!isOpsExpanded)} className="pointer-events-auto w-6 h-full bg-primary brightness-125 hover:brightness-110 text-white flex items-center justify-center rounded-tr border-y border-r border-l-0 border-black/20 dark:border-[#272546] shadow-md transition-all">
                            <span className="material-symbols-outlined text-[16px] font-bold">{isOpsExpanded ? 'chevron_left' : 'tune'}</span>
                        </button>
                    </div>

                    {/* Bottom-Left: Toolbox */}
                    <div className="absolute bottom-0 left-0 flex items-end h-[25%] z-20 pointer-events-none drop-shadow-2xl">
                        <div className={`transition-[width] duration-300 ease-in-out h-full bg-white dark:bg-[#1c1a32] border-r border-t border-[#272546] pointer-events-auto overflow-hidden ${isToolboxExpanded ? 'w-[350px]' : 'w-0'}`}>
                            <div className="min-w-[350px] h-full flex flex-col">
                                <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 dark:border-[#272546] shrink-0 bg-gray-50/50 dark:bg-[#121121]">TOOLBOX</div>
                                <div className="p-4 overflow-y-auto custom-scrollbar h-full">
                                    <ArrayTools
                                        activeTool={activeTool}
                                        setActiveTool={(t) => { setActiveTool(t); setEditPopup(null); }}
                                        onAdd={handleCanvasAdd}
                                        onClear={handleCanvasClear}
                                    />
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsToolboxExpanded(!isToolboxExpanded)} className="pointer-events-auto w-6 h-full bg-primary brightness-75 hover:brightness-50 text-white flex items-center justify-center rounded-br border-b border-r border-l-0 border-black/20 dark:border-[#272546] shadow-md transition-all">
                            <span className="material-symbols-outlined text-[16px] font-bold">{isToolboxExpanded ? 'chevron_left' : 'build'}</span>
                        </button>
                    </div>

                    {/* Top-Right: Code & Data */}
                    <div className="absolute top-0 right-0 flex items-start h-[75%] z-20 pointer-events-none drop-shadow-2xl">
                        <button onClick={() => setIsCodeExpanded(!isCodeExpanded)} className="pointer-events-auto w-6 h-full bg-primary brightness-125 hover:brightness-110 text-white flex items-center justify-center rounded-tl border-y border-l border-r-0 border-black/20 dark:border-[#272546] shadow-md transition-all">
                            <span className="material-symbols-outlined text-[16px] font-bold">{isCodeExpanded ? 'chevron_right' : 'code'}</span>
                        </button>
                        <div className={`transition-[width] duration-300 ease-in-out h-full bg-white dark:bg-[#1c1a32] border-l border-[#272546] pointer-events-auto overflow-hidden ${isCodeExpanded ? 'w-[450px]' : 'w-0'}`}>
                            <div className="min-w-[450px] h-full flex flex-col">
                                <div className="p-2 border-b border-gray-100 dark:border-[#272546] shrink-0 flex items-center justify-between bg-gray-50/50 dark:bg-[#121121]">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Code & Data</div>
                                    <div className="flex p-0.5 bg-gray-200/50 dark:bg-[#1c1a32] border border-gray-200 dark:border-[#383564] rounded-lg">
                                        {(['pseudo', 'code', 'info'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${activeTab === tab
                                                    ? 'bg-white dark:bg-[#2e2b52] text-primary shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto h-full p-2 custom-scrollbar">
                                    <ArraysTabs
                                        activeTab={activeTab}
                                        activeOp={activeOp}
                                        searchType={searchType}
                                        currentFrame={currentFrame}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom-Right: Current Operation */}
                    <div className="absolute bottom-0 right-0 flex items-end h-[25%] z-20 pointer-events-none drop-shadow-2xl">
                        <button onClick={() => setIsCurrentOpExpanded(!isCurrentOpExpanded)} className="pointer-events-auto w-6 h-full bg-primary brightness-75 hover:brightness-50 text-white flex items-center justify-center rounded-bl border-b border-l border-r-0 border-black/20 dark:border-[#272546] shadow-md transition-all">
                            <span className="material-symbols-outlined text-[16px] font-bold">{isCurrentOpExpanded ? 'chevron_right' : 'description'}</span>
                        </button>
                        <div className={`transition-[width] duration-300 ease-in-out h-full bg-white dark:bg-[#1c1a32] border-l border-t border-[#272546] pointer-events-auto overflow-hidden ${isCurrentOpExpanded ? 'w-[450px]' : 'w-0'}`}>
                            <div className="min-w-[450px] h-full flex flex-col">
                                <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 dark:border-[#272546] shrink-0 bg-gray-50/50 dark:bg-[#121121]">CURRENT OPERATION</div>
                                <div className="p-4 overflow-y-auto h-full custom-scrollbar">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed min-h-[3rem]">
                                        {currentFrame.description || "Ready to visualize..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Edit Popup */}
                    {editPopup && (
                        <div
                            className="absolute z-[100] bg-white dark:bg-[#1e1c33] p-2 rounded-lg shadow-xl border border-gray-200 dark:border-[#272546] animate-in zoom-in-95 duration-200"
                            style={{ left: editPopup.x, top: editPopup.y, transform: 'translateX(-50%)' }}
                        >
                            <input
                                type="number"
                                autoFocus
                                defaultValue={editPopup.val}
                                onKeyDown={handleEditSubmit}
                                onBlur={() => setEditPopup(null)}
                                className="w-20 bg-gray-50 dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded px-2 py-1 text-sm text-center font-bold outline-none focus:ring-2 focus:ring-primary"
                            />
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1e1c33] border-t border-l border-gray-200 dark:border-[#272546] rotate-45"></div>
                        </div>
                    )}

                </div>
            </VisualizationLayout>
        </>
    );
};

export default Arrays;
