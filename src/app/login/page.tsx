"use client"

import dynamic from "next/dynamic"

// Dynamic import with no SSR to avoid hydration issues from browser extensions
const LoginContent = dynamic(
  () => import("@/components/pages/login-content").then((mod) => mod.LoginContent),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-950/30 dark:via-background dark:to-purple-900/20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    ),
  }
)

export default function LoginPage() {
  return <LoginContent />
}
