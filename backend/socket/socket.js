const User = require("../model/User_schema");
const PrivateMessage = require('../model/PrivateMessage_schema')
const GroupMessage = require("../model/GroupMessage.scehma");

const initializeSocket = (io) => {
    
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // PRIVATE MESSAGE 
        socket.on("private-message", async ({ senderId, receiverId, message }) => {
            try {
                const user = await User.findById(senderId);
                if (!user) return;

                const newMsg = new PrivateMessage({
                    senderId,
                    senderUsername: user.username,
                    receiverId,
                    message
                });

                await newMsg.save();

                socket.emit("private-message", newMsg);

            } catch (error) {
                console.log("Private message error:", error);
            }
        });

        // 👥 JOIN GROUP (arrow function)
        socket.on("join-group", ({ groupId }) => {
            if (groupId) {
                socket.join(groupId);
                console.log(`📌 ${socket.id} joined group ${groupId}`);
            }
        });

        // 💬 GROUP MESSAGE (arrow function)
        socket.on("group-message", async ({ groupId, senderId, message }) => {
            try {
                const user = await User.findById(senderId);
                if (!user) return;

                const newMsg = new GroupMessage({
                    groupId,
                    senderId,
                    senderUsername: user.username,
                    message
                });

                await newMsg.save();

                io.to(groupId).emit("group-message", newMsg);

            } catch (error) {
                console.log("🔥 Group message error:", error);
            }
        });

        // DISCONNECt
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

module.exports = initializeSocket;