import { useEffect, useState, useRef } from "react";
import axios from "../lib/axios";

export default function GroupChat({ group, socket }) {
  const userId = localStorage.getItem("userId");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);

  // Load old messages (POST)
  useEffect(() => {
    const loadMsgs = async () => {
      const res = await axios.post(
        "/group/messages",
        { groupId: group._id }
      );
      setMessages(res.data);
    };

    loadMsgs();
  }, [group]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Receive new group messages
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (msg.groupId === group._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newGroupMessage", handler);
    return () => socket.off("newGroupMessage", handler);
  }, [socket, group]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim()) return;

    // Save to DB
    await axios.post(
      "/group/send",
      {
        groupId: group._id,
        senderId: userId,
        text,
        image: "",
      }
    );

    // Realtime emit
    socket.emit("sendGroupMessage", {
      groupId: group._id,
      senderId: userId,
      text,
      image: "",
    });

    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 font-bold">
        {group.name}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded-lg max-w-xs ${
              msg.senderId === userId
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 bg-white border-t">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Message the group..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="px-4 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}