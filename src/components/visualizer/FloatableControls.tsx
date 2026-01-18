import React from 'react';

interface FloatableControlsProps {
    onNext: () => void;
    onPrev: () => void;
    onReset: () => void;
    onPlayPause: () => void;
    isPlaying: boolean;
    currentStep: number;
    totalSteps: number;
    speed: number;
    setSpeed: (s: number) => void;
}

const FloatableControls: React.FC<FloatableControlsProps> = ({
    onNext, onPrev, onReset, onPlayPause, isPlaying, currentStep, totalSteps, speed, setSpeed
}) => {
    return (
        <div className="p-4 flex flex-col gap-3 min-w-[280px]">
            {/* Main Transport */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onReset}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#383564] rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
                    title="Reset"
                >
                    <span className="material-symbols-outlined">restart_alt</span>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrev}
                        disabled={currentStep <= 0}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#383564] rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-30 transition-colors"
                    >
                        <span className="material-symbols-outlined">skip_previous</span>
                    </button>

                    <button
                        onClick={onPlayPause}
                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined fill-current text-xl">
                            {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                    </button>

                    <button
                        onClick={onNext}
                        disabled={currentStep >= totalSteps - 1}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#383564] rounded-lg text-gray-700 dark:text-gray-200 disabled:opacity-30 transition-colors"
                    >
                        <span className="material-symbols-outlined">skip_next</span>
                    </button>
                </div>
            </div>

            {/* Slider / Progress */}
            <div className="w-full bg-gray-200 dark:bg-[#2d2b42] h-1.5 rounded-full overflow-hidden">
                <div
                    className="bg-indigo-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0}%` }}
                ></div>
            </div>

            {/* Meta */}
            <div className="flex justify-between items-end text-xs font-mono">
                <div className="flex flex-col">
                    <span className="text-gray-400 font-bold uppercase text-[9px]">Step</span>
                    <span className="font-bold text-gray-800 dark:text-white">
                        {currentStep + 1} <span className="text-gray-400">/</span> {totalSteps || 1}
                    </span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-gray-400 font-bold uppercase text-[9px]">Speed</span>
                    <select
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="bg-transparent text-right font-bold text-gray-800 dark:text-white focus:outline-none cursor-pointer"
                    >
                        <option value={2000}>0.5x</option>
                        <option value={1000}>1.0x</option>
                        <option value={500}>2.0x</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FloatableControls;
