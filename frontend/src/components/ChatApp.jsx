import React, { useEffect, useState,useMemo} from "react"
import io from "socket.io-client"
import axios from "axios"
import imageCompression from 'browser-image-compression'
import CreateGroupModal from "./CreateGroupModal"
import ChatSidebar from "./ChatSidebar"
import ChatWindow from "./ChatWindow"
import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"

const BACKEND = "http://localhost:4000"

// SOCKET CONNECTION
const socket = io(BACKEND, {
  withCredentials: true,
  query:{ userId: localStorage.getItem("userId") },
})

export default function ChatApp() {
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [me,setMe]=useState('')
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
    fetchUsers()
    fetchGroups()
    fetchMyInfo()
  }, [])

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

  // RECEIVE NEW MESSAGE IN REALTIME
  useEffect(() => {
    // Direct Messages
    const handleNewMessage = (msg) => {
      if (!selectedUser) return
      const isMyChat =
        (msg.senderId === loggedInUserId && msg.receiverId === selectedUser) ||
        (msg.senderId === selectedUser && msg.receiverId === loggedInUserId)

      if (isMyChat) {
        setMessages((prev) => [...prev, msg])
      }
    }

    // Group Messages
    const handleNewGroupMessage = (msg) => {
      if (!selectedGroup) return
      if (msg.groupId === selectedGroup._id) {
        setMessages((prev) => [...prev, msg])
      }
    }

    socket.on("newmessage", handleNewMessage)
    socket.on("newGroupMessage", handleNewGroupMessage)

    socket.on("newGroup", (newGroup) => {
      setGroups((prev) => [...prev, newGroup])
      socket.emit("joinGroup", newGroup._id)
    })

    socket.on("groupDeleted", (groupId) => {
      setGroups((prev) => prev.filter((g) => g._id !== groupId))
      if (selectedGroup && selectedGroup._id === groupId) {
        setSelectedGroup(null)
      }
    })

    return () => {
      socket.off("newmessage", handleNewMessage)
      socket.off("newGroupMessage", handleNewGroupMessage)
      socket.off("newGroup")
      socket.off("groupDeleted")
    }
  }, [loggedInUserId, selectedUser, selectedGroup])

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
        setMessages((prev) => [...prev, res.data])
        setText("")
        setImageFile(null)
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

  const handleLogout = async () => {
    try {
      await axios.delete(`${BACKEND}/user/logout`, { withCredentials: true })
      localStorage.removeItem("userId")
      localStorage.removeItem("token")
      navigate("/login")
    } catch (error) {
      console.log("Logout error:", error)
    }
  }

  const handleDeleteAccount = async () => {
      try {
        alert("Are you sure you want to delete your account?")
        await axios.delete(`${BACKEND}/user/delete`, { withCredentials: true })
        localStorage.removeItem("userId")
        localStorage.removeItem("token")
        navigate("/signup")
      } catch (error) {
        console.log("Delete account error:", error)
      }
  }

  const handleDeleteGroup = async (groupId) => {
      try {
        alert("Are you sure you want to delete this group?")
        await axios.delete(`${BACKEND}/groups/${groupId}`, { withCredentials: true })
        setGroups(groups.filter((g) => g._id !== groupId))
        setSelectedGroup(null)
      } catch (error) {
        console.log("Delete group error:", error)
        alert(error.response?.data?.message || "Error deleting group")
      }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />
      
      <div className="flex flex-1 overflow-hidden">
        {showCreateGroupModal && (
          <CreateGroupModal
            users={users}
            onClose={() => setShowCreateGroupModal(false)}
            onCreate={handleCreateGroup}
          />
        )}

        <ChatSidebar
          me={me}
          users={users}
          groups={groups}
          onlineUsers={onlineUsers}
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          onSelectUser={loadUserMessages}
          onSelectGroup={loadGroupMessages}
          onCreateGroupClick={() => setShowCreateGroupModal(true)}
        />

        <ChatWindow
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          messages={messages}
          loggedInUserId={loggedInUserId}
          users={users}
          text={text}
          setText={setText}
          handleImageUpload={handleImageUpload}
          sendMessage={sendMessage}
          onDeleteGroup={handleDeleteGroup}
        />
      </div>
    </div>
  )
}