import { create } from "zustand";

export const useFilterStore = create((set) => ({
  vehicleType: "All",
  status: "All",
  region: "All",
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
}));