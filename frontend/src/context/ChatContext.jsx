import React, { createContext, useContext, useEffect, useState } from "react"
import io from "socket.io-client"
import axios from "../lib/axios"
import imageCompression from 'browser-image-compression'
import { useNavigate } from "react-router-dom"

const ChatContext = createContext()

const BACKEND = import.meta.env.VITE_BACKEND_URL || "https://chatui-1-ffr2.onrender.com"

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
  const [me, setMe] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  
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
      .get("/messages")
      .then((res) => setUsers(res.data))
      .catch(console.log)
  }

  const fetchGroups = () => {
    axios
      .get("/groups/mygroups")
      .then((res) => setGroups(res.data))
      .catch(console.log)
  }

  const fetchMyInfo = () => {
    axios.get("/messages/me")
    .then((res)=>setMe(res.data))
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

  // GROUP EVENTS
  useEffect(() => {
    socket.on("newGroup", (newGroup) => {
      setGroups((prev) => [...prev, newGroup])
    })

    socket.on("groupDeleted", (groupId) => {
      setGroups((prev) => prev.filter((g) => g._id !== groupId))
    })

    socket.on("groupUpdated", (updatedGroup) => {
      setGroups((prev) => prev.map((g) => g._id === updatedGroup._id ? updatedGroup : g))
    })

    return () => {
      socket.off("newGroup")
      socket.off("groupDeleted")
      socket.off("groupUpdated")
    }
  }, [])



  const handleCreateGroup = async (name, members, image) => {
    try {
      const res = await axios.post(
        "/groups/create",
        { name, members, image }
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
        `/groups/${groupId}`,
        { name, image, members }
      )
      // Socket will handle the update for everyone including sender
    } catch (error) {
      console.log("Error updating group:", error)
      throw error // Re-throw to be caught in modal
    }
  }

  const handleUpdateProfile = async (data) => {
    try {
      const res = await axios.put(
        "/user/update-profile",
        data
      )
      setMe(res.data)
      return res.data
    } catch (error) {
      console.log("Error updating profile:", error)
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await axios.delete("/user/logout")
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
        await axios.delete("/user/delete")
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
        await axios.delete(`/groups/${groupId}`)
        setGroups(groups.filter((g) => g._id !== groupId))
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
    showCreateGroupModal,
    setShowCreateGroupModal,
    loggedInUserId,
    handleCreateGroup,
    handleUpdateGroup,
    handleLogout,
    handleDeleteAccount,
    handleDeleteGroup,
    handleUpdateProfile,
    socket
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
