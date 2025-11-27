const mongoose=require('mongoose');
const GroupSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    createdAt:{
        type:Date,
        default:Date.now,
    },
    profilePic:{
        type:String,
        default:"",
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports=mongoose.model('Group',GroupSchema); 