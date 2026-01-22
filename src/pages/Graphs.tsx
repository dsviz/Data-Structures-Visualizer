import { useState, useRef, useEffect } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useLayout } from '../context/LayoutContext';

const Graphs = () => {
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  // Zoom & Pan
  const { isSidebarOpen } = useLayout();
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const contentWidth = 600; // Fixed width from code
    const availableWidth = containerRef.current.clientWidth;

    if (contentWidth > availableWidth) {
      const newScale = Math.max(0.4, availableWidth / contentWidth);
      if (newScale < 0.95) setScale(newScale * 0.9);
    }
  }, [isSidebarOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || true) {
      //  e.preventDefault(); // Might trigger passive warning, so maybe rely on bubble
      const delta = -e.deltaY;
      setScale(prev => {
        const newScale = prev + (delta * 0.001);
        return Math.min(Math.max(0.2, newScale), 3);
      });
    }
  };

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.2, prev + delta), 3));
  };

  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };


  const sidebar = (
    <div className="flex flex-col gap-6">
      {/* Properties Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9794c7]">Properties</h3>
        {/* Segmented Control: Direction */}
        <div className="bg-gray-100 dark:bg-[#121121] p-1 rounded-lg flex border border-gray-200 dark:border-[#272546]">
          <label className="flex-1 cursor-pointer">
            <input defaultChecked className="peer sr-only" name="direction" type="radio" />
            <div className="h-8 flex items-center justify-center rounded text-xs font-medium text-gray-500 dark:text-[#9794c7] peer-checked:bg-white dark:peer-checked:bg-[#272546] peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm transition-all">
              Directed
            </div>
          </label>
          <label className="flex-1 cursor-pointer">
            <input className="peer sr-only" name="direction" type="radio" />
            <div className="h-8 flex items-center justify-center rounded text-xs font-medium text-gray-500 dark:text-[#9794c7] peer-checked:bg-white dark:peer-checked:bg-[#272546] peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm transition-all">
              Undirected
            </div>
          </label>
        </div>
        {/* Toggle: Weighted */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-[#121121] border border-gray-200 dark:border-[#272546]">
          <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Weighted Edges</span>
          <button className="w-10 h-5 rounded-full bg-primary relative transition-colors">
            <span className="absolute right-1 top-1 size-3 bg-white rounded-full shadow-sm"></span>
          </button>
        </div>
      </div>

      {/* Tools Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9794c7]">Tool Palette</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-[#121121] border border-gray-200 dark:border-[#272546] hover:border-primary/50 hover:bg-primary/5 text-slate-500 dark:text-[#9794c7] hover:text-primary dark:hover:text-white transition-all group">
            <span className="material-symbols-outlined text-2xl group-hover:text-primary">add_circle</span>
            <span className="text-xs font-medium">Add Node</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-[#121121] border border-gray-200 dark:border-[#272546] hover:border-primary/50 hover:bg-primary/5 text-slate-500 dark:text-[#9794c7] hover:text-primary dark:hover:text-white transition-all group">
            <span className="material-symbols-outlined text-2xl group-hover:text-primary">timeline</span>
            <span className="text-xs font-medium">Add Edge</span>
          </button>
        </div>
        <button className="w-full py-2 px-4 rounded-lg border border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">delete</span>
          Clear Canvas
        </button>
      </div>

      {/* Algorithms Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9794c7]">Algorithms</h3>
        <div className="relative">
          <select className="w-full bg-gray-100 dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-900 dark:text-gray-200 text-sm rounded-lg p-2.5 appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
            <option>Breadth-First Search (BFS)</option>
            <option>Depth-First Search (DFS)</option>
            <option>Dijkstra's Algorithm</option>
            <option>Bellman-Ford</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-500 pointer-events-none">expand_more</span>
        </div>
        <div className="flex gap-2">
          <input className="w-1/3 bg-gray-100 dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-900 dark:text-gray-200 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none text-center font-mono" placeholder="Start (0)" type="text" />
          <button className="flex-1 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg text-sm px-4 py-2.5 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(13,89,242,0.4)]">
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            Run
          </button>
        </div>
      </div>

      {/* Playback Controls (Sticky Bottom of Sidebar) */}
      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-[#272546]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 dark:text-[#9794c7] font-mono">Step: 4/12</span>
          <span className="text-xs text-primary font-medium">Running...</span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-slate-400 dark:text-[#9794c7] hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">skip_previous</span>
          </button>
          <button className="p-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-[#121121] hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors shadow-lg">
            <span className="material-symbols-outlined filled">pause</span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-slate-400 dark:text-[#9794c7] hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">skip_next</span>
          </button>
        </div>
        <div className="w-full bg-gray-200 dark:bg-[#272546] rounded-full h-1 mt-4 overflow-hidden">
          <div className="bg-primary h-full w-1/3 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  const controls = (
    <div className="h-72 w-full bg-white dark:bg-[#1e1c33] border-t border-gray-200 dark:border-[#272546] flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-20">
      {/* Panel Header/Tabs */}
      <div className="flex items-center px-4 border-b border-gray-200 dark:border-[#272546] bg-gray-50 dark:bg-[#121121]/50">
        <button
          onClick={() => setViewMode('matrix')}
          className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${viewMode === 'matrix' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span className="material-symbols-outlined text-[18px]">grid_on</span>
          Adjacency Matrix
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
        >
          <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
          Adjacency List
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
          </button>
        </div>
      </div>
      {/* Panel Content */}
      <div className="flex-1 overflow-auto p-6 flex items-start gap-8 font-mono text-sm max-w-full">
        {/* Matrix Visualization */}
        <div className="flex flex-col">
          <h4 className="text-xs font-bold text-slate-500 dark:text-[#9794c7] uppercase tracking-widest mb-4">Matrix View (4x4)</h4>
          <div className="inline-grid grid-cols-5 gap-1 select-none">
            {/* Headers */}
            <div className="size-10 flex items-center justify-center text-slate-500"></div>
            {[0, 1, 2, 3].map(i => (
              <div key={`h-${i}`} className={`size-10 flex items-center justify-center font-bold bg-gray-100 dark:bg-[#121121]/50 rounded ${i === 1 ? 'ring-1 ring-primary/50 text-primary' : 'text-slate-400'}`}>{i}</div>
            ))}

            {/* Rows */}
            {[0, 1, 2, 3].map(row => (
              <>
                <div key={`r-${row}`} className={`size-10 flex items-center justify-center font-bold bg-gray-100 dark:bg-[#121121]/50 rounded ${row === 1 ? 'ring-1 ring-primary/50 text-primary' : 'text-slate-400'}`}>{row}</div>
                {[0, 1, 2, 3].map(col => {
                  /* Hardcoded simulation of graph data */
                  let val = 0;
                  let isActive = false;
                  if (row === 0 && col === 2) val = 5;
                  if (row === 1 && col === 3) { val = 8; isActive = true; } // Active
                  if (row === 1 && col === 0) val = 0;
                  if (row === 2 && col === 1) val = 2; // Directed back

                  return (
                    <div key={`${row}-${col}`} className={`size-10 flex items-center justify-center rounded ${isActive ? 'bg-primary/20 text-primary font-bold ring-1 ring-primary' : 'bg-gray-50 dark:bg-[#121121] text-slate-400 dark:text-slate-600'} ${val > 0 && !isActive ? 'dark:text-slate-200 text-slate-800' : ''}`}>
                      {val}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
        {/* Divider */}
        <div className="w-px h-full bg-gray-200 dark:bg-[#272546] mx-4"></div>
        {/* Details Panel */}
        <div className="flex-1 w-full">
          <h4 className="text-xs font-bold text-slate-500 dark:text-[#9794c7] uppercase tracking-widest mb-4">Node Details</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-[#121121] p-4 rounded-lg border border-gray-200 dark:border-[#272546]">
              <div className="text-slate-500 dark:text-gray-400 text-xs mb-1">Selected Node</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="size-3 rounded-full bg-primary"></span>
                Index 1
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">In-degree</span>
                  <span className="text-slate-900 dark:text-white">1</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Out-degree</span>
                  <span className="text-slate-900 dark:text-white">2</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className="text-emerald-500 dark:text-emerald-400">Visited</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-[#121121] p-4 rounded-lg border border-gray-200 dark:border-[#272546]">
              <div className="text-slate-500 dark:text-gray-400 text-xs mb-1">Algorithm State (BFS)</div>
              <div className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                <span className="text-primary font-bold">Step 4:</span> Exploring neighbors of Node 1. Found neighbors [2, 3]. Added to queue. Distance updated to 8 for Node 3.
              </div>
              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-1">Queue:</div>
                <div className="flex gap-1">
                  <div className="bg-white dark:bg-[#1e1c33] px-2 py-1 rounded text-xs border border-gray-200 dark:border-[#272546] text-slate-500 dark:text-[#9794c7]">1</div>
                  <div className="bg-primary px-2 py-1 rounded text-xs text-white">2</div>
                  <div className="bg-primary px-2 py-1 rounded text-xs text-white">3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <VisualizationLayout title="Graph" sidebar={sidebar} controls={controls}>
      {/* Floating Info Badge */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#1e1c33]/80 backdrop-blur border border-gray-200 dark:border-[#272546] shadow-xl">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300">Graph: Cyclic, Directed</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-gray-50/50 dark:bg-black/20 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={(e) => { setIsDragging(true); setLastMousePos({ x: e.clientX, y: e.clientY }); }}
        onMouseMove={(e) => {
          if (isDragging) { setPan(p => ({ x: p.x + e.clientX - lastMousePos.x, y: p.y + e.clientY - lastMousePos.y })); setLastMousePos({ x: e.clientX, y: e.clientY }); }
        }}
        onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}
        onWheel={handleWheel}
      >
        {/* Graph Simulation Canvas Content */}
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transition: 'transform 0.1s ease-out' }} className="relative w-[600px] h-[400px]">
          {/* SVG Edges Layer */}
          <svg className="absolute inset-0 size-full overflow-visible pointer-events-none">
            <defs>
              <marker id="arrowhead" markerHeight="7" markerWidth="10" orient="auto" refX="28" refY="3.5">
                <polygon fill="#64748b" points="0 0, 10 3.5, 0 7"></polygon>
              </marker>
              <marker id="arrowhead-dark" markerHeight="7" markerWidth="10" orient="auto" refX="28" refY="3.5">
                <polygon fill="#94a3b8" points="0 0, 10 3.5, 0 7"></polygon>
              </marker>
              <marker id="arrowhead-active" markerHeight="7" markerWidth="10" orient="auto" refX="28" refY="3.5">
                <polygon fill="#4236e7" points="0 0, 10 3.5, 0 7"></polygon>
              </marker>
            </defs>
            {/* Edge 0 -> 1 */}
            <line className="stroke-slate-500 dark:stroke-slate-400" markerEnd="url(#arrowhead)" strokeWidth="2" x1="100" x2="300" y1="100" y2="100"></line>
            {/* Edge 1 -> 2 (Active) */}
            <line className="drop-shadow-[0_0_8px_rgba(66,54,231,0.6)] stroke-primary" markerEnd="url(#arrowhead-active)" strokeWidth="3" x1="300" x2="400" y1="100" y2="300"></line>
            {/* Edge 2 -> 0 */}
            <line className="stroke-slate-500 dark:stroke-slate-400" markerEnd="url(#arrowhead)" strokeWidth="2" x1="400" x2="100" y1="300" y2="100"></line>
            {/* Edge 1 -> 3 */}
            <line className="stroke-slate-500 dark:stroke-slate-400" markerEnd="url(#arrowhead)" strokeWidth="2" x1="300" x2="500" y1="100" y2="150"></line>
          </svg>

          {/* Nodes */}
          {/* Node 0 */}
          <div className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1e1c33] border-2 border-slate-400 dark:border-slate-500 text-slate-900 dark:text-white rounded-full flex items-center justify-center font-bold font-mono shadow-lg hover:scale-110 transition-transform cursor-grab active:cursor-grabbing z-10" style={{ left: '100px', top: '100px' }}>
            0
          </div>
          {/* Node 1 (Active/Visited) */}
          <div className="absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 bg-primary border-4 border-white dark:border-[#131221] text-white rounded-full flex items-center justify-center font-bold font-mono shadow-[0_0_20px_rgba(66,54,231,0.6)] z-20 cursor-grab active:cursor-grabbing animate-bounce" style={{ left: '300px', top: '100px' }}>
            1
          </div>
          {/* Node 2 */}
          <div className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1e1c33] border-2 border-slate-400 dark:border-slate-500 text-slate-900 dark:text-white rounded-full flex items-center justify-center font-bold font-mono shadow-lg hover:scale-110 transition-transform cursor-grab active:cursor-grabbing z-10" style={{ left: '400px', top: '300px' }}>
            2
          </div>
          {/* Node 3 */}
          <div className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1e1c33] border-2 border-slate-400 dark:border-slate-500 text-slate-900 dark:text-white rounded-full flex items-center justify-center font-bold font-mono shadow-lg hover:scale-110 transition-transform cursor-grab active:cursor-grabbing z-10" style={{ left: '500px', top: '150px' }}>
            3
          </div>

          {/* Weight Labels */}
          <div className="absolute text-xs font-mono text-slate-500 bg-gray-100 dark:bg-[#121121] px-1 rounded" style={{ left: '200px', top: '90px' }}>5</div>
          <div className="absolute text-xs font-mono text-primary font-bold bg-white dark:bg-[#121121] px-1 rounded" style={{ left: '360px', top: '200px' }}>8</div>
        </div>
      </div>

      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-10 right-10 flex flex-col gap-2 z-10">
        <button onClick={() => handleZoom(0.1)} className="size-10 rounded-lg bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] hover:text-primary text-slate-400 flex items-center justify-center transition-colors shadow-lg">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button onClick={() => handleZoom(-0.1)} className="size-10 rounded-lg bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] hover:text-primary text-slate-400 flex items-center justify-center transition-colors shadow-lg">
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button onClick={handleReset} className="size-10 rounded-lg bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] hover:text-primary text-slate-400 flex items-center justify-center transition-colors shadow-lg mt-2">
          <span className="material-symbols-outlined">center_focus_strong</span>
        </button>
      </div>
    </VisualizationLayout>
  )
}

export default Graphs
