"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAppStore } from "@/store/app-store"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export function LoginContent() {
  const router = useRouter()
  const { setUser, fetchLabParameters } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }
    
    if (isRegister && !name) {
      setError("Please enter your name")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    
    setIsLoading(true)

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const body = isRegister 
        ? { email, password, name }
        : { email, password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Authentication failed')
        setIsLoading(false)
        return
      }

      // Set user in store
      setUser(data.user)
      
      // Fetch lab parameters for this user
      await fetchLabParameters()
      
      // Navigate to dashboard
      router.replace("/dashboard")
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" suppressHydrationWarning>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900" />
      
      {/* Floating orbs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-20 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl"
      />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-purple-200/50 dark:border-purple-800/50 shadow-2xl">
            <CardHeader className="space-y-3 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isRegister 
                  ? 'Sign up to start tracking your medical reports'
                  : 'Sign in to access your medical reports dashboard'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                
                <AnimatePresence>
                  {isRegister && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label htmlFor="name">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          autoComplete="name"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={isRegister ? "Create a password (min 6 chars)" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete={isRegister ? "new-password" : "current-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    variant="wednesday"
                    className="w-full h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      isRegister ? "Create Account" : "Sign In"
                    )}
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {isRegister ? "Already have an account? " : "Don't have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(!isRegister)
                      setError("")
                    }}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
                  >
                    {isRegister ? "Sign In" : "Sign Up"}
                  </button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer text */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          Your medical data is securely stored and encrypted
        </motion.p>
      </motion.div>
    </div>
  )
}
