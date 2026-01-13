import { Link } from 'react-router-dom'

const Home = () => {
  const categories = [
    {
      title: 'Sorting Algorithms',
      description: 'Visualize how sorting algorithms work step-by-step',
      path: '/sorting',
      icon: '📊',
      algorithms: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Heap Sort'],
    },
    {
      title: 'Tree Structures',
      description: 'Explore binary trees, BST, and tree traversals',
      path: '/trees',
      icon: '🌳',
      algorithms: ['Binary Search Tree', 'AVL Tree', 'Tree Traversals'],
    },
    {
      title: 'Graph Algorithms',
      description: 'Understand graph traversal and pathfinding',
      path: '/graphs',
      icon: '🗺️',
      algorithms: ['BFS', 'DFS', 'Dijkstra', 'A* Search'],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          Data Structures & Algorithms Visualizer
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn and understand data structures and algorithms through interactive visualizations.
          Watch step-by-step animations to see how algorithms work internally.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {categories.map((category) => (
          <Link
            key={category.path}
            to={category.path}
            className="card hover:shadow-xl transition-shadow duration-300 group"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">
              {category.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {category.description}
            </p>
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-500 mb-2">Includes:</p>
              <div className="flex flex-wrap gap-2">
                {category.algorithms.map((algo) => (
                  <span
                    key={algo}
                    className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
                  >
                    {algo}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <div className="card max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-3">✨ Features</h3>
          <ul className="text-left space-y-2 text-gray-700">
            <li>✅ Step-by-step visual animations</li>
            <li>✅ Interactive play, pause, and speed controls</li>
            <li>✅ Clean separation of algorithm logic and visualization</li>
            <li>✅ Responsive and intuitive UI</li>
            <li>✅ Educational explanations for each algorithm</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home
