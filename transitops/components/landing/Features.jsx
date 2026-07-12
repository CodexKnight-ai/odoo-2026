"use client"

import { ShieldCheck, Truck, Users, Waypoints, Wrench, Coins, Download, Key } from "lucide-react"

export default function Features() {
  const featuresList = [
    {
      title: "Secure RBAC Auth",
      description: "Secure login using email and passwords. Built-in Role-Based Access Control tailors the console view to Fleet Managers, Drivers, Safety Officers, or Financial Analysts.",
      icon: Key,
      badge: "Requirement 3.1"
    },
    {
      title: "Unique Vehicle Registry",
      description: "Maintain a clean master list of vehicles with Unique Registration Numbers, models, load capacities, live odometers, acquisition costs, and automatic availability statuses.",
      icon: Truck,
      badge: "Requirement 3.3"
    },
    {
      title: "Driver Safety Tracker",
      description: "Manage driver profiles with licensing category, contact numbers, expiry tracking, and safety scores to enforce strict compliance and license audits.",
      icon: Users,
      badge: "Requirement 3.4"
    },
    {
      title: "Automated Dispatch Rules",
      description: "Create trips by setting sources, cargo load, and routes. System validates cargo weight limits and availability of drivers/vehicles, transitioning statuses automatically.",
      icon: Waypoints,
      badge: "Requirement 3.5"
    },
    {
      title: "Smart Maintenance Logs",
      description: "Filing an active maintenance ticket automatically moves a vehicle to 'In Shop' status, immediately excluding it from active dispatch pools until the log is closed.",
      icon: Wrench,
      badge: "Requirement 3.6"
    },
    {
      title: "Fuel & Expense Tracking",
      description: "Log fuel purchases (liters, cost, date) and other tolls or service expenses. System aggregates total operating costs per asset in real time.",
      icon: Coins,
      badge: "Requirement 3.7"
    },
    {
      title: "Calculated ROI Reports",
      description: "Analyze metrics like Distance-per-Fuel (efficiency), fleet usage ratios, and individual Vehicle ROI using the formula: [Revenue - (Maint + Fuel)] / Acquisition Cost.",
      icon: ShieldCheck,
      badge: "Requirement 3.8"
    },
    {
      title: "Data Portability (CSV)",
      description: "Download filtered tables, operational cost breakdowns, fuel efficiencies, and historical dispatch files in CSV format for offline backups and spreadsheets.",
      icon: Download,
      badge: "Requirement 3.8"
    }
  ]

  return (
    <section id="features" className="py-20 border-t border-border/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Fully Compliant Feature Matrix
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Every core functional requirement and business rule implemented under a modular architecture.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featuresList.map((f, idx) => {
            const Icon = f.icon
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-350"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-indigo-600 dark:text-indigo-400 transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-800">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
