import axios from 'axios'
import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import Switch from '../components/Switch'

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

    const handle= async(e)=>{
          e.preventDefault()

          // check all fields on direct submit
          if (!name||!username||!email||!password) {
            setError((prev) => ({
              ...prev,
              allfield: "Please enter all fields"
            }));
            return;
          }
          else{
            setError((prev)=>({...prev,allfield:""}))
          }
          
          // clear the allfield error if fields are filled
          setError((prev) => ({
            ...prev,
            allfield: ""
          }));

            try{
            const res=await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signup`,{
                name,
                username,
                email,
                password
            },{withCredentials:true})

            alert("Signup Successful")

            setTimeout(()=>{
                navigate('/home')
            },1500);

            console.log(res.data)

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
        const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    <div className='flex justify-center items-center w-full h-screen '>
        <div className='border border-gray-300 bg-white p-8 rounded-xl shadow-2xl w-96 cursor-pointer' >
            <p className='text-red-600 text-center'>{error.allfield}</p>
        <form className='flex flex-col gap-3 w-full' onSubmit={handle}>
        <input type='text' placeholder='Enter your Name' onChange={namehandle} className='p-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'/>
        <p className='text-red-600 '>{error.name}</p>
        <input type='text' placeholder='Enter your Username' onChange={usernamehandle} className='p-2 border border-gray-400 rounded  focus:outline-none focus:ring-2 focus:ring-blue-500'/>
        <p className='text-red-600 '>{error.username}</p>
        <input type='text' placeholder='Enter your Email' onChange={emailhandle} className='p-2 border border-gray-400 rounded  focus:outline-none focus:ring-2 focus:ring-blue-500'/>
        <p className='text-red-600 '>{error.email}</p>
        <input type='password' placeholder='Enter your Password' onChange={passwordhandle} className='p-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'/>
        <p className='text-red-600 '>{error.password}</p>
      <button className='bg-blue-600 hover:bg-blue-500 text-white py-2 rounded w-full cursor-pointer' type='submit'>Submit</button>
        </form>
        <Switch type="signup"/>
        </div>
    </div>
  )
}

export default Signup