import { create } from "zustand";
import { watchAuth, getPlayerProfile } from "../firebase/auth";

export const useAuthStore = create((set) => ({
  user: null,          // Firebase user
  profile: null,       // профиль игрока из Firestore
  loading: true,
  profileChecked: false,

  init: () => {
    watchAuth(async (user) => {
      if (user) {
        const profile = await getPlayerProfile(user.uid);
        set({ user, profile, loading: false, profileChecked: true });
      } else {
        set({ user: null, profile: null, loading: false, profileChecked: true });
      }
    });
  },

  setProfile: (profile) => set({ profile }),
}));