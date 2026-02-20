import React, { useState } from 'react';
import { Frame } from '../../hooks/useTreeVisualizer';

interface TreeAction {
    label: string;
    action: () => void;
    inputRequired?: boolean;
    color?: string; // Optional color override
}

interface TreeCategory {
    id: string;
    label: string;
    icon: string;
    description: string;
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

    isPlaying: boolean;
    frames: Frame[];
    currentStep: number;
}

export const TreeControls: React.FC<TreeControlsProps> = (props) => {
    const [inputValue, setInputValue] = useState<string>('50');
    const [secondInputValue, setSecondInputValue] = useState<string>('30'); // For logic needing 2 inputs like LCA
    const [selectedCategory, setSelectedCategory] = useState<string>('Basics');


    const handleAction = (action: any, needsInput: boolean = false, needsTwoInputs: boolean = false) => {
        if (needsInput) {
            // Check if input is a comma-separated list or complex string
            if (inputValue.includes(',')) {
                if (needsTwoInputs && secondInputValue.includes(',')) {
                    action(inputValue, secondInputValue);
                } else {
                    action(inputValue);
                }
                return;
            }

            const val = parseInt(inputValue);
            if (!isNaN(val)) {
                if (needsTwoInputs) {
                    const val2 = parseInt(secondInputValue);
                    if (!isNaN(val2)) action(val, val2);
                } else {
                    action(val);
                }
            } else {
                // Pass raw string if not a number (e.g. for traversals that take strings or complex inputs)
                if (needsTwoInputs) {
                    action(inputValue, secondInputValue);
                } else {
                    action(inputValue);
                }
            }
        } else {
            action();
        }
    };

    const CATEGORIES: TreeCategory[] = [
        {
            id: 'Basics',
            label: 'Basics',
            icon: 'grid_view',
            description: 'Core operations',
            actions: [
                { label: 'Insert Node', action: () => handleAction(props.insert, true), inputRequired: true },
                { label: 'Delete Node', action: () => handleAction(props.deleteNode, true), inputRequired: true, color: 'red' },
                { label: 'Search Node', action: () => handleAction(props.search, true), inputRequired: true },
                { label: 'Random Tree', action: props.generateRandomTree },
            ]
        },
        {
            id: 'Traversal',
            label: 'Traversal',
            icon: 'alt_route',
            description: 'Visit all nodes',
            actions: [
                { label: 'Inorder', action: () => props.traverse('inorder') },
                { label: 'Preorder', action: () => props.traverse('preorder') },
                { label: 'Postorder', action: () => props.traverse('postorder') },
                { label: 'Level Order', action: () => props.traverse('bfs') },
                { label: 'Zig-Zag', action: props.traverseZigZag },
            ]
        },
        {
            id: 'BST',
            label: 'BST',
            icon: 'account_tree',
            description: 'Binary Search Tree logic',
            actions: [
                { label: 'Find Min', action: props.findMin },
                { label: 'Find Max', action: props.findMax },
                { label: 'Successor', action: () => handleAction(props.findSuccessor, true), inputRequired: true },
                { label: 'Predecessor', action: () => handleAction(props.findPredecessor, true), inputRequired: true },
                { label: 'Validate BST', action: props.validateBST },
            ]
        },
        {
            id: 'Properties',
            label: 'Properties',
            icon: 'analytics',
            description: 'Analyze tree characteristics',
            actions: [
                { label: 'Height', action: props.checkHeight },
                { label: 'Count Nodes', action: props.countNodes },
                { label: 'Count Leaves', action: props.countLeafNodes },
                { label: 'Diameter', action: props.checkDiameter },
                { label: 'Is Balanced?', action: props.checkBalanced },
                { label: 'Is Full?', action: props.isFull },
                { label: 'Is Complete?', action: props.isComplete },
            ]
        },
        {
            id: 'Construction',
            label: 'Construct',
            icon: 'build',
            description: 'Build from data',
            actions: [
                { label: 'From Array', action: () => handleAction(props.buildFromArray, true), inputRequired: true },
                { label: 'Pre + Inorder', action: () => handleAction(props.buildFromPreIn, true, true), inputRequired: true },
                { label: 'Post + Inorder', action: () => handleAction(props.buildFromPostIn, true, true), inputRequired: true },
                { label: 'Balanced BST', action: () => handleAction(props.buildBalancedBST, true), inputRequired: true },
                { label: 'Deserialize', action: () => handleAction(props.deserialize, true), inputRequired: true },
            ]
        },
        {
            id: 'Balancing',
            label: 'Balancing',
            icon: 'balance',
            description: 'AVL & Rotations',
            actions: [
                { label: 'Insert AVL', action: () => handleAction(props.insertAVL, true), inputRequired: true },
                { label: 'Delete AVL', action: () => handleAction(props.deleteAVL, true), inputRequired: true, color: 'red' },
                { label: 'Rotate Left', action: () => handleAction(props.rotateLeft, true), inputRequired: true },
                { label: 'Rotate Right', action: () => handleAction(props.rotateRight, true), inputRequired: true },
                { label: 'Balance Factors', action: props.showBalanceFactors },
            ]
        },
        {
            id: 'Special',
            label: 'Special',
            icon: 'star',
            description: 'Advanced views & algorithms',
            actions: [
                { label: 'LCA', action: () => handleAction(props.findLCA, true, true), inputRequired: true }, // Needs 2 inputs? Handled specially
                { label: 'Left View', action: props.getLeftView },
                { label: 'Right View', action: props.getRightView },
                { label: 'Top View', action: props.getTopView },
                { label: 'Bottom View', action: props.getBottomView },
                { label: 'Boundary', action: props.boundaryTraversal },
                { label: 'Mirror Tree', action: props.mirrorTree },
            ]
        },
    ];

    const currentCategory = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];
    const showInput = currentCategory.actions.some(a => a.inputRequired);
    const showTwoInputs = (currentCategory.id === 'Special' && currentCategory.actions.some(a => a.label === 'LCA')) ||
        (currentCategory.id === 'Construction' && currentCategory.actions.some(a => a.label === 'Pre + Inorder'));




    return (
        <div className="flex flex-col gap-6 h-full text-zinc-800 dark:text-zinc-200 overflow-y-auto pr-2 custom-scrollbar">

            {/* Categories Grid */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat.id
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-white dark:bg-[#121121] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#272546] hover:bg-gray-50 dark:hover:bg-[#1a182e]'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Inputs Area - Only shown if needed */}
            {showInput && (
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Input</h3>
                    <div className="flex gap-2 bg-gray-100 dark:bg-[#121121] p-2 rounded-lg border border-gray-200 dark:border-[#272546]">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="flex-1 min-w-0 bg-transparent text-sm font-mono outline-none dark:text-gray-200 placeholder:text-gray-400 text-center"
                            placeholder="Value 1"
                        />
                        {/* Show second input if needed */}
                        {showTwoInputs && (
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

            {/* Actions Grid */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                    {currentCategory.actions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.action}
                            disabled={props.isPlaying}
                            className={`
                                h-10 flex items-center justify-center font-medium rounded-lg text-xs transition-colors relative overflow-hidden group px-4
                                ${action.color === 'red'
                                    ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            <span className="truncate">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Output Section */}
            {props.frames[props.currentStep]?.output && (
                <div className="space-y-2 mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Output</h3>
                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-sm font-mono text-indigo-700 dark:text-indigo-300 break-words">
                            {props.frames[props.currentStep].output}
                        </p>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={props.reset}
                    className="col-span-2 w-full py-2.5 px-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 text-xs font-medium transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform duration-500">refresh</span>
                    Reset
                </button>
            </div>
        </div>
    );
};

