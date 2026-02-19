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
                "int front = -1, rear = -1;",
                "// Copy initial values",
                "for(int i=0; i<N; i++) {",
                "    if(front == -1) front = 0;",
                "    queue[++rear] = initValues[i];",
                "}"
            ],
            mapping: { 0: [0, 1], 1: [2, 3, 4, 5, 6] }
        },
        cpp: {
            lines: [
                "std::queue<int> q;",
                "for(int val : initValues) q.push(val);"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        java: {
            lines: [
                "Queue<Integer> queue = new LinkedList<>();",
                "for(int val : initValues) queue.offer(val);"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        python: {
            lines: [
                "from collections import deque",
                "queue = deque(initValues)"
            ],
            mapping: { 0: 0, 1: 1 }
        }
    },

    // --- ENQUEUE ---
    enqueue: {
        c: {
            lines: [
                "if (rear == MAX-1) return; // Overflow",
                "if (front == -1) front = 0;",
                "queue[++rear] = val;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2 }
        },
        cpp: {
            lines: [
                "q.push(val);"
            ],
            mapping: { 0: 0 }
        },
        java: {
            lines: [
                "queue.offer(val);"
            ],
            mapping: { 0: 0 }
        },
        python: {
            lines: [
                "queue.append(val)"
            ],
            mapping: { 0: 0 }
        }
    },

    // --- DEQUEUE ---
    dequeue: {
        c: {
            lines: [
                "if (front == -1) return -1; // Underflow",
                "int val = queue[front];",
                "if (front == rear) front = rear = -1;",
                "else front++;",
                "return val;"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 }
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
                "if (queue.isEmpty()) throw new NoSuchElementException();",
                "return queue.poll();"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        python: {
            lines: [
                "if not queue: return",
                "return queue.popleft()"
            ],
            mapping: { 0: 0, 1: 1 }
        }
    },

    // --- PEEK ---
    peek: {
        c: {
            lines: [
                "if (front == -1) return -1;",
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
                "if (queue.isEmpty()) return -1;",
                "return queue.peek();"
            ],
            mapping: { 0: 0, 1: 1 }
        },
        python: {
            lines: [
                "if not queue: return -1",
                "return queue[0]"
            ],
            mapping: { 0: 0, 1: 1 }
        }
    }
};
