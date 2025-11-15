import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cell from "./Cell";
import type { Player, Ship, Shot } from "../../types/game";
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
    players?:(Player|null)[]
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

const BoardBattle = ({ type, showAxisLabels, small = false, className = "", gridCount = 10, gridSize = 40, roomId, shots = [], listShipShow = [],players=[]}: Props) => {
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
        <div className={`inline-block flex ${className} opacity-1`}
            style={{
                position: "relative",
                zoom: small ? 0.6 : 1,
                transformOrigin: "top left"
            }}
        >

            {/* Cột chữ Y (cố định) */}
            {
                showAxisLabels && <div className="flex flex-col border-r"
                    style={{ marginTop: `${gridSize}px` }}
                >
                    {letters.map((letter) => (
                        <div
                            key={letter}
                            className="flex items-center justify-center font-bold"
                            style={{
                                width: gridSize * 0.8,
                                height: gridSize,
                            }}
                        >
                            {letter}
                        </div>
                    ))}
                </div>
            }

            <div className={`h-full flex flex-col overflow-x-auto max-w-[86vw] relative ${type !== 'canShot' ? 'board-disabled' : 'board-not-disabled'}`}

            >
                {
                    showAxisLabels &&
                    <>
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
                    </>
                }

                {/* BOARD */}
                <div className="relative z-20">
                    <div
                        className="grid"
                        style={{
                            gridTemplateColumns: `repeat(${gridCount}, ${gridSize}px)`,
                            gridTemplateRows: `repeat(${gridCount}, ${gridSize}px)`,
                        }}
                    >
                        {Array.from({ length: gridCount * gridCount }).map((_, idx) => {
                            const row = Math.floor(idx / gridCount);
                            const col = idx % gridCount;
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
                                    isNewHitToShip={(shots[shots.length - 1]?.x === row && shots[shots.length - 1]?.y === col && shots[shots.length - 1].hit)}
                                    shot={handleClick}
                                    isFocus={focusedCell?.x === row && focusedCell?.y === col}
                                    disabled={miss}
                                    gridSize={gridSize}
                                    hasMyShip={hasMyShip}
                                />
                            )
                        })}
                    </div>
                </div>
                <div className="absolute z-10"
                    style={{ 
                        top: showAxisLabels ?gridSize:0, 
                    }}
                >
                    {listShipShow && listShipShow.map(ship => {
                        const firstCoord = ship?.coordinates?.[0];
                        const positionFirstBlock = {
                            x: firstCoord?.y * gridSize,
                            y: firstCoord?.x * gridSize
                        }
                        return (
                            <ShipComponent
                                key={`${ship.playerId}-${ship.id}`}
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
                <div className="absolute z-30"
                    style={{ 
                        top: showAxisLabels ?gridSize:0, 
                    }}
                >
                    {listShipShow && listShipShow.map(ship => {
                        const firstCoord = ship?.coordinates?.[0];
                        const positionFirstBlock = {
                            x: firstCoord?.y * gridSize,
                            y: firstCoord?.x * gridSize
                        }
                        return (
                            <ShipComponent
                                key={`${ship.playerId}-${ship.id}`}
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
                                hideShip
                                className={`
                                    ${ship.playerId===players[0]?.id?"border-2 border-blue-700":""}
                                    ${ship.playerId===players[1]?.id?"border-2 border-red-500":""}
                                    ${ship.playerId===players[2]?.id?"border-2 border-green-500":""}
                                    ${ship.playerId===players[3]?.id?"border-2 border-yellow-500":""}
                                `}
                            />
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default BoardBattle;
