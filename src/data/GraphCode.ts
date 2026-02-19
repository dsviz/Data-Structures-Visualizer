export type Language = 'python' | 'java' | 'c' | 'cpp';

export interface CodeData {
    lines: string[];
    mapping: Record<number, number[]>; // Maps step index to highlighted line numbers (0-indexed)
}

export const GRAPH_CODE: Record<string, Record<Language, CodeData>> = {
    bfs: {
        python: {
            lines: [
                "def bfs(graph, start_node):",
                "    visited = set()",
                "    queue = [start_node]",
                "    visited.add(start_node)",
                "",
                "    while queue:",
                "        vertex = queue.pop(0)",
                "        print(vertex)",
                "",
                "        for neighbor in graph[vertex]:",
                "            if neighbor not in visited:",
                "                visited.add(neighbor)",
                "                queue.append(neighbor)"
            ],
            mapping: {
                0: [0, 1, 2, 3], // Init
                1: [5], // While check
                2: [6, 7], // Pop and process
                3: [9], // For loop
                4: [10], // Check visited
                5: [11, 12] // Add to queue
            }
        },
        java: {
            lines: [
                "void bfs(int startNode) {",
                "    boolean[] visited = new boolean[V];",
                "    LinkedList<Integer> queue = new LinkedList<Integer>();",
                "",
                "    visited[startNode] = true;",
                "    queue.add(startNode);",
                "",
                "    while (queue.size() != 0) {",
                "        int s = queue.poll();",
                "        System.out.print(s + \" \");",
                "",
                "        Iterator<Integer> i = adj[s].listIterator();",
                "        while (i.hasNext()) {",
                "            int n = i.next();",
                "            if (!visited[n]) {",
                "                visited[n] = true;",
                "                queue.add(n);",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 4, 5],
                1: [7],
                2: [8, 9],
                3: [12],
                4: [14],
                5: [15, 16]
            }
        },
        c: {
            lines: [
                "void bfs(struct Graph* graph, int startVertex) {",
                "    struct Node* adjList = graph->adjLists[startVertex];",
                "    struct Node* temp = adjList;",
                "",
                "    graph->visited[startVertex] = 1;",
                "    enqueue(&q, startVertex);",
                "",
                "    while (!isEmpty(&q)) {",
                "        int currentVertex = dequeue(&q);",
                "        printf(\"Visited %d\\n\", currentVertex);",
                "",
                "        temp = graph->adjLists[currentVertex];",
                "",
                "        while (temp) {",
                "            int adjVertex = temp->vertex;",
                "            if (graph->visited[adjVertex] == 0) {",
                "                graph->visited[adjVertex] = 1;",
                "                enqueue(&q, adjVertex);",
                "            }",
                "            temp = temp->next;",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 4, 5],
                1: [7],
                2: [8, 9],
                3: [13],
                4: [15],
                5: [16, 17]
            }
        },
        cpp: {
            lines: [
                "void BFS(int s) {",
                "    vector<bool> visited(V, false);",
                "    list<int> queue;",
                "",
                "    visited[s] = true;",
                "    queue.push_back(s);",
                "",
                "    while(!queue.empty()) {",
                "        s = queue.front();",
                "        cout << s << \" \";",
                "        queue.pop_front();",
                "",
                "        for(auto i : adj[s]) {",
                "            if(!visited[i]) {",
                "                visited[i] = true;",
                "                queue.push_back(i);",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 4, 5],
                1: [7],
                2: [8, 9, 10],
                3: [12],
                4: [13],
                5: [14, 15]
            }
        }
    },
    dfs: {
        python: {
            lines: [
                "def dfs(graph, start, visited=None):",
                "    if visited is None:",
                "        visited = set()",
                "    visited.add(start)",
                "    print(start)",
                "    for next in graph[start] - visited:",
                "        dfs(graph, next, visited)",
                "    return visited"
            ],
            mapping: {
                0: [0, 1, 2, 3],
                1: [4],
                2: [5],
                3: [6],
                4: [7]
            }
        },
        java: {
            lines: [
                "void dfs(int v, boolean visited[]) {",
                "    visited[v] = true;",
                "    System.out.print(v + \" \");",
                "",
                "    Iterator<Integer> i = adj[v].listIterator();",
                "    while (i.hasNext()) {",
                "        int n = i.next();",
                "        if (!visited[n])",
                "            dfs(n, visited);",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1],
                1: [2],
                2: [5],
                3: [7],
                4: [8]
            }
        },
        c: {
            lines: [
                "void dfs(struct Graph* graph, int vertex) {",
                "    struct Node* adjList = graph->adjLists[vertex];",
                "    struct Node* temp = adjList;",
                "",
                "    graph->visited[vertex] = 1;",
                "    printf(\"Visited %d \\n\", vertex);",
                "",
                "    while (temp != NULL) {",
                "        int connectedVertex = temp->vertex;",
                "        if (graph->visited[connectedVertex] == 0) {",
                "            dfs(graph, connectedVertex);",
                "        }",
                "        temp = temp->next;",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 4],
                1: [5],
                2: [7],
                3: [9],
                4: [10]
            }
        },
        cpp: {
            lines: [
                "void DFS(int v) {",
                "    visited[v] = true;",
                "    cout << v << \" \";",
                "",
                "    list<int>::iterator i;",
                "    for (i = adj[v].begin(); i != adj[v].end(); ++i)",
                "        if (!visited[*i])",
                "            DFS(*i);",
                "}"
            ],
            mapping: {
                0: [0, 1],
                1: [2],
                2: [5],
                3: [6],
                4: [7]
            }
        }
    },
    dijkstra: {
        python: {
            lines: [
                "import heapq",
                "",
                "def dijkstra(graph, start):",
                "    distances = {node: float('infinity') for node in graph}",
                "    distances[start] = 0",
                "    pq = [(0, start)]",
                "",
                "    while pq:",
                "        current_dist, current_node = heapq.heappop(pq)",
                "",
                "        if current_dist > distances[current_node]:",
                "            continue",
                "",
                "        for neighbor, weight in graph[current_node].items():",
                "            distance = current_dist + weight",
                "",
                "            if distance < distances[neighbor]:",
                "                distances[neighbor] = distance",
                "                heapq.heappush(pq, (distance, neighbor))",
                "",
                "    return distances"
            ],
            mapping: {
                0: [0, 2, 3, 4, 5],
                1: [7],
                2: [8],
                3: [10, 11],
                4: [13],
                5: [16],
                6: [17, 18]
            }
        },
        java: {
            lines: [
                "void dijkstra(int start) {",
                "    PriorityQueue<Node> pq = new PriorityQueue<>();",
                "    pq.add(new Node(start, 0));",
                "    dist[start] = 0;",
                "",
                "    while (!pq.isEmpty()) {",
                "        int u = pq.poll().node;",
                "",
                "        for (Node v : adj[u]) {",
                "            if (dist[v.node] > dist[u] + v.weight) {",
                "                dist[v.node] = dist[u] + v.weight;",
                "                pq.add(new Node(v.node, dist[v.node]));",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 3],
                1: [5],
                2: [6],
                3: [8],
                4: [9],
                5: [10, 11]
            }
        },
        c: {
            lines: [
                "void dijkstra(int start) {",
                "    int dist[V];",
                "    for(int i=0; i<V; i++) dist[i] = INT_MAX;",
                "    dist[start] = 0;",
                "",
                "    // Using array as priority queue for simplicity",
                "    int min_dist, u;",
                "    while(1) {",
                "        min_dist = INT_MAX; u = -1;",
                "        for(int i=0; i<V; i++)",
                "            if(!visited[i] && dist[i] < min_dist)",
                "                { min_dist = dist[i]; u = i; }",
                "",
                "        if(u == -1) break;",
                "        visited[u] = 1;",
                "",
                "        for(int v=0; v<V; v++)",
                "            if(graph[u][v] && dist[u] != INT_MAX",
                "               && dist[u]+graph[u][v] < dist[v])",
                "                dist[v] = dist[u] + graph[u][v];",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 3],
                1: [7, 8, 9, 10, 11],
                2: [13, 14],
                3: [16, 17, 18, 19]
            }
        },
        cpp: {
            lines: [
                "void dijkstra(int src) {",
                "    priority_queue<iPair, vector<iPair>, greater<iPair>> pq;",
                "    vector<int> dist(V, INF);",
                "",
                "    pq.push(make_pair(0, src));",
                "    dist[src] = 0;",
                "",
                "    while (!pq.empty()) {",
                "        int u = pq.top().second;",
                "        pq.pop();",
                "",
                "        for (auto x : adj[u]) {",
                "            int v = x.first;",
                "            int weight = x.second;",
                "",
                "            if (dist[v] > dist[u] + weight) {",
                "                dist[v] = dist[u] + weight;",
                "                pq.push(make_pair(dist[v], v));",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 4, 5],
                1: [7],
                2: [8, 9],
                3: [11],
                4: [16],
                5: [17, 18]
            }
        }
    },
    prim: {
        python: {
            lines: [
                "import heapq",
                "",
                "def prim(graph, start):",
                "    mst = []",
                "    visited = set([start])",
                "    edges = [ (cost, start, to) for to, cost in graph[start].items() ]",
                "    heapq.heapify(edges)",
                "",
                "    while edges:",
                "        cost, frm, to = heapq.heappop(edges)",
                "        if to not in visited:",
                "            visited.add(to)",
                "            mst.append((frm, to, cost))",
                "",
                "            for to_next, cost2 in graph[to].items():",
                "                if to_next not in visited:",
                "                    heapq.heappush(edges, (cost2, to, to_next))",
                "",
                "    return mst"
            ],
            mapping: {
                0: [0, 2, 3, 4, 5, 6],
                1: [8],
                2: [9],
                3: [10],
                4: [11, 12],
                5: [14],
                6: [15, 16]
            }
        },
        java: {
            lines: [
                "void prim(int start) {",
                "    boolean[] inMST = new boolean[V];",
                "    PriorityQueue<Edge> pq = new PriorityQueue<>();",
                "    pq.add(new Edge(start, 0));",
                "",
                "    while (!pq.isEmpty()) {",
                "        int u = pq.poll().to;",
                "        if (inMST[u]) continue;",
                "        inMST[u] = true;",
                "",
                "        for (Edge e : adj[u]) {",
                "            if (!inMST[e.to]) {",
                "                pq.add(e);",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 3],
                1: [5],
                2: [6],
                3: [7, 8],
                4: [10],
                5: [11, 12]
            }
        },
        c: {
            lines: [
                "void prim() {",
                "    int parent[V], key[V], mstSet[V];",
                "    for (int i = 0; i < V; i++)",
                "        key[i] = INT_MAX, mstSet[i] = 0;",
                "",
                "    key[0] = 0; parent[0] = -1;",
                "",
                "    for (int count = 0; count < V - 1; count++) {",
                "        int u = minKey(key, mstSet); // Pick min key",
                "        mstSet[u] = 1;",
                "",
                "        for (int v = 0; v < V; v++)",
                "            if (graph[u][v] && mstSet[v] == 0 && graph[u][v] < key[v])",
                "                parent[v] = u, key[v] = graph[u][v];",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 3, 5],
                1: [7],
                2: [8, 9],
                3: [11, 12, 13]
            }
        },
        cpp: {
            lines: [
                "void prim() {",
                "    priority_queue<iPair, vector<iPair>, greater<iPair>> pq;",
                "    int src = 0;",
                "    vector<int> key(V, INF);",
                "    vector<int> parent(V, -1);",
                "    vector<bool> inMST(V, false);",
                "",
                "    pq.push(make_pair(0, src));",
                "    key[src] = 0;",
                "",
                "    while (!pq.empty()) {",
                "        int u = pq.top().second;",
                "        pq.pop();",
                "        inMST[u] = true;",
                "",
                "        for (auto x : adj[u]) {",
                "            int v = x.first;",
                "            int weight = x.second;",
                "            if (inMST[v] == false && key[v] > weight) {",
                "                key[v] = weight;",
                "                pq.push(make_pair(key[v], v));",
                "                parent[v] = u;",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 3, 4, 5, 7, 8],
                1: [10],
                2: [11, 12, 13],
                3: [15],
                4: [18, 19, 20, 21]
            }
        }
    },
    kruskal: {
        python: {
            lines: [
                "def find(parent, i):",
                "    if parent[i] == i: return i",
                "    return find(parent, parent[i])",
                "",
                "def union(parent, rank, x, y):",
                "    xroot = find(parent, x)",
                "    yroot = find(parent, y)",
                "    if rank[xroot] < rank[yroot]: parent[xroot] = yroot",
                "    elif rank[xroot] > rank[yroot]: parent[yroot] = xroot",
                "    else: parent[yroot] = xroot; rank[xroot] += 1",
                "",
                "def kruskal(graph):",
                "    result = []",
                "    i, e = 0, 0",
                "    graph = sorted(graph, key=lambda item: item[2])",
                "    parent, rank = [], []",
                "    for node in range(V):",
                "        parent.append(node); rank.append(0)",
                "",
                "    while e < V - 1:",
                "        u, v, w = graph[i]",
                "        i = i + 1",
                "        x = find(parent, u)",
                "        y = find(parent, v)",
                "",
                "        if x != y:",
                "            e = e + 1",
                "            result.append([u, v, w])",
                "            union(parent, rank, x, y)",
                "    return result"
            ],
            mapping: {
                0: [11, 12, 13, 14, 15, 16, 17],
                1: [19],
                2: [20, 21],
                3: [22, 23],
                4: [25],
                5: [26, 27, 28]
            }
        },
        java: {
            lines: [
                "void kruskal() {",
                "    Edge result[] = new Edge[V];",
                "    int e = 0, i = 0;",
                "    Arrays.sort(edge);",
                "",
                "    Subset subsets[] = new Subset[V];",
                "    for (i = 0; i < V; ++i) subsets[i] = new Subset();",
                "",
                "    while (e < V - 1) {",
                "        Edge next_edge = edge[i++];",
                "        int x = find(subsets, next_edge.src);",
                "        int y = find(subsets, next_edge.dest);",
                "",
                "        if (x != y) {",
                "            result[e++] = next_edge;",
                "            Union(subsets, x, y);",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 3, 5, 6],
                1: [8],
                2: [9],
                3: [10, 11],
                4: [13],
                5: [14, 15]
            }
        },
        c: {
            lines: [
                "void Kruskal(struct Graph* graph) {",
                "    int V = graph->V;",
                "    struct Edge result[V];",
                "    int e = 0, i = 0;",
                "    qsort(graph->edge, graph->E, sizeof(graph->edge[0]), myComp);",
                "",
                "    struct subset* subsets = (struct subset*)malloc(V * sizeof(struct subset));",
                "    for (int v = 0; v < V; ++v) {",
                "        subsets[v].parent = v;",
                "        subsets[v].rank = 0;",
                "    }",
                "",
                "    while (e < V - 1 && i < graph->E) {",
                "        struct Edge next_edge = graph->edge[i++];",
                "        int x = find(subsets, next_edge.src);",
                "        int y = find(subsets, next_edge.dest);",
                "",
                "        if (x != y) {",
                "            result[e++] = next_edge;",
                "            Union(subsets, x, y);",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 3, 4, 6, 7],
                1: [12],
                2: [13],
                3: [14, 15],
                4: [17],
                5: [18, 19]
            }
        },
        cpp: {
            lines: [
                "void Kruskal(Graph& g) {",
                "    sort(g.edges.begin(), g.edges.end());",
                "    DisjointSet ds(g.V);",
                "",
                "    for (auto it : g.edges) {",
                "        int u = it.u;",
                "        int v = it.v;",
                "        int wt = it.weight;",
                "",
                "        if (ds.findUPar(u) != ds.findUPar(v)) {",
                "            ds.unionByRank(u, v);",
                "            mstWeight += wt;",
                "            mstEdges.push_back({u, v});",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2],
                1: [4],
                2: [5, 6, 7],
                3: [9],
                4: [10, 11, 12]
            }
        }
    }
};

export const COMPLEXITY = {
    bfs: { best: "O(V + E)", avg: "O(V + E)", worst: "O(V + E)" },
    dfs: { best: "O(V + E)", avg: "O(V + E)", worst: "O(V + E)" },
    dijkstra: { best: "O(E log V)", avg: "O(E log V)", worst: "O(V^2)" },
    prim: { best: "O(E log V)", avg: "O(E log V)", worst: "O(V^2)" },
    kruskal: { best: "O(E log E)", avg: "O(E log E)", worst: "O(E log V)" }
};
