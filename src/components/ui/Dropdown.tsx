import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ value, options, onChange, placeholder = 'Select...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white dark:bg-[#121121] border border-gray-200 dark:border-[#272546] text-slate-700 dark:text-gray-300 text-sm rounded-lg pl-3 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-600 transition-colors shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 group"
            >
                <span className="truncate font-medium">{selectedOption ? selectedOption.label : placeholder}</span>
                <span className={`material-symbols-outlined text-gray-400 group-hover:text-indigo-500 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            <div className={`absolute z-50 w-full mt-1.5 bg-white dark:bg-[#1e1d32] border border-gray-200 dark:border-[#272546] rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-0.5">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all flex items-center justify-between ${option.value === value
                                    ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold'
                                    : 'text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#272546] hover:text-slate-900 dark:hover:text-white'
                                }`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            <span className="truncate">{option.label}</span>
                            {option.value === value && (
                                <span className="material-symbols-outlined text-[18px]">check</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
