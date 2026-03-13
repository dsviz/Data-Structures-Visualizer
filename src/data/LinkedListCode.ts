export type Language = 'c' | 'cpp' | 'java' | 'python';

export interface CodeData {
    lines: string[];
    mapping: Record<number, number | number[]>; // pseudoLineIndex -> codeLineIndex(s)
}

export type OperationCodes = Record<string, Record<Language, CodeData>>;

export const LINKED_LIST_CODE: OperationCodes = {
    insertHead: {
        c: {
            lines: [
                "struct Node* v = (struct Node*)malloc(sizeof(struct Node));",
                "v->data = val;",
                "v->next = head;",
                "head = v;",
                "if (tail == NULL) tail = v;"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 3, 3: 4 }
        },
        cpp: {
            lines: [
                "Node* v = new Node(val);",
                "v->next = head;",
                "head = v;",
                "if (tail == nullptr) tail = v;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        java: {
            lines: [
                "Node v = new Node(val);",
                "v.next = head;",
                "head = v;",
                "if (tail == null) tail = v;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        python: {
            lines: [
                "v = Node(val)",
                "v.next = head",
                "head = v",
                "if tail is None: tail = v"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        }
    },
    insertTail: {
        c: {
            lines: [
                "struct Node* v = (struct Node*)malloc(sizeof(struct Node));",
                "v->data = val;",
                "v->next = NULL;",
                "if (tail != NULL) tail->next = v;",
                "tail = v;",
                "if (head == NULL) head = v;"
            ],
            mapping: { 0: [0, 1, 2], 1: 3, 2: 4, 3: 5 }
        },
        cpp: {
            lines: [
                "Node* v = new Node(val);",
                "if (tail != nullptr) tail->next = v;",
                "tail = v;",
                "if (head == nullptr) head = v;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        java: {
            lines: [
                "Node v = new Node(val);",
                "if (tail != null) tail.next = v;",
                "tail = v;",
                "if (head == null) head = v;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        python: {
            lines: [
                "v = Node(val)",
                "if tail is not None: tail.next = v",
                "tail = v",
                "if head is None: head = v"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        }
    },
    insertIndex: {
        c: {
            lines: [
                "struct Node* v = (struct Node*)malloc(sizeof(struct Node));",
                "v->data = val;",
                "struct Node* curr = head;",
                "for (int i = 0; i < index - 1; i++) {",
                "    curr = curr->next;",
                "}",
                "v->next = curr->next;",
                "curr->next = v;"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 3, 3: 4, 4: 6, 5: 7 }
        },
        cpp: {
            lines: [
                "Node* v = new Node(val);",
                "Node* curr = head;",
                "for (int i = 0; i < index - 1; i++) {",
                "    curr = curr->next;",
                "}",
                "v->next = curr->next;",
                "curr->next = v;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5, 5: 6 }
        },
        java: {
            lines: [
                "Node v = new Node(val);",
                "Node curr = head;",
                "for (int i = 0; i < index - 1; i++) {",
                "    curr = curr.next;",
                "}",
                "v.next = curr.next;",
                "curr.next = v;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5, 5: 6 }
        },
        python: {
            lines: [
                "v = Node(val)",
                "curr = head",
                "for i in range(index - 1):",
                "    curr = curr.next",
                "v.next = curr.next",
                "curr.next = v"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        }
    },
    removeHead: {
        c: {
            lines: [
                "if (head == NULL) return;",
                "struct Node* temp = head;",
                "head = head->next;",
                "free(temp);",
                "if (head == NULL) tail = NULL;"
            ],
            mapping: { 0: 0, 1: 2, 2: [4] } // Mapping simplified
        },
        cpp: {
            lines: [
                "if (head == nullptr) return;",
                "Node* temp = head;",
                "head = head->next;",
                "delete temp;",
                "if (head == nullptr) tail = nullptr;"
            ],
            mapping: { 0: 0, 1: 2, 2: 4 }
        },
        java: {
            lines: [
                "if (head == null) return;",
                "head = head.next;",
                "if (head == null) tail = null;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        },
        python: {
            lines: [
                "if head is None: return",
                "head = head.next",
                "if head is None: tail = None"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        }
    },
    removeTail: {
        c: {
            lines: [
                "if (head == NULL) return;",
                "struct Node* curr = head;",
                "while (curr->next != tail) {",
                "    curr = curr->next;",
                "}",
                "curr->next = NULL;",
                "tail = curr;",
                "free(tail_old);" // Simplified representation
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5, 5: 6 }
        },
        cpp: {
            lines: [
                "if (head == nullptr) return;",
                "Node* curr = head;",
                "while (curr->next != tail) {",
                "    curr = curr->next;",
                "}",
                "curr->next = nullptr;",
                "delete tail;",
                "tail = curr;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5, 5: 7 }
        },
        java: {
            lines: [
                "if (head == null) return;",
                "Node curr = head;",
                "while (curr.next != tail) {",
                "    curr = curr.next;",
                "}",
                "curr.next = null;",
                "tail = curr;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5, 5: 6 }
        },
        python: {
            lines: [
                "if head is None: return",
                "curr = head",
                "while curr.next != tail:",
                "    curr = curr.next",
                "curr.next = None",
                "tail = curr"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        }
    },
    removeIndex: {
        c: {
            lines: [
                "struct Node* curr = head;",
                "for (int i = 0; i < index - 1; i++) {",
                "    curr = curr->next;",
                "}",
                "struct Node* temp = curr->next;",
                "curr->next = temp->next;",
                "free(temp);"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 5 }
        },
        cpp: {
            lines: [
                "Node* curr = head;",
                "for (int i = 0; i < index - 1; i++) {",
                "    curr = curr->next;",
                "}",
                "Node* temp = curr->next;",
                "curr->next = temp->next;",
                "delete temp;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 5 }
        },
        java: {
            lines: [
                "Node curr = head;",
                "for (int i = 0; i < index - 1; i++) {",
                "    curr = curr.next;",
                "}",
                "curr.next = curr.next.next;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4 }
        },
        python: {
            lines: [
                "curr = head",
                "for i in range(index - 1):",
                "    curr = curr.next",
                "curr.next = curr.next.next"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        }
    },
    search: {
        c: {
            lines: [
                "struct Node* curr = head;",
                "while (curr != NULL) {",
                "    if (curr->data == target) return true;",
                "    curr = curr->next;",
                "}",
                "return false;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5 }
        },
        cpp: {
            lines: [
                "Node* curr = head;",
                "while (curr != nullptr) {",
                "    if (curr->val == target) return true;",
                "    curr = curr->next;",
                "}",
                "return false;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5 }
        },
        java: {
            lines: [
                "Node curr = head;",
                "while (curr != null) {",
                "    if (curr.val == target) return true;",
                "    curr = curr.next;",
                "}",
                "return false;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5 }
        },
        python: {
            lines: [
                "curr = head",
                "while curr is not None:",
                "    if curr.val == target: return True",
                "    curr = curr.next",
                "return False"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 }
        }
    },
    create: {
        c: {
            lines: [
                "struct Node* head = NULL; struct Node* tail = NULL;", // 0: Init
                "for (int i = 0; i < N; i++) {",                      // 1: Loop
                "    struct Node* v = malloc(sizeof(struct Node));",  // 2: Create
                "    v->data = val; v->next = NULL;",                 // Used 'val' for visual replacement
                "    if (head == NULL) head = v;",                    // 3: Head check
                "    else tail->next = v;",                           // 4: Tail next
                "    tail = v;",                                      // 5: Update Tail
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: [2, 3], 3: 4, 4: 5, 5: 6 }
        },
        cpp: {
            lines: [
                "Node* head = nullptr; Node* tail = nullptr;",
                "for (int val : input) {",
                "    Node* v = new Node(val);",
                "    if (head == nullptr) head = v;",
                "    else tail->next = v;",
                "    tail = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        },
        java: {
            lines: [
                "Node head = null, tail = null;",
                "for (int val : input) {",
                "    Node v = new Node(val);",
                "    if (head == null) head = v;",
                "    else tail.next = v;",
                "    tail = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        },
        python: {
            lines: [
                "head = None; tail = None",
                "for val in input:",
                "    v = Node(val)",
                "    if head is None: head = v",
                "    else: tail.next = v",
                "    tail = v"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        }
    },
    reverseList: {
        c: {
            lines: [
                "struct Node* prev = NULL;",
                "struct Node* curr = head;",
                "while (curr != NULL) {",
                "    struct Node* next = curr->next;",
                "    curr->next = prev;",
                "    prev = curr;",
                "    curr = next;",
                "}",
                "head = prev;"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 8 }
        },
        cpp: {
            lines: [
                "Node* prev = nullptr;",
                "Node* curr = head;",
                "while (curr != nullptr) {",
                "    Node* next = curr->next;",
                "    curr->next = prev;",
                "    prev = curr;",
                "    curr = next;",
                "}",
                "head = prev;"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 8 }
        },
        java: {
            lines: [
                "Node prev = null;",
                "Node curr = head;",
                "while (curr != null) {",
                "    Node next = curr.next;",
                "    curr.next = prev;",
                "    prev = curr;",
                "    curr = next;",
                "}",
                "head = prev;"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 8 }
        },
        python: {
            lines: [
                "prev = None",
                "curr = head",
                "while curr is not None:",
                "    nextTemp = curr.next",
                "    curr.next = prev",
                "    prev = curr",
                "    curr = nextTemp",
                "head = prev"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 }
        }
    },
    detectCycle: {
        c: {
            lines: [
                "struct Node *slow = head, *fast = head;",
                "while (fast != NULL && fast->next != NULL) {",
                "    slow = slow->next;",
                "    fast = fast->next->next;",
                "    if (slow == fast) return true;",
                "}",
                "return false;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        cpp: {
            lines: [
                "Node *slow = head, *fast = head;",
                "while (fast != nullptr && fast->next != nullptr) {",
                "    slow = slow->next;",
                "    fast = fast->next->next;",
                "    if (slow == fast) return true;",
                "}",
                "return false;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        java: {
            lines: [
                "Node slow = head, fast = head;",
                "while (fast != null && fast.next != null) {",
                "    slow = slow.next;",
                "    fast = fast.next.next;",
                "    if (slow == fast) return true;",
                "}",
                "return false;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        python: {
            lines: [
                "slow = head; fast = head",
                "while fast and fast.next:",
                "    slow = slow.next",
                "    fast = fast.next.next",
                "    if slow == fast: return True",
                "return False"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        }
    },
    sortedInsert: {
        c: {
            lines: [
                "if (head == NULL || head->data >= val) {",
                "    struct Node* v = malloc(sizeof(struct Node));",
                "    v->data = val; v->next = head; head = v;",
                "} else {",
                "    struct Node* curr = head;",
                "    while (curr->next != NULL && curr->next->data < val) {",
                "        curr = curr->next;",
                "    }",
                "    struct Node* v = malloc(sizeof(struct Node));",
                "    v->data = val; v->next = curr->next; curr->next = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: [8, 9] }
        },
        cpp: {
            lines: [
                "if (head == nullptr || head->val >= val) {",
                "    Node* v = new Node(val);",
                "    v->next = head; head = v;",
                "} else {",
                "    Node* curr = head;",
                "    while (curr->next != nullptr && curr->next->val < val) {",
                "        curr = curr->next;",
                "    }",
                "    Node* v = new Node(val);",
                "    v->next = curr->next; curr->next = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: [8, 9] }
        },
        java: {
            lines: [
                "if (head == null || head.val >= val) {",
                "    Node v = new Node(val);",
                "    v.next = head; head = v;",
                "} else {",
                "    Node curr = head;",
                "    while (curr.next != null && curr.next.val < val) {",
                "        curr = curr.next;",
                "    }",
                "    Node v = new Node(val);",
                "    v.next = curr.next; curr.next = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: [8, 9] }
        },
        python: {
            lines: [
                "if head is None or head.val >= val:",
                "    v = Node(val)",
                "    v.next = head; head = v",
                "else:",
                "    curr = head",
                "    while curr.next and curr.next.val < val:",
                "        curr = curr.next",
                "    v = Node(val)",
                "    v.next = curr.next; curr.next = v"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: [7, 8] }
        }
    },
    iterativeTraversal: {
        c: {
            lines: [
                "struct Node* curr = head;",
                "while (curr != NULL) {",
                "    // Process curr->data",
                "    curr = curr->next;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        cpp: {
            lines: [
                "Node* curr = head;",
                "while (curr != nullptr) {",
                "    // Process curr->val",
                "    curr = curr->next;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        java: {
            lines: [
                "Node curr = head;",
                "while (curr != null) {",
                "    // Process curr.val",
                "    curr = curr.next;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        python: {
            lines: [
                "curr = head",
                "while curr is not None:",
                "    # Process curr.val",
                "    curr = curr.next"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        }
    },
    recursiveTraversal: {
        c: {
            lines: [
                "void traverse(struct Node* node) {",
                "    if (node == NULL) return;",
                "    // Process node->data",
                "    traverse(node->next);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        cpp: {
            lines: [
                "void traverse(Node* node) {",
                "    if (node == nullptr) return;",
                "    // Process node->val",
                "    traverse(node->next);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        java: {
            lines: [
                "void traverse(Node node) {",
                "    if (node == null) return;",
                "    // Process node.val",
                "    traverse(node.next);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        python: {
            lines: [
                "def traverse(node):",
                "    if node is None: return",
                "    # Process node.val",
                "    traverse(node.next)"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        }
    },
    convertToArray: {
        c: {
            lines: [
                "int* arr = (int*)malloc(size * sizeof(int));",
                "struct Node* curr = head;",
                "int i = 0;",
                "while (curr != NULL) {",
                "    arr[i++] = curr->data;",
                "    curr = curr->next;",
                "}",
                "return arr;"
            ],
            mapping: { 0: 0, 1: 1, 2: 3, 3: 4, 4: 5, 5: 7 }
        },
        cpp: {
            lines: [
                "vector<int> arr;",
                "Node* curr = head;",
                "while (curr != nullptr) {",
                "    arr.push_back(curr->val);",
                "    curr = curr->next;",
                "}",
                "return arr;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        java: {
            lines: [
                "List<Integer> arr = new ArrayList<>();",
                "Node curr = head;",
                "while (curr != null) {",
                "    arr.add(curr.val);",
                "    curr = curr.next;",
                "}",
                "return arr;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        python: {
            lines: [
                "arr = []",
                "curr = head",
                "while curr is not None:",
                "    arr.append(curr.val)",
                "    curr = curr.next",
                "return arr"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        }
    },
    showLength: {
        c: {
            lines: [
                "int count = 0;",
                "struct Node* curr = head;",
                "while (curr != NULL) {",
                "    count++;",
                "    curr = curr->next;",
                "}",
                "return count;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        cpp: {
            lines: [
                "int count = 0;",
                "Node* curr = head;",
                "while (curr != nullptr) {",
                "    count++;",
                "    curr = curr->next;",
                "}",
                "return count;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        java: {
            lines: [
                "int count = 0;",
                "Node curr = head;",
                "while (curr != null) {",
                "    count++;",
                "    curr = curr.next;",
                "}",
                "return count;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        python: {
            lines: [
                "count = 0",
                "curr = head",
                "while curr is not None:",
                "    count += 1",
                "    curr = curr.next",
                "return count"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        }
    },
    deleteList: {
        c: {
            lines: [
                "struct Node* curr = head;",
                "while (curr != NULL) {",
                "    struct Node* next = curr->next;",
                "    free(curr);",
                "    curr = next;",
                "}",
                "head = NULL; tail = NULL;"
            ],
            mapping: { 0: 6, 1: 6 }
        },
        cpp: {
            lines: [
                "Node* curr = head;",
                "while (curr != nullptr) {",
                "    Node* next = curr->next;",
                "    delete curr;",
                "    curr = next;",
                "}",
                "head = nullptr; tail = nullptr;"
            ],
            mapping: { 0: 6, 1: 6 }
        },
        java: {
            lines: [
                "head = null;",
                "tail = null;"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        python: {
            lines: [
                "head = None",
                "tail = None"
            ],
            mapping: { 0: 0, 1: 1 }
        }
    },
    findMiddle: {
        c: {
            lines: [
                "struct Node *slow = head, *fast = head;",
                "while (fast != NULL && fast->next != NULL) {",
                "    slow = slow->next;",
                "    fast = fast->next->next;",
                "}",
                "return slow;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5 }
        },
        cpp: {
            lines: [
                "Node *slow = head, *fast = head;",
                "while (fast != nullptr && fast->next != nullptr) {",
                "    slow = slow->next;",
                "    fast = fast->next->next;",
                "}",
                "return slow;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5 }
        },
        java: {
            lines: [
                "Node slow = head, fast = head;",
                "while (fast != null && fast.next != null) {",
                "    slow = slow.next;",
                "    fast = fast.next.next;",
                "}",
                "return slow;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5 }
        },
        python: {
            lines: [
                "slow = head",
                "fast = head",
                "while fast and fast.next:",
                "    slow = slow.next",
                "    fast = fast.next.next",
                "return slow"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 }
        }
    },
    countOccurrences: {
        c: {
            lines: [
                "int count = 0;",
                "struct Node* curr = head;",
                "while (curr != NULL) {",
                "    if (curr->data == target) count++;",
                "    curr = curr->next;",
                "}",
                "return count;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        cpp: {
            lines: [
                "int count = 0;",
                "Node* curr = head;",
                "while (curr != nullptr) {",
                "    if (curr->val == target) count++;",
                "    curr = curr->next;",
                "}",
                "return count;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        java: {
            lines: [
                "int count = 0;",
                "Node curr = head;",
                "while (curr != null) {",
                "    if (curr.val == target) count++;",
                "    curr = curr.next;",
                "}",
                "return count;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }
        },
        python: {
            lines: [
                "count = 0",
                "curr = head",
                "while curr is not None:",
                "    if curr.val == target: count += 1",
                "    curr = curr.next",
                "return count"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        }
    },
    deleteByValue: {
        c: {
            lines: [
                "if (head == NULL) return;",
                "if (head->data == target) {",
                "    struct Node* temp = head; head = head->next; free(temp);",
                "    return;",
                "}",
                "struct Node* curr = head;",
                "while (curr->next != NULL && curr->next->data != target) {",
                "    curr = curr->next;",
                "}",
                "if (curr->next != NULL) {",
                "    struct Node* temp = curr->next;",
                "    curr->next = temp->next; free(temp);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 5, 3: 6, 4: 9, 5: 11 }
        },
        cpp: {
            lines: [
                "if (head == nullptr) return;",
                "if (head->val == target) {",
                "    Node* temp = head; head = head->next; delete temp;",
                "    return;",
                "}",
                "Node* curr = head;",
                "while (curr->next != nullptr && curr->next->val != target) {",
                "    curr = curr->next;",
                "}",
                "if (curr->next != nullptr) {",
                "    Node* temp = curr->next;",
                "    curr->next = temp->next; delete temp;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 5, 3: 6, 4: 9, 5: 11 }
        },
        java: {
            lines: [
                "if (head == null) return;",
                "if (head.val == target) {",
                "    head = head.next; return;",
                "}",
                "Node curr = head;",
                "while (curr.next != null && curr.next.val != target) {",
                "    curr = curr.next;",
                "}",
                "if (curr.next != null) {",
                "    curr.next = curr.next.next;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 4, 3: 5, 4: 8, 5: 9 }
        },
        python: {
            lines: [
                "if head is None: return",
                "if head.val == target:",
                "    head = head.next; return",
                "curr = head",
                "while curr.next and curr.next.val != target:",
                "    curr = curr.next",
                "if curr.next:",
                "    curr.next = curr.next.next"
            ],
            mapping: { 0: 0, 1: 1, 2: 3, 3: 4, 4: 6, 5: 7 }
        }
    },
    findNthNode: {
        c: {
            lines: [
                "struct Node* curr = head;",
                "for (int i = 0; i < n && curr != NULL; i++) {",
                "    curr = curr->next;",
                "}",
                "return curr;"
            ],
            mapping: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 4 }
        },
        cpp: {
            lines: [
                "Node* curr = head;",
                "for (int i = 0; i < n && curr != nullptr; i++) {",
                "    curr = curr->next;",
                "}",
                "return curr;"
            ],
            mapping: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 4 }
        },
        java: {
            lines: [
                "Node curr = head;",
                "for (int i = 0; i < n && curr != null; i++) {",
                "    curr = curr.next;",
                "}",
                "return curr;"
            ],
            mapping: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 4 }
        },
        python: {
            lines: [
                "curr = head",
                "for i in range(n):",
                "    if curr is None: break",
                "    curr = curr.next",
                "return curr"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 }
        }
    },
    findNthFromEnd: {
        c: {
            lines: [
                "struct Node *main = head, *ref = head;",
                "for (int i = 0; i < n; i++) ref = ref->next;",
                "while (ref != NULL) {",
                "    main = main->next;",
                "    ref = ref->next;",
                "}",
                "return main;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 6: 6 }
        },
        cpp: {
            lines: [
                "Node *main = head, *ref = head;",
                "for (int i = 0; i < n; i++) ref = ref->next;",
                "while (ref != nullptr) {",
                "    main = main->next;",
                "    ref = ref->next;",
                "}",
                "return main;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 6: 6 }
        },
        java: {
            lines: [
                "Node main = head, ref = head;",
                "for (int i = 0; i < n; i++) ref = ref.next;",
                "while (ref != null) {",
                "    main = main.next;",
                "    ref = ref.next;",
                "}",
                "return main;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 6: 6 }
        },
        python: {
            lines: [
                "main_ptr = head; ref_ptr = head",
                "for i in range(n): ref_ptr = ref_ptr.next",
                "while ref_ptr is not None:",
                "    main_ptr = main_ptr.next",
                "    ref_ptr = ref_ptr.next",
                "return main_ptr"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        }
    },
    insertAfterValue: {
        c: {
            lines: [
                "struct Node* curr = head;",
                "while (curr != NULL && curr->data != target) curr = curr->next;",
                "if (curr != NULL) {",
                "    struct Node* v = malloc(sizeof(struct Node));",
                "    v->data = val; v->next = curr->next; curr->next = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 3: 3, 4: 4, 5: 4, 6: 4 }
        },
        cpp: {
            lines: [
                "Node* curr = head;",
                "while (curr != nullptr && curr->val != target) curr = curr->next;",
                "if (curr != nullptr) {",
                "    Node* v = new Node(val);",
                "    v->next = curr->next; curr->next = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 3: 3, 4: 4, 5: 4, 6: 4 }
        },
        java: {
            lines: [
                "Node curr = head;",
                "while (curr != null && curr.val != target) curr = curr.next;",
                "if (curr != null) {",
                "    Node v = new Node(val);",
                "    v.next = curr.next; curr.next = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 3: 3, 4: 4, 5: 4, 6: 4 }
        },
        python: {
            lines: [
                "curr = head",
                "while curr and curr.val != target: curr = curr.next",
                "if curr:",
                "    v = Node(val)",
                "    v.next = curr.next; curr.next = v"
            ],
            mapping: { 0: 0, 1: 1, 3: 2, 4: 4, 5: 4, 6: 4 }
        }
    },
    insertBeforeValue: {
        c: {
            lines: [
                "if (head == NULL) return;",
                "if (head->data == target) {",
                "    struct Node* v = malloc(sizeof(struct Node));",
                "    v->data = val; v->next = head; head = v; return;",
                "}",
                "struct Node* curr = head;",
                "while (curr->next != NULL && curr->next->data != target) curr = curr->next;",
                "if (curr->next != NULL) {",
                "    struct Node* v = malloc(sizeof(struct Node));",
                "    v->data = val; v->next = curr->next; curr->next = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 3, 3: 3, 4: 5, 5: 6, 7: 8, 8: 9, 9: 10, 10: 10 }
        },
        cpp: {
            lines: [
                "if (head == nullptr) return;",
                "if (head->val == target) {",
                "    Node* v = new Node(val);",
                "    v->next = head; head = v; return;",
                "}",
                "Node* curr = head;",
                "while (curr->next != nullptr && curr->next->val != target) curr = curr->next;",
                "if (curr->next != nullptr) {",
                "    Node* v = new Node(val);",
                "    v->next = curr->next; curr->next = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 3, 3: 3, 4: 5, 5: 6, 7: 8, 8: 9, 9: 10, 10: 10 }
        },
        java: {
            lines: [
                "if (head == null) return;",
                "if (head.val == target) {",
                "    Node v = new Node(val);",
                "    v.next = head; head = v; return;",
                "}",
                "Node curr = head;",
                "while (curr.next != null && curr.next.val != target) curr = curr.next;",
                "if (curr.next != null) {",
                "    Node v = new Node(val);",
                "    v.next = curr.next; curr.next = v;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 3, 3: 3, 4: 5, 5: 6, 7: 8, 8: 9, 9: 10, 10: 10 }
        },
        python: {
            lines: [
                "if head is None: return",
                "if head.val == target:",
                "    v = Node(val); v.next = head; head = v; return",
                "curr = head",
                "while curr.next and curr.next.val != target: curr = curr.next",
                "if curr.next:",
                "    v = Node(val); v.next = curr.next; curr.next = v"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 8: 6, 9: 6, 10: 6 }
        }
    },
    deleteAllOccurrences: {
        c: {
            lines: [
                "struct Node* temp;",
                "while (head != NULL && head->data == target) {",
                "    temp = head;",
                "    head = head->next;",
                "    free(temp);",
                "}",
                "struct Node* curr = head;",
                "while (curr != NULL && curr->next != NULL) {",
                "    if (curr->next->data == target) {",
                "        temp = curr->next;",
                "        curr->next = temp->next;",
                "        free(temp);",
                "    } else {",
                "        curr = curr->next;",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 13, 12: 13 }
        },
        cpp: {
            lines: [
                "while (head != nullptr && head->val == target) {",
                "    Node* temp = head;",
                "    head = head->next;",
                "    delete temp;",
                "}",
                "Node* curr = head;",
                "while (curr != nullptr && curr->next != nullptr) {",
                "    if (curr->next->val == target) {",
                "        Node* temp = curr->next;",
                "        curr->next = temp->next;",
                "        delete temp;",
                "    } else {",
                "        curr = curr->next;",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 12 }
        },
        java: {
            lines: [
                "while (head != null && head.val == target) {",
                "    head = head.next;",
                "}",
                "Node curr = head;",
                "while (curr != null && curr.next != null) {",
                "    if (curr.next.val == target) {",
                "        curr.next = curr.next.next;",
                "    } else {",
                "        curr = curr.next;",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 3, 3: 4, 4: 5, 5: 6, 6: 8 }
        },
        python: {
            lines: [
                "while head is not None and head.val == target:",
                "    head = head.next",
                "curr = head",
                "while curr is not None and curr.next is not None:",
                "    if curr.next.val == target:",
                "        curr.next = curr.next.next",
                "    else:",
                "        curr = curr.next"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 7 }
        }
    }
};
