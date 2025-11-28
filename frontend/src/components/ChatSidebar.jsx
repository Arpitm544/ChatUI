import React from 'react'
import Search from './Search'

const ChatSidebar = ({me,users,groups,onlineUsers,selectedUser,selectedGroup,onSelectUser,onSelectGroup,onCreateGroupClick}) => {
  return (      
    <div className="w-1/4 bg-white shadow p-4 flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Chats</h2>
        <button
          onClick={onCreateGroupClick}
          className="h-9 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 cursor-pointer"
        >
          + Group
        </button>
      </div>

      <p className="text-gray-500 mb-2">Logged in as: {me}</p>

      <Search onSelectUser={onSelectUser} />
      <div className="flex-1 ">
        {/* GROUPS LIST */}
        {groups.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold text-gray-600 mt-2 mb-2">Groups</h3>
            {groups.map((g) => (
              <div
                key={g._id}
                onClick={() => onSelectGroup(g)}
                className={`p-3 flex items-center gap-2 rounded cursor-pointer mb-2 ${
                  selectedGroup?._id === g._id ? 'bg-blue-300' : 'bg-gray-200'
                }`}
              >
                {g.profilePic && (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <img src={g.profilePic} alt={g.name} className="h-full w-full rounded-full" />
                  </div>
                )}
                {g.name}
              </div>
            ))}
          </div>
        )}

        {/* USERS LIST */}
        <div>
          <h3 className="font-semibold text-gray-600 mb-2">Direct Messages</h3>
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => onSelectUser(u._id)}
              className={`p-3 flex items-center gap-2 rounded cursor-pointer mb-2 ${
                selectedUser === u._id ? 'bg-blue-300' : 'bg-gray-200'
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full ${
                  onlineUsers.includes(u._id) ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              {u.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default ChatSidebar
