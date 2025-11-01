import { useState } from "react";
import Cell from "./Cell";

interface CellState {
    hasShip: boolean;
    hit: boolean;
}

// interface Props {
//   phase: "setup" | "playing" | "waiting";
// }

const Board = () => {
    const letters = "ABCDEFGHIJ".split("");
    const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

    const [grid, setGrid] = useState<CellState[][]>(
        Array.from({ length: 10 }, () =>
            Array.from({ length: 10 }, () => ({
                hasShip: Math.random() < 0.2,
                hit: false,
            }))
        )
    );

    const [focusedCell, setFocusedCell] = useState<{ x: number; y: number } | null>(null);
    const [disabledCells, setDisabledCells] = useState<{ x: number; y: number }[]>([]);

    const disableAround = (x: number, y: number) => {
        const radius = 1; // nổ lan 1 ô xung quanh
        const toDisable: { x: number; y: number }[] = [];

        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                const nx = x + i;
                const ny = y + j;
                if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
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
        console.log(`💥 shot(${x + 1}, ${y + 1})`);

        setGrid((prev) =>
            prev.map((row, rowIndex) =>
                row.map((cell, colIndex) =>
                    rowIndex === x && colIndex === y
                        ? { ...cell, hit: true }
                        : cell
                )
            )
        );

        if (grid[x][y].hasShip) {
            disableAround(x, y); // hiệu ứng lan khi bắn trúng
        }

        setFocusedCell(null);
    };

    const handleClick = (x: number, y: number) => {
        if (focusedCell?.x === x && focusedCell?.y === y) {
            shot(x, y);
        } else {
            setFocusedCell({ x, y });
        }
    };

    const isDisabled = (x: number, y: number) =>
        disabledCells.some((c) => c.x === x && c.y === y);

    return (
        <div className="inline-block">
            {/* Trục X */}
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

            {/* Bảng có trục Y */}
            <div className="flex flex-col">
                {letters.map((letter, row) => (
                    <div key={letter} className="flex">
                        {/* Trục Y */}
                        <div className="w-8 h-10 flex items-center justify-center font-bold">
                            {letter}
                        </div>

                        {/* Hàng ô */}
                        {numbers.map((_, col) => (
                            <Cell
                                key={`${row}-${col}`}
                                x={row}
                                y={col}
                                hasShip={grid[row][col].hasShip}
                                hit={grid[row][col].hit}
                                shot={handleClick}
                                isFocus={
                                    focusedCell?.x === row && focusedCell?.y === col
                                }
                                disabled={isDisabled(row, col)}
                                className="w-10 h-10"
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Board;
