import { io } from "socket.io-client"

const socket = io("https://chatui-1-ffr2.onrender.com")  // backend URL

export default socket