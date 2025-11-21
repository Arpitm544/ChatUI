const mongoose=require('mongoose')
const Groupchema=new mongoose.Schema({
    name:{
        type:String,
          require:true
    },
    createBy:{
         type:String,
         require:true
    },
    members:[{ type: String }]
})

const group=new mongoose.model('room',Groupchema)
module.exports=group;
