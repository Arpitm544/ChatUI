import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../lib/axios'
import imageCompression from 'browser-image-compression'
import GroupInfoModal from './GroupInfoModal'
import MessageItem from './MessageItem'
import { Send, Image as ImageIcon, MoreVertical, ArrowLeft } from 'lucide-react'
import { useChat } from '../context/ChatContext'

const ChatWindow = () => {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const { 
    users, 
    groups, 
    loggedInUserId, 
    handleDeleteGroup, 
    handleUpdateGroup,
    socket
  } = useChat()
  
  // Local State
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [typingUsers, setTypingUsers] = useState({})
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editText, setEditText] = useState("")
  
  const typingTimeoutRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Derived State
  const selectedUser = type === 'user' ? users.find(u => u._id === id) : null
  const selectedGroup = type === 'group' ? groups.find(g => g._id === id) : null

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!id) return
      setMessages([]) // Clear previous messages
      try {
        let res
        if (type === 'user') {
          res = await axios.get(`/messages/${id}`)
        } else if (type === 'group') {
          res = await axios.get(`/groups/${id}`)
        }
        if (res) setMessages(res.data)
      } catch (error) {
        console.log("Error fetching messages:", error)
      }
    }
    fetchMessages()
  }, [type, id])

  // Socket Listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (msg) => {
      if (type !== 'user') return
      
      const isMyChat =
        (msg.senderId === loggedInUserId && msg.receiverId === id) ||
        (msg.senderId === id && msg.receiverId === loggedInUserId)

      if (isMyChat) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
        // Mark as read if window is open
        if (msg.senderId === id) {
            socket.emit("markMessagesAsRead", { chatId: null, userToChatId: id })
        }
      }
    }

    const handleNewGroupMessage = (msg) => {
      if (type !== 'group') return
      
      if (msg.senderId == loggedInUserId || msg.senderId?.toString() === loggedInUserId) return

      if (msg.groupId === id) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }
    }

    const handleTyping = ({ chatId, senderId }) => {
        if (type === 'user' && senderId === id) {
            setTypingUsers(prev => ({ ...prev, [senderId]: true }))
        } else if (type === 'group' && chatId === id && senderId !== loggedInUserId) {
            setTypingUsers(prev => ({ ...prev, [senderId]: true }))
        }
    }

    const handleStopTyping = ({ chatId, senderId }) => {
        if ((type === 'user' && senderId === id) || (type === 'group' && chatId === id)) {
            setTypingUsers(prev => {
                const newState = { ...prev }
                delete newState[senderId]
                return newState
            })
        }
    }

    const handleMessagesRead = ({ chatId, readerId }) => {
        setMessages(prev => prev.map(msg => {
            if (msg.senderId === loggedInUserId && (msg.receiverId === readerId || msg.groupId === chatId)) {
                return { ...msg, status: 'read' }
            }
            return msg
        }))
    }

    const handleMessageUpdated = (updatedMessage) => {
        setMessages(prev => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg))
    }

    const handleMessageDeleted = (messageId) => {
        setMessages(prev => prev.filter(msg => msg._id !== messageId))
    }

    socket.on("newmessage", handleNewMessage)
    socket.on("newGroupMessage", handleNewGroupMessage)
    socket.on("typing", handleTyping)
    socket.on("stopTyping", handleStopTyping)
    socket.on("messagesRead", handleMessagesRead)
    socket.on("messageUpdated", handleMessageUpdated)
    socket.on("messageDeleted", handleMessageDeleted)

    return () => {
      socket.off("newmessage", handleNewMessage)
      socket.off("newGroupMessage", handleNewGroupMessage)
      socket.off("typing", handleTyping)
      socket.off("stopTyping", handleStopTyping)
      socket.off("messagesRead", handleMessagesRead)
      socket.off("messageUpdated", handleMessageUpdated)
      socket.off("messageDeleted", handleMessageDeleted)
    }
  }, [socket, type, id, loggedInUserId])

  // Mark messages as read on mount/update
  useEffect(() => {
      if (type === 'user' && id && messages.length > 0) {
          const unreadMessages = messages.some(m => m.senderId === id && m.status !== 'read')
          if (unreadMessages) {
              socket.emit("markMessagesAsRead", { chatId: null, userToChatId: id })
              // Optimistic update
              setMessages(prev => prev.map(msg => {
                  if (msg.senderId === id && msg.status !== 'read') {
                      return { ...msg, status: 'read' }
                  }
                  return msg
              }))
          }
      }
  }, [type, id, messages, socket])


  // Actions
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const compressed=await imageCompression(file,{
      maxSizeMB:0.5,
      maxWidthOrHeight:880,
    })

    const reader = new FileReader()
    reader.readAsDataURL(compressed)
    reader.onloadend = () => {
      setImageFile(reader.result) 
    } 
  }

  const sendMessage = async () => {
    if (!text.trim() && !imageFile) return

    try {
      let res
      if (type === 'user') {
        res = await axios.post(
          `/messages/${id}`,
          { text, image: imageFile }
        )
      } else if (type === 'group') {
        res = await axios.post(
          "/groups/send",
          { 
            groupId: id,
            senderId: loggedInUserId,
            text, 
            image: imageFile 
          }
        )
      }

      if (res && res.data) {
        setText("")
        setImageFile(null)
        setMessages((prev) => {
          if (prev.some(m => m._id === res.data._id)) return prev
          return [...prev, res.data]
        })
      }
    } catch (error) {
      console.log("Error sending message:", error)
    }
  }

  const handleTypingAction = (isTyping) => {
      if (type === 'user') {
          socket.emit(isTyping ? "typing" : "stopTyping", { chatId: null, receiverId: id })
      } else if (type === 'group') {
          socket.emit(isTyping ? "typing" : "stopTyping", { chatId: id, receiverId: null })
      }
  }

  const handleInputChange = (e) => {
      setText(e.target.value)
      
      if (!typingTimeoutRef.current) {
          handleTypingAction(true)
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

      typingTimeoutRef.current = setTimeout(() => {
          handleTypingAction(false)
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
          socket.emit("editMessage", { messageId: msgId, newText: editText })
          setEditingMessageId(null)
          setEditText("")
      }
  }

  const handleDeleteMessage = (messageId) => {
      if(!window.confirm("Delete this message?")) return
      socket.emit("deleteMessage", { messageId })
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

  // If ID is present but user/group not found yet (loading), show loading or nothing
  // But usually users/groups are loaded.
  
  if (!selectedUser && !selectedGroup) {
      return <div className="flex-1 bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>
  }

  const chatName = selectedUser ? selectedUser.name : selectedGroup?.name
  const chatImage = selectedUser ? selectedUser.profilePic : selectedGroup?.profilePic
  const chatPlaceholder = selectedUser ? selectedUser.name?.[0] : selectedGroup?.name?.[0]

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
        <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors"
            onClick={() => selectedGroup && setShowGroupInfo(true)}
        >
            {/* Back button for mobile could go here */}
            {chatImage ? (
              <img src={chatImage} alt={chatName} className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-slate-800" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg ring-2 ring-slate-800">
                {chatPlaceholder || '?'}
              </div>
            )}
            <div>
              <span className="font-bold text-slate-100 block leading-tight">{chatName}</span>
              {selectedGroup && <span className="text-xs text-slate-400">{selectedGroup.members.length} members</span>}
              {selectedUser && typingUsers[id] && <span className="text-xs text-blue-400 animate-pulse">Typing...</span>}
              {selectedGroup && Object.keys(typingUsers).length > 0 && <span className="text-xs text-blue-400 animate-pulse">Someone is typing...</span>}
            </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
           <MoreVertical className="w-5 h-5 cursor-pointer hover:text-blue-500 transition-colors" />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-6 overflow-y-auto space-y-2 custom-scrollbar bg-slate-950">
        {messages.map((m, i) => (
          <MessageItem 
            key={i} 
            msg={m}
            loggedInUserId={loggedInUserId}
            selectedGroup={selectedGroup}
            users={users}
            editingMessageId={editingMessageId}
            editText={editText}
            setEditText={setEditText}
            cancelEditing={cancelEditing}
            submitEdit={submitEdit}
            startEditing={startEditing}
            handleDeleteMessage={handleDeleteMessage}
          />
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
          disabled={!text.trim() && !imageFile} 
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ChatWindow
