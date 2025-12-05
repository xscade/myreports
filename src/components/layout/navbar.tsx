"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bell, 
  Search, 
  FileHeart, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  Activity,
  Upload,
  Table2,
  LineChart,
  X,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/store/app-store"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Quick navigation items for search
const quickLinks = [
  { name: "Upload Reports", href: "/dashboard/upload", icon: Upload },
  { name: "Data Table", href: "/dashboard/table", icon: Table2 },
  { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help & Support", href: "/dashboard/help", icon: HelpCircle },
]

export function Navbar() {
  const router = useRouter()
  const { user, logout, labParameters } = useAppStore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)
  const searchRef = React.useRef<HTMLDivElement>(null)

  // Close search dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter lab parameters based on search
  const filteredParameters = React.useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return labParameters
      .filter(
        (param) =>
          param.parameterName.toLowerCase().includes(query) ||
          param.value.toLowerCase().includes(query) ||
          param.unit.toLowerCase().includes(query)
      )
      .slice(0, 5) // Limit to 5 results
  }, [searchQuery, labParameters])

  // Filter quick links based on search
  const filteredLinks = React.useMemo(() => {
    if (!searchQuery.trim()) return quickLinks.slice(0, 3)
    const query = searchQuery.toLowerCase()
    return quickLinks.filter((link) => link.name.toLowerCase().includes(query))
  }, [searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/table?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setIsSearchFocused(false)
    }
  }

  const handleParameterClick = (paramName: string) => {
    router.push(`/dashboard/table?search=${encodeURIComponent(paramName)}`)
    setSearchQuery("")
    setIsSearchFocused(false)
  }

  const handleLinkClick = () => {
    setSearchQuery("")
    setIsSearchFocused(false)
  }

  const showDropdown = isSearchFocused && (searchQuery.trim() || filteredLinks.length > 0)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex h-14 md:h-16 items-center gap-2 md:gap-4 border-b border-border bg-background/95 px-3 md:px-4 backdrop-blur-lg lg:px-6 safe-area-top"
    >
      {/* Mobile Logo */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/20">
          <FileHeart className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-sm">MedReports</span>
      </div>

      {/* Search - Hidden on mobile */}
      <div ref={searchRef} className="relative hidden flex-1 md:block md:max-w-md">
        <form onSubmit={handleSearchSubmit}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            placeholder="Search parameters, pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full pl-10 pr-8 bg-secondary/50 border-0 focus-visible:ring-primary/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Search Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-popover shadow-lg overflow-hidden z-50"
            >
              {/* Parameters Results */}
              {filteredParameters.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Parameters</p>
                  {filteredParameters.map((param) => (
                    <button
                      key={param.id}
                      onClick={() => handleParameterClick(param.parameterName)}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                        <Activity className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{param.parameterName}</p>
                        <p className="text-xs text-muted-foreground">
                          {param.value} {param.unit} • {param.testDate}
                        </p>
                      </div>
                      <Badge 
                        variant={param.status === "Normal" ? "success" : param.status === "High" ? "error" : "info"}
                        className="text-[10px] shrink-0"
                      >
                        {param.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Links */}
              {filteredLinks.length > 0 && (
                <div className={`p-2 ${filteredParameters.length > 0 ? 'border-t' : ''}`}>
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {searchQuery ? 'Pages' : 'Quick Links'}
                  </p>
                  {filteredLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                        <link.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm">{link.name}</span>
                      <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchQuery && filteredParameters.length === 0 && filteredLinks.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No results found</p>
                  <button
                    onClick={handleSearchSubmit}
                    className="mt-2 text-sm text-purple-600 hover:underline"
                  >
                    Search in Data Table →
                  </button>
                </div>
              )}

              {/* Search All */}
              {searchQuery && (filteredParameters.length > 0 || filteredLinks.length > 0) && (
                <div className="border-t p-2">
                  <button
                    onClick={handleSearchSubmit}
                    className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-purple-600 hover:bg-purple-500/10 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    Search all for "{searchQuery}"
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-9 md:w-9">
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
            3
          </span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full p-0">
              <Avatar className="h-8 w-8 md:h-9 md:w-9 ring-2 ring-primary/20">
                <AvatarImage src="/avatar.png" alt={user?.name || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white text-sm">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings#profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/help" className="flex items-center gap-2 cursor-pointer">
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500 cursor-pointer"
              onClick={async () => {
                await logout()
                window.location.href = "/"
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}
