"use client"

import { Activity } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-slate-50/50 dark:bg-slate-950/20 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/60 pb-8">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1.5 shadow-xs">
              <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white text-sm">
              TransitOps
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-slate-900 dark:hover:text-white transition-colors">Interactive Demo</a>
            <a href="#roles" className="hover:text-slate-900 dark:hover:text-white transition-colors">Roles</a>
            <a href="#analytics" className="hover:text-slate-900 dark:hover:text-white transition-colors">Analytics</a>
            <a href="#tech" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tech Stack</a>
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 TransitOps. Smart Transport Operations Platform. Hackathon Entry.</p>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-semibold text-slate-900 dark:text-white">Next.js + TailwindCSS v4 + Shadcn UI</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
