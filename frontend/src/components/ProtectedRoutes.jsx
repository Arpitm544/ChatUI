import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoutes = () => {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get(`${import.meta.env.VITE_BACKEND_URL}/check-auth`, {
                    withCredentials: true
                });
                setAuth(true);
            } catch (error) {
                setAuth(false);
            }
        };

        checkAuth();
    }, []);

    if (auth === null) return <p>Loading...</p>;

    return auth ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoutes