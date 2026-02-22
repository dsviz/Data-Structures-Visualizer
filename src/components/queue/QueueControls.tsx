import React, { useEffect } from 'react';
import { Operation } from '../../hooks/useQueueVisualizer';
import { Dropdown } from '../ui/Dropdown';

interface QueueControlsProps {
    activeOp: Operation;
    setActiveOp: React.Dispatch<React.SetStateAction<Operation>>;
    mode: 'standard' | 'apps';
    setMode: React.Dispatch<React.SetStateAction<'standard' | 'apps'>>;

    // Operations
    enqueueValue: string;
    setEnqueueValue: (val: string) => void;
    handleEnqueue: () => void;
    handleDequeue: () => void;
    handlePeek: () => void;

    // Apps
    binaryNumInput: string;
    setBinaryNumInput: (val: string) => void;
    hotPotatoPlayers: string;
    setHotPotatoPlayers: (val: string) => void;
    hotPotatoPasses: string;
    setHotPotatoPasses: (val: string) => void;
    handleBinaryNumbers: () => void;
    handleHotPotato: () => void;

    handleExample: () => void;
    error: string | null;
}

export const QueueControls: React.FC<QueueControlsProps> = ({
    activeOp, setActiveOp, mode, setMode,
    enqueueValue, setEnqueueValue, handleEnqueue, handleDequeue, handlePeek,
    binaryNumInput, setBinaryNumInput, hotPotatoPlayers, setHotPotatoPlayers, hotPotatoPasses, setHotPotatoPasses, handleBinaryNumbers, handleHotPotato,
    handleExample,
    error
}) => {

    const OPERATIONS = mode === 'standard' ? [
        { id: 'enqueue', label: 'Enqueue Element' },
        { id: 'dequeue', label: 'Dequeue Element' },
        { id: 'peek', label: 'Peek Front' },
    ] : [
        { id: 'binaryNum', label: 'Binary Numbers' },
        { id: 'hotPotato', label: 'Hot Potato' }
    ];

    useEffect(() => {
        if (!activeOp && mode === 'standard') {
            setActiveOp('enqueue');
        } else if (!activeOp && mode === 'apps') {
            setActiveOp('binaryNum');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const handleRun = () => {
        switch (activeOp) {
            case 'enqueue': handleEnqueue(); break;
            case 'dequeue': handleDequeue(); break;
            case 'peek': handlePeek(); break;
            case 'binaryNum': handleBinaryNumbers(); break;
            case 'hotPotato': handleHotPotato(); break;
        }
    };

    return (
        <div className="flex flex-col gap-6">

            {/* Mode Toggle */}
            <div className="bg-gray-100 dark:bg-[#121121] p-1.5 rounded-xl flex gap-1 border border-gray-200 dark:border-[#272546]">
                <button
                    onClick={() => { setMode('standard'); setActiveOp('enqueue'); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'standard' ? 'bg-white dark:bg-[#272546] text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Standard
                </button>
                <button
                    onClick={() => { setMode('apps'); setActiveOp('binaryNum'); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'apps' ? 'bg-white dark:bg-[#272546] text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Applications
                </button>
            </div>

            {/* Selection Area */}
            <div className="space-y-4">
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

                    {activeOp === 'enqueue' && (
                        <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Value to Enqueue</span>
                            <input type="text" value={enqueueValue} onChange={e => setEnqueueValue(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center font-bold" />
                        </div>
                    )}

                    {(activeOp === 'dequeue' || activeOp === 'peek') && (
                        <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <p className="text-xs text-gray-500 italic leading-relaxed text-center">
                                {activeOp === 'dequeue' ? 'Remove and return the element from the front of the queue.' : 'View the front element without removing it.'}
                            </p>
                        </div>
                    )}

                    {activeOp === 'binaryNum' && (
                        <div className="space-y-4 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <div className="space-y-1">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Generate N Binary Numbers</span>
                                <input type="number" min="1" max="15" value={binaryNumInput} onChange={e => setBinaryNumInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center font-bold" />
                            </div>
                            <p className="text-xs text-gray-500 italic leading-relaxed text-center">
                                Uses a queue to systematically generate binary numbers up to N by appending '0' and '1' to dequeued values.
                            </p>
                        </div>
                    )}

                    {activeOp === 'hotPotato' && (
                        <div className="space-y-4 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Players</span>
                                    <input type="number" min="2" max="15" value={hotPotatoPlayers} onChange={e => setHotPotatoPlayers(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-2 py-2 text-sm text-center font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Passes</span>
                                    <input type="number" min="0" value={hotPotatoPasses} onChange={e => setHotPotatoPasses(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-2 py-2 text-sm text-center font-bold" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 italic leading-relaxed text-center">
                                Simulates the Hot Potato / Josephus Problem. After N passes, the person holding the potato is eliminated.
                            </p>
                        </div>
                    )}
                </div>

                {/* Standardized Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={handleExample}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-[13px] font-bold transition-all shadow-sm group"
                    >
                        <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">auto_fix</span>
                        Example
                    </button>

                    <button
                        onClick={handleRun}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-[13px] font-bold transition-all shadow-md shadow-indigo-500/20 ${activeOp === 'dequeue' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}
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

