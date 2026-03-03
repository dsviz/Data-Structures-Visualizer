import React, { useState } from 'react';
import { Frame } from '../../hooks/useGraphVisualizer';
import { GRAPH_CODE, Language } from '../../data/GraphCode';
import { GRAPH_INFO } from '../../data/GraphInfo';

interface GraphTabsProps {
    currentFrame: Frame;
    codeLanguage: Language;
    setCodeLanguage: (lang: Language) => void;
    activeAlgorithm: string | null;
    getNodeLabel: (id: number) => string;
    isPlaying: boolean;
    isGeneratingNarration: boolean;
}

export const GraphTabs: React.FC<GraphTabsProps> = ({
    currentFrame,
    codeLanguage,
    setCodeLanguage,
    activeAlgorithm,
    getNodeLabel,
    isPlaying,
    isGeneratingNarration
}) => {
    const [activeTab, setActiveTab] = useState<'output' | 'pseudo' | 'code' | 'info'>('output');

    // Auto-open output tab when an algorithm starts playing
    React.useEffect(() => {
        if (isPlaying || activeAlgorithm || isGeneratingNarration) {
            setActiveTab('output');
        }
    }, [isPlaying, activeAlgorithm, isGeneratingNarration]);

    return (
        <div className="flex flex-col h-full">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 dark:border-[#272546]">
                <button
                    onClick={() => setActiveTab('output')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'output' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    Output
                </button>
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
                        )) : <div className="text-center italic text-gray-500 mt-4">Select an algorithm to view pseudocode.</div>}
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
                                if (!activeAlgorithm || !GRAPH_CODE[activeAlgorithm]) {
                                    return <div className="text-center italic text-gray-500 mt-4">No code available.</div>;
                                }
                                const codeData = GRAPH_CODE[activeAlgorithm][codeLanguage];
                                const activeLines = codeData.mapping[currentFrame.codeLine];
                                const activeLineIndices = Array.isArray(activeLines) ? activeLines : (activeLines !== undefined ? [activeLines] : []);

                                return codeData.lines.map((lineRaw, idx) => {
                                    return (
                                        <div key={idx} className={`px-2 py-1 -mx-2 rounded flex gap-3 transition-colors duration-200 ${activeLineIndices.includes(idx) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}>
                                            <span className="text-gray-300 dark:text-gray-600 select-none w-4 text-right">{idx + 1}</span>
                                            <span className="whitespace-pre">{lineRaw}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="p-4 space-y-6">
                        {activeAlgorithm && GRAPH_INFO[activeAlgorithm] ? (
                            <>
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Algorithm Description</h4>
                                    <div className="bg-white dark:bg-[#151426] p-3 rounded border border-gray-100 dark:border-[#272546] text-sm text-slate-700 dark:text-slate-300">
                                        {GRAPH_INFO[activeAlgorithm].description}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white dark:bg-[#151426] p-3 rounded border border-gray-100 dark:border-[#272546]">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Time Complexity</div>
                                        <div className="text-sm font-mono font-bold text-primary">{GRAPH_INFO[activeAlgorithm].timeComplexity}</div>
                                    </div>
                                    <div className="bg-white dark:bg-[#151426] p-3 rounded border border-gray-100 dark:border-[#272546]">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Space Complexity</div>
                                        <div className="text-sm font-mono font-bold text-indigo-500">{GRAPH_INFO[activeAlgorithm].spaceComplexity}</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center italic text-gray-500 mt-4">
                                Select an algorithm to view its details.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'output' && (
                    <div className="p-4 space-y-6">
                        {/* VISITED BOX */}
                        <div>
                            <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Visited</h4>
                            <div className="flex flex-wrap gap-2">
                                {currentFrame.visited && currentFrame.visited.length > 0 ? (
                                    currentFrame.visited.map((nodeId, idx) => (
                                        <div key={idx} className="w-8 h-8 rounded border border-green-500/30 bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-sm shadow-sm">
                                            {getNodeLabel(nodeId)}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-gray-400 italic">None</div>
                                )}
                            </div>
                        </div>

                        {/* QUEUE/STACK BOX */}
                        {(currentFrame.queue && currentFrame.queue.length > 0) || (currentFrame.stack && currentFrame.stack.length > 0) ? (
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">
                                    {currentFrame.queue?.length > 0 ? 'Queue (Front → Back)' : 'Stack (Top → Bottom)'}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {currentFrame.queue?.length > 0 && currentFrame.queue.map((nodeId, idx) => (
                                        <div key={idx} className="w-8 h-8 rounded border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm shadow-sm">
                                            {getNodeLabel(nodeId)}
                                        </div>
                                    ))}
                                    {currentFrame.stack?.length > 0 && currentFrame.stack.map((nodeId, idx) => (
                                        <div key={idx} className="w-8 h-8 rounded border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm shadow-sm">
                                            {getNodeLabel(nodeId)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* DISTANCES ARRAY BOX */}
                        {currentFrame.distances && Object.keys(currentFrame.distances).length > 0 && (
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Distances Array</h4>
                                <div className="bg-[#121121] dark:bg-[#151426] p-3 rounded-lg border border-gray-200 dark:border-[#272546] overflow-x-auto custom-scrollbar">
                                    <div className="flex gap-2 min-w-max">
                                        {Object.entries(currentFrame.distances).map(([nodeId, dist]) => (
                                            <div key={nodeId} className="flex flex-col items-center min-w-[3rem] bg-white dark:bg-[#1c1a32] rounded border border-gray-200 dark:border-[#34315b] overflow-hidden shadow-sm">
                                                <div className="w-full bg-gray-50 dark:bg-[#272546] text-center text-[10px] font-bold text-gray-500 py-1 border-b border-gray-200 dark:border-[#34315b]">
                                                    {getNodeLabel(parseInt(nodeId))}
                                                </div>
                                                <div className={`py-1.5 px-2 text-sm font-mono font-bold ${dist === 'Infinity' || dist === Infinity ? 'text-orange-400' : 'text-primary'}`}>
                                                    {dist === Infinity ? '∞' : dist}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2D DISTANCES MATRIX (Floyd-Warshall) */}
                        {currentFrame.distances2D && Object.keys(currentFrame.distances2D).length > 0 && (
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Distance Matrix</h4>
                                <div className="bg-[#121121] dark:bg-[#151426] p-3 rounded-lg border border-gray-200 dark:border-[#272546] overflow-x-auto custom-scrollbar">
                                    <table className="min-w-max border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="p-1 border border-transparent"></th>
                                                {Object.keys(currentFrame.distances2D).map((colId) => (
                                                    <th key={colId} className="p-1 text-[10px] font-bold text-gray-500 border border-transparent text-center">
                                                        {getNodeLabel(parseInt(colId))}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(currentFrame.distances2D).map(([rowId, cols]) => (
                                                <tr key={rowId}>
                                                    <td className="p-1 text-[10px] font-bold text-gray-500 border border-transparent text-right pr-3">
                                                        {getNodeLabel(parseInt(rowId))}
                                                    </td>
                                                    {Object.entries(cols).map(([colId, dist]) => (
                                                        <td key={colId} className="bg-white dark:bg-[#1c1a32] border border-gray-100 dark:border-[#272546] p-1.5 text-center min-w-[2.5rem]">
                                                            <span className={`text-xs font-mono font-bold ${dist === 'Infinity' || dist === Infinity ? 'text-orange-400' : 'text-primary'}`}>
                                                                {dist === Infinity ? '∞' : dist}
                                                            </span>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* GENERAL OUTPUT BOX */}
                        {currentFrame.output && (
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Algorithm Output</h4>
                                <div className="bg-[#121121] dark:bg-[#151426] p-3 rounded-lg border border-gray-200 dark:border-[#272546] text-sm text-gray-700 dark:text-gray-300 font-mono shadow-inner">
                                    {currentFrame.output}
                                </div>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!(currentFrame.visited?.length) && !(currentFrame.queue?.length) && !(currentFrame.stack?.length) && !(currentFrame.distances) && !(currentFrame.distances2D) && !currentFrame.output && (
                            <div className="text-center italic text-gray-500 mt-4">
                                Play the animation to see the execution state.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
