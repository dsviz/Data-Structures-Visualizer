import { useState } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';

const Sorting = () => {
  // State for visualization
  const [array] = useState([10, 25, 15, 60, 20, 45, 80, 50, 30, 70, 40, 90, 35, 55, 65, 5]);
  const [activeAlgorithm, setActiveAlgorithm] = useState('Bubble Sort');

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-200 dark:border-[#272546]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 dark:text-white font-bold text-lg">Pseudo-code</h3>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">C++</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 dark:bg-primary/20 text-primary border border-primary/30">Python</span>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-[#121121] rounded-lg border border-gray-200 dark:border-[#272546] p-4 font-mono text-sm overflow-hidden relative">
          <div className="absolute top-[88px] left-0 right-0 h-[24px] bg-[#f59e0b]/20 border-l-2 border-[#f59e0b] pointer-events-none"></div>
          <div className="text-slate-500 dark:text-slate-400 leading-[24px]">
            <span className="text-primary">def</span> <span className="text-[#e06c75]">bubbleSort</span>(arr):<br />
            &nbsp;&nbsp;n = <span className="text-[#e06c75]">len</span>(arr)<br />
            &nbsp;&nbsp;<span className="text-primary">for</span> i <span className="text-primary">in</span> <span className="text-[#e06c75]">range</span>(n-1):<br />
            &nbsp;&nbsp;&nbsp;&nbsp;swapped = <span className="text-[#d19a66]">False</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">for</span> j <span className="text-primary">in</span> <span className="text-[#e06c75]">range</span>(0, n-i-1):<br />
            <span className="text-slate-900 dark:text-white">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if arr[j] &gt; arr[j + 1]:</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;swapped = <span className="text-[#d19a66]">True</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;arr[j], arr[j + 1] = arr[j + 1], arr[j]<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">if</span> <span className="text-primary">not</span> swapped:<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">return</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">Execution Trace</h3>
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1a1828] p-4 rounded-lg border border-gray-200 dark:border-[#272546]">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Variables</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">i (Outer Loop)</span>
                <span className="font-mono text-slate-900 dark:text-white text-lg">14</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">j (Inner Loop)</span>
                <span className="font-mono text-primary text-lg font-bold">8</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">arr[j]</span>
                <span className="font-mono text-slate-900 dark:text-white text-lg">15</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">arr[j+1]</span>
                <span className="font-mono text-slate-900 dark:text-white text-lg">3</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1828] p-4 rounded-lg border border-gray-200 dark:border-[#272546]">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Log</h4>
            <div className="space-y-3">
              <div className="flex gap-3 items-start text-sm">
                <span className="text-slate-500 font-mono text-xs mt-0.5">Step 124</span>
                <p className="text-slate-600 dark:text-slate-300">Comparing index <span className="text-primary font-mono">8</span> (15) and <span className="text-primary font-mono">9</span> (3).</p>
              </div>
              <div className="flex gap-3 items-start text-sm">
                <span className="text-slate-500 font-mono text-xs mt-0.5">Step 125</span>
                <p className="text-slate-900 dark:text-white font-medium">Condition True: 15 &gt; 3</p>
              </div>
              <div className="flex gap-3 items-start text-sm">
                <span className="text-slate-500 font-mono text-xs mt-0.5">Step 126</span>
                <p className="text-rose-500 dark:text-[#ef4444] font-medium">Swap performed.</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              Complexity Analysis
            </h4>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Time (Worst)</span>
                <span className="text-slate-900 dark:text-white font-mono">O(n²)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Time (Best)</span>
                <span className="text-slate-900 dark:text-white font-mono">O(n)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Space</span>
                <span className="text-slate-900 dark:text-white font-mono">O(1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <VisualizationLayout title="Sorting" sidebar={sidebar} sidebarPosition="right">
      {/* Algorithm Selection Header */}
      <div className="absolute top-0 left-0 w-full z-10 px-6 pt-4 bg-white/90 dark:bg-[#131221]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#272546]">
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
          {['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort'].map((algo) => (
            <button
              key={algo}
              onClick={() => setActiveAlgorithm(algo)}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-3 px-2 transition-colors whitespace-nowrap ${activeAlgorithm === algo
                  ? 'border-primary text-primary dark:text-white font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`}
            >
              <span className="text-sm tracking-[0.015em]">{algo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Header */}
      <div className="absolute top-[70px] left-0 w-full z-10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{activeAlgorithm} Visualization</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Comparing adjacent elements and swapping them if they are in the wrong order.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] rounded-lg px-4 py-2 flex flex-col min-w-[100px] shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Array Size</span>
            <span className="text-xl font-mono font-bold text-slate-900 dark:text-white">{array.length}</span>
          </div>
          <div className="bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] rounded-lg px-4 py-2 flex flex-col min-w-[100px] shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Comparisons</span>
            <span className="text-xl font-mono font-bold text-slate-900 dark:text-white">24</span>
          </div>
          <div className="bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] rounded-lg px-4 py-2 flex flex-col min-w-[100px] shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Swaps</span>
            <span className="text-xl font-mono font-bold text-rose-500 dark:text-[#ef4444]">12</span>
          </div>
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className="absolute inset-0 top-[180px] bottom-[80px] px-6 lg:px-12 flex items-end justify-center gap-2 lg:gap-4 pb-12">
        {/* Legend (Left Top of Canvas) */}
        <div className="absolute top-0 left-6 flex items-center gap-6 bg-white/90 dark:bg-[#1a1926]/90 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-xl px-5 py-3 shadow-xl z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6366f1] shadow-[0_0_12px_#6366f1]"></div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium tracking-wide">Active (j)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_12px_#f59e0b]"></div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium tracking-wide">Compare (j+1)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2d2b42] border border-gray-400 dark:border-white/5"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium tracking-wide">Sorted</span>
          </div>
        </div>

        {array.map((val, i) => (
          <div
            key={i}
            className={`flex-1 max-w-[4rem] rounded-t-lg relative group transition-all duration-300
                        ${i === 3 ? 'bg-[#f59e0b] shadow-[0_0_40px_-8px_rgba(245,158,11,0.5)] z-10' :
                i === 4 ? 'bg-[#6366f1] shadow-[0_0_40px_-8px_rgba(99,102,241,0.5)] z-20' :
                  'bg-slate-300 dark:bg-[#2d2b42]'}`}
            style={{ height: `${val}%` }}
          >
            {/* Labels for active nodes */}
            {(i === 3 || i === 4) && (
              <>
                <span className={`absolute -top-10 left-1/2 -translate-x-1/2 text-lg font-mono font-bold animate-bounce ${i === 3 ? 'text-[#f59e0b]' : 'text-[#6366f1]'}`}>{val}</span>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className={`bg-${i === 3 ? '[#f59e0b]' : '[#6366f1]'}/10 border border-${i === 3 ? '[#f59e0b]' : '[#6366f1]'}/20 text-${i === 3 ? '[#f59e0b]' : '[#6366f1]'} text-xs font-bold font-mono px-3 py-1.5 rounded-lg shadow-lg`}>
                    {i === 3 ? 'j+1' : 'j'}
                  </div>
                </div>
              </>
            )}
            {/* Tooltip on hover for others */}
            {i !== 3 && i !== 4 && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-mono text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
        <div className="bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] rounded-xl p-3 flex items-center justify-between gap-6 shadow-lg">
          <div className="flex items-center gap-2">
            <button className="text-white bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Generate New Array
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors" title="Start">
              <span className="material-symbols-outlined">skip_previous</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors" title="Step Backward">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-2 bg-slate-100 dark:bg-white text-slate-900 dark:text-background-dark hover:bg-slate-200 rounded-full mx-2 transition-colors shadow-lg shadow-black/5" title="Play/Pause">
              <span className="material-symbols-outlined filled">pause</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors" title="Step Forward">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors" title="End">
              <span className="material-symbols-outlined">skip_next</span>
            </button>
          </div>
          <div className="flex items-center gap-4 min-w-[200px]">
            <span className="text-xs font-medium text-slate-400 uppercase">Speed</span>
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-[#272546] rounded-full relative group cursor-pointer">
              <div className="absolute left-0 top-0 bottom-0 w-[60%] bg-primary rounded-full group-hover:bg-primary/80 transition-colors"></div>
              <div className="absolute left-[60%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow border border-slate-200 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"></div>
            </div>
            <span className="text-xs font-mono text-slate-900 dark:text-white w-8 text-right">2x</span>
          </div>
        </div>
      </div>

      <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }
            `}</style>
    </VisualizationLayout>
  )
}

export default Sorting
