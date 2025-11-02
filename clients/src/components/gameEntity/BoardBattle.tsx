import { useState } from "react";
import Cell from "./Cell";

interface CellState {
    hasShip: boolean;
    hit: boolean;
}

interface Props {
    type: "canShot" | "view";
    showAxisLabels?: boolean;
    small?: boolean;
    className?: string;
    gridCount: number;
    gridSize?:number;
}

const BoardBattle = ({ type, showAxisLabels, small, className, gridCount,gridSize=40 }: Props) => {
    const letters = "ABCDEFGHIJ".slice(0, gridCount).split("");
    const numbers = Array.from({ length: gridCount }, (_, i) => i + 1);

    // Khß╗ƒi tß║ío bß║úng ngß║½u nhi├¬n
    const [grid, setGrid] = useState<CellState[][]>(
        Array.from({ length: gridCount }, () =>
            Array.from({ length: gridCount }, () => ({
                hasShip: Math.random() < 0.2,
                hit: false,
            }))
        )
    );

    const [focusedCell, setFocusedCell] = useState<{ x: number; y: number } | null>(null);
    const [disabledCells, setDisabledCells] = useState<{ x: number; y: number }[]>([]);

    /** ≡ƒöÆ Disable v├╣ng quanh ├┤ tr├║ng trong 1 gi├óy */
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

    /** ≡ƒö½ Khi bß║»n */
    const shot = (x: number, y: number) => {
        console.log(`≡ƒÆÑ Shot at (${x + 1}, ${y + 1})`);

        setGrid((prev) =>
            prev.map((row, rowIndex) =>
                row.map((cell, colIndex) =>
                    rowIndex === x && colIndex === y ? { ...cell, hit: true } : cell
                )
            )
        );

        if (grid[x][y].hasShip) {
            disableAround(x, y);
        }

        setFocusedCell(null);
    };

    /** ≡ƒæå Khi click v├áo 1 ├┤ */
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
        <div className={`inline-block ${className}`}>
            {/* Trß╗Ñc X */}
            {showAxisLabels && (
                <div className="flex ml-8 mb-1">
                    {numbers.map((num) => (
                        <div
                            key={num}
                            className="w-10 h-10 flex items-center justify-center text-sm font-bold"
                        >
                            {num}
                        </div>
                    ))}
                </div>
            )}

            {/* Bß║úng */}
            <div className="flex flex-col">
                {letters.map((letter, row) => (
                    <div key={letter} className="flex">
                        {/* Trß╗Ñc Y */}
                        {showAxisLabels && (
                            <div className="w-8 h-10 flex items-center justify-center font-bold">
                                {letter}
                            </div>
                        )}

                        {/* C├íc ├┤ */}
                        {numbers.map((_, col) => (
                            <Cell
                                key={`${row}-${col}`}
                                x={row}
                                y={col}
                                hasShip={grid[row][col].hasShip}
                                hit={grid[row][col].hit}
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
