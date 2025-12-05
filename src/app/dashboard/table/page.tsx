"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
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
import { formatDate } from "@/lib/utils"

const ITEMS_PER_PAGE = 10

export default function TablePage() {
  const { labParameters } = useAppStore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [sortField, setSortField] = React.useState<keyof LabParameter>("testDate")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = React.useState(1)

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
      data = data.filter((item) => item.status === statusFilter)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Normal":
        return <Badge variant="success">{status}</Badge>
      case "High":
        return <Badge variant="error">{status}</Badge>
      case "Low":
        return <Badge variant="info">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Data Table</h1>
          <p className="text-muted-foreground">
            View and manage all extracted lab parameters
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/upload">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload More
            </Button>
          </Link>
          <Button variant="wednesday" onClick={exportToCSV} disabled={filteredData.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {labParameters.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Lab Parameters</CardTitle>
                <CardDescription>
                  {filteredData.length} of {labParameters.length} parameters
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search parameters..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-[200px] pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
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
                    <DropdownMenuItem onClick={() => setStatusFilter("High")}>
                      High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Low")}>
                      Low
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("parameterName")}
                    >
                      <div className="flex items-center gap-1">
                        Parameter Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("value")}
                    >
                      <div className="flex items-center gap-1">
                        Value
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Normal Range</TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("testDate")}
                    >
                      <div className="flex items-center gap-1">
                        Test Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Source</TableHead>
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
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{" "}
                  {filteredData.length} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No data yet</h3>
            <p className="mt-1 text-center text-muted-foreground">
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

