"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  FileText, 
  ExternalLink,
  ChevronDown,
  Upload,
  Table2,
  LineChart,
  Settings,
  Shield
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
} as const

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left hover:text-purple-600 transition-colors"
      >
        <span className="font-medium text-sm md:text-base">{question}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="pb-4"
        >
          <p className="text-sm text-muted-foreground">{answer}</p>
        </motion.div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I upload my medical reports?",
      answer: "Go to the Upload page from the dashboard or bottom navigation. You can drag and drop up to 5 images (PNG/JPG) and 2 PDF files. Our AI will automatically extract lab parameters from your reports."
    },
    {
      question: "What types of files are supported?",
      answer: "We support PNG, JPG, and JPEG image files as well as PDF documents. For best results, ensure your images are clear and text is readable."
    },
    {
      question: "How accurate is the AI extraction?",
      answer: "Our AI uses advanced medical document analysis powered by Xscade's Medical Grade AI model. While highly accurate, we recommend reviewing extracted values against your original reports."
    },
    {
      question: "Can I edit extracted parameters?",
      answer: "Currently, you can view and delete parameters. Direct editing is coming in a future update."
    },
    {
      question: "How do I view trends for a specific parameter?",
      answer: "Go to the Analytics page and tap on any parameter card to expand it and see the detailed trend chart with historical values."
    },
    {
      question: "Is my medical data secure?",
      answer: "Yes, your data is encrypted and stored securely. We take privacy seriously and never share your medical information with third parties."
    },
    {
      question: "How do I clear all my data?",
      answer: "Go to Settings > Danger Zone and click 'Clear All Data'. This action is irreversible, so please use it carefully."
    },
    {
      question: "What do the status badges mean?",
      answer: "Green/Normal means the value is within the reference range. Red/High means it's above normal. Blue/Low means it's below normal. These are based on the normal ranges detected in your reports."
    },
  ]

  const quickLinks = [
    { title: "Upload Reports", href: "/dashboard/upload", icon: Upload, color: "bg-purple-500/10 text-purple-600" },
    { title: "View Data", href: "/dashboard/table", icon: Table2, color: "bg-blue-500/10 text-blue-600" },
    { title: "Analytics", href: "/dashboard/analytics", icon: LineChart, color: "bg-green-500/10 text-green-600" },
    { title: "Settings", href: "/dashboard/settings", icon: Settings, color: "bg-orange-500/10 text-orange-600" },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 md:space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Find answers and get assistance
        </p>
      </motion.div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* FAQs */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-lg md:text-xl">Frequently Asked Questions</CardTitle>
              </div>
              <CardDescription className="text-xs md:text-sm">
                Common questions about using MedReports AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {faqs.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Side Cards */}
        <div className="space-y-4 md:space-y-6">
          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {quickLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div className={`flex flex-col items-center gap-2 rounded-lg p-3 transition-all hover:scale-105 ${link.color}`}>
                        <link.icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{link.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Support */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-base md:text-lg">Need More Help?</CardTitle>
                </div>
                <CardDescription className="text-xs md:text-sm">
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a 
                  href="mailto:support@medreports.ai"
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Email Support</p>
                    <p className="text-xs text-muted-foreground">support@medreports.ai</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Live Chat</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div variants={itemVariants}>
            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Your Privacy Matters</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your medical data is encrypted and never shared. We comply with healthcare data protection standards.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Documentation Link */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Documentation</h3>
                <p className="text-sm text-muted-foreground">
                  Learn more about features and capabilities
                </p>
              </div>
            </div>
            <Button variant="wednesday" className="w-full sm:w-auto">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Docs
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

