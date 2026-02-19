import React from 'react';
import { PSEUDOCODE, CODE_CPP, COMPLEXITY, Operation } from '../../hooks/useQueueVisualizer';

interface QueueTabsProps {
    activeTab: 'code' | 'pseudo' | 'info';
    activeOp: Operation;
    currentFrame: any;
}

export const QueueTabs: React.FC<QueueTabsProps> = ({ activeTab, activeOp, currentFrame }) => {
    const currentComplexity = activeOp ? COMPLEXITY[activeOp] : COMPLEXITY['enqueue'];
    const currentPseudocode = activeOp ? PSEUDOCODE[activeOp] : [];

    if (activeTab === 'code') {
        return (
            <div className="flex flex-col gap-2 h-full">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Implementation</h3>
                <div className="bg-[#121121] border border-[#383564] rounded-lg p-3 overflow-auto flex-1 font-mono text-xs text-gray-300">
                    <pre>{CODE_CPP}</pre>
                </div>
            </div>
        );
    }

    if (activeTab === 'pseudo') {
        return (
            <div className="flex flex-col gap-2 h-full">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Pseudocode</h3>
                <div className="bg-[#121121] border border-[#383564] rounded-lg p-4 font-mono text-xs text-gray-400">
                    <div className="space-y-1">
                        {currentPseudocode.map((line: string, idx: number) => (
                            <p key={idx} className={`px-2 py-1 -mx-2 rounded border-l-2 transition-colors ${idx === currentFrame.codeLine ? 'text-primary dark:text-white bg-primary/10 dark:bg-primary/20 border-primary' : 'border-transparent'}`}>
                                {idx + 1}. {line}
                            </p>
                        ))}
                        {currentPseudocode.length === 0 && <span className="text-gray-500 italic">Select an operation to see logic...</span>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Complexity Section */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Complexity</h3>
                <div className="bg-white/5 dark:bg-[#1c1a32]/50 border border-gray-200 dark:border-[#383564] rounded-xl p-4 text-xs font-mono text-gray-400">
                    <div className="flex justify-between border-b border-white/10 pb-2 mb-2"><span className="text-white font-bold uppercase">{activeOp || 'QUEUE'}</span><span className="text-primary">{currentComplexity.avg}</span></div>
                    <div className="space-y-1">
                        <div className="flex justify-between"><span>Best</span><span className="text-emerald-400">{currentComplexity.best}</span></div>
                        <div className="flex justify-between"><span>Avg</span><span className="text-amber-400">{currentComplexity.avg}</span></div>
                        <div className="flex justify-between"><span>Worst</span><span className="text-rose-400">{currentComplexity.worst}</span></div>
                        <div className="flex justify-between border-t border-white/10 pt-1 mt-1"><span>Space</span><span className="text-blue-400">{currentComplexity.space}</span></div>
                    </div>
                </div>
            </div>

            {/* Internal State Section */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Internal State</h3>
                <div className="bg-white/5 dark:bg-[#1c1a32]/50 border border-gray-200 dark:border-[#383564] rounded-xl p-4 text-xs font-mono text-gray-400">
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                            <span>Capacity</span>
                            <span className="text-primary font-bold">{currentFrame.internalState.capacity}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                            <span>Size</span>
                            <span className="text-slate-900 dark:text-white font-bold">{currentFrame.internalState.size}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                            <span>Front Index</span>
                            <span className="text-slate-900 dark:text-white font-bold">{currentFrame.internalState.front}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1">
                            <span>Rear Index</span>
                            <span className="text-slate-900 dark:text-white font-bold">{currentFrame.internalState.rear}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Op</span>
                            <span className="text-orange-400 font-bold uppercase">{currentFrame.internalState.currentOp}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
