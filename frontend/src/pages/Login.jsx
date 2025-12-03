import axios from '../lib/axios'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Switch from '../components/Switch'

const Login = () => {
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [error,setError]=useState({
        email,
        password
    })

    const navigate=useNavigate()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get("/user/check-auth")
                navigate("/chat", { replace: true });
            } catch (error) {
                console.log(error)
            }
        }
        checkAuth();
    }, [navigate]);

    
    const handlelogin=async(e)=>{
       e.preventDefault()
    
       try{
       const res=await axios.post("/user/login",{
        email,
        password,
       })
          
        if (res.data.success) {

      localStorage.setItem("userId", res.data.user.id)
      localStorage.setItem("username", res.data.user.username)
        }
        
       navigate('/chat', {replace:true })
    }
    catch(error){
        console.log(error)
    }
}

    const emailhandle=(e)=>{
        const val=e.target.value
        setEmail(val)

        setError((prev)=>({
            ...prev,
            email:!val.trim()?"Please enter the email":""
        }))
    }
  
     const passwordhandle=(e)=>{
        const val=e.target.value
        setPassword(val)

        setError((prev)=>({
            ...prev,
            password:!val.trim()?"Please enter the password":""
        }))
    }

  return (
    <div className='flex justify-center items-center w-full h-screen bg-gradient-to-br from-blue-500 to-purple-600'>
         <div className='border border-white/30 bg-white/30 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-96'>
            <h2 className='text-2xl font-bold text-center mb-4 text-gray-800'>Welcome to ChatUI</h2>
      <form onSubmit={handlelogin} className='flex flex-col gap-3 w-full'>
        <input 
          type='text' 
          placeholder='Enter your email' 
          onChange={emailhandle}
          className='p-2 border border-gray-400 rounded w-full '
        />
        <p className='text-red-600 text-sm'>{error.email}</p>
        <input 
          type='password' 
          placeholder='Enter your password' 
          onChange={passwordhandle}
          className='p-2 border border-gray-400 rounded w-full '
        />
        <p className='text-red-600 text-sm'>{error.password}</p>
        <button 
          type='submit'
          className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded w-full cursor-pointer'
        >
          Login
        </button>
      </form>
      <div className='mt-2 text-right'>
        <a href="/forgot-password" className='text-blue-600 text-sm hover:underline'>Forgot Password?</a>
      </div>
      <Switch type="login" className='mt-3'/>
      </div>
    </div>
  )
}

export default Login