export interface LinkedListInfo {
    name: string;
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
}

export const LINKED_LIST_INFO: Record<string, LinkedListInfo> = {
    // Basic
    convertToArray: {
        name: "Convert to Array",
        description: "Traverses the linked list and stores each node's value into a dynamic array or list.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)"
    },
    create: {
        name: "Create List",
        description: "Initializes a new linked list from a set of values, creating nodes and linking them sequentially.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)"
    },

    // Traversal
    iterativeTraversal: {
        name: "Iterative Traversal",
        description: "Visits each node in the list one by one using a loop until the end (null) is reached.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    recursiveTraversal: {
        name: "Recursive Traversal",
        description: "Visits each node using a recursive function call, processing the current node and then calling itself for the next node.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N) (due to recursion stack)"
    },
    reverseTraversal: {
        name: "Reverse Traversal",
        description: "Traverses the list from tail to head. Efficient in doubly linked lists using 'prev' pointers.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    showLength: {
        name: "Calculate Length",
        description: "Counts the number of nodes in the linked list by traversing from head to tail.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    findMiddle: {
        name: "Find Middle",
        description: "Locates the middle node(s) of the list, often using the fast and slow pointer (tortoise and hare) approach.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },

    // Insertion
    insertHead: {
        name: "Insert at Head",
        description: "Creates a new node and places it at the beginning of the list, updating the head pointer.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)"
    },
    insertTail: {
        name: "Insert at Tail",
        description: "Creates a new node and appends it to the end of the list. Fast if a tail pointer is maintained.",
        timeComplexity: "O(1) with tail pointer, else O(N)",
        spaceComplexity: "O(1)"
    },
    insertIndex: {
        name: "Insert at Index",
        description: "Inserts a new node at a specific zero-based index by traversing to the (index-1) position.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    insertAfterValue: {
        name: "Insert After Value",
        description: "Searches for a specific value and inserts a new node immediately after the first occurrence found.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    insertBeforeValue: {
        name: "Insert Before Value",
        description: "Searches for a specific value and inserts a new node immediately before its first occurrence.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    sortedInsert: {
        name: "Sorted Insert",
        description: "Inserts a value into its correct position within a sorted linked list to maintain order.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },

    // Deletion
    removeHead: {
        name: "Delete Head",
        description: "Removes the first node of the list and updates the head pointer to the second node.",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)"
    },
    removeTail: {
        name: "Delete Tail",
        description: "Removes the last node. Requires traversing to the second-to-last node in a singly linked list.",
        timeComplexity: "O(N) in Singly, O(1) in Doubly",
        spaceComplexity: "O(1)"
    },
    removeIndex: {
        name: "Delete at Index",
        description: "Removes a node at a specific index by linking its predecessor to its successor.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    deleteByValue: {
        name: "Delete by Value",
        description: "Searches for the first node containing a specific value and removes it from the list.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    deleteAllOccurrences: {
        name: "Delete All Occurrences",
        description: "Traverses the entire list and removes every node that matches a specific search value.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    deleteList: {
        name: "Delete Entire List",
        description: "Clears all nodes from the list, effectively resetting it to an empty state.",
        timeComplexity: "O(N) (to free memory individually) or O(1)",
        spaceComplexity: "O(1)"
    },

    // Searching
    search: {
        name: "Linear Search",
        description: "Sequentially checks each node's value until the target is found or the end is reached.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    findNthNode: {
        name: "Find Nth Node",
        description: "Returns the node located at a specific index by traversing from the head.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    findNthFromEnd: {
        name: "Find Nth from End",
        description: "Locates the Nth node from the tail, typically using two pointers with an N-node gap.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    countOccurrences: {
        name: "Count Occurrences",
        description: "Counts how many times a specific value appears throughout the linked list.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },

    // Advanced
    reverseList: {
        name: "Reverse List",
        description: "Reverses the direction of all pointers in the list so that the head becomes the tail.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    detectCycle: {
        name: "Detect Cycle",
        description: "Checks if a cycle exists in the list using Floyd's Cycle-Finding Algorithm (Tortoise and Hare).",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    removeCycle: {
        name: "Remove Cycle",
        description: "Identifies the start of a cycle and breaks the link to resolve it into a linear list.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    mergeTwoLists: {
        name: "Merge Sorted Lists",
        description: "Combines two already sorted linked lists into a single, cohesive sorted list.",
        timeComplexity: "O(N + M)",
        spaceComplexity: "O(1) if in-place, else O(N + M)"
    },
    mergeSortList: {
        name: "Merge Sort",
        description: "Applies the merge sort strategy to recursively split and then merge the linked list in sorted order.",
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(log N) due to recursion"
    },
    checkPalindrome: {
        name: "Check Palindrome",
        description: "Determines if the list reads the same forward and backward, often by reversing the second half.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    },
    rotateList: {
        name: "Rotate List",
        description: "Rotates the list to the right by K places by connecting the tail to the head and breaking the link at the new tail.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)"
    }
};
