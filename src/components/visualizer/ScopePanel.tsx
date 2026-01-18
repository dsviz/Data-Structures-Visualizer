import React, { useState } from 'react';
import { Variable, HeapBlock } from '../../utils/MemoryEngine';

interface ScopePanelProps {
    variables: Variable[];
    heap: HeapBlock[];
}

const ScopePanel: React.FC<ScopePanelProps> = ({ variables, heap }) => {
    const [activeTab, setActiveTab] = useState<'scope' | 'heap'>('scope');

    return (
        <div className="bg-white dark:bg-[#1e1d32] rounded-xl shadow-xl border border-gray-200 dark:border-[#383564] w-64 overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-[#383564]">
                {/* ... tabs content ... */}
                <button
                    onClick={() => setActiveTab('scope')}
                    className={`flex-1 py-2 text-[10px] font-bold tracking-wider ${activeTab === 'scope'
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    SCOPE
                </button>
                <button
                    onClick={() => setActiveTab('heap')}
                    className={`flex-1 py-2 text-[10px] font-bold tracking-wider ${activeTab === 'heap'
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    HEAP
                </button>
            </div>

            {/* Content */}
            <div className="p-0 max-h-40 overflow-y-auto bg-gray-50/50 dark:bg-[#131221]/50 min-h-[100px]">
                {activeTab === 'scope' ? (
                    <div className="flex flex-col">
                        {variables.map((v) => (
                            <div key={v.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2d2b42] last:border-0 hover:bg-gray-50 dark:hover:bg-[#2d2b42]/30 transition-colors">
                                <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {v.name}
                                </span>
                                <div className="flex flex-col items-end">
                                    {v.isArray ? (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-[#2d2b42] text-gray-800 dark:text-gray-300">
                                            Array[{v.arrayValues?.length}]
                                        </span>
                                    ) : (
                                        <span className={`font-mono text-sm ${v.isPointer ? 'text-indigo-500 dark:text-indigo-400 italic' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {v.value}
                                        </span>
                                    )}
                                    {v.isPointer && (
                                        <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                                            (ptr)
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {variables.length === 0 && (
                            <div className="p-4 text-center text-xs text-gray-400 italic">No variables in scope</div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {heap.map((h) => (
                            <div key={h.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2d2b42] last:border-0">
                                <span className="font-mono text-xs text-indigo-500 dark:text-indigo-400">
                                    {h.address}
                                </span>
                                <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
                                    {h.value}
                                </span>
                            </div>
                        ))}
                        {heap.length === 0 && (
                            <div className="p-4 text-center text-xs text-gray-400 italic">Heap is empty</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScopePanel;
