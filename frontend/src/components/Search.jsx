import axios from "axios"
import React, { useState } from "react"

const Search = ({ onSelectUser }) => {
  const [search, setSearch] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])

  const handleSearch = async (e) => {
    const val = e.target.value
    setSearch(val)

    if (!val.trim()) {
      setFilteredUsers([])
      return
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/search?name=${val}`,
        { withCredentials: true }
      )

      setFilteredUsers(res.data.users)
    } catch (err) {
      console.log("Search Error:", err)
    }
  }

  const handleSelect = (userId) => {
    onSelectUser(userId)
    setSearch("")
    setFilteredUsers([])
  }

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search users..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
      />

      {filteredUsers.length > 0 && (
        <ul className="absolute w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
          {filteredUsers.map((u) => (
            <li
              key={u._id}
              onClick={() => handleSelect(u._id)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
            >
              {u.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Search