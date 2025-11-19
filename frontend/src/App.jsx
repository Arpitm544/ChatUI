import React from 'react'
import Axios from 'axios'
import { useEffect } from 'react'
import Signup from './pages/Signup'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Logout from './pages/Logout'
import Home from './pages/home'
import ProtectedRoutes from './components/ProtectedRoutes'
const App = () => {
   
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<Signup/>}/>
    <Route path='/signup' element={<Signup/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route element={<ProtectedRoutes/>}>
    <Route path='/home' element={<Home/>}/>
    </Route>
   </Routes>
   </BrowserRouter>
  )
}

export default App