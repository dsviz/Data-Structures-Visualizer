import React from 'react';
import { Link } from 'react-router-dom';

interface VisualizationLayoutProps {
    title: string;
    sidebar: React.ReactNode;
    children: React.ReactNode;
    controls?: React.ReactNode;
    sidebarPosition?: 'left' | 'right';
}

const VisualizationLayout: React.FC<VisualizationLayoutProps> = ({
    title,
    sidebar,
    children,
    controls,
    sidebarPosition = 'left'
}) => {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
            {/* Header Removed as per user request (duplicate of global Navbar) */}

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar */}
                {sidebarPosition === 'left' && (
                    <aside className="w-80 flex flex-col border-r border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1c1a32]/50 z-10 shrink-0 overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#272546]">
                            <div className="flex flex-wrap gap-2 items-center text-sm">
                                <Link to="/" className="text-gray-500 dark:text-[#9794c7] hover:text-primary">Home</Link>
                                <span className="text-gray-400 dark:text-[#5a5875]">/</span>
                                <span className="text-gray-500 dark:text-[#9794c7] hover:text-primary cursor-pointer">{title}</span>
                                <span className="text-gray-400 dark:text-[#5a5875]">/</span>
                                <span className="text-slate-900 dark:text-white font-medium">Visualization</span>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col gap-6">
                            {sidebar}
                        </div>
                    </aside>
                )}

                {/* Main Canvas */}
                <main className="flex-1 relative bg-gray-50 dark:bg-background-dark flex flex-col min-w-0">
                    <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#4236e7 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col items-center justify-center p-10 overflow-x-auto relative z-10">
                        {children}
                    </div>

                    {/* Bottom Controls */}
                    {controls}
                </main>

                {/* Right Sidebar */}
                {sidebarPosition === 'right' && (
                    <aside className="w-[380px] flex flex-col border-l border-gray-200 dark:border-[#272546] bg-white dark:bg-[#1e1c33] z-10 shrink-0 overflow-y-auto shadow-2xl">
                        {/* We can re-use the breadcrumbs header or just have the content. 
                             The reference designs for Sorting/Trees usually have a specific header in the sidebar. 
                             So we'll just render the sidebar content directly. 
                         */}
                        {sidebar}
                    </aside>
                )}
            </div>
        </div>
    );
};

export default VisualizationLayout;
