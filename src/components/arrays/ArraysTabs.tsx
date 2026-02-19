import React, { useState } from 'react';
import { PSEUDOCODE, COMPLEXITY, Operation, SearchType } from '../../hooks/useArraysVisualizer';
import { ARRAYS_CODE } from '../../data/ArraysCode';

interface ArraysTabsProps {
    activeTab: 'code' | 'pseudo' | 'info';
    activeOp: Operation;
    searchType?: SearchType;
    currentFrame: any;
}

export const ArraysTabs: React.FC<ArraysTabsProps> = ({ activeTab, activeOp, searchType = 'linear', currentFrame }) => {
    // Determine active keys for data lookup
    const opKey = activeOp === 'search' ? searchType : (activeOp || 'insert');
    const complexityKey = activeOp === 'search' ? searchType : (activeOp || 'insert');

    // safe lookups
    const currentComplexity = COMPLEXITY[complexityKey] || COMPLEXITY['insert'];
    const currentPseudocode = PSEUDOCODE[opKey] || [];

    // Language state for Code Tab
    const [codeLanguage, setCodeLanguage] = useState<'c' | 'cpp' | 'java' | 'python'>('python');

    if (activeTab === 'code') {
        return (
            <div className="flex flex-col gap-2 h-full">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Implementation</h3>
                    <div className="flex bg-[#121121] rounded-md p-0.5 border border-[#383564]">
                        {(['c', 'cpp', 'java', 'python'] as const).map(lang => (
                            <button
                                key={lang}
                                onClick={() => setCodeLanguage(lang)}
                                className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${codeLanguage === lang ? 'bg-[#383564] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-[#121121] border border-[#383564] rounded-lg p-3 overflow-auto flex-1 font-mono text-xs text-gray-400 custom-scrollbar">
                    <div className="space-y-0.5">
                        {(() => {
                            // Map activeOp/searchType to ARRAYS_CODE keys
                            let codeOpKey = '';
                            if (activeOp === 'insert') codeOpKey = 'insert';
                            else if (activeOp === 'remove') codeOpKey = 'remove';
                            else if (activeOp === 'search') codeOpKey = searchType === 'binary' ? 'search_binary' : 'search_linear';
                            else if (activeOp === 'update') codeOpKey = 'update';
                            else if (activeOp === 'create') codeOpKey = 'create';

                            if (!codeOpKey || !ARRAYS_CODE[codeOpKey]) return <span className="text-gray-500 italic px-2">No code available.</span>;

                            const codeData = ARRAYS_CODE[codeOpKey][codeLanguage];
                            const activeLines = codeData.mapping[currentFrame.codeLine];
                            const activeLineIndices = Array.isArray(activeLines) ? activeLines : (activeLines !== undefined ? [activeLines] : []);

                            return codeData.lines.map((lineRaw: string, idx: number) => {
                                let line = lineRaw;
                                if (currentFrame.opValues) {
                                    Object.keys(currentFrame.opValues).forEach((key) => {
                                        const val = currentFrame.opValues![key];
                                        line = line.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val));
                                    });
                                }
                                return (
                                    <div key={idx} className={`px-2 py-0.5 -mx-2 rounded flex gap-3 transition-colors duration-200 ${activeLineIndices.includes(idx) ? 'bg-indigo-500/20 text-indigo-300 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}>
                                        <span className="text-gray-600 select-none w-4 text-right opacity-50">{idx + 1}</span>
                                        <span className="whitespace-pre">{line}</span>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'pseudo') {
        return (
            <div className="flex flex-col gap-2 h-full">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7] mb-2 pl-2">Pseudocode</h3>
                <div className="bg-[#121121] border border-[#383564] rounded-lg p-4 font-mono text-xs text-gray-400 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-1">
                        {currentPseudocode.length > 0 ? currentPseudocode.map((line: string, idx: number) => (
                            <p key={idx} className={`px-2 py-1 -mx-2 rounded border-l-2 transition-colors ${idx === currentFrame.codeLine ? 'text-primary dark:text-white bg-primary/10 dark:bg-primary/20 border-primary' : 'border-transparent'}`}>
                                <span className="mr-3 select-none opacity-30">{idx}</span>
                                {line}
                            </p>
                        )) : <span className="text-gray-500 italic">Select an operation to see logic...</span>}
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
                    <div className="flex justify-between border-b border-white/10 pb-2 mb-2"><span className="text-white font-bold uppercase">{opKey}</span><span className="text-primary">{currentComplexity.avg}</span></div>
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
