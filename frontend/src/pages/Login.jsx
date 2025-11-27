import axios from 'axios'
import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Switch from '../components/Switch'
import ChatApp from '../components/ChatApp'


const Login = () => {
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [error,setError]=useState({
        email,
        password
    })

    const navigate=useNavigate()
    
    const handlelogin=async(e)=>{
       e.preventDefault()
    
       try{
       const res=await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`,{
        email,
        password,
       },{withCredentials:true})
          
        if (res.data.success) {

      localStorage.setItem("userId", res.data.user.id)
      localStorage.setItem("username", res.data.user.username)
        }
        
       navigate('/chat')
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
    <div className='flex justify-center items-center w-full h-screen'>
         <div className='border border-gray-300 bg-white p-8 rounded-xl shadow-2xl w-96'>
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
      <Switch type="login" className='mt-3'/>
      </div>
    </div>
  )
}

export default Login