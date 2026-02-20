import React from 'react';

export type TreeTool = 'move';

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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1e1c33] p-1.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-[#272546] flex items-center gap-1 z-50">
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
