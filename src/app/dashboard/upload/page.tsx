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
      className="space-y-6"
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Upload Reports</h1>
        <p className="text-muted-foreground">
          Upload medical documents to extract lab parameters using Xscade AI
        </p>
      </div>

      {/* API Key Warning */}
      {error && error.includes("GEMINI_API_KEY") && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="flex items-start gap-3 pt-6">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-600 dark:text-yellow-400">
                  Gemini API Key Not Configured
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please create a <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file in your project root with:
                </p>
                <pre className="mt-2 bg-muted p-2 rounded text-xs">
                  GEMINI_API_KEY=your_api_key_here
                </pre>
                <p className="text-sm text-muted-foreground mt-2">
                  Get your API key from{" "}
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Document Extraction
              </CardTitle>
              <CardDescription>
                Upload up to {MAX_IMAGES} images (PNG/JPG) and {MAX_PDFS} PDFs - Powered by Xscade AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
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
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
                    <Upload className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop files here" : "Drag & drop files here"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {imageCount}/{MAX_IMAGES} images
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <File className="h-3 w-3" />
                      {pdfCount}/{MAX_PDFS} PDFs
                    </Badge>
                  </div>
                </motion.div>
              </div>

              {/* File List */}
              <AnimatePresence mode="popLayout">
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 rounded-lg border border-border p-3"
                      >
                        {/* Preview */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                          {file.type === "image" && file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.file.name}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : file.type === "pdf" ? (
                            <FileText className="h-6 w-6 text-red-500" />
                          ) : (
                            <FileImage className="h-6 w-6 text-blue-500" />
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{file.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          {file.status === "pending" && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                          {file.status === "processing" && (
                            <Badge variant="default" className="gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Analyzing...
                            </Badge>
                          )}
                          {file.status === "completed" && (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Done
                            </Badge>
                          )}
                          {file.status === "error" && (
                            <Badge variant="error" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Error
                            </Badge>
                          )}
                        </div>

                        {/* Remove Button */}
                        {!isExtracting && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.id)}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
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
                  className="rounded-lg border border-red-500/50 bg-red-500/10 p-3"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Progress */}
              {isExtracting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Analyzing with Xscade AI...
                    </span>
                    <span className="font-medium">{Math.round(extractionProgress)}%</span>
                  </div>
                  <Progress value={extractionProgress} />
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="wednesday"
                  onClick={handleExtract}
                  disabled={files.length === 0 || isExtracting}
                  className="flex-1"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing with Xscade AI...
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
                  >
                    View Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-sm font-bold text-purple-600">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
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
              <CardTitle>Supported Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <FileImage className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Images</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, JPEG</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">Documents</p>
                    <p className="text-sm text-muted-foreground">PDF files</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Powered by Xscade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Using Xscade&apos;s Medical Grade AI model for accurate medical document analysis and lab parameter extraction.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
