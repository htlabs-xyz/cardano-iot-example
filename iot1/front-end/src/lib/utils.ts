import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Temperature, TemperaturesByDevice, TemperatureUnit } from "../data/type/temperature.type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


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

interface DataPoint {
  time: string;
  temperature: number;
  url: string;
  timestamp: string;
  threshold: number;
  txRef: string;
}

export function generateSensorData(temperaturesByDevice: TemperaturesByDevice) {
  const deviceId = temperaturesByDevice.device_info?.device_id || "DEVICE123";
  const threshold = temperaturesByDevice.device_info?.device_threshold || 25;
  const temperatures = temperaturesByDevice.temperatures || [];

  const generateTxRef = (timestamp: Date) =>
    `TX${deviceId.replace(/\s+/g, "")}${timestamp.getTime().toString().slice(-8)}`;

  const categorizeData = (temps: Temperature[]) => {
    const hourlyData: DataPoint[] = [];
    const dailyDataMap: { [key: string]: number[] } = {};
    const weeklyDataMap: { [key: string]: number[] } = {};
    const yearlyDataMap: { [key: string]: number[] } = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    temps.forEach(temp => {
      const timestamp = temp.time ? new Date(temp.time) : new Date();
      const value = temp.value ?? 0;
      const txRef = temp.tx_ref || generateTxRef(timestamp);

      const baseData = {
        temperature: value,
        url: txRef,
        timestamp: timestamp.toISOString(),
        threshold: threshold,
        txRef: txRef,
      };

      // Hourly: List all entries for today
      const isToday =
        timestamp.getFullYear() === today.getFullYear() &&
        timestamp.getMonth() === today.getMonth() &&
        timestamp.getDate() === today.getDate();
      if (isToday) {
        const hour = timestamp.getHours().toString().padStart(2, '0');
        const minute = timestamp.getMinutes().toString().padStart(2, '0');
        hourlyData.push({
          ...baseData,
          time: `${hour}:${minute}`,
        });
      }

      // Daily: Group by date
      const dateKey = timestamp.toLocaleDateString("en-US", { weekday: "short" });
      if (!dailyDataMap[dateKey]) dailyDataMap[dateKey] = [];
      dailyDataMap[dateKey].push(value);

      // Weekly: Group by week number
      const weekNumber = getWeekNumber(timestamp);
      const weekKey = `Week ${weekNumber}`;
      if (!weeklyDataMap[weekKey]) weeklyDataMap[weekKey] = [];
      weeklyDataMap[weekKey].push(value);

      // Yearly: Group by month
      const monthKey = timestamp.toLocaleDateString("en-US", { month: "short" });
      if (!yearlyDataMap[monthKey]) yearlyDataMap[monthKey] = [];
      yearlyDataMap[monthKey].push(value);
    });

    // Calculate averages and create DataPoints
    const dailyData: DataPoint[] = Object.keys(dailyDataMap).map(time => ({
      time,
      temperature: average(dailyDataMap[time]),
      url: generateTxRef(new Date()), // Placeholder; could use a representative timestamp
      timestamp: new Date().toISOString(), // Placeholder; adjust as needed
      threshold,
      txRef: generateTxRef(new Date()), // Placeholder
    }));

    const weeklyData: DataPoint[] = Object.keys(weeklyDataMap).map(time => ({
      time,
      temperature: average(weeklyDataMap[time]),
      url: generateTxRef(new Date()),
      timestamp: new Date().toISOString(),
      threshold,
      txRef: generateTxRef(new Date()),
    }));

    const yearlyData: DataPoint[] = Object.keys(yearlyDataMap).map(time => ({
      time,
      temperature: average(yearlyDataMap[time]),
      url: generateTxRef(new Date()),
      timestamp: new Date().toISOString(),
      threshold,
      txRef: generateTxRef(new Date()),
    }));

    return { hourlyData, dailyData, weeklyData, yearlyData };
  };

  const average = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return Number((sum / arr.length).toFixed(2));
  };

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  return categorizeData(temperatures);
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