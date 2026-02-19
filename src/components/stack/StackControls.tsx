import React from 'react';
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
                    onClick={() => { setMode('applications'); setActiveOp(null); }}
                    className={`flex-1 py-1 text-[10px] uppercase font-bold rounded ${mode === 'applications' ? 'bg-white dark:bg-[#2e2b52] text-primary shadow' : 'text-gray-400'}`}
                >
                    Apps
                </button>
            </div>

            {/* Stack Selector (Only Standard Mode) */}
            {mode === 'standard' && (
                <div className="flex gap-2 mb-2 px-1">
                    <button
                        onClick={() => setActiveStackIndex(0)}
                        className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border transition-colors ${activeStackIndex === 0 ? 'bg-primary/10 border-primary text-primary' : 'border-dashed border-gray-600 text-gray-400 hover:text-gray-300'}`}
                    >
                        Stack 1
                    </button>
                    <button
                        onClick={() => setActiveStackIndex(1)}
                        className={`flex-1 py-1 text-[10px] uppercase font-bold rounded border transition-colors ${activeStackIndex === 1 ? 'bg-primary/10 border-primary text-primary' : 'border-dashed border-gray-600 text-gray-400 hover:text-gray-300'}`}
                    >
                        Stack 2
                    </button>
                </div>
            )}

            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Operations</h3>

            {mode === 'standard' ? (
                <>
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
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">Stack Size (Max {MAX_CAPACITY})</span>
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

                    {/* Operation: Push */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'push' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => setActiveOp(prev => prev === 'push' ? null : 'push')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'push' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>publish</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'push' ? 'text-primary font-bold' : ''}`}>Push (v)</p></div>
                        </button>
                        {activeOp === 'push' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Value</span><input type="text" value={pushValue} onChange={e => setPushValue(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" /></label>
                                <button onClick={handlePush} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Push</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>

                    {/* Operation: Pop */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'pop' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => setActiveOp(prev => prev === 'pop' ? null : 'pop')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'pop' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>arrow_upward</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'pop' ? 'text-primary font-bold' : ''}`}>Pop</p></div>
                        </button>
                        {activeOp === 'pop' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <p className="text-xs text-gray-400 mb-2">Remove top element?</p>
                                <button onClick={handlePop} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Pop</button>
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
                                <p className="text-xs text-gray-400 mb-2">View top element?</p>
                                <button onClick={handlePeek} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Peek</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Application: String Reversal */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'app_reverse' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => setActiveOp(prev => prev === 'app_reverse' ? null : 'app_reverse')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'app_reverse' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>swap_horiz</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'app_reverse' ? 'text-primary font-bold' : ''}`}>Reverse String</p></div>
                        </button>
                        {activeOp === 'app_reverse' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Input String</span><input type="text" value={appInput} onChange={e => setAppInput(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" maxLength={MAX_CAPACITY} /></label>
                                <button onClick={handleReverseString} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Run Reversal</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}

                                {/* Output Box */}
                                <div className="mt-2">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Output</span>
                                    <div className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-2 text-sm text-green-400 font-mono min-h-[38px] flex items-center mt-1">
                                        {currentFrame.internalState.output || <span className="text-gray-600 italic text-xs">Waiting...</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Application: Balanced Parentheses */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'app_balanced_parentheses' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => setActiveOp(prev => prev === 'app_balanced_parentheses' ? null : 'app_balanced_parentheses')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'app_balanced_parentheses' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>data_object</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'app_balanced_parentheses' ? 'text-primary font-bold' : ''}`}>Balanced Parentheses</p></div>
                        </button>
                        {activeOp === 'app_balanced_parentheses' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Input String</span><input type="text" value={balancedInput} onChange={e => setBalancedInput(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" maxLength={MAX_CAPACITY} /></label>
                                <button onClick={handleBalancedParentheses} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Check Balance</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}

                                {/* Output Box */}
                                <div className="mt-2">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Result</span>
                                    <div className={`w-full bg-[#121121] border border-[#383564] rounded px-2 py-2 text-sm font-mono min-h-[38px] flex items-center mt-1 ${currentFrame.internalState.output === 'Valid' ? 'text-green-400' : currentFrame.internalState.output === 'Invalid' ? 'text-red-400' : 'text-gray-400'}`}>
                                        {currentFrame.internalState.output || <span className="text-gray-600 italic text-xs">Waiting...</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Application: Postfix Expression Evaluator */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'app_postfix_eval' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => setActiveOp(prev => prev === 'app_postfix_eval' ? null : 'app_postfix_eval')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'app_postfix_eval' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>calculate</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'app_postfix_eval' ? 'text-primary font-bold' : ''}`}>Postfix Evaluator</p></div>
                        </button>
                        {activeOp === 'app_postfix_eval' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">Expression</span><input type="text" value={postfixInput} onChange={e => setPostfixInput(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" placeholder="e.g. 5 3 + 2 *" /></label>
                                <button onClick={handlePostfixEval} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded">Evaluate</button>
                                {error && <div className="text-red-400 text-xs">{error}</div>}

                                {/* Output Box */}
                                <div className="mt-2">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Result</span>
                                    <div className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-2 text-sm text-green-400 font-mono min-h-[38px] flex items-center mt-1">
                                        {currentFrame.internalState.output || <span className="text-gray-600 italic text-xs">Waiting...</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Application: Browser History Simulator */}
                    <div className={`rounded-xl transition-all overflow-hidden ${activeOp === 'app_browser_history' ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' : ''}`}>
                        <button onClick={() => setActiveOp(prev => prev === 'app_browser_history' ? null : 'app_browser_history')} className="flex w-full items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group text-left">
                            <span className={`material-symbols-outlined ${activeOp === 'app_browser_history' ? 'text-primary filled' : 'text-gray-400 group-hover:text-primary'}`}>history</span>
                            <div><p className={`text-sm font-medium leading-none ${activeOp === 'app_browser_history' ? 'text-primary font-bold' : ''}`}>Browser History</p></div>
                        </button>
                        {activeOp === 'app_browser_history' && (
                            <div className="px-3 pb-4 pt-1 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                                <label><span className="text-[10px] text-gray-400 uppercase font-bold">New URL</span><input type="text" value={browserInput} onChange={e => setBrowserInput(e.target.value)} className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-1.5 text-sm text-white" placeholder="e.g. google.com" /></label>

                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={handleBrowserBack} className="bg-[#272546] hover:bg-[#383564] text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">arrow_back</span> Back</button>
                                    <button onClick={handleBrowserForward} className="bg-[#272546] hover:bg-[#383564] text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1">Forward <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
                                </div>
                                <button onClick={handleBrowserVisit} className="w-full bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1">Visit Page</button>

                                {error && <div className="text-red-400 text-xs">{error}</div>}

                                {/* Output Box */}
                                <div className="mt-2">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Status</span>
                                    <div className="w-full bg-[#121121] border border-[#383564] rounded px-2 py-2 text-sm text-blue-400 font-mono min-h-[38px] flex items-center mt-1">
                                        {currentFrame.internalState.output || <span className="text-gray-600 italic text-xs">Ready</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
