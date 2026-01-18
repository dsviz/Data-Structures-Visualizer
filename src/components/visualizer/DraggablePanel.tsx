import React, { useRef } from 'react';
import Draggable from 'react-draggable';

interface DraggablePanelProps {
    children: React.ReactNode;
    defaultPosition?: { x: number; y: number };
    className?: string;
    title?: string;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({ children, defaultPosition = { x: 0, y: 0 }, className = '', title }) => {
    const nodeRef = useRef(null);

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultPosition={defaultPosition}
            handle=".drag-handle"
            bounds="parent"
        >
            <div
                ref={nodeRef}
                className={`absolute z-40 bg-white dark:bg-[#1e1d32] rounded-xl shadow-2xl border border-gray-200 dark:border-[#383564] overflow-hidden ${className}`}
            >
                {/* Header / Drag Handle */}
                <div className="drag-handle cursor-move bg-gray-50 dark:bg-[#2d2b42] px-4 py-2 border-b border-gray-100 dark:border-[#383564] flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-sm">drag_indicator</span>
                        {title && <span className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">{title}</span>}
                    </div>
                </div>

                {/* Content */}
                <div>
                    {children}
                </div>
            </div>
        </Draggable>
    );
};

export default DraggablePanel;
