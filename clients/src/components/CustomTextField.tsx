import React, { useState } from "react";
import clsx from "clsx";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name:string;
    value?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
    helperText?: string;
}

const CustomTextField: React.FC<Props> = ({
    label,
    name,
    value = "",
    onChange,
    type = "text",
    error = false,
    helperText,
    disabled = false,
    ...rest
}) => {
    const [focused, setFocused] = useState(false);

    const hasValue = value && value.length > 0;

    return (
        <div className="relative w-full font-battle">
            {/* Input */}
            <input
                {...rest}
                id={name}
                type={type}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                disabled={disabled}
                className={clsx(
                    "peer w-full rounded-md border bg-bg px-3 pt-5 pb-2 text-text outline-none transition-all duration-200",
                    "border-border focus:border-accent",
                    disabled && "opacity-60 cursor-not-allowed",
                    error && "border-red-500 focus:border-red-500"
                )}
            />

            {/* Floating Label */}
            <label
                htmlFor={label}
                className={clsx(
                    "absolute left-3 transform -translate-y-1/2 text-sm text-text transition-all duration-200 pointer-events-none",
                    "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:-translate-y-1/2",
                    (focused || hasValue) ?
                    "top-3 text-xs text-accent -translate-y-0" : "top-1/2"
                )}
            >
                {label}
            </label>

            {/* Helper text */}
            {helperText && (
                <p
                    className={clsx(
                        "mt-1 text-xs absolute bottom-0 left-2 translate-y-full",
                        error ? "text-red-500" : "text-gray-400"
                    )}
                >
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default CustomTextField;
