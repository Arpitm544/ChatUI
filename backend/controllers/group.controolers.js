const express = require("express");
const router = express.Router();
const Group = require("../model/Group");
const GroupMessage = require("../model/GroupMessage");
const User = require("../model/User_schema");

// Create group
router.post("/create", async (req, res) => {
    try {
        const { name, createdBy, members } = req.body;

        if (!name || !createdBy || !members || members.length === 0) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const group = new Group({ name, createdBy, members });

        await group.save();

        res.status(200).json({
            success: true,
            message: "Group created",
            group
        });

    } catch (error) {
        console.log("Group Create Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Add member to group
router.post("/add-member", async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        await Group.findByIdAndUpdate(groupId, {
            $addToSet: { members: userId }
        });

        res.status(200).json({ success: true, message: "Member added" });

    } catch (error) {
        console.log("Add Member Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Send message to group
router.post("/send-message", async (req, res) => {
    try {
        const { groupId, senderId, message } = req.body;

        const user = await User.findById(senderId).select("username")
        if (!user) return res.status(404).json({ message: "Sender not found" });

        const msg = new GroupMessage({
            groupId,
            senderId,
            senderUsername: user.username,
            message
        });

        await msg.save();

        res.status(200).json({ success: true, message: "Message sent", msg });

    } catch (error) {
        console.log("Group Message Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get messages of a group
router.get("/messages/:groupId", async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const messages = await GroupMessage.find({ groupId });

        res.status(200).json(messages);

    } catch (error) {
        console.log("Group Fetch Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;