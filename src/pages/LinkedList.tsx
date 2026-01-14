import { useState } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';

const LinkedList = () => {
    // State for visualization
    const [nodes, setNodes] = useState([12, 45, 99]);
    const [activeOperation, setActiveOperation] = useState<'insert' | null>(null);

    const sidebar = (
        <div>
            {/* Node Configuration */}
            <div className="flex flex-col gap-3 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Node Configuration</h3>
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium dark:text-white">Value</span>
                    <div className="relative">
                        <input className="w-full bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-[#272546] rounded-lg px-4 py-3 dark:text-white placeholder-gray-400 dark:placeholder-[#9794c7] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono transition-all" placeholder="Enter integer..." type="number" defaultValue="42" />
                        <span className="absolute right-3 top-3 text-gray-400 dark:text-[#9794c7] material-symbols-outlined text-lg">123</span>
                    </div>
                </label>
            </div>

            {/* Insertion Operations */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Insertion Operations</h3>
                <button className="group flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-primary hover:bg-blue-600 transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-white">first_page</span>
                        <span className="text-white text-sm font-bold">Push Front</span>
                    </div>
                    <span className="text-[10px] bg-black/20 px-2 py-1 rounded text-white/80 font-mono">O(1)</span>
                </button>
                <button className="group flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#1e1e24] border border-gray-200 dark:border-[#272546] hover:border-primary/50 transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-gray-500 dark:text-white">last_page</span>
                        <span className="text-slate-900 dark:text-white text-sm font-medium">Push Back</span>
                    </div>
                    <span className="text-[10px] bg-gray-200 dark:bg-white/5 px-2 py-1 rounded text-gray-500 dark:text-[#9794c7] font-mono">O(N)</span>
                </button>
                <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-gray-50 dark:bg-[#1e1e24] border border-gray-200 dark:border-[#272546] hover:border-primary/50 transition-all active:scale-[0.98]">
                        <span className="material-symbols-outlined text-gray-500 dark:text-white text-sm">add_circle</span>
                        <span className="text-slate-900 dark:text-white text-sm font-medium">Insert at Index</span>
                    </button>
                    <input className="w-16 bg-gray-50 dark:bg-[#1e1e24] border border-gray-200 dark:border-[#272546] rounded-lg px-2 text-center text-slate-900 dark:text-white font-mono text-sm" placeholder="idx" type="number" defaultValue="2" />
                </div>
            </div>

            <div className="h-[1px] bg-gray-200 dark:bg-[#272546] w-full my-6"></div>

            {/* Removal Operations */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#9794c7]">Removal Operations</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-gray-50 dark:bg-[#1e1e24] border border-gray-200 dark:border-[#272546] hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all active:scale-[0.98] group">
                        <span className="material-symbols-outlined text-gray-500 dark:text-white group-hover:text-red-500 text-sm">remove_circle_outline</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-red-500">Pop Front</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-gray-50 dark:bg-[#1e1e24] border border-gray-200 dark:border-[#272546] hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all active:scale-[0.98] group">
                        <span className="material-symbols-outlined text-gray-500 dark:text-white group-hover:text-red-500 text-sm">remove_circle_outline</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-red-500">Pop Back</span>
                    </button>
                </div>
            </div>

            {/* Animation Speed - Simplified for sidebar */}
            <div className="mt-auto pt-6 border-t border-gray-200 dark:border-[#272546]">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium dark:text-white">Animation Speed</span>
                    <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded">1.0x</span>
                </div>
                <div className="relative flex items-center w-full h-2 rounded-full bg-gray-200 dark:bg-[#1e1e24] cursor-pointer">
                    <div className="absolute h-full bg-primary rounded-full" style={{ width: '50%' }}></div>
                    <div className="absolute h-4 w-4 bg-white rounded-full shadow-lg border-2 border-primary -translate-x-1/2 left-1/2 cursor-grab active:cursor-grabbing"></div>
                </div>
            </div>
        </div>
    );

    const controls = (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#1e1e24]/90 backdrop-blur-md border border-gray-200 dark:border-[#272546] rounded-full shadow-2xl p-2 z-20 flex items-center gap-2">
            <button className="size-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white transition-colors">
                <span className="material-symbols-outlined">skip_previous</span>
            </button>
            <button className="size-12 rounded-full flex items-center justify-center bg-primary hover:bg-primary-hover text-white shadow-lg transition-transform active:scale-95">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </button>
            <button className="size-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white transition-colors">
                <span className="material-symbols-outlined">skip_next</span>
            </button>
        </div>
    );

    return (
        <VisualizationLayout title="Linked List" sidebar={sidebar}>
            {/* Controls (Floating) */}
            {controls}

            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full z-10 px-8 py-5 flex items-center justify-between pointer-events-none">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    <a className="text-gray-500 dark:text-[#9794c7] hover:text-primary transition-colors text-sm" href="#">Data Structures</a>
                    <span className="material-symbols-outlined text-gray-400 dark:text-[#9794c7] text-sm">chevron_right</span>
                    <span className="text-slate-900 dark:text-white text-sm font-medium">Linked List</span>
                </div>
                {/* List Type Toggle */}
                <div className="bg-white dark:bg-[#1e1e24] p-1 rounded-lg border border-gray-200 dark:border-[#272546] flex gap-1 pointer-events-auto shadow-sm">
                    <button className="px-3 py-1.5 rounded bg-primary text-white text-xs font-bold shadow-sm">Singly</button>
                    <button className="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-[#9794c7] hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors">Doubly</button>
                    <button className="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-[#9794c7] hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors">Circular</button>
                </div>
            </div>

            {/* Visualization Area */}
            <div className="flex items-center gap-0">
                {/* Head Pointer */}
                <div className="flex flex-col items-center gap-2 mr-4">
                    <div className="px-2 py-1 bg-red-100 dark:bg-rose-500/20 text-rose-500 dark:text-[#FF3B30] rounded text-xs font-bold tracking-wider border border-rose-200 dark:border-[#FF3B30]/20 shadow-[0_0_15px_rgba(255,59,48,0.3)]">HEAD</div>
                    <div className="h-8 w-[2px] bg-rose-500/50"></div>
                    <span className="material-symbols-outlined text-rose-500 dark:text-[#FF3B30] rotate-180 -mt-2">arrow_drop_up</span>
                </div>

                {nodes.map((val, i) => (
                    <div key={i} className="flex items-center">
                        {/* Node */}
                        <div className="group relative flex flex-col items-center">
                            {/* Node Box */}
                            <div className={`flex h-16 w-36 rounded-lg overflow-hidden border ${i === 0 ? 'border-2 border-primary shadow-[0_0_20px_rgba(66,54,231,0.2)]' : 'border-gray-200 dark:border-[#272546]'} bg-white dark:bg-[#1e1e24] transition-transform hover:scale-105`}>
                                <div className={`flex-1 flex items-center justify-center border-r border-gray-200 dark:border-[#272546] ${i === 0 ? 'bg-primary/10' : ''}`}>
                                    <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">{val}</span>
                                </div>
                                <div className={`w-10 flex items-center justify-center ${i === 0 ? 'bg-primary' : 'bg-gray-100 dark:bg-[#2d2b4d] group-hover:bg-primary/50 transition-colors'}`}>
                                    <div className={`size-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-primary/50 group-hover:bg-white transition-colors'}`}></div>
                                </div>
                            </div>
                            {/* Index Label */}
                            <span className="absolute -bottom-8 text-gray-400 dark:text-[#9794c7] font-mono text-xs">idx: {i}</span>
                            {/* Temp Pointer Overlay (Only for first node as demo) */}
                            {i === 0 && (
                                <div className="absolute -top-12 flex flex-col items-center animate-bounce">
                                    <div className="px-2 py-0.5 bg-primary text-white rounded text-[10px] font-bold border border-primary/50">CURR</div>
                                    <span className="material-symbols-outlined text-primary text-lg -mt-1">arrow_drop_down</span>
                                </div>
                            )}
                        </div>

                        {/* Connector Arrow */}
                        <div className="w-20 h-16 flex items-center justify-center text-gray-300 dark:text-[#9794c7] relative">
                            <svg className="w-full h-8 overflow-visible" fill="none" viewBox="0 0 80 20" xmlns="http://www.w3.org/2000/svg">
                                <path className="arrow-path" d="M0 10 H75" stroke="currentColor" strokeWidth="2" strokeDasharray={i === 0 ? "10" : "0"} style={i === 0 ? { animation: 'dash 3s linear infinite' } : { opacity: 0.5 }}></path>
                                <path d="M70 5 L78 10 L70 15" fill="none" stroke="currentColor" strokeWidth="2" style={i !== 0 ? { opacity: 0.5 } : {}}></path>
                            </svg>
                            {i === 0 && <span className="absolute -top-2 text-[10px] text-gray-500 dark:text-[#9794c7] font-mono bg-gray-50 dark:bg-[#0b0a15] px-1">next</span>}
                        </div>
                    </div>
                ))}

                {/* Null Pointer */}
                <div className="flex flex-col items-center gap-2">
                    <div className="group relative flex flex-col items-center opacity-70">
                        <div className="flex h-12 w-20 rounded-lg overflow-hidden border border-dashed border-gray-400 dark:border-[#9794c7] bg-transparent items-center justify-center">
                            <span className="font-mono text-sm font-bold text-gray-400 dark:text-[#9794c7]">NULL</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 mt-4 ml-2">
                        <span className="material-symbols-outlined text-emerald-500 dark:text-[#00E096] rotate-180">arrow_drop_up</span>
                        <div className="h-6 w-[2px] bg-emerald-500/50"></div>
                        <div className="px-2 py-1 bg-emerald-100 dark:bg-[#00E096]/20 text-emerald-600 dark:text-[#00E096] rounded text-xs font-bold tracking-wider border border-emerald-200 dark:border-[#00E096]/20">TAIL</div>
                    </div>
                </div>

            </div>

            {/* Floating Panels */}
            {/* Pseudocode Panel */}
            <div className="absolute top-20 right-8 w-72 bg-white/90 dark:bg-[#1e1e24]/90 backdrop-blur-md border border-gray-200 dark:border-[#272546] rounded-xl shadow-2xl overflow-hidden z-20 transition-all hover:border-primary/30 hidden lg:block">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-black/20 border-b border-gray-200 dark:border-[#272546]">
                    <span className="text-xs font-bold text-gray-500 dark:text-[#9794c7] uppercase">Pseudocode (Push Front)</span>
                    <button className="text-gray-400 hover:text-slate-900 dark:hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
                <div className="p-4 font-mono text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                    <div className="text-primary font-bold mb-1">Vertex v = new Vertex(val);</div>
                    <div className="pl-0">v.next = head;</div>
                    <div className="pl-0">head = v;</div>
                    <div className="pl-0 text-gray-400 dark:text-[#9794c7] italic">// if tail was null</div>
                    <div className="pl-0">if (tail == null) tail = v;</div>
                </div>
            </div>

            {/* Legend Panel */}
            <div className="absolute bottom-24 right-8 bg-white/90 dark:bg-[#1e1e24]/90 backdrop-blur-md border border-gray-200 dark:border-[#272546] rounded-xl shadow-2xl p-4 z-20 hidden md:block">
                <h4 className="text-gray-500 dark:text-[#9794c7] text-xs font-bold uppercase mb-3">Legend</h4>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-rose-500 dark:bg-[#FF3B30]"></div>
                        <span className="text-xs text-slate-900 dark:text-white">Head</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-emerald-500 dark:bg-[#00E096]"></div>
                        <span className="text-xs text-slate-900 dark:text-white">Tail</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-primary"></div>
                        <span className="text-xs text-slate-900 dark:text-white">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded border border-dashed border-gray-400 dark:border-[#9794c7]"></div>
                        <span className="text-xs text-slate-900 dark:text-white">Null</span>
                    </div>
                </div>
            </div>

            <style>{`
                .arrow-path {
                    stroke-dasharray: 10;
                    animation: dash 30s linear infinite;
                }
                @keyframes dash {
                    to {
                        stroke-dashoffset: -100;
                    }
                }
            `}</style>
        </VisualizationLayout>
    )
}

export default LinkedList
