import React from 'react'
import Search from './Search'
import { Users, MessageSquare, Plus, User } from 'lucide-react'
import { useChat } from '../context/ChatContext'

const ChatSidebar = () => {
  const { 
    me, 
    users, 
    groups, 
    onlineUsers, 
    selectedUser, 
    selectedGroup, 
    loadUserMessages, 
    loadGroupMessages, 
    setShowCreateGroupModal 
  } = useChat()
  
  const getGroupClass = (g) => {
    return selectedGroup?._id === g._id 
      ? 'p-3 flex items-center gap-3 rounded-xl cursor-pointer mb-2 bg-blue-600/20 border-l-4 border-blue-500 transition-all' 
      : 'p-3 flex items-center gap-3 rounded-xl cursor-pointer mb-2 hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-200'
  }

  const getUserClass = (u) => {
    return selectedUser === u._id 
      ? 'p-3 flex items-center gap-3 rounded-xl cursor-pointer mb-2 bg-blue-600/20 border-l-4 border-blue-500 transition-all' 
      : 'p-3 flex items-center gap-3 rounded-xl cursor-pointer mb-2 hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-200'
  }

  const getOnlineStatusClass = (u) => {
    return onlineUsers.includes(u._id) 
      ? 'h-3 w-3 rounded-full bg-green-500 border-2 border-slate-900' 
      : 'h-3 w-3 rounded-full bg-slate-600 border-2 border-slate-900'
  }

  return (      
    <div className="w-80 bg-slate-900 flex flex-col border-r border-slate-800 relative">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Chat App</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400 mb-6 px-3 py-2 bg-slate-800/50 rounded-xl border border-slate-800">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
             <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-semibold text-slate-200 truncate">{me}</p>
          </div>
        </div>

        <Search onSelectUser={loadUserMessages} />
      </div>
      
      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 custom-scrollbar">
        {/* GROUPS LIST */}
        {groups.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-4 flex items-center gap-2 px-2">
              <Users className="w-3 h-3" /> Groups
            </h3>
            <div className="space-y-1">
              {groups.map((g) => (
                <div
                  key={g._id}
                  onClick={() => loadGroupMessages(g)}
                  className={getGroupClass(g)}
                >
                  {g.profilePic ? (
                    <img src={g.profilePic} alt={g.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-bold ring-2 ring-slate-800">
                      {g.name[0]}
                    </div>
                  )}
                  <span className="font-medium truncate">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS LIST */}
        <div>
          <h3 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-4 px-2">Direct Messages</h3>
          <div className="space-y-1">
            {users.map((u) => (
              <div
                key={u._id}
                onClick={() => loadUserMessages(u._id)}
                className={getUserClass(u)}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-medium ring-2 ring-slate-800">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <span className={`absolute bottom-0 right-0 ${getOnlineStatusClass(u)}`} />
                </div>
                <span className="font-medium truncate">{u.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Group
        </button>
      </div>
    </div>
  )
}
export default ChatSidebar
