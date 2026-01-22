import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        <LayoutContext.Provider value={{ isSidebarOpen, toggleSidebar, setIsSidebarOpen }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
