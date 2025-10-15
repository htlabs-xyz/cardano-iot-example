import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function assertApiResponse<T>(data: any): T {
  console.log("http data:", data)

  return data as T;
}
export const truncateText = (text: string, startChars = 6, endChars = 6) => {
  if (!text || text.length <= startChars + endChars) return text
  return `${text.substring(0, startChars)}...${text.substring(text.length - endChars)}`
}
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  // In a real app, you would show a toast notification here
}