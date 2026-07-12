import { create } from "zustand";

function loadFromStorage() {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const token = localStorage.getItem("transitops_token");
    const user = localStorage.getItem("transitops_user");
    return { token, user: user ? JSON.parse(user) : null };
  } catch {
    return { user: null, token: null };
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  _hydrated: false,

  hydrate: () => {
    if (get()._hydrated) return;
    const { user, token } = loadFromStorage();
    set({ user, token, _hydrated: true });
  },

  login: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("transitops_token", token);
      localStorage.setItem("transitops_user", JSON.stringify(user));
    }
    set({ user, token });
  },

  logout: async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {
      // ignore — cookie will be cleared by the server response
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("transitops_token");
      localStorage.removeItem("transitops_user");
    }
    set({ user: null, token: null });
  },

  get isAuthenticated() {
    return !!get().token && !!get().user;
  },
}));