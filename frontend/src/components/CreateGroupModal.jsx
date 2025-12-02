import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { X, Camera, Check, Users } from "lucide-react";

const CreateGroupModal = ({ users, onClose, onCreate }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleToggleMember = (userId) => {
    if(selectedMembers.includes(userId)){
        setSelectedMembers(selectedMembers.filter((id)=>id!==userId))
    }else{
        setSelectedMembers([...selectedMembers,userId])
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 880,
    });

    const reader = new FileReader();
    reader.readAsDataURL(compressed);
    reader.onloadend = () => {
      setImageFile(reader.result);
      setImagePreview(reader.result);
    };
  };

  const handleSubmit = () => {
    if (!groupName || selectedMembers.length === 0) {
      return alert("Enter group name and select members");
    }
    onCreate(groupName, selectedMembers, imageFile);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-slate-800">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Create Group
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          {/* Image Upload */}
          <label className="relative group cursor-pointer mb-6">
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-600 overflow-hidden group-hover:border-blue-500 transition-colors">
              {imagePreview ? (
                <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
              ) : (
                <Camera className="w-8 h-8 text-slate-500 group-hover:text-blue-500 transition-colors" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-md">
              <Camera className="w-3 h-3" />
            </div>
          </label>

          {/* Group Name */}
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full border-b-2 border-slate-700 focus:border-blue-500 outline-none px-2 py-2 text-lg font-medium bg-transparent transition-colors mb-6 text-slate-100 placeholder-slate-500"
            autoFocus
          />

          {/* Members List */}
          <div className="w-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Members</p>
            <div className="border border-slate-700 rounded-xl h-48 overflow-y-auto p-2 bg-slate-950 space-y-1 custom-scrollbar">
              {users.map((u) => {
                const isSelected = selectedMembers.includes(u._id);
                const itemClass = isSelected 
                  ? "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all bg-blue-600/10 border border-blue-500/30"
                  : "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:bg-slate-900 border border-transparent";
                
                const checkboxClass = isSelected 
                  ? "w-5 h-5 rounded border flex items-center justify-center transition-colors bg-blue-600 border-blue-600"
                  : "w-5 h-5 rounded border flex items-center justify-center transition-colors border-slate-600 bg-slate-800";

                return (
                  <div
                    key={u._id}
                    className={itemClass}
                    onClick={() => handleToggleMember(u._id)}
                  >
                    <div className={checkboxClass}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`font-medium ${isSelected ? "text-blue-400" : "text-slate-300"}`}>{u.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium shadow-lg shadow-blue-900/30 transition-transform active:scale-95 flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;