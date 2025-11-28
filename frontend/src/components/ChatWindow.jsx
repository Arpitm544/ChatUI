import React, { useState } from 'react'
import GroupInfoModal from './GroupInfoModal'

const ChatWindow = ({
  selectedUser,
  selectedGroup,
  messages,
  loggedInUserId,
  users,
  text,
  setText,
  handleImageUpload,
  sendMessage,
  onDeleteGroup,
}) => {
  const [showGroupInfo, setShowGroupInfo] = useState(false)

  return (
    <div className="flex flex-col w-3/4">
      {showGroupInfo && selectedGroup && (
        <GroupInfoModal
          group={selectedGroup}
          onClose={() => setShowGroupInfo(false)}
          onDeleteGroup={onDeleteGroup}
          currentUserId={loggedInUserId}
        />
      )}

      {/* HEADER */}
      <div className="p-4 bg-white shadow flex items-center justify-between">
        {selectedGroup ? (
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowGroupInfo(true)}
          >
            {selectedGroup.profilePic && (
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                <img src={selectedGroup.profilePic} alt={selectedGroup.name} className="h-full w-full object-cover" />
              </div>
            )}
            <span className="font-bold text-lg">{selectedGroup.name}</span>
          </div>
        ) : (
          <span className="font-bold text-lg">
            {users.find((u) => u._id === selectedUser)?.name || 'Chat'}
          </span>
        )}


      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex mb-2 ${
              m.senderId === loggedInUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs ${
                m.senderId === loggedInUserId ? 'bg-blue-500 text-white' : 'bg-gray-300'
              }`}
            >
              {/* Show sender name in group chat if not me */}
              {selectedGroup && m.senderId !== loggedInUserId && (
                <p className="text-xs text-gray-600 font-bold mb-1">
                  {users.find((u) => u._id === m.senderId)?.name || 'Unknown'}
                </p>
              )}

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
        ))}
      </div>

      {/* INPUT BAR */}
      <div className="p-4 flex items-center gap-3 border-t bg-white">
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
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatWindow
