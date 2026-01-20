import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { useUserStore } from "../store/userStore";
import { IconX } from "@tabler/icons-react";

interface SettingsProps {
  onClose: () => void;
}

const CURRENT_USER_ID = "1"; // Hardcoded for now, should come from auth

export function Settings({ onClose }: SettingsProps) {
  const { profile, setProfile, setAvatar, removeAvatar, updateProfile } =
    useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Disable body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Load profile from API on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await api.getUserProfile(CURRENT_USER_ID);
        // Merge with existing avatar from store to preserve it
        setProfile({
          ...userProfile,
          avatar: profile.avatar, // Keep avatar from store
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    // Only load from API if name is empty (not loaded yet)
    if (!profile.name) {
      loadProfile();
    }
  }, [profile.name, setProfile, profile.avatar]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      alert("Only JPG, PNG, or GIF files are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Save to store (automatically persisted to localStorage)
      setAvatar(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    removeAvatar();
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSaveMessage("");

    try {
      // Save profile data to API (without avatar - avatar is in store)
      const { avatar, ...profileData } = profile;
      await api.updateUserProfile(CURRENT_USER_ID, profileData);

      setSaveMessage("Settings saved successfully!");

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (profile.avatar) {
      return profile.avatar;
    }
    // Fallback to UI Avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff&size=128`;
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <h2 id="settings-title" className="text-2xl font-bold text-slate-800">
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <IconX className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <img
                src={getAvatarUrl()}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="flex flex-col items-center sm:items-start">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Change Photo
                </button>
                {profile.avatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="ml-0 sm:ml-2 mt-2 sm:mt-0 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs text-slate-500 mt-2 text-center sm:text-left">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => updateProfile({ role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center flex-shrink-0">
            {saveMessage && (
              <span
                className={`text-sm ${saveMessage.includes("Failed") ? "text-red-600" : "text-green-600"}`}
              >
                {saveMessage}
              </span>
            )}
            {!saveMessage && <span></span>}
            <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto w-full sm:w-auto">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
