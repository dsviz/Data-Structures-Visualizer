import { useState, useEffect, useRef } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';
import { useLayout } from '../context/LayoutContext';
import { SORTING_CODE, Language } from '../data/SortingCode';
import { SORTING_INFO } from '../data/SortingData';
import { playSortingSound } from '../utils/soundUtils';
import {
  SortingFrame,
  generateBubbleSortFrames,
  generateSelectionSortFrames,
  generateInsertionSortFrames,
  generateMergeSortFrames,
  generateQuickSortFrames
} from '../utils/sortingAlgorithms';

const Sorting = () => {
  // --- State ---
  const [array, setArray] = useState<number[]>([]);
  const [frames, setFrames] = useState<SortingFrame[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeAlgorithm, setActiveAlgorithm] = useState('Bubble Sort');
  const [algoKey, setAlgoKey] = useState('bubble'); // key for code lookup
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // UI State
  const { setIsSidebarOpen } = useLayout();
  const [codeLanguage, setCodeLanguage] = useState<Language>('python');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Initial Array
  useEffect(() => {
    handleGenerateArray();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  // Algorithm Switch
  const handleAlgorithmChange = (algo: string) => {
    setActiveAlgorithm(algo);
    setIsPlaying(false);
    setCurrentStep(0);

    let key = 'bubble';
    if (algo === 'Bubble Sort') key = 'bubble';
    else if (algo === 'Selection Sort') key = 'selection';
    else if (algo === 'Insertion Sort') key = 'insertion';
    else if (algo === 'Merge Sort') key = 'merge';
    else if (algo === 'Quick Sort') key = 'quick';

    setAlgoKey(key);
    // Regenerate frames for current array with new algo
    if (array.length > 0) generateFrames(array, key);
  };

  const handleGenerateArray = () => {
    const newArr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 90) + 10);
    setArray(newArr);
    generateFrames(newArr, algoKey);
    setShowCustomInput(false);
    setCustomInput('');
  };

  const handleCustomArraySubmit = () => {
    try {
      const nums = customInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (nums.length > 0) {
        setArray(nums);
        generateFrames(nums, algoKey);
        setShowCustomInput(false);
      }
    } catch (e) {
      console.error("Invalid input", e);
    }
  };

  const generateFrames = (arr: number[], key: string) => {
    let newFrames: SortingFrame[] = [];
    if (key === 'bubble') newFrames = generateBubbleSortFrames(arr);
    else if (key === 'selection') newFrames = generateSelectionSortFrames(arr);
    else if (key === 'insertion') newFrames = generateInsertionSortFrames(arr);
    else if (key === 'merge') newFrames = generateMergeSortFrames(arr);
    else if (key === 'quick') newFrames = generateQuickSortFrames(arr);

    setFrames(newFrames);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Playback Loop
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      timerRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev < frames.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1000 / playbackSpeed);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, frames.length, playbackSpeed]);

  // Sound Effect Hook
  useEffect(() => {
    if (isSoundEnabled && frames.length > 0 && currentStep < frames.length) {
      // Find active elements to play sound for
      // We can use highlights or the value being modified
      const frame = frames[currentStep];
      if (frame && frame.highlights.length > 0) {
        // Play sound for the first highlighted element
        // Or maybe the max value to represent the "active" high comparison?
        // Let's grab the value from the array at the highlight index
        const val = frame.array[frame.highlights[0]];
        if (typeof val === 'number') {
          playSortingSound(val);
        }
      }
    }
  }, [currentStep, isSoundEnabled, frames]);


  const currentFrame = frames[currentStep] || {
    array: array,
    highlights: [],
    sortedIndices: [],
    codeLine: 0,
    variables: {},
    description: "Ready"
  };

  // Use current frame's array for visualization, falling back to initial state if needed
  const displayArray = currentFrame.array && currentFrame.array.length > 0 ? currentFrame.array : array;

  // --- Tabbed Sidebar State ---
  const [activeTab, setActiveTab] = useState<'controls' | 'code' | 'pseudocode' | 'info'>('controls');

  // --- Effects ---
  // Ensure sidebar is open (if we relied on closing it before, now it stays open but switches tabs)
  useEffect(() => {
    setIsSidebarOpen(true);
  }, [setIsSidebarOpen]);


  // --- Render Helpers ---

  const renderTabs = () => (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-[#272546] bg-gray-50/50 dark:bg-[#1a1828]/50">
      <button
        onClick={() => setActiveTab('controls')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'controls'
          ? 'bg-white dark:bg-[#272546] text-primary shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2d2b4d]'
          }`}
      >
        <span className="material-symbols-outlined text-[18px]">tune</span>
        <span className="hidden sm:inline">Controls</span>
      </button>
      <button
        onClick={() => setActiveTab('code')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'code'
          ? 'bg-white dark:bg-[#272546] text-primary shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2d2b4d]'
          }`}
      >
        <span className="material-symbols-outlined text-[18px]">terminal</span>
        <span className="hidden sm:inline">Code</span>
      </button>
      <button
        onClick={() => setActiveTab('pseudocode')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pseudocode'
          ? 'bg-white dark:bg-[#272546] text-primary shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2d2b4d]'
          }`}
      >
        <span className="material-symbols-outlined text-[18px]">code</span>
        <span className="hidden sm:inline">Pseudo</span>
      </button>
      <button
        onClick={() => setActiveTab('info')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'info'
          ? 'bg-white dark:bg-[#272546] text-primary shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2d2b4d]'
          }`}
      >
        <span className="material-symbols-outlined text-[18px]">info</span>
        <span className="hidden sm:inline">Info</span>
      </button>
    </div>
  );

  const renderControlsContent = () => (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6">
      {/* Algorithm Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Algorithm</label>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] text-slate-700 dark:text-slate-200 py-2.5 pl-3 pr-3 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer flex items-center justify-between transition-all hover:border-primary/50"
          >
            <span>{activeAlgorithm}</span>
            <span className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100 origin-top">
              <div className="p-1 max-h-60 overflow-y-auto">
                {[
                  'Bubble Sort',
                  'Selection Sort',
                  'Insertion Sort',
                  'Merge Sort',
                  'Quick Sort'
                ].map((algo) => (
                  <button
                    key={algo}
                    onClick={() => {
                      handleAlgorithmChange(algo);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${activeAlgorithm === algo
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#2d2b4d] hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    {algo}
                    {activeAlgorithm === algo && <span className="material-symbols-outlined text-[18px]">check</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Playback Control */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Playback</label>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${isPlaying
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
            : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">{isPlaying ? 'pause' : 'play_arrow'}</span>
          {isPlaying ? 'Pause Visualization' : 'Start Visualization'}
        </button>
      </div>

      {/* Input Controls */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Array</label>
        <div className="flex flex-col gap-2">
          {!showCustomInput ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleGenerateArray}
                className="text-white bg-primary hover:bg-primary/90 rounded-xl px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-primary/20"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Random
              </button>
              <button
                onClick={() => setShowCustomInput(true)}
                className="text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] hover:bg-gray-50 dark:hover:bg-[#2d2b4d] rounded-xl px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Custom
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1e1c33] p-3 rounded-xl border border-gray-200 dark:border-[#272546] animate-in slide-in-from-top-2 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500">Values (comma separated)</span>
                <button onClick={() => setShowCustomInput(false)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">close</span></button>
              </div>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. 10, 5, 8, 3..."
                className="w-full bg-gray-50 dark:bg-[#151426] border border-gray-200 dark:border-[#272546] rounded-lg px-3 py-2 text-xs font-mono mb-3 focus:ring-2 focus:ring-primary/50 outline-none dark:text-white transition-all"
              />
              <button
                onClick={handleCustomArraySubmit}
                className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm"
              >
                Visualize Array
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-[#272546]"></div>

      {/* Execution Trace Accordion */}
      <div className="pt-2 border-t border-gray-100 dark:border-[#272546]">
        <button
          onClick={() => setIsTraceOpen(!isTraceOpen)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1e1c33] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">data_object</span>
            <span className="text-slate-900 dark:text-white font-bold text-sm">Execution Trace</span>
          </div>
          <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${isTraceOpen ? 'rotate-180' : ''}`}>expand_more</span>
        </button>

        {isTraceOpen && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Variables */}
            <div className="bg-white dark:bg-[#1a1828] p-4 rounded-xl border border-gray-200 dark:border-[#272546] shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Local Variables</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(currentFrame.variables).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 dark:bg-[#232136] p-2 rounded-lg border border-gray-100 dark:border-white/5">
                    <span className="text-[10px] text-slate-500 block mb-0.5 font-mono">{key}</span>
                    <span className="font-mono text-slate-900 dark:text-white text-sm font-semibold">{val}</span>
                  </div>
                ))}
                {Object.keys(currentFrame.variables).length === 0 && <span className="text-xs text-gray-400 italic col-span-2 text-center py-2">No active variables</span>}
              </div>
            </div>

            {/* Log */}
            <div className="bg-white dark:bg-[#1a1828] p-4 rounded-xl border border-gray-200 dark:border-[#272546] shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Current Step Log</h4>
              <div className="flex gap-3 items-start">
                <div className="shrink-0 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold font-mono mt-0.5">
                  {currentStep}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {currentFrame.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCodeContent = () => (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-[#272546] bg-white dark:bg-[#1e1c33] shrink-0">
        <div className="flex p-1 bg-gray-100 dark:bg-[#151426] rounded-lg">
          {(['c', 'cpp', 'java', 'python'] as Language[]).map(lang => (
            <button key={lang} onClick={() => setCodeLanguage(lang)} className={`flex-1 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all duration-200 ${codeLanguage === lang ? 'bg-white dark:bg-[#272546] text-primary shadow-sm scale-100' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5'}`}>
              {lang === 'c' ? 'C' : lang === 'cpp' ? 'C++' : lang === 'java' ? 'Java' : 'Python'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-4 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-y-auto bg-gray-50/50 dark:bg-[#131221]/50">
        <div className="space-y-0.5">
          {(() => {
            if (!SORTING_CODE[algoKey]) return <span className="text-gray-500 italic px-2">No code available.</span>;
            const codeData = SORTING_CODE[algoKey][codeLanguage];
            const activeLines = codeData.mapping[currentFrame.codeLine];
            const activeLineIndices = Array.isArray(activeLines) ? activeLines : (activeLines !== undefined ? [activeLines] : []);

            return codeData.lines.map((line, idx) => {
              const isActive = activeLineIndices.includes(idx);
              let valueComment = '';

              if (isActive) {
                const relevantVars: string[] = [];
                Object.entries(currentFrame.variables).forEach(([key, val]) => {
                  // Escape key for regex
                  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                  // For keys with special chars (likely array access), use simple includes
                  // For identifiers, use word boundary regex to avoid partial matches (e.g. 'i' in 'int')
                  if (key.includes('[') || key.includes('.')) {
                    if (line.includes(key)) relevantVars.push(`${key}=${val}`);
                  } else {
                    if (new RegExp(`\\b${escapedKey}\\b`).test(line)) relevantVars.push(`${key}=${val}`);
                  }
                });

                if (relevantVars.length > 0) {
                  valueComment = ` // ${relevantVars.join(', ')}`;
                }
              }

              return (
                <div key={idx} className={`px-3 py-1 -mx-2 rounded flex gap-3 transition-colors duration-200 ${isActive ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 border-l-2 border-indigo-500 font-bold' : 'border-l-2 border-transparent hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                  <span className={`select-none w-6 text-right ${isActive ? 'text-indigo-400 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-600'}`}>{idx + 1}</span>
                  <span className="whitespace-pre flex-1">
                    {line}
                    {isActive && valueComment && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-4 inline-block">
                        {valueComment}
                      </span>
                    )}
                  </span>
                </div>
              )
            });
          })()}
        </div>
      </div>
    </div>
  );

  const renderPseudocodeContent = () => (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50 dark:bg-[#131221]/50">
      <div className="p-8 text-center">
        <div className="inline-flex size-12 rounded-full bg-gray-100 dark:bg-[#272546] items-center justify-center mb-3">
          <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">code</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Simplified pseudocode view coming soon.</p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Please use the Code tab for implementation details.</p>
      </div>
    </div>
  );

  const renderInfoContent = () => {
    const info = SORTING_INFO[activeAlgorithm];
    if (!info) return <div className="p-4 text-gray-500">No info available</div>;

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6">

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#232136] p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
            {info.description}
          </p>
        </div>

        {/* Complexity */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Complexity</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-lg border border-emerald-100 dark:border-emerald-500/20 text-center">
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-1">BEST</div>
              <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">{info.complexity.time.best}</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-500/20 text-center">
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-1">AVERAGE</div>
              <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">{info.complexity.time.average}</div>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg border border-rose-100 dark:border-rose-500/20 text-center">
              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mb-1">WORST</div>
              <div className="text-xs font-mono font-bold text-rose-700 dark:text-rose-300">{info.complexity.time.worst}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Space Complexity</h3>
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-2 rounded-lg border border-indigo-100 dark:border-indigo-500/20 text-center">
            <div className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">{info.complexity.space}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color Legend</h3>
          <div className="bg-white dark:bg-[#232136] rounded-xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5 overflow-hidden">
            {info.legend.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3">
                <div className={`size-4 rounded-md shadow-sm border border-black/5 ${item.colorClass}`}></div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</div>
                  {item.description && <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{item.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const unifiedRightSidebar = (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1c33] border-l border-gray-200 dark:border-[#272546]">
      {renderTabs()}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'controls' && renderControlsContent()}
        {activeTab === 'code' && renderCodeContent()}
        {activeTab === 'pseudocode' && renderPseudocodeContent()}
        {activeTab === 'info' && renderInfoContent()}
      </div>
    </div>
  );

  const bottomControls = (
    <>
      {/* Show Controls Button (Floating) */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-all hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Show Timeline
        </button>
      )}

      {/* Main Controls Bar */}
      <div className={`transition-all duration-300 z-30 w-full bg-white dark:bg-[#131221] border-t border-gray-200 dark:border-[#272546] flex items-center justify-between gap-6 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] relative ${showControls ? 'h-16 opacity-100 translate-y-0' : 'h-0 opacity-0 translate-y-full overflow-hidden'}`}>

        {/* Hide Button (Absolute) */}
        <button
          onClick={() => setShowControls(false)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-[#272546] border border-gray-200 dark:border-transparent rounded-full p-1 shadow-sm text-gray-400 hover:text-red-500 transition-colors z-40 hidden group-hover:block hover:block"
          title="Hide Timeline"
        >
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </button>

        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentStep(0)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">skip_previous</span></button>
          <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><span className="material-symbols-outlined text-[24px]">fast_rewind</span></button>

          <button onClick={() => setIsPlaying(!isPlaying)} className="mx-2 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 bg-primary size-10">
            <span className="material-symbols-outlined filled text-[24px]">{isPlaying ? 'pause' : 'play_arrow'}</span>
          </button>

          <button onClick={() => setCurrentStep(s => Math.min(frames.length - 1, s + 1))} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><span className="material-symbols-outlined text-[24px]">fast_forward</span></button>
          <button onClick={() => setCurrentStep(frames.length - 1)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">skip_next</span></button>
        </div>

        {/* Timeline */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] font-medium font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <span>Timeline</span>
            <span className="text-primary">{Math.round((currentStep / (frames.length > 0 ? frames.length - 1 : 1)) * 100)}%</span>
          </div>
          <div
            className="h-1 w-full bg-gray-100 dark:bg-[#1e1c33] rounded-full overflow-hidden relative cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentStep(Math.floor(pct * (frames.length - 1)));
            }}
          >
            <div className="h-full bg-primary relative rounded-full transition-all duration-100 ease-out" style={{ width: `${(currentStep / (frames.length > 0 ? frames.length - 1 : 1)) * 100}%` }}></div>
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" style={{ width: `${(currentStep / (frames.length > 0 ? frames.length - 1 : 1)) * 100}%` }}></div>
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center gap-2 border-l border-gray-100 dark:border-[#272546] pl-6">
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-2 rounded-full transition-colors ${isSoundEnabled ? 'text-primary bg-primary/10' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
            title={isSoundEnabled ? "Mute Sounds" : "Enable Sounds"}
          >
            <span className="material-symbols-outlined text-[20px]">{isSoundEnabled ? 'volume_up' : 'volume_off'}</span>
          </button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-3 min-w-[140px] border-l border-gray-100 dark:border-[#272546] pl-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Speed</span>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-200 dark:bg-[#1e1c33] rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-[10px] font-mono text-slate-900 dark:text-white w-6 text-right">{playbackSpeed}x</span>

          <button
            onClick={() => setShowControls(false)}
            className="ml-2 text-gray-300 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
            title="Hide Controls"
          >
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </button>
        </div>
      </div>
    </>
  );



  return (
    <VisualizationLayout
      title="Sorting"
      sidebar={null} // Left sidebar is consolidated into right tab
      sidebarPosition="right"
      rightSidebar={unifiedRightSidebar}
      rightSidebarWidth={350}
      controls={bottomControls}
    >
      {/* Stats Header (Updated Position since top bar is gone) */}
      <div className="absolute top-2 left-0 w-full z-10 px-6 py-2 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        {/* Left: Title or Breadcrumbs could go here if needed, but VisualLayout handles it */}
        <div></div>

        {/* Right: Stats */}
        <div className="flex gap-2 pointer-events-auto">
          <div className="bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] rounded-xl px-3 py-2 flex flex-col min-w-[70px] shadow-sm backdrop-blur-md">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Array Size</span>
            <span className="text-lg font-mono font-bold text-slate-900 dark:text-white leading-none mt-0.5">{displayArray.length}</span>
          </div>
          <div className="bg-white dark:bg-[#1e1c33] border border-gray-200 dark:border-[#272546] rounded-xl px-3 py-2 flex flex-col min-w-[70px] shadow-sm backdrop-blur-md">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Step</span>
            <span className="text-lg font-mono font-bold text-slate-900 dark:text-white leading-none mt-0.5">{currentStep}/{frames.length > 0 ? frames.length - 1 : 0}</span>
          </div>
        </div>
      </div>



      {/* Visualization Canvas */}
      {
        (activeAlgorithm === 'Merge Sort' || activeAlgorithm === 'Quick Sort') && currentFrame.mergeLevels ? (
          <div className="absolute inset-0 top-0 bottom-0 px-4 py-12 pt-24 overflow-y-auto flex flex-col items-center">
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
              {currentFrame.mergeLevels.map((level, levelIdx) => (
                <div key={levelIdx} className="flex justify-center relative h-16 w-full">
                  {/* Render groups for this level */}
                  {level.map((group) => {
                    // Calculate relative position based on startIdx and total array length
                    // We use percentages to position groups to align them with their "original" indices
                    const totalLen = Math.max(displayArray.length, 1);
                    const leftPct = (group.startIdx / totalLen) * 100;
                    const widthPct = (group.values.length / totalLen) * 100;

                    let borderColor = 'border-slate-300 dark:border-slate-600';
                    let bgColor = 'bg-white dark:bg-[#1e1c33]';
                    let textColor = 'text-slate-700 dark:text-slate-300';
                    let scale = 'scale-100';
                    let zIndex = 'z-10';

                    if (group.state === 'left') {
                      borderColor = 'border-indigo-400 dark:border-indigo-500';
                      bgColor = 'bg-indigo-50 dark:bg-indigo-900/20';
                    } else if (group.state === 'right') {
                      borderColor = 'border-purple-400 dark:border-purple-500';
                      bgColor = 'bg-purple-50 dark:bg-purple-900/20';
                    } else if (group.state === 'sorted') {
                      borderColor = 'border-emerald-400 dark:border-emerald-500';
                      bgColor = 'bg-emerald-50 dark:bg-emerald-900/20';
                      textColor = 'text-emerald-700 dark:text-emerald-300';
                    } else if (group.state === 'merging') {
                      borderColor = 'border-amber-400 dark:border-amber-500';
                      bgColor = 'bg-amber-50 dark:bg-amber-900/20';
                      scale = 'scale-105 shadow-lg';
                      zIndex = 'z-20';
                    } else if (group.state === 'pivot') {
                      borderColor = 'border-rose-500 dark:border-rose-500';
                      bgColor = 'bg-rose-50 dark:bg-rose-900/20';
                      textColor = 'text-rose-700 dark:text-rose-300';
                      scale = 'scale-110 shadow-xl';
                      zIndex = 'z-30';
                    }


                    return (
                      <div
                        key={group.id}
                        className={`absolute top-0 h-full transition-all duration-300 flex items-center justify-center p-1 ${zIndex}`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`
                        }}
                      >
                        <div className={`flex items-center justify-center gap-0.5 w-full h-full border-2 rounded-lg ${borderColor} ${bgColor} ${scale} transition-all duration-300`}>
                          {group.values.map((val, idx) => (
                            <div key={idx} className={`flex-1 flex items-center justify-center h-full text-[10px] sm:text-xs font-mono font-bold ${textColor}`}>
                              {val}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 top-0 bottom-0 px-6 lg:px-12 flex items-end justify-center gap-2 lg:gap-4 pb-12 pt-28">
            {displayArray.map((val, i) => {
              const isHighlight = currentFrame.highlights.includes(i);
              const isSorted = currentFrame.sortedIndices.includes(i);

              return (
                <div
                  key={i}
                  className={`flex-1 max-w-[4rem] rounded-t-lg relative group transition-all duration-300
                                        ${isHighlight
                      ? 'bg-primary shadow-[0_0_20px_rgba(99,102,241,0.5)] z-20 scale-105'
                      : isSorted
                        ? 'bg-emerald-500/80 dark:bg-emerald-500/60'
                        : 'bg-indigo-300/30 dark:bg-[#2d2b42] border border-indigo-300/50 dark:border-transparent'}`}
                  style={{ height: `${val}%` }}
                >
                  {/* Value Label */}
                  <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold ${isHighlight ? 'text-white' :
                    isSorted ? 'text-white' :
                      'text-slate-600 dark:text-slate-400'
                    }`}>
                    {val}
                  </span>
                  {isHighlight && (
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-50">
                      <div className="bg-slate-900 text-white text-[10px] font-bold font-mono px-2 py-1 rounded-lg shadow-xl whitespace-nowrap mb-1">
                        Val: {val}
                      </div>
                      <div className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold font-mono px-2 py-1 rounded-lg shadow-sm whitespace-nowrap">
                        Idx: {i}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </VisualizationLayout >
  )
}

export default Sorting;
