const { Server } = require("socket.io");

let io;

// Store online users
const userSocketMap = {}; // userId -> socketId

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    // Send online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log("Client disconnected:", socket.id);
    });
  });
}

const getReceiverSocketId = (userId) => userSocketMap[userId];

module.exports = { initializeSocket, getReceiverSocketId };