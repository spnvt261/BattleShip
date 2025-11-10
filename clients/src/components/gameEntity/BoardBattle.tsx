import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    shots: Shot[] | undefined;
}

// Khi type === "canShot", roomId bắt buộc
interface CanShotProps extends BaseProps {
    type: "canShot";
    roomId: string; // bắt buộc
}

// Khi type === "view", roomId optional
interface ViewProps extends BaseProps {
    type: "view";
    roomId?: string;
}

type Props = CanShotProps | ViewProps;

const BoardBattle = ({ type, showAxisLabels, small = false, className = "", gridCount = 10, gridSize = 40, roomId, shots = [], listShipShow = [] }: Props) => {
    // console.log('Board Battle');
    const { attack } = useSocket()
    const { playerId } = useAppSettings();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, gridCount).split("");
    const numbers = Array.from({ length: gridCount }, (_, i) => i + 1);
    const [focusedCell, setFocusedCell] = useState<{ x: number; y: number } | null>(null);

    const shot = (x: number, y: number) => {
        roomId && attack(roomId, x, y, playerId)

        setFocusedCell(null);
    };


    const listShipShowMap = useMemo(() => {
        const map = new Map<string, boolean>();
        listShipShow?.forEach(ship => {
            ship?.coordinates?.forEach(coord => {
                map.set(`${coord.x},${coord.y}`, true)
            })
        })
        return map
    }, [listShipShow]);

    // const shotMap = useMemo(() => {
    //     const map = new Map<string, Shot>();
    //     shots?.forEach(shot => {
    //         map.set(`${shot.x},${shot.y}`, shot);
    //     });
    //     return map;
    // }, [shots]);

    const shotMapRef = useRef<Map<string, Shot>>(new Map(
        shots?.map(shot => [`${shot.x},${shot.y}`, shot])
    ));

    useEffect(() => {
        if (!shots || shots.length === 0) return;
        // incremental: chỉ thêm phần tử mới nhất
        const newShot = shots[shots.length - 1];
        shotMapRef.current.set(`${newShot.x},${newShot.y}`, newShot);
    }, [shots])

    const focusedCellRef = useRef<{ x: number; y: number } | null>(null)
    const typeRef = useRef<"canShot" | "view">("view")
    useEffect(() => {
        focusedCellRef.current = focusedCell
    }, [focusedCell])

    useEffect(() => {
        typeRef.current = type
    }, [type])

    const handleClick = useCallback((x: number, y: number) => {
        if (typeRef.current !== "canShot") return;
        if (focusedCellRef.current?.x === x && focusedCellRef.current?.y === y) {
            shot(x, y);
        } else {
            setFocusedCell({ x, y });
        }
    }, []);

    return (
        <div className={`inline-block ${className} opacity-1`}
            style={{
                position: "relative",
                zoom: small ? 0.6 : 1,
                // transform: `scale(${small ? 0.6 : 1})`,
                transformOrigin: "top left"
            }}
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
            <div className={`flex flex-col relative ${type !== 'canShot' ? 'board-disabled' : 'board-not-disabled'}`}

            >
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
                                const hit = shotMapRef.current.get(`${row},${col}`)?.hit
                                const miss = shotMapRef.current.get(`${row},${col}`) ? true : false
                                const hasMyShip = listShipShowMap.get(`${row},${col}`)
                                return (
                                    <Cell
                                        key={`${row}-${col}`}
                                        x={row}
                                        y={col}
                                        hasShip={hit}
                                        hit={miss}
                                        isNewHit={(shots[shots.length - 1]?.x === row && shots[shots.length - 1]?.y === col) ? true : false}
                                        isNewHitToShip={(shots[shots.length - 1]?.x === row && shots[shots.length - 1]?.y === col &&  shots[shots.length - 1].hit)}
                                        shot={handleClick}
                                        isFocus={focusedCell?.x === row && focusedCell?.y === col}
                                        disabled={miss}
                                        // small={small}
                                        gridSize={gridSize}
                                        hasMyShip={hasMyShip}
                                    />
                                )
                            })}
                        </div>
                    )
                })}
                <div className="absolute"
                    style={{ top: 0, left: showAxisLabels ? gridSize * 0.8 : 0 }}
                >
                    {listShipShow && listShipShow.map(ship => {
                        const firstCoord = ship?.coordinates?.[0];
                        const positionFirstBlock = {
                            x: firstCoord?.y * gridSize,
                            y: firstCoord?.x * gridSize
                        }
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
                                isVertical={ship.coordinates?.[0].x === ship.coordinates?.[1].x ? false : true}
                                onlyView={type === "view"}
                                isSunk={ship.sunk}
                                showOpacity
                            />
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default BoardBattle;
