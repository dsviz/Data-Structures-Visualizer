import React, { useEffect } from 'react';
import { Operation, ListType } from '../../hooks/useLinkedListVisualizer';

interface LinkedListControlsProps {
    activeOp: Operation;
    setActiveOp: (op: Operation) => void;
    mode: 'standard' | 'apps';
    setMode: (mode: 'standard' | 'apps') => void;
    // List Type
    listType: ListType;
    setListType: (type: ListType) => void;
    // Inputs
    createInput: string;
    setCreateInput: (val: string) => void;
    createStep: 'size' | 'values';
    setCreateStep: (step: 'size' | 'values') => void;
    createSize: string;
    setCreateSize: (size: string) => void;
    inputValue: string;
    setInputValue: (val: string) => void;
    inputIndex: string;
    setInputIndex: (val: string) => void;
    error: string | null;
    // Handlers
    handleCreate: () => void;
    handleCreateRandom: () => void;
    handleInsert: (type: 'head' | 'tail' | 'index') => void;
    handleRemove: (type: 'head' | 'tail' | 'index') => void;
    handleSearch: () => void;
}

export const LinkedListControls: React.FC<LinkedListControlsProps> = ({
    activeOp, setActiveOp, mode, setMode,
    listType, setListType,
    createInput, setCreateInput, createStep, setCreateStep, createSize, setCreateSize,
    inputValue, setInputValue, inputIndex, setInputIndex, error,
    handleCreate, handleCreateRandom, handleInsert, handleRemove, handleSearch
}) => {

    const OPERATIONS = mode === 'standard' ? [
        { id: 'create', label: 'Initialize List' },
        { id: 'insert', label: 'Insert Node' },
        { id: 'remove', label: 'Remove Node' },
        { id: 'search', label: 'Search Value' },
    ] : [
        { id: 'app_coming_soon', label: 'More Apps Coming Soon...' },
    ];

    useEffect(() => {
        if (!activeOp && mode === 'standard') {
            setActiveOp('create');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    return (
        <div className="flex flex-col gap-6">

            {/* Selection Area */}
            <div className="space-y-4">
                {/* Mode Selector */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Work Mode</label>
                    <div className="bg-gray-100 dark:bg-[#121121] p-1 rounded-lg flex shadow-inner">
                        <button
                            onClick={() => setMode('standard')}
                            className={`flex-1 py-2 text-[11px] uppercase font-bold rounded-md transition-all ${mode === 'standard' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Standard
                        </button>
                        <button
                            onClick={() => setMode('apps')}
                            className={`flex-1 py-2 text-[11px] uppercase font-bold rounded-md transition-all ${mode === 'apps' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Apps
                        </button>
                    </div>
                </div>

                {/* List Type Selector */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">List Type</label>
                    <div className="bg-gray-100 dark:bg-[#121121] p-1 rounded-lg flex shadow-inner">
                        {(['singly', 'doubly', 'circular'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setListType(t)}
                                className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded transition-all ${listType === t ? 'bg-white dark:bg-[#2e2b52] text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Operation Dropdown */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Operation</label>
                    <div className="relative">
                        <select
                            value={activeOp || ''}
                            onChange={(e) => setActiveOp(e.target.value as Operation)}
                            className="w-full appearance-none bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-700 dark:text-gray-300 text-sm rounded-lg pl-3 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer shadow-sm"
                        >
                            {OPERATIONS.map(op => (
                                <option key={op.id} value={op.id}>{op.label}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                    </div>
                </div>

                {/* Dynamic Inputs Area */}
                <div className="animate-in fade-in slide-in-from-top-2">
                    {mode === 'standard' && (
                        <>
                            {activeOp === 'create' && (
                                <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    {createStep === 'size' ? (
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">List Size</span>
                                                <input type="number" value={createSize} onChange={e => setCreateSize(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary outline-none mt-1" />
                                            </div>
                                            <button onClick={() => setCreateStep('values')} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">Next</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <button onClick={() => setCreateStep('size')} className="text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-base">arrow_back</span></button>
                                                <span className="text-xs font-bold text-gray-500">Method</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={handleCreateRandom} className="w-full bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#383564] hover:bg-gray-50 text-gray-700 dark:text-white text-xs font-bold py-2 rounded-lg">Randomize</button>
                                                <button onClick={handleCreate} className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg">Apply</button>
                                            </div>
                                            <input value={createInput} onChange={e => setCreateInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 10, 20, 30" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeOp === 'insert' && (
                                <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Value</span>
                                            <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm font-bold" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Index</span>
                                            <input type="number" value={inputIndex} onChange={e => setInputIndex(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => handleInsert('head')} className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold py-2.5 rounded-lg border border-primary/20 transition-all">Head</button>
                                        <button onClick={() => handleInsert('tail')} className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold py-2.5 rounded-lg border border-primary/20 transition-all">Tail</button>
                                        <button onClick={() => handleInsert('index')} className="bg-primary text-white text-[10px] font-bold py-2.5 rounded-lg shadow-sm">Fixed</button>
                                    </div>
                                </div>
                            )}

                            {activeOp === 'remove' && (
                                <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Target Index</span>
                                        <input type="number" value={inputIndex} onChange={e => setInputIndex(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => handleRemove('head')} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold py-2.5 rounded-lg border border-red-500/20 transition-all">Head</button>
                                        <button onClick={() => handleRemove('tail')} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold py-2.5 rounded-lg border border-red-500/20 transition-all">Tail</button>
                                        <button onClick={() => handleRemove('index')} className="bg-red-500 text-white text-[10px] font-bold py-2.5 rounded-lg shadow-sm">Index</button>
                                    </div>
                                </div>
                            )}

                            {activeOp === 'search' && (
                                <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Search Value</span>
                                    <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm" placeholder="Value..." />
                                    <button onClick={handleSearch} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">Search List</button>
                                </div>
                            )}
                        </>
                    )}

                    {mode === 'apps' && (
                        <div className="p-8 text-center bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/5">
                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">construction</span>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium italic">Advanced applications like Cycle Detection & Reversal coming soon!</p>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl animate-in shake duration-500">
                        <p className="text-red-600 dark:text-red-400 text-xs font-medium leading-relaxed">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

