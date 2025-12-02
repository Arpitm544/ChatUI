import React, { useState } from 'react'
import { Settings, LogOut, Trash2, MessageSquare, User, Camera, X } from 'lucide-react'
import { useChat } from '../context/ChatContext'
import imageCompression from 'browser-image-compression'

const Navbar = () => {
  const { handleLogout, handleDeleteAccount, me, handleUpdateProfile } = useChat()
  const [showMenu, setShowMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [previewImage, setPreviewImage] = useState(null)

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 880,
      })

      const reader = new FileReader()
      reader.readAsDataURL(compressed)
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSaveProfile = async () => {
    setIsUploading(true)
    try {
      await handleUpdateProfile({
        name: editedName,
        profilePic: previewImage
      })
      setShowProfileModal(false)
    } catch (error) {
      console.log(error)
    } finally {
      setIsUploading(false)
    }
  }

  const openProfileModal = () => {
    setEditedName(me?.name || '')
    setPreviewImage(me?.profilePic || null)
    setShowProfileModal(true)
    setShowMenu(false)
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 p-4 flex justify-between items-center h-16">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Chat App</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {me?.profilePic ? (
            <img 
              src={me.profilePic} 
              alt={me.name} 
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-800"
            />
          ) : (
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center ring-2 ring-slate-800">
              <User className="w-4 h-4 text-slate-300" />
            </div>
          )}
          <span className="text-sm font-medium text-slate-200 hidden sm:block">
            {me?.name}
          </span>
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
                onClick={openProfileModal}
                className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white w-full text-left transition-colors"
              >
                <User className="w-4 h-4" /> Profile
              </button>
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
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-bold text-white">Edit Profile</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-slate-800 bg-slate-800 flex items-center justify-center">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-slate-500" />
                  )}
                </div>
                
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full cursor-pointer shadow-lg transition-all active:scale-95">
                  <Camera className="w-5 h-5" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                    disabled={isUploading}
                  />
                </label>
              </div>

              <div className="w-full space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Display Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-slate-400 text-sm">@{me?.username}</p>
                  <p className="text-slate-500 text-sm">{me?.email}</p>
                  <p className="text-slate-500 text-sm mt-1">Security Code: <span className="font-mono font-bold text-slate-300">{me?.securityCode}</span></p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isUploading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
