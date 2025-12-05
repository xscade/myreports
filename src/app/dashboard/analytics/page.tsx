"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts"
import { LineChart as LineChartIcon, Upload, TrendingUp, Activity, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/app-store"
import { ParameterChartData } from "@/types"
import Link from "next/link"

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value} {entry.payload.unit}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Parse normal range for reference lines
const parseNormalRange = (range: string) => {
  const numbers = range.match(/[\d.]+/g)
  if (!numbers) return { min: null, max: null }
  if (range.includes("-")) {
    return { min: parseFloat(numbers[0]), max: parseFloat(numbers[1]) }
  }
  if (range.includes("<")) {
    return { min: null, max: parseFloat(numbers[0]) }
  }
  if (range.includes(">")) {
    return { min: parseFloat(numbers[0]), max: null }
  }
  return { min: null, max: null }
}

// Individual Parameter Card Component
function ParameterCard({ paramData, isExpanded, onToggle }: { 
  paramData: ParameterChartData, 
  isExpanded: boolean, 
  onToggle: () => void 
}) {
  const { min, max } = parseNormalRange(paramData.normalRange)
  const latestValue = paramData.data[paramData.data.length - 1]?.value
  const previousValue = paramData.data[paramData.data.length - 2]?.value
  const trend = latestValue && previousValue 
    ? latestValue > previousValue ? "up" : latestValue < previousValue ? "down" : "stable"
    : "stable"

  return (
    <motion.div
      layout
      variants={itemVariants}
      className="overflow-hidden"
    >
      <Card className={`transition-all duration-300 ${isExpanded ? 'ring-2 ring-purple-500/50' : 'hover:shadow-lg'}`}>
        {/* Header - Always visible */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              trend === "up" ? "bg-orange-500/10" : trend === "down" ? "bg-blue-500/10" : "bg-green-500/10"
            }`}>
              <TrendingUp className={`h-6 w-6 ${
                trend === "up" ? "text-orange-500 rotate-0" : 
                trend === "down" ? "text-blue-500 rotate-180" : 
                "text-green-500"
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{paramData.parameterName}</h3>
              <p className="text-sm text-muted-foreground">
                {paramData.data.length} readings • {paramData.unit}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{latestValue || "—"}</p>
              <p className="text-xs text-muted-foreground">Latest value</p>
            </div>
            <Badge variant={
              latestValue && max && latestValue > max ? "error" :
              latestValue && min && latestValue < min ? "info" : "success"
            }>
              {latestValue && max && latestValue > max ? "High" :
               latestValue && min && latestValue < min ? "Low" : "Normal"}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded Content - Chart */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t"
          >
            <CardContent className="pt-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Normal Range: <span className="font-medium text-foreground">{paramData.normalRange}</span>
                </p>
                <Badge variant="secondary">
                  {paramData.data.length} data points
                </Badge>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={paramData.data.map((d) => ({
                      ...d,
                      unit: paramData.unit,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id={`gradient-${paramData.parameterName}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      domain={["auto", "auto"]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {min !== null && (
                      <ReferenceLine
                        y={min}
                        stroke="#22c55e"
                        strokeDasharray="5 5"
                        label={{
                          value: "Min",
                          position: "left",
                          fill: "#22c55e",
                          fontSize: 10,
                        }}
                      />
                    )}
                    {max !== null && (
                      <ReferenceLine
                        y={max}
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                        label={{
                          value: "Max",
                          position: "left",
                          fill: "#ef4444",
                          fontSize: 10,
                        }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="value"
                      name={paramData.parameterName}
                      stroke="#7c3aed"
                      strokeWidth={3}
                      fill={`url(#gradient-${paramData.parameterName})`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={paramData.parameterName}
                      stroke="#7c3aed"
                      strokeWidth={3}
                      dot={{
                        fill: "#7c3aed",
                        strokeWidth: 2,
                        r: 6,
                      }}
                      activeDot={{
                        r: 8,
                        fill: "#7c3aed",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Data History */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">History</p>
                <div className="flex flex-wrap gap-2">
                  {paramData.data.slice().reverse().map((point, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-sm"
                    >
                      <span className="text-muted-foreground">{point.formattedDate}:</span>
                      <span className="font-medium">{point.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}

export default function AnalyticsPage() {
  const { labParameters } = useAppStore()
  const [expandedParams, setExpandedParams] = React.useState<Set<string>>(new Set())

  // Group parameters by name and create chart data
  const chartDataByParameter = React.useMemo(() => {
    const grouped: Record<string, ParameterChartData> = {}

    labParameters.forEach((param) => {
      const key = param.parameterName

      if (!grouped[key]) {
        grouped[key] = {
          parameterName: param.parameterName,
          unit: param.unit,
          normalRange: param.normalRange,
          data: [],
        }
      }

      const numericValue = parseFloat(param.value)
      if (!isNaN(numericValue)) {
        grouped[key].data.push({
          date: param.testDate,
          value: numericValue,
          formattedDate: new Date(param.testDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        })
      }
    })

    // Sort data by date for each parameter
    Object.values(grouped).forEach((param) => {
      param.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })

    return Object.values(grouped).filter((p) => p.data.length > 0)
  }, [labParameters])

  const toggleExpand = (paramName: string) => {
    setExpandedParams(prev => {
      const newSet = new Set(prev)
      if (newSet.has(paramName)) {
        newSet.delete(paramName)
      } else {
        newSet.add(paramName)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedParams(new Set(chartDataByParameter.map(p => p.parameterName)))
  }

  const collapseAll = () => {
    setExpandedParams(new Set())
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Visualize trends and patterns in your lab parameters
          </p>
        </div>
        {chartDataByParameter.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        )}
      </motion.div>

      {labParameters.length > 0 ? (
        <>
          {/* Overview Stats */}
          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
            <Card className="card-hover">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                  <Activity className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parameters Tracked</p>
                  <p className="text-2xl font-bold">{chartDataByParameter.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Data Points</p>
                  <p className="text-2xl font-bold">{labParameters.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <LineChartIcon className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Charts Available</p>
                  <p className="text-2xl font-bold">{chartDataByParameter.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Parameter Cards - Sub Dashboard Style */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Parameter Trends</CardTitle>
                <CardDescription>
                  Click on any parameter to expand and view detailed trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {chartDataByParameter.map((paramData) => (
                  <ParameterCard
                    key={paramData.parameterName}
                    paramData={paramData}
                    isExpanded={expandedParams.has(paramData.parameterName)}
                    onToggle={() => toggleExpand(paramData.parameterName)}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Comparison Grid - Show ALL parameters */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>All Parameters Overview</CardTitle>
                <CardDescription>
                  Quick view of all {chartDataByParameter.length} tracked parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {chartDataByParameter.map((paramData, index) => {
                    const latestValue = paramData.data[paramData.data.length - 1]?.value
                    const { min, max } = parseNormalRange(paramData.normalRange)
                    
                    return (
                      <motion.div
                        key={paramData.parameterName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => toggleExpand(paramData.parameterName)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm truncate flex-1">{paramData.parameterName}</h4>
                          <Badge 
                            variant={
                              latestValue && max && latestValue > max ? "error" :
                              latestValue && min && latestValue < min ? "info" : "success"
                            }
                            className="ml-2 text-xs"
                          >
                            {latestValue && max && latestValue > max ? "H" :
                             latestValue && min && latestValue < min ? "L" : "N"}
                          </Badge>
                        </div>
                        <div className="h-[80px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={paramData.data}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#7c3aed"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{paramData.data.length} readings</span>
                          <span className="font-medium text-foreground">
                            {latestValue} {paramData.unit}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <LineChartIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No data to visualize</h3>
              <p className="mt-1 text-center text-muted-foreground">
                Upload medical reports to see trend analysis and charts
              </p>
              <Link href="/dashboard/upload" className="mt-6">
                <Button variant="wednesday">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
