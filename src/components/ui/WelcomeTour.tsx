import React, { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'dsv_onboarded';

const STEPS = [
    {
        icon: 'grid_view',
        title: 'Pick a data structure',
        body: 'Choose from Arrays, Trees, Graphs, Sorting and more on the home screen. Each card shows the number of algorithms inside.',
        color: 'from-violet-500 to-indigo-500',
        iconBg: 'bg-violet-100 dark:bg-violet-900/40',
        iconColor: 'text-violet-600 dark:text-violet-300',
    },
    {
        icon: 'play_circle',
        title: 'Watch it animate',
        body: 'Press Play and watch the algorithm execute step by step. Use the speed slider to slow down or speed up at any time.',
        color: 'from-emerald-500 to-teal-500',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
        iconColor: 'text-emerald-600 dark:text-emerald-300',
    },
    {
        icon: 'code',
        title: 'Explore the Code panel',
        body: 'Open the top-right panel to see highlighted pseudocode and multi-language source code synced to every animation step.',
        color: 'from-rose-500 to-orange-500',
        iconBg: 'bg-rose-100 dark:bg-rose-900/40',
        iconColor: 'text-rose-600 dark:text-rose-300',
    },
];

const WelcomeTour: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const done = localStorage.getItem(STORAGE_KEY);
        if (!done) {
            // Short delay so the page renders first
            const t = setTimeout(() => setVisible(true), 600);
            return () => clearTimeout(t);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (dismissTimerRef.current) {
                clearTimeout(dismissTimerRef.current);
                dismissTimerRef.current = null;
            }
        };
    }, []);

    const dismiss = useCallback(() => {
        setLeaving(true);
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
        }
        dismissTimerRef.current = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, '1');
            setVisible(false);
            dismissTimerRef.current = null;
        }, 300);
    }, []);

    useEffect(() => {
        if (!visible) return;

        previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const modal = modalRef.current;
        const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

        const focusFirstElement = () => {
            if (!modal) return;
            const focusable = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));
            (focusable[0] || modal).focus();
        };

        focusFirstElement();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                dismiss();
                return;
            }

            if (event.key !== 'Tab' || !modal) return;

            const focusable = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));
            if (focusable.length === 0) {
                event.preventDefault();
                modal.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey && activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previousFocusRef.current?.focus();
        };
    }, [dismiss, visible]);

    const next = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            dismiss();
        }
    };

    const prev = () => {
        if (step > 0) setStep(s => s - 1);
    };

    if (!visible) return null;

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-300 ${leaving ? 'opacity-0' : 'opacity-100'}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={dismiss}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                className="relative bg-white dark:bg-[#151426] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 w-full max-w-sm overflow-hidden"
            >
                {/* Gradient top bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${current.color}`} />

                <div className="p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                                Step {step + 1} of {STEPS.length}
                            </p>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                {current.title}
                            </h2>
                        </div>
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${current.iconBg}`}>
                            <span className={`material-symbols-outlined text-[22px] ${current.iconColor}`}>
                                {current.icon}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {current.body}
                    </p>

                    {/* Step dots */}
                    <div className="flex gap-1.5 justify-center">
                        {STEPS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setStep(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-gray-200 dark:bg-white/20'}`}
                                aria-label={`Go to step ${i + 1}`}
                            />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                        {step > 0 && (
                            <button
                                onClick={prev}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={next}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${current.color} hover:opacity-90 transition-opacity shadow-lg`}
                        >
                            {isLast ? "Let's go!" : 'Next'}
                        </button>
                    </div>

                    <button
                        onClick={dismiss}
                        className="block w-full text-center text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        Skip tutorial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
