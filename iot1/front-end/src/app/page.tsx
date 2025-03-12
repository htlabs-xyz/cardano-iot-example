"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Helper function to get deterministic "random" numbers
function seededRandom(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

// Create a seeded random generator
const random = seededRandom(42)

// Mock data for different time periods with deterministic values
const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  temperature: Math.round(20 + 5 * Math.sin((i / 24) * Math.PI * 2) + random() * 2),
}))

const dailyData = Array.from({ length: 7 }, (_, i) => {
  const day = new Date()
  day.setDate(day.getDate() - 6 + i)
  return {
    time: day.toLocaleDateString("en-US", { weekday: "short" }),
    temperature: Math.round(22 + 3 * Math.sin((i / 7) * Math.PI * 2) + random() * 3),
  }
})

const weeklyData = Array.from({ length: 4 }, (_, i) => ({
  time: `Week ${i + 1}`,
  temperature: Math.round(21 + 4 * Math.sin((i / 4) * Math.PI * 2) + random() * 2),
}))

const yearlyData = Array.from({ length: 12 }, (_, i) => ({
  time: new Date(0, i).toLocaleDateString("en-US", { month: "short" }),
  temperature: Math.round(15 + 10 * Math.sin((i / 12) * Math.PI * 2) + random() * 3),
}))

type TimePeriod = "hourly" | "daily" | "weekly" | "yearly"

export default function TemperatureChart() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily")
  const [stats, setStats] = useState({
    todayTemp: 0,
    weeklyAvg: 0,
    monthlyAvg: 0,
  })
  const [chartData, setChartData] = useState(dailyData)
  const [yDomain, setYDomain] = useState([0, 40])

  // Safe temperature threshold
  const safeTemperature = 25

  // Update data when time period changes
  useEffect(() => {
    // Select data based on time period
    let data
    switch (timePeriod) {
      case "hourly":
        data = hourlyData
        break
      case "daily":
        data = dailyData
        break
      case "weekly":
        data = weeklyData
        break
      case "yearly":
        data = yearlyData
        break
      default:
        data = dailyData
    }

    setChartData(data)

    // Find min and max temperatures for y-axis domain
    const minTemp = Math.min(...data.map((d) => d.temperature)) - 5
    const maxTemp = Math.max(...data.map((d) => d.temperature)) + 5
    setYDomain([minTemp, maxTemp])

    // Calculate statistics for the stat boxes
    const todayTemp = dailyData[dailyData.length - 1].temperature
    const weeklyAvg = Math.round(dailyData.reduce((sum, item) => sum + item.temperature, 0) / dailyData.length)
    const monthlyAvg = Math.round(yearlyData[new Date().getMonth()].temperature)

    setStats({
      todayTemp,
      weeklyAvg,
      monthlyAvg,
    })
  }, [timePeriod])

  // Determine status based on temperature
  const getStatusColor = (temp: number) => {
    if (temp > safeTemperature) return "text-red-500"
    if (temp > safeTemperature - 5) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <div className="space-y-6 w-full py-10">
      {/* Stat Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Today's Temperature"
          value={`${stats.todayTemp}°C`}
          description="Current reading"
          statusColor={getStatusColor(stats.todayTemp)}
          icon={<TempIcon className="h-4 w-4" />}
        />
        <StatCard
          title="Weekly Average"
          value={`${stats.weeklyAvg}°C`}
          description="Last 7 days"
          statusColor={getStatusColor(stats.weeklyAvg)}
          icon={<ChartIcon className="h-4 w-4" />}
        />
        <StatCard
          title="Monthly Average"
          value={`${stats.monthlyAvg}°C`}
          description="Current month"
          statusColor={getStatusColor(stats.monthlyAvg)}
          icon={<CalendarIcon className="h-4 w-4" />}
        />
      </div>

      {/* Main Chart */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Temperature Monitoring</CardTitle>
              <CardDescription>Track temperature variations over time</CardDescription>
            </div>
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">By Hours</SelectItem>
                <SelectItem value="daily">By Days</SelectItem>
                <SelectItem value="weekly">By Weeks</SelectItem>
                <SelectItem value="yearly">By Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              temperature: {
                label: "Temperature (°C)",
                color: "#38bdf8", // Bright blue for better visibility on slate
              },
            }}
            className="h-[300px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} stroke="rgba(255,255,255,0.5)" />
              <YAxis
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickCount={6}
                stroke="rgba(255,255,255,0.5)"
                label={{
                  value: "Temperature (°C)",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "rgba(255,255,255,0.7)" },
                }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />

              {/* Safe temperature reference line - made more visible for slate theme */}
              <ReferenceLine
                y={safeTemperature}
                stroke="#ef4444" // Bright red for better visibility
                strokeWidth={3}
                strokeDasharray="8 4"
                label={{
                  value: "SAFE LIMIT",
                  position: "right",
                  fill: "#ef4444",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              />

              <Line
                type="linear"
                dataKey="temperature"
                stroke="#38bdf8" // Bright blue for better visibility
                strokeWidth={3}
                dot={{ fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, r: 4 }}
                activeDot={{ fill: "#ffffff", stroke: "#38bdf8", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ChartContainer>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[#38bdf8] mr-2"></div>
              <span className="text-sm">Temperature</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-3 bg-[#ef4444] mr-2"></div>
              <span className="font-semibold text-[#ef4444]">SAFE TEMPERATURE THRESHOLD: {safeTemperature}°C</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  description,
  statusColor,
  icon,
}: {
  title: string
  value: string
  description: string
  statusColor: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className={`text-2xl font-bold ${statusColor}`}>{value}</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
          <div className="p-2 bg-muted rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// Icons
function TempIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  )
}

function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

