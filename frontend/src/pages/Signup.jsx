import axios from '../lib/axios'
import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import Switch from '../components/Switch'
import ChatApp from '../components/ChatApp'

const Signup = () => {
        const [name,setName]=useState("")
        const [username,setUserName]=useState('')
        const [email,setEmail]=useState('')
        const [password,setPassword]=useState('')
        const [error,setError]=useState({
            name:"",
            username:"",
            email:'',
            password:"",
            allfield:""
        })

        const navigate=useNavigate()
    
        useEffect(() => {
            const checkAuth = async () => {
                try {
                    await axios.get("/user/check-auth")
                    navigate("/chat", { replace: true });
                } catch (error) {
                    // Not authenticated, stay on signup page
                }
            }
            checkAuth();
        }, [navigate]);

    const handle= async(e)=>{
          e.preventDefault()

          // check all fields on direct submit
          if (!name||!username||!email||!password) {
            setError((prev) => ({
              ...prev,
              allfield: "Please enter all fields"
            }))
            return
          }
          else{
            setError((prev)=>({...prev,allfield:""}))
          }
          
          // clear the allfield error if fields are filled
          setError((prev) => ({
            ...prev,
            allfield: ""
          })) 

            try{
            const res=await axios.post("/user/signup",{
                name,
                username,
                email,
                password
            })
              
             if (res.data.success) {
      localStorage.setItem("userId", res.data.user.id)
      localStorage.setItem("username", res.data.user.username)
             }
            alert("Signup Successful")

            setTimeout(()=>{
                navigate('/chat', {replace:true })
            },1500)



        } catch (error) {
            console.log(error)
        }
    }
    const namehandle=(e)=>{
       const val=e.target.value
        setName(val)

        //this updates only the name error without removing other errors
        setError((prev)=>({
            ...prev,
            name:!val.trim()?"Please enter the name":""
        }))
    }

    const usernamehandle=(e)=>{
        const val=e.target.value
        setUserName(val.toLowerCase())

        setError((prev)=>({
            ...prev,
            username:!val.trim()?"Please enter a username":""
        }))
    }

    const emailhandle=(e)=>{
        const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const val=e.target.value
        setEmail(val.toLowerCase())
        
        setError((prev)=>({
            ...prev,
            email:!val.trim()?"Please enter the email":!regex.test(val)?"Please enter valid email":""
        }))
    } 
   
    const passwordhandle=(e)=>{
        const val=e.target.value
        setPassword(val)

        setError((prev)=>({
            ...prev,
            password:!val.trim()?"Please enter a password":val.length<6?"Password minimum length is 6":""
        }))
    }
    
  return (
    <div className='flex justify-center items-center w-full h-screen bg-gradient-to-br from-blue-500 to-purple-600'>
        <div className='border border-white/30 bg-white/30 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-96 cursor-pointer' >
            <h2 className='text-2xl font-bold text-center mb-4 text-gray-800'>Welcome to ChatUI</h2>
            <p className='text-red-600 text-center'>{error.allfield}</p>
        <form className='flex flex-col gap-3 w-full' onSubmit={handle}>
        <input type='text' placeholder='Enter your Name' onChange={namehandle} className='p-3 border border-gray-300 rounded  transition'/>
        <p className='text-red-500 text-sm ml-1'>{error.name}</p>
        <input type='text' placeholder='Enter your Username' onChange={usernamehandle} className='p-3 border border-gray-300 rounded  transition'/>
        <p className='text-red-500 text-sm ml-1'>{error.username}</p>
        <input type='text' placeholder='Enter your Email' onChange={emailhandle} className='p-3 border border-gray-300 rounded transition'/>
        <p className='text-red-500 text-sm ml-1'>{error.email}</p>
        <input type='password' placeholder='Enter your Password' onChange={passwordhandle} className='p-3 border border-gray-300 rounded transition'/>
        <p className='text-red-500 text-sm ml-1'>{error.password}</p>
      <button className='bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg w-full font-semibold transition' type='submit'>Signup</button>
        </form>
        <Switch type="signup"/>
        </div>
    </div>
  )
}

export default Signup