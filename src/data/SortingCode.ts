export type Language = 'c' | 'cpp' | 'java' | 'python';

export interface CodeData {
    lines: string[];
    mapping: Record<number, number | number[]>;
}

export type OperationCodes = Record<string, Record<Language, CodeData>>;

export const SORTING_CODE: OperationCodes = {
    // --- BUBBLE SORT ---
    bubble: {
        c: {
            lines: [
                "for (int i = 0; i < n-1; i++) {",
                "    for (int j = 0; j < n-i-1; j++) {",
                "        if (arr[j] > arr[j+1]) {",
                "            swap(&arr[j], &arr[j+1]);",
                "        }",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        cpp: {
            lines: [
                "for (int i = 0; i < n-1; i++) {",
                "    for (int j = 0; j < n-i-1; j++) {",
                "        if (arr[j] > arr[j+1]) {",
                "            std::swap(arr[j], arr[j+1]);",
                "        }",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        },
        java: {
            lines: [
                "for (int i = 0; i < n-1; i++) {",
                "    for (int j = 0; j < n-i-1; j++) {",
                "        if (arr[j] > arr[j+1]) {",
                "            int temp = arr[j];",
                "            arr[j] = arr[j+1];",
                "            arr[j+1] = temp;",
                "        }",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: [3, 4, 5] }
        },
        python: {
            lines: [
                "for i in range(n-1):",
                "    for j in range(n-i-1):",
                "        if arr[j] > arr[j+1]:",
                "            arr[j], arr[j+1] = arr[j+1], arr[j]"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3 }
        }
    },

    // --- SELECTION SORT ---
    selection: {
        c: {
            lines: [
                "for (int i = 0; i < n-1; i++) {",
                "    int min_idx = i;",
                "    for (int j = i+1; j < n; j++)",
                "        if (arr[j] < arr[min_idx])",
                "            min_idx = j;",
                "    swap(&arr[min_idx], &arr[i]);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        },
        cpp: {
            lines: [
                "for (int i = 0; i < n-1; i++) {",
                "    int min_idx = i;",
                "    for (int j = i+1; j < n; j++)",
                "        if (arr[j] < arr[min_idx])",
                "            min_idx = j;",
                "    std::swap(arr[min_idx], arr[i]);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        },
        java: {
            lines: [
                "for (int i = 0; i < n-1; i++) {",
                "    int min_idx = i;",
                "    for (int j = i+1; j < n; j++)",
                "        if (arr[j] < arr[min_idx])",
                "            min_idx = j;",
                "    int temp = arr[min_idx];",
                "    arr[min_idx] = arr[i];",
                "    arr[i] = temp;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: [5, 6, 7] }
        },
        python: {
            lines: [
                "for i in range(n-1):",
                "    min_idx = i",
                "    for j in range(i+1, n):",
                "        if arr[j] < arr[min_idx]:",
                "            min_idx = j",
                "    arr[i], arr[min_idx] = arr[min_idx], arr[i]"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
        }
    },

    // --- INSERTION SORT ---
    insertion: {
        c: {
            lines: [
                "for (int i = 1; i < n; i++) {",
                "    int key = arr[i];",
                "    int j = i - 1;",
                "    while (j >= 0 && arr[j] > key) {",
                "        arr[j + 1] = arr[j];",
                "        j = j - 1;",
                "    }",
                "    arr[j + 1] = key;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 7: 7 }
        },
        cpp: {
            lines: [
                "for (int i = 1; i < n; i++) {",
                "    int key = arr[i];",
                "    int j = i - 1;",
                "    while (j >= 0 && arr[j] > key) {",
                "        arr[j + 1] = arr[j];",
                "        j = j - 1;",
                "    }",
                "    arr[j + 1] = key;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 7: 7 }
        },
        java: {
            lines: [
                "for (int i = 1; i < n; i++) {",
                "    int key = arr[i];",
                "    int j = i - 1;",
                "    while (j >= 0 && arr[j] > key) {",
                "        arr[j + 1] = arr[j];",
                "        j = j - 1;",
                "    }",
                "    arr[j + 1] = key;",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 7: 7 }
        },
        python: {
            lines: [
                "for i in range(1, n):",
                "    key = arr[i]",
                "    j = i - 1",
                "    while j >= 0 and arr[j] > key:",
                "        arr[j + 1] = arr[j]",
                "        j -= 1",
                "    arr[j + 1] = key"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
        }
    }
    // Note: Merge and Quick sorts are often implemented recursively and harder to map 1:1 on a single screen without stack visualization
    // but I can add simplistic versions here for completeness.
};
