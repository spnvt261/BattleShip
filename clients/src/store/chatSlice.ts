import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Message {
    id: string;
    user: string;
    text: string;
    timestamp: number;
}

interface ChatState {
    messages: Message[];
}

const initialState: ChatState = {
    messages: [],
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage(state, action: PayloadAction<Message>) {
            state.messages.push(action.payload);
        },
        clearChat(state) {
            state.messages = [];
        },
    },
});

export const { addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
