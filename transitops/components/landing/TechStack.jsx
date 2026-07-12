"use client"

import { Database, FileCode, CheckCircle, Layers, Sparkles } from "lucide-react"

export default function TechStack() {
  const techCards = [
    {
      title: "Expected Database Entities",
      desc: "Robust schema relationships mapping the complete transport network life cycle.",
      icon: Database,
      items: [
        "Users & Roles: RBAC authentication mapping",
        "Vehicles: Unique registration, stats, and states",
        "Drivers: Licenses, categories, and safety rating scores",
        "Trips: Sources, weights, distances, odometer updates",
        "Maintenance: Status toggles and shop ledger costs",
        "Fuel Logs & Expenses: Consumed liters and toll logs"
      ]
    },
    {
      title: "Architecture & Frameworks",
      desc: "Modern tooling optimized for fast load speeds, clean components, and accessibility.",
      icon: Layers,
      items: [
        "Next.js App Router: Seamless client & server components",
        "Tailwind CSS v4: Advanced utility tokens and styles",
        "Shadcn UI & Radix: Fully accessible keyboard controls",
        "Zod & React Hook Form: Rigid client-side data validation",
        "Mongoose & MDB: Scalable object document mapping"
      ]
    },
    {
      title: "Bonus Features Integrated",
      desc: "Enhanced workflows added beyond core specifications to maximize usability.",
      icon: Sparkles,
      items: [
        "Interactive Charts: Visual OPEX and ROI breakdowns",
        "Data Export: Full CSV download for analytical tasks",
        "Expiry Reminders: Alerts on licenses nearing expiration",
        "Asset Document Vault: Attach digital PDFs and slips",
        "Responsive Dark Mode: Theme adjustments"
      ]
    }
  ]

  return (
    <section id="tech" className="py-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System Architecture & Schemas
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            Inside the underlying tech stack and database layouts power the TransitOps platform.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {techCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-2xs hover:shadow-xs hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 text-indigo-650 dark:text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {card.desc}
                </p>

                {/* Sub-item bullet points */}
                <ul className="space-y-3 font-sans text-xs text-slate-550 dark:text-slate-400">
                  {card.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Database Tech Summary Banner */}
        <div className="mt-12 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Unified Schema Normalization
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Every operation strictly references MongoDB ObjectIDs to maintain referential integrity. When a dispatcher assigns `Driver ID` to `Trip ID`, checking the `Vehicle ID` status ensures double scheduling conflicts are resolved before data commit.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-3.5 py-1.5 rounded-xl font-mono text-[10px] text-slate-600 dark:text-slate-400">
            <FileCode className="h-4 w-4 text-indigo-650 dark:text-indigo-400" />
            <span>Mongoose.Schema( ... )</span>
          </div>
        </div>

      </div>
    </section>
  )
}
