import { LeetcodeTopic } from './LeetcodeProblems';

export type Category = 'All' | 'Sorting' | 'Trees' | 'Graphs' | 'Data Structures' | 'Algorithms';

export interface DashboardCard {
    title: string;
    path: string;
    description: string;
    category: Category[];
    difficulty: 'Easy' | 'Medium' | 'Hard';
    count: number;
    countLabel: string;
    icon: string;
    gradientFrom: string;
    gradientTo: string;
    darkGradientFrom: string;
    darkGradientTo: string;
    iconColor: string;
    darkIconColor: string;
    pattern: string;
    alt: string;
    isPlaceholder?: boolean;
    image?: string;
    imageBg?: string;
    topic?: LeetcodeTopic;
}

export const CATEGORIES: Category[] = ['All', 'Sorting', 'Trees', 'Graphs', 'Data Structures', 'Algorithms'];

export const DASHBOARD_CARDS: DashboardCard[] = [
    {
        title: 'Sorting',
        path: '/sorting',
        description: 'Bubble, Merge, Quick, Heap, Radix Sort',
        category: ['Algorithms', 'Sorting'],
        difficulty: 'Easy',
        count: 8,
        countLabel: 'Algorithms',
        icon: 'bar_chart',
        gradientFrom: 'from-indigo-500',
        gradientTo: 'to-purple-600',
        darkGradientFrom: 'dark:from-indigo-900/50',
        darkGradientTo: 'dark:to-purple-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-indigo-400',
        pattern: 'Abstract Sorting Bars Pattern',
        alt: 'Abstract Sorting Bars Pattern',
        image: '/sorting.gif',
        imageBg: 'bg-[#ffffff]',
        topic: 'sorting'
    },
    {
        title: 'Linked Lists',
        path: '/linked-list',
        description: 'Singly, Doubly, Circular Lists',
        category: ['Data Structures'],
        difficulty: 'Easy',
        count: 5,
        countLabel: 'Structures',
        icon: 'link',
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-cyan-500',
        darkGradientFrom: 'dark:from-blue-900/50',
        darkGradientTo: 'dark:to-cyan-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-cyan-400',
        pattern: 'Abstract Chain Link Pattern',
        alt: 'Abstract Chain Link Pattern',
        image: '/list.gif',
        imageBg: 'bg-[#ffffff]',
        topic: 'linked-list'
    },
    {
        title: 'Arrays',
        path: '/arrays',
        description: "Search, Insert, Delete, Kadane's",
        category: ['Data Structures'],
        difficulty: 'Easy',
        count: 4,
        countLabel: 'Concepts',
        icon: 'data_array',
        gradientFrom: 'from-pink-500',
        gradientTo: 'to-rose-500',
        darkGradientFrom: 'dark:from-pink-900/50',
        darkGradientTo: 'dark:to-rose-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-pink-400',
        pattern: 'Abstract Key Value Grid Pattern',
        alt: 'Abstract Key Value Grid Pattern',
        image: '/array.gif',
        imageBg: 'bg-[#f0f0f0]',
        topic: 'arrays'
    },
    {
        title: 'Stack',
        path: '/stack',
        description: 'LIFO Operations, Push, Pop, Peek',
        category: ['Data Structures'],
        difficulty: 'Easy',
        count: 3,
        countLabel: 'Operations',
        icon: 'layers',
        gradientFrom: 'from-amber-500',
        gradientTo: 'to-orange-600',
        darkGradientFrom: 'dark:from-amber-900/50',
        darkGradientTo: 'dark:to-orange-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-amber-400',
        pattern: 'Abstract Stack Layers',
        alt: 'Abstract Stack Layers',
        image: '/stack.gif',
        imageBg: 'bg-[#ffffff]',
        topic: 'stack'
    },
    {
        title: 'Queue',
        path: '/queue',
        description: 'FIFO Operations, Enqueue, Dequeue',
        category: ['Data Structures'],
        difficulty: 'Easy',
        count: 3,
        countLabel: 'Operations',
        icon: 'queue_segment',
        gradientFrom: 'from-sky-500',
        gradientTo: 'to-blue-600',
        darkGradientFrom: 'dark:from-sky-900/50',
        darkGradientTo: 'dark:to-blue-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-sky-400',
        pattern: 'Abstract Queue Line',
        alt: 'Abstract Queue Line',
        image: '/queue.gif',
        imageBg: 'bg-[#ffffff]',
        topic: 'queue'
    },
    {
        title: 'Binary Tree',
        path: '/trees',
        description: 'Insertion, Deletion, Traversal, AVL',
        category: ['Data Structures', 'Trees'],
        difficulty: 'Medium',
        count: 4,
        countLabel: 'Operations',
        icon: 'account_tree',
        gradientFrom: 'from-emerald-500',
        gradientTo: 'to-teal-500',
        darkGradientFrom: 'dark:from-emerald-900/50',
        darkGradientTo: 'dark:to-teal-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-emerald-400',
        pattern: 'Abstract Tree Branching Pattern',
        alt: 'Abstract Tree Branching Pattern',
        image: '/bst.gif',

        imageBg: 'bg-[#ffffff]'
    },
    {
        title: 'Graphs',
        path: '/graphs',
        description: 'BFS, DFS, Dijkstra, Prim, Kruskal',
        category: ['Algorithms', 'Graphs'],
        difficulty: 'Hard',
        count: 6,
        countLabel: 'Algorithms',
        icon: 'hub',
        gradientFrom: 'from-orange-500',
        gradientTo: 'to-red-500',
        darkGradientFrom: 'dark:from-orange-900/50',
        darkGradientTo: 'dark:to-red-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-orange-400',
        pattern: 'Abstract Network Nodes Pattern',
        alt: 'Abstract Network Nodes Pattern',
        image: '/graphds.gif',
        imageBg: 'bg-[#ffffff]',
        topic: 'graphs'
    },
    {
        title: 'Recursion',
        path: '/recursion',
        description: 'Fibonacci, Tower of Hanoi, Factorial',
        category: ['Algorithms'],
        difficulty: 'Hard',
        count: 3,
        countLabel: 'Algorithms',
        icon: 'all_inclusive',
        gradientFrom: 'from-violet-500',
        gradientTo: 'to-fuchsia-500',
        darkGradientFrom: 'dark:from-violet-900/50',
        darkGradientTo: 'dark:to-fuchsia-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-fuchsia-400',
        pattern: 'Abstract Infinite Loop Pattern',
        alt: 'Abstract Infinite Loop Pattern',
        image: '/recursion.gif',
        imageBg: 'bg-[#c8df82]',
        topic: 'recursion'
    },
    {
        title: 'Backtracking',
        path: '/leetcode?topic=backtracking',
        description: "N-Queens, Knight's Tour, Sudoku",
        category: ['Algorithms'],
        difficulty: 'Hard',
        count: 0,
        countLabel: 'Problems',
        icon: 'undo',
        gradientFrom: 'from-slate-700',
        gradientTo: 'to-slate-900',
        darkGradientFrom: 'dark:from-slate-800/50',
        darkGradientTo: 'dark:to-slate-950/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-slate-400',
        pattern: 'Abstract Maze Path Pattern',
        alt: 'Abstract Maze Path Pattern',
        topic: 'backtracking'
    },
    {
        title: 'Dynamic Prog.',
        path: '/leetcode?topic=dynamic-programming',
        description: 'Knapsack, Coin Change, LCS',
        category: ['Algorithms'],
        difficulty: 'Hard',
        count: 0,
        countLabel: 'Problems',
        icon: 'memory',
        gradientFrom: 'from-blue-600',
        gradientTo: 'to-indigo-700',
        darkGradientFrom: 'dark:from-blue-900/50',
        darkGradientTo: 'dark:to-indigo-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-blue-400',
        pattern: 'Abstract Optimized Path Pattern',
        alt: 'Abstract Optimized Path Pattern',
        topic: 'dynamic-programming'
    },
    {
        title: 'Heap',
        path: '/leetcode?topic=heap',
        description: 'Min Heap, Max Heap, Priority Queue',
        category: ['Data Structures'],
        difficulty: 'Medium',
        count: 0,
        countLabel: 'Problems',
        icon: 'storage',
        gradientFrom: 'from-yellow-500',
        gradientTo: 'to-amber-500',
        darkGradientFrom: 'dark:from-yellow-900/50',
        darkGradientTo: 'dark:to-amber-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-amber-400',
        pattern: 'Abstract Heap Structure',
        alt: 'Abstract Heap Structure',
        image: '/heap.gif',
        imageBg: 'bg-[#6fc9cc]',
        topic: 'heap'
    },
    {
        title: 'Hash Table',
        path: '/leetcode?topic=hash-table',
        description: 'Collision Resolution, Hashing',
        category: ['Data Structures'],
        difficulty: 'Medium',
        count: 0,
        countLabel: 'Problems',
        icon: 'tag',
        gradientFrom: 'from-cyan-500',
        gradientTo: 'to-teal-500',
        darkGradientFrom: 'dark:from-cyan-900/50',
        darkGradientTo: 'dark:to-teal-900/50',
        iconColor: 'text-white',
        darkIconColor: 'dark:text-teal-400',
        pattern: 'Abstract Hash Map',
        alt: 'Abstract Hash Map',
        image: '/hashtable.gif',
        imageBg: 'bg-[#eba964]',
        topic: 'hash-table'
    }
];
