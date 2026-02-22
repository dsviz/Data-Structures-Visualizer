import React, { useState, useEffect } from 'react';

const MobileWarning: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Detect mobile screen width (typically < 768px for tablets/phones)
        const checkMobile = () => {
            const isMobile = window.innerWidth < 1024; // Using 1024 to cover smaller laptops/tablets as well
            const hasDismissed = sessionStorage.getItem('mobileWarningDismissed');

            if (isMobile && !hasDismissed) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('mobileWarningDismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white dark:bg-[#1e1c33] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#272546] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                <div className="p-8 text-center">
                    {/* Icon Header */}
                    <div className="inline-flex size-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center mb-6 animate-bounce">
                        <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-4xl">desktop_windows</span>
                    </div>

                    <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                        Desktop Recommended
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 px-2">
                        This interactive visualizer is highly detailed and optimized for **Desktop View**. For the best learning experience, please switch to a larger screen.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={handleDismiss}
                            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            Continue Anyway
                        </button>

                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pt-2">
                            Standard Web Version 1.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileWarning;
