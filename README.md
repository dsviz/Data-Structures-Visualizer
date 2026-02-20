# 📘 Web-Based Data Structures & Algorithms Visualizer

An interactive educational web application designed to help students and developers understand the internal working of fundamental data structures and algorithms through **step-by-step visual animations**.

![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.1-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Key Features

- ✅ **Step-by-step visual animations** of algorithms
- ✅ **Advanced Tree Visualization**:
  - Binary Search Tree (BST) & AVL Tree operations.
  - Traversals (Inorder, Preorder, Postorder, BFS, Zigzag).
  - Special views (Left, Right, Top, Bottom, Boundary).
  - property checks (Height, Diameter, Balanced, Full, Complete).
  - LCA, Mirror, and more.
- ✅ **Advanced Sorting Visualizations**:
  - Tree-based recursion breakdown for Merge Sort & Quick Sort.
  - Classic bar animations for Bubble, Selection, and Insertion Sort.
- ✅ **Educational Context**:
  - Real-time **Code Analysis** with dynamic value injection.
  - **Complexity Analysis** (Time/Space) for each algorithm.
  - **Color Legends** to explain visual states.
  - **Step-by-step Description Overlay** for clear understanding.
- ✅ **Interactive controls** (play, pause, step forward/backward, speed adjustment, sound effects)
- ✅ **Clean separation** of algorithm logic from visualization
- ✅ **Modular and extensible** architecture
- ✅ Support for **sorting, searching, trees, graphs, stacks, and queues**

## 🛠️ Technology Stack

### Frontend
- **React** - Component-based UI architecture
- **TypeScript** - Type-safe code
- **Vite** - Ultra-fast development and build tool
- **Tailwind CSS** - Utility-first styling

### Visualization
- **SVG** - For trees, graphs, linked lists
- **HTML Canvas** - For sorting and array animations

### State Management
- **Zustand** - Lightweight state management

## 📁 Project Structure

```
dsa-visualizer/
├── src/                  # Frontend application (React + Vite)
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom hooks (logic)
│   ├── pages/            # Page definitions
│   ├── data/             # Algorithm code & metadata
│   └── context/          # React Context (Layout, etc.)
```

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- **Node.js** (v18 or higher) - [Download Here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/dsa-visualizer.git
   cd dsa-visualizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Open [http://localhost:5173](http://localhost:5173) in your web browser.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The output files will be in the `dist/` directory, ready to be deployed to static hosting services like Vercel, Netlify, or GitHub Pages.

## 🎨 Architecture

```
Algorithm Logic (Pure TypeScript)
        ↓
Step Generator
        ↓
Animation Engine
        ↓
Visualizer (SVG / Canvas)
        ↓
User Controls
```

### Key Principles

1. **Separation of Concerns**: Algorithm logic is completely separate from visualization
2. **Step-Based Execution**: Algorithms generate logical steps, not visual instructions
3. **Centralized Animation**: Single animation engine handles all visualizations
4. **Type Safety**: Full TypeScript coverage for reliability

## 📚 Algorithm & Data Structure Categories

### Data Structures
- **Arrays** (Insert, Remove, Update, Linear Search, Binary Search)
- **Linked Lists** (Singly, Doubly, Circular - Insert, Remove, Search)

### Sorting Algorithms
- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort

### Searching Algorithms
- Linear Search
- Binary Search

### Tree Operations
- **Traversals**: Inorder, Preorder, Postorder, BFS, Zigzag
- **BST Operations**: Insert, Delete, Search, Min, Max, Successor, Predecessor, Validate
- **Properties**: Height, Size, Leaf Count, Diameter, Balanced Check, Full/Complete Check
- **Views**: Left, Right, Top, Bottom, Boundary
- **Special**: LCA, Mirror Tree, AVL Rotation & Balancing

### Graph Algorithms
- Breadth-First Search (BFS)
- Depth-First Search (DFS)
- Dijkstra's Algorithm
- A* Pathfinding

## 🎯 Development Roadmap

- [x] Project initialization
- [x] Array Operations visualizer
- [x] Linked List visualizer
- [x] Sorting visualizer (Advanced Tree Views, Sound, Complexity)
- [x] Tree visualizer (BST, AVL, Traversals, Views)
- [ ] Graph visualizer
- [ ] Stack & Queue visualizer
- [x] Code editor integration (Real-time Value Injection)
- [x] Complexity analysis display
- [x] Custom input support
- [ ] Algorithm comparison mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎓 Educational Purpose

This project is designed for educational purposes to help students and developers:
- Understand algorithm internals visually
- Learn best practices in React/TypeScript development
- Explore clean architecture patterns
- Build interactive web applications

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Built with ❤️ for learners and developers**
