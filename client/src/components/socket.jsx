import { io } from "socket.io-client";

let socket = null;

if (import.meta.env.VITE_NODE_ENV !== "production") {
  socket = io.connect(import.meta.env.VITE_API_URL);
}

export default socket;
