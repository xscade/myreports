import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'low':
      return 'text-blue-500 bg-blue-500/10'
    case 'high':
      return 'text-red-500 bg-red-500/10'
    case 'normal':
      return 'text-green-500 bg-green-500/10'
    default:
      return 'text-gray-500 bg-gray-500/10'
  }
}

