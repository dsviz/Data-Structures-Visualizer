import { OperationCodes } from './LinkedListCode';

export const ARRAYS_CODE: OperationCodes = {
    insert: {
        c: {
            lines: [
                "if (n >= capacity) { return -1; } // Error: Capacity reached",
                "for (int i = n - 1; i >= index; i--) {",
                "    arr[i + 1] = arr[i];",
                "}",
                "arr[index] = val;",
                "n++;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 5 }
        },
        cpp: {
            lines: [
                "if (n >= capacity) { return -1; }",
                "for (int i = n - 1; i >= index; i--) {",
                "    arr[i + 1] = arr[i];",
                "}",
                "arr[index] = val;",
                "n++;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 5 }
        },
        java: {
            lines: [
                "if (n >= capacity) { throw new Exception(\"Full\"); }",
                "for (int i = n - 1; i >= index; i--) {",
                "    arr[i + 1] = arr[i];",
                "}",
                "arr[index] = val;",
                "n++;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 5 }
        },
        python: {
            lines: [
                "if n >= capacity: raise Exception('Full')",
                "# Python lists are dynamic, but logic mimics fixed array:",
                "arr.append(None) # Expand",
                "for i in range(n - 1, index - 1, -1):",
                "    arr[i + 1] = arr[i]",
                "arr[index] = val",
                "n += 1"
            ],
            mapping: { 0: 0, 1: 3, 2: 4, 3: 5, 4: 6 }
        }
    },
    remove: {
        c: {
            lines: [
                "if (index < 0 || index >= n) return -1;",
                "for (int i = index; i < n - 1; i++) {",
                "    arr[i] = arr[i + 1];",
                "}",
                "n--;",
                "arr[n] = 0; // Optional cleanup"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4 } // Simplified mapping based on logic
        },
        cpp: {
            lines: [
                "if (index < 0 || index >= n) return -1;",
                "for (int i = index; i < n - 1; i++) {",
                "    arr[i] = arr[i + 1];",
                "}",
                "n--;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4 }
        },
        java: {
            lines: [
                "if (index < 0 || index >= n) throw new IndexOutOfBoundsException();",
                "for (int i = index; i < n - 1; i++) {",
                "    arr[i] = arr[i + 1];",
                "}",
                "n--;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4 }
        },
        python: {
            lines: [
                "if index < 0 or index >= n: raise IndexError()",
                "for i in range(index, n - 1):",
                "    arr[i] = arr[i + 1]",
                "arr.pop() # Remove last element",
                "n -= 1"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 4 }
        }
    },
    search_linear: {
        c: {
            lines: [
                "for (int i = 0; i < n; i++) {",
                "    if (arr[i] == target) {",
                "        return i;",
                "    }",
                "}",
                "return -1;"
            ],
            mapping: { 1: 0, 2: 1, 3: 5 } // 1: loop/check, 2: found, 3: not found
        },
        cpp: {
            lines: [
                "for (int i = 0; i < n; i++) {",
                "    if (arr[i] == target) return i;",
                "}",
                "return -1;"
            ],
            mapping: { 1: 0, 2: 1, 3: 3 }
        },
        java: {
            lines: [
                "for (int i = 0; i < n; i++) {",
                "    if (arr[i] == target) return i;",
                "}",
                "return -1;"
            ],
            mapping: { 1: 0, 2: 1, 3: 3 }
        },
        python: {
            lines: [
                "for i in range(n):",
                "    if arr[i] == target:",
                "        return i",
                "return -1"
            ],
            mapping: { 1: 0, 2: 1, 3: 3 }
        }
    },
    search_binary: {
        c: {
            lines: [
                "int low = 0, high = n - 1;",
                "while (low <= high) {",
                "    int mid = low + (high - low) / 2;",
                "    if (arr[mid] == target) return mid;",
                "    if (arr[mid] < target) low = mid + 1;",
                "    else high = mid - 1;",
                "}",
                "return -1;"
            ],
            mapping: { 0: 0, 2: 1, 3: 3, 4: 4, 5: 5, 6: 7 }
        },
        cpp: {
            lines: [
                "int low = 0, high = n - 1;",
                "while (low <= high) {",
                "    int mid = low + (high - low) / 2;",
                "    if (arr[mid] == target) return mid;",
                "    if (arr[mid] < target) low = mid + 1;",
                "    else high = mid - 1;",
                "}",
                "return -1;"
            ],
            mapping: { 0: 0, 2: 1, 3: 3, 4: 4, 5: 5, 6: 7 }
        },
        java: {
            lines: [
                "int low = 0, high = n - 1;",
                "while (low <= high) {",
                "    int mid = low + (high - low) / 2;",
                "    if (arr[mid] == target) return mid;",
                "    if (arr[mid] < target) low = mid + 1;",
                "    else high = mid - 1;",
                "}",
                "return -1;"
            ],
            mapping: { 0: 0, 2: 1, 3: 3, 4: 4, 5: 5, 6: 7 }
        },
        python: {
            lines: [
                "low = 0; high = n - 1",
                "while low <= high:",
                "    mid = (low + high) // 2",
                "    if arr[mid] == target: return mid",
                "    if arr[mid] < target: low = mid + 1",
                "    else: high = mid - 1",
                "return -1"
            ],
            mapping: { 0: 0, 2: 1, 3: 3, 4: 4, 5: 5, 6: 6 }
        }
    },
    update: {
        c: {
            lines: [
                "if (index < 0 || index >= n) return -1;", // 0: Locate
                "arr[index] = val;",                     // 1: Update
                "return 0;"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        cpp: {
            lines: [
                "if (index < 0 || index >= n) return -1;",
                "arr[index] = val;"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        java: {
            lines: [
                "if (index < 0 || index >= n) throw new Error();",
                "arr[index] = val;"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        python: {
            lines: [
                "if index < 0 or index >= n: raise Error",
                "arr[index] = val"
            ],
            mapping: { 0: 0, 1: 1 }
        }
    },
    create: {
        c: {
            lines: [
                "int* arr = (int*)malloc(N * sizeof(int));", // 2: Init/Alloc
                "int n = 0;",
                "// Fill logic...",
                "arr[n++] = val;"
            ],
            mapping: { 2: 0 }
        },
        cpp: {
            lines: [
                "int* arr = new int[N];",
                "int n = 0;",
                "// Fill logic...",
                "arr[n++] = val;"
            ],
            mapping: { 2: 0 }
        },
        java: {
            lines: [
                "int[] arr = new int[N];",
                "int n = 0;",
                "// Fill logic...",
                "arr[n++] = val;"
            ],
            mapping: { 2: 0 }
        },
        python: {
            lines: [
                "arr = [None] * N",
                "n = 0",
                "# Fill logic...",
                "arr[n] = val; n += 1"
            ],
            mapping: { 2: 0 }
        }
    },
    reverse: {
        c: {
            lines: [
                "int left = 0, right = n - 1;",
                "while (left < right) {",
                "    int temp = arr[left];",
                "    arr[left] = arr[right];",
                "    arr[right] = temp;",
                "    left++; right--;",
                "}"
            ],
            mapping: { 1: 1, 2: 2 }
        },
        cpp: {
            lines: [
                "int left = 0, right = n - 1;",
                "while (left < right) {",
                "    std::swap(arr[left++], arr[right--]);",
                "}"
            ],
            mapping: { 1: 1, 2: 2 }
        },
        java: {
            lines: [
                "int left = 0, right = n - 1;",
                "while (left < right) {",
                "    int temp = arr[left];",
                "    arr[left] = arr[right];",
                "    arr[right] = temp;",
                "    left++; right--;",
                "}"
            ],
            mapping: { 1: 1, 2: 2 }
        },
        python: {
            lines: [
                "left, right = 0, n - 1",
                "while left < right:",
                "    arr[left], arr[right] = arr[right], arr[left]",
                "    left += 1; right -= 1"
            ],
            mapping: { 1: 1, 2: 2 }
        }
    },
    '2sum': {
        c: {
            lines: [
                "// Assuming sorted array",
                "int L = 0, R = n - 1;",
                "while (L < R) {",
                "    int sum = arr[L] + arr[R];",
                "    if (sum == target) return {L, R};",
                "    if (sum < target) L++;",
                "    else R--;",
                "}"
            ],
            mapping: { 1: 2, 2: 4, 3: 5, 4: 6 }
        },
        cpp: {
            lines: [
                "int L = 0, R = n - 1;",
                "while (L < R) {",
                "    int sum = arr[L] + arr[R];",
                "    if (sum == target) return {L, R};",
                "    if (sum < target) L++;",
                "    else R--;",
                "}"
            ],
            mapping: { 1: 1, 2: 3, 3: 4, 4: 5 }
        },
        java: {
            lines: [
                "int L = 0, R = n - 1;",
                "while (L < R) {",
                "    int sum = arr[L] + arr[R];",
                "    if (sum == target) return new int[]{L, R};",
                "    if (sum < target) L++;",
                "    else R--;",
                "}"
            ],
            mapping: { 1: 1, 2: 3, 3: 4, 4: 5 }
        },
        python: {
            lines: [
                "L, R = 0, n - 1",
                "while L < R:",
                "    s = arr[L] + arr[R]",
                "    if s == target: return L, R",
                "    if s < target: L += 1",
                "    else: R -= 1"
            ],
            mapping: { 1: 1, 2: 3, 3: 4, 4: 5 }
        }
    },
    cycle_detection: {
        c: {
            lines: [
                "int slow = 0, fast = 0;",
                "while (1) {",
                "    slow = arr[slow];",
                "    fast = arr[arr[fast]];",
                "    if (slow == fast) return true;",
                "}"
            ],
            mapping: { 0: 0, 1: 2, 2: 4 }
        },
        cpp: {
            lines: [
                "int slow = 0, fast = 0;",
                "while (true) {",
                "    slow = arr[slow];",
                "    fast = arr[arr[fast]];",
                "    if (slow == fast) return true;",
                "}"
            ],
            mapping: { 0: 0, 1: 2, 2: 4 }
        },
        java: {
            lines: [
                "int slow = 0, fast = 0;",
                "while (true) {",
                "    slow = arr[slow];",
                "    fast = arr[arr[fast]];",
                "    if (slow == fast) return true;",
                "}"
            ],
            mapping: { 0: 0, 1: 2, 2: 4 }
        },
        python: {
            lines: [
                "slow = fast = 0",
                "while True:",
                "    slow = arr[slow]",
                "    fast = arr[arr[fast]]",
                "    if slow == fast: return True"
            ],
            mapping: { 0: 0, 1: 2, 2: 4 }
        }
    }
};
