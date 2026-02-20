import React, { useEffect } from 'react';
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

    const OPERATIONS = [
        { id: 'create', label: 'Initialize Queue' },
        { id: 'enqueue', label: 'Enqueue Element' },
        { id: 'dequeue', label: 'Dequeue Element' },
        { id: 'peek', label: 'Peek Front' },
    ];

    useEffect(() => {
        if (!activeOp) {
            setActiveOp('create');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRun = () => {
        switch (activeOp) {
            case 'enqueue': handleEnqueue(); break;
            case 'dequeue': handleDequeue(); break;
            case 'peek': handlePeek(); break;
        }
    };

    return (
        <div className="flex flex-col gap-6">

            {/* Selection Area */}
            <div className="space-y-4">
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
                    {activeOp === 'create' && (
                        <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            {createStep === 'size' ? (
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Capacity (Max {MAX_CAPACITY})</span>
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

                    {activeOp === 'enqueue' && (
                        <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Value to Enqueue</span>
                            <input type="text" value={enqueueValue} onChange={e => setEnqueueValue(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center font-bold" />
                            <button onClick={handleEnqueue} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">Enqueue to Back</button>
                        </div>
                    )}

                    {(activeOp === 'dequeue' || activeOp === 'peek') && (
                        <button onClick={handleRun} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 shadow-primary/20">
                            Run {activeOp === 'dequeue' ? 'Dequeue' : 'Peek'}
                        </button>
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

