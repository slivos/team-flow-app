import { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";
import { useUserStore } from "../store/userStore";
import { IconSettings, IconUser, IconBrandGithub } from "@tabler/icons-react";

const CURRENT_USER_ID = "1"; // Hardcoded for now, should come from auth

interface HeaderProps {
  onOpenSettings?: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { profile, setProfile } = useUserStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getAvatarUrl = () => {
    if (profile.avatar) {
      return profile.avatar;
    }
    // Fallback to UI Avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff&size=128`;
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <IconUser className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Team Flow
            </h1>
            <p className="text-xs text-slate-500">Project Management</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/slivos/team-flow-app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-slate-100 rounded-full p-2 transition-colors"
            aria-label="GitHub repository"
          >
            <IconBrandGithub className="w-5 h-5 text-slate-700" />
          </a>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 hover:bg-slate-100 rounded-full p-1.5 transition-colors"
            >
              <img
                src={getAvatarUrl()}
                alt="User"
                className="w-9 h-9 rounded-full border-2 border-white shadow-md object-cover flex-shrink-0"
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">
                    {profile.name || "Loading..."}
                  </p>
                  <p className="text-xs text-slate-500">
                    {profile.email || ""}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenSettings?.();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3"
                >
                  <IconSettings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
