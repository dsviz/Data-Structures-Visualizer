# 📘 Web-Based Data Structures & Algorithms Visualizer

An interactive educational web application designed to help students and developers understand the internal working of fundamental data structures and algorithms through **step-by-step visual animations**.

![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.1-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Key Features

- ✅ **Step-by-step visual animations** of algorithms
- ✅ **Interactive controls** (play, pause, step forward/backward, speed adjustment)
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
├── src/
│   ├── app/              # App configuration and routing
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Buttons, sliders, dropdowns
│   │   ├── controls/     # Play, pause, speed controls
│   │   └── layout/       # Navbar, sidebar
│   ├── visualizers/      # Algorithm visualizers
│   │   ├── sorting/
│   │   ├── linkedlist/
│   │   ├── tree/
│   │   └── graph/
│   ├── algorithms/       # Pure algorithm implementations
│   ├── engine/           # Animation engine
│   ├── store/            # Zustand state stores
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── pages/            # Page components
│   └── styles/           # Global styles
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

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
- Binary Search Tree (Insert, Delete, Search)
- Tree Traversals (Inorder, Preorder, Postorder, Level Order)
- AVL Tree

### Graph Algorithms
- Breadth-First Search (BFS)
- Depth-First Search (DFS)
- Dijkstra's Algorithm
- A* Pathfinding

## 🎯 Development Roadmap

- [x] Project initialization
- [x] Array Operations visualizer
- [x] Linked List visualizer
- [ ] Sorting visualizer
- [ ] Tree visualizer
- [ ] Graph visualizer
- [ ] Stack & Queue visualizer
- [ ] Code editor integration
- [ ] Complexity analysis display
- [ ] Custom input support
- [ ] Algorithm comparison mode
- [ ] User accounts (optional backend)

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
