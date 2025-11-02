import express from "express";
import http from "http";
import { Server } from "socket.io";
import { initSockets } from "./socket";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

initSockets(io);

app.get("/", (req, res) => res.send({ ok: true }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});
