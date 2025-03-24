import React from 'react'
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import TemperateDetailsTooltip from './temperature-details-tooltip';
import { TemperatureChartData } from '../types/temperature.type';
import { format } from 'date-fns';

interface TemperatureChartProps {
    chartData: TemperatureChartData[],
    setSelectedRow: (selectedRow: number | null) => void,
    isLoading?: boolean
}
export default function TemperatureChart(props: TemperatureChartProps) {
    const { chartData = [], setSelectedRow, isLoading = false } = props;
    return (
        isLoading ? (
            <Card className="col-span-2 h-[500px] w-full border rounded-lg p-4 bg-card">
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                </CardContent>
            </Card>) : (
            <div className="col-span-2 h-[500px] w-full border rounded-lg p-4 bg-card">
                {chartData && <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        onMouseMove={(data) => {
                            if (data && data.activeTooltipIndex !== undefined) {
                                setSelectedRow(data.activeTooltipIndex)
                            }
                        }}
                        onMouseLeave={() => setSelectedRow(null)}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            tickFormatter={(time) => format(new Date(time), "MM/dd")}
                            label={{ value: "Date", position: "insideBottomRight", offset: -10 }}
                        />
                        <YAxis
                            scale="log"
                            domain={["auto", "auto"]}
                            label={{ value: "Value", angle: -90, position: "insideLeft" }}
                            tickFormatter={(value) =>
                                value >= 1000000
                                    ? `${(value / 1000000).toFixed(0)}M`
                                    : value >= 1000
                                        ? `${(value / 1000).toFixed(0)}K`
                                        : value
                            }
                        />
                        <Tooltip
                            content={<TemperateDetailsTooltip />}
                            cursor={{ stroke: "#f0f0f0", strokeWidth: 1, strokeDasharray: "5 5" }}
                            wrapperStyle={{ outline: "none" }}
                            isAnimationActive={true}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            dot={{
                                r: 4,
                                fill: "#10b981",
                                stroke: "#ffffff",
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 6,
                                fill: "#10b981",
                                stroke: "#ffffff",
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>}
            </div>)
    )
}
