const { Server } = require("socket.io")
const Group = require('../model/Group_schema')
const Message = require('../model/message_schema')

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

    socket.on("typing", ({ chatId, receiverId }) => {
        if (receiverId) {
            const receiverSocketId = userSocketMap[receiverId]
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing", { chatId, senderId: userId })
            }
        } else {
            // Group typing
            socket.to(chatId).emit("typing", { chatId, senderId: userId })
        }
    })

    socket.on("stopTyping", ({ chatId, receiverId }) => {
        if (receiverId) {
            const receiverSocketId = userSocketMap[receiverId]
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("stopTyping", { chatId, senderId: userId })
            }
        } else {
            // Group typing
            socket.to(chatId).emit("stopTyping", { chatId, senderId: userId })
        }
    })

    socket.on("markMessagesAsRead", async ({ chatId, userToChatId }) => {
        try {
            // Update all messages from userToChatId to me as read
            await Message.updateMany(
                { senderId: userToChatId, receiverId: userId, status: { $ne: 'read' } },
                { $set: { status: 'read' } }
            )
            
            // Notify the sender that I read their messages
            const senderSocketId = userSocketMap[userToChatId]
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesRead", { chatId, readerId: userId })
            }
        } catch (error) {
            console.log("Error marking messages as read:", error)
        }
    })

    socket.on("editMessage", async ({ messageId, newText }) => {
        try {
            const updatedMessage = await Message.findByIdAndUpdate(
                messageId,
                { text: newText, isEdited: true },
                { new: true }
            )
            
            if (updatedMessage) {
                if (updatedMessage.groupId) {
                    io.to(updatedMessage.groupId).emit("messageUpdated", updatedMessage)
                } else {
                    const receiverSocketId = userSocketMap[updatedMessage.receiverId]
                    const senderSocketId = userSocketMap[updatedMessage.senderId]
                    if (receiverSocketId) io.to(receiverSocketId).emit("messageUpdated", updatedMessage)
                    if (senderSocketId) io.to(senderSocketId).emit("messageUpdated", updatedMessage)
                }
            }
        } catch (error) {
            console.log("Error editing message:", error)
        }
    })

    socket.on("deleteMessage", async ({ messageId }) => {
        console.log("Received deleteMessage event for:", messageId)
        try {
            const deletedMessage = await Message.findByIdAndDelete(messageId)
            console.log("Deleted message from DB:", deletedMessage)
            
            if (deletedMessage) {
                 if (deletedMessage.groupId) {
                    io.to(deletedMessage.groupId).emit("messageDeleted", messageId)
                } else {
                    const receiverSocketId = userSocketMap[deletedMessage.receiverId]
                    const senderSocketId = userSocketMap[deletedMessage.senderId]
                    console.log("Emitting messageDeleted to:", receiverSocketId, senderSocketId)
                    if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", messageId)
                    if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", messageId)
                }
            }
        } catch (error) {
            console.log("Error deleting message:", error)
        }
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
