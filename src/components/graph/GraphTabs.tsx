import React, { useState } from 'react';
import { Frame } from '../../hooks/useGraphVisualizer';
import { GRAPH_CODE, Language } from '../../data/GraphCode';

interface GraphTabsProps {
    currentFrame: Frame;
    codeLanguage: Language;
    setCodeLanguage: (lang: Language) => void;
    activeAlgorithm: string | null;
    getNodeLabel: (id: number) => string;
}

export const GraphTabs: React.FC<GraphTabsProps> = ({
    currentFrame,
    codeLanguage,
    setCodeLanguage,
    activeAlgorithm,
    getNodeLabel
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
                        <div>
                            <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Description</h4>
                            <div className="bg-white dark:bg-[#151426] p-3 rounded border border-gray-100 dark:border-[#272546] text-sm text-slate-700 dark:text-slate-300">
                                {currentFrame.description || "Ready to run."}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white dark:bg-[#151426] p-2 rounded border border-gray-100 dark:border-[#272546]">
                                <div className="text-[10px] text-gray-500">Visited</div>
                                <div className="text-lg font-mono font-bold text-emerald-500">{currentFrame.visited ? currentFrame.visited.length : 0}</div>
                            </div>
                            <div className="bg-white dark:bg-[#151426] p-2 rounded border border-gray-100 dark:border-[#272546]">
                                <div className="text-[10px] text-gray-500">Queue/Stack</div>
                                <div className="text-lg font-mono font-bold text-primary">
                                    {activeAlgorithm === 'bfs' ? currentFrame.queue?.length : currentFrame.stack?.length || 0}
                                </div>
                            </div>
                        </div>

                        {currentFrame.distances && (
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Distances Array</h4>
                                <div className="bg-white dark:bg-[#151426] p-2 rounded border border-gray-100 dark:border-[#272546] overflow-x-auto">
                                    <div className="flex gap-2 min-w-max">
                                        {Object.entries(currentFrame.distances).map(([nodeId, dist]) => (
                                            <div key={nodeId} className="flex flex-col items-center bg-gray-50 dark:bg-[#1e1c33] rounded px-2 py-1 border border-gray-100 dark:border-gray-800 min-w-[40px]">
                                                <span className="text-[10px] text-gray-500 font-bold">{getNodeLabel(parseInt(nodeId))}</span>
                                                <span className={`font-mono font-bold text-sm ${dist !== Infinity && dist !== '∞' ? 'text-amber-500' : 'text-gray-400'}`}>{dist === Infinity ? '∞' : dist}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentFrame.distances2D && (
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Distance Matrix</h4>
                                <div className="bg-white dark:bg-[#151426] p-2 rounded border border-gray-100 dark:border-[#272546] overflow-x-auto">
                                    <table className="w-full text-xs text-center border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border-b border-r dark:border-gray-700/50 p-1 text-gray-500 border-gray-200">\</th>
                                                {Object.keys(currentFrame.distances2D).map(k => (
                                                    <th key={`th-${k}`} className="border-b dark:border-gray-700/50 border-gray-200 p-1 font-mono text-primary">{getNodeLabel(parseInt(k))}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(currentFrame.distances2D).map(([u, row]) => (
                                                <tr key={`tr-${u}`}>
                                                    <td className="border-r dark:border-gray-700/50 border-gray-200 p-1 font-mono text-primary font-bold">{getNodeLabel(parseInt(u))}</td>
                                                    {Object.entries(row).map(([v, val]) => (
                                                        <td key={`td-${u}-${v}`} className={`p-1 font-mono ${val !== Infinity && val !== '∞' ? 'text-slate-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>{val === Infinity ? '∞' : val}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
