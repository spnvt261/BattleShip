import { useDraggable } from "@dnd-kit/core";
import React from "react";

interface Props {
    id: string;
    position: { x: number; y: number };
    invalid?: boolean;
    size: number;
    gridSize: number;
    gridCount: number;
}

export default function DraggableItem({
    id,
    position,
    invalid,
    size,
    gridSize,
    gridCount,
}: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const [rotation, setRotation] = React.useState(0);
    const isVertical = rotation === 90;

    const x = position.x + (transform?.x ?? 0);
    const y = position.y + (transform?.y ?? 0);

    // ✅ Giới hạn khi xoay
    const handleDoubleClick = () => {
        const next = rotation === 0 ? 90 : 0;

        const maxX = (gridCount - (next === 90 ? 1 : size)) * gridSize;
        const maxY = (gridCount - (next === 90 ? size : 1)) * gridSize;

        // Nếu vượt giới hạn, không xoay
        if (x > maxX || y > maxY) return;

        setRotation(next);
    };

    const width = isVertical ? gridSize : size * gridSize;
    const height = isVertical ? size * gridSize : gridSize;

    const style: React.CSSProperties = {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        borderRadius: 8,
        background: invalid ? "#e74c3c" : isDragging ? "#1abc9c" : "#3498db",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        userSelect: "none",
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`,
        transformOrigin: "top left",
        transition: isDragging ? "none" : "transform 0.15s ease-out",
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} onDoubleClick={handleDoubleClick}>
            {id.toUpperCase()}
        </div>
    );
}
