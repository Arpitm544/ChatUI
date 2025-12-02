import React, { memo } from 'react'
import { Check, CheckCheck, Edit2, Trash2, X } from 'lucide-react'

const MessageItem = ({ 
    msg, 
    loggedInUserId, 
    selectedGroup, 
    users, 
    editingMessageId, 
    editText, 
    setEditText, 
    cancelEditing, 
    submitEdit, 
    startEditing, 
    handleDeleteMessage 
}) => {

    const getMessageContainerClass = (msg) => {
        return msg.senderId === loggedInUserId 
          ? 'flex mb-4 justify-end' 
          : 'flex mb-4 justify-start'
    }
    
    const getMessageBubbleClass = (msg) => {
        return msg.senderId === loggedInUserId 
          ? 'p-3 rounded-2xl max-w-xs bg-blue-600 text-white shadow-md rounded-br-none' 
          : 'p-3 rounded-2xl max-w-xs bg-slate-800 text-slate-200 shadow-md rounded-bl-none border border-slate-700'
    }

    return (
        <div className={getMessageContainerClass(msg)}>
            <div className={`${getMessageBubbleClass(msg)} relative group`}>
                {/* Show sender name in group chat if not me */}
                {selectedGroup && msg.senderId !== loggedInUserId && (
                    <p className="text-xs text-blue-400 font-bold mb-1">
                        {users.find((u) => u._id === msg.senderId)?.name}
                    </p>
                )}
                {msg.image && (
                    <img
                        src={msg.image}
                        alt="sent-img"
                        className="max-w-[200px] rounded-lg mb-2 border border-white/10"
                    />
                )}
                
                {editingMessageId === msg._id ? (
                    <div className="flex flex-col gap-2">
                        <input 
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)}
                            className="bg-slate-700 text-white p-1 rounded text-sm w-full"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={cancelEditing} className="text-xs text-red-400"><X size={14}/></button>
                            <button onClick={() => submitEdit(msg._id)} className="text-xs text-green-400"><Check size={14}/></button>
                        </div>
                    </div>
                ) : (
                    <>
                        {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                        {msg.isEdited && <span className="text-[9px] text-slate-400 block text-right italic">edited</span>}
                    </>
                )}

                <div className="flex items-center justify-end gap-1 mt-1">
                    <p className={`text-[10px] ${msg.senderId === loggedInUserId ? 'text-blue-100' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    {msg.senderId === loggedInUserId && (
                        <span className="text-blue-100">
                            {msg.status === 'read' ? <CheckCheck size={14} className="text-blue-200" /> : 
                             msg.status === 'delivered' ? <CheckCheck size={14} className="text-slate-400" /> :
                             <Check size={14} className="text-slate-400" />}
                        </span>
                    )}
                </div>

                {/* Message Actions (Edit/Delete) - Only for own messages */}
                {msg.senderId === loggedInUserId && !editingMessageId && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 hidden group-hover:flex bg-slate-800 rounded-lg shadow-lg p-1 gap-1 z-10">
                        <button onClick={() => startEditing(msg)} className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-blue-400">
                            <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDeleteMessage(msg._id)} className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-red-400">
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default memo(MessageItem)
