import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoutes = () => {
    const [auth,setAuth]=useState(null)

    useEffect(()=>{
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/check-auth`,{
            withCredentials:true
        })
        .then(()=>{
            setAuth(true)
        })
        .catch(()=>{
            setAuth(false)
        })
    },[])
   if(auth===null)
    return <p>Loding...</p>

   return auth?<Outlet/>:<Navigate to='/login'/>
}

export default ProtectedRoutes