import React, { useState } from 'react'

import imageCompression from 'browser-image-compression'
import { X, Camera, Edit2, Trash2, User, Check, ArrowLeft } from 'lucide-react'

const GroupInfoModal=({ group, onClose, onDeleteGroup, currentUserId, onUpdateGroup, users = [] }) => {
  const isAdmin = group.admin === currentUserId
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(group.name)
  const [editedImage, setEditedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(group.profilePic)
  const [selectedMembers, setSelectedMembers] = useState(group.members.map(m => m._id))
  const [isLoading, setIsLoading] = useState(false)

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 880,
    })

    const reader = new FileReader()
    reader.readAsDataURL(compressed)
    reader.onloadend = () => {
      setEditedImage(reader.result)
      setPreviewImage(reader.result)
    }
  }

  const handleToggleMember = (userId) => {
    if (userId === currentUserId) return // Cannot remove self/admin
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId))
    } else {
      setSelectedMembers([...selectedMembers, userId])
    }
  }

  const handleSave = async () => {
    if (!editedName.trim()) return
    setIsLoading(true)
    try {
      await onUpdateGroup(group._id, editedName, editedImage, selectedMembers)
      setIsEditing(false)
    } catch (error) {
      console.log("Error updating group:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <h2 className="text-lg font-bold text-slate-100">{isEditing ? 'Edit Group' : 'Group Info'}</h2>
          </div>
          
          <div className="flex gap-2">
            {isAdmin && !isEditing && (
              <button 
                onClick={() => {
                  setIsEditing(true)
                  setSelectedMembers(group.members.map(m => m._id))
                }} 
                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors"
                title="Edit Group"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Group Details */}
        <div className="p-6 flex flex-col items-center bg-slate-900">
          <div className="relative group">
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-slate-800 shadow-lg">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  className="h-full w-full object-cover"
                  alt="Group"
                />
              ) : (
                <div className="h-full w-full bg-slate-800 flex items-center justify-center text-slate-500 text-4xl font-bold">
                  {group.name[0]}
                </div>
              )}
            </div>
            
            {isEditing && (
              <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-500 shadow-md transition-transform hover:scale-105">
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                <Camera className="w-4 h-4" />
              </label>
            )}
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="mt-4 border-b-2 border-slate-700 focus:border-blue-500 outline-none px-2 py-1 text-center font-bold text-xl w-full bg-transparent transition-colors text-slate-100"
              placeholder="Group Name"
              autoFocus
            />
          ) : (
            <div className="text-center mt-3">
              <h3 className="text-2xl font-bold text-slate-100">{group.name}</h3>
              <p className="text-slate-400 text-sm mt-1">{group.members.length} members</p>
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto bg-slate-950 border-t border-slate-800 custom-scrollbar">
          <div className="p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
              {isEditing ? 'Manage Members' : 'Members'}
            </h4>
            
            <div className="space-y-1">
              {isEditing ? (
                // Edit Mode: Show all users with checkboxes
                users.map((user) => {
                  const isSelected = selectedMembers.includes(user._id)
                  const isMe = user._id === currentUserId
                  
                  const userItemClass = isSelected 
                    ? 'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all bg-blue-600/10 border border-blue-500/30'
                    : 'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-900 border border-transparent'

                  const checkboxClass = `w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-600 bg-slate-800'
                      } ${isMe ? 'opacity-50 cursor-not-allowed' : ''}`

                  return (
                    <div 
                      key={user._id} 
                      className={userItemClass}
                      onClick={() => !isMe && handleToggleMember(user._id)}
                    >
                      <div className={checkboxClass}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      
                      <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                        {user.profilePic ? (
                          <img src={user.profilePic} className="h-full w-full object-cover" alt={user.name} />
                        ) : (
                          <span className="text-slate-400 font-medium">{user.name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <span className={`font-medium ${isSelected ? 'text-blue-400' : 'text-slate-300'}`}>
                          {user.name} {isMe && '(You)'}
                        </span>
                      </div>
                      
                      {user._id === currentUserId && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-medium border border-blue-500/20">Admin</span>
                      )}
                    </div>
                  )
                })
              ) : (
                // View Mode: Show only group members
                group.members.map((member) => (
                  <div key={member._id} className="flex items-center gap-3 p-3 hover:bg-slate-900 rounded-xl transition-colors group">
                    <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                      {member.profilePic ? (
                        <img src={member.profilePic} className="h-full w-full object-cover" alt={member.name} />
                      ) : (
                        <span className="text-slate-400 font-medium">{member.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-200 font-medium">{member.name}</span>
                    </div>
                    {group.admin === member._id && (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-medium border border-blue-500/20">Admin</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          {isEditing ? (
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setIsEditing(false)
                  setEditedName(group.name)
                  setPreviewImage(group.profilePic)
                  setEditedImage(null)
                  setSelectedMembers(group.members.map(m => m._id))
                }} 
                className="flex-1 h-12 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 font-medium transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 h-12 bg-blue-600 text-white rounded-xl hover:bg-blue-500 font-medium shadow-lg shadow-blue-900/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" /> Save Changes
                  </>
                )}
              </button>
            </div>
          ) : (
            isAdmin && (
              <button 
                onClick={() => onDeleteGroup(group._id)} 
                className="w-full h-12 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-5 h-5" /> Delete Group
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupInfoModal
