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
    }
};
