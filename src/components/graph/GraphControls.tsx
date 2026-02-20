import React from 'react';

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

    const [selectedCategory, setSelectedCategory] = React.useState<string>('Traversal');

    const CATEGORIES = [
        { id: 'Basics', label: 'Basics', icon: 'grid_view' },
        { id: 'Traversal', label: 'Traversal', icon: 'alt_route' },
        { id: 'Shortest Path', label: 'Shortest', icon: 'timeline' },
        { id: 'MST', label: 'MST', icon: 'hub' },
        { id: 'DAG', label: 'DAG', icon: 'turn_right' },
        { id: 'Connectivity', label: 'Connect', icon: 'link' },
        { id: 'Flow', label: 'Flow', icon: 'waves' },
        { id: 'Special', label: 'Special', icon: 'star' },
    ];

    const renderAlgorithmButtons = () => {
        const loadBtn = (
            <button
                onClick={() => {
                    reset();
                    loadExampleGraph(selectedCategory);
                }}
                className="col-span-2 w-full py-2 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-xs font-bold transition-all flex items-center justify-center gap-2 mb-2"
            >
                <span className="material-symbols-outlined text-lg">auto_fix</span>
                {['MST', 'Traversal', 'Basics', 'Shortest Path', 'DAG', 'Connectivity', 'Flow'].includes(selectedCategory)
                    ? `Load Next Example / Draw Own`
                    : `Load Example / Draw Own`}
            </button>
        );

        switch (selectedCategory) {
            case 'Traversal':
                return (
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {loadBtn}
                        <button onClick={runBFS} disabled={!!activeAlgorithm} className={algoBtnClass}>Run BFS</button>
                        <button onClick={runDFS} disabled={!!activeAlgorithm} className={algoBtnClass}>Run DFS</button>
                    </div>
                );
            case 'Shortest Path':
                return (
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {loadBtn}
                        <button onClick={runDijkstra} disabled={!!activeAlgorithm} className={algoBtnClass}>Run Dijkstra's</button>
                        <button onClick={runBellmanFord} disabled={!!activeAlgorithm} className={algoBtnClass}>Bellman-Ford</button>
                        <button onClick={runFloydWarshall} disabled={!!activeAlgorithm} className={algoBtnClass}>Floyd-Warshall</button>
                        <button onClick={runAStar} disabled={!!activeAlgorithm} className={algoBtnClass}>A* Search</button>
                    </div>
                );
            case 'MST':
                return (
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {loadBtn}
                        <button onClick={runPrim} disabled={!!activeAlgorithm} className={algoBtnClass}>Run Prim's MST</button>
                        <button onClick={runKruskal} disabled={!!activeAlgorithm} className={algoBtnClass}>Run Kruskal's MST</button>
                        <button onClick={runBoruvka} disabled={!!activeAlgorithm} className={algoBtnClass}>Run Boruvka's</button>
                    </div>
                );
            case 'Basics':
                return (
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {loadBtn}
                        <button onClick={runNodeDegree} disabled={!!activeAlgorithm} className={algoBtnClass}>Find Node Degree</button>
                        <button onClick={runHighlightNeighbors} disabled={!!activeAlgorithm} className={algoBtnClass}>Highlight Neighbors</button>
                        <button onClick={runCheckConnectivity} disabled={!!activeAlgorithm} className={algoBtnClass}>Check Connectivity</button>
                        <button onClick={runDetectCycle} disabled={!!activeAlgorithm} className={algoBtnClass}>Detect Cycle</button>
                    </div>
                );
            case 'DAG':
                return (
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {loadBtn}
                        <button onClick={runTopologicalSort} disabled={!!activeAlgorithm} className={algoBtnClass}>Topological Sort</button>
                        <button onClick={runKahn} disabled={!!activeAlgorithm} className={algoBtnClass}>Kahn's Algorithm</button>
                    </div>
                );
            case 'Connectivity':
                return (
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {loadBtn}
                        <button onClick={runTarjanBridges} disabled={!!activeAlgorithm} className={algoBtnClass}>Tarjan's Bridges</button>
                        <button onClick={runArticulationPoints} disabled={!!activeAlgorithm} className={algoBtnClass}>Articulation Points</button>
                    </div>
                );
            case 'Flow':
                return (
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {loadBtn}
                        <button onClick={runFordFulkerson} disabled={!!activeAlgorithm} className={algoBtnClass}>Ford-Fulkerson</button>
                        <button onClick={runEdmondsKarp} disabled={!!activeAlgorithm} className={algoBtnClass}>Edmonds-Karp</button>
                    </div>
                );
            default:
                return (
                    <div className="grid grid-cols-2 gap-2 w-full">
                        {loadBtn}
                        <div className="col-span-2 text-[10px] text-gray-400 dark:text-gray-500 text-center py-2 italic">
                            Algorithms for {selectedCategory} coming soon.
                        </div>
                    </div>
                );
        }
    };

    const algoBtnClass = `h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition-colors`;

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">

            {/* Categories Grid */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat.id
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-white dark:bg-[#121121] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#272546] hover:bg-gray-50 dark:hover:bg-[#1a182e]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Algorithms */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Algorithms</h3>
                <div className="grid grid-cols-1 gap-2">
                    {renderAlgorithmButtons()}
                </div>
            </div>

            {/* Graph Settings */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Graph Settings</h3>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-[#121121] border border-gray-200 dark:border-[#272546]">
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Directed Graph</span>
                    <button
                        onClick={() => setIsDirected(!isDirected)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isDirected ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <span className={`absolute top-1 size-3 bg-white rounded-full shadow-sm transition-all ${isDirected ? 'right-1' : 'left-1'}`}></span>
                    </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-[#121121] border border-gray-200 dark:border-[#272546]">
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Weighted Graph</span>
                    <button
                        onClick={() => setIsWeighted(!isWeighted)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isWeighted ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <span className={`absolute top-1 size-3 bg-white rounded-full shadow-sm transition-all ${isWeighted ? 'right-1' : 'left-1'}`}></span>
                    </button>
                </div>

                {/* Grid Snap Controls */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-[#121121] border border-gray-200 dark:border-[#272546]">
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Snap to Grid</span>
                    <button
                        onClick={() => {
                            const newValue = !isGridSnapped;
                            setIsGridSnapped(newValue);
                            if (newValue) {
                                snapAllToGrid();
                                updateWeightsByDistance();
                            }
                        }}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isGridSnapped ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <span className={`absolute top-1 size-3 bg-white rounded-full shadow-sm transition-all ${isGridSnapped ? 'right-1' : 'left-1'}`}></span>
                    </button>
                </div>

                {['Traversal', 'Shortest Path', 'MST'].includes(selectedCategory) && (
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Start Node:</span>
                        <input
                            className="w-full bg-gray-100 dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-900 dark:text-gray-200 text-sm rounded-lg p-2 focus:ring-2 focus:ring-indigo-600 outline-none text-center font-mono"
                            placeholder="0"
                            type="text"
                            value={startNode}
                            onChange={(e) => setStartNode(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* Reset - Clean and Minimal */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">

                <button
                    onClick={reset}
                    className="w-full py-2.5 px-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 text-xs font-medium transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform duration-500">refresh</span>
                    Reset
                </button>
            </div>
        </div>
    );
};
