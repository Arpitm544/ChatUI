import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoutes from './components/ProtectedRoutes'

// Lazy load components
const Signup = lazy(() => import('./pages/Signup'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ChatApp = lazy(() => import('./components/ChatApp'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-400">
    Loading...
  </div>
)

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>

          <Route path='/' element={<Signup />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />

          <Route element={<ProtectedRoutes />}>
            <Route path='/chat/*' element={<ChatApp />} />   
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App