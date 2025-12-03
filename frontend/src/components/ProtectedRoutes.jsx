import axios from '../lib/axios'
import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoutes = () => {
    const [auth, setAuth] = useState(null)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get("/user/check-auth")
                setAuth(true)
            } catch {
                localStorage.removeItem('token')
                localStorage.removeItem('userId')
                setAuth(false)
            }
        }
        checkAuth()
    }, [])

    if (auth === null) return <p>Loading...</p>

    return auth ? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoutes