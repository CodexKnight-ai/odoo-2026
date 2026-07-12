"use client";

import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";

export default function Topbar() {
  const user = useAuthStore((state) => state.user) || {
    name: "Raven K.",
    role: "Dispatcher",
    initials: "RK",
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3">
      <Input placeholder="Search..." className="max-w-xs" />

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-700">{user.name}</span>
        <div className="flex items-center gap-2 rounded-full border px-2 py-1">
          <span className="text-xs text-slate-500">{user.role}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
            {user.initials}
          </div>
        </div>
      </div>
    </header>
  );
}