import React, { useState, useEffect } from 'react';

const LandscapeEnforcer: React.FC = () => {
    const [isPortraitMobile, setIsPortraitMobile] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            // Check if it's a mobile-sized device AND in portrait orientation
            // We use window.innerWidth/Height to determining orientation dynamically
            const isMobileWidth = window.innerWidth < 768;
            const isPortrait = window.innerHeight > window.innerWidth;

            // Allow iPads/Tablets to use portrait if they want, but restrict phones.
            setIsPortraitMobile(isPortrait && isMobileWidth);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        // Also listen specifically to orientationchange for mobile devices
        window.addEventListener('orientationchange', () => {
            // Slight delay to let the browser update innerWidth/innerHeight
            setTimeout(checkOrientation, 100);
        });

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    if (!isPortraitMobile) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white dark:bg-[#1e1c33] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#272546] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                <div className="p-8 text-center flex flex-col items-center">
                    {/* Rotating Phone Animation */}
                    <div className="relative size-24 mb-6 perspective-1000">
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-pulse"></div>
                        <div className="w-full h-full flex items-center justify-center animate-[spin_3s_ease-in-out_infinite]">
                            <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-6xl rotate-90">
                                stay_current_landscape
                            </span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
                        Rotate Device
                    </h2>

                    <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        This interactive visualizer requires a wider screen. Please rotate your phone to
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold mx-1">landscape mode</span>
                        for the best experience.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LandscapeEnforcer;
