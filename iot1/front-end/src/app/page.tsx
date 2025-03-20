"use client";

import React, { useState, useEffect } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Wifi, Battery, Clock, MapPin, Server, ExternalLink, CalendarIcon } from "lucide-react";
import { copyToClipboard, formatDate, formatTime, generateSensorData, getBatteryStatusColor, getDeviceTypeName, getSignalStatusColor, getStatusColor, getTemperatureStatusText, truncateText } from "../lib/utils";
import { ChartIcon, TempIcon } from "../components/icon";
import deviceApiRequest from "../api/device.api";
import { toast } from "sonner";
import { Device } from "../data/type/device.type";
import temperatureApiRequest from "../api/temperature.api";
import { TemperaturesByDevice } from "../data/type/temperature.type";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component

type TimePeriod = "hourly" | "daily" | "weekly" | "yearly";

export default function TemperatureChart() {
  const [selectedSensor, setSelectedSensor] = useState<Device | undefined>(undefined);
  const [temperatureData, setTemperatureData] = useState<TemperaturesByDevice | undefined>(undefined);
  const [sensorDevices, setSensorDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState({
    todayTemp: 0,
    weeklyAvg: 0,
    monthlyAvg: 0,
  });
  const [chartData, setChartData] = useState<
    Array<{
      time: string;
      temperature: number;
      url: string;
      timestamp: string;
      threshold: number;
      txRef: string;
    }>
  >([]);
  const [yDomain, setYDomain] = useState([0, 40]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true); // Loading state for devices
  const [isLoadingData, setIsLoadingData] = useState(false); // Loading state for temperature data

  // Fetch sensor devices on mount
  useEffect(() => {
    const fetchDevices = async () => {
      setIsLoadingDevices(true);
      try {
        const response = await deviceApiRequest.getList();
        const devices = response.data ?? [];
        setSensorDevices(devices);
        if (devices.length > 0 && !selectedSensor) {
          setSelectedSensor(devices[0]); // Set default sensor
        }
        if (devices.length === 0) {
          toast("Error fetching data", {
            description: "Cannot get devices info",
            action: {
              label: "Retry",
              onClick: () => fetchDevices(),
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch devices:", error);
        toast("Error", { description: "Failed to load sensor devices" });
      } finally {
        setIsLoadingDevices(false);
      }
    };
    fetchDevices();
  }, []); // Empty dependency array: runs once on mount

  useEffect(() => {
    if (!sensorDevices.length || !selectedSensor) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const sensor = sensorDevices.find((s) => s.device_address === selectedSensor.device_address) || sensorDevices[0];
        const dataApi = await temperatureApiRequest.getTemperatureByDevice(sensor.device_address);
        if (!dataApi || !dataApi.data) {
          toast("Error", { description: "No temperature data available" });
          return;
        }

        const tempData = dataApi.data;
        setTemperatureData(tempData);

        // Generate data for this sensor
        const { hourlyData, dailyData, weeklyData, yearlyData } = generateSensorData(tempData);

        let data = tempData.temperatures.map(x => ({
          time: x.time?.toString() ?? "",
          temperature: x.value ?? 0,
          url: x.tx_ref,
          timestamp: x.time?.toString() ?? "",
          threshold: tempData.device_info?.device_threshold,
          txRef: x.tx_ref
        }));
        setChartData(data);

        // Find min and max temperatures for y-axis domain
        const minTemp = Math.min(...data.map((d) => d.temperature)) - 5;
        const maxTemp = Math.max(...data.map((d) => d.temperature)) + 5;
        setYDomain([minTemp, maxTemp]);

        // Calculate statistics
        const todayTemp = dailyData[dailyData.length - 1]?.temperature || 0;
        const weeklyAvg = dailyData.length
          ? Math.round(dailyData.reduce((sum, item) => sum + item.temperature, 0) / dailyData.length)
          : 0;
        const monthlyAvg = yearlyData[new Date().getMonth()]?.temperature || 0;

        setStats({ todayTemp, weeklyAvg, monthlyAvg });
      } catch (error) {
        console.error("Failed to fetch temperature data:", error);
        toast("Error", { description: "Failed to load temperature data" });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [sensorDevices, selectedSensor]); // Include all dependencies



  const handleSelectSensor = (value: string) => {
    const sensor = sensorDevices.find((x) => x.device_id === value);
    setSelectedSensor(sensor);
  };

  // Render loading state if no devices are loaded yet
  if (isLoadingDevices) {
    return (
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
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Sensor Selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Temperature Monitoring</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={selectedSensor?.device_id} onValueChange={handleSelectSensor}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select sensor device" />
            </SelectTrigger>
            <SelectContent>
              {sensorDevices.map((sensor) => (
                <SelectItem key={sensor.device_id} value={sensor.device_id}>
                  {sensor.device_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Device Information */}
      <Card className="w-full">
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
                Type: {getDeviceTypeName(selectedSensor?.device_type ?? 0)} v{selectedSensor?.device_version || "N/A"}
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

      {/* Stat Boxes */}
      {isLoadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex flex-col space-y-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title={`${selectedSensor?.device_name || "Sensor"} - Current`}
            value={`${stats.todayTemp}°C`}
            description="Current reading"
            statusColor={getStatusColor(stats.todayTemp, selectedSensor?.device_threshold ?? 0)}
            icon={<TempIcon className="h-4 w-4" />}
          />
          <StatCard
            title={`${selectedSensor?.device_name || "Sensor"} - Weekly Avg`}
            value={`${stats.weeklyAvg}°C`}
            description="Last 7 days"
            statusColor={getStatusColor(stats.weeklyAvg, selectedSensor?.device_threshold ?? 0)}
            icon={<ChartIcon className="h-4 w-4" />}
          />
          <StatCard
            title={`${selectedSensor?.device_name || "Sensor"} - Monthly Avg`}
            value={`${stats.monthlyAvg}°C`}
            description="Current month"
            statusColor={getStatusColor(stats.monthlyAvg, selectedSensor?.device_threshold ?? 0)}
            icon={<CalendarIcon className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Chart and Table */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        {isLoadingData ? (
          <Card className="w-full lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedSensor?.device_name || "Temperature Chart"}</CardTitle>
                  <CardDescription>Temperature variations over time</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  temperature: {
                    label: "Temperature (°C)",
                    color: "#38bdf8",
                  },
                }}
                className="h-[300px] w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
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
                  <ReferenceLine
                    y={selectedSensor?.device_threshold}
                    stroke="#ef4444"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    label={{
                      value: "THRESHOLD",
                      position: "right",
                      fill: "#ef4444",
                      fontSize: 14,
                      fontWeight: "bold",
                    }}
                  />
                  <Line
                    type="linear"
                    dataKey="temperature"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ fill: "#38bdf8", stroke: "#38bdf8", strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: "#ffffff", stroke: "#38bdf8", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#38bdf8] mr-2"></div>
                  <span className="text-sm">{selectedSensor?.device_name || "Sensor"} Temperature</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-3 bg-[#ef4444] mr-2"></div>
                  <span className="font-semibold text-[#ef4444]">
                    TEMPERATURE THRESHOLD: {selectedSensor?.device_threshold ?? 0}°C
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Temperature Data Table */}
        {isLoadingData ? (
          <Card className="w-full lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="p-0">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full lg:col-span-1">
            <CardHeader>
              <CardTitle>Temperature Data</CardTitle>
              <CardDescription>Access historical readings</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[300px]">
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-y-auto h-[300px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                          <TableHead className="w-[90px]">Date</TableHead>
                          <TableHead className="w-[90px]">Time</TableHead>
                          <TableHead className="w-[70px]">Temp</TableHead>
                          <TableHead className="w-[80px]">Status</TableHead>
                          <TableHead>tx_ref</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chartData.map((reading, index) => (
                          <TableRow key={index}>
                            <TableCell className="whitespace-nowrap">{formatDate(reading.timestamp)}</TableCell>
                            <TableCell className="whitespace-nowrap">{formatTime(reading.timestamp)}</TableCell>
                            <TableCell className={getStatusColor(reading.temperature, reading.threshold)}>
                              {reading.temperature}°C
                            </TableCell>
                            <TableCell>{getTemperatureStatusText(reading.temperature, reading.threshold)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <a
                                  href={reading.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline flex items-center"
                                  title="Open data URL"
                                >
                                  {truncateText(reading.txRef, 6, 6)}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(reading.txRef)}
                                  title="Copy tx_ref"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span className="sr-only">Copy tx_ref</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  description,
  statusColor,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  statusColor: string;
  icon: React.ReactNode;
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
  );
}