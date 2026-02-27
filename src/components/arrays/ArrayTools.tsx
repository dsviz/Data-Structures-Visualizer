import React from 'react';

export type ArrayTool = 'edit' | 'delete' | null;

interface ArrayToolsProps {
    activeTool: ArrayTool;
    setActiveTool: (tool: ArrayTool) => void;
    onAdd: () => void;
    onClear: () => void;
}

export const ArrayTools: React.FC<ArrayToolsProps> = ({
    activeTool,
    setActiveTool,
    onAdd,
    onClear
}) => {
    const tools: { id: ArrayTool, icon: string, label: string }[] = [
        { id: 'edit', icon: 'edit', label: 'Edit Value' },
        { id: 'delete', icon: 'delete', label: 'Delete Element' },
    ];

    return (
        <div className="flex flex-row flex-wrap items-center gap-1.5 w-full">
            {tools.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group
                        ${activeTool === tool.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2845]'
                        }`}
                    title={tool.label}
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
                onClick={onAdd}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 group"
                title="Add Element"
            >
                <span className="material-symbols-outlined text-[20px]">add_box</span>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Add Element
                </div>
            </button>

            <button
                onClick={onClear}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                title="Clear Array"
            >
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Clear Array
                </div>
            </button>
        </div>
    );
};
