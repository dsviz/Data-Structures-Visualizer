export interface AlgorithmInfo {
    name: string;
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
}

export const GRAPH_INFO: Record<string, AlgorithmInfo> = {
    bfs: {
        name: "Breadth-First Search (BFS)",
        description: "Explores the graph level by level, visiting all direct neighbors of a node before moving to the next level.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)"
    },
    dfs: {
        name: "Depth-First Search (DFS)",
        description: "Explores as far as possible along each branch before backtracking.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)"
    },
    dijkstra: {
        name: "Dijkstra's Algorithm",
        description: "Finds the shortest path from a starting node to all other nodes in a graph with non-negative edge weights.",
        timeComplexity: "O((V + E) log V)",
        spaceComplexity: "O(V)"
    },
    bellmanFord: {
        name: "Bellman-Ford Algorithm",
        description: "Computes shortest paths from a single source vertex to all other vertices. Can handle negative weights and detect negative weight cycles.",
        timeComplexity: "O(V × E)",
        spaceComplexity: "O(V)"
    },
    floydWarshall: {
        name: "Floyd-Warshall Algorithm",
        description: "Finds shortest paths between all pairs of vertices in a weighted graph.",
        timeComplexity: "O(V³)",
        spaceComplexity: "O(V²)"
    },
    aStar: {
        name: "A* Search Algorithm",
        description: "Finds the shortest path to a target node using an informed heuristic (e.g., Euclidean distance) to guide the search efficiently.",
        timeComplexity: "O(E)",
        spaceComplexity: "O(V)"
    },
    prim: {
        name: "Prim's Algorithm",
        description: "Finds a Minimum Spanning Tree (MST) by starting from an arbitrary node and repeatedly adding the cheapest edge from the tree to a new node.",
        timeComplexity: "O(E log V)",
        spaceComplexity: "O(V) or O(E)"
    },
    kruskal: {
        name: "Kruskal's Algorithm",
        description: "Finds a Minimum Spanning Tree (MST) by sorting edges and adding them one by one using a Union-Find data structure to prevent cycles.",
        timeComplexity: "O(E log E)",
        spaceComplexity: "O(V)"
    },
    boruvka: {
        name: "Borůvka's Algorithm",
        description: "Finds a Minimum Spanning Tree (MST) by finding the cheapest edge for each component simultaneously and merging them.",
        timeComplexity: "O(E log V)",
        spaceComplexity: "O(V)"
    },
    nodeDegree: {
        name: "Node Degree",
        description: "Calculates the number of edges incident to the selected node (In-degree and Out-degree for directed graphs).",
        timeComplexity: "O(V)",
        spaceComplexity: "O(1)"
    },
    highlightNeighbors: {
        name: "Highlight Neighbors",
        description: "Visually highlights all immediate neighbors of the selected node.",
        timeComplexity: "O(V)",
        spaceComplexity: "O(1)"
    },
    checkConnectivity: {
        name: "Check Connectivity",
        description: "Determines if there is a path between every pair of vertices in the graph (Strongly/Weakly connected).",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)"
    },
    detectCycle: {
        name: "Detect Cycle",
        description: "Checks if the graph contains any cycles.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)"
    },
    topologicalSort: {
        name: "Topological Sort (DFS)",
        description: "Linear ordering of vertices such that for every directed edge U -> V, vertex U comes before V.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)"
    },
    kahn: {
        name: "Kahn's Algorithm",
        description: "BFS-based Topological Sort that repeatedly removes nodes with an in-degree of 0.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)"
    },
    tarjanBridges: {
        name: "Tarjan's Bridges",
        description: "Finds all bridges (critical edges whose removal increases the number of connected components) using DFS tree discovery times.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)"
    },
    articulationPoints: {
        name: "Articulation Points",
        description: "Finds all articulation points (cut vertices whose removal increases the number of connected components) using DFS.",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V)"
    },
    fordFulkerson: {
        name: "Ford-Fulkerson",
        description: "Computes the maximum flow in a flow network by finding augmenting paths using DFS.",
        timeComplexity: "O(E × max_flow)",
        spaceComplexity: "O(V)"
    },
    edmondsKarp: {
        name: "Edmonds-Karp",
        description: "Specific implementation of Ford-Fulkerson that uses BFS to find the shortest augmenting paths.",
        timeComplexity: "O(V × E²)",
        spaceComplexity: "O(V)"
    }
};
