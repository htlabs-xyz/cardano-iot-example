"use client"

import { format } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import { WebsocketContext } from '../context/websocket.context';
import { Temperature, TemperatureChartData } from '../types/temperature.type';
import TemperatureChart from './temperature-chart';
import TemperatureTable from './temperature-table';

interface TemperatureDataProps {
    temperatureData: TemperatureChartData[],
    selectedRow: number | null,
    setSelectedRow: (selectedRow: number | null) => void,
    isLoading?: boolean
}
export default function TemperatureData(props: TemperatureDataProps) {
    const { temperatureData = [], selectedRow, setSelectedRow, isLoading = false } = props;
    const [chartData, setChatData] = useState<TemperatureChartData[]>([]);
    const socketClient = useContext(WebsocketContext);

    useEffect(() => {
        socketClient.on('onUpdatedTemperature', (req: Temperature) => {
            console.log('new temperature received; ', req);
            if (req.time && req.temperature !== undefined && req.humidity !== undefined) {
                const date = new Date(req.time);
                const maxId = chartData[chartData?.length - 1]?.id + 1;
                const chartItemData: TemperatureChartData = {
                    ...req,
                    id: maxId + 1,
                    formattedDate: format(date, "MM/dd/yyyy"),
                    formattedTime: format(date, "h:mm:ss a"),
                    formattedTemperature: req.temperature.toLocaleString(),
                    formattedHumidity: req.humidity.toLocaleString(),
                };
                setChatData((prev: any) => [...prev, chartItemData]);
            }

        });
        return () => {
            console.log('Unregistering Events...');
            socketClient.off('onUpdatedTemperature');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (temperatureData && temperatureData != null) setChatData(temperatureData);
    }, [temperatureData])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Chart */}
            <TemperatureChart
                chartData={chartData}
                setSelectedRow={setSelectedRow}
                isLoading={isLoading} />

            {/* Table */}
            <TemperatureTable
                temperatureData={chartData}
                selectedRow={selectedRow}
                setSelectedRow={setSelectedRow}
                isLoading={isLoading} />
        </div>
    )
}
