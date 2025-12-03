import { useEffect, useState } from "react";
import axios from "../lib/axios";

export default function GroupSidebar({ userId, onSelectGroup }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchGroups = async () => {
      try {
        const res = await axios.post(
          "/group/user",
          { userId }
        );
        setGroups(res.data.groups);
      } catch (err) {
        console.log(err);
      }
    };

    fetchGroups();
  }, [userId]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Groups</h2>

      {groups.map((g) => (
        <div
          key={g._id}
          onClick={() => onSelectGroup(g)}
          className="p-2 bg-gray-200 rounded mb-1 cursor-pointer hover:bg-gray-300"
        >
          {g.name}
        </div>
      ))}
    </div>
  );
}