import React, { useEffect } from 'react';
import { MAX_CAPACITY, Operation, SearchType } from '../../hooks/useArraysVisualizer';

interface ArraysControlsProps {
    activeOp: Operation;
    setActiveOp: React.Dispatch<React.SetStateAction<Operation>>;
    mode: 'standard' | 'apps';
    setMode: React.Dispatch<React.SetStateAction<'standard' | 'apps'>>;

    // Create
    createStep: 'size' | 'values';
    setCreateStep: (step: 'size' | 'values') => void;
    createSize: string;
    setCreateSize: (size: string) => void;
    createInput: string;
    setCreateInput: (input: string) => void;
    handleCreateRandom: () => void;
    handleCreateCustom: () => void;

    // Search
    searchType: SearchType;
    setSearchType: React.Dispatch<React.SetStateAction<SearchType>>;
    searchInput: string;
    setSearchInput: (val: string) => void;
    handleSearch: () => void;

    // Insert
    insertIndex: string;
    setInsertIndex: (val: string) => void;
    insertValue: string;
    setInsertValue: (val: string) => void;
    handleInsert: () => void;

    // Remove
    removeIndex: string;
    setRemoveIndex: (val: string) => void;
    handleRemove: () => void;

    // Update
    updateIndex: string;
    setUpdateIndex: (val: string) => void;
    updateValue: string;
    setUpdateValue: (val: string) => void;
    handleUpdate: () => void;

    error: string | null;
}

export const ArraysControls: React.FC<ArraysControlsProps> = ({
    activeOp, setActiveOp, mode, setMode,
    createStep, setCreateStep, createSize, setCreateSize, createInput, setCreateInput, handleCreateRandom, handleCreateCustom,
    searchType, setSearchType, searchInput, setSearchInput, handleSearch,
    insertIndex, setInsertIndex, insertValue, setInsertValue, handleInsert,
    removeIndex, setRemoveIndex, handleRemove,
    updateIndex, setUpdateIndex, updateValue, setUpdateValue, handleUpdate,
    error
}) => {

    const OPERATIONS = mode === 'standard' ? [
        { id: 'create', label: 'Initialize Array' },
        { id: 'search', label: 'Search Element' },
        { id: 'insert', label: 'Insert Element' },
        { id: 'remove', label: 'Remove Element' },
        { id: 'update', label: 'Update Element' },
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
                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Array Size (Max {MAX_CAPACITY})</span>
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
                                                <button onClick={handleCreateCustom} className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg">Apply</button>
                                            </div>
                                            <input value={createInput} onChange={e => setCreateInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 10, 20, 30" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeOp === 'search' && (
                                <div className="space-y-4 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/50 dark:bg-black/20 rounded-lg">
                                        <button onClick={() => setSearchType('linear')} className={`py-1.5 text-[10px] uppercase font-bold rounded-md transition-all ${searchType === 'linear' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow-sm' : 'text-gray-400 hover:text-gray-500'}`}>Linear</button>
                                        <button onClick={() => setSearchType('binary')} className={`py-1.5 text-[10px] uppercase font-bold rounded-md transition-all ${searchType === 'binary' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow-sm' : 'text-gray-400 hover:text-gray-500'}`}>Binary</button>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Target Value</span>
                                        <input type="number" value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center font-bold" />
                                    </div>
                                    <button onClick={handleSearch} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">Search Array</button>
                                </div>
                            )}

                            {activeOp === 'insert' && (
                                <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Index</span>
                                            <input type="number" value={insertIndex} onChange={e => setInsertIndex(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Value</span>
                                            <input type="number" value={insertValue} onChange={e => setInsertValue(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center font-bold" />
                                        </div>
                                    </div>
                                    <button onClick={handleInsert} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">Insert Node</button>
                                </div>
                            )}

                            {activeOp === 'remove' && (
                                <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Index to Remove</span>
                                        <input type="number" value={removeIndex} onChange={e => setRemoveIndex(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center" />
                                    </div>
                                    <button onClick={handleRemove} className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">Remove Node</button>
                                </div>
                            )}

                            {activeOp === 'update' && (
                                <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Index</span>
                                            <input type="number" value={updateIndex} onChange={e => setUpdateIndex(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">New Value</span>
                                            <input type="number" value={updateValue} onChange={e => setUpdateValue(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center font-bold" />
                                        </div>
                                    </div>
                                    <button onClick={handleUpdate} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">Update Value</button>
                                </div>
                            )}
                        </>
                    )}

                    {mode === 'apps' && (
                        <div className="p-8 text-center bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/5">
                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-3">construction</span>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium italic">Advanced applications like Array Reversal & Partitioning coming soon!</p>
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

