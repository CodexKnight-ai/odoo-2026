"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

const ROLE_LABELS = {
  FLEET_MANAGER: "Fleet Manager",
  DRIVER: "Driver",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
};

export default function Topbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    setMounted(true);
    hydrate();
  }, [hydrate]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const displayName = user?.email
    ? user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "User";

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <Input placeholder="Search..." className="max-w-xs" />

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </Button>
        )}

        {/* User Info */}
        <span className="text-sm text-slate-700 font-medium">{displayName}</span>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1">
          <span className="text-xs text-slate-500 font-medium">{roleLabel}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900">
            {initials}
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-9 h-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}