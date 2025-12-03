import axios from "../lib/axios"
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
        `/user/search?name=${val}`
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
    <div className="relative w-full">
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search users..."
        className="pl-2 w-70 h-10 border border-gray-300 rounded-md text-sm text-white"
      />

      {filteredUsers.length > 0 && (
        <ul className="bg-white border border-gray-400 text-black">
          {filteredUsers.map((u) => (
            <li
              key={u._id}
              onClick={() => handleSelect(u._id)}
              className="my-2 pl-2 cursor-pointer hover:bg-gray-100 text-sm"
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