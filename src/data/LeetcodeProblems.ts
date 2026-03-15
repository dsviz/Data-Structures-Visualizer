export type LeetcodeTopic =
  | 'arrays'
  | 'linked-list'
  | 'stack'
  | 'queue'
  | 'trees'
  | 'graphs'
  | 'sorting'
  | 'recursion';

export type LeetcodeDifficulty = 'Easy' | 'Medium' | 'Hard';

export type SolutionLanguage =
  | 'py'
  | 'js'
  | 'ts'
  | 'java'
  | 'cpp'
  | 'go'
  | 'rs'
  | 'cs'
  | 'kt'
  | 'swift'
  | 'rb';

export interface LeetcodeProblem {
  id: number;
  title: string;
  slug: string;
  difficulty: LeetcodeDifficulty;
  topics: LeetcodeTopic[];
  tags: string[];
  visualizerPath?: string;
}



/** Returns a short readable label for each language */
export const LANGUAGE_LABELS: Record<SolutionLanguage, string> = {
  py: 'Python',
  js: 'JavaScript',
  ts: 'TypeScript',
  java: 'Java',
  cpp: 'C++',
  go: 'Go',
  rs: 'Rust',
  cs: 'C#',
  kt: 'Kotlin',
  swift: 'Swift',
  rb: 'Ruby',
};

export const ALL_LANGUAGES: SolutionLanguage[] = [
  'py', 'java', 'cpp', 'js', 'ts', 'go', 'rs', 'cs', 'kt', 'swift', 'rb',
];

/** Returns all problems related to a given visualizer data structure name */
export function getProblemsForTopic(topicKey: LeetcodeTopic): LeetcodeProblem[] {
  return LEETCODE_PROBLEMS.filter(p => p.topics.includes(topicKey));
}

/** Maps AI context store dataStructure names to LeetcodeTopic keys */
export const DS_TO_TOPIC: Record<string, LeetcodeTopic> = {
  'Array': 'arrays',
  'Linked List': 'linked-list',
  'Stack': 'stack',
  'Queue': 'queue',
  'Binary Tree': 'trees',
  'Graph': 'graphs',
  'Sorting': 'sorting',
  'Recursion': 'recursion',
};

/** Maps LeetcodeTopic keys to human-readable labels */
export const TOPIC_LABELS: Record<LeetcodeTopic, string> = {
  'arrays': 'Arrays',
  'linked-list': 'Linked List',
  'stack': 'Stack',
  'queue': 'Queue',
  'trees': 'Trees',
  'graphs': 'Graphs',
  'sorting': 'Sorting',
  'recursion': 'Recursion',
};

