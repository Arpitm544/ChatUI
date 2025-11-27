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
    <div>
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search users..."
      />
        <ul>
          {filteredUsers.map((u) => (
            <li key={u._id} onClick={() => handleSelect(u._id)}>
              {u.name}
            </li>
          ))}
        </ul>
     
    </div>
  )
}

export default Search