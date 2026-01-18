import React from 'react';
import { HeapBlock } from '../../utils/MemoryEngine';

interface TreeStructureProps {
    rootAddress: string | null;
    heap: HeapBlock[];
    name?: string;
}

const TreeNode: React.FC<{ address: string; heap: HeapBlock[]; level: number }> = ({ address, heap, level }) => {
    const node = heap.find(h => h.address === address);
    if (!node) return null;

    return (
        <div className="flex flex-col items-center">
            {/* The Node */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md z-10 my-2`}>
                <span className="font-bold text-indigo-700 dark:text-indigo-300 font-mono">{node.fields?.val ?? '?'}</span>
            </div>
            {/* Children container */}
            <div className="flex items-start gap-4 mt-2 relative">
                {/* Connector Lines (Rough CSS approximation) */}
                {(node.fields?.left || node.fields?.right) && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-4 border-t-2 border-gray-300 dark:border-gray-600"></div>
                )}

                {/* Left Child */}
                <div className="flex flex-col items-center">
                    {node.fields?.left ? <TreeNode address={node.fields.left} heap={heap} level={level + 1} /> : <div className="w-8"></div>}
                </div>
                {/* Right Child */}
                <div className="flex flex-col items-center">
                    {node.fields?.right ? <TreeNode address={node.fields.right} heap={heap} level={level + 1} /> : <div className="w-8"></div>}
                </div>
            </div>
        </div>
    );
};

const TreeStructure: React.FC<TreeStructureProps> = ({ rootAddress, heap, name }) => {
    if (!rootAddress) return <div className="text-gray-400 italic">Empty Tree</div>;

    return (
        <div className="flex flex-col gap-2 min-w-[200px]">
            {name && <div className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{name} (Binary Tree)</div>}
            <div className="p-6 bg-white/50 dark:bg-[#1e1d32]/50 rounded-xl border border-dashed border-gray-300 dark:border-[#383564] flex justify-center overflow-auto">
                <TreeNode address={rootAddress} heap={heap} level={0} />
            </div>
        </div>
    );
};

export default TreeStructure;
