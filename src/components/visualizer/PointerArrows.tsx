import { useEffect, useState } from 'react';
import { Variable } from '../../utils/MemoryEngine';

interface PointerArrowsProps {
    variables: Variable[];
    elementRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
    containerRef: React.RefObject<HTMLDivElement>;
}

interface Arrow {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const PointerArrows = ({ variables, elementRefs, containerRef }: PointerArrowsProps) => {
    const [arrows, setArrows] = useState<Arrow[]>([]);

    const calculateArrows = () => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newArrows: Arrow[] = [];

        variables.forEach(variable => {
            if (variable.isPointer && variable.targetAddress) {
                // Find the element representing this pointer
                const startEl = elementRefs.current.get(variable.id);

                // Find the target element (the variable whose address matches targetAddress)
                // We need to look through all variables to find the one with this address
                const targetVar = variables.find(v => v.address === variable.targetAddress);
                if (!targetVar) return; // Target not in visual scope

                const endEl = elementRefs.current.get(targetVar.id);

                if (startEl && endEl) {
                    const startRect = startEl.getBoundingClientRect();
                    const endRect = endEl.getBoundingClientRect();

                    // Calculate relative coordinates within the container
                    newArrows.push({
                        id: `arrow-${variable.id}`,
                        x1: startRect.left + startRect.width / 2 - containerRect.left,
                        y1: startRect.bottom - containerRect.top, // Start from bottom of pointer box
                        x2: endRect.left + endRect.width / 2 - containerRect.left,
                        y2: endRect.top - containerRect.top, // End at top of target box
                    });
                }
            }
        });

        setArrows(newArrows);
    };

    useEffect(() => {
        // Initial calculation
        calculateArrows();

        // Recalculate on resize and scroll
        window.addEventListener('resize', calculateArrows);
        // Observe DOM mutations or just re-run periodically if needed (simplified here)
        const timeout = setTimeout(calculateArrows, 100); // Slight delay for layout 

        return () => {
            window.removeEventListener('resize', calculateArrows);
            clearTimeout(timeout);
        };
    }, [variables]); // Re-run when variables change (step execution)

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" />
                </marker>
            </defs>
            {arrows.map(arrow => (
                <path
                    key={arrow.id}
                    d={`M ${arrow.x1} ${arrow.y1} C ${arrow.x1} ${arrow.y1 + 20}, ${arrow.x2} ${arrow.y2 - 20}, ${arrow.x2} ${arrow.y2}`}
                    stroke="#a855f7"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-draw-line"
                />
            ))}
        </svg>
    );
};

export default PointerArrows;
