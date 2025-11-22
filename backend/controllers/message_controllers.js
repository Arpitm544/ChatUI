const express = require('express');
const router = express.Router();
const Message = require('../model/message_schema');
const User = require('../model/user_schema');
const cloudinary = require('../lib/cloudinary.js');
const {io, getReceiverSocketId } = require('../lib/socket');

router.get('/', async   (req, res) => {
    try {
    const loggedInUserId = req.user.id;
    const filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select('-password');

    res.status(200).json(filteredUsers);
    } catch (error) {
        res.status(500).json({message:"Internal server error"});
    }
});

router.get('/:id', async (req, res) => {
    try {
        const {id:userToChatId} = req.params;
        const senderId = req.user.id

        const messages = await Message.find({
            $or: [
                { senderId:senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId }
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/:id', async (req, res) => {
    try {
        const {text, image } = req.body;
        const {id:receiverId} = req.params
        const senderId = req.user.id

        let imageUrl;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        });
        await newMessage.save();
        
      const receiverSocketId=getReceiverSocketId(receiverId)
      if(receiverSocketId){
        io.to(receiverSocketId).emit('newmessage',newMessage);
      } 
        res.status(201).json(newMessage);
    }   catch (error) {                             
        res.status(500).json({ message: "Internal server error" });
    }
}); 

module.exports = router;