const { Server } = require("socket.io")
const Group = require('../model/Group_schema')

let getaIO=()=> io

// Store online users
const userSocketMap = {} // userId -> socketId

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  })

  io.on("connection", async (socket) => {
    console.log("New client connected:", socket.id)

    const userId = socket.handshake.query.userId
    
    if (userId && userId !== "undefined" && userId !== "null") {
        userSocketMap[userId] = socket.id

        // Send online users to all clients
        io.emit("getOnlineUsers", Object.keys(userSocketMap))

        try {
            const groups=await Group.find({members:userId})
            groups.forEach(group=>{
                socket.join(group._id.toString())
                console.log(`User ${userId} joined group ${group._id.toString()}`)
            })
        } catch (error) {
            console.log("Error joining groups:", error)
        }
    }

    socket.on("sendMessage", (data) => {
        const {senderId, receiverId, text, image} = data
        const receiverSocketId=userSocketMap[receiverId]
        
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newmessage", {
                senderId,
                receiverId,
                text,
                image
            })
        }
    })

    socket.on("sendGroupMessage", (data) => {
        const {groupId, senderId, text, image} = data
        
        // Broadcast to all members in the group except the sender
        io.to(groupId).emit("newGroupMessage", {
            groupId,
            senderId,
            text,
            image
        })
        console.log(`Message sent to group ${groupId} by user ${senderId}`)
    })

    socket.on("joinGroup", (groupId) => {
        socket.join(groupId)
        console.log(`User ${userId} joined group ${groupId}`)
    })  

    socket.on("disconnect", () => {
      delete userSocketMap[userId]
      io.emit("getOnlineUsers", Object.keys(userSocketMap))
      console.log("Client disconnected:", socket.id)
    })
  })
}

const getReceiverSocketId = (userId) => userSocketMap[userId]

module.exports = { initializeSocket, getReceiverSocketId , io:getaIO}
