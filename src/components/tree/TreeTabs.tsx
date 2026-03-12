import React, { useState } from 'react';
import { Frame } from '../../hooks/useTreeVisualizer';
import { TREE_CODE, Language } from '../../data/TreeCode';

interface ComplexityEntry {
    time: string;
    space: string;
    best?: string;
    avg?: string;
    worst?: string;
    note?: string;
}

const TREE_COMPLEXITY: Record<string, ComplexityEntry> = {
    // BST core
    insert:           { best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)', time: 'O(log n)', space: 'O(1)', note: 'Worst case on unbalanced / skewed tree' },
    delete:           { best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)', time: 'O(log n)', space: 'O(1)', note: 'Worst case on unbalanced tree' },
    search:           { best: 'O(1)',     avg: 'O(log n)', worst: 'O(n)', time: 'O(log n)', space: 'O(1)', note: 'Worst case on skewed tree' },
    // Traversals
    inorder:          { time: 'O(n)', space: 'O(h)', note: 'h = height; O(n) worst for skewed, O(log n) for balanced' },
    preorder:         { time: 'O(n)', space: 'O(h)' },
    postorder:        { time: 'O(n)', space: 'O(h)' },
    bfs:              { time: 'O(n)', space: 'O(w)', note: 'w = max width of tree' },
    zigzag:           { time: 'O(n)', space: 'O(w)' },
    // BST queries
    findMin:          { time: 'O(h)', space: 'O(1)', note: 'Leftmost node traversal' },
    findMax:          { time: 'O(h)', space: 'O(1)', note: 'Rightmost node traversal' },
    successor:        { time: 'O(h)', space: 'O(1)' },
    predecessor:      { time: 'O(h)', space: 'O(1)' },
    lca:              { time: 'O(h)', space: 'O(1)', note: 'Lowest Common Ancestor' },
    // Tree properties
    validate:         { time: 'O(n)', space: 'O(h)', note: 'Validate BST property' },
    height:           { time: 'O(n)', space: 'O(h)' },
    count:            { time: 'O(n)', space: 'O(h)' },
    countLeaves:      { time: 'O(n)', space: 'O(h)' },
    diameter:         { time: 'O(n)', space: 'O(h)' },
    balanced:         { time: 'O(n)', space: 'O(h)', note: 'Height-balanced check' },
    isFull:           { time: 'O(n)', space: 'O(h)' },
    isComplete:       { time: 'O(n)', space: 'O(n)' },
    // Views
    leftView:         { time: 'O(n)', space: 'O(h)' },
    rightView:        { time: 'O(n)', space: 'O(h)' },
    topView:          { time: 'O(n)', space: 'O(n)' },
    bottomView:       { time: 'O(n)', space: 'O(n)' },
    boundary:         { time: 'O(n)', space: 'O(h)' },
    mirror:           { time: 'O(n)', space: 'O(h)' },
    // Construction
    buildFromArray:   { time: 'O(n log n)', space: 'O(n)', note: 'n insertions into BST' },
    buildPreIn:       { time: 'O(n)', space: 'O(n)', note: 'Reconstruct from preorder + inorder' },
    buildPostIn:      { time: 'O(n)', space: 'O(n)', note: 'Reconstruct from postorder + inorder' },
    buildBalanced:    { time: 'O(n log n)', space: 'O(n)' },
    deserialize:      { time: 'O(n)', space: 'O(n)' },
    // AVL
    balanceFactors:   { time: 'O(n)', space: 'O(h)', note: 'Annotate all balance factors' },
    rotateLeft:       { time: 'O(1)', space: 'O(1)', note: 'Single left rotation' },
    rotateRight:      { time: 'O(1)', space: 'O(1)', note: 'Single right rotation' },
    insertAVL:        { best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)', time: 'O(log n)', space: 'O(log n)', note: 'Always balanced — guaranteed O(log n)' },
};

interface TreeTabsProps {
    currentFrame: Frame;
    codeLanguage: Language;
    setCodeLanguage: (lang: Language) => void;
    activeAlgorithm: string | null;
}

export const TreeTabs: React.FC<TreeTabsProps> = ({
    currentFrame,
    codeLanguage,
    setCodeLanguage,
    activeAlgorithm
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
                                if (!activeAlgorithm || !TREE_CODE[activeAlgorithm]) {
                                    return <div className="text-center italic text-gray-500 mt-4">No code available.</div>;
                                }
                                const codeData = TREE_CODE[activeAlgorithm][codeLanguage];
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
                    <div className="p-4 space-y-4">
                        {/* Complexity Cards */}
                        {activeAlgorithm && TREE_COMPLEXITY[activeAlgorithm] ? (() => {
                            const cx = TREE_COMPLEXITY[activeAlgorithm];
                            return (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] uppercase font-bold text-gray-400">Complexity</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 rounded-lg p-2.5 text-center">
                                            <div className="text-[9px] uppercase font-bold text-rose-400 mb-1 tracking-wider">Time</div>
                                            <div className="text-base font-black font-mono text-rose-600 dark:text-rose-400">{cx.time}</div>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-lg p-2.5 text-center">
                                            <div className="text-[9px] uppercase font-bold text-blue-400 mb-1 tracking-wider">Space</div>
                                            <div className="text-base font-black font-mono text-blue-600 dark:text-blue-400">{cx.space}</div>
                                        </div>
                                    </div>
                                    {(cx.best || cx.avg || cx.worst) && (
                                        <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg overflow-hidden">
                                            <table className="w-full text-xs">
                                                <tbody>
                                                    {cx.best && (
                                                        <tr className="border-b border-gray-100 dark:border-white/5">
                                                            <td className="px-3 py-2 text-emerald-500 font-bold uppercase text-[10px]">Best</td>
                                                            <td className="px-3 py-2 font-mono text-right text-gray-700 dark:text-gray-300">{cx.best}</td>
                                                        </tr>
                                                    )}
                                                    {cx.avg && (
                                                        <tr className="border-b border-gray-100 dark:border-white/5">
                                                            <td className="px-3 py-2 text-yellow-500 font-bold uppercase text-[10px]">Avg</td>
                                                            <td className="px-3 py-2 font-mono text-right text-gray-700 dark:text-gray-300">{cx.avg}</td>
                                                        </tr>
                                                    )}
                                                    {cx.worst && (
                                                        <tr>
                                                            <td className="px-3 py-2 text-rose-500 font-bold uppercase text-[10px]">Worst</td>
                                                            <td className="px-3 py-2 font-mono text-right text-gray-700 dark:text-gray-300">{cx.worst}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    {cx.note && (
                                        <p className="text-[10px] text-gray-400 italic leading-relaxed">{cx.note}</p>
                                    )}
                                </div>
                            );
                        })() : (
                            <div className="text-center italic text-gray-400 text-xs mt-4">Select an algorithm to view complexity.</div>
                        )}

                        {/* Traversal Output */}
                        {currentFrame.output !== undefined && (
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Traversal Output</h4>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded border border-indigo-100 dark:border-indigo-800 font-mono text-sm text-indigo-700 dark:text-indigo-300 break-words">
                                    {currentFrame.output || "..."}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};
