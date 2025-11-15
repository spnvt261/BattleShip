import { useState, useRef, useEffect } from "react";

interface SelectTabProps<T> {
    label?: string
    options: T[];
    value: T;
    onChange?: (val: T) => void;
    renderLabel: (val: T) => string | React.ReactNode;
    renderClassLabel?: (val: T) => string | React.ReactNode;
    className?:string
    isDisabled?: (val: T) => boolean;
}

export function CustomSelectTab<T extends string | number>({
    options,
    value,
    onChange,
    renderLabel, renderClassLabel,
    label,
    className,
    isDisabled
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
                {options.map((opt, idx) => { 
                    const disabled = isDisabled?.(opt) ?? false;
                    return(
                    <div
                        key={idx}
                        ref={(el) => { optionRefs.current[idx] = el; }}
                        className={`relative flex items-center justify-center z-10 flex-1 cursor-pointer px-4 py-2 text-center select-none transition-colors duration-300 ${opt === value ? "text-white" : "text-text"}
                            ${disabled?"bg-gray-400":""}
                        `}
                        onClick={() => onChange?.(opt)}

                    >
                        <span className={`max-w-[200px] truncate font-bold ${renderClassLabel?.(opt)}`}
                            style={{color:opt === value ? "#fff":disabled?"gray":""}}
                        >{renderLabel(opt)}-
                            <span style={{color:'red'}}>{disabled?"OUT":""}</span>
                        </span>
                        
                    </div>
                )})}
            </div>
        </div>

    );
}
