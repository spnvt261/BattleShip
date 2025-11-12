import { useGame, useGameActions } from "../context/GameContext"

const roomCache = new Map<string, Promise<void>>();
export const useGameResource = (roomId: string) => {
    const { room} = useGame();
    const {loadRoom} = useGameActions();
    if (room && room.id === roomId) {
     return room };
    if (!roomCache.has(roomId)) {
        const promise = loadRoom(roomId)
        roomCache.set(roomId, promise)
    }
    throw roomCache.get(roomId)
}