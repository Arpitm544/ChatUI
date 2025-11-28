import React from 'react'

const GroupInfoModal=({ group, onClose, onDeleteGroup, currentUserId }) => {
  const isAdmin = group.admin === currentUserId

  return (
    <div className="fixed flex items-center justify-center cursor-pointer">
      <div className="bg-white p-6 rounded-lg w-96">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Group Info</h2>
          <button onClick={onClose} className="text-gray-500 ml-2 px-2 py-1 rounded border border-gray-600 hover:text-gray-700 cursor-pointer">
            Back
          </button>
        </div>

        {/* Group Details */}
        <div className="flex flex-col items-center mb-6">
          {group.profilePic && (
            <img 
              src={group.profilePic} 
              className="h-24 w-24 rounded-full object-cover mb-2"
              alt="Group"
            />
          )}
          <h3 className="text-xl font-semibold">{group.name}</h3>
          <p className="text-gray-500 text-sm">{group.members.length} members</p>
        </div>

        {/* Members List */}
        <div className="max-h-60 overflow-y-auto border-y py-2 mb-4">
          <h4 className="font-semibold mb-2 text-gray-700">Members</h4>
          {group.members.map((member) => (
            <div key={member._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {member.profilePic ?(
                  <img src={member.profilePic} className="h-full w-full" alt={member.name} />
                ):(
                  <span className="text-gray-600 text-sm">
                    {member.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-gray-800">{member.name}</span>
              {group.admin === member._id && (
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">Admin</span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        {isAdmin && (
          <button onClick={() => onDeleteGroup(group._id)} className="w-full h-12 bg-red-500 text-white rounded hover:bg-red-600">
            Delete Group
          </button>
        )}
      </div>
    </div>
  )
}

export default GroupInfoModal
