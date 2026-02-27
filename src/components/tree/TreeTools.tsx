import React from 'react';

export type TreeTool = 'move' | 'node' | 'edge' | 'delete';

interface TreeToolsProps {
    activeTool: TreeTool;
    setActiveTool: (tool: TreeTool) => void;
    onClear: () => void;
}

export const TreeTools: React.FC<TreeToolsProps> = ({
    activeTool,
    setActiveTool,
    onClear
}) => {
    return (
        <div
            className="flex flex-row flex-wrap items-center gap-1.5 w-full"
            onMouseDown={(e) => e.stopPropagation()}
        >
            <button
                onClick={() => setActiveTool('move')}
                className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group
                    ${activeTool === 'move'
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2845]'
                    }`}
                title="Move/Pan"
            >
                <span className="material-symbols-outlined text-[20px]">pan_tool</span>
            </button>

            <button
                onClick={() => setActiveTool('node')}
                className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group
                    ${activeTool === 'node'
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2845]'
                    }`}
                title="Add Node"
            >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
            </button>

            <button
                onClick={() => setActiveTool('edge')}
                className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group
                    ${activeTool === 'edge'
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2845]'
                    }`}
                title="Connect Nodes (Edge)"
            >
                <span className="material-symbols-outlined text-[20px]">polyline</span>
            </button>

            <button
                onClick={() => setActiveTool('delete')}
                className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group
                    ${activeTool === 'delete'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                    }`}
                title="Delete Node/Edge"
            >
                <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>

            <div className="w-[1px] h-6 bg-gray-200 dark:bg-[#272546] mx-1"></div>

            <button
                onClick={onClear}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                title="Clear Tree"
            >
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
            </button>
        </div>
    );
};
