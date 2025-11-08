import { cloneElement, useState, type ReactElement, type ReactNode } from "react";
import CustomButton from "../customButton";
import { AiOutlineClose } from "react-icons/ai";

interface Props {
    btnLabel: string;
    formTitle: string;
    children?: React.ReactNode; // Nội dung form tùy chỉnh
    showIconClose?: boolean;
    Icon?: ReactNode;
    classNameBtn?: string;
    btnWidth?: string;
}

const ModalToggle: React.FC<Props> = ({ btnLabel, formTitle, children, showIconClose, Icon, classNameBtn, btnWidth = "100%" }) => {
    const [showModal, setShowModal] = useState(false);
    const renderChildren = () => {
        if (!children) return null;
        if (typeof children === "object" && "props" in children) {
            return cloneElement(children as ReactElement<any>, { onClose: () => setShowModal(false) });
        }
        if (Array.isArray(children)) {
            return children.map((child, idx) => {
                if (typeof child === "object" && "props" in child) {
                    return cloneElement(child as ReactElement<any>, { key: idx, onClose: () => setShowModal(false) });
                }
                return child;
            });
        }
        return children;
    };
    return (
        <div className="relative">
            <div className="w-[200px]">
                <CustomButton
                    label={btnLabel}
                    onClick={() => setShowModal(true)}
                    width={btnWidth}
                    className={`my-1 ${classNameBtn}`}
                    Icon={Icon}
                />
            </div>
            {showModal && (
                <>
                    <div
                        className="fixed inset-0 backdrop-blur-sm z-40 bg-black/10"
                        onClick={() => setShowModal(false)}
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-[90%] max-w-md">
                            <div
                                className="absolute -inset-[2px] bg-transparent pointer-events-none"
                                style={{
                                    clipPath: "polygon(21px 0%, 100% 0%, 100% 42.8px, 100% calc(100% - 21px), calc(100% - 21px) 100%, 0% 100%, 0% calc(100% - 21px), 0% 21px)",
                                    background: "var(--color-border)",
                                }}
                            />

                            <div
                                className="relative bg-panel shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-6"
                                style={{
                                    clipPath: "polygon(20px 0%, 100% 0%, 100% 40px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% calc(100% - 20px), 0% 20px)",
                                }}
                            >
                                {showIconClose &&
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="absolute top-3 right-3 text-text rounded-[.75rem] p-1 hover:bg-btn-hover z-10"
                                    >
                                        <AiOutlineClose size={24} />
                                    </button>
                                }


                                <h2 className="text-xl font-bold mb-4 pr-8">{formTitle}</h2>

                                <div className="mt-2">{renderChildren()}</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ModalToggle;
