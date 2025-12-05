"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import { BottomNav } from "./bottom-nav"
import { useAppStore } from "@/store/app-store"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { checkAuth, user, fetchLabParameters, updateStats } = useAppStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authenticatedUser = await checkAuth()
        
        if (!authenticatedUser) {
          router.replace("/")
          return
        }
        
        // Fetch user's lab parameters
        await fetchLabParameters()
        updateStats()
      } catch (error) {
        console.error('Auth verification failed:', error)
        router.replace("/")
      } finally {
        setIsChecking(false)
      }
    }

    verifyAuth()
  }, [checkAuth, fetchLabParameters, updateStats, router])

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"
          />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // If no user after checking, don't render anything (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto overflow-x-hidden gradient-purple-glow pattern-dots"
          >
            {/* Add padding bottom for mobile bottom nav */}
            <div className="container mx-auto p-4 pb-24 md:pb-6 lg:p-6">
              {children}
            </div>
          </motion.main>
        </AnimatePresence>
      </div>
      
      {/* Bottom Navigation - Only on mobile */}
      <BottomNav />
    </div>
  )
}
