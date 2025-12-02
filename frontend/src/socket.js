import { io } from "socket.io-client"

const socket = io("https://chatui-m4hf.onrender.com")  // backend URL

export default socket