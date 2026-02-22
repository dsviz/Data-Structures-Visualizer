import React, { useState, useEffect } from 'react';
import { Frame } from '../../hooks/useTreeVisualizer';
import { Dropdown } from '../ui/Dropdown';

interface TreeAction {
    id: string;
    label: string;
    action: () => void;
    inputRequired?: boolean;
    needsTwoInputs?: boolean;
}

interface TreeCategory {
    id: string;
    label: string;
    actions: TreeAction[];
}

interface TreeControlsProps {
    // --- Basics ---
    insert: (val: number) => void;
    deleteNode: (val: number) => void;
    search: (val: number) => void;
    generateRandomTree: () => void;

    // --- Traversal ---
    traverse: (type: 'inorder' | 'preorder' | 'postorder' | 'bfs') => void;
    traverseZigZag: () => void;

    // --- BST Ops ---
    findMin: () => void;
    findMax: () => void;
    findSuccessor: (val: number) => void;
    findPredecessor: (val: number) => void;
    validateBST: () => void;

    // --- Properties ---
    checkHeight: () => void;
    countNodes: () => void;
    countLeafNodes: () => void;
    checkDiameter: () => void;
    checkBalanced: () => void;
    isFull: () => void;
    isComplete: () => void;

    // --- Construction ---
    buildFromArray: (input: string) => void;
    buildFromPreIn: (pre: string, inOrder: string) => void;
    buildFromPostIn: (post: string, inOrder: string) => void;
    buildBalancedBST: (input: string) => void;
    deserialize: (input: string) => void;

    // --- Balancing ---
    insertAVL: (val: number) => void;
    deleteAVL: (val: number) => void;
    rotateLeft: (val: number) => void;
    rotateRight: (val: number) => void;
    showBalanceFactors: () => void;

    // --- Special ---
    findLCA: (v1: number, v2: number) => void;
    getLeftView: () => void;
    getRightView: () => void;
    getTopView: () => void;
    getBottomView: () => void;
    boundaryTraversal: () => void;
    mirrorTree: () => void;

    // --- Common ---
    reset: () => void;
    clear: () => void;
    handleExample: () => void;

    isPlaying: boolean;
    frames: Frame[];
    currentStep: number;
}

