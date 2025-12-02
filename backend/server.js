require("dotenv").config()
const express = require("express")
const http = require("http")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./db/mongoose")
const userRoutes = require("./controllers/User.controller")
const messageRoutes = require("./controllers/message_controllers")
const groupRoutes = require('./controllers/group.controller')
const authmiddleware = require("./middleware/authMiddleware")
const { initializeSocket } = require("./lib/socket")

const app = express()
const server = http.createServer(app)

// Middlewares

 async function startServer(){
await connectDB()
app.set("trust proxy", 1);
app.use(cors({
  origin:[
    "http://localhost:5173",
    "https://chat-ui-hm84.vercel.app",
    "https://chatui-m4hf.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json({limit:'10mb'}))
app.use(express.urlencoded({ extended: true , limit:'10mb'}))
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Backend is running")
})
app.use("/user", userRoutes)
app.use("/messages", authmiddleware, messageRoutes)
app.use('/groups', authmiddleware, groupRoutes)

// Initialize Socket.io using SAME server
initializeSocket(server)

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
}

startServer()