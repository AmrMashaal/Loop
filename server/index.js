import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { initSocket } from "./utils/socket.js";

const server = http.createServer(app);

const PORT = process.env.PORT || 6001;

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_LINK,
    methods: ["GET", "POST"],
  },
});

initSocket(io);

const serverConnection = async () => {
  try {
    mongoose.connect(process.env.MONGODB_KEY, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

serverConnection();

export default server;
