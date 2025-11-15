import { useState, useMemo, useCallback, useImperativeHandle, forwardRef, useRef, useEffect } from "react";
import { DndContext, type DragEndEvent, type Modifier } from "@dnd-kit/core";
import { createSnapModifier } from "@dnd-kit/modifiers";
import { ListShip } from "../../data/shipList";
import Cell from "./Cell";
import type { Ship as ShipType } from "../../types/game";
import Ship from "./Ship";
import { playMissSound } from "../../utils/playSound";
import { useAppSettings } from "../../context/appSetting";

interface Props {
    gridCount?: number;
    gridSize?: number;
    className?: string;
    // onSetupChange?: (
    //     ships: Record<string, { x: number; y: number; isVertical: boolean }>
    // ) => void;
    disabled?: boolean;
    myListShip?: ShipType[]
}

export interface BoardSetupRef {
    randomizeShips: () => void;
    getShips: () => ShipType[];
}

const BoardSetup = forwardRef<BoardSetupRef, Props>(({
    gridCount = 10,
    gridSize = 40,
    className,
    // onSetupChange,
    disabled,
    myListShip,
}, ref) => {
    // console.log("Board setup");
    const {playerId} = useAppSettings();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, gridCount).split("");
    const numbers = Array.from({ length: gridCount }, (_, i) => i + 1);
    const snapToGrid: Modifier = useMemo(() => createSnapModifier(gridSize), [gridSize]);

    const listShips = useRef<ShipType[]>([])

    const getCoordinatesShip = (cellFirstPosition: number, rowFirstPosition: number, size: number, isVertical: boolean): { x: number; y: number }[] => {
        return Array.from({ length: size }, (_, i) => ({
            x: isVertical ? rowFirstPosition + i : rowFirstPosition,
            y: isVertical ? cellFirstPosition : cellFirstPosition + i,
        }))
    }

    const generateRandomPositions = (
        gridCount: number,
        gridSize: number
    ): Record<string, { x: number; y: number; isVertical: boolean }> => {
        const result: Record<string, { x: number; y: number; isVertical: boolean }> = {};
        listShips.current = []
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

                    listShips.current.push({
                        ...ship,
                        coordinates: getCoordinatesShip(gx, gy, ship.size, isVertical),
                        playerId:playerId
                    })
                }
            }


            // if (!placed) {
            //     console.warn(`Kh├┤ng thß╗â ─æß║╖t t├áu ${ship.id} sau ${attempts} lß║ºn thß╗¡`);
            // }
        }

        // console.log(listShips.current);

        return result;
    };

    const generateCurrentPositions = (listShip: ShipType[]): Record<string, { x: number; y: number; isVertical: boolean }> => {
        // console.log(listShips.current);
        return listShip.reduce((acc, ship) => {
            acc[ship.id] = {
                x: ship.coordinates[0].y * gridSize,
                y: ship.coordinates[0].x * gridSize,
                isVertical: ship.coordinates[0].x === ship.coordinates[1].x ? false : true
            };
            return acc
        }, {} as Record<string, { x: number; y: number; isVertical: boolean }>)
    }

    const [ships, setShips] = useState<
        Record<string, { x: number; y: number; isVertical: boolean }>
    >(
        () => {
            if ((!myListShip || myListShip.length === 0)) return generateRandomPositions(gridCount, gridSize)
            return generateCurrentPositions(myListShip)
        }
    );

    const shipRef = useRef<Record<string, { x: number; y: number; isVertical: boolean }>>(ships)

    useEffect(() => {
        shipRef.current = ships
    }, [ships])



    const updateShip = useCallback(
        (id: string, data: { x: number; y: number; isVertical: boolean }) => {
            let ship = listShips.current.find(p => p.id === id)
            if (ship) ship.coordinates = getCoordinatesShip(data.x / gridSize, data.y / gridSize, ship.size, data.isVertical)
            setShips(prev => {
                const newData = { ...prev, [id]: { ...prev[id], ...data } }
                return newData
            });
            playMissSound()
        },
        []
    );

    // Expose h├ám random cho cha
    useImperativeHandle(ref, () => ({
        randomizeShips: () => {
            const newPositions = generateRandomPositions(gridCount, gridSize);
            setShips(newPositions);
            // onSetupChange?.(newPositions);
        },
        getShips: () => listShips.current,
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
            for (const [otherId, otherPos] of Object.entries(shipRef.current)) {
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
        [gridCount, getOccupiedCells]
    );


    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, delta } = event;
            const id = active.id as string;
            const prev = ships[id];
            if (!prev) return;

            const shipData = ListShip.find(s => s.id === id);
            if (!shipData) return;

            const threshold = 15; // px
            if (Math.abs(delta.x) < threshold && Math.abs(delta.y) < threshold) return;

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
            const current = shipRef.current[id];
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
        []
    );

    // const offset = gridSize;
    return (
        <div
            className={`flex ${className || ""}`}
            style={{ position: "relative", zoom:'1' }}
        >
            {/* Cột chữ Y (cố định) */}
            <div className="flex flex-col border-r"
                style={{ marginTop: `${gridSize}px` }}
            >
                {letters.map((letter) => (
                    <div
                        key={letter}
                        className="flex items-center justify-center font-bold"
                        style={{
                            width: gridSize,
                            height: gridSize,
                        }}
                    >
                        {letter}
                    </div>
                ))}
            </div>

            <div className="h-full flex flex-col overflow-x-auto max-w-[86vw] relative">
                {/* Numbers — TRƯỢT THEO BOARD */}
                <div className="flex"
                >
                    {numbers.map((num) => (
                        <div
                            key={num}
                            className="flex items-center justify-center font-bold"
                            style={{
                                minWidth: gridSize,
                                height: gridSize,
                            }}
                        >
                            {num}
                        </div>
                    ))}

                </div>
                {/* BOARD */}
                <div className="relative">
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
                                gridSize={gridSize}
                            />
                        ))}
                    </div>
                    {/* <DndContext> */}
                    {/* Ships */}
                    {/* <DndContext onDragEnd={handleDragEnd} modifiers={[snapToGrid]}> */}
                    {ListShip.map(ship => {
                        const pos = ships[ship.id];
                        return (
                            <DndContext key={ship.id} onDragEnd={handleDragEnd} modifiers={[snapToGrid]}>
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
                                    onlyView={disabled}
                                />
                            </DndContext>

                        );
                    })}
                    {/* </DndContext> */}
                </div>
            </div>
        </div>
    );
});

export default BoardSetup;
