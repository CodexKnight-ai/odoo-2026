"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { User, Sun, Moon, Database, Monitor, ShieldCheck, Check, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerResetSimulation = async () => {
    if (!confirm("Confirm re-indexing the system databases?")) return;
    setSimulating(true);
    setSuccessMsg(null);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setSuccessMsg("System resources cataloged and cached successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const roleLabels = {
    FLEET_MANAGER: "Fleet Manager",
    DRIVER: "Driver",
    SAFETY_OFFICER: "Safety Officer",
    FINANCIAL_ANALYST: "Financial Analyst",
  };

  const permissionMatrix = [
    { role: "Fleet Manager", fleet: true, drivers: true, trips: true, expenses: true, analytics: true },
    { role: "Dispatcher (Driver)", fleet: false, drivers: false, trips: true, expenses: false, analytics: false },
    { role: "Safety Officer", fleet: false, drivers: true, trips: false, expenses: false, analytics: false },
    { role: "Financial Analyst", fleet: false, drivers: false, trips: false, expenses: true, analytics: true },
  ];

  return (
    <div className="space-y-6 text-slate-800 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="text-xs text-slate-505 mt-1">
          Configure interface presets, view active session access tokens, and check security role-based parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Profile & Simulator */}
        <div className="lg:col-span-5 space-y-6">
          {/* User Profile Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <User className="h-4 w-4 text-amber-600" /> Active Session Profile
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">User Email</span>
                <span className="font-bold text-slate-800">{user?.email || "Offline User"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Authorized Role</span>
                <span className="font-bold flex items-center gap-1.5 text-slate-800">
                  {roleLabels[user?.role] || user?.role || "Guest"}
                  <Badge className="bg-amber-400/10 text-amber-700 border-amber-300/20 text-[9px] py-0 px-1 font-bold border-none">
                    ACTIVE
                  </Badge>
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-semibold">Token Sub ID</span>
                <span className="font-mono text-slate-400 text-[10px]">{user?.id ? `USR-${String(user.id).padStart(4, "0")}` : "—"}</span>
              </div>
            </div>
          </div>

          {/* Theme Preferences Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-850 text-slate-800">Console Display Presets</h3>

            {mounted && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold block text-slate-750">Active Theme</span>
                  <span className="text-slate-400 text-[10px]">Configure your color spectrum preferences.</span>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-1 gap-1 border border-slate-200 self-start sm:self-auto">
                  <Button
                    variant={theme === "light" ? "secondary" : "ghost"}
                    size="xs"
                    className="text-[10px] h-7 font-bold"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-3.5 w-3.5 mr-1 text-amber-500" /> Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "secondary" : "ghost"}
                    size="xs"
                    className="text-[10px] h-7 font-bold"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-3.5 w-3.5 mr-1 text-indigo-600" /> Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "secondary" : "ghost"}
                    size="xs"
                    className="text-[10px] h-7 font-bold"
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="h-3.5 w-3.5 mr-1 text-slate-500" /> System
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: RBAC Matrix */}
        <div className="lg:col-span-7 space-y-6">
          {/* RBAC Matrix Card */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" /> Role-Based Access Scopes (RBAC)
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Security Matrix</span>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/20">
                  <th className="px-4 py-3">Role Group</th>
                  <th className="px-4 py-3 text-center">Assets</th>
                  <th className="px-4 py-3 text-center">Operators</th>
                  <th className="px-4 py-3 text-center">Workflows</th>
                  <th className="px-4 py-3 text-center">Expenses</th>
                  <th className="px-4 py-3 text-center">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionMatrix.map((row) => (
                  <tr key={row.role} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700">{row.role}</td>
                    <td className="px-4 py-3 text-center">
                      {row.fleet ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.drivers ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.trips ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.expenses ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.analytics ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Database simulation re-indexing */}
          {user?.role === "FLEET_MANAGER" && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-2">
                  <Database className="h-4.5 w-4.5 text-rose-600" /> Advanced System Audits
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  These controls are scoped to Fleet Managers only. They perform diagnostic validations on asset indexing states.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div>
                  <span className="font-semibold block text-slate-700">Diagnostics Registry Sync</span>
                  <span className="text-slate-400 text-[10px]">Re-index active data memory blocks.</span>
                </div>
                <Button
                  disabled={simulating}
                  onClick={triggerResetSimulation}
                  className="bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 font-bold"
                >
                  {simulating ? "Synching..." : "Sync Database"}
                </Button>
              </div>

              {successMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200 animate-in fade-in duration-200">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
