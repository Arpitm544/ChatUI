import React, { memo } from 'react'
import { User } from 'lucide-react'

export const GroupItem = memo(({ group, isActive, onClick }) => {
    const getGroupClass = () => {
        return isActive 
          ? 'p-3 flex items-center gap-3 rounded-xl cursor-pointer mb-2 bg-blue-600/20 border-l-4 border-blue-500 transition-all' 
          : 'p-3 flex items-center gap-3 rounded-xl cursor-pointer mb-2 hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-200'
    }

    return (
        <div
            onClick={onClick}
            className={getGroupClass()}
        >
            {group.profilePic ? (
                <img src={group.profilePic} alt={group.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800" />
            ) : (
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-bold ring-2 ring-slate-800">
                    {group.name[0]}
                </div>
            )}
            <span className="font-medium truncate">{group.name}</span>
        </div>
    )
})

export const UserItem = memo(({ user, isActive, isOnline, onClick }) => {
    const getUserClass = () => {
        return isActive 
          ? 'p-3 flex items-center gap-3 rounded-xl cursor-pointer mb-2 bg-blue-600/20 border-l-4 border-blue-500 transition-all' 
          : 'p-3 flex items-center gap-3 rounded-xl cursor-pointer mb-2 hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-200'
    }

    const getOnlineStatusClass = () => {
        return isOnline 
          ? 'h-3 w-3 rounded-full bg-green-500 border-2 border-slate-900' 
          : 'h-3 w-3 rounded-full bg-slate-600 border-2 border-slate-900'
    }

    return (
        <div
            onClick={onClick}
            className={getUserClass()}
        >
            <div className="relative">
                {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800" />
                ) : (
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-medium ring-2 ring-slate-800">
                        {user.name?.[0]?.toUpperCase()}
                    </div>
                )}
                <span className={`absolute bottom-0 right-0 ${getOnlineStatusClass()}`} />
            </div>
            <span className="font-medium truncate">{user.name}</span>
        </div>
    )
})
