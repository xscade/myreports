"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"
import {
  Upload,
  X,
  FileImage,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  File,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/app-store"
import { UploadedFile, LabParameter } from "@/types"
import { useRouter } from "next/navigation"

const MAX_IMAGES = 5
const MAX_PDFS = 2

export default function UploadPage() {
  const router = useRouter()
  const { addLabParameters, updateStats } = useAppStore()
  const [files, setFiles] = React.useState<UploadedFile[]>([])
  const [isExtracting, setIsExtracting] = React.useState(false)
  const [extractionProgress, setExtractionProgress] = React.useState(0)
  const [extractedCount, setExtractedCount] = React.useState(0)
  const [skippedCount, setSkippedCount] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const imageCount = files.filter((f) => f.type === "image").length
  const pdfCount = files.filter((f) => f.type === "pdf").length

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = []

      for (const file of acceptedFiles) {
        const isImage = file.type.startsWith("image/")
        const isPdf = file.type === "application/pdf"

        if (isImage && imageCount + newFiles.filter((f) => f.type === "image").length >= MAX_IMAGES) {
          continue
        }
        if (isPdf && pdfCount + newFiles.filter((f) => f.type === "pdf").length >= MAX_PDFS) {
          continue
        }

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: isImage ? URL.createObjectURL(file) : "",
          type: isImage ? "image" : "pdf",
          status: "pending",
        }
        newFiles.push(uploadedFile)
      }

      setFiles((prev) => [...prev, ...newFiles])
      setError(null)
    },
    [imageCount, pdfCount]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    disabled: isExtracting,
  })

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  // Real API call to Gemini
  async function extractDataFromFile(file: File): Promise<LabParameter[]> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to extract data")
    }

    return data.parameters
  }

  const handleExtract = async () => {
    if (files.length === 0) return

    setIsExtracting(true)
    setExtractionProgress(0)
    setExtractedCount(0)
    setSkippedCount(0)
    setError(null)

    const allExtractedParams: LabParameter[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Update file status
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "processing" } : f))
      )

      try {
        const params = await extractDataFromFile(file.file)
        allExtractedParams.push(...params)

        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "completed" } : f))
        )
      } catch (error: any) {
        console.error("Error extracting from file:", error)
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "error" } : f))
        )
        setError(error.message || "Failed to extract data from file")
      }

      setExtractionProgress(((i + 1) / files.length) * 100)
    }

    // Add all extracted parameters to the store (MongoDB)
    if (allExtractedParams.length > 0) {
      const result = await addLabParameters(allExtractedParams)
      setExtractedCount(result.added)
      setSkippedCount(result.skipped)
      updateStats()
    }

    setIsExtracting(false)
  }

  const allCompleted = files.length > 0 && files.every((f) => f.status === "completed")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-6"
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Upload Reports</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Extract lab parameters using Xscade AI
        </p>
      </div>

      {/* API Key Warning */}
      {error && error.includes("GEMINI_API_KEY") && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="flex items-start gap-3 p-4 md:pt-6">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-yellow-600 dark:text-yellow-400 text-sm md:text-base">
                  API Key Not Configured
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Add <code className="bg-muted px-1 py-0.5 rounded text-xs">GEMINI_API_KEY</code> to .env.local
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content - Stack on mobile, grid on desktop */}
      <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                AI Document Extraction
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Upload up to {MAX_IMAGES} images and {MAX_PDFS} PDFs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4 md:space-y-6">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 md:p-8 text-center transition-all duration-200 ${
                  isDragActive
                    ? "border-purple-500 bg-purple-500/5"
                    : "border-border hover:border-purple-500/50 hover:bg-purple-500/5"
                } ${isExtracting ? "pointer-events-none opacity-50" : ""}`}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-purple-500/10">
                    <Upload className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
                  </div>
                  <p className="text-base md:text-lg font-medium">
                    {isDragActive ? "Drop files here" : "Drag & drop files here"}
                  </p>
                  <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                    or tap to browse
                  </p>
                  <div className="mt-3 md:mt-4 flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <ImageIcon className="h-3 w-3" />
                      {imageCount}/{MAX_IMAGES}
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <File className="h-3 w-3" />
                      {pdfCount}/{MAX_PDFS}
                    </Badge>
                  </div>
                </motion.div>
              </div>

              {/* File List - Mobile optimized */}
              <AnimatePresence mode="popLayout">
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 md:space-y-3"
                  >
                    {files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-lg border border-border p-2.5 md:p-3"
                      >
                        {/* Mobile: Stack layout / Desktop: Row layout */}
                        <div className="flex items-center gap-2 md:gap-4">
                          {/* Preview */}
                          <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                            {file.type === "image" && file.preview ? (
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : file.type === "pdf" ? (
                              <FileText className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                            ) : (
                              <FileImage className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                            )}
                          </div>

                          {/* File Info - Fixed max width with truncation */}
                          <div className="min-w-0 max-w-[120px] sm:max-w-[200px] md:max-w-none md:flex-1">
                            <p className="text-xs md:text-sm font-medium truncate">{file.file.name}</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">
                              {(file.file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0">
                            {file.status === "pending" && (
                              <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                                Pending
                              </Badge>
                            )}
                            {file.status === "processing" && (
                              <Badge variant="default" className="gap-1 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                                <Loader2 className="h-2.5 w-2.5 md:h-3 md:w-3 animate-spin" />
                                <span className="hidden sm:inline">Analyzing</span>
                              </Badge>
                            )}
                            {file.status === "completed" && (
                              <Badge variant="success" className="gap-1 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                <span className="hidden sm:inline">Done</span>
                              </Badge>
                            )}
                            {file.status === "error" && (
                              <Badge variant="error" className="gap-1 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                                <AlertCircle className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                <span className="hidden sm:inline">Error</span>
                              </Badge>
                            )}
                          </div>

                          {/* Remove Button */}
                          {!isExtracting && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(file.id)}
                              className="shrink-0 h-7 w-7 md:h-8 md:w-8"
                            >
                              <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              {error && !error.includes("GEMINI_API_KEY") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-lg border border-red-500/50 bg-red-500/10 p-2.5 md:p-3"
                >
                  <p className="text-xs md:text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Progress */}
              {isExtracting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">
                      Analyzing...
                    </span>
                    <span className="font-medium">{Math.round(extractionProgress)}%</span>
                  </div>
                  <Progress value={extractionProgress} className="h-2" />
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <Button
                  variant="wednesday"
                  onClick={handleExtract}
                  disabled={files.length === 0 || isExtracting}
                  className="flex-1 h-11 md:h-10 text-sm"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Extract Data with AI
                    </>
                  )}
                </Button>
                {allCompleted && (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/table")}
                    className="h-11 md:h-10 text-sm"
                  >
                    View Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Extraction Results - Show on mobile after upload area */}
          {(extractedCount > 0 || skippedCount > 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:hidden"
            >
              <Card className="border-green-500/50 bg-green-500/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-green-600">
                      {extractedCount} <span className="text-sm font-normal">saved</span>
                    </p>
                    {skippedCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {skippedCount} duplicate{skippedCount > 1 ? 's' : ''} skipped
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Info Panel - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: 1, title: "Upload Documents", desc: "Drag & drop medical reports" },
                { step: 2, title: "Xscade AI Analysis", desc: "AI extracts lab values" },
                { step: 3, title: "View Results", desc: "Review extracted data in table" },
                { step: 4, title: "Track Trends", desc: "Visualize with analytics" },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xs font-bold text-purple-600">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {(extractedCount > 0 || skippedCount > 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-green-500/50 bg-green-500/5">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {extractedCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Parameters saved
                      </p>
                    </div>
                  </div>
                  {skippedCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>
                        {skippedCount} duplicate{skippedCount > 1 ? 's' : ''} skipped
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supported Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                    <FileImage className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Images</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, JPEG</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                    <FileText className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Documents</p>
                    <p className="text-xs text-muted-foreground">PDF files</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Powered by Xscade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Using Xscade&apos;s Medical Grade AI model for accurate medical document analysis and lab parameter extraction.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
