"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useAppStore } from "@/store/app-store"

// Dynamic import to avoid SSR hydration issues
const DashboardLayout = dynamic(
  () => import("@/components/layout/dashboard-layout").then((mod) => mod.DashboardLayout),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    ),
  }
)

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAppStore()
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    // Check if user is logged in
    // If not, redirect to home page
    if (!user) {
      router.push("/")
    } else {
      setIsChecking(false)
    }
  }, [user, router])

  // Show loading while checking auth
  if (isChecking || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
