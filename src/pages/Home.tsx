import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="flex-grow flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
      <section className="relative py-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-900/70 dark:from-white dark:to-white/70">
              Visualize. Understand. Master.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-[#9794c7] max-w-2xl mx-auto font-light">
              Master data structures and algorithms through interactive visualization. The modern way to learn computer science.
            </p>
          </div>
          <div className="inline-flex bg-gray-100 dark:bg-[#272546] p-1.5 rounded-xl shadow-lg border border-gray-200 dark:border-white/5">
            <label className="cursor-pointer relative">
              <input className="peer sr-only" name="mode" type="radio" />
              <div className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white peer-checked:bg-white dark:peer-checked:bg-primary peer-checked:text-primary dark:peer-checked:text-white peer-checked:shadow-md transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">school</span>
                Training Mode
              </div>
            </label>
            <label className="cursor-pointer relative">
              <input defaultChecked className="peer sr-only" name="mode" type="radio" />
              <div className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-[#9794c7] hover:text-gray-900 dark:hover:text-white peer-checked:bg-white dark:peer-checked:bg-primary peer-checked:text-primary dark:peer-checked:text-white peer-checked:shadow-md transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                Visualizer Mode
              </div>
            </label>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-white dark:bg-white text-gray-900 dark:text-[#131221] hover:bg-gray-50 dark:hover:bg-gray-100 px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-2">
              <span>Start Learning Now</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <a
              href="https://github.com/shubhamkumarsharma03/Data-Structures-Visualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-[#1e1d32] text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#272546] hover:border-gray-300 dark:hover:border-white/20 px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg dark:shadow-none"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.66-3.795-1.455-3.795-1.455-.54-1.38-1.335-1.755-1.335-1.755-1.095-.75.09-.735.09-.735 1.2.09 1.83 1.245 1.83 1.245 1.08 1.86 2.805 1.335 3.495 1.02.105-.78.42-1.335.765-1.65-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.225 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.295-1.545 3.3-1.23 3.3-1.23.66 1.695.24 2.925.12 3.225.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>View Source</span>
            </a>
          </div>
        </div>
      </section>

      <section className="flex-1 px-6 pb-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            <button className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/25 transition-transform active:scale-95">All Topics</button>
            <button className="px-5 py-2 rounded-lg bg-white dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] hover:bg-gray-50 dark:hover:bg-[#323055] hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-white/10 active:scale-95 shadow-sm">Sorting</button>
            <button className="px-5 py-2 rounded-lg bg-white dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] hover:bg-gray-50 dark:hover:bg-[#323055] hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-white/10 active:scale-95 shadow-sm">Trees</button>
            <button className="px-5 py-2 rounded-lg bg-white dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] hover:bg-gray-50 dark:hover:bg-[#323055] hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-white/10 active:scale-95 shadow-sm">Graphs</button>
            <button className="px-5 py-2 rounded-lg bg-white dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] hover:bg-gray-50 dark:hover:bg-[#323055] hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-white/10 active:scale-95 shadow-sm">Data Structures</button>
            <button className="px-5 py-2 rounded-lg bg-white dark:bg-[#272546] text-gray-500 dark:text-[#9794c7] hover:bg-gray-50 dark:hover:bg-[#323055] hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-white/10 active:scale-95 shadow-sm">Algorithms</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Sorting */}
            <Link to="/sorting" className="group relative flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1">
              <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt="Abstract Sorting Bars Pattern"></div>
                <span className="material-symbols-outlined text-6xl text-white dark:text-indigo-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">bar_chart</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">Sorting</h3>
                  <span className="bg-green-500/10 text-green-400 text-xs font-mono px-2 py-1 rounded border border-green-500/20">Easy</span>
                </div>
                <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono mb-4 line-clamp-2">Bubble, Merge, Quick, Heap, Radix Sort</p>
                <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-white/50 font-medium">
                  <span className="material-symbols-outlined text-[16px] mr-1">play_circle</span>
                  8 Algorithms
                </div>
              </div>
            </Link>

            {/* Linked Lists */}
            <Link to="/linked-list" className="group relative flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1">
              <div className="h-40 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-900/50 dark:to-cyan-900/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt="Abstract Chain Link Pattern"></div>
                <span className="material-symbols-outlined text-6xl text-white dark:text-cyan-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">link</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">Linked Lists</h3>
                  <span className="bg-green-500/10 text-green-400 text-xs font-mono px-2 py-1 rounded border border-green-500/20">Easy</span>
                </div>
                <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono mb-4 line-clamp-2">Singly, Doubly, Circular, Stack, Queue</p>
                <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-white/50 font-medium">
                  <span className="material-symbols-outlined text-[16px] mr-1">play_circle</span>
                  5 Structures
                </div>
              </div>
            </Link>

            {/* Arrays (Not in original design but needed for existing route) - Using Hash Table style for now or just generic */}
            <Link to="/arrays" className="group relative flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1">
              <div className="h-40 bg-gradient-to-br from-pink-500 to-rose-500 dark:from-pink-900/50 dark:to-rose-900/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt="Abstract Key Value Grid Pattern"></div>
                <span className="material-symbols-outlined text-6xl text-white dark:text-pink-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">data_array</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">Arrays</h3>
                  <span className="bg-green-500/10 text-green-400 text-xs font-mono px-2 py-1 rounded border border-green-500/20">Easy</span>
                </div>
                <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono mb-4 line-clamp-2">Search, Insert, Delete, Kadane's</p>
                <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-white/50 font-medium">
                  <span className="material-symbols-outlined text-[16px] mr-1">play_circle</span>
                  4 Concepts
                </div>
              </div>
            </Link>


            {/* Binary Tree */}
            <Link to="/trees" className="group relative flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1">
              <div className="h-40 bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-900/50 dark:to-teal-900/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt="Abstract Tree Branching Pattern"></div>
                <span className="material-symbols-outlined text-6xl text-white dark:text-emerald-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">account_tree</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">Binary Tree</h3>
                  <span className="bg-yellow-500/10 text-yellow-400 text-xs font-mono px-2 py-1 rounded border border-yellow-500/20">Medium</span>
                </div>
                <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono mb-4 line-clamp-2">Insertion, Deletion, Traversal, AVL</p>
                <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-white/50 font-medium">
                  <span className="material-symbols-outlined text-[16px] mr-1">play_circle</span>
                  4 Operations
                </div>
              </div>
            </Link>

            {/* Graphs */}
            <Link to="/graphs" className="group relative flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1">
              <div className="h-40 bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-900/50 dark:to-red-900/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt="Abstract Network Nodes Pattern"></div>
                <span className="material-symbols-outlined text-6xl text-white dark:text-orange-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">hub</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">Graphs</h3>
                  <span className="bg-red-500/10 text-red-400 text-xs font-mono px-2 py-1 rounded border border-red-500/20">Hard</span>
                </div>
                <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono mb-4 line-clamp-2">BFS, DFS, Dijkstra, Prim, Kruskal</p>
                <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-white/50 font-medium">
                  <span className="material-symbols-outlined text-[16px] mr-1">play_circle</span>
                  6 Algorithms
                </div>
              </div>
            </Link>

            {/* Recursion (Placeholder) */}
            <Link to="/recursion" className="group relative flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1">
              <div className="h-40 bg-gradient-to-br from-violet-500 to-fuchsia-500 dark:from-violet-900/50 dark:to-fuchsia-900/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt="Abstract Infinite Loop Pattern"></div>
                <span className="material-symbols-outlined text-6xl text-white dark:text-fuchsia-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">all_inclusive</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">Recursion</h3>
                  <span className="bg-red-500/10 text-red-400 text-xs font-mono px-2 py-1 rounded border border-red-500/20">Hard</span>
                </div>
                <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono mb-4 line-clamp-2">Fibonacci, Tower of Hanoi, Factorial</p>
                <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-white/50 font-medium">
                  <span className="material-symbols-outlined text-[16px] mr-1">play_circle</span>
                  3 Algorithms
                </div>
              </div>
            </Link>

            {/* Backtracking (Placeholder) */}
            <div className="group relative flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1 cursor-not-allowed opacity-75">
              <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt="Abstract Maze Path Pattern"></div>
                <span className="material-symbols-outlined text-6xl text-slate-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">undo</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">Backtracking</h3>
                  <span className="bg-red-500/10 text-red-400 text-xs font-mono px-2 py-1 rounded border border-red-500/20">Hard</span>
                </div>
                <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono mb-4 line-clamp-2">N-Queens, Knight's Tour, Sudoku</p>
                <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-white/50 font-medium">
                  <span className="material-symbols-outlined text-[16px] mr-1">lock</span>
                  Coming Soon
                </div>
              </div>
            </div>

            {/* Dynamic Prog (Placeholder) */}
            <div className="group relative flex flex-col bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(66,54,231,0.15)] transition-all duration-300 hover:-translate-y-1 cursor-not-allowed opacity-75">
              <div className="h-40 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://placeholder.pics/svg/400')] bg-cover opacity-20" data-alt="Abstract Optimized Path Pattern"></div>
                <span className="material-symbols-outlined text-6xl text-blue-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">memory</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">Dynamic Prog.</h3>
                  <span className="bg-red-500/10 text-red-400 text-xs font-mono px-2 py-1 rounded border border-red-500/20">Hard</span>
                </div>
                <p className="text-gray-500 dark:text-[#9794c7] text-sm font-mono mb-4 line-clamp-2">Knapsack, Coin Change, LCS</p>
                <div className="mt-auto flex items-center text-xs text-gray-400 dark:text-white/50 font-medium">
                  <span className="material-symbols-outlined text-[16px] mr-1">lock</span>
                  Coming Soon
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-[#272546] bg-gray-50 dark:bg-[#131221] py-8 px-6 text-center text-gray-500 dark:text-[#9794c7] text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <a className="hover:text-gray-900 dark:hover:text-white transition-colors" href="#">About</a>
          <a className="hover:text-gray-900 dark:hover:text-white transition-colors" href="#">Team</a>
          <a className="hover:text-gray-900 dark:hover:text-white transition-colors" href="#">Terms</a>
          <a className="hover:text-gray-900 dark:hover:text-white transition-colors" href="#">Privacy</a>
        </div>
        <p>© 2026 Data Structure Visualizer. Made for students, by students.</p>
      </footer>
    </div>
  )
}

export default Home
