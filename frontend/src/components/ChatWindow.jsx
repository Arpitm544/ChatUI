import React, { useState, useEffect, useRef } from 'react'
import GroupInfoModal from './GroupInfoModal'
import { Send, Image as ImageIcon, MoreVertical, ArrowLeft, Check, CheckCheck, Edit2, Trash2, X } from 'lucide-react'
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
    handleUpdateGroup,
    typingUsers,
    handleTyping,
    handleStopTyping,
    markMessagesAsRead,
    handleEditMessage,
    handleDeleteMessage
  } = useChat()
  
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editText, setEditText] = useState("")
  const typingTimeoutRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark messages as read when chat opens or new messages arrive
  useEffect(() => {
      if (selectedUser && messages.length > 0) {
          const unreadMessages = messages.some(m => m.senderId === selectedUser && m.status !== 'read')
          if (unreadMessages) {
              markMessagesAsRead(null, selectedUser)
          }
      }
  }, [selectedUser, messages, markMessagesAsRead])

  const handleInputChange = (e) => {
      setText(e.target.value)
      
      if (!typingTimeoutRef.current) {
          if (selectedUser) handleTyping(null, selectedUser)
          else if (selectedGroup) handleTyping(selectedGroup._id, null)
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

      typingTimeoutRef.current = setTimeout(() => {
          if (selectedUser) handleStopTyping(null, selectedUser)
          else if (selectedGroup) handleStopTyping(selectedGroup._id, null)
          typingTimeoutRef.current = null
      }, 2000)
  }

  const startEditing = (msg) => {
      setEditingMessageId(msg._id)
      setEditText(msg.text)
  }

  const cancelEditing = () => {
      setEditingMessageId(null)
      setEditText("")
  }

  const submitEdit = (msgId) => {
      if (editText.trim()) {
          handleEditMessage(msgId, editText)
          setEditingMessageId(null)
          setEditText("")
      }
  }

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
            {users.find((u) => u._id === selectedUser)?.profilePic ? (
              <img 
                src={users.find((u) => u._id === selectedUser)?.profilePic} 
                alt="profile" 
                className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-slate-800" 
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold ring-2 ring-slate-800">
                {users.find((u) => u._id === selectedUser)?.name?.[0] || '?'}
              </div>
            )}
            <div className="flex flex-col">
               <span className="font-bold text-lg text-slate-100 leading-tight">
                {users.find((u) => u._id === selectedUser)?.name || 'Chat'}
              </span>
              {typingUsers[selectedUser] && (
                  <span className="text-xs text-blue-400 animate-pulse">Typing...</span>
              )}
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
            <div className={`${getMessageBubbleClass(m)} relative group`}>
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
              
              {editingMessageId === m._id ? (
                  <div className="flex flex-col gap-2">
                      <input 
                          value={editText} 
                          onChange={(e) => setEditText(e.target.value)}
                          className="bg-slate-700 text-white p-1 rounded text-sm w-full"
                      />
                      <div className="flex gap-2 justify-end">
                          <button onClick={cancelEditing} className="text-xs text-red-400"><X size={14}/></button>
                          <button onClick={() => submitEdit(m._id)} className="text-xs text-green-400"><Check size={14}/></button>
                      </div>
                  </div>
              ) : (
                  <>
                    {m.text && <p className="leading-relaxed">{m.text}</p>}
                    {m.isEdited && <span className="text-[9px] text-slate-400 block text-right italic">edited</span>}
                  </>
              )}

              <div className="flex items-center justify-end gap-1 mt-1">
                <p className={`text-[10px] ${m.senderId === loggedInUserId ? 'text-blue-100' : 'text-slate-400'}`}>
                    {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                {m.senderId === loggedInUserId && (
                    <span className="text-blue-100">
                        {m.status === 'read' ? <CheckCheck size={14} className="text-blue-200" /> : 
                         m.status === 'delivered' ? <CheckCheck size={14} className="text-slate-400" /> :
                         <Check size={14} className="text-slate-400" />}
                    </span>
                )}
              </div>

              {/* Message Actions (Edit/Delete) - Only for own messages */}
              {m.senderId === loggedInUserId && !editingMessageId && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 hidden group-hover:flex bg-slate-800 rounded-lg shadow-lg p-1 gap-1 z-10">
                      <button onClick={() => startEditing(m)} className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-blue-400">
                          <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDeleteMessage(m._id)} className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-red-400">
                          <Trash2 size={12} />
                      </button>
                  </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
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
            onChange={handleInputChange}
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
