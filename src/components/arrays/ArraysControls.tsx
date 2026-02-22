import React, { useEffect } from 'react';
import { Operation, SearchType } from '../../hooks/useArraysVisualizer';
import { Dropdown } from '../ui/Dropdown';

interface ArraysControlsProps {
    activeOp: Operation;
    setActiveOp: React.Dispatch<React.SetStateAction<Operation>>;
    mode: 'standard' | 'apps';
    setMode: React.Dispatch<React.SetStateAction<'standard' | 'apps'>>;

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

    // Apps
    twoSumTarget: string;
    setTwoSumTarget: (val: string) => void;
    handleReverse: () => void;
    handleTwoSum: () => void;
    handleCycleDetection: () => void;
    handleExample: () => void;

    error: string | null;
}

export const ArraysControls: React.FC<ArraysControlsProps> = ({
    activeOp, setActiveOp, mode, setMode,
    searchType, setSearchType, searchInput, setSearchInput, handleSearch,
    insertIndex, setInsertIndex, insertValue, setInsertValue, handleInsert,
    removeIndex, setRemoveIndex, handleRemove,
    updateIndex, setUpdateIndex, updateValue, setUpdateValue, handleUpdate,
    twoSumTarget, setTwoSumTarget, handleReverse, handleTwoSum, handleCycleDetection,
    handleExample,
    error
}) => {

    const OPERATIONS = mode === 'standard' ? [
        { id: 'search', label: 'Search Element' },
        { id: 'insert', label: 'Insert Element' },
        { id: 'remove', label: 'Remove Element' },
        { id: 'update', label: 'Update Element' },
    ] : [
        { id: 'reverse', label: 'Array Reversal' },
        { id: '2sum', label: 'Two Sum (Sorted)' },
        { id: 'cycle_detection', label: 'Cycle Detection (Array as Graph)' },
    ];

    useEffect(() => {
        if (!activeOp && mode === 'standard') {
            setActiveOp('search');
        } else if (activeOp === 'create') {
            setActiveOp('search');
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
                    <Dropdown
                        value={activeOp || ''}
                        options={OPERATIONS.map(op => ({ value: op.id, label: op.label }))}
                        onChange={(val) => setActiveOp(val as Operation)}
                        placeholder="Select Operation..."
                    />
                </div>

                {/* Dynamic Inputs Area */}
                <div className="animate-in fade-in slide-in-from-top-2">
                    {mode === 'standard' && (
                        <>

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
                                </div>
                            )}

                            {activeOp === 'remove' && (
                                <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Index to Remove</span>
                                        <input type="number" value={removeIndex} onChange={e => setRemoveIndex(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center" />
                                    </div>
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
                                </div>
                            )}
                        </>
                    )}

                    {mode === 'apps' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            {activeOp === 'reverse' && (
                                <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <p className="text-xs text-gray-500 italic leading-relaxed">Visualize two pointers swapping elements from outside in.</p>
                                </div>
                            )}

                            {activeOp === '2sum' && (
                                <div className="space-y-4 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Target Sum</span>
                                        <input type="number" value={twoSumTarget} onChange={e => setTwoSumTarget(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center font-bold" />
                                    </div>
                                </div>
                            )}

                            {activeOp === 'cycle_detection' && (
                                <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <p className="text-xs text-gray-500 italic leading-relaxed">Treat array as a graph where arr[i] is the next pointer. Detect cycles using Floyd's algorithm.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Final Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={handleExample}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-[13px] font-bold transition-all shadow-sm group"
                    >
                        <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">auto_fix</span>
                        Example
                    </button>

                    <button
                        onClick={() => {
                            switch (activeOp) {
                                case 'search': handleSearch(); break;
                                case 'insert': handleInsert(); break;
                                case 'remove': handleRemove(); break;
                                case 'update': handleUpdate(); break;
                                case 'reverse': handleReverse(); break;
                                case '2sum': handleTwoSum(); break;
                                case 'cycle_detection': handleCycleDetection(); break;
                            }
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-[13px] font-bold transition-all shadow-md shadow-indigo-500/20 ${activeOp === 'remove' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                        Run
                    </button>
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

