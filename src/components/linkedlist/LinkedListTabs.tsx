
import React, { useState } from 'react';
import { Frame, COMPLEXITY, Operation } from '../../hooks/useLinkedListVisualizer';
import { Language, LINKED_LIST_CODE } from '../../data/LinkedListCode';

interface LinkedListTabsProps {
    currentFrame: Frame;
    activeOp: Operation;
    codeLanguage: Language;
    setCodeLanguage: (lang: Language) => void;
}

export const LinkedListTabs: React.FC<LinkedListTabsProps> = ({
    currentFrame, activeOp, codeLanguage, setCodeLanguage
}) => {
    const [activeTab, setActiveTab] = useState<'pseudo' | 'code' | 'info'>('pseudo');

    return (
        <div className="flex flex-col h-full">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 dark:border-[#272546]">
                <button
                    onClick={() => setActiveTab('pseudo')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'pseudo' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    Pseudocode
                </button>
                <button
                    onClick={() => setActiveTab('code')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'code' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    Code
                </button>
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    Info
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/50 dark:bg-transparent">
                {activeTab === 'pseudo' && (
                    <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {currentFrame.pseudoLines && currentFrame.pseudoLines.length > 0 ? currentFrame.pseudoLines.map((line, idx) => (
                            <div key={idx} className={`px-2 py-1.5 rounded-sm border-l-2 transition-all ${idx === currentFrame.codeLine ? 'bg-primary/10 text-primary dark:text-white border-primary font-bold shadow-sm' : 'border-transparent opacity-80'}`}>
                                <span className="mr-3 select-none opacity-50">{idx}</span>
                                {line}
                            </div>
                        )) : <div className="text-center italic text-gray-500 mt-4">Select an operation to view pseudocode.</div>}
                    </div>
                )}

                {activeTab === 'code' && (
                    <div className="flex flex-col h-full">
                        <div className="p-2 border-b border-gray-100 dark:border-[#272546] flex gap-1 bg-white dark:bg-[#151426]">
                            {(['c', 'cpp', 'java', 'python'] as Language[]).map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setCodeLanguage(lang)}
                                    className={`flex-1 py-1 rounded text-[10px] font-bold uppercase ${codeLanguage === lang ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                >
                                    {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-y-auto space-y-0.5">
                            {(() => {
                                if (!currentFrame.opName || !LINKED_LIST_CODE[currentFrame.opName]) {
                                    return <div className="text-center italic text-gray-500 mt-4">No code available.</div>;
                                }
                                const codeData = LINKED_LIST_CODE[currentFrame.opName][codeLanguage];
                                const activeLines = codeData.mapping[currentFrame.codeLine];
                                const activeLineIndices = Array.isArray(activeLines) ? activeLines : (activeLines !== undefined ? [activeLines] : []);

                                return codeData.lines.map((lineRaw, idx) => {
                                    // Dynamic Value Replacement
                                    let line = lineRaw;
                                    if (currentFrame.opValues) {
                                        Object.entries(currentFrame.opValues).forEach(([key, val]) => {
                                            line = line.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val));
                                        });
                                    }

                                    return (
                                        <div key={idx} className={`px-2 py-1 -mx-2 rounded flex gap-3 transition-colors duration-200 ${activeLineIndices.includes(idx) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}>
                                            <span className="text-gray-300 dark:text-gray-600 select-none w-4 text-right">{idx + 1}</span>
                                            <span className="whitespace-pre">{line}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="p-4 space-y-6">
                        {/* Internal State */}
                        <div>
                            <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Internal State</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white dark:bg-[#151426] p-2 rounded border border-gray-100 dark:border-[#272546]">
                                    <div className="text-[10px] text-gray-500">Size</div>
                                    <div className="text-lg font-mono font-bold text-primary">{currentFrame.nodes.length}</div>
                                </div>
                                <div className="bg-white dark:bg-[#151426] p-2 rounded border border-gray-100 dark:border-[#272546]">
                                    <div className="text-[10px] text-gray-500">Head</div>
                                    <div className="text-lg font-mono font-bold text-primary">{currentFrame.nodes.length > 0 ? currentFrame.nodes[0] : 'null'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Complexity */}
                        <div>
                            <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Time Complexity</h4>
                            {currentFrame.opName && COMPLEXITY[currentFrame.opName as keyof typeof COMPLEXITY] ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-white dark:bg-[#151426] p-2 rounded border border-gray-100 dark:border-[#272546]">
                                        <span className="text-xs text-gray-500">Best Case</span>
                                        <span className="font-mono text-xs font-bold text-green-500">{COMPLEXITY[currentFrame.opName as keyof typeof COMPLEXITY].best}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-[#151426] p-2 rounded border border-gray-100 dark:border-[#272546]">
                                        <span className="text-xs text-gray-500">Average Case</span>
                                        <span className="font-mono text-xs font-bold text-yellow-500">{COMPLEXITY[currentFrame.opName as keyof typeof COMPLEXITY].avg}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-[#151426] p-2 rounded border border-gray-100 dark:border-[#272546]">
                                        <span className="text-xs text-gray-500">Worst Case</span>
                                        <span className="font-mono text-xs font-bold text-red-500">{COMPLEXITY[currentFrame.opName as keyof typeof COMPLEXITY].worst}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-500 italic">Select an operation to view complexity.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
