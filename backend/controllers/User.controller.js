const express=require('express')
const bcrypt=require('bcryptjs')
const User=require('../model/User_schema')
const jwt=require("jsonwebtoken")
const authmiddleware = require('../middleware/authMiddleware')
const  cloudinary = require("../lib/cloudinary.js")
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

    const securityCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newUser=new User({name,username,email,password:hashpassword, securityCode})
    await newUser.save()
    
    const token=jwt.sign(
        {id:newUser._id},process.env.JWT_SECRETKEY,{expiresIn:'7d'}
    )
    res.cookie("token",token,
        {httpOnly:true,secure:true,sameSite:'none',maxAge:7*24*60*60*1000})
        .status(200)
        .json({success:true,message:"User is Signup successful",
            user:
            {id:newUser.id,name:newUser.name,username:newUser.username,email:newUser.email, profilePic: newUser.profilePic, securityCode: newUser.securityCode}})
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
        {httpOnly:true,secure:true,sameSite:'none',maxAge:7*24*60*60*1000})
        .status(200).
        json({success:true,message:"Login Successful",
            user:{id:user.id,name:user.name,username:user.username,email:user.email, profilePic: user.profilePic, securityCode: user.securityCode}})
    }
    
    catch(error){
        console.log("Login Error:", error)
        res.status(500).json({message:"Server error"})
    }
})

router.post('/forgot-password', async (req, res) => {
    try {
        const { email, securityCode, newPassword } = req.body;

        if (!email || !securityCode || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.securityCode !== securityCode) {
            return res.status(400).json({ message: "Invalid security code" });
        }

        const hashpassword = await bcrypt.hash(newPassword, 10);
        user.password = hashpassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successful" });

    } catch (error) {
        console.log("Forgot Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
})

router.get('/check-auth',authmiddleware,async(req,res)=>{
      return res.status(200).json({authenticated:true,user:req.user})
})

router.get('/search', authmiddleware, async (req, res) => {
  try {
    const name = req.query.name
    const loggedInUser= req.user

    const users = await User.find({
      name: { $regex: name}
    }).select("-password").select('-loggedInUser')

    res.json({ success: true, users })
  } catch (error) {
    console.log("Search Error:", error)
    res.status(500).json({ message: "Server error" })
  }
})


router.put('/update-profile', authmiddleware, async (req, res) => {
  try {
    const { profilePic, name } = req.body
    const userId = req.user.id

    const updateData = {}
    if (name) updateData.name = name

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic)
      updateData.profilePic = uploadResponse.secure_url
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password")
    
    res.status(200).json(updatedUser)
  } catch (error) {
    console.log("error in update profile:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

router.delete('/logout',authmiddleware,async (req,res)=>{
    try {
        res.clearCookie("token").status(200).json({success:true,message:"Logout successful"})
    } catch (error) {
        console.log("Logout Error:", error)
        return res.status(500).json({message:"Server error"})
    }
})

router.delete('/delete', authmiddleware, async (req, res) => {
    try {
        const userId = req.user.id
        await User.findByIdAndDelete(userId)
        res.clearCookie("token").status(200).json({ success: true, message: "Account deleted successfully" })
    } catch (error) {
        console.log("Delete Account Error:", error)
        res.status(500).json({ message: "Server error" })
    }
})

module.exports=router