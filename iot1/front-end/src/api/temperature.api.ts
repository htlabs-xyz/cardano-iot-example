
import { ApiResponse } from "@/data/type/response.type";
import http from "@/lib/http";
import { Temperature, TemperaturesByDevice } from "../data/type/temperature.type";

const temperatureApiRequest = {
    getTemperatureByDevice: (device_address: string) => http.get<ApiResponse<TemperaturesByDevice>>(`/temperature-sensor/${device_address}`),
    getBaseTemperature: () => http.get<ApiResponse<Temperature>>(`/temperature-sensor/base`),
};

export default temperatureApiRequest;