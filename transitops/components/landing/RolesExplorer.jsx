"use client"

import { useState } from "react"
import { Shield, Eye, ShieldAlert, BarChart3, Wrench, Fuel, Landmark, ArrowRight, UserCheck, Waypoints } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RolesExplorer() {
  const [activeRole, setActiveRole] = useState("manager")

  const roles = [
    {
      id: "manager",
      name: "Fleet Manager",
      icon: UserCheck,
      tagline: "Oversees fleet assets, maintenance logs, and vehicle life cycle.",
      points: [
        "Track vehicle registry database (Max Load, Odometer, Statuses).",
        "Add vehicles to active maintenance tickets to trigger 'In Shop' state.",
        "Inspect active fleet status ratios in real-time."
      ],
      mockTitle: "Manager Assets Console",
      mockContent: (
        <div className="space-y-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1 font-bold text-slate-900 dark:text-white">
            <span>Asset Ref</span>
            <span>Type</span>
            <span>Odometer</span>
            <span>Status</span>
          </div>
          <div className="flex justify-between text-slate-900 dark:text-white">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Van-05</span>
            <span>Van</span>
            <span>10,300 km</span>
            <span className="text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 text-[9px] font-bold">Available</span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span className="font-semibold">Truck-01</span>
            <span>Truck</span>
            <span>45,000 km</span>
            <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 text-[9px] font-bold">On Trip</span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span className="font-semibold">Van-02</span>
            <span>Van</span>
            <span>22,500 km</span>
            <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/30 text-[9px] font-bold">In Shop</span>
          </div>
          <div className="flex justify-between text-slate-400 dark:text-slate-600">
            <span className="font-semibold">Semi-08</span>
            <span>Truck</span>
            <span>108,000 km</span>
            <span className="text-red-650 dark:text-red-405 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30 text-[9px] font-bold">Retired</span>
          </div>
          <div className="pt-2 flex gap-2">
            <Button size="xs" className="h-6 text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium border-0">
              + Register Vehicle
            </Button>
            <Button size="xs" variant="outline" className="h-6 text-[9px] border-slate-200 dark:border-slate-800">
              Manage Shops
            </Button>
          </div>
        </div>
      )
    },
    {
      id: "driver",
      name: "Driver / Dispatcher",
      icon: Waypoints,
      tagline: "Executes trips, handles cargo audits, and logs fuel purchases.",
      points: [
        "Create trips matching available drivers with available vehicles.",
        "Auto-validates cargo weight caps during dispatch submissions.",
        "Submits final odometer and fuel consumption logs to resolve trips."
      ],
      mockTitle: "Active Dispatch Terminal",
      mockContent: (
        <div className="space-y-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <div className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-900 dark:text-white">
            <div className="flex justify-between items-center text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
              <span>TRIP T-04 ACTIVE</span>
              <span className="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30 text-[9px] font-bold">ON TRIP</span>
            </div>
            <p className="font-semibold text-xs">Van-05 Transit ➔ Driver: Alex</p>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              <span>Cargo: 450kg / 500kg</span>
              <span>Dist: 300km</span>
              <span>Source: Whse A</span>
              <span>Dest: City Term</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="xs" className="h-6 text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium border-0">
              Complete & Log Expenses
            </Button>
            <Button size="xs" variant="outline" className="h-6 text-[9px] text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20 border-slate-200 dark:border-slate-800">
              Cancel Dispatch
            </Button>
          </div>
        </div>
      )
    },
    {
      id: "safety",
      name: "Safety Officer",
      icon: Shield,
      tagline: "Audits license expirations, compliance records, and driver safety ratings.",
      points: [
        "Enforce driving restrictions: exclude drivers with expired licenses.",
        "Review safety scores: block suspended profiles from trip selectors.",
        "Track compliance alerts for upcoming renewals."
      ],
      mockTitle: "Safety & Compliance Audit",
      mockContent: (
        <div className="space-y-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1 font-bold text-slate-900 dark:text-white">
            <span>Driver</span>
            <span>Safety Score</span>
            <span>License Expiry</span>
            <span>Status</span>
          </div>
          <div className="flex justify-between text-slate-900 dark:text-white">
            <span className="font-semibold">Alex</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">95/100</span>
            <span>2028-11-20</span>
            <span className="text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 text-[9px] font-bold">Available</span>
          </div>
          <div className="flex justify-between text-slate-900 dark:text-white">
            <span className="font-semibold">Sarah Connor</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">98/100</span>
            <span>2029-05-15</span>
            <span className="text-blue-600 dark:text-blue-405 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 text-[9px] font-bold">On Trip</span>
          </div>
          <div className="flex justify-between text-amber-600 dark:text-amber-400">
            <span className="font-semibold text-slate-900 dark:text-white">Marcus Wright</span>
            <span className="font-bold">42/100</span>
            <span>2026-06-01</span>
            <span className="text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/30 text-[9px] font-bold">Suspended</span>
          </div>
          <div className="flex justify-between text-red-600 dark:text-red-400">
            <span className="font-semibold text-slate-900 dark:text-white">Kyle Reese</span>
            <span className="font-bold">88/100</span>
            <span className="underline decoration-wavy">2026-01-10</span>
            <span className="text-red-655 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30 text-[9px] font-bold">EXPIRED</span>
          </div>
        </div>
      )
    },
    {
      id: "finance",
      name: "Financial Analyst",
      icon: Landmark,
      tagline: "Tracks operational costs, fuel efficiency, and individual asset ROI.",
      points: [
        "Audit total operational expenses (Fuel logging + Maintenance fees).",
        "Monitor fuel efficiency (total trip distances vs fuel liters logged).",
        "Compare ROI per vehicle: [Revenue - (Maint + Fuel)] / Acquisition Cost."
      ],
      mockTitle: "Financial Analytics Ledger",
      mockContent: (
        <div className="space-y-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">OPEX LEDGER</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">$1,570.00</span>
              <span className="text-[9px] block text-slate-400 dark:text-slate-500">Van-05 costs</span>
            </div>
            <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">AVG EFFICIENCY</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-405 font-semibold">10.0 km/L</span>
              <span className="text-[9px] block text-slate-400 dark:text-slate-500">Van-05 efficiency</span>
            </div>
          </div>
          <div className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">VEHICLE ROI REPORT</span>
              <span className="text-[9px] text-indigo-650 dark:text-indigo-400 font-bold">+2.40%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-indigo-600 dark:bg-indigo-450 h-full rounded-full w-[24%]" />
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">Van-05 Net: $600.00 / Acq Cost: $25,000.00</span>
          </div>
        </div>
      )
    }
  ]

  const activeRoleData = roles.find(r => r.id === activeRole)

  return (
    <section id="roles" className="py-20 bg-slate-50/30 dark:bg-slate-900/10 relative border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
            Role-Based Access Control (RBAC)
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            TransitOps partitions data views and control states based on specific operational goals.
          </p>
        </div>

        {/* Roles Explorer Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Menu Buttons (Left) */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-3">
            {roles.map((role) => {
              const Icon = role.icon
              const isSelected = activeRole === role.id
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-2xs"
                      : "bg-card border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    isSelected ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-900 text-slate-450 dark:text-slate-500"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{role.name}</span>
                    <span className={`text-[10px] ${
                      isSelected ? "text-indigo-500 dark:text-indigo-300" : "text-slate-400 dark:text-slate-550"
                    }`}>
                      Click to inspect console view
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Details & Wireframe Mockup (Right) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 uppercase">
                  Persona View
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-850" />
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-550">RBAC Enforced</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {activeRoleData?.name} Console
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {activeRoleData?.tagline}
                </p>
              </div>

              {/* Point Bullet List */}
              <ul className="space-y-2 pt-2">
                {activeRoleData?.points.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Custom Console Mockup Frame */}
            <div className="mt-8 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 p-4 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">
                  {activeRoleData?.mockTitle}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  <Eye className="h-3 w-3" /> READ/WRITE
                </span>
              </div>
              
              {activeRoleData?.mockContent}
              
              {/* Wireframe background grid line */}
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-radial-[circle_at_bottom_right] from-slate-200/20 dark:from-slate-800/10 to-transparent pointer-events-none" />
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
