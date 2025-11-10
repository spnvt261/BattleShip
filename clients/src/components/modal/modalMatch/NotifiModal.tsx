import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
    showIf: boolean | number | string | undefined;
    children?: ReactNode;
    msShow?: number;
    msDelay?: number;
    color: 'red' | 'blue';
    title?: string
}

const NotifyModal = ({
    showIf, children,
    msShow = 1000, msDelay = 0,
    color, title
}: Props) => {
    const isFirstRender = useRef(true);
    const [show, setShow] = useState<boolean>(false)
    useEffect(() => {
        if (msShow === 0 && showIf===true) {
            setShow(true)
            return
        }
        let delay = msDelay
        if (isFirstRender.current) {
            delay = 0
            isFirstRender.current = false
        }
        const delayShow = setTimeout(() => {
            setShow(true);
        }, delay)
        const timeHide = setTimeout(() => {
            setShow(false)
        }, msShow + delay)
        return () => {
            clearTimeout(delayShow)
            clearTimeout(timeHide)
        }
    }, [showIf])
    return (
        <>
            {
                show && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" >
                    <div className="relative w-[90%] max-w-md">
                        <div
                            className="absolute -inset-[2px] bg-transparent pointer-events-none"
                            style={{
                                clipPath: "polygon(21px 0%, 100% 0%, 100% 42.8px, 100% calc(100% - 21px), calc(100% - 21px) 100%, 0% 100%, 0% calc(100% - 21px), 0% 21px)",
                                background: color === 'blue' ? 'var(--color-accent)' : 'red',
                            }}
                        />
                        <div
                            className={`relative shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-6 bg-panel`}
                            style={{
                                clipPath: "polygon(20px 0%, 100% 0%, 100% 40px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% calc(100% - 20px), 0% 20px)",
                            }}
                        >
                            {
                                children?<>{children}</> :<h2 className="text-xl font-bold mb-4 pr-8">{title}</h2>
                            }
                            
                        </div>
                    </div>
                </div>
            }

        </>
    )
}

export default NotifyModal