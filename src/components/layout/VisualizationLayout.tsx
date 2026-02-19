import React from 'react';
import { Link } from 'react-router-dom';
import { useLayout } from '../../context/LayoutContext';

interface VisualizationLayoutProps {
    title: string;
    sidebar?: React.ReactNode;          // Retro-compatible: treated as "Left" if position not set
    leftSidebar?: React.ReactNode;      // Explicit Left
    rightSidebar?: React.ReactNode;     // Explicit Right
    children: React.ReactNode;
    controls?: React.ReactNode;
    sidebarPosition?: 'left' | 'right'; // Deprecated-ish, but kept for logic
    rightSidebarWidth?: number | string;
    sidebarNoPadding?: boolean;
    sidebarNoScroll?: boolean;
}

const VisualizationLayout: React.FC<VisualizationLayoutProps & { contentClassName?: string }> = ({
    title,
    sidebar,
    leftSidebar,
    rightSidebar,
    children,
    controls,
    sidebarPosition = 'left',
    contentClassName,
    rightSidebarWidth,
    sidebarNoPadding = false,
    sidebarNoScroll = false
}) => {
    const { isSidebarOpen, setIsSidebarOpen } = useLayout();

    // Resolve Sidebars: 'sidebar' prop acts as Left if not specified otherwise, or follows sidebarPosition
    const actualLeftSidebar = leftSidebar || (sidebarPosition === 'left' ? sidebar : null);
    const actualRightSidebar = rightSidebar || (sidebarPosition === 'right' ? sidebar : null);

    const computeInitialWidth = React.useCallback(() => {
        if (typeof rightSidebarWidth === 'number') return rightSidebarWidth;
        if (typeof rightSidebarWidth === 'string') {
            const parsed = parseInt(rightSidebarWidth, 10);
            return Number.isNaN(parsed) ? 400 : parsed;
        }
        return 400;
    }, [rightSidebarWidth]);

    const [sidebarWidth, setSidebarWidth] = React.useState(computeInitialWidth);
    const [isResizing, setIsResizing] = React.useState(false);
    const sidebarRef = React.useRef<HTMLElement>(null);

    const startResizing = React.useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = document.body.clientWidth - mouseMoveEvent.clientX;
            if (newWidth > 200 && newWidth < 800) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    React.useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    React.useEffect(() => {
        setSidebarWidth(computeInitialWidth());
    }, [computeInitialWidth]);

    return (
        <div className={`flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
            {/* Header Removed as per user request (duplicate of global Navbar) */}

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar */}
                {actualLeftSidebar && (
                    <>
                        <aside className={`flex flex-col border-r border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1c1a32]/50 z-10 shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'} ${sidebarNoScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#272546] flex justify-between items-center shrink-0">
                                <div className="flex flex-wrap gap-2 items-center text-sm">
                                    <Link to="/" className="text-gray-500 dark:text-[#9794c7] hover:text-primary">Home</Link>
                                    <span className="text-gray-400 dark:text-[#5a5875]">/</span>
                                    <span className="text-gray-500 dark:text-[#9794c7] hover:text-primary cursor-pointer">{title}</span>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">first_page</span>
                                </button>
                            </div>
                            <div className={sidebarNoPadding ? "flex flex-col h-full w-80" : "p-4 flex flex-col gap-6 w-80"}>
                                {actualLeftSidebar}
                            </div>
                        </aside>
                        {/* Expand Button (when closed) */}
                        {!isSidebarOpen && (
                            <div className="absolute top-4 left-4 z-50">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1c1a32] border border-gray-200 dark:border-[#383564] shadow-lg text-primary hover:scale-105 transition-transform"
                                    title="Show Sidebar"
                                >
                                    <span className="material-symbols-outlined">last_page</span>
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Main Canvas */}
                <main className="flex-1 relative bg-gray-50 dark:bg-background-dark flex flex-col min-w-0">
                    <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#4236e7 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    </div>

                    {/* Content */}
                    <div className={contentClassName || "flex-1 flex flex-col items-center justify-center p-10 overflow-x-auto relative z-10"}>
                        {children}
                    </div>

                    {/* Bottom Controls */}
                    {controls}
                </main>

                {/* Right Sidebar */}
                {actualRightSidebar && (
                    <aside
                        ref={sidebarRef}
                        className="flex flex-col border-l border-gray-200 dark:border-[#272546] bg-white/90 dark:bg-[#1e1c33]/90 backdrop-blur-md z-10 shrink-0 overflow-y-auto shadow-xl transition-none relative group"
                        style={{ width: `${sidebarWidth}px` }}
                    >
                        {/* Drag Handle */}
                        <div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-transparent hover:bg-primary/50 cursor-col-resize z-50 transition-colors"
                            onMouseDown={startResizing}
                        />
                        {actualRightSidebar}
                    </aside>
                )}
            </div>
        </div>
    );
};

export default VisualizationLayout;
