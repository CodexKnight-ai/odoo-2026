"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Boxes,
  Users,
  GitBranch,
  Wrench,
  DollarSign,
  LineChart,
  Settings,
  ShieldCheck,
} from "lucide-react";
const NAV_ITEMS = [
  { label: "Dashboard", sub: "Operational Console", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vehicles", sub: "Fleet Registry", href: "/vehicles", icon: Boxes },
  { label: "Operators", sub: "Team Tracker", href: "/drivers", icon: Users },
  { label: "Workflows", sub: "Trip Dispatcher", href: "/trips", icon: GitBranch },
  { label: "Maintenance", sub: "Service Logs", href: "/maintenance", icon: Wrench },
  { label: "Expenses", sub: "Fuel & Incidentals", href: "/expenses", icon: DollarSign },
  { label: "Analytics", sub: "ROI & Reports", href: "/analytics", icon: LineChart },
  { label: "Settings", sub: "RBAC & Profiles", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-200 bg-slate-50 px-4 py-6">
      {/* Brand Header */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 shadow-sm">
          <ShieldCheck className="h-5 w-5 text-slate-900" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none">TransitOps</h1>
          <span className="text-[10px] font-medium text-slate-400 tracking-widest uppercase">v1.2.0 Console</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 group border border-transparent",
                isActive
                  ? "bg-amber-100 border-amber-300 text-amber-900 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105", 
                isActive ? "text-amber-800" : "text-slate-400 group-hover:text-slate-600"
              )} />
              
              <div className="flex flex-col leading-none">
                <span className="font-semibold text-xs">{item.label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 group-hover:text-slate-500 font-medium">
                  {item.sub}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-slate-200 pt-4 px-2">
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-2.5 border border-slate-200">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            RBAC Guard Active
          </span>
        </div>
      </div>
    </aside>
  );
}