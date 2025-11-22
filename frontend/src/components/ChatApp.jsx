import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

// Backend URL
const BACKEND = "http://localhost:4000";

// Connect socket with auth userId
const socket = io(BACKEND, {
  withCredentials: true,
  query: {
    userId: localStorage.getItem("userId"),
  },
});

export default function ChatApp() {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const loggedInUserId = localStorage.getItem("userId");

  // Fetch all users except logged-in user
  useEffect(() => {
    axios
      .get(`${BACKEND}/messages`, { withCredentials: true })
      .then((res) => setUsers(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Listen for online users from socket.io
  useEffect(() => {
    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
  }, []);

  // Load messages for selected user
  const loadMessages = async (id) => {
    setSelectedUser(id);

    const res = await axios.get(`${BACKEND}/messages/${id}`, {
      withCredentials: true,
    });

    setMessages(res.data);
  };

  // Listen for new messages
  useEffect(() => {
    socket.on("newmessage", (msg) => {
      if (msg.senderId === selectedUser || msg.receiverId === selectedUser) {
        setMessages((prev) => [...prev, msg]);
      }
    });
  }, [selectedUser]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim()) return;

    const res = await axios.post(
      `${BACKEND}/messages/${selectedUser}`,
      { text },
      { withCredentials: true }
    );

    setMessages((prev) => [...prev, res.data]);
    setText("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* USERS LIST */}
      <div className="w-1/4 bg-white shadow p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-3">Users</h2>

        {users.map((u) => {
          const isOnline = onlineUsers.includes(u._id);

          return (
            <div
              key={u._id}
              onClick={() => loadMessages(u._id)}
              className={`p-3 flex items-center rounded cursor-pointer mb-2 shadow-sm ${
                selectedUser === u._id ? "bg-blue-200" : "bg-gray-200"
              }`}
            >
              {/* ONLINE DOT */}
              <span
                className={`h-3 w-3 rounded-full mr-2 ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>

              {u.name}
            </div>
          );
        })}
      </div>

      {/* CHAT WINDOW */}
      <div className="flex flex-col w-3/4">
        {selectedUser ? (
          <>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((m, index) => (
                <div
                  key={index}
                  className={`mb-2 flex ${
                    m.senderId === loggedInUserId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg max-w-xs ${
                      m.senderId === loggedInUserId
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* INPUT BOX */}
            <div className="p-4 flex items-center bg-white shadow">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={sendMessage}
                className="ml-3 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-xl text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}