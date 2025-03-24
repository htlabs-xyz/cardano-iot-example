"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useEffect, useState } from "react";

import { toast } from "sonner";
import deviceApiRequest from "../api/device.api";
import temperatureApiRequest from "../api/temperature.api";
import DeviceInfo from "../components/device-info";
import TemperatureData from "../components/temperature-data";
import { socket, WebsocketProvider } from "../context/websocket.context";
import { Device } from "../types/device.type";
import { TemperatureChartData } from "../types/temperature.type";


export default function Page() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [sensorDevices, setSensorDevices] = useState<Device[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Device | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [temperatureData, setTemperatureData] = useState<(TemperatureChartData)[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setIsLoadingDevices(true);
        const response = await deviceApiRequest.getList();
        const devices = response.data ?? [];
        setSensorDevices(devices);
        if (devices.length > 0 && !selectedSensor) {
          setSelectedSensor(devices[0]); // Set default sensor
        }
        if (devices.length === 0) { throw new Error(); }
      } catch {
        toast("Error fetching data", {
          description: "Cannot get devices info",
          action: {
            label: "Retry",
            onClick: () => fetchDevices(),
          },
        });
      } finally { setIsLoadingDevices(false); }
    };
    fetchDevices();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sensorDevices.length || !selectedSensor) return;
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const sensor = sensorDevices.find((s) => s.device_address === selectedSensor.device_address) || sensorDevices[0];
        const dataApi = await temperatureApiRequest.getTemperatureByDevice(sensor.device_address);
        if (!dataApi || !dataApi.data) throw new Error();
        const processedData = dataApi.data.temperatures.map((item, index) => {
          if (!item.time || !item.value) return null;
          const date = new Date(item.time)
          const chartItemData: TemperatureChartData = {
            ...item,
            id: index,
            formattedDate: format(date, "MM/dd/yyyy"),
            formattedTime: format(date, "h:mm:ss a"),
            formattedValue: item.value.toLocaleString(),
          };
          return chartItemData;
        })
        const realData = processedData.filter(x => x != null)
        if (realData) setTemperatureData(realData);

      } catch (error) {
        console.error("Failed to fetch temperature data:", error);
        toast("Error", { description: "Failed to load temperature data" });
      }
      finally { setIsLoadingData(false); }
    }
    fetchData()
  }, [sensorDevices, selectedSensor])

  const handleSelectSensor = (value: string) => {
    const sensor = sensorDevices.find((x) => x.device_id === value);
    setSelectedSensor(sensor);
  };

  return (
    <div className="w-full space-y-4">
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
      <DeviceInfo selectedSensor={selectedSensor} isLoading={isLoadingDevices} />

      <WebsocketProvider value={socket}>
        <TemperatureData
          temperatureData={temperatureData}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          isLoading={isLoadingData} />
      </WebsocketProvider>

      <div className="text-sm text-muted-foreground">
        <p>
          Note: The chart displays temperature values over time using a logarithmic scale to better visualize the wide
          range of values.
        </p>
        <p>Hover over data points to see detailed information or use the table to view and copy transaction links.</p>
      </div>
    </div>
  )
}

