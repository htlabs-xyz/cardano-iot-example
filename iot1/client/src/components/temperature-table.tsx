import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from './ui/button'
import { Copy } from 'lucide-react'
import { copyToClipboard } from '../lib/utils';
import { TemperatureChartData } from '../types/temperature.type';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface TemperatureTableProps {
    temperatureData: (TemperatureChartData | null)[] | undefined,
    selectedRow: number | null,
    setSelectedRow: (selectedRow: number | null) => void,
    isLoading?: boolean,
    className?: string
}
export default function TemperatureTable(props: TemperatureTableProps) {
    const { temperatureData = null, selectedRow, setSelectedRow, isLoading = false, className } = props;
    return (
        isLoading ? (
            <Card className={`border rounded-lg bg-card h-[500px] overflow-hidden flex flex-col ${className}`}>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent className="p-0">
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        ) : (
            <div className={`border rounded-lg bg-card h-[500px] overflow-hidden flex flex-col ${className}`}>
                <div className="p-2 border-b bg-muted/50">
                    <h3 className="font-medium">Temperature Records</h3 >
                </div >
                <div className="overflow-auto flex-1">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card z-10">
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Temperature</TableHead>
                                <TableHead>Humidity</TableHead>
                                <TableHead>Transaction</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {temperatureData && temperatureData.map((item, index) => (
                                item && <TableRow
                                    key={index}
                                    className={selectedRow === index ? "bg-muted" : ""}
                                    onMouseEnter={() => setSelectedRow(index)}
                                    onMouseLeave={() => setSelectedRow(null)}
                                >
                                    <TableCell>{item.formattedDate}</TableCell>
                                    <TableCell>{item.formattedTime}</TableCell>
                                    {item.temperature && <TableCell>
                                        <span className="font-medium">
                                            {item.temperature >= 1000000
                                                ? `${(item.temperature / 1000000).toFixed(2)}M`
                                                : item.temperature >= 1000
                                                    ? `${(item.temperature / 1000).toFixed(2)}K`
                                                    : item.temperature.toLocaleString()}
                                        </span>
                                    </TableCell>}
                                    {item.humidity && <TableCell>
                                        <span className="font-medium">
                                            {item.humidity >= 1000000
                                                ? `${(item.humidity / 1000000).toFixed(2)}M`
                                                : item.humidity >= 1000
                                                    ? `${(item.humidity / 1000).toFixed(2)}K`
                                                    : item.humidity.toLocaleString()}
                                        </span>
                                    </TableCell>}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={item.tx_ref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline truncate max-w-[100px] inline-block"
                                            >
                                                {item.tx_ref.split("/").pop()?.substring(0, 8)}...
                                            </a>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => copyToClipboard(item.tx_ref)}
                                            >
                                                <Copy className="h-3 w-3" />
                                                <span className="sr-only">Copy URL</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div >
        )
    )
}
