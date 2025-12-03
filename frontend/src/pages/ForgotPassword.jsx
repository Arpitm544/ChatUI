import React, { useState } from 'react';
import axios from '../lib/axios';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [securityCode, setSecurityCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await axios.post("/user/forgot-password", {
                email,
                securityCode,
                newPassword
            });

            if (res.data.success) {
                setMessage(res.data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className='flex justify-center items-center w-full h-screen bg-gray-100'>
            <div className='border border-gray-300 bg-white p-8 rounded-xl shadow-2xl w-96'>
                <h2 className='text-2xl font-bold text-center mb-4 text-gray-800'>Reset Password</h2>
                <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-full'>
                    <input
                        type='email'
                        placeholder='Enter your email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='p-2 border border-gray-400 rounded w-full'
                        required
                    />
                    <input
                        type='text'
                        placeholder='Enter 4-digit security code'
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value)}
                        className='p-2 border border-gray-400 rounded w-full'
                        required
                    />
                    <input
                        type='password'
                        placeholder='Enter new password'
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className='p-2 border border-gray-400 rounded w-full'
                        required
                        minLength={6}
                    />
                    
                    {error && <p className='text-red-600 text-sm text-center'>{error}</p>}
                    {message && <p className='text-green-600 text-sm text-center'>{message}</p>}

                    <button
                        type='submit'
                        className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded w-full cursor-pointer transition duration-200'
                    >
                        Reset Password
                    </button>
                </form>
                <div className='mt-4 text-center'>
                    <Link to="/login" className='text-blue-600 hover:underline text-sm'>Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
