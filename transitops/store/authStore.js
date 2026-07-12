import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: {
    name: "Raven K.",
    role: "Dispatcher",
    initials: "RK",
  },
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));