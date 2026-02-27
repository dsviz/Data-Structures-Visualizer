import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useQueueVisualizer } from '../hooks/useQueueVisualizer';
import { QueueControls } from '../components/queue/QueueControls';
import { QueueTabs } from '../components/queue/QueueTabs';
import { QueueTools, QueueTool } from '../components/queue/QueueTools';
import { useLayout } from '../context/LayoutContext';

const Queue = () => {
    const {
        // State
        frames,
        currentStep,
        isPlaying,
        playbackSpeed,
        activeOp,
        error,
        enqueueValue,
        mode,
        binaryNumInput,
        hotPotatoPlayers,
        hotPotatoPasses,
        currentFrame,

        // Setters
        setIsPlaying,
        setCurrentStep,
        setPlaybackSpeed,
        setActiveOp,
        setEnqueueValue,
        setMode,
        setBinaryNumInput,
        setHotPotatoPlayers,
        setHotPotatoPasses,

        // Handlers
        handleEnqueue,
        handleDequeue,
        handlePeek,
        handleExample,
        handleCanvasEnqueue,
        handleCanvasDequeue,
        handleCanvasClear,
        handleCanvasUpdate,
        handleBinaryNumbers,
        handleHotPotato
    } = useQueueVisualizer();

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
        }
    }, [isPlaying]);

    const { setIsSidebarOpen } = useLayout();

    // Ensure Left Sidebar is Closed
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [setIsSidebarOpen]);

    // Canvas State
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Tool State
    const [activeTool, setActiveTool] = useState<QueueTool>(null);
    const [editPopup, setEditPopup] = useState<{ index: number, value: string, x: number, y: number } | null>(null);

    // Canvas Handlers
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

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) return;
        // e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        setZoom(prev => Math.min(Math.max(0.5, prev + scaleAmount), 3));
    };

    const handleNodeClick = (index: number, value: string, e: React.MouseEvent) => {
        if (activeTool === 'edit') {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setEditPopup({
                index,
                value: String(value),
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            });
        }
    };



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
        <>
            <Helmet>
                <title>Interactive Queue Visualizer | Data Structures & Algorithms</title>
                <meta name="description" content="Master Queue data structures with our interactive visualization tool. See step-by-step animations for array-based queue operations." />
            </Helmet>
            <VisualizationLayout
                title="Queue"
                contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden p-0"
                controls={playbackControls}
            >
                <div className="flex w-full h-full relative overflow-hidden bg-gray-50 dark:bg-background-dark">
                    {/* === CENTRAL CANVAS === */}
                    <div className="absolute inset-0 z-0 flex flex-col overflow-hidden">
                        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#4236e7 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                        <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden z-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
                                            <div
                                                key={i}
                                                className={`relative w-16 h-16 flex-shrink-0 animate-in fade-in zoom-in duration-300 ${activeTool === 'edit' ? 'cursor-pointer hover:-translate-y-1 transition-transform' : ''}`}
                                                onClick={(e) => handleNodeClick(i, String(val), e)}
                                            >
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

                            {/* Edit Popup */}
                            {editPopup && (
                                <div
                                    className="fixed z-50 bg-white dark:bg-[#1e1c33] p-2 rounded-lg shadow-xl border border-gray-200 dark:border-[#383564] flex gap-2 animate-in zoom-in-95 duration-200"
                                    style={{
                                        left: editPopup.x,
                                        top: editPopup.y,
                                        transform: 'translate(-50%, -100%)'
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={editPopup.value}
                                        onChange={(e) => setEditPopup({ ...editPopup, value: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleCanvasUpdate(editPopup.index, editPopup.value);
                                                setEditPopup(null);
                                                setActiveTool(null);
                                            } else if (e.key === 'Escape') {
                                                setEditPopup(null);
                                            }
                                        }}
                                        autoFocus
                                        className="w-20 px-2 py-1 bg-gray-50 dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        onClick={() => {
                                            handleCanvasUpdate(editPopup.index, editPopup.value);
                                            setEditPopup(null);
                                            setActiveTool(null);
                                        }}
                                        className="px-2 py-1 bg-primary text-white rounded text-xs font-bold hover:bg-indigo-500"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditPopup(null)}
                                        className="px-2 py-1 bg-gray-200 dark:bg-[#272546] text-gray-600 dark:text-gray-300 rounded text-xs font-bold hover:bg-gray-300 dark:hover:bg-[#383564]"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* === CORNER DOCKS === */}

                    {/* Top-Left: All Operations */}
                    <div className="absolute top-0 left-0 flex items-start h-[75%] z-20 pointer-events-none drop-shadow-2xl">
                        <div className={`transition-[width] duration-300 ease-in-out h-full bg-white dark:bg-[#1c1a32] border-r border-[#272546] pointer-events-auto overflow-hidden ${isOpsExpanded ? 'w-[350px]' : 'w-0'}`}>
                            <div className="min-w-[350px] h-full flex flex-col">
                                <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 dark:border-[#272546] shrink-0 bg-gray-50/50 dark:bg-[#121121]">ALL OPERATIONS</div>
                                <div className="p-4 overflow-y-auto custom-scrollbar h-full">
                                    <QueueControls
                                        activeOp={activeOp} setActiveOp={setActiveOp}
                                        mode={mode} setMode={setMode}
                                        enqueueValue={enqueueValue} setEnqueueValue={setEnqueueValue}
                                        binaryNumInput={binaryNumInput} setBinaryNumInput={setBinaryNumInput}
                                        hotPotatoPlayers={hotPotatoPlayers} setHotPotatoPlayers={setHotPotatoPlayers}
                                        hotPotatoPasses={hotPotatoPasses} setHotPotatoPasses={setHotPotatoPasses}
                                        handleEnqueue={handleEnqueue} handleDequeue={handleDequeue} handlePeek={handlePeek}
                                        handleBinaryNumbers={handleBinaryNumbers} handleHotPotato={handleHotPotato}
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
                                <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar h-full">
                                    <QueueTools
                                        activeTool={activeTool}
                                        setActiveTool={setActiveTool}
                                        onEnqueue={handleCanvasEnqueue}
                                        onDequeue={handleCanvasDequeue}
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
                                    <QueueTabs activeTab={activeTab} activeOp={activeOp} currentFrame={currentFrame} />
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

                </div>
            </VisualizationLayout>
        </>
    );
};

export default Queue;
