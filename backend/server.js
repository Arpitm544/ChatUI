require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes + DB
const userRoutes = require("./controllers/User.controller");
const connectDB = require("./db/mongoose");
const initializeSocket = require("./socket/socket");

connectDB();

// Create server + socket.io correctly
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Initialize socket
initializeSocket(io);

// Api routes
app.use("/user", userRoutes);

// Start server
server.listen(4000, () => {
  console.log("server is running on port 4000");
});