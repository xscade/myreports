"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FileHeart, ArrowRight, Shield, Zap, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/app-store"

const features = [
  {
    icon: Zap,
    title: "AI-Powered Extraction",
    description: "Extract lab parameters from medical documents instantly using advanced AI",
  },
  {
    icon: LineChart,
    title: "Visual Analytics",
    description: "Track health trends with beautiful charts and data visualization",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your medical data is encrypted and stored securely",
  },
]

export default function HomeContent() {
  const router = useRouter()
  const { user } = useAppStore()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  } as const

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-950/30 dark:via-background dark:to-purple-900/20" />
      
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-3xl"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-400/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/30">
              <FileHeart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">MedReports AI</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button variant="wednesday" onClick={() => router.push("/login")}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </header>

        {/* Hero */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400">
                <Zap className="h-4 w-4" />
                AI-Powered Medical Analysis
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Transform Your{" "}
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
                Medical Reports
              </span>{" "}
              Into Actionable Insights
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg text-muted-foreground sm:text-xl"
            >
              Upload your medical documents and let our AI extract lab parameters,
              track health trends, and provide beautiful visualizations of your health data.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                variant="wednesday"
                size="lg"
                onClick={() => router.push("/login")}
                className="min-w-[200px]"
              >
                Start Analyzing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-w-[200px]"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-24 grid gap-8 md:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative rounded-2xl border border-purple-500/10 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 text-center text-sm text-muted-foreground lg:px-12">
          <p>© 2024 MedReports AI. Your health data, visualized beautifully.</p>
        </footer>
      </div>
    </div>
  )
}

