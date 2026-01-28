export type Language = 'c' | 'cpp' | 'java' | 'python';

export interface CodeData {
    lines: string[];
    mapping: Record<number, number | number[]>;
}

export type OperationCodes = Record<string, Record<Language, CodeData>>;

export const TREE_CODE: OperationCodes = {
    // --- INSERT ---
    insert: {
        c: {
            lines: [
                "struct Node* insert(struct Node* root, int val) {",
                "    if (root == NULL) return newNode(val);",
                "    if (val < root->data)",
                "        root->left = insert(root->left, val);",
                "    else if (val > root->data)",
                "        root->right = insert(root->right, val);",
                "    return root;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 }
        },
        cpp: {
            lines: [
                "Node* insert(Node* root, int val) {",
                "    if (!root) return new Node(val);",
                "    if (val < root->val)",
                "        root->left = insert(root->left, val);",
                "    else if (val > root->val)",
                "        root->right = insert(root->right, val);",
                "    return root;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 }
        },
        java: {
            lines: [
                "Node insert(Node root, int val) {",
                "    if (root == null) return new Node(val);",
                "    if (val < root.val)",
                "        root.left = insert(root.left, val);",
                "    else if (val > root.val)",
                "        root.right = insert(root.right, val);",
                "    return root;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 }
        },
        python: {
            lines: [
                "def insert(root, val):",
                "    if root is None: return Node(val)",
                "    if val < root.val:",
                "        root.left = insert(root.left, val)",
                "    elif val > root.val:",
                "        root.right = insert(root.right, val)",
                "    return root"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
        }
    },

    // --- SEARCH ---
    search: {
        c: {
            lines: [
                "struct Node* search(struct Node* root, int target) {",
                "    if (root == NULL || root->data == target)",
                "        return root;",
                "    if (target < root->data)",
                "        return search(root->left, target);",
                "    return search(root->right, target);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
        },
        cpp: {
            lines: [
                "Node* search(Node* root, int target) {",
                "    if (!root || root->val == target)",
                "        return root;",
                "    if (target < root->val)",
                "        return search(root->left, target);",
                "    return search(root->right, target);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
        },
        java: {
            lines: [
                "Node search(Node root, int target) {",
                "    if (root == null || root.val == target)",
                "        return root;",
                "    if (target < root.val)",
                "        return search(root.left, target);",
                "    return search(root.right, target);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
        },
        python: {
            lines: [
                "def search(root, target):",
                "    if root is None or root.val == target:",
                "        return root",
                "    if target < root.val:",
                "        return search(root.left, target)",
                "    return search(root.right, target)"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        }
    },

    // --- DELETE ---
    delete: {
        c: {
            lines: [
                "struct Node* deleteNode(struct Node* root, int key) {",
                "    if (root == NULL) return root;",
                "    if (key < root->data) root->left = deleteNode(root->left, key);",
                "    else if (key > root->data) root->right = deleteNode(root->right, key);",
                "    else {",
                "        // Node with only one child or no child",
                "        if (root->left == NULL) {",
                "            struct Node* temp = root->right;",
                "            free(root); return temp;",
                "        }",
                "        // Node with two children: Get inorder successor",
                "        struct Node* temp = minValueNode(root->right);",
                "        root->data = temp->data;",
                "        root->right = deleteNode(root->right, temp->data);",
                "    }",
                "    return root;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 6: 6, 7: 7, 8: 8, 11: 11, 12: 12, 13: 13, 16: 15 }
        },
        cpp: {
            lines: [
                "Node* deleteNode(Node* root, int key) {",
                "    if (!root) return root;",
                "    if (key < root->val) root->left = deleteNode(root->left, key);",
                "    else if (key > root->val) root->right = deleteNode(root->right, key);",
                "    else {",
                "        if (!root->left) {",
                "            Node* temp = root->right;",
                "            delete root; return temp;",
                "        }",
                "        Node* temp = minValueNode(root->right);",
                "        root->val = temp->val;",
                "        root->right = deleteNode(root->right, temp->val);",
                "    }",
                "    return root;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 9: 9, 10: 10, 11: 11, 13: 13 }
        },
        java: {
            lines: [
                "Node deleteNode(Node root, int key) {",
                "    if (root == null) return root;",
                "    if (key < root.val) root.left = deleteNode(root.left, key);",
                "    else if (key > root.val) root.right = deleteNode(root.right, key);",
                "    else {",
                "        if (root.left == null) return root.right;",
                "        else if (root.right == null) return root.left;",
                "        root.val = minValue(root.right);",
                "        root.right = deleteNode(root.right, root.val);",
                "    }",
                "    return root;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 10: 10 }
        },
        python: {
            lines: [
                "def deleteNode(root, key):",
                "    if root is None: return root",
                "    if key < root.val: root.left = deleteNode(root.left, key)",
                "    elif key > root.val: root.right = deleteNode(root.right, key)",
                "    else:",
                "        if root.left is None: return root.right",
                "        elif root.right is None: return root.left",
                "        temp = minValueNode(root.right)",
                "        root.val = temp.val",
                "        root.right = deleteNode(root.right, temp.val)",
                "    return root"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10 }
        }
    }
};
