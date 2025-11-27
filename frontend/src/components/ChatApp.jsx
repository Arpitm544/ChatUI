import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const BACKEND = "http://localhost:4000";

// SOCKET CONNECTION
const socket = io(BACKEND, {
  withCredentials: true,
  query: { userId: localStorage.getItem("userId") },
});

export default function ChatApp() {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const loggedInUserId = localStorage.getItem("userId");

  // LOAD USERS
  useEffect(() => {
    axios
      .get(`${BACKEND}/messages`, { withCredentials: true })
      .then((res) => setUsers(res.data))
      .catch(console.log);
  }, []);

  // ONLINE USERS
  useEffect(() => {
    socket.on("getOnlineUsers", setOnlineUsers);
  }, []);

  // LOAD MESSAGES OF SELECTED USER
  const loadMessages = async (userId) => {
    setSelectedUser(userId);
    const res = await axios.get(`${BACKEND}/messages/${userId}`, {
      withCredentials: true,
    });
    setMessages(res.data);
  };

  // RECEIVE NEW MESSAGE IN REALTIME
  useEffect(() => {
    socket.on("newmessage", (msg) => {
      const isMyChat =
        (msg.senderId === loggedInUserId && msg.receiverId === selectedUser) ||
        (msg.senderId === selectedUser && msg.receiverId === loggedInUserId);

      if (isMyChat) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("newmessage");
  }, [loggedInUserId, selectedUser]);

  // HANDLE IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImageFile(reader.result); // base64
    };
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim() && !imageFile) return;

    const res = await axios.post(
      `${BACKEND}/messages/${selectedUser}`,
      {
        text,
        image: imageFile,
      },
      { withCredentials: true }
    );

    setMessages((prev) => [...prev, res.data]);
    setText("");
    setImageFile(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* LEFT PANEL - USER LIST */}
      <div className="w-1/4 bg-white shadow p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-3">Users</h2>

        {users.map((u) => {
          const online = onlineUsers.includes(u._id);

          return (
            <div
              key={u._id}
              onClick={() => loadMessages(u._id)}
              className={`p-3 flex items-center rounded cursor-pointer mb-2 shadow-sm ${
                selectedUser === u._id ? "bg-blue-200" : "bg-gray-200"
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full mr-2 ${
                  online ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>

              {u.name}
            </div>
          );
        })}
      </div>

      {/* RIGHT PANEL - CHAT */}
      <div className="flex flex-col w-3/4">

        {selectedUser && (
          <>
            {/* MESSAGES */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((m, i) => {
                const isMine = m.senderId === loggedInUserId;

                return (
                  <div
                    key={i}
                    className={`mb-2 flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg max-w-xs ${
                        isMine ? "bg-blue-500 text-white" : "bg-gray-300"
                      }`}
                    >
                      {/* TEXT */}
                      {m.text && <p>{m.text}</p>}

                      {/* IMAGE */}
                      {m.image && (
                        <img
                          src={m.image}
                          alt="sent-img"
                          className="mt-2 max-w-[200px] rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* INPUT BAR */}
            <div className="p-4 flex items-center">

              {/* IMAGE INPUT */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mr-3"
              />

              {/* TEXT INPUT */}
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded"
              />

              {/* SEND BUTTON */}
              <button
                onClick={sendMessage}
                className="ml-3 px-4 py-2 bg-blue-600 text-white rounded"
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