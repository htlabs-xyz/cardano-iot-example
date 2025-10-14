"use client"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import TemperateDetailsTooltip from "./temperature-details-tooltip"
import type { TemperatureChartData } from "../types/temperature.type"
import { format } from "date-fns"

interface TemperatureChartProps {
    chartData: TemperatureChartData[]
    setSelectedRow: (selectedRow: number | null) => void
    isLoading?: boolean,
    className?: string
}

export default function TemperatureChart(props: TemperatureChartProps) {
    const { chartData = [], setSelectedRow, isLoading = false, className } = props

    return isLoading ? (
        <Card className={`h-[500px] w-full border rounded-lg p-4 bg-card ${className}`}>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[400px] w-full" />
            </CardContent>
        </Card>
    ) : (
        <div className={`h-[500px] w-full border rounded-lg p-4 bg-card ${className}`}>
            {chartData && (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 60, left: 20, bottom: 0 }}
                        onMouseMove={(data) => {
                            if (data && data.activeTooltipIndex !== undefined) {
                                setSelectedRow(data.activeTooltipIndex)
                            }
                        }}
                        onMouseLeave={() => setSelectedRow(null)}
                    >
                        <defs>
                            <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            tickFormatter={(time) => format(new Date(time), "MM/dd")}
                            label={{ value: "Date", position: "insideBottomRight", offset: -10 }}
                        />
                        <YAxis
                            yAxisId="temperature"
                            orientation="left"
                            domain={["dataMin - 5", "dataMax + 5"]}
                            label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }}
                            tickFormatter={(value) => `${value}°C`}
                        />
                        <YAxis
                            yAxisId="humidity"
                            orientation="right"
                            domain={[0, 100]}
                            label={{ value: "Humidity (%)", angle: 90, position: "insideRight" }}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            content={<TemperateDetailsTooltip />}
                            cursor={{ stroke: "#f0f0f0", strokeWidth: 1, strokeDasharray: "5 5" }}
                            wrapperStyle={{ outline: "none" }}
                            isAnimationActive={true}
                        />
                        <Area
                            yAxisId="temperature"
                            type="monotone"
                            dataKey="temperature"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTemperature)"
                            dot={{
                                r: 4,
                                fill: "#ef4444",
                                stroke: "#ffffff",
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 6,
                                fill: "#ef4444",
                                stroke: "#ffffff",
                                strokeWidth: 2,
                            }}
                        />
                        <Area
                            yAxisId="humidity"
                            type="monotone"
                            dataKey="humidity"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={0.6}
                            fill="url(#colorHumidity)"
                            dot={{
                                r: 4,
                                fill: "#3b82f6",
                                stroke: "#ffffff",
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 6,
                                fill: "#3b82f6",
                                stroke: "#ffffff",
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
