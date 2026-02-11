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

    // --- MERGE SORT ---
    merge: {
        c: {
            lines: [
                "void merge(int arr[], int l, int m, int r) {",
                "    int n1 = m - l + 1;",
                "    int n2 = r - m;",
                "    int L[n1], R[n2];",
                "    for (int i = 0; i < n1; i++) L[i] = arr[l + i];",
                "    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];",
                "    int i = 0, j = 0, k = l;",
                "    while (i < n1 && j < n2) {",
                "        if (L[i] <= R[j]) arr[k++] = L[i++];",
                "        else arr[k++] = R[j++];",
                "    }",
                "    while (i < n1) arr[k++] = L[i++];",
                "    while (j < n2) arr[k++] = R[j++];",
                "}",
                "void mergeSort(int arr[], int l, int r) {",
                "    if (l < r) {",
                "        int m = l + (r - l) / 2;",
                "        mergeSort(arr, l, m);",
                "        mergeSort(arr, m + 1, r);",
                "        merge(arr, l, m, r);",
                "    }",
                "}"
            ],
            mapping: { 0: 14, 1: 15, 2: 17, 3: 18, 4: 19, 5: 0, 6: 20 } // Simplified mapping to recursive calls
        },
        cpp: {
            lines: [
                "void merge(vector<int>& arr, int l, int m, int r) {",
                "    int n1 = m - l + 1;",
                "    int n2 = r - m;",
                "    vector<int> L(n1), R(n2);",
                "    for (int i = 0; i < n1; i++) L[i] = arr[l + i];",
                "    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];",
                "    int i = 0, j = 0, k = l;",
                "    while (i < n1 && j < n2) {",
                "        if (L[i] <= R[j]) arr[k++] = L[i++];",
                "        else arr[k++] = R[j++];",
                "    }",
                "    while (i < n1) arr[k++] = L[i++];",
                "    while (j < n2) arr[k++] = R[j++];",
                "}",
                "void mergeSort(vector<int>& arr, int l, int r) {",
                "    if (l < r) {",
                "        int m = l + (r - l) / 2;",
                "        mergeSort(arr, l, m);",
                "        mergeSort(arr, m + 1, r);",
                "        merge(arr, l, m, r);",
                "    }",
                "}"
            ],
            mapping: { 0: 14, 1: 15, 2: 17, 3: 18, 4: 19, 5: 0, 6: 20 }
        },
        java: {
            lines: [
                "void merge(int arr[], int l, int m, int r) {",
                "    int n1 = m - l + 1;",
                "    int n2 = r - m;",
                "    int L[] = new int[n1];",
                "    int R[] = new int[n2];",
                "    for (int i = 0; i < n1; ++i) L[i] = arr[l + i];",
                "    for (int j = 0; j < n2; ++j) R[j] = arr[m + 1 + j];",
                "    int i = 0, j = 0, k = l;",
                "    while (i < n1 && j < n2) {",
                "        if (L[i] <= R[j]) arr[k++] = L[i++];",
                "        else arr[k++] = R[j++];",
                "    }",
                "    while (i < n1) arr[k++] = L[i++];",
                "    while (j < n2) arr[k++] = R[j++];",
                "}",
                "void sort(int arr[], int l, int r) {",
                "    if (l < r) {",
                "        int m = l + (r - l) / 2;",
                "        sort(arr, l, m);",
                "        sort(arr, m + 1, r);",
                "        merge(arr, l, m, r);",
                "    }",
                "}"
            ],
            mapping: { 0: 15, 1: 16, 2: 18, 3: 19, 4: 20, 5: 0, 6: 21 }
        },
        python: {
            lines: [
                "def merge(arr, l, m, r):",
                "    n1 = m - l + 1",
                "    n2 = r - m",
                "    L = arr[l:m+1]",
                "    R = arr[m+1:r+1]",
                "    i = j = 0",
                "    k = l",
                "    while i < n1 and j < n2:",
                "        if L[i] <= R[j]:",
                "            arr[k] = L[i]; i += 1",
                "        else:",
                "            arr[k] = R[j]; j += 1",
                "        k += 1",
                "    while i < n1:",
                "        arr[k] = L[i]; i += 1; k += 1",
                "    while j < n2:",
                "        arr[k] = R[j]; j += 1; k += 1",
                "",
                "def mergeSort(arr, l, r):",
                "    if l < r:",
                "        m = l + (r - l) // 2",
                "        mergeSort(arr, l, m)",
                "        mergeSort(arr, m + 1, r)",
                "        merge(arr, l, m, r)"
            ],
            mapping: { 0: 19, 1: 20, 2: 22, 3: 23, 4: 24, 5: 0, 6: 25 }
        }
    },

    // --- QUICK SORT ---
    quick: {
        c: {
            lines: [
                "int partition(int arr[], int low, int high) {",
                "    int pivot = arr[high];",
                "    int i = (low - 1);",
                "    for (int j = low; j <= high - 1; j++) {",
                "        if (arr[j] < pivot) {",
                "            i++;",
                "            swap(&arr[i], &arr[j]);",
                "        }",
                "    }",
                "    swap(&arr[i + 1], &arr[high]);",
                "    return (i + 1);",
                "}",
                "void quickSort(int arr[], int low, int high) {",
                "    if (low < high) {",
                "        int pi = partition(arr, low, high);",
                "        quickSort(arr, low, pi - 1);",
                "        quickSort(arr, pi + 1, high);",
                "    }",
                "}"
            ],
            mapping: { 0: 13, 1: 14, 2: 15, 3: 16, 4: 17, 5: 0, 6: 6 }
        },
        cpp: {
            lines: [
                "int partition(vector<int>& arr, int low, int high) {",
                "    int pivot = arr[high];",
                "    int i = (low - 1);",
                "    for (int j = low; j <= high - 1; j++) {",
                "        if (arr[j] < pivot) {",
                "            i++;",
                "            std::swap(arr[i], arr[j]);",
                "        }",
                "    }",
                "    std::swap(arr[i + 1], arr[high]);",
                "    return (i + 1);",
                "}",
                "void quickSort(vector<int>& arr, int low, int high) {",
                "    if (low < high) {",
                "        int pi = partition(arr, low, high);",
                "        quickSort(arr, low, pi - 1);",
                "        quickSort(arr, pi + 1, high);",
                "    }",
                "}"
            ],
            mapping: { 0: 13, 1: 14, 2: 15, 3: 16, 4: 17, 5: 0, 6: 6 }
        },
        java: {
            lines: [
                "int partition(int arr[], int low, int high) {",
                "    int pivot = arr[high];",
                "    int i = (low - 1);",
                "    for (int j = low; j < high; j++) {",
                "        if (arr[j] < pivot) {",
                "            i++;",
                "            int temp = arr[i];",
                "            arr[i] = arr[j];",
                "            arr[j] = temp;",
                "        }",
                "    }",
                "    int temp = arr[i+1];",
                "    arr[i+1] = arr[high];",
                "    arr[high] = temp;",
                "    return i+1;",
                "}",
                "void sort(int arr[], int low, int high) {",
                "    if (low < high) {",
                "        int pi = partition(arr, low, high);",
                "        sort(arr, low, pi - 1);",
                "        sort(arr, pi + 1, high);",
                "    }",
                "}"
            ],
            mapping: { 0: 17, 1: 18, 2: 19, 3: 20, 4: 21, 5: 0, 6: 12 }
        },
        python: {
            lines: [
                "def partition(arr, low, high):",
                "    pivot = arr[high]",
                "    i = low - 1",
                "    for j in range(low, high):",
                "        if arr[j] <= pivot:",
                "            i = i + 1",
                "            arr[i], arr[j] = arr[j], arr[i]",
                "    arr[i + 1], arr[high] = arr[high], arr[i + 1]",
                "    return i + 1",
                "",
                "def quickSort(arr, low, high):",
                "    if low < high:",
                "        pi = partition(arr, low, high)",
                "        quickSort(arr, low, pi - 1)",
                "        quickSort(arr, pi + 1, high)"
            ],
            mapping: { 0: 11, 1: 12, 2: 13, 3: 14, 4: 15, 5: 0, 6: 7 }
        }
    }
};
