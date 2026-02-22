import React, { useState, useEffect } from 'react';
import { Dropdown } from '../ui/Dropdown';
import { ListType, Frame } from '../../hooks/useLinkedListVisualizer';

interface LinkedListAction {
    id: string;
    label: string;
    action: () => void;
    needsValue?: boolean;
    needsIndex?: boolean;
    needsArrayInput?: boolean;
    disabled?: boolean;
}

interface LinkedListCategory {
    id: string;
    label: string;
    actions: LinkedListAction[];
}

export interface LinkedListControlsProps {
    listType: ListType;
    setListType: (type: ListType) => void;
    inputValue: string;
    setInputValue: (val: string) => void;
    inputIndex: string;
    setInputIndex: (val: string) => void;
    createInput: string;
    setCreateInput: (val: string) => void;
    error: string | null;
    runAction: (id: string) => void;
    handleExample: () => void;
    frames: Frame[];
    currentStep: number;
}

export const LinkedListControls: React.FC<LinkedListControlsProps> = ({
    listType, setListType,
    inputValue, setInputValue, inputIndex, setInputIndex, createInput, setCreateInput, error,
    runAction, handleExample,
    frames, currentStep
}) => {
    const currentFrame = frames[currentStep];

    const [selectedCategory, setSelectedCategory] = useState<string>('Basics');
    const [selectedActionId, setSelectedActionId] = useState<string>('');

    const CATEGORIES: LinkedListCategory[] = [
        {
            id: 'Basics',
            label: 'Basics / Fundamentals',
            actions: [
                { id: 'convertToArray', label: 'Convert to Array', action: () => runAction('convertToArray') }
            ]
        },
        {
            id: 'Traversal',
            label: 'Traversal Operations',
            actions: [
                { id: 'iterativeTraversal', label: 'Iterative Traversal', action: () => runAction('iterativeTraversal') },
                { id: 'recursiveTraversal', label: 'Recursive Traversal', action: () => runAction('recursiveTraversal') },
                { id: 'reverseTraversal', label: 'Reverse Traversal (Doubly)', action: () => runAction('reverseTraversal'), disabled: listType !== 'doubly' },
                { id: 'showLength', label: 'Show Length', action: () => runAction('showLength') },
                { id: 'findMiddle', label: 'Find Middle', action: () => runAction('findMiddle') }
            ]
        },
        {
            id: 'Insertion',
            label: 'Insertion Operations',
            actions: [
                { id: 'insertHead', label: 'Insert at Head', action: () => runAction('insertHead'), needsValue: true },
                { id: 'insertTail', label: 'Insert at Tail', action: () => runAction('insertTail'), needsValue: true },
                { id: 'insertPosition', label: 'Insert at Position', action: () => runAction('insertPosition'), needsValue: true, needsIndex: true },
                { id: 'insertAfterValue', label: 'Insert After Value', action: () => runAction('insertAfterValue'), needsValue: true, needsIndex: true },
                { id: 'insertBeforeValue', label: 'Insert Before Value', action: () => runAction('insertBeforeValue'), needsValue: true, needsIndex: true },
                { id: 'sortedInsert', label: 'Sorted Insert', action: () => runAction('sortedInsert'), needsValue: true }
            ]
        },
        {
            id: 'Deletion',
            label: 'Deletion Operations',
            actions: [
                { id: 'deleteHead', label: 'Delete Head', action: () => runAction('deleteHead') },
                { id: 'deleteTail', label: 'Delete Tail', action: () => runAction('deleteTail') },
                { id: 'deleteByValue', label: 'Delete by Value', action: () => runAction('deleteByValue'), needsValue: true },
                { id: 'deletePosition', label: 'Delete at Position', action: () => runAction('deletePosition'), needsIndex: true },
                { id: 'deleteAllOccurrences', label: 'Delete All Occurrences', action: () => runAction('deleteAllOccurrences'), needsValue: true },
                { id: 'deleteList', label: 'Delete List', action: () => runAction('deleteList') }
            ]
        },
        {
            id: 'Searching',
            label: 'Searching Operations',
            actions: [
                { id: 'linearSearch', label: 'Linear Search', action: () => runAction('linearSearch'), needsValue: true },
                { id: 'findNthNode', label: 'Find Nth Node', action: () => runAction('findNthNode'), needsIndex: true },
                { id: 'findNthFromEnd', label: 'Find Nth from End', action: () => runAction('findNthFromEnd'), needsIndex: true },
                { id: 'findMiddleNode', label: 'Find Middle Node', action: () => runAction('findMiddleNode') },
                { id: 'countOccurrences', label: 'Count Occurrences', action: () => runAction('countOccurrences'), needsValue: true }
            ]
        },
        {
            id: 'Advanced',
            label: 'Advanced Operations',
            actions: [
                { id: 'reverseList', label: 'Reverse List', action: () => runAction('reverseList') },
                { id: 'reverseInKGroups', label: 'Reverse in K Groups', action: () => runAction('reverseInKGroups'), needsValue: true },
                { id: 'detectCycle', label: 'Detect Cycle (Floyd)', action: () => runAction('detectCycle') },
                { id: 'removeCycle', label: 'Remove Cycle', action: () => runAction('removeCycle') },
                { id: 'mergeTwoLists', label: 'Merge Two Lists', action: () => runAction('mergeTwoLists') },
                { id: 'mergeSortList', label: 'Merge Sort List', action: () => runAction('mergeSortList') },
                { id: 'checkPalindrome', label: 'Check Palindrome', action: () => runAction('checkPalindrome') },
                { id: 'rotateList', label: 'Rotate List', action: () => runAction('rotateList'), needsIndex: true }
            ]
        },
        {
            id: 'Special',
            label: 'Special Algorithms',
            actions: [
                { id: 'intersectionPoint', label: 'Intersection Point', action: () => runAction('intersectionPoint') },
                { id: 'unionOfLists', label: 'Union of Lists', action: () => runAction('unionOfLists') },
                { id: 'cloneRandomList', label: 'Clone Random List', action: () => runAction('cloneRandomList') },
                { id: 'partitionList', label: 'Partition List', action: () => runAction('partitionList'), needsValue: true },
                { id: 'oddEvenRearrange', label: 'Odd Even Rearrange', action: () => runAction('oddEvenRearrange') },
                { id: 'swapNodesPairwise', label: 'Swap Nodes Pairwise', action: () => runAction('swapNodesPairwise') }
            ]
        },
    ];

    const currentCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);
    const actions = currentCategoryObj?.actions || [];
    const currentAction = actions.find(a => a.id === selectedActionId);

    // Auto-select first action when category changes
    useEffect(() => {
        if (actions.length > 0) {
            setSelectedActionId(actions[0].id);
        } else {
            setSelectedActionId('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    const handleRunAlgorithm = () => {
        if (currentAction && !currentAction.disabled) {
            currentAction.action();
        }
    };

    return (
        <div className="flex flex-col gap-5 h-full overflow-y-auto pr-2">

            {/* Config Box */}
            <div className="space-y-4">
                {/* List Type Selector */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">List Type</label>
                    <div className="bg-gray-100 dark:bg-[#121121] p-1 rounded-lg flex shadow-inner">
                        {(['singly', 'doubly', 'circular'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setListType(t)}
                                className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded transition-all ${listType === t ? 'bg-white dark:bg-[#2e2b52] text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Category</label>
                    <Dropdown
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={CATEGORIES.map(c => ({ value: c.id, label: c.label }))}
                    />
                </div>

                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Operation</label>
                    <Dropdown
                        value={selectedActionId}
                        onChange={setSelectedActionId}
                        options={actions.map(a => ({ value: a.id, label: a.label }))}
                    />
                </div>

                {/* Dynamic Inputs Area based on selected Action */}
                <div className="space-y-3 pt-2">
                    {currentAction?.needsArrayInput && (
                        <div className="space-y-1 animate-in fade-in zoom-in-95 duration-200">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7] ml-1">Comma-separated Values</label>
                            <input
                                type="text"
                                value={createInput}
                                onChange={e => setCreateInput(e.target.value)}
                                className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-700 dark:text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                                placeholder="e.g. 5, 10, 15, 20"
                                onKeyDown={(e) => e.key === 'Enter' && handleRunAlgorithm()}
                            />
                        </div>
                    )}

                    <div className="flex gap-2 w-full">
                        {currentAction?.needsValue && (
                            <div className="space-y-1 flex-1 animate-in fade-in zoom-in-95 duration-200">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7] ml-1">Value (K)</label>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-700 dark:text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all text-center font-mono font-bold"
                                    placeholder="0"
                                    onKeyDown={(e) => e.key === 'Enter' && handleRunAlgorithm()}
                                />
                            </div>
                        )}
                        {currentAction?.needsIndex && (
                            <div className="space-y-1 flex-1 animate-in fade-in zoom-in-95 duration-200">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7] ml-1">Index / Target</label>
                                <input
                                    type="number"
                                    value={inputIndex}
                                    onChange={e => setInputIndex(e.target.value)}
                                    className="w-full bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-700 dark:text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all text-center font-mono font-bold"
                                    placeholder="0"
                                    onKeyDown={(e) => e.key === 'Enter' && handleRunAlgorithm()}
                                />
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
                            onClick={handleRunAlgorithm}
                            disabled={currentAction?.disabled}
                            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-[13px] font-bold transition-all shadow-md shadow-indigo-500/20 ${currentAction?.disabled ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{currentAction?.disabled ? 'block' : 'play_arrow'}</span>
                            Run
                        </button>
                    </div>

                    {error && (
                        <div className="p-2.5 text-xs text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg animate-in shake font-medium flex items-center gap-2 mt-2">
                            <span className="material-symbols-outlined text-[16px]">error</span>
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 mt-4"></div>

            {/* Output Bar and Data Structures */}
            {currentFrame && (
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#272546]">
                    {currentFrame.visited && currentFrame.visited.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Visited Array</label>
                            <div className="flex flex-wrap gap-1.5 mt-2 bg-white dark:bg-[#151426] p-2 rounded-xl border border-gray-100 dark:border-[#272546]">
                                {currentFrame.visited.map((v, i) => (
                                    <div key={i} className="size-6 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs rounded border border-emerald-200 dark:border-emerald-800">
                                        {v}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentFrame.output && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Output Log</label>
                            <div className="p-4 mt-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 shadow-sm">
                                <p className="text-sm font-mono text-indigo-700 dark:text-indigo-300 break-words leading-relaxed font-bold">
                                    {currentFrame.output}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
