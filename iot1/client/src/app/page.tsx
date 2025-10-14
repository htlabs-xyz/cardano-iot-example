"use client"

import { format } from "date-fns";
import { useEffect, useState } from "react";

import TemperatureChart from "@/components/temperature-chart";
import TemperatureTable from "@/components/temperature-table";
import { toast } from "sonner";
import temperatureApiRequest from "../api/temperature.api";
import { TemperatureChartData } from "../types/temperature.type";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Page() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [temperatureData, setTemperatureData] = useState<(TemperatureChartData)[]>([]);

  useEffect(() => {

    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      const dataApi = await temperatureApiRequest.getAllTemperature();
      console.log("Fetched temperature data:", dataApi);
      if (!dataApi || !dataApi.data) throw new Error();
      const processedData = dataApi.data.map((item, index) => {
        if (!item.time || !item.temperature || !item.humidity) return null;
        const date = new Date(item.time)
        const chartItemData: TemperatureChartData = {
          ...item,
          id: index,
          formattedDate: format(date, "MM/dd/yyyy"),
          formattedTime: format(date, "h:mm:ss a"),
          formattedTemperature: item.temperature.toLocaleString(),
          formattedHumidity: item.humidity.toLocaleString(),
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

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Temperature Monitoring</h2>
        <Button
          onClick={fetchData}
          disabled={isLoadingData}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-transparent"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingData ? "animate-spin" : ""}`} />
          {isLoadingData ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Chart */}
        <TemperatureChart
          chartData={temperatureData}
          setSelectedRow={setSelectedRow}
          isLoading={isLoadingData} />

        {/* Table */}
        <TemperatureTable
          temperatureData={temperatureData}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          isLoading={isLoadingData} />
      </div>

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

