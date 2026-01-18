import React from 'react';
import { HeapBlock } from '../../utils/MemoryEngine';

interface LinkedListStructureProps {
    headAddress: string;
    heap: HeapBlock[];
    name: string;
}

const LinkedListStructure: React.FC<LinkedListStructureProps> = ({ headAddress, heap, name }) => {
    // Traverse the list to gather nodes
    const nodes: HeapBlock[] = [];
    let currentAddr: string | null = headAddress;
    const visited = new Set<string>(); // Prevent cycles

    while (currentAddr && !visited.has(currentAddr)) {
        visited.add(currentAddr);
        const node = heap.find(h => h.address === currentAddr);
        if (!node) break;
        nodes.push(node);
        currentAddr = node.fields?.next || null;
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{name} (Linked List)</div>
            <div className="flex items-center gap-2 overflow-x-auto p-4 bg-white/50 dark:bg-[#1e1d32]/50 rounded-xl border border-dashed border-gray-300 dark:border-[#383564]">
                {nodes.map((node, index) => (
                    <div key={node.id} className="flex items-center">
                        {/* Node Box */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-12 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 rounded-lg shadow-sm">
                                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{node.fields?.val ?? '?'}</span>
                            </div>
                            <div className="text-[9px] text-gray-400 mt-1 font-mono">{node.address}</div>
                        </div>

                        {/* Arrow (if next exists) */}
                        {index < nodes.length - 1 && (
                            <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2 relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent border-l-gray-300 dark:border-l-gray-600"></div>
                            </div>
                        )}
                        {/* Null Pointer if end */}
                        {index === nodes.length - 1 && (
                            <>
                                <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2 relative"></div>
                                <div className="text-xs font-mono text-gray-400">NULL</div>
                            </>
                        )}
                    </div>
                ))}
                {nodes.length === 0 && <span className="text-sm text-gray-400 italic">NULL</span>}
            </div>
        </div>
    );
};

export default LinkedListStructure;
