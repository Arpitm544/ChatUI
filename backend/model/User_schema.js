const mongoose=require('mongoose')

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    username:{
        type:String,
        require:true,
        unique:true
    },
    email:{
         type:String,
         require:true,
         unique:true,
         lowercase:true,

    },
    password:{
        type:String,
        require:true,
        minlength:6,
    },
    profilePic:{
        type:String,
        default:""
    },
    securityCode: {
        type: String,
        required: true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

module.exports = User

