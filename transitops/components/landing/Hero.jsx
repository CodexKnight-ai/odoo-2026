"use client"

import { ArrowRight, CheckCircle2, ShieldCheck, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40">
      {/* Background Gradients - Subtle and Single Color */}
      <div className="absolute inset-0 -z-10 bg-radial-[circle_at_top_right] from-slate-100 via-transparent to-transparent dark:from-slate-900/30" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">      
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900 dark:text-white">
              Centralized Fleet Control,{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Zero Friction
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Transition from fragmented spreadsheets to TransitOps. Register assets, track driver compliance, automate dispatch safety rules, log maintenance triggers, and analyze real-time ROI on a unified web console.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a href="#workflow">
                <Button size="lg" className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs transition-all">
                  Try Interactive Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#roles">
                <Button size="lg" variant="outline" className="rounded-xl px-6 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                  Explore Roles
                </Button>
              </a>
            </div>

            {/* Core Value Props */}
            <div className="pt-6 grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Automatic Transitions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Cargo Weight Limits</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Driver License Audits</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Real-Time ROI Metrics</span>
              </div>
            </div>
          </div>

          {/* Clean UI Mockup */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
            <div className="relative w-full max-w-md md:max-w-lg aspect-square sm:aspect-video lg:aspect-square rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4 shadow-xl backdrop-blur-xl">
              
              {/* Header inside mock */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-[10px] text-slate-400 dark:text-slate-600 ml-2 font-mono">transitops-v1.0.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">Live Dispatch Console</span>
                </div>
              </div>

              {/* Mock Dashboard Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 p-3">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Fleet Utilization</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-extrabold text-slate-950 dark:text-white">84.2%</span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">+2.4%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full w-[84%]" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 p-3">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Active Deliveries</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-extrabold text-slate-950 dark:text-white">12</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">/ 15 Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">3 vehicles in maintenance</span>
                  </div>
                </div>
              </div>

              {/* Mock Dispatch Queue */}
              <div className="rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 p-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Active Dispatch Logs</span>
                
                {/* Log item 1 */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold">V-5</div>
                    <div>
                      <span className="text-[11px] font-semibold block text-slate-900 dark:text-white">Van-05 <span className="text-slate-400 dark:text-slate-500 font-normal">→ Alex</span></span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">Cargo: 450kg / 500kg limit</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-2 py-0.5 rounded-full font-bold">ON TRIP</span>
                </div>

                {/* Log item 2 */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">V-2</div>
                    <div>
                      <span className="text-[11px] font-semibold block text-slate-900 dark:text-white">Truck-02 <span className="text-slate-400 dark:text-slate-500 font-normal">→ Davis</span></span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">Completed: 120km trip</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded-full font-bold">AVAILABLE</span>
                </div>

                {/* Log item 3 */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">V-9</div>
                    <div>
                      <span className="text-[11px] font-semibold block text-slate-900 dark:text-white">Semi-09 <span className="text-slate-400 dark:text-slate-500 font-normal">→ Shop #4</span></span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">Maintenance: Engine Tune-up</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 px-2 py-0.5 rounded-full font-bold">IN SHOP</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
