const mongoose=require('mongoose')


const GroupMessageSchema=new mongoose.Schema({
    groupId:{
       type:String,
       require:true
    },
    senderId:{
       type:String,
        require:true
    },
    senderUserName:{
        type:String,
        require:true
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
const Groupmessage=mongoose.model("groupmessage",GroupMessageSchema)
module.exports=Groupmessage;