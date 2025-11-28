import React, { useState } from 'react'
import imageCompression from 'browser-image-compression'

const CreateGroupModal=({ users, onClose, onCreate }) => {
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleToggleMember=(userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId))
    } else {
      setSelectedMembers([...selectedMembers, userId])
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 880,
    })

    const reader = new FileReader()
    reader.readAsDataURL(compressed)
    reader.onloadend = () => {
      setImageFile(reader.result)
      setImagePreview(reader.result)
    }
  }

  const handleSubmit = () => {
    if (!groupName || selectedMembers.length === 0) return
    onCreate(groupName, selectedMembers, imageFile)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4">Create New Group</h2>
        
        <div className="flex justify-center mb-4">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
              {imagePreview ? (
                <img src={imagePreview} alt="Group" className="h-full w-full object-cover" />
              ) : (
                <span className="text-gray-500 text-sm">Upload</span>
              )}
            </div>
          </label>
        </div>

        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="flex-1 overflow-y-auto mb-4 border rounded p-2">
          <p className="font-semibold mb-2">Select Members:</p>
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleToggleMember(user._id)}
              className={`p-2 flex items-center gap-2 cursor-pointer rounded ${
                selectedMembers.includes(user._id) ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMembers.includes(user._id)}
                readOnly
                className="pointer-events-none"
              />
              <span>{user.name}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!groupName || selectedMembers.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateGroupModal
