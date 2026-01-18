interface ArrayPointer {
    label: string;
    index: number;
    color?: string;
}

import React from 'react';

interface ArrayStructureProps {
    data: (number | null)[];
    name?: string; // e.g. "arr"
    pointers?: ArrayPointer[];
}

const ArrayStructure: React.FC<ArrayStructureProps> = ({ data, name, pointers = [] }) => {
    // Mock base decimal address for visualization (to match image style: 200, 204, 208...)
    const baseVisualAddress = 200;

    return (
        <div className="relative pt-24 pb-12 px-8 inline-block select-none">

            <div className="flex items-start gap-0">
                {data.map((val, i) => (
                    <div key={i} className="flex flex-col items-center relative group">

                        {/* Pointers pointing to this index */}
                        {pointers.filter(p => p.index === i).map((p, idx) => (
                            <div
                                key={idx}
                                className="absolute bottom-[calc(100%+8px)] flex flex-col items-center z-20 transition-all duration-300 ease-out"
                                style={{ transform: `translateY(-${idx * 45}px)` }}
                            >
                                <div className="bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#383564] px-3 py-1.5 rounded shadow-[0_4px_12px_rgba(0,0,0,0.08)] min-w-[60px] text-center">
                                    <span className="font-bold text-gray-800 dark:text-gray-100 font-mono text-sm block">
                                        {p.label}
                                    </span>
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 tracking-wider mt-1 uppercase scale-75 origin-top">
                                    {p.label.replace('ptr_', '')} {/* Heuristic: try to derive a semantic label */}
                                </span>

                                {/* Styled Arrow */}
                                <svg width="24" height="40" viewBox="0 0 24 40" className="mt-1 text-indigo-500 drop-shadow-sm">
                                    <path d="M12 0 L12 36" stroke="currentColor" strokeWidth="2" fill="none" />
                                    <path d="M12 40 L4 28 L20 28 Z" fill="currentColor" />
                                </svg>
                            </div>
                        ))}

                        {/* Array Cell */}
                        <div
                            className={`
                                w-20 h-20 border-r border-t border-b border-gray-300 dark:border-[#383564] bg-white dark:bg-[#1e1d32]
                                flex flex-col items-center justify-between py-2
                                ${i === 0 ? 'border-l rounded-l-md' : ''}
                                ${i === data.length - 1 ? 'border-r rounded-r-md' : ''}
                                relative z-10
                            `}
                        >
                            <span className="text-sm font-semibold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-2 scale-75">
                                {/* Hex or extra info? */}
                            </span>

                            {/* Value */}
                            <div className={`text-2xl font-bold mt-2 ${val === null ? 'text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                {val ?? '?'}
                            </div>

                            {/* Address (Mocked visual style) */}
                            <div className="text-[10px] text-indigo-400 font-mono tracking-wide">
                                {baseVisualAddress + (i * 4)}
                            </div>
                        </div>

                        {/* Index */}
                        <div className="mt-2 font-mono text-xs text-indigo-800 dark:text-indigo-400 font-medium">
                            [{i}]
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ArrayStructure;
