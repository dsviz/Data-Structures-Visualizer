
import React, { useState } from 'react';
import { Frame } from '../../hooks/useLinkedListVisualizer';
import { Language, LINKED_LIST_CODE } from '../../data/LinkedListCode';

import { LINKED_LIST_INFO } from '../../data/LinkedListInfo';

interface LinkedListTabsProps {
    currentFrame: Frame;
    codeLanguage: Language;
    setCodeLanguage: (lang: Language) => void;
    isPlaying: boolean;
    isGeneratingNarration: boolean;
}

export const LinkedListTabs: React.FC<LinkedListTabsProps> = ({
    currentFrame, codeLanguage, setCodeLanguage, isPlaying, isGeneratingNarration
}) => {
    const [activeTab, setActiveTab] = useState<'output' | 'pseudo' | 'code' | 'info'>('output');

    // Auto-open output tab when an algorithm starts playing or is generating
    React.useEffect(() => {
        if (isPlaying || isGeneratingNarration || (currentFrame && currentFrame.opName && currentFrame.opName !== 'None')) {
            setActiveTab('output');
        }
    }, [isPlaying, isGeneratingNarration, currentFrame.opName]);

    return (
        <div className="flex flex-col h-full">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 dark:border-[#272546]">
                {(['output', 'pseudo', 'code', 'info'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-gray-300'}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/50 dark:bg-transparent custom-scrollbar">
                {activeTab === 'output' && (
                    <div className="p-4 space-y-6">
                        {/* VISITED / TRAVERSED BOX */}
                        <div>
                            <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Traversed Nodes
                            </h4>
                            <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-white dark:bg-[#151426] rounded-xl border border-gray-100 dark:border-[#272546] shadow-sm">
                                {currentFrame.visited && currentFrame.visited.length > 0 ? (
                                    currentFrame.visited.map((val, idx) => (
                                        <div key={idx} className="w-8 h-8 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center text-emerald-500 font-bold text-sm shadow-sm animate-in zoom-in-75">
                                            {val}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-gray-400 italic self-center w-full text-center">No nodes traversed yet</div>
                                )}
                            </div>
                        </div>

                        {/* GENERAL OUTPUT BOX */}
                        {currentFrame.output && (
                            <div className="animate-in fade-in slide-in-from-bottom-2">
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    Algorithm Output
                                </h4>
                                <div className="bg-[#121121] dark:bg-[#151426] p-4 rounded-xl border border-gray-200 dark:border-[#272546] text-sm text-indigo-700 dark:text-indigo-300 font-mono shadow-inner leading-relaxed">
                                    {currentFrame.output}
                                </div>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!(currentFrame.visited?.length) && !currentFrame.output && (
                            <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">monitoring</span>
                                <p className="text-xs italic text-gray-500">Execution output will appear here.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pseudo' && (
                    <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {currentFrame.pseudoLines && currentFrame.pseudoLines.length > 0 ? currentFrame.pseudoLines.map((line, idx) => (
                            <div key={idx} className={`px-2 py-1.5 rounded-md border-l-2 transition-all duration-200 flex gap-3 ${idx === currentFrame.codeLine ? 'bg-primary/10 text-primary dark:text-white border-primary font-bold shadow-sm translate-x-1' : 'border-transparent opacity-60'}`}>
                                <span className="opacity-30 select-none text-[10px] w-4 text-right">{idx}</span>
                                {line}
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">code_blocks</span>
                                <p className="text-xs italic text-gray-500">Select an operation to view pseudocode.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'code' && (
                    <div className="flex flex-col h-full">
                        <div className="p-2 border-b border-gray-100 dark:border-[#272546] flex gap-1 bg-white dark:bg-[#151426]">
                            {(['c', 'cpp', 'java', 'python'] as Language[]).map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setCodeLanguage(lang)}
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${codeLanguage === lang ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                >
                                    {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-y-auto space-y-0.5">
                            {(() => {
                                if (!currentFrame.opName || !LINKED_LIST_CODE[currentFrame.opName]) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                            <span className="material-symbols-outlined text-4xl mb-2">code</span>
                                            <p className="text-xs italic">Implementation code not available.</p>
                                        </div>
                                    );
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
                                        <div key={idx} className={`px-2 py-1 -mx-2 rounded flex gap-3 transition-all duration-200 ${activeLineIndices.includes(idx) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-500 font-bold' : 'border-l-2 border-transparent'}`}>
                                            <span className="text-gray-300 dark:text-gray-600 select-none w-4 text-right opacity-50">{idx + 1}</span>
                                            <span className="whitespace-pre">{line}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="p-4 space-y-6 animate-in fade-in duration-300">
                        {/* Algorithm Info Header (Like Graph) */}
                        {currentFrame.opName && LINKED_LIST_INFO[currentFrame.opName] ? (
                            <>
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2 tracking-widest">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        Algorithm Description
                                    </h4>
                                    <div className="bg-white dark:bg-[#151426] p-4 rounded-xl border border-gray-100 dark:border-[#272546] text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
                                        {LINKED_LIST_INFO[currentFrame.opName].description}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-[#151426] p-3 rounded-xl border border-gray-100 dark:border-[#272546] shadow-sm">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Time Complexity</div>
                                        <div className="text-xs font-mono font-bold text-primary">{LINKED_LIST_INFO[currentFrame.opName].timeComplexity}</div>
                                    </div>
                                    <div className="bg-white dark:bg-[#151426] p-3 rounded-xl border border-gray-100 dark:border-[#272546] shadow-sm">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Space Complexity</div>
                                        <div className="text-xs font-mono font-bold text-indigo-500">{LINKED_LIST_INFO[currentFrame.opName].spaceComplexity}</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center italic text-gray-500 py-4 text-xs">
                                Select an operation to view its details.
                            </div>
                        )}

                        {/* Internal State (Retained as requested) */}
                        <div className="pt-4 border-t border-gray-100 dark:border-[#272546]">
                            <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2 tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                Internal State
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-[#151426] p-3 rounded-xl border border-gray-100 dark:border-[#272546] shadow-sm group">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Size</div>
                                    <div className="text-lg font-mono font-bold text-primary group-hover:scale-105 transition-transform origin-left">{currentFrame.nodes.length}</div>
                                </div>
                                <div className="bg-white dark:bg-[#151426] p-3 rounded-xl border border-gray-100 dark:border-[#272546] shadow-sm group">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Head Value</div>
                                    <div className="text-lg font-mono font-bold text-emerald-500 group-hover:scale-105 transition-transform origin-left">{currentFrame.nodes.length > 0 ? currentFrame.nodes[0].val : 'None'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
