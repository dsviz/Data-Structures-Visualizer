import React, { useState, useEffect } from 'react';
import { Dropdown } from '../ui/Dropdown';
import { Frame } from '../../hooks/useGraphVisualizer';

interface GraphControlsProps {
    isDirected: boolean;
    setIsDirected: (val: boolean) => void;
    isWeighted: boolean;
    setIsWeighted: (val: boolean) => void;
    startNode: string;
    setStartNode: (val: string) => void;
    runBFS: () => void;
    runDFS: () => void;
    runDijkstra: () => void;
    runBellmanFord: () => void;
    runFloydWarshall: () => void;
    runAStar: () => void;
    runPrim: () => void;
    runKruskal: () => void;
    runBoruvka: () => void;
    runNodeDegree: () => void;
    runHighlightNeighbors: () => void;
    runCheckConnectivity: () => void;
    runDetectCycle: () => void;
    runTopologicalSort: () => void;
    runKahn: () => void;
    runTarjanBridges: () => void;
    runArticulationPoints: () => void;
    runFordFulkerson: () => void;
    runEdmondsKarp: () => void;
    reset: () => void;
    activeAlgorithm: string | null;
    isGridSnapped: boolean;
    setIsGridSnapped: (val: boolean) => void;
    snapAllToGrid: () => void;
    updateWeightsByDistance: () => void;
    loadExampleGraph: (category: string) => void;
    frames: Frame[];
    currentStep: number;
    getNodeLabel: (id: number) => string;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
    isDirected, setIsDirected,
    isWeighted, setIsWeighted,
    startNode, setStartNode,
    runBFS, runDFS, runDijkstra, runBellmanFord, runFloydWarshall, runAStar, runPrim, runKruskal, runBoruvka,
    runNodeDegree, runHighlightNeighbors, runCheckConnectivity, runDetectCycle,
    runTopologicalSort, runKahn,
    runTarjanBridges, runArticulationPoints,
    runFordFulkerson, runEdmondsKarp,
    reset,
    activeAlgorithm,
    isGridSnapped, setIsGridSnapped, snapAllToGrid,
    updateWeightsByDistance,
    loadExampleGraph,
    frames, currentStep,
    getNodeLabel
}) => {

    const currentFrame = frames[currentStep];

    const [selectedCategory, setSelectedCategory] = useState<string>('Traversal');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

    const CATEGORIES = [
        { id: 'Basics', label: 'Basics / Fundamentals' },
        { id: 'Traversal', label: 'Graph Traversal' },
        { id: 'Shortest Path', label: 'Shortest Path' },
        { id: 'MST', label: 'Minimum Spanning Tree' },
        { id: 'DAG', label: 'Directed Acyclic Graph' },
        { id: 'Connectivity', label: 'Connectivity' },
        { id: 'Flow', label: 'Network Flow' },
        { id: 'Special', label: 'Special' },
    ];

    const ALGORITHMS: Record<string, { id: string, label: string, run: () => void }[]> = {
        'Basics': [
            { id: 'nodeDegree', label: 'Find Node Degree', run: runNodeDegree },
            { id: 'highlightNeighbors', label: 'Highlight Neighbors', run: runHighlightNeighbors },
            { id: 'checkConnectivity', label: 'Check Connectivity', run: runCheckConnectivity },
            { id: 'detectCycle', label: 'Detect Cycle', run: runDetectCycle },
        ],
        'Traversal': [
            { id: 'bfs', label: 'Breadth First Search (BFS)', run: runBFS },
            { id: 'dfs', label: 'Depth First Search (DFS)', run: runDFS },
        ],
        'Shortest Path': [
            { id: 'dijkstra', label: "Dijkstra's Algorithm", run: runDijkstra },
            { id: 'bellmanFord', label: 'Bellman-Ford Algorithm', run: runBellmanFord },
            { id: 'floydWarshall', label: 'Floyd-Warshall Algorithm', run: runFloydWarshall },
            { id: 'aStar', label: 'A* Search', run: runAStar },
        ],
        'MST': [
            { id: 'prim', label: "Prim's Algorithm", run: runPrim },
            { id: 'kruskal', label: "Kruskal's Algorithm", run: runKruskal },
            { id: 'boruvka', label: "Boruvka's Algorithm", run: runBoruvka },
        ],
        'DAG': [
            { id: 'topologicalSort', label: 'Topological Sort', run: runTopologicalSort },
            { id: 'kahn', label: "Kahn's Algorithm", run: runKahn },
        ],
        'Connectivity': [
            { id: 'tarjanBridges', label: "Tarjan's Bridges", run: runTarjanBridges },
            { id: 'articulationPoints', label: 'Articulation Points', run: runArticulationPoints },
        ],
        'Flow': [
            { id: 'fordFulkerson', label: 'Ford-Fulkerson', run: runFordFulkerson },
            { id: 'edmondsKarp', label: 'Edmonds-Karp', run: runEdmondsKarp },
        ],
        'Special': []
    };

    // Auto-select first algorithm when category changes
    useEffect(() => {
        const algos = ALGORITHMS[selectedCategory] || [];
        if (algos.length > 0) {
            setSelectedAlgorithm(algos[0].id);
        } else {
            setSelectedAlgorithm('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    const handleRunAlgorithm = () => {
        const algos = ALGORITHMS[selectedCategory] || [];
        const algo = algos.find(a => a.id === selectedAlgorithm);
        if (algo) {
            algo.run();
        }
    };

    return (
        <div className="flex flex-col gap-5 pr-2">

            {/* Selection Area */}
            <div className="space-y-4">
                {/* Category Dropdown */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Category</label>
                    <Dropdown
                        value={selectedCategory}
                        onChange={(val) => setSelectedCategory(val)}
                        options={CATEGORIES.map(cat => ({ value: cat.id, label: cat.label }))}
                    />
                </div>

                {/* Algorithm Dropdown */}
                {ALGORITHMS[selectedCategory] && ALGORITHMS[selectedCategory].length > 0 ? (
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Algorithm</label>
                        <Dropdown
                            value={selectedAlgorithm}
                            onChange={(val) => setSelectedAlgorithm(val)}
                            options={ALGORITHMS[selectedCategory].map(algo => ({ value: algo.id, label: algo.label }))}
                        />
                    </div>
                ) : (
                    <div className="text-[11px] text-gray-400 dark:text-gray-500 italic py-2">
                        Algorithms for this category coming soon.
                    </div>
                )}

                {/* Start Node (if necessary) */}
                {['Traversal', 'Shortest Path', 'MST', 'Basics'].includes(selectedCategory) && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#121121] border border-gray-200 dark:border-[#272546]">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300 whitespace-nowrap">Start Node:</span>
                        <input
                            className="flex-1 bg-white dark:bg-[#1a182e] border border-gray-200 dark:border-[#272546] text-slate-900 dark:text-gray-200 text-sm rounded-md p-1.5 focus:ring-2 focus:ring-indigo-600 outline-none text-center font-mono shadow-inner"
                            placeholder="0"
                            type="text"
                            value={startNode}
                            onChange={(e) => setStartNode(e.target.value)}
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={() => {
                            reset();
                            loadExampleGraph(selectedCategory);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-[13px] font-bold transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">auto_fix</span>
                        Example
                    </button>

                    <button
                        onClick={handleRunAlgorithm}
                        disabled={!!activeAlgorithm || !selectedAlgorithm}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[13px] font-bold transition-all shadow-md shadow-indigo-500/20"
                    >
                        <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                        Run
                    </button>
                </div>
            </div>

            {/* Graph Settings Dropdown / Accordion */}
            <div className="mt-2 border border-gray-200 dark:border-[#272546] rounded-xl overflow-hidden bg-white dark:bg-[#121121] shadow-sm">
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#1a182e] hover:bg-gray-100 dark:hover:bg-[#201d36] transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[20px]">settings_suggest</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-gray-200 tracking-wide">Graph Settings</span>
                    </div>
                    <span className={`material-symbols-outlined text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${isSettingsOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 space-y-4 border-t border-gray-200 dark:border-[#272546]">
                        {/* Directed */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 dark:text-gray-400">Directed Graph</span>
                            <button
                                onClick={() => setIsDirected(!isDirected)}
                                className={`w-10 h-6 rounded-full relative transition-colors ${isDirected ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-[#272546]'}`}
                            >
                                <span className={`absolute top-0.5 size-5 bg-white rounded-full shadow-sm transition-all ${isDirected ? 'right-0.5' : 'left-0.5'}`}></span>
                            </button>
                        </div>

                        {/* Weighted */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 dark:text-gray-400">Weighted Graph</span>
                            <button
                                onClick={() => setIsWeighted(!isWeighted)}
                                className={`w-10 h-6 rounded-full relative transition-colors ${isWeighted ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-[#272546]'}`}
                            >
                                <span className={`absolute top-0.5 size-5 bg-white rounded-full shadow-sm transition-all ${isWeighted ? 'right-0.5' : 'left-0.5'}`}></span>
                            </button>
                        </div>

                        {/* Snap to Grid */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 dark:text-gray-400">Snap to Grid</span>
                            <button
                                onClick={() => {
                                    const newValue = !isGridSnapped;
                                    setIsGridSnapped(newValue);
                                    if (newValue) {
                                        snapAllToGrid();
                                        updateWeightsByDistance();
                                    }
                                }}
                                className={`w-10 h-6 rounded-full relative transition-colors ${isGridSnapped ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-[#272546]'}`}
                            >
                                <span className={`absolute top-0.5 size-5 bg-white rounded-full shadow-sm transition-all ${isGridSnapped ? 'right-0.5' : 'left-0.5'}`}></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Output Section */}
            {currentFrame && (
                <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 pb-4">
                    {/* Data Structures Details */}
                    {(currentFrame.queue?.length > 0 || currentFrame.stack?.length > 0 || currentFrame.visited?.length > 0 || currentFrame.distances || currentFrame.distances2D) && (
                        <div className="bg-gray-50 dark:bg-[#1a182e] border border-gray-200 dark:border-[#272546] rounded-xl p-3 shadow-inner flex flex-col gap-3 w-full max-h-[40vh] overflow-y-auto custom-scrollbar">

                            {/* Visited Array */}
                            {currentFrame.visited && currentFrame.visited.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">Visited</span>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {currentFrame.visited.map((nodeId, idx) => (
                                            <div key={`v-${idx}-${nodeId}`} className="size-6 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs rounded border border-emerald-200 dark:border-emerald-800">
                                                {getNodeLabel(nodeId)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Queue */}
                            {currentFrame.queue && currentFrame.queue.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">Queue (Front → Back)</span>
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                        {currentFrame.queue.map((nodeId, idx) => (
                                            <div key={`q-${idx}-${nodeId}`} className="min-w-[24px] h-[24px] flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs rounded border border-indigo-200 dark:border-indigo-800 shrink-0 px-1">
                                                {getNodeLabel(nodeId)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stack */}
                            {currentFrame.stack && currentFrame.stack.length > 0 && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">Stack (Top → Bottom)</span>
                                    <div className="flex gap-1.5 overflow-x-auto max-h-[120px] pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                        {currentFrame.stack.map((nodeId, idx) => (
                                            <div key={`s-${idx}-${nodeId}`} className="min-w-[40px] h-[24px] flex items-center justify-center bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 font-mono font-bold text-xs rounded border border-rose-200 dark:border-rose-800 shrink-0">
                                                {getNodeLabel(nodeId)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Distances Array */}
                            {currentFrame.distances && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">Distances Array</span>
                                    <div className="bg-white dark:bg-[#121121] p-2 rounded border border-gray-200 dark:border-[#272546] overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 shadow-sm">
                                        <div className="flex gap-2 min-w-max">
                                            {Object.entries(currentFrame.distances).map(([nodeId, dist]) => (
                                                <div key={nodeId} className="flex flex-col items-center bg-gray-50 dark:bg-[#1e1c33] rounded px-2 py-1 border border-gray-100 dark:border-gray-800 min-w-[40px]">
                                                    <span className="text-[10px] text-gray-500 font-bold">{getNodeLabel(parseInt(nodeId))}</span>
                                                    <span className={`font-mono font-bold text-sm ${dist !== Infinity && dist !== '∞' ? 'text-amber-500' : 'text-gray-400'}`}>{dist === Infinity ? '∞' : dist}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Distance Matrix */}
                            {currentFrame.distances2D && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">Distance Matrix</span>
                                    <div className="bg-white dark:bg-[#121121] p-2 rounded border border-gray-200 dark:border-[#272546] overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 max-h-[200px] overflow-y-auto shadow-sm">
                                        <table className="w-full text-xs text-center border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className="border-b border-r dark:border-gray-700/50 p-1 text-gray-500 border-gray-200">\</th>
                                                    {Object.keys(currentFrame.distances2D).map(k => (
                                                        <th key={`th-${k}`} className="border-b dark:border-gray-700/50 border-gray-200 p-1 font-mono text-primary">{getNodeLabel(parseInt(k))}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(currentFrame.distances2D).map(([u, row]) => (
                                                    <tr key={`tr-${u}`}>
                                                        <td className="border-r dark:border-gray-700/50 border-gray-200 p-1 font-mono text-primary font-bold">{getNodeLabel(parseInt(u))}</td>
                                                        {Object.entries(row).map(([v, val]) => (
                                                            <td key={`td-${u}-${v}`} className={`p-1 font-mono ${val !== Infinity && val !== '∞' ? 'text-slate-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>{val === Infinity ? '∞' : val}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* Final Output Text (if any) */}
                    {currentFrame.output && (
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Output</label>
                            <div className="p-4 mt-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 shadow-sm">
                                <p className="text-sm font-mono text-indigo-700 dark:text-indigo-300 break-words leading-relaxed font-bold">
                                    {currentFrame.output}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Reset Footer */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-[#272546]">
                <button
                    onClick={reset}
                    className="w-full py-2.5 px-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="material-symbols-outlined text-[16px] group-hover:rotate-180 transition-transform duration-500">cleaning_services</span>
                    Clear Visualizer
                </button>
            </div>
        </div>
    );
};

