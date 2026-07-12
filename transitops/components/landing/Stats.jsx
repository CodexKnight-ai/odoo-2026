"use client"

import { useState } from "react"
import { Truck, Users, Waypoints, Wrench, BarChart3, ShieldAlert, Globe } from "lucide-react"

export default function Stats() {
  const [regionFilter, setRegionFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Simulated metrics based on filter combinations
  const getMetrics = () => {
    let multiplier = 1
    if (regionFilter === "north") multiplier = 0.6
    else if (regionFilter === "south") multiplier = 0.4
    
    if (typeFilter === "trucks") multiplier *= 0.5
    else if (typeFilter === "vans") multiplier *= 0.4

    return {
      activeVehicles: Math.max(1, Math.round(12 * multiplier)),
      availableVehicles: Math.max(1, Math.round(8 * multiplier)),
      inMaintenance: Math.max(0, Math.round(3 * multiplier)),
      activeTrips: Math.max(1, Math.round(5 * multiplier)),
      pendingTrips: Math.max(0, Math.round(2 * multiplier)),
      driversOnDuty: Math.max(1, Math.round(14 * multiplier)),
      utilization: Math.min(98, Math.max(45, Math.round(84.2 * (regionFilter === "all" ? 1 : 0.95)))),
    }
  }

  const m = getMetrics()

  const cardData = [
    {
      title: "Fleet Utilization",
      value: `${m.utilization}%`,
      description: "Percentage of active fleet vs total",
      icon: BarChart3,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30",
      progress: m.utilization,
    },
    {
      title: "Active Vehicles",
      value: m.activeVehicles,
      description: "Vehicles currently en route",
      icon: Truck,
      color: "text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800",
    },
    {
      title: "Available Vehicles",
      value: m.availableVehicles,
      description: "Ready for immediate dispatch",
      icon: Globe,
      color: "text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800",
    },
    {
      title: "In Maintenance",
      value: m.inMaintenance,
      description: "Status marked 'In Shop'",
      icon: Wrench,
      color: "text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800",
    },
    {
      title: "Active / Pending Trips",
      value: `${m.activeTrips} / ${m.pendingTrips}`,
      description: "Dispatched vs draft status",
      icon: Waypoints,
      color: "text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800",
    },
    {
      title: "Drivers On Duty",
      value: m.driversOnDuty,
      description: "Available & en-route drivers",
      icon: Users,
      color: "text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800",
    },
  ]

  return (
    <section id="analytics" className="py-20 bg-slate-50/50 dark:bg-slate-950/20 relative border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Real-Time Fleet Diagnostics
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Explore live key performance indicators across your logistics networks.
            </p>
          </div>

          {/* Interactive Filters Mock */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-background p-1 text-xs">
              <span className="px-2 py-1 text-slate-400 dark:text-slate-500 font-medium">Region:</span>
              {["all", "north", "south"].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setRegionFilter(reg)}
                  className={`rounded-md px-2.5 py-1 font-semibold uppercase tracking-wider transition-all ${
                    regionFilter === reg
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-background p-1 text-xs">
              <span className="px-2 py-1 text-slate-400 dark:text-slate-500 font-medium">Type:</span>
              {["all", "trucks", "vans"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-md px-2.5 py-1 font-semibold uppercase tracking-wider transition-all ${
                    typeFilter === t
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cardData.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-2xs hover:shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {card.title}
                    </p>
                    <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {card.value}
                    </h3>
                  </div>
                  <div className={`rounded-xl border p-3 ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>

                {card.progress !== undefined && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Business Rule Warning Badge */}
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-500 dark:text-amber-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div>
            <span className="font-semibold">Hackathon Rules Enforced:</span> Retired or &quot;In Shop&quot; vehicles, and drivers with expired licenses or suspended statuses, are dynamically excluded from dispatch workflows.
          </div>
        </div>

      </div>
    </section>
  )
}
