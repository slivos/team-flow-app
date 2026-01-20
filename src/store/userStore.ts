import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types';

const CURRENT_USER_ID = '1';

interface UserState {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  setAvatar: (avatar: string) => void;
  removeAvatar: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        id: CURRENT_USER_ID,
        name: '',
        email: '',
        role: '',
        avatar: '',
      },
      setProfile: (profile) => set({ profile }),
      setAvatar: (avatar) =>
        set((state) => ({ profile: { ...state.profile, avatar } })),
      removeAvatar: () =>
        set((state) => ({ profile: { ...state.profile, avatar: '' } })),
      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        // Persist only the profile's avatar, rest comes from API
        profile: {
          avatar: state.profile.avatar,
        },
      }),
    }
  )
);
