export type Language = 'c' | 'cpp' | 'java' | 'python';

export interface CodeData {
    lines: string[];
    mapping: Record<number, number | number[]>;
}

export type OperationCodes = Record<string, Record<Language, CodeData>>;

export const ARRAY_CODE: OperationCodes = {
    // --- CREATE ---
    create: {
        c: {
            lines: [
                "int* arr = (int*)malloc(capacity * sizeof(int));",
                "int size = 0;",
                "// Copy initial values if any",
                "for (int i=0; i<N; i++) arr[size++] = initValues[i];"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 3 }
        },
        cpp: {
            lines: [
                "std::vector<int> arr;",
                "arr.reserve(capacity);",
                "for (int val : initValues) arr.push_back(val);"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 2 }
        },
        java: {
            lines: [
                "int[] arr = new int[capacity];",
                "int size = 0;",
                "for (int val : initValues) arr[size++] = val;"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 2 }
        },
        python: {
            lines: [
                "arr = []",
                "for val in initValues: arr.append(val)"
            ],
            mapping: { 0: 0, 1: 1, 2: 1 }
        }
    },

    // --- INSERT ---
    insert: {
        c: {
            lines: [
                "if (size == capacity) return;",     // 0: Check Capacity
                "for (int i = size-1; i >= index; i--) {", // 1: Shift Loop
                "    arr[i+1] = arr[i];",         // Shift
                "}",
                "arr[index] = val;",              // 2: Insert
                "size++;"                         // 3: Update Size
            ],
            mapping: { 0: 0, 1: [1, 2, 3], 2: 4, 3: 5 }
        },
        cpp: {
            lines: [
                "if (arr.size() == capacity) return;",
                "arr.insert(arr.begin() + index, val);" // C++ vector handles shift
            ],
            mapping: { 0: 0, 1: 1, 2: 1, 3: 1 }
        },
        java: {
            lines: [
                "if (size == capacity) return;",
                "for (int i = size-1; i >= index; i--) {",
                "    arr[i+1] = arr[i];",
                "}",
                "arr[index] = val;",
                "size++;"
            ],
            mapping: { 0: 0, 1: [1, 2, 3], 2: 4, 3: 5 }
        },
        python: {
            lines: [
                "if len(arr) == capacity: return",
                "arr.insert(index, val)" // Python list handles shift
            ],
            mapping: { 0: 0, 1: 1, 2: 1, 3: 1 }
        }
    },

    // --- REMOVE ---
    remove: {
        c: {
            lines: [
                "if (index < 0 || index >= size) return;", // 0: Check Bounds
                "for (int i = index; i < size-1; i++) {",  // 1: Shift Left
                "    arr[i] = arr[i+1];",
                "}",
                "size--;"                                  // 2: Update Size
            ],
            mapping: { 0: 0, 1: [1, 2, 3], 2: 4 }
        },
        cpp: {
            lines: [
                "if (index < 0 || index >= arr.size()) return;",
                "arr.erase(arr.begin() + index);"
            ],
            mapping: { 0: 0, 1: 1, 2: 1 }
        },
        java: {
            lines: [
                "if (index < 0 || index >= size) return;",
                "for (int i = index; i < size-1; i++) {",
                "    arr[i] = arr[i+1];",
                "}",
                "size--;"
            ],
            mapping: { 0: 0, 1: [1, 2, 3], 2: 4 }
        },
        python: {
            lines: [
                "if index < 0 or index >= len(arr): return",
                "arr.pop(index)"
            ],
            mapping: { 0: 0, 1: 1, 2: 1 }
        }
    },

    // --- UPDATE ---
    update: {
        c: {
            lines: [
                "if (index < 0 || index >= size) return;", // 0: Locate
                "arr[index] = val;"                       // 1: Update
            ],
            mapping: { 0: 0, 1: 1 }
        },
        cpp: {
            lines: [
                "if (index < 0 || index >= arr.size()) return;",
                "arr[index] = val;"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        java: {
            lines: [
                "if (index < 0 || index >= size) return;",
                "arr[index] = val;"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        python: {
            lines: [
                "if index < 0 or index >= len(arr): return",
                "arr[index] = val"
            ],
            mapping: { 0: 0, 1: 1 }
        }
    },

    // --- LINEAR SEARCH ---
    search_linear: {
        c: {
            lines: [
                "for (int i = 0; i < size; i++) {",       // 1: Loop
                "    if (arr[i] == target) return i;",    // 2: Check match
                "}",
                "return -1;"                              // 3: Not found
            ],
            mapping: { 1: 0, 2: 1, 3: 3 }
        },
        cpp: {
            lines: [
                "for (int i = 0; i < arr.size(); i++) {",
                "    if (arr[i] == target) return i;",
                "}",
                "return -1;"
            ],
            mapping: { 1: 0, 2: 1, 3: 3 }
        },
        java: {
            lines: [
                "for (int i = 0; i < size; i++) {",
                "    if (arr[i] == target) return i;",
                "}",
                "return -1;"
            ],
            mapping: { 1: 0, 2: 1, 3: 3 }
        },
        python: {
            lines: [
                "for i in range(len(arr)):",
                "    if arr[i] == target: return i",
                "return -1"
            ],
            mapping: { 1: 0, 2: 1, 3: 2 }
        }
    },

    // --- BINARY SEARCH ---
    search_binary: {
        c: {
            lines: [
                "int low = 0, high = size - 1;",              // 0: Init
                "while (low <= high) {",
                "    int mid = low + (high - low) / 2;",      // 2: Check Mid
                "    if (arr[mid] == target) return mid;",    // 3: Found
                "    if (arr[mid] < target) low = mid + 1;",  // 4: Look Right
                "    else high = mid - 1;",                   // 5: Look Left
                "}",
                "return -1;"                                  // 6: Not found
            ],
            mapping: { 0: 0, 2: [1, 2], 3: 3, 4: 4, 5: 5, 6: 7 }
        },
        cpp: {
            lines: [
                "int low = 0, high = arr.size() - 1;",
                "while (low <= high) {",
                "    int mid = low + (high - low) / 2;",
                "    if (arr[mid] == target) return mid;",
                "    if (arr[mid] < target) low = mid + 1;",
                "    else high = mid - 1;",
                "}",
                "return -1;"
            ],
            mapping: { 0: 0, 2: [1, 2], 3: 3, 4: 4, 5: 5, 6: 7 }
        },
        java: {
            lines: [
                "int low = 0, high = size - 1;",
                "while (low <= high) {",
                "    int mid = low + (high - low) / 2;",
                "    if (arr[mid] == target) return mid;",
                "    if (arr[mid] < target) low = mid + 1;",
                "    else high = mid - 1;",
                "}",
                "return -1;"
            ],
            mapping: { 0: 0, 2: [1, 2], 3: 3, 4: 4, 5: 5, 6: 7 }
        },
        python: {
            lines: [
                "low, high = 0, len(arr) - 1",
                "while low <= high:",
                "    mid = (low + high) // 2",
                "    if arr[mid] == target: return mid",
                "    elif arr[mid] < target: low = mid + 1",
                "    else: high = mid - 1",
                "return -1"
            ],
            mapping: { 0: 0, 2: [1, 2], 3: 3, 4: 4, 5: 5, 6: 6 }
        }
    }
};
