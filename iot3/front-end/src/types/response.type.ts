import { Device } from "./device.type";
import { Product } from "./product.type";

export type ApiResponse<T> = {
    status: boolean;
    statusCode: number;
    path: string;
    message: string;
    data?: T;
    timestamp: string;
}


export interface DeviceDetails extends Device {
    products?: Product[]
}