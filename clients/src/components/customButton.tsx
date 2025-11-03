import type { ReactNode } from "react";

interface Props {
    label: string;
    onClick?: () => void;
    padding?: string;
    className?: string
    width?: string
    disabled?: boolean
    Icon?: ReactNode;
}

const CustomButton = ({
    label,
    onClick,
    padding,
    className,
    width,
    disabled,
    Icon
}: Props) => {
    return (
        <button
            className={`px-3 py-2 rounded-[.5rem] bg-btn-bg text-btn-text hover:bg-btn-hover active:bg-btn-active shadow-[0_0_10px_var(--color-btn-shadow)] ${className} ${disabled ? "cursor-not-allowed bg-gray-500" : ""}`}
            onClick={onClick}
            style={{ padding, width }}
            disabled={disabled}
        >
            {label}
            {Icon && (
                <span className="icon">{Icon}</span>
            )}
        </button>
    )
}

export default CustomButton
