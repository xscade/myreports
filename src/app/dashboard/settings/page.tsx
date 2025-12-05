"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { User, Bell, Shield, Palette, Moon, Sun, Monitor, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/store/app-store"
import { useTheme } from "next-themes"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
} as const

export default function SettingsPage() {
  const { user, clearLabParameters, updateStats } = useAppStore()
  const { theme, setTheme } = useTheme()

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all lab data? This cannot be undone.")) {
      clearLabParameters()
      updateStats()
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Settings */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                <CardTitle>Profile</CardTitle>
              </div>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 ring-4 ring-purple-500/20">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white text-2xl">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={user?.name || ""}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ""}
                    placeholder="Your email"
                  />
                </div>
              </div>

              <Button variant="wednesday">Save Changes</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Theme Settings */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-500" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>
                Customize the look and feel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:border-purple-500/50 ${
                    theme === "light" ? "border-purple-500 bg-purple-500/5" : ""
                  }`}
                >
                  <Sun className="h-6 w-6" />
                  <span className="text-sm">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:border-purple-500/50 ${
                    theme === "dark" ? "border-purple-500 bg-purple-500/5" : ""
                  }`}
                >
                  <Moon className="h-6 w-6" />
                  <span className="text-sm">Dark</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:border-purple-500/50 ${
                    theme === "system" ? "border-purple-500 bg-purple-500/5" : ""
                  }`}
                >
                  <Monitor className="h-6 w-6" />
                  <span className="text-sm">System</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-500" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Email Notifications", desc: "Receive updates via email" },
                { title: "Report Alerts", desc: "Get notified about abnormal values" },
                { title: "Weekly Summary", desc: "Weekly health summary reports" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" defaultChecked={index === 0} />
                    <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-purple-500 peer-focus:ring-2 peer-focus:ring-purple-500/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <Button variant="outline" className="w-full">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants}>
          <Card className="border-red-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <h4 className="font-medium text-red-600">Clear All Data</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  This will permanently delete all your lab parameters and reports.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4"
                  onClick={handleClearData}
                >
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

