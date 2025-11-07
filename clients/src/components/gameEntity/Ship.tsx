import { useDraggable } from "@dnd-kit/core";
import React, { useEffect, useRef } from "react";

interface Props {
    id: string;
    positionFirstBlock: { x: number; y: number };
    size: number;
    gridSize: number;
    gridCount: number;
    image?: string;
    shipame: string;
    isVertical?: boolean
    onRotate?: (id: string) => void;
    small?: boolean;
    onlyView?: boolean;
    isSunk?: boolean;
    showOpacity?:boolean
}

const Ship = ({ 
    id, positionFirstBlock, isVertical, size, 
    gridSize, gridCount, image, shipame, onRotate, 
    small, onlyView, isSunk,showOpacity 
}: Props) => {
    // console.log(positionFirstBlock);
    // console.log(shipame);
    

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({id,disabled:onlyView});
    const shipRef = useRef<HTMLDivElement>(null);
    const lastTapRef = useRef(0);

    const handleTouchEnd = (_e: React.TouchEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300; // ms
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Xoay t├áu
            onRotate?.(id);
            lastTapRef.current = 0; // reset
        } else {
            lastTapRef.current = now;
        }
    };
    useEffect(() => {
        const node = shipRef.current;
        
        if (!node) return;

        const handleTouch = (e: TouchEvent) => {
            e.preventDefault(); // ng─ân scroll/zoom
        };

        node.addEventListener("touchstart", handleTouch, { passive: false });
        node.addEventListener("touchmove", handleTouch, { passive: false });

        return () => {
            node.removeEventListener("touchstart", handleTouch);
            node.removeEventListener("touchmove", handleTouch);
        };
    }, []);

    // Vß╗ï tr├¡ tß║ím thß╗¥i khi k├⌐o
    let x = positionFirstBlock.x + (transform?.x ?? 0);
    let y = positionFirstBlock.y + (transform?.y ?? 0);

    // Giß╗¢i hß║ín kh├┤ng v╞░ß╗út ra khß╗Åi board
    const maxX = (isVertical ? gridCount - 1 : gridCount - size) * gridSize;
    const maxY = (isVertical ? gridCount - size : gridCount - 1) * gridSize;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    const handleDoubleClick = () => {
        onRotate?.(id);
    };


    if (small) {
        x = x * 0.6;
        y = y * 0.6;
    }
    const style: React.CSSProperties = {
        position: "absolute",
        top: 0,
        left: 1,
        width: small ? size * gridSize * 0.6 : size * gridSize,
        height: small ? gridSize * 0.6 : gridSize,
        background: "transparent",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onlyView ? "pointer" : "grab",
        userSelect: "none",
        transform: `
            translate3d(${x}px, ${y}px, 0)
            rotate(${isVertical ? 90 : 0}deg)
            ${isVertical ? "translateY(-100%)" : ""}
        `,
        border: `${isDragging ? "2px solid red" : ""}`,
        transformOrigin: "top left",
        transition: isDragging ? "none" : "transform 0.15s ease-out",
        opacity:showOpacity?"0.9":"1"
    };


    return (
        <div
            id={`ship-${id}`}

            ref={el => {
                setNodeRef(el);
                shipRef.current = el; // g├ín ref cho event thß╗º c├┤ng
            }}
            style={style}
            {...listeners}
            {...attributes}
            onDoubleClick={handleDoubleClick}
            onTouchEnd={handleTouchEnd}
        >
            <img alt={shipame} src={image} className={`w-full h-full select-none pointer-events-none`} />
            {
                isSunk && 
                <div className="damage">
                    
                </div>
            }

        </div>
    );
};
export default React.memo(Ship);
