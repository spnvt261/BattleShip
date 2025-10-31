import { configureStore } from '@reduxjs/toolkit'
import roomReducer from './roomSlice'
import gameReducer from './gameSlice'
import chatReducer from './chatSlice'

export const store = configureStore({
    reducer: {
        room: roomReducer,
        game: gameReducer,
        chat: chatReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
