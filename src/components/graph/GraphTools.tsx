import React from 'react';

export type GraphTool = 'move' | 'node' | 'edge' | 'delete' | 'clear';

interface GraphToolsProps {
    activeTool: GraphTool;
    setActiveTool: (tool: GraphTool) => void;
    onClear: () => void;
}

export const GraphTools: React.FC<GraphToolsProps> = ({
    activeTool,
    setActiveTool,
    onClear
}) => {
    const tools: { id: GraphTool, icon: string, label: string, shortcut: string }[] = [
        { id: 'move', icon: 'pan_tool', label: 'Move', shortcut: 'V' },
        { id: 'node', icon: 'add_circle', label: 'Add Node', shortcut: 'N' },
        { id: 'edge', icon: 'timeline', label: 'Add Edge', shortcut: 'E' },
        { id: 'delete', icon: 'delete', label: 'Delete', shortcut: 'Del' },
    ];

    return (
        <div className="flex flex-row flex-wrap items-center gap-1.5 w-full">
            {tools.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group
                        ${activeTool === tool.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2845]'
                        }`}
                    title={`${tool.label} (${tool.shortcut})`}
                >
                    <span className="material-symbols-outlined text-[20px]">{tool.icon}</span>

                    {/* Tooltip */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {tool.label}
                    </div>
                </button>
            ))}

            <div className="w-[1px] h-6 bg-gray-200 dark:bg-[#272546] mx-1"></div>

            <button
                onClick={onClear}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                title="Clear Canvas"
            >
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Clear
                </div>
            </button>
        </div>
    );
};
