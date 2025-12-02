const jwt=require('jsonwebtoken')

const authmiddleware=(req,res,next)=>{
    // const authHeader=req.header("Authorization")
    
    const token=req.cookies.token

     if(!token){
        return res.status(401).json({message:"Access denied. No token provided."})
    }

    try {
        const decode=jwt.verify(token,process.env.JWT_SECRETKEY)
        req.user=decode
        next()

    } catch (error) {
        return res.status(400).json({message:"Invalid token"})
    }
}

module.exports=authmiddleware