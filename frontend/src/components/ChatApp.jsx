import React from "react"
import { Routes, Route } from "react-router-dom"
import CreateGroupModal from "./CreateGroupModal"
import ChatSidebar from "./ChatSidebar"
import ChatWindow from "./ChatWindow"
import Navbar from "./Navbar"
import { ChatProvider, useChat } from "../context/ChatContext"

const ChatLayout = () => {
  const { 
    showCreateGroupModal, 
    setShowCreateGroupModal,
    users,
    handleCreateGroup
  } = useChat()

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <Navbar />
      
    <div className="flex-1 flex overflow-hidden">
        <div className="w-full h-full flex bg-slate-900">
          <ChatSidebar />
          <Routes>
            <Route path="/" element={
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-500">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">👋</span>
                </div>
                <h3 className="text-xl font-medium text-slate-300">Welcome to Chat App</h3>
                <p className="mt-2">Select a chat to start messaging</p>
              </div>
            } />
            <Route path="/:type/:id" element={<ChatWindow />} />
          </Routes>
        </div>
      </div>

      {showCreateGroupModal && (
        <CreateGroupModal
          users={users}
          onClose={() => setShowCreateGroupModal(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  )
}

export default function ChatApp() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  )
}
