import React, { useState } from 'react'

const Navbar = ({ onLogout, onDeleteAccount }) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <nav className="bg-blue-500 text-white p-4 flex justify-between items-center ">
      <h1 className="text-xl font-bold">Chat App</h1>
      
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-blue-600 rounded-full "
        >
           Settings ⚙️
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
            <button
              onClick={() => {
                onLogout()
              }}
              className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
            >
            🚪 Logout
            </button>
            <button
              onClick={() => {
                onDeleteAccount()
              }}
              className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-600"
            >
            🗑️ Delete Account
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
