import React from 'react';
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

    const toggleOp = (op: Operation) => {
        if (activeOp === op) setActiveOp(null);
        else setActiveOp(op);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Mode Switcher */}
            <div className="bg-gray-100 dark:bg-[#121121] p-1 rounded-lg flex mb-1">
                <button
                    onClick={() => { setMode('standard'); setActiveOp(null); }}
                    className={`flex-1 py-1 text-[10px] uppercase font-bold rounded ${mode === 'standard' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow' : 'text-gray-400'}`}
                >
                    Standard
                </button>
                <button
                    onClick={() => { setMode('apps'); setActiveOp(null); }}
                    className={`flex-1 py-1 text-[10px] uppercase font-bold rounded ${mode === 'apps' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow' : 'text-gray-400'}`}
                >
                    Apps
                </button>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Operations</h3>

            {mode === 'standard' ? (
                <>
                    {/* Create */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'create' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('create')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'create' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>add_circle</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'create' ? 'text-primary font-bold' : ''}`}>Create</p></div>
                        </button>
                        {activeOp === 'create' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                {createStep === 'size' ? (
                                    <>
                                        <label><span className="text-[10px] text-gray-400 uppercase font-bold">Size (Max {MAX_CAPACITY})</span><input type="number" value={createSize} onChange={e => setCreateSize(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white mt-1" /></label>
                                        <button onClick={() => setCreateStep('values')} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Next</button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <button onClick={() => setCreateStep('size')} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-sm">arrow_back</span></button>
                                            <span className="text-xs font-bold text-gray-500">Method</span>
                                        </div>
                                        <button onClick={handleCreateRandom} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded">Random</button>
                                        <div className="text-center text-[10px] text-gray-500">- OR -</div>
                                        <input value={createInput} onChange={e => setCreateInput(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm font-mono text-white" placeholder="10, 20..." />
                                        <button onClick={handleCreateCustom} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Set</button>
                                    </>
                                )}
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'search' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('search')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'search' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>search</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'search' ? 'text-primary font-bold' : ''}`}>Search</p></div>
                        </button>
                        {activeOp === 'search' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex gap-2">
                                    <button onClick={() => setSearchType('linear')} className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border ${searchType === 'linear' ? 'bg-primary text-white border-primary' : 'border-gray-600 text-gray-400'}`}>Linear</button>
                                    <button onClick={() => setSearchType('binary')} className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border ${searchType === 'binary' ? 'bg-primary text-white border-primary' : 'border-gray-600 text-gray-400'}`}>Binary</button>
                                </div>
                                <input type="number" value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" placeholder="Target..." />
                                <button onClick={handleSearch} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Find</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Insert */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'insert' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('insert')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'insert' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>arrow_right_alt</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'insert' ? 'text-primary font-bold' : ''}`}>Insert</p></div>
                        </button>
                        {activeOp === 'insert' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Idx</span><input type="number" value={insertIndex} onChange={e => setInsertIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Val</span><input type="number" value={insertValue} onChange={e => setInsertValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                </div>
                                <button onClick={handleInsert} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Execute</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Remove */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'remove' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('remove')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'remove' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>delete</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'remove' ? 'text-primary font-bold' : ''}`}>Remove</p></div>
                        </button>
                        {activeOp === 'remove' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Index</span><input type="number" value={removeIndex} onChange={e => setRemoveIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                <button onClick={handleRemove} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Execute</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Update */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'update' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('update')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'update' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>edit</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'update' ? 'text-primary font-bold' : ''}`}>Update</p></div>
                        </button>
                        {activeOp === 'update' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Idx</span><input type="number" value={updateIndex} onChange={e => setUpdateIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Val</span><input type="number" value={updateValue} onChange={e => setUpdateValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                </div>
                                <button onClick={handleUpdate} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Execute</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="p-4 text-center text-gray-500 text-xs italic">
                    <p>Applications coming soon...</p>
                </div>
            )}
        </div>
    );
};
