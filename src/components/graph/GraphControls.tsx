import React, { useState, useEffect } from 'react';

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
    loadExampleGraph
}) => {

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
        <div className="flex flex-col gap-5 h-full overflow-y-auto pr-2">

            {/* Selection Area */}
            <div className="space-y-4">
                {/* Category Dropdown */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Category</label>
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full appearance-none bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-700 dark:text-gray-300 text-sm rounded-lg pl-3 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-600 transition-colors cursor-pointer shadow-sm"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                </div>

                {/* Algorithm Dropdown */}
                {ALGORITHMS[selectedCategory] && ALGORITHMS[selectedCategory].length > 0 ? (
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Algorithm</label>
                        <div className="relative">
                            <select
                                value={selectedAlgorithm}
                                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                                className="w-full appearance-none bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-700 dark:text-gray-300 text-sm rounded-lg pl-3 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-600 transition-colors cursor-pointer shadow-sm"
                            >
                                {ALGORITHMS[selectedCategory].map(algo => (
                                    <option key={algo.id} value={algo.id}>{algo.label}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                        </div>
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
                                className={`w-10 h-5.5 rounded-full relative transition-colors ${isDirected ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-[#272546]'}`}
                            >
                                <span className={`absolute top-[2px] size-4.5 bg-white rounded-full shadow-sm transition-all ${isDirected ? 'right-[2px]' : 'left-[2px]'}`}></span>
                            </button>
                        </div>

                        {/* Weighted */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 dark:text-gray-400">Weighted Graph</span>
                            <button
                                onClick={() => setIsWeighted(!isWeighted)}
                                className={`w-10 h-5.5 rounded-full relative transition-colors ${isWeighted ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-[#272546]'}`}
                            >
                                <span className={`absolute top-[2px] size-4.5 bg-white rounded-full shadow-sm transition-all ${isWeighted ? 'right-[2px]' : 'left-[2px]'}`}></span>
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
                                className={`w-10 h-5.5 rounded-full relative transition-colors ${isGridSnapped ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-[#272546]'}`}
                            >
                                <span className={`absolute top-[2px] size-4.5 bg-white rounded-full shadow-sm transition-all ${isGridSnapped ? 'right-[2px]' : 'left-[2px]'}`}></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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

