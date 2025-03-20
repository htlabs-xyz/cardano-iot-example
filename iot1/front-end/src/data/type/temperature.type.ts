import { Device } from "./device.type";

export type Temperature = {
    device_address?: string;
    value?: number;
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