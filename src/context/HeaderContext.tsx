import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderContextType {
    headerContent: ReactNode | null;
    setHeaderContent: (content: ReactNode | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [headerContent, setHeaderContent] = useState<ReactNode | null>(null);

    return (
        <HeaderContext.Provider value={{ headerContent, setHeaderContent }}>
            {children}
        </HeaderContext.Provider>
    );
};

export const useHeader = () => {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error('useHeader must be used within a HeaderProvider');
    }
    return context;
};
