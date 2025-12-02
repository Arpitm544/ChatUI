import React from 'react'
import Search from './Search'
import { Users, Plus, User } from 'lucide-react'
import { GroupItem, UserItem } from './SidebarItems'
import { useChat } from '../context/ChatContext'
import { useNavigate, useParams } from 'react-router-dom'

const ChatSidebar = () => {
  const { 
    me, 
    users, 
    groups, 
    onlineUsers, 
    setShowCreateGroupModal 
  } = useChat()

  const navigate = useNavigate()
  const { type, id } = useParams()

  const handleSelectUser = (userId) => {
    navigate(`/chat/user/${userId}`)
  }

  return (      
    <div className="w-80 bg-slate-900 flex flex-col border-r border-slate-800 relative">
      {/* Header */}
      <div className="p-6 pb-4">


        <div className="flex items-center gap-3 text-slate-400 mb-6 px-3 py-2 bg-slate-800/50 rounded-xl border border-slate-800">
          {me?.profilePic ? (
            <img src={me.profilePic} alt={me.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-800" />
          ) : (
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center ring-2 ring-slate-800">
              <User className="w-4 h-4 text-slate-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-semibold text-slate-200 truncate">{me?.name}</p>
          </div>
        </div>

        <Search onSelectUser={handleSelectUser} />
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
                <GroupItem 
                  key={g._id}
                  group={g}
                  isActive={type === 'group' && id === g._id}
                  onClick={() => navigate(`/chat/group/${g._id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* USERS LIST */}
        <div>
          <h3 className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-4 px-2">Direct Messages</h3>
          <div className="space-y-1">
            {users.map((u) => (
              <UserItem 
                key={u._id}
                user={u}
                isActive={type === 'user' && id === u._id}
                isOnline={onlineUsers.includes(u._id)}
                onClick={() => navigate(`/chat/user/${u._id}`)}
              />
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
