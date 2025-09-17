import { Device } from "./device.type";

export interface Temperature {
    device_address?: string;
    temperature?: number;
    humidity?: number;
    unit?: TemperatureUnit;
    time?: Date;
    tx_ref: string;
}

export type TemperaturesByDevice = {
    device_info: Device | null;
    temperatures: Temperature[]
}

export enum TemperatureUnit {
    CELSIUS = 0,
    FAHRENHEIT = 1,
    KELVIN = 2,
}

export interface TemperatureChartData extends Temperature {
    id: number;
    formattedDate: string;
    formattedTime: string;
    formattedTemperature: string;
    formattedHumidity: string;
}