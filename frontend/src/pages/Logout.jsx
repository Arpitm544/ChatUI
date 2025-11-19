import axios from 'axios'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
   const navigate=useNavigate()
    const handle=async(e)=>
    {
        e.preventDefault()
        try{
        const res=await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/logout`,{
            withCredentials:true
        })
        navigate('/login')
        console.log("Loout successful")
    }
    catch(error){
        console.log(error)
    }
    }
  return (
    <div>
        <form onSubmit={handle}>
            <button type='submit'>Logout</button>
        </form>
    </div>
  )
}

export default Logout