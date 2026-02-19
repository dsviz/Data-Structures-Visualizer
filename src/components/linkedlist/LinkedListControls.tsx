
import React from 'react';
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
    const toggleOp = (op: Operation) => {
        if (activeOp === op) setActiveOp(null);
        else setActiveOp(op);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Mode Switcher */}
            <div className="bg-gray-100 dark:bg-[#121121] p-1 rounded-lg flex mb-1">
                <button onClick={() => { setMode('standard'); setActiveOp(null); }} className={`flex-1 py-1 text-[10px] uppercase font-bold rounded ${mode === 'standard' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow' : 'text-gray-400'}`}>
                    Standard
                </button>
                <button onClick={() => { setMode('apps'); setActiveOp(null); }} className={`flex-1 py-1 text-[10px] uppercase font-bold rounded ${mode === 'apps' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow' : 'text-gray-400'}`}>
                    Apps
                </button>
            </div>

            {/* List Type Switcher (Like Stack 1 / Stack 2) */}
            <div className="bg-gray-100 dark:bg-[#121121] p-1 rounded-lg flex mb-2">
                {(['singly', 'doubly', 'circular'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setListType(t)}
                        className={`flex-1 py-1 text-[10px] uppercase font-bold rounded transition-all ${listType === t ? 'bg-white dark:bg-[#2e2b52] text-primary shadow' : 'text-gray-400 hover:text-gray-500'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Operations</h3>

            {mode === 'standard' ? (
                <>
                    {/* Create */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'create' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('create')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'create' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>add_circle</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'create' ? 'text-primary font-bold' : ''}`}>Create</p>
                                <p className={`text-xs mt-1 ${activeOp === 'create' ? 'text-primary' : 'text-gray-400'}`}>New List</p>
                            </div>
                        </button>
                        {activeOp === 'create' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                {createStep === 'size' ? (
                                    <>
                                        <label><span className="text-[10px] text-gray-400 uppercase font-bold">Size</span><input type="number" value={createSize} onChange={e => setCreateSize(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white mt-1" /></label>
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
                                        <button onClick={handleCreate} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Set</button>
                                    </>
                                )}
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Insert */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'insert' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('insert')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'insert' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>arrow_right_alt</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'insert' ? 'text-primary font-bold' : ''}`}>Insert</p>
                                <p className={`text-xs mt-1 ${activeOp === 'insert' ? 'text-primary' : 'text-gray-400'}`}>Add Node</p>
                            </div>
                        </button>
                        {activeOp === 'insert' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Val</span><input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                    <label><span className="text-[10px] text-gray-400 uppercase font-bold">Idx</span><input type="number" value={inputIndex} onChange={e => setInputIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                    <button onClick={() => handleInsert('head')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Head</button>
                                    <button onClick={() => handleInsert('tail')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Tail</button>
                                    <button onClick={() => handleInsert('index')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Index</button>
                                </div>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Remove */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'remove' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('remove')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'remove' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>delete</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'remove' ? 'text-primary font-bold' : ''}`}>Remove</p>
                                <p className={`text-xs mt-1 ${activeOp === 'remove' ? 'text-primary' : 'text-gray-400'}`}>Delete Node</p>
                            </div>
                        </button>
                        {activeOp === 'remove' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Index</span><input type="number" value={inputIndex} onChange={e => setInputIndex(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                <div className="grid grid-cols-3 gap-1 mt-2">
                                    <button onClick={() => handleRemove('head')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Head</button>
                                    <button onClick={() => handleRemove('tail')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Tail</button>
                                    <button onClick={() => handleRemove('index')} className="bg-primary hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded">Index</button>
                                </div>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'search' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => toggleOp('search')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'search' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>search</span>
                            <div>
                                <p className={`text-sm font-medium leading-none ${activeOp === 'search' ? 'text-primary font-bold' : ''}`}>Search</p>
                                <p className={`text-xs mt-1 ${activeOp === 'search' ? 'text-primary' : 'text-gray-400'}`}>Find Value</p>
                            </div>
                        </button>
                        {activeOp === 'search' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" placeholder="Value..." />
                                <button onClick={handleSearch} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Find</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="p-4 text-center text-gray-500 text-xs italic">
                    <p>Applications (e.g., Reverse, Cycle Detection) coming soon...</p>
                </div>
            )}
        </div>
    );
};
