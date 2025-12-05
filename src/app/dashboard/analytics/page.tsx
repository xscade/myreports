"use client"

import * as React from "react"
import { motion, Variants, AnimatePresence } from "framer-motion"
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
import { LineChart as LineChartIcon, Upload, TrendingUp, Activity, ChevronDown, ChevronUp, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/app-store"
import { ParameterChartData } from "@/types"
import Link from "next/link"

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
}

// Truncated text component with click-to-expand on mobile
function TruncatedText({ 
  text, 
  className = "",
  maxLength = 20,
}: { 
  text: string
  className?: string
  maxLength?: number
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const needsTruncation = text.length > maxLength
  
  // Close on outside click
  React.useEffect(() => {
    if (isExpanded) {
      const handleClickOutside = () => setIsExpanded(false)
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isExpanded])

  if (!needsTruncation) {
    return <span className={className}>{text}</span>
  }

  return (
    <div className="relative">
      <span 
        className={`${className} cursor-pointer md:cursor-default`}
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
      >
        {/* Desktop: show truncated with hover title */}
        <span className="hidden md:inline truncate block" title={text}>
          {text}
        </span>
        {/* Mobile: show truncated text with indicator */}
        <span className="md:hidden">
          {text.slice(0, maxLength)}
          <span className="text-purple-500">...</span>
        </span>
      </span>
      
      {/* Expanded popup on mobile */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="md:hidden absolute left-0 right-0 top-full mt-1 z-50 rounded-lg bg-popover border shadow-lg p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium break-words flex-1">{text}</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(false)
                }}
                className="shrink-0 p-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
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
  const status = latestValue && max && latestValue > max ? "High" :
                 latestValue && min && latestValue < min ? "Low" : "Normal"

  return (
    <motion.div
      layout
      variants={itemVariants}
      className="overflow-visible"
    >
      <Card className={`transition-all duration-300 ${isExpanded ? 'ring-2 ring-purple-500/50' : 'hover:shadow-lg'}`}>
        {/* Header - Always visible */}
        <div 
          className="p-3 md:p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={onToggle}
        >
          {/* Mobile: Stacked layout */}
          <div className="md:hidden space-y-2">
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                trend === "up" ? "bg-orange-500/10" : trend === "down" ? "bg-blue-500/10" : "bg-green-500/10"
              }`}>
                <TrendingUp className={`h-5 w-5 ${
                  trend === "up" ? "text-orange-500 rotate-0" : 
                  trend === "down" ? "text-blue-500 rotate-180" : 
                  "text-green-500"
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <TruncatedText 
                  text={paramData.parameterName}
                  className="font-semibold text-sm leading-tight"
                  maxLength={25}
                />
                <p className="text-xs text-muted-foreground mt-0.5">
                  {paramData.data.length} readings • {paramData.unit}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge 
                  variant={status === "High" ? "error" : status === "Low" ? "info" : "success"}
                  className="text-[10px] px-2 py-0.5"
                >
                  {latestValue || "—"}
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Desktop: Horizontal layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                trend === "up" ? "bg-orange-500/10" : trend === "down" ? "bg-blue-500/10" : "bg-green-500/10"
              }`}>
                <TrendingUp className={`h-6 w-6 ${
                  trend === "up" ? "text-orange-500 rotate-0" : 
                  trend === "down" ? "text-blue-500 rotate-180" : 
                  "text-green-500"
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate" title={paramData.parameterName}>
                  {paramData.parameterName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {paramData.data.length} readings • {paramData.unit}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-bold">{latestValue || "—"}</p>
                <p className="text-xs text-muted-foreground">Latest</p>
              </div>
              <Badge 
                variant={status === "High" ? "error" : status === "Low" ? "info" : "success"}
                className="text-xs px-2.5 py-1"
              >
                {status}
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
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
            <CardContent className="pt-4 px-3 md:px-6">
              {/* Full parameter name shown when expanded (mobile) */}
              <div className="md:hidden mb-3 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <p className="text-xs text-muted-foreground">Parameter</p>
                <p className="text-sm font-medium break-words leading-relaxed">
                  {paramData.parameterName}
                </p>
              </div>
              
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Normal Range: <span className="font-medium text-foreground">{paramData.normalRange}</span>
                  </p>
                  <p className="text-xs text-muted-foreground md:hidden">
                    Unit: <span className="font-medium text-foreground">{paramData.unit}</span>
                  </p>
                </div>
                <Badge variant="secondary" className="w-fit text-xs">
                  {paramData.data.length} data points
                </Badge>
              </div>
              <div className="h-[180px] md:h-[300px] w-full -ml-2 md:ml-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={paramData.data.map((d) => ({
                      ...d,
                      unit: paramData.unit,
                    }))}
                    margin={{ top: 10, right: 5, left: -5, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id={`gradient-${paramData.parameterName.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 9 }}
                      className="text-muted-foreground"
                      interval="preserveStartEnd"
                      tickMargin={5}
                    />
                    <YAxis
                      tick={{ fontSize: 9 }}
                      className="text-muted-foreground"
                      domain={["auto", "auto"]}
                      width={30}
                      tickMargin={3}
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
                          fontSize: 8,
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
                          fontSize: 8,
                        }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="value"
                      name={paramData.parameterName}
                      stroke="#7c3aed"
                      strokeWidth={2}
                      fill={`url(#gradient-${paramData.parameterName.replace(/\s+/g, '-')})`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={paramData.parameterName}
                      stroke="#7c3aed"
                      strokeWidth={2}
                      dot={{
                        fill: "#7c3aed",
                        strokeWidth: 2,
                        r: 3,
                      }}
                      activeDot={{
                        r: 5,
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
                <p className="text-xs md:text-sm font-medium mb-2">History</p>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 md:gap-2">
                  {paramData.data.slice().reverse().map((point, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between sm:justify-start gap-1 sm:gap-1.5 rounded-lg bg-muted/50 px-2 py-1.5 md:px-3 md:py-1.5 text-[11px] md:text-sm"
                    >
                      <span className="text-muted-foreground">{point.formattedDate}</span>
                      <span className="font-semibold">{point.value}</span>
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

// Overview Card with better mobile handling
function OverviewCard({ 
  paramData, 
  latestValue, 
  status, 
  index, 
  onExpand 
}: { 
  paramData: ParameterChartData
  latestValue: number | undefined
  status: string
  index: number
  onExpand: () => void
}) {
  const [showFullName, setShowFullName] = React.useState(false)
  const needsTruncation = paramData.parameterName.length > 15

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-xl border p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer relative overflow-visible"
      onClick={onExpand}
    >
      {/* Mobile: Show full name popup */}
      <AnimatePresence>
        {showFullName && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="md:hidden absolute left-2 right-2 -top-2 transform -translate-y-full z-50 rounded-lg bg-popover border shadow-lg p-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium break-words flex-1 leading-relaxed">
                {paramData.parameterName}
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowFullName(false)
                }}
                className="shrink-0 p-0.5 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-1 mb-2 md:mb-3">
        {/* Mobile: Truncated with tap to show */}
        <div className="md:hidden min-w-0 flex-1">
          {needsTruncation ? (
            <h4 
              className="font-medium text-xs leading-tight"
              onClick={(e) => {
                e.stopPropagation()
                setShowFullName(!showFullName)
              }}
            >
              {paramData.parameterName.slice(0, 15)}
              <span className="text-purple-500">...</span>
            </h4>
          ) : (
            <h4 className="font-medium text-xs leading-tight break-words">
              {paramData.parameterName}
            </h4>
          )}
        </div>
        
        {/* Desktop: Full name with truncation tooltip */}
        <h4 
          className="hidden md:block font-medium text-sm truncate flex-1 leading-tight" 
          title={paramData.parameterName}
        >
          {paramData.parameterName}
        </h4>
        
        <Badge 
          variant={status === "H" ? "error" : status === "L" ? "info" : "success"}
          className="text-[10px] px-1.5 py-0 md:text-xs md:px-2 shrink-0"
        >
          {status}
        </Badge>
      </div>
      
      <div className="h-[50px] md:h-[80px]">
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
      
      <div className="mt-1.5 md:mt-2 flex items-center justify-between text-[10px] md:text-xs text-muted-foreground">
        <span>{paramData.data.length} pts</span>
        <span className="font-medium text-foreground">
          {latestValue} <span className="hidden sm:inline">{paramData.unit}</span>
        </span>
      </div>
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
      className="space-y-4 md:space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visualize trends and patterns in your lab parameters
          </p>
        </div>
        {chartDataByParameter.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        )}
      </motion.div>

      {labParameters.length > 0 ? (
        <>
          {/* Overview Stats */}
          <motion.div variants={itemVariants} className="grid gap-3 grid-cols-3">
            <Card className="card-hover">
              <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-6">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-purple-500/10">
                  <Activity className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] md:text-sm text-muted-foreground">Tracked</p>
                  <p className="text-lg md:text-2xl font-bold">{chartDataByParameter.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-6">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] md:text-sm text-muted-foreground">Data Points</p>
                  <p className="text-lg md:text-2xl font-bold">{labParameters.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-6">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <LineChartIcon className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] md:text-sm text-muted-foreground">Charts</p>
                  <p className="text-lg md:text-2xl font-bold">{chartDataByParameter.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Parameter Cards - Sub Dashboard Style */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Parameter Trends</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Tap on any parameter to expand and view detailed trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-3 md:px-6">
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
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">All Parameters Overview</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Quick view of all {chartDataByParameter.length} tracked parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {chartDataByParameter.map((paramData, index) => {
                    const latestValue = paramData.data[paramData.data.length - 1]?.value
                    const { min, max } = parseNormalRange(paramData.normalRange)
                    const status = latestValue && max && latestValue > max ? "H" :
                                   latestValue && min && latestValue < min ? "L" : "N"
                    
                    return (
                      <OverviewCard
                        key={paramData.parameterName}
                        paramData={paramData}
                        latestValue={latestValue}
                        status={status}
                        index={index}
                        onExpand={() => toggleExpand(paramData.parameterName)}
                      />
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
            <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
              <div className="mb-4 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-muted">
                <LineChartIcon className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base md:text-lg font-semibold">No data to visualize</h3>
              <p className="mt-1 text-center text-sm text-muted-foreground">
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
