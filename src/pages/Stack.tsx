import React, { useState, useRef, useEffect } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useStackVisualizer, MAX_CAPACITY } from '../hooks/useStackVisualizer';
import { StackControls } from '../components/stack/StackControls';
import { StackTabs } from '../components/stack/StackTabs';

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
        activeStackIndex,
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
        setActiveStackIndex,

        // Handlers
        handlePush,
        handlePop,
        handlePeek,
        handleCreateCustom,
        handleCreateRandom,
        handleReverseString,
        handleBalancedParentheses,
        handlePostfixEval,
        balancedInput,
        setBalancedInput,
        postfixInput,
        setPostfixInput,
        browserInput,
        setBrowserInput,
        handleBrowserVisit,
        handleBrowserBack,
        handleBrowserForward
    } = useStackVisualizer();

    const [activeTab, setActiveTab] = useState<'code' | 'pseudo' | 'info'>('pseudo');
    const [splitRatio, setSplitRatio] = useState(0.5); // Top height ratio
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Canvas State
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [createStep, setCreateStep] = useState<'size' | 'values'>('size');

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
        // e.preventDefault(); // React synthetic events might not support this in all cases, but mostly fine
        const scaleAmount = -e.deltaY * 0.001;
        setZoom(prev => Math.min(Math.max(0.5, prev + scaleAmount), 3));
    };

    const handleSidebarDrag = (e: React.MouseEvent) => {
        setIsResizingSidebar(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingSidebar || !sidebarRef.current) return;
            const sidebarRect = sidebarRef.current.getBoundingClientRect();
            const relativeY = e.clientY - sidebarRect.top;
            const newRatio = Math.max(0.2, Math.min(0.8, relativeY / sidebarRect.height));
            setSplitRatio(newRatio);
        };

        const handleMouseUp = () => {
            setIsResizingSidebar(false);
        };

        if (isResizingSidebar) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingSidebar]);

    return (
        <VisualizationLayout
            title="Stack"
            sidebarPosition="right"
            contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden"
            sidebarNoPadding={true}
            sidebarNoScroll={true}
            sidebar={
                <div className="h-full flex flex-col relative" ref={sidebarRef}>
                    {/* Top Half: Controls/Operations */}
                    <div style={{ height: `${splitRatio * 100}%` }} className="min-h-0 overflow-y-auto border-b border-gray-200 dark:border-[#272546] p-4">
                        <StackControls
                            mode={mode} setMode={setMode}
                            activeOp={activeOp} setActiveOp={setActiveOp}
                            activeStackIndex={activeStackIndex} setActiveStackIndex={setActiveStackIndex}
                            createStep={createStep} setCreateStep={setCreateStep}
                            createSize={createSize} setCreateSize={setCreateSize}
                            createInput={createInput} setCreateInput={setCreateInput}
                            handleCreateRandom={handleCreateRandom} handleCreateCustom={handleCreateCustom}
                            pushValue={pushValue} setPushValue={setPushValue}
                            handlePush={handlePush} handlePop={handlePop} handlePeek={handlePeek}
                            appInput={appInput} setAppInput={setAppInput} handleReverseString={handleReverseString}
                            balancedInput={balancedInput} setBalancedInput={setBalancedInput} handleBalancedParentheses={handleBalancedParentheses}
                            postfixInput={postfixInput} setPostfixInput={setPostfixInput} handlePostfixEval={handlePostfixEval}
                            browserInput={browserInput} setBrowserInput={setBrowserInput} handleBrowserVisit={handleBrowserVisit}
                            handleBrowserBack={handleBrowserBack} handleBrowserForward={handleBrowserForward}
                            error={error} currentFrame={currentFrame}
                        />
                    </div>

                    {/* Drag Handle */}
                    <div
                        className="h-1 bg-gray-200 dark:bg-[#383564] cursor-row-resize hover:bg-primary transition-colors shrink-0 z-50"
                        onMouseDown={handleSidebarDrag}
                    />

                    {/* Bottom Half: Tabs (Pseudo/Code/Info) */}
                    <div className="flex-1 min-h-0 flex flex-col bg-gray-50/50 dark:bg-[#1c1a32]/20 overflow-hidden">
                        {/* Tab Header */}
                        <div className="flex p-1 bg-gray-100 dark:bg-[#121121] border-b border-gray-200 dark:border-[#272546] shrink-0">
                            {(['pseudo', 'code', 'info'] as const).map(tab => (
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
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <StackTabs activeTab={activeTab} activeOp={activeOp} currentFrame={currentFrame} />
                        </div>
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
                    {/* Stack Elements - Rendered bottom-up via flex-col-reverse */}
                    <div className="flex gap-40">
                        {currentFrame?.stacks?.map((stack, stackIndex) => (
                            <div key={stackIndex} className="relative flex flex-col-reverse items-center justify-end gap-1">
                                {/* Base of Stack Visual */}
                                <div className="absolute -bottom-3 w-40 h-2 bg-gray-300 dark:bg-gray-700 rounded-full"></div>

                                {/* Stack Label if available */}
                                {currentFrame.stackLabels && currentFrame.stackLabels[stackIndex] && (
                                    <div className="absolute -bottom-8 text-xs font-bold text-gray-400 uppercase tracking-widest">{currentFrame.stackLabels[stackIndex]}</div>
                                )}

                                {stack?.map((val, i) => {
                                    const highlight = currentFrame.highlights?.includes(i) && stackIndex === 0;
                                    const pointers = currentFrame.pointers?.filter(p => p.index === i) || [];

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
                                            {pointers.map((p) => (
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

                                {/* Visual Capacity Ceiling for this stack */}
                                <div className="absolute bottom-[2px] w-56 border-t-2 border-dashed border-red-500/30 pointer-events-none flex justify-center" style={{ height: `${MAX_CAPACITY * 52}px` }}>
                                    {/* Only show label on first stack to avoid clutter */}
                                    {stackIndex === 0 && <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold absolute -top-3">Max Capacity</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Visual Capacity Ceiling: 12 (h-12) * 8 (capacity) = 96 (spacing) + gap-1 (0.25rem * 7)... approx calculation
                        Actually, simplified approach: position it based on known heights.
                        h-12 = 3rem = 48px. gap-1 = 0.25rem = 4px.
                        Height per item = 52px. Max capacity 8. Total height = 8 * 52 = 416px.
                        We can place it absolutely at bottom: 416px.
                    */}


                    {/* Empty State */}
                    {/* Empty State */}
                    {currentFrame?.stacks?.every(s => s.length === 0) && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="material-symbols-outlined text-6xl text-gray-200 dark:text-gray-800">layers_clear</span>
                            <p className="text-gray-400 font-medium mt-2">Stack is empty</p>
                        </div>
                    )}
                </div>

            </div>

        </VisualizationLayout>
    );
};

export default Stack;
