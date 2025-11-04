import React, { useState } from "react";
import Cell from "./Cell";
import type { Ship, Shot } from "../../types/game";
import { useSocket } from "../../hooks/useSocket";
import { useAppSettings } from "../../context/appSetting";
import ShipComponent from "./Ship";


interface BaseProps {
    type: "canShot" | "view";
    showAxisLabels?: boolean;
    small?: boolean;
    className?: string;
    gridCount?: number;
    gridSize?: number;
    listShipShow?: Ship[];
    shotsFired?: Shot[] | undefined;
    shotsRecevied?: Shot[] | undefined;
}

// Khi type === "canShot", roomId bắt buộc
interface CanShotProps extends BaseProps {
    type: "canShot";
    roomId: string; // bắt buộc
    // shotsFired: Shot[] | undefined;
}

// Khi type === "view", roomId optional
interface ViewProps extends BaseProps {
    type: "view";
    roomId?: string;
    // shotsRecevied: Shot[] | undefined;
}

type Props = CanShotProps | ViewProps;

const BoardBattle = ({ type, showAxisLabels, small, className, gridCount = 10, gridSize = 40, roomId, shotsFired, shotsRecevied, listShipShow }: Props) => {
    // const { type, showAxisLabels, small, className, gridCount = 10, gridSize = 40, roomId } = props
    const { attack } = useSocket()
    const { playerId } = useAppSettings();
    const letters = "ABCDEFGHIJ".slice(0, gridCount).split("");
    const numbers = Array.from({ length: gridCount }, (_, i) => i + 1);

    const [focusedCell, setFocusedCell] = useState<{ x: number; y: number } | null>(null);
    const [disabledCells, setDisabledCells] = useState<{ x: number; y: number }[]>([]);

    const shots = shotsFired ?? shotsRecevied ?? undefined

    const disableAround = (x: number, y: number) => {
        const radius = 1;
        const toDisable: { x: number; y: number }[] = [];

        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                const nx = x + i;
                const ny = y + j;
                if (nx >= 0 && nx < gridCount && ny >= 0 && ny < gridCount) {
                    toDisable.push({ x: nx, y: ny });
                }
            }
        }

        setDisabledCells((prev) => [...prev, ...toDisable]);
        setTimeout(() => {
            setDisabledCells((prev) =>
                prev.filter(
                    (c) => !toDisable.some((t) => t.x === c.x && t.y === c.y)
                )
            );
        }, 1000);
    };


    const shot = (x: number, y: number) => {
        disableAround(x, y)
        roomId && attack(roomId, x, y, playerId)

        setFocusedCell(null);
    };


    const handleClick = (x: number, y: number) => {
        if (type !== "canShot") return;

        if (focusedCell?.x === x && focusedCell?.y === y) {
            shot(x, y);
        } else {
            setFocusedCell({ x, y });
        }
    };
    // console.log(listShipShow);

    const isDisabled = (x: number, y: number) =>
        disabledCells.some((c) => c.x === x && c.y === y);
    return (
        <div className={`inline-block ${className}`}
            style={{ position: "relative" }}
        >

            {showAxisLabels && (
                <div className="flex mb-1"
                    style={{ marginLeft: gridSize * 0.8 }}
                >
                    {numbers.map((num) => (
                        <div
                            key={num}
                            className="w-10 h-10 flex items-end justify-center text-sm font-bold"
                            style={{ width: gridSize, height: gridSize }}
                        >
                            {num}
                        </div>
                    ))}
                </div>
            )}
            <div className="flex flex-col relative">
                {letters.map((letter, row) => {

                    return (
                        <div key={letter} className="flex z-10">

                            {showAxisLabels && (
                                <div className="w-8 h-10 flex items-center justify-center font-bold"
                                    style={{ width: gridSize * 0.8, height: gridSize }}
                                >
                                    {letter}
                                </div>
                            )}

                            {numbers.map((_, col) => {
                                const hit = shots?.some(shot => shot.x == row && shot.y == col && shot.hit)
                                const miss = shots?.some(shot => shot.x == row && shot.y == col)
                                const hasMyShip = listShipShow?.some(ship => ship.coordinates.some(coord => coord.x == row && coord.y == col))
                                console.log();

                                return (
                                    <Cell
                                        key={`${row}-${col}`}
                                        x={row}
                                        y={col}
                                        hasShip={hit}
                                        hit={miss}
                                        shot={handleClick}
                                        isFocus={focusedCell?.x === row && focusedCell?.y === col}
                                        disabled={isDisabled(row, col) || type !== "canShot"}
                                        small={small}
                                        gridSize={gridSize}
                                        hasMyShip={hasMyShip}
                                    />
                                )
                            })}
                        </div>
                    )
                })}
                <div className="absolute"
                    style={{top:0,left:showAxisLabels? gridSize*0.8:0}}
                >
                    {listShipShow && listShipShow.map(ship => {
                        // const pos = ships[ship.id];
                        const positionFirstBlock = {
                            x: ship.coordinates[0].y * gridSize,
                            y: ship.coordinates[0].x * gridSize
                        }
                        // if(!ship.sunk) return

                        return (
                            <ShipComponent
                                key={ship.id}
                                id={ship.id}
                                shipame={ship.type}
                                image={ship.image}
                                gridSize={gridSize}
                                size={ship.size}
                                gridCount={gridCount}
                                positionFirstBlock={positionFirstBlock}
                                isVertical={ship.coordinates[0].x === ship.coordinates[1].x ? false : true}
                                small={small}
                                onlyView={type === "view"}
                                isSunk={ship.sunk}
                                showOpacity
                            // onRotate={handleRotate}

                            />
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default React.memo(BoardBattle);
