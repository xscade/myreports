import { create } from "zustand"
import { persist } from "zustand/middleware"
import { LabParameter, UploadedFile, DashboardStats } from "@/types"

interface User {
  id: string
  email: string
  name: string
}

interface AppState {
  // User
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<User | null>

  // Lab Parameters
  labParameters: LabParameter[]
  setLabParameters: (params: LabParameter[]) => void
  addLabParameters: (params: LabParameter[]) => Promise<{ added: number; skipped: number }>
  fetchLabParameters: () => Promise<void>
  clearLabParameters: () => Promise<void>

  // Upload State
  uploadedFiles: UploadedFile[]
  addUploadedFile: (file: UploadedFile) => void
  removeUploadedFile: (id: string) => void
  updateFileStatus: (id: string, status: UploadedFile["status"]) => void
  clearUploadedFiles: () => void

  // Dashboard Stats
  stats: DashboardStats
  updateStats: () => void

  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch (error) {
          console.error('Logout error:', error)
        }
        set({ user: null, labParameters: [], uploadedFiles: [] })
      },
      
      checkAuth: async () => {
        try {
          const res = await fetch('/api/auth/me')
          if (res.ok) {
            const data = await res.json()
            set({ user: data.user })
            return data.user
          } else {
            set({ user: null })
            return null
          }
        } catch (error) {
          console.error('Auth check error:', error)
          set({ user: null })
          return null
        }
      },

      // Lab Parameters
      labParameters: [],
      setLabParameters: (params) => set({ labParameters: params }),
      
      addLabParameters: async (params) => {
        const { user } = get()
        if (!user) {
          // If no user, just add to local state with duplicate checking
          const existingParams = get().labParameters
          const newParams = params.filter((newParam) => {
            // Check for exact data duplicate
            const dataExists = existingParams.some(
              (existing) =>
                existing.parameterName === newParam.parameterName &&
                existing.value === newParam.value &&
                existing.testDate === newParam.testDate &&
                existing.unit === newParam.unit
            )
            // Check for same source file duplicate
            const fileExists = existingParams.some(
              (existing) =>
                existing.parameterName === newParam.parameterName &&
                existing.sourceFile === newParam.sourceFile &&
                existing.testDate === newParam.testDate
            )
            return !dataExists && !fileExists
          })
          set((state) => ({
            labParameters: [...state.labParameters, ...newParams],
          }))
          get().updateStats()
          return { added: newParams.length, skipped: params.length - newParams.length }
        }

        try {
          const res = await fetch('/api/lab-parameters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parameters: params }),
          })
          
          if (res.ok) {
            const data = await res.json()
            // Refresh parameters from server
            await get().fetchLabParameters()
            return { added: data.results.added, skipped: data.results.skipped }
          }
        } catch (error) {
          console.error('Add parameters error:', error)
        }
        return { added: 0, skipped: 0 }
      },
      
      fetchLabParameters: async () => {
        const { user } = get()
        if (!user) return

        try {
          set({ isLoading: true })
          const res = await fetch('/api/lab-parameters')
          if (res.ok) {
            const data = await res.json()
            set({ labParameters: data.parameters })
            get().updateStats()
          }
        } catch (error) {
          console.error('Fetch parameters error:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      clearLabParameters: async () => {
        const { user } = get()
        if (user) {
          try {
            await fetch('/api/lab-parameters', { method: 'DELETE' })
          } catch (error) {
            console.error('Clear parameters error:', error)
          }
        }
        set({ labParameters: [] })
        get().updateStats()
      },

      // Upload State
      uploadedFiles: [],
      addUploadedFile: (file) =>
        set((state) => ({
          uploadedFiles: [...state.uploadedFiles, file],
        })),
      removeUploadedFile: (id) =>
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter((f) => f.id !== id),
        })),
      updateFileStatus: (id, status) =>
        set((state) => ({
          uploadedFiles: state.uploadedFiles.map((f) =>
            f.id === id ? { ...f, status } : f
          ),
        })),
      clearUploadedFiles: () => set({ uploadedFiles: [] }),

      // Dashboard Stats
      stats: {
        totalParameters: 0,
        totalReports: 0,
        abnormalCount: 0,
        lastUpdated: new Date().toISOString(),
      },
      updateStats: () => {
        const params = get().labParameters
        const abnormal = params.filter(
          (p) => p.status === "Low" || p.status === "High"
        ).length
        const uniqueDates = new Set(params.map((p) => p.testDate)).size
        set({
          stats: {
            totalParameters: params.length,
            totalReports: uniqueDates,
            abnormalCount: abnormal,
            lastUpdated: new Date().toISOString(),
          },
        })
      },

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Loading
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "medical-reports-storage",
      partialize: (state) => ({
        // Only persist uploaded files locally, everything else from server
        uploadedFiles: state.uploadedFiles,
      }),
    }
  )
)
