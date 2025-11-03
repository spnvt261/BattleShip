import { useState, useMemo, useCallback, useImperativeHandle, forwardRef } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { createSnapModifier } from "@dnd-kit/modifiers";
import { ListShip } from "../../data/shipList";
import Ship from "./Ship";
import Cell from "./Cell";

interface Props {
    gridCount?: number;
    gridSize?: number;
    className?: string;
    onSetupChange?: (
        ships: Record<string, { x: number; y: number; isVertical: boolean }>
    ) => void;
}

export interface BoardSetupRef {
    randomizeShips: () => void;
    getShips:()=>void;
}

const BoardSetup = forwardRef<BoardSetupRef, Props>(({
    gridCount = 10,
    gridSize = 40,
    className,
    onSetupChange,
}, ref) => {
    const letters = "ABCDEFGHIJ".split("").slice(0, gridCount);
    const numbers = Array.from({ length: gridCount }, (_, i) => i + 1);
    const snapToGrid = useMemo(() => createSnapModifier(gridSize), [gridSize]);

    const generateRandomPositions = (
        gridCount: number,
        gridSize: number
    ): Record<string, { x: number; y: number; isVertical: boolean }> => {
        const result: Record<string, { x: number; y: number; isVertical: boolean }> = {};

        const getOccupiedCells = (
            pos: { x: number; y: number; isVertical: boolean },
            size: number
        ) => {
            const cells: { x: number; y: number }[] = [];
            const gx = Math.round(pos.x / gridSize);
            const gy = Math.round(pos.y / gridSize);
            if (pos.isVertical) {
                for (let i = 0; i < size; i++) cells.push({ x: gx, y: gy + i });
            } else {
                for (let i = 0; i < size; i++) cells.push({ x: gx + i, y: gy });
            }
            return cells;
        };

        const isCollision = (
            newShipCells: { x: number; y: number }[],
            placedShips: Record<string, { x: number; y: number; isVertical: boolean }>
        ) => {
            for (const [otherId, pos] of Object.entries(placedShips)) {
                const otherShip = ListShip.find(s => s.id === otherId);
                if (!otherShip) continue;
                const otherCells = getOccupiedCells(pos, otherShip.size);
                if (
                    newShipCells.some(c1 =>
                        otherCells.some(c2 => c1.x === c2.x && c1.y === c2.y)
                    )
                ) {
                    return true;
                }
            }
            return false;
        };

        for (const ship of ListShip) {
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < 200) {
                attempts++;
                const isVertical = Math.random() < 0.5;
                const maxX = isVertical ? gridCount - 1 : gridCount - ship.size;
                const maxY = isVertical ? gridCount - ship.size : gridCount - 1;

                const gx = Math.floor(Math.random() * (maxX + 1));
                const gy = Math.floor(Math.random() * (maxY + 1));

                const pos = { x: gx * gridSize, y: gy * gridSize, isVertical };
                const occupied = getOccupiedCells(pos, ship.size);

                if (!isCollision(occupied, result)) {
                    result[ship.id] = pos;
                    placed = true;
                }
            }

            if (!placed) {
                console.warn(`Kh├┤ng thß╗â ─æß║╖t t├áu ${ship.id} sau ${attempts} lß║ºn thß╗¡`);
            }
        }

        return result;
    };
    
    const [ships, setShips] = useState<
        Record<string, { x: number; y: number; isVertical: boolean }>
    >(
        () => generateRandomPositions(gridCount, gridSize)
    );

   
    const updateShip = useCallback(
        (id: string, data: Partial<{ x: number; y: number; isVertical: boolean }>) => {
            setShips(prev => {
                const newData = { ...prev, [id]: { ...prev[id], ...data } };
                onSetupChange?.(newData);
                return newData;
            });
        },
        [onSetupChange]
    );

    // Expose h├ám random cho cha
    useImperativeHandle(ref, () => ({
        randomizeShips: () => {
            const newPositions = generateRandomPositions(gridCount, gridSize);
            setShips(newPositions);
            onSetupChange?.(newPositions);
        },
        getShips: () => ships,
    }));



    /** Lß║Ñy c├íc ├┤ m├á t├áu chiß║┐m */
    const getOccupiedCells = useCallback(
        (pos: { x: number; y: number; isVertical: boolean }, size: number) => {
            const cells: { x: number; y: number }[] = [];
            const gx = Math.round(pos.x / gridSize);
            const gy = Math.round(pos.y / gridSize);

            if (pos.isVertical) {
                for (let i = 0; i < size; i++) cells.push({ x: gx, y: gy + i });
            } else {
                for (let i = 0; i < size; i++) cells.push({ x: gx + i, y: gy });
            }

            return cells;
        },
        [gridSize]
    );

    /** Kiß╗âm tra va chß║ím v├á giß╗¢i hß║ín board */
    const checkCollision = useCallback(
        (id: string, pos: { x: number; y: number; isVertical: boolean }) => {
            const shipData = ListShip.find(s => s.id === id);
            if (!shipData) return true;

            const occupied = getOccupiedCells(pos, shipData.size);

            // V╞░ß╗út khß╗Åi board
            if (
                occupied.some(
                    c => c.x < 0 || c.x >= gridCount || c.y < 0 || c.y >= gridCount
                )
            )
                return true;

            // Va chß║ím vß╗¢i t├áu kh├íc
            for (const [otherId, otherPos] of Object.entries(ships)) {
                if (otherId === id) continue;
                const otherShip = ListShip.find(s => s.id === otherId);
                if (!otherShip) continue;

                const otherCells = getOccupiedCells(otherPos, otherShip.size);
                if (
                    occupied.some(c1 =>
                        otherCells.some(c2 => c1.x === c2.x && c1.y === c2.y)
                    )
                )
                    return true;
            }
            return false;
        },
        [ships, gridCount, getOccupiedCells]
    );


    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, delta } = event;
            const id = active.id as string;
            const prev = ships[id];
            if (!prev) return;

            const shipData = ListShip.find(s => s.id === id);
            if (!shipData) return;
            

            // T├¡nh vß╗ï tr├¡ mß╗¢i theo delta, snap vß╗ü l╞░ß╗¢i
            let newPos = {
                x: Math.round((prev.x + delta.x) / gridSize) * gridSize,
                y: Math.round((prev.y + delta.y) / gridSize) * gridSize,
                isVertical: prev.isVertical,
            };

            // Ghim t├áu v├áo bi├¬n gß║ºn nhß║Ñt
            const clampPositionToBoard = (
                pos: typeof newPos,
                shipSize: number
            ) => {
                const maxX = (pos.isVertical ? gridCount - 1 : gridCount - shipSize) * gridSize;
                const maxY = (pos.isVertical ? gridCount - shipSize : gridCount - 1) * gridSize;
                return {
                    ...pos,
                    x: Math.max(0, Math.min(pos.x, maxX)),
                    y: Math.max(0, Math.min(pos.y, maxY)),
                };
            };

            newPos = clampPositionToBoard(newPos, shipData.size);

            // Nß║┐u va chß║ím vß╗¢i t├áu kh├íc, kh├┤ng cß║¡p nhß║¡t
            if (checkCollision(id, newPos)) return;

            updateShip(id, newPos);
        },
        [ships, gridSize, gridCount, checkCollision, updateShip]
    );

    /** Xoay t├áu (double click) */
    const handleRotate = useCallback(
        (id: string) => {
            const current = ships[id];
            const shipData = ListShip.find(s => s.id === id);
            if (!current || !shipData) return;

            const newPos = {
                ...current,
                isVertical: !current.isVertical,
            };

            // Nß║┐u xoay bß╗ï ─æ├¿ hoß║╖c v╞░ß╗út, kh├┤ng ─æß╗òi
            if (checkCollision(id, newPos)) return;
            updateShip(id, newPos);
        },
        [ships, checkCollision, updateShip]
    );

    const offset = gridSize;
    return (
        <div
            className={`inline-block ${className || ""}`}
            style={{ position: "relative" }}
        >
            {/* Trß╗Ñc X */}
            {(
                <div className="flex ml-[40px] mb-1">
                    {numbers.map((num, idx) => (
                        <div
                            key={num}
                            style={{
                                position: "absolute",
                                top: -1 * gridSize,
                                left: offset + (idx - 1) * gridSize,
                                width: gridSize,
                                height: gridSize,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                            }}
                        >
                            {num}
                        </div>
                    ))}
                </div>
            )}

            <DndContext onDragEnd={handleDragEnd} modifiers={[snapToGrid]}>
                <div style={{ display: "flex", position: "relative" }}>
                    {/* Trß╗Ñc Y */}
                    {letters.map((letter, idx) => (
                        <div
                            key={letter}
                            style={{
                                position: "absolute",
                                top: offset + (idx - 1) * gridSize,
                                left: -1 * gridSize,
                                width: gridSize,
                                height: gridSize,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                            }}
                        >
                            {letter}
                        </div>
                    ))}

                    {/* Board ch├¡nh */}
                    <div style={{ position: "relative" }}>
                        {/* Grid */}
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: `repeat(${gridCount}, ${gridSize}px)`,
                                gridTemplateRows: `repeat(${gridCount}, ${gridSize}px)`,
                            }}
                        >
                            {Array.from({ length: gridCount * gridCount }).map((_, idx) => (
                                <Cell
                                    key={idx}
                                    x={0}
                                    y={0}
                                    hasShip={false}
                                    hit={false}
                                    disabled
                                    shot={() => { }}
                                    gridSize={gridSize}
                                />
                            ))}
                        </div>

                        {/* Ships */}
                        {ListShip.map(ship => {
                            const pos = ships[ship.id];
                            return (
                                <Ship
                                    key={ship.id}
                                    id={ship.id}
                                    shipame={ship.type}
                                    image={ship.image}
                                    gridSize={gridSize}
                                    size={ship.size}
                                    gridCount={gridCount}
                                    positionFirstBlock={pos}
                                    isVertical={pos.isVertical}
                                    onRotate={handleRotate}
                                    
                                />
                            );
                        })}
                    </div>
                </div>
            </DndContext>
        </div>
    );
});

export default BoardSetup;
