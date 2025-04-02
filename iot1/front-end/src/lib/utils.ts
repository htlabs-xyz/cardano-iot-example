import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertApiResponse<T>(data: any): T {
  console.log("http data:", data)
  // if (typeof data.status !== 'boolean' ||
  //   (Array.isArray(data.message) === false && data.message !== null)) {
  //   throw new Error('Invalid API response structure');
  // }
  // else if (data.status == false) {
  //   //handleErrorApi({error:data.message});
  //   //console.log(data.message)
  //   throw new Array(data.message);
  // }
  return data as T;
}

// Format date from timestamp
export const formatDate = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

// Format time from timestamp
export const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// Get battery status color
export const getBatteryStatusColor = (level: number) => {
  if (level > 70) return "bg-green-500"
  if (level > 30) return "bg-yellow-500"
  return "bg-red-500"
}

// Get signal status color
export const getSignalStatusColor = (level: number) => {
  if (level > 70) return "bg-green-500"
  if (level > 50) return "bg-yellow-500"
  return "bg-red-500"
}

// Determine status based on temperature
export const getStatusColor = (temp: number, threshold: number) => {
  if (temp > threshold) return "text-red-500"
  if (temp > threshold - 5) return "text-yellow-500"
  return "text-green-500"
}


// Get temperature status text
export const getTemperatureStatusText = (temp: number, threshold: number) => {
  if (temp > threshold) return "High"
  if (temp > threshold - 5) return "Warning"
  return "Normal"
}

// Copy URL to clipboard
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  // In a real app, you would show a toast notification here
}

// Update the truncateAddress function to be more generic
export const truncateText = (text: string, startChars = 6, endChars = 6) => {
  if (!text || text.length <= startChars + endChars) return text
  return `${text.substring(0, startChars)}...${text.substring(text.length - endChars)}`
}


// Helper function to get deterministic "random" numbers
export function seededRandom(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}


// Get device type name
export function getDeviceTypeName(type: number): string {
  switch (type) {
    case 1:
      return "Standard"
    case 2:
      return "Premium"
    case 3:
      return "Outdoor"
    default:
      return "Unknown"
  }
}