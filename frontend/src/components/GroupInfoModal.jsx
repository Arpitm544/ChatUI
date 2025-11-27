import React from 'react'

const GroupInfoModal = ({ group, onClose, onDeleteGroup, currentUserId }) => {
  const isAdmin = group.admin === currentUserId

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Group Info</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="h-24 w-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl overflow-hidden mb-2">
            {group.profilePic ? (
              <img src={group.profilePic} className="h-full w-full object-cover" />
            ) : (
              group.name[0].toUpperCase()
            )}
          </div>
          <h3 className="text-xl font-semibold">{group.name}</h3>
          <p className="text-gray-500 text-sm">{group.members.length} members</p>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 border-t border-b py-2">
          <h4 className="font-semibold mb-2 text-gray-700">Members</h4>
          {group.members.map((member) => (
            <div key={member._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                 {/* Handle case where member might be populated or just ID if something fails, though backend ensures population */}
                 {member.profilePic ? (
                    <img src={member.profilePic}  className="h-full w-full object-cover" />
                 ) : (
                    <span className="text-sm font-bold text-gray-600">
                        {member.name ? member.name[0].toUpperCase() : '?'}
                    </span>
                 )}
              </div>
              <span className="text-gray-800">{member.name || 'Unknown User'}</span>
              {group.admin === member._id && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded ml-auto">Admin</span>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <button
            onClick={() => onDeleteGroup(group._id)}
            className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
          >
            Delete Group
          </button>
        )}
      </div>
    </div>
  )
}

export default GroupInfoModal
