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
    },
    boruvka: {
        python: {
            lines: [
                "def boruvka(graph):",
                "    parent = []",
                "    rank = []",
                "    cheapest = []",
                "    numTrees = V",
                "    MSTweight = 0",
                "",
                "    # Initialize Union-Find",
                "    for node in range(V):",
                "        parent.append(node)",
                "        rank.append(0)",
                "        cheapest.append(-1)",
                "",
                "    while numTrees > 1:",
                "        # Find cheapest edge for each component",
                "        for u, v, w in graph:",
                "            set1 = find(parent, u)",
                "            set2 = find(parent, v)",
                "            if set1 != set2:",
                "                if cheapest[set1] == -1 or cheapest[set1][2] > w:",
                "                    cheapest[set1] = [u, v, w]",
                "                if cheapest[set2] == -1 or cheapest[set2][2] > w:",
                "                    cheapest[set2] = [u, v, w]",
                "",
                "        # Add cheapest edges to MST",
                "        for node in range(V):",
                "            if cheapest[node] != -1:",
                "                u, v, w = cheapest[node]",
                "                set1 = find(parent, u)",
                "                set2 = find(parent, v)",
                "                if set1 != set2:",
                "                    MSTweight += w",
                "                    union(parent, rank, set1, set2)",
                "                    print(f'Edge {u}-{v} added')",
                "                    numTrees -= 1",
                "        ",
                "        # Reset cheapest array",
                "        cheapest = [-1] * V"
            ],
            mapping: {
                0: [0, 1, 2, 3, 4, 5, 8, 9, 10, 11],
                1: [13],
                2: [15, 16, 17, 18, 19, 20, 21, 22],
                3: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
                4: [38]
            }
        },
        java: {
            lines: [
                "void boruvka() {",
                "    int numTrees = V;",
                "    int MSTweight = 0;",
                "    // ... Init Union-Find ...",
                "",
                "    while (numTrees > 1) {",
                "        // Reset cheapest",
                "        for (int v = 0; v < V; ++v) cheapest[v] = -1;",
                "",
                "        // Find cheapest edge for each component",
                "        for (int i = 0; i < E; ++i) {",
                "            int set1 = find(edge[i].src);",
                "            int set2 = find(edge[i].dest);",
                "            if (set1 != set2) {",
                "                if (cheapest[set1] == -1 || edge[cheapest[set1]].weight > edge[i].weight)",
                "                    cheapest[set1] = i;",
                "                if (cheapest[set2] == -1 || edge[cheapest[set2]].weight > edge[i].weight)",
                "                    cheapest[set2] = i;",
                "            }",
                "        }",
                "",
                "        // Add edges to MST",
                "        for (int i = 0; i < V; ++i) {",
                "            if (cheapest[i] != -1) {",
                "                int set1 = find(edge[cheapest[i]].src);",
                "                int set2 = find(edge[cheapest[i]].dest);",
                "                if (set1 != set2) {",
                "                    MSTweight += edge[cheapest[i]].weight;",
                "                    union(set1, set2);",
                "                    numTrees--;",
                "                }",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2],
                1: [5],
                2: [7],
                3: [10, 11, 12, 13, 14, 15, 16, 17],
                4: [22, 23, 24, 25, 26, 27, 28, 29]
            }
        },
        c: {
            lines: [
                "void boruvka(struct Graph* graph) {",
                "    // ... Init Union-Find and Variables ...",
                "    int numTrees = V;",
                "",
                "    while (numTrees > 1) {",
                "        for (int v = 0; v < V; ++v) cheapest[v] = -1;",
                "",
                "        for (int i = 0; i < E; ++i) {",
                "            int set1 = find(subsets, edge[i].src);",
                "            int set2 = find(subsets, edge[i].dest);",
                "",
                "            if (set1 != set2) {",
                "                if (cheapest[set1] == -1 || edge[cheapest[set1]].weight > edge[i].weight)",
                "                    cheapest[set1] = i;",
                "                if (cheapest[set2] == -1 || edge[cheapest[set2]].weight > edge[i].weight)",
                "                    cheapest[set2] = i;",
                "            }",
                "        }",
                "",
                "        for (int i = 0; i < V; ++i) {",
                "            if (cheapest[i] != -1) {",
                "                int set1 = find(subsets, edge[cheapest[i]].src);",
                "                int set2 = find(subsets, edge[cheapest[i]].dest);",
                "",
                "                if (set1 != set2) {",
                "                    union(subsets, set1, set2);",
                "                    numTrees--;",
                "                }",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [2, 3],
                1: [4],
                2: [5],
                3: [7, 8, 9, 11, 12, 13, 14, 15],
                4: [19, 20, 21, 22, 24, 25, 26]
            }
        },
        cpp: {
            lines: [
                "void boruvka(Graph& g) {",
                "    DisjointSet ds(g.V);",
                "    int numTrees = g.V;",
                "    int MSTweight = 0;",
                "",
                "    while (numTrees > 1) {",
                "        vector<int> cheapest(g.V, -1);",
                "",
                "        for (int i = 0; i < g.E; ++i) {",
                "            int u = g.edges[i].u;",
                "            int v = g.edges[i].v;",
                "            int set1 = ds.findUPar(u);",
                "            int set2 = ds.findUPar(v);",
                "",
                "            if (set1 != set2) {",
                "                if (cheapest[set1] == -1 || g.edges[cheapest[set1]].weight > g.edges[i].weight)",
                "                    cheapest[set1] = i;",
                "                if (cheapest[set2] == -1 || g.edges[cheapest[set2]].weight > g.edges[i].weight)",
                "                    cheapest[set2] = i;",
                "            }",
                "        }",
                "",
                "        for (int i = 0; i < g.V; ++i) {",
                "            if (cheapest[i] != -1) {",
                "                int set1 = ds.findUPar(g.edges[cheapest[i]].u);",
                "                int set2 = ds.findUPar(g.edges[cheapest[i]].v);",
                "                if (set1 != set2) {",
                "                    ds.unionByRank(set1, set2);",
                "                    MSTweight += g.edges[cheapest[i]].weight;",
                "                    numTrees--;",
                "                }",
                "            }",
                "        }",
                "    }",
                "}"
            ],
            mapping: {
                0: [0, 1, 2, 3],
                1: [5],
                2: [6],
                3: [8, 9, 10, 11, 12, 14, 15, 16, 17, 18],
                4: [22, 23, 24, 25, 26, 27, 28, 29]
            }
        }
    }    ,
    nodeDegree: {
        python: { lines: ["def node_degree(graph, node):", "    return len(graph[node])"], mapping: { 0: [0, 1], 1: [1] } },
        java: { lines: ["int nodeDegree(int node) {", "    return adj[node].size();", "}"], mapping: { 0: [0, 1, 2], 1: [1] } },
        c: { lines: ["int nodeDegree(struct Graph* graph, int node) {", "    struct Node* temp = graph->adjLists[node];", "    int degree = 0;", "    while(temp) {", "        degree++;", "        temp = temp->next;", "    }", "    return degree;", "}"], mapping: { 0: [0, 1, 2], 1: [3, 4, 5, 6] } },
        cpp: { lines: ["int nodeDegree(int node) {", "    return adj[node].size();", "}"], mapping: { 0: [0, 1, 2], 1: [1] } }
    },
    neighbors: {
        python: { lines: ["def get_neighbors(graph, node):", "    return graph[node]"], mapping: { 0: [0, 1], 1: [1] } },
        java: { lines: ["List<Integer> getNeighbors(int node) {", "    return adj[node];", "}"], mapping: { 0: [0, 1, 2], 1: [1] } },
        c: { lines: ["void printNeighbors(struct Graph* graph, int node) {", "    struct Node* temp = graph->adjLists[node];", "    while(temp) {", "        printf(\"%d \", temp->vertex);", "        temp = temp->next;", "    }", "}"], mapping: { 0: [0, 1], 1: [2, 3, 4, 5] } },
        cpp: { lines: ["vector<int> getNeighbors(int node) {", "    return adj[node];", "}"], mapping: { 0: [0, 1, 2], 1: [1] } }
    },
    connectivity: {
        python: { lines: ["def is_connected(graph, V):", "    visited = set()", "    # Run BFS/DFS from node 0", "    dfs(graph, 0, visited)", "    return len(visited) == V"], mapping: { 0: [0,1], 1: [3], 2: [4], 3: [4] } },
        java: { lines: ["boolean isConnected() {", "    boolean[] visited = new boolean[V];", "    dfs(0, visited);", "    for(boolean v : visited) if(!v) return false;", "    return true;", "}"], mapping: { 0: [0,1], 1: [2], 2: [3], 3: [4] } },
        c: { lines: ["int isConnected(struct Graph* graph) {", "    int visited[V] = {0};", "    dfs(graph, 0, visited);", "    for(int i=0; i<V; i++) if(!visited[i]) return 0;", "    return 1;", "}"], mapping: { 0: [0,1], 1: [2], 2: [3], 3: [4] } },
        cpp: { lines: ["bool isConnected() {", "    vector<bool> visited(V, false);", "    DFS(0, visited);", "    for(bool v : visited) if(!v) return false;", "    return true;", "}"], mapping: { 0: [0,1], 1: [2], 2: [3], 3: [4] } }
    },
    detectCycle: {
        python: { lines: ["def has_cycle(graph, v, visited, parent):", "    visited.add(v)", "    for neighbor in graph[v]:", "        if neighbor not in visited:", "            if has_cycle(graph, neighbor, visited, v):", "                return True", "        elif neighbor != parent:", "            return True", "    return False"], mapping: { 0: [0,1], 1: [2,3], 2: [4,5], 3: [6,7], 4: [8] } },
        java: { lines: ["boolean isCyclicUtil(int v, boolean[] visited, int parent) {", "    visited[v] = true;", "    for (Integer i : adj[v]) {", "        if (!visited[i]) {", "            if (isCyclicUtil(i, visited, v)) return true;", "        } else if (i != parent) {", "            return true;", "        }", "    }", "    return false;", "}"], mapping: { 0: [0,1], 1: [2,3], 2: [4], 3: [5,6], 4: [9] } },
        c: { lines: ["int isCyclicUtil(struct Graph* g, int v, int visited[], int parent) {", "    visited[v] = 1;", "    struct Node* temp = g->adjLists[v];", "    while (temp) {", "        int arrItem = temp->vertex;", "        if (!visited[arrItem]) {", "            if (isCyclicUtil(g, arrItem, visited, v)) return 1;", "        } else if (arrItem != parent) {", "            return 1;", "        }", "        temp = temp->next;", "    }", "    return 0;", "}"], mapping: { 0: [0,1,2], 1: [3,4,5], 2: [6], 3: [7,8], 4: [12] } },
        cpp: { lines: ["bool isCyclicUtil(int v, vector<bool>& visited, int parent) {", "    visited[v] = true;", "    for (auto i : adj[v]) {", "        if (!visited[i]) {", "            if (isCyclicUtil(i, visited, v)) return true;", "        } else if (i != parent) {", "            return true;", "        }", "    }", "    return false;", "}"], mapping: { 0: [0,1], 1: [2,3], 2: [4], 3: [5,6], 4: [9] } }
    },
    topologicalSort: {
        python: { lines: ["def topological_sort(graph, V):", "    visited = set()", "    stack = []", "    for i in range(V):", "        if i not in visited:", "            topo_util(graph, i, visited, stack)", "    return stack[::-1]"], mapping: { 0: [0,1,2], 1: [3,4], 2: [5], 3: [6] } },
        java: { lines: ["void topologicalSort() {", "    Stack<Integer> stack = new Stack<>();", "    boolean visited[] = new boolean[V];", "    for (int i = 0; i < V; i++)", "        if (!visited[i])", "            topoUtil(i, visited, stack);", "    while (!stack.empty()) System.out.print(stack.pop() + \" \");", "}"], mapping: { 0: [0,1,2], 1: [3,4], 2: [5], 3: [6] } },
        c: { lines: ["void topologicalSort(struct Graph* g) {", "    int stack[g->V]; int top = -1;", "    int visited[g->V]; clear(visited);", "    for (int i = 0; i < g->V; i++)", "        if (visited[i] == 0)", "            topoUtil(g, i, visited, stack, &top);", "    while (top != -1) printf(\"%d \", stack[top--]);", "}"], mapping: { 0: [0,1,2], 1: [3,4], 2: [5], 3: [6] } },
        cpp: { lines: ["void topologicalSort() {", "    stack<int> Stack;", "    vector<bool> visited(V, false);", "    for (int i = 0; i < V; i++)", "        if (!visited[i])", "            topoUtil(i, visited, Stack);", "    while (!Stack.empty()) { cout << Stack.top(); Stack.pop(); }", "}"], mapping: { 0: [0,1,2], 1: [3,4], 2: [5], 3: [6] } }
    },
    kahn: {
        python: { lines: ["def kahn_topo(graph, V):", "    in_degree = [0] * V", "    for u in graph:", "        for v in graph[u]:", "            in_degree[v] += 1", "    queue = [i for i in range(V) if in_degree[i] == 0]", "    topo_order = []", "    while queue:", "        u = queue.pop(0)", "        topo_order.append(u)", "        for v in graph[u]:", "            in_degree[v] -= 1", "            if in_degree[v] == 0:", "                queue.append(v)", "    return topo_order"], mapping: { 0: [0,1,2,3,4], 1: [5,6], 2: [7,8,9], 3: [10,11], 4: [12,13] } },
        java: { lines: ["void kahn() {", "    int in_degree[] = new int[V];", "    for(int i=0; i<V; i++)", "        for(int node : adj[i]) in_degree[node]++;", "    Queue<Integer> q = new LinkedList<>();", "    for(int i=0; i<V; i++)", "        if(in_degree[i] == 0) q.add(i);", "    int cnt = 0; ArrayList<Integer> topOrder = new ArrayList<>();", "    while(!q.isEmpty()) {", "        int u = q.poll(); topOrder.add(u);", "        for(int node : adj[u])", "            if(--in_degree[node] == 0) q.add(node);", "        cnt++;", "    }", "}"], mapping: { 0: [0,1,2,3], 1: [4,5,6,7], 2: [8,9], 3: [10,11], 4: [12] } },
        c: { lines: ["void kahn(struct Graph* g) {", "    int in_degree[g->V]; clear(in_degree);", "    for(int i=0; i<g->V; i++) {", "        struct Node* temp = g->adjLists[i];", "        while(temp) { in_degree[temp->vertex]++; temp = temp->next; }", "    }", "    // ... queue init & standard loop ...", "}"], mapping: { 0: [0,1], 1: [2,3,4,5], 2: [6], 3: [6], 4: [6] } },
        cpp: { lines: ["void kahn() {", "    vector<int> in_degree(V, 0);", "    for(int u=0; u<V; u++)", "        for(auto v : adj[u]) in_degree[v]++;", "    queue<int> q;", "    for(int i=0; i<V; i++)", "        if(in_degree[i] == 0) q.push(i);", "    vector<int> top_order;", "    while(!q.empty()) {", "        int u = q.front(); q.pop(); top_order.push_back(u);", "        for(auto v : adj[u])", "            if(--in_degree[v] == 0) q.push(v);", "    }", "}"], mapping: { 0: [0,1,2,3], 1: [4,5,6,7], 2: [8,9], 3: [10,11], 4: [8] } }
    },
    tarjanBridges: {
        python: { lines: ["def find_bridges(graph, V):", "    time = 0", "    discovery = [-1] * V", "    low = [-1] * V", "    parent = [-1] * V", "    bridges = []", "    # ... dfs implementation ...", "    return bridges"], mapping: { 0: [0,1,2,3,4,5], 1: [6], 2: [6], 3: [6], 4: [7] } },
        java: { lines: ["void bridgeUtil(int u, boolean visited[], int disc[], int low[], int parent[]) {", "    visited[u] = true;", "    disc[u] = low[u] = ++time;", "    for (int v : adj[u]) {", "        if (!visited[v]) {", "            parent[v] = u;", "            bridgeUtil(v, visited, disc, low, parent);", "            low[u] = Math.min(low[u], low[v]);", "            if (low[v] > disc[u]) System.out.println(u + \" \" + v);", "        } else if (v != parent[u])", "            low[u] = Math.min(low[u], disc[v]);", "    }", "}"], mapping: { 0: [0,1,2], 1: [3,4], 2: [5,6], 3: [7], 4: [8,9,10] } },
        c: { lines: ["void bridgeUtil(struct Graph* g, int u) {", "    // Similar logic to Java/C++", "}"], mapping: { 0: [0], 1: [1], 2: [1], 3: [1], 4: [1] } },
        cpp: { lines: ["void bridgeUtil(int u, vector<bool>& visited, vector<int>& disc, vector<int>& low, int parent) {", "    visited[u] = true;", "    disc[u] = low[u] = ++time;", "    for (auto v : adj[u]) {", "        if (!visited[v]) {", "            bridgeUtil(v, visited, disc, low, u);", "            low[u] = min(low[u], low[v]);", "            if (low[v] > disc[u]) cout << u << \" \" << v << endl;", "        } else if (v != parent)", "            low[u] = min(low[u], disc[v]);", "    }", "}"], mapping: { 0: [0,1,2], 1: [3,4], 2: [5], 3: [6], 4: [7,8,9] } }
    },
    articulationPoints: {
        python: { lines: ["def APUtil(u, visited, ap, parent, low, disc):", "    children = 0; visited[u] = True", "    disc[u] = low[u] = Time[0]; Time[0] += 1", "    for v in graph[u]:", "        if not visited[v]:", "            parent[v] = u; children += 1", "            APUtil(v, visited, ap, parent, low, disc)", "            low[u] = min(low[u], low[v])", "            if parent[u] == -1 and children > 1: ap[u] = True", "            if parent[u] != -1 and low[v] >= disc[u]: ap[u] = True", "        elif v != parent[u]:", "            low[u] = min(low[u], disc[v])"], mapping: { 0: [0,1,2], 1: [3,4], 2: [5,6], 3: [7,8,9], 4: [10,11] } },
        java: { lines: ["void APUtil(int u, boolean visited[], int disc[], int low[], int parent[], boolean ap[]) {", "    int children = 0; visited[u] = true;", "    disc[u] = low[u] = ++time;", "    for (int v : adj[u]) {", "        if (!visited[v]) {", "            children++; parent[v] = u;", "            APUtil(v, visited, disc, low, parent, ap);", "            low[u] = Math.min(low[u], low[v]);", "            if (parent[u] == -1 && children > 1) ap[u] = true;", "            if (parent[u] != -1 && low[v] >= disc[u]) ap[u] = true;", "        } else if (v != parent[u])", "            low[u] = Math.min(low[u], disc[v]);", "    }", "}"], mapping: { 0: [0,1,2], 1: [3,4], 2: [5,6], 3: [7,8,9], 4: [10,11] } },
        c: { lines: ["void APUtil(...) {", "    // Implementation mirrors Java/C++", "}"], mapping: { 0: [0,1], 1: [0], 2: [0], 3: [0], 4: [0] } },
        cpp: { lines: ["void APUtil(int u, vector<bool>& visited, vector<int>& disc, vector<int>& low, int parent, vector<bool>& ap) {", "    int children = 0; visited[u] = true;", "    disc[u] = low[u] = ++time;", "    for (auto v : adj[u]) {", "        if (!visited[v]) {", "            children++;", "            APUtil(v, visited, disc, low, u, ap);", "            low[u] = min(low[u], low[v]);", "            if (parent == -1 && children > 1) ap[u] = true;", "            if (parent != -1 && low[v] >= disc[u]) ap[u] = true;", "        } else if (v != parent)", "            low[u] = min(low[u], disc[v]);", "    }", "}"], mapping: { 0: [0,1,2], 1: [3,4], 2: [5,6], 3: [7,8,9], 4: [10,11] } }
    },
    fordFulkerson: {
        python: { lines: ["def dfs(graph, u, t, visited, min_cap):", "    if u == t: return min_cap", "    visited[u] = True", "    for v, cap in graph[u].items():", "        if not visited[v] and cap > 0:", "            flow = dfs(graph, v, t, visited, min(min_cap, cap))", "            if flow > 0:", "                graph[u][v] -= flow", "                graph[v][u] += flow", "                return flow", "    return 0"], mapping: { 0: [0,1,2], 1: [3,4], 2: [5,6], 3: [7,8,9], 4: [10] } },
        java: { lines: ["int fordFulkerson(int graph[][], int s, int t) {", "    int u, v; int rGraph[][] = new int[V][V];", "    for (u = 0; u < V; u++) for (v = 0; v < V; v++) rGraph[u][v] = graph[u][v];", "    int parent[] = new int[V];", "    int max_flow = 0;", "    while (dfs(rGraph, s, t, parent)) {", "        int path_flow = Integer.MAX_VALUE;", "        for (v = t; v != s; v = parent[v]) { u = parent[v]; path_flow = Math.min(path_flow, rGraph[u][v]); }", "        for (v = t; v != s; v = parent[v]) { u = parent[v]; rGraph[u][v] -= path_flow; rGraph[v][u] += path_flow; }", "        max_flow += path_flow;", "    }", "    return max_flow;", "}"], mapping: { 0: [0,1,2,3,4], 1: [5], 2: [6,7], 3: [8], 4: [9] } },
        c: { lines: ["int fordFulkerson(int graph[V][V], int s, int t) {", "    // Implementation mirrors Java/C++", "    return max_flow;", "}"], mapping: { 0: [0,1], 1: [2], 2: [2], 3: [2], 4: [2] } },
        cpp: { lines: ["int fordFulkerson(int graph[V][V], int s, int t) {", "    int u, v; int rGraph[V][V];", "    for (u = 0; u < V; u++) for (v = 0; v < V; v++) rGraph[u][v] = graph[u][v];", "    int parent[V];", "    int max_flow = 0;", "    while (dfs(rGraph, s, t, parent)) {", "        int path_flow = INT_MAX;", "        for (v = t; v != s; v = parent[v]) { u = parent[v]; path_flow = min(path_flow, rGraph[u][v]); }", "        for (v = t; v != s; v = parent[v]) { u = parent[v]; rGraph[u][v] -= path_flow; rGraph[v][u] += path_flow; }", "        max_flow += path_flow;", "    }", "    return max_flow;", "}"], mapping: { 0: [0,1,2,3,4], 1: [5], 2: [6,7], 3: [8], 4: [9] } }
    },
    edmondsKarp: {
        python: { lines: ["def edmonds_karp(graph, source, sink):", "    parent = [-1] * V", "    max_flow = 0", "    while bfs(graph, source, sink, parent):", "        path_flow = float('Inf')", "        s = sink", "        while s != source:", "            path_flow = min(path_flow, graph[parent[s]][s])", "            s = parent[s]", "        max_flow += path_flow", "        v = sink", "        while v != source:", "            u = parent[v]", "            graph[u][v] -= path_flow", "            graph[v][u] += path_flow", "            v = parent[v]", "    return max_flow"], mapping: { 0: [0,1,2], 1: [3], 2: [4,5,6,7,8], 3: [10,11,12,13,14,15], 4: [9] } },
        java: { lines: ["int edmondsKarp(int graph[][], int s, int t) {", "    // Exact same as Ford-Fulkerson but uses BFS instead of DFS!", "    return max_flow;", "}"], mapping: { 0: [0,1], 1: [2], 2: [2], 3: [2], 4: [2] } },
        c: { lines: ["int edmondsKarp(int graph[V][V], int s, int t) {", "    // Exact same as Ford-Fulkerson but uses BFS instead of DFS!", "    return max_flow;", "}"], mapping: { 0: [0,1], 1: [2], 2: [2], 3: [2], 4: [2] } },
        cpp: { lines: ["int edmondsKarp(int graph[V][V], int s, int t) {", "    // Exact same as Ford-Fulkerson but uses BFS instead of DFS!", "    return max_flow;", "}"], mapping: { 0: [0,1], 1: [2], 2: [2], 3: [2], 4: [2] } }
    },
    bellmanFord: {
        python: { lines: ["def bellman_ford(graph, V, start):", "    dist = [float('inf')] * V", "    dist[start] = 0", "    for _ in range(V - 1):", "        for u, v, w in graph.edges:", "            if dist[u] != float('inf') and dist[u] + w < dist[v]:", "                dist[v] = dist[u] + w", "    for u, v, w in graph.edges:", "        if dist[u] != float('inf') and dist[u] + w < dist[v]:", "            print('Graph contains negative weight cycle')", "            return", "    return dist"], mapping: { 0: [0,1,2], 2: [3,4], 3: [4], 5: [5,6], 6: [7,8], 8: [8,9] } },
        java: { lines: ["void bellmanFord(int start) {", "    int[] dist = new int[V];", "    Arrays.fill(dist, Integer.MAX_VALUE);", "    dist[start] = 0;", "    for (int i = 1; i < V; ++i) {", "        for (Edge edge : edges) {", "            int u = edge.src, v = edge.dest, weight = edge.weight;", "            if (dist[u] != Integer.MAX_VALUE && dist[u] + weight < dist[v])", "                dist[v] = dist[u] + weight;", "        }", "    }", "    for (Edge edge : edges) {", "        int u = edge.src, v = edge.dest, weight = edge.weight;", "        if (dist[u] != Integer.MAX_VALUE && dist[u] + weight < dist[v]) {", "            System.out.println(\"Graph contains negative weight cycle\");", "            return;", "        }", "    }", "}"], mapping: { 0: [0,1,2,3], 2: [4,5], 3: [6], 5: [7,8], 6: [11], 8: [13, 14] } },
        c: { lines: ["void bellmanFord(struct Graph* graph, int start) {", "    int V = graph->V; int E = graph->E;", "    int dist[V];", "    for (int i = 0; i < V; i++) dist[i] = INT_MAX;", "    dist[start] = 0;", "    for (int i = 1; i <= V - 1; i++) {", "        for (int j = 0; j < E; j++) {", "            int u = graph->edge[j].src;", "            int v = graph->edge[j].dest;", "            int weight = graph->edge[j].weight;", "            if (dist[u] != INT_MAX && dist[u] + weight < dist[v])", "                dist[v] = dist[u] + weight;", "        }", "    }", "    // Negative cycle detection omitted for brevity", "}"], mapping: { 0: [0,1,2,3,4], 2: [5], 3: [6], 5: [10,11], 6: [14], 8: [14] } },
        cpp: { lines: ["void bellmanFord(int src) {", "    vector<int> dist(V, INF);", "    dist[src] = 0;", "    for (int i = 1; i <= V - 1; i++) {", "        for (int j = 0; j < E; j++) {", "            int u = edges[j].src, v = edges[j].dest, weight = edges[j].weight;", "            if (dist[u] != INF && dist[u] + weight < dist[v])", "                dist[v] = dist[u] + weight;", "        }", "    }", "    for (int i = 0; i < E; i++) {", "        int u = edges[i].src, v = edges[i].dest, weight = edges[i].weight;", "        if (dist[u] != INF && dist[u] + weight < dist[v]) {", "            cout << \"Graph contains negative weight cycle\" << endl;", "            return;", "        }", "    }", "}"], mapping: { 0: [0,1,2], 2: [3,4], 3: [5], 5: [6,7], 6: [10,11], 8: [12,13] } }
    },
    floydWarshall: {
        python: { lines: ["def floyd_warshall(graph, V):", "    dist = list(map(lambda i: list(map(lambda j: j, i)), graph))", "    for k in range(V):", "        for i in range(V):", "            for j in range(V):", "                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])", "    return dist"], mapping: { 0: [0,1], 2: [2], 5: [3,4], 6: [5] } },
        java: { lines: ["void floydWarshall(int graph[][]) {", "    int dist[][] = new int[V][V];", "    for (int i = 0; i < V; i++)", "        for (int j = 0; j < V; j++) dist[i][j] = graph[i][j];", "    for (int k = 0; k < V; k++) {", "        for (int i = 0; i < V; i++) {", "            for (int j = 0; j < V; j++) {", "                if (dist[i][k] + dist[k][j] < dist[i][j])", "                    dist[i][j] = dist[i][k] + dist[k][j];", "            }", "        }", "    }", "}"], mapping: { 0: [0,1,2,3], 2: [4], 5: [5,6,7], 6: [8] } },
        c: { lines: ["void floydWarshall(int graph[][V]) {", "    int dist[V][V], i, j, k;", "    for (i = 0; i < V; i++)", "        for (j = 0; j < V; j++) dist[i][j] = graph[i][j];", "    for (k = 0; k < V; k++) {", "        for (i = 0; i < V; i++) {", "            for (j = 0; j < V; j++) {", "                if (dist[i][k] + dist[k][j] < dist[i][j])", "                    dist[i][j] = dist[i][k] + dist[k][j];", "            }", "        }", "    }", "}"], mapping: { 0: [0,1,2,3], 2: [4], 5: [5,6,7], 6: [8] } },
        cpp: { lines: ["void floydWarshall(int graph[][V]) {", "    int dist[V][V], i, j, k;", "    for (i = 0; i < V; i++)", "        for (j = 0; j < V; j++) dist[i][j] = graph[i][j];", "    for (k = 0; k < V; k++) {", "        for (i = 0; i < V; i++) {", "            for (j = 0; j < V; j++) {", "                if (dist[i][k] + dist[k][j] < dist[i][j])", "                    dist[i][j] = dist[i][k] + dist[k][j];", "            }", "        }", "    }", "}"], mapping: { 0: [0,1,2,3], 2: [4], 5: [5,6,7], 6: [8] } }
    },
    aStar: {
        python: { lines: ["import heapq", "def a_star(graph, start, goal, h):", "    pq = [(0, start)]", "    came_from = {start: None}", "    g_score = {start: 0}", "    f_score = {start: h(start)}", "    while pq:", "        _, current = heapq.heappop(pq)", "        if current == goal: return reconstruct_path(came_from, current)", "        for neighbor in graph[current]:", "            tentative_g = g_score[current] + graph[current][neighbor]", "            if neighbor not in g_score or tentative_g < g_score[neighbor]:", "                came_from[neighbor] = current", "                g_score[neighbor] = tentative_g", "                f_score[neighbor] = tentative_g + h(neighbor)", "                heapq.heappush(pq, (f_score[neighbor], neighbor))"], mapping: { 0: [0,1,2,3,4,5], 1: [6], 2: [7], 3: [8], 4: [9,10,11], 5: [12,13,14,15] } },
        java: { lines: ["void aStar(int start, int goal) {", "    PriorityQueue<Node> openSet = new PriorityQueue<>((a, b) -> a.f - b.f);", "    openSet.add(new Node(start, 0, h(start)));", "    // Implementation mirrors Dijkstra but with heuristic added", "}"], mapping: { 0: [0,1,2], 1: [3], 2: [3], 3: [3], 4: [3], 5: [3] } },
        c: { lines: ["void aStar(struct Graph* g, int start, int goal) {", "    // Implementation mirrors Dijkstra but with heuristic added", "}"], mapping: { 0: [0,1], 1: [1], 2: [1], 3: [1], 4: [1], 5: [1] } },
        cpp: { lines: ["void aStar(int start, int goal) {", "    priority_queue<Node, vector<Node>, CompareNode> pq;", "    pq.push(Node(start, 0, h(start)));", "    // Implementation mirrors Dijkstra but with heuristic added", "}"], mapping: { 0: [0,1,2], 1: [3], 2: [3], 3: [3], 4: [3], 5: [3] } }
    }
};

