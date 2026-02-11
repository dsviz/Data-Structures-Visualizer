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

### Backend
- **Node.js + Express** - HTTP API layer
- **TypeScript** - Shared types across the stack
- **Prisma ORM** - Type-safe access to PostgreSQL
- **PostgreSQL** - Durable relational datastore

### Visualization
- **SVG** - For trees, graphs, linked lists
- **HTML Canvas** - For sorting and array animations

### State Management
- **Zustand** - Lightweight state management

## 📁 Project Structure

```
dsa-visualizer/
├── src/                  # Frontend application (React + Vite)
└── server/               # Backend service (Express + Prisma)
        ├── src/              # Application source
        ├── prisma/           # Database schema & migrations
        └── .env.example      # Backend environment template
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL 14+ (Docker or local install)

### Installation

1. **Install frontend dependencies:**
        ```bash
        npm install
        ```

2. **Copy frontend environment template:**
        ```bash
        cp .env.example .env # use: copy .env.example .env (Windows)
        ```
        The default `VITE_API_URL` points to the local Express server (`http://localhost:4000`).

3. **Install backend dependencies:**
        ```bash
        cd server
        npm install
        ```

4. **Configure backend environment:**
        ```bash
        cp .env.example .env # use: copy .env.example .env (Windows)
        ```
        Update `DATABASE_URL` with your PostgreSQL credentials and set a strong `JWT_SECRET`.

5. **Run database migrations:**
        ```bash
        npx prisma migrate dev
        ```

6. **Seed algorithm metadata:**
        ```bash
        npm run prisma:seed
        ```

7. **Start backend API:**
        ```bash
        npm run dev
        ```

8. **Start frontend dev server (new terminal):**
        ```bash
        cd ..
        npm run dev
        ```

9. **Open your browser:**
        Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Backend Testing

```bash
cd server
npm run test
```

The Jest suite covers health checks, catalog queries, and authentication flows using mocked Prisma interactions.

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
