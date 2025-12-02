import React, { createContext, useContext, useEffect, useState } from "react"
import io from "socket.io-client"
import axios from "axios"
import imageCompression from 'browser-image-compression'
import { useNavigate } from "react-router-dom"

const ChatContext = createContext()

const BACKEND = "http://localhost:4000"

// SOCKET CONNECTION
const socket = io(BACKEND, {
  withCredentials: true,
  query:{ userId: localStorage.getItem("userId") },
  autoConnect: false // We'll connect manually when we have a user
})

export const useChat = () => useContext(ChatContext)

export const ChatProvider = ({ children }) => {
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [me, setMe] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  
  // Chat selection state
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)

  const loggedInUserId = localStorage.getItem("userId")
  const navigate = useNavigate()

  // Connect socket on mount if user is logged in
  useEffect(() => {
    if (loggedInUserId) {
      socket.io.opts.query = { userId: loggedInUserId }
      socket.connect()
    }
    return () => {
      socket.disconnect()
    }
  }, [loggedInUserId])

  const fetchUsers = () => {
    axios
      .get(`${BACKEND}/messages`, { withCredentials: true })
      .then((res) => setUsers(res.data))
      .catch(console.log)
  }

  const fetchGroups = () => {
    axios
      .get(`${BACKEND}/groups/mygroups`, { withCredentials: true })
      .then((res) => setGroups(res.data))
      .catch(console.log)
  }

  const fetchMyInfo = () => {
    axios.get(`${BACKEND}/messages/me`,{withCredentials:true})
    .then((res)=>setMe(res.data.name))
    .catch(console.log)
  }

  // LOAD USERS AND GROUPS
  useEffect(() => {
    if (loggedInUserId) {
      fetchUsers()
      fetchGroups()
      fetchMyInfo()
    }
  }, [loggedInUserId])

  // ONLINE USERS
  useEffect(() => {
    socket.on("getOnlineUsers", setOnlineUsers)
    return () => socket.off("getOnlineUsers")
  }, [])

  // LOAD MESSAGES OF SELECTED USER
  const loadUserMessages = async (userId) => {
    setSelectedUser(userId)
    setSelectedGroup(null)
    const res = await axios.get(`${BACKEND}/messages/${userId}`, {
      withCredentials: true,
    })
    setMessages(res.data)
  }

  // LOAD MESSAGES OF SELECTED GROUP
  const loadGroupMessages = async (group) => {
    setSelectedGroup(group)
    setSelectedUser(null) // Deselect user
    const res = await axios.get(`${BACKEND}/groups/${group._id}`, {
      withCredentials: true,
    })
    setMessages(res.data)
  }

  // Refs for socket listeners to access current state without re-subscribing
  const selectedUserRef = React.useRef(selectedUser)
  const selectedGroupRef = React.useRef(selectedGroup)

  useEffect(() => {
    selectedUserRef.current = selectedUser
    selectedGroupRef.current = selectedGroup
  }, [selectedUser, selectedGroup])

  // RECEIVE NEW MESSAGE IN REALTIME
  useEffect(() => {
    // Direct Messages
    const handleNewMessage = (msg) => {
      const currentSelectedUser = selectedUserRef.current
      if (!currentSelectedUser) return

      const isMyChat =
        (msg.senderId === loggedInUserId && msg.receiverId === currentSelectedUser) ||
        (msg.senderId === currentSelectedUser && msg.receiverId === loggedInUserId)

      if (isMyChat) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }
    }

    // Group Messages
    const handleNewGroupMessage = (msg) => {
      const currentSelectedGroup = selectedGroupRef.current
      if (!currentSelectedGroup) return

      // Ignore own messages as they are handled optimistically
      
      if (msg.senderId == loggedInUserId || msg.senderId?.toString() === loggedInUserId) return

      if (msg.groupId === currentSelectedGroup._id) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }
    }

    socket.on("newmessage", handleNewMessage)
    socket.on("newGroupMessage", handleNewGroupMessage)

    socket.on("newGroup", (newGroup) => {
      setGroups((prev) => [...prev, newGroup])
    })

    socket.on("groupDeleted", (groupId) => {
      setGroups((prev) => prev.filter((g) => g._id !== groupId))
      if (selectedGroupRef.current && selectedGroupRef.current._id === groupId) {
        setSelectedGroup(null)
      }
    })

    socket.on("groupUpdated", (updatedGroup) => {
      setGroups((prev) => prev.map((g) => g._id === updatedGroup._id ? updatedGroup : g))
      if (selectedGroupRef.current && selectedGroupRef.current._id === updatedGroup._id) {
        setSelectedGroup(updatedGroup)
      }
    })

    return () => {
      socket.off("newmessage", handleNewMessage)
      socket.off("newGroupMessage", handleNewGroupMessage)
      socket.off("newGroup")
      socket.off("groupDeleted")
      socket.off("groupUpdated")
    }
  }, [loggedInUserId])

  // HANDLE IMAGE UPLOAD
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const compressed=await imageCompression(file,{
      maxSizeMB:0.5,
      maxWidthOrHeight:880,
    })

    //converting image in base64 
    const reader = new FileReader()
    reader.readAsDataURL(compressed)
    reader.onloadend = () => {
      setImageFile(reader.result) 
    } 
  }

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim() && !imageFile) return

    try {
      let res
      if (selectedUser) {
        res = await axios.post(
          `${BACKEND}/messages/${selectedUser}`,
          { text, image: imageFile },
          { withCredentials: true }
        )
      } else if (selectedGroup) {
        res = await axios.post(
          `${BACKEND}/groups/send`,
          { 
            groupId: selectedGroup._id,
            senderId: loggedInUserId,
            text, 
            image: imageFile 
          },
          { withCredentials: true }
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

  const handleCreateGroup = async (name, members, image) => {
    try {
      const res = await axios.post(
        `${BACKEND}/groups/create`,
        { name, members, image },
        { withCredentials: true }
      )
      setGroups([...groups, res.data.group])
      setShowCreateGroupModal(false)
    } catch (error) {
      console.log("Error creating group:", error)
    }
  }

  const handleUpdateGroup = async (groupId, name, image, members) => {
    try {
      const res = await axios.put(
        `${BACKEND}/groups/${groupId}`,
        { name, image, members },
        { withCredentials: true }
      )
      // Socket will handle the update for everyone including sender
    } catch (error) {
      console.log("Error updating group:", error)
      throw error // Re-throw to be caught in modal
    }
  }

  const handleLogout = async () => {
    try {
      await axios.delete(`${BACKEND}/user/logout`, { withCredentials: true })
      localStorage.removeItem("userId")
      localStorage.removeItem("token")
      socket.disconnect()
      navigate("/login")
    } catch (error) {
      console.log("Logout error:", error)
    }
  }

  const handleDeleteAccount = async () => {
      try {
        if(!window.confirm("Are you sure you want to delete your account?")) return
        await axios.delete(`${BACKEND}/user/delete`, { withCredentials: true })
        localStorage.removeItem("userId")
        localStorage.removeItem("token")
        socket.disconnect()
        navigate("/signup")
      } catch (error) {
        console.log("Delete account error:", error)
      }
  }

  const handleDeleteGroup = async (groupId) => {
      try {
        if(!window.confirm("Are you sure you want to delete this group?")) return
        await axios.delete(`${BACKEND}/groups/${groupId}`, { withCredentials: true })
        setGroups(groups.filter((g) => g._id !== groupId))
        setSelectedGroup(null)
      } catch (error) {
        console.log("Delete group error:", error)
        alert(error.response?.data?.message || "Error deleting group")
      }
  }

  const value = {
    users,
    groups,
    me,
    onlineUsers,
    selectedUser,
    selectedGroup,
    messages,
    text,
    setText,
    imageFile,
    showCreateGroupModal,
    setShowCreateGroupModal,
    loggedInUserId,
    loadUserMessages,
    loadGroupMessages,
    handleImageUpload,
    sendMessage,
    handleCreateGroup,
    handleUpdateGroup,
    handleLogout,
    handleDeleteAccount,
    handleDeleteGroup
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
