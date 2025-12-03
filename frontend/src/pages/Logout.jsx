import axios from '../lib/axios'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
   const navigate=useNavigate()
    const handle=async(e)=>
    {
        e.preventDefault()
        try{
        await axios.delete("/user/logout")
        .then(() => {
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            navigate('/login')

        })
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