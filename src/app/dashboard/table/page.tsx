"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/store/app-store"
import { LabParameter } from "@/types"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { formatDate } from "@/lib/utils"

const ITEMS_PER_PAGE = 10

// Mobile Parameter Card with expandable details
function MobileParameterCard({ 
  item, 
  index,
  getStatusBadge 
}: { 
  item: LabParameter
  index: number
  getStatusBadge: (status: string, compact?: boolean) => React.ReactNode
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const needsTruncation = item.parameterName.length > 22

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-lg border overflow-hidden"
    >
      {/* Card Header - Always visible */}
      <div 
        className="p-3 cursor-pointer active:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {/* Parameter Name with truncation */}
            {needsTruncation && !isExpanded ? (
              <p className="font-medium text-sm">
                {item.parameterName.slice(0, 22)}
                <span className="text-purple-500">...</span>
              </p>
            ) : (
              <p className="font-medium text-sm break-words leading-relaxed">
                {item.parameterName}
              </p>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">{formatDate(item.testDate)}</p>
              <span className="text-muted-foreground">•</span>
              <p className="text-xs font-semibold">{item.value} {item.unit}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge 
              variant={
                item.status === "Normal" ? "success" : 
                item.status === "High" ? "error" : 
                item.status === "Low" ? "info" : "secondary"
              }
              className="text-[10px] px-1.5 py-0"
            >
              {item.status.charAt(0)}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t bg-muted/30"
          >
            <div className="p-3 space-y-2">
              {/* Full Parameter Name (if truncated) */}
              {needsTruncation && (
                <div className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Full Name</p>
                  <p className="text-sm font-medium break-words leading-relaxed mt-0.5">
                    {item.parameterName}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-md bg-background">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Value</p>
                  <p className="text-sm font-bold mt-0.5">{item.value} {item.unit}</p>
                </div>
                <div className="p-2 rounded-md bg-background">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</p>
                  <div className="mt-0.5">{getStatusBadge(item.status)}</div>
                </div>
              </div>
              
              <div className="p-2 rounded-md bg-background">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Normal Range</p>
                <p className="text-sm font-medium mt-0.5">{item.normalRange}</p>
              </div>
              
              <div className="p-2 rounded-md bg-background">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Source File</p>
                <p className="text-xs break-all mt-0.5 text-muted-foreground">{item.sourceFile}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function TablePage() {
  const { labParameters } = useAppStore()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortField, setSortField] = React.useState<keyof LabParameter>("testDate")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = React.useState(1)
  
  // Initialize status filter from URL params
  const urlStatus = searchParams.get("status")
  const [statusFilter, setStatusFilter] = React.useState<string>(
    urlStatus === "abnormal" ? "abnormal" : "all"
  )

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let data = [...labParameters]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      data = data.filter(
        (item) =>
          item.parameterName.toLowerCase().includes(query) ||
          item.value.toLowerCase().includes(query) ||
          item.sourceFile.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "abnormal") {
        // Abnormal includes both High and Low
        data = data.filter((item) => item.status === "High" || item.status === "Low")
      } else {
        data = data.filter((item) => item.status === statusFilter)
      }
    }

    // Sort
    data.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return data
  }, [labParameters, searchQuery, statusFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSort = (field: keyof LabParameter) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const exportToCSV = () => {
    const headers = ["Parameter Name", "Value", "Unit", "Normal Range", "Status", "Test Date", "Source File"]
    const rows = filteredData.map((item) => [
      item.parameterName,
      item.value,
      item.unit,
      item.normalRange,
      item.status,
      item.testDate,
      item.sourceFile,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `lab-parameters-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string, compact = false) => {
    const label = compact ? status.charAt(0) : status
    const className = compact ? "text-[10px] px-1.5 py-0" : ""
    
    switch (status) {
      case "Normal":
        return <Badge variant="success" className={className}>{label}</Badge>
      case "High":
        return <Badge variant="error" className={className}>{label}</Badge>
      case "Low":
        return <Badge variant="info" className={className}>{label}</Badge>
      default:
        return <Badge variant="secondary" className={className}>{label}</Badge>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Data Table</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View and manage all extracted lab parameters
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/upload">
            <Button variant="outline" size="sm" className="h-9">
              <Upload className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Upload More</span>
            </Button>
          </Link>
          <Button variant="wednesday" size="sm" className="h-9" onClick={exportToCSV} disabled={filteredData.length === 0}>
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {labParameters.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg md:text-xl">Lab Parameters</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {filteredData.length} of {labParameters.length} parameters
                  </CardDescription>
                </div>
                {statusFilter !== "all" && (
                  <Badge 
                    variant={statusFilter === "abnormal" ? "error" : "secondary"} 
                    className="text-xs cursor-pointer"
                    onClick={() => setStatusFilter("all")}
                  >
                    {statusFilter === "abnormal" ? "Abnormal" : statusFilter} ✕
                  </Badge>
                )}
              </div>

              {/* Filters - Full width on mobile */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-9 h-9 text-sm"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Normal")}>
                      Normal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("abnormal")}>
                      Abnormal (High/Low)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter("High")}>
                      High Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Low")}>
                      Low Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {paginatedData.map((item, index) => (
                <MobileParameterCard
                  key={item.id}
                  item={item}
                  index={index}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead
                      className="cursor-pointer hover:text-foreground whitespace-nowrap"
                      onClick={() => handleSort("parameterName")}
                    >
                      <div className="flex items-center gap-1">
                        Parameter Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground whitespace-nowrap"
                      onClick={() => handleSort("value")}
                    >
                      <div className="flex items-center gap-1">
                        Value
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Unit</TableHead>
                    <TableHead className="whitespace-nowrap">Normal Range</TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground whitespace-nowrap"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground whitespace-nowrap"
                      onClick={() => handleSort("testDate")}
                    >
                      <div className="flex items-center gap-1">
                        Test Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {item.parameterName}
                      </TableCell>
                      <TableCell className="font-semibold">{item.value}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.unit}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.normalRange}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{formatDate(item.testDate)}</TableCell>
                      <TableCell>
                        <span className="max-w-[150px] truncate block text-xs text-muted-foreground">
                          {item.sourceFile}
                        </span>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{" "}
                  {filteredData.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>
                  <div className="flex items-center px-2 text-sm text-muted-foreground">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8"
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
            <div className="mb-4 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base md:text-lg font-semibold">No data yet</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Upload medical reports to extract and view lab parameters
            </p>
            <Link href="/dashboard/upload" className="mt-6">
              <Button variant="wednesday">
                <Upload className="mr-2 h-4 w-4" />
                Upload Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

