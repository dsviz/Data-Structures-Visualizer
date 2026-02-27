import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useTreeVisualizer } from '../hooks/useTreeVisualizer';
import { TreeControls } from '../components/tree/TreeControls';
import { TreeTabs } from '../components/tree/TreeTabs';
import { TreeTools } from '../components/tree/TreeTools';
import { Language } from '../data/TreeCode';
import { useLayout } from '../context/LayoutContext';

const Trees = () => {
  const treeVisualizer = useTreeVisualizer();
  const {
    frames, currentStep, setCurrentStep,
    isPlaying, setIsPlaying,
    playbackSpeed, setPlaybackSpeed,
    activeAlgorithm,
    getCurrentFrame,
    // Interactive tools from hook
    activeTool, setActiveTool,
    addNode, addEdge, removeNode, moveNode,
    selectedNode, setSelectedNode,
    clear
  } = treeVisualizer;

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Zoom & Pan
  const { setIsSidebarOpen } = useLayout();
  const [scale, setScale] = useState(0.7);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [codeLanguage, setCodeLanguage] = useState<Language>('python');

  // Interactive State
  const [draggedNode, setDraggedNode] = useState<number | null>(null);
  const [edgeSource, setEdgeSource] = useState<number | null>(null);
  const [tempEdge, setTempEdge] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);

  const currentFrame = getCurrentFrame();

  // Ensure Left Sidebar is Closed
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [setIsSidebarOpen]);

  // Coordinate Transformation Helper
  const getSvgPoint = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / scale,
      y: (clientY - rect.top - pan.y) / scale
    };
  };



  // Zoom Handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || true) {
      const delta = -e.deltaY;
      setScale(prev => Math.min(Math.max(0.2, prev + (delta * 0.001)), 3));
    }
  };

  // --- Canvas Interaction Handlers ---

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    setSelectedNode(null);
    // Only handle if clicking empty space (not captured by node)
    if (activeTool === 'move') {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (activeTool === 'node') {
      const { x, y } = getSvgPoint(e.clientX, e.clientY);
      addNode(x, y);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (activeTool === 'move') {
      if (isPanning) {
        setPan(p => ({ x: p.x + e.clientX - lastMousePos.x, y: p.y + e.clientY - lastMousePos.y }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
      } else if (draggedNode !== null) {
        const { x, y } = getSvgPoint(e.clientX, e.clientY);
        moveNode(draggedNode, x, y);
      }
    } else if (activeTool === 'edge' && edgeSource !== null) {
      const { x, y } = getSvgPoint(e.clientX, e.clientY);
      const sourceNode = currentFrame.nodes.find(n => n.id === edgeSource);
      if (sourceNode) {
        setTempEdge({ x1: sourceNode.x, y1: sourceNode.y, x2: x, y2: y });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggedNode(null);
    setEdgeSource(null);
    setTempEdge(null);
  };

  // --- Node Interaction Handlers ---

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: number) => {
    e.stopPropagation(); // prevent canvas pan

    // Select node in any mode for visual feedback, or tool specific logic
    setSelectedNode(nodeId);

    if (activeTool === 'move') {
      setDraggedNode(nodeId);
    } else if (activeTool === 'edge') {
      setEdgeSource(nodeId);
      const node = currentFrame.nodes.find(n => n.id === nodeId);
      if (node) setTempEdge({ x1: node.x, y1: node.y, x2: node.x, y2: node.y });
    } else if (activeTool === 'delete') {
      removeNode(nodeId);
      setSelectedNode(null); // Clear selection if deleted
    }
  };

  const handleNodeMouseUp = (e: React.MouseEvent, nodeId: number) => {
    e.stopPropagation();
    if (activeTool === 'edge' && edgeSource !== null) {
      addEdge(edgeSource, nodeId);
      setEdgeSource(null);
      setTempEdge(null);
    }
  };




  // Playback Controls
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
        <title>Interactive Binary Tree Visualizer | Data Structures & Algorithms</title>
        <meta name="description" content="Explore binary trees, BSTs, and traversals (inorder, preorder, postorder, BFS, DFS) with our interactive step-by-step visualizer." />
      </Helmet>
      <VisualizationLayout
        title="Binary Tree"
        contentClassName="flex-1 flex flex-col relative z-10 overflow-hidden p-0"
        controls={playbackControls}
      >
        <div className="flex w-full h-full relative overflow-hidden bg-gray-50 dark:bg-background-dark">
          {/* === CENTRAL CANVAS === */}
          <div className="absolute inset-0 z-0 flex flex-col overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#4236e7 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div
              ref={containerRef}
              className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden z-0
                ${activeTool === 'move' ? 'cursor-grab active:cursor-grabbing' : ''} 
                ${activeTool === 'node' ? 'cursor-crosshair' : ''}
                ${activeTool === 'edge' ? 'cursor-alias' : ''}
                ${activeTool === 'delete' ? 'cursor-not-allowed' : ''}
              `}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onWheel={handleWheel}
            >

              {/* Tree Canvas */}
              <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transition: (isPanning || draggedNode !== null) ? 'none' : 'transform 0.1s ease-out' }} className="relative w-[800px] h-[600px] pointer-events-none origin-top-left">

                <svg className="absolute inset-0 size-full overflow-visible pointer-events-auto">
                  <defs>
                    {/* Glow Filter */}
                    <filter height="140%" id="glow" width="140%" x="-20%" y="-20%">
                      <feGaussianBlur result="blur" stdDeviation="3"></feGaussianBlur>
                      <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
                    </filter>
                  </defs>

                  {/* Edges */}
                  {currentFrame.edges.map((edge, i) => {
                    const fromNode = currentFrame.nodes.find(n => n.id === edge.from);
                    const toNode = currentFrame.nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    return (
                      <line
                        key={`edge-${i}`}
                        x1={fromNode.x} y1={fromNode.y}
                        x2={toNode.x} y2={toNode.y}
                        className="stroke-slate-400 dark:stroke-[#383564] stroke-2 transition-all duration-300"
                      />
                    );
                  })}

                  {/* Temporary Edge (Drag) */}
                  {tempEdge && (
                    <line
                      x1={tempEdge.x1} y1={tempEdge.y1}
                      x2={tempEdge.x2} y2={tempEdge.y2}
                      className="stroke-primary stroke-2 stroke-dasharray-4"
                    />
                  )}

                  {/* Nodes */}
                  {currentFrame.nodes.map((node) => {
                    const isHighlighted = currentFrame.highlights?.includes(node.id);
                    const isEvaluated = currentFrame.evaluated?.includes(node.id);
                    const isSelected = selectedNode === node.id;
                    const isDragged = draggedNode === node.id;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        className={`transition-all duration-500 ${isDragged ? 'transition-none' : ''}`}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
                      >
                        <circle
                          r="24"
                          className={`transition-all duration-300 cursor-pointer hover:stroke-primary/50
                        ${isHighlighted
                              ? 'fill-primary stroke-primary stroke-[3px] filter drop-shadow-[0_0_8px_rgba(66,54,231,0.6)]'
                              : isEvaluated
                                ? 'fill-indigo-100 dark:fill-indigo-900/50 stroke-indigo-400 dark:stroke-indigo-600'
                                : isSelected
                                  ? 'fill-white dark:fill-[#1e1c33] stroke-primary stroke-[3px]'
                                  : 'fill-white dark:fill-[#1e1c33] stroke-slate-400 dark:stroke-slate-500'
                            }
                        stroke-[2.5px]
                    `}
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          y="1"
                          className={`text-sm font-bold font-mono select-none pointer-events-none
                        ${isHighlighted ? 'fill-white' : 'fill-slate-900 dark:fill-white'}
                    `}
                        >
                          {node.value}
                        </text>
                      </g>
                    );
                  })}
                </svg>
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
                  <TreeControls {...treeVisualizer} />
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
                  <TreeTools
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    onClear={clear}
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
                </div>
                <div className="flex-1 overflow-y-auto h-full p-2 custom-scrollbar">
                  <TreeTabs
                    currentFrame={currentFrame}
                    codeLanguage={codeLanguage}
                    setCodeLanguage={setCodeLanguage}
                    activeAlgorithm={activeAlgorithm}
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

        </div>
      </VisualizationLayout>
    </>
  );
};

export default Trees;
