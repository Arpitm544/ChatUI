const { text } = require('express')
const mongoose=require('mongoose')

const messageSchema=new mongoose.Schema({
    senderId:{
        type:String,
        required:true,
    },      
    receiverId:{
        type:String,
        default:null,
    },
     groupId: {
      type: String,   // for group chat
      default: null,
    },
    text:{
        type:String,
    },
    image:{
        type:String,
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    isEdited: {
        type: Boolean,
        default: false
    }
},{timestamps:true})

const Message=mongoose.model('Message',messageSchema)

module.exports=Message