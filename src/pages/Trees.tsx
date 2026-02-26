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

  const [splitRatio, setSplitRatio] = useState(0.7);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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


  // Sidebar Content
  const sidebarContent = (
    <div className="h-full flex flex-col relative" ref={sidebarRef}>
      {/* Controls Section */}
      <div style={{ height: `${splitRatio * 100}%` }} className="min-h-0 overflow-y-auto border-b border-gray-200 dark:border-[#272546] p-4">
        <TreeControls
          {...treeVisualizer}
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
        <TreeTabs
          currentFrame={currentFrame}
          codeLanguage={codeLanguage}
          setCodeLanguage={setCodeLanguage}
          activeAlgorithm={activeAlgorithm}
        />
      </div>
    </div>
  );

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
        sidebarPosition="right"
        contentClassName="flex-1 flex flex-col relative z-0 overflow-hidden"
        sidebarNoPadding={true}
        sidebarNoScroll={true}
        sidebar={sidebarContent}
        rightSidebar={null}
        leftSidebar={null}
        controls={playbackControls}
      >
        <div
          ref={containerRef}
          className={`relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-gray-50/50 dark:bg-black/20 
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
          <TreeTools
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            onClear={clear}
          />

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

          {/* Description Overlay */}
          <div className="absolute bottom-4 right-4 max-w-sm w-full pointer-events-none flex justify-end">
            <div className="bg-white/90 dark:bg-[#1e1c33]/90 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-[#272546] shadow-xl pointer-events-auto transition-all duration-300 transform translate-y-0 opacity-100">
              <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Current Operation</h4>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                {currentFrame.description || "Ready to visualize..."}
              </p>
            </div>
          </div>
        </div>

      </VisualizationLayout>
    </>
  );
};

export default Trees;