export const TreeControls: React.FC<TreeControlsProps> = (props) => {
    const [inputValue, setInputValue] = useState<string>('50');
    const [secondInputValue, setSecondInputValue] = useState<string>('30');
    const [selectedCategory, setSelectedCategory] = useState<string>('Basics');
    const [selectedActionId, setSelectedActionId] = useState<string>('');

    const CATEGORIES: TreeCategory[] = [
        {
            id: 'Basics',
            label: 'Basics / Fundamental',
            actions: [
                { id: 'insert', label: 'Insert Node', action: () => props.insert(parseInt(inputValue)), inputRequired: true },
                { id: 'delete', label: 'Delete Node', action: () => props.deleteNode(parseInt(inputValue)), inputRequired: true },
                { id: 'search', label: 'Search Node', action: () => props.search(parseInt(inputValue)), inputRequired: true },
                { id: 'random', label: 'Generate Random Tree', action: props.generateRandomTree },
            ]
        },
        {
            id: 'Traversal',
            label: 'Tree Traversal',
            actions: [
                { id: 'inorder', label: 'In-order Traversal', action: () => props.traverse('inorder') },
                { id: 'preorder', label: 'Pre-order Traversal', action: () => props.traverse('preorder') },
                { id: 'postorder', label: 'Post-order Traversal', action: () => props.traverse('postorder') },
                { id: 'bfs', label: 'Level Order (BFS)', action: () => props.traverse('bfs') },
                { id: 'zigzag', label: 'Zig-Zag Traversal', action: props.traverseZigZag },
            ]
        },
        {
            id: 'BST',
            label: 'Binary Search Tree',
            actions: [
                { id: 'min', label: 'Find Minimum', action: props.findMin },
                { id: 'max', label: 'Find Maximum', action: props.findMax },
                { id: 'successor', label: 'Find Successor', action: () => props.findSuccessor(parseInt(inputValue)), inputRequired: true },
                { id: 'predecessor', label: 'Find Predecessor', action: () => props.findPredecessor(parseInt(inputValue)), inputRequired: true },
                { id: 'validate', label: 'Validate BST', action: props.validateBST },
            ]
        },
        {
            id: 'Properties',
            label: 'Analyze Properties',
            actions: [
                { id: 'height', label: 'Calculate Height', action: props.checkHeight },
                { id: 'count_nodes', label: 'Total Nodes Count', action: props.countNodes },
                { id: 'count_leaves', label: 'Leaf Nodes Count', action: props.countLeafNodes },
                { id: 'diameter', label: 'Tree Diameter', action: props.checkDiameter },
                { id: 'balanced', label: 'Check If Balanced', action: props.checkBalanced },
                { id: 'full', label: 'Check If Full', action: props.isFull },
                { id: 'complete', label: 'Check If Complete', action: props.isComplete },
            ]
        },
        {
            id: 'Construction',
            label: 'Construct Tree',
            actions: [
                { id: 'from_array', label: 'Build From Array', action: () => props.buildFromArray(inputValue), inputRequired: true },
                { id: 'pre_in', label: 'From Pre + Inorder', action: () => props.buildFromPreIn(inputValue, secondInputValue), inputRequired: true, needsTwoInputs: true },
                { id: 'post_in', label: 'From Post + Inorder', action: () => props.buildFromPostIn(inputValue, secondInputValue), inputRequired: true, needsTwoInputs: true },
                { id: 'balanced_bst', label: 'Balanced BST', action: () => props.buildBalancedBST(inputValue), inputRequired: true },
                { id: 'deserialize', label: 'Deserialize Level Order', action: () => props.deserialize(inputValue), inputRequired: true },
            ]
        },
        {
            id: 'Balancing',
            label: 'AVL & Balancing',
            actions: [
                { id: 'insert_avl', label: 'Insert AVL Node', action: () => props.insertAVL(parseInt(inputValue)), inputRequired: true },
                { id: 'delete_avl', label: 'Delete AVL Node', action: () => props.deleteAVL(parseInt(inputValue)), inputRequired: true },
                { id: 'rotate_left', label: 'Rotate Left At Node', action: () => props.rotateLeft(parseInt(inputValue)), inputRequired: true },
                { id: 'rotate_right', label: 'Rotate Right At Node', action: () => props.rotateRight(parseInt(inputValue)), inputRequired: true },
                { id: 'balance_factors', label: 'Show Balance Factors', action: props.showBalanceFactors },
            ]
        },
        {
            id: 'Special',
            label: 'Advanced Views',
            actions: [
                { id: 'lca', label: 'Lowest Common Ancestor', action: () => props.findLCA(parseInt(inputValue), parseInt(secondInputValue)), inputRequired: true, needsTwoInputs: true },
                { id: 'left_view', label: 'Get Left View', action: props.getLeftView },
                { id: 'right_view', label: 'Get Right View', action: props.getRightView },
                { id: 'top_view', label: 'Get Top View', action: props.getTopView },
                { id: 'bottom_view', label: 'Get Bottom View', action: props.getBottomView },
                { id: 'boundary', label: 'Boundary Traversal', action: props.boundaryTraversal },
                { id: 'mirror', label: 'Mirror Tree', action: props.mirrorTree },
            ]
        },
    ];

    const currentCategory = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];
    const currentAction = currentCategory.actions.find(a => a.id === selectedActionId) || currentCategory.actions[0];
    const inputRequired = currentAction?.inputRequired;
    const needsTwoInputs = currentAction?.needsTwoInputs;

    useEffect(() => {
        const cat = CATEGORIES.find(c => c.id === selectedCategory);
        if (cat && cat.actions.length > 0) {
            setSelectedActionId(cat.actions[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    const handleRun = () => {
        if (currentAction) {
            currentAction.action();
        }
    };

    return (
        <div className="flex flex-col gap-5 h-full overflow-y-auto pr-2 custom-scrollbar">

            {/* Selection Area */}
            <div className="space-y-4">
                {/* Category Dropdown */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Category</label>
                    <Dropdown
                        value={selectedCategory}
                        onChange={(val) => setSelectedCategory(val)}
                        options={CATEGORIES.map(cat => ({ value: cat.id, label: cat.label }))}
                    />
                </div>

                {/* Algorithm/Action Dropdown */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Action</label>
                    <Dropdown
                        value={selectedActionId}
                        onChange={(val) => setSelectedActionId(val)}
                        options={currentCategory.actions.map(action => ({ value: action.id, label: action.label }))}
                    />
                </div>

                {/* Input Area */}
                {inputRequired && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Input</label>
                        <div className="flex gap-2 bg-gray-50 dark:bg-[#121121] p-2.5 rounded-lg border border-gray-200 dark:border-[#272546] shadow-inner">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="flex-1 min-w-0 bg-transparent text-sm font-mono outline-none dark:text-gray-200 placeholder:text-gray-400 text-center"
                                placeholder="Value 1"
                            />
                            {needsTwoInputs && (
                                <>
                                    <div className="w-px bg-gray-300 dark:bg-[#272546]"></div>
                                    <input
                                        type="text"
                                        value={secondInputValue}
                                        onChange={(e) => setSecondInputValue(e.target.value)}
                                        className="flex-1 min-w-0 bg-transparent text-sm font-mono outline-none dark:text-gray-200 placeholder:text-gray-400 text-center"
                                        placeholder="Value 2"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Standardized Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={props.handleExample}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-[13px] font-bold transition-all shadow-sm group"
                    >
                        <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">auto_fix</span>
                        Example
                    </button>

                    <button
                        onClick={handleRun}
                        disabled={props.isPlaying}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[13px] font-bold transition-all shadow-md shadow-indigo-500/20"
                    >
                        <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                        Run
                    </button>
                </div>
            </div>

            {/* Output Section */}
            {props.frames[props.currentStep]?.output && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#9794c7]">Output</label>
                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 shadow-sm">
                        <p className="text-sm font-mono text-indigo-700 dark:text-indigo-300 break-words leading-relaxed font-bold">
                            {props.frames[props.currentStep].output}
                        </p>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-[#272546] space-y-2">
                <button
                    onClick={props.clear}
                    className="w-full py-2.5 px-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="material-symbols-outlined text-[16px] group-hover:rotate-180 transition-transform duration-500">cleaning_services</span>
                    Clear Canvas
                </button>
            </div>
        </div>
    );
};


