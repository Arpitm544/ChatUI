const mongoose=require('mongoose')

const connectDB = async()=>{
    try{
    await mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,  
    })
    console.log("MongoDB connected succesfully")
}
catch(error){
    console.log("MongoDB Connection error", error)
}
}

module.exports=connectDB
