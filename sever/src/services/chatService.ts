import { rooms } from "./roomService";
import { Message } from "../types";
import { Server } from "socket.io";

function makeId() {
  return Math.random().toString(36).substring(2, 9);
}

export function addMessage(roomId: string, senderId: string, senderName: string, text: string, io?: Server): { success: boolean; error?: string } {
  const room = rooms[roomId];
  if (!room) return { success: false, error: "Room not found" };
  const msg: Message = {
    id: makeId(),
    roomId,
    senderId,
    senderName,
    text,
    timestamp: Date.now(),
  };
  if (!room.chat) room.chat = [];
  room.chat.push(msg);
  if (io) io.to(roomId).emit("chat", msg);
  return { success: true };
}
