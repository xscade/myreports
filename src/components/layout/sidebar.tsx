"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  Upload, 
  Table2, 
  LineChart, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileHeart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/app-store"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Upload Reports",
    href: "/dashboard/upload",
    icon: Upload,
  },
  {
    title: "Data Table",
    href: "/dashboard/table",
    icon: Table2,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: LineChart,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen, logout } = useAppStore()

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
          x: 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar-background",
          "lg:relative lg:z-auto"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/30"
            >
              <FileHeart className="h-5 w-5 text-white" />
            </motion.div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg text-sidebar-foreground"
                >
                  MedReports
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-purple-500/20"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                      isActive && "text-white"
                    )}
                  />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="truncate"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 h-8 w-1 rounded-r-full bg-white"
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            onClick={() => {
              logout()
              window.location.href = "/login"
            }}
            className={cn(
              "w-full justify-start gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-600",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.aside>
    </>
  )
}

