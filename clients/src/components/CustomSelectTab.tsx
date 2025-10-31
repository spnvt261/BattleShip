import { useState, useRef, useEffect } from "react";

interface SelectTabProps<T> {
    label?: string
    options: T[];
    value: T;
    onChange: (val: T) => void;
    renderLabel: (val: T) => string | React.ReactNode;
    className?:string
}

export function CustomSelectTab<T extends string | number>({
    options,
    value,
    onChange,
    renderLabel,
    label,
    className
}: SelectTabProps<T>) {
    const [highlightStyle, setHighlightStyle] = useState<{ left: number; width: number }>({
        left: 0,
        width: 0,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const index = options.findIndex((o) => o === value);
        const el = optionRefs.current[index];
        if (el && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const rect = el.getBoundingClientRect();
            setHighlightStyle({ left: rect.left - containerRect.left - 1, width: rect.width });
        }
    }, [value, options]);

    return (
        <div className={className}>
            {label &&
                <p className="text-text">
                    {label}
                </p>
            }
            <div
                ref={containerRef}
                className="relative flex border border-border rounded-lg overflow-hidden bg-panel text-text"
            >
                {/* Highlight div */}
                <div
                    className="absolute top-0 bottom-0 bg-accent transition-all duration-300"
                    style={{
                        left: highlightStyle.left,
                        width: highlightStyle.width,
                    }}
                />

                {/* Options */}
                {options.map((opt, idx) => (
                    <div
                        key={idx}
                        ref={(el) => { optionRefs.current[idx] = el; }}
                        className={`relative z-10 flex-1 cursor-pointer px-4 py-2 text-center select-none transition-colors duration-300 ${opt === value ? "text-white" : "text-text"
                            }`}
                        onClick={() => onChange(opt)}

                    >
                        {renderLabel(opt)}
                    </div>
                ))}
            </div>
        </div>

    );
}
