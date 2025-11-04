import { useEffect, useState } from "react";

interface Props {
    name?: string;
    value?: string;
    error?: string | null;
    errorText?: string | null;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    handleConfirm?: () => void;
    className?:string
}

const CustomKeyField6 = ({
    name = "key",
    value: propsValue,
    error,
    errorText,
    onChange,
    onBlur,
    handleConfirm,
    disabled,
    className
}: Props) => {
    const [value, setValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setValue(propsValue || "");
    }, [propsValue]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && value.length === 6) {
            handleConfirm?.();
        }

        if (e.key === "Backspace") {
            const newValue = value.slice(0, -1);
            setValue(newValue);
            e.preventDefault();
            onChange?.({
                target: { name, value: newValue },
            } as React.ChangeEvent<HTMLInputElement>);
        }

        if (/^[0-9]$/.test(e.key) && value.length < 6) {
            const newValue = value + e.key;
            setValue(newValue);
            e.preventDefault();
            onChange?.({
                target: { name, value: newValue },
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const renderMask = () => {
        return Array.from({ length: 6 }, (_, i) => {
            const isEntered = i < value.length;
            const isNext = i === value.length && isFocused;

            return (
                <div key={i} className="flex flex-col items-center w-8 relative">
                    <span
                        className={`text-3xl font-mono ${isEntered ? "text-text" : "text-gray-400"
                            }`}
                    >
                        {isEntered ? value[i] : "x"}
                    </span>
                    <span
                        className={`block h-[3px] w-full rounded-full transition-all duration-150 ${error || errorText
                            ? "bg-red-400"
                            : isFocused && isNext
                                ? "bg-text animate-pulse"
                                : "bg-gray-400"
                            }`}
                    ></span>
                </div>
            );
        });
    };

    return (
        <div className={`relative w-fit ${className}`}>
            <div
                className={`flex gap-2 px-2 py-4 bg-transparent rounded-2xl border ${isFocused
                    ? error || errorText
                        ? "border-red-500 ring-2 ring-red-300"
                        : "border-0"
                    : error || errorText
                        ? "border-red-500"
                        : "border-0"
                    }`}
            >
                {renderMask()}
            </div>

            <input
                type="text"
                name={name}
                inputMode="numeric"
                value=""
                onChange={() => { }}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    setIsFocused(false);
                    onBlur?.(e);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={disabled}
            />

            {errorText && (
                <p className="text-sm text-red-500 mt-2 text-center">{errorText}</p>
            )}
        </div>
    );
};

export default CustomKeyField6;
