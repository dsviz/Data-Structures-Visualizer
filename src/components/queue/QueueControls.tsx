import React from 'react';
import { MAX_CAPACITY, Operation } from '../../hooks/useQueueVisualizer';

interface QueueControlsProps {
    activeOp: Operation;
    setActiveOp: React.Dispatch<React.SetStateAction<Operation>>;

    // Create
    createStep: 'size' | 'values';
    setCreateStep: (step: 'size' | 'values') => void;
    createSize: string;
    setCreateSize: (size: string) => void;
    createInput: string;
    setCreateInput: (input: string) => void;
    handleCreateRandom: () => void;
    handleCreateCustom: () => void;

    // Operations
    enqueueValue: string;
    setEnqueueValue: (val: string) => void;
    handleEnqueue: () => void;
    handleDequeue: () => void;
    handlePeek: () => void;

    error: string | null;
}

export const QueueControls: React.FC<QueueControlsProps> = ({
    activeOp, setActiveOp,
    createStep, setCreateStep, createSize, setCreateSize, createInput, setCreateInput, handleCreateRandom, handleCreateCustom,
    enqueueValue, setEnqueueValue, handleEnqueue, handleDequeue, handlePeek,
    error
}) => {

    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Operations</h3>

            {/* Operation: Create */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'create' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => { setActiveOp(prev => prev === 'create' ? null : 'create'); setCreateStep('size'); }} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'create' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>add_circle</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'create' ? 'text-primary font-bold' : ''}`}>Create</p></div>
                </button>
                {activeOp === 'create' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                        {createStep === 'size' ? (
                            <>
                                <label>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Queue Size (Max {MAX_CAPACITY})</span>
                                    <input type="number" value={createSize} onChange={e => setCreateSize(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-md px-3 py-2 text-sm font-mono focus:border-primary outline-none mt-1" />
                                </label>
                                <button onClick={() => setCreateStep('values')} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Next</button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <button onClick={() => setCreateStep('size')} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined text-sm">arrow_back</span></button>
                                    <span className="text-xs font-bold text-gray-500">Method</span>
                                </div>
                                <button onClick={handleCreateRandom} className="w-full border border-gray-600 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-white text-xs font-bold py-2 rounded">Generate Random</button>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400"><div className="h-px bg-gray-600 flex-1"></div>OR<div className="h-px bg-gray-600 flex-1"></div></div>
                                <input value={createInput} onChange={e => setCreateInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-md px-3 py-2 text-sm font-mono focus:border-primary outline-none" placeholder="1, 2, 3..." />
                                <button onClick={handleCreateCustom} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Set Values</button>
                            </>
                        )}
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>

            {/* Operation: Enqueue */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'enqueue' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => setActiveOp(prev => prev === 'enqueue' ? null : 'enqueue')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'enqueue' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>login</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'enqueue' ? 'text-primary font-bold' : ''}`}>Enqueue (v)</p></div>
                </button>
                {activeOp === 'enqueue' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                        <label><span className="text-[10px] text-gray-400 uppercase font-bold">Value</span><input type="text" value={enqueueValue} onChange={e => setEnqueueValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                        <button onClick={handleEnqueue} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Enqueue</button>
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>

            {/* Operation: Dequeue */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'dequeue' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => setActiveOp(prev => prev === 'dequeue' ? null : 'dequeue')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'dequeue' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>logout</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'dequeue' ? 'text-primary font-bold' : ''}`}>Dequeue</p></div>
                </button>
                {activeOp === 'dequeue' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs text-gray-400 mb-2">Remove front element?</p>
                        <button onClick={handleDequeue} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Dequeue</button>
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>

            {/* Operation: Peek */}
            <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'peek' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                <button onClick={() => setActiveOp(prev => prev === 'peek' ? null : 'peek')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                    <span className={`material-symbols-outlined ${activeOp === 'peek' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>visibility</span>
                    <div><p className={`text-sm font-medium leading-none ${activeOp === 'peek' ? 'text-primary font-bold' : ''}`}>Peek</p></div>
                </button>
                {activeOp === 'peek' && (
                    <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs text-gray-400 mb-2">View front element?</p>
                        <button onClick={handlePeek} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Peek</button>
                        {error && <div className="text-red-400 text-xs">{error}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};
