import express from "express";
import http from "http";
import { Server } from "socket.io";
import { initSockets } from "./socket";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ dùng http để truyền cho socket.io

const io = new Server(server, {
  cors: {
    origin: [
      "https://battleship-ie9w.onrender.com",
      "http://localhost:5173",
      "https://battle-ship-gamma.vercel.app",
      "http://192.168.0.101:5173",
      "http://192.168.0.103:5173",
      "http://192.168.0.102:5173",
      "https://stats.uptimerobot.com",
      "http://192.168.1.13:5173"
    ],
  },
});

initSockets(io);

app.get("/", (req, res) => res.send({ ok: true }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
