import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useGraphVisualizer } from '../hooks/useGraphVisualizer';
import { GraphControls } from '../components/graph/GraphControls';
import { GraphTabs } from '../components/graph/GraphTabs';
import { GraphTools } from '../components/graph/GraphTools';
import { Language } from '../data/GraphCode';
import { useLayout } from '../context/LayoutContext';

const Graphs = () => {
  const {
    isDirected, setIsDirected,
    isWeighted, setIsWeighted,
    startNode, setStartNode,
    activeAlgorithm,
    runBFS, runDFS, runDijkstra, runBellmanFord, runFloydWarshall, runAStar, runPrim, runKruskal,
    runBoruvka,
    runNodeDegree, runHighlightNeighbors, runCheckConnectivity, runDetectCycle,
    runTopologicalSort, runKahn,
    runTarjanBridges, runArticulationPoints,
    runFordFulkerson, runEdmondsKarp,
    resetGraph, clearCanvas,
    getCurrentFrame,
    activeTool, setActiveTool,
    selectedNode, setSelectedNode,
    addNode, removeNode,
    moveNode,
    addEdge, removeEdge,
    getNodeLabel,
    isGridSnapped, setIsGridSnapped,
    snapAllToGrid,
    updateWeightsByDistance,
    adjustPhysicalDistance,
    loadExampleGraph,
    // Playback
    frames,
    currentStep, setCurrentStep,
    isPlaying, setIsPlaying,
    playbackSpeed, setPlaybackSpeed
  } = useGraphVisualizer();

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);

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
  const [scale, setScale] = useState(0.6);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const [codeLanguage, setCodeLanguage] = useState<Language>('python');

  const currentFrame = getCurrentFrame();

  // Ensure Left Sidebar is Closed
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [setIsSidebarOpen]);



  // Zoom Handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || true) {
      const delta = -e.deltaY;
      setScale(prev => Math.min(Math.max(0.2, prev + (delta * 0.001)), 3));
    }
  };

  // Canvas Interaction Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'node') {
      if (graphRef.current) {
        const rect = graphRef.current.getBoundingClientRect();
        // Calculate position relative to graph container
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        addNode(Math.round(x), Math.round(y));
      }
    } else if (activeTool === 'move') {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (activeTool === 'edge') {
      // Clicking BG in edge mode cancels selection
      setSelectedNode(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNode !== null && graphRef.current) {
      const rect = graphRef.current.getBoundingClientRect();
      let x = (e.clientX - rect.left) / scale;
      let y = (e.clientY - rect.top) / scale;

      if (isGridSnapped) {
        x = Math.round(x / 40) * 40;
        y = Math.round(y / 40) * 40;
      }

      moveNode(draggingNode, x, y);
      updateWeightsByDistance();
    } else if (isPanning && activeTool === 'move') {
      setPan(p => ({ x: p.x + e.clientX - lastMousePos.x, y: p.y + e.clientY - lastMousePos.y }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNode(null);
  };

  const [weightInput, setWeightInput] = useState<{ x: number, y: number, from: number, to: number, initialWeight?: number } | null>(null);

  // Node Interaction Handlers
  const handleNodeClick = (e: React.MouseEvent, nodeId: number) => {
    e.stopPropagation();
    console.log('Node Click:', { nodeId, activeTool, selectedNode });

    if (activeTool === 'edge') {
      if (selectedNode === null) {
        setSelectedNode(nodeId);
      } else {
        if (selectedNode !== nodeId) {
          if (isWeighted) {
            // Calculate midpoint for input
            const nodes = currentFrame.nodes;
            const fromNode = nodes.find(n => n.id === selectedNode)!;
            const toNode = nodes.find(n => n.id === nodeId)!;
            const dist = Math.sqrt(Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2));
            const suggestedWeight = isGridSnapped ? Math.max(1, Math.round(dist / 40)) : 1;

            setWeightInput({
              x: (fromNode.x + toNode.x) / 2,
              y: (fromNode.y + toNode.y) / 2,
              from: selectedNode,
              to: nodeId,
              initialWeight: suggestedWeight
            });
            setSelectedNode(null);
          } else {
            addEdge(selectedNode, nodeId, 1);
            setSelectedNode(null);
          }
        } else {
          // Deselect
          setSelectedNode(null);
        }
      }
    } else if (activeTool === 'delete') {
      removeNode(nodeId);
    }
  };

  const handleWeightSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && weightInput) {
      const val = parseInt((e.target as HTMLInputElement).value) || 1;

      // Physical Adjustment Logic
      adjustPhysicalDistance(weightInput.from, weightInput.to, val);
      setIsGridSnapped(false);

      addEdge(weightInput.from, weightInput.to, val, true);
      setWeightInput(null);
    } else if (e.key === 'Escape') {
      setWeightInput(null);
    }
  };

  const handleEdgeClick = (e: React.MouseEvent, from: number, to: number) => {
    e.stopPropagation();
    if (activeTool === 'delete') {
      removeEdge(from, to);
    } else if (activeTool === 'edge' && isWeighted) {
      const edge = currentFrame.edges.find(e => (e.from === from && e.to === to) || (!isDirected && e.from === to && e.to === from));
      if (edge) {
        const fromNode = currentFrame.nodes.find(n => n.id === from)!;
        const toNode = currentFrame.nodes.find(n => n.id === to)!;
        setWeightInput({
          x: (fromNode.x + toNode.x) / 2,
          y: (fromNode.y + toNode.y) / 2,
          from,
          to,
          initialWeight: edge.weight
        });
      }
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
        <div className="flex justify-between text-xs font-medium font-mono text-gray-400">
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

  if (!currentFrame || !currentFrame.nodes) {
    return <div className="p-10 text-red-600 font-bold">Error: Graph data missing. Check console.</div>;
  }
  return (
    <>
      <Helmet>
        <title>Interactive Graph Algorithms Visualizer | Data Structures & Algorithms</title>
        <meta name="description" content="Master graph algorithms visually. Interactive Dijkstra's, A*, DFS, BFS, Kruskal's, and Network Flow animations. Build and analyze your own graphs." />
      </Helmet>
      <VisualizationLayout
        title="Graph"
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
                ${activeTool === 'edge' ? 'cursor-cell' : ''}
                ${activeTool === 'delete' ? 'cursor-not-allowed' : ''}
              `}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onWheel={handleWheel}
            >

              {/* Graph Canvas */}
              <div ref={graphRef} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transition: isPanning ? 'none' : 'transform 0.1s ease-out' }} className="relative w-[600px] h-[400px] pointer-events-none">

                {/* SVG Edges */}
                <svg className="absolute inset-0 size-full overflow-visible pointer-events-none">
                  <defs>
                    <marker id="arrowhead" markerHeight="7" markerWidth="10" orient="auto" refX="28" refY="3.5">
                      <polygon fill="#64748b" points="0 0, 10 3.5, 0 7"></polygon>
                    </marker>
                    <marker id="arrowhead-active" markerHeight="7" markerWidth="10" orient="auto" refX="28" refY="3.5">
                      <polygon fill="#4236e7" points="0 0, 10 3.5, 0 7"></polygon>
                    </marker>
                  </defs>
                  {currentFrame.edges.map((edge, i) => {
                    const fromNode = currentFrame.nodes.find(n => n.id === edge.from);
                    const toNode = currentFrame.nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    const isHighlighted = currentFrame.edgeHighlights?.some(h =>
                      (h.from === edge.from && h.to === edge.to) ||
                      (!isDirected && h.from === edge.to && h.to === edge.from)
                    ) || false;

                    // Calculate midpoint
                    const midX = (fromNode.x + toNode.x) / 2;
                    const midY = (fromNode.y + toNode.y) / 2;

                    // Calculate perpendicular offset
                    const dx = toNode.x - fromNode.x;
                    const dy = toNode.y - fromNode.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    // Normalize and rotate 90 degrees (-dy, dx)
                    // Offset by 15px
                    const offsetX = length > 0 ? (-dy / length) * 15 : 0;
                    const offsetY = length > 0 ? (dx / length) * 15 : -15;

                    // Dim Logic for Kruskal/Prim/Dijkstra/Bellman-Ford/A* (Only at the end)
                    const isTreeAlgo = activeAlgorithm === 'kruskal' || activeAlgorithm === 'prim' || activeAlgorithm === 'dijkstra' || activeAlgorithm === 'bellmanFord' || activeAlgorithm === 'aStar';
                    const isFinished = frames.length > 0 && currentStep === frames.length - 1;
                    const isDimmed = isTreeAlgo && isFinished && !isHighlighted;

                    return (
                      <g key={i} className={`pointer-events-auto cursor-pointer group ${activeTool === 'delete' ? 'hover:opacity-50' : ''}`}
                        onClick={(e) => handleEdgeClick(e, edge.from, edge.to)}>
                        {/* Invisible Hit Area (Wider Target) */}
                        <line
                          x1={fromNode.x} y1={fromNode.y}
                          x2={toNode.x} y2={toNode.y}
                          stroke="transparent"
                          strokeWidth="20"
                          className="cursor-pointer"
                        />

                        {/* Visual Edge */}
                        <line
                          x1={fromNode.x} y1={fromNode.y}
                          x2={toNode.x} y2={toNode.y}
                          className={`transition-all duration-300 
                        ${isHighlighted
                              ? 'stroke-primary stroke-[3px] drop-shadow-[0_0_8px_rgba(66,54,231,0.6)]'
                              : isDimmed
                                ? 'stroke-slate-200 dark:stroke-slate-800 stroke-[1px]'
                                : 'stroke-slate-500 dark:stroke-slate-400 stroke-2 group-hover:stroke-slate-700 dark:group-hover:stroke-slate-300'
                            }`}
                          markerEnd={isDirected ? `url(#${isHighlighted ? 'arrowhead-active' : 'arrowhead'})` : undefined}
                        />
                        {isWeighted && (
                          <g transform={`translate(${midX + offsetX}, ${midY + offsetY})`} className={`transition-opacity duration-300 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}>
                            <rect
                              x="-10" y="-10" width="20" height="20" rx="4"
                              className={`${isHighlighted ? 'fill-primary stroke-primary' : 'fill-white dark:fill-[#1e1c33] stroke-slate-300 dark:stroke-slate-600'} stroke-[1.5px] shadow-sm`}
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className={`text-[10px] font-mono font-bold select-none pointer-events-none ${isHighlighted ? 'fill-white' : 'fill-slate-700 dark:fill-slate-300'}`}
                            >
                              {edge.weight}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Weight Input Float */}
                {weightInput && (
                  <div
                    key={`${weightInput.from}-${weightInput.to}`}
                    style={{
                      left: weightInput.x,
                      top: weightInput.y,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className="absolute z-50 animate-in zoom-in-95 duration-200"
                  >
                    <input
                      autoFocus
                      type="number"
                      defaultValue={weightInput.initialWeight ?? "1"}
                      onKeyDown={handleWeightSubmit}
                      onBlur={() => setWeightInput(null)}
                      className="w-16 h-8 text-center text-sm font-bold bg-white dark:bg-[#1e1c33] border-2 border-primary rounded-lg shadow-lg outline-none text-primary"
                    />
                  </div>
                )}

                {/* Nodes */}
                {currentFrame.nodes.map((node) => {
                  const isVisited = currentFrame.visited?.includes(node.id);
                  const isQueued = currentFrame.queue?.includes(node.id) || currentFrame.stack?.includes(node.id);
                  const isHighlighted = currentFrame.highlights?.includes(node.id);
                  const isSelected = selectedNode === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={(e) => handleNodeClick(e, node.id)}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        if (activeTool !== 'delete') {
                          setDraggingNode(node.id);
                        }
                      }}
                      className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center font-bold font-mono shadow-lg transition-all ${draggingNode === node.id ? 'duration-0 z-50' : 'duration-300'} pointer-events-auto
                                    ${isHighlighted || isVisited ? 'bg-primary border-4 border-white dark:border-[#131221] text-white' : 'bg-white dark:bg-[#1e1c33] border-2 text-slate-900 dark:text-white'}
                                    ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-[#131221]' : 'border-slate-400 dark:border-slate-500'}
                                    ${isHighlighted ? 'scale-110 shadow-[0_0_20px_rgba(66,54,231,0.6)] z-20' : 'z-10'}
                                    ${activeTool !== 'move' ? 'cursor-pointer hover:border-primary' : ''}
                                `}
                      style={{ left: node.x, top: node.y }}
                    >
                      {getNodeLabel(node.id)}

                      {/* Distance Overlay */}
                      {currentFrame.distances && currentFrame.distances[node.id] !== undefined && (
                        <div className={`absolute -bottom-7 px-1.5 py-0.5 rounded shadow-sm text-[10px] font-bold tracking-tight border pointer-events-none whitespace-nowrap z-50 ${currentFrame.distances[node.id] !== Infinity && currentFrame.distances[node.id] !== '∞'
                          ? 'bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-100'
                          : 'bg-white dark:bg-[#131221] border-gray-200 dark:border-gray-700 text-gray-400'
                          }`}>
                          d: {currentFrame.distances[node.id] === Infinity ? '∞' : currentFrame.distances[node.id]}
                        </div>
                      )}

                      {isQueued && !isVisited && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white dark:border-[#131221]"></div>
                      )}
                    </div>
                  );
                })}

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
                  <GraphControls
                    isDirected={isDirected} setIsDirected={setIsDirected}
                    isWeighted={isWeighted} setIsWeighted={setIsWeighted}
                    startNode={startNode} setStartNode={setStartNode}
                    runBFS={runBFS} runDFS={runDFS}
                    runDijkstra={runDijkstra} runBellmanFord={runBellmanFord} runFloydWarshall={runFloydWarshall} runAStar={runAStar} runPrim={runPrim} runKruskal={runKruskal}
                    runBoruvka={runBoruvka}
                    runNodeDegree={runNodeDegree} runHighlightNeighbors={runHighlightNeighbors}
                    runCheckConnectivity={runCheckConnectivity} runDetectCycle={runDetectCycle}
                    runTopologicalSort={runTopologicalSort} runKahn={runKahn}
                    runTarjanBridges={runTarjanBridges} runArticulationPoints={runArticulationPoints}
                    runFordFulkerson={runFordFulkerson} runEdmondsKarp={runEdmondsKarp}
                    reset={resetGraph}
                    activeAlgorithm={activeAlgorithm}
                    isGridSnapped={isGridSnapped}
                    setIsGridSnapped={setIsGridSnapped}
                    snapAllToGrid={snapAllToGrid}
                    updateWeightsByDistance={updateWeightsByDistance}
                    loadExampleGraph={loadExampleGraph}
                    frames={frames}
                    currentStep={currentStep}
                    getNodeLabel={getNodeLabel}
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
                  <GraphTools
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    onClear={clearCanvas}
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
                  <GraphTabs
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

export default Graphs;
