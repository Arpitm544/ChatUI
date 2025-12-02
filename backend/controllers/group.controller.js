const express = require('express')
const router = express.Router()
const Message = require('../model/message_schema')
const Group = require('../model/Group_schema')  
const { io, getReceiverSocketId } = require('../lib/socket')
const cloudinary = require('../lib/cloudinary')

router.post('/create', async (req, res) => {
    try {
        const { name, members, image } = req.body

        if (!name || !members || members.length === 0) {
            return res.status(400).json({ message: "Group name and members are required" })
        }
        
        const creatorId = req.user.id
        if (!members.includes(creatorId)) {
            members.push(creatorId)
        }

        let imageUrl = ""
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const group = new Group({
            name,
            members,
            profilePic: imageUrl,
            admin: creatorId
        })
        await group.save()

        // Populate members before sending response
        const populatedGroup = await Group.findById(group._id).populate('members', 'name profilePic')

        // Emit new group event to all members
        populatedGroup.members.forEach(member => {
            const memberSocketId = getReceiverSocketId(member._id.toString())
            if (memberSocketId) {
                io().to(memberSocketId).emit("newGroup", populatedGroup)
            }
        })

        res.status(201).json({ message: "Group created successfully", group: populatedGroup })
    } catch (error) {
        console.log("Error in create group:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}) 

router.get('/mygroups', async (req, res) => {
    try {
        const userId = req.user.id
        const groups = await Group.find({ members: userId }).populate('members', 'name profilePic')
        res.status(200).json(groups)
    } catch (error) {
        console.log("Error in get my groups:", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post('/send' , async(req, res) => {

    try{
    const {groupId,senderId,text,image} = req.body;

    if(!groupId || !senderId){
        return res.status(400).json({message:"GroupId and SenderId are required"})
    }

     let imageUrl

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

    const msg=await Message.create({
        senderId,
        groupId,
        receiverId:null,
        text,
        image:imageUrl,
    })

    // Emit to group room
    io().to(groupId).emit("newGroupMessage", msg)

    res.status(200).json(msg)
    }
    catch(error){
        console.log("Error in send group message:", error)
        res.status(500).json({message:"Internal server error"})
    }   
})

router.get('/:groupId', async (req, res) => {
    try {
        const { groupId} = req.params

        const messages = await Message.find({groupId}).sort({createdAt:1})
        
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})

router.delete('/message/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params

        await Message.findByIdAndDelete(messageId)

        res.status(200).json({ message: "Message deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
})  

router.delete('/:id', async (req, res) => {
    try {
        const groupId = req.params.id
        const userId = req.user.id

        const group = await Group.findById(groupId)
        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }

        if (group.admin.toString() !== userId) {
            return res.status(403).json({ message: "Only admin can delete the group" })
        }

        // Emit group deleted event to all members
        group.members.forEach(memberId => {
            const memberSocketId = getReceiverSocketId(memberId.toString())
            if (memberSocketId) {
                io().to(memberSocketId).emit("groupDeleted", groupId)
            }
        })

        await Group.findByIdAndDelete(groupId)
        res.status(200).json({ success: true, message: "Group deleted successfully" })
    } catch (error) {
        console.log("Delete Group Error:", error)
        res.status(500).json({ message: "Server error" })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, members } = req.body;
        const userId = req.user.id;

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.admin.toString() !== userId) {
            return res.status(403).json({ message: "Only admin can update the group" });
        }

        let imageUrl = group.profilePic;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // Handle members update
        let updatedMembers = group.members.map(m => m.toString());
        if (members && Array.isArray(members)) {
            updatedMembers = members;
            // Ensure admin is always in the group
            if (!updatedMembers.includes(userId)) {
                updatedMembers.push(userId);
            }
        }

        // Identify removed members to notify them
        const oldMembers = group.members.map(m => m.toString());
        const removedMembers = oldMembers.filter(m => !updatedMembers.includes(m));

        const updatedGroup = await Group.findByIdAndUpdate(
            id,
            { name, profilePic: imageUrl, members: updatedMembers },
            { new: true }
        ).populate('members', 'name profilePic');

        // Emit group updated event to all CURRENT members
        updatedGroup.members.forEach(member => {
            const memberSocketId = getReceiverSocketId(member._id.toString());
            if (memberSocketId) {
                io().to(memberSocketId).emit("groupUpdated", updatedGroup);
            }
        });

        // Emit group deleted event to REMOVED members
        removedMembers.forEach(memberId => {
            const memberSocketId = getReceiverSocketId(memberId);
            if (memberSocketId) {
                io().to(memberSocketId).emit("groupDeleted", id);
            }
        });

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.log("Error in update group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router