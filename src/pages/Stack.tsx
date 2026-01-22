import React, { useState } from 'react';
import VisualizationLayout from '../components/layout/VisualizationLayout';

const Stack = () => {
    // --- State ---
    const [stack, setStack] = useState<number[]>([15, 8, 23]);
    const [inputValue, setInputValue] = useState<string>('42');
    const [message, setMessage] = useState<string>('Idle');
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

    // --- Handlers ---
    const handlePush = () => {
        const val = parseInt(inputValue);
        if (isNaN(val)) return;

        if (stack.length >= 7) {
            setMessage('Stack Overflow! Cannot push more items.');
            return;
        }

        setMessage(`Pushing ${val}...`);
        setStack(prev => [...prev, val]);
        setInputValue('');

        // Reset message after animation
        setTimeout(() => setMessage('Idle'), 1000);
    };

    const handlePop = () => {
        if (stack.length === 0) {
            setMessage('Stack Underflow! Stack is empty.');
            return;
        }

        const poppedVal = stack[stack.length - 1];
        setMessage(`Popping ${poppedVal}...`);

        setStack(prev => prev.slice(0, -1));

        setTimeout(() => setMessage('Idle'), 1000);
    };

    const handlePeek = () => {
        if (stack.length === 0) {
            setMessage('Stack is empty.');
            return;
        }

        const topIndex = stack.length - 1;
        setMessage(`Peeking at top element: ${stack[topIndex]}`);
        setHighlightIndex(topIndex);

        setTimeout(() => {
            setHighlightIndex(null);
            setMessage('Idle');
        }, 1500);
    };

    // --- Renderers ---

    const sidebar = (
        <div className="flex flex-col gap-6">
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stack Operations</h3>

                {/* Push Control */}
                <div className="bg-white dark:bg-[#1e1c33] p-4 rounded-xl border border-indigo-100 dark:border-[#323055] shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
                        <span className="material-symbols-outlined">arrow_forward</span>
                        <span className="font-bold">Push (v)</span>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">VALUE (v)</label>
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#131221] border border-gray-200 dark:border-[#323055] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono text-sm"
                                placeholder="Enter value"
                                onKeyDown={(e) => e.key === 'Enter' && handlePush()}
                            />
                        </div>
                        <button
                            onClick={handlePush}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                        >
                            Execute Push
                        </button>
                    </div>
                </div>

                {/* Other Controls */}
                <div className="space-y-2">
                    <button
                        onClick={handlePop}
                        className="w-full p-4 flex items-center gap-3 bg-white dark:bg-[#1e1c33] border border-transparent hover:border-red-200 dark:hover:border-red-900/50 rounded-xl text-left transition-all active:scale-95 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-lg">remove</span>
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Pop</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Remove top element</div>
                        </div>
                    </button>

                    <button
                        onClick={handlePeek}
                        className="w-full p-4 flex items-center gap-3 bg-white dark:bg-[#1e1c33] border border-transparent hover:border-amber-200 dark:hover:border-amber-900/50 rounded-xl text-left transition-all active:scale-95 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Peek</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">View top element</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <VisualizationLayout
            title="Stack & Queue"
            sidebar={sidebar}
            sidebarPosition="left"
        >
            <div className="flex flex-col w-full h-full">
                {/* Top Info Bar */}
                <div className="flex justify-center items-center gap-8 mb-12 text-sm font-mono text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <span className="uppercase tracking-wider text-xs">STACK</span>
                        <div className="px-3 py-1 bg-white dark:bg-[#1e1c33] rounded border border-gray-200 dark:border-[#323055]">
                            Top Index: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{stack.length > 0 ? stack.length - 1 : -1}</span>
                        </div>
                    </div>

                    {/* Placeholder for Queue info if needed later */}
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

                    <div className="flex items-center gap-2">
                        <span>current_op:</span>
                        <span className={`px-2 py-0.5 rounded ${message === 'Idle' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                            {message}
                        </span>
                    </div>
                </div>

                {/* Visualization Area */}
                <div className="flex-1 flex items-center justify-center relative">
                    {/* Vertical Stack Container */}
                    <div className="flex flex-col items-center">
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-[0.2em] mb-4 text-center">VERTICAL STACK</h3>

                        <div className="relative w-48 min-h-[400px] bg-gray-100/50 dark:bg-[#1c1a32]/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#323055] p-4 flex flex-col-reverse justify-start items-center gap-3 transition-all">
                            {stack.map((val, idx) => {
                                const isTop = idx === stack.length - 1;
                                const isHighlighted = highlightIndex === idx;

                                return (
                                    <div
                                        key={idx}
                                        className={`
                                            relative w-full h-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm border-2 transition-all duration-300
                                            ${!isTop ? 'dark:bg-[#272546] dark:text-white dark:border-[#323055] bg-white text-gray-800 border-gray-100' : 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/30'}
                                            ${isHighlighted ? 'scale-110 ring-4 ring-amber-400' : ''}
                                        `}
                                    >
                                        {val}

                                        {/* Top Pointer */}
                                        {isTop && (
                                            <div className="absolute -right-16 flex items-center gap-2 animate-bounce">
                                                <span className="material-symbols-outlined text-indigo-500 rotate-180">arrow_right_alt</span>
                                                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">TOP</span>
                                            </div>
                                        )}

                                        {/* Index Label */}
                                        <div className="absolute -left-8 text-xs font-mono text-gray-400">
                                            {idx}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty State */}
                            {stack.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm italic">
                                    Stack is empty
                                </div>
                            )}
                        </div>

                        {/* Base of container visual */}
                        <div className="w-56 h-4 bg-gray-200 dark:bg-[#272546] rounded-full mt-2 mx-auto"></div>
                    </div>
                </div>
            </div>
        </VisualizationLayout>
    );
};

export default Stack;
