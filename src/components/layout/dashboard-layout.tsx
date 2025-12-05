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
    <div className="h-screen bg-background">
      {/* Fixed Header on Mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden">
        <Navbar />
      </div>
      
      <div className="flex h-full">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex flex-1 flex-col min-h-0">
          {/* Desktop Navbar - Not fixed, flows with content */}
          <div className="hidden md:block">
            <Navbar />
          </div>
          
          {/* Main Content - Scrollable */}
          <AnimatePresence mode="wait">
            <motion.main
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto overflow-x-hidden gradient-purple-glow pattern-dots"
            >
              {/* 
                Mobile: pt-16 for fixed header, pb-20 for bottom nav
                Desktop: normal padding 
              */}
              <div className="container mx-auto p-4 pt-[72px] pb-24 md:pt-4 md:pb-6 lg:p-6">
                {children}
              </div>
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Bottom Navigation - Fixed on mobile */}
      <BottomNav />
    </div>
  )
}
