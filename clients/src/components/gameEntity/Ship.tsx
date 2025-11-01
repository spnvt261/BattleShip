import { useDraggable } from "@dnd-kit/core";
import React from "react";

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
}

const Ship = ({ id, positionFirstBlock, isVertical, size, gridSize, gridCount, image, shipame, onRotate }: Props) => {
    // console.log(positionFirstBlock);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

    // Vị trí tạm thời khi kéo
    let x = positionFirstBlock.x + (transform?.x ?? 0);
    let y = positionFirstBlock.y + (transform?.y ?? 0);

    // Giới hạn không vượt ra khỏi board
    const maxX = (isVertical ? gridCount-1 : gridCount - size) * gridSize;
    const maxY = (isVertical ? gridCount - size : gridCount-1) * gridSize;

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    const handleDoubleClick = () => {
        onRotate?.(id);
    };

    const style: React.CSSProperties = {
        position: "absolute",
        top: 0,
        left: 1,
        width: size * gridSize,
        height: gridSize,
        background: "transparent",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        userSelect: "none",
        transform: `
            translate3d(${x}px, ${y}px, 0)
            rotate(${isVertical ? 90 : 0}deg)
            ${isVertical ? "translateY(-100%)" : ""}
        `,
        border:`${isDragging?"2px solid red":""}`,
        transformOrigin: "top left",
        transition: isDragging ? "none" : "transform 0.15s ease-out",
    };


    return (
        <div
            id={`ship-${id}`}
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onDoubleClick={handleDoubleClick}
        >
            <img alt={shipame} src={image} className={`w-full h-full select-none pointer-events-none`} />
        </div>
    );
};

export default React.memo(Ship);
