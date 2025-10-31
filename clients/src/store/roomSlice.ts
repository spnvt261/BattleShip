import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Player {
    id: string;
    name: string;
}

interface RoomState {
    roomId: string | null;
    players: Player[];
    status: "idle" | "waiting" | "full" | "playing";
}

const initialState: RoomState = {
    roomId: null,
    players: [],
    status: "idle",
};

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        createRoom(state, action: PayloadAction<string>) {
            state.roomId = action.payload;
            state.status = "waiting";
        },
        joinRoom(state, action: PayloadAction<Player>) {
            state.players.push(action.payload);
            if (state.players.length >= 2) {
                state.status = "full";
            }
        },
        leaveRoom(state, action: PayloadAction<string>) {
            state.players = state.players.filter(p => p.id !== action.payload);
            if (state.players.length === 0) {
                state.status = "idle";
                state.roomId = null;
            } else {
                state.status = "waiting";
            }
        },
        resetRoom() {
            return initialState;
        },
    },
});

export const { createRoom, joinRoom, leaveRoom, resetRoom } = roomSlice.actions;
export default roomSlice.reducer;
