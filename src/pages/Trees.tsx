import VisualizationLayout from '../components/layout/VisualizationLayout';

const Trees = () => {
  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Status Card */}
      <div className="p-6 border-b border-gray-200 dark:border-[#272546]">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-2 rounded-full bg-primary animate-pulse"></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9794c7]">Status</h3>
        </div>
        <div className="bg-slate-50 dark:bg-[#1c1a32] rounded-lg p-4 border-l-4 border-primary">
          <p className="text-slate-900 dark:text-white font-medium mb-1">Inserting node <span className="text-primary font-mono">85</span></p>
          <p className="text-slate-500 dark:text-[#9794c7] text-sm leading-relaxed">
            Comparing 85 with 80. Since 85 &gt; 80, moving to right child.
          </p>
        </div>
      </div>

      {/* Pseudo Code */}
      <div className="p-6 flex-1 flex flex-col min-h-[200px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9794c7]">Algorithm</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-[#272546] text-slate-500 dark:text-[#9794c7] font-mono">insert(node, val)</span>
        </div>
        <div className="bg-slate-100 dark:bg-[#0f111a] rounded-lg p-4 font-mono text-sm overflow-x-auto text-slate-500 dark:text-gray-400 leading-6 border border-gray-200 dark:border-[#272546] shadow-inner">
          <pre><code>if (node == null)
            return createNode(val);

            if (val &lt; node.key)
            node.left = insert(node.left, val);

            <span className="block bg-primary/20 -mx-4 px-4 text-slate-900 dark:text-white border-l-2 border-primary">else if (val &gt; node.key)
              node.right = insert(node.right, val);</span>

            return node;</code></pre>
        </div>
      </div>

      {/* Tree Stats */}
      <div className="p-6 border-t border-gray-200 dark:border-[#272546]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9794c7] mb-4">Tree Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Balance Indicator */}
          <div className="col-span-2 bg-slate-50 dark:bg-[#1c1a32] p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-[#9794c7] text-xs font-medium mb-1">Balance Status</p>
              <p className="text-green-600 dark:text-green-400 font-bold text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Balanced
              </p>
            </div>
            <div className="relative size-12">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200 dark:text-[#272546]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                <path className="text-green-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="85, 100" strokeWidth="4"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-white">85%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Log */}
      <div className="p-6 border-t border-gray-200 dark:border-[#272546] bg-slate-50 dark:bg-[#0f111a] flex-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9794c7] mb-3">Action Log</h3>
        <div className="space-y-3">
          <div className="flex gap-3 text-sm">
            <span className="text-slate-400 font-mono text-xs pt-0.5">10:42:15</span>
            <p className="text-slate-600 dark:text-slate-300">Inserted <span className="text-slate-900 dark:text-white font-bold">45</span> successfully.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const controls = (
    <div className="bg-white dark:bg-[#131221] border-t border-gray-200 dark:border-[#272546] p-4 lg:p-6 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center max-w-7xl mx-auto w-full">
        {/* Input & Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-40 min-w-[120px]">
            <input className="w-full h-11 px-4 rounded-lg bg-slate-100 dark:bg-[#1c1a32] border border-slate-300 dark:border-[#383564] text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono font-medium" placeholder="Value..." type="number" defaultValue="85" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button className="flex-1 sm:flex-none h-11 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 min-w-[100px]">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Insert
            </button>
            <button className="flex-1 sm:flex-none h-11 px-5 bg-slate-100 dark:bg-[#272546] hover:bg-slate-200 dark:hover:bg-[#383564] text-slate-900 dark:text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors min-w-[100px]">
              <span className="material-symbols-outlined text-[18px]">search</span>
              Search
            </button>
            <button className="flex-1 sm:flex-none h-11 px-5 bg-slate-100 dark:bg-[#272546] hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors min-w-[100px]">
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Remove
            </button>
          </div>
        </div>
        {/* Player Controls */}
        <div className="flex items-center gap-4 w-full xl:w-auto border-t xl:border-t-0 border-slate-200 dark:border-[#272546] pt-4 xl:pt-0">
          <div className="flex items-center gap-2">
            <button className="size-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-[#9794c7] hover:bg-slate-100 dark:hover:bg-[#272546] transition-colors">
              <span className="material-symbols-outlined">skip_previous</span>
            </button>
            <button className="size-11 flex items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-transform active:scale-95">
              <span className="material-symbols-outlined">play_arrow</span>
            </button>
            <button className="size-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-[#9794c7] hover:bg-slate-100 dark:hover:bg-[#272546] transition-colors">
              <span className="material-symbols-outlined">skip_next</span>
            </button>
          </div>
          {/* Speed Slider */}
          <div className="flex items-center gap-3 flex-1 min-w-[150px]">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">speed</span>
            <div className="h-1.5 bg-slate-200 dark:bg-[#272546] rounded-full flex-1 relative group cursor-pointer">
              <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-primary rounded-full"></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 bg-white rounded-full shadow border-2 border-primary group-hover:scale-125 transition-transform"></div>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-[#9794c7]">1.0x</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <VisualizationLayout title="Binary Search Tree" sidebar={sidebar} sidebarPosition="right" controls={controls}>
      {/* SVG Tree Visualization */}
      <svg className="w-full h-full pointer-events-none select-none" height="500" viewBox="0 0 800 500" width="800">
        <defs>
          <filter height="140%" id="glow" width="140%" x="-20%" y="-20%">
            <feGaussianBlur result="blur" stdDeviation="3"></feGaussianBlur>
            <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
          </filter>
        </defs>
        {/* Edges */}
        <g className="stroke-slate-300 dark:stroke-[#383564]" strokeWidth="2">
          <line x1="400" x2="200" y1="50" y2="150"></line>
          <line className="stroke-primary dark:stroke-primary opacity-50" strokeWidth="3" x1="400" x2="600" y1="50" y2="150"></line>
          <line x1="200" x2="100" y1="150" y2="250"></line>
          <line x1="200" x2="300" y1="150" y2="250"></line>
          <line x1="600" x2="500" y1="150" y2="250"></line>
          <line className="stroke-primary dark:stroke-primary opacity-80" strokeWidth="3" x1="600" x2="700" y1="150" y2="250"></line>
          <line x1="300" x2="250" y1="250" y2="350"></line>
          <line x1="300" x2="350" y1="250" y2="350"></line>
          <line className="stroke-primary dark:stroke-primary" strokeDasharray="5 5" strokeWidth="3" x1="700" x2="750" y1="250" y2="350"></line>
        </g>

        {/* Nodes */}
        <g transform="translate(400, 50)">
          <circle className="fill-white dark:fill-[#1e212b] stroke-slate-300 dark:stroke-[#383564]" r="24" strokeWidth="2"></circle>
          <text className="fill-slate-700 dark:fill-white text-sm font-bold font-display" textAnchor="middle" y="5">50</text>
        </g>
        <g transform="translate(200, 150)">
          <circle className="fill-white dark:fill-[#1e212b] stroke-slate-300 dark:stroke-[#383564]" r="24" strokeWidth="2"></circle>
          <text className="fill-slate-700 dark:fill-white text-sm font-bold font-display" textAnchor="middle" y="5">30</text>
        </g>
        <g transform="translate(600, 150)">
          <circle className="fill-primary/20 stroke-primary" r="24" strokeWidth="2"></circle>
          <text className="fill-primary dark:fill-white text-sm font-bold font-display" textAnchor="middle" y="5">70</text>
        </g>
        <g transform="translate(100, 250)">
          <circle className="fill-white dark:fill-[#1e212b] stroke-slate-300 dark:stroke-[#383564]" r="24" strokeWidth="2"></circle>
          <text className="fill-slate-700 dark:fill-white text-sm font-bold font-display" textAnchor="middle" y="5">20</text>
        </g>
        <g transform="translate(300, 250)">
          <circle className="fill-white dark:fill-[#1e212b] stroke-slate-300 dark:stroke-[#383564]" r="24" strokeWidth="2"></circle>
          <text className="fill-slate-700 dark:fill-white text-sm font-bold font-display" textAnchor="middle" y="5">40</text>
        </g>
        <g transform="translate(500, 250)">
          <circle className="fill-white dark:fill-[#1e212b] stroke-slate-300 dark:stroke-[#383564]" r="24" strokeWidth="2"></circle>
          <text className="fill-slate-700 dark:fill-white text-sm font-bold font-display" textAnchor="middle" y="5">60</text>
        </g>
        <g transform="translate(700, 250)">
          <circle className="fill-primary shadow-[0_0_15px_rgba(66,54,231,0.5)]" r="26"></circle>
          <text className="fill-white text-sm font-bold font-display" textAnchor="middle" y="5">80</text>
          <text className="fill-primary text-xs font-bold uppercase tracking-wide" textAnchor="middle" y="-35">Current</text>
        </g>
        <g transform="translate(250, 350)">
          <circle className="fill-white dark:fill-[#1e212b] stroke-slate-300 dark:stroke-[#383564]" r="24" strokeWidth="2"></circle>
          <text className="fill-slate-700 dark:fill-white text-sm font-bold font-display" textAnchor="middle" y="5">35</text>
        </g>
        <g transform="translate(350, 350)">
          <circle className="fill-white dark:fill-[#1e212b] stroke-slate-300 dark:stroke-[#383564]" r="24" strokeWidth="2"></circle>
          <text className="fill-slate-700 dark:fill-white text-sm font-bold font-display" textAnchor="middle" y="5">45</text>
        </g>
        <g className="opacity-70" transform="translate(750, 350)">
          <circle className="fill-transparent stroke-primary stroke-dasharray-4" r="24" strokeDasharray="4 4" strokeWidth="2"></circle>
          <text className="fill-primary text-sm font-bold font-display" textAnchor="middle" y="5">85?</text>
        </g>
      </svg>

      {/* Reset Zoom Button overlay */}
      <div className="absolute bottom-28 right-6 z-10">
        <button className="flex items-center justify-center size-10 rounded-lg bg-white dark:bg-[#272546] shadow-lg text-slate-700 dark:text-white hover:text-primary dark:hover:text-primary transition-colors" title="Reset View">
          <span className="material-symbols-outlined">center_focus_strong</span>
        </button>
      </div>

      <style>{`
                .node-enter {
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes popIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
    </VisualizationLayout>
  )
}

export default Trees
