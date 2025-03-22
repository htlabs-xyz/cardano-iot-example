import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, Clock, Copy, MapPin, Server } from 'lucide-react';
import { copyToClipboard, getBatteryStatusColor, truncateText } from '../lib/utils';
import { Button } from './ui/button';
import { Device } from '../types/device.type';
import { Skeleton } from './ui/skeleton';

export default function DeviceInfo({ selectedSensor, isLoading }: { selectedSensor: Device | undefined, isLoading: boolean }) {
    return (
        isLoading ? (
            <div className="space-y-6 w-full">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-10 w-full sm:w-1/3" />
                <Card className="w-full">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        ) : (
            <Card className="w-full" >
                <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {selectedSensor?.device_name || "No Sensor Selected"}
                                <Badge variant={selectedSensor?.device_battery ?? 100 > 30 ? "default" : "destructive"}>
                                    {selectedSensor?.device_battery ?? 100 > 30 ? "Active" : "Low Battery"}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {selectedSensor?.device_location || "N/A"}
                            </CardDescription>
                        </div>
                        <div className="mt-2 sm:mt-0">
                            <Badge variant="outline" className="mr-2">
                                ID: {selectedSensor?.device_id || "N/A"}
                            </Badge>
                            <Badge variant="outline">
                                Type: {selectedSensor?.device_type ?? 0} v{selectedSensor?.device_version || "N/A"}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Server className="h-3 w-3" /> Device Address
                            </span>
                            <span className="font-medium flex items-center gap-2">
                                {truncateText(selectedSensor?.device_address ?? "", 8, 8)}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => copyToClipboard(selectedSensor?.device_address ?? "")}
                                    title="Copy device address"
                                >
                                    <Copy className="h-3 w-3" />
                                    <span className="sr-only">Copy address</span>
                                </Button>
                            </span>
                            <span className="text-xs text-muted-foreground">IP: {selectedSensor?.device_ip || "N/A"}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Sampling Rate
                            </span>
                            <span className="font-medium">{selectedSensor?.device_sampling_rate || 0} min</span>
                            <span className="text-xs text-muted-foreground">Data collection interval</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Battery className="h-3 w-3" /> Battery Level
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getBatteryStatusColor(selectedSensor?.device_battery ?? 100)}`}
                                        style={{ width: `${selectedSensor?.device_battery ?? 0}%` }}
                                    ></div>
                                </div>
                                <span className="font-medium">{selectedSensor?.device_battery ?? 0}%</span>
                            </div>
                        </div>
                        <div className="flex flex-col"></div>
                    </div>
                </CardContent>
            </Card>
        )

    )
}
