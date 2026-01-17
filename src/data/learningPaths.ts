
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
        alt: 'Abstract Sorting Bars Pattern'
    },
    {
        title: 'Linked Lists',
        path: '/linked-list',
        description: 'Singly, Doubly, Circular, Stack, Queue',
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
        alt: 'Abstract Chain Link Pattern'
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
        alt: 'Abstract Key Value Grid Pattern'
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
        alt: 'Abstract Tree Branching Pattern'
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
        alt: 'Abstract Network Nodes Pattern'
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
        alt: 'Abstract Infinite Loop Pattern'
    },
    {
        title: 'Backtracking',
        path: '/backtracking',
        description: "N-Queens, Knight's Tour, Sudoku",
        category: ['Algorithms'],
        difficulty: 'Hard',
        count: 0,
        countLabel: 'Coming Soon',
        icon: 'undo',
        gradientFrom: 'from-slate-800',
        gradientTo: 'to-slate-900',
        darkGradientFrom: '',
        darkGradientTo: '',
        iconColor: 'text-slate-400',
        darkIconColor: '',
        pattern: 'Abstract Maze Path Pattern',
        alt: 'Abstract Maze Path Pattern',
        isPlaceholder: true
    },
    {
        title: 'Dynamic Prog.',
        path: '/dp',
        description: 'Knapsack, Coin Change, LCS',
        category: ['Algorithms'],
        difficulty: 'Hard',
        count: 0,
        countLabel: 'Coming Soon',
        icon: 'memory',
        gradientFrom: 'from-blue-600/20',
        gradientTo: 'to-indigo-600/20',
        darkGradientFrom: '',
        darkGradientTo: '',
        iconColor: 'text-blue-400',
        darkIconColor: '',
        pattern: 'Abstract Optimized Path Pattern',
        alt: 'Abstract Optimized Path Pattern',
        isPlaceholder: true
    }
];
