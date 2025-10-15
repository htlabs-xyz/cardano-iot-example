/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function assertApiResponse<T>(data: any): T {
  console.log("http data:", data);

  return data as T;
}
export const truncateText = (text: string, startChars = 6, endChars = 6) => {
  if (!text || text.length <= startChars + endChars) return text;
  return `${text.substring(0, startChars)}...${text.substring(
    text.length - endChars
  )}`;
};
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  // In a real app, you would show a toast notification here
};

export function newUserId(): string {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const MM = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");
  const HH = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const ss = now.getSeconds().toString().padStart(2, "0");

  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

export function formatDate(input: Date | string, useUTC = false): string {
  const d = input instanceof Date ? input : new Date(input);
  const getY = useUTC ? d.getUTCFullYear() : d.getFullYear();
  const getM = (useUTC ? d.getUTCMonth() : d.getMonth()) + 1;
  const getD = useUTC ? d.getUTCDate() : d.getDate();

  const MM = getM.toString().padStart(2, "0");
  const dd = getD.toString().padStart(2, "0");
  const yyyy = getY.toString();

  return `${MM}/${dd}/${yyyy}`;
}
