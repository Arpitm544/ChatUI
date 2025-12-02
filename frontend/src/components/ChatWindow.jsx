import React, { useState } from 'react'
import GroupInfoModal from './GroupInfoModal'
import { Send, Image as ImageIcon, MoreVertical, ArrowLeft } from 'lucide-react'
import { useChat } from '../context/ChatContext'

const ChatWindow = () => {
  const { 
    selectedUser, 
    selectedGroup, 
    messages, 
    loggedInUserId, 
    users, 
    text, 
    setText, 
    handleImageUpload, 
    sendMessage, 
    handleDeleteGroup, 
    handleUpdateGroup 
  } = useChat()
  
  const [showGroupInfo, setShowGroupInfo] = useState(false)

  const getMessageContainerClass = (msg) => {
    return msg.senderId === loggedInUserId 
      ? 'flex mb-4 justify-end' 
      : 'flex mb-4 justify-start'
  }

  const getMessageBubbleClass = (msg) => {
    return msg.senderId === loggedInUserId 
      ? 'p-3 rounded-2xl max-w-xs bg-blue-600 text-white shadow-md rounded-br-none' 
      : 'p-3 rounded-2xl max-w-xs bg-slate-800 text-slate-200 shadow-md rounded-bl-none border border-slate-700'
  }

  return (
    <div className="flex flex-col flex-1 bg-slate-950 relative">
      {showGroupInfo && selectedGroup && (
        <GroupInfoModal
          group={selectedGroup}
          onClose={() => setShowGroupInfo(false)}
          onDeleteGroup={handleDeleteGroup}
          currentUserId={loggedInUserId}
          onUpdateGroup={handleUpdateGroup}
          users={users}
        />
      )}

      {/* HEADER */}
      <div className="p-4 bg-slate-900 shadow-sm flex items-center justify-between border-b border-slate-800 z-10">
        {selectedGroup ? (
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors"
            onClick={() => setShowGroupInfo(true)}
          >
            {selectedGroup.profilePic ? (
              <img src={selectedGroup.profilePic} alt={selectedGroup.name} className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-slate-800" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg ring-2 ring-slate-800">
                {selectedGroup.name[0]}
              </div>
            )}
            <div>
              <span className="font-bold text-slate-100 block leading-tight">{selectedGroup.name}</span>
              <span className="text-xs text-slate-400">{selectedGroup.members.length} members</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold ring-2 ring-slate-800">
              {users.find((u) => u._id === selectedUser)?.name?.[0] || '?'}
            </div>
            <div className="flex flex-col">
               <span className="font-bold text-lg text-slate-100 leading-tight">
                {users.find((u) => u._id === selectedUser)?.name || 'Chat'}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-slate-400">
           <MoreVertical className="w-5 h-5 cursor-pointer hover:text-blue-500 transition-colors" />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-6 overflow-y-auto space-y-2 custom-scrollbar bg-slate-950">
        {messages.map((m, i) => (
          <div
            key={i}
            className={getMessageContainerClass(m)}
          >
            <div className={getMessageBubbleClass(m)}>
              {/* Show sender name in group chat if not me */}
              {selectedGroup && m.senderId !== loggedInUserId && (
                <p className="text-xs text-blue-400 font-bold mb-1">
                  {users.find((u) => u._id === m.senderId)?.name}
                </p>
              )}
              {m.image && (
                <img
                  src={m.image}
                  alt="sent-img"
                  className="max-w-[200px] rounded-lg mb-2 border border-white/10"
                />
              )}
              {m.text && <p className="leading-relaxed">{m.text}</p>}
              <p className={`text-[10px] mt-1 text-right ${m.senderId === loggedInUserId ? 'text-blue-100' : 'text-slate-400'}`}>
                {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT BAR */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
        <label className="cursor-pointer p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <ImageIcon className="w-6 h-6" />
        </label>

        <div className="flex-1 relative">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-3 bg-slate-800 border-none rounded-full focus:ring-2 focus:ring-blue-600 focus:outline-none pl-4 pr-10 text-slate-200 placeholder-slate-500"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
        </div>

        <button
          onClick={sendMessage}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 shadow-lg shadow-blue-900/30 transition-transform active:scale-95 flex items-center justify-center"
          disabled={!text.trim() && !handleImageUpload} 
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ChatWindow
