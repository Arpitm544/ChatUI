const { text } = require('express')
const mongoose=require('mongoose')

const messageSchema=new mongoose.Schema({
    senderId:{
        type:String,
        required:true,
    },      
    receiverId:{
        type:String,
        required:true,
    },
    text:{
        type:String,
    },
    image:{
        type:String,
    },
},{timestamps:true})

const Message=mongoose.model('Message',messageSchema)

module.exports=Message