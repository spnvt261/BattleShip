import React, { useState } from "react";

interface WithLoadingProps {
    loadingText?: string;
}
const WithLoading = <P extends object>(
    WrappedComponent: React.ComponentType<P>
) => {
    const ComponentWithLoading: React.FC<P & WithLoadingProps> = ({
        loadingText,
        ...props
    }) => {
        const [isLoading, setIsLoading] = useState(false);
        const handleShowLoading = (bool:boolean) => {

            setIsLoading(bool)
        }

        return (
            <div className="relative">

                <div className={`${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
                    <WrappedComponent {...(props as P)} showLoading={handleShowLoading} />
                </div>
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-10 z-100">
                        <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600 font-medium">{loadingText || "Loading..."}</p>
                    </div>
                )}
            </div>
        );
    };
    return ComponentWithLoading;
};

export default WithLoading;