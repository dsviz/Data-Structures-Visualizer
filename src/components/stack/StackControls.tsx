import React, { useEffect } from 'react';
import { MAX_CAPACITY, Operation } from '../../hooks/useStackVisualizer';

interface StackControlsProps {
    mode: 'standard' | 'applications';
    setMode: (mode: 'standard' | 'applications') => void;
    activeOp: Operation;
    setActiveOp: React.Dispatch<React.SetStateAction<Operation>>;
    activeStackIndex: number;
    setActiveStackIndex: (index: number) => void;

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
    pushValue: string;
    setPushValue: (val: string) => void;
    handlePush: () => void;
    handlePop: () => void;
    handlePeek: () => void;

    // Applications
    appInput: string;
    setAppInput: (val: string) => void;
    handleReverseString: () => void;
    balancedInput: string;
    setBalancedInput: (val: string) => void;
    handleBalancedParentheses: () => void;
    postfixInput: string;
    setPostfixInput: (val: string) => void;
    handlePostfixEval: () => void;
    browserInput: string;
    setBrowserInput: (val: string) => void;
    handleBrowserVisit: () => void;
    handleBrowserBack: () => void;
    handleBrowserForward: () => void;

    error: string | null;
    currentFrame: any;
}

export const StackControls: React.FC<StackControlsProps> = ({
    mode, setMode, activeOp, setActiveOp, activeStackIndex, setActiveStackIndex,
    createStep, setCreateStep, createSize, setCreateSize, createInput, setCreateInput, handleCreateRandom, handleCreateCustom,
    pushValue, setPushValue, handlePush, handlePop, handlePeek,
    appInput, setAppInput, handleReverseString,
    balancedInput, setBalancedInput, handleBalancedParentheses,
    postfixInput, setPostfixInput, handlePostfixEval,
    browserInput, setBrowserInput, handleBrowserVisit, handleBrowserBack, handleBrowserForward,
    error, currentFrame
}) => {

    const OPERATIONS = mode === 'standard' ? [
        { id: 'create', label: 'Initialize Stack' },
        { id: 'push', label: 'Push Element' },
        { id: 'pop', label: 'Pop Element' },
        { id: 'peek', label: 'Peek Top' },
    ] : [
        { id: 'app_reverse', label: 'Reverse String' },
        { id: 'app_balanced_parentheses', label: 'Balanced Parentheses' },
        { id: 'app_postfix_eval', label: 'Postfix Evaluator' },
        { id: 'app_browser_history', label: 'Browser History' },
    ];

    useEffect(() => {
        if (!activeOp) {
            setActiveOp(OPERATIONS[0].id as Operation);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const handleRun = () => {
        switch (activeOp) {
            case 'push': handlePush(); break;
            case 'pop': handlePop(); break;
            case 'peek': handlePeek(); break;
            case 'app_reverse': handleReverseString(); break;
            case 'app_balanced_parentheses': handleBalancedParentheses(); break;
            case 'app_postfix_eval': handlePostfixEval(); break;
            case 'app_browser_history': handleBrowserVisit(); break;
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-1">

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
                            onClick={() => setMode('applications')}
                            className={`flex-1 py-2 text-[11px] uppercase font-bold rounded-md transition-all ${mode === 'applications' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Apps
                        </button>
                    </div>
                </div>

                {/* Stack Choice (Standard Only) */}
                {mode === 'standard' && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Active Stack</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[0, 1].map(idx => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveStackIndex(idx)}
                                    className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${activeStackIndex === idx ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'border-gray-200 dark:border-[#272546] text-gray-400 hover:bg-gray-50'}`}
                                >
                                    Stack {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
                                    <button onClick={() => setCreateStep('values')} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">Initialize & Next</button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <button onClick={() => setCreateStep('size')} className="text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-base">arrow_back</span></button>
                                        <span className="text-xs font-bold text-gray-500">Add Values</span>
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

                    {activeOp === 'push' && (
                        <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Value to Push</span>
                            <input type="text" value={pushValue} onChange={e => setPushValue(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm text-center font-bold" />
                            <button onClick={handlePush} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm">Push to Stack</button>
                        </div>
                    )}

                    {(activeOp === 'pop' || activeOp === 'peek') && (
                        <button onClick={handleRun} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 shadow-primary/20">
                            Run {activeOp === 'pop' ? 'Pop' : 'Peek'}
                        </button>
                    )}

                    {/* App Specific Inputs */}
                    {activeOp === 'app_reverse' && (
                        <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Input Text</span>
                            <input type="text" value={appInput} onChange={e => setAppInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm" maxLength={MAX_CAPACITY} />
                            <button onClick={handleReverseString} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg">Run Reversal</button>
                        </div>
                    )}

                    {activeOp === 'app_balanced_parentheses' && (
                        <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Expression</span>
                            <input type="text" value={balancedInput} onChange={e => setBalancedInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm" />
                            <button onClick={handleBalancedParentheses} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg">Check Balance</button>
                        </div>
                    )}

                    {activeOp === 'app_postfix_eval' && (
                        <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Postfix Expression</span>
                            <input type="text" value={postfixInput} onChange={e => setPostfixInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm font-mono" placeholder="e.g. 5 3 + 2 *" />
                            <button onClick={handlePostfixEval} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg">Evaluate</button>
                        </div>
                    )}

                    {activeOp === 'app_browser_history' && (
                        <div className="space-y-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">URL Path</span>
                            <input type="text" value={browserInput} onChange={e => setBrowserInput(e.target.value)} className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#383564] rounded-lg px-3 py-2 text-sm" placeholder="e.g. google.com" />
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={handleBrowserBack} className="bg-gray-100 dark:bg-[#272546] hover:bg-gray-200 dark:hover:bg-[#383564] text-slate-700 dark:text-white text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"><span className="material-symbols-outlined text-sm">arrow_back</span> Back</button>
                                <button onClick={handleBrowserForward} className="bg-gray-100 dark:bg-[#272546] hover:bg-gray-200 dark:hover:bg-[#383564] text-slate-700 dark:text-white text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">Forward <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
                            </div>
                            <button onClick={handleBrowserVisit} className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm font-bold">Visit Page</button>
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

            {/* Results Output (Apps Only) */}
            {mode === 'applications' && currentFrame.internalState.output && (
                <div className="space-y-2 mt-auto">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Application Result</label>
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 shadow-sm animate-in zoom-in-95 duration-200">
                        <div className="text-[10px] text-green-600 dark:text-green-400 font-bold mb-1">OUTPUT</div>
                        <p className="text-sm font-mono font-bold text-green-700 dark:text-green-300 break-words leading-relaxed">
                            {currentFrame.internalState.output}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

