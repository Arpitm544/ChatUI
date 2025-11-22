require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./db/mongoose");
const userRoutes = require("./controllers/User.controller");
const messageRoutes = require("./controllers/message_controllers");
const authmiddleware = require("./middleware/autMiddleware");
const { initializeSocket } = require("./lib/socket");

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Connect DB
connectDB();

// API Routes
app.use("/user", userRoutes);
app.use("/messages", authmiddleware, messageRoutes);

// Initialize Socket.io using SAME server
initializeSocket(server);

// Start server
server.listen(4000, () => {
  console.log("server is running on port 4000");
});