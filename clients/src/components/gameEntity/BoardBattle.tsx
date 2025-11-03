import { useState } from "react";
import Cell from "./Cell";
import type { Ship, Shot } from "../../types/game";


interface Props {
    type: "canShot" | "view";
    showAxisLabels?: boolean;
    small?: boolean;
    className?: string;
    gridCount?: number;
    gridSize?:number;
    shotsFired?:Shot[];
    myListShip?:Ship[]
}

const BoardBattle = ({ type, showAxisLabels, small, className, gridCount = 10,gridSize=40 }: Props) => {
    const letters = "ABCDEFGHIJ".slice(0, gridCount).split("");
    const numbers = Array.from({ length: gridCount }, (_, i) => i + 1);



    const [focusedCell, setFocusedCell] = useState<{ x: number; y: number } | null>(null);
    const [disabledCells, setDisabledCells] = useState<{ x: number; y: number }[]>([]);

    
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
        disableAround(x,y)
        console.log(x,y);
        
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

    const isDisabled = (x: number, y: number) =>
        disabledCells.some((c) => c.x === x && c.y === y);

    return (
        <div className={`inline-block ${className}`}
            style={{ position: "relative" }}
        >
            
            {showAxisLabels && (
                <div className="flex mb-1"
                    style={{marginLeft:gridSize*0.8}}
                >
                    {numbers.map((num) => (
                        <div
                            key={num}
                            className="w-10 h-10 flex items-end justify-center text-sm font-bold"
                            style={{width:gridSize,height:gridSize}}
                        >
                            {num}
                        </div>
                    ))}
                </div>
            )}
            <div className="flex flex-col">
                {letters.map((letter, row) => (
                    <div key={letter} className="flex">
                        
                        {showAxisLabels && (
                            <div className="w-8 h-10 flex items-center justify-center font-bold"
                                style={{width:gridSize*0.8,height:gridSize}}
                            >
                                {letter}
                            </div>
                        )}

                        
                        {numbers.map((_, col) => (
                            <Cell
                                key={`${row}-${col}`}
                                x={row}
                                y={col}
                                // hasShip={}
                                // hit={}
                                shot={handleClick}
                                isFocus={focusedCell?.x === row && focusedCell?.y === col}
                                disabled={isDisabled(row, col) || type !== "canShot"}
                                small={small}
                                gridSize={gridSize}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoardBattle;
