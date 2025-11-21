const express = require("express");
const router = express.Router();
const User = require("../schema/User_schema");
const PrivateMessage = require("../model/PrivateMessage");

// Send private message
router.post("/send", async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(senderId).selct("username");
        if (!user) {
            return res.status(404).json({ message: "Sender not found" });
        }

        const newMessage = new PrivateMessage({
            senderId,
            senderUsername: user.username, 
            receiverId,
            message
        });

        await newMessage.save();

        res.status(200).json({
            success: true,
            message: "Message sent",
            data: newMessage
        });

    } catch (error) {
        console.log("Private Message Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Chat history between two users
router.get("/history/:user1/:user2", async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        const messages = await PrivateMessage.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ timestamp: 1 })

        res.status(200).json(messages)

    } catch (error) {
        console.log("Chat History Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;