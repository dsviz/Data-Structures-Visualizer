import React from 'react';

export type QueueTool = 'edit' | null;

interface QueueToolsProps {
    activeTool: QueueTool;
    setActiveTool: (tool: QueueTool) => void;
    onEnqueue: () => void;
    onDequeue: () => void;
    onClear: () => void;
}

export const QueueTools: React.FC<QueueToolsProps> = ({
    activeTool,
    setActiveTool,
    onEnqueue,
    onDequeue,
    onClear
}) => {
    return (
        <div className="absolute top-4 left-4 bg-white dark:bg-[#1e1c33] p-1.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-[#272546] flex flex-row items-center gap-1 z-50 animate-in slide-in-from-left-4 fade-in">
            <button
                onClick={onEnqueue}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 group"
                title="Enqueue (Add)"
            >
                <span className="material-symbols-outlined text-[20px]">add_box</span>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Enqueue
                </div>
            </button>

            <button
                onClick={() => setActiveTool(activeTool === 'edit' ? null : 'edit')}
                className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group ${activeTool === 'edit'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-inner'
                    : 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                title="Edit Values"
            >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Edit Values
                </div>
            </button>

            <button
                onClick={onDequeue}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 group"
                title="Dequeue (Remove)"
            >
                <span className="material-symbols-outlined text-[20px]">indeterminate_check_box</span>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Dequeue
                </div>
            </button>

            <div className="w-[1px] h-6 bg-gray-200 dark:bg-[#272546] mx-1"></div>

            <button
                onClick={onClear}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                title="Clear Queue"
            >
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Clear Queue
                </div>
            </button>
        </div>
    );
};
