import { create } from "zustand";
import type { UserData } from "../types";

interface AppState {
  // Auth & User
  currentUser: UserData | null;
  setCurrentUser: (user: UserData | null) => void;

  // Admin Mode
  isAdminMode: boolean;
  setAdminMode: (isStack: boolean) => void;

  // UI State
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Video Playback Preferences
  isVideoMuted: boolean;
  setVideoMuted: (muted: boolean) => void;

  // Active Video (for managing play state globally if needed)
  activeVideoId: string | null;
  setActiveVideoId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  isAdminMode: false,
  setAdminMode: (isAdminMode) => set({ isAdminMode }),

  isDarkMode: false, // Default to light mode (YouTube style)
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  isVideoMuted: true, // Start muted for autoplay policy
  setVideoMuted: (isVideoMuted) => set({ isVideoMuted }),

  activeVideoId: null,
  setActiveVideoId: (activeVideoId) => set({ activeVideoId }),
}));
