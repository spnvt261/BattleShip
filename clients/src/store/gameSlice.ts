import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Cell {
    x: number;
    y: number;
    hit: boolean;
}

interface GameState {
    board: Cell[];
    turn: "me" | "opponent" | null;
    winner: string | null;
    status: "idle" | "playing" | "ended";
}

const initialState: GameState = {
    board: [],
    turn: null,
    winner: null,
    status: "idle",
};

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        startGame(state, action: PayloadAction<{ board: Cell[]; firstTurn: "me" | "opponent" }>) {
            state.board = action.payload.board;
            state.turn = action.payload.firstTurn;
            state.status = "playing";
        },
        updateCell(state, action: PayloadAction<{ x: number; y: number; hit: boolean }>) {
            const cell = state.board.find(c => c.x === action.payload.x && c.y === action.payload.y);
            if (cell) cell.hit = action.payload.hit;
        },
        switchTurn(state) {
            if (state.turn === "me") state.turn = "opponent";
            else if (state.turn === "opponent") state.turn = "me";
        },
        endGame(state, action: PayloadAction<string>) {
            state.winner = action.payload;
            state.status = "ended";
        },
        resetGame() {
            return initialState;
        },
    },
});

export const { startGame, updateCell, switchTurn, endGame, resetGame } = gameSlice.actions;
export default gameSlice.reducer;
