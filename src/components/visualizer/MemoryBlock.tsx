
import React, { forwardRef } from 'react';
import { Variable } from '../../utils/MemoryEngine';

interface MemoryBlockProps {
    variable: Variable;
}

const MemoryBlock = forwardRef<HTMLDivElement, MemoryBlockProps>(({ variable }, ref) => {
    return (
        <div ref={ref} className="relative group transition-all duration-300 hover:-translate-y-1">
            {/* Variable Name Tag */}
            <div className="absolute -top-2.5 left-2 bg-white dark:bg-[#1e1d32] px-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#272546] rounded shadow-sm z-10">
                <span className="text-primary mr-1">{variable.type}</span>
                {variable.name}
            </div>

            {/* Main Memory Box */}
            <div className={`
        bg-white dark:bg-[#272546]/50 
        border-2 ${variable.isPointer ? 'border-purple-500/50 dark:border-purple-400/50' : 'border-gray-200 dark:border-[#323055]'} 
        rounded-lg p-3 pt-4 shadow-sm hover:shadow-md
        flex flex-col items-center justify-center min-w-[100px]
      `}>

                {/* Value Display */}
                <div className={`text-sm font-mono font-bold mb-1 ${variable.isPointer ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                    {variable.value}
                </div>

                {/* Address Label */}
                <div className="w-full border-t border-gray-100 dark:border-white/5 pt-1 mt-1">
                    <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono uppercase">
                        <span>{variable.address}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MemoryBlock;
