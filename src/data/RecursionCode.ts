export type Language = 'c' | 'cpp' | 'java' | 'python';

export interface CodeData {
    lines: string[];
    mapping: Record<number, number | number[]>;
}

export type OperationCodes = Record<string, Record<Language, CodeData>>;

export const RECURSION_CODE: OperationCodes = {
    // --- FACTORIAL ---
    factorial: {
        c: {
            lines: [
                "int factorial(int n) {",
                "    if (n <= 1) return 1;",
                "    return n * factorial(n - 1);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        },
        cpp: {
            lines: [
                "int factorial(int n) {",
                "    if (n <= 1) return 1;",
                "    return n * factorial(n - 1);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        },
        java: {
            lines: [
                "int factorial(int n) {",
                "    if (n <= 1) return 1;",
                "    return n * factorial(n - 1);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        },
        python: {
            lines: [
                "def factorial(n):",
                "    if n <= 1: return 1",
                "    return n * factorial(n - 1)"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        }
    },

    // --- FIBONACCI ---
    fibonacci: {
        c: {
            lines: [
                "int fib(int n) {",
                "    if (n <= 1) return n;",
                "    return fib(n-1) + fib(n-2);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        },
        cpp: {
            lines: [
                "int fib(int n) {",
                "    if (n <= 1) return n;",
                "    return fib(n-1) + fib(n-2);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        },
        java: {
            lines: [
                "int fib(int n) {",
                "    if (n <= 1) return n;",
                "    return fib(n-1) + fib(n-2);",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        },
        python: {
            lines: [
                "def fib(n):",
                "    if n <= 1: return n",
                "    return fib(n-1) + fib(n-2)"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        }
    }
};
