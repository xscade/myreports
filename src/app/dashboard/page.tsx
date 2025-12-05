"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Activity,
  FileText,
  AlertTriangle,
  TrendingUp,
  Upload,
  Table2,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAppStore } from "@/store/app-store"
import Link from "next/link"

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
} as const

export default function DashboardPage() {
  const { user, labParameters, stats, updateStats } = useAppStore()

  React.useEffect(() => {
    updateStats()
  }, [labParameters, updateStats])

  const statsCards = [
    {
      title: "Parameters",
      value: stats.totalParameters,
      icon: Activity,
      change: "+12%",
      trend: "up",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Reports",
      value: stats.totalReports,
      icon: FileText,
      change: "+5%",
      trend: "up",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Abnormal",
      value: stats.abnormalCount,
      icon: AlertTriangle,
      change: "-3%",
      trend: "down",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Health Score",
      value: stats.totalParameters > 0 
        ? Math.round(((stats.totalParameters - stats.abnormalCount) / stats.totalParameters) * 100)
        : 100,
      icon: TrendingUp,
      suffix: "%",
      change: "+2%",
      trend: "up",
      color: "from-green-500 to-green-600",
    },
  ]

  const quickActions = [
    {
      title: "Upload",
      description: "Extract from documents",
      icon: Upload,
      href: "/dashboard/upload",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Data",
      description: "Browse parameters",
      icon: Table2,
      href: "/dashboard/table",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Analytics",
      description: "View trends",
      icon: LineChart,
      href: "/dashboard/analytics",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
  ]

  const recentParameters = labParameters.slice(-5).reverse()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 md:space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Welcome back, <span className="text-purple-600 dark:text-purple-400">{user?.name}</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Your medical reports overview
        </p>
      </motion.div>

      {/* Stats Cards - 2x2 grid on mobile */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="card-hover overflow-hidden">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 md:space-y-1 min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                      {stat.value}
                      {stat.suffix}
                    </p>
                  </div>
                  <div
                    className={`flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg md:rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                  >
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
                <div className="mt-2 md:mt-4 flex items-center gap-1 md:gap-2">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs md:text-sm font-medium ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions - Horizontal scroll on mobile */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Manage your medical data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {quickActions.map((action) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={action.href}>
                    <div className="group flex flex-col items-center rounded-xl border border-border p-3 md:p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                      <div
                        className={`mb-2 md:mb-4 flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-xl ${action.color} transition-transform group-hover:scale-110`}
                      >
                        <action.icon className="h-5 w-5 md:h-7 md:w-7" />
                      </div>
                      <h3 className="text-xs md:text-base font-semibold">{action.title}</h3>
                      <p className="mt-0.5 md:mt-1 text-[10px] md:text-sm text-muted-foreground hidden sm:block">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Recent Parameters */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 md:pb-6">
              <div>
                <CardTitle className="text-base md:text-lg">Recent Parameters</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Latest extracted values
                </CardDescription>
              </div>
              <Link href="/dashboard/table">
                <Button variant="outline" size="sm" className="text-xs md:text-sm h-8">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentParameters.length > 0 ? (
                <div className="space-y-2 md:space-y-4">
                  {recentParameters.map((param, index) => (
                    <motion.div
                      key={param.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between rounded-lg border border-border p-2.5 md:p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="space-y-0.5 md:space-y-1 min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate pr-2">{param.parameterName}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {param.testDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <div className="text-right">
                          <p className="font-semibold text-sm md:text-base">
                            {param.value} <span className="text-xs md:text-sm text-muted-foreground">{param.unit}</span>
                          </p>
                          <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
                            Normal: {param.normalRange}
                          </p>
                        </div>
                        <Badge
                          variant={
                            param.status === "Normal"
                              ? "success"
                              : param.status === "High"
                              ? "error"
                              : "info"
                          }
                          className="text-[10px] md:text-xs px-1.5 md:px-2"
                        >
                          {param.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
                  <div className="mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">No parameters yet</h3>
                  <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                    Upload your first report
                  </p>
                  <Link href="/dashboard/upload" className="mt-3 md:mt-4">
                    <Button variant="wednesday" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Overview */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-base md:text-lg">Health Overview</CardTitle>
              <CardDescription className="text-xs md:text-sm">Your health metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Normal Values</span>
                  <span className="font-medium text-green-500">
                    {stats.totalParameters - stats.abnormalCount}
                  </span>
                </div>
                <Progress
                  value={
                    stats.totalParameters > 0
                      ? ((stats.totalParameters - stats.abnormalCount) /
                          stats.totalParameters) *
                        100
                      : 100
                  }
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Abnormal Values</span>
                  <span className="font-medium text-orange-500">
                    {stats.abnormalCount}
                  </span>
                </div>
                <Progress
                  value={
                    stats.totalParameters > 0
                      ? (stats.abnormalCount / stats.totalParameters) * 100
                      : 0
                  }
                  className="h-2 [&>div]:bg-orange-500"
                />
              </div>
              <div className="pt-2 md:pt-4">
                <Link href="/dashboard/upload">
                  <Button variant="wednesday" className="w-full" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Report
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