export const LEETCODE_PROBLEMS: LeetcodeProblem[] = [
  // ─── ARRAYS ──────────────────────────────────────────────────────────────────
  {
    id: 1, title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy',
    topics: ['arrays'], tags: ['Hash Table', 'Array'],
    visualizerPath: '/arrays',
  },
  {
    id: 11, title: 'Container With Most Water', slug: 'container-with-most-water', difficulty: 'Medium',
    topics: ['arrays'], tags: ['Two Pointers', 'Greedy'],
    visualizerPath: '/arrays',
  },
  {
    id: 15, title: '3Sum', slug: '3sum', difficulty: 'Medium',
    topics: ['arrays'], tags: ['Two Pointers', 'Sorting'],
    visualizerPath: '/arrays',
  },
  {
    id: 26, title: 'Remove Duplicates from Sorted Array', slug: 'remove-duplicates-from-sorted-array', difficulty: 'Easy',
    topics: ['arrays'], tags: ['Two Pointers'],
    visualizerPath: '/arrays',
  },
  {
    id: 33, title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', difficulty: 'Medium',
    topics: ['arrays'], tags: ['Binary Search'],
    visualizerPath: '/arrays',
  },
  {
    id: 42, title: 'Trapping Rain Water', slug: 'trapping-rain-water', difficulty: 'Hard',
    topics: ['arrays', 'stack'], tags: ['Two Pointers', 'Stack', 'DP'],
    visualizerPath: '/arrays',
  },
  {
    id: 48, title: 'Rotate Image', slug: 'rotate-image', difficulty: 'Medium',
    topics: ['arrays'], tags: ['Matrix'],
    visualizerPath: '/arrays',
  },
  {
    id: 49, title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'Medium',
    topics: ['arrays', 'sorting'], tags: ['Hash Table', 'String', 'Sorting'],
    visualizerPath: '/arrays',
  },
  {
    id: 53, title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'Medium',
    topics: ['arrays'], tags: ["Kadane's Algorithm", 'DP'],
    visualizerPath: '/arrays',
  },
  {
    id: 56, title: 'Merge Intervals', slug: 'merge-intervals', difficulty: 'Medium',
    topics: ['arrays', 'sorting'], tags: ['Sorting'],
    visualizerPath: '/arrays',
  },
  {
    id: 57, title: 'Insert Interval', slug: 'insert-interval', difficulty: 'Medium',
    topics: ['arrays'], tags: ['Array'],
    visualizerPath: '/arrays',
  },
  {
    id: 75, title: 'Sort Colors', slug: 'sort-colors', difficulty: 'Medium',
    topics: ['arrays', 'sorting'], tags: ['Two Pointers', 'Sorting'],
    visualizerPath: '/arrays',
  },
  {
    id: 88, title: 'Merge Sorted Array', slug: 'merge-sorted-array', difficulty: 'Easy',
    topics: ['arrays', 'sorting'], tags: ['Two Pointers', 'Sorting'],
    visualizerPath: '/arrays',
  },
  {
    id: 121, title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy',
    topics: ['arrays'], tags: ['DP', 'Sliding Window'],
    visualizerPath: '/arrays',
  },
  {
    id: 152, title: 'Maximum Product Subarray', slug: 'maximum-product-subarray', difficulty: 'Medium',
    topics: ['arrays'], tags: ['DP'],
    visualizerPath: '/arrays',
  },
  {
    id: 153, title: 'Find Minimum in Rotated Sorted Array', slug: 'find-minimum-in-rotated-sorted-array', difficulty: 'Medium',
    topics: ['arrays'], tags: ['Binary Search'],
    visualizerPath: '/arrays',
  },
  {
    id: 169, title: 'Majority Element', slug: 'majority-element', difficulty: 'Easy',
    topics: ['arrays'], tags: ['Boyer-Moore Voting', 'Hash Table'],
    visualizerPath: '/arrays',
  },
  {
    id: 189, title: 'Rotate Array', slug: 'rotate-array', difficulty: 'Medium',
    topics: ['arrays'], tags: ['Two Pointers'],
    visualizerPath: '/arrays',
  },
  {
    id: 217, title: 'Contains Duplicate', slug: 'contains-duplicate', difficulty: 'Easy',
    topics: ['arrays'], tags: ['Hash Table', 'Sorting'],
    visualizerPath: '/arrays',
  },
  {
    id: 238, title: 'Product of Array Except Self', slug: 'product-of-array-except-self', difficulty: 'Medium',
    topics: ['arrays'], tags: ['Prefix Sum'],
    visualizerPath: '/arrays',
  },
  {
    id: 268, title: 'Missing Number', slug: 'missing-number', difficulty: 'Easy',
    topics: ['arrays'], tags: ['Bit Manipulation', 'Math'],
    visualizerPath: '/arrays',
  },

  // ─── LINKED LIST ─────────────────────────────────────────────────────────────
  {
    id: 2, title: 'Add Two Numbers', slug: 'add-two-numbers', difficulty: 'Medium',
    topics: ['linked-list'], tags: ['Math', 'Recursion'],
    visualizerPath: '/linked-list',
  },
  {
    id: 19, title: 'Remove Nth Node From End of List', slug: 'remove-nth-node-from-end-of-list', difficulty: 'Medium',
    topics: ['linked-list'], tags: ['Two Pointers'],
    visualizerPath: '/linked-list',
  },
  {
    id: 21, title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'Easy',
    topics: ['linked-list'], tags: ['Recursion'],
    visualizerPath: '/linked-list',
  },
  {
    id: 23, title: 'Merge k Sorted Lists', slug: 'merge-k-sorted-lists', difficulty: 'Hard',
    topics: ['linked-list'], tags: ['Divide & Conquer', 'Heap'],
    visualizerPath: '/linked-list',
  },
  {
    id: 24, title: 'Swap Nodes in Pairs', slug: 'swap-nodes-in-pairs', difficulty: 'Medium',
    topics: ['linked-list'], tags: ['Recursion'],
    visualizerPath: '/linked-list',
  },
  {
    id: 61, title: 'Rotate List', slug: 'rotate-list', difficulty: 'Medium',
    topics: ['linked-list'], tags: ['Two Pointers'],
    visualizerPath: '/linked-list',
  },
  {
    id: 82, title: 'Remove Duplicates from Sorted List II', slug: 'remove-duplicates-from-sorted-list-ii', difficulty: 'Medium',
    topics: ['linked-list'], tags: ['Two Pointers'],
    visualizerPath: '/linked-list',
  },
  {
    id: 83, title: 'Remove Duplicates from Sorted List', slug: 'remove-duplicates-from-sorted-list', difficulty: 'Easy',
    topics: ['linked-list'], tags: [],
    visualizerPath: '/linked-list',
  },
  {
    id: 86, title: 'Partition List', slug: 'partition-list', difficulty: 'Medium',
    topics: ['linked-list'], tags: ['Two Pointers'],
    visualizerPath: '/linked-list',
  },
  {
    id: 92, title: 'Reverse Linked List II', slug: 'reverse-linked-list-ii', difficulty: 'Medium',
    topics: ['linked-list'], tags: [],
    visualizerPath: '/linked-list',
  },
  {
    id: 141, title: 'Linked List Cycle', slug: 'linked-list-cycle', difficulty: 'Easy',
    topics: ['linked-list'], tags: ["Floyd's Cycle Detection", 'Two Pointers'],
    visualizerPath: '/linked-list',
  },
  {
    id: 142, title: 'Linked List Cycle II', slug: 'linked-list-cycle-ii', difficulty: 'Medium',
    topics: ['linked-list'], tags: ["Floyd's Cycle Detection", 'Two Pointers'],
    visualizerPath: '/linked-list',
  },
  {
    id: 148, title: 'Sort List', slug: 'sort-list', difficulty: 'Medium',
    topics: ['linked-list', 'sorting'], tags: ['Merge Sort', 'Two Pointers'],
    visualizerPath: '/linked-list',
  },
  {
    id: 160, title: 'Intersection of Two Linked Lists', slug: 'intersection-of-two-linked-lists', difficulty: 'Easy',
    topics: ['linked-list'], tags: ['Two Pointers', 'Hash Table'],
    visualizerPath: '/linked-list',
  },
  {
    id: 203, title: 'Remove Linked List Elements', slug: 'remove-linked-list-elements', difficulty: 'Easy',
    topics: ['linked-list'], tags: ['Recursion'],
    visualizerPath: '/linked-list',
  },
  {
    id: 206, title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'Easy',
    topics: ['linked-list'], tags: ['Recursion'],
    visualizerPath: '/linked-list',
  },
  {
    id: 234, title: 'Palindrome Linked List', slug: 'palindrome-linked-list', difficulty: 'Easy',
    topics: ['linked-list'], tags: ['Two Pointers', 'Recursion'],
    visualizerPath: '/linked-list',
  },
  {
    id: 328, title: 'Odd Even Linked List', slug: 'odd-even-linked-list', difficulty: 'Medium',
    topics: ['linked-list'], tags: [],
    visualizerPath: '/linked-list',
  },
  {
    id: 876, title: 'Middle of the Linked List', slug: 'middle-of-the-linked-list', difficulty: 'Easy',
    topics: ['linked-list'], tags: ['Two Pointers'],
    visualizerPath: '/linked-list',
  },

  // ─── STACK ───────────────────────────────────────────────────────────────────
  {
    id: 20, title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy',
    topics: ['stack'], tags: ['String'],
    visualizerPath: '/stack',
  },
  {
    id: 32, title: 'Longest Valid Parentheses', slug: 'longest-valid-parentheses', difficulty: 'Hard',
    topics: ['stack'], tags: ['DP', 'String'],
    visualizerPath: '/stack',
  },
  {
    id: 71, title: 'Simplify Path', slug: 'simplify-path', difficulty: 'Medium',
    topics: ['stack'], tags: ['String'],
    visualizerPath: '/stack',
  },
  {
    id: 84, title: 'Largest Rectangle in Histogram', slug: 'largest-rectangle-in-histogram', difficulty: 'Hard',
    topics: ['stack'], tags: ['Monotonic Stack'],
    visualizerPath: '/stack',
  },
  {
    id: 150, title: 'Evaluate Reverse Polish Notation', slug: 'evaluate-reverse-polish-notation', difficulty: 'Medium',
    topics: ['stack'], tags: ['Math', 'Array'],
    visualizerPath: '/stack',
  },
  {
    id: 155, title: 'Min Stack', slug: 'min-stack', difficulty: 'Medium',
    topics: ['stack'], tags: ['Design'],
    visualizerPath: '/stack',
  },
  {
    id: 225, title: 'Implement Stack using Queues', slug: 'implement-stack-using-queues', difficulty: 'Easy',
    topics: ['stack', 'queue'], tags: ['Design'],
    visualizerPath: '/stack',
  },
  {
    id: 232, title: 'Implement Queue using Stacks', slug: 'implement-queue-using-stacks', difficulty: 'Easy',
    topics: ['stack', 'queue'], tags: ['Design'],
    visualizerPath: '/queue',
  },
  {
    id: 316, title: 'Remove Duplicate Letters', slug: 'remove-duplicate-letters', difficulty: 'Medium',
    topics: ['stack'], tags: ['Greedy', 'Monotonic Stack'],
    visualizerPath: '/stack',
  },
  {
    id: 394, title: 'Decode String', slug: 'decode-string', difficulty: 'Medium',
    topics: ['stack'], tags: ['String', 'Recursion'],
    visualizerPath: '/stack',
  },
  {
    id: 496, title: 'Next Greater Element I', slug: 'next-greater-element-i', difficulty: 'Easy',
    topics: ['stack'], tags: ['Monotonic Stack', 'Hash Table'],
    visualizerPath: '/stack',
  },
  {
    id: 503, title: 'Next Greater Element II', slug: 'next-greater-element-ii', difficulty: 'Medium',
    topics: ['stack'], tags: ['Monotonic Stack'],
    visualizerPath: '/stack',
  },
  {
    id: 739, title: 'Daily Temperatures', slug: 'daily-temperatures', difficulty: 'Medium',
    topics: ['stack'], tags: ['Monotonic Stack', 'Array'],
    visualizerPath: '/stack',
  },

  // ─── QUEUE ───────────────────────────────────────────────────────────────────
  {
    id: 239, title: 'Sliding Window Maximum', slug: 'sliding-window-maximum', difficulty: 'Hard',
    topics: ['queue'], tags: ['Monotonic Deque', 'Sliding Window'],
    visualizerPath: '/queue',
  },
  {
    id: 622, title: 'Design Circular Queue', slug: 'design-circular-queue', difficulty: 'Medium',
    topics: ['queue'], tags: ['Design', 'Array', 'Linked List'],
    visualizerPath: '/queue',
  },
  {
    id: 641, title: 'Design Circular Deque', slug: 'design-circular-deque', difficulty: 'Medium',
    topics: ['queue'], tags: ['Design', 'Array', 'Linked List'],
    visualizerPath: '/queue',
  },
  {
    id: 649, title: 'Dota2 Senate', slug: 'dota2-senate', difficulty: 'Medium',
    topics: ['queue'], tags: ['Greedy', 'String'],
    visualizerPath: '/queue',
  },
  {
    id: 933, title: 'Number of Recent Calls', slug: 'number-of-recent-calls', difficulty: 'Easy',
    topics: ['queue'], tags: ['Design'],
    visualizerPath: '/queue',
  },
  {
    id: 950, title: 'Reveal Cards In Increasing Order', slug: 'reveal-cards-in-increasing-order', difficulty: 'Medium',
    topics: ['queue'], tags: ['Sorting', 'Simulation'],
    visualizerPath: '/queue',
  },

  // ─── TREES ───────────────────────────────────────────────────────────────────
  {
    id: 94, title: 'Binary Tree Inorder Traversal', slug: 'binary-tree-inorder-traversal', difficulty: 'Easy',
    topics: ['trees'], tags: ['Traversal', 'Recursion'],
    visualizerPath: '/trees',
  },
  {
    id: 96, title: 'Unique Binary Search Trees', slug: 'unique-binary-search-trees', difficulty: 'Medium',
    topics: ['trees'], tags: ['DP', 'BST'],
    visualizerPath: '/trees',
  },
  {
    id: 98, title: 'Validate Binary Search Tree', slug: 'validate-binary-search-tree', difficulty: 'Medium',
    topics: ['trees'], tags: ['BST', 'DFS'],
    visualizerPath: '/trees',
  },
  {
    id: 100, title: 'Same Tree', slug: 'same-tree', difficulty: 'Easy',
    topics: ['trees'], tags: ['DFS', 'BFS'],
    visualizerPath: '/trees',
  },
  {
    id: 101, title: 'Symmetric Tree', slug: 'symmetric-tree', difficulty: 'Easy',
    topics: ['trees'], tags: ['DFS', 'BFS'],
    visualizerPath: '/trees',
  },
  {
    id: 102, title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', difficulty: 'Medium',
    topics: ['trees', 'queue'], tags: ['BFS'],
    visualizerPath: '/trees',
  },
  {
    id: 104, title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', difficulty: 'Easy',
    topics: ['trees'], tags: ['DFS', 'BFS'],
    visualizerPath: '/trees',
  },
  {
    id: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', slug: 'construct-binary-tree-from-preorder-and-inorder-traversal', difficulty: 'Medium',
    topics: ['trees'], tags: ['Hash Table', 'Divide & Conquer'],
    visualizerPath: '/trees',
  },
  {
    id: 110, title: 'Balanced Binary Tree', slug: 'balanced-binary-tree', difficulty: 'Easy',
    topics: ['trees'], tags: ['DFS'],
    visualizerPath: '/trees',
  },
  {
    id: 112, title: 'Path Sum', slug: 'path-sum', difficulty: 'Easy',
    topics: ['trees'], tags: ['DFS'],
    visualizerPath: '/trees',
  },
  {
    id: 124, title: 'Binary Tree Maximum Path Sum', slug: 'binary-tree-maximum-path-sum', difficulty: 'Hard',
    topics: ['trees'], tags: ['DFS', 'DP'],
    visualizerPath: '/trees',
  },
  {
    id: 144, title: 'Binary Tree Preorder Traversal', slug: 'binary-tree-preorder-traversal', difficulty: 'Easy',
    topics: ['trees'], tags: ['Traversal', 'Stack'],
    visualizerPath: '/trees',
  },
  {
    id: 199, title: 'Binary Tree Right Side View', slug: 'binary-tree-right-side-view', difficulty: 'Medium',
    topics: ['trees'], tags: ['BFS', 'DFS'],
    visualizerPath: '/trees',
  },
  {
    id: 226, title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'Easy',
    topics: ['trees'], tags: ['DFS', 'BFS'],
    visualizerPath: '/trees',
  },
  {
    id: 235, title: 'Lowest Common Ancestor of a BST', slug: 'lowest-common-ancestor-of-a-binary-search-tree', difficulty: 'Medium',
    topics: ['trees'], tags: ['BST', 'Recursion'],
    visualizerPath: '/trees',
  },
  {
    id: 236, title: 'Lowest Common Ancestor of a Binary Tree', slug: 'lowest-common-ancestor-of-a-binary-tree', difficulty: 'Medium',
    topics: ['trees'], tags: ['DFS', 'Recursion'],
    visualizerPath: '/trees',
  },
  {
    id: 297, title: 'Serialize and Deserialize Binary Tree', slug: 'serialize-and-deserialize-binary-tree', difficulty: 'Hard',
    topics: ['trees'], tags: ['BFS', 'DFS', 'Design'],
    visualizerPath: '/trees',
  },
  {
    id: 450, title: 'Delete Node in a BST', slug: 'delete-node-in-a-bst', difficulty: 'Medium',
    topics: ['trees'], tags: ['BST', 'Recursion'],
    visualizerPath: '/trees',
  },
  {
    id: 572, title: 'Subtree of Another Tree', slug: 'subtree-of-another-tree', difficulty: 'Easy',
    topics: ['trees'], tags: ['DFS', 'Hashing'],
    visualizerPath: '/trees',
  },

  // ─── GRAPHS ──────────────────────────────────────────────────────────────────
  {
    id: 133, title: 'Clone Graph', slug: 'clone-graph', difficulty: 'Medium',
    topics: ['graphs'], tags: ['BFS', 'DFS', 'Hash Table'],
    visualizerPath: '/graphs',
  },
  {
    id: 200, title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium',
    topics: ['graphs'], tags: ['BFS', 'DFS', 'Union-Find'],
    visualizerPath: '/graphs',
  },
  {
    id: 207, title: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium',
    topics: ['graphs'], tags: ['Topological Sort', 'BFS', 'DFS'],
    visualizerPath: '/graphs',
  },
  {
    id: 210, title: 'Course Schedule II', slug: 'course-schedule-ii', difficulty: 'Medium',
    topics: ['graphs'], tags: ['Topological Sort'],
    visualizerPath: '/graphs',
  },
  {
    id: 329, title: 'Longest Increasing Path in a Matrix', slug: 'longest-increasing-path-in-a-matrix', difficulty: 'Hard',
    topics: ['graphs'], tags: ['DFS', 'Memoization'],
    visualizerPath: '/graphs',
  },
  {
    id: 399, title: 'Evaluate Division', slug: 'evaluate-division', difficulty: 'Medium',
    topics: ['graphs'], tags: ['BFS', 'DFS', 'Union-Find'],
    visualizerPath: '/graphs',
  },
  {
    id: 417, title: 'Pacific Atlantic Water Flow', slug: 'pacific-atlantic-water-flow', difficulty: 'Medium',
    topics: ['graphs'], tags: ['BFS', 'DFS'],
    visualizerPath: '/graphs',
  },
  {
    id: 684, title: 'Redundant Connection', slug: 'redundant-connection', difficulty: 'Medium',
    topics: ['graphs'], tags: ['Union-Find', 'DFS'],
    visualizerPath: '/graphs',
  },
  {
    id: 695, title: 'Max Area of Island', slug: 'max-area-of-island', difficulty: 'Medium',
    topics: ['graphs'], tags: ['DFS', 'BFS'],
    visualizerPath: '/graphs',
  },
  {
    id: 743, title: 'Network Delay Time', slug: 'network-delay-time', difficulty: 'Medium',
    topics: ['graphs'], tags: ["Dijkstra's", 'Heap'],
    visualizerPath: '/graphs',
  },
  {
    id: 787, title: 'Cheapest Flights Within K Stops', slug: 'cheapest-flights-within-k-stops', difficulty: 'Medium',
    topics: ['graphs'], tags: ['Bellman-Ford', 'BFS', 'DP'],
    visualizerPath: '/graphs',
  },
  {
    id: 994, title: 'Rotting Oranges', slug: 'rotting-oranges', difficulty: 'Medium',
    topics: ['graphs', 'queue'], tags: ['BFS', 'Matrix'],
    visualizerPath: '/graphs',
  },
  {
    id: 1091, title: 'Shortest Path in Binary Matrix', slug: 'shortest-path-in-binary-matrix', difficulty: 'Medium',
    topics: ['graphs'], tags: ['BFS'],
    visualizerPath: '/graphs',
  },
  {
    id: 1584, title: 'Min Cost to Connect All Points', slug: 'min-cost-to-connect-all-points', difficulty: 'Medium',
    topics: ['graphs'], tags: ["Prim's", "Kruskal's", 'MST'],
    visualizerPath: '/graphs',
  },

  // ─── SORTING ─────────────────────────────────────────────────────────────────
  {
    id: 164, title: 'Maximum Gap', slug: 'maximum-gap', difficulty: 'Hard',
    topics: ['sorting'], tags: ['Radix Sort', 'Bucket Sort'],
    visualizerPath: '/sorting',
  },
  {
    id: 179, title: 'Largest Number', slug: 'largest-number', difficulty: 'Medium',
    topics: ['sorting'], tags: ['Greedy', 'Custom Sort'],
    visualizerPath: '/sorting',
  },
  {
    id: 215, title: 'Kth Largest Element in an Array', slug: 'kth-largest-element-in-an-array', difficulty: 'Medium',
    topics: ['sorting'], tags: ['Quick Select', 'Heap'],
    visualizerPath: '/sorting',
  },
  {
    id: 242, title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'Easy',
    topics: ['sorting'], tags: ['Hash Table', 'String'],
    visualizerPath: '/sorting',
  },
  {
    id: 347, title: 'Top K Frequent Elements', slug: 'top-k-frequent-elements', difficulty: 'Medium',
    topics: ['sorting'], tags: ['Heap', 'Bucket Sort', 'Hash Table'],
    visualizerPath: '/sorting',
  },
  {
    id: 406, title: 'Queue Reconstruction by Height', slug: 'queue-reconstruction-by-height', difficulty: 'Medium',
    topics: ['sorting'], tags: ['Greedy'],
    visualizerPath: '/sorting',
  },
  {
    id: 912, title: 'Sort an Array', slug: 'sort-an-array', difficulty: 'Medium',
    topics: ['sorting'], tags: ['Merge Sort', 'Quick Sort', 'Heap Sort'],
    visualizerPath: '/sorting',
  },
  {
    id: 973, title: 'K Closest Points to Origin', slug: 'k-closest-points-to-origin', difficulty: 'Medium',
    topics: ['sorting'], tags: ['Heap', 'Quick Select'],
    visualizerPath: '/sorting',
  },

  // ─── RECURSION ───────────────────────────────────────────────────────────────
  {
    id: 22, title: 'Generate Parentheses', slug: 'generate-parentheses', difficulty: 'Medium',
    topics: ['recursion'], tags: ['Backtracking', 'String'],
    visualizerPath: '/recursion',
  },
  {
    id: 39, title: 'Combination Sum', slug: 'combination-sum', difficulty: 'Medium',
    topics: ['recursion'], tags: ['Backtracking', 'Array'],
    visualizerPath: '/recursion',
  },
  {
    id: 46, title: 'Permutations', slug: 'permutations', difficulty: 'Medium',
    topics: ['recursion'], tags: ['Backtracking'],
    visualizerPath: '/recursion',
  },
  {
    id: 47, title: 'Permutations II', slug: 'permutations-ii', difficulty: 'Medium',
    topics: ['recursion'], tags: ['Backtracking'],
    visualizerPath: '/recursion',
  },
  {
    id: 50, title: 'Pow(x, n)', slug: 'powx-n', difficulty: 'Medium',
    topics: ['recursion'], tags: ['Math', 'Fast Power'],
    visualizerPath: '/recursion',
  },
  {
    id: 51, title: 'N-Queens', slug: 'n-queens', difficulty: 'Hard',
    topics: ['recursion'], tags: ['Backtracking'],
    visualizerPath: '/recursion',
  },
  {
    id: 70, title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy',
    topics: ['recursion'], tags: ['DP', 'Memoization'],
    visualizerPath: '/recursion',
  },
  {
    id: 77, title: 'Combinations', slug: 'combinations', difficulty: 'Medium',
    topics: ['recursion'], tags: ['Backtracking'],
    visualizerPath: '/recursion',
  },
  {
    id: 78, title: 'Subsets', slug: 'subsets', difficulty: 'Medium',
    topics: ['recursion'], tags: ['Backtracking', 'Bit Manipulation'],
    visualizerPath: '/recursion',
  },
  {
    id: 509, title: 'Fibonacci Number', slug: 'fibonacci-number', difficulty: 'Easy',
    topics: ['recursion'], tags: ['DP', 'Memoization', 'Math'],
    visualizerPath: '/recursion',
  },
];
