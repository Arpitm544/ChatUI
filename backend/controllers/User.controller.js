const express=require('express')
const bcrypt=require('bcryptjs')
const User=require('../model/user_schema')
const jwt=require("jsonwebtoken")
const authmiddleware = require('../middleware/autMiddleware')
const  cloudinary = require("../lib/cloudinary.js");
const router=express.Router()


router.post('/signup',async (req,res)=>{
    try{

    const {name,username,email,password}=req.body

   if(!name||!username||!email||!password){
     return res.status(400).json({message:"All the field is require to fill"})
   }

    const existinguser=await User.findOne({email})
    if(existinguser){
        return res.status(400).json({message:"User is already registered"})
    }
   
    const hashpassword=await bcrypt.hash(password,10)

    const newUser=new User({name,username,email,password:hashpassword})
    await newUser.save()
    
    const token=jwt.sign(
        {id:newUser._id},process.env.JWT_SECRETKEY,{expiresIn:'7d'}
    )
    res.cookie("token",token,
        {httpOnly:true,secure:false,sameSite:"lax",maxAge:7*24*60*60*1000})
        .status(200)
        .json({success:true,message:"User is Signup successful",
            user:
            {id:newUser.id,name:newUser.name,username:newUser.username,email:newUser.email}})
}
    catch(error){
        console.log("Singup Error:", error)
        res.status(500).json({message:"Server error"})
    }
})

router.post('/login',async (req,res)=>{
    try{
     const {email,password}=req.body

     if(!email||!password){
        return res.status(400).json({message:"Both filled is require"})
     }
     const user=await User.findOne({email})

     if(!user){
        return res.status(404).json({message:"User not found please check email"})
     }

     const matchpassword=await bcrypt.compare(password,user.password)
   
     if(!matchpassword){
        return res.status(401).json({message:"Invalid password try again"})
     }
     const token=jwt.sign({id:user._id},process.env.JWT_SECRETKEY,{expiresIn:'7d'})
    
     res.cookie("token",token,
        {httpOnly:true,secure:false,sameSite:"lax",maxAge:7*24*60*60*1000})
        .status(200).
        json({success:true,message:"Login Successful",
            user:{id:user.id,name:user.name,username:user.username,email:user.email}})
    }
    
    catch(error){
        console.log("Login Error:", error)
        res.status(500).json({message:"Server error"})
    }
})

router.get('/check-auth',authmiddleware,async(req,res)=>{
      return res.status(200).json({authenticated:true,user:req.user})
})

router.get('/all',async(req,res)=>{
    const user=await User.find().select("-password")
    res.status(200).json({message:"Get all user",user})
})

// router.put('/update-profile', authmiddleware, async (req, res) => {
//   try {
//     const { profilePic } = req.body;
//     const userId = req.user._id;

//     if (!profilePic) {
//       return res.status(400).json({ message: "Profile pic is required" });
//     }

//     const uploadResponse = await cloudinary.uploader.upload(profilePic);
//     console.log("Cloudinary Upload Response:", uploadResponse);
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { profilePic: uploadResponse.secure_url },
//       { new: true }
//     );

//     console.log("body received:", req.body);
//     console.log("profilePic received:", req.body.profilePic);

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.log("error in update profile:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

router.delete('/logout',authmiddleware,async (req,res)=>{
    try {
        res.clearCookie("token").status(200).json({success:true,message:"Logout successful"})
    } catch (error) {
        console.log("Logout Error:", error)
        return res.status(500).json({message:"Server error"})
    }
})

module.exports=router