export const COMPLEXITY = {
    bfs: { best: "O(V + E)", avg: "O(V + E)", worst: "O(V + E)" },
    dfs: { best: "O(V + E)", avg: "O(V + E)", worst: "O(V + E)" },
    dijkstra: { best: "O(E log V)", avg: "O(E log V)", worst: "O(V^2)" },
    prim: { best: "O(E log V)", avg: "O(E log V)", worst: "O(V^2)" },
    kruskal: { best: "O(E log E)", avg: "O(E log E)", worst: "O(E log V)" },
    boruvka: { best: "O(E log V)", avg: "O(E log V)", worst: "O(E log V)" },
    nodeDegree: { best: "O(1)", avg: "O(V)", worst: "O(V)" },
    neighbors: { best: "O(1)", avg: "O(V)", worst: "O(V)" },
    connectivity: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" },
    detectCycle: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" },
    topologicalSort: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" },
    kahn: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" },
    tarjanBridges: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" },
    articulationPoints: { best: "O(V+E)", avg: "O(V+E)", worst: "O(V+E)" },
    fordFulkerson: { best: "O(E*F)", avg: "O(E*F)", worst: "O(E*F)" },
    edmondsKarp: { best: "O(V*E^2)", avg: "O(V*E^2)", worst: "O(V*E^2)" },
    bellmanFord: { best: "O(V*E)", avg: "O(V*E)", worst: "O(V*E)" },
    floydWarshall: { best: "O(V^3)", avg: "O(V^3)", worst: "O(V^3)" },
    aStar: { best: "O(E)", avg: "O(E)", worst: "O(E)" }
};
