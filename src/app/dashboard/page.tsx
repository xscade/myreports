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
      title: "Total Parameters",
      value: stats.totalParameters,
      icon: Activity,
      change: "+12%",
      trend: "up",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Reports Analyzed",
      value: stats.totalReports,
      icon: FileText,
      change: "+5%",
      trend: "up",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Abnormal Values",
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
      title: "Upload Reports",
      description: "Extract data from medical documents",
      icon: Upload,
      href: "/dashboard/upload",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "View Data Table",
      description: "Browse all extracted parameters",
      icon: Table2,
      href: "/dashboard/table",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Analytics",
      description: "Visualize trends and patterns",
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
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, <span className="text-purple-600 dark:text-purple-400">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your medical reports and health data.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="card-hover overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">
                      {stat.value}
                      {stat.suffix}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your medical data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href={action.href}>
                      <div className="group flex flex-col items-center rounded-xl border border-border p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                        <div
                          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${action.color} transition-transform group-hover:scale-110`}
                        >
                          <action.icon className="h-7 w-7" />
                        </div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
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

        {/* Health Overview */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Health Overview</CardTitle>
              <CardDescription>Your latest health metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
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
                <div className="flex items-center justify-between text-sm">
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
              <div className="pt-4">
                <Link href="/dashboard/upload">
                  <Button variant="wednesday" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Report
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Parameters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Parameters</CardTitle>
              <CardDescription>
                Latest extracted lab parameters from your reports
              </CardDescription>
            </div>
            <Link href="/dashboard/table">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentParameters.length > 0 ? (
              <div className="space-y-4">
                {recentParameters.map((param, index) => (
                  <motion.div
                    key={param.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{param.parameterName}</p>
                      <p className="text-sm text-muted-foreground">
                        {param.testDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {param.value} {param.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
                      >
                        {param.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">No parameters yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your first medical report to get started
                </p>
                <Link href="/dashboard/upload" className="mt-4">
                  <Button variant="wednesday">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Report
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

