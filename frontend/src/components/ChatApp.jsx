import React, { useEffect, useState } from "react"
import io from "socket.io-client"
import axios from "axios"
import Search from "./Search"
import imageCompression from 'browser-image-compression'

const BACKEND = "http://localhost:4000"

// SOCKET CONNECTION
const socket = io(BACKEND, {
  withCredentials: true,
  query:{ userId: localStorage.getItem("userId") },
})

export default function ChatApp() {
  const [users, setUsers] = useState([])
  const [me,setMe]=useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [imageFile, setImageFile] = useState(null)

  const loggedInUserId = localStorage.getItem("userId")

  // LOAD USERS
  useEffect(() => {
    axios
      .get(`${BACKEND}/messages`, { withCredentials: true })
      .then((res) => setUsers(res.data))
      .catch(console.log)
  }, [])

  // LOAD MY INFO
  useEffect(()=>{
    axios.get(`${BACKEND}/messages/me`,{withCredentials:true})
    .then((res)=>setMe(res.data.name))
    .catch(console.log)
  }, [])

  // ONLINE USERS
  useEffect(() => {
    socket.on("getOnlineUsers", setOnlineUsers)
  }, [])

  // LOAD MESSAGES OF SELECTED USER
  const loadMessages = async (userId) => {
    setSelectedUser(userId)
    const res = await axios.get(`${BACKEND}/messages/${userId}`, {
      withCredentials: true,
    })
    setMessages(res.data)
  }

  // RECEIVE NEW MESSAGE IN REALTIME
  useEffect(() => {
    socket.on("newmessage", (msg) => {
      const isMyChat =
        (msg.senderId === loggedInUserId && msg.receiverId === selectedUser) ||
        (msg.senderId === selectedUser && msg.receiverId === loggedInUserId)

      if (isMyChat) {
        setMessages((prev) => [...prev, msg])
      }
    })

    return () => socket.off("newmessage")
  }, [loggedInUserId, selectedUser])

  // HANDLE IMAGE UPLOAD
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const compressed=await imageCompression(file,{
      maxSizeMB:0.5, //compress to max 0.5 MB
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

    const res = await axios.post(
      `${BACKEND}/messages/${selectedUser}`,
      {text,image:imageFile,
      },{ withCredentials: true }
    )
    setMessages((prev) => [...prev, res.data])
    setText("")
    setImageFile(null)
  }

  return (
  <div className="flex h-screen bg-gray-100">

    {/* LEFT PANEL - USERS */}
    <div className="w-1/4 bg-white shadow p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-3">Users:{me}</h2>

      <Search onSelectUser={loadMessages} />

      {users.map((u) => {
        const online = onlineUsers.includes(u._id);
        const active = selectedUser === u._id;

        return (
          <div
            key={u._id}
            onClick={() => loadMessages(u._id)}
            className={`p-3 flex items-center gap-2 rounded cursor-pointer mb-2 
              ${active ? "bg-blue-300" : "bg-gray-200"}`}
          >
            <span
              className={`h-3 w-3 rounded-full 
                ${online ? "bg-green-500" : "bg-gray-400"}`}
            />
            {u.name}
          </div>
        );
      })}
    </div>

    {/* RIGHT PANEL - CHAT */}
    <div className="flex flex-col w-3/4">

      {!selectedUser && (
        <div className="flex items-center justify-center h-full text-gray-500 text-lg">
          Select a user to start chat
        </div>
      )}

      {selectedUser && (
        <>
          {/* MESSAGES */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((m, i) => {
              const mine = m.senderId === loggedInUserId;

              return (
                <div
                  key={i}
                  className={`flex mb-2 ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-xs 
                      ${mine ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                  >
                    {m.image && (
                      <img
                        src={m.image}
                        alt="sent-img"
                        className="max-w-[200px] rounded mb-2"
                      />
                    )}
                    {m.text && <p>{m.text}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* INPUT BAR */}
          <div className="p-4 flex items-center gap-3 border-t">

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded"
            />

            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);
}