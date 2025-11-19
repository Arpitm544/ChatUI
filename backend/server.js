require('dotenv').config()
const express=require('express')
const cors=require('cors')
const cookieParser=require('cookie-parser')
const mongoose=require('mongoose')

const app=express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({origin:"http://localhost:5173",credentials:true}))

const userRoutes=require('./controllers/User.controller')
const connectDB = require('./db/mongoose')

connectDB()

app.use("/user",userRoutes)

app.listen(4000,()=>{
    console.log("server is running on port 4000")
})