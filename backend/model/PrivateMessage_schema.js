const mongoose=require('mongoose')

const PrivateMessageSchema=new mongoose.Schema({
    senderId:{
       type:String,
        require:true
    },
    senderUserName:{
        type:String,
        require:true
    },
    receiverId:{
        type:String,
        require:true
    },
    roomId:{
       type:mongoose.Schema.Types.ObjectId,
       ref:'Room',
       default:null
    },
    message:{
        type:String,
        require:true
    },
    timestamp:{
        type:Date,
        default:Date.now
    }
    
})
const Privatemessage=mongoose.model("privatemessage",PrivateMessageSchema)
module.exports=Privatemessage;