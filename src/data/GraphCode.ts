export type Language = 'c' | 'cpp' | 'java' | 'python';

export interface CodeData {
    lines: string[];
    mapping: Record<number, number | number[]>;
}

export type OperationCodes = Record<string, Record<Language, CodeData>>;

export const GRAPH_CODE: OperationCodes = {
    // --- BFS ---
    bfs: {
        c: {
            lines: [
                "void bfs(int startNode) {",
                "    bool visited[V] = {false};",
                "    int queue[V]; int front=0, rear=0;",
                "    visited[startNode] = true;",
                "    queue[rear++] = startNode;",
                "    while (front < rear) {",
                "        int u = queue[front++];",
                "        // Process u...",
                "        for (int v : adj[u]) {",
                "            if (!visited[v]) {",
                "                visited[v] = true;",
                "                queue[rear++] = v;",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 8: 8, 9: 9, 10: 10, 11: 11 }
        },
        cpp: {
            lines: [
                "void bfs(int start) {",
                "    vector<bool> visited(V, false);",
                "    queue<int> q;",
                "    visited[start] = true;",
                "    q.push(start);",
                "    while (!q.empty()) {",
                "        int u = q.front(); q.pop();",
                "        for (int v : adj[u]) {",
                "            if (!visited[v]) {",
                "                visited[v] = true;",
                "                q.push(v);",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10 }
        },
        java: {
            lines: [
                "void bfs(int start) {",
                "    boolean[] visited = new boolean[V];",
                "    Queue<Integer> q = new LinkedList<>();",
                "    visited[start] = true;",
                "    q.offer(start);",
                "    while (!q.isEmpty()) {",
                "        int u = q.poll();",
                "        for (int v : adj.get(u)) {",
                "            if (!visited[v]) {",
                "                visited[v] = true;",
                "                q.offer(v);",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10 }
        },
        python: {
            lines: [
                "def bfs(start):",
                "    visited = [False] * V",
                "    queue = deque([start])",
                "    visited[start] = True",
                "    while queue:",
                "        u = queue.popleft()",
                "        for v in adj[u]:",
                "            if not visited[v]:",
                "                visited[v] = True",
                "                queue.append(v)"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 }
        }
    },

    // --- DFS ---
    dfs: {
        c: {
            lines: [
                "void dfs(int u, bool visited[]) {",
                "    visited[u] = true;",
                "    // Process u...",
                "    for (int v : adj[u]) {",
                "        if (!visited[v]) {",
                "            dfs(v, visited);",
                "        }",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 3: 3, 4: 4, 5: 5 }
        },
        cpp: {
            lines: [
                "void dfs(int u, vector<bool>& visited) {",
                "    visited[u] = true;",
                "    for (int v : adj[u]) {",
                "        if (!visited[v]) {",
                "            dfs(v, visited);",
                "        }",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 }
        },
        java: {
            lines: [
                "void dfs(int u, boolean[] visited) {",
                "    visited[u] = true;",
                "    for (int v : adj.get(u)) {",
                "        if (!visited[v]) {",
                "            dfs(v, visited);",
                "        }",
                "    }",
                "}"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 }
        },
        python: {
            lines: [
                "def dfs(u, visited):",
                "    visited[u] = True",
                "    for v in adj[u]:",
                "        if not visited[v]:",
                "            dfs(v, visited)"
            ],
            mapping: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 }
        }
    }
};
