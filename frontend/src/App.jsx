import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ProtectedRoutes from './components/ProtectedRoutes'
import ChatApp from './components/ChatApp'


const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path='/' element={<Signup />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />

        <Route element={<ProtectedRoutes />}>
          <Route path='/chat' element={<ChatApp />} />   
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;