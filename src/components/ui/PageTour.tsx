import React, { useCallback, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TourStep {
    /** Value of the `data-tour` attribute on the target element */
    target: string;
    title: string;
    body: string;
    /** Which side of the element to show the tooltip on */
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface Rect {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

interface PageTourProps {
    /** Array of steps for this page */
    steps: TourStep[];
    /**
     * Unique key stored in localStorage so the tour only auto-shows once.
     * Set to the same value to skip a specific page's tour e.g. "tour_arrays_v1"
     */
    tourKey: string;
}

const PAD = 8; // px spotlight padding around target element
const TOOLTIP_W = 280; // tooltip max-width in px

// ─── Component ────────────────────────────────────────────────────────────────

const PageTour: React.FC<PageTourProps> = ({ steps, tourKey }) => {
    const [active, setActive] = useState(false);
    const [stepIdx, setStepIdx] = useState(0);
    const [rect, setRect] = useState<Rect | null>(null);
    const [leaving, setLeaving] = useState(false);
    const rafRef = useRef<number | null>(null);

    // Resolve the DOM rect for the current step's target
    const resolveRect = useCallback((step: TourStep) => {
        const el = document.querySelector(`[data-tour="${step.target}"]`);
        if (!el) { setRect(null); return; }
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height });
    }, []);

    // Keep rect in sync while tour is open (handles panel animations)
    useEffect(() => {
        if (!active) return;
        const tick = () => {
            resolveRect(steps[stepIdx]);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [active, stepIdx, steps, resolveRect]);

    // Auto-show on first visit
    useEffect(() => {
        let done = null;
        try {
            done = localStorage.getItem(tourKey);
        } catch (error) {
            console.warn('Failed to read page tour state from storage:', error);
        }

        if (!done) {
            const t = setTimeout(() => {
                setStepIdx(0);
                setActive(true);
            }, 800);
            return () => clearTimeout(t);
        }
    }, [tourKey]);

    const dismiss = useCallback(() => {
        setLeaving(true);
        setTimeout(() => {
            try {
                localStorage.setItem(tourKey, '1');
            } catch (error) {
                console.warn('Failed to persist page tour state:', error);
            }
            setActive(false);
            setLeaving(false);
        }, 250);
    }, [tourKey]);

    const next = () => {
        if (stepIdx < steps.length - 1) {
            setStepIdx(s => s + 1);
        } else {
            dismiss();
        }
    };

    const prev = () => { if (stepIdx > 0) setStepIdx(s => s - 1); };

    // Re-launch tour (shown even after tour is done)
    const relaunch = () => {
        setStepIdx(0);
        setLeaving(false);
        setActive(true);
    };

    // ── Tooltip positioning ──────────────────────────────────────────────────

    const getTooltipStyle = (): React.CSSProperties => {
        if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const step = steps[stepIdx];
        const pos = step.position ?? autoPosition(rect);
        const mid = { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
        const GAP = 16;

        switch (pos) {
            case 'bottom':
                return {
                    top: rect.bottom + PAD + GAP,
                    left: Math.max(8, Math.min(window.innerWidth - TOOLTIP_W - 8, mid.x - TOOLTIP_W / 2)),
                    width: TOOLTIP_W,
                };
            case 'top':
                return {
                    bottom: window.innerHeight - rect.top + PAD + GAP,
                    left: Math.max(8, Math.min(window.innerWidth - TOOLTIP_W - 8, mid.x - TOOLTIP_W / 2)),
                    width: TOOLTIP_W,
                };
            case 'right':
                return {
                    top: Math.max(8, mid.y - 80),
                    left: rect.right + PAD + GAP,
                    width: TOOLTIP_W,
                };
            case 'left':
                return {
                    top: Math.max(8, mid.y - 80),
                    right: window.innerWidth - rect.left + PAD + GAP,
                    width: TOOLTIP_W,
                };
        }
    };

    const currentStep = steps[stepIdx];
    const isLast = stepIdx === steps.length - 1;

    // Spotlight rects
    const s = rect
        ? { top: rect.top - PAD, left: rect.left - PAD, bottom: rect.bottom + PAD, right: rect.right + PAD }
        : null;

    return (
        <>
            {/* ── Re-launch button (always visible, bottom-right corner) ── */}
            {!active && (
                <button
                    onClick={relaunch}
                    title="Start page tour"
                    className="fixed bottom-20 right-4 z-40 w-9 h-9 rounded-full bg-primary/90 hover:bg-primary text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">help</span>
                </button>
            )}

            {/* ── Tour overlay ── */}
            {active && (
                <div
                    className={`fixed inset-0 z-[300] transition-opacity duration-250 ${leaving ? 'opacity-0' : 'opacity-100'}`}
                    style={{ pointerEvents: 'all' }}
                >
                    {/* Spotlight mask — 4 semi-transparent rects */}
                    {s ? (
                        <>
                            {/* Top */}
                            <div className="absolute bg-black/60" style={{ top: 0, left: 0, right: 0, height: Math.max(0, s.top) }} />
                            {/* Bottom */}
                            <div className="absolute bg-black/60" style={{ top: Math.max(0, s.bottom), left: 0, right: 0, bottom: 0 }} />
                            {/* Left */}
                            <div className="absolute bg-black/60" style={{ top: Math.max(0, s.top), left: 0, width: Math.max(0, s.left), height: Math.max(0, s.bottom - s.top) }} />
                            {/* Right */}
                            <div className="absolute bg-black/60" style={{ top: Math.max(0, s.top), left: Math.max(0, s.right), right: 0, height: Math.max(0, s.bottom - s.top) }} />
                            {/* Glowing border around spotlight */}
                            <div
                                className="absolute rounded-lg pointer-events-none"
                                style={{
                                    top: s.top, left: s.left,
                                    width: s.right - s.left, height: s.bottom - s.top,
                                    boxShadow: '0 0 0 3px rgb(66 54 231), 0 0 20px 4px rgba(66,54,231,0.4)',
                                }}
                            />
                        </>
                    ) : (
                        /* Fallback: full dark overlay when element not found */
                        <div className="absolute inset-0 bg-black/60" />
                    )}

                    {/* ── Tooltip ── */}
                    <div
                        className="absolute bg-white dark:bg-[#1c1a32] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
                        style={{ ...getTooltipStyle(), pointerEvents: 'all' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top gradient bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-primary to-violet-400" />

                        <div className="p-4 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                                        {stepIdx + 1} / {steps.length}
                                    </p>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                                        {currentStep.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={dismiss}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0 mt-0.5"
                                    title="Close tour"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {currentStep.body}
                            </p>

                            {/* Step dots */}
                            <div className="flex gap-1 justify-center py-0.5">
                                {steps.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setStepIdx(i)}
                                        className={`h-1 rounded-full transition-all duration-300 ${i === stepIdx ? 'w-5 bg-primary' : 'w-1.5 bg-gray-200 dark:bg-white/20'}`}
                                        aria-label={`Step ${i + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 pt-0.5">
                                {stepIdx > 0 && (
                                    <button
                                        onClick={prev}
                                        className="flex-1 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={next}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 transition-colors"
                                >
                                    {isLast ? "Done!" : "Next →"}
                                </button>
                            </div>

                            {!isLast && (
                                <button
                                    onClick={dismiss}
                                    className="block w-full text-center text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    Skip tour
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PageTour;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function autoPosition(rect: Rect): 'top' | 'bottom' | 'left' | 'right' {
    const cy = (rect.top + rect.bottom) / 2;
    const cx = (rect.left + rect.right) / 2;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // If element is in the right half AND there's a lot of space on the left → left
    if (cx > vw * 0.6 && rect.left > TOOLTIP_W + 40) return 'left';
    // If element is in the left half → right
    if (cx < vw * 0.4 && vw - rect.right > TOOLTIP_W + 40) return 'right';
    // Vertical: prefer below if in top half
    return cy < vh * 0.5 ? 'bottom' : 'top';
}

// ─── Shared dock-page steps ────────────────────────────────────────────────────

export const DOCK_TOUR_STEPS = (dsName: string): TourStep[] => [
    {
        target: 'dock-ops',
        title: 'Operations Panel',
        body: `Pick a ${dsName} algorithm, configure its inputs, and press Run. This is your control panel for everything the visualizer can do.`,
        position: 'right',
    },
    {
        target: 'dock-toolbox',
        title: 'Canvas Toolbox',
        body: `Directly edit the ${dsName} on-canvas: add new elements, update values, or delete nodes without running a formal algorithm.`,
        position: 'right',
    },
    {
        target: 'dock-code',
        title: 'Code & Pseudocode',
        body: 'Follow the algorithm step by step in real code. Switch between Pseudocode, multi-language Source, and the Complexity Info tab.',
        position: 'left',
    },
    {
        target: 'dock-currentop',
        title: 'Current Step Info',
        body: 'A plain-English description of exactly what is happening at each animation frame — great for understanding the "why".',
        position: 'left',
    },
    {
        target: 'dock-playbar',
        title: 'Playback Controls',
        body: 'Play, pause, step forward/backward, scrub to any frame, and dial the speed from 0.5× to 3× — all without restarting.',
        position: 'top',
    },
];
