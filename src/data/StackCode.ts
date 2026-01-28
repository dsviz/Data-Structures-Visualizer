export type Language = 'c' | 'cpp' | 'java' | 'python';

export interface CodeData {
    lines: string[];
    mapping: Record<number, number | number[]>;
}

export type OperationCodes = Record<string, Record<Language, CodeData>>;

export const STACK_CODE: OperationCodes = {
    // --- CREATE ---
    create: {
        c: {
            lines: [
                "int stack[MAX];",
                "int top = -1;",
                "// Copy initial values",
                "for(int i=0; i<N; i++) stack[++top] = initValues[i];"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 3 }
        },
        cpp: {
            lines: [
                "std::stack<int> s;",
                "for(int val : initValues) s.push(val);"
            ],
            mapping: { 0: 0, 1: 1, 2: 1 }
        },
        java: {
            lines: [
                "Stack<Integer> stack = new Stack<>();",
                "for(int val : initValues) stack.push(val);"
            ],
            mapping: { 0: 0, 1: 1, 2: 1 }
        },
        python: {
            lines: [
                "stack = []",
                "for val in initValues: stack.append(val)"
            ],
            mapping: { 0: 0, 1: 1, 2: 1 }
        }
    },

    // --- PUSH ---
    push: {
        c: {
            lines: [
                "if (top >= MAX-1) return; // Overflow",
                "stack[++top] = val;"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        cpp: {
            lines: [
                "s.push(val);"
            ],
            mapping: { 0: 0, 1: 0 }
        },
        java: {
            lines: [
                "stack.push(val);"
            ],
            mapping: { 0: 0, 1: 0 }
        },
        python: {
            lines: [
                "stack.append(val)"
            ],
            mapping: { 0: 0, 1: 0 }
        }
    },

    // --- POP ---
    pop: {
        c: {
            lines: [
                "if (top < 0) return -1; // Underflow",
                "return stack[top--];"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        cpp: {
            lines: [
                "if (s.empty()) return;",
                "s.pop();"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        java: {
            lines: [
                "if (stack.isEmpty()) throw new EmptyStackException();",
                "return stack.pop();"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        python: {
            lines: [
                "if not stack: return",
                "return stack.pop()"
            ],
            mapping: { 0: 0, 1: 1 }
        }
    },

    // --- PEEK ---
    peek: {
        c: {
            lines: [
                "if (top < 0) return -1;",
                "return stack[top];"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        cpp: {
            lines: [
                "if (s.empty()) return -1;",
                "return s.top();"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        java: {
            lines: [
                "if (stack.isEmpty()) return -1;",
                "return stack.peek();"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        python: {
            lines: [
                "if not stack: return -1",
                "return stack[-1]"
            ],
            mapping: { 0: 0, 1: 1 }
        }
    }
};
