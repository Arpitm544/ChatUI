import React, { useState } from 'react'
import { Settings, LogOut, Trash2, MessageSquare } from 'lucide-react'
import { useChat } from '../context/ChatContext'

const Navbar = () => {
  const { handleLogout, handleDeleteAccount } = useChat()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 p-4 flex justify-between items-center h-16">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Chat App</h1>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
        >
           <Settings className="w-6 h-6" />
        </button>

        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50 overflow-hidden">
              <button
                onClick={() => {
                  handleLogout()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white w-full text-left transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
              <button
                onClick={() => {
                  handleDeleteAccount()
                  setShowMenu(false)
                }}
                className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
