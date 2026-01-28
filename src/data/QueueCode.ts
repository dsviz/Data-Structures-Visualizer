export type Language = 'c' | 'cpp' | 'java' | 'python';

export interface CodeData {
    lines: string[];
    mapping: Record<number, number | number[]>;
}

export type OperationCodes = Record<string, Record<Language, CodeData>>;

export const QUEUE_CODE: OperationCodes = {
    // --- CREATE ---
    create: {
        c: {
            lines: [
                "int queue[MAX];",
                "int front = 0, rear = -1;",
                "// Copy initial values",
                "for(int i=0; i<N; i++) queue[++rear] = initValues[i];"
            ],
            mapping: { 0: [0, 1], 1: 2, 2: 3 }
        },
        cpp: {
            lines: [
                "std::queue<int> q;",
                "for(int val : initValues) q.push(val);"
            ],
            mapping: { 0: 0, 1: 1, 2: 1 }
        },
        java: {
            lines: [
                "Queue<Integer> q = new LinkedList<>();",
                "for(int val : initValues) q.offer(val);"
            ],
            mapping: { 0: 0, 1: 1, 2: 1 }
        },
        python: {
            lines: [
                "from collections import deque",
                "q = deque(initValues)"
            ],
            mapping: { 0: 0, 1: 1, 2: 1 }
        }
    },

    // --- ENQUEUE ---
    enqueue: {
        c: {
            lines: [
                "if (rear == MAX-1) return; // Overflow",
                "queue[++rear] = val;"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        cpp: {
            lines: [
                "q.push(val);"
            ],
            mapping: { 0: 0, 1: 0 }
        },
        java: {
            lines: [
                "q.offer(val);"
            ],
            mapping: { 0: 0, 1: 0 }
        },
        python: {
            lines: [
                "q.append(val)"
            ],
            mapping: { 0: 0, 1: 0 }
        }
    },

    // --- DEQUEUE ---
    dequeue: {
        c: {
            lines: [
                "if (front > rear) return -1; // Underflow",
                "return queue[front++];"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        cpp: {
            lines: [
                "if (q.empty()) return;",
                "q.pop();"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        java: {
            lines: [
                "if (q.isEmpty()) return null;",
                "return q.poll();"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        python: {
            lines: [
                "if not q: return",
                "return q.popleft()"
            ],
            mapping: { 0: 0, 1: 1 }
        }
    },

    // --- PEEK ---
    peek: {
        c: {
            lines: [
                "if (front > rear) return -1;",
                "return queue[front];"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        cpp: {
            lines: [
                "if (q.empty()) return -1;",
                "return q.front();"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        java: {
            lines: [
                "if (q.isEmpty()) return null;",
                "return q.peek();"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        python: {
            lines: [
                "if not q: return",
                "return q[0]"
            ],
            mapping: { 0: 0, 1: 1 }
        }
    }
};
