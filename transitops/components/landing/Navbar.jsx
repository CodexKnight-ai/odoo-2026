"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, X, ArrowRight, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true)
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 shadow-xs">
            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            TransitOps
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#workflow" className="transition-colors hover:text-foreground">Interactive Demo</a>
          <a href="#roles" className="transition-colors hover:text-foreground">Roles</a>
          <a href="#analytics" className="transition-colors hover:text-foreground">Analytics</a>
          <a href="#tech" className="transition-colors hover:text-foreground">Tech Stack</a>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
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

          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs transition-all">
            <span className="flex items-center gap-1.5">
              Launch App <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-3 text-sm font-medium text-muted-foreground">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="block py-2 hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#workflow"
              onClick={() => setIsOpen(false)}
              className="block py-2 hover:text-foreground transition-colors"
            >
              Interactive Demo
            </a>
            <a
              href="#roles"
              onClick={() => setIsOpen(false)}
              className="block py-2 hover:text-foreground transition-colors"
            >
              Roles
            </a>
            <a
              href="#analytics"
              onClick={() => setIsOpen(false)}
              className="block py-2 hover:text-foreground transition-colors"
            >
              Analytics
            </a>
            <a
              href="#tech"
              onClick={() => setIsOpen(false)}
              className="block py-2 hover:text-foreground transition-colors"
            >
              Tech Stack
            </a>
          </nav>
          <div className="pt-4 border-t border-border">
            <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center gap-2">
              Launch App <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
